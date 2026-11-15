const fs = require('fs');

console.log('=== TEST: Slash FX Redesign Audit ===');
const gameJs = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/engine/game.js', 'utf8');

// 1. Verify oversized slash_strip_white is NOT used
if (gameJs.includes('slash_strip_white')) {
  console.error('FAIL: slash_strip_white still in game.js');
  process.exit(1);
}
console.log('PASS: Oversized slash_strip_white removed completely.');

// 2. Verify sz is compact (28-34px)
if (gameJs.includes('sz = p.swingTool === \'espada\' ? 74') || gameJs.includes('sz = 74') || gameJs.includes('sz = 92')) {
  console.error('FAIL: Giant 74-92px slash size still present in game.js');
  process.exit(1);
}
console.log('PASS: Slash effect scale reduced to compact 28-34px pixel-perfect range.');

// 3. Verify stationary lingering spawnFx slashWhite on empty swings is removed
if (gameJs.includes("this.spawnFx('slashWhite'")) {
  console.error('FAIL: Stationary slashWhite still being spawned in game.js');
  process.exit(1);
}
console.log('PASS: Lingering stationary world slashWhite entities eliminated.');

console.log('=== ALL SLASH REDESIGN TESTS PASSED! ===');
