(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  // 12-Chapter Main Saga guiding the player across biomes, farming, fishing, minting, enchanting & dungeons
  const STORY_CHAPTERS = [
    {
      id: 'cap_1',
      title: 'I. El Despertar en la Isla Cero',
      lore: 'Despiertas con tu capucha Balaclava en una isla diminuta. Las aguas ocultan antiguos puentes y la leyenda habla de cinco biomas fragmentados por el Colapso Rúnico.',
      objective: 'Recolecta madera y piedra, y construye tu primer Horno o Mercado.',
      check: (gs) => (gs.stats.gatheredTotal >= 8 && gs.buildings.length >= 1),
      getProgress: (gs) => [
        { label: 'Recursos', cur: Math.min(8, gs.stats.gatheredTotal || 0), max: 8 },
        { label: 'Estructuras', cur: Math.min(1, gs.buildings.length), max: 1 }
      ],
      reward: { coins: 40, xp: 45, items: { bayas: 5 } }
    },
    {
      id: 'cap_2',
      title: 'II. Tierra Fértil y Primera Cosecha',
      lore: 'Quien domina la tierra no pasa hambre ni fatiga. Forja una Azada, ara parcelas húmedas y haz brotar el primer huerto del archipiélago.',
      objective: 'Consigue una Azada, ara al menos 4 baldosas o cosecha 5 cultivos.',
      check: (gs) => !!gs.toolTiers.azada && ((gs.stats.tilesTilled || 0) >= 4 || gs.stats.cropsHarvested >= 5),
      getProgress: (gs) => [
        { label: 'Azada', cur: gs.toolTiers.azada ? 1 : 0, max: 1 },
        { label: 'Tierra arada', cur: Math.min(4, gs.stats.tilesTilled || 0), max: 4 }
      ],
      reward: { coins: 65, xp: 60, items: { semillas_tomate: 4, semillas_papa: 4 } }
    },
    {
      id: 'cap_3',
      title: 'III. Fronteras Más Allá del Agua',
      lore: 'El Anciano Eldrin recuerda cuando todas las tierras estaban unidas. Cada parcela que compras con oro hace emerger ruinas olvidadas y une puentes antiguos.',
      objective: 'Desbloquea al menos 3 parcelas nuevas de terreno (pulsa M o el icono del Mapa).',
      check: (gs) => gs.unlockedPlots.length >= 4,
      getProgress: (gs) => [
        { label: 'Islas totales', cur: Math.min(4, gs.unlockedPlots.length), max: 4 }
      ],
      reward: { coins: 90, xp: 80, items: { lingote_hierro: 4, semillas_zanahoria: 4 } }
    },
    {
      id: 'cap_4',
      title: 'IV. El Arte de la Pesca Viva',
      lore: 'Las aguas cristalinas alrededor de tus islas rebosan anchoas, lubinas, truchas arcoíris y reliquias marinas.',
      objective: 'Fabrica una Caña de Pescar y atrapa al menos 4 peces o tesoros del mar.',
      check: (gs) => !!gs.toolTiers.cana && (gs.stats.fishCaught || 0) >= 4,
      getProgress: (gs) => [
        { label: 'Caña', cur: gs.toolTiers.cana ? 1 : 0, max: 1 },
        { label: 'Peces capturados', cur: Math.min(4, gs.stats.fishCaught || 0), max: 4 }
      ],
      reward: { coins: 110, xp: 95, items: { cebo_gusano: 5, tomate: 3 } }
    },
    {
      id: 'cap_5',
      title: 'V. El Despertar Industrial',
      lore: 'Para sobrevivir a las dunas y bosques oscuros necesitarás máquinas que trabajen por ti mientras exploras las mazmorras.',
      objective: 'Construye al menos 4 edificios distintos y mejora una herramienta.',
      check: (gs) => new Set(gs.buildings.map(b => b.type)).size >= 4 && Object.values(gs.toolTiers || {}).some(t => t && t !== 'basica'),
      getProgress: (gs) => [
        { label: 'Edificios únicos', cur: Math.min(4, new Set(gs.buildings.map(b => b.type)).size), max: 4 },
        { label: 'Mejora herramienta', cur: Object.values(gs.toolTiers || {}).some(t => t && t !== 'basica') ? 1 : 0, max: 1 }
      ],
      reward: { coins: 120, xp: 140, items: { engrane: 3, llave_mazmorra: 1 } }
    },
    {
      id: 'cap_6',
      title: 'VI. Casa de la Moneda',
      lore: 'Los antiguos mercaderes acuñaban monedas directamente del hierro, la plata y el oro fundido en sus fraguas.',
      objective: 'Acuña al menos 40 monedas en artesanía/forja o alcanza 500 monedas acumuladas.',
      check: (gs) => (gs.stats.coinsMinted || 0) >= 40 || (gs.stats.coinsEarned || 0) >= 500,
      getProgress: (gs) => [
        { label: 'Monedas acuñadas', cur: Math.min(40, gs.stats.coinsMinted || 0), max: 40 },
        { label: 'Oro ganado', cur: Math.min(500, gs.stats.coinsEarned || 0), max: 500 }
      ],
      reward: { coins: 160, xp: 170, items: { lingote_oro: 4, cebo_dorado: 2 } }
    },
    {
      id: 'cap_7',
      title: 'VII. Primer Sello de las Criptas',
      lore: 'Bajo la Pradera Esmeralda se esconde un laberinto con placas rúnicas, trampas de pinchos y un Guardián corrompido.',
      objective: 'Explora y derrota al Jefe de al menos 1 Mazmorra.',
      check: (gs) => gs.clearedDungeons.length >= 1,
      getProgress: (gs) => [
        { label: 'Mazmorras', cur: Math.min(1, gs.clearedDungeons.length), max: 1 }
      ],
      reward: { coins: 200, xp: 240, items: { cristales: 4, llave_mazmorra: 1 } }
    },
    {
      id: 'cap_8',
      title: 'VIII. Ecos de las Mazmorras',
      lore: 'Cada bioma custodia un Fragmento Antiguo del archipiélago tras múltiples alas de acertijos y guardianes.',
      objective: 'Derrota al menos 3 Jefes de Mazmorra en cualquiera de los biomas.',
      check: (gs) => gs.clearedDungeons.length >= 3,
      getProgress: (gs) => [
        { label: 'Mazmorras', cur: Math.min(3, gs.clearedDungeons.length), max: 3 }
      ],
      reward: { coins: 280, xp: 320, items: { cristales_magicos: 4, diamantes: 2 } }
    },
    {
      id: 'cap_9',
      title: 'IX. Maestro del Encantamiento',
      lore: 'En la Mesa de Encantamientos puedes imbuir herramientas y armaduras con runas arcanas que multiplican tu poder.',
      objective: 'Construye una Mesa de Encantamientos e inscribe al menos 1 encantamiento.',
      check: (gs) => Object.values(gs.toolEnchants || {}).some(e => Object.keys(e).length > 0) || Object.keys(gs.armorEnchants || {}).length > 0,
      getProgress: (gs) => {
        const hasEnch = Object.values(gs.toolEnchants || {}).some(e => Object.keys(e).length > 0) || Object.keys(gs.armorEnchants || {}).length > 0;
        return [{ label: 'Encantamientos', cur: hasEnch ? 1 : 0, max: 1 }];
      },
      reward: { coins: 340, xp: 380, items: { amatista: 2, cristales_magicos: 4 } }
    },
    {
      id: 'cap_10',
      title: 'X. Peregrino de Secretos',
      lore: 'Altares olvidados y monumentos secretos esperan en las islas lejanas. Domina el Mapa Mundial y despierta sus bendiciones.',
      objective: 'Desbloquea 10 parcelas y activa al menos 2 Altares o Estructuras Secretas.',
      check: (gs) => gs.unlockedPlots.length >= 10 && ((gs.stats.altarsUsed || 0) + (gs.stats.secretsFound || 0)) >= 2,
      getProgress: (gs) => [
        { label: 'Parcelas', cur: Math.min(10, gs.unlockedPlots.length), max: 10 },
        { label: 'Altares/Secretos', cur: Math.min(2, (gs.stats.altarsUsed || 0) + (gs.stats.secretsFound || 0)), max: 2 }
      ],
      reward: { coins: 460, xp: 520, items: { polvo_estelar: 2, zafiro: 2 } }
    },
    {
      id: 'cap_11',
      title: 'XI. La Cima de Fuego y Hielo',
      lore: 'Conquista las 10 Mazmorras del archipiélago expandido. Reúne los sellos ancestrales de todos los biomas para forjar el Corazón de Balaclava.',
      objective: 'Completa las 10 Mazmorras del mundo.',
      check: (gs) => gs.clearedDungeons.length >= 10,
      getProgress: (gs) => [
        { label: 'Mazmorras', cur: Math.min(10, gs.clearedDungeons.length), max: 10 }
      ],
      reward: { coins: 850, xp: 900, items: { fragmentos_antiguos: 5, lingotes_especiales: 4 } }
    },
    {
      id: 'cap_12',
      title: 'XII. El Corazón de Balaclava',
      lore: 'En tu Centro de Investigación o Laboratorio aguarda la síntesis final. Reconstruye el Corazón de Balaclava y restaura el archipiélago.',
      objective: 'Fabrica el Corazón de Balaclava (nucleo_balaclava) y consagra el mundo.',
      check: (gs) => (gs.inventory.nucleo_balaclava || 0) >= 1 || gs.stats.craftedCore,
      getProgress: (gs) => [
        { label: 'Corazón de Balaclava', cur: ((gs.inventory.nucleo_balaclava || 0) >= 1 || gs.stats.craftedCore) ? 1 : 0, max: 1 }
      ],
      reward: { coins: 2500, xp: 1400, items: { diamantes: 10, esmeraldas: 10 } }
    },
    {
      id: 'cap_13',
      title: 'XIII. Despertar Rúnico',
      lore: 'Aprende el lenguaje olvidado de las piedras elementales y graba tus primeras runas y encantamientos de alto nivel.',
      objective: 'Fabrica al menos 3 Runas elementales e inscribe 4 encantamientos.',
      check: (gs) => {
        const runas = (gs.stats.byItem.runa_fuego || 0) + (gs.stats.byItem.runa_agua || 0) + (gs.stats.byItem.runa_tierra || 0) + (gs.stats.byItem.runa_aire || 0) + (gs.stats.byItem.runa_luz || 0) + (gs.stats.byItem.runa_oscura || 0) + (gs.stats.byItem.runa_vida || 0);
        const ench = Object.values(gs.toolEnchants || {}).reduce((a, e) => a + Object.keys(e).length, 0) + Object.values(gs.armorEnchants || {}).reduce((a, e) => a + Object.keys(e).length, 0);
        return runas >= 3 && ench >= 4;
      },
      getProgress: (gs) => {
        const runas = (gs.stats.byItem.runa_fuego || 0) + (gs.stats.byItem.runa_agua || 0) + (gs.stats.byItem.runa_tierra || 0) + (gs.stats.byItem.runa_aire || 0) + (gs.stats.byItem.runa_luz || 0) + (gs.stats.byItem.runa_oscura || 0) + (gs.stats.byItem.runa_vida || 0);
        const ench = Object.values(gs.toolEnchants || {}).reduce((a, e) => a + Object.keys(e).length, 0) + Object.values(gs.armorEnchants || {}).reduce((a, e) => a + Object.keys(e).length, 0);
        return [
          { label: 'Runas creadas', cur: Math.min(3, runas), max: 3 },
          { label: 'Encantamientos activos', cur: Math.min(4, ench), max: 4 }
        ];
      },
      reward: { coins: 1650, xp: 1100, items: { gema_alma: 2, runa_luz: 1 } }
    },
    {
      id: 'cap_14',
      title: 'XIV. Arsenal de Adamantita',
      lore: 'Los mares exteriores esconden menas capaces de superar el mitrilo. Forja equipamiento y herramientas de Adamantita o superior.',
      objective: 'Alcanza nivel Adamantita o Celestial en al menos 2 herramientas.',
      check: (gs) => Object.values(gs.toolTiers || {}).filter(t => ['adamantita', 'legendaria', 'celestial'].includes(t)).length >= 2,
      getProgress: (gs) => [
        { label: 'Herramientas Adamantita+', cur: Math.min(2, Object.values(gs.toolTiers || {}).filter(t => ['adamantita', 'legendaria', 'celestial'].includes(t)).length), max: 2 }
      ],
      reward: { coins: 2200, xp: 1350, items: { lingote_celestial: 4, bomba_abismal: 2 } }
    },
    {
      id: 'cap_15',
      title: 'XV. Coleccionista de Reliquias',
      lore: 'Cada gran guardián custodia una reliquia eterna. Reúne los tesoros de al menos 6 jefes distintos.',
      objective: 'Consigue 6 Reliquias Permanentes y visita 5 Altares.',
      check: (gs) => (gs.permanentRelics || []).length >= 6 && (gs.stats.altarsUsed || 0) >= 5,
      getProgress: (gs) => [
        { label: 'Reliquias Permanentes', cur: Math.min(6, (gs.permanentRelics || []).length), max: 6 },
        { label: 'Altares visitados', cur: Math.min(5, gs.stats.altarsUsed || 0), max: 5 }
      ],
      reward: { coins: 2900, xp: 1700, items: { elixir_supremo: 3, gema_alma: 3 } }
    },
    {
      id: 'cap_16',
      title: 'XVI. Soberano Celestial',
      lore: 'Solo quien domina la forja astral, la alquimia cósmica y las constelaciones merece gobernar Balaclava.',
      objective: 'Forja una herramienta Celestial y desbloquea 75 estrellas del Árbol.',
      check: (gs) => Object.values(gs.toolTiers || {}).includes('celestial') && (gs.unlockedSkills || []).length >= 75,
      getProgress: (gs) => [
        { label: 'Herramienta Celestial', cur: Object.values(gs.toolTiers || {}).includes('celestial') ? 1 : 0, max: 1 },
        { label: 'Habilidades Estelares', cur: Math.min(75, (gs.unlockedSkills || []).length), max: 75 }
      ],
      reward: { coins: 5000, xp: 2800, items: { baculo_estelar: 1, amuleto_diamante: 1 } }
    },
    {
      id: 'cap_17',
      title: 'XVII. Senda del Hechicero',
      lore: 'Más allá del acero y la pólvora yace la magia pura. Construye una Mesa de Hechicería y aprende conjuros activos para tu barra rápida.',
      objective: 'Construye la Mesa de Hechicería y aprende al menos 4 hechizos activos.',
      check: (gs) => gs.buildings.some(b => b.type === 'mesa_hechiceria') && (gs.unlockedSpells || []).length >= 4,
      getProgress: (gs) => [
        { label: 'Mesa de Hechicería', cur: gs.buildings.some(b => b.type === 'mesa_hechiceria') ? 1 : 0, max: 1 },
        { label: 'Hechizos desbloqueados', cur: Math.min(4, (gs.unlockedSpells || []).length), max: 4 }
      ],
      reward: { coins: 1800, xp: 1200, items: { sombrero_hechicero: 1, tablilla_runica: 4 } }
    },
    {
      id: 'cap_18',
      title: 'XVIII. Forja del Yunque Rúnico',
      lore: 'Los antiguos maestros herreros forjaban armas especializadas para cada estilo de combate: dagas veloces, alabardas y báculos.',
      objective: 'Construye el Yunque Rúnico y fabrica al menos 3 armas de arquetipo o grimorios.',
      check: (gs) => gs.buildings.some(b => b.type === 'yunque_runico') && ((gs.stats.byItem.daga_acero || 0) + (gs.stats.byItem.espadon_acero || 0) + (gs.stats.byItem.lanza_carmesi || 0) + (gs.stats.byItem.maza_acero || 0) + (gs.stats.byItem.ballesta_madera || 0) + (gs.stats.byItem.baculo_druida || 0) + (gs.stats.byItem.varita_escarcha || 0)) >= 1,
      getProgress: (gs) => {
        const built = gs.buildings.some(b => b.type === 'yunque_runico') ? 1 : 0;
        const armed = ((gs.stats.byItem.daga_acero || 0) + (gs.stats.byItem.espadon_acero || 0) + (gs.stats.byItem.lanza_carmesi || 0) + (gs.stats.byItem.maza_acero || 0) + (gs.stats.byItem.ballesta_madera || 0) + (gs.stats.byItem.baculo_druida || 0) + (gs.stats.byItem.varita_escarcha || 0)) >= 1 ? 1 : 0;
        return [
          { label: 'Yunque Rúnico', cur: built, max: 1 },
          { label: 'Arma Especializada', cur: armed, max: 1 }
        ];
      },
      reward: { coins: 2400, xp: 1550, items: { llave_dorada: 2, cristales_magicos: 6 } }
    },
    {
      id: 'cap_19',
      title: 'XIX. Conquistador de Veinte Criptas',
      lore: 'Veinticuatro fortalezas, laboratorios, oasis y fraguas subterráneas aguardaban tras el cataclismo. Somételas a tu voluntad.',
      objective: 'Completa al menos 20 Mazmorras distintas y reúne 16 Reliquias.',
      check: (gs) => (gs.clearedDungeons || []).length >= 20 && (gs.permanentRelics || []).length >= 16,
      getProgress: (gs) => [
        { label: 'Mazmorras conquistadas', cur: Math.min(20, (gs.clearedDungeons || []).length), max: 20 },
        { label: 'Reliquias reunidas', cur: Math.min(16, (gs.permanentRelics || []).length), max: 16 }
      ],
      reward: { coins: 4500, xp: 2800, items: { llave_maestra_mazmorra: 2, gema_alma: 4 } }
    },
    {
      id: 'cap_20',
      title: 'XX. Emperador de Ceniza y Estrellas',
      lore: 'En lo más profundo del archipiélago yace el Trono de Ceniza Primordial. Derrota al Emperador Kael-Vorn y completa la gloria de Albion.',
      objective: 'Conquista el Trono de Ceniza Primordial y aprende 10 Hechizos.',
      check: (gs) => (gs.clearedDungeons || []).includes('volcan_trono_ceniza') && (gs.unlockedSpells || []).length >= 10,
      getProgress: (gs) => [
        { label: 'Trono de Ceniza', cur: (gs.clearedDungeons || []).includes('volcan_trono_ceniza') ? 1 : 0, max: 1 },
        { label: 'Grimorios aprendidos', cur: Math.min(10, (gs.unlockedSpells || []).length), max: 10 }
      ],
      reward: { coins: 9000, xp: 5200, items: { espadon_legendario: 1, lingote_celestial: 10 } }
    }
  ];

  // 5 Named NPCs scattered across plots with deep multi-stage questlines (32 quests total)
  const NPCS = [
    {
      id: 'eldrin',
      name: 'Eldrin el Cartógrafo',
      biome: 'pradera',
      plot: [4, 4],
      tileOffset: [2, 2],
      spriteKey: 'char1',
      personality: 'Sabio, paciente y fascinado por la historia olvidada de las islas.',
      greeting: '¡Ah, portador de la Balaclava! Estas islas flotan sobre los restos de un antiguo reino. Cada moneda y cada cosecha devuelve la vida al archipiélago.',
      quests: [
        {
          id: 'q_eldrin_1',
          title: 'Primeros Suministros',
          desc: 'Tráeme 28 de Madera, 24 de Piedra y 12 de Fibra Vegetal para restaurar la torre cartográfica.',
          reqItems: { madera: 28, piedra: 24, fibra_vegetal: 12 },
          reward: { coins: 85, xp: 85, items: { pan: 3, hierro: 4 } }
        },
        {
          id: 'q_eldrin_2',
          title: 'Huerto del Cartógrafo',
          desc: 'Entrégame 14 de Trigo, 10 Tomates Jugosos y 6 Zanahorias cultivadas de tu huerta.',
          reqItems: { trigo: 14, tomate: 10, zanahoria: 6 },
          reward: { coins: 145, xp: 140, items: { semillas_papa: 6, fertilizante: 5 } }
        },
        {
          id: 'q_eldrin_3',
          title: 'Horizonte Expandido',
          desc: 'Expande tu territorio a 5 parcelas y mantén al menos 5 estructuras construidas.',
          reqCheck: (gs) => gs.unlockedPlots.length >= 5 && gs.buildings.length >= 5,
          reward: { coins: 195, xp: 175, items: { lingote_cobre: 6, llave_mazmorra: 1 } }
        },
        {
          id: 'q_eldrin_4',
          title: 'Crónicas de la Costa',
          desc: 'Captura 15 peces y entrega 6 Pescados Comunes y 4 Lingotes de Hierro para expediciones marítimas.',
          reqItems: { pez_comun: 6, lingote_hierro: 4 },
          reqCheck: (gs) => (gs.stats.fishCaught || 0) >= 15,
          reward: { coins: 240, xp: 210, items: { cebo_dorado: 4, patatas_asadas: 3 } }
        },
        {
          id: 'q_eldrin_5',
          title: 'Secretos de la Cripta',
          desc: 'Derrota 12 criaturas de la Pradera y conquista al Rey Limo en la Cripta Esmeralda.',
          reqKillBiome: { biome: 'pradera', count: 12 },
          reqDungeon: 'pradera',
          reward: { coins: 340, xp: 310, items: { esmeraldas: 3, lingote_hierro: 6 } }
        },
        {
          id: 'q_eldrin_6',
          title: 'Reliquias del Pasado',
          desc: 'Reúne 5 Fragmentos Antiguos y 10 de Jade explorando mazmorras y vetas.',
          reqItems: { fragmentos_antiguos: 5, jade: 10 },
          reward: { coins: 580, xp: 450, items: { anillo_mercader: 1 } }
        },
        {
          id: 'q_eldrin_7',
          title: 'El Atlas Maestro',
          desc: 'Desbloquea al menos 24 parcelas y completa 4 mazmorras del archipiélago.',
          reqCheck: (gs) => gs.unlockedPlots.length >= 24 && gs.clearedDungeons.length >= 4,
          reward: { coins: 1100, xp: 850, items: { diamantes: 6, fragmentos_antiguos: 4 } }
        }
      ]
    },
    {
      id: 'zara',
      name: 'Zara la Mercader del Sol',
      biome: 'desierto',
      plot: [4, 4],
      tileOffset: [5, 4],
      spriteKey: 'char2',
      personality: 'Astuta, carismática y experta en gemas y rutas del desierto.',
      greeting: '¡El desierto escupe oro y escorpiones por igual! Si abasteces mi caravana con cosechas, minerales y victorias, haré crecer tu fortuna.',
      quests: [
        {
          id: 'q_zara_1',
          title: 'Cristal de las Dunas',
          desc: 'Entrégame 22 de Arena, 10 Cristales y 8 de Azufre para tallar lentes solares.',
          reqItems: { arena: 22, cristales: 10, azufre: 8 },
          reward: { coins: 240, xp: 190, items: { semillas_calabaza: 6, lingote_oro: 2 } }
        },
        {
          id: 'q_zara_2',
          title: 'Caza de Escorpiones',
          desc: 'Derrota 18 enemigos en el Desierto o en su Templo.',
          reqKillBiome: { biome: 'desierto', count: 18 },
          reward: { coins: 380, xp: 290, items: { lingote_oro: 6, pocion_suerte: 3 } }
        },
        {
          id: 'q_zara_3',
          title: 'Provisiones de Caravana',
          desc: 'Prepara 14 Patatas Doradas, 12 Zanahorias y 6 Chiles para la travesía.',
          reqItems: { papa: 14, zanahoria: 12, chile: 6 },
          reward: { coins: 360, xp: 300, items: { tortilla_patata: 4, semillas_chile: 5 } }
        },
        {
          id: 'q_zara_4',
          title: 'Ruta de Oro y Topacio',
          desc: 'Tráeme 12 Lingotes de Oro, 5 Topacios pulidos y 8 Lingotes de Plata.',
          reqItems: { lingote_oro: 12, topacio: 5, lingote_plata: 8 },
          reward: { coins: 620, xp: 450, items: { anillo_platino: 1 } }
        },
        {
          id: 'q_zara_5',
          title: 'Caída del Faraón',
          desc: 'Completa el Templo de Arena y entrega 4 Lingotes de Platino para sellar su tesoro.',
          reqItems: { lingote_platino: 4 },
          reqDungeon: 'desierto',
          reward: { coins: 690, xp: 520, items: { llave_mazmorra: 2, rubi: 3 } }
        },
        {
          id: 'q_zara_6',
          title: 'El Centurión Solar',
          desc: 'Conquista la Pirámide Enterrada, vence a Anub y supera 25 bajas en Desierto.',
          reqKillBiome: { biome: 'desierto', count: 25 },
          reqDungeon: 'desierto_piramide',
          reward: { coins: 980, xp: 760, items: { diamantes: 6, lingote_platino: 6 } }
        }
      ]
    },
    {
      id: 'lyra',
      name: 'Lyra la Alquimista Sombría',
      biome: 'bosque_oscuro',
      plot: [2, 2],
      tileOffset: [5, 5],
      spriteKey: 'char3',
      personality: 'Misteriosa, algo excéntrica, amante de las setas brillantes y pociones.',
      greeting: 'Shhh... ¿oyes cantar a los hongos? La esencia oscura y los cultivos raros esconden secretos alquímicos sorprendentes.',
      quests: [
        {
          id: 'q_lyra_1',
          title: 'Esporas Nocturnas',
          desc: 'Recolecta 16 Hongos Luminosos, 10 Esencias Oscuras y 6 de Hierba.',
          reqItems: { hongo_luminoso: 16, esencia_oscura: 10, hierba: 6 },
          reward: { coins: 420, xp: 320, items: { pocion_vida: 4, semillas_cristal: 5 } }
        },
        {
          id: 'q_lyra_2',
          title: 'Botánica Crepuscular',
          desc: 'Entrégame 10 Berenjenas Moradas, 10 Fresas Reales y 4 Flores de Cristal.',
          reqItems: { berenjena: 10, fresa: 10, flor_cristal: 4 },
          reward: { coins: 480, xp: 360, items: { pocion_cosecha: 3, elixir_arcano: 2 } }
        },
        {
          id: 'q_lyra_3',
          title: 'Purga de la Caverna',
          desc: 'Completa la mazmorra Caverna Sombría y entrega 4 Cristales Mágicos.',
          reqItems: { cristales_magicos: 4 },
          reqDungeon: 'bosque_oscuro',
          reward: { coins: 650, xp: 490, items: { amuleto_imantado: 1 } }
        },
        {
          id: 'q_lyra_4',
          title: 'Sombra en los Árboles',
          desc: 'Derrota 26 criaturas en el Bosque Oscuro.',
          reqKillBiome: { biome: 'bosque_oscuro', count: 26 },
          reward: { coins: 580, xp: 450, items: { amatista: 4, pocion_nocturna: 3 } }
        },
        {
          id: 'q_lyra_5',
          title: 'Tinta y Grimorio',
          desc: 'Destila 8 Frascos de Tinta Arcana y 5 Amatistas para mis pergaminos.',
          reqItems: { tinta_arcana: 8, amatista: 5 },
          reward: { coins: 740, xp: 560, items: { pergamino_rayo: 3, pergamino_fortuna: 2 } }
        },
        {
          id: 'q_lyra_6',
          title: 'Señor de la Necrópolis',
          desc: 'Desafía y derrota al Soberano de la Necrópolis Real.',
          reqKillBiome: { biome: 'bosque_oscuro', count: 35 },
          reqDungeon: 'bosque_necro',
          reward: { coins: 1180, xp: 880, items: { polvo_estelar: 4, fragmentos_antiguos: 3 } }
        }
      ]
    },
    {
      id: 'bjorn',
      name: 'Bjorn el Maestro Forjador',
      biome: 'montanas_heladas',
      plot: [3, 1],
      tileOffset: [6, 5],
      spriteKey: 'char4',
      personality: 'Rudo pero generoso, obsesionado con el mitrilo y la automatización.',
      greeting: '¡Ja! ¡Con este frío hasta las barbas se hielan, pero el fuego de mi forja nunca muere! Forjemos acero digno de reyes.',
      quests: [
        {
          id: 'q_bjorn_1',
          title: 'Engranajes Bajo Cero',
          desc: 'Tráeme 10 Engranajes Mecánicos, 14 Lingotes de Acero y 10 de Carbón.',
          reqItems: { engrane: 10, lingote_acero: 14, carbon: 10 },
          reward: { coins: 650, xp: 480, items: { lingotes_especiales: 4 } }
        },
        {
          id: 'q_bjorn_2',
          title: 'Armadura de Platino',
          desc: 'Entrégame 10 Lingotes de Platino, 12 de Cuero curado y 8 Lingotes de Plata.',
          reqItems: { lingote_platino: 10, cuero: 12, lingote_plata: 8 },
          reward: { coins: 740, xp: 540, items: { jade: 4, llave_mazmorra: 3 } }
        },
        {
          id: 'q_bjorn_3',
          title: 'Barrido en la Ventisca',
          desc: 'Derrota 24 criaturas en las Montañas Heladas.',
          reqKillBiome: { biome: 'montanas_heladas', count: 24 },
          reward: { coins: 690, xp: 520, items: { zafiro: 4, bomba_escarcha: 4 } }
        },
        {
          id: 'q_bjorn_4',
          title: 'El Bastión Helado',
          desc: 'Completa la Ciudadela Helada y entrega 4 Zafiros glaciales.',
          reqItems: { zafiro: 4 },
          reqDungeon: 'montanas_heladas',
          reward: { coins: 890, xp: 680, items: { lingotes_especiales: 5, diamantes: 3 } }
        },
        {
          id: 'q_bjorn_5',
          title: 'Aleación de Mitrilo',
          desc: 'Reúne 10 Lingotes de Mitrilo y 6 Cristales Mágicos en tu fragua.',
          reqItems: { lingotes_especiales: 10, cristales_magicos: 6 },
          reward: { coins: 1050, xp: 780, items: { anillo_mitrilo: 1 } }
        },
        {
          id: 'q_bjorn_6',
          title: 'Conquista del Glaciar Arcano',
          desc: 'Derrota al Archimago Boreal en el Santuario del Glaciar Arcano y abate 35 bestias.',
          reqKillBiome: { biome: 'montanas_heladas', count: 35 },
          reqDungeon: 'montanas_glaciar',
          reward: { coins: 1380, xp: 1050, items: { lingote_adamantita: 5, fragmentos_antiguos: 4 } }
        }
      ]
    },
    {
      id: 'ignis',
      name: 'Ignis el Guardián de Ceniza',
      biome: 'tierras_volcanicas',
      plot: [2, 5],
      tileOffset: [5, 5],
      spriteKey: 'char5',
      personality: 'Solemne, antiguo protector del sello volcánico y las llamas primordiales.',
      greeting: 'Has llegado lejos, viajero. En las entrañas de este cráter arde la chispa original de Balaclava. Solo los dignos conquistan el Abismo.',
      quests: [
        {
          id: 'q_ignis_1',
          title: 'Prueba de Obsidiana',
          desc: 'Consigue 16 de Obsidiana Ígnea, 8 Diamantes y 8 de Azufre.',
          reqItems: { material_volcanico: 16, diamantes: 8, azufre: 8 },
          reward: { coins: 980, xp: 720, items: { fragmentos_antiguos: 4, llave_mazmorra: 3 } }
        },
        {
          id: 'q_ignis_2',
          title: 'Cacería Volcánica',
          desc: 'Derrota 30 enemigos en las Tierras Volcánicas.',
          reqKillBiome: { biome: 'tierras_volcanicas', count: 30 },
          reward: { coins: 920, xp: 680, items: { sanguinaria: 4, elixir_titan: 3 } }
        },
        {
          id: 'q_ignis_3',
          title: 'Banquete de Campaña',
          desc: 'Tráeme 6 Tortillas Campestres, 10 Chiles Ígneos y 6 Filetes Asados para la guardia.',
          reqItems: { tortilla_patata: 6, chile: 10, filete: 6 },
          reward: { coins: 820, xp: 620, items: { banquete_real: 3, manzana_dorada: 2 } }
        },
        {
          id: 'q_ignis_4',
          title: 'Ciudadela Carmesí',
          desc: 'Completa la Ciudadela Carmesí y entrega 4 Rubíes ardientes.',
          reqItems: { rubi: 4 },
          reqDungeon: 'tierras_volcanicas',
          reward: { coins: 1280, xp: 940, items: { escamas_dragon: 4, lingote_celestial: 3 } }
        },
        {
          id: 'q_ignis_5',
          title: 'Forja de Adamantita',
          desc: 'Entrega 8 Lingotes de Adamantita, 6 Piedras Sanguinarias y 4 Lingotes de Mitrilo.',
          reqItems: { lingote_adamantita: 8, sanguinaria: 6, lingotes_especiales: 4 },
          reward: { coins: 1320, xp: 960, items: { polvo_estelar: 4, bomba_solar: 3 } }
        },
        {
          id: 'q_ignis_6',
          title: 'Sellado Arcano Completo',
          desc: 'Inscribe al menos 3 encantamientos en herramientas y 2 piezas de armadura encantadas.',
          reqCheck: (gs) => {
            const tCnt = Object.values(gs.toolEnchants || {}).reduce((a, e) => a + Object.keys(e).length, 0);
            const aCnt = Object.keys(gs.armorEnchants || {}).length;
            return tCnt >= 3 && aCnt >= 2;
          },
          reward: { coins: 1200, xp: 880, items: { amuleto_estelar: 1 } }
        },
        {
          id: 'q_ignis_7',
          title: 'El Abismo del Señor Balak',
          desc: 'Supera las pruebas de todas las alas y derrota al Señor Ígneo Balak en su Abismo.',
          reqKillBiome: { biome: 'tierras_volcanicas', count: 40 },
          reqDungeon: 'volcan_abismo',
          reward: { coins: 2400, xp: 1650, items: { fragmentos_antiguos: 6, lingote_celestial: 6, diamantes: 8 } }
        }
      ]
    },
    {
      id: 'kael',
      name: 'Kael el Cronomante Astral',
      biome: 'desierto',
      plot: [6, 4],
      tileOffset: [6, 5],
      spriteKey: 'char6',
      personality: 'Analítico y fascinado por el cosmos, estudia los portales arcanos de las arenas.',
      greeting: 'Las constelaciones despiertan en estas islas. Si inscribes tablillas y exploras el Oasis y Catacumbas, compartiré secretos del éter.',
      quests: [
        {
          id: 'q_kael_1',
          title: 'Tinta de las Dunas',
          desc: 'Tráeme 2 Tablillas Rúnicas, 4 Cristales y 15 de Arena estelar.',
          reqItems: { tablilla_runica: 2, cristales: 4, arena: 15 },
          reward: { coins: 340, xp: 260, items: { grimorio_bola_fuego: 1 } }
        },
        {
          id: 'q_kael_2',
          title: 'Secreto del Oasis Perdido',
          desc: 'Conquista la Gruta del Oasis Esmeralda y entrégame 1 Llave de Escarcha Azul.',
          reqItems: { llave_zafiro: 1 },
          reqDungeon: 'desierto_oasis',
          reward: { coins: 640, xp: 480, items: { baculo_lunar: 1, zafiro: 2 } }
        },
        {
          id: 'q_kael_3',
          title: 'Observador de Estrellas',
          desc: 'Construye un Observatorio Astral y conquista las Catacumbas de los Escribas.',
          reqDungeon: 'desierto_catacumbas',
          reqCheck: (gs) => gs.buildings.some(b => b.type === 'observatorio_astral'),
          reward: { coins: 1200, xp: 880, items: { colgante_estrella: 1, polvo_estelar: 3 } }
        },
        {
          id: 'q_kael_4',
          title: 'Dominio del Solario',
          desc: 'Conquista el Solario del Faraón Radiante y entrega 3 Cristales de Nebulosa.',
          reqItems: { cristal_nebulosa: 3 },
          reqDungeon: 'desierto_solario',
          reward: { coins: 1680, xp: 1180, items: { grimorio_paso_etereo: 1, anillo_diamante: 1 } }
        }
      ]
    },
    {
      id: 'selene',
      name: 'Selene la Tejedora de Escarcha',
      biome: 'montanas_heladas',
      plot: [5, 2],
      tileOffset: [5, 5],
      spriteKey: 'char7',
      personality: 'Serena, disciplinada y guardiana de la magia glacial y de los fiordos.',
      greeting: 'El hielo preserva la memoria mágica mejor que el fuego. Demuestra tu valía en las minas y fortalezas del norte.',
      quests: [
        {
          id: 'q_selene_1',
          title: 'Cristales del Norte',
          desc: 'Reúne 6 Esquirlas de Hielo, 2 de Azurita Glacial y 10 Lingotes de Plata.',
          reqItems: { esquirla_hielo: 6, azurita_glacial: 2, lingote_plata: 10 },
          reward: { coins: 580, xp: 440, items: { grimorio_nova_hielo: 1 } }
        },
        {
          id: 'q_selene_2',
          title: 'Mina de Diamante Boreal',
          desc: 'Completa la Mina Profunda de Diamante y entrega 4 Diamantes sin tallar.',
          reqItems: { diamantes: 4 },
          reqDungeon: 'montanas_mina',
          reward: { coins: 1100, xp: 820, items: { yelmo_vikingo: 1, varita_escarcha: 1 } }
        },
        {
          id: 'q_selene_3',
          title: 'Bastión del Comandante',
          desc: 'Conquista la Fortaleza Eterna del Norte y desbloquea 6 hechizos distintos.',
          reqDungeon: 'montanas_fortaleza',
          reqCheck: (gs) => (gs.unlockedSpells || []).length >= 6,
          reward: { coins: 1750, xp: 1280, items: { sombrero_bruja: 1, llave_maestra_mazmorra: 1 } }
        },
        {
          id: 'q_selene_4',
          title: 'Cumbre del Ventisquero',
          desc: 'Derrota al Guardián Glaciar en el Santuario del Glaciar Arcano y entrega 4 de Mitrilo Bruto.',
          reqItems: { mitrilo_bruto: 4 },
          reqDungeon: 'montanas_glaciar',
          reward: { coins: 2200, xp: 1500, items: { grimorio_escudo_divino: 1, lingote_platino: 4 } }
        }
      ]
    },
    {
      id: 'doran',
      name: 'Doran el Maestro del Yunque',
      biome: 'tierras_volcanicas',
      plot: [3, 7],
      tileOffset: [6, 5],
      spriteKey: 'char8',
      personality: 'Veterano forjador de armas míticas, bromista y amante de los duelos.',
      greeting: '¡Ja! ¿Vienes buscando un mandoble digno de emperadores? Tráeme metales volcánicos y rompe los yugos de la Fragua.',
      quests: [
        {
          id: 'q_doran_1',
          title: 'Acero y Pólvora',
          desc: 'Entrega 10 Lingotes de Acero, 8 de Carbón y 6 de Pólvora.',
          reqItems: { lingote_acero: 10, carbon: 8, polvora: 6 },
          reward: { coins: 740, xp: 560, items: { espadon_acero: 1, llave_rubi: 1 } }
        },
        {
          id: 'q_doran_2',
          title: 'La Fragua del Titán',
          desc: 'Derrota al Forjador Hephaest en la Fragua del Titán Ígneo y trae 4 de Oricalco.',
          reqItems: { lingote_oricalco: 4 },
          reqDungeon: 'volcan_fragua',
          reward: { coins: 1650, xp: 1200, items: { alabarda_real: 1, rubi: 4 } }
        },
        {
          id: 'q_doran_3',
          title: 'Cenizas del Emperador',
          desc: 'Conquista la Caldera del Fénix Solar y el Trono de Ceniza Primordial.',
          reqDungeon: 'volcan_trono_ceniza',
          reqCheck: (gs) => (gs.clearedDungeons || []).includes('volcan_caldera'),
          reward: { coins: 3500, xp: 2400, items: { armadura_paladin: 1, maza_legendaria: 1 } }
        },
        {
          id: 'q_doran_4',
          title: 'Balística Astral',
          desc: 'Forja armamento mítico: entrega 3 Lingotes de Adamantita y 4 Cristales Mágicos.',
          reqItems: { lingote_adamantita: 3, cristales_magicos: 4 },
          reqCheck: (gs) => gs.buildings.some(b => b.type === 'yunque_runico'),
          reward: { coins: 2900, xp: 1950, items: { ballesta_legendaria: 1, llave_jefe: 2 } }
        }
      ]
    }
  ];

  // 24 Guild Contracts & Milestone Missions (claimable at any time directly from Misiones [J])
  const GUILD_CONTRACTS = [
    // Recolección & Minería
    {
      id: 'gc_wood_1', cat: 'Recolección',
      title: 'Leñador del Alba', desc: 'Tala y recolecta 60 unidades de Madera.',
      progress: gs => (gs.stats.byItem.madera || 0), target: 60,
      reward: { coins: 45, xp: 40, items: { tablon: 4 } }
    },
    {
      id: 'gc_stone_1', cat: 'Recolección',
      title: 'Cantero Incansable', desc: 'Extrae 80 unidades de Piedra de las vetas.',
      progress: gs => (gs.stats.byItem.piedra || 0), target: 80,
      reward: { coins: 55, xp: 50, items: { hierro: 4 } }
    },
    {
      id: 'gc_ore_gold', cat: 'Recolección',
      title: 'Buscador de Vetas Doradas', desc: 'Mina 25 menas de Oro y 25 de Hierro.',
      progress: gs => Math.min(25, gs.stats.byItem.oro || 0) + Math.min(25, gs.stats.byItem.hierro || 0), target: 50,
      reward: { coins: 120, xp: 110, items: { lingote_oro: 3 } }
    },
    {
      id: 'gc_gems', cat: 'Recolección',
      title: 'Joyero del Archipiélago', desc: 'Consigue 10 gemas preciosas (Diamante, Esmeralda, Zafiro, Rubí o Amatista).',
      progress: gs => (gs.stats.byItem.diamantes || 0) + (gs.stats.byItem.esmeraldas || 0) + (gs.stats.byItem.zafiro || 0) + (gs.stats.byItem.rubi || 0) + (gs.stats.byItem.amatista || 0), target: 10,
      reward: { coins: 220, xp: 180, items: { polvo_estelar: 1 } }
    },
    {
      id: 'gc_meteor', cat: 'Recolección',
      title: 'Cazador de Meteoritos', desc: 'Mina al menos 2 Meteoritos caídos en tus islas.',
      progress: gs => (gs.stats.meteorsMined || 0), target: 2,
      reward: { coins: 190, xp: 160, items: { diamantes: 2, cristales_magicos: 2 } }
    },
    // Agricultura, Cocina & Pesca
    {
      id: 'gc_till_1', cat: 'Agricultura y Pesca',
      title: 'Surcos Frescos', desc: 'Ara la tierra 15 veces con tu Azada.',
      progress: gs => (gs.stats.tilesTilled || 0), target: 15,
      reward: { coins: 50, xp: 45, items: { semillas_papa: 5, semillas_tomate: 5 } }
    },
    {
      id: 'gc_harvest_25', cat: 'Agricultura y Pesca',
      title: 'Cosecha de Temporada', desc: 'Cosecha 30 cultivos maduros de tu huerta.',
      progress: gs => (gs.stats.cropsHarvested || 0), target: 30,
      reward: { coins: 115, xp: 95, items: { fertilizante: 6, patatas_asadas: 2 } }
    },
    {
      id: 'gc_harvest_100', cat: 'Agricultura y Pesca',
      title: 'Señor de las Huertas', desc: 'Cosecha 100 cultivos en total.',
      progress: gs => (gs.stats.cropsHarvested || 0), target: 100,
      reward: { coins: 340, xp: 280, items: { pocion_cosecha: 3, banquete_real: 1 } }
    },
    {
      id: 'gc_fish_12', cat: 'Agricultura y Pesca',
      title: 'Maestro del Anzuelo', desc: 'Captura 12 peces o reliquias marinas.',
      progress: gs => (gs.stats.fishCaught || 0), target: 12,
      reward: { coins: 140, xp: 120, items: { cebo_dorado: 4, sushi: 2 } }
    },
    {
      id: 'gc_fish_35', cat: 'Agricultura y Pesca',
      title: 'Leyenda de los Siete Mares', desc: 'Captura 35 peces en distintos biomas.',
      progress: gs => (gs.stats.fishCaught || 0), target: 35,
      reward: { coins: 380, xp: 310, items: { perla: 2, gema_marina: 2 } }
    },
    // Forja, Construcción & Economía
    {
      id: 'gc_craft_20', cat: 'Forja y Comercio',
      title: 'Oficial del Taller', desc: 'Fabrica 25 objetos en mesas y estaciones.',
      progress: gs => (gs.stats.craftedTotal || 0), target: 25,
      reward: { coins: 95, xp: 85, items: { engrane: 4 } }
    },
    {
      id: 'gc_craft_90', cat: 'Forja y Comercio',
      title: 'Maestro de Manufactura', desc: 'Fabrica 90 objetos en total.',
      progress: gs => (gs.stats.craftedTotal || 0), target: 90,
      reward: { coins: 320, xp: 260, items: { lingote_acero: 5, lingote_platino: 3 } }
    },
    {
      id: 'gc_mint_120', cat: 'Forja y Comercio',
      title: 'Tesorería Acuñada', desc: 'Acuña al menos 120 monedas a partir de minerales.',
      progress: gs => (gs.stats.coinsMinted || 0), target: 120,
      reward: { coins: 180, xp: 140, items: { lingote_oro: 4 } }
    },
    {
      id: 'gc_build_12', cat: 'Forja y Comercio',
      title: 'Urbanista Isleño', desc: 'Mantén 12 estructuras o máquinas construidas simultáneamente.',
      progress: gs => gs.buildings.length, target: 12,
      reward: { coins: 200, xp: 180, items: { ladrillo: 8, tablon: 10 } }
    },
    {
      id: 'gc_tools_6', cat: 'Forja y Comercio',
      title: 'Panoplia del Explorador', desc: 'Desbloquea al menos 6 herramientas distintas.',
      progress: gs => Object.values(gs.toolTiers || {}).filter(Boolean).length, target: 6,
      reward: { coins: 165, xp: 150, items: { lingote_hierro: 5, llave_mazmorra: 1 } }
    },
    // Combate & Mazmorras
    {
      id: 'gc_kill_20', cat: 'Combate y Mazmorras',
      title: 'Centinela de la Pradera', desc: 'Derrota 20 enemigos hostiles.',
      progress: gs => (gs.stats.kills || 0), target: 20,
      reward: { coins: 90, xp: 85, items: { pocion_vida: 2, filete: 3 } }
    },
    {
      id: 'gc_kill_80', cat: 'Combate y Mazmorras',
      title: 'Cazador de Monstruos', desc: 'Derrota 80 criaturas del archipiélago.',
      progress: gs => (gs.stats.kills || 0), target: 80,
      reward: { coins: 260, xp: 230, items: { pocion_fuerza: 3, bomba_mina: 4 } }
    },
    {
      id: 'gc_dung_2', cat: 'Combate y Mazmorras',
      title: 'Asaltante de Criptas', desc: 'Conquista 2 Mazmorras completas (incluyendo su Jefe).',
      progress: gs => gs.clearedDungeons.length, target: 2,
      reward: { coins: 240, xp: 220, items: { fragmentos_antiguos: 2, llave_mazmorra: 2 } }
    },
    {
      id: 'gc_dung_6', cat: 'Combate y Mazmorras',
      title: 'Vencedor de Laberintos', desc: 'Conquista 6 Mazmorras distintas.',
      progress: gs => gs.clearedDungeons.length, target: 6,
      reward: { coins: 620, xp: 520, items: { lingotes_especiales: 4, diamantes: 4 } }
    },
    {
      id: 'gc_relics_3', cat: 'Combate y Mazmorras',
      title: 'Coleccionista de Reliquias', desc: 'Obtén 3 Reliquias Permanentes venciendo jefes de mazmorra.',
      progress: gs => (gs.permanentRelics || []).length, target: 3,
      reward: { coins: 480, xp: 400, items: { elixir_titan: 2, polvo_estelar: 2 } }
    },
    // Exploración & Magia
    {
      id: 'gc_plots_8', cat: 'Exploración y Magia',
      title: 'Navegante de Islas', desc: 'Desbloquea 8 parcelas en el Mapa Mundial.',
      progress: gs => gs.unlockedPlots.length, target: 8,
      reward: { coins: 170, xp: 150, items: { pocion_velocidad: 2, semillas_uva: 3 } }
    },
    {
      id: 'gc_plots_25', cat: 'Exploración y Magia',
      title: 'Conquistador de Biomas', desc: 'Desbloquea 25 parcelas del archipiélago.',
      progress: gs => gs.unlockedPlots.length, target: 25,
      reward: { coins: 550, xp: 480, items: { lingote_platino: 5, llave_mazmorra: 3 } }
    },
    {
      id: 'gc_skills_18', cat: 'Exploración y Magia',
      title: 'Astrónomo del Reino', desc: 'Desbloquea 18 nodos del Árbol de Constelaciones.',
      progress: gs => (gs.unlockedSkills || []).length, target: 18,
      reward: { coins: 230, xp: 200, items: { elixir_arcano: 2 } }
    },
    {
      id: 'gc_altars_3', cat: 'Exploración y Magia',
      title: 'Guardia de Altares y Secretos', desc: 'Activa 3 Altares o Estructuras Secretas en tus exploraciones.',
      progress: gs => ((gs.stats.altarsUsed || 0) + (gs.stats.secretsFound || 0)), target: 3,
      reward: { coins: 290, xp: 240, items: { amatista: 2, pergamino_furia: 2 } }
    },
    // --- EXPANSIÓN MASIVA DE CONTRATOS DEL GREMIO (+46 MISIONES -> 70 CONTRATOS / 118+ MISIONES TOTALES) ---
    { id: 'gc_wood_200', cat: 'Recolección', title: 'Bosque Talado', desc: 'Recolecta 200 troncos de madera.', progress: gs => gs.stats.byItem.madera || 0, target: 200, reward: { coins: 125, xp: 105, items: { tablon: 12, manzana_roja: 4 } } },
    { id: 'gc_wood_600', cat: 'Recolección', title: 'Magnate Maderero', desc: 'Recolecta 600 troncos de madera.', progress: gs => gs.stats.byItem.madera || 0, target: 600, reward: { coins: 340, xp: 290, items: { resina_antigua: 5, runa_vida: 1 } } },
    { id: 'gc_stone_300', cat: 'Recolección', title: 'Montaña Hueca', desc: 'Mina 300 bloques de piedra.', progress: gs => gs.stats.byItem.piedra || 0, target: 300, reward: { coins: 145, xp: 125, items: { ladrillo: 12, carbon: 10 } } },
    { id: 'gc_coal_80', cat: 'Recolección', title: 'Fiebre del Carbón', desc: 'Mina 80 unidades de carbón.', progress: gs => gs.stats.byItem.carbon || 0, target: 80, reward: { coins: 110, xp: 95, items: { dinamita_tnt: 3 } } },
    { id: 'gc_copper_75', cat: 'Recolección', title: 'Cosecha de Cobre', desc: 'Extrae 75 menas de cobre.', progress: gs => gs.stats.byItem.cobre || 0, target: 75, reward: { coins: 120, xp: 100, items: { lingote_cobre: 5 } } },
    { id: 'gc_iron_120', cat: 'Recolección', title: 'Vetas de Hierro', desc: 'Extrae 120 menas de hierro.', progress: gs => gs.stats.byItem.hierro || 0, target: 120, reward: { coins: 210, xp: 175, items: { lingote_hierro: 6, escama_obsidiana: 1 } } },
    { id: 'gc_silver_60', cat: 'Recolección', title: 'Brillo de Plata', desc: 'Extrae 60 menas de plata.', progress: gs => gs.stats.byItem.plata || 0, target: 60, reward: { coins: 220, xp: 185, items: { lingote_plata: 4 } } },
    { id: 'gc_gold_100', cat: 'Recolección', title: 'Fiebre del Oro Real', desc: 'Extrae 100 menas de oro.', progress: gs => gs.stats.byItem.oro || 0, target: 100, reward: { coins: 380, xp: 320, items: { lingote_oro: 6, manzana_dorada: 1 } } },
    { id: 'gc_platinum_50', cat: 'Recolección', title: 'Buscador de Platino', desc: 'Mina 50 menas de platino.', progress: gs => gs.stats.byItem.platino || 0, target: 50, reward: { coins: 420, xp: 350, items: { lingote_platino: 4, jade: 2 } } },
    { id: 'gc_mithril_40', cat: 'Recolección', title: 'Minero de Mitrilo', desc: 'Obtén 40 menas de mitrilo bruto.', progress: gs => gs.stats.byItem.mitrilo_bruto || 0, target: 40, reward: { coins: 540, xp: 430, items: { lingotes_especiales: 3 } } },
    { id: 'gc_adamant_30', cat: 'Recolección', title: 'Vetas Verdes de Adamantita', desc: 'Extrae 30 menas de adamantita.', progress: gs => gs.stats.byItem.adamantita || 0, target: 30, reward: { coins: 720, xp: 580, items: { lingote_adamantita: 3, runa_tierra: 1 } } },
    { id: 'gc_obsid_35', cat: 'Recolección', title: 'Hijo del Volcán', desc: 'Recolecta 35 unidades de obsidiana.', progress: gs => (gs.stats.byItem.material_volcanico || 0) + (gs.stats.byItem.obsidiana_bruta || 0), target: 35, reward: { coins: 480, xp: 390, items: { elixir_fuego: 2 } } },
    { id: 'gc_sand_100', cat: 'Recolección', title: 'Pala en las Dunas', desc: 'Excava 100 unidades de arena o arcilla.', progress: gs => (gs.stats.byItem.arena || 0) + (gs.stats.byItem.arcilla || 0), target: 100, reward: { coins: 115, xp: 95, items: { vidrio: 8, mapa_tesoro_item: 1 } } },
    { id: 'gc_meteor_8', cat: 'Recolección', title: 'Guardián de Meteoros', desc: 'Mina 8 meteoritos estelares caídos.', progress: gs => gs.stats.meteorsMined || 0, target: 8, reward: { coins: 580, xp: 490, items: { gema_alma: 1, polvo_estelar: 3 } } },
    { id: 'gc_shroom_30', cat: 'Recolección', title: 'Recolector de Cuevas', desc: 'Recoge 30 Hongos Luminosos y Esporas.', progress: gs => (gs.stats.byItem.hongo_luminoso || 0) + (gs.stats.byItem.esporas_toxicas || 0), target: 30, reward: { coins: 175, xp: 145, items: { pocion_nocturna: 2, tinta_arcana: 2 } } },

    { id: 'gc_till_60', cat: 'Agricultura y Pesca', title: 'Arado Imparable', desc: 'Ara 60 parcelas de tierra fértil.', progress: gs => gs.stats.tilesTilled || 0, target: 60, reward: { coins: 140, xp: 120, items: { fertilizante: 8, semillas_fresa: 4 } } },
    { id: 'gc_harvest_250', cat: 'Agricultura y Pesca', title: 'Granero del Reino', desc: 'Cosecha 250 cultivos en tus islas.', progress: gs => gs.stats.cropsHarvested || 0, target: 250, reward: { coins: 680, xp: 560, items: { runa_vida: 2, elixir_supremo: 1 } } },
    { id: 'gc_wheat_80', cat: 'Agricultura y Pesca', title: 'Campos Dorados', desc: 'Recolecta 80 gavillas de trigo.', progress: gs => gs.stats.byItem.trigo || 0, target: 80, reward: { coins: 115, xp: 95, items: { harina: 10, pan: 5 } } },
    { id: 'gc_strawberries', cat: 'Agricultura y Pesca', title: 'Huerta Dulce', desc: 'Cultiva y recoge 30 Fresas o Uvas.', progress: gs => (gs.stats.byItem.fresa || 0) + (gs.stats.byItem.uva || 0), target: 30, reward: { coins: 220, xp: 185, items: { tarta_fresa: 3 } } },
    { id: 'gc_cook_20', cat: 'Agricultura y Pesca', title: 'Cocinero del Puerto', desc: 'Prepara 20 platos cocinados en Cocina o Fogata.', progress: gs => gs.stats.cookedTotal || 0, target: 20, reward: { coins: 185, xp: 160, items: { muslo_asado: 3, queso: 3 } } },
    { id: 'gc_cook_60', cat: 'Agricultura y Pesca', title: 'Banquete Imperial', desc: 'Prepara 60 platos culinarios en total.', progress: gs => gs.stats.cookedTotal || 0, target: 60, reward: { coins: 520, xp: 430, items: { banquete_real: 2, manzana_dorada: 2 } } },
    { id: 'gc_fish_80', cat: 'Agricultura y Pesca', title: 'Almirante de Pesca', desc: 'Captura 80 peces o tesoros del mar.', progress: gs => gs.stats.fishCaught || 0, target: 80, reward: { coins: 750, xp: 620, items: { runa_agua: 2, perla: 3 } } },
    { id: 'gc_pearls_4', cat: 'Agricultura y Pesca', title: 'Buzo de Perlas', desc: 'Consigue 4 Perlas Marinas o Aguamarinas.', progress: gs => (gs.stats.byItem.perla || 0) + (gs.stats.byItem.gema_marina || 0), target: 4, reward: { coins: 390, xp: 310, items: { pescado_brasa: 3, cebo_dorado: 5 } } },
    { id: 'gc_honey_30', cat: 'Agricultura y Pesca', title: 'Colmenero Real', desc: 'Reúne 30 tarros de Miel o Cera de Abeja.', progress: gs => (gs.stats.byItem.miel || 0) + (gs.stats.byItem.cera_abeja || 0), target: 30, reward: { coins: 210, xp: 175, items: { pastel_miel: 3 } } },
    { id: 'gc_wool_milk', cat: 'Agricultura y Pesca', title: 'Granjero Próspero', desc: 'Reúne 35 unidades de Lana, Leche o Huevos.', progress: gs => (gs.stats.byItem.lana || 0) + (gs.stats.byItem.leche || 0) + (gs.stats.byItem.huevo || 0), target: 35, reward: { coins: 190, xp: 165, items: { tela: 6, queso: 3 } } },

    { id: 'gc_craft_200', cat: 'Forja y Comercio', title: 'Industria Balaclava', desc: 'Fabrica 200 objetos en estaciones de trabajo.', progress: gs => gs.stats.craftedTotal || 0, target: 200, reward: { coins: 640, xp: 520, items: { lingote_adamantita: 2, polvo_estelar: 2 } } },
    { id: 'gc_mint_500', cat: 'Forja y Comercio', title: 'Casa Real de Moneda', desc: 'Acuña 500 monedas desde lingotes minerales.', progress: gs => gs.stats.coinsMinted || 0, target: 500, reward: { coins: 460, xp: 350, items: { lingote_oro: 6, diamantes: 2 } } },
    { id: 'gc_coins_5000', cat: 'Forja y Comercio', title: 'Cofres Rebosantes', desc: 'Gana un acumulado de 5,000 monedas.', progress: gs => gs.stats.coinsEarned || 0, target: 5000, reward: { coins: 500, xp: 400, items: { rubi: 2, zafiro: 2 } } },
    { id: 'gc_coins_15000', cat: 'Forja y Comercio', title: 'Gran Banquero', desc: 'Gana un acumulado de 15,000 monedas.', progress: gs => gs.stats.coinsEarned || 0, target: 15000, reward: { coins: 1200, xp: 850, items: { amuleto_diamante: 1 } } },
    { id: 'gc_build_28', cat: 'Forja y Comercio', title: 'Ciudadela Viviente', desc: 'Mantén 28 edificios o estructuras construidas.', progress: gs => gs.buildings.length, target: 28, reward: { coins: 480, xp: 390, items: { lingote_platino: 4, ladrillo: 12 } } },
    { id: 'gc_tools_all', cat: 'Forja y Comercio', title: 'Maestro Multi-Oficios', desc: 'Desbloquea todas las 8 herramientas básicas.', progress: gs => Object.values(gs.toolTiers || {}).filter(Boolean).length, target: 8, reward: { coins: 350, xp: 290, items: { lingote_acero: 5, pergamino_curacion: 2 } } },
    { id: 'gc_adamant_tools', cat: 'Forja y Comercio', title: 'Herrería de Élite', desc: 'Eleva 4 herramientas a rango Adamantita o superior.', progress: gs => Object.values(gs.toolTiers || {}).filter(t => ['adamantita', 'legendaria', 'celestial'].includes(t)).length, target: 4, reward: { coins: 980, xp: 780, items: { lingote_celestial: 3, gema_alma: 2 } } },
    { id: 'gc_celestial_tool', cat: 'Forja y Comercio', title: 'Forja de los Dioses', desc: 'Lleva al menos 1 herramienta a tier Celestial.', progress: gs => Object.values(gs.toolTiers || {}).includes('celestial') ? 1 : 0, target: 1, reward: { coins: 1600, xp: 1200, items: { runa_luz: 2, elixir_supremo: 2 } } },
    { id: 'gc_armor_set', cat: 'Forja y Comercio', title: 'Armadura Completa', desc: 'Equipa Casco, Armadura, Escudo, Botas, Anillo y Amuleto.', progress: gs => ['helm', 'armor', 'shield', 'boots', 'ring', 'amulet'].filter(k => gs.equipped && gs.equipped[k]).length, target: 6, reward: { coins: 420, xp: 340, items: { onice: 2, pergamino_escudo: 2 } } },
    { id: 'gc_enchant_5', cat: 'Forja y Comercio', title: 'Maestro Runógrafo', desc: 'Inscribe 5 niveles totales de encantamiento.', progress: gs => Object.values(gs.toolEnchants || {}).reduce((a, e) => a + Object.values(e).reduce((x, y) => x + y, 0), 0) + Object.values(gs.armorEnchants || {}).reduce((a, e) => a + Object.values(e).reduce((x, y) => x + y, 0), 0), target: 5, reward: { coins: 520, xp: 420, items: { tinta_arcana: 4, amatista: 2 } } },

    { id: 'gc_kill_200', cat: 'Combate y Mazmorras', title: 'Cruzado de Balaclava', desc: 'Derrota 200 enemigos hostiles.', progress: gs => gs.stats.kills || 0, target: 200, reward: { coins: 540, xp: 460, items: { elixir_titan: 2, bomba_solar: 2 } } },
    { id: 'gc_kill_500', cat: 'Combate y Mazmorras', title: 'Leyenda Imparable', desc: 'Derrota 500 criaturas del archipiélago.', progress: gs => gs.stats.kills || 0, target: 500, reward: { coins: 1250, xp: 980, items: { runa_muerte: 2, huevo_dragon: 1 } } },
    { id: 'gc_dung_10', cat: 'Combate y Mazmorras', title: 'Señor de las Diez Criptas', desc: 'Conquista las 10 Mazmorras del mundo.', progress: gs => gs.clearedDungeons.length, target: 10, reward: { coins: 1800, xp: 1450, items: { lingote_celestial: 4, gema_alma: 3 } } },
    { id: 'gc_relics_7', cat: 'Combate y Mazmorras', title: 'Custodio de Reliquias', desc: 'Obtén 7 Reliquias Permanentes de Jefes.', progress: gs => (gs.permanentRelics || []).length, target: 7, reward: { coins: 1100, xp: 880, items: { anillo_alma: 1, elixir_supremo: 1 } } },
    { id: 'gc_relics_10', cat: 'Combate y Mazmorras', title: 'Panteón Completo', desc: 'Obtén las 10 Reliquias Permanentes del archipiélago.', progress: gs => (gs.permanentRelics || []).length, target: 10, reward: { coins: 2400, xp: 1900, items: { capa_fenix: 1, diamantes: 6 } } },
    { id: 'gc_drops_boss', cat: 'Combate y Mazmorras', title: 'Cazador de Bestias', desc: 'Reúne 40 trofeos de monstruos (Colmillos, Huesos, Garras o Alas).', progress: gs => (gs.stats.byItem.colmillo || 0) + (gs.stats.byItem.huesos || 0) + (gs.stats.byItem.garra_sombras || 0) + (gs.stats.byItem.ala_murcielago || 0), target: 40, reward: { coins: 340, xp: 280, items: { pergamino_fuego: 2, elixir_fuego: 2 } } },

    { id: 'gc_plots_45', cat: 'Exploración y Magia', title: 'Navegante Maestro', desc: 'Desbloquea 45 islas del mapa mundial.', progress: gs => gs.unlockedPlots.length, target: 45, reward: { coins: 920, xp: 760, items: { llave_mazmorra: 4, lingote_adamantita: 3 } } },
    { id: 'gc_plots_75', cat: 'Exploración y Magia', title: 'Cartógrafo Supremo', desc: 'Desbloquea 75 parcelas del archipiélago.', progress: gs => gs.unlockedPlots.length, target: 75, reward: { coins: 1850, xp: 1400, items: { lingote_celestial: 5, mapa_tesoro_item: 3 } } },
    { id: 'gc_skills_50', cat: 'Exploración y Magia', title: 'Señor de las Estrellas', desc: 'Desbloquea 50 constelaciones de habilidades.', progress: gs => (gs.unlockedSkills || []).length, target: 50, reward: { coins: 650, xp: 520, items: { pergamino_rayo: 2, elixir_arcano: 2 } } },
    { id: 'gc_skills_100', cat: 'Exploración y Magia', title: 'Arquitecto del Cosmos', desc: 'Desbloquea 100 habilidades en el árbol estelar.', progress: gs => (gs.unlockedSkills || []).length, target: 100, reward: { coins: 1900, xp: 1500, items: { baculo_dorado: 1, gema_alma: 2 } } },
    { id: 'gc_runes_10', cat: 'Exploración y Magia', title: 'Alquimista de Runas', desc: 'Reúne 10 Runas elementales en total.', progress: gs => (gs.stats.byItem.runa_fuego || 0) + (gs.stats.byItem.runa_agua || 0) + (gs.stats.byItem.runa_tierra || 0) + (gs.stats.byItem.runa_aire || 0) + (gs.stats.byItem.runa_luz || 0) + (gs.stats.byItem.runa_oscura || 0) + (gs.stats.byItem.runa_vida || 0) + (gs.stats.byItem.runa_muerte || 0), target: 10, reward: { coins: 850, xp: 700, items: { pergamino_fuego: 2, pergamino_hielo: 2 } } },
    { id: 'gc_altars_10', cat: 'Exploración y Magia', title: 'Devoto de los Altares', desc: 'Activa 10 Altares y Secretos ancestrales.', progress: gs => (gs.stats.altarsUsed || 0) + (gs.stats.secretsFound || 0), target: 10, reward: { coins: 960, xp: 790, items: { runa_luz: 2, pergamino_curacion: 3 } } },
    { id: 'gc_chests_12', cat: 'Exploración y Magia', title: 'Cazatesoros Legendario', desc: 'Abre 12 Cofres de Tesoro y Mapas Antiguos.', progress: gs => (gs.stats.chestsOpened || 0), target: 12, reward: { coins: 620, xp: 480, items: { diamantes: 3, rubi: 2 } } },
    { id: 'gc_spells_6', cat: 'Exploración y Magia', title: 'Archimago en Ciernes', desc: 'Aprende 6 Hechizos Activos distintos de grimorios.', progress: gs => (gs.unlockedSpells || []).length, target: 6, reward: { coins: 680, xp: 540, items: { sombrero_hechicero: 1, tablilla_runica: 3 } } },
    { id: 'gc_spells_12', cat: 'Exploración y Magia', title: 'Grimorio Supremo Completo', desc: 'Aprende los 12 Hechizos Activos del Archipiélago.', progress: gs => (gs.unlockedSpells || []).length, target: 12, reward: { coins: 2200, xp: 1700, items: { baculo_rubi: 1, polvo_estelar: 5 } } },
    { id: 'gc_dung_15', cat: 'Combate y Mazmorras', title: 'Azote de Quince Criptas', desc: 'Conquista 15 Mazmorras distintas.', progress: gs => (gs.clearedDungeons || []).length, target: 15, reward: { coins: 2400, xp: 1950, items: { llave_maestra_mazmorra: 2, gema_alma: 3 } } },
    { id: 'gc_dung_24', cat: 'Combate y Mazmorras', title: 'Soberano de las 24 Mazmorras', desc: 'Conquista TODAS las 24 Mazmorras de Balaclava.', progress: gs => (gs.clearedDungeons || []).length, target: 24, reward: { coins: 6500, xp: 4800, items: { espadon_legendario: 1, armadura_paladin: 1 } } },
    { id: 'gc_relics_18', cat: 'Combate y Mazmorras', title: 'Custodio del Gran Panteón', desc: 'Reúne 18 Reliquias Permanentes.', progress: gs => (gs.permanentRelics || []).length, target: 18, reward: { coins: 2600, xp: 2050, items: { anillo_diamante: 1, diamantes: 6 } } },
    { id: 'gc_relics_30', cat: 'Combate y Mazmorras', title: 'Maestro del Relicario Eterno', desc: 'Reúne al menos 30 Reliquias Permanentes.', progress: gs => (gs.permanentRelics || []).length, target: 30, reward: { coins: 5800, xp: 4200, items: { colgante_calavera: 1, lingote_celestial: 8 } } }
  ];

  const ACHIEVEMENTS = [
    { id: 'ach_first_wood', name: 'Leñador Novato', desc: 'Recolecta tu primer tronco de madera.', check: gs => (gs.stats.byItem.madera || 0) >= 1, coins: 15 },
    { id: 'ach_builder', name: 'Arquitecto Isleño', desc: 'Construye 5 edificios o máquinas.', check: gs => gs.buildings.length >= 5, coins: 50 },
    { id: 'ach_automation', name: 'Era Industrial', desc: 'Construye un Taladro Automático o Recolector.', check: gs => gs.buildings.some(b => b.type === 'taladro' || b.type === 'recolector'), coins: 120 },
    { id: 'ach_rich', name: 'Bolsa Repleta', desc: 'Acumula 1,000 monedas en total.', check: gs => gs.stats.coinsEarned >= 1000, coins: 150 },
    { id: 'ach_tycoon', name: 'Emperador Dorado', desc: 'Acumula 10,000 monedas en total.', check: gs => gs.stats.coinsEarned >= 10000, coins: 600 },
    { id: 'ach_explorer_5', name: 'Cartógrafo', desc: 'Desbloquea 5 parcelas del mundo.', check: gs => gs.unlockedPlots.length >= 5, coins: 65 },
    { id: 'ach_explorer_15', name: 'Dueño del Mar', desc: 'Desbloquea 20 parcelas del mundo.', check: gs => gs.unlockedPlots.length >= 20, coins: 280 },
    { id: 'ach_explorer_all', name: 'Mundo Completo', desc: 'Desbloquea las 100 parcelas de Balaclava.', check: gs => gs.unlockedPlots.length >= 100, coins: 2200 },
    { id: 'ach_farmer', name: 'Manos Verdes', desc: 'Cosecha 15 cultivos agrícolas.', check: gs => gs.stats.cropsHarvested >= 15, coins: 50 },
    { id: 'ach_angler', name: 'Pescador Paciente', desc: 'Captura 10 peces o tesoros marinos.', check: gs => gs.stats.fishCaught >= 10, coins: 65 },
    { id: 'ach_slayer', name: 'Defensor de las Islas', desc: 'Derrota a 25 enemigos.', check: gs => gs.stats.kills >= 25, coins: 75 },
    { id: 'ach_boss_1', name: 'Cazador de Jefes', desc: 'Derrota tu primer Jefe de Mazmorra.', check: gs => gs.clearedDungeons.length >= 1, coins: 150 },
    { id: 'ach_boss_5', name: 'Conquistador de Criptas', desc: 'Completa 5 Mazmorras distintas.', check: gs => gs.clearedDungeons.length >= 5, coins: 520 },
    { id: 'ach_boss_10', name: 'Leyenda Absoluta de Balaclava', desc: 'Completa las 10 Mazmorras del archipiélago.', check: gs => gs.clearedDungeons.length >= 10, coins: 1600 },
    { id: 'ach_crafter', name: 'Maestro Artesano', desc: 'Fabrica 30 objetos en mesas o estaciones.', check: gs => gs.stats.craftedTotal >= 30, coins: 85 },
    { id: 'ach_level_10', name: 'Veterano Nivel 10', desc: 'Alcanza el nivel 10 de personaje.', check: gs => gs.player.level >= 10, coins: 200 },
    { id: 'ach_legend_tool', name: 'Forja Suprema', desc: 'Mejora cualquier herramienta a nivel Legendario o Celestial.', check: gs => Object.values(gs.toolTiers).some(t => t === 'legendaria' || t === 'celestial'), coins: 500 },
    { id: 'ach_meteor', name: 'Cazador de Estrellas', desc: 'Mina un meteorito estrellado.', check: gs => gs.stats.meteorsMined >= 1, coins: 150 },
    { id: 'ach_core', name: 'Corazón Restaurado', desc: 'Consigue el Corazón de Balaclava.', check: gs => (gs.inventory.nucleo_balaclava || 0) >= 1, coins: 1500 },
    { id: 'ach_tiller', name: 'Labrador de Tierras', desc: 'Ara la tierra y obtén tu primera Azada agrícola.', check: gs => !!gs.toolTiers.azada && (gs.stats.tilesTilled || 0) >= 5, coins: 40 },
    { id: 'ach_botanist', name: 'Gran Hortelano', desc: 'Cosecha 80 cultivos agrícolas.', check: gs => gs.stats.cropsHarvested >= 80, coins: 220 },
    { id: 'ach_sea_master', name: 'Lobos de Mar', desc: 'Captura 40 peces o reliquias marinas.', check: gs => gs.stats.fishCaught >= 40, coins: 260 },
    { id: 'ach_pearl', name: 'Buscador de Perlas', desc: 'Obtén una Perla Marina pescando en aguas profundas.', check: gs => (gs.stats.byItem.perla || 0) >= 1, coins: 140 },
    { id: 'ach_chef', name: 'Chef del Archipiélago', desc: 'Prepara 15 alimentos cocinados en Cocina o Ahumador.', check: gs => (gs.stats.cookedTotal || 0) >= 15 || ((gs.stats.byItem.pan || 0) + (gs.stats.byItem.sushi || 0) + (gs.stats.byItem.pastel_miel || 0)) >= 5, coins: 160 },
    { id: 'ach_beekeeper', name: 'Apicultor Real', desc: 'Construye una Colmena de Miel.', check: gs => gs.buildings.some(b => b.type === 'colmena'), coins: 85 },
    { id: 'ach_irrigator', name: 'Riego Inteligente', desc: 'Construye un Aspersor o Invernadero Real.', check: gs => gs.buildings.some(b => b.type === 'aspersor' || b.type === 'invernadero'), coins: 110 },
    { id: 'ach_fortress', name: 'Señor de Murallas', desc: 'Construye al menos 15 edificios o bloques de aldea.', check: gs => gs.buildings.length >= 15, coins: 180 },
    { id: 'ach_metropolis', name: 'Arquitecto Real', desc: 'Construye 35 estructuras o fortificaciones.', check: gs => gs.buildings.length >= 35, coins: 450 },
    { id: 'ach_enchanter', name: 'Aprendiz Arcano', desc: 'Inscribe tu primer encantamiento en la Mesa de Encantamientos.', check: gs => Object.values(gs.toolEnchants || {}).some(e => Object.keys(e).length > 0) || Object.keys(gs.armorEnchants || {}).length > 0, coins: 130 },
    { id: 'ach_full_tools', name: 'Arsenal Completo', desc: 'Desbloquea todas las 8 herramientas del jugador.', check: gs => Object.values(gs.toolTiers || {}).filter(Boolean).length >= 8, coins: 200 },
    { id: 'ach_armored', name: 'Caballero Completo', desc: 'Equipa armadura, casco, escudo y botas a la vez.', check: gs => !!(gs.equipped && gs.equipped.armor && gs.equipped.helm && gs.equipped.shield && gs.equipped.boots), coins: 240 },
    { id: 'ach_hunter_100', name: 'Campeón de Batalla', desc: 'Derrota a 100 monstruos.', check: gs => gs.stats.kills >= 100, coins: 240 },
    { id: 'ach_hunter_250', name: 'Azote de las Tinieblas', desc: 'Derrota a 250 criaturas.', check: gs => gs.stats.kills >= 250, coins: 500 },
    { id: 'ach_scholar_10', name: 'Estudioso Estelar', desc: 'Desbloquea 25 constelaciones en el Árbol de Habilidades.', check: gs => (gs.unlockedSkills || []).length >= 25, coins: 180 },
    { id: 'ach_scholar_60', name: 'Sabio Cósmico', desc: 'Desbloquea 60 habilidades estelares.', check: gs => (gs.unlockedSkills || []).length >= 60, coins: 560 },
    { id: 'ach_altar_pilgrim', name: 'Peregrino Sagrado', desc: 'Activa 3 Altares o Secretos Ancestrales del mapa.', check: gs => (gs.stats.altarsUsed || 0) >= 3, coins: 160 },
    { id: 'ach_secret_finder', name: 'Descubridor de Mitos', desc: 'Encuentra al menos 4 Estructuras Secretas por el mundo.', check: gs => (gs.stats.secretsFound || 0) >= 4, coins: 350 },
    { id: 'ach_minter', name: 'Casa de la Moneda', desc: 'Acuña monedas a partir de hierro, plata u oro en Artesanía.', check: gs => (gs.stats.coinsMinted || 0) >= 50, coins: 90 },
    { id: 'ach_collector_40', name: 'Coleccionista Maestro', desc: 'Descubre 40 tipos de objetos diferentes en tu registro.', check: gs => Object.keys(gs.stats.byItem || {}).length >= 40, coins: 300 },
    { id: 'ach_collector_80', name: 'Enciclopedia Viviente', desc: 'Registra 80 materiales u objetos distintos.', check: gs => Object.keys(gs.stats.byItem || {}).length >= 80, coins: 850 },
    { id: 'ach_quarry', name: 'Barón de Canteras', desc: 'Construye una Cantera de Granito y un Taladro.', check: gs => gs.buildings.some(b => b.type === 'cantera_piedra') && gs.buildings.some(b => b.type === 'taladro'), coins: 260 },
    { id: 'ach_relic_hunter', name: 'Guardián de Reliquias', desc: 'Consigue al menos 2 Reliquias Permanentes de Jefes.', check: gs => (gs.permanentRelics || []).length >= 2, coins: 400 },
    { id: 'ach_level_20', name: 'Héroe Inmortal', desc: 'Alcanza el nivel 20 de personaje.', check: gs => gs.player.level >= 20, coins: 600 },
    { id: 'ach_adamantite_forger', name: 'Templado en Adamantita', desc: 'Mejora cualquier herramienta a rango Adamantita o superior.', check: gs => Object.values(gs.toolTiers || {}).some(t => ['adamantita', 'legendaria', 'celestial'].includes(t)), coins: 420 },
    { id: 'ach_celestial_master', name: 'Soberano Celestial', desc: 'Alcanza el rango Celestial en cualquier herramienta.', check: gs => Object.values(gs.toolTiers || {}).includes('celestial'), coins: 1200 },
    { id: 'ach_rune_scholar', name: 'Maestro de Runas', desc: 'Crea al menos 5 Runas elementales.', check: gs => ((gs.stats.byItem.runa_fuego || 0) + (gs.stats.byItem.runa_agua || 0) + (gs.stats.byItem.runa_tierra || 0) + (gs.stats.byItem.runa_aire || 0) + (gs.stats.byItem.runa_luz || 0) + (gs.stats.byItem.runa_oscura || 0) + (gs.stats.byItem.runa_vida || 0) + (gs.stats.byItem.runa_muerte || 0)) >= 5, coins: 480 },
    { id: 'ach_all_relics', name: 'Colección del Panteón', desc: 'Consigue las 10 Reliquias Permanentes de Balaclava.', check: gs => (gs.permanentRelics || []).length >= 10, coins: 1500 },
    { id: 'ach_enchant_master', name: 'Encantador Supremo', desc: 'Desbloquea 6 encantamientos diferentes en la Enciclopedia.', check: gs => gs.encyclopedia && gs.encyclopedia.enchants && gs.encyclopedia.enchants.size >= 6, coins: 650 },
    { id: 'ach_altar_devotee', name: 'Custodio de Santuarios', desc: 'Registra al menos 4 Altares distintos en la Enciclopedia.', check: gs => gs.encyclopedia && gs.encyclopedia.altars && gs.encyclopedia.altars.size >= 4, coins: 520 },
    { id: 'ach_collector_140', name: 'Archivo Cósmico', desc: 'Descubre 140 objetos distintos en la Enciclopedia.', check: gs => gs.encyclopedia && gs.encyclopedia.items && gs.encyclopedia.items.size >= 140, coins: 1400 },
    { id: 'ach_skeleton_king', name: 'Corona del Soberano Óseo', desc: 'Completa el ritual del Esqueleto Gigante en el Bosque Oscuro.', check: gs => (gs.permanentRelics || []).includes('corona_rey_oseo'), coins: 900 },
    { id: 'ach_nature_elixirs', name: 'Alquimista del Bosque Vivo', desc: 'Prepara o reúne al menos 3 frutos o elixires exóticos de la Naturaleza.', check: gs => ((gs.stats.byItem.macedonia_real || 0) + (gs.stats.byItem.batido_nebula || 0) + (gs.stats.byItem.elixir_vida_supremo || 0) + (gs.stats.byItem.miel_ambar || 0) + (gs.stats.byItem.bellota || 0)) >= 3, coins: 340 },
    { id: 'ach_boss_20', name: 'Conquistador de las 24 Criptas', desc: 'Completa al menos 20 Mazmorras del Archipiélago.', check: gs => (gs.clearedDungeons || []).length >= 20, coins: 3200 },
    { id: 'ach_spells_6', name: 'Conjurador Maestro', desc: 'Desbloquea 6 Hechizos Activos en tu grimorio.', check: gs => (gs.unlockedSpells || []).length >= 6, coins: 480 },
    { id: 'ach_relics_20', name: 'Archivero de Reliquias', desc: 'Reúne 20 Reliquias Permanentes.', check: gs => (gs.permanentRelics || []).length >= 20, coins: 2200 },
    { id: 'ach_npc_8', name: 'Consejo de los Ocho Sabios', desc: 'Completa al menos 15 misiones de aldeanos por las islas.', check: gs => (gs.completedNpcQuests || []).length >= 15, coins: 1200 }
  ];

  Balaclava.STORY_CHAPTERS = STORY_CHAPTERS;
  Balaclava.NPCS = NPCS;
  Balaclava.GUILD_CONTRACTS = GUILD_CONTRACTS;
  Balaclava.ACHIEVEMENTS = ACHIEVEMENTS;

  Balaclava.LORE = {
    chronicle: [
      {
        id: 'lore_colapso',
        title: 'El Colapso Rúnico del Archipiélago',
        era: 'Era Primera · Año 0',
        summary: 'Cómo un único continente próspero se fracturó en cien islas flotantes sobre el mar astral.',
        body: 'Antiguamente, las Cinco Provincias de Balaclava estaban unidas por calzadas blancas de mármol y acero azul. Cuando los Conjuradores del Cráter intentaron encadenar el Corazón del Mundo bajo diez sellos subterráneos, la sobrecarga rúnica partió la corteza terrestre. Así nacieron las islas aisladas que hoy esperan ser reconectadas mediante oro, puentes y bloques de tierra viva.'
      },
      {
        id: 'lore_capucha',
        title: 'El Juramento de la Capucha Balaclava',
        era: 'Tradición Antigua',
        summary: 'El origen de la prenda tejida en sombra y lana dorada que portas desde el primer día.',
        body: 'Solo los Cartógrafos de la Vigilia recibían una capucha tejida con lana de pradera e hilo de mitrilo. Quien la viste hereda la sensibilidad para detectar vetas ocultas bajo la roca, leer monolitos antiguos y resistir la niebla oscura que emerge cuando cae la noche de tres minutos sobre los mares.'
      },
      {
        id: 'lore_puzles',
        title: 'Los Pilares Sellados del Borde Exterior',
        era: 'Relatos del Anciano Eldrin',
        summary: 'Por qué los cofres secretos y reliquias eternas duermen protegidos por pilares rúnicos.',
        body: 'Las islas exteriores fueron santuarios de las Órdenes Antiguas. Para impedir que saqueadores nocturnos profanaran sus Cofres Secretos, los sabios levantaron tríadas de Pilares Rúnicos sincronizados alrededor de cada pedestal. Solo al despertar los tres pilares con energía pura se materializa el cofre sellado que aguarda la Llave Legendaria.'
      },
      {
        id: 'lore_metales',
        title: 'Los Quince Estratos de la Forja',
        era: 'Tratado de Maestros Herreros',
        summary: 'De la piedra tosca al acero glacial, titanio estelar, oricalco ígneo y metal celestial.',
        body: 'Cada bioma custodia un metal singular nacido de su clima: malaquita verde entre las raíces de la Pradera, ánbar y arena estelar bajo el sol implacable del Desierto, azurita azul en los hielos perpetuos, cristales del abismo en el Bosque Oscuro y oricalco vivo en las calderas volcánicas. Unir sus quince grados en una sola hoja es la cima de la herrería isleña.'
      }
    ],
    biomes: [
      {
        id: 'pradera',
        name: 'Pradera Esmeralda',
        minerals: 'Carbón, Cobre, Estaño, Hierro, Plata y Malaquita Silvestre',
        desc: 'Cuna serena de bosques mixtos, pastizales fértiles y ruinas cubiertas de musgo. Ideal para levantar tu aldea inicial, huertos y plazas.'
      },
      {
        id: 'desierto',
        name: 'Desierto Dorado',
        minerals: 'Oro, Arena Estelar Fósil, Ámbar Solar, Topacio y Titanio',
        desc: 'Dunas interminables barridas por vientos ardientes. Bajo sus oasis crecen cactus curativos y yacimientos de oro, titanio y pirámides sepultadas.'
      },
      {
        id: 'bosque_oscuro',
        name: 'Bosque Oscuro',
        minerals: 'Jade, Amatista, Sanguinaria, Cristal del Abismo y Oricalco',
        desc: 'Espesura violeta donde los árboles gigantes ocultan setas luminosas y el velo nocturno es más denso. Hogar de bestias sombrías y reliquias.'
      },
      {
        id: 'montanas_heladas',
        name: 'Montañas Heladas',
        minerals: 'Platino, Acero Azul, Azurita Glacial, Zafiro y Titanio',
        desc: 'Picos blancos azotados por ventiscas donde cristaliza el hielo arcano y se forja el acero azul más templado del archipiélago.'
      },
      {
        id: 'tierras_volcanicas',
        name: 'Tierras Volcánicas',
        minerals: 'Adamantita, Obsidiana Bruta, Oricalco y Núcleo de Magma Vivo',
        desc: 'Basalto incandescente y ceniza roja junto al cráter primordial. Aquí nacen los minerales míticos necesarios para alcanzar el tier Celestial.'
      }
    ]
  };
})();
