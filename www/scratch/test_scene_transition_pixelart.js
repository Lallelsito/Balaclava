const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = 'C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www';
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'styles/main.css'), 'utf8');
const uiCode = fs.readFileSync(path.join(ROOT, 'src/ui/ui.js'), 'utf8');
const i18nCode = fs.readFileSync(path.join(ROOT, 'src/core/i18n.js'), 'utf8');

// 1. HTML Structure (Full-Screen Pixel Panorama + Minimalist HUD + Zero Emojis/Curtains)
const requiredHtml = [
  'id="scene-transition"',
  'id="st-pixel-canvas"',
  'width="640"',
  'height="360"',
  'class="st-stage"',
  'id="scene-transition-icon"',
  'id="scene-transition-label"',
  'id="scene-transition-sub"',
  'id="st-loading-bar-fill"',
  'id="st-loading-text"',
  'id="st-loading-pct"',
  'id="scene-transition-tip"',
  'id="scene-transition-tip-text"',
  'assets/icons/scroll_map.png'
];
for (const tag of requiredHtml) {
  assert(html.includes(tag), 'Missing HTML markup: ' + tag);
}
for (const forbidden of ['st-curtain', 'st-parade-track', 'st-sprite-pawn', 'st-sprite-sheep', '💡']) {
  assert(!html.includes(forbidden), 'Legacy or emoji markup must not exist: ' + forbidden);
}
console.log('1. HTML structure verified (full-screen pixel canvas, zero shutters/emojis)');

// 2. CSS Aesthetics (Minimalist, Pixelated, Dungeon + Overworld Themes, Readable 18px Body Pixel Font)
const requiredCss = [
  '.scene-transition.is-dungeon',
  '.scene-transition .st-pixel-canvas',
  'image-rendering: pixelated;',
  "font-family: 'BalaclavaTitlePixel'",
  "font-family: 'BalaclavaBodyPixel'",
  'font-size: 18px;',
  '.scene-transition.is-closing',
  '.scene-transition.is-opening'
];
for (const rule of requiredCss) {
  assert(css.includes(rule), 'Missing CSS rule: ' + rule);
}
const stCssStart = css.indexOf('/* Scene Transition Overlay');
const stCssEnd = css.indexOf('/* === TEXTURED PIXEL RPG FLOATING TOOLTIP');
assert(stCssStart !== -1 && stCssEnd > stCssStart, 'Could not locate Scene Transition CSS section');
const stCss = css.slice(stCssStart, stCssEnd);
assert(!stCss.includes('linear-gradient'), 'Scene transition CSS must avoid modern smooth gradients');
assert(!stCss.includes('@keyframes stBarPulse'), 'Legacy neon stBarPulse keyframe must not exist');
console.log('2. CSS rules verified (crisp pixelated panorama, zero smooth gradients/glows)');

// 3. Verify all Diorama Sprite & Tile PNG Paths Exist on Disk
const spritePaths = [
  'assets/icons/scroll_map.png',
  'assets/icons/balaclava_core.png',
  'assets/icons/skull_death.png',
  'assets/icons/campfire.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree1.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree4.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Tilemap_color1.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Water Foam.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/House1.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Bushes/Bushe1.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock1.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Pawn/Pawn_Run.png',
  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Meat/Sheep/Sheep_Move.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Campsite/campfire_anim_6f.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_1.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_cracked.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_mid.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_banner_red.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_iron_closed.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_iron_open.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Statues_Pillars/pillar_stone_16x48.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Lights/wall_torch_orange_anim_6f.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Lights/brazier_orange_16x32_anim_6f.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Statues_Pillars/statue_knight_16x32.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Chests/chest_gold_closed.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Bones_Webs_Chains/cobweb_TL.png',
  'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/02_Props/Bones_Webs_Chains/cobweb_TR.png',
  'assets/sprites_extra/enemies/skeleton_warrior_rogue_48px_4f.png'
];
for (const rel of spritePaths) {
  assert(fs.existsSync(path.join(ROOT, rel)), 'Missing sprite on disk: ' + rel);
}
console.log('3. All ' + spritePaths.length + ' panorama sprite assets verified on disk');

// 4. Runtime VM Behavioral Simulation Across All 3 Scene Modes
function makeEl(id) {
  const classes = new Set();
  return {
    id,
    textContent: '',
    src: '',
    style: {},
    offsetWidth: 100,
    classList: {
      add: (...c) => c.forEach(x => classes.add(x)),
      remove: (...c) => c.forEach(x => classes.delete(x)),
      toggle: (c, force) => (force === undefined ? (classes.has(c) ? classes.delete(c) : classes.add(c)) : (force ? classes.add(c) : classes.delete(c))),
      contains: (c) => classes.has(c),
      _set: classes
    }
  };
}

