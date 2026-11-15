const fs = require('fs');
const c = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/ui/ui.js', 'utf-8');
c.split('\n').forEach((l, idx) => {
  if (l.includes('renderBuildingInspector')) {
    console.log((idx+1) + ': ' + l.trim());
  }
});
