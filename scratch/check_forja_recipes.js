const fs = require('fs');
global.window = {};
const recipesCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8');
eval(recipesCode);
const forjaRecs = window.Balaclava.RECIPES.filter(r => r.station === 'forja');
console.log('Total forja recipes:', forjaRecs.length);
forjaRecs.forEach(r => {
  console.log(`id: ${r.id}, out: ${r.out}, toolUnlock: ${r.toolUnlock}, in: ${JSON.stringify(r.in)}`);
});