const canvasOps = [];
const mockCtx = {
  imageSmoothingEnabled: true,
  fillStyle: '',
  save() {},
  restore() {},
  translate() {},
  scale() {},
  fillRect(x, y, w, h) {
    assert(Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(w) && Number.isInteger(h),
      `Non-integer fillRect(${x}, ${y}, ${w}, ${h})`);
    canvasOps.push(['fillRect', x, y, w, h]);
  },
  drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) {
    assert(this.imageSmoothingEnabled === false, 'imageSmoothingEnabled must remain false');
    assert(Number.isInteger(dx) && Number.isInteger(dy) && Number.isInteger(dw) && Number.isInteger(dh),
      `Non-integer drawImage dest(${dx}, ${dy}, ${dw}, ${dh})`);
    canvasOps.push(['drawImage', img._key || 'img', dx, dy, dw, dh]);
  }
};

const els = {
  'scene-transition': makeEl('scene-transition'),
  'st-pixel-canvas': { ...makeEl('st-pixel-canvas'), width: 640, height: 360, getContext: () => mockCtx },
  'scene-transition-label': makeEl('scene-transition-label'),
  'scene-transition-sub': makeEl('scene-transition-sub'),
  'scene-transition-icon': makeEl('scene-transition-icon'),
  'st-loading-text': makeEl('st-loading-text'),
  'st-loading-bar-fill': makeEl('st-loading-bar-fill'),
  'st-loading-pct': makeEl('st-loading-pct'),
  'scene-transition-tip-text': makeEl('scene-transition-tip-text')
};

const scheduledTimeouts = [];
let nextRafId = 1;
const activeRafs = new Map();
let simNow = 1000;

function MockImage() {
  this.complete = true;
  this.naturalWidth = 192;
  this.width = 192;
  this.height = 192;
  this._key = 'lazy';
}

const loadedSprites = {};
const regMockImg = (key, w, h) => { loadedSprites[key] = { _key: key, complete: true, naturalWidth: w, width: w, height: h }; };
['tree1', 'tree4', 'tile_1', 'water_foam', 'bush1', 'rock1', 'b_house1_blue', 'monk_yellow_idle', 'monk_yellow_run', 'pawn_idle', 'pawn_run'].forEach(k => regMockImg(k, 192, 192));
regMockImg('sheep_idle', 768, 128);
regMockImg('sheep_move', 512, 128);
regMockImg('campfireAnim', 96, 16);
regMockImg('pradera_wall', 16, 32);
regMockImg('pradera_wallBanner', 16, 32);
regMockImg('pradera_floor1', 16, 16);
regMockImg('pradera_floor2', 16, 16);
regMockImg('pradera_pillar', 16, 48);
regMockImg('torch_orange', 96, 16);
regMockImg('brazier_orange', 96, 32);
regMockImg('statue_knight', 16, 32);
regMockImg('skeleton', 192, 48);

const sandbox = {
  window: {
    BALACLAVA_ROOT_BASE: '',
    localStorage: { getItem: () => 'es', setItem: () => {} },
    addEventListener: () => {}
  },
  document: {
    getElementById: (id) => els[id] || null,
    createElement: () => makeEl('dyn'),
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
  setTimeout: (fn, ms) => {
    const entry = { id: scheduledTimeouts.length + 1, fn, ms, cleared: false };
    scheduledTimeouts.push(entry);
    return entry.id;
  },
  clearTimeout: (id) => {
    const found = scheduledTimeouts.find(x => x.id === id);
    if (found) found.cleared = true;
  },
  console,
  Math,
  Date
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
    { id: 'monk_yellow', idle: 'monk_yellow_idle', run: 'monk_yellow_run' },
    { id: 'pawn_blue', idle: 'pawn_idle', run: 'pawn_run' }
  ],
  Assets: {
    get: (k) => loadedSprites[k] || null,
    extraImages: loadedSprites,
    dungeonImages: loadedSprites,
    chestImages: {},
    enemyImages: loadedSprites
  },
  Audio: { play: () => {}, tone: () => {} }
};

vm.runInNewContext(i18nCode + '\n' + uiCode, sandbox);
sandbox.window.Balaclava.I18n.setLanguage('es');
const UI = sandbox.window.Balaclava.UI;

// Test Overworld embark
let midCalled = 0;
let doneCalled = 0;
canvasOps.length = 0;
UI.playSceneTransition('BALACLAVA', () => { midCalled++; }, () => { doneCalled++; }, { sub: 'Cargando isla...' });
assert(els['scene-transition'].classList.contains('is-closing'), 'Should enter closing state');
assert(!els['scene-transition'].classList.contains('is-dungeon'), 'Overworld should not have is-dungeon');
assert.strictEqual(els['st-loading-text'].textContent, 'Navegando el archipiélago...');
assert(canvasOps.length > 50, 'Overworld diorama must draw full pixel scene on initial frame');
assert(activeRafs.size === 1, 'One rAF ticker must be active during transition');

