const fs = require('fs');
['src/core/i18n.js', 'src/data/buildings.js', 'src/data/recipes.js', 'src/ui/ui.js'].forEach(f => {
  const p = 'C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/' + f;
  const c = fs.readFileSync(p, 'utf-8');
  c.split('\n').forEach((l, idx) => {
    if (l.toLowerCase().includes('herreria') || l.toLowerCase().includes('herrería')) {
      console.log(`${f}:${idx+1}: ${l.trim()}`);
    }
  });
});
