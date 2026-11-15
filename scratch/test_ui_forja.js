const fs = require('fs');

// Verify syntax of ui.js
const uiCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/ui/ui.js', 'utf-8');
const itemsCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/items.js', 'utf-8');
const toolsCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/tools.js', 'utf-8');
const recipesCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/data/recipes.js', 'utf-8');
const i18nCode = fs.readFileSync('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/core/i18n.js', 'utf-8');

console.log('1. Checking syntax of all relevant files...');
new Function(itemsCode);
new Function(toolsCode);
new Function(recipesCode);
new Function(i18nCode);
new Function(uiCode);
console.log('All files parsed successfully with valid syntax!');

// Set up mock environment
global.window = {};
eval(itemsCode);
eval(toolsCode);
eval(recipesCode);
eval(i18nCode);
global.Balaclava = window.Balaclava;

// Mock minimal DOM and Balaclava UI environment
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

// Create UI mock instance
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
  forjaTab: 'herramientas',
  game: {
    toolTiers: { pico: 'basica', hacha: 'basica' }, // pico is unlocked
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

// Extract and bind renderForjaCategories from uiCode
const match = uiCode.match(/renderForjaCategories\(body,\s*stationId\s*=\s*'forja',\s*showStationLabel\s*=\s*false\)\s*\{([\s\S]*?)\n    \}/);
if (!match) throw new Error('renderForjaCategories method not found in ui.js');

const renderForjaCategoriesFunc = new Function('body', "stationId = 'forja'", 'showStationLabel = false', 'tr', match[1]);

const tr = (k, params) => window.Balaclava.I18n.t(k, params);

console.log('\n2. Testing renderForjaCategories for each of the 5 tabs:');

const tabsToTest = ['herramientas', 'armas', 'armas_especiales', 'armadura', 'otros'];

tabsToTest.forEach(tab => {
  mockUI.forjaTab = tab;
  const body = new MockElement('div', { class: 'modal-body' });
  renderForjaCategoriesFunc.call(mockUI, body, 'forja', false, tr);

  // Check results
  const tabRow = body.children.find(c => c.attrs && c.attrs.class === 'tab-row');
  console.log(`Tab [${tab}]: Rendered tab row with ${tabRow ? tabRow.children.length : 0} buttons.`);
  
  if (tab === 'herramientas') {
    const grid = body.children.find(c => c.attrs && c.attrs.class && c.attrs.class.includes('grid-cards'));
    console.log(`  -> Herramientas grid cards count: ${grid ? grid.children.length : 0} (Expected 8 tools)`);
    if (!grid || grid.children.length !== 8) throw new Error('Expected exactly 8 tool cards in herramientas tab!');
  }

  if (tab === 'armas') {
    const grid = body.children.find(c => c.attrs && c.attrs.class && c.attrs.class.includes('grid-cards'));
    console.log(`  -> Armas grid cards count: ${grid ? grid.children.length : 0}`);
    if (!grid || grid.children.length === 0) throw new Error('Armas grid is empty!');
  }

  if (tab === 'armas_especiales') {
    const grid = body.children.find(c => c.attrs && c.attrs.class && c.attrs.class.includes('grid-cards'));
    console.log(`  -> Armas Especiales grid cards count: ${grid ? grid.children.length : 0}`);
    if (!grid || grid.children.length === 0) throw new Error('Armas Especiales grid is empty!');
  }

  if (tab === 'armadura') {
    const grid = body.children.find(c => c.attrs && c.attrs.class && c.attrs.class.includes('grid-cards'));
    console.log(`  -> Progressive Armadura grid cards count: ${grid ? grid.children.length : 0} (Expected 4 core slots)`);
    if (!grid || grid.children.length !== 4) throw new Error('Expected 4 progressive armor cards in armadura tab!');
  }

  if (tab === 'otros') {
    const grid = body.children.find(c => c.attrs && c.attrs.class && c.attrs.class.includes('grid-cards'));
    console.log(`  -> Otros grid cards count: ${grid ? grid.children.length : 0}`);
    if (!grid || grid.children.length === 0) throw new Error('Otros grid is empty!');
  }
});

console.log('\nAll 5 Forge categories tested and verified successfully!');
