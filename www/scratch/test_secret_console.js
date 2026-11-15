const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = 'C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www';
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const i18nCode = fs.readFileSync(path.join(ROOT, 'src/core/i18n.js'), 'utf8');
const i18nEnCode = fs.readFileSync(path.join(ROOT, 'src/core/i18n_data_en.js'), 'utf8');

// 1. Stealth audit: zero visible HTML / localization exposure before unlock
for (const marker of ['bal-cmd-shell', 'bal-cmd-input', '/godmode', 'GODMODE', 'CONSOLA', 'F9']) {
  assert(!html.includes(marker), 'index.html must not contain console markup or hints: ' + marker);
  assert(!i18nCode.includes(marker), 'i18n.js must not leak console strings: ' + marker);
  assert(!i18nEnCode.includes(marker), 'i18n_data_en.js must not leak console strings: ' + marker);
}
console.log('1. Stealth audit passed (zero static HTML/i18n hints)');

// 2. Build realistic DOM + Canvas environment and load real Balaclava modules
function makeEl(tag, id) {
  const classes = new Set();
  if (id === 'death-overlay') classes.add('hidden');
  const el = {
    tagName: String(tag || 'DIV').toUpperCase(),
    id: id || '',
    type: '',
    value: '',
    textContent: '',
    innerHTML: '',
    src: '',
    disabled: false,
    focused: false,
    scrollTop: 0,
    scrollHeight: 200,
    style: {},
    dataset: {},
    attrs: {},
    children: [],
    listeners: {},
    parentNode: null,
    appendChild(ch) {
      if (ch) {
        ch.parentNode = el;
        el.children.push(ch);
      }
      return ch;
    },
    removeChild(ch) {
      const idx = el.children.indexOf(ch);
      if (idx >= 0) el.children.splice(idx, 1);
    },
    contains(ch) {
      if (!ch) return false;
      if (ch === el) return true;
      return el.children.some(c => c === ch || (typeof c.contains === 'function' && c.contains(ch)));
    },
    focus() { el.focused = true; },
    blur() { el.focused = false; },
    closest(sel) {
      if (sel.startsWith('#')) {
        let cur = el;
        while (cur) {
          if (cur.id === sel.slice(1)) return cur;
          cur = cur.parentNode;
        }
      }
      return null;
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getAttribute(k) { return el.attrs[k] ?? null; },
    setAttribute(k, v) {
      el.attrs[k] = String(v);
      if (k === 'id') el.id = String(v);
      if (k === 'class') {
        classes.clear();
        String(v).split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
      }
    },
    get className() { return Array.from(classes).join(' '); },
    set className(v) {
      classes.clear();
      String(v || '').split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
    },
    addEventListener(ev, fn) {
      if (!el.listeners[ev]) el.listeners[ev] = [];
      el.listeners[ev].push(fn);
    },
    dispatch(ev, extra = {}) {
      const evt = {
        type: ev,
        target: el,
        defaultPrevented: false,
        propagationStopped: false,
        preventDefault() { evt.defaultPrevented = true; },
        stopPropagation() { evt.propagationStopped = true; },
        ...extra
      };
      (el.listeners[ev] || []).forEach(fn => fn(evt));
      return evt;
    },
    classList: {
      add: (...c) => c.forEach(x => classes.add(x)),
      remove: (...c) => c.forEach(x => classes.delete(x)),
      toggle: (c, force) => (force === undefined ? (classes.has(c) ? classes.delete(c) : classes.add(c)) : (force ? classes.add(c) : classes.delete(c))),
      contains: (c) => classes.has(c)
    }
  };
  return el;
}

const noopCtx = new Proxy({ imageSmoothingEnabled: false }, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return () => {};
  },
  set(target, prop, val) {
    target[prop] = val;
    return true;
  }
});

// Register static elements from index.html
const els = {};
const registerEl = (id, tag = 'div') => (els[id] = makeEl(tag, id));
for (const m of html.matchAll(/<([a-zA-Z0-9-]+)[^>]*\bid="([^"]+)"/g)) {
  registerEl(m[2], m[1]);
}
if (!els['lvl-text']) registerEl('lvl-text', 'span');
if (!els['game-canvas']) registerEl('game-canvas', 'canvas');

els['game-canvas'].width = 1280;
els['game-canvas'].height = 720;
els['game-canvas'].getBoundingClientRect = () => ({ left: 0, top: 0, width: 1280, height: 720 });
els['game-canvas'].getContext = () => noopCtx;

