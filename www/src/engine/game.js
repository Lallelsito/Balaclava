(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { TILE_SIZE, PLOT_TILES, GRID_PLOTS, WORLD_TILES, WORLD_PX, BIOMES, RARITIES } = Balaclava.CONST;
  const { clamp, dist, rand, randInt, pick } = Balaclava.Utils;

  class GameEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.world = new Balaclava.WorldManager();
      this.farming = new Balaclava.FarmingAndFishing();
      this.omega = Balaclava.OmegaSystem ? new Balaclava.OmegaSystem() : null;
      if (this.omega) Balaclava.OmegaRuntime = this.omega;
      this.automation = new Balaclava.AutomationSystem();
      this.combat = new Balaclava.CombatSystem();
      this.economy = new Balaclava.EconomySystem();
      this.events = new Balaclava.EventsSystem();
      this.tutorialSys = new Balaclava.TutorialSystem();
      this.saveSys = new Balaclava.SaveSystem();

      this.running = false;
      this.started = false;
      this.paused = false;
      this.currentSlot = 1;

      this.camera = { x: 0, y: 0, zoom: 1.26, shakeTime: 0, shakeAmp: 0 };
      this.plotUnlockAnims = [];
      this.keys = {};
      this.mouse = { sx: 0, sy: 0, wx: 0, wy: 0, down: false };
      this.time = 0;
      this.autoSaveTimer = 0;

      // Active gameplay state
      this.player = this.makeInitialPlayer();
      this.coins = 75;
      this.inventory = {};
      this.hotbar = [
        { kind: 'tool', id: 'pico' },
        { kind: 'tool', id: 'hacha' },
        null,
        null,
        null,
        null,
        null,
        null,
        { kind: 'item', id: 'bayas' }
      ];
      this.activeSlot = 0;
      this.toolTiers = {
        pico: 'basica', hacha: null, espada: null,
        pala: null, cana: null, guadana: null, arco: null, azada: null
      };
      this.dayTime = 0.035;
      this.dayCount = 1;
      this.dayDuration = 660; // 8 min dia (480s) + 3 min noche (180s)
      this.lastHintTime = 0;
      this.fxAnims = [];
      this.equipped = { armor: null, helm: null, legs: null, shield: null, boots: null, ring: null, amulet: null, relic: null, relic2: null, relic3: null };
      this.armorTiers = { helm: null, armor: null, legs: null, shield: null, boots: null };
      this.toolEnchants = {};
      this.armorEnchants = {};
      this.permanentRelics = [];
      this.corruptedClearedDungeons = [];
      this.photoMode = false;

      const C = Balaclava.CONST.CENTER_PLOT || 4;
      this.unlockedPlots = [[C, C]];
      this.unlockedSkills = [];
      this.unlockedSpells = ['misil_arcano'];
      this.spellSlots = ['misil_arcano', null, null, null];
      this.spellCooldowns = {};
      this.storyIndex = 0;
      this.npcQuestProgress = {};
      this.claimedContracts = [];
      this.clearedDungeons = [];
      this.corruptedClearedDungeons = [];
      if (this.omega) { this.omega.reset(); Balaclava.OmegaRuntime = this.omega; }
      this.dungeonIntroSeen = false;
      this.activeDungeonIntroTimer = 0;
      this.unlockedAchievements = [];
      this.encyclopedia = { items: new Set(), enemies: new Set(), buildings: new Set(), relics: new Set(), enchants: new Set(), altars: new Set() };
      this.stats = this.makeInitialStats();
      this.mods = {};

      this.buildings = [];
      this.nextBuildingId = 1;
      this.drops = [];
      this._savedOverworldDrops = null;
      this.nextDropId = 1;
      this.projectiles = [];
      this.enemyProjectiles = [];
      this.thrownBombs = [];
      this.laserBeams = [];
      this.laserCooldown = 0;
      this.particles = [];
      this.floatingTexts = [];
      this.floatingCooldowns = {};
      this.shockwaves = [];
      this.fishCatchLeaps = [];
      this.ambientParticles = [];
      this._ambientPool = [];
      this._ambientCooldowns = { firefly: 0.5, butterfly: 0.7, dust: 0.2 };
      this.levelFlashTimer = 0;
      this.levelBannerTimer = 0;
      this.levelUpSummary = null;
      this.altarNotifications = [];
      this._nextAltarNoticeId = 1;
      this.hotHeals = [];
      this.consumeCooldown = 0;
      this.stepAudioTimer = 0;
      this.activeBuffs = {}; // { speed: { mult, time }, luck: { mult, time } }
      this.pickupFeed = [];

      this.placingBuildingId = null;
      this.activeDungeon = null;
      this.toasts = [];
      this.warningBanner = null;
      this.craftQueue = [];
      this.craftReady = [];
      this.toolUpgradeCooldowns = {};
      this.armorUpgradeCooldowns = {};
      this.plotBuyPlaques = [];
      this.settings = {
        screenShake: true,
        waterAnim: true,
        waterStyle: 'clasico',
        waterSpeed: 'normal',
        treeSway: true,
        particles: true,
        floatingText: true,
        showHitbox: true
      };
      this.uiDirty = true;
      if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
        document.fonts.load('16px BalaclavaPixel').catch(() => {});
        document.fonts.load('18px BalaclavaBodyPixel').catch(() => {});
      }
    }

    makeInitialPlayer() {
      const C = Balaclava.CONST.CENTER_PLOT || 4;
      const startPlot = C * PLOT_TILES + 6;
      return {
        x: startPlot * TILE_SIZE,
        y: startPlot * TILE_SIZE,
        vx: 0, vy: 0,
        facing: 1,
        hp: 85, maxHp: 85,
        energy: 100, maxEnergy: 100,
        level: 1, xp: 0, nextXp: 48,
        skillPoints: 0,
        swingTimer: 0, swingDur: 0.25, swingTool: 'pico', swingItemId: null, swingAngle: 0,
        bowLoaded: true, bowReloadTimer: 0, bowReloadDur: 0.55, bowNeedsAutoReload: false,
        attackCount: 0,
        dashTimer: 0, dashCd: 0, dashVx: 0, dashVy: 0,
        invuln: 0,
        shieldHp: 0,
        shieldTimer: 0,
        deadTimer: 0,
        deadMax: 10.0,
        animTimer: 0,
        moving: false,
        godMode: false,
        bonusStats: {},
        skinId: (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('balaclava_player_skin')) || 'monk_yellow'
      };
    }

    makeInitialStats() {
      return {
        gatheredTotal: 0,
        craftedTotal: 0,
        kills: 0,
        killsByBiome: {},
        coinsEarned: 30,
        cropsHarvested: 0,
        fishCaught: 0,
        meteorsMined: 0,
        altarsUsed: 0,
        secretsFound: 0,
        craftedCore: false,
        byItem: {}
      };
    }

    startNewGame(slot = 1) {
      const C = Balaclava.CONST.CENTER_PLOT || 4;
      this.currentSlot = slot;
      this.world.initNewWorld();
      this.player = this.makeInitialPlayer();
      this.camera.zoom = 1.26;
      this.plotUnlockAnims = [];
      this.coins = 30;
      this.dayTime = 0.035;
      this.dayCount = 1;
      this.dayDuration = 660;
      this.fxAnims = [];
      this.inventory = { bayas: 4, semillas: 2 };
      this.pickupFeed = [];
      this.hotbar = [
        { kind: 'tool', id: 'pico' },
        { kind: 'tool', id: 'hacha' },
        null,
        null,
        null,
        null,
        null,
        null,
        { kind: 'item', id: 'bayas' }
      ];
      this.activeSlot = 0;
      this.toolTiers = {
        pico: 'basica', hacha: 'basica', espada: null,
        pala: null, cana: null, guadana: null, arco: null, azada: null
      };
      this.lastHintTime = 0;
      this.equipped = { armor: null, helm: null, legs: null, shield: null, boots: null, ring: null, amulet: null, relic: null, relic2: null, relic3: null };
      this.armorTiers = { helm: null, armor: null, legs: null, shield: null, boots: null };
      this.toolEnchants = {};
      this.armorEnchants = {};
      this.permanentRelics = [];
      this.corruptedClearedDungeons = [];
      this.photoMode = false;
      this.unlockedPlots = [[C, C]];
      this.unlockedSkills = [];
      this.unlockedSpells = ['misil_arcano'];
      this.spellSlots = ['misil_arcano', null, null, null];
      this.spellCooldowns = {};
      this.storyIndex = 0;
      this.npcQuestProgress = {};
      this.claimedContracts = [];
      this.clearedDungeons = [];
      this.corruptedClearedDungeons = [];
      if (this.omega) { this.omega.reset(); Balaclava.OmegaRuntime = this.omega; }
      this.dungeonIntroSeen = false;
      this.activeDungeonIntroTimer = 0;
      this.unlockedAchievements = [];
      this.encyclopedia = { items: new Set(['madera', 'piedra', 'bayas', 'semillas']), enemies: new Set(), buildings: new Set(), relics: new Set(), enchants: new Set(), altars: new Set() };
      this.stats = this.makeInitialStats();
      this.buildings = [];
      this.drops = [];
      this._savedOverworldDrops = null;
      this.nextDropId = 1;
      this.projectiles = [];
      this.enemyProjectiles = [];
      this.thrownBombs = [];
      this.laserBeams = [];
      this.laserCooldown = 0;
      this.particles = [];
      this.floatingTexts = [];
      this.floatingCooldowns = {};
      this.shockwaves = [];
      this.fishCatchLeaps = [];
      this.resetAmbientParticles();
      this.levelFlashTimer = 0;
      this.levelBannerTimer = 0;
      this.levelUpSummary = null;
      this.altarNotifications = [];
      this._nextAltarNoticeId = 1;
      this.hotHeals = [];
      this.consumeCooldown = 0;
      this.activeBuffs = {};
      if (this.events) {
        this.events.eventTimer = 45;
        this.events.activeEvent = null;
        this.events.dailyChallenges = this.events.generateDailyChallenges();
      }
      this.stepAudioTimer = 0;
      this.activeDungeon = null;
      this.placingBuildingId = null;
      this.combat.enemies = [];
      this.economy.refreshStock(1);
      if (this.tutorialSys) {
        this.tutorialSys.step = 0;
        this.tutorialSys.done = false;
        this.tutorialSys.skipped = false;
        this.tutorialSys.stepState = {};
        this.tutorialSys.minimized = false;
      } else if (Balaclava.TutorialSystem) {
        this.tutorialSys = new Balaclava.TutorialSystem();
      }
      this.recomputeModifiers();

      this.camera.x = this.player.x;
      this.camera.y = this.player.y;
      this.started = true;
      this.paused = false;
      this.warningBanner = null;
      this.craftQueue = [];
      this.craftReady = [];
      this.toolUpgradeCooldowns = {};
      this.armorUpgradeCooldowns = {};
      this.plotBuyPlaques = [];
      this.uiDirty = true;

      // Iniciar prólogo cinematográfico para el despertar del nuevo mundo
      this.introCinematic = {
        active: true,
        step: 0,
        timer: 0,
        fade: 1.0,
        bands: 1.0,
        closing: false
      };

      // Soltar Botella con Mensaje Secreto en la orilla cerca del jugador náufrago
      this.drops.push({
        id: this.nextDropId++,
        itemId: 'botella_mensaje',
        qty: 1,
        amount: 1,
        x: this.player.x + 36,
        y: this.player.y + 12,
        life: 0.5,
        vx: 0,
        vy: 0
      });

      this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.starterTip') : '¡Comienzas con tu Pico y Hacha listos para explorar!', 'info');
      this.saveSys.save(this, this.currentSlot, true);
      if (Balaclava.actualizarDiscord) Balaclava.actualizarDiscord(true);
    }

    recomputeModifiers() {
      const m = {
        chopSpeed: 0, mineSpeed: 0, extraDrop: 0, doubleDropChance: 0, gemFinder: 0, gatherPower: 0,
        sellBonus: 0, coinDropBonus: 0, landDiscount: 0, craftSpeed: 0, cookSpeed: 0, fishWindow: 0, passiveCoinBonus: 0, marketDiscount: 0,
        maxHp: 0, regen: 0, energyRegen: 0, dmgBonus: 0, attackSpeed: 0, critChance: 0, shockwave: false, bossDmg: 0, killHeal: 0,
        craftXp: 0, machineSpeed: 0, buildDiscount: 0, doubleCraft: 0, freeFuel: false,
        moveSpeed: 0, maxEnergy: 0, luckBonus: 0, eventRate: 0, magnetBonus: 0, energySave: 0, dashBonus: 0, xpBonus: 0,
        nightVision: 0, def: 0, defPct: 0, lightRadius: 0, thorns: 0, enchantSlotBonus: 0,
        spellPower: 0, spellCdRed: 0, manaSave: 0, bossDmgBonus: 0, dodgeChance: 0, frostSlowChance: 0, burnDmg: 0
      };

      for (const sid of this.unlockedSkills) {
        const s = Balaclava.SKILLS[sid];
        if (!s || !s.effect) continue;
        for (const [k, v] of Object.entries(s.effect)) {
          if (typeof v === 'boolean') m[k] = v;
          else if (k === 'def' && typeof v === 'number' && v > 0 && v < 1) m.defPct = (m.defPct || 0) + v;
          else m[k] = (m[k] || 0) + v;
        }
      }

      // Natural cosmic haste from constellation mastery (+0.5% spell cooldown reduction per unlocked skill, up to +25%)
      if (Array.isArray(this.unlockedSkills) && this.unlockedSkills.length > 0) {
        m.spellCdRed = (m.spellCdRed || 0) + Math.min(0.25, this.unlockedSkills.length * 0.005);
      }

      // Equipment stats across Armor, Helm, Shield, Boots, Ring, Amulet & Relic
      for (const eqId of Object.values(this.equipped || {})) {
        if (!eqId) continue;
        const item = Balaclava.ITEMS[eqId];
        const st = item && (item.stats || item.bonus);
        if (!st) continue;
        if (st.def) {
          if (st.def > 0 && st.def < 1) m.defPct = (m.defPct || 0) + st.def;
          else m.def += st.def;
        }
        if (st.maxHp) m.maxHp += st.maxHp;
        if (st.maxEnergy) m.maxEnergy = (m.maxEnergy || 0) + st.maxEnergy;
        if (st.energyRegen) m.energyRegen = (m.energyRegen || 0) + st.energyRegen;
        if (st.dmgPct || st.dmgBonus) m.dmgBonus += (st.dmgPct || st.dmgBonus || 0);
        if (st.speedPct || st.moveSpeed) m.moveSpeed += (st.speedPct || st.moveSpeed || 0);
        if (st.coinPct || st.coinDropBonus) m.coinDropBonus += (st.coinPct || st.coinDropBonus || 0);
        if (st.luckPct || st.luckBonus) m.luckBonus += (st.luckPct || st.luckBonus || 0);
        if (st.critBonus || st.critPct || st.critChance) m.critChance += (st.critBonus || 0) + (st.critPct || 0) + (st.critChance || 0);
        if (st.magnetRadius || st.magnetBonus) m.magnetBonus += (st.magnetRadius || st.magnetBonus || 0);
        if (st.gatherPct) m.gatherPower += st.gatherPct;
        if (st.lightRadius) m.lightRadius += st.lightRadius;
        if (st.spellResist) m.spellResist = (m.spellResist || 0) + st.spellResist;
        if (st.energySave) m.energySave = (m.energySave || 0) + st.energySave;
        if (st.killHeal) m.killHeal = (m.killHeal || 0) + st.killHeal;
        if (st.spellPower) m.spellPower += st.spellPower;
        if (st.spellCdRed) m.spellCdRed += st.spellCdRed;
        if (st.manaSave) m.manaSave += st.manaSave;
        if (st.bossDmg || st.bossDmgBonus) m.bossDmgBonus += (st.bossDmg || 0) + (st.bossDmgBonus || 0);
        if (st.dodgeChance) m.dodgeChance += st.dodgeChance;
        if (st.thorns) m.thorns += st.thorns;
      }

      // Backpack capacity & stack bonuses
      let bpSlots = 0, bpStack = 0;
      const bpEquipped = this.equipped && this.equipped.backpack && Balaclava.ITEMS[this.equipped.backpack];
      if (bpEquipped && bpEquipped.backpackBonus) {
        bpSlots = bpEquipped.backpackBonus.slots || 0;
        bpStack = bpEquipped.backpackBonus.stack || 0;
      } else if (this.inventory) {
        if (this.inventory.mochila_astral > 0 && Balaclava.ITEMS.mochila_astral) {
          bpSlots = Balaclava.ITEMS.mochila_astral.backpackBonus.slots;
          bpStack = Balaclava.ITEMS.mochila_astral.backpackBonus.stack;
        } else if (this.inventory.mochila_reforzada > 0 && Balaclava.ITEMS.mochila_reforzada) {
          bpSlots = Balaclava.ITEMS.mochila_reforzada.backpackBonus.slots;
          bpStack = Balaclava.ITEMS.mochila_reforzada.backpackBonus.stack;
        } else if (this.inventory.mochila_cuero > 0 && Balaclava.ITEMS.mochila_cuero) {
          bpSlots = Balaclava.ITEMS.mochila_cuero.backpackBonus.slots;
          bpStack = Balaclava.ITEMS.mochila_cuero.backpackBonus.stack;
        }
      }
      m.backpackSlots = bpSlots;
      m.backpackStack = bpStack;

      // Passive spell Power bonus when holding a staff/wand in active hotbar slot
      const actSlot = this.hotbar && this.hotbar[this.activeSlot];
      const actItem = actSlot && actSlot.kind === 'item' ? Balaclava.ITEMS[actSlot.id] : null;
      if (actItem && actItem.isStaffWeapon) {
        m.spellPower += actItem.id === 'baculo_rubi' ? 0.25 : actItem.id === 'baculo_lunar' ? 0.18 : 0.12;
      }

      // Equipped armor/helm/shield/boots/ring/amulet enchantments (uses perLevel)
      for (const eqPiece of Object.values(this.equipped || {})) {
        if (eqPiece && this.armorEnchants && this.armorEnchants[eqPiece]) {
          const ae = this.armorEnchants[eqPiece];
          for (const [eid, lvl] of Object.entries(ae)) {
            const def = Balaclava.ARMOR_ENCHANTS && Balaclava.ARMOR_ENCHANTS[eid];
            const src = def && (def.perLevel || def.effect);
            if (!src || lvl <= 0) continue;
            for (const [k, v] of Object.entries(src)) {
              if (typeof v === 'number') m[k] = (m[k] || 0) + v * lvl;
            }
          }
        }
      }

      // Active/all unlocked tool passive magnetBonus if enchanted with Alcance
      if (this.toolEnchants) {
        const activeSlot = this.hotbar && this.hotbar[this.activeSlot];
        const activeToolId = activeSlot && activeSlot.kind === 'tool' ? activeSlot.id : null;
        if (activeToolId && this.toolEnchants[activeToolId] && this.toolEnchants[activeToolId].alcance) {
          m.magnetBonus += 35 * this.toolEnchants[activeToolId].alcance;
        }
      }

      // Permanent boss-dropped passive relics
      if (Array.isArray(this.permanentRelics) && Balaclava.PERMANENT_RELICS) {
        for (const rid of this.permanentRelics) {
          const rel = Balaclava.PERMANENT_RELICS[rid];
          if (!rel || !rel.effect) continue;
          for (const [k, v] of Object.entries(rel.effect)) {
            if (typeof v === 'boolean') m[k] = v;
            else if (k === 'def' && typeof v === 'number' && v > 0 && v < 1) m.defPct = (m.defPct || 0) + v;
            else if (k === 'powerMult') m.gatherPower += v;
            else if (k === 'doubleChance') m.doubleDropChance += v;
            else if (k === 'speedMult') m.attackSpeed += v;
            else m[k] = (m[k] || 0) + v;
          }
        }
      }

      // Monument & Library global building auras (scaled by building upgrade level 1..3)
      for (const b of this.buildings) {
        const def = Balaclava.BUILDINGS[b.type];
        if (!def) continue;
        const lvl = Math.max(1, Number(b.level) || 1);
        const lvlMult = 1 + (lvl - 1) * 0.45;
        if (def.auraDmg) m.dmgBonus += +(def.auraDmg * lvlMult).toFixed(4);
        if (def.auraSpeed) m.moveSpeed += +(def.auraSpeed * lvlMult).toFixed(4);
        if (def.auraLuck) m.luckBonus += +(def.auraLuck * lvlMult).toFixed(4);
        if (def.xpBonus) m.xpBonus += +(def.xpBonus * lvlMult).toFixed(4);
        if (def.auraXp) m.xpBonus += +(def.auraXp * lvlMult).toFixed(4);
        if (def.auraSpellPower) m.spellPower += +(def.auraSpellPower * lvlMult).toFixed(4);
      }

      // Active potions / altar buffs / spells
      if (this.activeBuffs.speed) m.moveSpeed += (this.activeBuffs.speed.mult - 1);
      if (this.activeBuffs.luck) m.luckBonus += (this.activeBuffs.luck.mult - 1);
      if (this.activeBuffs.dmg) m.dmgBonus += (this.activeBuffs.dmg.mult - 1);
      if (this.activeBuffs.xp) m.xpBonus += (this.activeBuffs.xp.mult - 1);
      if (this.activeBuffs.arcane) {
        m.spellPower += (this.activeBuffs.arcane.mult - 1);
        m.energyRegen += 2.2;
        m.spellCdRed += 0.15;
      }
      if (this.activeBuffs.hunter) {
        m.critChance += (this.activeBuffs.hunter.mult - 1);
        m.attackSpeed += 0.22;
      }
      if (this.activeBuffs.furia_arcana) {
        m.dmgBonus += 0.30;
        m.spellPower += 0.30;
        m.moveSpeed += 0.25;
      }

      if (this.player && this.player.bonusStats) {
        Object.entries(this.player.bonusStats).forEach(([statKey, statVal]) => {
          const num = Number(statVal);
          if (Number.isFinite(num) && num !== 0) {
            m[statKey] = (m[statKey] || 0) + num;
          }
        });
      }

      // Dynamic daily events active modifiers
      if (this.events && this.events.activeEvent) {
        const evId = this.events.activeEvent.id;
        if (evId === 'viento_favorable') m.moveSpeed += 0.30;
        if (evId === 'anomalia_temporal') m.machineSpeed += 1.0;
      }

      // Omega equipment set bonuses & research bonuses
      if (this.omega && typeof this.omega.applyEquipMods === 'function') {
        this.omega.applyEquipMods(this, m);
      }

      // Soft-caps and diminishing returns for attack speed and bonus damage
      const rawAtkSpd = m.attackSpeed;
      if (rawAtkSpd > 0.45) {
        m.attackSpeed = 0.45 + 0.65 * (1 - Math.exp(-(rawAtkSpd - 0.45) / 0.75));
      }
      const rawDmg = m.dmgBonus;
      if (rawDmg > 0.80) {
        m.dmgBonus = 0.80 + 1.10 * Math.log10(1 + (rawDmg - 0.80));
      }

      this.mods = m;
      this.player.maxHp = Math.max(10, 85 + m.maxHp + (this.player.level - 1) * 4);
      this.player.maxEnergy = Math.max(10, 100 + m.maxEnergy + (this.player.level - 1) * 4);
      this.player.hp = Math.min(this.player.hp, this.player.maxHp);
      this.player.energy = Math.min(this.player.energy, this.player.maxEnergy);
    }

    hasBuilding(buildingId) {
      return this.buildings.some(b => b.type === buildingId);
    }

    hasCraftingStructureBuilt() {
      return this.buildings.some(b => {
        const d = Balaclava.BUILDINGS[b.type];
        return d && (d.station || d.opensPanel === 'crafting');
      });
    }

    hasPermanentRelic(relicId) {
      return Array.isArray(this.permanentRelics) && this.permanentRelics.includes(relicId);
    }

    unlockPermanentRelic(relicId) {
      const rel = Balaclava.PERMANENT_RELICS && Balaclava.PERMANENT_RELICS[relicId];
      if (!rel) return false;
      if (!Array.isArray(this.permanentRelics)) this.permanentRelics = [];
      if (this.permanentRelics.includes(relicId)) return false;
      this.permanentRelics.push(relicId);
      this.recordEncyclopedia('relics', relicId);
      this.recomputeModifiers();
      Balaclava.Audio.play('levelup');
      this.spawnParticles(this.player.x, this.player.y, '#ffd54f', 26);
      this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.relicUnlocked', { name: rel.name, desc: rel.desc }) : `¡Reliquia Permanente obtenida: ${rel.name}! ${rel.desc}`, 'success');
      this.uiDirty = true;
      return true;
    }

    getMaxInventorySlots() {
      const base = 25;
      const skillSlots = (this.mods && this.mods.invSlotBonus) || (this.modifiers && this.modifiers.invSlotBonus) || 0;
      const bpSlots = (this.mods && this.mods.backpackSlots) || (this.modifiers && this.modifiers.backpackSlots) || 0;
      return Math.min(80, Math.max(25, base + skillSlots + bpSlots));
    }

    getMaxStackSize() {
      const base = 25;
      const skillStack = (this.mods && this.mods.stackBonus) || (this.modifiers && this.modifiers.stackBonus) || 0;
      const bpStack = (this.mods && this.mods.backpackStack) || (this.modifiers && this.modifiers.backpackStack) || 0;
      return Math.min(100, Math.max(25, base + skillStack + bpStack));
    }

    getUsedInventorySlots() {
      const maxStack = this.getMaxStackSize();
      let used = 0;
      for (const [id, count] of Object.entries(this.inventory || {})) {
        if (count > 0 && Balaclava.ITEMS[id]) {
          used += Math.ceil(count / maxStack);
        }
      }
      if (this.toolTiers) {
        for (const tId of Object.keys(Balaclava.TOOLS || {})) {
          if (this.toolTiers[tId]) used += 1;
        }
      }
      return used;
    }

    canAddItem(itemId, qty = 1) {
      if (!Balaclava.ITEMS[itemId] || qty <= 0) return false;
      const maxSlots = this.getMaxInventorySlots();
      const maxStack = this.getMaxStackSize();
      const usedSlots = this.getUsedInventorySlots();
      const freeSlots = Math.max(0, maxSlots - usedSlots);
      const curQty = this.inventory[itemId] || 0;
      const mod = curQty % maxStack;
      const spaceInPartial = mod === 0 ? 0 : (maxStack - mod);
      return (spaceInPartial + (freeSlots * maxStack)) >= qty;
    }

    getToolEnchantBonuses(toolId) {
      const out = { gatherMult: 0, speedMult: 0, doubleChance: 0, gemChance: 0, dmgBonus: 0, critChance: 0, autoSmelt: false, fireDmg: 0, reachBonus: 0 };
      const map = this.toolEnchants && this.toolEnchants[toolId];
      if (!map || !Balaclava.TOOL_ENCHANTS) return out;
      for (const [eid, lvl] of Object.entries(map)) {
        const def = Balaclava.TOOL_ENCHANTS[eid];
        const src = def && (def.perLevel || def.effect);
        if (!src || lvl <= 0) continue;
        for (const [k, v] of Object.entries(src)) {
          if (k === 'autoSmelt' && v) out.autoSmelt = true;
          else if (k === 'powerMult') out.gatherMult += v * lvl;
          else if (k === 'burnDmg') out.fireDmg += (v * lvl) * 0.04;
          else if (typeof v === 'number') out[k] = (out[k] || 0) + v * lvl;
        }
        if (eid === 'fortuna') out.gemChance += 0.06 * lvl;
      }
      return out;
    }

    getMaxEnchantSlots() {
      return Math.min(6, 3 + (this.mods && this.mods.enchantSlotBonus ? this.mods.enchantSlotBonus : 0));
    }

    getEnchantTableTier() {
      let tier = 0;
      for (const b of this.buildings || []) {
        if (b.type === 'mesa_encantamientos') tier = Math.max(tier, Math.min(3, b.level || 1));
      }
      if (tier <= 0) return 0;
      if (this.hasBuilding('mesa_hechiceria') || this.hasBuilding('yunque_runico')) tier = Math.max(tier, 2);
      if (this.hasBuilding('observatorio_astral') || this.hasBuilding('centro_investigacion')) tier = 3;
      return tier;
    }

    getEnchantConflict(targetKind, itemId, enchantId) {
      const catalog = targetKind === 'tool' ? Balaclava.TOOL_ENCHANTS : Balaclava.ARMOR_ENCHANTS;
      const store = targetKind === 'tool' ? (this.toolEnchants || {}) : (this.armorEnchants || {});
      const ench = catalog && catalog[enchantId];
      const existing = store[itemId] || {};
      for (const [eid, lvl] of Object.entries(existing)) {
        if (!lvl || lvl <= 0 || eid === enchantId) continue;
        const other = catalog && catalog[eid];
        if ((ench && Array.isArray(ench.incompatibleWith) && ench.incompatibleWith.includes(eid)) ||
            (other && Array.isArray(other.incompatibleWith) && other.incompatibleWith.includes(enchantId))) {
          return other ? other.name : eid;
        }
      }
      return null;
    }

    enchantItem(targetKind, itemId, enchantId) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      const tableTier = this.getEnchantTableTier();
      if (tableTier <= 0) {
        this.toast(T('toast.needEnchantTable'), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      const catalog = targetKind === 'tool' ? Balaclava.TOOL_ENCHANTS : Balaclava.ARMOR_ENCHANTS;
      const ench = catalog && catalog[enchantId];
      if (!ench) return false;
      if ((ench.reqTier || 1) > tableTier) {
        this.toast(T('toast.enchantNeedTier', { tier: ench.reqTier }), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      const conflictName = this.getEnchantConflict(targetKind, itemId, enchantId);
      if (conflictName) {
        this.toast(T('toast.enchantConflict', { name: conflictName }), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      const store = targetKind === 'tool' ? (this.toolEnchants = this.toolEnchants || {}) : (this.armorEnchants = this.armorEnchants || {});
      if (targetKind === 'tool' && !this.toolTiers[itemId]) {
        this.toast(T('toast.enchantNeedTool'), 'warn');
        return false;
      }
      const isEquipped = this.equipped && Object.values(this.equipped).includes(itemId);
      if (targetKind === 'armor' && (this.inventory[itemId] || 0) <= 0 && !isEquipped) {
        this.toast(T('toast.needOwnGear'), 'warn');
        return false;
      }
      if (!store[itemId]) store[itemId] = {};
      const curLvl = store[itemId][enchantId] || 0;
      const activeSlots = Object.values(store[itemId]).filter(v => v > 0).length;
      const maxSlots = this.getMaxEnchantSlots();
      if (curLvl === 0 && activeSlots >= maxSlots) {
        this.toast(T('toast.enchantSlotLimit', { cur: activeSlots, max: maxSlots }), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      if (curLvl >= ench.maxLevel) {
        this.toast(T('toast.enchantMaxLevel', { name: ench.name }), 'info');
        return false;
      }
      const nextLvl = curLvl + 1;
      const cost = Balaclava.getEnchantCost(targetKind, enchantId, nextLvl);
      if (!cost) return false;
      if (this.coins < cost.coins) {
        this.toast(T('toast.enchantNeedCoins', { coins: cost.coins }), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      for (const [id, q] of Object.entries(cost.items)) {
        if ((this.inventory[id] || 0) < q) {
          this.toast(T('toast.enchantMissingMat', { qty: q, name: Balaclava.ITEMS[id] ? Balaclava.ITEMS[id].name : id }), 'warn');
          Balaclava.Audio.play('error');
          return false;
        }
      }
      this.coins -= cost.coins;
      for (const [id, q] of Object.entries(cost.items)) this.removeItem(id, q);
      store[itemId][enchantId] = nextLvl;
      this.recordEncyclopedia('enchants', enchantId);
      this.recomputeModifiers();
      this.gainXp(30);
      Balaclava.Audio.play('levelup');
      this.spawnParticles(this.player.x, this.player.y, '#ce93d8', 18);
      this.toast(T('toast.enchantApplied', { name: ench.name, lvl: nextLvl }), 'success');
      this.uiDirty = true;
      return true;
    }

    // === INVENTORY & PROGRESSION ===
    pushPickupFeed(id, name, icon, qty, color = '#ffe082') {
      if (!this.started) return;
      if (!this.pickupFeed) this.pickupFeed = [];
      const existing = this.pickupFeed.find(p => p.id === id);
      if (existing) {
        existing.qty += qty;
        existing.ttl = 4.2;
      } else {
        this.pickupFeed.unshift({ id, name, icon, qty, color, ttl: 4.2 });
        if (this.pickupFeed.length > 7) this.pickupFeed.length = 7;
      }
      this.uiDirty = true;
    }

    addItem(itemId, qty = 1) {
      if (!Balaclava.ITEMS[itemId] || qty <= 0) return;

      const maxSlots = this.getMaxInventorySlots();
      const maxStack = this.getMaxStackSize();
      const usedSlots = this.getUsedInventorySlots();
      const freeSlots = Math.max(0, maxSlots - usedSlots);

      const curQty = this.inventory[itemId] || 0;
      const mod = curQty % maxStack;
      const spaceInPartial = mod === 0 ? 0 : (maxStack - mod);
      const totalFit = spaceInPartial + (freeSlots * maxStack);

      const toAdd = Math.min(qty, totalFit);
      const excess = qty - toAdd;

      if (toAdd > 0) {
        this.inventory[itemId] = curQty + toAdd;
        this.stats.byItem[itemId] = (this.stats.byItem[itemId] || 0) + toAdd;
        this.stats.gatheredTotal += toAdd;
        this.events.recordAction('gather', toAdd);
        this.recordEncyclopedia('items', itemId);
        if (itemId === 'nucleo_balaclava') this.stats.craftedCore = true;

        const it = Balaclava.ITEMS[itemId];
        const rar = RARITIES[it.rarity] || RARITIES.comun;
        const px = (this.player && this.player.x) || 0;
        const py = (this.player && this.player.y) || 0;
        this.addFloatingText(px, py - 34, `+${toAdd} ${it.name}`, rar.color);
        this.pushPickupFeed(itemId, it.name, it.icon, toAdd, rar.color);
        if (itemId === 'flecha' && this.player && !this.player.bowLoaded && (this.player.bowReloadTimer || 0) <= 0 && this.toolTiers && this.toolTiers.arco) {
          this.reloadBow(true);
        }
      }

      if (excess > 0) {
        const px = (this.player && this.player.x) || 0;
        const py = (this.player && this.player.y) || 0;
        if (typeof this.spawnDrop === 'function') {
          this.spawnDrop(px + (Math.random() - 0.5) * 18, py + (Math.random() - 0.5) * 18, itemId, excess);
        }
        if (!this._lastFullInvToast || this.time - this._lastFullInvToast > 1.2) {
          this._lastFullInvToast = this.time;
          this.toast(`Inventario lleno (${maxSlots}/${maxSlots} slots). Objeto en el suelo.`, 'warning');
        }
      }
      this.uiDirty = true;
    }

    removeItem(itemId, qty = 1) {
      const cur = this.inventory[itemId] || 0;
      if (cur < qty) return false;
      this.inventory[itemId] = cur - qty;
      if (this.inventory[itemId] <= 0) {
        delete this.inventory[itemId];
        if (Array.isArray(this.hotbar)) {
          for (let i = 0; i < this.hotbar.length; i++) {
            const s = this.hotbar[i];
            if (s && s.kind === 'item' && s.id === itemId) {
              this.hotbar[i] = null;
            }
          }
        }
        if (itemId === 'flecha' && this.player) {
          this.player.bowLoaded = false;
          this.player.bowReloadTimer = 0;
          this.player.bowNeedsAutoReload = false;
        }
      }
      this.uiDirty = true;
      return true;
    }

    getArrowCount() {
      return Math.max(0, Math.floor((this.inventory && this.inventory.flecha) || 0));
    }

    getBowReloadDuration() {
      const tier = (this.toolTiers && this.toolTiers.arco) || 'basica';
      const stats = (Balaclava.getToolStats && Balaclava.getToolStats('arco', tier)) || { speed: 1 };
      const tb = this.getToolEnchantBonuses ? this.getToolEnchantBonuses('arco') : { speedMult: 0 };
      const spdMult = Math.max(0.75, Math.sqrt(stats.speed || 1) * (1 + ((this.mods && this.mods.attackSpeed) || 0) * 0.5 + (tb.speedMult || 0) * 0.5));
      return clamp(0.56 / spdMult, 0.24, 0.65);
    }

    reloadBow(silent = false) {
      if (!this.player || this.isPlayerDead()) return false;
      if (this.toolTiers && !this.toolTiers.arco) return false;
      if ((this.player.bowReloadTimer || 0) > 0) return false;
      const arrows = this.getArrowCount();
      if (arrows <= 0) {
        this.player.bowLoaded = false;
        this.player.bowNeedsAutoReload = false;
        if (!silent && (this.time - (this._lastNoArrowWarn || -99)) >= 1.0) {
          this._lastNoArrowWarn = this.time;
          Balaclava.Audio.play('error');
          const msg = (Balaclava.I18n && Balaclava.I18n.t('toast.noArrows') !== 'toast.noArrows')
            ? Balaclava.I18n.t('toast.noArrows')
            : 'Sin flechas! Fabrica flechas en Artesania';
          this.addFloatingText(this.player.x, this.player.y - 26, msg, '#ff8a65');
          this.toast(msg, 'warn');
        }
        this.uiDirty = true;
        return false;
      }
      if (this.player.bowLoaded) return true;
      const dur = this.getBowReloadDuration();
      this.player.bowLoaded = false;
      this.player.bowReloadDur = dur;
      this.player.bowReloadTimer = dur;
      this.player.bowNeedsAutoReload = false;
      if (!silent) {
        const msg = (Balaclava.I18n && Balaclava.I18n.t('toast.bowReloading') !== 'toast.bowReloading')
          ? Balaclava.I18n.t('toast.bowReloading')
          : 'Recargando arco...';
        this.addFloatingText(this.player.x, this.player.y - 26, msg, '#ffe082');
      }
      this.uiDirty = true;
      return true;
    }

    addCoins(amount) {
      const mult = 1 + (this.mods.coinDropBonus || 0);
      const total = Math.max(1, Math.round(amount * mult));
      this.coins += total;
      this.stats.coinsEarned += total;
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      this.addFloatingText(this.player.x + 14, this.player.y - 24, T('hud.coinShort', { n: total }), '#ffd54f');
      this.pushPickupFeed('_coin', T('hud.coinsGoldName'), 'coin_gold', total, '#ffd54f');
      this.uiDirty = true;
    }

    gainXp(baseXp) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      const mult = 1 + (this.mods.xpBonus || 0);
      const gain = Math.max(1, Math.round(baseXp * mult));
      this.player.xp += gain;
      this.addFloatingText(this.player.x, this.player.y - 36, T('hud.xpGainFloat', { n: gain }), '#ffd54f');

      if (typeof document !== 'undefined') {
        const xpFrame = document.getElementById('xp-bar-frame');
        const xpOrb = document.getElementById('xp-orb-icon');
        if (xpFrame) {
          xpFrame.classList.remove('xp-bar-pulse');
          void xpFrame.offsetWidth;
          xpFrame.classList.add('xp-bar-pulse');
        }
        if (xpOrb) {
          xpOrb.classList.remove('xp-orb-bounce');
          void xpOrb.offsetWidth;
          xpOrb.classList.add('xp-orb-bounce');
        }
      }

      const oldLevel = this.player.level;
      let leveled = false;
      while (this.player.xp >= this.player.nextXp) {
        this.player.xp -= this.player.nextXp;
        this.player.level++;
        this.player.skillPoints += 1;
        const lv = this.player.level;
        this.player.nextXp = Math.round(42 + lv * 28 + Math.pow(lv, 1.65) * 16);
        this.recomputeModifiers();
        this.player.hp = this.player.maxHp;
        this.player.energy = this.player.maxEnergy;
        leveled = true;
      }
      if (leveled) {
        const ptsGained = this.player.level - oldLevel;
        this.toast(T('toast.levelUpPts', { from: oldLevel, to: this.player.level, pts: ptsGained, s: ptsGained > 1 ? 's' : '' }), 'success');
        Balaclava.Audio.play('levelup');
        Balaclava.Audio.play('thunder');
        this.shake(0.75, 14);
        this.levelFlashTimer = 1.65;
        this.levelBannerTimer = 3.2;
        this.levelUpSummary = { from: oldLevel, to: this.player.level, pts: ptsGained };
        if (typeof document !== 'undefined') {
          const lvlEl = document.getElementById('lvl-text');
          if (lvlEl) {
            lvlEl.classList.remove('lvl-crest-burst');
            void lvlEl.offsetWidth;
            lvlEl.classList.add('lvl-crest-burst');
          }
        }
        this.spawnFx('px_level_up', this.player.x, this.player.y + 8, 0, 1.35, 1.35, 1.0, { follow: this.player, offY: 8, blend: 'lighter' });
        this.spawnFx('pvfx_level_up', this.player.x, this.player.y + 6, 0, 1.4, 1.25, 0.98, { follow: this.player, offY: 6, blend: 'lighter' });
        this.spawnFx('pvfx_angel_feathers', this.player.x, this.player.y - 16, 0, 1.15, 1.15, 0.95, { blend: 'lighter' });
        this.spawnFx('pvfx_lightning_strike', this.player.x, this.player.y + 6, 0, 0.65, 1.2, 0.92, { blend: 'lighter' });
        this.spawnShockwave(this.player.x, this.player.y, 175, '#ffd54f');
        this.spawnParticles(this.player.x, this.player.y, '#ffd54f', 40);
        this.addFloatingText(this.player.x, this.player.y - 68, T('toast.levelUp', { prev: oldLevel, next: this.player.level }), '#fff176');
      }
      this.uiDirty = true;
    }

    isPlayerDead() {
      return Boolean(this.player && this.player.deadTimer > 0);
    }

    clearTransientInputs() {
      this.keys = {};
      if (this.mouse) this.mouse.down = false;
      this.placingBuildingId = null;
      this.placingItemId = null;
      this.hoveredTarget = null;
      if (this.farming && this.farming.fishing) this.farming.fishing = null;
      if (this.player) {
        this.player.moving = false;
        this.player.swingTimer = 0;
        this.player.dashTimer = 0;
      }
    }

    healPlayer(hp, energy) {
      if (this.isPlayerDead()) return;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + hp);
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + energy);
      this.uiDirty = true;
    }

    useOrEquipItem(itemId, targetWx = null, targetWy = null) {
      if (this.isPlayerDead()) return false;
      const item = Balaclava.ITEMS[itemId];
      if (!item || (this.inventory[itemId] || 0) <= 0) return false;

      if (item.teachSpell) {
        const spDef = Balaclava.SPELLS && Balaclava.SPELLS[item.teachSpell];
        if (!spDef) return false;
        if (!Array.isArray(this.unlockedSpells)) this.unlockedSpells = ['misil_arcano'];
        if (this.unlockedSpells.includes(item.teachSpell)) {
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.spellAlreadyKnown', { name: spDef.name }) : `Ya dominas el hechizo ${spDef.name}.`, 'info');
          return false;
        }
        this.removeItem(itemId, 1);
        this.unlockSpell(item.teachSpell);
        return true;
      }

      if (item.placeBuilding) {
        if (targetWx != null && targetWy != null && dist(this.player.x, this.player.y, targetWx, targetWy) <= 260) {
          const tx = Math.floor(targetWx / TILE_SIZE);
          const ty = Math.floor(targetWy / TILE_SIZE);
          this.placingBuildingId = item.placeBuilding;
          this.placingItemId = itemId;
          const ok = this.placeBuilding(item.placeBuilding, tx, ty);
          this.placingBuildingId = null;
          this.placingItemId = null;
          return ok;
        }
        this.placingBuildingId = item.placeBuilding;
        this.placingItemId = itemId;
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.placeItemHint', { name: item.name }) : `Colocando ${item.name} — Click en el mapa para situar (ESC cancela)`, 'info');
        Balaclava.UI.closeModal();
        return true;
      }

      if (item.backpackTier) {
        const curTier = this.backpackTier || 0;
        if (item.backpackTier <= curTier) {
          this.toast(`Ya posees una mochila de rango igual o superior (${item.name}).`, 'info');
          return false;
        }
        this.removeItem(itemId, 1);
        this.backpackTier = item.backpackTier;
        if (Balaclava.Audio && typeof Balaclava.Audio.play === 'function') {
          Balaclava.Audio.play('equip');
        }
        this.toast(`Mochila equipada: ${item.name} (+${item.backpackTier * 8} slots, +${item.backpackTier === 3 ? 35 : item.backpackTier * 10} stack).`, 'success');
        this.recomputeModifiers();
        this.uiDirty = true;
        return true;
      }

      if (item.equipSlot) {
        let slotKey = item.equipSlot === 'helmet' ? 'helm' : item.equipSlot;
        if (slotKey === 'relic') {
          if (this.equipped.relic && !this.equipped.relic2) slotKey = 'relic2';
          else if (this.equipped.relic && this.equipped.relic2 && !this.equipped.relic3) slotKey = 'relic3';
        }
        const prev = this.equipped[slotKey];
        this.removeItem(itemId, 1);
        if (prev) this.addItem(prev, 1);
        this.equipped[slotKey] = itemId;
        this.recomputeModifiers();
        Balaclava.Audio.play('equip');
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.equippedItem', { name: item.name }) : `Equipado: ${item.name}`, 'success');
        return true;
      }

      if (item.spellEffect) {
        this.removeItem(itemId, 1);
        const eff = item.spellEffect;
        const px = this.player.x;
        const py = this.player.y;
        const enemies = this.activeDungeon
          ? [...this.activeDungeon.enemies, ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
          : [...this.combat.enemies];
        const dmgMult = 1 + (this.mods.dmgBonus || 0) * 0.6;
        if (eff === 'fire_storm') {
          this.shake(0.32, 7);
          this.spawnShockwave(px, py, 190, '#ff7043');
          this.spawnFx('explosionLarge', px, py, 0, 0.5, 2.4, 0.92);
          this.spawnParticles(px, py, '#ff7043', 28);
          for (const e of enemies) {
            if (dist(px, py, e.x, e.y) <= 195 + (e.radius || 16)) {
              const ang = Math.atan2(e.y - py, e.x - px);
              this.combat.damageEnemy(this, e, Math.round(105 * dmgMult), ang, true);
              e.burnTimer = 4.0;
            }
          }
          Balaclava.Audio.play('explosion');
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.firestorm') : '¡Tormenta Ígnea desatada!', 'success');
        } else if (eff === 'frost_nova') {
          this.shake(0.24, 5);
          this.spawnShockwave(px, py, 200, '#4fc3f7');
          this.spawnParticles(px, py, '#80deea', 26);
          for (const e of enemies) {
            if (dist(px, py, e.x, e.y) <= 205 + (e.radius || 16)) {
              const ang = Math.atan2(e.y - py, e.x - px);
              this.combat.damageEnemy(this, e, Math.round(80 * dmgMult), ang, false);
              e.slowTimer = 5.0;
            }
          }
          Balaclava.Audio.play('levelup');
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.blizzard') : '¡Ventisca Polar congelante!', 'success');
        } else if (eff === 'return_home') {
          if (this.activeDungeon) this.exitDungeon();
          const C = Balaclava.CONST.CENTER_PLOT || 4;
          this.player.x = (C * PLOT_TILES + 6.5) * TILE_SIZE;
          this.player.y = (C * PLOT_TILES + 6.5) * TILE_SIZE;
          this.spawnParticles(this.player.x, this.player.y, '#80deea', 22);
          Balaclava.Audio.play('portal');
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.returnHome') : 'Teletransportado al campamento central.', 'info');
        } else if (eff === 'treasure_loot') {
          const coins = randInt(38, 68);
          const gem = pick(['rubi', 'zafiro', 'diamantes', 'esmeraldas', 'topacio']);
          this.addCoins(coins);
          this.addItem(gem, randInt(1, 2));
          this.gainXp(85);
          this.stats.chestsOpened = (this.stats.chestsOpened || 0) + 1;
          Balaclava.Audio.play('levelup');
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.treasureDecoded', { coins }) : `¡Tesoro descifrado! +${coins} monedas y gemas.`, 'success');
        } else if (eff === 'bottle_loot') {
          const coins = randInt(14, 30);
          const gift = pick(['perla', 'gema_marina', 'cebo_dorado', 'mapa_tesoro_item']);
          this.addCoins(coins);
          this.addItem(gift, 1);
          this.gainXp(35);
          Balaclava.Audio.play('pickup');
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.bottleOpened', { coins }) : `¡Mensaje abierto! +${coins} monedas y botín marino.`, 'success');
        } else if (eff && eff.startsWith('crack_geode_')) {
          const table = {
            crack_geode_amethyst: ['amatista', 'cristales_magicos', 'polvo_estelar', 'zafiro'],
            crack_geode_gold: ['oro', 'topacio', 'rubi', 'diamantes'],
            crack_geode_emerald: ['esmeraldas', 'jade', 'perla', 'cristales_magicos']
          };
          const pool = table[eff] || ['cristales', 'amatista'];
          const g1 = pool[0];
          const g2 = pick(pool.slice(1));
          const q1 = randInt(1, 2);
          this.addItem(g1, q1);
          this.addItem(g2, 1);
          this.gainXp(28);
          Balaclava.Audio.play('chest');
          this.spawnParticles(px, py, '#e040fb', 16);
          const n1 = (Balaclava.ITEMS[g1] && Balaclava.ITEMS[g1].name) || g1;
          const n2 = (Balaclava.ITEMS[g2] && Balaclava.ITEMS[g2].name) || g2;
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.geodeCracked', { q1, n1, n2 }) : `¡Geoda abierta! +${q1} ${n1} y +1 ${n2}.`, 'success');
        }
        this.uiDirty = true;
        return true;
      }

      if (item.openableChest) {
        this.removeItem(itemId, 1);
        const coins = randInt(12, 24);
        this.addCoins(coins);
        const pool = ['perla', 'gema_marina', 'zafiro', 'esmeraldas', 'oro', 'lingote_plata', 'cebo_dorado', 'llave_mazmorra'];
        const reward1 = pick(pool);
        const reward2 = pick(['cristales', 'perla', 'hierro', 'abono_dorado']);
        this.addItem(reward1, 1);
        this.addItem(reward2, 1);
        this.gainXp(45);
        Balaclava.Audio.play('chest');
        this.spawnParticles(this.player.x, this.player.y, '#ffd54f', 16);
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.chestItemOpened', { name: item.name, coins }) : `¡${item.name} abierto! +${coins} monedas y tesoros marinos.`, 'success');
        this.uiDirty = true;
        return true;
      }

      if (item.isBomb || (item.consumableEffect && item.consumableEffect.bombRadius)) {
        return this.throwBomb(item, targetWx, targetWy);
      }

      const hpGain = item.healHp || (item.edible && item.edible.hp) || 0;
      const enGain = item.healEnergy || (item.edible && item.edible.energy) || 0;
      const ed = item.edible;
      const hasBuff = Boolean(item.buff || (ed && (ed.speedBoost || ed.dmgBoost || ed.luckBoost)));
      if (hpGain > 0 || enGain > 0 || hasBuff) {
        if ((this.consumeCooldown || 0) > 0) {
          if (!this._lastConsumeCdToast || this.time - this._lastConsumeCdToast > 0.5) {
            this._lastConsumeCdToast = this.time;
            const secLeft = Math.max(0.1, this.consumeCooldown).toFixed(1);
            this.toast(`Espera ${secLeft}s antes de volver a comer.`, 'info');
          }
          return false;
        }
        const needHp = hpGain > 0 && this.player.hp < this.player.maxHp - 0.1;
        const needEn = enGain > 0 && this.player.energy < this.player.maxEnergy - 0.1;
        if (!hasBuff && !needHp && !needEn) {
          Balaclava.Audio.play('error');
          if (!this._lastFullConsumeWarn || this.time - this._lastFullConsumeWarn > 0.9) {
            this._lastFullConsumeWarn = this.time;
            this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.maxHealthEnergy') : 'Ya tienes la Vida y la Energía al máximo.', 'info');
          }
          return false;
        }
        this.removeItem(itemId, 1);
        const foodCd = (item.edible && item.edible.cooldown) ? item.edible.cooldown : (item.cooldown || 2.0);
        this.consumeCooldown = foodCd;
        if (enGain > 0) this.healPlayer(0, enGain);
        if (hpGain > 0) {
          if (!Array.isArray(this.hotHeals)) this.hotHeals = [];
          this.hotHeals.push({ remaining: hpGain, total: hpGain, dur: 3.0, elapsed: 0, tickAccum: 0 });
          this.addFloatingText(this.player.x, this.player.y - 34, Balaclava.I18n ? Balaclava.I18n.t('toast.healHotFloat', { hp: hpGain }) : `+${hpGain} Vida (gradual)`, '#69f0ae');
        } else if (enGain > 0) {
          this.addFloatingText(this.player.x, this.player.y - 34, Balaclava.I18n ? Balaclava.I18n.t('toast.enGainFloat', { en: enGain }) : `+${enGain} Energía`, '#4fc3f7');
        }
        if (item.buff) {
          this.applyTimedBuff(item.buff.type, {
            mult: item.buff.mult,
            time: item.buff.duration,
            sourceId: 'item:' + itemId,
            sourceName: item.name || itemId,
            blessingName: item.name || itemId
          });
        }
        if (ed && ed.speedBoost) {
          this.applyTimedBuff('speed', {
            mult: 1.35,
            time: ed.speedBoost,
            sourceId: 'item:' + itemId,
            sourceName: item.name || itemId,
            blessingName: item.name || itemId
          });
        }
        if (ed && ed.luckBoost) {
          this.applyTimedBuff('luck', {
            mult: 1.4,
            time: ed.luckBoost,
            sourceId: 'item:' + itemId,
            sourceName: item.name || itemId,
            blessingName: item.name || itemId
          });
        }
        if (ed && ed.dmgBoost) {
          this.applyTimedBuff('dmg', {
            mult: 1.35,
            time: ed.dmgBoost,
            sourceId: 'item:' + itemId,
            sourceName: item.name || itemId,
            blessingName: item.name || itemId
          });
        }
        this.recomputeModifiers();
        const isDrink = /^(pocion|elixir|jugo|miel|frasco|esencia|brebaje|te_)/.test(itemId) || !!item.buff;
        Balaclava.Audio.play(isDrink ? 'drink' : 'eat');
        this.spawnParticles(this.player.x, this.player.y, '#81c784', 8);
        return true;
      }

      if (item.isRangedWeapon || item.isStaffWeapon || item.isSpecialBlade || item.weaponMelee || item.isLaserWeapon) {
        const slotIdx = this.quickTransferToHotbar('item', itemId);
        this.recomputeModifiers();
        Balaclava.Audio.play('equip');
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.equippedHotbar', { slot: slotIdx + 1, name: item.name }) : `Equipado en ranura [${slotIdx + 1}]: ${item.name}`, 'success');
        return true;
      }

      if (item.plantCrop) {
        const tx = Math.floor(this.player.x / TILE_SIZE);
        const ty = Math.floor(this.player.y / TILE_SIZE);
        return this.farming.plantSeed(this, tx, ty, itemId);
      }

      return false;
    }

    // === DAY / NIGHT CYCLE (8m Dia = 480s, 3m Noche = 180s -> 660s total, C1 continuous) ===
    getDayPhase() {
      const t = ((this.dayTime % 1) + 1) % 1;
      const dur = this.dayDuration || 660;
      const DAWN_END = 40 / 660;      // 0s..40s Amanecer
      const DUSK_START = 440 / 660;   // 40s..440s Dia (pleno dia)
      const DAY_END = 480 / 660;      // 440s..480s Atardecer -> total dia = 480s (8 min)
      const PRE_DAWN = 630 / 660;     // 480s..660s Noche = 180s (3 min), pre-amanecer los ultimos 30s
      const smooth = (u) => {
        const c = Math.max(0, Math.min(1, u));
        return c * c * (3 - 2 * c);
      };
      if (t < DAWN_END) {
        const u = t / DAWN_END;
        const k = 1 - smooth(u);
        const w = Math.sin(u * Math.PI);
        return {
          phase: 'amanecer',
          label: Balaclava.I18n ? Balaclava.I18n.t('hud.dawn') : 'Amanecer',
          iconKey: 'sunrise',
          darkness: +(0.54 * k).toFixed(4),
          tint: [Math.round(12 + 20 * w), Math.round(16 + 8 * w), Math.round(42 - 6 * (1 - k))],
          warm: +(0.14 * w).toFixed(4),
          warmRgb: [255, 178, 108],
          phaseLeftSec: Math.max(0, Math.ceil((DAY_END - t) * dur))
        };
      }
      if (t < DUSK_START) {
        return {
          phase: 'dia',
          label: Balaclava.I18n ? Balaclava.I18n.t('hud.phaseDay') : 'Día',
          iconKey: 'sun',
          darkness: 0,
          tint: [10, 14, 34],
          warm: 0,
          warmRgb: [255, 178, 108],
          phaseLeftSec: Math.max(0, Math.ceil((DAY_END - t) * dur))
        };
      }
      if (t < DAY_END) {
        const u = (t - DUSK_START) / (DAY_END - DUSK_START);
        const s = smooth(u);
        const w = Math.sin(u * Math.PI);
        return {
          phase: 'atardecer',
          label: Balaclava.I18n ? Balaclava.I18n.t('hud.dusk') : 'Atardecer',
          iconKey: 'sunset',
          darkness: +(0.82 * s).toFixed(4),
          tint: [Math.round(10 + 26 * w - 2 * s), Math.round(14 + 4 * w - 2 * s), Math.round(34 + 6 * w)],
          warm: +(0.17 * w).toFixed(4),
          warmRgb: [245, 110, 75],
          phaseLeftSec: Math.max(0, Math.ceil((DAY_END - t) * dur))
        };
      }
      const preDawn = t >= PRE_DAWN ? smooth((t - PRE_DAWN) / (1 - PRE_DAWN)) : 0;
      return {
        phase: 'noche',
        label: Balaclava.I18n ? Balaclava.I18n.t('hud.phaseNight') : 'Noche',
        iconKey: 'moon',
        darkness: +(0.82 - 0.28 * preDawn).toFixed(4),
        tint: [Math.round(8 + 4 * preDawn), Math.round(12 + 4 * preDawn), Math.round(34 + 8 * preDawn)],
        warm: 0,
        warmRgb: [245, 110, 75],
        phaseLeftSec: Math.max(0, Math.ceil((1 - t) * dur))
      };
    }

    getDaylightFactor() {
      const darkness = this.getNightDarkness();
      return Math.max(0, Math.min(1, 1 - darkness / 0.82));
    }

    isDayTime() {
      return !this.isNightTime();
    }

    isNightTime() {
      const t = ((this.dayTime % 1) + 1) % 1;
      return t >= (480 / 660);
    }

    getNightDarkness() {
      return this.getDayPhase().darkness;
    }

    // === TIMED CRAFTING & SKILLS ===
    getBestStationLevel(station) {
      if (!station || station === 'mano' || !Array.isArray(this.buildings)) return 1;
      let best = 1;
      for (const b of this.buildings) {
        const def = Balaclava.BUILDINGS && Balaclava.BUILDINGS[b.type];
        if (!def) continue;
        if (def.station === station || (station === 'investigacion' && def.station === 'forja')) {
          const matchesPrimary = def.station === station;
          if (matchesPrimary) {
            best = Math.max(best, Number(b.level) || 1);
          } else if (best === 1 && def.station === 'forja' && !this.hasStationAvailable('investigacion')) {
            best = Math.max(best, Number(b.level) || 1);
          }
        }
      }
      return Math.max(1, Math.min(3, best));
    }

    getCraftDuration(rec) {
      const base = (rec && rec.craftTime) || 2.2;
      const stLv = (rec && rec.station) ? this.getBestStationLevel(rec.station) : 1;
      const stSpd = stLv >= 3 ? 0.75 : stLv === 2 ? 0.35 : 0;
      const spd = 1 + (this.mods.craftSpeed || 0) + stSpd + (rec && rec.isCook ? (this.mods.cookSpeed || 0) : 0);
      return Math.max(0.45, +(base / Math.max(0.5, spd)).toFixed(2));
    }

    getToolUpgradeDuration(nextTier, station = null) {
      const tierIdx = Array.isArray(Balaclava.TIER_ORDER) ? Math.max(1, Balaclava.TIER_ORDER.indexOf(nextTier)) : 1;
      const st = station || (nextTier && nextTier !== 'mejorada' ? 'forja' : 'mesa');
      const base = +(2.0 + Math.min(3.5, (tierIdx - 1) * 0.35)).toFixed(2);
      return this.getCraftDuration({ craftTime: base, station: st });
    }

    getArmorUpgradeDuration(tierIdx, station = null) {
      const idx = Math.max(1, Number(tierIdx) || 1);
      const base = +(2.0 + Math.min(3.5, (idx - 1) * 0.35)).toFixed(2);
      return this.getCraftDuration({ craftTime: base, station: station || 'forja' });
    }

    getOwnedArmorItem(slot) {
      const chain = Balaclava.ARMORS && Balaclava.ARMORS[slot];
      if (!chain) return null;
      let bestIdx = -1;
      const tracked = this.armorTiers && this.armorTiers[slot];
      if (tracked) {
        const ti = chain.tiers.indexOf(tracked);
        if (ti > bestIdx) bestIdx = ti;
      }
      const eq = this.equipped && this.equipped[slot];
      if (eq) {
        const ei = chain.tiers.indexOf(eq);
        if (ei > bestIdx) bestIdx = ei;
      }
      chain.tiers.forEach((id, idx) => {
        if (this.inventory && (this.inventory[id] || 0) > 0 && idx > bestIdx) {
          bestIdx = idx;
        }
      });
      return bestIdx >= 0 ? chain.tiers[bestIdx] : null;
    }

    syncArmorTiersFromGear() {
      if (!this.armorTiers) this.armorTiers = { helm: null, armor: null, shield: null, boots: null };
      if (!Balaclava.ARMORS) return;
      Object.keys(Balaclava.ARMORS).forEach(slot => {
        const owned = this.getOwnedArmorItem(slot);
        if (owned) this.armorTiers[slot] = owned;
      });
    }

    assignHotbarSlot(slotIdx, kind, id) {
      if (slotIdx < 0 || slotIdx >= 9) return false;
      const newEntry = id ? { kind, id } : null;
      const existingIdx = newEntry
        ? this.hotbar.findIndex((s, i) => i !== slotIdx && s && s.kind === kind && s.id === id)
        : -1;
      const displaced = this.hotbar[slotIdx] || null;
      if (existingIdx >= 0) {
        this.hotbar[slotIdx] = newEntry;
        this.hotbar[existingIdx] = displaced;
      } else {
        this.hotbar[slotIdx] = newEntry;
        if (displaced && newEntry && !(displaced.kind === kind && displaced.id === id)) {
          const emptyIdx = this.hotbar.findIndex((s, i) => i !== slotIdx && !s);
          if (emptyIdx >= 0) {
            this.hotbar[emptyIdx] = displaced;
          } else {
            const deadIdx = this.hotbar.findIndex((s, i) => i !== slotIdx && s && (
              (s.kind === 'tool' && !this.toolTiers[s.id]) ||
              (s.kind === 'item' && (this.inventory[s.id] || 0) <= 0)
            ));
            if (deadIdx >= 0) this.hotbar[deadIdx] = displaced;
          }
        }
      }
      this.activeSlot = slotIdx;
      this.uiDirty = true;
      return true;
    }

    swapHotbarSlots(idxA, idxB) {
      if (idxA < 0 || idxA >= 9 || idxB < 0 || idxB >= 9 || idxA === idxB) return false;
      const tmp = this.hotbar[idxA] || null;
      this.hotbar[idxA] = this.hotbar[idxB] || null;
      this.hotbar[idxB] = tmp;
      this.uiDirty = true;
      return true;
    }

    quickTransferToHotbar(kind, id) {
      if (!id) return -1;
      const already = this.hotbar.findIndex(s => s && s.kind === kind && s.id === id);
      if (already >= 0) {
        this.activeSlot = already;
        this.uiDirty = true;
        return already;
      }
      let targetIdx = this.hotbar.findIndex(s => !s);
      if (targetIdx < 0) {
        targetIdx = this.hotbar.findIndex(s => s && s.kind === 'tool' && !this.toolTiers[s.id]);
      }
      if (targetIdx < 0) {
        targetIdx = this.hotbar.findIndex(s => s && s.kind === 'item' && (this.inventory[s.id] || 0) <= 0);
      }
      if (targetIdx < 0) targetIdx = this.activeSlot || 0;
      const displaced = this.hotbar[targetIdx] || null;
      this.hotbar[targetIdx] = { kind, id };
      if (displaced && (displaced.kind !== kind || displaced.id !== id)) {
        const emptyIdx = this.hotbar.findIndex((s, i) => i !== targetIdx && !s);
        if (emptyIdx >= 0) this.hotbar[emptyIdx] = displaced;
      }
      this.activeSlot = targetIdx;
      this.uiDirty = true;
      return targetIdx;
    }

    placeInNearestAvailableHotbarSlot(kind, id, selectSlot = true) {
      if (!id || !Array.isArray(this.hotbar)) return -1;
      while (this.hotbar.length < 9) this.hotbar.push(null);
      // Clean any stale unowned tool placeholders first so they never block lower-numbered slots
      for (let i = 0; i < 9; i++) {
        const s = this.hotbar[i];
        if (!s) continue;
        if (s.kind === 'tool' && !this.toolTiers[s.id]) {
          this.hotbar[i] = null;
        }
      }
      const existingIdx = this.hotbar.findIndex(s => s && s.kind === kind && s.id === id);
      if (existingIdx >= 0) {
        if (selectSlot) this.activeSlot = existingIdx;
        this.uiDirty = true;
        return existingIdx;
      }
      // Strictly scan in ascending order: slot 1 (index 0) -> slot 2 (index 1) -> ... -> slot 9 (index 8)
      let targetIdx = -1;
      for (let i = 0; i < 9; i++) {
        const s = this.hotbar[i];
        if (!s) {
          targetIdx = i;
          break;
        }
      }
      if (targetIdx < 0) {
        for (let i = 0; i < 9; i++) {
          const s = this.hotbar[i];
          if (s && s.kind === 'item' && (this.inventory[s.id] || 0) <= 0) {
            targetIdx = i;
            break;
          }
        }
      }
      if (targetIdx >= 0) {
        this.hotbar[targetIdx] = { kind, id };
        if (selectSlot) this.activeSlot = targetIdx;
        this.uiDirty = true;
      }
      return targetIdx;
    }

    autoEquipCraftedArmor(slotKey, targetId, prevUpgradeId = null) {
      if (!slotKey || !targetId) return false;
      const normSlot = slotKey === 'helmet' ? 'helm' : slotKey;
      const itemDef = Balaclava.ITEMS && Balaclava.ITEMS[targetId];
      if (!itemDef) return false;
      if (!this.equipped) this.equipped = { armor: null, helm: null, shield: null, boots: null, ring: null, amulet: null, relic: null };
      if (!this.armorTiers) this.armorTiers = { helm: null, armor: null, shield: null, boots: null };

      const isProgTarget = Boolean(Balaclava.isProgressiveArmorItem && Balaclava.isProgressiveArmorItem(targetId));
      if (isProgTarget) {
        this.armorTiers[normSlot] = targetId;
      }
      if (prevUpgradeId && this.armorEnchants && this.armorEnchants[prevUpgradeId] && !this.armorEnchants[targetId]) {
        this.armorEnchants[targetId] = { ...this.armorEnchants[prevUpgradeId] };
        delete this.armorEnchants[prevUpgradeId];
      }
      if (prevUpgradeId && this.inventory && this.inventory[prevUpgradeId]) {
        delete this.inventory[prevUpgradeId];
      }
      if (this.inventory && (this.inventory[targetId] || 0) > 0) {
        this.removeItem(targetId, 1);
      }
      const curEq = this.equipped[normSlot];
      if (curEq && curEq !== targetId && curEq !== prevUpgradeId) {
        const isProgCur = Boolean(Balaclava.isProgressiveArmorItem && Balaclava.isProgressiveArmorItem(curEq));
        if (!(isProgCur && isProgTarget)) {
          this.addItem(curEq, 1);
        }
      }
      this.equipped[normSlot] = targetId;
      this.recomputeModifiers();
      this.uiDirty = true;
      return true;
    }

    completeCraftJob(job) {
      if (!job) return;
      const rec = Balaclava.RECIPES.find(r => r.id === job.recipeId);
      if (job.toolUnlock) {
        const toolId = job.toolUnlock;
        const tool = Balaclava.TOOLS[toolId];
        if (tool && !this.toolTiers[toolId]) {
          // Clear any pre-existing unowned placeholder for this tool before unlocking
          if (Array.isArray(this.hotbar)) {
            for (let i = 0; i < this.hotbar.length; i++) {
              const s = this.hotbar[i];
              if (s && s.kind === 'tool' && (!this.toolTiers[s.id] || s.id === toolId)) {
                this.hotbar[i] = null;
              }
            }
          }
          this.toolTiers[toolId] = 'basica';
          this.placeInNearestAvailableHotbarSlot('tool', toolId, true);
          if (toolId === 'arco') {
            if (this.getArrowCount() <= 0) {
              this.addItem('flecha', 12);
            }
            if (this.player) {
              this.player.bowLoaded = true;
              this.player.bowReloadTimer = 0;
              this.player.bowNeedsAutoReload = false;
            }
          }
          this.toast(`Herramienta desbloqueada: ${tool.name}`, 'success');
        }
        this.gainXp(job.xp || 14);
        this.stats.craftedTotal += 1;
        this.events.recordAction('craft', 1);
        Balaclava.Audio.play('levelup');
        this.uiDirty = true;
        return;
      }

      if (job.toolUpgrade) {
        const toolId = job.toolUpgrade;
        const tool = Balaclava.TOOLS[toolId];
        const nextTier = job.targetTier || (this.toolTiers[toolId] ? Balaclava.getNextTier(this.toolTiers[toolId]) : null);
        if (tool && nextTier) {
          this.toolTiers[toolId] = nextTier;
          if (!this.toolUpgradeCooldowns) this.toolUpgradeCooldowns = {};
          this.toolUpgradeCooldowns[toolId] = 0.8;
          this.gainXp(job.xp || 40);
          this.stats.craftedTotal += 1;
          this.events.recordAction('craft', 1);
          Balaclava.Audio.play('levelup');
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.toolUpgraded', { tool: tool.name, tier: Balaclava.TIER_META[nextTier].name }) : `${tool.name} mejorado a ${Balaclava.TIER_META[nextTier].name}!`, 'success');
          this.uiDirty = true;
        }
        return;
      }

      if (job.armorUnlock) {
        const slot = job.armorUnlock;
        const targetId = job.targetItem;
        const itemDef = Balaclava.ITEMS[targetId];
        if (itemDef) {
          this.autoEquipCraftedArmor(slot, targetId, null);
          if (this.tutorialSys && !this.tutorialSys.done) {
            this.tutorialSys.update(this, 0);
          }
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.armorUnlocked', { name: itemDef.name }) : `Armadura desbloqueada y equipada: ${itemDef.name}`, 'success');
        }
        this.gainXp(job.xp || 18);
        this.stats.craftedTotal += 1;
        this.events.recordAction('craft', 1);
        Balaclava.Audio.play('levelup');
        this.uiDirty = true;
        return;
      }

      if (job.armorUpgrade) {
        const slot = job.armorUpgrade;
        const prevId = job.prevItem;
        const nextId = job.targetItem;
        const nextItem = Balaclava.ITEMS[nextId];
        if (nextItem) {
          this.autoEquipCraftedArmor(slot, nextId, prevId);
          if (!this.armorUpgradeCooldowns) this.armorUpgradeCooldowns = {};
          this.armorUpgradeCooldowns[slot] = 0.8;
          if (this.tutorialSys && !this.tutorialSys.done) {
            this.tutorialSys.update(this, 0);
          }
          const chain = Balaclava.ARMORS && Balaclava.ARMORS[slot];
          const slotLabel = (Balaclava.I18n && chain && chain.nameKey) ? Balaclava.I18n.t(chain.nameKey) : (chain ? chain.fallbackName : slot);
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.armorUpgraded', { slot: slotLabel, tier: nextItem.name }) : `${slotLabel} mejorado a ${nextItem.name}!`, 'success');
        }
        this.gainXp(job.xp || 32);
        this.stats.craftedTotal += 1;
        this.events.recordAction('craft', 1);
        Balaclava.Audio.play('levelup');
        this.uiDirty = true;
        return;
      }

      if (job.out === '_coin') {
        this.coins += job.qty;
        this.stats.coinsEarned += job.qty;
        this.stats.coinsMinted = (this.stats.coinsMinted || 0) + job.qty;
        this.addFloatingText(this.player.x + 12, this.player.y - 28, `+${job.qty} Monedas`, '#ffd54f');
        this.gainXp(job.xp || (rec ? rec.xp : 8));
        this.stats.craftedTotal += job.qty;
        this.events.recordAction('craft', job.qty);
        Balaclava.Audio.play('coin');
        this.uiDirty = true;
        return;
      }

      const itemDef = Balaclava.ITEMS[job.out];
      if (itemDef && itemDef.equipSlot && ['armor', 'helm', 'helmet', 'shield', 'boots'].includes(itemDef.equipSlot)) {
        const slotKey = itemDef.equipSlot === 'helmet' ? 'helm' : itemDef.equipSlot;
        this.autoEquipCraftedArmor(slotKey, job.out, null);
        if ((job.qty || 1) > 1) {
          this.addItem(job.out, (job.qty || 1) - 1);
        }
        if (this.encyclopedia && this.encyclopedia.items) {
          this.encyclopedia.items.add(job.out);
        }
        this.gainXp(job.xp || (rec ? rec.xp : 18));
        this.stats.craftedTotal += (job.qty || 1);
        this.events.recordAction('craft', job.qty || 1);
        if (this.tutorialSys && !this.tutorialSys.done) {
          this.tutorialSys.update(this, 0);
        }
        Balaclava.Audio.play('equip');
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.autoEquipped', { name: itemDef.name }) : `Equipado automáticamente: ${itemDef.name}`, 'success');
        this.uiDirty = true;
        return;
      }

      if (!Array.isArray(this.craftReady)) this.craftReady = [];
      const entry = {
        id: job.id || `${Date.now()}_${Math.random()}`,
        recipeId: job.recipeId,
        out: job.out,
        qty: job.qty || 1,
        xp: job.xp || (rec ? rec.xp : 8),
        name: (itemDef && itemDef.name) || job.name || job.out,
        isCook: !!(rec && rec.isCook),
        station: job.station || (rec ? rec.station : 'mano'),
        craftedAt: Date.now()
      };
      this.craftReady.push(entry);
      Balaclava.Audio.play('craft');
      this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.craftReady', { name: entry.name, qty: entry.qty }) : `¡Listo para reclamar: ${entry.name} x${entry.qty}!`, 'success');
      this.uiDirty = true;
    }

    claimCrafted(index, station = null) {
      if (!Array.isArray(this.craftReady)) return false;
      let targetIdx = index;
      if (station) {
        const matchingIndices = [];
        this.craftReady.forEach((e, idx) => {
          if (e.station === station) matchingIndices.push(idx);
        });
        if (index < 0 || index >= matchingIndices.length) return false;
        targetIdx = matchingIndices[index];
      }
      if (targetIdx < 0 || targetIdx >= this.craftReady.length) return false;
      const entry = this.craftReady.splice(targetIdx, 1)[0];
      if (!entry) return false;
      this.addItem(entry.out, entry.qty);
      const outItem = Balaclava.ITEMS[entry.out];
      if (outItem && outItem.equipSlot) {
        const slotKey = outItem.equipSlot === 'helmet' ? 'helm' : outItem.equipSlot;
        if (['armor', 'helm', 'shield', 'boots', 'legs'].includes(slotKey)) {
          this.autoEquipCraftedArmor(slotKey, outItem.id, null);
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.autoEquipped', { name: outItem.name }) : `Equipado automáticamente: ${outItem.name}`, 'info');
        } else if (!this.equipped[slotKey] && (this.inventory[outItem.id] || 0) >= 1) {
          this.removeItem(outItem.id, 1);
          this.equipped[slotKey] = outItem.id;
          this.recomputeModifiers();
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.autoEquipped', { name: outItem.name }) : `Equipado automáticamente: ${outItem.name}`, 'info');
        }
      }
      if (outItem && (outItem.isLaserWeapon || outItem.isBomb || outItem.isRangedWeapon || outItem.isStaffWeapon || outItem.isSpecialBlade || outItem.weaponMelee)) {
        this.placeInNearestAvailableHotbarSlot('item', outItem.id, false);
      }
      this.gainXp(entry.xp || 8);
      this.stats.craftedTotal += entry.qty;
      this.events.recordAction('craft', entry.qty);
      Balaclava.Audio.play('pickup');
      this.uiDirty = true;
      return true;
    }

    claimAllCrafted(station = null) {
      if (!Array.isArray(this.craftReady) || this.craftReady.length === 0) return 0;
      let count = 0;
      for (let i = this.craftReady.length - 1; i >= 0; i--) {
        if (!station || this.craftReady[i].station === station) {
          const entry = this.craftReady.splice(i, 1)[0];
          if (entry) {
            this.addItem(entry.out, entry.qty);
            const outItem = Balaclava.ITEMS[entry.out];
            if (outItem && outItem.equipSlot) {
              const slotKey = outItem.equipSlot === 'helmet' ? 'helm' : outItem.equipSlot;
              if (['armor', 'helm', 'shield', 'boots', 'legs'].includes(slotKey)) {
                this.autoEquipCraftedArmor(slotKey, outItem.id, null);
              } else if (!this.equipped[slotKey] && (this.inventory[outItem.id] || 0) >= 1) {
                this.removeItem(outItem.id, 1);
                this.equipped[slotKey] = outItem.id;
                this.recomputeModifiers();
              }
            }
            if (outItem && (outItem.isLaserWeapon || outItem.isBomb || outItem.isRangedWeapon || outItem.isStaffWeapon || outItem.isSpecialBlade || outItem.weaponMelee)) {
              this.placeInNearestAvailableHotbarSlot('item', outItem.id, false);
            }
            this.gainXp(entry.xp || 8);
            this.stats.craftedTotal += entry.qty;
            this.events.recordAction('craft', entry.qty);
            count++;
          }
        }
      }
      if (count > 0) {
        Balaclava.Audio.play('pickup');
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.claimedAll', { count }) : `¡Recogidos ${count} lote(s) terminados en tu inventario!`, 'success');
        this.uiDirty = true;
      }
      return count;
    }

    updateCraftQueue(dt) {
      if (this.toolUpgradeCooldowns) {
        for (const k of Object.keys(this.toolUpgradeCooldowns)) {
          this.toolUpgradeCooldowns[k] -= dt;
          if (this.toolUpgradeCooldowns[k] <= 0) {
            delete this.toolUpgradeCooldowns[k];
            this.uiDirty = true;
          }
        }
      }
      if (this.armorUpgradeCooldowns) {
        for (const k of Object.keys(this.armorUpgradeCooldowns)) {
          this.armorUpgradeCooldowns[k] -= dt;
          if (this.armorUpgradeCooldowns[k] <= 0) {
            delete this.armorUpgradeCooldowns[k];
            this.uiDirty = true;
          }
        }
      }
      if (!Array.isArray(this.craftQueue) || this.craftQueue.length === 0) return;
      const active = this.craftQueue[0];
      active.elapsed += dt;
      if (active.elapsed >= active.totalTime) {
        this.craftQueue.shift();
        this.completeCraftJob(active);
      }
    }

    craftRecipe(recipeId, times = 1) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      const rec = Balaclava.RECIPES.find(r => r.id === recipeId);
      if (!rec) return false;
      const progArmor = Balaclava.isProgressiveArmorItem && Balaclava.isProgressiveArmorItem(rec.out);
      if (progArmor) {
        return progArmor.tierIdx === 0 ? this.craftArmor(progArmor.slot) : this.upgradeArmor(progArmor.slot);
      }
      const outCheck = Balaclava.ITEMS && Balaclava.ITEMS[rec.out];
      if (outCheck && outCheck.equipSlot && ['armor', 'helm', 'helmet', 'shield', 'boots'].includes(outCheck.equipSlot)) {
        times = 1;
      }
      if (!this.hasStationAvailable(rec.station)) {
        this.toast(T('toast.stationRequiredUpper', { station: rec.station.toUpperCase() }), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      if (rec.reqSkill && (!Array.isArray(this.unlockedSkills) || !this.unlockedSkills.includes(rec.reqSkill))) {
        const sk = Balaclava.SKILLS && Balaclava.SKILLS[rec.reqSkill];
        const sName = sk ? sk.name : rec.reqSkill;
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage && Balaclava.I18n.getLanguage() === 'en';
        this.toast(isEn ? `Requires Skill: ${sName}` : `Requiere habilidad: ${sName}`, 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      if (!Array.isArray(this.craftQueue)) this.craftQueue = [];
      if (this.craftQueue.length >= 8) {
        this.toast(T('toast.queueFull'), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }

      if (rec.toolUnlock) {
        const toolId = rec.toolUnlock;
        const tool = Balaclava.TOOLS[toolId];
        if (!tool) return false;
        if (this.toolTiers[toolId] || this.craftQueue.some(j => j.toolUnlock === toolId)) {
          this.toast(T('toast.toolAlreadyCrafted', { name: tool.name }), 'info');
          return false;
        }
        const can = Object.entries(rec.in).every(([id, q]) => (this.inventory[id] || 0) >= q);
        if (!can) {
          Balaclava.Audio.play('error');
          this.toast(T('toast.missingCraftMats'), 'warn');
          return false;
        }
        Object.entries(rec.in).forEach(([id, q]) => this.removeItem(id, q));
        const dur = this.getCraftDuration(rec);
        this.craftQueue.push({
          id: `${Date.now()}_${Math.random()}`,
          recipeId: rec.id,
          name: tool.name,
          out: '_tool_' + toolId,
          toolUnlock: toolId,
          qty: 1,
          xp: Math.round((rec.xp || 14) * (1 + (this.mods.craftXp || 0))),
          station: rec.station,
          totalTime: dur,
          elapsed: 0
        });
        Balaclava.Audio.play('craft');
        this.toast(T('toast.forgingTool', { name: tool.name, dur }), 'info');
        this.uiDirty = true;
        return true;
      }

      const hasIngredient = (id, q) => {
        const invQty = this.inventory[id] || 0;
        if (invQty >= q) return true;
        const itDef = Balaclava.ITEMS[id];
        if (q === 1 && itDef && itDef.equipSlot) {
          const sk = itDef.equipSlot === 'helmet' ? 'helm' : itDef.equipSlot;
          return this.equipped && this.equipped[sk] === id && invQty + 1 >= q;
        }
        return false;
      };
      const consumeIngredient = (id, q) => {
        const invQty = this.inventory[id] || 0;
        if (invQty >= q) {
          this.removeItem(id, q);
          return;
        }
        const itDef = Balaclava.ITEMS[id];
        if (itDef && itDef.equipSlot) {
          const sk = itDef.equipSlot === 'helmet' ? 'helm' : itDef.equipSlot;
          if (this.equipped && this.equipped[sk] === id) {
            if (invQty > 0) this.removeItem(id, invQty);
            this.equipped[sk] = null;
            this.recomputeModifiers();
          }
        }
      };

      let queuedCount = 0;
      const stLv = this.getBestStationLevel(rec.station);
      const outItemCheck = Balaclava.ITEMS && Balaclava.ITEMS[rec.out];
      const isStackable = !(outItemCheck && outItemCheck.equipSlot);
      for (let t = 0; t < times; t++) {
        if (this.craftQueue.length >= 8) break;
        const can = Object.entries(rec.in).every(([id, q]) => hasIngredient(id, q));
        if (!can) break;
        Object.entries(rec.in).forEach(([id, q]) => consumeIngredient(id, q));
        let outQty = rec.qty;
        const dblProb = (this.mods.doubleCraft || 0) + (isStackable && stLv >= 3 ? 0.25 : 0);
        if (Math.random() < dblProb) {
          outQty *= 2;
        }
        if (stLv >= 3 && Math.random() < 0.20) {
          const refundKeys = Object.keys(rec.in || {}).filter(k => (rec.in[k] || 0) > 0);
          if (refundKeys.length > 0) {
            const rKey = refundKeys[Math.floor(Math.random() * refundKeys.length)];
            this.addItem(rKey, 1);
            const rName = (Balaclava.ITEMS[rKey] && Balaclava.ITEMS[rKey].name) || rKey;
            this.addFloatingText(this.player.x, this.player.y - 34, `¡Eco Nv.3! +1 ${rName}`, '#80deea');
          }
        }
        const dur = this.getCraftDuration(rec);
        const xpGain = Math.round(rec.xp * (1 + (this.mods.craftXp || 0) + (stLv - 1) * 0.20));
        const outItem = Balaclava.ITEMS[rec.out];
        const outName = rec.out === '_coin' ? `${outQty} Monedas` : (outItem ? outItem.name : rec.out);
        this.craftQueue.push({
          id: `${Date.now()}_${Math.random()}`,
          recipeId: rec.id,
          name: outName,
          out: rec.out,
          qty: outQty,
          xp: xpGain,
          station: rec.station,
          totalTime: dur,
          elapsed: 0
        });
        queuedCount++;
      }

      if (queuedCount > 0) {
        Balaclava.Audio.play('craft');
        this.uiDirty = true;
        return true;
      }
      Balaclava.Audio.play('error');
      this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.missingRecipeMats') : 'Te faltan materiales para esta receta.', 'warn');
      return false;
    }

    hasStationAvailable(station) {
      if (station === 'mano') return true;
      return this.buildings.some(b => Balaclava.BUILDINGS[b.type] && Balaclava.BUILDINGS[b.type].station === station);
    }

    craftTool(toolId) {
      return this.craftRecipe('r_tool_' + toolId, 1);
    }

    upgradeTool(toolId) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      const tool = Balaclava.TOOLS[toolId];
      const curTier = this.toolTiers[toolId];
      if (!curTier) {
        return this.craftTool(toolId);
      }
      const nextTier = Balaclava.getNextTier(curTier);
      if (!tool || !nextTier) return false;

      if (!Array.isArray(this.craftQueue)) this.craftQueue = [];
      const alreadyBusy = this.craftQueue.some(j => j.toolUnlock === toolId || j.toolUpgrade === toolId)
        || (this.toolUpgradeCooldowns && this.toolUpgradeCooldowns[toolId] > 0);
      if (alreadyBusy) {
        this.toast(T('toast.toolUpgradeBusy', { tool: tool.name }), 'info');
        Balaclava.Audio.play('error');
        return false;
      }
      if (this.craftQueue.length >= 8) {
        this.toast(T('toast.queueFull'), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }

      // Iron+ tiers require Forja
      if (nextTier !== 'mejorada' && !this.hasStationAvailable('forja')) {
        this.toast(T('toast.needForgeTier'), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }

      const cost = tool.tierCosts[nextTier];
      if (!cost) return false;
      if (this.coins < cost.coins) {
        this.toast(T('toast.needCoinsExact', { coins: cost.coins }), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      for (const [id, q] of Object.entries(cost.items)) {
        if ((this.inventory[id] || 0) < q) {
          this.toast(T('toast.missingItemQty', { qty: q, name: Balaclava.ITEMS[id].name }), 'warn');
          Balaclava.Audio.play('error');
          return false;
        }
      }

      this.coins -= cost.coins;
      for (const [id, q] of Object.entries(cost.items)) {
        this.removeItem(id, q);
      }
      const upStation = nextTier !== 'mejorada' ? 'forja' : 'mesa';
      const stLv = this.getBestStationLevel(upStation);
      const dur = this.getToolUpgradeDuration(nextTier, upStation);
      const tierName = Balaclava.TIER_META[nextTier] ? Balaclava.TIER_META[nextTier].name : nextTier;
      this.craftQueue.push({
        id: `${Date.now()}_${Math.random()}`,
        recipeId: `r_up_${toolId}_${nextTier}`,
        name: `${tool.name} (${tierName})`,
        out: '_tool_up_' + toolId,
        toolUpgrade: toolId,
        targetTier: nextTier,
        qty: 1,
        xp: Math.round(40 * (1 + (this.mods.craftXp || 0) + (stLv - 1) * 0.20)),
        station: nextTier !== 'mejorada' ? 'forja' : 'mano',
        totalTime: dur,
        elapsed: 0
      });
      Balaclava.Audio.play('craft');
      this.toast(T('toast.toolUpgrading', { tool: tool.name, tier: tierName, dur }), 'info');
      this.uiDirty = true;
      return true;
    }

    craftArmor(slot) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      const chain = Balaclava.ARMORS && Balaclava.ARMORS[slot];
      if (!chain) return false;
      const baseItemId = chain.baseItem;
      const baseItem = Balaclava.ITEMS[baseItemId];
      if (!baseItem) return false;
      if (!Array.isArray(this.craftQueue)) this.craftQueue = [];
      if (this.getOwnedArmorItem(slot) || this.craftQueue.some(j => j.armorUnlock === slot || j.armorUpgrade === slot)) {
        this.toast(T('toast.armorAlreadyCrafted', { name: baseItem.name }), 'info');
        return false;
      }
      if (this.craftQueue.length >= 8) {
        this.toast(T('toast.queueFull'), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      const rec = Balaclava.RECIPES.find(r => r.out === baseItemId);
      if (!rec) return false;
      if (!this.hasStationAvailable(rec.station)) {
        this.toast(T('toast.stationRequiredUpper', { station: rec.station.toUpperCase() }), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      if (rec.reqSkill && (!Array.isArray(this.unlockedSkills) || !this.unlockedSkills.includes(rec.reqSkill))) {
        const sk = Balaclava.SKILLS && Balaclava.SKILLS[rec.reqSkill];
        const sName = sk ? sk.name : rec.reqSkill;
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage && Balaclava.I18n.getLanguage() === 'en';
        this.toast(isEn ? `Requires Skill: ${sName}` : `Requiere habilidad: ${sName}`, 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      const can = Object.entries(rec.in || {}).every(([id, q]) => (this.inventory[id] || 0) >= q);
      if (!can) {
        Balaclava.Audio.play('error');
        this.toast(T('toast.missingCraftMats'), 'warn');
        return false;
      }
      Object.entries(rec.in || {}).forEach(([id, q]) => this.removeItem(id, q));
      const dur = this.getCraftDuration({ craftTime: 2.0 });
      this.craftQueue.push({
        id: `${Date.now()}_${Math.random()}`,
        recipeId: rec.id,
        name: baseItem.name,
        out: '_armor_' + slot,
        armorUnlock: slot,
        targetItem: baseItemId,
        qty: 1,
        xp: Math.round((rec.xp || 18) * (1 + (this.mods.craftXp || 0))),
        station: rec.station,
        totalTime: dur,
        elapsed: 0
      });
      Balaclava.Audio.play('craft');
      this.toast(T('toast.forgingTool', { name: baseItem.name, dur }), 'info');
      this.uiDirty = true;
      return true;
    }

    upgradeArmor(slot) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      const chain = Balaclava.ARMORS && Balaclava.ARMORS[slot];
      if (!chain) return false;
      const curId = this.getOwnedArmorItem(slot);
      if (!curId) {
        return this.craftArmor(slot);
      }
      const nextId = Balaclava.getArmorNextItem(slot, curId);
      if (!nextId) return false;
      const nextItem = Balaclava.ITEMS[nextId];
      if (!nextItem) return false;

      const slotLabel = (Balaclava.I18n && chain.nameKey) ? T(chain.nameKey) : (chain.fallbackName || slot);
      if (!Array.isArray(this.craftQueue)) this.craftQueue = [];
      const alreadyBusy = this.craftQueue.some(j => j.armorUnlock === slot || j.armorUpgrade === slot)
        || (this.armorUpgradeCooldowns && this.armorUpgradeCooldowns[slot] > 0);
      if (alreadyBusy) {
        this.toast(T('toast.armorUpgradeBusy', { slot: slotLabel }), 'info');
        Balaclava.Audio.play('error');
        return false;
      }
      if (this.craftQueue.length >= 8) {
        this.toast(T('toast.queueFull'), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }

      const mat = Balaclava.getArmorUpgradeMaterials(slot, nextId);
      if (!mat) return false;
      const stOk = mat.station === 'investigacion'
        ? (this.hasStationAvailable('investigacion') || this.hasStationAvailable('forja'))
        : this.hasStationAvailable(mat.station);
      if (!stOk) {
        this.toast(T('toast.needForgeTier'), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      for (const [id, q] of Object.entries(mat.items)) {
        if ((this.inventory[id] || 0) < q) {
          this.toast(T('toast.missingItemQty', { qty: q, name: Balaclava.ITEMS[id] ? Balaclava.ITEMS[id].name : id }), 'warn');
          Balaclava.Audio.play('error');
          return false;
        }
      }

      for (const [id, q] of Object.entries(mat.items)) {
        this.removeItem(id, q);
      }
      const tierIdx = Balaclava.getArmorTierIndex(slot, nextId);
      const stLv = this.getBestStationLevel(mat.station || 'forja');
      const dur = this.getArmorUpgradeDuration(tierIdx, mat.station);
      this.craftQueue.push({
        id: `${Date.now()}_${Math.random()}`,
        recipeId: mat.recipeId,
        name: nextItem.name,
        out: '_armor_up_' + slot,
        armorUpgrade: slot,
        prevItem: curId,
        targetItem: nextId,
        qty: 1,
        xp: Math.round((mat.xp || 32) * (1 + (this.mods.craftXp || 0) + (stLv - 1) * 0.20)),
        station: mat.station,
        totalTime: dur,
        elapsed: 0
      });
      Balaclava.Audio.play('craft');
      this.toast(T('toast.armorUpgrading', { slot: slotLabel, tier: nextItem.name, dur }), 'info');
      this.uiDirty = true;
      return true;
    }

    unlockSkill(skillId) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      const sk = Balaclava.SKILLS[skillId];
      if (!sk || this.unlockedSkills.includes(skillId)) return false;
      if (sk.req && !this.unlockedSkills.includes(sk.req)) {
        this.toast(T('toast.skillUnlockPrev'), 'warn');
        return false;
      }
      if (this.player.skillPoints < sk.cost) {
        this.toast(T('toast.skillNeedPoints', { pts: sk.cost }), 'warn');
        Balaclava.Audio.play('error');
        return false;
      }
      this.player.skillPoints -= sk.cost;
      this.unlockedSkills.push(skillId);
      this.recomputeModifiers();
      if (this.tutorialSys && !this.tutorialSys.done) {
        this.tutorialSys.update(this, 0);
      }
      Balaclava.Audio.play('levelup');
      this.toast(T('toast.skillUnlocked', { name: sk.name }), 'success');
      this.uiDirty = true;
      return true;
    }

    // === BUILDING PLACEMENT ===
    canBuild(buildingId) {
      const def = Balaclava.BUILDINGS[buildingId];
      if (!def) return { ok: false, reason: 'Estructura inválida' };
      if (def.reqSkill && !this.unlockedSkills.includes(def.reqSkill)) {
        const sk = Balaclava.SKILLS[def.reqSkill];
        return {
          ok: false,
          reqSkill: def.reqSkill,
          reason: `Requiere habilidad: ${sk ? sk.name : def.reqSkill}`
        };
      }
      return { ok: true };
    }

    getAdjustedBuildCost(buildingId) {
      const def = Balaclava.BUILDINGS[buildingId];
      if (!def) return {};
      const disc = this.mods.buildDiscount || 0;
      const out = {};
      for (const [id, q] of Object.entries(def.cost)) {
        out[id] = Math.max(1, Math.round(q * (1 - disc)));
      }
      return out;
    }

    getOccupiedTileSet() {
      const set = new Set();
      if (this.player) {
        const ptx = Math.floor(this.player.x / TILE_SIZE);
        const pty = Math.floor(this.player.y / TILE_SIZE);
        set.add(ptx + ',' + pty);
      }
      for (const npc of (Balaclava.NPCS || [])) {
        const np = this.world.getNpcPlot(npc);
        if (np) {
          const off = this.world.getNpcTileOffset(npc);
          set.add((np[0] * PLOT_TILES + off[0]) + ',' + (np[1] * PLOT_TILES + off[1]));
        }
      }
      for (const b of this.buildings) {
        const def = Balaclava.BUILDINGS[b.type];
        const size = def ? def.size : 1;
        for (let dy = 0; dy < size; dy++) {
          for (let dx = 0; dx < size; dx++) {
            set.add((b.tx + dx) + ',' + (b.ty + dy));
          }
        }
      }
      return set;
    }

    getBuildingAtTile(tx, ty) {
      for (const b of this.buildings) {
        const def = Balaclava.BUILDINGS[b.type];
        const size = def ? def.size : 1;
        if (tx >= b.tx && tx < b.tx + size && ty >= b.ty && ty < b.ty + size) return b;
      }
      return null;
    }

    canPlaceBuilding(buildingId, tx, ty) {
      const def = Balaclava.BUILDINGS[buildingId];
      if (!def || this.activeDungeon) return false;
      if (def.reqSkill && !this.unlockedSkills.includes(def.reqSkill)) return false;
      if (this.omega && typeof this.omega.canPlace === 'function') {
        const oChk = this.omega.canPlace(this, buildingId, tx, ty);
        if (!oChk.ok) return false;
      }
      const size = def.size || 1;
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
          const cx = tx + dx;
          const cy = ty + dy;
          if (!this.world.isTileUnlocked(cx, cy)) return false;
          const tile = this.world.tiles[cy][cx];
          if (def.placeOn === 'water') {
            if (tile !== 0) return false;
          } else {
            if (tile !== 1 && tile !== 2) return false;
          }
          if (this.world.getNodeAtTile(cx, cy)) return false;
          if (this.getBuildingAtTile(cx, cy)) return false;
          for (const npc of Balaclava.NPCS) {
            const np = this.world.getNpcPlot(npc);
            const off = this.world.getNpcTileOffset(npc);
            const nx = np[0] * PLOT_TILES + off[0];
            const ny = np[1] * PLOT_TILES + off[1];
            if (cx === nx && cy === ny) return false;
          }
        }
      }
      if (this.placingItemId && (this.inventory[this.placingItemId] || 0) >= 1) return true;
      const cost = this.getAdjustedBuildCost(buildingId);
      for (const [id, q] of Object.entries(cost)) {
        if ((this.inventory[id] || 0) < q) return false;
      }
      return true;
    }

    placeBuilding(buildingId, tx, ty) {
      if (this.isPlayerDead()) return false;
      if (!this.canPlaceBuilding(buildingId, tx, ty)) {
        Balaclava.Audio.play('error');
        if (this.omega && typeof this.omega.canPlace === 'function') {
          const chk = this.omega.canPlace(this, buildingId, tx, ty);
          if (!chk.ok) {
            this.toast(chk.reason, 'warn');
            return false;
          }
        }
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('build.cannotPlaceHere') : 'No se puede construir aquí o faltan recursos.', 'warn');
        return false;
      }
      const def = Balaclava.BUILDINGS[buildingId];
      if (this.placingItemId && (this.inventory[this.placingItemId] || 0) >= 1) {
        this.removeItem(this.placingItemId, 1);
      } else {
        const cost = this.getAdjustedBuildCost(buildingId);
        for (const [id, q] of Object.entries(cost)) {
          this.removeItem(id, q);
        }
      }

      if (def.isBridge) {
        this.world.tiles[ty][tx] = 3; // bridge tile
      } else if (def.terraformsToLand) {
        this.world.tiles[ty][tx] = 1; // reclaimed habitable grass tile
        if (!Array.isArray(this.world.terraformedTiles)) this.world.terraformedTiles = [];
        if (!this.world.terraformedTiles.some(p => p[0] === tx && p[1] === ty)) {
          this.world.terraformedTiles.push([tx, ty]);
        }
      } else {
        const bObj = {
          id: this.nextBuildingId++,
          type: buildingId,
          tx, ty,
          level: 1,
          timer: 0,
          fuel: def.usesFuel ? 5 : 0,
          coinsStored: 0,
          storage: {},
          queue: [],
          autoRefuel: true,
          autoPull: true,
          isChest: Boolean(def.isChest),
          isOpen: false
        };
        if (def && def.omega) {
          bObj.omega = {
            priority: 2,
            job: null,
            timer: 0,
            status: 'activa'
          };
          if (def.omega.kind === 'press') bObj.omega.category = null;
          if (def.omega.kind === 'chamber') bObj.omega.activeCrystal = null;
        }
        this.buildings.push(bObj);
      }

      this.recordEncyclopedia('buildings', buildingId);
      this.recomputeModifiers();
      this.gainXp(Math.round(15 * (1 + (this.mods.craftXp || 0))));
      Balaclava.Audio.play('build');
      this.spawnParticles((tx + def.size * 0.5) * TILE_SIZE, (ty + def.size * 0.5) * TILE_SIZE, '#ffd54f', 14);
      this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.builtStructure', { name: def.name }) : `Construido: ${def.name}`, 'success');
      if (this.placingItemId && (this.inventory[this.placingItemId] || 0) <= 0) {
        this.placingBuildingId = null;
        this.placingItemId = null;
      } else if (!this.keys.Shift) {
        this.placingBuildingId = null;
        this.placingItemId = null;
      }
      this.uiDirty = true;
      return true;
    }

    demolishBuilding(b) {
      if (!b) return;
      const def = Balaclava.BUILDINGS[b.type || b.defId];
      if (b.storage) {
        const cx = (b.tx * TILE_SIZE) + 24;
        const cy = (b.ty * TILE_SIZE) + 24;
        for (const [id, qty] of Object.entries(b.storage)) {
          if (qty > 0 && typeof this.spawnDrop === 'function') {
            this.spawnDrop(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 20, id, qty);
          }
        }
        b.storage = {};
      }
      if (this.automation && this.automation.collectFromBuilding) {
        this.automation.collectFromBuilding(this, b);
      }
      this.buildings = this.buildings.filter(x => x !== b);
      if (def && def.cost) {
        Object.entries(def.cost).forEach(([id, q]) => this.addItem(id, Math.max(1, Math.floor(q * 0.5))));
      }
      this.recomputeModifiers();
      this.uiDirty = true;
    }

    // === ACTIONS, REACH & TARGET PRIORITY ===
    getActiveStrikeReach() {
      const slot = this.hotbar && this.hotbar[this.activeSlot];
      const modBonus = (this.mods && this.mods.reachBonus) || 0;
      if (slot && slot.kind === 'item') {
        const itemDef = Balaclava.ITEMS[slot.id];
        if (itemDef && (itemDef.isSpecialBlade || itemDef.weaponMelee)) {
          return ((itemDef.weaponMelee && itemDef.weaponMelee.range) || itemDef.bladeRange || 82) + modBonus;
        }
        if (itemDef && (itemDef.plantCrop || slot.id === 'fertilizante' || slot.id === 'abono_dorado' || slot.id === 'compost_magico')) {
          return 125 + modBonus;
        }
        return 76 + modBonus;
      }
      const toolId = (slot && slot.id) || 'pico';
      const tier = (this.toolTiers && this.toolTiers[toolId]) || 'basica';
      const stats = Balaclava.getToolStats(toolId, tier);
      const tb = this.getToolEnchantBonuses(toolId);
      return ((stats && stats.reach) || 74) + (tb.reachBonus || 0) + modBonus;
    }

    isTargetInReach(tx, ty, targetRadius = 0, customReach = null, targetKind = 'node') {
      const reach = customReach !== null ? customReach : this.getActiveStrikeReach();
      const radPad = (targetKind === 'enemy' || targetKind === 'animal')
        ? Math.min(34, Math.max(0, (targetRadius || 16) * 0.72))
        : Math.min(6, Math.max(0, (targetRadius || 0) * 0.2));
      return dist(this.player.x, this.player.y, tx, ty) <= reach + radPad;
    }

    isEntityInReach(entity, customReach = null, targetKind = 'enemy') {
      if (!entity || entity._dead || (entity.hp !== undefined && entity.hp <= 0)) return false;
      if (targetKind === 'enemy' && this.activeDungeon && typeof this.activeDungeon.hasLineOfSight === 'function') {
        if (!this.activeDungeon.hasLineOfSight(this.player.x, this.player.y, entity.x, entity.y)) {
          return false;
        }
      }
      const hb = Balaclava.Utils.getEntityHitbox ? Balaclava.Utils.getEntityHitbox(entity) : null;
      const effR = hb ? Math.max(entity.radius || 16, hb.radius) : (entity.radius || 16);
      if (this.isTargetInReach(entity.x, entity.y, effR, customReach, targetKind)) return true;
      return hb ? this.isTargetInReach(hb.cx, hb.cy, effR, customReach, targetKind) : false;
    }

    findHoveredEntity(wx, wy, customReach = null) {
      if (!Number.isFinite(wx) || !Number.isFinite(wy)) return null;
      const assets = Balaclava.Assets;
      const getHb = Balaclava.Utils.getEntityHitbox;
      const px = this.player.x;
      const py = this.player.y;

      let bestEnemy = null;
      let bestEnemyScore = Infinity;
      const checkEnemy = (e) => {
        if (!e || e._dead || e.hp <= 0) return;
        if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) return;
        if (this.activeDungeon && typeof this.activeDungeon.hasLineOfSight === 'function' && !this.activeDungeon.hasLineOfSight(px, py, e.x, e.y)) {
          return;
        }
        const hb = getHb(e);
        const dx = Math.abs(wx - hb.cx);
        const dy = Math.abs(wy - hb.cy);
        const feetD = dist(wx, wy, e.x, e.y);
        if ((dx <= hb.hw + 12 && dy <= hb.hh + 12) || feetD < 32 + hb.radius * 0.5) {
          const score = (dx / Math.max(12, hb.hw)) + (dy / Math.max(12, hb.hh));
          if (score < bestEnemyScore) {
            bestEnemyScore = score;
            bestEnemy = e;
          }
        }
      };
      if (this.activeDungeon) {
        for (let i = 0; i < this.activeDungeon.enemies.length; i++) checkEnemy(this.activeDungeon.enemies[i]);
        if (this.activeDungeon.boss) checkEnemy(this.activeDungeon.boss);
      } else {
        for (let i = 0; i < this.combat.enemies.length; i++) checkEnemy(this.combat.enemies[i]);
      }

      if (bestEnemy) {
        const e = bestEnemy;
        const hb = getHb(e);
        const inReach = this.isEntityInReach(e, customReach, 'enemy');
        const enemyThumbSpec = { kind: 'enemy', enemyType: e.type, isBoss: !!e.isBoss, sprite: e.sprite || e.spriteKey };
        const thumbUrl = null; // resuelto por UI via thumbSpec, no en render path
        return {
          kind: 'enemy',
          entity: e,
          x: e.x,
          y: e.y - 4,
          boxX: hb.cx,
          boxY: hb.cy,
          hitW: hb.w,
          hitH: hb.h,
          hitR: Math.max(hb.hw, hb.hh),
          inReach,
          enforceReach: false,
          name: e.name || 'Enemigo',
          sub: `Vida: ${Math.max(0, Math.ceil(e.hp || 0))}/${Math.ceil(e.maxHp || 0)} · Daño: ${e.dmg || 0}${inReach ? '' : ' · Fuera de alcance'}`,
          hp: e.hp,
          maxHp: e.maxHp,
          iconUrl: thumbUrl,
          thumbSpec: enemyThumbSpec,
          itemIcon: !thumbUrl ? 'espada_hierro' : null
        };
      }

      if (!this.activeDungeon && Array.isArray(this.world.sheep)) {
        let bestAnimal = null;
        let bestAnimalScore = Infinity;
        for (let i = 0; i < this.world.sheep.length; i++) {
          const a = this.world.sheep[i];
          if (!a || a._dead || a.hp <= 0) continue;
          const hb = getHb(a);
          const dx = Math.abs(wx - hb.cx);
          const dy = Math.abs(wy - hb.cy);
          const feetD = dist(wx, wy, a.x, a.y);
          if ((dx <= hb.hw + 10 && dy <= hb.hh + 10) || feetD < 28 + hb.radius * 0.45) {
            const score = (dx / Math.max(10, hb.hw)) + (dy / Math.max(10, hb.hh));
            if (score < bestAnimalScore) {
              bestAnimalScore = score;
              bestAnimal = a;
            }
          }
        }
        if (bestAnimal) {
          const a = bestAnimal;
          const hb = getHb(a);
          const inReach = this.isEntityInReach(a, customReach, 'animal');
          const rawKind = a.kind || a.species || 'sheep';
          const normKind = ({ cow: 'vaca', pig: 'cerdo', rabbit: 'conejo', duck: 'pato', chicken: 'pato' }[rawKind]) || rawKind;
          const animalNames = {
            vaca: 'Vaca', sheep: 'Oveja', cerdo: 'Cerdo', conejo: 'Conejo', pato: 'Pato',
            cow: 'Vaca', pig: 'Cerdo', rabbit: 'Conejo', duck: 'Pato', chicken: 'Gallina'
          };
          const animalThumbSpec = { kind: 'animal', animalKind: normKind };
          const aThumb = null; // resuelto por UI via thumbSpec
          return {
            kind: 'animal',
            entity: a,
            x: a.x,
            y: a.y - 4,
            boxX: hb.cx,
            boxY: hb.cy,
            hitW: hb.w,
            hitH: hb.h,
            hitR: Math.max(hb.hw, hb.hh),
            inReach,
            enforceReach: false,
            name: a.name || animalNames[rawKind] || 'Oveja',
            sub: `Vida: ${Math.max(0, Math.ceil(a.hp || 0))}/${Math.ceil(a.maxHp || 0)} · Fauna pasiva${inReach ? '' : ' · Fuera de alcance'}`,
            hp: a.hp,
            maxHp: a.maxHp,
            iconUrl: aThumb,
            thumbSpec: animalThumbSpec,
            itemIcon: !aThumb ? 'lana' : null
          };
        }
      }

      if (!this.activeDungeon) {
        for (const npc of Balaclava.NPCS) {
          const [ngx, ngy] = this.world.getNpcPlot(npc);
          if (!this.world.isPlotUnlocked(ngx, ngy)) continue;
          const off = this.world.getNpcTileOffset(npc);
          const nx = (ngx * PLOT_TILES + off[0] + 0.5) * TILE_SIZE;
          const ny = (ngy * PLOT_TILES + off[1] + 0.5) * TILE_SIZE;
          if (dist(wx, wy, nx, ny - 6) < 34) {
            const npcThumb = null; // resuelto por UI via npc.id
            const near = dist(px, py, nx, ny) <= 84;
            return {
              kind: 'npc',
              entity: npc,
              x: nx,
              y: ny - 8,
              hitR: 24,
              inReach: near,
              enforceReach: false,
              prompt: near ? { x: nx, y: ny - 68 } : null,
              name: npc.name,
              sub: npc.title || (Balaclava.I18n ? Balaclava.I18n.t('npc.talkHint') : 'Habitante del Archipiélago · Habla con [E]'),
              iconUrl: npcThumb
            };
          }
        }

        let bestBuilding = null;
        let bestBuildingDef = null;
        let bestBuildingD = Infinity;
        for (const b of this.buildings) {
          const bDef = Balaclava.BUILDINGS[b.type];
          if (!bDef) continue;
          const bx = (b.tx + bDef.size * 0.5) * TILE_SIZE;
          const by = (b.ty + bDef.size * 0.5) * TILE_SIZE;
          const spriteTopPad = Math.max(12, Math.round(bDef.size * 12));
          const top = b.ty * TILE_SIZE - spriteTopPad;
          const bottom = (b.ty + bDef.size) * TILE_SIZE + 8;
          const left = b.tx * TILE_SIZE - 8;
          const right = (b.tx + bDef.size) * TILE_SIZE + 8;
          if (wx >= left && wx <= right && wy >= top && wy <= bottom) {
            const d = dist(wx, wy, bx, by);
            if (d < bestBuildingD) {
              bestBuildingD = d;
              bestBuilding = b;
              bestBuildingDef = bDef;
            }
          }
        }
        if (bestBuilding) {
          const b = bestBuilding;
          const bDef = bestBuildingDef;
          const bx = (b.tx + bDef.size * 0.5) * TILE_SIZE;
          const by = (b.ty + bDef.size * 0.5) * TILE_SIZE;
          const topPad = Math.max(8, Math.round(bDef.size * 8));
          const bw = bDef.size * TILE_SIZE + 6;
          const bh = bDef.size * TILE_SIZE + topPad + 4;
          const firstCostItem = Object.keys(bDef.cost || {})[0];
          const bldgThumbSpec = { kind: 'building', buildingType: b.type };
          const bThumb = null; // resuelto por UI via thumbSpec
          const near = dist(px, py, bx, by) <= 94;
          return {
            kind: 'building',
            entity: b,
            x: bx,
            y: by,
            boxX: bx,
            boxY: by - Math.round(topPad * 0.4),
            hitW: bw,
            hitH: bh,
            hitR: Math.round(bDef.size * TILE_SIZE * 0.54),
            inReach: near,
            enforceReach: false,
            prompt: near ? { x: bx, y: b.ty * TILE_SIZE - 18 } : null,
            name: `${bDef.name}${b.level > 1 ? ` (${Balaclava.I18n ? Balaclava.I18n.t('common.levelShort') : 'Nv.'}${b.level})` : ''}`,
            sub: bDef.desc || (Balaclava.I18n ? Balaclava.I18n.t('bldg.interactOpen') : 'Estructura · Pulsa [E] para abrir'),
            iconUrl: bThumb || (bDef.station ? Balaclava.UI_URLS.anvil : null),
            thumbSpec: bldgThumbSpec,
            itemIcon: firstCostItem && Balaclava.ITEMS[firstCostItem] ? Balaclava.ITEMS[firstCostItem].icon : null
          };
        }

        let bestNode = null;
        let bestNodeD = Infinity;
        for (const n of this.world.nodes) {
          if (n.kind === 'fish_spot') continue;
          const rCheck = n.kind === 'dungeon_gate' ? 42 : 32;
          const d = dist(wx, wy, n.x, n.y - 4);
          if (d < rCheck && d < bestNodeD) {
            bestNodeD = d;
            bestNode = n;
          }
        }
        if (bestNode) {
          const n = bestNode;
          const isInt = ['dungeon_gate', 'altar_shrine', 'easter_egg', 'puzzle_pillar', 'chest', 'secret_chest', 'bone_totem', 'skeleton_king_shrine'].includes(n.kind);
          const inReach = isInt
            ? dist(px, py, n.x, n.y) <= Math.max(98, (customReach !== null ? customReach : this.getActiveStrikeReach()))
            : this.isTargetInReach(n.x, n.y, n.radius || 14, customReach, 'node');
          const hitR = n.kind === 'dungeon_gate' ? 38 : (n.kind === 'tree' || n.kind === 'giant_tree') ? 26 : 21;
          const prompt = (isInt && dist(px, py, n.x, n.y) <= 98) ? { x: n.x, y: n.y - 42 } : null;
          if (n.kind === 'altar_shrine') {
            const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
            const aDef = Balaclava.ALTAR_DEFS && Balaclava.ALTAR_DEFS[n.altarId];
            const altarSpec = { kind: 'altar', altarId: n.altarId };
            const aThumb = null; // resuelto por UI via thumbSpec
            return {
              kind: 'altar', entity: n, x: n.x, y: n.y - 8, hitR, inReach, enforceReach: false, prompt,
              name: aDef ? aDef.name : T('toast.altarSacred'),
              sub: aDef ? `${aDef.effectDetail || aDef.desc} (${aDef.durationText || ''})` : T('toast.altarAncient'),
              sub2: n.cooldownLeft > 0 ? T('hover.altarCooldown', { sec: Math.ceil(n.cooldownLeft) }) : T('hover.altarReady'),
              iconUrl: aThumb,
              thumbSpec: altarSpec,
              itemIcon: !aThumb ? 'reliquia_antigua' : null
            };
          }
          if (n.kind === 'dungeon_gate') {
            const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
            const gateSpec = { kind: 'gate', dungeonId: n.dungeonId };
            const gThumb = null; // resuelto por UI via thumbSpec
            const gateName = (Balaclava.DUNGEON_DEFS && Balaclava.DUNGEON_DEFS[n.dungeonId] && Balaclava.DUNGEON_DEFS[n.dungeonId].name)
              || (Balaclava.DUNGEON_GATES && Balaclava.DUNGEON_GATES[n.dungeonId] && Balaclava.DUNGEON_GATES[n.dungeonId].name)
              || n.name
              || T('toast.sacredAltarGeneric');
            return {
              kind: 'gate', entity: n, x: n.x, y: n.y - 8, hitR, inReach, enforceReach: false, prompt,
              name: gateName,
              sub: T('hover.gateSub', { lvl: n.recLevel || 2 }),
              iconUrl: gThumb,
              thumbSpec: gateSpec,
              itemIcon: !gThumb ? 'llave_mazmorra' : null
            };
          }
          const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
          const toolNames = {
            pico: (Balaclava.TOOLS && Balaclava.TOOLS.pico && Balaclava.TOOLS.pico.name) || 'Pico',
            hacha: (Balaclava.TOOLS && Balaclava.TOOLS.hacha && Balaclava.TOOLS.hacha.name) || 'Hacha',
            pala: (Balaclava.TOOLS && Balaclava.TOOLS.pala && Balaclava.TOOLS.pala.name) || 'Pala',
            guadana: (Balaclava.TOOLS && Balaclava.TOOLS.guadana && Balaclava.TOOLS.guadana.name) || 'Guadaña',
            espada: (Balaclava.TOOLS && Balaclava.TOOLS.espada && Balaclava.TOOLS.espada.name) || 'Espada'
          };
          const reqTier = n.reqTier ? ` (${(Balaclava.TIER_META[n.reqTier] && Balaclava.TIER_META[n.reqTier].name) || n.reqTier}+)` : '';
          const firstDrop = n.drops && n.drops[0] && Balaclava.ITEMS[n.drops[0].id];
          const specialSpriteKinds = ['easter_egg', 'chest', 'secret_chest', 'puzzle_pillar', 'bone_totem', 'skeleton_king_shrine'];
          const nodeThumbSpec = specialSpriteKinds.includes(n.kind) ? { kind: n.kind, eeId: n.eeId } : null;
          const nThumb = null; // resuelto por UI via thumbSpec
          const fallbackItemIcon = ({
            tree: 'madera',
            giant_tree: 'madera_oscura',
            bush: 'baya',
            herb_patch: 'hierba_curativa',
            wild_crop_patch: 'semilla_trigo',
            rock: 'piedra',
            coal_vein: 'carbon',
            dig_spot: 'arcilla',
            ancient_relic_node: 'fragmentos_antiguos',
            cactus: 'fruta_cactus',
            meteor_node: 'piedra_estelar',
            chest: 'oro',
            secret_chest: 'diamante'
          }[n.kind]) || 'piedra';
          const rangeNote = (!isInt && !inReach) ? T('hover.outOfReach') : '';
          return {
            kind: 'node', entity: n, x: n.x, y: n.y - 8, hitR, inReach, enforceReach: !isInt, prompt,
            name: (Balaclava.NODE_DISPLAY_NAMES && Balaclava.NODE_DISPLAY_NAMES[n.kind]) || (this.world && this.world.NODE_DISPLAY_NAMES && this.world.NODE_DISPLAY_NAMES[n.kind]) || n.name || n.kind,
            sub: (n.maxHp > 0
              ? T('hover.hpReqTool', { cur: Math.max(0, Math.ceil(n.hp)), max: Math.ceil(n.maxHp), tool: toolNames[n.tool] || T('hover.toolFallback'), tier: reqTier })
              : T('hover.interactE')) + rangeNote,
            hp: n.maxHp > 0 ? n.hp : null,
            maxHp: n.maxHp > 0 ? n.maxHp : null,
            iconUrl: nThumb,
            thumbSpec: nodeThumbSpec,
            itemIcon: firstDrop ? firstDrop.icon : (!nThumb ? fallbackItemIcon : null)
          };
        }

        const mtx = Math.floor(wx / TILE_SIZE);
        const mty = Math.floor(wy / TILE_SIZE);
        const c = this.world.crops.find(cr => cr.tx === mtx && cr.ty === mty);
        if (c) {
          const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
          const cDef = Balaclava.CROPS && Balaclava.CROPS[c.cropId];
          const cx = (c.tx + 0.5) * TILE_SIZE;
          const cy = (c.ty + 0.5) * TILE_SIZE;
          const inReach = this.isTargetInReach(cx, cy, 12, customReach, 'crop');
          const pct = Math.min(100, Math.round((c.progress || 0) * 100));
          return {
            kind: 'crop',
            entity: c,
            x: cx,
            y: cy,
            hitR: 22,
            inReach,
            enforceReach: true,
            prompt: (c.stage >= 3 && dist(px, py, cx, cy) <= 74) ? { x: cx, y: cy - 34 } : null,
            name: cDef ? cDef.name : T('hover.cropFallback'),
            sub: (c.stage >= 3 ? T('farm.readyHarvest') : `${T('farm.growthPct', { pct })} · ${c.watered ? T('farm.watered') : T('farm.needsWater')}${c.fertilized ? ' · ' + T('farm.fertilized') : ''}`) + (inReach ? '' : ' · ' + T('farm.outOfReach')),
            itemIcon: cDef && Balaclava.ITEMS[cDef.yieldId] ? Balaclava.ITEMS[cDef.yieldId].icon : null
          };
        }
      } else if (this.activeDungeon) {
        const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
        const dung = this.activeDungeon;
        if (Array.isArray(dung.chests)) {
          for (const dc of dung.chests) {
            const cx = (dc.tx + 0.5) * TILE_SIZE;
            const cy = (dc.ty + 0.5) * TILE_SIZE;
            if (Math.abs(wx - cx) <= 36 && wy >= cy - 48 && wy <= cy + 28) {
              const near = dist(px, py, cx, cy) <= 92;
              return {
                kind: 'dungeon_chest',
                entity: dc,
                x: cx,
                y: cy - 12,
                boxX: cx,
                boxY: cy - 12,
                hitW: 64,
                hitH: 58,
                hitR: 32,
                inReach: near,
                enforceReach: false,
                name: dc.opened ? T('dungeon.chestEmpty') : (dc.bonus ? T('dungeon.chestSapphire') : T('dungeon.chestDungeon')),
                sub: dc.opened ? T('dungeon.chestLooted') : T('dungeon.chestPrompt'),
                itemIcon: 'oro'
              };
            }
          }
        }
        if (Array.isArray(dung.crates)) {
          for (const cr of dung.crates) {
            if (cr.broken) continue;
            const cx = (cr.tx + 0.5) * TILE_SIZE;
            const cy = (cr.ty + 0.5) * TILE_SIZE;
            if (dist(wx, wy, cx, cy) <= 28) {
              const inReach = this.isTargetInReach(cx, cy, 18, customReach, 'node');
              return {
                kind: 'dungeon_crate',
                entity: cr,
                x: cx,
                y: cy,
                boxX: cx,
                boxY: cy - 2,
                hitW: 40,
                hitH: 40,
                hitR: 22,
                inReach,
                enforceReach: true,
                name: Balaclava.I18n ? Balaclava.I18n.t('hover.crateName') : 'Caja Antigua',
                sub: Balaclava.I18n ? Balaclava.I18n.t('hover.crateSub') : 'Estructura · Golpea para romper',
                itemIcon: 'madera'
              };
            }
          }
        }
        if (dung.exitPortal && dung.exitPortal.active) {
          const ex = (dung.exitPortal.tx + 0.5) * TILE_SIZE;
          const ey = (dung.exitPortal.ty + 0.5) * TILE_SIZE;
          if (dist(wx, wy, ex, ey) <= 32) {
            return {
              kind: 'dungeon_exit_portal',
              entity: dung.exitPortal,
              x: ex,
              y: ey,
              boxX: ex,
              boxY: ey,
              hitW: 52,
              hitH: 52,
              hitR: 28,
              inReach: dist(px, py, ex, ey) <= 96,
              enforceReach: false,
              name: Balaclava.I18n ? Balaclava.I18n.t('hover.exitPortalName') : 'Portal de Salida',
              sub: Balaclava.I18n ? Balaclava.I18n.t('dungeon.portalExit') : 'Pulsa [E] o haz clic para confirmar salida',
              itemIcon: 'portal'
            };
          }
        }
        if (Array.isArray(dung.pillars)) {
          for (const pl of dung.pillars) {
            const plx = (pl.tx + 0.5) * TILE_SIZE;
            const ply = (pl.ty + 0.5) * TILE_SIZE;
            if (Math.abs(wx - plx) <= 26 && wy >= ply - 52 && wy <= ply + 24) {
              return {
                kind: 'dungeon_pillar',
                entity: pl,
                x: plx,
                y: ply - 14,
                boxX: plx,
                boxY: ply - 14,
                hitW: 40,
                hitH: 74,
                hitR: 30,
                inReach: dist(px, py, plx, ply) <= 92,
                enforceReach: false,
                name: Balaclava.I18n ? Balaclava.I18n.t('hover.pillarName') : 'Pilar Antiguo',
                sub: Balaclava.I18n ? Balaclava.I18n.t('hover.pillarSub') : 'Estructura de mazmorra',
                itemIcon: 'piedra'
              };
            }
          }
        }
        if (Array.isArray(dung.levers)) {
          for (const lv of dung.levers) {
            const lx = (lv.tx + 0.5) * TILE_SIZE;
            const ly = (lv.ty + 0.5) * TILE_SIZE;
            if (dist(wx, wy, lx, ly) <= 28) {
              const near = dist(px, py, lx, ly) <= 84;
              return {
                kind: 'dungeon_lever',
                entity: lv,
                x: lx,
                y: ly,
                boxX: lx,
                boxY: ly - 4,
                hitW: 42,
                hitH: 42,
                hitR: 22,
                inReach: near,
                enforceReach: false,
                name: lv.pulled ? (Balaclava.I18n ? Balaclava.I18n.t('dungeon.leverActive') : 'Palanca Activada') : (Balaclava.I18n ? Balaclava.I18n.t('dungeon.leverIdle') : 'Palanca Rúnica'),
                sub: Balaclava.I18n ? Balaclava.I18n.t('dungeon.leverSub') : 'Mecanismo de mazmorra',
                itemIcon: 'hierro'
              };
            }
          }
        }
        if (dung.exit) {
          const ex = (dung.exit.tx + 0.5) * TILE_SIZE;
          const ey = (dung.exit.ty + 0.5) * TILE_SIZE;
          if (dist(wx, wy, ex, ey) <= 36) {
            return {
              kind: 'dungeon_exit',
              entity: dung.exit,
              x: ex,
              y: ey,
              boxX: ex,
              boxY: ey,
              hitW: 54,
              hitH: 54,
              hitR: 28,
              inReach: dist(px, py, ex, ey) <= 86,
              enforceReach: false,
              name: Balaclava.I18n ? Balaclava.I18n.t('hover.exitPortalName') : 'Portal de Salida',
              sub: Balaclava.I18n ? Balaclava.I18n.t('dungeon.portalExit') : 'Pulsa [E] sobre el portal para salir',
              itemIcon: 'nucleo_balaclava'
            };
          }
        }
      }
      return null;
    }

    swingSpecialBlade(itemDef, wx, wy) {
      if (this.isPlayerDead()) return;
      if (this.player.swingTimer > 0) return;
      if (!Number.isFinite(wx)) wx = this.player.x + (this.player.facing || 1) * 90;
      if (!Number.isFinite(wy)) wy = this.player.y;
      const bStats = itemDef.bladeStats || itemDef.weaponMelee || {};
      const range = (bStats.range || itemDef.bladeRange || 82) + (this.mods.reachBonus || 0);
      const hovered = this.findHoveredEntity(wx, wy, range);
      if (hovered && hovered.kind === 'enemy') {
        this.selectedEnemy = hovered.entity;
      }

      const energyCost = this.player.godMode ? 0 : Math.max(0.8, (bStats.energyCost || 3.0) * (1 - (this.mods.energySave || 0)));
      if (!this.player.godMode && this.player.energy < energyCost) {
        if ((this.time - (this._lastLowEnWarn || -99)) >= 1.35) {
          this._lastLowEnWarn = this.time;
          this.addFloatingText(this.player.x, this.player.y - 24, Balaclava.I18n ? Balaclava.I18n.t('toast.lowEnergyEat') : '¡Sin energía! Come bayas/pan', '#ff8a65');
        }
        return;
      }
      if (energyCost > 0) this.player.energy = Math.max(0, this.player.energy - energyCost);
      const aimX = hovered && hovered.inReach ? hovered.x : wx;
      const aimY = hovered && hovered.inReach ? hovered.y : wy;
      const ang = Math.atan2(aimY - this.player.y, aimX - this.player.x);
      this.player.facing = Math.cos(ang) >= 0 ? 1 : -1;
      this.player.swingAngle = ang;
      this.player.swingTool = 'espada';
      this.player.swingItemId = itemDef.id;
      this.player.attackCount = (this.player.attackCount || 0) + 1;
      const baseDur = typeof bStats.speed === 'number'
        ? (bStats.speed < 0.7 ? bStats.speed : 0.28 / Math.max(0.4, bStats.speed))
        : (bStats.cooldown || 0.28);
      const spdBonus = 1 + (this.mods.attackSpeed || 0);
      this.player.swingDur = Math.max(0.11, baseDur / spdBonus);
      this.player.swingTimer = this.player.swingDur;

      const hitX = this.player.x + Math.cos(ang) * 34;
      const hitY = this.player.y + Math.sin(ang) * 34;
      const tint = bStats.color || bStats.arcColor || itemDef.bladeColor || '#ffd54f';
      const uMode = bStats.uniqueMode || itemDef.id;
      const baseBladeDmg = Math.max(4, Math.round((bStats.dmg || itemDef.bladeDmg || 38) * (1 + (this.mods.dmgBonus || 0))));
      this.spawnParticles(hitX, hitY, tint, 6);

      const isFire = (uMode === 'flame_wave' || uMode === 'solar_nova' || bStats.burnDmg || itemDef.bladeEffect === 'burn' || tint === '#ff7043' || (itemDef.id && (itemDef.id.includes('llamarada') || itemDef.id.includes('ignea'))));
      const isFrost = (uMode === 'frost_spikes' || bStats.slow || itemDef.bladeEffect === 'slow' || tint === '#4fc3f7' || (itemDef.id && (itemDef.id.includes('glacial') || itemDef.id.includes('escarcha'))));
      const isElectric = (uMode === 'chain_arc' || uMode === 'thunder_tempest' || tint === '#80deea' || (itemDef.id && (itemDef.id.includes('relampago') || itemDef.id.includes('tormenta'))));
      const isDark = (uMode === 'void_boomerang' || uMode === 'void_vortex' || uMode === 'bone_siphon' || itemDef.bladeEffect === 'lifesteal' || bStats.lifeSteal || (itemDef.id && (itemDef.id.includes('abisal') || itemDef.id.includes('sombra'))));
      const isHoly = (uMode === 'holy_slam' || tint === '#ffd54f' || (itemDef.id && (itemDef.id.includes('solar') || itemDef.id.includes('paladin'))));

      // Signature VFX + Unique Mechanics per Special Weapon
      const enemyList = (this.activeDungeon
        ? [...this.activeDungeon.enemies, ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
        : this.combat.enemies
      ).filter(e => e && !e._dead && (!this.activeDungeon || typeof this.activeDungeon.hasLineOfSight !== 'function' || this.activeDungeon.hasLineOfSight(this.player.x, this.player.y, e.x, e.y)));

      if (uMode === 'flame_wave' || itemDef.id === 'espada_llamarada') {
        this.spawnFx('pa_slash2_fire', hitX, hitY, ang, 0.34, 1.0, 0.96, { blend: 'lighter' });
        this.spawnPlayerProjectile(hitX, hitY, Math.cos(ang) * 440, Math.sin(ang) * 440, Math.round(baseBladeDmg * 0.72), '#ff7043', false, {
          life: 0.52, pierce: 99, burnDmg: 8, hitsNodes: true, vfxKey: 'soggy_fire_slash', vfxHit: 'pvfx_fireball_impact', usedId: itemDef.id
        });
      } else if (uMode === 'frost_spikes' || itemDef.id === 'hoja_glacial') {
        this.spawnFx('pa_slash1_blue', hitX, hitY, ang, 0.32, 0.98, 0.96, { blend: 'lighter' });
        [-0.26, 0, 0.26].forEach(off => {
          const a = ang + off;
          this.spawnPlayerProjectile(hitX, hitY, Math.cos(a) * 460, Math.sin(a) * 460, Math.round(baseBladeDmg * 0.55), '#4fc3f7', false, {
            life: 0.52, pierce: 2, slowDur: 3.6, vfxKey: 'pvfx_ice_shard', vfxHit: 'aw_ice_chargeshatter', usedId: itemDef.id
          });
        });
      } else if (uMode === 'solar_nova' || itemDef.id === 'espada_solar_mitica') {
        this.spawnFx('pa_slash3_gold', hitX, hitY, ang, 0.36, 1.15, 0.98, { blend: 'lighter' });
        this.spawnFx('pvfx_solar_shrapnel', hitX, hitY, 0, 0.55, 1.25, 0.95, { blend: 'lighter' });
        this.spawnFx('aw_holy_pillar', hitX + Math.cos(ang) * 26, hitY + Math.sin(ang) * 26, 0, 0.52, 0.95, 0.92, { blend: 'lighter' });
        this.spawnShockwave(hitX, hitY, 155, '#ffd54f');
        for (const e of enemyList) {
          if (e && !e._dead && dist(hitX, hitY, e.x, e.y) <= 155) {
            this.combat.damageEnemy(this, e, Math.round(baseBladeDmg * 0.45), ang, false, false);
            e.burnTimer = Math.max(e.burnTimer || 0, 3.5);
          }
        }
      } else if (uMode === 'void_boomerang' || itemDef.id === 'media_luna_abisal') {
        this.spawnFx('aw_slash_wave', hitX, hitY, ang, 0.34, 1.05, 0.96, { blend: 'lighter' });
        this.spawnPlayerProjectile(hitX, hitY, Math.cos(ang) * 480, Math.sin(ang) * 480, Math.round(baseBladeDmg * 0.65), '#7e57c2', false, {
          life: 1.05, maxLife: 1.05, pierce: 99, boomerang: true, lifeSteal: 0.08, vfxKey: 'dark_vfx2', vfxHit: 'pvfx_shadow_claw', usedId: itemDef.id
        });
      } else if (uMode === 'prism_rays' || itemDef.id === 'espada_prismatica') {
        this.spawnFx('pvfx_prism_loom', hitX, hitY, ang, 0.44, 1.15, 0.98, { blend: 'lighter' });
        const cols = ['#ff4081', '#ffd54f', '#00e5ff'];
        [-0.24, 0, 0.24].forEach((off, idx) => {
          const a = ang + off;
          this.spawnPlayerProjectile(hitX, hitY, Math.cos(a) * 580, Math.sin(a) * 580, Math.round(baseBladeDmg * 0.6), cols[idx], false, {
            life: 0.56, pierce: 4, vfxKey: 'px_energy_bolt', vfxHit: 'pvfx_firework_burst', usedId: itemDef.id
          });
        });
      } else if (uMode === 'sakura_flurry' || itemDef.id === 'katana_sakura') {
        this.spawnFx('aw_slash_x', hitX, hitY, ang, 0.30, 0.95, 0.98, { blend: 'lighter' });
        [-0.35, -0.12, 0.12, 0.35].forEach(off => {
          const a = ang + off;
          this.spawnPlayerProjectile(hitX, hitY, Math.cos(a) * 430, Math.sin(a) * 430, Math.round(baseBladeDmg * 0.42), '#f48fb1', false, {
            life: 0.58, homing: true, pierce: 0, vfxKey: 'pa_rogue3', vfxHit: 'pvfx_wind_blade', usedId: itemDef.id
          });
        });
      } else if (uMode === 'bramble_snare' || itemDef.id === 'hoja_espinas') {
        this.spawnFx('pa_slash1_green', hitX, hitY, ang, 0.32, 0.98, 0.95, { blend: 'lighter' });
        const bx = hitX + Math.cos(ang) * 32;
        const by = hitY + Math.sin(ang) * 32;
        this.spawnFx('pvfx_vine_snare', bx, by, 0, 0.62, 1.15, 0.96);
        this.spawnFx('pvfx_earth_spike', bx, by, 0, 0.48, 1.0, 0.92);
        for (const e of enemyList) {
          if (e && !e._dead && dist(bx, by, e.x, e.y) <= 98) {
            e.slowTimer = Math.max(e.slowTimer || 0, 3.0);
            e.poisonTimer = Math.max(e.poisonTimer || 0, 3.5);
          }
        }
      } else if (uMode === 'void_vortex' || itemDef.id === 'cetro_prism_vacio') {
        this.spawnFx('pa_slash1_purple', hitX, hitY, ang, 0.34, 1.05, 0.96, { blend: 'lighter' });
        const vx = hitX + Math.cos(ang) * 48;
        const vy = hitY + Math.sin(ang) * 48;
        this.spawnFx('pvfx_void_implosion', vx, vy, 0, 0.65, 1.18, 0.98, { blend: 'lighter' });
        for (const e of enemyList) {
          if (e && !e._dead && !e.isBoss && dist(vx, vy, e.x, e.y) <= 155) {
            e.x += (vx - e.x) * 0.48;
            e.y += (vy - e.y) * 0.48;
          }
        }
      } else if (uMode === 'chain_arc' || itemDef.id === 'espada_relampago') {
        this.spawnFx('pa_slash2_cyan', hitX, hitY, ang, 0.32, 0.98, 0.96, { blend: 'lighter' });
        const near = enemyList.filter(e => e && !e._dead && dist(hitX, hitY, e.x, e.y) <= 190).slice(0, 2);
        for (const ne of near) {
          this.spawnFx('lt_bolt1', ne.x, ne.y - 10, 0, 0.32, 0.95, 0.95, { blend: 'lighter' });
          this.combat.damageEnemy(this, ne, Math.round(baseBladeDmg * 0.55), ang, false, false);
        }
      } else if (uMode === 'thunder_tempest' || itemDef.id === 'espada_tormenta') {
        this.spawnFx('aw_lightning_arc', hitX, hitY, ang, 0.38, 1.12, 0.98, { blend: 'lighter' });
        const sx = hitX + Math.cos(ang) * 38;
        const sy = hitY + Math.sin(ang) * 38;
        this.spawnFx('pvfx_thunder_cloud', sx, sy - 44, 0, 0.72, 1.15, 0.95);
        this.spawnFx('pvfx_lightning_strike', sx, sy + 6, 0, 0.45, 1.1, 0.98, { blend: 'lighter' });
        this.spawnFx('aw_explosion_electric', sx, sy, 0, 0.42, 0.95, 0.92, { blend: 'lighter' });
        for (const e of enemyList) {
          if (e && !e._dead && dist(sx, sy, e.x, e.y) <= 125) {
            this.combat.damageEnemy(this, e, Math.round(baseBladeDmg * 0.52), ang, false, false);
          }
        }
      } else if (uMode === 'bone_siphon' || itemDef.id === 'espada_hueso_rey') {
        this.spawnFx('aw_slash_heavy', hitX, hitY, ang, 0.34, 1.05, 0.96, { blend: 'lighter' });
        this.spawnFx('pvfx_shadow_claw', hitX + Math.cos(ang) * 18, hitY + Math.sin(ang) * 18, ang, 0.42, 1.08, 0.95, { blend: 'lighter' });
        this.spawnFx('pvfx_soul_drain', hitX, hitY, ang, 0.46, 0.95, 0.88, { blend: 'lighter' });
      } else if (uMode === 'holy_slam' || itemDef.id === 'martillo_paladin') {
        this.spawnFx('pvfx_hammer_smash', hitX, hitY, ang, 0.40, 1.15, 0.98, { blend: 'lighter' });
        this.spawnFx('pvfx_holy_smite', hitX + Math.cos(ang) * 20, hitY + Math.sin(ang) * 20, 0, 0.50, 1.05, 0.96, { blend: 'lighter' });
        this.spawnShockwave(hitX, hitY, 115, '#ffd54f');
        this.shake(0.14, 3.8);
        for (const e of enemyList) {
          if (e && !e._dead && dist(hitX, hitY, e.x, e.y) <= 115) {
            const extra = /skel|golem|grave|undead/i.test(e.type || '') ? 1.45 : 1.0;
            this.combat.damageEnemy(this, e, Math.round(baseBladeDmg * 0.45 * extra), ang, false, false);
            if (!e.isBoss && Math.random() < 0.35) e.stunTimer = Math.max(e.stunTimer || 0, 1.4);
          }
        }
      } else {
        this.spawnFx('aw_slash_horizontal', hitX, hitY, ang, 0.28, 0.85, 0.95, { blend: 'lighter' });
      }

      if (isFire) {
        this.spawnParticles(hitX + Math.cos(ang) * 12, hitY + Math.sin(ang) * 12, '#ffab40', 4);
      } else if (isFrost) {
        this.spawnParticles(hitX, hitY, '#e0f7fa', 4);
      } else if (isElectric) {
        this.spawnParticles(hitX, hitY, '#ffffff', 4);
        if (typeof this.spawnShockwave === 'function') this.spawnShockwave(hitX, hitY, 32, '#80d8ff');
      } else if (isDark) {
        this.spawnParticles(hitX, hitY, '#7e57c2', 4);
      } else if (isHoly) {
        this.spawnParticles(hitX, hitY, '#fff9c4', 4);
      }

      Balaclava.Audio.play('slash');

      const applyBladeHit = (e) => {
        const critRate = (this.mods.critChance || 0) + (bStats.critBonus || 0) + (itemDef.bladeEffect === 'crit' ? 0.25 : 0.08);
        const isCrit = Math.random() < critRate;
        const base = bStats.dmg || itemDef.bladeDmg || 38;
        const dmg = Math.max(4, Math.round(base * (1 + (this.mods.dmgBonus || 0)) * (isCrit ? 2 : 1)));
        this.combat.damageEnemy(this, e, dmg, ang, isCrit);
        if (itemDef.bladeEffect === 'burn' || bStats.burnDmg || isFire) e.burnTimer = Math.max(e.burnTimer || 0, 3.5);
        if (itemDef.bladeEffect === 'slow' || bStats.slow || isFrost) e.slowTimer = Math.max(e.slowTimer || 0, 3.5);
        if (bStats.stunChance && Math.random() < bStats.stunChance && !e.isBoss) {
          e.stunTimer = Math.max(e.stunTimer || 0, 1.6);
          e.slowTimer = Math.max(e.slowTimer || 0, 1.8);
          this.addFloatingText(e.x, e.y - 32, Balaclava.I18n ? Balaclava.I18n.t('toast.stunned') : 'Aturdido!', '#ffe082');
        }
        if (itemDef.bladeEffect === 'lifesteal' || bStats.lifeSteal) this.healPlayer(Math.max(2, Math.round(dmg * (bStats.lifeSteal || 0.1))), 0);
      };

      const prioritizedEnemy = (hovered && hovered.kind === 'enemy' && hovered.inReach) ? hovered.entity : null;
      if (prioritizedEnemy) applyBladeHit(prioritizedEnemy);
      const wideCleave = !!(bStats && bStats.cleave);
      for (const e of enemyList) {
        if (!e || e._dead || e.hp <= 0 || e === prioritizedEnemy) continue;
        if (!this.isEntityInReach(e, range, 'enemy')) continue;
        const eAng = Math.atan2(e.y - this.player.y, e.x - this.player.x);
        if (wideCleave || Math.cos(eAng - ang) >= 0.18 || dist(this.player.x, this.player.y, e.x, e.y) <= 34) {
          applyBladeHit(e);
        }
      }
      if (!this.activeDungeon && Array.isArray(this.world.sheep)) {
        const baseAnimalDmg = (itemDef.weaponMelee && itemDef.weaponMelee.dmg) || itemDef.bladeDmg || 36;
        const animalDmg = Math.max(4, Math.round(baseAnimalDmg * (1 + (this.mods.dmgBonus || 0))));
        const prioritizedAnimal = (hovered && hovered.kind === 'animal' && hovered.inReach) ? hovered.entity : null;
        if (prioritizedAnimal) {
          this.combat.damageAnimal(this, prioritizedAnimal, animalDmg, ang, false);
        } else if (!prioritizedEnemy) {
          for (let si = this.world.sheep.length - 1; si >= 0; si--) {
            const a = this.world.sheep[si];
            if (!a || a._dead || a.hp <= 0) continue;
            if (!this.isEntityInReach(a, range, 'animal')) continue;
            const aAng = Math.atan2(a.y - this.player.y, a.x - this.player.x);
            if (Math.cos(aAng - ang) >= 0.18 || dist(this.player.x, this.player.y, a.x, a.y) <= 34) {
              this.combat.damageAnimal(this, a, animalDmg, ang, false);
              break;
            }
          }
        }
      }
    }

    fireSpecializedWeapon(itemDef, wx, wy) {
      if (this.isPlayerDead() || this.player.swingTimer > 0) return false;
      if (!Number.isFinite(wx)) wx = this.player.x + (this.player.facing || 1) * 140;
      if (!Number.isFinite(wy)) wy = this.player.y;
      const st = itemDef.isStaffWeapon ? itemDef.staffStats : itemDef.rangedStats;
      if (!st) return false;
      const eCost = this.player.godMode
        ? 0
        : (itemDef.isStaffWeapon
          ? Math.max(1, (st.energyCost || 3) * (1 - Math.min(0.45, (this.mods.manaSave || 0) + (this.mods.energySave || 0))))
          : Math.max(0.8, 2.0 * (1 - (this.mods.energySave || 0))));
      if (!this.player.godMode && this.player.energy < eCost) {
        if ((this.time - (this._lastLowEnWarn || -99)) >= 1.35) {
          this._lastLowEnWarn = this.time;
          this.addFloatingText(this.player.x, this.player.y - 24, Balaclava.I18n ? Balaclava.I18n.t('toast.noEnergy') : '¡Sin energía!', '#ff8a65');
        }
        return false;
      }
      if (eCost > 0) this.player.energy = Math.max(0, this.player.energy - eCost);
      const ang = Math.atan2(wy - this.player.y, wx - this.player.x);
      this.player.facing = Math.cos(ang) >= 0 ? 1 : -1;
      this.player.swingAngle = ang;
      this.player.swingTool = itemDef.isStaffWeapon ? 'baculo' : 'arco';
      this.player.swingItemId = itemDef.id;
      const cd = Math.max(0.14, (st.cooldown || 0.28) / (1 + (this.mods.attackSpeed || 0)));
      this.player.swingDur = cd;
      this.player.swingTimer = cd;

      const spMult = itemDef.isStaffWeapon ? (1 + (this.mods.spellPower || 0)) : (1 + (this.mods.dmgBonus || 0));
      const dmg = Math.max(6, Math.round((st.dmg || 32) * spMult));
      const spd = st.speed || 540;
      const life = Math.max(0.45, (st.range || 440) / spd);
      const sx = this.player.x + Math.cos(ang) * 16;
      const sy = this.player.y + Math.sin(ang) * 16;
      const sMode = st.staffMode || (itemDef.isStaffWeapon ? itemDef.id : null);

      if (sMode === 'frost_cone') {
        this.spawnFx('aw_ice_castfrost', sx, sy, ang, 0.30, 0.85, 0.95, { blend: 'lighter' });
        [-0.22, 0, 0.22].forEach(off => {
          const a = ang + off;
          this.spawnPlayerProjectile(sx, sy, Math.cos(a) * spd, Math.sin(a) * spd, dmg, st.color || '#80deea', false, {
            life, pierce: 1, slowDur: st.slowDur || 2.6, hitsNodes: true, vfxKey: 'pvfx_ice_shard', vfxHit: 'aw_ice_chargeshatter', usedId: itemDef.id
          });
        });
      } else if (sMode === 'homing_twins') {
        this.spawnFx('aw_fire_castflame', sx, sy, ang, 0.30, 0.85, 0.95, { blend: 'lighter' });
        [-0.28, 0.28].forEach(off => {
          const a = ang + off;
          this.spawnPlayerProjectile(sx, sy, Math.cos(a) * spd, Math.sin(a) * spd, dmg, st.color || '#ff7043', false, {
            life: life * 1.15, homing: true, aoeRadius: st.aoeRadius || 34, burnDmg: st.burnDmg || 8, hitsNodes: true, vfxKey: 'soggy_fireball', vfxHit: 'pvfx_fireball_impact', usedId: itemDef.id
          });
        });
      } else if (sMode === 'druid_bloom') {
        this.spawnFx('pvfx_leaf_gust', sx, sy, ang, 0.35, 0.92, 0.92, { blend: 'lighter' });
        this.spawnPlayerProjectile(sx, sy, Math.cos(ang) * spd, Math.sin(ang) * spd, dmg, st.color || '#81c784', false, {
          life, pierce: st.pierce || 2, slowDur: st.slowDur || 1.8, poisonDmg: st.poisonDmg || 7, healOnHit: 4, hitsNodes: true, vfxKey: 'pvfx_poison_dart', vfxHit: 'pvfx_bloom_heal', usedId: itemDef.id
        });
      } else if (sMode === 'lunar_boomerang') {
        this.spawnFx('aw_arcane_charge', sx, sy, ang, 0.28, 0.85, 0.95, { blend: 'lighter' });
        this.spawnPlayerProjectile(sx, sy, Math.cos(ang) * spd, Math.sin(ang) * spd, dmg, st.color || '#b39ddb', false, {
          life: 1.35, maxLife: 1.35, pierce: 99, boomerang: true, hitsNodes: true, vfxKey: 'aw_slash_wave', vfxHit: 'pvfx_shadow_claw', usedId: itemDef.id
        });
      } else if (sMode === 'archmage_cluster') {
        this.spawnFx('aw_fire_chargeburst_max', sx, sy, ang, 0.36, 0.90, 0.98, { blend: 'lighter' });
        this.spawnPlayerProjectile(sx, sy, Math.cos(ang) * spd, Math.sin(ang) * spd, dmg, st.color || '#ff5252', false, {
          life, aoeRadius: st.aoeRadius || 68, burnDmg: st.burnDmg || 10, clusterSplit: 4, hitsNodes: true, vfxKey: 'pvfx_arcane_orb_projectile', vfxHit: 'pvfx_fire_nova', usedId: itemDef.id
        });
      } else {
        this.spawnPlayerProjectile(
          this.player.x, this.player.y, Math.cos(ang) * spd, Math.sin(ang) * spd, dmg,
          st.color || (itemDef.isStaffWeapon ? '#ce93d8' : '#ffe082'),
          !itemDef.isStaffWeapon,
          { life, pierce: st.pierce || 0, aoeRadius: st.aoeRadius || 0, slowDur: st.slowDur || 0, burnDmg: st.burnDmg || 0, hitsNodes: !!itemDef.isStaffWeapon, vfxKey: st.vfxKey, usedId: itemDef.id }
        );
      }
      this.spawnParticles(sx, sy, st.color || '#ce93d8', 6);
      Balaclava.Audio.play(itemDef.isStaffWeapon ? 'laser' : 'bow');
      return true;
    }

    unlockSpell(spellId) {
      const sp = Balaclava.SPELLS && Balaclava.SPELLS[spellId];
      if (!sp) return false;
      if (!Array.isArray(this.unlockedSpells)) this.unlockedSpells = ['misil_arcano'];
      if (this.unlockedSpells.includes(spellId)) return false;
      this.unlockedSpells.push(spellId);
      if (!Array.isArray(this.spellSlots)) this.spellSlots = ['misil_arcano', null, null, null];
      const emptyIdx = this.spellSlots.findIndex(s => !s);
      if (emptyIdx !== -1 && !this.spellSlots.includes(spellId)) {
        this.spellSlots[emptyIdx] = spellId;
      }
      Balaclava.Audio.play('levelup');
      this.spawnParticles(this.player.x, this.player.y, sp.color || '#ce93d8', 22);
      this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.spellLearned', { name: sp.name }) : `¡Hechizo aprendido: ${sp.name}!`, 'success');
      this.uiDirty = true;
      return true;
    }

    assignSpellSlot(slotIdx, spellId) {
      if (slotIdx < 0 || slotIdx > 3) return false;
      if (!Array.isArray(this.unlockedSpells)) this.unlockedSpells = ['misil_arcano'];
      if (spellId && !this.unlockedSpells.includes(spellId)) return false;
      if (!Array.isArray(this.spellSlots)) this.spellSlots = ['misil_arcano', null, null, null];
      if (spellId) {
        const oldIdx = this.spellSlots.indexOf(spellId);
        if (oldIdx !== -1 && oldIdx !== slotIdx) this.spellSlots[oldIdx] = null;
      }
      this.spellSlots[slotIdx] = spellId || null;
      this.uiDirty = true;
      return true;
    }

    castSpell(slotIdxOrId, targetWx = null, targetWy = null) {
      if (!this.started || this.paused || this.isPlayerDead()) return false;
      const spellId = typeof slotIdxOrId === 'number'
        ? (this.spellSlots && this.spellSlots[slotIdxOrId])
        : slotIdxOrId;
      if (!spellId) return false;
      const sp = Balaclava.SPELLS && Balaclava.SPELLS[spellId];
      if (!sp) return false;
      if (!Array.isArray(this.unlockedSpells)) this.unlockedSpells = ['misil_arcano'];
      if (!this.unlockedSpells.includes(spellId)) {
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.spellNotLearned', { name: sp.name }) : `Aún no aprendes ${sp.name}.`, 'warn');
        return false;
      }
      this.spellCooldowns = this.spellCooldowns || {};
      const remCd = this.spellCooldowns[spellId] || 0;
      if (remCd > 0.05) {
        if ((this.time - (this._lastSpellWarn || -99)) >= 0.8) {
          this._lastSpellWarn = this.time;
          this.addFloatingText(this.player.x, this.player.y - 26, `${sp.name} (${remCd.toFixed(1)}s)`, '#b39ddb');
        }
        return false;
      }
      const manaSave = Math.min(0.45, (this.mods.manaSave || 0) + (this.mods.energySave || 0) * 0.4);
      const cost = this.player.godMode ? 0 : Math.max(2, Math.round((sp.cost || 10) * (1 - manaSave)));
      if (!this.player.godMode && this.player.energy < cost) {
        this.addFloatingText(this.player.x, this.player.y - 26, `${Balaclava.I18n ? Balaclava.I18n.t('toast.noEnergy') : '¡Sin energía!'} (${cost})`, '#ff8a65');
        Balaclava.Audio.play('error');
        return false;
      }
      if (cost > 0) this.player.energy = Math.max(0, this.player.energy - cost);
      const cdRed = Math.min(0.75, this.mods.spellCdRed || 0);
      this.spellCooldowns[spellId] = Math.max(3.0, (sp.cooldown || 20.0) * (1 - cdRed));

      const px = this.player.x;
      const py = this.player.y;
      const wx = targetWx != null ? targetWx : (this.mouse && this.mouse.wx ? this.mouse.wx : px + this.player.facing * 90);
      const wy = targetWy != null ? targetWy : (this.mouse && this.mouse.wy ? this.mouse.wy : py);
      const ang = Math.atan2(wy - py, wx - px);
      const spMult = 1 + (this.mods.spellPower || 0) + (this.mods.dmgBonus || 0) * 0.25;
      const baseDmg = Math.round((sp.baseDamage || 24) * spMult);
      const foes = this.activeDungeon
        ? [...this.activeDungeon.enemies, ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
        : [...this.combat.enemies];

        const losOk = (ox, oy, ex, ey) => !this.activeDungeon || typeof this.activeDungeon.hasLineOfSight !== 'function' || this.activeDungeon.hasLineOfSight(ox, oy, ex, ey);
        const clipDung = (ox, oy, tx, ty) => (this.activeDungeon && typeof this.activeDungeon.clipRayToWalkable === 'function')
          ? this.activeDungeon.clipRayToWalkable(ox, oy, tx, ty)
          : { x: tx, y: ty, blocked: false };

        if (spellId === 'misil_arcano') {
        this.spawnFx('pvfx_magic_circle', px, py + 4, 0, 0.36, 0.72, 0.85, { blend: 'lighter' });
        for (const off of [-0.14, 0.14]) {
          const a = ang + off;
          this.spawnPlayerProjectile(px, py, Math.cos(a) * 460, Math.sin(a) * 460, baseDmg, sp.color, false, { life: 1.3, homing: true, hitsNodes: true, vfxKey: 'pvfx_magic_missile', vfxHit: 'aw_arcane_impact', usedId: 'spell:misil_arcano' });
        }
        Balaclava.Audio.play('laser');
      } else if (spellId === 'bola_fuego') {
        this.spawnFx('aw_fire_castflame', px + Math.cos(ang) * 18, py + Math.sin(ang) * 18, ang, 0.34, 0.95, 0.95, { blend: 'lighter' });
        this.spawnPlayerProjectile(px, py, Math.cos(ang) * 390, Math.sin(ang) * 390, baseDmg, sp.color, false, { life: 1.4, aoeRadius: sp.aoeRadius || 72, burnDmg: 8, hitsNodes: true, vfxKey: 'aw_fire_fireball', vfxHit: 'pvfx_fireball_impact', usedId: 'spell:bola_fuego' });
        Balaclava.Audio.play('explosion');
      } else if (spellId === 'nova_hielo') {
        const r = sp.aoeRadius || 135;
        this.spawnFx('pvfx_frost_nova', px, py, 0, 0.58, 1.35, 0.98, { blend: 'lighter' });
        this.spawnFx('aw_ice_chargeshatter', px, py - 6, 0, 0.45, 1.2, 0.94, { blend: 'lighter' });
        this.spawnShockwave(px, py, r, sp.color);
        this.spawnParticles(px, py, '#b2ebf2', 24);
        for (const e of foes) {
          if (e && !e._dead && dist(px, py, e.x, e.y) <= r + (e.radius || 16) && losOk(px, py, e.x, e.y)) {
            this.combat.damageEnemy(this, e, baseDmg, Math.atan2(e.y - py, e.x - px), false);
            this.spawnFx('pvfx_ice_spike', e.x, e.y + 4, 0, 0.44, 0.95, 0.95);
            e.slowTimer = Math.max(e.slowTimer || 0, 3.6);
          }
        }
        this.damageNodesInArea(px, py, r, Math.round(baseDmg * 0.85), sp.color, 0, 'spell:nova_hielo');
        Balaclava.Audio.play('levelup');
      } else if (spellId === 'cadena_rayos') {
        const maxBounces = sp.bounces || 4;
        const sorted = foes
          .filter(e => e && !e._dead && dist(px, py, e.x, e.y) <= 340 && losOk(px, py, e.x, e.y))
          .sort((a, b) => dist(wx, wy, a.x, a.y) - dist(wx, wy, b.x, b.y))
          .slice(0, maxBounces);
        let mult = 1.0;
        let hitCount = 0;
        this.spawnFx('aw_lightning_charge', px, py - 8, 0, 0.34, 0.9, 0.95, { blend: 'lighter' });
        for (const e of sorted) {
          this.combat.damageEnemy(this, e, Math.round(baseDmg * mult), Math.atan2(e.y - py, e.x - px), Math.random() < 0.25);
          this.spawnFx('pvfx_lightning_strike', e.x, e.y + 4, 0, 0.44, 1.05, 0.98, { blend: 'lighter' });
          this.spawnFx('lt_bolt1', e.x, e.y - 8, 0, 0.32, 0.95, 0.95, { blend: 'lighter' });
          mult *= 0.82;
          hitCount++;
        }
        if (!this.activeDungeon && hitCount < maxBounces && this.world && Array.isArray(this.world.nodes)) {
          const nodeTargets = this.world.nodes
            .filter(n => !this.isProtectedNode(n) && dist(px, py, n.x, n.y) <= 340)
            .sort((a, b) => dist(wx, wy, a.x, a.y) - dist(wx, wy, b.x, b.y))
            .slice(0, maxBounces - hitCount);
          for (const n of nodeTargets) {
            this.damageSingleNodeByMagic(n, Math.round(baseDmg * mult), sp.color, Math.atan2(n.y - py, n.x - px), 'spell:cadena_rayos');
            this.spawnFx('pvfx_lightning_strike', n.x, n.y + 4, 0, 0.44, 1.0, 0.96, { blend: 'lighter' });
            mult *= 0.82;
            hitCount++;
          }
        }
        if (hitCount === 0) this.spawnFx('pvfx_lightning_strike', wx, wy + 4, 0, 0.42, 0.95, 0.92, { blend: 'lighter' });
        Balaclava.Audio.play('thunder');
      } else if (spellId === 'curacion_sagrada') {
        const heal = Math.round((sp.baseHeal || 48) * spMult);
        this.healPlayer(heal, 0);
        this.spawnFx('pvfx_holy_heal', px, py + 6, 0, 0.85, 1.15, 0.98, { follow: this.player, offY: 6, blend: 'lighter' });
        this.spawnFx('aw_heal_burst', px, py - 4, 0, 0.48, 0.95, 0.95, { blend: 'lighter' });
        this.spawnShockwave(px, py, 85, sp.color);
        this.spawnParticles(px, py, '#a5d6a7', 20);
        this.addFloatingText(px, py - 28, `+${heal} HP`, '#a5d6a7');
        Balaclava.Audio.play('heal');
      } else if (spellId === 'escudo_divino') {
        const sh = Math.round((sp.baseShield || 55) * spMult);
        this.player.shieldHp = Math.max(this.player.shieldHp || 0, sh);
        this.player.shieldTimer = sp.duration || 8.0;
        this.spawnFx('pvfx_barrier_block', px, py + 2, 0, 0.72, 1.12, 0.98, { follow: this.player, offY: 2, blend: 'lighter' });
        this.spawnFx('st_shield', px, py - 6, 0, 0.65, 1.05, 0.92, { follow: this.player, offY: -6, blend: 'lighter' });
        this.spawnShockwave(px, py, 95, sp.color);
        this.spawnParticles(px, py, '#ffe082', 18);
        this.addFloatingText(px, py - 28, Balaclava.I18n ? Balaclava.I18n.t('toast.aegisShield', { sh }) : `Égida +${sh}`, '#ffe082');
        Balaclava.Audio.play('equip');
      } else if (spellId === 'paso_etereo') {
        const stepDist = Math.min(180, dist(px, py, wx, wy));
        const clippedBlink = clipDung(px, py, px + Math.cos(ang) * stepDist, py + Math.sin(ang) * stepDist);
        const blinkDist = dist(px, py, clippedBlink.x, clippedBlink.y);
        let destX = px;
        let destY = py;
        const canStep = (tx, ty) => this.activeDungeon ? this.activeDungeon.isTileWalkable(tx, ty) : this.world.isTileWalkable(tx, ty);
        for (let f = 1.0; f >= 0.2; f -= 0.2) {
          const cx = px + Math.cos(ang) * blinkDist * f;
          const cy = py + Math.sin(ang) * blinkDist * f;
          if (canStep(Math.floor(cx / TILE_SIZE), Math.floor(cy / TILE_SIZE)) && losOk(px, py, cx, cy)) {
            destX = cx; destY = cy; break;
          }
        }
        this.spawnFx('pvfx_blink_out', px, py + 6, 0, 0.42, 0.95, 0.95, { blend: 'lighter' });
        this.spawnParticles(px, py, sp.color, 14);
        this.player.x = destX; this.player.y = destY;
        this.player.invuln = Math.max(this.player.invuln || 0, 0.35);
        this.spawnFx('pvfx_teleport_in', destX, destY + 6, 0, 0.48, 1.05, 0.98, { blend: 'lighter' });
        this.spawnShockwave(destX, destY, 95, sp.color);
        for (const e of foes) {
          if (e && !e._dead && dist(destX, destY, e.x, e.y) <= 95 + (e.radius || 16) && losOk(destX, destY, e.x, e.y)) {
            this.combat.damageEnemy(this, e, baseDmg, Math.atan2(e.y - destY, e.x - destX), false);
          }
        }
        this.damageNodesInArea(destX, destY, 95, Math.round(baseDmg * 0.85), sp.color, ang, 'spell:paso_etereo');
        Balaclava.Audio.play('portal');
      } else if (spellId === 'furia_arcana') {
        this.applyTimedBuff('furia_arcana', { mult: 1.30, time: sp.duration || 7.0, sourceId: 'spell:furia_arcana', sourceName: sp.name, blessingName: sp.name });
        this.recomputeModifiers();
        this.spawnFx('pvfx_power_up_aura', px, py + 6, 0, 0.95, 1.25, 0.98, { follow: this.player, offY: 6, blend: 'lighter' });
        this.spawnFx('st_rage', px, py - 10, 0, 0.72, 1.05, 0.95, { follow: this.player, offY: -10, blend: 'lighter' });
        this.spawnShockwave(px, py, 115, sp.color);
        this.addFloatingText(px, py - 30, Balaclava.I18n ? Balaclava.I18n.t('toast.arcaneFury') : '¡FURIA ARCANA!', sp.color);
        Balaclava.Audio.play('levelup');
      } else if (spellId === 'espinas_tierra') {
        const clamped = Math.min(215, dist(px, py, wx, wy));
        const clipped = clipDung(px, py, px + Math.cos(ang) * clamped, py + Math.sin(ang) * clamped);
        const tx = clipped.x;
        const ty = clipped.y;
        const r = sp.aoeRadius || 92;
        this.spawnFx('pvfx_earth_spike', tx, ty + 6, 0, 0.56, 1.2, 0.98);
        this.spawnFx('aw_earth_rockspike', tx + 16, ty + 6, 0, 0.45, 1.05, 0.95);
        this.spawnShockwave(tx, ty, r, sp.color);
        this.spawnParticles(tx, ty, '#8bc34a', 20);
        for (const e of foes) {
          if (e && !e._dead && dist(tx, ty, e.x, e.y) <= r + (e.radius || 16) && losOk(tx, ty, e.x, e.y)) {
            this.combat.damageEnemy(this, e, baseDmg, ang, false);
            e.slowTimer = Math.max(e.slowTimer || 0, 2.5);
          }
        }
        this.damageNodesInArea(tx, ty, r, Math.round(baseDmg * 0.95), sp.color, ang, 'spell:espinas_tierra');
        Balaclava.Audio.play('hit');
      } else if (spellId === 'daga_veneno') {
        this.spawnFx('aw_poison_splash', px + Math.cos(ang) * 16, py + Math.sin(ang) * 16, ang, 0.28, 0.85, 0.95, { blend: 'lighter' });
        for (const off of [-0.24, 0, 0.24]) {
          const a = ang + off;
          this.spawnPlayerProjectile(px, py, Math.cos(a) * 520, Math.sin(a) * 520, baseDmg, sp.color, true, { life: 1.0, poisonDmg: 6, hitsNodes: true, vfxKey: 'pvfx_poison_dart', vfxHit: 'pvfx_acid_splash', usedId: 'spell:daga_veneno' });
        }
        Balaclava.Audio.play('bow');
      } else if (spellId === 'drenaje_mana') {
        const r = sp.aoeRadius || 120;
        this.spawnFx('pvfx_soul_drain', px, py, 0, 0.65, 1.3, 0.98, { blend: 'lighter' });
        this.spawnFx('aw_explosion_dark', px, py, 0, 0.46, 1.05, 0.9, { blend: 'lighter' });
        this.spawnShockwave(px, py, r, sp.color);
        let hits = 0;
        for (const e of foes) {
          if (e && !e._dead && dist(px, py, e.x, e.y) <= r + (e.radius || 16) && losOk(px, py, e.x, e.y)) {
            this.combat.damageEnemy(this, e, baseDmg, Math.atan2(e.y - py, e.x - px), false);
            hits++;
          }
        }
        const nHits = this.damageNodesInArea(px, py, r, Math.round(baseDmg * 0.8), sp.color, 0, 'spell:drenaje_mana');
        if (hits + nHits > 0) this.healPlayer(hits * 7, Math.max(hits * 8, Math.min(12, nHits * 3)));
        Balaclava.Audio.play('heal');
      } else if (spellId === 'lluvia_meteoros') {
        const clamped = Math.min(240, dist(px, py, wx, wy));
        const clipped = clipDung(px, py, px + Math.cos(ang) * clamped, py + Math.sin(ang) * clamped);
        const cx = clipped.x;
        const cy = clipped.y;
        const offsets = [[0, 0], [-42, 26], [42, -24]];
        const mRad = sp.aoeRadius || 105;
        for (const [ox, oy] of offsets) {
          const hitOff = clipDung(cx, cy, cx + ox, cy + oy);
          const mx = hitOff.x;
          const my = hitOff.y;
          this.spawnFx('pvfx_meteor_strike', mx, my + 8, 0, 0.72, 1.25, 0.98, { blend: 'lighter' });
          this.spawnFx('soggy_incinerate', mx, my, 0, 0.65, 1.05, 0.95, { blend: 'lighter' });
          this.spawnFx('px_blast_big', mx, my - 6, 0, 0.56, 1.15, 0.92, { blend: 'lighter' });
          this.spawnShockwave(mx, my, mRad, sp.color);
          for (const e of foes) {
            if (e && !e._dead && dist(mx, my, e.x, e.y) <= mRad + (e.radius || 16) && losOk(mx, my, e.x, e.y)) {
              this.combat.damageEnemy(this, e, baseDmg, ang, Math.random() < 0.35);
              e.burnTimer = Math.max(e.burnTimer || 0, 3.5);
            }
          }
          this.damageNodesInArea(mx, my, mRad, baseDmg, sp.color, ang, 'spell:lluvia_meteoros');
        }
        this.shake(0.32, 6);
        Balaclava.Audio.play('explosion');
      } else if (spellId === 'lluvia_minerales' || spellId === 'invocacion_minerales' ||
                 spellId === 'llamado_horda' || spellId === 'invocacion_monstruos' ||
                 spellId === 'llamado_fauna' || spellId === 'invocacion_fauna') {
        const refundSurfaceSpell = (msgEs, msgEn) => {
          if (cost > 0) this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + cost);
          delete this.spellCooldowns[spellId];
          const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage && Balaclava.I18n.getLanguage() === 'en';
          this.toast(isEn ? msgEn : msgEs, 'warn');
          Balaclava.Audio.play('error');
        };
        if (this.activeDungeon || !Array.isArray(this.unlockedPlots) || this.unlockedPlots.length === 0) {
          refundSurfaceSpell(
            'Este hechizo solo funciona en las islas de la superficie.',
            'This spell can only be cast on surface islands.'
          );
          return false;
        }
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage && Balaclava.I18n.getLanguage() === 'en';
        if (spellId === 'lluvia_minerales' || spellId === 'invocacion_minerales') {
          const occ = this.getOccupiedTileSet();
          const targetCount = 15;
          let spawned = 0;
          const triesMax = Math.max(40, this.unlockedPlots.length * 10);
          for (let k = 0; k < triesMax && spawned < targetCount; k++) {
            const [gx, gy] = pick(this.unlockedPlots);
            const node = this.world.trySpawnMineralInPlot(gx, gy, occ);
            if (node) {
              spawned++;
              this.spawnParticles(node.x, node.y, '#ffd54f', 7);
            }
          }
          this.spawnFx('pvfx_magic_circle', px, py + 4, 0, 0.55, 1.15, 0.95, { blend: 'lighter' });
          this.spawnShockwave(px, py, 120, sp.color);
          Balaclava.Audio.play('levelup');
          this.toast(
            isEn ? `Mineral Surge! ${spawned} ore veins erupted across your islands.` : `¡Lluvia Mineral! Brotaron ${spawned} vetas minerales por tus islas.`,
            'success'
          );
        } else if (spellId === 'llamado_horda' || spellId === 'invocacion_monstruos') {
          const hostilePools = {
            pradera: ['slime', 'rat', 'spider', 'zombie', 'skeleton'],
            desierto: ['beetle', 'scorpion', 'sand_ghoul', 'cobra', 'rock_golem'],
            bosque_oscuro: ['mushroom_mob', 'goblin', 'goblin_shaman', 'shadow_wolf', 'bat'],
            montanas_heladas: ['wolf', 'golem', 'cave_spider', 'skeleton_mage'],
            tierras_volcanicas: ['magma', 'fire_elem', 'beetle_fire', 'goblin_tnt', 'imp']
          };
          const targetMobs = 10;
          let spawned = 0;
          const unlockedBiomes = [...new Set(this.unlockedPlots.map(([gx, gy]) => (this.world.plotBiomes[gy] && this.world.plotBiomes[gy][gx]) || 'pradera'))];
          for (let k = 0; k < 44 && spawned < targetMobs; k++) {
            const bPick = pick(unlockedBiomes);
            const mobType = pick(hostilePools[bPick] || hostilePools.pradera);
            const mob = this.combat.spawnWorldEnemy(this, null, mobType);
            if (mob) {
              spawned++;
              this.spawnParticles(mob.x, mob.y, '#ef5350', 8);
              if (this.spawnFx) this.spawnFx('pvfx_teleport_in', mob.x, mob.y, 0, 0.38, 0.85, 0.9, { blend: 'lighter' });
            }
          }
          this.spawnFx('pvfx_magic_circle', px, py + 4, 0, 0.55, 1.15, 0.95, { blend: 'lighter' });
          this.spawnShockwave(px, py, 130, sp.color);
          Balaclava.Audio.play('thunder');
          this.toast(
            isEn ? `Call of the Horde! ${spawned} hostile monsters appeared on your islands.` : `¡Llamado de la Horda! Aparecieron ${spawned} monstruos por tus islas.`,
            'warn'
          );
        } else if (spellId === 'llamado_fauna' || spellId === 'invocacion_fauna') {
          const faunaByBiome = {
            pradera: ['sheep', 'vaca', 'cerdo', 'conejo', 'pato'],
            desierto: ['conejo', 'pato', 'sheep'],
            bosque_oscuro: ['cerdo', 'conejo', 'sheep'],
            montanas_heladas: ['sheep', 'conejo', 'vaca'],
            tierras_volcanicas: ['sheep', 'cerdo', 'conejo']
          };
          const occ = this.getOccupiedTileSet();
          const targetAnimals = 10;
          let spawned = 0;
          for (let k = 0; k < 48 && spawned < targetAnimals; k++) {
            const [gx, gy] = pick(this.unlockedPlots);
            const spot = this.world._pickFreePlotTile(gx, gy, occ);
            if (!spot) continue;
            const biome = (this.world.plotBiomes[gy] && this.world.plotBiomes[gy][gx]) || 'pradera';
            const aKind = pick(faunaByBiome[biome] || faunaByBiome.pradera);
            const beforeLen = this.world.sheep.length;
            this.world.spawnAnimal(spot[0], spot[1], aKind);
            if (this.world.sheep.length > beforeLen) {
              spawned++;
              this.spawnParticles((spot[0] + 0.5) * TILE_SIZE, (spot[1] + 0.5) * TILE_SIZE, '#81c784', 8);
            }
          }
          this.spawnFx('pvfx_holy_heal', px, py + 4, 0, 0.65, 1.15, 0.95, { blend: 'lighter' });
          this.spawnShockwave(px, py, 120, sp.color);
          Balaclava.Audio.play('heal');
          this.toast(
            isEn ? `Call of the Wild! ${spawned} passive animals arrived on your islands.` : `¡Llamado de Fauna! Llegaron ${spawned} animales pasivos a tus islas.`,
            'success'
          );
        }
      }
      this.uiDirty = true;
      return true;
    }

    useActiveSlot(wx, wy) {
      if (this.isPlayerDead()) return;
      if (!Number.isFinite(wx)) wx = this.player.x + (this.player.facing || 1) * 90;
      if (!Number.isFinite(wy)) wy = this.player.y;
      if (this.placingBuildingId) {
        const tx = Math.floor(wx / TILE_SIZE);
        const ty = Math.floor(wy / TILE_SIZE);
        this.placeBuilding(this.placingBuildingId, tx, ty);
        return;
      }

      const slot = this.hotbar[this.activeSlot];
      if (!slot) return;

      if (this.farming.fishing && this.farming.fishing.phase === 'reel') {
        this.farming.strikeFishingZone(this);
        return;
      }
      if (this.farming.fishing && this.farming.fishing.phase === 'bite') {
        this.farming.beginReeling(this);
        return;
      }

      if (slot.kind === 'item') {
        const itemDef = Balaclava.ITEMS[slot.id];
        if (slot.id === 'fertilizante' || slot.id === 'abono_dorado' || slot.id === 'compost_magico') {
          const tx = Math.floor(wx / TILE_SIZE);
          const ty = Math.floor(wy / TILE_SIZE);
          if (dist(this.player.x, this.player.y, wx, wy) <= 130) {
            this.farming.fertilizeTile(this, tx, ty, slot.id);
          }
        } else if (itemDef && itemDef.plantCrop) {
          const tx = Math.floor(wx / TILE_SIZE);
          const ty = Math.floor(wy / TILE_SIZE);
          if (dist(this.player.x, this.player.y, wx, wy) <= 115) {
            this.farming.plantSeed(this, tx, ty, slot.id);
          }
        } else if (itemDef && itemDef.isLaserWeapon) {
          this.fireArcaneLaser(itemDef, wx, wy);
        } else if (itemDef && (itemDef.isRangedWeapon || itemDef.isStaffWeapon)) {
          this.fireSpecializedWeapon(itemDef, wx, wy);
        } else if (itemDef && (itemDef.isSpecialBlade || itemDef.weaponMelee)) {
          this.swingSpecialBlade(itemDef, wx, wy);
        } else {
          this.useOrEquipItem(slot.id, wx, wy);
        }
        return;
      }

      const toolId = slot.id;
      const tier = this.toolTiers[toolId];
      if (!tier) {
        if (this.time - (this.lastHintTime || 0) > 1.8) {
          this.lastHintTime = this.time;
          const tName = Balaclava.TOOLS[toolId] ? Balaclava.TOOLS[toolId].name : toolId;
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.needCraftToolFirst', { name: tName }) : `¡Aún no fabricas ${tName}! Abre Artesanía.`, 'warn');
        }
        return;
      }
      const stats = Balaclava.getToolStats(toolId, tier);
      if (!stats) return;
      if (this.player.swingTimer > 0) return;

      if (toolId === 'arco') {
        if ((this.player.bowReloadTimer || 0) > 0) {
          if ((this.time - (this._lastReloadWarn || -99)) >= 0.75) {
            this._lastReloadWarn = this.time;
            const rMsg = (Balaclava.I18n && Balaclava.I18n.t('toast.bowReloading') !== 'toast.bowReloading')
              ? Balaclava.I18n.t('toast.bowReloading')
              : 'Recargando arco...';
            this.addFloatingText(this.player.x, this.player.y - 26, rMsg, '#ffe082');
          }
          return;
        }
        if (this.getArrowCount() <= 0) {
          this.player.bowLoaded = false;
          this.player.bowNeedsAutoReload = false;
          this.reloadBow(false);
          return;
        }
        if (this.player.bowLoaded === false) {
          this.reloadBow(false);
          return;
        }
      }

      const tb = this.getToolEnchantBonuses(toolId);
      const reach = stats.reach + (tb.reachBonus || 0) + (this.mods.reachBonus || 0);
      const hovered = (toolId !== 'arco' && toolId !== 'cana') ? this.findHoveredEntity(wx, wy, reach) : null;
      if (hovered && hovered.kind === 'enemy') {
        this.selectedEnemy = hovered.entity;
      }
      if (hovered && hovered.enforceReach && !hovered.inReach && hovered.kind !== 'enemy' && hovered.kind !== 'animal') {
        if ((this.time - (this._lastReachWarn || -99)) >= 1.0) {
          this._lastReachWarn = this.time;
          this.addFloatingText(this.player.x, this.player.y - 26, Balaclava.I18n ? Balaclava.I18n.t('toast.outOfReachImprove') : '¡Fuera de alcance! Acércate o mejora tu herramienta', '#ffab91');
        }
        return;
      }

      const energyCost = this.player.godMode ? 0 : Math.max(0.5, stats.energyCost * (1 - (this.mods.energySave || 0)));
      if (!this.player.godMode && this.player.energy < energyCost) {
        if ((this.time - (this._lastLowEnWarn || -99)) >= 1.35) {
          this._lastLowEnWarn = this.time;
          this.addFloatingText(this.player.x, this.player.y - 24, Balaclava.I18n ? Balaclava.I18n.t('toast.lowEnergyEat') : '¡Sin energía! Come bayas/pan', '#ff8a65');
        }
        return;
      }
      if (energyCost > 0) this.player.energy = Math.max(0, this.player.energy - energyCost);

      const aimX = (hovered && hovered.inReach) ? hovered.x : wx;
      const aimY = (hovered && hovered.inReach) ? hovered.y : wy;
      const ang = Math.atan2(aimY - this.player.y, aimX - this.player.x);
      this.player.facing = Math.cos(ang) >= 0 ? 1 : -1;
      this.player.swingAngle = ang;
      this.player.swingTool = toolId;
      this.player.swingItemId = null;
      this.player.attackCount = (this.player.attackCount || 0) + 1;

      const spdBonus = 1 + (toolId === 'espada' ? (this.mods.attackSpeed || 0) : 0) + tb.speedMult;
      this.player.swingDur = Math.max(0.09, 0.42 / (stats.speed * (stats.swingRate || 1) * spdBonus));
      this.player.swingTimer = this.player.swingDur;

      // Tool-specific execution
      if (toolId === 'arco') {
        this.removeItem('flecha', 1);
        this.player.bowLoaded = false;
        this.player.bowNeedsAutoReload = this.getArrowCount() > 0;
        Balaclava.Audio.play('bow');
        const dmg = Math.round(stats.power * 1.35 * (1 + (this.mods.dmgBonus || 0) + tb.dmgBonus + tb.fireDmg));
        this.spawnPlayerProjectile(this.player.x, this.player.y, Math.cos(ang) * 430, Math.sin(ang) * 430, dmg, tb.autoSmelt ? '#ff8a65' : '#ffd54f', true);
        return;
      }

      if (toolId === 'cana') {
        const tx = Math.floor(wx / TILE_SIZE);
        const ty = Math.floor(wy / TILE_SIZE);
        const fSpot = this.world.nodes.find(n => n.kind === 'fish_spot' && dist(n.x, n.y, wx, wy) < 42);
        const pond = this.getBuildingAtTile(tx, ty);
        const isWater = (this.world.tiles[ty] && this.world.tiles[ty][tx] === 0) || (pond && pond.type === 'estanque');
        if (this.farming.fishing) {
          this.farming.startFishing(this, wx, wy, fSpot);
        } else if ((isWater || fSpot) && dist(this.player.x, this.player.y, wx, wy) <= reach + 12) {
          this.farming.startFishing(this, wx, wy, fSpot);
        } else {
          this.addFloatingText(this.player.x, this.player.y - 26, Balaclava.I18n ? Balaclava.I18n.t('toast.aimWater') : 'Apunta al agua o estanque cercano', '#81d4fa');
        }
        return;
      }

      // Melee / Gather strike with strict Selected-Target Priority + Per-Tier Reach
      const hitX = this.player.x + Math.cos(ang) * 32;
      const hitY = this.player.y + Math.sin(ang) * 32;
      const enemyList = this.activeDungeon
        ? [...this.activeDungeon.enemies, ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
        : this.combat.enemies;

      const strikeEnemy = (e) => {
        const eff = Balaclava.getToolEfficiency(toolId, e.isBoss ? 'boss' : 'enemy', tier);
        const critRate = (toolId === 'espada' ? (this.mods.critChance || 0) : 0.04) + tb.critChance;
        const isCrit = Math.random() < critRate;
        const dmg = Math.max(1, Math.round(stats.power * 1.35 * eff.mult * (1 + (this.mods.dmgBonus || 0) + tb.dmgBonus + tb.fireDmg) * (isCrit ? 2 : 1)));
        this.combat.damageEnemy(this, e, dmg, ang, isCrit);
        const slashKey = toolId === 'espada'
          ? ((this.player.attackCount % 3 === 0) ? 'pa_slash3_gold' : (this.player.attackCount % 2 === 0) ? 'pa_slash2_cyan' : 'pa_slash1_gold')
          : toolId === 'hacha' ? 'pvfx_axe_smear'
          : toolId === 'guadana' ? 'smear_h1'
          : 'pvfx_hit_spark';
        this.spawnFx(slashKey, e.x, e.y - 4, ang, 0.26, 0.82, 0.92, { blend: 'lighter' });
        if (eff.hint && this.time - (this.lastHintTime || 0) > 2.2) {
          this.lastHintTime = this.time;
          this.addFloatingText(e.x, e.y - 36, eff.hint, '#ffb74d');
        }
      };

      const strikeNode = (n) => {
        if (n.kind === 'altar_shrine') { this.interactAltar(n); return 'stop'; }
        if (n.kind === 'easter_egg') { this.interactEasterEgg(n); return 'stop'; }
        if (n.kind === 'fish_spot') {
          if (this.time - (this.lastHintTime || 0) > 2.0) {
            this.lastHintTime = this.time;
            this.addFloatingText(n.x, n.y - 22, Balaclava.I18n ? Balaclava.I18n.t('tool.needRod') : '¡Requiere Caña de Pescar!', '#81d4fa');
          }
          return 'skip';
        }
        if (n.kind === 'chest') { this.openWorldChest(n); return 'stop'; }
        if (n.kind === 'secret_chest') { this.openSecretChest(n); return 'stop'; }
        if (n.kind === 'puzzle_pillar') { this.activatePuzzlePillar(n); return 'stop'; }
        if (n.kind === 'bone_totem') { this.activateBoneTotem(n); return 'stop'; }
        if (n.kind === 'skeleton_king_shrine') { this.interactSkeletonKing(n); return 'stop'; }

        const eff = Balaclava.getToolEfficiency(toolId, n.kind, tier);
        if (eff.blocked) {
          Balaclava.Audio.play('error');
          this.spawnParticles(n.x, n.y, '#90a4ae', 4);
          this.spawnFx('hitSpark', n.x, n.y, ang, 0.2);
          if (eff.hint && this.time - (this.lastHintTime || 0) > 1.8) {
            this.lastHintTime = this.time;
            this.addFloatingText(n.x, n.y - 28, eff.hint, '#ff8a65');
          }
          return toolId === 'guadana' ? 'hit_skip' : 'stop';
        }

        let gatherMult = 1 + (this.mods.gatherPower || 0) + tb.gatherMult;
        if (toolId === 'hacha') gatherMult += (this.mods.chopSpeed || 0);
        if (toolId === 'pico') gatherMult += (this.mods.mineSpeed || 0);
        let power = Math.max(1, Math.round(stats.power * 1.45 * eff.mult * gatherMult));
        if (eff.capDmg !== undefined && eff.capDmg !== null) power = Math.min(eff.capDmg, power);
        if (eff.hint && this.time - (this.lastHintTime || 0) > 2.2) {
          this.lastHintTime = this.time;
          this.addFloatingText(n.x, n.y - 30, eff.hint, '#ffd54f');
        }
        n.hp -= power;
        n.hitAnim = 1;
        Balaclava.Audio.play(n.tool === 'pico' ? 'mine' : n.tool === 'pala' ? 'dig' : 'chop');
        this.spawnParticles(n.x, n.y, n.tool === 'pico' ? '#b0bec5' : '#81c784', 6);
        if (n.tool === 'hacha' || n.kind === 'tree' || n.kind === 'giant_tree') {
          this.spawnFx('wood_hit', n.x, n.y - 8, 0, 0.28, 1.25, 0.96);
          this.spawnFx('wood_splinter', n.x, n.y - 6, ang, 0.30, 1.05, 0.92);
        } else if (n.tool === 'pico') {
          this.spawnFx('pvfx_rock_shatter', n.x, n.y - 4, 0, 0.34, 0.92, 0.95);
          this.spawnFx('aw_hit_spark_medium', n.x, n.y - 6, ang, 0.22, 0.78, 0.92, { blend: 'lighter' });
        } else if (n.tool === 'pala') {
          this.spawnFx('pvfx_dust_puff', n.x, n.y, 0, 0.32, 0.95, 0.9);
        } else {
          this.spawnFx('pvfx_leaf_gust', n.x, n.y - 4, ang, 0.30, 0.9, 0.92);
        }
        if (n.hp <= 0) this.destroyNode(n, stats, toolId);
        return 'hit';
      };

      const doSwordWaveIfReady = () => {
        if (toolId !== 'espada') return;
        Balaclava.Audio.play('slash');
        this.player.attackCount++;
        const swKey = (this.player.attackCount % 3 === 0) ? 'pa_slash3_gold' : (this.player.attackCount % 2 === 0) ? 'pa_slash2_cyan' : 'pa_slash1_gold';
        this.spawnFx(swKey, hitX, hitY, ang, 0.28, 0.88, 0.94, { blend: 'lighter' });
        if (this.mods.shockwave && this.player.attackCount % 3 === 0) {
          const waveDmg = Math.round(stats.power * 2.4 * (1 + (this.mods.dmgBonus || 0)));
          this.spawnFx('pvfx_shockwave_ring', this.player.x, this.player.y, 0, 0.42, 1.4, 0.95, { blend: 'lighter' });
          this.spawnShockwave(this.player.x, this.player.y, 125, '#80d8ff');
          for (const e of enemyList) {
            if (dist(this.player.x, this.player.y, e.x, e.y) <= 125 && (!this.activeDungeon || this.activeDungeon.hasLineOfSight(this.player.x, this.player.y, e.x, e.y))) {
              this.combat.damageEnemy(this, e, waveDmg, ang, false);
            }
          }
        }
      };

      // Priority A: Player explicitly selected/hovered a target in reach
      if (hovered && hovered.inReach) {
        if (hovered.kind === 'dungeon_chest' && this.activeDungeon && typeof this.activeDungeon.openChest === 'function') {
          this.activeDungeon.openChest(hovered.entity, this);
          return;
        }
        if (hovered.kind === 'enemy') {
          const primary = hovered.entity;
          strikeEnemy(primary);
          if (toolId === 'espada' || toolId === 'guadana') {
            for (const e of enemyList) {
              if (!e || e._dead || e.hp <= 0 || e === primary) continue;
              if (!this.isEntityInReach(e, reach, 'enemy')) continue;
              const eAng = Math.atan2(e.y - this.player.y, e.x - this.player.x);
              if (Math.cos(eAng - ang) >= 0.5) {
                strikeEnemy(e);
              }
            }
          }
          doSwordWaveIfReady();
          return;
        }
        if (hovered.kind === 'animal') {
          const a = hovered.entity;
          const eff = Balaclava.getToolEfficiency(toolId, 'enemy', tier);
          const critRate = (toolId === 'espada' ? (this.mods.critChance || 0) : 0.05) + tb.critChance;
          const isCrit = Math.random() < critRate;
          const dmg = Math.max(2, Math.round(stats.power * 1.35 * eff.mult * (1 + (this.mods.dmgBonus || 0) + tb.dmgBonus) * (isCrit ? 2 : 1)));
          this.combat.damageAnimal(this, a, dmg, ang, isCrit);
          this.spawnFx('hitSpark', a.x, a.y, ang, 0.18, 1.0);
          return;
        }
        if (hovered.kind === 'node') {
          const primaryNode = hovered.entity;
          const res = strikeNode(primaryNode);
          if (toolId === 'guadana' && res !== 'stop') {
            for (let ni = this.world.nodes.length - 1; ni >= 0; ni--) {
              const n = this.world.nodes[ni];
              if (!n || n === primaryNode || n.kind === 'dungeon_gate') continue;
              if (!this.isTargetInReach(n.x, n.y, n.radius || 14, reach, 'node')) continue;
              const nAng = Math.atan2(n.y - this.player.y, n.x - this.player.x);
              if (Math.cos(nAng - ang) >= 0.18) strikeNode(n);
            }
          }
          return;
        }
        if (hovered.kind === 'crop' && toolId === 'guadana') {
          for (let ci = this.world.crops.length - 1; ci >= 0; ci--) {
            const c = this.world.crops[ci];
            if (!c) continue;
            const cx = (c.tx + 0.5) * TILE_SIZE;
            const cy = (c.ty + 0.5) * TILE_SIZE;
            if (c.stage >= 3 && this.isTargetInReach(cx, cy, 12, reach, 'crop')) {
              this.farming.harvestCrop(this, c.tx, c.ty);
            }
          }
          return;
        }
      }

      // 1. Directional enemies within reach (sorted closest to cursor)
      const coneEnemies = enemyList
        .filter(e => {
          if (!this.isEntityInReach(e, reach, 'enemy')) return false;
          const eAng = Math.atan2(e.y - this.player.y, e.x - this.player.x);
          return Math.cos(eAng - ang) >= 0.22 || dist(this.player.x, this.player.y, e.x, e.y) <= 34;
        })
        .sort((a, b) => dist(wx, wy, a.x, a.y) - dist(wx, wy, b.x, b.y));
      let hitEnemy = false;
      for (const e of coneEnemies) {
        strikeEnemy(e);
        hitEnemy = true;
        if (toolId !== 'espada' && toolId !== 'guadana') break;
      }
      doSwordWaveIfReady();
      if (hitEnemy) return;

      // 1b. Check passive fauna in forward cone + reach (no array clone needed)
      if (!this.activeDungeon && Array.isArray(this.world.sheep)) {
        let bestFauna = null;
        let bestFaunaDist = Infinity;
        for (let si = 0; si < this.world.sheep.length; si++) {
          const a = this.world.sheep[si];
          if (!this.isEntityInReach(a, reach, 'animal')) continue;
          const aAng = Math.atan2(a.y - this.player.y, a.x - this.player.x);
          if (Math.cos(aAng - ang) >= 0.22 || dist(this.player.x, this.player.y, a.x, a.y) <= 34) {
            const d = dist(wx, wy, a.x, a.y);
            if (d < bestFaunaDist) { bestFaunaDist = d; bestFauna = a; }
          }
        }
        if (bestFauna) {
          const a = bestFauna;
          const eff = Balaclava.getToolEfficiency(toolId, 'enemy', tier);
          const critRate = (toolId === 'espada' ? (this.mods.critChance || 0) : 0.05) + tb.critChance;
          const isCrit = Math.random() < critRate;
          const dmg = Math.max(2, Math.round(stats.power * 1.35 * eff.mult * (1 + (this.mods.dmgBonus || 0) + tb.dmgBonus) * (isCrit ? 2 : 1)));
          this.combat.damageAnimal(this, a, dmg, ang, isCrit);
          this.spawnFx('hitSpark', a.x, a.y, ang, 0.18, 1.0);
          return;
        }
      }

      // 2. Check crops if guadaña
      if (toolId === 'guadana') {
        let harvested = false;
        for (let ci = this.world.crops.length - 1; ci >= 0; ci--) {
          const c = this.world.crops[ci];
          if (!c) continue;
          const cx = (c.tx + 0.5) * TILE_SIZE;
          const cy = (c.ty + 0.5) * TILE_SIZE;
          if (c.stage >= 3 && this.isTargetInReach(cx, cy, 12, reach, 'crop')) {
            if (this.farming.harvestCrop(this, c.tx, c.ty)) harvested = true;
          }
        }
        if (harvested) return;
      }

      // 3. Check world resource nodes in forward cone + reach (sorted closest to cursor)
      if (!this.activeDungeon) {
        let hitNode = false;
        const candidates = this.world.nodes
          .filter(n => {
            if (n.kind === 'dungeon_gate') return false;
            if (!this.isTargetInReach(n.x, n.y, n.radius || 14, reach, 'node')) return false;
            const nAng = Math.atan2(n.y - this.player.y, n.x - this.player.x);
            return Math.cos(nAng - ang) >= 0.22 || dist(this.player.x, this.player.y, n.x, n.y) <= 36;
          })
          .sort((a, b) => dist(wx, wy, a.x, a.y) - dist(wx, wy, b.x, b.y));
        for (const n of candidates) {
          const res = strikeNode(n);
          if (res === 'stop') return;
          if (res === 'hit' || res === 'hit_skip') {
            hitNode = true;
            if (toolId !== 'guadana') break;
          }
        }
        if (hitNode) return;
      }

      // 4. Check sheep gentle shear with scythe/hand or harvest wool
      for (const s of this.world.sheep) {
        if (dist(hitX, hitY, s.x, s.y) <= 46 && s.shearCooldown <= 0) {
          s.shearCooldown = 18;
          this.spawnDrop(s.x, s.y, 'lana', 2);
          Balaclava.Audio.play('pickup');
          this.addFloatingText(s.x, s.y - 18, Balaclava.I18n ? Balaclava.I18n.t('toast.woolFloat') : '+Lana', '#ffffff');
          return;
        }
      }

      // 5. Azada: tilling soil & watering crops (strict farming workflow!)
      if (!this.activeDungeon && toolId === 'azada') {
        const tx = Math.floor(hitX / TILE_SIZE);
        const ty = Math.floor(hitY / TILE_SIZE);
        this.farming.tillArea(this, tx, ty, tier);
        return;
      }

      // 6. Pala: excavating ground resources without auto-replacing Azada tilling
      if (!this.activeDungeon && toolId === 'pala') {
        const biome = this.world.getBiomeAtPixel(hitX, hitY);
        const tx = Math.floor(hitX / TILE_SIZE);
        const ty = Math.floor(hitY / TILE_SIZE);
        if (this.world.isTileWalkable(tx, ty) && Math.random() < 0.35) {
          this.spawnDrop(hitX, hitY, biome === 'desierto' ? 'arena' : 'arcilla', 1);
          Balaclava.Audio.play('dig');
          this.spawnParticles(hitX, hitY, '#8d6e63', 6);
        }
      }
    }

    destroyNode(node, toolStats, usedToolId) {
      if (node.kind === 'meteor') {
        const reqTier = (Balaclava.getRequiredPickTier && Balaclava.getRequiredPickTier('meteor')) || 9;
        const currentPickTier = (this.equipped && this.equipped.pico)
          ? (Balaclava.TOOLS?.pico?.tiers?.indexOf(this.equipped.pico) + 1 || 0)
          : (this.toolTiers && this.toolTiers.pico ? (Balaclava.TOOLS?.pico?.tiers?.indexOf(this.toolTiers.pico) + 1 || 0) : 0);
        if (usedToolId !== 'pico' || currentPickTier < reqTier) {
          this.addFloatingText(node.x, node.y - 20, '¡Pico insuficiente! Requiere Pico Mitrilo (Tier 9)+', '#ff8a65');
          return;
        }
      }
      this.world.nodes = this.world.nodes.filter(n => n !== node);
      if (node.kind === 'meteor') this.stats.meteorsMined++;

      const tb = this.getToolEnchantBonuses(usedToolId);
      const extra = this.mods.extraDrop || 0;
      const dblChance = (this.mods.doubleDropChance || 0) + tb.doubleChance;
      const AUTO_SMELT_MAP = { cobre: 'lingote_cobre', hierro: 'lingote_hierro', oro: 'lingote_oro' };

      if (node.drops) {
        let didSmelt = false;
        for (const d of node.drops) {
          if (d.chance !== undefined && Math.random() > d.chance + (toolStats ? toolStats.rareBonus * 0.35 : 0)) continue;
          let qty = randInt(d.min, d.max) + extra;
          if (Math.random() < dblChance) qty *= 2;
          let dropId = d.id;
          if (tb.autoSmelt && AUTO_SMELT_MAP[dropId]) {
            dropId = AUTO_SMELT_MAP[dropId];
            didSmelt = true;
          }
          if (qty > 0) this.spawnDrop(node.x + randInt(-10, 10), node.y + randInt(-10, 10), dropId, qty);
        }
        if (didSmelt) {
          this.spawnParticles(node.x, node.y, '#ff7043', 10);
          this.addFloatingText(node.x, node.y - 26, Balaclava.I18n ? Balaclava.I18n.t('toast.smeltedFloat') : '¡Fundido!', '#ffab91');
        }
      }

      if (usedToolId === 'guadana' && (node.kind === 'bush' || node.kind === 'herb_patch' || node.kind === 'mushroom_node')) {
        this.spawnDrop(node.x + randInt(-8, 8), node.y + randInt(-8, 8), 'semillas', 1);
        if (Math.random() < 0.45) {
          this.spawnDrop(node.x + randInt(-8, 8), node.y + randInt(-8, 8), 'fibra_vegetal', 1);
        }
      }

      // Gem finder mastery
      if (node.tool === 'pico' && ((this.mods.gemFinder || 0) + tb.gemChance) > 0 && Math.random() < ((this.mods.gemFinder || 0) + tb.gemChance)) {
        this.spawnDrop(node.x, node.y, Math.random() < 0.5 ? 'cristales' : 'esmeraldas', 1);
      }

      this.gainXp(node.xp || 6);
      this.spawnParticles(node.x, node.y, '#ffe082', 12);
      if (node.tool === 'hacha' || node.kind === 'tree' || node.kind === 'giant_tree') {
        this.spawnFx('wood_splinter', node.x, node.y - 12, 0, 0.42, 1.35, 0.96);
        this.spawnFx('pvfx_leaf_gust', node.x, node.y - 18, 0, 0.48, 1.15, 0.92);
      } else if (node.tool === 'pico') {
        this.spawnFx('pvfx_rock_shatter', node.x, node.y - 6, 0, 0.44, 1.25, 0.98);
      } else {
        this.spawnFx('pvfx_harvest_seal', node.x, node.y, 0, 0.42, 1.0, 0.88, { blend: 'lighter' });
      }

      // Micro-dopamina de inicio: 25% de probabilidad de soltar moneda brillante al romper recursos
      if (Math.random() < 0.25) {
        const bonusCoins = randInt(1, 2);
        this.addCoins(bonusCoins);
        this.spawnParticles(node.x, node.y, '#ffd54f', 8);
        this.spawnFx('pvfx_coin_pickup', node.x, node.y - 10, 0, 0.45, 1.1, 0.95, { blend: 'lighter' });
        if (Balaclava.Audio && typeof Balaclava.Audio.play === 'function') {
          Balaclava.Audio.play('coin');
        }
      }
    }

    openWorldChest(node) {
      if (!node || node._opened) return;
      node._opened = true;
      this.world.nodes = this.world.nodes.filter(n => n !== node);
      Balaclava.Audio.play('chest');
      const C = Balaclava.CONST.CENTER_PLOT || 4;
      const gx = Math.floor(node.tx / PLOT_TILES);
      const gy = Math.floor(node.ty / PLOT_TILES);
      const plotDist = Math.hypot(gx - C, gy - C);
      const coins = 4 + Math.round(plotDist * 6) + randInt(2, 5 + Math.round(plotDist * 3));
      this.addCoins(coins);

      let lootPool;
      let qtyMax = 1;
      if (plotDist < 0.8) {
        lootPool = ['cobre', 'hierro', 'semillas_tomate', 'pocion_vida', 'pan'];
      } else if (plotDist < 2.2) {
        lootPool = ['oro', 'plata', 'cristales', 'semillas_calabaza', 'pocion_vida', 'llave_mazmorra', 'bomba_mina'];
        qtyMax = 2;
      } else if (plotDist < 3.8) {
        lootPool = ['platino', 'jade', 'esmeraldas', 'rubi', 'cristales_magicos', 'llave_mazmorra', 'dinamita_tnt', 'cebo_dorado'];
        qtyMax = 2;
      } else {
        lootPool = ['mitrilo_bruto', 'diamantes', 'amatista', 'polvo_estelar', 'fragmentos_antiguos', 'elixir_titan', 'bomba_solar', 'llave_mazmorra'];
        qtyMax = 3;
      }
      this.addItem(pick(lootPool), randInt(1, qtyMax));
      if (plotDist >= 2.5 && Math.random() < 0.55) {
        this.addItem(pick(['zafiro', 'topacio', 'sanguinaria', 'oro']), randInt(1, 2));
      }
      this.gainXp(18 + Math.round(plotDist * 22));
      this.spawnParticles(node.x, node.y, '#ffd54f', 16);
      this.spawnFx('px_treasure_burst', node.x, node.y - 6, 0, 0.72, 1.35, 1.0, { blend: 'lighter' });
      this.spawnFx('pvfx_treasure_glint', node.x, node.y - 12, 0, 0.85, 1.25, 0.96, { blend: 'lighter' });
      this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.treasureChestOpen', { coins }) : `¡Cofre del tesoro abierto! +${coins} monedas`, 'success');
    }

    activatePuzzlePillar(node) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      if (!node) return false;
      if (node.activated) {
        this.toast(T('toast.pillarAlreadyOn'), 'info');
        return false;
      }
      node.activated = true;
      Balaclava.Audio.play('portal');
      this.spawnParticles(node.x, node.y, '#9575cd', 22);
      this.spawnShockwave(node.x, node.y, 72, '#b388ff');
      const pillars = this.world.nodes.filter(p => p.kind === 'puzzle_pillar' && p.secretIdx === node.secretIdx);
      const done = pillars.filter(p => p.activated).length;
      const req = pillars.length || 3;
      const chest = this.world.nodes.find(c => c.kind === 'secret_chest' && c.secretIdx === node.secretIdx);
      if (done >= req && chest) {
        chest.puzzleLocked = false;
        Balaclava.Audio.play('levelup');
        this.spawnShockwave(chest.x, chest.y, 130, '#ffd54f');
        this.addFloatingText(chest.x, chest.y - 34, T('toast.sealBrokenFloat'), '#ffd54f');
        this.toast(T('toast.pillarsSealBroken'), 'success');
      } else {
        this.addFloatingText(node.x, node.y - 28, T('toast.pillarProgress', { done, req }), '#b388ff');
        this.toast(T('toast.pillarActivated', { done, req }), 'info');
      }
      this.uiDirty = true;
      return true;
    }

    openSecretChest(node) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      if (!node || node.opened) return false;
      if (node.puzzleLocked) {
        const pillars = this.world.nodes.filter(p => p.kind === 'puzzle_pillar' && p.secretIdx === node.secretIdx);
        const done = pillars.filter(p => p.activated).length;
        const req = node.puzzleReq || pillars.length || 3;
        Balaclava.Audio.play('error');
        this.addFloatingText(node.x, node.y - 28, T('toast.secretSealedFloat', { done, req }), '#ce93d8');
        this.toast(T('toast.secretSealedToast', { done, req }), 'warn');
        return false;
      }
      if ((this.inventory.llave_legendaria || 0) < 1) {
        Balaclava.Audio.play('error');
        this.addFloatingText(node.x, node.y - 24, T('toast.needLegendKeyFloat'), '#ffd54f');
        this.toast(T('toast.needLegendKeyToast'), 'warn');
        return false;
      }
      this.removeItem('llave_legendaria', 1);
      node.opened = true;
      this.world.nodes = this.world.nodes.filter(n => n !== node);
      Balaclava.Audio.play('levelup');
      this.shake(0.24, 5);
      this.spawnShockwave(node.x, node.y, 110, '#ffd54f');
      this.spawnParticles(node.x, node.y, '#ffd54f', 24);
      this.spawnFx('px_treasure_burst', node.x, node.y - 6, 0, 0.78, 1.45, 1.0, { blend: 'lighter' });
      this.spawnFx('pvfx_treasure_glint', node.x, node.y - 14, 0, 0.92, 1.35, 0.98, { blend: 'lighter' });

      const secretPool = Object.keys(Balaclava.PERMANENT_RELICS || {}).filter(
        id => Balaclava.PERMANENT_RELICS[id] && Balaclava.PERMANENT_RELICS[id].isSecret
      );
      const unowned = secretPool.filter(id => !this.permanentRelics.includes(id));
      let relicId = null;
      if (unowned.length > 0) {
        const idx = typeof node.secretIdx === 'number' ? node.secretIdx % unowned.length : 0;
        relicId = unowned[idx];
      }
      if (relicId) {
        this.permanentRelics.push(relicId);
        this.recordEncyclopedia('relics', relicId);
        const rel = Balaclava.PERMANENT_RELICS[relicId];
        this.recomputeModifiers();
        this.addCoins(55);
        this.gainXp(180);
        this.addItem(pick(['diamantes', 'prisma_imperial', 'esmeraldas', 'rubi']), 2);
        this.toast(T('toast.secretRelicUnlocked', { name: rel.name, desc: rel.desc }), 'success');
      } else {
        this.addCoins(85);
        this.addItem('diamantes', 3);
        this.addItem('prisma_imperial', 1);
        this.gainXp(220);
        this.toast(T('toast.secretAncientOpened'), 'success');
      }
      this.stats.chestsOpened = (this.stats.chestsOpened || 0) + 1;
      this.stats.secretsFound = (this.stats.secretsFound || 0) + 1;
      this.uiDirty = true;
      return true;
    }

    interactNearby() {
      if (this.isPlayerDead()) return;
      // Check fishing bite/reel first (always engages interactive reel phase!)
      if (this.farming.fishing) {
        if (this.farming.fishing.phase === 'bite') {
          this.farming.beginReeling(this);
          return;
        }
        if (this.farming.fishing.phase === 'reel') {
          this.farming.strikeFishingZone(this);
          return;
        }
      }

      if (this.activeDungeon) {
        if (typeof this.activeDungeon.tryInteractChest === 'function' && this.activeDungeon.tryInteractChest(this)) {
          return;
        }
        if (this.activeDungeon.exitPortal && this.activeDungeon.exitPortal.active) {
          const ep = this.activeDungeon.exitPortal;
          const dExit = Math.hypot((this.player.x / TILE_SIZE) - (ep.tx + 0.5), (this.player.y / TILE_SIZE) - (ep.ty + 0.5));
          if (dExit <= 1.85) {
            this.requestExitDungeon();
            return;
          }
        }
        const tx = Math.floor(this.player.x / TILE_SIZE);
        const ty = Math.floor(this.player.y / TILE_SIZE);
        if (this.activeDungeon.grid[ty] && this.activeDungeon.grid[ty][tx] === 4) {
          this.requestExitDungeon();
        }
        return;
      }

      const px = this.player.x;
      const py = this.player.y;
      const mx = Number.isFinite(this.mouse.wx) ? this.mouse.wx : px;
      const my = Number.isFinite(this.mouse.wy) ? this.mouse.wy : py;
      const candidates = [];

      // 1. Eligible NPCs within reach
      for (const npc of Balaclava.NPCS) {
        const [gx, gy] = this.world.getNpcPlot(npc);
        if (!this.world.isPlotUnlocked(gx, gy)) continue;
        const off = this.world.getNpcTileOffset(npc);
        const nx = (gx * PLOT_TILES + off[0] + 0.5) * TILE_SIZE;
        const ny = (gy * PLOT_TILES + off[1] + 0.5) * TILE_SIZE;
        if (dist(px, py, nx, ny) <= 76) {
          candidates.push({ x: nx, y: ny, act: () => Balaclava.UI.openNpcModal(npc) });
        }
      }

      // 2. Gates, Altars, Easter Eggs, Puzzle Pillars & Giant Chests
      for (const n of this.world.nodes) {
        const dP = dist(px, py, n.x, n.y);
        if (n.kind === 'dungeon_gate' && dP <= 86) {
          candidates.push({ x: n.x, y: n.y, act: () => this.enterDungeon(n.dungeonId) });
        } else if (n.kind === 'altar_shrine' && dP <= 78) {
          candidates.push({ x: n.x, y: n.y, act: () => this.interactAltar(n) });
        } else if (n.kind === 'easter_egg' && dP <= 78) {
          candidates.push({ x: n.x, y: n.y, act: () => this.interactEasterEgg(n) });
        } else if (n.kind === 'puzzle_pillar' && dP <= 82) {
          candidates.push({ x: n.x, y: n.y, act: () => this.activatePuzzlePillar(n) });
        } else if (n.kind === 'chest' && dP <= 90) {
          candidates.push({ x: n.x, y: n.y, act: () => this.openWorldChest(n) });
        } else if (n.kind === 'secret_chest' && dP <= 92) {
          candidates.push({ x: n.x, y: n.y, act: () => this.openSecretChest(n) });
        } else if (n.kind === 'bone_totem' && dP <= 88) {
          candidates.push({ x: n.x, y: n.y, act: () => this.activateBoneTotem(n) });
        } else if (n.kind === 'skeleton_king_shrine' && dP <= 98) {
          candidates.push({ x: n.x, y: n.y, act: () => this.interactSkeletonKing(n) });
        }
      }

      // 3. Buildings within reach
      for (const b of this.buildings) {
        const def = Balaclava.BUILDINGS[b.type];
        if (!def) continue;
        const bx = (b.tx + def.size * 0.5) * TILE_SIZE;
        const by = (b.ty + def.size * 0.5) * TILE_SIZE;
        if (dist(px, py, bx, by) <= 88) {
          candidates.push({
            x: bx,
            y: by,
            act: () => {
              const collected = this.automation.collectFromBuilding(this, b);
              if (def.opensPanel || !collected || def.station) {
                Balaclava.UI.openBuildingModal(b);
              }
            }
          });
        }
      }

      // 4. Mature crops
      for (const c of [...this.world.crops]) {
        const cx = (c.tx + 0.5) * TILE_SIZE;
        const cy = (c.ty + 0.5) * TILE_SIZE;
        if (c.stage >= 3 && dist(px, py, cx, cy) <= 68) {
          candidates.push({ x: cx, y: cy, act: () => this.farming.harvestCrop(this, c.tx, c.ty) });
        }
      }

      if (candidates.length > 0) {
        const scoreCandidate = (c) => Math.min(dist(mx, my, c.x, c.y), 140) * 1.5 + dist(px, py, c.x, c.y) * 0.6;
        candidates.sort((a, b) => scoreCandidate(a) - scoreCandidate(b));
        return candidates[0].act();
      }
    }

    resetAltarNotifications() {
      this.altarNotifications = [];
      this.uiDirty = true;
    }

    /**
     * Apply or renew a timed buff and notify any superseded altar card so the UI stays honest.
     */
    applyTimedBuff(key, spec) {
      const prev = this.activeBuffs[key];
      const renewed = Boolean(prev && prev.sourceId && prev.sourceId === spec.sourceId);
      const replacedFrom = (prev && prev.sourceId && prev.sourceId !== spec.sourceId) ? (prev.sourceName || prev.blessingName || key) : null;
      if (prev && prev.sourceId && prev.sourceId !== spec.sourceId && Array.isArray(this.altarNotifications)) {
        for (const n of this.altarNotifications) {
          if (n.altarId === prev.sourceId && Array.isArray(n.buffKeys) && n.buffKeys.includes(key) && n.status !== 'expired') {
            n.status = 'replaced';
            n.statusLabel = `Reemplazada (${spec.sourceName || 'nuevo efecto'})`;
            n.durationText = n.statusLabel;
            n.dur = Math.min(n.dur, n.age + 2.0);
          }
        }
      }
      const dur = Math.max(1, Number(spec.time) || 60);
      this.activeBuffs[key] = {
        mult: spec.mult,
        time: dur,
        maxTime: dur,
        sourceId: spec.sourceId || key,
        sourceName: spec.sourceName || key,
        blessingName: spec.blessingName || spec.sourceName || key,
        iconUrl: spec.iconUrl || null
      };
      this.uiDirty = true;
      return { renewed, replacedFrom };
    }

    /**
     * Queue, renew, or replace an organized floating altar blessing banner over the character.
     */
    pushAltarBlessingNotice(opts) {
      if (!Array.isArray(this.altarNotifications)) this.altarNotifications = [];
      const dur = opts.dur || 5.2;
      const buffKeys = Array.isArray(opts.buffKeys) ? opts.buffKeys : [];

      if (opts.status !== 'expired' && opts.altarId) {
        const existingSame = this.altarNotifications.find(n => n.altarId === opts.altarId && !n.leaving && n.status !== 'expired' && n.status !== 'replaced');
        if (existingSame) {
          existingSame.age = 0;
          existingSame.dur = dur;
          existingSame.status = 'renewed';
          existingSame.kicker = opts.renewKicker || '¡Bendición renovada!';
          existingSame.title = opts.title || existingSame.title;
          existingSame.effectText = opts.effectText || existingSame.effectText;
          existingSame.durationSec = opts.durationSec != null ? opts.durationSec : existingSame.durationSec;
          existingSame.durationText = opts.durationText || existingSame.durationText;
          existingSame.buffKeys = buffKeys;
          existingSame.statusLabel = 'Renovada';
          existingSame.rev = (existingSame.rev || 1) + 1;
          this.uiDirty = true;
          return existingSame;
        }
      }

      if (buffKeys.length > 0 && opts.status !== 'expired') {
        const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
        for (const n of this.altarNotifications) {
          if (n.altarId !== opts.altarId && !n.leaving && Array.isArray(n.buffKeys) && n.buffKeys.some(k => buffKeys.includes(k))) {
            n.status = 'replaced';
            n.statusLabel = T('altar.replacedBy', { name: opts.altarName || T('toast.altarSacred') });
            n.durationText = n.statusLabel;
            n.dur = Math.min(n.dur, n.age + 2.0);
          }
        }
      }

      // Limit visible stacked notifications cleanly to 2 above character (plus fast queue if >2 activated)
      while (this.altarNotifications.length >= 2) {
        this.altarNotifications.shift();
      }

      const notice = {
        uid: this._nextAltarNoticeId++,
        rev: 1,
        altarId: opts.altarId || 'altar',
        altarName: opts.altarName || 'Altar Sagrado',
        kicker: opts.kicker || (opts.title ? 'Bendición sagrada' : '¡Bendición activada!'),
        title: opts.title || opts.blessingName || 'Bendición Sagrada',
        blessingName: opts.blessingName || opts.title || 'Bendición Sagrada',
        effectText: opts.effectText || '',
        durationSec: opts.durationSec != null ? opts.durationSec : null,
        durationText: opts.durationText || 'Instantáneo',
        iconUrl: opts.iconUrl || null,
        color: opts.color || '#ffd54f',
        buffKeys,
        age: 0,
        dur,
        leaving: false,
        status: opts.status || 'active',
        statusLabel: opts.statusLabel || ''
      };
      this.altarNotifications.push(notice);
      this.uiDirty = true;
      return notice;
    }

    interactAltar(node) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      const def = Balaclava.ALTAR_DEFS && Balaclava.ALTAR_DEFS[node.altarId];
      if (!def) return;
      if (node.cooldownLeft > 0) {
        this.toast(T('altar.recharging', { name: def.name, sec: Math.ceil(node.cooldownLeft) }), 'info');
        return;
      }
      node.cooldownLeft = def.cooldown || 90;
      this.stats.altarsUsed = (this.stats.altarsUsed || 0) + 1;
      this.recordEncyclopedia('altars', node.altarId);
      Balaclava.Audio.play('portal');
      this.spawnParticles(node.x, node.y, def.color || '#80deea', 18);

      const blessingTitle = def.blessingName || def.name;
      const kickerBase = def.blessingTitle || T('altar.activated', { name: blessingTitle });
      const iconUrl = def.iconUrl || (Balaclava.BUFF_ICON_URLS && Balaclava.BUFF_ICON_URLS.speed) || 'assets/icons_extra/buff_luck.png';

      if (def.effect === 'arcane') {
        const dur = def.buffDur || 85;
        const rArc = this.applyTimedBuff('arcane', {
          mult: def.buffMult || 1.32, time: dur, sourceId: def.id, sourceName: def.name, blessingName: blessingTitle, iconUrl
        });
        this.recomputeModifiers();
        this.pushAltarBlessingNotice({
          altarId: def.id, altarName: def.name,
          kicker: rArc.renewed ? T('altar.renewed', { name: blessingTitle }) : kickerBase,
          title: blessingTitle,
          effectText: def.effectDetail || T('altar.arcaneDefault'),
          durationSec: dur, durationText: T('altar.durSec', { sec: dur }),
          iconUrl, color: def.color, buffKeys: ['arcane'],
          status: rArc.renewed ? 'renewed' : 'active'
        });
        this.toast(T('altar.arcaneToast', { name: def.name, dur }), 'success');
      } else if (def.effect === 'hunter') {
        const dur = def.buffDur || 85;
        const rHunt = this.applyTimedBuff('hunter', {
          mult: def.buffMult || 1.18, time: dur, sourceId: def.id, sourceName: def.name, blessingName: blessingTitle, iconUrl
        });
        this.recomputeModifiers();
        this.pushAltarBlessingNotice({
          altarId: def.id, altarName: def.name,
          kicker: rHunt.renewed ? T('altar.renewed', { name: blessingTitle }) : kickerBase,
          title: blessingTitle,
          effectText: def.effectDetail || T('altar.hunterDefault'),
          durationSec: dur, durationText: T('altar.durSec', { sec: dur }),
          iconUrl, color: def.color, buffKeys: ['hunter'],
          status: rHunt.renewed ? 'renewed' : 'active'
        });
        this.toast(T('altar.hunterToast', { name: def.name, dur }), 'success');
      } else if (def.effect === 'heal') {
        const hpBefore = this.player.hp;
        const enBefore = this.player.energy;
        this.healPlayer(this.player.maxHp, this.player.maxEnergy);
        const hpGain = Math.max(0, Math.round(this.player.hp - hpBefore));
        const enGain = Math.max(0, Math.round(this.player.energy - enBefore));
        const effText = (hpGain > 0 || enGain > 0)
          ? T('altar.healDetail', { hp: hpGain, en: enGain })
          : T('altar.healFull');
        this.pushAltarBlessingNotice({
          altarId: def.id, altarName: def.name, kicker: kickerBase, title: blessingTitle,
          effectText: effText, durationText: T('altar.durInstant'), iconUrl, color: def.color, buffKeys: []
        });
        this.toast(T('altar.healToast', { name: def.name }), 'success');
      } else if (def.effect === 'luck') {
        const dur = def.buffDur || 90;
        const res = this.applyTimedBuff('luck', {
          mult: 1.40, time: dur, sourceId: def.id, sourceName: def.name, blessingName: blessingTitle, iconUrl
        });
        this.recomputeModifiers();
        this.pushAltarBlessingNotice({
          altarId: def.id, altarName: def.name,
          kicker: res.renewed ? T('altar.fortuneRenewed') : kickerBase,
          title: blessingTitle,
          effectText: T('altar.luckEffect'),
          durationSec: dur, durationText: T('altar.durSec', { sec: dur }),
          iconUrl, color: def.color, buffKeys: ['luck'],
          status: res.renewed ? 'renewed' : 'active'
        });
        this.toast(T('altar.luckToast', { name: def.name, dur }), 'success');
      } else if (def.effect === 'damage') {
        const dur = def.buffDur || 75;
        const rDmg = this.applyTimedBuff('dmg', {
          mult: 1.35, time: dur, sourceId: def.id, sourceName: def.name, blessingName: blessingTitle, iconUrl
        });
        const rSpd = this.applyTimedBuff('speed', {
          mult: 1.20, time: dur, sourceId: def.id, sourceName: def.name, blessingName: blessingTitle, iconUrl
        });
        this.recomputeModifiers();
        this.pushAltarBlessingNotice({
          altarId: def.id, altarName: def.name,
          kicker: (rDmg.renewed || rSpd.renewed) ? T('altar.furyRenewed') : kickerBase,
          title: blessingTitle,
          effectText: T('altar.dmgEffect'),
          durationSec: dur, durationText: T('altar.durSec', { sec: dur }),
          iconUrl, color: def.color, buffKeys: ['dmg', 'speed'],
          status: (rDmg.renewed || rSpd.renewed) ? 'renewed' : 'active'
        });
        this.toast(T('altar.dmgToast', { name: def.name, dur }), 'success');
      } else if (def.effect === 'wisdom') {
        const dur = def.buffDur || 75;
        const rSpd = this.applyTimedBuff('speed', {
          mult: 1.30, time: dur, sourceId: def.id, sourceName: def.name, blessingName: blessingTitle, iconUrl
        });
        this.recomputeModifiers();
        const xpGain = 65 + this.player.level * 12;
        this.gainXp(xpGain);
        const repNote = rSpd.replacedFrom ? T('altar.replacedNote', { name: rSpd.replacedFrom }) : '';
        this.pushAltarBlessingNotice({
          altarId: def.id, altarName: def.name,
          kicker: rSpd.renewed ? T('altar.wiseRenewed') : kickerBase,
          title: blessingTitle,
          effectText: T('altar.wisdomEffect', { xp: xpGain, note: repNote }),
          durationSec: dur, durationText: T('altar.durSec', { sec: dur }),
          iconUrl, color: def.color, buffKeys: ['speed'],
          status: rSpd.renewed ? 'renewed' : 'active'
        });
        this.toast(T('altar.wisdomToast', { name: def.name, xp: xpGain, dur }), 'success');
      } else if (def.effect === 'sacrifice') {
        const hpCost = Math.max(0, Math.min(this.player.hp - 10, Math.round(this.player.maxHp * 0.25)));
        if (hpCost > 0) this.player.hp -= hpCost;
        const coinsGain = randInt(25, 55);
        this.addCoins(coinsGain);
        const rarePool = ['cristales_magicos', 'esencia_oscura', 'sanguinaria', 'amatista', 'jade'];
        const chosen = rarePool[Math.floor(Math.random() * rarePool.length)];
        const chosenQty = randInt(1, 2);
        this.addItem(chosen, chosenQty);
        const chosenName = (Balaclava.ITEMS[chosen] && Balaclava.ITEMS[chosen].name) || chosen;
        this.pushAltarBlessingNotice({
          altarId: def.id, altarName: def.name, kicker: kickerBase, title: blessingTitle,
          effectText: T('altar.pactEffect', { hp: hpCost, coins: coinsGain, qty: chosenQty, item: chosenName }),
          durationText: T('altar.durInstant'), iconUrl, color: def.color, buffKeys: []
        });
        this.toast(T('altar.pactToast', { name: def.name, coins: coinsGain, qty: chosenQty, item: chosenName }), 'warn');
      } else if (def.buffType && def.buffDur) {
        const dur = def.buffDur;
        const res = this.applyTimedBuff(def.buffType, {
          mult: def.buffMult || 1.25, time: dur, sourceId: def.id, sourceName: def.name, blessingName: blessingTitle, iconUrl
        });
        this.recomputeModifiers();
        this.pushAltarBlessingNotice({
          altarId: def.id, altarName: def.name,
          kicker: res.renewed ? T('altar.renewed', { name: blessingTitle }) : kickerBase,
          title: blessingTitle,
          effectText: def.effectDetail || def.desc || '',
          durationSec: dur, durationText: T('altar.durSec', { sec: dur }),
          iconUrl, color: def.color, buffKeys: [def.buffType],
          status: res.renewed ? 'renewed' : 'active'
        });
        this.toast(`¡${def.name}: ${def.effectDetail || def.desc}!`, 'success');
      }
      this.uiDirty = true;
    }

    interactEasterEgg(node) {
      const def = Balaclava.EASTER_EGG_DEFS && Balaclava.EASTER_EGG_DEFS[node.eeId];
      if (!def) return;
      if (node.claimed) {
        this.toast(`${def.name}: ${def.hint}`, 'info');
        return;
      }
      node.claimed = true;
      this.stats.secretsFound = (this.stats.secretsFound || 0) + 1;
      Balaclava.Audio.play('levelup');
      this.spawnParticles(node.x, node.y, def.color || '#ffd54f', 26);

      const rewards = {
        ee_excalibur:  { coins: 45, xp: 90, items: { lingote_hierro: 4, jade: 2, escamas_dragon: 1 } },
        ee_arbol:      { coins: 35, xp: 85, items: { semillas_cristal: 3, resina_antigua: 5, flor_cristal: 2 } },
        ee_naufragio:  { coins: 65, xp: 80, items: { perla: 2, gema_marina: 2, anchoa: 4 } },
        ee_forja:      { coins: 50, xp: 110, items: { lingote_platino: 3, lingote_acero: 3, carbon_eterno: 3 } },
        ee_crater:     { coins: 70, xp: 150, items: { polvo_estelar: 3, diamantes: 2, fragmentos_antiguos: 1 } },
        ee_obelisco:   { coins: 45, xp: 130, items: { zafiro: 2, amatista: 2, topacio: 2 } },
        ee_monolito:   { coins: 55, xp: 115, items: { engrane: 5, lingote_bronce: 4, polvo_estelar: 2 } },
        ee_caldero:    { coins: 40, xp: 105, items: { elixir_arcano: 2, tinta_arcana: 3, hongo_luminoso: 5 } },
        ee_observatorio: { coins: 75, xp: 165, items: { polvo_estelar: 4, zafiro: 2, cristales_magicos: 3 } },
        ee_totem:      { coins: 60, xp: 130, items: { esencia_oscura: 3, runa_antigua: 2, amatista: 2 } },
        ee_fuente_mana: { coins: 65, xp: 145, items: { elixir_arcano: 3, flor_cristal: 3, zafiro: 2 } },
        ee_altar_guardian: { coins: 85, xp: 185, items: { fragmentos_antiguos: 2, lingote_platino: 3, diamantes: 2 } }
      }[node.eeId] || { coins: 40, xp: 80, items: { cristales: 3 } };

      this.addCoins(rewards.coins);
      this.gainXp(rewards.xp);
      for (const [id, q] of Object.entries(rewards.items)) this.addItem(id, q);
      this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.easterEggSecret', { name: def.name, hint: def.hint }) : `¡SECRETO DESCUBIERTO: ${def.name}! ${def.hint}`, 'success');
      this.uiDirty = true;
    }

    enterDungeon(dungeonId, isCorrupted = false) {
      if (Balaclava.UI && Balaclava.UI.activeModal) Balaclava.UI.closeModal();

      if (dungeonId === 'abismo_infinito') {
        const floor = (this.omega && this.omega.state.abyssFloor) || 1;
        const scale = this.omega ? this.omega.abyssScale(floor) : { hpMult: 1, dmgMult: 1, spdMult: 1, lootMult: 1 };
        const mods = this.omega ? this.omega.abyssModifiersForFloor(floor) : [];
        const doEnterAbyss = () => {
          this.farming.fishing = null;
          this.placingBuildingId = null;
          this.placingItemId = null;
          const dKeys = Object.keys(Balaclava.DUNGEON_DEFS || {});
          const baseKey = dKeys[(floor - 1) % (dKeys.length || 1)] || 'catacumbas_olvidadas';
          this.activeDungeon = new Balaclava.DungeonInstance(baseKey, { x: this.player.x, y: this.player.y }, this.player.level, {
            isAbyss: true,
            abyssFloor: floor,
            abyssScale: scale,
            abyssMods: mods
          });
          this._savedOverworldDrops = Array.isArray(this.drops) ? this.drops : [];
          this.drops = [];
          this.enemyProjectiles = [];
          this.thrownBombs = [];
          this.laserBeams = [];
          this.player.statusEffects = {};
          if (this.combat) this.combat.worldHazards = [];
          this.resetAmbientParticles();
          this.player.x = this.activeDungeon.spawnPos.x;
          this.player.y = this.activeDungeon.spawnPos.y;
          this.camera.x = this.player.x;
          this.camera.y = this.player.y;
          Balaclava.Audio.play('portal');
          Balaclava.Audio.setMood('boss', { delayMs: 650, fadeOutMs: 320, fadeInMs: 4200 });
          this.toast(`Has descendido al Piso ${floor} del Abismo Infinito. Modificadores: ${mods.join(', ') || 'Estándar'}.`, 'warn');
          this.uiDirty = true;
          if (Balaclava.actualizarDiscord) Balaclava.actualizarDiscord(true);
        };
        if (Balaclava.UI && typeof Balaclava.UI.playSceneTransition === 'function') {
          Balaclava.UI.playSceneTransition({
            title: `El Abismo Infinito — Piso ${floor}`,
            subtitle: `HP x${scale.hpMult.toFixed(1)} | Daño x${scale.dmgMult.toFixed(1)} | Modificadores: ${mods.join(', ') || 'Estándar'}`,
            duration: 1200,
            onMidpoint: doEnterAbyss
          });
        } else {
          doEnterAbyss();
        }
        return;
      }

      if (!isCorrupted && Array.isArray(this.clearedDungeons) && this.clearedDungeons.includes(dungeonId)) {
        const totalDungeons = (Balaclava.DUNGEON_TIER_LIST && Balaclava.DUNGEON_TIER_LIST.length) || Object.keys(Balaclava.DUNGEON_DEFS || {}).length || 24;
        const allCleared = this.clearedDungeons.length >= totalDungeons;
        if (allCleared) {
          if (Balaclava.UI && typeof Balaclava.UI.openModal === 'function') {
            Balaclava.UI.openModal('corrupted_dungeon_choice', { dungeonId });
            return;
          }
        }
        this.toast('Dungeon completada', 'warn');
        if (Balaclava.Audio) Balaclava.Audio.play('error');
        return;
      }

      if (isCorrupted && Array.isArray(this.corruptedClearedDungeons) && this.corruptedClearedDungeons.includes(dungeonId)) {
        this.toast('Dungeon corrupta completada', 'warn');
        if (Balaclava.Audio) Balaclava.Audio.play('error');
        return;
      }

      const def = (Balaclava.DUNGEON_DEFS && Balaclava.DUNGEON_DEFS[dungeonId])
        || (Balaclava.DUNGEONS && Balaclava.DUNGEONS[dungeonId])
        || null;
      const gate = (Balaclava.DUNGEON_GATES && Balaclava.DUNGEON_GATES[dungeonId]) || null;
      const dName = (isCorrupted ? '[CORRUPTA] ' : '') + ((def && def.name) || (gate && gate.name) || 'Mazmorra');
      const tierList = Array.isArray(Balaclava.DUNGEON_TIER_LIST) ? Balaclava.DUNGEON_TIER_LIST : [];
      const tierIdx = Math.max(0, tierList.indexOf(dungeonId));
      const doEnter = () => {
        this.farming.fishing = null;
        this.placingBuildingId = null;
        this.placingItemId = null;
        this.activeDungeon = new Balaclava.DungeonInstance(dungeonId, { x: this.player.x, y: this.player.y }, this.player.level, { isCorrupted });
        this._savedOverworldDrops = Array.isArray(this.drops) ? this.drops : [];
        this.drops = [];
        this.enemyProjectiles = [];
        this.thrownBombs = [];
        this.laserBeams = [];
        this.player.statusEffects = {};
        if (this.combat) this.combat.worldHazards = [];
        this.resetAmbientParticles();
        this.player.x = this.activeDungeon.spawnPos.x;
        this.player.y = this.activeDungeon.spawnPos.y;
        this.camera.x = this.player.x;
        this.camera.y = this.player.y;
        Balaclava.Audio.play('portal');
        Balaclava.Audio.setMood('boss', { delayMs: 650, fadeOutMs: 320, fadeInMs: 4200 });
        if (isCorrupted) {
          this.toast(`¡Entraste en ${this.activeDungeon.def.name} en MODO CORRUPTO! Peligro extremo (25x Dificultad).`, 'warn');
        } else {
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('dungeon.enteredFull', { name: this.activeDungeon.def.name }) : `Entraste en ${this.activeDungeon.def.name}. ¡Activa las 2 Runas para abrir la Cámara del Jefe!`, 'info');
        }
        if (!this.dungeonIntroSeen) {
          this.dungeonIntroSeen = true;
          this.activeDungeonIntroTimer = 16.0;
          this.toast('Primera Mazmorra: Pisa las runas ALFA/BETA, lee la Estela Runica [E] y abre cofres con [E].', 'info');
        }
        this.uiDirty = true;
        if (Balaclava.actualizarDiscord) Balaclava.actualizarDiscord(true);
      };

      if (Balaclava.Audio && typeof Balaclava.Audio.fadeOutMusic === 'function') {
        Balaclava.Audio.fadeOutMusic(600);
      }
      if (Balaclava.UI && typeof Balaclava.UI.playSceneTransition === 'function') {
        const BIOME_NAMES = {
          pradera: 'Pradera Esmeralda',
          desierto: 'Desierto Dorado',
          montanas_heladas: 'Cumbres Heladas',
          bosque_oscuro: 'Bosque Sombrío',
          tierras_volcanicas: 'Tierras Volcánicas'
        };
        const biomeId = (gate && gate.biome) || (def && def.themeKey) || 'pradera';
        const recLevel = (gate && gate.recLevel) || Math.max(2, tierIdx + 2);
        const mobLevelMin = Math.max(2, tierIdx * 2 + 2, Math.floor(((this.player && this.player.level) || 1) * 0.85));
        const miniLevel = tierIdx * 2 + 4;
        const enemies = (def && Array.isArray(def.enemyTypes) ? def.enemyTypes : []).map(eType => {
          const ed = Balaclava.CombatSystem ? Balaclava.CombatSystem.getEnemyDef(eType) : null;
          return {
            type: eType,
            name: (ed && ed.name) || eType,
            level: mobLevelMin,
            ranged: Boolean(ed && ed.ranged)
          };
        });
        const relicItem = def && def.bossRelicId && Balaclava.ITEMS ? Balaclava.ITEMS[def.bossRelicId] : null;
        Balaclava.UI.playSceneTransition(dName, doEnter, {
          icon: 'assets/icons/skull_death.png',
          sub: (Balaclava.I18n && Balaclava.I18n.lang === 'es')
            ? 'Descendiendo a las cámaras ancestrales...'
            : 'Descending into the ancient chambers...',
          kind: 'dungeon',
          dungeonMeta: {
            id: dungeonId,
            name: dName,
            biomeName: BIOME_NAMES[biomeId] || biomeId,
            recLevel,
            tier: tierIdx + 1,
            mobLevelMin,
            miniLevel,
            floorsDesc: '4 Sectores: Atrio · Alas Rúnicas · Guardián · Santuario del Jefe',
            enemies,
            boss: def && def.boss ? {
              name: def.boss.name,
              hp: def.boss.hp,
              dmg: def.boss.dmg,
              relicName: relicItem ? relicItem.name : null
            } : null
          }
        });
      } else {
        doEnter();
      }
    }

    requestExitDungeon() {
      if (!this.activeDungeon || this.isPlayerDead()) return;
      if (this.activeDungeon.bossLocked && this.activeDungeon.boss && this.activeDungeon.boss.hp > 0) {
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('dungeon.bossGateLocked') : '¡La Puerta del Jefe está sellada! Derrota al guardián para salir.', 'warn');
        if (Balaclava.Audio) Balaclava.Audio.play('error');
        return;
      }
      if (Balaclava.UI && typeof Balaclava.UI.openModal === 'function') {
        Balaclava.UI.openModal('exit_dungeon_confirm');
      } else {
        this.exitDungeon();
      }
    }

    exitDungeon(force = false) {
      if (!this.activeDungeon || (!force && this.isPlayerDead())) return;
      if (!force && this.activeDungeon.bossLocked && this.activeDungeon.boss && this.activeDungeon.boss.hp > 0) {
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('dungeon.bossGateLocked') : '¡La Puerta del Jefe está sellada! Derrota al guardián para salir.', 'warn');
        return;
      }
      const doExit = () => {
        const rp = this.activeDungeon ? (this.activeDungeon.returnPos || {}) : {};
        const safe = this.findSafeOverworldSpawn(rp.x, rp.y);
        this.player.x = safe.x;
        this.player.y = safe.y;
        this.camera.x = this.player.x;
        this.camera.y = this.player.y;
        this.activeDungeon = null;
        this.activeDungeonIntroTimer = 0;
        if (Array.isArray(this._savedOverworldDrops)) {
          this.drops = this._savedOverworldDrops;
        }
        this._savedOverworldDrops = null;
        this.enemyProjectiles = [];
        this.thrownBombs = [];
        this.laserBeams = [];
        this.player.statusEffects = {};
        if (this.combat) this.combat.worldHazards = [];
        this.resetAmbientParticles();
        Balaclava.Audio.play('portal');
        if (Balaclava.Audio.setMood) Balaclava.Audio.setMood('meadow', { delayMs: 800, fadeOutMs: 320, fadeInMs: 4800 });
        this.uiDirty = true;
        if (Balaclava.actualizarDiscord) Balaclava.actualizarDiscord(true);
      };

      if (!force && Balaclava.Audio && typeof Balaclava.Audio.fadeOutMusic === 'function') {
        Balaclava.Audio.fadeOutMusic(620);
      }
      if (!force && Balaclava.UI && typeof Balaclava.UI.playSceneTransition === 'function') {
        const isEs = !!(Balaclava.I18n && Balaclava.I18n.lang === 'es');
        Balaclava.UI.playSceneTransition(isEs ? 'SUPERFICIE' : 'SURFACE', doExit, {
          icon: 'assets/icons/campfire.png',
          sub: isEs ? 'Regresando a la luz del archipiélago...' : 'Returning to the sunlit archipelago...',
          kind: 'overworld'
        });
      } else {
        doExit();
      }
    }

    // Returns the closest pixel position where the hero can actually stand in the
    // overworld (walkable + unlocked tile, and not inside a building when requested).
    // Falls back to the central camp clearing, then to the provided point.
    findSafeOverworldSpawn(x, y, opts = null) {
      const allowBuildings = Boolean(opts && opts.allowBuildings);
      const maxRadius = (opts && opts.maxRadius) || 12;
      const toPixel = (tx, ty) => ({ x: (tx + 0.5) * TILE_SIZE, y: (ty + 0.5) * TILE_SIZE });
      const ok = (tx, ty) => {
        if (!this.world.isTileWalkable(tx, ty)) return false;
        if (allowBuildings) return true;
        return !this.getBuildingAtTile(tx, ty);
      };
      const px = Number.isFinite(x) ? x : 0;
      const py = Number.isFinite(y) ? y : 0;
      const baseTx = Math.floor(px / TILE_SIZE);
      const baseTy = Math.floor(py / TILE_SIZE);
      if (ok(baseTx, baseTy)) return toPixel(baseTx, baseTy);
      for (let r = 1; r <= maxRadius; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            if (ok(baseTx + dx, baseTy + dy)) return toPixel(baseTx + dx, baseTy + dy);
          }
        }
      }
      const C = Balaclava.CONST.CENTER_PLOT || 4;
      const campTx = C * PLOT_TILES + 6;
      const campTy = C * PLOT_TILES + 6;
      for (let r = 0; r <= 8; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (ok(campTx + dx, campTy + dy)) return toPixel(campTx + dx, campTy + dy);
          }
        }
      }
      return { x: px, y: py };
    }

    // Last-resort watchdog: teleports the hero out of an unwalkable tile.
    rescuePlayerFromStuckTile() {
      if (this.activeDungeon) {
        this.exitDungeon(true);
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.dungeonRescued') : 'Fuiste devuelto sano y salvo a la superficie.', 'warn');
        return false;
      }
      const safe = this.findSafeOverworldSpawn(this.player.x, this.player.y);
      this.player.x = safe.x;
      this.player.y = safe.y;
      this.player.dashTimer = 0;
      this.camera.x = safe.x;
      this.camera.y = safe.y;
      this.uiDirty = true;
      this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.stuckRescued') : 'Te hemos movido a suelo firme.', 'warn');
      return true;
    }

    applyPlayerStatus(status) {
      if (!status || !status.kind || this.isPlayerDead() || this.player.godMode) return;
      if (!this.player.statusEffects) this.player.statusEffects = {};
      const k = status.kind;
      const dur = Math.max(0.8, status.dur || 2.0);
      const cur = this.player.statusEffects[k];
      this.player.statusEffects[k] = {
        timer: cur ? Math.max(cur.timer || 0, dur) : dur,
        tickCd: cur ? Math.min(cur.tickCd || 0.65, 0.55) : 0.65,
        fxCd: cur ? (cur.fxCd || 0) : 0,
        tickDmg: Math.max(cur ? (cur.tickDmg || 0) : 0, status.tickDmg || 0)
      };
    }

    damagePlayer(raw, opts = null) {
      if (this.player.godMode) {
        if ((this.time - (this._lastGodImmuneFx || -99)) >= 0.45) {
          this._lastGodImmuneFx = this.time;
          this.addFloatingText(this.player.x, this.player.y - 24, 'INMUNE', '#ffd54f');
        }
        return;
      }
      if (this.player.deadTimer > 0 || this.player.invuln > 0 || this.player.dashTimer > 0) return;
      const dodgeChance = Math.min(0.45, this.mods.dodgeChance || 0);
      if (dodgeChance > 0 && Math.random() < dodgeChance) {
        this.player.invuln = 0.25;
        this.addFloatingText(this.player.x, this.player.y - 26, Balaclava.I18n ? Balaclava.I18n.t('toast.dodgeFloat') : '¡ESQUIVA!', '#b3e5fc');
        return;
      }
      const curseBonus = (this.player.statusEffects && this.player.statusEffects.curse && this.player.statusEffects.curse.timer > 0) ? 1.15 : 1;
      const mit = (opts && opts.isMagic) ? Math.max(0.35, 1 - Math.min(0.65, this.mods.spellResist || 0)) : 1;
      const defPct = Math.min(0.65, Math.max(0, this.mods.defPct || 0));
      const flatMit = (this.mods.def || 0) * 0.45;
      let dmg = Math.max(1, Math.round(Math.max(1, raw * curseBonus * mit - flatMit) * (1 - defPct)));
      if ((this.player.shieldHp || 0) > 0 && (this.player.shieldTimer || 0) > 0) {
        const absorbed = Math.min(this.player.shieldHp, dmg);
        this.player.shieldHp -= absorbed;
        dmg -= absorbed;
        this.spawnParticles(this.player.x, this.player.y, '#ffe082', 6);
        this.addFloatingText(this.player.x, this.player.y - 32, Balaclava.I18n ? Balaclava.I18n.t('toast.shieldAbsorb', { n: absorbed }) : `Escudo -${absorbed}`, '#ffe082');
        if (dmg <= 0) {
          this.player.invuln = 0.25;
          return;
        }
      }
      this.player.hp -= dmg;
      this.player.invuln = 0.65;
      this.shake(0.22, 5);
      Balaclava.Audio.play('hurt');
      this.addFloatingText(this.player.x, this.player.y - 24, `-${dmg}`, '#ef5350');
      if (opts && opts.status) this.applyPlayerStatus(opts.status);

      // Armor Thorns enchant reflection (% of raw damage)
      if ((this.mods.thorns || 0) > 0) {
        const refl = Math.max(2, Math.round(raw * this.mods.thorns));
        const foes = this.activeDungeon
          ? [...this.activeDungeon.enemies, ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
          : this.combat.enemies;
        for (const foe of foes) {
          if (dist(this.player.x, this.player.y, foe.x, foe.y) <= (foe.radius || 18) + 64) {
            this.combat.damageEnemy(this, foe, refl, Math.atan2(foe.y - this.player.y, foe.x - this.player.x), false);
            this.spawnParticles(foe.x, foe.y, '#ce93d8', 6);
          }
        }
      }

      if (this.player.hp <= 0) {
        this.player.hp = 0;
        this.player.deadTimer = this.player.deadMax || 10.0;
        this.player.invuln = (this.player.deadMax || 10.0) + 1.2;
        this.player.deathSeed = Math.floor((this.time || 0) * 60) % 997;
        this.clearTransientInputs();
        this.resetAltarNotifications();
        this.paused = false;
        if (Balaclava.UI) {
          Balaclava.UI.closeMenuDropdown();
          Balaclava.UI.closeModal();
          if (Balaclava.UI.hideTooltip) Balaclava.UI.hideTooltip();
        }
        if (Balaclava.Audio && typeof Balaclava.Audio.tone === 'function') {
          Balaclava.Audio.tone(246.94, 196.0, 0.22, 'triangle', 0.18, 0.04);
          Balaclava.Audio.tone(196.0, 130.81, 0.34, 'triangle', 0.16, 0.19);
          Balaclava.Audio.tone(130.81, 87.31, 0.44, 'sine', 0.18, 0.36);
        }
        this.shake(0.38, 7);
        this.spawnParticles(this.player.x, this.player.y, '#e53935', 14);
        this.spawnParticles(this.player.x, this.player.y - 8, '#b2ebf2', 10);
        this.showWarning(Balaclava.I18n ? Balaclava.I18n.t('toast.deathWarning') : 'Has caído en combate. Reapareciendo en 10s...', 5.0);
        if (Balaclava.UI) Balaclava.UI.updateHUD(true);
      }
      this.uiDirty = true;
    }

    respawnPlayer(opts = null) {
      this.player.hp = this.player.maxHp;
      this.player.energy = this.player.maxEnergy;
      this.player.deadTimer = 0;
      this.player.invuln = 1.6;
      this.player.statusEffects = {};
      if (this.combat) this.combat.worldHazards = [];
      this.clearTransientInputs();
      this.resetAltarNotifications();
      if (this.activeDungeon) this.exitDungeon(true);
      const C = Balaclava.CONST.CENTER_PLOT || 4;
      const campX = (C * PLOT_TILES + 6.5) * TILE_SIZE;
      const campY = (C * PLOT_TILES + 6.5) * TILE_SIZE;
      const spawn = this.findSafeOverworldSpawn(campX, campY, { maxRadius: 8 });
      this.player.x = spawn.x;
      this.player.y = spawn.y;
      this.camera.x = this.player.x;
      this.camera.y = this.player.y;
      if (!(opts && opts.silent)) {
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.respawnedCamp') : 'Has despertado sano en el campamento central.', 'info');
      }
      this.uiDirty = true;
      if (Balaclava.UI) Balaclava.UI.updateHUD(true);
    }

    exitFromDeathToTitle() {
      this.projectiles = [];
      this.enemyProjectiles = [];
      this.thrownBombs = [];
      this.laserBeams = [];
      this.particles = [];
      this.shockwaves = [];
      this.floatingTexts = [];
      this.hotHeals = [];
      this.combat.enemies = [];
      if (this.combat) this.combat.worldHazards = [];
      this.warningBanner = null;
      this.respawnPlayer({ silent: true });
      this.resetAmbientParticles();
      this.resetAltarNotifications();
      this.clearTransientInputs();
      this.paused = false;
      if (this.saveSys) this.saveSys.save(this, this.currentSlot || 1, true);
      this.started = false;
      this.activeDungeon = null;
      if (Balaclava.Audio && Balaclava.Audio.fadeOutMusic) Balaclava.Audio.fadeOutMusic(620);
      if (Balaclava.actualizarDiscord) Balaclava.actualizarDiscord(true);
    }

    // === PROJECTILES, DROPS, FX ===
    spawnDrop(x, y, itemId, qty) {
      this.drops.push({ x, y, itemId, qty, life: 0, vx: rand(-40, 40), vy: rand(-55, -20) });
    }

    spawnPlayerProjectile(x, y, vx, vy, dmg, color = '#ffd54f', isArrow = false, opts = null) {
      this.projectiles.push(Object.assign({ x, y, vx, vy, dmg, color, isArrow, life: 1.4, hitIds: new Set() }, opts || {}));
    }

    spawnEnemyProjectile(x, y, vx, vy, dmg, color = '#ff7043', opts = null) {
      const life = opts && opts.life ? opts.life : 2.3;
      this.enemyProjectiles.push(Object.assign({ x, y, vx, vy, dmg, color, life }, opts || {}));
    }

    spawnParticles(x, y, color, count = 8) {
      if (this.settings && this.settings.particles === false) return;
      const room = Math.max(0, 220 - this.particles.length);
      const n = Math.min(count, room);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = rand(30, 120);
        this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.25, 0.55), maxLife: 0.55, color, size: randInt(3, 6) });
      }
    }

    spawnShockwave(x, y, maxR, color) {
      if (this.shockwaves.length >= 20) this.shockwaves.shift();
      this.shockwaves.push({ x, y, r: 10, maxR, color, life: 0.3, maxLife: 0.3 });
    }

    spawnFx(key, x, y, angle = 0, duration = 0, scale = 0, alpha = 1, opts = null) {
      if (!this.fxAnims) this.fxAnims = [];
      if (this.fxAnims.length >= 140) this.fxAnims.shift();
      const meta = Balaclava.VFX_V2 && Balaclava.VFX_V2[key];
      const dur = duration && duration > 0 ? duration : ((meta && meta.dur) || 0.28);
      const sc = scale && scale > 0 ? scale : (meta ? (meta.fw >= 96 ? 1.05 : meta.fw >= 64 ? 1.25 : 1.5) : 1.5);
      this.fxAnims.push({
        key, x, y, angle,
        life: dur, maxLife: dur,
        scale: sc, alpha,
        blend: (opts && opts.blend) || 'source-over',
        follow: opts && opts.follow ? opts.follow : null,
        offX: (opts && opts.offX) || 0,
        offY: (opts && opts.offY) || 0,
        flip: !!(opts && opts.flip),
        row: opts && opts.row != null ? opts.row : null
      });
    }

    spawnFishCatchLeap(startX, startY, targetX, targetY, fishId) {
      if (!this.fishCatchLeaps) this.fishCatchLeaps = [];
      if (this.fishCatchLeaps.length >= 8) this.fishCatchLeaps.shift();
      this.fishCatchLeaps.push({
        startX, startY,
        targetX, targetY,
        fishId: fishId || 'pez_comun',
        t: 0,
        duration: 0.62
      });
      this.spawnParticles(startX, startY, '#81d4fa', 12);
      this.spawnParticles(startX, startY, '#ffffff', 6);
      if (this.spawnFx) this.spawnFx('water_splash_fx', startX, startY, 0, 0.42, 0.35, 0.95);
    }

    addFloatingText(x, y, text, color = '#ffffff') {
      if (this.settings && this.settings.floatingText === false) return;
      const key = String(text || '');
      const isDmgNum = /^-\d+$/.test(key) || key.startsWith('CRIT!');
      // Merge repeated status messages instead of stacking vertical walls of identical text
      if (!isDmgNum) {
        const aliveDup = this.floatingTexts.find(f => f.text === key && f.life > 0.20);
        if (aliveDup) {
          aliveDup.x = x;
          aliveDup.y = y;
          aliveDup.life = Math.max(aliveDup.life, 1.05);
          return;
        }
        // Coalesce "+N ItemName" pickups when rapid-harvesting the same resource
        const pm = key.match(/^\+(\d+)\s+(.+)$/);
        if (pm) {
          const itemLabel = pm[2];
          const addN = parseInt(pm[1], 10) || 1;
          const prevAdd = this.floatingTexts.find(f => {
            if (f.life <= 0.35 || !f.text) return false;
            const fm = f.text.match(/^\+(\d+)\s+(.+)$/);
            return fm && fm[2] === itemLabel;
          });
          if (prevAdd) {
            const curN = parseInt(prevAdd.text.match(/^\+(\d+)\s+/)[1], 10) || 0;
            prevAdd.text = `+${curN + addN} ${itemLabel}`;
            prevAdd.x = x;
            prevAdd.y = y;
            prevAdd.life = 1.1;
            return;
          }
        }
        if (!this.floatingCooldowns) this.floatingCooldowns = {};
        const isWarnMsg = key.startsWith('¡Sin ') || key.startsWith('¡Requiere') || key.startsWith('Apunta ') || key.startsWith('Tierra ') || key.startsWith('Cultivo ') || key.startsWith('Plantado');
        const lastT = this.floatingCooldowns[key] ?? -99;
        if (isWarnMsg && (this.time - lastT) < 0.95) return;
        this.floatingCooldowns[key] = this.time;
      }
      if (this.floatingTexts.length >= 14) {
        this.floatingTexts.shift();
      }
      const recent = this.floatingTexts.filter(f => f.life > 0.72 && Math.abs(f.x - x) < 56).length;
      this.floatingTexts.push({ x, y: y - recent * 16, text: key, color, life: 1.05 });
    }

    syncEncyclopedia() {
      if (!this.encyclopedia) this.encyclopedia = {};
      ['items', 'enemies', 'buildings', 'relics', 'enchants', 'altars'].forEach(k => {
        if (!(this.encyclopedia[k] instanceof Set)) this.encyclopedia[k] = new Set(this.encyclopedia[k] || []);
      });
      Object.keys(this.inventory || {}).forEach(id => { if ((this.inventory[id] || 0) > 0) this.encyclopedia.items.add(id); });
      Object.values(this.equipped || {}).forEach(id => { if (id) this.encyclopedia.items.add(id); });
      (this.permanentRelics || []).forEach(r => this.encyclopedia.relics.add(r));
      Object.values(this.toolEnchants || {}).forEach(m => Object.keys(m || {}).forEach(e => this.encyclopedia.enchants.add(e)));
      Object.values(this.armorEnchants || {}).forEach(m => Object.keys(m || {}).forEach(e => this.encyclopedia.enchants.add(e)));
      (this.buildings || []).forEach(b => { if (b && b.type) this.encyclopedia.buildings.add(b.type); });
    }

    showWarning(text, time = 3.2) {
      this.warningBanner = { text, time };
      this.uiDirty = true;
    }

    toast(text, kind = 'info') {
      if (kind === 'warn') {
        this.showWarning(text, 3.2);
      }
      this.toasts.push({ text, kind, time: 4.2 });
      if (this.toasts.length > 5) this.toasts.shift();
      this.uiDirty = true;
    }

    shake(time, amp) {
      if (this.settings && this.settings.screenShake === false) return;
      this.camera.shakeTime = Math.max(this.camera.shakeTime, time);
      this.camera.shakeAmp = Math.max(this.camera.shakeAmp, amp);
    }

    recordEncyclopedia(cat, id) {
      if (this.encyclopedia[cat]) this.encyclopedia[cat].add(id);
    }

    activateBoneTotem(node) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      if (!node || node.lit) {
        this.toast(T('toast.totemAlreadyLit'), 'info');
        return false;
      }
      node.lit = true;
      Balaclava.Audio.play('levelup');
      this.spawnFx('fx_thunder_splash', node.x, node.y, 0, 0.35, 1.4, 0.95);
      this.spawnParticles(node.x, node.y, '#ce93d8', 16);
      const totems = this.world.nodes.filter(t => t.kind === 'bone_totem');
      const litCount = totems.filter(t => t.lit).length;
      const shrine = this.world.nodes.find(s => s.kind === 'skeleton_king_shrine');
      if (shrine) shrine.totemsLit = litCount;
      if (litCount >= totems.length && totems.length >= 3) {
        if (shrine) shrine.state = 'awakened';
        Balaclava.Audio.play('thunder');
        this.shake(0.45, 10);
        this.toast(T('toast.totemsAwakenKing'), 'success');
      } else {
        this.toast(T('toast.totemLitCount', { cur: litCount, max: totems.length }), 'success');
      }
      this.uiDirty = true;
      return true;
    }

    interactSkeletonKing(node) {
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      if (!node) return false;
      const totems = this.world.nodes.filter(t => t.kind === 'bone_totem');
      const litCount = totems.filter(t => t.lit).length;
      if (node.state === 'claimed') {
        this.toast(T('toast.kingAtPeace'), 'info');
        return false;
      }
      if (litCount < totems.length || node.state === 'sleeping') {
        Balaclava.Audio.play('npc');
        this.toast(T('toast.kingSleeping', { cur: litCount, max: totems.length }), 'warn');
        return false;
      }
      node.state = 'claimed';
      Balaclava.Audio.play('thunder');
      Balaclava.Audio.play('levelup');
      this.shake(0.55, 12);
      this.levelFlashTimer = 0.5;
      this.spawnFx('fx_thunder_strike', node.x, node.y - 48, 0, 0.45, 2.3, 1);
      this.spawnFx('fx_level_ring', node.x, node.y + 6, 0, 0.5, 2.5, 0.95);
      this.spawnShockwave(node.x, node.y, 160, '#e040fb');
      this.spawnParticles(node.x, node.y, '#ce93d8', 32);
      this.unlockPermanentRelic('corona_rey_oseo');
      this.addItem('espada_hueso_rey', 1);
      this.addItem('collar_oseo', 1);
      this.gainXp(260);
      if (Array.isArray(this.unlockedAchievements) && !this.unlockedAchievements.includes('ach_skeleton_king')) {
        this.unlockedAchievements.push('ach_skeleton_king');
      }
      this.toast(T('toast.kingReward'), 'success');
      this.uiDirty = true;
      return true;
    }

    isProtectedNode(n) {
      return !n || !!n.nonCombat || n.kind === 'dungeon_gate' || n.kind === 'chest' || n.kind === 'secret_chest' || n.kind === 'puzzle_pillar' || n.kind === 'fish_spot' || n.kind === 'altar_shrine' || n.kind === 'easter_egg' || n.kind === 'skeleton_king_shrine' || n.kind === 'bone_totem';
    }

    damageSingleNodeByMagic(n, rawDmg, fxColor = '#b388ff', fxAng = 0, usedId = 'spell', textColor = null) {
      if (!n || this.activeDungeon || this.isProtectedNode(n)) return false;
      if (n.kind === 'meteor' || n.kind === 'obsidian_vein') {
        this.addFloatingText(n.x, n.y - 18, '¡Inmune a la magia! Requiere pico', '#ff7043');
        return false;
      }
      const nodeDmg = Math.max(1, Math.round(rawDmg * (1 + (this.mods.gatherBonus || 0))));
      n.hp -= nodeDmg;
      n.hitAnim = 0.22;
      this.spawnFx('arcaneBlast', n.x, n.y, fxAng, 0.22, 1.05, 0.85);
      this.spawnParticles(n.x, n.y, fxColor || '#b388ff', 5);
      this.addFloatingText(n.x, n.y - 18, `-${nodeDmg}`, textColor || fxColor || '#e0f7fa');
      if (n.hp <= 0) {
        this.destroyNode(n, null, usedId);
      }
      return true;
    }

    damageNodesInArea(wx, wy, radius, rawDmg, fxColor = '#b388ff', fxAng = 0, usedId = 'spell', excludeNode = null) {
      if (this.activeDungeon || !this.world || !Array.isArray(this.world.nodes)) return 0;
      let hits = 0;
      for (const n of [...this.world.nodes]) {
        if (!n || n === excludeNode || this.isProtectedNode(n)) continue;
        if (dist(wx, wy, n.x, n.y) <= radius + (n.radius || 18)) {
          if (this.damageSingleNodeByMagic(n, rawDmg, fxColor, fxAng, usedId)) hits++;
        }
      }
      return hits;
    }

    throwBomb(item, targetWx = null, targetWy = null) {
      if (!item || (this.inventory[item.id] || 0) <= 0) return false;
      const px = this.player.x;
      const py = this.player.y;
      let targetX = px + this.player.facing * 98;
      let targetY = py + 8;
      if (Number.isFinite(targetWx) && Number.isFinite(targetWy)) {
        const ang = Math.atan2(targetWy - py, targetWx - px);
        const throwDist = clamp(dist(px, py, targetWx, targetWy), 42, 275);
        targetX = px + Math.cos(ang) * throwDist;
        targetY = py + Math.sin(ang) * throwDist;
      }
      if (this.activeDungeon && typeof this.activeDungeon.clipRayToWalkable === 'function') {
        const clipped = this.activeDungeon.clipRayToWalkable(px, py, targetX, targetY);
        targetX = clipped.x;
        targetY = clipped.y;
      }

      this.removeItem(item.id, 1);
      this.player.facing = targetX >= px ? 1 : -1;
      const eff = item.consumableEffect || {};
      const radius = eff.bombRadius || item.bombRadius || 128;
      const dmg = eff.bombDmg || item.bombDmg || 65;
      const fuse = eff.fuse || 0.82;
      const isTnt = !!eff.isTnt || item.id === 'dinamita_tnt';

      if (!this.thrownBombs) this.thrownBombs = [];
      this.thrownBombs.push({
        id: item.id,
        name: item.name,
        isTnt,
        icon: item.icon,
        startX: px,
        startY: py - 8,
        x: px,
        y: py - 8,
        z: 8,
        targetX,
        targetY,
        t: 0,
        airTime: 0.36,
        fuse,
        radius,
        dmg,
        tint: eff.tint || (isTnt ? '#ff5252' : '#ff7043'),
        spin: 0
      });

      Balaclava.Audio.play('slash');
      this.spawnParticles(px + this.player.facing * 12, py - 10, '#ffd54f', 5);
      this.uiDirty = true;
      return true;
    }

    detonateBomb(b) {
      if (!b) return;
      Balaclava.Audio.play('explosion');
      this.shake(0.32, b.isTnt ? 9 : 7);
      this.spawnShockwave(b.x, b.y, b.radius, b.tint || '#ff7043');
      if (b.isTnt) {
        this.spawnFx('pvfx_big_explosion', b.x, b.y - 10, 0, 0.65, 1.35, 1.0, { blend: 'lighter' });
        this.spawnFx('px_blast_big', b.x, b.y - 6, 0, 0.56, 1.25, 0.95, { blend: 'lighter' });
      } else {
        this.spawnFx('soggy_incinerate', b.x, b.y - 6, 0, 0.58, Math.max(1.15, b.radius / 88), 0.98, { blend: 'lighter' });
        this.spawnFx('pvfx_fire_nova', b.x, b.y - 4, 0, 0.48, 1.15, 0.94, { blend: 'lighter' });
      }
      this.spawnFx('aw_explosion_debris', b.x + randInt(-14, 14), b.y + randInt(-10, 10), 0, 0.42, 1.15, 0.92);
      this.spawnParticles(b.x, b.y, b.tint || '#ff8a65', 22);
      this.spawnParticles(b.x, b.y, '#ffe082', 14);

      let nodesBroken = 0;
      if (!this.activeDungeon) {
        for (const n of [...this.world.nodes]) {
          if (this.isProtectedNode(n)) continue;
          if (n.kind === 'meteor' || n.kind === 'obsidian_vein') {
            if (dist(b.x, b.y, n.x, n.y) <= b.radius + (n.radius || 16) * 0.45) {
              this.addFloatingText(n.x, n.y - 18, '¡Inmune a explosivos!', '#ff7043');
            }
            continue;
          }
          if (dist(b.x, b.y, n.x, n.y) <= b.radius + (n.radius || 16) * 0.45) {
            n.hp -= b.dmg;
            n.hitAnim = 0.25;
            this.addFloatingText(n.x, n.y - 22, `-${b.dmg}`, '#ffab91');
            if (n.hp <= 0) {
              this.destroyNode(n, null, b.id || 'dinamita_tnt');
              nodesBroken++;
            } else {
              this.spawnParticles(n.x, n.y, '#ffe082', 6);
            }
          }
        }
      } else if (this.activeDungeon && Array.isArray(this.activeDungeon.props)) {
        const fixedProps = new Set(['brazier', 'banner', 'statue', 'altarRitual', 'sarcophagus']);
        for (let pi = this.activeDungeon.props.length - 1; pi >= 0; pi--) {
          const pr = this.activeDungeon.props[pi];
          if (fixedProps.has(pr.kind)) continue;
          const px = (pr.tx + 0.5) * TILE_SIZE;
          const py = (pr.ty + 0.5) * TILE_SIZE;
          if (dist(b.x, b.y, px, py) <= b.radius + 20) {
            this.activeDungeon.props.splice(pi, 1);
            nodesBroken++;
            this.spawnParticles(px, py, '#d7ccc8', 10);
            this.spawnDrop(px, py, '_coin', randInt(2, 6));
            if (Math.random() < 0.45) {
              this.spawnDrop(px, py, pick(['huesos', 'hierro', 'pocion_vida', 'carbon']), 1);
            }
          }
        }
      }

      const dmgTotal = Math.round(b.dmg * (1 + (this.mods.dmgBonus || 0) * 0.5));
      let enemiesHit = 0;
      const bombHitList = this.activeDungeon
        ? [...this.activeDungeon.enemies, ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
        : [...this.combat.enemies];
      for (const e of bombHitList) {
        if (!e || e._dead || e.hp <= 0) continue;
        if (this.activeDungeon && typeof this.activeDungeon.hasLineOfSight === 'function' && !this.activeDungeon.hasLineOfSight(b.x, b.y, e.x, e.y)) continue;
        const hb = Balaclava.Utils.getEntityHitbox(e);
        if (dist(b.x, b.y, e.x, e.y) <= b.radius + hb.radius || dist(b.x, b.y, hb.cx, hb.cy) <= b.radius + Math.max(hb.hw, hb.hh) * 0.7) {
          const ang = Math.atan2(e.y - b.y, e.x - b.x);
          this.combat.damageEnemy(this, e, dmgTotal, ang, true);
          enemiesHit++;
        }
      }
      if (!this.activeDungeon && Array.isArray(this.world.sheep)) {
        for (let si = this.world.sheep.length - 1; si >= 0; si--) {
          const a = this.world.sheep[si];
          if (!a || a._dead || a.hp <= 0) continue;
          const hb = Balaclava.Utils.getEntityHitbox(a);
          if (dist(b.x, b.y, a.x, a.y) <= b.radius + hb.radius || dist(b.x, b.y, hb.cx, hb.cy) <= b.radius + hb.radius) {
            this.combat.damageAnimal(this, a, dmgTotal, Math.atan2(a.y - b.y, a.x - b.x), true);
            enemiesHit++;
          }
        }
      }

      this.addFloatingText(b.x, b.y - 28, Balaclava.I18n ? Balaclava.I18n.t((nodesBroken > 0 || enemiesHit > 0) ? 'toast.boomHit' : 'toast.boomMiss') : (nodesBroken > 0 || enemiesHit > 0 ? '¡BOOM!' : '¡BUM!'), '#ffca28');
      this.uiDirty = true;
    }

    fireArcaneLaser(itemDef, wx, wy) {
      if (this.isPlayerDead()) return false;
      if (!itemDef || !itemDef.laserStats || (this.inventory[itemDef.id] || 0) <= 0) return false;
      if ((this.laserCooldown || 0) > 0) return false;
      if (!Number.isFinite(wx)) wx = this.player.x + (this.player.facing || 1) * 160;
      if (!Number.isFinite(wy)) wy = this.player.y - 4;

      const st = itemDef.laserStats;
      const energyCost = this.player.godMode ? 0 : Math.max(0.5, st.energyCost * (1 - (this.mods.energySave || 0)));
      if (!this.player.godMode && this.player.energy < energyCost) {
        this.laserCooldown = 0.25;
        this.addFloatingText(this.player.x, this.player.y - 26, Balaclava.I18n ? Balaclava.I18n.t('toast.noEnergy') : '¡Sin energía!', '#ff8a65');
        return false;
      }

      if (energyCost > 0) this.player.energy = Math.max(0, this.player.energy - energyCost);
      this.laserCooldown = st.cooldown;

      const ang = Math.atan2(wy - (this.player.y - 4), wx - this.player.x);
      this.player.facing = Math.cos(ang) >= 0 ? 1 : -1;
      this.player.swingAngle = ang;
      this.player.swingTool = itemDef.id;
      this.player.swingItemId = itemDef.id;
      this.player.swingDur = Math.min(0.16, st.cooldown);
      this.player.swingTimer = this.player.swingDur;

      const x1 = this.player.x + Math.cos(ang) * 18;
      const y1 = (this.player.y - 4) + Math.sin(ang) * 14;
      let x2 = x1 + Math.cos(ang) * st.range;
      let y2 = y1 + Math.sin(ang) * st.range;
      if (this.activeDungeon && typeof this.activeDungeon.clipRayToWalkable === 'function') {
        const clipped = this.activeDungeon.clipRayToWalkable(this.player.x, this.player.y, x2, y2);
        x2 = clipped.x;
        y2 = clipped.y;
      }
      const bMode = st.beamMode || itemDef.id;

      if (!this.laserBeams) this.laserBeams = [];
      this.laserBeams.push({
        x1, y1, x2, y2,
        angle: ang,
        width: st.width || 10,
        color: st.color || '#7c4dff',
        coreColor: st.coreColor || '#e0f7fa',
        beamMode: bMode,
        life: 0.24,
        maxLife: 0.24
      });
      this.spawnFx('pvfx_arcane_beam', x1, y1, ang, 0.30, 0.72, 0.92, { blend: 'lighter' });

      const segDist = (px, py) => {
        const vx = x2 - x1;
        const vy = y2 - y1;
        const len2 = vx * vx + vy * vy || 1;
        const t = clamp(((px - x1) * vx + (py - y1) * vy) / len2, 0, 1);
        const cx = x1 + t * vx;
        const cy = y1 + t * vy;
        return Math.hypot(px - cx, py - cy);
      };

      const beamHalfW = (st.width || 10) * 0.9 + 10;
      const dmgBase = Math.round(st.dmg * (1 + (this.mods.dmgBonus || 0) * 0.4 + (this.mods.spellPower || 0) * 0.6));
      const laserEnemies = (this.activeDungeon
        ? [...this.activeDungeon.enemies, ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
        : [...this.combat.enemies]
      ).filter(e => e && !e._dead && (!this.activeDungeon || typeof this.activeDungeon.hasLineOfSight !== 'function' || this.activeDungeon.hasLineOfSight(this.player.x, this.player.y, e.x, e.y)));
      let firstHitEnemy = null;
      for (const e of laserEnemies) {
        if (Balaclava.Utils.segmentHitsEntity(x1, y1, x2, y2, e, beamHalfW)) {
          if (!firstHitEnemy) firstHitEnemy = e;
          const isCrit = Math.random() < (this.mods.critChance || 0);
          this.combat.damageEnemy(this, e, Math.round(dmgBase * (isCrit ? 1.8 : 1)), ang, isCrit);
          if (bMode === 'solar_pillar') e.burnTimer = Math.max(e.burnTimer || 0, 3.5);
          this.spawnFx(
            bMode === 'solar_pillar' ? 'pvfx_holy_smite'
            : bMode === 'void_pull' ? 'pvfx_void_implosion'
            : bMode === 'orbital_storm' ? 'pvfx_lightning_strike'
            : bMode === 'prism_ricochet' ? 'pvfx_prism_loom'
            : 'pvfx_arcane_burst',
            e.x, e.y, ang, 0.38, 1.05, 0.96, { blend: 'lighter' }
          );
        }
      }
      if (!this.activeDungeon && Array.isArray(this.world.sheep)) {
        for (let si = this.world.sheep.length - 1; si >= 0; si--) {
          const a = this.world.sheep[si];
          if (Balaclava.Utils.segmentHitsEntity(x1, y1, x2, y2, a, beamHalfW)) {
            this.combat.damageAnimal(this, a, dmgBase, ang, false);
          }
        }
      }

      if (!this.activeDungeon) {
        const rawNodeDmg = st.nodeDmg || st.dmg;
        for (const n of [...this.world.nodes]) {
          if (this.isProtectedNode(n)) continue;
          if (segDist(n.x, n.y) <= beamHalfW + (n.radius || 18)) {
            this.damageSingleNodeByMagic(n, rawNodeDmg, st.color || '#b388ff', ang, itemDef.id, st.coreColor || '#e0f7fa');
          }
        }
      }

      const endX = firstHitEnemy ? firstHitEnemy.x : (x1 + Math.cos(ang) * Math.min(st.range * 0.72, dist(x1, y1, wx, wy) || st.range));
      const endY = firstHitEnemy ? firstHitEnemy.y : (y1 + Math.sin(ang) * Math.min(st.range * 0.72, dist(x1, y1, wx, wy) || st.range));

      // Unique secondary laser weapon effects
      if (bMode === 'void_pull' || itemDef.id === 'cetro_vacio') {
        this.spawnFx('pvfx_void_implosion', endX, endY, 0, 0.62, 1.25, 0.98, { blend: 'lighter' });
        for (const e of laserEnemies) {
          if (e && !e._dead && !e.isBoss && dist(endX, endY, e.x, e.y) <= 145) {
            e.x += (endX - e.x) * 0.45;
            e.y += (endY - e.y) * 0.45;
          }
        }
      } else if (bMode === 'solar_pillar' || itemDef.id === 'baculo_dorado') {
        this.spawnFx('aw_holy_pillar', endX, endY + 8, 0, 0.56, 1.15, 0.98, { blend: 'lighter' });
        for (const e of laserEnemies) {
          if (e && !e._dead && dist(endX, endY, e.x, e.y) <= 85) {
            this.combat.damageEnemy(this, e, Math.round(dmgBase * 0.45), ang, false, false);
            e.burnTimer = Math.max(e.burnTimer || 0, 3.5);
          }
        }
      } else if (bMode === 'prism_ricochet' || itemDef.id === 'baculo_solaris') {
        const anchor = firstHitEnemy || { x: endX, y: endY };
        const splitTargets = laserEnemies.filter(e => e && !e._dead && e !== firstHitEnemy && dist(anchor.x, anchor.y, e.x, e.y) <= 230).slice(0, 2);
        for (const stTarget of splitTargets) {
          this.laserBeams.push({
            x1: anchor.x, y1: anchor.y, x2: stTarget.x, y2: stTarget.y,
            angle: Math.atan2(stTarget.y - anchor.y, stTarget.x - anchor.x),
            width: 8, color: '#ffd54f', coreColor: '#ffffff', beamMode: 'ricochet', life: 0.22, maxLife: 0.22
          });
          this.combat.damageEnemy(this, stTarget, Math.round(dmgBase * 0.7), ang, false, false);
          this.spawnFx('lt_bolt3', stTarget.x, stTarget.y - 6, 0, 0.30, 0.9, 0.95, { blend: 'lighter' });
        }
      } else if (bMode === 'orbital_storm' || itemDef.id === 'baculo_estelar') {
        this.spawnFx('pvfx_lightning_strike', endX, endY + 8, 0, 0.52, 1.35, 0.98, { blend: 'lighter' });
        this.spawnFx('aw_explosion_electric', endX, endY, 0, 0.46, 1.15, 0.96, { blend: 'lighter' });
        this.spawnShockwave(endX, endY, 105, '#00e5ff');
        for (const e of laserEnemies) {
          if (e && !e._dead && dist(endX, endY, e.x, e.y) <= 105) {
            this.combat.damageEnemy(this, e, Math.round(dmgBase * 0.5), ang, false, false);
          }
        }
      }

      this.spawnFx('aw_arcane_impact', x2, y2, ang, 0.32, 0.92, 0.9, { blend: 'lighter' });
      Balaclava.Audio.play('laser');
      this.shake(0.08, 2.2);
      return true;
    }

    // === MAIN UPDATE LOOP ===
    update(dt) {
      if (!this.started) return;
      if (this.tutorialSys && !this.tutorialSys.done) {
        this.tutorialSys.update(this, dt);
      }
      if (this.paused) return;
      this.time += dt;
      Balaclava.Audio.update(dt);
      if (Balaclava.UI && typeof Balaclava.UI.checkControlsHelperAFK === 'function') {
        Balaclava.UI.checkControlsHelperAFK(dt);
      }

      // Stuck watchdog: never leave the hero pinned on an unwalkable tile
      // (stale save coordinates, dungeon/overworld mismatch, world edits).
      const pNow = this.player;
      if (pNow && !(pNow.deadTimer > 0)) {
        const ptx = Math.floor(pNow.x / TILE_SIZE);
        const pty = Math.floor(pNow.y / TILE_SIZE);
        let standable;
        if (this.activeDungeon) {
          standable = this.activeDungeon.isTileWalkable(ptx, pty);
        } else {
          const tileVal = this.world.tiles[pty] ? this.world.tiles[pty][ptx] : undefined;
          // Lava (4) is walkable-with-damage, so it still counts as standable.
          standable = this.world.isTileUnlocked(ptx, pty)
            && (tileVal === 1 || tileVal === 2 || tileVal === 3 || tileVal === 4 || tileVal === 5);
        }
        if (standable) {
          this._stuckTimer = 0;
        } else {
          this._stuckTimer = (this._stuckTimer || 0) + dt;
          if (this._stuckTimer >= 0.5) {
            this._stuckTimer = 0;
            this.rescuePlayerFromStuckTile();
          }
        }
      }

      // Day/Night progression (default 660s = 8m day / 3m night)
      const prevPhase = this.getDayPhase().phase;
      this.dayTime += dt / (this.dayDuration || 660);
      if (this.dayTime >= 1) {
        this.dayTime -= 1;
        this.dayCount = (this.dayCount || 1) + 1;
        this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.daySunrise', { day: this.dayCount }) : `Día ${this.dayCount}: Un nuevo amanecer ilumina las islas.`, 'info');
      } else {
        const nextPhase = this.getDayPhase().phase;
        if (prevPhase !== nextPhase) {
          if (nextPhase === 'atardecer') {
            this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.sunsetWarn') : 'Cae el atardecer... Prepara fogatas para iluminar la noche.', 'warn');
          } else if (nextPhase === 'noche') {
            this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.nightStartWarn') : '¡Llega la noche! Criaturas oscuras emergen y sueltan botín extra.', 'warn');
          } else if (nextPhase === 'dia') {
            this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.dayShineInfo') : 'El sol brilla en lo alto. Las criaturas nocturnas se disipan.', 'info');
          }
        }
      }
      if (Math.floor((this.time - dt) * 2) !== Math.floor(this.time * 2)) {
        this.uiDirty = true;
      }

      if (this.spellCooldowns) {
        for (const sid of Object.keys(this.spellCooldowns)) {
          this.spellCooldowns[sid] = Math.max(0, this.spellCooldowns[sid] - dt);
          if (this.spellCooldowns[sid] <= 0) delete this.spellCooldowns[sid];
        }
      }
      if ((this.player.shieldTimer || 0) > 0) {
        this.player.shieldTimer -= dt;
        if (this.player.shieldTimer <= 0) {
          this.player.shieldTimer = 0;
          this.player.shieldHp = 0;
        }
      }

      if (this.plotUnlockAnims && this.plotUnlockAnims.length > 0) {
        for (let i = this.plotUnlockAnims.length - 1; i >= 0; i--) {
          this.plotUnlockAnims[i].t += dt;
          if (this.plotUnlockAnims[i].t >= this.plotUnlockAnims[i].dur) {
            this.plotUnlockAnims.splice(i, 1);
          }
        }
      }

      // Update active buffs & track altar expirations cleanly
      let buffExpired = false;
      const expiredAltars = [];
      for (const k of Object.keys(this.activeBuffs)) {
        const prevSec = Math.ceil(this.activeBuffs[k].time);
        this.activeBuffs[k].time -= dt;
        const curSec = Math.ceil(this.activeBuffs[k].time);
        if (curSec !== prevSec) this.uiDirty = true;
        if (this.activeBuffs[k].time <= 0) {
          const old = this.activeBuffs[k];
          delete this.activeBuffs[k];
          buffExpired = true;
          this.uiDirty = true;
          if (old && old.sourceId && !String(old.sourceId).startsWith('item:')) {
            expiredAltars.push(old);
          }
        }
      }
      if (buffExpired) {
        this.recomputeModifiers();
        for (const ex of expiredAltars) {
          const stillHasSource = Object.values(this.activeBuffs).some(b => b && b.sourceId === ex.sourceId);
          if (!stillHasSource) {
            const visibleCard = Array.isArray(this.altarNotifications)
              ? this.altarNotifications.find(n => n.altarId === ex.sourceId && !n.leaving && n.status !== 'replaced')
              : null;
            const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
            if (visibleCard) {
              visibleCard.status = 'expired';
              visibleCard.kicker = T('altar.expiredTitle');
              visibleCard.durationSec = 0;
              visibleCard.durationText = T('altar.expiredShort');
              visibleCard.dur = Math.min(visibleCard.dur, visibleCard.age + 1.8);
            } else {
              this.pushAltarBlessingNotice({
                altarId: ex.sourceId,
                altarName: ex.sourceName || 'Altar',
                kicker: T('altar.expiredTitle'),
                title: ex.blessingName || ex.sourceName || T('altar.expiredTitle'),
                effectText: T('altar.expiredText', { name: ex.sourceName || 'altar' }),
                durationSec: 0,
                durationText: T('altar.expiredShort'),
                iconUrl: ex.iconUrl || (Balaclava.BUFF_ICON_URLS && Balaclava.BUFF_ICON_URLS.speed),
                color: '#90a4ae',
                buffKeys: [],
                dur: 2.6,
                status: 'expired'
              });
            }
          }
        }
      }

      if (Array.isArray(this.altarNotifications) && this.altarNotifications.length > 0) {
        for (let i = this.altarNotifications.length - 1; i >= 0; i--) {
          const n = this.altarNotifications[i];
          n.age += dt;
          const wasLeaving = n.leaving;
          n.leaving = (n.dur - n.age) <= 0.45;
          if (n.leaving !== wasLeaving) this.uiDirty = true;
          if (n.age >= n.dur) {
            this.altarNotifications.splice(i, 1);
            this.uiDirty = true;
          }
        }
      }
      if (this.levelFlashTimer > 0) this.levelFlashTimer = Math.max(0, this.levelFlashTimer - dt);
      if (this.consumeCooldown > 0) this.consumeCooldown = Math.max(0, this.consumeCooldown - dt);
      if (this.levelBannerTimer > 0) {
        this.levelBannerTimer = Math.max(0, this.levelBannerTimer - dt);
        if (this.levelBannerTimer <= 0) this.levelUpSummary = null;
        this.uiDirty = true;
      }

      this.updateCraftQueue(dt);

      if (this.warningBanner) {
        this.warningBanner.time -= dt;
        if (this.warningBanner.time <= 0) {
          this.warningBanner = null;
          this.uiDirty = true;
        }
      }

      // Manejo del prólogo cinematográfico de despertar
      if (this.introCinematic && this.introCinematic.active) {
        this.updateIntroCinematic(dt);
        if (this.keys && (this.keys.KeyW || this.keys.KeyA || this.keys.KeyS || this.keys.KeyD ||
            this.keys.ArrowUp || this.keys.ArrowDown || this.keys.ArrowLeft || this.keys.ArrowRight)) {
          this.finishIntroCinematic();
        } else {
          return;
        }
      }
      if (this.introCinematic && this.introCinematic.closing) {
        this.introCinematic.bands = Math.max(0, this.introCinematic.bands - dt * 1.5);
        if (this.introCinematic.bands <= 0) {
          this.introCinematic = null;
        }
      }

      if (this.player.godMode) {
        if (this.player.deadTimer > 0) this.player.deadTimer = 0;
        this.player.hp = this.player.maxHp;
        this.player.energy = this.player.maxEnergy;
      }

      if (this.player.deadTimer > 0) {
        this.player.deadTimer -= dt;
        this.uiDirty = true;
        if (this.player.deadTimer <= 0) {
          this.respawnPlayer();
        }
      } else {
        this.updatePlayer(dt);
      }

      if (this.activeDungeon) {
        this.activeDungeon.update(dt, this);
      } else {
        this.world.update(dt, this);
        this.farming.updateCrops(dt, this);
        this.farming.updateFishing(dt, this);
        this.combat.update(dt, this);
      }

      this.automation.update(dt, this);
      if (this.omega) this.omega.update(dt, this);
      this.economy.update(dt, this);
      this.events.update(dt, this);
      this.updateEntities(dt);

      // Dynamic biome music
      if (this.activeDungeon) {
        Balaclava.Audio.setMood('boss');
      } else {
        const biome = this.world.getBiomeAtPixel(this.player.x, this.player.y);
        Balaclava.Audio.setMood(BIOMES[biome].musicMood);
      }

      // Smooth camera + shake
      this.camera.x = Balaclava.Utils.lerp(this.camera.x, this.player.x, Math.min(1, dt * 10));
      this.camera.y = Balaclava.Utils.lerp(this.camera.y, this.player.y, Math.min(1, dt * 10));
      if (this.camera.shakeTime > 0) this.camera.shakeTime = Math.max(0, this.camera.shakeTime - dt);

      // Toasts decay
      for (let i = this.toasts.length - 1; i >= 0; i--) {
        this.toasts[i].time -= dt;
        if (this.toasts[i].time <= 0) {
          this.toasts.splice(i, 1);
          this.uiDirty = true;
        }
      }

      // 2-second Pickup Feed decay
      if (this.pickupFeed && this.pickupFeed.length > 0) {
        let changed = false;
        for (let i = this.pickupFeed.length - 1; i >= 0; i--) {
          this.pickupFeed[i].ttl -= dt;
          if (this.pickupFeed[i].ttl <= 0) {
            this.pickupFeed.splice(i, 1);
            changed = true;
          }
        }
        if (changed) this.uiDirty = true;
      }

      // Reset ambient particles cleanly across zone/session transitions (pooled reuse)
      if (!this._ambientPool) this._ambientPool = [];
      if (!this._ambientCooldowns) this._ambientCooldowns = { firefly: 0.5, butterfly: 0.7, dust: 0.2 };
      this._updateAmbientParticles(dt);

      // Periodic auto-save every 20s
      this.autoSaveTimer += dt;
      if (this.autoSaveTimer >= 20) {
        this.autoSaveTimer = 0;
        this.saveSys.save(this, this.currentSlot, true);
      }
    }

    resetAmbientParticles() {
      if (!this._ambientPool) this._ambientPool = [];
      if (Array.isArray(this.ambientParticles)) {
        while (this.ambientParticles.length > 0) {
          const ap = this.ambientParticles.pop();
          ap.active = false;
          if (this._ambientPool.length < 48) this._ambientPool.push(ap);
        }
      } else {
        this.ambientParticles = [];
      }
      this._ambientCooldowns = { firefly: 0.6, butterfly: 0.8, dust: 0.25 };
    }

    _allocAmbient() {
      if (!this._ambientPool) this._ambientPool = [];
      const ap = this._ambientPool.length > 0 ? this._ambientPool.pop() : {};
      ap.active = true;
      return ap;
    }

    _freeAmbientAt(idx) {
      const ap = this.ambientParticles[idx];
      if (ap) {
        ap.active = false;
        if (!this._ambientPool) this._ambientPool = [];
        if (this._ambientPool.length < 48) this._ambientPool.push(ap);
      }
      const last = this.ambientParticles.length - 1;
      if (idx !== last) this.ambientParticles[idx] = this.ambientParticles[last];
      this.ambientParticles.pop();
    }

    _pickLandAmbientSpot(minR = 54, maxR = 420) {
      const p = this.player;
      if (!p || !this.world || typeof this.world.isTileWalkable !== 'function') return null;
      for (let attempt = 0; attempt < 12; attempt++) {
        const ang = Math.random() * Math.PI * 2;
        const r = minR + Math.random() * (maxR - minR);
        const wx = p.x + Math.cos(ang) * r;
        const wy = p.y + Math.sin(ang) * r;
        const tx = Math.floor(wx / TILE_SIZE);
        const ty = Math.floor(wy / TILE_SIZE);
        if (this.world.isTileWalkable(tx, ty)) {
          return { x: wx, y: wy, biome: this.world.getBiomeAtPixel(wx, wy) };
        }
      }
      const ptx = Math.floor(p.x / TILE_SIZE);
      const pty = Math.floor(p.y / TILE_SIZE);
      if (this.world.isTileWalkable(ptx, pty)) {
        return { x: p.x + rand(-28, 28), y: p.y + rand(-28, 28), biome: this.world.getBiomeAtPixel(p.x, p.y) };
      }
      return null;
    }

    _updateAmbientParticles(dt) {
      if (!this.started || this.paused || this.activeDungeon || (this.player && this.player.deadTimer > 0)) {
        if (this.ambientParticles.length > 0 && this.activeDungeon) this.resetAmbientParticles();
        return;
      }
      if (this.settings && this.settings.particles === false) {
        if (this.ambientParticles.length > 0) this.resetAmbientParticles();
        return;
      }

      const px = this.player.x;
      const py = this.player.y;
      const daylight = this.getDaylightFactor ? this.getDaylightFactor() : 1;
      const isNightOrDusk = daylight < 0.78;
      const maxCullDist = 560;

      // Update active pooled ambient entities & count per-kind strictly
      let fireflyCount = 0;
      let butterflyCount = 0;
      let dustCount = 0;
      for (let i = this.ambientParticles.length - 1; i >= 0; i--) {
        const ap = this.ambientParticles[i];
        if (!ap || !ap.active) {
          this._freeAmbientAt(i);
          continue;
        }
        ap.life -= dt;

        // Smooth transition fade out when time of day shifts
        if (ap.kind === 'firefly' && !isNightOrDusk && daylight > 0.86) {
          ap.life = Math.min(ap.life, 0.9);
        } else if (ap.kind === 'butterfly' && isNightOrDusk && daylight < 0.52) {
          ap.life = Math.min(ap.life, 0.9);
        }

        if (ap.kind === 'firefly') {
          const wobbleX = Math.sin(this.time * (ap.driftFreq || 1.5) + (ap.phase || 0)) * 12;
          const wobbleY = Math.cos(this.time * ((ap.driftFreq || 1.5) * 1.2) + (ap.phase || 0)) * 9;
          const nx = ap.x + (ap.vx + wobbleX) * dt;
          const ny = ap.y + (ap.vy + wobbleY) * dt;
          const ntx = Math.floor(nx / TILE_SIZE);
          const nty = Math.floor(ny / TILE_SIZE);
          if (this.world.isTileWalkable(ntx, nty)) {
            ap.x = nx;
            ap.y = ny;
          } else {
            ap.vx = -ap.vx * 0.85;
            ap.vy = -ap.vy * 0.85;
            ap.x += (ap.homeX - ap.x) * Math.min(1, dt * 1.5);
            ap.y += (ap.homeY - ap.y) * Math.min(1, dt * 1.5);
          }
        } else if (ap.kind === 'butterfly') {
          const nx = ap.x + ap.vx * dt;
          const ny = ap.y + ap.vy * dt;
          const ntx = Math.floor(nx / TILE_SIZE);
          const nty = Math.floor(ny / TILE_SIZE);
          if (this.world.isTileWalkable(ntx, nty)) {
            ap.x = nx;
            ap.y = ny;
          } else {
            ap.vx = -ap.vx;
            ap.vy = -ap.vy;
            ap.x += (ap.homeX - ap.x) * Math.min(1, dt * 1.6);
            ap.y += (ap.homeY - ap.y) * Math.min(1, dt * 1.6);
          }
        } else {
          ap.x += ap.vx * dt;
          ap.y += ap.vy * dt;
        }

        if (ap.life <= 0 || Math.hypot(ap.x - px, ap.y - py) > maxCullDist) {
          this._freeAmbientAt(i);
          continue;
        }
        if (ap.kind === 'firefly') fireflyCount++;
        else if (ap.kind === 'butterfly') butterflyCount++;
        else dustCount++;
      }

      // Hard per-zone caps (<=3 visible fireflies, <=3 visible butterflies, <=10 subtle dust)
      const MAX_FIREFLIES = 3;
      const MAX_BUTTERFLIES = 3;
      const MAX_DUST = 10;
      const cd = this._ambientCooldowns;
      cd.firefly = Math.max(0, (cd.firefly || 0) - dt);
      cd.butterfly = Math.max(0, (cd.butterfly || 0) - dt);
      cd.dust = Math.max(0, (cd.dust || 0) - dt);

      if (isNightOrDusk && fireflyCount < MAX_FIREFLIES && cd.firefly <= 0) {
        cd.firefly = rand(1.6, 2.9);
        const spot = this._pickLandAmbientSpot(64, 380);
        if (spot) {
          const ffPalette = spot.biome === 'bosque_oscuro'
            ? ['#d4ff59', '#ccff90', '#80deea', '#ffe57f']
            : ['#e6ff66', '#ffd54f', '#b2ff59', '#ccff90'];
          const ffLife = rand(8.0, 13.0);
          const ap = this._allocAmbient();
          ap.kind = 'firefly';
          ap.x = spot.x;
          ap.y = spot.y;
          ap.homeX = spot.x;
          ap.homeY = spot.y;
          ap.vx = rand(-14, 14);
          ap.vy = rand(-11, 11);
          ap.phase = rand(0, Math.PI * 2);
          ap.pulseSpeed = rand(2.1, 3.4);
          ap.driftFreq = rand(1.0, 1.8);
          ap.life = ffLife;
          ap.maxLife = ffLife;
          ap.color = ffPalette[Math.floor(Math.random() * ffPalette.length)];
          ap.glowRadius = rand(16, 24);
          ap.size = randInt(2, 4);
          ap.spriteKey = null;
          this.ambientParticles.push(ap);
        }
      }

      if (!isNightOrDusk && butterflyCount < MAX_BUTTERFLIES && cd.butterfly <= 0) {
        cd.butterfly = rand(2.0, 3.6);
        const pBiome = this.world.getBiomeAtPixel(px, py);
        if (pBiome === 'pradera' || pBiome === 'bosque_oscuro') {
          const spot = this._pickLandAmbientSpot(72, 360);
          if (spot && (spot.biome === 'pradera' || spot.biome === 'bosque_oscuro')) {
            const bKeys = spot.biome === 'bosque_oscuro'
              ? ['butterfly_violet', 'butterfly_blue', 'butterfly_gold']
              : ['butterfly_orange', 'butterfly_blue', 'butterfly_gold', 'butterfly_violet'];
            const bLife = rand(7.0, 11.5);
            const ap = this._allocAmbient();
            ap.kind = 'butterfly';
            ap.spriteKey = bKeys[Math.floor(Math.random() * bKeys.length)];
            ap.x = spot.x;
            ap.y = spot.y;
            ap.homeX = spot.x;
            ap.homeY = spot.y;
            ap.vx = rand(-22, 22);
            ap.vy = rand(-15, 15);
            ap.phase = rand(0, Math.PI * 2);
            ap.life = bLife;
            ap.maxLife = bLife;
            ap.color = '#dcedc8';
            ap.size = randInt(16, 21);
            this.ambientParticles.push(ap);
          }
        }
      }

      if (dustCount < MAX_DUST && cd.dust <= 0) {
        cd.dust = rand(0.32, 0.58);
        const biome = this.world.getBiomeAtPixel(px, py);
        const col = biome === 'montanas_heladas' ? '#e1f5fe'
          : biome === 'tierras_volcanicas' ? '#ff7043'
          : biome === 'bosque_oscuro' ? '#ce93d8'
          : biome === 'desierto' ? '#ffe082' : '#dcedc8';
        const dLife = rand(2.8, 4.6);
        const ap = this._allocAmbient();
        ap.kind = 'dust';
        ap.spriteKey = null;
        ap.x = px + rand(-460, 460);
        ap.y = py + rand(-300, 300);
        ap.vx = biome === 'desierto' ? rand(16, 36) : rand(-12, 12);
        ap.vy = biome === 'tierras_volcanicas' ? rand(-24, -8) : biome === 'montanas_heladas' ? rand(16, 34) : rand(-8, 8);
        ap.life = dLife;
        ap.maxLife = dLife;
        ap.color = col;
        ap.size = biome === 'montanas_heladas' ? 4 : 3;
        this.ambientParticles.push(ap);
      }
    }

    updatePlayer(dt) {
      const p = this.player;
      p.animTimer += dt;
      if (p.swingTimer > 0) p.swingTimer = Math.max(0, p.swingTimer - dt);
      if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - dt);
      if (p.dashCd > 0) p.dashCd = Math.max(0, p.dashCd - dt);

      if (p.bowReloadTimer > 0) {
        p.bowReloadTimer = Math.max(0, p.bowReloadTimer - dt);
        if (p.bowReloadTimer <= 0) {
          if (this.getArrowCount() > 0) {
            p.bowLoaded = true;
            const rdyMsg = (Balaclava.I18n && Balaclava.I18n.t('toast.bowReady') !== 'toast.bowReady')
              ? Balaclava.I18n.t('toast.bowReady')
              : 'Arco cargado';
            this.addFloatingText(p.x, p.y - 28, rdyMsg, '#a5d6a7');
          } else {
            p.bowLoaded = false;
          }
          this.uiDirty = true;
        }
      } else if (p.bowNeedsAutoReload && p.swingTimer <= 0) {
        p.bowNeedsAutoReload = false;
        if (this.getArrowCount() > 0) {
          this.reloadBow(true);
        } else {
          p.bowLoaded = false;
          this.uiDirty = true;
        }
      }

      // Slow natural energy regen so food, stamina skills, and campfires feel meaningful
      p.energy = Math.min(p.maxEnergy, p.energy + dt * (1.2 + (this.mods.energyRegen || 0)));
      if (this.mods.regen > 0) p.hp = Math.min(p.maxHp, p.hp + dt * this.mods.regen);

      // Elemental & status debuffs inflicted by enemy attacks
      let statusSpeedMult = 1.0;
      if (p.statusEffects && !p.godMode && p.deadTimer <= 0) {
        const STATUS_META = {
          burn: { fx: 'st_burn', col: '#ff7043' },
          poison: { fx: 'st_poisonbubble', col: '#8bc34a' },
          bleed: { fx: 'st_bleed', col: '#ef5350' },
          slow: { fx: 'st_freeze', col: '#80deea', speedMult: 0.65 },
          shock: { fx: 'st_shock', col: '#4fc3f7', speedMult: 0.80 },
          curse: { fx: 'st_curse', col: '#ce93d8' }
        };
        for (const k of Object.keys(p.statusEffects)) {
          const st = p.statusEffects[k];
          if (!st || st.timer <= 0) { delete p.statusEffects[k]; continue; }
          st.timer -= dt;
          const sm = STATUS_META[k];
          if (sm && sm.speedMult) statusSpeedMult = Math.min(statusSpeedMult, sm.speedMult);
          st.fxCd = (st.fxCd || 0) - dt;
          if (st.fxCd <= 0 && sm && this.spawnFx) {
            st.fxCd = 0.50;
            this.spawnFx(sm.fx, p.x, p.y - 12, 0, 0.46, 0.72, 0.9, { follow: p, offY: -12, blend: 'lighter' });
          }
          if ((st.tickDmg || 0) > 0) {
            st.tickCd = (st.tickCd || 0.65) - dt;
            if (st.tickCd <= 0) {
              st.tickCd = 0.68;
              const td = Math.max(1, Math.round(st.tickDmg));
              p.hp = Math.max(0, p.hp - td);
              this.addFloatingText(p.x, p.y - 28, `-${td}`, (sm && sm.col) || '#ef5350');
              if (p.hp <= 0) {
                p.invuln = 0;
                this.damagePlayer(1);
                break;
              }
            }
          }
          if (st.timer <= 0) delete p.statusEffects[k];
        }
      }

      // Gradual Healing-over-Time from food & potions
      if (Array.isArray(this.hotHeals) && this.hotHeals.length > 0 && p.deadTimer <= 0) {
        for (let i = this.hotHeals.length - 1; i >= 0; i--) {
          const h = this.hotHeals[i];
          const stepDt = Math.min(dt, Math.max(0, h.dur - h.elapsed));
          const healAmt = Math.min(h.remaining, (h.total / Math.max(0.1, h.dur)) * stepDt);
          h.elapsed += dt;
          h.remaining -= healAmt;
          h.tickAccum += dt;
          if (healAmt > 0 && p.hp < p.maxHp) {
            p.hp = Math.min(p.maxHp, p.hp + healAmt);
            this.uiDirty = true;
          }
          if (h.tickAccum >= 0.35) {
            h.tickAccum = 0;
            if (!this.settings || this.settings.particles !== false) {
              this.spawnParticles(p.x + (Math.random() - 0.5) * 16, p.y - 6, '#69f0ae', 3);
            }
          }
          if (h.remaining <= 0.05 || h.elapsed >= h.dur) {
            if (h.remaining > 0.05 && p.hp < p.maxHp) {
              p.hp = Math.min(p.maxHp, p.hp + h.remaining);
              this.uiDirty = true;
            }
            this.hotHeals.splice(i, 1);
          }
        }
      }

      if (p.dashTimer > 0) {
        p.dashTimer -= dt;
        this.movePlayerWithCollision(p.dashVx * dt, p.dashVy * dt);
      } else {
        let mx = 0, my = 0;
        const kb = (Balaclava.getKeybinds && Balaclava.getKeybinds()) || {};
        if (this.keys[kb.moveUp || 'KeyW'] || this.keys.ArrowUp) my -= 1;
        if (this.keys[kb.moveDown || 'KeyS'] || this.keys.ArrowDown) my += 1;
        if (this.keys[kb.moveLeft || 'KeyA'] || this.keys.ArrowLeft) mx -= 1;
        if (this.keys[kb.moveRight || 'KeyD'] || this.keys.ArrowRight) mx += 1;

        p.moving = mx !== 0 || my !== 0;
        if (p.moving) {
          const len = Math.hypot(mx, my);
          mx /= len; my /= len;
          if (Math.abs(mx) > 0.1 && p.swingTimer <= 0) p.facing = mx > 0 ? 1 : -1;

          let baseSpeed = 190 * (1 + (this.mods.moveSpeed || 0)) * statusSpeedMult;
          if (p.swingTimer > 0) baseSpeed *= 0.65;
          const ptx = Math.floor(p.x / TILE_SIZE);
          const pty = Math.floor(p.y / TILE_SIZE);
          const onWater = !this.activeDungeon && this.world.tiles[pty] && this.world.tiles[pty][ptx] === 0;
          const floorB = !this.activeDungeon && this.getBuildingAtTile(ptx, pty);
          const roadMult = (floorB && Balaclava.BUILDINGS[floorB.type] && Balaclava.BUILDINGS[floorB.type].speedFloor)
            ? (1 + Balaclava.BUILDINGS[floorB.type].speedFloor)
            : 1.0;
          const speed = (onWater ? baseSpeed * 0.45 : baseSpeed) * roadMult;
          this.movePlayerWithCollision(mx * speed * dt, my * speed * dt);

          // Subtle Retro_Impact_Effects_3 dust puffs under footsteps while moving
          p.stepTimer = (p.stepTimer || 0) - dt;
          if (p.stepTimer <= 0) {
            p.stepTimer = 0.19;
            if (!this.settings || this.settings.particles !== false) {
              this.spawnFx('walkDust', p.x + (Math.random() - 0.5) * 8, p.y + 13, 0, 0.28, 0.78, 0.36);
            }
          }
          this.stepAudioTimer = (this.stepAudioTimer || 0) - dt;
          if (this.stepAudioTimer <= 0) {
            this.stepAudioTimer = 0.34;
            Balaclava.Audio.play('step');
          }
        } else {
          p.stepTimer = 0.04;
          this.stepAudioTimer = 0.08;
        }
      }

      // Hold mouse button for melee/harvesting/bow/tilling & continuous laser wands — NEVER auto-repeat fishing rod or consumables/bombs!
      const holdSlot = this.hotbar[this.activeSlot];
      const holdItemDef = holdSlot && holdSlot.kind === 'item' ? Balaclava.ITEMS[holdSlot.id] : null;
      const isHoldLaser = !!(holdItemDef && holdItemDef.isLaserWeapon);
      const isHoldBow = !!(holdSlot && holdSlot.kind === 'tool' && holdSlot.id === 'arco');
      const noHoldRepeat = !holdSlot || holdSlot.id === 'cana' || (holdSlot.kind === 'item' && !isHoldLaser) || !!this.farming.fishing;
      const holdReady = isHoldLaser
        ? (this.laserCooldown || 0) <= 0
        : (p.swingTimer <= 0 && (!isHoldBow || ((p.bowReloadTimer || 0) <= 0 && p.bowLoaded !== false && this.getArrowCount() > 0)));
      if (this.mouse.down && !noHoldRepeat && holdReady && !this.placingBuildingId && !Balaclava.UI.hasOpenModal()) {
        this.updateMouseWorld();
        this.useActiveSlot(this.mouse.wx, this.mouse.wy);
      }
    }

    triggerDash() {
      if (this.isPlayerDead()) return;
      const p = this.player;
      if (p.dashCd > 0 || p.dashTimer > 0) return;
      if ((p.energy || 0) < 20) {
        if (!this._lastDashEnWarn || this.time - this._lastDashEnWarn > 1.2) {
          this._lastDashEnWarn = this.time;
          Balaclava.Audio.play('error');
          this.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.dashNeedEnergy') : '¡Necesitas 20 Energía para hacer Dash!', 'warn');
        }
        return;
      }
      p.energy = Math.max(0, p.energy - 20);
      this.uiDirty = true;
      let dx = 0, dy = 0;
      if (this.keys.KeyW || this.keys.ArrowUp) dy -= 1;
      if (this.keys.KeyS || this.keys.ArrowDown) dy += 1;
      if (this.keys.KeyA || this.keys.ArrowLeft) dx -= 1;
      if (this.keys.KeyD || this.keys.ArrowRight) dx += 1;
      if (dx === 0 && dy === 0) dx = p.facing;
      const len = Math.hypot(dx, dy) || 1;
      const spd = 480 * (1 + (this.mods.dashBonus || 0));
      p.dashVx = (dx / len) * spd;
      p.dashVy = (dy / len) * spd;
      p.dashTimer = 0.16;
      p.dashCd = 0.75;
      Balaclava.Audio.play('slash');
      const dashAng = Math.atan2(dy, dx);
      this.spawnFx('px_dash_trail', p.x, p.y + 4, dashAng, 0.38, 1.1, 0.92, { blend: 'lighter' });
      this.spawnFx('pvfx_blink_dash', p.x + Math.cos(dashAng) * 18, p.y + Math.sin(dashAng) * 18, dashAng, 0.34, 0.95, 0.9, { blend: 'lighter' });
      this.spawnParticles(p.x, p.y, '#e6d3b3', 5);
    }

    movePlayerWithCollision(dx, dy) {
      const canStand = (x, y) => {
        if (this.activeDungeon) {
          return this.activeDungeon.isTileWalkable(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
        }
        // Strict land-only traversal (player NEVER steps onto water tile === 0 or locked islands)
        const pts = [
          [x - 8, y - 6],
          [x + 8, y - 6],
          [x - 8, y + 6],
          [x + 8, y + 6]
        ];
        for (const [cx, cy] of pts) {
          const tx = Math.floor(cx / TILE_SIZE);
          const ty = Math.floor(cy / TILE_SIZE);
          if (!this.world.isTileUnlocked(tx, ty)) return false;
          const tile = this.world.tiles[ty] && this.world.tiles[ty][tx];
          if (tile === 4) {
            this.damagePlayer(12);
          } else if (!this.world.isTileWalkable(tx, ty)) {
            return false;
          }
        }
        return true;
      };

      if (canStand(this.player.x + dx, this.player.y)) this.player.x += dx;
      if (canStand(this.player.x, this.player.y + dy)) this.player.y += dy;
    }

    updateEntities(dt) {
      // Dropped items with magnet pickup (+ Alcance active tool enchant bonus)
      const actSlot = this.hotbar && this.hotbar[this.activeSlot];
      const actToolId = actSlot && actSlot.kind === 'tool' ? actSlot.id : null;
      const alcMagnet = (actToolId && this.toolEnchants && this.toolEnchants[actToolId])
        ? (this.toolEnchants[actToolId].alcance || 0) * 35
        : 0;
      const magRadius = 72 + (this.mods.magnetBonus || 0) + alcMagnet;
      for (let i = this.drops.length - 1; i >= 0; i--) {
        const d = this.drops[i];
        if (d.life === undefined || isNaN(d.life)) d.life = 0.5;
        if (!d.qty && d.amount) d.qty = d.amount;
        if (!d.qty) d.qty = 1;
        if (d.vx === undefined) d.vx = 0;
        if (d.vy === undefined) d.vy = 0;
        d.life += dt;
        if (d.life < 0.28) {
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.vy += 190 * dt;
        }
        const distP = dist(d.x, d.y, this.player.x, this.player.y);
        if (distP < magRadius && d.life > 0.25) {
          const ang = Math.atan2(this.player.y - d.y, this.player.x - d.x);
          d.x += Math.cos(ang) * 320 * dt;
          d.y += Math.sin(ang) * 320 * dt;
        }
        if (distP < 24 && d.life > 0.22) {
          if (d.itemId === '_coin') {
            this.addCoins(d.qty);
            Balaclava.Audio.play('coin');
            this.spawnFx('pvfx_coin_pickup', d.x, d.y - 6, 0, 0.42, 0.95, 0.95, { blend: 'lighter' });
          } else {
            this.addItem(d.itemId, d.qty);
            Balaclava.Audio.play('pickup');
            this.spawnFx('pvfx_star_burst_pickup', d.x, d.y - 6, 0, 0.36, 0.85, 0.85, { blend: 'lighter' });
          }
          this.drops.splice(i, 1);
        }
      }

      // Player projectiles (hitbox-synced body + feet check, homing/pierce/AoE/DOT support)
      const ptInHb = Balaclava.Utils.pointInEntityHitbox;
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const pr = this.projectiles[i];
        pr.life -= dt;
        if (pr.homing) {
          const targets = this.activeDungeon
            ? [...this.activeDungeon.enemies, ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
            : this.combat.enemies;
          let nearest = null;
          let bestD = 220;
          for (const e of targets) {
            if (!e || e._dead || (pr.hitIds && pr.hitIds.has(e))) continue;
            if (this.activeDungeon && typeof this.activeDungeon.hasLineOfSight === 'function' && !this.activeDungeon.hasLineOfSight(pr.x, pr.y, e.x, e.y)) continue;
            const d = dist(pr.x, pr.y, e.x, e.y);
            if (d < bestD) { bestD = d; nearest = e; }
          }
          if (nearest) {
            const spd = Math.hypot(pr.vx, pr.vy) || 420;
            const dAng = Math.atan2(nearest.y - pr.y, nearest.x - pr.x);
            const curAng = Math.atan2(pr.vy, pr.vx);
            let diff = dAng - curAng;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const nAng = curAng + Math.max(-5.5 * dt, Math.min(5.5 * dt, diff));
            pr.vx = Math.cos(nAng) * spd;
            pr.vy = Math.sin(nAng) * spd;
          }
        }
        if (pr.boomerang) {
          const half = (pr.maxLife || 1.35) * 0.52;
          if (!pr._returning && pr.life <= half) {
            pr._returning = true;
            if (pr.hitIds) pr.hitIds.clear();
          }
          if (pr._returning) {
            const retAng = Math.atan2(this.player.y - pr.y, this.player.x - pr.x);
            const spd = Math.hypot(pr.vx, pr.vy) || 480;
            pr.vx = Math.cos(retAng) * spd;
            pr.vy = Math.sin(retAng) * spd;
          }
        }
        const prevX = pr.x;
        const prevY = pr.y;
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
        let hit = false;
        let hitWall = false;
        if (this.activeDungeon && typeof this.activeDungeon.isTileWalkable === 'function') {
          const stepDx = pr.x - prevX;
          const stepDy = pr.y - prevY;
          const stepCount = Math.max(1, Math.ceil(Math.hypot(stepDx, stepDy) / 10));
          for (let s = 1; s <= stepCount; s++) {
            const sx = prevX + (stepDx * s) / stepCount;
            const sy = prevY + (stepDy * s) / stepCount;
            if (!this.activeDungeon.isTileWalkable(Math.floor(sx / TILE_SIZE), Math.floor(sy / TILE_SIZE))) {
              hitWall = true;
              hit = true;
              this.spawnParticles(prevX, prevY, pr.color || '#90a4ae', 5);
              break;
            }
          }
        }
        const pad = pr.hitPad || 8;
        const triggerProjAoe = (excludeEnemy, excludeNode) => {
          if (hitWall) return;
          if (pr.vfxHit && this.spawnFx) {
            this.spawnFx(pr.vfxHit, pr.x, pr.y, Math.atan2(pr.vy, pr.vx), 0.36, 0.95, 0.96, { blend: 'lighter' });
          }
          if (pr.clusterSplit && !pr._clustered) {
            pr._clustered = true;
            const cnt = pr.clusterSplit;
            for (let k = 0; k < cnt; k++) {
              const ca = (k / cnt) * Math.PI * 2 + 0.4;
              this.spawnPlayerProjectile(pr.x, pr.y, Math.cos(ca) * 320, Math.sin(ca) * 320, Math.round(pr.dmg * 0.42), pr.color || '#ff5252', false, {
                life: 0.45, aoeRadius: 34, burnDmg: 6, hitsNodes: true, vfxKey: 'soggy_fireball', vfxHit: 'pvfx_small_explosion', usedId: pr.usedId
              });
            }
          }
          if (!pr.aoeRadius) return;
          const projAng = Math.atan2(pr.vy, pr.vx);
          this.spawnShockwave(pr.x, pr.y, pr.aoeRadius, pr.color || '#ff7043');
          this.spawnParticles(pr.x, pr.y, pr.color || '#ff7043', 14);
          const pool = this.activeDungeon
            ? [...this.activeDungeon.enemies, ...(this.activeDungeon.boss ? [this.activeDungeon.boss] : [])]
            : this.combat.enemies;
          for (const other of pool) {
            if (!other || other === excludeEnemy || other._dead) continue;
            if (this.activeDungeon && typeof this.activeDungeon.hasLineOfSight === 'function' && !this.activeDungeon.hasLineOfSight(pr.x, pr.y, other.x, other.y)) continue;
            if (dist(pr.x, pr.y, other.x, other.y) <= pr.aoeRadius + (other.radius || 16)) {
              this.combat.damageEnemy(this, other, Math.round(pr.dmg * 0.72), Math.atan2(other.y - pr.y, other.x - pr.x), false, false);
              if (pr.burnDmg) other.burnTimer = Math.max(other.burnTimer || 0, 3.0);
              if (pr.poisonDmg) other.poisonTimer = Math.max(other.poisonTimer || 0, 3.2);
            }
          }
          if ((!pr.isArrow || pr.hitsNodes) && !this.activeDungeon) {
            this.damageNodesInArea(pr.x, pr.y, pr.aoeRadius, Math.round(pr.dmg * 0.72), pr.color || '#ff7043', projAng, pr.usedId || 'spell', excludeNode);
          }
        };
        const onProjHit = (target) => {
          if (pr.hitIds) pr.hitIds.add(target);
          const isCrit = Math.random() < (this.mods.critChance || 0);
          const dealt = pr.dmg * (isCrit ? 2 : 1);
          this.combat.damageEnemy(this, target, dealt, Math.atan2(pr.vy, pr.vx), isCrit);
          if (pr.slowDur) target.slowTimer = Math.max(target.slowTimer || 0, pr.slowDur);
          if (pr.burnDmg) target.burnTimer = Math.max(target.burnTimer || 0, 3.0);
          if (pr.poisonDmg) target.poisonTimer = Math.max(target.poisonTimer || 0, 3.2);
          if (pr.healOnHit) this.healPlayer(pr.healOnHit, 0);
          if (pr.lifeSteal) this.healPlayer(Math.max(2, Math.round(dealt * pr.lifeSteal)), 0);
          triggerProjAoe(target, null);
          if ((pr.pierce || 0) > 0) { pr.pierce--; return false; }
          return true;
        };
        if (!hitWall && this.activeDungeon) {
          const dEnemies = this.activeDungeon.enemies;
          for (let ei = dEnemies.length - 1; ei >= 0; ei--) {
            const e = dEnemies[ei];
            if (pr.hitIds && pr.hitIds.has(e)) continue;
            if (ptInHb(pr.x, pr.y, e, pad)) {
              if (onProjHit(e)) { hit = true; break; }
            }
          }
          if (!hit && this.activeDungeon.boss && !(pr.hitIds && pr.hitIds.has(this.activeDungeon.boss)) && ptInHb(pr.x, pr.y, this.activeDungeon.boss, pad)) {
            if (onProjHit(this.activeDungeon.boss)) hit = true;
          }
        } else if (!hitWall) {
          const wEnemies = this.combat.enemies;
          for (let ei = wEnemies.length - 1; ei >= 0; ei--) {
            const e = wEnemies[ei];
            if (pr.hitIds && pr.hitIds.has(e)) continue;
            if (ptInHb(pr.x, pr.y, e, pad)) {
              if (onProjHit(e)) { hit = true; break; }
            }
          }
        }
        if (!hit && !this.activeDungeon && Array.isArray(this.world.sheep)) {
          for (let si = this.world.sheep.length - 1; si >= 0; si--) {
            const a = this.world.sheep[si];
            if (ptInHb(pr.x, pr.y, a, pad)) {
              const isCrit = Math.random() < (this.mods.critChance || 0);
              this.combat.damageAnimal(this, a, pr.dmg * (isCrit ? 2 : 1), Math.atan2(pr.vy, pr.vx), isCrit);
              triggerProjAoe(null, null);
              hit = true;
              break;
            }
          }
        }
        if (!hit && (!pr.isArrow || pr.hitsNodes) && !this.activeDungeon && this.world && Array.isArray(this.world.nodes)) {
          const projAng = Math.atan2(pr.vy, pr.vx);
          for (let ni = this.world.nodes.length - 1; ni >= 0; ni--) {
            const n = this.world.nodes[ni];
            if (!n || this.isProtectedNode(n) || (pr.hitIds && pr.hitIds.has(n))) continue;
            if (dist(pr.x, pr.y, n.x, n.y) <= (n.radius || 18) + (pr.hitPad || 10)) {
              if (pr.hitIds) pr.hitIds.add(n);
              this.damageSingleNodeByMagic(n, Math.max(1, Math.round(pr.dmg * 0.9)), pr.color || '#4fc3f7', projAng, pr.usedId || 'spell');
              triggerProjAoe(null, n);
              if ((pr.pierce || 0) > 0) {
                pr.pierce--;
              } else {
                hit = true;
                break;
              }
            }
          }
        }
        if (hit || pr.life <= 0) this.projectiles.splice(i, 1);
      }

      // Enemy projectiles
      for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
        const pr = this.enemyProjectiles[i];
        pr.life -= dt;
        if (pr.homing && pr.homing > 0 && !this.isPlayerDead()) {
          const curAng = Math.atan2(pr.vy, pr.vx);
          const spd = Math.hypot(pr.vx, pr.vy) || 200;
          const aimAng = Math.atan2(this.player.y - pr.y, this.player.x - pr.x);
          const diff = Math.atan2(Math.sin(aimAng - curAng), Math.cos(aimAng - curAng));
          const nextAng = curAng + Math.max(-pr.homing * dt, Math.min(pr.homing * dt, diff));
          pr.vx = Math.cos(nextAng) * spd;
          pr.vy = Math.sin(nextAng) * spd;
        }
        const ePrevX = pr.x;
        const ePrevY = pr.y;
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
        let hitDungeonWall = false;
        if (this.activeDungeon && typeof this.activeDungeon.isTileWalkable === 'function') {
          const stepDx = pr.x - ePrevX;
          const stepDy = pr.y - ePrevY;
          const stepCount = Math.max(1, Math.ceil(Math.hypot(stepDx, stepDy) / 10));
          for (let s = 1; s <= stepCount; s++) {
            const sx = ePrevX + (stepDx * s) / stepCount;
            const sy = ePrevY + (stepDy * s) / stepCount;
            if (!this.activeDungeon.isTileWalkable(Math.floor(sx / TILE_SIZE), Math.floor(sy / TILE_SIZE))) {
              hitDungeonWall = true;
              break;
            }
          }
        }
        const hitR = pr.radius || 18;
        if (hitDungeonWall) {
          if (pr.impactVfx && this.spawnFx) {
            this.spawnFx(pr.impactVfx, ePrevX, ePrevY, 0, 0.20, 0.50, 0.72, { blend: 'lighter' });
          } else {
            this.spawnParticles(ePrevX, ePrevY, pr.color || '#90a4ae', 4);
          }
          this.enemyProjectiles.splice(i, 1);
        } else if (dist(pr.x, pr.y, this.player.x, this.player.y) < hitR) {
          if (pr.impactVfx && this.spawnFx) {
            this.spawnFx(pr.impactVfx, pr.x, pr.y, 0, 0.28, 0.72, 0.94, { blend: 'lighter' });
          }
          this.damagePlayer(pr.dmg, { isMagic: true, status: pr.status || null });
          this.enemyProjectiles.splice(i, 1);
        } else if (pr.life <= 0) {
          if (pr.impactVfx && this.spawnFx) {
            this.spawnFx(pr.impactVfx, pr.x, pr.y, 0, 0.22, 0.55, 0.75, { blend: 'lighter' });
          }
          this.enemyProjectiles.splice(i, 1);
        }
      }

      // Particles, shockwaves & floating text
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.life -= dt;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        if (pt.life <= 0) this.particles.splice(i, 1);
      }
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.life -= dt;
        sw.r = sw.maxR * (1 - sw.life / sw.maxLife);
        if (sw.life <= 0) this.shockwaves.splice(i, 1);
      }
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.life -= dt;
        ft.y -= 28 * dt;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }
      this.laserCooldown = Math.max(0, (this.laserCooldown || 0) - dt);
      if (this.thrownBombs) {
        for (let i = this.thrownBombs.length - 1; i >= 0; i--) {
          const b = this.thrownBombs[i];
          b.t += dt;
          const flyP = Math.min(1, b.t / b.airTime);
          b.x = b.startX + (b.targetX - b.startX) * flyP;
          b.y = b.startY + (b.targetY - b.startY) * flyP;
          b.z = Math.sin(flyP * Math.PI) * 34;
          b.spin += dt * (flyP < 1 ? 11.5 : 2.2);
          if (Math.random() < 0.35) {
            this.particles.push({
              x: b.x + rand(-4, 4),
              y: b.y - b.z - 10,
              vx: rand(-18, 18),
              vy: rand(-45, -15),
              life: 0.22,
              maxLife: 0.22,
              color: Math.random() < 0.5 ? '#ffd54f' : '#ff7043',
              size: 3
            });
          }
          if (b.t >= b.fuse) {
            this.thrownBombs.splice(i, 1);
            this.detonateBomb(b);
          }
        }
      }
      if (this.laserBeams) {
        for (let i = this.laserBeams.length - 1; i >= 0; i--) {
          this.laserBeams[i].life -= dt;
          if (this.laserBeams[i].life <= 0) this.laserBeams.splice(i, 1);
        }
      }
      if (this.fxAnims) {
        for (let i = this.fxAnims.length - 1; i >= 0; i--) {
          const fx = this.fxAnims[i];
          fx.life -= dt;
          if (fx.follow && !fx.follow._dead && fx.follow.x != null) {
            fx.x = fx.follow.x + (fx.offX || 0);
            fx.y = fx.follow.y + (fx.offY || 0);
          }
          if (fx.life <= 0) this.fxAnims.splice(i, 1);
        }
      }
      if (this.fishCatchLeaps && this.fishCatchLeaps.length > 0) {
        for (let i = this.fishCatchLeaps.length - 1; i >= 0; i--) {
          const leap = this.fishCatchLeaps[i];
          leap.t += dt;
          const p = leap.t / leap.duration;
          if (Math.random() < 0.42) {
            const arcY = -Math.sin(Math.min(1, p) * Math.PI) * 54;
            const px = leap.startX + (leap.targetX - leap.startX) * p;
            const py = leap.startY + (leap.targetY - leap.startY) * p + arcY;
            this.spawnParticles(px, py, '#e0f7fa', 1);
          }
          if (leap.t >= leap.duration) {
            this.spawnParticles(leap.targetX, leap.targetY, '#ffd54f', 12);
            this.fishCatchLeaps.splice(i, 1);
          }
        }
      }
    }

    updateMouseWorld() {
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.mouse.wx = (this.mouse.sx - w / 2) / this.camera.zoom + this.camera.x;
      this.mouse.wy = (this.mouse.sy - h / 2) / this.camera.zoom + this.camera.y;
    }

    drawFlashSprite(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
      if (!img || sw <= 0 || sh <= 0) return;
      if (!this._flashCanvas) {
        this._flashCanvas = document.createElement('canvas');
        this._flashCanvas.width = Math.max(256, sw);
        this._flashCanvas.height = Math.max(256, sh);
        this._flashCtx = this._flashCanvas.getContext('2d');
      }
      const fc = this._flashCanvas;
      const fctx = this._flashCtx;
      if (fc.width < sw || fc.height < sh) {
        fc.width = Math.max(fc.width, sw);
        fc.height = Math.max(fc.height, sh);
      } else {
        fctx.clearRect(0, 0, sw, sh);
      }
      fctx.globalCompositeOperation = 'source-over';
      fctx.imageSmoothingEnabled = false;
      fctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      fctx.globalCompositeOperation = 'source-atop';
      fctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      fctx.fillRect(0, 0, sw, sh);
      fctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(fc, 0, 0, sw, sh, dx, dy, dw, dh);
    }

    getTintedSprite(cacheKey, img, sx, sy, sw, sh, opts) {
      if (!img || sw <= 0 || sh <= 0) return null;
      if (!this._tintedSpriteCache) this._tintedSpriteCache = new Map();
      // Usar solo cacheKey (no sx/sy) para goldGlow — así el cache acierta aunque cambie el frame.
      // El canvas tinted cubre todo el spritesheet y se recorta al dibujar.
      const isFullSheet = opts && opts._fullSheet;
      const fullKey = isFullSheet ? cacheKey : `${cacheKey}:${sx}:${sy}:${sw}:${sh}`;
      if (this._tintedSpriteCache.has(fullKey)) return this._tintedSpriteCache.get(fullKey);
      if (this._tintedSpriteCache.size >= 640) {
        const oldestKey = this._tintedSpriteCache.keys().next().value;
        if (oldestKey !== undefined) this._tintedSpriteCache.delete(oldestKey);
      }

      const c = document.createElement('canvas');
      c.width = sw;
      c.height = sh;
      const octx = c.getContext('2d');
      octx.imageSmoothingEnabled = false;

      if (opts && typeof octx.filter === 'string') {
        const parts = [];
        if (opts.sepia) parts.push(`sepia(${opts.sepia})`);
        if (opts.sat !== undefined && opts.sat !== 1) parts.push(`saturate(${opts.sat})`);
        if (opts.hue) parts.push(`hue-rotate(${opts.hue}deg)`);
        if (opts.bright !== undefined && opts.bright !== 1) parts.push(`brightness(${opts.bright})`);
        if (opts.contrast !== undefined && opts.contrast !== 1) parts.push(`contrast(${opts.contrast})`);
        octx.filter = parts.length ? parts.join(' ') : 'none';
        octx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        octx.filter = 'none';
        this._tintedSpriteCache.set(fullKey, c);
        return c;
      }

      octx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      if (opts) {
        if (opts.fallbackTint) {
          octx.globalCompositeOperation = 'source-atop';
          octx.fillStyle = opts.fallbackTint;
          octx.fillRect(0, 0, sw, sh);
          octx.globalCompositeOperation = 'source-over';
        }
      }
      this._tintedSpriteCache.set(fullKey, c);
      return c;
    }

    getOrLoadUiImg(key, path) {
      this._uiImgCache = this._uiImgCache || {};
      if (!this._uiImgCache[key]) {
        const img = new Image();
        img.src = path;
        this._uiImgCache[key] = img;
      }
      const img = this._uiImgCache[key];
      return (img && img.complete && img.naturalWidth > 0) ? img : null;
    }

    renderHoverHitbox(ctx, hovered) {
      if (!hovered) return;
      const cx = hovered.boxX !== undefined ? hovered.boxX : hovered.x;
      const cy = hovered.boxY !== undefined ? hovered.boxY : hovered.y;
      if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;
      const halfW = hovered.hitW ? hovered.hitW * 0.5 : (hovered.hitR || 22);
      const halfH = hovered.hitH ? hovered.hitH * 0.5 : (hovered.hitR || 22);
      const x0 = Math.round(cx - halfW);
      const y0 = Math.round(cy - halfH);
      const w = Math.round(halfW * 2);
      const h = Math.round(halfH * 2);
      const b = Math.min(10, Math.max(6, Math.round(Math.min(w, h) * 0.22)));
      const isEnemy = hovered.kind === 'enemy';
      const inReach = !!hovered.inReach;
      ctx.save();
      ctx.lineCap = 'square';
      // Sombra oscura
      ctx.strokeStyle = 'rgba(10, 12, 20, 0.72)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + b); ctx.lineTo(x0, y0); ctx.lineTo(x0 + b, y0);
      ctx.moveTo(x0 + w - b, y0); ctx.lineTo(x0 + w, y0); ctx.lineTo(x0 + w, y0 + b);
      ctx.moveTo(x0, y0 + h - b); ctx.lineTo(x0, y0 + h); ctx.lineTo(x0 + b, y0 + h);
      ctx.moveTo(x0 + w - b, y0 + h); ctx.lineTo(x0 + w, y0 + h); ctx.lineTo(x0 + w, y0 + h - b);
      ctx.stroke();
      // Color según tipo
      ctx.strokeStyle = isEnemy
        ? (inReach ? 'rgba(255, 82, 82, 0.98)' : 'rgba(255, 138, 101, 0.95)')
        : 'rgba(255, 245, 196, 0.96)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // === RENDERING ===
    render() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.imageSmoothingEnabled = false;

      if (!this.started) {
        this.renderTitleBackdrop(ctx, w, h);
        return;
      }

      ctx.save();
      const sx = this.camera.shakeTime > 0 ? rand(-this.camera.shakeAmp, this.camera.shakeAmp) : 0;
      const sy = this.camera.shakeTime > 0 ? rand(-this.camera.shakeAmp, this.camera.shakeAmp) : 0;
      ctx.translate(w / 2 + sx, h / 2 + sy);
      ctx.scale(this.camera.zoom, this.camera.zoom);
      ctx.translate(-this.camera.x, -this.camera.y);

      try {
        if (this.activeDungeon) {
          this.renderDungeon(ctx);
        } else {
          this.renderWorld(ctx, w, h);
        }
      } finally {
        ctx.restore();
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (!this.activeDungeon) {
        this.renderDayNightLighting(ctx, w, h);
      }
      if (this.levelFlashTimer > 0) {
        const alpha = Math.min(0.45, this.levelFlashTimer * 0.78);
        ctx.save();
        const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.18, w / 2, h / 2, Math.max(w, h) * 0.78);
        g.addColorStop(0, `rgba(255, 248, 179, ${(alpha * 0.32).toFixed(3)})`);
        g.addColorStop(1, `rgba(255, 213, 79, ${alpha.toFixed(3)})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
      this.renderFishingHud(ctx, w, h);

      if (this.player && this.player.deadTimer > 0) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const tNow = performance.now() * 0.001;
        const maxD = this.player.deadMax || 10.0;
        const elapsed = Math.max(0, maxD - this.player.deadTimer);

        // Stepped retro crimson impact flash on opening hit frames
        if (elapsed < 0.22) {
          const hitStep = Math.floor(elapsed * 16) & 1;
          ctx.fillStyle = hitStep === 0 ? 'rgba(136, 18, 30, 0.36)' : 'rgba(24, 6, 14, 0.30)';
          ctx.fillRect(0, 0, w, h);
        } else {
          // Stepped 16-bit pixel border bands + 4-stage Bayer 2x2 checkerboard wipe (~2.35s slow fade-out)
          const bw = Math.max(24, Math.round(w * 0.08));
          const bh = Math.max(18, Math.round(h * 0.08));
          ctx.fillStyle = 'rgba(12, 5, 11, 0.56)';
          ctx.fillRect(0, 0, w, bh);
          ctx.fillRect(0, h - bh, w, bh);
          ctx.fillRect(0, bh, bw, h - bh * 2);
          ctx.fillRect(w - bw, bh, bw, h - bh * 2);

          const stage = elapsed < 0.78 ? 1 : (elapsed < 1.32 ? 2 : (elapsed < 1.85 ? 3 : 4));
          const cell = 6;
          const bayerOrder = [0, 2, 3, 1]; // 2x2 Bayer thresholds
          const stageAlphas = [0.42, 0.62, 0.80, 0.94];
          ctx.fillStyle = `rgba(9, 4, 12, ${stageAlphas[stage - 1]})`;
          for (let cy = 0; cy < h; cy += cell) {
            const by = Math.floor(cy / cell) & 1;
            for (let cx = 0; cx < w; cx += cell) {
              const bx = Math.floor(cx / cell) & 1;
              if (bayerOrder[by * 2 + bx] < stage) {
                ctx.fillRect(cx, cy, cell, cell);
              }
            }
          }
        }

        // Crisp quantized integer-pixel embers & pale soul motes
        const tick = Math.floor(tNow * 12);
        for (let ei = 0; ei < 20; ei++) {
          const ex = Math.round(((ei * 137 + Math.sin(tick * 0.2 + ei) * 26) % w + w) % w);
          const ey = Math.round(h - ((tick * (2 + (ei % 4)) + ei * 67) % h));
          const sz = (ei & 1) ? 3 : 2;
          ctx.fillStyle = ei % 4 === 0 ? '#b2ebf2' : (ei % 3 === 0 ? '#ffb74d' : '#ef5350');
          ctx.fillRect(ex, ey, sz, sz);
        }
        ctx.restore();
      }
      this.renderIntroCinematic(ctx);
    }

    _getLightStamp(kind = 'erase') {
      if (!this._lightStamps) this._lightStamps = {};
      if (this._lightStamps[kind]) return this._lightStamps[kind];
      const size = 128;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const sctx = c.getContext('2d');
      const r = size / 2;
      const g = sctx.createRadialGradient(r, r, r * 0.08, r, r, r);
      if (kind === 'warm') {
        g.addColorStop(0, 'rgba(255, 200, 98, 0.42)');
        g.addColorStop(0.45, 'rgba(255, 148, 56, 0.16)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (kind === 'arcane') {
        g.addColorStop(0, 'rgba(130, 198, 255, 0.36)');
        g.addColorStop(0.48, 'rgba(85, 140, 255, 0.12)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (kind === 'firefly') {
        g.addColorStop(0, 'rgba(235, 255, 135, 0.56)');
        g.addColorStop(0.45, 'rgba(180, 255, 90, 0.22)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (kind === 'emerald') {
        g.addColorStop(0, 'rgba(110, 255, 175, 0.34)');
        g.addColorStop(0.5, 'rgba(60, 210, 130, 0.10)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        g.addColorStop(0, 'rgba(0, 0, 0, 1)');
        g.addColorStop(0.55, 'rgba(0, 0, 0, 0.65)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, size, size);
      this._lightStamps[kind] = c;
      return c;
    }

    renderDayNightLighting(ctx, vw, vh) {
      const info = this.getDayPhase ? this.getDayPhase() : { phase: 'dia', darkness: 0, warm: 0, tint: [9, 13, 34], warmRgb: [255, 178, 108] };
      const darkness = Math.max(0, Math.min(0.92, info.darkness || 0));

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if ((info.warm || 0) > 0.003 && Array.isArray(info.warmRgb)) {
        const [wr, wg, wb] = info.warmRgb;
        ctx.fillStyle = `rgba(${wr}, ${wg}, ${wb}, ${info.warm.toFixed(3)})`;
        ctx.fillRect(0, 0, vw, vh);
      }

      if (darkness <= 0.012) {
        ctx.restore();
        return;
      }

      if (!this._lightCanvas) this._lightCanvas = document.createElement('canvas');
      if (this._lightCanvas.width !== vw || this._lightCanvas.height !== vh || !this._lightCtx) {
        this._lightCanvas.width = vw;
        this._lightCanvas.height = vh;
        this._lightCtx = this._lightCanvas.getContext('2d');
      }
      const lctx = this._lightCtx || this._lightCanvas.getContext('2d');
      const [tr, tg, tb] = info.tint || [9, 13, 34];
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.globalAlpha = 1;
      lctx.globalCompositeOperation = 'source-over';
      lctx.clearRect(0, 0, vw, vh);
      lctx.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${darkness.toFixed(3)})`;
      lctx.fillRect(0, 0, vw, vh);

      const zoom = this.camera.zoom || 1;
      const toScreenX = (wx) => (wx - this.camera.x) * zoom + vw / 2;
      const toScreenY = (wy) => (wy - this.camera.y) * zoom + vh / 2;
      const eraseStamp = this._getLightStamp('erase');

      const punchLight = (wx, wy, worldRadius, innerAlpha = 1) => {
        if (innerAlpha <= 0.005) return;
        const sx = toScreenX(wx);
        const sy = toScreenY(wy);
        const sr = worldRadius * zoom;
        if (!Number.isFinite(sx) || !Number.isFinite(sy) || !Number.isFinite(sr) || sr <= 1) return;
        if (sx + sr < 0 || sx - sr > vw || sy + sr < 0 || sy - sr > vh) return;
        lctx.globalAlpha = Math.max(0, Math.min(1, innerAlpha));
        lctx.drawImage(eraseStamp, sx - sr, sy - sr, sr * 2, sr * 2);
      };

      lctx.globalCompositeOperation = 'destination-out';
      const pRadius = (155 + (this.mods.lightRadius || 0)) * (1 + (this.mods.nightVision || 0));
      const gentleBreath = Math.sin(this.time * 1.9) * 2.2 + Math.cos(this.time * 3.1) * 1.1;
      punchLight(this.player.x, this.player.y - 6, pRadius, 0.96);

      if (this.hasPermanentRelic('linterna_flotante')) {
        const lx = this.player.x - this.player.facing * 24;
        const ly = this.player.y - 38 + Math.sin(this.time * 2.6) * 4;
        punchLight(lx, ly, pRadius * 0.85 + gentleBreath, 0.98);
      }
      for (const b of this.buildings) {
        const def = Balaclava.BUILDINGS[b.type];
        if (!def) continue;
        const r = def.lightRadius || (
          b.type === 'horno' || b.type === 'forja' || b.type === 'fundicion' || b.type === 'alquimia' || b.type === 'fogata' || b.type === 'antorcha' || b.type === 'farol' || b.type === 'yunque_runico' ? 148
          : b.type === 'torre_magica' || b.type === 'portal' || b.type === 'altar' || b.type === 'centro_investigacion' || b.type === 'mesa_encantamiento' || b.type === 'mesa_hechiceria' || b.type === 'observatorio_astral' || b.type === 'torre_rayos' ? 168
          : b.type === 'torreta' ? 132 : 0
        );
        if (r > 0) {
          const bw = (def.size || 1) * TILE_SIZE;
          const seed = (b.tx * 7 + b.ty * 13) * 0.37;
          const bBreath = Math.sin(this.time * 2.1 + seed) * 2.0;
          punchLight(b.tx * TILE_SIZE + bw / 2, b.ty * TILE_SIZE + bw / 2, r + bBreath, 0.96);
        }
      }

      for (const n of this.world.nodes) {
        if (n.kind === 'crystal_node' || n.kind === 'diamond_vein' || n.kind === 'emerald_vein' || n.kind === 'ice_crystal') {
          punchLight(n.x, n.y, 92, 0.72);
        } else if (n.kind === 'mushroom_node' || n.kind === 'volcanic_rock' || n.kind === 'meteor') {
          punchLight(n.x, n.y, 85, 0.75);
        } else if (n.kind === 'dungeon_gate' || n.kind === 'altar' || n.kind === 'obelisk') {
          punchLight(n.x, n.y, 134, 0.85);
        }
      }

      // Active magic projectiles, bombs and laser beams pierce night darkness
      if (this.projectiles) {
        for (const pr of this.projectiles) {
          if (!pr.isArrow || pr.glow) punchLight(pr.x, pr.y, pr.lightRadius || 68, 0.82);
        }
      }
      if (this.enemyProjectiles) {
        for (const pr of this.enemyProjectiles) {
          punchLight(pr.x, pr.y, 58, 0.72);
        }
      }
      if (this.thrownBombs) {
        for (const b of this.thrownBombs) {
          punchLight(b.x, b.y - (b.z || 0), 72, 0.82);
        }
      }
      if (this.laserBeams) {
        for (const beam of this.laserBeams) {
          const midX = (beam.x1 + beam.x2) * 0.5;
          const midY = (beam.y1 + beam.y2) * 0.5;
          punchLight(beam.x1, beam.y1, 95, 0.85);
          punchLight(midX, midY, 105, 0.78);
          punchLight(beam.x2, beam.y2, 115, 0.9);
        }
      }

      // Gentle localized glow pools for night fireflies (continuous fade, zero threshold pop)
      if (!this.activeDungeon && this.ambientParticles && (!this.settings || this.settings.particles !== false)) {
        for (const ap of this.ambientParticles) {
          if (!ap.active || ap.kind !== 'firefly') continue;
          const pulse = 0.48 + 0.52 * (0.5 + 0.5 * Math.sin(this.time * (ap.pulseSpeed || 2.6) + (ap.phase || 0)));
          const age = (ap.maxLife || 10) - ap.life;
          const ageFade = Math.min(1, Math.max(0, age * 1.4), Math.max(0, ap.life * 0.85));
          if (ageFade <= 0.005) continue;
          punchLight(ap.x, ap.y, (ap.glowRadius || 20) * 1.5, 0.44 * pulse * ageFade);
        }
      }

      lctx.globalAlpha = 1;
      lctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(this._lightCanvas, 0, 0);

      // Warm/arcane additive halos rendered cleanly from cached stamps
      ctx.globalCompositeOperation = 'lighter';
      const warmStamp = this._getLightStamp('warm');
      const arcaneStamp = this._getLightStamp('arcane');
      const emeraldStamp = this._getLightStamp('emerald');
      const fireflyStamp = this._getLightStamp('firefly');
      const drawHalo = (stamp, wx, wy, worldR, alpha = 1) => {
        if (alpha <= 0.005) return;
        const sx = toScreenX(wx);
        const sy = toScreenY(wy);
        const sr = worldR * zoom;
        if (!Number.isFinite(sx) || !Number.isFinite(sy) || sr <= 1) return;
        if (sx + sr < 0 || sx - sr > vw || sy + sr < 0 || sy - sr > vh) return;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.drawImage(stamp, sx - sr, sy - sr, sr * 2, sr * 2);
      };

      if ((this.mods.lightRadius || 0) > 0) {
        const lx = this.player.x - this.player.facing * 24;
        const ly = this.player.y - 38 + Math.sin(this.time * 2.6) * 4;
        const useLantern = this.hasPermanentRelic('linterna_flotante');
        drawHalo(warmStamp, useLantern ? lx : this.player.x, useLantern ? ly : this.player.y - 12,
          110 + (this.mods.lightRadius || 0) * 0.4 + gentleBreath * 0.4, 0.65);
      }
      for (const b of this.buildings) {
        const def = Balaclava.BUILDINGS[b.type];
        if (!def) continue;
        const warmR = def.lightRadius || (
          b.type === 'horno' || b.type === 'forja' || b.type === 'fundicion' || b.type === 'fogata' || b.type === 'antorcha' || b.type === 'farol' ? 118
          : b.type === 'torre_magica' || b.type === 'portal' || b.type === 'mesa_encantamiento' ? 128
          : b.type === 'altar' ? 118 : 0
        );
        if (warmR <= 0) continue;
        const bw = (def.size || 1) * TILE_SIZE;
        const stamp = (b.type === 'torre_magica' || b.type === 'portal' || b.type === 'mesa_encantamiento') ? arcaneStamp : warmStamp;
        drawHalo(stamp, b.tx * TILE_SIZE + bw / 2, b.ty * TILE_SIZE + bw / 2, warmR * 0.68 + gentleBreath * 0.4, 0.6);
      }
      if (this.projectiles) {
        for (const pr of this.projectiles) {
          if (!pr.isArrow || pr.glow) {
            drawHalo(pr.color && String(pr.color).includes('69') ? emeraldStamp : arcaneStamp, pr.x, pr.y, pr.lightRadius || 52, 0.65);
          }
        }
      }
      if (this.laserBeams) {
        for (const beam of this.laserBeams) {
          drawHalo(arcaneStamp, beam.x1, beam.y1, 72, 0.7);
          drawHalo(arcaneStamp, beam.x2, beam.y2, 86, 0.85);
        }
      }

      if (!this.activeDungeon && this.ambientParticles && (!this.settings || this.settings.particles !== false)) {
        for (const ap of this.ambientParticles) {
          if (!ap.active || ap.kind !== 'firefly') continue;
          const age = (ap.maxLife || 10) - ap.life;
          const ageFade = Math.min(1, Math.max(0, age * 1.4), Math.max(0, ap.life * 0.85));
          const pulse = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(this.time * (ap.pulseSpeed || 2.6) + (ap.phase || 0)));
          const alpha = ageFade * pulse;
          if (alpha <= 0.005) continue;
          drawHalo(fireflyStamp, ap.x, ap.y, (ap.glowRadius || 20) * (0.8 + 0.25 * pulse), alpha);
        }
        ctx.globalCompositeOperation = 'source-over';
        for (const ap of this.ambientParticles) {
          if (!ap.active || ap.kind !== 'firefly') continue;
          const sx = toScreenX(ap.x);
          const sy = toScreenY(ap.y);
          if (sx < -8 || sx > vw + 8 || sy < -8 || sy > vh + 8) continue;
          const age = (ap.maxLife || 10) - ap.life;
          const ageFade = Math.min(1, Math.max(0, age * 1.4), Math.max(0, ap.life * 0.85));
          const pulse = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(this.time * (ap.pulseSpeed || 2.6) + (ap.phase || 0)));
          const a = Math.min(1, 0.94 * ageFade * (0.45 + 0.55 * pulse));
          if (a <= 0.005) continue;
          const s = Math.max(2, Math.round((ap.size || 3) * zoom));
          ctx.globalAlpha = a;
          ctx.fillStyle = ap.color || '#e6ff66';
          ctx.fillRect(Math.round(sx - s / 2), Math.round(sy - s / 2), s, s);
          if (pulse > 0.65 && s >= 3) {
            ctx.fillStyle = '#ffffe0';
            ctx.fillRect(Math.round(sx - 1), Math.round(sy - 1), 2, 2);
          }
        }
      }
      ctx.restore();
    }

    getWaterSpeedMultiplier() {
      const spd = (this.settings && this.settings.waterSpeed) || 'normal';
      return { lenta: 0.45, normal: 1.0, rapida: 1.9, tormenta: 3.1 }[spd] || 1.0;
    }

    renderOceanWaves(ctx, ox, oy, w, h, t, wSpd, style) {
      ctx.save();
      // Subtle twinkling surface glints (no noisy dark stripes or wavy lines across sea)
      ctx.fillStyle = style === 'abisal' ? 'rgba(215, 232, 255, 0.34)' : 'rgba(255, 255, 255, 0.36)';
      const gx0 = Math.floor(ox / 96);
      const gx1 = Math.ceil((ox + w) / 96);
      const gy0 = Math.floor(oy / 96);
      const gy1 = Math.ceil((oy + h) / 96);
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          const seed = Math.abs(Math.sin(gx * 12.9898 + gy * 78.233)) * 43758.5453;
          const frac = seed - Math.floor(seed);
          if (frac > 0.42) continue;
          const drift = Math.sin(t * 2.0 * wSpd + frac * 18) * 10;
          const sx = gx * 96 + frac * 68 + drift;
          const sy = gy * 96 + ((frac * 31) % 1) * 70 + Math.cos(t * 1.6 * wSpd + frac * 11) * 2;
          const glintW = frac > 0.25 ? 10 : 6;
          ctx.fillRect(Math.round(sx), Math.round(sy), glintW, 2);
        }
      }
      ctx.restore();
    }

    getWaterSprite() {
      const style = (this.settings && this.settings.waterStyle) || 'clasico';
      const ex = (Balaclava.Assets && Balaclava.Assets.extraImages) || {};
      const keyMap = {
        clasico: 'water_clasico',
        profundo: 'water_profundo',
        esmeralda: 'water_esmeralda',
        abisal: 'water_abisal'
      };
      const bgMap = {
        clasico: '#34bae0',
        profundo: '#2c92da',
        esmeralda: '#30c0b6',
        abisal: '#366cc6'
      };
      const img = ex[keyMap[style] || 'water_clasico'] || ex.water_anim || null;
      const frames = img && img.naturalWidth >= 16 ? Math.max(1, Math.floor(img.naturalWidth / 16)) : 5;
      return { img, frames, style, bg: bgMap[style] || '#34bae0' };
    }

    generateTitleArchipelago(w = 1280, h = 720, seed = Math.floor(Math.random() * 1000000)) {
      let s = (seed % 2147483647) || 12345;
      if (s <= 0) s += 2147483646;
      const rng = () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };

      const ts = 48;
      const menuGuard = Math.min(w * 0.42, 520);
      const zoneLeft = w >= 920 ? menuGuard : Math.round(w * 0.40);
      const zoneRight = w - 24;
      const zoneW = Math.max(380, zoneRight - zoneLeft);
      const zoneCx = Math.round((zoneLeft + zoneRight) * 0.5);
      const zoneCy = Math.round(h * 0.49);

      // Create organic, non-square island tile mask with natural jagged bays, peninsulas and chamfers
      const makeOrganicMask = (cols, rows, cornerCutChance = 0.85, coveChance = 0.75) => {
        const mask = Array.from({ length: rows }, () => Array(cols).fill(1));
        // Cut out 1 to 3 irregular corners for natural round / archipelago shape
        if (rng() < cornerCutChance) mask[0][0] = 0;
        if (rng() < cornerCutChance) mask[0][cols - 1] = 0;
        if (rng() < cornerCutChance * 0.85) mask[rows - 1][0] = 0;
        if (rng() < cornerCutChance * 0.85) mask[rows - 1][cols - 1] = 0;

        // Cut an organic coastal notch / inlet on an edge
        if (rng() < coveChance && cols >= 5) {
          const edge = Math.floor(rng() * 4);
          if (edge === 0 && rows > 2) mask[0][1 + Math.floor(rng() * (cols - 2))] = 0;
          else if (edge === 1 && rows > 2) mask[rows - 1][1 + Math.floor(rng() * (cols - 2))] = 0;
          else if (edge === 2 && cols > 2) mask[1 + Math.floor(rng() * (rows - 2))][0] = 0;
          else if (edge === 3 && cols > 2) mask[1 + Math.floor(rng() * (rows - 2))][cols - 1] = 0;
        }

        // Clean up: remove any isolated 1x1 orphan cell
        for (let ry = 0; ry < rows; ry++) {
          for (let cx = 0; cx < cols; cx++) {
            if (!mask[ry][cx]) continue;
            const neighbors = (ry > 0 ? mask[ry - 1][cx] : 0) +
              (ry + 1 < rows ? mask[ry + 1][cx] : 0) +
              (cx > 0 ? mask[ry][cx - 1] : 0) +
              (cx + 1 < cols ? mask[ry][cx + 1] : 0);
            if (neighbors === 0) mask[ry][cx] = 0;
          }
        }
        return mask;
      };

      const topGap = Math.max(92, Math.round(zoneW * 0.16));
      const botGap = Math.max(86, Math.round(zoneW * 0.14));

      // 1. Top-Left Islet (Bosque Oscuro / Tundra)
      const tlCols = 5 + (rng() > 0.5 ? 1 : 0);
      const tlRows = 3 + (rng() > 0.6 ? 1 : 0);
      const tlx = Math.max(Math.round(zoneLeft + 6), Math.round(zoneCx - topGap * 0.5 - tlCols * ts + (rng() - 0.5) * 26));
      const tly = Math.max(38, Math.round(zoneCy - tlRows * ts - Math.max(54, h * 0.08) + (rng() - 0.5) * 20));
      const tlMask = makeOrganicMask(tlCols, tlRows, 0.9, 0.7);

      // 2. Top-Right Islet (Desierto / Oasis / Autumn Gold)
      const trCols = 5 + (rng() > 0.5 ? 1 : 0);
      const trRows = 3 + (rng() > 0.6 ? 1 : 0);
      const trx = Math.min(w - trCols * ts - 16, Math.round(zoneCx + topGap * 0.5 + (rng() - 0.5) * 26));
      const tryY = Math.max(42, Math.round(zoneCy - trRows * ts - Math.max(50, h * 0.075) + (rng() - 0.5) * 20));
      const trMask = makeOrganicMask(trCols, trRows, 0.9, 0.7);

      // 3. Bottom-Left Island (Lush Prairie Campsite & Ancient Oak)
      const blCols = 6 + (rng() > 0.5 ? 1 : 0);
      const blRows = 4 + (rng() > 0.5 ? 1 : 0);
      const blx = Math.max(Math.round(zoneLeft + 4), Math.round(zoneCx - botGap * 0.5 - blCols * ts + (rng() - 0.5) * 24));
      const bly = Math.min(h - blRows * ts - 28, Math.round(zoneCy + Math.max(46, h * 0.068) + (rng() - 0.5) * 18));
      const blMask = makeOrganicMask(blCols, blRows, 0.85, 0.65);

      // 4. Bottom-Right Island (Prairie / Crystal & Mineral Atoll)
      // Placed comfortably above the signature so the ocean remains wide and clear
      const brCols = 5 + (rng() > 0.6 ? 1 : 0);
      const brRows = 3;
      const sigX = Math.round(w - 210);
      const sigY = Math.round(h - 75);
      const brx = Math.min(w - brCols * ts - 24, Math.round(zoneCx + botGap * 0.5 + (rng() - 0.5) * 16));
      const maxBry = Math.min(h - brRows * ts - 140, Math.round(zoneCy + Math.max(28, h * 0.04) + (rng() - 0.5) * 12));
      const bry = Math.max(Math.round(zoneCy + 10), maxBry);
      const brMask = makeOrganicMask(brCols, brRows, 0.9, 0.6);

      const islands = [
        { ox: Math.round(tlx), oy: Math.round(tly), cols: tlCols, rows: tlRows, mask: tlMask, biome: 'bosque_oscuro', cliffTop: '#4a3f5c', cliffMid: '#2c203b', id: 'tl' },
        { ox: Math.round(trx), oy: Math.round(tryY), cols: trCols, rows: trRows, mask: trMask, biome: 'desierto', cliffTop: '#8d6e3f', cliffMid: '#6d4c23', id: 'tr' },
        { ox: Math.round(blx), oy: Math.round(bly), cols: blCols, rows: blRows, mask: blMask, biome: 'pradera', cliffTop: '#5d4037', cliffMid: '#3e2723', id: 'bl' },
        { ox: Math.round(brx), oy: Math.round(bry), cols: brCols, rows: brRows, mask: brMask, biome: 'pradera', cliffTop: '#5d4037', cliffMid: '#3e2723', id: 'br' }
      ];

      // Strict guarantee: no island land tile or cliff foam can ever encroach within 80px of the signature
      for (const isl of islands) {
        for (let ry = 0; ry < isl.rows; ry++) {
          for (let cx = 0; cx < isl.cols; cx++) {
            const px = isl.ox + cx * ts;
            const py = isl.oy + ry * ts;
            if (px + ts >= sigX - 70 && py + ts * 1.5 >= sigY - 70) {
              isl.mask[ry][cx] = 0;
            }
          }
        }
      }

      this._titleArchipelago = {
        seed,
        w,
        h,
        islands
      };
      return this._titleArchipelago;
    }

    renderTitleBackdrop(ctx, w, h) {
      const ok = (img) => Boolean(img && (
        (img.tagName === 'CANVAS' && img.width > 0) ||
        (img.complete && img.naturalWidth > 0)
      ));
      const t = performance.now() * 0.001;
      const wSpd = this.getWaterSpeedMultiplier();

      // Rich living archipelago diorama in ocean backdrop
      const wInfo = this.getWaterSprite();
      const extraWater = wInfo.img;
      ctx.fillStyle = wInfo.bg;
      ctx.fillRect(0, 0, w, h);
      const wFrame = Math.floor(t * 4.0 * wSpd) % wInfo.frames;
      if (ok(extraWater)) {
        const wTile = 48;
        for (let py = 0; py < h; py += wTile) {
          for (let px = 0; px < w; px += wTile) {
            ctx.drawImage(extraWater, wFrame * 16, 0, 16, 16, px, py, wTile, wTile);
          }
        }
      }
      this.renderOceanWaves(ctx, 0, 0, w, h, t, wSpd, wInfo.style);

      // Procedural archipelago generation with organic shapes
      const arch = (this._titleArchipelago && this._titleArchipelago.w === w && this._titleArchipelago.h === h)
        ? this._titleArchipelago
        : this.generateTitleArchipelago(w, h);

      const menuGuard = Math.min(w * 0.42, 520);
      const zoneLeft = w >= 920 ? menuGuard : Math.round(w * 0.40);
      const zoneRight = w - 24;
      const zoneCx = Math.round((zoneLeft + zoneRight) * 0.5);
      const zoneCy = Math.round(h * 0.49);

      const assets = Balaclava.Assets || {};
      const extra = assets.extraImages || {};
      const foamImg = assets.get ? assets.get('water_foam') : null;
      const foamFr = Math.floor(t * 6.5 * wSpd) % 16;
      const ts = 48;

      // Organic island renderer with 9-slice autotiling and 3D coastal cliffs
      const drawOrganicTitleIsland = (isl) => {
        const { ox, oy, cols, rows, mask, biome, cliffTop, cliffMid } = isl;
        const bSheet = assets.biomeTiles && assets.biomeTiles[biome];
        ctx.save();

        // 1. Cliff skirts along all southern land boundaries
        for (let ry = 0; ry < rows; ry++) {
          for (let cx = 0; cx < cols; cx++) {
            if (!mask[ry] || !mask[ry][cx]) continue;
            const hasS = ry + 1 < rows && mask[ry + 1] && mask[ry + 1][cx] === 1;
            if (!hasS) {
              const px = Math.round(ox + cx * ts);
              const py = Math.round(oy + ry * ts);
              ctx.fillStyle = 'rgba(8, 22, 36, 0.36)';
              ctx.fillRect(px + 3, py + ts + 10, ts - 4, 8);
              ctx.fillStyle = cliffMid;
              ctx.fillRect(px, py + ts - 2, ts, 14);
              ctx.fillStyle = cliffTop;
              ctx.fillRect(px, py + ts - 2, ts, 7);
              if (ok(foamImg)) {
                ctx.drawImage(foamImg, foamFr * 192 + 56, 72, 80, 64, px - 4, py + 10, ts + 8, ts + 4);
              }
            }
          }
        }

        // 2. Surface tiles with 9-slice autotiling based on adjacent neighbors
        for (let ry = 0; ry < rows; ry++) {
          for (let cx = 0; cx < cols; cx++) {
            if (!mask[ry] || !mask[ry][cx]) continue;
            const hasN = ry > 0 && mask[ry - 1] && mask[ry - 1][cx] === 1;
            const hasS = ry + 1 < rows && mask[ry + 1] && mask[ry + 1][cx] === 1;
            const hasW = cx > 0 && mask[ry][cx - 1] === 1;
            const hasE = cx + 1 < cols && mask[ry][cx + 1] === 1;

            const sx = !hasW ? 0 : (!hasE ? 128 : 64);
            const sy = !hasN ? 0 : (!hasS ? 128 : 64);

            const px = Math.round(ox + cx * ts);
            const py = Math.round(oy + ry * ts);
            if (ok(bSheet)) {
              ctx.drawImage(bSheet, sx, sy, 64, 64, px, py, ts, ts);
            } else {
              ctx.fillStyle = biome === 'desierto' ? '#d4b46a' : (biome === 'bosque_oscuro' ? '#3d4432' : '#5f9e3e');
              ctx.fillRect(px, py, ts, ts);
            }
          }
        }
        ctx.restore();
      };

      const drawAnimTree = (key, x, y, scale, seed) => {
        const tImg = assets.get ? assets.get(key) : null;
        if (!ok(tImg)) return;
        if (tImg.width >= 384) {
          const fr = Math.floor((t * 3.5 + seed) % 8);
          const dw = Math.round(96 * scale);
          const dh = Math.round(108 * scale * (tImg.height / 192));
          const dy = Math.round(y + 20 * scale - dh);
          ctx.drawImage(tImg, fr * 192, 0, 192, tImg.height, Math.round(x - dw / 2), dy, dw, dh);
        } else {
          const sway = Math.sin(t * 1.5 + seed) * 1.4;
          const dw = Math.round(64 * scale);
          const dh = Math.round(dw * (tImg.height / Math.max(1, tImg.width)));
          ctx.drawImage(tImg, Math.round(x - dw / 2 + sway), Math.round(y - dh + 10), dw, dh);
        }
      };

      // Helper to safely resolve a solid land tile coordinate on an organic island
      const landPt = (isl, prefCx, prefRy) => {
        const { ox, oy, cols, rows, mask } = isl;
        const clampCx = Math.max(0, Math.min(cols - 1, prefCx));
        const clampRy = Math.max(0, Math.min(rows - 1, prefRy));
        if (mask[clampRy] && mask[clampRy][clampCx]) {
          return { x: ox + clampCx * ts + ts / 2, y: oy + clampRy * ts + ts / 2, cx: clampCx, ry: clampRy };
        }
        // Find closest valid land cell
        let best = null, bestDist = 999;
        for (let ry = 0; ry < rows; ry++) {
          for (let cx = 0; cx < cols; cx++) {
            if (!mask[ry] || !mask[ry][cx]) continue;
            const d = Math.hypot(cx - prefCx, ry - prefRy);
            if (d < bestDist) {
              bestDist = d;
              best = { x: ox + cx * ts + ts / 2, y: oy + ry * ts + ts / 2, cx, ry };
            }
          }
        }
        return best || { x: ox + ts, y: oy + ts, cx: 0, ry: 0 };
      };

      const [islTL, islTR, islBL, islBR] = arch.islands;
      drawOrganicTitleIsland(islTL);
      drawOrganicTitleIsland(islTR);
      drawOrganicTitleIsland(islBL);
      drawOrganicTitleIsland(islBR);

      // Props on Organic Bottom-Left Island
      const oakPt = landPt(islBL, 1, 1);
      drawAnimTree('tree1', oakPt.x, oakPt.y, 1.05, 1);
      const sprucePt = landPt(islBL, islBL.cols - 2, 1);
      drawAnimTree('tree2', sprucePt.x, sprucePt.y, 0.92, 3.2);

      const firePt = landPt(islBL, Math.floor(islBL.cols * 0.5), islBL.rows - 2);
      if (ok(extra.campfireAnim)) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 165, 64, ${0.22 + Math.sin(t * 7) * 0.05})`;
        ctx.beginPath(); ctx.arc(firePt.x, firePt.y + 4, 32 + Math.sin(t * 9) * 3, 0, Math.PI * 2); ctx.fill();
        const cfFrames = Math.max(1, Math.floor(extra.campfireAnim.width / 16));
        const cff = Math.floor(t * 8) % cfFrames;
        ctx.drawImage(extra.campfireAnim, cff * 16, 0, 16, extra.campfireAnim.height, firePt.x - 20, firePt.y - 20, 40, 40);
        ctx.restore();
      }
      const goldPt = landPt(islBL, Math.floor(islBL.cols * 0.65), 2);
      if (ok(extra.node_gold)) ctx.drawImage(extra.node_gold, goldPt.x - 18, goldPt.y - 18, 38, 38);

      const sheepPt = landPt(islBL, 1, islBL.rows - 2);
      const sheepIdle = assets.get ? assets.get('sheep_idle') : null;
      if (ok(sheepIdle)) {
        const sfr = Math.floor(t * 4.5) % 4;
        ctx.drawImage(sheepIdle, sfr * 128, 0, 128, 128, sheepPt.x - 30, sheepPt.y - 32, 68, 68);
      }
      const fernPt = landPt(islBL, 0, islBL.rows - 1);
      if (ok(extra.deco_fern_1)) ctx.drawImage(extra.deco_fern_1, fernPt.x - 14, fernPt.y - 14, 28, 28);
      const flowPt = landPt(islBL, islBL.cols - 1, islBL.rows - 1);
      if (ok(extra.nat_flower)) ctx.drawImage(extra.nat_flower, flowPt.x - 12, flowPt.y - 12, 24, 24);

      // Props on Organic Bottom-Right Island (Prairie / Mineral Atoll)
      const amethystPt = landPt(islBR, 1, 1);
      if (ok(extra.node_amethyst)) ctx.drawImage(extra.node_amethyst, amethystPt.x - 20, amethystPt.y - 20, 40, 40);

      const jadePt = landPt(islBR, 3, 2);
      if (ok(extra.node_jade)) ctx.drawImage(extra.node_jade, jadePt.x - 18, jadePt.y - 18, 38, 38);

      const crystalPt = landPt(islBR, 2, 1);
      if (ok(extra.ee_crystal)) {
        const cfr = Math.floor(t * 5) % 5;
        ctx.save();
        ctx.fillStyle = 'rgba(110, 220, 255, 0.22)';
        ctx.beginPath(); ctx.arc(crystalPt.x, crystalPt.y, 30, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage(extra.ee_crystal, cfr * 32, 0, 32, 32, crystalPt.x - 22, crystalPt.y - 26, 44, 44);
        ctx.restore();
      }
      const brTreePt = landPt(islBR, islBR.cols - 2, 1);
      drawAnimTree('tree3', brTreePt.x, brTreePt.y, 1.05, 5.1);

      const lanternPt = landPt(islBR, Math.floor(islBR.cols * 0.6), 1);
      if (ok(extra.ee_lantern)) ctx.drawImage(extra.ee_lantern, lanternPt.x - 18, lanternPt.y - 20, 36, 40);
      const brBushPt = landPt(islBR, 0, islBR.rows - 2);
      if (ok(extra.deco_bush_1)) ctx.drawImage(extra.deco_bush_1, brBushPt.x - 16, brBushPt.y - 16, 32, 32);

      // Props on Organic Top-Left Island (Bosque Oscuro)
      const tlTreePt = landPt(islTL, 1, 1);
      drawAnimTree('tree4', tlTreePt.x, tlTreePt.y, 0.96, 2.4);
      const shroomPt = landPt(islTL, 3, 1);
      if (ok(extra.mushroom_blue_anim)) {
        ctx.drawImage(extra.mushroom_blue_anim, 0, 0, 32, Math.min(32, extra.mushroom_blue_anim.height), shroomPt.x - 16, shroomPt.y - 16, 34, 34);
      }
      const tlFernPt = landPt(islTL, 0, islTL.rows - 1);
      if (ok(extra.deco_fern_1)) ctx.drawImage(extra.deco_fern_1, tlFernPt.x - 12, tlFernPt.y - 12, 26, 26);

      // Props on Organic Top-Right Island (Desierto / Autumn)
      const copperPt = landPt(islTR, 1, 1);
      if (ok(extra.node_copper)) ctx.drawImage(extra.node_copper, copperPt.x - 18, copperPt.y - 18, 38, 38);
      const cactusPt = landPt(islTR, 3, 1);
      if (ok(extra.cactus_icon)) ctx.drawImage(extra.cactus_icon, cactusPt.x - 18, cactusPt.y - 22, 38, 42);
      const trFlowerPt = landPt(islTR, 2, 2);
      if (ok(extra.nat_flower)) ctx.drawImage(extra.nat_flower, trFlowerPt.x - 11, trFlowerPt.y - 11, 22, 22);

      // Floating Rubber Ducks in open water channels
      const duckImg = extra.rubber_duck;
      if (ok(duckImg)) {
        const dw = duckImg.width >= 64 ? Math.floor(duckImg.width / 3) : duckImg.width;
        const dh = duckImg.height || 32;
        const fr = duckImg.width >= 64 ? (Math.floor(t * 4) % 3) : 0;
        const duck1X = Math.round((islTL.ox + islTR.ox) * 0.5 - 24 + Math.sin(t * 0.42) * 14);
        const duck1Y = Math.round((islTL.oy + islBL.oy) * 0.5 + Math.cos(t * 1.6) * 4);
        const duck2X = Math.min(w - 75, islBR.ox + islBR.cols * ts - 18 + Math.cos(t * 0.35) * 12);
        const duck2Y = Math.min(h - 120, islBR.oy + islBR.rows * ts + 8 + Math.sin(t * 1.4) * 3);
        ctx.save();
        ctx.globalAlpha = 0.94;
        ctx.drawImage(duckImg, fr * dw, 0, dw, dh, duck1X, duck1Y, 32, 32);
        ctx.drawImage(duckImg, fr * dw, 0, dw, dh, duck2X, duck2Y, 34, 34);
        ctx.restore();
      }

      // Animated Butterflies fluttering across the islands
      const bKeys = ['butterfly_orange', 'butterfly_blue', 'butterfly_gold', 'butterfly_violet'];
      for (let i = 0; i < bKeys.length; i++) {
        const bImg = extra[bKeys[i]];
        if (!ok(bImg)) continue;
        const targetIsland = i % 2 === 0 ? islBL : islBR;
        const bx = targetIsland.ox + 120 + Math.sin(t * (0.9 + i * 0.17) + i * 2.1) * 65;
        const by = targetIsland.oy + 30 + Math.cos(t * (1.25 + i * 0.2) + i) * 28;
        const flap = 0.45 + 0.55 * Math.abs(Math.sin(t * 13 + i * 1.7));
        ctx.save();
        ctx.translate(Math.round(bx), Math.round(by));
        ctx.scale(Math.cos(t * (0.9 + i * 0.17) + i * 2.1) < 0 ? -flap : flap, 1);
        ctx.drawImage(bImg, -10, -10, 20, 20);
        ctx.restore();
      }

      // Soft drifting pixel-style clouds & warm left-column readability contrast
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
      for (let c = 0; c < 4; c++) {
        const cx = ((t * (11 + c * 3) + c * w * 0.29) % (w + 220)) - 110;
        const cy = 42 + c * 38;
        ctx.fillRect(Math.round(cx), cy, 88, 18);
        ctx.fillRect(Math.round(cx + 16), cy - 10, 52, 12);
      }
      ctx.restore();

      const centerGlow = ctx.createRadialGradient(zoneCx, zoneCy, 40, zoneCx, zoneCy, Math.max(w, h) * 0.65);
      centerGlow.addColorStop(0, 'rgba(6, 16, 28, 0.02)');
      centerGlow.addColorStop(0.55, 'rgba(8, 22, 38, 0.08)');
      centerGlow.addColorStop(1, 'rgba(5, 14, 24, 0.34)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, w, h);

      // Living ocean signature in clear water (bobs gently with waves, never covered by islands)
      const sigX = Math.round(w - 210);
      const sigY = Math.round(h - 75);
      const sigBob = Math.sin(t * 1.8) * 3;
      ctx.save();
      ctx.translate(sigX, sigY + sigBob);
      ctx.rotate(-0.14); // ~ -8deg natural handwriting tilt

      // Subtle water ripple ring underneath
      const ripT = (t * 0.75) % 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${(0.22 * (1 - ripT)).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(55, 12, 54 + ripT * 22, 6 + ripT * 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = 'italic 20px BalaclavaSignature, BalaclavaPixel, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const sigText = 'love you saraí <3';

      // Deep dark stroke for crisp pixel legibility against water
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#180306';
      ctx.strokeText(sigText, 55, 0);

      // Vibrant red core
      ctx.fillStyle = '#ff334b';
      ctx.fillText(sigText, 55, 0);

      // Soft glow
      ctx.shadowColor = 'rgba(255, 51, 75, 0.55)';
      ctx.shadowBlur = 8;
      ctx.fillText(sigText, 55, 0);
      ctx.restore();
    }

    renderWorld(ctx, vw, vh) {
      const halfW = (vw / 2) / this.camera.zoom + 96;
      const halfH = (vh / 2) / this.camera.zoom + 96;
      const minTx = clamp(Math.floor((this.camera.x - halfW) / TILE_SIZE), 0, WORLD_TILES - 1);
      const maxTx = clamp(Math.floor((this.camera.x + halfW) / TILE_SIZE), 0, WORLD_TILES - 1);
      const minTy = clamp(Math.floor((this.camera.y - halfH) / TILE_SIZE), 0, WORLD_TILES - 1);
      const maxTy = clamp(Math.floor((this.camera.y + halfH) / TILE_SIZE), 0, WORLD_TILES - 1);

      // Animated ocean backdrop + layered visual waves across visible viewport
      const wInfo = this.getWaterSprite();
      const wSpd = this.getWaterSpeedMultiplier();
      const extraWater = wInfo.img;
      const waterReady = Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(extraWater) : !!extraWater;
      ctx.fillStyle = wInfo.bg;
      ctx.fillRect(this.camera.x - halfW, this.camera.y - halfH, halfW * 2, halfH * 2);

      const animWater = !this.settings || this.settings.waterAnim !== false;
      if (waterReady) {
        const wFrame = animWater ? (Math.floor(this.time * 4.2 * wSpd) % wInfo.frames) : 0;
        for (let ty = minTy; ty <= maxTy; ty++) {
          for (let tx = minTx; tx <= maxTx; tx++) {
            const px = tx * TILE_SIZE;
            const py = ty * TILE_SIZE;
            ctx.drawImage(extraWater, wFrame * 16, 0, 16, 16, px, py, TILE_SIZE, TILE_SIZE);
          }
        }
      }
      if (animWater) {
        this.renderOceanWaves(
          ctx,
          minTx * TILE_SIZE,
          minTy * TILE_SIZE,
          (maxTx - minTx + 1) * TILE_SIZE,
          (maxTy - minTy + 1) * TILE_SIZE,
          this.time,
          wSpd,
          wInfo.style
        );
      }

      // Draw unlocked plot tiles with isometric / terraced cliff elevation skirts & staircases
      const foamImg = Balaclava.Assets.get('water_foam');
      const foamFrame = animWater ? (Math.floor(this.time * 7 * wSpd) % 16) : 0;
      const bridgeImg = Balaclava.Assets.get('bridge');
      const cliffPal = {
        pradera:            { top: '#5d4037', mid: '#4e342e', shadow: 'rgba(10,30,45,0.34)' },
        desierto:           { top: '#8d6e3f', mid: '#6d4c23', shadow: 'rgba(10,30,45,0.34)' },
        bosque_oscuro:      { top: '#4a3f5c', mid: '#2f243d', shadow: 'rgba(8,12,24,0.38)' },
        montanas_heladas:   { top: '#607d8b', mid: '#37474f', shadow: 'rgba(10,25,40,0.40)' },
        tierras_volcanicas: { top: '#5c261f', mid: '#33120e', shadow: 'rgba(8,6,12,0.45)' }
      };

      const activePlotAnims = new Map();
      if (this.plotUnlockAnims && this.plotUnlockAnims.length > 0) {
        for (const a of this.plotUnlockAnims) {
          const u = Math.min(1, Math.max(0, a.t / (a.dur || 0.48)));
          const back = 1 + 1.45 * Math.pow(u - 1, 3) + 0.45 * Math.pow(u - 1, 2);
          activePlotAnims.set(`${a.gx},${a.gy}`, {
            gx: a.gx,
            gy: a.gy,
            u,
            scale: Math.max(0.28, 0.36 + 0.64 * back),
            dy: (1 - u) * 32,
            alpha: Math.min(1, u * 2.2)
          });
        }
      }

      const getBiomePattern = (bId) => {
        if (!this._biomeInnerPatterns) this._biomeInnerPatterns = {};
        if (this._biomeInnerPatterns[bId] !== undefined) return this._biomeInnerPatterns[bId];
        const sheet = Balaclava.Assets && Balaclava.Assets.biomeTiles && Balaclava.Assets.biomeTiles[bId];
        if (!sheet || !sheet.width) return null;
        const pc = document.createElement('canvas');
        pc.width = 32;
        pc.height = 32;
        const pctx = pc.getContext('2d');
        pctx.imageSmoothingEnabled = false;
        // Extract clean interior 32x32 core from center cell (64..128, 64..128) without edge seams
        pctx.drawImage(sheet, 80, 80, 32, 32, 0, 0, 32, 32);
        const pat = ctx.createPattern(pc, 'repeat');
        this._biomeInnerPatterns[bId] = pat;
        return pat;
      };

      const BIOME_LAYER_PRIO = {
        tierras_volcanicas: 1,
        bosque_oscuro: 2,
        montanas_heladas: 3,
        desierto: 4,
        pradera: 5
      };

      const drawLavaTile = (tx, ty, px, py) => {
        const isLava = (lx, ly) => lx >= 0 && ly >= 0 && lx < WORLD_TILES && ly < WORLD_TILES &&
          this.world.tiles[ly] && this.world.tiles[ly][lx] === 4;
        const lN = isLava(tx, ty - 1);
        const lS = isLava(tx, ty + 1);
        const lW = isLava(tx - 1, ty);
        const lE = isLava(tx + 1, ty);

        // Surround volcanic basalt ground pad so crater sits visibly sunken below surrounding terrain
        const vSheet = Balaclava.Assets.biomeTiles.tierras_volcanicas;
        if (vSheet) {
          ctx.drawImage(vSheet, 64, 64, 64, 64, px, py, TILE_SIZE, TILE_SIZE);
        } else {
          ctx.fillStyle = BIOMES.tierras_volcanicas.color;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }

        const topLip = lN ? 0 : 12;
        const botLip = lS ? 0 : 6;
        const leftLip = lW ? 0 : 7;
        const rightLip = lE ? 0 : 7;
        const ix = px + leftLip;
        const iy = py + topLip;
        const iw = TILE_SIZE - leftLip - rightLip;
        const ih = TILE_SIZE - topLip - botLip;

        // Build organic scalloped + corner-beveled crater silhouette path instead of a rigid rectangle
        const seed = ((tx * 73856093) ^ (ty * 19349663)) >>> 0;
        const rTL = (!lN && !lW) ? 9 : 0;
        const rTR = (!lN && !lE) ? 9 : 0;
        const rBR = (!lS && !lE) ? 8 : 0;
        const rBL = (!lS && !lW) ? 8 : 0;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ix + rTL, iy);
        ctx.lineTo(ix + iw - rTR, iy);
        if (rTR > 0) ctx.lineTo(ix + iw, iy + rTR);
        ctx.lineTo(ix + iw, iy + ih - rBR);
        if (rBR > 0) ctx.lineTo(ix + iw - rBR, iy + ih);
        ctx.lineTo(ix + rBL, iy + ih);
        if (rBL > 0) ctx.lineTo(ix, iy + ih - rBL);
        ctx.lineTo(ix, iy + rTL);
        if (rTL > 0) ctx.lineTo(ix + rTL, iy);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = '#731204';
        ctx.fillRect(ix, iy, iw, ih);

        // Flowing pixel magma convection currents & glowing yellow veins
        const tFlow = this.time * 1.15;
        const pulse = 0.5 + 0.5 * Math.sin(this.time * 2.4 + tx * 0.9 + ty * 0.7);
        const cell = 5;
        for (let cy = 0; cy < TILE_SIZE; cy += cell) {
          const wy = py + cy;
          if (wy + cell <= iy || wy >= iy + ih) continue;
          for (let cx = 0; cx < TILE_SIZE; cx += cell) {
            const wx = px + cx;
            if (wx + cell <= ix || wx >= ix + iw) continue;
            const u = (tx * 9 + cx / cell);
            const v = (ty * 9 + cy / cell);
            const w1 = Math.sin(u * 0.56 + tFlow + Math.cos(v * 0.44 - tFlow * 0.6));
            const w2 = Math.cos(v * 0.60 - tFlow * 0.8 + Math.sin((u + v) * 0.36));
            const heat = (w1 + w2) * 0.5 + pulse * 0.14;
            if (heat > 0.46) ctx.fillStyle = '#fff59d';
            else if (heat > 0.22) ctx.fillStyle = '#ffb300';
            else if (heat > -0.10) ctx.fillStyle = '#f4511e';
            else if (heat > -0.44) ctx.fillStyle = '#b71c1c';
            else ctx.fillStyle = '#3b150e';
            ctx.fillRect(wx, wy, cell, cell);
            if (heat < -0.44) {
              ctx.fillStyle = '#5c2618';
              ctx.fillRect(wx, wy, cell, 2);
            }
          }
        }

        // Deep sunken wall cast shadow along cliff interior so molten pool sits visibly below ground level
        if (!lN) {
          ctx.fillStyle = 'rgba(16, 4, 2, 0.54)';
          ctx.fillRect(ix, iy, iw, 5);
        }
        if (!lW) {
          ctx.fillStyle = 'rgba(16, 4, 2, 0.40)';
          ctx.fillRect(ix, iy, 4, ih);
        }
        if (!lE) {
          ctx.fillStyle = 'rgba(24, 6, 3, 0.30)';
          ctx.fillRect(ix + iw - 3, iy, 3, ih);
        }
        if (!lS) {
          ctx.fillStyle = 'rgba(255, 145, 45, 0.28)';
          ctx.fillRect(ix, iy + ih - 3, iw, 3);
        }

        // Rising sparks
        const emSeed = ((tx * 73 + ty * 139) % 11);
        for (let k = 0; k < 2; k++) {
          const ph = (this.time * (0.55 + k * 0.22) + (emSeed + k * 3) * 0.19) % 1;
          const ex = ix + 4 + (((tx * 17 + k * 23 + Math.floor(this.time * 0.4)) % Math.max(8, iw - 10)));
          const ey = iy + ih - 4 - ph * Math.max(8, ih - 8);
          ctx.fillStyle = ph < 0.45 ? '#fff59d' : '#ffab40';
          ctx.globalAlpha = 1 - ph * 0.65;
          ctx.fillRect(Math.round(ex), Math.round(ey), 2, 2);
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        // Sculpted undulating basalt rock wall ledges (organic rim, no straight square outer border)
        if (!lN) {
          const xStart = lW ? 0 : 9;
          const xEnd = lE ? TILE_SIZE : TILE_SIZE - 9;
          for (let ox = xStart; ox < xEnd; ox += 8) {
            const wSeg = Math.min(8, xEnd - ox);
            const idx = ox >> 3;
            const outY = 1 + ((seed >> (idx % 6)) & 3); // 1..4px outer jagged basalt silhouette
            const overhang = 3 + ((seed >> ((idx + 2) % 6)) & 3); // 3..6px inward wall drop
            ctx.fillStyle = '#472d28';
            ctx.fillRect(px + ox, py + outY, wSeg, 2);
            ctx.fillStyle = '#331c1b';
            ctx.fillRect(px + ox, py + outY + 2, wSeg, 4);
            ctx.fillStyle = '#211013';
            ctx.fillRect(px + ox, py + outY + 6, wSeg, 3 + overhang);
            ctx.fillStyle = '#12080a';
            ctx.fillRect(px + ox + 1, py + outY + 8 + overhang, Math.max(2, wSeg - 2), 2);
            if (((seed + ox) & 7) < 4) {
              ctx.fillStyle = 'rgba(255, 114, 52, 0.36)';
              ctx.fillRect(px + ox + 1, py + outY + 6 + overhang, Math.max(2, wSeg - 2), 2);
            }
          }
        }
        if (!lW) {
          const yStart = lN ? 0 : 9;
          const yEnd = lS ? TILE_SIZE : TILE_SIZE - 8;
          for (let oy = yStart; oy < yEnd; oy += 8) {
            const hSeg = Math.min(8, yEnd - oy);
            const idx = oy >> 3;
            const outX = 1 + ((seed >> ((idx + 1) % 6)) & 2);
            const jw = 2 + ((seed >> ((idx + 4) % 7)) & 3);
            ctx.fillStyle = '#422925';
            ctx.fillRect(px + outX, py + oy, 2, hSeg);
            ctx.fillStyle = '#2e1a19';
            ctx.fillRect(px + outX + 2, py + oy, 3, hSeg);
            ctx.fillStyle = '#1c0e11';
            ctx.fillRect(px + outX + 5, py + oy, jw, hSeg);
          }
        }
        if (!lE) {
          const yStart = lN ? 0 : 9;
          const yEnd = lS ? TILE_SIZE : TILE_SIZE - 8;
          for (let oy = yStart; oy < yEnd; oy += 8) {
            const hSeg = Math.min(8, yEnd - oy);
            const idx = oy >> 3;
            const outX = 1 + ((seed >> ((idx + 3) % 6)) & 2);
            const jw = 2 + ((seed >> ((idx + 5) % 7)) & 3);
            ctx.fillStyle = '#422925';
            ctx.fillRect(px + TILE_SIZE - outX - 2, py + oy, 2, hSeg);
            ctx.fillStyle = '#2e1a19';
            ctx.fillRect(px + TILE_SIZE - outX - 5, py + oy, 3, hSeg);
            ctx.fillStyle = '#1c0e11';
            ctx.fillRect(px + TILE_SIZE - outX - 5 - jw, py + oy, jw, hSeg);
          }
        }
        if (!lS) {
          const xStart = lW ? 0 : 9;
          const xEnd = lE ? TILE_SIZE : TILE_SIZE - 9;
          for (let ox = xStart; ox < xEnd; ox += 8) {
            const wSeg = Math.min(8, xEnd - ox);
            const idx = ox >> 3;
            const outBot = 1 + ((seed >> ((idx + 2) % 6)) & 2);
            const jh = 2 + ((seed >> ((idx + 5) % 7)) & 3);
            ctx.fillStyle = '#2e1a1b';
            ctx.fillRect(px + ox, py + TILE_SIZE - outBot - 3, wSeg, 3);
            ctx.fillStyle = '#4e332d';
            ctx.fillRect(px + ox, py + TILE_SIZE - outBot - 5, wSeg, 2);
            ctx.fillStyle = '#3d2522';
            ctx.fillRect(px + ox + 1, py + TILE_SIZE - outBot - 5 - jh, Math.max(2, wSeg - 2), jh + 1);
          }
        }
        // Rounded basalt corner boulders smoothing outer crater corners
        const drawCornerRock = (cx, cy, dw, dh) => {
          ctx.fillStyle = '#38211f';
          ctx.fillRect(cx, cy, dw, dh);
          ctx.fillStyle = '#1f1012';
          ctx.fillRect(cx + 2, cy + 2, Math.max(2, dw - 4), Math.max(2, dh - 4));
        };
        if (!lN && !lW) drawCornerRock(px + 5, py + 9, 6, 6);
        if (!lN && !lE) drawCornerRock(px + TILE_SIZE - 11, py + 9, 6, 6);
        if (!lS && !lW) drawCornerRock(px + 5, py + TILE_SIZE - 9, 6, 5);
        if (!lS && !lE) drawCornerRock(px + TILE_SIZE - 11, py + TILE_SIZE - 9, 6, 5);

        // Inner diagonal basalt corner pillars when lava wraps an L-bend
        if (lN && lW && !isLava(tx - 1, ty - 1)) drawCornerRock(px, py, 8, 12);
        if (lN && lE && !isLava(tx + 1, ty - 1)) drawCornerRock(px + TILE_SIZE - 8, py, 8, 12);
      };

      const drawBiomeTransitionEdge = (tx, ty, px, py, biome) => {
        const isLandTile = (nx, ny) => nx >= 0 && ny >= 0 && nx < WORLD_TILES && ny < WORLD_TILES &&
          this.world.isTileUnlocked(nx, ny) && (this.world.tiles[ny][nx] === 1 || this.world.tiles[ny][nx] === 2);
        const getVB = (nx, ny) => this.world.getVisualBiomeAtTile
          ? this.world.getVisualBiomeAtTile(nx, ny)
          : this.world.plotBiomes[Math.floor(ny / PLOT_TILES)][Math.floor(nx / PLOT_TILES)];

        const nUp = isLandTile(tx, ty - 1) ? getVB(tx, ty - 1) : biome;
        const nDn = isLandTile(tx, ty + 1) ? getVB(tx, ty + 1) : biome;
        const nLt = isLandTile(tx - 1, ty) ? getVB(tx - 1, ty) : biome;
        const nRt = isLandTile(tx + 1, ty) ? getVB(tx + 1, ty) : biome;
        if (nUp === biome && nDn === biome && nLt === biome && nRt === biome) return;

        const myPrio = BIOME_LAYER_PRIO[biome] || 1;
        const stampSeamlessOverlap = (nBiome, side) => {
          // One-way precedence prevents double-sided fighting box outlines across seams
          const theirPrio = BIOME_LAYER_PRIO[nBiome] || 1;
          if (theirPrio <= myPrio) return;
          const pat = getBiomePattern(nBiome);
          const bColor = BIOMES[nBiome]?.color || '#63ab3f';
          const bAccent = BIOMES[nBiome]?.accent || bColor;
          const seed = ((tx * 73856093) ^ (ty * 19349663) ^ (side.charCodeAt(0) * 83492791)) >>> 0;

          ctx.save();
          ctx.fillStyle = pat || bColor;
          // Stepped crisp pixel-art turf/sand/snow lobes creeping gently across neighbor seam
          for (let i = 0; i < 6; i++) {
            const h = (seed >> (i * 4)) & 15;
            const reach = 6 + (h % 5) * 3;
            const span = 8;
            const pos = i * 8;
            ctx.globalAlpha = 0.92;
            const snap = (v) => Math.round(v / 3) * 3;
            const r1 = snap(reach);
            const r2 = Math.max(3, r1 - 3);
            if (side === 'L') {
              ctx.fillRect(px, py + pos, r2, span);
              ctx.fillRect(px + r2, py + pos + 2, r1 - r2, Math.max(4, span - 4));
            } else if (side === 'R') {
              ctx.fillRect(px + TILE_SIZE - r2, py + pos, r2, span);
              ctx.fillRect(px + TILE_SIZE - r1, py + pos + 2, r1 - r2, Math.max(4, span - 4));
            } else if (side === 'T') {
              ctx.fillRect(px + pos, py, span, r2);
              ctx.fillRect(px + pos + 2, py + r2, Math.max(4, span - 4), r1 - r2);
            } else {
              ctx.fillRect(px + pos, py + TILE_SIZE - r2, span, r2);
              ctx.fillRect(px + pos + 2, py + TILE_SIZE - r1, Math.max(4, span - 4), r1 - r2);
            }

            // Scattered 3x3 pixel-art transition specks past lobe tip
            if (h > 4) {
              ctx.globalAlpha = 0.70;
              const d = r1 + 3 + (h % 3) * 3;
              if (side === 'L') ctx.fillRect(px + d, py + pos + 3, 3, 3);
              else if (side === 'R') ctx.fillRect(px + TILE_SIZE - d - 3, py + pos + 3, 3, 3);
              else if (side === 'T') ctx.fillRect(px + pos + 3, py + d, 3, 3);
              else ctx.fillRect(px + pos + 3, py + TILE_SIZE - d - 3, 3, 3);
            }
            if ((h & 3) === 3) {
              ctx.globalAlpha = 0.50;
              ctx.fillStyle = bAccent;
              const d2 = r1 + 6;
              if (side === 'L') ctx.fillRect(px + d2, py + pos + 4, 2, 2);
              else if (side === 'R') ctx.fillRect(px + TILE_SIZE - d2 - 2, py + pos + 4, 2, 2);
              else if (side === 'T') ctx.fillRect(px + pos + 4, py + d2, 2, 2);
              else ctx.fillRect(px + pos + 4, py + TILE_SIZE - d2 - 2, 2, 2);
              ctx.fillStyle = pat || bColor;
            }
          }
          ctx.restore();
        };

        if (nLt !== biome) stampSeamlessOverlap(nLt, 'L');
        if (nRt !== biome) stampSeamlessOverlap(nRt, 'R');
        if (nUp !== biome) stampSeamlessOverlap(nUp, 'T');
        if (nDn !== biome) stampSeamlessOverlap(nDn, 'B');
      };

      const drawLandTile = (tx, ty) => {
        const gx = Math.floor(tx / PLOT_TILES);
        const gy = Math.floor(ty / PLOT_TILES);
        const tile = this.world.tiles[ty][tx];
        const px = tx * TILE_SIZE;
        const py = ty * TILE_SIZE;
        const biome = (this.world.getVisualBiomeAtTile
          ? this.world.getVisualBiomeAtTile(tx, ty)
          : this.world.plotBiomes[gy][gx]);
        const elev = (this.world.plotElevation && this.world.plotElevation[gy] && this.world.plotElevation[gy][gx]) || 0;

        if (tile === 0) return;

        if (tile === 3) {
          if (bridgeImg) {
            ctx.drawImage(bridgeImg, 64, 0, 64, 64, px, py, TILE_SIZE, TILE_SIZE);
          } else {
            ctx.fillStyle = '#a47148';
            ctx.fillRect(px, py + 4, TILE_SIZE, TILE_SIZE - 8);
          }
          return;
        }

        if (tile === 4) {
          drawLavaTile(tx, ty, px, py);
          return;
        }

        const belowUnlocked = this.world.isTileUnlocked(tx, ty + 1);
        const belowTile = belowUnlocked && this.world.tiles[ty + 1] ? this.world.tiles[ty + 1][tx] : 0;

        if (belowTile === 0) {
          const skirtH = 10 + elev * 3;
          const cPal = cliffPal[biome] || cliffPal.pradera;
          ctx.fillStyle = cPal.shadow;
          ctx.fillRect(px + 2, py + TILE_SIZE + skirtH - 2, TILE_SIZE - 2, 7);
          ctx.fillStyle = cPal.mid;
          ctx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, skirtH);
          ctx.fillStyle = cPal.top;
          ctx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, Math.max(4, Math.floor(skirtH * 0.5)));
        }

        if (foamImg && this.world.tiles[ty + 1] && this.world.tiles[ty + 1][tx] === 0) {
          ctx.drawImage(foamImg, foamFrame * 192 + 56, 72, 80, 64, px - 4, py + 8 + elev * 2, TILE_SIZE + 8, TILE_SIZE + 4);
        }

        const bSheet = Balaclava.Assets.biomeTiles[biome];
        const up = this.isSameLand(tx, ty - 1, gx, gy);
        const dn = this.isSameLand(tx, ty + 1, gx, gy);
        const lt = this.isSameLand(tx - 1, ty, gx, gy);
        const rt = this.isSameLand(tx + 1, ty, gx, gy);
        const sx = !lt ? 0 : !rt ? 128 : 64;
        const sy = !up ? 0 : !dn ? 128 : 64;

        if (bSheet) {
          if (!lt && !rt) {
            // Both left and right open: render left edge and right edge composited
            ctx.drawImage(bSheet, 0, sy, 32, 64, px, py, TILE_SIZE / 2, TILE_SIZE);
            ctx.drawImage(bSheet, 160, sy, 32, 64, px + TILE_SIZE / 2, py, TILE_SIZE / 2, TILE_SIZE);
          } else if (!up && !dn) {
            // Both top and bottom open: render top edge and bottom edge composited
            ctx.drawImage(bSheet, sx, 0, 64, 32, px, py, TILE_SIZE, TILE_SIZE / 2);
            ctx.drawImage(bSheet, sx, 160, 64, 32, px, py + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE / 2);
          } else {
            ctx.drawImage(bSheet, sx, sy, 64, 64, px, py, TILE_SIZE, TILE_SIZE);
          }
        } else {
          ctx.fillStyle = BIOMES[biome].color;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }

        drawBiomeTransitionEdge(tx, ty, px, py, biome);

        if (elev > 0 && !up) {
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fillRect(px + 2, py + 1, TILE_SIZE - 4, 3);
        }

        if (tile === 2) {
          const cropHere = this.world.crops.find(c => c.tx === tx && c.ty === ty);
          const preFert = this.world.fertilizedTiles && this.world.fertilizedTiles[`${tx},${ty}`];
          const moist = Boolean((cropHere && cropHere.watered) || preFert);
          const extraImgs = Balaclava.Assets.extraImages || {};
          const soilImg = moist ? (extraImgs.tilled_soil_wet || extraImgs.tilled_soil) : extraImgs.tilled_soil;
          if (soilImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(soilImg))) {
            ctx.drawImage(soilImg, px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          } else {
            ctx.fillStyle = moist ? '#3e2723' : '#6d4c41';
            ctx.fillRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);
            ctx.strokeStyle = moist ? '#261410' : '#4e342e';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 3.5, py + 3.5, TILE_SIZE - 7, TILE_SIZE - 7);
            ctx.fillStyle = moist ? '#2b1915' : '#4e342e';
            for (let row = 8; row < TILE_SIZE - 7; row += 9) {
              ctx.fillRect(px + 7, py + row, TILE_SIZE - 14, 3);
            }
          }
          const fertId = (cropHere && cropHere.fertilized) || (preFert && preFert.id);
          if (fertId) {
            ctx.fillStyle = fertId === 'compost_magico' ? 'rgba(206,147,216,0.55)' : fertId === 'abono_dorado' ? 'rgba(255,213,79,0.55)' : 'rgba(174,213,129,0.55)';
            ctx.fillRect(px + 6, py + 6, 4, 4);
            ctx.fillRect(px + TILE_SIZE - 10, py + TILE_SIZE - 10, 4, 4);
          }
        }
      };

      for (let ty = minTy; ty <= maxTy; ty++) {
        for (let tx = minTx; tx <= maxTx; tx++) {
          const gx = Math.floor(tx / PLOT_TILES);
          const gy = Math.floor(ty / PLOT_TILES);
          if (!this.world.isPlotUnlocked(gx, gy) && !(this.world.isTileUnlocked && this.world.isTileUnlocked(tx, ty))) continue;
          if (activePlotAnims.has(`${gx},${gy}`)) continue;
          drawLandTile(tx, ty);
        }
      }

      if (activePlotAnims.size > 0) {
        for (const anim of activePlotAnims.values()) {
          if (!this.world.isPlotUnlocked(anim.gx, anim.gy)) continue;
          const x0 = anim.gx * PLOT_TILES;
          const y0 = anim.gy * PLOT_TILES;
          const pcx = (x0 + PLOT_TILES * 0.5) * TILE_SIZE;
          const pcy = (y0 + PLOT_TILES * 0.5) * TILE_SIZE;
          ctx.save();
          ctx.globalAlpha = anim.alpha;
          ctx.translate(pcx, pcy + anim.dy);
          ctx.scale(anim.scale, anim.scale);
          ctx.translate(-pcx, -pcy);
          for (let ty = y0; ty < y0 + PLOT_TILES; ty++) {
            for (let tx = x0; tx < x0 + PLOT_TILES; tx++) {
              drawLandTile(tx, ty);
            }
          }
          ctx.restore();
          ctx.save();
          const ringR = PLOT_TILES * TILE_SIZE * (0.35 + anim.u * 0.36);
          ctx.strokeStyle = `rgba(128, 222, 234, ${(1 - anim.u) * 0.72})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(pcx, pcy, ringR, ringR * 0.85, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Ambient deterministic biome vegetation across unlocked grass/land tiles
      this.renderFloraLayer(ctx, vw, vh);

      // Draw walkable floors (e.g., cobblestone roads) underneath entities & crops
      for (const b of this.buildings) {
        const def = Balaclava.BUILDINGS[b.type];
        if (!def || !def.walkableFloor) continue;
        const px = b.tx * TILE_SIZE;
        const py = b.ty * TILE_SIZE;
        const w = (def.size || 1) * TILE_SIZE;
        const floorImg = (Balaclava.Assets.extraImages && Balaclava.Assets.extraImages[def.sprite])
          || Balaclava.Assets.getBuildingImg(def.sprite);
        if (floorImg) ctx.drawImage(floorImg, px, py, w, w);
        else { ctx.fillStyle = '#78909c'; ctx.fillRect(px, py, w, w); }
      }

      // Draw Crops using Pixel_Gnome_Crops 4-stage artist pixel sprites & extended species!
      const extraImgs = Balaclava.Assets.extraImages || {};
      const okC = (img) => img && img.complete && img.naturalWidth > 0;
      for (const c of this.world.crops) {
        const def = Balaclava.CROPS[c.cropId];
        const px = c.tx * TILE_SIZE;
        const py = c.ty * TILE_SIZE;
        if (c.watered) {
          ctx.fillStyle = 'rgba(41, 182, 246, 0.24)';
          ctx.fillRect(px + 5, py + 5, TILE_SIZE - 10, TILE_SIZE - 10);
        }
        const sway = (!this.settings || this.settings.treeSway !== false)
          ? Math.sin(this.time * 3.2 + c.tx * 0.7 + c.ty) * (c.stage >= 2 ? 1.6 : 0.6)
          : 0;
        let cImg = extraImgs[`crop_${c.cropId}_s${c.stage}`] || null;
        if (!cImg) {
          if (c.stage === 0) cImg = extraImgs.crop_stage_0;
          else if (c.stage === 1) cImg = extraImgs.crop_stage_1;
          else if (c.stage === 2) cImg = extraImgs.crop_stage_2;
          else cImg = (def && extraImgs[def.sprite]) || extraImgs.crop_stage_2;
        }

        if (okC(cImg)) {
          const baseW = c.stage === 3 ? 34 : c.stage === 2 ? 28 : c.stage === 1 ? 24 : 20;
          const aspect = cImg.height / Math.max(1, cImg.width);
          const dh = Math.min(48, Math.round(baseW * aspect));
          const dx = px + (TILE_SIZE - baseW) / 2 + sway;
          const dy = py + TILE_SIZE - 7 - dh;
          ctx.fillStyle = 'rgba(20, 12, 6, 0.28)';
          ctx.beginPath(); ctx.ellipse(px + TILE_SIZE * 0.5, py + TILE_SIZE - 9, baseW * 0.34, 4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.drawImage(cImg, dx, dy, baseW, dh);
        } else {
          const h = 6 + c.stage * 7;
          ctx.fillStyle = '#388e3c';
          ctx.fillRect(px + 14, py + 36 - h, 6, h);
          ctx.fillRect(px + 28, py + 36 - h, 6, h);
        }
        if (c.stage >= 3) {
          const pulse = 0.45 + Math.sin(this.time * 5 + c.tx) * 0.35;
          ctx.strokeStyle = `rgba(255, 224, 130, ${pulse.toFixed(2)})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
        }
      }

      // Draw purchasable plot buy signs on adjacent locked plots
      this.renderLockedPlotSigns(ctx);

      // Overworld enemy hazard zones (goblin bombs, acid pools, miniboss pillars)
      if (this.combat && Array.isArray(this.combat.worldHazards) && this.combat.worldHazards.length > 0 && Balaclava.EnemyAttacks && Balaclava.EnemyAttacks.renderHazards) {
        Balaclava.EnemyAttacks.renderHazards(ctx, this.combat.worldHazards, this.time, '#ff7043');
      }

      // Collect Y-sorted drawable world objects
      const drawables = [];

      // Buildings (non-floor structures)
      for (const b of this.buildings) {
        const def = Balaclava.BUILDINGS[b.type];
        if (!def || def.walkableFloor) continue;
        const ySort = (b.ty + def.size) * TILE_SIZE;
        drawables.push({ y: ySort, fn: () => this.drawBuilding(ctx, b, def) });
      }

      // Resource nodes
      for (const n of this.world.nodes) {
        if (n.x < this.camera.x - halfW || n.x > this.camera.x + halfW || n.y < this.camera.y - halfH || n.y > this.camera.y + halfH) continue;
        drawables.push({ y: n.y + 12, fn: () => this.drawNode(ctx, n) });
      }

      // Sheep
      for (const s of this.world.sheep) {
        drawables.push({ y: s.y + 8, fn: () => this.drawSheep(ctx, s) });
      }

      // NPCs
      for (const npc of Balaclava.NPCS) {
        const [ngx, ngy] = this.world.getNpcPlot(npc);
        if (!this.world.isPlotUnlocked(ngx, ngy)) continue;
        const off = this.world.getNpcTileOffset(npc);
        const nx = (ngx * PLOT_TILES + off[0] + 0.5) * TILE_SIZE;
        const ny = (ngy * PLOT_TILES + off[1] + 0.5) * TILE_SIZE;
        drawables.push({ y: ny + 10, fn: () => this.drawNpc(ctx, npc, nx, ny) });
      }

      // Enemies
      for (const e of this.combat.enemies) {
        drawables.push({ y: e.y + 10, fn: () => this.drawEnemy(ctx, e) });
      }

      // Player
      drawables.push({ y: this.player.y + 10, fn: () => this.drawPlayer(ctx) });

      // Dropped loot
      for (const d of this.drops) {
        drawables.push({ y: d.y + 6, fn: () => this.drawDrop(ctx, d) });
      }

      drawables.sort((a, b) => a.y - b.y);
      for (const item of drawables) item.fn();

      // Multi-phase Fishing line, pixel bobber, ripples & swimming fish
      this.renderFishingWorld(ctx);
      this.renderFishCatchLeaps(ctx);

      this.renderOverlaysAndPreview(ctx);
    }

    renderFishingWorld(ctx) {
      if (!this.farming || !this.farming.fishing) return;
      const f = this.farming.fishing;
      const extraImgs = Balaclava.Assets.extraImages || {};

      const bx = f.phase === 'cast' ? f.bobX : f.wx;
      const by = f.phase === 'cast' ? f.bobY : f.wy;

      // Authentic pixel-art bobbing physics
      const bob = f.phase === 'bite'
        ? Math.round(3 + Math.sin(this.time * 26) * 3)
        : f.phase === 'reel'
          ? Math.round(2 + Math.sin(this.time * 18) * 2)
          : f.phase === 'wait'
            ? Math.round(Math.sin(this.time * 3.5) * 1.5)
            : 0;

      const px = Math.round(this.player.x + this.player.facing * 12);
      const py = Math.round(this.player.y - 12);
      const bobX = Math.round(bx);
      const bobY = Math.round(by + bob);

      // 1. Taut Pixel-Art Fishing Line
      const midX = (px + bobX) * 0.5;
      const sag = f.phase === 'bite'
        ? (3 + Math.sin(this.time * 32) * 1.2)
        : f.phase === 'reel'
          ? (2 + Math.sin(this.time * 36) * 1.6)
          : f.phase === 'wait'
            ? 12
            : 2;

      // Drop shadow for the line
      ctx.strokeStyle = 'rgba(10, 18, 28, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py + 1);
      ctx.quadraticCurveTo(midX, Math.min(py, bobY) - 16 + sag + 1, bobX, bobY + 1);
      ctx.stroke();

      // Bright line cord
      ctx.strokeStyle = f.phase === 'bite' || f.phase === 'reel' ? '#fff59d' : '#e0f7fa';
      ctx.lineWidth = f.phase === 'reel' ? 2 : 1.2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(midX, Math.min(py, bobY) - 16 + sag, bobX, bobY);
      ctx.stroke();

      // 2. Stepped Pixel-Art Concentric Water Ripples
      if (f.phase === 'wait' || f.phase === 'bite' || f.phase === 'reel') {
        const ringSteps = [0, 12];
        for (const offset of ringSteps) {
          const r = ((f.rippleT * 14 + offset) % 24);
          const alpha = (1 - r / 24) * (f.phase === 'bite' ? 0.95 : 0.65);
          if (r >= 2 && alpha > 0.05) {
            const rx = Math.round(r);
            const ry = Math.round(r * 0.55);
            ctx.fillStyle = `rgba(224, 247, 250, ${alpha.toFixed(2)})`;
            // Stepped pixel ring strokes (discrete integer rects)
            const hw = Math.max(1, Math.round(rx * 0.65));
            ctx.fillRect(bobX - hw, bobY - ry, hw * 2, 1);
            ctx.fillRect(bobX - hw, bobY + ry, hw * 2, 1);
            const vh = Math.max(1, Math.round(ry * 0.55));
            ctx.fillRect(bobX - rx, bobY - vh, 1, vh * 2);
            ctx.fillRect(bobX + rx, bobY - vh, 1, vh * 2);
            // Corner steps
            const cx1 = Math.round(rx * 0.78);
            const cy1 = Math.round(ry * 0.72);
            ctx.fillRect(bobX - cx1, bobY - cy1, 1, 1);
            ctx.fillRect(bobX + cx1, bobY - cy1, 1, 1);
            ctx.fillRect(bobX - cx1, bobY + cy1, 1, 1);
            ctx.fillRect(bobX + cx1, bobY + cy1, 1, 1);
          }
        }
      }

      // 3. Pixel-Art Fish Underwater (Natural Swimming & Tail Waggle)
      if (f.shadows && (f.phase === 'wait' || f.phase === 'bite' || f.phase === 'reel')) {
        for (const s of f.shadows) {
          const sx = Math.round(s.x);
          const sy = Math.round(s.y);
          const heading = s.ang + (s.speed > 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
          const wiggle = Math.sin(s.wiggle || 0) * (s.isTarget && (f.phase === 'bite' || f.phase === 'reel') ? 0.28 : 0.16);

          // Dark lakebed shadow
          ctx.fillStyle = 'rgba(8, 24, 44, 0.38)';
          ctx.fillRect(sx - 5, sy + 3, 10, 3);

          // Fish sprite
          const img = extraImgs['fish_' + s.id] || extraImgs.fish_pez_comun || extraImgs.fish_common;
          if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(heading + wiggle);
            if (Math.cos(heading) < 0) ctx.scale(1, -1);
            const depthAlpha = clamp(0.48 + (1 - (s.depth || 0.6)) * 0.48, 0.35, 0.96);
            ctx.globalAlpha = depthAlpha;
            const fsz = Math.round(16 * (s.size || 1));
            ctx.drawImage(img, -fsz / 2, -fsz / 2, fsz, fsz);
            // Subtle aquatic caustics shimmer
            ctx.fillStyle = 'rgba(64, 196, 255, 0.15)';
            ctx.fillRect(-fsz / 2, -fsz / 2, fsz, fsz);
            ctx.restore();
          } else {
            // Crisp pixel silhouette fallback
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(heading + wiggle);
            ctx.fillStyle = 'rgba(12, 36, 60, 0.7)';
            ctx.fillRect(-6, -2, 12, 4);
            ctx.fillRect(4, -3, 3, 6);
            ctx.restore();
          }
        }
      }

      // 4. Pixel-Art Bobber Float (No smooth vector arcs, 100% crisp pixel art)
      const cx = bobX;
      const cy = bobY;

      // Antenna quill & tip bead
      ctx.fillStyle = f.phase === 'bite' ? '#ffeb3b' : '#ff1744';
      ctx.fillRect(cx - 1, cy - 8, 2, 2);
      ctx.fillStyle = '#263238';
      ctx.fillRect(cx, cy - 6, 1, 3);

      // Upper float body (vibrant red with highlight)
      ctx.fillStyle = '#212121'; // outline
      ctx.fillRect(cx - 3, cy - 3, 6, 1);
      ctx.fillRect(cx - 4, cy - 2, 8, 2);
      ctx.fillStyle = '#d32f2f'; // deep red
      ctx.fillRect(cx - 2, cy - 3, 4, 1);
      ctx.fillRect(cx - 3, cy - 2, 6, 2);
      ctx.fillStyle = '#ff8a80'; // specular pixel
      ctx.fillRect(cx - 1, cy - 2, 2, 1);

      // Lower float body (white/cream with shadow)
      ctx.fillStyle = '#212121'; // outline
      ctx.fillRect(cx - 4, cy, 8, 2);
      ctx.fillRect(cx - 3, cy + 2, 6, 1);
      ctx.fillStyle = '#ffffff'; // white
      ctx.fillRect(cx - 3, cy, 6, 2);
      ctx.fillStyle = '#cfd8dc'; // shaded bottom
      ctx.fillRect(cx - 2, cy + 2, 4, 1);

      // Submerged spindle
      ctx.fillStyle = '#455a64';
      ctx.fillRect(cx, cy + 3, 1, 2);

      // Waterline foam rim
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(cx - 4, cy, 1, 1);
      ctx.fillRect(cx + 3, cy, 1, 1);

      // 5. Pixel-Art Alert Badge on Bite
      if (f.phase === 'bite') {
        const alertY = cy - 18 + Math.round(Math.sin(this.time * 14) * 2);
        // Dark outline box for '!'
        ctx.fillStyle = '#1b1118';
        ctx.fillRect(cx - 3, alertY - 6, 6, 12);
        ctx.fillRect(cx - 4, alertY - 5, 8, 10);
        // Golden exclamation badge
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(cx - 1, alertY - 4, 2, 5);
        ctx.fillRect(cx - 1, alertY + 2, 2, 2);
        ctx.fillStyle = '#fff9c4';
        ctx.fillRect(cx - 1, alertY - 4, 1, 4);
      }
    }

    renderFishCatchLeaps(ctx) {
      if (!this.fishCatchLeaps || this.fishCatchLeaps.length === 0) return;
      const extraImgs = Balaclava.Assets.extraImages || {};
      for (const leap of this.fishCatchLeaps) {
        const p = Math.min(1, leap.t / leap.duration);
        const arc = -Math.sin(p * Math.PI) * 54;
        const lx = Math.round(leap.startX + (leap.targetX - leap.startX) * p);
        const ly = Math.round(leap.startY + (leap.targetY - leap.startY) * p + arc);
        const groundY = Math.round(leap.startY + (leap.targetY - leap.startY) * p);

        // Ground shadow
        ctx.fillStyle = 'rgba(8, 24, 40, 0.45)';
        ctx.fillRect(lx - 6, groundY - 2, 12, 4);

        // Leaping Fish
        const img = extraImgs['fish_' + leap.fishId] || extraImgs.fish_pez_comun || extraImgs.fish_common;
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(p * Math.PI * 4); // 2 full spins
          ctx.drawImage(img, -10, -10, 20, 20);
          ctx.restore();
        }
      }
    }

    renderFishingHud(ctx, vw, vh) {
      const f = this.farming.fishing;
      if (!f || !this.started) return;

      const assets = Balaclava.Assets;
      const extraImgs = assets.extraImages || {};
      const okImg = (im) => im && im.complete && im.naturalWidth > 0;
      const tFishId = f.targetFish && f.targetFish.id;
      const fishItem = tFishId && Balaclava.ITEMS[tFishId];
      const fishSprite = (tFishId && okImg(extraImgs['fish_' + tFishId]) && extraImgs['fish_' + tFishId])
        || (okImg(extraImgs.fish_rare_shadow) && extraImgs.fish_rare_shadow)
        || (okImg(extraImgs.fish_shadow) && extraImgs.fish_shadow)
        || null;

      const boxW = Math.min(480, Math.max(320, vw - 32));
      const boxH = f.phase === 'reel' ? 106 : 62;
      const x = Math.round((vw - boxW) / 2);
      const y = vh - 176 - boxH;

      // Rich warm walnut & carved brass tackle-box HUD
      ctx.save();
      // Pixel-art wooden bezel frame with crisp 4px stepped pixels
      ctx.fillStyle = '#1b0f0a';
      ctx.fillRect(x - 4, y - 4, boxW + 8, boxH + 8);
      ctx.fillStyle = '#4e2c18';
      ctx.fillRect(x, y, boxW, boxH);
      ctx.fillStyle = '#2d180e';
      ctx.fillRect(x + 4, y + 4, boxW - 8, boxH - 8);
      ctx.fillStyle = f.phase === 'bite' ? '#ffd54f' : '#d49a4a';
      ctx.fillRect(x, y, boxW, 3);
      ctx.fillRect(x, y + boxH - 3, boxW, 3);
      ctx.fillRect(x, y, 3, boxH);
      ctx.fillRect(x + boxW - 3, y, 3, boxH);

      // Corner brass pixel rivets
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(x + 6, y + 6, 4, 4);
      ctx.fillRect(x + boxW - 10, y + 6, 4, 4);
      ctx.fillRect(x + 6, y + boxH - 10, 4, 4);
      ctx.fillRect(x + boxW - 10, y + boxH - 10, 4, 4);

      ctx.textAlign = 'center';
      ctx.font = '17px BalaclavaPixel, monospace';

      if (f.phase === 'cast' || f.phase === 'wait') {
        ctx.fillStyle = '#ffe5b4';
        const baitTxt = f.baitId ? ` · Cebo: ${Balaclava.ITEMS[f.baitId].name}` : '';
        ctx.fillText(`Esperando picada...${baitTxt}`, vw / 2, y + 32);
        ctx.font = '14px BalaclavaPixel, monospace';
        ctx.fillStyle = '#cfb79f';
        ctx.fillText('No recojas antes de tiempo o perderas el lance', vw / 2, y + 54);
      } else if (f.phase === 'bite') {
        ctx.fillStyle = '#ffd54f';
        ctx.fillText('!ALGO HA PICADO! - Pulsa [E] o Click ahora', vw / 2, y + 30);
        const pct = clamp(f.timer / 2.2, 0, 1);
        ctx.fillStyle = '#120804';
        ctx.fillRect(x + 28, y + 42, boxW - 56, 12);
        ctx.fillStyle = '#ffd54f';
        const segW = Math.round((boxW - 60) * pct / 4) * 4;
        ctx.fillRect(x + 30, y + 44, Math.max(0, segW), 8);
      } else if (f.phase === 'reel') {
        const hdrName = fishItem ? fishItem.name : 'Presa del Agua';
        const hitsReq = f.hitsReq ?? f.hitsNeeded ?? 1;
        const maxMistakes = f.maxMistakes ?? 3;
        const rarColor = (fishItem && RARITIES[fishItem.rarity] && RARITIES[fishItem.rarity].color) || '#ffe082';
        ctx.fillStyle = rarColor;
        ctx.textAlign = 'left';
        ctx.fillText(`PESCANDO: ${hdrName}`, x + 22, y + 24);
        ctx.textAlign = 'right';
        ctx.font = '15px BalaclavaPixel, monospace';
        ctx.fillStyle = '#a5d6a7';
        ctx.fillText(`Aciertos:${f.hitsDone}/${hitsReq}  Fallos:${f.mistakes}/${maxMistakes}`, x + boxW - 22, y + 24);

        const tx = Math.round(x + 18);
        const ty = Math.round(y + 34);
        const tw = Math.round(boxW - 36);
        const th = 32;
        // Segmented pixel ocean water track
        ctx.fillStyle = '#071b24';
        ctx.fillRect(tx - 2, ty - 2, tw + 4, th + 4);
        ctx.fillStyle = '#0e3c4c';
        ctx.fillRect(tx, ty, tw, th);
        ctx.fillStyle = '#155469';
        for (let sx = tx + 8; sx < tx + tw - 8; sx += 16) {
          ctx.fillRect(sx, ty + 4, 8, 4);
          ctx.fillRect(sx + 4, ty + th - 8, 6, 4);
        }
        ctx.fillStyle = '#c68e4b';
        ctx.fillRect(tx - 2, ty - 2, tw + 4, 2);
        ctx.fillRect(tx - 2, ty + th, tw + 4, 2);

        // True rarity-scaled pixel emerald skill zone
        const zw = Math.max(10, Math.round((tw * f.zoneWidth) / 2) * 2);
        const zoneCenter = typeof f.zoneCenter === 'number'
          ? f.zoneCenter
          : ((Number.isFinite(f.zoneStart) ? f.zoneStart : 0.34) + f.zoneWidth / 2);
        const zx = clamp(Math.round((tx + zoneCenter * tw - zw / 2) / 2) * 2, tx + 2, tx + tw - zw - 2);
        const inZone = Math.abs(f.cursorPos - zoneCenter) <= (f.zoneWidth * 0.5 + 0.018);
        ctx.fillStyle = inZone ? '#2e7d32' : '#1b5e20';
        ctx.fillRect(zx, ty + 2, zw, th - 4);
        ctx.fillStyle = inZone ? '#69f0ae' : '#43a047';
        ctx.fillRect(zx + 2, ty + 4, Math.max(4, zw - 4), th - 8);
        ctx.fillStyle = inZone ? '#ffffff' : '#a5d6a7';
        ctx.fillRect(zx, ty + 2, zw, 2);
        ctx.fillRect(zx, ty + th - 4, zw, 2);

        // Target fish sprite centered on emerald zone
        const fishScreenX = Math.round(zx + zw / 2);
        if (fishSprite) {
          ctx.drawImage(fishSprite, fishScreenX - 12, ty + th / 2 - 12, 24, 24);
        }

        // Crisp 8-bit pixel needle cursor
        const curX = Math.round(clamp(tx + f.cursorPos * tw, tx + 4, tx + tw - 4) / 2) * 2;
        ctx.fillStyle = '#3e1a00';
        ctx.fillRect(curX - 4, ty - 4, 8, th + 8);
        ctx.fillStyle = '#ff8f00';
        ctx.fillRect(curX - 3, ty - 3, 6, th + 6);
        ctx.fillStyle = '#fff8e1';
        ctx.fillRect(curX - 2, ty - 2, 4, th + 4);

        const isMissFlash = (f.missFlash > 0) || (f.flashTimer > 0 && f.flashColor === 'miss');
        ctx.textAlign = 'center';
        ctx.fillStyle = isMissFlash ? '#ff8a80' : '#b9f6ca';
        ctx.font = '15px BalaclavaPixel, monospace';
        ctx.fillText('Pulsa [E] o Click dentro de la ZONA VERDE', vw / 2, y + 86);
      }

      ctx.textAlign = 'left';
      ctx.restore();
    }

    renderFloraLayer(ctx, vw, vh) {
      if (!this.world || typeof this.world.getTileFlora !== 'function') return;
      const z = this.camera.zoom || 1;
      const halfW = (vw / 2) / z + TILE_SIZE;
      const halfH = (vh / 2) / z + TILE_SIZE;
      const minTx = Math.max(0, Math.floor((this.camera.x - halfW) / TILE_SIZE));
      const maxTx = Math.min(WORLD_TILES - 1, Math.ceil((this.camera.x + halfW) / TILE_SIZE));
      const minTy = Math.max(0, Math.floor((this.camera.y - halfH) / TILE_SIZE));
      const maxTy = Math.min(WORLD_TILES - 1, Math.ceil((this.camera.y + halfH) / TILE_SIZE));

      const blocked = new Set();
      for (const c of this.world.crops) blocked.add(`${c.tx},${c.ty}`);
      for (const b of this.buildings) {
        const bDef = Balaclava.BUILDINGS[b.type];
        const sz = (bDef && bDef.size) || 1;
        for (let dy = 0; dy < sz; dy++) {
          for (let dx = 0; dx < sz; dx++) {
            blocked.add(`${b.tx + dx},${b.ty + dy}`);
          }
        }
      }
      for (const n of this.world.nodes) {
        blocked.add(`${Math.floor(n.x / TILE_SIZE)},${Math.floor(n.y / TILE_SIZE)}`);
      }

      const extraImgs = Balaclava.Assets.extraImages || {};
      const okImg = (im) => im && im.complete && im.naturalWidth > 0;
      const txPlant = extraImgs.flora_tx_plant;
      const hasTxPlant = okImg(txPlant);
      const flowerPalettes = [
        ['#fff176', '#ffb74d'],
        ['#ff80ab', '#f48fb1'],
        ['#80d8ff', '#b3e5fc'],
        ['#fff9c4', '#ffffff']
      ];

      ctx.save();
      for (let ty = minTy; ty <= maxTy; ty++) {
        for (let tx = minTx; tx <= maxTx; tx++) {
          if (!this.world.isTileUnlocked(tx, ty)) continue;
          const tile = this.world.tiles[ty] && this.world.tiles[ty][tx];
          if (tile !== 1) continue;
          if (blocked.has(`${tx},${ty}`)) continue;

          const gx = Math.floor(tx / PLOT_TILES);
          const gy = Math.floor(ty / PLOT_TILES);
          const biome = (this.world.getVisualBiomeAtTile
            ? this.world.getVisualBiomeAtTile(tx, ty)
            : (this.world.plotBiomes[gy] && this.world.plotBiomes[gy][gx]));
          if (!biome) continue;

          const fl = this.world.getTileFlora(tx, ty, biome);
          if (!fl) continue;

          const wx = tx * TILE_SIZE + fl.ox;
          const wy = ty * TILE_SIZE + fl.oy;
          const swayOn = !this.settings || this.settings.treeSway !== false;
          const sway = (fl.sway && swayOn) ? Math.sin(this.time * 2.5 + tx * 0.73 + ty * 0.51) * 1.4 : 0;

          if (fl.kind === 'tuft') {
            if (hasTxPlant) {
              const dw = fl.size;
              const dh = Math.round(fl.size * 0.78);
              ctx.drawImage(txPlant, fl.col * 32 + 5, 384 + fl.row * 32 + 7, 22, 16, wx - dw / 2 + sway * 0.4, wy - dh * 0.75, dw, dh);
            } else {
              ctx.fillStyle = '#558b2f';
              ctx.fillRect(wx - 4 + sway * 0.3, wy - 5, 2, 5);
              ctx.fillRect(wx, wy - 7, 2, 7);
              ctx.fillRect(wx + 4 + sway * 0.4, wy - 4, 2, 4);
            }
          } else if (fl.kind === 'sprite') {
            const im = extraImgs[fl.key];
            if (okImg(im)) {
              if (fl.glow) {
                const g = ctx.createRadialGradient(wx, wy - 4, 1, wx, wy - 4, fl.size * 0.75);
                g.addColorStop(0, biome === 'tierras_volcanicas' ? 'rgba(255,87,34,0.28)' : 'rgba(100,220,255,0.28)');
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(wx, wy - 4, fl.size * 0.75, 0, Math.PI * 2); ctx.fill();
              }
              const sz = fl.size;
              const aspect = im.height / Math.max(1, im.width);
              const dh = Math.round(sz * aspect);
              ctx.drawImage(im, wx - sz / 2 + sway * 0.3, wy - dh * 0.85, sz, dh);
            }
          } else if (fl.kind === 'flowers') {
            const pal = flowerPalettes[fl.palette % flowerPalettes.length];
            const offsets = [[-5, -2], [4, 2], [-1, 5], [6, -4]];
            for (let i = 0; i < fl.count; i++) {
              const fx = wx + offsets[i][0] + sway * 0.45;
              const fy = wy + offsets[i][1];
              ctx.fillStyle = '#33691e';
              ctx.fillRect(fx, fy - 3, 2, 4);
              ctx.fillStyle = pal[i % 2];
              ctx.fillRect(fx - 1.5, fy - 6, 4, 4);
              ctx.fillStyle = '#fff59d';
              ctx.fillRect(fx, fy - 5, 1.5, 1.5);
            }
          } else if (fl.kind === 'blade') {
            ctx.fillStyle = fl.color;
            ctx.fillRect(wx - 4 + sway * 0.4, wy - 6, 2, 6);
            ctx.fillRect(wx, wy - 8, 2, 8);
            ctx.fillRect(wx + 4 + sway * 0.5, wy - 5, 2, 5);
            ctx.fillStyle = fl.highlight;
            ctx.fillRect(wx + sway * 0.35, wy - 9, 2, 2);
          } else if (fl.kind === 'succulent') {
            ctx.fillStyle = '#2e7d32';
            ctx.fillRect(wx - 3, wy - 10, 6, 10);
            ctx.fillRect(wx - 6, wy - 7, 3, 4);
            ctx.fillRect(wx + 3, wy - 8, 3, 4);
            ctx.fillStyle = '#66bb6a';
            ctx.fillRect(wx - 1, wy - 9, 2, 8);
            ctx.fillStyle = '#ff80ab';
            ctx.fillRect(wx - 1, wy - 12, 2, 2);
          }
        }
      }
      ctx.restore();
    }

    isSameLand(tx, ty) {
      if (tx < 0 || ty < 0 || tx >= WORLD_TILES || ty >= WORLD_TILES) return false;
      if (!this.world.isTileUnlocked(tx, ty)) return false;
      const t = this.world.tiles[ty][tx];
      return t === 1 || t === 2 || t === 4;
    }

    renderLockedPlotSigns(ctx) {
      // Islands can only be purchased inside the World Map modal, not directly in the overworld
      this.plotBuyPlaques = [];
      return;
      const assets = Balaclava.Assets;
      const coinImg = (assets && assets.extraImages && assets.extraImages.iconCoin) || this.getOrLoadUiImg('iconCoin', 'assets/ui/coin_gold.png');
      const lockImg = (assets && assets.extraImages && assets.extraImages.iconLock) || this.getOrLoadUiImg('iconLock', 'assets/ui/ico_lock.png');
      const okImg = (im) => im && im.complete && im.naturalWidth > 0;
      const coinOk = okImg(coinImg);
      const lockOk = okImg(lockImg);

      for (let gy = 0; gy < GRID_PLOTS; gy++) {
        for (let gx = 0; gx < GRID_PLOTS; gx++) {
          if (this.world.isPlotUnlocked(gx, gy)) continue;
          const adj = this.world.isPlotUnlocked(gx - 1, gy) || this.world.isPlotUnlocked(gx + 1, gy) ||
                      this.world.isPlotUnlocked(gx, gy - 1) || this.world.isPlotUnlocked(gx, gy + 1);
          if (!adj) continue;

          const px = gx * PLOT_TILES * TILE_SIZE;
          const py = gy * PLOT_TILES * TILE_SIZE;
          const size = PLOT_TILES * TILE_SIZE;
          const biomeKey = this.world.plotBiomes[gy][gx];
          const biome = BIOMES[biomeKey];
          const price = this.economy.getPlotPrice(this, gx, gy);
          const biomeLock = (this.economy && typeof this.economy.getBiomeLockStatus === 'function')
            ? this.economy.getBiomeLockStatus(this, gx, gy)
            : { lockedByBiome: false };
          const canBuy = !biomeLock.lockedByBiome && this.coins >= price;

          const bob = Math.sin(this.time * 2.2 + gx * 1.3 + gy * 0.9) * 2.5;
          const cx = Math.round(px + size / 2);
          const cy = Math.round(py + size / 2 + bob);
          const hovering = dist(this.mouse.wx, this.mouse.wy, cx, cy) <= 80;
          const priceStr = `${price}`;

          ctx.save();
          ctx.font = 'bold 18px BalaclavaPixel, monospace';
          const tw = ctx.measureText(priceStr).width;
          const bw = Math.max(hovering ? 138 : 116, Math.round(tw + 66));
          const bh = 34;
          const bx = Math.round(cx - bw / 2);
          const by = Math.round(cy - bh / 2);
          this.plotBuyPlaques.push({ gx, gy, bx, by, bw, bh });

          // 1. Water Ripple & Foam Ring beneath the floating beacon
          const ripT = this.time * 2.2 + gx + gy;
          const ripR = 26 + Math.sin(ripT) * 3;
          ctx.fillStyle = 'rgba(4, 26, 48, 0.40)';
          ctx.beginPath();
          ctx.ellipse(cx, cy + 20, ripR, ripR * 0.38, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(178, 235, 242, 0.55)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 20, ripR, ripR * 0.38, 0, 0, Math.PI * 2);
          ctx.stroke();

          // 2. Mooring wooden posts connecting board to the water
          ctx.fillStyle = '#1b100a';
          ctx.fillRect(cx - 16, cy + 8, 6, 12);
          ctx.fillRect(cx + 10, cy + 8, 6, 12);
          ctx.fillStyle = '#3e2213';
          ctx.fillRect(cx - 15, cy + 8, 4, 11);
          ctx.fillRect(cx + 11, cy + 8, 4, 11);

          // 3. Floating Plaque Board (Authentic Pixel Art Signboard)
          // Outer drop shadow on water
          ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
          ctx.fillRect(bx + 2, by + 4, bw, bh);

          // Outer dark carved wooden / slate bezel (stepped pixel frame)
          ctx.fillStyle = '#0c0e16';
          ctx.fillRect(bx - 3, by - 3, bw + 6, bh + 6);

          // Main board fill
          if (canBuy) {
            ctx.fillStyle = hovering ? '#242e48' : '#182034'; // rich celestial slate
          } else {
            ctx.fillStyle = hovering ? '#341822' : '#221018'; // dark crimson mahogany
          }
          ctx.fillRect(bx, by, bw, bh);

          // Inner carved molding border
          ctx.fillStyle = canBuy ? (hovering ? '#ffe082' : '#d4a64a') : (hovering ? '#ff7043' : '#a83232');
          ctx.fillRect(bx, by, bw, 2);
          ctx.fillRect(bx, by + bh - 2, bw, 2);
          ctx.fillRect(bx, by, 2, bh);
          ctx.fillRect(bx + bw - 2, by, 2, bh);

          // Four Corner Brass / Copper Pixel Rivets
          ctx.fillStyle = canBuy ? '#fff59d' : '#ffab91';
          ctx.fillRect(bx + 3, by + 3, 2, 2);
          ctx.fillRect(bx + bw - 5, by + 3, 2, 2);
          ctx.fillRect(bx + 3, by + bh - 5, 2, 2);
          ctx.fillRect(bx + bw - 5, by + bh - 5, 2, 2);

          // 4. Top Biome Ribbon Header
          const bLabel = (biome && biome.name) ? biome.name.toUpperCase() : 'ISLA MÍSTICA';
          const biomeColors = {
            pradera: '#81c784',
            desierto: '#ffd54f',
            bosque_oscuro: '#ba68c8',
            montanas_heladas: '#4fc3f7',
            tierras_volcanicas: '#ff7043'
          };
          const bColor = (biomeKey && biomeColors[biomeKey]) || '#ffd54f';
          ctx.font = '13px BalaclavaPixel, monospace';
          const bTextW = ctx.measureText(bLabel).width;
          const tagW = Math.round(bTextW + 16);
          const tagX = Math.round(cx - tagW / 2);
          const tagY = by - 14;

          // Ribbon shadow & background
          ctx.fillStyle = '#090c14';
          ctx.fillRect(tagX - 1, tagY - 1, tagW + 2, 16);
          ctx.fillStyle = canBuy ? 'rgba(16, 24, 44, 0.95)' : 'rgba(38, 14, 20, 0.95)';
          ctx.fillRect(tagX, tagY, tagW, 14);
          ctx.fillStyle = bColor;
          ctx.fillRect(tagX, tagY, tagW, 1);
          ctx.fillRect(tagX, tagY + 13, tagW, 1);
          ctx.textAlign = 'center';
          ctx.fillText(bLabel, cx, tagY + 11);

          // 5. Plaque Content: Lock Icon + Gold Coin + Price
          const contentTotalW = 20 + 6 + 20 + 6 + tw;
          const startX = Math.round(cx - contentTotalW / 2);
          const iconY = Math.round(cy - 9);

          // Draw Lock Icon (size 18x18)
          if (lockOk) {
            ctx.drawImage(lockImg, startX, iconY, 18, 18);
          } else {
            // Authentic pixel lock fallback
            ctx.fillStyle = canBuy ? '#ffd54f' : '#ef5350';
            ctx.fillRect(startX + 3, iconY + 7, 12, 10);
            ctx.fillStyle = '#0b0f19';
            ctx.fillRect(startX + 8, iconY + 11, 2, 3);
            ctx.strokeStyle = canBuy ? '#ffe082' : '#ff8a80';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX + 5, iconY + 2, 8, 7);
          }

          // Draw Gold Coin (size 20x20)
          const coinX = startX + 26;
          if (coinOk) {
            ctx.drawImage(coinImg, coinX, iconY - 1, 20, 20);
          } else {
            // Authentic pixel coin fallback
            ctx.fillStyle = '#d4a64a';
            ctx.beginPath();
            ctx.arc(coinX + 9, cy, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff59d';
            ctx.beginPath();
            ctx.arc(coinX + 8, cy - 1, 5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw Price Text
          const textX = coinX + 24;
          ctx.font = 'bold 18px BalaclavaPixel, monospace';
          ctx.textAlign = 'left';
          // Dark outline shadow
          ctx.fillStyle = '#000000';
          ctx.fillText(priceStr, textX + 1, cy + 6);
          ctx.fillText(priceStr, textX - 1, cy + 6);
          ctx.fillText(priceStr, textX, cy + 7);
          // Foreground
          ctx.fillStyle = canBuy ? '#fff9c4' : '#ffcdd2';
          ctx.fillText(priceStr, textX, cy + 6);

          // 6. Hover Tooltip Pill Beneath
          if (hovering) {
            ctx.font = '14px BalaclavaPixel, monospace';
            const hintText = biomeLock.lockedByBiome
              ? `Completa ${biomeLock.blockingBiomeName} (${biomeLock.unlocked}/${biomeLock.total})`
              : (canBuy ? 'Clic para Comprar Parcela' : `Faltan ${price - this.coins} monedas`);
            const htw = ctx.measureText(hintText).width;
            const hbw = Math.round(htw + 20);
            const hbx = Math.round(cx - hbw / 2);
            const hby = by + bh + 8;

            ctx.fillStyle = 'rgba(8, 12, 22, 0.92)';
            ctx.fillRect(hbx - 2, hby - 2, hbw + 4, 22);
            ctx.fillStyle = canBuy ? '#1b4d3e' : '#4a151b';
            ctx.fillRect(hbx, hby, hbw, 18);
            ctx.fillStyle = canBuy ? '#34d399' : '#ef5350';
            ctx.fillRect(hbx, hby, hbw, 1);
            ctx.fillRect(hbx, hby + 17, hbw, 1);
            ctx.textAlign = 'center';
            ctx.fillStyle = canBuy ? '#a7f3d0' : '#fecaca';
            ctx.fillText(hintText, cx, hby + 14);
          }

          ctx.restore();
        }
      }
      ctx.textAlign = 'left';
    }

    setPlayerSkin(skinId) {
      const skins = Balaclava.SKINS || [];
      const found = skins.find(s => s.id === skinId);
      if (found) {
        this.player.skinId = found.id;
        if (typeof window !== 'undefined' && window.localStorage) {
          try { window.localStorage.setItem('balaclava_player_skin', found.id); } catch (_) {}
        }
        if (this.addFloatingText) {
          const sName = (Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en' && found.name_en) ? found.name_en : found.name;
          const tr = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : (k === 'settings.skinFloating' ? `Aspecto: ${v.name}` : k));
          this.addFloatingText(tr('settings.skinFloating', { name: sName }), this.player.x, this.player.y - 28, '#ffeb3b');
        }
        Balaclava.Audio.play('ui');
        return found;
      }
      return null;
    }

    cyclePlayerSkin(dir = 1) {
      const skins = Balaclava.SKINS || [];
      if (!skins.length) return;
      const curId = this.player.skinId || (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('balaclava_player_skin')) || 'monk_yellow';
      let idx = skins.findIndex(s => s.id === curId);
      if (idx === -1) idx = 0;
      let nextIdx = (idx + dir + skins.length) % skins.length;
      return this.setPlayerSkin(skins[nextIdx].id);
    }

    drawPlayer(ctx) {
      const p = this.player;
      if (p.invuln > 0 && !p.deadTimer && Math.floor(this.time * 20) % 2 === 0) return;

      const assets = Balaclava.Assets;
      const skins = Balaclava.SKINS || [];
      const currentSkinId = p.skinId || (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('balaclava_player_skin')) || 'monk_yellow';
      p.skinId = currentSkinId;
      const skinDef = skins.find(s => s.id === currentSkinId) || skins[0] || {
        id: 'monk_yellow',
        idle: 'monk_yellow_idle',
        run: 'monk_yellow_run',
        heal: 'monk_yellow_heal',
        type: 'monk'
      };

      const idleSheet = assets.get(skinDef.idle) || assets.get('monk_yellow_idle') || assets.get('pawn_idle');
      const runSheet = assets.get(skinDef.run) || idleSheet;
      const isMoving = p.moving && !p.deadTimer;

      let sheet = isMoving ? (runSheet || idleSheet) : (idleSheet || runSheet);
      let frameCount = sheet && sheet.width ? Math.max(1, Math.floor(sheet.width / 192)) : (isMoving ? 6 : 8);
      let frame = Math.floor(p.animTimer * (isMoving ? 10 : 7)) % frameCount;
      let sourceY = 0;

      const swingTierId = (this.toolTiers && this.toolTiers[p.swingTool]) || 'basica';
      const isSpecialItemSwing = !!(p.swingItemId && Balaclava.ITEMS && Balaclava.ITEMS[p.swingItemId]);
      let pawnUsesNativeSheet = false;

      // Animaciones de acción con la herramienta / arma correspondiente en la mano (¡SIN CAMBIAR DE PERSONAJE!)
      if (p.swingTimer > 0 && !p.deadTimer) {
        const prog = clamp(1 - p.swingTimer / Math.max(0.01, p.swingDur), 0, 0.99);

        if (skinDef.type === 'monk') {
          const healSheet = assets.get(skinDef.heal) || idleSheet;
          if (healSheet) {
            sheet = healSheet;
            frameCount = healSheet.width ? Math.max(1, Math.floor(healSheet.width / 192)) : 11;
            frame = Math.min(frameCount - 1, Math.floor(prog * 8));
          }
        } else if (skinDef.type === 'archer') {
          if (p.swingTool === 'arco' && assets.get(skinDef.shoot || 'archer_black_shoot')) {
            sheet = assets.get(skinDef.shoot || 'archer_black_shoot');
            frameCount = sheet.width ? Math.max(1, Math.floor(sheet.width / 192)) : 8;
            frame = Math.min(frameCount - 1, Math.floor(prog * frameCount));
          } else {
            sheet = isMoving ? runSheet : idleSheet;
            frameCount = sheet.width ? Math.max(1, Math.floor(sheet.width / 192)) : 6;
            frame = Math.min(frameCount - 1, Math.floor(prog * frameCount));
          }
        } else if (skinDef.type === 'warrior') {
          if (!isSpecialItemSwing && swingTierId === 'basica' && (p.swingTool === 'espada' || p.swingTool === 'guadana') && (assets.get(skinDef.atk1) || assets.get(skinDef.atk2))) {
            sheet = (p.attackCount % 2 === 0 && assets.get(skinDef.atk2)) ? assets.get(skinDef.atk2) : assets.get(skinDef.atk1);
            frameCount = sheet.width ? Math.max(1, Math.floor(sheet.width / 192)) : 6;
            frame = Math.min(frameCount - 1, Math.floor(prog * frameCount));
            pawnUsesNativeSheet = true;
          } else {
            sheet = isMoving ? runSheet : idleSheet;
            if (sheet) {
              frameCount = sheet.width ? Math.max(1, Math.floor(sheet.width / 192)) : 6;
              frame = Math.min(frameCount - 1, Math.floor(prog * frameCount));
            }
          }
        } else if (skinDef.type === 'pawn') {
          // Solo usar sprites con herramienta incrustada cuando la herramienta coincide exactamente (Básica).
          // Para espadas, armas especiales, báculos o picos/hachas mejorados, conservar cuerpo limpio del Pawn + herramienta real equipada en mano.
          if (!isSpecialItemSwing && swingTierId === 'basica' && p.swingTool === 'hacha' && assets.get(skinDef.axe)) {
            sheet = assets.get(skinDef.axe);
            pawnUsesNativeSheet = true;
          } else if (!isSpecialItemSwing && swingTierId === 'basica' && p.swingTool === 'pico' && assets.get(skinDef.pick)) {
            sheet = assets.get(skinDef.pick);
            pawnUsesNativeSheet = true;
          } else if (!isSpecialItemSwing && swingTierId === 'basica' && p.swingTool === 'pala' && assets.get(skinDef.hammer)) {
            sheet = assets.get(skinDef.hammer);
            pawnUsesNativeSheet = true;
          } else {
            sheet = isMoving ? runSheet : idleSheet;
          }
          if (sheet) {
            frameCount = sheet.width ? Math.max(1, Math.floor(sheet.width / 192)) : 6;
            frame = p.swingTool === 'arco'
              ? Math.floor(p.animTimer * (isMoving ? 10 : 6)) % frameCount
              : Math.min(frameCount - 1, Math.floor(prog * frameCount));
          }
        }
      }

      ctx.save();
      ctx.translate(Math.round(p.x), Math.round(p.y));
      if (p.deadTimer > 0) {
        ctx.imageSmoothingEnabled = false;
        const elapsed = Math.max(0, (p.deadMax || 10.0) - p.deadTimer);
        // Quantized pixel shadow + fallen ash mound
        ctx.fillStyle = 'rgba(10, 4, 8, 0.48)';
        ctx.fillRect(-14, 9, 28, 6);
        ctx.fillRect(-10, 7, 20, 2);

        if (elapsed >= 0.34) {
          ctx.fillStyle = '#3d282c';
          ctx.fillRect(-14, 5, 28, 4);
          ctx.fillStyle = '#5c3f45';
          ctx.fillRect(-10, 3, 20, 2);
          ctx.fillStyle = '#26181c';
          ctx.fillRect(-6, 1, 12, 2);
        }

        const staggerX = elapsed < 0.28 ? Math.round(((Math.floor(elapsed * 26) & 1) ? 3 : -3)) : 0;
        const stepIdx = elapsed < 0.20 ? 0 : Math.min(3, Math.floor((elapsed - 0.16) / 0.12));
        const stepAngles = [0, 0.34, 0.72, 1.0];
        const tilt = stepAngles[stepIdx] * (Math.PI / 2);
        const dropY = Math.round(stepAngles[stepIdx] * 6);

        ctx.save();
        ctx.translate(staggerX, dropY);
        ctx.rotate(-tilt * p.facing);
        if (elapsed < 0.22 && (Math.floor(elapsed * 20) & 1) === 0) {
          ctx.fillStyle = 'rgba(255, 232, 224, 0.72)';
          ctx.fillRect(-14, -28, 28, 32);
        }
        ctx.globalAlpha = elapsed >= 0.85 ? 0.85 : 1.0;
        ctx.scale(p.facing, 1);
        if (sheet) {
          ctx.drawImage(sheet, frame * 192, sourceY, 192, 192, -48, -56, 96, 96);
        } else {
          ctx.fillStyle = '#42a5f5';
          ctx.fillRect(-12, -24, 24, 28);
        }
        ctx.restore();

        // Stepped 16-bit Soul Wisp ascending from fallen hero
        if (elapsed >= 0.26) {
          const wispAge = elapsed - 0.26;
          const rise = Math.min(58, Math.floor(wispAge * 28));
          const bobX = Math.round(Math.sin(Math.floor(elapsed * 8) * 0.9) * 3);
          const bobY = (Math.floor(elapsed * 6) & 1) ? -1 : 0;
          const wx = bobX;
          const wy = -14 - rise + bobY;
          ctx.fillStyle = '#15303f';
          ctx.fillRect(wx - 4, wy - 7, 8, 10);
          ctx.fillStyle = '#4dd0e1';
          ctx.fillRect(wx - 3, wy - 6, 6, 8);
          ctx.fillRect(wx - 1, wy - 8, 2, 2);
          ctx.fillStyle = '#e0f7fa';
          ctx.fillRect(wx - 2, wy - 4, 4, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(wx - 1, wy - 3, 2, 2);
          ctx.fillStyle = '#80deea';
          ctx.fillRect(wx - 2 + (Math.floor(elapsed * 9) & 1), wy + 4, 2, 2);
          ctx.fillRect(wx + 2 - (Math.floor(elapsed * 7) & 1), wy + 7, 1, 2);
        }
        ctx.restore();
        return;
      }

      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 12, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.scale(p.facing, 1);
      if (sheet) {
        ctx.drawImage(sheet, frame * 192, sourceY, 192, 192, -48, -56, 96, 96);
      } else {
        ctx.fillStyle = '#42a5f5';
        ctx.fillRect(-12, -24, 24, 28);
      }
      ctx.restore();

      // --- ANIMACIÓN DE HERRAMIENTAS Y ARMAS PERSONALIZADA POR ARQUETIPO ---
      if (p.swingTimer > 0 && !p.deadTimer) {
        const prog = clamp(1 - p.swingTimer / Math.max(0.01, p.swingDur), 0, 0.99);
        const tierId = (this.toolTiers && this.toolTiers[p.swingTool]) || 'basica';
        let toolImg = null;
        if (isSpecialItemSwing && assets.getItemIconCanvas) {
          toolImg = assets.getItemIconCanvas(p.swingItemId);
        }
        if (!toolImg) {
          toolImg = assets.getToolImg ? assets.getToolImg(p.swingTool, tierId) : assets.getItemIconCanvas(p.swingTool);
        }

        // 1. ARQUETIPO MONJE (Túnica café): Herramienta telekinética flotante que sale por el lado y ejecuta el golpe
        if (skinDef.type === 'monk' && toolImg) {
          const reach = 22 + Math.sin(prog * Math.PI) * 26;
          const tx = p.x + Math.cos(p.swingAngle) * reach + p.facing * 6;
          const ty = p.y - 10 + Math.sin(p.swingAngle) * reach;
          const swingRot = p.swingAngle + (prog - 0.42) * 2.8 * p.facing + Math.PI / 4;

          ctx.save();
          // Hilo de energía mística espiritual entre las manos del monje y la herramienta flotante
          ctx.strokeStyle = `rgba(255, 224, 130, ${0.4 + Math.sin(prog * Math.PI) * 0.55})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(p.x + p.facing * 8, p.y - 14);
          ctx.quadraticCurveTo(p.x + p.facing * 18, p.y - 24, tx, ty);
          ctx.stroke();

          // Destello de impacto espiritual
          if (prog >= 0.45 && prog <= 0.75) {
            const sparkR = (prog - 0.45) * 45;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(tx, ty, sparkR, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();

          // Renderizar la herramienta flotante con su aura dorada
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(swingRot);

          const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
          aura.addColorStop(0, 'rgba(255, 238, 88, 0.75)');
          aura.addColorStop(0.5, 'rgba(255, 179, 0, 0.35)');
          aura.addColorStop(1, 'rgba(255, 143, 0, 0)');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.fill();

          const sz = isSpecialItemSwing ? 30 : 28;
          ctx.drawImage(toolImg, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        }
        // 2. ARQUETIPOS PAWN / RANGER / GUERRERO: Renderizar exactamente la herramienta/espada/báculo equipado en mano
        else if (
          p.swingTool !== 'arco'
          && toolImg
          && (
            skinDef.type === 'archer'
            || (skinDef.type === 'pawn' && !pawnUsesNativeSheet)
            || (skinDef.type === 'warrior' && (isSpecialItemSwing || tierId !== 'basica' || (p.swingTool !== 'espada' && p.swingTool !== 'guadana')))
          )
        ) {
          const reach = 17 + Math.sin(prog * Math.PI) * 19;
          const tx = p.x + p.facing * 9 + Math.cos(p.swingAngle) * reach;
          const ty = p.y - 7 + Math.sin(p.swingAngle) * reach;
          const swingRot = p.swingAngle + (prog - 0.4) * 2.8 * p.facing + Math.PI / 4;

          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(swingRot);
          const sz = isSpecialItemSwing ? 28 : 25;
          ctx.drawImage(toolImg, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        }
        // 3. ARCO EMPUÑADO PARA PAWN / WARRIOR (sin cambiar de personaje a archer_shoot)
        else if (p.swingTool === 'arco' && skinDef.type !== 'archer' && toolImg) {
          const drawPhase = prog < 0.65 ? (prog / 0.65) : 1 - ((prog - 0.65) / 0.35);
          const recoil = prog >= 0.65 ? (prog - 0.65) * 10 : 0;
          const reach = 15 - recoil;
          const tx = p.x + Math.cos(p.swingAngle) * reach;
          const ty = p.y - 8 + Math.sin(p.swingAngle) * reach;

          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(p.swingAngle);

          // Cuerda tensada del arco
          const pullBack = -4 - drawPhase * 7;
          ctx.strokeStyle = 'rgba(255, 248, 225, 0.92)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(2, -10);
          ctx.lineTo(pullBack, 0);
          ctx.lineTo(2, 10);
          ctx.stroke();

          // Cuerpo del arco (rotado +45 deg para alinear icono diagonal hacia el objetivo)
          ctx.save();
          ctx.rotate(Math.PI / 4);
          const sz = 26;
          ctx.drawImage(toolImg, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();

          // Flecha tensada antes de salir disparada
          if (prog < 0.68) {
            ctx.fillStyle = '#c68642';
            ctx.fillRect(pullBack, -1, 16, 2);
            ctx.fillStyle = '#eceff1';
            ctx.beginPath();
            ctx.moveTo(pullBack + 19, 0);
            ctx.lineTo(pullBack + 14, -3);
            ctx.lineTo(pullBack + 14, 3);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ef5350';
            ctx.fillRect(pullBack - 2, -2, 3, 4);
          }
          ctx.restore();
        }
      }

      // Indicador visual de recarga del arco y pose de carga en mano
      if (!p.deadTimer && (p.bowReloadTimer || 0) > 0 && (p.bowReloadDur || 0) > 0) {
        const relProg = clamp(1 - p.bowReloadTimer / Math.max(0.05, p.bowReloadDur), 0, 1);
        const bowTier = (this.toolTiers && this.toolTiers.arco) || 'basica';
        const bowImg = assets.getToolImg ? assets.getToolImg('arco', bowTier) : null;
        if (bowImg && p.swingTimer <= 0) {
          ctx.save();
          ctx.translate(p.x + p.facing * 11, p.y - 6);
          ctx.scale(p.facing, 1);
          ctx.rotate(Math.PI / 4 + Math.sin(relProg * Math.PI) * 0.28);
          ctx.drawImage(bowImg, -12, -12, 24, 24);
          ctx.restore();
        }
        const barW = 34;
        const barH = 5;
        const bx = Math.round(p.x - barW / 2);
        const by = Math.round(p.y - 46);
        ctx.save();
        ctx.fillStyle = 'rgba(18, 12, 24, 0.88)';
        ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
        ctx.fillStyle = '#ffb74d';
        ctx.fillRect(bx, by, Math.max(2, Math.round(barW * relProg)), barH);
        ctx.restore();
      }

      // Elegant, tight pixel-art blade slash for cutting weapons (espada & guadana)
      if (p.swingTimer > 0 && (p.swingTool === 'espada' || p.swingTool === 'guadana')) {
        const tierId = this.toolTiers[p.swingTool] || 'basica';
        const prog = clamp(1 - p.swingTimer / Math.max(0.01, p.swingDur), 0, 0.99);
        const slashMap = {
          cobre: 'slashFire',
          oro: 'slashWhite',
          oricalco: 'slashFire',
          cristal: 'slashIce',
          adamantita: 'slashDark',
          platino: 'slashIce',
          acero: 'slashWhite',
          mitrilo: 'slashIce',
          titanio: 'slashIce',
          celestial: 'slashWhite',
          legendaria: 'slashFire'
        };
        const slashKey = slashMap[tierId] || 'slashWhite';
        const sImg = assets.extraImages && (assets.extraImages[slashKey] || assets.extraImages.slashWhite);
        if (sImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(sImg) : sImg.complete && sImg.naturalWidth > 0)) {
          const fw = sImg.height || 32;
          const totalFrames = Math.max(1, Math.floor(sImg.width / fw));
          const fr = Math.min(totalFrames - 1, Math.floor(prog * totalFrames));
          const reachDist = p.swingTool === 'guadana' ? 22 : 18;
          const sz = p.swingTool === 'guadana' ? 34 : 28;
          ctx.save();
          ctx.translate(p.x + Math.cos(p.swingAngle) * reachDist, p.y - 4 + Math.sin(p.swingAngle) * reachDist);
          ctx.rotate(p.swingAngle);
          ctx.globalAlpha = Math.max(0, 0.88 - prog * 0.4);
          ctx.drawImage(sImg, fr * fw, 0, fw, fw, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        }
      }

      // Held Arcane Laser Wand or Explosive Bomb/TNT in hand
      const heldSlot = this.hotbar && this.hotbar[this.activeSlot];
      const heldItem = heldSlot && heldSlot.kind === 'item' ? Balaclava.ITEMS[heldSlot.id] : null;
      if (heldItem && (heldItem.isLaserWeapon || heldItem.isBomb) && (this.inventory[heldItem.id] || 0) > 0) {
        const ic = Balaclava.Assets.getItemIconCanvas(heldItem.icon);
        if (ic) {
          ctx.save();
          const hx = p.x + p.facing * 14;
          const hy = p.y - 4;
          ctx.translate(hx, hy);
          if (heldItem.isLaserWeapon) {
            const aim = p.swingTimer > 0 ? p.swingAngle : (p.facing > 0 ? -0.35 : -Math.PI + 0.35);
            ctx.rotate(aim + Math.PI * 0.25);
            if (heldItem.laserStats) {
              const g = ctx.createRadialGradient(8, -8, 1, 8, -8, 14);
              g.addColorStop(0, heldItem.laserStats.color + '88');
              g.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = g;
              ctx.beginPath(); ctx.arc(8, -8, 14, 0, Math.PI * 2); ctx.fill();
            }
          } else {
            ctx.rotate(p.facing * 0.2);
          }
          ctx.drawImage(ic, -11, -11, 22, 22);
          ctx.restore();
        }
      }

      // Orbiting Floating Lantern permanent boss relic
      if (this.hasPermanentRelic('linterna_flotante')) {
        const lx = p.x - p.facing * 24 + Math.cos(this.time * 1.9) * 5;
        const ly = p.y - 38 + Math.sin(this.time * 3.1) * 5;
        ctx.save();
        const halo = ctx.createRadialGradient(lx, ly, 2, lx, ly, 22);
        halo.addColorStop(0, 'rgba(255, 224, 130, 0.55)');
        halo.addColorStop(1, 'rgba(255, 193, 7, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(lx, ly, 22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(lx - 6, ly - 9, 12, 3);
        ctx.fillRect(lx - 6, ly + 5, 12, 3);
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(lx - 5, ly - 6, 10, 11);
        ctx.fillStyle = '#fff9c4';
        ctx.fillRect(lx - 3, ly - 4, 6, 7);
        ctx.strokeStyle = '#ffca28';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(lx, ly - 10, 4, Math.PI, 0); ctx.stroke();
        ctx.restore();
      }
    }

    drawNode(ctx, n) {
      const assets = Balaclava.Assets;
      const jx = n.hitAnim > 0 ? Math.sin(n.hitAnim * 25) * 4 : 0;
      ctx.save();
      ctx.translate(n.x + jx, n.y);

      if (n.kind === 'tree' || n.kind === 'giant_tree') {
        const swayOn = !this.settings || this.settings.treeSway !== false;
        const isGiant = n.kind === 'giant_tree';
        const scale = isGiant ? 1.38 : 1.02;

        // Unified 4-tier tree variety from Tiny Swords pack (same resolution, palette & sway)
        // tree1: Gran Roble Verde (192x256)
        // tree2: Gran Roble Dorado de Otoño (192x256)
        // tree3: Abedul Blanco Esbelto (192x192)
        // tree4: Árbol Sauce Verde Redondo (192x192)
        let idx = ((n.variant || 0) % 4) + 1;
        if (n.biome === 'bosque_oscuro') {
          idx = ((n.variant || 0) % 2 === 0) ? 1 : 4;
        } else if (n.biome === 'nieve') {
          idx = ((n.variant || 0) % 2 === 0) ? 3 : 1;
        }

        const tImg = assets.get('tree' + idx);
        if (tImg && (tImg.complete || (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(tImg) : true))) {
          const fw = 192;
          const fh = tImg.height || 192;
          const fr = swayOn ? Math.floor((this.time * 3.6 + (n.id || 0) * 1.37) % 8) : 0;

          // Ground shadow under tree base
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.beginPath();
          ctx.ellipse(0, 18 * scale, (fh > 200 ? 28 : 22) * scale, 9 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Organic sway offset
          const swayX = swayOn ? Math.sin(this.time * 1.6 + (n.id || 0) * 0.9) * 1.8 : 0;

          const dw = Math.round(96 * scale);
          const dh = Math.round(108 * scale * (fh / 192));
          const dx = Math.round(-dw / 2 + swayX);
          const dy = Math.round(20 * scale - dh);

          let drawSource = tImg;
          let sx = fr * fw;
          let sy = 0;

          if (isGiant) {
            drawSource = this.getTintedSprite(`gtree_${idx}_sheet`, tImg, 0, 0, tImg.width, tImg.height, { hue: 270, sat: 1.35, bright: 0.85, fallbackTint: 'rgba(140, 80, 220, 0.4)' }) || tImg;
          } else if (n.biome === 'bosque_oscuro') {
            drawSource = this.getTintedSprite(`darktree_${idx}_sheet`, tImg, 0, 0, tImg.width, tImg.height, { hue: 250, sat: 0.85, bright: 0.72, fallbackTint: 'rgba(40, 30, 80, 0.35)' }) || tImg;
          } else if (n.biome === 'nieve') {
            drawSource = this.getTintedSprite(`snowtree_${idx}_sheet`, tImg, 0, 0, tImg.width, tImg.height, { hue: 195, sat: 0.4, bright: 1.22, fallbackTint: 'rgba(180, 220, 255, 0.35)' }) || tImg;
          }

          ctx.drawImage(drawSource, sx, sy, fw, fh, dx, dy, dw, dh);
        } else {
          ctx.fillStyle = isGiant ? '#311b92' : '#2e7d32';
          ctx.beginPath(); ctx.arc(0, -16, 22 * scale, 0, Math.PI * 2); ctx.fill();
        }
      } else if (n.kind === 'bush' || n.kind === 'herb_patch' || n.kind === 'wild_crop_patch') {
        const extraImgs = assets.extraImages || {};
        const okEx = (im) => im && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(im));
        if (n.kind === 'herb_patch' && okEx(extraImgs.node_herb_patch)) {
          ctx.fillStyle = 'rgba(0,0,0,0.22)';
          ctx.beginPath(); ctx.ellipse(0, 10, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.drawImage(extraImgs.node_herb_patch, -20, -28, 40, 40);
        } else if (n.kind === 'wild_crop_patch' && okEx(extraImgs.node_wild_crop)) {
          ctx.fillStyle = 'rgba(0,0,0,0.22)';
          ctx.beginPath(); ctx.ellipse(0, 10, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.drawImage(extraImgs.node_wild_crop, -20, -28, 40, 40);
        } else if (n.kind === 'bush' && okEx(extraImgs.deco_berry_bush)) {
          ctx.fillStyle = 'rgba(0,0,0,0.22)';
          ctx.beginPath(); ctx.ellipse(0, 8, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.drawImage(extraImgs.deco_berry_bush, -18, -26, 36, 36);
        } else {
          const bImg = assets.get(n.kind === 'bush' ? 'bush1' : 'bush2');
          if (bImg) {
            const fr = Math.floor((this.time * 3 + n.id) % 8);
            ctx.drawImage(bImg, fr * 128, 0, 128, 128, -28, -32, 56, 56);
          }
        }
      } else if (
        n.kind === 'rock' || n.kind === 'coal_vein' || n.kind === 'sulfur_vein' ||
        n.kind === 'copper_vein' || n.kind === 'tin_vein' || n.kind === 'iron_vein' ||
        n.kind === 'silver_vein' || n.kind === 'gold_vein' || n.kind === 'platinum_vein' ||
        n.kind === 'jade_vein' || n.kind === 'amethyst_vein' || n.kind === 'bloodstone_vein' ||
        n.kind === 'malachite_vein' || n.kind === 'star_sand_vein' || n.kind === 'amber_vein' ||
        n.kind === 'titanium_vein' || n.kind === 'obsidian_vein' || n.kind === 'magma_core_vein' ||
        n.kind === 'adamantite_vein' || n.kind === 'orichalcum_vein'
      ) {
        const extraImgs = assets.extraImages || {};
        const nodeSpriteMap = {
          rock: 'node_stone',
          coal_vein: 'node_coal',
          sulfur_vein: 'node_sulfur',
          copper_vein: 'node_copper',
          tin_vein: 'node_tin',
          iron_vein: 'node_iron',
          silver_vein: 'node_silver',
          gold_vein: 'node_gold',
          platinum_vein: 'node_platinum',
          jade_vein: 'node_jade',
          amethyst_vein: 'node_amethyst',
          bloodstone_vein: 'node_bloodstone',
          malachite_vein: 'node_malachite',
          star_sand_vein: 'node_star_sand',
          amber_vein: 'node_amber',
          titanium_vein: 'node_titanium',
          obsidian_vein: 'node_obsidian',
          magma_core_vein: 'node_magma_core',
          adamantite_vein: 'node_adamantite',
          orichalcum_vein: 'node_orichalcum'
        };
        const sparkleSet = new Set([
          'gold_vein', 'platinum_vein', 'jade_vein', 'amethyst_vein', 'bloodstone_vein',
          'amber_vein', 'titanium_vein', 'orichalcum_vein', 'adamantite_vein', 'magma_core_vein'
        ]);
        const nImg = extraImgs[nodeSpriteMap[n.kind]];
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.beginPath(); ctx.ellipse(0, 11, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
        if (nImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(nImg) : true)) {
          ctx.drawImage(nImg, -21, -27, 42, 42);
          if (sparkleSet.has(n.kind)) {
            const sp = 0.35 + Math.sin(this.time * 4.5 + n.id) * 0.3;
            ctx.fillStyle = `rgba(255,255,255,${sp.toFixed(2)})`;
            ctx.fillRect(-7, -18, 4, 4); ctx.fillRect(6, -12, 3, 3);
          }
        } else {
          const rImg = assets.get('rock' + ((n.variant % 3) + 1));
          if (rImg) ctx.drawImage(rImg, -20, -24, 40, 40);
        }
      } else if (n.kind === 'crystal_node' || n.kind === 'emerald_vein' || n.kind === 'diamond_vein' || n.kind === 'ice_crystal' || n.kind === 'ruby_node' || n.kind === 'sapphire_node' || n.kind === 'mithril_vein' || n.kind === 'azurite_vein' || n.kind === 'abyssal_crystal_vein') {
        const extraImgs = assets.extraImages || {};
        const col = n.kind === 'emerald_vein' ? '#66bb6a'
          : n.kind === 'diamond_vein' ? '#4fc3f7'
          : n.kind === 'ruby_node' ? '#ef5350'
          : n.kind === 'sapphire_node' ? '#42a5f5'
          : n.kind === 'mithril_vein' ? '#80cbc4'
          : n.kind === 'azurite_vein' ? '#29b6f6'
          : n.kind === 'abyssal_crystal_vein' ? '#b388ff'
          : n.kind === 'ice_crystal' ? '#b3e5fc'
          : '#ce93d8';
        ctx.save();
        ctx.globalAlpha = 0.24 + Math.sin(this.time * 3.2 + n.id) * 0.07;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(0, -6, 21, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        const crystalSpriteMap = {
          crystal_node: 'node_amethyst',
          emerald_vein: 'node_emerald',
          diamond_vein: 'node_diamond',
          ice_crystal: 'node_ice_crystal',
          ruby_node: 'node_ruby',
          sapphire_node: 'node_sapphire',
          mithril_vein: 'node_mithril',
          azurite_vein: 'node_azurite',
          abyssal_crystal_vein: 'node_abyssal_crystal'
        };
        const gemSprite = extraImgs[crystalSpriteMap[n.kind]] || extraImgs.node_amethyst;
        if (gemSprite && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(gemSprite) : true)) {
          ctx.drawImage(gemSprite, -21, -27, 42, 42);
        } else {
          ctx.fillStyle = '#1b1118';
          ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(15, -4); ctx.lineTo(10, 12); ctx.lineTo(-10, 12); ctx.lineTo(-15, -4); ctx.closePath(); ctx.fill();
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(12, -3); ctx.lineTo(7, 9); ctx.lineTo(-7, 9); ctx.lineTo(-12, -3); ctx.closePath(); ctx.fill();
        }
      } else if (n.kind === 'cactus') {
        const cIcon = assets.extraImages && (assets.extraImages.node_cactus || assets.extraImages.cactus_icon);
        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.beginPath(); ctx.ellipse(0, 10, 12, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        if (cIcon && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(cIcon) : true)) {
          ctx.drawImage(cIcon, -20, -32, 40, 42);
        } else {
          ctx.fillStyle = '#1b4332'; ctx.fillRect(-7, -28, 14, 38);
          ctx.fillStyle = '#2d6a4f'; ctx.fillRect(-5, -26, 10, 34);
          ctx.fillStyle = '#52b788'; ctx.fillRect(-2, -25, 3, 32);
          ctx.fillStyle = '#2d6a4f';
          ctx.fillRect(-14, -18, 7, 5); ctx.fillRect(-14, -24, 5, 8);
          ctx.fillRect(7, -14, 7, 5); ctx.fillRect(9, -22, 5, 10);
          ctx.fillStyle = '#ff80ab'; ctx.fillRect(-2, -30, 4, 3);
        }
      } else if (n.kind === 'mushroom_node') {
        const exM = assets.extraImages || {};
        const okM = (im) => im && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(im));
        const shKeys = ['mushroom_blue_anim', 'mushroom_green_anim', 'cave_mushroom_orange', 'cave_mushroom_brown'];
        const shImg = exM[shKeys[n.id % shKeys.length]];
        ctx.save();
        ctx.globalAlpha = 0.22 + Math.sin(this.time * 2.5 + n.id) * 0.07;
        ctx.fillStyle = (n.id % 2 === 0) ? '#80deea' : '#ce93d8';
        ctx.beginPath(); ctx.ellipse(0, 6, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (okM(shImg)) {
          if (shImg.width > shImg.height * 2) {
            const fw = shImg.height || 16;
            const frames = Math.max(1, Math.floor(shImg.width / fw));
            const fr = Math.floor((this.time * 5 + n.id) % frames);
            ctx.drawImage(shImg, fr * fw, 0, fw, shImg.height, -18, -24, 36, 36);
          } else {
            ctx.drawImage(shImg, -18, -24, 36, 36);
          }
        } else {
          ctx.fillStyle = '#ab47bc'; ctx.beginPath(); ctx.arc(0, -10, 14, Math.PI, 0); ctx.fill();
        }
      } else if (n.kind === 'volcanic_rock' || n.kind === 'meteor') {
        const exM = assets.extraImages || {};
        const okM = (im) => im && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(im));
        const mKeys = ['meteor_red', 'meteor_gold', 'meteor_blue', 'meteor_dark'];
        const mImg = n.kind === 'meteor'
          ? (exM[mKeys[n.id % mKeys.length]] || exM.meteor_red)
          : (exM.cave_rock_big || exM.meteor_dark);
        if (n.kind === 'meteor') {
          ctx.save();
          ctx.globalAlpha = 0.26 + Math.sin(this.time * 3.4 + n.id) * 0.1;
          ctx.fillStyle = ['#ff7043', '#ffd54f', '#4fc3f7', '#ce93d8'][n.id % 4];
          ctx.beginPath(); ctx.ellipse(0, 8, 22, 9, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.30)';
          ctx.beginPath(); ctx.ellipse(0, 10, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
        }
        if (okM(mImg)) {
          ctx.drawImage(mImg, -22, -26, 44, 44);
        } else {
          ctx.fillStyle = n.kind === 'meteor' ? '#4a148c' : '#3e2723';
          ctx.beginPath(); ctx.arc(0, -4, 18, 0, Math.PI * 2); ctx.fill();
        }
      } else if (n.kind === 'dig_spot') {
        const exM = assets.extraImages || {};
        const dImg = exM.dig_spot_x;
        if (dImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(dImg))) {
          ctx.drawImage(dImg, -15, -14, 30, 30);
        } else {
          ctx.fillStyle = 'rgba(72, 48, 28, 0.56)';
          ctx.beginPath(); ctx.ellipse(0, 4, 11, 5.5, 0, 0, Math.PI * 2); ctx.fill();
        }
        const glint = 0.35 + Math.sin(this.time * 4 + n.id) * 0.35;
        ctx.fillStyle = `rgba(255, 236, 179, ${glint.toFixed(2)})`;
        ctx.fillRect(6, -12, 3, 3);
      } else if (n.kind === 'fish_spot') {
        const exM = assets.extraImages || {};
        const fImg = exM.fish_ripple;
        const bobScale = 0.92 + Math.sin(this.time * 4 + n.id) * 0.10;
        if (fImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(fImg))) {
          ctx.save();
          ctx.globalAlpha = 0.72 + Math.sin(this.time * 4 + n.id) * 0.22;
          const sz = Math.round(34 * bobScale);
          ctx.drawImage(fImg, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        } else {
          const r = 10 + Math.sin(this.time * 4 + n.id) * 4;
          ctx.strokeStyle = '#e0f7fa'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        }
      } else if (n.kind === 'chest') {
        const biomeWood = n.biome === 'pradera' && (n.variant % 3 === 0);
        const biomeSkull = n.biome === 'bosque_oscuro' || n.biome === 'tierras_volcanicas';
        const cKey = (biomeSkull && (n.variant % 2 === 1)) ? 'skull_closed'
          : biomeWood ? 'wood_closed'
          : (n.variant % 2 === 0 ? 'gold_closed' : 'sapphire_closed');
        const cImg = assets.chestImages && (assets.chestImages[cKey] || assets.chestImages.gold_closed);
        ctx.fillStyle = 'rgba(0,0,0,0.34)';
        ctx.beginPath(); ctx.ellipse(0, 16, 36, 11, 0, 0, Math.PI * 2); ctx.fill();
        if (cImg) {
          ctx.drawImage(cImg, -48, -56, 96, 96);
        } else {
          ctx.fillStyle = '#8d5524'; ctx.fillRect(-38, -40, 76, 56);
          ctx.fillStyle = '#ffd54f'; ctx.fillRect(-38, -14, 76, 9);
        }
      } else if (n.kind === 'dungeon_gate') {
        const gImg = (assets.gateImages && assets.gateImages[n.dungeonId]) || assets.get('mine_active');
        const isCleared = this.clearedDungeons.includes(n.dungeonId);
        // Arcane aura ring around monumental crypt entrance
        const pulse = 0.24 + Math.sin(this.time * 3) * 0.08;
        ctx.fillStyle = isCleared
          ? `rgba(129, 199, 132, ${pulse})`
          : `rgba(255, 213, 79, ${pulse})`;
        ctx.beginPath();
        ctx.ellipse(0, 18, 92, 32, 0, 0, Math.PI * 2);
        ctx.fill();

        let dh = 216;
        if (gImg) {
          const aspect = gImg.width / Math.max(1, gImg.height);
          if (aspect > 1.3) dh = 186; // Edificios anchos como minas y castillos
          else if (aspect < 0.65) dh = 242; // Torres y monasterios altos
          if (n.dungeonId === 'tierras_volcanicas') dh = 236;
          const dw = Math.round(dh * aspect);
          ctx.drawImage(gImg, -dw / 2, 34 - dh, dw, dh);
        } else {
          ctx.fillStyle = '#37474f'; ctx.fillRect(-56, -86, 112, 108);
          dh = 122;
        }

        // Animated doorway portal shimmer (portal_anim 64x64, 4x2 cols/rows, 7 frames)
        const pImg = assets.extraImages && assets.extraImages.portal_anim;
        if (pImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(pImg))) {
          const fr = Math.floor((this.time * 7 + (n.id || 0)) % 7);
          const col = fr % 4;
          const row = Math.floor(fr / 4);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.42 + Math.sin(this.time * 4.2 + (n.id || 0)) * 0.12;
          ctx.drawImage(pImg, col * 64, row * 64, 64, 64, -30, -34, 60, 60);
          ctx.restore();
        }

        // Subtle proximity-only label (no clunky floating blue box)
        const dPlayer = this.player ? Math.hypot(this.player.x - n.x, this.player.y - n.y) : 999;
        if (dPlayer <= 205) {
          const gateTitle = (Balaclava.DUNGEON_DEFS && Balaclava.DUNGEON_DEFS[n.dungeonId] && Balaclava.DUNGEON_DEFS[n.dungeonId].name)
            || (Balaclava.DUNGEON_GATES && Balaclava.DUNGEON_GATES[n.dungeonId] && Balaclava.DUNGEON_GATES[n.dungeonId].name)
            || n.name;
          const fade = Math.max(0.25, Math.min(0.92, (205 - dPlayer) / 110));
          ctx.save();
          ctx.globalAlpha = fade;
          ctx.font = '12px BalaclavaBodyPixel, monospace';
          ctx.textAlign = 'center';
          const lblY = 34;
          ctx.fillStyle = 'rgba(5, 8, 16, 0.85)';
          ctx.fillText(gateTitle, 1, lblY + 1);
          ctx.fillStyle = isCleared ? '#a5d6a7' : '#e2e8f0';
          ctx.fillText(gateTitle, 0, lblY);
          ctx.restore();
        }
      } else if (n.kind === 'secret_chest') {
        const cImg = assets.chestImages && (assets.chestImages.sapphire_closed || assets.chestImages.gold_closed);
        const glint = 0.28 + Math.sin(this.time * 4.5 + n.id) * 0.14;
        ctx.fillStyle = 'rgba(0,0,0,0.36)';
        ctx.beginPath(); ctx.ellipse(0, 16, 40, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = n.puzzleLocked ? `rgba(179, 136, 255, ${glint})` : `rgba(255, 213, 79, ${glint + 0.08})`;
        ctx.beginPath(); ctx.ellipse(0, 14, 44, 15, 0, 0, Math.PI * 2); ctx.fill();
        if (cImg) {
          ctx.fillStyle = n.puzzleLocked ? 'rgba(179, 136, 255, 0.22)' : 'rgba(255, 213, 79, 0.25)';
          ctx.beginPath(); ctx.ellipse(0, -10, 42, 22, 0, 0, Math.PI * 2); ctx.fill();
          const cSrc = n.puzzleLocked
            ? this.getTintedSprite('sc_locked', cImg, 0, 0, cImg.width, cImg.height, { sat: 0.55, bright: 0.84, fallbackTint: 'rgba(130, 100, 195, 0.28)' })
            : cImg;
          ctx.drawImage(cSrc || cImg, -48, -56, 96, 96);
        } else {
          ctx.fillStyle = '#311b92'; ctx.fillRect(-38, -42, 76, 58);
          ctx.fillStyle = '#ffd54f'; ctx.fillRect(-38, -16, 76, 10);
        }
        const pillars = n.puzzleLocked ? this.world.nodes.filter(p => p.kind === 'puzzle_pillar' && p.secretIdx === n.secretIdx) : [];
        const pDone = pillars.filter(p => p.activated).length;
        const pReq = n.puzzleReq || pillars.length || 3;
        const lbl = n.puzzleLocked ? `Cofre Sellado (${pDone}/${pReq} Pilares)` : 'Cofre Secreto';
        ctx.font = '14px BalaclavaPixel, monospace';
        const lw = Math.max(138, Math.round(ctx.measureText(lbl).width + 20));
        const scLblY = -74;
        ctx.fillStyle = 'rgba(20, 12, 28, 0.92)';
        ctx.fillRect(Math.round(-lw / 2), scLblY, lw, 22);
        ctx.strokeStyle = n.puzzleLocked ? '#b388ff' : '#ffd54f';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(Math.round(-lw / 2), scLblY, lw, 22);
        ctx.fillStyle = n.puzzleLocked ? '#e1bee7' : '#ffe082';
        ctx.textAlign = 'center';
        ctx.fillText(lbl, 0, scLblY + 15);
      } else if (n.kind === 'puzzle_pillar') {
        const extraImgs = assets.extraImages || {};
        const pImg = extraImgs.prop_rune_pillar || (assets.get && assets.get('prop_rune_pillar'));
        const active = !!n.activated;
        ctx.fillStyle = active ? 'rgba(179, 136, 255, 0.34)' : 'rgba(0, 0, 0, 0.30)';
        ctx.beginPath(); ctx.ellipse(0, 14, active ? 28 : 20, 9, 0, 0, Math.PI * 2); ctx.fill();
        if (pImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(pImg) : true)) {
          if (active) {
            ctx.fillStyle = 'rgba(179, 136, 255, 0.26)';
            ctx.beginPath(); ctx.ellipse(0, -18, 22, 32, 0, 0, Math.PI * 2); ctx.fill();
          }
          const pOpts = active
            ? { bright: 1.25, sat: 1.6, fallbackTint: 'rgba(179, 136, 255, 0.28)' }
            : { sat: 0.45, bright: 0.85, fallbackTint: 'rgba(20, 26, 36, 0.35)' };
          const pSrc = this.getTintedSprite(active ? 'pp_on' : 'pp_off', pImg, 0, 0, pImg.width, pImg.height, pOpts);
          ctx.drawImage(pSrc || pImg, -22, -52, 44, 66);
        } else {
          ctx.fillStyle = active ? '#7c4dff' : '#455a64';
          ctx.fillRect(-12, -44, 24, 54);
          ctx.fillStyle = active ? '#e0f7fa' : '#90a4ae';
          ctx.fillRect(-6, -34, 12, 12);
        }
        ctx.font = '13px BalaclavaPixel, monospace';
        const lbl = active ? 'Pilar Activo' : 'Pilar Rúnico';
        const lw = Math.max(96, Math.round(ctx.measureText(lbl).width + 16));
        const pLblY = -76;
        ctx.fillStyle = 'rgba(18, 12, 26, 0.90)';
        ctx.fillRect(Math.round(-lw / 2), pLblY, lw, 20);
        ctx.strokeStyle = active ? '#b388ff' : '#78909c';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(Math.round(-lw / 2), pLblY, lw, 20);
        ctx.fillStyle = active ? '#e1bee7' : '#cfd8dc';
        ctx.textAlign = 'center';
        ctx.fillText(lbl, 0, pLblY + 14);
      } else if (n.kind === 'altar_shrine') {
        const extraImgs = assets.extraImages || {};
        const aDef = Balaclava.ALTAR_DEFS && Balaclava.ALTAR_DEFS[n.altarId];
        const aImg = aDef && extraImgs[aDef.spriteKey];
        const ready = !(n.cooldownLeft > 0);
        const pulse = ready ? (0.28 + Math.sin(this.time * 3.6 + n.id) * 0.1) : 0.10;
        ctx.fillStyle = ready ? (aDef ? aDef.color : '#80deea') : '#78909c';
        ctx.globalAlpha = pulse;
        ctx.beginPath(); ctx.ellipse(0, 10, 38, 15, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        if (aImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(aImg) : true)) {
          if (aDef.spriteKey === 'altar_ritual') {
            const fr = Math.floor(this.time * 6) % 6;
            ctx.drawImage(aImg, fr * 32, 0, 32, 16, -34, -22, 68, 34);
          } else if (aDef.spriteKey === 'healing_fountain' || aDef.spriteKey === 'altar_shrine') {
            const fr = Math.floor(this.time * 5) % 4;
            ctx.drawImage(aImg, fr * 32, 0, 32, 32, -32, -44, 64, 64);
          } else {
            ctx.drawImage(aImg, -32, -36, 64, 52);
          }
        }
        const altarLabel = ready ? (aDef ? aDef.name : 'Altar') : `${aDef ? aDef.name : 'Altar'} (${Math.ceil(n.cooldownLeft)}s)`;
        ctx.font = '14px BalaclavaPixel, monospace';
        const lw = Math.max(108, Math.round(ctx.measureText(altarLabel).width + 20));
        const lblY = -62;
        ctx.fillStyle = 'rgba(20, 14, 18, 0.90)';
        ctx.fillRect(Math.round(-lw / 2), lblY, lw, 20);
        ctx.strokeStyle = ready ? '#80deea' : '#78909c';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(Math.round(-lw / 2), lblY, lw, 20);
        ctx.fillStyle = ready ? '#e0f7fa' : '#b0bec5';
        ctx.textAlign = 'center';
        ctx.fillText(altarLabel, 0, lblY + 14);

        const showDesc = dist(this.mouse.wx, this.mouse.wy, n.x, n.y) <= 44 || dist(this.player.x, this.player.y, n.x, n.y) <= 84;
        if (showDesc && aDef && aDef.desc) {
          ctx.font = '13px BalaclavaPixel, monospace';
          const dw = Math.max(166, Math.round(ctx.measureText(aDef.desc).width + 26));
          const dy = lblY - 26;
          ctx.fillStyle = 'rgba(14, 22, 32, 0.93)';
          ctx.fillRect(Math.round(-dw / 2), dy, dw, 22);
          ctx.strokeStyle = aDef.color || '#ffd54f';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(Math.round(-dw / 2), dy, dw, 22);
          ctx.fillStyle = '#ffe082';
          ctx.fillText(aDef.desc, 0, dy + 15);
        }
      } else if (n.kind === 'easter_egg') {
        const extraImgs = assets.extraImages || {};
        const eDef = Balaclava.EASTER_EGG_DEFS && Balaclava.EASTER_EGG_DEFS[n.eeId];
        const bImg = eDef && extraImgs[eDef.baseSprite];
        const topImg = eDef && extraImgs[eDef.spriteKey];
        const activeGlow = !n.claimed ? (0.32 + Math.sin(this.time * 4 + n.id) * 0.12) : 0.12;
        ctx.fillStyle = eDef ? eDef.color : '#ffd54f';
        ctx.globalAlpha = activeGlow;
        ctx.beginPath(); ctx.ellipse(0, 8, 30, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        if (bImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(bImg) : true)) {
          if (eDef.baseSprite === 'ee_lantern' || eDef.baseSprite === 'ee_log') {
            ctx.drawImage(bImg, 0, 0, 32, 32, -22, -22, 44, 44);
          } else {
            ctx.drawImage(bImg, -22, -20, 44, 40);
          }
        }
        if (topImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(topImg) : true)) {
          if (eDef.spriteKey === 'ee_sword_legend') {
            ctx.save();
            ctx.translate(0, -14);
            ctx.rotate(Math.PI * 0.72);
            ctx.drawImage(topImg, -16, -16, 32, 32);
            ctx.restore();
          } else if (eDef.spriteKey === 'ee_crystal') {
            const fr = Math.floor(this.time * 6) % 5;
            ctx.drawImage(topImg, fr * 32, 0, 32, 32, -20, -34, 40, 40);
          } else if (eDef.spriteKey === 'ee_cauldron') {
            const fr = Math.floor(this.time * 6) % 4;
            ctx.drawImage(topImg, fr * 16, 0, 16, 16, -18, -28, 36, 36);
          } else if (eDef.spriteKey === 'ee_device') {
            const fr = Math.floor(this.time * 5) % 4;
            ctx.drawImage(topImg, fr * 32, 0, 32, 32, -22, -32, 44, 44);
          } else {
            ctx.drawImage(topImg, -20, -36, 40, 44);
          }
        }
        ctx.fillStyle = 'rgba(30, 18, 12, 0.9)';
        ctx.fillRect(-92, 16, 184, 21);
        ctx.strokeStyle = !n.claimed ? '#ffd54f' : '#8d6e63';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-92, 16, 184, 21);
        ctx.fillStyle = !n.claimed ? '#ffe082' : '#cfd8dc';
        ctx.font = '13px BalaclavaPixel, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(!n.claimed ? `${eDef ? eDef.name : 'Secreto'}` : 'Secreto Descubierto', 0, 31);
      } else if (n.kind === 'skeleton_king_shrine') {
        const extraImgs = assets.extraImages || {};
        const frameIdx = (Math.floor(this.time * 2.8) % 3) + 1;
        const skImg = extraImgs[n.state === 'awakened' ? (`giant_skeleton_${frameIdx}`) : 'giant_skeleton_1'];
        const skullPile = extraImgs.pile_skulls;
        const uCrystal = extraImgs.undead_crystal;
        const deadTree = extraImgs.undead_dead_tree;
        const skullDoor = extraImgs.skull_door;
        const totems = this.world.nodes.filter(t => t.kind === 'bone_totem');
        const litCount = totems.filter(t => t.lit).length;

        // Aura around the Crowned Skeleton King
        const pulse = n.state === 'claimed' ? 0.16 : (n.state === 'awakened' ? 0.42 + Math.sin(this.time * 5) * 0.12 : 0.24);
        ctx.fillStyle = n.state === 'claimed' ? '#ffd54f' : '#e040fb';
        ctx.globalAlpha = pulse;
        ctx.beginPath(); ctx.ellipse(0, 12, 54, 22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        if (skullDoor && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(skullDoor) : true)) {
          ctx.drawImage(skullDoor, -30, -86, 60, 62);
        }
        if (deadTree && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(deadTree) : true)) {
          ctx.drawImage(deadTree, -68, -62, 42, 64);
          ctx.drawImage(deadTree, 28, -58, 38, 60);
        }
        if (uCrystal && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(uCrystal) : true)) {
          ctx.drawImage(uCrystal, -52, -16, 26, 30);
          ctx.drawImage(uCrystal, 28, -14, 26, 30);
        }
        if (skullPile && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(skullPile) : true)) {
          ctx.drawImage(skullPile, -34, 4, 28, 22);
          ctx.drawImage(skullPile, 10, 5, 28, 22);
        }
        if (skImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(skImg) : true)) {
          ctx.drawImage(skImg, -40, -74, 80, 82);
        }
        const kLbl = n.state === 'claimed' ? 'Rey Esqueleto Bendecido'
          : (litCount >= totems.length && totems.length >= 3 ? 'Rey Esqueleto ¡Pulsa para Reclamar!' : `Rey Esqueleto (${litCount}/${totems.length || 3} Tótems)`);
        ctx.font = '13px BalaclavaPixel, monospace';
        const kw = Math.max(150, Math.ceil(ctx.measureText(kLbl).width) + 20);
        ctx.fillStyle = 'rgba(24, 12, 34, 0.92)';
        ctx.fillRect(Math.round(-kw / 2), -104, kw, 20);
        ctx.strokeStyle = n.state === 'awakened' ? '#ffd54f' : '#ba68c8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(Math.round(-kw / 2), -104, kw, 20);
        ctx.fillStyle = n.state === 'awakened' ? '#ffe082' : '#e1bee7';
        ctx.textAlign = 'center';
        ctx.fillText(kLbl, 0, -90);
      } else if (n.kind === 'bone_totem') {
        const extraImgs = assets.extraImages || {};
        const uImg = n.lit ? (extraImgs.undead_crystal || extraImgs.undead_grave) : (extraImgs.undead_grave || extraImgs.undead_dead_arm);
        const aura = n.lit ? (0.36 + Math.sin(this.time * 6 + n.id) * 0.1) : 0.12;
        ctx.fillStyle = n.lit ? '#e040fb' : '#78909c';
        ctx.globalAlpha = aura;
        ctx.beginPath(); ctx.ellipse(0, 8, 24, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        if (uImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(uImg) : true)) {
          ctx.drawImage(uImg, -18, -32, 36, 40);
        }
        if (n.lit && extraImgs.fire_brazier && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(extraImgs.fire_brazier) : true)) {
          ctx.drawImage(extraImgs.fire_brazier, -12, -46, 24, 24);
        }
        const tLbl = n.lit ? 'Tótem Óseo Encendido' : 'Encender Tótem Óseo';
        ctx.font = '13px BalaclavaPixel, monospace';
        const tw = Math.max(132, Math.ceil(ctx.measureText(tLbl).width) + 18);
        ctx.fillStyle = 'rgba(20, 12, 28, 0.9)';
        ctx.fillRect(Math.round(-tw / 2), -58, tw, 19);
        ctx.strokeStyle = n.lit ? '#ea80fc' : '#90a4ae';
        ctx.strokeRect(Math.round(-tw / 2), -58, tw, 19);
        ctx.fillStyle = n.lit ? '#f3e5f5' : '#cfd8dc';
        ctx.textAlign = 'center';
        ctx.fillText(tLbl, 0, -44);
      } else if (n.kind === 'ruin_pillar') {
        const props = assets.get('props');
        if (props) ctx.drawImage(props, 352, 175, 36, 80, -16, -44, 32, 64);
      }

      // Health bar if damaged
      if (n.hp < n.maxHp && n.maxHp > 0 && n.kind !== 'dungeon_gate' && n.kind !== 'altar_shrine' && n.kind !== 'easter_egg' && n.kind !== 'secret_chest' && n.kind !== 'puzzle_pillar' && n.kind !== 'skeleton_king_shrine' && n.kind !== 'bone_totem') {
        const barY = (n.kind === 'giant_tree') ? -92 : (n.kind === 'tree') ? -72 : (n.kind === 'meteor') ? -44 : -34;
        ctx.fillStyle = '#1b1118';
        ctx.fillRect(-17, barY, 34, 6);
        ctx.fillStyle = '#81c784';
        ctx.fillRect(-16, barY + 1, 32 * Math.max(0, n.hp / n.maxHp), 4);
      }
      ctx.restore();
    }

    drawBuilding(ctx, b, def) {
      const assets = Balaclava.Assets;
      const px = b.tx * TILE_SIZE;
      const py = b.ty * TILE_SIZE;
      const w = def.size * TILE_SIZE;
      const h = def.size * TILE_SIZE;
      const cx = px + w / 2;
      const cy = py + h / 2;

      const bImg = assets.getBuildingImg(def.sprite);
      const exImg = assets.extraImages && assets.extraImages[def.sprite];
      const isFlushTile = ['Bridge_Tile', 'Fish_Pond', 'Corral_Pen', 'Plot_Garden'].includes(def.sprite);
      if (def.isChest || b.isChest) {
        const cKey = def.chestSpriteKey || 'wood';
        const isOpen = Boolean(b.isOpen || this.activeChestBuilding === b);
        const spriteId = isOpen ? `${cKey}_open` : `${cKey}_closed`;
        const cImg = assets.chestImages && (assets.chestImages[spriteId] || assets.chestImages[`${cKey}_closed`]);
        if (cImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(cImg))) {
          ctx.fillStyle = 'rgba(0,0,0,0.32)';
          ctx.beginPath();
          ctx.ellipse(cx, py + h - 2, Math.round(w * 0.48), Math.round(h * 0.16), 0, 0, Math.PI * 2);
          ctx.fill();

          const bounce = isOpen ? -3 : 0;
          const dw = Math.round(w * 1.08);
          const dh = Math.round(dw * (cImg.height / Math.max(1, cImg.width)));
          ctx.drawImage(cImg, cx - dw / 2, py + h - dh + 2 + bounce, dw, dh);
          return;
        }
      }
      if (def.sprite === 'Campfire_Anim') {
        ctx.fillStyle = 'rgba(255, 160, 64, 0.26)';
        ctx.beginPath(); ctx.arc(cx, cy + 4, 30 + Math.sin(this.time * 8) * 3, 0, Math.PI * 2); ctx.fill();
        const cf = assets.extraImages && assets.extraImages.campfireAnim;
        if (cf) {
          const fw = 16;
          const frames = Math.max(1, Math.floor(cf.width / fw));
          const fr = Math.floor((this.time * 8 + b.id) % frames);
          ctx.drawImage(cf, fr * fw, 0, fw, cf.height, cx - 27, cy - 32, 54, 54);
        } else {
          ctx.fillStyle = '#ef6c00'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
        }
      } else if (exImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(exImg))) {
        const baseScale = def.size === 1 ? 1.42 : 1.28;
        const vScale = Math.max(baseScale, def.visualScale ? def.visualScale * (def.size === 1 ? 1.32 : 1.22) : baseScale);
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.beginPath(); ctx.ellipse(cx, py + h - 2, Math.round(w * (def.size === 1 ? 0.56 : 0.50)), Math.round(h * 0.15), 0, 0, Math.PI * 2); ctx.fill();
        if (def.sprite === 'well_health_strip' || def.sprite === 'well_mana_strip') {
          const fw = 32, fh = 64;
          const frames = Math.max(1, Math.floor(exImg.width / fw));
          const fr = Math.floor((this.time * 5 + b.id) % frames);
          const dw = Math.round(w * 0.98);
          const dh = Math.round(dw * (fh / fw));
          ctx.drawImage(exImg, fr * fw, 0, fw, fh, cx - dw / 2, py + h - dh + 4, dw, dh);
        } else if (def.sprite === 'waypoint_white_strip' || def.sprite === 'waypoint_dark_strip') {
          const fw = exImg.height || 128, fh = exImg.height || 128;
          const frames = Math.max(1, Math.floor(exImg.width / fw));
          const fr = Math.floor((this.time * 6 + b.id) % frames);
          const dw = Math.round(w * 1.24);
          ctx.drawImage(exImg, fr * fw, 0, fw, fh, cx - dw / 2, py + h - dw + 4, dw, dw);
        } else {
          const dw = Math.round(w * vScale);
          const rawH = Math.round(dw * (exImg.height / Math.max(1, exImg.width)));
          const dh = Math.min(rawH, Math.round(h * (def.size === 1 ? 1.72 : 1.54)));
          const dy = isFlushTile ? (cy - dh / 2) : (py + h - dh + (def.size === 1 ? 6 : 8));
          ctx.drawImage(exImg, cx - dw / 2, dy, dw, dh);
        }
      } else if (bImg) {
        ctx.fillStyle = 'rgba(0,0,0,0.26)';
        ctx.beginPath(); ctx.ellipse(cx, py + h - 2, Math.round(w * 0.52), Math.round(h * 0.14), 0, 0, Math.PI * 2); ctx.fill();
        const dw = Math.round(w * (def.size === 1 ? 1.38 : 1.26));
        const maxH = def.size === 1 ? Math.round(h * 1.66) : Math.round(h * 1.50);
        const dh = Math.min(maxH, Math.round(dw * (bImg.height / Math.max(1, bImg.width))));
        ctx.drawImage(bImg, cx - dw / 2, py + h - dh + 6, dw, dh);
      } else if (def.sprite === 'Portal_Stone') {
        const props = assets.get('props');
        if (props) ctx.drawImage(props, 350, 260, 100, 74, px - 12, py - 14, w + 24, h + 24);
        ctx.strokeStyle = '#80d8ff';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, 18 + Math.sin(this.time * 4) * 3, 0, Math.PI * 2); ctx.stroke();
      } else if (def.sprite === 'Altar_Stone' || def.sprite === 'Monument_Statue') {
        const props = assets.get('props');
        if (props) {
          const sx = def.sprite === 'Monument_Statue' ? 442 : 284;
          const sy = def.sprite === 'Monument_Statue' ? 16 : 292;
          ctx.drawImage(props, sx, sy, 48, 86, px - 6, py - 38, w + 12, h + 42);
        }
      } else if (def.sprite === 'Corral_Pen') {
        const cpImg = assets.extraImages && assets.extraImages.corral_pen;
        if (cpImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(cpImg))) {
          ctx.drawImage(cpImg, px, py, w, h);
        } else {
          ctx.strokeStyle = '#8d5524'; ctx.lineWidth = 4;
          ctx.strokeRect(px + 6, py + 6, w - 12, h - 12);
        }
        const sh = assets.get('sheep_idle');
        if (sh) ctx.drawImage(sh, 0, 0, 128, 128, cx - 26, cy - 26, 52, 52);
      } else if (def.sprite === 'Fish_Pond') {
        const fpImg = assets.extraImages && assets.extraImages.fish_pond;
        if (fpImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(fpImg))) {
          ctx.drawImage(fpImg, px, py, w, h);
        } else {
          ctx.fillStyle = '#0288d1';
          ctx.fillRect(px + 4, py + 4, w - 8, h - 8);
        }
        const frImg = assets.extraImages && assets.extraImages.fish_ripple;
        if (frImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(frImg))) {
          ctx.save();
          ctx.globalAlpha = 0.6 + Math.sin(this.time * 3.5 + b.id) * 0.25;
          ctx.drawImage(frImg, cx - 14, cy - 14, 28, 28);
          ctx.restore();
        }
      } else if (def.sprite === 'Bridge_Tile') {
        const brImg = assets.get('bridge');
        if (brImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(brImg))) {
          const hasH = this.getBuildingAtTile(b.tx - 1, b.ty)?.type === b.type || this.getBuildingAtTile(b.tx + 1, b.ty)?.type === b.type;
          const hasV = this.getBuildingAtTile(b.tx, b.ty - 1)?.type === b.type || this.getBuildingAtTile(b.tx, b.ty + 1)?.type === b.type;
          const useVert = hasV && !hasH;
          ctx.drawImage(brImg, useVert ? 0 : 64, useVert ? 128 : 0, 64, 64, px - 2, py - 2, w + 4, h + 4);
        } else {
          ctx.fillStyle = '#8d6e63'; ctx.fillRect(px + 2, py + 4, w - 4, h - 8);
          ctx.fillStyle = '#5d4037'; ctx.fillRect(px + 2, py + h - 8, w - 4, 4);
        }
      } else {
        // Plot_Garden
        const gpImg = assets.extraImages && assets.extraImages.garden_plot;
        if (gpImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(gpImg))) {
          ctx.drawImage(gpImg, px, py, w, h);
        } else {
          ctx.fillStyle = '#5d4037'; ctx.fillRect(px + 4, py + 4, w - 8, h - 8);
        }
      }

      // Level pips only (removed cluttered yellow ! badge)
      if (b.level > 1) {
        const pCount = Math.min(5, b.level);
        const pw = pCount * 7;
        for (let pi = 0; pi < pCount; pi++) {
          ctx.fillStyle = '#1b1118';
          ctx.fillRect(cx - pw / 2 + pi * 7 - 1, py - 9, 6, 6);
          ctx.fillStyle = '#ffd54f';
          ctx.fillRect(cx - pw / 2 + pi * 7, py - 8, 4, 4);
        }
      }
      if (b.noFuel) {
        ctx.fillStyle = '#ef5350';
        ctx.font = '13px BalaclavaPixel, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Sin Carbón', cx, py - 6);
      }
      ctx.textAlign = 'left';
    }

    drawSheep(ctx, s) {
      const assets = Balaclava.Assets;
      const ex = assets.extraImages || {};
      const kind = s.kind || s.species || 'sheep';
      const moving = Math.abs(s.vx || 0) + Math.abs(s.vy || 0) > 1;
      const faceLeft = (s.facing || 1) < 0 || (s.vx || 0) < -1;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      ctx.beginPath();
      ctx.ellipse(0, 12, kind === 'vaca' ? 18 : kind === 'conejo' || kind === 'pato' ? 10 : 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      const okAn = (im) => im && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(im));
      const drawSheet3x2 = (img, dw, dh, hopY = 0) => {
        const cols = 3;
        const rows = Math.max(1, Math.floor(img.height / 32));
        const col = Math.floor((this.time * (moving ? 7 : 3) + s.id) % cols);
        const row = (moving && rows > 1) ? 1 : 0;
        ctx.save();
        if (faceLeft) ctx.scale(-1, 1);
        ctx.drawImage(img, col * 32, row * 32, 32, 32, -dw / 2, -dh + 15 - hopY, dw, dh);
        ctx.restore();
      };

      if (kind === 'sheep') {
        const sh = assets.get(moving ? 'sheep_move' : 'sheep_idle');
        if (sh) {
          const fr = Math.floor((this.time * 6 + s.id) % 4);
          ctx.save();
          if (faceLeft) ctx.scale(-1, 1);
          ctx.drawImage(sh, fr * 128, 0, 128, 128, -38, -42, 76, 76);
          ctx.restore();
        }
      } else if (kind === 'pato') {
        const hop = moving ? Math.abs(Math.sin(this.time * 10 + s.id)) * 3 : 0;
        if (okAn(ex.duck_sheet)) {
          drawSheet3x2(ex.duck_sheet, 34, 34, hop);
        } else if (okAn(ex.rubber_duck)) {
          const fr = Math.floor((this.time * 6 + s.id) % 3);
          ctx.save();
          if (faceLeft) ctx.scale(-1, 1);
          ctx.drawImage(ex.rubber_duck, fr * 32, 0, 32, 32, -19, -24 - hop, 38, 38);
          ctx.restore();
        }
      } else if (kind === 'vaca') {
        if (okAn(ex.cow_sheet)) {
          drawSheet3x2(ex.cow_sheet, 46, 46, 0);
        }
      } else if (kind === 'cerdo') {
        if (okAn(ex.pig_sheet)) {
          drawSheet3x2(ex.pig_sheet, 40, 40, 0);
        }
      } else if (kind === 'conejo') {
        const hop = moving ? Math.abs(Math.sin(this.time * 12 + s.id)) * 5 : 0;
        if (okAn(ex.rabbit_sheet)) {
          drawSheet3x2(ex.rabbit_sheet, 32, 32, hop);
        }
      }

      if (s.maxHp && s.hp < s.maxHp) {
        ctx.fillStyle = '#1b1118';
        ctx.fillRect(-14, -34, 28, 4);
        ctx.fillStyle = '#ef5350';
        ctx.fillRect(-13, -33, 26 * Math.max(0, s.hp / s.maxHp), 2);
      }
      ctx.restore();
    }

    drawNpc(ctx, npc, x, y) {
      const assets = Balaclava.Assets;
      const sheet = assets.npcSheets && assets.npcSheets[npc.id];
      const img = assets.get(npc.spriteKey);
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath(); ctx.ellipse(0, 12, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();
      if (sheet) {
        const fw = Math.round(sheet.width / 6) || 16;
        const fh = Math.round(sheet.height / 4) || 32;
        const fr = Math.floor(this.time * 4) % 4;
        ctx.drawImage(sheet, fr * fw, 0, fw, fh, -20, -52, 40, 68);
      } else if (img) {
        const fr = Math.floor(this.time * 4) % 4;
        ctx.drawImage(img, fr * 48, 0, 48, 48, -24, -34, 48, 48);
      } else {
        ctx.fillStyle = '#ab47bc'; ctx.fillRect(-12, -26, 24, 30);
      }
      const nameY = sheet ? -44 : -30;
      const label = npc.name.split(' ')[0];
      ctx.font = '13.5px BalaclavaPixel, monospace';
      ctx.textAlign = 'center';
      ctx.lineWidth = 2.8;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(10, 12, 18, 0.72)';
      ctx.strokeText(label, 0, nameY);
      ctx.fillStyle = 'rgba(248, 250, 255, 0.94)';
      ctx.fillText(label, 0, nameY);
      ctx.restore();
    }

    drawEnemy(ctx, e) {
      if (!e || !Number.isFinite(e.x) || !Number.isFinite(e.y)) return;
      try {
      const assets = Balaclava.Assets;
      ctx.save();
      ctx.translate(e.x, e.y);

      // 1. Advertencia / Telegraph en el suelo antes de embestir, saltar, excavar, lanzar bombas, rayos o ráfagas
      if (e.state === 'windup' || (e.telegraph > 0 && (e.telegraphMode === 'dash_strike' || e.telegraphMode === 'dash_combo' || e.telegraphMode === 'miniboss_dash' || e.telegraphMode === 'aimed_volley' || e.telegraphMode === 'miniboss_fan' || e.telegraphMode === 'leap_slam' || e.telegraphMode === 'miniboss_leap' || e.telegraphMode === 'pillar_ring'))) {
        ctx.save();
        if (e.attackKind === 'charge' || e.attackKind === 'dash' || e.attackKind === 'swoop' || e.telegraphMode === 'dash_strike' || e.telegraphMode === 'dash_combo' || e.telegraphMode === 'miniboss_dash') {
          const dAng = e.targetAngle !== undefined ? e.targetAngle : (e.facing >= 0 ? 0 : Math.PI);
          const lineLen = e.isBoss ? 155 : e.isMiniBoss ? 125 : 100;
          ctx.rotate(dAng);
          ctx.strokeStyle = e.isBoss ? 'rgba(255, 167, 38, 0.92)' : 'rgba(255, 82, 82, 0.88)';
          ctx.lineWidth = e.isBoss ? 4.5 : 3;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(lineLen, 0);
          ctx.stroke();
          ctx.fillStyle = e.isBoss ? '#ffa726' : '#ff5252';
          ctx.beginPath();
          ctx.moveTo(lineLen, -7); ctx.lineTo(lineLen + 14, 0); ctx.lineTo(lineLen, 7);
          ctx.fill();
        } else if (e.attackKind === 'beam') {
          const dAng = e.beamAngle !== undefined ? e.beamAngle : (e.targetAngle !== undefined ? e.targetAngle : 0);
          const prog = clamp(e._beamProgress || 0.35, 0, 1);
          ctx.rotate(dAng);
          ctx.strokeStyle = `rgba(128, 216, 255, ${(0.28 + 0.55 * prog).toFixed(2)})`;
          ctx.lineWidth = Math.max(3, 18 * (1 - prog * 0.65));
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(250, 0);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5 + prog * 2.5;
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(250, 0);
          ctx.stroke();
        } else if ((e.attackKind === 'leap' || e.attackKind === 'bomb' || e.telegraphMode === 'leap_slam' || e.telegraphMode === 'miniboss_leap') && e.targetX !== undefined) {
          const relX = e.targetX - e.x;
          const relY = e.targetY - e.y;
          const rad = e.telegraphMode === 'leap_slam' ? 115 : e.telegraphMode === 'miniboss_leap' ? 82 : 52;
          ctx.fillStyle = e.attackKind === 'bomb' ? 'rgba(255, 112, 67, 0.22)' : 'rgba(255, 82, 82, 0.20)';
          ctx.beginPath();
          ctx.arc(relX, relY, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 112, 67, 0.92)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([7, 4]);
          ctx.beginPath();
          ctx.arc(relX, relY, rad, 0, Math.PI * 2);
          ctx.stroke();
        } else if (e.attackKind === 'burrow' || e.attackKind === 'spore' || e.attackKind === 'cleave' || e.attackKind === 'miniboss_pillars' || e.telegraphMode === 'pillar_ring') {
          const rad = e.attackKind === 'spore' ? 68 : e.attackKind === 'cleave' ? 56 : e.telegraphMode === 'pillar_ring' ? 92 : 40;
          ctx.fillStyle = e.attackKind === 'spore' ? 'rgba(139, 195, 74, 0.18)' : 'rgba(255, 183, 77, 0.16)';
          ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = e.attackKind === 'spore' ? 'rgba(156, 204, 101, 0.9)' : 'rgba(255, 183, 77, 0.9)';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.stroke();
        } else if (e.attackKind === 'miniboss_fan' || e.telegraphMode === 'aimed_volley' || e.telegraphMode === 'miniboss_fan') {
          const dAng = e.targetAngle !== undefined ? e.targetAngle : 0;
          ctx.strokeStyle = 'rgba(255, 213, 79, 0.72)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          for (let k = -2; k <= 2; k++) {
            const a = dAng + k * 0.22;
            ctx.beginPath();
            ctx.moveTo(12 * Math.cos(a), 12 * Math.sin(a));
            ctx.lineTo(130 * Math.cos(a), 130 * Math.sin(a));
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      if (e._burrowed && e.state === 'burrow') {
        const pulse = 1 + Math.sin(this.time * 24 + (e.id || 0)) * 0.12;
        ctx.fillStyle = 'rgba(109, 76, 65, 0.85)';
        ctx.beginPath(); ctx.ellipse(0, 6, 17 * pulse, 9 * pulse, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a1887f';
        ctx.beginPath(); ctx.ellipse(-5, 3, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(6, 4, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 183, 77, 0.72)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.ellipse(0, 6, 26, 14, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        return;
      }

      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath(); ctx.ellipse(0, 12, e.isBoss ? 28 : 14, e.isBoss ? 9 : 5, 0, 0, Math.PI * 2); ctx.fill();

      // 2. Anclaje exacto al suelo según padding transparente real de cada spritesheet
      const idSeed = typeof e.id === 'number' && Number.isFinite(e.id) ? e.id : (Number.isFinite(e.seed) ? e.seed : 0);
      const isMoving = Math.abs(e.animVx || 0) > 3 || Math.abs(e.animVy || 0) > 3;
      const isFlying = /^(bat|vampire_bat|plague_bat|wisp|wisp_green|floating_eye|ghastly_eye|flaming_skull|ghost|ghost_spectral)$/i.test(e.type || '')
        || /^boss_(montanas_heladas|tierras_volcanicas|volcan_caldera)$/i.test(e.type || '');
      const footPads = Balaclava.ENEMY_FOOT_PADS || {};
      const groundAnchorY = isFlying ? 4 : 12;
      let squashX = 1.0;
      let squashY = 1.0;
      let hopY = 0;
      let walkTilt = 0;

      if (e.state === 'windup') {
        squashX = 1.25; squashY = 0.8;
        ctx.translate(Math.sin(this.time * 48 + idSeed) * 2, 0);
      } else if (e.state === 'dash') {
        squashX = 1.32; squashY = 0.84;
      } else if (e.state === 'leap') {
        const lp = e.leapProg || 0;
        const arc = Math.sin(lp * Math.PI);
        hopY = -arc * 28;
        squashX = 0.85 + (1 - arc) * 0.28;
        squashY = 1.25 - (1 - arc) * 0.45;
      } else if (isMoving) {
        const cycle = Math.sin(this.time * 8.5 + idSeed);
        squashX = 1 + cycle * 0.06;
        squashY = 1 - cycle * 0.06;
        if (isFlying) hopY = -Math.abs(cycle) * 3.5 - 4;
        else walkTilt = cycle * 0.045;
      } else {
        const breathe = Math.sin(this.time * 3.5 + idSeed);
        squashX = 1 + breathe * 0.035;
        squashY = 1 - breathe * 0.035;
        if (isFlying) hopY = -4 + breathe * 2;
      }

      ctx.save();
      ctx.translate(0, groundAnchorY + hopY);
      if (walkTilt) ctx.rotate(walkTilt);
      ctx.scale(squashX, squashY);

      let spriteDrawn = false;
      let barY = e.isBoss ? -78 : -34;

      if (e.isBoss) {
        const bossBiome = (e.type || '').replace(/^boss_/, '');
        const bMeta = Balaclava.BOSS_SPRITE_PATHS && Balaclava.BOSS_SPRITE_PATHS[bossBiome];
        const bImg = assets.bossImages && assets.bossImages[bossBiome];
        if (bMeta && bImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(bImg) : true)) {
          const frames = Math.max(1, bMeta.frames || 1);
          const fr = frames > 1 ? Math.abs(Math.floor(this.time * 6 + idSeed)) % frames : 0;
          const sx = bMeta.sx !== undefined ? bMeta.sx : (fr * bMeta.fw);
          const sy = bMeta.sy || 0;
          const sw = bMeta.sw || bMeta.fw;
          const sh = bMeta.sh || bMeta.fh;
          const dw = Math.round(sw * bMeta.scale);
          const dh = Math.round(sh * bMeta.scale);
          const bPad = isFlying ? 0 : (footPads['boss_' + bossBiome] || 0);
          const drawY = -dh + Math.round(dh * bPad) + 2;
          barY = groundAnchorY + drawY - 8;
          ctx.save();
          if (e.facing < 0) ctx.scale(-1, 1);
          if (e.hitFlash > 0) this.drawFlashSprite(ctx, bImg, sx, sy, sw, sh, -dw / 2, drawY, dw, dh);
          else ctx.drawImage(bImg, sx, sy, sw, sh, -dw / 2, drawY, dw, dh);
          ctx.restore();
          spriteDrawn = true;
        }
      } else {
        const exImgs = assets.extraImages || {};
        const mbKey = e.isMiniBoss
          ? ((e.ranged || /mage|shaman|necro|warlock|witch|eye|psychic/i.test(e.type || ''))
            ? 'miniboss_mage'
            : (/golem|brute|orc|guardian|giant|mace|troll/i.test(e.type || '') || (Math.abs(idSeed) % 2 === 1))
              ? 'miniboss_mace'
              : 'miniboss_sword')
          : null;
        const mbImg = mbKey ? exImgs[mbKey] : null;
        if (mbImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(mbImg) : mbImg.complete && mbImg.naturalWidth > 0)) {
          const fw = mbKey === 'miniboss_mage' ? 45 : mbKey === 'miniboss_mace' ? 54 : 59;
          const fh = mbImg.height || (mbKey === 'miniboss_mage' ? 52 : mbKey === 'miniboss_mace' ? 47 : 42);
          const maxFr = Math.max(1, Math.min(4, Math.floor(mbImg.width / fw)));
          const fr = Math.abs(Math.floor(this.time * 7 + idSeed)) % maxFr;
          const mult = 1.32;
          const dw = Math.round(fw * mult);
          const dh = Math.round(fh * mult);
          const mbPad = footPads[mbKey] || 0;
          const drawY = -dh + Math.round(dh * mbPad) + 1;
          barY = groundAnchorY + drawY - 8;
          ctx.fillStyle = 'rgba(255, 213, 79, 0.26)';
          ctx.beginPath(); ctx.ellipse(0, 0, 28, 9, 0, 0, Math.PI * 2); ctx.fill();
          ctx.save();
          if (e.facing < 0) ctx.scale(-1, 1);
          if (e.hitFlash > 0) this.drawFlashSprite(ctx, mbImg, fr * fw, 0, fw, fh, -dw / 2, drawY, dw, dh);
          else ctx.drawImage(mbImg, fr * fw, 0, fw, fh, -dw / 2, drawY, dw, dh);
          ctx.restore();
          spriteDrawn = true;
        }
        const meta = !spriteDrawn && Balaclava.ENEMY_SPRITE_PATHS && Balaclava.ENEMY_SPRITE_PATHS[e.type];
        const eImg = !spriteDrawn && assets.enemyImages && assets.enemyImages[e.type];
        if (meta && eImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(eImg) : eImg.complete && eImg.naturalWidth > 0)) {
          const sizeMult = e.isMiniBoss ? 1.38 : 1.0;
          const ePad = isFlying ? 0 : (footPads[e.type] || 0);
          if (e.isMiniBoss) {
            ctx.fillStyle = 'rgba(255, 213, 79, 0.22)';
            ctx.beginPath(); ctx.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
          }
          ctx.save();
          const useGoldTint = !(e.hitFlash > 0) && !!meta.goldGlow;

          if (meta.kind === 'sheet6x4') {
            const avx = e.animVx || 0;
            const avy = e.animVy || 0;
            let row = 0;
            if (Math.abs(avx) > Math.abs(avy)) row = avx >= 0 ? 2 : 3;
            else if (avy < -2) row = 1;
            const fr = Math.abs(Math.floor(this.time * 6 + idSeed)) % 4;
            const mult = meta.scale * 1.18 * sizeMult;
            const dw = Math.round(meta.fw * mult);
            const dh = Math.round(meta.fh * mult);
            const drawY = -dh + Math.round(dh * ePad) + 1;
            barY = groundAnchorY + drawY - 7;
            if (e.hitFlash > 0) {
              this.drawFlashSprite(ctx, eImg, fr * meta.fw, row * meta.fh, meta.fw, meta.fh, -dw / 2, drawY, dw, dh);
            } else if (useGoldTint) {
              const gSrc = this.getTintedSprite(`gold_${e.type}_sheet`, eImg, 0, 0, eImg.width, eImg.height, { sepia: 1, sat: 2.3, hue: 10, bright: 1.25, fallbackTint: 'rgba(255,205,60,0.42)' });
              if (gSrc) ctx.drawImage(gSrc, fr * meta.fw, row * meta.fh, meta.fw, meta.fh, -dw / 2, drawY, dw, dh);
              else ctx.drawImage(eImg, fr * meta.fw, row * meta.fh, meta.fw, meta.fh, -dw / 2, drawY, dw, dh);
            } else {
              ctx.drawImage(eImg, fr * meta.fw, row * meta.fh, meta.fw, meta.fh, -dw / 2, drawY, dw, dh);
            }
          } else {
            const maxFr = Math.max(1, Math.min(4, Math.floor(eImg.width / meta.fw)));
            const fr = Math.abs(Math.floor(this.time * 7 + idSeed)) % maxFr;
            const dw = Math.round(meta.fw * meta.scale * sizeMult);
            const dh = Math.round(meta.fh * meta.scale * sizeMult);
            const drawY = -dh + Math.round(dh * ePad) + 1;
            barY = groundAnchorY + drawY - 7;
            if (e.facing < 0) ctx.scale(-1, 1);
            if (e.hitFlash > 0) {
              this.drawFlashSprite(ctx, eImg, fr * meta.fw, 0, meta.fw, meta.fh, -dw / 2, drawY, dw, dh);
            } else if (useGoldTint) {
              const gSrc = this.getTintedSprite(`gold_${e.type}_sheet`, eImg, 0, 0, eImg.width, eImg.height, { sepia: 1, sat: 2.3, hue: 10, bright: 1.25, fallbackTint: 'rgba(255,205,60,0.42)' });
              if (gSrc) ctx.drawImage(gSrc, fr * meta.fw, 0, meta.fw, meta.fh, -dw / 2, drawY, dw, dh);
              else ctx.drawImage(eImg, fr * meta.fw, 0, meta.fw, meta.fh, -dw / 2, drawY, dw, dh);
            } else {
              ctx.drawImage(eImg, fr * meta.fw, 0, meta.fw, meta.fh, -dw / 2, drawY, dw, dh);
            }
          }
          ctx.restore();
          spriteDrawn = true;
        }
      }

      if (!spriteDrawn) {
        if (e.sprite && assets.get(e.sprite)) {
          const img = assets.get(e.sprite);
          const fr = Math.floor(this.time * 8) % 6;
          ctx.save();
          if (e.facing < 0) ctx.scale(-1, 1);
          if (e.hitFlash > 0) this.drawFlashSprite(ctx, img, fr * 192, 0, 192, 192, -46, -68, 92, 92);
          else ctx.drawImage(img, fr * 192, 0, 192, 192, -46, -68, 92, 92);
          ctx.restore();
        } else {
          const r = e.isBoss ? 24 : 14;
          ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : (e.color || '#ef5350');
          ctx.beginPath(); ctx.arc(0, -r + 2, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#1a1118'; ctx.lineWidth = 3; ctx.stroke();
        }
      }
      ctx.restore();

      if (e.isBoss && (e.phase || 1) >= 2) {
        ctx.save();
        ctx.strokeStyle = e.phase === 3 ? 'rgba(255, 82, 82, 0.72)' : 'rgba(255, 193, 7, 0.64)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 4, 34 + Math.sin(this.time * 7) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      if (e.telegraph > 0) {
        const mode = e.telegraphMode || 'barrage';
        const rad = mode === 'slam' ? (e.phase === 3 ? 156 : e.phase === 2 ? 136 : 120)
          : mode === 'meteor_rain' ? 84
          : mode === 'cross_fissure' ? 76
          : mode === 'leap_slam' ? 68
          : (mode === 'dash_strike' || mode === 'dash_combo' || mode === 'miniboss_dash') ? 58
          : 48;
        const isAmber = mode === 'dash_strike' || mode === 'dash_combo' || mode === 'meteor_rain' || mode === 'aimed_volley' || mode === 'miniboss_fan' || mode === 'miniboss_dash';
        ctx.save();
        ctx.strokeStyle = isAmber ? 'rgba(255, 183, 77, 0.94)' : 'rgba(255, 82, 82, 0.90)';
        ctx.lineWidth = e.isBoss ? 3.5 : 2.5;
        ctx.setLineDash(mode === 'cross_fissure' ? [8, 4] : []);
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.stroke();
        if (mode === 'slam') {
          ctx.fillStyle = 'rgba(255, 82, 82, 0.14)';
          ctx.fill();
        }
        ctx.restore();
      }

      if (e.isMiniBoss) {
        ctx.fillStyle = 'rgba(42, 22, 10, 0.92)';
        ctx.fillRect(-43, barY - 17, 86, 15);
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 1;
        ctx.strokeRect(-43, barY - 17, 86, 15);
        ctx.fillStyle = '#ffd54f';
        ctx.font = '12px BalaclavaPixel, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MINI-JEFE', 0, barY - 5);
      } else if (!e.isBoss && e.level && e.level > 1 && dist(e.x, e.y, this.player.x, this.player.y) < 340) {
        ctx.fillStyle = 'rgba(26, 16, 10, 0.85)';
        ctx.fillRect(-23, barY - 16, 46, 14);
        ctx.fillStyle = e.level >= 7 ? '#ff8a65' : '#ffe082';
        ctx.font = '12px BalaclavaPixel, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Nv.${e.level}`, 0, barY - 4.5);
      }
      if (!e.isBoss && e.hp < e.maxHp) {
        ctx.fillStyle = '#1a1118';
        ctx.fillRect(-16, barY, 32, 5);
        ctx.fillStyle = '#ef5350';
        ctx.fillRect(-15, barY + 1, 30 * Math.max(0, e.hp / e.maxHp), 3);
      }
      ctx.restore();
      } catch(drawEnemyErr) {
        try { ctx.restore(); } catch(_) {}
        if (!this._drawEnemyErrLogged) {
          this._drawEnemyErrLogged = true;
          console.error('[drawEnemy error]', drawEnemyErr, 'enemy:', e && e.type);
        }
      }
    }

    drawDrop(ctx, d) {
      const bob = Math.sin(this.time * 5 + d.x) * 3.5;
      const assets = Balaclava.Assets;
      const isDrawable = (im) => im && (!('naturalWidth' in im) || (im.complete && im.naturalWidth > 0)) && (!im.width || im.width > 0);
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.beginPath(); ctx.ellipse(d.x, d.y + 11, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
      if (d.itemId === '_coin') {
        ctx.fillStyle = 'rgba(255, 213, 79, 0.25)';
        ctx.beginPath(); ctx.arc(d.x, d.y + bob, 14, 0, Math.PI * 2); ctx.fill();
        const ic = assets && assets.getItemIconCanvas('coin');
        if (isDrawable(ic)) ctx.drawImage(ic, d.x - 13, d.y - 13 + bob, 26, 26);
        ctx.restore();
        return;
      }
      const it = Balaclava.ITEMS[d.itemId];
      if (!it) { ctx.restore(); return; }
      const rar = RARITIES[it.rarity] || RARITIES.comun;
      ctx.fillStyle = rar.color;
      ctx.globalAlpha = 0.24 + Math.sin(this.time * 4 + d.x) * 0.08;
      ctx.beginPath(); ctx.arc(d.x, d.y + bob, 16, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      let ic = assets && assets.getItemIconCanvas(d.itemId);
      if (!isDrawable(ic) && it.icon) ic = assets && assets.getItemIconCanvas(it.icon);
      if (isDrawable(ic)) ctx.drawImage(ic, d.x - 16, d.y - 16 + bob, 32, 32);
      ctx.restore();
    }

    renderOverlaysAndPreview(ctx) {
      // Thrown TNT & Bombs (arc flight + danger ring + animated sprite)
      if (this.thrownBombs && this.thrownBombs.length > 0) {
        const exImgs = Balaclava.Assets.extraImages || {};
        const dynImg = exImgs.dynamiteAnim;
        const hasDyn = dynImg && dynImg.complete && dynImg.naturalWidth > 0;
        for (const b of this.thrownBombs) {
          const fuseProg = clamp(b.t / Math.max(0.01, b.fuse), 0, 1);
          const pulse = 0.55 + Math.sin(this.time * 28) * 0.35;
          ctx.save();
          // Ground blast radius warning ring
          ctx.strokeStyle = b.tint || '#ff5252';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.36 + fuseProg * 0.35;
          ctx.setLineDash([7, 5]);
          ctx.beginPath(); ctx.arc(b.targetX, b.targetY, b.radius, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = b.tint || '#ff5252';
          ctx.globalAlpha = 0.08 + fuseProg * 0.14 * pulse;
          ctx.beginPath(); ctx.arc(b.targetX, b.targetY, b.radius * (0.25 + 0.75 * fuseProg), 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;

          // Shadow + spinning TNT/Bomb body
          ctx.fillStyle = 'rgba(0,0,0,0.34)';
          ctx.beginPath(); ctx.ellipse(b.x, b.y + 5, 11, 4.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.translate(b.x, b.y - b.z);
          ctx.rotate(b.spin);
          if (b.isTnt && hasDyn) {
            const fr = Math.floor((this.time * 14) % 6);
            ctx.drawImage(dynImg, fr * 64, 0, 64, 64, -18, -18, 36, 36);
          } else {
            const ic = Balaclava.Assets.getItemIconCanvas(b.icon);
            if (ic) ctx.drawImage(ic, -14, -14, 28, 28);
          }
          ctx.restore();
        }
      }

      // Arcane Laser Beams (glowing additive outer halo, mid neon ray & hot core)
      if (this.laserBeams && this.laserBeams.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        for (const beam of this.laserBeams) {
          const alpha = clamp(beam.life / Math.max(0.01, beam.maxLife), 0, 1);
          const pw = (beam.width || 10) * (0.6 + 0.65 * alpha);
          ctx.strokeStyle = beam.color || '#7c4dff';
          ctx.globalAlpha = alpha * 0.34;
          ctx.lineWidth = pw * 2.4;
          ctx.beginPath(); ctx.moveTo(beam.x1, beam.y1); ctx.lineTo(beam.x2, beam.y2); ctx.stroke();

          ctx.globalAlpha = alpha * 0.88;
          ctx.lineWidth = pw * 1.15;
          ctx.beginPath(); ctx.moveTo(beam.x1, beam.y1); ctx.lineTo(beam.x2, beam.y2); ctx.stroke();

          ctx.strokeStyle = beam.coreColor || '#e0f7fa';
          ctx.globalAlpha = alpha;
          ctx.lineWidth = Math.max(2.5, pw * 0.42);
          ctx.beginPath(); ctx.moveTo(beam.x1, beam.y1); ctx.lineTo(beam.x2, beam.y2); ctx.stroke();

          // Muzzle & endpoint plasma flares + energy rings along special laser rays
          ctx.fillStyle = beam.coreColor || '#ffffff';
          ctx.beginPath(); ctx.arc(beam.x1, beam.y1, pw * 0.85, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = beam.color || '#7c4dff';
          ctx.globalAlpha = alpha * 0.72;
          ctx.beginPath(); ctx.arc(beam.x2, beam.y2, pw * 1.35, 0, Math.PI * 2); ctx.fill();

          if (beam.beamMode === 'helix' || beam.beamMode === 'orbital_storm' || beam.beamMode === 'void_pull') {
            const dx = beam.x2 - beam.x1, dy = beam.y2 - beam.y1;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len, ny = dx / len;
            const amp = beam.beamMode === 'void_pull' ? 9 : 7;
            ctx.strokeStyle = beam.coreColor || '#ffffff';
            ctx.globalAlpha = alpha * 0.78;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            const steps = 16;
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const wave = Math.sin(t * Math.PI * 6 - this.time * 28) * amp * (1 - t * 0.25);
              const px = beam.x1 + dx * t + nx * wave;
              const py = beam.y1 + dy * t + ny * wave;
              if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      this.renderCombatEffects(ctx);
      for (const ap of this.ambientParticles) {
        if (!ap || !ap.active) continue;
        if (ap.kind === 'butterfly') {
          const bImg = Balaclava.Assets && Balaclava.Assets.extraImages && Balaclava.Assets.extraImages[ap.spriteKey];
          if (bImg && bImg.complete && bImg.naturalWidth > 0) {
            const age = (ap.maxLife || 9) - ap.life;
            const ageFade = Math.min(1, Math.max(0, age * 1.8), Math.max(0, ap.life * 1.1));
            const flap = 0.45 + 0.55 * Math.abs(Math.sin(this.time * 13 + (ap.phase || 0)));
            const bob = Math.sin(this.time * 4.2 + (ap.phase || 0)) * 5;
            ctx.save();
            ctx.globalAlpha = 0.95 * ageFade;
            ctx.translate(ap.x, ap.y + bob);
            ctx.scale(ap.vx < 0 ? -flap : flap, 1);
            ctx.drawImage(bImg, -ap.size / 2, -ap.size / 2, ap.size, ap.size);
            ctx.restore();
            continue;
          }
        }
        if (ap.kind === 'firefly') {
          const age = (ap.maxLife || 10) - ap.life;
          const ageFade = Math.min(1, Math.max(0, age * 1.4), Math.max(0, ap.life * 0.85));
          const pulse = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(this.time * (ap.pulseSpeed || 2.6) + (ap.phase || 0)));
          const alpha = ageFade * pulse;
          if (alpha > 0.008) {
            ctx.save();
            ctx.globalAlpha = 0.28 * alpha;
            ctx.fillStyle = ap.color || '#e6ff66';
            ctx.beginPath();
            ctx.arc(ap.x, ap.y, (ap.size || 3) * 2.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = Math.min(0.94, 0.88 * ageFade * (0.45 + 0.55 * pulse));
            ctx.fillRect(Math.round(ap.x - ap.size / 2), Math.round(ap.y - ap.size / 2), ap.size, ap.size);
            if (pulse > 0.65) {
              ctx.fillStyle = '#ffffe0';
              ctx.fillRect(Math.round(ap.x), Math.round(ap.y), 1, 1);
            }
            ctx.restore();
          }
          continue;
        }
        ctx.fillStyle = ap.color;
        ctx.globalAlpha = Math.min(0.65, ap.life * 0.35);
        ctx.fillRect(ap.x, ap.y, ap.size, ap.size);
      }
      ctx.globalAlpha = 1;

      // Grid Build Silhouette Preview (Green valid / Red invalid)
      if (this.placingBuildingId && !this.activeDungeon) {
        this.updateMouseWorld();
        const tx = Math.floor(this.mouse.wx / TILE_SIZE);
        const ty = Math.floor(this.mouse.wy / TILE_SIZE);
        const def = Balaclava.BUILDINGS[this.placingBuildingId];
        if (def) {
          const valid = this.canPlaceBuilding(this.placingBuildingId, tx, ty);
          const w = def.size * TILE_SIZE;
          ctx.fillStyle = valid ? 'rgba(76, 175, 80, 0.45)' : 'rgba(244, 67, 54, 0.45)';
          ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, w, w);
          ctx.strokeStyle = valid ? '#a5d6a7' : '#ef9a9a';
          ctx.lineWidth = 3;
          ctx.strokeRect(tx * TILE_SIZE, ty * TILE_SIZE, w, w);
        }
      }

      // Omega Energy Grid visualization when placing Omega building or inspecting
      const isPlacingOmega = this.placingBuildingId && Balaclava.BUILDINGS[this.placingBuildingId] && Balaclava.BUILDINGS[this.placingBuildingId].omega;
      const isOpenOmegaModal = Balaclava.UI && Balaclava.UI.activeModal === 'building' && Balaclava.UI.modalData && Balaclava.BUILDINGS[Balaclava.UI.modalData.type] && Balaclava.BUILDINGS[Balaclava.UI.modalData.type].omega;
      if ((isPlacingOmega || isOpenOmegaModal) && !this.activeDungeon && Array.isArray(this.buildings)) {
        ctx.save();
        const pulse = 0.5 + 0.5 * Math.sin(this.time * 4);
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -this.time * 20;

        const omegaBldgs = this.buildings.filter(b => Balaclava.BUILDINGS[b.type] && Balaclava.BUILDINGS[b.type].omega);
        const pylons = omegaBldgs.filter(b => b.type === 'pilon_enlace' || b.type === 'nexo_central');
        
        for (const p of pylons) {
          const pDef = Balaclava.BUILDINGS[p.type];
          const px = (p.tx + (pDef.size || 1) * 0.5) * TILE_SIZE;
          const py = (p.ty + (pDef.size || 1) * 0.5) * TILE_SIZE;
          const r = ((pDef.omega && pDef.omega.radius) || 8) * TILE_SIZE;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.22)';
          ctx.stroke();

          for (const p2 of pylons) {
            if (p2.id <= p.id) continue;
            const p2Def = Balaclava.BUILDINGS[p2.type];
            const p2x = (p2.tx + (p2Def.size || 1) * 0.5) * TILE_SIZE;
            const p2y = (p2.ty + (p2Def.size || 1) * 0.5) * TILE_SIZE;
            const d = Math.hypot(px - p2x, py - p2y);
            if (d <= r + 8) {
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(p2x, p2y);
              ctx.strokeStyle = `rgba(0, 229, 255, ${0.4 + pulse * 0.3})`;
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // Target Hitbox Indicator + Hover Inspector + Animated [E] Prompt over interactables
      this.hoveredTarget = null;
      if (!this.placingBuildingId && !Balaclava.UI.hasOpenModal() && !(this.player && this.player.deadTimer > 0)) {
        this.updateMouseWorld();
        const mw = this.mouse;
        const hovered = this.findHoveredEntity(mw.wx, mw.wy);
        let interactPrompt = hovered ? hovered.prompt : null;
        if (hovered) {
          this.hoveredTarget = hovered;
        }

        if (hovered) {
          this.renderHoverHitbox(ctx, hovered);
        }

        // If nothing hovered directly, also show [E] prompt on closest nearby interactable!
        if (!interactPrompt && !this.activeDungeon) {
          let bestDist = 82;
          for (const b of this.buildings) {
            const bDef = Balaclava.BUILDINGS[b.type];
            if (!bDef) continue;
            const bx = (b.tx + bDef.size * 0.5) * TILE_SIZE;
            const by = (b.ty + bDef.size * 0.5) * TILE_SIZE;
            const d = dist(this.player.x, this.player.y, bx, by);
            if (d <= bestDist) { bestDist = d; interactPrompt = { x: bx, y: b.ty * TILE_SIZE - 16 }; }
          }
          for (const n of this.world.nodes) {
            if (!['dungeon_gate', 'altar_shrine', 'easter_egg', 'puzzle_pillar', 'chest', 'secret_chest', 'bone_totem', 'skeleton_king_shrine'].includes(n.kind)) continue;
            const d = dist(this.player.x, this.player.y, n.x, n.y);
            if (d <= bestDist) { bestDist = d; interactPrompt = { x: n.x, y: n.y - 42 }; }
          }
          for (const npc of Balaclava.NPCS) {
            const [ngx, ngy] = this.world.getNpcPlot(npc);
            if (!this.world.isPlotUnlocked(ngx, ngy)) continue;
            const off = this.world.getNpcTileOffset(npc);
            const nx = (ngx * PLOT_TILES + off[0] + 0.5) * TILE_SIZE;
            const ny = (ngy * PLOT_TILES + off[1] + 0.5) * TILE_SIZE;
            const d = dist(this.player.x, this.player.y, nx, ny);
            if (d <= bestDist) { bestDist = d; interactPrompt = { x: nx, y: ny - 68 }; }
          }
        }

        if (interactPrompt) {
          const exImgs = Balaclava.Assets.extraImages || {};
          const intKey = (Balaclava.UI && Balaclava.UI.keybinds && Balaclava.UI.keybinds.interact) || 'KeyE';
          const isHeld = !!(this.keys && this.keys[intKey]);
          const pulsePressed = isHeld || ((Math.floor(this.time * 2.2) % 2) === 1);
          const keyImg = pulsePressed ? (exImgs.key_e_pressed || exImgs.key_e) : (exImgs.key_e || exImgs.key_e_pressed);
          const bob = Math.round(Math.sin(this.time * 5.2) * 3) + (pulsePressed ? 1 : 0);
          if (keyImg && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(keyImg))) {
            ctx.drawImage(keyImg, Math.round(interactPrompt.x - 13), Math.round(interactPrompt.y - 13 + bob), 26, 26);
          } else {
            ctx.fillStyle = '#2d180e';
            ctx.fillRect(interactPrompt.x - 11, interactPrompt.y - 11 + bob, 22, 22);
            ctx.strokeStyle = '#ffd54f';
            ctx.strokeRect(interactPrompt.x - 11, interactPrompt.y - 11 + bob, 22, 22);
            ctx.fillStyle = '#ffe082';
            ctx.font = '15px BalaclavaPixel, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('E', interactPrompt.x, interactPrompt.y + 4 + bob);
          }
        }
      }

      // Floating numbers & pickup texts
      if (!this.photoMode) {
        ctx.font = '15px BalaclavaPixel, monospace';
        ctx.textAlign = 'center';
        for (const ft of this.floatingTexts) {
          ctx.globalAlpha = Math.min(1, ft.life * 1.4);
          ctx.fillStyle = '#111111';
          ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
          ctx.fillStyle = ft.color;
          ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
      }
    }

    renderCombatEffects(ctx) {
      const exPr = Balaclava.Assets.extraImages || {};
      const okPr = (im) => im && (!Balaclava.Utils.isImgReady || Balaclava.Utils.isImgReady(im));
      const drawProjSprite = (pr, fallbackKey, fallbackR, spin = false, isEnemy = false) => {
        const ang = Math.atan2(pr.vy || 0, pr.vx || 1);
        const vMeta = pr.vfxKey && Balaclava.VFX_V2 ? Balaclava.VFX_V2[pr.vfxKey] : null;
        const vImg = pr.vfxKey ? exPr[pr.vfxKey] : null;
        if (vMeta && okPr(vImg)) {
          const total = Math.max(1, vMeta.frames || 1);
          const cols = Math.max(1, vMeta.cols || total);
          const fr = Math.floor((this.time * 16) % total);
          const col = fr % cols, row = Math.floor(fr / cols);
          const dw = Math.min(isEnemy ? 40 : 44, Math.max(isEnemy ? 24 : 22, vMeta.fw * 0.62));
          const dh = dw * (vMeta.fh / Math.max(1, vMeta.fw));
          ctx.save();
          ctx.translate(pr.x, pr.y);
          ctx.rotate(spin ? (this.time * 14) : ang);
          if (isEnemy) ctx.globalCompositeOperation = 'lighter';
          ctx.drawImage(vImg, col * vMeta.fw, row * vMeta.fh, vMeta.fw, vMeta.fh, -dw * 0.5, -dh * 0.5, dw, dh);
          ctx.restore();
          return;
        }
        const pImg = exPr[fallbackKey] || exPr.proj_fireball;
        if (okPr(pImg)) {
          const fw = pImg.height || 16;
          const frames = Math.max(1, Math.floor(pImg.width / fw));
          const fr = Math.floor((this.time * 12) % frames);
          const sz = isEnemy ? 26 : 24;
          ctx.save();
          ctx.translate(pr.x, pr.y);
          ctx.rotate(ang);
          ctx.drawImage(pImg, fr * fw, 0, fw, pImg.height, -sz * 0.5, -sz * 0.5, sz, sz);
          ctx.restore();
        } else {
          ctx.fillStyle = pr.color;
          ctx.beginPath(); ctx.arc(pr.x, pr.y, fallbackR, 0, Math.PI * 2); ctx.fill();
        }
      };

      for (const pr of this.projectiles) {
        drawProjSprite(pr, pr.isArrow ? 'proj_arrow' : 'proj_magic', pr.isArrow ? 4 : 6, !!pr.boomerang, false);
      }
      for (const pr of this.enemyProjectiles) {
        const cStr = String(pr.color || '').toLowerCase();
        const kStr = String(pr.kind || '').toLowerCase();
        const pk = kStr.includes('web') || cStr.includes('eceff1') || cStr.includes('f5f5f5') || cStr.includes('b0bec5') ? 'proj_web'
          : kStr.includes('necro') || cStr.includes('7be0') || cStr.includes('00e6') || cStr.includes('b2ff') || cStr.includes('69f0') || cStr.includes('9575') || cStr.includes('26a6') ? 'proj_necro'
          : cStr.includes('4fc3') || cStr.includes('80de') ? 'proj_ice'
          : cStr.includes('a5d6') || cStr.includes('8bc3') || cStr.includes('66bb') ? 'proj_poison'
          : cStr.includes('ce93') || cStr.includes('7c4d') || cStr.includes('ab47') || cStr.includes('b39d') ? 'proj_dark'
          : cStr.includes('cfd8') || cStr.includes('e0e0') ? 'proj_bone'
          : 'proj_fireball';
        drawProjSprite(pr, pk, 6, false, true);
      }
      for (const sw of this.shockwaves) {
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = Math.max(0, sw.life / sw.maxLife);
        ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (this.fxAnims && Balaclava.Assets.extraImages) {
        for (const fx of this.fxAnims) {
          const img = Balaclava.Assets.extraImages[fx.key];
          if (!img || !img.complete || img.naturalWidth <= 0) continue;
          const meta = Balaclava.VFX_V2 && Balaclava.VFX_V2[fx.key];
          const progress = Math.max(0, Math.min(0.999, 1 - fx.life / Math.max(0.01, fx.maxLife)));
          const baseAlpha = fx.alpha != null ? fx.alpha : 1;
          ctx.save();
          if (fx.blend && fx.blend !== 'source-over') ctx.globalCompositeOperation = fx.blend;
          ctx.globalAlpha = baseAlpha * Math.max(0.12, 1 - progress * 0.55);
          ctx.translate(fx.x, fx.y);
          if (fx.angle) ctx.rotate(fx.angle);
          if (fx.flip) ctx.scale(-1, 1);
          if (meta) {
            const total = Math.max(1, meta.frames || 1);
            const cols = Math.max(1, meta.cols || total);
            const fr = Math.min(total - 1, Math.floor(progress * total));
            const col = fr % cols;
            const row = fx.row != null ? fx.row : Math.floor(fr / cols);
            const sc = fx.scale || 1.25;
            const dw = meta.fw * sc;
            const dh = meta.fh * sc;
            const px = meta.px != null ? meta.px : 0.5;
            const py = meta.py != null ? meta.py : 0.5;
            ctx.drawImage(img, col * meta.fw, row * meta.fh, meta.fw, meta.fh, -dw * px, -dh * py, dw, dh);
          } else {
            const fw = img.height || 32;
            const totalFrames = Math.max(1, Math.floor(img.width / fw));
            const fr = Math.floor(progress * totalFrames);
            const sz = fw * (fx.scale || 1.5);
            ctx.drawImage(img, fr * fw, 0, fw, img.height, -sz / 2, -sz / 2, sz, sz * (img.height / fw));
          }
          ctx.restore();
        }
      }
      for (const pt of this.particles) {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      }
    }

    renderDungeon(ctx) {
      const dung = this.activeDungeon;
      const def = dung.def;
      const dImgs = Balaclava.Assets.dungeonImages || {};
      const cImgs = Balaclava.Assets.chestImages || {};
      const bKey = def.themeKey || def.id;

      // Always clear full screen void inside dungeon so offscreen void never leaves ghost/black glitch
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0d0914';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();

      const okImg = (im) => im && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(im) : true);
      const floor1 = okImg(dImgs[`${bKey}_floor1`]) ? dImgs[`${bKey}_floor1`] : (okImg(dImgs.pradera_floor1) ? dImgs.pradera_floor1 : null);
      const floor2 = okImg(dImgs[`${bKey}_floor2`]) ? dImgs[`${bKey}_floor2`] : floor1;
      const floorsSheet = okImg(dImgs[`${bKey}_floorsSheet`]) ? dImgs[`${bKey}_floorsSheet`] : (okImg(dImgs.pradera_floorsSheet) ? dImgs.pradera_floorsSheet : null);
      const wallImg = okImg(dImgs[`${bKey}_wall`]) ? dImgs[`${bKey}_wall`] : (okImg(dImgs.pradera_wall) ? dImgs.pradera_wall : null);
      const wallBannerImg = okImg(dImgs[`${bKey}_wallBanner`]) ? dImgs[`${bKey}_wallBanner`] : wallImg;
      const wallSheet = okImg(dImgs[`${bKey}_wallSheet`]) ? dImgs[`${bKey}_wallSheet`] : (okImg(dImgs.pradera_wallSheet) ? dImgs.pradera_wallSheet : null);
      const wallTopImg = okImg(dImgs[`${bKey}_wallTop`]) ? dImgs[`${bKey}_wallTop`] : (okImg(dImgs.pradera_wallTop) ? dImgs.pradera_wallTop : null);
      const rfMainImg = okImg(dImgs.rfMain) ? dImgs.rfMain : null;
      const doorImg = dung.gateOpen
        ? (okImg(dImgs[`${bKey}_doorOpen`]) ? dImgs[`${bKey}_doorOpen`] : dImgs.pradera_doorOpen)
        : (okImg(dImgs[`${bKey}_doorClosed`]) ? dImgs[`${bKey}_doorClosed`] : dImgs.pradera_doorClosed);
      const closedGateImg = okImg(dImgs[`${bKey}_doorClosed`]) ? dImgs[`${bKey}_doorClosed`] : dImgs.pradera_doorClosed;
      const pillarImg = okImg(dImgs[`${bKey}_pillar`]) ? dImgs[`${bKey}_pillar`] : dImgs.pradera_pillar;
      const runePadImg = okImg(dImgs[`${bKey}_floorRune`]) ? dImgs[`${bKey}_floorRune`] : dImgs.pradera_floorRune;

      // 47-tile blob autotile lookup table (N=1, NE=2, E=4, SE=8, S=16, SW=32, W=64, NW=128)
      if (!this._dungeonBlob47Map) {
        const masks = [
          0, 1, 4, 5, 7, 16, 17, 20,
          21, 23, 28, 29, 31, 64, 65, 68,
          69, 71, 80, 81, 84, 85, 87, 92,
          93, 95, 112, 113, 116, 117, 119, 124,
          125, 127, 193, 197, 199, 209, 213, 215,
          221, 223, 241, 245, 247, 253, 255
        ];
        const map = new Uint8Array(256);
        map.fill(46);
        for (let i = 0; i < masks.length; i++) map[masks[i]] = i;
        this._dungeonBlob47Map = map;
      }
      const blob47Map = this._dungeonBlob47Map;

      const isFrontWallFace = (tx, ty) => {
        if (tx < 0 || ty < 0 || tx >= dung.width || ty >= dung.height) return false;
        return dung.grid[ty][tx] === 0 && (ty + 1 < dung.height && dung.grid[ty + 1][tx] !== 0);
      };
      const isWallCapTile = (tx, ty) => {
        if (tx < 0 || ty < 0 || tx >= dung.width || ty >= dung.height) return true;
        if (dung.grid[ty][tx] !== 0) return false;
        if (ty + 1 < dung.height && dung.grid[ty + 1][tx] !== 0) return false;
        return true;
      };
      const isCarpetTile = (tx, ty) => {
        if (tx < 0 || ty < 0 || tx >= dung.width || ty >= dung.height) return false;
        if (dung.grid[ty][tx] === 0) return false;
        if (dung.carpetTiles) return dung.carpetTiles.has(`${tx},${ty}`);
        return (((ty === 14 || ty === 15) && ((tx >= 3 && tx <= 12) || (tx >= 24 && tx <= 51))) || (tx === 18 && ty >= 4 && ty <= 27));
      };
      const bannerCol = def.bannerKey === 'banner_blue' ? 2
        : def.bannerKey === 'banner_green' ? 3
          : def.bannerKey === 'banner_purple' ? 4 : 1;

      // 1. Floor, Autotiled Parapet Walls, Connected Masonry Faces & Door Gates (viewport culled)
      const camZoom = (this.camera && this.camera.zoom) || 1;
      const dHalfW = ((this.camera.width || this.canvas.width) / camZoom) * 0.5 + TILE_SIZE * 2;
      const dHalfH = ((this.camera.height || this.canvas.height) / camZoom) * 0.5 + TILE_SIZE * 2;
      const minDx = Math.max(0, Math.floor((this.camera.x - dHalfW) / TILE_SIZE));
      const maxDx = Math.min(dung.width - 1, Math.ceil((this.camera.x + dHalfW) / TILE_SIZE));
      const minDy = Math.max(0, Math.floor((this.camera.y - dHalfH) / TILE_SIZE));
      const maxDy = Math.min(dung.height - 1, Math.ceil((this.camera.y + dHalfH) / TILE_SIZE));
      for (let y = minDy; y <= maxDy; y++) {
        for (let x = minDx; x <= maxDx; x++) {
          const t = dung.grid[y][x];
          const px = x * TILE_SIZE;
          const py = y * TILE_SIZE;

          if (t === 0) {
            const hasFloorBelow = (y + 1 < dung.height && dung.grid[y + 1][x] !== 0);
            if (hasFloorBelow && (wallSheet || wallImg)) {
              ctx.fillStyle = def.wallColor || '#221c2e';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              if (wallSheet && wallSheet.width >= 192 && wallSheet.height >= 96) {
                const leftFace = isFrontWallFace(x - 1, y);
                const rightFace = isFrontWallFace(x + 1, y);
                let wsx = 0;
                let wsy = 0;
                if (!leftFace && !rightFace) {
                  wsx = 48; wsy = 0;
                } else if (!leftFace) {
                  wsx = 16; wsy = 0;
                } else if (!rightFace) {
                  wsx = 32; wsy = 0;
                } else {
                  const wh = ((x * 41 + y * 97 + (dung.tier || 1) * 13) >>> 0) % 26;
                  if (x % 7 === 3) {
                    wsx = bannerCol * 16; wsy = 32;
                  } else if (wh === 1) {
                    wsx = 80; wsy = 0;
                  } else if (wh === 2 || wh === 3) {
                    wsx = 96; wsy = 0;
                  } else if (wh === 4) {
                    wsx = 80; wsy = 32;
                  } else if (wh === 5) {
                    wsx = 96; wsy = 32;
                  } else if (wh === 6) {
                    wsx = 112; wsy = 32;
                  } else if (wh === 7) {
                    wsx = 128; wsy = 32;
                  } else if (wh === 8) {
                    wsx = 176; wsy = 32;
                  } else if (wh % 2 === 0) {
                    wsx = 0; wsy = 0;
                  } else {
                    wsx = 64; wsy = 0;
                  }
                }
                ctx.drawImage(wallSheet, wsx, wsy, 16, 32, px, py, TILE_SIZE, TILE_SIZE);
              } else {
                const useBanner = (x % 6 === 2) && wallBannerImg;
                ctx.drawImage(useBanner ? wallBannerImg : wallImg, px, py, TILE_SIZE, TILE_SIZE);
              }
              if (rfMainImg) {
                ctx.save();
                ctx.globalAlpha = 0.24;
                const rfx = 64 + ((x * 3 + y) % 4) * 32;
                ctx.drawImage(rfMainImg, rfx, 112, 32, 32, px, py, TILE_SIZE, TILE_SIZE);
                ctx.restore();
              }
              // Dark-fantasy stone cornice & grounded plinth base
              ctx.fillStyle = 'rgba(10, 7, 16, 0.32)';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              if (y > 0 && dung.grid[y - 1][x] !== 0) {
                ctx.fillStyle = 'rgba(18, 12, 26, 0.78)';
                ctx.fillRect(px, py, TILE_SIZE, 5);
                ctx.fillStyle = 'rgba(215, 195, 165, 0.28)';
                ctx.fillRect(px, py + 4, TILE_SIZE, 2);
              }
              ctx.fillStyle = 'rgba(12, 8, 18, 0.65)';
              ctx.fillRect(px, py + TILE_SIZE - 6, TILE_SIZE, 6);
              ctx.fillStyle = 'rgba(205, 182, 148, 0.22)';
              ctx.fillRect(px, py + TILE_SIZE - 6, TILE_SIZE, 2);
              // Multi-step ambient occlusion shadow cast onto floor tile below
              ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
              ctx.fillRect(px, py + TILE_SIZE, TILE_SIZE, 10);
              ctx.fillStyle = 'rgba(0, 0, 0, 0.44)';
              ctx.fillRect(px, py + TILE_SIZE, TILE_SIZE, 4);
            } else {
              // 47-tile blob autotiled masonry cap with connected corners, T-junctions & stone relief
              const cN = isWallCapTile(x, y - 1);
              const cE = isWallCapTile(x + 1, y);
              const cS = isWallCapTile(x, y + 1);
              const cW = isWallCapTile(x - 1, y);
              const cNE = cN && cE && isWallCapTile(x + 1, y - 1);
              const cSE = cS && cE && isWallCapTile(x + 1, y + 1);
              const cSW = cS && cW && isWallCapTile(x - 1, y + 1);
              const cNW = cN && cW && isWallCapTile(x - 1, y - 1);
              const mask = (cN ? 1 : 0) | (cNE ? 2 : 0) | (cE ? 4 : 0) | (cSE ? 8 : 0)
                | (cS ? 16 : 0) | (cSW ? 32 : 0) | (cW ? 64 : 0) | (cNW ? 128 : 0);

              let nearRoom = (mask !== 255);
              if (!nearRoom) {
                for (let dy = -2; dy <= 2 && !nearRoom; dy++) {
                  for (let dx = -2; dx <= 2; dx++) {
                    if (!isWallCapTile(x + dx, y + dy)) { nearRoom = true; break; }
                  }
                }
              }

              if (nearRoom && wallTopImg) {
                ctx.fillStyle = def.wallColor || '#161220';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                if (wallTopImg.width === 128 && wallTopImg.height === 96) {
                  const blobIdx = blob47Map[mask];
                  const bsx = (blobIdx % 8) * 16;
                  const bsy = Math.floor(blobIdx / 8) * 16;
                  ctx.drawImage(wallTopImg, bsx, bsy, 16, 16, px, py, TILE_SIZE, TILE_SIZE);
                } else {
                  ctx.drawImage(wallTopImg, 0, 0, wallTopImg.width, wallTopImg.height, px, py, TILE_SIZE, TILE_SIZE);
                }
                if (rfMainImg) {
                  ctx.save();
                  ctx.globalAlpha = mask === 255 ? 0.22 : 0.16;
                  const rfx = 736 + (((x * 5 + y * 3) & 3) * 48);
                  ctx.drawImage(rfMainImg, rfx, 368, 32, 32, px, py, TILE_SIZE, TILE_SIZE);
                  ctx.restore();
                }
                ctx.fillStyle = mask === 255 ? 'rgba(10, 7, 16, 0.56)' : 'rgba(12, 8, 20, 0.34)';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                if (!cN) {
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
                  ctx.fillRect(px, py, TILE_SIZE, 2);
                }
                if (!cS) {
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                  ctx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, 2);
                }
              } else {
                ctx.fillStyle = '#0e0a15';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                if (rfMainImg && ((x + y) & 1) === 0) {
                  ctx.save();
                  ctx.globalAlpha = 0.08;
                  ctx.drawImage(rfMainImg, 736, 416, 48, 48, px, py, TILE_SIZE, TILE_SIZE);
                  ctx.restore();
                }
              }
            }
            continue;
          }

          // Solid floor base underlay guarantees 100% opacity and eliminates any void artifact
          ctx.fillStyle = def.floorColor || '#261e30';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          // Multi-variant staggered flagstone floor from 10-tile biome sheet (avoids 2x2 Pokemon grid)
          const fh = ((x * 73 + y * 151 + ((x ^ y) * 19)) >>> 0) % 32;
          if (floorsSheet && floorsSheet.width >= 160 && floorsSheet.height >= 16) {
            let fCol = 1; // floor_2 (staggered flagstones)
            if (fh < 13) fCol = 1;
            else if (fh < 23) fCol = 2; // floor_3 (wide flagstone + smaller stones)
            else if (fh < 26) fCol = 3; // floor_cracked
            else if (fh < 28) fCol = 4; // floor_mossy
            else if (fh < 30) fCol = 5; // floor_rubble
            else if (fh === 30) fCol = 7; // floor_drain
            else fCol = 0; // occasional floor_1
            ctx.drawImage(floorsSheet, fCol * 16, 0, 16, 16, px, py, TILE_SIZE, TILE_SIZE);
          } else {
            const useAlt = (fh & 1) === 0 && floor2;
            if (useAlt || floor1) {
              ctx.drawImage(useAlt ? floor2 : floor1, px, py, TILE_SIZE, TILE_SIZE);
            }
          }

          // Dark-fantasy carved flagstone relief overlay from RF_Catacombs to break up flat bevels
          if (rfMainImg) {
            ctx.save();
            ctx.globalAlpha = 0.28;
            const rfCol = ((x * 3 + y * 7) >>> 0) % 6;
            const rfRow = ((x * 5 + y * 11) >>> 0) % 3;
            const rfx = 736 + rfCol * 48;
            const rfy = rfRow === 0 ? 272 : (rfRow === 1 ? 320 : 368);
            ctx.drawImage(rfMainImg, rfx, rfy, 32, 32, px, py, TILE_SIZE, TILE_SIZE);
            ctx.restore();
          }

          // Subtle mortar darkening & per-tile stone shade variation
          const shadeVar = ((x * 17 + y * 31) & 3);
          ctx.fillStyle = shadeVar === 0 ? 'rgba(8, 5, 14, 0.22)' : (shadeVar === 1 ? 'rgba(8, 5, 14, 0.14)' : 'rgba(18, 12, 26, 0.18)');
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

          // Directional floor-to-wall curbing & perimeter ambient occlusion
          const wN = (y > 0 && dung.grid[y - 1][x] === 0);
          const wS = (y + 1 < dung.height && dung.grid[y + 1][x] === 0);
          const wW = (x > 0 && dung.grid[y][x - 1] === 0);
          const wE = (x + 1 < dung.width && dung.grid[y][x + 1] === 0);
          if (wN) {
            ctx.fillStyle = 'rgba(6, 4, 12, 0.36)';
            ctx.fillRect(px, py, TILE_SIZE, 6);
            ctx.fillStyle = 'rgba(210, 190, 160, 0.12)';
            ctx.fillRect(px, py + 6, TILE_SIZE, 1);
          }
          if (wS) {
            ctx.fillStyle = 'rgba(6, 4, 12, 0.38)';
            ctx.fillRect(px, py + TILE_SIZE - 5, TILE_SIZE, 5);
            ctx.fillStyle = 'rgba(210, 190, 160, 0.13)';
            ctx.fillRect(px, py + TILE_SIZE - 6, TILE_SIZE, 1);
          }
          if (wW) {
            ctx.fillStyle = 'rgba(6, 4, 12, 0.34)';
            ctx.fillRect(px, py, 5, TILE_SIZE);
            ctx.fillStyle = 'rgba(210, 190, 160, 0.12)';
            ctx.fillRect(px + 5, py, 1, TILE_SIZE);
          }
          if (wE) {
            ctx.fillStyle = 'rgba(6, 4, 12, 0.34)';
            ctx.fillRect(px + TILE_SIZE - 5, py, 5, TILE_SIZE);
            ctx.fillStyle = 'rgba(210, 190, 160, 0.12)';
            ctx.fillRect(px + TILE_SIZE - 6, py, 1, TILE_SIZE);
          }

          // Connected inlaid stone & runic dungeon pathway (replaces flat Pokemon carpet)
          if (isCarpetTile(x, y)) {
            const pN = isCarpetTile(x, y - 1);
            const pS = isCarpetTile(x, y + 1);
            const pW = isCarpetTile(x - 1, y);
            const pE = isCarpetTile(x + 1, y);
            const padT = pN ? 0 : 5;
            const padB = pS ? 0 : 5;
            const padL = pW ? 0 : 5;
            const padR = pE ? 0 : 5;
            const rx = px + padL;
            const ry = py + padT;
            const rw = TILE_SIZE - padL - padR;
            const rh = TILE_SIZE - padT - padB;

            const pTheme = (def.carpetKey === 'carpetBlue' || bKey === 'montanas_heladas')
              ? { fill: 'rgba(26, 48, 72, 0.72)', inner: 'rgba(38, 68, 98, 0.45)', trim: 'rgba(130, 195, 230, 0.48)', seam: 'rgba(14, 24, 38, 0.55)' }
              : (def.carpetKey === 'carpetPurple' || bKey === 'bosque_oscuro' || bKey === 'arcane_lab')
                ? { fill: 'rgba(46, 26, 68, 0.72)', inner: 'rgba(68, 38, 96, 0.45)', trim: 'rgba(182, 135, 215, 0.46)', seam: 'rgba(22, 12, 34, 0.55)' }
                : (def.carpetKey === 'carpetGreen' || bKey === 'pradera' || bKey === 'cave')
                  ? { fill: 'rgba(36, 46, 38, 0.72)', inner: 'rgba(52, 66, 54, 0.45)', trim: 'rgba(168, 185, 132, 0.44)', seam: 'rgba(16, 22, 18, 0.55)' }
                  : { fill: 'rgba(68, 24, 28, 0.72)', inner: 'rgba(96, 34, 38, 0.45)', trim: 'rgba(205, 158, 92, 0.48)', seam: 'rgba(28, 10, 12, 0.55)' };

            // Recessed stone gutter around pathway
            ctx.fillStyle = 'rgba(8, 5, 14, 0.52)';
            ctx.fillRect(rx - (pW ? 0 : 2), ry - (pN ? 0 : 2), rw + (pW ? 0 : 2) + (pE ? 0 : 2), rh + (pN ? 0 : 2) + (pS ? 0 : 2));

            // Pathway stone-woven body
            ctx.fillStyle = pTheme.fill;
            ctx.fillRect(rx, ry, rw, rh);
            ctx.fillStyle = pTheme.inner;
            ctx.fillRect(rx + (pW ? 0 : 3), ry + (pN ? 0 : 3), rw - (pW ? 0 : 3) - (pE ? 0 : 3), rh - (pN ? 0 : 3) - (pS ? 0 : 3));

            // Subtle masonry slab joints inside the runner
            ctx.fillStyle = pTheme.seam;
            ctx.fillRect(rx, py + 23, rw, 1);
            ctx.fillRect(px + 23, ry, 1, rh);

            // Connected outer trim lines only on unconnected edges
            ctx.fillStyle = pTheme.trim;
            if (!pN) ctx.fillRect(rx, ry + 1, rw, 2);
            if (!pS) ctx.fillRect(rx, ry + rh - 3, rw, 2);
            if (!pW) ctx.fillRect(rx + 1, ry, 2, rh);
            if (!pE) ctx.fillRect(rx + rw - 3, ry, 2, rh);
          }

          if (t === 2) {
            const spkImg = dung.trapsActive ? dImgs.spike4 : dImgs.spike0;
            if (spkImg) {
              ctx.drawImage(spkImg, px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
            } else {
              ctx.fillStyle = dung.trapsActive ? '#ff5252' : '#455a64';
              ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            }
          } else if (t === 3 || t === 5 || t === 6) {
            const gImg = t === 3 ? doorImg : closedGateImg;
            if (gImg) {
              ctx.drawImage(gImg, px, py - 8, TILE_SIZE, TILE_SIZE + 8);
            } else {
              ctx.fillStyle = t === 6 ? '#2b4d66' : '#3e2723';
              ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
          } else if (t === 4) {
            if (dImgs.portalStairs) {
              ctx.drawImage(dImgs.portalStairs, px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            } else {
              ctx.fillStyle = '#4fc3f7';
              ctx.beginPath(); ctx.arc(px + 24, py + 24, 18, 0, Math.PI * 2); ctx.fill();
            }
            ctx.fillStyle = 'rgba(28, 16, 12, 0.9)';
            ctx.fillRect(px - 14, py - 22, 76, 20);
            ctx.strokeStyle = '#ffd54f';
            ctx.lineWidth = 1;
            ctx.strokeRect(px - 14, py - 22, 76, 20);
            ctx.fillStyle = '#ffe082';
            ctx.font = '14px BalaclavaPixel, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SALIR', px + 24, py - 7);
          }
        }
      }

      // 2. Point 8: Intentional Puzzle Conduits, Wall Mural, Runic Stele & Environmental Clues
      const pMode = dung.puzzleMode || 'flames_count';

      // 2a. Wing Seal Conduits (subtle runic floor channels linking ALFA/BETA to Wing Gates)
      if (dung.wingConduits && dung.wingConduits.length > 0) {
        ctx.save();
        for (const wc of dung.wingConduits) {
          const wRune = dung.runes.find(r => r.id === wc.runeId);
          const isLit = !!(wRune && wRune.active);
          const x1 = wc.from.tx * TILE_SIZE + 24;
          const y1 = wc.from.ty * TILE_SIZE + 24;
          const x2 = wc.to.tx * TILE_SIZE + 24;
          const y2 = wc.to.ty * TILE_SIZE + 24;
          ctx.strokeStyle = isLit ? 'rgba(105, 240, 174, 0.55)' : 'rgba(79, 195, 247, 0.24)';
          ctx.lineWidth = isLit ? 3 : 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1, y2);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2b. Astral Conduit Floor Circuit (primary clue in 'astral_conduit' mode, subtle link otherwise)
      if (dung.puzzleConduits && dung.puzzleConduits.nodes && dung.puzzleConduits.nodes.length > 0) {
        ctx.save();
        const isAstral = pMode === 'astral_conduit';
        const pts = [
          dung.puzzleConduits.origin,
          ...dung.puzzleConduits.nodes,
          dung.puzzleConduits.gate
        ].filter(Boolean);
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          const ax = a.tx * TILE_SIZE + 24;
          const ay = a.ty * TILE_SIZE + 24;
          const bx = b.tx * TILE_SIZE + 24;
          const by = b.ty * TILE_SIZE + 24;
          const stepLit = dung.vaultOpen || (i === 0 ? dung.seqProgress >= 1 : dung.seqProgress >= i + 1);
          if (!isAstral && !stepLit) continue;
          ctx.strokeStyle = stepLit
            ? 'rgba(105, 240, 174, 0.78)'
            : 'rgba(255, 213, 79, 0.62)';
          ctx.lineWidth = isAstral ? 4 : 2.5;
          ctx.setLineDash(stepLit ? [] : [8, 5]);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();

          // Directional chevron halfway along each segment in astral_conduit mode
          if (isAstral) {
            const mx = (ax + bx) * 0.5;
            const my = (ay + by) * 0.5;
            const ang = Math.atan2(by - ay, bx - ax);
            ctx.save();
            ctx.translate(mx, my);
            ctx.rotate(ang);
            ctx.fillStyle = stepLit ? '#69f0ae' : '#ffd54f';
            ctx.beginPath();
            ctx.moveTo(6, 0);
            ctx.lineTo(-4, -4);
            ctx.lineTo(-4, 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
        ctx.restore();
      }

      // 2c. Carved Wall Mural Frieze (primary clue in 'mural_codex' mode, decorative header in all modes)
      if (dung.puzzleMural && dung.puzzleMural.length > 0) {
        const showFullCodex = pMode === 'mural_codex' || (dung.puzzleTablet && dung.puzzleTablet.read);
        for (const mp of dung.puzzleMural) {
          const mpx = mp.tx * TILE_SIZE;
          const mpy = mp.ty * TILE_SIZE;
          const targetRune = dung.runes.find(r => r.id === mp.targetRuneId);
          const isLit = !!(targetRune && targetRune.active);
          ctx.save();
          // Carved stone frieze plaque on wall
          ctx.fillStyle = 'rgba(20, 16, 24, 0.92)';
          ctx.fillRect(mpx + 4, mpy + 6, TILE_SIZE - 8, TILE_SIZE - 12);
          ctx.strokeStyle = isLit ? '#69f0ae' : (showFullCodex ? (mp.color || '#ffd54f') : '#7e6b52');
          ctx.lineWidth = 2;
          ctx.strokeRect(mpx + 4, mpy + 6, TILE_SIZE - 8, TILE_SIZE - 12);

          const roman = mp.order === 1 ? 'I' : mp.order === 2 ? 'II' : 'III';
          ctx.font = '12px BalaclavaPixel, monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = isLit ? '#69f0ae' : '#ffe082';
          ctx.fillText(roman, mpx + 24, mpy + 20);
          ctx.font = '13px BalaclavaPixel, monospace';
          ctx.fillStyle = isLit ? '#b9f6ca' : (showFullCodex ? (mp.color || '#fff8e1') : '#9e9e9e');
          ctx.fillText(showFullCodex ? mp.glyph : '?', mpx + 24, mpy + 35);
          ctx.restore();
        }
      }

      // 2d. Inspectable Ancient Runic Tablet (Pedestal of Revelation)
      if (dung.puzzleTablet) {
        const tbx = dung.puzzleTablet.tx * TILE_SIZE;
        const tby = dung.puzzleTablet.ty * TILE_SIZE;
        const pDist = Math.hypot((this.player.x / TILE_SIZE) - (dung.puzzleTablet.tx + 0.5), (this.player.y / TILE_SIZE) - (dung.puzzleTablet.ty + 0.5));
        ctx.save();
        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(tbx + 24, tby + 39, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Stone stele body
        ctx.fillStyle = '#2d2638';
        ctx.fillRect(tbx + 12, tby + 10, 24, 28);
        ctx.strokeStyle = dung.puzzleTablet.read ? '#69f0ae' : '#ffd54f';
        ctx.lineWidth = 2;
        ctx.strokeRect(tbx + 12, tby + 10, 24, 28);
        // Glowing engraved lines on tablet
        ctx.fillStyle = dung.puzzleTablet.read ? '#80deea' : '#ffe082';
        ctx.fillRect(tbx + 16, tby + 16, 16, 2);
        ctx.fillRect(tbx + 16, tby + 22, 12, 2);
        ctx.fillRect(tbx + 16, tby + 28, 14, 2);

        if (pDist <= 2.4) {
          const promptTxt = dung.puzzleTablet.read
            ? dung.puzzleTablet.shortHint
            : '[E] LEER ESTELA RUNICA';
          ctx.font = '13px BalaclavaPixel, monospace';
          ctx.textAlign = 'center';
          const pw = Math.round(ctx.measureText(promptTxt).width + 14);
          ctx.fillStyle = 'rgba(16, 12, 22, 0.92)';
          ctx.fillRect(Math.round(tbx + 24 - pw / 2), tby - 16, pw, 18);
          ctx.strokeStyle = '#ffd54f';
          ctx.lineWidth = 1;
          ctx.strokeRect(Math.round(tbx + 24 - pw / 2), tby - 16, pw, 18);
          ctx.fillStyle = '#fff59d';
          ctx.fillText(promptTxt, tbx + 24, tby - 3);
        }
        ctx.restore();
      }

      // 2e. Runes (carved rune stone slab + environmental clue + crest sigil + crisp pixel nameplate)
      for (const r of dung.runes) {
        const px = r.tx * TILE_SIZE;
        const py = r.ty * TILE_SIZE;
        const cx = px + 24;
        const cy = py + 24;
        if (runePadImg) ctx.drawImage(runePadImg, px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.save();
        const padStroke = r.active
          ? '#69f0ae'
          : (r.kind === 'seq' ? (r.crestColor || '#ffca28') : '#4fc3f7');
        ctx.fillStyle = r.active ? 'rgba(18, 52, 46, 0.76)' : 'rgba(26, 18, 12, 0.76)';
        ctx.fillRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
        ctx.strokeStyle = padStroke;
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);

        const pulse = 13 + Math.sin(this.time * 4.5 + r.tx) * 2;
        ctx.fillStyle = r.active ? 'rgba(105, 240, 174, 0.28)' : 'rgba(255, 202, 40, 0.18)';
        ctx.beginPath(); ctx.arc(cx, cy, pulse, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = r.active ? '#b9f6ca' : padStroke;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke();

        // Environmental Clues on Sequence Pads according to puzzleMode:
        if (r.kind === 'seq') {
          const clueN = r.clueCount || r.order || 1;
          if (pMode === 'flames_count') {
            // Draw 1, 2, or 3 ritual flame sconces around the top/sides of the pad
            const flameOffsets = clueN === 1
              ? [[0, -14]]
              : clueN === 2
                ? [[-12, -14], [12, -14]]
                : [[-14, -13], [0, -16], [14, -13]];
            for (const [fox, foy] of flameOffsets) {
              const fx = cx + fox;
              const fy = cy + foy;
              const flicker = Math.sin(this.time * 9 + fox) * 1.2;
              ctx.fillStyle = '#3e2723';
              ctx.fillRect(fx - 3, fy + 1, 6, 4);
              ctx.fillStyle = r.active ? '#69f0ae' : '#ff7043';
              ctx.beginPath();
              ctx.arc(fx, fy - 1 + flicker * 0.4, 4.2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = r.active ? '#e0f2f1' : '#ffee58';
              ctx.beginPath();
              ctx.arc(fx, fy - 1.5, 2.2, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (pMode === 'obelisk_notches') {
            // Draw a small carved stone obelisk on the right edge of the pad with 1, 2, or 3 glowing horizontal notches
            const ox = px + TILE_SIZE - 9;
            const oy = py + 8;
            ctx.fillStyle = '#26222f';
            ctx.fillRect(ox - 4, oy, 8, 28);
            ctx.strokeStyle = '#6d5e48';
            ctx.lineWidth = 1;
            ctx.strokeRect(ox - 4, oy, 8, 28);
            for (let nIdx = 0; nIdx < clueN; nIdx++) {
              const ny = oy + 6 + nIdx * 7;
              ctx.fillStyle = r.active ? '#69f0ae' : '#4dd0e1';
              ctx.fillRect(ox - 2, ny, 4, 3);
            }
          }
        }

        // Center glyph mark: Crest Symbol ('S', 'L', 'E') before activation, Roman step ('I', 'II', 'III') once active
        const romanStep = r.order === 1 ? 'I' : r.order === 2 ? 'II' : r.order === 3 ? 'III' : 'R';
        const glyph = r.id === 'alfa'
          ? 'A'
          : r.id === 'beta'
            ? 'B'
            : (r.active ? romanStep : (r.glyph || romanStep));
        ctx.font = '14px BalaclavaPixel, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = r.active ? '#b9f6ca' : '#fff8e1';
        ctx.fillText(glyph, cx, cy + 4);

        const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
        let rTxt = r.crestName || r.label || (r.active ? T('dungeon.activeLabel') : T('dungeon.runeLabel'));
        if (r.id === 'alfa') rTxt = T('dungeon.wingAlpha');
        else if (r.id === 'beta') rTxt = T('dungeon.wingBeta');
        const label = r.active
          ? (r.kind === 'seq' ? `${rTxt} [${romanStep} OK]` : `${rTxt} [OK]`)
          : rTxt;
        ctx.font = '14px BalaclavaPixel, monospace';
        const lw = Math.round(ctx.measureText(label).width + 12);
        ctx.fillStyle = 'rgba(22, 12, 8, 0.90)';
        ctx.fillRect(Math.round(cx - lw / 2), py - 24, lw, 16);
        ctx.strokeStyle = r.active ? '#69f0ae' : padStroke;
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(cx - lw / 2), py - 24, lw, 16);
        ctx.fillStyle = r.active ? '#a5f3c8' : '#ffe8a3';
        ctx.fillText(label, cx, py - 12);
        ctx.restore();
      }

      // 3. Props (urns, sarcophagi, animated ritual altar, biome braziers/banners/statues)
      if (dung.props) {
        for (const pr of dung.props) {
          const px = pr.tx * TILE_SIZE;
          const py = pr.ty * TILE_SIZE;
          if (pr.kind === 'brazier') {
            const brImg = dImgs[def.brazierKey || 'brazier_orange'];
            if (okImg(brImg)) {
              const fr = Math.floor(this.time * 8 + pr.tx) % 6;
              ctx.drawImage(brImg, fr * 16, 0, 16, 32, px + 8, py - 10, 32, 52);
            }
            continue;
          }
          if (pr.kind === 'banner') {
            const bnImg = dImgs[def.bannerKey || 'banner_red'];
            if (okImg(bnImg)) ctx.drawImage(bnImg, px + 10, py - 12, 28, 48);
            continue;
          }
          if (pr.kind === 'statue') {
            const stImg = dImgs[def.statueKey || 'statue_knight'];
            if (okImg(stImg)) {
              if (def.statueKey === 'statue_sphinx') {
                ctx.drawImage(stImg, px - 6, py - 20, 60, 60);
              } else {
                ctx.drawImage(stImg, px + 8, py - 14, 32, 52);
              }
            }
            continue;
          }
          const img = dImgs[pr.kind];
          if (!img) continue;
          if (pr.kind === 'altarRitual') {
            const fr = Math.floor(this.time * 7) % 6;
            ctx.drawImage(img, fr * 32, 0, 32, 16, px - 8, py + 4, 64, 32);
          } else if (pr.kind === 'sarcophagus') {
            ctx.drawImage(img, px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          } else {
            ctx.drawImage(img, px + 10, py + 8, 28, 32);
          }
        }
      }

      // 4. Chests (RPG Chests sprites ~2 tiles wide, grounded so bottom sits cleanly on shadow)
      for (const c of dung.chests) {
        const cx = (c.tx + 0.5) * TILE_SIZE;
        const cy = (c.ty + 0.5) * TILE_SIZE;
        const chestTier = c.bonus ? 'sapphire'
          : def.chestTheme ? def.chestTheme
          : (bKey === 'bosque_oscuro' || bKey === 'tierras_volcanicas' || bKey === 'bosque_necro' || bKey === 'volcan_abismo') ? 'skull'
            : (bKey === 'pradera' || bKey === 'pradera_profunda') ? 'wood'
              : 'gold';
        const ck = chestTier + (c.opened ? '_open' : '_closed');
        const cImg = cImgs[ck] || cImgs.gold_closed;
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.beginPath(); ctx.ellipse(cx, cy + 15, 34, 10, 0, 0, Math.PI * 2); ctx.fill();
        if (cImg) {
          ctx.drawImage(cImg, Math.round(cx - 46), Math.round(cy - 54), 92, 92);
        } else {
          ctx.fillStyle = c.opened ? '#5d4037' : '#ffb300';
          ctx.fillRect(Math.round(cx - 34), Math.round(cy - 34), 68, 50);
        }
        if (!c.opened && this.player) {
          const dChest = Math.hypot((this.player.x / TILE_SIZE) - (c.tx + 0.5), (this.player.y / TILE_SIZE) - (c.ty + 0.5));
          if (dChest <= 1.85) {
            ctx.save();
            const prompt = '[E] ABRIR COFRE';
            ctx.font = '13px BalaclavaPixel, monospace';
            ctx.textAlign = 'center';
            const pw = Math.round(ctx.measureText(prompt).width + 14);
            ctx.fillStyle = 'rgba(16, 12, 22, 0.92)';
            ctx.fillRect(Math.round(cx - pw / 2), Math.round(cy - 44), pw, 18);
            ctx.strokeStyle = '#ffd54f';
            ctx.lineWidth = 1;
            ctx.strokeRect(Math.round(cx - pw / 2), Math.round(cy - 44), pw, 18);
            ctx.fillStyle = '#fff59d';
            ctx.fillText(prompt, cx, Math.round(cy - 31));
            ctx.restore();
          }
        }
      }

      // 4b. Point 11: Exit Portal in Boss Chamber once dungeon boss is defeated
      if (dung.exitPortal && dung.exitPortal.active) {
        const ex = (dung.exitPortal.tx + 0.5) * TILE_SIZE;
        const ey = (dung.exitPortal.ty + 0.5) * TILE_SIZE;
        ctx.save();
        const pulse = 20 + Math.sin(this.time * 5) * 3;
        const grad = ctx.createRadialGradient(ex, ey, 4, ex, ey, pulse + 10);
        grad.addColorStop(0, 'rgba(185, 246, 202, 0.95)');
        grad.addColorStop(0.5, 'rgba(0, 230, 118, 0.65)');
        grad.addColorStop(1, 'rgba(0, 188, 212, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(ex, ey, pulse + 10, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#69f0ae';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(ex, ey, 16, this.time * 2.2, this.time * 2.2 + Math.PI * 1.45); ctx.stroke();
        ctx.strokeStyle = '#80deea';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(ex, ey, 11, -this.time * 3.0, -this.time * 3.0 + Math.PI * 1.35); ctx.stroke();

        const dExit = this.player ? Math.hypot((this.player.x / TILE_SIZE) - (dung.exitPortal.tx + 0.5), (this.player.y / TILE_SIZE) - (dung.exitPortal.ty + 0.5)) : 99;
        if (dExit <= 3.0) {
          const prompt = '[E] PORTAL DE SALIDA';
          ctx.font = '13px BalaclavaPixel, monospace';
          ctx.textAlign = 'center';
          const pw = Math.round(ctx.measureText(prompt).width + 14);
          ctx.fillStyle = 'rgba(12, 24, 22, 0.92)';
          ctx.fillRect(Math.round(ex - pw / 2), Math.round(ey - 40), pw, 18);
          ctx.strokeStyle = '#69f0ae';
          ctx.lineWidth = 1;
          ctx.strokeRect(Math.round(ex - pw / 2), Math.round(ey - 40), pw, 18);
          ctx.fillStyle = '#b9f6ca';
          ctx.fillText(prompt, ex, Math.round(ey - 27));
        }
        ctx.restore();
      }

      // 5. Biome-Distinct Animated Wall Torches
      const biomeTorch = dImgs[def.torchKey || ''];
      if (dung.torches && okImg(biomeTorch)) {
        const fr = Math.floor(this.time * 9) % 6;
        for (const tr of dung.torches) {
          const tx = tr.tx * TILE_SIZE + 10;
          const ty = tr.ty * TILE_SIZE + 4;
          ctx.drawImage(biomeTorch, fr * 16, 0, 16, 16, tx, ty, 28, 28);
        }
      } else {
        const tFrame = (Math.floor(this.time * 8) % 4) + 1;
        const tImg = dImgs[`torch${tFrame}`];
        if (dung.torches && tImg) {
          for (const tr of dung.torches) {
            const tx = tr.tx * TILE_SIZE + 10;
            const ty = tr.ty * TILE_SIZE + 6;
            ctx.drawImage(tImg, tx, ty, 28, 28);
          }
        }
      }

      // 5b. Ground Hazard Zones (Boss/Mini-boss meteor craters, bombs, pillars, elemental pools, & cross fissures)
      if (Array.isArray(dung.hazardZones) && dung.hazardZones.length > 0 && Balaclava.EnemyAttacks && Balaclava.EnemyAttacks.renderHazards) {
        Balaclava.EnemyAttacks.renderHazards(ctx, dung.hazardZones, this.time, def.accentColor || '#ff5252');
      }

      // 6. Enemies + Boss + Player + Ground Drops + Decorative Foreground Pillars
      const dDrawables = [];
      for (const e of dung.enemies) dDrawables.push({ y: e.y + 10, fn: () => this.drawEnemy(ctx, e) });
      if (dung.boss) dDrawables.push({ y: dung.boss.y + 10, fn: () => this.drawEnemy(ctx, dung.boss) });
      dDrawables.push({ y: this.player.y + 10, fn: () => this.drawPlayer(ctx) });
      for (const d of this.drops) dDrawables.push({ y: d.y + 6, fn: () => this.drawDrop(ctx, d) });
      dDrawables.sort((a, b) => a.y - b.y);
      for (const drw of dDrawables) drw.fn();

      if (dung.pillars && pillarImg) {
        for (const pl of dung.pillars) {
          ctx.drawImage(pillarImg, pl.tx * TILE_SIZE + 8, pl.ty * TILE_SIZE - 32, 32, 80);
        }
      }

      this.renderCombatEffects(ctx);

      this.hoveredTarget = null;
      if (!Balaclava.UI.hasOpenModal() && !(this.player && this.player.deadTimer > 0)) {
        this.updateMouseWorld();
        const mw = this.mouse;
        const hovered = this.findHoveredEntity(mw.wx, mw.wy);
        if (hovered) {
          this.hoveredTarget = hovered;
          this.renderHoverHitbox(ctx, hovered);
        }
      }

      ctx.font = '16px BalaclavaPixel, monospace';
      if (!this.photoMode) {
        ctx.textAlign = 'center';
        for (const ft of this.floatingTexts) {
          ctx.globalAlpha = Math.min(1, ft.life * 1.4);
          ctx.fillStyle = '#111111';
          ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
          ctx.fillStyle = ft.color;
          ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
      }

      // 7. Atmospheric Dungeon Torchlight Vignette (World -> Screen space overlay)
      const vw = this.canvas.width;
      const vh = this.canvas.height;
      if (!this._lightCanvas || this._lightCanvas.width !== vw || this._lightCanvas.height !== vh || !this._lightCtx) {
        if (!this._lightCanvas) this._lightCanvas = document.createElement('canvas');
        this._lightCanvas.width = vw;
        this._lightCanvas.height = vh;
        this._lightCtx = this._lightCanvas.getContext('2d');
      }
      const lctx = this._lightCtx;
      const zoom = this.camera.zoom || 1;
      const toSX = (wx) => (wx - this.camera.x) * zoom + vw / 2;
      const toSY = (wy) => (wy - this.camera.y) * zoom + vh / 2;

      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.globalAlpha = 1;
      lctx.globalCompositeOperation = 'source-over';
      lctx.clearRect(0, 0, vw, vh);
      lctx.fillStyle = 'rgba(8, 6, 14, 0.56)';
      lctx.fillRect(0, 0, vw, vh);
      lctx.globalCompositeOperation = 'destination-out';
      const dStamp = this._getLightStamp('erase');

      const punch = (wx, wy, rad) => {
        const sx = toSX(wx);
        const sy = toSY(wy);
        const sr = rad * zoom;
        if (sx + sr < 0 || sx - sr > vw || sy + sr < 0 || sy - sr > vh) return;
        lctx.drawImage(dStamp, sx - sr, sy - sr, sr * 2, sr * 2);
      };

      const pRad = 195 + (this.mods.lightRadius || 0);
      punch(this.player.x, this.player.y, pRad);
      const tf = Math.sin(this.time * 2.1) * 2.2;
      if (dung.torches) {
        for (const tr of dung.torches) {
          punch((tr.tx + 0.5) * TILE_SIZE, (tr.ty + 0.5) * TILE_SIZE, 145 + tf);
        }
      }
      if (dung.props) {
        for (const pr of dung.props) {
          if (pr.kind === 'brazier') {
            punch((pr.tx + 0.5) * TILE_SIZE, (pr.ty + 0.5) * TILE_SIZE, 165 + tf);
          }
        }
      }
      for (const r of dung.runes) {
        punch((r.tx + 0.5) * TILE_SIZE, (r.ty + 0.5) * TILE_SIZE, r.active ? 145 : 95);
      }
      for (const e of dung.enemies) {
        punch(e.x, e.y, e.isMiniBoss ? 145 : 88);
      }
      if (dung.boss) punch(dung.boss.x, dung.boss.y, 175);
      if (dung.exitPortal && dung.exitPortal.active) {
        punch((dung.exitPortal.tx + 0.5) * TILE_SIZE, (dung.exitPortal.ty + 0.5) * TILE_SIZE, 165);
      }
      for (const d of this.drops) {
        punch(d.x, d.y, 58);
      }

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(this._lightCanvas, 0, 0);

      // Dramatic Boss Phase Transition Banner
      if (dung.phaseBanner && dung.phaseBanner.timer > 0) {
        const pb = dung.phaseBanner;
        const fade = Math.min(1, pb.timer / 0.45, (pb.maxTimer - pb.timer) / 0.25 + 0.15);
        const bw = Math.min(540, vw - 44);
        const bx = Math.round((vw - bw) / 2);
        const by = 82;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, fade));
        ctx.fillStyle = pb.phase === 3 ? 'rgba(56, 12, 16, 0.94)' : 'rgba(46, 26, 10, 0.94)';
        ctx.fillRect(bx, by, bw, 58);
        ctx.strokeStyle = pb.phase === 3 ? '#ff5252' : '#ffd54f';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, bw, 58);
        ctx.textAlign = 'center';
        ctx.font = '22px BalaclavaPixel, monospace';
        ctx.fillStyle = pb.phase === 3 ? '#ff8a80' : '#ffe082';
        ctx.fillText(pb.title, vw / 2, by + 25);
        ctx.font = '16px BalaclavaPixel, monospace';
        ctx.fillStyle = '#f5e9d6';
        ctx.fillText(pb.subtitle, vw / 2, by + 46);
      }

      // Point 10: Brief, non-blocking Mini-Tutorial on the player's first dungeon entry
      if (this.activeDungeonIntroTimer > 0) {
        if (this.keys && (this.keys['Tab'] || this.keys['Escape'])) {
          this.activeDungeonIntroTimer = 0;
        } else {
          const dtApprox = 1 / 60;
          this.activeDungeonIntroTimer = Math.max(0, this.activeDungeonIntroTimer - dtApprox);
          const alpha = Math.min(1, this.activeDungeonIntroTimer / 1.2);
          ctx.globalAlpha = alpha;
          const mw = Math.min(560, vw - 40);
          const mh = 128;
          const mx = Math.round((vw - mw) / 2);
          const my = 72;
          ctx.fillStyle = 'rgba(14, 18, 28, 0.93)';
          ctx.fillRect(mx, my, mw, mh);
          ctx.strokeStyle = '#ffd54f';
          ctx.lineWidth = 2;
          ctx.strokeRect(mx, my, mw, mh);
          ctx.textAlign = 'center';
          ctx.font = 'bold 16px BalaclavaPixel, monospace';
          ctx.fillStyle = '#ffe082';
          ctx.fillText('GUIA DE MAZMORRA (PRIMERA INCURSION)', vw / 2, my + 24);
          ctx.font = '13px BalaclavaPixel, monospace';
          ctx.fillStyle = '#cfd8dc';
          ctx.fillText('1. Pisa las runas ALFA y BETA para abrir las alas laterales.', vw / 2, my + 48);
          ctx.fillText('2. Lee la Estela Runica [E] y activa los 3 Sellos en su orden real.', vw / 2, my + 67);
          ctx.fillText('3. Acercate a los cofres y pulsa [E] o haz clic para abrirlos.', vw / 2, my + 86);
          ctx.fillStyle = '#80deea';
          ctx.fillText('4. Derrota al Jefe para activar el Portal de Salida. ([TAB] ocultar)', vw / 2, my + 108);
        }
      }
      ctx.restore();

      this.renderOverlaysAndPreview(ctx);
      ctx.textAlign = 'left';
    }

    updateIntroCinematic(dt) {
      const c = this.introCinematic;
      if (!c || !c.active) return;
      c.timer += dt;
      if (c.fade > 0.08) c.fade = Math.max(0.08, c.fade - dt * 0.9);
      if (c.timer >= 7.0) {
        this.advanceIntroCinematic();
      }
    }

    advanceIntroCinematic() {
      const c = this.introCinematic;
      if (!c || !c.active) return;
      if (c.step < 2) {
        c.step++;
        c.timer = 0;
        c.fade = 0.85;
      } else {
        this.finishIntroCinematic();
      }
    }

    finishIntroCinematic() {
      if (!this.introCinematic || !this.introCinematic.active) return;
      this.introCinematic.active = false;
      this.introCinematic.closing = true;
      this.introCinematic.bands = 1.0;
      this.levelBannerTimer = 5.0;
      const tr = (k, vars) => (Balaclava.I18n && typeof Balaclava.I18n.t === 'function' ? Balaclava.I18n.t(k, vars) : k);
      this.levelUpSummary = {
        title: tr('intro.day1Title'),
        subtitle: tr('intro.day1Sub')
      };
      if (Balaclava.Audio) Balaclava.Audio.play('unlock_plot');
      this.toast(tr('intro.wakeToast'), 'info');
    }

    renderIntroCinematic(ctx) {
      const c = this.introCinematic;
      if (!c) return;
      const w = this.canvas.width;
      const h = this.canvas.height;

      // Bandas cinematográficas panorámicas (letterbox sutil superior e inferior)
      const maxBarH = Math.min(54, Math.round(h * 0.10));
      const bandHeight = maxBarH * (c.active ? 1.0 : (c.bands || 0));
      if (bandHeight > 0.5) {
        ctx.save();
        ctx.fillStyle = '#06070a';
        ctx.fillRect(0, 0, w, Math.ceil(bandHeight));
        ctx.fillRect(0, h - Math.ceil(bandHeight), w, Math.ceil(bandHeight));
        ctx.restore();
      }

      if (!c.active) return;

      const tr = (k, vars) => (Balaclava.I18n && typeof Balaclava.I18n.t === 'function' ? Balaclava.I18n.t(k, vars) : k);

      ctx.save();
      const texts = [
        {
          title: tr('intro.slide1.title'),
          sub: tr('intro.slide1.sub'),
          hint: tr('intro.slide1.hint')
        },
        {
          title: tr('intro.slide2.title'),
          sub: tr('intro.slide2.sub'),
          hint: tr('intro.slide2.hint')
        },
        {
          title: tr('intro.slide3.title'),
          sub: tr('intro.slide3.sub'),
          hint: tr('intro.slide3.hint')
        }
      ];

      const cur = texts[c.step] || texts[0];
      const alpha = Math.max(0, 1 - (c.fade || 0));
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';

      const boxW = Math.min(680, w - 40);
      const boxH = 186;
      const bx = Math.round((w - boxW) / 2);
      const by = Math.round((h - boxH) / 2);

      ctx.fillStyle = 'rgba(10, 14, 22, 0.94)';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = '#e0a944';
      ctx.lineWidth = 3;
      ctx.strokeRect(bx, by, boxW, boxH);

      // Acentos dorados esquineros
      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(bx + 4, by + 4, 14, 3);
      ctx.fillRect(bx + 4, by + 4, 3, 14);
      ctx.fillRect(bx + boxW - 18, by + 4, 14, 3);
      ctx.fillRect(bx + boxW - 7, by + 4, 3, 14);
      ctx.fillRect(bx + 4, by + boxH - 7, 14, 3);
      ctx.fillRect(bx + 4, by + boxH - 17, 3, 14);
      ctx.fillRect(bx + boxW - 18, by + boxH - 7, 14, 3);
      ctx.fillRect(bx + boxW - 7, by + boxH - 17, 3, 14);

      // Título
      ctx.font = 'bold 22px BalaclavaPixel, monospace';
      ctx.fillStyle = '#ffecb3';
      ctx.fillText(cur.title, w / 2, by + 44, boxW - 36);

      // Subtítulo
      ctx.font = '15px BalaclavaPixel, monospace';
      ctx.fillStyle = '#cfd8dc';
      ctx.fillText(cur.sub, w / 2, by + 86, boxW - 40);

      // Hint / Lore
      ctx.font = '14px BalaclavaPixel, monospace';
      ctx.fillStyle = '#81d4fa';
      ctx.fillText(cur.hint, w / 2, by + 120, boxW - 40);

      // Botón indicador
      const pulse = 0.5 + Math.sin(this.time * 6) * 0.5;
      ctx.globalAlpha = alpha * (0.65 + pulse * 0.35);
      ctx.font = '13px BalaclavaPixel, monospace';
      ctx.fillStyle = '#ffd54f';
      const promptText = tr('intro.controls', { step: c.step + 1, total: texts.length });
      ctx.fillText(promptText, w / 2, by + 160, boxW - 36);

      ctx.restore();
    }
  }

  Balaclava.GameEngine = GameEngine;
})();