// Advance animation frame toward midpoint of 5.6s showcase
simNow += 3800;
for (const [id, cb] of Array.from(activeRafs.entries())) {
  activeRafs.delete(id);
  cb(simNow);
}
assert(parseFloat(els['st-loading-bar-fill'].style.width) > 70, 'Progress bar should advance across 5.6s showcase');
const hasTree1 = canvasOps.some(op => op[0] === 'drawImage' && op[1] === 'tree1' && op[4] >= 96 && op[5] >= 128);
const hasTile1 = canvasOps.some(op => op[0] === 'drawImage' && op[1] === 'tile_1');
assert(hasTree1 && hasTile1, 'Overworld diorama must draw high-resolution tree1 and real tile_1 island');

// Complete midpoint & exit timers (~5.6s hold + 0.65s reveal = 6.25s, within 5-7s range)
const midTimeout1 = scheduledTimeouts.find(t => !t.cleared && t.ms >= 5000 && t.ms <= 6500);
assert(midTimeout1, 'Midpoint timeout missing or outside 5-7s duration target');
midTimeout1.fn();
assert.strictEqual(midCalled, 1);
assert(els['scene-transition'].classList.contains('is-opening'));
const endTimeout1 = scheduledTimeouts[scheduledTimeouts.length - 1];
assert(midTimeout1.ms + endTimeout1.ms >= 5000 && midTimeout1.ms + endTimeout1.ms <= 7000,
  'Total transition duration must be 5-7 seconds');
endTimeout1.fn();
assert.strictEqual(doneCalled, 1);
assert(els['scene-transition'].classList.contains('hidden'));
assert.strictEqual(activeRafs.size, 0, 'rAF loop must be cleanly canceled after exit');

// Test Dungeon transition (door opens past midpoint normP >= 0.56)
canvasOps.length = 0;
UI.playSceneTransition('CRIPTA ANCESTRAL', null, { kind: 'dungeon', icon: 'assets/icons/skull_death.png', sub: 'Descendiendo...' });
assert(els['scene-transition'].classList.contains('is-dungeon'), 'Dungeon must toggle is-dungeon class');
assert.strictEqual(els['st-loading-text'].textContent, 'Descendiendo a las catacumbas...');
simNow += 3600; // past normP >= 0.56 on 5.6s hold
canvasOps.length = 0;
for (const [id, cb] of Array.from(activeRafs.entries())) {
  activeRafs.delete(id);
  cb(simNow);
}
const hasOpenDoor = canvasOps.some(op => op[0] === 'drawImage' && op[1] === 'lazy');
const hasTorch = canvasOps.some(op => op[0] === 'drawImage' && op[1] === 'torch_orange');
const hasBrazier = canvasOps.some(op => op[0] === 'drawImage' && op[1] === 'brazier_orange');
const hasSkel = canvasOps.some(op => op[0] === 'drawImage' && op[1] === 'skeleton');
assert(hasOpenDoor && hasTorch && hasBrazier && hasSkel, 'Dungeon diorama must draw walls, torches, braziers, door, and skeleton');

// Test Save-exit transition
UI.playSceneTransition('Guardando y saliendo...', null, { sub: 'Guardando datos...' });
assert(!els['scene-transition'].classList.contains('is-dungeon'));
assert(els['scene-transition'].classList.contains('is-save'), 'Saving transition must toggle is-save class');
assert.strictEqual(els['st-loading-text'].textContent, 'Registrando crónica de la isla...');
UI._stopTransitionDiorama();
assert.strictEqual(activeRafs.size, 0, 'Manual stop clears rAF cleanly');

// Check zero emojis in i18n transition strings & ui transition section
sandbox.window.Balaclava.I18n.setLanguage('en');
assert.strictEqual(sandbox.window.Balaclava.I18n.t('transition.statusDungeon'), 'Unsealing ancient catacombs...');
assert.strictEqual(sandbox.window.Balaclava.I18n.t('transition.statusOverworld'), 'Sailing across the archipelago...');
assert.strictEqual(sandbox.window.Balaclava.I18n.t('transition.statusSave'), 'Inscribing island chronicle...');
assert(!/[\u{1F300}-\u{1FAFF}]/u.test(uiCode.slice(uiCode.indexOf('playSceneTransition'), uiCode.indexOf('playSceneTransition') + 14000)),
  'Transition code must contain zero emojis');

console.log('4. Runtime VM diorama checks passed for overworld, dungeon, and save modes');
console.log('ALL SCENE TRANSITION PIXEL ART TESTS PASSED 100%!');
