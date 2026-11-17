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

    _smoothNoise2D(x, y, seed) {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const fx = x - ix;
      const fy = y - iy;
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      const a = hash2D(ix, iy, seed);
      const b = hash2D(ix + 1, iy, seed);
      const c = hash2D(ix, iy + 1, seed);
      const d = hash2D(ix + 1, iy + 1, seed);
      return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
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
      const hasLandmark = gateHere || hasAltar || hasEe || hasSecret;
      const worldSeed = this.worldSeed || 901;
      const seedBase = worldSeed + gx * 37 + gy * 101;
      const archIdx = Math.floor(hash2D(gx + 31, gy + 47, seedBase) * 6);
      const shapeRoll = hash2D(gx + 13, gy + 29, seedBase);
      const rot = hash2D(gx + 3, gy + 7, seedBase + 19) * Math.PI * 2;
      const cosR = Math.cos(rot), sinR = Math.sin(rot);

      // Vary island footprint scale, center offset, and aspect ratio dramatically across plots with generous ocean breathing room
      const scaleRoll = hash2D(gx + 71, gy + 83, seedBase + 11);
      const sizeScale = archIdx === 0 ? 1.00 + scaleRoll * 0.16
        : archIdx === 1 ? 0.84 + scaleRoll * 0.18
        : 0.76 + scaleRoll * 0.22;
      const shiftX = isCenter ? 0 : (hash2D(gx + 19, gy + 53, seedBase + 29) - 0.5) * 2.2;
      const shiftY = isCenter ? 0 : (hash2D(gx + 61, gy + 37, seedBase + 59) - 0.5) * 2.2;
      const stretchX = archIdx === 1 ? 1.14 + hash2D(gx + 5, gy + 11, seedBase + 41) * 0.30
        : 0.80 + hash2D(gx + 5, gy + 11, seedBase + 41) * 0.36;
      const stretchY = archIdx === 1 ? 0.66 + hash2D(gx + 17, gy + 23, seedBase + 67) * 0.20
        : 0.80 + hash2D(gx + 17, gy + 23, seedBase + 67) * 0.36;
      const coveCorner = Math.floor(hash2D(gx, gy, seedBase + 157) * 4);
      const coveAngle = hash2D(gx + 9, gy + 15, seedBase + 211) * Math.PI * 2;
      const hasLagoon = !isCenter && !hasLandmark && (archIdx === 5 || shapeRoll > 0.66);

      // Generate coastline first into local land mask
      const land = Array.from({ length: PLOT_TILES }, () => new Uint8Array(PLOT_TILES));
      for (let ly = 0; ly < PLOT_TILES; ly++) {
        for (let lx = 0; lx < PLOT_TILES; lx++) {
          const tx = ox + lx;
          const ty = oy + ly;
          const edgeDist = Math.min(lx, ly, PLOT_TILES - 1 - lx, PLOT_TILES - 1 - ly);
          const n = hash2D(tx, ty, worldSeed + 77);
          const wFbm = this._smoothNoise2D(tx * 0.26, ty * 0.26, worldSeed + 503) * 0.65
                     + this._smoothNoise2D(tx * 0.52, ty * 0.52, worldSeed + 809) * 0.35;

          let isLand = false;
          if (isCenter) {
            // Starter island: cozy organically fringed plateau leaving clear sea water around shores
            const dx = lx - 5.5, dy = ly - 5.5;
            const ang = Math.atan2(dy, dx);
            const lobe = 5.05 + 0.36 * Math.sin(ang * 3 + rot) + (wFbm - 0.5) * 0.9;
            isLand = edgeDist >= 1 && Math.hypot(dx, dy) <= lobe;
            if (lx >= 3 && lx <= 8 && ly >= 3 && ly <= 8) isLand = true;
          } else if (archIdx === 3) {
            // Twin / multi-lobe islets joined by a slender sandbar with water inlets on the flanks
            const ax1 = 3.1 + shiftX * 0.35, ay1 = 3.4 + shiftY * 0.35;
            const ax2 = 7.9 + shiftX * 0.35, ay2 = 7.6 + shiftY * 0.35;
            const d1 = Math.hypot((lx - ax1) / 1.02, (ly - ay1) / 0.92);
            const d2 = Math.hypot((lx - ax2) / 0.92, (ly - ay2) / 1.02);
            const bridgeD = Math.hypot(lx - 5.5, (ly - 5.5) * 1.3);
            const wobble = (wFbm - 0.5) * 1.4;
            isLand = edgeDist >= 1 && (d1 <= 2.75 + wobble || d2 <= 2.75 + wobble || bridgeD <= 1.95 + wobble * 0.4);
          } else {
            const dx = (lx - (5.5 + shiftX)) / stretchX;
            const dy = (ly - (5.5 + shiftY)) / stretchY;
            const rx = dx * cosR - dy * sinR;
            const ry = dx * sinR + dy * cosR;
            const ang = Math.atan2(ry, rx);
            const rad = Math.hypot(rx, ry);
            const lobeAmp = archIdx === 4 ? 1.05 : 0.68;
            const baseRad = (archIdx === 0 ? 4.45 : 3.85) * sizeScale;
            const lobe = baseRad
              + lobeAmp * Math.sin(ang * 2 + rot)
              + (archIdx === 4 ? 0.80 : 0.48) * Math.cos(ang * 3 - shapeRoll * 6)
              + (wFbm - 0.5) * 1.75;
            isLand = rad <= lobe;
            // Preserve crisp ocean margins while allowing rare organic capes to extend outward
            if (edgeDist === 0) {
              isLand = (archIdx === 0 && rad <= lobe - 0.45 && wFbm > 0.62);
            }
            // Sculpted coastal cove carving natural sea bays into island flanks
            if (archIdx === 2 || (shapeRoll > 0.28 && shapeRoll < 0.78 && !hasLandmark)) {
              const bDist = archIdx === 2 ? 3.2 : 3.9;
              const bx = 5.5 + Math.cos(coveAngle) * bDist;
              const by = 5.5 + Math.sin(coveAngle) * bDist;
              const coveR = archIdx === 2 ? 2.75 : 2.15;
              if (Math.hypot(lx - bx, ly - by) < coveR + (n - 0.5) * 0.4 && Math.hypot(lx - 5.5, ly - 5.5) > 2.0) {
                isLand = false;
              }
            }
            // Off-center tidal lagoon
            if (hasLagoon) {
              const lagX = 5.5 + ((coveCorner & 1) ? 1.5 : -1.5);
              const lagY = 5.5 + ((coveCorner & 2) ? 1.5 : -1.5);
              if (Math.hypot(lx - lagX, ly - lagY) < 1.7) isLand = false;
            }
          }

          // Safe central pad & landmark / NPC pad guarantee
          if (lx >= 4 && lx <= 7 && ly >= 4 && ly <= 7) isLand = true;
          if (hasLandmark && !isCenter && Math.hypot(lx - 5.5, ly - 5.5) <= 2.95) isLand = true;
          land[ly][lx] = isLand ? 1 : 0;
        }
      }

      // Guarantee single connected landmass inside the plot (prune isolated 1-2px specks, bridge larger sandbars to center)
      const visited = Array.from({ length: PLOT_TILES }, () => new Uint8Array(PLOT_TILES));
      const q = [[5, 5]];
      visited[5][5] = 1;
      for (let qi = 0; qi < q.length; qi++) {
        const [cx, cy] = q[qi];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && ny >= 0 && nx < PLOT_TILES && ny < PLOT_TILES && land[ny][nx] && !visited[ny][nx]) {
            visited[ny][nx] = 1;
            q.push([nx, ny]);
          }
        }
      }
      for (let ly = 0; ly < PLOT_TILES; ly++) {
        for (let lx = 0; lx < PLOT_TILES; lx++) {
          if (land[ly][lx] && !visited[ly][lx]) land[ly][lx] = 0;
        }
      }

      // Guarantee no 1-tile wide spikes, single-faced blocks or isolated bottlenecks without faces
      for (let pass = 0; pass < 2; pass++) {
        for (let ly = 0; ly < PLOT_TILES; ly++) {
          for (let lx = 0; lx < PLOT_TILES; lx++) {
            if (!land[ly][lx]) continue;
            if (lx >= 4 && lx <= 7 && ly >= 4 && ly <= 7) continue; // Keep center core
            const nUp = (ly > 0 && land[ly - 1][lx]) ? 1 : 0;
            const nDn = (ly < PLOT_TILES - 1 && land[ly + 1][lx]) ? 1 : 0;
            const nLt = (lx > 0 && land[ly][lx - 1]) ? 1 : 0;
            const nRt = (lx < PLOT_TILES - 1 && land[ly][lx + 1]) ? 1 : 0;
            const neighbors = nUp + nDn + nLt + nRt;
            if (neighbors <= 1 || (!nLt && !nRt && (nUp || nDn)) || (!nUp && !nDn && (nLt || nRt))) {
              land[ly][lx] = 0;
            }
          }
        }
      }

      // Paint tiles & build cohesive volcanic lava basins (clustered 2..6 tile molten craters inset from cliffs/paths)
      for (let ly = 0; ly < PLOT_TILES; ly++) {
        for (let lx = 0; lx < PLOT_TILES; lx++) {
          this.tiles[oy + ly][ox + lx] = land[ly][lx] ? 1 : 0;
        }
      }

      if (biome === 'tierras_volcanicas') {
        const poolCount = 1 + Math.floor(hash2D(gx + 17, gy + 71, seedBase + 401) * 2);
        const setVolTile = (lx, ly, val) => {
          if (lx >= 1 && ly >= 1 && lx < PLOT_TILES - 1 && ly < PLOT_TILES - 1) {
            this.tiles[oy + ly][ox + lx] = val;
          }
        };
        for (let p = 0; p < poolCount; p++) {
          const pAng = hash2D(gx + p * 7, gy + p * 13, seedBase + 419) * Math.PI * 2;
          const pDist = 2.6 + hash2D(gx + p * 11, gy + p * 19, seedBase + 433) * 1.1;
          const cx = Math.min(PLOT_TILES - 4, Math.max(2, Math.round(5.5 + Math.cos(pAng) * pDist)));
          const cy = Math.min(PLOT_TILES - 4, Math.max(2, Math.round(5.5 + Math.sin(pAng) * pDist)));
          const shapeOpts = [
            [[cx, cy], [cx + 1, cy], [cx, cy + 1], [cx + 1, cy + 1], [cx + 2, cy + 1]],
            [[cx, cy], [cx + 1, cy], [cx - 1, cy + 1], [cx, cy + 1], [cx + 1, cy + 1]],
            [[cx, cy], [cx, cy + 1], [cx + 1, cy + 1], [cx + 1, cy + 2]],
            [[cx, cy], [cx + 1, cy], [cx + 2, cy], [cx + 1, cy + 1]]
          ];
          const chosen = shapeOpts[(gx + gy + p) % shapeOpts.length];
          const valid = chosen.filter(([lx, ly]) => {
            if (lx < 2 || ly < 2 || lx >= PLOT_TILES - 2 || ly >= PLOT_TILES - 2) return false;
            if (lx >= 4 && lx <= 7 && ly >= 4 && ly <= 7) return false;
            if (hasLandmark && lx >= 3 && lx <= 8 && ly >= 3 && ly <= 8) return false;
            return true;
          });
          if (valid.length >= 3) {
            // Ensure solid basalt bank framing the crater before carving sunken lava inside
            for (const [lx, ly] of valid) {
              for (let oy2 = -1; oy2 <= 1; oy2++) {
                for (let ox2 = -1; ox2 <= 1; ox2++) {
                  const nx = lx + ox2, ny = ly + oy2;
                  if (nx >= 1 && ny >= 1 && nx < PLOT_TILES - 1 && ny < PLOT_TILES - 1 && this.tiles[oy + ny][ox + nx] === 0) {
                    setVolTile(nx, ny, 1);
                  }
                }
              }
            }
            for (const [lx, ly] of valid) this.tiles[oy + ly][ox + lx] = 4;
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

      // Prune tiny orphan 1-tile or 2-tile lava scraps clipped by landmark pads or borders (keep cohesive >=3-tile calderas)
      const visitedLava = new Uint8Array(WORLD_TILES * WORLD_TILES);
      for (let ty = 0; ty < WORLD_TILES; ty++) {
        for (let tx = 0; tx < WORLD_TILES; tx++) {
          if (this.tiles[ty][tx] !== 4 || visitedLava[ty * WORLD_TILES + tx]) continue;
          const comp = [[tx, ty]];
          visitedLava[ty * WORLD_TILES + tx] = 1;
          for (let i = 0; i < comp.length; i++) {
            const [cx, cy] = comp[i];
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = cx + dx, ny = cy + dy;
              if (nx < 0 || ny < 0 || nx >= WORLD_TILES || ny >= WORLD_TILES) continue;
              const idx = ny * WORLD_TILES + nx;
              if (!visitedLava[idx] && this.tiles[ny][nx] === 4) {
                visitedLava[idx] = 1;
                comp.push([nx, ny]);
              }
            }
          }
          if (comp.length < 3) {
            for (const [cx, cy] of comp) this.tiles[cy][cx] = 1;
          }
        }
      }
    }

    // Seamlessly connect borders between any two adjacent unlocked islands organically (varied continental merges, winding isthmuses, and wooden bridges) so zero repetitive water moats appear.
    stitchUnlockedBorders() {
      this.connectorTiles = new Set();
      const seed = (this.worldSeed || 901);
      const clearNode = (tx, ty) => {
        this.nodes = this.nodes.filter(n => n.tx !== tx || n.ty !== ty || (n.kind !== 'fish_spot' && n.kind !== 'rock'));
      };
      const setLandOrConnector = (x, y, asConnectorIfLocked = false, tileVal = 1) => {
        if (!this.tiles[y] || this.tiles[y][x] === undefined) return;
        const pgx = Math.floor(x / PLOT_TILES);
        const pgy = Math.floor(y / PLOT_TILES);
        const unlocked = this.isPlotUnlocked(pgx, pgy);
        if (unlocked) {
          if (tileVal === 3 && this.tiles[y][x] === 1) return;
          this.tiles[y][x] = tileVal;
          clearNode(x, y);
        } else if (asConnectorIfLocked) {
          this.tiles[y][x] = 1;
          this.connectorTiles.add(`${x},${y}`);
          clearNode(x, y);
        }
      };

      const ensureConnectedWalkable = (sx, sy, ex, ey) => {
        const minX = Math.max(0, Math.min(sx, ex) - 4);
        const maxX = Math.min(WORLD_TILES - 1, Math.max(sx, ex) + 4);
        const minY = Math.max(0, Math.min(sy, ey) - 4);
        const maxY = Math.min(WORLD_TILES - 1, Math.max(sy, ey) + 4);
        const canWalk = (tx, ty) => {
          if (tx < minX || tx > maxX || ty < minY || ty > maxY) return false;
          if (!this.isTileUnlocked(tx, ty)) return false;
          const t = this.tiles[ty]?.[tx];
          return t === 1 || t === 2 || t === 3 || t === 5;
        };
        const seen = new Set([`${sx},${sy}`]);
        const q = [[sx, sy]];
        for (let i = 0; i < q.length; i++) {
          const [cx, cy] = q[i];
          if (cx === ex && cy === ey) return;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx, ny = cy + dy;
            const k = `${nx},${ny}`;
            if (!seen.has(k) && canWalk(nx, ny)) {
              seen.add(k);
              q.push([nx, ny]);
            }
          }
        }
        // Carve gentle 2-tile walkway if disconnected
        let cx = sx, cy = sy;
        while (cx !== ex || cy !== ey) {
          setLandOrConnector(cx, cy, false, 1);
          setLandOrConnector(cx + (sx === ex ? 1 : 0), cy + (sy === ey ? 1 : 0), false, 1);
          if (cx !== ex) cx += Math.sign(ex - cx);
          else if (cy !== ey) cy += Math.sign(ey - cy);
        }
        setLandOrConnector(ex, ey, false, 1);
      };

      for (let gy = 0; gy < GRID_PLOTS; gy++) {
        for (let gx = 0; gx < GRID_PLOTS; gx++) {
          if (!this.isPlotUnlocked(gx, gy)) continue;
          const ox = gx * PLOT_TILES;
          const oy = gy * PLOT_TILES;

          // East border merge
          if (this.isPlotUnlocked(gx + 1, gy)) {
            const mode = hash2D(gx * 13 + 7, gy * 29 + 11, seed + 303);
            if (mode < 0.22) {
              // Selective continental weld leaving northern/southern bays open
              for (let k = 2; k <= 9; k++) {
                const y = oy + k;
                const n = this._smoothNoise2D(gx + 0.5, y * 0.35, seed + 701);
                const drift = Math.round((this._smoothNoise2D(gx * 1.7 + 0.2, y * 0.45, seed + 719) - 0.5) * 2.2);
                const edgeTaper = (k <= 2 || k >= 9) ? 1 : 0;
                const startD = (edgeTaper ? -2 : Math.round(-3 - n)) + drift;
                const endD = (edgeTaper ? 1 : Math.round(1 + n)) + drift;
                for (let d = startD; d <= endD; d++) {
                  setLandOrConnector(ox + PLOT_TILES + d, y, false, 1);
                }
              }
            } else if (mode < 0.68) {
              // Varied-width, sinuous isthmus keeping open ocean bays on both sides
              const startK = 2 + Math.floor(hash2D(gx + 3, gy + 17, seed + 331) * 5);
              const span = 2 + Math.floor(hash2D(gx + 19, gy + 5, seed + 347) * 3);
              const endK = Math.min(PLOT_TILES - 3, startK + span - 1);
              const curveDir = hash2D(gx + 7, gy + 31, seed + 353) < 0.5 ? -1 : 1;
              for (let k = startK; k <= endK; k++) {
                const y = oy + k;
                const t = (k - startK) / Math.max(1, endK - startK);
                const wave = Math.round(Math.sin(t * Math.PI) * curveDir);
                const w = hash2D(gx * 7 + k, gy * 11, seed + 359);
                const startD = -2 - (w > 0.55 ? 1 : 0) + wave;
                const endD = 1 + (w < 0.4 ? 1 : 0) + wave;
                for (let d = startD; d <= endD; d++) {
                  setLandOrConnector(ox + PLOT_TILES + d, y, false, 1);
                }
              }
            } else {
              // Open water channel crossed by a 2-tile wooden plank bridge with tapered shore abutments
              const by = oy + 3 + Math.floor(hash2D(gx + 41, gy + 23, seed + 373) * 5);
              for (let ky = by; ky <= by + 1; ky++) {
                for (let d = -4; d <= -2; d++) setLandOrConnector(ox + PLOT_TILES + d, ky, false, 1);
                for (let d = 1; d <= 3; d++) setLandOrConnector(ox + PLOT_TILES + d, ky, false, 1);
                for (let d = -1; d <= 0; d++) {
                  setLandOrConnector(ox + PLOT_TILES + d, ky, false, 3);
                }
              }
              if (by - 1 >= oy + 1 && hash2D(gx + 5, gy + 13, seed + 383) < 0.5) {
                setLandOrConnector(ox + PLOT_TILES - 3, by - 1, false, 1);
                setLandOrConnector(ox + PLOT_TILES + 2, by + 2, false, 1);
              }
            }
            ensureConnectedWalkable(ox + 5, oy + 5, (gx + 1) * PLOT_TILES + 5, oy + 5);
          }

          // South border merge
          if (this.isPlotUnlocked(gx, gy + 1)) {
            const mode = hash2D(gx * 31 + 13, gy * 17 + 23, seed + 409);
            if (mode < 0.22) {
              for (let k = 2; k <= 9; k++) {
                const x = ox + k;
                const n = this._smoothNoise2D(x * 0.35, gy + 0.5, seed + 739);
                const drift = Math.round((this._smoothNoise2D(x * 0.45, gy * 1.7 + 0.2, seed + 751) - 0.5) * 2.2);
                const edgeTaper = (k <= 2 || k >= 9) ? 1 : 0;
                const startD = (edgeTaper ? -2 : Math.round(-3 - n)) + drift;
                const endD = (edgeTaper ? 1 : Math.round(1 + n)) + drift;
                for (let d = startD; d <= endD; d++) {
                  setLandOrConnector(x, oy + PLOT_TILES + d, false, 1);
                }
              }
            } else if (mode < 0.68) {
              const startK = 2 + Math.floor(hash2D(gx + 11, gy + 29, seed + 439) * 5);
              const span = 2 + Math.floor(hash2D(gx + 7, gy + 43, seed + 457) * 3);
              const endK = Math.min(PLOT_TILES - 3, startK + span - 1);
              const curveDir = hash2D(gx + 17, gy + 9, seed + 461) < 0.5 ? -1 : 1;
              for (let k = startK; k <= endK; k++) {
                const x = ox + k;
                const t = (k - startK) / Math.max(1, endK - startK);
                const wave = Math.round(Math.sin(t * Math.PI) * curveDir);
                const w = hash2D(gx * 13, gy * 9 + k, seed + 467);
                const startD = -2 - (w > 0.55 ? 1 : 0) + wave;
                const endD = 1 + (w < 0.4 ? 1 : 0) + wave;
                for (let d = startD; d <= endD; d++) {
                  setLandOrConnector(x, oy + PLOT_TILES + d, false, 1);
                }
              }
            } else {
              const bx = ox + 3 + Math.floor(hash2D(gx + 53, gy + 19, seed + 491) * 5);
              for (let kx = bx; kx <= bx + 1; kx++) {
                for (let d = -4; d <= -2; d++) setLandOrConnector(kx, oy + PLOT_TILES + d, false, 1);
                for (let d = 1; d <= 3; d++) setLandOrConnector(kx, oy + PLOT_TILES + d, false, 1);
                for (let d = -1; d <= 0; d++) {
                  setLandOrConnector(kx, oy + PLOT_TILES + d, false, 3);
                }
              }
              if (bx - 1 >= ox + 1 && hash2D(gx + 21, gy + 3, seed + 503) < 0.5) {
                setLandOrConnector(bx - 1, oy + PLOT_TILES - 3, false, 1);
                setLandOrConnector(bx + 2, oy + PLOT_TILES + 2, false, 1);
              }
            }
            ensureConnectedWalkable(ox + 5, oy + 5, ox + 5, (gy + 1) * PLOT_TILES + 5);
          }

          // Preserve organic coastal lagoons at most 2x2 plot corners (~74% water bays of varied shapes, ~26% land fusion)
          if (gx + 1 < GRID_PLOTS && gy + 1 < GRID_PLOTS) {
            const uCount = (this.isPlotUnlocked(gx, gy) ? 1 : 0)
              + (this.isPlotUnlocked(gx + 1, gy) ? 1 : 0)
              + (this.isPlotUnlocked(gx, gy + 1) ? 1 : 0)
              + (this.isPlotUnlocked(gx + 1, gy + 1) ? 1 : 0);
            if (uCount >= 3) {
              const quadRoll = hash2D(gx * 47 + 3, gy * 61 + 5, seed + 909);
              if (quadRoll < 0.26) {
                const cx = ox + PLOT_TILES - 0.5 + (quadRoll - 0.13) * 3.0;
                const cy = oy + PLOT_TILES - 0.5 + (hash2D(gx, gy, seed + 929) - 0.5) * 1.8;
                const fillRad = 2.65;
                for (let dy = -2; dy <= 2; dy++) {
                  for (let dx = -2; dx <= 2; dx++) {
                    const tx = ox + PLOT_TILES + dx;
                    const ty = oy + PLOT_TILES + dy;
                    if (!this.isTileUnlocked(tx, ty)) continue;
                    const n = hash2D(tx, ty, seed + 947);
                    if (Math.hypot(tx - cx, ty - cy) <= fillRad + (n - 0.5) * 0.9) {
                      setLandOrConnector(tx, ty, false, 1);
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Close tiny trapped boxy puddles (<= 6 water tiles completely landlocked inside unlocked clusters)
      const visitedWater = new Uint8Array(WORLD_TILES * WORLD_TILES);
      for (let ty = 1; ty < WORLD_TILES - 1; ty++) {
        for (let tx = 1; tx < WORLD_TILES - 1; tx++) {
          const k0 = ty * WORLD_TILES + tx;
          if (visitedWater[k0] || this.tiles[ty][tx] !== 0 || !this.isTileUnlocked(tx, ty)) continue;
          const comp = [[tx, ty]];
          visitedWater[k0] = 1;
          let touchesOpen = false;
          for (let ci = 0; ci < comp.length; ci++) {
            const [cx, cy] = comp[ci];
            const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            for (let di = 0; di < dirs.length; di++) {
              const nx = cx + dirs[di][0];
              const ny = cy + dirs[di][1];
              if (nx < 0 || ny < 0 || nx >= WORLD_TILES || ny >= WORLD_TILES || !this.isTileUnlocked(nx, ny)) {
                touchesOpen = true;
                continue;
              }
              if (this.tiles[ny][nx] !== 0) continue;
              const nk = ny * WORLD_TILES + nx;
              if (visitedWater[nk]) continue;
              visitedWater[nk] = 1;
              comp.push([nx, ny]);
              if (comp.length > 6) touchesOpen = true;
            }
            if (touchesOpen) break;
          }
          if (!touchesOpen && comp.length <= 6) {
            for (let ci = 0; ci < comp.length; ci++) {
              this.tiles[comp[ci][1]][comp[ci][0]] = 1;
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

    _rebuildVisualBiomeGrid() {
      const sig = `${this.worldSeed || 901}:${this.plotBiomes.map(r => r.map(b => (b || 'p')[0]).join('')).join('')}`;
      const size = WORLD_TILES * WORLD_TILES;
      const out = new Array(size);
      const seed = (this.worldSeed || 901);
      const C = CENTER_PLOT || 4;
      for (let ty = 0; ty < WORLD_TILES; ty++) {
        for (let tx = 0; tx < WORLD_TILES; tx++) {
          const gx = Math.min(GRID_PLOTS - 1, Math.max(0, Math.floor(tx / PLOT_TILES)));
          const gy = Math.min(GRID_PLOTS - 1, Math.max(0, Math.floor(ty / PLOT_TILES)));
          const baseBiome = this.plotBiomes[gy]?.[gx] || 'pradera';
          const lx = tx - gx * PLOT_TILES;
          const ly = ty - gy * PLOT_TILES;
          // Preserve central landmark/starter plateau biome cleanly while organically warping outer ~3-tile border ribbons
          if (gx === C && gy === C && Math.hypot(lx - 5.5, ly - 5.5) <= 4.1) {
            out[ty * WORLD_TILES + tx] = baseBiome;
            continue;
          }
          const nx0 = this._smoothNoise2D(tx * 0.11, ty * 0.11, seed + 587);
          const nx1 = this._smoothNoise2D(tx * 0.24, ty * 0.24, seed + 613);
          const nx2 = this._smoothNoise2D(tx * 0.52, ty * 0.52, seed + 641);
          const ny0 = this._smoothNoise2D(tx * 0.11, ty * 0.11, seed + 659);
          const ny1 = this._smoothNoise2D(tx * 0.24, ty * 0.24, seed + 677);
          const ny2 = this._smoothNoise2D(tx * 0.52, ty * 0.52, seed + 709);
          const wx = tx + 0.5 + (nx0 - 0.5) * 4.8 + (nx1 - 0.5) * 3.4 + (nx2 - 0.5) * 1.6;
          const wy = ty + 0.5 + (ny0 - 0.5) * 4.8 + (ny1 - 0.5) * 3.4 + (ny2 - 0.5) * 1.6;
          const ngx = Math.min(GRID_PLOTS - 1, Math.max(0, Math.floor(wx / PLOT_TILES)));
          const ngy = Math.min(GRID_PLOTS - 1, Math.max(0, Math.floor(wy / PLOT_TILES)));
          let picked = this.plotBiomes[ngy]?.[ngx] || baseBiome;
          // Slight natural pixel dither right along different biome boundaries
          if (picked !== baseBiome) {
            const h = hash2D(tx, ty, seed + 787);
            const dxEdge = Math.abs(wx - Math.round(wx / PLOT_TILES) * PLOT_TILES);
            const dyEdge = Math.abs(wy - Math.round(wy / PLOT_TILES) * PLOT_TILES);
            if (Math.min(dxEdge, dyEdge) < 0.85 && h < 0.26) picked = baseBiome;
          }
          out[ty * WORLD_TILES + tx] = picked;
        }
      }
      this._visualBiomeGrid = out;
      this._visualBiomeSig = sig;
    }

    getVisualBiomeAtTile(tx, ty) {
      const cx = Math.min(WORLD_TILES - 1, Math.max(0, Math.floor(tx)));
      const cy = Math.min(WORLD_TILES - 1, Math.max(0, Math.floor(ty)));
      const sig = `${this.worldSeed || 901}:${this.plotBiomes.map(r => r.map(b => (b || 'p')[0]).join('')).join('')}`;
      if (!this._visualBiomeGrid || this._visualBiomeSig !== sig) {
        this._rebuildVisualBiomeGrid();
      }
      return this._visualBiomeGrid[cy * WORLD_TILES + cx] || 'pradera';
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

    getBiomeResourceScaling(gx, gy, explicitBiome = null) {
      const C = CENTER_PLOT || 4;
      const biome = explicitBiome || this.plotBiomes?.[gy]?.[gx] || 'pradera';
      const TIER = {
        pradera:            { hp: 1.00, drop: 1.00, xp: 1.00 },
        desierto:           { hp: 1.55, drop: 1.50, xp: 1.35 },
        montanas_heladas:   { hp: 2.25, drop: 2.00, xp: 1.75 },
        bosque_oscuro:      { hp: 2.95, drop: 2.55, xp: 2.20 },
        tierras_volcanicas: { hp: 3.90, drop: 3.25, xp: 2.85 }
      }[biome] || { hp: 1.00, drop: 1.00, xp: 1.00 };

      if (gx === C && gy === C && biome === 'pradera') {
        return { hpMult: 1.0, dropMult: 1.0, xpMult: 1.0 };
      }
      const radialDist = Math.hypot(gx - C, gy - C);
      const distBoost = Math.max(0, radialDist - 0.8) * 0.08;
      const hpMult = Number((TIER.hp * (1 + distBoost)).toFixed(3));
      const dropMult = Number((TIER.drop * (1 + distBoost * 0.65)).toFixed(3));
      const xpMult = Number((TIER.xp * (1 + distBoost * 0.7)).toFixed(3));
      return { hpMult, dropMult, xpMult };
    }

    getMineralDistanceMultiplier(gx, gy) {
      return this.getBiomeResourceScaling(gx, gy).hpMult;
    }

    _scaleNodeDrops(baseDrops, dropMult) {
      if (!Array.isArray(baseDrops)) return baseDrops;
      const factor = Math.max(1, dropMult || 1);
      return baseDrops.map(d => {
        if (factor <= 1.05) return { ...d };
        const isRareChance = d.chance !== undefined && d.chance < 0.30;
        const effective = isRareChance ? (1 + (factor - 1) * 0.35) : factor;
        const rawMin = d.min || 0;
        const rawMax = d.max !== undefined ? d.max : rawMin;
        const newMin = rawMin > 0 ? Math.max(rawMin, Math.round(rawMin * effective)) : 0;
        let newMax = Math.max(newMin, Math.round(rawMax * effective));
        if (d.chance === undefined && rawMax > 0 && factor >= 1.4 && newMax <= rawMax) {
          newMax = rawMax + 1;
        }
        const out = { ...d, min: newMin, max: newMax };
        if (d.chance !== undefined) {
          out.chance = Number(Math.min(0.96, d.chance * (1 + (factor - 1) * 0.18)).toFixed(3));
        }
        return out;
      });
    }

    normalizeMineralNodeHardness() {
      if (!Array.isArray(this.nodes)) return;
      for (const n of this.nodes) {
        if (!n || (n.tool !== 'pico' && n.tool !== 'hacha')) continue;
        const plotGx = Math.floor((n.tx || 0) / PLOT_TILES);
        const plotGy = Math.floor((n.ty || 0) / PLOT_TILES);
        const biome = n.biome || this.plotBiomes?.[plotGy]?.[plotGx] || 'pradera';
        const { hpMult, dropMult, xpMult } = this.getBiomeResourceScaling(plotGx, plotGy, biome);
        const baseHp = n.baseHp || n.maxHp || n.hp || 18;
        const targetMaxHp = Math.max(baseHp, Math.round(baseHp * hpMult));
        const ratio = (n.maxHp && n.maxHp > 0) ? Math.min(1, Math.max(0.05, n.hp / n.maxHp)) : 1;
        n.baseHp = baseHp;
        n.distanceMult = hpMult;
        n.dropMult = dropMult;
        n.maxHp = targetMaxHp;
        n.hp = Math.max(1, Math.round(targetMaxHp * ratio));
        if (!n.baseDrops && Array.isArray(n.drops) && !n.dropsScaled) {
          n.baseDrops = n.drops.map(d => ({ ...d }));
        }
        if (Array.isArray(n.baseDrops)) {
          n.drops = this._scaleNodeDrops(n.baseDrops, dropMult);
          n.dropsScaled = true;
        }
        if (!n.baseXp) n.baseXp = n.xp || 6;
        n.xp = Math.max(n.baseXp, Math.round(n.baseXp * xpMult));
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
        tree:           { hp: 22, tool: 'hacha', drops: [{ id: 'madera', min: 2, max: 4 }, { id: 'bayas', min: 0, max: 1, chance: 0.35 }, { id: 'manzana_roja', min: 1, max: 1, chance: 0.24 }], xp: 6 },
        giant_tree:     { hp: 46, tool: 'hacha', drops: [{ id: 'madera', min: 4, max: 7 }, { id: 'esencia_oscura', min: 1, max: 1, chance: 0.25 }, { id: 'manzana_roja', min: 1, max: 2, chance: 0.32 }], xp: 14 },
        cactus:         { hp: 18, tool: 'hacha', drops: [{ id: 'cactus', min: 1, max: 2 }, { id: 'fibra_vegetal', min: 1, max: 3 }], xp: 7 },
        bush:           { hp: 7,  tool: 'guadana', drops: [{ id: 'bayas', min: 1, max: 3 }, { id: 'fibra_vegetal', min: 1, max: 2 }], xp: 4 },
        herb_patch:     { hp: 5,  tool: 'guadana', drops: [{ id: 'hierba', min: 2, max: 3 }, { id: 'semillas', min: 1, max: 2, chance: 0.7 }], xp: 3 },
        wild_crop_patch:{ hp: 6,  tool: 'guadana', drops: [{ id: 'semillas_tomate', min: 1, max: 2, chance: 0.6 }, { id: 'semillas_maiz', min: 1, max: 2, chance: 0.5 }, { id: 'semillas_fresa', min: 1, max: 1, chance: 0.3 }], xp: 8 },
        mushroom_node:  { hp: 9,  tool: 'guadana', drops: [{ id: 'hongo_luminoso', min: 1, max: 2 }, { id: 'esporas_toxicas', min: 1, max: 2, chance: 0.55 }, { id: 'esencia_oscura', min: 1, max: 1, chance: 0.2 }], xp: 8 },
        rock:           { hp: 20, tool: 'pico', drops: [{ id: 'piedra', min: 2, max: 4 }, { id: 'carbon', min: 1, max: 1, chance: 0.3 }], xp: 6 },
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
      const isScaledNode = d.tool === 'pico' || d.tool === 'hacha';
      const scaling = isScaledNode
        ? this.getBiomeResourceScaling(plotGx, plotGy, biome)
        : { hpMult: 1.0, dropMult: 1.0, xpMult: 1.0 };
      const scaledHp = isScaledNode ? Math.max(d.hp, Math.round(d.hp * scaling.hpMult)) : d.hp;
      const scaledDrops = isScaledNode ? this._scaleNodeDrops(d.drops, scaling.dropMult) : d.drops;
      const scaledXp = isScaledNode ? Math.max(d.xp, Math.round(d.xp * scaling.xpMult)) : d.xp;
      const node = {
        id: this.nextNodeId++,
        tx, ty,
        x: (tx + 0.5) * TILE_SIZE,
        y: (ty + 0.5) * TILE_SIZE,
        kind,
        name: (activeNodeNames && activeNodeNames[kind]) || d.name || kind,
        biome,
        baseHp: d.hp,
        baseXp: d.xp,
        distanceMult: scaling.hpMult,
        dropMult: scaling.dropMult,
        hp: scaledHp,
        maxHp: scaledHp,
        tool: d.tool,
        baseDrops: d.drops.map(item => ({ ...item })),
        drops: scaledDrops,
        dropsScaled: isScaledNode,
        xp: scaledXp,
        hitAnim: 0,
        variant: randInt(0, 3)
      };
      this.nodes.push(node);
      return node;
    }

    _pickFreePlotTile(gx, gy, occupiedBuildingTiles = null) {
      const biome = this.plotBiomes[gy][gx];
      const ox = gx * PLOT_TILES;
      const oy = gy * PLOT_TILES;
      const isFree = (tx, ty) => {
        if (!this.tiles[ty] || this.tiles[ty][tx] !== 1) return false;
        if (this.getNodeAtTile(tx, ty)) return false;
        if (occupiedBuildingTiles && occupiedBuildingTiles.has(tx + ',' + ty)) return false;
        if (this.crops.some(c => c.tx === tx && c.ty === ty)) return false;
        return true;
      };

      for (let attempt = 0; attempt < 8; attempt++) {
        const cx = ox + randInt(1, PLOT_TILES - 2);
        const cy = oy + randInt(1, PLOT_TILES - 2);
        if (!isFree(cx, cy)) continue;
        if (attempt < 6 && this.getVisualBiomeAtTile(cx, cy) !== biome) continue;
        return [cx, cy];
      }

      const matchedTiles = [];
      const freeTiles = [];
      for (let ly = 1; ly <= PLOT_TILES - 2; ly++) {
        for (let lx = 1; lx <= PLOT_TILES - 2; lx++) {
          const fx = ox + lx, fy = oy + ly;
          if (isFree(fx, fy)) {
            freeTiles.push([fx, fy]);
            if (this.getVisualBiomeAtTile(fx, fy) === biome) matchedTiles.push([fx, fy]);
          }
        }
      }
      const pickPool = matchedTiles.length > 0 ? matchedTiles : freeTiles;
      return pickPool.length > 0 ? pick(pickPool) : null;
    }

    trySpawnInPlot(gx, gy, occupiedBuildingTiles = null) {
      const biome = this.plotBiomes[gy][gx];
      const spot = this._pickFreePlotTile(gx, gy, occupiedBuildingTiles);
      if (!spot) return false;
      const [tx, ty] = spot;

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
        if (Math.random() < 0.45) pool.push('malachite_vein'); // Spawn equilibrado de malaquita en desierto
        if (plotDist >= 1.4) pool.push('silver_vein', 'gold_vein', 'sulfur_vein', 'amber_vein', 'malachite_vein');
        if (Math.random() < 0.55) pool.push('platinum_vein'); // Low-density platinum veins in desert biome
        if (plotDist >= 2.3) pool.push('gold_vein', 'crystal_node', 'amber_vein', 'titanium_vein');
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

    trySpawnMineralInPlot(gx, gy, occupiedBuildingTiles = null) {
      const biome = this.plotBiomes[gy][gx];
      const spot = this._pickFreePlotTile(gx, gy, occupiedBuildingTiles);
      if (!spot) return null;
      const [tx, ty] = spot;
      const C = Balaclava.CONST.CENTER_PLOT || 4;
      const plotDist = Math.hypot(gx - C, gy - C);

      const pool = [];
      if (biome === 'pradera') {
        pool.push('rock', 'coal_vein', 'copper_vein', 'tin_vein', 'iron_vein');
        if (plotDist >= 1.1) pool.push('malachite_vein', 'iron_vein');
        if (plotDist >= 1.5) pool.push('silver_vein', 'gold_vein');
        if (plotDist >= 2.2) pool.push('jade_vein', 'gold_vein');
      } else if (biome === 'desierto') {
        pool.push('rock', 'copper_vein', 'tin_vein', 'star_sand_vein', 'sulfur_vein', 'gold_vein');
        if (Math.random() < 0.40) pool.push('malachite_vein'); // Spawn de malaquita en desierto
        if (plotDist >= 1.4) pool.push('silver_vein', 'amber_vein', 'platinum_vein', 'malachite_vein');
        else if (Math.random() < 0.25) pool.push('platinum_vein');
        if (plotDist >= 2.3) pool.push('crystal_node', 'titanium_vein');
      } else if (biome === 'bosque_oscuro') {
        pool.push('iron_vein', 'silver_vein', 'jade_vein');
        if (plotDist >= 1.4) pool.push('abyssal_crystal_vein', 'amethyst_vein');
        if (plotDist >= 2.3) pool.push('crystal_node', 'bloodstone_vein', 'orichalcum_vein');
      } else if (biome === 'montanas_heladas') {
        pool.push('rock', 'iron_vein', 'silver_vein', 'ice_crystal');
        if (plotDist >= 1.8) pool.push('gold_vein', 'platinum_vein', 'azurite_vein');
        if (plotDist >= 2.8) pool.push('sapphire_node', 'mithril_vein', 'titanium_vein', 'emerald_vein');
      } else {
        pool.push('volcanic_rock', 'sulfur_vein', 'coal_vein', 'gold_vein', 'platinum_vein', 'obsidian_vein');
        if (plotDist >= 2.5) pool.push('ruby_node', 'bloodstone_vein', 'magma_core_vein', 'mithril_vein', 'adamantite_vein');
        if (plotDist >= 3.2) pool.push('orichalcum_vein', 'diamond_vein');
      }
      return this.spawnNodeAtTile(tx, ty, pick(pool), biome);
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

      // Gentle empty-tile resource generation (~7.3s => 1.3x faster mineral/tree regen)
      this.spawnTimer += dt;
      if (this.spawnTimer >= 7.3) {
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
