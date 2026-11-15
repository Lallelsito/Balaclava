const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = 'C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www';
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'styles/main.css'), 'utf8');
const uiCode = fs.readFileSync(path.join(ROOT, 'src/ui/ui.js'), 'utf8');
const gameCode = fs.readFileSync(path.join(ROOT, 'src/engine/game.js'), 'utf8');
const utilsCode = fs.readFileSync(path.join(ROOT, 'src/core/utils.js'), 'utf8');
const i18nEnCode = fs.readFileSync(path.join(ROOT, 'src/core/i18n_data_en.js'), 'utf8');
const i18nCode = fs.readFileSync(path.join(ROOT, 'src/core/i18n.js'), 'utf8');

// 1. HTML Structure (Full-Screen Pixel Panorama + Zero Modern Card / Circle Crest / Emojis)
const requiredHtml = [
  'id="death-overlay"',
  'id="death-pixel-canvas"',
  'width="640"',
  'height="360"',
  'class="death-stage"',
  'id="death-title"',
  'class="death-sub"',
  'id="death-stats-pill"',
  'id="death-bar-fill"',
  'id="death-countdown"',
  'id="btn-death-main-menu"',
  'Monster_Drops/skull.png'
];
for (const tag of requiredHtml) {
  assert(html.includes(tag), 'Missing death HTML markup: ' + tag);
}
for (const forbidden of ['class="death-card"', 'class="death-crest"', '💀', '💡']) {
  assert(!html.includes(forbidden), 'Legacy card/crest or emoji must not exist: ' + forbidden);
}
console.log('1. Death HTML structure verified (full-screen pixel canvas, zero cards/circles/emojis)');

// 2. CSS Aesthetics (No gradients, no border-radius circles, crisp pixelated fonts & rules)
const deathCssStart = css.indexOf('/* Death Screen Overlay');
const deathCssEnd = css.indexOf('/* Floating Altar Blessing Notifications');
assert(deathCssStart !== -1 && deathCssEnd > deathCssStart, 'Could not locate Death Screen CSS section');
const deathCss = css.slice(deathCssStart, deathCssEnd);
for (const req of [
  '.death-overlay',
  '.death-pixel-canvas',
  '.death-stage',
  'image-rendering: pixelated;',
  "font-family: 'BalaclavaTitlePixel'",
  "font-family: 'BalaclavaBodyPixel'",
  '.death-bar-fill'
]) {
  assert(deathCss.includes(req), 'Missing Death CSS rule: ' + req);
}
for (const forbid of ['linear-gradient', 'radial-gradient', 'border-radius', 'box-shadow']) {
  assert(!deathCss.includes(forbid), 'Death CSS must not contain modern styling: ' + forbid);
}
console.log('2. Death CSS rules verified (zero gradients, zero border-radius/box-shadow blur)');

// 3. Verify all Sanctuary Death Diorama PNG Sprite Paths Exist on Disk
const spritePaths = [
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/07_Items/Monster_Drops/skull.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Campsite/campfire_anim_6f.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Lights/brazier_orange_16x32_anim_6f.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Lights/candles_group_anim_4f.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Altars_Shrines/shrine_32x32_anim_4f.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Dark_Forest/dead_tree_big_32x48.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Dark_Forest/dark_pine_32x40.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Ruins/broken_column_16x48.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Ruins/rubble_1.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Graveyard/gravestone_1.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Graveyard/gravestone_3.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Tilemap_color1.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Water Foam.png',
  'assets/tiles/water_profundo.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Monk/Idle.png'
];
for (const rel of spritePaths) {
  assert(fs.existsSync(path.join(ROOT, rel)), 'Missing sprite on disk: ' + rel);
}
console.log('3. All ' + spritePaths.length + ' death diorama sprites verified on disk');

// 4. Verify In-World Death Code Uses Zero Radial Gradients in Defeat Overlay & Has Stepped Soul Wisp
const deadCanvasStart = gameCode.indexOf('if (this.player && this.player.deadTimer > 0)');
const deadCanvasSlice = gameCode.slice(deadCanvasStart, deadCanvasStart + 1800);
assert(!deadCanvasSlice.includes('createRadialGradient'), 'In-world death overlay must use stepped pixel Bayer wipe, not createRadialGradient');
assert(deadCanvasSlice.includes('bayerOrder'), 'In-world death overlay must implement stepped Bayer checkerboard wipe');
assert(gameCode.includes('stepAngles') && gameCode.includes('Soul Wisp'), 'drawPlayer must implement stepped pixel collapse & rising Soul Wisp');
console.log('4. In-world game.js pixel collapse + Bayer wipe verified');

