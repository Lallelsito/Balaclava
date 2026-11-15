const fs = require('fs');
global.window = {};
const bldCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/buildings.js', 'utf-8');
eval(bldCode);
Object.values(window.Balaclava.BUILDINGS).forEach(b => {
  console.log(`${b.id}: name="${b.name}", station="${b.station}", opensPanel="${b.opensPanel}"`);
});
