// Automated verification test for the redesigned pixel-art fishing animation in BALACLAVA
const assert = require('assert');
const fs = require('fs');

console.log('🧪 Starting Fishing Animation Overhaul Verification...');

// 1. Verify Assets definitions in sprites_atlas.js
const atlasContent = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/core/sprites_atlas.js', 'utf-8');
assert(atlasContent.includes('water_splash_fx'), 'sprites_atlas.js must include water_splash_fx');
assert(atlasContent.includes('water_ripple_sheet'), 'sprites_atlas.js must include water_ripple_sheet');
assert(atlasContent.includes('fish_anchoa'), 'sprites_atlas.js must include fish_anchoa');
assert(atlasContent.includes('fish_pez_dorado'), 'sprites_atlas.js must include fish_pez_dorado');
assert(atlasContent.includes('fish_trucha_arcoiris'), 'sprites_atlas.js must include fish_trucha_arcoiris');
console.log('✅ 1. Sprites Atlas mappings verified.');

// 2. Verify Mock Environment for Fishing Simulation
const mockUtils = {
  dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
  isImgReady: () => true,
  randInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  clamp: (v, min, max) => Math.max(min, Math.min(max, v))
};

global.window = {
  Balaclava: {
    CONST: { CENTER_PLOT: 4, TILE_SIZE: 16 },
    Utils: mockUtils,
    Audio: { play: (s) => {} },
    I18n: { t: (k, p) => k },
    getToolStats: () => ({ tierIdx: 0 }),
    ITEMS: {
      pez_comun: { id: 'pez_comun', name: 'Pez Común', price: 10 },
      pez_dorado: { id: 'pez_dorado', name: 'Pez Dorado', price: 50 },
      trucha_arcoiris: { id: 'trucha_arcoiris', name: 'Trucha Arcoíris', price: 30 }
    },
    Assets: {
      extraImages: {
        fish_pez_comun: { complete: true, naturalWidth: 16, naturalHeight: 16 },
        fish_pez_dorado: { complete: true, naturalWidth: 16, naturalHeight: 16 },
        fish_trucha_arcoiris: { complete: true, naturalWidth: 16, naturalHeight: 16 }
      }
    }
  }
};
global.Balaclava = global.window.Balaclava;

// Load farming.js
const farmingCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/systems/farming.js', 'utf-8');
eval(farmingCode);
assert(Balaclava.FarmingAndFishing, 'FarmingAndFishing must be defined');
console.log('✅ 2. Farming system loaded into runtime.');

// 3. Test startFishing and fish actor initialization
const farming = new Balaclava.FarmingAndFishing();
let particlesSpawned = [];
let fxSpawned = [];
let floatingTexts = [];
let leapsSpawned = [];

const mockGame = {
  player: { x: 100, y: 100, facing: 1 },
  toolTiers: { cana: 'basica' },
  buildings: [],
  inventory: { bayas: 2 },
  mods: {},
  stats: { fishCaught: 0 },
  world: {
    getBiomeAtPixel: () => 'pradera',
    nodes: []
  },
  spawnParticles: (x, y, color, count) => particlesSpawned.push({ x, y, color, count }),
  spawnFx: (key, x, y, ang, dur, sc, a) => fxSpawned.push({ key, x, y, dur }),
  addFloatingText: (x, y, txt, col) => floatingTexts.push({ x, y, txt }),
  gainXp: (xp) => {},
  addItem: (id, q) => {},
  addCoins: (c) => {},
  toast: () => {},
  spawnFishCatchLeap: (sx, sy, tx, ty, id) => leapsSpawned.push({ sx, sy, tx, ty, id })
};

farming.startFishing(mockGame, 160, 100);
const f = farming.fishing;
assert(f, 'Fishing state must be active');
assert(f.shadows && f.shadows.length >= 2, 'Fishing must spawn target fish and ambient school fish');

const targetFish = f.shadows.find(s => s.isTarget);
assert(targetFish, 'Must have a designated target fish actor');
assert(targetFish.depth >= 0.5, 'Target fish should start in deep water');
assert(targetFish.wiggleSpeed >= 6, 'Target fish should have swimming wiggle speed');
console.log('✅ 3. startFishing spawns rich pixel-art fish actors with depth and swim mechanics.');

// 4. Test phase progression and underwater approaches
// Transition from cast to wait
f.timer = 0.01;
farming.updateFishing(0.02, mockGame);
assert.strictEqual(f.phase, 'wait', 'Phase must transition to wait');
assert(f.bobX === 160 && f.bobY === 100, 'Bobber must land at water target');

// Simulate wait countdown: target fish must approach the lure
f.timer = 1.0; // Near bite
const initialDist = targetFish.dist;
farming.updateFishing(0.25, mockGame);
assert(targetFish.dist < initialDist, 'Target fish should swim closer to the lure when inspecting bait');
assert(targetFish.depth < 0.6, 'Target fish should rise towards the surface when inspecting bait');

// Trigger bite
f.timer = 0.01;
farming.updateFishing(0.02, mockGame);
assert.strictEqual(f.phase, 'bite', 'Phase must transition to bite');
assert(fxSpawned.some(fx => fx.key === 'water_splash_fx'), 'Bite must trigger water splash FX');
assert(floatingTexts.some(ft => ft.txt.includes('PICA') || ft.txt.includes('fish.bite')), 'Bite must show high-visibility prompt');
console.log('✅ 4. updateFishing smoothly handles approach, surface rise, and bite splash reaction.');

// 5. Test minigame reeling and catch leap
farming.beginReeling(mockGame);
assert.strictEqual(f.phase, 'reel', 'beginReeling must transition to reel');
farming.updateFishing(0.1, mockGame);
assert(targetFish.dist <= 16, 'Hooked fish must stay struggling close to the lure');

// Complete catch
farming.completeCatch(mockGame);
assert(leapsSpawned.length === 1, 'completeCatch must launch spawnFishCatchLeap');
assert.strictEqual(leapsSpawned[0].sx, 160, 'Leap must start at water bobber coordinates');
assert.strictEqual(leapsSpawned[0].tx, 100, 'Leap must target player hands');
console.log('✅ 5. completeCatch launches graceful leaping fish arc out of the water.');

// 6. Test Canvas Rendering Logic in game.js
const gameCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/engine/game.js', 'utf-8');
assert(gameCode.includes('renderFishingWorld(ctx)'), 'game.js must define renderFishingWorld');
assert(gameCode.includes('renderFishCatchLeaps(ctx)'), 'game.js must define renderFishCatchLeaps');
assert(gameCode.includes('spawnFishCatchLeap('), 'game.js must define spawnFishCatchLeap');

// Verify that renderFishingWorld does NOT use smooth canvas vector circles for bobber or ripples
const renderMethod = gameCode.slice(gameCode.lastIndexOf('renderFishingWorld(ctx) {'), gameCode.lastIndexOf('renderFishCatchLeaps(ctx) {'));
assert(!renderMethod.includes('ctx.arc('), 'renderFishingWorld must NOT use ctx.arc (vector circles) for bobber');
assert(!renderMethod.includes('ctx.ellipse('), 'renderFishingWorld must NOT use ctx.ellipse for ripples');
assert(renderMethod.includes('ctx.fillRect('), 'renderFishingWorld must use integer pixel rects for crisp pixel art');
console.log('✅ 6. renderFishingWorld strictly adheres to pixel-art rendering (no vector circles).');

console.log('\n🎉 ALL 6 VERIFICATION CHECKS PASSED 100%!');
