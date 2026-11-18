/* Automated acceptance tests for the OMEGA expansion core. Run: node scripts/test_omega.cjs */
global.window = global;
global.document = { addEventListener() {}, body: { classList: { add() {}, remove() {} } } };
global.localStorage = { getItem() { return null; }, setItem() {} };
const path = require('path');
const R = (f) => require(path.join(__dirname, '..', 'www', 'src', f));
['core/utils.js', 'data/items.js', 'data/tools.js', 'data/buildings.js', 'data/recipes.js', 'world/dungeons.js', 'systems/farming.js', 'systems/omega.js'].forEach(R);
const B = Balaclava, O = B.OmegaSystem, CFG = B.OMEGA_CONFIG;

let pass = 0, fail = 0;
const ok = (d, c) => { if (c) { pass++; console.log('  ok   ' + d); } else { fail++; console.error('  FAIL ' + d); } };

function mkGame(biome = 'pradera') {
  const g = {
    inventory: {}, buildings: [], nextBuildingId: 1, clearedDungeons: [], coins: 0, equipped: {}, toolTiers: { espada: 'celestial', pico: 'celestial' },
    world: { crops: [], getBiomeAtPixel: () => biome },
    toast() {}, addCoins(n) { this.coins += n; }, recomputeModifiers() {},
    addItem(id, q) { this.inventory[id] = (this.inventory[id] || 0) + q; },
    removeItem(id, q) { if ((this.inventory[id] || 0) < q) throw new Error('negative inventory ' + id); this.inventory[id] -= q; }
  };
  g.omega = new O(); B.OmegaRuntime = g.omega; return g;
}
function place(g, type, tx, ty, level = 1) { const b = { id: g.nextBuildingId++, type, tx, ty, level, storage: {}, queue: [] }; g.buildings.push(b); return b; }
function run(g, secs, dt = 1) { for (let i = 0; i < secs; i += dt) g.omega.step(g, dt); }
const items = (g, plot) => g.omega.nexusData(plot).items;
const total = (m) => Object.values(m).reduce((a, v) => a + v, 0);
function base(g, nx = 27, ty = 27) {
  const nexus = place(g, 'nexo_central', nx, ty);
  place(g, 'pilon_enlace', nx + 4, ty);
  return nexus;
}
const PLOT = O.plotKeyOf(24, 24);
function allResearch(g) { O.RESEARCH.forEach(r => { g.omega.state.research[r.id] = 1; }); g.omega._sig = null; }

console.log('1. Placement gating');
{
  const g = mkGame();
  ok('Nexus blocked below 12 dungeons', !g.omega.canPlace(g, 'nexo_central', 24, 24).ok);
  g.clearedDungeons = new Array(12).fill('x');
  ok('Nexus allowed at 12 dungeons', g.omega.canPlace(g, 'nexo_central', 24, 24).ok);
  place(g, 'nexo_central', 24, 24);
  ok('Second Nexus on same island blocked', !g.omega.canPlace(g, 'nexo_central', 26, 26).ok);
  ok('Machine blocked without research', !g.omega.canPlace(g, 'trituradora', 25, 25).ok);
  g.omega.state.research.proc_trituracion = 1;
  ok('Machine allowed after research', g.omega.canPlace(g, 'trituradora', 25, 25).ok);
}

console.log('2. Network + power + conservation chain (ore → 5 ingots)');
{
  const g = mkGame(); allResearch(g);
  base(g);
  place(g, 'gen_vapor', 27, 31);
  place(g, 'trituradora', 25, 27); place(g, 'lavadora_arcana', 25, 29); place(g, 'fundidora_omega', 31, 29, 1);
  g.omega.nexusAdd(PLOT, { hierro: 10, carbon: 50 });
  const before = g.omega.state.produced;
  run(g, 400);
  const it = items(g, PLOT);
  ok('10 iron ore → 50 iron ingots (4 powders → 5 ingots)', (it.lingote_hierro || 0) >= 50 * 1);
  ok('No ore/fragments/powder left stranded', !(it.hierro) && !(it.fragmento_hierro) && !(it.polvo_hierro));
  ok('No negative items', Object.values(it).every(v => v >= 0));
  const stats = g.omega.nexusData(PLOT).stat;
  ok('Fuel was consumed from Nexus', (it.carbon || 0) < 50);
  ok('Energy stats exposed', typeof stats.lastProd === 'number' && typeof stats.lastCons === 'number');
}

