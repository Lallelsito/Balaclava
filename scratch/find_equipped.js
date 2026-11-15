const fs = require('fs');
const c = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/engine/game.js', 'utf-8');
c.split('\n').forEach((l, idx) => {
  if (l.includes('this.equipped') || l.includes('useOrEquipItem')) {
    console.log(`${idx+1}: ${l.trim()}`);
  }
});
