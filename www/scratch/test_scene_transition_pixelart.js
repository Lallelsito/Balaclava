const fs = require('fs');

const html = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/index.html', 'utf8');
const css = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/styles/main.css', 'utf8');
const ui = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/ui/ui.js', 'utf8');

// Check HTML elements
const requiredHtml = [
  'id=\"scene-transition\"',
  'class=\"st-stage\"',
  'class=\"st-sprite-pawn\"',
  'class=\"st-sprite-sheep\"',
  'class=\"st-loading-bar-fill\"',
  'id=\"scene-transition-tip-text\"',
  'id=\"scene-transition-label\"',
  'id=\"scene-transition-sub\"',
  'id=\"scene-transition-icon\"'
];

requiredHtml.forEach(tag => {
  if (!html.includes(tag)) throw new Error('Missing HTML tag: ' + tag);
});
console.log('HTML structure verified: ALL PRESENT');

// Check CSS rules
const requiredCss = [
  '@keyframes stPawnRun',
  '@keyframes stSheepBounce',
  '@keyframes stBarPulse',
  '.st-sprite-pawn',
  '.st-sprite-sheep',
  '.st-stage',
  '.st-loading-bar-frame'
];

requiredCss.forEach(rule => {
  if (!css.includes(rule)) throw new Error('Missing CSS rule: ' + rule);
});
console.log('CSS rules verified: ALL PRESENT');

// Check JS UI logic
if (!ui.includes('scene-transition-tip-text') || !ui.includes('tipsEs')) {
  throw new Error('Missing tip rotation in ui.js');
}
console.log('UI Tip rotation verified: ALL PRESENT');

// Verify asset paths on disk
const pawnPath = 'C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Pawn/Pawn_Run Pickaxe.png';
const sheepPath = 'C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/assets/packs/Tiny Swords/Tiny Swords (Update 010)/Resources/Sheep/HappySheep_Bouncing.png';

if (!fs.existsSync(pawnPath)) throw new Error('Pawn sprite missing at: ' + pawnPath);
if (!fs.existsSync(sheepPath)) throw new Error('Sheep sprite missing at: ' + sheepPath);

console.log('Sprite files on disk: VERIFIED OK');
console.log('ALL LOADING SCREEN PIXEL ART TESTS PASSED 100%!');