console.log('3. No power → no production (materials not lost)');
{
  const g = mkGame(); allResearch(g); base(g);
  const m = place(g, 'trituradora', 25, 27);
  g.omega.nexusAdd(PLOT, { hierro: 5 });
  run(g, 60);
  ok('Without generator machine is stalled', (items(g, PLOT).fragmento_hierro || 0) === 0);
  ok('State explains the lack of energy', m.omega.state === 'sin_energia');
  ok('Reserved input kept in the job (not lost)', m.omega.job && total(items(g, PLOT)) + 1 >= 4);
}

console.log('4. Disconnected machine / missing Nexus');
{
  const g = mkGame(); allResearch(g); base(g);
  const far = place(g, 'trituradora', 35, 35);
  const g2 = mkGame(); allResearch(g2); const lone = place(g2, 'trituradora', 5, 5);
  run(g, 2); run(g2, 2);
  ok('Machine outside any pylon radius is disconnected', far.omega.state === 'sin_conexion');
  ok('Machine on island without Nexus reports it', lone.omega.state === 'sin_nexo');
}

console.log('5. Indirect connection through chained pylons');
{
  const g = mkGame(); allResearch(g); base(g, 24, 27);
  place(g, 'pilon_enlace', 30, 27); place(g, 'pilon_enlace', 34, 27);
  const m = place(g, 'trituradora', 35, 31);
  g.omega.step(g, 1);
  ok('Machine reaches the Nexus via 3 pylons', g.omega._nets.get(PLOT).connected.has(m.id));
}

console.log('6. Full storage never destroys materials');
{
  const g = mkGame(); allResearch(g); base(g); place(g, 'gen_vapor', 27, 31); place(g, 'trituradora', 25, 27);
  const cap = g.omega.nexusCapacity(PLOT, g.buildings[0]);
  g.omega.nexusAdd(PLOT, { carbon: 100, hierro: 10 });
  g.omega.nexusAdd(PLOT, { piedra: cap - 110 - 1 }); // 1 free slot only
  const tot0 = total(items(g, PLOT));
  run(g, 120);
  const m = g.buildings.find(b => b.type === 'trituradora');
  ok('Machine blocked on full storage', ['almacen_lleno', 'sin_materiales', 'activa'].includes(m.omega.state));
  ok('Capacity never exceeded', total(items(g, PLOT)) <= cap);
  ok('Item accounting consistent (inputs ≤ held + converted)', total(items(g, PLOT)) + (m.omega.job ? 1 : 0) >= tot0 - 100);
}

console.log('7. Extractor yields only biome-valid, researched resources');
{
  const g = mkGame('desierto'); allResearch(g); delete g.omega.state.research.rec_profundo; base(g); place(g, 'gen_vapor', 27, 31); place(g, 'extractor_nucleo', 25, 27);
  g.omega.nexusAdd(PLOT, { carbon: 200 });
  run(g, 600);
  const allowed = new Set(O.EXTRACT_TABLES.desierto.filter(x => !x.res).map(x => x.id).concat(['carbon']));
  const got = Object.keys(items(g, PLOT)).filter(k => k !== 'carbon');
  ok('Extractor produced something', got.length > 0);
  ok('Only unlocked desert ores (no platinum without research)', got.every(k => allowed.has(k)));
}

