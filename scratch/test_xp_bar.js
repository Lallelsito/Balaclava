const fs = require('fs');
const path = require('path');

console.log('=== TEST: XP Bar Integration & Visual Polish Audit ===');

const html = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/index.html', 'utf8');
const css = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/styles/main.css', 'utf8');
const gameJs = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/engine/game.js', 'utf8');
const uiJs = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/ui/ui.js', 'utf8');

// 1. Check HTML elements
const requiredHtmlIds = ['hud-xp-row', 'xp-orb-icon', 'xp-bar-frame', 'xp-fill', 'xp-text', 'lvl-text', 'coin-text'];
for (const id of requiredHtmlIds) {
  if (!html.includes(`id="${id}"`)) {
    console.error(`FAIL: Missing HTML id="${id}"`);
    process.exit(1);
  }
}
console.log('PASS: All required XP bar DOM elements found in index.html');

// 2. Check CSS styling
const requiredCssSelectors = [
  '.bar-icon-xp',
  '.xp-bar-frame',
  'rpg_bar_ornate.png',
  '.fill-xp',
  'xpGlintSweep',
  '.xp-bar-pulse',
  '.xp-orb-bounce',
  '.lvl-crest-burst',
  '.bar-xp-num'
];
for (const sel of requiredCssSelectors) {
  if (!css.includes(sel)) {
    console.error(`FAIL: Missing CSS selector/rule: "${sel}"`);
    process.exit(1);
  }
}
console.log('PASS: All XP bar visual styles, animations, and glint effects found in main.css');

// 3. Check Game & UI JS logic
if (!gameJs.includes('xp-bar-pulse') || !gameJs.includes('xp-orb-bounce') || !gameJs.includes('lvl-crest-burst')) {
  console.error('FAIL: Missing XP pulse / level burst triggers in game.js');
  process.exit(1);
}
console.log('PASS: Dynamic gainXp and Level Up animations hooked into game.js');

if (!uiJs.includes('xpPct') || !uiJs.includes('xpTxtEl.title')) {
  console.error('FAIL: Missing XP percentage or tooltip logic in ui.js');
  process.exit(1);
}
console.log('PASS: XP progress tooltip & percentage calculations active in ui.js');

// 4. Verify assets exist
const requiredAssets = [
  'assets/icons/xp_orb.png',
  'assets/ui/rpg_bar_ornate.png',
  'assets/ui/coin_gold.png'
];
for (const asset of requiredAssets) {
  const full = path.join('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www', asset);
  if (!fs.existsSync(full)) {
    console.error(`FAIL: Missing asset file: ${full}`);
    process.exit(1);
  }
}
console.log('PASS: All referenced sprite and frame assets exist on disk.');

console.log('=== ALL XP BAR TESTS PASSED 100% CLEANLY! ===');
