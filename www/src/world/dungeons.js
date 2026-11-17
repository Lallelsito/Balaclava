(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { TILE_SIZE } = Balaclava.CONST;

  // 10 Multi-room instanced dungeons across all 5 biomes with traps, rune puzzles, chests, and multi-phase bosses.
  const DUNGEON_DEFS = {
    pradera: {
      id: 'pradera',
      themeKey: 'pradera',
      name: 'Cripta Esmeralda',
      floorColor: '#2c4034',
      wallColor: '#4e6b58',
      accentColor: '#7be06c',
      carpetKey: 'carpetRed',
      torchKey: 'torch_green',
      brazierKey: 'brazier_green',
      bannerKey: 'banner_green',
      statueKey: 'statue_knight',
      bossRelicId: 'linterna_flotante',
      boss: {
        name: 'Rey Limo Ancestral',
        hp: 520,
        dmg: 22,
        speed: 74,
        color: '#63d44a',
        drops: { fragmentos_antiguos: 1, cristales: 3, esmeraldas: 1 },
        coins: 30,
        xp: 200
      },
      enemyTypes: ['slime', 'acid_ant', 'tunneling_mole']
    },
    pradera_profunda: {
      id: 'pradera_profunda',
      themeKey: 'pradera',
      name: 'Guarnición Goblin',
      floorColor: '#2f452d',
      wallColor: '#5c7548',
      accentColor: '#aed581',
      carpetKey: 'carpetRed',
      torchKey: 'torch_green',
      brazierKey: 'brazier_green',
      bannerKey: 'banner_green',
      statueKey: 'statue_knight',
      bossRelicId: 'cetro_goblin',
      boss: {
        name: 'Rey Goblin Korak',
        hp: 720,
        dmg: 26,
        speed: 82,
        color: '#9ccc65',
        drops: { fragmentos_antiguos: 1, trofeo_goblin: 1, lingote_hierro: 4, jade: 1 },
        coins: 38,
        xp: 260
      },
      enemyTypes: ['goblin', 'orc', 'acid_ant', 'toxic_hound']
    },
    desierto: {
      id: 'desierto',
      themeKey: 'desierto',
      name: 'Templo de Arena',
      floorColor: '#5c462b',
      wallColor: '#9c7847',
      accentColor: '#ffd54f',
      carpetKey: 'carpetRed',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'banner_red',
      statueKey: 'statue_goddess',
      bossRelicId: 'brujula_estelar',
      boss: {
        name: 'Faraón Escorpión Khepra',
        hp: 1320,
        dmg: 38,
        speed: 94,
        color: '#ffab40',
        drops: { fragmentos_antiguos: 1, oro: 6, aguijon_escorpion: 2 },
        coins: 70,
        xp: 450
      },
      enemyTypes: ['scorpion', 'royal_scarab', 'tunneling_mole']
    },
    desierto_piramide: {
      id: 'desierto_piramide',
      themeKey: 'desierto_piramide',
      name: 'Pirámide Enterrada',
      floorColor: '#4c3a22',
      wallColor: '#b8864b',
      accentColor: '#ffca28',
      carpetKey: 'carpetSandstone',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'pyr_banner_red',
      statueKey: 'statue_sphinx',
      bossRelicId: 'amuleto_arena',
      boss: {
        name: 'Centurión Solar Anub',
        hp: 1580,
        dmg: 43,
        speed: 96,
        color: '#ffd54f',
        drops: { fragmentos_antiguos: 1, trofeo_faraon: 1, lingote_oro: 4, topacio: 2 },
        coins: 76,
        xp: 520
      },
      enemyTypes: ['royal_scarab', 'sand_ghoul', 'brittle_archer', 'rock_golem']
    },
    bosque_oscuro: {
      id: 'bosque_oscuro',
      themeKey: 'bosque_oscuro',
      name: 'Caverna Sombría',
      floorColor: '#241c36',
      wallColor: '#48346e',
      accentColor: '#ce93d8',
      carpetKey: 'carpetPurple',
      torchKey: 'torch_purple',
      brazierKey: 'brazier_purple',
      bannerKey: 'banner_purple',
      statueKey: 'statue_gargoyle',
      bossRelicId: 'corazon_umbrio',
      boss: {
        name: 'Archidruida del Vacío',
        hp: 3750,
        dmg: 76,
        speed: 96,
        color: '#ba68c8',
        drops: { fragmentos_antiguos: 2, esencia_oscura: 4, cristales_magicos: 3 },
        coins: 210,
        xp: 1220
      },
      enemyTypes: ['plague_bat', 'wisp', 'mushroom_purple', 'toxic_hound']
    },
    bosque_necro: {
      id: 'bosque_necro',
      themeKey: 'bosque_oscuro',
      name: 'Necrópolis Real',
      floorColor: '#1e1629',
      wallColor: '#573b66',
      accentColor: '#b39ddb',
      carpetKey: 'carpetPurple',
      torchKey: 'torch_purple',
      brazierKey: 'brazier_purple',
      bannerKey: 'banner_purple',
      statueKey: 'statue_gargoyle',
      bossRelicId: 'calavera_espectral',
      boss: {
        name: 'Soberano Esqueleto Malakor',
        hp: 4050,
        dmg: 80,
        speed: 102,
        color: '#9575cd',
        drops: { fragmentos_antiguos: 2, trofeo_exanime: 1, sanguinaria: 2, esencia_oscura: 5 },
        coins: 228,
        xp: 1320
      },
      enemyTypes: ['grave_revenant', 'ghastly_eye', 'plague_bat', 'skeleton_mage']
    },
    montanas_heladas: {
      id: 'montanas_heladas',
      themeKey: 'montanas_heladas',
      name: 'Ciudadela Helada',
      floorColor: '#254254',
      wallColor: '#66a7cc',
      accentColor: '#80deea',
      carpetKey: 'carpetBlue',
      torchKey: 'torch_blue',
      brazierKey: 'brazier_blue',
      bannerKey: 'banner_blue',
      statueKey: 'statue_knight',
      bossRelicId: 'corona_escarcha',
      boss: {
        name: 'Coloso de Escarcha',
        hp: 2520,
        dmg: 60,
        speed: 88,
        color: '#80e5ff',
        drops: { fragmentos_antiguos: 2, esmeraldas: 4, lingotes_especiales: 2 },
        coins: 135,
        xp: 760
      },
      enemyTypes: ['wolf', 'golem', 'cave_spider', 'tunneling_mole']
    },
    montanas_glaciar: {
      id: 'montanas_glaciar',
      themeKey: 'montanas_heladas',
      name: 'Santuario del Glaciar Arcano',
      floorColor: '#1c3547',
      wallColor: '#4b87a8',
      accentColor: '#4fc3f7',
      carpetKey: 'carpetBlue',
      torchKey: 'torch_blue',
      brazierKey: 'brazier_blue',
      bannerKey: 'banner_blue',
      statueKey: 'statue_goddess',
      bossRelicId: 'grimorio_glaciar',
      boss: {
        name: 'Archimago Boreal Vael',
        hp: 2850,
        dmg: 65,
        speed: 98,
        color: '#4fc3f7',
        drops: { fragmentos_antiguos: 2, esquirla_hielo: 4, lingote_platino: 3, amatista: 2 },
        coins: 155,
        xp: 920
      },
      enemyTypes: ['skeleton_mage', 'shadow_wolf', 'ghastly_eye', 'brittle_archer']
    },
    tierras_volcanicas: {
      id: 'tierras_volcanicas',
      themeKey: 'tierras_volcanicas',
      name: 'Ciudadela Carmesí',
      floorColor: '#36191a',
      wallColor: '#7a2c24',
      accentColor: '#ff7043',
      carpetKey: 'carpetRed',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'banner_red',
      statueKey: 'statue_dragon',
      bossRelicId: 'ojo_abismo',
      boss: {
        name: 'Dragón Carmesí Ignis',
        hp: 5400,
        dmg: 96,
        speed: 104,
        color: '#ff5722',
        drops: { fragmentos_antiguos: 3, trofeo_dragon_fuego: 1, diamantes: 4, nucleo_solar: 2 },
        coins: 300,
        xp: 1680
      },
      enemyTypes: ['lava_ant', 'magma', 'fire_elem', 'beetle_fire']
    },
    volcan_abismo: {
      id: 'volcan_abismo',
      themeKey: 'tierras_volcanicas',
      name: 'Abismo del Señor Balak',
      floorColor: '#291214',
      wallColor: '#8a241b',
      accentColor: '#ff5252',
      carpetKey: 'carpetRed',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'banner_red',
      statueKey: 'statue_dragon',
      bossRelicId: 'nucleo_volcanico',
      boss: {
        name: 'Señor Ígneo Balak',
        hp: 6200,
        dmg: 108,
        speed: 110,
        color: '#ff1744',
        drops: { fragmentos_antiguos: 4, lingote_celestial: 2, diamantes: 6, material_volcanico: 8 },
        coins: 355,
        xp: 1850
      },
      enemyTypes: ['lava_ant', 'cultist', 'imp', 'goblin_tnt']
    },

    // === FASE 5: +14 MAZMORRAS COMPLETAS (TOTAL 24 MAZMORRAS ÚNICAS) ===
    pradera_madriguera: {
      id: 'pradera_madriguera',
      themeKey: 'cave',
      chestTheme: 'gold',
      name: 'Madriguera de Zapadores',
      floorColor: '#2a2a24',
      wallColor: '#5c5346',
      accentColor: '#ffab91',
      carpetKey: 'carpetGreen',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'banner_green',
      statueKey: 'statue_knight',
      bossRelicId: 'emblema_cazador_madri',
      boss: {
        name: 'Jefe Zapador Skrag',
        hp: 820,
        dmg: 28,
        speed: 88,
        color: '#ffab91',
        drops: { fragmentos_antiguos: 1, polvora: 6, llave_dorada: 1, lingote_cobre: 4 },
        coins: 46,
        xp: 310
      },
      enemyTypes: ['goblin_sapper', 'goblin_barrel', 'goblin_archer', 'rat_giant']
    },
    pradera_baston: {
      id: 'pradera_baston',
      themeKey: 'pradera',
      chestTheme: 'gold',
      name: 'Bastión del Jabalí Verde',
      floorColor: '#243426',
      wallColor: '#4c6e4e',
      accentColor: '#aed581',
      carpetKey: 'carpetGreen',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'banner_green',
      statueKey: 'statue_knight',
      bossRelicId: 'baston_claro_pradera',
      boss: {
        name: 'Capitán Jabalí Grok',
        hp: 960,
        dmg: 31,
        speed: 92,
        color: '#aed581',
        drops: { fragmentos_antiguos: 1, cuero: 8, lingote_hierro: 4, llave_dorada: 1 },
        coins: 54,
        xp: 360
      },
      enemyTypes: ['goblin_raider', 'goblin_archer', 'orc', 'acid_ant']
    },
    pradera_bosquecillo: {
      id: 'pradera_bosquecillo',
      themeKey: 'pradera',
      chestTheme: 'gold',
      name: 'Santuario del Claro Vivo',
      floorColor: '#1f362d',
      wallColor: '#3f7359',
      accentColor: '#81c784',
      carpetKey: 'carpetGreen',
      torchKey: 'torch_blue',
      brazierKey: 'brazier_blue',
      bannerKey: 'banner_green',
      statueKey: 'statue_goddess',
      bossRelicId: 'flor_bosquecillo_ancestral',
      boss: {
        name: 'Guardián Silvestre Orin',
        hp: 1120,
        dmg: 34,
        speed: 90,
        color: '#66bb6a',
        drops: { fragmentos_antiguos: 1, flor_cristal: 3, jade: 2, grimorio_espinas_tierra: 1 },
        coins: 62,
        xp: 410
      },
      enemyTypes: ['vine_snake', 'wisp_green', 'slime_toxic', 'goblin_archer']
    },
    desierto_oasis: {
      id: 'desierto_oasis',
      themeKey: 'desierto',
      chestTheme: 'frost',
      name: 'Gruta del Oasis Esmeralda',
      floorColor: '#243638',
      wallColor: '#48767d',
      accentColor: '#4dd0e1',
      carpetKey: 'carpetBlue',
      torchKey: 'torch_blue',
      brazierKey: 'brazier_blue',
      bannerKey: 'banner_blue',
      statueKey: 'statue_sphinx',
      bossRelicId: 'astrolabio_oasis_perdido',
      boss: {
        name: 'Sierpe Esmeralda Sotek',
        hp: 1750,
        dmg: 46,
        speed: 102,
        color: '#26c6da',
        drops: { fragmentos_antiguos: 2, esmeraldas: 3, llave_zafiro: 1, tablilla_runica: 2 },
        coins: 86,
        xp: 580
      },
      enemyTypes: ['cobra', 'vine_snake', 'royal_scarab', 'slime_blue']
    },
    desierto_catacumbas: {
      id: 'desierto_catacumbas',
      themeKey: 'desierto_piramide',
      chestTheme: 'gold',
      name: 'Catacumbas de los Escribas',
      floorColor: '#362b1c',
      wallColor: '#8c7040',
      accentColor: '#ffd54f',
      carpetKey: 'carpetRed',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'banner_red',
      statueKey: 'statue_sphinx',
      bossRelicId: 'caliz_catacumbas_arena',
      boss: {
        name: 'Sumo Escriba Khafre',
        hp: 1960,
        dmg: 50,
        speed: 96,
        color: '#ffca28',
        drops: { fragmentos_antiguos: 2, llave_esqueleto: 1, ambar_desierto: 3, tablilla_runica: 3 },
        coins: 98,
        xp: 640
      },
      enemyTypes: ['skel_swordsman', 'skel_crossbow', 'skel_spearman', 'sand_ghoul']
    },
    desierto_solario: {
      id: 'desierto_solario',
      themeKey: 'desierto_piramide',
      chestTheme: 'crimson',
      name: 'Solario del Faraón Radiante',
      floorColor: '#3d2817',
      wallColor: '#9e6c2b',
      accentColor: '#ffb300',
      carpetKey: 'carpetRed',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'banner_red',
      statueKey: 'statue_sphinx',
      bossRelicId: 'disco_solario_eterno',
      boss: {
        name: 'Faraón Radiante Ra-Men',
        hp: 2200,
        dmg: 55,
        speed: 100,
        color: '#ffb300',
        drops: { fragmentos_antiguos: 2, lingote_oro: 5, topacio: 3, llave_jefe: 1 },
        coins: 112,
        xp: 710
      },
      enemyTypes: ['skel_spearman', 'skel_crossbow', 'royal_scarab', 'rock_golem']
    },
    bosque_laboratorio: {
      id: 'bosque_laboratorio',
      themeKey: 'arcane_lab',
      chestTheme: 'frost',
      name: 'Laboratorio Alquímico Sellado',
      floorColor: '#1d2738',
      wallColor: '#485b7a',
      accentColor: '#7e57c2',
      carpetKey: 'carpetPurple',
      torchKey: 'torch_blue',
      brazierKey: 'brazier_purple',
      bannerKey: 'banner_purple',
      statueKey: 'statue_gargoyle',
      bossRelicId: 'vial_laboratorio_arcano',
      boss: {
        name: 'Autómata Alquímico X-09',
        hp: 4350,
        dmg: 84,
        speed: 100,
        color: '#7e57c2',
        drops: { fragmentos_antiguos: 2, cristales_magicos: 5, llave_zafiro: 1, grimorio_furia_arcana: 1 },
        coins: 245,
        xp: 1420
      },
      enemyTypes: ['ghost_spectral', 'void_jelly', 'skel_mage_dark', 'floating_eye']
    },
    bosque_arana: {
      id: 'bosque_arana',
      themeKey: 'bosque_oscuro',
      chestTheme: 'gold',
      name: 'Nido de la Emperatriz Arácnea',
      floorColor: '#211c2c',
      wallColor: '#4e3f66',
      accentColor: '#9ccc65',
      carpetKey: 'carpetPurple',
      torchKey: 'torch_purple',
      brazierKey: 'brazier_purple',
      bannerKey: 'banner_purple',
      statueKey: 'statue_gargoyle',
      bossRelicId: 'glandula_reina_aracnida',
      boss: {
        name: 'Emperatriz Arácnea Syla',
        hp: 4600,
        dmg: 87,
        speed: 108,
        color: '#9ccc65',
        drops: { fragmentos_antiguos: 2, seda_arana: 8, esmeraldas: 3, grimorio_daga_veneno: 1 },
        coins: 260,
        xp: 1500
      },
      enemyTypes: ['spider', 'cave_spider', 'toxic_hound', 'vine_snake']
    },
    bosque_pantano: {
      id: 'bosque_pantano',
      themeKey: 'cave',
      chestTheme: 'frost',
      name: 'Sumidero del Pantano Pútrido',
      floorColor: '#1b2b27',
      wallColor: '#39594e',
      accentColor: '#26a69a',
      carpetKey: 'carpetGreen',
      torchKey: 'torch_blue',
      brazierKey: 'brazier_blue',
      bannerKey: 'banner_green',
      statueKey: 'statue_gargoyle',
      bossRelicId: 'perla_pantano_putrido',
      boss: {
        name: 'Hidra del Pantano Mog',
        hp: 4900,
        dmg: 90,
        speed: 96,
        color: '#26a69a',
        drops: { fragmentos_antiguos: 2, esporas_toxicas: 6, esencia_oscura: 5, llave_esqueleto: 1 },
        coins: 280,
        xp: 1590
      },
      enemyTypes: ['slime_toxic', 'mushroom_purple', 'wisp_green', 'void_jelly']
    },
    montanas_mina: {
      id: 'montanas_mina',
      themeKey: 'cave',
      chestTheme: 'frost',
      name: 'Mina Profunda de Diamante',
      floorColor: '#202d3b',
      wallColor: '#4c6c8c',
      accentColor: '#4fc3f7',
      carpetKey: 'carpetBlue',
      torchKey: 'torch_blue',
      brazierKey: 'brazier_blue',
      bannerKey: 'banner_blue',
      statueKey: 'statue_knight',
      bossRelicId: 'arca_mina_profunda',
      boss: {
        name: 'Gólem de Diamante Boreal',
        hp: 3100,
        dmg: 68,
        speed: 92,
        color: '#4fc3f7',
        drops: { fragmentos_antiguos: 3, diamantes: 5, azurita_glacial: 4, llave_zafiro: 1 },
        coins: 172,
        xp: 1010
      },
      enemyTypes: ['frost_jelly', 'slime_blue', 'tunneling_mole', 'golem']
    },
    montanas_fortaleza: {
      id: 'montanas_fortaleza',
      themeKey: 'montanas_heladas',
      chestTheme: 'frost',
      name: 'Fortaleza Eterna del Norte',
      floorColor: '#1f3042',
      wallColor: '#547da3',
      accentColor: '#90caf9',
      carpetKey: 'carpetBlue',
      torchKey: 'torch_blue',
      brazierKey: 'brazier_blue',
      bannerKey: 'banner_blue',
      statueKey: 'statue_knight',
      bossRelicId: 'sello_fortaleza_norte',
      boss: {
        name: 'Comandante Valkir Thrond',
        hp: 3400,
        dmg: 73,
        speed: 104,
        color: '#90caf9',
        drops: { fragmentos_antiguos: 3, lingote_titanio: 4, llave_jefe: 1, yelmo_vikingo: 1 },
        coins: 192,
        xp: 1120
      },
      enemyTypes: ['dark_lancer', 'shadow_wolf', 'skel_mage_dark', 'frost_jelly']
    },
    volcan_fragua: {
      id: 'volcan_fragua',
      themeKey: 'fire_zone',
      chestTheme: 'crimson',
      name: 'Fragua del Titán Ígneo',
      floorColor: '#301715',
      wallColor: '#7a3324',
      accentColor: '#ff7043',
      carpetKey: 'carpetRed',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'pyr_banner_red',
      statueKey: 'statue_dragon',
      bossRelicId: 'anillo_fragua_rubi',
      boss: {
        name: 'Forjador Titánico Hephaest',
        hp: 6400,
        dmg: 110,
        speed: 106,
        color: '#ff7043',
        drops: { fragmentos_antiguos: 3, lingote_oricalco: 4, rubi: 3, llave_rubi: 1 },
        coins: 370,
        xp: 1920
      },
      enemyTypes: ['crimson_jelly', 'slime_red', 'flaming_skull', 'beetle_fire']
    },
    volcan_caldera: {
      id: 'volcan_caldera',
      themeKey: 'fire_zone',
      chestTheme: 'crimson',
      name: 'Caldera del Fénix Solar',
      floorColor: '#381914',
      wallColor: '#8c3520',
      accentColor: '#ffca28',
      carpetKey: 'carpetRed',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'banner_red',
      statueKey: 'statue_dragon',
      bossRelicId: 'esfera_caldera_solar',
      boss: {
        name: 'Fénix Magmático Zyr',
        hp: 6750,
        dmg: 114,
        speed: 114,
        color: '#ffca28',
        drops: { fragmentos_antiguos: 4, pluma_fenix: 3, polvo_estelar: 3, llave_jefe: 1 },
        coins: 395,
        xp: 2020
      },
      enemyTypes: ['flaming_skull', 'fire_elem', 'crimson_jelly', 'imp']
    },
    volcan_trono_ceniza: {
      id: 'volcan_trono_ceniza',
      themeKey: 'fire_zone',
      chestTheme: 'crimson',
      name: 'Trono de Ceniza Primordial',
      floorColor: '#260f12',
      wallColor: '#961e28',
      accentColor: '#ff1744',
      carpetKey: 'carpetRed',
      torchKey: 'torch_orange',
      brazierKey: 'brazier_orange',
      bannerKey: 'banner_red',
      statueKey: 'statue_dragon',
      bossRelicId: 'idolo_trono_ceniza',
      boss: {
        name: 'Emperador Ceniza Kael-Vorn',
        hp: 7400,
        dmg: 122,
        speed: 118,
        color: '#ff1744',
        drops: { fragmentos_antiguos: 5, gema_alma: 3, lingote_celestial: 4, llave_maestra_mazmorra: 1, grimorio_lluvia_meteoros: 1 },
        coins: 425,
        xp: 2300
      },
      enemyTypes: ['flaming_skull', 'dark_lancer', 'crimson_jelly', 'magma']
    }
  };

  // Fixed multi-wing labyrinth blueprint: 75x39 tiles (24 unique dungeons across 5 biomes & 7 architectural layouts)
  const DUNGEON_TIER_LIST = [
    'pradera', 'pradera_profunda', 'pradera_madriguera', 'pradera_baston', 'pradera_bosquecillo',
    'desierto', 'desierto_piramide', 'desierto_oasis', 'desierto_catacumbas', 'desierto_solario',
    'montanas_heladas', 'montanas_glaciar', 'montanas_mina', 'montanas_fortaleza',
    'bosque_oscuro', 'bosque_necro', 'bosque_laboratorio', 'bosque_arana', 'bosque_pantano',
    'tierras_volcanicas', 'volcan_abismo', 'volcan_fragua', 'volcan_caldera', 'volcan_trono_ceniza'
  ];

  class DungeonInstance {
    constructor(dungeonId, returnPos, playerLevel = 1, opts = {}) {
      this.def = DUNGEON_DEFS[dungeonId] || DUNGEON_DEFS.pradera;
      this.id = this.def.id;
      this.isCorrupted = Boolean(opts && opts.isCorrupted);
      this.abyssFloor = (opts && opts.abyssFloor) ? Math.max(1, Math.floor(opts.abyssFloor)) : 0;
      this.abyssMods = (opts && Array.isArray(opts.abyssMods)) ? opts.abyssMods : [];
      this.abyssScale = (opts && opts.abyssScale) || null;
      this.tier = Math.max(0, DUNGEON_TIER_LIST.indexOf(this.id));
      this.playerLevel = Math.max(1, playerLevel || 1);
      this.levelScale = 1 + Math.max(0, this.playerLevel - (1 + this.tier * 2)) * 0.10;
      this.returnPos = { ...returnPos };
      this.width = 75;
      this.height = 39;
      this.rooms = [];
      this.grid = []; // 0=wall/void, 1=floor, 2=trap, 3=bossGate(closed), 4=exit_portal, 5=wingGate(closed), 6=vaultGate(closed)
      this.runes = []; // { tx, ty, active, kind: 'wing'|'seq'|'seal', order?, label }
      this.chests = []; // { tx, ty, opened, bonus, isBossChest }
      this.enemies = [];
      this.boss = null;
      this.wingsOpen = false;
      this.vaultOpen = false;
      this.miniBossDefeated = false;
      this.seqProgress = 0; // 0 -> 1 -> 2 -> 3
      this.gateOpen = false;
      this.bossLocked = false;
      this.wingDoorTiles = [];
      this.vaultDoorTiles = [];
      this.bossGateTiles = [];
      this.carpetTiles = new Set();
      this.bossRoomMinX = 34;
      this.archetype = 0;
      this.completed = false;
      this.trapTimer = 0;
      this.trapsActive = false;
      this.hazardZones = [];
      this.bossArenaCenter = { tx: 44, ty: 15 };
      this.buildLayout();
    }

    buildLayout() {
      const W = this.width;
      const H = this.height;
      this.grid = Array.from({ length: H }, () => new Uint8Array(W));
      this.rooms = [];
      this.wingDoorTiles = [];
      this.vaultDoorTiles = [];
      this.bossGateTiles = [];
      this.carpetTiles = new Set();

      // Seeded procedural PRNG (per dungeon tier + genuine per-run layout variance)
      let rngState = ((this.tier + 1) * 1664525 + Math.floor(Math.random() * 999983)) >>> 0;
      const rng = () => {
        rngState = (rngState * 1664525 + 1013904223) >>> 0;
        return rngState / 4294967296;
      };
      this.archetype = (this.tier + Math.floor(rng() * 7)) % 7;
      const arch = this.archetype;

      const carveRect = (x0, y0, x1, y1, val = 1) => {
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            if (x > 0 && y > 0 && x < W - 1 && y < H - 1) this.grid[y][x] = val;
          }
        }
      };

      const addRoom = (name, x0, y0, x1, y1) => {
        carveRect(x0, y0, x1, y1, 1);
        this.rooms.push({ name, x0, y0, x1, y1, cx: Math.floor((x0 + x1) / 2), cy: Math.floor((y0 + y1) / 2) });
      };

      const addDoors = (arr, x0, y0, x1, y1, tileVal) => {
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            this.grid[y][x] = tileVal;
            arr.push([x, y]);
          }
        }
      };

      let portal = { tx: 2, ty: 19 };
      let spawnTile = { tx: 4, ty: 19 };
      let wingRects = [];
      let trapCandidates = [];
      let pillarCandidates = [];
      let torchCandidates = [];
      let propCandidates = [];
      let mobSpots = [];
      let miniBossSpot = { tx: 39, ty: 31 };
      let bossSpawn = { tx: 67, ty: 19 };
      let carpetBoxes = [];

      if (arch === 0) {
        // Archetype 0: Gran Ciudadela de 11 Salas
        portal = { tx: 2, ty: 19 };
        spawnTile = { tx: 4, ty: 19 };
        addRoom('Entrada Principal', 1, 16, 7, 22);
        carveRect(8, 18, 10, 20);
        addRoom('Sala de Recepción', 11, 15, 16, 23);
        carveRect(17, 18, 18, 20);
        addRoom('Salón Central de Runas', 19, 13, 29, 25);
        addDoors(this.wingDoorTiles, 23, 12, 25, 12, 5);
        addRoom('Galería Norte', 18, 6, 27, 11);
        carveRect(28, 7, 30, 9);
        addRoom('Cámara del Enigma Norte', 31, 2, 42, 10);
        addDoors(this.vaultDoorTiles, 43, 4, 43, 6, 6);
        addRoom('Bóveda del Tesoro Norte', 44, 2, 49, 7);
        addDoors(this.wingDoorTiles, 23, 26, 25, 26, 5);
        addRoom('Cuartel de Vanguardia Sur', 18, 27, 27, 32);
        carveRect(28, 29, 30, 31);
        addRoom('Recinto del Guardián', 31, 27, 43, 36);
        carveRect(30, 18, 32, 20);
        addRoom('Salón de Estatuas', 33, 14, 41, 24);
        carveRect(42, 18, 44, 20);
        addRoom('Antecámara del Jefe', 45, 15, 51, 23);
        addDoors(this.bossGateTiles, 52, 17, 52, 21, 3);
        addRoom('Arena del Señor', 53, 9, 73, 29);

        this.bossRoomMinX = 52;
        this.bossArenaCenter = { tx: 63, ty: 19 };
        bossSpawn = { tx: 67, ty: 19 };
        this.miniBossChestPos = { tx: 41, ty: 33 };
        miniBossSpot = { tx: 38, ty: 31 };

        this.runes = [
          { id: 'alfa', tx: 20, ty: 14, active: false, kind: 'wing', label: 'ALFA' },
          { id: 'beta', tx: 28, ty: 24, active: false, kind: 'wing', label: 'BETA' },
          { id: 'seq_1', tx: 32, ty: 3, active: false, kind: 'seq', order: 1, label: 'RUNA I' },
          { id: 'seq_2', tx: 37, ty: 8, active: false, kind: 'seq', order: 2, label: 'RUNA II' },
          { id: 'seq_3', tx: 41, ty: 3, active: false, kind: 'seq', order: 3, label: 'RUNA III' }
        ];
        this.chests = [
          { tx: 22, ty: 8, opened: false, bonus: false },
          { tx: 37, ty: 19, opened: false, bonus: false },
          { tx: 48, ty: 19, opened: false, bonus: false },
          { tx: 46, ty: 4, opened: false, bonus: true },
          { tx: 48, ty: 5, opened: false, bonus: true }
        ];
        carpetBoxes = [[4, 19, 51, 19], [53, 18, 69, 20]];
        trapCandidates = [[13,17],[15,21],[21,16],[21,22],[26,16],[26,22],[21,8],[25,9],[34,4],[34,8],[39,5],[21,29],[25,31],[34,29],[36,16],[36,22],[47,17],[49,21]];
        pillarCandidates = [[21,15],[27,15],[21,23],[27,23],[35,16],[39,16],[35,22],[39,22],[57,12],[69,12],[57,26],[69,26]];
        torchCandidates = [[3,16],[6,16],[12,15],[15,15],[20,13],[28,13],[20,6],[33,2],[45,2],[50,2],[20,27],[33,27],[41,27],[35,14],[47,15],[56,9],[63,9],[70,9]];
        propCandidates = [[2,17,'urn'],[6,21,'urnGold'],[12,22,'urn'],[20,10,'sarcophagus'],[45,7,'urnGold'],[50,3,'urnGold'],[19,31,'sarcophagus'],[32,35,'sarcophagus'],[54,10,'sarcophagus'],[54,28,'sarcophagus'],[71,19,'altarRitual']];
        mobSpots = [[13,19,1.0],[22,19,1.15],[26,15,1.2],[26,23,1.2],[23,8,1.25],[33,6,1.3],[39,6,1.35],[22,30,1.25],[34,31,1.35],[36,19,1.4],[40,17,1.45],[48,17,1.5],[48,21,1.5]];
      } else if (arch === 1) {
        // Archetype 1: Santuario de Anillos y Puentes (12 Salas)
        portal = { tx: 2, ty: 19 };
        spawnTile = { tx: 4, ty: 19 };
        addRoom('Vestíbulo Occidental', 1, 15, 6, 23);
        carveRect(7, 15, 10, 16);
        carveRect(7, 22, 10, 23);
        addRoom('Sala de Pilares Norte', 11, 12, 18, 17);
        addRoom('Sala de Pilares Sur', 11, 21, 18, 26);
        carveRect(19, 14, 20, 16);
        carveRect(19, 22, 20, 24);
        addRoom('Gran Anillo Central', 21, 12, 32, 26);
        carveRect(25, 17, 28, 21, 0); // Abismo central
        addDoors(this.wingDoorTiles, 25, 11, 28, 11, 5);
        addRoom('Atrio del Silencio Norte', 22, 5, 31, 10);
        carveRect(32, 6, 34, 8);
        addRoom('Cámara de Secuencia Astral', 35, 2, 45, 9);
        addDoors(this.vaultDoorTiles, 46, 4, 46, 6, 6);
        addRoom('Cripta Áurea', 47, 2, 50, 7);
        addDoors(this.wingDoorTiles, 25, 27, 28, 27, 5);
        addRoom('Pasaje Inferior', 22, 28, 31, 33);
        carveRect(32, 30, 34, 32);
        addRoom('Arena del Guardián Sur', 35, 28, 46, 36);
        carveRect(33, 14, 36, 16);
        carveRect(33, 22, 36, 24);
        addRoom('Salón Gemelo de los Ecos', 37, 13, 44, 25);
        carveRect(45, 18, 46, 20);
        addRoom('Antesala Real', 47, 15, 52, 23);
        addDoors(this.bossGateTiles, 53, 17, 53, 21, 3);
        addRoom('Santuario del Jefe', 54, 10, 73, 29);

        this.bossRoomMinX = 53;
        this.bossArenaCenter = { tx: 63, ty: 19 };
        bossSpawn = { tx: 67, ty: 19 };
        this.miniBossChestPos = { tx: 44, ty: 34 };
        miniBossSpot = { tx: 40, ty: 32 };

        this.runes = [
          { id: 'alfa', tx: 22, ty: 13, active: false, kind: 'wing', label: 'ALFA' },
          { id: 'beta', tx: 31, ty: 25, active: false, kind: 'wing', label: 'BETA' },
          { id: 'seq_1', tx: 36, ty: 7, active: false, kind: 'seq', order: 1, label: 'RUNA I' },
          { id: 'seq_2', tx: 40, ty: 3, active: false, kind: 'seq', order: 2, label: 'RUNA II' },
          { id: 'seq_3', tx: 44, ty: 7, active: false, kind: 'seq', order: 3, label: 'RUNA III' }
        ];
        this.chests = [
          { tx: 14, ty: 14, opened: false, bonus: false },
          { tx: 40, ty: 19, opened: false, bonus: false },
          { tx: 49, ty: 19, opened: false, bonus: false },
          { tx: 48, ty: 4, opened: false, bonus: true },
          { tx: 49, ty: 6, opened: false, bonus: true }
        ];
        carpetBoxes = [[12, 14, 17, 15], [12, 23, 17, 24], [22, 14, 31, 15], [22, 23, 31, 24], [38, 19, 52, 19], [54, 18, 70, 20]];
        trapCandidates = [[9,15],[9,22],[14,16],[14,22],[23,18],[30,19],[25,7],[29,8],[38,5],[42,5],[25,30],[29,31],[39,16],[39,22],[49,17],[49,21]];
        pillarCandidates = [[13,13],[16,13],[13,25],[16,25],[23,14],[30,14],[23,24],[30,24],[38,15],[42,15],[38,23],[42,23],[58,11],[68,11],[58,27],[68,27]];
        torchCandidates = [[3,15],[12,12],[12,21],[22,12],[31,12],[23,5],[37,2],[49,2],[23,28],[37,28],[38,13],[48,15],[57,8],[65,8],[71,8]];
        propCandidates = [[2,16,'urn'],[5,22,'urnGold'],[48,7,'urnGold'],[53,3,'urnGold'],[23,32,'sarcophagus'],[36,35,'sarcophagus'],[55,9,'sarcophagus'],[55,29,'sarcophagus'],[71,19,'altarRitual']];
        mobSpots = [[14,15,1.0],[14,24,1.05],[24,14,1.15],[29,14,1.2],[24,24,1.2],[27,7,1.25],[38,6,1.3],[42,5,1.35],[26,31,1.3],[37,32,1.4],[40,16,1.45],[40,22,1.45],[50,17,1.5],[50,21,1.5]];
      } else if (arch === 2) {
        // Archetype 2: Laberinto Escalonado en Z (12 Salas)
        portal = { tx: 2, ty: 7 };
        spawnTile = { tx: 4, ty: 7 };
        addRoom('Cámara Norte-Oeste', 1, 4, 7, 10);
        carveRect(4, 11, 5, 13);
        addRoom('Sala de Emboscada Oeste', 2, 14, 9, 20);
        carveRect(4, 21, 5, 23);
        addRoom('Sótano de Pilares', 2, 24, 14, 31);
        carveRect(15, 26, 17, 28);
        addRoom('Recodo Sur-Oeste', 18, 21, 24, 28);
        carveRect(20, 19, 22, 20);
        addRoom('Salón de Runas Central', 19, 10, 30, 18);
        addDoors(this.wingDoorTiles, 23, 9, 25, 9, 5);
        addRoom('Cámara Rúnica Superior', 20, 2, 30, 8);
        carveRect(31, 4, 33, 6);
        addRoom('Sala de Enigmas I-II-III', 34, 2, 44, 8);
        addDoors(this.vaultDoorTiles, 45, 3, 45, 5, 6);
        addRoom('Tesoro Oculto Norte', 46, 2, 50, 7);
        addDoors(this.wingDoorTiles, 26, 19, 28, 19, 5);
        addRoom('Salón de Hierro Sur', 26, 20, 35, 28);
        carveRect(36, 24, 37, 26);
        addRoom('Salón del Guardián', 38, 22, 47, 34);
        carveRect(31, 13, 35, 15);
        addRoom('Galería de las Antorchas', 36, 10, 44, 18);
        carveRect(45, 14, 46, 16);
        addRoom('Vestíbulo Final', 47, 13, 52, 22);
        addDoors(this.bossGateTiles, 53, 16, 53, 20, 3);
        addRoom('Trono del Señor', 54, 10, 73, 29);

        this.bossRoomMinX = 53;
        this.bossArenaCenter = { tx: 63, ty: 19 };
        bossSpawn = { tx: 67, ty: 19 };
        this.miniBossChestPos = { tx: 45, ty: 31 };
        miniBossSpot = { tx: 42, ty: 28 };

        this.runes = [
          { id: 'alfa', tx: 20, ty: 11, active: false, kind: 'wing', label: 'ALFA' },
          { id: 'beta', tx: 29, ty: 17, active: false, kind: 'wing', label: 'BETA' },
          { id: 'seq_1', tx: 35, ty: 3, active: false, kind: 'seq', order: 1, label: 'RUNA I' },
          { id: 'seq_2', tx: 39, ty: 7, active: false, kind: 'seq', order: 2, label: 'RUNA II' },
          { id: 'seq_3', tx: 43, ty: 3, active: false, kind: 'seq', order: 3, label: 'RUNA III' }
        ];
        this.chests = [
          { tx: 11, ty: 28, opened: false, bonus: false },
          { tx: 40, ty: 14, opened: false, bonus: false },
          { tx: 49, ty: 18, opened: false, bonus: false },
          { tx: 48, ty: 3, opened: false, bonus: true },
          { tx: 49, ty: 5, opened: false, bonus: true }
        ];
        carpetBoxes = [[4, 7, 5, 27], [6, 27, 21, 27], [21, 14, 44, 14], [47, 17, 52, 19], [54, 18, 70, 20]];
        trapCandidates = [[5,12],[6,17],[8,27],[12,26],[21,24],[23,14],[27,13],[23,5],[28,6],[37,5],[41,4],[29,24],[33,23],[39,12],[49,15],[49,20]];
        pillarCandidates = [[5,26],[10,26],[20,23],[22,12],[28,12],[22,17],[28,17],[38,12],[42,16],[58,11],[68,11],[58,27],[68,27]];
        torchCandidates = [[3,4],[7,4],[3,14],[4,24],[11,24],[19,21],[21,10],[22,2],[36,2],[48,2],[28,20],[40,22],[38,10],[48,13],[57,8],[65,8]];
        propCandidates = [[6,9,'urn'],[3,30,'urnGold'],[47,6,'urnGold'],[52,3,'urnGold'],[27,27,'sarcophagus'],[39,33,'sarcophagus'],[55,9,'sarcophagus'],[55,29,'sarcophagus'],[71,19,'altarRitual']];
        mobSpots = [[6,17,1.0],[8,27,1.1],[21,25,1.15],[24,14,1.2],[28,13,1.25],[24,5,1.3],[38,5,1.35],[42,5,1.35],[30,24,1.35],[40,26,1.4],[38,14,1.45],[42,16,1.45],[49,17,1.5],[49,20,1.5]];
      } else if (arch === 3) {
        // Archetype 3: Catacumbas del Anillo Abisal (12 Salas)
        portal = { tx: 2, ty: 19 };
        spawnTile = { tx: 4, ty: 19 };
        addRoom('Entrada del Pozo', 1, 16, 6, 22);
        carveRect(7, 18, 9, 20);
        addRoom('Sala del Umbral', 10, 15, 15, 23);
        carveRect(12, 12, 13, 14);
        carveRect(12, 24, 13, 26);
        addRoom('Ala Occidental Alta', 10, 7, 18, 11);
        addRoom('Ala Occidental Baja', 10, 27, 18, 31);
        carveRect(19, 8, 21, 10);
        carveRect(19, 28, 21, 30);
        addRoom('Patio de Runas', 22, 9, 32, 29);
        carveRect(25, 16, 28, 22, 0); // Patio central del anillo
        addDoors(this.wingDoorTiles, 25, 8, 28, 8, 5);
        addRoom('Sala de Trampas Norte', 22, 2, 28, 7);
        carveRect(29, 4, 30, 5);
        addRoom('Santuario I-II-III', 31, 2, 42, 8);
        addDoors(this.vaultDoorTiles, 43, 3, 43, 5, 6);
        addRoom('Archivo Sellado', 44, 2, 49, 6);
        addDoors(this.wingDoorTiles, 25, 30, 28, 30, 5);
        addRoom('Fosa del Guardián', 22, 31, 33, 36);
        carveRect(34, 32, 36, 34);
        addRoom('Sepulcro del Centinela', 37, 29, 46, 36);
        carveRect(33, 18, 35, 20);
        addRoom('Salón de Columnas', 36, 13, 44, 25);
        carveRect(45, 18, 46, 20);
        addRoom('Vestíbulo de Sangre', 47, 15, 52, 23);
        addDoors(this.bossGateTiles, 53, 17, 53, 21, 3);
        addRoom('Gran Arena Abisal', 54, 9, 73, 29);

        this.bossRoomMinX = 53;
        this.bossArenaCenter = { tx: 63, ty: 19 };
        bossSpawn = { tx: 67, ty: 19 };
        this.miniBossChestPos = { tx: 44, ty: 34 };
        miniBossSpot = { tx: 41, ty: 32 };

        this.runes = [
          { id: 'alfa', tx: 23, ty: 10, active: false, kind: 'wing', label: 'ALFA' },
          { id: 'beta', tx: 31, ty: 28, active: false, kind: 'wing', label: 'BETA' },
          { id: 'seq_1', tx: 32, ty: 7, active: false, kind: 'seq', order: 1, label: 'RUNA I' },
          { id: 'seq_2', tx: 36, ty: 3, active: false, kind: 'seq', order: 2, label: 'RUNA II' },
          { id: 'seq_3', tx: 41, ty: 7, active: false, kind: 'seq', order: 3, label: 'RUNA III' }
        ];
        this.chests = [
          { tx: 14, ty: 9, opened: false, bonus: false },
          { tx: 40, ty: 19, opened: false, bonus: false },
          { tx: 49, ty: 19, opened: false, bonus: false },
          { tx: 46, ty: 3, opened: false, bonus: true },
          { tx: 48, ty: 5, opened: false, bonus: true }
        ];
        carpetBoxes = [[4, 19, 14, 19], [23, 12, 31, 13], [23, 25, 31, 26], [33, 19, 52, 19], [54, 18, 70, 20]];
        trapCandidates = [[12,17],[14,21],[13,9],[15,29],[24,14],[29,14],[24,24],[29,24],[24,5],[27,4],[34,5],[38,6],[26,33],[30,34],[39,16],[42,22],[49,17],[49,21]];
        pillarCandidates = [[11,16],[14,22],[23,11],[31,11],[23,27],[31,27],[38,15],[42,15],[38,23],[42,23],[58,11],[68,11],[58,27],[68,27]];
        torchCandidates = [[3,16],[11,15],[12,7],[12,27],[23,9],[30,9],[23,2],[33,2],[45,2],[23,31],[39,29],[37,13],[48,15],[57,7],[65,7]];
        propCandidates = [[2,17,'urn'],[17,8,'urnGold'],[45,6,'urnGold'],[50,3,'urnGold'],[24,35,'sarcophagus'],[38,35,'sarcophagus'],[55,9,'sarcophagus'],[55,29,'sarcophagus'],[71,19,'altarRitual']];
        mobSpots = [[12,19,1.0],[14,9,1.1],[14,29,1.1],[25,12,1.2],[30,12,1.25],[25,26,1.2],[25,4,1.3],[35,5,1.35],[40,4,1.35],[28,33,1.35],[39,16,1.45],[41,22,1.45],[50,17,1.5],[50,21,1.5]];
      } else if (arch === 4) {
        // Archetype 4: Serpentina Real (12 Salas)
        portal = { tx: 2, ty: 30 };
        spawnTile = { tx: 4, ty: 30 };
        addRoom('Acceso del Sur', 1, 27, 7, 33);
        carveRect(4, 24, 5, 26);
        addRoom('Sala de la Guardia Baja', 2, 16, 8, 23);
        carveRect(4, 13, 5, 15);
        addRoom('Bóveda Occidental Alta', 2, 5, 10, 12);
        carveRect(11, 8, 13, 10);
        addRoom('Galería Superior Oeste', 14, 6, 20, 13);
        carveRect(16, 14, 18, 15);
        addRoom('Salón Serpiente Central', 13, 16, 25, 24);
        addDoors(this.wingDoorTiles, 21, 15, 23, 15, 5);
        carveRect(21, 10, 23, 14);
        addRoom('Santuario de Runas Altas', 21, 2, 31, 9);
        carveRect(32, 4, 34, 6);
        addRoom('Sala de Secuencia Real', 35, 2, 44, 9);
        addDoors(this.vaultDoorTiles, 45, 4, 45, 6, 6);
        addRoom('Tesoro de la Corona', 46, 2, 49, 7);
        addDoors(this.wingDoorTiles, 18, 25, 20, 25, 5);
        addRoom('Cuartel de las Sombras', 15, 26, 26, 35);
        carveRect(27, 29, 29, 31);
        addRoom('Cámara del Guardián Real', 30, 27, 41, 36);
        carveRect(26, 19, 28, 21);
        addRoom('Salón del Manto', 29, 14, 39, 24);
        carveRect(40, 18, 42, 20);
        addRoom('Antesala del Trono', 43, 15, 51, 23);
        addDoors(this.bossGateTiles, 52, 17, 52, 21, 3);
        addRoom('Salón del Trono', 53, 10, 73, 28);

        this.bossRoomMinX = 52;
        this.bossArenaCenter = { tx: 63, ty: 19 };
        bossSpawn = { tx: 67, ty: 19 };
        this.miniBossChestPos = { tx: 39, ty: 34 };
        miniBossSpot = { tx: 35, ty: 31 };

        this.runes = [
          { id: 'alfa', tx: 14, ty: 17, active: false, kind: 'wing', label: 'ALFA' },
          { id: 'beta', tx: 24, ty: 23, active: false, kind: 'wing', label: 'BETA' },
          { id: 'seq_1', tx: 36, ty: 7, active: false, kind: 'seq', order: 1, label: 'RUNA I' },
          { id: 'seq_2', tx: 39, ty: 3, active: false, kind: 'seq', order: 2, label: 'RUNA II' },
          { id: 'seq_3', tx: 43, ty: 7, active: false, kind: 'seq', order: 3, label: 'RUNA III' }
        ];
        this.chests = [
          { tx: 6, ty: 8, opened: false, bonus: false },
          { tx: 34, ty: 19, opened: false, bonus: false },
          { tx: 47, ty: 19, opened: false, bonus: false },
          { tx: 47, ty: 4, opened: false, bonus: true },
          { tx: 48, ty: 6, opened: false, bonus: true }
        ];
        carpetBoxes = [[4, 30, 5, 9], [6, 9, 17, 9], [16, 20, 51, 20], [53, 18, 70, 20]];
        trapCandidates = [[5,21],[6,10],[16,9],[16,19],[22,19],[25,6],[29,5],[38,5],[41,6],[18,29],[23,31],[32,17],[36,22],[45,17],[49,21]];
        pillarCandidates = [[4,8],[8,8],[16,18],[23,18],[16,22],[23,22],[31,16],[37,16],[31,22],[37,22],[57,12],[68,12],[57,26],[68,26]];
        torchCandidates = [[3,27],[3,16],[4,5],[15,6],[14,16],[22,2],[36,2],[47,2],[16,26],[32,27],[31,14],[45,15],[56,9],[64,9]];
        propCandidates = [[6,32,'urn'],[9,6,'urnGold'],[47,7,'urnGold'],[52,3,'urnGold'],[16,33,'sarcophagus'],[31,35,'sarcophagus'],[54,10,'sarcophagus'],[54,28,'sarcophagus'],[71,19,'altarRitual']];
        mobSpots = [[5,20,1.0],[7,9,1.05],[17,9,1.15],[18,20,1.2],[22,19,1.25],[26,5,1.3],[38,5,1.35],[42,6,1.35],[21,30,1.35],[33,31,1.4],[32,19,1.45],[37,17,1.45],[46,17,1.5],[46,21,1.5]];
      } else if (arch === 5) {
        // Archetype 5: Basílica Gemela Simétrica (13 Salas con Puente Central)
        portal = { tx: 2, ty: 19 };
        spawnTile = { tx: 4, ty: 19 };
        addRoom('Atrio del Juramento', 1, 16, 7, 22);
        carveRect(8, 18, 10, 20);
        addRoom('Nave Central de Relieves', 11, 14, 21, 24);
        carveRect(22, 18, 24, 20);
        addRoom('Cruce de los Elementales', 25, 13, 33, 25);
        addDoors(this.wingDoorTiles, 28, 12, 30, 12, 5);
        addRoom('Claustro Superior', 22, 6, 33, 11);
        carveRect(34, 7, 36, 9);
        addRoom('Sala de Secuencia Celeste', 37, 2, 46, 10);
        addDoors(this.vaultDoorTiles, 46, 4, 46, 6, 6);
        addRoom('Sagrario de Tesoros', 47, 2, 50, 7);
        addDoors(this.wingDoorTiles, 28, 26, 30, 26, 5);
        addRoom('Claustro Inferior', 22, 27, 33, 32);
        carveRect(34, 29, 36, 31);
        addRoom('Salón del Guardián Real', 37, 26, 47, 36);
        carveRect(34, 15, 37, 17);
        carveRect(34, 21, 37, 23);
        addRoom('Puente Gemelo Este', 38, 13, 45, 25);
        carveRect(46, 18, 47, 20);
        addRoom('Antesala Sagrada', 48, 15, 52, 23);
        addDoors(this.bossGateTiles, 53, 17, 53, 21, 3);
        addRoom('Basílica del Soberano', 54, 10, 73, 28);

        this.bossRoomMinX = 53;
        this.bossArenaCenter = { tx: 63, ty: 19 };
        bossSpawn = { tx: 67, ty: 19 };
        this.miniBossChestPos = { tx: 45, ty: 34 };
        miniBossSpot = { tx: 42, ty: 31 };

        this.runes = [
          { id: 'alfa', tx: 26, ty: 14, active: false, kind: 'wing', label: 'ALFA' },
          { id: 'beta', tx: 32, ty: 24, active: false, kind: 'wing', label: 'BETA' },
          { id: 'seq_1', tx: 38, ty: 8, active: false, kind: 'seq', order: 1, label: 'RUNA I' },
          { id: 'seq_2', tx: 41, ty: 3, active: false, kind: 'seq', order: 2, label: 'RUNA II' },
          { id: 'seq_3', tx: 45, ty: 8, active: false, kind: 'seq', order: 3, label: 'RUNA III' }
        ];
        this.chests = [
          { tx: 16, ty: 19, opened: false, bonus: false },
          { tx: 42, ty: 19, opened: false, bonus: false },
          { tx: 50, ty: 19, opened: false, bonus: false },
          { tx: 48, ty: 4, opened: false, bonus: true },
          { tx: 49, ty: 6, opened: false, bonus: true }
        ];
        carpetBoxes = [[4, 19, 32, 19], [39, 19, 52, 19], [54, 18, 70, 20]];
        trapCandidates = [[13,16],[19,22],[27,16],[31,22],[27,8],[40,6],[43,6],[27,29],[40,16],[43,22],[49,17],[49,21]];
        pillarCandidates = [[13,15],[19,15],[13,23],[19,23],[27,14],[31,14],[27,24],[31,24],[40,14],[43,14],[40,24],[43,24],[58,11],[68,11],[58,27],[68,27]];
        torchCandidates = [[3,16],[12,14],[26,13],[23,6],[38,2],[49,2],[23,27],[38,26],[39,13],[49,15],[57,8],[66,8]];
        propCandidates = [[2,17,'urn'],[12,23,'urnGold'],[49,7,'urnGold'],[53,3,'urnGold'],[24,31,'sarcophagus'],[38,35,'sarcophagus'],[55,9,'sarcophagus'],[55,29,'sarcophagus'],[71,19,'altarRitual']];
        mobSpots = [[14,19,1.0],[19,19,1.08],[28,16,1.18],[28,22,1.22],[27,8,1.28],[40,5,1.34],[43,7,1.38],[28,29,1.35],[41,30,1.42],[41,16,1.45],[42,22,1.45],[50,17,1.52],[50,21,1.52]];
      } else {
        // Archetype 6: Ciudadela Espiral del Abismo (13 Salas)
        portal = { tx: 2, ty: 8 };
        spawnTile = { tx: 4, ty: 8 };
        addRoom('Portal Norte-Oeste', 1, 5, 8, 12);
        carveRect(9, 7, 12, 9);
        addRoom('Sala de las Runas Altas', 13, 4, 23, 12);
        carveRect(17, 13, 19, 15);
        addRoom('Salón del Eje Central', 14, 16, 26, 25);
        addDoors(this.wingDoorTiles, 27, 18, 27, 21, 5);
        carveRect(20, 26, 22, 27);
        addRoom('Cámara de los Ecos Sur', 15, 28, 28, 36);
        carveRect(29, 31, 31, 33);
        addRoom('Arena del Centinela Sur', 32, 27, 44, 36);
        addRoom('Corredor Rúnico Este', 28, 13, 35, 24);
        carveRect(30, 10, 32, 12);
        addRoom('Cámara de Enigmas I-II-III', 29, 2, 41, 9);
        addDoors(this.vaultDoorTiles, 42, 4, 42, 6, 6);
        addRoom('Tesoro Sellado de las Cumbres', 43, 2, 47, 7);
        carveRect(36, 17, 40, 20);
        addRoom('Vestíbulo de la Tormenta', 41, 14, 50, 23);
        addDoors(this.bossGateTiles, 51, 17, 51, 21, 3);
        addRoom('Cámara del Emperador', 52, 10, 73, 28);

        this.bossRoomMinX = 51;
        this.bossArenaCenter = { tx: 63, ty: 19 };
        bossSpawn = { tx: 67, ty: 19 };
        this.miniBossChestPos = { tx: 42, ty: 34 };
        miniBossSpot = { tx: 38, ty: 31 };

        this.runes = [
          { id: 'alfa', tx: 14, ty: 5, active: false, kind: 'wing', label: 'ALFA' },
          { id: 'beta', tx: 25, ty: 24, active: false, kind: 'wing', label: 'BETA' },
          { id: 'seq_1', tx: 30, ty: 3, active: false, kind: 'seq', order: 1, label: 'RUNA I' },
          { id: 'seq_2', tx: 35, ty: 8, active: false, kind: 'seq', order: 2, label: 'RUNA II' },
          { id: 'seq_3', tx: 40, ty: 3, active: false, kind: 'seq', order: 3, label: 'RUNA III' }
        ];
        this.chests = [
          { tx: 18, ty: 8, opened: false, bonus: false },
          { tx: 32, ty: 19, opened: false, bonus: false },
          { tx: 45, ty: 19, opened: false, bonus: false },
          { tx: 44, ty: 4, opened: false, bonus: true },
          { tx: 46, ty: 6, opened: false, bonus: true }
        ];
        carpetBoxes = [[4, 8, 18, 8], [18, 8, 18, 20], [18, 20, 50, 20], [52, 18, 70, 20]];
        trapCandidates = [[10,8],[16,7],[21,9],[16,19],[24,18],[21,31],[25,33],[33,5],[38,6],[30,17],[34,21],[43,16],[47,21]];
        pillarCandidates = [[15,6],[21,6],[16,18],[24,18],[16,23],[24,23],[18,30],[26,30],[30,15],[34,22],[43,15],[48,22],[57,11],[68,11],[57,27],[68,27]];
        torchCandidates = [[3,5],[14,4],[15,16],[16,28],[33,27],[30,2],[44,2],[42,14],[55,8],[64,8],[70,8]];
        propCandidates = [[2,11,'urn'],[7,6,'urnGold'],[44,7,'urnGold'],[50,3,'urnGold'],[17,35,'sarcophagus'],[34,35,'sarcophagus'],[54,9,'sarcophagus'],[54,29,'sarcophagus'],[71,19,'altarRitual']];
        mobSpots = [[15,9,1.02],[20,7,1.1],[18,20,1.2],[23,21,1.25],[21,32,1.3],[35,31,1.4],[32,6,1.35],[38,5,1.38],[31,19,1.42],[44,17,1.48],[47,20,1.52]];
      }

      // Point 12: Vertical symmetry flip (50% chance) so North & South wings swap unpredictably across runs
      const mirroredY = rng() < 0.5;
      if (mirroredY) {
        const flipY = (y) => (H - 1) - y;
        const flippedGrid = Array.from({ length: H }, (_, y) => this.grid[flipY(y)]);
        this.grid = flippedGrid;
        for (const rm of this.rooms) {
          const ny0 = flipY(rm.y1);
          const ny1 = flipY(rm.y0);
          rm.y0 = ny0;
          rm.y1 = ny1;
          rm.cy = Math.floor((ny0 + ny1) / 2);
        }
        for (const pair of this.wingDoorTiles) pair[1] = flipY(pair[1]);
        for (const pair of this.vaultDoorTiles) pair[1] = flipY(pair[1]);
        for (const pair of this.bossGateTiles) pair[1] = flipY(pair[1]);
        for (const r of this.runes) r.ty = flipY(r.ty);
        for (const c of this.chests) c.ty = flipY(c.ty);
        for (const cb of carpetBoxes) {
          const ny0 = flipY(cb[3]);
          const ny1 = flipY(cb[1]);
          cb[1] = ny0;
          cb[3] = ny1;
        }
        for (const pt of trapCandidates) pt[1] = flipY(pt[1]);
        for (const pt of pillarCandidates) pt[1] = flipY(pt[1]);
        for (const pt of torchCandidates) pt[1] = flipY(pt[1]);
        for (const pt of propCandidates) pt[1] = flipY(pt[1]);
        for (const pt of mobSpots) pt[1] = flipY(pt[1]);
        portal.ty = flipY(portal.ty);
        spawnTile.ty = flipY(spawnTile.ty);
        miniBossSpot.ty = flipY(miniBossSpot.ty);
        if (this.miniBossChestPos) this.miniBossChestPos.ty = flipY(this.miniBossChestPos.ty);
        bossSpawn.ty = flipY(bossSpawn.ty);
        if (this.bossArenaCenter) this.bossArenaCenter.ty = flipY(this.bossArenaCenter.ty);
      }

      // Point 12: Apply procedural room/alcove/side-chamber/hazard mutations to break layout repetitiveness
      this.layoutVariant = this.applyProceduralLayoutVariations(rng, {
        arch,
        mirroredY,
        spawnTile,
        portal,
        trapCandidates,
        pillarCandidates,
        torchCandidates,
        propCandidates,
        mobSpots
      });

      // Build woven carpet runner tiles (walkable visuals)
      for (const [cx0, cy0, cx1, cy1] of carpetBoxes) {
        const minX = Math.min(cx0, cx1), maxX = Math.max(cx0, cx1);
        const minY = Math.min(cy0, cy1), maxY = Math.max(cy0, cy1);
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            if (this.grid[y] && this.grid[y][x] === 1) this.carpetTiles.add(`${x},${y}`);
          }
        }
      }

      // Procedural traps (mix base traps with occasional seeded variations)
      for (const [tx, ty] of trapCandidates) {
        if (this.grid[ty] && this.grid[ty][tx] === 1 && rng() > 0.12) {
          this.grid[ty][tx] = 2;
        }
      }

      // Keep critical interactive/spawn/portal tiles strictly clear & walkable
      const clearFloor = (tx, ty, val = 1) => {
        if (this.grid[ty] && tx > 0 && tx < W - 1 && ty > 0 && ty < H - 1) this.grid[ty][tx] = val;
      };
      clearFloor(portal.tx, portal.ty, 4);
      clearFloor(spawnTile.tx, spawnTile.ty, 1);
      for (const r of this.runes) clearFloor(r.tx, r.ty, 1);
      const cTheme = this.def.chestTheme || 'gold';
      for (const c of this.chests) {
        c.chestTheme = c.chestTheme || cTheme;
        clearFloor(c.tx, c.ty, 1);
        // Point 9: If the tile immediately above a chest is a wall (0) and the tile below is open floor (1),
        // shift the chest 1 tile south so its sprite sits cleanly on the floor rather than overlapping the front wall face.
        if (
          this.grid[c.ty - 1] && this.grid[c.ty - 1][c.tx] === 0 &&
          this.grid[c.ty + 1] && this.grid[c.ty + 1][c.tx] === 1 &&
          !this.runes.some(r => r.tx === c.tx && r.ty === c.ty + 1) &&
          (spawnTile.tx !== c.tx || spawnTile.ty !== c.ty + 1) &&
          (portal.tx !== c.tx || portal.ty !== c.ty + 1)
        ) {
          c.ty += 1;
        }
      }
      if (this.miniBossChestPos) clearFloor(this.miniBossChestPos.tx, this.miniBossChestPos.ty, 1);

      // Point 8: Setup intentional, readable puzzle logic & environmental clues
      this.setupIntentionalPuzzles(rng);
      this.validatePuzzles(spawnTile);
      this.validateLayoutStrictly(spawnTile);

      this.torches = torchCandidates.map(([tx, ty]) => ({ tx, ty }));
      this.pillars = pillarCandidates
        .filter(([tx, ty]) => this.grid[ty] && this.grid[ty][tx] === 1)
        .filter(([tx, ty]) => (tx !== spawnTile.tx || ty !== spawnTile.ty) && (tx !== portal.tx || ty !== portal.ty))
        .filter(([tx, ty]) => !this.runes.some(r => r.tx === tx && r.ty === ty) && !this.chests.some(c => c.tx === tx && c.ty === ty))
        .map(([tx, ty]) => ({ tx, ty }));

      const blockedSet = new Set([
        `${spawnTile.tx},${spawnTile.ty}`,
        `${portal.tx},${portal.ty}`,
        `${miniBossSpot.tx},${miniBossSpot.ty}`,
        ...(this.miniBossChestPos ? [`${this.miniBossChestPos.tx},${this.miniBossChestPos.ty}`] : []),
        ...(this.puzzleTablet ? [`${this.puzzleTablet.tx},${this.puzzleTablet.ty}`] : []),
        ...this.runes.map(r => `${r.tx},${r.ty}`),
        ...this.chests.map(c => `${c.tx},${c.ty}`),
        ...this.pillars.map(p => `${p.tx},${p.ty}`),
        ...propCandidates.map(p => `${p[0]},${p[1]}`)
      ]);
      const extraDecor = [];
      const tryAddDecor = (tx, ty, kind) => {
        const key = `${tx},${ty}`;
        if (!blockedSet.has(key) && this.grid[ty] && this.grid[ty][tx] === 1 && !this.carpetTiles.has(key)) {
          blockedSet.add(key);
          extraDecor.push([tx, ty, kind]);
        }
      };
      if (this.pillars.length > 0) {
        tryAddDecor(this.pillars[0].tx + 1, this.pillars[0].ty, 'brazier');
        tryAddDecor(this.pillars[this.pillars.length - 1].tx - 1, this.pillars[this.pillars.length - 1].ty, 'brazier');
      }
      if (this.bossArenaCenter) {
        tryAddDecor(this.bossArenaCenter.tx - 5, this.bossArenaCenter.ty - 4, 'brazier');
        tryAddDecor(this.bossArenaCenter.tx - 5, this.bossArenaCenter.ty + 4, 'brazier');
        tryAddDecor(this.bossArenaCenter.tx + 5, this.bossArenaCenter.ty - 4, 'statue');
        tryAddDecor(this.bossArenaCenter.tx + 5, this.bossArenaCenter.ty + 4, 'statue');
      }
      tryAddDecor(spawnTile.tx - 1, spawnTile.ty - 2, 'banner');
      tryAddDecor(spawnTile.tx + 1, spawnTile.ty - 2, 'banner');
      tryAddDecor(spawnTile.tx, spawnTile.ty + 2, 'statue');

      this.props = [...propCandidates, ...extraDecor]
        .filter(([tx, ty]) => this.grid[ty] && this.grid[ty][tx] === 1)
        .map(([tx, ty, kind]) => ({ tx, ty, kind }));

      // Procedural tier-scaled garrison (mobs + Mini-Boss)
      const types = this.def.enemyTypes;
      const tPick = (idx) => types[(idx + Math.floor(rng() * types.length)) % types.length];
      this.enemies = [];
      mobSpots.forEach(([mx, my, pow], idx) => {
        if (this.grid[my] && this.grid[my][mx] === 1) {
          this.enemies.push(this.makeMob(tPick(idx), mx, my, pow));
          if (this.abyssScale && this.abyssScale.horde && idx % 2 === 0) {
            this.enemies.push(this.makeMob(tPick(idx + 1), mx, my, pow * 0.9));
          }
        }
      });
      this.enemies.push(this.makeMiniBoss(types[1 % types.length], miniBossSpot.tx, miniBossSpot.ty));

      // Grand 3-Phase Boss in Arena
      const b = this.def.boss;
      const bLvScale = this.levelScale || 1;
      const tierProgress = Math.min(1, this.tier / Math.max(1, DUNGEON_TIER_LIST.length - 1));
      const abHp = this.abyssScale ? this.abyssScale.hp : 1;
      const abDmg = this.abyssScale ? this.abyssScale.dmg : 1;
      const abSpd = this.abyssScale ? this.abyssScale.speed : 1;
      const bossHpMult = (1.65 + tierProgress * 0.45) * (this.isCorrupted ? 24 : 1) * abHp;
      const bossDmgMult = (1.25 + tierProgress * 0.25) * (this.isCorrupted ? 5.5 : 1) * abDmg;
      const bossName = this.abyssFloor
        ? `[Abismo P${this.abyssFloor}] ${b.name}`
        : (this.isCorrupted ? `[CORRUPTO] ${b.name}` : b.name);
      const bossDrops = { ...b.drops };
      if (this.isCorrupted) {
        bossDrops.esencia_corrupta = (Balaclava.Utils && Balaclava.Utils.randInt) ? Balaclava.Utils.randInt(6, 14) : Math.floor(rng() * 9) + 6;
        bossDrops.gema_vacio = (Balaclava.Utils && Balaclava.Utils.randInt) ? Balaclava.Utils.randInt(1, 4) : Math.floor(rng() * 4) + 1;
        if (rng() < 0.35) bossDrops.reliquia_vacio = 1;
      }
      if (this.abyssFloor) {
        bossDrops.materia_comprimida = Math.max(1, Math.floor(1 + this.abyssFloor / 10));
      }
      this.boss = {
        id: 'boss_' + this.id,
        seed: 7 + this.tier * 3,
        name: bossName,
        isBoss: true,
        type: 'boss_' + this.id,
        x: bossSpawn.tx * TILE_SIZE,
        y: bossSpawn.ty * TILE_SIZE,
        hp: Math.min(9e14, Math.round(b.hp * bossHpMult * bLvScale)),
        maxHp: Math.min(9e14, Math.round(b.hp * bossHpMult * bLvScale)),
        dmg: Math.min(9e12, Math.round(b.dmg * bossDmgMult * (1 + (bLvScale - 1) * 0.65))),
        speed: Math.min(260, Math.round(b.speed * (this.isCorrupted ? 1.25 : 1.0) * abSpd)),
        color: this.abyssFloor ? '#e040fb' : (this.isCorrupted ? '#ab47bc' : b.color),
        facing: -1,
        radius: 34,
        hitW: 78,
        hitH: 86,
        bodyOffY: 30,
        phase: 1,
        phaseCycle: 0,
        attackTimer: this.isCorrupted ? 0.85 : 1.25,
        telegraph: 0,
        telegraphMode: null,
        dashTimer: 0,
        dashVx: 0,
        dashVy: 0,
        dashCharges: 0,
        leapProg: 0,
        leapStartX: null,
        leapStartY: null,
        targetX: null,
        targetY: null,
        targetAngle: null,
        hitFlash: 0,
        drops: bossDrops,
        coins: Math.round(b.coins * (this.isCorrupted ? 15 : 1)),
        xp: Math.round(b.xp * (this.isCorrupted ? 15 : 1))
      };

      this.spawnPos = { x: (spawnTile.tx + 0.5) * TILE_SIZE, y: (spawnTile.ty + 0.5) * TILE_SIZE };
    }

    /**
     * Point 8: Configure intentional, varied, environmentally-clued puzzles.
     * Instead of always ordering sequence pads left-to-right with "I, II, III" printed on the pad,
     * each dungeon uses one of 4 readable environmental puzzle archetypes:
     *   1. 'flames_count'    — Ritual flames (1, 2, or 3 braziers/flames) around each seal pad show its activation order.
     *   2. 'mural_codex'     — A carved 3-panel wall mural above the chamber displays the 3 Seal Crests (SOL / LUNA / ESTRELLA) in exact order I -> II -> III.
     *   3. 'astral_conduit'  — An engraved golden floor circuit traces a continuous path from the Origin Keystone through the 1st, 2nd, and 3rd seals into the Vault Gate.
     *   4. 'obelisk_notches' — An ancient runic obelisk beside each seal pad bears I, II, or III glowing horizontal notches.
     * Also builds floor conduits linking Wing Seals (ALFA / BETA) to the Wing Gates so the player sees what each seal controls.
     */
    setupIntentionalPuzzles(rng) {
      const W = this.width;
      const H = this.height;
      const modes = ['flames_count', 'mural_codex', 'astral_conduit', 'obelisk_notches'];
      const modeIdx = (this.tier + Math.floor((rng ? rng() : 0.35) * modes.length)) % modes.length;
      this.puzzleMode = modes[modeIdx];
      this._lastRunePadKey = null;

      // 6 permutations of [1, 2, 3] for the 3 sequence pads
      const perms = [
        [2, 3, 1],
        [3, 1, 2],
        [2, 1, 3],
        [1, 3, 2],
        [3, 2, 1],
        [1, 2, 3]
      ];
      // Prefer non-trivial permutations so the player reads the environmental clue rather than blindly walking left-to-right
      const permIdx = Math.floor((rng ? rng() : 0.2) * 5) % 5;
      const chosenPerm = perms[permIdx];

      const crestDefs = [
        { code: 'SOL', crestName: 'SELLO DEL SOL', glyph: 'S', color: '#ffb74d' },
        { code: 'LUNA', crestName: 'SELLO DE LA LUNA', glyph: 'L', color: '#81d4fa' },
        { code: 'ESTRELLA', crestName: 'SELLO ASTRAL', glyph: 'E', color: '#ce93d8' }
      ];

      const seqRunes = this.runes.filter(r => r.kind === 'seq');
      seqRunes.forEach((r, idx) => {
        const cDef = crestDefs[idx % crestDefs.length];
        r.slotIndex = idx;
        r.order = chosenPerm[idx] || (idx + 1);
        r.crest = cDef.code;
        r.crestName = cDef.crestName;
        r.glyph = cDef.glyph;
        r.crestColor = cDef.color;
        r.clueCount = r.order; // 1, 2, or 3 flames / notches
        r.puzzleMode = this.puzzleMode;
      });

      // Sort sequence runes by their true activation order (1 -> 2 -> 3) to build clues & mural
      const orderedSeq = [...seqRunes].sort((a, b) => a.order - b.order);
      const orderSummary = orderedSeq.map((r, i) => `${i + 1}: ${r.crest}`).join(' -> ');

      // Find center of the sequence puzzle area
      let avgX = 20, avgY = 5, minY = 5;
      if (seqRunes.length > 0) {
        avgX = Math.round(seqRunes.reduce((s, r) => s + r.tx, 0) / seqRunes.length);
        avgY = Math.round(seqRunes.reduce((s, r) => s + r.ty, 0) / seqRunes.length);
        minY = Math.min(...seqRunes.map(r => r.ty));
      }

      // Place an inspectable Ancient Runic Tablet near the sequence puzzle entrance
      let tabX = Math.max(2, Math.min(W - 3, avgX - 2));
      let tabY = Math.max(2, Math.min(H - 3, avgY + 1));
      const candidateOffsets = [
        [0, 1], [-2, 1], [2, 1], [0, -1], [-1, 1], [1, 1], [-3, 0], [3, 0]
      ];
      for (const [ox, oy] of candidateOffsets) {
        const cx = avgX + ox;
        const cy = avgY + oy;
        if (
          this.grid[cy] && this.grid[cy][cx] === 1 &&
          !this.runes.some(r => r.tx === cx && r.ty === cy) &&
          !this.chests.some(c => c.tx === cx && c.ty === cy)
        ) {
          tabX = cx;
          tabY = cy;
          break;
        }
      }

      const modeDescriptions = {
        flames_count: {
          title: 'ESTELA DE LAS LLAMAS RITUALES',
          shortHint: 'Cuenta las llamas junto a cada sello (1 -> 2 -> 3)',
          hintText: `Rito de las Llamas: Activa los sellos segun el numero de flamas encendidas junto a cada pedestal (I -> II -> III: ${orderSummary}).`
        },
        mural_codex: {
          title: 'CODICE DEL MURAL ANTIGUO',
          shortHint: `Sigue los emblemas del mural norte (${orderSummary})`,
          hintText: `Codice del Mural: El friso grabado en el muro muestra la secuencia sagrada de izquierda a derecha (${orderSummary}).`
        },
        astral_conduit: {
          title: 'ESTELA DEL CONDUCTO ASTRAL',
          shortHint: 'Sigue la linea dorada desde el Nodo Origen',
          hintText: `Conducto Astral: Sigue el circuito grabado en el suelo desde la piedra de origen pasando por cada sello (${orderSummary}).`
        },
        obelisk_notches: {
          title: 'ESTELA DE LOS OBELISCOS',
          shortHint: 'Cuenta las muescas luminosas de cada obelisco (I -> II -> III)',
          hintText: `Rito de los Obeliscos: Las muescas luminosas talladas junto a cada sello indican su orden de activacion (${orderSummary}).`
        }
      };
      const mInfo = modeDescriptions[this.puzzleMode] || modeDescriptions.flames_count;
      this.puzzleTablet = {
        tx: tabX,
        ty: tabY,
        mode: this.puzzleMode,
        title: mInfo.title,
        shortHint: mInfo.shortHint,
        hintText: mInfo.hintText,
        orderSummary,
        read: false,
        autoShown: false
      };

      // Mural panels above the sequence chamber (visible in mural_codex and as architectural header)
      let muralY = Math.max(1, minY - 2);
      for (let yTest = minY - 1; yTest >= 1; yTest--) {
        if (this.grid[yTest] && this.grid[yTest][avgX] === 0) {
          muralY = yTest;
          break;
        }
      }
      this.puzzleMural = orderedSeq.map((r, idx) => ({
        tx: Math.max(2, Math.min(W - 3, avgX - 2 + idx * 2)),
        ty: muralY,
        order: idx + 1,
        crest: r.crest,
        glyph: r.glyph,
        color: r.crestColor,
        targetRuneId: r.id
      }));

      // Build polyline conduit points for the sequence puzzle -> vault door
      const vDoor = (this.vaultDoorTiles && this.vaultDoorTiles[0]) ? { tx: this.vaultDoorTiles[0][0], ty: this.vaultDoorTiles[0][1] } : { tx: avgX + 4, ty: avgY };
      this.puzzleConduits = {
        origin: { tx: tabX, ty: tabY },
        nodes: orderedSeq.map(r => ({ tx: r.tx, ty: r.ty, order: r.order, crest: r.crest, color: r.crestColor, id: r.id })),
        gate: vDoor
      };

      // Build Wing Seal conduits (ALFA & BETA -> Wing Gate tiles) so wing switches feel connected to the architecture
      const wingRunes = this.runes.filter(r => r.kind === 'wing');
      const wDoors = (this.wingDoorTiles && this.wingDoorTiles.length > 0) ? this.wingDoorTiles : [];
      this.wingConduits = wingRunes.map((wr, idx) => {
        const doorPair = wDoors.length > 0
          ? wDoors[Math.min(wDoors.length - 1, idx * Math.max(1, Math.floor(wDoors.length / 2)))]
          : [wr.tx, wr.ty];
        return {
          runeId: wr.id,
          from: { tx: wr.tx, ty: wr.ty },
          to: { tx: doorPair[0], ty: doorPair[1] }
        };
      });
    }

    /**
     * Point 8: Validate via BFS flood-fill that all puzzle runes are reachable in the required phase:
     * - Phase 1 (Initial): Wing runes ('alfa', 'beta') must be reachable from spawnTile before wing doors open.
     * - Phase 2 (Wings Open): All 3 sequence runes ('seq_1', 'seq_2', 'seq_3') and puzzleTablet must be reachable once wing doors open.
     * If any rune is unreachable due to a wall or barrier, automatically carve a clean floor path to guarantee 100% solvability.
     */
    validatePuzzles(spawnTile) {
      const W = this.width;
      const H = this.height;
      const clearTileOnly = (tx, ty) => {
        if (this.grid[ty] && tx > 0 && tx < W - 1 && ty > 0 && ty < H - 1) {
          if (this.grid[ty][tx] === 0 || this.grid[ty][tx] === 2) this.grid[ty][tx] = 1;
        }
      };
      for (const r of this.runes) clearTileOnly(r.tx, r.ty);
      if (this.puzzleTablet) clearTileOnly(this.puzzleTablet.tx, this.puzzleTablet.ty);
      if (this.bossArenaCenter) clearTileOnly(this.bossArenaCenter.tx, this.bossArenaCenter.ty);
      for (const c of this.chests) clearTileOnly(c.tx, c.ty);
    }

    validateLayoutStrictly(spawnTile = null) {
      const W = this.width;
      const H = this.height;
      const bossMinX = this.bossRoomMinX || 51;
      const st = spawnTile || (this.spawnPos ? { tx: Math.floor(this.spawnPos.x / TILE_SIZE), ty: Math.floor(this.spawnPos.y / TILE_SIZE) } : { tx: 4, ty: 19 });

      // Strict BFS from spawn with boss gates CLOSED. Boss room MUST be 100% UNREACHABLE before gates unlock.
      const isBossDoor = (x, y) => this.bossGateTiles && this.bossGateTiles.some(([gx, gy]) => gx === x && gy === y);

      const visited = new Set();
      const queue = [[st.tx, st.ty]];
      visited.add(`${st.tx},${st.ty}`);
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      let leaks = 0;

      while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        for (const [dx, dy] of dirs) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx <= 0 || nx >= W - 1 || ny <= 0 || ny >= H - 1) continue;
          const key = `${nx},${ny}`;
          if (visited.has(key)) continue;
          if (isBossDoor(nx, ny)) continue; // Closed boss gate
          const cell = this.grid[ny] && this.grid[ny][nx];
          if (cell === 1 || cell === 4 || cell === 5 || cell === 6) {
            if (nx >= bossMinX) {
              // Seal any unintentional shortcut or hole into boss room
              this.grid[ny][nx] = 0;
              leaks++;
              continue;
            }
            visited.add(key);
            queue.push([nx, ny]);
          }
        }
      }
      return leaks === 0;
    }

    /**
     * Point 12: Procedurally vary room silhouettes, carve bonus side crypts/alcoves,
     * and randomize pillar/hazard formations per run so dungeons feel distinct.
     */
    applyProceduralLayoutVariations(rng, ctx) {
      const W = this.width;
      const H = this.height;
      const { arch, mirroredY, spawnTile, portal, trapCandidates, pillarCandidates, torchCandidates, propCandidates, mobSpots } = ctx;
      const protectedTiles = new Set([
        `${spawnTile.tx},${spawnTile.ty}`,
        `${portal.tx},${portal.ty}`,
        ...this.runes.map(r => `${r.tx},${r.ty}`),
        ...this.chests.map(c => `${c.tx},${c.ty}`),
        ...this.wingDoorTiles.map(([x, y]) => `${x},${y}`),
        ...this.vaultDoorTiles.map(([x, y]) => `${x},${y}`),
        ...this.bossGateTiles.map(([x, y]) => `${x},${y}`)
      ]);
      const isProtected = (tx, ty) => protectedTiles.has(`${tx},${ty}`);

      const cornerStyle = ['beveled', 'alcoved', 'colonnade'][Math.floor(rng() * 3)];
      const hazardStyle = ['spiked', 'staggered', 'lean'][Math.floor(rng() * 3)];
      let sideChambers = 0;

      // 1. Bevel or carve side alcoves on medium/large non-boss rooms
      for (const rm of this.rooms) {
        if (rm.x1 >= this.bossRoomMinX - 4) continue;
        const rw = rm.x1 - rm.x0 + 1;
        const rh = rm.y1 - rm.y0 + 1;
        if (rw >= 7 && rh >= 6) {
          if (cornerStyle === 'beveled' && rng() < 0.7) {
            const corners = [[rm.x0, rm.y0], [rm.x1, rm.y0], [rm.x0, rm.y1], [rm.x1, rm.y1]];
            for (const [cx, cy] of corners) {
              if (!isProtected(cx, cy) && Math.hypot(cx - spawnTile.tx, cy - spawnTile.ty) > 2.5) {
                this.grid[cy][cx] = 0;
              }
            }
          } else if (cornerStyle === 'alcoved' && rng() < 0.65) {
            const ax = rm.cx;
            const ayTop = rm.y0 - 1;
            const ayBot = rm.y1 + 1;
            if (ax < this.bossRoomMinX - 4 && ayTop > 2 && this.grid[ayTop][ax] === 0 && this.grid[ayTop - 1] && this.grid[ayTop - 1][ax] === 0) {
              this.grid[ayTop][ax] = 1;
              if (rng() < 0.6) propCandidates.push([ax, ayTop, rng() < 0.5 ? 'barrel' : 'urn']);
            }
            if (ax < this.bossRoomMinX - 4 && ayBot < H - 3 && this.grid[ayBot][ax] === 0 && this.grid[ayBot + 1] && this.grid[ayBot + 1][ax] === 0) {
              this.grid[ayBot][ax] = 1;
              if (rng() < 0.6) torchCandidates.push([ax, ayBot]);
            }
          }
        }
      }

      // 2. Carve 1-2 bonus procedural side crypts connected to existing rooms (never bypassing locked gates or approaching boss)
      const candidates = this.rooms.filter(rm => rm.x0 > 6 && rm.x1 < this.bossRoomMinX - 8);
      for (let attempt = 0; attempt < 6 && sideChambers < 2 && candidates.length > 0; attempt++) {
        const rm = candidates[Math.floor(rng() * candidates.length)];
        const dirY = rng() < 0.5 ? -1 : 1;
        const sx0 = Math.max(2, rm.cx - 2);
        const sx1 = Math.min(this.bossRoomMinX - 6, rm.cx + 2);
        const syBase = dirY < 0 ? rm.y0 - 4 : rm.y1 + 2;
        const sy0 = Math.max(2, syBase);
        const sy1 = Math.min(H - 3, syBase + 2);
        if (sy1 - sy0 < 2 || sx1 - sx0 < 3 || sx1 >= this.bossRoomMinX - 5) continue;

        let allWall = true;
        for (let y = sy0 - 1; y <= sy1 + 1 && allWall; y++) {
          for (let x = sx0 - 1; x <= sx1 + 1; x++) {
            const insideExisting = x >= rm.x0 && x <= rm.x1 && y >= rm.y0 && y <= rm.y1;
            if (!insideExisting && (!this.grid[y] || this.grid[y][x] !== 0)) {
              allWall = false;
              break;
            }
          }
        }
        if (!allWall) continue;

        for (let y = sy0; y <= sy1; y++) {
          for (let x = sx0; x <= sx1; x++) this.grid[y][x] = 1;
        }
        const doorY = dirY < 0 ? rm.y0 - 1 : rm.y1 + 1;
        this.grid[doorY][rm.cx] = 1;
        torchCandidates.push([sx0, sy0]);
        propCandidates.push([sx1, sy1, rng() < 0.5 ? 'urn' : 'barrel']);
        if (rng() < 0.7) mobSpots.push([rm.cx, Math.floor((sy0 + sy1) / 2), 1.15]);
        sideChambers++;
      }

      // 3. Vary hazard & pillar density by hazardStyle
      if (hazardStyle === 'staggered') {
        for (let i = trapCandidates.length - 1; i >= 0; i--) {
          if (i % 2 === 1 && rng() < 0.65) trapCandidates.splice(i, 1);
        }
      } else if (hazardStyle === 'lean') {
        for (let i = pillarCandidates.length - 1; i >= 0; i--) {
          if (rng() < 0.35) pillarCandidates.splice(i, 1);
        }
      }

      return { archetype: arch, mirroredY, cornerStyle, hazardStyle, sideChambers };
    }

    /**
     * Point 9: Open a specific dungeon chest once with a strict single-open guard.
     */
    openChest(c, game) {
      if (!c || c.opened || c._opening) return false;
      c._opening = true;
      c.opened = true;
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      Balaclava.Audio.play('chest');
      if (game && game.stats) {
        game.stats.chestsOpened = (game.stats.chestsOpened || 0) + 1;
      }
      const coins = (c.bonus ? 14 : 8) + Balaclava.Utils.randInt(4, 12) + this.tier * 4;
      game.addCoins(coins);
      game.addItem(c.bonus ? 'cristales_magicos' : 'pocion_vida', c.bonus ? 2 : 1);
      game.addItem('llave_mazmorra', 1);
      if (c.chestTheme === 'frost' && Math.random() < 0.65) game.addItem('llave_zafiro', 1);
      else if (c.chestTheme === 'crimson' && Math.random() < 0.65) game.addItem('llave_rubi', 1);
      else if (c.bonus && Math.random() < 0.55) game.addItem('llave_dorada', 1);
      if (c.bonus && Math.random() < 0.65) game.addItem('tablilla_runica', 1);
      if (c.isBossChest) {
        game.addItem('fragmentos_antiguos', 2);
        game.addItem('llave_jefe', 1);
      }
      if (typeof game.spawnParticles === 'function') {
        game.spawnParticles((c.tx + 0.5) * TILE_SIZE, (c.ty + 0.5) * TILE_SIZE, '#ffd54f', 16);
      }
      if (typeof game.spawnFx === 'function') {
        const cxp = (c.tx + 0.5) * TILE_SIZE;
        const cyp = (c.ty + 0.5) * TILE_SIZE;
        game.spawnFx('px_treasure_burst', cxp, cyp - 6, 0, 0.72, 1.3, 1.0, { blend: 'lighter' });
        game.spawnFx('pvfx_treasure_glint', cxp, cyp - 12, 0, 0.85, 1.2, 0.96, { blend: 'lighter' });
      }
      if (typeof game.addFloatingText === 'function') {
        game.addFloatingText((c.tx + 0.5) * TILE_SIZE, c.ty * TILE_SIZE, `+${coins}`, '#ffd54f');
      }
      game.toast(T('dungeon.chestOpenedCoins', { coins }), 'success');
      return true;
    }

    /**
     * Point 9: Explicitly interact with the nearest unopened chest within player reach.
     */
    tryInteractChest(game) {
      if (!game || !game.player || !Array.isArray(this.chests)) return false;
      const px = game.player.x / TILE_SIZE;
      const py = game.player.y / TILE_SIZE;
      let bestChest = null;
      let bestDist = Infinity;
      for (const c of this.chests) {
        if (!c || c.opened || c._opening) continue;
        const d = Math.hypot(px - (c.tx + 0.5), py - (c.ty + 0.5));
        if (d <= 1.85 && d < bestDist) {
          bestDist = d;
          bestChest = c;
        }
      }
      if (bestChest) {
        return this.openChest(bestChest, game);
      }
      return false;
    }

    /**
     * Point 11: Spawn an Exit Portal inside the Boss Chamber once the dungeon boss is defeated.
     */
    spawnExitPortal(game) {
      if (this.exitPortal && this.exitPortal.active) return this.exitPortal;
      const cx = this.bossArenaCenter ? this.bossArenaCenter.tx : 31;
      const cy = this.bossArenaCenter ? this.bossArenaCenter.ty : 8;
      const offsets = [[0, -3], [2, -2], [-2, -2], [3, 0], [-3, 0], [0, 3], [2, 2], [-2, 2]];
      let px = cx;
      let py = Math.max(2, cy - 3);
      for (const [ox, oy] of offsets) {
        const tx = cx + ox;
        const ty = cy + oy;
        if (
          this.grid[ty] && this.grid[ty][tx] === 1 &&
          !this.chests.some(c => c.tx === tx && c.ty === ty) &&
          !this.runes.some(r => r.tx === tx && r.ty === ty)
        ) {
          px = tx;
          py = ty;
          break;
        }
      }
      if (this.grid[py]) this.grid[py][px] = 4;
      this.exitPortal = { tx: px, ty: py, active: true };
      if (game && typeof game.spawnParticles === 'function') {
        game.spawnParticles((px + 0.5) * TILE_SIZE, (py + 0.5) * TILE_SIZE, '#69f0ae', 24);
      }
      if (game && typeof game.addFloatingText === 'function') {
        game.addFloatingText((px + 0.5) * TILE_SIZE, py * TILE_SIZE - 8, 'PORTAL DE SALIDA ABIERTO', '#69f0ae');
      }
      return this.exitPortal;
    }

    /** Compute moderate dungeon-only HP and damage multipliers by enemy type and dungeon tier. */
    getDungeonEnemyMultipliers(type, base) {
      const rarityTable = {
        comun: { hp: 1.00, dmg: 1.00 },
        poco_comun: { hp: 1.08, dmg: 1.06 },
        raro: { hp: 1.16, dmg: 1.12 },
        epico: { hp: 1.24, dmg: 1.18 },
        legendario: { hp: 1.32, dmg: 1.24 }
      };
      const rar = rarityTable[(base && base.rarity) || 'comun'] || rarityTable.comun;
      let roleHp = 1.0;
      let roleDmg = 1.0;
      if (base && base.ranged) {
        roleHp = 0.94;
        roleDmg = 1.10;
      } else if (/(golem|orc|sentinel|knight|lancer|warden|titan|yeti|abomination|mummy|construct|guardian)/i.test(type || '') || (base && (base.hp || 0) >= 80 && (base.speed || 65) <= 64)) {
        roleHp = 1.14;
        roleDmg = 1.04;
      }
      const tierProgress = Math.min(1, this.tier / Math.max(1, DUNGEON_TIER_LIST.length - 1));
      const diffHp = 1.45 + tierProgress * 0.65;
      const diffDmg = 1.20 + tierProgress * 0.30;
      return {
        hpMult: rar.hp * roleHp * diffHp,
        dmgMult: rar.dmg * roleDmg * diffDmg,
        tierProgress
      };
    }

    makeMob(type, tx, ty, powerScale = 1.25) {
      const base = Balaclava.CombatSystem ? Balaclava.CombatSystem.getEnemyDef(type) : { hp: 35, dmg: 8, speed: 65 };
      const tierMult = (1 + this.tier * 0.18 + Math.pow(this.tier, 1.25) * 0.03) * (this.levelScale || 1);
      const { hpMult, dmgMult } = this.getDungeonEnemyMultipliers(type, base);
      const cMultHp = (this.isCorrupted ? 22 : 1) * (this.abyssScale ? this.abyssScale.hp : 1);
      const cMultDmg = (this.isCorrupted ? 6.5 : 1) * (this.abyssScale ? this.abyssScale.dmg : 1);
      const abSpd = this.abyssScale ? this.abyssScale.speed : 1;
      const hp = Math.min(9e14, Math.round((base.hp || 35) * 1.85 * powerScale * tierMult * hpMult * cMultHp));
      const dmg = Math.min(9e12, Math.round((base.dmg || 8) * 1.35 * (1 + (tierMult - 1) * 0.58) * dmgMult * cMultDmg));
      const mName = this.abyssFloor ? `[Abismo P${this.abyssFloor}] ${base.name || type}` : (this.isCorrupted ? `[Corrupto] ${base.name || type}` : (base.name || type));
      return {
        id: 'dmob_' + tx + '_' + ty + '_' + Math.random().toString(36).slice(2, 7),
        seed: Math.random() * 100,
        type,
        name: mName,
        level: Math.max(2, this.tier * 2 + 2, Math.floor(this.playerLevel * 0.85)) + (this.abyssFloor ? this.abyssFloor * 2 : 0),
        ranged: !!base.ranged,
        x: (tx + 0.5) * TILE_SIZE,
        y: (ty + 0.5) * TILE_SIZE,
        hp,
        maxHp: hp,
        dmg,
        speed: Math.min(220, Math.round((base.speed || 65) * 1.12 * abSpd)),
        facing: -1,
        radius: 20,
        hitW: 44,
        hitH: 50,
        bodyOffY: 17,
        hitFlash: 0,
        atkCd: 0.65 + Math.random() * 0.35,
        xpMult: 1.45
      };
    }

    makeMiniBoss(type, tx, ty) {
      const m = this.makeMob(type, tx, ty, 3.2);
      const tierProgress = Math.min(1, this.tier / Math.max(1, DUNGEON_TIER_LIST.length - 1));
      m.isMiniBoss = true;
      m.name = `Guardián ${m.name}`;
      m.hp = Math.max(m.hp, Math.round(this.def.boss.hp * (0.48 + tierProgress * 0.14)));
      m.maxHp = m.hp;
      m.dmg = Math.round(Math.max(m.dmg, this.def.boss.dmg * (0.82 + tierProgress * 0.14)));
      m.speed = Math.max(m.speed, 84 + Math.round(tierProgress * 20));
      m.radius = 25;
      m.hitW = 54;
      m.hitH = 60;
      m.bodyOffY = 22;
      m.level = this.tier * 2 + 4;
      m.xpMult = 3.0;
      m.telegraph = 0;
      m.telegraphMode = null;
      m.specialCd = 2.4;
      m.miniCycle = 0;
      m.enraged = false;
      return m;
    }

    onMiniBossDefeated(game) {
      if (this.miniBossDefeated) return;
      this.miniBossDefeated = true;
      const mc = this.miniBossChestPos || { tx: 25, ty: 26 };
      this.chests.push({ tx: mc.tx, ty: mc.ty, opened: false, bonus: true, chestTheme: this.def.chestTheme || 'gold' });
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      game.addFloatingText(mc.tx * TILE_SIZE, mc.ty * TILE_SIZE - 16, T('dungeon.guardianDefeated'), '#ffd54f');
      game.toast(T('dungeon.southSealBroken'), 'success');
      this.checkBossGateUnlock(game);
    }

    checkBossGateUnlock(game) {
      if (this.gateOpen || this.bossLocked || this.completed) return;
      if (this.vaultOpen && this.miniBossDefeated) {
        this.gateOpen = true;
        const gates = (this.bossGateTiles && this.bossGateTiles.length > 0)
          ? this.bossGateTiles
          : [[34, 14], [34, 15], [34, 16]];
        for (const [gx, gy] of gates) {
          if (this.grid[gy]) this.grid[gy][gx] = 1;
        }
        Balaclava.Audio.play('portal');
        game.toast(Balaclava.I18n ? Balaclava.I18n.t('dungeon.bothSealsOpen') : '¡Los Sellos Norte y Sur ceden! La Gran Puerta del Jefe se abre.', 'success');
      }
    }

    lockBossGateForFight(game) {
      if (this.bossLocked || this.completed) return;
      this.bossLocked = true;
      const gates = (this.bossGateTiles && this.bossGateTiles.length > 0)
        ? this.bossGateTiles
        : [[34, 14], [34, 15], [34, 16]];
      for (const [gx, gy] of gates) {
        if (this.grid[gy]) this.grid[gy][gx] = 3;
      }
      if (Balaclava.Audio) Balaclava.Audio.play('bomb');
      if (game && typeof game.shake === 'function') game.shake(0.24, 5);
      if (game && typeof game.toast === 'function') {
        const msg = Balaclava.I18n ? Balaclava.I18n.t('dungeon.bossGateLocked') : '¡La Puerta del Jefe se ha sellado! Derrota al guardián para salir.';
        game.toast(msg, 'warn');
      }
    }

    unlockBossGateAfterVictory() {
      this.bossLocked = false;
      this.gateOpen = true;
      const gates = (this.bossGateTiles && this.bossGateTiles.length > 0)
        ? this.bossGateTiles
        : [[34, 14], [34, 15], [34, 16]];
      for (const [gx, gy] of gates) {
        if (this.grid[gy]) this.grid[gy][gx] = 1;
      }
    }

    isTileWalkable(tx, ty) {
      if (!Number.isFinite(tx) || !Number.isFinite(ty)) return false;
      if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return false;
      const row = this.grid[ty];
      if (!row) return false;
      const t = row[tx];
      return t === 1 || t === 2 || t === 4;
    }

    hasLineOfSight(x0, y0, x1, y1) {
      if (!Number.isFinite(x0) || !Number.isFinite(y0) || !Number.isFinite(x1) || !Number.isFinite(y1)) return false;
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      if (len <= 10) {
        return this.isTileWalkable(Math.floor(x1 / TILE_SIZE), Math.floor(y1 / TILE_SIZE));
      }
      const steps = Math.max(2, Math.ceil(len / 10));
      for (let i = 1; i <= steps; i++) {
        const f = i / steps;
        const sx = x0 + dx * f;
        const sy = y0 + dy * f;
        if (!this.isTileWalkable(Math.floor(sx / TILE_SIZE), Math.floor(sy / TILE_SIZE))) {
          return false;
        }
      }
      return true;
    }

    clipRayToWalkable(x0, y0, x1, y1) {
      if (!Number.isFinite(x0) || !Number.isFinite(y0) || !Number.isFinite(x1) || !Number.isFinite(y1)) {
        return { x: x0 || 0, y: y0 || 0, blocked: true };
      }
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(len / 10));
      let lastX = x0;
      let lastY = y0;
      for (let i = 1; i <= steps; i++) {
        const f = i / steps;
        const sx = x0 + dx * f;
        const sy = y0 + dy * f;
        if (!this.isTileWalkable(Math.floor(sx / TILE_SIZE), Math.floor(sy / TILE_SIZE))) {
          return { x: lastX, y: lastY, blocked: true };
        }
        lastX = sx;
        lastY = sy;
      }
      return { x: x1, y: y1, blocked: false };
    }

    update(dt, game) {
      this.trapTimer += dt;
      if (this.trapTimer >= 1.85) {
        this.trapTimer = 0;
        this.trapsActive = !this.trapsActive;
      }

      const ptx = Math.floor(game.player.x / TILE_SIZE);
      const pty = Math.floor(game.player.y / TILE_SIZE);

      // Trap damage
      if (this.trapsActive && this.grid[pty] && this.grid[pty][ptx] === 2) {
        game.damagePlayer(this.def.boss.dmg * 0.45);
      }

      // Active ground hazard zones (meteors, bombs, pillars, elemental pools, cross fissures)
      if (!Array.isArray(this.hazardZones)) this.hazardZones = [];
      if (Balaclava.EnemyAttacks && Balaclava.EnemyAttacks.updateHazards) {
        Balaclava.EnemyAttacks.updateHazards(game, this.hazardZones, (wx, wy) => this.isTileWalkable(Math.floor(wx / TILE_SIZE), Math.floor(wy / TILE_SIZE)), dt);
      }

      // Point 8: Intentional Puzzle Logic (Wing Seals + Readable Sequence Puzzle with Edge-Triggered Pads)
      const T = (k, v) => (Balaclava.I18n ? Balaclava.I18n.t(k, v) : k);
      const getRuneDisplayLabel = (r) => {
        if (r.id === 'alfa') return T('dungeon.wingAlpha');
        if (r.id === 'beta') return T('dungeon.wingBeta');
        if (r.crestName) return r.crestName;
        if (r.id === 'seq_1') return T('dungeon.runeRoman1');
        if (r.id === 'seq_2') return T('dungeon.runeRoman2');
        if (r.id === 'seq_3') return T('dungeon.runeRoman3');
        return r.label || T('dungeon.runeLabel');
      };

      // Inspecting the ancient puzzle tablet (Interact [E] or close proximity once)
      if (this.puzzleTablet) {
        const distTab = Math.hypot(ptx - this.puzzleTablet.tx, pty - this.puzzleTablet.ty);
        if (distTab <= 1.6) {
          const interactPressed = !!(game.keys && (game.keys['KeyE'] || game.keys['Space']));
          if (interactPressed && !this._tabletInteractLock) {
            this._tabletInteractLock = true;
            this.puzzleTablet.read = true;
            Balaclava.Audio.play('click');
            game.toast(this.puzzleTablet.hintText, 'info');
            game.addFloatingText(this.puzzleTablet.tx * TILE_SIZE + 24, this.puzzleTablet.ty * TILE_SIZE - 8, this.puzzleTablet.title || 'ESTELA RUNICA', '#ffd54f');
          } else if (!interactPressed) {
            this._tabletInteractLock = false;
          }
          if (!this.puzzleTablet.autoShown && distTab <= 1.15) {
            this.puzzleTablet.autoShown = true;
            this.puzzleTablet.read = true;
            game.toast(this.puzzleTablet.hintText, 'info');
          }
        } else {
          this._tabletInteractLock = false;
        }
      }

      const steppedRune = this.runes.find(r => ptx === r.tx && pty === r.ty);
      const currentPadKey = steppedRune ? `${steppedRune.id}:${steppedRune.tx},${steppedRune.ty}` : null;
      const isNewPadStep = currentPadKey !== null && currentPadKey !== this._lastRunePadKey;
      this._lastRunePadKey = currentPadKey;

      if (steppedRune && isNewPadStep) {
        const r = steppedRune;
        const rLbl = getRuneDisplayLabel(r);
        if (r.kind === 'wing' && !r.active) {
          r.active = true;
          Balaclava.Audio.play('chest');
          game.spawnParticles(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE + 24, '#80deea', 12);
          game.addFloatingText(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE, T('dungeon.runeLit', { label: rLbl }), '#80deea');
          if (this.runes.filter(x => x.kind === 'wing').every(x => x.active) && !this.wingsOpen) {
            this.wingsOpen = true;
            const wDoors = (this.wingDoorTiles && this.wingDoorTiles.length > 0)
              ? this.wingDoorTiles
              : [[17, 9], [18, 9], [19, 9], [17, 21], [18, 21], [19, 21]];
            for (const [dx, dy] of wDoors) {
              if (this.grid[dy]) this.grid[dy][dx] = 1;
            }
            Balaclava.Audio.play('portal');
            game.toast(T('dungeon.wingsOpen'), 'success');
          }
        } else if (r.kind === 'seq' && !this.vaultOpen && !r.active) {
          if (r.order === this.seqProgress + 1) {
            r.active = true;
            this.seqProgress = r.order;
            Balaclava.Audio.play('chest');
            game.spawnParticles(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE + 24, '#69f0ae', 12);
            game.addFloatingText(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE, `${rLbl} [${this.seqProgress}/3]`, '#ffd54f');
            if (this.seqProgress >= 3) {
              this.vaultOpen = true;
              const vDoors = (this.vaultDoorTiles && this.vaultDoorTiles.length > 0)
                ? this.vaultDoorTiles
                : [[26, 3], [26, 4], [26, 5]];
              for (const [vx, vy] of vDoors) {
                if (this.grid[vy]) this.grid[vy][vx] = 1;
              }
              Balaclava.Audio.play('portal');
              game.toast(T('dungeon.seqComplete'), 'success');
              this.checkBossGateUnlock(game);
            }
          } else {
            // Wrong step in sequence: reset sequence cleanly once per step (never spam every frame)
            this.seqProgress = 0;
            this.runes.filter(x => x.kind === 'seq').forEach(x => { x.active = false; });
            // If the player stepped on the actual first rune (order 1) after a mistake, start sequence from 1 immediately
            if (r.order === 1) {
              r.active = true;
              this.seqProgress = 1;
              Balaclava.Audio.play('chest');
              game.spawnParticles(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE + 24, '#ffd54f', 10);
              game.addFloatingText(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE, `REINICIO -> ${rLbl} [1/3]`, '#ffd54f');
            } else {
              Balaclava.Audio.play('error');
              game.spawnParticles(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE + 24, '#ef5350', 10);
              const clueReminder = this.puzzleTablet ? ` (${this.puzzleTablet.shortHint})` : '';
              game.toast(T('dungeon.seqWrong') + clueReminder, 'warn');
            }
          }
        }
      }

      // Point 9: Open chests ONLY on explicit player interaction ([E] / [F] key or click), never on proximity walk-over
      const chestInteractKey = !!(game.keys && (game.keys['KeyE'] || game.keys['KeyF']));
      if (chestInteractKey && !this._chestInteractLock) {
        this._chestInteractLock = true;
        this.tryInteractChest(game);
      } else if (!chestInteractKey) {
        this._chestInteractLock = false;
      }

      // Dungeon garrison & Mini-Boss AI
      const canWalkPx = (wx, wy) => Number.isFinite(wx) && Number.isFinite(wy) && this.isTileWalkable(Math.floor(wx / TILE_SIZE), Math.floor(wy / TILE_SIZE));
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (e.hitFlash > 0) e.hitFlash -= dt;
        if (e.slowTimer > 0) e.slowTimer = Math.max(0, e.slowTimer - dt);
        if (e.stunTimer > 0) e.stunTimer = Math.max(0, e.stunTimer - dt);
        if (e.poisonTimer > 0) {
          e.poisonTimer = Math.max(0, e.poisonTimer - dt);
          e._poisonTick = (e._poisonTick || 0) + dt;
          if (e._poisonTick >= 0.7) {
            e._poisonTick -= 0.7;
            game.combat.damageEnemy(game, e, Math.max(3, Math.round((e.maxHp || 60) * 0.032)), 0, false, false);
            if (e._dead || e.hp <= 0) continue;
          }
        }
        if (e.burnTimer > 0) {
          e.burnTimer = Math.max(0, e.burnTimer - dt);
          e._burnTick = (e._burnTick || 0) + dt;
          if (e._burnTick >= 0.75) {
            e._burnTick -= 0.75;
            game.combat.damageEnemy(game, e, Math.max(4, Math.round((e.maxHp || 60) * 0.032)), 0, false, false);
            if (e._dead || e.hp <= 0) continue;
          }
        }
        if (game.spawnFx && ((e.burnTimer || 0) > 0 || (e.slowTimer || 0) > 0 || (e.poisonTimer || 0) > 0 || (e.stunTimer || 0) > 0)) {
          e._statusFxCd = (e._statusFxCd || 0) - dt;
          if (e._statusFxCd <= 0) {
            e._statusFxCd = 0.52;
            const stKey = e.stunTimer > 0 ? 'st_stun'
              : e.burnTimer > 0 ? 'st_burn'
              : e.poisonTimer > 0 ? 'st_poisonbubble'
              : 'st_freeze';
            game.spawnFx(stKey, e.x, e.y - 12, 0, 0.48, 0.75, 0.9, { follow: e, offY: -12, blend: 'lighter' });
          }
        }
        const spdScale = e.stunTimer > 0 ? 0 : (e.slowTimer > 0 ? 0.45 : 1);
        const d = Balaclava.Utils.dist(e.x, e.y, game.player.x, game.player.y);

        if (!e.state) e.state = 'chase';
        if (e.specialAtkCd === undefined) e.specialAtkCd = 2.0;
        if (e.specialAtkCd > 0) e.specialAtkCd -= dt;
        if (e.atkCd > 0) e.atkCd -= dt;

        // Mini-boss enrage at <= 55% HP
        if (e.isMiniBoss && !e.enraged && e.hp > 0 && e.hp <= e.maxHp * 0.55) {
          e.enraged = true;
          e.speed = Math.round(e.speed * 1.22);
          e.dmg = Math.round(e.dmg * 1.15);
          if (game.spawnShockwave) game.spawnShockwave(e.x, e.y, 112, '#ff5252');
          if (game.spawnFx) game.spawnFx('pvfx_fire_nova', e.x, e.y, 0, 0.65, 1.35, 0.96, { blend: 'lighter' });
          if (game.addFloatingText) game.addFloatingText(e.x, e.y - 42, 'GUARDIAN ENFURECIDO', '#ff5252');
          if (this.enemies.length < 18) {
            const stx = Math.floor(e.x / TILE_SIZE);
            const sty = Math.floor(e.y / TILE_SIZE);
            const tSummon = this.def.enemyTypes[0] || e.type;
            for (const ox of [-2, 2]) {
              if (this.isTileWalkable(stx + ox, sty)) {
                this.enemies.push(this.makeMob(tSummon, stx + ox, sty, 1.15));
              }
            }
          }
        }

        const enemyApi = Balaclava.EnemyAttacks;
        if (enemyApi && enemyApi.stepMobAI) {
          const aiStep = enemyApi.stepMobAI(game, e, dt, {
            isDungeon: true,
            enemies: this.enemies,
            hazards: this.hazardZones,
            canWalkPx,
            hasLos: (x0, y0, x1, y1) => this.hasLineOfSight(x0, y0, x1, y1),
            bossTheme: enemyApi.getBossTheme ? enemyApi.getBossTheme(this.id) : null
          });
          e.animVx = (aiStep.moveVx || 0) * spdScale;
          e.animVy = (aiStep.moveVy || 0) * spdScale;
          if (!aiStep.handledMove) {
            const nx = e.x + (aiStep.moveVx || 0) * spdScale * dt;
            const ny = e.y + (aiStep.moveVy || 0) * spdScale * dt;
            if (Number.isFinite(nx) && canWalkPx(nx, e.y)) e.x = nx;
            if (Number.isFinite(ny) && canWalkPx(e.x, ny)) e.y = ny;
          }
        }
      }

      // Grand 3-Phase Boss AI — lock boss chamber door as soon as hero steps past threshold
      if (this.phaseBanner && this.phaseBanner.timer > 0) {
        this.phaseBanner.timer = Math.max(0, this.phaseBanner.timer - dt);
      }
      const bossMinTileX = (this.bossRoomMinX || 34);
      if (this.boss && this.boss.hp > 0 && this.gateOpen && !this.bossLocked && game.player.x >= (bossMinTileX + 1.15) * TILE_SIZE) {
        this.lockBossGateForFight(game);
      }
      if (this.boss && this.boss.hp > 0 && (this.bossLocked || ptx >= bossMinTileX + 1)) {
        const b = this.boss;
        const bMinX = (this.bossRoomMinX || 34) + 3;
        const bMaxX = Math.max(bMinX + 6, this.width - 5);
        const isBossWalkable = (wx, wy) => Number.isFinite(wx) && Number.isFinite(wy) && Math.floor(wx / TILE_SIZE) >= bMinX - 1 && this.isTileWalkable(Math.floor(wx / TILE_SIZE), Math.floor(wy / TILE_SIZE));
        const enemyApi = Balaclava.EnemyAttacks;
        const theme = (enemyApi && enemyApi.getBossTheme)
          ? enemyApi.getBossTheme(this.id)
          : {
              color: this.def.accentColor || '#ff5252',
              phaseVfx: 'pvfx_fire_nova',
              slamVfx: 'pvfx_ground_slam',
              leapVfx: 'pvfx_meteor_strike',
              fissureVfx: 'pvfx_fire_pillar',
              meteorVfx: 'pvfx_meteor_strike',
              dashVfx: 'pvfx_sword_combo',
              castVfx: 'pvfx_magic_circle',
              projVfx: 'aw_arcane_missile',
              projAltVfx: 'px_energy_bolt',
              projImpactVfx: 'pvfx_hit_spark',
              pillarVfx: 'pvfx_fire_pillar',
              status: null
            };
        const bossCol = theme.color || this.def.accentColor || '#ff5252';
        const projCfg = (alt = false, extra = null) => Object.assign({
          vfxKey: alt ? theme.projAltVfx : theme.projVfx,
          impactVfx: theme.projImpactVfx,
          status: theme.status || null
        }, extra || {});
        if (b.hitFlash > 0) b.hitFlash -= dt;
        const pct = b.hp / b.maxHp;
        if (pct < 0.66 && b.phase === 1) {
          b.phase = 2;
          b.phaseCycle = 0;
          b.speed *= 1.2;
          b.dashTimer = 0;
          b.leapDur = 0;
          b.telegraph = 0;
          b.telegraphMode = null;
          b.attackTimer = 0.75;
          this.phaseBanner = {
            title: T('dungeon.phase2Title', { boss: b.name.toUpperCase() }),
            subtitle: T('dungeon.phase2Sub'),
            phase: 2,
            timer: 3.2,
            maxTimer: 3.2
          };
          game.toast(T('dungeon.phase2Toast', { boss: b.name }), 'warn');
          Balaclava.Audio.play('thunder');
          Balaclava.Audio.play('meteor');
          game.shake(0.55, 11);
          game.spawnShockwave(b.x, b.y, 175, bossCol);
          game.spawnFx(theme.phaseVfx || 'pvfx_fire_nova', b.x, b.y - 6, 0, 0.85, 1.5, 1.0, { blend: 'lighter' });
          game.spawnFx(theme.castVfx || 'pvfx_magic_circle', b.x, b.y + 4, 0, 0.95, 1.6, 0.9, { blend: 'lighter' });
          game.spawnParticles(b.x, b.y, bossCol, 28);
          game.addFloatingText(b.x, b.y - 56, T('dungeon.phase2Float'), '#ffd54f');
          const ay = this.bossArenaCenter ? this.bossArenaCenter.ty : 19;
          this.enemies.push(this.makeMob(this.def.enemyTypes[0], bMinX + 2, ay - 5, 1.2));
          this.enemies.push(this.makeMob(this.def.enemyTypes[this.def.enemyTypes.length - 1], bMinX + 2, ay + 5, 1.2));
        } else if (pct < 0.33 && b.phase === 2) {
          b.phase = 3;
          b.phaseCycle = 0;
          b.speed *= 1.18;
          b.dashTimer = 0;
          b.leapDur = 0;
          b.telegraph = 0;
          b.telegraphMode = null;
          b.attackTimer = 0.55;
          this.phaseBanner = {
            title: T('dungeon.phase3Title', { boss: b.name.toUpperCase() }),
            subtitle: T('dungeon.phase3Sub'),
            phase: 3,
            timer: 3.6,
            maxTimer: 3.6
          };
          game.toast(T('dungeon.phase3Toast', { boss: b.name }), 'warn');
          Balaclava.Audio.play('thunder');
          Balaclava.Audio.play('meteor');
          Balaclava.Audio.play('levelup');
          game.shake(0.75, 14);
          game.spawnShockwave(b.x, b.y, 215, bossCol);
          game.spawnFx(theme.phaseVfx || 'pvfx_big_explosion', b.x, b.y - 6, 0, 0.95, 1.7, 1.0, { blend: 'lighter' });
          game.spawnFx(theme.pillarVfx || 'pvfx_fire_pillar', b.x, b.y - 12, 0, 0.9, 1.45, 0.96, { blend: 'lighter' });
          game.spawnFx(theme.castVfx || 'pvfx_magic_circle', b.x, b.y + 4, 0, 1.05, 1.85, 0.95, { blend: 'lighter' });
          game.spawnParticles(b.x, b.y, bossCol, 36);
          game.addFloatingText(b.x, b.y - 62, T('dungeon.phase3Float'), '#ff5252');
          const ay = this.bossArenaCenter ? this.bossArenaCenter.ty : 19;
          this.enemies.push(this.makeMob(this.def.enemyTypes[1 % this.def.enemyTypes.length], bMaxX - 1, ay - 5, 1.35));
          this.enemies.push(this.makeMob(this.def.enemyTypes[1 % this.def.enemyTypes.length], bMaxX - 1, ay + 5, 1.35));
        }

        const d = Balaclava.Utils.dist(b.x, b.y, game.player.x, game.player.y);
        const ang = Math.atan2(game.player.y - b.y, game.player.x - b.x);
        b.facing = game.player.x >= b.x ? 1 : -1;

        if ((b.dashTimer || 0) > 0) {
          b.dashTimer -= dt;
          b._dashHitCd = Math.max(0, (b._dashHitCd || 0) - dt);
          const nx = b.x + (b.dashVx || 0) * dt;
          const ny = b.y + (b.dashVy || 0) * dt;
          if (isBossWalkable(nx, b.y)) b.x = nx;
          if (isBossWalkable(b.x, ny)) b.y = ny;
          if (Balaclava.Utils.dist(b.x, b.y, game.player.x, game.player.y) < 58 && b._dashHitCd <= 0) {
            b._dashHitCd = 0.45;
            game.spawnFx(theme.dashVfx || 'pvfx_sword_combo', b.x, b.y - 6, Math.atan2(b.dashVy || 0, b.dashVx || 1), 0.35, 1.15, 0.98, { blend: 'lighter' });
            game.damagePlayer(Math.round(b.dmg * 1.28), { status: theme.status || null });
            game.spawnParticles(game.player.x, game.player.y, bossCol, 12);
          }
          if (b.dashTimer <= 0) {
            game.spawnShockwave(b.x, b.y, 92, bossCol);
            game.spawnFx(theme.slamVfx || 'pvfx_ground_slam', b.x, b.y, 0, 0.45, 1.05, 0.95, { blend: 'lighter' });
            if ((b.dashCharges || 0) > 0) {
              b.dashCharges -= 1;
              b.telegraph = 0.28;
              b.telegraphMode = 'dash_combo';
              b.targetAngle = Math.atan2(game.player.y - b.y, game.player.x - b.x);
              b.targetX = game.player.x;
              b.targetY = game.player.y;
            }
          }
        } else if ((b.leapDur || 0) > 0) {
          const prevP = b.leapProg || 0;
          b.leapProg = Math.min(1, prevP + dt / b.leapDur);
          const frac = (b.leapProg - prevP) / Math.max(0.01, 1 - prevP);
          const nx = b.x + ((b.targetX ?? game.player.x) - (b.leapStartX ?? b.x)) * frac;
          const ny = b.y + ((b.targetY ?? game.player.y) - (b.leapStartY ?? b.y)) * frac;
          if (isBossWalkable(nx, b.y)) b.x = nx;
          if (isBossWalkable(b.x, ny)) b.y = ny;
          if (b.leapProg >= 1) {
            b.leapDur = 0;
            b.leapProg = 0;
            Balaclava.Audio.play('bomb');
            game.shake(0.35, 9);
            game.spawnFx(theme.leapVfx || 'pvfx_meteor_strike', b.x, b.y - 6, 0, 0.65, 1.35, 0.98, { blend: 'lighter' });
            game.spawnFx(theme.slamVfx || 'pvfx_ground_slam', b.x, b.y + 4, 0, 0.5, 1.2, 0.92, { blend: 'lighter' });
            game.spawnShockwave(b.x, b.y, 122, bossCol);
            if (Balaclava.Utils.dist(b.x, b.y, game.player.x, game.player.y) < 115) {
              game.damagePlayer(Math.round(b.dmg * 1.42), { status: theme.status || null });
            }
            for (let k = 0; k < 8; k++) {
              const a = (k / 8) * Math.PI * 2;
              game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 235, Math.sin(a) * 235, Math.round(b.dmg * 0.85), bossCol, projCfg(false));
            }
            this.hazardZones.push({ kind: 'pool', x: b.x, y: b.y, radius: 52, duration: 2.5, timer: 0, dmg: b.dmg, color: bossCol, vfxKey: theme.pillarVfx, status: theme.status || null });
          }
        } else if (b.telegraph > 0) {
          b.telegraph -= dt;
          if (b.telegraph <= 0) {
            const mode = b.telegraphMode;
            const tAng = (b.targetAngle !== null && b.targetAngle !== undefined) ? b.targetAngle : ang;
            b.telegraphMode = null;
            if (mode === 'slam') {
              const r = b.phase === 3 ? 156 : b.phase === 2 ? 136 : 120;
              game.spawnShockwave(b.x, b.y, r, bossCol);
              game.spawnFx(theme.slamVfx || 'pvfx_ground_slam', b.x, b.y, 0, 0.6, b.phase === 3 ? 1.45 : 1.25, 0.98, { blend: 'lighter' });
              Balaclava.Audio.play('bomb');
              game.shake(0.30, 8);
              if (d < r) game.damagePlayer(Math.round(b.dmg * (b.phase === 3 ? 1.50 : 1.35)), { isMagic: true, status: theme.status || null });
              this.hazardZones.push({ kind: 'pool', x: b.x, y: b.y, radius: Math.round(r * 0.52), duration: 2.2, timer: 0, dmg: b.dmg, color: bossCol, vfxKey: theme.pillarVfx, status: theme.status || null });
              if (b.phase >= 2) {
                for (let k = 0; k < 8; k++) {
                  const ca = (k * Math.PI) / 4 + 0.2;
                  game.spawnEnemyProjectile(b.x, b.y, Math.cos(ca) * 225, Math.sin(ca) * 225, Math.round(b.dmg * 0.85), bossCol, projCfg(true));
                }
              }
            } else if (mode === 'aimed_volley') {
              Balaclava.Audio.play('magic');
              game.spawnFx(theme.castVfx || 'pvfx_magic_circle', b.x, b.y, tAng, 0.4, 1.0, 0.9, { blend: 'lighter' });
              const spd = 255 + b.phase * 18;
              for (let k = -2; k <= 2; k++) {
                const a = tAng + k * 0.17;
                game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * spd, Math.sin(a) * spd, Math.round(b.dmg * 0.90), bossCol, projCfg(false));
              }
              for (const s of [-0.55, 0.55]) {
                game.spawnEnemyProjectile(b.x, b.y, Math.cos(tAng + s) * (spd * 0.85), Math.sin(tAng + s) * (spd * 0.85), Math.round(b.dmg * 0.82), bossCol, projCfg(true));
              }
            } else if (mode === 'dash_strike' || mode === 'dash_combo') {
              const dashSpd = 420 + b.phase * 55;
              b.dashTimer = 0.34;
              b._dashHitCd = 0;
              b.dashVx = Math.cos(tAng) * dashSpd;
              b.dashVy = Math.sin(tAng) * dashSpd;
              game.spawnFx(theme.dashVfx || 'pvfx_dash_dust', b.x, b.y, tAng, 0.35, 1.0, 0.92, { blend: 'lighter' });
              Balaclava.Audio.play('slash');
            } else if (mode === 'leap_slam') {
              b.leapDur = 0.46;
              b.leapProg = 0.001;
              b.leapStartX = b.x;
              b.leapStartY = b.y;
              b.targetX = b.targetX ?? game.player.x;
              b.targetY = b.targetY ?? game.player.y;
              game.spawnFx(theme.castVfx || 'pvfx_dust_puff', b.x, b.y, 0, 0.36, 1.0, 0.9);
            } else if (mode === 'cross_fissure') {
              Balaclava.Audio.play('magic');
              game.spawnFx(theme.castVfx || 'pvfx_magic_circle', b.x, b.y, 0, 0.45, 1.15, 0.92, { blend: 'lighter' });
              const cx = b.targetX ?? game.player.x;
              const cy = b.targetY ?? game.player.y;
              const halfLen = 140;
              for (const offA of [0, Math.PI / 2]) {
                const fa = tAng + offA;
                this.hazardZones.push({
                  kind: 'fissure',
                  x: cx - Math.cos(fa) * halfLen,
                  y: cy - Math.sin(fa) * halfLen,
                  x2: cx + Math.cos(fa) * halfLen,
                  y2: cy + Math.sin(fa) * halfLen,
                  halfW: 20,
                  delay: 0.80,
                  duration: 1.70,
                  timer: 0,
                  dmg: b.dmg * 1.05,
                  color: bossCol,
                  vfxKey: theme.fissureVfx || 'pvfx_fire_pillar',
                  status: theme.status || null
                });
              }
              for (let k = 0; k < 6; k++) {
                const a = ang + (k / 6) * Math.PI * 2;
                game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 215, Math.sin(a) * 215, Math.round(b.dmg * 0.82), bossCol, projCfg(true));
              }
            } else if (mode === 'spiral_barrage') {
              const count = b.phase === 3 ? 14 : 10;
              const offset = ((b.phaseCycle || 0) % 3) * 0.24;
              Balaclava.Audio.play('magic');
              game.spawnFx(theme.castVfx || 'pvfx_magic_circle', b.x, b.y, 0, 0.42, 1.1, 0.92, { blend: 'lighter' });
              for (let k = 0; k < count; k++) {
                const a = ang + offset + (k / count) * Math.PI * 2;
                game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 265, Math.sin(a) * 265, Math.round(b.dmg * 0.90), bossCol, projCfg(false));
                if (b.phase >= 2 && k % 2 === 0) {
                  game.spawnEnemyProjectile(b.x, b.y, Math.cos(a - 0.16) * 200, Math.sin(a - 0.16) * 200, Math.round(b.dmg * 0.80), bossCol, projCfg(true, { homing: b.phase >= 3 ? 0.85 : 0 }));
                }
              }
            } else if (mode === 'meteor_rain') {
              Balaclava.Audio.play('meteor');
              game.spawnFx(theme.castVfx || 'pvfx_magic_circle', b.x, b.y, 0, 0.5, 1.2, 0.95, { blend: 'lighter' });
              const baseX = b.targetX ?? game.player.x;
              const baseY = b.targetY ?? game.player.y;
              const offsets = [[0, 0], [84, -48], [-84, 48], [0, 88]];
              for (let k = 0; k < offsets.length; k++) {
                const mx = baseX + offsets[k][0];
                const my = baseY + offsets[k][1];
                if (isBossWalkable(mx, my)) {
                  this.hazardZones.push({
                    kind: 'meteor',
                    x: mx,
                    y: my,
                    radius: 62,
                    delay: 0.85 + k * 0.20,
                    duration: 3.1,
                    timer: 0,
                    detonated: false,
                    dmg: b.dmg * 1.20,
                    color: bossCol,
                    vfxKey: theme.meteorVfx || 'pvfx_meteor_strike',
                    status: theme.status || null
                  });
                }
              }
              for (let k = 0; k < 10; k++) {
                const a = ang + (k / 10) * Math.PI * 2;
                game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 245, Math.sin(a) * 245, Math.round(b.dmg * 0.88), bossCol, projCfg(false));
              }
            } else if (mode === 'pillar_ring') {
              Balaclava.Audio.play('thunder');
              game.spawnFx(theme.castVfx || 'pvfx_magic_circle', b.x, b.y, 0, 0.48, 1.25, 0.96, { blend: 'lighter' });
              const tx = b.targetX ?? game.player.x;
              const ty = b.targetY ?? game.player.y;
              const ringCount = b.phase === 3 ? 6 : 4;
              const spots = [{ x: tx, y: ty }];
              for (let k = 0; k < ringCount; k++) {
                const pa = (k / ringCount) * Math.PI * 2 + 0.3;
                spots.push({ x: tx + Math.cos(pa) * 96, y: ty + Math.sin(pa) * 96 });
              }
              for (let k = 0; k < spots.length; k++) {
                const sp = spots[k];
                if (isBossWalkable(sp.x, sp.y)) {
                  this.hazardZones.push({
                    kind: 'pillar',
                    x: sp.x,
                    y: sp.y,
                    radius: 54,
                    delay: 0.92,
                    oneShot: true,
                    timer: 0,
                    dmg: b.dmg * 1.15,
                    color: bossCol,
                    vfxKey: theme.pillarVfx || 'pvfx_fire_pillar',
                    status: theme.status || null
                  });
                }
              }
              for (let k = 0; k < 6; k++) {
                const a = ang + (k / 6) * Math.PI * 2;
                game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 230, Math.sin(a) * 230, Math.round(b.dmg * 0.85), bossCol, projCfg(true));
              }
            } else if (mode === 'barrage') {
              const count = b.phase === 3 ? 14 : b.phase === 2 ? 11 : 8;
              Balaclava.Audio.play('magic');
              game.spawnFx(theme.castVfx || 'pvfx_magic_circle', b.x, b.y, 0, 0.4, 1.05, 0.92, { blend: 'lighter' });
              for (let k = 0; k < count; k++) {
                const a = ang + (k / count) * Math.PI * 2;
                game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 235, Math.sin(a) * 235, Math.round(b.dmg * 0.88), bossCol, projCfg(true));
              }
              for (let k = -1; k <= 1; k++) {
                const a = ang + k * 0.14;
                game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 290, Math.sin(a) * 290, Math.round(b.dmg * 0.92), bossCol, projCfg(false, { homing: b.phase >= 2 ? 0.95 : 0 }));
              }
            }
          }
        } else {
          const nx = b.x + Math.cos(ang) * b.speed * dt;
          const ny = b.y + Math.sin(ang) * b.speed * dt;
          if (isBossWalkable(nx, b.y)) b.x = nx;
          if (isBossWalkable(b.x, ny)) b.y = ny;

          if (d < 46) game.damagePlayer(Math.round(b.dmg * 0.78), { status: theme.status || null });

          b.attackTimer -= dt;
          if (b.attackTimer <= 0) {
            b.phaseCycle = (b.phaseCycle || 0) + 1;
            b.attackTimer = b.phase === 3 ? 1.38 : b.phase === 2 ? 1.80 : 2.35;
            b.targetAngle = ang;
            b.targetX = game.player.x;
            b.targetY = game.player.y;
            if (b.phase === 1) {
              const modes1 = d < 125 ? ['slam', 'aimed_volley', 'dash_strike', 'barrage'] : ['aimed_volley', 'dash_strike', 'barrage', 'slam'];
              b.telegraphMode = modes1[b.phaseCycle % modes1.length];
            } else if (b.phase === 2) {
              const modes2 = d < 125
                ? ['slam', 'dash_combo', 'cross_fissure', 'pillar_ring', 'spiral_barrage', 'leap_slam']
                : ['dash_combo', 'cross_fissure', 'pillar_ring', 'leap_slam', 'spiral_barrage', 'aimed_volley'];
              b.telegraphMode = modes2[b.phaseCycle % modes2.length];
              b.dashCharges = b.telegraphMode === 'dash_combo' ? 1 : 0;
            } else {
              const modes3 = d < 125
                ? ['meteor_rain', 'pillar_ring', 'slam', 'dash_combo', 'cross_fissure', 'leap_slam', 'spiral_barrage']
                : ['meteor_rain', 'pillar_ring', 'dash_combo', 'cross_fissure', 'leap_slam', 'spiral_barrage'];
              b.telegraphMode = modes3[b.phaseCycle % modes3.length];
              b.dashCharges = b.telegraphMode === 'dash_combo' ? 2 : 0;
            }
            b.telegraph = b.phase === 3 ? 0.56 : b.phase === 2 ? 0.64 : 0.72;
          }
        }
      }
    }
  }

  Balaclava.DUNGEON_DEFS = DUNGEON_DEFS;
  Balaclava.DUNGEON_TIER_LIST = DUNGEON_TIER_LIST;
  Balaclava.DungeonInstance = DungeonInstance;
})();
