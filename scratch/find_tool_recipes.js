const fs = require('fs');
global.window = {};
const recipesCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8');
eval(recipesCode);
window.Balaclava.RECIPES.forEach(r => {
  const str = JSON.stringify(r);
  if (str.includes('hacha') || str.includes('pico') || str.includes('pala') || str.includes('espada') || str.includes('cana')) {
    console.log(r.id, r.station, r.out, r.toolUnlock);
  }
});