// 5. Runtime VM Behavioral Simulation Across In-World Collapse -> Sanctuary Overlay -> Respawn
function makeEl(id) {
  const classes = new Set();
  if (id === 'death-overlay') classes.add('hidden');
  return {
    id,
    textContent: '',
    innerHTML: '',
    src: '',
    style: {},
    dataset: {},
    children: [],
    offsetWidth: 100,
    listeners: {},
    appendChild(ch) { this.children.push(ch); return ch; },
    removeChild() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getAttribute() { return null; },
    setAttribute() {},
    addEventListener(ev, fn) { this.listeners[ev] = fn; },
    classList: {
      add: (...c) => c.forEach(x => classes.add(x)),
      remove: (...c) => c.forEach(x => classes.delete(x)),
      toggle: (c, force) => (force === undefined ? (classes.has(c) ? classes.delete(c) : classes.add(c)) : (force ? classes.add(c) : classes.delete(c))),
      contains: (c) => classes.has(c),
      _set: classes
    }
  };
}

let deathOps = [];
const xfStack = [];
let xf = { tx: 0, ty: 0, sx: 1, sy: 1 };
const mockDeathCtx = {
  imageSmoothingEnabled: true,
  fillStyle: '',
  save() { xfStack.push({ ...xf }); },
  restore() { if (xfStack.length) xf = xfStack.pop(); },
  translate(x, y) { xf.tx += x * xf.sx; xf.ty += y * xf.sy; },
  scale(x, y) { xf.sx *= x; xf.sy *= y; },
  createRadialGradient() {
    throw new Error('createRadialGradient must not be called during death screen render');
  },
  fillRect(x, y, w, h) {
    assert(Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(w) && Number.isInteger(h),
      `Non-integer fillRect(${x}, ${y}, ${w}, ${h})`);
    const rx = Math.round(xf.tx + x * xf.sx);
    const ry = Math.round(xf.ty + y * xf.sy);
    deathOps.push(['fillRect', rx, ry, w, h, this.fillStyle]);
  },
  drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) {
    assert(this.imageSmoothingEnabled === false, 'imageSmoothingEnabled must remain false');
    assert(Number.isInteger(dx) && Number.isInteger(dy) && Number.isInteger(dw) && Number.isInteger(dh),
      `Non-integer drawImage dest(${dx}, ${dy}, ${dw}, ${dh})`);
    const fx = xf.sx < 0;
    const rx = fx ? Math.round(xf.tx - dw) : Math.round(xf.tx + dx);
    const ry = Math.round(xf.ty + dy);
    deathOps.push(['drawImage', img._src || img._key || 'img', sx, sy, sw, sh, rx, ry, dw, dh, fx]);
  }
};

const els = {
  'death-overlay': makeEl('death-overlay'),
  'death-pixel-canvas': { ...makeEl('death-pixel-canvas'), width: 640, height: 360, getContext: () => mockDeathCtx },
  'death-title': makeEl('death-title'),
  'death-stats-pill': makeEl('death-stats-pill'),
  'death-bar-fill': makeEl('death-bar-fill'),
  'death-countdown': makeEl('death-countdown'),
  'btn-death-main-menu': makeEl('btn-death-main-menu'),
  'hud-res-bar': makeEl('hud-res-bar'),
  'hotbar': makeEl('hotbar'),
  'spell-bar': makeEl('spell-bar'),
  'hud-hp-fill': makeEl('hud-hp-fill'),
  'hud-hp-val': makeEl('hud-hp-val'),
  'hud-en-fill': makeEl('hud-en-fill'),
  'hud-en-val': makeEl('hud-en-val'),
  'hud-xp-fill': makeEl('hud-xp-fill'),
  'hud-xp-val': makeEl('hud-xp-val'),
  'hud-lvl': makeEl('hud-lvl'),
  'hud-gold': makeEl('hud-gold'),
  'title-screen': makeEl('title-screen'),
  'hud-root': makeEl('hud-root')
};

let nextRafId = 1;
const activeRafs = new Map();
let simNow = 2000;

function MockImage() {
  this.complete = true;
  this.naturalWidth = 192;
  this.width = 192;
  this.height = 192;
  this._src = '';
  Object.defineProperty(this, 'src', {
    get() { return this._src; },
    set(v) { this._src = decodeURI(String(v)); }
  });
}