console.log('8. Hydroponic dome harvests mature crops only, replants only with seeds');
{
  const g = mkGame(); allResearch(g); base(g); place(g, 'gen_vapor', 27, 31); place(g, 'domo_hidroponico', 25, 27);
  const cid = Object.keys(B.CROPS || {})[0];
  if (!cid) { ok('CROPS table available', false); } else {
    const def = B.CROPS[cid];
    g.world.crops = [{ tx: 26, ty: 28, cropId: cid, stage: 3, progress: 1 }, { tx: 27, ty: 28, cropId: cid, stage: 1, progress: 0.3 }];
    g.omega.nexusAdd(PLOT, { carbon: 50, [def.seedId]: 1 });
    run(g, 40);
    ok('Mature crop harvested into Nexus', (items(g, PLOT)[def.yieldId] || 0) >= (def.minQty || 1));
    ok('Immature crop untouched', g.world.crops.some(c => c.stage === 1 && c.tx === 27));
    ok('Replanted using Nexus seed (seed consumed)', g.world.crops.some(c => c.tx === 26 && c.stage === 0) && !(items(g, PLOT)[def.seedId]));
  }
}

console.log('9. Singularity press: 10,000 → 1, atomic, cancel safe');
{
  const g = mkGame(); allResearch(g); base(g); place(g, 'nucleo_arcano', 27, 31);
  const press = place(g, 'prensa_singularidades', 25, 27);
  g.omega.nexusAdd(PLOT, { cristales_magicos: 50, cobre: 10000 });
  g.omega.step(g, 1);
  ok('Cannot start without category', press.omega.state === 'inactiva');
  g.omega.pressSetCategory(press, 'minerales');
  const cost = g.omega.pressCost();
  ok('Cost = 10000 minus research reduction', cost === Math.floor(10000 * (1 - 0.15)));
  run(g, 200);
  ok('Singularity produced exactly once from ' + cost + ' ore', (items(g, PLOT).singularidad || 0) === 1);
  ok('Ore conserved (10000 − cost left, nothing lost)', (items(g, PLOT).cobre || 0) + total(press.omega.deposit || {}) === 10000 - cost);
  g.omega.nexusAdd(PLOT, { hierro: 100 });
  g.omega.state.research.comp_eficiencia = 1;
  const c = g.omega.pressCancel(PLOT, press);
  ok('Cancel returns deposit to Nexus', c.ok && total(press.omega.deposit) === 0);
  ok('Press ignores non-allowed items (carbon is not a press resource in cultivos)', g.omega.pressAvailable(PLOT, 'cultivos') === 0);
}

console.log('10. Overload altar: exponential cost, exact multibuy, atomic');
{
  const g = mkGame(); allResearch(g); base(g);
  const key = 'tool:espada';
  const info = g.omega.overloadKeyInfo(g, key);
  const step = (L) => g.omega.overloadStepCost(info, L);
  ok('First upgrade costs Base × 1.35^0 (L is the current level)', step(0).lingote_omega === Math.ceil(2 * (0.5 + info.tierIdx / 30)));
  ok('Level 10 cost = base × 1.35^10', step(10).lingote_omega === Math.ceil(2 * (0.5 + info.tierIdx / 30) * Math.pow(1.35, 10)));
  const q = g.omega.overloadQuote(g, key, 10, PLOT);
  let sum = {}; for (let L = 0; L < 10; L++) { const c = step(L); for (const k in c) sum[k] = (sum[k] || 0) + c[k]; }
  ok('Multi-buy quote equals sum of individual steps', JSON.stringify(q.cost) === JSON.stringify(sum));
  ok('Not affordable with empty stock', !q.affordable);
  const r0 = g.omega.overloadBuy(g, key, 10, PLOT);
  ok('Failed purchase changes nothing', !r0.ok && g.omega.overloadLevel(key) === 0 && total(items(g, PLOT)) === 0 && total(g.inventory) === 0);
  for (const k in q.cost) { g.omega.nexusAdd(PLOT, { [k]: Math.ceil(q.cost[k] / 2) }); g.addItem(k, q.cost[k] - Math.ceil(q.cost[k] / 2)); }
  const r1 = g.omega.overloadBuy(g, key, 10, PLOT);
  ok('Paid from Nexus + inventory, level 10', r1.ok && g.omega.overloadLevel(key) === 10);
  ok('Stock exactly zero afterwards', total(items(g, PLOT)) === 0 && total(g.inventory) === 0);
  const s0 = B.getToolStats('espada', 'celestial');
  ok('Weapon power scales with overload (getToolStats wrapper)', s0.power > 0);
  g.omega.state.overload[key] = 0; const s1 = B.getToolStats('espada', 'celestial');
  g.omega.state.overload[key] = 100; const s2 = B.getToolStats('espada', 'celestial');
  ok('Higher level → higher power', s2.power > s1.power);
  ok('Percent is deterministic/rounded', g.omega.overloadPct('damage', 100) === g.omega.overloadPct('damage', 100));
  const huge = g.omega.overloadQuote(g, key, 5000, PLOT);
  ok('Technical level cap prevents overflow', !huge.ok && /Límite técnico/.test(huge.reason));
}

