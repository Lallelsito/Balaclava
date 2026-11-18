(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { TILE_SIZE } = Balaclava.CONST;
  const { pick } = Balaclava.Utils;

  // Handles building placement, machine automation cycles, upgrades, turrets, collectors & passive buffs.
  class AutomationSystem {
    getMachineSpeedMultiplier(game) {
      let mult = 1.0 + (game.mods.machineSpeed || 0);
      for (const b of game.buildings) {
        const def = Balaclava.BUILDINGS[b.type];
        if (def && def.machineSpeedBonus) {
          if (def.omegaStructure && !b.omegaActive) continue;
          mult += def.machineSpeedBonus * (1 + (b.level - 1) * 0.35);
        }
      }
      return mult;
    }

    getStorageCapacity(game, building) {
      const def = Balaclava.BUILDINGS[building.type];
      const base = (def && def.capacity) || 30;
      const lvlMult = 1 + (building.level - 1) * 0.6;
      const skillMult = 1 + (game.mods.storageMult || 0);
      return Math.round(base * lvlMult * skillMult);
    }

    getTotalStoredCount(building) {
      let total = 0;
      if (building.storage) {
        for (const q of Object.values(building.storage)) total += q;
      }
      return total;
    }

    update(dt, game) {
      const speedMult = this.getMachineSpeedMultiplier(game);

      for (const b of game.buildings) {
        const def = Balaclava.BUILDINGS[b.type];
        if (!def) continue;
        if (!b.storage) b.storage = {};
        if (!b.coinsStored) b.coinsStored = 0;
        if (!b.level) b.level = 1;
        if (typeof b.fuel !== 'number') b.fuel = def.usesFuel ? 5 : 0;

        // Warmth regen aura (Fogata)
        if (def.warmRegenRadius && !game.activeDungeon) {
          const bx = (b.tx + def.size * 0.5) * TILE_SIZE;
          const by = (b.ty + def.size * 0.5) * TILE_SIZE;
          if (Balaclava.Utils.dist(bx, by, game.player.x, game.player.y) <= def.warmRegenRadius) {
            game.player.hp = Math.min(game.player.maxHp, game.player.hp + dt * 2.2);
            game.player.energy = Math.min(game.player.maxEnergy, game.player.energy + dt * 6.0);
          }
        }

        // Turret defense (Torre Mágica / Torre Voltaica / Torreta de Prisma Omega)
        if (def.turretRange) {
          if (def.omegaStructure && !b.omegaActive) continue;
          b.turretCd = Math.max(0, (b.turretCd || 0) - dt);
          if (b.turretCd <= 0 && !game.activeDungeon) {
            const bx = (b.tx + def.size * 0.5) * TILE_SIZE;
            const by = (b.ty + def.size * 0.5) * TILE_SIZE;
            const target = game.combat.enemies.find(e => Balaclava.Utils.dist(bx, by, e.x, e.y) <= def.turretRange);
            if (target) {
              const baseCd = def.turretCooldown || def.turretRate || 1.6;
              b.turretCd = baseCd / (1 + (b.level - 1) * 0.25);
              const ang = Math.atan2(target.y - by, target.x - bx);
              const dmg = Math.round((def.turretDmg || 28) * (1 + (b.level - 1) * 0.45));
              if (def.isLightningTurret) {
                game.spawnFx('fx_thunder_strike', target.x, target.y - 18, 0, 0.34, 1.35, 0.92);
                game.combat.damageEnemy(game, target, dmg, ang, false);
                const near = game.combat.enemies.filter(e => e !== target && Balaclava.Utils.dist(target.x, target.y, e.x, e.y) <= 120).slice(0, 2);
                for (const se of near) {
                  game.combat.damageEnemy(game, se, Math.round(dmg * 0.6), ang, false);
                }
              } else {
                game.spawnPlayerProjectile(bx, by, Math.cos(ang) * 340, Math.sin(ang) * 340, dmg, '#ce93d8');
              }
            }
          }
          continue;
        }

        // Auto-Collector (Torre Recolectora)
        if (def.collectRadius) {
          b.timer = (b.timer || 0) + dt * speedMult * (1 + (b.level - 1) * 0.35);
          if (b.timer >= def.autoCycle) {
            b.timer = 0;
            this.runCollector(game, b, def.collectRadius);
          }
          continue;
        }

        // Plantation auto-harvest mature crops
        if (def.autoHarvestRadius) {
          b.timer = (b.timer || 0) + dt * speedMult;
          if (b.timer >= def.autoCycle) {
            b.timer = 0;
            this.runPlantation(game, b, def.autoHarvestRadius);
          }
          continue;
        }

        // Auto-Irrigator (Aspersor / Invernadero)
        if (def.autoWaterRadius) {
          const bx = (b.tx + def.size * 0.5) * TILE_SIZE;
          const by = (b.ty + def.size * 0.5) * TILE_SIZE;
          const r = def.autoWaterRadius * (1 + (b.level - 1) * 0.2);
          for (const c of game.world.crops) {
            if (!c.watered && Balaclava.Utils.dist(bx, by, (c.tx + 0.5) * TILE_SIZE, (c.ty + 0.5) * TILE_SIZE) <= r) {
              c.watered = true;
            }
          }
        }

        if (!def.autoCycle) continue;

        // Fuel check for fuel-consuming machines (unless freeFuel skill unlocked)
        if (def.usesFuel && !game.mods.freeFuel && b.fuel <= 0) {
          if ((game.inventory.carbon || 0) > 0 && b.autoRefuel !== false) {
            game.removeItem('carbon', 1);
            b.fuel += 5;
          } else {
            b.noFuel = true;
            continue;
          }
        }
        b.noFuel = false;

        const lvlSpeed = 1 + (b.level - 1) * 0.45;
        b.timer = (b.timer || 0) + dt * speedMult * lvlSpeed;
        if (b.timer < def.autoCycle) continue;
        b.timer = 0;

        // Check queued manual smelting/crafting task first
        if (b.queue && b.queue.length > 0) {
          const job = b.queue[0];
          this.depositToBuilding(game, b, job.out, job.qty);
          job.left--;
          if (job.left <= 0) b.queue.shift();
          if (def.usesFuel && !game.mods.freeFuel) b.fuel = Math.max(0, b.fuel - 0.5);
          continue;
        }

        const cap = this.getStorageCapacity(game, b);
        const stored = this.getTotalStoredCount(b);

        // Passive Coins (Banco, Casa de comercio, Tesoreria)
        if (def.autoCoins && b.coinsStored < cap) {
          let treasuryMult = 1 + (game.mods.passiveCoinBonus || 0);
          if (b.type === 'banco') {
            const treasuries = game.buildings.filter(x => x.type === 'tesoreria').length;
            treasuryMult += treasuries * 0.25;
          }
          const gain = Math.round(def.autoCoins * (1 + (b.level - 1) * 0.5) * treasuryMult);
          b.coinsStored = Math.min(cap, b.coinsStored + gain);
        }

        // Passive XP (Biblioteca)
        if (def.autoXp) {
          game.gainXp(Math.round(def.autoXp * (1 + (b.level - 1) * 0.4)));
        }

        if (stored >= cap) {
          b.isPausedFull = true;
          continue;
        }
        b.isPausedFull = false;

        // Auto Drill extracts biome-specific minerals
        if (def.autoDrill) {
          const biome = game.world.getBiomeAtPixel(b.tx * TILE_SIZE + 24, b.ty * TILE_SIZE + 24);
          const tables = {
            pradera: ['piedra', 'carbon', 'cobre', 'hierro'],
            desierto: ['arena', 'cobre', 'oro', 'cristales'],
            bosque_oscuro: ['hierro', 'carbon', 'cristales', 'esencia_oscura'],
            montanas_heladas: ['hierro', 'oro', 'cristales', 'esmeraldas'],
            tierras_volcanicas: ['material_volcanico', 'carbon', 'oro', 'diamantes']
          };
          const pool = tables[biome] || tables.pradera;
          let idx = Math.floor(Math.random() * pool.length);
          if (b.level >= 2 && Math.random() < 0.35) idx = Math.min(pool.length - 1, idx + 1);
          this.depositToBuilding(game, b, pool[idx], b.level >= 3 ? 2 : 1);
          if (!game.mods.freeFuel) b.fuel = Math.max(0, b.fuel - 0.5);
          continue;
        }

        // Auto Fish (Estanque)
        if (def.autoFish) {
          const biome = game.world.getBiomeAtPixel(b.tx * TILE_SIZE + 24, b.ty * TILE_SIZE + 24);
          const fishPool = biome === 'desierto' ? ['pez_comun', 'pez_dorado']
            : biome === 'bosque_oscuro' ? ['pez_comun', 'pez_abismal']
            : biome === 'montanas_heladas' ? ['pez_comun', 'pez_helado']
            : biome === 'tierras_volcanicas' ? ['pez_dorado', 'pez_lava']
            : ['pez_comun', 'pez_comun', 'pez_dorado'];
          this.depositToBuilding(game, b, pick(fishPool), 1);
          continue;
        }

        // Auto Convert from player's inventory if toggled & available (Molino, Telar, Horno)
        if (def.autoConvert && b.autoPull !== false) {
          const canPull = Object.entries(def.autoConvert.in).every(([id, q]) => (game.inventory[id] || 0) >= q);
          if (canPull) {
            Object.entries(def.autoConvert.in).forEach(([id, q]) => game.removeItem(id, q));
            Object.entries(def.autoConvert.out).forEach(([id, q]) => this.depositToBuilding(game, b, id, q));
            if (def.usesFuel && !game.mods.freeFuel) b.fuel = Math.max(0, b.fuel - 0.5);
            continue;
          }
        }

        // Direct auto-production (Aserradero, Huerto, Corral, Granja, Laboratorio, Fundicion, etc.)
        if (def.autoProduce) {
          const entries = Object.entries(def.autoProduce);
          const [itemId, qty] = pick(entries);
          this.depositToBuilding(game, b, itemId, qty + (b.level >= 3 ? 1 : 0));
          if (def.usesFuel && !game.mods.freeFuel) b.fuel = Math.max(0, b.fuel - 0.5);
        }
      }
    }

    depositToBuilding(game, b, itemId, qty) {
      if (!b.storage) b.storage = {};
      const cap = this.getStorageCapacity(game, b);
      const curStored = this.getTotalStoredCount(b);
      const space = Math.max(0, cap - curStored);
      const toStore = Math.min(qty, space);
      if (toStore > 0) {
        b.storage[itemId] = (b.storage[itemId] || 0) + toStore;
      }
      const overflow = qty - toStore;
      if (overflow > 0) {
        const routed = this.routeOverflowToLogistics(game, b, itemId, overflow);
        if (!routed) {
          b.isPausedFull = true;
          return false;
        }
      }
      b.isPausedFull = (this.getTotalStoredCount(b) >= cap);
      return true;
    }

    routeOverflowToLogistics(game, sourceB, itemId, qty) {
      const chests = (game.buildings || []).filter(x => x.type === 'cofre_logistico');
      if (chests.length === 0) return false;
      let remaining = qty;
      for (const ch of chests) {
        if (!ch.storage) ch.storage = {};
        if (Array.isArray(ch.filters) && ch.filters.length > 0 && !ch.filters.includes(itemId)) {
          continue;
        }
        const chCap = this.getStorageCapacity(game, ch);
        const chCur = this.getTotalStoredCount(ch);
        const chSpace = Math.max(0, chCap - chCur);
        const fit = Math.min(remaining, chSpace);
        if (fit > 0) {
          ch.storage[itemId] = (ch.storage[itemId] || 0) + fit;
          remaining -= fit;
          if (remaining <= 0) return true;
        }
      }
      return remaining < qty;
    }

    collectFromBuilding(game, b) {
      let collectedAny = false;
      b.isPausedFull = false;
      if (b.coinsStored > 0) {
        game.addCoins(b.coinsStored);
        b.coinsStored = 0;
        collectedAny = true;
      }
      if (b.storage) {
        for (const [id, qty] of Object.entries(b.storage)) {
          if (qty > 0) {
            game.addItem(id, qty);
            b.storage[id] = 0;
            collectedAny = true;
          }
        }
      }
      if (collectedAny) {
        Balaclava.Audio.play('pickup');
      }
      return collectedAny;
    }

    runCollector(game, collector, radius) {
      const cx = (collector.tx + 0.5) * TILE_SIZE;
      const cy = (collector.ty + 0.5) * TILE_SIZE;
      const maxDist = radius * TILE_SIZE;

      // Pull dropped world loot directly to inventory
      for (let i = game.drops.length - 1; i >= 0; i--) {
        const d = game.drops[i];
        if (Balaclava.Utils.dist(cx, cy, d.x, d.y) <= maxDist) {
          if (d.itemId === '_coin') game.addCoins(d.qty);
          else game.addItem(d.itemId, d.qty);
          game.drops.splice(i, 1);
        }
      }

      // Empty nearby machines automatically
      for (const b of game.buildings) {
        if (b === collector) continue;
        const bx = (b.tx + 0.5) * TILE_SIZE;
        const by = (b.ty + 0.5) * TILE_SIZE;
        if (Balaclava.Utils.dist(cx, cy, bx, by) <= maxDist) {
          this.collectFromBuilding(game, b);
        }
      }
    }

    runPlantation(game, plantBuilding, radius) {
      for (let i = game.world.crops.length - 1; i >= 0; i--) {
        const c = game.world.crops[i];
        if (c.stage >= 3 && Math.abs(c.tx - plantBuilding.tx) <= radius && Math.abs(c.ty - plantBuilding.ty) <= radius) {
          const def = Balaclava.CROPS[c.cropId];
          if (def) {
            game.world.crops.splice(i, 1);
            game.addItem(def.yieldId, def.minQty);
            game.stats.cropsHarvested++;
            // Auto-replant if player has seeds!
            if ((game.inventory[def.seedId] || 0) > 0) {
              game.removeItem(def.seedId, 1);
              game.world.crops.push({ tx: c.tx, ty: c.ty, cropId: c.cropId, progress: 0, stage: 0, watered: true });
            }
          }
        }
      }
    }

    upgradeBuilding(game, b) {
      if (b.level >= 3) return false;
      const nextLvl = b.level + 1;
      const coinCost = nextLvl * 85;
      const gearCost = nextLvl === 2 ? 2 : 4;
      if (game.coins < coinCost || (game.inventory.engrane || 0) < gearCost) {
        game.toast(`Necesitas ${coinCost} monedas y ${gearCost} Engranajes para mejorar a Nv.${nextLvl}`, 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      game.coins -= coinCost;
      game.removeItem('engrane', gearCost);
      b.level = nextLvl;
      Balaclava.Audio.play('levelup');
      game.toast(`¡${Balaclava.BUILDINGS[b.type].name} mejorado a Nivel ${nextLvl}!`, 'success');
      return true;
    }
  }

  Balaclava.AutomationSystem = AutomationSystem;
})();
