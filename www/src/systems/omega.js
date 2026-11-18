/**
 * OMEGA — El Legado de la Singularidad (endgame expansion core).
 *
 * Single data-driven module. Everything balance-related lives in OMEGA_CONFIG so it can be tuned
 * without touching logic. The logic is pure w.r.t. rendering: the industrial simulation advances in
 * logical ticks (1/s) independent of FPS, resources move through virtual per-island Nexus storage
 * (no world entities), and every spend/transfer is validated first and applied atomically.
 */
(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const ITEMS = Balaclava.ITEMS || {};
  const BUILDINGS = Balaclava.BUILDINGS || {};
  const SAFE_MAX = 9e15; // below Number.MAX_SAFE_INTEGER

  // ───────────────────────────── CONFIG ─────────────────────────────
  const CFG = {
    saveVersion: 2,
    tickSec: 1,
    maxStepsPerFrame: 4,
    offlineCapSec: 8 * 3600,
    nexusUnlockDungeons: 12,
    abyssUnlockDungeons: 24,
    ascensionUnlockDungeons: 24,
    nexusBaseCap: 20000,          // total item units per level-1 Nexus
    nexusLevelMult: [1, 2.5, 6],
    nexusRadius: 7,
    nexusEnergyBuffer: [2000, 8000, 30000],
    pylonRadius: [6, 9, 13],
    pylonCapacity: [60, 180, 540], // max energy/s routed through a pylon
    crystalKillsRequired: 3,
    crystalCost: { cristales_magicos: 5, polvo_estelar: 3, lingote_titanio: 2 },
    simCycleSec: 90,
    simCyclesPerCrystal: 20,
    simRareChance: 0.15,
    simQtyFactor: 0.4,
    pressCostBase: 10000,
    pressRatePerSec: 100,
    pressHistoryMax: 20,
    overloadGrowth: 1.35,
    overloadPctExp: 0.85,
    overloadK: { damage: 1.8, speed: 0.35, tool: 2.0, defense: 1.5, hp: 1.5 },
    overloadSpeedCapPct: 150,
    overloadBase: [
      { id: 'lingote_omega', base: 2 },
      { id: 'materia_comprimida', base: 1 },
      { id: 'singularidad', base: 0.2 }
    ],
    // multiplicative abyss curves (capped)
    abyss: { hpGrowth: 1.14, dmgGrowth: 1.09, speedPerFloor: 0.01, speedCap: 1.6, multCap: 1e12, bossEvery: 1 },
    // absolute multipliers per ascension rank (idempotent: never accumulated at runtime)
    ascensionRanks: [
      { hp: 10, dmg: 10, extract: 2, cost: { singularidad: 3, materia_comprimida: 5, lingote_omega: 10 } },
      { hp: 30, dmg: 25, extract: 3, cost: { singularidad: 8, materia_comprimida: 15, lingote_omega: 30 } },
      { hp: 90, dmg: 60, extract: 4, cost: { singularidad: 20, materia_comprimida: 40, lingote_omega: 80 } },
      { hp: 270, dmg: 150, extract: 5, cost: { singularidad: 50, materia_comprimida: 100, lingote_omega: 200 } }
    ],
    ascendedMateriaChance: 0.04,
    statCaps: {
      machineSpeed: 1.0, energyEff: 0.5, nexusCap: 4, pylonRange: 8, genOutput: 1.0, recipeYield: 0.4,
      domoRadius: 6, extractSpeed: 1.5, simOutput: 1.0, pressEff: 0.5, compressedBonus: 1.0, abyssLoot: 1.0
    }
  };

  // ───────────────────────── ore families ─────────────────────────
  // yield = ingots per ONE raw ore after crush → wash → smelt (configurable per family).
  const ORE_FAMILIES = {
    cobre:      { raw: 'cobre',      ingot: 'lingote_cobre',      yield: 5 },
    hierro:     { raw: 'hierro',     ingot: 'lingote_hierro',     yield: 5 },
    oro:        { raw: 'oro',        ingot: 'lingote_oro',        yield: 5 },
    plata:      { raw: 'plata',      ingot: 'lingote_plata',      yield: 5 },
    platino:    { raw: 'platino',    ingot: 'lingote_platino',    yield: 5 },
    titanio:    { raw: 'titanio',    ingot: 'lingote_titanio',    yield: 4 },
    adamantita: { raw: 'adamantita', ingot: 'lingote_adamantita', yield: 3 },
    oricalco:   { raw: 'oricalco',   ingot: 'lingote_oricalco',   yield: 3 }
  };

  // ───────────────────────── item registration ─────────────────────────
  function regItem(id, o) {
    if (ITEMS[id]) return;
    ITEMS[id] = Object.assign({ id, category: 'materiales', rarity: 'epico', sellValue: 10, buyValue: 0, source: 'Industria Omega', uses: 'Industria Omega', desc: '', icon: 'tablet_stone' }, o, { id });
  }
  const iconOf = (id, fb) => (ITEMS[id] && ITEMS[id].icon) || fb || 'tablet_stone';

  Object.entries(ORE_FAMILIES).forEach(([fam, f]) => {
    const rawName = (ITEMS[f.raw] && ITEMS[f.raw].name) || fam;
    regItem('fragmento_' + fam, { name: `Fragmentos de ${rawName}`, rarity: 'poco_comun', sellValue: 3, icon: iconOf(f.raw), desc: 'Mineral triturado en la Trituradora.', source: 'Trituradora', uses: 'Se purifica en la Lavadora Arcana' });
    regItem('polvo_' + fam, { name: `Polvo Puro de ${rawName}`, rarity: 'raro', sellValue: 6, icon: iconOf(f.raw), desc: 'Polvo purificado listo para fundir.', source: 'Lavadora Arcana', uses: 'Se funde en la Fundidora Omega' });
  });
  regItem('singularidad', { name: 'Singularidad', rarity: 'legendario', sellValue: 2500, icon: 'singularidad', category: 'especiales', desc: 'Materia colapsada: 10.000 recursos comprimidos en un punto.', source: 'Prensa de Singularidades', uses: 'Equipamiento Omega, reactores, sobrecarga, ascensión' });
  regItem('lingote_omega', { name: 'Lingote Omega', rarity: 'legendario', sellValue: 900, icon: 'lingote_omega', desc: 'Aleación definitiva forjada con singularidad y los cinco biomas.', source: 'Fundidora Omega', uses: 'Equipamiento Tier 16, sobrecarga infinita' });
  regItem('materia_comprimida', { name: 'Materia Comprimida', rarity: 'legendario', sellValue: 600, icon: 'materia_comprimida', category: 'especiales', desc: 'Residuo exótico de islas ascendidas, Condensadores de Materia y del Abismo Infinito.', source: 'Abismo Infinito / Islas ascendidas / Condensador de Materia', uses: 'Sobrecarga, ascensión, mejoras definitivas' });

  const DUNGEON_DEFS = Balaclava.DUNGEON_DEFS || {};
  Object.values(DUNGEON_DEFS).forEach(d => {
    if (!d || !d.boss) return;
    regItem('cristal_datos_' + d.id, { name: `Cristal de Datos: ${d.boss.name}`, rarity: 'epico', category: 'especiales', sellValue: 400, icon: 'cristal_datos', desc: `Registro de combate de ${d.boss.name}. Se inserta en la Cámara de Simulación.`, source: 'Cámara de Simulación (tras derrotar al jefe)', uses: 'Cámara de Simulación de Jefes' });
  });

  // ───────────────────────── machine recipes ─────────────────────────
  // Every roll (bonus chance) is data here; the code only reads this table.
  const MACHINE_RECIPES = { trituradora: [], lavadora: [], fundidora: [], sintetizador: [], inscriptor: [] };
  Object.entries(ORE_FAMILIES).forEach(([fam, f]) => {
    MACHINE_RECIPES.trituradora.push({ id: 'crush_' + fam, name: `Triturar ${fam}`, in: { [f.raw]: 1 }, out: { ['fragmento_' + fam]: 2 }, bonus: [{ id: 'polvo_estelar', qty: 1, chance: 0.05 }], time: 2, power: 8 });
    MACHINE_RECIPES.lavadora.push({ id: 'wash_' + fam, name: `Purificar ${fam}`, in: { ['fragmento_' + fam]: 1 }, out: { ['polvo_' + fam]: 2 }, bonus: [], time: 2, power: 12 });
    MACHINE_RECIPES.fundidora.push({ id: 'smelt_' + fam, name: `Fundir ${fam}`, in: { ['polvo_' + fam]: 4 }, out: { [f.ingot]: f.yield }, bonus: [], time: 6, power: 30, yieldFamily: fam });
  });
  MACHINE_RECIPES.fundidora.push({
    id: 'forge_omega', name: 'Forjar Lingote Omega',
    in: { singularidad: 1, lingote_celestial: 5, esencia_magma: 10, esquirla_hielo: 10, esencia_oscura: 10, arena_estelar: 10, malaquita_pradera: 10 },
    out: { lingote_omega: 1 }, bonus: [], time: 60, power: 120, reqResearch: 'omega_equipo'
  });

  // Sintetizador de Gemas & Cristales (consume alta energía para cristalizar gemas y polvos arcanos)
  MACHINE_RECIPES.sintetizador.push(
    { id: 'syn_cristal_mag', name: 'Sintetizar Cristales Mágicos', in: { cristales: 2, carbon: 1 }, out: { cristales_magicos: 3 }, bonus: [{ id: 'polvo_estelar', qty: 1, chance: 0.20 }], time: 4, power: 55 },
    { id: 'syn_polvo_estelar', name: 'Condensar Polvo Estelar', in: { cristales_magicos: 2, arena_estelar: 2 }, out: { polvo_estelar: 2 }, bonus: [{ id: 'diamantes', qty: 1, chance: 0.12 }], time: 5, power: 65 },
    { id: 'syn_esmeralda', name: 'Cristalizar Esmeraldas', in: { malaquita_pradera: 2, cristales: 2 }, out: { esmeraldas: 2 }, bonus: [], time: 5, power: 60 },
    { id: 'syn_topacio', name: 'Cristalizar Topacios y Jade', in: { ambar_desierto: 2, cristales: 2 }, out: { topacio: 2, jade: 1 }, bonus: [], time: 5, power: 60 },
    { id: 'syn_zafiro', name: 'Cristalizar Zafiros Glaciales', in: { azurita_glacial: 2, esquirla_hielo: 2 }, out: { zafiro: 2 }, bonus: [], time: 5, power: 65 },
    { id: 'syn_amatista', name: 'Cristalizar Amatistas y Ónice', in: { esencia_oscura: 2, cristales_magicos: 2 }, out: { amatista: 2, onice: 1 }, bonus: [], time: 6, power: 70 },
    { id: 'syn_rubi', name: 'Cristalizar Rubíes Ígneos', in: { esencia_magma: 2, material_volcanico: 2 }, out: { rubi: 2 }, bonus: [], time: 6, power: 75 },
    { id: 'syn_diamante', name: 'Comprimir Carbón en Diamantes', in: { carbon: 12, cristales_magicos: 2 }, out: { diamantes: 2 }, bonus: [{ id: 'cristal_abismal', qty: 1, chance: 0.25 }], time: 7, power: 90 },
    { id: 'syn_prisma', name: 'Sintetizar Prisma Imperial', in: { diamantes: 1, rubi: 1, esmeraldas: 1, zafiro: 1, amatista: 1 }, out: { prisma_imperial: 2 }, bonus: [{ id: 'gema_alma', qty: 1, chance: 0.35 }], time: 8, power: 120 }
  );

  // Inscriptor Rúnico & Celestial Omega (automatiza runas, gemas del alma y lingotes celestiales con energía)
  MACHINE_RECIPES.inscriptor.push(
    { id: 'ins_tablilla', name: 'Grabar Tablillas Rúnicas', in: { piedra: 4, cristales: 1 }, out: { tablilla_runica: 3, tinta_arcana: 2 }, bonus: [], time: 3, power: 65 },
    { id: 'ins_runas_elem', name: 'Inscribir Runas Elementales', in: { tablilla_runica: 2, cristales_magicos: 2 }, out: { runa_fuego: 1, runa_agua: 1, runa_tierra: 1, runa_aire: 1 }, bonus: [], time: 6, power: 80 },
    { id: 'ins_runas_sup', name: 'Inscribir Runas de Luz y Vida', in: { tablilla_runica: 2, polvo_estelar: 2, diamantes: 1 }, out: { runa_luz: 2, runa_vida: 2, runa_oscura: 1 }, bonus: [], time: 7, power: 95 },
    { id: 'ins_gema_alma', name: 'Forjar Gema del Alma', in: { diamantes: 1, amatista: 1, polvo_estelar: 1 }, out: { gema_alma: 2 }, bonus: [{ id: 'runa_muerte', qty: 1, chance: 0.30 }], time: 7, power: 100 },
    { id: 'ins_obsidiana', name: 'Refinar Obsidiana y Cristal Abismal', in: { material_volcanico: 3, esencia_oscura: 2 }, out: { obsidiana_refinada: 2, cristal_abismal: 1 }, bonus: [], time: 6, power: 85 },
    { id: 'ins_celestial', name: 'Electro-Fundir Lingote Celestial', in: { lingote_adamantita: 1, polvo_estelar: 1, cristales_magicos: 2 }, out: { lingote_celestial: 2 }, bonus: [{ id: 'nucleo_solar', qty: 1, chance: 0.20 }], time: 8, power: 130 }
  );

  // ───────────────────────── extractor tables (real ids per biome) ─────────────────────────
  const EXTRACT_TABLES = {
    pradera:            [{ id: 'cobre', w: 40 }, { id: 'hierro', w: 30 }, { id: 'carbon', w: 20 }, { id: 'oro', w: 10 }],
    desierto:           [{ id: 'cobre', w: 30 }, { id: 'hierro', w: 30 }, { id: 'oro', w: 25 }, { id: 'platino', w: 10, res: 'rec_profundo' }],
    montanas_heladas:   [{ id: 'hierro', w: 35 }, { id: 'plata', w: 30 }, { id: 'platino', w: 15, res: 'rec_profundo' }, { id: 'titanio', w: 10, res: 'rec_profundo' }],
    bosque_oscuro:      [{ id: 'hierro', w: 30 }, { id: 'plata', w: 25 }, { id: 'oro', w: 20 }, { id: 'titanio', w: 15, res: 'rec_profundo' }, { id: 'adamantita', w: 5, res: 'rec_nucleo' }],
    tierras_volcanicas: [{ id: 'oro', w: 25 }, { id: 'platino', w: 20, res: 'rec_profundo' }, { id: 'titanio', w: 20, res: 'rec_profundo' }, { id: 'adamantita', w: 12, res: 'rec_nucleo' }, { id: 'oricalco', w: 8, res: 'rec_nucleo' }]
  };

  // ───────────────────────── press categories (explicit allow-lists) ─────────────────────────
  const PRESS_CATEGORIES = {
    minerales: ['cobre', 'hierro', 'oro', 'plata', 'platino', 'titanio', 'adamantita', 'oricalco', 'carbon', 'estano'],
    cultivos: ['trigo', 'flor_cristal', 'bellota', 'hongo_luminoso'],
    criaturas: ['seda_arana', 'colmillo', 'cuerno_demonio', 'escamas_dragon', 'esporas_toxicas', 'garra_sombras', 'pluma_oscura', 'ectoplasma', 'gel_azul', 'saco_veneno', 'diente_goblin']
  };

  // ───────────────────────── generators ─────────────────────────
  const GENERATORS = {
    gen_vapor:            { out: 20,   fuels: [{ id: 'carbon', t: 40 }, { id: 'madera', t: 12 }], biome: null },
    gen_geotermico:       { out: 90,   fuels: [{ id: 'esencia_magma', t: 90 }, { id: 'material_volcanico', t: 45 }], biome: { tierras_volcanicas: 1.25 } },
    nucleo_arcano:        { out: 320,  fuels: [{ id: 'cristales_magicos', t: 120 }, { id: 'polvo_estelar', t: 240 }], biome: null },
    reactor_singularidad: { out: 4000, fuels: [{ id: 'singularidad', t: 900 }], biome: null }
  };
  const GEN_LEVEL_MULT = [1, 1.6, 2.4];

  // ───────────────────────── buildings ─────────────────────────
  let _omegaSort = 100;
  function defBuilding(id, name, size, sprite, cost, desc, omega, reqOmega) {
    if (BUILDINGS[id]) return;
    BUILDINGS[id] = {
      id, name, category: 'automatizacion', size, placeOn: 'land', cost, desc, sprite,
      badge: 'gear', omega, reqOmega: reqOmega || null, omegaStructure: true,
      opensPanel: 'omega_' + omega.kind, sortOrder: _omegaSort++
    };
  }
  defBuilding('nexo_central', 'Nexo Central', 2, 'bld_omega_nexo', { lingote_celestial: 10, cristales_magicos: 20, lingote_titanio: 20, engrane: 10 }, 'Corazón industrial de la isla: almacén virtual unificado, red de energía y centro de investigación Omega.', { kind: 'nexus' });
  defBuilding('pilon_enlace', 'Pilón de Enlace', 1, 'bld_omega_pilon', { lingote_hierro: 6, cristales: 4, engrane: 2 }, 'Extiende la red del Nexo: conecta máquinas y otros pilones dentro de su radio.', { kind: 'pylon' }, 'ind_fundamentos');
  defBuilding('bateria_cuantica', 'Acumulador Cuántico', 1, 'bld_omega_bateria', { lingote_acero: 8, cristales_magicos: 6, engrane: 4 }, 'Almacena +5.000 / +15.000 / +40.000 de energía adicional en el Nexo de la isla para absorber picos de consumo.', { kind: 'battery', capBonus: [5000, 15000, 40000] }, 'ind_fundamentos');
  defBuilding('gen_vapor', 'Generador de Vapor', 1, 'bld_omega_gen_vapor', { lingote_hierro: 12, engrane: 4, piedra: 20 }, 'Quema carbón o madera para producir energía constante.', { kind: 'generator' }, 'ind_fundamentos');
  defBuilding('gen_geotermico', 'Reactor Geotérmico de Lava', 2, 'bld_omega_gen_geo', { lingote_acero: 14, obsidiana_refinada: 8, engrane: 8 }, 'Convierte esencia de magma en gran potencia. +25% en Tierras Volcánicas.', { kind: 'generator' }, 'gen_geo');
  defBuilding('nucleo_arcano', 'Núcleo Arcano', 2, 'bld_omega_nucleo', { lingote_titanio: 12, cristales_magicos: 20, polvo_estelar: 10, engrane: 10 }, 'Consume cristales y esencia para producir enormes cantidades de energía.', { kind: 'generator' }, 'gen_arcano');
  defBuilding('reactor_singularidad', 'Reactor de Singularidad', 2, 'bld_omega_reactor', { lingote_omega: 4, singularidad: 2, lingote_adamantita: 20 }, 'Generador definitivo alimentado por Singularidades.', { kind: 'generator' }, 'gen_singularidad');
  defBuilding('trituradora', 'Trituradora', 1, 'bld_omega_trituradora', { lingote_hierro: 10, engrane: 6, piedra: 20 }, 'Tritura mineral crudo en fragmentos (1 → 2).', { kind: 'machine', mtype: 'trituradora', power: 8 }, 'proc_trituracion');
  defBuilding('lavadora_arcana', 'Lavadora Arcana', 1, 'bld_omega_lavadora', { lingote_acero: 8, cristales: 10, engrane: 6 }, 'Purifica fragmentos en polvos puros (1 → 2).', { kind: 'machine', mtype: 'lavadora', power: 12 }, 'proc_lavado');
  defBuilding('fundidora_omega', 'Fundidora Omega', 2, 'bld_omega_fundidora', { lingote_titanio: 10, lingote_acero: 12, cristales_magicos: 6, engrane: 8 }, 'Funde polvos puros en lingotes avanzados y forja el Lingote Omega.', { kind: 'machine', mtype: 'fundidora', power: 30 }, 'proc_fundicion');
  defBuilding('sintetizador_gemas', 'Sintetizador de Gemas', 2, 'bld_omega_sintetizador', { lingote_titanio: 10, cristales_magicos: 12, vidrio: 12, engrane: 8 }, 'Cristaliza gemas preciosas, diamantes, polvo estelar y prismas imperiales usando alta energía.', { kind: 'machine', mtype: 'sintetizador', power: 65 }, 'proc_sintesis');
  defBuilding('forja_runica_omega', 'Inscriptor Rúnico Omega', 1, 'bld_omega_inscriptor', { lingote_adamantita: 8, cristales_magicos: 10, polvo_estelar: 6, engrane: 8 }, 'Graba runas elementales, gemas del alma y electro-funde Lingotes Celestiales usando energía de la red.', { kind: 'machine', mtype: 'inscriptor', power: 80 }, 'proc_inscripcion');
  defBuilding('extractor_nucleo', 'Extractor de Núcleo', 2, 'bld_omega_extractor', { lingote_acero: 14, engrane: 10, diamantes: 4 }, 'Taladro industrial pasivo: extrae minerales del bioma directamente al Nexo.', { kind: 'extractor', power: 40 }, 'rec_extractor');
  defBuilding('domo_hidroponico', 'Domo Hidropónico', 2, 'bld_omega_domo', { lingote_hierro: 10, cristales: 20, engrane: 6, madera: 30 }, 'Cosecha cultivos maduros de su radio, los envía al Nexo y replanta con semillas del Nexo.', { kind: 'domo', power: 30 }, 'rec_domo');
  defBuilding('torreta_prisma_omega', 'Torreta de Prisma Omega', 1, 'bld_omega_torreta', { lingote_titanio: 8, cristales_magicos: 8, zafiro: 4, engrane: 6 }, 'Torreta defensiva de alta potencia que consume 25 energía/s de la red para aniquilar enemigos con rayos prismáticos.', { kind: 'turret', power: 25 }, 'def_prisma');
  if (BUILDINGS.torreta_prisma_omega) {
    Object.assign(BUILDINGS.torreta_prisma_omega, { turretRange: 380, turretDmg: 145, turretRate: 0.9, isLightningTurret: true, lightRadius: 210 });
  }
  defBuilding('faro_sobrecarga_isla', 'Baliza de Sobrecarga', 2, 'bld_omega_baliza', { lingote_adamantita: 10, lingote_titanio: 10, cristales_magicos: 14, engrane: 10 }, 'Consume 120 energía/s para acelerar +40% todas las máquinas y otorgarte +20% Daño, +15% Velocidad y +25% Poder de Recolección.', { kind: 'beacon', power: 120 }, 'red_baliza');
  if (BUILDINGS.faro_sobrecarga_isla) {
    Object.assign(BUILDINGS.faro_sobrecarga_isla, { machineSpeedBonus: 0.40, lightRadius: 260 });
  }
  defBuilding('camara_simulacion', 'Cámara de Simulación de Jefes', 2, 'bld_omega_camara', { lingote_titanio: 12, cristales_magicos: 15, lingote_acero: 10, engrane: 12 }, 'Reproduce combates ya superados para obtener materiales pasivamente.', { kind: 'chamber', power: 150 }, 'sim_camara');
  defBuilding('prensa_singularidades', 'Prensa de Singularidades', 2, 'bld_omega_prensa', { lingote_adamantita: 10, lingote_titanio: 12, engrane: 16, cristales_magicos: 10 }, 'Comprime 10.000 recursos válidos en 1 Singularidad.', { kind: 'press', power: 200 }, 'comp_prensa');
  defBuilding('condensador_materia', 'Condensador de Materia Pura', 2, 'bld_omega_condensador', { lingote_adamantita: 14, lingote_celestial: 6, cristales_magicos: 16, engrane: 14 }, 'Convierte energía pura (500 energía/s, sin consumir materiales) directamente en Polvo Estelar, Cristales Mágicos y Materia Comprimida.', { kind: 'condenser', power: 500, cycleSec: 20 }, 'comp_condensador');
  defBuilding('altar_sobrecarga', 'Altar de Sobrecarga Infinita', 2, 'bld_omega_altar', { lingote_omega: 2, singularidad: 1, lingote_celestial: 10 }, 'Mejora sin límite armas, herramientas, armaduras y reliquias con coste exponencial.', { kind: 'altar' }, 'sobre_altar');

  // ───────────────────────── research (Ingeniería Omega) ─────────────────────────
  const CATS = {
    fundamentos: 'Fundamentos industriales', logistica: 'Redes logísticas', generacion: 'Generación energética', procesamiento: 'Procesamiento de minerales',
    recoleccion: 'Recolección automatizada', simulacion: 'Simulación de jefes', compresion: 'Compresión de recursos', equipo: 'Equipamiento Omega',
    sobrecarga: 'Sobrecarga infinita', ascension: 'Ascensión de islas', abismo: 'Investigación del Abismo', singularidad: 'Tecnologías de singularidad'
  };
  const R = (id, cat, name, desc, cost, req, extra) => Object.assign({ id, cat, name, desc, cost, req: req || [] }, extra || {});
  const RESEARCH = [
    R('ind_fundamentos', 'fundamentos', 'Fundamentos Industriales', 'Desbloquea Pilones de Enlace y Generador de Vapor.', { lingote_hierro: 20, engrane: 10 }),
    R('proc_eficiencia_energetica', 'fundamentos', 'Eficiencia Energética I', '-10% consumo de todas las máquinas.', { lingote_acero: 10, cristales: 15 }, ['ind_fundamentos'], { effect: { energyEff: 0.1 } }),
    R('log_pilones', 'logistica', 'Pilones de Largo Alcance', '+2 tiles de radio en Pilones.', { lingote_acero: 12, cristales: 10 }, ['ind_fundamentos'], { effect: { pylonRange: 2 } }),
    R('log_capacidad', 'logistica', 'Almacén Ampliado', 'Capacidad del Nexo +100%.', { lingote_acero: 15, madera: 100 }, ['ind_fundamentos'], { effect: { nexusCap: 1 } }),
    R('log_capacidad_2', 'logistica', 'Almacén Cuántico', 'Capacidad del Nexo +150% adicional.', { lingote_titanio: 15, cristales_magicos: 10 }, ['log_capacidad'], { effect: { nexusCap: 1.5 } }),
    R('gen_geo', 'generacion', 'Energía Geotérmica', 'Desbloquea el Reactor Geotérmico de Lava.', { lingote_acero: 20, obsidiana_refinada: 8 }, ['ind_fundamentos']),
    R('gen_arcano', 'generacion', 'Energía Arcana', 'Desbloquea el Núcleo Arcano.', { lingote_titanio: 15, cristales_magicos: 15 }, ['gen_geo']),
    R('gen_eficiencia', 'generacion', 'Turbinas Optimizadas', '+15% producción de generadores.', { lingote_titanio: 12, engrane: 12 }, ['gen_geo'], { effect: { genOutput: 0.15 } }),
    R('gen_singularidad', 'generacion', 'Energía Omega', 'Desbloquea el Reactor de Singularidad.', { singularidad: 3, lingote_adamantita: 15 }, ['gen_arcano', 'tec_singularidad']),
    R('proc_trituracion', 'procesamiento', 'Trituración Industrial', 'Desbloquea la Trituradora.', { lingote_hierro: 15, engrane: 8 }, ['ind_fundamentos']),
    R('proc_lavado', 'procesamiento', 'Lavado Arcano', 'Desbloquea la Lavadora Arcana.', { lingote_acero: 12, cristales: 12 }, ['proc_trituracion']),
    R('proc_fundicion', 'procesamiento', 'Fundición Omega', 'Desbloquea la Fundidora Omega.', { lingote_titanio: 10, cristales_magicos: 8 }, ['proc_lavado']),
    R('proc_velocidad', 'procesamiento', 'Mecanismos Aceitados', '+15% velocidad de máquinas.', { lingote_acero: 15, engrane: 15 }, ['proc_trituracion'], { effect: { machineSpeed: 0.15 } }),
    R('proc_velocidad_2', 'procesamiento', 'Mecanismos de Precisión', '+20% velocidad de máquinas.', { lingote_titanio: 15, engrane: 20 }, ['proc_velocidad', 'proc_fundicion'], { effect: { machineSpeed: 0.2 } }),
    R('proc_rendimiento', 'procesamiento', 'Rendimiento Metalúrgico', '+20% lingotes por fundición.', { lingote_titanio: 12, polvo_estelar: 10 }, ['proc_fundicion'], { effect: { recipeYield: 0.2 } }),
    R('proc_sintesis', 'procesamiento', 'Síntesis Cristalina', 'Desbloquea el Sintetizador de Gemas para crear gemas y prismas con energía.', { lingote_titanio: 10, cristales_magicos: 12 }, ['proc_lavado']),
    R('proc_inscripcion', 'procesamiento', 'Inscripción Rúnica Omega', 'Desbloquea el Inscriptor Rúnico Omega para automatizar runas y lingotes celestiales.', { lingote_adamantita: 10, polvo_estelar: 10 }, ['proc_fundicion', 'proc_sintesis']),
    R('def_prisma', 'fundamentos', 'Defensa Prismática', 'Desbloquea la Torreta de Prisma Omega alimentada por energía de la red.', { lingote_titanio: 8, cristales_magicos: 10 }, ['ind_fundamentos']),
    R('red_baliza', 'logistica', 'Baliza de Sobrecarga', 'Desbloquea la Baliza de Sobrecarga (+40% velocidad de máquinas y +20% estadísticas al jugador).', { lingote_adamantita: 10, cristales_magicos: 12 }, ['log_pilones', 'gen_arcano']),
    R('comp_condensador', 'compresion', 'Condensación Energética', 'Desbloquea el Condensador de Materia Pura (convierte 500 energía/s en recursos mágicos y Materia Comprimida).', { lingote_adamantita: 12, polvo_estelar: 15 }, ['comp_prensa']),
    R('rec_extractor', 'recoleccion', 'Perforación Profunda', 'Desbloquea el Extractor de Núcleo.', { lingote_acero: 15, diamantes: 4 }, ['ind_fundamentos']),
    R('rec_profundo', 'recoleccion', 'Vetas Profundas', 'Extractores obtienen platino y titanio.', { lingote_titanio: 12, diamantes: 8 }, ['rec_extractor']),
    R('rec_nucleo', 'recoleccion', 'Corazón del Mundo', 'Extractores obtienen adamantita y oricalco.', { lingote_adamantita: 12, diamantes: 12 }, ['rec_profundo']),
    R('rec_velocidad', 'recoleccion', 'Brocas de Diamante', '+25% velocidad de extracción.', { lingote_titanio: 10, diamantes: 6 }, ['rec_extractor'], { effect: { extractSpeed: 0.25 } }),
    R('rec_domo', 'recoleccion', 'Hidroponía', 'Desbloquea el Domo Hidropónico.', { lingote_hierro: 12, cristales: 20 }, ['ind_fundamentos']),
    R('rec_domo_radio', 'recoleccion', 'Domo Expandido', '+2 tiles de radio del Domo.', { lingote_acero: 10, cristales: 25 }, ['rec_domo'], { effect: { domoRadius: 2 } }),
    R('sim_camara', 'simulacion', 'Simulación de Combate', 'Desbloquea la Cámara de Simulación (24 mazmorras).', { lingote_titanio: 15, cristales_magicos: 15 }, ['gen_arcano'], { dungeons: 24 }),
    R('sim_produccion', 'simulacion', 'Algoritmos de Botín', '+25% recompensas de la Cámara.', { lingote_titanio: 15, polvo_estelar: 15 }, ['sim_camara'], { effect: { simOutput: 0.25 } }),
    R('comp_prensa', 'compresion', 'Compresión Extrema', 'Desbloquea la Prensa de Singularidades.', { lingote_adamantita: 12, cristales_magicos: 15 }, ['proc_fundicion']),
    R('comp_eficiencia', 'compresion', 'Campos de Contención', '-15% coste de Singularidad.', { lingote_adamantita: 10, polvo_estelar: 20 }, ['comp_prensa'], { effect: { pressEff: 0.15 } }),
    R('tec_singularidad', 'singularidad', 'Teoría de Singularidades', 'Requisito de tecnologías definitivas.', { singularidad: 1, polvo_estelar: 20 }, ['comp_prensa', 'comp_eficiencia']),
    R('omega_equipo', 'equipo', 'Metalurgia Omega', 'Desbloquea la forja del Lingote Omega y Equipamiento Tier 16.', { singularidad: 2, lingote_celestial: 20 }, ['comp_prensa']),
    R('sobre_altar', 'sobrecarga', 'Sobrecarga Infinita', 'Desbloquea el Altar de Sobrecarga Infinita.', { singularidad: 2, lingote_omega: 2 }, ['omega_equipo']),
    R('asc_islas', 'ascension', 'Ascensión de Islas', 'Permite ascender islas (24 mazmorras).', { singularidad: 3, lingote_omega: 3 }, ['omega_equipo'], { dungeons: 24 }),
    R('abismo_inv', 'abismo', 'Cartografía del Abismo', '+25% materia comprimida del Abismo y las islas ascendidas.', { singularidad: 2, polvo_estelar: 30 }, ['omega_equipo'], { dungeons: 24, effect: { compressedBonus: 0.25, abyssLoot: 0.25 } })
  ];
  const RESEARCH_BY_ID = {};
  RESEARCH.forEach(r => { RESEARCH_BY_ID[r.id] = r; });

  // ───────────────────────── helpers ─────────────────────────
  const plotKeyOf = (tx, ty) => {
    const P = (Balaclava.CONST && Balaclava.CONST.PLOT_TILES) || 12;
    return Math.floor(tx / P) + ',' + Math.floor(ty / P);
  };
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const cap = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const sumVals = (m) => Object.values(m).reduce((a, v) => a + (Number(v) || 0), 0);
  const lvlIdx = (b) => cap((b.level || 1) - 1, 0, 2);

  // ───────────────────────── OmegaSystem ─────────────────────────
  class OmegaSystem {
    constructor() { this.reset(); }

    reset() {
      this.state = {
        v: CFG.saveVersion, research: {}, overload: {}, bossKills: {},
        abyss: { best: 0, current: 1, totalCleared: 0, bossesDefeated: 0, milestones: {}, history: [] },
        ascension: {}, nexus: {}, savedAt: 0, produced: {}
      };
      this.acc = 0;
      this._sig = null;
      this._nets = new Map();
      this.report = null;
      this.lastError = '';
    }

    // ── research & modifiers ──
    hasResearch(id) { return !!this.state.research[id]; }
    getMod(stat) {
      let v = 0;
      for (const id of Object.keys(this.state.research)) {
        const r = RESEARCH_BY_ID[id];
        if (r && r.effect && r.effect[stat]) v += r.effect[stat];
      }
      return Math.min(v, CFG.statCaps[stat] != null ? CFG.statCaps[stat] : v);
    }
    researchStatus(game, id) {
      const r = RESEARCH_BY_ID[id];
      if (!r) return { ok: false, state: 'missing', reason: 'Investigación desconocida' };
      if (this.hasResearch(id)) return { ok: false, state: 'done', reason: 'Completada' };
      const missing = r.req.filter(q => !this.hasResearch(q));
      if (missing.length) return { ok: false, state: 'locked', reason: 'Requiere: ' + missing.map(m => RESEARCH_BY_ID[m].name).join(', ') };
      const cleared = (game.clearedDungeons || []).length;
      if (r.dungeons && cleared < r.dungeons) return { ok: false, state: 'locked', reason: `Requiere ${r.dungeons} mazmorras completadas (${cleared})` };
      return { ok: true, state: 'available', reason: '' };
    }
    researchAtomic(game, plot, id) {
      const st = this.researchStatus(game, id);
      if (!st.ok) return { ok: false, reason: st.reason };
      const r = RESEARCH_BY_ID[id];
      const paid = this.pay(game, plot, r.cost);
      if (!paid.ok) return { ok: false, reason: 'Faltan: ' + this.fmtMap(paid.missing) };
      this.state.research[id] = 1;
      this._sig = null;
      return { ok: true };
    }

    // ── placement gating (hook from Game.canPlaceBuilding) ──
    canPlace(game, buildingId, tx, ty) {
      const def = BUILDINGS[buildingId];
      if (!def || !def.omegaStructure) return { ok: true };
      if (def.omega.kind === 'nexus') {
        const cleared = (game.clearedDungeons || []).length;
        if (cleared < CFG.nexusUnlockDungeons) return { ok: false, reason: `El Nexo requiere ${CFG.nexusUnlockDungeons} mazmorras completadas (${cleared}).` };
        const key = plotKeyOf(tx, ty);
        if ((game.buildings || []).some(b => b.type === 'nexo_central' && plotKeyOf(b.tx, b.ty) === key)) return { ok: false, reason: 'Esta isla ya tiene un Nexo Central.' };
        return { ok: true };
      }
      if (def.reqOmega && !this.hasResearch(def.reqOmega)) {
        const r = RESEARCH_BY_ID[def.reqOmega];
        return { ok: false, reason: `Requiere investigar «${r ? r.name : def.reqOmega}» en el Nexo.` };
      }
      return { ok: true };
    }

    // ── nexus storage (per island, transactional) ──
    nexusData(plot) {
      let n = this.state.nexus[plot];
      if (!n) n = this.state.nexus[plot] = { items: {}, energy: 0, level: 1, stat: { in: {}, out: {}, lastProd: 0, lastCons: 0, lastDeficit: 0 } };
      return n;
    }
    nexusCapacity(plot, nexusB) {
      const lvl = nexusB ? lvlIdx(nexusB) : 0;
      return Math.floor(CFG.nexusBaseCap * CFG.nexusLevelMult[lvl] * (1 + this.getMod('nexusCap')));
    }
    nexusUsed(plot) { return sumVals(this.nexusData(plot).items); }
    nexusCount(plot, id) { return this.nexusData(plot).items[id] || 0; }
    nexusFree(plot) { const net = this._nets.get(plot); return this.nexusCapacity(plot, net && net.nexus) - this.nexusUsed(plot); }
    nexusCanAdd(plot, map) { return sumVals(map) <= this.nexusFree(plot) + 1e-9; }
    nexusHas(plot, map) { const it = this.nexusData(plot).items; return Object.entries(map).every(([k, q]) => (it[k] || 0) >= q); }
    nexusAdd(plot, map) {
      if (!this.nexusCanAdd(plot, map)) return false;
      const n = this.nexusData(plot);
      for (const [k, q] of Object.entries(map)) {
        if (!(q > 0)) continue;
        n.items[k] = (n.items[k] || 0) + q;
        n.stat.in[k] = (n.stat.in[k] || 0) + q;
      }
      return true;
    }
    nexusTake(plot, map) {
      if (!this.nexusHas(plot, map)) return false;
      const n = this.nexusData(plot);
      for (const [k, q] of Object.entries(map)) {
        n.items[k] -= q;
        if (n.items[k] <= 0) delete n.items[k];
        n.stat.out[k] = (n.stat.out[k] || 0) + q;
      }
      return true;
    }
    produced(id, q) { this.state.produced[id] = (this.state.produced[id] || 0) + q; }

    // Player ⇄ Nexus (validated both sides, atomic)
    depositFromInventory(game, plot, id, qty) {
      qty = Math.floor(qty);
      if (!(qty > 0) || !ITEMS[id]) return { ok: false, reason: 'Cantidad inválida' };
      const have = game.inventory[id] || 0;
      if (have < qty) return { ok: false, reason: 'No tienes suficientes unidades' };
      if (!this.nexusCanAdd(plot, { [id]: qty })) return { ok: false, reason: 'Nexo lleno' };
      game.removeItem(id, qty);
      this.nexusAdd(plot, { [id]: qty });
      return { ok: true };
    }
    withdrawToInventory(game, plot, id, qty) {
      qty = Math.floor(qty);
      if (!(qty > 0)) return { ok: false, reason: 'Cantidad inválida' };
      if (!this.nexusTake(plot, { [id]: qty })) return { ok: false, reason: 'El Nexo no tiene esa cantidad' };
      game.addItem(id, qty);
      return { ok: true };
    }
    // Pays from the island Nexus first, then player inventory. All-or-nothing.
    pay(game, plot, cost) {
      const missing = {};
      for (const [id, q] of Object.entries(cost)) {
        const nx = plot ? this.nexusCount(plot, id) : 0;
        const inv = game.inventory[id] || 0;
        if (nx + inv < q) missing[id] = q - nx - inv;
      }
      if (Object.keys(missing).length) return { ok: false, missing };
      for (const [id, q] of Object.entries(cost)) {
        const fromNx = plot ? Math.min(q, this.nexusCount(plot, id)) : 0;
        if (fromNx > 0) this.nexusTake(plot, { [id]: fromNx });
        if (q - fromNx > 0) game.removeItem(id, q - fromNx);
      }
      return { ok: true };
    }
    fmtMap(m) { return Object.entries(m).map(([k, q]) => `${Math.ceil(q)} ${(ITEMS[k] && ITEMS[k].name) || k}`).join(', '); }

    // ── network topology ──
    signature(game) {
      let s = Object.keys(this.state.research).length + '|' + (game.buildings || []).length;
      for (const b of game.buildings || []) {
        const d = BUILDINGS[b.type];
        if (d && d.omega) s += `;${b.id}:${b.type}:${b.tx}:${b.ty}:${b.level || 1}`;
      }
      return s;
    }
    ensureOmegaState(b, def) {
      if (!b.omega) b.omega = { state: 'inactiva', reason: '', prio: 2, seed: (b.id * 7919 + 13) >>> 0 };
      return b.omega;
    }
    buildNetworks(game) {
      const groups = new Map();
      const center = (b, d) => ({ x: b.tx + d.size / 2, y: b.ty + d.size / 2 });
      for (const b of game.buildings || []) {
        const def = BUILDINGS[b.type];
        if (!def || !def.omega) continue;
        this.ensureOmegaState(b, def);
        const k = plotKeyOf(b.tx, b.ty);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push({ b, def, c: center(b, def) });
      }
      const nets = new Map();
      const pylonBonus = this.getMod('pylonRange');
      for (const [plot, list] of groups) {
        const nexuses = list.filter(e => e.def.omega.kind === 'nexus').sort((a, b2) => a.b.id - b2.b.id);
        const net = { plot, nexus: null, entries: list, parent: new Map(), connected: new Set(), pylonLoad: new Map(), gens: [], consumers: [], pylons: [] };
        nets.set(plot, net);
        if (!nexuses.length) { list.forEach(e => this.setState(e.b, 'sin_nexo', 'Esta isla no tiene Nexo Central.')); continue; }
        net.nexus = nexuses[0].b;
        nexuses.slice(1).forEach(e => this.setState(e.b, 'bloqueada', 'Nexo duplicado en la isla.'));
        const hubs = list.filter(e => e.def.omega.kind === 'pylon' || e === nexuses[0]);
        const radius = (e) => e.def.omega.kind === 'nexus' ? CFG.nexusRadius : CFG.pylonRadius[lvlIdx(e.b)] + pylonBonus;
        const dist = (a, b2) => Math.hypot(a.c.x - b2.c.x, a.c.y - b2.c.y);
        const seen = new Set([nexuses[0].b.id]);
        const queue = [nexuses[0]];
        net.connected.add(nexuses[0].b.id);
        while (queue.length) {
          const u = queue.shift();
          for (const v of hubs) {
            if (seen.has(v.b.id)) continue;
            if (dist(u, v) <= Math.max(radius(u), radius(v))) {
              seen.add(v.b.id); net.parent.set(v.b.id, u.b.id); net.connected.add(v.b.id); queue.push(v);
            }
          }
        }
        const hubById = new Map(hubs.map(h => [h.b.id, h]));
        for (const e of list) {
          const kind = e.def.omega.kind;
          if (kind === 'nexus' || kind === 'pylon') { if (kind === 'pylon') net.pylons.push(e); continue; }
          let best = null, bd = Infinity;
          if (dist(e, nexuses[0]) <= radius(nexuses[0])) {
            best = nexuses[0];
          } else {
            for (const hid of seen) {
              const h = hubById.get(hid);
              const d = dist(e, h);
              if (d <= radius(h) && d < bd) { bd = d; best = h; }
            }
          }
          if (!best) { this.setState(e.b, 'sin_conexion', 'Fuera del alcance de la red (coloca un Pilón de Enlace).'); continue; }
          net.parent.set(e.b.id, best.b.id);
          net.connected.add(e.b.id);
          if (kind === 'generator') net.gens.push(e); else net.consumers.push(e);
        }
        net.consumers.sort((a, b2) => (a.b.omega.prio || 2) - (b2.b.omega.prio || 2) || a.b.id - b2.b.id);
      }
      this._nets = nets;
      return nets;
    }
    setState(b, state, reason) { this.ensureOmegaState(b); b.omega.state = state; b.omega.reason = reason || ''; }
    networks(game) {
      const sig = this.signature(game);
      if (sig !== this._sig) { this.buildNetworks(game); this._sig = sig; }
      return this._nets;
    }
    pathOf(net, id) { const out = []; let cur = net.parent.get(id); while (cur != null) { out.push(cur); cur = net.parent.get(cur); } return out; }

    genOutput(entry, plotKey) {
      if (!entry || !entry.b) return 0;
      const g = GENERATORS[entry.b.type];
      if (!g) return 0;
      const rate = g.out * GEN_LEVEL_MULT[lvlIdx(entry.b)] * (1 + this.getMod('genOutput'));
      const o = entry.b.omega;
      if (o && o.state === 'activa') return o.rate || rate;
      if (plotKey && g.fuels && g.fuels.some(f => this.nexusCount(plotKey, f.id) >= 1)) return rate;
      return rate;
    }

    consumerDemand(entry) {
      if (!entry || !entry.def || !entry.def.omega) return 0;
      if (entry.def.omega.kind === 'battery') return 0;
      const eff = 1 - this.getMod('energyEff');
      const p = (entry.b && entry.b.omega && entry.b.omega.job && entry.b.omega.job.power) || entry.def.omega.power || 0;
      return Math.max(0, p * eff);
    }

    // ── frame hook ──
    update(dt, game) {
      this.acc += dt;
      let n = 0;
      while (this.acc >= CFG.tickSec && n < CFG.maxStepsPerFrame) { this.step(game, CFG.tickSec); this.acc -= CFG.tickSec; n++; }
      if (this.acc > 8) this.acc = 0;
    }
    step(game, dt) {
      const nets = this.networks(game);
      for (const net of nets.values()) if (net.nexus) this.stepNet(game, net, dt);
    }

    stepNet(game, net, dt) {
      const plot = net.plot;
      const nx = this.nexusData(plot);
      let batteryBonus = 0;
      for (const e of net.consumers) {
        if (e.def.omega.kind === 'battery') {
          const bonuses = e.def.omega.capBonus || [5000, 15000, 40000];
          const addCap = bonuses[lvlIdx(e.b)] || 5000;
          batteryBonus += addCap;
          this.setState(e.b, 'activa', `Reserva +${addCap} energía`);
          e.b.omegaActive = true;
        }
      }
      const bufCap = CFG.nexusEnergyBuffer[lvlIdx(net.nexus)] + batteryBonus;
      const eff = 1 - this.getMod('energyEff');
      const hasActiveBeacon = net.consumers.some(e => e.def.omega.kind === 'beacon' && e.b.omegaActive);
      const speed = 1 + this.getMod('machineSpeed') + (hasActiveBeacon ? 0.40 : 0);

      // Generators: burn fuel only if somebody needs power or the buffer isn't full.
      const wantPower = nx.stat.lastCons > 0 || nx.energy < bufCap * 0.95;
      let produced = 0;
      for (const e of net.gens) {
        const g = GENERATORS[e.b.type]; const o = e.b.omega;
        let rate = g.out * GEN_LEVEL_MULT[lvlIdx(e.b)] * (1 + this.getMod('genOutput'));
        if (g.biome) { const bio = this.biomeOf(game, e.b); if (g.biome[bio]) rate *= g.biome[bio]; }
        let rem = dt, guard = 0, burnedTime = 0;
        o.burn = o.burn || 0;
        while (rem > 1e-9 && guard++ < 1000) {
          if (o.burn <= 0) {
            if (!wantPower) break;
            const fuel = g.fuels.find(f => this.nexusCount(plot, f.id) >= 1);
            if (!fuel || !this.nexusTake(plot, { [fuel.id]: 1 })) break;
            o.burn = fuel.t;
          }
          const use = Math.min(rem, o.burn);
          produced += rate * use; burnedTime += use; o.burn -= use; rem -= use;
        }
        o.rate = rate;
        if (burnedTime > 0) this.setState(e.b, 'activa', `Produciendo ${Math.round(rate)} energía/s`);
        else this.setState(e.b, 'sin_materiales', g.fuels.map(f => (ITEMS[f.id] || {}).name || f.id).join(' / ') + ' en el Nexo para arrancar.');
      }

      // Consumers (priority order). Power drawn from produced + battery.
      let available = nx.energy + produced;
      let consumed = 0, deficit = 0;
      const pylonRem = new Map();
      for (const p of net.pylons) pylonRem.set(p.b.id, CFG.pylonCapacity[lvlIdx(p.b)] * dt);

      for (const e of net.consumers) {
        const o = e.b.omega; const kind = e.def.omega.kind;
        if (kind === 'battery') continue;
        const prep = this.prepare(game, net, e, speed);
        if (!prep.wants) { e.b.omegaActive = false; this.setState(e.b, prep.state, prep.reason); continue; }
        const need = prep.power * eff * dt;
        let f = need > 0 ? Math.min(1, available / need) : 1;
        const path = this.pathOf(net, e.b.id);
        for (const pid of path) if (pylonRem.has(pid)) f = Math.min(f, need > 0 ? pylonRem.get(pid) / need : 1);
        f = cap(f, 0, 1);
        if (f <= 0.001) { e.b.omegaActive = false; deficit += need; this.setState(e.b, 'sin_energia', 'Energía insuficiente en la red.'); continue; }
        available -= need * f; consumed += need * f;
        for (const pid of path) if (pylonRem.has(pid)) pylonRem.set(pid, pylonRem.get(pid) - need * f);
        if (f < 0.999) deficit += need * (1 - f);
        e.b.omegaActive = true;
        this.advance(game, net, e, dt * f * speed, f);
      }
      nx.energy = cap(available, 0, bufCap);
      nx.bufCap = bufCap;
      nx.stat.lastProd = produced / dt; nx.stat.lastCons = consumed / dt; nx.stat.lastDeficit = deficit / dt;
    }

    biomeOf(game, b) {
      try {
        const T = (Balaclava.CONST && Balaclava.CONST.TILE_SIZE) || 48;
        return game.world.getBiomeAtPixel((b.tx + 0.5) * T, (b.ty + 0.5) * T);
      } catch (e) { return 'pradera'; }
    }

    // ── per-kind job preparation (decides whether machine wants power this tick) ──
    prepare(game, net, e, speed) {
      const kind = e.def.omega.kind; const o = e.b.omega; const plot = net.plot;
      if (kind === 'machine') {
        if (!o.job) { const job = this.startRecipeJob(game, net, e); if (!job) return { wants: false, state: 'sin_materiales', reason: o.reasonHint || 'Sin materiales de entrada en el Nexo.' }; }
        if (o.job && o.job.blocked && !this.nexusCanAdd(plot, o.job.out)) return { wants: false, state: 'almacen_lleno', reason: 'Nexo lleno: salida retenida sin pérdida.' };
        return { wants: true, power: e.def.omega.power };
      }
      if (kind === 'extractor') {
        if (o.pending && !this.nexusCanAdd(plot, o.pending)) return { wants: false, state: 'almacen_lleno', reason: 'Nexo lleno: extracción retenida.' };
        return { wants: true, power: e.def.omega.power };
      }
      if (kind === 'domo') return { wants: this.domoHasWork(game, e) || (o.timer || 0) > 0, power: e.def.omega.power, state: 'inactiva', reason: 'Sin cultivos maduros en el radio.' };
      if (kind === 'chamber') {
        if (!o.crystal) return { wants: false, state: 'inactiva', reason: 'Inserta un Cristal de Datos.' };
        if (o.pending && !this.nexusCanAdd(plot, o.pending)) return { wants: false, state: 'almacen_lleno', reason: 'Nexo lleno.' };
        return { wants: true, power: e.def.omega.power };
      }
      if (kind === 'press') {
        if (o.done) { if (this.nexusCanAdd(plot, { singularidad: 1 })) return { wants: true, power: 0 }; return { wants: false, state: 'almacen_lleno', reason: 'Nexo lleno: Singularidad retenida.' }; }
        if (!o.category) return { wants: false, state: 'inactiva', reason: 'Selecciona una categoría de recursos.' };
        const has = this.pressAvailable(plot, o.category) > 0;
        if (!has && sumVals(o.deposit || {}) <= 0) return { wants: false, state: 'sin_materiales', reason: 'No hay recursos válidos en el Nexo.' };
        if (!has && sumVals(o.deposit || {}) < this.pressCost()) return { wants: false, state: 'sin_materiales', reason: 'Faltan recursos para completar la compresión.' };
        return { wants: true, power: e.def.omega.power };
      }
      if (kind === 'turret' || kind === 'beacon') {
        return { wants: true, power: e.def.omega.power };
      }
      if (kind === 'condenser') {
        if (o.pending && !this.nexusCanAdd(plot, o.pending)) return { wants: false, state: 'almacen_lleno', reason: 'Nexo lleno: materia retenida.' };
        return { wants: true, power: e.def.omega.power };
      }
      return { wants: false, state: 'inactiva', reason: '' };
    }

    advance(game, net, e, work, f) {
      const kind = e.def.omega.kind;
      if (kind === 'machine') return this.advanceMachine(game, net, e, work, f);
      if (kind === 'extractor') return this.advanceExtractor(game, net, e, work, f);
      if (kind === 'domo') return this.advanceDomo(game, net, e, work, f);
      if (kind === 'chamber') return this.advanceChamber(game, net, e, work, f);
      if (kind === 'press') return this.advancePress(game, net, e, work, f);
      if (kind === 'turret') { this.setState(e.b, 'activa', `Defensa prismática activa (${Math.round(f * 100)}%)`); return; }
      if (kind === 'beacon') { this.setState(e.b, 'activa', `Sobrecarga de isla activa (+40% máquinas, +20% daño)`); return; }
      if (kind === 'condenser') return this.advanceCondenser(game, net, e, work, f);
    }

    advanceCondenser(game, net, e, work) {
      const o = e.b.omega; const cyc = (e.def.omega && e.def.omega.cycleSec) || 20;
      o.progress = o.progress || 0;
      let budget = work, guard = 0;
      while (guard++ < 200) {
        if (o.pending) {
          if (!this.nexusAdd(net.plot, o.pending)) { this.setState(e.b, 'almacen_lleno', 'Nexo lleno: materia retenida.'); return; }
          for (const [k, q] of Object.entries(o.pending)) { this.produced(k, q); o.condensed = (o.condensed || 0) + q; }
          o.pending = null;
        }
        if (budget <= 1e-9) break;
        const use = Math.min(budget, cyc - o.progress);
        o.progress += use; budget -= use;
        if (o.progress < cyc - 1e-9) break;
        o.progress = 0;
        const rng = mulberry32((o.seed + (o.rolls = (o.rolls || 0) + 1) * 514229) >>> 0);
        const mult = GEN_LEVEL_MULT[lvlIdx(e.b)] >= 2.4 ? 3 : GEN_LEVEL_MULT[lvlIdx(e.b)] >= 1.6 ? 2 : 1;
        const out = { polvo_estelar: 2 * mult, cristales_magicos: 2 * mult };
        if (rng() < 0.25 * (1 + this.getMod('compressedBonus'))) out.materia_comprimida = 1 * mult;
        o.pending = out;
      }
      this.setState(e.b, 'activa', `Condensando energía en materia (${Math.floor(100 * (o.progress || 0) / cyc)}%)`);
    }

    // ── recipe machines ──
    recipesFor(e) { return MACHINE_RECIPES[e.def.omega.mtype] || []; }
    startRecipeJob(game, net, e) {
      const o = e.b.omega; const plot = net.plot;
      const list = this.recipesFor(e).filter(r => !r.reqResearch || this.hasResearch(r.reqResearch));
      const pick = (o.recipe && o.recipe !== 'auto') ? list.filter(r => r.id === o.recipe) : list;
      o.reasonHint = '';
      for (const r of pick) {
        if (!this.nexusHas(plot, r.in)) continue;
        if (!this.nexusTake(plot, r.in)) continue;
        const rng = mulberry32((o.seed + (o.rolls = (o.rolls || 0) + 1) * 2654435761) >>> 0);
        const out = Object.assign({}, r.out);
        if (r.yieldFamily) {
          const base = r.out[Object.keys(r.out)[0]];
          out[Object.keys(r.out)[0]] = Math.max(1, Math.floor(base * (1 + this.getMod('recipeYield'))));
        }
        for (const bn of r.bonus || []) if (rng() < bn.chance) out[bn.id] = (out[bn.id] || 0) + bn.qty;
        o.job = { rid: r.id, progress: 0, time: r.time, out, power: r.power, blocked: false };
        return o.job;
      }
      if (o.recipe && o.recipe !== 'auto' && !pick.length) o.reasonHint = 'Receta bloqueada por investigación.';
      return null;
    }
    advanceMachine(game, net, e, work) {
      const o = e.b.omega; let budget = work, guard = 0;
      o.state = 'activa';
      while (budget > 1e-9 && guard++ < 500) {
        if (!o.job && !this.startRecipeJob(game, net, e)) { this.setState(e.b, 'sin_materiales', 'Esperando materiales del Nexo.'); return; }
        const j = o.job;
        if (!j.blocked) {
          const use = Math.min(budget, j.time - j.progress);
          j.progress += use; budget -= use;
          if (j.progress < j.time - 1e-9) break;
        }
        if (!this.nexusAdd(net.plot, j.out)) { j.blocked = true; this.setState(e.b, 'almacen_lleno', 'Nexo lleno: salida retenida sin pérdida.'); return; }
        for (const [k, q] of Object.entries(j.out)) this.produced(k, q);
        o.done = (o.done || 0) + 1;
        o.job = null;
      }
      const j = o.job;
      this.setState(e.b, 'activa', j ? `Procesando ${j.rid} (${Math.floor(100 * j.progress / j.time)}%)` : 'Activa');
    }

    // ── extractor ──
    extractTable(game, e) {
      const bio = this.biomeOf(game, e.b);
      return (EXTRACT_TABLES[bio] || EXTRACT_TABLES.pradera).filter(x => !x.res || this.hasResearch(x.res));
    }
    extractCycleSec(e) { return 10 / (GEN_LEVEL_MULT[lvlIdx(e.b)]); }
    extractMult(game, e) {
      const rank = this.state.ascension[plotKeyOf(e.b.tx, e.b.ty)] || 0;
      const asc = rank > 0 ? CFG.ascensionRanks[Math.min(rank, CFG.ascensionRanks.length) - 1].extract : 1;
      return (1 + this.getMod('extractSpeed')) * asc;
    }
    advanceExtractor(game, net, e, work) {
      const o = e.b.omega; let budget = work * this.extractMult(game, e) / (1 + this.getMod('machineSpeed')), guard = 0;
      const cyc = this.extractCycleSec(e);
      o.progress = o.progress || 0;
      this.setState(e.b, 'activa', 'Extrayendo');
      const rank = this.state.ascension[plotKeyOf(e.b.tx, e.b.ty)] || 0;
      while (guard++ < 500) {
        if (o.pending) {
          if (!this.nexusAdd(net.plot, o.pending)) { this.setState(e.b, 'almacen_lleno', 'Nexo lleno: extracción retenida.'); return; }
          for (const [k, q] of Object.entries(o.pending)) { this.produced(k, q); o.mined = (o.mined || 0) + q; }
          o.pending = null;
        }
        if (budget <= 1e-9) break;
        const use = Math.min(budget, cyc - o.progress);
        o.progress += use; budget -= use;
        if (o.progress < cyc - 1e-9) break;
        o.progress = 0;
        const table = this.extractTable(game, e);
        const rng = mulberry32((o.seed + (o.rolls = (o.rolls || 0) + 1) * 40503) >>> 0);
        let tot = table.reduce((a, x) => a + x.w, 0), r = rng() * tot, pick = table[0];
        for (const x of table) { r -= x.w; if (r <= 0) { pick = x; break; } }
        const qty = GEN_LEVEL_MULT[lvlIdx(e.b)] >= 2.4 ? 3 : GEN_LEVEL_MULT[lvlIdx(e.b)] >= 1.6 ? 2 : 1;
        o.pending = { [pick.id]: qty };
        if (rank > 0 && rng() < CFG.ascendedMateriaChance * (1 + this.getMod('compressedBonus'))) o.pending.materia_comprimida = 1;
      }
    }

    // ── hydroponic dome ──
    domoRadius(e) { return 4 + 2 * lvlIdx(e.b) + this.getMod('domoRadius'); }
    matureCropsIn(game, e) {
      const r = this.domoRadius(e); const cx = e.b.tx + 1, cy = e.b.ty + 1; const out = [];
      for (const c of (game.world && game.world.crops) || []) {
        if (c.stage >= 3 && Math.abs(c.tx - cx) <= r && Math.abs(c.ty - cy) <= r) out.push(c);
      }
      return out;
    }
    domoHasWork(game, e) { return this.matureCropsIn(game, e).length > 0; }
    advanceDomo(game, net, e, work) {
      const o = e.b.omega; o.timer = (o.timer || 0) + work;
      const cyc = 5; let guard = 0;
      while (o.timer >= cyc && guard++ < 200) {
        o.timer -= cyc;
        const crops = this.matureCropsIn(game, e).slice(0, 3 * (lvlIdx(e.b) + 1));
        if (!crops.length) { o.timer = 0; break; }
        for (const c of crops) {
          const def = Balaclava.CROPS && Balaclava.CROPS[c.cropId];
          if (!def) continue;
          const yieldMap = { [def.yieldId]: def.minQty || 1 };
          if (!this.nexusCanAdd(net.plot, yieldMap)) { this.setState(e.b, 'almacen_lleno', 'Nexo lleno.'); return; }
          const idx = game.world.crops.indexOf(c);
          if (idx < 0) continue;
          game.world.crops.splice(idx, 1);
          this.nexusAdd(net.plot, yieldMap); this.produced(def.yieldId, yieldMap[def.yieldId]);
          if (game.stats) game.stats.cropsHarvested = (game.stats.cropsHarvested || 0) + 1;
          o.harvested = (o.harvested || 0) + 1;
          if (this.nexusTake(net.plot, { [def.seedId]: 1 })) game.world.crops.push({ tx: c.tx, ty: c.ty, cropId: c.cropId, progress: 0, stage: 0, watered: true });
        }
      }
      this.setState(e.b, 'activa', `Cosechando (radio ${this.domoRadius(e)})`);
    }

    // ── boss simulation chamber ──
    canMakeCrystal(game, did) {
      if (!Balaclava.DUNGEON_DEFS[did]) return { ok: false, reason: 'Jefe desconocido' };
      if (!(game.clearedDungeons || []).includes(did)) return { ok: false, reason: 'Aún no has derrotado a este jefe.' };
      const k = this.state.bossKills[did] || 0;
      if (k < CFG.crystalKillsRequired) return { ok: false, reason: `Derrótalo ${CFG.crystalKillsRequired} veces (${k}/${CFG.crystalKillsRequired}).` };
      return { ok: true };
    }
    craftCrystal(game, plot, did) {
      const c = this.canMakeCrystal(game, did);
      if (!c.ok) return c;
      const p = this.pay(game, plot, CFG.crystalCost);
      if (!p.ok) return { ok: false, reason: 'Faltan: ' + this.fmtMap(p.missing) };
      game.addItem('cristal_datos_' + did, 1);
      return { ok: true };
    }
    recordBossKill(did) { this.state.bossKills[did] = (this.state.bossKills[did] || 0) + 1; }
    insertCrystal(game, plot, b, did) {
      const o = this.ensureOmegaState(b);
      if (o.crystal) return { ok: false, reason: 'Ya hay un cristal cargado.' };
      if (!(game.clearedDungeons || []).includes(did)) return { ok: false, reason: 'Jefe no desbloqueado.' };
      const id = 'cristal_datos_' + did;
      if (!this.nexusTake(plot, { [id]: 1 })) return { ok: false, reason: 'Deposita el Cristal de Datos en el Nexo primero.' };
      o.crystal = { did, cycles: CFG.simCyclesPerCrystal }; o.progress = 0;
      return { ok: true };
    }
    simRewards(did, rng) {
      const def = Balaclava.DUNGEON_DEFS[did]; const out = {};
      const f = CFG.simQtyFactor * (1 + this.getMod('simOutput'));
      for (const [id, q] of Object.entries((def && def.boss && def.boss.drops) || {})) {
        const it = ITEMS[id]; if (!it || it.equipSlot || /reliquia|relic/.test(id)) continue; // never unique gear
        const rare = it.rarity === 'legendario' || it.rarity === 'epico';
        if (rare && rng() > CFG.simRareChance) continue;
        const n = Math.max(1, Math.floor(q * f));
        out[id] = (out[id] || 0) + n;
      }
      return out;
    }
    advanceChamber(game, net, e, work) {
      const o = e.b.omega; let budget = work, guard = 0;
      const cyc = CFG.simCycleSec * (Balaclava.DUNGEON_DEFS[o.crystal.did] ? 1 : 1);
      o.progress = o.progress || 0;
      this.setState(e.b, 'activa', 'Simulando combate');
      while (guard++ < 200) {
        if (o.pending) {
          if (!this.nexusAdd(net.plot, o.pending)) { this.setState(e.b, 'almacen_lleno', 'Nexo lleno.'); return; }
          for (const [k, q] of Object.entries(o.pending)) this.produced(k, q);
          o.pending = null;
          if (o.crystal.cycles <= 0) { o.crystal = null; o.progress = 0; this.setState(e.b, 'inactiva', 'Cristal agotado.'); return; }
        }
        if (budget <= 1e-9) break;
        const use = Math.min(budget, cyc - o.progress);
        o.progress += use; budget -= use;
        if (o.progress < cyc - 1e-9) break;
        o.progress = 0; o.crystal.cycles -= 1;
        const rng = mulberry32((o.seed + (o.rolls = (o.rolls || 0) + 1) * 69069) >>> 0);
        o.pending = this.simRewards(o.crystal.did, rng);
        if (!Object.keys(o.pending).length) { o.pending = null; if (o.crystal.cycles <= 0) { o.crystal = null; return; } }
      }
    }

    // ── singularity press ──
    pressCost() { return Math.floor(CFG.pressCostBase * (1 - this.getMod('pressEff'))); }
    pressAvailable(plot, cat) { const it = this.nexusData(plot).items; return (PRESS_CATEGORIES[cat] || []).reduce((a, id) => a + (it[id] || 0), 0); }
    pressSetCategory(b, cat) {
      const o = this.ensureOmegaState(b);
      if (sumVals(o.deposit || {}) > 0 && o.category !== cat) return { ok: false, reason: 'Cancela la compresión actual antes de cambiar de categoría.' };
      if (!PRESS_CATEGORIES[cat]) return { ok: false, reason: 'Categoría inválida' };
      o.category = cat; return { ok: true };
    }
    pressCancel(plot, b) {
      const o = this.ensureOmegaState(b); const dep = o.deposit || {};
      if (sumVals(dep) <= 0) return { ok: true };
      if (!this.nexusCanAdd(plot, dep)) return { ok: false, reason: 'El Nexo no tiene espacio para devolver los materiales.' };
      this.nexusAdd(plot, dep); o.deposit = {}; return { ok: true };
    }
    advancePress(game, net, e, work) {
      const o = e.b.omega; const cost = this.pressCost();
      o.deposit = o.deposit || {}; o.history = o.history || [];
      let budget = work, guard = 0;
      while (guard++ < 2000) {
        if (o.done) {
          if (!this.nexusAdd(net.plot, { singularidad: 1 })) { this.setState(e.b, 'almacen_lleno', 'Nexo lleno.'); return; }
          this.produced('singularidad', 1);
          o.history.unshift({ at: Date.now(), n: 1 }); o.history.length = Math.min(o.history.length, CFG.pressHistoryMax);
          o.total = (o.total || 0) + 1; o.done = false;
        }
        let have = sumVals(o.deposit);
        if (have < cost) {
          const room = Math.min(cost - have, CFG.pressRatePerSec * budget);
          let want = Math.floor(room);
          if (want <= 0) break;
          const it = this.nexusData(net.plot).items;
          for (const id of PRESS_CATEGORIES[o.category] || []) {
            if (want <= 0) break;
            const take = Math.min(want, it[id] || 0);
            if (take > 0 && this.nexusTake(net.plot, { [id]: take })) { o.deposit[id] = (o.deposit[id] || 0) + take; want -= take; budget -= take / CFG.pressRatePerSec; }
          }
          have = sumVals(o.deposit);
          if (have < cost) break;
        }
        // consume exactly `cost` from the deposit (atomic)
        let left = cost;
        for (const id of Object.keys(o.deposit)) { const t = Math.min(left, o.deposit[id]); o.deposit[id] -= t; left -= t; if (o.deposit[id] <= 0) delete o.deposit[id]; }
        o.done = true;
        if (budget <= 1e-9) { if (!o.done) break; }
      }
      const have = sumVals(o.deposit);
      this.setState(e.b, 'activa', `Comprimiendo ${Math.floor(have)}/${cost}`);
    }

    // ── overload altar (infinite upgrades) ──
    overloadKeyInfo(game, key) {
      // key: 'tool:<id>' or '<itemId>'
      if (key.startsWith('tool:')) {
        const id = key.slice(5); const T = Balaclava.TOOLS && Balaclava.TOOLS[id];
        if (!T) return null;
        const tier = game.toolTiers && game.toolTiers[id];
        if (!tier) return null;
        const idx = Balaclava.TIER_ORDER ? Balaclava.TIER_ORDER.indexOf(tier) : 14;
        const cat = (id === 'espada' || id === 'arco') ? 'damage' : 'tool';
        return { key, name: T.name, cat, tierIdx: idx };
      }
      const it = ITEMS[key];
      if (!it || !it.equipSlot) return null;
      const slot = it.equipSlot;
      const cat = (slot === 'relic' || slot === 'ring' || slot === 'amulet') ? 'hp' : 'defense';
      return { key, name: it.name, cat, tierIdx: 14 };
    }
    overloadLevel(key) { return this.state.overload[key] || 0; }
    overloadPct(cat, L) {
      if (L <= 0) return 0;
      let p = CFG.overloadK[cat === 'speed' ? 'speed' : cat] * Math.pow(L, CFG.overloadPctExp);
      if (cat === 'speed') p = Math.min(p, CFG.overloadSpeedCapPct);
      return Math.round(p * 100) / 100;
    }
    // Cost to buy the level that goes from L to L+1 is Base × 1.35^L  (L = current level, 0-based)
    overloadStepCost(info, L) {
      const tf = 0.5 + info.tierIdx / 30;
      const out = {};
      for (const c of CFG.overloadBase) {
        const v = Math.ceil(c.base * tf * Math.pow(CFG.overloadGrowth, L));
        if (!isFinite(v) || v > SAFE_MAX) return null;
        out[c.id] = v;
      }
      return out;
    }
    overloadQuote(game, key, n, plot) {
      const info = this.overloadKeyInfo(game, key);
      if (!info) return { ok: false, reason: 'Objeto no compatible o no poseído.' };
      n = Math.floor(n);
      if (!(n >= 1)) return { ok: false, reason: 'Número de niveles inválido.' };
      const L0 = this.overloadLevel(key);
      const total = {}; let L = L0;
      for (let i = 0; i < n; i++, L++) {
        const c = this.overloadStepCost(info, L);
        if (!c) return { ok: false, reason: 'Límite técnico de nivel alcanzado (coste fuera de rango seguro).', maxLevel: L };
        for (const [id, v] of Object.entries(c)) { total[id] = (total[id] || 0) + v; if (total[id] > SAFE_MAX) return { ok: false, reason: 'Límite técnico de nivel alcanzado.', maxLevel: L }; }
      }
      const missing = {};
      for (const [id, q] of Object.entries(total)) {
        const have = (plot ? this.nexusCount(plot, id) : 0) + (game.inventory[id] || 0);
        if (have < q) missing[id] = q - have;
      }
      return { ok: true, info, from: L0, to: L0 + n, cost: total, missing, affordable: !Object.keys(missing).length };
    }
    overloadMaxAffordable(game, key, plot, hardCap) {
      let lo = 0, hi = hardCap || 5000;
      // cost is monotonic in n → binary search
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        const q = this.overloadQuote(game, key, mid, plot);
        if (q.ok && q.affordable) lo = mid; else hi = mid - 1;
      }
      return lo;
    }
    overloadBuy(game, key, n, plot) {
      const q = this.overloadQuote(game, key, n, plot);
      if (!q.ok) return q;
      if (!q.affordable) return { ok: false, reason: 'Faltan: ' + this.fmtMap(q.missing) };
      const p = this.pay(game, plot, q.cost);
      if (!p.ok) return { ok: false, reason: 'Faltan: ' + this.fmtMap(p.missing) };
      this.state.overload[key] = q.to;
      if (game.recomputeModifiers) game.recomputeModifiers();
      return { ok: true, from: q.from, to: q.to, cost: q.cost };
    }
    scaleToolStats(toolId, stats) {
      if (!stats) return stats;
      const L = this.state.overload['tool:' + toolId] || 0;
      if (L <= 0) return stats;
      const cat = (toolId === 'espada' || toolId === 'arco') ? 'damage' : 'tool';
      const out = Object.assign({}, stats);
      out.power = Math.round(stats.power * (1 + this.overloadPct(cat, L) / 100));
      if (cat === 'damage' && typeof stats.speed === 'number') out.speed = stats.speed * (1 + this.overloadPct('speed', L) / 100);
      return out;
    }
    applyEquipMods(game, m) {
      if (Array.isArray(game.buildings) && game.buildings.some(b => b.type === 'faro_sobrecarga_isla' && b.omegaActive)) {
        m.dmgBonus = (m.dmgBonus || 0) + 0.20;
        m.moveSpeed = (m.moveSpeed || 0) + 0.15;
        m.gatherPower = (m.gatherPower || 0) + 0.25;
      }
      for (const eqId of Object.values(game.equipped || {})) {
        if (!eqId) continue;
        const L = this.state.overload[eqId] || 0; if (L <= 0) continue;
        const info = this.overloadKeyInfo(game, eqId); if (!info) continue;
        const it = ITEMS[eqId]; const st = it.stats || it.bonus || {};
        const pct = this.overloadPct(info.cat, L) / 100;
        if (info.cat === 'defense') {
          const d = st.def && st.def >= 1 ? st.def : 0;
          m.def += Math.max(Math.floor(L / 5), Math.round(d * pct));
          m.maxHp += Math.round((st.maxHp || 0) * pct) + Math.floor(L / 3) * 2;
        } else {
          m.maxHp += Math.round((st.maxHp || 10) * pct);
          m.dmgBonus += Math.min(0.5, pct * 0.05);
        }
      }
    }

    // ── abyss ──
    abyssUnlocked(game) { return (game.clearedDungeons || []).length >= CFG.abyssUnlockDungeons; }
    abyssModifiersFor(floor) {
      const mods = ['resistente', 'horda', 'elite', 'veloz', 'botin'];
      const rng = mulberry32(floor * 9973 + 17);
      const n = floor >= 25 ? 2 : (floor >= 5 ? 1 : 0);
      const picked = [];
      while (picked.length < n) { const m = mods[Math.floor(rng() * mods.length)]; if (!picked.includes(m)) picked.push(m); }
      return picked;
    }
    abyssModifiersForFloor(floor) {
      return this.abyssModifiersFor(floor);
    }
    abyssScaling(floor, mods) {
      const A = CFG.abyss; mods = mods || this.abyssModifiersFor(floor);
      const f = Math.max(1, floor) - 1;
      let hp = Math.pow(A.hpGrowth, f) * (mods.includes('resistente') ? 1.6 : 1) * (mods.includes('elite') ? 1.25 : 1);
      let dmg = Math.pow(A.dmgGrowth, f) * (mods.includes('elite') ? 1.3 : 1);
      let speed = Math.min(A.speedCap, 1 + A.speedPerFloor * f) * (mods.includes('veloz') ? 1.15 : 1);
      speed = Math.min(A.speedCap * 1.15, speed);
      hp = Math.min(hp, A.multCap); dmg = Math.min(dmg, A.multCap);
      const loot = Math.min(50, Math.pow(1.05, f)) * (mods.includes('botin') ? 1.5 : 1);
      return { floor, hp, dmg, speed, loot, hpMult: hp, dmgMult: dmg, spdMult: speed, lootMult: loot, horde: mods.includes('horda'), mods };
    }
    abyssScale(floor, mods) {
      return this.abyssScaling(floor, mods);
    }
    abyssDungeonFor(floor) {
      const list = Balaclava.DUNGEON_TIER_LIST || Object.keys(Balaclava.DUNGEON_DEFS);
      return list[(floor - 1) % list.length];
    }
    enterAbyss(game) {
      if (!this.abyssUnlocked(game)) return { ok: false, reason: `Completa ${CFG.abyssUnlockDungeons} mazmorras (${(game.clearedDungeons || []).length}).` };
      if (!this.hasResearch('abismo_inv') && false) return { ok: false };
      if (game.activeDungeon) return { ok: false, reason: 'Ya estás en una mazmorra.' };
      const floor = this.state.abyss.current;
      game.enterDungeon(this.abyssDungeonFor(floor), false, { abyssFloor: floor });
      return { ok: true };
    }
    onAbyssBossDefeated(game, dung) {
      const A = this.state.abyss; const floor = dung.abyssFloor;
      A.totalCleared++; A.bossesDefeated++;
      if (floor > A.best) A.best = floor;
      A.current = Math.max(A.current, floor + 1);
      const sc = this.abyssScaling(floor, dung.abyssMods);
      const coins = Math.round(500 * sc.loot);
      const rewards = {};
      if (floor % 5 === 0) rewards.materia_comprimida = Math.max(1, Math.floor(floor / 5 * (1 + this.getMod('compressedBonus'))));
      if (floor % 10 === 0) rewards.singularidad = Math.floor(floor / 10);
      if (floor % 25 === 0) rewards.lingote_omega = floor / 25;
      game.addCoins(coins);
      for (const [id, q] of Object.entries(rewards)) { game.addItem(id, q); A.milestones[id] = (A.milestones[id] || 0) + q; }
      A.history.unshift({ floor, at: Date.now() }); A.history.length = Math.min(A.history.length, 30);
      game.toast(`Abismo Infinito: Piso ${floor} superado. +${coins} monedas${Object.keys(rewards).length ? ' y ' + this.fmtMap(rewards) : ''}.`, 'success');
      try { if (game.saveSys) game.saveSys.save(game, game.currentSlot, true); } catch (e) { /* persisted on next autosave */ }
    }

    // ── ascension ──
    islandKey(x, y) { const T = (Balaclava.CONST && Balaclava.CONST.TILE_SIZE) || 48; return plotKeyOf(Math.floor(x / T), Math.floor(y / T)); }
    ascensionRank(plot) { return this.state.ascension[plot] || 0; }
    ascensionInfo(game, plot) {
      const rank = this.ascensionRank(plot);
      const next = CFG.ascensionRanks[rank];
      const cur = rank > 0 ? CFG.ascensionRanks[rank - 1] : { hp: 1, dmg: 1, extract: 1 };
      return { rank, cur, next, maxed: !next };
    }
    ascendIsland(game, plot) {
      if (!this.hasResearch('asc_islas')) return { ok: false, reason: 'Requiere la investigación «Ascensión de Islas».' };
      if ((game.clearedDungeons || []).length < CFG.ascensionUnlockDungeons) return { ok: false, reason: 'Requiere 24 mazmorras completadas.' };
      const info = this.ascensionInfo(game, plot);
      if (info.maxed) return { ok: false, reason: 'Rango máximo alcanzado.' };
      const p = this.pay(game, plot, info.next.cost);
      if (!p.ok) return { ok: false, reason: 'Faltan: ' + this.fmtMap(p.missing) };
      this.state.ascension[plot] = info.rank + 1; // absolute rank → multipliers are looked up, never accumulated
      this._sig = null;
      try { if (game.saveSys) game.saveSys.save(game, game.currentSlot, true); } catch (e) { /* ignore */ }
      return { ok: true, rank: info.rank + 1 };
    }
    creatureMult(x, y) {
      const rank = this.ascensionRank(this.islandKey(x, y));
      if (rank <= 0) return { hp: 1, dmg: 1 };
      const r = CFG.ascensionRanks[Math.min(rank, CFG.ascensionRanks.length) - 1];
      return { hp: r.hp, dmg: r.dmg };
    }

    // ── persistence ──
    serialize() {
      const s = JSON.parse(JSON.stringify(this.state));
      s.savedAt = Date.now(); s.v = CFG.saveVersion;
      return s;
    }
    load(data, game, applyOffline) {
      this.reset();
      if (data && typeof data === 'object') {
        const d = this.state;
        d.research = Object.assign({}, data.research || {});
        d.overload = Object.assign({}, data.overload || {});
        d.bossKills = Object.assign({}, data.bossKills || {});
        d.ascension = Object.assign({}, data.ascension || {});
        d.nexus = JSON.parse(JSON.stringify(data.nexus || {}));
        d.produced = Object.assign({}, data.produced || {});
        d.abyss = Object.assign(d.abyss, data.abyss || {});
        d.abyss.history = Array.isArray(d.abyss.history) ? d.abyss.history : [];
        d.abyss.milestones = d.abyss.milestones || {};
        d.savedAt = data.savedAt || 0;
      }
      if (applyOffline && this.state.savedAt && game) {
        const elapsed = (Date.now() - this.state.savedAt) / 1000;
        if (elapsed > 5) this.simulateOffline(game, elapsed);
      }
    }
    simulateOffline(game, elapsed) {
      elapsed = Math.min(Math.max(0, elapsed), CFG.offlineCapSec);
      const before = Object.assign({}, this.state.produced);
      const steps = Math.min(600, Math.max(1, Math.ceil(elapsed)));
      const dt = elapsed / steps;
      this._sig = null;
      for (let i = 0; i < steps; i++) this.step(game, dt);
      const gained = {};
      for (const [k, v] of Object.entries(this.state.produced)) { const d = v - (before[k] || 0); if (d > 0) gained[k] = d; }
      this.report = { elapsed, gained };
      return this.report;
    }
  }

  OmegaSystem.CONFIG = CFG;
  OmegaSystem.ORE_FAMILIES = ORE_FAMILIES;
  OmegaSystem.MACHINE_RECIPES = MACHINE_RECIPES;
  OmegaSystem.EXTRACT_TABLES = EXTRACT_TABLES;
  OmegaSystem.PRESS_CATEGORIES = PRESS_CATEGORIES;
  OmegaSystem.GENERATORS = GENERATORS;
  OmegaSystem.RESEARCH = RESEARCH;
  OmegaSystem.RESEARCH_BY_ID = RESEARCH_BY_ID;
  OmegaSystem.RESEARCH_CATEGORIES = CATS;
  OmegaSystem.plotKeyOf = plotKeyOf;

  Balaclava.OmegaSystem = OmegaSystem;
  Balaclava.OMEGA_CONFIG = CFG;

  // Tool overload scaling is applied by wrapping getToolStats (tooltips + combat stay consistent).
  if (typeof Balaclava.getToolStats === 'function' && !Balaclava.getToolStats.__omega) {
    const orig = Balaclava.getToolStats;
    const wrapped = function (toolId, tierId) {
      const s = orig(toolId, tierId);
      const rt = Balaclava.OmegaRuntime;
      return rt ? rt.scaleToolStats(toolId, s) : s;
    };
    wrapped.__omega = true;
    Balaclava.getToolStats = wrapped;
  }
})();