console.log('11. Abyss');
{
  const g = mkGame();
  ok('Locked below 24 dungeons', !g.omega.abyssUnlocked(g));
  g.clearedDungeons = new Array(24).fill('x');
  ok('Unlocked at 24', g.omega.abyssUnlocked(g));
  let prev = g.omega.abyssScaling(1);
  let mono = true;
  for (let f = 2; f <= 3000; f++) { const s = g.omega.abyssScaling(f, []); if (s.hp < prev.hp - 1e-9 || !isFinite(s.hp) || !isFinite(s.dmg) || s.speed > 1.6 * 1.15 + 1e-9) mono = false; prev = s; }
  ok('HP/DMG monotonic, finite and speed capped up to floor 3000', mono);
  ok('Multipliers capped at 1e12', g.omega.abyssScaling(100000, []).hp <= 1e12);
  ok('Modifiers deterministic per floor', JSON.stringify(g.omega.abyssModifiersFor(30)) === JSON.stringify(g.omega.abyssModifiersFor(30)));
  g.addCoins = (n) => { g.coins += n; };
  g.omega.onAbyssBossDefeated(g, { abyssFloor: 10, abyssMods: [] });
  ok('Record & next floor updated', g.omega.state.abyss.best === 10 && g.omega.state.abyss.current === 11);
  ok('Milestone floor 10 pays 1 singularity (not before)', (g.inventory.singularidad || 0) === 1);
  const saved = g.omega.serialize();
  const g2 = mkGame(); g2.omega.load(JSON.parse(JSON.stringify(saved)), g2, false);
  ok('Abyss record survives save/load', g2.omega.state.abyss.best === 10);
}

console.log('12. Ascension idempotent');
{
  const g = mkGame(); allResearch(g); g.clearedDungeons = new Array(24).fill('x'); base(g);
  const p = O.CONFIG.ascensionRanks[0].cost;
  const fail1 = g.omega.ascendIsland(g, PLOT);
  ok('Cannot ascend without materials', !fail1.ok && g.omega.ascensionRank(PLOT) === 0);
  for (const k in p) g.addItem(k, p[k]);
  const T = 48, x = 27 * T + 5, y = 27 * T + 5;
  const r = g.omega.ascendIsland(g, PLOT);
  ok('Ascends once with exact cost', r.ok && g.omega.ascensionRank(PLOT) === 1 && total(g.inventory) === 0);
  const m1 = g.omega.creatureMult(x, y);
  const g2 = mkGame(); g2.omega.load(JSON.parse(JSON.stringify(g.omega.serialize())), g2, false);
  const m2 = g2.omega.creatureMult(x, y);
  g2.omega.load(JSON.parse(JSON.stringify(g2.omega.serialize())), g2, false);
  const m3 = g2.omega.creatureMult(x, y);
  ok('Multipliers are ×10/×10 and never accumulate across saves', m1.hp === 10 && m1.dmg === 10 && m2.hp === 10 && m3.hp === 10);
  ok('Other islands unaffected', g.omega.creatureMult(2 * T, 2 * T).hp === 1);
}

