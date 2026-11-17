(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  // All crafting, smelting, forging, cooking, alchemy and tech recipes.
  const RECIPES = [
    // === FABRICACIÓN INICIAL DE HERRAMIENTAS ===
    { id: 'r_tool_pico',    toolUnlock: 'pico',    qty: 1, station: 'mano', in: { madera: 3, piedra: 3 }, xp: 14 },
    { id: 'r_tool_hacha',   toolUnlock: 'hacha',   qty: 1, station: 'mano', in: { madera: 3, piedra: 3 }, xp: 14 },
    { id: 'r_tool_pala',    toolUnlock: 'pala',    qty: 1, station: 'mano', in: { madera: 3, piedra: 3, fibra_vegetal: 2 }, xp: 14 },
    { id: 'r_tool_espada',  toolUnlock: 'espada',  qty: 1, station: 'mano', in: { madera: 2, piedra: 5, carbon: 2 }, xp: 18 },
    { id: 'r_tool_guadana', toolUnlock: 'guadana', qty: 1, station: 'mano', in: { madera: 3, piedra: 3, hierba: 3 }, xp: 14 },
    { id: 'r_tool_cana',    toolUnlock: 'cana',    qty: 1, station: 'mano', in: { madera: 4, fibra_vegetal: 4 }, xp: 15 },
    { id: 'r_tool_arco',    toolUnlock: 'arco',    qty: 1, station: 'mano', in: { madera: 5, fibra_vegetal: 5, piedra: 2 }, xp: 20 },
    { id: 'r_tool_azada',   toolUnlock: 'azada',   qty: 1, station: 'mano', in: { madera: 3, piedra: 3, fibra_vegetal: 1 }, xp: 14 },

    // === MANO / BÁSICO ===
    { id: 'r_cofre_madera_mano', out: 'cofre_madera', qty: 1, station: 'mano', in: { tablon: 4 }, xp: 8 },
    { id: 'r_flecha', out: 'flecha', qty: 8, station: 'mano', in: { madera: 2, piedra: 1 }, xp: 5, craftTime: 1.0 },
    { id: 'r_flecha_forja', out: 'flecha', qty: 20, station: 'forja', in: { madera: 3, lingote_hierro: 1 }, xp: 12, craftTime: 1.4 },
    { id: 'r_tablon', out: 'tablon', qty: 2, station: 'mano', in: { madera: 3 }, xp: 4 },
    { id: 'r_fibra', out: 'fibra_vegetal', qty: 2, station: 'mano', in: { hierba: 4 }, xp: 3 },
    { id: 'r_carbon_mano', out: 'carbon', qty: 2, station: 'mano', in: { madera: 4 }, xp: 4 },
    { id: 'r_semillas', out: 'semillas', qty: 3, station: 'mano', in: { hierba: 3, bayas: 1 }, xp: 4 },
    { id: 'r_sem_tomate', out: 'semillas_tomate', qty: 3, station: 'mano', in: { hierba: 3, bayas: 2 }, xp: 5 },
    { id: 'r_sem_papa', out: 'semillas_papa', qty: 3, station: 'mano', in: { hierba: 3, piedra: 1, zanahoria: 1 }, xp: 5 },
    { id: 'r_sem_maiz', out: 'semillas_maiz', qty: 3, station: 'mano', in: { trigo: 2, fibra_vegetal: 2 }, xp: 6 },
    { id: 'r_sem_berenjena', out: 'semillas_berenjena', qty: 2, station: 'mano', in: { zanahoria: 2, hierba: 3 }, xp: 7 },
    { id: 'r_sem_chile', out: 'semillas_chile', qty: 2, station: 'mano', in: { cactus: 2, bayas: 2 }, xp: 8 },
    { id: 'r_sem_fresa', out: 'semillas_fresa', qty: 2, station: 'mano', in: { tomate: 2, bayas: 3 }, xp: 10 },
    { id: 'r_sem_uva', out: 'semillas_uva', qty: 2, station: 'mano', in: { calabaza: 1, madera: 2, bayas: 2 }, xp: 12 },
    { id: 'r_cebo_gusano', out: 'cebo_gusano', qty: 4, station: 'mano', in: { hierba: 2, carne: 1 }, xp: 5 },
    { id: 'r_fertilizante_m', out: 'fertilizante', qty: 3, station: 'mano', in: { hierba: 4, huesos: 1 }, xp: 6 },

    // === ACUÑACIÓN DE MONEDAS CON MINERALES (ECONÓMICA MÁS EXIGENTE) ===
    { id: 'r_coin_hierro',        out: '_coin', coinIcon: true, qty: 8,  station: 'mano',  in: { hierro: 2 },        xp: 6 },
    { id: 'r_coin_plata',         out: '_coin', coinIcon: true, qty: 13, station: 'mano',  in: { plata: 2 },         xp: 9 },
    { id: 'r_coin_lingote_hierro',out: '_coin', coinIcon: true, qty: 18, station: 'horno', in: { lingote_hierro: 2 },xp: 10 },
    { id: 'r_coin_lingote_plata', out: '_coin', coinIcon: true, qty: 30, station: 'horno', in: { lingote_plata: 2 }, xp: 15 },
    { id: 'r_coin_oro',           out: '_coin', coinIcon: true, qty: 20, station: 'mano',  in: { oro: 2 },           xp: 12 },
    { id: 'r_coin_lingote_oro',   out: '_coin', coinIcon: true, qty: 46, station: 'forja', in: { lingote_oro: 2 },   xp: 20 },
    { id: 'r_coin_lingote_platino',out:'_coin', coinIcon: true, qty: 75, station: 'forja', in: { lingote_platino: 2 },xp: 26 },

    // === HORNO ===
    { id: 'r_lingote_cobre', out: 'lingote_cobre', qty: 1, station: 'horno', in: { cobre: 2, carbon: 1 }, xp: 8 },
    { id: 'r_lingote_bronce', out: 'lingote_bronce', qty: 2, station: 'horno', in: { cobre: 2, estano: 2, carbon: 1 }, xp: 11 },
    { id: 'r_lingote_hierro', out: 'lingote_hierro', qty: 1, station: 'horno', in: { hierro: 2, carbon: 1 }, xp: 10 },
    { id: 'r_lingote_plata', out: 'lingote_plata', qty: 1, station: 'horno', in: { plata: 2, carbon: 1 }, xp: 13 },
    { id: 'r_lingote_oro', out: 'lingote_oro', qty: 1, station: 'horno', in: { oro: 2, carbon: 1 }, xp: 16 },
    { id: 'r_lingote_platino', out: 'lingote_platino', qty: 1, station: 'horno', in: { platino: 2, carbon: 2 }, xp: 24 },
    { id: 'r_reciclar_lata', out: 'hierro', qty: 2, station: 'horno', in: { lata_oxidada: 2, carbon: 1 }, xp: 6 },
    { id: 'r_vidrio', out: 'vidrio', qty: 2, station: 'horno', in: { arena: 3, carbon: 1 }, xp: 7 },
    { id: 'r_ladrillo', out: 'ladrillo', qty: 2, station: 'horno', in: { arcilla: 3, carbon: 1 }, xp: 8 },
    { id: 'r_carbon_eterno', out: 'carbon_eterno', qty: 2, station: 'horno', in: { carbon: 4, material_volcanico: 1 }, xp: 18 },

    // === ASERRADERO & MOLINO & TELAR & CUERO TIER 1 ===
    { id: 'r_tablon_ase', out: 'tablon', qty: 4, station: 'aserradero', in: { madera: 3 }, xp: 6 },
    { id: 'r_cofre_madera_ase', out: 'cofre_madera', qty: 1, station: 'aserradero', in: { tablon: 4 }, xp: 10 },
    { id: 'r_viga_madera', out: 'viga_madera', qty: 2, station: 'aserradero', in: { madera: 8, hierro: 1 }, xp: 12 },
    { id: 'r_madera_refinada', out: 'madera_refinada', qty: 2, station: 'aserradero', in: { tablon: 4, cera_abeja: 1 }, xp: 14 },
    { id: 'r_harina', out: 'harina', qty: 2, station: 'molino', in: { trigo: 2 }, xp: 6 },
    { id: 'r_harina_maiz', out: 'harina', qty: 3, station: 'molino', in: { maiz: 2 }, xp: 8 },
    { id: 'r_cuerda', out: 'cuerda', qty: 2, station: 'telar', in: { fibra_vegetal: 4 }, xp: 6 },
    { id: 'r_tela_fibra', out: 'tela', qty: 1, station: 'telar', in: { fibra_vegetal: 4 }, xp: 8 },
    { id: 'r_tela_lana', out: 'tela', qty: 2, station: 'telar', in: { lana: 2 }, xp: 10 },
    // === TELAR & COSTURA (ROPA, CUERO Y MOCHILAS) ===
    { id: 'r_cuerda', out: 'cuerda', qty: 2, station: 'telar', in: { fibra_vegetal: 4 }, xp: 8 },
    { id: 'r_tela', out: 'tela', qty: 2, station: 'telar', in: { lana: 3 }, xp: 10 },
    { id: 'r_tela_seda', out: 'tela', qty: 3, station: 'telar', in: { seda_arana: 2 }, xp: 14 },
    { id: 'r_tela_reforzada', out: 'tela_reforzada', qty: 1, station: 'telar', in: { tela: 2, cuero: 1 }, xp: 15 },
    { id: 'r_armadura_tela', out: 'armadura_tela', qty: 1, station: 'telar', in: { tela_reforzada: 4, cuerda: 2 }, xp: 24 },
    { id: 'r_casco_cuero', out: 'casco_cuero', qty: 1, station: 'telar', in: { cuero: 4, fibra_vegetal: 3 }, xp: 14 },
    { id: 'r_arm_cuero', out: 'armadura_cuero', qty: 1, station: 'telar', in: { cuero: 6, tela: 4 }, xp: 28 },
    { id: 'r_pantalones_cuero', out: 'pantalones_cuero', qty: 1, station: 'telar', in: { cuero: 5, tela: 2 }, xp: 22 },
    { id: 'r_botas_cuero', out: 'botas_cuero', qty: 1, station: 'telar', in: { cuero: 4, tela: 2 }, xp: 18 },
    { id: 'r_reciclar_bota', out: 'cuero', qty: 2, station: 'telar', in: { bota_vieja: 1 }, xp: 6 },
    { id: 'r_mochila_cuero', out: 'mochila_cuero', qty: 1, station: 'telar', in: { cuero: 8, cuerda: 4, tela: 4 }, xp: 35 },

    // === FUNDICIÓN ===
    { id: 'r_acero', out: 'lingote_acero', qty: 1, station: 'fundicion', in: { lingote_hierro: 2, carbon: 3 }, xp: 22 },
    { id: 'r_aleacion_ignea', out: 'aleacion_ignea', qty: 1, station: 'fundicion', in: { material_volcanico: 4, lingote_oro: 2, esencia_magma: 1 }, xp: 55 },
    { id: 'r_mitrilo', out: 'lingotes_especiales', qty: 1, station: 'fundicion', in: { lingote_oro: 2, cristales: 3, material_volcanico: 1 }, xp: 45 },
    { id: 'r_mitrilo_puro', out: 'lingotes_especiales', qty: 2, station: 'fundicion', in: { mitrilo_bruto: 2, carbon: 2 }, xp: 52 },
    { id: 'r_adamantita', out: 'lingote_adamantita', qty: 1, station: 'fundicion', in: { adamantita: 2, lingotes_especiales: 1, carbon: 3 }, xp: 72 },
    { id: 'r_aleacion_celestial', out: 'aleacion_celestial', qty: 1, station: 'fundicion', in: { lingote_celestial: 1, polvo_estelar: 2, gema_vacio: 1 }, xp: 125 },
    { id: 'r_celestial', out: 'lingote_celestial', qty: 1, station: 'fundicion', in: { lingote_adamantita: 2, polvo_estelar: 2, nucleo_solar: 1 }, xp: 110 },
    { id: 'r_escama_obsidiana', out: 'escama_obsidiana', qty: 2, station: 'fundicion', in: { material_volcanico: 3, lingote_hierro: 2 }, xp: 34 },

    // === FORJA (ARMAMENTO Y ARMADURAS METÁLICAS, LLAVES Y MEJORAS DE FORJA) ===
    { id: 'r_llave', out: 'llave_mazmorra', qty: 1, station: 'forja', in: { lingote_oro: 2, lingote_hierro: 2, huesos: 2 }, xp: 30 },
    { id: 'r_cebo_dorado', out: 'cebo_dorado', qty: 2, station: 'mesa_artesania', in: { lingote_oro: 1, cebo_gusano: 2 }, xp: 18 },
    { id: 'r_cebo_arcano', out: 'cebo_arcano', qty: 3, station: 'mesa_artesania', in: { cebo_dorado: 1, cristales_magicos: 1, polvo_estelar: 1 }, xp: 45 },
    { id: 'r_cebo_volcanico', out: 'cebo_volcanico', qty: 3, station: 'mesa_artesania', in: { cebo_gusano: 2, material_volcanico: 2, esencia_magma: 1 }, xp: 40 },
    { id: 'r_arm_hierro', out: 'armadura_hierro', qty: 1, station: 'forja', in: { armadura_cobre: 1, lingote_hierro: 8, cuero: 3 }, xp: 48 },
    { id: 'r_pantalones_hierro', out: 'pantalones_hierro', qty: 1, station: 'forja', in: { pantalones_cuero: 1, lingote_hierro: 6, cuero: 2 }, xp: 42 },
    { id: 'r_pantalones_acero', out: 'pantalones_acero', qty: 1, station: 'forja', in: { pantalones_hierro: 1, lingote_acero: 6, azurita_glacial: 2 }, xp: 72 },
    { id: 'r_mochila_reforzada', out: 'mochila_reforzada', qty: 1, station: 'forja', in: { mochila_cuero: 1, lingote_hierro: 6, tela_reforzada: 4 }, xp: 60 },
    { id: 'r_mochila_astral', out: 'mochila_astral', qty: 1, station: 'forja', in: { mochila_reforzada: 1, lingote_celestial: 4, polvo_estelar: 4, gema_alma: 1 }, xp: 140 },
    { id: 'r_arm_oro', out: 'armadura_oro', qty: 1, station: 'forja', in: { armadura_plata: 1, lingote_oro: 6, cuero: 3 }, xp: 68 },
    { id: 'r_arm_platino', out: 'armadura_platino', qty: 1, station: 'forja', in: { armadura_oro: 1, lingote_platino: 6, jade: 2 }, xp: 85 },
    { id: 'r_arm_cristal', out: 'armadura_cristal', qty: 1, station: 'forja', in: { armadura_acero: 1, cristales: 8, cristales_magicos: 3 }, xp: 110 },
    { id: 'r_arm_mitrilo', out: 'armadura_mitrilo', qty: 1, station: 'forja', in: { armadura_cristal: 1, lingotes_especiales: 6, sanguinaria: 2 }, xp: 148 },
    { id: 'r_arm_volcanica', out: 'armadura_volcanica', qty: 1, station: 'forja', in: { armadura_oricalco: 1, material_volcanico: 35, diamantes: 12, lingote_adamantita: 15, fragmentos_antiguos: 8 }, xp: 205 },
    { id: 'r_arm_celestial', out: 'armadura_celestial', qty: 1, station: 'forja', in: { armadura_volcanica: 1, lingote_celestial: 20, escamas_dragon: 10, polvo_estelar: 12, gema_alma: 5 }, xp: 315 },
    { id: 'r_casco_omega', out: 'casco_omega', qty: 1, station: 'yunque_runico', in: { casco_solar: 1, lingote_omega: 5, singularidad: 1, malaquita_pradera: 8, esquirla_hielo: 8 }, xp: 600, reqOmega: 'omega_equipo' },
    { id: 'r_arm_omega', out: 'armadura_omega', qty: 1, station: 'yunque_runico', in: { armadura_celestial: 1, lingote_omega: 8, singularidad: 2, esencia_magma: 10, esencia_oscura: 10, arena_estelar: 10 }, xp: 850, reqOmega: 'omega_equipo' },
    { id: 'r_pantalones_omega', out: 'pantalones_omega', qty: 1, station: 'yunque_runico', in: { pantalones_acero: 1, lingote_omega: 6, singularidad: 1, arena_estelar: 8, esquirla_hielo: 8 }, xp: 640, reqOmega: 'omega_equipo' },
    { id: 'r_escudo_omega', out: 'escudo_omega', qty: 1, station: 'yunque_runico', in: { escudo_celestial: 1, lingote_omega: 6, singularidad: 1, esencia_magma: 8, malaquita_pradera: 8 }, xp: 680, reqOmega: 'omega_equipo' },
    { id: 'r_botas_omega', out: 'botas_omega', qty: 1, station: 'yunque_runico', in: { botas_celestiales: 1, lingote_omega: 5, singularidad: 1, esencia_oscura: 8, arena_estelar: 8 }, xp: 620, reqOmega: 'omega_equipo' },
    { id: 'r_hoja_singularidad', out: 'hoja_singularidad', qty: 1, station: 'yunque_runico', in: { lingote_omega: 8, singularidad: 2, materia_comprimida: 4, esencia_magma: 10, esencia_oscura: 10 }, xp: 900, reqOmega: 'omega_equipo' },
    { id: 'r_arco_omega', out: 'arco_omega', qty: 1, station: 'yunque_runico', in: { lingote_omega: 7, singularidad: 2, materia_comprimida: 4, arena_estelar: 10, esquirla_hielo: 10 }, xp: 880, reqOmega: 'omega_equipo' },
    { id: 'r_cetro_omega', out: 'cetro_omega', qty: 1, station: 'yunque_runico', in: { lingote_omega: 7, singularidad: 2, materia_comprimida: 4, malaquita_pradera: 10, cristales_magicos: 15 }, xp: 890, reqOmega: 'omega_equipo' },
    { id: 'r_casco_hierro', out: 'casco_hierro', qty: 1, station: 'forja', in: { casco_cobre: 1, lingote_hierro: 4, cuero: 2 }, xp: 30 },
    { id: 'r_casco_oro', out: 'casco_oro', qty: 1, station: 'forja', in: { casco_plata: 1, lingote_oro: 4, topacio: 1 }, xp: 54 },
    { id: 'r_casco_platino', out: 'casco_platino', qty: 1, station: 'forja', in: { casco_oro: 1, lingote_platino: 4, cuero: 2 }, xp: 72 },
    { id: 'r_casco_cristal', out: 'casco_cristal', qty: 1, station: 'forja', in: { casco_acero: 1, zafiro: 2, cristales_magicos: 3 }, xp: 94 },
    { id: 'r_casco_mitrilo', out: 'casco_mitrilo', qty: 1, station: 'forja', in: { casco_cristal: 1, lingotes_especiales: 4, amatista: 2 }, xp: 134 },
    { id: 'r_casco_balaclava', out: 'casco_balaclava', qty: 1, station: 'forja', in: { casco_oricalco: 1, escamas_dragon: 10, polvo_estelar: 10, lingote_adamantita: 12 }, xp: 190 },
    { id: 'r_escudo_madera', out: 'escudo_madera', qty: 1, station: 'mesa_artesania', in: { tablon: 4, hierro: 2 }, xp: 16 },
    { id: 'r_escudo_hierro', out: 'escudo_hierro', qty: 1, station: 'forja', in: { escudo_cobre: 1, lingote_hierro: 5, tablon: 2 }, xp: 36 },
    { id: 'r_escudo_oro', out: 'escudo_oro', qty: 1, station: 'forja', in: { escudo_plata: 1, lingote_oro: 5, lingote_acero: 2 }, xp: 64 },
    { id: 'r_escudo_platino', out: 'escudo_platino', qty: 1, station: 'forja', in: { escudo_oro: 1, lingote_platino: 5, lingote_acero: 2 }, xp: 84 },
    { id: 'r_escudo_cristal', out: 'escudo_cristal', qty: 1, station: 'forja', in: { escudo_acero: 1, zafiro: 2, diamantes: 2 }, xp: 136 },
    { id: 'r_escudo_mitrilo', out: 'escudo_mitrilo', qty: 1, station: 'forja', in: { escudo_cristal: 1, lingotes_especiales: 5, escama_obsidiana: 2 }, xp: 168 },
    { id: 'r_botas_hierro', out: 'botas_hierro', qty: 1, station: 'forja', in: { botas_cobre: 1, lingote_hierro: 4, cuero: 2 }, xp: 40 },
    { id: 'r_botas_platino', out: 'botas_platino', qty: 1, station: 'forja', in: { botas_oro: 1, lingote_platino: 4, cuero: 2 }, xp: 70 },
    { id: 'r_botas_mitrilo', out: 'botas_mitrilo', qty: 1, station: 'forja', in: { botas_cristal: 1, lingotes_especiales: 4, polvo_estelar: 2 }, xp: 120 },
    { id: 'r_botas_viento', out: 'botas_viento', qty: 1, station: 'forja', in: { botas_oricalco: 1, seda_arana: 4, polvo_estelar: 3 }, xp: 165 },
    { id: 'r_anillo', out: 'anillo_mercader', qty: 1, station: 'forja', in: { lingote_oro: 4, esmeraldas: 1 }, xp: 45 },
    { id: 'r_anillo_platino', out: 'anillo_platino', qty: 1, station: 'forja', in: { lingote_platino: 3, jade: 2 }, xp: 68 },
    { id: 'r_anillo_vamp', out: 'anillo_vampiro', qty: 1, station: 'forja', in: { lingote_plata: 4, rubi: 2 }, xp: 75 },
    { id: 'r_anillo_mitrilo', out: 'anillo_mitrilo', qty: 1, station: 'forja', in: { lingotes_especiales: 3, sanguinaria: 2 }, xp: 115 },
    { id: 'r_amuleto_vida', out: 'amuleto_vida', qty: 1, station: 'forja', in: { lingote_plata: 4, esmeraldas: 2, miel: 2 }, xp: 78 },
    { id: 'r_amuleto_estelar', out: 'amuleto_estelar', qty: 1, station: 'investigacion', in: { lingote_celestial: 2, polvo_estelar: 3, gema_marina: 2 }, xp: 155 },

    // === TALLER MECÁNICO & LABORATORIO & INVESTIGACIÓN ===
    { id: 'r_engrane_taller', out: 'engrane', qty: 2, station: 'taller', in: { lingote_cobre: 2, lingote_hierro: 1 }, xp: 14 },
    { id: 'r_tuberias_conduit', out: 'tuberias_conduit', qty: 4, station: 'taller', in: { lingote_cobre: 3, lingote_hierro: 2 }, xp: 20 },
    { id: 'r_cofre_logistico', out: 'cofre_logistico', qty: 1, station: 'taller', in: { tablon: 10, lingote_hierro: 6, engrane: 3 }, xp: 35 },
    { id: 'r_polvora', out: 'polvora', qty: 3, station: 'taller', in: { azufre: 1, salitre: 1, carbon: 1 }, xp: 14 },
    { id: 'r_dinamita_tnt', out: 'dinamita_tnt', qty: 2, station: 'mano', in: { carbon: 3, fibra_vegetal: 2, madera: 2 }, xp: 18 },
    { id: 'r_bomba_mina', out: 'bomba_mina', qty: 2, station: 'taller', in: { polvora: 2, hierro: 2 }, xp: 20 },
    { id: 'r_varita_arcana', out: 'varita_arcana', qty: 1, station: 'investigacion', reqSkill: 'pro_36', in: { lingote_titanio: 8, cristales_magicos: 10, esencia_oscura: 8, polvo_estelar: 6, runa_luz: 2 }, xp: 165 },
    { id: 'r_amuleto', out: 'amuleto_imantado', qty: 1, station: 'laboratorio', in: { cristales_magicos: 4, lingote_acero: 3, engrane: 2 }, xp: 70 },
    { id: 'r_cristal_mag', out: 'cristales_magicos', qty: 2, station: 'laboratorio', in: { cristales: 3, hongo_luminoso: 3, esencia_oscura: 1 }, xp: 34 },
    { id: 'r_polvo_estelar', out: 'polvo_estelar', qty: 1, station: 'investigacion', in: { cristales_magicos: 3, amatista: 1, esencia_oscura: 2 }, xp: 65 },
    { id: 'r_perg_furia', out: 'pergamino_furia', qty: 1, station: 'investigacion', in: { tela: 2, tinta_arcana: 0, rubi: 1, cera_abeja: 2 }, xp: 48 },
    { id: 'r_perg_escudo', out: 'pergamino_escudo', qty: 1, station: 'investigacion', in: { tela: 2, zafiro: 1, cera_abeja: 2 }, xp: 48 },
    { id: 'r_nucleo', out: 'nucleo_balaclava', qty: 1, station: 'investigacion', in: { fragmentos_antiguos: 5, diamantes: 5, esmeraldas: 5, lingotes_especiales: 5, esencia_oscura: 5 }, xp: 500 },

    // === COCINA GOURMET (10 RECETAS) ===
    { id: 'r_pan', out: 'pan', qty: 2, station: 'cocina', in: { harina: 2 }, xp: 8 },
    { id: 'r_baguette', out: 'baguette', qty: 2, station: 'cocina', in: { harina: 2, maiz: 2 }, xp: 12 },
    { id: 'r_filete', out: 'filete', qty: 1, station: 'cocina', in: { carne: 1, carbon: 1 }, xp: 10 },
    { id: 'r_queso', out: 'queso', qty: 2, station: 'cocina', in: { miel: 1, maiz: 2, hierba: 2 }, xp: 15 },
    { id: 'r_estofado', out: 'estofado_bayas', qty: 1, station: 'cocina', in: { zanahoria: 2, carne: 1, bayas: 3 }, xp: 18 },
    { id: 'r_sushi', out: 'sushi', qty: 2, station: 'cocina', in: { pez_azul: 1, tomate: 2, hierba: 2 }, xp: 24 },
    { id: 'r_pastel_miel', out: 'pastel_miel', qty: 1, station: 'cocina', in: { harina: 2, miel: 2, fresa: 2 }, xp: 32 },
    { id: 'r_cafe', out: 'cafe_energizante', qty: 1, station: 'cocina', in: { miel: 1, chile: 1, hongo_luminoso: 1 }, xp: 28 },
    { id: 'r_manzana_dorada', out: 'manzana_dorada', qty: 1, station: 'cocina', in: { oro: 4, fresa: 2, uva: 2, miel: 2 }, xp: 68 },
    { id: 'r_pan_maiz', out: 'pan_maiz', qty: 2, station: 'cocina', in: { harina: 1, maiz: 2, miel: 1 }, xp: 14 },
    { id: 'r_trucha_asada', out: 'trucha_asada', qty: 1, station: 'cocina', in: { trucha_arcoiris: 1, hierba: 2, carbon: 1 }, xp: 24 },
    { id: 'r_sopa_pescado', out: 'sopa_pescado', qty: 2, station: 'cocina', in: { anchoa: 2, tomate: 1, zanahoria: 1 }, xp: 20 },
    { id: 'r_cangrejo_asado', out: 'cangrejo_asado', qty: 1, station: 'cocina', in: { cangrejo_dungeness: 1, queso: 1, chile: 1 }, xp: 34 },
    { id: 'r_sashimi_glacial', out: 'sashimi_glacial', qty: 1, station: 'cocina', in: { esturion_glacial: 1, esquirla_hielo: 2, tomate: 2 }, xp: 60 },
    { id: 'r_estofado_marino_supremo', out: 'estofado_marino_supremo', qty: 1, station: 'cocina', in: { pez_legendario_kraken: 1, pez_dorado_solar: 1, papa: 2, queso: 2 }, xp: 120 },
    { id: 'r_brocheta_magma', out: 'brocheta_magma', qty: 2, station: 'cocina', in: { pez_fenix_magma: 1, chile: 2, carbon: 1 }, xp: 55 },
    { id: 'r_ensalada_fresca', out: 'ensalada_fresca', qty: 2, station: 'cocina', in: { tomate: 2, zanahoria: 2, maiz: 1 }, xp: 14 },
    { id: 'r_tarta_fresa', out: 'tarta_fresa', qty: 1, station: 'cocina', in: { harina: 2, fresa: 3, miel: 1 }, xp: 38 },
    { id: 'r_jugo_uva', out: 'jugo_uva', qty: 2, station: 'cocina', in: { uva: 3, miel: 1, vidrio: 1 }, xp: 22 },
    { id: 'r_taco_picante', out: 'taco_picante', qty: 2, station: 'cocina', in: { maiz: 2, carne: 1, chile: 2 }, xp: 26 },
    { id: 'r_patatas_asadas', out: 'patatas_asadas', qty: 2, station: 'cocina', in: { papa: 2, hierba: 2, carbon: 1 }, xp: 18 },
    { id: 'r_tortilla_patata', out: 'tortilla_patata', qty: 1, station: 'cocina', in: { papa: 2, tomate: 2, queso: 1 }, xp: 28 },
    { id: 'r_banquete_real', out: 'banquete_real', qty: 1, station: 'cocina', in: { filete: 2, pastel_miel: 1, manzana_dorada: 1 }, xp: 95 },

    // === ALQUIMIA & TALLER EXPLOSIVOS & INVESTIGACIÓN ===
    { id: 'r_tinta_arcana', out: 'tinta_arcana', qty: 2, station: 'alquimia', in: { hongo_luminoso: 2, carbon: 2, vidrio: 1 }, xp: 18 },
    { id: 'r_pocion_vida', out: 'pocion_vida', qty: 1, station: 'alquimia', in: { vidrio: 1, bayas: 4, hongo_luminoso: 2 }, xp: 20 },
    { id: 'r_pocion_vel', out: 'pocion_velocidad', qty: 1, station: 'alquimia', in: { vidrio: 1, cactus: 2, cristales: 1 }, xp: 24 },
    { id: 'r_pocion_suerte', out: 'pocion_suerte', qty: 1, station: 'alquimia', in: { vidrio: 1, esmeraldas: 1, flor_cristal: 1 }, xp: 35 },
    { id: 'r_pocion_fuerza', out: 'pocion_fuerza', qty: 1, station: 'alquimia', in: { vidrio: 1, chile: 2, colmillo: 2, cristales: 1 }, xp: 38 },
    { id: 'r_elixir_titan', out: 'elixir_titan', qty: 1, station: 'alquimia', in: { vidrio: 1, sanguinaria: 1, colmillo: 3 }, xp: 62 },
    { id: 'r_elixir_arcano', out: 'elixir_arcano', qty: 1, station: 'alquimia', in: { vidrio: 1, amatista: 1, polvo_estelar: 1 }, xp: 58 },
    { id: 'r_pocion_nocturna', out: 'pocion_nocturna', qty: 1, station: 'alquimia', in: { vidrio: 1, hongo_luminoso: 2, coral_brillante: 1 }, xp: 32 },
    { id: 'r_pocion_cosecha', out: 'pocion_cosecha', qty: 1, station: 'alquimia', in: { vidrio: 1, jade: 1, miel: 2, hierba: 3 }, xp: 30 },
    { id: 'r_fert_alq', out: 'fertilizante', qty: 5, station: 'alquimia', in: { salitre: 2, hierba: 4, tomate: 1 }, xp: 14 },
    { id: 'r_abono_dorado', out: 'abono_dorado', qty: 3, station: 'mano', in: { fertilizante: 2, algas: 2, miel: 1 }, xp: 18 },
    { id: 'r_abono_dorado_alq', out: 'abono_dorado', qty: 5, station: 'alquimia', in: { fertilizante: 2, algas: 2, miel: 1 }, xp: 20 },
    { id: 'r_compost_magico', out: 'compost_magico', qty: 3, station: 'alquimia', in: { abono_dorado: 2, cristales_magicos: 1, polvo_estelar: 1 }, xp: 36 },
    { id: 'r_bomba_escarcha', out: 'bomba_escarcha', qty: 2, station: 'taller', in: { polvora: 2, esquirla_hielo: 2 }, xp: 34 },
    { id: 'r_bomba_solar', out: 'bomba_solar', qty: 2, station: 'investigacion', in: { polvora: 3, nucleo_solar: 1, lingote_oro: 1 }, xp: 58 },
    { id: 'r_cetro_vacio', out: 'cetro_vacio', qty: 1, station: 'investigacion', reqSkill: 'com_66', in: { varita_arcana: 1, lingote_oricalco: 8, diamantes: 8, esencia_oscura: 12, polvo_estelar: 8, cristal_abismal: 4 }, xp: 240 },
    { id: 'r_perg_rayo', out: 'pergamino_rayo', qty: 1, station: 'investigacion', in: { tinta_arcana: 1, zafiro: 1, tela: 2 }, xp: 54 },
    { id: 'r_perg_fortuna', out: 'pergamino_fortuna', qty: 1, station: 'investigacion', in: { tinta_arcana: 1, esmeraldas: 1, tela: 2 }, xp: 50 },

    // === BLOQUES Y ARQUITECTURA DE ALDEA ===
    { id: 'r_blk_muro_piedra', out: 'bloque_muro_piedra', qty: 4, station: 'mano', in: { piedra: 6 }, xp: 8 },
    { id: 'r_blk_muro_madera', out: 'bloque_muro_madera', qty: 4, station: 'mano', in: { madera: 6 }, xp: 6 },
    { id: 'r_blk_valla', out: 'bloque_valla', qty: 4, station: 'mano', in: { madera: 4, tablon: 2 }, xp: 6 },
    { id: 'r_blk_camino', out: 'bloque_camino_piedra', qty: 6, station: 'mano', in: { piedra: 6, arena: 2 }, xp: 7 },
    { id: 'r_blk_banco', out: 'bloque_banco', qty: 1, station: 'mano', in: { madera: 4, tablon: 2 }, xp: 8 },
    { id: 'r_blk_barril', out: 'bloque_barril', qty: 1, station: 'mesa_artesania', in: { madera: 6, tablon: 4, hierro: 3 }, xp: 16 },
    { id: 'r_blk_farola', out: 'bloque_farola', qty: 2, station: 'mesa_artesania', in: { lingote_hierro: 2, cera_abeja: 2, vidrio: 1 }, xp: 18 },
    { id: 'r_blk_brasero', out: 'bloque_brasero', qty: 1, station: 'mesa_artesania', in: { ladrillo: 4, carbon: 4, lingote_hierro: 2 }, xp: 28 },
    { id: 'r_blk_estanteria', out: 'bloque_estanteria', qty: 1, station: 'investigacion', in: { tablon: 6, cristales: 2, amatista: 1 }, xp: 32 },
    { id: 'r_blk_banquete', out: 'bloque_mesa_banquete', qty: 1, station: 'cocina', in: { tablon: 8, tela: 4, pastel_miel: 1 }, xp: 38 },
    { id: 'r_blk_estatua', out: 'bloque_estatua_caballero', qty: 1, station: 'taller', in: { piedra: 12, lingote_plata: 2, cristales: 2 }, xp: 45 },
    { id: 'r_blk_monolito', out: 'bloque_pilar_runico', qty: 1, station: 'investigacion', in: { piedra: 10, cristales: 3, amatista: 1 }, xp: 48 },
    { id: 'r_blk_fuente', out: 'bloque_fuente', qty: 1, station: 'taller', in: { ladrillo: 8, piedra: 10, perla: 1 }, xp: 52 },

    // === RUNAS ELEMENTALES, OBSIDIANA Y GEMA DEL ALMA ===
    { id: 'r_obsidiana_ref', out: 'obsidiana_refinada', qty: 1, station: 'horno', in: { obsidiana_bruta: 2, material_volcanico: 2, carbon: 3 }, xp: 46 },
    { id: 'r_gema_alma', out: 'gema_alma', qty: 1, station: 'investigacion', in: { diamantes: 2, amatista: 2, ectoplasma: 3, polvo_estelar: 1 }, xp: 92 },
    { id: 'r_runa_fuego', out: 'runa_fuego', qty: 1, station: 'investigacion', in: { rubi: 1, piedra: 4, material_volcanico: 2, tinta_arcana: 1 }, xp: 42 },
    { id: 'r_runa_agua', out: 'runa_agua', qty: 1, station: 'investigacion', in: { zafiro: 1, piedra: 4, coral_brillante: 1, tinta_arcana: 1 }, xp: 40 },
    { id: 'r_runa_tierra', out: 'runa_tierra', qty: 1, station: 'investigacion', in: { jade: 1, piedra: 6, arcilla: 4, tinta_arcana: 1 }, xp: 38 },
    { id: 'r_runa_aire', out: 'runa_aire', qty: 1, station: 'investigacion', in: { topacio: 1, piedra: 4, pluma_oscura: 2, tinta_arcana: 1 }, xp: 40 },
    { id: 'r_runa_vida', out: 'runa_vida', qty: 1, station: 'alquimia', in: { esmeraldas: 1, flor_cristal: 1, esporas_toxicas: 2, miel: 2 }, xp: 46 },
    { id: 'r_runa_oscura', out: 'runa_oscura', qty: 1, station: 'investigacion', in: { onice: 1, esencia_oscura: 3, huesos: 4, tinta_arcana: 1 }, xp: 52 },
    { id: 'r_runa_luz', out: 'runa_luz', qty: 1, station: 'investigacion', in: { diamantes: 1, nucleo_solar: 2, polvo_estelar: 1 }, xp: 75 },
    { id: 'r_runa_muerte', out: 'runa_muerte', qty: 1, station: 'investigacion', in: { craneo_maldito: 1, runa_oscura: 1, gema_alma: 1 }, xp: 88 },

    // === EQUIPO DE ADAMANTITA, SOLAR, CAPAS, JOYERÍA Y BÁCULOS (PROGRESIÓN CON TIER ANTERIOR) ===
    { id: 'r_arm_adam', out: 'armadura_adamantita', qty: 1, station: 'forja', in: { armadura_titanio: 1, lingote_adamantita: 20, escama_obsidiana: 10, runa_tierra: 6 }, xp: 145 },
    { id: 'r_casco_adam', out: 'casco_adamantita', qty: 1, station: 'forja', in: { casco_titanio: 1, lingote_adamantita: 16, diamantes: 8 }, xp: 120 },
    { id: 'r_escudo_adam', out: 'escudo_adamantita', qty: 1, station: 'forja', in: { escudo_titanio: 1, lingote_adamantita: 16, obsidiana_refinada: 6 }, xp: 125 },
    { id: 'r_botas_adam', out: 'botas_adamantita', qty: 1, station: 'forja', in: { botas_titanio: 1, lingote_adamantita: 16, cuero: 12 }, xp: 110 },
    { id: 'r_casco_solar', out: 'casco_solar', qty: 1, station: 'investigacion', in: { casco_balaclava: 1, lingote_celestial: 16, runa_luz: 6, topacio: 8 }, xp: 220 },
    { id: 'r_escudo_solar', out: 'escudo_solar', qty: 1, station: 'investigacion', in: { escudo_oricalco: 1, lingote_celestial: 18, runa_luz: 6, obsidiana_refinada: 12 }, xp: 235 },
    { id: 'r_botas_solar', out: 'botas_solar', qty: 1, station: 'investigacion', in: { botas_oricalco: 1, lingote_celestial: 16, runa_aire: 6, seda_arana: 12 }, xp: 210 },
    { id: 'r_sombrero_mago', out: 'sombrero_mago', qty: 1, station: 'investigacion', in: { tela: 6, amatista: 2, tinta_arcana: 2, runa_aire: 1 }, xp: 88 },
    { id: 'r_capa_sombras', out: 'capa_sombras', qty: 1, station: 'taller', in: { tela: 6, seda_arana: 4, esencia_oscura: 3, garra_sombras: 2 }, xp: 96 },
    { id: 'r_capa_fenix', out: 'capa_fenix', qty: 1, station: 'investigacion', in: { tela: 8, pluma_fenix: 2, runa_fuego: 2, lingote_celestial: 2 }, xp: 175 },
    { id: 'r_anillo_amatista', out: 'anillo_amatista', qty: 1, station: 'forja', in: { lingote_plata: 3, amatista: 2 }, xp: 64 },
    { id: 'r_anillo_alma', out: 'anillo_alma', qty: 1, station: 'investigacion', in: { lingote_celestial: 2, gema_alma: 1, rubi: 2 }, xp: 155 },
    { id: 'r_amuleto_onice', out: 'amuleto_onice', qty: 1, station: 'forja', in: { lingote_acero: 3, onice: 2, runa_oscura: 1 }, xp: 90 },
    { id: 'r_amuleto_diamante', out: 'amuleto_diamante', qty: 1, station: 'investigacion', in: { lingote_celestial: 2, diamantes: 3, runa_luz: 1 }, xp: 165 },
    { id: 'r_baculo_dorado', out: 'baculo_dorado', qty: 1, station: 'investigacion', reqSkill: 'exp_33', in: { lingote_adamantita: 8, topacio: 8, nucleo_solar: 4, polvo_estelar: 6, runa_fuego: 2 }, xp: 215 },
    { id: 'r_baculo_estelar', out: 'baculo_estelar', qty: 1, station: 'investigacion', reqSkill: 'com_66', in: { cetro_vacio: 1, gema_alma: 6, runa_luz: 6, lingote_celestial: 10, prisma_imperial: 5, fragmentos_antiguos: 6 }, xp: 340 },
    { id: 'r_bomba_abismal', out: 'bomba_abismal', qty: 2, station: 'investigacion', in: { polvora: 4, runa_oscura: 1, esencia_oscura: 3 }, xp: 85 },

    // === PERGAMINOS, ELIXIRES Y NUEVA COCINA GOURMET ===
    { id: 'r_perg_curacion', out: 'pergamino_curacion', qty: 1, station: 'investigacion', in: { tela: 2, tinta_arcana: 1, runa_vida: 1 }, xp: 44 },
    { id: 'r_perg_fuego', out: 'pergamino_fuego', qty: 1, station: 'investigacion', in: { tela: 2, tinta_arcana: 1, runa_fuego: 1 }, xp: 56 },
    { id: 'r_perg_hielo', out: 'pergamino_hielo', qty: 1, station: 'investigacion', in: { tela: 2, tinta_arcana: 1, esquirla_hielo: 2 }, xp: 54 },
    { id: 'r_perg_tele', out: 'pergamino_teletransporte', qty: 2, station: 'investigacion', in: { tela: 2, cristales: 2, polvo_estelar: 1 }, xp: 40 },
    { id: 'r_elixir_supremo', out: 'elixir_supremo', qty: 1, station: 'alquimia', in: { vidrio: 1, manzana_dorada: 1, polvo_estelar: 1, runa_vida: 1 }, xp: 110 },
    { id: 'r_elixir_fuego', out: 'elixir_fuego', qty: 1, station: 'alquimia', in: { vidrio: 1, chile: 3, rubi: 1 }, xp: 42 },
    { id: 'r_elixir_escarcha', out: 'elixir_escarcha', qty: 1, station: 'alquimia', in: { vidrio: 1, esquirla_hielo: 2, gel_azul: 2 }, xp: 40 },
    { id: 'r_muslo_asado', out: 'muslo_asado', qty: 1, station: 'cocina', in: { carne: 1, hierba: 2, carbon: 1 }, xp: 18 },
    { id: 'r_pescado_brasa', out: 'pescado_brasa', qty: 1, station: 'cocina', in: { pez_dorado: 1, hierba: 2, carbon: 1 }, xp: 30 },

    // === LLAVE LEGENDARIA, GEODAS STEWV Y EQUIPO HERÁLDICO ===
    { id: 'r_llave_legendaria', out: 'llave_legendaria', qty: 1, station: 'forja', in: { lingote_oro: 4, diamantes: 1, rubi: 1, cristales: 2 }, xp: 95 },
    { id: 'r_prisma_imperial', out: 'prisma_imperial', qty: 1, station: 'investigacion', in: { diamantes: 1, rubi: 1, esmeraldas: 1, zafiro: 1, amatista: 1 }, xp: 120 },
    { id: 'r_espada_llamarada', out: 'espada_llamarada', qty: 1, station: 'yunque_runico', reqSkill: 'com_30', in: { lingotes_especiales: 8, lingote_titanio: 7, runa_fuego: 4, esencia_magma: 6, rubi: 6 }, xp: 185 },
    { id: 'r_hoja_glacial', out: 'hoja_glacial', qty: 1, station: 'yunque_runico', reqSkill: 'com_30', in: { lingote_titanio: 8, azurita_glacial: 6, esquirla_hielo: 12, zafiro: 6, runa_agua: 2 }, xp: 180 },
    { id: 'r_hoja_espinas', out: 'hoja_espinas', qty: 1, station: 'yunque_runico', reqSkill: 'com_24', in: { lingote_acero: 8, lingotes_especiales: 6, jade: 6, runa_vida: 4, esporas_toxicas: 8 }, xp: 165 },
    { id: 'r_katana_sakura', out: 'katana_sakura', qty: 1, station: 'yunque_runico', reqSkill: 'com_30', in: { lingotes_especiales: 8, lingote_titanio: 7, seda_arana: 10, rubi: 5, flor_cristal: 5 }, xp: 190 },
    { id: 'r_cetro_prism_vacio', out: 'cetro_prism_vacio', qty: 1, station: 'investigacion', reqSkill: 'com_36', in: { geoda_amatista: 6, runa_oscura: 4, lingote_adamantita: 8, esencia_oscura: 10, polvo_estelar: 6 }, xp: 235 },
    { id: 'r_media_luna_abisal', out: 'media_luna_abisal', qty: 1, station: 'investigacion', reqSkill: 'com_54', in: { obsidiana_refinada: 8, runa_oscura: 5, lingote_oricalco: 8, gema_alma: 4, cristal_abismal: 5 }, xp: 295 },
    { id: 'r_espada_solar_mitica', out: 'espada_solar_mitica', qty: 1, station: 'investigacion', reqSkill: 'com_54', in: { lingote_celestial: 10, runa_luz: 5, pluma_fenix: 4, prisma_imperial: 4, gema_alma: 3 }, xp: 340 },
    { id: 'r_espada_prismatica', out: 'espada_prismatica', qty: 1, station: 'investigacion', reqSkill: 'com_66', in: { prisma_imperial: 6, lingote_celestial: 10, polvo_estelar: 8, gema_alma: 5, fragmentos_antiguos: 5 }, xp: 360 },
    { id: 'r_escudo_esmeralda', out: 'escudo_esmeralda', qty: 1, station: 'forja', in: { lingote_hierro: 4, esmeraldas: 2, madera: 6 }, xp: 80 },
    { id: 'r_escudo_fenix', out: 'escudo_fenix', qty: 1, station: 'forja', in: { lingote_oro: 5, pluma_fenix: 1, rubi: 2 }, xp: 125 },
    { id: 'r_escudo_glacial', out: 'escudo_glacial', qty: 1, station: 'forja', in: { lingote_platino: 4, zafiro: 2, esquirla_hielo: 3 }, xp: 120 },
    { id: 'r_escudo_leon', out: 'escudo_leon', qty: 1, station: 'investigacion', in: { lingote_celestial: 3, lingote_oro: 5, topacio: 2 }, xp: 190 },
    { id: 'r_escudo_abismal', out: 'escudo_abismal', qty: 1, station: 'investigacion', in: { obsidiana_refinada: 3, craneo_maldito: 2, runa_muerte: 1 }, xp: 195 },
    { id: 'r_corona_soberana', out: 'corona_soberana', qty: 1, station: 'investigacion', in: { lingote_oro: 6, prisma_imperial: 1, diamantes: 2 }, xp: 210 },
    { id: 'r_anillo_astral', out: 'anillo_astral', qty: 1, station: 'forja', in: { lingote_platino: 3, zafiro: 3, polvo_estelar: 1 }, xp: 165 },
    { id: 'r_amuleto_escarcha', out: 'amuleto_escarcha', qty: 1, station: 'forja', in: { lingote_plata: 3, esquirla_hielo: 3, zafiro: 1 }, xp: 92 },
    { id: 'r_colgante_fenix', out: 'colgante_fenix', qty: 1, station: 'investigacion', in: { lingote_oro: 4, pluma_fenix: 2, runa_fuego: 1 }, xp: 185 },

    // === COCINA GOURMET Y BEBIDAS DE PUEBLO ===
    { id: 'r_pastel_chocolate', out: 'pastel_chocolate', qty: 1, station: 'cocina', in: { harina: 2, huevo: 2, leche: 1, miel: 1 }, xp: 34 },
    { id: 'r_pastel_fresa', out: 'pastel_fresa', qty: 1, station: 'cocina', in: { harina: 2, huevo: 1, leche: 1, fresa: 3 }, xp: 32 },
    { id: 'r_cheesecake_real', out: 'cheesecake_real', qty: 1, station: 'cocina', in: { queso: 2, harina: 1, miel: 2, huevo: 1 }, xp: 30 },
    { id: 'r_boba_matcha', out: 'boba_matcha', qty: 1, station: 'cocina', in: { leche: 1, hierba: 3, miel: 1 }, xp: 36 },
    { id: 'r_boba_mango', out: 'boba_mango', qty: 1, station: 'cocina', in: { leche: 1, bayas: 3, miel: 1 }, xp: 28 },
    { id: 'r_boba_taro', out: 'boba_taro', qty: 1, station: 'cocina', in: { leche: 1, hongo_luminoso: 2, miel: 2 }, xp: 38 },
    { id: 'r_cafe_espresso', out: 'cafe_espresso', qty: 2, station: 'cocina', in: { hierba: 2, carbon: 1, miel: 1 }, xp: 22 },
    { id: 'r_manzana_helada', out: 'manzana_helada', qty: 1, station: 'cocina', in: { manzana_roja: 1, esquirla_hielo: 2, miel: 1 }, xp: 45 },
    { id: 'r_waffle_dorado', out: 'waffle_dorado', qty: 2, station: 'cocina', in: { harina: 2, huevo: 2, miel: 1 }, xp: 24 },
    { id: 'r_sandwich_maestro', out: 'sandwich_maestro', qty: 1, station: 'cocina', in: { pan: 1, carne: 1, tomate: 1, queso: 1 }, xp: 28 },

    // === BIOME MINERALS, TITANIO & ORICALCO ===
    { id: 'r_ingote_titanio', out: 'lingote_titanio', qty: 1, station: 'horno', in: { titanio: 2, carbon: 2, azurita_glacial: 1 }, xp: 58 },
    { id: 'r_ingote_oricalco', out: 'lingote_oricalco', qty: 1, station: 'forja', in: { oricalco: 2, esencia_magma: 1, carbon_eterno: 1 }, xp: 84 },
    { id: 'r_vidrio_estelar', out: 'vidrio', qty: 2, station: 'horno', in: { arena_estelar: 2, carbon: 1 }, xp: 14 },

    // === TERRAFORMING & VILLAGE DECORATION BLOCKS ===
    { id: 'r_blk_suelo_hierba', out: 'suelo_hierba', qty: 2, station: 'mano', in: { piedra: 2, hierba: 2, fibra_vegetal: 2 }, xp: 6 },
    { id: 'r_blk_camino_hierba', out: 'bloque_camino_hierba', qty: 4, station: 'mano', in: { piedra: 3, hierba: 4 }, xp: 7 },
    { id: 'r_blk_maceta_flores', out: 'bloque_maceta_flores', qty: 2, station: 'mano', in: { madera: 4, hierba: 3 }, xp: 8 },
    { id: 'r_blk_puesto_mercado', out: 'bloque_puesto_mercado', qty: 1, station: 'mesa_artesania', in: { tablon: 6, tela: 4, madera: 4 }, xp: 22 },
    { id: 'r_blk_cabana_aldeano', out: 'bloque_cabana_aldeano', qty: 1, station: 'taller', in: { tablon: 10, ladrillo: 6, piedra: 8 }, xp: 40 },

    // === 15 TIERS COMPLETOS DE ARMADURAS, YELMOS, ESCUDOS Y BOTAS (CON REQUISITO DE TIER ANTERIOR) ===
    { id: 'r_casco_bronce', out: 'casco_bronce', qty: 1, station: 'forja', in: { casco_cuero: 1, lingote_bronce: 4, cuero: 2 }, xp: 24 },
    { id: 'r_arm_bronce', out: 'armadura_bronce', qty: 1, station: 'forja', in: { armadura_cuero: 1, lingote_bronce: 6, cuero: 3 }, xp: 30 },
    { id: 'r_esc_bronce', out: 'escudo_bronce', qty: 1, station: 'forja', in: { escudo_madera: 1, lingote_bronce: 4, tablon: 2 }, xp: 22 },
    { id: 'r_bot_bronce', out: 'botas_bronce', qty: 1, station: 'forja', in: { botas_cuero: 1, lingote_bronce: 3, cuero: 2 }, xp: 20 },

    { id: 'r_casco_cobre', out: 'casco_cobre', qty: 1, station: 'forja', in: { casco_bronce: 1, lingote_cobre: 5, cuero: 2 }, xp: 28 },
    { id: 'r_arm_cobre', out: 'armadura_cobre', qty: 1, station: 'forja', in: { armadura_bronce: 1, lingote_cobre: 8, cuero: 4 }, xp: 36 },
    { id: 'r_esc_cobre', out: 'escudo_cobre', qty: 1, station: 'forja', in: { escudo_bronce: 1, lingote_cobre: 5, tablon: 3 }, xp: 26 },
    { id: 'r_bot_cobre', out: 'botas_cobre', qty: 1, station: 'forja', in: { botas_bronce: 1, lingote_cobre: 4, cuero: 3 }, xp: 24 },

    { id: 'r_casco_plata', out: 'casco_plata', qty: 1, station: 'forja', in: { casco_hierro: 1, lingote_plata: 5, malaquita_pradera: 2 }, xp: 48 },
    { id: 'r_arm_plata', out: 'armadura_plata', qty: 1, station: 'forja', in: { armadura_hierro: 1, lingote_plata: 8, malaquita_pradera: 3, tela: 3 }, xp: 62 },
    { id: 'r_esc_plata', out: 'escudo_plata', qty: 1, station: 'forja', in: { escudo_hierro: 1, lingote_plata: 5, lingote_hierro: 3 }, xp: 46 },
    { id: 'r_bot_plata', out: 'botas_plata', qty: 1, station: 'forja', in: { botas_hierro: 1, lingote_plata: 4, cuero: 4 }, xp: 44 },

    { id: 'r_bot_oro', out: 'botas_oro', qty: 1, station: 'forja', in: { botas_plata: 1, lingote_oro: 5, cuero: 4 }, xp: 52 },

    { id: 'r_casco_acero', out: 'casco_acero', qty: 1, station: 'forja', in: { casco_platino: 1, lingote_acero: 6, azurita_glacial: 2 }, xp: 72 },
    { id: 'r_arm_acero', out: 'armadura_acero', qty: 1, station: 'forja', in: { armadura_platino: 1, lingote_acero: 9, azurita_glacial: 3, esquirla_hielo: 2 }, xp: 92 },
    { id: 'r_esc_acero', out: 'escudo_acero', qty: 1, station: 'forja', in: { escudo_platino: 1, lingote_acero: 6, zafiro: 1 }, xp: 70 },
    { id: 'r_bot_acero', out: 'botas_acero', qty: 1, station: 'forja', in: { botas_platino: 1, lingote_acero: 5, esquirla_hielo: 2 }, xp: 64 },

    { id: 'r_bot_cristal', out: 'botas_cristal', qty: 1, station: 'forja', in: { botas_acero: 1, cristales_magicos: 4, amatista: 2 }, xp: 76 },

    { id: 'r_casco_titanio', out: 'casco_titanio', qty: 1, station: 'forja', in: { casco_mitrilo: 1, lingote_titanio: 5, ambar_desierto: 2 }, xp: 105 },
    { id: 'r_arm_titanio', out: 'armadura_titanio', qty: 1, station: 'forja', in: { armadura_mitrilo: 1, lingote_titanio: 9, ambar_desierto: 3, arena_estelar: 4 }, xp: 135 },
    { id: 'r_esc_titanio', out: 'escudo_titanio', qty: 1, station: 'forja', in: { escudo_mitrilo: 1, lingote_titanio: 6, topacio: 2 }, xp: 98 },
    { id: 'r_bot_titanio', out: 'botas_titanio', qty: 1, station: 'forja', in: { botas_mitrilo: 1, lingote_titanio: 5, arena_estelar: 3 }, xp: 92 },

    { id: 'r_casco_oricalco', out: 'casco_oricalco', qty: 1, station: 'forja', in: { casco_adamantita: 1, lingote_oricalco: 5, esencia_magma: 2 }, xp: 145 },
    { id: 'r_arm_oricalco', out: 'armadura_oricalco', qty: 1, station: 'forja', in: { armadura_adamantita: 1, lingote_oricalco: 9, esencia_magma: 3, cristal_abismal: 2 }, xp: 185 },
    { id: 'r_esc_oricalco', out: 'escudo_oricalco', qty: 1, station: 'forja', in: { escudo_adamantita: 1, lingote_oricalco: 6, rubi: 2 }, xp: 140 },
    { id: 'r_bot_oricalco', out: 'botas_oricalco', qty: 1, station: 'forja', in: { botas_adamantita: 1, lingote_oricalco: 5, obsidiana_refinada: 2 }, xp: 128 },

    { id: 'r_esc_celestial', out: 'escudo_celestial', qty: 1, station: 'forja', in: { escudo_solar: 1, lingote_celestial: 6, gema_alma: 2, runa_luz: 2 }, xp: 210 },
    { id: 'r_bot_celestial', out: 'botas_celestiales', qty: 1, station: 'forja', in: { botas_viento: 1, lingote_celestial: 5, polvo_estelar: 3, runa_aire: 2 }, xp: 190 },

    // === NUEVAS RECETAS: FRUTAS, ELIXIRES, ARMAS Y DECORACIÓN ===
    { id: 'r_macedonia_real', out: 'macedonia_real', qty: 1, station: 'cocina', in: { pina: 1, naranja: 2, fresa: 2, miel: 1 }, xp: 40 },
    { id: 'r_batido_nebula', out: 'batido_nebula', qty: 1, station: 'alquimia', in: { pitaya: 1, arandano: 2, polvo_estelar: 1 }, xp: 65 },
    { id: 'r_caliz_nebulosa', out: 'caliz_nebulosa_obj', qty: 1, station: 'alquimia', in: { granada: 2, rubi: 1, esencia_magma: 1 }, xp: 95 },
    { id: 'r_elixir_vida_sup', out: 'elixir_vida_supremo', qty: 1, station: 'alquimia', in: { pocion_vida: 1, granada: 1, rubi: 1 }, xp: 55 },
    { id: 'r_elixir_mana_ast', out: 'elixir_mana_astral', qty: 1, station: 'alquimia', in: { pocion_velocidad: 1, arandano: 2, zafiro: 1 }, xp: 55 },
    { id: 'r_espada_relampago', out: 'espada_relampago', qty: 1, station: 'yunque_runico', reqSkill: 'com_24', in: { lingotes_especiales: 8, lingote_titanio: 6, zafiro: 6, cristales_magicos: 8, esencia_oscura: 4 }, xp: 205 },
    { id: 'r_espada_tormenta', out: 'espada_tormenta', qty: 1, station: 'investigacion', reqSkill: 'com_54', in: { espada_relampago: 1, lingote_oricalco: 8, lingote_adamantita: 8, polvo_estelar: 8, cristal_abismal: 5 }, xp: 305 },
    { id: 'r_martillo_paladin', out: 'martillo_paladin', qty: 1, station: 'yunque_runico', reqSkill: 'com_36', in: { lingote_adamantita: 8, lingote_titanio: 8, runa_luz: 3, topacio: 6, lingotes_especiales: 4 }, xp: 245 },
    { id: 'r_baculo_solaris', out: 'baculo_solaris', qty: 1, station: 'investigacion', reqSkill: 'com_66', in: { lingote_celestial: 9, cristal_abismal: 7, runa_luz: 5, polvo_estelar: 7, gema_alma: 3 }, xp: 335 },
    { id: 'r_anillo_rubi_real', out: 'anillo_rubi_real', qty: 1, station: 'forja', in: { lingote_oro: 4, rubi: 2 }, xp: 130 },
    { id: 'r_talisman_meteoro', out: 'talisman_meteoro', qty: 1, station: 'investigacion', in: { polvo_estelar: 3, esencia_magma: 2, diamantes: 3 }, xp: 205 },
    { id: 'r_roble_milenario', out: 'bloque_roble_milenario', qty: 1, station: 'mano', in: { madera: 12, bellota: 3, miel_ambar: 1 }, xp: 34 },
    { id: 'r_brasero_magma', out: 'bloque_brasero_magma', qty: 1, station: 'mesa_artesania', in: { hierro: 5, carbon: 4, material_volcanico: 2 }, xp: 36 },

    // === FASE 5: MESA DE HECHICERÍA (GRIMORIOS, BÁCULOS, VARITAS Y SOMBREROS) ===
    { id: 'r_tablilla_runica', out: 'tablilla_runica', qty: 2, station: 'mesa_hechiceria', in: { piedra: 6, cristales: 2 }, xp: 20 },
    { id: 'r_grim_misil', out: 'grimorio_misil_arcano', qty: 1, station: 'mesa_hechiceria', in: { tela: 3, cristales: 2 }, xp: 24 },
    { id: 'r_grim_daga_ven', out: 'grimorio_daga_veneno', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 1, esmeraldas: 1, tela: 2 }, xp: 40 },
    { id: 'r_grim_curacion', out: 'grimorio_curacion_sagrada', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 1, bayas: 5, cristales_magicos: 1 }, xp: 42 },
    { id: 'r_grim_bola_fuego', out: 'grimorio_bola_fuego', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 1, carbon: 6, rubi: 1 }, xp: 48 },
    { id: 'r_grim_espinas', out: 'grimorio_espinas_tierra', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 1, jade: 1, madera: 8 }, xp: 52 },
    { id: 'r_grim_nova_hielo', out: 'grimorio_nova_hielo', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 2, azurita_glacial: 2, zafiro: 1 }, xp: 64 },
    { id: 'r_grim_escudo_div', out: 'grimorio_escudo_divino', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 2, lingote_oro: 3, cristales_magicos: 2 }, xp: 66 },
    { id: 'r_grim_paso_etereo', out: 'grimorio_paso_etereo', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 2, amatista: 1, esencia_oscura: 2 }, xp: 68 },
    { id: 'r_grim_cadena_rayos', out: 'grimorio_cadena_rayos', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 2, zafiro: 2, cristales_magicos: 3 }, xp: 85 },
    { id: 'r_grim_drenaje', out: 'grimorio_drenaje_mana', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 2, esencia_oscura: 4, rubi: 1 }, xp: 90 },
    { id: 'r_grim_furia_arc', out: 'grimorio_furia_arcana', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 3, diamantes: 2, polvo_estelar: 2 }, xp: 105 },
    { id: 'r_grim_meteoros', out: 'grimorio_lluvia_meteoros', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 4, esencia_magma: 3, polvo_estelar: 3, rubi: 2 }, xp: 165 },
    { id: 'r_grim_minerales', out: 'grimorio_lluvia_minerales', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 2, hierro: 8, oro: 4, cristales: 2 }, xp: 75 },
    { id: 'r_grim_horda', out: 'grimorio_llamado_horda', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 2, huesos: 8, esencia_oscura: 2, carbon: 6 }, xp: 75 },
    { id: 'r_grim_fauna', out: 'grimorio_llamado_fauna', qty: 1, station: 'mesa_hechiceria', in: { tablilla_runica: 1, trigo: 6, bayas: 6, lana: 3 }, xp: 62 },
    { id: 'r_varita_escarcha', out: 'varita_escarcha', qty: 1, station: 'investigacion', reqSkill: 'pro_36', in: { lingote_titanio: 6, azurita_glacial: 8, esquirla_hielo: 10, cristales_magicos: 8, polvo_estelar: 4 }, xp: 175 },
    { id: 'r_varita_rubi', out: 'varita_rubi', qty: 1, station: 'investigacion', reqSkill: 'com_30', in: { lingote_adamantita: 6, rubi: 8, cristales_magicos: 9, esencia_magma: 6, polvo_estelar: 5 }, xp: 205 },
    { id: 'r_baculo_druida', out: 'baculo_druida', qty: 1, station: 'investigacion', reqSkill: 'pro_36', in: { lingotes_especiales: 6, lingote_titanio: 6, jade: 8, runa_vida: 4, cristales_magicos: 8 }, xp: 185 },
    { id: 'r_baculo_lunar', out: 'baculo_lunar', qty: 1, station: 'investigacion', reqSkill: 'exp_33', in: { lingote_adamantita: 8, amatista: 8, cristales_magicos: 9, esencia_oscura: 8, polvo_estelar: 6 }, xp: 230 },
    { id: 'r_baculo_rubi', out: 'baculo_rubi', qty: 1, station: 'investigacion', reqSkill: 'com_66', in: { baculo_lunar: 1, lingote_oricalco: 9, rubi: 8, esencia_magma: 8, polvo_estelar: 8, gema_alma: 2 }, xp: 295 },
    { id: 'r_sombrero_hech', out: 'sombrero_hechicero', qty: 1, station: 'mesa_hechiceria', in: { tela: 6, amatista: 1, cristales_magicos: 2 }, xp: 64 },
    { id: 'r_sombrero_bruja', out: 'sombrero_bruja', qty: 1, station: 'mesa_hechiceria', in: { sombrero_hechicero: 1, esencia_oscura: 3, polvo_estelar: 2 }, xp: 118 },
    { id: 'r_colgante_estrella', out: 'colgante_estrella', qty: 1, station: 'mesa_hechiceria', in: { lingote_platino: 3, zafiro: 2, polvo_estelar: 2 }, xp: 110 },

    // === FASE 5: YUNQUE RÚNICO & FORJA ESPECIALIZADA (ARMAS DE ARQUETIPO Y LLAVES) ===
    { id: 'r_daga_hierro', out: 'daga_hierro', qty: 1, station: 'forja', in: { lingote_hierro: 3, cuero: 2 }, xp: 24 },
    { id: 'r_daga_acero', out: 'daga_acero', qty: 1, station: 'yunque_runico', in: { lingote_acero: 3, carbon: 4 }, xp: 52 },
    { id: 'r_daga_oro', out: 'daga_oro', qty: 1, station: 'yunque_runico', in: { lingote_oro: 4, ambar_desierto: 2 }, xp: 68 },
    { id: 'r_daga_legendaria', out: 'daga_legendaria', qty: 1, station: 'yunque_runico', reqSkill: 'com_30', in: { daga_acero: 1, lingote_celestial: 4, esencia_oscura: 5, gema_alma: 1 }, xp: 210 },
    { id: 'r_hacha_bat_h', out: 'hacha_batalla_hierro', qty: 1, station: 'forja', in: { lingote_hierro: 5, tablon: 3 }, xp: 30 },
    { id: 'r_hacha_bat_o', out: 'hacha_batalla_oro', qty: 1, station: 'yunque_runico', in: { lingote_oro: 5, ambar_desierto: 2 }, xp: 75 },
    { id: 'r_hacha_bat_l', out: 'hacha_batalla_legendaria', qty: 1, station: 'yunque_runico', reqSkill: 'com_36', in: { hacha_batalla_oro: 1, lingote_adamantita: 4, lingote_titanio: 4, rubi: 3 }, xp: 200 },
    { id: 'r_espadon_h', out: 'espadon_hierro', qty: 1, station: 'forja', in: { lingote_hierro: 6, carbon: 3 }, xp: 34 },
    { id: 'r_espadon_a', out: 'espadon_acero', qty: 1, station: 'yunque_runico', in: { lingote_acero: 6, zafiro: 1 }, xp: 66 },
    { id: 'r_espadon_o', out: 'espadon_oro', qty: 1, station: 'yunque_runico', in: { lingote_oro: 6, topacio: 2 }, xp: 105 },
    { id: 'r_espadon_l', out: 'espadon_legendario', qty: 1, station: 'yunque_runico', reqSkill: 'com_54', in: { espadon_oro: 1, lingote_celestial: 5, gema_alma: 2, polvo_estelar: 3 }, xp: 245 },
    { id: 'r_lanza_h', out: 'lanza_hierro', qty: 1, station: 'forja', in: { lingote_hierro: 3, tablon: 4 }, xp: 28 },
    { id: 'r_lanza_c', out: 'lanza_carmesi', qty: 1, station: 'yunque_runico', in: { lingote_acero: 4, rubi: 2, esencia_magma: 2 }, xp: 108 },
    { id: 'r_alabarda_r', out: 'alabarda_real', qty: 1, station: 'yunque_runico', reqSkill: 'com_30', in: { lanza_carmesi: 1, lingote_adamantita: 4, lingote_titanio: 4, prisma_imperial: 1 }, xp: 205 },
    { id: 'r_maza_h', out: 'maza_hierro', qty: 1, station: 'forja', in: { lingote_hierro: 4, piedra: 6 }, xp: 26 },
    { id: 'r_maza_a', out: 'maza_acero', qty: 1, station: 'yunque_runico', in: { lingote_acero: 5, cristales: 3 }, xp: 64 },
    { id: 'r_maza_l', out: 'maza_legendaria', qty: 1, station: 'yunque_runico', reqSkill: 'com_36', in: { maza_acero: 1, lingote_celestial: 4, polvo_estelar: 3, runa_tierra: 2 }, xp: 210 },
    { id: 'r_ballesta_m', out: 'ballesta_madera', qty: 1, station: 'forja', in: { tablon: 6, lingote_hierro: 3, tela: 3 }, xp: 40 },
    { id: 'r_ballesta_l', out: 'ballesta_legendaria', qty: 1, station: 'yunque_runico', reqSkill: 'com_30', in: { ballesta_madera: 1, lingote_oricalco: 4, seda_arana: 6, polvo_estelar: 3 }, xp: 215 },
    { id: 'r_armadura_pal', out: 'armadura_paladin', qty: 1, station: 'yunque_runico', in: { lingote_oro: 6, lingote_titanio: 4, cristales_magicos: 3 }, xp: 185 },
    { id: 'r_yelmo_vik', out: 'yelmo_vikingo', qty: 1, station: 'yunque_runico', in: { lingote_acero: 5, azurita_glacial: 2, cuero: 4 }, xp: 98 },
    { id: 'r_anillo_diam', out: 'anillo_diamante', qty: 1, station: 'yunque_runico', in: { lingote_platino: 3, diamantes: 2 }, xp: 120 },
    { id: 'r_anillo_esmer', out: 'anillo_esmeralda', qty: 1, station: 'yunque_runico', in: { lingote_plata: 3, esmeraldas: 2 }, xp: 85 },
    { id: 'r_colgante_cal', out: 'colgante_calavera', qty: 1, station: 'yunque_runico', in: { huesos: 10, esencia_oscura: 3, rubi: 2 }, xp: 155 },
    { id: 'r_llave_maestra', out: 'llave_maestra_mazmorra', qty: 1, station: 'yunque_runico', in: { llave_dorada: 1, llave_zafiro: 1, llave_rubi: 1, lingote_celestial: 1 }, xp: 150 }
  ];

  // Assign rarity-scaled build / craft / cook durations uniformly (applied to all items)
  const RARITY_CRAFT_TIME = {
    comun: 1.6,
    poco_comun: 2.8,
    raro: 4.5,
    epico: 6.5,
    legendario: 9.0
  };
  const TIER_CRAFT_TIME = {
    basica: 1.2,
    mejorada: 1.8,
    cobre: 2.4,
    hierro: 3.1,
    plata: 3.9,
    oro: 4.8,
    platino: 5.8,
    acero: 6.8,
    cristal: 7.8,
    mitrilo: 8.9,
    titanio: 10.0,
    adamantita: 11.2,
    oricalco: 12.5,
    legendaria: 14.0,
    celestial: 16.0
  };

  // Clean zero keys and populate craftTime / isCook uniformly
  RECIPES.forEach(r => {
    Object.keys(r.in).forEach(k => {
      if (!r.in[k]) delete r.in[k];
    });
    if (!Number.isFinite(r.craftTime)) {
      if (r.toolUnlock) {
        r.craftTime = 2.0;
      } else if (r.toolUpgrade) {
        const tier = r.toolUpgrade.split(':').pop();
        r.craftTime = TIER_CRAFT_TIME[tier] || 4.0;
      } else if (r.out === '_coin') {
        r.craftTime = r.in && (r.in.lingote_platino || r.in.lingote_oro) ? 4.2 : 2.5;
      } else {
        const outItem = Balaclava.ITEMS && Balaclava.ITEMS[r.out];
        const rar = (outItem && outItem.rarity) || 'comun';
        r.craftTime = RARITY_CRAFT_TIME[rar] || 2.0;
      }
    }
    r.isCook = r.station === 'cocina' || r.station === 'horno' || r.station === 'fogata' || r.station === 'molino';
  });

  // Sort strictly beginner -> endgame within each station
  const RARITY_RANK = { comun: 0, poco_comun: 1, raro: 2, epico: 3, legendario: 4 };
  const recipeProgScore = (r) => {
    if (r.toolUnlock) return 10 + (r.xp || 0);
    if (r.out === '_coin') return 3500 + (r.xp || 0);
    const outItem = Balaclava.ITEMS && Balaclava.ITEMS[r.out];
    if (outItem && outItem.tier) return 4000 + outItem.tier * 120 + (r.xp || 0);
    const rar = outItem ? (RARITY_RANK[outItem.rarity] || 0) : 0;
    const ingCount = Object.values(r.in || {}).reduce((a, b) => a + b, 0);
    return 100 + rar * 600 + (r.xp || 0) * 8 + ingCount * 4;
  };
  RECIPES.sort((a, b) => recipeProgScore(a) - recipeProgScore(b));

  Balaclava.RECIPES = RECIPES;
})();