const windowListeners = {};
const docListeners = {};
const localStore = new Map([['balaclava_lang', 'es']]);
const bodyEl = makeEl('body', 'doc-body');

const sandbox = {
  window: {
    BALACLAVA_ROOT_BASE: '',
    innerWidth: 1280,
    innerHeight: 720,
    localStorage: {
      getItem: (k) => (localStore.has(k) ? localStore.get(k) : null),
      setItem: (k, v) => localStore.set(k, String(v)),
      removeItem: (k) => localStore.delete(k)
    },
    addEventListener(ev, fn, useCap) {
      if (!windowListeners[ev]) windowListeners[ev] = [];
      windowListeners[ev].push({ fn, useCap: !!useCap });
    },
    removeEventListener() {}
  },
  document: {
    body: bodyEl,
    documentElement: makeEl('html', 'doc-html'),
    getElementById: (id) => {
      if (els[id]) return els[id];
      const found = bodyEl.children.find(c => c.id === id);
      return found || null;
    },
    createElement: (tag) => {
      const el = makeEl(tag);
      if (String(tag).toLowerCase() === 'canvas') {
        el.width = 64;
        el.height = 64;
        el.getContext = () => noopCtx;
      }
      Object.defineProperty(el, 'id', {
        get() { return el._id || ''; },
        set(v) {
          el._id = v;
          if (v) els[v] = el;
        },
        configurable: true
      });
      return el;
    },
    createTextNode: (t) => ({ nodeType: 3, textContent: String(t) }),
    addEventListener(ev, fn) {
      if (!docListeners[ev]) docListeners[ev] = [];
      docListeners[ev].push(fn);
    },
    querySelectorAll: () => [],
    contains: (node) => node === bodyEl || bodyEl.children.includes(node) || Object.values(els).includes(node)
  },
  navigator: { language: 'es-ES' },
  Image: function () { this.complete = true; this.src = ''; },
  performance: { now: () => 5000 },
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
  setTimeout: () => 1,
  clearTimeout: () => {},
  console, Math, Number, String, Array, Object, Boolean, Set, Map, JSON
};
sandbox.window.window = sandbox.window;
sandbox.localStorage = sandbox.window.localStorage;
sandbox.globalThis = sandbox;

const scripts = [
  'src/core/utils.js',
  'src/core/i18n_data_en.js',
  'src/core/i18n.js',
  'src/core/audio.js',
  'src/data/items.js',
  'src/data/tools.js',
  'src/data/buildings.js',
  'src/data/recipes.js',
  'src/data/enchants.js',
  'src/data/skills.js',
  'src/data/quests.js',
  'src/world/hex_grid.js',
  'src/world/world.js',
  'src/world/dungeons.js',
  'src/systems/farming.js',
  'src/systems/automation.js',
  'src/systems/combat.js',
  'src/systems/economy.js',
  'src/systems/events.js',
  'src/systems/tutorial.js',
  'src/systems/save.js',
  'src/engine/game.js',
  'src/ui/ui.js'
];
for (const rel of scripts) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sandbox);
}

const Balaclava = sandbox.window.Balaclava;
Balaclava.Assets = Balaclava.Assets || {
  get: () => null,
  getBuildingImg: () => null,
  createItemIconEl: () => makeEl('span'),
  createToolIconEl: () => makeEl('span'),
  createSkillIconEl: () => makeEl('span'),
  createNpcPortraitEl: () => makeEl('span'),
  extraImages: {},
  dungeonImages: {},
  chestImages: {},
  enemyImages: {}
};
Balaclava.UI_URLS = Balaclava.UI_URLS || new Proxy({}, { get: () => '' });
Balaclava.ITEM_PNG_MAP = Balaclava.ITEM_PNG_MAP || {};
Balaclava.TOOL_PNG_MAP = Balaclava.TOOL_PNG_MAP || {};
Balaclava.SKILL_ICON_URLS = Balaclava.SKILL_ICON_URLS || {};
Balaclava.BUFF_ICON_URLS = Balaclava.BUFF_ICON_URLS || {};
Balaclava.I18n.init();

const UI = Balaclava.UI;
const game = new Balaclava.GameEngine(els['game-canvas']);
sandbox.window.Balaclava.game = game;
UI.game = game;
UI.bindGlobalInputs();
game.startNewGame(1);

// Before trigger: DOM shell must not even exist yet
assert.strictEqual(els['bal-cmd-shell'], undefined, 'Secret console DOM must not exist prior to secret trigger');