const regImg = (key, w, h, rel) => ({ _key: key, _src: rel, complete: true, naturalWidth: w, width: w, height: h });
const loadedSprites = {
  tile_1: regImg('tile_1', 576, 384, 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Tilemap_color1.png'),
  water_foam: regImg('water_foam', 3072, 192, 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Water Foam.png'),
  water_profundo: regImg('water_profundo', 80, 16, 'assets/tiles/water_profundo.png'),
  campfireAnim: regImg('campfireAnim', 96, 16, 'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Campsite/campfire_anim_6f.png'),
  brazier_orange: regImg('brazier_orange', 96, 32, 'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Lights/brazier_orange_16x32_anim_6f.png'),
  monk_yellow_idle: regImg('monk_yellow_idle', 1152, 192, 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Monk/Idle.png'),
  monk_yellow_run: regImg('monk_yellow_run', 768, 192, 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Monk/Run.png')
};

const sandbox = {
  window: {
    BALACLAVA_ROOT_BASE: '',
    localStorage: { getItem: () => 'es', setItem: () => {} },
    addEventListener: () => {}
  },
  document: {
    getElementById: (id) => els[id] || (els[id] = makeEl(id)),
    createElement: (tag) => makeEl(tag || 'dyn'),
    createTextNode: (t) => ({ nodeType: 3, textContent: t }),
    addEventListener: () => {},
    querySelectorAll: () => []
  },
  navigator: { language: 'es-ES' },
  Image: MockImage,
  performance: { now: () => simNow },
  requestAnimationFrame: (cb) => {
    const id = nextRafId++;
    activeRafs.set(id, cb);
    return id;
  },
  cancelAnimationFrame: (id) => { activeRafs.delete(id); },
  setTimeout: () => 1,
  clearTimeout: () => {},
  console,
  Math,
  Number,
  String,
  Array,
  Object,
  Boolean,
  Set,
  Map
};
sandbox.window.window = sandbox.window;
sandbox.window.Balaclava = {
  CONST: {
    BIOMES: {},
    RARITIES: {},
    GRID_PLOTS: 7,
    PLOT_TILES: 12,
    TILE_SIZE: 48,
    CENTER_PLOT: 24,
    WORLD_TILES: 84
  },
  Utils: {},
  Save: {},
  SKINS: [
    { id: 'monk_yellow', idle: 'monk_yellow_idle', run: 'monk_yellow_run' }
  ],
  ITEMS: new Proxy({}, { get: () => null }),
  RESOURCES: {},
  TOOLS: {},
  INVENTORY_ITEMS: {},
  SPELLS: {},
  BUFFS: {},
  SKILLS: {},
  ITEM_PNG_MAP: {},
  TOOL_PNG_MAP: {},
  SKILL_ICON_URLS: {},
  BUFF_ICON_URLS: {},
  UI_URLS: new Proxy({}, { get: () => 'assets/icons/skull_death.png' }),
  Assets: {
    get: (k) => loadedSprites[k] || null,
    extraImages: loadedSprites,
    dungeonImages: loadedSprites,
    chestImages: {},
    enemyImages: loadedSprites
  },
  Audio: { play: () => {}, tone: () => {} }
};
sandbox.globalThis = sandbox;
vm.runInNewContext(utilsCode + '\n' + i18nEnCode + '\n' + i18nCode + '\n' + uiCode, sandbox);

const UI = sandbox.window.Balaclava.UI;
assert(UI && typeof UI._renderDeathDiorama === 'function', 'Balaclava.UI._renderDeathDiorama missing');
UI.game = {
  started: true,
  coins: 75,
  dayCount: 3,
  stats: { kills: 14 },
  unlockedPlots: [0, 1, 4],
  toasts: [],
  inventory: {},
  hotbar: [],
  tools: {},
  resources: {},
  events: { getNextObjectiveHint: () => '' },
  saveSys: { hasSave: () => false, getSlotSummary: () => null },
  activeSkills: new Set(),
  spellSlots: [],
  mods: { maxHp: 100 },
  player: {
    skinId: 'monk_yellow',
    hp: 0,
    maxHp: 100,
    energy: 50,
    maxEnergy: 100,
    xp: 0,
    xpToNext: 100,
    level: 4,
    gold: 75,
    deadMax: 10.0,
    deadTimer: 10.0
  },
  isPlayerDead() { return this.player.deadTimer > 0; }
};
sandbox.window.Balaclava.game = UI.game;
sandbox.window.Balaclava.I18n.init();

// Phase A: elapsed = 0.0s -> in-world collapse plays, #death-overlay MUST stay hidden
UI.updateHUD(true);
assert(els['death-overlay'].classList.contains('hidden'), '#death-overlay must wait ~0.88s so in-world pixel collapse plays first');
assert(!UI._deathDioramaState, 'Death diorama rAF must not start while hidden');
assert.strictEqual(activeRafs.size, 0, 'Zero rAFs active during collapse window');

// Phase B: elapsed = 1.6s (deadTimer = 8.4s) -> #death-overlay appears & renders pixel diorama
UI.game.player.deadTimer = 8.4;
simNow = 3600;
UI.updateHUD(true);
assert(!els['death-overlay'].classList.contains('hidden'), '#death-overlay should become visible once collapse finishes');
assert(UI._deathDioramaState && UI._deathDioramaState.active, 'Death diorama rAF should become active');
assert.strictEqual(activeRafs.size, 1, 'Expected exactly 1 active death rAF');
assert.strictEqual(els['death-bar-fill'].style.width, '84%', 'Bar fill should snap in crisp 2% pixel steps');
assert(els['death-countdown'].textContent.includes('8.4s'), 'Countdown text must update');
assert(els['death-stats-pill'].textContent.includes('4') && els['death-stats-pill'].textContent.includes('14'), 'Stats row must display player stats');

// Verify integer-only pixel rendering & hero/shrine sprites + optional preview dump
deathOps = [];
UI._renderDeathDiorama(mockDeathCtx, 2.4, 0.35);
const drawnSprites = new Set(deathOps.filter(o => o[0] === 'drawImage').map(o => path.basename(String(o[1]))));
for (const expectedSprite of ['Tilemap_color1.png', 'Water Foam.png', 'campfire_anim_6f.png', 'brazier_orange_16x32_anim_6f.png', 'shrine_32x32_anim_4f.png', 'dead_tree_big_32x48.png', 'dark_pine_32x40.png', 'broken_column_16x48.png', 'Idle.png']) {
  assert(drawnSprites.has(expectedSprite), 'Expected diorama sprite not drawn: ' + expectedSprite);
}
if (process.env.DEATH_OPS_OUT) {
  fs.writeFileSync(process.env.DEATH_OPS_OUT, JSON.stringify(deathOps), 'utf8');
}

// Phase C: Respawn -> #death-overlay hides & cancels rAF cleanly
UI.game.player.hp = 100;
UI.game.player.deadTimer = 0;
UI.updateHUD(true);
assert(els['death-overlay'].classList.contains('hidden'), '#death-overlay must hide immediately upon respawn');
assert.strictEqual(UI._deathDioramaState, null, '_deathDioramaState must clear on respawn');
assert.strictEqual(activeRafs.size, 0, 'Death rAF must cancel cleanly on respawn');

console.log('5. Death pixel-art runtime lifecycle & sprite composition verified cleanly');

// 6. Verify GameEngine.prototype.drawPlayer in-world pixel collapse & rising Soul Wisp
vm.runInNewContext(gameCode, sandbox);
const GameProto = sandbox.window.Balaclava.GameEngine.prototype;
assert(typeof GameProto.drawPlayer === 'function', 'GameEngine.prototype.drawPlayer missing');
const worldOps = [];
let usedSmoothEllipse = false;
const mockWorldCtx = {
  imageSmoothingEnabled: true,
  fillStyle: '',
  globalAlpha: 1,
  save() {},
  restore() {},
  translate() {},
  rotate(a) { worldOps.push(['rotate', a]); },
  scale() {},
  beginPath() {},
  ellipse() { usedSmoothEllipse = true; },
  fill() {},
  fillRect(x, y, w, h) {
    assert(Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(w) && Number.isInteger(h),
      `Non-integer world dead fillRect(${x}, ${y}, ${w}, ${h})`);
    worldOps.push(['fillRect', x, y, w, h, this.fillStyle]);
  },
  drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) {
    worldOps.push(['drawImage', dx, dy, dw, dh]);
  }
};
const mockGameObj = {
  time: 12.5,
  player: { x: 400.4, y: 300.6, facing: 1, skinId: 'monk_yellow', deadMax: 10.0, deadTimer: 9.4, invuln: 9.0, moving: false, swingTimer: 0 }
};
GameProto.drawPlayer.call(mockGameObj, mockWorldCtx);
assert(!usedSmoothEllipse, 'Dead player ground shadow must use pixel fillRect, not smooth ellipse()');
assert(worldOps.some(op => op[0] === 'rotate' && Math.abs(op[1] + Math.PI / 2) < 1e-6), 'Dead player at elapsed 0.6s should reach full stepped 90deg fall pose');
assert(worldOps.some(op => op[0] === 'fillRect' && op[5] === '#4dd0e1'), 'Dead player collapse must draw ascending pixel Soul Wisp');
assert(worldOps.some(op => op[0] === 'drawImage'), 'Dead player sprite frame must still draw');

console.log('6. In-world drawPlayer pixel collapse, ash mound & Soul Wisp verified cleanly (ALL PASS)');
