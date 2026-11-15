(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const SAVE_PREFIX = 'balaclava_save_slot_';
  // Keep in sync with UI_SCALES in ui.js (0.75 = 75%, 1 = 100%, 1.25 = 125%, 1.5 = 150%)
  const UI_SCALE_PRESETS = [0.75, 1, 1.25, 1.5];

  class SaveSystem {
    getSlotKey(slot = 1) {
      return SAVE_PREFIX + slot;
    }

    hasSave(slot = 1) {
      try {
        return !!localStorage.getItem(this.getSlotKey(slot));
      } catch {
        return false;
      }
    }

    deleteSlot(slot = 1) {
      try {
        localStorage.removeItem(this.getSlotKey(slot));
        return true;
      } catch {
        return false;
      }
    }

    getSlotSummary(slot = 1) {
      try {
        const raw = localStorage.getItem(this.getSlotKey(slot));
        if (!raw) return null;
        const data = JSON.parse(raw);
        return {
          slot,
          savedAt: data.savedAt || '',
          savedAtTs: Number(data.savedAtTs) || 0,
          savedSeq: Number(data.savedSeq) || 0,
          level: data.player ? data.player.level : 1,
          coins: data.coins || 0,
          plots: data.unlockedPlots ? data.unlockedPlots.length : 1,
          dungeons: data.clearedDungeons ? data.clearedDungeons.length : 0
        };
      } catch {
        return null;
      }
    }

    serialize(game) {
      SaveSystem._saveCounter = (SaveSystem._saveCounter || 0) + 1;
      // Never persist dungeon-space coordinates: they are meaningless in the overworld.
      // While inside a dungeon we store the overworld gate position instead, so a
      // mid-run reload (autosave / pause save) never drops the hero on a blocked or
      // water tile with no way out.
      const dungeon = game.activeDungeon || null;
      const playerSnapshot = { ...game.player };
      if (dungeon) {
        const rp = dungeon.returnPos || {};
        if (Number.isFinite(rp.x) && Number.isFinite(rp.y)) {
          playerSnapshot.x = rp.x;
          playerSnapshot.y = rp.y;
        }
        playerSnapshot.dashTimer = 0;
        playerSnapshot.invuln = 0;
      }
      return {
        version: 1,
        savedAt: new Date().toLocaleString('es-ES'),
        savedAtTs: Date.now(),
        savedSeq: SaveSystem._saveCounter,
        inDungeon: !!dungeon,
        dungeonId: dungeon ? dungeon.id : null,
        player: playerSnapshot,
        coins: game.coins,
        dayTime: game.dayTime,
        dayCount: game.dayCount,
        dayDuration: game.dayDuration || 660,
        inventory: { ...game.inventory },
        hotbar: [...game.hotbar],
        activeSlot: game.activeSlot,
        toolTiers: { ...game.toolTiers },
        armorTiers: { ...(game.armorTiers || {}) },
        equipped: { ...game.equipped },
        toolEnchants: JSON.parse(JSON.stringify(game.toolEnchants || {})),
        armorEnchants: JSON.parse(JSON.stringify(game.armorEnchants || {})),
        permanentRelics: [...(game.permanentRelics || [])],
        unlockedSpells: [...(game.unlockedSpells || ['misil_arcano'])],
        spellSlots: [...(game.spellSlots || ['misil_arcano', null, null, null])],
        spellCooldowns: Object.fromEntries(
          Object.entries(game.spellCooldowns || {})
            .filter(([, rem]) => typeof rem === 'number' && rem > 0.05)
            .map(([sid, rem]) => [sid, Number(rem.toFixed(2))])
        ),
        unlockedPlots: game.unlockedPlots.map(p => [...p]),
        unlockedSkills: [...game.unlockedSkills],
        storyIndex: game.storyIndex,
        npcQuestProgress: { ...game.npcQuestProgress },
        claimedContracts: [...(game.claimedContracts || [])],
        clearedDungeons: [...game.clearedDungeons],
        dungeonIntroSeen: !!game.dungeonIntroSeen,
        unlockedAchievements: [...game.unlockedAchievements],
        encyclopedia: {
          items: [...game.encyclopedia.items],
          enemies: [...game.encyclopedia.enemies],
          buildings: [...game.encyclopedia.buildings],
          relics: [...(game.encyclopedia.relics || [])],
          enchants: [...(game.encyclopedia.enchants || [])],
          altars: [...(game.encyclopedia.altars || [])]
        },
        stats: Balaclava.Utils.deepClone(game.stats),
        buildings: game.buildings.map(b => ({
          id: b.id, type: b.type, tx: b.tx, ty: b.ty, level: b.level,
          timer: b.timer, fuel: b.fuel, coinsStored: b.coinsStored,
          storage: { ...b.storage }, autoRefuel: b.autoRefuel, autoPull: b.autoPull,
          queue: b.queue ? [...b.queue] : []
        })),
        worldSeed: game.world.worldSeed,
        plotBiomes: game.world.plotBiomes ? game.world.plotBiomes.map(r => [...r]) : null,
        plotElevation: game.world.plotElevation ? game.world.plotElevation.map(r => [...r]) : null,
        dungeonGatePlots: game.world.dungeonGatePlots ? { ...game.world.dungeonGatePlots } : null,
        altarPlots: game.world.altarPlots ? { ...game.world.altarPlots } : null,
        easterEggPlots: game.world.easterEggPlots ? { ...game.world.easterEggPlots } : null,
        secretChestPlots: game.world.secretChestPlots ? { ...game.world.secretChestPlots } : null,
        skeletonKingPlot: game.world.skeletonKingPlot ? [...game.world.skeletonKingPlot] : null,
        npcPlots: game.world.npcPlots ? { ...game.world.npcPlots } : null,
        npcOffsets: game.world.npcOffsets ? { ...game.world.npcOffsets } : null,
        terraformedTiles: Array.isArray(game.world.terraformedTiles) ? game.world.terraformedTiles.map(p => [...p]) : [],
        worldTilesOverrides: this.extractModifiedTiles(game.world),
        nodes: game.world.nodes.map(n => ({ ...n })),
        crops: game.world.crops.map(c => ({ ...c })),
        sheep: game.world.sheep.map(s => ({ ...s })),
        dailyChallenges: game.events.dailyChallenges.map(c => ({ ...c })),
        craftQueue: Array.isArray(game.craftQueue) ? game.craftQueue.map(q => ({ ...q })) : [],
        craftReady: Array.isArray(game.craftReady) ? game.craftReady.map(r => ({ ...r })) : [],
        market: game.economy ? {
          stock: (game.economy.marketStock || []).slice(0, 5),
          sellContracts: (game.economy.sellContracts || []).slice(0, 5),
          refreshTimer: game.economy.refreshTimer || 900
        } : null,
        tutorial: (game.tutorialSys || game.tutorial) ? {
          step: (game.tutorialSys || game.tutorial).step || 0,
          done: !!(game.tutorialSys || game.tutorial).done,
          skipped: !!(game.tutorialSys || game.tutorial).skipped
        } : null,
        settings: { ...(game.settings || {}) }
      };
    }

    extractModifiedTiles(world) {
      const mods = [];
      for (let y = 0; y < world.tiles.length; y++) {
        for (let x = 0; x < world.tiles[y].length; x++) {
          const v = world.tiles[y][x];
          if (v === 2 || v === 3) {
            mods.push([x, y, v]);
          }
        }
      }
      return mods;
    }

    save(game, slot = 1, silent = true) {
      try {
        const data = this.serialize(game);
        localStorage.setItem(this.getSlotKey(slot), JSON.stringify(data));
        localStorage.setItem('balaclava_last_slot', String(slot));
        if (!silent) {
          Balaclava.Audio.play('craft');
          const tr = (Balaclava.I18n && Balaclava.I18n.t) ? Balaclava.I18n.t : null;
          game.toast(tr ? tr('hud.saveToast', { slot }) : `Game saved to Slot ${slot}.`, 'success');
        }
        return true;
      } catch (err) {
        if (!silent) {
          const tr = (Balaclava.I18n && Balaclava.I18n.t) ? Balaclava.I18n.t : null;
          game.toast(tr ? tr('toast.saveError') : 'Failed to save to local storage.', 'warn');
        }
        return false;
      }
    }

    load(game, slot = 1) {
      try {
        const raw = localStorage.getItem(this.getSlotKey(slot));
        if (!raw) return false;
        const data = JSON.parse(raw);
        this.applySaveData(game, data);
        game.currentSlot = slot;
        localStorage.setItem('balaclava_last_slot', String(slot));
        const tr = (Balaclava.I18n && Balaclava.I18n.t) ? Balaclava.I18n.t : null;
        game.toast(tr ? tr('toast.saveLoaded', { slot }) : `Game loaded (Slot ${slot}).`, 'success');
        return true;
      } catch {
        return false;
      }
    }

    applySaveData(game, data) {
      game.world.initNewWorld(data.worldSeed || null);
      const gridN = Balaclava.CONST.GRID_PLOTS || 10;
      if (Array.isArray(data.plotBiomes) && data.plotBiomes.length === gridN) game.world.plotBiomes = data.plotBiomes;
      if (Array.isArray(data.plotElevation) && data.plotElevation.length === gridN) game.world.plotElevation = data.plotElevation;
      if (data.dungeonGatePlots) game.world.dungeonGatePlots = data.dungeonGatePlots;
      if (data.altarPlots) game.world.altarPlots = data.altarPlots;
      if (data.easterEggPlots) game.world.easterEggPlots = data.easterEggPlots;
      if (data.secretChestPlots) game.world.secretChestPlots = data.secretChestPlots;
      if (Array.isArray(data.skeletonKingPlot)) game.world.skeletonKingPlot = [...data.skeletonKingPlot];
      if (data.npcPlots) game.world.npcPlots = data.npcPlots;
      if (data.npcOffsets) game.world.npcOffsets = data.npcOffsets;
      game.world.terraformedTiles = Array.isArray(data.terraformedTiles) ? data.terraformedTiles.map(p => [...p]) : [];
      game.unlockedPlots = [];
      if (Array.isArray(data.unlockedPlots)) {
        for (const [gx, gy] of data.unlockedPlots) {
          if (gx >= 0 && gx < gridN && gy >= 0 && gy < gridN) {
            game.world.plotUnlocked[gy][gx] = true;
            game.unlockedPlots.push([gx, gy]);
          }
        }
      }
      if (Array.isArray(data.worldTilesOverrides)) {
        for (const [x, y, v] of data.worldTilesOverrides) {
          if (game.world.tiles[y]) game.world.tiles[y][x] = v;
        }
      }
      if (Array.isArray(game.world.terraformedTiles)) {
        for (const [x, y] of game.world.terraformedTiles) {
          if (game.world.tiles[y]) game.world.tiles[y][x] = 1;
        }
      }
      if (typeof game.world.stitchUnlockedBorders === 'function') {
        game.world.stitchUnlockedBorders();
      }
      if (typeof game.world.ensureNpcLandPads === 'function') {
        game.world.ensureNpcLandPads();
      }
      if (Array.isArray(data.nodes)) game.world.nodes = data.nodes;
      if (typeof game.world.normalizeMineralNodeHardness === 'function') {
        game.world.normalizeMineralNodeHardness();
      }
      if (typeof game.world.ensureStructureCenteringAndLandPads === 'function') {
        game.world.ensureStructureCenteringAndLandPads();
      }
      if (Array.isArray(data.crops)) game.world.crops = data.crops;
      if (Array.isArray(data.sheep)) game.world.sheep = data.sheep;

      game.player = { ...game.makeInitialPlayer(), ...data.player };
      if ((game.player.deadTimer || 0) > 0 || (game.player.hp || 0) <= 0) {
        game.player.deadTimer = 0;
        game.player.hp = Math.max(1, game.player.maxHp || 100);
        game.player.energy = Math.max(1, game.player.maxEnergy || 100);
      }
      game.coins = data.coins || 0;
      game.dayTime = typeof data.dayTime === 'number' ? data.dayTime : 0.035;
      game.dayCount = data.dayCount || 1;
      game.dayDuration = 660;
      game.inventory = data.inventory || {};
      game.toolTiers = { ...game.toolTiers, ...(data.toolTiers || {}) };
      if (game.player) {
        game.player.bowLoaded = ((game.inventory && game.inventory.flecha) || 0) > 0;
        game.player.bowReloadTimer = 0;
        game.player.bowNeedsAutoReload = false;
      }
      if (game.toolTiers.azada === undefined) game.toolTiers.azada = null;
      if (Array.isArray(data.hotbar)) {
        game.hotbar = data.hotbar.slice(0, 9).map(s => {
          if (s && s.kind === 'tool' && !game.toolTiers[s.id]) return null;
          return s;
        });
      }
      while (game.hotbar.length < 9) game.hotbar.push(null);
      if (game.hotbar.length > 9) game.hotbar.length = 9;
      game.activeSlot = Math.max(0, Math.min(8, data.activeSlot || 0));
      game.equipped = { ...game.equipped, ...(data.equipped || {}) };
      game.armorTiers = { helm: null, armor: null, shield: null, boots: null, ...(data.armorTiers || {}) };
      if (typeof game.syncArmorTiersFromGear === 'function') game.syncArmorTiersFromGear();
      game.toolEnchants = data.toolEnchants || {};
      game.armorEnchants = data.armorEnchants || {};
      game.permanentRelics = Array.isArray(data.permanentRelics) ? [...data.permanentRelics] : [];
      game.unlockedSpells = Array.isArray(data.unlockedSpells) && data.unlockedSpells.length
        ? [...new Set(data.unlockedSpells)]
        : ['misil_arcano'];
      game.spellSlots = Array.isArray(data.spellSlots)
        ? data.spellSlots.slice(0, 4)
        : ['misil_arcano', null, null, null];
      while (game.spellSlots.length < 4) game.spellSlots.push(null);
      game.spellCooldowns = {};
      if (data.spellCooldowns && typeof data.spellCooldowns === 'object') {
        Object.entries(data.spellCooldowns).forEach(([sid, rem]) => {
          if (typeof rem === 'number' && rem > 0.05) {
            game.spellCooldowns[sid] = rem;
          }
        });
      }
      game.unlockedSkills = data.unlockedSkills || [];
      game.storyIndex = data.storyIndex || 0;
      game.npcQuestProgress = data.npcQuestProgress || {};
      game.claimedContracts = Array.isArray(data.claimedContracts) ? [...data.claimedContracts] : [];
      game.clearedDungeons = data.clearedDungeons || [];
      game.dungeonIntroSeen = !!data.dungeonIntroSeen;
      game.unlockedAchievements = data.unlockedAchievements || [];
      if (data.encyclopedia) {
        game.encyclopedia.items = new Set(data.encyclopedia.items || []);
        game.encyclopedia.enemies = new Set(data.encyclopedia.enemies || []);
        game.encyclopedia.buildings = new Set(data.encyclopedia.buildings || []);
        game.encyclopedia.relics = new Set(data.encyclopedia.relics || game.permanentRelics || []);
        game.encyclopedia.enchants = new Set(data.encyclopedia.enchants || []);
        game.encyclopedia.altars = new Set(data.encyclopedia.altars || []);
      }
      if (typeof game.syncEncyclopedia === 'function') game.syncEncyclopedia();
      if (data.stats) game.stats = { ...game.makeInitialStats(), ...data.stats };
      game.buildings = (data.buildings || []).map(b => ({ ...b, storage: b.storage || {}, queue: b.queue || [] }));
      // Safety net for old/aborted saves: if the stored position is not standable in the
      // overworld (e.g. it was captured while inside a dungeon), snap to the nearest safe
      // tile so the hero can never load stuck on water, void or a building. This also
      // rescues legacy saves written by builds that persisted dungeon-space coordinates.
      if (typeof game.findSafeOverworldSpawn === 'function') {
        const safe = game.findSafeOverworldSpawn(game.player.x, game.player.y);
        game.player.x = safe.x;
        game.player.y = safe.y;
        game.player.dashTimer = 0;
      }
      // The save was written mid-dungeon: the run cannot be resumed, so tell the player
      // they were pulled back to the surface (instead of silently teleporting them).
      if (data.inDungeon && typeof game.toast === 'function') {
        const msg = (Balaclava.I18n && typeof Balaclava.I18n.t === 'function')
          ? Balaclava.I18n.t('toast.dungeonRescued')
          : 'Fuiste devuelto sano y salvo a la superficie.';
        game.toast(msg, 'warn');
      }
      if (Array.isArray(data.dailyChallenges)) game.events.dailyChallenges = data.dailyChallenges;
      game.craftQueue = Array.isArray(data.craftQueue) ? data.craftQueue.map(q => ({ ...q })) : [];
      game.craftReady = Array.isArray(data.craftReady) ? data.craftReady.map(r => ({ ...r })) : [];
      let persistedLang = null;
      let persistedScale = null;
      try {
        persistedLang = localStorage.getItem('balaclava_lang');
        persistedScale = localStorage.getItem('balaclava_ui_scale');
      } catch (e) {}
      game.settings = {
        screenShake: true,
        waterAnim: true,
        waterStyle: 'clasico',
        waterSpeed: 'normal',
        treeSway: true,
        particles: true,
        floatingText: true,
        showHitbox: true,
        lang: (persistedLang === 'en' || persistedLang === 'es') ? persistedLang : 'en',
        uiScale: UI_SCALE_PRESETS.includes(Number(persistedScale)) ? Number(persistedScale) : 1,
        ...(data.settings || {})
      };
      if (persistedLang === 'en' || persistedLang === 'es') game.settings.lang = persistedLang;
      if (UI_SCALE_PRESETS.includes(Number(persistedScale))) game.settings.uiScale = Number(persistedScale);
      if (Balaclava.I18n && Balaclava.I18n.getLanguage() !== game.settings.lang) {
        Balaclava.I18n.setLanguage(game.settings.lang, { persist: false });
      }
      if (Balaclava.UI && typeof Balaclava.UI.applyUiScale === 'function') {
        Balaclava.UI.applyUiScale(game.settings.uiScale, { persist: false });
      }
      if (data.market && game.economy) {
        if (Array.isArray(data.market.stock) && data.market.stock.length) game.economy.marketStock = data.market.stock.slice(0, 5);
        if (Array.isArray(data.market.sellContracts) && data.market.sellContracts.length) game.economy.sellContracts = data.market.sellContracts.slice(0, 5);
        if (Number.isFinite(data.market.refreshTimer)) game.economy.refreshTimer = data.market.refreshTimer;
      }
      // Restaurar progreso del tutorial exclusivo de esta partida
      if (game.tutorialSys || game.tutorial) {
        const tut = game.tutorialSys || game.tutorial;
        if (data.tutorial) {
          tut.step = Math.max(0, Number(data.tutorial.step) || 0);
          tut.done = !!data.tutorial.done;
          tut.skipped = !!data.tutorial.skipped;
        } else {
          tut.step = 0;
          tut.done = false;
          tut.skipped = false;
        }
        tut.stepState = {};
        tut.minimized = false;
      }
      // Las preferencias globales de Audio SIEMPRE se respetan y no se sobreescriben por la partida
      if (Balaclava.Audio && typeof Balaclava.Audio.loadPrefs === 'function') {
        Balaclava.Audio.loadPrefs();
      }
      game.activeDungeon = null;
      if (typeof game.resetAmbientParticles === 'function') game.resetAmbientParticles();
      game.recomputeModifiers();
    }

    exportJSON(game) {
      const data = JSON.stringify(this.serialize(game), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balaclava_save_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      game.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.saveExported') : 'Archivo de partida exportado.', 'success');
    }

    importJSON(game, jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        if (!data || typeof data !== 'object' || !data.player) throw new Error('invalid');
        this.applySaveData(game, data);
        this.save(game, game.currentSlot || 1, true);
        game.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.saveImported') : 'Partida importada correctamente.', 'success');
        return true;
      } catch {
        game.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.invalidSaveFile') : 'Archivo de guardado inválido.', 'warn');
        return false;
      }
    }
  }

  Balaclava.SaveSystem = SaveSystem;
})();
