const fs = require('fs');

// Check game.js syntax
const code = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/engine/game.js', 'utf8');
new Function(code);
console.log('game.js syntax: PASSED');

// Mock Balaclava
global.window = global;
global.Balaclava = { CONST: { CENTER_PLOT: 4, TILE_SIZE: 48, PLOT_TILES: 12, WORLD_TILES: 108 } };

// Test archipelago island positions vs signature
const w = 1280;
const h = 720;
const ts = 48;
const sigX = Math.round(w - 210);
const sigY = Math.round(h - 75);

// Run 20 random procedural seeds to ensure 100% of generated archipelagos never overlap signature
const { Balaclava: B } = global;

// Mock Game
const Game = {
  generateTitleArchipelago: null
};

// Extract generateTitleArchipelago from game.js
const m = code.match(/generateTitleArchipelago\([\s\S]*?\n    \}/);
if (!m) throw new Error('Could not find generateTitleArchipelago');

eval('Game.generateTitleArchipelago = function ' + m[0]);

for (let seed = 1; seed <= 20; seed++) {
  const arch = Game.generateTitleArchipelago(w, h, seed * 1000);
  for (const isl of arch.islands) {
    for (let ry = 0; ry < isl.rows; ry++) {
      for (let cx = 0; cx < isl.cols; cx++) {
        if (!isl.mask[ry] || !isl.mask[ry][cx]) continue;
        const px = isl.ox + cx * ts;
        const py = isl.oy + ry * ts;
        // Check distance to signature
        if (px + ts >= sigX - 70 && py + ts * 1.5 >= sigY - 70) {
          throw new Error(`Seed ${seed} island ${isl.id} tile [${cx},${ry}] touches signature zone! px:${px}, py:${py}`);
        }
      }
    }
  }
}
console.log('Procedural island generation (20 seeds tested): 100% CLEAR OF SIGNATURE');

// Check CSS
const css = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/styles/main.css', 'utf8');
if (!css.includes('.title-signature {\n  display: none !important;\n}')) {
  throw new Error('HTML .title-signature is not hidden in CSS');
}
console.log('HTML .title-signature hidden in CSS: VERIFIED');

console.log('ALL SIGNATURE IN OCEAN TESTS PASSED 100%!');
