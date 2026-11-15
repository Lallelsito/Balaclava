(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { pick, randInt } = Balaclava.Utils;

  // Dynamic rotating Market (5 Buy + 5 Sell rotating every 15 minutes), balanced prices & plots.
  class EconomySystem {
    constructor() {
      this.marketStock = [];
      this.sellContracts = [];
      this.refreshTimer = 0;
      this.refreshInterval = 900; // rotates every 15 minutes (900 seconds)
      this.refreshStock(1);
    }

    refreshStock(playerLevel = 1) {
      const seedsPool = ['semillas', 'semillas_zanahoria', 'semillas_calabaza', 'semillas_tomate', 'semillas_papa', 'semillas_fresa', 'cebo_gusano'];
      const matPool = ['madera', 'piedra', 'carbon', 'hierro', 'cobre', 'arena', 'arcilla', 'cuero', 'tablon', 'ladrillo', 'vidrio', 'tela'];
      const rarePool = ['oro', 'lingote_hierro', 'lingote_bronce', 'engrane', 'pocion_vida', 'pocion_velocidad', 'llave_mazmorra', 'fertilizante'];
      const epicPool = ['cristales', 'plata', 'platino', 'esmeraldas', 'diamantes', 'cristales_magicos', 'cebo_dorado'];
      const sellPool = ['madera', 'piedra', 'carbon', 'hierro', 'cobre', 'bayas', 'trigo', 'zanahoria', 'tomate', 'lana', 'carne', 'pez_comun', 'tablon', 'lingote_cobre', 'lingote_hierro', 'pan', 'huesos', 'cuero', 'harina'];

      const pickUnique = (pool, existing) => {
        const avail = pool.filter(id => Balaclava.ITEMS[id] && !existing.some(e => e.itemId === id));
        return avail.length ? pick(avail) : null;
      };

      const buyList = [];
      const addBuy = (id, multMin, multMax, sMin, sMax, maxCap = null) => {
        if (!id || buyList.length >= 5) return;
        const it = Balaclava.ITEMS[id];
        if (!it) return;
        const mult = multMin + Math.random() * (multMax - multMin);
        let price = Math.max(3, Math.round(it.buyValue * mult));
        if (maxCap) price = Math.min(maxCap, price);
        buyList.push({
          itemId: id,
          price,
          stock: randInt(sMin, sMax),
          discount: mult < 0.94 ? Math.round((1 - mult) * 100) : 0
        });
      };

      // Strictly max 5 balanced Buy offers per 15m cycle
      addBuy(pickUnique(seedsPool, buyList), 0.90, 1.10, 4, 8, 45);
      addBuy(pickUnique(matPool, buyList), 0.90, 1.08, 6, 12, 36);
      addBuy(pickUnique(matPool, buyList), 0.90, 1.08, 5, 10, 42);
      addBuy(pickUnique(rarePool, buyList), 0.88, 1.08, 2, 4, 140);
      addBuy(pickUnique(playerLevel >= 4 ? epicPool : rarePool, buyList), 0.86, 1.06, 1, 3, 240);

      // Strictly max 5 balanced Sell demand contracts per 15m cycle
      const sellList = [];
      for (let i = 0; i < 14 && sellList.length < 5; i++) {
        const id = pickUnique(sellPool, sellList);
        if (!id) continue;
        const it = Balaclava.ITEMS[id];
        const bonusMult = 1.15 + Math.random() * 0.25;
        const unitPrice = Math.max(2, Math.round(it.sellValue * bonusMult));
        sellList.push({
          itemId: id,
          price: unitPrice,
          demand: randInt(8, 20),
          bonusPct: Math.round((bonusMult - 1) * 100)
        });
      }

      this.marketStock = buyList.slice(0, 5);
      this.sellContracts = sellList.slice(0, 5);
      this.refreshTimer = this.refreshInterval;
    }

    sellMarketContract(game, idx, qty = 1) {
      const c = this.sellContracts && this.sellContracts[idx];
      if (!c || c.demand <= 0) return false;
      const item = Balaclava.ITEMS[c.itemId];
      if (!item) return false;
      const owned = game.inventory[c.itemId] || 0;
      const count = Math.min(owned, c.demand, qty);
      if (count <= 0) return false;
      const mult = this.getSellMultiplier(game);
      const unit = Math.max(1, Math.round(c.price * mult));
      const total = unit * count;
      game.removeItem(c.itemId, count);
      c.demand -= count;
      game.addCoins(total);
      Balaclava.Audio.play('coin');
      game.toast(`Vendido ${count}x ${item.name} por +${total} monedas`, 'success');
      return true;
    }

    update(dt, game) {
      this.refreshTimer -= dt;
      if (this.refreshTimer <= 0) {
        this.refreshStock(game.player.level);
        if (game.buildings.some(b => b.type === 'mercado')) {
          game.toast('El inventario del Mercado ha rotado con nuevas ofertas.', 'info');
        }
      }
    }

    getSellMultiplier(game) {
      let mult = 1.0 + (game.mods.sellBonus || 0);
      const treasuries = game.buildings.filter(b => b.type === 'tesoreria').length;
      mult += treasuries * 0.15;
      return mult;
    }

    getBuyPrice(game, basePrice) {
      const disc = game.mods.marketDiscount || 0;
      return Math.max(1, Math.round(basePrice * (1 - disc)));
    }

    sellItem(game, itemId, qty = 1) {
      const item = Balaclava.ITEMS[itemId];
      if (!item) return false;
      const owned = game.inventory[itemId] || 0;
      const count = Math.min(owned, qty);
      if (count <= 0) return false;

      const unitPrice = Math.max(1, Math.round(item.sellValue * this.getSellMultiplier(game)));
      const total = unitPrice * count;
      game.removeItem(itemId, count);
      game.addCoins(total);
      Balaclava.Audio.play('coin');
      game.toast(`Vendido ${count}x ${item.name} por +${total} monedas`, 'success');
      return true;
    }

    buyMarketItem(game, idx, qty = 1) {
      const offer = this.marketStock[idx];
      if (!offer || offer.stock <= 0) return false;
      const count = Math.min(qty, offer.stock);
      const unitCost = this.getBuyPrice(game, offer.price);
      const total = unitCost * count;
      if (game.coins < total) {
        game.toast(`Necesitas ${total} monedas.`, 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      game.coins -= total;
      offer.stock -= count;
      game.addItem(offer.itemId, count);
      Balaclava.Audio.play('coin');
      return true;
    }

    getPlotPrice(game, gx, gy) {
      const biome = game.world && game.world.plotBiomes && game.world.plotBiomes[gy] ? game.world.plotBiomes[gy][gx] : null;
      const ring = (game.world && typeof game.world.getPlotRing === 'function') ? game.world.getPlotRing(gx, gy) : null;
      const base = Balaclava.getPlotBasePrice(gx, gy, biome, ring);
      const ownedCount = Array.isArray(game.unlockedPlots) ? Math.max(1, game.unlockedPlots.length) : 1;
      const progMult = ownedCount <= 1 ? 1 : (1 + Math.min(0.65, (ownedCount - 1) * 0.015));
      const disc = game.mods.landDiscount || 0;
      return Math.max(10, Math.round(base * progMult * (1 - disc)));
    }

    getBiomeProgressionOrder(game) {
      const canonical = ['pradera', 'desierto', 'montanas_heladas', 'bosque_oscuro', 'tierras_volcanicas'];
      if (!game || !game.world || !Array.isArray(game.world.plotBiomes)) return canonical;
      const C = (Balaclava.CONST && Balaclava.CONST.CENTER_PLOT) || 4;
      const gridN = game.world.plotBiomes.length || 10;
      const stats = {};
      for (let gy = 0; gy < gridN; gy++) {
        for (let gx = 0; gx < gridN; gx++) {
          const b = game.world.plotBiomes[gy] && game.world.plotBiomes[gy][gx];
          if (!b) continue;
          if (!stats[b]) stats[b] = { sumR: 0, count: 0 };
          stats[b].sumR += Math.hypot(gx - C, gy - C);
          stats[b].count += 1;
        }
      }
      const present = Object.keys(stats);
      if (!present.length) return canonical;
      present.sort((a, b) => {
        if (a === 'pradera') return -1;
        if (b === 'pradera') return 1;
        const avgA = stats[a].sumR / Math.max(1, stats[a].count);
        const avgB = stats[b].sumR / Math.max(1, stats[b].count);
        if (Math.abs(avgA - avgB) > 0.05) return avgA - avgB;
        return canonical.indexOf(a) - canonical.indexOf(b);
      });
      return present;
    }

    getBiomeDungeons(game, biomeId) {
      const gates = Balaclava.DUNGEON_GATES || {};
      const defs = Balaclava.DUNGEON_DEFS || {};
      const list = [];
      const gatePlots = game && game.world && game.world.dungeonGatePlots;
      const plotBiomes = game && game.world && game.world.plotBiomes;
      if (gatePlots && plotBiomes) {
        for (const [dungId, coords] of Object.entries(gatePlots)) {
          if (!coords) continue;
          const b = plotBiomes[coords[1]] && plotBiomes[coords[1]][coords[0]];
          if (b === biomeId) {
            const g = gates[dungId] || defs[dungId] || { id: dungId, name: dungId };
            list.push({ id: dungId, name: g.name || dungId });
          }
        }
      } else {
        for (const [dungId, g] of Object.entries(gates)) {
          if (g && g.biome === biomeId) {
            list.push({ id: dungId, name: g.name || dungId });
          }
        }
      }
      return list;
    }

    getBiomeDungeonProgress(game, biomeId) {
      const list = this.getBiomeDungeons(game, biomeId);
      const cleared = Array.isArray(game && game.clearedDungeons) ? game.clearedDungeons : [];
      const done = list.filter(d => cleared.includes(d.id)).length;
      return {
        done,
        total: list.length,
        complete: list.length === 0 || done >= list.length,
        missingNames: list.filter(d => !cleared.includes(d.id)).map(d => d.name)
      };
    }

    getBiomeUnlockProgress(game, biomeId) {
      const biomesObj = (Balaclava.CONST && Balaclava.CONST.BIOMES) || {};
      const biomeName = (biomesObj[biomeId] && biomesObj[biomeId].name) || biomeId;
      const dungProg = this.getBiomeDungeonProgress(game, biomeId);
      if (!game || !game.world || !Array.isArray(game.world.plotBiomes)) {
        return {
          biomeId,
          biomeName,
          unlocked: 0,
          total: 0,
          islandsComplete: true,
          dungeonsDone: dungProg.done,
          dungeonsTotal: dungProg.total,
          dungeonsComplete: dungProg.complete,
          complete: dungProg.complete
        };
      }
      const gridN = game.world.plotBiomes.length || 10;
      let unlocked = 0;
      let total = 0;
      for (let gy = 0; gy < gridN; gy++) {
        for (let gx = 0; gx < gridN; gx++) {
          const b = game.world.plotBiomes[gy] && game.world.plotBiomes[gy][gx];
          if (b === biomeId) {
            total++;
            if (game.world.isPlotUnlocked(gx, gy)) unlocked++;
          }
        }
      }
      const islandsComplete = total === 0 || unlocked >= total;
      const dungeonsComplete = dungProg.complete;
      return {
        biomeId,
        biomeName,
        unlocked,
        total,
        islandsComplete,
        dungeonsDone: dungProg.done,
        dungeonsTotal: dungProg.total,
        dungeonsComplete,
        complete: islandsComplete && dungeonsComplete
      };
    }

    getBiomeLockStatus(game, gx, gy) {
      if (!game || !game.world || !Array.isArray(game.world.plotBiomes)) {
        return {
          lockedByBiome: false, blockingBiomeId: null, blockingBiomeName: null,
          unlocked: 0, total: 0, remaining: 0,
          dungeonsDone: 0, dungeonsTotal: 0, dungeonsRemaining: 0,
          missingIslands: false, missingDungeons: false
        };
      }
      const targetBiome = game.world.plotBiomes[gy] && game.world.plotBiomes[gy][gx];
      if (!targetBiome) {
        return {
          lockedByBiome: false, blockingBiomeId: null, blockingBiomeName: null,
          unlocked: 0, total: 0, remaining: 0,
          dungeonsDone: 0, dungeonsTotal: 0, dungeonsRemaining: 0,
          missingIslands: false, missingDungeons: false
        };
      }
      const order = this.getBiomeProgressionOrder(game);
      const targetIdx = order.indexOf(targetBiome);
      const targetProg = this.getBiomeUnlockProgress(game, targetBiome);
      if (targetIdx > 0) {
        for (let i = 0; i < targetIdx; i++) {
          const prevBiome = order[i];
          const prog = this.getBiomeUnlockProgress(game, prevBiome);
          if (!prog.complete) {
            return {
              lockedByBiome: true,
              targetBiomeId: targetBiome,
              blockingBiomeId: prevBiome,
              blockingBiomeName: prog.biomeName,
              unlocked: prog.unlocked,
              total: prog.total,
              remaining: Math.max(0, prog.total - prog.unlocked),
              dungeonsDone: prog.dungeonsDone,
              dungeonsTotal: prog.dungeonsTotal,
              dungeonsRemaining: Math.max(0, prog.dungeonsTotal - prog.dungeonsDone),
              missingIslands: !prog.islandsComplete,
              missingDungeons: !prog.dungeonsComplete
            };
          }
        }
      }
      return {
        lockedByBiome: false,
        targetBiomeId: targetBiome,
        blockingBiomeId: null,
        blockingBiomeName: null,
        unlocked: targetProg.unlocked,
        total: targetProg.total,
        remaining: Math.max(0, targetProg.total - targetProg.unlocked),
        dungeonsDone: targetProg.dungeonsDone,
        dungeonsTotal: targetProg.dungeonsTotal,
        dungeonsRemaining: Math.max(0, targetProg.dungeonsTotal - targetProg.dungeonsDone),
        missingIslands: !targetProg.islandsComplete,
        missingDungeons: !targetProg.dungeonsComplete
      };
    }

    isPlotAdjacentlyReachable(game, gx, gy) {
      if (!game || !game.world || typeof game.world.isPlotUnlocked !== 'function') return false;
      if (game.world.isPlotUnlocked(gx, gy)) return false;

      const hasUnlockedNeighbor = (px, py) => {
        return game.world.isPlotUnlocked(px - 1, py) ||
               game.world.isPlotUnlocked(px + 1, py) ||
               game.world.isPlotUnlocked(px, py - 1) ||
               game.world.isPlotUnlocked(px, py + 1);
      };

      if (hasUnlockedNeighbor(gx, gy)) return true;
      // Fallback anti-softlock: if this plot belongs to the currently active biome and no locked plot of this biome has an unlocked neighbor yet
      const lockStatus = this.getBiomeLockStatus(game, gx, gy);
      if (lockStatus.lockedByBiome) return false;
      const targetBiome = game.world.plotBiomes[gy] && game.world.plotBiomes[gy][gx];
      const gridN = game.world.plotBiomes.length || 10;
      for (let py = 0; py < gridN; py++) {
        for (let px = 0; px < gridN; px++) {
          if (game.world.plotBiomes[py][px] !== targetBiome) continue;
          if (game.world.isPlotUnlocked(px, py)) continue;
          if (hasUnlockedNeighbor(px, py)) return false;
        }
      }
      return true;
    }

    canBuyPlot(game, gx, gy) {
      if (!game || !game.world || game.world.isPlotUnlocked(gx, gy)) return false;
      const biomeLock = this.getBiomeLockStatus(game, gx, gy);
      if (biomeLock.lockedByBiome) return false;
      if (!this.isPlotAdjacentlyReachable(game, gx, gy)) return false;
      const price = this.getPlotPrice(game, gx, gy);
      return (game.coins || 0) >= price;
    }

    buyPlot(game, gx, gy) {
      if (game.world.isPlotUnlocked(gx, gy)) return false;
      const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage && Balaclava.I18n.getLanguage() === 'en';
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      const biomeLock = this.getBiomeLockStatus(game, gx, gy);
      if (biomeLock.lockedByBiome) {
        const targetBiomeId = game.world.plotBiomes[gy][gx];
        const targetBiomeName = (Balaclava.CONST.BIOMES[targetBiomeId] && Balaclava.CONST.BIOMES[targetBiomeId].name) || targetBiomeId;
        const msg = isEn
          ? `Complete ${biomeLock.blockingBiomeName} (Islands ${biomeLock.unlocked}/${biomeLock.total} · Dungeons ${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal}) before unlocking ${targetBiomeName}.`
          : `Completa ${biomeLock.blockingBiomeName} (Islas ${biomeLock.unlocked}/${biomeLock.total} · Mazmorras ${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal}) antes de desbloquear ${targetBiomeName}.`;
        if (game.toast) game.toast(msg, 'warn');
        if (game.addFloatingText && game.player) {
          game.addFloatingText(game.player.x, game.player.y - 28, `${biomeLock.blockingBiomeName}: ${biomeLock.unlocked}/${biomeLock.total} · ${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal}`, '#ff8a80');
        }
        if (Balaclava.Audio) Balaclava.Audio.play('error');
        return false;
      }
      if (!this.isPlotAdjacentlyReachable(game, gx, gy)) {
        const msg = isEn ? 'You must unlock an adjacent plot first.' : 'Debes desbloquear una parcela adyacente primero.';
        if (game.toast) game.toast(msg, 'warn');
        if (Balaclava.Audio) Balaclava.Audio.play('error');
        return false;
      }
      const price = this.getPlotPrice(game, gx, gy);
      if (game.coins < price) {
        game.toast(T('toast.needCoinsForPlot', { price }), 'warn');
        if (game.addFloatingText && game.player) {
          game.addFloatingText(game.player.x, game.player.y - 28, T('toast.notEnoughCoins'), '#ff5252');
        }
        Balaclava.Audio.play('error');
        return false;
      }
      game.coins -= price;
      game.world.unlockPlot(gx, gy, false);
      game.unlockedPlots.push([gx, gy]);
      if (!Array.isArray(game.plotUnlockAnims)) game.plotUnlockAnims = [];
      game.plotUnlockAnims.push({ gx, gy, t: 0, dur: 0.48 });
      const plotPx = (Balaclava.CONST.PLOT_TILES || 12) * (Balaclava.CONST.TILE_SIZE || 48);
      const pcx = gx * plotPx + plotPx * 0.5;
      const pcy = gy * plotPx + plotPx * 0.5;
      game.spawnParticles(pcx, pcy, '#80deea', 26);
      game.spawnParticles(pcx, pcy, '#ffd54f', 16);
      game.gainXp(25);
      Balaclava.Audio.play('levelup');
      const curBiomeId = game.world.plotBiomes[gy][gx];
      const biomeName = Balaclava.CONST.BIOMES[curBiomeId].name;
      const afterProg = this.getBiomeUnlockProgress(game, curBiomeId);
      const order = this.getBiomeProgressionOrder(game);
      const nextBiomeId = order[order.indexOf(curBiomeId) + 1];
      const nextBiomeName = nextBiomeId && Balaclava.CONST.BIOMES[nextBiomeId] ? Balaclava.CONST.BIOMES[nextBiomeId].name : null;
      if (afterProg.complete && nextBiomeName) {
        game.toast(
          isEn
            ? `${biomeName} completed (${afterProg.unlocked}/${afterProg.total} islands · ${afterProg.dungeonsDone}/${afterProg.dungeonsTotal} dungeons)! ${nextBiomeName} is now unlocked!`
            : `¡${biomeName} completado (${afterProg.unlocked}/${afterProg.total} islas · ${afterProg.dungeonsDone}/${afterProg.dungeonsTotal} mazmorras)! ¡Ya puedes desbloquear islas de ${nextBiomeName}!`,
          'success'
        );
      } else if (afterProg.islandsComplete && !afterProg.dungeonsComplete && nextBiomeName) {
        game.toast(
          isEn
            ? `All ${biomeName} islands unlocked (${afterProg.unlocked}/${afterProg.total})! Clear all biome dungeons (${afterProg.dungeonsDone}/${afterProg.dungeonsTotal}) to unlock ${nextBiomeName}.`
            : `¡Todas las islas de ${biomeName} compradas (${afterProg.unlocked}/${afterProg.total})! Completa todas sus mazmorras (${afterProg.dungeonsDone}/${afterProg.dungeonsTotal}) para desbloquear ${nextBiomeName}.`,
          'info'
        );
      } else {
        game.toast(
          isEn
            ? `Plot unlocked in ${biomeName} (${afterProg.unlocked}/${afterProg.total} islands)!`
            : `¡Nueva parcela desbloqueada en ${biomeName} (${afterProg.unlocked}/${afterProg.total} islas)!`,
          'success'
        );
      }
      return true;
    }
  }

  Balaclava.EconomySystem = EconomySystem;
})();
