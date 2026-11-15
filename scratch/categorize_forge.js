const fs = require('fs');
global.window = {};
eval(fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/items.js', 'utf-8'));
eval(fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8'));

const RECIPES = window.Balaclava.RECIPES;
const ITEMS = window.Balaclava.ITEMS;

const forgeRecs = RECIPES.filter(r => r.station === 'forja' || r.station === 'yunque_runico');

const armorSlots = ['helm', 'armor', 'shield', 'boots'];
const standardWeaponTypes = ['daga_hierro', 'lanza_hierro', 'maza_hierro', 'hacha_batalla_hierro', 'espadon_hierro', 'ballesta_madera', 'daga_acero', 'daga_oro'];

function getCategory(rec) {
  const item = ITEMS[rec.out];
  if (!item) return 'otros';

  if (item.equipSlot && armorSlots.includes(item.equipSlot === 'helmet' ? 'helm' : item.equipSlot)) {
    return 'armadura';
  }

  if (item.equipSlot === 'weapon' || item.type === 'weapon' || rec.out.startsWith('espada_') || rec.out.startsWith('daga_') || rec.out.startsWith('lanza_') || rec.out.startsWith('maza_') || rec.out.startsWith('hacha_batalla_') || rec.out.startsWith('espadon_') || rec.out.startsWith('ballesta_') || rec.out.startsWith('varita_') || rec.out.startsWith('cetro_') || rec.out.startsWith('alabarda_') || rec.out.startsWith('martillo_') || rec.out.startsWith('katana_') || rec.out.startsWith('hoja_')) {
    if (standardWeaponTypes.includes(rec.out)) {
      return 'armas';
    }
    return 'armas_especiales';
  }

  return 'otros';
}

const groups = {
  armas: [],
  armas_especiales: [],
  armadura: [],
  otros: []
};

forgeRecs.forEach(r => {
  const cat = getCategory(r);
  groups[cat].push(r.out);
});

console.log('Armas count:', groups.armas.length, groups.armas);
console.log('Armas especiales count:', groups.armas_especiales.length, groups.armas_especiales);
console.log('Armadura count:', groups.armadura.length);
console.log('Otros count:', groups.otros.length, groups.otros);
