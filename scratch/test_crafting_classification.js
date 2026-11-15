const fs = require('fs');

console.log('1. Checking syntax of all source files...');
const uiCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/ui/ui.js', 'utf-8');
const itemsCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/items.js', 'utf-8');
const toolsCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/tools.js', 'utf-8');
const recipesCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8');
const i18nCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/core/i18n.js', 'utf-8');

new Function(itemsCode);
new Function(toolsCode);
new Function(recipesCode);
new Function(i18nCode);
new Function(uiCode);
console.log('Syntax OK!');

global.window = {};
eval(itemsCode);
eval(toolsCode);
eval(recipesCode);
eval(i18nCode);
global.Balaclava = window.Balaclava;

const RECIPES = Balaclava.RECIPES;
const ITEMS = Balaclava.ITEMS;

console.log('\n2. Verifying Telar and Base Armors...');
const telarRecs = RECIPES.filter(r => r.station === 'telar');
console.log('Telar recipes count:', telarRecs.length);
telarRecs.forEach(r => console.log('  Telar:', r.id, '->', r.out));

const armorInTelar = telarRecs.filter(r => r.out === 'botas_cuero' || r.out === 'armadura_cuero');
if (armorInTelar.length > 0) {
  throw new Error('botas_cuero or armadura_cuero still found in telar!');
}
console.log('PASS: No armor in telar!');

const rBotas = RECIPES.find(r => r.out === 'botas_cuero');
const rArm = RECIPES.find(r => r.out === 'armadura_cuero');
const rCasco = RECIPES.find(r => r.out === 'casco_cuero');
const rEscudo = RECIPES.find(r => r.out === 'escudo_madera');

console.log('Base armors stations:');
console.log('  casco_cuero station:', rCasco ? rCasco.station : 'MISSING');
console.log('  armadura_cuero station:', rArm ? rArm.station : 'MISSING');
console.log('  escudo_madera station:', rEscudo ? rEscudo.station : 'MISSING');
console.log('  botas_cuero station:', rBotas ? rBotas.station : 'MISSING');

if (rBotas.station !== 'mano' || rArm.station !== 'mano' || rCasco.station !== 'mano' || rEscudo.station !== 'mano') {
  throw new Error('All 4 base armor pieces must have station === "mano"!');
}
console.log('PASS: All 4 base armor pieces are in station "mano"!');

console.log('\n3. Verifying duplicates between tables...');
const engraneForja = RECIPES.find(r => r.id === 'r_engrane_forja');
const engraneTaller = RECIPES.find(r => r.id === 'r_engrane_taller');
console.log('  r_engrane_forja:', engraneForja ? 'EXISTS' : 'REMOVED');
console.log('  r_engrane_taller:', engraneTaller ? 'EXISTS (in taller)' : 'MISSING');
if (engraneForja) throw new Error('r_engrane_forja should be removed from forja!');

const lingoteCelestialForge = RECIPES.find(r => r.id === 'r_lingote_celestial_forge');
const lingoteCelestialFund = RECIPES.find(r => r.id === 'r_celestial');
console.log('  r_lingote_celestial_forge:', lingoteCelestialForge ? 'EXISTS' : 'REMOVED');
console.log('  r_celestial (fundicion):', lingoteCelestialFund ? 'EXISTS' : 'MISSING');
if (lingoteCelestialForge) throw new Error('r_lingote_celestial_forge should be removed from forja!');

console.log('PASS: Duplicates cleaned up successfully!');

console.log('\n4. Testing Mock UI for Mesa de Artesanía & Forja...');

function MockElement(tag, attrs = {}, children = []) {
  this.tag = tag;
  this.attrs = attrs || {};
  this.children = [];
  this.textContent = '';
  this.style = attrs.style || '';

  const add = (c) => {
    if (c === null || c === undefined) return;
    if (typeof c === 'string' || typeof c === 'number') {
      const t = new MockElement('text');
      t.textContent = String(c);
      this.children.push(t);
    } else if (Array.isArray(c)) {
      c.forEach(add);
    } else {
      this.children.push(c);
    }
  };
  (Array.isArray(children) ? children : [children]).forEach(add);
}
MockElement.prototype.appendChild = function(child) {
  if (child) this.children.push(child);
  return child;
};
MockElement.prototype.insertBefore = function(child, ref) {
  const idx = this.children.indexOf(ref);
  if (idx >= 0) this.children.splice(idx, 0, child);
  else this.children.push(child);
  return child;
};

