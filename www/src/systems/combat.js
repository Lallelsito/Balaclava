(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { TILE_SIZE, PLOT_TILES } = Balaclava.CONST;
  const { dist, randInt, pick } = Balaclava.Utils;

  const ENEMY_DEFS = {
    slime: {
      id: 'slime', name: 'Limo Esmeralda', hp: 22, dmg: 6, speed: 48, rarity: 'comun',
      biome: 'pradera', coins: [1, 3], xp: 12, color: '#66bb6a',
      drops: [{ id: 'hierba', chance: 0.7 }, { id: 'bayas', chance: 0.45 }, { id: 'gel_azul', chance: 0.25 }]
    },
    skeleton: {
      id: 'skeleton', name: 'Esqueleto Errante', hp: 38, dmg: 10, speed: 62, rarity: 'poco_comun',
      biome: 'pradera', coins: [2, 6], xp: 20, color: '#eceff1',
      drops: [{ id: 'huesos', chance: 0.85 }, { id: 'craneo_maldito', chance: 0.14 }, { id: 'llave_mazmorra', chance: 0.06 }]
    },
    scorpion: {
      id: 'scorpion', name: 'Escorpión Dorado', hp: 48, dmg: 14, speed: 78, rarity: 'poco_comun',
      biome: 'desierto', coins: [4, 8], xp: 26, color: '#ffa726',
      drops: [{ id: 'cuero', chance: 0.55 }, { id: 'colmillo', chance: 0.48 }, { id: 'esporas_toxicas', chance: 0.22 }]
    },
    bat: {
      id: 'bat', name: 'Murciélago Sombrío', hp: 36, dmg: 13, speed: 95, rarity: 'poco_comun',
      biome: 'bosque_oscuro', coins: [3, 7], xp: 24, color: '#7e57c2',
      drops: [{ id: 'cuero', chance: 0.55 }, { id: 'ala_murcielago', chance: 0.68 }, { id: 'esencia_oscura', chance: 0.32 }]
    },
    wisp: {
      id: 'wisp', name: 'Espectro Arcano', hp: 62, dmg: 18, speed: 66, rarity: 'raro',
      biome: 'bosque_oscuro', coins: [6, 12], xp: 38, color: '#ce93d8', ranged: true,
      drops: [{ id: 'esencia_oscura', chance: 0.7 }, { id: 'ectoplasma', chance: 0.42 }, { id: 'polvo_estelar', chance: 0.12 }]
    },
    goblin: {
      id: 'goblin', name: 'Goblin Pirómano', hp: 68, dmg: 17, speed: 75, rarity: 'raro',
      biome: 'bosque_oscuro', coins: [5, 11], xp: 34, sprite: 'goblin_torch',
      drops: [{ id: 'cuero', chance: 0.6 }, { id: 'colmillo', chance: 0.4 }, { id: 'llave_mazmorra', chance: 0.09 }]
    },
    wolf: {
      id: 'wolf', name: 'Lobo Glacial', hp: 78, dmg: 20, speed: 94, rarity: 'raro',
      biome: 'montanas_heladas', coins: [6, 12], xp: 40, color: '#b3e5fc',
      drops: [{ id: 'cuero', chance: 0.8 }, { id: 'carne', chance: 0.65 }, { id: 'garra_sombras', chance: 0.38 }, { id: 'colmillo', chance: 0.5 }]
    },
    golem: {
      id: 'golem', name: 'Gólem de Runa', hp: 130, dmg: 26, speed: 46, rarity: 'epico',
      biome: 'montanas_heladas', coins: [9, 18], xp: 65, color: '#78909c',
      drops: [{ id: 'esencia_oscura', chance: 0.65 }, { id: 'esquirla_hielo', chance: 0.55 }, { id: 'gel_azul', chance: 0.45 }]
    },
    goblin_tnt: {
      id: 'goblin_tnt', name: 'Goblin Dinamitero', hp: 96, dmg: 28, speed: 70, rarity: 'epico',
      biome: 'tierras_volcanicas', coins: [8, 16], xp: 60, sprite: 'goblin_tnt', ranged: true,
      drops: [{ id: 'polvora', chance: 0.65 }, { id: 'cuero', chance: 0.5 }, { id: 'cuerno_demonio', chance: 0.25 }]
    },
    magma: {
      id: 'magma', name: 'Elemental Volcánico', hp: 165, dmg: 32, speed: 62, rarity: 'epico',
      biome: 'tierras_volcanicas', coins: [12, 24], xp: 85, color: '#ff5722', ranged: true,
      drops: [{ id: 'esencia_oscura', chance: 0.7 }, { id: 'cuerno_demonio', chance: 0.45 }, { id: 'pluma_fenix', chance: 0.16 }, { id: 'huevo_dragon', chance: 0.06 }]
    },
    golden_slime: {
      id: 'golden_slime', name: 'Limo Dorado Raro', hp: 70, dmg: 8, speed: 85, rarity: 'legendario',
      biome: 'pradera', coins: [12, 22], xp: 100, color: '#ffd54f',
      drops: [{ id: 'miel', chance: 0.85 }, { id: 'gel_azul', chance: 0.5 }, { id: 'llave_mazmorra', chance: 0.22 }]
    },
    ghost: {
      id: 'ghost', name: 'Espectro Nocturno', hp: 38, dmg: 10, speed: 78, nocturnal: true,
      biome: 'bosque_oscuro', coins: [4, 8], xp: 24, color: '#b39ddb',
      drops: [{ id: 'esencia_oscura', chance: 0.5 }, { id: 'huesos', chance: 0.4 }, { id: 'ectoplasma', chance: 0.35 }]
    },
    spider: {
      id: 'spider', name: 'Araña de Sombra', hp: 32, dmg: 9, speed: 92, nocturnal: true,
      biome: 'pradera', coins: [3, 7], xp: 20, color: '#78909c',
      drops: [{ id: 'seda_arana', chance: 0.72 }, { id: 'colmillo', chance: 0.4 }, { id: 'esencia_oscura', chance: 0.2 }]
    },
    zombie: {
      id: 'zombie', name: 'Caminante Nocturno', hp: 46, dmg: 11, speed: 60, nocturnal: true,
      biome: 'pradera', coins: [4, 8], xp: 22, color: '#66bb6a',
      drops: [{ id: 'huesos', chance: 0.65 }, { id: 'esencia_oscura', chance: 0.3 }, { id: 'carne', chance: 0.4 }]
    },
    vampire_bat: {
      id: 'vampire_bat', name: 'Murciélago Carmesí', hp: 42, dmg: 12, speed: 108, nocturnal: true,
      biome: 'bosque_oscuro', coins: [5, 10], xp: 28, color: '#e53935',
      drops: [{ id: 'ala_murcielago', chance: 0.75 }, { id: 'esencia_oscura', chance: 0.5 }, { id: 'cuero', chance: 0.4 }]
    },
    shadow_wolf: {
      id: 'shadow_wolf', name: 'Lobo de Penumbra', hp: 72, dmg: 17, speed: 104, nocturnal: true,
      biome: 'montanas_heladas', coins: [7, 14], xp: 48, color: '#5c6bc0',
      drops: [{ id: 'cuero', chance: 0.85 }, { id: 'garra_sombras', chance: 0.6 }, { id: 'esencia_oscura', chance: 0.5 }]
    },
    sand_ghoul: {
      id: 'sand_ghoul', name: 'Necrófago de Arena', hp: 40, dmg: 11, speed: 70,
      biome: 'desierto', coins: [4, 8], xp: 22, color: '#d7ccc8',
      drops: [{ id: 'huesos', chance: 0.75 }, { id: 'cuero', chance: 0.45 }, { id: 'craneo_maldito', chance: 0.16 }]
    },
    cobra: {
      id: 'cobra', name: 'Cobra del Oasis', hp: 36, dmg: 12, speed: 88,
      biome: 'desierto', coins: [3, 7], xp: 20, color: '#fbc02d',
      drops: [{ id: 'cuero', chance: 0.65 }, { id: 'colmillo', chance: 0.65 }, { id: 'esporas_toxicas', chance: 0.25 }]
    },
    mushroom_mob: {
      id: 'mushroom_mob', name: 'Esporo Viviente', hp: 45, dmg: 10, speed: 64,
      biome: 'bosque_oscuro', coins: [4, 8], xp: 25, color: '#ab47bc',
      drops: [{ id: 'hongo_luminoso', chance: 0.85 }, { id: 'esporas_toxicas', chance: 0.5 }, { id: 'semillas', chance: 0.4 }]
    },
    rock_golem: {
      id: 'rock_golem', name: 'Gólem de Basalto', hp: 85, dmg: 16, speed: 52,
      biome: 'desierto', coins: [6, 12], xp: 40, color: '#8d6e63',
      drops: [{ id: 'esencia_oscura', chance: 0.55 }, { id: 'huesos', chance: 0.4 }, { id: 'garra_sombras', chance: 0.3 }]
    },
    cultist: {
      id: 'cultist', name: 'Cultista Ígneo', hp: 66, dmg: 18, speed: 76, ranged: true, nocturnal: true,
      biome: 'tierras_volcanicas', coins: [8, 16], xp: 60, color: '#ff7043',
      drops: [{ id: 'esencia_oscura', chance: 0.7 }, { id: 'tela', chance: 0.45 }, { id: 'craneo_maldito', chance: 0.3 }]
    },
    fire_elem: {
      id: 'fire_elem', name: 'Elemental de Brasas', hp: 90, dmg: 20, speed: 82, ranged: true,
      biome: 'tierras_volcanicas', coins: [10, 18], xp: 70, color: '#ff9800',
      drops: [{ id: 'polvora', chance: 0.6 }, { id: 'esencia_oscura', chance: 0.6 }, { id: 'pluma_fenix', chance: 0.14 }]
    },
    rat: {
      id: 'rat', name: 'Rata de Pradera', hp: 18, dmg: 5, speed: 78, rarity: 'comun',
      biome: 'pradera', coins: [1, 3], xp: 10, color: '#a1887f',
      drops: [{ id: 'cuero', chance: 0.45 }, { id: 'carne', chance: 0.35 }]
    },
    rat_giant: {
      id: 'rat_giant', name: 'Rata Gigante Alfa', hp: 46, dmg: 11, speed: 72, rarity: 'poco_comun',
      biome: 'pradera', coins: [4, 7], xp: 24, color: '#8d6e63',
      drops: [{ id: 'cuero', chance: 0.7 }, { id: 'colmillo', chance: 0.55 }, { id: 'carne', chance: 0.5 }]
    },
    beetle: {
      id: 'beetle', name: 'Escarabajo Solar', hp: 34, dmg: 9, speed: 66, rarity: 'comun',
      biome: 'desierto', coins: [3, 6], xp: 18, color: '#8bc34a',
      drops: [{ id: 'cuero', chance: 0.5 }, { id: 'colmillo', chance: 0.4 }, { id: 'esporas_toxicas', chance: 0.25 }]
    },
    beetle_fire: {
      id: 'beetle_fire', name: 'Escarabajo Ígneo', hp: 72, dmg: 19, speed: 74, rarity: 'raro',
      biome: 'tierras_volcanicas', coins: [7, 14], xp: 46, color: '#ff7043',
      drops: [{ id: 'polvora', chance: 0.55 }, { id: 'cuerno_demonio', chance: 0.35 }, { id: 'cuero', chance: 0.5 }]
    },
    imp: {
      id: 'imp', name: 'Diablillo de Magma', hp: 64, dmg: 20, speed: 94, ranged: true, nocturnal: true, rarity: 'raro',
      biome: 'tierras_volcanicas', coins: [8, 15], xp: 48, color: '#ef5350',
      drops: [{ id: 'cuerno_demonio', chance: 0.6 }, { id: 'polvora', chance: 0.45 }, { id: 'esencia_oscura', chance: 0.4 }]
    },
    orc: {
      id: 'orc', name: 'Orco Saqueador', hp: 92, dmg: 22, speed: 66, rarity: 'raro',
      biome: 'pradera', coins: [8, 16], xp: 52, color: '#558b2f',
      drops: [{ id: 'cuero', chance: 0.75 }, { id: 'colmillo', chance: 0.7 }, { id: 'llave_mazmorra', chance: 0.08 }]
    },
    mimic: {
      id: 'mimic', name: 'Cofre Mímico Voraz', hp: 110, dmg: 24, speed: 72, nocturnal: true, rarity: 'epico',
      biome: 'bosque_oscuro', coins: [20, 36], xp: 90, color: '#ffb300',
      drops: [{ id: 'madera', chance: 0.6 }, { id: 'llave_mazmorra', chance: 0.35 }, { id: 'esencia_oscura', chance: 0.6 }]
    },
    mushroom_purple: {
      id: 'mushroom_purple', name: 'Micónido Venenoso', hp: 58, dmg: 15, speed: 62, rarity: 'poco_comun',
      biome: 'bosque_oscuro', coins: [5, 10], xp: 30, color: '#ba68c8',
      drops: [{ id: 'hongo_luminoso', chance: 0.85 }, { id: 'esporas_toxicas', chance: 0.6 }]
    },
    skeleton_archer: {
      id: 'skeleton_archer', name: 'Esqueleto Arquero', hp: 44, dmg: 14, speed: 68, ranged: true, nocturnal: true, rarity: 'poco_comun',
      biome: 'desierto', coins: [4, 9], xp: 28, color: '#e0e0e0',
      drops: [{ id: 'huesos', chance: 0.9 }, { id: 'pluma_oscura', chance: 0.45 }, { id: 'tela', chance: 0.35 }]
    },
    skeleton_mage: {
      id: 'skeleton_mage', name: 'Nigromante Óseo', hp: 74, dmg: 21, speed: 60, ranged: true, nocturnal: true, rarity: 'epico',
      biome: 'montanas_heladas', coins: [9, 17], xp: 58, color: '#9575cd',
      drops: [{ id: 'huesos', chance: 0.9 }, { id: 'craneo_maldito', chance: 0.5 }, { id: 'esencia_oscura', chance: 0.55 }]
    },
    goblin_shaman: {
      id: 'goblin_shaman', name: 'Goblin Chamán', hp: 62, dmg: 18, speed: 70, ranged: true, rarity: 'raro',
      biome: 'bosque_oscuro', coins: [6, 12], xp: 40, color: '#26a69a',
      drops: [{ id: 'esencia_oscura', chance: 0.6 }, { id: 'hongo_luminoso', chance: 0.55 }, { id: 'tela', chance: 0.4 }]
    },
    floating_eye: {
      id: 'floating_eye', name: 'Ojo Abisal Flotante', hp: 52, dmg: 16, speed: 84, ranged: true, nocturnal: true, rarity: 'raro',
      biome: 'bosque_oscuro', coins: [6, 12], xp: 36, color: '#f06292',
      drops: [{ id: 'esencia_oscura', chance: 0.7 }, { id: 'ectoplasma', chance: 0.45 }, { id: 'polvo_estelar', chance: 0.14 }]
    },
    cave_spider: {
      id: 'cave_spider', name: 'Tarántula Cavernaria', hp: 56, dmg: 15, speed: 96, nocturnal: true, rarity: 'poco_comun',
      biome: 'montanas_heladas', coins: [5, 11], xp: 34, color: '#78909c',
      drops: [{ id: 'seda_arana', chance: 0.85 }, { id: 'colmillo', chance: 0.55 }]
    },
    slime_toxic: {
      id: 'slime_toxic', name: 'Limo Tóxico', hp: 48, dmg: 13, speed: 56, rarity: 'poco_comun',
      biome: 'bosque_oscuro', coins: [4, 8], xp: 24, color: '#76ff03',
      drops: [{ id: 'hierba', chance: 0.7 }, { id: 'esporas_toxicas', chance: 0.65 }, { id: 'gel_azul', chance: 0.35 }]
    },
    grave_revenant: {
      id: 'grave_revenant', name: 'Espectro de Tumba', hp: 62, dmg: 17, speed: 74, nocturnal: true, rarity: 'raro',
      biome: 'bosque_oscuro', coins: [7, 13], xp: 40, color: '#ab47bc',
      drops: [{ id: 'huesos', chance: 0.85 }, { id: 'craneo_maldito', chance: 0.45 }, { id: 'esencia_oscura', chance: 0.55 }]
    },
    royal_scarab: {
      id: 'royal_scarab', name: 'Escarabajo Real', hp: 58, dmg: 16, speed: 72, rarity: 'poco_comun',
      biome: 'desierto', coins: [6, 12], xp: 34, color: '#ffd54f',
      drops: [{ id: 'cuero', chance: 0.6 }, { id: 'colmillo', chance: 0.5 }, { id: 'miel', chance: 0.35 }]
    },
    toxic_hound: {
      id: 'toxic_hound', name: 'Sabueso Tóxico', hp: 66, dmg: 18, speed: 92, rarity: 'raro',
      biome: 'bosque_oscuro', coins: [7, 14], xp: 42, color: '#9ccc65',
      drops: [{ id: 'colmillo', chance: 0.7 }, { id: 'garra_sombras', chance: 0.45 }, { id: 'cuero', chance: 0.6 }]
    },
    ghastly_eye: {
      id: 'ghastly_eye', name: 'Ojo Espectral', hp: 68, dmg: 19, speed: 84, ranged: true, nocturnal: true, rarity: 'raro',
      biome: 'montanas_heladas', coins: [8, 15], xp: 46, color: '#80deea',
      drops: [{ id: 'ectoplasma', chance: 0.55 }, { id: 'gel_azul', chance: 0.5 }, { id: 'esencia_oscura', chance: 0.45 }]
    },
    brittle_archer: {
      id: 'brittle_archer', name: 'Ballestero de Osario', hp: 54, dmg: 16, speed: 68, ranged: true, rarity: 'poco_comun',
      biome: 'pradera', coins: [5, 10], xp: 30, color: '#e0e0e0',
      drops: [{ id: 'huesos', chance: 0.85 }, { id: 'craneo_maldito', chance: 0.25 }, { id: 'tela', chance: 0.35 }]
    },
    lava_ant: {
      id: 'lava_ant', name: 'Hormiga de Magma', hp: 78, dmg: 21, speed: 82, rarity: 'raro',
      biome: 'tierras_volcanicas', coins: [9, 17], xp: 52, color: '#ff5722',
      drops: [{ id: 'colmillo', chance: 0.65 }, { id: 'pluma_fenix', chance: 0.10 }, { id: 'cuerno_demonio', chance: 0.35 }]
    },
    acid_ant: {
      id: 'acid_ant', name: 'Hormiga Ácida', hp: 52, dmg: 14, speed: 78, rarity: 'poco_comun',
      biome: 'pradera', coins: [4, 9], xp: 28, color: '#8bc34a',
      drops: [{ id: 'hierba', chance: 0.65 }, { id: 'esporas_toxicas', chance: 0.45 }, { id: 'colmillo', chance: 0.35 }]
    },
    tunneling_mole: {
      id: 'tunneling_mole', name: 'Topo Excavador', hp: 64, dmg: 16, speed: 70, rarity: 'poco_comun',
      biome: 'montanas_heladas', coins: [6, 12], xp: 36, color: '#8d6e63',
      drops: [{ id: 'cuero', chance: 0.7 }, { id: 'garra_sombras', chance: 0.5 }, { id: 'carne', chance: 0.5 }]
    },
    plague_bat: {
      id: 'plague_bat', name: 'Murciélago de Peste', hp: 50, dmg: 15, speed: 95, nocturnal: true, rarity: 'poco_comun',
      biome: 'bosque_oscuro', coins: [5, 10], xp: 30, color: '#ba68c8',
      drops: [{ id: 'ala_murcielago', chance: 0.75 }, { id: 'hongo_luminoso', chance: 0.45 }, { id: 'esporas_toxicas', chance: 0.4 }]
    },

    // === FASE 5: +18 ENEMIGOS DISTINTIVOS POR BIOMA Y MAZMORRA ===
    goblin_archer: {
      id: 'goblin_archer', name: 'Goblin Ballestero', hp: 38, dmg: 11, speed: 74, ranged: true, rarity: 'comun',
      biome: 'pradera', coins: [3, 7], xp: 20, color: '#8bc34a',
      drops: [{ id: 'madera', chance: 0.6 }, { id: 'cuero', chance: 0.45 }, { id: 'llave_dorada', chance: 0.04 }]
    },
    ghost_spectral: {
      id: 'ghost_spectral', name: 'Aparición Etérea', hp: 62, dmg: 16, speed: 82, nocturnal: true, ranged: true, rarity: 'raro',
      biome: 'bosque_oscuro', coins: [6, 12], xp: 38, color: '#b39ddb',
      drops: [{ id: 'ectoplasma', chance: 0.7 }, { id: 'esencia_oscura', chance: 0.5 }, { id: 'tablilla_runica', chance: 0.12 }]
    },
    slime_blue: {
      id: 'slime_blue', name: 'Limo Glacial', hp: 52, dmg: 12, speed: 60, rarity: 'comun',
      biome: 'montanas_heladas', coins: [4, 8], xp: 26, color: '#4fc3f7',
      drops: [{ id: 'gel_azul', chance: 0.75 }, { id: 'esquirla_hielo', chance: 0.45 }]
    },
    slime_red: {
      id: 'slime_red', name: 'Limo Magmático', hp: 74, dmg: 18, speed: 66, rarity: 'poco_comun',
      biome: 'tierras_volcanicas', coins: [7, 13], xp: 42, color: '#ff5252',
      drops: [{ id: 'gel_azul', chance: 0.55 }, { id: 'esencia_magma', chance: 0.5 }]
    },
    vine_snake: {
      id: 'vine_snake', name: 'Sierpe Enredadera', hp: 46, dmg: 13, speed: 86, rarity: 'poco_comun',
      biome: 'pradera', coins: [4, 9], xp: 24, color: '#66bb6a',
      drops: [{ id: 'fibra_vegetal', chance: 0.8 }, { id: 'colmillo', chance: 0.5 }, { id: 'esporas_toxicas', chance: 0.25 }]
    },
    wisp_green: {
      id: 'wisp_green', name: 'Fuego Fatuo Silvestre', hp: 50, dmg: 15, speed: 92, ranged: true, nocturnal: true, rarity: 'raro',
      biome: 'bosque_oscuro', coins: [6, 12], xp: 34, color: '#76ff03',
      drops: [{ id: 'polvo_estelar', chance: 0.35 }, { id: 'cristales', chance: 0.55 }, { id: 'esencia_oscura', chance: 0.4 }]
    },
    skel_swordsman: {
      id: 'skel_swordsman', name: 'Esqueleto Espadachín', hp: 56, dmg: 15, speed: 74, rarity: 'poco_comun',
      biome: 'desierto', coins: [5, 10], xp: 30, color: '#e0e0e0',
      drops: [{ id: 'huesos', chance: 0.85 }, { id: 'craneo_maldito', chance: 0.28 }, { id: 'llave_esqueleto', chance: 0.05 }]
    },
    skel_mage_dark: {
      id: 'skel_mage_dark', name: 'Conjurador de Criptas', hp: 68, dmg: 20, speed: 66, ranged: true, nocturnal: true, rarity: 'epico',
      biome: 'bosque_oscuro', coins: [8, 16], xp: 52, color: '#ce93d8',
      drops: [{ id: 'huesos', chance: 0.8 }, { id: 'craneo_maldito', chance: 0.45 }, { id: 'tablilla_runica', chance: 0.16 }]
    },
    skel_crossbow: {
      id: 'skel_crossbow', name: 'Esqueleto de Ballesta', hp: 58, dmg: 17, speed: 70, ranged: true, rarity: 'raro',
      biome: 'desierto', coins: [6, 12], xp: 36, color: '#cfd8dc',
      drops: [{ id: 'huesos', chance: 0.85 }, { id: 'pluma_oscura', chance: 0.4 }, { id: 'llave_dorada', chance: 0.04 }]
    },
    skel_spearman: {
      id: 'skel_spearman', name: 'Lancero de Catacumbas', hp: 64, dmg: 16, speed: 76, rarity: 'poco_comun',
      biome: 'desierto', coins: [6, 11], xp: 34, color: '#d7ccc8',
      drops: [{ id: 'huesos', chance: 0.85 }, { id: 'cuero', chance: 0.5 }, { id: 'llave_esqueleto', chance: 0.05 }]
    },
    flaming_skull: {
      id: 'flaming_skull', name: 'Cráneo Ardiente', hp: 82, dmg: 23, speed: 94, ranged: true, nocturnal: true, rarity: 'epico',
      biome: 'tierras_volcanicas', coins: [10, 18], xp: 62, color: '#ff7043',
      drops: [{ id: 'huesos', chance: 0.8 }, { id: 'esencia_magma', chance: 0.5 }, { id: 'llave_rubi', chance: 0.05 }]
    },
    dark_lancer: {
      id: 'dark_lancer', name: 'Caballero Sombrío', hp: 108, dmg: 24, speed: 80, rarity: 'epico',
      biome: 'montanas_heladas', coins: [11, 22], xp: 74, color: '#7e57c2',
      drops: [{ id: 'lingote_acero', chance: 0.45 }, { id: 'esencia_oscura', chance: 0.65 }, { id: 'llave_zafiro', chance: 0.06 }]
    },
    goblin_barrel: {
      id: 'goblin_barrel', name: 'Goblin Artillero', hp: 62, dmg: 19, speed: 68, rarity: 'poco_comun',
      biome: 'pradera', coins: [6, 12], xp: 34, color: '#8d6e63',
      drops: [{ id: 'madera', chance: 0.7 }, { id: 'polvora', chance: 0.5 }]
    },
    goblin_sapper: {
      id: 'goblin_sapper', name: 'Goblin Zapador', hp: 70, dmg: 22, speed: 78, rarity: 'raro',
      biome: 'pradera', coins: [7, 14], xp: 40, color: '#ff8a65',
      drops: [{ id: 'polvora', chance: 0.75 }, { id: 'cuero', chance: 0.65 }]
    },
    goblin_raider: {
      id: 'goblin_raider', name: 'Asaltante Goblin', hp: 76, dmg: 18, speed: 90, rarity: 'raro',
      biome: 'pradera', coins: [8, 15], xp: 44, color: '#7cb342',
      drops: [{ id: 'cuero', chance: 0.75 }, { id: 'colmillo', chance: 0.45 }, { id: 'llave_dorada', chance: 0.05 }]
    },
    crimson_jelly: {
      id: 'crimson_jelly', name: 'Gelatina Carmesí', hp: 96, dmg: 22, speed: 64, rarity: 'raro',
      biome: 'tierras_volcanicas', coins: [9, 17], xp: 56, color: '#e53935',
      drops: [{ id: 'esencia_magma', chance: 0.65 }, { id: 'polvora', chance: 0.35 }]
    },
    frost_jelly: {
      id: 'frost_jelly', name: 'Gelatina de Escarcha', hp: 86, dmg: 19, speed: 62, rarity: 'raro',
      biome: 'montanas_heladas', coins: [8, 16], xp: 50, color: '#80deea',
      drops: [{ id: 'esquirla_hielo', chance: 0.65 }, { id: 'azurita_glacial', chance: 0.16 }]
    },
    void_jelly: {
      id: 'void_jelly', name: 'Gelatina del Vacío', hp: 112, dmg: 25, speed: 68, nocturnal: true, rarity: 'epico',
      biome: 'bosque_oscuro', coins: [12, 22], xp: 76, color: '#ab47bc',
      drops: [{ id: 'esencia_oscura', chance: 0.75 }, { id: 'cristal_abismal', chance: 0.16 }]
    }
  };

  class CombatSystem {
    constructor() {
      this.enemies = [];
      this.spawnTimer = 0;
      this.nextId = 1;
    }

    static getEnemyDef(id) {
      return ENEMY_DEFS[id] || ENEMY_DEFS.slime;
    }

    getSpawnConfig(game) {
      const night = typeof game.isNightTime === 'function' ? game.isNightTime() : false;
      const plots = Math.max(1, game.unlockedPlots.length);
      const pLv = Math.max(1, (game.player && game.player.level) || 1);
      const lvBoost = Math.floor((pLv - 1) / 3);
      if (night) {
        return {
          isNight: true,
          interval: Math.max(4.6, 8.2 - Math.min(2.2, plots * 0.14) - Math.min(1.0, (pLv - 1) * 0.08)),
          maxMobs: Math.min(16, 3 + Math.ceil(plots * 1.0) + lvBoost)
        };
      }
      // Very calm daytime cadence so exploring & building feels relaxing (night is the real ambush).
      return {
        isNight: false,
        interval: Math.max(54.0, 74.0 - Math.min(16.0, (pLv - 1) * 0.8)),
        maxMobs: Math.min(2, plots >= 10 ? 2 : 1)
      };
    }

    spawnWorldEnemy(game, forceBiome = null, forceType = null) {
      if (game.unlockedPlots.length === 0) return null;
      const night = typeof game.isNightTime === 'function' ? game.isNightTime() : false;

      // Prefer unlocked plots near the player when night falls, or weighted unlocked plot
      const plot = pick(game.unlockedPlots);
      const biome = forceBiome || game.world.plotBiomes[plot[1]][plot[0]];

      const dayPools = {
        pradera: ['slime', 'rat', 'rat_giant', 'orc', 'skeleton'],
        desierto: ['beetle', 'scorpion', 'sand_ghoul', 'cobra', 'rock_golem'],
        bosque_oscuro: ['mushroom_mob', 'mushroom_purple', 'slime_toxic', 'goblin', 'goblin_shaman', 'bat'],
        montanas_heladas: ['wolf', 'golem', 'cave_spider'],
        tierras_volcanicas: ['magma', 'fire_elem', 'beetle_fire', 'goblin_tnt']
      };
      const nightPools = {
        pradera: ['zombie', 'spider', 'ghost', 'skeleton', 'orc', 'rat_giant'],
        desierto: ['sand_ghoul', 'scorpion', 'skeleton_archer', 'ghost', 'beetle'],
        bosque_oscuro: ['ghost', 'vampire_bat', 'floating_eye', 'mimic', 'shadow_wolf', 'goblin_shaman'],
        montanas_heladas: ['shadow_wolf', 'skeleton_mage', 'cave_spider', 'ghost', 'golem'],
        tierras_volcanicas: ['cultist', 'imp', 'fire_elem', 'beetle_fire', 'magma']
      };

      const pool = night ? (nightPools[biome] || nightPools.pradera) : (dayPools[biome] || dayPools.pradera);
      const type = forceType || pick(pool);
      const def = ENEMY_DEFS[type] || ENEMY_DEFS.slime;
      const tx = plot[0] * PLOT_TILES + randInt(2, PLOT_TILES - 3);
      const ty = plot[1] * PLOT_TILES + randInt(2, PLOT_TILES - 3);
      if (!game.world.isTileWalkable(tx, ty)) return null;
      const x = (tx + 0.5) * TILE_SIZE;
      const y = (ty + 0.5) * TILE_SIZE;
      const minDist = forceType ? 120 : (game.unlockedPlots.length <= 1 ? 145 : 240);
      if (dist(x, y, game.player.x, game.player.y) < minDist) return null;

      // Campfires, braziers, lighthouses and streetlamps push back nearby enemy spawns
      const nearSafeFire = game.buildings.some(b => {
        const bDef = Balaclava.BUILDINGS[b.type];
        return bDef && bDef.lightRadius && dist(x, y, (b.tx + 0.5) * TILE_SIZE, (b.ty + 0.5) * TILE_SIZE) < bDef.lightRadius * 0.78;
      });
      if (nearSafeFire && !forceType) return null;

      // Scale enemy strength & danger level nonlinearly with biome tier, distance AND player level
      const center = Balaclava.CONST.CENTER_PLOT || 4;
      const plotDist = Math.hypot(plot[0] - center, plot[1] - center);
      const pLv = Math.max(1, (game.player && game.player.level) || 1);
      const lvExtra = pLv - 1;
      const biomeTierMap = { pradera: 0, desierto: 1, montanas_heladas: 2, bosque_oscuro: 3, tierras_volcanicas: 4 };
      const biomeTier = biomeTierMap[biome] || 0;
      const biomeMinLv = 1 + biomeTier * 4;
      const dangerLv = Math.max(biomeMinLv, Math.round(1 + plotDist * 2.0 + biomeTier * 1.6 + lvExtra * 0.85));
      const effLv = Math.max(0, dangerLv - 1);
      const hpScale = 1 + effLv * 0.36 + Math.pow(effLv, 1.32) * 0.06;
      const dmgScale = 1 + effLv * 0.11 + Math.pow(effLv, 1.1) * 0.025;
      const spdScale = 1 + Math.min(0.55, effLv * 0.018 + biomeTier * 0.04);
      const xpScale = 1 + effLv * 0.28 + Math.pow(effLv, 1.2) * 0.05;

      const mob = {
        id: this.nextId++,
        type,
        name: def.name,
        biome,
        level: dangerLv,
        xpMult: xpScale,
        nocturnal: !!def.nocturnal || (night && Math.random() < 0.75),
        x, y,
        vx: 0, vy: 0,
        animVx: 0, animVy: 0,
        hp: Math.round(def.hp * hpScale),
        maxHp: Math.round(def.hp * hpScale),
        dmg: Math.round(def.dmg * dmgScale),
        speed: Math.round(def.speed * spdScale),
        color: def.color || '#ef5350',
        sprite: def.sprite || null,
        ranged: !!def.ranged,
        radius: Math.max(def.radius || 18, 20),
        hitW: def.hitW || 44,
        hitH: def.hitH || 50,
        bodyOffY: def.bodyOffY !== undefined ? def.bodyOffY : 17,
        hitFlash: 0,
        atkCd: 1.0,
        patrolTimer: randInt(1, 3),
        facing: 1
      };
      this.enemies.push(mob);
      return mob;
    }

    update(dt, game) {
      if (game.activeDungeon) return;

      const cfg = this.getSpawnConfig(game);
      if (!cfg.isNight) {
        // Slowly banish nocturnal mobs when dawn arrives
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          if (this.enemies[i].nocturnal && this.enemies[i].type !== 'golden_slime') {
            this.enemies[i].sunBurn = (this.enemies[i].sunBurn || 0) + dt;
            if (this.enemies[i].sunBurn > 4.0) {
              game.spawnParticles(this.enemies[i].x, this.enemies[i].y, '#9575cd', 6);
              this.enemies.splice(i, 1);
            }
          }
        }
      }

      this.spawnTimer += dt;
      if (this.spawnTimer >= cfg.interval && this.enemies.length < cfg.maxMobs) {
        this.spawnTimer = 0;
        this.spawnWorldEnemy(game);
      }

      const px = game.player.x;
      const py = game.player.y;

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
        if (e.atkCd > 0) e.atkCd -= dt;
        if (e.slowTimer > 0) e.slowTimer = Math.max(0, e.slowTimer - dt);
        if (e.burnTimer > 0) {
          e.burnTimer = Math.max(0, e.burnTimer - dt);
          e._burnTick = (e._burnTick || 0) + dt;
          if (e._burnTick >= 0.75) {
            e._burnTick -= 0.75;
            this.damageEnemy(game, e, Math.max(4, Math.round((e.maxHp || 40) * 0.035)), 0, false, false);
            if (e._dead || e.hp <= 0) continue;
          }
        }

        const d = dist(e.x, e.y, px, py);
        let moveVx = e.vx;
        let moveVy = e.vy;

        // Inicializar estado de combate avanzado
        if (!e.state) e.state = 'chase';
        if (e.specialAtkCd === undefined) e.specialAtkCd = randInt(2, 4);
        if (e.specialAtkCd > 0) e.specialAtkCd -= dt;

        const isCharger = /wolf|hound|boar|orc|spider|lancer|spearman|swordsman|raider|giant/i.test(e.type);
        const isLeaper = /slime|jelly|golem|frog|toad/i.test(e.type);

        if (e.state === 'windup') {
          e.windupTimer = (e.windupTimer || 0.45) - dt;
          moveVx = 0; moveVy = 0;
          if (e.windupTimer <= 0) {
            if (e.attackKind === 'leap') {
              e.state = 'leap';
              e.leapProg = 0;
              e.leapDur = 0.65;
              e.leapStartX = e.x;
              e.leapStartY = e.y;
              e.leapTargetX = e.targetX !== undefined ? e.targetX : px;
              e.leapTargetY = e.targetY !== undefined ? e.targetY : py;
            } else {
              e.state = 'dash';
              e.dashTimer = 0.38;
              const dAng = e.targetAngle !== undefined ? e.targetAngle : Math.atan2(py - e.y, px - e.x);
              e.dashVx = Math.cos(dAng) * e.speed * 3.2;
              e.dashVy = Math.sin(dAng) * e.speed * 3.2;
              if (game.spawnParticles) game.spawnParticles(e.x, e.y, '#ff8a80', 6);
            }
          }
        } else if (e.state === 'dash') {
          e.dashTimer -= dt;
          moveVx = e.dashVx || 0;
          moveVy = e.dashVy || 0;
          if (d < 36 && e.atkCd <= 0) {
            e.atkCd = 1.2;
            game.damagePlayer(Math.round(e.dmg * 1.35));
            if (game.spawnParticles) game.spawnParticles(game.player.x, game.player.y, '#ff5252', 12);
          }
          if (e.dashTimer <= 0) {
            e.state = 'chase';
            e.specialAtkCd = randInt(3, 5);
          }
        } else if (e.state === 'leap') {
          e.leapProg = Math.min(1, (e.leapProg || 0) + dt / (e.leapDur || 0.65));
          e.x = (e.leapStartX || e.x) + ((e.leapTargetX || e.x) - (e.leapStartX || e.x)) * e.leapProg;
          e.y = (e.leapStartY || e.y) + ((e.leapTargetY || e.y) - (e.leapStartY || e.y)) * e.leapProg;
          moveVx = 0; moveVy = 0;
          if (e.leapProg >= 1) {
            e.state = 'chase';
            e.specialAtkCd = randInt(3, 6);
            if (game.spawnShockwave) game.spawnShockwave(e.x, e.y, 48, e.color || '#66bb6a');
            if (dist(e.x, e.y, px, py) < 52 && e.atkCd <= 0) {
              e.atkCd = 1.1;
              game.damagePlayer(Math.round(e.dmg * 1.25));
            }
          }
        } else if (d < 300) {
          const ang = Math.atan2(py - e.y, px - e.x);
          e.facing = Math.cos(ang) >= 0 ? 1 : -1;

          // Iniciar ataque especial por distancia
          if (e.specialAtkCd <= 0 && d > 55 && d < 185) {
            if (isCharger) {
              e.state = 'windup';
              e.attackKind = 'charge';
              e.windupTimer = 0.45;
              e.targetAngle = ang;
              e.targetX = px;
              e.targetY = py;
            } else if (isLeaper) {
              e.state = 'windup';
              e.attackKind = 'leap';
              e.windupTimer = 0.42;
              e.targetX = px;
              e.targetY = py;
            }
          }

          if (e.ranged && d < 230 && d > 90) {
            moveVx = 0; moveVy = 0;
            if (e.atkCd <= 0) {
              e.atkCd = 2.0;
              const isSpread = /cultist|mage|shaman|imp/i.test(e.type);
              if (isSpread) {
                [-0.22, 0, 0.22].forEach(off => {
                  game.spawnEnemyProjectile(e.x, e.y, Math.cos(ang + off) * 200, Math.sin(ang + off) * 200, Math.round(e.dmg * 0.8), e.color);
                });
              } else {
                game.spawnEnemyProjectile(e.x, e.y, Math.cos(ang) * 215, Math.sin(ang) * 215, e.dmg, e.color);
              }
            }
          } else if (e.state === 'chase') {
            // Flanqueo inteligente para rodear al jugador
            const seedVal = typeof e.id === 'number' ? e.id : (Number(e.seed) || (this.enemies.indexOf(e) * 3));
            const flank = Math.sin(this.enemies.indexOf(e) * 1.8 + seedVal) * 0.36;
            const finalAng = ang + flank;
            const spd = e.speed * (d < 110 ? 1.16 : 1.06);
            moveVx = Math.cos(finalAng) * spd;
            moveVy = Math.sin(finalAng) * spd;
          }

          if (d < 28 && e.atkCd <= 0 && e.state === 'chase') {
            e.atkCd = 1.0;
            game.damagePlayer(e.dmg);
          }
        } else {
          e.patrolTimer -= dt;
          if (e.patrolTimer <= 0) {
            e.patrolTimer = randInt(2, 4);
            if (Math.random() < 0.6) {
              const a = Math.random() * Math.PI * 2;
              e.vx = Math.cos(a) * e.speed * 0.45;
              e.vy = Math.sin(a) * e.speed * 0.45;
            } else {
              e.vx = 0; e.vy = 0;
            }
          }
          moveVx = e.vx; moveVy = e.vy;
        }

        const spdScale = (e.slowTimer > 0) ? 0.45 : 1;
        e.animVx = moveVx * spdScale;
        e.animVy = moveVy * spdScale;
        const pad = 9;
        const isPosWalkable = (pxCheck, pyCheck) => {
          if (!Number.isFinite(pxCheck) || !Number.isFinite(pyCheck)) return false;
          const checkPts = [
            [pxCheck - pad, pyCheck - pad],
            [pxCheck + pad, pyCheck - pad],
            [pxCheck - pad, pyCheck + pad],
            [pxCheck + pad, pyCheck + pad]
          ];
          return checkPts.every(([cx, cy]) => game.world.isTileWalkable(Math.floor(cx / TILE_SIZE), Math.floor(cy / TILE_SIZE)));
        };
        const nx = e.x + moveVx * spdScale * dt;
        const ny = e.y + moveVy * spdScale * dt;
        if (Number.isFinite(nx) && isPosWalkable(nx, e.y)) e.x = nx;
        if (Number.isFinite(ny) && isPosWalkable(e.x, ny)) e.y = ny;
      }
    }

    damageEnemy(game, enemy, rawDmg, knockAng = 0, isCrit = false, allowProc = true) {
      if (!enemy || enemy._dead || enemy.hp <= 0) return false;
      let dmg = rawDmg;
      if ((enemy.isBoss || enemy.isMiniBoss) && (game.mods.bossDmg || game.mods.bossDmgBonus)) {
        dmg = Math.round(dmg * (1 + (game.mods.bossDmg || 0) + (game.mods.bossDmgBonus || 0)));
      }
      if ((game.mods.burnDmg || 0) > 0) {
        dmg += Math.round(game.mods.burnDmg);
        enemy.burnTimer = Math.max(enemy.burnTimer || 0, 2.5);
      }
      if ((game.mods.frostSlowChance || 0) > 0 && Math.random() < Math.min(0.6, game.mods.frostSlowChance)) {
        enemy.slowTimer = Math.max(enemy.slowTimer || 0, 2.6);
      }
      const activeSlot = game.hotbar && game.hotbar[game.activeSlot];
      const activeToolId = activeSlot && activeSlot.kind === 'tool' ? activeSlot.id : null;
      const activeItemDef = activeSlot && activeSlot.kind === 'item' ? Balaclava.ITEMS[activeSlot.id] : null;
      const tb = activeToolId && typeof game.getToolEnchantBonuses === 'function' ? game.getToolEnchantBonuses(activeToolId) : null;
      if (tb && tb.fireDmg > 0) {
        dmg = Math.round(dmg * (1 + tb.fireDmg));
      }
      const weaponLightChance = activeItemDef
        ? (activeItemDef.id === 'espada_tormenta' ? 0.55 : activeItemDef.id === 'espada_relampago' ? 0.35 : 0)
        : 0;
      const lightChance = (tb && tb.lightningChance ? tb.lightningChance : 0) + weaponLightChance;
      if (allowProc && lightChance > 0 && Math.random() < Math.min(0.75, lightChance)) {
        const extraLight = Math.max(8, Math.round(dmg * (0.45 + (tb && tb.procDmgMult ? tb.procDmgMult * 0.45 : 0))));
        dmg += extraLight;
        game.spawnFx('fx_thunder_strike', enemy.x, enemy.y - 26, 0, 0.38, 1.45, 0.96);
        game.spawnFx('fx_thunder_splash', enemy.x, enemy.y + 4, 0, 0.36, 1.35, 0.90);
        Balaclava.Audio.play('thunder');
        game.addFloatingText(enemy.x, enemy.y - 40, Balaclava.I18n ? Balaclava.I18n.t('combat.lightningProc', { dmg: extraLight }) : `¡Rayo +${extraLight}!`, '#80d8ff');
      }
      if (allowProc && tb && tb.procChance > 0 && Math.random() < Math.min(0.65, tb.procChance)) {
        const extraDmg = Math.max(2, Math.round(dmg * (tb.procDmgMult || 0.25)));
        dmg += extraDmg;
        game.spawnFx('arcaneBlast', enemy.x, enemy.y, knockAng, 0.26, 1.3, 0.9);
        game.addFloatingText(enemy.x, enemy.y - 36, Balaclava.I18n ? Balaclava.I18n.t('combat.furyProc', { dmg: extraDmg }) : `¡Furia +${extraDmg}!`, '#4fc3f7');
      }
      enemy.hp -= dmg;
      enemy.hitFlash = 0.16;
      if (tb && tb.lifeSteal > 0 && allowProc) {
        game.healPlayer(Math.min(18, tb.lifeSteal), 0);
      }
      const kb = enemy.isBoss ? 4 : 14;
      const kdx = Math.cos(knockAng) * kb;
      const kdy = Math.sin(knockAng) * kb;
      const canStep = (tx, ty) => game.activeDungeon
        ? game.activeDungeon.isTileWalkable(tx, ty)
        : game.world.isTileWalkable(tx, ty);
      if (canStep(Math.floor((enemy.x + kdx) / TILE_SIZE), Math.floor(enemy.y / TILE_SIZE))) enemy.x += kdx;
      if (canStep(Math.floor(enemy.x / TILE_SIZE), Math.floor((enemy.y + kdy) / TILE_SIZE))) enemy.y += kdy;

      Balaclava.Audio.play(isCrit ? 'crit' : 'hit');
      game.addFloatingText(enemy.x, enemy.y - 22, isCrit && Balaclava.I18n ? Balaclava.I18n.t('combat.critFloat', { dmg }) : (isCrit ? '¡CRIT! ' : '') + '-' + dmg, isCrit ? '#ffd54f' : '#ff8a65');
      game.spawnParticles(enemy.x, enemy.y, enemy.color || '#ff5252', 6);

      if (enemy.hp <= 0) {
        enemy._dead = true;
        this.onEnemyKilled(game, enemy);
      }
      return true;
    }

    damageAnimal(game, animal, rawDmg, knockAng = 0, isCrit = false) {
      if (!animal || animal._dead || animal.hp <= 0) return false;
      const dmg = Math.max(1, Math.round(rawDmg));
      animal.hp -= dmg;
      animal.hitFlash = 0.16;
      animal.fleeTimer = 2.2;
      animal.vx = Math.cos(knockAng) * 58;
      animal.vy = Math.sin(knockAng) * 58;
      const kb = 12;
      const nx = animal.x + Math.cos(knockAng) * kb;
      const ny = animal.y + Math.sin(knockAng) * kb;
      if (game.world.isTileWalkable(Math.floor(nx / TILE_SIZE), Math.floor(animal.y / TILE_SIZE))) animal.x = nx;
      if (game.world.isTileWalkable(Math.floor(animal.x / TILE_SIZE), Math.floor(ny / TILE_SIZE))) animal.y = ny;

      Balaclava.Audio.play('hit');
      game.addFloatingText(animal.x, animal.y - 22, isCrit && Balaclava.I18n ? Balaclava.I18n.t('combat.critFloat', { dmg }) : (isCrit ? '¡CRIT! ' : '') + '-' + dmg, isCrit ? '#ffd54f' : '#ffb74d');
      game.spawnParticles(animal.x, animal.y, '#ef9a9a', 5);

      if (animal.hp <= 0) {
        animal._dead = true;
        game.world.sheep = game.world.sheep.filter(s => s !== animal);
        Balaclava.Audio.play('pickup');
        game.gainXp(animal.xp || 10);
        game.spawnParticles(animal.x, animal.y, '#ffe082', 9);
        const drops = Array.isArray(animal.drops) && animal.drops.length
          ? animal.drops
          : [{ id: 'carne', min: 1, max: 2 }, { id: 'lana', min: 1, max: 2 }];
        for (const dr of drops) {
          if (dr.chance !== undefined && Math.random() > dr.chance) continue;
          const q = randInt(dr.min || 1, dr.max || 1);
          game.spawnDrop(animal.x + randInt(-10, 10), animal.y + randInt(-10, 10), dr.id, q);
        }
      }
    }

    onEnemyKilled(game, enemy) {
      Balaclava.Audio.play('enemy_die');
      game.stats.kills++;
      if (enemy.biome) {
        game.stats.killsByBiome[enemy.biome] = (game.stats.killsByBiome[enemy.biome] || 0) + 1;
      } else if (game.activeDungeon) {
        const b = game.activeDungeon.id;
        game.stats.killsByBiome[b] = (game.stats.killsByBiome[b] || 0) + 1;
      }
      game.recordEncyclopedia('enemies', enemy.type);

      if (game.mods.killHeal) {
        game.healPlayer(game.mods.killHeal, 0);
      }

      if (enemy.isBoss && game.activeDungeon) {
        const dung = game.activeDungeon;
        dung.boss = null;
        dung.completed = true;
        if (!game.clearedDungeons.includes(dung.id)) {
          game.clearedDungeons.push(dung.id);
        }
        game.addCoins(enemy.coins);
        game.gainXp(enemy.xp);
        for (const [id, qty] of Object.entries(enemy.drops)) {
          game.addItem(id, qty);
        }
        if (dung.def.bossRelicId && typeof game.unlockPermanentRelic === 'function') {
          game.unlockPermanentRelic(dung.def.bossRelicId);
        }
        const cx = dung.bossArenaCenter ? dung.bossArenaCenter.tx : 31;
        const cy = dung.bossArenaCenter ? dung.bossArenaCenter.ty : 8;
        dung.chests.push({ tx: cx, ty: cy, opened: false, isBossChest: true });
        if (typeof dung.spawnExitPortal === 'function') {
          dung.spawnExitPortal(game);
        }
        Balaclava.Audio.play('levelup');
        game.toast(Balaclava.I18n ? Balaclava.I18n.t('dungeon.bossVictoryToast', { boss: enemy.name }) : `¡VICTORIA! Derrotaste a ${enemy.name}. ¡Abre el Cofre del Jefe y usa el Portal de Salida!`, 'success');
        if (game.economy && typeof game.economy.getBiomeUnlockProgress === 'function' && typeof game.economy.getBiomeProgressionOrder === 'function') {
          const gate = Balaclava.DUNGEON_GATES && Balaclava.DUNGEON_GATES[dung.id];
          const bId = (gate && gate.biome) || (dung.def && dung.def.themeKey);
          if (bId) {
            const curProg = game.economy.getBiomeUnlockProgress(game, bId);
            const order = game.economy.getBiomeProgressionOrder(game);
            const nextB = order[order.indexOf(bId) + 1];
            const nextBName = nextB && Balaclava.CONST && Balaclava.CONST.BIOMES && Balaclava.CONST.BIOMES[nextB] ? Balaclava.CONST.BIOMES[nextB].name : null;
            if (curProg && curProg.complete && nextBName) {
              const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage && Balaclava.I18n.getLanguage() === 'en';
              game.toast(
                isEn
                  ? `${curProg.biomeName} mastered (${curProg.unlocked}/${curProg.total} islands · ${curProg.dungeonsDone}/${curProg.dungeonsTotal} dungeons)! ${nextBName} unlocked!`
                  : `¡${curProg.biomeName} dominado (${curProg.unlocked}/${curProg.total} islas · ${curProg.dungeonsDone}/${curProg.dungeonsTotal} mazmorras)! ¡Ya puedes entrar en ${nextBName}!`,
                'success'
              );
            }
          }
        }
        return;
      }

      // Remove from world or dungeon list
      this.enemies = this.enemies.filter(e => e !== enemy);
      if (game.activeDungeon) {
        game.activeDungeon.enemies = game.activeDungeon.enemies.filter(e => e !== enemy);
        if (enemy.isMiniBoss && typeof game.activeDungeon.onMiniBossDefeated === 'function') {
          game.activeDungeon.onMiniBossDefeated(game);
        }
      }

      const def = ENEMY_DEFS[enemy.type];
      if (!def) return;
      const coinAmt = randInt(def.coins[0], def.coins[1]);
      const nightBonus = enemy.nocturnal ? 1.2 : 1.0;
      const distXp = enemy.xpMult || 1.0;
      game.spawnDrop(enemy.x, enemy.y, '_coin', Math.max(1, Math.round(coinAmt * 0.40 * nightBonus)));
      game.gainXp(Math.round(def.xp * nightBonus * distXp));

      for (const d of def.drops) {
        if (Math.random() <= d.chance * (1 + (game.mods.luckBonus || 0) * 0.4)) {
          game.spawnDrop(enemy.x + randInt(-12, 12), enemy.y + randInt(-12, 12), d.id, 1);
        }
      }
      if (enemy.nocturnal && Math.random() < 0.25) {
        game.spawnDrop(enemy.x + randInt(-10, 10), enemy.y + randInt(-10, 10), 'esencia_oscura', 1);
      }
    }
  }

  Balaclava.ENEMY_DEFS = ENEMY_DEFS;
  Balaclava.CombatSystem = CombatSystem;
})();
