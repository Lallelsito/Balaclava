(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { TILE_SIZE } = Balaclava.CONST;
  const { randInt, pick, clamp } = Balaclava.Utils;

  const CROPS = {
    trigo: {
      id: 'trigo', name: 'Trigo Dorado', seedId: 'semillas', growTime: 40,
      yieldId: 'trigo', minQty: 2, maxQty: 4, seedDrop: 1, xp: 6, color: '#f9d74a', sprite: 'crop_trigo'
    },
    zanahoria: {
      id: 'zanahoria', name: 'Zanahoria Dulce', seedId: 'semillas_zanahoria', growTime: 48,
      yieldId: 'zanahoria', minQty: 2, maxQty: 3, seedDrop: 1, xp: 10, color: '#ff7043', sprite: 'crop_zanahoria'
    },
    tomate: {
      id: 'tomate', name: 'Tomate Jugoso', seedId: 'semillas_tomate', growTime: 54,
      yieldId: 'tomate', minQty: 2, maxQty: 4, seedDrop: 1, xp: 12, color: '#ef5350', sprite: 'crop_tomate'
    },
    papa: {
      id: 'papa', name: 'Patata Dorada', seedId: 'semillas_papa', growTime: 58,
      yieldId: 'papa', minQty: 2, maxQty: 4, seedDrop: 1, xp: 13, color: '#d7a86e', sprite: 'crop_papa'
    },
    maiz: {
      id: 'maiz', name: 'Maíz Dorado', seedId: 'semillas_maiz', growTime: 64,
      yieldId: 'maiz', minQty: 2, maxQty: 4, seedDrop: 1, xp: 14, color: '#ffd54f', sprite: 'crop_maiz'
    },
    calabaza: {
      id: 'calabaza', name: 'Calabaza Real', seedId: 'semillas_calabaza', growTime: 70,
      yieldId: 'calabaza', minQty: 1, maxQty: 2, seedDrop: 1, xp: 16, color: '#fb8c00', sprite: 'crop_calabaza'
    },
    berenjena: {
      id: 'berenjena', name: 'Berenjena Morada', seedId: 'semillas_berenjena', growTime: 74,
      yieldId: 'berenjena', minQty: 2, maxQty: 3, seedDrop: 1, xp: 18, color: '#ab47bc', sprite: 'crop_berenjena'
    },
    chile: {
      id: 'chile', name: 'Chile Ígneo', seedId: 'semillas_chile', growTime: 80,
      yieldId: 'chile', minQty: 2, maxQty: 4, seedDrop: 1, xp: 20, color: '#e53935', sprite: 'crop_chile'
    },
    fresa: {
      id: 'fresa', name: 'Fresa Real', seedId: 'semillas_fresa', growTime: 88,
      yieldId: 'fresa', minQty: 2, maxQty: 3, seedDrop: 1, xp: 24, color: '#ec407a', sprite: 'crop_fresa'
    },
    uva: {
      id: 'uva', name: 'Vid Arcana', seedId: 'semillas_uva', growTime: 96,
      yieldId: 'uva', minQty: 2, maxQty: 3, seedDrop: 1, xp: 28, color: '#7e57c2', sprite: 'crop_uva'
    },
    flor_cristal: {
      id: 'flor_cristal', name: 'Flor de Cristal', seedId: 'semillas_cristal', growTime: 105,
      yieldId: 'flor_cristal', minQty: 1, maxQty: 2, seedDrop: 1, xp: 34, color: '#80deea', sprite: 'crop_flor_cristal'
    }
  };

  class FarmingAndFishing {
    constructor() {
      // Multi-phase interactive fishing state:
      // { active, phase: 'cast'|'wait'|'bite'|'reel', timer, maxTimer, startX, startY, wx, wy,
      //   biome, spotNode, baitId, targetFish, barPos, barSize, barVel, fishPos, fishVel,
      //   fishTarget, fishTimer, progress, rippleT, shadows }
      this.fishing = null;
      this.lastUntilledWarnAt = 0;
    }

    tillTile(game, tx, ty) {
      if (!game.world.isTileUnlocked(tx, ty)) return false;
      if (!game.world.tiles[ty] || game.world.tiles[ty][tx] !== 1) return false;
      if (game.world.getNodeAtTile(tx, ty)) return false;
      if (game.getBuildingAtTile(tx, ty)) return false;
      game.world.tiles[ty][tx] = 2; // tilled soil
      game.stats.tilesTilled = (game.stats.tilesTilled || 0) + 1;
      Balaclava.Audio.play('dig');
      game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, '#8d6e63', 7);
      // Occasional earthy find when tilling virgin soil
      if (Math.random() < 0.14) {
        const find = Math.random() < 0.65 ? 'cebo_gusano' : 'semillas_papa';
        if (Balaclava.ITEMS[find]) {
          game.spawnDrop((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, find, 1);
        }
      }
      return true;
    }

    tillArea(game, tx, ty, tierId = 'basica') {
      const idx = (Balaclava.TOOL_TIERS || []).indexOf(tierId);
      const offsets = idx >= 4
        ? [[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1]]
        : idx >= 3
          ? [[0,0],[1,0]]
          : [[0,0]];
      let tilled = 0;
      let watered = 0;
      for (const [ox, oy] of offsets) {
        const cx = tx + ox;
        const cy = ty + oy;
        if (this.tillTile(game, cx, cy)) tilled++;
        else if (this.waterTile(game, cx, cy)) watered++;
      }
      if (tilled > 0) {
        game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, tilled > 1 ? `Tierra arada x${tilled}` : 'Tierra arada', '#d7ccc8');
      } else if (watered > 0) {
        game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, 'Cultivo regado', '#4fc3f7');
      }
      return tilled > 0 || watered > 0;
    }

    plantSeed(game, tx, ty, seedItemId) {
      const item = Balaclava.ITEMS[seedItemId];
      if (!item || !item.plantCrop) return false;
      if ((game.inventory[seedItemId] || 0) < 1) return false;
      if (!game.world.isTileUnlocked(tx, ty)) return false;
      const t = game.world.tiles[ty] && game.world.tiles[ty][tx];
      if (game.world.getNodeAtTile(tx, ty) || game.getBuildingAtTile(tx, ty)) return false;
      if (game.world.crops.some(c => c.tx === tx && c.ty === ty)) return false;

      // Strict agricultural progression: soil MUST be tilled with Azada first!
      if (t !== 2) {
        const now = performance.now();
        if (now - this.lastUntilledWarnAt > 900) {
          this.lastUntilledWarnAt = now;
          const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
          const msg = !game.toolTiers.azada
            ? T('farm.needHoeCraft')
            : T('farm.needHoeUse');
          game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, msg, '#ffcc80');
          game.toast(msg, 'warn');
          Balaclava.Audio.play('error');
        }
        return false;
      }

      game.removeItem(seedItemId, 1);
      const fertKey = `${tx},${ty}`;
      const preFert = (game.world.fertilizedTiles && game.world.fertilizedTiles[fertKey]) || null;
      if (preFert && game.world.fertilizedTiles) delete game.world.fertilizedTiles[fertKey];
      const initProg = preFert ? Math.min(0.65, (preFert.boost || 0) * 0.35) : 0;
      game.world.crops.push({
        tx, ty,
        cropId: item.plantCrop,
        progress: initProg,
        stage: initProg >= 0.65 ? 2 : initProg >= 0.3 ? 1 : 0,
        watered: Boolean(preFert),
        fertilized: preFert ? preFert.id : null,
        yieldBonus: preFert ? (preFert.yieldBonus || 0) : 0,
        qualityBonus: preFert ? (preFert.qualityBonus || 0) : 0
      });
      Balaclava.Audio.play('pickup');
      game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, '#a5d6a7', 5);
      game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, Balaclava.I18n ? Balaclava.I18n.t('farm.planted') : 'Plantado', '#a5d6a7');
      return true;
    }

    fertilizeTile(game, tx, ty, preferredId = null) {
      const T = (k) => (Balaclava.I18n ? Balaclava.I18n.t(k) : k);
      const FERTILIZER_EFFECTS = {
        compost_magico: { boost: 0.92, yieldBonus: 3, qualityBonus: 0.55, color: '#ce93d8', label: T('farm.fertMagic') },
        abono_dorado:   { boost: 0.70, yieldBonus: 2, qualityBonus: 0.35, color: '#ffd54f', label: T('farm.fertGold') },
        fertilizante:   { boost: 0.48, yieldBonus: 1, qualityBonus: 0.15, color: '#aed581', label: T('farm.fertOrganic') }
      };
      let fertId = null;
      if (preferredId && FERTILIZER_EFFECTS[preferredId] && (game.inventory[preferredId] || 0) >= 1) {
        fertId = preferredId;
      } else {
        for (const cand of ['compost_magico', 'abono_dorado', 'fertilizante']) {
          if ((game.inventory[cand] || 0) >= 1) { fertId = cand; break; }
        }
      }
      if (!fertId) return false;
      const eff = FERTILIZER_EFFECTS[fertId];
      const crop = game.world.crops.find(c => c.tx === tx && c.ty === ty);
      if (crop) {
        if (crop.stage >= 3 && crop.fertilized) return false;
        game.removeItem(fertId, 1);
        crop.progress = Math.min(1, crop.progress + eff.boost);
        crop.watered = true;
        crop.fertilized = fertId;
        crop.yieldBonus = Math.max(crop.yieldBonus || 0, eff.yieldBonus);
        crop.qualityBonus = Math.max(crop.qualityBonus || 0, eff.qualityBonus);
        crop.stage = crop.progress >= 1 ? 3 : crop.progress >= 0.65 ? 2 : crop.progress >= 0.3 ? 1 : 0;
        Balaclava.Audio.play('cast');
        game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, eff.color, 12);
        game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, eff.label, eff.color);
        return true;
      }
      // Allow pre-fertilizing empty tilled soil (tile === 2) before planting!
      if (!game.world.isTileUnlocked(tx, ty) || game.world.tiles[ty]?.[tx] !== 2) return false;
      if (!game.world.fertilizedTiles) game.world.fertilizedTiles = {};
      const key = `${tx},${ty}`;
      if (game.world.fertilizedTiles[key] && game.world.fertilizedTiles[key].id === fertId) return false;
      game.removeItem(fertId, 1);
      game.world.fertilizedTiles[key] = { id: fertId, boost: eff.boost, yieldBonus: eff.yieldBonus, qualityBonus: eff.qualityBonus };
      Balaclava.Audio.play('cast');
      game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, eff.color, 10);
      game.addFloatingText((tx + 0.5) * TILE_SIZE, ty * TILE_SIZE, eff.label, eff.color);
      return true;
    }

    waterTile(game, tx, ty) {
      const crop = game.world.crops.find(c => c.tx === tx && c.ty === ty);
      if (!crop || crop.watered) return false;
      crop.watered = true;
      Balaclava.Audio.play('cast');
      game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, '#4fc3f7', 8);
      return true;
    }

    harvestCrop(game, tx, ty) {
      const idx = game.world.crops.findIndex(c => c.tx === tx && c.ty === ty);
      if (idx < 0) return false;
      const crop = game.world.crops[idx];
      const def = CROPS[crop.cropId];
      if (!def || crop.stage < 3) return false;

      game.world.crops.splice(idx, 1);
      const azEnch = game.getToolEnchantBonuses ? game.getToolEnchantBonuses('azada') : null;
      const guEnch = game.getToolEnchantBonuses ? game.getToolEnchantBonuses('guadana') : null;
      const harvestBonus = Math.max(azEnch ? (azEnch.harvestBonus || 0) : 0, guEnch ? (guEnch.harvestBonus || 0) : 0);
      const cropDoubleChance = Math.max(azEnch ? (azEnch.doubleChance || 0) : 0, guEnch ? (guEnch.doubleChance || 0) : 0);
      let qty = randInt(def.minQty, def.maxQty) + (game.mods.extraDrop || 0) + harvestBonus + (crop.yieldBonus || 0);
      if (cropDoubleChance > 0 && Math.random() < cropDoubleChance) qty *= 2;
      if ((crop.qualityBonus || 0) > 0 && Math.random() < crop.qualityBonus) qty += 1;
      game.addItem(def.yieldId, qty);
      if (Math.random() < 0.8 + (crop.qualityBonus || 0) * 0.25) {
        game.addItem(def.seedId, def.seedDrop + ((crop.qualityBonus || 0) >= 0.5 && Math.random() < 0.45 ? 1 : 0));
      }
      if ((crop.qualityBonus || 0) >= 0.35 && Math.random() < 0.25) {
        game.addItem('trigo_dorado', 1);
      }
      game.gainXp(def.xp);
      game.stats.cropsHarvested++;
      Balaclava.Audio.play('pickup');
      game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, def.color, 10);
      return true;
    }

    updateCrops(dt, game) {
      const mills = game.buildings.filter(b => b.type === 'molino');
      const plantations = game.buildings.filter(b => b.type === 'plantacion');
      const irrigators = game.buildings.filter(b => {
        const def = Balaclava.BUILDINGS[b.type];
        return def && (def.cropBoost || def.autoWaterRadius);
      });

      for (let i = game.world.crops.length - 1; i >= 0; i--) {
        const c = game.world.crops[i];
        const def = CROPS[c.cropId];
        if (!def) continue;

        const cx = (c.tx + 0.5) * TILE_SIZE;
        const cy = (c.ty + 0.5) * TILE_SIZE;

        if (!c.watered) {
          for (const p of plantations) {
            if (Math.abs(p.tx - c.tx) <= 4 && Math.abs(p.ty - c.ty) <= 4) {
              c.watered = true;
              break;
            }
          }
        }

        let speedMult = c.watered ? 1.9 : 0.72; // Watering nearly triples speed compared to dry soil!
        for (const m of mills) {
          if (Math.abs(m.tx - c.tx) <= 6 && Math.abs(m.ty - c.ty) <= 6) {
            speedMult += 0.30;
            break;
          }
        }
        for (const ir of irrigators) {
          const defB = Balaclava.BUILDINGS[ir.type];
          const r = (defB.autoWaterRadius || 220) * (1 + (ir.level - 1) * 0.2);
          const bx = (ir.tx + defB.size * 0.5) * TILE_SIZE;
          const by = (ir.ty + defB.size * 0.5) * TILE_SIZE;
          if (Balaclava.Utils.dist(bx, by, cx, cy) <= r) {
            if (defB.autoWaterRadius) c.watered = true;
            if (defB.cropBoost) speedMult += defB.cropBoost;
          }
        }

        c.progress += (dt * speedMult) / def.growTime;
        c.stage = c.progress >= 1 ? 3 : c.progress >= 0.65 ? 2 : c.progress >= 0.3 ? 1 : 0;
      }
    }

    rollTargetFish(biome, luck, baitId, tierIdx) {
      const roll = Math.random();
      const baitMult = baitId === 'cebo_arcano' ? 3.2
        : baitId === 'cebo_volcanico' ? 2.6
        : baitId === 'cebo_dorado' ? 2.1
        : baitId === 'cebo_gusano' ? 1.35 : 1.0;
      const rareScore = clamp((roll - (luck * 0.18 + (baitMult - 1) * 0.22)), 0, 1);

      if (rareScore < 0.015) return { id: 'pez_legendario_kraken', diff: 0.95, xp: 120 };
      if (rareScore < 0.035) return { id: 'cofre_hundido', diff: 0.84, xp: 55 };
      if (rareScore < 0.065) return { id: 'perla', diff: 0.78, xp: 48 };
      if (rareScore < 0.10) return { id: 'gema_marina', diff: 0.76, xp: 44 };
      if (rareScore < 0.14) return { id: 'cangrejo_dorado', diff: 0.70, xp: 40 };
      if (rareScore < 0.18) return { id: 'mapa_tesoro_item', diff: 0.68, xp: 38 };
      if (rareScore < 0.22) return { id: 'pulpo', diff: 0.72, xp: 38 };
      if (rareScore < 0.27) return { id: 'carpa_dorada', diff: 0.66, xp: 34 };
      if (rareScore < 0.32) return { id: 'pez_dorado', diff: 0.64, xp: 30 };

      if (biome === 'tierras_volcanicas' && (tierIdx >= 3 || Math.random() < 0.55 || baitId === 'cebo_volcanico')) {
        return pick([
          { id: 'pez_fenix_magma', diff: 0.82, xp: 50 },
          { id: 'pez_lava', diff: 0.66, xp: 30 },
          { id: 'anguila', diff: 0.60, xp: 26 },
          { id: 'pez_globo', diff: 0.58, xp: 24 }
        ]);
      }
      if (biome === 'bosque_oscuro') {
        return pick([
          { id: 'anguila_sombras', diff: 0.74, xp: 42 },
          { id: 'pez_abismal', diff: 0.56, xp: 26 },
          { id: 'bagre', diff: 0.44, xp: 20 },
          { id: 'anguila', diff: 0.52, xp: 22 },
          { id: 'medusa', diff: 0.48, xp: 20 },
          { id: 'algas', diff: 0.20, xp: 9 }
        ]);
      }
      if (biome === 'montanas_heladas') {
        return pick([
          { id: 'esturion_glacial', diff: 0.72, xp: 40 },
          { id: 'pez_helado', diff: 0.52, xp: 24 },
          { id: 'trucha_arcoiris', diff: 0.44, xp: 20 },
          { id: 'medusa', diff: 0.50, xp: 20 },
          { id: 'pez_azul', diff: 0.40, xp: 16 }
        ]);
      }
      if (biome === 'desierto') {
        return pick([
          { id: 'pez_cirujano', diff: 0.44, xp: 20 },
          { id: 'pez_payaso', diff: 0.42, xp: 18 },
          { id: 'cangrejo_dungeness', diff: 0.38, xp: 17 },
          { id: 'caracola_antigua', diff: 0.58, xp: 24 },
          { id: 'concha_marina', diff: 0.34, xp: 18 },
          { id: 'algas', diff: 0.18, xp: 8 }
        ]);
      }
      return pick([
        { id: 'pez_dorado_solar', diff: 0.65, xp: 35 },
        { id: 'algas', diff: 0.18, xp: 8 },
        { id: 'anchoa', diff: 0.25, xp: 12 },
        { id: 'lubina', diff: 0.30, xp: 14 },
        { id: 'pez_comun', diff: 0.28, xp: 12 },
        { id: 'pez_angel', diff: 0.44, xp: 20 },
        { id: 'pez_azul', diff: 0.34, xp: 15 },
        { id: 'camaron', diff: 0.26, xp: 12 },
        { id: 'cangrejo_dungeness', diff: 0.36, xp: 16 },
        { id: 'pez_payaso', diff: 0.40, xp: 17 },
        { id: 'concha_marina', diff: 0.34, xp: 18 },
        { id: 'botella_mensaje', diff: 0.46, xp: 24 }
      ]);
    }

    startFishing(game, wx, wy, spotNode = null) {
      // Handle clicks inside existing fishing state WITHOUT ever insta-catching!
      if (this.fishing) {
        const f = this.fishing;
        if (f.phase === 'cast') {
          return; // Ignore clicks mid-cast animation
        }
        if (f.phase === 'wait') {
          this.fishing = null;
          game.addFloatingText(game.player.x, game.player.y - 24, 'Recogiste muy pronto', '#cfd8dc');
          return;
        }
        if (f.phase === 'bite') {
          // Transition from bite alert to Fish Hunters timing minigame!
          this.beginReeling(game);
          return;
        }
        if (f.phase === 'reel') {
          this.strikeFishingZone(game);
          return;
        }
      }

      const tier = Balaclava.getToolStats('cana', game.toolTiers.cana);
      const tierIdx = tier ? tier.tierIndex : 0;
      const lighthouseLuck = game.buildings.some(b => {
        const d = Balaclava.BUILDINGS[b.type];
        return d && d.auraLuck && Balaclava.Utils.dist((b.tx + 0.5) * TILE_SIZE, (b.ty + 0.5) * TILE_SIZE, wx, wy) <= 320;
      }) ? 0.16 : 0;
      const luck = (game.mods.luckBonus || 0) + (tier ? tier.rareBonus : 0) + lighthouseLuck;

      let baitId = null;
      if ((game.inventory.cebo_dorado || 0) > 0) baitId = 'cebo_dorado';
      else if ((game.inventory.cebo_gusano || 0) > 0) baitId = 'cebo_gusano';

      const baitSpeed = baitId === 'cebo_dorado' ? 0.65 : baitId === 'cebo_gusano' ? 0.80 : 1.0;
      const baseWait = (2.6 - Math.min(1.1, tierIdx * 0.2)) * baitSpeed;
      const waitTime = Math.max(1.2, baseWait + Math.random() * 1.1);
      const biome = game.world.getBiomeAtPixel(wx, wy);
      const targetFish = this.rollTargetFish(biome, luck, baitId, tierIdx);
      const diff = targetFish ? targetFish.diff : 0.35;
      // Rarity/difficulty sharply narrows the green skill zone
      const zoneWidth = clamp(0.32 - diff * 0.25 + tierIdx * 0.008 + (game.mods.fishWindow || 0) * 0.5, 0.075, 0.34);

      // Generate ambient pixel-art fish swimming around the bobber while waiting
      const targetFishId = targetFish ? targetFish.id : 'pez_comun';
      const shadows = [
        {
          id: targetFishId,
          isTarget: true,
          ang: Math.random() * Math.PI * 2,
          dist: 32 + Math.random() * 10,
          speed: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.3),
          depth: 0.65,
          wiggle: Math.random() * Math.PI * 2,
          wiggleSpeed: 9 + Math.random() * 3,
          size: 1.15,
          fleeing: false,
          x: wx,
          y: wy
        }
      ];
      const ambPool = ['anchoa', 'pez_azul', 'pez_comun', 'pez_payaso'];
      const extraFishCount = 1 + (Math.random() < 0.45 ? 1 : 0);
      for (let k = 0; k < extraFishCount; k++) {
        shadows.push({
          id: pick(ambPool),
          isTarget: false,
          ang: Math.random() * Math.PI * 2,
          dist: 24 + Math.random() * 16,
          speed: (Math.random() < 0.5 ? 1 : -1) * (0.55 + Math.random() * 0.35),
          depth: 0.78,
          wiggle: Math.random() * Math.PI * 2,
          wiggleSpeed: 7 + Math.random() * 3,
          size: 0.82,
          fleeing: false,
          x: wx,
          y: wy
        });
      }

      this.fishing = {
        active: true,
        phase: 'cast',
        timer: 0.38,
        maxTimer: 0.38,
        waitDuration: waitTime,
        startX: game.player.x,
        startY: game.player.y - 12,
        bobX: game.player.x,
        bobY: game.player.y - 12,
        wx, wy,
        biome,
        spotNode,
        baitId,
        luck,
        targetFish,
        zoneWidth,
        zoneStart: 0.34,
        cursorPos: 0.12,
        cursorDir: 1,
        cursorSpeed: 1.05 + diff * 0.85,
        hitsDone: 0,
        hitsReq: diff >= 0.64 ? 3 : diff >= 0.44 ? 2 : 1,
        mistakes: 0,
        maxMistakes: 3,
        missFlash: 0,
        hitFlash: 0,
        progress: 0,
        rippleT: 0,
        shadows
      };
      Balaclava.Audio.play('cast');
    }

    beginReeling(game) {
      const f = this.fishing;
      if (!f || f.phase !== 'bite') return;
      const diff = f.targetFish ? f.targetFish.diff : 0.35;
      f.phase = 'reel';
      f.timer = 18.0; // max fail-safe duration
      f.zoneStart = clamp(0.16 + Math.random() * (0.76 - f.zoneWidth), 0.08, 0.88 - f.zoneWidth);
      f.cursorPos = f.zoneStart > 0.45 ? 0.06 : 0.94;
      f.cursorDir = f.cursorPos < 0.5 ? 1 : -1;
      f.cursorSpeed = 1.05 + diff * 0.82;
      f.hitsDone = 0;
      f.mistakes = 0;
      f.progress = 0;
      Balaclava.Audio.play('bite');
      if (game.spawnParticles) game.spawnParticles(f.wx, f.wy, '#80deea', 10);
      if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.35, 0.28, 0.9);
      game.addFloatingText(f.wx, f.wy - 28, Balaclava.I18n ? Balaclava.I18n.t('fish.hooked') : '¡Enganchado! Pulsa [E] o Click en lo verde', '#80deea');
    }

    strikeFishingZone(game) {
      const f = this.fishing;
      if (!f || f.phase !== 'reel') return false;
      const inZone = f.cursorPos >= (f.zoneStart - 0.018) && f.cursorPos <= (f.zoneStart + f.zoneWidth + 0.018);
      if (inZone) {
        f.hitsDone++;
        f.progress = clamp(f.hitsDone / f.hitsReq, 0, 1);
        f.hitFlash = 0.25;
        Balaclava.Audio.play('bite');
        game.spawnParticles(f.wx, f.wy, '#66bb6a', 10);
        if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.30, 0.24, 0.85);
        if (f.hitsDone >= f.hitsReq) {
          this.completeCatch(game);
          return true;
        }
        // Relocate green target zone cleanly for multi-hit rarer fish
        f.zoneStart = clamp(0.10 + Math.random() * (0.80 - f.zoneWidth), 0.08, 0.90 - f.zoneWidth);
        f.cursorSpeed *= 1.08;
        game.addFloatingText(f.wx, f.wy - 24, Balaclava.I18n ? Balaclava.I18n.t('fish.pull', { cur: f.hitsDone, req: f.hitsReq }) : `¡Tirón ${f.hitsDone}/${f.hitsReq}!`, '#a5e6a1');
        return true;
      }
      f.mistakes++;
      f.missFlash = 0.28;
      Balaclava.Audio.play('error');
      game.addFloatingText(f.wx, f.wy - 24, Balaclava.I18n ? Balaclava.I18n.t('fish.miss', { cur: f.mistakes, max: f.maxMistakes }) : `¡Falló! (${f.mistakes}/${f.maxMistakes})`, '#ef9a9a');
      if (f.mistakes >= f.maxMistakes) {
        if (game.spawnParticles) game.spawnParticles(f.wx, f.wy, '#ef5350', 8);
        if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.36, 0.30, 0.9);
        this.fishing = null;
        game.toast(Balaclava.I18n ? Balaclava.I18n.t('fish.lineSnapped') : 'El pez rompió el sedal tras fallar el momento.', 'warn');
      }
      return false;
    }

    updateFishing(dt, game) {
      const f = this.fishing;
      if (!f) return;

      f.rippleT += dt;
      if (Balaclava.Utils.dist(game.player.x, game.player.y, f.wx, f.wy) > 240) {
        this.fishing = null;
        return;
      }

      // Update natural fish swim movements & tail wiggle
      if (f.shadows) {
        for (const s of f.shadows) {
          s.wiggle = (s.wiggle || 0) + dt * (s.wiggleSpeed || 8);
          if (s.fleeing) {
            s.dist += dt * 44;
            s.depth = Math.min(1, (s.depth || 0.6) + dt * 0.45);
            s.ang += s.speed * dt * 0.5;
          } else if (f.phase === 'cast') {
            s.ang += s.speed * dt * 0.7;
          } else if (f.phase === 'wait') {
            if (s.isTarget) {
              if (f.timer <= 1.35) {
                // Target fish spots the bait and approaches the bobber
                s.ang += s.speed * dt * 0.45;
                s.dist = Math.max(3, s.dist - dt * 20);
                s.depth = Math.max(0.12, (s.depth || 0.65) - dt * 0.45);
              } else {
                s.ang += s.speed * dt;
                s.dist = Math.max(16, s.dist - dt * 3.5);
              }
            } else {
              s.ang += s.speed * dt;
            }
          } else if (f.phase === 'bite') {
            if (s.isTarget) {
              // Target fish strikes and tugs on the hook
              s.dist = Math.max(2, Math.min(6, s.dist + Math.sin(f.rippleT * 18) * 3));
              s.ang += Math.sin(f.rippleT * 22) * dt * 4;
              s.depth = 0.08;
            } else {
              s.fleeing = true;
            }
          } else if (f.phase === 'reel') {
            if (s.isTarget) {
              // Hooked fish thrashes in water struggling against the rod
              s.dist = 5 + Math.sin(f.rippleT * 14) * 6;
              s.ang += s.speed * dt * 2.2 + Math.sin(f.rippleT * 12) * dt * 3;
              s.depth = 0.10;
            } else {
              s.fleeing = true;
            }
          }
          // Compute Cartesian coordinates around lure
          s.x = f.wx + Math.cos(s.ang) * s.dist;
          s.y = f.wy + Math.sin(s.ang) * (s.dist * 0.62);
        }
      }

      if (f.phase === 'cast') {
        f.timer -= dt;
        const p = clamp(1 - f.timer / Math.max(0.01, f.maxTimer), 0, 1);
        const arc = Math.sin(p * Math.PI) * 34;
        f.bobX = f.startX + (f.wx - f.startX) * p;
        f.bobY = f.startY + (f.wy - f.startY) * p - arc;
        if (f.timer <= 0) {
          f.phase = 'wait';
          f.bobX = f.wx;
          f.bobY = f.wy;
          f.timer = f.waitDuration;
          game.spawnParticles(f.wx, f.wy, '#81d4fa', 10);
          if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.32, 0.22, 0.85);
        }
        return;
      }

      if (f.phase === 'wait') {
        f.timer -= dt;
        if (f.timer <= 0) {
          f.phase = 'bite';
          f.timer = 2.0;
          Balaclava.Audio.play('bite');
          game.spawnParticles(f.wx, f.wy, '#81d4fa', 12);
          game.spawnParticles(f.wx, f.wy, '#ffd54f', 8);
          if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.38, 0.32, 0.95);
          game.addFloatingText(f.wx, f.wy - 22, Balaclava.I18n ? Balaclava.I18n.t('fish.bite') : '¡PICA! ¡Click o Espacio!', '#ffd54f');
        }
        return;
      }

      if (f.phase === 'bite') {
        f.timer -= dt;
        if (f.timer <= 0) {
          if (game.spawnParticles) game.spawnParticles(f.wx, f.wy, '#81d4fa', 10);
          if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.38, 0.30, 0.9);
          this.fishing = null;
          game.addFloatingText(game.player.x, game.player.y - 24, Balaclava.I18n ? Balaclava.I18n.t('fish.escaped') : 'Escapó el pez...', '#ef9a9a');
        }
        return;
      }

      if (f.phase === 'reel') {
        if (f.missFlash > 0) f.missFlash = Math.max(0, f.missFlash - dt);
        if (f.hitFlash > 0) f.hitFlash = Math.max(0, f.hitFlash - dt);
        f.timer -= dt;
        f.cursorPos += f.cursorDir * f.cursorSpeed * dt;
        if (f.cursorPos >= 1) {
          f.cursorPos = 1;
          f.cursorDir = -1;
        } else if (f.cursorPos <= 0) {
          f.cursorPos = 0;
          f.cursorDir = 1;
        }
        if (f.timer <= 0) {
          if (game.spawnParticles) game.spawnParticles(f.wx, f.wy, '#81d4fa', 10);
          if (game.spawnFx) game.spawnFx('water_splash_fx', f.wx, f.wy, 0, 0.38, 0.30, 0.9);
          this.fishing = null;
          Balaclava.Audio.play('error');
          game.addFloatingText(game.player.x, game.player.y - 26, Balaclava.I18n ? Balaclava.I18n.t('fish.slipped') : '¡Se soltó del anzuelo!', '#ef9a9a');
        }
      }
    }

    completeCatch(game) {
      const f = this.fishing;
      if (!f || (f.phase !== 'reel' && f.phase !== 'bite')) return;
      this.fishing = null;

      // Consume bait on catch!
      if (f.baitId && (game.inventory[f.baitId] || 0) > 0) {
        game.removeItem(f.baitId, 1);
      }

      const fishObj = f.targetFish || { id: 'pez_comun', xp: 14 };
      const fishId = Balaclava.ITEMS[fishObj.id] ? fishObj.id : 'pez_comun';
      game.addItem(fishId, 1);
      game.stats.fishCaught++;
      game.gainXp(fishObj.xp || 16);
      Balaclava.Audio.play('catch');
      if (game.spawnFishCatchLeap) {
        game.spawnFishCatchLeap(f.wx, f.wy, game.player.x, game.player.y - 14, fishId);
      }
      game.spawnParticles(f.wx, f.wy, '#ffd54f', 14);
      const itemName = (Balaclava.ITEMS[fishId] && Balaclava.ITEMS[fishId].name) || 'Pez';
      game.addFloatingText(game.player.x, game.player.y - 34, `¡Atrapado: ${itemName}!`, '#ffe082');

      // Chance for sunken treasure!
      const treasureChance = 0.20 + (f.luck || 0) * 0.22 + (f.baitId === 'cebo_dorado' ? 0.20 : 0);
      if (Math.random() < treasureChance) {
        const bonusCoins = randInt(8, 22);
        game.addCoins(bonusCoins);
        const treasureRoll = Math.random();
        if (treasureRoll < 0.16) game.addItem('perla', 1);
        else if (treasureRoll < 0.30) game.addItem('gema_marina', 1);
        else if (treasureRoll < 0.46) game.addItem('caracola_antigua', 1);
        else if (treasureRoll < 0.62) game.addItem('coral_brillante', 1);
        else if (treasureRoll < 0.76) game.addItem('llave_mazmorra', 1);
        else if (treasureRoll < 0.88) game.addItem('lata_oxidada', 1);
        else game.addItem('bota_vieja', 1);
        game.toast(`¡Tesoro sumergido junto a ${itemName}! +${bonusCoins} monedas`, 'success');
      }
      if (f.spotNode) {
        game.world.nodes = game.world.nodes.filter(n => n !== f.spotNode);
      }
    }
  }

  Balaclava.CROPS = CROPS;
  Balaclava.FarmingAndFishing = FarmingAndFishing;
})();