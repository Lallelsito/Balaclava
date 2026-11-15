const fs = require('fs');
global.window = {};
eval(fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/items.js', 'utf-8'));
eval(fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8'));

const RECIPES = window.Balaclava.RECIPES;
const ITEMS = window.Balaclava.ITEMS;

const stations = {};
RECIPES.forEach(r => {
  if (!stations[r.station]) stations[r.station] = [];
  stations[r.station].push(r);
});

for (const st of Object.keys(stations)) {
  console.log(`\n=================== Station: ${st} (${stations[st].length} recipes) ===================`);
  stations[st].forEach(r => {
    const item = ITEMS[r.out];
    const name = r.toolUnlock ? ('TOOL: ' + r.toolUnlock) : (item ? item.name : r.out);
    console.log(`  id: ${r.id.padEnd(25)} out: ${(r.out || r.toolUnlock || '').padEnd(25)} name: ${name}`);
  });
}
