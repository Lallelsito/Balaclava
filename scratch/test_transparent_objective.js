const fs = require('fs');
const path = require('path');

console.log('=== TEST: Transparent Objective Panel Verification ===');
const css = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/styles/main.css', 'utf8');

// 1. Check transparency
if (!css.includes('rgba(12, 16, 28, 0.45)')) {
  console.error('FAIL: Expected semi-transparent background not found in main.css');
  process.exit(1);
}
console.log('PASS: Semi-transparent background (45% opacity) verified.');

// 2. Check textured border image
if (!css.includes("border-image-source: url('../assets/ui/rpg_subcard_panel.png')")) {
  console.error('FAIL: Textured border-image not configured.');
  process.exit(1);
}
console.log('PASS: Textured RPG subcard 9-slice frame border verified.');

// 3. Check hover focus state
if (!css.includes('#objective-banner:hover') || !css.includes('rgba(12, 16, 28, 0.88)')) {
  console.error('FAIL: Interactive hover opacity increase not configured.');
  process.exit(1);
}
console.log('PASS: Interactive hover opacity increase (88%) verified.');

// 4. Check text shadow contrast
if (!css.includes('text-shadow: 0 1px 2px #000, 1px 1px 0 #000')) {
  console.error('FAIL: High-contrast text shadows not configured.');
  process.exit(1);
}
console.log('PASS: High-contrast drop shadows for daytime/nighttime legibility verified.');

// 5. Verify assets
['assets/ui/rpg_subcard_panel.png', 'assets/ui/ico_star.png', 'assets/ui/ico_sparkle.png'].forEach(f => {
  const full = path.join('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www', f);
  if (!fs.existsSync(full)) {
    console.error('FAIL: Asset missing: ' + full);
    process.exit(1);
  }
});
console.log('PASS: All referenced frame and icon assets exist.');

console.log('=== ALL TRANSPARENT OBJECTIVE PANEL TESTS PASSED 100%! ===');
