(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  const TIER_ORDER = [
    'basica', 'mejorada', 'cobre', 'hierro', 'plata',
    'oro', 'platino', 'acero', 'cristal', 'mitrilo',
    'titanio', 'adamantita', 'oricalco', 'legendaria', 'celestial', 'omega'
  ];

  const TIER_META = {
    basica:     { id: 'basica',     name: 'Básica',         color: '#b0bec5', mult: 0.55, speed: 0.72, rareBonus: 0.00, rarity: 'comun' },
    mejorada:   { id: 'mejorada',   name: 'Mejorada',       color: '#81c784', mult: 0.95, speed: 0.92, rareBonus: 0.04, rarity: 'poco_comun' },
    cobre:      { id: 'cobre',      name: 'De Cobre',       color: '#ffab91', mult: 1.45, speed: 1.08, rareBonus: 0.08, rarity: 'poco_comun' },
    hierro:     { id: 'hierro',     name: 'De Hierro',      color: '#90caf9', mult: 2.05, speed: 1.16, rareBonus: 0.14, rarity: 'poco_comun' },
    plata:      { id: 'plata',      name: 'De Plata',       color: '#cfd8dc', mult: 3.10, speed: 1.28, rareBonus: 0.20, rarity: 'raro' },
    oro:        { id: 'oro',        name: 'De Oro',         color: '#ffd54f', mult: 4.10, speed: 1.44, rareBonus: 0.26, rarity: 'raro' },
    platino:    { id: 'platino',    name: 'De Platino',     color: '#80deea', mult: 5.10, speed: 1.58, rareBonus: 0.33, rarity: 'raro' },
    acero:      { id: 'acero',      name: 'De Acero Azul',  color: '#64b5f6', mult: 6.20, speed: 1.76, rareBonus: 0.40, rarity: 'epico' },
    cristal:    { id: 'cristal',    name: 'De Cristal',     color: '#ce93d8', mult: 7.45, speed: 1.94, rareBonus: 0.47, rarity: 'epico' },
    mitrilo:    { id: 'mitrilo',    name: 'De Mitrilo',     color: '#4dd0e1', mult: 8.85, speed: 2.12, rareBonus: 0.55, rarity: 'epico' },
    titanio:    { id: 'titanio',    name: 'De Titanio',     color: '#b0bec5', mult: 10.4, speed: 2.30, rareBonus: 0.63, rarity: 'epico' },
    adamantita: { id: 'adamantita', name: 'De Adamantita',  color: '#66bb6a', mult: 12.2, speed: 2.48, rareBonus: 0.72, rarity: 'legendario' },
    oricalco:   { id: 'oricalco',   name: 'De Oricalco',    color: '#ff7043', mult: 14.4, speed: 2.68, rareBonus: 0.80, rarity: 'legendario' },
    legendaria: { id: 'legendaria', name: 'Legendaria',     color: '#ffb74d', mult: 17.0, speed: 2.90, rareBonus: 0.88, rarity: 'legendario' },
    celestial:  { id: 'celestial',  name: 'Celestial',      color: '#4fc3f7', mult: 20.5, speed: 3.20, rareBonus: 1.00, rarity: 'legendario' },
    omega:      { id: 'omega',      name: 'Omega',          color: '#e040fb', mult: 26.0, speed: 3.65, rareBonus: 1.25, rarity: 'legendario' }
  };

  const TOOLS = {
    pico: {
      id: 'pico', name: 'Pico', key: '1', role: 'Minar rocas, minerales, cristales y obsidiana',
      anim: 'pickaxe', basePower: 4, swingRate: 0.96, baseRange: 74, energyCost: 2,
      tierCosts: {
        mejorada:   { coins: 35,   items: { madera: 8, piedra: 10 } },
        cobre:      { coins: 75,   items: { madera: 10, lingote_cobre: 5 } },
        hierro:     { coins: 135,  items: { tablon: 8, lingote_hierro: 6 } },
        plata:      { coins: 210,  items: { tablon: 10, lingote_plata: 5, malaquita_pradera: 2 } },
        oro:        { coins: 320,  items: { tablon: 10, lingote_oro: 6, carbon: 8 } },
        platino:    { coins: 480,  items: { lingote_platino: 6, jade: 2, lingote_bronce: 4 } },
        acero:      { coins: 640,  items: { lingote_acero: 7, esquirla_hielo: 3, azurita_glacial: 2 } },
        cristal:    { coins: 860,  items: { lingote_acero: 8, cristales: 8, amatista: 2, cristales_magicos: 3 } },
        mitrilo:    { coins: 1180, items: { lingotes_especiales: 6, sanguinaria: 3, lingote_platino: 4 } },
        titanio:    { coins: 1520, items: { lingote_titanio: 5, arena_estelar: 4, ambar_desierto: 2 } },
        adamantita: { coins: 1920, items: { lingote_adamantita: 20, diamantes: 12, material_volcanico: 24 } },
        oricalco:   { coins: 2350, items: { lingote_oricalco: 24, obsidiana_refinada: 14, esencia_magma: 8 } },
        legendaria: { coins: 2950, items: { lingote_celestial: 18, polvo_estelar: 12, escamas_dragon: 8 } },
        celestial:  { coins: 3800, items: { lingote_celestial: 28, gema_alma: 10, runa_tierra: 8, fragmentos_antiguos: 16 } },
        omega:      { coins: 12000, items: { lingote_omega: 6, singularidad: 1, malaquita_pradera: 12, arena_estelar: 12, esquirla_hielo: 12, esencia_oscura: 12, esencia_magma: 12 }, reqOmega: 'omega_equipo' }
      }
    },
    hacha: {
      id: 'hacha', name: 'Hacha', key: '2', role: 'Talar árboles comunes, gigantes y golpe pesado en combate',
      anim: 'axe', basePower: 5, swingRate: 0.68, baseRange: 76, energyCost: 2.5,
      tierCosts: {
        mejorada:   { coins: 30,   items: { madera: 10, piedra: 6 } },
        cobre:      { coins: 70,   items: { madera: 10, lingote_cobre: 4 } },
        hierro:     { coins: 125,  items: { tablon: 8, lingote_hierro: 5 } },
        plata:      { coins: 195,  items: { tablon: 10, lingote_plata: 4, malaquita_pradera: 2 } },
        oro:        { coins: 295,  items: { tablon: 12, lingote_oro: 5, cobre: 6 } },
        platino:    { coins: 450,  items: { lingote_platino: 5, jade: 2, tablon: 12 } },
        acero:      { coins: 610,  items: { lingote_acero: 6, azurita_glacial: 2, tablon: 12 } },
        cristal:    { coins: 820,  items: { lingote_acero: 6, cristales: 7, esmeraldas: 2 } },
        mitrilo:    { coins: 1120, items: { lingotes_especiales: 5, sanguinaria: 2, esencia_oscura: 4 } },
        titanio:    { coins: 1460, items: { lingote_titanio: 5, ambar_desierto: 2, cristales_magicos: 3 } },
        adamantita: { coins: 1840, items: { lingote_adamantita: 20, diamantes: 12, esencia_oscura: 20 } },
        oricalco:   { coins: 2240, items: { lingote_oricalco: 24, cristal_abismal: 10, esencia_magma: 8 } },
        legendaria: { coins: 2800, items: { lingote_celestial: 18, polvo_estelar: 10, rubi: 12 } },
        celestial:  { coins: 3600, items: { lingote_celestial: 28, gema_alma: 10, runa_vida: 10, fragmentos_antiguos: 15 } },
        omega:      { coins: 11500, items: { lingote_omega: 6, singularidad: 1, malaquita_pradera: 10, arena_estelar: 10, esquirla_hielo: 10, esencia_oscura: 10, esencia_magma: 10 }, reqOmega: 'omega_equipo' }
      }
    },
    espada: {
      id: 'espada', name: 'Espada', key: '3', role: 'Combate cuerpo a cuerpo equilibrado con amplio arco de corte',
      anim: 'sword', basePower: 6, swingRate: 1.08, baseRange: 78, energyCost: 2.5,
      tierCosts: {
        mejorada:   { coins: 45,   items: { piedra: 10, madera: 6, fibra_vegetal: 4 } },
        cobre:      { coins: 90,   items: { lingote_cobre: 6, cuero: 3 } },
        hierro:     { coins: 155,  items: { lingote_hierro: 8, cuero: 4 } },
        plata:      { coins: 235,  items: { lingote_plata: 6, cuero: 4, malaquita_pradera: 2 } },
        oro:        { coins: 345,  items: { lingote_oro: 7, lingote_hierro: 6 } },
        platino:    { coins: 530,  items: { lingote_platino: 7, amatista: 2, cuero: 5 } },
        acero:      { coins: 710,  items: { lingote_acero: 8, azurita_glacial: 3, esquirla_hielo: 2 } },
        cristal:    { coins: 920,  items: { lingote_acero: 8, cristales_magicos: 6, huesos: 8 } },
        mitrilo:    { coins: 1280, items: { lingotes_especiales: 6, sanguinaria: 4, escamas_dragon: 2 } },
        titanio:    { coins: 1640, items: { lingote_titanio: 6, ambar_desierto: 3, arena_estelar: 4 } },
        adamantita: { coins: 2050, items: { lingote_adamantita: 22, diamantes: 14, fragmentos_antiguos: 12 } },
        oricalco:   { coins: 2480, items: { lingote_oricalco: 26, esencia_magma: 10, cristal_abismal: 12 } },
        legendaria: { coins: 3050, items: { lingote_celestial: 20, polvo_estelar: 14, cuerno_demonio: 12 } },
        celestial:  { coins: 4100, items: { lingote_celestial: 30, gema_alma: 12, runa_fuego: 10, runa_luz: 10 } },
        omega:      { coins: 15000, items: { lingote_omega: 8, singularidad: 2, malaquita_pradera: 14, arena_estelar: 14, esquirla_hielo: 14, esencia_oscura: 14, esencia_magma: 14 }, reqOmega: 'omega_equipo' }
      }
    },
    pala: {
      id: 'pala', name: 'Pala', key: '4', role: 'Excavar arena, arcilla, tesoros enterrados y preparar tierra',
      anim: 'dig', basePower: 4, swingRate: 1.06, baseRange: 74, energyCost: 2,
      tierCosts: {
        mejorada:   { coins: 28,   items: { madera: 8, piedra: 6 } },
        cobre:      { coins: 65,   items: { madera: 8, lingote_cobre: 4 } },
        hierro:     { coins: 115,  items: { tablon: 6, lingote_hierro: 4 } },
        plata:      { coins: 180,  items: { tablon: 8, lingote_plata: 4, arena: 8 } },
        oro:        { coins: 265,  items: { tablon: 8, lingote_oro: 4, arcilla: 8 } },
        platino:    { coins: 410,  items: { lingote_platino: 4, lingote_bronce: 4, arena: 10 } },
        acero:      { coins: 560,  items: { lingote_acero: 5, arena_estelar: 4, arcilla: 8 } },
        cristal:    { coins: 740,  items: { lingote_acero: 5, cristales: 6 } },
        mitrilo:    { coins: 1020, items: { lingotes_especiales: 4, jade: 3 } },
        titanio:    { coins: 1320, items: { lingote_titanio: 4, arena_estelar: 5, ambar_desierto: 2 } },
        adamantita: { coins: 1650, items: { lingote_adamantita: 18, diamantes: 10, fragmentos_antiguos: 10 } },
        oricalco:   { coins: 1980, items: { lingote_oricalco: 22, obsidiana_refinada: 12 } },
        legendaria: { coins: 2450, items: { lingote_celestial: 16, polvo_estelar: 10, onice: 10 } },
        celestial:  { coins: 3250, items: { lingote_celestial: 25, gema_alma: 10, runa_tierra: 8 } },
        omega:      { coins: 10000, items: { lingote_omega: 5, singularidad: 1, arena_estelar: 12, esquirla_hielo: 12 }, reqOmega: 'omega_equipo' }
      }
    },
    cana: {
      id: 'cana', name: 'Caña de pescar', key: '5', role: 'Pescar peces raros y tesoros hundidos en cualquier costa',
      anim: 'fish', basePower: 2, swingRate: 1.00, baseRange: 160, energyCost: 2,
      tierCosts: {
        mejorada:   { coins: 35,   items: { madera: 8, fibra_vegetal: 8 } },
        cobre:      { coins: 75,   items: { tablon: 6, fibra_vegetal: 8, lingote_cobre: 3 } },
        hierro:     { coins: 135,  items: { tablon: 6, tela: 4, lingote_hierro: 4 } },
        plata:      { coins: 205,  items: { tablon: 8, lingote_plata: 4, tela: 4 } },
        oro:        { coins: 295,  items: { tablon: 8, lingote_oro: 4, tela: 6 } },
        platino:    { coins: 460,  items: { lingote_platino: 4, perla: 2, tela: 6 } },
        acero:      { coins: 620,  items: { lingote_acero: 5, azurita_glacial: 2, tela: 6 } },
        cristal:    { coins: 810,  items: { cristales: 6, cristales_magicos: 3, tela: 8 } },
        mitrilo:    { coins: 1120, items: { lingotes_especiales: 4, jade: 2, pez_dorado: 2 } },
        titanio:    { coins: 1420, items: { lingote_titanio: 4, gema_marina: 2, pez_helado: 2 } },
        adamantita: { coins: 1740, items: { lingote_adamantita: 18, esmeraldas: 10, pez_abismal: 4 } },
        oricalco:   { coins: 2080, items: { lingote_oricalco: 22, gema_marina: 10, coral_brillante: 10 } },
        legendaria: { coins: 2550, items: { lingote_celestial: 16, perla: 12, pez_lava: 3 } },
        celestial:  { coins: 3400, items: { lingote_celestial: 26, gema_marina: 12, runa_agua: 10 } },
        omega:      { coins: 10500, items: { lingote_omega: 5, singularidad: 1, gema_marina: 15, pez_legendario_kraken: 1 }, reqOmega: 'omega_equipo' }
      }
    },
    guadana: {
      id: 'guadana', name: 'Guadaña', key: '6', role: 'Segar hierba, flores, arbustos y cultivos con barrido amplio',
      anim: 'scythe', basePower: 6, swingRate: 0.90, baseRange: 86, energyCost: 2,
      tierCosts: {
        mejorada:   { coins: 35,   items: { madera: 8, piedra: 6, hierba: 10 } },
        cobre:      { coins: 75,   items: { madera: 8, lingote_cobre: 4, hierba: 10 } },
        hierro:     { coins: 135,  items: { tablon: 6, lingote_hierro: 5 } },
        plata:      { coins: 210,  items: { tablon: 8, lingote_plata: 4, malaquita_pradera: 2 } },
        oro:        { coins: 310,  items: { lingote_oro: 5, trigo: 12 } },
        platino:    { coins: 470,  items: { lingote_platino: 5, jade: 2, tela: 4 } },
        acero:      { coins: 630,  items: { lingote_acero: 5, esquirla_hielo: 2, trigo: 14 } },
        cristal:    { coins: 820,  items: { lingote_acero: 6, cristales: 6, flor_cristal: 2 } },
        mitrilo:    { coins: 1140, items: { lingotes_especiales: 5, amatista: 2, esencia_oscura: 3 } },
        titanio:    { coins: 1480, items: { lingote_titanio: 4, cristal_abismal: 2, flor_cristal: 2 } },
        adamantita: { coins: 1820, items: { lingote_adamantita: 18, esmeraldas: 12, esencia_oscura: 14 } },
        oricalco:   { coins: 2160, items: { lingote_oricalco: 22, esencia_magma: 10, flor_cristal: 8 } },
        legendaria: { coins: 2620, items: { lingote_celestial: 16, polvo_estelar: 10, flor_cristal: 10 } },
        celestial:  { coins: 3450, items: { lingote_celestial: 26, gema_alma: 10, runa_vida: 10 } },
        omega:      { coins: 11000, items: { lingote_omega: 5, singularidad: 1, malaquita_pradera: 12, esencia_oscura: 12 }, reqOmega: 'omega_equipo' }
      }
    },
    arco: {
      id: 'arco', name: 'Arco', key: '7', role: 'Disparar flechas precisas a distancia contra enemigos y jefes',
      anim: 'bow', basePower: 6, swingRate: 1.00, baseRange: 380, energyCost: 3.0,
      tierCosts: {
        mejorada:   { coins: 50,   items: { madera: 12, fibra_vegetal: 10 } },
        cobre:      { coins: 95,   items: { madera: 12, lingote_cobre: 4, tela: 3 } },
        hierro:     { coins: 165,  items: { tablon: 10, lingote_hierro: 4, tela: 4 } },
        plata:      { coins: 245,  items: { tablon: 10, lingote_plata: 4, tela: 5 } },
        oro:        { coins: 350,  items: { tablon: 12, lingote_oro: 5, cuero: 5 } },
        platino:    { coins: 540,  items: { lingote_platino: 5, tela: 6, amatista: 2 } },
        acero:      { coins: 730,  items: { lingote_acero: 6, azurita_glacial: 2, tela: 6 } },
        cristal:    { coins: 950,  items: { cristales: 8, cristales_magicos: 4, tela: 6 } },
        mitrilo:    { coins: 1320, items: { lingotes_especiales: 6, sanguinaria: 3, seda_arana: 5 } },
        titanio:    { coins: 1680, items: { lingote_titanio: 5, ambar_desierto: 3, seda_arana: 5 } },
        adamantita: { coins: 2040, items: { lingote_adamantita: 20, diamantes: 12, material_volcanico: 18 } },
        oricalco:   { coins: 2450, items: { lingote_oricalco: 24, cristal_abismal: 10, pluma_oscura: 10 } },
        legendaria: { coins: 2980, items: { lingote_celestial: 18, polvo_estelar: 12, pluma_fenix: 8 } },
        celestial:  { coins: 3950, items: { lingote_celestial: 28, gema_alma: 12, runa_aire: 10 } },
        omega:      { coins: 14000, items: { lingote_omega: 7, singularidad: 2, arena_estelar: 12, esencia_magma: 12 }, reqOmega: 'omega_equipo' }
      }
    },
    azada: {
      id: 'azada', name: 'Azada', key: '8', role: 'Arar y regar la tierra rápidamente para plantar y cosechar',
      anim: 'hoe', basePower: 4, swingRate: 1.12, baseRange: 76, energyCost: 2,
      tierCosts: {
        mejorada:   { coins: 34,   items: { madera: 8, piedra: 6 } },
        cobre:      { coins: 70,   items: { madera: 8, lingote_cobre: 4 } },
        hierro:     { coins: 125,  items: { tablon: 6, lingote_hierro: 4 } },
        plata:      { coins: 190,  items: { tablon: 8, lingote_plata: 4, fertilizante: 3 } },
        oro:        { coins: 280,  items: { lingote_oro: 4, trigo: 10 } },
        platino:    { coins: 440,  items: { lingote_platino: 4, fertilizante: 5 } },
        acero:      { coins: 590,  items: { lingote_acero: 5, malaquita_pradera: 3, fertilizante: 5 } },
        cristal:    { coins: 760,  items: { lingote_acero: 6, cristales: 5 } },
        mitrilo:    { coins: 1080, items: { lingotes_especiales: 4, jade: 3 } },
        titanio:    { coins: 1380, items: { lingote_titanio: 4, ambar_desierto: 2, fertilizante: 6 } },
        adamantita: { coins: 1710, items: { lingote_adamantita: 18, esmeraldas: 10 } },
        oricalco:   { coins: 2050, items: { lingote_oricalco: 22, cristal_abismal: 10, flor_cristal: 8 } },
        legendaria: { coins: 2490, items: { lingote_celestial: 16, polvo_estelar: 10, flor_cristal: 8 } },
        celestial:  { coins: 3280, items: { lingote_celestial: 26, gema_alma: 10, runa_vida: 8 } },
        omega:      { coins: 10000, items: { lingote_omega: 5, singularidad: 1, malaquita_pradera: 10, flor_cristal: 10 }, reqOmega: 'omega_equipo' }
      }
    }
  };

  function getToolReach(toolId, tierId) {
    const tool = TOOLS[toolId];
    if (!tool) return 74;
    const meta = TIER_META[tierId] || TIER_META.basica;
    const tierIndex = Math.max(0, TIER_ORDER.indexOf(meta.id));
    const step = toolId === 'arco' ? 14 : toolId === 'cana' ? 12 : 8;
    return Math.round(tool.baseRange + tierIndex * step);
  }

  function getToolStats(toolId, tierId) {
    const tool = TOOLS[toolId];
    const meta = TIER_META[tierId] || TIER_META.basica;
    if (!tool) return null;
    const reach = getToolReach(toolId, meta.id);
    return {
      ...tool,
      tier: meta.id,
      tierName: meta.name,
      tierColor: meta.color,
      power: Math.max(1, Math.round(tool.basePower * meta.mult)),
      speed: meta.speed,
      swingRate: tool.swingRate || 1.0,
      rareBonus: meta.rareBonus,
      reach,
      tierIndex: TIER_ORDER.indexOf(meta.id)
    };
  }

  function getNextTier(tierId) {
    const idx = TIER_ORDER.indexOf(tierId);
    if (idx < 0 || idx >= TIER_ORDER.length - 1) return null;
    return TIER_ORDER[idx + 1];
  }

  // Clean out zero-cost placeholder keys if any
  Object.values(TOOLS).forEach(t => {
    Object.values(t.tierCosts).forEach(c => {
      Object.keys(c.items).forEach(k => {
        if (!c.items[k] || !Balaclava.ITEMS[k]) delete c.items[k];
      });
    });
  });

  // Required minimum pickaxe tier index across 15 tiers (0=basica .. 14=celestial)
  function getRequiredPickTier(nodeKind) {
    const reqs = {
      rock: 0, ruin_pillar: 0, coal_vein: 0, copper_vein: 0, tin_vein: 0, sulfur_vein: 0, malachite_vein: 0,
      iron_vein: 2, silver_vein: 3, gold_vein: 4, ice_crystal: 4, jade_vein: 4, amber_vein: 4, star_sand_vein: 3,
      platinum_vein: 5, crystal_node: 6, emerald_vein: 6, ruby_node: 7, sapphire_node: 7, amethyst_vein: 7, azurite_vein: 7,
      volcanic_rock: 8, diamond_vein: 8, bloodstone_vein: 8, abyssal_crystal_vein: 8, meteor: 8,
      mithril_vein: 9, titanium_vein: 10, magma_core_vein: 10, adamantite_vein: 11,
      orichalcum_vein: 12, oricalco_vein: 12, obsidian_vein: 12
    };
    return reqs[nodeKind] ?? 0;
  }

  // Strict tool hierarchy multiplier & feedback for mining, chopping, foraging, excavation & combat.
  function getToolEfficiency(toolId, targetKind, tierId = 'basica') {
    const T = (k, vars) => (Balaclava.I18n ? Balaclava.I18n.t(k, vars) : k);
    if (!toolId || !tierId) return { mult: 0, blocked: true, hint: T('tool.none') };
    const tierIdx = TIER_ORDER.indexOf(tierId);

    const miningNodes = new Set([
      'rock', 'coal_vein', 'copper_vein', 'tin_vein', 'iron_vein', 'gold_vein', 'silver_vein', 'platinum_vein',
      'sulfur_vein', 'jade_vein', 'amethyst_vein', 'bloodstone_vein', 'crystal_node', 'emerald_vein', 'ruby_node',
      'sapphire_node', 'diamond_vein', 'mithril_vein', 'volcanic_rock', 'ice_crystal', 'meteor', 'ruin_pillar',
      'malachite_vein', 'amber_vein', 'star_sand_vein', 'azurite_vein', 'abyssal_crystal_vein', 'titanium_vein',
      'orichalcum_vein', 'oricalco_vein', 'obsidian_vein', 'magma_core_vein'
    ]);
    const woodNodes = new Set(['tree', 'giant_tree', 'cactus']);
    const forageNodes = new Set(['bush', 'herb_patch', 'mushroom_node', 'wild_crop_patch']);

    if (targetKind === 'enemy' || targetKind === 'boss') {
      const weights = {
        espada: 1.15,
        arco: 1.10,
        hacha: 0.92,
        guadana: 0.72,
        pico: 0.42,
        azada: 0.38,
        pala: 0.34,
        cana: 0.25
      };
      const mult = weights[toolId] ?? 0.35;
      const hint = (toolId !== 'espada' && toolId !== 'arco' && toolId !== 'hacha') ? T('tool.lowCombatDmg') : null;
      return { mult, blocked: false, hint };
    }

    if (miningNodes.has(targetKind)) {
      const reqIdx = getRequiredPickTier(targetKind);
      if (toolId === 'pico') {
        if (tierIdx < reqIdx) {
          const reqTier = TIER_ORDER[reqIdx];
          const reqName = (TIER_META[reqTier] && TIER_META[reqTier].name) || reqTier;
          return {
            mult: 0.0,
            capDmg: 0,
            blocked: true,
            hint: `¡Pico insuficiente! Requiere Pico ${reqName} (Tier ${reqIdx + 1}) o superior.`
          };
        }
        const pickTierMult = tierIdx === 0 ? 0.68 : tierIdx === 1 ? 0.98 : 1.32;
        return { mult: pickTierMult, blocked: false, hint: null };
      }
      if (toolId === 'espada') {
        if (targetKind === 'rock' || targetKind === 'coal_vein') {
          return { mult: 0.03, capDmg: 1, blocked: false, hint: T('tool.swordBarelyRock') };
        }
        return { mult: 0.0, capDmg: 0, blocked: true, hint: T('tool.swordCantOre') };
      }
      if (targetKind === 'rock' || targetKind === 'coal_vein') {
        return { mult: 0.14, capDmg: 2, blocked: false, hint: T('tool.usePickFaster') };
      }
      return { mult: 0.0, capDmg: 0, blocked: true, hint: 'Se requiere un pico adecuado para extraer este mineral.' };
    }

    if (woodNodes.has(targetKind)) {
      if (toolId === 'hacha') return { mult: 1.45, blocked: false, hint: null };
      if (toolId === 'espada') {
        return { mult: 0.06, capDmg: 1, blocked: false, hint: T('tool.swordBarelyTree') };
      }
      if (targetKind === 'giant_tree') {
        return { mult: 0.10, capDmg: 1, blocked: false, hint: T('tool.giantTreeAxe') };
      }
      if (toolId === 'pico') return { mult: 0.18, capDmg: 2, blocked: false, hint: T('tool.fasterWithAxe') };
      return { mult: 0.20, capDmg: 2, blocked: false, hint: T('tool.useAxeChop') };
    }

    if (forageNodes.has(targetKind)) {
      if (toolId === 'guadana') return { mult: 1.55, aoe: true, bonusSeed: true, blocked: false, hint: null };
      if (toolId === 'hacha' || toolId === 'espada' || toolId === 'azada') return { mult: 0.9, blocked: false, hint: null };
      return { mult: 0.65, blocked: false, hint: T('tool.scytheMoreSeeds') };
    }

    if (targetKind === 'dig_spot') {
      if (toolId === 'pala') return { mult: 1.35, blocked: false, hint: null };
      return { mult: 0, blocked: true, hint: T('tool.needShovel') };
    }

    if (targetKind === 'soil') {
      if (toolId === 'azada') return { mult: 1.4, blocked: false, hint: null };
      return { mult: 0, blocked: true, hint: T('tool.needHoe') };
    }

    if (targetKind === 'fish_spot' || targetKind === 'water') {
      if (toolId === 'cana') return { mult: 1.0, blocked: false, hint: null };
      return { mult: 0, blocked: true, hint: T('tool.needRod') };
    }

    return { mult: 1.0, blocked: false, hint: null };
  }

  const ARMOR_CHAINS = {
    helm: {
      slot: 'helm',
      nameKey: 'inv.slotHelm',
      fallbackName: 'Casco',
      baseItem: 'casco_cuero',
      tiers: [
        'casco_cuero', 'casco_bronce', 'casco_cobre', 'casco_hierro', 'casco_plata',
        'casco_oro', 'casco_platino', 'casco_acero', 'casco_cristal', 'casco_mitrilo',
        'casco_titanio', 'casco_adamantita', 'casco_oricalco', 'casco_balaclava', 'casco_solar', 'casco_omega'
      ]
    },
    armor: {
      slot: 'armor',
      nameKey: 'inv.slotArmor',
      fallbackName: 'Armadura',
      baseItem: 'armadura_cuero',
      tiers: [
        'armadura_cuero', 'armadura_bronce', 'armadura_cobre', 'armadura_hierro', 'armadura_plata',
        'armadura_oro', 'armadura_platino', 'armadura_acero', 'armadura_cristal', 'armadura_mitrilo',
        'armadura_titanio', 'armadura_adamantita', 'armadura_oricalco', 'armadura_volcanica', 'armadura_celestial', 'armadura_omega'
      ]
    },
    shield: {
      slot: 'shield',
      nameKey: 'inv.slotShield',
      fallbackName: 'Escudo',
      baseItem: 'escudo_madera',
      tiers: [
        'escudo_madera', 'escudo_bronce', 'escudo_cobre', 'escudo_hierro', 'escudo_plata',
        'escudo_oro', 'escudo_platino', 'escudo_acero', 'escudo_cristal', 'escudo_mitrilo',
        'escudo_titanio', 'escudo_adamantita', 'escudo_oricalco', 'escudo_solar', 'escudo_celestial', 'escudo_omega'
      ]
    },
    boots: {
      slot: 'boots',
      nameKey: 'inv.slotBoots',
      fallbackName: 'Botas',
      baseItem: 'botas_cuero',
      tiers: [
        'botas_cuero', 'botas_bronce', 'botas_cobre', 'botas_hierro', 'botas_plata',
        'botas_oro', 'botas_platino', 'botas_acero', 'botas_cristal', 'botas_mitrilo',
        'botas_titanio', 'botas_adamantita', 'botas_oricalco', 'botas_viento', 'botas_celestiales', 'botas_omega'
      ]
    },
    legs: {
      slot: 'legs',
      nameKey: 'inv.slotLegs',
      fallbackName: 'Pantalones',
      baseItem: 'pantalones_cuero',
      tiers: [
        'pantalones_cuero', 'pantalones_hierro', 'pantalones_acero', 'pantalones_omega'
      ]
    }
  };

  const ARMOR_ITEM_LOOKUP = {};
  Object.entries(ARMOR_CHAINS).forEach(([slot, chain]) => {
    chain.tiers.forEach((itemId, tierIdx) => {
      ARMOR_ITEM_LOOKUP[itemId] = { slot, tierIdx, itemId, chain };
    });
  });

  function isProgressiveArmorItem(itemId) {
    return ARMOR_ITEM_LOOKUP[itemId] || null;
  }

  function getArmorNextItem(slot, curItemId) {
    const chain = ARMOR_CHAINS[slot];
    if (!chain) return null;
    if (!curItemId) return chain.tiers[0];
    const idx = chain.tiers.indexOf(curItemId);
    if (idx < 0 || idx >= chain.tiers.length - 1) return null;
    return chain.tiers[idx + 1];
  }

  function getArmorTierIndex(slot, itemId) {
    const chain = ARMOR_CHAINS[slot];
    if (!chain || !itemId) return -1;
    return chain.tiers.indexOf(itemId);
  }

  function getArmorUpgradeMaterials(slot, targetItemId) {
    const rec = Balaclava.RECIPES && Balaclava.RECIPES.find(r => r.out === targetItemId);
    if (!rec) return null;
    const prevChain = ARMOR_CHAINS[slot] && ARMOR_CHAINS[slot].tiers;
    const prevIdx = prevChain ? prevChain.indexOf(targetItemId) - 1 : -1;
    const prevId = prevIdx >= 0 ? prevChain[prevIdx] : null;
    const items = {};
    Object.entries(rec.in || {}).forEach(([k, v]) => {
      if (k !== prevId && v > 0) items[k] = v;
    });
    return {
      recipeId: rec.id,
      station: rec.station,
      items,
      xp: rec.xp || 24,
      craftTime: rec.craftTime
    };
  }

  Balaclava.TOOL_TIERS = TIER_ORDER;
  Balaclava.TIER_META = TIER_META;
  Balaclava.TOOLS = TOOLS;
  Balaclava.ARMORS = ARMOR_CHAINS;
  Balaclava.getToolStats = getToolStats;
  Balaclava.getToolReach = getToolReach;
  Balaclava.getNextTier = getNextTier;
  Balaclava.getRequiredPickTier = getRequiredPickTier;
  Balaclava.getToolEfficiency = getToolEfficiency;
  Balaclava.isProgressiveArmorItem = isProgressiveArmorItem;
  Balaclava.getArmorNextItem = getArmorNextItem;
  Balaclava.getArmorTierIndex = getArmorTierIndex;
  Balaclava.getArmorUpgradeMaterials = getArmorUpgradeMaterials;
})();
