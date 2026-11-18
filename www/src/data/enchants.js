(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  const TOOL_ENCHANTS = {
    eficiencia: {
      id: 'eficiencia',
      target: 'tool',
      name: 'Eficiencia Rúnica',
      color: '#ffd54f',
      icon: 'rune_earth',
      maxLevel: 3,
      desc: '+20% velocidad y poder de recolección por nivel.',
      perLevel: { powerMult: 0.20, speedMult: 0.18 },
      costBase: { coins: 35, items: { hierro: 2, cristales: 1 } }
    },
    fortuna: {
      id: 'fortuna',
      target: 'tool',
      name: 'Fortuna Minera',
      color: '#81c784',
      icon: 'emerald',
      maxLevel: 3,
      reqTier: 1,
      incompatibleWith: ['toque_igneo'],
      desc: '+22% probabilidad de obtener botín doble y gemas por nivel.',
      perLevel: { doubleChance: 0.22 },
      costBase: { coins: 45, items: { oro: 2, cristales: 1 } }
    },
    filo: {
      id: 'filo',
      target: 'tool',
      name: 'Filo Arcano',
      color: '#ef5350',
      icon: 'rune_fire',
      maxLevel: 3,
      reqTier: 1,
      incompatibleWith: ['golpe_pesado'],
      desc: '+22% daño y +6% probabilidad crítica al combatir por nivel.',
      perLevel: { dmgBonus: 0.22, critChance: 0.06 },
      costBase: { coins: 40, items: { lingote_hierro: 2, carbon: 3 } }
    },
    toque_igneo: {
      id: 'toque_igneo',
      target: 'tool',
      name: 'Toque Ígneo',
      color: '#ff8a65',
      icon: 'scroll_red',
      maxLevel: 2,
      reqTier: 1,
      incompatibleWith: ['fortuna'],
      desc: 'Funde menas de cobre, hierro y oro en lingotes al minarlas automáticamente.',
      perLevel: { autoSmelt: 1, burnDmg: 4 },
      costBase: { coins: 65, items: { oro: 2, carbon: 4, cristales_magicos: 1 } }
    },
    alcance: {
      id: 'alcance',
      target: 'tool',
      name: 'Alcance Astral',
      color: '#80deea',
      icon: 'rune_air',
      maxLevel: 2,
      reqTier: 1,
      desc: '+18 de alcance con herramienta y +35 de atracción de botín por nivel.',
      perLevel: { reachBonus: 18, magnetBonus: 35 },
      costBase: { coins: 50, items: { cristales: 2, fibra_vegetal: 3 } }
    },
    vampirismo: {
      id: 'vampirismo',
      target: 'tool',
      name: 'Sanguijuela Arcana',
      color: '#e57373',
      icon: 'rune_death',
      maxLevel: 3,
      reqTier: 2,
      incompatibleWith: ['ecos_arcano'],
      desc: 'Absorbe +4 HP al golpear enemigos y jefes por nivel.',
      perLevel: { lifeSteal: 4 },
      costBase: { coins: 60, items: { sanguinaria: 1, huesos: 4 } }
    },
    cosecha_maestra: {
      id: 'cosecha_maestra',
      target: 'tool',
      name: 'Toque de Deméter',
      color: '#66bb6a',
      icon: 'rune_life',
      maxLevel: 2,
      desc: '+1 fruto/cultivo extra y +14% doble botín al cosechar o talar por nivel.',
      perLevel: { harvestBonus: 1, doubleChance: 0.14 },
      costBase: { coins: 55, items: { jade: 1, fertilizante: 3 } }
    },
    furia_elemental: {
      id: 'furia_elemental',
      target: 'tool',
      name: 'Furia Elemental',
      color: '#29b6f6',
      icon: 'scroll_lightning',
      maxLevel: 3,
      desc: '20% probabilidad por nivel de desatar una descarga arcana (+28% daño extra).',
      perLevel: { procChance: 0.20, procDmgMult: 0.28 },
      costBase: { coins: 75, items: { cristales_magicos: 2, zafiro: 1 } }
    },
    tormenta_rayos: {
      id: 'tormenta_rayos',
      target: 'tool',
      name: 'Tormenta de Rayos',
      color: '#4fc3f7',
      icon: 'scroll_lightning',
      maxLevel: 3,
      reqTier: 2,
      desc: '22% probabilidad por nivel de invocar un rayo celestial al golpear (+45% daño extra).',
      perLevel: { lightningChance: 0.22, procDmgMult: 0.45 },
      costBase: { coins: 95, items: { cristales_magicos: 3, diamante: 1 } }
    },
    golpe_pesado: {
      id: 'golpe_pesado',
      target: 'tool',
      name: 'Golpe Demoledor',
      color: '#ffab91',
      icon: 'ancient_idol',
      maxLevel: 3,
      reqTier: 1,
      incompatibleWith: ['filo'],
      desc: '+28% daño contundente y +8% daño crítico a costa de -5% velocidad de golpe.',
      perLevel: { dmgBonus: 0.28, critChance: 0.08, speedMult: -0.05 },
      costBase: { coins: 50, items: { lingote_acero: 2, carbon: 4 } }
    },
    cazador_jefes: {
      id: 'cazador_jefes',
      target: 'tool',
      name: 'Azote de Soberanos',
      color: '#ff7043',
      icon: 'pendant_skull',
      maxLevel: 3,
      reqTier: 2,
      desc: '+22% daño contra Jefes y élites de mazmorra y +5% crítico por nivel.',
      perLevel: { bossDmgBonus: 0.22, critChance: 0.05 },
      costBase: { coins: 85, items: { huesos: 5, rubi: 1 } }
    },
    maestro_hechizos: {
      id: 'maestro_hechizos',
      target: 'tool',
      name: 'Foco Conjurador',
      color: '#ba68c8',
      icon: 'scroll_blue_sealed',
      maxLevel: 3,
      reqTier: 2,
      desc: '+18% poder de hechizos y -8% enfriamiento mágico por nivel.',
      perLevel: { spellPower: 0.18, spellCdRed: 0.08 },
      costBase: { coins: 80, items: { cristales_magicos: 2, zafiro: 1 } }
    },
    ecos_arcano: {
      id: 'ecos_arcano',
      target: 'tool',
      name: 'Sifón de Éter',
      color: '#4dd0e1',
      icon: 'mana_orb',
      maxLevel: 2,
      reqTier: 2,
      incompatibleWith: ['vampirismo'],
      desc: '-12% coste mágico de maná y +1.2 Energía/s de recuperación en combate.',
      perLevel: { manaSave: 0.12, energyRegen: 1.2 },
      costBase: { coins: 75, items: { cristales_magicos: 2, amatista: 1 } }
    }
  };

  const ARMOR_ENCHANTS = {
    proteccion: {
      id: 'proteccion',
      target: 'armor',
      name: 'Protección Férrea',
      color: '#90caf9',
      icon: 'armor_iron',
      maxLevel: 3,
      desc: '+6 Defensa física y resistencia ante golpes por nivel.',
      perLevel: { def: 6 },
      costBase: { coins: 45, items: { lingote_hierro: 2, cristales: 1 } }
    },
    vitalidad: {
      id: 'vitalidad',
      target: 'armor',
      name: 'Vitalidad Roble',
      color: '#a5d6a7',
      icon: 'relic_heart',
      maxLevel: 3,
      desc: '+25 Vida máxima y +0.4 HP/s de regeneración por nivel.',
      perLevel: { maxHp: 25, regen: 0.4 },
      costBase: { coins: 45, items: { oro: 2, bayas: 5 } }
    },
    espinas: {
      id: 'espinas',
      target: 'armor',
      name: 'Armadura de Espinas',
      color: '#ce93d8',
      icon: 'bone',
      maxLevel: 3,
      reqTier: 1,
      incompatibleWith: ['pie_pluma'],
      desc: 'Refleja 30% del daño cuerpo a cuerpo recibido por nivel.',
      perLevel: { thorns: 0.30 },
      costBase: { coins: 55, items: { huesos: 4, cristales_magicos: 1 } }
    },
    agilidad: {
      id: 'agilidad',
      target: 'armor',
      name: 'Brisa Ligera',
      color: '#fff59d',
      icon: 'leather',
      maxLevel: 2,
      reqTier: 1,
      incompatibleWith: ['piel_piedra'],
      desc: '+12% velocidad de movimiento y ahorro de energía por nivel.',
      perLevel: { moveSpeed: 0.12, energySave: 0.08 },
      costBase: { coins: 40, items: { cuero: 3, tela: 2 } }
    },
    aura_luz: {
      id: 'aura_luz',
      target: 'armor',
      name: 'Luminaria Celestial',
      color: '#ffd54f',
      icon: 'rune_light',
      maxLevel: 2,
      reqTier: 1,
      desc: 'Emite un halo protector de +95 de radio de luz nocturna por nivel.',
      perLevel: { lightRadius: 95, nightVision: 0.12 },
      costBase: { coins: 60, items: { hongo_luminoso: 3, oro: 2 } }
    },
    imantacion: {
      id: 'imantacion',
      target: 'armor',
      name: 'Magnetismo Estelar',
      color: '#80deea',
      icon: 'rune_water',
      maxLevel: 3,
      reqTier: 1,
      desc: 'Atrae botín, gemas y orbes de experiencia +45 de alcance por nivel.',
      perLevel: { magnetBonus: 45 },
      costBase: { coins: 55, items: { lingote_platino: 1, zafiro: 1 } }
    },
    fortuna_belica: {
      id: 'fortuna_belica',
      target: 'armor',
      name: 'Botín de Guerra',
      color: '#ffca28',
      icon: 'coin_stack',
      maxLevel: 3,
      reqTier: 2,
      desc: '+18% monedas y +15% suerte de botín al derrotar enemigos por nivel.',
      perLevel: { coinDropBonus: 0.18, luckBonus: 0.15 },
      costBase: { coins: 65, items: { lingote_oro: 2, rubi: 1 } }
    },
    baluarte_arcano: {
      id: 'baluarte_arcano',
      target: 'armor',
      name: 'Baluarte Elemental',
      color: '#b39ddb',
      icon: 'rune_dark',
      maxLevel: 3,
      reqTier: 2,
      desc: '+15 Energía Máxima, +0.45 Energía/s, -10% daño mágico y -8% enfriamiento de hechizos por nivel.',
      perLevel: { maxEnergy: 15, energyRegen: 0.45, spellResist: 0.10, spellCdRed: 0.08 },
      costBase: { coins: 70, items: { amatista: 1, esencia_oscura: 2 } }
    },
    piel_piedra: {
      id: 'piel_piedra',
      target: 'armor',
      name: 'Coraza Pétrea',
      color: '#b0bec5',
      icon: 'tablet_stone',
      maxLevel: 3,
      reqTier: 2,
      incompatibleWith: ['agilidad'],
      desc: '+10 Defensa fija y +35 Vida máxima por nivel, pero requiere renunciar a Brisa Ligera.',
      perLevel: { def: 10, maxHp: 35 },
      costBase: { coins: 75, items: { lingote_acero: 2, piedra: 8 } }
    },
    pie_pluma: {
      id: 'pie_pluma',
      target: 'armor',
      name: 'Paso de Pluma',
      color: '#80cbc4',
      icon: 'spell_paso_etereo',
      maxLevel: 2,
      reqTier: 2,
      incompatibleWith: ['espinas'],
      desc: '+11% probabilidad de esquivar golpes y +10% velocidad de desplazamiento por nivel.',
      perLevel: { dodgeChance: 0.11, moveSpeed: 0.10 },
      costBase: { coins: 70, items: { tela: 4, cristales: 2 } }
    },
    aura_regeneracion: {
      id: 'aura_regeneracion',
      target: 'armor',
      name: 'Manto Fénix',
      color: '#ffab91',
      icon: 'potion_elixir',
      maxLevel: 3,
      reqTier: 2,
      desc: '+1.1 HP/s de regeneración constante y +0.7 Energía/s por nivel.',
      perLevel: { regen: 1.1, energyRegen: 0.7 },
      costBase: { coins: 85, items: { rubi: 1, esencia_fuego: 2 } }
    },
    voluntad_arcana: {
      id: 'voluntad_arcana',
      target: 'armor',
      name: 'Voluntad del Archimago',
      color: '#e040fb',
      icon: 'scroll_blue_sealed',
      maxLevel: 3,
      reqTier: 3,
      desc: '+18% poder de hechizos, +18 Energía Máx y -8% enfriamiento mágico por nivel.',
      perLevel: { spellPower: 0.18, maxEnergy: 18, spellCdRed: 0.08 },
      costBase: { coins: 105, items: { zafiro: 2, esencia_arcana: 2 } }
    }
  };

  // Permanent passive relics dropped by biome bosses & special discoveries
  const PERMANENT_RELICS = {
    linterna_flotante: {
      id: 'linterna_flotante',
      tier: 'comun',
      name: 'Linterna Flotante Espiritual',
      icon: 'relic_lantern',
      bossName: 'Rey Slime',
      biome: 'pradera',
      color: '#ffd54f',
      desc: 'Flota eternamente junto a ti iluminando la oscuridad nocturna (+165 de radio de luz) y otorga +10% suerte.',
      effect: { lightRadius: 165, nightVision: 0.25, luckBonus: 0.10 }
    },
    brujula_estelar: {
      id: 'brujula_estelar',
      tier: 'poco_comun',
      name: 'Brújula Estelar de las Dunas',
      icon: 'relic_compass',
      bossName: 'Gólem de Cristal',
      biome: 'desierto',
      color: '#ffe082',
      desc: 'Atrae botín desde muy lejos (+100 de alcance de imán) y aumenta tu velocidad de exploración en +12%.',
      effect: { magnetBonus: 100, moveSpeed: 0.12 }
    },
    corazon_umbrio: {
      id: 'corazon_umbrio',
      tier: 'raro',
      name: 'Corazón Umbrío Inmortal',
      icon: 'relic_heart',
      bossName: 'Rey Exánime',
      biome: 'bosque_oscuro',
      color: '#ce93d8',
      desc: 'Otorga +50 Vida máxima permanente y restaura +8 HP cada vez que derrotas a un enemigo.',
      effect: { maxHp: 50, killHeal: 8 }
    },
    corona_escarcha: {
      id: 'corona_escarcha',
      tier: 'epico',
      name: 'Cáliz de Escarcha Eterna',
      icon: 'relic_crown',
      bossName: 'Coloso de Escarcha',
      biome: 'montanas_heladas',
      color: '#80deea',
      desc: 'Otorga +10 Defensa permanente, -20% gasto de energía y +10% golpe crítico.',
      effect: { def: 10, energySave: 0.20, critChance: 0.10 }
    },
    nucleo_volcanico: {
      id: 'nucleo_volcanico',
      tier: 'legendario',
      name: 'Pluma del Fénix Solar',
      icon: 'relic_core',
      bossName: 'Señor Ígneo Balak',
      biome: 'tierras_volcanicas',
      color: '#ff8a65',
      desc: 'Reliquia pasiva: +25% daño global, +25% monedas en cofres/bajas y +120 de aura luminosa permanente.',
      effect: { dmgBonus: 0.25, coinDropBonus: 0.25, lightRadius: 120 }
    },
    cetro_goblin: {
      id: 'cetro_goblin',
      tier: 'poco_comun',
      name: 'Cetro Real Goblin',
      icon: 'relic_goblet',
      bossName: 'Rey Goblin Korak',
      biome: 'pradera',
      color: '#aed581',
      desc: 'Reliquia pasiva: +18% velocidad al picar y talar, +12% doble botín y +15% Experiencia de recolección.',
      effect: { powerMult: 0.18, doubleChance: 0.12, xpBonus: 0.15 }
    },
    amuleto_arena: {
      id: 'amuleto_arena',
      tier: 'raro',
      name: 'Escudo del Faraón Óseo',
      icon: 'shield_mithril',
      bossName: 'Centurión Solar Anub',
      biome: 'desierto',
      color: '#ffd54f',
      desc: 'Reliquia pasiva: +8 Defensa fija, +20 Energía máxima y +15% suerte al excavar o abrir cofres.',
      effect: { def: 8, maxEnergy: 20, luckBonus: 0.15 }
    },
    calavera_espectral: {
      id: 'calavera_espectral',
      tier: 'epico',
      name: 'Cráneo del Nigromante',
      icon: 'relic_skull',
      bossName: 'Soberano Esqueleto Malakor',
      biome: 'bosque_oscuro',
      color: '#b39ddb',
      desc: 'Reliquia pasiva: +18% golpe crítico, roba +6 Vida tras cada baja y emite +100 de aura fantasmal.',
      effect: { critChance: 0.18, killHeal: 6, lightRadius: 100 }
    },
    grimorio_glaciar: {
      id: 'grimorio_glaciar',
      tier: 'legendario',
      name: 'Grimorio del Glaciar Arcano',
      icon: 'relic_tome',
      bossName: 'Archimago Boreal Vael',
      biome: 'montanas_heladas',
      color: '#4fc3f7',
      desc: 'Reliquia pasiva: -25% enfriamiento de hechizos, +1.5 Energía/s de recarga, -15% coste de maná y +20% Exp global.',
      effect: { spellCdRed: 0.25, energyRegen: 1.5, energySave: 0.15, xpBonus: 0.20 }
    },
    ojo_abismo: {
      id: 'ojo_abismo',
      tier: 'mitico',
      name: 'Ojo del Abismo Primordial',
      icon: 'relic_abyss_eye',
      bossName: 'Dragón Carmesí Ignis',
      biome: 'tierras_volcanicas',
      color: '#ff5252',
      desc: 'Reliquia pasiva: +30% daño total, +35 Vida máxima, +20% velocidad de ataque y +140 de radio de luz.',
      effect: { dmgBonus: 0.30, maxHp: 35, speedMult: 0.20, lightRadius: 140 }
    },

    // === 10 NUEVAS RELIQUIAS SECRETAS (COFRES OCULTOS CON LLAVE LEGENDARIA) ===
    grimorio_ranura_arcana: {
      id: 'grimorio_ranura_arcana',
      isSecret: true,
      name: 'Grimorio del Sexto Sello',
      icon: 'candle_arcane',
      source: 'Cofre Secreto',
      color: '#e040fb',
      desc: 'Reliquia Secreta: Desbloquea +1 Ranura adicional de Encantamiento (hasta 6 máx) y +18% Experiencia.',
      effect: { enchantSlotBonus: 1, xpBonus: 0.18 }
    },
    reloj_arena_eterno: {
      id: 'reloj_arena_eterno',
      isSecret: true,
      name: 'Reloj de Arena Eterno',
      icon: 'hourglass_relic',
      source: 'Cofre Secreto',
      color: '#ffca28',
      desc: 'Reliquia Secreta: -20% tiempo de recarga en todos los hechizos, acelera un +25% tus máquinas y +18% velocidad de movimiento.',
      effect: { spellCdRed: 0.20, speedMult: 0.18, moveSpeed: 0.18 }
    },
    corazon_carmesi_secreto: {
      id: 'corazon_carmesi_secreto',
      isSecret: true,
      name: 'Corazón Vivo del Archipiélago',
      icon: 'heart_crimson',
      source: 'Cofre Secreto',
      color: '#ef5350',
      desc: 'Reliquia Secreta: +80 Vida máxima permanente y +2.5 HP/s de regeneración constante.',
      effect: { maxHp: 80, killHeal: 8 }
    },
    prisma_auroral_secreto: {
      id: 'prisma_auroral_secreto',
      isSecret: true,
      name: 'Prisma de la Aurora Eterna',
      icon: 'prism_imperial',
      source: 'Cofre Secreto',
      color: '#80deea',
      desc: 'Reliquia Secreta: +120 de aura luminosa nocturna, +20% Energía máx y +15% Suerte.',
      effect: { lightRadius: 120, maxEnergy: 20, luckBonus: 0.15 }
    },
    estrella_magnetica_secreta: {
      id: 'estrella_magnetica_secreta',
      isSecret: true,
      name: 'Estrella Magnética de Orión',
      icon: 'mana_orb',
      source: 'Cofre Secreto',
      color: '#4fc3f7',
      desc: 'Reliquia Secreta: +160 de alcance en atracción de botín global y +20% probabilidad de doble drop.',
      effect: { magnetBonus: 160, doubleChance: 0.20 }
    },
    sello_maestro_minero: {
      id: 'sello_maestro_minero',
      isSecret: true,
      name: 'Sello Subterráneo Antiguo',
      icon: 'geode_gold',
      source: 'Cofre Secreto',
      color: '#ffb74d',
      desc: 'Reliquia Secreta: +30% potencia al minar y talar vetas y +25% monedas en tesoros.',
      effect: { powerMult: 0.30, coinDropBonus: 0.25 }
    },
    estandarte_fenix_secreto: {
      id: 'estandarte_fenix_secreto',
      isSecret: true,
      name: 'Emblema Dorado del Fénix',
      icon: 'pendant_phoenix',
      source: 'Cofre Secreto',
      color: '#ff7043',
      desc: 'Reliquia Secreta: +28% daño contra enemigos y jefes, y +12% golpe crítico.',
      effect: { dmgBonus: 0.28, critChance: 0.12 }
    },
    luna_argentina_secreta: {
      id: 'luna_argentina_secreta',
      isSecret: true,
      name: 'Medallón Lunar de Mareas',
      icon: 'pendant_moon',
      source: 'Cofre Secreto',
      color: '#b39ddb',
      desc: 'Reliquia Secreta: +35 Energía máxima, -20% gasto de energía y +1.2 Energía/s.',
      effect: { maxEnergy: 35, energySave: 0.20, energyRegen: 1.2 }
    },
    corona_fortunata_secreta: {
      id: 'corona_fortunata_secreta',
      isSecret: true,
      name: 'Diadema de la Fortuna Oculta',
      icon: 'crown_sovereign',
      source: 'Cofre Secreto',
      color: '#ffe082',
      desc: 'Reliquia Secreta: +35% Suerte global en cofres, pesca y gemas, y +30% monedas.',
      effect: { luckBonus: 0.35, coinDropBonus: 0.30 }
    },
    bastion_diamante_secreto: {
      id: 'bastion_diamante_secreto',
      isSecret: true,
      name: 'Bastión Eterno del Guardián',
      icon: 'ring_astral',
      source: 'Cofre Secreto',
      color: '#66bb6a',
      desc: 'Reliquia Secreta: +16 Defensa permanente, +45 Vida máxima y +18% velocidad al andar.',
      effect: { def: 16, maxHp: 45, moveSpeed: 0.18 }
    },
    corona_rey_oseo: {
      id: 'corona_rey_oseo',
      tier: 'mitico',
      name: 'Corona del Soberano Óseo',
      icon: 'corona_rey_oseo',
      bossName: 'Soberano Esqueleto Gigante',
      biome: 'bosque_oscuro',
      color: '#ce93d8',
      desc: 'Reliquia Mítica: +25% Daño global, +15% Golpe Crítico, +15 Defensa y +20% Experiencia.',
      effect: { dmgBonus: 0.25, critChance: 0.15, def: 15, xpBonus: 0.20 }
    },

    // === FASE 5: 20 NUEVAS RELIQUIAS DE JEFES DE MAZMORRA Y EXPLORACIÓN (TOTAL: 36 RELIQUIAS) ===
    emblema_cazador_madri: {
      id: 'emblema_cazador_madri',
      tier: 'comun',
      name: 'Colmillo de la Madriguera',
      icon: 'relic_warhammer_totem',
      bossName: 'Jefe Zapador Skrag',
      biome: 'pradera',
      color: '#a5d6a7',
      desc: 'Reliquia Común: +10% velocidad de ataque, +10% monedas y +25 alcance de imán.',
      effect: { speedMult: 0.10, coinDropBonus: 0.10, magnetBonus: 25 }
    },
    baston_claro_pradera: {
      id: 'baston_claro_pradera',
      tier: 'poco_comun',
      name: 'Blasón del Bastión Verde',
      icon: 'relic_gauntlet_steel',
      bossName: 'Capitán Jabalí Grok',
      biome: 'pradera',
      color: '#81c784',
      desc: 'Reliquia Poco Común: +8 Defensa, +30 Vida máxima y +10% poder de recolección.',
      effect: { def: 8, maxHp: 30, powerMult: 0.10 }
    },
    flor_bosquecillo_ancestral: {
      id: 'flor_bosquecillo_ancestral',
      tier: 'poco_comun',
      name: 'Pétalo del Santuario Vivo',
      icon: 'relic_mystic_blossom',
      bossName: 'Guardián Silvestre Orin',
      biome: 'pradera',
      color: '#66bb6a',
      desc: 'Reliquia Poco Común: +1.0 HP/s de regeneración, +15% poder mágico y +10% cosecha.',
      effect: { regen: 1.0, spellPower: 0.15, doubleChance: 0.10 }
    },
    astrolabio_oasis_perdido: {
      id: 'astrolabio_oasis_perdido',
      tier: 'raro',
      name: 'Astrolabio del Oasis',
      icon: 'relic_astrolabe',
      bossName: 'Sierpe Esmeralda Sotek',
      biome: 'desierto',
      color: '#4dd0e1',
      desc: 'Reliquia Rara: -10% enfriamiento de hechizos, +15% Experiencia y +12% velocidad.',
      effect: { spellCdRed: 0.10, xpBonus: 0.15, moveSpeed: 0.12 }
    },
    caliz_catacumbas_arena: {
      id: 'caliz_catacumbas_arena',
      tier: 'raro',
      name: 'Cáliz de las Catacumbas',
      icon: 'relic_chalice_gold',
      bossName: 'Sumo Escriba Khafre',
      biome: 'desierto',
      color: '#ffd54f',
      desc: 'Reliquia Rara: +20 Energía Máx, +18% poder de hechizos y +12% monedas.',
      effect: { maxEnergy: 20, spellPower: 0.18, coinDropBonus: 0.12 }
    },
    disco_solario_eterno: {
      id: 'disco_solario_eterno',
      tier: 'epico',
      name: 'Medallón del Solario',
      icon: 'relic_sun_medallion',
      bossName: 'Faraón Radiante Ra-Men',
      biome: 'desierto',
      color: '#ffb300',
      desc: 'Reliquia Épica: +20% Daño vs Jefes, +140 de luz y +12% daño global.',
      effect: { bossDmgBonus: 0.20, lightRadius: 140, dmgBonus: 0.12 }
    },
    tomo_necromante_oscuro: {
      id: 'tomo_necromante_oscuro',
      tier: 'epico',
      name: 'Códice Carmesí Maldito',
      icon: 'relic_crimson_tome',
      bossName: 'Archiliche Morvane',
      biome: 'bosque_oscuro',
      color: '#ab47bc',
      desc: 'Reliquia Épica: +22% poder de hechizos, +5 robo de vida al golpear y +12% crítico.',
      effect: { spellPower: 0.22, lifeSteal: 5, critChance: 0.12 }
    },
    vial_laboratorio_arcano: {
      id: 'vial_laboratorio_arcano',
      tier: 'epico',
      name: 'Frasco del Alquimista Loco',
      icon: 'relic_arcane_phial',
      bossName: 'Autómata Alquímico X-09',
      biome: 'bosque_oscuro',
      color: '#7e57c2',
      desc: 'Reliquia Épica: +25 Energía Máx, -12% coste mágico de maná y +1.4 Energía/s.',
      effect: { maxEnergy: 25, manaSave: 0.12, energyRegen: 1.4 }
    },
    glandula_reina_aracnida: {
      id: 'glandula_reina_aracnida',
      tier: 'raro',
      name: 'Orbe Alado de Arácnea',
      icon: 'relic_winged_orb',
      bossName: 'Emperatriz Arácnea Syla',
      biome: 'bosque_oscuro',
      color: '#9ccc65',
      desc: 'Reliquia Rara: +14% evasión, +15% velocidad de ataque y +10% crítico.',
      effect: { dodgeChance: 0.14, speedMult: 0.15, critChance: 0.10 }
    },
    perla_pantano_putrido: {
      id: 'perla_pantano_putrido',
      tier: 'raro',
      name: 'Perla del Abismo Verde',
      icon: 'relic_abyss_pearl',
      bossName: 'Hidra del Pantano Mog',
      biome: 'bosque_oscuro',
      color: '#26a69a',
      desc: 'Reliquia Rara: +55 Vida máxima, +10% resistencia mágica y +8 HP tras cada baja.',
      effect: { maxHp: 55, spellResist: 0.10, killHeal: 8 }
    },
    vial_glaciar_puro: {
      id: 'vial_glaciar_puro',
      tier: 'epico',
      name: 'Esencia Glaciar Sellada',
      icon: 'relic_frost_phial',
      bossName: 'Matriarca de Escarcha Ymir',
      biome: 'montanas_heladas',
      color: '#80deea',
      desc: 'Reliquia Épica: +18% probabilidad de ralentizar enemigos, +12 Defensa y -10% enfriamiento.',
      effect: { frostSlowChance: 0.18, def: 12, spellCdRed: 0.10 }
    },
    arca_mina_profunda: {
      id: 'arca_mina_profunda',
      tier: 'epico',
      name: 'Cofre Rúnico del Minero',
      icon: 'relic_frost_chest',
      bossName: 'Gólem de Diamante Boreal',
      biome: 'montanas_heladas',
      color: '#4fc3f7',
      desc: 'Reliquia Épica: +25% poder de minería, +20% doble botín y +25% suerte global.',
      effect: { powerMult: 0.25, doubleChance: 0.20, luckBonus: 0.25 }
    },
    sello_fortaleza_norte: {
      id: 'sello_fortaleza_norte',
      tier: 'legendario',
      name: 'Sello de la Fortaleza Eterna',
      icon: 'relic_crescent_star',
      bossName: 'Comandante Valkir Thrond',
      biome: 'montanas_heladas',
      color: '#90caf9',
      desc: 'Reliquia Legendaria: +18 Defensa, +60 Vida máxima y +22% daño vs Jefes.',
      effect: { def: 18, maxHp: 60, bossDmgBonus: 0.22 }
    },
    cetro_solar_abismo: {
      id: 'cetro_solar_abismo',
      tier: 'legendario',
      name: 'Cetro del Abismo Ígneo',
      icon: 'relic_sun_scepter',
      bossName: 'Señor de la Grieta Surtur',
      biome: 'tierras_volcanicas',
      color: '#ff7043',
      desc: 'Reliquia Legendaria: +28% poder de hechizos, +18% daño global y +10 quemadura ígnea.',
      effect: { spellPower: 0.28, dmgBonus: 0.18, burnDmg: 10 }
    },
    anillo_fragua_rubi: {
      id: 'anillo_fragua_rubi',
      tier: 'legendario',
      name: 'Banda de la Fragua Titan',
      icon: 'relic_ruby_band',
      bossName: 'Forjador Titánico Hephaest',
      biome: 'tierras_volcanicas',
      color: '#ef5350',
      desc: 'Reliquia Legendaria: +25% poder de herramientas, +18% crítico y +15 Defensa.',
      effect: { powerMult: 0.25, critChance: 0.18, def: 15 }
    },
    esfera_caldera_solar: {
      id: 'esfera_caldera_solar',
      tier: 'legendario',
      name: 'Esfera Solar Incandescente',
      icon: 'relic_solar_sphere',
      bossName: 'Fénix Magmático Zyr',
      biome: 'tierras_volcanicas',
      color: '#ffca28',
      desc: 'Reliquia Legendaria: +2.0 HP/s de regeneración, +160 luz y +15% velocidad.',
      effect: { regen: 2.0, lightRadius: 160, moveSpeed: 0.15 }
    },
    idolo_trono_ceniza: {
      id: 'idolo_trono_ceniza',
      tier: 'mitico',
      name: 'Ídolo del Trono de Ceniza',
      icon: 'ancient_idol',
      bossName: 'Emperador Ceniza Kael-Vorn',
      biome: 'tierras_volcanicas',
      color: '#ff1744',
      desc: 'Reliquia Mítica: +35% Daño global, +25% Poder mágico, -15% enfriamiento y +50 Vida.',
      effect: { dmgBonus: 0.35, spellPower: 0.25, spellCdRed: 0.15, maxHp: 50 }
    },
    esquirla_prisma_tierra: {
      id: 'esquirla_prisma_tierra',
      tier: 'raro',
      name: 'Prisma Geódico Resonante',
      icon: 'relic_prism_shard',
      source: 'Cofre Secreto',
      isSecret: true,
      color: '#f06292',
      desc: 'Reliquia Secreta Rara: +30% Experiencia global y +15% doble botín.',
      effect: { xpBonus: 0.30, doubleChance: 0.15 }
    },
    esfera_esmeralda_gaia: {
      id: 'esfera_esmeralda_gaia',
      tier: 'epico',
      name: 'Corazón Esmeralda de Gaia',
      icon: 'relic_emerald_sphere',
      source: 'Altar Secreto',
      isSecret: true,
      color: '#4caf50',
      desc: 'Reliquia Épica: +75 Vida máxima, +2 frutos al cosechar y +1.5 HP/s.',
      effect: { maxHp: 75, harvestBonus: 2, regen: 1.5 }
    },
    nucleo_marea_astral: {
      id: 'nucleo_marea_astral',
      tier: 'legendario',
      name: 'Núcleo de la Marea Astral',
      icon: 'relic_tidal_core',
      source: 'Cofre Secreto',
      isSecret: true,
      color: '#29b6f6',
      desc: 'Reliquia Secreta Legendaria: +35 Energía Máx, +2.0 Energía/s y -15% enfriamiento de hechizos.',
      effect: { maxEnergy: 35, energyRegen: 2.0, spellCdRed: 0.15 }
    },
    // ── Beta 1.3.0: 51 Reliquias Únicas de Mazmorras (Tiers 6–16 + Eclipse Final) ──
    sello_cumbre_helada: {
      id: 'sello_cumbre_helada',
      name: 'Sello de la Cumbre Ventisquero',
      icon: 'relic_v13_0',
      source: 'Montañas Heladas (Cumbre del Ventisquero)',
      color: '#80deea',
      desc: '+22 Vida máx, +4 Defensa y +6% Probabilidad Crítica.',
      effect: { maxHp: 22, def: 4, critChance: 0.06 }
    },
    amuleto_arrecife_coral: {
      id: 'amuleto_arrecife_coral',
      name: 'Amuleto del Arrecife Vivo',
      icon: 'relic_v13_1',
      source: 'Archipiélago Coral (Gruta del Arrecife)',
      color: '#26c6da',
      desc: '+8% Velocidad de movimiento y +8% Suerte en botín.',
      effect: { moveSpeed: 0.08, luckBonus: 0.08 }
    },
    perla_sirena_azul: {
      id: 'perla_sirena_azul',
      name: 'Perla de la Sirena Abisal',
      icon: 'relic_v13_2',
      source: 'Archipiélago Coral (Santuario de la Perla)',
      color: '#4dd0e1',
      desc: '+18 Energía máx, +0.9 Energía/s y -8% Enfriamiento de hechizos.',
      effect: { maxEnergy: 18, energyRegen: 0.9, spellCdRed: 0.08 }
    },
    tridente_fosa_marina: {
      id: 'tridente_fosa_marina',
      name: 'Emblema de la Fosa Marina',
      icon: 'relic_v13_3',
      source: 'Archipiélago Coral (Abismo de la Marea)',
      color: '#00acc1',
      desc: '+10% Daño global y +10% Velocidad de ataque.',
      effect: { dmgBonus: 0.10, speedMult: 0.10 }
    },
    escama_leviatan_coral: {
      id: 'escama_leviatan_coral',
      name: 'Escama del Leviatán de Coral',
      icon: 'relic_v13_4',
      source: 'Archipiélago Coral (Bastión de Coral)',
      color: '#0097a7',
      desc: '+32 Vida máx, +5 Defensa y +5% Resistencia mágica.',
      effect: { maxHp: 32, def: 5, spellResist: 0.05 }
    },
    corona_emperatriz_mar: {
      id: 'corona_emperatriz_mar',
      name: 'Corona de la Emperatriz Abisal',
      icon: 'relic_v13_5',
      source: 'Archipiélago Coral (Trono de Leviatán)',
      color: '#18ffff',
      desc: '+12% Doble Drop, +12% Monedas y +12% Potencia de recolección.',
      effect: { doubleChance: 0.12, coinDropBonus: 0.12, powerMult: 0.12 }
    },
    prisma_geoda_viva: {
      id: 'prisma_geoda_viva',
      name: 'Prisma de la Geoda Viva',
      icon: 'relic_v13_6',
      source: 'Cavernas Cristalinas (Caverna de la Geoda)',
      color: '#ce93d8',
      desc: '+80 Radio de luz, +10% Suerte y +10% Poder de minería.',
      effect: { lightRadius: 80, luckBonus: 0.10, gatherBonus: 0.10 }
    },
    espejo_cuarzo_astral: {
      id: 'espejo_cuarzo_astral',
      name: 'Espejo de Cuarzo Astral',
      icon: 'relic_v13_7',
      source: 'Cavernas Cristalinas (Galería de los Espejos)',
      color: '#ba68c8',
      desc: '+12% Poder de hechizos y +10% Resistencia a conjuros.',
      effect: { spellPower: 0.12, spellResist: 0.10 }
    },
    diapason_amatista: {
      id: 'diapason_amatista',
      name: 'Diapasón de Amatista Resonante',
      icon: 'relic_v13_8',
      source: 'Cavernas Cristalinas (Cámara de Amatista)',
      color: '#ab47bc',
      desc: '+22 Energía máx y +10% Velocidad de ataque.',
      effect: { maxEnergy: 22, speedMult: 0.10 }
    },
    lente_refraccion_pura: {
      id: 'lente_refraccion_pura',
      name: 'Lente de Refracción Pura',
      icon: 'relic_v13_9',
      source: 'Cavernas Cristalinas (Nexo Prismático)',
      color: '#e040fb',
      desc: '+8% Probabilidad Crítica y +12% Daño contra Jefes.',
      effect: { critChance: 0.08, bossDmgBonus: 0.12 }
    },
    corazon_celestita_eterno: {
      id: 'corazon_celestita_eterno',
      name: 'Corazón de Celestita Eterna',
      icon: 'relic_v13_11',
      source: 'Cavernas Cristalinas (Corazón del Cristal)',
      color: '#7c4dff',
      desc: '+40 Vida máx, +1.0 Regeneración HP/s y +12% XP.',
      effect: { maxHp: 40, regen: 1.0, xpBonus: 0.12 }
    },
    talisman_raices_antiguas: {
      id: 'talisman_raices_antiguas',
      name: 'Talismán de Raíces Antiguas',
      icon: 'relic_v13_12',
      source: 'Selva Esmeralda (Raíces Ancestrales)',
      color: '#66bb6a',
      desc: '+1 Fruto al cosechar, +10% Madera/Menaje y +26 Vida máx.',
      effect: { harvestBonus: 1, gatherBonus: 0.10, maxHp: 26 }
    },
    mascara_serpiente_jade: {
      id: 'mascara_serpiente_jade',
      name: 'Máscara de la Serpiente de Jade',
      icon: 'relic_v13_13',
      source: 'Selva Esmeralda (Pirámide de Jade)',
      color: '#26a69a',
      desc: '+11% Daño global y +7% Crítico.',
      effect: { dmgBonus: 0.11, critChance: 0.07 }
    },
    ambar_reina_esmeralda: {
      id: 'ambar_reina_esmeralda',
      name: 'Ámbar de la Reina Colmena',
      icon: 'relic_v13_14',
      source: 'Selva Esmeralda (Colmena Esmeralda)',
      color: '#ffca28',
      desc: '+1.2 Regeneración HP/s y +1.1 Energía/s.',
      effect: { regen: 1.2, energyRegen: 1.1 }
    },
    pluma_quetzal_dorado: {
      id: 'pluma_quetzal_dorado',
      name: 'Pluma del Quetzal Dorado',
      icon: 'relic_v13_15',
      source: 'Selva Esmeralda (Templo del Dosel)',
      color: '#00e676',
      desc: '+10% Velocidad de movimiento y +90 Atracción de botín.',
      effect: { moveSpeed: 0.10, magnetBonus: 90 }
    },
    semilla_corazon_selva: {
      id: 'semilla_corazon_selva',
      name: 'Semilla del Corazón Esmeralda',
      icon: 'relic_v13_16',
      source: 'Selva Esmeralda (Corazón de la Jungla)',
      color: '#00c853',
      desc: '+45 Vida máx, +6 Curación al matar y +5% Reducción de daño.',
      effect: { maxHp: 45, killHeal: 6, defPct: 0.05 }
    },
    brasa_fumarola_oscura: {
      id: 'brasa_fumarola_oscura',
      name: 'Brasa de Fumarola Oscura',
      icon: 'relic_v13_17',
      source: 'Caldera de Ceniza (Pozo de Fumarolas)',
      color: '#ff7043',
      desc: '+12% Daño global y +10% Poder de hechizos.',
      effect: { dmgBonus: 0.12, spellPower: 0.10 }
    },
    escoria_crater_ardiente: {
      id: 'escoria_crater_ardiente',
      name: 'Escoria del Cráter Ardiente',
      icon: 'relic_v13_18',
      source: 'Caldera de Ceniza (Cráter Ardiente)',
      color: '#ff5722',
      desc: '+7 Defensa fija y +38 Vida máxima.',
      effect: { def: 7, maxHp: 38 }
    },
    yunque_basalto_rojo: {
      id: 'yunque_basalto_rojo',
      name: 'Yunque de Basalto Rojo',
      icon: 'relic_v13_19',
      source: 'Caldera de Ceniza (Fundición de Escoria)',
      color: '#d84315',
      desc: '+16% Potencia de minería y +12% Velocidad de ataque.',
      effect: { powerMult: 0.16, speedMult: 0.12 }
    },
    colmillo_bestia_ceniza: {
      id: 'colmillo_bestia_ceniza',
      name: 'Colmillo de la Bestia Ígnea',
      icon: 'relic_v13_20',
      source: 'Caldera de Ceniza (Guarida de la Bestia)',
      color: '#ff3d00',
      desc: '+15% Daño contra Jefes y +8% Crítico.',
      effect: { bossDmgBonus: 0.15, critChance: 0.08 }
    },
    corona_senor_caldera: {
      id: 'corona_senor_caldera',
      name: 'Corona del Señor de la Caldera',
      icon: 'relic_v13_21',
      source: 'Caldera de Ceniza (Ciudadela de la Caldera)',
      color: '#ffab00',
      desc: '+14% Daño global, +5% Reducción de daño y +10% Oro.',
      effect: { dmgPct: 0.14, defPct: 0.05, coinDropBonus: 0.10 }
    },
    ankh_dinastia_dorada: {
      id: 'ankh_dinastia_dorada',
      name: 'Ankh de la Dinastía Dorada',
      icon: 'relic_v13_22',
      source: 'Dinastía de la Arena (Tumba de los Escribas)',
      color: '#ffd54f',
      desc: '+14% Experiencia, +14% Oro en cofres/jefes y +25 Vida máx.',
      effect: { xpBonus: 0.14, coinDropBonus: 0.14, maxHp: 25 }
    },
    escarabajo_lapislazuli: {
      id: 'escarabajo_lapislazuli',
      name: 'Escarabajo de Lapislázuli',
      icon: 'relic_v13_23',
      source: 'Dinastía de la Arena (Bóveda del Escarabajo)',
      color: '#42a5f5',
      desc: '+12% Suerte, +12% Doble Drop y +80 Atracción de ítems.',
      effect: { luckBonus: 0.12, doubleChance: 0.12, magnetBonus: 80 }
    },
    fragmento_obelisco_solar: {
      id: 'fragmento_obelisco_solar',
      name: 'Fragmento del Obelisco Solar',
      icon: 'relic_v13_24',
      source: 'Dinastía de la Arena (Obelisco de Hierro)',
      color: '#ffb300',
      desc: '+15% Poder mágico y -10% Enfriamiento de hechizos.',
      effect: { spellPower: 0.15, spellCdRed: 0.10 }
    },
    balanza_juicio_eterno: {
      id: 'balanza_juicio_eterno',
      name: 'Balanza del Juicio Eterno',
      icon: 'relic_v13_25',
      source: 'Dinastía de la Arena (Cámara del Tesoro Real)',
      color: '#ffe082',
      desc: '+8 Defensa, +8% Resistencia mágica y +10% Ahorro de energía.',
      effect: { def: 8, spellResist: 0.08, energySave: 0.10 }
    },
    cetro_sol_cenit: {
      id: 'cetro_sol_cenit',
      name: 'Cetro del Sol en el Cenit',
      icon: 'relic_v13_26',
      source: 'Dinastía de la Arena (Altar del Sol Eterno)',
      color: '#ffca28',
      desc: '+15% Daño global, +100 Luz nocturna y +1.2 Energía/s.',
      effect: { dmgBonus: 0.15, lightRadius: 100, energyRegen: 1.2 }
    },
    nemes_faraon_inmortal: {
      id: 'nemes_faraon_inmortal',
      name: 'Nemes del Faraón Inmortal',
      icon: 'relic_v13_27',
      source: 'Dinastía de la Arena (Pirámide del Faraón)',
      color: '#ff8f00',
      desc: '+55 Vida máx, +18% Daño a Jefes y +10% Crítico.',
      effect: { maxHp: 55, bossDmgBonus: 0.18, critChance: 0.10 }
    },
    esquirla_grieta_azul: {
      id: 'esquirla_grieta_azul',
      name: 'Esquirla de la Grieta Glacial',
      icon: 'relic_v13_28',
      source: 'Glaciar Profundo (Grieta Abisal)',
      color: '#81d4fa',
      desc: '-9% Enfriamiento de hechizos y +26 Energía máx.',
      effect: { spellCdRed: 0.09, maxEnergy: 26 }
    },
    reliquia_mamut_congelado: {
      id: 'reliquia_mamut_congelado',
      name: 'Colmillo del Mamut Ancestral',
      icon: 'relic_v13_29',
      source: 'Glaciar Profundo (Vestigios Helados)',
      color: '#4fc3f7',
      desc: '+50 Vida máx y +9 Defensa física.',
      effect: { maxHp: 50, def: 9 }
    },
    ojo_tormenta_polar: {
      id: 'ojo_tormenta_polar',
      name: 'Ojo de la Tormenta Polar',
      icon: 'relic_v13_30',
      source: 'Glaciar Profundo (Ojo del Ventisquero)',
      color: '#29b6f6',
      desc: '+9% Crítico, +12% Velocidad de ataque y +10% Visión nocturna.',
      effect: { critChance: 0.09, speedMult: 0.12, nightVision: 0.10 }
    },
    runa_coloso_escarcha: {
      id: 'runa_coloso_escarcha',
      name: 'Runa del Coloso Glacial',
      icon: 'relic_v13_31',
      source: 'Glaciar Profundo (Sala del Coloso Glacial)',
      color: '#039be5',
      desc: '+6% Reducción de daño recibido y +14% Daño físico.',
      effect: { defPct: 0.06, dmgPct: 0.14 }
    },
    caliz_hielo_inmaculado: {
      id: 'caliz_hielo_inmaculado',
      name: 'Cáliz de Hielo Inmaculado',
      icon: 'relic_v13_32',
      source: 'Glaciar Profundo (Sancta del Cero Absoluto)',
      color: '#80d8ff',
      desc: '+1.5 Energía/s, +1.5 Vida/s y +12% Ahorro de energía.',
      effect: { energyRegen: 1.5, regen: 1.5, energySave: 0.12 }
    },
    corazon_cero_absoluto: {
      id: 'corazon_cero_absoluto',
      name: 'Corazón del Cero Absoluto',
      icon: 'relic_v13_33',
      source: 'Glaciar Profundo (Trono del Hielo Eterno)',
      color: '#00b0ff',
      desc: '+65 Vida máx, +18% Poder de hechizos y +16% Daño a Jefes.',
      effect: { maxHp: 65, spellPower: 0.18, bossDmgBonus: 0.16 }
    },
    fetiche_manglar_negro: {
      id: 'fetiche_manglar_negro',
      name: 'Fetiche del Manglar Oscuro',
      icon: 'relic_v13_34',
      source: 'Ciénaga Pútrida (Raíces del Manglar)',
      color: '#9ccc65',
      desc: '+16% Recolección de recursos y +2 Frutos extra al cosechar.',
      effect: { gatherBonus: 0.16, harvestBonus: 2 }
    },
    hongo_bioluminiscente: {
      id: 'hongo_bioluminiscente',
      name: 'Espora Bioluminiscente Eterna',
      icon: 'relic_v13_35',
      source: 'Ciénaga Pútrida (Gruta de las Esporas)',
      color: '#aeea00',
      desc: '+110 Luz en cuevas y +14% Suerte global.',
      effect: { lightRadius: 110, luckBonus: 0.14 }
    },
    matraz_cieno_alquimico: {
      id: 'matraz_cieno_alquimico',
      name: 'Matraz de Cieno Alquímico',
      icon: 'relic_v13_36',
      source: 'Ciénaga Pútrida (Lago del Cieno Tóxico)',
      color: '#76ff03',
      desc: '+15% XP, +14% Doble Drop y +8 Curación al matar.',
      effect: { xpBonus: 0.15, doubleChance: 0.14, killHeal: 8 }
    },
    linterna_cosecha_maldita: {
      id: 'linterna_cosecha_maldita',
      name: 'Linterna de Calabaza Espectral',
      icon: 'relic_v13_37',
      source: 'Ciénaga Pútrida (Pantano de las Calabazas)',
      color: '#ff9100',
      desc: '+10% Velocidad, +15% Visión nocturna y +10% Crítico.',
      effect: { moveSpeed: 0.10, nightVision: 0.15, critChance: 0.10 }
    },
    totem_hidra_cienaga: {
      id: 'totem_hidra_cienaga',
      name: 'Tótem de la Hidra Pantanosa',
      icon: 'relic_v13_38',
      source: 'Ciénaga Pútrida (Bastión de la Plaga)',
      color: '#64dd17',
      desc: '+2.0 Regeneración HP/s y +55 Vida máx.',
      effect: { regen: 2.0, maxHp: 55 }
    },
    ovulo_madre_putrida: {
      id: 'ovulo_madre_putrida',
      name: 'Núcleo de la Madre Pútrida',
      icon: 'relic_v13_39',
      source: 'Ciénaga Pútrida (Nido de la Madre Pútrida)',
      color: '#aed581',
      desc: '+18% Daño global, +10 Defensa y +12% Resistencia mágica.',
      effect: { dmgBonus: 0.18, def: 10, spellResist: 0.12 }
    },
    osario_marfil_maldito: {
      id: 'osario_marfil_maldito',
      name: 'Relicario de Marfil Maldito',
      icon: 'relic_v13_40',
      source: 'Necrópolis Ósea (Osario de Marfil)',
      color: '#e0e0e0',
      desc: '+10 Curación al matar y +16% Daño físico.',
      effect: { killHeal: 10, dmgBonus: 0.16 }
    },
    sello_cripta_silenciosa: {
      id: 'sello_cripta_silenciosa',
      name: 'Sello de la Cripta Silenciosa',
      icon: 'relic_v13_42',
      source: 'Necrópolis Ósea (Cripta de los Caídos)',
      color: '#b0bec5',
      desc: '+12 Defensa, +6% Reducción de daño y +12% Resistencia mágica.',
      effect: { def: 12, defPct: 0.06, spellResist: 0.12 }
    },
    farol_almas_errantes: {
      id: 'farol_almas_errantes',
      name: 'Farol de Almas Errantes',
      icon: 'relic_v13_43',
      source: 'Necrópolis Ósea (Catacumbas del Lamento)',
      color: '#80cbc4',
      desc: '+32 Energía máx, +1.8 Energía/s y -12% Enfriamiento.',
      effect: { maxEnergy: 32, energyRegen: 1.8, spellCdRed: 0.12 }
    },
    costilla_dragon_oseo: {
      id: 'costilla_dragon_oseo',
      name: 'Espina del Dragón Óseo',
      icon: 'relic_v13_44',
      source: 'Necrópolis Ósea (Foso de los Sacrificios)',
      color: '#cfd8dc',
      desc: '+22% Daño contra Jefes y +15% Velocidad de ataque.',
      effect: { bossDmgBonus: 0.22, speedMult: 0.15 }
    },
    filacteria_archiliche: {
      id: 'filacteria_archiliche',
      name: 'Filacteria del Archiliche',
      icon: 'relic_v13_45',
      source: 'Necrópolis Ósea (Torre del Archiliche)',
      color: '#b388ff',
      desc: '+24% Poder de hechizos y +70 Vida máx.',
      effect: { spellPower: 0.24, maxHp: 70 }
    },
    corona_soverano_huesos: {
      id: 'corona_soverano_huesos',
      name: 'Corona del Soberano de los Huesos',
      icon: 'relic_v13_46',
      source: 'Necrópolis Ósea (Trono de los Mil Huesos)',
      color: '#ffd180',
      desc: '+12% Crítico, +20% Daño global y +15% XP.',
      effect: { critChance: 0.12, dmgPct: 0.20, xpBonus: 0.15 }
    },
    caliz_sangre_maldita: {
      id: 'caliz_sangre_maldita',
      name: 'Cáliz de Sangre Maldita',
      icon: 'relic_v13_47',
      source: 'Tierras Malditas (Sagrario de Sangre)',
      color: '#e53935',
      desc: '+14 Curación al matar, +2.5 HP/s y +80 Vida máx.',
      effect: { killHeal: 14, regen: 2.5, maxHp: 80 }
    },
    corazon_abominacion_carnica: {
      id: 'corazon_abominacion_carnica',
      name: 'Corazón de la Abominación',
      icon: 'relic_v13_48',
      source: 'Tierras Malditas (Cámara de la Carne)',
      color: '#d81b60',
      desc: '+14 Defensa, +8% Reducción de daño y +95 Vida máx.',
      effect: { def: 14, defPct: 0.08, maxHp: 95 }
    },
    crisol_almas_condenadas: {
      id: 'crisol_almas_condenadas',
      name: 'Crisol de Almas Condenadas',
      icon: 'relic_v13_49',
      source: 'Tierras Malditas (Forja de las Almas)',
      color: '#ff6d00',
      desc: '+25% Potencia de minería/tala y +20% Velocidad de ataque.',
      effect: { powerMult: 0.25, speedMult: 0.20 }
    },
    efigie_rey_cosecha: {
      id: 'efigie_rey_cosecha',
      name: 'Efigie del Rey de la Cosecha',
      icon: 'relic_v13_50',
      source: 'Tierras Malditas (Santuario del Espantapájaros)',
      color: '#ffab00',
      desc: '+22% Doble Drop, +20% Suerte y +22% Oro.',
      effect: { doubleChance: 0.22, luckBonus: 0.20, coinDropBonus: 0.22 }
    },
    ojo_abismo_singularity: {
      id: 'ojo_abismo_singularity',
      name: 'Ojo del Abismo Primordial',
      icon: 'relic_v13_51',
      source: 'Tierras Malditas (Portón del Abismo)',
      color: '#aa00ff',
      desc: '+26% Poder mágico, -15% Enfriamiento y +45 Energía máx.',
      effect: { spellPower: 0.26, spellCdRed: 0.15, maxEnergy: 45 }
    },
    corazon_eclipse_carmesi: {
      id: 'corazon_eclipse_carmesi',
      tier: 'mitico',
      name: 'Corazón del Eclipse Carmesí',
      icon: 'relic_v13_52',
      source: 'Tierras Malditas (Eclipse del Espadachín Carmesí)',
      color: '#ff1744',
      desc: 'Reliquia Suprema del Jefe Final: +150 Vida máx, +35% Daño global, +30% Daño a Jefes, +18% Crítico, +15% Reducción de daño y +3.5 HP/s.',
      effect: { maxHp: 150, dmgBonus: 0.35, bossDmgBonus: 0.30, critChance: 0.18, defPct: 0.15, regen: 3.5 }
    }
  };

  function getEnchantCost(targetKind, enchId, nextLevel) {
    const table = targetKind === 'armor' ? ARMOR_ENCHANTS : TOOL_ENCHANTS;
    const def = table[enchId];
    if (!def) return null;
    const mult = Math.max(1, nextLevel);
    const items = {};
    Object.entries(def.costBase.items).forEach(([id, q]) => {
      items[id] = Math.max(1, Math.round(q * mult));
    });
    return {
      coins: Math.round(def.costBase.coins * mult),
      items
    };
  }

  Balaclava.TOOL_ENCHANTS = TOOL_ENCHANTS;
  Balaclava.ARMOR_ENCHANTS = ARMOR_ENCHANTS;
  Balaclava.PERMANENT_RELICS = PERMANENT_RELICS;
  Balaclava.getEnchantCost = getEnchantCost;
})();
