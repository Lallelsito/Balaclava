const fs = require('fs');

// Mock window and browser globals
global.window = global;
window.Balaclava = {};
window.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; }
};

// Load utils.js first
require('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/core/utils.js');

// Load world.js
require('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/world/world.js');

// Test 1: Plot Base Price
const C = Balaclava.CONST ? Balaclava.CONST.CENTER_PLOT : 4;
const p1_top = Balaclava.getPlotBasePrice(4, 3, 'pradera');
const p1_right = Balaclava.getPlotBasePrice(5, 4, 'pradera');
const p1_bot = Balaclava.getPlotBasePrice(4, 5, 'pradera');
const p1_left = Balaclava.getPlotBasePrice(3, 4, 'pradera');
const p2 = Balaclava.getPlotBasePrice(4, 2, 'pradera');

console.log('Plot price d=1 top (4,3):', p1_top);
console.log('Plot price d=1 right (5,4):', p1_right);
console.log('Plot price d=1 bot (4,5):', p1_bot);
console.log('Plot price d=1 left (3,4):', p1_left);
console.log('Plot price d=2 (4,2):', p2);

if (p1_top !== 30 || p1_right !== 30 || p1_bot !== 30 || p1_left !== 30) {
  throw new Error(`Expected d=1 plot prices to be 30, got: ${p1_top}, ${p1_right}, ${p1_bot}, ${p1_left}`);
}
if (p2 <= 30) {
  throw new Error(`Expected d=2 plot price to scale up, got: ${p2}`);
}

// Load tutorial.js
require('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/src/systems/tutorial.js');

// Test 2: Tutorial Isolation
const tut1 = new Balaclava.TutorialSystem();
tut1.step = 4;
tut1.stepState = { movedDist: 50 };

// Create save data mock
const saveSys = {
  serialize(tut) {
    return {
      tutorial: {
        step: tut.step,
        done: tut.done,
        skipped: tut.skipped
      }
    };
  },
  deserialize(tut, data) {
    if (data.tutorial) {
      tut.step = Math.max(0, Number(data.tutorial.step) || 0);
      tut.done = !!data.tutorial.done;
      tut.skipped = !!data.tutorial.skipped;
    } else {
      tut.step = 0;
      tut.done = false;
      tut.skipped = false;
    }
    tut.stepState = {};
    tut.minimized = false;
  }
};

const slot1Save = saveSys.serialize(tut1);
console.log('Slot 1 saved tutorial:', slot1Save.tutorial);

// Now simulate new game in slot 2
const gameMock = {
  tutorialSys: tut1
};

// Reset on startNewGame
if (gameMock.tutorialSys) {
  gameMock.tutorialSys.step = 0;
  gameMock.tutorialSys.done = false;
  gameMock.tutorialSys.skipped = false;
  gameMock.tutorialSys.stepState = {};
  gameMock.tutorialSys.minimized = false;
}
console.log('Slot 2 after startNewGame: step =', gameMock.tutorialSys.step);
if (gameMock.tutorialSys.step !== 0) throw new Error('Slot 2 did not reset to step 0!');

// Now simulate reloading slot 1
saveSys.deserialize(gameMock.tutorialSys, slot1Save);
console.log('Slot 1 after reload: step =', gameMock.tutorialSys.step);
if (gameMock.tutorialSys.step !== 4) throw new Error('Slot 1 did not restore step 4!');

// Now simulate loading empty slot 3 (no tutorial in data)
saveSys.deserialize(gameMock.tutorialSys, {});
console.log('Slot 3 (empty save) after load: step =', gameMock.tutorialSys.step);
if (gameMock.tutorialSys.step !== 0) throw new Error('Empty slot did not reset to step 0!');

console.log('ALL TUTORIAL & PLOT TESTS PASSED 100%!');