const mockUI = {
  el(tag, attrs, children) {
    return new MockElement(tag, attrs, children);
  },
  toolIcon(id, tier, size) {
    return new MockElement('span', { class: `tool-icon-${id}` });
  },
  itemIcon(icon, size) {
    return new MockElement('span', { class: `item-icon-${icon}` });
  },
  uiIcon(icon, size) {
    return new MockElement('span', { class: `ui-icon-${icon}` });
  },
  _buildSearchBar(initial, placeholder, onFilter) {
    return new MockElement('div', { class: 'mock-search' });
  },
  _sortRecipes(recs) {
    return recs;
  },
  _describeItemExtras(item) {
    return 'Defensa: +5';
  },
  _checkCraftIngredient(id, q) {
    const invQty = this.game.inventory[id] || 0;
    const isEquip = this.game.equipped && Object.values(this.game.equipped).includes(id);
    return {
      have: invQty + (isEquip ? 1 : 0),
      ok: (invQty + (isEquip ? 1 : 0)) >= q,
      viaEquipped: isEquip && invQty < q
    };
  },
  _buildRecipeCard(rec, showStationLabel) {
    return new MockElement('div', { class: 'recipe-card' }, [rec.out || rec.id]);
  },
  renderModal() {},
  game: {
    toolTiers: { pico: 'basica', hacha: 'basica' },
    inventory: { lingote_hierro: 10, lingote_bronce: 5, cuero: 4 },
    coins: 500,
    equipped: { helm: 'casco_cuero', armor: null, shield: null, boots: 'botas_cuero' },
    hotbar: [{ kind: 'tool', id: 'pico' }],
    activeSlot: 0,
    hasStationAvailable: (s) => true,
    craftRecipe: () => {},
    craftTool: () => {},
    upgradeTool: () => {},
    swapHotbarSlots: () => {},
    quickTransferToHotbar: () => {}
  }
};

const tr = (k, params) => window.Balaclava.I18n.t(k, params);

// Extract renderArtesaniaCategories
const matchArtesania = uiCode.match(/renderArtesaniaCategories\(body,\s*showStationLabel\s*=\s*false\)\s*\{([\s\S]*?)\n    \}/);
if (!matchArtesania) throw new Error('renderArtesaniaCategories method not found in ui.js');
const renderArtesaniaCategoriesFunc = new Function('body', 'showStationLabel = false', 'tr', matchArtesania[1]);

// Extract renderForjaCategories
const matchForja = uiCode.match(/renderForjaCategories\(body,\s*stationId\s*=\s*'forja',\s*showStationLabel\s*=\s*false\)\s*\{([\s\S]*?)\n    \}/);
if (!matchForja) throw new Error('renderForjaCategories method not found in ui.js');
const renderForjaCategoriesFunc = new Function('body', "stationId = 'forja'", 'showStationLabel = false', 'tr', matchForja[1]);

console.log('\n--- Testing Mesa de Artesania Tabs ---');
['herramientas', 'armadura', 'economia', 'otros'].forEach(t => {
  mockUI.artesaniaTab = t;
  const body = new MockElement('div');
  renderArtesaniaCategoriesFunc.call(mockUI, body, false, tr);
  const grid = body.children.find(c => c.attrs && c.attrs.class && c.attrs.class.includes('grid-cards'));
  console.log(`  Artesania [${t}]: cards = ${grid ? grid.children.length : 0}`);
  if (!grid || grid.children.length === 0) throw new Error(`Empty grid for artesania tab: ${t}`);
});

console.log('\n--- Testing Forja Tabs ---');
['armas', 'armas_especiales', 'armadura', 'otros'].forEach(t => {
  mockUI.forjaTab = t;
  const body = new MockElement('div');
  renderForjaCategoriesFunc.call(mockUI, body, 'forja', false, tr);
  const tabRow = body.children.find(c => c.attrs && c.attrs.class === 'tab-row');
  const hasHerramientasBtn = tabRow.children.some(b => b.children.some(txt => txt.textContent.toLowerCase().includes('herramienta')));
  if (hasHerramientasBtn) throw new Error('Herramientas button should NOT exist in Forja!');
  const grid = body.children.find(c => c.attrs && c.attrs.class && c.attrs.class.includes('grid-cards'));
  console.log(`  Forja [${t}]: cards = ${grid ? grid.children.length : 0}`);
  if (!grid || grid.children.length === 0) throw new Error(`Empty grid for forja tab: ${t}`);
});

console.log('\nAll tests passed with 100% success!');
