(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  const TILE_SIZE = 48;
  const PLOT_TILES = 12;
  const PLOT_PX = TILE_SIZE * PLOT_TILES;
  const GRID_PLOTS = 19;
  const CENTER_PLOT = 9;
  const WORLD_TILES = PLOT_TILES * GRID_PLOTS;
  const WORLD_PX = WORLD_TILES * TILE_SIZE;

  // 14 Biomes grouped into 4 Progression Zones with directional compass quadrants:
  // Center: Pradera (Zone 1)
  // North:  Desierto (Z2) -> Archipielago Coralino (Z3) -> Dinastia de Arena (Z4)
  // East:   Montanas Heladas (Z2) -> Cavernas de Cristal (Z3) -> Glaciar Profundo (Z4)
  // South:  Bosque Oscuro (Z2) -> Selva Esmeralda (Z3) -> Cienaga Putrida & Necropolis Osea (Z4)
  // West:   Tierras Volcanicas (Z2) -> Caldera de Ceniza (Z3) -> Tierras Malditas Abisales (Z4)
  const BIOMES = {
    pradera: {
      id: 'pradera', zone: 1, zoneName: 'Zona I · Núcleo Central', wing: 'center',
      name: 'Pradera Esmeralda',
      color: '#63ab3f', accent: '#9de64e', waterColor: '#2d7ea8', musicMood: 'meadow', danger: 1,
      desc: 'Núcleo fértil central con bosques serenos, vetas iniciales y criaturas dóciles.'
    },
    desierto: {
      id: 'desierto', zone: 2, zoneName: 'Zona II · Frontera Exterior', wing: 'north',
      name: 'Desierto Dorado',
      color: '#e5b85c', accent: '#ffe38c', waterColor: '#2c8fa8', musicMood: 'desert', danger: 2,
      desc: 'Al Norte: dunas cálidas, cactus, minerales de cobre/oro y templos enterrados.'
    },
    montanas_heladas: {
      id: 'montanas_heladas', zone: 2, zoneName: 'Zona II · Frontera Exterior', wing: 'east',
      name: 'Montañas Heladas',
      color: '#a8d8ea', accent: '#e8fbff', waterColor: '#1f5e8a', musicMood: 'ice', danger: 3,
      desc: 'Al Este: cumbres nevadas con hielo puro, esmeraldas, lobos árticos y fortalezas heladas.'
    },
    bosque_oscuro: {
      id: 'bosque_oscuro', zone: 2, zoneName: 'Zona II · Frontera Exterior', wing: 'south',
      name: 'Bosque Oscuro',
      color: '#345b58', accent: '#8c69d4', waterColor: '#21455c', musicMood: 'dark_forest', danger: 4,
      desc: 'Al Sur: arboledas gigantes, hongos luminosos, esencia oscura y criptas antiguas.'
    },
    tierras_volcanicas: {
      id: 'tierras_volcanicas', zone: 2, zoneName: 'Zona II · Frontera Exterior', wing: 'west',
      name: 'Tierras Volcánicas',
      color: '#5a3234', accent: '#ff6a33', waterColor: '#b33818', musicMood: 'volcano', danger: 5,
      desc: 'Al Oeste: suelo basáltico y ríos de lava con diamantes, oricalco y monstruos ígneos.'
    },
    archipielago_coral: {
      id: 'archipielago_coral', zone: 3, zoneName: 'Zona III · Dominios Profundos', wing: 'north',
      name: 'Archipiélago Coralino',
      color: '#f2c97d', accent: '#4deeea', waterColor: '#1ea3b8', musicMood: 'desert', danger: 6,
      desc: 'Costa Norte: playas doradas, arrecifes de coral abisal, perlas turquesa y piratas rúnicos.'
    },
    cavernas_cristal: {
      id: 'cavernas_cristal', zone: 3, zoneName: 'Zona III · Dominios Profundos', wing: 'east',
      name: 'Cavernas de Cristal',
      color: '#5f9bc9', accent: '#a0e7ff', waterColor: '#194d78', musicMood: 'ice', danger: 7,
      desc: 'Borde Este: grutas cristalinas con cuarzo boreal, celestita y autómatas de zafiro.'
    },
    selva_esmeralda: {
      id: 'selva_esmeralda', zone: 3, zoneName: 'Zona III · Dominios Profundos', wing: 'south',
      name: 'Selva Esmeralda',
      color: '#2d7a47', accent: '#69f0ae', waterColor: '#1c5e54', musicMood: 'meadow', danger: 8,
      desc: 'Jungla Sur: árboles colosales de madera férrea, jade ancestral y santuarios perdidos.'
    },
    caldera_ceniza: {
      id: 'caldera_ceniza', zone: 3, zoneName: 'Zona III · Dominios Profundos', wing: 'west',
      name: 'Caldera de Ceniza',
      color: '#73453d', accent: '#ff9100', waterColor: '#8c2814', musicMood: 'volcano', danger: 9,
      desc: 'Volcanes del Oeste: conos humeantes, escoria volcánica, titanes de magma y ceniza ardiente.'
    },
    dinastia_arena: {
      id: 'dinastia_arena', zone: 4, zoneName: 'Zona IV · Conquistas Abisales', wing: 'north',
      name: 'Dinastía de Arena Roja',
      color: '#cc7a44', accent: '#ffd54f', waterColor: '#287a92', musicMood: 'desert', danger: 10,
      desc: 'Confín Norte: desierto escarlata imperial con pirita solar, ágata roja y dinastías faraónicas.'
    },
    glaciar_profundo: {
      id: 'glaciar_profundo', zone: 4, zoneName: 'Zona IV · Conquistas Abisales', wing: 'east',
      name: 'Glaciar Profundo',
      color: '#6bb0c9', accent: '#e0f7fa', waterColor: '#133d63', musicMood: 'ice', danger: 11,
      desc: 'Confín Este: hielo eterno milenario, bismuto astral y colosos del cero absoluto.'
    },
    cienaga_putrida: {
      id: 'cienaga_putrida', zone: 4, zoneName: 'Zona IV · Conquistas Abisales', wing: 'south',
      name: 'Ciénaga Pútrida',
      color: '#466146', accent: '#aeea00', waterColor: '#224732', musicMood: 'dark_forest', danger: 12,
      desc: 'Confín Sur: pantanos venenosos, resina tóxica, flora carnívora e hidras de plaga.'
    },
    necropolis_osea: {
      id: 'necropolis_osea', zone: 4, zoneName: 'Zona IV · Conquistas Abisales', wing: 'south',
      name: 'Necrópolis Ósea',
      color: '#737570', accent: '#ce93d8', waterColor: '#262338', musicMood: 'dark_forest', danger: 13,
      desc: 'Brumas Sudoeste/Sureste: cementerios de gigantes, hueso fósil, plata maldita y reyes liche.'
    },
    tierras_malditas: {
      id: 'tierras_malditas', zone: 4, zoneName: 'Zona IV · Conquistas Abisales', wing: 'west',
      name: 'Tierras Malditas Abisales',
      color: '#6b2029', accent: '#ff1744', waterColor: '#4f0c18', musicMood: 'volcano', danger: 14,
      desc: 'Confín Oeste: el corazón del eclipse escarlata, cristal carmesí y la ciudadela del Espadachín Carmesí.'
    }
  };

  const BIOME_ZONES = [
    { zone: 1, name: 'Zona I · Núcleo Central', biomes: ['pradera'] },
    { zone: 2, name: 'Zona II · Cuadrantes Elementales', biomes: ['desierto', 'montanas_heladas', 'bosque_oscuro', 'tierras_volcanicas'] },
    { zone: 3, name: 'Zona III · Dominios Profundos', biomes: ['archipielago_coral', 'cavernas_cristal', 'selva_esmeralda', 'caldera_ceniza'] },
    { zone: 4, name: 'Zona IV · Confines Abisales', biomes: ['dinastia_arena', 'glaciar_profundo', 'cienaga_putrida', 'necropolis_osea', 'tierras_malditas'] }
  ];

  const BIOME_ORDER = BIOME_ZONES.flatMap(z => z.biomes);

  const RARITIES = {
    comun: { id: 'comun', name: 'Común', color: '#cfd8dc', bg: '#263238' },
    poco_comun: { id: 'poco_comun', name: 'Poco común', color: '#81c784', bg: '#1b3b24' },
    raro: { id: 'raro', name: 'Raro', color: '#4fc3f7', bg: '#103447' },
    epico: { id: 'epico', name: 'Épico', color: '#ce93d8', bg: '#381947' },
    legendario: { id: 'legendario', name: 'Legendario', color: '#ffd54f', bg: '#4a3208' }
  };

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function rand(min = 0, max = 1) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function hash2D(x, y, seed = 1337) {
    let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return (h >>> 0) / 4294967295;
  }

  function formatNum(n) {
    const val = Number(n) || 0;
    if (val >= 1000000000) return (val / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return Math.floor(val).toString();
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function isImgReady(img) {
    if (!img) return false;
    if (img.tagName === 'IMG') return img.complete && img.naturalWidth > 0;
    return img.width > 0 && img.height > 0;
  }

  function safeDraw(ctx, img, ...args) {
    if (!isImgReady(img)) return false;
    ctx.drawImage(img, ...args);
    return true;
  }

  function getEntityHitbox(e) {
    if (!e) return { cx: 0, cy: 0, hw: 18, hh: 20, w: 36, h: 40, bodyOffY: 12, radius: 18 };
    let w = e.hitW;
    let h = e.hitH;
    let bodyOffY = e.bodyOffY;
    if (!w || !h) {
      if (e.isBoss) {
        w = 78; h = 86; bodyOffY = 30;
      } else if (e.isMiniBoss) {
        w = 54; h = 60; bodyOffY = 22;
      } else if (e.kind) {
        const k = e.kind;
        if (k === 'vaca' || k === 'cow') { w = 44; h = 40; bodyOffY = 12; }
        else if (k === 'conejo' || k === 'rabbit' || k === 'pato' || k === 'duck' || k === 'chicken') { w = 28; h = 26; bodyOffY = 8; }
        else { w = 38; h = 34; bodyOffY = 10; }
      } else {
        w = 44; h = 50; bodyOffY = 17;
      }
    }
    if (bodyOffY === undefined) bodyOffY = e.isBoss ? 30 : e.isMiniBoss ? 22 : e.kind ? 10 : 17;
    const hw = w * 0.5;
    const hh = h * 0.5;
    const radius = Math.max(e.radius || 16, Math.round(Math.min(hw, hh) * 0.85));
    return { cx: e.x, cy: e.y - bodyOffY, hw, hh, w, h, bodyOffY, radius };
  }

  function pointInEntityHitbox(px, py, e, pad = 0) {
    if (!e || e._dead || (e.hp !== undefined && e.hp <= 0)) return false;
    const hb = getEntityHitbox(e);
    if (Math.abs(px - hb.cx) <= hb.hw + pad && Math.abs(py - hb.cy) <= hb.hh + pad) return true;
    return dist(px, py, e.x, e.y) <= hb.radius + pad;
  }

  function segmentHitsEntity(x1, y1, x2, y2, e, halfW = 0) {
    if (!e || e._dead || (e.hp !== undefined && e.hp <= 0)) return false;
    const hb = getEntityHitbox(e);
    const vx = x2 - x1;
    const vy = y2 - y1;
    const len2 = vx * vx + vy * vy || 1;
    const checkPt = (px, py, r) => {
      const t = clamp(((px - x1) * vx + (py - y1) * vy) / len2, 0, 1);
      return Math.hypot(px - (x1 + t * vx), py - (y1 + t * vy)) <= r;
    };
    const bodyR = Math.max(hb.hw, hb.hh) * 0.78 + halfW;
    return checkPt(hb.cx, hb.cy, bodyR) || checkPt(e.x, e.y, hb.radius + halfW);
  }

  Balaclava.CONST = {
    TILE_SIZE,
    PLOT_TILES,
    PLOT_PX,
    GRID_PLOTS,
    CENTER_PLOT,
    WORLD_TILES,
    WORLD_PX,
    BIOMES,
    BIOME_ZONES,
    BIOME_ORDER,
    RARITIES,
    MAX_ENEMY_LEVEL: 600,
    BIOME_LEVEL_RANGES: {
      pradera: [1, 15],
      desierto: [16, 40],
      montanas_heladas: [41, 70],
      bosque_oscuro: [71, 105],
      tierras_volcanicas: [106, 150],
      archipielago_coral: [151, 195],
      cavernas_cristal: [196, 240],
      selva_esmeralda: [241, 290],
      caldera_ceniza: [291, 340],
      dinastia_arena: [341, 395],
      glaciar_profundo: [396, 450],
      cienaga_putrida: [451, 500],
      necropolis_osea: [501, 550],
      tierras_malditas: [551, 600]
    }
  };

  Balaclava.Utils = {
    clamp,
    lerp,
    dist,
    rand,
    randInt,
    pick,
    hash2D,
    formatNum,
    deepClone,
    isImgReady,
    safeDraw,
    getEntityHitbox,
    pointInEntityHitbox,
    segmentHitsEntity
  };
})();
