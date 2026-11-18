(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  const BUILDING_CATEGORIES = [
    { id: 'produccion', name: 'Producción' },
    { id: 'economia', name: 'Economía' },
    { id: 'agricultura', name: 'Agricultura' },
    { id: 'tecnologia', name: 'Tecnología' },
    { id: 'especiales', name: 'Especiales' },
    { id: 'automatizacion', name: 'Automatización' },
    { id: 'fortificacion', name: 'Bloques y Aldea' }
  ];

  // Every building has a concrete, active gameplay function (zero decorative-only entries).
  const BUILDINGS = {
    // === PRODUCCIÓN ===
    horno: {
      id: 'horno', name: 'Horno', category: 'produccion', size: 1, placeOn: 'land',
      cost: { piedra: 10, madera: 4 },
      desc: 'Funde minerales en lingotes, arena en vidrio y arcilla en ladrillos. Permite automatización de fundición.',
      sprite: 'station_furnace', visualScale: 1.18, badge: 'flame',
      autoCycle: 9, autoRecipe: { in: { piedra: 2 }, out: { carbon: 1 } },
      station: 'horno', capacity: 30, usesFuel: true
    },
    forja: {
      id: 'forja', name: 'Forja', category: 'produccion', size: 1, placeOn: 'land',
      cost: { piedra: 14, madera: 8, lingote_hierro: 2 },
      desc: 'Forja herramientas mejoradas, armaduras, llaves legendarias y piezas metálicas.',
      sprite: 'station_anvil', visualScale: 1.22, badge: 'anvil',
      station: 'forja', capacity: 25
    },
    aserradero: {
      id: 'aserradero', name: 'Aserradero', category: 'produccion', size: 1, placeOn: 'land',
      cost: { madera: 14, piedra: 8 },
      desc: 'Procesa madera automáticamente en tablones y carbón vegetal cada pocos segundos.',
      sprite: 'station_sawtable', visualScale: 1.22, badge: 'saw',
      autoCycle: 10, autoProduce: { tablon: 1, madera: 1 },
      station: 'aserradero', capacity: 40
    },
    molino: {
      id: 'molino', name: 'Molino', category: 'produccion', size: 2, placeOn: 'land',
      cost: { madera: 16, piedra: 12, fibra_vegetal: 6 },
      desc: 'Muele trigo en harina automáticamente y acelera +30% los cultivos cercanos.',
      sprite: 'bld_molino', badge: 'mill',
      autoCycle: 9, autoConvert: { in: { trigo: 2 }, out: { harina: 2 } },
      auraCropSpeed: 0.30, station: 'molino', capacity: 40
    },
    telar: {
      id: 'telar', name: 'Telar', category: 'produccion', size: 1, placeOn: 'land',
      cost: { madera: 12, fibra_vegetal: 10 },
      desc: 'Teje fibras vegetales y lana en tela resistente, capas y mochilas.',
      sprite: 'bld_telar', visualScale: 1.18, badge: 'loom',
      autoCycle: 11, autoConvert: { in: { fibra_vegetal: 2 }, out: { tela: 1 } },
      station: 'telar', capacity: 30
    },
    fundicion: {
      id: 'fundicion', name: 'Fundición Avanzada', category: 'produccion', size: 2, placeOn: 'land',
      cost: { ladrillo: 12, lingote_hierro: 8, carbon: 12 },
      desc: 'Alto horno industrial para lingotes de acero, mitrilo y aleaciones volcánicas.',
      sprite: 'station_blast_furnace', visualScale: 1.12, badge: 'smelt',
      autoCycle: 14, autoProduce: { lingote_hierro: 1, carbon: 1 },
      station: 'fundicion', capacity: 50, usesFuel: true
    },
    alquimia: {
      id: 'alquimia', name: 'Mesa de Alquimia', category: 'produccion', size: 1, placeOn: 'land',
      cost: { vidrio: 6, tablon: 10, cristales: 3 },
      desc: 'Destila elixires curativos, tónicos de velocidad, suerte y catalizadores oscuros.',
      sprite: 'station_alchemy', visualScale: 1.18, badge: 'alchemy',
      autoCycle: 16, autoProduce: { hongo_luminoso: 1 },
      station: 'alquimia', capacity: 25
    },
    cocina: {
      id: 'cocina', name: 'Cocina', category: 'produccion', size: 1, placeOn: 'land',
      cost: { piedra: 10, madera: 10, ladrillo: 4 },
      desc: 'Prepara panes, filetes y estofados que restauran salud y energía al instante.',
      sprite: 'bld_cocina', badge: 'cook',
      station: 'cocina', capacity: 25
    },

    // === ECONOMÍA ===
    mercado: {
      id: 'mercado', name: 'Mercado', category: 'economia', size: 1, placeOn: 'land',
      cost: { madera: 12, piedra: 6 },
      desc: 'Estructura obligatoria para abrir el Mercado rotativo, ofertas raras y venta rápida.',
      sprite: 'Mercado_Stall', badge: 'market',
      opensPanel: 'market'
    },
    banco: {
      id: 'banco', name: 'Banco', category: 'economia', size: 1, placeOn: 'land',
      cost: { ladrillo: 10, lingote_oro: 4, lingote_hierro: 4 },
      desc: 'Genera monedas de oro pasivamente cada ciclo en su bóveda. Mejorable hasta Nv.3.',
      sprite: 'bld_banco', badge: 'bank',
      autoCycle: 10, autoCoins: 14, capacity: 500
    },
    casa_comercio: {
      id: 'casa_comercio', name: 'Casa de Comercio', category: 'economia', size: 1, placeOn: 'land',
      cost: { tablon: 14, lingote_cobre: 6, tela: 4 },
      desc: 'Envía caravanas automáticas que generan oro y materiales poco comunes.',
      sprite: 'bld_casa_comercio', badge: 'trade',
      autoCycle: 15, autoCoins: 22, autoProduce: { semillas_zanahoria: 1 }, capacity: 400
    },
    tesoreria: {
      id: 'tesoreria', name: 'Tesorería Real', category: 'economia', size: 2, placeOn: 'land',
      cost: { ladrillo: 14, lingote_oro: 8, diamantes: 1 },
      desc: 'Aumenta +15% el valor de todas tus ventas y multiplica los ingresos de tus Bancos.',
      sprite: 'bld_tesoreria', badge: 'treasury',
      sellBonus: 0.15, autoCycle: 18, autoCoins: 35, capacity: 1000
    },

    // === AGRICULTURA ===
    huerto: {
      id: 'huerto', name: 'Huerto', category: 'agricultura', size: 1, placeOn: 'land',
      cost: { madera: 8, hierba: 6, semillas: 2 },
      desc: 'Cultiva automáticamente bayas, hierba y semillas de trigo listas para recoger.',
      sprite: 'Plot_Garden', badge: 'sprout',
      autoCycle: 10, autoProduce: { bayas: 2, semillas: 1 }, capacity: 35
    },
    plantacion: {
      id: 'plantacion', name: 'Plantación Autónoma', category: 'agricultura', size: 1, placeOn: 'land',
      cost: { tablon: 12, lingote_cobre: 4, arcilla: 6 },
      desc: 'Riega y cosecha automáticamente todos los cultivos maduros en un radio de 4 casillas.',
      sprite: 'bld_plantacion', badge: 'water',
      autoCycle: 6, autoHarvestRadius: 4, capacity: 60
    },
    corral: {
      id: 'corral', name: 'Corral', category: 'agricultura', size: 2, placeOn: 'land',
      cost: { madera: 16, fibra_vegetal: 8, trigo: 4 },
      desc: 'Cría ovejas y ganado que producen lana, cuero y carne periódicamente.',
      sprite: 'Corral_Pen', badge: 'sheep',
      autoCycle: 13, autoProduce: { lana: 1, cuero: 1, carne: 1 }, capacity: 40
    },
    granja: {
      id: 'granja', name: 'Granja Completa', category: 'agricultura', size: 2, placeOn: 'land',
      cost: { tablon: 18, ladrillo: 8, trigo: 8 },
      desc: 'Produce trigo, huevos, leche y zanahorias de forma continua.',
      sprite: 'bld_granja', badge: 'farm',
      autoCycle: 12, autoProduce: { trigo: 2, huevo: 1, leche: 1 }, capacity: 50
    },
    estanque: {
      id: 'estanque', name: 'Estanque de Pesca', category: 'agricultura', size: 1, placeOn: 'land',
      cost: { piedra: 12, madera: 10, fibra_vegetal: 6 },
      desc: 'Captura peces automáticamente con redes y permite pescar desde tierra firme.',
      sprite: 'Fish_Pond', badge: 'fish',
      autoCycle: 14, autoFish: true, capacity: 30
    },

    // === TECNOLOGÍA ===
    laboratorio: {
      id: 'laboratorio', name: 'Laboratorio', category: 'tecnologia', size: 2, placeOn: 'land',
      cost: { vidrio: 10, lingote_hierro: 8, cristales: 4 },
      desc: 'Sintetiza cristales mágicos, desbloquea recetas avanzadas y otorga +15% velocidad global de máquinas.',
      sprite: 'bld_laboratorio', badge: 'flask',
      autoCycle: 20, autoProduce: { cristales_magicos: 1 },
      machineSpeedBonus: 0.15, station: 'laboratorio', capacity: 30
    },
    biblioteca: {
      id: 'biblioteca', name: 'Biblioteca', category: 'tecnologia', size: 1, placeOn: 'land',
      cost: { tablon: 16, tela: 6, cuero: 4 },
      desc: 'Otorga +25% de experiencia en todas tus acciones y genera pergaminos de conocimiento (experiencia pasiva).',
      sprite: 'station_library', visualScale: 1.22, badge: 'book',
      xpBonus: 0.25, autoCycle: 15, autoXp: 18
    },
    taller_mecanico: {
      id: 'taller_mecanico', name: 'Taller Mecánico', category: 'tecnologia', size: 2, placeOn: 'land',
      cost: { lingote_hierro: 10, lingote_cobre: 8, tablon: 12 },
      desc: 'Fabrica engranajes automáticamente y desbloquea mejoras avanzadas para taladros y recolectores.',
      sprite: 'bld_taller_mecanico', badge: 'gear',
      autoCycle: 13, autoProduce: { engrane: 1 },
      station: 'taller', capacity: 40
    },
    centro_investigacion: {
      id: 'centro_investigacion', name: 'Centro de Investigación', category: 'tecnologia', size: 2, placeOn: 'land',
      cost: { lingote_acero: 10, cristales_magicos: 6, vidrio: 12, engrane: 6 },
      desc: 'Cúspide tecnológica: +30% velocidad a todas las máquinas y genera fragmentos raros e investigación.',
      sprite: 'bld_centro_investigacion', badge: 'tech',
      autoCycle: 28, autoProduce: { cristales: 1, engrane: 1 },
      machineSpeedBonus: 0.30, station: 'investigacion', capacity: 40
    },

    // === CONSTRUCCIONES ESPECIALES ===
    torre_magica: {
      id: 'torre_magica', name: 'Torre Mágica', category: 'especiales', size: 1, placeOn: 'land',
      cost: { piedra: 18, cristales: 4, cristales_magicos: 2 },
      desc: 'Dispara rayos arcanos automáticamente contra enemigos cercanos e ilumina la oscuridad.',
      sprite: 'bld_torre_magica', badge: 'magic',
      turretRange: 280, turretDmg: 22, turretCooldown: 1.1
    },
    portal: {
      id: 'portal', name: 'Portal Dimensional', category: 'especiales', size: 2, placeOn: 'land',
      cost: { piedra: 20, cristales_magicos: 4, lingote_oro: 4 },
      desc: 'Conecta islas lejanas: interactúa o usa el Mapa para teletransportarte al instante entre portales.',
      sprite: 'waypoint_white_strip', visualScale: 1.25, badge: 'portal',
      opensPanel: 'portal'
    },
    monumento: {
      id: 'monumento', name: 'Monumento Ancestral', category: 'especiales', size: 2, placeOn: 'land',
      cost: { ladrillo: 12, esmeraldas: 2, lingote_oro: 5 },
      desc: 'Emite un aura permanente de +15% Daño, +10% Velocidad y +20% Suerte de botín.',
      sprite: 'altar_sun', visualScale: 1.25, badge: 'crown',
      auraDmg: 0.15, auraSpeed: 0.10, auraLuck: 0.20
    },
    altar: {
      id: 'altar', name: 'Altar de Ofrendas', category: 'especiales', size: 2, placeOn: 'land',
      cost: { piedra: 20, huesos: 6, esencia_oscura: 2 },
      desc: 'Permite ofrecer monedas o esencia oscura para activar bendiciones poderosas o invocar meteoritos y jefes.',
      sprite: 'altar_blood', visualScale: 1.25, badge: 'altar',
      opensPanel: 'altar'
    },
    mazmorra_santuario: {
      id: 'mazmorra_santuario', name: 'Santuario de Mazmorra', category: 'especiales', size: 2, placeOn: 'land',
      cost: { ladrillo: 16, lingote_acero: 6, llave_mazmorra: 1 },
      desc: 'Portal construido por el jugador que permite acceder directamente a cualquier mazmorra desbloqueada.',
      sprite: 'bld_santuario', badge: 'dungeon',
      opensPanel: 'dungeons'
    },

    // === AUTOMATIZACIÓN E INFRAESTRUCTURA ===
    taladro: {
      id: 'taladro', name: 'Taladro Automático', category: 'automatizacion', size: 1, placeOn: 'land',
      cost: { lingote_hierro: 8, lingote_cobre: 6, engrane: 3 },
      desc: 'Extrae minerales automáticamente según el bioma donde se coloque (carbón, hierro, oro, cristales, diamantes...).',
      sprite: 'bld_taladro', badge: 'drill',
      autoCycle: 8, autoDrill: true, usesFuel: true, capacity: 60
    },
    recolector: {
      id: 'recolector', name: 'Torre Recolectora', category: 'automatizacion', size: 1, placeOn: 'land',
      cost: { lingote_hierro: 6, engrane: 4, cristales: 2 },
      desc: 'Recoge automáticamente objetos caídos y vacía la producción de máquinas cercanas en un radio de 6 casillas.',
      sprite: 'bld_recolector', badge: 'magnet',
      autoCycle: 3, collectRadius: 6, capacity: 120
    },
    puente: {
      id: 'puente', name: 'Puente de Madera', category: 'automatizacion', size: 1, placeOn: 'water',
      cost: { madera: 4 },
      desc: 'Construye pasarelas sobre el agua para unir islas y cruzar entre biomas sin nadar.',
      sprite: 'Bridge_Tile', badge: 'bridge',
      isBridge: true
    },
    tuberias_conduit: {
      id: 'tuberias_conduit', name: 'Tubería Logística', category: 'automatizacion', size: 1, placeOn: 'land',
      cost: { lingote_cobre: 3, lingote_hierro: 2 },
      desc: 'Conducto de transporte automatizado que conecta máquinas adyacentes y canaliza producción hacia cofres logísticos.',
      sprite: 'prop_pipe', visualScale: 1.0, badge: 'gear',
      isConduit: true, walkableFloor: true
    },
    cofre_logistico: {
      id: 'cofre_logistico', name: 'Cofre Logístico', category: 'automatizacion', size: 1, placeOn: 'land',
      cost: { tablon: 10, lingote_hierro: 6, engrane: 3 },
      desc: 'Cofre inteligente de recepción para la red logística. Recibe automáticamente excedentes de máquinas y permite filtrado y extracción gradual (-1, -10, -50, Todo).',
      sprite: 'prop_chest', visualScale: 1.15, badge: 'chest',
      capacity: 300, isLogisticChest: true,
      opensPanel: 'cofre_logistico'
    },
    cofre_madera: {
      id: 'cofre_madera', name: 'Cofre de Madera', category: 'economia', altCategory: 'produccion', size: 1, placeOn: 'land',
      cost: { tablon: 4 },
      desc: 'Cofre artesanal de 30 ranuras (hasta 100 objetos por stack). Fabricable en Menú de Construcción [R].',
      sprite: 'chest_wood', chestSpriteKey: 'wood', isChest: true, capacity: 30, tier: 1
    },
    cofre_hierro: {
      id: 'cofre_hierro', name: 'Cofre de Hierro', category: 'economia', altCategory: 'produccion', size: 1, placeOn: 'land',
      cost: { lingote_hierro: 10, tablon: 10 },
      desc: 'Cofre acorazado con 50 ranuras (hasta 100 objetos por stack). Fabricable en Menú de Construcción [R].',
      sprite: 'chest_sapphire', chestSpriteKey: 'sapphire', isChest: true, capacity: 50, tier: 2
    },
    cofre_dorado: {
      id: 'cofre_dorado', name: 'Cofre Dorado', category: 'economia', altCategory: 'produccion', size: 1, placeOn: 'land',
      cost: { lingote_oro: 12, lingote_acero: 6, diamantes: 2 },
      desc: 'Arca regia con 70 ranuras (hasta 100 objetos por stack). Fabricable en Menú de Construcción [R].',
      sprite: 'chest_gold', chestSpriteKey: 'gold', isChest: true, capacity: 70, tier: 3
    }
  };

  BUILDINGS.fogata = {
    id: 'fogata',
    name: 'Fogata de Campamento',
    category: 'produccion',
    placeOn: 'land',
    size: 1,
    sprite: 'Campfire_Anim',
    color: '#ef6c00',
    accent: '#ffd54f',
    cost: { madera: 5, piedra: 4 },
    xp: 12,
    lightRadius: 230,
    warmRegenRadius: 120,
    station: 'fogata',
    capacity: 15,
    autoCycle: 14,
    autoProduce: { carbon: 1 },
    desc: 'Ilumina la noche, ahuyenta la oscuridad, regenera salud/energía cercana y produce carbón.'
  };

  BUILDINGS.mesa_artesania = {
    id: 'mesa_artesania',
    name: 'Mesa de Artesanía',
    category: 'produccion',
    placeOn: 'land',
    size: 1,
    sprite: 'Mesa_Artesania',
    badge: 'anvil',
    cost: { madera: 6, piedra: 4 },
    xp: 14,
    station: 'mano',
    opensPanel: 'crafting',
    desc: 'Estación esencial de trabajo: interactúa con ella para acceder al menú completo de Artesanía y Herramientas.'
  };

  BUILDINGS.tablon_logros = {
    id: 'tablon_logros',
    name: 'Tablón de Logros',
    category: 'especiales',
    placeOn: 'land',
    size: 1,
    sprite: 'Tablon_Logros',
    badge: 'trophy',
    cost: { madera: 8, piedra: 2 },
    xp: 14,
    opensPanel: 'achievements',
    desc: 'Erige este tablón de hazañas para consultar todos tus Logros desbloqueados y sus recompensas en oro.'
  };

  BUILDINGS.mesa_encantamientos = {
    id: 'mesa_encantamientos',
    name: 'Mesa de Encantamientos',
    category: 'tecnologia',
    placeOn: 'land',
    size: 1,
    sprite: 'station_enchant',
    visualScale: 1.24,
    badge: 'magic',
    lightRadius: 150,
    cost: { piedra: 12, hierro: 4, cristales: 2 },
    xp: 35,
    opensPanel: 'enchant',
    desc: 'Inscribe hechizos rúnicos en tu Pico, Azada, Herramientas y Armaduras.'
  };

  // === NUEVAS ESTRUCTURAS PRODUCTIVAS Y DEFENSIVAS ===
  BUILDINGS.aspersor = {
    id: 'aspersor', name: 'Aspersor Agrícola', category: 'agricultura', placeOn: 'land', size: 1,
    sprite: 'bld_aspersor', badge: 'drop',
    cost: { hierro: 4, cobre: 4, piedra: 6 }, xp: 20,
    autoCycle: 4.5, autoWaterRadius: 230, cropBoost: 0.45,
    desc: 'Riega automáticamente los cultivos cercanos y acelera su crecimiento +45%.'
  };
  BUILDINGS.invernadero = {
    id: 'invernadero', name: 'Invernadero Real', category: 'agricultura', placeOn: 'land', size: 2,
    sprite: 'bld_invernadero', badge: 'leaf',
    cost: { vidrio: 10, tablon: 10, lingote_hierro: 4 }, xp: 45,
    autoCycle: 16, cropBoost: 0.75, autoWaterRadius: 280,
    autoProduce: { semillas_fresa: 1, semillas_uva: 1 }, capacity: 35,
    desc: 'Riega, acelera +75% todos los cultivos cercanos y produce semillas exóticas.'
  };
  BUILDINGS.colmena = {
    id: 'colmena', name: 'Colmena de Miel', category: 'agricultura', placeOn: 'land', size: 1,
    sprite: 'bld_colmena', badge: 'honey',
    cost: { tablon: 6, fibra_vegetal: 4, hierba: 6 }, xp: 22,
    autoCycle: 14, autoProduce: { miel: 1, cera_abeja: 1, miel_ambar: 1 }, capacity: 36,
    desc: 'Las abejas polinizan tus flores y producen Miel, Cera de Abeja y Miel de Ámbar automáticamente.'
  };
  BUILDINGS.ahumador = {
    id: 'ahumador', name: 'Ahumador Gourmet', category: 'produccion', placeOn: 'land', size: 1,
    sprite: 'bld_ahumador', badge: 'flame',
    cost: { ladrillo: 6, lingote_hierro: 4, carbon: 4 }, xp: 28,
    autoCycle: 15, autoProduce: { queso: 1, filete: 1 }, station: 'cocina', capacity: 36,
    desc: 'Prepara manjares curados y funciona como estación culinaria auxiliar.'
  };
  BUILDINGS.cantera_piedra = {
    id: 'cantera_piedra', name: 'Cantera de Granito', category: 'produccion', placeOn: 'land', size: 2,
    sprite: 'bld_cantera', badge: 'pick',
    cost: { madera: 12, piedra: 16, lingote_hierro: 4 }, xp: 34,
    autoCycle: 10, autoProduce: { piedra: 2, plata: 1, azufre: 1, salitre: 1 }, capacity: 60,
    desc: 'Excava piedra, plata, azufre y salitre de los estratos profundos continuamente.'
  };
  BUILDINGS.muelle_pesca = {
    id: 'muelle_pesca', name: 'Muelle Pesquero', category: 'agricultura', placeOn: 'water', size: 1,
    sprite: 'bld_muelle_pesca', badge: 'fish',
    cost: { tablon: 6, madera: 6, fibra_vegetal: 4 }, xp: 24,
    autoCycle: 14, autoProduce: { pez_azul: 1, camaron: 1, cangrejo: 1 }, capacity: 45,
    desc: 'Instálalo sobre el agua para atrapar peces, camarones y cangrejos con redes automáticas.'
  };
  BUILDINGS.balista = {
    id: 'balista', name: 'Balista Defensiva', category: 'automatizacion', placeOn: 'land', size: 1,
    sprite: 'bld_balista', badge: 'bow',
    cost: { tablon: 8, lingote_hierro: 6, engrane: 2 }, xp: 36,
    turretRange: 340, turretDmg: 30, turretCooldown: 1.25,
    desc: 'Artillería automática de largo alcance que perfora monstruos que se acerquen a tu isla.'
  };
  BUILDINGS.faro_costero = {
    id: 'faro_costero', name: 'Faro Costero', category: 'especiales', placeOn: 'land', size: 1,
    sprite: 'bld_faro_costero', badge: 'sun',
    cost: { ladrillo: 8, vidrio: 6, topacio: 1, carbon: 4 }, xp: 45,
    lightRadius: 290, auraLuck: 0.16,
    desc: 'Ilumina una amplia zona nocturna con radio de luz amplio y bendice la costa con +16% Suerte de pesca y botín.'
  };
  BUILDINGS.estanteria_arcana = {
    id: 'estanteria_arcana', name: 'Estantería Arcana', category: 'tecnologia', placeOn: 'land', size: 1,
    sprite: 'prop_bookshelf', badge: 'book',
    cost: { tablon: 6, cristales: 2, amatista: 1 }, xp: 26,
    xpBonus: 0.15, autoCycle: 14, autoXp: 12,
    desc: 'Archivo portátil que otorga +15% de Experiencia global y genera conocimiento pasivo.'
  };
  BUILDINGS.mesa_banquete = {
    id: 'mesa_banquete', name: 'Mesa de Banquete', category: 'economia', placeOn: 'land', size: 1,
    sprite: 'prop_banquet_table', badge: 'heart',
    cost: { tablon: 8, tela: 4, pastel_miel: 1 }, xp: 34,
    warmRegenRadius: 165, auraSpeed: 0.08,
    desc: 'Regenera rápidamente Vida y Energía al pasar junto a ella (+8% Velocidad cercana).'
  };
  BUILDINGS.barriles_bodega = {
    id: 'barriles_bodega', name: 'Bodega de Barriles', category: 'economia', placeOn: 'land', size: 1,
    sprite: 'prop_barrel', visualScale: 0.96, badge: 'coin',
    cost: { madera: 8, hierro: 4, tablon: 4 }, xp: 18,
    autoCycle: 16, autoCoins: 5, capacity: 160,
    desc: 'Bodega espaciosa que almacena reservas e genera pequeñas rentas de comercio.'
  };

  // === BLOQUES Y ARQUITECTURA DE ALDEA ===
  BUILDINGS.muro_piedra = {
    id: 'muro_piedra', name: 'Muro de Piedra', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'prop_stone_block', visualScale: 1.0, cost: { piedra: 4 }, xp: 4,
    desc: 'Bloque sólido de sillería para construir fortalezas, castillos y murallas.'
  };
  BUILDINGS.muro_madera = {
    id: 'muro_madera', name: 'Empalizada de Madera', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'bld_muro_madera', visualScale: 0.96, cost: { madera: 4 }, xp: 3,
    desc: 'Barrera robusta de madera que delimita y protege tus tierras.'
  };
  BUILDINGS.valla_madera = {
    id: 'valla_madera', name: 'Valla de Granja', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'prop_fence', visualScale: 1.0, cost: { madera: 2, tablon: 1 }, xp: 2,
    desc: 'Cerco campestre ideal para rodear parcelas de cultivo y corrales.'
  };
  BUILDINGS.camino_piedra = {
    id: 'camino_piedra', name: 'Calzada Empedrada', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'prop_cobble', visualScale: 1.0, walkableFloor: true, speedFloor: 0.30, cost: { piedra: 2 }, xp: 2,
    desc: 'Pavimento transitable de adoquines: otorga +30% de velocidad al caminar sobre él.'
  };
  BUILDINGS.suelo_hierba = {
    id: 'suelo_hierba', name: 'Bloque de Tierra con Pasto', category: 'fortificacion', placeOn: 'water', size: 1,
    sprite: 'village_grass_turf', terraformsToLand: true, walkableFloor: true, cost: { piedra: 2, hierba: 2 }, xp: 4,
    desc: 'Rellena agua costera convirtiéndola en tierra firme con pasto verde para expandir islas y unir caminos.'
  };
  BUILDINGS.camino_hierba = {
    id: 'camino_hierba', name: 'Sendero de Jardín', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'village_cobble_path', walkableFloor: true, speedFloor: 0.22, cost: { piedra: 1, hierba: 2 }, xp: 2,
    desc: 'Losa ajardinada transitable (+22% de velocidad) para conectar calles y casas de tu aldea.'
  };
  BUILDINGS.maceta_flores = {
    id: 'maceta_flores', name: 'Jardinera Floral', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'village_planter_wood', visualScale: 0.95, cost: { madera: 3, hierba: 2 }, xp: 4,
    desc: 'Hermoso cajón de madera con flores para embellecer plazas, muelles y portales.'
  };
  BUILDINGS.puesto_mercado = {
    id: 'puesto_mercado', name: 'Puesto de Feria Urbana', category: 'fortificacion', placeOn: 'land', size: 2,
    sprite: 'village_stall', sellAura: 0.06, cost: { tablon: 6, tela: 4, madera: 4 }, xp: 16,
    desc: 'Pabellón real de feria urbana que decora la aldea y concede +6% al comercio y descuento de mercado.'
  };
  BUILDINGS.cabana_aldeano = {
    id: 'cabana_aldeano', name: 'Cabaña de Aldeano', category: 'fortificacion', placeOn: 'land', size: 2,
    sprite: 'village_house_red', warmRegenRadius: 110, cost: { tablon: 10, ladrillo: 6, piedra: 8 }, xp: 34,
    desc: 'Acogedora casa de tejado rojo para fundar un pueblo próspero y descansar.'
  };
  BUILDINGS.farola_pueblo = {
    id: 'farola_pueblo', name: 'Farola Urbana', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'prop_lamppost', visualScale: 0.96, lightRadius: 175, cost: { hierro: 3, vidrio: 1, carbon: 1 }, xp: 10,
    desc: 'Farola de hierro que ilumina tus calles durante la noche.'
  };
  BUILDINGS.brasero_eterno = {
    id: 'brasero_eterno', name: 'Brasero Eterno', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'prop_fireplace', visualScale: 0.98, lightRadius: 200, warmRegenRadius: 95, cost: { ladrillo: 4, carbon: 3, hierro: 2 }, xp: 16,
    desc: 'Hogar ardiente decorativo con halo de luz y calor curativo.'
  };
  BUILDINGS.estatua_caballero = {
    id: 'estatua_caballero', name: 'Estatua Guardiana', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'prop_angel', visualScale: 1.05, auraDmg: 0.12, cost: { piedra: 10, lingote_plata: 2 }, xp: 28,
    desc: 'Escultura sagrada que inspira +12% de daño a los guerreros cercanos.'
  };
  BUILDINGS.estatua_dragon = {
    id: 'estatua_dragon', name: 'Monolito Rúnico', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'prop_rune_pillar', visualScale: 1.05, auraLuck: 0.12, auraSpeed: 0.08, lightRadius: 130,
    cost: { piedra: 10, cristales: 3, amatista: 1 }, xp: 30,
    desc: 'Pilar ancestral brillante que otorga +12% Suerte y +8% Velocidad.'
  };
  BUILDINGS.fuente_plaza = {
    id: 'fuente_plaza', name: 'Fuente de la Plaza', category: 'fortificacion', placeOn: 'land', size: 2,
    sprite: 'well_health_strip', visualScale: 1.08, warmRegenRadius: 160, cost: { piedra: 10, ladrillo: 4, perla: 1 }, xp: 30,
    desc: 'Fuente monumental sagrada de agua cristalina que restaura salud y energía rápidamente.'
  };
  BUILDINGS.banco_madera = {
    id: 'banco_madera', name: 'Banco de Descanso', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'prop_bench', visualScale: 0.94, warmRegenRadius: 75, cost: { madera: 4, tablon: 2 }, xp: 6,
    desc: 'Banco artesanal para descansar y recuperar vigor.'
  };
  BUILDINGS.roble_milenario = {
    id: 'roble_milenario', name: 'Roble Milenario Vivo', category: 'fortificacion', placeOn: 'land', size: 2,
    sprite: 'prop_ancient_oak', visualScale: 1.15, warmRegenRadius: 155, auraLuck: 0.10,
    cost: { madera: 14, bellota: 3, hierba: 6 }, xp: 32,
    desc: 'Majestuoso roble centenario que atrae mariposas y restaura Vida y Energía en su sombra (+10% Suerte).'
  };
  BUILDINGS.brasero_magma = {
    id: 'brasero_magma', name: 'Brasero de Magma', category: 'fortificacion', placeOn: 'land', size: 1,
    sprite: 'fire_brazier', visualScale: 0.98, lightRadius: 230, warmRegenRadius: 110, auraDmg: 0.10,
    cost: { piedra: 6, carbon: 4, material_volcanico: 2 }, xp: 24,
    desc: 'Cuenco volcánico encendido que ilumina ampliamente de noche e inspira +10% Daño cercano.'
  };
  BUILDINGS.estatua_rey_oseo = {
    id: 'estatua_rey_oseo', name: 'Monumento del Rey Óseo', category: 'fortificacion', placeOn: 'land', size: 2,
    sprite: 'giant_skeleton_1', visualScale: 1.12, auraDmg: 0.18, lightRadius: 150,
    cost: { piedra: 16, huesos: 12, esencia_oscura: 3 }, xp: 48,
    desc: 'Colosal monumento esquelético con corona que emite luz espectral e infunde +18% Daño.'
  };
  BUILDINGS.jardin_mariposas = {
    id: 'jardin_mariposas', name: 'Jardín de Mariposas', category: 'agricultura', placeOn: 'land', size: 1,
    sprite: 'bld_jardin_mariposas', visualScale: 0.95, auraSpeed: 0.10, autoCycle: 16, autoProduce: { miel: 1, hierba: 2 }, capacity: 32,
    cost: { tablon: 6, hierba: 6, miel: 2 }, xp: 26,
    desc: 'Parterre florido que atrae mariposas, acelera el paso cercano (+10% Velocidad) y produce néctar.'
  };
  BUILDINGS.mesa_hechiceria = {
    id: 'mesa_hechiceria', name: 'Mesa de Hechicería', category: 'tecnologia', placeOn: 'land', size: 1,
    sprite: 'bld_mesa_hechiceria', visualScale: 1.18, badge: 'book', lightRadius: 145, auraSpellPower: 0.12,
    cost: { tablon: 10, cristales_magicos: 3, amatista: 1 }, xp: 45,
    desc: 'Inscribe grimorios de hechizos activos, báculos elementales, varitas y sombreros de archimago.',
    station: 'mesa_hechiceria', capacity: 30
  };
  BUILDINGS.yunque_runico = {
    id: 'yunque_runico', name: 'Yunque Rúnico', category: 'produccion', placeOn: 'land', size: 1,
    sprite: 'bld_yunque_runico', visualScale: 1.24, badge: 'anvil', lightRadius: 120,
    cost: { lingote_acero: 6, cristales_magicos: 3, diamantes: 1 }, xp: 58,
    desc: 'Forja armas especializadas (dagas, mandobles, alabardas, mazas, ballestas), armaduras de paladín y llaves maestras.',
    station: 'yunque_runico', capacity: 30
  };
  BUILDINGS.observatorio_astral = {
    id: 'observatorio_astral', name: 'Observatorio Astral', category: 'especiales', placeOn: 'land', size: 2,
    sprite: 'bld_observatorio_astral', visualScale: 1.12, lightRadius: 215, auraXp: 0.25, auraSpellPower: 0.10,
    autoCycle: 18, autoProduce: { polvo_estelar: 1, cristales: 1 }, capacity: 28,
    cost: { piedra: 16, vidrio: 8, zafiro: 2, polvo_estelar: 1 }, xp: 72,
    desc: 'Cúpula estelar que irradia +25% Experiencia cercana, +10% Poder Mágico y condensa polvo estelar.'
  };
  BUILDINGS.torre_rayos = {
    id: 'torre_rayos', name: 'Torre Voltaica Arcana', category: 'especiales', placeOn: 'land', size: 1,
    sprite: 'bld_torre_rayos', visualScale: 1.08, lightRadius: 170, isLightningTurret: true, turretRange: 285, turretDmg: 36, turretRate: 1.45,
    cost: { lingote_acero: 5, cristales_magicos: 4, zafiro: 2 }, xp: 64,
    desc: 'Torre defensiva automática que lanza rayos en cadena contra enemigos que se acerquen a tus islas.'
  };

  // Structures unlocked via the RPG Skill Tree (starter utility + village blocks stay accessible early).
  const BUILDING_SKILL_REQ = {
    aserradero: 'rec_1',
    telar: 'rec_1',
    cantera_piedra: 'rec_2',
    forja: 'rec_2',
    molino: 'rec_3',
    plantacion: 'rec_3',
    aspersor: 'rec_2',
    corral: 'rec_4',
    colmena: 'rec_3',
    granja: 'rec_5',
    invernadero: 'rec_5',
    casa_comercio: 'eco_2',
    banco: 'eco_3',
    tesoreria: 'eco_4',
    cofre_hierro: 'eco_2',
    cofre_dorado: 'eco_3',
    monumento: 'eco_5',
    cocina: 'com_1',
    ahumador: 'com_1',
    torre_magica: 'com_2',
    mesa_hechiceria: 'com_2',
    balista: 'com_3',
    alquimia: 'com_3',
    altar: 'com_4',
    torre_rayos: 'com_4',
    mazmorra_santuario: 'com_5',
    biblioteca: 'pro_1',
    estanteria_arcana: 'pro_1',
    taller_mecanico: 'pro_2',
    fundicion: 'pro_3',
    yunque_runico: 'pro_3',
    taladro: 'pro_4',
    centro_investigacion: 'pro_5',
    estanque: 'exp_1',
    muelle_pesca: 'exp_1',
    laboratorio: 'exp_2',
    recolector: 'exp_3',
    observatorio_astral: 'exp_3',
    portal: 'exp_4',
    faro_costero: 'exp_2'
  };
  for (const [bId, skId] of Object.entries(BUILDING_SKILL_REQ)) {
    if (BUILDINGS[bId]) BUILDINGS[bId].reqSkill = skId;
  }

  // Natural beginner -> endgame progression order across UI Build Menu
  const BUILDING_ORDER = [
    'mesa_artesania', 'fogata', 'horno', 'puente', 'suelo_hierba', 'mercado', 'tablon_logros',
    'aserradero', 'telar', 'molino', 'cocina', 'ahumador', 'forja', 'yunque_runico', 'mesa_encantamientos', 'mesa_hechiceria',
    'plantacion', 'aspersor', 'colmena', 'jardin_mariposas', 'estanque', 'muelle_pesca', 'corral', 'granja', 'invernadero',
    'barriles_bodega', 'cofre_madera', 'cofre_hierro', 'cofre_dorado', 'casa_comercio', 'banco', 'tesoreria', 'biblioteca', 'estanteria_arcana',
    'cantera_piedra', 'taller_mecanico', 'alquimia', 'laboratorio', 'fundicion', 'taladro', 'tuberias_conduit', 'cofre_logistico', 'recolector', 'observatorio_astral', 'centro_investigacion',
    'torre_magica', 'torre_rayos', 'balista', 'faro_costero', 'portal', 'monumento', 'altar', 'mazmorra_santuario',
    'banco_madera', 'camino_piedra', 'camino_hierba', 'valla_madera', 'muro_madera', 'muro_piedra',
    'maceta_flores', 'farola_pueblo', 'brasero_eterno', 'brasero_magma', 'mesa_banquete',
    'puesto_mercado', 'cabana_aldeano', 'fuente_plaza', 'roble_milenario', 'estatua_caballero', 'estatua_dragon', 'estatua_rey_oseo'
  ];
  BUILDING_ORDER.forEach((bId, idx) => {
    if (BUILDINGS[bId]) BUILDINGS[bId].sortOrder = idx + 1;
  });

  Balaclava.BUILDING_CATEGORIES = BUILDING_CATEGORIES;
  Balaclava.BUILDINGS = BUILDINGS;
})();
