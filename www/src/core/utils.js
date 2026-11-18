(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  const TILE_SIZE = 48;
  const PLOT_TILES = 12;
  const PLOT_PX = TILE_SIZE * PLOT_TILES;
  const GRID_PLOTS = 10;
  const CENTER_PLOT = 4;
  const WORLD_TILES = PLOT_TILES * GRID_PLOTS;
  const WORLD_PX = WORLD_TILES * TILE_SIZE;

  const BIOMES = {
    pradera: {
      id: 'pradera',
      name: 'Pradera Esmeralda',
      color: '#63ab3f',
      accent: '#9de64e',
      waterColor: '#2d7ea8',
      musicMood: 'meadow',
      danger: 1,
      desc: 'Isla verde fértil con árboles, rocas, bayas y criaturas dóciles.'
    },
    desierto: {
      id: 'desierto',
      name: 'Desierto Dorado',
      color: '#e5b85c',
      accent: '#ffe38c',
      waterColor: '#2c8fa8',
      musicMood: 'desert',
      danger: 2,
      desc: 'Dunas cálidas, cactus, minerales de cobre/oro, escorpiones y templos enterrados.'
    },
    bosque_oscuro: {
      id: 'bosque_oscuro',
      name: 'Bosque Oscuro',
      color: '#345b58',
      accent: '#8c69d4',
      waterColor: '#21455c',
      musicMood: 'dark_forest',
      danger: 3,
      desc: 'Arboledas gigantes, hongos luminosos, esencia oscura y cuevas misteriosas.'
    },
    montanas_heladas: {
      id: 'montanas_heladas',
      name: 'Montañas Heladas',
      color: '#a8d8ea',
      accent: '#e8fbff',
      waterColor: '#1f5e8a',
      musicMood: 'ice',
      danger: 4,
      desc: 'Cumbres nevadas con hielo puro, esmeraldas, lobos árticos y cuevas congeladas.'
    },
    tierras_volcanicas: {
      id: 'tierras_volcanicas',
      name: 'Tierras Volcánicas',
      color: '#5a3234',
      accent: '#ff6a33',
      waterColor: '#b33818',
      musicMood: 'volcano',
      danger: 5,
      desc: 'Suelo basáltico y ríos de lava con diamantes, fragmentos antiguos y monstruos ígneos.'
    }
  };

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
    RARITIES,
    MAX_ENEMY_LEVEL: 200,
    BIOME_LEVEL_RANGES: {
      pradera: [1, 15],
      desierto: [16, 45],
      montanas_heladas: [46, 95],
      bosque_oscuro: [96, 150],
      tierras_volcanicas: [151, 200]
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
