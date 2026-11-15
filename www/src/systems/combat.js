(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { TILE_SIZE, PLOT_TILES } = Balaclava.CONST;
  const { dist, randInt, pick } = Balaclava.Utils;
  const clamp = Balaclava.Utils.clamp || ((v, a, b) => Math.max(a, Math.min(b, v)));

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

  const DEFAULT_BOSS_THEME = {
    color: '#ff7043',
    phaseVfx: 'aw_fire_chargeburst_max',
    slamVfx: 'aw_explosion_ground_b',
    leapVfx: 'pvfx_ground_slam',
    fissureVfx: 'pvfx_fire_pillar',
    meteorVfx: 'pvfx_meteor_strike',
    dashVfx: 'pa_slash2_fire',
    castVfx: 'pvfx_magic_circle',
    projVfx: 'aw_fire_fireball',
    projAltVfx: 'soggy_fireball',
    projImpactVfx: 'pvfx_fireball_impact',
    pillarVfx: 'pvfx_fire_pillar',
    status: { kind: 'burn', dur: 2.2, tickDmg: 3 }
  };

  const BOSS_THEMES = {
    pradera: {
      color: '#66bb6a',
      phaseVfx: 'aw_explosion_toxic',
      slamVfx: 'pvfx_acid_splash',
      leapVfx: 'pvfx_bubble_burst',
      fissureVfx: 'pvfx_poison_cloud',
      meteorVfx: 'pvfx_spore_burst',
      dashVfx: 'pa_slash1_green',
      castVfx: 'pvfx_magic_circle',
      projVfx: 'pvfx_acid_splash',
      projAltVfx: 'pvfx_poison_dart',
      projImpactVfx: 'aw_poison_splash',
      pillarVfx: 'pvfx_acid_splash',
      status: { kind: 'poison', dur: 2.4, tickDmg: 3 }
    },
    pradera_profunda: {
      color: '#9ccc65',
      phaseVfx: 'aw_explosion_debris',
      slamVfx: 'pvfx_hammer_smash',
      leapVfx: 'aw_explosion_ground_b',
      fissureVfx: 'pvfx_big_explosion',
      meteorVfx: 'mp9_fire_bomb',
      dashVfx: 'pvfx_axe_smear',
      castVfx: 'pvfx_power_up_aura',
      projVfx: 'pvfx_arrow_impact',
      projAltVfx: 'mp9_fire_bomb',
      projImpactVfx: 'pvfx_small_explosion',
      pillarVfx: 'pvfx_small_explosion',
      status: null
    },
    pradera_madriguera: {
      color: '#ffab91',
      phaseVfx: 'aw_explosion_debris',
      slamVfx: 'pvfx_big_explosion',
      leapVfx: 'pvfx_small_explosion',
      fissureVfx: 'aw_explosion_ground_a',
      meteorVfx: 'mp9_fire_bomb',
      dashVfx: 'aw_slash_x',
      castVfx: 'pvfx_smoke_bomb',
      projVfx: 'mp9_fire_bomb',
      projAltVfx: 'aw_fire_fireball',
      projImpactVfx: 'pvfx_small_explosion',
      pillarVfx: 'aw_explosion_debris',
      status: { kind: 'burn', dur: 1.8, tickDmg: 2 }
    },
    pradera_baston: {
      color: '#aed581',
      phaseVfx: 'aw_explosion_ground_b',
      slamVfx: 'pvfx_ground_slam',
      leapVfx: 'aw_earth_rockspike',
      fissureVfx: 'pvfx_fissure',
      meteorVfx: 'pvfx_rock_shatter',
      dashVfx: 'pvfx_axe_smear',
      castVfx: 'pvfx_power_up_aura',
      projVfx: 'pvfx_rock_shatter',
      projAltVfx: 'pvfx_wind_blade',
      projImpactVfx: 'aw_hit_heavy',
      pillarVfx: 'pvfx_earth_spike',
      status: { kind: 'bleed', dur: 2.0, tickDmg: 3 }
    },
    pradera_bosquecillo: {
      color: '#66bb6a',
      phaseVfx: 'pvfx_leaf_storm',
      slamVfx: 'pvfx_vine_snare',
      leapVfx: 'pvfx_spore_burst',
      fissureVfx: 'pvfx_earth_spike',
      meteorVfx: 'pvfx_leaf_storm',
      dashVfx: 'pa_slash1_green',
      castVfx: 'pvfx_magic_circle',
      projVfx: 'pvfx_wind_blade',
      projAltVfx: 'pvfx_poison_dart',
      projImpactVfx: 'pvfx_leaf_storm',
      pillarVfx: 'pvfx_vine_snare',
      status: { kind: 'slow', dur: 1.9 }
    },
    desierto: {
      color: '#ffab40',
      phaseVfx: 'aw_explosion_ground_b',
      slamVfx: 'pvfx_dust_puff',
      leapVfx: 'pvfx_ground_slam',
      fissureVfx: 'pvfx_fissure',
      meteorVfx: 'pvfx_earth_spike',
      dashVfx: 'aw_thrust_stab',
      castVfx: 'pvfx_power_up_aura',
      projVfx: 'pvfx_poison_dart',
      projAltVfx: 'aw_fire_fireball',
      projImpactVfx: 'pvfx_acid_splash',
      pillarVfx: 'pvfx_earth_spike',
      status: { kind: 'poison', dur: 2.2, tickDmg: 3 }
    },
    desierto_piramide: {
      color: '#ffd54f',
      phaseVfx: 'pvfx_holy_smite',
      slamVfx: 'pvfx_divine_beam',
      leapVfx: 'pa_slash3_gold',
      fissureVfx: 'aw_holy_pillar',
      meteorVfx: 'pvfx_holy_smite',
      dashVfx: 'pvfx_sword_combo',
      castVfx: 'px_magic_circle',
      projVfx: 'px_energy_bolt',
      projAltVfx: 'pvfx_magic_missile',
      projImpactVfx: 'holy_impact',
      pillarVfx: 'aw_holy_pillar',
      status: { kind: 'burn', dur: 1.8, tickDmg: 3 }
    },
    desierto_oasis: {
      color: '#26c6da',
      phaseVfx: 'pvfx_tidal_wave',
      slamVfx: 'pvfx_water_geyser',
      leapVfx: 'pvfx_water_splash',
      fissureVfx: 'pvfx_water_geyser',
      meteorVfx: 'pvfx_bubble_burst',
      dashVfx: 'pa_slash2_cyan',
      castVfx: 'pvfx_whirlpool',
      projVfx: 'pvfx_poison_dart',
      projAltVfx: 'pvfx_ice_shard',
      projImpactVfx: 'aw_water_splash',
      pillarVfx: 'pvfx_water_geyser',
      status: { kind: 'poison', dur: 2.2, tickDmg: 3 }
    },
    desierto_catacumbas: {
      color: '#ffca28',
      phaseVfx: 'pvfx_curse',
      slamVfx: 'pvfx_void_implosion',
      leapVfx: 'pvfx_arcane_burst',
      fissureVfx: 'aw_shadow_spikes',
      meteorVfx: 'pvfx_curse',
      dashVfx: 'pa_slash1_purple',
      castVfx: 'px_magic_circle',
      projVfx: 'pvfx_magic_missile',
      projAltVfx: 'mp9_dark_bolt',
      projImpactVfx: 'pvfx_arcane_burst',
      pillarVfx: 'pvfx_curse',
      status: { kind: 'curse', dur: 2.4 }
    },
    desierto_solario: {
      color: '#ffb300',
      phaseVfx: 'aw_fire_chargeburst_max',
      slamVfx: 'pvfx_holy_smite',
      leapVfx: 'pvfx_divine_beam',
      fissureVfx: 'aw_holy_pillar',
      meteorVfx: 'pvfx_meteor_strike',
      dashVfx: 'pa_slash3_gold',
      castVfx: 'pvfx_magic_circle',
      projVfx: 'pvfx_arcane_orb_projectile',
      projAltVfx: 'aw_fire_fireball',
      projImpactVfx: 'holy_impact',
      pillarVfx: 'pvfx_divine_beam',
      status: { kind: 'burn', dur: 2.2, tickDmg: 4 }
    },
    bosque_oscuro: {
      color: '#ba68c8',
      phaseVfx: 'pvfx_void_implosion',
      slamVfx: 'aw_explosion_dark',
      leapVfx: 'aw_shadow_spikes',
      fissureVfx: 'aw_shadow_spikes',
      meteorVfx: 'pvfx_curse',
      dashVfx: 'pvfx_shadow_claw',
      castVfx: 'pvfx_magic_circle',
      projVfx: 'mp9_dark_bolt',
      projAltVfx: 'pvfx_shadow_bolt',
      projImpactVfx: 'aw_explosion_dark',
      pillarVfx: 'aw_shadow_spikes',
      status: { kind: 'curse', dur: 2.4 }
    },
    bosque_necro: {
      color: '#9575cd',
      phaseVfx: 'aw_explosion_dark',
      slamVfx: 'pvfx_soul_drain',
      leapVfx: 'pvfx_void_implosion',
      fissureVfx: 'aw_shadow_spikes',
      meteorVfx: 'pvfx_curse',
      dashVfx: 'pa_slash1_purple',
      castVfx: 'px_magic_circle',
      projVfx: 'pvfx_shadow_bolt',
      projAltVfx: 'mp9_dark_bolt',
      projImpactVfx: 'pvfx_curse',
      pillarVfx: 'pvfx_soul_drain',
      status: { kind: 'bleed', dur: 2.2, tickDmg: 3 }
    },
    bosque_laboratorio: {
      color: '#7e57c2',
      phaseVfx: 'aw_explosion_electric',
      slamVfx: 'pvfx_static_burst',
      leapVfx: 'aw_explosion_energy',
      fissureVfx: 'pvfx_chain_lightning',
      meteorVfx: 'pvfx_lightning_strike',
      dashVfx: 'aw_lightning_orb',
      castVfx: 'aw_arcane_charge',
      projVfx: 'pvfx_arcane_orb_projectile',
      projAltVfx: 'aw_lightning_orb',
      projImpactVfx: 'aw_arcane_impact',
      pillarVfx: 'pvfx_lightning_strike',
      status: { kind: 'shock', dur: 2.0 }
    },
    bosque_arana: {
      color: '#9ccc65',
      phaseVfx: 'aw_explosion_toxic',
      slamVfx: 'pvfx_poison_cloud',
      leapVfx: 'pvfx_acid_splash',
      fissureVfx: 'aw_poison_splash',
      meteorVfx: 'pvfx_spore_burst',
      dashVfx: 'aw_claw_swipe',
      castVfx: 'pvfx_rune_trap',
      projVfx: 'pvfx_poison_dart',
      projAltVfx: 'pvfx_ice_shard',
      projImpactVfx: 'aw_poison_splash',
      pillarVfx: 'pvfx_poison_cloud',
      status: { kind: 'poison', dur: 2.5, tickDmg: 4 }
    },
    bosque_pantano: {
      color: '#26a69a',
      phaseVfx: 'aw_explosion_toxic',
      slamVfx: 'pvfx_tidal_wave',
      leapVfx: 'pvfx_acid_splash',
      fissureVfx: 'pvfx_poison_cloud',
      meteorVfx: 'pvfx_water_geyser',
      dashVfx: 'pa_slash1_green',
      castVfx: 'pvfx_whirlpool',
      projVfx: 'pvfx_acid_splash',
      projAltVfx: 'pvfx_poison_dart',
      projImpactVfx: 'aw_poison_splash',
      pillarVfx: 'pvfx_water_geyser',
      status: { kind: 'poison', dur: 2.5, tickDmg: 4 }
    },
    montanas_heladas: {
      color: '#80e5ff',
      phaseVfx: 'aw_ice_chargeshatter',
      slamVfx: 'pvfx_frost_nova',
      leapVfx: 'pvfx_ground_slam',
      fissureVfx: 'aw_ice_spikewave',
      meteorVfx: 'pvfx_ice_spike',
      dashVfx: 'pa_slash2_cyan',
      castVfx: 'aw_ice_castfrost',
      projVfx: 'pvfx_ice_shard',
      projAltVfx: 'aw_ice_spear',
      projImpactVfx: 'aw_ice_impact',
      pillarVfx: 'pvfx_ice_spike',
      status: { kind: 'slow', dur: 2.2 }
    },
    montanas_glaciar: {
      color: '#4fc3f7',
      phaseVfx: 'aw_ice_chargeshatter',
      slamVfx: 'pvfx_frost_nova',
      leapVfx: 'aw_explosion_energy',
      fissureVfx: 'aw_ice_spikewave',
      meteorVfx: 'pvfx_ice_spike',
      dashVfx: 'pa_frost1',
      castVfx: 'aw_ice_castfrost',
      projVfx: 'aw_ice_spear',
      projAltVfx: 'pvfx_ice_shard',
      projImpactVfx: 'pvfx_snowball_impact',
      pillarVfx: 'pvfx_ice_wall',
      status: { kind: 'slow', dur: 2.3 }
    },
    montanas_mina: {
      color: '#4fc3f7',
      phaseVfx: 'aw_explosion_energy',
      slamVfx: 'aw_earth_rockspike',
      leapVfx: 'pvfx_ground_slam',
      fissureVfx: 'pvfx_fissure',
      meteorVfx: 'pvfx_ice_spike',
      dashVfx: 'pvfx_hammer_smash',
      castVfx: 'pvfx_rune_trap',
      projVfx: 'aw_ice_spear',
      projAltVfx: 'px_energy_bolt',
      projImpactVfx: 'aw_ice_impact',
      pillarVfx: 'pvfx_earth_spike',
      status: { kind: 'slow', dur: 2.0 }
    },
    montanas_fortaleza: {
      color: '#90caf9',
      phaseVfx: 'aw_explosion_electric',
      slamVfx: 'pvfx_thunder_cloud',
      leapVfx: 'pvfx_lightning_strike',
      fissureVfx: 'pvfx_chain_lightning',
      meteorVfx: 'aw_lightning_strike',
      dashVfx: 'aw_slash_spin',
      castVfx: 'aw_lightning_charge',
      projVfx: 'aw_lightning_orb',
      projAltVfx: 'px_energy_bolt',
      projImpactVfx: 'pvfx_static_burst',
      pillarVfx: 'pvfx_lightning_strike',
      status: { kind: 'shock', dur: 2.1 }
    },
    tierras_volcanicas: { ...DEFAULT_BOSS_THEME, color: '#ff5722' },
    volcan_abismo: { ...DEFAULT_BOSS_THEME, color: '#ff1744', phaseVfx: 'pvfx_void_implosion', dashVfx: 'pa_fire2' },
    volcan_fragua: {
      ...DEFAULT_BOSS_THEME,
      color: '#ff7043',
      slamVfx: 'pvfx_hammer_smash',
      fissureVfx: 'pvfx_lava_burst',
      dashVfx: 'pvfx_axe_smear'
    },
    volcan_caldera: {
      ...DEFAULT_BOSS_THEME,
      color: '#ffca28',
      phaseVfx: 'pvfx_fire_tornado',
      slamVfx: 'pvfx_fire_nova',
      fissureVfx: 'pvfx_fire_tornado',
      meteorVfx: 'pvfx_fire_pillar'
    },
    volcan_trono_ceniza: {
      ...DEFAULT_BOSS_THEME,
      color: '#ff1744',
      phaseVfx: 'aw_fire_chargeburst_max',
      slamVfx: 'soggy_incinerate',
      fissureVfx: 'pvfx_fire_pillar',
      meteorVfx: 'pvfx_meteor_strike',
      dashVfx: 'soggy_fire_slash'
    }
  };

  function getBossTheme(dungeonId) {
    return BOSS_THEMES[dungeonId] || DEFAULT_BOSS_THEME;
  }

  function getMobProfile(enemy) {
    const t = String((enemy && enemy.type) || 'slime');
    if (enemy && enemy.isMiniBoss) {
      if (enemy.ranged || /mage|shaman|necro/i.test(t)) {
        return {
          behavior: 'ranged_fan', windupVfx: 'pvfx_magic_circle', meleeVfx: 'pa_slash1_purple',
          specialVfx: 'pvfx_arcane_burst', audio: 'magic',
          proj: { vfxKey: 'pvfx_magic_missile', impactVfx: 'pvfx_arcane_burst', color: '#ce93d8', speed: 245, count: 5, spread: 0.22 },
          status: { kind: 'curse', dur: 2.0 }
        };
      }
      if (/golem|brute|orc|mace|rock/i.test(t)) {
        return {
          behavior: 'leaper', windupVfx: 'pvfx_power_up_aura', meleeVfx: 'pvfx_hammer_smash',
          specialVfx: 'aw_earth_rockspike', audio: 'bomb',
          proj: { vfxKey: 'pvfx_rock_shatter', impactVfx: 'aw_hit_heavy', color: '#ffab91', speed: 215, count: 6, spread: 0 },
          status: { kind: 'bleed', dur: 2.2, tickDmg: 3 }
        };
      }
      return {
        behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'pvfx_sword_combo',
        specialVfx: 'aw_slash_spin', audio: 'slash',
        proj: { vfxKey: 'pvfx_wind_blade', impactVfx: 'pvfx_hit_spark', color: '#ffd54f', speed: 255, count: 3, spread: 0.24 },
        status: { kind: 'bleed', dur: 2.0, tickDmg: 3 }
      };
    }

    switch (t) {
      case 'slime':
        return { behavior: 'leaper', windupVfx: 'pvfx_bubble_burst', meleeVfx: 'pvfx_water_splash', specialVfx: 'pvfx_bubble_burst', audio: 'hit' };
      case 'golden_slime':
        return { behavior: 'leaper', windupVfx: 'pvfx_treasure_glint', meleeVfx: 'pvfx_star_burst_pickup', specialVfx: 'aw_explosion_energy', audio: 'hit' };
      case 'slime_blue':
      case 'frost_jelly':
        return {
          behavior: 'leaper', windupVfx: 'aw_ice_castfrost', meleeVfx: 'pvfx_snowball_impact', specialVfx: 'pvfx_frost_nova', audio: 'magic',
          proj: t === 'frost_jelly' ? { vfxKey: 'pvfx_ice_shard', impactVfx: 'aw_ice_impact', color: '#80deea', speed: 205, radial: 4 } : null,
          status: { kind: 'slow', dur: 1.9 }
        };
      case 'slime_red':
      case 'crimson_jelly':
        return {
          behavior: 'leaper', windupVfx: 'pvfx_burning_aura', meleeVfx: 'pa_blood2', specialVfx: 'pvfx_lava_burst', audio: 'bomb',
          proj: t === 'crimson_jelly' ? { vfxKey: 'aw_fire_fireball', impactVfx: 'pvfx_fireball_impact', color: '#ff5252', speed: 210, radial: 4 } : null,
          status: { kind: 'burn', dur: 2.1, tickDmg: 3 }
        };
      case 'slime_toxic':
        return {
          behavior: 'leaper', windupVfx: 'pvfx_poison_cloud', meleeVfx: 'aw_poison_splash', specialVfx: 'pvfx_acid_splash', audio: 'hit',
          leavesPool: true, poolColor: '#7cb342', status: { kind: 'poison', dur: 2.2, tickDmg: 3 }
        };
      case 'void_jelly':
        return {
          behavior: 'blink_caster', windupVfx: 'pvfx_blink_out', meleeVfx: 'dark_vfx1', specialVfx: 'pvfx_void_implosion', audio: 'magic',
          proj: { vfxKey: 'mp9_dark_bolt', impactVfx: 'aw_explosion_dark', color: '#ab47bc', speed: 220, radial: 4 },
          status: { kind: 'curse', dur: 2.0 }
        };
      case 'mushroom_mob':
      case 'mushroom_purple':
        return {
          behavior: 'spore_burst', windupVfx: t === 'mushroom_purple' ? 'pvfx_curse' : 'pvfx_poison_cloud',
          meleeVfx: 'pvfx_spore_burst', specialVfx: 'pvfx_spore_burst', audio: 'magic',
          leavesPool: true, poolColor: t === 'mushroom_purple' ? '#ab47bc' : '#9ccc65',
          status: { kind: 'poison', dur: 2.2, tickDmg: 3 }
        };
      case 'skeleton':
        return { behavior: 'melee_combo', meleeVfx: 'pa_slash1_blue', specialVfx: 'pvfx_hit_spark', audio: 'slash' };
      case 'skel_swordsman':
        return { behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'pvfx_sword_combo', specialVfx: 'aw_slash_diagonal', audio: 'slash' };
      case 'skel_spearman':
        return { behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'pvfx_spear_thrust', specialVfx: 'aw_thrust_stab', audio: 'slash' };
      case 'dark_lancer':
        return {
          behavior: 'charger', windupVfx: 'dark_vfx1', meleeVfx: 'aw_thrust_stab', specialVfx: 'aw_shadow_spikes', audio: 'slash',
          status: { kind: 'bleed', dur: 2.0, tickDmg: 3 }
        };
      case 'grave_revenant':
        return {
          behavior: 'melee_combo', windupVfx: 'pvfx_curse', meleeVfx: 'pa_slash1_purple', specialVfx: 'pvfx_soul_drain', audio: 'slash',
          status: { kind: 'bleed', dur: 2.2, tickDmg: 3 }
        };
      case 'zombie':
      case 'sand_ghoul':
        return {
          behavior: 'melee_combo',
          meleeVfx: 'aw_claw_swipe',
          specialVfx: t === 'sand_ghoul' ? 'pvfx_dust_puff' : 'pvfx_poison_cloud',
          audio: 'hit',
          status: t === 'zombie' ? { kind: 'poison', dur: 1.8, tickDmg: 2 } : null
        };
      case 'rat':
        return { behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'aw_punch_swoosh', specialVfx: 'pvfx_hit_spark', audio: 'hit' };
      case 'rat_giant':
        return {
          behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'pvfx_bleeding', specialVfx: 'aw_claw_swipe', audio: 'slash',
          status: { kind: 'bleed', dur: 2.2, tickDmg: 3 }
        };
      case 'wolf':
        return {
          behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'aw_claw_swipe', specialVfx: 'pa_rogue1', audio: 'slash',
          status: { kind: 'bleed', dur: 1.8, tickDmg: 2 }
        };
      case 'shadow_wolf':
        return {
          behavior: 'charger', windupVfx: 'pvfx_blink_out', meleeVfx: 'pvfx_shadow_claw', specialVfx: 'aw_explosion_dark', audio: 'slash',
          status: { kind: 'bleed', dur: 2.2, tickDmg: 3 }
        };
      case 'toxic_hound':
        return {
          behavior: 'charger', windupVfx: 'pvfx_acid_splash', meleeVfx: 'aw_claw_swipe', specialVfx: 'aw_poison_splash', audio: 'slash',
          status: { kind: 'poison', dur: 2.2, tickDmg: 3 }
        };
      case 'orc':
        return {
          behavior: 'charger', windupVfx: 'pvfx_power_up_aura', meleeVfx: 'pvfx_axe_smear', specialVfx: 'aw_slash_heavy', audio: 'slash',
          status: { kind: 'bleed', dur: 2.0, tickDmg: 3 }
        };
      case 'golem':
      case 'rock_golem':
        return {
          behavior: 'leaper', windupVfx: 'pvfx_rock_shatter', meleeVfx: 'pvfx_hammer_smash',
          specialVfx: t === 'rock_golem' ? 'aw_earth_rockspike' : 'pvfx_ground_slam', audio: 'bomb'
        };
      case 'tunneling_mole':
        return {
          behavior: 'burrower', windupVfx: 'pvfx_dust_puff', meleeVfx: 'pvfx_rock_shatter',
          specialVfx: 'pvfx_earth_spike', pillarVfx: 'pvfx_fissure', audio: 'bomb'
        };
      case 'mimic':
        return {
          behavior: 'charger', windupVfx: 'pvfx_treasure_glint', meleeVfx: 'pvfx_crit_hit', specialVfx: 'pa_blood3', audio: 'crit',
          status: { kind: 'bleed', dur: 2.2, tickDmg: 3 }
        };
      case 'scorpion':
      case 'royal_scarab':
        return {
          behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'aw_thrust_stab', specialVfx: 'aw_poison_splash', audio: 'slash',
          proj: t === 'royal_scarab' ? { vfxKey: 'pvfx_poison_dart', impactVfx: 'pvfx_acid_splash', color: '#ffd54f', speed: 225, count: 3, spread: 0.25 } : null,
          status: { kind: 'poison', dur: 2.1, tickDmg: 3 }
        };
      case 'cobra':
      case 'vine_snake':
        return {
          behavior: 'ranged_single',
          windupVfx: t === 'vine_snake' ? 'pvfx_vine_snare' : 'pvfx_poison_cloud',
          meleeVfx: 'aw_claw_swipe',
          specialVfx: t === 'vine_snake' ? 'pvfx_vine_snare' : 'pvfx_acid_splash',
          audio: 'magic',
          proj: { vfxKey: 'pvfx_poison_dart', impactVfx: t === 'vine_snake' ? 'pvfx_vine_snare' : 'pvfx_acid_splash', color: '#8bc34a', speed: 230 },
          status: t === 'vine_snake' ? { kind: 'slow', dur: 1.9 } : { kind: 'poison', dur: 2.0, tickDmg: 3 }
        };
      case 'spider':
      case 'cave_spider':
        return {
          behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'aw_claw_swipe', specialVfx: 'pvfx_dust_puff', audio: 'slash',
          proj: { vfxKey: 'pvfx_wind_blade', impactVfx: 'pvfx_dust_puff', color: '#eceff1', speed: 215, kind: 'web' },
          status: { kind: 'slow', dur: 1.7 }
        };
      case 'beetle':
        return { behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'pvfx_hit_spark', specialVfx: 'pvfx_rock_shatter', audio: 'hit' };
      case 'beetle_fire':
      case 'lava_ant':
        return {
          behavior: 'charger', windupVfx: 'pvfx_burning_aura', meleeVfx: 'pa_slash2_fire', specialVfx: 'pvfx_lava_burst', audio: 'bomb',
          status: { kind: 'burn', dur: 2.1, tickDmg: 3 }
        };
      case 'acid_ant':
        return {
          behavior: 'ranged_single', windupVfx: 'pvfx_acid_splash', meleeVfx: 'aw_poison_splash', specialVfx: 'pvfx_acid_splash', audio: 'magic',
          proj: { vfxKey: 'pvfx_poison_dart', impactVfx: 'pvfx_acid_splash', color: '#a5d6a7', speed: 225 },
          leavesPool: true, poolColor: '#8bc34a', status: { kind: 'poison', dur: 2.1, tickDmg: 3 }
        };
      case 'goblin':
        return { behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'pa_slash1_red', specialVfx: 'pvfx_hit_spark', audio: 'slash' };
      case 'goblin_raider':
        return { behavior: 'charger', windupVfx: 'pvfx_dash_dust', meleeVfx: 'pvfx_sword_combo', specialVfx: 'aw_slash_diagonal', audio: 'slash' };
      case 'goblin_tnt':
      case 'goblin_barrel':
      case 'goblin_sapper':
        return {
          behavior: 'bomber',
          windupVfx: 'pvfx_smoke_bomb',
          meleeVfx: 'pvfx_small_explosion',
          specialVfx: t === 'goblin_barrel' ? 'pvfx_big_explosion' : 'aw_explosion_debris',
          bombRadius: t === 'goblin_barrel' ? 66 : 48,
          audio: 'bomb',
          status: { kind: 'burn', dur: 1.6, tickDmg: 2 }
        };
      case 'goblin_archer':
      case 'skeleton_archer':
      case 'brittle_archer':
      case 'skel_crossbow':
        return {
          behavior: 'ranged_single', windupVfx: 'pvfx_hit_spark', meleeVfx: 'pvfx_arrow_impact', audio: 'slash',
          proj: {
            vfxKey: 'pvfx_arrow_impact',
            impactVfx: 'pvfx_hit_spark',
            color: '#cfd8dc',
            speed: t === 'skel_crossbow' ? 285 : 245,
            count: t === 'skel_crossbow' ? 2 : 1,
            spread: 0.14
          }
        };
      case 'goblin_shaman':
        return {
          behavior: 'ranged_fan', windupVfx: 'pvfx_thunder_cloud', meleeVfx: 'pvfx_static_burst',
          specialVfx: 'pvfx_lightning_strike', audio: 'thunder',
          proj: { vfxKey: 'aw_lightning_orb', impactVfx: 'pvfx_static_burst', color: '#80deea', speed: 225, count: 3, spread: 0.24 },
          status: { kind: 'shock', dur: 1.8 }
        };
      case 'skeleton_mage':
      case 'skel_mage_dark':
      case 'cultist': {
        const dark = t !== 'skeleton_mage';
        return {
          behavior: 'ranged_fan', windupVfx: 'pvfx_magic_circle', meleeVfx: dark ? 'aw_explosion_dark' : 'pvfx_arcane_burst', audio: 'magic',
          proj: {
            vfxKey: dark ? 'mp9_dark_bolt' : 'pvfx_magic_missile',
            impactVfx: dark ? 'aw_explosion_dark' : 'pvfx_arcane_burst',
            color: dark ? '#ce93d8' : '#7e57c2',
            speed: 220,
            count: 3,
            spread: 0.22,
            homing: dark ? 1.15 : 0
          },
          status: dark ? { kind: 'curse', dur: 2.0 } : null
        };
      }
      case 'fire_elem':
      case 'magma':
      case 'imp':
      case 'flaming_skull':
        return {
          behavior: (t === 'imp' || t === 'fire_elem') ? 'ranged_fan' : 'ranged_single',
          windupVfx: 'aw_fire_castflame',
          meleeVfx: 'soggy_fire_slash',
          specialVfx: t === 'fire_elem' ? 'pvfx_fire_pillar' : 'soggy_fireclouds',
          audio: 'magic',
          proj: {
            vfxKey: t === 'flaming_skull' ? 'soggy_fireball' : 'aw_fire_fireball',
            impactVfx: 'pvfx_fireball_impact',
            color: '#ff7043',
            speed: 235,
            count: t === 'imp' ? 3 : 1,
            spread: 0.22
          },
          status: { kind: 'burn', dur: 2.1, tickDmg: 3 }
        };
      case 'wisp':
      case 'wisp_green':
        return {
          behavior: 'ranged_single',
          windupVfx: t === 'wisp_green' ? 'pvfx_leaf_storm' : 'aw_arcane_charge',
          meleeVfx: t === 'wisp_green' ? 'pvfx_leaf_gust' : 'pvfx_arcane_burst',
          audio: 'magic',
          proj: {
            vfxKey: t === 'wisp_green' ? 'pvfx_wind_blade' : 'px_energy_bolt',
            impactVfx: t === 'wisp_green' ? 'pvfx_leaf_storm' : 'pvfx_arcane_burst',
            color: t === 'wisp_green' ? '#81c784' : '#4fc3f7',
            speed: 228
          }
        };
      case 'floating_eye':
      case 'ghastly_eye':
        return {
          behavior: 'beam_caster',
          windupVfx: t === 'ghastly_eye' ? 'pvfx_void_implosion' : 'aw_arcane_charge',
          meleeVfx: 'pvfx_arcane_burst',
          specialVfx: t === 'ghastly_eye' ? 'pvfx_void_implosion' : 'pvfx_arcane_beam',
          audio: 'magic',
          proj: {
            vfxKey: t === 'ghastly_eye' ? 'mp9_dark_bolt' : 'aw_arcane_missile',
            impactVfx: t === 'ghastly_eye' ? 'aw_explosion_dark' : 'aw_arcane_impact',
            color: t === 'ghastly_eye' ? '#ba68c8' : '#80d8ff',
            speed: 250,
            homing: 1.35
          },
          status: t === 'ghastly_eye' ? { kind: 'curse', dur: 2.0 } : null
        };
      case 'bat':
      case 'vampire_bat':
      case 'plague_bat':
        return {
          behavior: 'vampire_swoop',
          windupVfx: 'pvfx_dash_dust',
          meleeVfx: t === 'vampire_bat' ? 'pvfx_soul_drain' : t === 'plague_bat' ? 'pvfx_poison_cloud' : 'pvfx_blood_splat',
          specialVfx: t === 'plague_bat' ? 'pvfx_poison_cloud' : 'pvfx_blood_splat',
          lifesteal: t === 'vampire_bat' ? 0.35 : 0,
          audio: 'slash',
          status: t === 'plague_bat' ? { kind: 'poison', dur: 2.1, tickDmg: 3 } : (t === 'vampire_bat' ? { kind: 'bleed', dur: 1.8, tickDmg: 2 } : null)
        };
      case 'ghost':
      case 'ghost_spectral':
        return {
          behavior: 'blink_caster',
          windupVfx: 'pvfx_blink_out',
          meleeVfx: 'aw_explosion_dark',
          specialVfx: 'pvfx_teleport_in',
          audio: 'magic',
          proj: { vfxKey: 'pvfx_ice_shard', impactVfx: 'pvfx_snowball_impact', color: '#b39ddb', speed: 225, count: t === 'ghost_spectral' ? 3 : 1, spread: 0.22 },
          status: { kind: 'slow', dur: 1.8 }
        };
      default:
        return { behavior: 'melee_combo', meleeVfx: 'aw_claw_swipe', specialVfx: 'pvfx_hit_spark', audio: 'hit' };
    }
  }

  function spawnStrikeVfx(game, key, x, y, angle = 0, scale = 0.85) {
    if (!game || !game.spawnFx || !key) return;
    game.spawnFx(key, x, y, angle, 0.32, scale, 0.96, { blend: 'lighter' });
  }

  function executeMeleeStrike(game, enemy, angle, dmgMult = 1) {
    const prof = getMobProfile(enemy);
    const hitX = (enemy.x + game.player.x) * 0.5;
    const hitY = (enemy.y + game.player.y) * 0.5;
    spawnStrikeVfx(game, prof.meleeVfx || 'aw_claw_swipe', hitX, hitY - 4, angle, 0.82);
    if (prof.specialVfx && prof.behavior === 'spore_burst') {
      spawnStrikeVfx(game, prof.specialVfx, enemy.x, enemy.y, 0, 0.95);
    }
    if (Balaclava.Audio) Balaclava.Audio.play(prof.audio || 'hit');
    const dmg = Math.max(1, Math.round((enemy.dmg || 8) * dmgMult));
    game.damagePlayer(dmg, { status: prof.status || null });
    if (prof.lifesteal && enemy.hp > 0 && enemy.maxHp) {
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.max(3, Math.round(dmg * prof.lifesteal)));
    }
  }

  function fireMobVolley(game, enemy, angle, opts = {}) {
    const prof = getMobProfile(enemy);
    const pCfg = prof.proj || { vfxKey: 'px_energy_bolt', impactVfx: 'pvfx_hit_spark', color: enemy.color || '#ff7043', speed: 225 };
    const count = opts.count || pCfg.count || 1;
    const spread = opts.spread !== undefined ? opts.spread : (pCfg.spread || 0.20);
    const spd = (opts.speed || pCfg.speed || 225) * (opts.speedMult || 1);
    const dmg = Math.max(1, Math.round((enemy.dmg || 10) * (opts.dmgMult || 0.90)));
    if (prof.windupVfx) spawnStrikeVfx(game, prof.windupVfx, enemy.x, enemy.y - 6, angle, 0.65);
    if (Balaclava.Audio) Balaclava.Audio.play(prof.audio || 'magic');

    const projOpts = {
      vfxKey: pCfg.vfxKey,
      impactVfx: pCfg.impactVfx,
      kind: pCfg.kind || null,
      homing: pCfg.homing || 0,
      status: prof.status || null
    };
    if (pCfg.radial && pCfg.radial > 1) {
      for (let k = 0; k < pCfg.radial; k++) {
        const a = angle + (k / pCfg.radial) * Math.PI * 2;
        game.spawnEnemyProjectile(enemy.x, enemy.y, Math.cos(a) * spd, Math.sin(a) * spd, dmg, pCfg.color || enemy.color, projOpts);
      }
      return;
    }
    const half = (count - 1) / 2;
    for (let k = 0; k < count; k++) {
      const a = angle + (k - half) * spread;
      game.spawnEnemyProjectile(enemy.x, enemy.y, Math.cos(a) * spd, Math.sin(a) * spd, dmg, pCfg.color || enemy.color, projOpts);
    }
  }

  function updateHazards(game, hazards, canWalkPx, dt) {
    if (!Array.isArray(hazards) || hazards.length === 0) return;
    const pPx = game.player.x;
    const pPy = game.player.y;
    const themeFallback = (game.activeDungeon && game.activeDungeon.def) ? game.activeDungeon.def : null;
    for (let hi = hazards.length - 1; hi >= 0; hi--) {
      const z = hazards[hi];
      if (!z) { hazards.splice(hi, 1); continue; }
      z.timer = (z.timer || 0) + dt;
      if (z.kind === 'fissure') {
        if (z.timer >= (z.delay || 0.85) && z.timer < (z.duration || 1.75)) {
          if (!z.erupted) {
            z.erupted = true;
            if (Balaclava.Audio) Balaclava.Audio.play('bomb');
            if (game.shake) game.shake(0.18, 4);
            for (const tFrac of [0.15, 0.5, 0.85]) {
              const ex = z.x + (z.x2 - z.x) * tFrac;
              const ey = z.y + (z.y2 - z.y) * tFrac;
              if (game.spawnFx) game.spawnFx(z.vfxKey || 'pvfx_fire_pillar', ex, ey - 10, 0, 0.55, 0.95, 0.96, { blend: 'lighter' });
            }
          }
          z.tickCd = (z.tickCd || 0) - dt;
          if (z.tickCd <= 0) {
            z.tickCd = 0.42;
            const dx = (z.x2 || z.x) - z.x;
            const dy = (z.y2 || z.y) - z.y;
            const lenSq = Math.max(1, dx * dx + dy * dy);
            const t = clamp(((pPx - z.x) * dx + (pPy - z.y) * dy) / lenSq, 0, 1);
            const projX = z.x + t * dx;
            const projY = z.y + t * dy;
            if (Math.hypot(pPx - projX, pPy - projY) <= (z.halfW || 18) + 12) {
              game.damagePlayer(Math.round(z.dmg || 16), { isMagic: true, status: z.status || null });
            }
          }
        }
        if (z.timer >= (z.duration || 1.75)) hazards.splice(hi, 1);
      } else if (z.kind === 'meteor' || z.kind === 'bomb' || z.kind === 'pillar') {
        if (!z.detonated && z.timer >= (z.delay || 0.95)) {
          z.detonated = true;
          const r = z.radius || 54;
          if (Balaclava.Audio) Balaclava.Audio.play(z.kind === 'pillar' ? 'thunder' : 'bomb');
          if (game.spawnShockwave) game.spawnShockwave(z.x, z.y, r + 16, z.color || '#ff5252');
          if (game.spawnFx) {
            const vfx = z.vfxKey || (z.kind === 'bomb' ? 'pvfx_big_explosion' : z.kind === 'pillar' ? 'pvfx_fire_pillar' : 'pvfx_meteor_strike');
            game.spawnFx(vfx, z.x, z.y - (z.kind === 'pillar' ? 14 : 4), 0, 0.52, r >= 60 ? 1.15 : 0.9, 0.98, { blend: 'lighter' });
          }
          if (game.shake) game.shake(0.18, 4);
          if (dist(pPx, pPy, z.x, z.y) <= r) {
            game.damagePlayer(Math.round(z.dmg || (themeFallback && themeFallback.boss ? themeFallback.boss.dmg * 1.1 : 18)), { isMagic: true, status: z.status || null });
          }
        } else if (z.detonated && !z.oneShot) {
          z.tickCd = (z.tickCd || 0) - dt;
          if (z.tickCd <= 0) {
            z.tickCd = 0.45;
            if (dist(pPx, pPy, z.x, z.y) <= (z.radius || 54) * 0.85) {
              game.damagePlayer(Math.max(4, Math.round((z.dmg || 16) * 0.35)), { isMagic: true, status: z.status || null });
            }
          }
        }
        if (z.timer >= (z.duration || (z.oneShot ? (z.delay || 0.95) + 0.15 : 2.8))) hazards.splice(hi, 1);
      } else {
        if (z.vfxKey && !z._vfxSpawned && game.spawnFx) {
          z._vfxSpawned = true;
          game.spawnFx(z.vfxKey, z.x, z.y, 0, Math.min(1.1, z.duration || 1.2), 0.95, 0.82, { blend: 'lighter' });
        }
        z.tickCd = (z.tickCd || 0) - dt;
        if (z.tickCd <= 0) {
          z.tickCd = 0.45;
          if (dist(pPx, pPy, z.x, z.y) <= (z.radius || 44)) {
            game.damagePlayer(Math.max(4, Math.round((z.dmg || 14) * 0.34)), { isMagic: true, status: z.status || null });
          }
        }
        if (z.timer >= (z.duration || 2.5)) hazards.splice(hi, 1);
      }
    }
  }

  function renderHazards(ctx, hazards, time, fallbackColor = '#ff5252') {
    if (!Array.isArray(hazards) || hazards.length === 0) return;
    ctx.save();
    for (const z of hazards) {
      if (!z) continue;
      const col = z.color || fallbackColor;
      if (z.kind === 'fissure') {
        const halfW = z.halfW || 18;
        if (z.timer < (z.delay || 0.85)) {
          const p = clamp(z.timer / Math.max(0.05, z.delay || 0.85), 0, 1);
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 82, 82, 0.35)';
          ctx.lineWidth = halfW * 2;
          ctx.beginPath();
          ctx.moveTo(z.x, z.y);
          ctx.lineTo(z.x2, z.y2);
          ctx.stroke();
          ctx.strokeStyle = `rgba(255, 193, 7, ${0.45 + 0.45 * p})`;
          ctx.lineWidth = Math.max(3, halfW * 2 * p);
          ctx.setLineDash([10, 6]);
          ctx.beginPath();
          ctx.moveTo(z.x, z.y);
          ctx.lineTo(z.x2, z.y2);
          ctx.stroke();
          ctx.restore();
        } else {
          const fade = clamp(1 - (z.timer - (z.delay || 0.85)) / Math.max(0.1, (z.duration || 1.75) - (z.delay || 0.85)), 0.15, 1);
          ctx.save();
          ctx.globalAlpha = fade;
          ctx.strokeStyle = col;
          ctx.lineWidth = halfW * 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(z.x, z.y);
          ctx.lineTo(z.x2, z.y2);
          ctx.stroke();
          ctx.strokeStyle = '#fff3e0';
          ctx.lineWidth = Math.max(4, halfW * 0.65);
          ctx.beginPath();
          ctx.moveTo(z.x, z.y);
          ctx.lineTo(z.x2, z.y2);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        const r = z.radius || 52;
        if ((z.kind === 'meteor' || z.kind === 'bomb' || z.kind === 'pillar') && !z.detonated) {
          const dly = z.delay || 1.0;
          const p = clamp(z.timer / Math.max(0.05, dly), 0, 1);
          ctx.fillStyle = z.kind === 'pillar' ? 'rgba(128, 222, 234, 0.16)' : 'rgba(255, 61, 0, 0.18)';
          ctx.beginPath(); ctx.arc(z.x, z.y, r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = z.kind === 'pillar' ? `rgba(128, 222, 234, ${0.20 + p * 0.36})` : `rgba(255, 82, 82, ${0.22 + p * 0.34})`;
          ctx.beginPath(); ctx.arc(z.x, z.y, Math.max(4, r * p), 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col;
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(z.x, z.y, r, 0, Math.PI * 2); ctx.stroke();
          if (z.kind === 'bomb') {
            ctx.fillStyle = (Math.floor((time || 0) * 14) % 2 === 0) ? '#ff5252' : '#ffd54f';
            ctx.beginPath(); ctx.arc(z.x, z.y - 4, 7, 0, Math.PI * 2); ctx.fill();
          }
        } else {
          const left = Math.max(0, (z.duration || 2) - z.timer);
          const alpha = clamp(left / 0.6, 0.2, 0.9);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = z.fillColor || 'rgba(255, 87, 34, 0.26)';
          ctx.beginPath(); ctx.arc(z.x, z.y, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col;
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath(); ctx.arc(z.x, z.y, r, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }
      }
    }
    ctx.restore();
  }

  function stepMobAI(game, e, dt, ctx = {}) {
    const px = game.player.x;
    const py = game.player.y;
    const prof = getMobProfile(e);
    const d = dist(e.x, e.y, px, py);
    const canWalkPx = ctx.canWalkPx || null;
    const hazards = ctx.hazards || null;
    const enemies = ctx.enemies || [];
    const aggroDist = ctx.isDungeon ? 9999 : (e.earlyZoneMob ? 235 : 310);

    if (!e.state) e.state = 'chase';
    if (e.specialAtkCd === undefined) e.specialAtkCd = 1.4 + Math.random() * 1.8;
    if (e.specialAtkCd > 0) e.specialAtkCd -= dt;

    let moveVx = e.vx || 0;
    let moveVy = e.vy || 0;
    let handledMove = false;

    if (e.state === 'windup') {
      e.windupTimer = (e.windupTimer || 0.45) - dt;
      moveVx = 0;
      moveVy = 0;
      if (e.attackKind === 'beam') {
        const curAng = Math.atan2(py - e.y, px - e.x);
        const prevAng = e.targetAngle !== undefined ? e.targetAngle : curAng;
        const diff = Math.atan2(Math.sin(curAng - prevAng), Math.cos(curAng - prevAng));
        e.targetAngle = prevAng + diff * Math.min(1, dt * 2.2);
        e.beamAngle = e.targetAngle;
        e._beamProgress = clamp(1 - Math.max(0, e.windupTimer) / Math.max(0.1, e.windupMax || 0.68), 0, 1);
      }
      if (e.windupTimer <= 0) {
        const dAng = e.targetAngle !== undefined ? e.targetAngle : Math.atan2(py - e.y, px - e.x);
        if (e.attackKind === 'leap') {
          e.state = 'leap';
          e.leapProg = 0;
          e.leapDur = e.isMiniBoss ? 0.62 : 0.56;
          e.leapStartX = e.x;
          e.leapStartY = e.y;
          e.leapTargetX = e.targetX !== undefined ? e.targetX : px;
          e.leapTargetY = e.targetY !== undefined ? e.targetY : py;
          spawnStrikeVfx(game, prof.windupVfx || 'pvfx_dust_puff', e.x, e.y, 0, 0.78);
        } else if (e.attackKind === 'charge' || e.attackKind === 'swoop' || e.attackKind === 'dash') {
          e.state = 'dash';
          e.dashHit = false;
          e.dashTimer = e.attackKind === 'swoop' ? 0.34 : 0.38;
          const mult = e.attackKind === 'swoop' ? 3.55 : (e.isMiniBoss ? 3.3 : 3.15);
          e.dashVx = Math.cos(dAng) * e.speed * mult;
          e.dashVy = Math.sin(dAng) * e.speed * mult;
          spawnStrikeVfx(game, prof.windupVfx || 'pvfx_dash_dust', e.x, e.y, dAng, 0.8);
          if (game.spawnParticles) game.spawnParticles(e.x, e.y, '#ff8a80', 6);
        } else if (e.attackKind === 'bomb') {
          const bx = e.targetX !== undefined ? e.targetX : px;
          const by = e.targetY !== undefined ? e.targetY : py;
          if (hazards) {
            hazards.push({
              kind: 'bomb',
              x: bx,
              y: by,
              timer: 0,
              delay: 1.05,
              oneShot: true,
              radius: prof.bombRadius || 52,
              dmg: Math.max(8, Math.round((e.dmg || 12) * 1.45)),
              color: '#ff7043',
              vfxKey: prof.specialVfx || prof.meleeVfx || 'pvfx_big_explosion',
              status: prof.status || { kind: 'burn', dur: 1.6, tickDmg: 2 }
            });
          }
          spawnStrikeVfx(game, prof.windupVfx || 'pvfx_smoke_bomb', e.x, e.y - 8, dAng, 0.75);
          if (game.spawnParticles) game.spawnParticles(bx, by, '#ffab40', 8);
          if (Balaclava.Audio) Balaclava.Audio.play('magic');
          e.state = 'chase';
          e.specialAtkCd = 3.1 + Math.random() * 1.6;
        } else if (e.attackKind === 'burrow') {
          e.state = 'burrow';
          e.burrowTimer = 0.85;
          e._burrowed = true;
          e._burrowPuffCd = 0;
          spawnStrikeVfx(game, prof.windupVfx || 'pvfx_dust_puff', e.x, e.y, 0, 0.95);
          if (Balaclava.Audio) Balaclava.Audio.play('hit');
        } else if (e.attackKind === 'beam') {
          e._beamProgress = 0;
          const raySin = Math.sin(dAng);
          const rayCos = Math.cos(dAng);
          for (let step = 52; step <= 235; step += 62) {
            spawnStrikeVfx(game, prof.specialVfx || 'pvfx_arcane_beam', e.x + rayCos * step, e.y + raySin * step, dAng, 0.82);
          }
          const fwd = (px - e.x) * rayCos + (py - e.y) * raySin;
          const perp = Math.abs((px - e.x) * raySin - (py - e.y) * rayCos);
          if (fwd >= -10 && fwd <= 255 && perp <= 24) {
            game.damagePlayer(Math.max(4, Math.round((e.dmg || 10) * 1.25)), { isMagic: true, status: prof.status || null });
          }
          fireMobVolley(game, e, dAng, { count: 1, dmgMult: 0.78, speedMult: 1.15 });
          if (game.shake) game.shake(0.12, 3);
          e.state = 'chase';
          e.specialAtkCd = 3.3 + Math.random() * 1.5;
        } else if (e.attackKind === 'blink') {
          spawnStrikeVfx(game, prof.windupVfx || 'pvfx_blink_out', e.x, e.y, 0, 0.85);
          let blinked = false;
          const baseAng = Math.random() * Math.PI * 2;
          for (let attempt = 0; attempt < 8; attempt++) {
            const ta = baseAng + (attempt / 8) * Math.PI * 2;
            const tr = 115 + (attempt % 2) * 35;
            const tx = px + Math.cos(ta) * tr;
            const ty = py + Math.sin(ta) * tr;
            if (!canWalkPx || canWalkPx(tx, ty)) {
              e.x = tx;
              e.y = ty;
              blinked = true;
              break;
            }
          }
          if (blinked) spawnStrikeVfx(game, prof.specialVfx || 'pvfx_teleport_in', e.x, e.y, 0, 0.9);
          fireMobVolley(game, e, Math.atan2(py - e.y, px - e.x), { dmgMult: 0.95 });
          e.state = 'chase';
          e.specialAtkCd = 3.2 + Math.random() * 1.6;
        } else if (e.attackKind === 'spore') {
          spawnStrikeVfx(game, prof.specialVfx || 'aw_poison_splash', e.x, e.y, 0, 1.05);
          if (d < 72) executeMeleeStrike(game, e, dAng, 1.18);
          if (prof.proj) fireMobVolley(game, e, dAng, { dmgMult: 0.82 });
          if (prof.leavesPool && hazards) {
            hazards.push({
              kind: 'pool',
              x: e.x,
              y: e.y,
              timer: 0,
              duration: 3.0,
              radius: 44,
              dmg: Math.max(6, Math.round((e.dmg || 10) * 0.9)),
              color: prof.poolColor || '#8bc34a',
              fillColor: 'rgba(139, 195, 74, 0.24)',
              vfxKey: prof.specialVfx || 'aw_poison_splash',
              status: prof.status || { kind: 'poison', dur: 2.0, tickDmg: 3 }
            });
          }
          e.state = 'chase';
          e.specialAtkCd = 3.4 + Math.random() * 1.6;
        } else if (e.attackKind === 'cleave') {
          spawnStrikeVfx(game, prof.specialVfx || prof.meleeVfx || 'aw_slash_heavy', e.x + Math.cos(dAng) * 20, e.y + Math.sin(dAng) * 20, dAng, 0.95);
          if (d < 62) {
            executeMeleeStrike(game, e, dAng, 1.25);
          } else if (Balaclava.Audio) {
            Balaclava.Audio.play(prof.audio || 'slash');
          }
          e.state = 'chase';
          e.specialAtkCd = 2.8 + Math.random() * 1.4;
        } else if (e.attackKind === 'miniboss_fan') {
          const fanCount = e.eliteVariant ? 5 : 4;
          fireMobVolley(game, e, Math.atan2(py - e.y, px - e.x), { count: fanCount, spread: 0.24, dmgMult: 0.9, speedMult: 1.08 });
          e.state = 'chase';
          e.specialAtkCd = 2.6 + Math.random() * 1.2;
        } else if (e.attackKind === 'miniboss_pillars') {
          if (hazards) {
            const pillarVfx = (ctx.bossTheme && ctx.bossTheme.pillarVfx) || prof.pillarVfx || prof.specialVfx || 'pvfx_fire_pillar';
            const pillarCol = (ctx.bossTheme && ctx.bossTheme.color) || e.color || '#ff7043';
            for (let k = 0; k < 2; k++) {
              const angOff = k === 0 ? 0 : Math.random() * Math.PI * 2;
              const radOff = k === 0 ? 12 : 68;
              const zx = px + Math.cos(angOff) * radOff;
              const zy = py + Math.sin(angOff) * radOff;
              if (!canWalkPx || canWalkPx(zx, zy)) {
                hazards.push({
                  kind: 'pillar',
                  x: zx,
                  y: zy,
                  timer: 0,
                  delay: 0.9,
                  oneShot: true,
                  radius: 52,
                  dmg: Math.max(10, Math.round((e.dmg || 14) * 1.25)),
                  color: pillarCol,
                  vfxKey: pillarVfx,
                  status: (ctx.bossTheme && ctx.bossTheme.status) || prof.status || null
                });
              }
            }
          }
          spawnStrikeVfx(game, prof.windupVfx || 'pvfx_magic_circle', e.x, e.y, 0, 0.9);
          e.state = 'chase';
          e.specialAtkCd = 3.0 + Math.random() * 1.3;
        } else {
          e.state = 'chase';
          e.specialAtkCd = 2.8;
        }
      }
      handledMove = true;
    } else if (e.state === 'burrow') {
      e.burrowTimer = (e.burrowTimer || 0) - dt;
      e._burrowed = true;
      const bAng = Math.atan2(py - e.y, px - e.x);
      moveVx = Math.cos(bAng) * e.speed * 1.8;
      moveVy = Math.sin(bAng) * e.speed * 1.8;
      e._burrowPuffCd = (e._burrowPuffCd || 0) - dt;
      if (e._burrowPuffCd <= 0) {
        e._burrowPuffCd = 0.22;
        spawnStrikeVfx(game, 'pvfx_dust_puff', e.x, e.y, 0, 0.65);
      }
      if (e.burrowTimer <= 0) {
        e._burrowed = false;
        e.state = 'chase';
        e.specialAtkCd = 3.6 + Math.random() * 1.6;
        spawnStrikeVfx(game, prof.specialVfx || 'pvfx_earth_spike', e.x, e.y, 0, 1.05);
        if (prof.pillarVfx) spawnStrikeVfx(game, prof.pillarVfx, e.x, e.y + 6, 0, 0.85);
        if (game.spawnShockwave) game.spawnShockwave(e.x, e.y, 52, '#a1887f');
        if (Balaclava.Audio) Balaclava.Audio.play(prof.audio || 'bomb');
        if (d < 56 && e.atkCd <= 0) {
          e.atkCd = 1.0;
          executeMeleeStrike(game, e, bAng, 1.3);
        }
      }
    } else if (e.state === 'dash') {
      e.dashTimer -= dt;
      moveVx = e.dashVx || 0;
      moveVy = e.dashVy || 0;
      if (d < (e.isMiniBoss ? 44 : 36) && e.atkCd <= 0 && !e.dashHit) {
        e.dashHit = true;
        e.atkCd = 1.05;
        executeMeleeStrike(game, e, Math.atan2(py - e.y, px - e.x), e.isMiniBoss ? 1.4 : 1.28);
        if (prof.specialVfx) spawnStrikeVfx(game, prof.specialVfx, e.x, e.y, Math.atan2(moveVy, moveVx), 0.9);
      }
      if (e.dashTimer <= 0) {
        e.state = 'chase';
        e.specialAtkCd = (e.isMiniBoss ? 2.4 : 3.0) + Math.random() * 1.6;
      }
    } else if (e.state === 'leap') {
      e.leapProg = Math.min(1, (e.leapProg || 0) + dt / (e.leapDur || 0.6));
      const nx = (e.leapStartX || e.x) + ((e.leapTargetX || e.x) - (e.leapStartX || e.x)) * e.leapProg;
      const ny = (e.leapStartY || e.y) + ((e.leapTargetY || e.y) - (e.leapStartY || e.y)) * e.leapProg;
      if (!canWalkPx || canWalkPx(nx, ny)) {
        e.x = nx;
        e.y = ny;
      }
      moveVx = 0;
      moveVy = 0;
      handledMove = true;
      if (e.leapProg >= 1) {
        e.state = 'chase';
        e.specialAtkCd = (e.isMiniBoss ? 2.5 : 3.2) + Math.random() * 1.8;
        const landR = e.isMiniBoss ? 68 : 50;
        if (game.spawnShockwave) game.spawnShockwave(e.x, e.y, landR, e.color || '#66bb6a');
        spawnStrikeVfx(game, prof.specialVfx || 'pvfx_ground_slam', e.x, e.y, 0, e.isMiniBoss ? 1.15 : 0.92);
        if (Balaclava.Audio) Balaclava.Audio.play(prof.audio || 'hit');
        if (dist(e.x, e.y, px, py) < landR + 4 && e.atkCd <= 0) {
          e.atkCd = 1.05;
          executeMeleeStrike(game, e, Math.atan2(py - e.y, px - e.x), e.isMiniBoss ? 1.35 : 1.24);
        }
        if (e.isMiniBoss) {
          const radCount = e.enraged ? 8 : 6;
          const bt = ctx.bossTheme;
          const projCol = (bt && bt.color) || e.color || '#ff5252';
          for (let k = 0; k < radCount; k++) {
            const ra = (k / radCount) * Math.PI * 2;
            game.spawnEnemyProjectile(e.x, e.y, Math.cos(ra) * 215, Math.sin(ra) * 215, Math.round((e.dmg || 14) * 0.8), projCol, {
              vfxKey: (bt && bt.projVfx) || (prof.proj && prof.proj.vfxKey) || 'aw_arcane_missile',
              impactVfx: (bt && bt.projImpactVfx) || 'pvfx_hit_spark',
              status: (bt && bt.status) || prof.status || null
            });
          }
        }
        if (prof.leavesPool && hazards) {
          hazards.push({
            kind: 'pool',
            x: e.x,
            y: e.y,
            timer: 0,
            duration: 2.8,
            radius: 42,
            dmg: Math.max(5, Math.round((e.dmg || 10) * 0.85)),
            color: prof.poolColor || '#8bc34a',
            fillColor: 'rgba(139, 195, 74, 0.22)',
            vfxKey: prof.specialVfx || 'aw_poison_splash',
            status: prof.status || { kind: 'poison', dur: 1.9, tickDmg: 3 }
          });
        }
      }
    } else if (d < aggroDist) {
      const ang = Math.atan2(py - e.y, px - e.x);
      e.facing = Math.cos(ang) >= 0 ? 1 : -1;

      if (e.isMiniBoss && e.specialAtkCd <= 0 && d < 320) {
        const roll = Math.random();
        e.state = 'windup';
        e.windupMax = 0.55;
        e.windupTimer = 0.55;
        e.targetAngle = ang;
        e.targetX = px;
        e.targetY = py;
        if (roll < 0.34) e.attackKind = 'miniboss_fan';
        else if (roll < 0.62 && ctx.isDungeon && hazards) e.attackKind = 'miniboss_pillars';
        else if (roll < 0.82 && d < 220) e.attackKind = 'leap';
        else e.attackKind = 'dash';
      } else if (!e.isMiniBoss && e.specialAtkCd <= 0) {
        const b = prof.behavior;
        if (b === 'bomber' && d > 48 && d < 250 && hazards) {
          e.state = 'windup'; e.attackKind = 'bomb'; e.windupMax = 0.50; e.windupTimer = 0.50; e.targetX = px; e.targetY = py;
        } else if (b === 'burrower' && d > 55 && d < 240) {
          e.state = 'windup'; e.attackKind = 'burrow'; e.windupMax = 0.42; e.windupTimer = 0.42;
        } else if (b === 'beam_caster' && d > 45 && d < 270) {
          e.state = 'windup'; e.attackKind = 'beam'; e.windupMax = 0.68; e.windupTimer = 0.68; e.targetAngle = ang; e.beamAngle = ang;
        } else if (b === 'blink_caster' && d > 40 && d < 260) {
          e.state = 'windup'; e.attackKind = 'blink'; e.windupMax = 0.40; e.windupTimer = 0.40;
        } else if (b === 'vampire_swoop' && d > 50 && d < 200) {
          e.state = 'windup'; e.attackKind = 'swoop'; e.windupMax = 0.36; e.windupTimer = 0.36; e.targetAngle = ang;
        } else if (b === 'spore_burst' && d < 125) {
          e.state = 'windup'; e.attackKind = 'spore'; e.windupMax = 0.48; e.windupTimer = 0.48; e.targetAngle = ang;
        } else if (b === 'charger' && d > 55 && d < 185) {
          e.state = 'windup'; e.attackKind = 'charge'; e.windupMax = 0.44; e.windupTimer = 0.44; e.targetAngle = ang;
        } else if (b === 'leaper' && d > 55 && d < 190) {
          e.state = 'windup'; e.attackKind = 'leap'; e.windupMax = 0.44; e.windupTimer = 0.44; e.targetX = px; e.targetY = py;
        } else if (b === 'melee_combo' && d < 66) {
          e.state = 'windup'; e.attackKind = 'cleave'; e.windupMax = 0.34; e.windupTimer = 0.34; e.targetAngle = ang;
        }
      }

      if (e.state === 'chase') {
        const isRangedRole = e.ranged || prof.behavior === 'ranged_single' || prof.behavior === 'ranged_fan' || prof.behavior === 'blink_caster' || prof.behavior === 'beam_caster';
        if (isRangedRole && d < 255) {
          if (d < 82) {
            moveVx = -Math.cos(ang) * e.speed * 0.65;
            moveVy = -Math.sin(ang) * e.speed * 0.65;
          } else if (d > 175) {
            moveVx = Math.cos(ang) * e.speed * 0.78;
            moveVy = Math.sin(ang) * e.speed * 0.78;
          } else {
            const strafeSign = ((e.id || 1) % 2 === 0 ? 1 : -1);
            const strafeAng = ang + strafeSign * Math.PI * 0.5;
            moveVx = Math.cos(strafeAng) * e.speed * 0.45;
            moveVy = Math.sin(strafeAng) * e.speed * 0.45;
          }
          if (e.atkCd <= 0) {
            e.atkCd = prof.behavior === 'ranged_fan' ? 2.15 : 1.75;
            fireMobVolley(game, e, ang);
          }
        } else {
          if (prof.proj && d > 95 && d < 210 && e.atkCd <= 0 && !e.ranged) {
            e.atkCd = 2.5;
            fireMobVolley(game, e, ang, { count: 1, dmgMult: 0.75 });
          }
          const idx = enemies.indexOf(e);
          const seedVal = typeof e.id === 'number' ? e.id : (Number(e.seed) || (Math.max(0, idx) * 3));
          const flank = Math.sin(Math.max(0, idx) * 1.8 + seedVal) * 0.36;
          const finalAng = ang + flank;
          const spd = e.speed * (d < 110 ? 1.15 : 1.05);
          moveVx = Math.cos(finalAng) * spd;
          moveVy = Math.sin(finalAng) * spd;
        }

        if (d < (e.isMiniBoss ? 40 : 29) && e.atkCd <= 0 && e.state === 'chase') {
          e.atkCd = e.earlyZoneMob ? 1.24 : 0.98;
          executeMeleeStrike(game, e, ang, e.isMiniBoss ? 1.12 : 1.0);
          if (prof.leavesPool && hazards && Math.random() < 0.4) {
            hazards.push({
              kind: 'pool',
              x: e.x,
              y: e.y,
              timer: 0,
              duration: 2.6,
              radius: 38,
              dmg: Math.max(5, Math.round((e.dmg || 10) * 0.8)),
              color: prof.poolColor || '#8bc34a',
              fillColor: 'rgba(139, 195, 74, 0.22)',
              vfxKey: prof.specialVfx || 'aw_poison_splash',
              status: prof.status || null
            });
          }
        }
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
          e.vx = 0;
          e.vy = 0;
        }
      }
      moveVx = e.vx;
      moveVy = e.vy;
    }

    return { moveVx, moveVy, handledMove };
  }

  Balaclava.EnemyAttacks = {
    getMobProfile,
    getBossTheme,
    spawnStrikeVfx,
    executeMeleeStrike,
    fireMobVolley,
    stepMobAI,
    updateHazards,
    renderHazards
  };

  class CombatSystem {
    constructor() {
      this.enemies = [];
      this.worldHazards = [];
      this.spawnTimer = 0;
      this.nextId = 1;
    }

    static getEnemyDef(id) {
      return ENEMY_DEFS[id] || ENEMY_DEFS.slime;
    }

    getActivePlayerBiome(game) {
      if (game && game.world && game.player && typeof game.world.getBiomeAtPixel === 'function') {
        return game.world.getBiomeAtPixel(game.player.x, game.player.y) || 'pradera';
      }
      return 'pradera';
    }

    getSpawnConfig(game) {
      const night = typeof game.isNightTime === 'function' ? game.isNightTime() : false;
      const plots = Math.max(1, game.unlockedPlots.length);
      const pLv = Math.max(1, (game.player && game.player.level) || 1);
      const biome = this.getActivePlayerBiome(game);
      const lvBoost = Math.floor((pLv - 1) / 3);
      if (night) {
        if (biome === 'pradera') {
          // Early starter nights remain threatening but fair in spawn cadence and pack size
          return {
            isNight: true,
            biome,
            interval: Math.max(10.5, 14.5 - Math.min(2.8, plots * 0.25) - Math.min(0.8, (pLv - 1) * 0.05)),
            maxMobs: Math.min(6, 2 + Math.floor(plots * 0.45) + Math.floor((pLv - 1) / 5))
          };
        }
        if (biome === 'desierto') {
          return {
            isNight: true,
            biome,
            interval: Math.max(7.8, 11.2 - Math.min(2.2, plots * 0.18) - Math.min(0.8, (pLv - 1) * 0.06)),
            maxMobs: Math.min(9, 3 + Math.floor(plots * 0.6) + Math.floor((pLv - 1) / 4))
          };
        }
        return {
          isNight: true,
          biome,
          interval: Math.max(4.6, 8.2 - Math.min(2.2, plots * 0.14) - Math.min(1.0, (pLv - 1) * 0.08)),
          maxMobs: Math.min(16, 3 + Math.ceil(plots * 1.0) + lvBoost)
        };
      }
      // First-biome (Pradera) daytime is >=75% quieter so building and gathering feel peaceful.
      if (biome === 'pradera') {
        return {
          isNight: false,
          biome,
          interval: Math.max(220.0, 296.0 - Math.min(40.0, (pLv - 1) * 1.0)),
          maxMobs: 1
        };
      }
      return {
        isNight: false,
        biome,
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

      // Enforce at least 75% fewer daytime spawns on main starter islands (pradera)
      if (!night && !forceType && biome === 'pradera') {
        const activePradera = this.enemies.filter(e => e && e.biome === 'pradera' && e.type !== 'golden_slime').length;
        if (activePradera >= 1 || Math.random() < 0.75) return null;
      }

      const dayPools = {
        pradera: ['slime', 'rat'],
        desierto: ['beetle', 'scorpion', 'sand_ghoul', 'cobra', 'rock_golem'],
        bosque_oscuro: ['mushroom_mob', 'mushroom_purple', 'slime_toxic', 'goblin', 'goblin_shaman', 'bat'],
        montanas_heladas: ['wolf', 'golem', 'cave_spider'],
        tierras_volcanicas: ['magma', 'fire_elem', 'beetle_fire', 'goblin_tnt']
      };
      const nightPools = {
        pradera: ['slime', 'rat', 'spider', 'zombie', 'skeleton'],
        desierto: ['beetle', 'sand_ghoul', 'cobra', 'spider', 'scorpion'],
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
      const biomeMinLv = biomeTier === 0 ? 1 : (biomeTier === 1 ? 3 : 1 + biomeTier * 4);
      const distWeight = biomeTier === 0 ? 1.15 : (biomeTier === 1 ? 1.55 : 2.0);
      const dangerLv = Math.max(biomeMinLv, Math.round(1 + plotDist * distWeight + biomeTier * 1.5 + lvExtra * 0.85));
      const effLv = Math.max(0, dangerLv - 1);
      let hpScale = 1 + effLv * 0.36 + Math.pow(effLv, 1.32) * 0.06;
      let dmgScale = 1 + effLv * 0.11 + Math.pow(effLv, 1.1) * 0.025;
      let spdScale = 1 + Math.min(0.55, effLv * 0.018 + biomeTier * 0.04);
      const xpScale = 1 + effLv * 0.28 + Math.pow(effLv, 1.2) * 0.05;

      // Keep early biomes (pradera / desierto) gentler at night and starter days approachable
      const earlyZoneMob = biomeTier <= 1;
      if (night && biomeTier === 0) {
        hpScale *= 0.62;
        dmgScale *= 0.62;
        spdScale *= 0.84;
      } else if (night && biomeTier === 1) {
        hpScale *= 0.76;
        dmgScale *= 0.75;
        spdScale *= 0.90;
      } else if (!night && biomeTier === 0) {
        hpScale *= 0.85;
        dmgScale *= 0.78;
      }

      const mob = {
        id: this.nextId++,
        type,
        name: def.name,
        biome,
        level: dangerLv,
        xpMult: xpScale,
        earlyZoneMob,
        // All enemies spawned during night burn away at sunrise so main islands stay calm by day
        nocturnal: !!def.nocturnal || night,
        x, y,
        vx: 0, vy: 0,
        animVx: 0, animVy: 0,
        hp: Math.max(8, Math.round(def.hp * hpScale)),
        maxHp: Math.max(8, Math.round(def.hp * hpScale)),
        dmg: Math.max(3, Math.round(def.dmg * dmgScale)),
        speed: Math.max(34, Math.round(def.speed * spdScale)),
        color: def.color || '#ef5350',
        sprite: def.sprite || null,
        ranged: !!def.ranged,
        radius: Math.max(def.radius || 18, 20),
        hitW: def.hitW || 44,
        hitH: def.hitH || 50,
        bodyOffY: def.bodyOffY !== undefined ? def.bodyOffY : 17,
        hitFlash: 0,
        atkCd: earlyZoneMob ? 1.35 : 1.0,
        patrolTimer: randInt(1, 3),
        facing: 1
      };
      this.enemies.push(mob);
      return mob;
    }

    update(dt, game) {
      if (game.activeDungeon) return;

      updateHazards(game, this.worldHazards, null, dt);

      const cfg = this.getSpawnConfig(game);
      if (!cfg.isNight) {
        // Banish nocturnal mobs quickly when dawn arrives so daytime starter islands stay serene
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          if (this.enemies[i].nocturnal && this.enemies[i].type !== 'golden_slime') {
            this.enemies[i].sunBurn = (this.enemies[i].sunBurn || 0) + dt;
            if (this.enemies[i].sunBurn > 2.2) {
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
        if (e.stunTimer > 0) e.stunTimer = Math.max(0, e.stunTimer - dt);
        if (e.poisonTimer > 0) {
          e.poisonTimer = Math.max(0, e.poisonTimer - dt);
          e._poisonTick = (e._poisonTick || 0) + dt;
          if (e._poisonTick >= 0.7) {
            e._poisonTick -= 0.7;
            this.damageEnemy(game, e, Math.max(3, Math.round((e.maxHp || 40) * 0.032)), 0, false, false);
            if (e._dead || e.hp <= 0) continue;
          }
        }
        if (e.burnTimer > 0) {
          e.burnTimer = Math.max(0, e.burnTimer - dt);
          e._burnTick = (e._burnTick || 0) + dt;
          if (e._burnTick >= 0.75) {
            e._burnTick -= 0.75;
            this.damageEnemy(game, e, Math.max(4, Math.round((e.maxHp || 40) * 0.035)), 0, false, false);
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

        const aiStep = stepMobAI(game, e, dt, {
          isDungeon: false,
          enemies: this.enemies,
          hazards: this.worldHazards,
          canWalkPx: isPosWalkable
        });
        const spdScale = (e.stunTimer > 0) ? 0 : (e.slowTimer > 0) ? 0.45 : 1;
        e.animVx = aiStep.moveVx * spdScale;
        e.animVy = aiStep.moveVy * spdScale;
        if (!aiStep.handledMove) {
          const nx = e.x + aiStep.moveVx * spdScale * dt;
          const ny = e.y + aiStep.moveVy * spdScale * dt;
          if (Number.isFinite(nx) && isPosWalkable(nx, e.y)) e.x = nx;
          if (Number.isFinite(ny) && isPosWalkable(e.x, ny)) e.y = ny;
        }
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
        game.spawnFx('pvfx_lightning_strike', enemy.x, enemy.y + 4, 0, 0.42, 0.92, 0.98, { blend: 'lighter' });
        game.spawnFx('pvfx_static_burst', enemy.x, enemy.y - 6, 0, 0.34, 1.0, 0.9, { blend: 'lighter' });
        Balaclava.Audio.play('thunder');
        game.addFloatingText(enemy.x, enemy.y - 40, Balaclava.I18n ? Balaclava.I18n.t('combat.lightningProc', { dmg: extraLight }) : `¡Rayo +${extraLight}!`, '#80d8ff');
      }
      if (allowProc && tb && tb.procChance > 0 && Math.random() < Math.min(0.65, tb.procChance)) {
        const extraDmg = Math.max(2, Math.round(dmg * (tb.procDmgMult || 0.25)));
        dmg += extraDmg;
        game.spawnFx('pvfx_arcane_burst', enemy.x, enemy.y, knockAng, 0.32, 0.95, 0.92, { blend: 'lighter' });
        game.addFloatingText(enemy.x, enemy.y - 36, Balaclava.I18n ? Balaclava.I18n.t('combat.furyProc', { dmg: extraDmg }) : `¡Furia +${extraDmg}!`, '#4fc3f7');
      }
      enemy.hp -= dmg;
      enemy.hitFlash = 0.16;
      if (isCrit && game.spawnFx) {
        game.spawnFx('aw_hit_critical', enemy.x, enemy.y - 6, knockAng, 0.28, 0.85, 0.98, { blend: 'lighter' });
        game.spawnFx('px_crit_star', enemy.x, enemy.y - 18, 0, 0.34, 0.95, 0.95, { blend: 'lighter' });
      } else if (allowProc && game.spawnFx) {
        game.spawnFx('aw_hit_spark_medium', enemy.x, enemy.y - 4, knockAng, 0.20, 0.72, 0.88);
      }
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
      if (game.spawnFx) {
        if (enemy.isBoss) {
          game.spawnFx('px_boss_death', enemy.x, enemy.y - 8, 0, 0.9, 1.5, 1.0, { blend: 'lighter' });
          game.spawnFx('pvfx_big_explosion', enemy.x, enemy.y, 0, 0.72, 1.4, 0.96, { blend: 'lighter' });
          game.spawnFx('pvfx_firework_burst', enemy.x, enemy.y - 26, 0, 0.85, 1.3, 0.95, { blend: 'lighter' });
        } else {
          game.spawnFx(enemy.isMiniBoss ? 'aw_explosion_energy' : 'aw_explosion_air', enemy.x, enemy.y - 4, 0, 0.36, enemy.isMiniBoss ? 1.15 : 0.78, 0.92, { blend: 'lighter' });
          game.spawnFx('pvfx_blood_splat', enemy.x, enemy.y, 0, 0.32, 0.85, 0.75);
        }
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
