(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { TILE_SIZE, PLOT_TILES, GRID_PLOTS, WORLD_TILES, CENTER_PLOT, BIOMES } = Balaclava.CONST;
  const { hash2D, randInt, pick } = Balaclava.Utils;

  function seededRand(seed) {
    let s = (seed >>> 0) || 1337;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // Assign each of the 10x10 = 100 plots in progressive outward biome rings:
  // Pradera -> Desierto -> Montañas Heladas -> Bosque Oscuro -> Tierras Volcánicas
  function getPlotBiome(gx, gy, seed = 42, sectorAngle = 0) {
    const C = CENTER_PLOT || 4;
    if (gx === C && gy === C) return 'pradera';
    const dx = gx - C;
    const dy = gy - C;
    const r = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);
    // Gentle organic radial ripple so rings are non-square & seed-varied while preserving strict order
    const ripple = Math.sin(ang * 3 + sectorAngle) * 0.28 + (hash2D(gx, gy, seed + 19) - 0.5) * 0.45;
    const rw = r + ripple;
    if (r <= 1.05) return 'pradera';
    if (rw <= 1.72) return 'pradera';
    if (rw <= 2.68) return 'desierto';
    if (rw <= 3.78) return 'montanas_heladas';
    if (rw <= 4.78) return 'bosque_oscuro';
    return 'tierras_volcanicas';
  }

  function getPlotBasePrice(gx, gy, biomeOverride = null, ringOverride = null) {
    const C = CENTER_PLOT || 4;
    if (gx === C && gy === C) return 0;
    const d = (typeof ringOverride === 'number' && ringOverride > 0)
      ? ringOverride
      : (Math.abs(gx - C) + Math.abs(gy - C));
    const biome = biomeOverride || getPlotBiome(gx, gy);
    const biomeMult = {
      pradera: 1.0,
      desierto: 1.75,
      montanas_heladas: 2.6,
      bosque_oscuro: 3.6,
      tierras_volcanicas: 5.0
    }[biome] || 1.0;
    if (d === 1) return Math.round(75 * biomeMult);
    return Math.round((55 + Math.pow(d, 2.05) * 62) * biomeMult);
  }

  // 24 Dungeon gate definitions across all 5 biomes
  const DUNGEON_GATES = {
    pradera:             { id: 'pradera',             plot: [5, 4], name: 'Cripta Esmeralda',               biome: 'pradera',            recLevel: 2 },
    pradera_profunda:    { id: 'pradera_profunda',    plot: [4, 3], name: 'Guarnición Goblin',              biome: 'pradera',            recLevel: 3 },
    pradera_madriguera:  { id: 'pradera_madriguera',  plot: [3, 4], name: 'Madriguera de Zapadores',        biome: 'pradera',            recLevel: 4 },
    pradera_baston:      { id: 'pradera_baston',      plot: [5, 3], name: 'Bastión del Jabalí Verde',       biome: 'pradera',            recLevel: 5 },
    pradera_bosquecillo: { id: 'pradera_bosquecillo', plot: [3, 5], name: 'Santuario del Claro Vivo',       biome: 'pradera',            recLevel: 6 },
    desierto:            { id: 'desierto',            plot: [6, 5], name: 'Templo de Arena',                biome: 'desierto',           recLevel: 7 },
    desierto_piramide:   { id: 'desierto_piramide',   plot: [7, 5], name: 'Pirámide Enterrada',             biome: 'desierto',           recLevel: 8 },
    desierto_oasis:      { id: 'desierto_oasis',      plot: [6, 3], name: 'Gruta del Oasis Esmeralda',      biome: 'desierto',           recLevel: 9 },
    desierto_catacumbas: { id: 'desierto_catacumbas', plot: [2, 5], name: 'Catacumbas de los Escribas',     biome: 'desierto',           recLevel: 10 },
    desierto_solario:    { id: 'desierto_solario',    plot: [5, 6], name: 'Solario del Faraón Radiante',    biome: 'desierto',           recLevel: 11 },
    bosque_oscuro:       { id: 'bosque_oscuro',       plot: [2, 3], name: 'Caverna Sombría',                biome: 'bosque_oscuro',      recLevel: 16 },
    bosque_necro:        { id: 'bosque_necro',        plot: [1, 1], name: 'Necrópolis Real',                biome: 'bosque_oscuro',      recLevel: 17 },
    bosque_laboratorio:  { id: 'bosque_laboratorio',  plot: [8, 4], name: 'Laboratorio Alquímico Sellado',  biome: 'bosque_oscuro',      recLevel: 18 },
    bosque_arana:        { id: 'bosque_arana',        plot: [1, 6], name: 'Nido de la Emperatriz Arácnea',  biome: 'bosque_oscuro',      recLevel: 19 },
    bosque_pantano:      { id: 'bosque_pantano',      plot: [7, 7], name: 'Sumidero del Pantano Pútrido',   biome: 'bosque_oscuro',      recLevel: 20 },
    montanas_heladas:    { id: 'montanas_heladas',    plot: [5, 1], name: 'Ciudadela Helada',               biome: 'montanas_heladas',   recLevel: 12 },
    montanas_glaciar:    { id: 'montanas_glaciar',    plot: [8, 1], name: 'Santuario Glaciar Arcano',       biome: 'montanas_heladas',   recLevel: 13 },
    montanas_mina:       { id: 'montanas_mina',       plot: [1, 3], name: 'Mina Profunda de Diamante',      biome: 'montanas_heladas',   recLevel: 14 },
    montanas_fortaleza:  { id: 'montanas_fortaleza',  plot: [7, 2], name: 'Fortaleza Eterna del Norte',     biome: 'montanas_heladas',   recLevel: 15 },
    tierras_volcanicas:  { id: 'tierras_volcanicas',  plot: [3, 8], name: 'Ciudadela Carmesí',              biome: 'tierras_volcanicas', recLevel: 21 },
    volcan_abismo:       { id: 'volcan_abismo',       plot: [1, 8], name: 'Abismo del Señor Balak',         biome: 'tierras_volcanicas', recLevel: 22 },
    volcan_fragua:       { id: 'volcan_fragua',       plot: [9, 8], name: 'Fragua del Titán Ígneo',         biome: 'tierras_volcanicas', recLevel: 23 },
    volcan_caldera:      { id: 'volcan_caldera',      plot: [9, 1], name: 'Caldera del Fénix Solar',        biome: 'tierras_volcanicas', recLevel: 24 },
    volcan_trono_ceniza: { id: 'volcan_trono_ceniza', plot: [0, 9], name: 'Trono de Ceniza Primordial',     biome: 'tierras_volcanicas', recLevel: 25 }
  };

  const NODE_DISPLAY_NAMES = {
    tree: 'Árbol Frondoso',
    giant_tree: 'Árbol Ancestral',
    cactus: 'Cactus del Desierto',
    bush: 'Arbusto de Bayas',
    herb_patch: 'Hierbas Silvestres',
    wild_crop_patch: 'Cultivo Silvestre',
    mushroom_node: 'Hongo Luminoso',
    rock: 'Roca de Piedra',
    coal_vein: 'Veta de Carbón',
    copper_vein: 'Veta de Cobre',
    tin_vein: 'Veta de Estaño',
    iron_vein: 'Veta de Hierro',
    silver_vein: 'Veta de Plata',
    platinum_vein: 'Veta de Platino',
    sulfur_vein: 'Veta de Azufre',
    gold_vein: 'Mena de Oro',
    jade_vein: 'Mena de Jade',
    amethyst_vein: 'Mena de Amatista',
    bloodstone_vein: 'Veta de Sangrita',
    crystal_node: 'Cúmulo de Cristales',
    crystal_cluster: 'Cúmulo de Cristales',
    ruby_node: 'Veta de Rubí',
    sapphire_node: 'Veta de Zafiro',
    emerald_vein: 'Veta de Esmeralda',
    mithril_vein: 'Veta de Mitrilo',
    diamond_vein: 'Veta de Diamante',
    volcanic_rock: 'Roca Volcánica',
    ice_crystal: 'Cristal Glacial',
    malachite_vein: 'Veta de Malaquita',
    star_sand_vein: 'Arena Estelar',
    amber_vein: 'Veta de Ámbar',
    azurite_vein: 'Veta de Azurita',
    abyssal_crystal_vein: 'Cristal Abismal',
    titanium_vein: 'Veta de Titanio',
    orichalcum_vein: 'Veta de Oricalco',
    obsidian_vein: 'Veta de Obsidiana',
    magma_core_vein: 'Núcleo de Magma',
    adamantite_vein: 'Veta de Adamantita',
    dig_spot: 'Zona de Excavación',
    meteor: 'Meteorito Estelar'
  };
  Balaclava.NODE_DISPLAY_NAMES = Balaclava.NODE_DISPLAY_NAMES || Object.assign({}, NODE_DISPLAY_NAMES);

  // Interactive Altars & Shrines (using artist FDA props)
  const ALTAR_DEFS = {
    altar_fortuna: {
      id: 'altar_fortuna', name: 'Altar de la Fortuna', spriteKey: 'altar_gold', color: '#ffd54f',
      blessingName: 'Bendición de la Fortuna',
      blessingTitle: '¡Bendición de la Fortuna activada!',
      iconUrl: 'assets/icons_extra/buff_luck.png',
      desc: 'Bendición dorada: +40% Suerte en botín, gemas y pesca durante 90 s.',
      effectDetail: '+40% Suerte en botín, gemas y pesca', durationText: '90 segundos',
      effect: 'luck', buffDur: 90, cooldown: 150
    },
    altar_furia: {
      id: 'altar_furia', name: 'Altar de Furia Bélica', spriteKey: 'altar_dark', color: '#ff5252',
      blessingName: 'Bendición de Furia Bélica',
      blessingTitle: '¡Bendición de Furia Bélica activada!',
      iconUrl: 'assets/icons_extra/buff_attack.png',
      desc: 'Imbuye tu arma y paso con furia ancestral: +35% Daño y +20% Velocidad de movimiento por 75 s.',
      effectDetail: '+35% Daño total y +20% Velocidad de movimiento', durationText: '75 segundos',
      effect: 'damage', buffDur: 75, cooldown: 150
    },
    fuente_sagrada: {
      id: 'fuente_sagrada', name: 'Fuente de Curación Sagrada', spriteKey: 'healing_fountain', color: '#4dd0e1',
      blessingName: 'Bendición de Aguas Cristalinas',
      blessingTitle: '¡Bendición de la Fuente Sagrada activada!',
      iconUrl: 'assets/icons_extra/buff_regen.png',
      desc: 'Aguas cristalinas curativas que restauran 100% Vida y Energía al instante.',
      effectDetail: 'Restaura 100% de Vida y 100% de Energía', durationText: 'Instantáneo',
      effect: 'heal', cooldown: 60
    },
    altar_sabio: {
      id: 'altar_sabio', name: 'Santuario del Sabio', spriteKey: 'altar_shrine', color: '#80deea',
      blessingName: 'Bendición del Sabio',
      blessingTitle: '¡Bendición del Sabio activada!',
      iconUrl: 'assets/icons_extra/buff_xp.png',
      desc: 'Revelación cósmica: otorga Experiencia instantánea (+65 + Nv×12) y +30% Velocidad de movimiento durante 75 s.',
      effectDetail: '+65 (+Nv×12) Experiencia directa y +30% Velocidad de movimiento', durationText: '75 segundos',
      effect: 'wisdom', buffDur: 75, cooldown: 140
    },
    altar_sacrificio: {
      id: 'altar_sacrificio', name: 'Altar del Pacto Carmesí', spriteKey: 'altar_ritual', color: '#ce93d8',
      blessingName: 'Pacto del Altar Carmesí',
      blessingTitle: '¡Bendición del Pacto Carmesí activada!',
      iconUrl: 'assets/icons/heart_crimson.png',
      desc: 'Ofrenda 25% de tu Vida actual a cambio de gemas raras, esencias y monedas.',
      effectDetail: 'Consume 25% Vida -> Gemas raras, Esencias y Monedas', durationText: 'Instantáneo',
      effect: 'sacrifice', cooldown: 120
    },
    altar_arcanista: {
      id: 'altar_arcanista', name: 'Altar de Canalización Arcana', spriteKey: 'altar_arcane', color: '#ba68c8',
      blessingName: 'Sobrecarga Arcana',
      blessingTitle: '¡Sobrecarga Arcana activada!',
      iconUrl: 'assets/icons/mana_orb.png',
      desc: 'Despierta tu flujo mágico: +35% Poder Mágico, +1.5 Energía/s y -20% Enfriamiento por 85 s.',
      effectDetail: '+35% Poder Mágico y recarga veloz de Energía', durationText: '85 segundos',
      effect: 'arcane', buffDur: 85, cooldown: 145
    },
    altar_cazador: {
      id: 'altar_cazador', name: 'Altar Esmeralda del Cazador', spriteKey: 'altar_emerald', color: '#66bb6a',
      blessingName: 'Instinto del Cazador',
      blessingTitle: '¡Instinto del Cazador activado!',
      iconUrl: 'assets/icons_extra/buff_attack.png',
      desc: 'Agudiza tus sentidos: +20% Crítico y +25% Velocidad de Ataque y Recolección durante 80 s.',
      effectDetail: '+20% Golpe Crítico y +25% Velocidad', durationText: '80 segundos',
      effect: 'hunter', buffDur: 80, cooldown: 145
    }
  };

  // 12 Memorable Easter Egg & Secret Structures scattered across distant islands
  const EASTER_EGG_DEFS = {
    ee_excalibur:   { id: 'ee_excalibur',   name: 'Espada Antigua en la Roca',    biome: 'pradera',            spriteKey: 'ee_sword_legend',  baseSprite: 'node_boulder',    color: '#ffd54f', hint: '¡Una hoja mítica clavada desde eras olvidadas!' },
    ee_arbol:       { id: 'ee_arbol',       name: 'Árbol Milenario Luminoso',     biome: 'bosque_oscuro',      spriteKey: 'ee_crystal',       baseSprite: 'ee_log',          color: '#a5d6a7', hint: 'Savia sagrada brilla entre raíces ancestrales.' },
    ee_naufragio:   { id: 'ee_naufragio',   name: 'Restos del Galeón Perdido',    biome: 'desierto',           spriteKey: 'ee_treasure',      baseSprite: 'ee_log',          color: '#ffe082', hint: 'Cofres encallados de antiguos navegantes.' },
    ee_forja:       { id: 'ee_forja',       name: 'Forja Enana Abandonada',       biome: 'montanas_heladas',   spriteKey: 'node_forge_stone', baseSprite: 'ee_lantern',      color: '#80deea', hint: 'Brasas rúnicas todavía guardan metal enano.' },
    ee_crater:      { id: 'ee_crater',      name: 'Cráter del Astro Dorado',      biome: 'tierras_volcanicas', spriteKey: 'ee_crystal',       baseSprite: 'node_keep_stone', color: '#ff8a65', hint: 'Fragmentos celestes incrustados en roca negra.' },
    ee_obelisco:    { id: 'ee_obelisco',    name: 'Obelisco Solar Oculto',        biome: 'desierto',           spriteKey: 'prop_rune_pillar', baseSprite: 'ee_well',         color: '#ffca28', hint: 'Runas antiguas zumban bajo el sol abrasador.' },
    ee_monolito:    { id: 'ee_monolito',    name: 'Autómata Relojero Dormido',    biome: 'montanas_heladas',   spriteKey: 'ee_device',        baseSprite: 'node_forge_stone',color: '#90caf9', hint: 'Engranajes arcanos esperan ser reactivados.' },
    ee_caldero:     { id: 'ee_caldero',     name: 'Caldero de la Bruja Sabia',    biome: 'bosque_oscuro',      spriteKey: 'ee_cauldron',      baseSprite: 'ee_lantern',      color: '#ce93d8', hint: 'Un brebaje violeta burbujea sin fuego.' },
    ee_observatorio:{ id: 'ee_observatorio',name: 'Astrolabio Antiguo Caído',     biome: 'montanas_heladas',   spriteKey: 'altar_arcane',     baseSprite: 'node_keep_stone', color: '#4fc3f7', hint: 'Un aparato celeste mide eclipses olvidados.' },
    ee_totem:       { id: 'ee_totem',       name: 'Tótem de la Flora Antigua',    biome: 'pradera',            spriteKey: 'altar_emerald',    baseSprite: 'ee_log',          color: '#81c784', hint: 'Enredaderas doradas protegen semillas arcanas.' },
    ee_fuente_mana: { id: 'ee_fuente_mana', name: 'Manantial de Éter Puro',       biome: 'bosque_oscuro',      spriteKey: 'well_mana_strip',  baseSprite: 'ee_well',         color: '#4dd0e1', hint: 'Aguas luminiscentes cargan grimorios vacíos.' },
    ee_altar_guardian:{id:'ee_altar_guardian',name:'Trono del Centinela Volcánico',biome: 'tierras_volcanicas', spriteKey: 'altar_volcano',   baseSprite: 'node_forge_stone',color: '#ff5252', hint: 'Cenizas antiguas aún guardan tesoros rúnicos.' }
  };

  class WorldManager {
    constructor() {
      // tiles[y][x]: 0=water, 1=land, 2=tilled, 3=bridge, 4=lava (damaging), 5=ruin_floor
      this.tiles = [];
      this.plotBiomes = [];
      this.plotElevation = [];
      this.plotUnlocked = [];
      this.nodes = [];
      this.crops = [];
      this.sheep = [];
      this.nextNodeId = 1;
      this.spawnTimer = 0;
      this.worldSeed = 0;
      this.dungeonGatePlots = {};
      this.altarPlots = {};
      this.easterEggPlots = {};
      this.secretChestPlots = {};
      this.skeletonKingPlot = null;
      this.npcPlots = {};
    }

    initNewWorld(seed = null) {
      this.worldSeed = (typeof seed === 'number' && seed > 0)
        ? (seed >>> 0)
        : Math.floor(Math.random() * 89999999 + 10000000);
      const rng = seededRand(this.worldSeed);
      const sectorAngle = rng() * Math.PI * 2;
      const C = CENTER_PLOT || 4;

      this.tiles = Array.from({ length: WORLD_TILES }, () => new Uint8Array(WORLD_TILES));
      this.plotBiomes = Array.from({ length: GRID_PLOTS }, () => new Array(GRID_PLOTS));
      this.plotElevation = Array.from({ length: GRID_PLOTS }, () => new Array(GRID_PLOTS).fill(0));
      this.plotUnlocked = Array.from({ length: GRID_PLOTS }, () => new Array(GRID_PLOTS).fill(false));
      this.nodes = [];
      this.crops = [];
      this.sheep = [];
      this.nextNodeId = 1;

      const outerOrder = ['desierto', 'montanas_heladas', 'bosque_oscuro', 'tierras_volcanicas'];
      this.biomeOrder = outerOrder;
      this.fertilizedTiles = {};

      // Assign all 100 plots into concentric rings around center (C, C) by biome tier:
      // Pradera (1 center + 6 inner = 7), Desierto (12), Montanas Heladas (18), Bosque Oscuro (24), Tierras Volcanicas (39).
      const nonCenter = [];
      for (let gy = 0; gy < GRID_PLOTS; gy++) {
        for (let gx = 0; gx < GRID_PLOTS; gx++) {
          if (gx === C && gy === C) {
            this.plotBiomes[gy][gx] = 'pradera';
            continue;
          }
          const r = Math.hypot(gx - C, gy - C);
          const ang = Math.atan2(gy - C, gx - C);
          const jitter = (hash2D(gx, gy, this.worldSeed + 19) - 0.5) * 0.22;
          nonCenter.push({ gx, gy, score: r + jitter, ang });
        }
      }
      nonCenter.sort((a, b) => (a.score !== b.score ? a.score - b.score : a.ang - b.ang));
      const ringQuotas = [
        ['pradera', 6],
        ['desierto', 12],
        ['montanas_heladas', 18],
        ['bosque_oscuro', 24],
        ['tierras_volcanicas', 39]
      ];
      let qCursor = 0;
      for (const [bId, quota] of ringQuotas) {
        for (let k = 0; k < quota && qCursor < nonCenter.length; k++) {
          const p = nonCenter[qCursor++];
          this.plotBiomes[p.gy][p.gx] = bId;
        }
      }

      this.plotToHex = null;
      this.hexToPlot = null;
      this.hexBiomeRings = null;

      // Compute stepped isometric/terraced plot elevation (0=coast/lowland, 1=highland, 2=summit)
      for (let gy = 0; gy < GRID_PLOTS; gy++) {
        for (let gx = 0; gx < GRID_PLOTS; gx++) {
          const b = this.plotBiomes[gy][gx];
          const r = Math.hypot(gx - C, gy - C);
          if (b === 'tierras_volcanicas') this.plotElevation[gy][gx] = 2;
          else if (b === 'montanas_heladas') this.plotElevation[gy][gx] = r >= 3.2 ? 2 : 1;
          else if (b === 'bosque_oscuro' || b === 'desierto') this.plotElevation[gy][gx] = r >= 2.3 ? 1 : 0;
          else this.plotElevation[gy][gx] = 0;
        }
      }

      this.assignDynamicLandmarks(rng);

      for (let gy = 0; gy < GRID_PLOTS; gy++) {
        for (let gx = 0; gx < GRID_PLOTS; gx++) {
          this.generatePlotTerrain(gx, gy);
        }
      }

      // Unlock starting center island (4,4)
      this.unlockPlot(C, C, true);
    }

    assignDynamicLandmarks(rng) {
      const C = CENTER_PLOT || 4;
      this.dungeonGatePlots = {};
      this.altarPlots = {};
      this.easterEggPlots = {};
      this.secretChestPlots = {};
      this.npcPlots = {};
      const usedKeys = new Set([`${C},${C}`]);

      const distToCenter = ([gx, gy]) => Math.hypot(gx - C, gy - C);

      // 1. Place all 24 Dungeon Gates across their biomes (gracefully falling back to any free plot if needed)
      const biomeOrderIdx = {};
      for (const [dId, def] of Object.entries(DUNGEON_GATES)) {
        const bId = def.biome;
        const idxInBiome = biomeOrderIdx[bId] || 0;
        biomeOrderIdx[bId] = idxInBiome + 1;

        let candidates = [];
        for (let gy = 0; gy < GRID_PLOTS; gy++) {
          for (let gx = 0; gx < GRID_PLOTS; gx++) {
            if (this.plotBiomes[gy][gx] === bId && !usedKeys.has(`${gx},${gy}`)) {
              candidates.push([gx, gy]);
            }
          }
        }
        if (candidates.length === 0) {
          for (let gy = 0; gy < GRID_PLOTS; gy++) {
            for (let gx = 0; gx < GRID_PLOTS; gx++) {
              if (!usedKeys.has(`${gx},${gy}`)) candidates.push([gx, gy]);
            }
          }
        }
        candidates.sort((a, b) => distToCenter(a) - distToCenter(b));
        let pickPlot;
        if (dId === 'pradera') {
          const nearPradera = candidates.filter(([x, y]) => distToCenter([x, y]) <= 1.6);
          const pool = nearPradera.length ? nearPradera : candidates;
          pickPlot = pool[Math.floor(rng() * Math.max(1, pool.length))] || def.plot;
        } else if (idxInBiome === 0) {
          const slice = candidates.slice(0, Math.min(4, candidates.length));
          pickPlot = slice[Math.floor(rng() * Math.max(1, slice.length))] || candidates[0] || def.plot;
        } else {
          const sliceIdx = Math.min(candidates.length - 1, Math.floor((idxInBiome / 5) * candidates.length));
          const spanEnd = Math.min(candidates.length, sliceIdx + Math.max(2, Math.ceil(candidates.length * 0.35)));
          const slice = candidates.slice(Math.max(0, sliceIdx - 1), spanEnd);
          pickPlot = slice[Math.floor(rng() * Math.max(1, slice.length))] || candidates[candidates.length - 1] || def.plot;
        }
        this.dungeonGatePlots[dId] = [...pickPlot];
        usedKeys.add(`${pickPlot[0]},${pickPlot[1]}`);
      }

      // 2. Place Altars (9 shrines distributed across biomes, one close to starter island)
      const altarIds = ['fuente_sagrada', 'altar_fortuna', 'altar_furia', 'altar_sabio', 'altar_sacrificio', 'altar_arcanista', 'altar_cazador', 'altar_fortuna', 'fuente_sagrada'];
      const altarBiomes = ['pradera', 'desierto', 'bosque_oscuro', 'montanas_heladas', 'tierras_volcanicas', 'bosque_oscuro', 'pradera', 'desierto', 'montanas_heladas'];
      altarIds.forEach((aId, idx) => {
        const bTarget = altarBiomes[idx];
        let cands = [];
        for (let gy = 0; gy < GRID_PLOTS; gy++) {
          for (let gx = 0; gx < GRID_PLOTS; gx++) {
            if (this.plotBiomes[gy][gx] === bTarget && !usedKeys.has(`${gx},${gy}`)) cands.push([gx, gy]);
          }
        }
        if (cands.length === 0) {
          for (let gy = 0; gy < GRID_PLOTS; gy++) {
            for (let gx = 0; gx < GRID_PLOTS; gx++) {
              if (!usedKeys.has(`${gx},${gy}`)) cands.push([gx, gy]);
            }
          }
        }
        if (cands.length > 0) {
          const chosen = cands[Math.floor(rng() * cands.length)];
          this.altarPlots[`${chosen[0]},${chosen[1]}`] = aId;
          usedKeys.add(`${chosen[0]},${chosen[1]}`);
        }
      });

      // 3. Place all 8 Easter Eggs on distinct candidate plots
      for (const [eeId, eeDef] of Object.entries(EASTER_EGG_DEFS)) {
        const cands = [];
        for (let gy = 0; gy < GRID_PLOTS; gy++) {
          for (let gx = 0; gx < GRID_PLOTS; gx++) {
            if (this.plotBiomes[gy][gx] === eeDef.biome && !usedKeys.has(`${gx},${gy}`)) cands.push([gx, gy]);
          }
        }
        if (cands.length === 0) {
          for (let gy = 0; gy < GRID_PLOTS; gy++) {
            for (let gx = 0; gx < GRID_PLOTS; gx++) {
              if (!usedKeys.has(`${gx},${gy}`)) cands.push([gx, gy]);
            }
          }
        }
        if (cands.length > 0) {
          const chosen = cands[Math.floor(rng() * cands.length)];
          this.easterEggPlots[`${chosen[0]},${chosen[1]}`] = eeId;
          usedKeys.add(`${chosen[0]},${chosen[1]}`);
        }
      }

      // 3b. Place 10 unmarked Secret Chests on outer islands (dist >= 2.2 from center)
      const outerUnused = [];
      const outerFallback = [];
      for (let gy = 0; gy < GRID_PLOTS; gy++) {
        for (let gx = 0; gx < GRID_PLOTS; gx++) {
          if (gx === C && gy === C) continue;
          const d = distToCenter([gx, gy]);
          if (d >= 2.15) {
            const key = `${gx},${gy}`;
            if (!usedKeys.has(key)) outerUnused.push([gx, gy]);
            else outerFallback.push([gx, gy]);
          }
        }
      }
      // Deterministic shuffle with rng
      for (let i = outerUnused.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [outerUnused[i], outerUnused[j]] = [outerUnused[j], outerUnused[i]];
      }
      for (let i = outerFallback.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [outerFallback[i], outerFallback[j]] = [outerFallback[j], outerFallback[i]];
      }
      const secretPool = [...outerUnused, ...outerFallback];
      let nextSecretIdx = 0;
      let secretCursor = 0;
      while (nextSecretIdx < 12 && secretCursor < secretPool.length) {
        const [sgx, sgy] = secretPool[secretCursor++];
        const skey = `${sgx},${sgy}`;
        if (this.secretChestPlots[skey] === undefined) {
          this.secretChestPlots[skey] = nextSecretIdx++;
          usedKeys.add(skey);
        }
      }

      // 3b. Sanctum of the Giant Crowned Skeleton King in Bosque Oscuro (purple biome)
      const skRng = seededRand((this.worldSeed || 901) + 777);
      const purpleFree = [];
      const purpleFallback = [];
      for (let gy = 0; gy < GRID_PLOTS; gy++) {
        for (let gx = 0; gx < GRID_PLOTS; gx++) {
          if (this.plotBiomes[gy]?.[gx] !== 'bosque_oscuro') continue;
          const k = `${gx},${gy}`;
          if (!usedKeys.has(k)) purpleFree.push([gx, gy]);
          else if (!this.dungeonGatePlots[k] && !this.altarPlots[k] && !this.easterEggPlots[k] && this.secretChestPlots[k] === undefined) purpleFallback.push([gx, gy]);
        }
      }
      const skPool = purpleFree.length > 0 ? purpleFree : purpleFallback;
      if (skPool.length > 0) {
        const pick = skPool[Math.floor(skRng() * skPool.length)];
        this.skeletonKingPlot = [pick[0], pick[1]];
        const skKey = `${pick[0]},${pick[1]}`;
        if (this.secretChestPlots && this.secretChestPlots[skKey] !== undefined) {
          delete this.secretChestPlots[skKey];
        }
        usedKeys.add(skKey);
      } else {
        this.skeletonKingPlot = null;
      }

      // 4. Place NPCs cleanly across biomes (seed-varied interior spots!)
      this.npcOffsets = {};
      const eldrinSpots = [[3, 3], [8, 3], [3, 8], [8, 8], [4, 3], [8, 4]];
      this.npcOffsets.eldrin = eldrinSpots[Math.floor(rng() * eldrinSpots.length)];
      if (Array.isArray(Balaclava.NPCS)) {
        for (const npc of Balaclava.NPCS) {
          if (npc.id === 'eldrin') {
            this.npcPlots[npc.id] = [C, C];
            continue;
          }
          const sameBiome = [];
          for (let gy = 0; gy < GRID_PLOTS; gy++) {
            for (let gx = 0; gx < GRID_PLOTS; gx++) {
              if (this.plotBiomes[gy][gx] === npc.biome && !(gx === C && gy === C)) {
                sameBiome.push([gx, gy]);
              }
            }
          }
          const distinct = sameBiome.filter(([x, y]) => !usedKeys.has(`${x},${y}`));
          const list = distinct.length ? distinct : sameBiome;
          list.sort((a, b) => distToCenter(a) - distToCenter(b));
          const topList = list.slice(0, Math.min(6, list.length));
          const picked = topList[Math.floor(rng() * Math.max(1, topList.length))] || list[0] || npc.plot;
          this.npcPlots[npc.id] = [...picked];
          const offPool = [[3, 3], [8, 3], [3, 8], [8, 8], [5, 3], [6, 8], [3, 6], [8, 5]];
          this.npcOffsets[npc.id] = offPool[Math.floor(rng() * offPool.length)];
        }
      }
    }

    getNpcPlot(npcOrId) {
      const C = CENTER_PLOT || 4;
      const id = typeof npcOrId === 'string' ? npcOrId : npcOrId.id;
      if (this.npcPlots && this.npcPlots[id]) return this.npcPlots[id];
      const def = Balaclava.NPCS && Balaclava.NPCS.find(n => n.id === id);
      return def ? def.plot : [C, C];
    }

    getNpcTileOffset(npcOrId) {
      const id = typeof npcOrId === 'string' ? npcOrId : npcOrId.id;
      if (this.npcOffsets && this.npcOffsets[id]) return this.npcOffsets[id];
      const def = Balaclava.NPCS && Balaclava.NPCS.find(n => n.id === id);
      return def ? def.tileOffset : [6, 5];
    }

    getDungeonGateForPlot(gx, gy) {
      for (const [dId, def] of Object.entries(DUNGEON_GATES)) {
        const p = (this.dungeonGatePlots && this.dungeonGatePlots[dId]) || def.plot;
        if (p[0] === gx && p[1] === gy) return { ...def, id: dId, plot: p };
      }
      return null;
    }

    generatePlotTerrain(gx, gy) {
      const C = CENTER_PLOT || 4;
      const biome = this.plotBiomes[gy][gx];
      const ox = gx * PLOT_TILES;
      const oy = gy * PLOT_TILES;
      const isCenter = gx === C && gy === C;
      const gateHere = this.getDungeonGateForPlot(gx, gy);
      const hasAltar = !!(this.altarPlots && this.altarPlots[`${gx},${gy}`]);
      const hasEe = !!(this.easterEggPlots && this.easterEggPlots[`${gx},${gy}`]);
      const hasSecret = !!(this.secretChestPlots && this.secretChestPlots[`${gx},${gy}`] !== undefined);
      const seedBase = (this.worldSeed || 901) + gx * 37 + gy * 101;
      const shapeRoll = hash2D(gx + 13, gy + 29, seedBase);
      const rot = hash2D(gx + 3, gy + 7, seedBase + 19) * Math.PI * 2;
      const stretchX = 0.84 + hash2D(gx + 5, gy + 11, seedBase + 41) * 0.34;
      const stretchY = 0.84 + hash2D(gx + 17, gy + 23, seedBase + 67) * 0.34;
      const coveCorner = Math.floor(hash2D(gx, gy, seedBase + 157) * 4);
      const hasLagoon = !isCenter && !gateHere && !hasAltar && !hasEe && !hasSecret && shapeRoll > 0.72;

      for (let ly = 0; ly < PLOT_TILES; ly++) {
        for (let lx = 0; lx < PLOT_TILES; lx++) {
          const tx = ox + lx;
          const ty = oy + ly;
          const edgeDist = Math.min(lx, ly, PLOT_TILES - 1 - lx, PLOT_TILES - 1 - ly);
          const n = hash2D(tx, ty, (this.worldSeed || 901) + 77);

          let isLand;
          const dx = (lx - 5.5) / stretchX;
          const dy = (ly - 5.5) / stretchY;
          const cosR = Math.cos(rot), sinR = Math.sin(rot);
          const rx = dx * cosR - dy * sinR;
          const ry = dx * sinR + dy * cosR;
          const ang = Math.atan2(ry, rx);
          const rad = Math.hypot(rx, ry);
          if (isCenter) {
            // Main center island: full generous rounded-square island filling the starter plot cleanly
            isLand = edgeDist >= 1 && Math.hypot(lx - 5.5, ly - 5.5) <= 6.2;
          } else {
            const baseRad = 4.65;
            const lobe = baseRad + 0.72 * Math.sin(ang * 2 + rot) + 0.55 * Math.cos(ang * 3 - shapeRoll * 6) + (n - 0.5) * 1.15;
            isLand = rad <= lobe && edgeDist >= 1;
            if (edgeDist === 0 && n > 0.88 && rad <= lobe + 0.35) isLand = true;
            // Carve a natural coastal bay on varied seeds
            if (shapeRoll > 0.35 && shapeRoll < 0.85) {
              const bx = (coveCorner === 0 || coveCorner === 2) ? 2 : 9;
              const by = (coveCorner === 0 || coveCorner === 1) ? 2 : 9;
              if (Math.hypot(lx - bx, ly - by) < 1.85 && edgeDist <= 2) isLand = false;
            }
            // Small interior tidal pool on ~28% of non-landmark plots
            if (hasLagoon && Math.hypot(lx - 5.5, ly - 5.5) < 1.35) isLand = false;
            // Keep center spawn pad & cardinal bridge approaches connected
            if (lx >= 4 && lx <= 7 && ly >= 4 && ly <= 7) isLand = true;
          }

          // Keep gate / altar / easter egg / secret chest center organically solid so structures never touch water without squaring off coastlines
          if ((gateHere || hasAltar || hasEe || hasSecret) && !isCenter && Math.hypot(lx - 5.5, ly - 5.5) <= 3.35) isLand = true;

          if (isLand && biome === 'tierras_volcanicas' && edgeDist >= 3 && n < 0.08 && !(lx >= 4 && lx <= 7 && ly >= 3 && ly <= 7)) {
            this.tiles[ty][tx] = 4; // lava
          } else {
            this.tiles[ty][tx] = isLand ? 1 : 0;
          }
        }
      }
      // Guarantee solid walkable grass pad around any NPC stationed on this plot
      this.ensureNpcLandPads([gx, gy]);
    }

    ensureNpcLandPads(onlyPlot = null) {
      if (!Array.isArray(Balaclava.NPCS)) return;
      for (const npc of Balaclava.NPCS) {
        const [ngx, ngy] = this.getNpcPlot(npc);
        if (onlyPlot && (ngx !== onlyPlot[0] || ngy !== onlyPlot[1])) continue;
        if (!onlyPlot && !this.isPlotUnlocked(ngx, ngy)) continue;
        const ox = ngx * PLOT_TILES;
        const oy = ngy * PLOT_TILES;
        const [nlx, nly] = this.getNpcTileOffset(npc);
        const cx = ox + nlx;
        const cy = oy + nly;
        for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
          const tx = cx + dx;
          const ty = cy + dy;
          if (this.tiles[ty] && tx >= ox + 1 && tx <= ox + PLOT_TILES - 2 && ty >= oy + 1 && ty <= oy + PLOT_TILES - 2) {
            if (this.tiles[ty][tx] === 0 || this.tiles[ty][tx] === 4) {
              this.tiles[ty][tx] = 1;
            }
          }
        }
        this.nodes = this.nodes.filter(n => !(n.tx === cx && n.ty === cy));
      }
    }

    // Guarantee landmark structures (dungeons, altars, easter eggs, secret chests) are centered on the island and surrounded by solid land.
    ensureStructureCenteringAndLandPads(onlyPlot = null) {
      if (!Array.isArray(this.nodes)) return;
      const specialKinds = ['dungeon_gate', 'altar_shrine', 'easter_egg', 'secret_chest'];
      const targetNodes = this.nodes.filter(n => specialKinds.includes(n.kind));

      for (const n of targetNodes) {
        const gx = Math.floor(n.tx / PLOT_TILES);
        const gy = Math.floor(n.ty / PLOT_TILES);
        if (onlyPlot && (gx !== onlyPlot[0] || gy !== onlyPlot[1])) continue;

        const ox = gx * PLOT_TILES;
        const oy = gy * PLOT_TILES;
        const lx = n.tx - ox;
        const ly = n.ty - oy;

        // If structure was generated dangerously close to the coast (lx/ly outside 4..7), center it safely
        if (lx < 4 || lx > 7 || ly < 4 || ly > 7) {
          const targetLx = 5 + (gx % 2);
          const targetLy = 5 + (gy % 2);
          n.tx = ox + targetLx;
          n.ty = oy + targetLy;
          n.x = n.tx * TILE_SIZE + TILE_SIZE / 2;
          n.y = n.ty * TILE_SIZE + TILE_SIZE / 2;
        }

        // Guarantee generous solid 5x5 land pad around the structure so it never touches water
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const tx = n.tx + dx;
            const ty = n.ty + dy;
            if (this.tiles[ty] && tx >= ox + 1 && tx <= ox + PLOT_TILES - 2 && ty >= oy + 1 && ty <= oy + PLOT_TILES - 2) {
              if (this.tiles[ty][tx] === 0 || this.tiles[ty][tx] === 4) {
                this.tiles[ty][tx] = 1;
              }
            }
          }
        }

        // Remove any resource nodes (trees, rocks, bushes) clipping in front of or inside the structure
        this.nodes = this.nodes.filter(other => {
          if (other === n || other.kind === 'puzzle_pillar' || other.kind === 'bone_totem' || other.kind === 'easter_egg') return true;
          const dist = Math.hypot(other.tx - n.tx, other.ty - n.ty);
          return dist >= 2.2;
        });
      }
    }

    // Seamlessly connect borders between any two adjacent unlocked islands deep into each island spine so zero 1-tile water moats remain.
    stitchUnlockedBorders() {
      this.connectorTiles = new Set();
      const clearNode = (tx, ty) => {
        this.nodes = this.nodes.filter(n => n.tx !== tx || n.ty !== ty || (n.kind !== 'fish_spot' && n.kind !== 'rock'));
      };
      const setLandOrConnector = (x, y, asConnectorIfLocked = false) => {
        if (!this.tiles[y] || this.tiles[y][x] === undefined) return;
        const pgx = Math.floor(x / PLOT_TILES);
        const pgy = Math.floor(y / PLOT_TILES);
        const unlocked = this.isPlotUnlocked(pgx, pgy);
        if (unlocked) {
          this.tiles[y][x] = 1;
          clearNode(x, y);
        } else if (asConnectorIfLocked) {
          this.tiles[y][x] = 1;
          this.connectorTiles.add(`${x},${y}`);
          clearNode(x, y);
        }
      };
      for (let gy = 0; gy < GRID_PLOTS; gy++) {
        for (let gx = 0; gx < GRID_PLOTS; gx++) {
          if (!this.isPlotUnlocked(gx, gy)) continue;
          const ox = gx * PLOT_TILES;
          const oy = gy * PLOT_TILES;
          // Connect East neighbor with a natural 4-tile-wide tapered land neck (k=4..7)
          if (this.isPlotUnlocked(gx + 1, gy)) {
            for (let k = 4; k <= 7; k++) {
              const y = oy + k;
              const startD = (k === 5 || k === 6) ? -4 : -2;
              const endD = (k === 5 || k === 6) ? 3 : 1;
              for (let d = startD; d <= endD; d++) {
                setLandOrConnector(ox + PLOT_TILES + d, y, false);
              }
            }
          }
          // Connect South neighbor with a natural 4-tile-wide tapered land neck (k=4..7)
          if (this.isPlotUnlocked(gx, gy + 1)) {
            for (let k = 4; k <= 7; k++) {
              const x = ox + k;
              const startD = (k === 5 || k === 6) ? -4 : -2;
              const endD = (k === 5 || k === 6) ? 3 : 1;
              for (let d = startD; d <= endD; d++) {
                setLandOrConnector(x, oy + PLOT_TILES + d, false);
              }
            }
          }
        }
      }
    }

    isPlotUnlocked(gx, gy) {
      if (gx < 0 || gy < 0 || gx >= GRID_PLOTS || gy >= GRID_PLOTS) return false;
      return this.plotUnlocked[gy][gx];
    }

    buildHexLayout() {
      this.plotToHex = null;
      this.hexToPlot = null;
      this.hexBiomeRings = null;
      this.hexMaxRing = 0;
      return null;
    }

    getPlotHex(gx, gy) {
      return null;
    }

    getPlotRing(gx, gy) {
      const C = CENTER_PLOT || 4;
      return Math.max(Math.abs(gx - C), Math.abs(gy - C));
    }

    getHexNeighborsOfPlot(gx, gy) {
      return [];
    }

    getHexDistance(gx1, gy1, gx2, gy2) {
      return Math.abs(gx1 - gx2) + Math.abs(gy1 - gy2);
    }

    isTileUnlocked(tx, ty) {
      if (tx < 0 || ty < 0 || tx >= WORLD_TILES || ty >= WORLD_TILES) return false;
      const gx = Math.floor(tx / PLOT_TILES);
      const gy = Math.floor(ty / PLOT_TILES);
      return this.isPlotUnlocked(gx, gy);
    }

    isTileWalkable(tx, ty) {
      if (!Number.isFinite(tx) || !Number.isFinite(ty)) return false;
      if (tx < 0 || ty < 0 || tx >= WORLD_TILES || ty >= WORLD_TILES) return false;
      if (!this.isTileUnlocked(tx, ty)) return false;
      const row = this.tiles[ty];
      if (!row) return false;
      const t = row[tx];
      return t === 1 || t === 2 || t === 3 || t === 5;
    }

    getBiomeAtPixel(px, py) {
      const gx = Balaclava.Utils.clamp(Math.floor(px / (PLOT_TILES * TILE_SIZE)), 0, GRID_PLOTS - 1);
      const gy = Balaclava.Utils.clamp(Math.floor(py / (PLOT_TILES * TILE_SIZE)), 0, GRID_PLOTS - 1);
      return this.plotBiomes[gy][gx];
    }

    unlockPlot(gx, gy, isStarter = false) {
      if (gx < 0 || gy < 0 || gx >= GRID_PLOTS || gy >= GRID_PLOTS) return false;
      if (this.plotUnlocked[gy][gx]) return false;
      this.plotUnlocked[gy][gx] = true;

      const biome = this.plotBiomes[gy][gx];
      const ox = gx * PLOT_TILES;
      const oy = gy * PLOT_TILES;

      // Seamlessly bridge adjoining unlocked islands
      this.stitchUnlockedBorders();

      // Seed-varied placement helper inside plot bounds so structures never appear on the same tile
      const plotRng = seededRand((this.worldSeed || 42) + gx * 97 + gy * 193 + 17);
      const placedSpots = [];
      const pickInteriorSpot = (minOff = 2, maxOff = PLOT_TILES - 3, minSep = 2.4) => {
        for (let t = 0; t < 40; t++) {
          const lx = minOff + Math.floor(plotRng() * Math.max(1, maxOff - minOff + 1));
          const ly = minOff + Math.floor(plotRng() * Math.max(1, maxOff - minOff + 1));
          if (placedSpots.some(([sx, sy]) => Math.hypot(sx - lx, sy - ly) < minSep)) continue;
          const ax = ox + lx, ay = oy + ly;
          if (this.tiles[ay]?.[ax] === 1 || t > 24) {
            placedSpots.push([lx, ly]);
            return [ax, ay];
          }
        }
        const fx = ox + minOff + Math.floor(plotRng() * Math.max(1, maxOff - minOff + 1));
        const fy = oy + minOff + Math.floor(plotRng() * Math.max(1, maxOff - minOff + 1));
        placedSpots.push([fx - ox, fy - oy]);
        return [fx, fy];
      };

      // Check if this plot hosts a procedural Dungeon Entrance (centered on the island)
      const gate = this.getDungeonGateForPlot(gx, gy);
      if (gate) {
        const [dgx, dgy] = pickInteriorSpot(5, 6, 2.5);
        this.tiles[dgy][dgx] = 1;
        this.spawnSpecialNode(dgx, dgy, 'dungeon_gate', biome, { dungeonId: gate.id, name: gate.name, recLevel: gate.recLevel });
      }

      // Check if this plot hosts an interactive Altar / Shrine (centered on the island)
      const altarId = this.altarPlots && this.altarPlots[`${gx},${gy}`];
      if (altarId && ALTAR_DEFS[altarId]) {
        const [ax, ay] = pickInteriorSpot(5, 6, 2.5);
        this.tiles[ay][ax] = 1;
        this.spawnSpecialNode(ax, ay, 'altar_shrine', biome, {
          altarId,
          name: ALTAR_DEFS[altarId].name,
          cooldownLeft: 0
        });
      }

      // Check if this plot hosts an Easter Egg Secret Structure (centered on the island)
      const eeId = this.easterEggPlots && this.easterEggPlots[`${gx},${gy}`];
      if (eeId && EASTER_EGG_DEFS[eeId]) {
        const [ex, ey] = pickInteriorSpot(5, 6, 2.5);
        this.tiles[ey][ex] = 1;
        this.spawnSpecialNode(ex, ey, 'easter_egg', biome, {
          eeId,
          name: EASTER_EGG_DEFS[eeId].name,
          claimed: false
        });
      }

      // Check if this plot hosts an unmarked Secret Chest + Runic Seal Puzzle (3 Pillars unlock the chest)
      const secretIdx = (this.secretChestPlots && this.secretChestPlots[`${gx},${gy}`] !== undefined)
        ? this.secretChestPlots[`${gx},${gy}`]
        : null;
      if (secretIdx !== null && !isStarter) {
        const [sx, sy] = pickInteriorSpot(5, 6, 2.5);
        if (this.tiles[sy] && this.tiles[sy][sx] !== undefined) this.tiles[sy][sx] = 1;
        this.nodes = this.nodes.filter(n => n.tx !== sx || n.ty !== sy);
        this.spawnSpecialNode(sx, sy, 'secret_chest', biome, {
          secretIdx,
          opened: false,
          puzzleLocked: true,
          puzzleReq: 3,
          name: 'Cofre Secreto Sellado (Activa los 3 Pilares)'
        });
        for (let pIdx = 0; pIdx < 3; pIdx++) {
          const [px, py] = pickInteriorSpot(4, 7, 2.1);
          if (this.tiles[py] && this.tiles[py][px] !== undefined) this.tiles[py][px] = 1;
          this.nodes = this.nodes.filter(n => n.tx !== px || n.ty !== py);
          this.spawnSpecialNode(px, py, 'puzzle_pillar', biome, {
            secretIdx,
            pillarIdx: pIdx + 1,
            activated: false,
            name: `Pilar Rúnico ${pIdx + 1}/3`
          });
        }
      }

      // Ensure any landmark on this plot is firmly centered with solid land and zero clipping nodes
      this.ensureStructureCenteringAndLandPads([gx, gy]);

      // Check if this plot hosts the Giant Skeleton King Sanctum & 3 Bone Totems (bosque_oscuro)
      if (this.skeletonKingPlot && this.skeletonKingPlot[0] === gx && this.skeletonKingPlot[1] === gy && !isStarter) {
        for (let ly = 2; ly <= 9; ly++) {
          for (let lx = 2; lx <= 9; lx++) {
            const tx = ox + lx, ty = oy + ly;
            if (this.tiles[ty] && this.tiles[ty][tx] !== undefined) {
              this.tiles[ty][tx] = 1;
              const old = this.getNodeAtTile(tx, ty);
              if (old) this.nodes = this.nodes.filter(n => n.id !== old.id);
            }
          }
        }
        const [skx, sky] = pickInteriorSpot(4, 7, 2.2);
        const T = (k) => (Balaclava.I18n ? Balaclava.I18n.t(k) : k);
        this.spawnSpecialNode(skx, sky, 'skeleton_king_shrine', biome, {
          name: T('world.skeletonKing'),
          state: 'sleeping',
          totemsLit: 0,
          nonCombat: true
        });
        const totemNames = [T('world.boneTotem1'), T('world.boneTotem2'), T('world.boneTotem3')];
        for (let tIdx = 0; tIdx < 3; tIdx++) {
          const [txx, tyy] = pickInteriorSpot(2, 9, 2.0);
          this.spawnSpecialNode(txx, tyy, 'bone_totem', biome, {
            totemIdx: tIdx + 1,
            name: totemNames[tIdx],
            lit: false,
            nonCombat: true
          });
        }
      }

      // Rarer random surface Chests (~14% on unlocked outer islands, never guaranteed!)
      if (!isStarter && Math.random() < 0.14) {
        for (let attempt = 0; attempt < 16; attempt++) {
          const cx = ox + randInt(2, PLOT_TILES - 3);
          const cy = oy + randInt(2, PLOT_TILES - 3);
          if (this.tiles[cy][cx] === 1 && !this.getNodeAtTile(cx, cy)) {
            this.spawnSpecialNode(cx, cy, 'chest', biome);
            break;
          }
        }
      }
      if (!isStarter) {
        if (Math.random() < 0.08) {
          const dx = ox + randInt(2, PLOT_TILES - 3), dy = oy + randInt(2, PLOT_TILES - 3);
          if (this.tiles[dy] && this.tiles[dy][dx] === 1 && !this.getNodeAtTile(dx, dy)) {
            this.spawnSpecialNode(dx, dy, 'dig_spot', biome);
          }
        }
        if (biome !== 'pradera' && Math.random() < 0.5) {
          const rx = ox + randInt(2, 9), ry = oy + randInt(2, 9);
          if (this.tiles[ry] && this.tiles[ry][rx] === 1 && !this.getNodeAtTile(rx, ry)) {
            this.spawnSpecialNode(rx, ry, 'ruin_pillar', biome);
          }
        }
      } else {
        // Starter island guaranteed essentials with seed-varied organic positions
        const srng = seededRand((this.worldSeed || 901) + 515);
        const [exOff, eyOff] = this.getNpcTileOffset('eldrin');
        const usedStarter = new Set([`6,6`, `${exOff},${eyOff}`]);
        const pickFreeStarter = () => {
          for (let tries = 0; tries < 40; tries++) {
            const lx = 1 + Math.floor(srng() * 10);
            const ly = 1 + Math.floor(srng() * 10);
            const key = `${lx},${ly}`;
            if (!usedStarter.has(key) && Math.hypot(lx - 6, ly - 6) >= 1.3 && this.tiles[oy + ly]?.[ox + lx] === 1) {
              usedStarter.add(key);
              return [ox + lx, oy + ly];
            }
          }
          for (let ly = 1; ly <= 10; ly++) {
            for (let lx = 1; lx <= 10; lx++) {
              const key = `${lx},${ly}`;
              if (!usedStarter.has(key) && this.tiles[oy + ly]?.[ox + lx] === 1) {
                usedStarter.add(key);
                return [ox + lx, oy + ly];
              }
            }
          }
          return [ox + 2, oy + 3];
        };
        const essentials = [
          'tree', 'tree', 'tree', 'tree', 'tree',
          'rock', 'rock', 'coal_vein', 'copper_vein', 'iron_vein',
          'malachite_vein', 'bush', 'bush', 'herb_patch'
        ];
        essentials.forEach(kind => {
          const [tx, ty] = pickFreeStarter();
          this.spawnNodeAtTile(tx, ty, kind, 'pradera');
        });
        ['sheep', 'conejo', 'pato'].forEach(animalKind => {
          const [ax, ay] = pickFreeStarter();
          this.spawnAnimal(ax, ay, animalKind);
        });
      }

      // Balanced initial density matching plot distance & abundant trees
      const count = isStarter ? 5 : randInt(11, 15);
      for (let i = 0; i < count; i++) {
        this.trySpawnInPlot(gx, gy);
      }
      if (!isStarter) {
        const faunaPool = {
          pradera: ['sheep', 'vaca', 'cerdo', 'conejo', 'pato'],
          desierto: ['conejo', 'pato'],
          bosque_oscuro: ['cerdo', 'conejo'],
          montanas_heladas: ['sheep', 'conejo'],
          tierras_volcanicas: []
        }[biome] || ['sheep'];
        if (faunaPool.length && Math.random() < 0.72) {
          this.spawnAnimal(ox + randInt(3, 8), oy + randInt(3, 8), pick(faunaPool));
        }
        if (faunaPool.length > 1 && Math.random() < 0.42) {
          this.spawnAnimal(ox + randInt(3, 8), oy + randInt(3, 8), pick(faunaPool));
        }
      }

      // Spawn fishing spots on water border
      for (let k = 0; k < 2; k++) {
        const fx = ox + (Math.random() < 0.5 ? 0 : PLOT_TILES - 1);
        const fy = oy + randInt(2, PLOT_TILES - 3);
        if (this.tiles[fy] && this.tiles[fy][fx] === 0 && !this.getNodeAtTile(fx, fy)) {
          this.spawnSpecialNode(fx, fy, 'fish_spot', biome);
        }
      }
      return true;
    }

    spawnAnimal(tx, ty, kind = 'sheep') {
      if (!this.tiles[ty] || this.tiles[ty][tx] !== 1) return;
      const defs = {
        sheep:  { name: 'Oveja',  hp: 24, radius: 18, hitW: 38, hitH: 34, bodyOffY: 10, xp: 10, drops: [{ id: 'lana', min: 1, max: 2 }, { id: 'carne', min: 1, max: 2 }] },
        vaca:   { name: 'Vaca',   hp: 38, radius: 21, hitW: 44, hitH: 40, bodyOffY: 12, xp: 15, drops: [{ id: 'cuero', min: 1, max: 2 }, { id: 'carne', min: 2, max: 3 }, { id: 'leche', min: 1, max: 1, chance: 0.7 }] },
        cerdo:  { name: 'Cerdo',  hp: 28, radius: 18, hitW: 38, hitH: 34, bodyOffY: 10, xp: 12, drops: [{ id: 'carne', min: 2, max: 3 }, { id: 'cuero', min: 1, max: 1 }] },
        conejo: { name: 'Conejo', hp: 14, radius: 14, hitW: 28, hitH: 26, bodyOffY: 8,  xp: 8,  drops: [{ id: 'carne', min: 1, max: 1 }, { id: 'cuero', min: 1, max: 1, chance: 0.75 }] },
        pato:   { name: 'Pato',   hp: 16, radius: 14, hitW: 28, hitH: 26, bodyOffY: 8,  xp: 9,  drops: [{ id: 'carne', min: 1, max: 1 }, { id: 'huevo', min: 1, max: 1, chance: 0.8 }] }
      };
      const d = defs[kind] || defs.sheep;
      this.sheep.push({
        id: this.nextNodeId++,
        kind,
        name: d.name,
        x: (tx + 0.5) * TILE_SIZE,
        y: (ty + 0.5) * TILE_SIZE,
        vx: 0, vy: 0,
        facing: Math.random() < 0.5 ? 1 : -1,
        timer: randInt(1, 4),
        hp: d.hp, maxHp: d.hp,
        radius: d.radius,
        hitW: d.hitW,
        hitH: d.hitH,
        bodyOffY: d.bodyOffY,
        xp: d.xp,
        drops: d.drops,
        hitFlash: 0,
        fleeTimer: 0,
        shearCooldown: 0
      });
    }

    spawnSheep(tx, ty) {
      this.spawnAnimal(tx, ty, 'sheep');
    }

    getNodeAtTile(tx, ty) {
      return this.nodes.find(n => n.tx === tx && n.ty === ty);
    }

    spawnSpecialNode(tx, ty, kind, biome, extra = {}) {
      if (tx < 0 || ty < 0 || tx >= WORLD_TILES || ty >= WORLD_TILES) return null;
      const existing = this.getNodeAtTile(tx, ty);
      if (existing && (existing.kind === 'dungeon_gate' || existing.kind === 'altar_shrine' || existing.kind === 'easter_egg' || existing.kind === 'chest' || existing.kind === 'secret_chest')) return null;
      if (existing) this.nodes = this.nodes.filter(n => n !== existing);
      const node = {
        id: this.nextNodeId++,
        tx, ty,
        x: (tx + 0.5) * TILE_SIZE,
        y: (ty + 0.5) * TILE_SIZE,
        kind,
        biome,
        hp: kind === 'ruin_pillar' ? 30 : 12,
        maxHp: kind === 'ruin_pillar' ? 30 : 12,
        hitAnim: 0,
        variant: randInt(0, 3),
        ...extra
      };
      this.nodes.push(node);
      return node;
    }

    getMineralDistanceMultiplier(gx, gy) {
      const C = CENTER_PLOT || 4;
      if (gx === C && gy === C) return 1.0;
      const dx = gx - C;
      const dy = gy - C;
      const radialDist = Math.hypot(dx, dy);
      const manhattanDist = Math.abs(dx) + Math.abs(dy);
      return Number((1 + radialDist * 0.22 + Math.pow(radialDist, 1.35) * 0.08 + manhattanDist * 0.04).toFixed(3));
    }

    normalizeMineralNodeHardness() {
      if (!Array.isArray(this.nodes)) return;
      for (const n of this.nodes) {
        if (!n || n.tool !== 'pico') continue;
        const plotGx = Math.floor((n.tx || 0) / PLOT_TILES);
        const plotGy = Math.floor((n.ty || 0) / PLOT_TILES);
        const mult = this.getMineralDistanceMultiplier(plotGx, plotGy);
        const baseHp = n.baseHp || n.maxHp || n.hp || 16;
        const targetMaxHp = Math.max(baseHp, Math.round(baseHp * mult));
        const ratio = (n.maxHp && n.maxHp > 0) ? Math.min(1, Math.max(0.05, n.hp / n.maxHp)) : 1;
        n.baseHp = baseHp;
        n.distanceMult = mult;
        n.maxHp = targetMaxHp;
        n.hp = Math.max(1, Math.round(targetMaxHp * ratio));
      }
    }

    spawnNodeAtTile(tx, ty, kind, biome) {
      if (tx < 0 || ty < 0 || tx >= WORLD_TILES || ty >= WORLD_TILES) return null;
      if (this.tiles[ty][tx] !== 1) return null;
      if (this.getNodeAtTile(tx, ty)) return null;

      // Avoid NPC spawn tiles (using dynamic procedural NPC plots & seed offsets)
      for (const npc of Balaclava.NPCS) {
        const nPlot = this.getNpcPlot(npc);
        const [offX, offY] = this.getNpcTileOffset(npc);
        const nx = nPlot[0] * PLOT_TILES + offX;
        const ny = nPlot[1] * PLOT_TILES + offY;
        if (Math.abs(tx - nx) <= 1 && Math.abs(ty - ny) <= 1) return null;
      }

      const defs = {
        tree:           { hp: 14, tool: 'hacha', drops: [{ id: 'madera', min: 2, max: 4 }, { id: 'bayas', min: 0, max: 1, chance: 0.35 }, { id: 'manzana_roja', min: 1, max: 1, chance: 0.24 }], xp: 6 },
        giant_tree:     { hp: 28, tool: 'hacha', drops: [{ id: 'madera', min: 4, max: 7 }, { id: 'esencia_oscura', min: 1, max: 1, chance: 0.25 }, { id: 'manzana_roja', min: 1, max: 2, chance: 0.32 }], xp: 14 },
        cactus:         { hp: 12, tool: 'hacha', drops: [{ id: 'cactus', min: 1, max: 2 }, { id: 'fibra_vegetal', min: 1, max: 3 }], xp: 7 },
        bush:           { hp: 6,  tool: 'guadana', drops: [{ id: 'bayas', min: 1, max: 3 }, { id: 'fibra_vegetal', min: 1, max: 2 }], xp: 4 },
        herb_patch:     { hp: 4,  tool: 'guadana', drops: [{ id: 'hierba', min: 2, max: 3 }, { id: 'semillas', min: 1, max: 2, chance: 0.7 }], xp: 3 },
        wild_crop_patch:{ hp: 6,  tool: 'guadana', drops: [{ id: 'semillas_tomate', min: 1, max: 2, chance: 0.6 }, { id: 'semillas_maiz', min: 1, max: 2, chance: 0.5 }, { id: 'semillas_fresa', min: 1, max: 1, chance: 0.3 }], xp: 8 },
        mushroom_node:  { hp: 8,  tool: 'guadana', drops: [{ id: 'hongo_luminoso', min: 1, max: 2 }, { id: 'esporas_toxicas', min: 1, max: 2, chance: 0.55 }, { id: 'esencia_oscura', min: 1, max: 1, chance: 0.2 }], xp: 8 },
        rock:           { hp: 16, tool: 'pico', drops: [{ id: 'piedra', min: 2, max: 4 }, { id: 'carbon', min: 1, max: 1, chance: 0.3 }], xp: 6 },
        coal_vein:      { hp: 18, tool: 'pico', drops: [{ id: 'carbon', min: 2, max: 3 }, { id: 'piedra', min: 1, max: 2 }], xp: 8 },
        copper_vein:    { hp: 22, tool: 'pico', drops: [{ id: 'cobre', min: 2, max: 3 }, { id: 'piedra', min: 1, max: 1 }], xp: 10 },
        tin_vein:       { hp: 22, tool: 'pico', drops: [{ id: 'estano', min: 2, max: 3 }, { id: 'piedra', min: 1, max: 1 }], xp: 10 },
        iron_vein:      { hp: 26, tool: 'pico', drops: [{ id: 'hierro', min: 2, max: 3 }, { id: 'piedra', min: 1, max: 1 }], xp: 12 },
        silver_vein:    { hp: 30, tool: 'pico', drops: [{ id: 'plata', min: 2, max: 3 }, { id: 'piedra', min: 1, max: 1 }], xp: 15 },
        platinum_vein:  { hp: 38, tool: 'pico', drops: [{ id: 'platino', min: 1, max: 2 }, { id: 'piedra', min: 1, max: 1 }], xp: 22 },
        sulfur_vein:    { hp: 24, tool: 'pico', drops: [{ id: 'azufre', min: 2, max: 3 }, { id: 'salitre', min: 1, max: 2, chance: 0.6 }], xp: 14 },
        gold_vein:      { hp: 34, tool: 'pico', drops: [{ id: 'oro', min: 2, max: 3 }, { id: 'piedra', min: 1, max: 2 }], xp: 18 },
        jade_vein:      { hp: 36, tool: 'pico', drops: [{ id: 'jade', min: 1, max: 2 }, { id: 'cristales', min: 1, max: 2, chance: 0.4 }], xp: 24 },
        amethyst_vein:  { hp: 44, tool: 'pico', drops: [{ id: 'amatista', min: 1, max: 2 }, { id: 'cristales_magicos', min: 1, max: 1, chance: 0.45 }], xp: 30 },
        bloodstone_vein:{ hp: 54, tool: 'pico', drops: [{ id: 'sanguinaria', min: 1, max: 2 }, { id: 'esencia_oscura', min: 1, max: 1, chance: 0.5 }], xp: 36 },
        crystal_node:   { hp: 40, tool: 'pico', drops: [{ id: 'cristales', min: 2, max: 3 }, { id: 'cristales_magicos', min: 1, max: 1, chance: 0.35 }], xp: 24 },
        ruby_node:      { hp: 52, tool: 'pico', drops: [{ id: 'rubi', min: 1, max: 2 }, { id: 'azufre', min: 1, max: 2 }], xp: 34 },
        sapphire_node:  { hp: 48, tool: 'pico', drops: [{ id: 'zafiro', min: 1, max: 2 }, { id: 'plata', min: 1, max: 2 }], xp: 32 },
        emerald_vein:   { hp: 48, tool: 'pico', drops: [{ id: 'esmeraldas', min: 1, max: 2 }, { id: 'cristales', min: 1, max: 2 }], xp: 30 },
        mithril_vein:   { hp: 56, tool: 'pico', drops: [{ id: 'mitrilo_bruto', min: 1, max: 2 }, { id: 'plata', min: 1, max: 2 }], xp: 38 },
        diamond_vein:   { hp: 60, tool: 'pico', drops: [{ id: 'diamantes', min: 1, max: 2 }, { id: 'material_volcanico', min: 1, max: 2 }], xp: 40 },
        volcanic_rock:        { hp: 50, tool: 'pico', drops: [{ id: 'material_volcanico', min: 2, max: 3 }, { id: 'obsidiana_bruta', min: 1, max: 2, chance: 0.55 }, { id: 'azufre', min: 1, max: 2 }, { id: 'carbon', min: 2, max: 3 }, { id: 'onice', min: 1, max: 1, chance: 0.14 }], xp: 28 },
        ice_crystal:          { hp: 32, tool: 'pico', drops: [{ id: 'cristales', min: 1, max: 3 }, { id: 'esquirla_hielo', min: 1, max: 2, chance: 0.6 }, { id: 'plata', min: 1, max: 2 }, { id: 'gel_azul', min: 1, max: 1, chance: 0.3 }], xp: 20 },
        malachite_vein:       { hp: 26, tool: 'pico', drops: [{ id: 'malaquita_pradera', min: 1, max: 3 }, { id: 'piedra', min: 1, max: 2 }], xp: 14 },
        star_sand_vein:       { hp: 22, tool: 'pico', drops: [{ id: 'arena_estelar', min: 2, max: 4 }, { id: 'arena', min: 1, max: 2 }], xp: 13 },
        amber_vein:           { hp: 38, tool: 'pico', drops: [{ id: 'ambar_desierto', min: 1, max: 2 }, { id: 'oro', min: 1, max: 2, chance: 0.45 }], xp: 26 },
        azurite_vein:         { hp: 46, tool: 'pico', drops: [{ id: 'azurita_glacial', min: 1, max: 2 }, { id: 'esquirla_hielo', min: 1, max: 2, chance: 0.5 }], xp: 30 },
        abyssal_crystal_vein: { hp: 56, tool: 'pico', drops: [{ id: 'cristal_abismal', min: 1, max: 2 }, { id: 'esencia_oscura', min: 1, max: 1, chance: 0.55 }], xp: 38 },
        titanium_vein:        { hp: 64, tool: 'pico', drops: [{ id: 'titanio', min: 1, max: 2 }, { id: 'platino', min: 1, max: 2, chance: 0.4 }], xp: 44 },
        orichalcum_vein:      { hp: 74, tool: 'pico', drops: [{ id: 'oricalco', min: 1, max: 2 }, { id: 'material_volcanico', min: 1, max: 2 }], xp: 56 },
        obsidian_vein:        { hp: 70, tool: 'pico', drops: [{ id: 'obsidiana_bruta', min: 2, max: 3 }, { id: 'carbon_eterno', min: 1, max: 1, chance: 0.35 }], xp: 48 },
        magma_core_vein:      { hp: 68, tool: 'pico', drops: [{ id: 'esencia_magma', min: 1, max: 2 }, { id: 'azufre', min: 2, max: 3 }], xp: 48 },
        adamantite_vein:      { hp: 72, tool: 'pico', drops: [{ id: 'adamantita', min: 1, max: 2 }, { id: 'diamantes', min: 1, max: 1, chance: 0.35 }], xp: 52 },
        dig_spot:       { hp: 8,  tool: 'pala', drops: [{ id: 'arena', min: 2, max: 3 }, { id: 'arcilla', min: 1, max: 3 }, { id: 'salitre', min: 1, max: 2, chance: 0.5 }, { id: 'huesos', min: 1, max: 1, chance: 0.45 }, { id: 'concha_marina', min: 1, max: 1, chance: 0.22 }, { id: 'botella_mensaje', min: 1, max: 1, chance: 0.18 }, { id: 'craneo_maldito', min: 1, max: 1, chance: 0.12 }, { id: 'fragmentos_antiguos', min: 1, max: 1, chance: 0.12 }], xp: 12 },
        meteor:         { hp: 55, tool: 'pico', drops: [{ id: 'diamantes', min: 2, max: 3 }, { id: 'polvo_estelar', min: 1, max: 2 }, { id: 'cristales_magicos', min: 2, max: 4 }, { id: 'obsidiana_bruta', min: 1, max: 2, chance: 0.65 }, { id: 'gema_alma', min: 1, max: 1, chance: 0.35 }, { id: 'onice', min: 1, max: 1, chance: 0.28 }, { id: 'fragmentos_antiguos', min: 1, max: 1, chance: 0.5 }], xp: 65 }
      };

      const activeNodeNames = Balaclava.NODE_DISPLAY_NAMES || NODE_DISPLAY_NAMES;
      this.NODE_DISPLAY_NAMES = activeNodeNames;

      const d = defs[kind];
      if (!d) return null;
      const plotGx = Math.floor(tx / PLOT_TILES);
      const plotGy = Math.floor(ty / PLOT_TILES);
      const isMineral = d.tool === 'pico';
      const distMult = isMineral ? this.getMineralDistanceMultiplier(plotGx, plotGy) : 1.0;
      const scaledHp = isMineral ? Math.max(d.hp, Math.round(d.hp * distMult)) : d.hp;
      const node = {
        id: this.nextNodeId++,
        tx, ty,
        x: (tx + 0.5) * TILE_SIZE,
        y: (ty + 0.5) * TILE_SIZE,
        kind,
        name: (activeNodeNames && activeNodeNames[kind]) || d.name || kind,
        biome,
        baseHp: d.hp,
        distanceMult: distMult,
        hp: scaledHp,
        maxHp: scaledHp,
        tool: d.tool,
        drops: d.drops,
        xp: d.xp,
        hitAnim: 0,
        variant: randInt(0, 3)
      };
      this.nodes.push(node);
      return node;
    }

    trySpawnInPlot(gx, gy, occupiedBuildingTiles = null) {
      const biome = this.plotBiomes[gy][gx];
      const ox = gx * PLOT_TILES;
      const oy = gy * PLOT_TILES;
      const isFree = (tx, ty) => {
        if (this.tiles[ty][tx] !== 1) return false;
        if (this.getNodeAtTile(tx, ty)) return false;
        if (occupiedBuildingTiles && occupiedBuildingTiles.has(tx + ',' + ty)) return false;
        if (this.crops.some(c => c.tx === tx && c.ty === ty)) return false;
        return true;
      };

      let tx = -1;
      let ty = -1;
      for (let attempt = 0; attempt < 6; attempt++) {
        const cx = ox + randInt(1, PLOT_TILES - 2);
        const cy = oy + randInt(1, PLOT_TILES - 2);
        if (isFree(cx, cy)) { tx = cx; ty = cy; break; }
      }
      if (tx < 0) {
        const freeTiles = [];
        for (let ly = 1; ly <= PLOT_TILES - 2; ly++) {
          for (let lx = 1; lx <= PLOT_TILES - 2; lx++) {
            if (isFree(ox + lx, oy + ly)) freeTiles.push([ox + lx, oy + ly]);
          }
        }
        if (freeTiles.length === 0) return false;
        [tx, ty] = pick(freeTiles);
      }

      // Distance-scaled rarity pools: common trees/rocks near starter plot (4,4), rare gems far away
      const C = Balaclava.CONST.CENTER_PLOT || 4;
      const plotDist = Math.hypot(gx - C, gy - C);

      // Ultra-rare buried dig spot (~1.5% when plot has none yet)
      if (plotDist > 0 && Math.random() < 0.015) {
        const hasDig = this.nodes.some(n => n.kind === 'dig_spot' && Math.floor(n.tx / PLOT_TILES) === gx && Math.floor(n.ty / PLOT_TILES) === gy);
        if (!hasDig) return !!this.spawnSpecialNode(tx, ty, 'dig_spot', biome);
      }

      const pool = [];
      if (biome === 'pradera') {
        pool.push('tree', 'tree', 'tree', 'tree', 'rock', 'rock', 'bush', 'bush', 'herb_patch', 'wild_crop_patch', 'coal_vein', 'copper_vein', 'tin_vein');
        if (plotDist >= 1.1 && Math.random() < 0.28) pool.push('malachite_vein');
        if (plotDist >= 0.9) pool.push('iron_vein', 'iron_vein');
        if (plotDist >= 1.5) pool.push('silver_vein', 'gold_vein');
        if (plotDist >= 2.2) pool.push('gold_vein', 'jade_vein');
      } else if (biome === 'desierto') {
        pool.push('cactus', 'cactus', 'cactus', 'rock', 'rock', 'copper_vein', 'tin_vein', 'star_sand_vein', 'star_sand_vein');
        if (plotDist >= 1.4) pool.push('silver_vein', 'gold_vein', 'sulfur_vein', 'amber_vein');
        if (plotDist >= 2.3) pool.push('gold_vein', 'platinum_vein', 'crystal_node', 'amber_vein', 'titanium_vein');
      } else if (biome === 'bosque_oscuro') {
        pool.push('giant_tree', 'giant_tree', 'giant_tree', 'giant_tree', 'mushroom_node', 'mushroom_node', 'herb_patch', 'wild_crop_patch', 'iron_vein');
        if (plotDist >= 1.4) pool.push('silver_vein', 'jade_vein', 'abyssal_crystal_vein');
        if (plotDist >= 2.3) pool.push('amethyst_vein', 'crystal_node', 'abyssal_crystal_vein', 'bloodstone_vein', 'orichalcum_vein');
      } else if (biome === 'montanas_heladas') {
        pool.push('tree', 'tree', 'tree', 'rock', 'iron_vein', 'silver_vein', 'ice_crystal');
        if (plotDist >= 1.8) pool.push('gold_vein', 'platinum_vein', 'ice_crystal', 'azurite_vein', 'azurite_vein');
        if (plotDist >= 2.8) pool.push('sapphire_node', 'mithril_vein', 'titanium_vein', 'titanium_vein', 'emerald_vein');
      } else {
        // tierras_volcanicas (outermost extreme biome)
        pool.push('volcanic_rock', 'volcanic_rock', 'sulfur_vein', 'coal_vein', 'gold_vein', 'platinum_vein', 'obsidian_vein');
        if (plotDist >= 2.5) pool.push('ruby_node', 'bloodstone_vein', 'magma_core_vein', 'mithril_vein', 'adamantite_vein');
        if (plotDist >= 3.2) pool.push('ruby_node', 'orichalcum_vein', 'orichalcum_vein', 'diamond_vein', 'adamantite_vein', 'magma_core_vein');
      }
      const kind = pick(pool);
      return !!this.spawnNodeAtTile(tx, ty, kind, biome);
    }

    countNaturalNodesInPlot(gx, gy) {
      let count = 0;
      for (const n of this.nodes) {
        if (n.kind === 'dungeon_gate' || n.kind === 'chest' || n.kind === 'fish_spot' || n.kind === 'altar_shrine' || n.kind === 'easter_egg') continue;
        if (Math.floor(n.tx / PLOT_TILES) === gx && Math.floor(n.ty / PLOT_TILES) === gy) count++;
      }
      return count;
    }

    update(dt, gameState) {
      // Decay altar cooldowns
      for (const n of this.nodes) {
        if (n.kind === 'altar_shrine' && n.cooldownLeft > 0) {
          n.cooldownLeft = Math.max(0, n.cooldownLeft - dt);
        }
      }

      // Gentle empty-tile resource generation (~9.5s, 1 spawn/tick max so islands don't overcrowd)
      this.spawnTimer += dt;
      if (this.spawnTimer >= 9.5) {
        this.spawnTimer = 0;
        const unlocked = gameState.unlockedPlots;
        if (unlocked.length > 0) {
          const occ = gameState.getOccupiedTileSet();
          let spawned = 0;
          const cap = 1;
          const tries = Math.min(2, Math.max(1, unlocked.length));
          for (let attempt = 0; attempt < tries; attempt++) {
            const [gx, gy] = pick(unlocked);
            if (this.trySpawnInPlot(gx, gy, occ)) spawned++;
            if (spawned >= cap) break;
          }
        }
      }

      // Node hit bounce decay
      for (const n of this.nodes) {
        if (n.hitAnim > 0) n.hitAnim = Math.max(0, n.hitAnim - dt * 5);
      }

      // Passive animals gentle wandering & flee response
      for (const s of this.sheep) {
        if (s.shearCooldown > 0) s.shearCooldown = Math.max(0, s.shearCooldown - dt);
        if (s.hitFlash > 0) s.hitFlash = Math.max(0, s.hitFlash - dt);
        if (s.fleeTimer > 0) {
          s.fleeTimer = Math.max(0, s.fleeTimer - dt);
        } else {
          s.timer -= dt;
          if (s.timer <= 0) {
            s.timer = randInt(2, 5);
            if (Math.random() < 0.55) {
              const ang = Math.random() * Math.PI * 2;
              s.vx = Math.cos(ang) * 26;
              s.vy = Math.sin(ang) * 26;
            } else {
              s.vx = 0; s.vy = 0;
            }
          }
        }
        if (Math.abs(s.vx) > 2) s.facing = s.vx >= 0 ? 1 : -1;
        const pad = 10;
        const canAnimalStand = (px, py) => (
          this.isTileWalkable(Math.floor((px - pad) / TILE_SIZE), Math.floor((py - 8) / TILE_SIZE)) &&
          this.isTileWalkable(Math.floor((px + pad) / TILE_SIZE), Math.floor((py - 8) / TILE_SIZE)) &&
          this.isTileWalkable(Math.floor((px - pad) / TILE_SIZE), Math.floor((py + 8) / TILE_SIZE)) &&
          this.isTileWalkable(Math.floor((px + pad) / TILE_SIZE), Math.floor((py + 8) / TILE_SIZE))
        );
        const nx = s.x + s.vx * dt;
        const ny = s.y + s.vy * dt;
        let moved = false;
        if (canAnimalStand(nx, s.y)) { s.x = nx; moved = true; } else { s.vx = -s.vx; }
        if (canAnimalStand(s.x, ny)) { s.y = ny; moved = true; } else { s.vy = -s.vy; }
        if (!moved && !canAnimalStand(s.x, s.y)) {
          const pCx = (Math.floor(s.x / (PLOT_TILES * TILE_SIZE)) * PLOT_TILES + 5) * TILE_SIZE;
          const pCy = (Math.floor(s.y / (PLOT_TILES * TILE_SIZE)) * PLOT_TILES + 5) * TILE_SIZE;
          const ang = Math.atan2(pCy - s.y, pCx - s.x);
          s.vx = Math.cos(ang) * 28;
          s.vy = Math.sin(ang) * 28;
          const fx = s.x + s.vx * dt;
          const fy = s.y + s.vy * dt;
          if (this.isTileWalkable(Math.floor(fx / TILE_SIZE), Math.floor(fy / TILE_SIZE))) {
            s.x = fx; s.y = fy;
          }
        }
      }
    }

    getTileFlora(tx, ty, biome) {
      if (!this._floraCache || this._floraSeed !== this.seed) {
        this._floraCache = new Map();
        this._floraSeed = this.seed;
      }
      const key = `${tx},${ty},${biome}`;
      const cached = this._floraCache.get(key);
      if (cached !== undefined) return cached;

      const s = this.seed || 1337;
      let h = (tx * 374761393 + ty * 668265263 + s * 1442695041) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      const roll = h % 100;
      const ox = 11 + ((h >>> 7) % 26);
      const oy = 12 + ((h >>> 13) % 24);
      const h2 = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;

      let res = null;
      if (biome === 'pradera') {
        if (roll < 24) {
          res = { kind: 'tuft', col: h2 % 4, row: (h2 >>> 2) % 3, size: 18 + (h2 % 6), ox, oy, sway: true };
        } else if (roll < 35) {
          res = { kind: 'flowers', palette: h2 % 4, count: 2 + (h2 % 3), ox, oy, sway: true };
        } else if (roll < 44) {
          const natKeys = ['nat_flower', 'nat_leaf', 'deco_fern_1', 'deco_fern_2'];
          res = { kind: 'sprite', key: natKeys[h2 % natKeys.length], size: 22 + (h2 % 6), ox, oy, sway: true };
        } else if (roll < 53) {
          const shKeys = ['nat_mushroom', 'deco_bush_1', 'deco_shroom_1', 'deco_shroom_2'];
          res = { kind: 'sprite', key: shKeys[h2 % shKeys.length], size: (h2 % 4 === 1) ? 23 : 20, ox, oy, sway: false };
        } else if (roll < 56) {
          res = { kind: 'sprite', key: 'deco_pebble_1', size: 16 + (h2 % 4), ox, oy, sway: false };
        }
      } else if (biome === 'desierto') {
        if (roll < 14) {
          res = { kind: 'blade', color: '#d4a348', highlight: '#f3d17c', ox, oy, sway: true };
        } else if (roll < 22) {
          res = { kind: 'sprite', key: 'deco_thorn_bush', size: 19 + (h2 % 5), ox, oy, sway: true };
        } else if (roll < 27) {
          res = { kind: 'succulent', ox, oy };
        } else if (roll < 31) {
          res = { kind: 'sprite', key: 'deco_pebble_1', size: 16 + (h2 % 4), ox, oy, sway: false };
        }
      } else if (biome === 'bosque_oscuro') {
        if (roll < 16) {
          const bKeys = ['deco_dark_bush', 'deco_berry_bush', 'deco_thorn_bush'];
          res = { kind: 'sprite', key: bKeys[h2 % bKeys.length], size: 20 + (h2 % 6), ox, oy, sway: true };
        } else if (roll < 30) {
          const gKeys = ['deco_glow_shroom_b', 'deco_glow_shroom_g', 'deco_shroom_p'];
          res = { kind: 'sprite', key: gKeys[h2 % gKeys.length], size: 17 + (h2 % 5), ox, oy, glow: true };
        } else if (roll < 41) {
          const mKeys = ['nat_mushroom', 'deco_shroom_2', 'deco_shroom_3'];
          res = { kind: 'sprite', key: mKeys[h2 % mKeys.length], size: 19 + (h2 % 4), ox, oy, sway: false };
        } else if (roll < 49) {
          const uKeys = ['undead_bones', 'undead_dead_arm', 'undead_grave'];
          res = { kind: 'sprite', key: uKeys[h2 % uKeys.length], size: uKeys[h2 % uKeys.length] === 'undead_grave' ? 24 : 18, ox, oy, sway: false };
        } else if (roll < 58) {
          res = { kind: 'blade', color: '#2e6f56', highlight: '#65b891', ox, oy, sway: true };
        }
      } else if (biome === 'montanas_heladas') {
        if (roll < 15) {
          res = { kind: 'blade', color: '#5b8fa8', highlight: '#b8e3f5', ox, oy, sway: true };
        } else if (roll < 24) {
          res = { kind: 'sprite', key: 'deco_pebble_1', size: 17 + (h2 % 4), ox, oy, sway: false };
        } else if (roll < 30) {
          res = { kind: 'sprite', key: 'deco_glow_shroom_b', size: 17 + (h2 % 4), ox, oy, glow: true };
        } else if (roll < 35) {
          res = { kind: 'sprite', key: 'deco_fern_1', size: 20, ox, oy, sway: true };
        }
      } else if (biome === 'tierras_volcanicas') {
        if (roll < 13) {
          res = { kind: 'blade', color: '#5c4138', highlight: '#e65100', ox, oy, sway: true };
        } else if (roll < 21) {
          res = { kind: 'sprite', key: 'deco_thorn_bush', size: 19 + (h2 % 4), ox, oy, sway: false };
        } else if (roll < 26) {
          res = { kind: 'sprite', key: 'deco_shroom_r', size: 17 + (h2 % 4), ox, oy, glow: true };
        } else if (roll < 31) {
          res = { kind: 'sprite', key: 'deco_pebble_1', size: 17 + (h2 % 4), ox, oy, sway: false };
        }
      }

      if (this._floraCache.size > 4000) this._floraCache.clear();
      this._floraCache.set(key, res);
      return res;
    }
  }

  Balaclava.getPlotBiome = getPlotBiome;
  Balaclava.getPlotBasePrice = getPlotBasePrice;
  Balaclava.DUNGEON_GATES = DUNGEON_GATES;
  Balaclava.NODE_DISPLAY_NAMES = Balaclava.NODE_DISPLAY_NAMES || NODE_DISPLAY_NAMES;
  Balaclava.ALTAR_DEFS = ALTAR_DEFS;
  Balaclava.EASTER_EGG_DEFS = EASTER_EGG_DEFS;
  Balaclava.WorldManager = WorldManager;
})();