// Dispatching 6 clicks on #lvl-text must NOT open it
for (let i = 0; i < 6; i++) {
  els['lvl-text'].dispatch('click');
}
assert.strictEqual(UI._cmdOpen, false, '6 clicks on #lvl-text must not open secret console');
assert.strictEqual(els['bal-cmd-shell'], undefined, 'DOM must still stay absent after 6 clicks');

// Plain F9 without Shift must NOT open it
const dispatchKey = (code, opts = {}) => {
  const evt = {
    code,
    shiftKey: !!opts.shiftKey,
    altKey: !!opts.altKey,
    ctrlKey: !!opts.ctrlKey,
    target: opts.target || sandbox.document.body,
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault() { evt.defaultPrevented = true; },
    stopPropagation() { evt.propagationStopped = true; }
  };
  (windowListeners.keydown || []).forEach(h => h.fn(evt));
  return evt;
};
dispatchKey('F9');
assert.strictEqual(UI._cmdOpen, false, 'Plain F9 without Shift must not open console');

// 7th click on #lvl-text within 2.5s opens secret console!
els['lvl-text'].dispatch('click');
assert.strictEqual(UI._cmdOpen, true, '7 rapid clicks on #lvl-text must unlock & open secret console');
assert(els['bal-cmd-shell'] && !els['bal-cmd-shell'].classList.contains('hidden'), 'Console shell must now be visible');

// While focused in #bal-cmd-input, typing KeyW or KeyI must NOT mutate game.keys or open inventory modal
const typingEvt = dispatchKey('KeyI', { target: els['bal-cmd-input'] });
assert(!UI.hasOpenModal(), 'Typing in secret console must not open game modals');
assert(!game.keys.KeyI, 'Typing in secret console must not leak into game.keys');

// Escape closes only the secret console (must not open pause modal!)
dispatchKey('Escape', { target: els['bal-cmd-input'] });
assert.strictEqual(UI._cmdOpen, false, 'Escape must close secret console');
assert(els['bal-cmd-shell'].classList.contains('hidden'), 'Console shell must hide on Escape');
assert(!UI.hasOpenModal(), 'Closing secret console with Escape must not trigger pause modal');

// Shift + F9 toggles secret console open
dispatchKey('F9', { shiftKey: true });
assert.strictEqual(UI._cmdOpen, true, 'Shift+F9 must open secret console');
console.log('2. Secret unlock triggers (7x click + Shift+F9 + input isolation) passed');

// 3. Test Minecraft-style commands against real engine
const exec = (cmd) => {
  const res = UI.executeSecretCommand(cmd);
  assert(res && res.ok, `Command "${cmd}" failed: ${res && res.message}`);
  return res;
};

// /give exact, localized ES multi-word match, kit & all
const woodBefore = game.inventory.madera || 0;
exec('/give madera 125');
assert.strictEqual(game.inventory.madera, woodBefore + 125, '/give exact item ID');

exec('/give Lingote de Hierro 15');
assert.strictEqual(game.inventory.lingote_hierro, 15, '/give localized multi-word item name');

exec('/give hierro 10');
assert.strictEqual(game.inventory.hierro, 10, '/give exact item ID hierro');

const ambig = UI.executeSecretCommand('/give lingote');
assert.strictEqual(ambig.ok, false, 'Ambiguous partial /give query must report suggestions rather than guessing');

exec('/give kit');
assert(game.inventory.lingote_celestial >= 40 && game.coins >= 5000, '/give kit');

exec('/give all 3');
assert(game.inventory.diamantes >= 3 && Object.keys(Balaclava.ITEMS).every(id => (game.inventory[id] || 0) >= 3), '/give all');

// /tool & /armor
exec('/tool pico celestial');
assert.strictEqual(game.toolTiers.pico, 'celestial', '/tool pico celestial');
exec('/tool all oro');
for (const tid of Object.keys(Balaclava.TOOLS)) {
  assert.strictEqual(game.toolTiers[tid], 'oro', '/tool all oro failed for ' + tid);
}
exec('/armor all celestial');
assert.strictEqual(game.equipped.armor, 'armadura_celestial', '/armor all celestial equips top armor');
assert.strictEqual(game.equipped.helm, 'casco_solar', '/armor all celestial equips top helm');
assert.strictEqual(game.equipped.shield, 'escudo_celestial', '/armor all celestial equips top shield');
assert.strictEqual(game.equipped.boots, 'botas_celestiales', '/armor all celestial equips top boots');

