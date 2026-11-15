const fs = require('fs');
global.window = {};
const itemsCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/items.js', 'utf-8');
const recipesCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8');
eval(itemsCode);
eval(recipesCode);

const ITEMS = window.Balaclava.ITEMS;
const RECIPES = window.Balaclava.RECIPES;

const armors = { helmet: [], armor: [], shield: [], boots: [] };
Object.values(ITEMS).forEach(it => {
  if (it.equipSlot && armors[it.equipSlot]) {
    armors[it.equipSlot].push(it.id);
  }
});

console.log('Armors in ITEMS:');
for (const [slot, list] of Object.entries(armors)) {
  console.log(`Slot ${slot} (${list.length}):`, list.join(', '));
}

console.log('\nArmor Recipes in RECIPES:');
RECIPES.forEach(r => {
  const outItem = ITEMS[r.out];
  if (outItem && outItem.equipSlot) {
    console.log(`${r.id} -> ${r.out} (${outItem.equipSlot}), in: ${JSON.stringify(r.in)}`);
  }
});
