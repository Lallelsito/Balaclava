const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('--- Testing Balaclava PlayerAnimator & Definitive Protagonist System ---');

// Setup mock browser environment
const window = {
  Balaclava: {},
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  }
};
global.window = window;
global.document = {
  createElement: () => ({
    getContext: () => mockCtx,
    width: 32,
    height: 32
  })
};
global.Image = class {
  constructor() {
    this.complete = true;
    this.naturalWidth = 192;
    this.naturalHeight = 144;
  }
};

// Load dependencies
function loadScript(relPath) {
  const code = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  vm.runInThisContext(code);
}

loadScript('www/src/core/utils.js');
loadScript('www/src/data/items.js');
loadScript('www/src/data/tools.js');
loadScript('www/src/core/assets.js');
loadScript('www/src/core/player_animator.js');

const Balaclava = window.Balaclava;
const Animator = Balaclava.PlayerAnimator;

if (!Animator) {
  console.error('FAIL: PlayerAnimator is undefined on Balaclava');
  process.exit(1);
}
console.log('ok - PlayerAnimator initialized on Balaclava namespace');

// 1. Verify Skins list has pawn_hero as the primary default skin
const skins = Balaclava.SKINS;
if (!skins || !skins.length || skins[0].id !== 'pawn_hero') {
  console.error('FAIL: Balaclava.SKINS[0] is not pawn_hero:', skins && skins[0]);
  process.exit(1);
}
console.log('ok - Default skin is pawn_hero (Protagonista Definitivo)');

// 2. Verify all 15 states in resolveState and getFrame
const testStates = [
  { name: 'idle', p: { moving: false, swingTimer: 0, deadTimer: 0, dashTimer: 0 } },
  { name: 'walk', p: { moving: true, swingTimer: 0, deadTimer: 0, dashTimer: 0 } },
  { name: 'run', p: { moving: true, swingTimer: 0, deadTimer: 0, dashTimer: 0 }, mods: { moveSpeed: 0.3 } },
  { name: 'dash', p: { moving: true, swingTimer: 0, deadTimer: 0, dashTimer: 0.12 } },
  { name: 'attack', p: { moving: false, swingTimer: 0.2, swingDur: 0.3, swingTool: 'espada' } },
  { name: 'mining', p: { moving: false, swingTimer: 0.2, swingDur: 0.3, swingTool: 'pico' } },
  { name: 'chopping', p: { moving: false, swingTimer: 0.2, swingDur: 0.3, swingTool: 'hacha' } },
  { name: 'digging', p: { moving: false, swingTimer: 0.2, swingDur: 0.3, swingTool: 'pala' } },
  { name: 'harvesting', p: { moving: false, swingTimer: 0.2, swingDur: 0.3, swingTool: 'guadana' } },
  { name: 'spellcasting', p: { moving: false, swingTimer: 0.2, swingDur: 0.3, swingItemId: 'baculo_celestial' } },
  { name: 'bow_shooting', p: { moving: false, swingTimer: 0.2, swingDur: 0.3, swingTool: 'arco' } },
  { name: 'bow_reload', p: { moving: false, swingTimer: 0, bowReloadTimer: 0.4, bowReloadDur: 0.8 } },
  { name: 'laser_wand', p: { moving: false, swingTimer: 0.1, swingDur: 0.15, swingItemId: 'varita_arcana' } },
  { name: 'throw_bomb', p: { moving: false, swingTimer: 0.2, swingDur: 0.35, swingTool: 'bomba', swingItemId: 'bomba_polvora' } },
  { name: 'death', p: { moving: false, deadTimer: 8.0, deadMax: 10.0 } }
];

// Add dummy item definitions for testing if not already present
Balaclava.ITEMS.baculo_celestial = { id: 'baculo_celestial', isStaffWeapon: true };
Balaclava.ITEMS.varita_arcana = { id: 'varita_arcana', isLaserWeapon: true, laserStats: { cooldown: 0.15, color: '#4dd0e1' } };
Balaclava.ITEMS.bomba_polvora = { id: 'bomba_polvora', isBomb: true, icon: 'bomba' };

for (const t of testStates) {
  const gameMock = {
    player: { animTimer: 0.5, ...t.p },
    mods: t.mods || {},
    hotbar: [],
    activeSlot: 0,
    time: 1.0
  };
  const resolved = Animator.resolveState(gameMock, gameMock.player);
  if (resolved !== t.name) {
    console.error(`FAIL: Expected state ${t.name}, got ${resolved}`);
    process.exit(1);
  }
  const frame = Animator.getFrame(resolved, gameMock, gameMock.player);
  if (frame.r < 0 || frame.r >= 6 || frame.c < 0 || frame.c >= 8) {
    console.error(`FAIL: State ${t.name} produced invalid frame coords: row ${frame.r}, col ${frame.c}`);
    process.exit(1);
  }
  const sockets = Animator.getSockets(frame.r, frame.c);
  for (const sName of ['head', 'torso', 'legs', 'feet', 'mainHand', 'offHand', 'back']) {
    const s = sockets[sName];
    if (!s || typeof s.x !== 'number' || typeof s.y !== 'number' || isNaN(s.x) || isNaN(s.y)) {
      console.error(`FAIL: Socket ${sName} invalid in state ${t.name}:`, s);
      process.exit(1);
    }
  }
}
console.log(`ok - All 15 action states and socket anchors verified (100% valid)`);

// 3. Test mock Canvas drawing for all 16 tiers
const mockCtx = {
  save: () => {},
  restore: () => {},
  translate: () => {},
  rotate: () => {},
  scale: () => {},
  beginPath: () => {},
  ellipse: () => {},
  arc: () => {},
  fill: () => {},
  stroke: () => {},
  fillRect: () => {},
  drawImage: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  createRadialGradient: () => ({ addColorStop: () => {} }),
  setLineDash: () => {},
  lineWidth: 1,
  fillStyle: '#000',
  strokeStyle: '#000',
  globalAlpha: 1
};

const tiers = [
  'basica', 'mejorada', 'cobre', 'hierro', 'plata',
  'oro', 'platino', 'acero', 'cristal', 'mitrilo',
  'titanio', 'adamantita', 'oricalco', 'legendaria', 'celestial', 'omega'
];

for (const tier of tiers) {
  const gameMock = {
    player: {
      x: 100, y: 100, facing: 1, animTimer: 1.2,
      swingTimer: 0.15, swingDur: 0.3, swingTool: 'espada', swingAngle: 0.5,
      deadTimer: 0, dashTimer: 0, moving: false
    },
    equipped: {
      armor: 'armadura_' + (tier === 'omega' ? 'celestial' : tier),
      helm: 'casco_' + (tier === 'omega' ? 'balaclava' : tier),
      shield: 'escudo_' + (tier === 'omega' ? 'cristal' : tier),
      boots: 'botas_' + (tier === 'omega' ? 'viento' : tier),
      backpack: 'mochila_cuero'
    },
    toolTiers: { espada: tier, pico: tier, hacha: tier, pala: tier, arco: tier },
    armorTiers: { helm: tier, armor: tier, shield: tier, boots: tier },
    hotbar: [],
    activeSlot: 0,
    time: 2.0
  };
  Animator.draw(gameMock, mockCtx);
}
console.log(`ok - Mock canvas draw executed without error across all 16 tiers`);

console.log('ALL ANIMATION SYSTEM UNIT TESTS PASSED!');