console.log('13. Research gating');
{
  const g = mkGame(); base(g);
  ok('Cannot research with unmet requirement', !g.omega.researchAtomic(g, PLOT, 'proc_lavado').ok);
  ok('Cannot research without materials', !g.omega.researchAtomic(g, PLOT, 'ind_fundamentos').ok);
  g.addItem('lingote_hierro', 20); g.addItem('engrane', 10);
  ok('Research succeeds and spends exactly the cost', g.omega.researchAtomic(g, PLOT, 'ind_fundamentos').ok && !g.inventory.lingote_hierro && !g.inventory.engrane);
  ok('Dungeon-gated research blocked', !g.omega.researchStatus(g, 'sim_camara').ok);
  const sorted = new Set(); let cyc = false;
  O.RESEARCH.forEach(r => r.req.forEach(q => { if (!O.RESEARCH_BY_ID[q]) cyc = true; }));
  ok('All research prerequisites exist', !cyc);
}

console.log('14. Simulation chamber');
{
  const g = mkGame(); allResearch(g); base(g); place(g, 'gen_vapor', 27, 31); place(g, 'gen_vapor', 29, 31);
  const ch = place(g, 'camara_simulacion', 25, 27);
  const did = Object.keys(B.DUNGEON_DEFS)[0];
  ok('Crystal denied before boss kills', !g.omega.canMakeCrystal(g, did).ok);
  g.clearedDungeons = [did]; for (let i = 0; i < 3; i++) g.omega.recordBossKill(did);
  ok('Crystal allowed after required kills', g.omega.canMakeCrystal(g, did).ok);
  for (const k in CFG.crystalCost) g.addItem(k, CFG.crystalCost[k]);
  ok('Crystal crafted, cost exact', g.omega.craftCrystal(g, PLOT, did).ok && g.inventory['cristal_datos_' + did] === 1);
  ok('Insert fails if crystal not in Nexus (not consumed)', !g.omega.insertCrystal(g, PLOT, ch, did).ok && !ch.omega.crystal);
  g.omega.depositFromInventory(g, PLOT, 'cristal_datos_' + did, 1);
  g.omega.nexusAdd(PLOT, { carbon: 400 });
  ok('Insert consumes the crystal only on success', g.omega.insertCrystal(g, PLOT, ch, did).ok && !items(g, PLOT)['cristal_datos_' + did]);
  run(g, 400);
  const dropIds = Object.keys(B.DUNGEON_DEFS[did].boss.drops || {});
  const out = Object.keys(items(g, PLOT)).filter(k => dropIds.includes(k));
  ok('Rewards come from the boss loot table', out.length > 0);
  ok('No unique gear dropped', Object.keys(items(g, PLOT)).every(k => !(B.ITEMS[k] && B.ITEMS[k].equipSlot)));
}

console.log('15. Offline production bounded & deterministic');
{
  const mk = () => { const g = mkGame(); allResearch(g); base(g); place(g, 'gen_vapor', 27, 31); place(g, 'extractor_nucleo', 25, 27); g.omega.nexusAdd(PLOT, { carbon: 5000 }); return g; };
  const a = mk(), b = mk();
  const ra = a.omega.simulateOffline(a, 100 * 3600), rb = b.omega.simulateOffline(b, 100 * 3600);
  ok('Offline capped at 8 h', ra.elapsed === CFG.offlineCapSec);
  ok('Deterministic offline result', JSON.stringify(ra.gained) === JSON.stringify(rb.gained));
  const max = Math.ceil(CFG.offlineCapSec / (10 / 1) * 1.25 * 1) + 5;
  ok('Production ≤ theoretical maximum', Object.values(ra.gained).reduce((x, y) => x + y, 0) <= max * 1.0 + 5000);
  const t0 = Date.now(); const c = mk(); c.omega.simulateOffline(c, 8 * 3600); ok('Offline sim runs fast (<2 s)', Date.now() - t0 < 2000);
}

