const fs = require('fs');
global.window = {};
const recipesCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8');
const itemsCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/items.js', 'utf-8');
eval(itemsCode);
eval(recipesCode);

const chains = {
  helm: [
    'casco_cuero', 'casco_bronce', 'casco_cobre', 'casco_hierro', 'casco_plata',
    'casco_oro', 'casco_platino', 'casco_acero', 'casco_cristal', 'casco_mitrilo',
    'casco_titanio', 'casco_adamantita', 'casco_oricalco', 'casco_balaclava', 'casco_solar'
  ],
  armor: [
    'armadura_cuero', 'armadura_bronce', 'armadura_cobre', 'armadura_hierro', 'armadura_plata',
    'armadura_oro', 'armadura_platino', 'armadura_acero', 'armadura_cristal', 'armadura_mitrilo',
    'armadura_titanio', 'armadura_adamantita', 'armadura_oricalco', 'armadura_volcanica', 'armadura_celestial'
  ],
  shield: [
    'escudo_madera', 'escudo_bronce', 'escudo_cobre', 'escudo_hierro', 'escudo_plata',
    'escudo_oro', 'escudo_platino', 'escudo_acero', 'escudo_cristal', 'escudo_mitrilo',
    'escudo_titanio', 'escudo_adamantita', 'escudo_oricalco', 'escudo_solar', 'escudo_celestial'
  ],
  boots: [
    'botas_cuero', 'botas_bronce', 'botas_cobre', 'botas_hierro', 'botas_plata',
    'botas_oro', 'botas_platino', 'botas_acero', 'botas_cristal', 'botas_mitrilo',
    'botas_titanio', 'botas_adamantita', 'botas_oricalco', 'botas_viento', 'botas_celestiales'
  ]
};

const RECIPES = window.Balaclava.RECIPES;
const ITEMS = window.Balaclava.ITEMS;

for (const [slot, list] of Object.entries(chains)) {
  console.log(`\n=== Slot: ${slot} ===`);
  list.forEach((itemId, idx) => {
    const item = ITEMS[itemId];
    const rec = RECIPES.find(r => r.out === itemId);
    console.log(`Tier ${idx+1}: ${itemId} -> Item: ${item ? item.name : 'MISSING!'}, Rec: ${rec ? rec.id : 'MISSING!'}`);
  });
}
