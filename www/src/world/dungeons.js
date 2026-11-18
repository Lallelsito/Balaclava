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
    },

    // ── BIOMA MONTAÑAS HELADAS (Dungeon 5/5 para completar Zona II) ──
    montanas_cumbre: {
      id: 'montanas_cumbre', themeKey: 'montanas_heladas', chestTheme: 'frost',
      name: 'Cumbre del Ventisquero Eterno',
      floorColor: '#1f2d3d', wallColor: '#54738e', accentColor: '#80deea',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_knight',
      bossRelicId: 'sello_cumbre_helada',
      boss: { name: 'Valkiria de Escarcha Skadi', hp: 5600, dmg: 96, speed: 112, color: '#80deea', drops: { fragmentos_antiguos: 3, lingote_titanio: 4, zafiro: 3, llave_zafiro: 1 }, coins: 310, xp: 1480 },
      enemyTypes: ['wolf', 'golem', 'slime_blue', 'ghastly_eye', 'enemy_glaciar_whelp']
    },

    // ── ZONA III: ARCHIPIÉLAGO CORAL (5 Dungeons, Tiers 9-10) ──
    coral_arrecife: {
      id: 'coral_arrecife', themeKey: 'archipielago_coral', chestTheme: 'frost',
      name: 'Gruta del Arrecife Vivo',
      floorColor: '#123342', wallColor: '#1d6278', accentColor: '#26c6da',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_goddess',
      bossRelicId: 'amuleto_arrecife_coral',
      boss: { name: 'Cangrejo Acorazado Karkinos', hp: 8200, dmg: 132, speed: 108, color: '#26c6da', drops: { coral_roca: 12, lingote_coral: 3, perla_turquesa: 2, fragmentos_antiguos: 4, llave_zafiro: 1 }, coins: 460, xp: 2550 },
      enemyTypes: ['enemy_coral_crab', 'enemy_coral_cobra', 'slime_blue', 'cobra']
    },
    coral_perla: {
      id: 'coral_perla', themeKey: 'archipielago_coral', chestTheme: 'frost',
      name: 'Santuario de la Perla Abisal',
      floorColor: '#103a47', wallColor: '#21718a', accentColor: '#4dd0e1',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_goddess',
      bossRelicId: 'perla_sirena_azul',
      boss: { name: 'Oráculo Sirena Thallasa', hp: 9000, dmg: 140, speed: 115, color: '#4dd0e1', drops: { coral_roca: 14, lingote_coral: 4, perla_turquesa: 3, fragmentos_antiguos: 4, llave_jefe: 1 }, coins: 510, xp: 2800 },
      enemyTypes: ['enemy_coral_cobra', 'enemy_coral_crab', 'ghastly_eye', 'wisp']
    },
    coral_abismo: {
      id: 'coral_abismo', themeKey: 'archipielago_coral', chestTheme: 'frost',
      name: 'Fosa de la Marea Eterna',
      floorColor: '#0e2d3b', wallColor: '#19546b', accentColor: '#00acc1',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_knight',
      bossRelicId: 'tridente_fosa_marina',
      boss: { name: 'Portador del Tridente Nereo', hp: 9800, dmg: 148, speed: 118, color: '#00acc1', drops: { lingote_coral: 5, placa_coral: 2, perla_turquesa: 3, fragmentos_antiguos: 5, llave_zafiro: 1 }, coins: 560, xp: 3100 },
      enemyTypes: ['enemy_coral_crab', 'enemy_coral_cobra', 'enemy_abismo_wisp', 'golem']
    },
    coral_bastion: {
      id: 'coral_bastion', themeKey: 'archipielago_coral', chestTheme: 'frost',
      name: 'Bastión del Arrecife Sumergido',
      floorColor: '#112f3d', wallColor: '#23647a', accentColor: '#0097a7',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_knight',
      bossRelicId: 'escama_leviatan_coral',
      boss: { name: 'Coloso Crustáceo Charybdis', hp: 10600, dmg: 156, speed: 110, color: '#0097a7', drops: { lingote_coral: 6, placa_coral: 3, perla_turquesa: 4, fragmentos_antiguos: 5, llave_jefe: 1 }, coins: 610, xp: 3400 },
      enemyTypes: ['enemy_coral_crab', 'enemy_coral_cobra', 'golem', 'frost_jelly']
    },
    coral_trono: {
      id: 'coral_trono', themeKey: 'archipielago_coral', chestTheme: 'frost',
      name: 'Trono de la Emperatriz Leviatán',
      floorColor: '#0a2634', wallColor: '#175e78', accentColor: '#18ffff',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_dragon',
      bossRelicId: 'corona_emperatriz_mar',
      boss: { name: 'Emperatriz Leviatán Coralina', hp: 11600, dmg: 165, speed: 122, color: '#18ffff', drops: { placa_coral: 4, perla_turquesa: 5, fragmentos_antiguos: 6, llave_maestra_mazmorra: 1, pocion_coralina: 2 }, coins: 680, xp: 3800 },
      enemyTypes: ['enemy_coral_crab', 'enemy_coral_cobra', 'enemy_abismo_wisp', 'ghastly_eye']
    },

    // ── ZONA III: CAVERNAS CRISTALINAS (5 Dungeons, Tiers 10-11) ──
    cristal_geoda: {
      id: 'cristal_geoda', themeKey: 'cavernas_cristal', chestTheme: 'frost',
      name: 'Caverna de la Geoda Viva',
      floorColor: '#251a3b', wallColor: '#664599', accentColor: '#ce93d8',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_goddess',
      bossRelicId: 'prisma_geoda_viva',
      boss: { name: 'Gólem Prismático Geodus', hp: 11800, dmg: 168, speed: 105, color: '#ce93d8', drops: { cuarzo_boreal: 14, lingote_boreal: 4, celestita_cristal: 2, fragmentos_antiguos: 5, llave_zafiro: 1 }, coins: 690, xp: 3900 },
      enemyTypes: ['enemy_cristal_eye', 'golem', 'floating_eye', 'mushroom_purple']
    },
    cristal_espejo: {
      id: 'cristal_espejo', themeKey: 'cavernas_cristal', chestTheme: 'frost',
      name: 'Galería de los Espejos Astrales',
      floorColor: '#291c42', wallColor: '#7348ab', accentColor: '#ba68c8',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_goddess',
      bossRelicId: 'espejo_cuarzo_astral',
      boss: { name: 'Ilusionista de Cuarzo Mirage', hp: 12600, dmg: 176, speed: 124, color: '#ba68c8', drops: { cuarzo_boreal: 16, lingote_boreal: 4, celestita_cristal: 3, fragmentos_antiguos: 5, llave_jefe: 1 }, coins: 740, xp: 4200 },
      enemyTypes: ['enemy_cristal_eye', 'ghost_spectral', 'wisp', 'ghastly_eye']
    },
    cristal_camara: {
      id: 'cristal_camara', themeKey: 'cavernas_cristal', chestTheme: 'frost',
      name: 'Cámara de Amatista Resonante',
      floorColor: '#24173d', wallColor: '#6a3fa3', accentColor: '#ab47bc',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_gargoyle',
      bossRelicId: 'diapason_amatista',
      boss: { name: 'Cantor de Amatista Vael', hp: 13500, dmg: 184, speed: 120, color: '#ab47bc', drops: { lingote_boreal: 5, placa_boreal: 2, celestita_cristal: 3, fragmentos_antiguos: 6, llave_zafiro: 1 }, coins: 790, xp: 4550 },
      enemyTypes: ['enemy_cristal_eye', 'enemy_abismo_wisp', 'skeleton_mage', 'golem']
    },
    cristal_nexo: {
      id: 'cristal_nexo', themeKey: 'cavernas_cristal', chestTheme: 'frost',
      name: 'Nexo Prismático Subterráneo',
      floorColor: '#21153b', wallColor: '#5c3899', accentColor: '#e040fb',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_knight',
      bossRelicId: 'lente_refraccion_pura',
      boss: { name: 'Arconte de Refracción Luxor', hp: 14400, dmg: 192, speed: 126, color: '#e040fb', drops: { lingote_boreal: 6, placa_boreal: 3, celestita_cristal: 4, fragmentos_antiguos: 6, llave_jefe: 1 }, coins: 840, xp: 4850 },
      enemyTypes: ['enemy_cristal_eye', 'enemy_glaciar_whelp', 'skel_mage_dark', 'floating_eye']
    },
    cristal_corazon: {
      id: 'cristal_corazon', themeKey: 'cavernas_cristal', chestTheme: 'frost',
      name: 'Corazón de Celestita Eterna',
      floorColor: '#1a1133', wallColor: '#6c3fb8', accentColor: '#7c4dff',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_dragon',
      bossRelicId: 'corazon_celestita_eterno',
      boss: { name: 'Serafín de Cristal Aurelion', hp: 15600, dmg: 202, speed: 128, color: '#7c4dff', drops: { placa_boreal: 4, celestita_cristal: 5, bismuto_astral: 2, fragmentos_antiguos: 7, llave_maestra_mazmorra: 1 }, coins: 900, xp: 5250 },
      enemyTypes: ['enemy_cristal_eye', 'enemy_abismo_wisp', 'enemy_glaciar_whelp', 'golem']
    },

    // ── ZONA III: SELVA ESMERALDA (5 Dungeons, Tiers 11-12) ──
    selva_raices: {
      id: 'selva_raices', themeKey: 'selva_esmeralda', chestTheme: 'gold',
      name: 'Caverna de las Raíces Ancestrales',
      floorColor: '#132b19', wallColor: '#2c6137', accentColor: '#66bb6a',
      carpetKey: 'carpetGreen', torchKey: 'torch_green', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_sphinx',
      bossRelicId: 'talisman_raices_antiguas',
      boss: { name: 'Ent Guardián Sylvanus', hp: 15200, dmg: 198, speed: 108, color: '#66bb6a', drops: { madera_ferrea: 16, lingote_selvano: 4, jade_ancestral: 2, fragmentos_antiguos: 6, llave_dorada: 1 }, coins: 860, xp: 5050 },
      enemyTypes: ['enemy_selva_plant', 'enemy_selva_spider', 'mushroom_mob', 'cobra']
    },
    selva_piramide: {
      id: 'selva_piramide', themeKey: 'selva_esmeralda', chestTheme: 'gold',
      name: 'Pirámide del Templo de Jade',
      floorColor: '#15301d', wallColor: '#2b6e44', accentColor: '#26a69a',
      carpetKey: 'carpetGreen', torchKey: 'torch_green', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_sphinx',
      bossRelicId: 'mascara_serpiente_jade',
      boss: { name: 'Sierpe Emplumada Quetzal', hp: 16200, dmg: 208, speed: 126, color: '#26a69a', drops: { madera_ferrea: 16, lingote_selvano: 5, jade_ancestral: 3, fragmentos_antiguos: 6, llave_jefe: 1 }, coins: 920, xp: 5400 },
      enemyTypes: ['enemy_selva_spider', 'enemy_selva_plant', 'cobra', 'orc']
    },
    selva_colmena: {
      id: 'selva_colmena', themeKey: 'selva_esmeralda', chestTheme: 'gold',
      name: 'Colmena Reina Esmeralda',
      floorColor: '#18331a', wallColor: '#3d7a36', accentColor: '#ffca28',
      carpetKey: 'carpetGreen', torchKey: 'torch_green', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_goddess',
      bossRelicId: 'ambar_reina_esmeralda',
      boss: { name: 'Reina Avispa Vespira', hp: 17200, dmg: 218, speed: 132, color: '#ffca28', drops: { lingote_selvano: 5, placa_selvano: 2, jade_ancestral: 3, fragmentos_antiguos: 7, llave_jefe: 1 }, coins: 980, xp: 5750 },
      enemyTypes: ['enemy_selva_spider', 'enemy_pantano_shroom', 'toxic_hound', 'plague_bat']
    },
    selva_dosel: {
      id: 'selva_dosel', themeKey: 'selva_esmeralda', chestTheme: 'gold',
      name: 'Santuario del Dosel Sagrado',
      floorColor: '#112918', wallColor: '#28693e', accentColor: '#00e676',
      carpetKey: 'carpetGreen', torchKey: 'torch_green', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_knight',
      bossRelicId: 'pluma_quetzal_dorado',
      boss: { name: 'Cazador Alfa Xbalanque', hp: 18400, dmg: 226, speed: 134, color: '#00e676', drops: { lingote_selvano: 6, placa_selvano: 3, jade_ancestral: 4, fragmentos_antiguos: 7, pocion_selva: 2 }, coins: 1040, xp: 6150 },
      enemyTypes: ['enemy_selva_spider', 'enemy_selva_plant', 'dark_lancer', 'toxic_hound']
    },
    selva_corazon: {
      id: 'selva_corazon', themeKey: 'selva_esmeralda', chestTheme: 'gold',
      name: 'Corazón Vivo de la Jungla',
      floorColor: '#0d2614', wallColor: '#1e703a', accentColor: '#00c853',
      carpetKey: 'carpetGreen', torchKey: 'torch_green', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_dragon',
      bossRelicId: 'semilla_corazon_selva',
      boss: { name: 'Avatar Primordial Gaia-Viridis', hp: 19800, dmg: 236, speed: 128, color: '#00c853', drops: { placa_selvano: 4, jade_ancestral: 5, fragmentos_antiguos: 8, llave_maestra_mazmorra: 1, pocion_selva: 2 }, coins: 1120, xp: 6600 },
      enemyTypes: ['enemy_selva_plant', 'enemy_selva_spider', 'enemy_pantano_slime', 'golem']
    },

    // ── ZONA III: CALDERA DE CENIZA (5 Dungeons, Tiers 12-13) ──
    caldera_fumarola: {
      id: 'caldera_fumarola', themeKey: 'caldera_ceniza', chestTheme: 'crimson',
      name: 'Pozo de Fumarolas Oscuras',
      floorColor: '#291512', wallColor: '#692a1e', accentColor: '#ff7043',
      carpetKey: 'carpetRed', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'banner_red', statueKey: 'statue_dragon',
      bossRelicId: 'brasa_fumarola_oscura',
      boss: { name: 'Espectro de Hollín Ignis', hp: 19400, dmg: 232, speed: 122, color: '#ff7043', drops: { escoria_caldera: 16, lingote_escoria: 4, polvo_carmesi: 3, fragmentos_antiguos: 7, llave_rubi: 1 }, coins: 1100, xp: 6450 },
      enemyTypes: ['enemy_ember_bat', 'enemy_fire_slime', 'flaming_skull', 'beetle_fire']
    },
    caldera_crater: {
      id: 'caldera_crater', themeKey: 'caldera_ceniza', chestTheme: 'crimson',
      name: 'Cráter Ardiente del Basalto',
      floorColor: '#2e1612', wallColor: '#7a2f1e', accentColor: '#ff5722',
      carpetKey: 'carpetRed', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'banner_red', statueKey: 'statue_dragon',
      bossRelicId: 'escoria_crater_ardiente',
      boss: { name: 'Titán de Escoria Vulkan', hp: 20800, dmg: 244, speed: 116, color: '#ff5722', drops: { escoria_caldera: 18, lingote_escoria: 5, polvo_carmesi: 4, fragmentos_antiguos: 7, llave_jefe: 1 }, coins: 1180, xp: 6900 },
      enemyTypes: ['enemy_fire_slime', 'enemy_bomb_black', 'magma', 'fire_elem']
    },
    caldera_fundicion: {
      id: 'caldera_fundicion', themeKey: 'caldera_ceniza', chestTheme: 'crimson',
      name: 'Fundición Eterna de Basalto',
      floorColor: '#331712', wallColor: '#85311c', accentColor: '#d84315',
      carpetKey: 'carpetRed', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'pyr_banner_red', statueKey: 'statue_knight',
      bossRelicId: 'yunque_basalto_rojo',
      boss: { name: 'Maestro Herrero Surtur', hp: 22200, dmg: 256, speed: 120, color: '#d84315', drops: { lingote_escoria: 5, placa_escoria: 3, polvo_carmesi: 4, fragmentos_antiguos: 8, llave_rubi: 1 }, coins: 1250, xp: 7350 },
      enemyTypes: ['enemy_bomb_black', 'enemy_biter_red', 'enemy_dragon_whelp', 'imp']
    },
    caldera_bestia: {
      id: 'caldera_bestia', themeKey: 'caldera_ceniza', chestTheme: 'crimson',
      name: 'Guarida de la Bestia de Ceniza',
      floorColor: '#2e1210', wallColor: '#8c281c', accentColor: '#ff3d00',
      carpetKey: 'carpetRed', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'banner_red', statueKey: 'statue_dragon',
      bossRelicId: 'colmillo_bestia_ceniza',
      boss: { name: 'Quimera de Magma Typhon', hp: 23800, dmg: 268, speed: 132, color: '#ff3d00', drops: { lingote_escoria: 6, placa_escoria: 3, polvo_carmesi: 5, fragmentos_antiguos: 8, llave_jefe: 1 }, coins: 1320, xp: 7800 },
      enemyTypes: ['enemy_dragon_whelp', 'enemy_bat_horned', 'enemy_ember_bat', 'crimson_jelly']
    },
    caldera_senor: {
      id: 'caldera_senor', themeKey: 'caldera_ceniza', chestTheme: 'crimson',
      name: 'Ciudadela del Señor de la Caldera',
      floorColor: '#240d0c', wallColor: '#962216', accentColor: '#ffab00',
      carpetKey: 'carpetRed', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'pyr_banner_red', statueKey: 'statue_dragon',
      bossRelicId: 'corona_senor_caldera',
      boss: { name: 'Archidemonio Ceniza Ragnaros', hp: 25500, dmg: 282, speed: 134, color: '#ffab00', drops: { placa_escoria: 4, polvo_carmesi: 6, fragmentos_antiguos: 9, llave_maestra_mazmorra: 1, materia_comprimida: 1 }, coins: 1420, xp: 8400 },
      enemyTypes: ['enemy_dragon_whelp', 'enemy_bat_horned', 'enemy_biter_red', 'magma']
    },

    // ── ZONA IV: DINASTÍA DE LA ARENA (6 Dungeons, Tiers 13-14) ──
    dinastia_tumbas: {
      id: 'dinastia_tumbas', themeKey: 'dinastia_arena', chestTheme: 'gold',
      name: 'Tumba de los Escribas Dorados',
      floorColor: '#362b1a', wallColor: '#8c6e3d', accentColor: '#ffd54f',
      carpetKey: 'carpetSandstone', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'pyr_banner_red', statueKey: 'statue_sphinx',
      bossRelicId: 'ankh_dinastia_dorada',
      boss: { name: 'Sumo Escriba Imhotep', hp: 25000, dmg: 278, speed: 122, color: '#ffd54f', drops: { pirita_solar: 18, lingote_pirita: 4, agata_roja: 2, fragmentos_antiguos: 8, llave_dorada: 1 }, coins: 1380, xp: 8200 },
      enemyTypes: ['sand_ghoul', 'cobra', 'skeleton_archer', 'royal_scarab']
    },
    dinastia_escarabajo: {
      id: 'dinastia_escarabajo', themeKey: 'dinastia_arena', chestTheme: 'gold',
      name: 'Bóveda del Escarabajo Sagrado',
      floorColor: '#3a2e1c', wallColor: '#967642', accentColor: '#42a5f5',
      carpetKey: 'carpetSandstone', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'pyr_banner_red', statueKey: 'statue_sphinx',
      bossRelicId: 'escarabajo_lapislazuli',
      boss: { name: 'Coloso Khepri Dorado', hp: 26600, dmg: 292, speed: 126, color: '#42a5f5', drops: { pirita_solar: 20, lingote_pirita: 5, agata_roja: 3, fragmentos_antiguos: 8, llave_jefe: 1 }, coins: 1460, xp: 8700 },
      enemyTypes: ['royal_scarab', 'beetle', 'enemy_coral_cobra', 'rock_golem']
    },
    dinastia_obelisco: {
      id: 'dinastia_obelisco', themeKey: 'dinastia_arena', chestTheme: 'gold',
      name: 'Obelisco de Hierro y Oro',
      floorColor: '#382a17', wallColor: '#9e7834', accentColor: '#ffb300',
      carpetKey: 'carpetSandstone', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'banner_red', statueKey: 'statue_goddess',
      bossRelicId: 'fragmento_obelisco_solar',
      boss: { name: 'Centinela del Obelisco Ra', hp: 28200, dmg: 306, speed: 128, color: '#ffb300', drops: { lingote_pirita: 5, placa_pirita: 3, agata_roja: 4, fragmentos_antiguos: 9, llave_dorada: 1 }, coins: 1540, xp: 9200 },
      enemyTypes: ['enemy_abismo_wisp', 'royal_scarab', 'skeleton_mage', 'sand_ghoul']
    },
    dinastia_camara: {
      id: 'dinastia_camara', themeKey: 'dinastia_arena', chestTheme: 'gold',
      name: 'Cámara del Tesoro Real',
      floorColor: '#3d2d16', wallColor: '#ab8032', accentColor: '#ffe082',
      carpetKey: 'carpetSandstone', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'pyr_banner_red', statueKey: 'statue_sphinx',
      bossRelicId: 'balanza_juicio_eterno',
      boss: { name: 'Juez de Almas Anubis', hp: 29800, dmg: 320, speed: 132, color: '#ffe082', drops: { lingote_pirita: 6, placa_pirita: 3, agata_roja: 4, fragmentos_antiguos: 9, elixir_solar_real: 2 }, coins: 1620, xp: 9700 },
      enemyTypes: ['dark_lancer', 'royal_scarab', 'enemy_necro_skull', 'rock_golem']
    },
    dinastia_sol: {
      id: 'dinastia_sol', themeKey: 'dinastia_arena', chestTheme: 'gold',
      name: 'Altar del Sol Eterno',
      floorColor: '#402c14', wallColor: '#b5842c', accentColor: '#ffca28',
      carpetKey: 'carpetSandstone', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'banner_red', statueKey: 'statue_goddess',
      bossRelicId: 'cetro_sol_cenit',
      boss: { name: 'Sumo Sacerdote Solar Horus', hp: 31400, dmg: 334, speed: 136, color: '#ffca28', drops: { placa_pirita: 4, agata_roja: 5, fragmentos_antiguos: 10, llave_jefe: 1, elixir_solar_real: 2 }, coins: 1700, xp: 10200 },
      enemyTypes: ['enemy_ember_bat', 'royal_scarab', 'fire_elem', 'enemy_cristal_eye']
    },
    dinastia_faraon: {
      id: 'dinastia_faraon', themeKey: 'dinastia_arena', chestTheme: 'gold',
      name: 'Pirámide del Faraón Inmortal',
      floorColor: '#36220e', wallColor: '#bf8520', accentColor: '#ff8f00',
      carpetKey: 'carpetSandstone', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'pyr_banner_red', statueKey: 'statue_sphinx',
      bossRelicId: 'nemes_faraon_inmortal',
      boss: { name: 'Faraón Supremo Ramsés VII', hp: 33200, dmg: 348, speed: 138, color: '#ff8f00', drops: { placa_pirita: 5, agata_roja: 6, fragmentos_antiguos: 10, llave_maestra_mazmorra: 1, materia_comprimida: 1 }, coins: 1800, xp: 10800 },
      enemyTypes: ['enemy_necro_skull', 'royal_scarab', 'dark_lancer', 'enemy_dragon_whelp']
    },

    // ── ZONA IV: GLACIAR PROFUNDO (6 Dungeons, Tiers 14-15) ──
    glaciar_grieta: {
      id: 'glaciar_grieta', themeKey: 'glaciar_profundo', chestTheme: 'frost',
      name: 'Grieta Abisal del Hielo',
      floorColor: '#132436', wallColor: '#305c85', accentColor: '#81d4fa',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_knight',
      bossRelicId: 'esquirla_grieta_azul',
      boss: { name: 'Acechador Polar Fenrir', hp: 32400, dmg: 340, speed: 136, color: '#81d4fa', drops: { hielo_eterno: 6, bismuto_astral: 3, lingote_boreal: 5, fragmentos_antiguos: 9, llave_zafiro: 1 }, coins: 1740, xp: 10500 },
      enemyTypes: ['enemy_glaciar_whelp', 'shadow_wolf', 'frost_jelly', 'wolf']
    },
    glaciar_vestigios: {
      id: 'glaciar_vestigios', themeKey: 'glaciar_profundo', chestTheme: 'frost',
      name: 'Vestigios Helados del Norte',
      floorColor: '#112233', wallColor: '#366591', accentColor: '#4fc3f7',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_knight',
      bossRelicId: 'reliquia_mamut_congelado',
      boss: { name: 'Mamut Milenario Behemot', hp: 34000, dmg: 352, speed: 120, color: '#4fc3f7', drops: { hielo_eterno: 7, bismuto_astral: 3, placa_boreal: 3, fragmentos_antiguos: 9, llave_jefe: 1 }, coins: 1820, xp: 11000 },
      enemyTypes: ['enemy_glaciar_whelp', 'golem', 'cave_spider', 'slime_blue']
    },
    glaciar_ojo: {
      id: 'glaciar_ojo', themeKey: 'glaciar_profundo', chestTheme: 'frost',
      name: 'Ojo del Ventisquero Perpetuo',
      floorColor: '#0e1f33', wallColor: '#2d5c8a', accentColor: '#29b6f6',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_goddess',
      bossRelicId: 'ojo_tormenta_polar',
      boss: { name: 'Heraldo de la Ventisca Boreas', hp: 35600, dmg: 364, speed: 138, color: '#29b6f6', drops: { hielo_eterno: 8, bismuto_astral: 4, placa_boreal: 4, fragmentos_antiguos: 10, llave_zafiro: 1 }, coins: 1900, xp: 11500 },
      enemyTypes: ['enemy_cristal_eye', 'ghastly_eye', 'enemy_glaciar_whelp', 'skel_mage_dark']
    },
    glaciar_coloso: {
      id: 'glaciar_coloso', themeKey: 'glaciar_profundo', chestTheme: 'frost',
      name: 'Sala del Coloso Glacial',
      floorColor: '#0c1c2e', wallColor: '#275380', accentColor: '#039be5',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_knight',
      bossRelicId: 'runa_coloso_escarcha',
      boss: { name: 'Titán de Permafrost Ymir', hp: 37200, dmg: 376, speed: 122, color: '#039be5', drops: { hielo_eterno: 9, bismuto_astral: 4, lingote_celestial: 4, fragmentos_antiguos: 10, llave_jefe: 1 }, coins: 1980, xp: 12000 },
      enemyTypes: ['enemy_glaciar_whelp', 'golem', 'dark_lancer', 'frost_jelly']
    },
    glaciar_sancta: {
      id: 'glaciar_sancta', themeKey: 'glaciar_profundo', chestTheme: 'frost',
      name: 'Sancta del Cero Absoluto',
      floorColor: '#0a192b', wallColor: '#214d7a', accentColor: '#80d8ff',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_goddess',
      bossRelicId: 'caliz_hielo_inmaculado',
      boss: { name: 'Sacerdotisa Glacial Freya', hp: 38800, dmg: 388, speed: 140, color: '#80d8ff', drops: { hielo_eterno: 10, bismuto_astral: 5, fragmentos_antiguos: 11, elixir_escarcha: 3, llave_jefe: 1 }, coins: 2060, xp: 12500 },
      enemyTypes: ['enemy_cristal_eye', 'enemy_glaciar_whelp', 'skeleton_mage', 'wisp']
    },
    glaciar_abismo: {
      id: 'glaciar_abismo', themeKey: 'glaciar_profundo', chestTheme: 'frost',
      name: 'Trono del Hielo Eterno',
      floorColor: '#071424', wallColor: '#1b4775', accentColor: '#00b0ff',
      carpetKey: 'carpetBlue', torchKey: 'torch_blue', brazierKey: 'brazier_blue', bannerKey: 'banner_blue', statueKey: 'statue_dragon',
      bossRelicId: 'corazon_cero_absoluto',
      boss: { name: 'Emperador Cero Absoluto Glacies', hp: 40600, dmg: 400, speed: 142, color: '#00b0ff', drops: { hielo_eterno: 12, bismuto_astral: 6, fragmentos_antiguos: 12, llave_maestra_mazmorra: 1, materia_comprimida: 1 }, coins: 2150, xp: 13100 },
      enemyTypes: ['enemy_glaciar_whelp', 'enemy_cristal_eye', 'dark_lancer', 'frost_jelly']
    },

    // ── ZONA IV: CIÉNAGA PÚTRIDA (6 Dungeons, Tiers 14-15) ──
    pantano_raices: {
      id: 'pantano_raices', themeKey: 'cienaga_putrida', chestTheme: 'gold',
      name: 'Raíces del Manglar Maldito',
      floorColor: '#182414', wallColor: '#3e542e', accentColor: '#9ccc65',
      carpetKey: 'carpetGreen', torchKey: 'torch_green', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_gargoyle',
      bossRelicId: 'fetiche_manglar_negro',
      boss: { name: 'Chamán Putrefacto Vex', hp: 34800, dmg: 356, speed: 128, color: '#9ccc65', drops: { resina_toxica: 14, flor_pantano: 8, polvo_veneno: 4, fragmentos_antiguos: 9, llave_dorada: 1 }, coins: 1850, xp: 11200 },
      enemyTypes: ['enemy_pantano_slime', 'enemy_pantano_shroom', 'slime_toxic', 'toxic_hound']
    },
    pantano_esporas: {
      id: 'pantano_esporas', themeKey: 'cienaga_putrida', chestTheme: 'gold',
      name: 'Gruta de las Esporas Tóxicas',
      floorColor: '#1b2914', wallColor: '#445e2b', accentColor: '#aeea00',
      carpetKey: 'carpetGreen', torchKey: 'torch_green', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_gargoyle',
      bossRelicId: 'hongo_bioluminiscente',
      boss: { name: 'Soberano Fúngico Mycelion', hp: 36400, dmg: 368, speed: 124, color: '#aeea00', drops: { resina_toxica: 15, flor_pantano: 9, polvo_veneno: 5, fragmentos_antiguos: 10, pocion_veneno_res: 2 }, coins: 1930, xp: 11700 },
      enemyTypes: ['enemy_pantano_shroom', 'mushroom_purple', 'mushroom_mob', 'plague_bat']
    },
    pantano_cieno: {
      id: 'pantano_cieno', themeKey: 'cienaga_putrida', chestTheme: 'gold',
      name: 'Lago del Cieno Alquímico',
      floorColor: '#162612', wallColor: '#3b5727', accentColor: '#76ff03',
      carpetKey: 'carpetGreen', torchKey: 'torch_green', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_goddess',
      bossRelicId: 'matraz_cieno_alquimico',
      boss: { name: 'Amalgama Viscosa Oozath', hp: 38000, dmg: 380, speed: 122, color: '#76ff03', drops: { resina_toxica: 16, polvo_veneno: 6, fragmentos_antiguos: 10, llave_jefe: 1 }, coins: 2020, xp: 12200 },
      enemyTypes: ['enemy_pantano_slime', 'slime_toxic', 'enemy_selva_spider', 'toxic_hound']
    },
    pantano_calabaza: {
      id: 'pantano_calabaza', themeKey: 'cienaga_putrida', chestTheme: 'gold',
      name: 'Pantano de las Calabazas Sombrías',
      floorColor: '#1f2412', wallColor: '#544a22', accentColor: '#ff9100',
      carpetKey: 'carpetGreen', torchKey: 'torch_orange', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_gargoyle',
      bossRelicId: 'linterna_cosecha_maldita',
      boss: { name: 'Segador Calabaza Samhain', hp: 39600, dmg: 392, speed: 136, color: '#ff9100', drops: { flor_pantano: 10, polvo_veneno: 6, fragmentos_antiguos: 11, pocion_veneno_res: 2, llave_jefe: 1 }, coins: 2100, xp: 12800 },
      enemyTypes: ['enemy_pantano_shroom', 'enemy_dark_bat', 'ghost_spectral', 'plague_bat']
    },
    pantano_bastion: {
      id: 'pantano_bastion', themeKey: 'cienaga_putrida', chestTheme: 'gold',
      name: 'Bastión de la Hidra Pantanosa',
      floorColor: '#132410', wallColor: '#355422', accentColor: '#64dd17',
      carpetKey: 'carpetGreen', torchKey: 'torch_green', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_dragon',
      bossRelicId: 'totem_hidra_cienaga',
      boss: { name: 'Hidra Venenosa Lernae', hp: 41200, dmg: 404, speed: 132, color: '#64dd17', drops: { resina_toxica: 18, polvo_veneno: 8, fragmentos_antiguos: 11, llave_jefe: 1 }, coins: 2190, xp: 13400 },
      enemyTypes: ['enemy_pantano_slime', 'enemy_selva_plant', 'enemy_pantano_shroom', 'cobra']
    },
    pantano_madre: {
      id: 'pantano_madre', themeKey: 'cienaga_putrida', chestTheme: 'gold',
      name: 'Nido de la Madre Pútrida',
      floorColor: '#101f0d', wallColor: '#2e4d1e', accentColor: '#aed581',
      carpetKey: 'carpetGreen', torchKey: 'torch_green', brazierKey: 'brazier_green', bannerKey: 'banner_green', statueKey: 'statue_dragon',
      bossRelicId: 'ovulo_madre_putrida',
      boss: { name: 'Madre Pútrida Morbida', hp: 43000, dmg: 416, speed: 130, color: '#aed581', drops: { resina_toxica: 20, polvo_veneno: 10, fragmentos_antiguos: 12, llave_maestra_mazmorra: 1, materia_comprimida: 1 }, coins: 2280, xp: 14000 },
      enemyTypes: ['enemy_pantano_slime', 'enemy_pantano_shroom', 'enemy_selva_spider', 'slime_toxic']
    },

    // ── ZONA IV: NECRÓPOLIS ÓSEA (6 Dungeons, Tiers 15-16) ──
    necro_osario: {
      id: 'necro_osario', themeKey: 'necropolis_osea', chestTheme: 'crimson',
      name: 'Osario de Marfil Maldito',
      floorColor: '#1f1c24', wallColor: '#544e5e', accentColor: '#e0e0e0',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_gargoyle',
      bossRelicId: 'osario_marfil_maldito',
      boss: { name: 'Centurión Óseo Moros', hp: 41000, dmg: 398, speed: 132, color: '#e0e0e0', drops: { hueso_fosil: 16, lingote_hueso: 5, marmol_oscuro: 8, fragmentos_antiguos: 11, llave_esqueleto: 1 }, coins: 2180, xp: 13300 },
      enemyTypes: ['enemy_necro_skull', 'skeleton', 'skeleton_archer', 'grave_revenant']
    },
    necro_cripta: {
      id: 'necro_cripta', themeKey: 'necropolis_osea', chestTheme: 'crimson',
      name: 'Cripta de los Caídos Eternos',
      floorColor: '#1c1921', wallColor: '#4c4657', accentColor: '#b0bec5',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_knight',
      bossRelicId: 'sello_cripta_silenciosa',
      boss: { name: 'Caballero Muerto Thanatos', hp: 42800, dmg: 410, speed: 136, color: '#b0bec5', drops: { hueso_fosil: 18, lingote_hueso: 6, marmol_oscuro: 10, fragmentos_antiguos: 11, llave_jefe: 1 }, coins: 2260, xp: 13900 },
      enemyTypes: ['enemy_necro_skull', 'dark_lancer', 'skeleton_mage', 'enemy_dark_bat']
    },
    necro_catacumba: {
      id: 'necro_catacumba', themeKey: 'necropolis_osea', chestTheme: 'crimson',
      name: 'Catacumbas del Lamento Oscuro',
      floorColor: '#1a1721', wallColor: '#484154', accentColor: '#80cbc4',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_gargoyle',
      bossRelicId: 'farol_almas_errantes',
      boss: { name: 'Banshee Suprema Ereshkigal', hp: 44600, dmg: 422, speed: 142, color: '#80cbc4', drops: { lingote_hueso: 6, marmol_oscuro: 12, fragmentos_antiguos: 12, llave_esqueleto: 1 }, coins: 2340, xp: 14500 },
      enemyTypes: ['enemy_necro_skull', 'ghost_spectral', 'grave_revenant', 'wisp']
    },
    necro_foso: {
      id: 'necro_foso', themeKey: 'necropolis_osea', chestTheme: 'crimson',
      name: 'Foso de los Sacrificios Óseos',
      floorColor: '#18141f', wallColor: '#4a3d59', accentColor: '#cfd8dc',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_dragon',
      bossRelicId: 'costilla_dragon_oseo',
      boss: { name: 'Dracoliche Ancestral Sindragos', hp: 46500, dmg: 435, speed: 138, color: '#cfd8dc', drops: { hueso_fosil: 20, lingote_hueso: 7, marmol_oscuro: 12, fragmentos_antiguos: 12, llave_jefe: 1 }, coins: 2420, xp: 15100 },
      enemyTypes: ['enemy_necro_skull', 'enemy_glaciar_whelp', 'skel_mage_dark', 'dark_lancer']
    },
    necro_torre: {
      id: 'necro_torre', themeKey: 'necropolis_osea', chestTheme: 'crimson',
      name: 'Torre del Archiliche Soberano',
      floorColor: '#17121f', wallColor: '#4d3766', accentColor: '#b388ff',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_goddess',
      bossRelicId: 'filacteria_archiliche',
      boss: { name: 'Archiliche Nagash', hp: 48400, dmg: 448, speed: 140, color: '#b388ff', drops: { lingote_hueso: 8, plata_maldita: 6, fragmentos_antiguos: 13, elixir_eclipse: 2, llave_jefe: 1 }, coins: 2520, xp: 15800 },
      enemyTypes: ['enemy_necro_skull', 'enemy_abismo_wisp', 'skel_mage_dark', 'ghost']
    },
    necro_trono: {
      id: 'necro_trono', themeKey: 'necropolis_osea', chestTheme: 'crimson',
      name: 'Trono de los Mil Huesos',
      floorColor: '#120e1a', wallColor: '#52346e', accentColor: '#ffd180',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_knight',
      bossRelicId: 'corona_soverano_huesos',
      boss: { name: 'Soberano de los Huesos Kel-Thuz', hp: 50500, dmg: 462, speed: 144, color: '#ffd180', drops: { lingote_hueso: 10, plata_maldita: 8, fragmentos_antiguos: 14, llave_maestra_mazmorra: 1, materia_comprimida: 2 }, coins: 2650, xp: 16600 },
      enemyTypes: ['enemy_necro_skull', 'dark_lancer', 'enemy_abismo_wisp', 'skeleton_mage']
    },

    // ── ZONA IV: TIERRAS MALDITAS (5 Dungeons + Eclipse Carmesí Final) ──
    maldita_sangre: {
      id: 'maldita_sangre', themeKey: 'tierras_malditas', chestTheme: 'crimson',
      name: 'Sagrario de la Sangre Eterna',
      floorColor: '#240b11', wallColor: '#73162a', accentColor: '#e53935',
      carpetKey: 'carpetRed', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'pyr_banner_red', statueKey: 'statue_dragon',
      bossRelicId: 'caliz_sangre_maldita',
      boss: { name: 'Conde Carmesí Drakul', hp: 49500, dmg: 455, speed: 146, color: '#e53935', drops: { plata_maldita: 12, lingote_maldito: 5, cristal_carmesi: 3, fragmentos_antiguos: 13, llave_rubi: 1 }, coins: 2600, xp: 16200 },
      enemyTypes: ['enemy_biter_red', 'enemy_dark_bat', 'vampire_bat', 'crimson_jelly']
    },
    maldita_carne: {
      id: 'maldita_carne', themeKey: 'tierras_malditas', chestTheme: 'crimson',
      name: 'Cámara de la Abominación',
      floorColor: '#260b14', wallColor: '#7a1733', accentColor: '#d81b60',
      carpetKey: 'carpetRed', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'pyr_banner_red', statueKey: 'statue_gargoyle',
      bossRelicId: 'corazon_abominacion_carnica',
      boss: { name: 'Carnicero Abisal Goremaw', hp: 51800, dmg: 470, speed: 132, color: '#d81b60', drops: { plata_maldita: 14, lingote_maldito: 6, cristal_carmesi: 4, fragmentos_antiguos: 14, llave_jefe: 1 }, coins: 2720, xp: 17000 },
      enemyTypes: ['enemy_biter_red', 'enemy_abismo_goblin', 'enemy_bomb_black', 'dark_lancer']
    },
    maldita_forja: {
      id: 'maldita_forja', themeKey: 'tierras_malditas', chestTheme: 'crimson',
      name: 'Forja de las Almas Condenadas',
      floorColor: '#240c0b', wallColor: '#821c14', accentColor: '#ff6d00',
      carpetKey: 'carpetRed', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'banner_red', statueKey: 'statue_dragon',
      bossRelicId: 'crisol_almas_condenadas',
      boss: { name: 'Herrero Demoníaco Hephaest-Abys', hp: 54200, dmg: 486, speed: 138, color: '#ff6d00', drops: { lingote_maldito: 7, placa_maldito: 3, cristal_carmesi: 5, fragmentos_antiguos: 15, llave_rubi: 1 }, coins: 2860, xp: 17900 },
      enemyTypes: ['enemy_bat_horned', 'enemy_bomb_black', 'enemy_dragon_whelp', 'magma']
    },
    maldita_calabaza: {
      id: 'maldita_calabaza', themeKey: 'tierras_malditas', chestTheme: 'crimson',
      name: 'Santuario del Rey de la Cosecha',
      floorColor: '#210b14', wallColor: '#70183a', accentColor: '#ffab00',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_gargoyle',
      bossRelicId: 'efigie_rey_cosecha',
      boss: { name: 'Espectro Espantapájaros Dullahan', hp: 56800, dmg: 502, speed: 148, color: '#ffab00', drops: { placa_maldito: 4, cristal_carmesi: 5, fragmentos_antiguos: 16, elixir_eclipse: 3, llave_jefe: 1 }, coins: 3000, xp: 18800 },
      enemyTypes: ['enemy_abismo_goblin', 'enemy_abismo_wisp', 'enemy_dark_bat', 'ghost_spectral']
    },
    maldita_abismo: {
      id: 'maldita_abismo', themeKey: 'tierras_malditas', chestTheme: 'crimson',
      name: 'Portón del Abismo Primordial',
      floorColor: '#1c0814', wallColor: '#69123c', accentColor: '#aa00ff',
      carpetKey: 'carpetPurple', torchKey: 'torch_purple', brazierKey: 'brazier_purple', bannerKey: 'banner_purple', statueKey: 'statue_dragon',
      bossRelicId: 'ojo_abismo_singularity',
      boss: { name: 'Vigilante del Vacío Azathoth', hp: 59800, dmg: 520, speed: 148, color: '#aa00ff', drops: { placa_maldito: 5, cristal_carmesi: 6, fragmentos_antiguos: 18, materia_comprimida: 2, llave_maestra_mazmorra: 1 }, coins: 3200, xp: 20000 },
      enemyTypes: ['enemy_abismo_wisp', 'enemy_abismo_goblin', 'enemy_bat_horned', 'enemy_biter_red']
    },
    eclipse_carmesi: {
      id: 'eclipse_carmesi', isFinal: true, themeKey: 'tierras_malditas', chestTheme: 'crimson',
      name: 'Eclipse del Espadachín Carmesí',
      floorColor: '#140409', wallColor: '#8f0a22', accentColor: '#ff1744',
      carpetKey: 'carpetRed', torchKey: 'torch_orange', brazierKey: 'brazier_orange', bannerKey: 'pyr_banner_red', statueKey: 'statue_dragon',
      bossRelicId: 'corazon_eclipse_carmesi',
      boss: {
        name: 'Espadachín Carmesí Abisal',
        hp: 72000, dmg: 580, speed: 158, color: '#ff1744',
        drops: { cristal_carmesi: 10, placa_maldito: 8, fragmentos_antiguos: 24, materia_comprimida: 3, singularidad: 1, llave_maestra_mazmorra: 2, espada_eclipse: 1 },
        coins: 4500, xp: 32000
      },
      enemyTypes: ['enemy_biter_red', 'enemy_bat_horned', 'enemy_abismo_wisp', 'enemy_abismo_goblin']
    }
  };

  // Fixed multi-wing labyrinth blueprint: 75x39 tiles (75 unique dungeons across all 14 biomes & 7 architectural layouts)
  const DUNGEON_TIER_LIST = [
    // Zona I & II (25)
    'pradera', 'pradera_profunda', 'pradera_madriguera', 'pradera_baston', 'pradera_bosquecillo',
    'desierto', 'desierto_piramide', 'desierto_oasis', 'desierto_catacumbas', 'desierto_solario',
    'montanas_heladas', 'montanas_glaciar', 'montanas_mina', 'montanas_fortaleza', 'montanas_cumbre',
    'bosque_oscuro', 'bosque_necro', 'bosque_laboratorio', 'bosque_arana', 'bosque_pantano',
    'tierras_volcanicas', 'volcan_abismo', 'volcan_fragua', 'volcan_caldera', 'volcan_trono_ceniza',
    // Zona III (20)
    'coral_arrecife', 'coral_perla', 'coral_abismo', 'coral_bastion', 'coral_trono',
    'cristal_geoda', 'cristal_espejo', 'cristal_camara', 'cristal_nexo', 'cristal_corazon',
    'selva_raices', 'selva_piramide', 'selva_colmena', 'selva_dosel', 'selva_corazon',
    'caldera_fumarola', 'caldera_crater', 'caldera_fundicion', 'caldera_bestia', 'caldera_senor',
    // Zona IV (30)
    'dinastia_tumbas', 'dinastia_escarabajo', 'dinastia_obelisco', 'dinastia_camara', 'dinastia_sol', 'dinastia_faraon',
    'glaciar_grieta', 'glaciar_vestigios', 'glaciar_ojo', 'glaciar_coloso', 'glaciar_sancta', 'glaciar_abismo',
    'pantano_raices', 'pantano_esporas', 'pantano_cieno', 'pantano_calabaza', 'pantano_bastion', 'pantano_madre',
    'necro_osario', 'necro_cripta', 'necro_catacumba', 'necro_foso', 'necro_torre', 'necro_trono',
    'maldita_sangre', 'maldita_carne', 'maldita_forja', 'maldita_calabaza', 'maldita_abismo', 'eclipse_carmesi'
  ];

  const LATE_BIOME_DUNGEONS = new Set([
    'bosque_oscuro', 'bosque_necro', 'bosque_laboratorio', 'bosque_arana', 'bosque_pantano',
    'montanas_heladas', 'montanas_glaciar', 'montanas_mina', 'montanas_fortaleza', 'montanas_cumbre',
    'tierras_volcanicas', 'volcan_abismo', 'volcan_fragua', 'volcan_caldera', 'volcan_trono_ceniza',
    'coral_arrecife', 'coral_perla', 'coral_abismo', 'coral_bastion', 'coral_trono',
    'cristal_geoda', 'cristal_espejo', 'cristal_camara', 'cristal_nexo', 'cristal_corazon',
    'selva_raices', 'selva_piramide', 'selva_colmena', 'selva_dosel', 'selva_corazon',
    'caldera_fumarola', 'caldera_crater', 'caldera_fundicion', 'caldera_bestia', 'caldera_senor',
    'dinastia_tumbas', 'dinastia_escarabajo', 'dinastia_obelisco', 'dinastia_camara', 'dinastia_sol', 'dinastia_faraon',
    'glaciar_grieta', 'glaciar_vestigios', 'glaciar_ojo', 'glaciar_coloso', 'glaciar_sancta', 'glaciar_abismo',
    'pantano_raices', 'pantano_esporas', 'pantano_cieno', 'pantano_calabaza', 'pantano_bastion', 'pantano_madre',
    'necro_osario', 'necro_cripta', 'necro_catacumba', 'necro_foso', 'necro_torre', 'necro_trono',
    'maldita_sangre', 'maldita_carne', 'maldita_forja', 'maldita_calabaza', 'maldita_abismo', 'eclipse_carmesi'
  ]);

  // Unique attack movesets for each of the 24 dungeon bosses (expanded to 5 signature attacks for late biomes 3, 4, 5)
  const BOSS_SIGNATURE_MOVES = {
    pradera: {
      modes1: ['slime_colossal_bounce', 'slime_toxic_geyser', 'slime_acid_mitosis'],
      modes2: ['slime_acid_mitosis', 'slime_colossal_bounce', 'slime_toxic_geyser'],
      modes3: ['slime_acid_mitosis', 'slime_colossal_bounce', 'slime_toxic_geyser']
    },
    pradera_profunda: {
      modes1: ['warlord_blade_whirl', 'goblin_dynamite_barrage', 'war_cry_earth_shatter'],
      modes2: ['goblin_dynamite_barrage', 'warlord_blade_whirl', 'war_cry_earth_shatter'],
      modes3: ['war_cry_earth_shatter', 'goblin_dynamite_barrage', 'warlord_blade_whirl']
    },
    desierto: {
      modes1: ['venom_stinger_triple', 'quicksand_sinkhole', 'sand_burrow_eruption'],
      modes2: ['quicksand_sinkhole', 'sand_burrow_eruption', 'venom_stinger_triple'],
      modes3: ['sand_burrow_eruption', 'quicksand_sinkhole', 'venom_stinger_triple']
    },
    desierto_piramide: {
      modes1: ['solar_lance_beam', 'sun_disc_ricochet', 'radiant_judgment_grid'],
      modes2: ['sun_disc_ricochet', 'radiant_judgment_grid', 'solar_lance_beam'],
      modes3: ['radiant_judgment_grid', 'solar_lance_beam', 'sun_disc_ricochet']
    },
    bosque_oscuro: {
      modes1: ['abyssal_singularity', 'void_tendril_grasp', 'entropy_skull_spiral', 'cosmic_black_hole', 'nether_chain_snare'],
      modes2: ['entropy_skull_spiral', 'cosmic_black_hole', 'abyssal_singularity', 'nether_chain_snare', 'void_tendril_grasp'],
      modes3: ['cosmic_black_hole', 'abyssal_singularity', 'nether_chain_snare', 'entropy_skull_spiral', 'void_tendril_grasp']
    },
    bosque_necro: {
      modes1: ['death_scythe_reap', 'bone_cage_prison', 'soul_siphon_vortex', 'catacomb_legion_sweep', 'grave_rot_miasma'],
      modes2: ['bone_cage_prison', 'catacomb_legion_sweep', 'death_scythe_reap', 'grave_rot_miasma', 'soul_siphon_vortex'],
      modes3: ['soul_siphon_vortex', 'grave_rot_miasma', 'bone_cage_prison', 'catacomb_legion_sweep', 'death_scythe_reap']
    },
    montanas_heladas: {
      modes1: ['ice_shard_gatling', 'glacial_avalanche', 'permafrost_shatter', 'blizzard_cryo_quake', 'frozen_monolith_drop'],
      modes2: ['glacial_avalanche', 'blizzard_cryo_quake', 'permafrost_shatter', 'frozen_monolith_drop', 'ice_shard_gatling'],
      modes3: ['frozen_monolith_drop', 'permafrost_shatter', 'glacial_avalanche', 'blizzard_cryo_quake', 'ice_shard_gatling']
    },
    montanas_glaciar: {
      modes1: ['boreal_needle_supernova', 'cryo_teleport_frostbite', 'absolute_zero_comet', 'arctic_mirror_delusion', 'glacial_orb_orbit'],
      modes2: ['cryo_teleport_frostbite', 'arctic_mirror_delusion', 'absolute_zero_comet', 'glacial_orb_orbit', 'boreal_needle_supernova'],
      modes3: ['absolute_zero_comet', 'glacial_orb_orbit', 'boreal_needle_supernova', 'arctic_mirror_delusion', 'cryo_teleport_frostbite']
    },
    tierras_volcanicas: {
      modes1: ['hellfire_wing_gust', 'dragon_magma_breath', 'inferno_meteor_cataclysm', 'draconic_roaring_supernova', 'volcanic_earth_rift'],
      modes2: ['dragon_magma_breath', 'draconic_roaring_supernova', 'inferno_meteor_cataclysm', 'volcanic_earth_rift', 'hellfire_wing_gust'],
      modes3: ['inferno_meteor_cataclysm', 'volcanic_earth_rift', 'draconic_roaring_supernova', 'dragon_magma_breath', 'hellfire_wing_gust']
    },
    volcan_abismo: {
      modes1: ['chains_of_damnation', 'calamity_fissure_cross', 'pyroclastic_eruption', 'abyssal_hellfire_vortex', 'apocalyptic_meteor_storm'],
      modes2: ['calamity_fissure_cross', 'abyssal_hellfire_vortex', 'pyroclastic_eruption', 'apocalyptic_meteor_storm', 'chains_of_damnation'],
      modes3: ['pyroclastic_eruption', 'apocalyptic_meteor_storm', 'calamity_fissure_cross', 'abyssal_hellfire_vortex', 'chains_of_damnation']
    },
    pradera_madriguera: {
      modes1: ['buckshot_scatter', 'trapper_minefield', 'dynamite_lob'],
      modes2: ['trapper_minefield', 'dynamite_lob', 'buckshot_scatter'],
      modes3: ['dynamite_lob', 'trapper_minefield', 'buckshot_scatter']
    },
    pradera_baston: {
      modes1: ['iron_flail_cleave', 'berserker_tusk_rush', 'ground_tremor_stomp'],
      modes2: ['berserker_tusk_rush', 'ground_tremor_stomp', 'iron_flail_cleave'],
      modes3: ['ground_tremor_stomp', 'berserker_tusk_rush', 'iron_flail_cleave']
    },
    pradera_bosquecillo: {
      modes1: ['nature_wrath_bolt', 'bramble_root_surge', 'ancient_spore_nova'],
      modes2: ['bramble_root_surge', 'ancient_spore_nova', 'nature_wrath_bolt'],
      modes3: ['ancient_spore_nova', 'bramble_root_surge', 'nature_wrath_bolt']
    },
    desierto_oasis: {
      modes1: ['tail_whip_sandstorm', 'cobra_venom_spray', 'constrictor_lunge'],
      modes2: ['cobra_venom_spray', 'constrictor_lunge', 'tail_whip_sandstorm'],
      modes3: ['constrictor_lunge', 'cobra_venom_spray', 'tail_whip_sandstorm']
    },
    desierto_catacumbas: {
      modes1: ['anubis_hex_bolt', 'cursed_hieroglyph_seal', 'papyrus_swarm'],
      modes2: ['cursed_hieroglyph_seal', 'papyrus_swarm', 'anubis_hex_bolt'],
      modes3: ['papyrus_swarm', 'cursed_hieroglyph_seal', 'anubis_hex_bolt']
    },
    desierto_solario: {
      modes1: ['golden_dawn_barrage', 'prism_solar_flare', 'sun_chariot_charge'],
      modes2: ['prism_solar_flare', 'sun_chariot_charge', 'golden_dawn_barrage'],
      modes3: ['sun_chariot_charge', 'prism_solar_flare', 'golden_dawn_barrage']
    },
    bosque_laboratorio: {
      modes1: ['steam_vent_purge', 'volatile_flask_toss', 'overclock_laser_sweep', 'tesla_chain_discharge', 'chemical_napalm_carpet'],
      modes2: ['volatile_flask_toss', 'tesla_chain_discharge', 'overclock_laser_sweep', 'chemical_napalm_carpet', 'steam_vent_purge'],
      modes3: ['overclock_laser_sweep', 'chemical_napalm_carpet', 'volatile_flask_toss', 'tesla_chain_discharge', 'steam_vent_purge']
    },
    bosque_arana: {
      modes1: ['venomous_mandible_strike', 'silk_web_ensnare', 'broodmother_needle_burst', 'arachnid_pounce_ambush', 'toxic_silk_cocoon'],
      modes2: ['silk_web_ensnare', 'arachnid_pounce_ambush', 'broodmother_needle_burst', 'toxic_silk_cocoon', 'venomous_mandible_strike'],
      modes3: ['broodmother_needle_burst', 'toxic_silk_cocoon', 'silk_web_ensnare', 'arachnid_pounce_ambush', 'venomous_mandible_strike']
    },
    bosque_pantano: {
      modes1: ['furious_swamp_thrash', 'triple_acid_stream', 'swamp_mire_surge', 'hydra_regrowth_breath', 'noxious_bog_geysers'],
      modes2: ['triple_acid_stream', 'hydra_regrowth_breath', 'swamp_mire_surge', 'noxious_bog_geysers', 'furious_swamp_thrash'],
      modes3: ['swamp_mire_surge', 'noxious_bog_geysers', 'triple_acid_stream', 'hydra_regrowth_breath', 'furious_swamp_thrash']
    },
    montanas_mina: {
      modes1: ['gem_laser_refraction', 'diamond_shard_shatter', 'crystal_spire_eruption', 'hyper_prism_cannon', 'diamond_core_overload'],
      modes2: ['diamond_shard_shatter', 'hyper_prism_cannon', 'crystal_spire_eruption', 'diamond_core_overload', 'gem_laser_refraction'],
      modes3: ['crystal_spire_eruption', 'diamond_core_overload', 'diamond_shard_shatter', 'hyper_prism_cannon', 'gem_laser_refraction']
    },
    montanas_fortaleza: {
      modes1: ['thunder_shield_slam', 'valkyrie_storm_javelin', 'ride_of_the_valkyrie', 'valhalla_sky_strike', 'vanguard_spear_whirlwind'],
      modes2: ['valkyrie_storm_javelin', 'valhalla_sky_strike', 'ride_of_the_valkyrie', 'vanguard_spear_whirlwind', 'thunder_shield_slam'],
      modes3: ['ride_of_the_valkyrie', 'vanguard_spear_whirlwind', 'valkyrie_storm_javelin', 'valhalla_sky_strike', 'thunder_shield_slam']
    },
    volcan_fragua: {
      modes1: ['bellows_flame_burst', 'titanic_anvil_strike', 'molten_slag_shower', 'forge_master_molten_hammer', 'liquid_metal_tsunami'],
      modes2: ['titanic_anvil_strike', 'forge_master_molten_hammer', 'molten_slag_shower', 'liquid_metal_tsunami', 'bellows_flame_burst'],
      modes3: ['molten_slag_shower', 'liquid_metal_tsunami', 'titanic_anvil_strike', 'forge_master_molten_hammer', 'bellows_flame_burst']
    },
    volcan_caldera: {
      modes1: ['solar_feather_barrage', 'phoenix_dive_bomb', 'rebirth_flame_nova', 'phoenix_conflagration_spiral', 'sunfire_thermal_beam'],
      modes2: ['phoenix_dive_bomb', 'phoenix_conflagration_spiral', 'rebirth_flame_nova', 'sunfire_thermal_beam', 'solar_feather_barrage'],
      modes3: ['rebirth_flame_nova', 'sunfire_thermal_beam', 'phoenix_dive_bomb', 'phoenix_conflagration_spiral', 'solar_feather_barrage']
    },
    volcan_trono_ceniza: {
      modes1: ['cataclysmic_stomp', 'ashen_obliteration_ray', 'cinder_cyclone', 'ash_emperor_dominion_wave', 'cinder_execution_cleave'],
      modes2: ['ashen_obliteration_ray', 'ash_emperor_dominion_wave', 'cinder_cyclone', 'cinder_execution_cleave', 'cataclysmic_stomp'],
      modes3: ['cinder_cyclone', 'cinder_execution_cleave', 'ashen_obliteration_ray', 'ash_emperor_dominion_wave', 'cataclysmic_stomp']
    },
    // ── Beta 1.3.0: Montañas Cumbre + Zonas III & IV (50 Jefes + Espadachín Carmesí Abisal) ──
    montanas_cumbre: {
      modes1: ['glaciar_blizzard_rings', 'glaciar_ice_spire_cross', 'glaciar_permafrost_dash'],
      modes2: ['glaciar_blizzard_rings', 'glaciar_ice_spire_cross', 'glaciar_polar_shatter', 'glaciar_permafrost_dash'],
      modes3: ['glaciar_absolute_zero', 'glaciar_blizzard_rings', 'glaciar_ice_spire_cross', 'glaciar_polar_shatter', 'glaciar_permafrost_dash']
    },
    coral_arrecife: {
      modes1: ['coral_tidal_surge', 'coral_pearl_barrage', 'coral_whirlpool_vortex'],
      modes2: ['coral_tidal_surge', 'coral_whirlpool_vortex', 'coral_depth_charge', 'coral_pearl_barrage'],
      modes3: ['coral_leviathan_rush', 'coral_tidal_surge', 'coral_whirlpool_vortex', 'coral_depth_charge', 'coral_pearl_barrage']
    },
    coral_perla: {
      modes1: ['coral_pearl_barrage', 'coral_whirlpool_vortex', 'coral_tidal_surge'],
      modes2: ['coral_pearl_barrage', 'coral_whirlpool_vortex', 'coral_depth_charge', 'coral_leviathan_rush'],
      modes3: ['coral_whirlpool_vortex', 'coral_pearl_barrage', 'coral_leviathan_rush', 'coral_depth_charge', 'coral_tidal_surge']
    },
    coral_abismo: {
      modes1: ['coral_depth_charge', 'coral_tidal_surge', 'coral_pearl_barrage'],
      modes2: ['coral_depth_charge', 'coral_leviathan_rush', 'coral_whirlpool_vortex', 'coral_tidal_surge'],
      modes3: ['coral_leviathan_rush', 'coral_depth_charge', 'coral_whirlpool_vortex', 'coral_pearl_barrage', 'coral_tidal_surge']
    },
    coral_bastion: {
      modes1: ['coral_leviathan_rush', 'coral_tidal_surge', 'coral_depth_charge'],
      modes2: ['coral_leviathan_rush', 'coral_whirlpool_vortex', 'coral_pearl_barrage', 'coral_depth_charge'],
      modes3: ['coral_leviathan_rush', 'coral_whirlpool_vortex', 'coral_tidal_surge', 'coral_depth_charge', 'coral_pearl_barrage']
    },
    coral_trono: {
      modes1: ['coral_whirlpool_vortex', 'coral_leviathan_rush', 'coral_depth_charge', 'coral_pearl_barrage'],
      modes2: ['coral_leviathan_rush', 'coral_tidal_surge', 'coral_whirlpool_vortex', 'coral_pearl_barrage', 'coral_depth_charge'],
      modes3: ['coral_leviathan_rush', 'coral_whirlpool_vortex', 'coral_depth_charge', 'coral_tidal_surge', 'coral_pearl_barrage']
    },
    cristal_geoda: {
      modes1: ['cristal_geode_shards', 'cristal_prism_beam', 'cristal_resonance_pulse'],
      modes2: ['cristal_geode_shards', 'cristal_mirror_nova', 'cristal_prism_beam', 'cristal_resonance_pulse'],
      modes3: ['cristal_astral_singularity', 'cristal_mirror_nova', 'cristal_prism_beam', 'cristal_geode_shards', 'cristal_resonance_pulse']
    },
    cristal_espejo: {
      modes1: ['cristal_mirror_nova', 'cristal_prism_beam', 'cristal_geode_shards'],
      modes2: ['cristal_mirror_nova', 'cristal_prism_beam', 'cristal_resonance_pulse', 'cristal_astral_singularity'],
      modes3: ['cristal_astral_singularity', 'cristal_mirror_nova', 'cristal_prism_beam', 'cristal_resonance_pulse', 'cristal_geode_shards']
    },
    cristal_camara: {
      modes1: ['cristal_resonance_pulse', 'cristal_geode_shards', 'cristal_mirror_nova'],
      modes2: ['cristal_resonance_pulse', 'cristal_prism_beam', 'cristal_mirror_nova', 'cristal_astral_singularity'],
      modes3: ['cristal_resonance_pulse', 'cristal_astral_singularity', 'cristal_mirror_nova', 'cristal_prism_beam', 'cristal_geode_shards']
    },
    cristal_nexo: {
      modes1: ['cristal_prism_beam', 'cristal_astral_singularity', 'cristal_mirror_nova'],
      modes2: ['cristal_prism_beam', 'cristal_mirror_nova', 'cristal_astral_singularity', 'cristal_resonance_pulse'],
      modes3: ['cristal_astral_singularity', 'cristal_prism_beam', 'cristal_mirror_nova', 'cristal_geode_shards', 'cristal_resonance_pulse']
    },
    cristal_corazon: {
      modes1: ['cristal_astral_singularity', 'cristal_prism_beam', 'cristal_mirror_nova', 'cristal_resonance_pulse'],
      modes2: ['cristal_astral_singularity', 'cristal_mirror_nova', 'cristal_prism_beam', 'cristal_geode_shards', 'cristal_resonance_pulse'],
      modes3: ['cristal_astral_singularity', 'cristal_prism_beam', 'cristal_resonance_pulse', 'cristal_mirror_nova', 'cristal_geode_shards']
    },
    selva_raices: {
      modes1: ['selva_root_snare', 'selva_venom_thorns', 'selva_pollen_cloud'],
      modes2: ['selva_root_snare', 'selva_jade_fissure', 'selva_venom_thorns', 'selva_canopy_dive'],
      modes3: ['selva_jade_fissure', 'selva_root_snare', 'selva_canopy_dive', 'selva_pollen_cloud', 'selva_venom_thorns']
    },
    selva_piramide: {
      modes1: ['selva_venom_thorns', 'selva_jade_fissure', 'selva_canopy_dive'],
      modes2: ['selva_venom_thorns', 'selva_canopy_dive', 'selva_jade_fissure', 'selva_pollen_cloud'],
      modes3: ['selva_canopy_dive', 'selva_jade_fissure', 'selva_venom_thorns', 'selva_root_snare', 'selva_pollen_cloud']
    },
    selva_colmena: {
      modes1: ['selva_pollen_cloud', 'selva_venom_thorns', 'selva_canopy_dive'],
      modes2: ['selva_pollen_cloud', 'selva_canopy_dive', 'selva_venom_thorns', 'selva_root_snare'],
      modes3: ['selva_pollen_cloud', 'selva_venom_thorns', 'selva_jade_fissure', 'selva_canopy_dive', 'selva_root_snare']
    },
    selva_dosel: {
      modes1: ['selva_canopy_dive', 'selva_venom_thorns', 'selva_jade_fissure'],
      modes2: ['selva_canopy_dive', 'selva_jade_fissure', 'selva_venom_thorns', 'selva_pollen_cloud'],
      modes3: ['selva_canopy_dive', 'selva_jade_fissure', 'selva_root_snare', 'selva_venom_thorns', 'selva_pollen_cloud']
    },
    selva_corazon: {
      modes1: ['selva_jade_fissure', 'selva_root_snare', 'selva_canopy_dive', 'selva_pollen_cloud'],
      modes2: ['selva_jade_fissure', 'selva_canopy_dive', 'selva_root_snare', 'selva_venom_thorns', 'selva_pollen_cloud'],
      modes3: ['selva_jade_fissure', 'selva_pollen_cloud', 'selva_canopy_dive', 'selva_root_snare', 'selva_venom_thorns']
    },
    caldera_fumarola: {
      modes1: ['caldera_smoke_ring', 'caldera_magma_eruption', 'caldera_slag_bombard'],
      modes2: ['caldera_smoke_ring', 'caldera_magma_eruption', 'caldera_molten_cleave', 'caldera_slag_bombard'],
      modes3: ['caldera_inferno_tempest', 'caldera_magma_eruption', 'caldera_smoke_ring', 'caldera_molten_cleave', 'caldera_slag_bombard']
    },
    caldera_crater: {
      modes1: ['caldera_magma_eruption', 'caldera_slag_bombard', 'caldera_molten_cleave'],
      modes2: ['caldera_magma_eruption', 'caldera_inferno_tempest', 'caldera_slag_bombard', 'caldera_smoke_ring'],
      modes3: ['caldera_inferno_tempest', 'caldera_magma_eruption', 'caldera_molten_cleave', 'caldera_slag_bombard', 'caldera_smoke_ring']
    },
    caldera_fundicion: {
      modes1: ['caldera_molten_cleave', 'caldera_slag_bombard', 'caldera_smoke_ring'],
      modes2: ['caldera_molten_cleave', 'caldera_magma_eruption', 'caldera_slag_bombard', 'caldera_inferno_tempest'],
      modes3: ['caldera_molten_cleave', 'caldera_inferno_tempest', 'caldera_magma_eruption', 'caldera_slag_bombard', 'caldera_smoke_ring']
    },
    caldera_bestia: {
      modes1: ['caldera_molten_cleave', 'caldera_inferno_tempest', 'caldera_magma_eruption'],
      modes2: ['caldera_molten_cleave', 'caldera_inferno_tempest', 'caldera_smoke_ring', 'caldera_slag_bombard'],
      modes3: ['caldera_inferno_tempest', 'caldera_molten_cleave', 'caldera_magma_eruption', 'caldera_slag_bombard', 'caldera_smoke_ring']
    },
    caldera_senor: {
      modes1: ['caldera_inferno_tempest', 'caldera_molten_cleave', 'caldera_magma_eruption', 'caldera_slag_bombard'],
      modes2: ['caldera_inferno_tempest', 'caldera_magma_eruption', 'caldera_molten_cleave', 'caldera_smoke_ring', 'caldera_slag_bombard'],
      modes3: ['caldera_inferno_tempest', 'caldera_molten_cleave', 'caldera_slag_bombard', 'caldera_magma_eruption', 'caldera_smoke_ring']
    },
    dinastia_tumbas: {
      modes1: ['dinastia_scarab_swarm', 'dinastia_sand_vortex', 'dinastia_solar_obelisk'],
      modes2: ['dinastia_scarab_swarm', 'dinastia_sand_vortex', 'dinastia_sun_disk_barrage', 'dinastia_solar_obelisk'],
      modes3: ['dinastia_pharaoh_decree', 'dinastia_sand_vortex', 'dinastia_scarab_swarm', 'dinastia_sun_disk_barrage', 'dinastia_solar_obelisk']
    },
    dinastia_escarabajo: {
      modes1: ['dinastia_scarab_swarm', 'dinastia_sun_disk_barrage', 'dinastia_sand_vortex'],
      modes2: ['dinastia_scarab_swarm', 'dinastia_pharaoh_decree', 'dinastia_sun_disk_barrage', 'dinastia_solar_obelisk'],
      modes3: ['dinastia_scarab_swarm', 'dinastia_sand_vortex', 'dinastia_pharaoh_decree', 'dinastia_sun_disk_barrage', 'dinastia_solar_obelisk']
    },
    dinastia_obelisco: {
      modes1: ['dinastia_solar_obelisk', 'dinastia_sun_disk_barrage', 'dinastia_sand_vortex'],
      modes2: ['dinastia_solar_obelisk', 'dinastia_pharaoh_decree', 'dinastia_sun_disk_barrage', 'dinastia_scarab_swarm'],
      modes3: ['dinastia_solar_obelisk', 'dinastia_pharaoh_decree', 'dinastia_sand_vortex', 'dinastia_sun_disk_barrage', 'dinastia_scarab_swarm']
    },
    dinastia_camara: {
      modes1: ['dinastia_pharaoh_decree', 'dinastia_solar_obelisk', 'dinastia_sun_disk_barrage'],
      modes2: ['dinastia_pharaoh_decree', 'dinastia_sand_vortex', 'dinastia_solar_obelisk', 'dinastia_scarab_swarm'],
      modes3: ['dinastia_pharaoh_decree', 'dinastia_sun_disk_barrage', 'dinastia_solar_obelisk', 'dinastia_sand_vortex', 'dinastia_scarab_swarm']
    },
    dinastia_sol: {
      modes1: ['dinastia_sun_disk_barrage', 'dinastia_solar_obelisk', 'dinastia_pharaoh_decree'],
      modes2: ['dinastia_sun_disk_barrage', 'dinastia_solar_obelisk', 'dinastia_sand_vortex', 'dinastia_pharaoh_decree'],
      modes3: ['dinastia_sun_disk_barrage', 'dinastia_pharaoh_decree', 'dinastia_solar_obelisk', 'dinastia_sand_vortex', 'dinastia_scarab_swarm']
    },
    dinastia_faraon: {
      modes1: ['dinastia_pharaoh_decree', 'dinastia_sun_disk_barrage', 'dinastia_solar_obelisk', 'dinastia_sand_vortex'],
      modes2: ['dinastia_pharaoh_decree', 'dinastia_solar_obelisk', 'dinastia_sun_disk_barrage', 'dinastia_scarab_swarm', 'dinastia_sand_vortex'],
      modes3: ['dinastia_pharaoh_decree', 'dinastia_sun_disk_barrage', 'dinastia_sand_vortex', 'dinastia_solar_obelisk', 'dinastia_scarab_swarm']
    },
    glaciar_grieta: {
      modes1: ['glaciar_permafrost_dash', 'glaciar_blizzard_rings', 'glaciar_ice_spire_cross'],
      modes2: ['glaciar_permafrost_dash', 'glaciar_polar_shatter', 'glaciar_blizzard_rings', 'glaciar_ice_spire_cross'],
      modes3: ['glaciar_absolute_zero', 'glaciar_permafrost_dash', 'glaciar_polar_shatter', 'glaciar_blizzard_rings', 'glaciar_ice_spire_cross']
    },
    glaciar_vestigios: {
      modes1: ['glaciar_polar_shatter', 'glaciar_ice_spire_cross', 'glaciar_permafrost_dash'],
      modes2: ['glaciar_polar_shatter', 'glaciar_absolute_zero', 'glaciar_ice_spire_cross', 'glaciar_blizzard_rings'],
      modes3: ['glaciar_absolute_zero', 'glaciar_polar_shatter', 'glaciar_permafrost_dash', 'glaciar_ice_spire_cross', 'glaciar_blizzard_rings']
    },
    glaciar_ojo: {
      modes1: ['glaciar_blizzard_rings', 'glaciar_polar_shatter', 'glaciar_absolute_zero'],
      modes2: ['glaciar_blizzard_rings', 'glaciar_absolute_zero', 'glaciar_ice_spire_cross', 'glaciar_polar_shatter'],
      modes3: ['glaciar_blizzard_rings', 'glaciar_absolute_zero', 'glaciar_polar_shatter', 'glaciar_ice_spire_cross', 'glaciar_permafrost_dash']
    },
    glaciar_coloso: {
      modes1: ['glaciar_ice_spire_cross', 'glaciar_polar_shatter', 'glaciar_permafrost_dash'],
      modes2: ['glaciar_ice_spire_cross', 'glaciar_absolute_zero', 'glaciar_polar_shatter', 'glaciar_permafrost_dash'],
      modes3: ['glaciar_absolute_zero', 'glaciar_ice_spire_cross', 'glaciar_polar_shatter', 'glaciar_blizzard_rings', 'glaciar_permafrost_dash']
    },
    glaciar_sancta: {
      modes1: ['glaciar_absolute_zero', 'glaciar_blizzard_rings', 'glaciar_polar_shatter'],
      modes2: ['glaciar_absolute_zero', 'glaciar_blizzard_rings', 'glaciar_ice_spire_cross', 'glaciar_polar_shatter'],
      modes3: ['glaciar_absolute_zero', 'glaciar_polar_shatter', 'glaciar_blizzard_rings', 'glaciar_ice_spire_cross', 'glaciar_permafrost_dash']
    },
    glaciar_abismo: {
      modes1: ['glaciar_absolute_zero', 'glaciar_ice_spire_cross', 'glaciar_polar_shatter', 'glaciar_permafrost_dash'],
      modes2: ['glaciar_absolute_zero', 'glaciar_polar_shatter', 'glaciar_blizzard_rings', 'glaciar_permafrost_dash', 'glaciar_ice_spire_cross'],
      modes3: ['glaciar_absolute_zero', 'glaciar_blizzard_rings', 'glaciar_polar_shatter', 'glaciar_ice_spire_cross', 'glaciar_permafrost_dash']
    },
    pantano_raices: {
      modes1: ['pantano_miasma_nova', 'pantano_spore_rain', 'pantano_sludge_eruption'],
      modes2: ['pantano_miasma_nova', 'pantano_spore_rain', 'pantano_hydra_snap', 'pantano_sludge_eruption'],
      modes3: ['pantano_miasma_nova', 'pantano_pumpkin_curse', 'pantano_spore_rain', 'pantano_sludge_eruption', 'pantano_hydra_snap']
    },
    pantano_esporas: {
      modes1: ['pantano_spore_rain', 'pantano_miasma_nova', 'pantano_sludge_eruption'],
      modes2: ['pantano_spore_rain', 'pantano_miasma_nova', 'pantano_pumpkin_curse', 'pantano_sludge_eruption'],
      modes3: ['pantano_spore_rain', 'pantano_miasma_nova', 'pantano_hydra_snap', 'pantano_pumpkin_curse', 'pantano_sludge_eruption']
    },
    pantano_cieno: {
      modes1: ['pantano_sludge_eruption', 'pantano_miasma_nova', 'pantano_hydra_snap'],
      modes2: ['pantano_sludge_eruption', 'pantano_spore_rain', 'pantano_miasma_nova', 'pantano_hydra_snap'],
      modes3: ['pantano_sludge_eruption', 'pantano_hydra_snap', 'pantano_miasma_nova', 'pantano_spore_rain', 'pantano_pumpkin_curse']
    },
    pantano_calabaza: {
      modes1: ['pantano_pumpkin_curse', 'pantano_spore_rain', 'pantano_hydra_snap'],
      modes2: ['pantano_pumpkin_curse', 'pantano_miasma_nova', 'pantano_hydra_snap', 'pantano_spore_rain'],
      modes3: ['pantano_pumpkin_curse', 'pantano_hydra_snap', 'pantano_miasma_nova', 'pantano_spore_rain', 'pantano_sludge_eruption']
    },
    pantano_bastion: {
      modes1: ['pantano_hydra_snap', 'pantano_sludge_eruption', 'pantano_miasma_nova'],
      modes2: ['pantano_hydra_snap', 'pantano_miasma_nova', 'pantano_spore_rain', 'pantano_sludge_eruption'],
      modes3: ['pantano_hydra_snap', 'pantano_miasma_nova', 'pantano_pumpkin_curse', 'pantano_spore_rain', 'pantano_sludge_eruption']
    },
    pantano_madre: {
      modes1: ['pantano_miasma_nova', 'pantano_hydra_snap', 'pantano_spore_rain', 'pantano_sludge_eruption'],
      modes2: ['pantano_miasma_nova', 'pantano_spore_rain', 'pantano_sludge_eruption', 'pantano_hydra_snap', 'pantano_pumpkin_curse'],
      modes3: ['pantano_hydra_snap', 'pantano_miasma_nova', 'pantano_pumpkin_curse', 'pantano_spore_rain', 'pantano_sludge_eruption']
    },
    necro_osario: {
      modes1: ['necro_bone_prison', 'necro_soul_scythe', 'necro_lich_bolt_fan'],
      modes2: ['necro_bone_prison', 'necro_soul_scythe', 'necro_phylactery_nova', 'necro_lich_bolt_fan'],
      modes3: ['necro_spectral_legion', 'necro_soul_scythe', 'necro_bone_prison', 'necro_phylactery_nova', 'necro_lich_bolt_fan']
    },
    necro_cripta: {
      modes1: ['necro_soul_scythe', 'necro_bone_prison', 'necro_lich_bolt_fan'],
      modes2: ['necro_soul_scythe', 'necro_spectral_legion', 'necro_bone_prison', 'necro_phylactery_nova'],
      modes3: ['necro_soul_scythe', 'necro_spectral_legion', 'necro_phylactery_nova', 'necro_bone_prison', 'necro_lich_bolt_fan']
    },
    necro_catacumba: {
      modes1: ['necro_phylactery_nova', 'necro_spectral_legion', 'necro_lich_bolt_fan'],
      modes2: ['necro_phylactery_nova', 'necro_spectral_legion', 'necro_soul_scythe', 'necro_lich_bolt_fan'],
      modes3: ['necro_spectral_legion', 'necro_phylactery_nova', 'necro_soul_scythe', 'necro_bone_prison', 'necro_lich_bolt_fan']
    },
    necro_foso: {
      modes1: ['necro_bone_prison', 'necro_phylactery_nova', 'necro_soul_scythe'],
      modes2: ['necro_bone_prison', 'necro_soul_scythe', 'necro_phylactery_nova', 'necro_spectral_legion'],
      modes3: ['necro_bone_prison', 'necro_spectral_legion', 'necro_soul_scythe', 'necro_phylactery_nova', 'necro_lich_bolt_fan']
    },
    necro_torre: {
      modes1: ['necro_lich_bolt_fan', 'necro_phylactery_nova', 'necro_spectral_legion'],
      modes2: ['necro_lich_bolt_fan', 'necro_phylactery_nova', 'necro_spectral_legion', 'necro_bone_prison'],
      modes3: ['necro_phylactery_nova', 'necro_lich_bolt_fan', 'necro_spectral_legion', 'necro_soul_scythe', 'necro_bone_prison']
    },
    necro_trono: {
      modes1: ['necro_spectral_legion', 'necro_phylactery_nova', 'necro_soul_scythe', 'necro_bone_prison'],
      modes2: ['necro_spectral_legion', 'necro_soul_scythe', 'necro_phylactery_nova', 'necro_lich_bolt_fan', 'necro_bone_prison'],
      modes3: ['necro_phylactery_nova', 'necro_spectral_legion', 'necro_soul_scythe', 'necro_bone_prison', 'necro_lich_bolt_fan']
    },
    maldita_sangre: {
      modes1: ['maldita_blood_ritual', 'maldita_crimson_flail', 'maldita_void_collapse'],
      modes2: ['maldita_blood_ritual', 'maldita_crimson_flail', 'maldita_abyss_hellfire', 'maldita_void_collapse'],
      modes3: ['maldita_blood_ritual', 'maldita_crimson_flail', 'maldita_abyss_hellfire', 'maldita_void_collapse', 'maldita_harvest_scythes']
    },
    maldita_carne: {
      modes1: ['maldita_crimson_flail', 'maldita_blood_ritual', 'maldita_abyss_hellfire'],
      modes2: ['maldita_crimson_flail', 'maldita_void_collapse', 'maldita_blood_ritual', 'maldita_harvest_scythes'],
      modes3: ['maldita_crimson_flail', 'maldita_abyss_hellfire', 'maldita_blood_ritual', 'maldita_void_collapse', 'maldita_harvest_scythes']
    },
    maldita_forja: {
      modes1: ['maldita_abyss_hellfire', 'maldita_crimson_flail', 'maldita_void_collapse'],
      modes2: ['maldita_abyss_hellfire', 'maldita_crimson_flail', 'maldita_blood_ritual', 'maldita_void_collapse'],
      modes3: ['maldita_abyss_hellfire', 'maldita_void_collapse', 'maldita_crimson_flail', 'maldita_blood_ritual', 'maldita_harvest_scythes']
    },
    maldita_calabaza: {
      modes1: ['maldita_harvest_scythes', 'maldita_void_collapse', 'maldita_crimson_flail'],
      modes2: ['maldita_harvest_scythes', 'maldita_blood_ritual', 'maldita_void_collapse', 'maldita_abyss_hellfire'],
      modes3: ['maldita_harvest_scythes', 'maldita_abyss_hellfire', 'maldita_blood_ritual', 'maldita_void_collapse', 'maldita_crimson_flail']
    },
    maldita_abismo: {
      modes1: ['maldita_void_collapse', 'maldita_abyss_hellfire', 'maldita_blood_ritual', 'maldita_harvest_scythes'],
      modes2: ['maldita_void_collapse', 'maldita_blood_ritual', 'maldita_abyss_hellfire', 'maldita_crimson_flail', 'maldita_harvest_scythes'],
      modes3: ['maldita_void_collapse', 'maldita_abyss_hellfire', 'maldita_harvest_scythes', 'maldita_blood_ritual', 'maldita_crimson_flail']
    },
    eclipse_carmesi: {
      modes1: ['abyssal_crimson_stance_slash', 'abyssal_vortex_whirlwind', 'abyssal_scarlet_aura_burst', 'abyssal_phantom_cross_step'],
      modes2: ['abyssal_crimson_stance_slash', 'abyssal_vortex_whirlwind', 'abyssal_phantom_cross_step', 'abyssal_scarlet_aura_burst', 'abyssal_eclipse_judgement'],
      modes3: ['abyssal_eclipse_judgement', 'abyssal_vortex_whirlwind', 'abyssal_phantom_cross_step', 'abyssal_crimson_stance_slash', 'abyssal_scarlet_aura_burst']
    }
  };

  function executeBossSignatureAttack(mode, b, dung, game, dt, theme, bossCol, projCfg, isBossWalkable, d, ang, tAng) {
    const px = game.player.x;
    const py = game.player.y;
    switch (mode) {
      // 1. Rey Limo Ancestral
      case 'slime_acid_mitosis':
        Balaclava.Audio.play('hit');
        game.spawnFx('pvfx_acid_splash', b.x, b.y, 0, 0.45, 1.4, 0.95);
        for (let k = 0; k < 10; k++) {
          const a = ang + (k / 10) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 220, Math.sin(a) * 220, Math.round(b.dmg * 0.8), '#76ff03', { vfxKey: 'pvfx_acid_splash', status: { kind: 'poison', dur: 2.5 } });
        }
        for (let k = 0; k < 3; k++) {
          const ox = b.x + (Math.random() - 0.5) * 80;
          const oy = b.y + (Math.random() - 0.5) * 80;
          dung.hazardZones.push({ kind: 'pool', x: ox, y: oy, radius: 42, duration: 2.8, timer: 0, dmg: b.dmg * 0.6, color: '#76ff03', vfxKey: 'pvfx_acid_splash', status: { kind: 'poison', dur: 2.5 } });
        }
        return true;

      case 'slime_toxic_geyser':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_bubble_burst', b.x, b.y, 0, 0.5, 1.2, 0.9);
        for (let k = 0; k < 3; k++) {
          const gx = px + (k - 1) * 44;
          const gy = py + (Math.random() - 0.5) * 40;
          dung.hazardZones.push({ kind: 'pillar', x: gx, y: gy, radius: 48, delay: 0.72 + k * 0.12, oneShot: true, timer: 0, dmg: b.dmg * 1.1, color: '#76ff03', vfxKey: 'pvfx_poison_cloud', status: { kind: 'poison', dur: 2.5 } });
        }
        return true;

      case 'slime_colossal_bounce':
        Balaclava.Audio.play('bomb');
        b.leapDur = 0.45;
        b.leapProg = 0.001;
        b.leapStartX = b.x;
        b.leapStartY = b.y;
        b.targetX = px;
        b.targetY = py;
        game.spawnFx('pvfx_bubble_burst', b.x, b.y, 0, 0.4, 1.3, 0.9);
        return true;

      // 2. Rey Goblin Korak
      case 'warlord_blade_whirl':
        Balaclava.Audio.play('slash');
        b.dashTimer = 0.44;
        b._dashHitCd = 0;
        b.dashVx = Math.cos(tAng) * 490;
        b.dashVy = Math.sin(tAng) * 490;
        game.spawnFx('pa_slash2_gold', b.x, b.y, tAng, 0.38, 1.3, 0.95);
        game.spawnFx('pvfx_sword_combo', b.x, b.y, tAng, 0.42, 1.2, 0.95);
        return true;

      case 'goblin_dynamite_barrage':
        Balaclava.Audio.play('bomb');
        game.spawnFx('pvfx_fire_nova', b.x, b.y, 0, 0.45, 1.1, 0.92);
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2;
          const dx = px + Math.cos(a) * 55;
          const dy = py + Math.sin(a) * 55;
          dung.hazardZones.push({ kind: 'meteor', x: dx, y: dy, radius: 50, delay: 0.75 + k * 0.15, duration: 2.4, timer: 0, detonated: false, dmg: b.dmg * 1.15, color: '#ffb300', vfxKey: 'pvfx_big_explosion' });
        }
        return true;

      case 'war_cry_earth_shatter':
        Balaclava.Audio.play('thunder');
        game.shake(0.32, 8);
        game.spawnShockwave(b.x, b.y, 140, '#ffb300');
        game.spawnFx('pvfx_power_up_aura', b.x, b.y, 0, 0.5, 1.3, 0.9);
        for (let k = -1; k <= 1; k++) {
          const fa = tAng + k * 0.28;
          dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(fa) * 170, y2: b.y + Math.sin(fa) * 170, halfW: 22, delay: 0.65, duration: 1.6, timer: 0, dmg: b.dmg * 1.2, color: '#ffb300', vfxKey: 'pvfx_hammer_smash' });
        }
        return true;

      // 3. Faraón Escorpión Khepra
      case 'venom_stinger_triple':
        Balaclava.Audio.play('slash');
        game.spawnFx('aw_thrust_stab', b.x, b.y, tAng, 0.35, 1.2, 0.95);
        for (let k = 0; k < 3; k++) {
          setTimeout(() => {
            if (b.hp > 0) {
              game.spawnEnemyProjectile(b.x, b.y, Math.cos(tAng) * 390, Math.sin(tAng) * 390, Math.round(b.dmg * 0.95), '#76ff03', { vfxKey: 'pvfx_poison_dart', status: { kind: 'poison', dur: 3.5 } });
            }
          }, k * 120);
        }
        return true;

      case 'quicksand_sinkhole':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_whirlpool', px, py, 0, 0.65, 1.4, 0.92);
        dung.hazardZones.push({ kind: 'pool', x: px, y: py, radius: 64, duration: 3.2, timer: 0, dmg: b.dmg * 0.75, color: '#e6c280', vfxKey: 'pvfx_dust_puff' });
        return true;

      case 'sand_burrow_eruption':
        Balaclava.Audio.play('bomb');
        game.spawnFx('pvfx_dust_puff', b.x, b.y, 0, 0.45, 1.3, 0.9);
        b.x = px + (Math.random() - 0.5) * 30;
        b.y = py + (Math.random() - 0.5) * 30;
        game.shake(0.35, 9);
        game.spawnShockwave(b.x, b.y, 130, '#ffd54f');
        game.spawnFx('aw_earth_rockspike', b.x, b.y, 0, 0.6, 1.4, 0.98);
        game.spawnFx('pvfx_rock_shatter', b.x, b.y, 0, 0.5, 1.2, 0.95);
        if (Balaclava.Utils.dist(b.x, b.y, px, py) < 110) game.damagePlayer(Math.round(b.dmg * 1.35));
        return true;

      // 4. Centurión Solar Anub
      case 'solar_lance_beam':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_divine_beam', b.x, b.y, tAng, 0.55, 1.4, 0.98);
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(tAng) * 220, y2: b.y + Math.sin(tAng) * 220, halfW: 24, delay: 0.55, duration: 1.5, timer: 0, dmg: b.dmg * 1.3, color: '#ffd54f', vfxKey: 'pvfx_arcane_beam' });
        return true;

      case 'sun_disc_ricochet':
        Balaclava.Audio.play('slash');
        game.spawnFx('pvfx_star_burst_pickup', b.x, b.y, 0, 0.4, 1.2, 0.92);
        for (let k = 0; k < 3; k++) {
          const a = tAng + (k - 1) * 0.35;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 260, Math.sin(a) * 260, Math.round(b.dmg * 0.88), '#ffd54f', { vfxKey: 'aw_holy_cross', bounces: 2 });
        }
        return true;

      case 'radiant_judgment_grid':
        Balaclava.Audio.play('thunder');
        game.shake(0.28, 7);
        for (let k = 0; k < 5; k++) {
          const rx = px + (k - 2) * 50;
          const ry = py + ((k % 2 === 0 ? -1 : 1) * 35);
          dung.hazardZones.push({ kind: 'pillar', x: rx, y: ry, radius: 46, delay: 0.70 + k * 0.10, oneShot: true, timer: 0, dmg: b.dmg * 1.15, color: '#ffd54f', vfxKey: 'pvfx_holy_smite' });
        }
        return true;

      // 5. Archidruida del Vacío
      case 'abyssal_singularity':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_void_implosion', px, py, 0, 0.65, 1.35, 0.95);
        dung.hazardZones.push({ kind: 'pool', x: px, y: py, radius: 68, duration: 2.5, timer: 0, dmg: b.dmg * 1.15, color: '#ab47bc', vfxKey: 'pvfx_implosion', status: { kind: 'curse', dur: 2.5 } });
        return true;

      case 'void_tendril_grasp':
        Balaclava.Audio.play('curse');
        game.spawnFx('aw_shadow_spikes', px, py, 0, 0.55, 1.3, 0.95);
        for (let k = -2; k <= 2; k++) {
          const a = tAng + k * 0.22;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 230, Math.sin(a) * 230, Math.round(b.dmg * 0.85), '#ab47bc', { vfxKey: 'pvfx_soul_drain', status: { kind: 'curse', dur: 2.2 } });
        }
        return true;

      case 'entropy_skull_spiral':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_curse', b.x, b.y, 0, 0.45, 1.2, 0.92);
        for (let k = 0; k < 12; k++) {
          const a = ang + (k / 12) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 255, Math.sin(a) * 255, Math.round(b.dmg * 0.88), '#ce93d8', { vfxKey: 'mp9_dark_bolt', homing: 0.85 });
        }
        return true;

      // 6. Soberano Esqueleto Malakor
      case 'death_scythe_reap':
        Balaclava.Audio.play('slash');
        game.shake(0.28, 7);
        game.spawnFx('pvfx_scythe_slash', b.x, b.y, tAng, 0.5, 1.45, 0.98);
        game.spawnFx('pa_slash1_purple', b.x, b.y, tAng, 0.42, 1.3, 0.92);
        for (let k = -1; k <= 1; k++) {
          const a = tAng + k * 0.24;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 310, Math.sin(a) * 310, Math.round(b.dmg * 1.1), '#ba68c8', { vfxKey: 'pa_slash1_purple' });
        }
        return true;

      case 'bone_cage_prison':
        Balaclava.Audio.play('bomb');
        game.spawnFx('aw_shadow_spikes', px, py, 0, 0.6, 1.35, 0.95);
        dung.hazardZones.push({ kind: 'meteor', x: px, y: py, radius: 58, delay: 0.95, duration: 2.2, timer: 0, detonated: false, dmg: b.dmg * 1.3, color: '#e1bee7', vfxKey: 'pvfx_blood_splat' });
        return true;

      case 'soul_siphon_vortex':
        Balaclava.Audio.play('curse');
        game.spawnFx('pvfx_soul_drain', b.x, b.y, 0, 0.6, 1.4, 0.92);
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 240, Math.sin(a) * 240, Math.round(b.dmg * 0.9), '#e1bee7', { vfxKey: 'pvfx_curse' });
        }
        return true;

      // 7. Coloso de Escarcha
      case 'glacial_avalanche':
        Balaclava.Audio.play('bomb');
        game.shake(0.35, 9);
        game.spawnFx('aw_ice_spikewave', b.x, b.y, tAng, 0.55, 1.4, 0.95);
        for (let k = -1; k <= 1; k++) {
          const a = tAng + k * 0.22;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 270, Math.sin(a) * 270, Math.round(b.dmg * 1.05), '#80deea', { vfxKey: 'pvfx_ice_spike', status: { kind: 'slow', dur: 2.8 } });
        }
        return true;

      case 'permafrost_shatter':
        Balaclava.Audio.play('magic');
        game.spawnShockwave(b.x, b.y, 160, '#80deea');
        game.spawnFx('pvfx_frost_nova', b.x, b.y, 0, 0.65, 1.5, 0.98);
        game.spawnFx('aw_ice_chargeshatter', b.x, b.y, 0, 0.6, 1.4, 0.92);
        dung.hazardZones.push({ kind: 'pool', x: b.x, y: b.y, radius: 75, duration: 3.2, timer: 0, dmg: b.dmg * 0.8, color: '#80deea', vfxKey: 'pvfx_ice_wall', status: { kind: 'slow', dur: 2.8 } });
        return true;

      case 'ice_shard_gatling':
        Balaclava.Audio.play('slash');
        game.spawnFx('aw_ice_castfrost', b.x, b.y, tAng, 0.45, 1.2, 0.92);
        for (let k = -3; k <= 3; k++) {
          const a = tAng + k * 0.10;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 330, Math.sin(a) * 330, Math.round(b.dmg * 0.78), '#80deea', { vfxKey: 'pvfx_ice_shard', status: { kind: 'slow', dur: 2.0 } });
        }
        return true;

      // 8. Archimago Boreal Vael
      case 'cryo_teleport_frostbite':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_blink_out', b.x, b.y, 0, 0.4, 1.2, 0.95);
        dung.hazardZones.push({ kind: 'meteor', x: b.x, y: b.y, radius: 60, delay: 0.8, duration: 2.2, timer: 0, detonated: false, dmg: b.dmg * 1.2, color: '#4fc3f7', vfxKey: 'pvfx_frost_nova' });
        {
          const nx = px + (px > b.x ? -130 : 130);
          const ny = py + (py > b.y ? -90 : 90);
          if (isBossWalkable(nx, ny)) { b.x = nx; b.y = ny; }
        }
        game.spawnFx('pvfx_teleport_in', b.x, b.y, 0, 0.4, 1.2, 0.95);
        return true;

      case 'absolute_zero_comet':
        Balaclava.Audio.play('meteor');
        game.spawnFx('aw_ice_castfrost', b.x, b.y, 0, 0.5, 1.3, 0.95);
        dung.hazardZones.push({ kind: 'meteor', x: px, y: py, radius: 72, delay: 0.95, duration: 3.0, timer: 0, detonated: false, dmg: b.dmg * 1.4, color: '#4fc3f7', vfxKey: 'pvfx_snowball_impact', status: { kind: 'slow', dur: 3.0 } });
        return true;

      case 'boreal_needle_supernova':
        Balaclava.Audio.play('magic');
        game.spawnFx('aw_ice_chargeshatter', b.x, b.y, 0, 0.6, 1.45, 0.98);
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 260, Math.sin(a) * 260, Math.round(b.dmg * 0.82), '#4fc3f7', { vfxKey: 'aw_ice_spear', status: { kind: 'slow', dur: 2.4 } });
        }
        return true;

      // 9. Dragón Carmesí Ignis
      case 'dragon_magma_breath':
        Balaclava.Audio.play('bomb');
        game.spawnFx('pvfx_flamethrower', b.x, b.y, tAng, 0.6, 1.5, 0.98);
        game.spawnFx('pvfx_fire_tornado', b.x, b.y, tAng, 0.5, 1.3, 0.9);
        for (let k = -2; k <= 2; k++) {
          const a = tAng + k * 0.16;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 290, Math.sin(a) * 290, Math.round(b.dmg * 0.92), '#ff5722', { vfxKey: 'pvfx_fireball_impact', status: { kind: 'burn', dur: 3.0 } });
        }
        for (let k = 1; k <= 3; k++) {
          const lx = b.x + Math.cos(tAng) * (k * 48);
          const ly = b.y + Math.sin(tAng) * (k * 48);
          dung.hazardZones.push({ kind: 'pool', x: lx, y: ly, radius: 44, duration: 3.0, timer: 0, dmg: b.dmg * 0.8, color: '#ff5722', vfxKey: 'pvfx_ground_flames', status: { kind: 'burn', dur: 2.5 } });
        }
        return true;

      case 'hellfire_wing_gust':
        Balaclava.Audio.play('slash');
        game.spawnFx('soggy_fire_slash', b.x, b.y, tAng, 0.45, 1.4, 0.95);
        game.spawnFx('pvfx_fire_nova', b.x, b.y, 0, 0.45, 1.3, 0.9);
        for (const s of [-0.22, 0.22]) {
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(tAng + s) * 320, Math.sin(tAng + s) * 320, Math.round(b.dmg * 1.05), '#ff5722', { vfxKey: 'soggy_fire_slash', status: { kind: 'burn', dur: 2.5 } });
        }
        return true;

      case 'inferno_meteor_cataclysm':
        Balaclava.Audio.play('meteor');
        game.shake(0.35, 9);
        game.spawnFx('pvfx_fire_tornado', b.x, b.y, 0, 0.55, 1.35, 0.95);
        for (let k = 0; k < 5; k++) {
          const mx = px + (Math.random() - 0.5) * 140;
          const my = py + (Math.random() - 0.5) * 140;
          dung.hazardZones.push({ kind: 'meteor', x: mx, y: my, radius: 64, delay: 0.70 + k * 0.16, duration: 3.0, timer: 0, detonated: false, dmg: b.dmg * 1.25, color: '#ff5722', vfxKey: 'pvfx_meteor_strike', status: { kind: 'burn', dur: 3.0 } });
        }
        return true;

      // 10. Señor Ígneo Balak
      case 'calamity_fissure_cross':
        Balaclava.Audio.play('bomb');
        game.shake(0.38, 10);
        game.spawnFx('pvfx_lava_burst', b.x, b.y, 0, 0.65, 1.5, 0.98);
        for (const off of [0, Math.PI / 2]) {
          const fa = tAng + off;
          dung.hazardZones.push({ kind: 'fissure', x: b.x - Math.cos(fa) * 160, y: b.y - Math.sin(fa) * 160, x2: b.x + Math.cos(fa) * 160, y2: b.y + Math.sin(fa) * 160, halfW: 26, delay: 0.75, duration: 1.8, timer: 0, dmg: b.dmg * 1.35, color: '#ff1744', vfxKey: 'pvfx_fire_pillar', status: { kind: 'burn', dur: 3.0 } });
        }
        return true;

      case 'pyroclastic_eruption':
        Balaclava.Audio.play('thunder');
        game.shake(0.35, 9);
        game.spawnShockwave(b.x, b.y, 180, '#ff1744');
        game.spawnFx('aw_fire_chargeburst_max', b.x, b.y, 0, 0.75, 1.6, 1.0);
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 280, Math.sin(a) * 280, Math.round(b.dmg * 0.9), '#ff1744', { vfxKey: 'pvfx_big_explosion', status: { kind: 'burn', dur: 2.5 } });
        }
        return true;

      case 'chains_of_damnation':
        Balaclava.Audio.play('curse');
        game.spawnFx('pvfx_chain_lightning', b.x, b.y, tAng, 0.55, 1.4, 0.95);
        for (let k = -2; k <= 2; k++) {
          const a = tAng + k * 0.18;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 250, Math.sin(a) * 250, Math.round(b.dmg * 0.85), '#ff1744', { vfxKey: 'pvfx_ground_flames', status: { kind: 'burn', dur: 2.5 } });
        }
        return true;

      // 11. Jefe Zapador Skrag
      case 'buckshot_scatter':
        Balaclava.Audio.play('slash');
        game.spawnFx('pvfx_hit_spark', b.x, b.y, tAng, 0.35, 1.3, 0.95);
        for (let k = -3; k <= 3; k++) {
          const a = tAng + k * 0.12;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 360, Math.sin(a) * 360, Math.round(b.dmg * 0.75), '#ffab91', { vfxKey: 'pvfx_rock_shatter' });
        }
        return true;

      case 'trapper_minefield':
        Balaclava.Audio.play('bomb');
        for (let k = 0; k < 4; k++) {
          const mx = px + (Math.random() - 0.5) * 90;
          const my = py + (Math.random() - 0.5) * 90;
          dung.hazardZones.push({ kind: 'pool', x: mx, y: my, radius: 46, duration: 3.5, timer: 0, dmg: b.dmg * 1.1, color: '#ffb300', vfxKey: 'pvfx_rune_trap' });
        }
        return true;

      case 'dynamite_lob':
        Balaclava.Audio.play('bomb');
        for (let k = 0; k < 3; k++) {
          const mx = px + (k - 1) * 48;
          const my = py + (Math.random() - 0.5) * 30;
          dung.hazardZones.push({ kind: 'meteor', x: mx, y: my, radius: 52, delay: 0.8 + k * 0.15, duration: 2.2, timer: 0, detonated: false, dmg: b.dmg * 1.2, color: '#ff7043', vfxKey: 'pvfx_firework_burst' });
        }
        return true;

      // 12. Capitán Jabalí Grok
      case 'iron_flail_cleave':
        Balaclava.Audio.play('slash');
        game.spawnFx('pa_slash1_red', b.x, b.y, 0, 0.45, 1.5, 0.95);
        game.spawnShockwave(b.x, b.y, 130, '#ef5350');
        if (d < 125) game.damagePlayer(Math.round(b.dmg * 1.35));
        return true;

      case 'berserker_tusk_rush':
        Balaclava.Audio.play('slash');
        b.dashTimer = 0.45;
        b._dashHitCd = 0;
        b.dashVx = Math.cos(tAng) * 510;
        b.dashVy = Math.sin(tAng) * 510;
        game.spawnFx('pvfx_axe_smear', b.x, b.y, tAng, 0.4, 1.3, 0.95);
        game.spawnFx('pvfx_dash_dust', b.x, b.y, tAng, 0.35, 1.2, 0.9);
        return true;

      case 'ground_tremor_stomp':
        Balaclava.Audio.play('bomb');
        game.shake(0.32, 8);
        game.spawnFx('pvfx_ground_slam', b.x, b.y, 0, 0.55, 1.4, 0.95);
        for (let k = -1; k <= 1; k++) {
          const a = tAng + k * 0.25;
          dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(a) * 160, y2: b.y + Math.sin(a) * 160, halfW: 20, delay: 0.6, duration: 1.5, timer: 0, dmg: b.dmg * 1.15, color: '#8d6e63', vfxKey: 'pvfx_ground_slam' });
        }
        return true;

      // 13. Guardián Silvestre Orin
      case 'nature_wrath_bolt':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_poison_cloud', b.x, b.y, 0, 0.4, 1.2, 0.92);
        for (let k = -1; k <= 1; k++) {
          const a = tAng + k * 0.2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 260, Math.sin(a) * 260, Math.round(b.dmg * 0.9), '#81c784', { vfxKey: 'pvfx_poison_dart', homing: 0.75 });
        }
        return true;

      case 'bramble_root_surge':
        Balaclava.Audio.play('magic');
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: px, y2: py, halfW: 24, delay: 0.65, duration: 1.8, timer: 0, dmg: b.dmg * 1.1, color: '#81c784', vfxKey: 'pvfx_poison_cloud', status: { kind: 'poison', dur: 2.2 } });
        return true;

      case 'ancient_spore_nova':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_spore_burst', b.x, b.y, 0, 0.6, 1.45, 0.95);
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 210, Math.sin(a) * 210, Math.round(b.dmg * 0.8), '#81c784', { vfxKey: 'pvfx_spore_burst', status: { kind: 'poison', dur: 2.5 } });
        }
        return true;

      // 14. Sierpe Esmeralda Sotek
      case 'tail_whip_sandstorm':
        Balaclava.Audio.play('slash');
        game.spawnFx('pvfx_dust_puff', b.x, b.y, tAng, 0.45, 1.3, 0.92);
        for (let k = -2; k <= 2; k++) {
          const a = tAng + k * 0.15;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 280, Math.sin(a) * 280, Math.round(b.dmg * 0.85), '#cddc39', { vfxKey: 'pvfx_dust_puff' });
        }
        return true;

      case 'cobra_venom_spray':
        Balaclava.Audio.play('hit');
        game.spawnFx('pvfx_acid_splash', b.x, b.y, tAng, 0.45, 1.35, 0.95);
        for (let k = -1; k <= 1; k++) {
          const a = tAng + k * 0.22;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 310, Math.sin(a) * 310, Math.round(b.dmg * 0.95), '#76ff03', { vfxKey: 'pvfx_acid_splash', status: { kind: 'poison', dur: 3.0 } });
        }
        return true;

      case 'constrictor_lunge':
        Balaclava.Audio.play('slash');
        b.dashTimer = 0.38;
        b._dashHitCd = 0;
        b.dashVx = Math.cos(tAng) * 460;
        b.dashVy = Math.sin(tAng) * 460;
        game.spawnFx('aw_claw_swipe', b.x, b.y, tAng, 0.35, 1.25, 0.95);
        return true;

      // 15. Sumo Escriba Khafre
      case 'anubis_hex_bolt':
        Balaclava.Audio.play('curse');
        game.spawnFx('pvfx_curse', b.x, b.y, 0, 0.4, 1.2, 0.92);
        game.spawnEnemyProjectile(b.x, b.y, Math.cos(tAng) * 270, Math.sin(tAng) * 270, Math.round(b.dmg * 1.25), '#ab47bc', { vfxKey: 'pvfx_curse', homing: 0.9, status: { kind: 'curse', dur: 2.8 } });
        return true;

      case 'cursed_hieroglyph_seal':
        Balaclava.Audio.play('curse');
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2;
          const sx = px + Math.cos(a) * 50;
          const sy = py + Math.sin(a) * 50;
          dung.hazardZones.push({ kind: 'pool', x: sx, y: sy, radius: 45, duration: 2.8, timer: 0, dmg: b.dmg * 1.05, color: '#ab47bc', vfxKey: 'pvfx_rune_trap', status: { kind: 'curse', dur: 2.2 } });
        }
        return true;

      case 'papyrus_swarm':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_magic_circle', b.x, b.y, 0, 0.5, 1.3, 0.95);
        for (let k = 0; k < 8; k++) {
          const a = ang + (k / 8) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 240, Math.sin(a) * 240, Math.round(b.dmg * 0.85), '#ffd54f', { vfxKey: 'pvfx_magic_circle' });
        }
        return true;

      // 16. Faraón Radiante Ra-Men
      case 'golden_dawn_barrage':
        Balaclava.Audio.play('thunder');
        game.spawnFx('pvfx_holy_smite', b.x, b.y, 0, 0.6, 1.4, 0.98);
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 270, Math.sin(a) * 270, Math.round(b.dmg * 0.88), '#ffd54f', { vfxKey: 'pvfx_holy_smite' });
        }
        return true;

      case 'prism_solar_flare':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_divine_beam', b.x, b.y, tAng, 0.5, 1.4, 0.95);
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(tAng) * 200, y2: b.y + Math.sin(tAng) * 200, halfW: 24, delay: 0.55, duration: 1.6, timer: 0, dmg: b.dmg * 1.25, color: '#ffd54f', vfxKey: 'pvfx_divine_beam' });
        return true;

      case 'sun_chariot_charge':
        Balaclava.Audio.play('slash');
        b.dashTimer = 0.42;
        b._dashHitCd = 0;
        b.dashVx = Math.cos(tAng) * 490;
        b.dashVy = Math.sin(tAng) * 490;
        game.spawnFx('pvfx_fire_nova', b.x, b.y, tAng, 0.4, 1.3, 0.95);
        return true;

      // 17. Autómata Alquímico X-09
      case 'steam_vent_purge':
        Balaclava.Audio.play('hit');
        game.spawnShockwave(b.x, b.y, 140, '#b0bec5');
        game.spawnFx('pvfx_implosion', b.x, b.y, 0, 0.5, 1.4, 0.95);
        if (d < 135) game.damagePlayer(Math.round(b.dmg * 1.3));
        return true;

      case 'volatile_flask_toss':
        Balaclava.Audio.play('bomb');
        for (let k = 0; k < 3; k++) {
          const fx = px + (k - 1) * 45;
          const fy = py + (Math.random() - 0.5) * 40;
          dung.hazardZones.push({ kind: 'pool', x: fx, y: fy, radius: 48, duration: 3.0, timer: 0, dmg: b.dmg * 1.1, color: k % 2 === 0 ? '#76ff03' : '#7e57c2', vfxKey: k % 2 === 0 ? 'pvfx_acid_splash' : 'aw_explosion_electric', status: { kind: k % 2 === 0 ? 'poison' : 'shock', dur: 2.5 } });
        }
        return true;

      case 'overclock_laser_sweep':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_arcane_beam', b.x, b.y, tAng, 0.55, 1.45, 0.98);
        for (let k = -2; k <= 2; k++) {
          const a = tAng + k * 0.14;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 340, Math.sin(a) * 340, Math.round(b.dmg * 0.9), '#7e57c2', { vfxKey: 'pvfx_arcane_orb_projectile' });
        }
        return true;

      // 18. Emperatriz Arácnea Syla
      case 'venomous_mandible_strike':
        Balaclava.Audio.play('slash');
        game.spawnFx('aw_claw_swipe', b.x, b.y, tAng, 0.38, 1.35, 0.98);
        if (d < 120) game.damagePlayer(Math.round(b.dmg * 1.35), { status: { kind: 'poison', dur: 3.5 } });
        return true;

      case 'silk_web_ensnare':
        Balaclava.Audio.play('hit');
        dung.hazardZones.push({ kind: 'pool', x: px, y: py, radius: 60, duration: 3.5, timer: 0, dmg: b.dmg * 0.6, color: '#e0e0e0', vfxKey: 'pvfx_rune_trap', status: { kind: 'slow', dur: 3.0 } });
        return true;

      case 'broodmother_needle_burst':
        Balaclava.Audio.play('slash');
        game.spawnFx('pvfx_poison_cloud', b.x, b.y, 0, 0.45, 1.3, 0.92);
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 280, Math.sin(a) * 280, Math.round(b.dmg * 0.85), '#9ccc65', { vfxKey: 'pvfx_poison_dart', status: { kind: 'poison', dur: 2.5 } });
        }
        return true;

      // 19. Hidra del Pantano Mog
      case 'furious_swamp_thrash':
        Balaclava.Audio.play('bomb');
        game.shake(0.3, 8);
        game.spawnFx('pvfx_water_splash', b.x, b.y, 0, 0.5, 1.4, 0.95);
        if (d < 130) game.damagePlayer(Math.round(b.dmg * 1.35));
        return true;

      case 'triple_acid_stream':
        Balaclava.Audio.play('hit');
        game.spawnFx('pvfx_acid_splash', b.x, b.y, tAng, 0.45, 1.3, 0.95);
        for (let k = -1; k <= 1; k++) {
          const a = tAng + k * 0.18;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 310, Math.sin(a) * 310, Math.round(b.dmg * 0.95), '#26a69a', { vfxKey: 'pvfx_acid_splash', status: { kind: 'poison', dur: 2.5 } });
        }
        return true;

      case 'swamp_mire_surge':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_tidal_wave', px, py, 0, 0.6, 1.4, 0.95);
        dung.hazardZones.push({ kind: 'pool', x: px, y: py, radius: 68, duration: 3.0, timer: 0, dmg: b.dmg * 0.85, color: '#26a69a', vfxKey: 'pvfx_water_geyser', status: { kind: 'poison', dur: 2.5 } });
        return true;

      // 20. Gólem de Diamante Boreal
      case 'gem_laser_refraction':
        Balaclava.Audio.play('magic');
        game.spawnFx('aw_arcane_impact', b.x, b.y, tAng, 0.5, 1.3, 0.95);
        for (let k = -2; k <= 2; k++) {
          const a = tAng + k * 0.16;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 320, Math.sin(a) * 320, Math.round(b.dmg * 0.88), '#4fc3f7', { vfxKey: 'px_energy_bolt' });
        }
        return true;

      case 'diamond_shard_shatter':
        Balaclava.Audio.play('bomb');
        game.shake(0.32, 8);
        game.spawnShockwave(b.x, b.y, 140, '#4fc3f7');
        game.spawnFx('pvfx_rock_shatter', b.x, b.y, 0, 0.5, 1.4, 0.95);
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 270, Math.sin(a) * 270, Math.round(b.dmg * 0.8), '#4fc3f7', { vfxKey: 'aw_ice_spear' });
        }
        return true;

      case 'crystal_spire_eruption':
        Balaclava.Audio.play('magic');
        for (let k = 0; k < 4; k++) {
          const sx = px + (k - 1.5) * 44;
          const sy = py + (Math.random() - 0.5) * 40;
          dung.hazardZones.push({ kind: 'pillar', x: sx, y: sy, radius: 46, delay: 0.65 + k * 0.12, oneShot: true, timer: 0, dmg: b.dmg * 1.15, color: '#4fc3f7', vfxKey: 'pvfx_ice_spike' });
        }
        return true;

      // 21. Comandante Valkir Thrond
      case 'thunder_shield_slam':
        Balaclava.Audio.play('bomb');
        game.shake(0.3, 8);
        game.spawnShockwave(b.x, b.y, 140, '#90caf9');
        game.spawnFx('pvfx_thunder_cloud', b.x, b.y, 0, 0.55, 1.4, 0.95);
        if (d < 130) game.damagePlayer(Math.round(b.dmg * 1.35), { status: { kind: 'shock', dur: 2.2 } });
        return true;

      case 'valkyrie_storm_javelin':
        Balaclava.Audio.play('thunder');
        game.spawnFx('aw_lightning_orb', b.x, b.y, tAng, 0.45, 1.3, 0.95);
        dung.hazardZones.push({ kind: 'pillar', x: px, y: py, radius: 52, delay: 0.7, oneShot: true, timer: 0, dmg: b.dmg * 1.3, color: '#90caf9', vfxKey: 'pvfx_lightning_strike', status: { kind: 'shock', dur: 2.5 } });
        return true;

      case 'ride_of_the_valkyrie':
        Balaclava.Audio.play('slash');
        b.leapDur = 0.44;
        b.leapProg = 0.001;
        b.leapStartX = b.x;
        b.leapStartY = b.y;
        b.targetX = px;
        b.targetY = py;
        game.spawnFx('aw_slash_spin', b.x, b.y, 0, 0.45, 1.4, 0.95);
        return true;

      // 22. Forjador Titánico Hephaest
      case 'bellows_flame_burst':
        Balaclava.Audio.play('hit');
        game.spawnFx('pvfx_flamethrower', b.x, b.y, tAng, 0.55, 1.45, 0.95);
        for (let k = -2; k <= 2; k++) {
          const a = tAng + k * 0.16;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 280, Math.sin(a) * 280, Math.round(b.dmg * 0.88), '#ff7043', { vfxKey: 'pvfx_fireball_impact', status: { kind: 'burn', dur: 2.5 } });
        }
        return true;

      case 'titanic_anvil_strike':
        Balaclava.Audio.play('bomb');
        game.shake(0.38, 10);
        game.spawnShockwave(b.x, b.y, 160, '#ff7043');
        game.spawnFx('pvfx_hammer_smash', b.x, b.y, 0, 0.65, 1.5, 0.98);
        for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
          dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(a) * 150, y2: b.y + Math.sin(a) * 150, halfW: 22, delay: 0.65, duration: 1.6, timer: 0, dmg: b.dmg * 1.25, color: '#ff7043', vfxKey: 'pvfx_lava_burst', status: { kind: 'burn', dur: 2.5 } });
        }
        return true;

      case 'molten_slag_shower':
        Balaclava.Audio.play('bomb');
        for (let k = 0; k < 4; k++) {
          const sx = px + (Math.random() - 0.5) * 100;
          const sy = py + (Math.random() - 0.5) * 100;
          dung.hazardZones.push({ kind: 'pool', x: sx, y: sy, radius: 46, duration: 3.2, timer: 0, dmg: b.dmg * 1.1, color: '#ff7043', vfxKey: 'pvfx_lava_burst', status: { kind: 'burn', dur: 2.8 } });
        }
        return true;

      // 23. Fénix Magmático Zyr
      case 'solar_feather_barrage':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_fireball_impact', b.x, b.y, 0, 0.45, 1.3, 0.95);
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 270, Math.sin(a) * 270, Math.round(b.dmg * 0.85), '#ffca28', { vfxKey: 'pvfx_fireball_impact', homing: 0.85, status: { kind: 'burn', dur: 2.5 } });
        }
        return true;

      case 'phoenix_dive_bomb':
        Balaclava.Audio.play('bomb');
        b.leapDur = 0.42;
        b.leapProg = 0.001;
        b.leapStartX = b.x;
        b.leapStartY = b.y;
        b.targetX = px;
        b.targetY = py;
        game.spawnFx('pvfx_fire_tornado', b.x, b.y, 0, 0.5, 1.4, 0.95);
        return true;

      case 'rebirth_flame_nova':
        Balaclava.Audio.play('thunder');
        game.shake(0.32, 8);
        game.spawnShockwave(b.x, b.y, 170, '#ffca28');
        game.spawnFx('pvfx_fire_nova', b.x, b.y, 0, 0.65, 1.5, 0.98);
        for (let k = 0; k < 10; k++) {
          const a = ang + (k / 10) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 260, Math.sin(a) * 260, Math.round(b.dmg * 0.9), '#ffca28', { vfxKey: 'pvfx_fire_pillar', status: { kind: 'burn', dur: 2.5 } });
        }
        return true;

      // 24. Emperador Ceniza Kael-Vorn
      case 'cataclysmic_stomp':
        Balaclava.Audio.play('bomb');
        game.shake(0.4, 11);
        game.spawnShockwave(b.x, b.y, 180, '#ff1744');
        game.spawnFx('soggy_incinerate', b.x, b.y, 0, 0.7, 1.6, 1.0);
        game.spawnFx('pvfx_big_explosion', b.x, b.y, 0, 0.6, 1.4, 0.95);
        if (d < 160) game.damagePlayer(Math.round(b.dmg * 1.5), { status: { kind: 'burn', dur: 3.0 } });
        return true;

      case 'ashen_obliteration_ray':
        Balaclava.Audio.play('magic');
        game.spawnFx('aw_fire_chargeburst_max', b.x, b.y, tAng, 0.65, 1.6, 1.0);
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(tAng) * 240, y2: b.y + Math.sin(tAng) * 240, halfW: 28, delay: 0.6, duration: 1.8, timer: 0, dmg: b.dmg * 1.4, color: '#ff1744', vfxKey: 'pvfx_fire_pillar', status: { kind: 'burn', dur: 3.0 } });
        return true;

      case 'cinder_cyclone':
        Balaclava.Audio.play('curse');
        for (const s of [-40, 40]) {
          dung.hazardZones.push({ kind: 'pool', x: px + s, y: py, radius: 55, duration: 3.5, timer: 0, dmg: b.dmg * 1.1, color: '#ff1744', vfxKey: 'pvfx_fire_tornado', status: { kind: 'burn', dur: 3.0 } });
        }
        return true;

      // === EXPANSION: BIOMES 3, 4, 5 SIGNATURE ATTACKS (2 additional attacks per boss) ===

      // 1. Archidruida del Vacío (bosque_oscuro)
      case 'cosmic_black_hole':
        Balaclava.Audio.play('curse');
        game.spawnFx('pvfx_whirlpool', px, py, 0, 0.7, 1.8, 0.95);
        game.spawnShockwave(px, py, 110, '#ce93d8');
        dung.hazardZones.push({ kind: 'pool', x: px, y: py, radius: 72, duration: 3.5, timer: 0, dmg: b.dmg * 0.9, color: '#ba68c8', vfxKey: 'pvfx_whirlpool', status: { kind: 'stun', dur: 0.5 } });
        return true;

      case 'nether_chain_snare':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_power_up_aura', b.x, b.y, 0, 0.5, 1.3, 0.9);
        for (const [dx, dy] of [[0, 0], [42, 0], [-42, 0], [0, 42], [0, -42]]) {
          dung.hazardZones.push({ kind: 'pillar', x: px + dx, y: py + dy, radius: 44, delay: 0.65, oneShot: true, timer: 0, dmg: b.dmg * 1.3, color: '#ce93d8', vfxKey: 'pvfx_void_burst' });
        }
        return true;

      // 2. Soberano Esqueleto Malakor (bosque_necro)
      case 'catacomb_legion_sweep':
        Balaclava.Audio.play('slash');
        game.spawnFx('pvfx_sword_combo', b.x, b.y, tAng, 0.45, 1.4, 0.95);
        for (let i = -2; i <= 2; i++) {
          const fa = tAng + i * 0.22;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(fa) * 310, Math.sin(fa) * 310, Math.round(b.dmg * 1.05), '#b39ddb', { vfxKey: 'pvfx_shadow_bolt' });
        }
        return true;

      case 'grave_rot_miasma':
        Balaclava.Audio.play('curse');
        game.spawnShockwave(b.x, b.y, 130, '#9575cd');
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2;
          const mx = px + Math.cos(a) * 48;
          const my = py + Math.sin(a) * 48;
          dung.hazardZones.push({ kind: 'pool', x: mx, y: my, radius: 52, duration: 3.6, timer: 0, dmg: b.dmg * 0.8, color: '#9575cd', vfxKey: 'pvfx_poison_cloud', status: { kind: 'poison', dur: 3.0 } });
        }
        return true;

      // 3. Coloso de Escarcha (montanas_heladas)
      case 'blizzard_cryo_quake':
        Balaclava.Audio.play('thunder');
        game.shake(0.35, 9);
        game.spawnShockwave(b.x, b.y, 160, '#80deea');
        dung.hazardZones.push({ kind: 'fissure', x: b.x - 140, y: b.y, x2: b.x + 140, y2: b.y, halfW: 24, delay: 0.55, duration: 1.8, timer: 0, dmg: b.dmg * 1.3, color: '#80deea', vfxKey: 'pvfx_ice_burst' });
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y - 140, x2: b.x, y2: b.y + 140, halfW: 24, delay: 0.55, duration: 1.8, timer: 0, dmg: b.dmg * 1.3, color: '#80deea', vfxKey: 'pvfx_ice_burst' });
        return true;

      case 'frozen_monolith_drop':
        Balaclava.Audio.play('bomb');
        for (let i = 0; i < 3; i++) {
          const ox = px + (i - 1) * 54;
          const oy = py + (Math.random() - 0.5) * 40;
          dung.hazardZones.push({ kind: 'meteor', x: ox, y: oy, radius: 56, delay: 0.6 + i * 0.16, duration: 2.2, timer: 0, detonated: false, dmg: b.dmg * 1.4, color: '#80deea', vfxKey: 'pvfx_ice_burst' });
        }
        return true;

      // 4. Archimago Boreal Vael (montanas_glaciar)
      case 'arctic_mirror_delusion':
        Balaclava.Audio.play('magic');
        b.dashTimer = 0.35;
        b.dashVx = Math.cos(tAng + Math.PI / 2) * 360;
        b.dashVy = Math.sin(tAng + Math.PI / 2) * 360;
        game.spawnFx('pvfx_whirlpool', b.x, b.y, 0, 0.4, 1.2, 0.9);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 270, Math.sin(a) * 270, Math.round(b.dmg * 0.9), '#4fc3f7', { vfxKey: 'pvfx_ice_needle' });
        }
        return true;

      case 'glacial_orb_orbit':
        Balaclava.Audio.play('magic');
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 + tAng;
          const ox = b.x + Math.cos(a) * 65;
          const oy = b.y + Math.sin(a) * 65;
          dung.hazardZones.push({ kind: 'pool', x: ox, y: oy, radius: 46, duration: 3.2, timer: 0, dmg: b.dmg * 0.85, color: '#4fc3f7', vfxKey: 'pvfx_ice_burst', status: { kind: 'slow', dur: 2.5 } });
        }
        return true;

      // 5. Dragón Carmesí Ignis (tierras_volcanicas)
      case 'draconic_roaring_supernova':
        Balaclava.Audio.play('bomb');
        game.shake(0.38, 10);
        game.spawnShockwave(b.x, b.y, 180, '#ff5722');
        game.spawnFx('pvfx_fire_nova', b.x, b.y, 0, 0.5, 1.6, 0.95);
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 290, Math.sin(a) * 290, Math.round(b.dmg * 1.1), '#ff5722', { vfxKey: 'pvfx_fire_burst', status: { kind: 'burn', dur: 3.0 } });
        }
        dung.hazardZones.push({ kind: 'pool', x: b.x, y: b.y, radius: 64, duration: 3.5, timer: 0, dmg: b.dmg * 0.9, color: '#ff5722', vfxKey: 'pvfx_fire_pillar', status: { kind: 'burn', dur: 3.0 } });
        return true;

      case 'volcanic_earth_rift':
        Balaclava.Audio.play('thunder');
        game.shake(0.3, 8);
        dung.hazardZones.push({ kind: 'fissure', x: b.x - 130, y: b.y - 130, x2: b.x + 130, y2: b.y + 130, halfW: 24, delay: 0.6, duration: 2.0, timer: 0, dmg: b.dmg * 1.35, color: '#ff7043', vfxKey: 'pvfx_fire_pillar', status: { kind: 'burn', dur: 3.0 } });
        dung.hazardZones.push({ kind: 'fissure', x: b.x - 130, y: b.y + 130, x2: b.x + 130, y2: b.y - 130, halfW: 24, delay: 0.6, duration: 2.0, timer: 0, dmg: b.dmg * 1.35, color: '#ff7043', vfxKey: 'pvfx_fire_pillar', status: { kind: 'burn', dur: 3.0 } });
        return true;

      // 6. Señor Ígneo Balak (volcan_abismo)
      case 'abyssal_hellfire_vortex':
        Balaclava.Audio.play('curse');
        game.spawnFx('pvfx_fire_tornado', px, py, 0, 0.65, 1.5, 0.95);
        dung.hazardZones.push({ kind: 'pool', x: px, y: py, radius: 68, duration: 3.6, timer: 0, dmg: b.dmg * 1.0, color: '#ff1744', vfxKey: 'pvfx_fire_tornado', status: { kind: 'burn', dur: 3.5 } });
        return true;

      case 'apocalyptic_meteor_storm':
        Balaclava.Audio.play('bomb');
        game.shake(0.4, 11);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          const mx = px + Math.cos(a) * 58;
          const my = py + Math.sin(a) * 58;
          dung.hazardZones.push({ kind: 'meteor', x: mx, y: my, radius: 52, delay: 0.5 + i * 0.14, duration: 2.2, timer: 0, detonated: false, dmg: b.dmg * 1.4, color: '#ff1744', vfxKey: 'pvfx_big_explosion' });
        }
        return true;

      // 7. Autómata Alquímico X-09 (bosque_laboratorio)
      case 'tesla_chain_discharge':
        Balaclava.Audio.play('thunder');
        game.shake(0.28, 7);
        game.spawnShockwave(b.x, b.y, 140, '#7e57c2');
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 340, Math.sin(a) * 340, Math.round(b.dmg * 1.15), '#7e57c2', { vfxKey: 'pvfx_lightning_burst' });
        }
        return true;

      case 'chemical_napalm_carpet':
        Balaclava.Audio.play('bomb');
        for (let i = 1; i <= 4; i++) {
          const nx = b.x + Math.cos(tAng) * (i * 50);
          const ny = b.y + Math.sin(tAng) * (i * 50);
          dung.hazardZones.push({ kind: 'meteor', x: nx, y: ny, radius: 46, delay: 0.4 + i * 0.14, duration: 2.0, timer: 0, detonated: false, dmg: b.dmg * 1.25, color: '#7e57c2', vfxKey: 'pvfx_fire_nova' });
        }
        return true;

      // 8. Emperatriz Arácnea Syla (bosque_arana)
      case 'arachnid_pounce_ambush':
        Balaclava.Audio.play('hit');
        b.leapDur = 0.38;
        b.leapProg = 0.001;
        b.leapStartX = b.x;
        b.leapStartY = b.y;
        b.targetX = px;
        b.targetY = py;
        game.spawnFx('pvfx_acid_splash', b.x, b.y, 0, 0.4, 1.3, 0.9);
        return true;

      case 'toxic_silk_cocoon':
        Balaclava.Audio.play('magic');
        game.spawnEnemyProjectile(b.x, b.y, Math.cos(tAng) * 360, Math.sin(tAng) * 360, Math.round(b.dmg * 1.2), '#9ccc65', { vfxKey: 'pvfx_poison_cloud', status: { kind: 'slow', dur: 3.0 } });
        dung.hazardZones.push({ kind: 'pool', x: px, y: py, radius: 52, duration: 3.0, timer: 0, dmg: b.dmg * 0.75, color: '#9ccc65', vfxKey: 'pvfx_acid_splash', status: { kind: 'poison', dur: 2.5 } });
        return true;

      // 9. Hidra del Pantano Mog (bosque_pantano)
      case 'hydra_regrowth_breath':
        Balaclava.Audio.play('slash');
        game.spawnFx('pvfx_acid_splash', b.x, b.y, tAng, 0.4, 1.5, 0.95);
        for (let i = 0; i < 8; i++) {
          const spread = (Math.random() - 0.5) * 0.4;
          const spd = 260 + Math.random() * 80;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(tAng + spread) * spd, Math.sin(tAng + spread) * spd, Math.round(b.dmg * 0.9), '#26a69a', { vfxKey: 'pvfx_acid_splash', status: { kind: 'poison', dur: 3.0 } });
        }
        return true;

      case 'noxious_bog_geysers':
        Balaclava.Audio.play('curse');
        for (let i = 0; i < 4; i++) {
          const gx = px + (i - 1.5) * 45;
          const gy = py + (Math.random() - 0.5) * 45;
          dung.hazardZones.push({ kind: 'pillar', x: gx, y: gy, radius: 46, delay: 0.55 + i * 0.12, oneShot: true, timer: 0, dmg: b.dmg * 1.2, color: '#26a69a', vfxKey: 'pvfx_poison_cloud', status: { kind: 'poison', dur: 2.5 } });
        }
        return true;

      // 10. Gólem de Diamante Boreal (montanas_mina)
      case 'hyper_prism_cannon':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_laser_charge', b.x, b.y, tAng, 0.45, 1.5, 0.95);
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(tAng) * 280, y2: b.y + Math.sin(tAng) * 280, halfW: 28, delay: 0.55, duration: 1.8, timer: 0, dmg: b.dmg * 1.5, color: '#4fc3f7', vfxKey: 'pvfx_ice_burst' });
        return true;

      case 'diamond_core_overload':
        Balaclava.Audio.play('thunder');
        game.shake(0.32, 9);
        game.spawnShockwave(b.x, b.y, 170, '#4fc3f7');
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 310, Math.sin(a) * 310, Math.round(b.dmg * 1.05), '#4fc3f7', { vfxKey: 'pvfx_ice_needle' });
        }
        return true;

      // 11. Comandante Valkir Thrond (montanas_fortaleza)
      case 'valhalla_sky_strike':
        Balaclava.Audio.play('thunder');
        game.shake(0.35, 10);
        dung.hazardZones.push({ kind: 'pillar', x: px, y: py, radius: 60, delay: 0.5, oneShot: true, timer: 0, dmg: b.dmg * 1.5, color: '#90caf9', vfxKey: 'pvfx_lightning_burst' });
        return true;

      case 'vanguard_spear_whirlwind':
        Balaclava.Audio.play('slash');
        b.dashTimer = 0.48;
        b._dashHitCd = 0;
        b.dashVx = Math.cos(tAng) * 510;
        b.dashVy = Math.sin(tAng) * 510;
        game.spawnFx('pa_slash2_gold', b.x, b.y, tAng, 0.4, 1.4, 0.95);
        game.spawnShockwave(b.x, b.y, 120, '#90caf9');
        return true;

      // 12. Forjador Titánico Hephaest (volcan_fragua)
      case 'forge_master_molten_hammer':
        Balaclava.Audio.play('hit');
        game.shake(0.36, 10);
        b.leapDur = 0.42;
        b.leapProg = 0.001;
        b.leapStartX = b.x;
        b.leapStartY = b.y;
        b.targetX = px;
        b.targetY = py;
        dung.hazardZones.push({ kind: 'pillar', x: px, y: py, radius: 58, delay: 0.42, oneShot: true, timer: 0, dmg: b.dmg * 1.45, color: '#ff7043', vfxKey: 'pvfx_hammer_smash' });
        return true;

      case 'liquid_metal_tsunami':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_fire_nova', b.x, b.y, tAng, 0.4, 1.5, 0.95);
        for (let i = -3; i <= 3; i++) {
          const fa = tAng + i * 0.18;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(fa) * 280, Math.sin(fa) * 280, Math.round(b.dmg * 1.1), '#ff7043', { vfxKey: 'pvfx_fire_burst', status: { kind: 'burn', dur: 3.0 } });
        }
        return true;

      // 13. Fénix Magmático Zyr (volcan_caldera)
      case 'phoenix_conflagration_spiral':
        Balaclava.Audio.play('magic');
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + tAng;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 300, Math.sin(a) * 300, Math.round(b.dmg * 1.05), '#ffca28', { vfxKey: 'pvfx_fire_feather', status: { kind: 'burn', dur: 2.5 } });
        }
        return true;

      case 'sunfire_thermal_beam':
        Balaclava.Audio.play('magic');
        game.spawnFx('pvfx_fire_chargeburst_max', b.x, b.y, tAng, 0.5, 1.5, 0.95);
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(tAng) * 260, y2: b.y + Math.sin(tAng) * 260, halfW: 26, delay: 0.55, duration: 1.8, timer: 0, dmg: b.dmg * 1.4, color: '#ffca28', vfxKey: 'pvfx_fire_pillar', status: { kind: 'burn', dur: 3.0 } });
        return true;

      // 14. Emperador Ceniza Kael-Vorn (volcan_trono_ceniza)
      case 'ash_emperor_dominion_wave':
        Balaclava.Audio.play('curse');
        game.shake(0.38, 11);
        game.spawnShockwave(b.x, b.y, 140, '#ff1744');
        setTimeout(() => { if (b.hp > 0) game.spawnShockwave(b.x, b.y, 200, '#ff1744'); }, 180);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 320, Math.sin(a) * 320, Math.round(b.dmg * 1.15), '#ff1744', { vfxKey: 'pvfx_fire_burst', status: { kind: 'burn', dur: 3.0 } });
        }
        return true;

      case 'cinder_execution_cleave':
        Balaclava.Audio.play('slash');
        b.dashTimer = 0.44;
        b._dashHitCd = 0;
        b.dashVx = Math.cos(tAng) * 520;
        b.dashVy = Math.sin(tAng) * 520;
        game.spawnFx('pa_slash2_gold', b.x, b.y, tAng, 0.4, 1.5, 0.95);
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(tAng) * 200, y2: b.y + Math.sin(tAng) * 200, halfW: 24, delay: 0.44, duration: 1.8, timer: 0, dmg: b.dmg * 1.3, color: '#ff1744', vfxKey: 'pvfx_fire_pillar', status: { kind: 'burn', dur: 3.0 } });
        return true;

      // ── Beta 1.3.0: Arquetipos de Bioma (Zonas III y IV) con Gigapack VFX ──
      // Archipiélago Coral
      case 'coral_tidal_surge':
        Balaclava.Audio.play('splash');
        game.spawnFx('sp_impact_blue', b.x, b.y, tAng, 0.55, 1.8, 0.95, { blend: 'lighter' });
        for (let k = -3; k <= 3; k++) {
          const a = tAng + k * 0.14;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 290, Math.sin(a) * 290, Math.round(b.dmg * 0.92), '#26c6da', projCfg(false, { radius: 8 }));
        }
        return true;

      case 'coral_whirlpool_vortex':
        Balaclava.Audio.play('cast');
        game.spawnShockwave(b.x, b.y, 175, '#4dd0e1');
        game.spawnFx('sp_spell_defense_blue', b.x, b.y, 0, 0.75, 1.9, 0.95, { blend: 'lighter' });
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2 + (b.phaseCycle || 0) * 0.35;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 235, Math.sin(a) * 235, Math.round(b.dmg * 0.88), '#00e5ff', projCfg(true));
        }
        return true;

      case 'coral_pearl_barrage':
        Balaclava.Audio.play('cast');
        game.spawnFx('sp_frost_explosion_cyan', b.x, b.y, tAng, 0.5, 1.5, 0.9, { blend: 'lighter' });
        for (let k = -2; k <= 2; k++) {
          const a = tAng + k * 0.22;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 330, Math.sin(a) * 330, Math.round(b.dmg * 1.0), '#80deea', projCfg(true));
        }
        return true;

      case 'coral_depth_charge':
        Balaclava.Audio.play('bomb');
        game.spawnFx('sp_impact_blue', px, py, 0, 0.65, 1.9, 0.95);
        for (let k = 0; k < 3; k++) {
          const oa = ang + (k - 1) * 0.9;
          const distO = k === 0 ? 0 : 95;
          dung.hazardZones.push({ kind: 'meteor', x: px + Math.cos(oa) * distO, y: py + Math.sin(oa) * distO, radius: 66, delay: 0.75, duration: 0.5, timer: 0, dmg: Math.round(b.dmg * 1.25), color: '#26c6da', vfxKey: 'sp_frost_explosion_cyan' });
        }
        return true;

      case 'coral_leviathan_rush':
        Balaclava.Audio.play('slash');
        game.spawnFx('sp_spell_defense_blue', b.x, b.y, tAng, 0.5, 1.6, 0.95);
        b.dashTimer = 0.42;
        b.dashVx = Math.cos(tAng) * 520;
        b.dashVy = Math.sin(tAng) * 520;
        b.dashCharges = 1;
        return true;

      // Cavernas Cristalinas
      case 'cristal_prism_beam':
        Balaclava.Audio.play('thunder');
        game.spawnFx('sp_lightning_strike_violet', b.x, b.y, tAng, 0.65, 1.9, 1.0, { blend: 'lighter' });
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(tAng) * 340, y2: b.y + Math.sin(tAng) * 340, halfW: 24, delay: 0.55, duration: 1.4, timer: 0, dmg: Math.round(b.dmg * 1.32), color: '#e040fb', vfxKey: 'sp_impact_violet' });
        return true;

      case 'cristal_geode_shards':
        Balaclava.Audio.play('cast');
        game.spawnFx('sp_scifi_charge', b.x, b.y, 0, 0.55, 1.6, 0.95, { blend: 'lighter' });
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 265, Math.sin(a) * 265, Math.round(b.dmg * 0.9), '#ce93d8', projCfg(true));
        }
        return true;

      case 'cristal_mirror_nova':
        Balaclava.Audio.play('thunder');
        game.spawnShockwave(b.x, b.y, 190, '#e040fb');
        game.spawnFx('sp_stylized_explosion_violet', b.x, b.y, 0, 0.75, 2.0, 1.0, { blend: 'lighter' });
        for (let k = 0; k < 8; k++) {
          const a = tAng + (k / 8) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 310, Math.sin(a) * 310, Math.round(b.dmg * 1.05), '#ba68c8', projCfg(false));
        }
        return true;

      case 'cristal_resonance_pulse':
        Balaclava.Audio.play('curse');
        game.spawnFx('sp_lightning_burst_violet', b.x, b.y, 0, 0.6, 1.85, 0.95, { blend: 'lighter' });
        if (d < 165) game.damagePlayer(Math.round(b.dmg * 1.2), { status: theme.status });
        return true;

      case 'cristal_astral_singularity':
        Balaclava.Audio.play('meteor');
        game.spawnFx('sp_scifi_warp', px, py, 0, 0.75, 1.9, 1.0, { blend: 'lighter' });
        dung.hazardZones.push({ kind: 'meteor', x: px, y: py, radius: 78, delay: 0.8, duration: 0.6, timer: 0, dmg: Math.round(b.dmg * 1.4), color: '#7c4dff', vfxKey: 'sp_stylized_explosion_violet' });
        return true;

      // Selva Esmeralda
      case 'selva_venom_thorns':
        Balaclava.Audio.play('cast');
        game.spawnFx('sp_spell_poison_green', b.x, b.y, tAng, 0.5, 1.65, 0.95, { blend: 'lighter' });
        for (let k = -3; k <= 3; k++) {
          const a = tAng + k * 0.16;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 285, Math.sin(a) * 285, Math.round(b.dmg * 0.92), '#00e676', projCfg(false, { status: { kind: 'poison', dur: 3.5 } }));
        }
        return true;

      case 'selva_canopy_dive':
        Balaclava.Audio.play('slash');
        game.spawnFx('sp_spell_haste_green', b.x, b.y, 0, 0.45, 1.7, 0.95, { blend: 'lighter' });
        b.leapStartX = b.x; b.leapStartY = b.y;
        b.targetX = px; b.targetY = py;
        b.leapDur = 0.42; b.leapProg = 0;
        return true;

      case 'selva_pollen_cloud':
        Balaclava.Audio.play('curse');
        game.spawnFx('sp_spell_poison_green', px, py, 0, 0.75, 2.0, 0.95);
        dung.hazardZones.push({ kind: 'pool', x: px, y: py, radius: 74, delay: 0.45, duration: 3.2, timer: 0, dmg: Math.round(b.dmg * 0.72), color: '#66bb6a', vfxKey: 'sp_spell_poison_green', status: { kind: 'poison', dur: 3.0 } });
        return true;

      case 'selva_jade_fissure':
        Balaclava.Audio.play('bomb');
        game.spawnFx('sp_spell_heal_green', b.x, b.y, tAng, 0.65, 1.8, 0.95, { blend: 'lighter' });
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(tAng) * 310, y2: b.y + Math.sin(tAng) * 310, halfW: 25, delay: 0.65, duration: 1.5, timer: 0, dmg: Math.round(b.dmg * 1.28), color: '#00c853', vfxKey: 'sp_spell_poison_green' });
        return true;

      case 'selva_root_snare':
        Balaclava.Audio.play('hit');
        game.spawnFx('sp_spell_haste_green', b.x, b.y, 0, 0.6, 1.85, 0.95);
        if (d < 150) game.damagePlayer(Math.round(b.dmg * 1.15), { status: { kind: 'poison', dur: 2.5 } });
        return true;

      // Caldera de Ceniza
      case 'caldera_magma_eruption':
        Balaclava.Audio.play('bomb');
        game.shake(0.35, 9);
        game.spawnShockwave(b.x, b.y, 175, '#ff5722');
        game.spawnFx('sp_epic_explosion_orange', b.x, b.y, 0, 0.7, 2.1, 1.0, { blend: 'lighter' });
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 285, Math.sin(a) * 285, Math.round(b.dmg * 0.96), '#ff7043', projCfg(true, { status: { kind: 'burn', dur: 3.0 } }));
        }
        return true;

      case 'caldera_slag_bombard':
        Balaclava.Audio.play('meteor');
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2 + ang;
          const distM = k === 0 ? 0 : 88;
          dung.hazardZones.push({ kind: 'meteor', x: px + Math.cos(a) * distM, y: py + Math.sin(a) * distM, radius: 64, delay: 0.72, duration: 0.5, timer: 0, dmg: Math.round(b.dmg * 1.25), color: '#ff3d00', vfxKey: 'sp_epic_explosion_orange', status: { kind: 'burn', dur: 2.5 } });
        }
        return true;

      case 'caldera_smoke_ring':
        Balaclava.Audio.play('fire');
        game.spawnFx('sp_fire_loop_orange', b.x, b.y, 0, 0.7, 1.9, 0.95, { blend: 'lighter' });
        for (let k = -2; k <= 2; k++) {
          const a = tAng + k * 0.2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 320, Math.sin(a) * 320, Math.round(b.dmg * 0.95), '#ff9100', projCfg(false));
        }
        return true;

      case 'caldera_molten_cleave':
        Balaclava.Audio.play('slash');
        game.spawnFx('sp_spell_attack_red', b.x, b.y, tAng, 0.5, 1.9, 1.0, { blend: 'lighter' });
        b.dashTimer = 0.36; b.dashVx = Math.cos(tAng) * 560; b.dashVy = Math.sin(tAng) * 560; b.dashCharges = 1;
        return true;

      case 'caldera_inferno_tempest':
        Balaclava.Audio.play('thunder');
        game.shake(0.42, 10);
        game.spawnFx('sp_epic_explosion_orange', b.x, b.y, 0, 0.8, 2.3, 1.0, { blend: 'lighter' });
        for (let off of [0, Math.PI / 2]) {
          const fa = tAng + off;
          dung.hazardZones.push({ kind: 'fissure', x: b.x - Math.cos(fa) * 180, y: b.y - Math.sin(fa) * 180, x2: b.x + Math.cos(fa) * 180, y2: b.y + Math.sin(fa) * 180, halfW: 26, delay: 0.65, duration: 1.6, timer: 0, dmg: Math.round(b.dmg * 1.35), color: '#ff3d00', vfxKey: 'sp_fire_loop_orange' });
        }
        return true;

      // Dinastía de la Arena
      case 'dinastia_solar_obelisk':
        Balaclava.Audio.play('thunder');
        game.spawnFx('sp_scifi_charge', px, py, 0, 0.7, 1.85, 0.95, { blend: 'lighter' });
        dung.hazardZones.push({ kind: 'meteor', x: px, y: py, radius: 74, delay: 0.7, duration: 0.6, timer: 0, dmg: Math.round(b.dmg * 1.35), color: '#ffca28', vfxKey: 'sp_epic_explosion_orange' });
        return true;

      case 'dinastia_scarab_swarm':
        Balaclava.Audio.play('cast');
        game.spawnFx('sp_spell_attack_red', b.x, b.y, tAng, 0.5, 1.7, 0.95);
        for (let k = -4; k <= 4; k++) {
          const a = tAng + k * 0.13;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 305, Math.sin(a) * 305, Math.round(b.dmg * 0.85), '#ffd54f', projCfg(true));
        }
        return true;

      case 'dinastia_sand_vortex':
        Balaclava.Audio.play('cast');
        game.spawnShockwave(b.x, b.y, 185, '#ffb300');
        game.spawnFx('sp_epic_explosion_orange', b.x, b.y, 0, 0.65, 1.8, 0.95, { blend: 'lighter' });
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 260, Math.sin(a) * 260, Math.round(b.dmg * 0.9), '#ffa726', projCfg(false));
        }
        return true;

      case 'dinastia_pharaoh_decree':
        Balaclava.Audio.play('curse');
        game.shake(0.35, 9);
        game.spawnFx('sp_scifi_charge', b.x, b.y, tAng, 0.6, 2.0, 1.0, { blend: 'lighter' });
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(tAng) * 360, y2: b.y + Math.sin(tAng) * 360, halfW: 28, delay: 0.6, duration: 1.6, timer: 0, dmg: Math.round(b.dmg * 1.42), color: '#ffca28', vfxKey: 'sp_epic_explosion_orange' });
        return true;

      case 'dinastia_sun_disk_barrage':
        Balaclava.Audio.play('slash');
        game.spawnFx('sp_epic_explosion_orange', b.x, b.y, tAng, 0.55, 1.75, 0.95, { blend: 'lighter' });
        for (let k = -2; k <= 2; k++) {
          const a = tAng + k * 0.18;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 360, Math.sin(a) * 360, Math.round(b.dmg * 1.05), '#ffca28', projCfg(true));
        }
        return true;

      // Glaciar Profundo & Cumbre
      case 'glaciar_absolute_zero':
        Balaclava.Audio.play('thunder');
        game.shake(0.4, 10);
        game.spawnShockwave(b.x, b.y, 200, '#00b0ff');
        game.spawnFx('sp_frost_explosion_cyan', b.x, b.y, 0, 0.8, 2.25, 1.0, { blend: 'lighter' });
        if (d < 185) game.damagePlayer(Math.round(b.dmg * 1.35), { status: { kind: 'freeze', dur: 2.0 } });
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 280, Math.sin(a) * 280, Math.round(b.dmg * 0.92), '#80d8ff', projCfg(true));
        }
        return true;

      case 'glaciar_blizzard_rings':
        Balaclava.Audio.play('cast');
        game.spawnFx('sp_spell_defense_blue', b.x, b.y, 0, 0.65, 1.9, 0.95, { blend: 'lighter' });
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * Math.PI * 2 + (b.phaseCycle || 0) * 0.3;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 295, Math.sin(a) * 295, Math.round(b.dmg * 0.9), '#4fc3f7', projCfg(false));
        }
        return true;

      case 'glaciar_ice_spire_cross':
        Balaclava.Audio.play('bomb');
        for (let off of [0, Math.PI / 4]) {
          const fa = tAng + off;
          dung.hazardZones.push({ kind: 'fissure', x: b.x - Math.cos(fa) * 190, y: b.y - Math.sin(fa) * 190, x2: b.x + Math.cos(fa) * 190, y2: b.y + Math.sin(fa) * 190, halfW: 25, delay: 0.62, duration: 1.5, timer: 0, dmg: Math.round(b.dmg * 1.32), color: '#29b6f6', vfxKey: 'sp_frost_explosion_cyan' });
        }
        return true;

      case 'glaciar_polar_shatter':
        Balaclava.Audio.play('cast');
        game.spawnFx('sp_impact_blue', b.x, b.y, tAng, 0.55, 1.9, 1.0, { blend: 'lighter' });
        for (let k = -3; k <= 3; k++) {
          const a = tAng + k * 0.14;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 340, Math.sin(a) * 340, Math.round(b.dmg * 0.98), '#81d4fa', projCfg(true));
        }
        return true;

      case 'glaciar_permafrost_dash':
        Balaclava.Audio.play('slash');
        game.spawnFx('sp_frost_explosion_cyan', b.x, b.y, tAng, 0.5, 1.65, 0.95);
        b.dashTimer = 0.38; b.dashVx = Math.cos(tAng) * 570; b.dashVy = Math.sin(tAng) * 570; b.dashCharges = 1;
        return true;

      // Ciénaga Pútrida
      case 'pantano_miasma_nova':
        Balaclava.Audio.play('curse');
        game.spawnShockwave(b.x, b.y, 180, '#76ff03');
        game.spawnFx('sp_spell_poison_green', b.x, b.y, 0, 0.75, 2.1, 1.0, { blend: 'lighter' });
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 260, Math.sin(a) * 260, Math.round(b.dmg * 0.92), '#aeea00', projCfg(true, { status: { kind: 'poison', dur: 3.5 } }));
        }
        return true;

      case 'pantano_spore_rain':
        Balaclava.Audio.play('cast');
        for (let k = 0; k < 4; k++) {
          const oa = ang + (k / 4) * Math.PI * 2;
          const distP = k === 0 ? 0 : 95;
          dung.hazardZones.push({ kind: 'pool', x: px + Math.cos(oa) * distP, y: py + Math.sin(oa) * distP, radius: 68, delay: 0.5, duration: 3.0, timer: 0, dmg: Math.round(b.dmg * 0.75), color: '#76ff03', vfxKey: 'sp_spell_poison_green', status: { kind: 'poison', dur: 3.0 } });
        }
        return true;

      case 'pantano_sludge_eruption':
        Balaclava.Audio.play('bomb');
        game.spawnFx('sp_skull_smoke', b.x, b.y, 0, 0.7, 1.95, 0.95);
        for (let k = -3; k <= 3; k++) {
          const a = tAng + k * 0.16;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 300, Math.sin(a) * 300, Math.round(b.dmg * 0.98), '#9ccc65', projCfg(false));
        }
        return true;

      case 'pantano_pumpkin_curse':
        Balaclava.Audio.play('curse');
        game.spawnFx('sp_skull_smoke', px, py, 0, 0.75, 1.85, 0.95);
        dung.hazardZones.push({ kind: 'meteor', x: px, y: py, radius: 75, delay: 0.7, duration: 0.55, timer: 0, dmg: Math.round(b.dmg * 1.32), color: '#ff9100', vfxKey: 'sp_epic_explosion_orange' });
        return true;

      case 'pantano_hydra_snap':
        Balaclava.Audio.play('slash');
        game.spawnFx('sp_spell_haste_green', b.x, b.y, tAng, 0.48, 1.85, 0.95, { blend: 'lighter' });
        b.dashTimer = 0.36; b.dashVx = Math.cos(tAng) * 580; b.dashVy = Math.sin(tAng) * 580; b.dashCharges = 2;
        return true;

      // Necrópolis Ósea
      case 'necro_soul_scythe':
        Balaclava.Audio.play('slash');
        game.spawnFx('sp_lightning_strike_violet', b.x, b.y, tAng, 0.55, 1.95, 1.0, { blend: 'lighter' });
        for (let k = -3; k <= 3; k++) {
          const a = tAng + k * 0.15;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 335, Math.sin(a) * 335, Math.round(b.dmg * 1.02), '#ce93d8', projCfg(true));
        }
        return true;

      case 'necro_bone_prison':
        Balaclava.Audio.play('curse');
        game.spawnFx('sp_skull_smoke', px, py, 0, 0.75, 1.9, 0.95);
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2;
          dung.hazardZones.push({ kind: 'meteor', x: px + Math.cos(a) * 78, y: py + Math.sin(a) * 78, radius: 58, delay: 0.68, duration: 0.55, timer: 0, dmg: Math.round(b.dmg * 1.26), color: '#e0e0e0', vfxKey: 'sp_skull_smoke' });
        }
        return true;

      case 'necro_phylactery_nova':
        Balaclava.Audio.play('thunder');
        game.shake(0.38, 10);
        game.spawnShockwave(b.x, b.y, 195, '#b388ff');
        game.spawnFx('sp_spell_absorb_violet', b.x, b.y, 0, 0.75, 2.15, 1.0, { blend: 'lighter' });
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 285, Math.sin(a) * 285, Math.round(b.dmg * 0.94), '#b388ff', projCfg(false));
        }
        return true;

      case 'necro_lich_bolt_fan':
        Balaclava.Audio.play('cast');
        game.spawnFx('sp_lightning_burst_violet', b.x, b.y, tAng, 0.6, 1.85, 0.95, { blend: 'lighter' });
        for (let k = -4; k <= 4; k++) {
          const a = tAng + k * 0.12;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 320, Math.sin(a) * 320, Math.round(b.dmg * 0.92), '#80cbc4', projCfg(true));
        }
        return true;

      case 'necro_spectral_legion':
        Balaclava.Audio.play('curse');
        game.spawnFx('sp_scifi_warp', b.x, b.y, 0, 0.65, 1.9, 0.95, { blend: 'lighter' });
        dung.hazardZones.push({ kind: 'fissure', x: b.x, y: b.y, x2: b.x + Math.cos(tAng) * 350, y2: b.y + Math.sin(tAng) * 350, halfW: 26, delay: 0.6, duration: 1.5, timer: 0, dmg: Math.round(b.dmg * 1.38), color: '#b388ff', vfxKey: 'sp_lightning_burst_violet' });
        return true;

      // Tierras Malditas
      case 'maldita_blood_ritual':
        Balaclava.Audio.play('curse');
        game.shake(0.4, 10);
        game.spawnFx('sp_spell_death_red', b.x, b.y, 0, 0.75, 2.2, 1.0, { blend: 'lighter' });
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 305, Math.sin(a) * 305, Math.round(b.dmg * 0.98), '#ff1744', projCfg(true, { status: { kind: 'burn', dur: 3.0 } }));
        }
        return true;

      case 'maldita_void_collapse':
        Balaclava.Audio.play('thunder');
        game.spawnFx('sp_stylized_explosion_violet', px, py, 0, 0.75, 2.1, 1.0, { blend: 'lighter' });
        dung.hazardZones.push({ kind: 'meteor', x: px, y: py, radius: 84, delay: 0.72, duration: 0.6, timer: 0, dmg: Math.round(b.dmg * 1.48), color: '#aa00ff', vfxKey: 'sp_stylized_explosion_violet' });
        return true;

      case 'maldita_crimson_flail':
        Balaclava.Audio.play('slash');
        game.spawnFx('sp_splatter_red', b.x, b.y, tAng, 0.55, 1.9, 1.0);
        b.dashTimer = 0.36; b.dashVx = Math.cos(tAng) * 610; b.dashVy = Math.sin(tAng) * 610; b.dashCharges = 2;
        return true;

      case 'maldita_harvest_scythes':
        Balaclava.Audio.play('slash');
        game.spawnFx('sp_spell_attack_red', b.x, b.y, tAng, 0.55, 2.0, 1.0, { blend: 'lighter' });
        for (let k = -4; k <= 4; k++) {
          const a = tAng + k * 0.14;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 355, Math.sin(a) * 355, Math.round(b.dmg * 1.04), '#ff5252', projCfg(false));
        }
        return true;

      case 'maldita_abyss_hellfire':
        Balaclava.Audio.play('meteor');
        game.shake(0.45, 11);
        for (let off of [0, Math.PI / 3, -Math.PI / 3]) {
          const fa = tAng + off;
          dung.hazardZones.push({ kind: 'fissure', x: b.x - Math.cos(fa) * 185, y: b.y - Math.sin(fa) * 185, x2: b.x + Math.cos(fa) * 185, y2: b.y + Math.sin(fa) * 185, halfW: 26, delay: 0.62, duration: 1.5, timer: 0, dmg: Math.round(b.dmg * 1.4), color: '#ff1744', vfxKey: 'sp_epic_explosion_orange' });
        }
        return true;

      // ═══════════════════════════════════════════════════════════════
      // JEFE FINAL SUPREMO (#75): ESPADACHÍN CARMESÍ ABISAL (Sword.png 14x8)
      // ═══════════════════════════════════════════════════════════════
      case 'abyssal_crimson_stance_slash':
        Balaclava.Audio.play('slash');
        b.animRow = 5; b.animFrames = 7; b.animFps = 16; b.animLock = 0.55; b.animTimer = 0;
        game.shake(0.32, 8);
        game.spawnFx('sp_spell_attack_red', b.x, b.y, tAng, 0.55, 2.2, 1.0, { blend: 'lighter' });
        game.spawnFx('sp_splatter_red', b.x, b.y, tAng, 0.5, 1.9, 0.95);
        b.dashTimer = 0.34;
        b.dashVx = Math.cos(tAng) * 680;
        b.dashVy = Math.sin(tAng) * 680;
        b.dashCharges = b.phase >= 2 ? 1 : 0;
        for (let k = -3; k <= 3; k++) {
          const a = tAng + k * 0.13;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 390, Math.sin(a) * 390, Math.round(b.dmg * 1.06), '#ff1744', projCfg(false, { radius: 9 }));
        }
        return true;

      case 'abyssal_vortex_whirlwind':
        Balaclava.Audio.play('thunder');
        b.animRow = 4; b.animFrames = 14; b.animFps = 18; b.animLock = 0.85; b.animTimer = 0;
        game.shake(0.48, 12);
        game.spawnShockwave(b.x, b.y, 230, '#ff1744');
        game.spawnFx('sp_spell_death_red', b.x, b.y, 0, 0.85, 2.45, 1.0, { blend: 'lighter' });
        if (d < 175) game.damagePlayer(Math.round(b.dmg * 1.42), { status: { kind: 'burn', dur: 3.0 } });
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * Math.PI * 2 + (b.phaseCycle || 0) * 0.25;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 320, Math.sin(a) * 320, Math.round(b.dmg * 0.98), '#ff1744', projCfg(true));
        }
        return true;

      case 'abyssal_scarlet_aura_burst':
        Balaclava.Audio.play('meteor');
        b.animRow = 3; b.animFrames = 7; b.animFps = 12; b.animLock = 0.70; b.animTimer = 0;
        game.shake(0.45, 11);
        game.spawnFx('sp_epic_explosion_orange', b.x, b.y, 0, 0.75, 2.35, 1.0, { blend: 'lighter' });
        game.spawnFx('sp_lightning_strike_violet', px, py, 0, 0.7, 2.0, 1.0, { blend: 'lighter' });
        for (let k = 0; k < 4; k++) {
          const fa = tAng + (k / 4) * Math.PI;
          dung.hazardZones.push({ kind: 'fissure', x: b.x - Math.cos(fa) * 210, y: b.y - Math.sin(fa) * 210, x2: b.x + Math.cos(fa) * 210, y2: b.y + Math.sin(fa) * 210, halfW: 26, delay: 0.6, duration: 1.6, timer: 0, dmg: Math.round(b.dmg * 1.45), color: '#ff1744', vfxKey: 'sp_spell_death_red' });
        }
        return true;

      case 'abyssal_phantom_cross_step': {
        Balaclava.Audio.play('slash');
        b.animRow = 6; b.animFrames = 2; b.animFps = 14; b.animLock = 0.22; b.animTimer = 0;
        game.spawnFx('sp_scifi_warp', b.x, b.y, 0, 0.45, 1.8, 0.95, { blend: 'lighter' });
        const destX = px + Math.cos(ang) * 96;
        const destY = py + Math.sin(ang) * 96;
        if (isBossWalkable(destX, destY)) { b.x = destX; b.y = destY; }
        const retAng = Math.atan2(py - b.y, px - b.x);
        b.facing = px >= b.x ? 1 : -1;
        b.animRow = 5; b.animFrames = 7; b.animFps = 16; b.animLock = 0.55; b.animTimer = 0;
        game.spawnFx('sp_impact_violet', b.x, b.y, retAng, 0.55, 2.0, 1.0, { blend: 'lighter' });
        for (let k = -2; k <= 2; k++) {
          const a = retAng + k * 0.2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 380, Math.sin(a) * 380, Math.round(b.dmg * 1.12), '#ff5252', projCfg(true));
        }
        return true;
      }

      case 'abyssal_eclipse_judgement':
        Balaclava.Audio.play('meteor');
        Balaclava.Audio.play('thunder');
        b.animRow = 4; b.animFrames = 14; b.animFps = 16; b.animLock = 0.90; b.animTimer = 0;
        game.shake(0.65, 14);
        game.spawnShockwave(b.x, b.y, 260, '#ff1744');
        game.spawnFx('sp_spell_death_red', b.x, b.y, 0, 0.95, 2.6, 1.0, { blend: 'lighter' });
        game.spawnFx('sp_lightning_burst_violet', b.x, b.y, 0, 0.85, 2.4, 1.0, { blend: 'lighter' });
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2;
          game.spawnEnemyProjectile(b.x, b.y, Math.cos(a) * 340, Math.sin(a) * 340, Math.round(b.dmg * 1.05), '#ff1744', projCfg(true, { status: { kind: 'burn', dur: 3.5 } }));
        }
        for (let m = 0; m < 5; m++) {
          const ma = (m / 5) * Math.PI * 2 + ang;
          const mDist = m === 0 ? 0 : 110;
          dung.hazardZones.push({ kind: 'meteor', x: px + Math.cos(ma) * mDist, y: py + Math.sin(ma) * mDist, radius: 72, delay: 0.72, duration: 0.65, timer: 0, dmg: Math.round(b.dmg * 1.55), color: '#ff1744', vfxKey: 'sp_stylized_explosion_violet' });
        }
        return true;

      default:
        return false;
    }
  }

  class DungeonInstance {
    /** Compute final boss HP (x30) and DMG (x10) consistently for spawning and transition previews. */
    static computeBossStats(def, tier, playerLevel = 1, opts = {}) {
      const d = def || DUNGEON_DEFS.pradera;
      const b = d.boss || { hp: 500, dmg: 20 };
      const t = Math.max(0, tier || 0);
      const pLv = Math.max(1, playerLevel || 1);
      const levelScale = 1 + Math.max(0, pLv - (1 + t * 2)) * 0.10;
      const tierProgress = Math.min(1, t / Math.max(1, DUNGEON_TIER_LIST.length - 1));
      const isCorrupted = Boolean(opts && opts.isCorrupted);
      const isLate = LATE_BIOME_DUNGEONS.has(d.id);
      const ab = opts && opts.abyssScale;
      const abHp = ab ? (ab.hp || 1) : 1;
      const abDmg = ab ? (ab.dmg || 1) : 1;

      let bossHpMult = (1.65 + tierProgress * 0.45) * 30 * (isCorrupted ? 24 : 1) * abHp;
      let bossDmgMult = (1.25 + tierProgress * 0.25) * 10 * (isCorrupted ? 6.8 : 1) * abDmg;
      if (isLate) {
        bossHpMult *= 5.0;
        bossDmgMult *= 2.6;
      }
      const hp = Math.min(9e14, Math.round(b.hp * bossHpMult * levelScale));
      const dmg = Math.min(9e12, Math.round(b.dmg * bossDmgMult * (1 + (levelScale - 1) * 0.65)));
      return { hp, maxHp: hp, dmg };
    }

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
      this.isLateBiome = LATE_BIOME_DUNGEONS.has(this.id);
      this.wingsOpen = false;
      this.vaultOpen = false;
      this.miniBossDefeated = false;
      this.miniBoss2Defeated = false;
      this.seqProgress = 0; // 0 -> 1 -> 2 -> 3 (or 4 in late biomes)
      this.seqTarget = this.isLateBiome ? 4 : 3;
      this.shrineProgress = 0;
      this.shrineTarget = this.isLateBiome ? 2 : 0;
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
      let miniBoss2Spot = null;
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
        addRoom('Arena del Señor', 53, 10, 73, 27);

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
        addRoom('Cripta Áurea', 47, 2, 49, 7);
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
        addRoom('Santuario del Jefe', 54, 10, 73, 27);

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
        addRoom('Tesoro Oculto Norte', 46, 2, 49, 7);
        addDoors(this.wingDoorTiles, 26, 19, 28, 19, 5);
        addRoom('Salón de Hierro Sur', 26, 20, 35, 28);
        carveRect(36, 24, 37, 26);
        addRoom('Salón del Guardián', 38, 24, 46, 35);
        carveRect(31, 13, 35, 15);
        addRoom('Galería de las Antorchas', 36, 10, 44, 18);
        carveRect(45, 14, 46, 16);
        addRoom('Vestíbulo Final', 47, 13, 52, 22);
        addDoors(this.bossGateTiles, 53, 16, 53, 20, 3);
        addRoom('Trono del Señor', 54, 10, 73, 27);

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
        torchCandidates = [[3,4],[7,4],[3,14],[4,24],[11,24],[19,21],[21,10],[22,2],[36,2],[48,2],[28,20],[40,24],[38,10],[48,13],[57,8],[65,8]];
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
        addRoom('Santuario I-II-III', 31, 2, 42, 7);
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
        addRoom('Gran Arena Abisal', 54, 10, 73, 27);

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
        addRoom('Galería Superior Oeste', 14, 6, 19, 13);
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
        addRoom('Salón del Trono', 53, 10, 73, 27);

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
        addRoom('Sala de Secuencia Celeste', 37, 2, 45, 10);
        addDoors(this.vaultDoorTiles, 46, 4, 46, 6, 6);
        addRoom('Sagrario de Tesoros', 47, 2, 49, 7);
        addDoors(this.wingDoorTiles, 28, 26, 30, 26, 5);
        addRoom('Claustro Inferior', 22, 27, 33, 32);
        carveRect(34, 29, 36, 31);
        addRoom('Salón del Guardián Real', 37, 27, 47, 36);
        carveRect(34, 15, 37, 17);
        carveRect(34, 21, 37, 23);
        addRoom('Puente Gemelo Este', 38, 13, 45, 25);
        carveRect(46, 18, 47, 20);
        addRoom('Antesala Sagrada', 48, 15, 52, 23);
        addDoors(this.bossGateTiles, 53, 17, 53, 21, 3);
        addRoom('Basílica del Soberano', 54, 10, 73, 27);

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
        torchCandidates = [[3,16],[12,14],[26,13],[23,6],[38,2],[49,2],[23,27],[38,27],[39,13],[49,15],[57,8],[66,8]];
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
        addRoom('Vestíbulo de la Tormenta', 41, 14, 51, 23);
        addDoors(this.bossGateTiles, 52, 17, 52, 21, 3);
        addRoom('Cámara del Emperador', 53, 10, 73, 27);

        this.bossRoomMinX = 52;
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
        carpetBoxes = [[4, 8, 18, 8], [18, 8, 18, 20], [18, 20, 51, 20], [53, 18, 70, 20]];
        trapCandidates = [[10,8],[16,7],[21,9],[16,19],[24,18],[21,31],[25,33],[33,5],[38,6],[30,17],[34,21],[43,16],[47,21]];
        pillarCandidates = [[15,6],[21,6],[16,18],[24,18],[16,23],[24,23],[18,30],[26,30],[30,15],[34,22],[43,15],[48,22],[57,11],[68,11],[57,27],[68,27]];
        torchCandidates = [[3,5],[14,4],[15,16],[16,28],[33,27],[30,2],[44,2],[42,14],[55,8],[64,8],[70,8]];
        propCandidates = [[2,11,'urn'],[7,6,'urnGold'],[44,7,'urnGold'],[50,3,'urnGold'],[17,35,'sarcophagus'],[34,35,'sarcophagus'],[54,9,'sarcophagus'],[54,29,'sarcophagus'],[71,19,'altarRitual']];
        mobSpots = [[15,9,1.02],[20,7,1.1],[18,20,1.2],[23,21,1.25],[21,32,1.3],[35,31,1.4],[32,6,1.35],[38,5,1.38],[31,19,1.42],[44,17,1.48],[47,20,1.52]];
      }

      // === EXPANSION: Late-Biome Additional Rooms, Puzzles & Second Guardian ===
      if (this.isLateBiome) {
        // Carve Room A: Santuario del Segundo Guardián (x: 54..64, y: 1..6)
        // Connect cleanly down column x=51 (between Vault <=49 and Boss Arena >=53) into Antesala (y=15)
        carveRect(54, 1, 64, 6, 1);
        addRoom('Santuario del Segundo Guardián', 54, 1, 64, 6);
        carveRect(51, 3, 54, 5, 1);
        carveRect(51, 5, 51, 15, 1);

        // Carve Room B: Santuario de los Sellos Abisales (x: 54..63, y: 31..36)
        // Connect from x=40 so it links inside EVERY archetype's South Guardian room cleanly
        carveRect(54, 31, 63, 36, 1);
        addRoom('Santuario de los Sellos Abisales', 54, 31, 63, 36);
        carveRect(40, 32, 54, 34, 1);

        // Carve Room C: Bóveda de los Arcanos Mayores (x: 65..72, y: 31..36)
        carveRect(65, 31, 72, 36, 1);
        addRoom('Bóveda de los Arcanos Mayores', 65, 31, 72, 36);
        carveRect(63, 32, 65, 34, 1);

        // Enforce 3-tile solid stone barrier between North/South wings and Boss Arena (preserving x=51 North corridor)
        carveRect(52, 7, 74, 9, 0);
        carveRect(52, 28, 74, 30, 0);

        this.miniBoss2ChestPos = { tx: 63, ty: 2 };
        miniBoss2Spot = { tx: 59, ty: 4 };

        // Add 2 Elemental Shrines to this.runes
        this.runes.push({
          id: 'shrine_1',
          tx: 62,
          ty: 4,
          active: false,
          kind: 'elemental_shrine',
          label: 'ALTAR I',
          shrineIdx: 1
        });
        this.runes.push({
          id: 'shrine_2',
          tx: 58,
          ty: 33,
          active: false,
          kind: 'elemental_shrine',
          label: 'ALTAR II',
          shrineIdx: 2
        });

        // Add 4th rune inside the pre-Vault Enigma Chamber (NEVER inside the locked Vault)
        const seqRunes = this.runes.filter(r => r.kind === 'seq');
        const seq4Spots = [[36, 3], [40, 8], [39, 3], [37, 7], [40, 8], [41, 8], [35, 3]];
        const s4 = seq4Spots[arch] || [36, 4];
        if (seqRunes.length >= 3 && !this.runes.some(r => r.id === 'seq_4')) {
          this.runes.push({
            id: 'seq_4',
            tx: s4[0],
            ty: s4[1],
            active: false,
            kind: 'seq',
            order: 4,
            label: 'RUNA IV'
          });
        }

        // Add bonus chests in Bóveda de los Arcanos Mayores
        this.chests.push({ tx: 68, ty: 32, opened: false, bonus: true, chestTheme: this.def.chestTheme || 'gold' });
        this.chests.push({ tx: 70, ty: 34, opened: false, bonus: true, chestTheme: this.def.chestTheme || 'gold' });

        // Add mob spots for extra rooms
        mobSpots.push([58, 3, 1.8], [61, 5, 1.8], [57, 32, 1.85], [60, 34, 1.85], [67, 33, 1.9], [69, 32, 1.95]);

        // Add torches and props for extra rooms
        torchCandidates.push([55, 1], [63, 1], [55, 31], [62, 31], [66, 31], [71, 31]);
        propCandidates.push([56, 6, 'urnGold'], [62, 6, 'urnGold'], [68, 35, 'sarcophagus'], [70, 32, 'urnGold']);
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
        if (this.miniBoss2ChestPos) this.miniBoss2ChestPos.ty = flipY(this.miniBoss2ChestPos.ty);
        if (miniBoss2Spot) miniBoss2Spot.ty = flipY(miniBoss2Spot.ty);
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
      if (this.isLateBiome && miniBoss2Spot) {
        this.enemies.push(this.makeMiniBoss2(types[2 % types.length], miniBoss2Spot.tx, miniBoss2Spot.ty));
      }

      // Grand 3-Phase Boss in Arena (ALL bosses scaled x30 HP and x10 DMG)
      const b = this.def.boss;
      const bossStats = DungeonInstance.computeBossStats(this.def, this.tier, this.playerLevel, {
        isCorrupted: this.isCorrupted,
        abyssScale: this.abyssScale
      });
      const abSpd = this.abyssScale ? this.abyssScale.speed : 1;
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
        hp: bossStats.hp,
        maxHp: bossStats.maxHp,
        dmg: bossStats.dmg,
        speed: Math.min(260, Math.round(b.speed * (this.isLateBiome ? 1.25 : 1.0) * (this.isCorrupted ? 1.25 : 1.0) * abSpd)),
        color: this.abyssFloor ? '#e040fb' : (this.isCorrupted ? '#ab47bc' : b.color),
        facing: -1,
        radius: 34,
        hitW: 78,
        hitH: 86,
        bodyOffY: 30,
        phase: 1,
        phaseCycle: 0,
        attackTimer: this.isLateBiome ? 0.75 : (this.isCorrupted ? 0.85 : 1.25),
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
        animRow: 0,
        animTimer: 0,
        animLock: 0,
        animFps: 8,
        animFrames: 7,
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

      // 6 permutations of [1, 2, 3] for 3 pads, and permutations for 4 pads
      const perms = [
        [2, 3, 1],
        [3, 1, 2],
        [2, 1, 3],
        [1, 3, 2],
        [3, 2, 1],
        [1, 2, 3]
      ];
      const perms4 = [
        [2, 4, 1, 3],
        [3, 1, 4, 2],
        [4, 2, 3, 1],
        [1, 3, 2, 4],
        [2, 1, 4, 3]
      ];
      // Prefer non-trivial permutations so the player reads the environmental clue rather than blindly walking left-to-right
      const permIdx = Math.floor((rng ? rng() : 0.2) * 5) % 5;
      const seqRunes = this.runes.filter(r => r.kind === 'seq');
      const chosenPerm = seqRunes.length >= 4 ? perms4[permIdx % perms4.length] : perms[permIdx];

      const crestDefs = [
        { code: 'SOL', crestName: 'SELLO DEL SOL', glyph: 'S', color: '#ffb74d' },
        { code: 'LUNA', crestName: 'SELLO DE LA LUNA', glyph: 'L', color: '#81d4fa' },
        { code: 'ESTRELLA', crestName: 'SELLO ASTRAL', glyph: 'E', color: '#ce93d8' },
        { code: 'COMETA', crestName: 'SELLO DEL COMETA', glyph: 'C', color: '#69f0ae' }
      ];
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

      // Place an inspectable Ancient Runic Tablet strictly inside the sequence puzzle chamber (never inside the locked vault)
      const seqRef = seqRunes[0];
      const enigmaRoom = seqRef && this.rooms.find(rm => seqRef.tx >= rm.x0 && seqRef.tx <= rm.x1 && seqRef.ty >= rm.y0 && seqRef.ty <= rm.y1);
      const isTabletTileValid = (cx, cy) => {
        if (!this.grid[cy] || this.grid[cy][cx] !== 1) return false;
        if (enigmaRoom && (cx < enigmaRoom.x0 || cx > enigmaRoom.x1 || cy < enigmaRoom.y0 || cy > enigmaRoom.y1)) return false;
        if (this.runes.some(r => r.tx === cx && r.ty === cy)) return false;
        if (this.chests.some(c => c.tx === cx && c.ty === cy)) return false;
        return true;
      };
      let tabX = Math.max(2, Math.min(W - 3, avgX - 2));
      let tabY = Math.max(2, Math.min(H - 3, avgY + 1));
      let foundTab = false;
      const candidateOffsets = [
        [0, 1], [-2, 1], [2, 1], [0, -1], [-1, 1], [1, 1], [-3, 0], [3, 0], [-1, 0], [1, 0], [0, 0]
      ];
      for (const [ox, oy] of candidateOffsets) {
        const cx = avgX + ox;
        const cy = avgY + oy;
        if (isTabletTileValid(cx, cy)) {
          tabX = cx;
          tabY = cy;
          foundTab = true;
          break;
        }
      }
      if (!foundTab && enigmaRoom) {
        for (let cy = enigmaRoom.y0; cy <= enigmaRoom.y1 && !foundTab; cy++) {
          for (let cx = enigmaRoom.x0; cx <= enigmaRoom.x1 && !foundTab; cx++) {
            if (isTabletTileValid(cx, cy)) {
              tabX = cx;
              tabY = cy;
              foundTab = true;
            }
          }
        }
      }

      const romanSeqList = orderedSeq.map((_, i) => (i === 0 ? 'I' : i === 1 ? 'II' : i === 2 ? 'III' : 'IV')).join(' -> ');
      const numSeqList = orderedSeq.map((_, i) => String(i + 1)).join(' -> ');
      const modeDescriptions = {
        flames_count: {
          title: 'ESTELA DE LAS LLAMAS RITUALES',
          shortHint: `Cuenta las llamas junto a cada sello (${numSeqList})`,
          hintText: `Rito de las Llamas: Activa los sellos segun el numero de flamas encendidas junto a cada pedestal (${romanSeqList}: ${orderSummary}).`
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
          shortHint: `Cuenta las muescas luminosas de cada obelisco (${romanSeqList})`,
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

    _bfsReachable(sx, sy, blockedTileValues) {
      const W = this.width;
      const H = this.height;
      const blocked = blockedTileValues instanceof Set ? blockedTileValues : new Set(blockedTileValues || []);
      const visited = new Set();
      const t0 = this.grid[sy] && this.grid[sy][sx];
      if (!t0 || blocked.has(t0)) return visited;
      const queue = [[sx, sy]];
      visited.add(`${sx},${sy}`);
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        for (const [dx, dy] of dirs) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx <= 0 || nx >= W - 1 || ny <= 0 || ny >= H - 1) continue;
          const key = `${nx},${ny}`;
          if (visited.has(key)) continue;
          const cell = this.grid[ny] && this.grid[ny][nx];
          if (!cell || blocked.has(cell)) continue;
          visited.add(key);
          queue.push([nx, ny]);
        }
      }
      return visited;
    }

    _enforceDoorEnclosures() {
      const W = this.width;
      const H = this.height;
      const applyDoorGroup = (tiles, val) => {
        if (!Array.isArray(tiles) || tiles.length === 0) return;
        const coordSet = new Set(tiles.map(([x, y]) => `${x},${y}`));
        for (const [gx, gy] of tiles) {
          if (this.grid[gy] && gx > 0 && gx < W - 1 && gy > 0 && gy < H - 1) {
            this.grid[gy][gx] = val;
          }
          const leftSame = coordSet.has(`${gx - 1},${gy}`);
          const rightSame = coordSet.has(`${gx + 1},${gy}`);
          const upSame = coordSet.has(`${gx},${gy - 1}`);
          const downSame = coordSet.has(`${gx},${gy + 1}`);
          if ((leftSame || rightSame) && !upSame && !downSame) {
            if (!leftSame && this.grid[gy] && gx - 1 >= 0) this.grid[gy][gx - 1] = 0;
            if (!rightSame && this.grid[gy] && gx + 1 < W) this.grid[gy][gx + 1] = 0;
          } else if ((upSame || downSame) && !leftSame && !rightSame) {
            if (!upSame && this.grid[gy - 1]) this.grid[gy - 1][gx] = 0;
            if (!downSame && this.grid[gy + 1]) this.grid[gy + 1][gx] = 0;
          }
        }
      };
      applyDoorGroup(this.wingDoorTiles, 5);
      applyDoorGroup(this.vaultDoorTiles, 6);
      applyDoorGroup(this.bossGateTiles, 3);
    }

    _checkAllProgressionInvariants(spawnTile = null) {
      const st = spawnTile || (this.spawnPos ? { tx: Math.floor(this.spawnPos.x / TILE_SIZE), ty: Math.floor(this.spawnPos.y / TILE_SIZE) } : { tx: 4, ty: 19 });
      const v0 = this._bfsReachable(st.tx, st.ty, [3, 5, 6]);
      const v1 = this._bfsReachable(st.tx, st.ty, [3, 6]);
      const v2 = this._bfsReachable(st.tx, st.ty, [3]);

      for (const r of this.runes) {
        if (r.kind === 'wing' && !v0.has(`${r.tx},${r.ty}`)) return false;
        if ((r.kind === 'seq' || r.kind === 'elemental_shrine') && !v1.has(`${r.tx},${r.ty}`)) return false;
      }
      if (this.puzzleTablet && !v1.has(`${this.puzzleTablet.tx},${this.puzzleTablet.ty}`)) return false;
      for (const c of this.chests) {
        if (!v2.has(`${c.tx},${c.ty}`)) return false;
      }
      // Every door tile must actually block entry to at least one unvisited floor tile in its locking phase
      const checkNotBypassable = (tiles, vis) => {
        if (!Array.isArray(tiles) || tiles.length === 0) return true;
        for (const [gx, gy] of tiles) {
          let blockedSide = 0;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const t = this.grid[gy + dy] && this.grid[gy + dy][gx + dx];
            if ((t === 1 || t === 2 || t === 4) && !vis.has(`${gx + dx},${gy + dy}`)) blockedSide++;
          }
          if (blockedSide === 0) return false;
        }
        return true;
      };
      if (!checkNotBypassable(this.wingDoorTiles, v0)) return false;
      if (!checkNotBypassable(this.vaultDoorTiles, v1)) return false;
      if (!checkNotBypassable(this.bossGateTiles, v2)) return false;
      return true;
    }

    /**
     * Validate via multi-phase BFS flood-fill that all puzzle elements are reachable BEFORE the gates they unlock,
     * and that every gate is enclosed by walls with zero bypass paths.
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

      this._enforceDoorEnclosures();

      // Re-verify Phase 1 reachability for puzzleTablet & seq runes (never trapped in isolated tiles)
      const st = spawnTile || (this.spawnPos ? { tx: Math.floor(this.spawnPos.x / TILE_SIZE), ty: Math.floor(this.spawnPos.y / TILE_SIZE) } : { tx: 4, ty: 19 });
      const v1 = this._bfsReachable(st.tx, st.ty, [3, 6]);
      if (this.puzzleTablet && !v1.has(`${this.puzzleTablet.tx},${this.puzzleTablet.ty}`)) {
        const seq0 = this.runes.find(r => r.kind === 'seq' && v1.has(`${r.tx},${r.ty}`));
        if (seq0) {
          outer: for (let r = 1; r <= 3; r++) {
            for (let dy = -r; dy <= r; dy++) {
              for (let dx = -r; dx <= r; dx++) {
                const cx = seq0.tx + dx, cy = seq0.ty + dy;
                if (v1.has(`${cx},${cy}`) && this.grid[cy][cx] === 1 && !this.runes.some(rn => rn.tx === cx && rn.ty === cy)) {
                  this.puzzleTablet.tx = cx;
                  this.puzzleTablet.ty = cy;
                  break outer;
                }
              }
            }
          }
        }
      }
    }

    validateLayoutStrictly(spawnTile = null) {
      const W = this.width;
      const H = this.height;
      const bossMinX = this.bossRoomMinX || 51;
      const st = spawnTile || (this.spawnPos ? { tx: Math.floor(this.spawnPos.x / TILE_SIZE), ty: Math.floor(this.spawnPos.y / TILE_SIZE) } : { tx: 4, ty: 19 });

      this._enforceDoorEnclosures();

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
            if (nx >= bossMinX && (ny >= 9 && ny <= 29)) {
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
      return leaks === 0 && this._checkAllProgressionInvariants(st);
    }

    /**
     * Point 12: Procedurally vary room silhouettes, carve bonus side crypts/alcoves,
     * and randomize pillar/hazard formations per run while strictly preserving door walls and puzzles.
     */
    applyProceduralLayoutVariations(rng, ctx) {
      const W = this.width;
      const H = this.height;
      const { arch, mirroredY, spawnTile, portal, trapCandidates, pillarCandidates, torchCandidates, propCandidates, mobSpots } = ctx;
      const gridBackup = this.grid.map(row => new Uint8Array(row));
      const allDoorCoords = [...this.wingDoorTiles, ...this.vaultDoorTiles, ...this.bossGateTiles];
      const nearAnyDoor = (tx, ty, pad = 2) => allDoorCoords.some(([dx, dy]) => Math.abs(tx - dx) <= pad && Math.abs(ty - dy) <= pad);
      const protectedTiles = new Set([
        `${spawnTile.tx},${spawnTile.ty}`,
        `${portal.tx},${portal.ty}`,
        ...this.runes.map(r => `${r.tx},${r.ty}`),
        ...this.chests.map(c => `${c.tx},${c.ty}`),
        ...allDoorCoords.map(([x, y]) => `${x},${y}`)
      ]);
      const isProtected = (tx, ty) => protectedTiles.has(`${tx},${ty}`) || nearAnyDoor(tx, ty, 2);

      const cornerStyle = ['beveled', 'alcoved', 'colonnade'][Math.floor(rng() * 3)];
      const hazardStyle = ['spiked', 'staggered', 'lean'][Math.floor(rng() * 3)];
      let sideChambers = 0;

      // 1. Bevel or carve side alcoves on medium/large non-boss, non-vault rooms
      for (const rm of this.rooms) {
        if (rm.x1 >= this.bossRoomMinX - 4) continue;
        if (/Bóveda|Tesoro|Cripta Áurea|Archivo|Sagrario/i.test(rm.name || '')) continue;
        const rw = rm.x1 - rm.x0 + 1;
        const rh = rm.y1 - rm.y0 + 1;
        if (rw >= 7 && rh >= 6) {
          if (cornerStyle === 'beveled' && rw >= 8 && rh >= 7 && rng() < 0.7) {
            const corners = [
              [rm.x0, rm.y0, -1, -1],
              [rm.x1, rm.y0, 1, -1],
              [rm.x0, rm.y1, -1, 1],
              [rm.x1, rm.y1, 1, 1]
            ];
            for (const [cx, cy, ox, oy] of corners) {
              if (
                !isProtected(cx, cy) &&
                Math.hypot(cx - spawnTile.tx, cy - spawnTile.ty) > 2.5 &&
                (!this.grid[cy] || this.grid[cy][cx + ox] === 0) &&
                (!this.grid[cy + oy] || this.grid[cy + oy][cx] === 0)
              ) {
                this.grid[cy][cx] = 0;
              }
            }
          } else if (cornerStyle === 'alcoved' && rng() < 0.65) {
            const ax = rm.cx;
            const ayTop = rm.y0 - 1;
            const ayBot = rm.y1 + 1;
            const canCarveAlcove = (tx, ty, dirY) => {
              if (tx >= this.bossRoomMinX - 4 || ty <= 1 || ty >= H - 2) return false;
              if (!this.grid[ty] || this.grid[ty][tx] !== 0) return false;
              if (nearAnyDoor(tx, ty, 3)) return false;
              if (tx >= this.bossRoomMinX - 3 && ty >= 7 && ty <= 30) return false;
              // Require ALL neighbors outside the originating room to be solid wall (never bridge across a 1-tile wall)
              for (let ny = ty - 1; ny <= ty + 1; ny++) {
                for (let nx = tx - 1; nx <= tx + 1; nx++) {
                  const inOriginRoom = nx >= rm.x0 && nx <= rm.x1 && ny >= rm.y0 && ny <= rm.y1;
                  if (inOriginRoom) continue;
                  if (!this.grid[ny] || this.grid[ny][nx] !== 0) return false;
                }
              }
              return true;
            };
            if (canCarveAlcove(ax, ayTop, -1)) {
              this.grid[ayTop][ax] = 1;
              if (rng() < 0.6) propCandidates.push([ax, ayTop, rng() < 0.5 ? 'barrel' : 'urn']);
            }
            if (canCarveAlcove(ax, ayBot, 1)) {
              this.grid[ayBot][ax] = 1;
              if (rng() < 0.6) torchCandidates.push([ax, ayBot]);
            }
          }
        }
      }

      // 2. Carve 1-2 bonus procedural side crypts connected to existing rooms (never bypassing locked gates or approaching boss)
      const candidates = this.rooms.filter(rm => rm.x0 > 6 && rm.x1 < this.bossRoomMinX - 8 && !/Bóveda|Tesoro|Cripta Áurea|Archivo|Sagrario/i.test(rm.name || ''));
      for (let attempt = 0; attempt < 6 && sideChambers < 2 && candidates.length > 0; attempt++) {
        const rm = candidates[Math.floor(rng() * candidates.length)];
        const dirY = rng() < 0.5 ? -1 : 1;
        const sx0 = Math.max(2, rm.cx - 2);
        const sx1 = Math.min(this.bossRoomMinX - 6, rm.cx + 2);
        const syBase = dirY < 0 ? rm.y0 - 4 : rm.y1 + 2;
        const sy0 = Math.max(2, syBase);
        const sy1 = Math.min(H - 3, syBase + 2);
        const doorY = dirY < 0 ? rm.y0 - 1 : rm.y1 + 1;
        if (sy1 - sy0 < 2 || sx1 - sx0 < 3 || sx1 >= this.bossRoomMinX - 5) continue;
        if (nearAnyDoor(rm.cx, doorY, 3)) continue;

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
        this.grid[doorY][rm.cx] = 1;
        torchCandidates.push([sx0, sy0]);
        propCandidates.push([sx1, sy1, rng() < 0.5 ? 'urn' : 'barrel']);
        if (rng() < 0.7) mobSpots.push([rm.cx, Math.floor((sy0 + sy1) / 2), 1.15]);
        sideChambers++;
      }

      // Guard: if any procedural mutation broke door enclosures or puzzle reachability, roll back grid edits cleanly
      if (!this._checkAllProgressionInvariants(spawnTile)) {
        this.grid = gridBackup;
        sideChambers = 0;
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
        this.bossChestOpened = true;
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
      let hp = Math.min(9e14, Math.round((base.hp || 35) * 1.85 * powerScale * tierMult * hpMult * cMultHp));
      let dmg = Math.min(9e12, Math.round((base.dmg || 8) * 1.35 * (1 + (tierMult - 1) * 0.58) * dmgMult * cMultDmg));
      let speed = Math.min(220, Math.round((base.speed || 65) * 1.12 * abSpd));
      let atkCd = 0.65 + Math.random() * 0.35;
      if (this.isLateBiome) {
        hp = Math.round(hp * 3.0); // at least x3 HP in late biomes
        dmg = Math.round(dmg * 3.0); // at least x3 damage in late biomes
        speed = Math.min(240, Math.round(speed * 1.22));
        atkCd *= 0.70;
      }
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
        speed,
        facing: -1,
        radius: 20,
        hitW: 44,
        hitH: 50,
        bodyOffY: 17,
        hitFlash: 0,
        atkCd,
        xpMult: 1.45
      };
    }

    makeMiniBoss(type, tx, ty) {
      const m = this.makeMob(type, tx, ty, 3.2);
      const tierProgress = Math.min(1, this.tier / Math.max(1, DUNGEON_TIER_LIST.length - 1));
      m.isMiniBoss = true;
      m.name = `Guardián ${m.name}`;
      m.hp = Math.max(m.hp, Math.round(this.def.boss.hp * (0.48 + tierProgress * 0.14)));
      m.dmg = Math.round(Math.max(m.dmg, this.def.boss.dmg * (0.82 + tierProgress * 0.14)));
      m.speed = Math.max(m.speed, 84 + Math.round(tierProgress * 20));
      if (this.isLateBiome) {
        // makeMob() already applies x3.0 HP/DMG for late biomes; apply only a modest elite bonus here
        m.hp = Math.round(m.hp * 1.45);
        m.dmg = Math.round(m.dmg * 1.25);
        m.speed = Math.min(250, Math.round(m.speed * 1.15));
      }
      m.maxHp = m.hp;
      m.radius = 25;
      m.hitW = 54;
      m.hitH = 60;
      m.bodyOffY = 22;
      m.level = this.tier * 2 + 4;
      m.xpMult = 3.0;
      m.telegraph = 0;
      m.telegraphMode = null;
      m.specialCd = this.isLateBiome ? 1.5 : 2.4;
      m.miniCycle = 0;
      m.enraged = false;
      return m;
    }

    makeMiniBoss2(type, tx, ty) {
      const m = this.makeMiniBoss(type, tx, ty);
      m.isMiniBoss2 = true;
      m.name = `Segundo Centinela Ancestral: ${m.name.replace('Guardián ', '')}`;
      m.hp = Math.round(m.hp * 1.15);
      m.maxHp = m.hp;
      m.dmg = Math.round(m.dmg * 1.1);
      m.speed = Math.round(m.speed * 1.05);
      return m;
    }

    onMiniBossDefeated(game, enemy) {
      if (enemy && enemy.isMiniBoss2) {
        if (this.miniBoss2Defeated) return;
        this.miniBoss2Defeated = true;
        const mc = this.miniBoss2ChestPos || { tx: 59, ty: 5 };
        this.chests.push({ tx: mc.tx, ty: mc.ty, opened: false, bonus: true, chestTheme: this.def.chestTheme || 'gold' });
        game.addFloatingText(mc.tx * TILE_SIZE, mc.ty * TILE_SIZE - 16, '¡Segundo Guardián Derrotado!', '#ffd54f');
        game.toast('¡El Segundo Guardián Ancestral ha caído! Un nuevo sello cede.', 'success');
        this.checkBossGateUnlock(game);
        return;
      }
      if (this.miniBossDefeated) {
        if (!this.miniBoss2Defeated && this.isLateBiome) {
          this.miniBoss2Defeated = true;
          const mc = this.miniBoss2ChestPos || { tx: 59, ty: 5 };
          this.chests.push({ tx: mc.tx, ty: mc.ty, opened: false, bonus: true, chestTheme: this.def.chestTheme || 'gold' });
          game.addFloatingText(mc.tx * TILE_SIZE, mc.ty * TILE_SIZE - 16, '¡Segundo Guardián Derrotado!', '#ffd54f');
          game.toast('¡El Segundo Guardián Ancestral ha caído! Un nuevo sello cede.', 'success');
          this.checkBossGateUnlock(game);
        }
        return;
      }
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
      const isLate = this.isLateBiome;
      const reqVault = this.vaultOpen;
      const reqMini1 = this.miniBossDefeated;
      const reqMini2 = !isLate || this.miniBoss2Defeated;
      const reqShrines = !isLate || ((this.shrineProgress || 0) >= (this.shrineTarget || 0));

      if (reqVault && reqMini1 && reqMini2 && reqShrines) {
        this.gateOpen = true;
        const gates = (this.bossGateTiles && this.bossGateTiles.length > 0)
          ? this.bossGateTiles
          : [[34, 14], [34, 15], [34, 16]];
        for (const [gx, gy] of gates) {
          if (this.grid[gy]) this.grid[gy][gx] = 1;
        }
        Balaclava.Audio.play('portal');
        const msg = isLate
          ? '¡Todos los Sellos, Guardianes y Altares han caído! La Gran Puerta del Jefe se abre.'
          : (Balaclava.I18n ? Balaclava.I18n.t('dungeon.bothSealsOpen') : '¡Los Sellos Norte y Sur ceden! La Gran Puerta del Jefe se abre.');
        game.toast(msg, 'success');
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
      if (this.deadBossGhost) {
        this.deadBossGhost.timer += dt;
        if (this.deadBossGhost.timer >= this.deadBossGhost.dur) this.deadBossGhost = null;
      }
      this.trapTimer += dt;
      if (this.trapTimer >= 1.85) {
        this.trapTimer = 0;
        this.trapsActive = !this.trapsActive;
      }

      const ptx = Math.floor(game.player.x / TILE_SIZE);
      const pty = Math.floor(game.player.y / TILE_SIZE);

      // Trap damage (scaled x3 in late biomes 3, 4, 5)
      if (this.trapsActive && this.grid[pty] && this.grid[pty][ptx] === 2) {
        game.damagePlayer(this.def.boss.dmg * 0.45 * (this.isLateBiome ? 3.0 : 1.0));
      }

      // Boss gate status proximity check
      if (!this.gateOpen && this.bossGateTiles && this.bossGateTiles.length > 0) {
        const g0 = this.bossGateTiles[0];
        const distGate = Math.hypot(ptx - g0[0], pty - g0[1]);
        if (distGate <= 3.2) {
          this._gatePromptTimer = (this._gatePromptTimer || 0) + dt;
          if (this._gatePromptTimer >= 2.5) {
            this._gatePromptTimer = 0;
            if (this.isLateBiome) {
              const vSt = this.vaultOpen ? 'OK' : 'FALTA';
              const g1St = this.miniBossDefeated ? 'OK' : 'FALTA';
              const g2St = this.miniBoss2Defeated ? 'OK' : 'FALTA';
              const shSt = `${this.shrineProgress || 0}/${this.shrineTarget || 2}`;
              game.toast(`Puerta Sellada: Boveda [${vSt}] | Guardian 1 [${g1St}] | Guardian 2 [${g2St}] | Altares [${shSt}]`, 'info');
            } else {
              const vSt = this.vaultOpen ? 'OK' : 'FALTA';
              const gSt = this.miniBossDefeated ? 'OK' : 'FALTA';
              game.toast(`Puerta Sellada: Boveda [${vSt}] | Guardian [${gSt}]`, 'info');
            }
          }
        } else {
          this._gatePromptTimer = 2.0;
        }
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
        if (r.id === 'seq_4') return 'RUNA IV';
        if (r.kind === 'elemental_shrine') return `ALTAR ELEMENTAL ${r.shrineIdx || 1}`;
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
        } else if (r.kind === 'elemental_shrine' && !r.active) {
          r.active = true;
          this.shrineProgress = (this.shrineProgress || 0) + 1;
          Balaclava.Audio.play('chest');
          game.spawnParticles(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE + 24, '#ff9800', 16);
          game.addFloatingText(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE, `¡Altar Elemental [${this.shrineProgress}/${this.shrineTarget}]!`, '#ff9800');
          game.toast(`¡Sello Elemental activado! (${this.shrineProgress}/${this.shrineTarget})`, 'success');
          this.checkBossGateUnlock(game);
        } else if (r.kind === 'seq' && !this.vaultOpen && !r.active) {
          const maxSeq = this.seqTarget || 3;
          if (r.order === this.seqProgress + 1) {
            r.active = true;
            this.seqProgress = r.order;
            Balaclava.Audio.play('chest');
            game.spawnParticles(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE + 24, '#69f0ae', 12);
            game.addFloatingText(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE, `${rLbl} [${this.seqProgress}/${maxSeq}]`, '#ffd54f');
            if (this.seqProgress >= maxSeq) {
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
              game.addFloatingText(r.tx * TILE_SIZE + 24, r.ty * TILE_SIZE, `REINICIO -> ${rLbl} [1/${maxSeq}]`, '#ffd54f');
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
      if (game.freezeAI) {
        if (this.boss) this.boss.animTimer = (this.boss.animTimer || 0) + dt;
        return;
      }
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
      if (this.boss && this.boss.hp > 0 && this.gateOpen && !this.bossLocked && game.player.x >= (bossMinTileX + 1.15) * TILE_SIZE && pty >= 9 && pty <= 29) {
        this.lockBossGateForFight(game);
      }
      if (this.boss && this.boss.hp > 0 && (this.bossLocked || (ptx >= bossMinTileX + 1 && pty >= 9 && pty <= 29))) {
        const b = this.boss;
        const bMinX = (this.bossRoomMinX || 34) + 3;
        const bMaxX = Math.max(bMinX + 6, this.width - 5);
        const isBossWalkable = (wx, wy) => Number.isFinite(wx) && Number.isFinite(wy) && Math.floor(wx / TILE_SIZE) >= bMinX - 1 && Math.floor(wy / TILE_SIZE) >= 9 && Math.floor(wy / TILE_SIZE) <= 29 && this.isTileWalkable(Math.floor(wx / TILE_SIZE), Math.floor(wy / TILE_SIZE));
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
          if (this.id === 'eclipse_carmesi') {
            b.animRow = 3; b.animFrames = 7; b.animFps = 12; b.animLock = 0.85; b.animTimer = 0;
            game.spawnFx('sp_spell_death_red', b.x, b.y, 0, 0.9, 2.3, 1.0, { blend: 'lighter' });
          }
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
          if (this.id === 'eclipse_carmesi') {
            b.animRow = 3; b.animFrames = 7; b.animFps = 14; b.animLock = 0.95; b.animTimer = 0;
            game.spawnFx('sp_spell_death_red', b.x, b.y, 0, 1.0, 2.5, 1.0, { blend: 'lighter' });
            game.spawnFx('sp_lightning_burst_violet', b.x, b.y, 0, 0.9, 2.3, 1.0, { blend: 'lighter' });
          }
          game.spawnParticles(b.x, b.y, bossCol, 36);
          game.addFloatingText(b.x, b.y - 62, T('dungeon.phase3Float'), '#ff5252');
          const ay = this.bossArenaCenter ? this.bossArenaCenter.ty : 19;
          this.enemies.push(this.makeMob(this.def.enemyTypes[1 % this.def.enemyTypes.length], bMaxX - 1, ay - 5, 1.35));
          this.enemies.push(this.makeMob(this.def.enemyTypes[1 % this.def.enemyTypes.length], bMaxX - 1, ay + 5, 1.35));
        }

        const d = Balaclava.Utils.dist(b.x, b.y, game.player.x, game.player.y);
        const ang = Math.atan2(game.player.y - b.y, game.player.x - b.x);
        b.facing = game.player.x >= b.x ? 1 : -1;
        b.animTimer = (b.animTimer || 0) + dt;
        if ((b.animLock || 0) > 0) b.animLock -= dt;
        const _bMeta = Balaclava.BOSS_SPRITE_PATHS && Balaclava.BOSS_SPRITE_PATHS[this.id];
        if (_bMeta && _bMeta.multiRow && (b.animLock || 0) <= 0) {
          if ((b.dashTimer || 0) > 0) {
            if (b.animRow !== 5) { b.animRow = 5; b.animFrames = 7; b.animFps = 16; b.animTimer = 0; }
          } else if ((b.telegraph || 0) > 0) {
            const windRow = (b.telegraphMode === 'abyssal_scarlet_aura_burst' || b.telegraphMode === 'abyssal_eclipse_judgement' || b.telegraphMode === 'abyssal_vortex_whirlwind') ? 3 : 1;
            const windFrames = windRow === 3 ? 7 : 4;
            if (b.animRow !== windRow) { b.animRow = windRow; b.animFrames = windFrames; b.animFps = 11; b.animTimer = 0; }
          } else if (d > 68) {
            if (b.animRow !== 2) { b.animRow = 2; b.animFrames = 8; b.animFps = 11; b.animTimer = 0; }
          } else {
            if (b.animRow !== 0) { b.animRow = 0; b.animFrames = 7; b.animFps = 8; b.animTimer = 0; }
          }
        }

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
            if (executeBossSignatureAttack(mode, b, this, game, dt, theme, bossCol, projCfg, isBossWalkable, d, ang, tAng)) {
              // Boss signature attack with unique VFX and audio executed
            } else if (mode === 'slam') {
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
            if (this.isLateBiome) b.attackTimer *= 0.65;
            b.targetAngle = ang;
            b.targetX = game.player.x;
            b.targetY = game.player.y;
            const bMoves = BOSS_SIGNATURE_MOVES[this.id] || BOSS_SIGNATURE_MOVES.pradera;
            if (bMoves) {
              const list = b.phase === 3 ? bMoves.modes3 : b.phase === 2 ? bMoves.modes2 : bMoves.modes1;
              b.telegraphMode = list[b.phaseCycle % list.length];
              b.dashCharges = 0;
            } else if (b.phase === 1) {
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
            b.telegraph = b.phase === 3 ? 0.52 : b.phase === 2 ? 0.60 : 0.68;
            if (this.isLateBiome) b.telegraph = Math.max(0.40, b.telegraph * 0.82);
          }
        }
      }
    }
  }

  Balaclava.DUNGEON_DEFS = DUNGEON_DEFS;
  Balaclava.DUNGEON_TIER_LIST = DUNGEON_TIER_LIST;
  Balaclava.DungeonInstance = DungeonInstance;
})();
