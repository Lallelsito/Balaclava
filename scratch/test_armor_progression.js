const fs = require('fs');
global.window = {};
eval(fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/items.js', 'utf-8'));
eval(fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8'));

const RECIPES = window.Balaclava.RECIPES;
const ITEMS = window.Balaclava.ITEMS;

const ARMOR_CHAINS = {
  helm: {
    slotName: 'Casco',
    items: [
      'casco_cuero', 'casco_bronce', 'casco_cobre', 'casco_hierro', 'casco_plata',
      'casco_oro', 'casco_platino', 'casco_acero', 'casco_cristal', 'casco_mitrilo',
      'casco_titanio', 'casco_adamantita', 'casco_oricalco', 'casco_balaclava', 'casco_solar'
    ]
  },
  armor: {
    slotName: 'Armadura',
    items: [
      'armadura_cuero', 'armadura_bronce', 'armadura_cobre', 'armadura_hierro', 'armadura_plata',
      'armadura_oro', 'armadura_platino', 'armadura_acero', 'armadura_cristal', 'armadura_mitrilo',
      'armadura_titanio', 'armadura_adamantita', 'armadura_oricalco', 'armadura_volcanica', 'armadura_celestial'
    ]
  },
  shield: {
    slotName: 'Escudo',
    items: [
      'escudo_madera', 'escudo_bronce', 'escudo_cobre', 'escudo_hierro', 'escudo_plata',
      'escudo_oro', 'escudo_platino', 'escudo_acero', 'escudo_cristal', 'escudo_mitrilo',
      'escudo_titanio', 'escudo_adamantita', 'escudo_oricalco', 'escudo_solar', 'escudo_celestial'
    ]
  },
  boots: {
    slotName: 'Botas',
    items: [
      'botas_cuero', 'botas_bronce', 'botas_cobre', 'botas_hierro', 'botas_plata',
      'botas_oro', 'botas_platino', 'botas_acero', 'botas_cristal', 'botas_mitrilo',
      'botas_titanio', 'botas_adamantita', 'botas_oricalco', 'botas_viento', 'botas_celestiales'
    ]
  }
};

function getNextArmorRecipe(slot, g) {
  const chain = ARMOR_CHAINS[slot];
  if (!chain) return null;

  let highestIdx = -1;
  chain.items.forEach((id, idx) => {
    const isEquipped = g.equipped && g.equipped[slot] === id;
    const inInv = (g.inventory && g.inventory[id] || 0) > 0;
    if (isEquipped || inInv) {
      if (idx > highestIdx) highestIdx = idx;
    }
  });

  if (highestIdx === -1) {
    // Has none: offer base piece (T1)
    const baseId = chain.items[0];
    const rec = RECIPES.find(r => r.out === baseId);
    return {
      slot,
      slotName: chain.slotName,
      curTier: 0,
      curItem: null,
      nextItem: ITEMS[baseId],
      recipe: rec,
      isMax: false
    };
  }

  const curId = chain.items[highestIdx];
  if (highestIdx >= chain.items.length - 1) {
    // Max tier
    return {
      slot,
      slotName: chain.slotName,
      curTier: highestIdx + 1,
      curItem: ITEMS[curId],
      nextItem: null,
      recipe: null,
      isMax: true
    };
  }

  const nextId = chain.items[highestIdx + 1];
  const rec = RECIPES.find(r => r.out === nextId);
  return {
    slot,
    slotName: chain.slotName,
    curTier: highestIdx + 1,
    curItem: ITEMS[curId],
    nextItem: ITEMS[nextId],
    recipe: rec,
    isMax: false
  };
}

// Test case 1: Brand new game
const gNew = { equipped: {}, inventory: {} };
console.log('--- Brand New Game ---');
for (const slot of Object.keys(ARMOR_CHAINS)) {
  const res = getNextArmorRecipe(slot, gNew);
  console.log(`${slot}: Offer T1 -> ${res.nextItem.name} (recipe: ${res.recipe ? res.recipe.id : 'none'})`);
}

// Test case 2: Equipped T1 helm, T4 boots
const gMid = {
  equipped: { helm: 'casco_cuero', boots: 'botas_hierro' },
  inventory: { 'escudo_bronce': 1 }
};
console.log('\n--- Mid Game ---');
for (const slot of Object.keys(ARMOR_CHAINS)) {
  const res = getNextArmorRecipe(slot, gMid);
  if (res.isMax) {
    console.log(`${slot}: MAX TIER (${res.curItem.name})`);
  } else {
    console.log(`${slot}: Current: ${res.curItem ? res.curItem.name : 'Ninguno'} -> Upgrade to: ${res.nextItem.name} (recipe: ${res.recipe.id})`);
  }
}

// Test case 3: Max Celestial armor
const gMax = { equipped: { armor: 'armadura_celestial' }, inventory: {} };
console.log('\n--- Max Celestial Armor ---');
const resMax = getNextArmorRecipe('armor', gMax);
console.log(`armor: isMax=${resMax.isMax}, current=${resMax.curItem.name}`);
