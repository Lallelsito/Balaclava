const fs = require('fs');
global.window = {};
const recipesCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8');
const itemsCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/items.js', 'utf-8');
eval(itemsCode);
eval(recipesCode);

const RECIPES = window.Balaclava.RECIPES;

const standardWeapons = ['daga_hierro', 'lanza_hierro', 'maza_hierro', 'hacha_batalla_hierro', 'espadon_hierro', 'ballesta_madera'];
const specialWeapons = [
  'varita_arcana', 'espada_llamarada', 'espada_relampago', 'katana_sakura', 'hoja_glacial',
  'martillo_paladin', 'espadon_oro', 'espadon_legendario', 'lanza_carmesi', 'alabarda_real',
  'maza_acero', 'maza_legendaria', 'hacha_batalla_oro', 'hacha_batalla_legendaria', 'ballesta_legendaria',
  'espada_tormenta', 'espada_solar_mitica', 'espada_prismatica', 'cetro_vacio'
];

console.log('Standard weapons check:');
standardWeapons.forEach(w => {
  const r = RECIPES.find(rec => rec.out === w);
  console.log(w, r ? `OK (rec: ${r.id}, station: ${r.station})` : 'MISSING');
});

console.log('\nSpecial weapons check:');
specialWeapons.forEach(w => {
  const r = RECIPES.find(rec => rec.out === w);
  console.log(w, r ? `OK (rec: ${r.id}, station: ${r.station})` : 'MISSING');
});
