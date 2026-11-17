(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  // Complete item, resource, crop, fish, food, equipment & relic catalog.
  const ITEMS = {
    // === RECURSOS BÁSICOS ===
    madera: {
      id: 'madera', name: 'Madera', category: 'recursos', rarity: 'comun',
      sellValue: 2, buyValue: 6, source: 'Talar árboles en Pradera y Bosque Oscuro',
      uses: 'Construcción, tablones, carbón, herramientas y mangos',
      desc: 'Troncos resistentes recién talados. Pilar de toda civilización isleña.',
      icon: 'wood'
    },
    piedra: {
      id: 'piedra', name: 'Piedra', category: 'recursos', rarity: 'comun',
      sellValue: 2, buyValue: 6, source: 'Minar rocas en todos los biomas',
      uses: 'Hornos, cimientos, herramientas básicas y ladrillos',
      desc: 'Roca gris maciza útil para estructuras y herramientas.',
      icon: 'stone'
    },
    hierba: {
      id: 'hierba', name: 'Hierba', category: 'recursos', rarity: 'comun',
      sellValue: 1, buyValue: 4, source: 'Cortar arbustos y maleza con guadaña o mano',
      uses: 'Fibra vegetal, corrales y alquimia ligera',
      desc: 'Manojo de hierba fresca aromática.',
      icon: 'herb'
    },
    fibra_vegetal: {
      id: 'fibra_vegetal', name: 'Fibra vegetal', category: 'recursos', rarity: 'comun',
      sellValue: 3, buyValue: 8, source: 'Arbustos, cactus y plantas extrañas',
      uses: 'Cuerdas, tela en el telar, arcos y cañas de pescar',
      desc: 'Hebras flexibles trenzables para textiles y aparejos.',
      icon: 'fiber'
    },
    flecha: {
      id: 'flecha', name: 'Flecha', category: 'equipamiento', rarity: 'comun',
      sellValue: 2, buyValue: 5, source: 'Artesanía (Madera + Piedra / Hierro)',
      uses: 'Munición necesaria para recargar y disparar el Arco',
      desc: 'Flecha emplumada con punta afilada. Indispensable para cargar y disparar el arco a distancia.',
      isAmmo: true, ammoFor: 'arco', icon: 'arrow_ammo'
    },
    bayas: {
      id: 'bayas', name: 'Bayas', category: 'comida', rarity: 'comun',
      sellValue: 3, buyValue: 9, source: 'Arbustos de Pradera y cultivos',
      uses: 'Consumo directo, cocina y pociones',
      desc: 'Frutos silvestres dulces. Recuperan energía y salud.',
      healHp: 8, healEnergy: 18, icon: 'berries'
    },
    semillas: {
      id: 'semillas', name: 'Semillas de Trigo', category: 'recursos', rarity: 'comun',
      sellValue: 2, buyValue: 6, source: 'Hierba silvestre, mercado y cosechas',
      uses: 'Cultivar trigo en tierra arada o huertos',
      desc: 'Semillas doradas listas para sembrar en tierra fértil.',
      plantCrop: 'trigo', icon: 'seeds'
    },
    carbon: {
      id: 'carbon', name: 'Carbón', category: 'recursos', rarity: 'comun',
      sellValue: 4, buyValue: 11, source: 'Vetas oscuras y aserraderos/hornos',
      uses: 'Combustible de hornos, acero y pólvora',
      desc: 'Mineral combustible indispensable para fundir metales.',
      icon: 'coal'
    },

    // === RECURSOS INTERMEDIOS ===
    hierro: {
      id: 'hierro', name: 'Mineral de Hierro', category: 'recursos', rarity: 'poco_comun',
      sellValue: 6, buyValue: 16, source: 'Vetas metálicas en Pradera y Montañas',
      uses: 'Lingotes de hierro, herramientas y máquinas',
      desc: 'Mena ferrosa pesada con reflejos plateados.',
      icon: 'iron_ore'
    },
    cobre: {
      id: 'cobre', name: 'Mineral de Cobre', category: 'recursos', rarity: 'poco_comun',
      sellValue: 5, buyValue: 14, source: 'Vetas rojizas en Pradera y Desierto',
      uses: 'Lingotes de cobre, engranajes y circuitos mágicos',
      desc: 'Mineral conductor ideal para mecanismos de automatización.',
      icon: 'copper_ore'
    },
    oro: {
      id: 'oro', name: 'Mineral de Oro', category: 'recursos', rarity: 'raro',
      sellValue: 14, buyValue: 35, source: 'Vetas doradas en Desierto y Montañas',
      uses: 'Lingotes de oro, moneda, bancos y herramientas doradas',
      desc: 'Pepitas brillantes muy codiciadas por mercaderes y herreros.',
      icon: 'gold_ore'
    },
    cristales: {
      id: 'cristales', name: 'Cristales', category: 'recursos', rarity: 'raro',
      sellValue: 18, buyValue: 44, source: 'Geodas en Desierto, Bosque y Montañas',
      uses: 'Herramientas de cristal, torres mágicas y laboratorio',
      desc: 'Prismas translúcidos que vibran con energía elemental.',
      icon: 'crystal'
    },
    cuero: {
      id: 'cuero', name: 'Cuero', category: 'recursos', rarity: 'poco_comun',
      sellValue: 7, buyValue: 18, source: 'Animales, lobos y corrales',
      uses: 'Armaduras, mochilas y mejoras de herramientas',
      desc: 'Piel curtida flexible y resistente.',
      icon: 'leather'
    },
    huesos: {
      id: 'huesos', name: 'Huesos', category: 'recursos', rarity: 'poco_comun',
      sellValue: 6, buyValue: 15, source: 'Esqueletos y excavación en ruinas',
      uses: 'Alquimia, fertilizante y altares oscuros',
      desc: 'Restos calcificados antiguos cargados de resonancia.',
      icon: 'bone'
    },
    arena: {
      id: 'arena', name: 'Arena', category: 'recursos', rarity: 'comun',
      sellValue: 2, buyValue: 6, source: 'Excavar con pala en Desierto y playas',
      uses: 'Vidrio en horno, relojes y laboratorio',
      desc: 'Arena fina dorada moldeable a altas temperaturas.',
      icon: 'sand'
    },
    arcilla: {
      id: 'arcilla', name: 'Arcilla', category: 'recursos', rarity: 'comun',
      sellValue: 4, buyValue: 10, source: 'Excavar orillas húmedas con pala',
      uses: 'Ladrillos en horno y vasijas de alquimia',
      desc: 'Tierra moldeable rica en minerales.',
      icon: 'clay'
    },

    // === RECURSOS AVANZADOS ===
    diamantes: {
      id: 'diamantes', name: 'Diamantes', category: 'recursos', rarity: 'epico',
      sellValue: 65, buyValue: 160, source: 'Vetas profundas volcánicas, meteoritos y jefes',
      uses: 'Herramientas legendarias, taladros avanzados y monumentos',
      desc: 'Gema indestructible de brillo deslumbrante.',
      icon: 'diamond'
    },
    esmeraldas: {
      id: 'esmeraldas', name: 'Esmeraldas', category: 'recursos', rarity: 'epico',
      sellValue: 55, buyValue: 140, source: 'Montañas Heladas, cofres y comercio',
      uses: 'Torres mágicas, monumentos y reliquias',
      desc: 'Gema verde pura que amplifica la magia natural.',
      icon: 'emerald'
    },
    cristales_magicos: {
      id: 'cristales_magicos', name: 'Cristales mágicos', category: 'recursos', rarity: 'epico',
      sellValue: 48, buyValue: 120, source: 'Bosque Oscuro, Laboratorio y obeliscos',
      uses: 'Portales, torres arcanas y armas cristalinas',
      desc: 'Cristal imbuido con maná condensado de las islas.',
      icon: 'magic_crystal'
    },
    esencia_oscura: {
      id: 'esencia_oscura', name: 'Esencia oscura', category: 'recursos', rarity: 'epico',
      sellValue: 52, buyValue: 130, source: 'Criaturas nocturnas del Bosque Oscuro',
      uses: 'Alquimia avanzada, altares y núcleo de vacío',
      desc: 'Neblina sombría embotellada que susurra antiguos pactos.',
      icon: 'dark_essence'
    },
    fragmentos_antiguos: {
      id: 'fragmentos_antiguos', name: 'Fragmentos antiguos', category: 'especiales', rarity: 'legendario',
      sellValue: 120, buyValue: 300, source: 'Mazmorras, jefes, ruinas y tesoros enterrados',
      uses: 'Tecnologías finales, artefactos y el Corazón de Balaclava',
      desc: 'Pieza rúnica de la civilización que forjó el archipiélago.',
      icon: 'ancient_fragment'
    },
    lingotes_especiales: {
      id: 'lingotes_especiales', name: 'Lingotes de Mitrilo', category: 'materiales', rarity: 'legendario',
      sellValue: 95, buyValue: 230, source: 'Fundición avanzada con cristales y oro',
      uses: 'Equipamiento legendario, centro de investigación y taladros',
      desc: 'Aleación mítica ligera e irrompible de color azul celeste.',
      icon: 'special_ingot'
    },
    material_volcanico: {
      id: 'material_volcanico', name: 'Obsidiana Ígnea', category: 'recursos', rarity: 'epico',
      sellValue: 58, buyValue: 145, source: 'Tierras Volcánicas y gólems de magma',
      uses: 'Fundición, armas volcánicas y portal final',
      desc: 'Vidrio volcánico ardiente templado en lava viva.',
      icon: 'volcanic'
    },

    // === MATERIALES PROCESADOS ===
    tablon: {
      id: 'tablon', name: 'Tablón de Madera', category: 'materiales', rarity: 'comun',
      sellValue: 5, buyValue: 12, source: 'Aserradero o fabricación manual',
      uses: 'Edificios, puentes, muebles y herramientas mejoradas',
      desc: 'Madera cepillada lista para carpintería.',
      icon: 'plank'
    },
    ladrillo: {
      id: 'ladrillo', name: 'Ladrillo Cocido', category: 'materiales', rarity: 'poco_comun',
      sellValue: 9, buyValue: 22, source: 'Horno (Arcilla + Carbón)',
      uses: 'Forja, banco, mercado y edificios de piedra',
      desc: 'Bloque cerámico resistente al fuego.',
      icon: 'brick'
    },
    vidrio: {
      id: 'vidrio', name: 'Vidrio', category: 'materiales', rarity: 'poco_comun',
      sellValue: 8, buyValue: 20, source: 'Horno (Arena)',
      uses: 'Laboratorio, alquimia, lentes y torres',
      desc: 'Panel transparente moldeado al fuego.',
      icon: 'glass'
    },
    tela: {
      id: 'tela', name: 'Tela Tejida', category: 'materiales', rarity: 'poco_comun',
      sellValue: 10, buyValue: 25, source: 'Telar (Fibra o Lana)',
      uses: 'Estandartes, capuchas, mochilas y armadura ligera',
      desc: 'Tejido firme bordado con hilos naturales.',
      icon: 'cloth'
    },
    lingote_cobre: {
      id: 'lingote_cobre', name: 'Lingote de Cobre', category: 'materiales', rarity: 'poco_comun',
      sellValue: 12, buyValue: 30, source: 'Horno (Mineral de Cobre)',
      uses: 'Engranajes, molino, taller mecánico',
      desc: 'Barra brillante de cobre refinado.',
      icon: 'copper_ingot'
    },
    lingote_hierro: {
      id: 'lingote_hierro', name: 'Lingote de Hierro', category: 'materiales', rarity: 'poco_comun',
      sellValue: 15, buyValue: 36, source: 'Horno (Mineral de Hierro)',
      uses: 'Herramientas de hierro, forja, taladros y armaduras',
      desc: 'Acero temprano forjado en lingotes sólidos.',
      icon: 'iron_ingot'
    },
    lingote_oro: {
      id: 'lingote_oro', name: 'Lingote de Oro', category: 'materiales', rarity: 'raro',
      sellValue: 34, buyValue: 80, source: 'Horno (Mineral de Oro)',
      uses: 'Banco, tesorería, herramientas de oro y coronas',
      desc: 'Oro puro sellado con emblema real.',
      icon: 'gold_ingot'
    },
    lingote_acero: {
      id: 'lingote_acero', name: 'Lingote de Acero', category: 'materiales', rarity: 'raro',
      sellValue: 38, buyValue: 90, source: 'Fundición (Hierro + Carbón)',
      uses: 'Máquinas automáticas, taladros y armamento pesado',
      desc: 'Aleación templada de gran dureza.',
      icon: 'steel_ingot'
    },
    engrane: {
      id: 'engrane', name: 'Engranaje Mecánico', category: 'materiales', rarity: 'raro',
      sellValue: 28, buyValue: 68, source: 'Taller mecánico o Forja',
      uses: 'Taladros, recolectores y automatización avanzada',
      desc: 'Mecanismo dentado de precisión para automatizar la isla.',
      icon: 'gear'
    },

    // === AGRICULTURA & GANADERÍA ===
    semillas_zanahoria: {
      id: 'semillas_zanahoria', name: 'Semillas de Zanahoria', category: 'recursos', rarity: 'poco_comun',
      sellValue: 4, buyValue: 12, source: 'Mercado, cofres y cosechas',
      uses: 'Cultivar zanahorias nutritivas',
      desc: 'Crecen rápido y sirven para guisos de exploración.',
      plantCrop: 'zanahoria', icon: 'seeds_carrot'
    },
    semillas_calabaza: {
      id: 'semillas_calabaza', name: 'Semillas de Calabaza', category: 'recursos', rarity: 'raro',
      sellValue: 8, buyValue: 22, source: 'Mercado y Bosque Oscuro',
      uses: 'Cultivar calabazas gigantes muy rentables',
      desc: 'Cultivo robusto de alto valor comercial.',
      plantCrop: 'calabaza', icon: 'seeds_pumpkin'
    },
    semillas_cristal: {
      id: 'semillas_cristal', name: 'Esporas de Cristal', category: 'recursos', rarity: 'epico',
      sellValue: 18, buyValue: 50, source: 'Mercado avanzado y Montañas Heladas',
      uses: 'Cultivar flores de cristal que producen gemas',
      desc: 'Semilla arcana que absorbe energía del suelo.',
      plantCrop: 'flor_cristal', icon: 'seeds_crystal'
    },
    trigo: {
      id: 'trigo', name: 'Trigo', category: 'recursos', rarity: 'comun',
      sellValue: 4, buyValue: 10, source: 'Cosecha agrícola y granjas',
      uses: 'Moler en harina y alimentar corrales',
      desc: 'Espigas doradas listas para el molino.',
      icon: 'wheat'
    },
    zanahoria: {
      id: 'zanahoria', name: 'Zanahoria', category: 'comida', rarity: 'poco_comun',
      sellValue: 8, buyValue: 20, source: 'Agricultura',
      uses: 'Consumo directo y cocina',
      desc: 'Hortaliza crujiente llena de vitalidad.',
      healHp: 14, healEnergy: 26, icon: 'carrot'
    },
    calabaza: {
      id: 'calabaza', name: 'Calabaza', category: 'comida', rarity: 'raro',
      sellValue: 18, buyValue: 42, source: 'Agricultura',
      uses: 'Venta lucrativa y pasteles en cocina',
      desc: 'Calabaza anaranjada de gran tamaño.',
      healHp: 22, healEnergy: 35, icon: 'pumpkin'
    },
    flor_cristal: {
      id: 'flor_cristal', name: 'Flor de Cristal', category: 'recursos', rarity: 'epico',
      sellValue: 42, buyValue: 105, source: 'Cultivo mágico',
      uses: 'Alquimia y obtención de cristales mágicos',
      desc: 'Planta luminosa cuyos pétalos son puro cuarzo.',
      icon: 'crystal_flower'
    },
    harina: {
      id: 'harina', name: 'Harina', category: 'materiales', rarity: 'comun',
      sellValue: 7, buyValue: 18, source: 'Molino (Trigo)',
      uses: 'Hornear pan y raciones en la Cocina',
      desc: 'Polvo fino molido en piedra.',
      icon: 'flour'
    },
    lana: {
      id: 'lana', name: 'Lana', category: 'recursos', rarity: 'poco_comun',
      sellValue: 8, buyValue: 20, source: 'Ovejas y Corrales',
      uses: 'Tela en telar y abrigos helados',
      desc: 'Vellón esponjoso muy cálido.',
      icon: 'wool'
    },
    carne: {
      id: 'carne', name: 'Carne Fresca', category: 'comida', rarity: 'poco_comun',
      sellValue: 9, buyValue: 22, source: 'Animales, lobos y corrales',
      uses: 'Cocinar filetes asados en Cocina/Horno',
      desc: 'Corte fresco que conviene cocinar antes de comer.',
      healHp: 10, healEnergy: 15, icon: 'meat'
    },
    huevo: {
      id: 'huevo', name: 'Huevo de Granja', category: 'comida', rarity: 'comun',
      sellValue: 6, buyValue: 14, source: 'Granja y Corral',
      uses: 'Cocina y venta directa',
      desc: 'Huevo fresco de granja.',
      healHp: 8, healEnergy: 14, icon: 'egg'
    },
    leche: {
      id: 'leche', name: 'Jarra de Leche', category: 'comida', rarity: 'poco_comun',
      sellValue: 10, buyValue: 24, source: 'Granja',
      uses: 'Cocina y pociones calmantes',
      desc: 'Leche fresca rica en nutrientes.',
      healHp: 16, healEnergy: 25, icon: 'milk'
    },
    hongo_luminoso: {
      id: 'hongo_luminoso', name: 'Hongo Luminoso', category: 'recursos', rarity: 'poco_comun',
      sellValue: 11, buyValue: 28, source: 'Bosque Oscuro',
      uses: 'Sopa de hongos y pociones de maná',
      desc: 'Seta bioluminiscente de esporas violetas.',
      icon: 'mushroom'
    },
    cactus: {
      id: 'cactus', name: 'Fruto de Cactus', category: 'comida', rarity: 'poco_comun',
      sellValue: 9, buyValue: 22, source: 'Cactus del Desierto',
      uses: 'Hidratación, fibra y cocina desértica',
      desc: 'Pulpa jugosa que calma la sed del desierto.',
      healHp: 14, healEnergy: 28, icon: 'cactus'
    },

    // === PESCA ===
    pez_comun: {
      id: 'pez_comun', name: 'Pez Plateado', category: 'comida', rarity: 'comun',
      sellValue: 8, buyValue: 20, source: 'Pesca en aguas tranquilas y estanques',
      uses: 'Cocina o venta en mercado',
      desc: 'Pez ágil común en las costas del archipiélago.',
      healHp: 12, healEnergy: 20, icon: 'fish_common'
    },
    pez_abismal: {
      id: 'pez_abismal', name: 'Pez Linterna Abismal', category: 'especiales', rarity: 'epico',
      sellValue: 55, buyValue: 130, source: 'Pesca en Bosque Oscuro',
      uses: 'Alquimia nocturna y colección',
      desc: 'Brilla en aguas profundas con un farol natural.',
      icon: 'fish_dark'
    },
    pez_helado: {
      id: 'pez_helado', name: 'Salmón Glacial', category: 'comida', rarity: 'raro',
      sellValue: 38, buyValue: 90, source: 'Pesca en Montañas Heladas',
      uses: 'Cocina de resistencia y venta',
      desc: 'Conservado naturalmente por corrientes polares.',
      healHp: 40, healEnergy: 55, icon: 'fish_ice'
    },
    pez_lava: {
      id: 'pez_lava', name: 'Anguila de Magma', category: 'especiales', rarity: 'legendario',
      sellValue: 110, buyValue: 250, source: 'Pesca con caña cristal/legendaria en Tierras Volcánicas',
      uses: 'Elixir ígneo y colección legendaria',
      desc: 'Nada entre brasas fundidas sin quemarse.',
      icon: 'fish_lava'
    },
    pez_dorado_solar: {
      id: 'pez_dorado_solar', name: 'Pez Dorado Solar', category: 'comida', rarity: 'raro',
      sellValue: 60, buyValue: 140, source: 'Pesca en oasis y costas del Desierto',
      uses: 'Alta cocina y regeneración de resistencia',
      desc: 'Escamas doradas que reflejan la luz del sol ardiente.',
      healHp: 55, healEnergy: 70, icon: 'fish_gold'
    },
    esturion_glacial: {
      id: 'esturion_glacial', name: 'Esturión Glacial Primordial', category: 'especiales', rarity: 'epico',
      sellValue: 95, buyValue: 220, source: 'Pesca en aguas congeladas de Montañas Heladas',
      uses: 'Platos maestros y tónicos de hielo',
      desc: 'Pez acorazado con escamas duras como el permafrost.',
      healHp: 75, healEnergy: 90, icon: 'fish_ice'
    },
    anguila_sombras: {
      id: 'anguila_sombras', name: 'Anguila de las Sombras', category: 'especiales', rarity: 'epico',
      sellValue: 90, buyValue: 210, source: 'Pesca nocturna en Bosque Oscuro',
      uses: 'Alquimia arcana y preparación de venenos',
      desc: 'Se desliza sin dejar rastro en aguas tenebrosas.',
      healHp: 65, healEnergy: 85, icon: 'fish_shadow'
    },
    pez_fenix_magma: {
      id: 'pez_fenix_magma', name: 'Pez Fénix de Magma', category: 'especiales', rarity: 'legendario',
      sellValue: 150, buyValue: 350, source: 'Pesca legendaria en Tierras Volcánicas',
      uses: 'Platos supremos y reactivos místicos',
      desc: 'Emite un calor abrasador y renace en lava volcánica.',
      healHp: 110, healEnergy: 130, icon: 'fish_phoenix'
    },
    pez_legendario_kraken: {
      id: 'pez_legendario_kraken', name: 'Kraken Abisal Juvenil', category: 'especiales', rarity: 'legendario',
      sellValue: 240, buyValue: 550, source: 'Pesca en anomalías y aguas profundas con Cebo Arcano',
      uses: 'Trofeo marino supremo y elixires míticos',
      desc: 'Criatura mítica temida por marineros de todos los biomas.',
      healHp: 160, healEnergy: 180, icon: 'fish_legendary'
    },
    cebo_arcano: {
      id: 'cebo_arcano', name: 'Cebo Arcano Magistral', category: 'especiales', rarity: 'epico',
      sellValue: 45, buyValue: 110, source: 'Mesa de Alquimia (Cebo + Esencia Arcana)',
      uses: 'Atrae peces legendarios con +80% probabilidad',
      desc: 'Señuelo encantado con luminiscencia marina irresistible.',
      icon: 'worm_bait'
    },
    cebo_volcanico: {
      id: 'cebo_volcanico', name: 'Cebo Ígneo de Magma', category: 'especiales', rarity: 'epico',
      sellValue: 50, buyValue: 120, source: 'Forja / Alquimia (Cebo + Esencia Magma)',
      uses: 'Resiste la lava volcánica y atrae peces de fuego',
      desc: 'Impregnado con azufre y núcleos de calor volcánico.',
      icon: 'worm_bait'
    },
    sashimi_glacial: {
      id: 'sashimi_glacial', name: 'Sashimi Glacial Sublime', category: 'comida', rarity: 'epico',
      sellValue: 85, buyValue: 190, source: 'Cocina (Esturión Glacial + Algas + Hielo)',
      uses: 'Restaura +95 HP y +110 Energía',
      desc: 'Cortes finos y frescos servidos sobre escarcha marina pura.',
      healHp: 95, healEnergy: 110, icon: 'fish_cooked'
    },
    estofado_marino_supremo: {
      id: 'estofado_marino_supremo', name: 'Cazuela Imperial del Océano', category: 'comida', rarity: 'legendario',
      sellValue: 140, buyValue: 310, source: 'Cocina (Pez Dorado Solar + Cangrejo + Trigo)',
      uses: 'Restaura +150 HP y +150 Energía',
      desc: 'Manjar de reyes elaborado con los mejores tesoros marinos.',
      healHp: 150, healEnergy: 150, icon: 'stew'
    },
    brocheta_magma: {
      id: 'brocheta_magma', name: 'Brocheta Ígnea de Fénix', category: 'comida', rarity: 'legendario',
      sellValue: 160, buyValue: 360, source: 'Cocina (Pez Fénix + Carbón + Chile)',
      uses: 'Restaura +180 HP y otorga inmunidad al frío temporal',
      desc: 'Asado a temperaturas volcánicas extremas con sabor explosivo.',
      healHp: 180, healEnergy: 160, icon: 'fish_cooked'
    },
    viga_madera: {
      id: 'viga_madera', name: 'Viga de Madera Estructural', category: 'materiales', rarity: 'comun',
      sellValue: 16, buyValue: 38, source: 'Aserradero (Tablón x4 + Lingote Hierro x1)',
      uses: 'Construcción de edificios avanzados y refuerzos',
      desc: 'Madero macizo ensamblado para sostener grandes estructuras.',
      icon: 'wood_beam'
    },
    madera_refinada: {
      id: 'madera_refinada', name: 'Madera Refinada y Barnizada', category: 'materiales', rarity: 'poco_comun',
      sellValue: 28, buyValue: 65, source: 'Aserradero (Tablón x6 + Resina x2)',
      uses: 'Muebles de precisión, máquinas y arcos superiores',
      desc: 'Madera noble tratada contra la humedad y el desgaste.',
      icon: 'wood_refined'
    },
    cuerda: {
      id: 'cuerda', name: 'Cuerda Resistente', category: 'materiales', rarity: 'comun',
      sellValue: 8, buyValue: 20, source: 'Telar (Fibra Vegetal x3)',
      uses: 'Aparejos de pesca, puentes colgantes y arcos',
      desc: 'Cordel trenzado de fibras duraderas de alta tensión.',
      icon: 'rope'
    },
    tela_reforzada: {
      id: 'tela_reforzada', name: 'Tela Reforzada', category: 'materiales', rarity: 'poco_comun',
      sellValue: 32, buyValue: 75, source: 'Telar (Tela x3 + Cuero x2)',
      uses: 'Armaduras de tela, capas y mochilas de expedición',
      desc: 'Tejido denso reforzado con capas flexibles de cuero.',
      icon: 'cloth_heavy'
    },
    armadura_tela: {
      id: 'armadura_tela', name: 'Túnica de Tejedor Reforzada', category: 'armaduras', rarity: 'poco_comun',
      equipSlot: 'armor', sellValue: 60, buyValue: 145, source: 'Telar (Tela Reforzada x4 + Lana x3)',
      uses: 'Armadura ligera (+18 Defensa, +20 Energía)',
      desc: 'Túnica artesanal flexible que facilita el movimiento y la magia.',
      stats: { def: 18, maxEnergy: 20 }, icon: 'armor_cloth'
    },
    pantalones_cuero: {
      id: 'pantalones_cuero', name: 'Pantalones de Cuero', category: 'armaduras', rarity: 'comun',
      equipSlot: 'legs', sellValue: 25, buyValue: 60, source: 'Telar / Forja',
      uses: 'Equipamiento inferior (+8 Defensa)',
      desc: 'Pantalones resistentes cosidos a mano con perneras de cuero auténtico.',
      stats: { def: 8 }, icon: 'leggings_leather'
    },
    pantalones_hierro: {
      id: 'pantalones_hierro', name: 'Pantalones de Hierro', category: 'armaduras', rarity: 'poco_comun',
      equipSlot: 'legs', sellValue: 55, buyValue: 130, source: 'Forja',
      uses: 'Equipamiento inferior (+22 Defensa)',
      desc: 'Grebas de hierro forjado que protegen las piernas.',
      stats: { def: 22 }, icon: 'leggings_iron'
    },
    pantalones_acero: {
      id: 'pantalones_acero', name: 'Pantalones de Acero Glacial', category: 'armaduras', rarity: 'raro',
      equipSlot: 'legs', sellValue: 110, buyValue: 260, source: 'Forja / Yunque Rúnico',
      uses: 'Equipamiento inferior (+42 Defensa, +10% Resistencia)',
      desc: 'Placas templadas contra frío y golpes contundentes.',
      stats: { def: 42, moveSpeed: 0.05 }, icon: 'leggings_steel'
    },
    mochila_cuero: {
      id: 'mochila_cuero', name: 'Mochila de Cuero Rústica', category: 'equipamiento', rarity: 'poco_comun',
      equipSlot: 'backpack', backpackTier: 1, sellValue: 60, buyValue: 140, source: 'Telar / Mesa de Artesanías',
      uses: 'Expansión de Inventario (+15 Slots y +25 Capacidad de Stack)',
      desc: 'Mochila espaciosa de piel curtida que expande el límite de carga y apilado.',
      backpackBonus: { slots: 15, stack: 25 }, icon: 'mochila_cuero'
    },
    mochila_reforzada: {
      id: 'mochila_reforzada', name: 'Mochila Reforzada con Placas', category: 'equipamiento', rarity: 'raro',
      equipSlot: 'backpack', backpackTier: 2, sellValue: 180, buyValue: 420, source: 'Telar / Forja',
      uses: 'Expansión de Inventario (+20 Slots y +25 Capacidad de Stack)',
      desc: 'Costuras de hilo reforzado y remaches metálicos para transportar grandes cargas.',
      backpackBonus: { slots: 20, stack: 25 }, icon: 'mochila_reforzada'
    },
    mochila_astral: {
      id: 'mochila_astral', name: 'Mochila Dimensional Astral', category: 'equipamiento', rarity: 'epico',
      equipSlot: 'backpack', backpackTier: 3, sellValue: 500, buyValue: 1200, source: 'Mesa de Hechicería / Forja',
      uses: 'Expansión de Inventario (+25 Slots y +25 Capacidad de Stack)',
      desc: 'Artefacto imbuido con magia espacial que dobla el espacio interior hasta 100 de stack y 80 slots.',
      backpackBonus: { slots: 25, stack: 25 }, icon: 'mochila_astral'
    },
    lingote_bronce: {
      id: 'lingote_bronce', name: 'Lingote de Bronce Antiguo', category: 'minerales', rarity: 'comun',
      sellValue: 24, buyValue: 58, source: 'Horno (Cobre x2 + Estaño x1)',
      uses: 'Forja de herramientas tempranas y piezas de precisión',
      desc: 'Aleación milenaria de cobre y estaño.',
      icon: 'ingot_copper'
    },
    aleacion_ignea: {
      id: 'aleacion_ignea', name: 'Aleación Ígnea Volcánica', category: 'minerales', rarity: 'epico',
      sellValue: 120, buyValue: 280, source: 'Fundición (Lingote Acero x2 + Material Volcánico x4)',
      uses: 'Herramientas de oricalco y armaduras refractarias',
      desc: 'Metal abrasador que retiene el calor de la magma.',
      icon: 'ingot_fire'
    },
    aleacion_celestial: {
      id: 'aleacion_celestial', name: 'Aleación Celestial Sublime', category: 'minerales', rarity: 'legendario',
      sellValue: 260, buyValue: 600, source: 'Fundición (Lingote Celestial x2 + Polvo Estelar x4)',
      uses: 'Armas míticas y forja de artefactos supremos',
      desc: 'Forjada con energía de estrellas caídas.',
      icon: 'ingot_celestial'
    },
    esencia_corrupta: {
      id: 'esencia_corrupta', name: 'Esencia del Vacío Corrupto', category: 'especiales', rarity: 'legendario',
      sellValue: 220, buyValue: 500, source: 'Jefes y monstruos en Mazmorras Corruptas',
      uses: 'Forja de equipamiento supremo y purificación de reliquias',
      desc: 'Materia oscura fluctuante extraída del corazón de dungeons corruptas.',
      icon: 'dark_essence'
    },
    gema_vacio: {
      id: 'gema_vacio', name: 'Gema del Vacío Primordial', category: 'gemas', rarity: 'legendario',
      sellValue: 350, buyValue: 800, source: 'Cofres de jefes en Mazmorras Corruptas',
      uses: 'Engarces supremos y recetas definitivas de endgame',
      desc: 'Cristal hiperdenso que dobla la luz a su alrededor.',
      icon: 'abyssal_crystal'
    },
    reliquia_vacio: {
      id: 'reliquia_vacio', name: 'Corazón del Vacío Corrompido', category: 'reliquias', rarity: 'legendario',
      sellValue: 500, buyValue: 1200, source: 'Completar las 24 Mazmorras Corruptas',
      uses: 'Reliquia legendaria activa: +40% Daño, +25% Defensa, +20% Velocidad',
      desc: 'El poder absoluto del abismo domado por el conquistador.',
      stats: { dmgBonus: 0.40, def: 50, moveSpeed: 0.20 }, icon: 'relic_abyss'
    },

    // === COMIDA COCINADA & POCIONES ===
    pan: {
      id: 'pan', name: 'Pan Recién Horneado', category: 'comida', rarity: 'comun',
      sellValue: 14, buyValue: 32, source: 'Cocina (Harina)',
      uses: 'Recupera bastante salud y energía al instante',
      desc: 'Corteza crujiente y miga tibia.',
      healHp: 30, healEnergy: 55, icon: 'bread'
    },
    filete: {
      id: 'filete', name: 'Filete Asado', category: 'comida', rarity: 'poco_comun',
      sellValue: 22, buyValue: 50, source: 'Cocina (Carne + Carbón)',
      uses: 'Gran recuperación de vida para combate y mazmorras',
      desc: 'Jugoso asado que fortalece al aventurero.',
      healHp: 55, healEnergy: 65, icon: 'steak'
    },
    estofado_bayas: {
      id: 'estofado_bayas', name: 'Estofado Real', category: 'comida', rarity: 'raro',
      sellValue: 36, buyValue: 82, source: 'Cocina (Zanahoria + Carne + Bayas)',
      uses: 'Restaura casi toda la vida y energía',
      desc: 'Plato completo de aventurero veterano.',
      healHp: 90, healEnergy: 95, icon: 'stew'
    },
    pocion_vida: {
      id: 'pocion_vida', name: 'Elixir Carmesí', category: 'comida', rarity: 'raro',
      sellValue: 40, buyValue: 95, source: 'Alquimia',
      uses: 'Curación instantánea en medio de combate',
      desc: 'Frasco alquímico que cierra heridas en segundos.',
      healHp: 110, healEnergy: 40, icon: 'potion_hp'
    },
    pocion_velocidad: {
      id: 'pocion_velocidad', name: 'Tónico de Viento', category: 'comida', rarity: 'raro',
      sellValue: 45, buyValue: 105, source: 'Alquimia',
      uses: 'Aumenta +35% velocidad de movimiento y ataque durante 45s',
      desc: 'Efervescencia celeste que aligera tus pasos.',
      healHp: 15, healEnergy: 60, buff: { type: 'speed', mult: 1.35, duration: 45 }, icon: 'potion_spd'
    },
    pocion_suerte: {
      id: 'pocion_suerte', name: 'Elixir de Fortuna', category: 'comida', rarity: 'epico',
      sellValue: 65, buyValue: 150, source: 'Alquimia',
      uses: 'Duplica probabilidad de botín raro y gemas durante 60s',
      desc: 'Destila polvo de estrellas y esmeralda.',
      healHp: 20, healEnergy: 50, buff: { type: 'luck', mult: 1.8, duration: 60 }, icon: 'potion_luck'
    },

    // === EQUIPAMIENTO & ESPECIALES ===
    armadura_cuero: {
      id: 'armadura_cuero', name: 'Capa de Explorador (T1)', category: 'equipamiento', rarity: 'comun', tier: 1,
      sellValue: 45, buyValue: 110, source: 'Telar / Mano (Cuero + Tela)',
      uses: 'Equipa en Armadura (Tier 1): +4 Defensa y +15 Vida Máx',
      desc: 'Abrigo clásico de los viajeros de Balaclava.',
      equipSlot: 'armor', stats: { def: 4, maxHp: 15 }, icon: 'armor_leather'
    },
    armadura_hierro: {
      id: 'armadura_hierro', name: 'Cota de Hierro (T4)', category: 'equipamiento', rarity: 'poco_comun', tier: 4,
      sellValue: 110, buyValue: 260, source: 'Forja (Armadura Cobre + Lingote Hierro)',
      uses: 'Equipa en Armadura (Tier 4): +12 Defensa y +42 Vida Máx (Encantable)',
      desc: 'Placas remachadas capaces de resistir mazmorras.',
      equipSlot: 'armor', stats: { def: 12, maxHp: 42 }, icon: 'armor_iron'
    },
    armadura_oro: {
      id: 'armadura_oro', name: 'Coraza Dorada Real (T6)', category: 'equipamiento', rarity: 'raro', tier: 6,
      sellValue: 175, buyValue: 390, source: 'Forja (Armadura Plata + Lingote Oro)',
      uses: 'Equipa en Armadura (Tier 6): +18 Defensa, +68 Vida Máx y +12% Suerte/Oro',
      desc: 'Armadura ceremonial forjada con lingotes de oro bruñido que atrae fortuna.',
      equipSlot: 'armor', stats: { def: 18, maxHp: 68, luckPct: 0.12, coinPct: 0.12 }, icon: 'armor_gold'
    },
    armadura_cristal: {
      id: 'armadura_cristal', name: 'Égida de Cristal (T9)', category: 'equipamiento', rarity: 'epico', tier: 9,
      sellValue: 240, buyValue: 550, source: 'Forja (Armadura Acero + Cristales Mágicos)',
      uses: 'Equipa en Armadura (Tier 9): +30 Defensa, +115 Vida Máx y +12% Daño',
      desc: 'Armadura refractaria forjada con gemas arcanas.',
      equipSlot: 'armor', stats: { def: 30, maxHp: 115, dmgPct: 0.12 }, icon: 'armor_crystal'
    },
    armadura_volcanica: {
      id: 'armadura_volcanica', name: 'Manto de Balaclava (T14)', category: 'equipamiento', rarity: 'legendario', tier: 14,
      sellValue: 500, buyValue: 1200, source: 'Forja Legendaria (Armadura Oricalco + Material Volcánico)',
      uses: 'Equipa en Armadura (Tier 14): +60 Defensa, +250 Vida Máx, +24% Daño y +14% Velocidad',
      desc: 'Reliquia suprema tejida con mitrilo, obsidiana y fuego ancestral.',
      equipSlot: 'armor', stats: { def: 60, maxHp: 250, dmgPct: 0.24, speedPct: 0.14 }, icon: 'armor_legend'
    },
    anillo_mercader: {
      id: 'anillo_mercader', name: 'Anillo del Mercader', category: 'equipamiento', rarity: 'raro',
      sellValue: 90, buyValue: 220, source: 'Mercado / Tesoros',
      uses: 'Equipa en accesorio para +20% monedas obtenidas',
      desc: 'Sello áureo que multiplica tus ganancias.',
      equipSlot: 'relic', stats: { coinPct: 0.20 }, icon: 'ring_gold'
    },
    amuleto_imantado: {
      id: 'amuleto_imantado', name: 'Amuleto Magnético', category: 'equipamiento', rarity: 'epico',
      sellValue: 180, buyValue: 420, source: 'Laboratorio / Mazmorras',
      uses: 'Equipa en accesorio para duplicar alcance de recogida y +20% recolección',
      desc: 'Atrae minerales y monedas hacia ti como un imán.',
      equipSlot: 'relic', stats: { magnetRadius: 110, gatherPct: 0.20 }, icon: 'amulet'
    },
    llave_mazmorra: {
      id: 'llave_mazmorra', name: 'Llave Ancestral', category: 'especiales', rarity: 'raro',
      sellValue: 75, buyValue: 180, source: 'Forja, cofres y mercado',
      uses: 'Abre cofres sellados y desbloquea cámaras de jefes',
      desc: 'Llave grabada con glifos de las islas perdidas.',
      icon: 'key'
    },
    nucleo_balaclava: {
      id: 'nucleo_balaclava', name: 'Corazón de Balaclava', category: 'especiales', rarity: 'legendario',
      sellValue: 1500, buyValue: 9999, source: 'Completar las 5 Mazmorras y forjar la Reliquia Final',
      uses: 'Restaura la armonía del archipiélago y desbloquea el modo Infinito Dorado',
      desc: 'El artefacto legendario que unifica los cinco biomas del mundo.',
      icon: 'balaclava_core'
    },

    // =========================================================
    // EXPANSIÓN MASIVA: MINERALES, ALEACIONES Y GEMAS
    // =========================================================
    plata: {
      id: 'plata', name: 'Mena de Plata', category: 'minerales', rarity: 'poco_comun',
      sellValue: 9, buyValue: 22, source: 'Vetas plateadas y cantera',
      uses: 'Fundición de lingotes de plata y encantamientos', desc: 'Mineral brillante con afinidad lunar.', icon: 'ore_silver'
    },
    lingote_plata: {
      id: 'lingote_plata', name: 'Lingote de Plata', category: 'minerales', rarity: 'raro',
      sellValue: 24, buyValue: 56, source: 'Horno (Mena de Plata + Carbón)',
      uses: 'Forja de joyería arcana, escudos y encantamientos', desc: 'Barra pura de plata conducida por runas.', icon: 'bar_silver'
    },
    mitrilo_bruto: {
      id: 'mitrilo_bruto', name: 'Mena de Mitrilo', category: 'minerales', rarity: 'epico',
      sellValue: 26, buyValue: 64, source: 'Vetas profundas en Montañas Heladas y Volcán',
      uses: 'Fundición de Mitrilo Puro y equipo épico', desc: 'Metal feérico más ligero y duro que el acero.', icon: 'ore_mithril'
    },
    adamantita: {
      id: 'adamantita', name: 'Mena de Adamantita', category: 'minerales', rarity: 'epico',
      sellValue: 34, buyValue: 82, source: 'Tierras Volcánicas y Mazmorras',
      uses: 'Forja de Lingotes de Adamantita para equipo supremo', desc: 'Roca escarlata casi indestructible.', icon: 'ore_adamantite'
    },
    lingote_adamantita: {
      id: 'lingote_adamantita', name: 'Lingote de Adamantita', category: 'minerales', rarity: 'legendario',
      sellValue: 95, buyValue: 230, source: 'Fundición (Adamantita + Mitrilo)',
      uses: 'Forja de armamento legendario', desc: 'Acero carmesí templado en fuego antiguo.', icon: 'bar_adamantite'
    },
    azufre: {
      id: 'azufre', name: 'Azufre Volcánico', category: 'minerales', rarity: 'poco_comun',
      sellValue: 7, buyValue: 18, source: 'Cantera, Tierras Volcánicas y minas',
      uses: 'Fabricación de pólvora, bombas y alquimia', desc: 'Polvo amarillo de olor intenso altamente reactivo.', icon: 'sulfur'
    },
    salitre: {
      id: 'salitre', name: 'Salitre Mineral', category: 'minerales', rarity: 'poco_comun',
      sellValue: 7, buyValue: 18, source: 'Excavación en cuevas, desierto y cantera',
      uses: 'Pólvora y fertilizante mineral', desc: 'Cristales salinos recogidos de cavernas.', icon: 'saltpeter'
    },
    polvora: {
      id: 'polvora', name: 'Pólvora Refinada', category: 'minerales', rarity: 'raro',
      sellValue: 20, buyValue: 48, source: 'Alquimia / Taller (Azufre + Salitre + Carbón)',
      uses: 'Munición de balista y bombas mineras', desc: 'Mezcla explosiva lista para demoler rocas.', icon: 'gunpowder'
    },
    rubi: {
      id: 'rubi', name: 'Rubí Carmesí', category: 'gemas', rarity: 'epico',
      sellValue: 68, buyValue: 165, source: 'Geodas ígneas, jefes y minería rara',
      uses: 'Amuletos de furia y encantamientos ofensivos', desc: 'Gema ardiente que late con poder marcial.', icon: 'gem_ruby'
    },
    zafiro: {
      id: 'zafiro', name: 'Zafiro Glacial', category: 'gemas', rarity: 'epico',
      sellValue: 65, buyValue: 158, source: 'Montañas Heladas y tesoros',
      uses: 'Escudos, coronas y hechizos arcanos', desc: 'Cristal azul profundo tan frío como el norte.', icon: 'gem_sapphire'
    },
    amatista: {
      id: 'amatista', name: 'Amatista Umbría', category: 'gemas', rarity: 'raro',
      sellValue: 46, buyValue: 112, source: 'Bosque Oscuro y geodas',
      uses: 'Encantamientos nocturnos y pergaminos', desc: 'Cuarzo violeta resonante con magia espiritual.', icon: 'gem_amethyst'
    },
    topacio: {
      id: 'topacio', name: 'Topacio Solar', category: 'gemas', rarity: 'raro',
      sellValue: 44, buyValue: 108, source: 'Desierto y cofres del templo',
      uses: 'Joyería mercantil y faros costeros', desc: 'Piedra dorada que concentra la luz del mediodía.', icon: 'gem_topaz'
    },
    polvo_estelar: {
      id: 'polvo_estelar', name: 'Polvo Estelar', category: 'gemas', rarity: 'legendario',
      sellValue: 110, buyValue: 260, source: 'Meteoritos, pesca nocturna y alta investigación',
      uses: 'Pociones míticas, encantamientos y reliquias', desc: 'Chispas cósmicas caídas del firmamento.', icon: 'stardust'
    },

    // =========================================================
    // SEMILLAS Y 6 NUEVAS ESPECIES DE CULTIVO + GRANJA
    // =========================================================
    semillas_tomate: {
      id: 'semillas_tomate', name: 'Semillas de Tomate', category: 'semillas', rarity: 'comun',
      sellValue: 4, buyValue: 11, source: 'Mercado o artesanía (Mano)',
      uses: 'Planta en tierra arada con Azada para cultivar Tomates', desc: 'Semillas rojas de huerta mediterránea.',
      plantCrop: 'tomate', icon: 'seeds_tomato'
    },
    semillas_papa: {
      id: 'semillas_papa', name: 'Semillas de Patata', category: 'semillas', rarity: 'comun',
      sellValue: 4, buyValue: 12, source: 'Arando tierra, Mercado o artesanía (Mano)',
      uses: 'Planta en tierra arada con Azada para cultivar Patatas Doradas', desc: 'Brotes de tubérculo muy resistentes y rendidores.',
      plantCrop: 'papa', icon: 'seeds_potato'
    },
    semillas_maiz: {
      id: 'semillas_maiz', name: 'Semillas de Maíz', category: 'semillas', rarity: 'comun',
      sellValue: 5, buyValue: 13, source: 'Mercado o cosecha de maíz',
      uses: 'Planta en tierra arada con Azada para cultivar Maíz Dorado', desc: 'Granos amarillos muy productivos.',
      plantCrop: 'maiz', icon: 'seeds_corn'
    },
    semillas_berenjena: {
      id: 'semillas_berenjena', name: 'Semillas de Berenjena', category: 'semillas', rarity: 'poco_comun',
      sellValue: 7, buyValue: 17, source: 'Mercado o artesanía',
      uses: 'Planta en tierra arada para cultivar Berenjenas', desc: 'Hortaliza violeta muy nutritiva en cocina.',
      plantCrop: 'berenjena', icon: 'seeds_eggplant'
    },
    semillas_chile: {
      id: 'semillas_chile', name: 'Semillas de Chile Ígneo', category: 'semillas', rarity: 'poco_comun',
      sellValue: 9, buyValue: 22, source: 'Mercado o Desierto',
      uses: 'Planta en tierra arada para cultivar Chiles picantes', desc: 'Planta ardiente que acelera al guerrero.',
      plantCrop: 'chile', icon: 'seeds_chili'
    },
    semillas_fresa: {
      id: 'semillas_fresa', name: 'Semillas de Fresa Real', category: 'semillas', rarity: 'raro',
      sellValue: 12, buyValue: 28, source: 'Mercado o parches silvestres',
      uses: 'Planta en tierra arada para cultivar Fresas dulces', desc: 'Fruto rojo muy cotizado por panaderos y nobles.',
      plantCrop: 'fresa', icon: 'seeds_strawberry'
    },
    semillas_uva: {
      id: 'semillas_uva', name: 'Semillas de Vid Arcana', category: 'semillas', rarity: 'raro',
      sellValue: 14, buyValue: 32, source: 'Mercado o bosques',
      uses: 'Planta en tierra arada para cultivar Uvas', desc: 'Racimos jugosos ideales para elixires y banquetes.',
      plantCrop: 'uva', icon: 'seeds_grapes'
    },
    tomate: {
      id: 'tomate', name: 'Tomate Jugoso', category: 'alimentos', rarity: 'comun',
      sellValue: 11, buyValue: 26, source: 'Cultivo (24s)',
      uses: 'Consume +14 Vida, +12 Energía o usa en Cocina', desc: 'Fruto rojo fresco de tu huerto.',
      edible: { hp: 14, energy: 12 }, icon: 'crop_tomato'
    },
    papa: {
      id: 'papa', name: 'Patata Dorada', category: 'alimentos', rarity: 'comun',
      sellValue: 12, buyValue: 28, source: 'Cultivo (25s)',
      uses: 'Consume +16 Vida, +22 Energía o prepara platos en Cocina', desc: 'Tubérculo cosechado con esmero en tierra fértil.',
      edible: { hp: 16, energy: 22 }, icon: 'crop_potato'
    },
    patatas_asadas: {
      id: 'patatas_asadas', name: 'Patatas Asadas al Horno', category: 'comida', rarity: 'poco_comun',
      sellValue: 28, buyValue: 64, source: 'Cocina (Patata + Hierba + Carbón)',
      uses: 'Consume +38 Vida y +42 Energía', desc: 'Crujientes por fuera y tiernas por dentro.',
      healHp: 38, healEnergy: 42, icon: 'food_ration'
    },
    tortilla_patata: {
      id: 'tortilla_patata', name: 'Tortilla Campestre', category: 'comida', rarity: 'raro',
      sellValue: 48, buyValue: 110, source: 'Cocina (Patata + Tomate + Queso)',
      uses: 'Consume +68 Vida, +55 Energía y vigor en combate', desc: 'Especialidad gastronómica del archipiélago.',
      healHp: 68, healEnergy: 55, icon: 'food_pastry'
    },
    maiz: {
      id: 'maiz', name: 'Mazorca de Maíz', category: 'alimentos', rarity: 'comun',
      sellValue: 13, buyValue: 30, source: 'Cultivo (34s)',
      uses: 'Consume +16 Energía, +10 Vida o muele en el Molino', desc: 'Doble mazorca dorada recién cosechada.',
      edible: { hp: 10, energy: 16 }, icon: 'crop_corn'
    },
    berenjena: {
      id: 'berenjena', name: 'Berenjena Morada', category: 'alimentos', rarity: 'poco_comun',
      sellValue: 18, buyValue: 42, source: 'Cultivo (38s)',
      uses: 'Consume +18 Vida, +16 Energía o cocina guisos', desc: 'Berenjena tersa rica en vitalidad.',
      edible: { hp: 18, energy: 16 }, icon: 'crop_eggplant'
    },
    chile: {
      id: 'chile', name: 'Chile Picante', category: 'alimentos', rarity: 'poco_comun',
      sellValue: 22, buyValue: 50, source: 'Cultivo (40s)',
      uses: 'Consume +10 Vida y +25 Energía picante instantánea', desc: 'Pimiento especiado que despierta el fuego interior.',
      edible: { hp: 10, energy: 25 }, icon: 'crop_chili'
    },
    fresa: {
      id: 'fresa', name: 'Fresa Dulce', category: 'alimentos', rarity: 'raro',
      sellValue: 28, buyValue: 64, source: 'Cultivo (45s)',
      uses: 'Consume +28 Vida y +24 Energía', desc: 'Baya aromática cultivada con esmero.',
      edible: { hp: 28, energy: 24 }, icon: 'crop_strawberry'
    },
    uva: {
      id: 'uva', name: 'Racimo de Uvas', category: 'alimentos', rarity: 'raro',
      sellValue: 32, buyValue: 74, source: 'Cultivo (50s)',
      uses: 'Consume +30 Vida, +28 Energía o elabora néctares', desc: 'Racimo violeta dulce y rejuvenecedor.',
      edible: { hp: 30, energy: 28 }, icon: 'crop_grapes'
    },
    miel: {
      id: 'miel', name: 'Tarro de Miel', category: 'alimentos', rarity: 'poco_comun',
      sellValue: 24, buyValue: 54, source: 'Colmena Real',
      uses: 'Consume +32 Vida y +32 Energía, ingrediente de pasteles', desc: 'Miel dorada cosechada por abejas del archipiélago.',
      edible: { hp: 32, energy: 32 }, icon: 'honey'
    },
    cera_abeja: {
      id: 'cera_abeja', name: 'Cera de Abeja', category: 'recursos', rarity: 'poco_comun',
      sellValue: 16, buyValue: 36, source: 'Colmena Real',
      uses: 'Fabricación de velas, farolas y pergaminos sellados', desc: 'Cera aromática natural resistente al agua.', icon: 'candle'
    },
    queso: {
      id: 'queso', name: 'Queso Curado', category: 'alimentos', rarity: 'poco_comun',
      sellValue: 28, buyValue: 62, source: 'Cocina / Ahumador',
      uses: 'Consume +35 Vida y +30 Energía', desc: 'Cuña artesanal madurada en bodega.',
      edible: { hp: 35, energy: 30 }, icon: 'cheese'
    },
    baguette: {
      id: 'baguette', name: 'Baguette Dorada', category: 'alimentos', rarity: 'poco_comun',
      sellValue: 24, buyValue: 55, source: 'Cocina (Harina + Maíz)',
      uses: 'Consume +26 Vida y +45 Energía', desc: 'Pan crujiente recién horneado.',
      edible: { hp: 26, energy: 45 }, icon: 'baguette'
    },
    pastel_miel: {
      id: 'pastel_miel', name: 'Pastel de Miel y Fresas', category: 'alimentos', rarity: 'raro',
      sellValue: 62, buyValue: 135, source: 'Cocina (Harina + Miel + Fresa)',
      uses: 'Restaura +75 Vida y +65 Energía', desc: 'Manjar festivo digno de la Mesa de Banquete.',
      edible: { hp: 75, energy: 65 }, icon: 'cake'
    },
    sushi: {
      id: 'sushi', name: 'Sushi Real del Archipiélago', category: 'alimentos', rarity: 'raro',
      sellValue: 58, buyValue: 130, source: 'Cocina (Pez Azul / Dorado + Uva/Arroz)',
      uses: 'Restaura +65 Vida y +60 Energía al instante', desc: 'Bocado fresco envuelto con técnica ancestral.',
      edible: { hp: 65, energy: 60 }, icon: 'sushi'
    },
    cafe_energizante: {
      id: 'cafe_energizante', name: 'Café del Explorador', category: 'alimentos', rarity: 'raro',
      sellValue: 48, buyValue: 110, source: 'Cocina / Alquimia (Miel + Hongo + Chile)',
      uses: '+95 Energía instantánea y buff temporal de velocidad', desc: 'Infusión humeante que elimina todo cansancio.',
      edible: { hp: 18, energy: 95, speedBoost: 20 }, icon: 'coffee'
    },
    manzana_dorada: {
      id: 'manzana_dorada', name: 'Manzana Dorada Encantada', category: 'alimentos', rarity: 'legendario',
      sellValue: 165, buyValue: 380, source: 'Cocina Suprema / Cofres raros',
      uses: 'Restaura 100% Vida y Energía (+150 HP/+120 EN)', desc: 'Fruto bañado en oro alquímico capaz de salvar en la batalla final.',
      edible: { hp: 150, energy: 120 }, icon: 'apple_gold'
    },

    // =========================================================
    // AGRICULTURA, PESCA AVANZADA Y BOTÍN MARINO
    // =========================================================
    fertilizante: {
      id: 'fertilizante', name: 'Fertilizante Orgánico', category: 'herramientas', rarity: 'poco_comun',
      sellValue: 14, buyValue: 32, source: 'Cocina / Alquimia / Mano',
      uses: 'Equipa en la barra y haz clic sobre tierra arada o cultivos (+55% crecimiento)',
      desc: 'Nutriente concentrado rico en minerales para tu huerta.',
      fertilizeEffect: { speedBonus: 0.55, yieldBonus: 0, qualityBonus: 0.2 }, icon: 'fertilizer'
    },
    abono_dorado: {
      id: 'abono_dorado', name: 'Abono Dorado Real', category: 'herramientas', rarity: 'raro',
      sellValue: 34, buyValue: 78, source: 'Alquimia / Mesa (Algas + Fertilizante + Miel)',
      uses: 'Aplícalo sobre cultivos/tierra arada (+100% velocidad y +1 cosecha garantizada)',
      desc: 'Composición dorada con algas marinas y néctar que duplica el vigor vegetal.',
      fertilizeEffect: { speedBonus: 1.0, yieldBonus: 1, qualityBonus: 0.45 }, icon: 'abono_dorado'
    },
    compost_magico: {
      id: 'compost_magico', name: 'Compost Arcano Estelar', category: 'herramientas', rarity: 'epico',
      sellValue: 64, buyValue: 145, source: 'Alquimia / Investigación (Cristales Mágicos + Polvo Estelar + Abono)',
      uses: 'Aplícalo en parcelas (+160% velocidad, +2 cosechas extra y probabilidad de gemas/semillas)',
      desc: 'Humus luminoso imbuido en magia ancestral para cosechas abundantes.',
      fertilizeEffect: { speedBonus: 1.6, yieldBonus: 2, qualityBonus: 0.75 }, icon: 'compost_magico'
    },
    algas: {
      id: 'algas', name: 'Algas Marinas', category: 'alimentos', rarity: 'comun',
      sellValue: 9, buyValue: 22, source: 'Pesca costera en cualquier bioma',
      uses: 'Consume (+8 Vida/+14 EN), prepara Sushi o fabrica Abono Dorado',
      desc: 'Cintas marinas frescas ricas en minerales del océano.',
      edible: { hp: 8, energy: 14 }, icon: 'algas'
    },
    cofre_hundido: {
      id: 'cofre_hundido', name: 'Cofre Sumergido', category: 'especiales', rarity: 'epico',
      sellValue: 140, buyValue: 340, source: 'Pesca rara de tesoros en alta mar',
      uses: 'Úsalo o haz clic desde Inventario para abrir botín marino de gemas, oro y lingotes',
      desc: 'Antiguo cofre sellado cubierto de corales rescatado del fondo oceánico.',
      openableChest: 'sunken', icon: 'cofre_hundido'
    },
    cebo_gusano: {
      id: 'cebo_gusano', name: 'Cebo Vivo', category: 'especiales', rarity: 'comun',
      sellValue: 6, buyValue: 15, source: 'Artesanía (Mano) o excavación',
      uses: 'Se consume al pescar para atraer peces más rápido (+35% pique)', desc: 'Lombriz fresca ideal para pescar en cualquier costa.', icon: 'worm_bait'
    },
    cebo_dorado: {
      id: 'cebo_dorado', name: 'Señuelo Dorado Real', category: 'especiales', rarity: 'raro',
      sellValue: 36, buyValue: 82, source: 'Taller / Forja (Lingote Oro + Cebo)',
      uses: 'Disminuye mucho la espera de pesca y duplica probabilidad de tesoros raros', desc: 'Anzuelo reluciente irresistible para peces exóticos.', icon: 'gold_bait'
    },
    pez_azul: {
      id: 'pez_azul', name: 'Atún Zafiro', category: 'alimentos', rarity: 'poco_comun',
      sellValue: 22, buyValue: 50, source: 'Pesca en Pradera / Costa',
      uses: 'Cocina sushi o vende en el Mercado', desc: 'Pez ágil de lomo azul brillante.',
      edible: { hp: 18, energy: 22 }, icon: 'fish_blue'
    },
    pez_dorado: {
      id: 'pez_dorado', name: 'Carpa Dorada', category: 'alimentos', rarity: 'raro',
      sellValue: 48, buyValue: 110, source: 'Pesca avanzada en cualquier bioma',
      uses: 'Altísimo valor de venta o banquete', desc: 'Escamas doradas consideradas augurio de riqueza.',
      edible: { hp: 30, energy: 30 }, icon: 'fish_gold'
    },
    pez_payaso: {
      id: 'pez_payaso', name: 'Pez Payaso Coralino', category: 'alimentos', rarity: 'poco_comun',
      sellValue: 26, buyValue: 58, source: 'Pesca en aguas del Desierto y Costa',
      uses: 'Cocinable o vendible en Mercado', desc: 'Pequeño pez rayado de arrecifes soleados.',
      edible: { hp: 20, energy: 20 }, icon: 'fish_clown'
    },
    anguila: {
      id: 'anguila', name: 'Anguila Eléctrica', category: 'alimentos', rarity: 'raro',
      sellValue: 38, buyValue: 86, source: 'Pesca en Bosque Oscuro o nocturna',
      uses: 'Ingrediente energético o de venta', desc: 'Criatura sinuosa cargada de chispas.',
      edible: { hp: 22, energy: 38 }, icon: 'fish_eel'
    },
    cangrejo: {
      id: 'cangrejo', name: 'Cangrejo Acorazado', category: 'alimentos', rarity: 'comun',
      sellValue: 19, buyValue: 44, source: 'Pesca / Muelle Pesquero',
      uses: 'Cocina caldos o vende en Mercado', desc: 'Crustáceo de pinzas robustas.',
      edible: { hp: 20, energy: 18 }, icon: 'crab'
    },
    camaron: {
      id: 'camaron', name: 'Camarón Escarlata', category: 'alimentos', rarity: 'comun',
      sellValue: 16, buyValue: 36, source: 'Pesca / Muelle Pesquero',
      uses: 'Bocadillo marino o cebo de lujo', desc: 'Delicia marina abundante cerca de muelles.',
      edible: { hp: 16, energy: 18 }, icon: 'shrimp'
    },
    medusa: {
      id: 'medusa', name: 'Medusa Bioluminiscente', category: 'recursos', rarity: 'raro',
      sellValue: 42, buyValue: 96, source: 'Pesca nocturna y Montañas Heladas',
      uses: 'Alquimia y lámparas fluorescentes', desc: 'Brilla suavemente en la oscuridad.', icon: 'jellyfish'
    },
    pulpo: {
      id: 'pulpo', name: 'Pulpo Abisal', category: 'alimentos', rarity: 'epico',
      sellValue: 74, buyValue: 165, source: 'Pesca en aguas profundas',
      uses: 'Alimento de alta energía o venta lucrativa', desc: 'Cefalópodo astuto difícil de atrapar.',
      edible: { hp: 45, energy: 50 }, icon: 'octopus'
    },
    perla: {
      id: 'perla', name: 'Perla Marina', category: 'gemas', rarity: 'epico',
      sellValue: 88, buyValue: 198, source: 'Pesca / Ostras y Cofres Sumergidos',
      uses: 'Joyería de mar y encantamientos', desc: 'Esfera nacarada perfecta nacida bajo las olas.', icon: 'pearl'
    },
    caracola_antigua: {
      id: 'caracola_antigua', name: 'Caracola Fósil', category: 'especiales', rarity: 'raro',
      sellValue: 52, buyValue: 118, source: 'Pesca de tesoros y excavación',
      uses: 'Coleccionable muy valioso en el Mercado', desc: 'Fósil espiral de un mar prehistórico.', icon: 'shell'
    },
    bota_vieja: {
      id: 'bota_vieja', name: 'Bota Empapada', category: 'recursos', rarity: 'comun',
      sellValue: 4, buyValue: 10, source: 'Pesca accidental',
      uses: 'Recíclala en el Telar o véndela', desc: 'Alguien la perdió hace siglos.', icon: 'old_boot'
    },

    // =========================================================
    // BOTINES DE MONSTRUOS Y SUMINISTROS TÁCTICOS
    // =========================================================
    seda_arana: {
      id: 'seda_arana', name: 'Seda de Araña', category: 'monstruo', rarity: 'poco_comun',
      sellValue: 12, buyValue: 28, source: 'Arañas y Telar',
      uses: 'Capas, arcos avanzados y telas resistentes', desc: 'Hilo finísimo más tenaz que el cáñamo.', icon: 'spider_silk'
    },
    colmillo: {
      id: 'colmillo', name: 'Colmillo Bestial', category: 'monstruo', rarity: 'poco_comun',
      sellValue: 14, buyValue: 32, source: 'Lobos, Jabalíes y Cobras',
      uses: 'Dagas, armaduras de espinas y trofeos', desc: 'Diente afilado tomado de un depredador.', icon: 'fang'
    },
    cuerno_demonio: {
      id: 'cuerno_demonio', name: 'Cuerno Infernal', category: 'monstruo', rarity: 'epico',
      sellValue: 56, buyValue: 128, source: 'Imps, Demonios y Corazón Volcánico',
      uses: 'Armadura suprema y pergaminos de furia', desc: 'Cuerno retorcido aún tibio por el magma.', icon: 'demon_horn'
    },
    escamas_dragon: {
      id: 'escamas_dragon', name: 'Escama Dracónica', category: 'monstruo', rarity: 'legendario',
      sellValue: 120, buyValue: 270, source: 'Jefes elementales y cavernas profundas',
      uses: 'Forja de Casco/Coraza de Balaclava', desc: 'Placa impenetrable refractaria al fuego y hielo.', icon: 'scale_red'
    },
    bomba_mina: {
      id: 'bomba_mina', name: 'Bomba Minera', category: 'especiales', rarity: 'raro',
      sellValue: 35, buyValue: 78, consumable: true, isBomb: true,
      source: 'Taller (Pólvora + Hierro)',
      uses: 'Lanza al cursor desde inventario/barra para explotar rocas, menas y enemigos en área (110 daño)',
      desc: 'Explosivo táctico capaz de despejar vetas pesadas al instante.',
      consumableEffect: { bombRadius: 130, bombDmg: 110, fuse: 0.68, tint: '#ff7043' }, icon: 'bomb_item'
    },
    dinamita_tnt: {
      id: 'dinamita_tnt', name: 'Dinamita TNT', category: 'especiales', rarity: 'poco_comun',
      sellValue: 26, buyValue: 62, consumable: true, isBomb: true,
      source: 'Mesa de Artesanía (Carbón + Fibra + Madera)',
      uses: 'Lanza al cursor para detonar rocas, árboles, menas y monstruos en área (135 daño)',
      desc: 'Cartucho de dinamita arrojable con mecha corta y gran onda expansiva.',
      consumableEffect: { bombRadius: 150, bombDmg: 135, fuse: 0.72, tint: '#ff5252', isTnt: true }, icon: 'tnt_icon'
    },
    pocion_fuerza: {
      id: 'pocion_fuerza', name: 'Poción de Fuerza Titánica', category: 'pociones', rarity: 'raro',
      sellValue: 55, buyValue: 125, source: 'Alquimia (Rubí/Chile + Cristal + Vidrio)',
      uses: 'Consume +40% Daño cuerpo a cuerpo y arco durante 45s', desc: 'Elixir carmesí que multiplica tus golpes.',
      edible: { hp: 20, energy: 25, dmgBoost: 45 }, icon: 'potion_strength'
    },
    pergamino_furia: {
      id: 'pergamino_furia', name: 'Pergamino de Furia Solar', category: 'pociones', rarity: 'epico',
      sellValue: 72, buyValue: 165, source: 'Mesa de Encantamientos / Investigación',
      uses: '+40% Daño y +25% Velocidad durante 45s', desc: 'Conjuro rúnico que envuelve tus armas en llamas.',
      edible: { hp: 25, energy: 40, dmgBoost: 45, speedBoost: 45 }, icon: 'scroll_red'
    },
    pergamino_escudo: {
      id: 'pergamino_escudo', name: 'Pergamino de Égida Arcana', category: 'pociones', rarity: 'raro',
      sellValue: 64, buyValue: 145, source: 'Biblioteca / Alquimia',
      uses: 'Restaura +65 Vida y otorga +35% Suerte por 45s', desc: 'Runa protectora de antiguos guardianes.',
      edible: { hp: 65, energy: 35, luckBoost: 45 }, icon: 'scroll_blue'
    },

    // =========================================================
    // EQUIPO MODULAR: CASCOS, ESCUDOS, BOTAS Y JOYERÍA
    // =========================================================
    casco_hierro: {
      id: 'casco_hierro', name: 'Yelmo de Hierro (T4)', category: 'equipamiento', rarity: 'poco_comun', tier: 4,
      sellValue: 55, buyValue: 125, source: 'Forja (Casco Cobre + Hierro)',
      uses: 'Equipa en Casco (Tier 4): +7 Defensa y +28 Vida Máx', desc: 'Protege tu cabeza en exploraciones subterráneas.',
      equipSlot: 'helm', stats: { def: 7, maxHp: 28 }, icon: 'helm_iron'
    },
    casco_oro: {
      id: 'casco_oro', name: 'Corona Solar de Oro (T6)', category: 'equipamiento', rarity: 'raro', tier: 6,
      sellValue: 115, buyValue: 260, source: 'Forja (Casco Plata + Oro)',
      uses: 'Equipa en Casco (Tier 6): +11 Defensa, +44 Vida Máx y +15% Monedas', desc: 'Yelmo áureo que deslumbra a enemigos y mercaderes.',
      equipSlot: 'helm', stats: { def: 11, maxHp: 44, coinPct: 0.15 }, icon: 'helm_gold'
    },
    casco_cristal: {
      id: 'casco_cristal', name: 'Celada de Zafiro (T9)', category: 'equipamiento', rarity: 'epico', tier: 9,
      sellValue: 195, buyValue: 440, source: 'Forja (Casco Acero + Zafiro + Cristales Mágicos)',
      uses: 'Equipa en Casco (Tier 9): +18 Defensa, +72 Vida Máx y +10% Velocidad', desc: 'Yelmo encantado de visión clara.',
      equipSlot: 'helm', stats: { def: 18, maxHp: 72, speedPct: 0.10 }, icon: 'helm_crystal'
    },
    casco_balaclava: {
      id: 'casco_balaclava', name: 'Capucha Real de Balaclava (T14)', category: 'equipamiento', rarity: 'legendario', tier: 14,
      sellValue: 420, buyValue: 960, source: 'Forja Legendaria (Casco Oricalco + Escama Dracónica)',
      uses: 'Equipa en Casco (Tier 14): +36 Defensa, +155 Vida Máx, +16% Daño y +12% Crítico', desc: 'Emblema supremo de los guardianes del archipiélago.',
      equipSlot: 'helm', stats: { def: 36, maxHp: 155, dmgPct: 0.16, critBonus: 0.12 }, icon: 'helm_legend'
    },
    escudo_madera: {
      id: 'escudo_madera', name: 'Rodela de Roble (T1)', category: 'equipamiento', rarity: 'comun', tier: 1,
      sellValue: 24, buyValue: 56, source: 'Carpintería / Mano (Tablón + Hierro)',
      uses: 'Equipa en Escudo (Tier 1): +3 Defensa y +12 Vida Máx', desc: 'Escudo ligero ideal para las primeras escaramuzas.',
      equipSlot: 'shield', stats: { def: 3, maxHp: 12 }, icon: 'shield_wood'
    },
    escudo_hierro: {
      id: 'escudo_hierro', name: 'Escudo Férreo Remachado (T4)', category: 'equipamiento', rarity: 'poco_comun', tier: 4,
      sellValue: 68, buyValue: 155, source: 'Forja (Escudo Cobre + Hierro)',
      uses: 'Equipa en Escudo (Tier 4): +9 Defensa y +32 Vida Máx', desc: 'Pavés sólido capaz de bloquear flechas.',
      equipSlot: 'shield', stats: { def: 9, maxHp: 32 }, icon: 'shield_iron'
    },
    escudo_oro: {
      id: 'escudo_oro', name: 'Escudo Aúreo Bastión (T6)', category: 'equipamiento', rarity: 'raro', tier: 6,
      sellValue: 135, buyValue: 300, source: 'Forja (Escudo Plata + Oro)',
      uses: 'Equipa en Escudo (Tier 6): +14 Defensa, +50 Vida Máx y +10% Suerte', desc: 'Reluce ante la oscuridad de las criptas.',
      equipSlot: 'shield', stats: { def: 14, maxHp: 50, luckPct: 0.10 }, icon: 'shield_gold'
    },
    escudo_cristal: {
      id: 'escudo_cristal', name: 'Égida Rúnica Suprema (T9)', category: 'equipamiento', rarity: 'epico', tier: 9,
      sellValue: 260, buyValue: 590, source: 'Forja (Escudo Acero + Zafiro + Diamante)',
      uses: 'Equipa en Escudo (Tier 9): +23 Defensa, +86 Vida Máx y +10% Daño', desc: 'Barrera cristalina impenetrable.',
      equipSlot: 'shield', stats: { def: 23, maxHp: 86, dmgPct: 0.10 }, icon: 'shield_legend'
    },
    botas_cuero: {
      id: 'botas_cuero', name: 'Botas de Explorador (T1)', category: 'equipamiento', rarity: 'comun', tier: 1,
      sellValue: 32, buyValue: 74, source: 'Telar / Mano (Cuero + Tela)',
      uses: 'Equipa en Botas (Tier 1): +8% Velocidad y +2 Defensa', desc: 'Calzado cómodo para recorrer islas.',
      equipSlot: 'boots', stats: { speedPct: 0.08, def: 2 }, icon: 'boots_wood'
    },
    botas_hierro: {
      id: 'botas_hierro', name: 'Grebas de Hierro (T4)', category: 'equipamiento', rarity: 'poco_comun', tier: 4,
      sellValue: 78, buyValue: 175, source: 'Forja (Botas Cobre + Hierro)',
      uses: 'Equipa en Botas (Tier 4): +7 Defensa, +13% Velocidad y +24 Vida Máx', desc: 'Botas reforzadas para exploración subterránea.',
      equipSlot: 'boots', stats: { def: 7, speedPct: 0.13, maxHp: 24 }, icon: 'boots_iron'
    },
    botas_viento: {
      id: 'botas_viento', name: 'Botas Aladas Estelares (T14)', category: 'equipamiento', rarity: 'legendario', tier: 14,
      sellValue: 310, buyValue: 720, source: 'Forja Legendaria (Botas Oricalco + Seda + Polvo Estelar)',
      uses: 'Equipa en Botas (Tier 14): +33 Defensa, +34% Velocidad, +150 Vida y +90 imán', desc: 'Cada paso deja una estela celeste.',
      equipSlot: 'boots', stats: { def: 33, speedPct: 0.34, maxHp: 150, magnetRadius: 90, energySave: 0.20 }, icon: 'boots_legend'
    },
    anillo_vampiro: {
      id: 'anillo_vampiro', name: 'Anillo Carmesí', category: 'equipamiento', rarity: 'epico',
      sellValue: 155, buyValue: 350, source: 'Forja (Lingote Plata + Rubí)',
      uses: 'Equipa en Accesorio para +18% Daño y +35 Vida Máx', desc: 'Engaste con rubí ardiente para duelistas.',
      equipSlot: 'relic', stats: { dmgPct: 0.18, maxHp: 35 }, icon: 'ring_ruby'
    },
    amuleto_vida: {
      id: 'amuleto_vida', name: 'Amuleto de Esmeralda Viva', category: 'equipamiento', rarity: 'epico',
      sellValue: 175, buyValue: 400, source: 'Forja / Alquimia (Plata + Esmeralda + Miel)',
      uses: 'Equipa en Accesorio para +90 Vida Máx y +18% Suerte', desc: 'Pulsa con la energía vital del bosque.',
      equipSlot: 'relic', stats: { maxHp: 90, luckPct: 0.18 }, icon: 'amulet_emerald'
    },

    // =========================================================
    // BLOQUES Y DECORACIONES CONSTRUIBLES (INVENTARIO -> MUNDO)
    // =========================================================
    bloque_muro_piedra: {
      id: 'bloque_muro_piedra', name: 'Bloque: Muro de Piedra', category: 'construccion', rarity: 'comun',
      sellValue: 8, buyValue: 18, source: 'Artesanía (Mano / Forja)',
      uses: 'Úsalo o colócalo para construir murallas defensivas de piedra', desc: 'Bloque sólido que frena enemigos.',
      placeBuilding: 'muro_piedra', icon: 'prop_stone_block'
    },
    cofre_madera: {
      id: 'cofre_madera', name: 'Cofre de Madera', category: 'construccion', rarity: 'comun',
      sellValue: 8, buyValue: 20, source: 'Aserradero / Artesanía',
      uses: 'Colócalo en tu isla para tener 30 ranuras de cofre (hasta 100 objetos por stack)', desc: 'Cofre artesanal de tablones de madera con 30 ranuras de almacenamiento.',
      placeBuilding: 'cofre_madera', icon: 'chest_wood'
    },
    bloque_muro_madera: {
      id: 'bloque_muro_madera', name: 'Bloque: Empalizada', category: 'construccion', rarity: 'comun',
      sellValue: 6, buyValue: 14, source: 'Artesanía / Aserradero',
      uses: 'Úsalo para cercar y defender tus islas', desc: 'Barrera de troncos tallados.',
      placeBuilding: 'muro_madera', icon: 'palisade_wood'
    },
    bloque_valla: {
      id: 'bloque_valla', name: 'Bloque: Valla de Granja', category: 'construccion', rarity: 'comun',
      sellValue: 5, buyValue: 12, source: 'Artesanía (Madera + Tablón)',
      uses: 'Coloca lindes ordenadas alrededor de tus cultivos', desc: 'Valla de aldea pintoresca.',
      placeBuilding: 'valla_madera', icon: 'prop_fence'
    },
    bloque_camino_piedra: {
      id: 'bloque_camino_piedra', name: 'Suelo: Calzada Empedrada', category: 'construccion', rarity: 'comun',
      sellValue: 5, buyValue: 12, source: 'Artesanía (Piedra)',
      uses: 'Pavimento transitable que aumenta tu velocidad al caminar (+30%)', desc: 'Losa urbana que conecta talleres e islas.',
      placeBuilding: 'camino_piedra', icon: 'prop_cobble'
    },
    bloque_farola: {
      id: 'bloque_farola', name: 'Farola de Aldea', category: 'construccion', rarity: 'poco_comun',
      sellValue: 18, buyValue: 40, source: 'Taller / Forja',
      uses: 'Ilumina tus senderos de noche y repele sombras', desc: 'Poste de hierro forjado con farol cálido.',
      placeBuilding: 'farola_pueblo', icon: 'prop_lamppost'
    },
    bloque_brasero: {
      id: 'bloque_brasero', name: 'Brasero Eterno', category: 'construccion', rarity: 'raro',
      sellValue: 32, buyValue: 74, source: 'Forja / Albañilería',
      uses: 'Fuego perpetuo decorativo y fuente de regeneración + luz amplia', desc: 'Chimenea sagrada que jamás se apaga.',
      placeBuilding: 'brasero_eterno', icon: 'prop_fireplace'
    },
    bloque_estatua_caballero: {
      id: 'bloque_estatua_caballero', name: 'Estatua Guardiana', category: 'construccion', rarity: 'epico',
      sellValue: 75, buyValue: 170, source: 'Cantera / Forja',
      uses: 'Colócala en tu base para aura permanente de +12% Daño cercano', desc: 'Escultura tallada en mármol milenario.',
      placeBuilding: 'estatua_caballero', icon: 'prop_angel'
    },
    bloque_fuente: {
      id: 'bloque_fuente', name: 'Fuente de la Plaza', category: 'construccion', rarity: 'epico',
      sellValue: 85, buyValue: 190, source: 'Cantera / Investigación',
      uses: 'Colócala para embellecer y regenerar Vida y Energía cerca', desc: 'Pozo de piedra con agua cristalina.',
      placeBuilding: 'fuente_plaza', icon: 'prop_well'
    },

    // =========================================================
    // EXPANSIÓN DE MINERALES, ALEACIONES Y GEMAS (8 TIERS)
    // =========================================================
    estano: {
      id: 'estano', name: 'Mena de Estaño', category: 'recursos', rarity: 'comun',
      sellValue: 5, buyValue: 14, source: 'Vetas de Estaño en Praderas y Costas',
      uses: 'Aleación de Lingote de Bronce en el Horno', desc: 'Mineral plateado maleable esencial para forjar bronce resistente.', icon: 'estano'
    },
    lingote_bronce: {
      id: 'lingote_bronce', name: 'Lingote de Bronce', category: 'materiales', rarity: 'poco_comun',
      sellValue: 14, buyValue: 34, source: 'Horno (Cobre + Estaño)',
      uses: 'Herramientas de Platino, engranajes avanzados y defensas', desc: 'Aleación clásica dorada templada con cobre y estaño.', icon: 'lingote_bronce'
    },
    platino: {
      id: 'platino', name: 'Mena de Platino', category: 'recursos', rarity: 'raro',
      sellValue: 18, buyValue: 46, source: 'Vetas de Platino en Montañas y Ruinas',
      uses: 'Fundición de Lingote de Platino para herramientas Tier 5', desc: 'Metal blanco denso e incorruptible de vetas profundas.', icon: 'platino'
    },
    lingote_platino: {
      id: 'lingote_platino', name: 'Lingote de Platino', category: 'materiales', rarity: 'raro',
      sellValue: 42, buyValue: 98, source: 'Horno (Mena de Platino)',
      uses: 'Herramientas y Armaduras de Platino, acuñación real', desc: 'Barra pesada de brillo níveo muy apreciada por herreros reales.', icon: 'lingote_platino'
    },
    jade: {
      id: 'jade', name: 'Gema de Jade', category: 'recursos', rarity: 'raro',
      sellValue: 32, buyValue: 78, source: 'Vetas de Jade en Bosques y Praderas',
      uses: 'Herramientas de Platino, Mitrilo y reliquias naturales', desc: 'Piedra verde traslúcida asociada con la vitalidad del archipiélago.', icon: 'jade'
    },
    sanguinaria: {
      id: 'sanguinaria', name: 'Piedra Sanguinaria', category: 'recursos', rarity: 'epico',
      sellValue: 52, buyValue: 130, source: 'Vetas Sanguinarias en Bosque Oscuro y Cráteres',
      uses: 'Armamento de Mitrilo, elixires de titán y forja oscura', desc: 'Cristal carmesí latente imbuido en energía ancestral.', icon: 'sanguinaria'
    },
    lingote_celestial: {
      id: 'lingote_celestial', name: 'Lingote Celestial', category: 'materiales', rarity: 'legendario',
      sellValue: 145, buyValue: 340, source: 'Fundición Maestra (Adamantita + Polvo Estelar)',
      uses: 'Armaduras Celestiales y equipamiento supremo', desc: 'Metal forjado con fuego estelar que irradia luz propia.', icon: 'celestial_ingot'
    },
    cuarzo_lunar: {
      id: 'cuarzo_lunar', name: 'Cuarzo Lunar', category: 'recursos', rarity: 'raro',
      sellValue: 26, buyValue: 64, source: 'Nodos nocturnos y Bosque Oscuro',
      uses: 'Alquimia nocturna y lentes arcanos', desc: 'Cuarzo pálido que absorbe la claridad de la luna.', icon: 'cuarzo_lunar'
    },
    polvo_ceniza: {
      id: 'polvo_ceniza', name: 'Ceniza Volcánica', category: 'recursos', rarity: 'poco_comun',
      sellValue: 9, buyValue: 22, source: 'Rocas volcánicas y bombas',
      uses: 'Fertilizante volcánico y pólvora mejorada', desc: 'Polvo fino caliente rico en minerales ígneos.', icon: 'polvo_ceniza'
    },
    resina_antigua: {
      id: 'resina_antigua', name: 'Resina Dorada', category: 'recursos', rarity: 'poco_comun',
      sellValue: 11, buyValue: 26, source: 'Árboles gigantes y Bosques',
      uses: 'Antorchas, barniz rúnico y pociones', desc: 'Savia fosilizada de aroma dulce y combustión lenta.', icon: 'resina_antigua'
    },
    tinta_arcana: {
      id: 'tinta_arcana', name: 'Tinta Arcana', category: 'materiales', rarity: 'raro',
      sellValue: 24, buyValue: 58, source: 'Alquimia (Hongo Luminoso + Carbón + Vidrio)',
      uses: 'Pergaminos mágicos en Centro de Investigación', desc: 'Tinta luminosa capaz de retener runas elementales.', icon: 'tinta_arcana'
    },
    esquirla_hielo: {
      id: 'esquirla_hielo', name: 'Esquirla Glacial', category: 'recursos', rarity: 'raro',
      sellValue: 25, buyValue: 60, source: 'Cristales de Hielo en Montañas Heladas',
      uses: 'Bombas de escarcha, pergaminos y forja boreal', desc: 'Fragmento de hielo perpetuo que jamás se derrite.', icon: 'esquirla_hielo'
    },
    nucleo_solar: {
      id: 'nucleo_solar', name: 'Fragmento Solar', category: 'materiales', rarity: 'epico',
      sellValue: 62, buyValue: 150, source: 'Tierras Volcánicas y Altares Solares',
      uses: 'Bombas solares, armamento legendario', desc: 'Ascua cristalizada que libera calor constante.', icon: 'nucleo_solar'
    },
    gema_marina: {
      id: 'gema_marina', name: 'Aguamarina Profunda', category: 'recursos', rarity: 'raro',
      sellValue: 38, buyValue: 92, source: 'Pesca en aguas abiertas y arrecifes',
      uses: 'Joyería de platino y relicarios costeros', desc: 'Gema azul verdosa pulida por corrientes abisales.', icon: 'gema_marina'
    },
    carbon_eterno: {
      id: 'carbon_eterno', name: 'Carbón Ardiente', category: 'materiales', rarity: 'raro',
      sellValue: 22, buyValue: 52, source: 'Horno / Fundición (Carbón + Obsidiana)',
      uses: 'Combustible de alto rendimiento en fundición', desc: 'Briquetado compacto que arde durante días.', icon: 'carbon_eterno'
    },
    escama_obsidiana: {
      id: 'escama_obsidiana', name: 'Placa de Obsidiana', category: 'materiales', rarity: 'epico',
      sellValue: 54, buyValue: 135, source: 'Forja con Obsidiana y Hierro',
      uses: 'Escudos y armaduras abismales', desc: 'Lámina pulida casi indestructible.', icon: 'escama_obsidiana'
    },

    // =========================================================
    // FAUNA MARINA PIXEL GNOME & PESCA PROFUNDA
    // =========================================================
    anchoa: {
      id: 'anchoa', name: 'Anchoa Plateada', category: 'comida', rarity: 'comun',
      sellValue: 6, buyValue: 15, healHp: 8, healEnergy: 12,
      source: 'Pesca en agua salada (Pradera / Costa)', uses: 'Cocinar sopas o recuperar energía básica',
      desc: 'Pequeño pez costero de banco, ágil y sabroso.', icon: 'pg_anchovy'
    },
    cangrejo_dungeness: {
      id: 'cangrejo_dungeness', name: 'Cangrejo Dungeness', category: 'comida', rarity: 'poco_comun',
      sellValue: 16, buyValue: 38, healHp: 14, healEnergy: 18,
      source: 'Pesca costera en agua salada', uses: 'Cocinar cangrejo asado o vender en el mercado',
      desc: 'Crustáceo robusto de pinzas apreciadas en gastronomía isleña.', icon: 'pg_crab'
    },
    pez_globo: {
      id: 'pez_globo', name: 'Pez Globo Espinoso', category: 'recursos', rarity: 'raro',
      sellValue: 28, buyValue: 66, source: 'Pesca en aguas saladas y templadas',
      uses: 'Alquimia tóxica y pociones especiales', desc: 'Se infla al sentirse amenazado; sus glándulas son valiosas.', icon: 'pg_pufferfish'
    },
    pez_cirujano: {
      id: 'pez_cirujano', name: 'Pez Cirujano Azul', category: 'comida', rarity: 'poco_comun',
      sellValue: 18, buyValue: 42, healHp: 12, healEnergy: 20,
      source: 'Pesca en aguas tropicales y desérticas', uses: 'Sushi fino o venta en mercado',
      desc: 'Vibrante pez azul cobalto de arrecife luminoso.', icon: 'pg_surgeonfish'
    },
    pez_angel: {
      id: 'pez_angel', name: 'Pez Ángel Real', category: 'comida', rarity: 'raro',
      sellValue: 30, buyValue: 70, healHp: 18, healEnergy: 24,
      source: 'Pesca en lagunas claras y santuarios', uses: 'Platos reales o colección',
      desc: 'Elegante pez rayado de aletas doradas.', icon: 'pg_angelfish'
    },
    lubina: {
      id: 'lubina', name: 'Lubina de Roca', category: 'comida', rarity: 'comun',
      sellValue: 10, buyValue: 24, healHp: 12, healEnergy: 16,
      source: 'Pesca en aguas dulces y praderas', uses: 'Cocinar filetes y guisos',
      desc: 'Captura frecuente favorita de los pescadores novatos.', icon: 'pg_bass'
    },
    bagre: {
      id: 'bagre', name: 'Bagre Bigotudo', category: 'comida', rarity: 'poco_comun',
      sellValue: 15, buyValue: 36, healHp: 16, healEnergy: 22,
      source: 'Pesca en ríos del Bosque Oscuro', uses: 'Sopa de pescado nutritiva',
      desc: 'Pez de fondo con largos barbillones sensores.', icon: 'pg_catfish'
    },
    carpa_dorada: {
      id: 'carpa_dorada', name: 'Koi Imperial', category: 'especiales', rarity: 'raro',
      sellValue: 45, buyValue: 110, source: 'Pesca con cebo dorado',
      uses: 'Comercio o amuletos de fortuna', desc: 'Carpa ornamentada de escamas brillantes.', icon: 'pg_goldfish'
    },
    trucha_arcoiris: {
      id: 'trucha_arcoiris', name: 'Trucha Arcoíris', category: 'comida', rarity: 'poco_comun',
      sellValue: 19, buyValue: 44, healHp: 20, healEnergy: 25,
      source: 'Pesca en aguas frías', uses: 'Trucha asada energizante',
      desc: 'De carne tierna y franjas iridiscentes.', icon: 'pg_trout'
    },
    lata_oxidada: {
      id: 'lata_oxidada', name: 'Lata Oxidada', category: 'basura', rarity: 'comun',
      sellValue: 1, buyValue: 3, source: 'Pesca accidental cerca de la costa',
      uses: 'Reciclable en Horno para recuperar Hierro', desc: 'Resto metálico olvidado en el fondo marino.', icon: 'pg_can'
    },
    cebo_lombriz: {
      id: 'cebo_lombriz', name: 'Lombriz Viva', category: 'consumibles', rarity: 'comun',
      sellValue: 2, buyValue: 6, source: 'Excavar tierra húmeda con Pala o Azada',
      uses: 'Fabricar cebos de pesca superior', desc: 'Carnada fresca irresistible para peces de río y mar.', icon: 'pg_worm'
    },
    coral_brillante: {
      id: 'coral_brillante', name: 'Coral Luminoso', category: 'recursos', rarity: 'raro',
      sellValue: 26, buyValue: 62, source: 'Pesca profunda y cofres marinos',
      uses: 'Pociones nocturnas y lámparas de aldea', desc: 'Rama de coral que destella suavemente en la oscuridad.', icon: 'coral_brillante'
    },

    // =========================================================
    // GASTRONOMÍA, POCIONES Y PERGAMINOS AVANZADOS
    // =========================================================
    pan_maiz: {
      id: 'pan_maiz', name: 'Pan de Maíz Dulce', category: 'comida', rarity: 'comun',
      sellValue: 12, buyValue: 28, healHp: 20, healEnergy: 38,
      source: 'Cocina (Harina + Maíz + Miel)', uses: 'Restaura +20 HP y +38 Energía',
      desc: 'Hogaza dorada aromática recién salida del horno.', icon: 'pan_maiz'
    },
    trucha_asada: {
      id: 'trucha_asada', name: 'Trucha a la Brasa', category: 'comida', rarity: 'poco_comun',
      sellValue: 32, buyValue: 74, healHp: 42, healEnergy: 45,
      source: 'Cocina (Trucha Arcoíris + Hierba + Carbón)', uses: 'Restaura +42 HP y +45 Energía',
      desc: 'Asada con hierbas aromáticas de la isla.', icon: 'trucha_asada'
    },
    sopa_pescado: {
      id: 'sopa_pescado', name: 'Caldo Marinero', category: 'comida', rarity: 'poco_comun',
      sellValue: 28, buyValue: 64, healHp: 38, healEnergy: 42,
      source: 'Cocina (Anchoa/Lubina + Tomate + Zanahoria)', uses: 'Restaura +38 HP y +42 Energía',
      desc: 'Sopa caliente que reconforta tras una larga tormenta.', icon: 'sopa_pescado'
    },
    cangrejo_asado: {
      id: 'cangrejo_asado', name: 'Festín de Cangrejo', category: 'comida', rarity: 'raro',
      sellValue: 44, buyValue: 98, healHp: 58, healEnergy: 50,
      source: 'Cocina (Cangrejo Dungeness + Queso + Chile)', uses: 'Restaura +58 HP y +50 Energía',
      desc: 'Manjar picante reservado para marineros expertos.', icon: 'cangrejo_asado'
    },
    ensalada_fresca: {
      id: 'ensalada_fresca', name: 'Ensalada del Huerto', category: 'comida', rarity: 'comun',
      sellValue: 16, buyValue: 38, healHp: 24, healEnergy: 35,
      source: 'Cocina (Tomate + Zanahoria + Maíz)', uses: 'Restaura +24 HP y +35 Energía',
      desc: 'Combinación crujiente y saludable de cosecha propia.', icon: 'ensalada_fresca'
    },
    tarta_fresa: {
      id: 'tarta_fresa', name: 'Tarta de Fresas', category: 'comida', rarity: 'raro',
      sellValue: 55, buyValue: 125, healHp: 65, healEnergy: 65,
      source: 'Cocina (Harina + Fresa + Miel)', uses: 'Restaura +65 HP y +65 Energía',
      desc: 'Postre suave decorado con fresas maduras.', icon: 'tarta_fresa'
    },
    jugo_uva: {
      id: 'jugo_uva', name: 'Néctar de Uva Antigua', category: 'comida', rarity: 'poco_comun',
      sellValue: 26, buyValue: 60, healHp: 22, healEnergy: 55,
      source: 'Cocina (Uva + Azúcar/Miel + Vidrio)', uses: 'Restaura +22 HP y +55 Energía',
      desc: 'Bebida energizante muy preciada por exploradores.', icon: 'jugo_uva'
    },
    taco_picante: {
      id: 'taco_picante', name: 'Taco Volcánico', category: 'comida', rarity: 'poco_comun',
      sellValue: 30, buyValue: 68, healHp: 35, healEnergy: 48,
      source: 'Cocina (Maíz + Carne + Chile)', uses: 'Restaura +35 HP y +48 Energía',
      desc: 'Picante explosivo que enciende el espíritu de lucha.', icon: 'taco_picante'
    },
    banquete_real: {
      id: 'banquete_real', name: 'Banquete Real de Balaclava', category: 'comida', rarity: 'legendario',
      sellValue: 160, buyValue: 360, healHp: 150, healEnergy: 150,
      source: 'Cocina Maestra (Filete + Pastel + Manzana Dorada)', uses: 'Restaura completamente +150 HP y +150 Energía',
      desc: 'Plato legendario digno de los conquistadores del archipiélago.', icon: 'banquete_real'
    },
    elixir_titan: {
      id: 'elixir_titan', name: 'Elixir del Titán', category: 'pociones', rarity: 'epico',
      sellValue: 95, buyValue: 220, healHp: 100, buffType: 'damage', buffPower: 0.45, buffDuration: 55,
      source: 'Alquimia (Sanguinaria + Colmillo + Vidrio)', uses: 'Cura +100 HP y otorga +45% Daño por 55 s',
      desc: 'Poción escarlata concentrada que multiplica tu fuerza en combate.', icon: 'potion_hp_large'
    },
    elixir_arcano: {
      id: 'elixir_arcano', name: 'Elixir del Erudito', category: 'pociones', rarity: 'epico',
      sellValue: 88, buyValue: 205, healEnergy: 120, buffType: 'luck', buffPower: 0.40, buffDuration: 60,
      source: 'Alquimia (Amatista + Polvo Estelar + Vidrio)', uses: 'Restaura +120 Energía y +40% Suerte por 60 s',
      desc: 'Destilado violeta que atrae botín extraordinario y gemas raras.', icon: 'elixir_blue'
    },
    pocion_nocturna: {
      id: 'pocion_nocturna', name: 'Frasco de Luciérnagas', category: 'pociones', rarity: 'raro',
      sellValue: 48, buyValue: 112, buffType: 'speed', buffPower: 0.30, buffDuration: 60,
      source: 'Alquimia (Hongo Luminoso + Coral Brillante + Vidrio)', uses: 'Otorga +30% Velocidad nocturna por 60 s',
      desc: 'Destella suavemente y agiliza tus pasos durante la noche.', icon: 'potion_night'
    },
    pocion_cosecha: {
      id: 'pocion_cosecha', name: 'Tónico de Cosecha', category: 'pociones', rarity: 'raro',
      sellValue: 46, buyValue: 108, buffType: 'luck', buffPower: 0.35, buffDuration: 50,
      source: 'Alquimia (Jade + Miel + Hierba)', uses: 'Otorga +35% Suerte de botín y semillas por 50 s',
      desc: 'Elixir herbal aromático muy popular entre granjeros.', icon: 'potion_harvest'
    },
    bomba_escarcha: {
      id: 'bomba_escarcha', name: 'Bomba Glacial', category: 'especiales', rarity: 'raro',
      sellValue: 52, buyValue: 120, consumable: true, isBomb: true, bombRadius: 160, bombDmg: 145,
      consumableEffect: { bombRadius: 160, bombDmg: 145, fuse: 0.68, tint: '#4fc3f7' },
      source: 'Taller / Alquimia (Esquirla Glacial + Pólvora)', uses: 'Lanza al cursor para detonar onda helada que daña monstruos y cristales (145 daño)',
      desc: 'Detona una onda congelante de gran alcance.', icon: 'bomba_escarcha'
    },
    bomba_solar: {
      id: 'bomba_solar', name: 'Bomba Solar Suprema', category: 'especiales', rarity: 'epico',
      sellValue: 96, buyValue: 220, consumable: true, isBomb: true, bombRadius: 185, bombDmg: 210,
      consumableEffect: { bombRadius: 185, bombDmg: 210, fuse: 0.65, tint: '#ffd54f' },
      source: 'Taller / Investigación (Fragmento Solar + Pólvora)', uses: 'Lanza explosión masiva de 210 Daño y minería instantánea',
      desc: 'Carga incendiaria capaz de demoler vetas pesadas de golpe.', icon: 'bomba_solar'
    },
    varita_arcana: {
      id: 'varita_arcana', name: 'Varita Láser Arcana', category: 'equipamiento', rarity: 'epico',
      sellValue: 260, buyValue: 620, isLaserWeapon: true,
      laserStats: { range: 360, dmg: 26, nodeDmg: 22, energyCost: 6.5, cooldown: 0.30, width: 11, color: '#7c4dff', coreColor: '#e0f7fa', beamMode: 'helix' },
      source: 'Centro de Investigación (Titanio + Cristales Mágicos + Esencia Oscura + Polvo Estelar)',
      uses: 'Haz Arcano Doble Hélice: explota runas arcanas al impactar y mina vetas en línea',
      desc: 'Canaliza un doble haz arcano trenzado que detona pulsos al impacto.',
      icon: 'varita_arcana'
    },
    cetro_vacio: {
      id: 'cetro_vacio', name: 'Cetro Láser del Vacío', category: 'equipamiento', rarity: 'legendario',
      sellValue: 540, buyValue: 1250, isLaserWeapon: true,
      laserStats: { range: 460, dmg: 46, nodeDmg: 38, energyCost: 8.5, cooldown: 0.27, width: 15, color: '#ff4081', coreColor: '#fff9c4', beamMode: 'void_pull' },
      source: 'Investigación Suprema (Varita Arcana + Oricalco + Diamantes + Esencia Oscura)',
      uses: 'Rayo Singularidad: abre una implosión del vacío que atrae enemigos al punto de impacto',
      desc: 'Reliquia abisal cuyo haz colapsa la gravedad alrededor de los objetivos.',
      icon: 'cetro_vacio'
    },
    pergamino_rayo: {
      id: 'pergamino_rayo', name: 'Pergamino de Tempestad', category: 'consumibles', rarity: 'epico',
      sellValue: 82, buyValue: 185, buffType: 'damage', buffPower: 0.50, buffDuration: 40,
      source: 'Investigación (Tinta Arcana + Zafiro + Tela)', uses: '+50% Daño eléctrico temporal durante 40 s',
      desc: 'Libera arcos voltaicos al golpear con cualquier arma.', icon: 'scroll_rayo'
    },
    pergamino_fortuna: {
      id: 'pergamino_fortuna', name: 'Pergamino del Buscador', category: 'consumibles', rarity: 'raro',
      sellValue: 64, buyValue: 148, buffType: 'luck', buffPower: 0.45, buffDuration: 65,
      source: 'Investigación (Tinta Arcana + Esmeralda + Tela)', uses: '+45% Suerte en minería, pesca y cofres por 65 s',
      desc: 'Runas antiguas grabadas para revelar tesoros ocultos.', icon: 'scroll_fortuna'
    },

    // =========================================================
    // EQUIPAMIENTO DE 8 TIERS (PLATINO, MITRILO Y CELESTIAL)
    // =========================================================
    armadura_platino: {
      id: 'armadura_platino', name: 'Coraza de Platino (T7)', category: 'equipamiento', rarity: 'raro', tier: 7,
      sellValue: 205, buyValue: 460, source: 'Forja (Armadura Oro + Platino + Jade)',
      uses: 'Equipa en Armadura (Tier 7): +22 Defensa y +82 Vida Máx', desc: 'Armadura blanca reluciente resistente a zarpazos.',
      equipSlot: 'armor', stats: { def: 22, maxHp: 82 }, icon: 'armor_platinum'
    },
    armadura_mitrilo: {
      id: 'armadura_mitrilo', name: 'Cota Élfica de Mitrilo (T10)', category: 'equipamiento', rarity: 'epico', tier: 10,
      sellValue: 340, buyValue: 760, source: 'Forja (Armadura Cristal + Mitrilo)',
      uses: 'Equipa en Armadura (Tier 10): +35 Defensa, +135 Vida Máx y +10% Velocidad', desc: 'Ligera como la seda e impenetrable como la montaña.',
      equipSlot: 'armor', stats: { def: 35, maxHp: 135, speedPct: 0.10 }, icon: 'armor_mithril'
    },
    armadura_celestial: {
      id: 'armadura_celestial', name: 'Armadura del Sol Astral (T15)', category: 'equipamiento', rarity: 'legendario', tier: 15,
      sellValue: 680, buyValue: 1550, source: 'Forja Maestra (Manto de Balaclava + Lingote Celestial)',
      uses: 'Equipa en Armadura (Tier 15): +70 Defensa, +300 Vida Máx, +30% Daño y +16% Velocidad', desc: 'Reliquia bélica suprema forjada para conquistar el Abismo.',
      equipSlot: 'armor', stats: { def: 70, maxHp: 300, dmgPct: 0.30, speedPct: 0.16 }, icon: 'armor_solar'
    },
    casco_platino: {
      id: 'casco_platino', name: 'Yelmo de Platino (T7)', category: 'equipamiento', rarity: 'raro', tier: 7,
      sellValue: 125, buyValue: 290, source: 'Forja (Casco Oro + Lingote Platino)',
      uses: 'Equipa en Casco (Tier 7): +13 Defensa y +52 Vida Máx', desc: 'Protección craneal bruñida de alta visibilidad.',
      equipSlot: 'helm', stats: { def: 13, maxHp: 52 }, icon: 'helm_platinum'
    },
    casco_mitrilo: {
      id: 'casco_mitrilo', name: 'Corona Yelmo de Mitrilo (T10)', category: 'equipamiento', rarity: 'epico', tier: 10,
      sellValue: 250, buyValue: 570, source: 'Forja (Casco Cristal + Mitrilo + Amatista)',
      uses: 'Equipa en Casco (Tier 10): +21 Defensa, +84 Vida Máx y +12% Suerte', desc: 'Diadema guerrera engastada con amatista pura.',
      equipSlot: 'helm', stats: { def: 21, maxHp: 84, luckPct: 0.12 }, icon: 'helm_mithril'
    },
    escudo_platino: {
      id: 'escudo_platino', name: 'Pavés de Platino (T7)', category: 'equipamiento', rarity: 'raro', tier: 7,
      sellValue: 145, buyValue: 325, source: 'Forja (Escudo Oro + Lingote Platino)',
      uses: 'Equipa en Escudo (Tier 7): +17 Defensa y +60 Vida Máx', desc: 'Escudo de torre capaz de frenar cargas de gólems.',
      equipSlot: 'shield', stats: { def: 17, maxHp: 60 }, icon: 'shield_platinum'
    },
    escudo_mitrilo: {
      id: 'escudo_mitrilo', name: 'Baluarte de Mitrilo (T10)', category: 'equipamiento', rarity: 'epico', tier: 10,
      sellValue: 290, buyValue: 650, source: 'Forja (Escudo Cristal + Mitrilo)',
      uses: 'Equipa en Escudo (Tier 10): +26 Defensa, +100 Vida Máx y +10% Crítico', desc: 'Absorbe impactos mortales sin vibrar.',
      equipSlot: 'shield', stats: { def: 26, maxHp: 100, critBonus: 0.10 }, icon: 'shield_mithril'
    },
    botas_platino: {
      id: 'botas_platino', name: 'Grebas de Platino (T7)', category: 'equipamiento', rarity: 'raro', tier: 7,
      sellValue: 125, buyValue: 280, source: 'Forja (Botas Oro + Lingote Platino)',
      uses: 'Equipa en Botas (Tier 7): +13 Defensa, +19% Velocidad y +50 Vida', desc: 'Zancada firme e incansable sobre nieve o roca.',
      equipSlot: 'boots', stats: { def: 13, speedPct: 0.19, maxHp: 50 }, icon: 'boots_platinum'
    },
    botas_mitrilo: {
      id: 'botas_mitrilo', name: 'Botas del Relámpago (T10)', category: 'equipamiento', rarity: 'epico', tier: 10,
      sellValue: 245, buyValue: 550, source: 'Forja (Botas Cristal + Mitrilo + Polvo Estelar)',
      uses: 'Equipa en Botas (Tier 10): +20 Defensa, +25% Velocidad, +85 Vida y +60 imán', desc: 'Aceleran tus reflejos a velocidades sobrehumanas.',
      equipSlot: 'boots', stats: { def: 20, speedPct: 0.25, maxHp: 85, magnetRadius: 60 }, icon: 'boots_mithril'
    },
    anillo_platino: {
      id: 'anillo_platino', name: 'Sello de Platino y Jade', category: 'equipamiento', rarity: 'raro',
      sellValue: 140, buyValue: 320, source: 'Forja (Lingote Platino + Jade)',
      uses: 'Equipa en Accesorio para +16% Daño y +20% Experiencia obtenida', desc: 'Anillo refinado que acelera el aprendizaje en batalla.',
      equipSlot: 'relic', stats: { dmgPct: 0.16, luckPct: 0.10 }, icon: 'ring_platinum'
    },
    anillo_mitrilo: {
      id: 'anillo_mitrilo', name: 'Sortija de Sanguinaria', category: 'equipamiento', rarity: 'epico',
      sellValue: 260, buyValue: 600, source: 'Forja (Mitrilo + Sanguinaria)',
      uses: 'Equipa en Accesorio para +26% Daño y +80 Vida Máx', desc: 'Anillo real que amplifica cada golpe crítico.',
      equipSlot: 'relic', stats: { dmgPct: 0.26, maxHp: 80 }, icon: 'ring_mithril'
    },
    amuleto_estelar: {
      id: 'amuleto_estelar', name: 'Amuleto del Abismo Astral', category: 'equipamiento', rarity: 'legendario',
      sellValue: 420, buyValue: 960, source: 'Investigación / Jefes Profundos',
      uses: 'Equipa en Accesorio para +25% Daño, +140 de alcance de imán y +25% Suerte', desc: 'Talismán cósmico que sintoniza con todas las islas.',
      equipSlot: 'relic', stats: { dmgPct: 0.25, magnetRadius: 140, luckPct: 0.25 }, icon: 'amulet_soul'
    },

    // =========================================================
    // TROFEOS DE MAZMORRA, DESCUBRIMIENTOS Y BLOQUES EXTRA
    // =========================================================
    aguijon_escorpion: {
      id: 'aguijon_escorpion', name: 'Aguijón de Escorpión', category: 'recursos', rarity: 'poco_comun',
      sellValue: 14, buyValue: 34, source: 'Escorpiones del Desierto', uses: 'Elixires de combate y venta',
      desc: 'Punta quitinosa venenosa de los desiertos del sur.', icon: 'sting_scorpion'
    },
    ala_murcielago: {
      id: 'ala_murcielago', name: 'Ala Umbría', category: 'recursos', rarity: 'poco_comun',
      sellValue: 12, buyValue: 30, source: 'Murciélagos de cuevas y Bosque Oscuro', uses: 'Pociones nocturnas y capas',
      desc: 'Membrana ligera capaz de planear sin ruido.', icon: 'bat_wing'
    },
    corazon_golem: {
      id: 'corazon_golem', name: 'Núcleo de Gólem', category: 'especiales', rarity: 'epico',
      sellValue: 68, buyValue: 165, source: 'Gólems de Cristal, Hielo y Magma', uses: 'Autómatas y lingotes celestiales',
      desc: 'Piedra motriz aún tibia que impulsa constructos gigantes.', icon: 'heart_golem'
    },
    trofeo_goblin: {
      id: 'trofeo_goblin', name: 'Cáliz del Rey Goblin', category: 'especiales', rarity: 'epico',
      sellValue: 140, buyValue: 320, source: 'Guarnición Goblin', uses: 'Reliquia de prestigio o venta noble',
      desc: 'Trofeo grabado obtenido tras expulsar a Korak.', icon: 'relic_goblet'
    },
    trofeo_faraon: {
      id: 'trofeo_faraon', name: 'Emblema del Centurión', category: 'especiales', rarity: 'epico',
      sellValue: 175, buyValue: 400, source: 'Pirámide Enterrada', uses: 'Reliquia de colección antigua',
      desc: 'Insignia solar de los guardianes eternos de arena.', icon: 'relic_compass'
    },
    trofeo_exanime: {
      id: 'trofeo_exanime', name: 'Cráneo de Malakor', category: 'especiales', rarity: 'epico',
      sellValue: 210, buyValue: 480, source: 'Necrópolis Real', uses: 'Reliquia nigromántica rara',
      desc: 'Calavera coronada que arde con llamas espectrales.', icon: 'relic_skull'
    },
    trofeo_dragon_fuego: {
      id: 'trofeo_dragon_fuego', name: 'Escama de Ignis Carmesí', category: 'especiales', rarity: 'legendario',
      sellValue: 290, buyValue: 680, source: 'Ciudadela Carmesí / Abismo', uses: 'Forja celestial y colección suprema',
      desc: 'Escama dracónica templada en magma primordial.', icon: 'relic_dragon_scale'
    },
    bloque_pilar_runico: {
      id: 'bloque_pilar_runico', name: 'Monolito Rúnico Portátil', category: 'construccion', rarity: 'epico',
      sellValue: 82, buyValue: 185, source: 'Investigación / Taller', uses: 'Colócalo para aura +12% Suerte, +8% Velocidad y luz',
      desc: 'Obelisco tallado con runas luminosas del archipiélago.', placeBuilding: 'estatua_dragon', icon: 'prop_rune_pillar'
    },
    bloque_estanteria: {
      id: 'bloque_estanteria', name: 'Estantería Arcana', category: 'construccion', rarity: 'raro',
      sellValue: 48, buyValue: 112, source: 'Aserradero / Investigación', uses: 'Colócala para ganar +15% Experiencia global y sabiduría pasiva',
      desc: 'Librero cargado de tomos cartográficos antiguos.', placeBuilding: 'estanteria_arcana', icon: 'prop_bookshelf'
    },
    bloque_mesa_banquete: {
      id: 'bloque_mesa_banquete', name: 'Mesa de Banquete', category: 'construccion', rarity: 'raro',
      sellValue: 64, buyValue: 145, source: 'Cocina / Taller', uses: 'Colócala para aura curativa intensa y +8% velocidad',
      desc: 'Mesa festiva cubierta con manteles reales.', placeBuilding: 'mesa_banquete', icon: 'prop_banquet_table'
    },
    bloque_barril: {
      id: 'bloque_barril', name: 'Bodega de Barriles', category: 'construccion', rarity: 'comun',
      sellValue: 18, buyValue: 42, source: 'Aserradero / Forja', uses: 'Colócala para generar rentas pequeñas periódicas',
      desc: 'Barriles reforzados con aros de hierro.', placeBuilding: 'barriles_bodega', icon: 'prop_barrel'
    },
    bloque_banco: {
      id: 'bloque_banco', name: 'Banco de Descanso', category: 'construccion', rarity: 'comun',
      sellValue: 12, buyValue: 28, source: 'Aserradero / Mano', uses: 'Colócalo junto a caminos para regenerar salud cerca',
      desc: 'Banco artesanal de madera barnizada.', placeBuilding: 'banco_madera', icon: 'prop_bench'
    },

    // === RUNAS ELEMENTALES (8) ===
    runa_fuego: {
      id: 'runa_fuego', name: 'Runa del Fuego Eterno', category: 'materiales', rarity: 'epico',
      sellValue: 65, buyValue: 160, source: 'Alquimia / Mesa Arcana / Volcán', uses: 'Forja armas ígneas y encantamientos',
      desc: 'Piedra tallada que arde sin consumirse.', icon: 'rune_fire'
    },
    runa_agua: {
      id: 'runa_agua', name: 'Runa de las Mareas', category: 'materiales', rarity: 'raro',
      sellValue: 48, buyValue: 120, source: 'Alquimia / Pesca / Altares', uses: 'Forja equipo acuático y cañas celestiales',
      desc: 'Susurra el ritmo constante del océano.', icon: 'rune_water'
    },
    runa_tierra: {
      id: 'runa_tierra', name: 'Runa de la Montaña', category: 'materiales', rarity: 'raro',
      sellValue: 48, buyValue: 120, source: 'Alquimia / Cuevas / Canteras', uses: 'Refuerza armaduras pesadas y herramientas',
      desc: 'Sólida como los cimientos del mundo.', icon: 'rune_earth'
    },
    runa_aire: {
      id: 'runa_aire', name: 'Runa del Céfiro', category: 'materiales', rarity: 'raro',
      sellValue: 48, buyValue: 120, source: 'Alquimia / Cumbres / Investigación', uses: 'Aligera arcos, botas y herramientas',
      desc: 'Vibra con corrientes de viento comprimido.', icon: 'rune_air'
    },
    runa_luz: {
      id: 'runa_luz', name: 'Runa Solar Celestial', category: 'especiales', rarity: 'legendario',
      sellValue: 115, buyValue: 280, source: 'Investigación / Jefes / Meteoritos', uses: 'Catalizador para herramientas Celestiales',
      desc: 'Irradia luz pura capaz de disipar la penumbra.', icon: 'rune_light'
    },
    runa_oscura: {
      id: 'runa_oscura', name: 'Runa del Crepúsculo', category: 'materiales', rarity: 'epico',
      sellValue: 72, buyValue: 175, source: 'Bosque Oscuro / Investigación', uses: 'Inscribe hechizos y reliquias sombrías',
      desc: 'Absorbe la luz ambiental en un fulgor violeta.', icon: 'rune_dark'
    },
    runa_vida: {
      id: 'runa_vida', name: 'Runa de Vitalidad Verde', category: 'materiales', rarity: 'raro',
      sellValue: 55, buyValue: 135, source: 'Alquimia / Cultivos raros', uses: 'Potencia hachas, guadañas y elixires curativos',
      desc: 'Brota energía natural a su alrededor.', icon: 'rune_life'
    },
    runa_muerte: {
      id: 'runa_muerte', name: 'Runa Abisal del Fin', category: 'especiales', rarity: 'legendario',
      sellValue: 120, buyValue: 295, source: 'Mazmorras Avanzadas / Jefes', uses: 'Material arcano para armas abisales',
      desc: 'Símbolo antiguo de los señores subterráneos.', icon: 'rune_death'
    },

    // === GEMAS, MINERALES AVANZADOS Y BOTÍN DE MONSTRUOS ===
    onice: {
      id: 'onice', name: 'Ónice Negro', category: 'gemas', rarity: 'epico',
      sellValue: 68, buyValue: 165, source: 'Vetas profundas / Meteoritos', uses: 'Joyería y amuletos protectores',
      desc: 'Gema volcánica pulida como un espejo nocturno.', icon: 'gem_onyx'
    },
    gema_alma: {
      id: 'gema_alma', name: 'Gema del Alma', category: 'gemas', rarity: 'legendario',
      sellValue: 145, buyValue: 340, source: 'Jefes / Investigación / Meteoritos', uses: 'Esencial para mejoras Celestiales',
      desc: 'Late con un destello etéreo inagotable.', icon: 'gem_soul_gem'
    },
    obsidiana_bruta: {
      id: 'obsidiana_bruta', name: 'Mena de Obsidiana', category: 'minerales', rarity: 'epico',
      sellValue: 38, buyValue: 92, source: 'Rocas volcánicas y meteoritos', uses: 'Fundir en Placa de Obsidiana',
      desc: 'Cristal negro forjado por lava milenaria.', icon: 'obsidian_ore'
    },
    obsidiana_refinada: {
      id: 'obsidiana_refinada', name: 'Lingote de Obsidiana', category: 'minerales', rarity: 'legendario',
      sellValue: 92, buyValue: 220, source: 'Horno / Forja avanzada', uses: 'Armaduras y escudos impenetrables',
      desc: 'Acero cristalizado con filo perpetuo.', icon: 'obsidian_bar'
    },
    esporas_toxicas: {
      id: 'esporas_toxicas', name: 'Esporas Alquímicas', category: 'monstruo', rarity: 'poco_comun',
      sellValue: 16, buyValue: 38, source: 'Hongos gigantes y slimes', uses: 'Alquimia, fertilizantes y elixires',
      desc: 'Polvillo fosforescente recogido en cavernas.', icon: 'spores'
    },
    garra_sombras: {
      id: 'garra_sombras', name: 'Garra de Bestia', category: 'monstruo', rarity: 'raro',
      sellValue: 26, buyValue: 64, source: 'Esqueletos y acechadores', uses: 'Armas, anillos y contratos del gremio',
      desc: 'Afilada garra ósea endurecida en mazmorras.', icon: 'monster_claw'
    },
    nucleo_golem_puro: {
      id: 'nucleo_golem_puro', name: 'Corazón de Piedra Rúnica', category: 'monstruo', rarity: 'epico',
      sellValue: 74, buyValue: 180, source: 'Gólems y meteoritos oscuros', uses: 'Maquinaria avanzada y armaduras pesadas',
      desc: 'Engranaje viviente de cristal y basalto.', icon: 'golem_core'
    },
    pluma_fenix: {
      id: 'pluma_fenix', name: 'Pluma de Fénix', category: 'especiales', rarity: 'legendario',
      sellValue: 130, buyValue: 310, source: 'Jefes Ígneos / Altares', uses: 'Arcos Legendarios y Capas Solares',
      desc: 'Reverdece cualquier llama con chispas doradas.', icon: 'relic_core'
    },
    pluma_oscura: {
      id: 'pluma_oscura', name: 'Pluma de Cuervo Umbrío', category: 'monstruo', rarity: 'poco_comun',
      sellValue: 18, buyValue: 44, source: 'Murciélagos y espectros', uses: 'Flechas, tinta arcana y pergaminos',
      desc: 'Ligera como el viento nocturno.', icon: 'black_feather'
    },
    ectoplasma: {
      id: 'ectoplasma', name: 'Ectoplasma Etéreo', category: 'monstruo', rarity: 'raro',
      sellValue: 36, buyValue: 88, source: 'Fantasmas y nigromantes', uses: 'Pociones de invisibilidad y grimorios',
      desc: 'Sustancia fría que desafía la gravedad.', icon: 'ectoplasm'
    },
    craneo_maldito: {
      id: 'craneo_maldito', name: 'Cráneo Antiguo', category: 'monstruo', rarity: 'raro',
      sellValue: 42, buyValue: 98, source: 'Esqueletos reales y tumbas', uses: 'Trofeos, amuletos y runas oscuras',
      desc: 'Conserva grabados de una dinastía olvidada.', icon: 'skull_drop'
    },
    gel_azul: {
      id: 'gel_azul', name: 'Gelatina Glacial', category: 'monstruo', rarity: 'comun',
      sellValue: 12, buyValue: 28, source: 'Slimes de escarcha', uses: 'Bombas glaciales y pociones',
      desc: 'Fría al tacto, nunca se derrite del todo.', icon: 'slime_blue'
    },
    saco_veneno: {
      id: 'saco_veneno', name: 'Glándula Tóxica', category: 'monstruo', rarity: 'raro',
      sellValue: 30, buyValue: 74, source: 'Arañas gigantes y escorpiones', uses: 'Alquimia ofensiva y contratos',
      desc: 'Contiene toxina concentrada de arácnidos.', icon: 'venom_sac'
    },
    diente_goblin: {
      id: 'diente_goblin', name: 'Diente de Trasgo', category: 'monstruo', rarity: 'comun',
      sellValue: 10, buyValue: 24, source: 'Saquedores y goblins', uses: 'Trofeos y trueque en el mercado',
      desc: 'Trofeo menudo de escaramuzas en islas.', icon: 'goblin_tooth'
    },
    huevo_dragon: {
      id: 'huevo_dragon', name: 'Huevo de Dragón Carmesí', category: 'especiales', rarity: 'legendario',
      sellValue: 240, buyValue: 550, source: 'Criptas Volcánicas / Meteoritos', uses: 'Material mítico de herrería celestial',
      desc: 'Irradia un pulso cálido desde su cascarón escamado.', icon: 'relic_dragon_egg'
    },

    // === ARMADURAS, YELMOS, ESCUDOS, BOTAS Y JOYERÍA ADICIONALES ===
    armadura_adamantita: {
      id: 'armadura_adamantita', name: 'Coraza de Adamantita (T12)', category: 'equipamiento', rarity: 'epico', tier: 12,
      sellValue: 390, buyValue: 860, source: 'Forja (Armadura Titanio + Lingote Adamantita)', uses: 'Equipa en Armadura (Tier 12): +46 Defensa, +185 Vida Máx y +16% Daño',
      desc: 'Placas verdosas casi indestructibles.', icon: 'armor_adamantite',
      equipSlot: 'armor', stats: { def: 46, maxHp: 185, dmgPct: 0.16 }
    },
    casco_adamantita: {
      id: 'casco_adamantita', name: 'Yelmo de Adamantita (T12)', category: 'equipamiento', rarity: 'epico', tier: 12,
      sellValue: 280, buyValue: 640, source: 'Forja (Casco Titanio + Lingote Adamantita)', uses: 'Equipa en Casco (Tier 12): +27 Defensa, +114 Vida y +8% Crítico',
      desc: 'Protege la cabeza frente a impactos sísmicos.', icon: 'helm_adamantite',
      equipSlot: 'helm', stats: { def: 27, maxHp: 114, critBonus: 0.08 }
    },
    escudo_adamantita: {
      id: 'escudo_adamantita', name: 'Bastión de Adamantita (T12)', category: 'equipamiento', rarity: 'epico', tier: 12,
      sellValue: 310, buyValue: 690, source: 'Forja (Escudo Titanio + Lingote Adamantita)', uses: 'Equipa en Escudo (Tier 12): +34 Defensa, +134 Vida y 16% resistencia mágica',
      desc: 'Escudo pesado grabado con runas de tierra.', icon: 'shield_adamantite',
      equipSlot: 'shield', stats: { def: 34, maxHp: 134, spellResist: 0.16 }
    },
    botas_adamantita: {
      id: 'botas_adamantita', name: 'Grebas de Adamantita (T12)', category: 'equipamiento', rarity: 'epico', tier: 12,
      sellValue: 265, buyValue: 590, source: 'Forja (Botas Titanio + Lingote Adamantita)', uses: 'Equipa en Botas (Tier 12): +26 Defensa, +29% velocidad, +112 Vida y -12% gasto de energía',
      desc: 'Grebas equilibradas para cargas imparables.', icon: 'boots_adamantite',
      equipSlot: 'boots', stats: { def: 26, speedPct: 0.29, maxHp: 112, energySave: 0.12 }
    },
    casco_solar: {
      id: 'casco_solar', name: 'Yelmo del Sol Astral (T15)', category: 'equipamiento', rarity: 'legendario', tier: 15,
      sellValue: 480, buyValue: 1080, source: 'Investigación / Forja (Capucha Balaclava + Lingote Celestial)', uses: 'Equipa en Casco (Tier 15): +42 Defensa, +185 Vida, +20% Daño, +15% crítico y luz',
      desc: 'Corona dorada que ilumina la noche eternamente.', icon: 'helm_solar',
      equipSlot: 'helm', stats: { def: 42, maxHp: 185, dmgPct: 0.20, critBonus: 0.15, lightRadius: 140 }
    },
    escudo_solar: {
      id: 'escudo_solar', name: 'Égida del Alba Solar (T14)', category: 'equipamiento', rarity: 'legendario', tier: 14,
      sellValue: 430, buyValue: 960, source: 'Investigación / Forja (Égida Oricalco + Lingote Celestial)', uses: 'Equipa en Escudo (Tier 14): +44 Defensa, +180 Vida, +14% Daño y 22% resistencia mágica',
      desc: 'Escudo radiante forjado con lingotes celestiales.', icon: 'shield_solar',
      equipSlot: 'shield', stats: { def: 44, maxHp: 180, dmgPct: 0.14, spellResist: 0.22 }
    },
    botas_solar: {
      id: 'botas_solar', name: 'Botas del Horizonte Solar (T15)', category: 'equipamiento', rarity: 'legendario', tier: 15,
      sellValue: 380, buyValue: 860, source: 'Investigación Celestial (Botas Oricalco + Lingote Celestial)', uses: 'Equipa en Botas (Tier 15): +36 Defensa, +36% velocidad, +170 Vida y -24% gasto de energía',
      desc: 'Dejan estelas luminosas al correr por el archipiélago.', icon: 'boots_solar',
      equipSlot: 'boots', stats: { def: 36, speedPct: 0.36, maxHp: 170, energySave: 0.24 }
    },
    sombrero_mago: {
      id: 'sombrero_mago', name: 'Sombrero del Archimago', category: 'equipamiento', rarity: 'epico',
      sellValue: 175, buyValue: 410, source: 'Investigación Arcana', uses: 'Equípalo para +35 Energía máx y +18% daño',
      desc: 'Tocado violeta bordado con hilos de maná.', icon: 'mage_hat_purple',
      equipSlot: 'helmet', bonus: { def: 7, maxEnergy: 35, dmgBonus: 0.18, energyRegen: 0.8 }
    },
    capa_sombras: {
      id: 'capa_sombras', name: 'Manto de Sombras Silentes', category: 'equipamiento', rarity: 'epico',
      sellValue: 210, buyValue: 490, source: 'Sastrería / Forja Oscura', uses: 'Equípalo para +12% Crítico y +18% Velocidad',
      desc: 'Tejido nocturno que silencia pasos y potencia emboscadas.', icon: 'cloak_black',
      equipSlot: 'armor', bonus: { def: 11, critChance: 0.12, moveSpeed: 0.18, dmgBonus: 0.16 }
    },
    capa_fenix: {
      id: 'capa_fenix', name: 'Manto Carmesí del Fénix', category: 'equipamiento', rarity: 'legendario',
      sellValue: 340, buyValue: 800, source: 'Investigación Ígnea', uses: 'Equípalo para +22 Defensa, +28% Daño y luz solar',
      desc: 'Capa ardiente tejida con plumas de fénix reales.', icon: 'cloak_red',
      equipSlot: 'armor', bonus: { def: 22, maxHp: 90, dmgBonus: 0.28, lightRadius: 110 }
    },
    anillo_diamante: {
      id: 'anillo_diamante', name: 'Sortija de Diamante Puro', category: 'equipamiento', rarity: 'epico',
      sellValue: 195, buyValue: 450, source: 'Joyería de Forja', uses: 'Equípala para +14% Crítico y +20% Suerte',
      desc: 'Refracta la luz aumentando la fortuna del portador.', icon: 'ring_diamond',
      equipSlot: 'ring', bonus: { critChance: 0.14, luckBonus: 0.20, dmgBonus: 0.10 }
    },
    anillo_amatista: {
      id: 'anillo_amatista', name: 'Anillo de Amatista Arcana', category: 'equipamiento', rarity: 'raro',
      sellValue: 135, buyValue: 310, source: 'Forja / Investigación', uses: 'Equípalo para +25 Energía máx y +0.8 Energía/s',
      desc: 'Facilita el uso continuo de herramientas y hechizos.', icon: 'ring_amethyst',
      equipSlot: 'ring', bonus: { maxEnergy: 25, energyRegen: 0.8, spellResist: 0.10 }
    },
    anillo_alma: {
      id: 'anillo_alma', name: 'Anillo del Alma Eterna', category: 'equipamiento', rarity: 'legendario',
      sellValue: 320, buyValue: 740, source: 'Investigación Celestial', uses: 'Equípalo para +18% Daño, +6 HP por baja y +15% Crítico',
      desc: 'Canaliza la esencia vital de enemigos derrotados.', icon: 'ring_soul',
      equipSlot: 'ring', bonus: { dmgBonus: 0.18, critChance: 0.15, killHeal: 6 }
    },
    amuleto_onice: {
      id: 'amuleto_onice', name: 'Amuleto Protector de Ónice', category: 'equipamiento', rarity: 'epico',
      sellValue: 185, buyValue: 430, source: 'Forja Oscura', uses: 'Equípalo para +10 Defensa y +25% resistencia mágica',
      desc: 'Desvía proyectiles arcanos con un escudo invisible.', icon: 'amulet_onyx',
      equipSlot: 'amulet', bonus: { def: 10, maxHp: 45, spellResist: 0.25 }
    },
    amuleto_diamante: {
      id: 'amuleto_diamante', name: 'Medallón de Diamante Solar', category: 'equipamiento', rarity: 'legendario',
      sellValue: 295, buyValue: 690, source: 'Investigación Real', uses: 'Equípalo para +30% Monedas, +25% Suerte y +90 de alcance de imán',
      desc: 'Emblema reservado para los grandes exploradores de Balaclava.', icon: 'amulet_diamond',
      equipSlot: 'amulet', bonus: { coinDropBonus: 0.30, luckBonus: 0.25, magnetBonus: 90 }
    },

    // === ARMAS LÁSER, EXPLOSIVOS, PERGAMINOS Y POCIONES ===
    baculo_dorado: {
      id: 'baculo_dorado', name: 'Báculo Láser Aúreo', category: 'equipamiento', rarity: 'epico',
      sellValue: 310, buyValue: 710, isLaserWeapon: true,
      laserStats: { range: 410, dmg: 34, nodeDmg: 28, energyCost: 7.5, cooldown: 0.29, width: 13, color: '#ffd54f', coreColor: '#fffde7', beamMode: 'solar_pillar' },
      source: 'Centro de Investigación (Adamantita + Topacio + Núcleo Solar)', uses: 'Haz Sagrado Solar: invoca un pilar celestial ardiente en el impacto que quema en área',
      desc: 'Amplifica gemas solares invocando columnas de luz divina sobre el objetivo.', icon: 'staff_gold'
    },
    baculo_estelar: {
      id: 'baculo_estelar', name: 'Cetro Cósmico Estelar', category: 'equipamiento', rarity: 'legendario',
      sellValue: 620, buyValue: 1420, isLaserWeapon: true,
      laserStats: { range: 510, dmg: 64, nodeDmg: 54, energyCost: 9.5, cooldown: 0.25, width: 17, color: '#00e5ff', coreColor: '#ffffff', beamMode: 'orbital_storm' },
      source: 'Investigación Celestial (Cetro del Vacío + Lingote Celestial + Gema del Alma)', uses: 'Láser Orbital Eléctrico: descarga tormenta eléctrica y explosión estelar a lo largo del rayo',
      desc: 'Canaliza energía de estrellas caídas desatando relámpagos orbitales en cadena.', icon: 'wand_legendary'
    },
    bomba_abismal: {
      id: 'bomba_abismal', name: 'Bomba Abismal Cósmica', category: 'especiales', rarity: 'legendario',
      sellValue: 95, buyValue: 220, consumable: true, isBomb: true,
      consumableEffect: { bombRadius: 215, bombDmg: 290, fuse: 0.60, tint: '#ab47bc' },
      source: 'Investigación Avanzada', uses: 'Lánzala para destruir bloques duros y aturdir jefes en gran radio (290 daño)',
      desc: 'Carga comprimida de esencia oscura y pólvora solar.', icon: 'bomba_abismal'
    },
    pergamino_curacion: {
      id: 'pergamino_curacion', name: 'Pergamino de Restauración', category: 'consumibles', rarity: 'raro',
      sellValue: 48, buyValue: 115, source: 'Investigación / Mazmorras', uses: 'Restaura +95 Vida, +55 Energía y otorga vigor inmediato',
      desc: 'Runa escrita con tinta sagrada de sanación.', icon: 'scroll_heal',
      healHp: 95, healEnergy: 55
    },
    pergamino_fuego: {
      id: 'pergamino_fuego', name: 'Pergamino de Tormenta Ígnea', category: 'consumibles', rarity: 'epico',
      sellValue: 74, buyValue: 175, source: 'Investigación / Mazmorras', uses: 'Desata anillos de fuego que queman a los enemigos cercanos',
      desc: 'Libera llamas arcanas alrededor del lanzador.', icon: 'scroll_fuego',
      spellEffect: 'fire_storm'
    },
    pergamino_hielo: {
      id: 'pergamino_hielo', name: 'Pergamino de Ventisca Polar', category: 'consumibles', rarity: 'epico',
      sellValue: 72, buyValue: 170, source: 'Investigación / Glaciar', uses: 'Congela y daña a todas las criaturas próximas',
      desc: 'Encierra el aliento helado de las cumbres.', icon: 'scroll_hielo',
      spellEffect: 'frost_nova'
    },
    pergamino_teletransporte: {
      id: 'pergamino_teletransporte', name: 'Pergamino de Retorno', category: 'consumibles', rarity: 'poco_comun',
      sellValue: 34, buyValue: 85, source: 'Investigación / Cofres', uses: 'Te transporta al instante a salvo a la isla central',
      desc: 'Atajo arcano infalible tras largas expediciones.', icon: 'scroll_teleport',
      spellEffect: 'return_home'
    },
    elixir_supremo: {
      id: 'elixir_supremo', name: 'Elixir Inmortal de Balaclava', category: 'pociones', rarity: 'legendario',
      sellValue: 135, buyValue: 310, source: 'Alquimia Real', uses: 'Cura +160 HP, +100 Energía y potencia daño +35% 90s',
      desc: 'Frasco dorado destilado con polvo estelar y miel real.', icon: 'potion_elixir',
      healHp: 160, healEnergy: 100, buff: { type: 'dmg', mult: 1.35, duration: 90 }
    },
    elixir_fuego: {
      id: 'elixir_fuego', name: 'Poción Escudo Ígneo', category: 'pociones', rarity: 'raro',
      sellValue: 46, buyValue: 110, source: 'Alquimia', uses: 'Otorga +20 Vida y +35% Daño cuerpo a cuerpo 55s',
      desc: 'Infusión ardiente con chiles volcánicos y rubí molido.', icon: 'potion_fire_res',
      healHp: 20, healEnergy: 25, buff: { type: 'dmg', mult: 1.35, duration: 55 }
    },
    elixir_escarcha: {
      id: 'elixir_escarcha', name: 'Poción Brisa Glacial', category: 'pociones', rarity: 'raro',
      sellValue: 44, buyValue: 105, source: 'Alquimia', uses: 'Restaura +45 Energía y acelera la marcha +35% durante 60s',
      desc: 'Refresca los sentidos y duplica el vigor del brazo.', icon: 'potion_frost',
      healHp: 15, healEnergy: 45, buff: { type: 'speed', mult: 1.35, duration: 60 }
    },

    // === ALIMENTOS GOURMET Y HALLAZGOS DE PLAYA / EXPLORACIÓN ===
    manzana_roja: {
      id: 'manzana_roja', name: 'Manzana del Bosque', category: 'comida', rarity: 'comun',
      sellValue: 8, buyValue: 18, source: 'Árboles frutales y huertos', uses: 'Snack rápido que recupera +18 Salud y +22 Energía',
      desc: 'Crujiente manzana roja recién caída del árbol.', icon: 'apple_red',
      healHp: 18, healEnergy: 22
    },
    manzana_verde: {
      id: 'manzana_verde', name: 'Manzana Ácida Esmeralda', category: 'comida', rarity: 'poco_comun',
      sellValue: 11, buyValue: 26, source: 'Bosques / Comercio', uses: 'Recupera +15 Salud y +30 Energía refrescante',
      desc: 'Despierta la energía en mitad de una jornada minera.', icon: 'apple_green',
      healHp: 15, healEnergy: 30
    },
    muslo_asado: {
      id: 'muslo_asado', name: 'Muslo de Granja Asado', category: 'comida', rarity: 'poco_comun',
      sellValue: 22, buyValue: 52, source: 'Cocina / Fogata', uses: 'Recupera +44 Salud y +38 Energía',
      desc: 'Jugoso muslo dorado al carbón con hierbas.', icon: 'drumstick',
      healHp: 44, healEnergy: 38
    },
    pescado_brasa: {
      id: 'pescado_brasa', name: 'Pescado Dorado a la Parrilla', category: 'comida', rarity: 'raro',
      sellValue: 32, buyValue: 74, source: 'Cocina / Ahumador', uses: 'Recupera +55 Salud y +48 Energía',
      desc: 'Filete tierno sazonado con salitre y especias.', icon: 'fish_cooked',
      healHp: 55, healEnergy: 48
    },
    mapa_tesoro_item: {
      id: 'mapa_tesoro_item', name: 'Mapa del Tesoro Antiguo', category: 'especiales', rarity: 'raro',
      sellValue: 75, buyValue: 165, source: 'Excavación / Pesca / Cofres', uses: 'Úsalo para recibir monedas, gemas y experiencia oculta',
      desc: 'Pergamino salino con una X marcada en tierras lejanas.', icon: 'treasure_map_extra',
      spellEffect: 'treasure_loot'
    },
    botella_mensaje: {
      id: 'botella_mensaje', name: 'Botella con Mensaje Secreto', category: 'especiales', rarity: 'poco_comun',
      sellValue: 45, buyValue: 95, source: 'Pesca costera / Playa', uses: 'Ábrela desde el inventario para revelar un pequeño botín',
      desc: 'Lleva notas de antiguos navegantes del archipiélago.', icon: 'msg_bottle_extra',
      spellEffect: 'bottle_loot'
    },
    concha_marina: {
      id: 'concha_marina', name: 'Vieira Perlada de Playa', category: 'recursos', rarity: 'poco_comun',
      sellValue: 19, buyValue: 45, source: 'Excavación en costa / Pesca', uses: 'Venta o decoración náutica',
      desc: 'Concha rosada con reflejos nacarados.', icon: 'shell_extra'
    },
    cangrejo_dorado: {
      id: 'cangrejo_dorado', name: 'Cangrejo Dorado de Arena', category: 'comida', rarity: 'raro',
      sellValue: 38, buyValue: 88, source: 'Excavación / Costas del Desierto', uses: 'Cocina gourmet o consumo (+32 HP, +32 Energía)',
      desc: 'Raro crustáceo de caparazón reluciente.', icon: 'crab_extra',
      healHp: 32, healEnergy: 32
    },

    // === LLAVE SECRETA, GEODAS Y MINERALES STEWV ===
    llave_legendaria: {
      id: 'llave_legendaria', name: 'Llave Legendaria', category: 'especiales', rarity: 'legendario',
      sellValue: 180, buyValue: 450, source: 'Forja Avanzada (Lingotes de Oro y Gemas)',
      uses: 'Abre Cofres Secretos ocultos en islas remotas que guardan Reliquias únicas',
      desc: 'Llave dorada forjada con filigrana real y gemas resonantes.', icon: 'key_legendaria'
    },
    geoda_amatista: {
      id: 'geoda_amatista', name: 'Geoda de Amatista', category: 'recursos', rarity: 'raro',
      sellValue: 48, buyValue: 115, source: 'Minería profunda / Meteoritos',
      uses: 'Ábrela para obtener amatistas, cristales y oro bruto',
      desc: 'Roca partida repleta de cristales violetas en su interior.', icon: 'geode_amethyst',
      spellEffect: 'crack_geode_amethyst'
    },
    geoda_dorada: {
      id: 'geoda_dorada', name: 'Geoda Áurea Real', category: 'recursos', rarity: 'epico',
      sellValue: 78, buyValue: 185, source: 'Vetas lejanas / Mazmorras',
      uses: 'Ábrela para revelar oro bruto, topacios y diamantes',
      desc: 'Corazón hueco recubierto de oro cristalizado.', icon: 'geode_gold',
      spellEffect: 'crack_geode_gold'
    },
    geoda_esmeralda: {
      id: 'geoda_esmeralda', name: 'Geoda Esmeralda Antigua', category: 'recursos', rarity: 'epico',
      sellValue: 72, buyValue: 170, source: 'Minería en islas exteriores / Pesca',
      uses: 'Ábrela para extraer esmeraldas, jade y polvo estelar',
      desc: 'Brilla con vetas verdes ancestrales.', icon: 'geode_emerald',
      spellEffect: 'crack_geode_emerald'
    },
    prisma_imperial: {
      id: 'prisma_imperial', name: 'Prisma Imperial Arcano', category: 'gemas', rarity: 'legendario',
      sellValue: 165, buyValue: 390, source: 'Alquimia / Jefes / Geodas',
      uses: 'Material supremo para espadas míticas y varas cósmicas',
      desc: 'Cristal hexagonal que concentra siete rayos elementales.', icon: 'prism_imperial'
    },

    // === ESPADAS ELEMENTALES LEGENDARIAS (new_file_download.png) ===
    espada_llamarada: {
      id: 'espada_llamarada', name: 'Sable Llamarada del Fénix', category: 'equipamiento', rarity: 'epico',
      sellValue: 260, buyValue: 620, isSpecialBlade: true,
      bladeStats: { range: 112, dmg: 38, energyCost: 5.0, cooldown: 0.29, color: '#ff7043', waveRange: 230, icon: 'sword_flame', uniqueMode: 'flame_wave', burnDmg: 8 },
      source: 'Yunque Rúnico / Investigación', uses: 'Desata onda de fuego perforante e incinera enemigos durante 4s',
      desc: 'Cada corte proyecta una oleada viva de llamas del fénix.', icon: 'sword_flame'
    },
    hoja_glacial: {
      id: 'hoja_glacial', name: 'Hoja Glacial Eterna', category: 'equipamiento', rarity: 'epico',
      sellValue: 255, buyValue: 610, isSpecialBlade: true,
      bladeStats: { range: 112, dmg: 36, energyCost: 4.8, cooldown: 0.28, color: '#4fc3f7', waveRange: 240, slow: true, icon: 'sword_frost', uniqueMode: 'frost_spikes' },
      source: 'Yunque Rúnico / Investigación', uses: 'Lanza 3 estacas de hielo perforantes y congela al instante',
      desc: 'Desprende espinas gélidas al frente con cada estocada.', icon: 'sword_frost'
    },
    espada_solar_mitica: {
      id: 'espada_solar_mitica', name: 'Espada del Sol Invicto', category: 'equipamiento', rarity: 'legendario',
      sellValue: 440, buyValue: 980, isSpecialBlade: true,
      bladeStats: { range: 126, dmg: 64, energyCost: 6.0, cooldown: 0.26, color: '#ffd54f', waveRange: 300, icon: 'sword_solar', uniqueMode: 'solar_nova', burnDmg: 10 },
      source: 'Investigación Celestial', uses: 'Estalla una Nova Solar radial (155px) y pilar celestial quemando todo alrededor',
      desc: 'Concentra la furia del mediodía en explosiones sagradas.', icon: 'sword_solar'
    },
    media_luna_abisal: {
      id: 'media_luna_abisal', name: 'Cimitarra Media Luna Abisal', category: 'equipamiento', rarity: 'legendario',
      sellValue: 415, buyValue: 940, isSpecialBlade: true,
      bladeStats: { range: 122, dmg: 58, energyCost: 5.5, cooldown: 0.25, color: '#7e57c2', waveRange: 280, lifeSteal: 0.08, icon: 'sword_moon', uniqueMode: 'void_boomerang' },
      source: 'Investigación Oscura', uses: 'Proyecta una media luna boomerang que regresa drenando 8% de vida',
      desc: 'Corta el vacío ida y vuelta absorbiendo vitalidad enemiga.', icon: 'sword_moon'
    },
    espada_prismatica: {
      id: 'espada_prismatica', name: 'Filo Prismático Cósmico', category: 'equipamiento', rarity: 'legendario',
      sellValue: 470, buyValue: 1050, isSpecialBlade: true,
      bladeStats: { range: 132, dmg: 70, energyCost: 6.5, cooldown: 0.25, color: '#ec407a', waveRange: 320, icon: 'sword_prism', uniqueMode: 'prism_rays' },
      source: 'Investigación Real', uses: 'Dispara 3 haces arcoíris cósmicos en abanico de altísimo alcance',
      desc: 'Fragmenta la luz astral en triples tajos multicolores.', icon: 'sword_prism'
    },
    katana_sakura: {
      id: 'katana_sakura', name: 'Katana Pétalo Carmesí', category: 'equipamiento', rarity: 'epico',
      sellValue: 285, buyValue: 670, isSpecialBlade: true,
      bladeStats: { range: 108, dmg: 34, energyCost: 4.0, cooldown: 0.22, color: '#f48fb1', waveRange: 210, icon: 'sword_sakura', uniqueMode: 'sakura_flurry', critBonus: 0.15 },
      source: 'Yunque Rúnico', uses: 'Cortes veloces (+15% Crítico) que liberan cuchillas de viento rastreadoras',
      desc: 'Cada tajo libera torbellinos carmesíes que persiguen presas.', icon: 'sword_sakura'
    },
    hoja_espinas: {
      id: 'hoja_espinas', name: 'Espada de Espinas Silvestres', category: 'equipamiento', rarity: 'raro',
      sellValue: 175, buyValue: 410, isSpecialBlade: true,
      bladeStats: { range: 104, dmg: 28, energyCost: 4.5, cooldown: 0.30, color: '#66bb6a', waveRange: 195, icon: 'sword_thorn', uniqueMode: 'bramble_snare' },
      source: 'Yunque Rúnico', uses: 'Hace brotar zarzas venenosas que ralentizan e intoxican en área',
      desc: 'Tallada con raíces vivas que enredan y envenenan.', icon: 'sword_thorn'
    },
    cetro_prism_vacio: {
      id: 'cetro_prism_vacio', name: 'Hoja del Vacío Violeta', category: 'equipamiento', rarity: 'epico',
      sellValue: 310, buyValue: 730, isSpecialBlade: true,
      bladeStats: { range: 118, dmg: 48, energyCost: 5.5, cooldown: 0.27, color: '#ab47bc', waveRange: 260, icon: 'sword_void', uniqueMode: 'void_vortex' },
      source: 'Investigación Arcana', uses: 'Genera un vórtice gravitacional al tajar que atrae enemigos al centro',
      desc: 'Rasga el tejido dimensional arrastrando presas hacia tu filo.', icon: 'sword_void'
    },

    // === ESCUDOS, CORONAS Y JOYERÍA HERÁLDICA (Shield_All & items_pack_new) ===
    escudo_fenix: {
      id: 'escudo_fenix', name: 'Escudo Blasón del Fénix', category: 'equipamiento', rarity: 'epico',
      sellValue: 235, buyValue: 540, source: 'Forja Real', uses: 'Equípalo para +17 Defensa, +55 Vida y +12% Daño',
      desc: 'Alas doradas en relieve sobre acero escarlata.', icon: 'shield_phoenix',
      equipSlot: 'shield', bonus: { def: 17, maxHp: 55, dmgBonus: 0.12 }
    },
    escudo_glacial: {
      id: 'escudo_glacial', name: 'Pavés Glacial de Zafiro', category: 'equipamiento', rarity: 'epico',
      sellValue: 225, buyValue: 520, source: 'Forja Glacial', uses: 'Equípalo para +16 Defensa, +24% Resist. Mágica y +25 Energía',
      desc: 'Refleja ataques mágicos con escarcha cristalina.', icon: 'shield_frost',
      equipSlot: 'shield', bonus: { def: 16, maxHp: 45, maxEnergy: 25, spellResist: 0.24 }
    },
    escudo_leon: {
      id: 'escudo_leon', name: 'Égida del León Dorado', category: 'equipamiento', rarity: 'legendario',
      sellValue: 360, buyValue: 840, source: 'Investigación Real', uses: 'Equípalo para +22 Defensa, +95 Vida y +14% Crítico',
      desc: 'Tallado con la efigie del guardián ancestral.', icon: 'shield_lion',
      equipSlot: 'shield', bonus: { def: 22, maxHp: 95, critChance: 0.14 }
    },
    escudo_abismal: {
      id: 'escudo_abismal', name: 'Baluarte del Cráneo Abisal', category: 'equipamiento', rarity: 'legendario',
      sellValue: 350, buyValue: 820, source: 'Forja Oscura / Mazmorras', uses: 'Equípalo para +19 Defensa, +8 Vida por baja y +18% Daño',
      desc: 'Absorbe la vitalidad de los enemigos derrotados.', icon: 'shield_abyss',
      equipSlot: 'shield', bonus: { def: 19, dmgBonus: 0.18, killHeal: 8 }
    },
    escudo_esmeralda: {
      id: 'escudo_esmeralda', name: 'Escudo del Guardabosques Verde', category: 'equipamiento', rarity: 'raro',
      sellValue: 165, buyValue: 380, source: 'Forja Silvana', uses: 'Equípalo para +12 Defensa, +14% Velocidad y +15% Suerte',
      desc: 'Ligero, resistente y bendecido por el bosque.', icon: 'shield_emerald',
      equipSlot: 'shield', bonus: { def: 12, moveSpeed: 0.14, luckBonus: 0.15 }
    },
    corona_soberana: {
      id: 'corona_soberana', name: 'Corona del Soberano Real', category: 'equipamiento', rarity: 'legendario',
      sellValue: 390, buyValue: 900, source: 'Investigación Real', uses: 'Equípala como yelmo para +18 Defensa, +35% Monedas y +25% Suerte',
      desc: 'Símbolo máximo de dominio sobre el archipiélago.', icon: 'crown_sovereign',
      equipSlot: 'helmet', bonus: { def: 18, maxHp: 60, coinDropBonus: 0.35, luckBonus: 0.25 }
    },
    anillo_astral: {
      id: 'anillo_astral', name: 'Sortija Astral de Zafiro', category: 'equipamiento', rarity: 'legendario',
      sellValue: 335, buyValue: 780, source: 'Joyería Real', uses: 'Equípala para +18% Crítico, +40 Energía y +1.2 Energía/s',
      desc: 'Destella como una estrella recién nacida.', icon: 'ring_astral',
      equipSlot: 'ring', bonus: { critChance: 0.18, maxEnergy: 40, energyRegen: 1.2 }
    },
    amuleto_escarcha: {
      id: 'amuleto_escarcha', name: 'Talismán de Escarcha Viva', category: 'equipamiento', rarity: 'raro',
      sellValue: 160, buyValue: 375, source: 'Forja Glacial', uses: 'Equípalo para +12 Defensa, +20% Velocidad y ahorro de energía',
      desc: 'Mantiene templado el pulso en los biomas extremos.', icon: 'amulet_frost',
      equipSlot: 'amulet', bonus: { def: 12, moveSpeed: 0.20, energySave: 0.14 }
    },
    colgante_fenix: {
      id: 'colgante_fenix', name: 'Colgante Pluma de Fénix', category: 'equipamiento', rarity: 'legendario',
      sellValue: 365, buyValue: 850, source: 'Investigación Ígnea', uses: 'Equípalo para +25% Daño, +75 Vida y regeneración constante',
      desc: 'Irradia calor vital incluso en la noche más profunda.', icon: 'pendant_phoenix',
      equipSlot: 'amulet', bonus: { dmgBonus: 0.25, maxHp: 75, lightRadius: 100, killHeal: 5 }
    },

    // === COCINA GOURMET Y BEBIDAS (Free_pixel_food_16x16 & items_pack_new) ===
    pastel_chocolate: {
      id: 'pastel_chocolate', name: 'Pastel Real de Chocolate', category: 'comida', rarity: 'raro',
      sellValue: 48, buyValue: 110, source: 'Cocina Gourmet', uses: 'Recupera +75 Salud y +65 Energía',
      desc: 'Bizcocho esponjoso con cobertura tibia de cacao.', icon: 'food_cake_choco',
      healHp: 75, healEnergy: 65
    },
    pastel_fresa: {
      id: 'pastel_fresa', name: 'Tarta de Fresas y Crema', category: 'comida', rarity: 'raro',
      sellValue: 44, buyValue: 100, source: 'Cocina Gourmet', uses: 'Recupera +68 Salud y +70 Energía',
      desc: 'Fresas recién cosechadas sobre masa dorada.', icon: 'food_cake_berry',
      healHp: 68, healEnergy: 70
    },
    cheesecake_real: {
      id: 'cheesecake_real', name: 'Cheesecake Dorado', category: 'comida', rarity: 'poco_comun',
      sellValue: 36, buyValue: 82, source: 'Cocina', uses: 'Recupera +52 Salud y +55 Energía',
      desc: 'Suave pastel horneado con queso artesanal y miel.', icon: 'food_cheesecake',
      healHp: 52, healEnergy: 55
    },
    boba_matcha: {
      id: 'boba_matcha', name: 'Té Boba de Matcha Arcano', category: 'comida', rarity: 'raro',
      sellValue: 42, buyValue: 96, source: 'Cocina / Alquimia', uses: 'Restaura +95 Energía y otorga +30% Velocidad 45s',
      desc: 'Bebida dulce revitalizante con perlas negras.', icon: 'food_boba_matcha',
      healHp: 25, healEnergy: 95, buff: { type: 'speed', mult: 1.30, duration: 45 }
    },
    boba_mango: {
      id: 'boba_mango', name: 'Té Boba Tropical de Mango', category: 'comida', rarity: 'poco_comun',
      sellValue: 34, buyValue: 78, source: 'Cocina', uses: 'Recupera +40 Salud y +80 Energía',
      desc: 'Néctar fresco perfecto tras picar bajo el sol.', icon: 'food_boba_mango',
      healHp: 40, healEnergy: 80
    },
    boba_taro: {
      id: 'boba_taro', name: 'Té Boba Violeta de Taro', category: 'comida', rarity: 'raro',
      sellValue: 45, buyValue: 102, source: 'Cocina / Bosque Oscuro', uses: 'Recupera +50 Salud, +85 Energía y +25% Daño 45s',
      desc: 'Cremoso té místico con esporas de dulzor nocturno.', icon: 'food_boba_taro',
      healHp: 50, healEnergy: 85, buff: { type: 'dmg', mult: 1.25, duration: 45 }
    },
    cafe_espresso: {
      id: 'cafe_espresso', name: 'Espresso Doble del Minero', category: 'comida', rarity: 'poco_comun',
      sellValue: 26, buyValue: 60, source: 'Cocina', uses: 'Recarga +75 Energía y acelera el ritmo +28% 35s',
      desc: 'Infusión intensa para madrugadas de forja.', icon: 'food_espresso',
      healHp: 10, healEnergy: 75, buff: { type: 'speed', mult: 1.28, duration: 35 }
    },
    manzana_helada: {
      id: 'manzana_helada', name: 'Manzana Cristalina Glacial', category: 'comida', rarity: 'epico',
      sellValue: 64, buyValue: 148, source: 'Cocina Glacial / Cofres', uses: 'Recupera +95 Salud y +95 Energía al instante',
      desc: 'Fruto helado translúcido lleno de vigor puro.', icon: 'food_ice_apple',
      healHp: 95, healEnergy: 95
    },
    waffle_dorado: {
      id: 'waffle_dorado', name: 'Waffle Dorado con Miel', category: 'comida', rarity: 'poco_comun',
      sellValue: 28, buyValue: 65, source: 'Cocina', uses: 'Recupera +38 Salud y +58 Energía',
      desc: 'Crujiente por fuera, tierno por dentro.', icon: 'food_waffle',
      healHp: 38, healEnergy: 58
    },
    sandwich_maestro: {
      id: 'sandwich_maestro', name: 'Sándwich del Aventurero', category: 'comida', rarity: 'poco_comun',
      sellValue: 32, buyValue: 74, source: 'Cocina', uses: 'Recupera +62 Salud y +52 Energía',
      desc: 'Pan artesanal relleno de carne asada, tomate y queso.', icon: 'food_sandwich',
      healHp: 62, healEnergy: 52
    },

    // =========================================================
    // MINERALES EXCLUSIVOS DE BIOMA Y 15 TIERS (V12)
    // =========================================================
    malaquita_pradera: {
      id: 'malaquita_pradera', name: 'Malaquita Silvestre', category: 'recursos', rarity: 'poco_comun',
      sellValue: 18, buyValue: 42, source: 'Vetas verdes exclusivas de Pradera',
      uses: 'Forja de equipo de Plata, Acero y tintes herbales', desc: 'Mineral verdoso veteado nacido bajo raíces ancestrales de la Pradera.', icon: 'ore_emerald'
    },
    arena_estelar: {
      id: 'arena_estelar', name: 'Arena Estelar Fósil', category: 'recursos', rarity: 'poco_comun',
      sellValue: 16, buyValue: 38, source: 'Dunas y vetas del Desierto Dorado',
      uses: 'Vidrio solar, fundición de Titanio y caminos de aldea', desc: 'Polvo dorado cristalizado por soles antiguos del Desierto.', icon: 'arena_estelar'
    },
    ambar_desierto: {
      id: 'ambar_desierto', name: 'Ámbar Solar del Desierto', category: 'gemas', rarity: 'raro',
      sellValue: 44, buyValue: 105, source: 'Vetas de Ámbar exclusivas del Desierto Dorado',
      uses: 'Equipo de Titanio, talismanes solares y alquimia superior', desc: 'Resina fósil dorada que conserva calor solar en su interior.', icon: 'ambar_desierto'
    },
    azurita_glacial: {
      id: 'azurita_glacial', name: 'Azurita Glacial', category: 'gemas', rarity: 'raro',
      sellValue: 48, buyValue: 112, source: 'Vetas azules exclusivas de Montañas Heladas',
      uses: 'Equipo de Acero Azul, encantamientos y varitas de hielo', desc: 'Cristal cobalto formado bajo glaciares eternos.', icon: 'ore_cobalt'
    },
    cristal_abismal: {
      id: 'cristal_abismal', name: 'Cristal del Abismo', category: 'gemas', rarity: 'epico',
      sellValue: 74, buyValue: 175, source: 'Vetas violetas exclusivas del Bosque Oscuro',
      uses: 'Armas de Oricalco, magia oscura y runas de sombra', desc: 'Fragmento violeta que susurra ecos arcanos en la espesura.', icon: 'ore_amethyst'
    },
    esencia_magma: {
      id: 'esencia_magma', name: 'Núcleo de Magma Vivo', category: 'recursos', rarity: 'epico',
      sellValue: 82, buyValue: 190, source: 'Geodas ígneas exclusivas de Tierras Volcánicas',
      uses: 'Lingotes de Oricalco, forja volcánica y explosivos reales', desc: 'Piedra incandescente que late con fuego primordial del volcán.', icon: 'ore_ruby'
    },
    titanio: {
      id: 'titanio', name: 'Mena de Titanio', category: 'recursos', rarity: 'epico',
      sellValue: 56, buyValue: 135, source: 'Montañas Heladas y Desierto lejano (Tier 11)',
      uses: 'Fundición de Lingote de Titanio en Horno/Forja', desc: 'Metal ligero azulado casi irrompible.', icon: 'ore_titanium'
    },
    lingote_titanio: {
      id: 'lingote_titanio', name: 'Lingote de Titanio', category: 'materiales', rarity: 'epico',
      sellValue: 118, buyValue: 270, source: 'Horno (Mena de Titanio + Carbón)',
      uses: 'Herramientas y Armaduras de Titanio (Tier 11)', desc: 'Aleación aeroespacial antigua de increíble dureza.', icon: 'silver_bar'
    },
    oricalco: {
      id: 'oricalco', name: 'Mena de Oricalco', category: 'recursos', rarity: 'legendario',
      sellValue: 88, buyValue: 210, source: 'Tierras Volcánicas y Bosque Oscuro lejano (Tier 13)',
      uses: 'Fundición de Lingote de Oricalco mítico', desc: 'Mineral cobrizo-escarlata mítico de civilizaciones caídas.', icon: 'ore_orichalcum'
    },
    lingote_oricalco: {
      id: 'lingote_oricalco', name: 'Lingote de Oricalco', category: 'materiales', rarity: 'legendario',
      sellValue: 175, buyValue: 400, source: 'Forja (Mena de Oricalco + Núcleo de Magma)',
      uses: 'Herramientas y Armaduras de Oricalco (Tier 13)', desc: 'Metal mítico templado con magma vivo.', icon: 'adamantite_bar'
    },

    // =========================================================
    // TERRAFORMING & DECORACIÓN DE ALDEA (V12)
    // =========================================================
    suelo_hierba: {
      id: 'suelo_hierba', name: 'Bloque: Tierra con Pasto', category: 'construccion', rarity: 'comun',
      sellValue: 4, buyValue: 10, source: 'Artesanía (Mano / Construcción)',
      uses: 'Coloca sobre el agua para crear suelo firme verde y unir islas o ampliar tu aldea', desc: 'Tierra fértil compactada cubierta de césped vivo.',
      placeBuilding: 'suelo_hierba', icon: 'village_grass_turf'
    },
    bloque_camino_hierba: {
      id: 'bloque_camino_hierba', name: 'Suelo: Jardín y Vereda Verde', category: 'construccion', rarity: 'comun',
      sellValue: 5, buyValue: 12, source: 'Artesanía (Piedra + Hierba)',
      uses: 'Camino decorativo transitable (+22% velocidad) para unir casas y plazas', desc: 'Sendero de aldea con césped recortado.',
      placeBuilding: 'camino_hierba', icon: 'village_cobble_path'
    },
    bloque_maceta_flores: {
      id: 'bloque_maceta_flores', name: 'Jardinera Floral de Madera', category: 'construccion', rarity: 'comun',
      sellValue: 10, buyValue: 24, source: 'Artesanía / Carpintería',
      uses: 'Decora las entradas y calles de tu pueblo con flores vivas', desc: 'Cajón de madera tallada repleto de brotes coloridos.',
      placeBuilding: 'maceta_flores', icon: 'village_planter_wood'
    },
    bloque_puesto_mercado: {
      id: 'bloque_puesto_mercado', name: 'Puesto de Feria Urbana', category: 'construccion', rarity: 'poco_comun',
      sellValue: 26, buyValue: 62, source: 'Artesanía / Taller',
      uses: 'Decora tu plaza central y aumenta +6% valor de ventas cercano', desc: 'Toldo azul y mostrador de roble para mercados de aldea.',
      placeBuilding: 'puesto_mercado', icon: 'village_stall'
    },
    bloque_cabana_aldeano: {
      id: 'bloque_cabana_aldeano', name: 'Cabaña Pintoresca de Aldea', category: 'construccion', rarity: 'raro',
      sellValue: 68, buyValue: 155, source: 'Artesanía / Construcción',
      uses: 'Edifica un auténtico pueblo alrededor de tu isla central (+4% Regen Energía)', desc: 'Cabaña cálida de tejado rojo para colonos del archipiélago.',
      placeBuilding: 'cabana_aldeano', icon: 'village_house_red'
    },

    // =========================================================
    // 15 TIERS COMPLETOS DE ARMADURAS, YELMOS, ESCUDOS Y BOTAS
    // =========================================================
    casco_cuero: { id: 'casco_cuero', name: 'Capucha de Cuero Reforzada (T1)', category: 'equipamiento', rarity: 'comun', tier: 1, sellValue: 18, buyValue: 40, source: 'Mesa de Artesanía', uses: 'Equipa en Casco (Tier 1): +2 Defensa y +10 Vida Máx', desc: 'Capucha ligera cosida a mano.', equipSlot: 'helm', stats: { def: 2, maxHp: 10 }, icon: 'helm_leather' },
    casco_bronce: { id: 'casco_bronce', name: 'Yelmo de Bronce (T2)', category: 'equipamiento', rarity: 'poco_comun', tier: 2, sellValue: 30, buyValue: 68, source: 'Forja', uses: 'Equipa en Casco (Tier 2): +4 Defensa y +16 Vida Máx', desc: 'Casco clásico de aleación dorada.', equipSlot: 'helm', stats: { def: 4, maxHp: 16 }, icon: 'helm_wood' },
    armadura_bronce: { id: 'armadura_bronce', name: 'Coraza de Bronce (T2)', category: 'equipamiento', rarity: 'poco_comun', tier: 2, sellValue: 48, buyValue: 105, source: 'Forja', uses: 'Equipa en Armadura (Tier 2): +7 Defensa y +25 Vida Máx', desc: 'Peto resistente de cobre y estaño.', equipSlot: 'armor', stats: { def: 7, maxHp: 25 }, icon: 'armor_wood' },
    escudo_bronce: { id: 'escudo_bronce', name: 'Rodela de Bronce (T2)', category: 'equipamiento', rarity: 'poco_comun', tier: 2, sellValue: 32, buyValue: 72, source: 'Forja', uses: 'Equipa en Escudo (Tier 2): +5 Defensa y +18 Vida Máx', desc: 'Escudo redondo pulido.', equipSlot: 'shield', stats: { def: 5, maxHp: 18 }, icon: 'shield_bronce' },
    botas_bronce: { id: 'botas_bronce', name: 'Grebas de Bronce (T2)', category: 'equipamiento', rarity: 'poco_comun', tier: 2, sellValue: 34, buyValue: 76, source: 'Forja', uses: 'Equipa en Botas (Tier 2): +3 Defensa, +10% Velocidad y +10 Vida', desc: 'Botas con puntera metálica.', equipSlot: 'boots', stats: { def: 3, speedPct: 0.10, maxHp: 10 }, icon: 'boots_bronce' },

    casco_cobre: { id: 'casco_cobre', name: 'Casco de Cobre Forjado (T3)', category: 'equipamiento', rarity: 'poco_comun', tier: 3, sellValue: 42, buyValue: 92, source: 'Forja', uses: 'Equipa en Casco (Tier 3): +5 Defensa y +22 Vida Máx', desc: 'Yelmo rojizo templado al carbón.', equipSlot: 'helm', stats: { def: 5, maxHp: 22 }, icon: 'helm_cobre' },
    armadura_cobre: { id: 'armadura_cobre', name: 'Cota de Cobre Forjado (T3)', category: 'equipamiento', rarity: 'poco_comun', tier: 3, sellValue: 68, buyValue: 150, source: 'Forja', uses: 'Equipa en Armadura (Tier 3): +9 Defensa y +32 Vida Máx', desc: 'Láminas remachadas de cobre puro.', equipSlot: 'armor', stats: { def: 9, maxHp: 32 }, icon: 'armor_cobre' },
    escudo_cobre: { id: 'escudo_cobre', name: 'Escudo de Cobre (T3)', category: 'equipamiento', rarity: 'poco_comun', tier: 3, sellValue: 45, buyValue: 100, source: 'Forja', uses: 'Equipa en Escudo (Tier 3): +7 Defensa y +24 Vida Máx', desc: 'Bloquea impactos frontales con brillo cobrizo.', equipSlot: 'shield', stats: { def: 7, maxHp: 24 }, icon: 'shield_cobre' },
    botas_cobre: { id: 'botas_cobre', name: 'Botas de Cobre Ágil (T3)', category: 'equipamiento', rarity: 'poco_comun', tier: 3, sellValue: 48, buyValue: 108, source: 'Forja', uses: 'Equipa en Botas (Tier 3): +5 Defensa, +11% Velocidad y +16 Vida', desc: 'Ligeras pero firmes sobre roca.', equipSlot: 'boots', stats: { def: 5, speedPct: 0.11, maxHp: 16 }, icon: 'boots_cobre' },

    casco_plata: { id: 'casco_plata', name: 'Yelmo de Plata Lunar (T5)', category: 'equipamiento', rarity: 'raro', tier: 5, sellValue: 82, buyValue: 185, source: 'Forja', uses: 'Equipa en Casco (Tier 5): +9 Defensa y +36 Vida Máx', desc: 'Plata pulida que repele maldiciones nocturnas.', equipSlot: 'helm', stats: { def: 9, maxHp: 36 }, icon: 'helm_plata' },
    armadura_plata: { id: 'armadura_plata', name: 'Coraza de Plata Lunar (T5)', category: 'equipamiento', rarity: 'raro', tier: 5, sellValue: 135, buyValue: 300, source: 'Forja', uses: 'Equipa en Armadura (Tier 5): +15 Defensa y +55 Vida Máx', desc: 'Armadura resplandeciente forjada con malaquita y plata.', equipSlot: 'armor', stats: { def: 15, maxHp: 55 }, icon: 'armor_plata' },
    escudo_plata: { id: 'escudo_plata', name: 'Pavés de Plata (T5)', category: 'equipamiento', rarity: 'raro', tier: 5, sellValue: 96, buyValue: 215, source: 'Forja', uses: 'Equipa en Escudo (Tier 5): +12 Defensa y +40 Vida Máx', desc: 'Refleja golpes físicos y mágicos.', equipSlot: 'shield', stats: { def: 12, maxHp: 40 }, icon: 'shield_plata' },
    botas_plata: { id: 'botas_plata', name: 'Botas de Plata Ligera (T5)', category: 'equipamiento', rarity: 'raro', tier: 5, sellValue: 92, buyValue: 205, source: 'Forja', uses: 'Equipa en Botas (Tier 5): +9 Defensa, +15% Velocidad y +32 Vida', desc: 'Pasos silenciosos bajo la luna.', equipSlot: 'boots', stats: { def: 9, speedPct: 0.15, maxHp: 32 }, icon: 'boots_plata' },

    botas_oro: { id: 'botas_oro', name: 'Grebas Reales de Oro (T6)', category: 'equipamiento', rarity: 'raro', tier: 6, sellValue: 112, buyValue: 250, source: 'Forja', uses: 'Equipa en Botas (Tier 6): +11 Defensa, +17% Velocidad, +40 Vida y +10% Oro', desc: 'Calzado ceremonial dorado reforzado.', equipSlot: 'boots', stats: { def: 11, speedPct: 0.17, maxHp: 40, coinPct: 0.10 }, icon: 'boots_gold' },

    casco_acero: { id: 'casco_acero', name: 'Yelmo de Acero Azul (T8)', category: 'equipamiento', rarity: 'epico', tier: 8, sellValue: 155, buyValue: 350, source: 'Forja', uses: 'Equipa en Casco (Tier 8): +15 Defensa y +62 Vida Máx', desc: 'Templado en hielo glacial y carbón puro.', equipSlot: 'helm', stats: { def: 15, maxHp: 62 }, icon: 'helm_steel' },
    armadura_acero: { id: 'armadura_acero', name: 'Coraza de Acero Azul (T8)', category: 'equipamiento', rarity: 'epico', tier: 8, sellValue: 220, buyValue: 495, source: 'Forja', uses: 'Equipa en Armadura (Tier 8): +26 Defensa y +98 Vida Máx', desc: 'Placas azuladas impenetrables en batalla.', equipSlot: 'armor', stats: { def: 26, maxHp: 98 }, icon: 'armor_steel' },
    escudo_acero: { id: 'escudo_acero', name: 'Escudo de Acero Azul (T8)', category: 'equipamiento', rarity: 'epico', tier: 8, sellValue: 175, buyValue: 390, source: 'Forja', uses: 'Equipa en Escudo (Tier 8): +20 Defensa y +72 Vida Máx', desc: 'Soporta embestidas de colosos.', equipSlot: 'shield', stats: { def: 20, maxHp: 72 }, icon: 'shield_acero' },
    botas_acero: { id: 'botas_acero', name: 'Botas de Acero Azul (T8)', category: 'equipamiento', rarity: 'epico', tier: 8, sellValue: 155, buyValue: 345, source: 'Forja', uses: 'Equipa en Botas (Tier 8): +15 Defensa, +21% Velocidad y +60 Vida', desc: 'Tracción firme en hielo y piedra.', equipSlot: 'boots', stats: { def: 15, speedPct: 0.21, maxHp: 60 }, icon: 'boots_steel' },

    botas_cristal: { id: 'botas_cristal', name: 'Grebas de Cristal (T9)', category: 'equipamiento', rarity: 'epico', tier: 9, sellValue: 195, buyValue: 435, source: 'Forja', uses: 'Equipa en Botas (Tier 9): +17 Defensa, +23% Velocidad y +72 Vida', desc: 'Botas prismáticas ligeras.', equipSlot: 'boots', stats: { def: 17, speedPct: 0.23, maxHp: 72 }, icon: 'boots_cristal' },

    casco_titanio: { id: 'casco_titanio', name: 'Yelmo de Titanio Estelar (T11)', category: 'equipamiento', rarity: 'epico', tier: 11, sellValue: 260, buyValue: 580, source: 'Forja', uses: 'Equipa en Casco (Tier 11): +24 Defensa, +98 Vida y +6% Crítico', desc: 'Forjado con titanio y ámbar del desierto.', equipSlot: 'helm', stats: { def: 24, maxHp: 98, critBonus: 0.06 }, icon: 'helm_titanio' },
    armadura_titanio: { id: 'armadura_titanio', name: 'Coraza de Titanio Estelar (T11)', category: 'equipamiento', rarity: 'epico', tier: 11, sellValue: 365, buyValue: 810, source: 'Forja', uses: 'Equipa en Armadura (Tier 11): +40 Defensa, +160 Vida y +14% Daño', desc: 'Protección titánica sorprendentemente ligera.', equipSlot: 'armor', stats: { def: 40, maxHp: 160, dmgPct: 0.14 }, icon: 'armor_platino' },
    escudo_titanio: { id: 'escudo_titanio', name: 'Bastión de Titanio (T11)', category: 'equipamiento', rarity: 'epico', tier: 11, sellValue: 280, buyValue: 625, source: 'Forja', uses: 'Equipa en Escudo (Tier 11): +30 Defensa, +116 Vida y 12% resistencia mágica', desc: 'Desvía meteoritos y golpes críticos.', equipSlot: 'shield', stats: { def: 30, maxHp: 116, spellResist: 0.12 }, icon: 'shield_titanio' },
    botas_titanio: { id: 'botas_titanio', name: 'Botas de Titanio Alado (T11)', category: 'equipamiento', rarity: 'epico', tier: 11, sellValue: 255, buyValue: 570, source: 'Forja', uses: 'Equipa en Botas (Tier 11): +23 Defensa, +27% Velocidad, +98 Vida y +70 imán', desc: 'Impulso veloz sobre dunas y cumbres.', equipSlot: 'boots', stats: { def: 23, speedPct: 0.27, maxHp: 98, magnetRadius: 70 }, icon: 'boots_titanio' },

    casco_oricalco: { id: 'casco_oricalco', name: 'Yelmo de Oricalco Ígneo (T13)', category: 'equipamiento', rarity: 'legendario', tier: 13, sellValue: 340, buyValue: 760, source: 'Forja', uses: 'Equipa en Casco (Tier 13): +31 Defensa, +132 Vida y +10% Crítico', desc: 'Corona guerrera imbuida en magma.', equipSlot: 'helm', stats: { def: 31, maxHp: 132, critBonus: 0.10 }, icon: 'helm_oricalco' },
    armadura_oricalco: { id: 'armadura_oricalco', name: 'Armadura de Oricalco Mítico (T13)', category: 'equipamiento', rarity: 'legendario', tier: 13, sellValue: 480, buyValue: 1080, source: 'Forja', uses: 'Equipa en Armadura (Tier 13): +52 Defensa, +215 Vida y +20% Daño', desc: 'Forjada con metal mítico indestructible.', equipSlot: 'armor', stats: { def: 52, maxHp: 215, dmgPct: 0.20 }, icon: 'armor_oricalco' },
    escudo_oricalco: { id: 'escudo_oricalco', name: 'Égida de Oricalco (T13)', category: 'equipamiento', rarity: 'legendario', tier: 13, sellValue: 375, buyValue: 840, source: 'Forja', uses: 'Equipa en Escudo (Tier 13): +38 Defensa, +155 Vida y +12% Daño', desc: 'Escudo rúnico que arde al bloquear.', equipSlot: 'shield', stats: { def: 38, maxHp: 155, dmgPct: 0.12, spellResist: 0.18 }, icon: 'shield_oricalco' },
    botas_oricalco: { id: 'botas_oricalco', name: 'Grebas de Oricalco Veloz (T13)', category: 'equipamiento', rarity: 'legendario', tier: 13, sellValue: 325, buyValue: 730, source: 'Forja', uses: 'Equipa en Botas (Tier 13): +29 Defensa, +31% Velocidad y +130 Vida', desc: 'Paso incandescente de campeón.', equipSlot: 'boots', stats: { def: 29, speedPct: 0.31, maxHp: 130, energySave: 0.16 }, icon: 'boots_oricalco' },

    escudo_celestial: { id: 'escudo_celestial', name: 'Baluarte Celestial Eterno (T15)', category: 'equipamiento', rarity: 'legendario', tier: 15, sellValue: 520, buyValue: 1180, source: 'Forja Suprema', uses: 'Equipa en Escudo (Tier 15): +52 Defensa, +215 Vida, +18% Daño y 28% resist. mágica', desc: 'Defensa definitiva bañada en luz astral.', equipSlot: 'shield', stats: { def: 52, maxHp: 215, dmgPct: 0.18, spellResist: 0.28 }, icon: 'shield_celestial' },
    botas_celestiales: { id: 'botas_celestiales', name: 'Botas del Sol Celestial (T15)', category: 'equipamiento', rarity: 'legendario', tier: 15, sellValue: 490, buyValue: 1100, source: 'Forja Suprema', uses: 'Equipa en Botas (Tier 15): +38 Defensa, +38% Velocidad, +180 Vida y +120 imán', desc: 'Camina con la ligereza del viento cósmico.', equipSlot: 'boots', stats: { def: 38, speedPct: 0.38, maxHp: 180, magnetRadius: 120, energySave: 0.25 }, icon: 'boots_legendary' },

    // =========================================================
    // NUEVAS FRUTAS, ELIXIRES CON BUFFS, ARMAS Y TROFEOS DEL REY OSEO
    // =========================================================
    platano: { id: 'platano', name: 'Plátano Tropical', category: 'alimentos', rarity: 'comun', sellValue: 9, buyValue: 22, source: 'Arbustos / Mercado', uses: 'Consume +14 Vida y +24 Energía', desc: 'Fruta energética de islas cálidas.', edible: { hp: 14, energy: 24 }, icon: 'platano' },
    naranja: { id: 'naranja', name: 'Naranja Solar', category: 'alimentos', rarity: 'comun', sellValue: 10, buyValue: 24, source: 'Árboles / Mercado', uses: 'Consume +16 Vida y +22 Energía', desc: 'Cítrico jugoso cargado de vitalidad.', edible: { hp: 16, energy: 22 }, icon: 'naranja' },
    pera: { id: 'pera', name: 'Pera de Huerta', category: 'alimentos', rarity: 'comun', sellValue: 10, buyValue: 24, source: 'Árboles / Mercado', uses: 'Consume +18 Vida y +20 Energía', desc: 'Dulce y suave fruto del campamento.', edible: { hp: 18, energy: 20 }, icon: 'pera' },
    pina: { id: 'pina', name: 'Piña Real', category: 'alimentos', rarity: 'poco_comun', sellValue: 18, buyValue: 42, source: 'Mercado / Tesoros', uses: 'Consume +26 Vida, +32 Energía y +20% Velocidad (30s)', desc: 'Corona dorada de sabor exótico.', healHp: 26, healEnergy: 32, buff: { type: 'speed', mult: 1.20, duration: 30 }, icon: 'pina' },
    durazno: { id: 'durazno', name: 'Durazno Dorado', category: 'alimentos', rarity: 'poco_comun', sellValue: 16, buyValue: 38, source: 'Árboles / Mercado', uses: 'Consume +24 Vida y +26 Energía', desc: 'Piel aterciopelada y aroma floral.', edible: { hp: 24, energy: 26 }, icon: 'durazno' },
    granada: { id: 'granada', name: 'Granada Carmesí', category: 'alimentos', rarity: 'raro', sellValue: 24, buyValue: 56, source: 'Bosque Oscuro / Mercado', uses: 'Consume +32 Vida y +25% Daño (35s)', desc: 'Semillas rubí que despiertan furia interior.', healHp: 32, healEnergy: 20, buff: { type: 'dmg', mult: 1.25, duration: 35 }, icon: 'granada' },
    cereza: { id: 'cereza', name: 'Cereza Dulce', category: 'alimentos', rarity: 'comun', sellValue: 11, buyValue: 26, source: 'Árboles / Arbustos', uses: 'Consume +15 Vida y +20 Energía', desc: 'Par de frutos rojos brillantes.', edible: { hp: 15, energy: 20 }, icon: 'cereza' },
    arandano: { id: 'arandano', name: 'Arándano Silvestre', category: 'alimentos', rarity: 'poco_comun', sellValue: 15, buyValue: 35, source: 'Pradera / Bosque Oscuro', uses: 'Consume +18 Vida, +24 Energía y +15% Experiencia (30s)', desc: 'Pequeñas bayas azules de gran claridad mental.', healHp: 18, healEnergy: 24, buff: { type: 'xp', mult: 1.15, duration: 30 }, icon: 'arandano' },
    kiwi: { id: 'kiwi', name: 'Kiwi Esmeralda', category: 'alimentos', rarity: 'poco_comun', sellValue: 14, buyValue: 34, source: 'Pradera / Mercado', uses: 'Consume +20 Vida y +28 Energía', desc: 'Pulpa verde refrescante.', edible: { hp: 20, energy: 28 }, icon: 'kiwi' },
    pitaya: { id: 'pitaya', name: 'Pitaya Astral', category: 'alimentos', rarity: 'epico', sellValue: 42, buyValue: 96, source: 'Tierras Volcánicas / Meteoritos', uses: 'Consume +55 Vida, +55 Energía y +35% Suerte (45s)', desc: 'Fruta escamada de dragón con destellos estelares.', healHp: 55, healEnergy: 55, buff: { type: 'luck', mult: 1.35, duration: 45 }, icon: 'pitaya' },
    sandia: { id: 'sandia', name: 'Sandía Fresca', category: 'alimentos', rarity: 'comun', sellValue: 16, buyValue: 36, source: 'Huerto / Mercado', uses: 'Consume +28 Vida y +32 Energía', desc: 'Enorme tajada refrescante de verano.', edible: { hp: 28, energy: 32 }, icon: 'sandia' },
    aguacate: { id: 'aguacate', name: 'Aguacate Nutritivo', category: 'alimentos', rarity: 'poco_comun', sellValue: 16, buyValue: 38, source: 'Pradera / Cocina', uses: 'Consume +30 Vida y +24 Energía', desc: 'Alimento cremoso ideal para travesías largas.', edible: { hp: 30, energy: 24 }, icon: 'aguacate' },
    bellota: { id: 'bellota', name: 'Bellota del Roble', category: 'recursos', rarity: 'comun', sellValue: 6, buyValue: 15, source: 'Tala de árboles / Pradera', uses: 'Alimento rústico (+10 Energía) y recetas de bosque', desc: 'Fruto sólido caído de robles centenarios.', edible: { hp: 6, energy: 14 }, icon: 'bellota' },
    miel_ambar: { id: 'miel_ambar', name: 'Ámbar Dulce de Colmena', category: 'materiales', rarity: 'poco_comun', sellValue: 22, buyValue: 50, source: 'Bosques / Colmenas', uses: 'Prepara elixires y banquetes reales (+28 Vida y Energía)', desc: 'Resina dorada cristalizada con néctar puro.', edible: { hp: 28, energy: 34 }, icon: 'miel_ambar' },
    macedonia_real: { id: 'macedonia_real', name: 'Macedonia Real del Bosque', category: 'comida', rarity: 'raro', sellValue: 54, buyValue: 120, source: 'Cocina (Fresa + Naranja + Kiwi + Miel)', uses: 'Restaura +85 Vida, +80 Energía y +30% Velocidad (50s)', desc: 'Copa rebosante de fruta fresca bañada en miel dorada.', healHp: 85, healEnergy: 80, buff: { type: 'speed', mult: 1.30, duration: 50 }, icon: 'macedonia_real' },
    batido_nebula: { id: 'batido_nebula', name: 'Elixir de Nebulosa Estelar', category: 'comida', rarity: 'epico', sellValue: 88, buyValue: 205, source: 'Alquimia (Pitaya + Arándano + Polvo Estelar)', uses: 'Restaura +95 Vida, +100 Energía y +35% Experiencia (60s)', desc: 'Brebaje violeta brillante que multiplica tu aprendizaje.', healHp: 95, healEnergy: 100, buff: { type: 'xp', mult: 1.35, duration: 60 }, icon: 'botella_estelar' },
    caliz_nebulosa_obj: { id: 'caliz_nebulosa_obj', name: 'Cáliz de Sangre Cósmica', category: 'comida', rarity: 'legendario', sellValue: 120, buyValue: 280, source: 'Alquimia / Jefes', uses: 'Cura +180 Vida y concede +40% Daño durante 60s', desc: 'Copa en forma de corazón rellena de esencia vital pura.', healHp: 180, healEnergy: 70, buff: { type: 'dmg', mult: 1.40, duration: 60 }, icon: 'caliz_nebulosa' },
    elixir_vida_supremo: { id: 'elixir_vida_supremo', name: 'Poción Rubí Suprema', category: 'comida', rarity: 'epico', sellValue: 74, buyValue: 170, source: 'Alquimia', uses: 'Curación instantánea (+160 Vida y +60 Energía)', desc: 'Frasco sellado con rubí para duelos contra jefes.', healHp: 160, healEnergy: 60, icon: 'elixir_vida' },
    elixir_mana_astral: { id: 'elixir_mana_astral', name: 'Esencia Zafiro de Vigor', category: 'comida', rarity: 'epico', sellValue: 72, buyValue: 165, source: 'Alquimia', uses: 'Restaura 100% Energía y +45% Velocidad (45s)', desc: 'Destello azulino que disipa toda fatiga al instante.', healHp: 40, healEnergy: 180, buff: { type: 'speed', mult: 1.45, duration: 45 }, icon: 'elixir_mana' },
    espada_relampago: { id: 'espada_relampago', name: 'Hoja del Relámpago Azul', category: 'equipamiento', rarity: 'epico', sellValue: 260, buyValue: 590, source: 'Yunque Rúnico (Titanio + Zafiro + Cristales Mágicos)', uses: 'Descarga cadenas eléctricas que saltan al enemigo cercano', desc: 'Filo cargado que rebota chispas voltaicas entre objetivos.', weaponMelee: { dmg: 38, range: 78, arcColor: '#4fc3f7', speed: 0.27, uniqueMode: 'chain_arc' }, icon: 'espada_relampago' },
    espada_tormenta: { id: 'espada_tormenta', name: 'Espada de la Tormenta Suprema', category: 'equipamiento', rarity: 'legendario', sellValue: 410, buyValue: 920, source: 'Investigación Real', uses: 'Invoca nube tormentosa y rayos celestiales en área sobre el corte', desc: 'Atrapa rayos reales del firmamento creando explosiones eléctricas.', weaponMelee: { dmg: 56, range: 86, arcColor: '#80deea', speed: 0.25, uniqueMode: 'thunder_tempest', cleave: true }, icon: 'espada_tormenta' },
    espada_hueso_rey: { id: 'espada_hueso_rey', name: 'Mandoble del Rey Óseo', category: 'equipamiento', rarity: 'legendario', sellValue: 430, buyValue: 980, source: 'Ritual del Bosque Oscuro', uses: 'Ondas espectrales que roban 12% de vida al golpear', desc: 'Mandoble del coloso que libera garras sombrías y drena vitalidad.', weaponMelee: { dmg: 60, range: 88, arcColor: '#ce93d8', speed: 0.26, lifeSteal: 0.12, uniqueMode: 'bone_siphon', cleave: true }, icon: 'espada_astral_v2' },
    martillo_paladin: { id: 'martillo_paladin', name: 'Martillo del Paladín Real', category: 'equipamiento', rarity: 'epico', sellValue: 280, buyValue: 640, source: 'Yunque Rúnico', uses: 'Impacto sísmico sagrado en 360° (35% aturdimiento + pilar divino)', desc: 'Aplasta esqueletos y armaduras rocosas con ondas sagradas.', weaponMelee: { dmg: 48, range: 86, arcColor: '#ffd54f', speed: 0.34, cleave: true, stunChance: 0.35, uniqueMode: 'holy_slam' }, icon: 'martillo_paladin' },
    baculo_solaris: { id: 'baculo_solaris', name: 'Báculo Láser Solaris', category: 'equipamiento', rarity: 'legendario', sellValue: 560, buyValue: 1280, source: 'Investigación Cósmica', uses: 'Rayo Prismático que rebota en 2 rayos secundarios hacia enemigos cercanos', desc: 'Canaliza energía estelar concentrada que se refracta en múltiples objetivos.', isLaserWeapon: true, laserStats: { range: 475, dmg: 52, nodeDmg: 44, energyCost: 8.0, cooldown: 0.26, width: 14, color: '#69f0ae', coreColor: '#ffffff', beamMode: 'prism_ricochet' }, icon: 'baculo_solaris' },
    collar_oseo: { id: 'collar_oseo', name: 'Collar del Osario Antiguo', category: 'equipamiento', rarity: 'epico', sellValue: 220, buyValue: 510, source: 'Bosque Oscuro / Altar Óseo', uses: 'Equipa en Amuleto para +22% Daño, +14% Crítico y +45 Vida Máx', desc: 'Reliquia engastada con colmillos de bestias primigenias.', equipSlot: 'amulet', bonus: { dmgBonus: 0.22, critChance: 0.14, maxHp: 45 }, icon: 'collar_oseo' },
    anillo_rubi_real: { id: 'anillo_rubi_real', name: 'Sortija Rubí del Conquistador', category: 'equipamiento', rarity: 'epico', sellValue: 235, buyValue: 540, source: 'Forja Real', uses: 'Equipa en Anillo para +24% Daño y +18% Velocidad de ataque', desc: 'Gema escarlata tallada en fuego volcánico.', equipSlot: 'ring', bonus: { dmgBonus: 0.24, attackSpeed: 0.18 }, icon: 'anillo_rubi' },
    talisman_meteoro: { id: 'talisman_meteoro', name: 'Amuleto del Meteoro Ardiente', category: 'equipamiento', rarity: 'legendario', sellValue: 390, buyValue: 880, source: 'Investigación / Meteoritos', uses: 'Equipa en Accesorio para +28% Daño, +25% Experiencia y halo luminoso', desc: 'Piedra celeste en ignición eterna.', equipSlot: 'relic', stats: { dmgPct: 0.28, xpBonus: 0.25, lightRadius: 110 }, icon: 'talisman_meteoro' },
    bloque_roble_milenario: { id: 'bloque_roble_milenario', name: 'Semilla de Roble Milenario', category: 'construccion', rarity: 'raro', sellValue: 65, buyValue: 150, source: 'Naturaleza / Carpintería', uses: 'Planta un roble colosal decorativo que regenera energía y vida al pasar', desc: 'Árbol ancestral que llena tu isla de mariposas y serenidad.', placeBuilding: 'roble_milenario', icon: 'roble_milenario' },
    bloque_brasero_magma: { id: 'bloque_brasero_magma', name: 'Brasero del Magma Vivo', category: 'construccion', rarity: 'raro', sellValue: 70, buyValue: 160, source: 'Forja / Desierto', uses: 'Colócalo para iluminar de noche con amplio alcance y calor', desc: 'Cuenco de hierro volcánico con fuego perpetuo.', placeBuilding: 'brasero_magma', icon: 'fire_brazier' },

    // =========================================================
    // FASE 5: GRIMORIOS DE HECHIZOS ACTIVOS (12 HECHIZOS)
    // =========================================================
    grimorio_misil_arcano: { id: 'grimorio_misil_arcano', name: 'Grimorio: Misil Arcano', category: 'magia', rarity: 'comun', sellValue: 45, buyValue: 110, source: 'Mesa de Hechicería', uses: 'Úsalo para aprender el hechizo Misil Arcano (Barra Z/T/B/N)', desc: 'Códice básico de proyectiles arcanos teledirigidos.', teachSpell: 'misil_arcano', icon: 'spell_misil_arcano' },
    grimorio_bola_fuego: { id: 'grimorio_bola_fuego', name: 'Grimorio: Bola de Fuego', category: 'magia', rarity: 'poco_comun', sellValue: 95, buyValue: 220, source: 'Mesa de Hechicería / Mazmorras', uses: 'Úsalo para aprender el hechizo Bola de Fuego en área', desc: 'Tomo ígneo con sello de combustión.', teachSpell: 'bola_fuego', icon: 'spellbook_fire' },
    grimorio_nova_hielo: { id: 'grimorio_nova_hielo', name: 'Grimorio: Nova de Escarcha', category: 'magia', rarity: 'raro', sellValue: 135, buyValue: 310, source: 'Mesa de Hechicería / Montañas Heladas', uses: 'Úsalo para aprender Nova de Escarcha (daño y ralentización)', desc: 'Páginas congeladas en cristal boreal.', teachSpell: 'nova_hielo', icon: 'scroll_blue_sealed' },
    grimorio_cadena_rayos: { id: 'grimorio_cadena_rayos', name: 'Grimorio: Cadena de Rayos', category: 'magia', rarity: 'epico', sellValue: 175, buyValue: 390, source: 'Mesa de Hechicería / Jefe Eléctrico', uses: 'Úsalo para aprender Cadena de Rayos (rebota en 4 enemigos)', desc: 'Tomo crepitante con runas tempestuosas.', teachSpell: 'cadena_rayos', icon: 'spellbook_lightning' },
    grimorio_curacion_sagrada: { id: 'grimorio_curacion_sagrada', name: 'Grimorio: Curación Sagrada', category: 'magia', rarity: 'poco_comun', sellValue: 105, buyValue: 240, source: 'Mesa de Hechicería / Aldeas', uses: 'Úsalo para aprender Curación Sagrada instantánea', desc: 'Salterio luminoso de restauración vital.', teachSpell: 'curacion_sagrada', icon: 'spellbook_holy' },
    grimorio_escudo_divino: { id: 'grimorio_escudo_divino', name: 'Grimorio: Égida Arcana', category: 'magia', rarity: 'raro', sellValue: 150, buyValue: 340, source: 'Mesa de Hechicería', uses: 'Úsalo para aprender Égida Arcana (escudo protector)', desc: 'Tratado de barreras rúnicas impenetrables.', teachSpell: 'escudo_divino', icon: 'scroll_heal' },
    grimorio_paso_etereo: { id: 'grimorio_paso_etereo', name: 'Grimorio: Paso Etéreo', category: 'magia', rarity: 'raro', sellValue: 145, buyValue: 330, source: 'Mesa de Hechicería / Bosque Oscuro', uses: 'Úsalo para aprender Paso Etéreo (teletransporte ofensivo)', desc: 'Pergamino sellado que pliega el espacio breve instante.', teachSpell: 'paso_etereo', icon: 'scroll_teleport' },
    grimorio_furia_arcana: { id: 'grimorio_furia_arcana', name: 'Grimorio: Furia Sobrecargada', category: 'magia', rarity: 'epico', sellValue: 210, buyValue: 480, source: 'Mesa de Hechicería / Laboratorio Arcano', uses: 'Úsalo para aprender Furia Sobrecargada (+30% daño y magia)', desc: 'Manifiesto prohibido de sobrecarga elemental.', teachSpell: 'furia_arcana', icon: 'spellbook_arcane' },
    grimorio_espinas_tierra: { id: 'grimorio_espinas_tierra', name: 'Grimorio: Espinas Telúricas', category: 'magia', rarity: 'raro', sellValue: 130, buyValue: 295, source: 'Mesa de Hechicería / Praderas', uses: 'Úsalo para aprender Espinas Telúricas (pinchos en área)', desc: 'Herbulario antiguo de magia geomántica.', teachSpell: 'espinas_tierra', icon: 'spellbook_nature' },
    grimorio_daga_veneno: { id: 'grimorio_daga_veneno', name: 'Grimorio: Abanico Ponzoñoso', category: 'magia', rarity: 'poco_comun', sellValue: 110, buyValue: 255, source: 'Mesa de Hechicería / Bosque Oscuro', uses: 'Úsalo para aprender Abanico Ponzoñoso (3 dagas venenosas)', desc: 'Códice sombrío de asesinos arcanos.', teachSpell: 'daga_veneno', icon: 'spell_daga_veneno' },
    grimorio_drenaje_mana: { id: 'grimorio_drenaje_mana', name: 'Grimorio: Sifón Vital', category: 'magia', rarity: 'epico', sellValue: 190, buyValue: 430, source: 'Mesa de Hechicería / Necrópolis', uses: 'Úsalo para aprender Sifón Vital (roba vida y maná en área)', desc: 'Tomo prohibido encuadernado en sombras.', teachSpell: 'drenaje_mana', icon: 'spellbook_dark' },
    grimorio_lluvia_meteoros: { id: 'grimorio_lluvia_meteoros', name: 'Grimorio: Lluvia de Meteoros', category: 'magia', rarity: 'legendario', sellValue: 320, buyValue: 740, source: 'Mesa de Hechicería / Trono de Ceniza', uses: 'Úsalo para aprender Lluvia de Meteoros (cataclismo ígneo)', desc: 'El conjuro astronómico más destructivo de Albion.', teachSpell: 'lluvia_meteoros', icon: 'scroll_red_sealed' },
    grimorio_lluvia_minerales: { id: 'grimorio_lluvia_minerales', name: 'Grimorio: Lluvia Mineral', category: 'magia', rarity: 'raro', sellValue: 145, buyValue: 330, source: 'Mesa de Hechicería', uses: 'Úsalo para aprender Lluvia Mineral (spawnea muchos minerales)', desc: 'Códice telúrico que satura tus islas con nuevas vetas minerales.', teachSpell: 'lluvia_minerales', icon: 'spell_lluvia_minerales' },
    grimorio_llamado_horda: { id: 'grimorio_llamado_horda', name: 'Grimorio: Llamado de la Horda', category: 'magia', rarity: 'raro', sellValue: 145, buyValue: 330, source: 'Mesa de Hechicería', uses: 'Úsalo para aprender Llamado de la Horda (spawnea monstruos)', desc: 'Pergamino sombrío que convoca oleadas de enemigos por las islas.', teachSpell: 'llamado_horda', icon: 'spell_llamado_horda' },
    grimorio_llamado_fauna: { id: 'grimorio_llamado_fauna', name: 'Grimorio: Llamado de Fauna', category: 'magia', rarity: 'poco_comun', sellValue: 120, buyValue: 270, source: 'Mesa de Hechicería', uses: 'Úsalo para aprender Llamado de Fauna (spawnea mobs pasivos)', desc: 'Tomo silvestre que reúne rebaños y animales pacíficos en tus islas.', teachSpell: 'llamado_fauna', icon: 'spell_llamado_fauna' },

    // =========================================================
    // FASE 5: ARQUETIPOS DE ARMAS, BÁCULOS, BALLESTAS Y DAGAS
    // =========================================================
    daga_hierro: { id: 'daga_hierro', name: 'Daga de Hierro', category: 'equipamiento', rarity: 'comun', sellValue: 32, buyValue: 75, source: 'Forja / Yunque', uses: 'Ataques rápidos (14 daño, +10% crítico)', desc: 'Hoja corta equilibrada para estocadas continuas.', weaponMelee: { dmg: 14, range: 54, arcColor: '#cfd8dc', speed: 0.19, archetype: 'dagger', critBonus: 0.10 }, icon: 'dagger_iron' },
    daga_acero: { id: 'daga_acero', name: 'Daga de Acero Sombrío', category: 'equipamiento', rarity: 'raro', sellValue: 95, buyValue: 220, source: 'Forja / Yunque Rúnico', uses: 'Filo letal (25 daño, +14% crítico y ritmo veloz)', desc: 'Templada en polvo de carbón para golpes precisos.', weaponMelee: { dmg: 25, range: 58, arcColor: '#90a4ae', speed: 0.18, archetype: 'dagger', critBonus: 0.14 }, icon: 'dagger_steel' },
    daga_oro: { id: 'daga_oro', name: 'Daga Áurea Ceremonial', category: 'equipamiento', rarity: 'raro', sellValue: 130, buyValue: 300, source: 'Pirámides / Yunque Rúnico', uses: 'Ataques áureos veloces (32 daño, +18% crítico)', desc: 'Reluce bajo las antorchas de las catacumbas.', weaponMelee: { dmg: 32, range: 60, arcColor: '#ffd54f', speed: 0.17, archetype: 'dagger', critBonus: 0.18 }, icon: 'dagger_gold' },
    daga_legendaria: { id: 'daga_legendaria', name: 'Colmillo Espectral', category: 'equipamiento', rarity: 'legendario', sellValue: 340, buyValue: 790, source: 'Yunque Rúnico / Jefes', uses: 'Daga Mítica (48 daño, +24% crítico y velocidad alta)', desc: 'Desgarra las defensas antes de que el enemigo reaccione.', weaponMelee: { dmg: 48, range: 64, arcColor: '#e040fb', speed: 0.16, archetype: 'dagger', critBonus: 0.24 }, icon: 'dagger_legendary' },

    hacha_batalla_hierro: { id: 'hacha_batalla_hierro', name: 'Hacha de Batalla de Hierro', category: 'equipamiento', rarity: 'poco_comun', sellValue: 48, buyValue: 112, source: 'Forja', uses: 'Tajo pesado en área (22 daño en abanico)', desc: 'Aplasta grupos de goblins en un solo giro.', weaponMelee: { dmg: 22, range: 74, arcColor: '#b0bec5', speed: 0.34, archetype: 'battleaxe', cleave: true }, icon: 'battleaxe_iron' },
    hacha_batalla_oro: { id: 'hacha_batalla_oro', name: 'Hacha de Guerra Solar', category: 'equipamiento', rarity: 'raro', sellValue: 155, buyValue: 360, source: 'Yunque Rúnico', uses: 'Tajo amplio solar (38 daño en área)', desc: 'Imbuida con arena estelar de las dunas.', weaponMelee: { dmg: 38, range: 80, arcColor: '#ffca28', speed: 0.32, archetype: 'battleaxe', cleave: true }, icon: 'battleaxe_gold' },
    hacha_batalla_legendaria: { id: 'hacha_batalla_legendaria', name: 'Hacha Ejecutora Titánica', category: 'equipamiento', rarity: 'legendario', sellValue: 380, buyValue: 860, source: 'Yunque Rúnico', uses: 'Hacha colosal (62 daño en área amplia)', desc: 'Parte escudos y armaduras de obsidiana.', weaponMelee: { dmg: 62, range: 88, arcColor: '#ff7043', speed: 0.30, archetype: 'battleaxe', cleave: true }, icon: 'battleaxe_legendary' },

    espadon_hierro: { id: 'espadon_hierro', name: 'Espadón de Hierro', category: 'equipamiento', rarity: 'poco_comun', sellValue: 55, buyValue: 130, source: 'Forja', uses: 'Gran alcance frontal (24 daño y barrido)', desc: 'Mandoble de dos manos para mantener distancia.', weaponMelee: { dmg: 24, range: 86, arcColor: '#cfd8dc', speed: 0.35, archetype: 'greatsword', cleave: true }, icon: 'greatsword_iron' },
    espadon_acero: { id: 'espadon_acero', name: 'Mandoble de Acero Real', category: 'equipamiento', rarity: 'raro', sellValue: 125, buyValue: 290, source: 'Forja / Yunque Rúnico', uses: 'Mandoble equilibrado (36 daño y largo alcance)', desc: 'Hoja ancha capaz de despejar hordas.', weaponMelee: { dmg: 36, range: 92, arcColor: '#90caf9', speed: 0.32, archetype: 'greatsword', cleave: true }, icon: 'greatsword_steel' },
    espadon_oro: { id: 'espadon_oro', name: 'Espadón Dorado del Sol', category: 'equipamiento', rarity: 'epico', sellValue: 220, buyValue: 510, source: 'Yunque Rúnico', uses: 'Gran hoja radiante (48 daño y amplio barrido)', desc: 'Brilla con fuego ceremonial del desierto.', weaponMelee: { dmg: 48, range: 96, arcColor: '#ffd54f', speed: 0.30, archetype: 'greatsword', cleave: true }, icon: 'greatsword_gold' },
    espadon_legendario: { id: 'espadon_legendario', name: 'Hoja Celestial de Albion', category: 'equipamiento', rarity: 'mitico', sellValue: 480, buyValue: 1120, source: 'Yunque Rúnico Supremo', uses: 'Mandoble Mítico (70 daño, barrido 106px y crítico)', desc: 'Reliquia bélica forjada para enfrentar emperadores.', weaponMelee: { dmg: 70, range: 106, arcColor: '#ff5252', speed: 0.28, archetype: 'greatsword', cleave: true, critBonus: 0.12 }, icon: 'greatsword_legendary' },

    lanza_hierro: { id: 'lanza_hierro', name: 'Lanza de Hierro', category: 'equipamiento', rarity: 'poco_comun', sellValue: 44, buyValue: 102, source: 'Forja', uses: 'Estocada de gran alcance (20 daño a 106px)', desc: 'Mantiene a salvo frente a enemigos explosivos.', weaponMelee: { dmg: 20, range: 106, arcColor: '#b0bec5', speed: 0.28, archetype: 'spear' }, icon: 'spear_iron_wep' },
    lanza_carmesi: { id: 'lanza_carmesi', name: 'Pica Carmesí', category: 'equipamiento', rarity: 'epico', sellValue: 240, buyValue: 550, source: 'Yunque Rúnico', uses: 'Estocada ardiente larga (46 daño a 118px)', desc: 'Punta forjada en ceniza volcánica.', weaponMelee: { dmg: 46, range: 118, arcColor: '#ff5252', speed: 0.26, archetype: 'spear', burnDmg: 5 }, icon: 'spear_crimson' },
    alabarda_real: { id: 'alabarda_real', name: 'Alabarda de la Guardia Real', category: 'equipamiento', rarity: 'legendario', sellValue: 355, buyValue: 815, source: 'Yunque Rúnico', uses: 'Alcance extremo y barrido (58 daño a 124px)', desc: 'Combina la longitud de la pica con el corte del hacha.', weaponMelee: { dmg: 58, range: 124, arcColor: '#ffd54f', speed: 0.28, archetype: 'spear', cleave: true }, icon: 'halberd_royal' },

    maza_hierro: { id: 'maza_hierro', name: 'Maza de Hierro', category: 'equipamiento', rarity: 'comun', sellValue: 40, buyValue: 92, source: 'Forja', uses: 'Golpe contundente (21 daño + aturdimiento 20%)', desc: 'Excelente contra esqueletos y gólems.', weaponMelee: { dmg: 21, range: 68, arcColor: '#90a4ae', speed: 0.34, archetype: 'mace', stunChance: 0.20 }, icon: 'mace_iron' },
    maza_acero: { id: 'maza_acero', name: 'Lucero del Alba de Acero', category: 'equipamiento', rarity: 'raro', sellValue: 118, buyValue: 270, source: 'Yunque Rúnico', uses: 'Impacto aplastante (36 daño + aturdimiento 25%)', desc: 'Púas de acero capaces de quebrar roca.', weaponMelee: { dmg: 36, range: 72, arcColor: '#b3e5fc', speed: 0.33, archetype: 'mace', stunChance: 0.25 }, icon: 'mace_steel' },
    maza_legendaria: { id: 'maza_legendaria', name: 'Martillo del Trueno Eón', category: 'equipamiento', rarity: 'legendario', sellValue: 365, buyValue: 840, source: 'Yunque Rúnico', uses: 'Golpe sísmico (60 daño en área + aturdimiento 35%)', desc: 'Hace retumbar el suelo en cada impacto.', weaponMelee: { dmg: 60, range: 84, arcColor: '#ffca28', speed: 0.31, archetype: 'mace', cleave: true, stunChance: 0.35 }, icon: 'mace_legendary' },

    ballesta_madera: { id: 'ballesta_madera', name: 'Ballesta de Cazador', category: 'equipamiento', rarity: 'poco_comun', sellValue: 75, buyValue: 175, source: 'Taller / Forja', uses: 'Dispara virotes rápidos de precisión (22 daño)', desc: 'Mecanismo tenso para perforar armaduras ligeras.', isRangedWeapon: true, rangedStats: { dmg: 22, speed: 590, range: 410, cooldown: 0.42, color: '#ffe082', pierce: 1 }, icon: 'crossbow_wood' },
    ballesta_legendaria: { id: 'ballesta_legendaria', name: 'Ballesta Perforadora Astral', category: 'equipamiento', rarity: 'legendario', sellValue: 385, buyValue: 880, source: 'Yunque Rúnico / Jefes', uses: 'Dispara virotes perforantes que atraviesan hasta 2 enemigos (54 daño)', desc: 'Obra maestra de precisión balística arcana.', isRangedWeapon: true, rangedStats: { dmg: 54, speed: 740, range: 500, cooldown: 0.32, color: '#e040fb', pierce: 2 }, icon: 'crossbow_legendary' },

    varita_escarcha: { id: 'varita_escarcha', name: 'Varita de Escarcha Boreal', category: 'equipamiento', rarity: 'epico', sellValue: 195, buyValue: 450, source: 'Mesa de Hechicería Avanzada', uses: 'Dispara abanico triple de esquirlas gélidas que congelan y perforan', desc: 'Lanza 3 fragmentos glaciales con explosión de escarcha.', isStaffWeapon: true, staffStats: { dmg: 18, speed: 510, range: 375, cooldown: 0.34, energyCost: 5.0, color: '#80deea', slowDur: 2.6, staffMode: 'frost_cone', vfxKey: 'pvfx_ice_shard' }, icon: 'wand_frost' },
    varita_rubi: { id: 'varita_rubi', name: 'Varita Ígnea de Rubí', category: 'equipamiento', rarity: 'epico', sellValue: 265, buyValue: 610, source: 'Mesa de Hechicería Avanzada', uses: 'Lanza 2 ascuas gemelas teledirigidas que persiguen y queman al impactar', desc: 'Bolas de fuego gemelas con rastreo automático de enemigos.', isStaffWeapon: true, staffStats: { dmg: 24, speed: 520, range: 420, cooldown: 0.31, energyCost: 5.8, color: '#ff7043', burnDmg: 8, aoeRadius: 34, staffMode: 'homing_twins', vfxKey: 'soggy_fireball' }, icon: 'wand_ruby' },
    baculo_druida: { id: 'baculo_druida', name: 'Báculo del Guardián Silvestre', category: 'equipamiento', rarity: 'epico', sellValue: 225, buyValue: 520, source: 'Mesa de Hechicería Avanzada', uses: 'Proyectil natural perforante (perfora 2) que cura +4 HP y envenena al impactar (+12% Poder Mágico)', desc: 'Libera esporas curativas y enredaderas al golpear presas.', isStaffWeapon: true, staffStats: { dmg: 30, speed: 495, range: 410, cooldown: 0.33, energyCost: 5.2, color: '#81c784', pierce: 2, poisonDmg: 7, slowDur: 1.8, staffMode: 'druid_bloom', vfxKey: 'pvfx_poison_dart' }, icon: 'staff_druid' },
    baculo_lunar: { id: 'baculo_lunar', name: 'Báculo de Media Luna', category: 'equipamiento', rarity: 'legendario', sellValue: 340, buyValue: 780, source: 'Mesa de Hechicería Suprema', uses: 'Lanza una hoja lunar Boomerang que perfora de ida y vuelve cortando por segunda vez', desc: 'Ondas crecientes que describen un retorno devastador hacia ti.', isStaffWeapon: true, staffStats: { dmg: 44, speed: 560, range: 445, cooldown: 0.34, energyCost: 6.5, color: '#b39ddb', pierce: 99, staffMode: 'lunar_boomerang', vfxKey: 'aw_slash_wave' }, icon: 'staff_crescent' },
    baculo_rubi: { id: 'baculo_rubi', name: 'Cetro Rubí del Archimago', category: 'equipamiento', rarity: 'legendario', sellValue: 490, buyValue: 1120, source: 'Mesa de Hechicería Suprema', uses: 'Orbe solar explosivo que al impactar estalla en 4 chispas ígneas radiales', desc: 'Concentra energía de archimago con racimos pirotécnicos secundarios.', isStaffWeapon: true, staffStats: { dmg: 54, speed: 590, range: 480, cooldown: 0.30, energyCost: 7.8, color: '#ff5252', aoeRadius: 68, burnDmg: 10, staffMode: 'archmage_cluster', vfxKey: 'pvfx_arcane_orb_projectile' }, icon: 'staff_ruby' },

    // =========================================================
    // FASE 5: EQUIPO ARCANO, LLAVES DE MAZMORRA Y TABLILLA RÚNICA
    // =========================================================
    sombrero_hechicero: { id: 'sombrero_hechicero', name: 'Sombrero del Hechicero', category: 'equipamiento', rarity: 'raro', sellValue: 135, buyValue: 310, source: 'Mesa de Hechicería / Jefes', uses: 'Equipa en Casco: +14 Defensa, +35 Energía Máx y +22% Poder Mágico', desc: 'Tejido con hilos de éter oscuro.', equipSlot: 'helm', stats: { def: 14, maxEnergy: 35, spellPower: 0.22 }, icon: 'hat_mage_dark' },
    sombrero_bruja: { id: 'sombrero_bruja', name: 'Sombrero Estelar de Archimaga', category: 'equipamiento', rarity: 'epico', sellValue: 265, buyValue: 610, source: 'Mesa de Hechicería', uses: 'Equipa en Casco: +22 Defensa, +55 Energía Máx, +35% Poder Mágico y -12% Enfriamiento', desc: 'Cumbre de la sastrería mágica en Albion.', equipSlot: 'helm', stats: { def: 22, maxEnergy: 55, spellPower: 0.35, spellCdRed: 0.12 }, icon: 'hat_witch_arcane' },
    armadura_paladin: { id: 'armadura_paladin', name: 'Coraza Dorada de Paladín', category: 'equipamiento', rarity: 'legendario', sellValue: 420, buyValue: 960, source: 'Yunque Rúnico / Jefes', uses: 'Equipa en Armadura: +56 Defensa, +220 Vida Máx y +1.5 HP/s', desc: 'Armadura sagrada que protege contra maldiciones.', equipSlot: 'armor', stats: { def: 56, maxHp: 220, regen: 1.5, spellResist: 0.15 }, icon: 'armor_paladin_gold' },
    yelmo_vikingo: { id: 'yelmo_vikingo', name: 'Yelmo de los Fiordos Helados', category: 'equipamiento', rarity: 'epico', sellValue: 215, buyValue: 495, source: 'Montañas Heladas / Yunque', uses: 'Equipa en Casco: +26 Defensa, +115 Vida y +16% Daño', desc: 'Astas templadas en las ventiscas boreales.', equipSlot: 'helm', stats: { def: 26, maxHp: 115, dmgPct: 0.16 }, icon: 'helm_viking' },
    anillo_diamante: { id: 'anillo_diamante', name: 'Anillo de Diamante Puro', category: 'equipamiento', rarity: 'epico', sellValue: 270, buyValue: 620, source: 'Yunque Rúnico', uses: 'Equipa en Anillo: +18 Defensa, +20% Crítico y +20% Suerte', desc: 'Engaste centelleante que protege a su portador.', equipSlot: 'ring', stats: { def: 18, critChance: 0.20, luckBonus: 0.20 }, icon: 'ring_diamond_rpg' },
    anillo_esmeralda: { id: 'anillo_esmeralda', name: 'Anillo Esmeralda de Gaia', category: 'equipamiento', rarity: 'raro', sellValue: 185, buyValue: 420, source: 'Yunque Rúnico', uses: 'Equipa en Anillo: +65 Vida Máx, +1.2 HP/s y +25% Cosecha', desc: 'Late al unísono con la flora del archipiélago.', equipSlot: 'ring', stats: { maxHp: 65, regen: 1.2, gatherBonus: 0.25 }, icon: 'ring_emerald_rpg' },
    colgante_estrella: { id: 'colgante_estrella', name: 'Amuleto de la Estrella Polar', category: 'equipamiento', rarity: 'epico', sellValue: 260, buyValue: 590, source: 'Observatorio Astral', uses: 'Equipa en Amuleto: +30% Poder Mágico, +30% Experiencia y +120 Luz', desc: 'Brilla con luz propia durante las noches oscuras.', equipSlot: 'amulet', stats: { spellPower: 0.30, xpBonus: 0.30, lightRadius: 120 }, icon: 'pendant_star' },
    colgante_calavera: { id: 'colgante_calavera', name: 'Amuleto del Señor de Criptas', category: 'equipamiento', rarity: 'legendario', sellValue: 345, buyValue: 790, source: 'Mazmorras Oscuras', uses: 'Equipa en Amuleto: +28% Daño vs Jefes, +16% Crítico y +8 Vida por baja', desc: 'Trofeo macabro temido por los soberanos de mazmorra.', equipSlot: 'amulet', stats: { bossDmgBonus: 0.28, critChance: 0.16, killHeal: 8 }, icon: 'pendant_skull' },

    llave_dorada: { id: 'llave_dorada', name: 'Llave Dorada de Cámara', category: 'materiales', rarity: 'raro', sellValue: 65, buyValue: 160, source: 'Mazmorras / Cofres', uses: 'Abre cofres dorados o forja llaves maestras', desc: 'Llave pesada grabada con símbolos antiguos.', icon: 'key_gold' },
    llave_zafiro: { id: 'llave_zafiro', name: 'Llave de Escarcha Azul', category: 'materiales', rarity: 'raro', sellValue: 85, buyValue: 205, source: 'Montañas Heladas / Laboratorios', uses: 'Abre cofres helados y cámaras arcanas', desc: 'Fría al tacto incluso junto a una fragua.', icon: 'key_blue' },
    llave_rubi: { id: 'llave_rubi', name: 'Llave Carmesí del Abismo', category: 'materiales', rarity: 'epico', sellValue: 110, buyValue: 265, source: 'Zona de Fuego / Jefes', uses: 'Abre cofres carmesíes y cámaras volcánicas', desc: 'Forjada en obsidiana templada.', icon: 'key_red' },
    llave_esqueleto: { id: 'llave_esqueleto', name: 'Llave Ósea de Catacumbas', category: 'materiales', rarity: 'raro', sellValue: 75, buyValue: 185, source: 'Bosque Oscuro / Necrópolis', uses: 'Abre cerraduras de criptas y tumbas', desc: 'Tallada en hueso petrificado.', icon: 'key_skeleton' },
    llave_jefe: { id: 'llave_jefe', name: 'Llave Soberana de Jefe', category: 'materiales', rarity: 'epico', sellValue: 140, buyValue: 330, source: 'Jefes de Mazmorra', uses: 'Material raro para grimorios supremos y tesoros', desc: 'Emite un zumbido de poder antiguo.', icon: 'key_boss' },
    llave_maestra_mazmorra: { id: 'llave_maestra_mazmorra', name: 'Llave Maestra del Archipiélago', category: 'materiales', rarity: 'legendario', sellValue: 280, buyValue: 640, source: 'Yunque Rúnico / Jefes Finales', uses: 'Abre cofres secretos o forja equipo mítico', desc: 'La llave capaz de desbloquear cualquier cámara sellada.', icon: 'key_dungeon_master' },
    tablilla_runica: { id: 'tablilla_runica', name: 'Tablilla Rúnica Antigua', category: 'materiales', rarity: 'raro', sellValue: 55, buyValue: 135, source: 'Mazmorras / Puzles', uses: 'Inscribe hechizos y mejoras en la Mesa de Hechicería', desc: 'Piedra tallada con fórmulas mágicas de Albion.', icon: 'tablet_stone' },

    // =========================================================
    // EXPANSIÓN OMEGA — MATERIALES Y EQUIPAMIENTO TIER 16
    // =========================================================
    singularidad: {
      id: 'singularidad', name: 'Singularidad', category: 'especiales', rarity: 'legendario',
      sellValue: 2500, buyValue: 0, source: 'Prensa de Singularidades (10.000 recursos)',
      uses: 'Forja de Lingote Omega, Reactores de Singularidad, Sobrecarga Infinita y Ascensión de Islas',
      desc: 'Materia colapsada en un punto gravitatorio estable.', icon: 'polvo_estelar'
    },
    lingote_omega: {
      id: 'lingote_omega', name: 'Lingote Omega', category: 'materiales', rarity: 'legendario',
      sellValue: 900, buyValue: 0, source: 'Fundidora Omega',
      uses: 'Forja de Equipamiento Tier 16 Omega y Sobrecarga Infinita',
      desc: 'Aleación definitiva templada con singularidad y la esencia de los cinco biomas.', icon: 'lingote_celestial'
    },
    materia_comprimida: {
      id: 'materia_comprimida', name: 'Materia Comprimida', category: 'especiales', rarity: 'legendario',
      sellValue: 600, buyValue: 0, source: 'Abismo Infinito / Islas Ascendidas',
      uses: 'Sobrecarga Infinita, Ascensión de Islas y mejoras definitivas',
      desc: 'Residuo hiperdenso que vibra con energía cósmica.', icon: 'gema_vacio'
    },
    casco_omega: {
      id: 'casco_omega', name: 'Yelmo de la Singularidad (T16)', category: 'equipamiento', rarity: 'legendario', tier: 16,
      sellValue: 1450, buyValue: 0, source: 'Forja Maestra / Yunque Rúnico (Casco Solar + Lingote Omega)',
      uses: 'Equipa en Casco (Tier 16): +62 Defensa, +280 Vida, +24% Daño, +25% Poder Mágico y -12% CD',
      desc: 'Corona gravitatoria que amplifica la mente y blinda al portador.',
      equipSlot: 'helm', stats: { def: 62, maxHp: 280, maxEnergy: 80, dmgPct: 0.24, spellPower: 0.25, spellCdRed: 0.12 }, icon: 'helm_solar'
    },
    armadura_omega: {
      id: 'armadura_omega', name: 'Coraza Omega del Vacío (T16)', category: 'equipamiento', rarity: 'legendario', tier: 16,
      sellValue: 1850, buyValue: 0, source: 'Forja Maestra / Yunque Rúnico (Armadura Celestial + Lingote Omega)',
      uses: 'Equipa en Armadura (Tier 16): +110 Defensa, +500 Vida Máx, +38% Daño, +18% Vel. y +2.5 HP/s',
      desc: 'Placas de horizonte de sucesos forjadas para resistir el Abismo Infinito.',
      equipSlot: 'armor', stats: { def: 110, maxHp: 500, dmgPct: 0.38, speedPct: 0.18, regen: 2.5 }, icon: 'armor_solar'
    },
    pantalones_omega: {
      id: 'pantalones_omega', name: 'Grebas Gravitatorias Omega (T16)', category: 'armaduras', rarity: 'legendario', tier: 16,
      sellValue: 1350, buyValue: 0, source: 'Forja Maestra / Yunque Rúnico (Pantalones de Acero + Lingote Omega)',
      uses: 'Equipa en Pantalones (Tier 16): +78 Defensa, +220 Vida, +15% Vel. y +15% Reducción',
      desc: 'Articulaciones de aleación Omega que estabilizan cada zancada.',
      equipSlot: 'legs', stats: { def: 78, maxHp: 220, speedPct: 0.15, defPct: 0.15 }, icon: 'leggings_legendary'
    },
    escudo_omega: {
      id: 'escudo_omega', name: 'Égida del Horizonte Omega (T16)', category: 'equipamiento', rarity: 'legendario', tier: 16,
      sellValue: 1400, buyValue: 0, source: 'Forja Maestra / Yunque Rúnico (Baluarte Celestial + Lingote Omega)',
      uses: 'Equipa en Escudo (Tier 16): +84 Defensa, +340 Vida, +24% Daño y +35% resist. mágica',
      desc: 'Escudo de contención capaz de absorber descargas del Abismo.',
      equipSlot: 'shield', stats: { def: 84, maxHp: 340, dmgPct: 0.24, spellResist: 0.35 }, icon: 'shield_celestial'
    },
    botas_omega: {
      id: 'botas_omega', name: 'Botas de Salto Cuántico Omega (T16)', category: 'equipamiento', rarity: 'legendario', tier: 16,
      sellValue: 1300, buyValue: 0, source: 'Forja Maestra / Yunque Rúnico (Botas Celestiales + Lingote Omega)',
      uses: 'Equipa en Botas (Tier 16): +58 Defensa, +46% Velocidad, +260 Vida, +160 imán y -30% gasto energía',
      desc: 'Impulsan al portador mediante micro-distorsiones espaciales.',
      equipSlot: 'boots', stats: { def: 58, speedPct: 0.46, maxHp: 260, magnetRadius: 160, energySave: 0.30 }, icon: 'boots_legendary'
    },
    hoja_singularidad: {
      id: 'hoja_singularidad', name: 'Hoja de la Singularidad (T16)', category: 'equipamiento', rarity: 'legendario', tier: 16,
      sellValue: 1950, buyValue: 0, source: 'Yunque Rúnico (Lingote Omega + Singularidad)',
      uses: 'Espada especial Tier 16: 135 daño, amplio corte cósmico con onda de choque',
      desc: 'Filo monocristalino que desgarra la materia en cada tajo.',
      weaponMelee: true, meleeStats: { dmg: 135, range: 112, cooldown: 0.24, color: '#e040fb', critChance: 0.22 }, icon: 'sword_celestial'
    },
    arco_omega: {
      id: 'arco_omega', name: 'Arco Gravitatorio Omega (T16)', category: 'equipamiento', rarity: 'legendario', tier: 16,
      sellValue: 1900, buyValue: 0, source: 'Yunque Rúnico (Lingote Omega + Singularidad)',
      uses: 'Arma a distancia Tier 16: dispara proyectiles perforantes (98 daño, perfora 4)',
      desc: 'Acelera virotes de energía comprimida a través de múltiples objetivos.',
      isRangedWeapon: true, rangedStats: { dmg: 98, speed: 860, range: 560, cooldown: 0.24, color: '#e040fb', pierce: 4 }, icon: 'crossbow_legendary'
    },
    cetro_omega: {
      id: 'cetro_omega', name: 'Cetro del Colapso Omega (T16)', category: 'equipamiento', rarity: 'legendario', tier: 16,
      sellValue: 1950, buyValue: 0, source: 'Yunque Rúnico (Lingote Omega + Singularidad)',
      uses: 'Báculo Tier 16: orbes de singularidad explosivos (95 daño en área, quema y ralentiza)',
      desc: 'Canaliza singularidades contenidas que detonan en racimos cósmicos.',
      isStaffWeapon: true, staffStats: { dmg: 95, speed: 640, range: 520, cooldown: 0.25, energyCost: 7.5, color: '#e040fb', aoeRadius: 84, burnDmg: 18, slowDur: 2.0, staffMode: 'archmage_cluster', vfxKey: 'pvfx_arcane_orb_projectile' }, icon: 'staff_ruby'
    }
  };

  Balaclava.ITEMS = ITEMS;
})();