// /money, /xp, /level, /sp
exec('/money set 2000');
assert.strictEqual(game.coins, 2000, '/money set');
exec('/money give 750');
assert.strictEqual(game.coins, 2750, '/money give exact amount');
exec('/money take 250');
assert.strictEqual(game.coins, 2500, '/money take');

exec('/level set 10');
assert.strictEqual(game.player.level, 10, '/level set');
assert(game.player.skillPoints >= 9, '/level set grants constellation SP');
exec('/sp add 5');
const spNow = game.player.skillPoints;
exec('/sp set 42');
assert.strictEqual(game.player.skillPoints, 42, '/sp set');
exec('/xp give 1200');
assert(game.player.level > 10 || game.player.xp > 0, '/xp give applies');

// /stat
const baseMaxHp = game.player.maxHp;
const baseDmg = game.mods.dmgBonus || 0;
exec('/stat add maxHp 200');
assert.strictEqual(game.player.maxHp, baseMaxHp + 200, '/stat add maxHp');
exec('/stat add dmgBonus 50%');
assert(Math.abs((game.mods.dmgBonus || 0) - (baseDmg + 0.50)) < 1e-6, '/stat add dmgBonus percentage');
exec('/stat reset maxHp');
assert.strictEqual(game.player.maxHp, baseMaxHp, '/stat reset single stat');

// /godmode + immunity + revive + energy preservation + save round-trip
game.player.deadTimer = 6.0;
game.player.hp = 0;
exec('/godmode on');
assert.strictEqual(game.player.godMode, true, '/godmode on enables godMode');
assert.strictEqual(game.player.deadTimer, 0, '/godmode on clears deadTimer');
assert.strictEqual(game.player.hp, game.player.maxHp, '/godmode on restores full HP');

game.damagePlayer(99999);
assert.strictEqual(game.player.hp, game.player.maxHp, 'damagePlayer must deal 0 damage in godMode');
assert.strictEqual(game.player.deadTimer, 0, 'player stays alive after fatal hit in godMode');

// Energy consumption skipped in godMode
game.player.energy = game.player.maxEnergy;
game.useActiveSlot(game.player.x + 20, game.player.y);
assert.strictEqual(game.player.energy, game.player.maxEnergy, 'godMode preserves infinite energy');

// /godmode off re-enables taking damage
exec('/godmode off');
assert.strictEqual(game.player.godMode, false, '/godmode off');
const prevRand = Math.random;
Math.random = () => 0.99;
try {
  game.damagePlayer(200);
} finally {
  Math.random = prevRand;
}
assert(game.player.hp < game.player.maxHp, 'player takes damage normally once godMode is off');

// /heal revives and restores max HP/energy
game.player.deadTimer = 4.5;
game.player.hp = 0;
game.player.energy = 5;
exec('/heal');
assert.strictEqual(game.player.deadTimer, 0, '/heal clears deadTimer');
assert.strictEqual(game.player.hp, game.player.maxHp, '/heal restores full HP');
assert.strictEqual(game.player.energy, game.player.maxEnergy, '/heal restores full energy');

// /unlock & /time & /tp
exec('/unlock all');
assert.strictEqual(game.unlockedSkills.length, Object.keys(Balaclava.SKILLS).length, '/unlock skills unlocks all');
assert.strictEqual(game.unlockedSpells.length, Object.keys(Balaclava.SPELLS).length, '/unlock spells unlocks all');
assert.strictEqual(game.unlockedPlots.length, Balaclava.CONST.GRID_PLOTS * Balaclava.CONST.GRID_PLOTS, '/unlock plots unlocks full map');

exec('/time night');
assert.strictEqual(game.isNightTime(), true, '/time night switches to night');
exec('/time day');
assert.strictEqual(game.isDayTime(), true, '/time day switches to day');

exec('/tp 20 30');
assert(Math.abs(game.player.x - 20.5 * Balaclava.CONST.TILE_SIZE) < 1e-6, '/tp x y');

// Save round-trip preserves godMode & bonusStats
exec('/godmode on');
const saved = game.saveSys.serialize(game);
assert.strictEqual(saved.player.godMode, true, 'Save serializes godMode');
assert(saved.player.bonusStats && Math.abs(saved.player.bonusStats.dmgBonus - 0.5) < 1e-6, 'Save serializes bonusStats');

console.log('3. All Minecraft-style console commands & save persistence verified (ALL PASS)');