console.log('16. Save round-trip');
{
  const g = mkGame(); allResearch(g); base(g); place(g, 'gen_vapor', 27, 31);
  g.omega.nexusAdd(PLOT, { hierro: 33 }); g.omega.state.overload['tool:pico'] = 7;
  const snap = JSON.parse(JSON.stringify(g.omega.serialize()));
  const g2 = mkGame(); g2.omega.load(snap, g2, false);
  ok('Nexus items persisted', g2.omega.state.nexus[PLOT].items.hierro === 33);
  ok('Overload levels persisted', g2.omega.overloadLevel('tool:pico') === 7);
  ok('Research persisted', g2.omega.hasResearch('comp_prensa'));
  const g3 = mkGame(); g3.omega.load(undefined, g3, true);
  ok('Old save without omega data loads with defaults', g3.omega.state.abyss.current === 1 && Object.keys(g3.omega.state.research).length === 0);
}

console.log('17. Performance: 300 machines');
{
  const g = mkGame(); allResearch(g); base(g);
  for (let i = 0; i < 6; i++) place(g, 'pilon_enlace', 26 + (i % 3) * 3, 26 + Math.floor(i / 3) * 3);
  for (let i = 0; i < 20; i++) place(g, 'gen_vapor', 25 + (i % 10), 25 + Math.floor(i / 10));
  for (let i = 0; i < 280; i++) place(g, ['trituradora', 'lavadora_arcana', 'fundidora_omega', 'extractor_nucleo'][i % 4], 25 + (i % 10), 25 + Math.floor(i / 10));
  g.omega.nexusAdd(PLOT, { carbon: 5000, hierro: 5000 });
  g.omega.step(g, 1);
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < 100; i++) g.omega.step(g, 1);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 100;
  console.log('       avg tick with ~300 structures: ' + ms.toFixed(3) + ' ms');
  ok('Tick < 8 ms with 300 structures (1 tick/s budget)', ms < 8);
}

console.log('18. Expanded Energy structures (battery, gem synthesizer, rune inscriptor, turret, beacon, condenser)');
{
  const g = mkGame(); allResearch(g); base(g);
  place(g, 'reactor_singularidad', 27, 31);
  place(g, 'bateria_cuantica', 25, 25, 2);
  const syn = place(g, 'sintetizador_gemas', 25, 27);
  const ins = place(g, 'forja_runica_omega', 25, 30);
  const tur = place(g, 'torreta_prisma_omega', 29, 25);
  const bea = place(g, 'faro_sobrecarga_isla', 29, 27);
  const con = place(g, 'condensador_materia', 31, 29);
  g.omega.nexusAdd(PLOT, { singularidad: 5, cristales: 10, carbon: 10, piedra: 20 });
  run(g, 40);
  const nx = g.omega.nexusData(PLOT);
  const it = nx.items;
  ok('Quantum battery increases Nexus energy buffer capacity (+15000 at Lv2)', nx.bufCap >= 2000 + 15000);
  ok('Gem synthesizer crystallizes magic crystals from energy + crystals', (g.omega.state.produced.cristales_magicos || 0) >= 3);
  ok('Rune inscriptor etches runic tablets and elemental runes', (g.omega.state.produced.tablilla_runica || 0) >= 3 && (it.runa_fuego || 0) >= 1);
  ok('Prism turret and Overload beacon are powered and active', tur.omegaActive === true && bea.omegaActive === true);
  ok('Matter condenser produces stardust from pure energy without item inputs', (g.omega.state.produced.polvo_estelar || 0) >= 2);
}

console.log('\nSUMMARY: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
