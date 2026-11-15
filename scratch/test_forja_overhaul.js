const fs = require('fs');
global.window = {};
eval(fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/items.js', 'utf-8'));
eval(fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/tools.js', 'utf-8'));
eval(fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8'));

const RECIPES = window.Balaclava.RECIPES;
const TOOLS = window.Balaclava.TOOLS;
const ITEMS = window.Balaclava.ITEMS;

console.log('1. Verifying r_tool_pico:');
const picoRec = RECIPES.find(r => r.toolUnlock === 'pico');
console.log('picoRec exists:', !!picoRec, picoRec);
if (!picoRec) throw new Error('r_tool_pico missing!');

console.log('\n2. Verifying Balaclava.TOOLS has all 8 tools:');
const expectedTools = ['pico', 'hacha', 'pala', 'espada', 'azada', 'guadana', 'cana', 'arco'];
expectedTools.forEach(t => {
  const tool = TOOLS[t];
  const rec = RECIPES.find(r => r.toolUnlock === t);
  console.log(`Tool ${t}: defined=${!!tool}, recipe=${!!rec}`);
  if (!tool || !rec) throw new Error(`Missing tool or recipe for ${t}`);
});

console.log('\n3. Verifying armor chains for progressive system:');
const ARMOR_CHAINS = {
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

let missingArmorRecipes = 0;
for (const [slot, items] of Object.entries(ARMOR_CHAINS)) {
  items.forEach((id, idx) => {
    const it = ITEMS[id];
    const rec = RECIPES.find(r => r.out === id);
    if (!it || !rec) {
      console.error(`Missing item or recipe: ${id}`);
      missingArmorRecipes++;
    }
  });
}
console.log('Missing armor recipes:', missingArmorRecipes);
if (missingArmorRecipes > 0) throw new Error('Some armor recipes are missing!');

console.log('\nAll checks passed successfully!');
