(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  const ROOT = window.BALACLAVA_ROOT_BASE || '';
  const withRoot = (u) => (u && ROOT && u.startsWith('assets/') ? ROOT + u : u);
  const RPG_ICON_BASE = 'assets/packs/Pixel Art Icon Pack - RPG/';
  const RPG16_BASE = 'assets/packs/16x16_RPG_Item_Pack/16x16 RPG Item Pack/';
  const FDA_BASE = 'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/';
  const TS_UI_BASE = 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/UI Elements/UI Elements/';
  const RAVEN_BASE = 'assets/packs/Free - Raven Fantasy Icons/Free - Raven Fantasy Icons/Separated Files/32x32/';
  const VERARC_BASE = 'assets/packs/VerArc_Basic_Skills_and_Buffs/';
  const FOOD_BASE = 'assets/packs/Free_pixel_food_16x16/Free_pixel_food_16x16/Icons/';
  const LEGENDS_BASE = 'assets/packs/Legends_of_Fantasy_Icons_32x32/Color 02 Seperate Outline/';

  // Real standalone PNG UI & Icon URLs (safe on file:// without tainted-canvas toDataURL!)
  Balaclava.UI_URLS = {
    avatarHero: TS_UI_BASE + 'Human Avatars/Avatars_01.png',
    iconHammer: TS_UI_BASE + 'Icons/Icon_01.png',
    iconWood: TS_UI_BASE + 'Icons/Icon_02.png',
    iconCoin: 'assets/ui/coin_gold.png',
    iconCoinBlue: 'assets/ui/coin_blue.png',
    bossBar: 'assets/ui/ui_boss_dragon_bar.png',
    iconFood: TS_UI_BASE + 'Icons/Icon_04.png',
    iconSword: TS_UI_BASE + 'Icons/Icon_05.png',
    iconShield: TS_UI_BASE + 'Icons/Icon_06.png',
    iconBow: TS_UI_BASE + 'Icons/Icon_08.png',
    sun: 'assets/icons/sun.png',
    sunrise: 'assets/icons/sunrise.png',
    sunset: 'assets/icons/sunset.png',
    moon: 'assets/icons/moon.png',
    backpack: 'assets/icons/backpack.png',
    anvil: 'assets/icons/anvil.png',
    spellbook: 'assets/icons/spellbook.png',
    xpOrb: 'assets/icons/xp_orb.png',
    manaOrb: 'assets/icons/mana_orb.png',
    skullDeath: FDA_BASE + '07_Items/Monster_Drops/skull.png',
    barFrame: 'assets/ui/rpg_bar_frame.png',
    barOrnate: 'assets/ui/rpg_bar_ornate.png',
    barFillHp: FDA_BASE + '08_UI/Bars/fill_health_60x6.png',
    barFillEn: FDA_BASE + '08_UI/Bars/fill_stamina_60x6.png',
    barFillXp: FDA_BASE + '08_UI/Bars/fill_xp_60x6.png',
    scrollMap: 'assets/icons/scroll_map.png',
    trophy: 'assets/icons/trophy.png',
    chest: 'assets/sprites_extra/chest_gold_closed.png',
    campfire: 'assets/icons/campfire.png',
    lantern: 'assets/icons/lantern.png',
    frameCommon: FDA_BASE + '08_UI/Inventory/item_frame_common_20x20.png',
    frameUncommon: FDA_BASE + '08_UI/Inventory/item_frame_uncommon_20x20.png',
    frameRare: FDA_BASE + '08_UI/Inventory/item_frame_rare_20x20.png',
    frameEpic: FDA_BASE + '08_UI/Inventory/item_frame_epic_20x20.png',
    frameLegendary: FDA_BASE + '08_UI/Inventory/item_frame_legendary_20x20.png',
    skillSlotNormal: FDA_BASE + '08_UI/Skills/skill_slot_normal_20x20.png',
    skillSlotSelected: FDA_BASE + '08_UI/Skills/skill_slot_selected_20x20.png',
    skillSlotDisabled: FDA_BASE + '08_UI/Skills/skill_slot_disabled_20x20.png',
    heartFull: FDA_BASE + '08_UI/Hearts_Icons/heart_full.png',
    manaOrb: FDA_BASE + '08_UI/Hearts_Icons/mana_orb_full.png',
    armorFull: FDA_BASE + '08_UI/Hearts_Icons/armor_full.png',
    minimapFrame: 'assets/ui/rpg_compass.png',
    iconSettings: 'assets/ui/ico_gear.png',
    iconMap: RPG_ICON_BASE + 'Misc/Map.png',
    iconBook: RPG_ICON_BASE + 'Misc/Book.png',
    iconScroll: RPG_ICON_BASE + 'Misc/Scroll.png',
    iconKey: RPG_ICON_BASE + 'Misc/Golden Key.png',
    iconMute: 'assets/ui/ico_sound_off.png',
    iconSound: 'assets/ui/ico_sound_on.png',
    iconSave: RPG_ICON_BASE + 'Misc/Scroll.png',
    iconPlay: TS_UI_BASE + 'Icons/Icon_05.png',
    iconCheck: 'assets/ui/ico_check.png',
    iconCross: 'assets/ui/ico_cross.png',
    iconStar: 'assets/ui/ico_star.png',
    iconLock: 'assets/ui/ico_lock.png',
    iconTrash: 'assets/ui/ico_trash.png',
    iconZoomIn: 'assets/ui/ico_zoom_in.png',
    iconZoomOut: 'assets/ui/ico_zoom_out.png',
    iconReset: 'assets/ui/ico_reset.png',
    iconTrophy: 'assets/ui/ico_trophy.png',
    iconSparkle: 'assets/ui/ico_sparkle.png',
    iconHeart: 'assets/ui/ico_heart.png',
    iconHome: 'assets/ui/ico_home.png',
    iconSliders: 'assets/ui/ico_sliders.png',
    iconDiscord: 'assets/ui/ico_discord.png',
    arrowLeft: 'assets/ui/cryo_arrow_left.png',
    arrowRight: 'assets/ui/cryo_arrow_right.png',
    flatArrowLeft: 'assets/ui/ui_flat_btn_arrow_left.png',
    flatArrowRight: 'assets/ui/ui_flat_btn_arrow_right.png',
    waterClasico: 'assets/tiles/water_clasico.png',
    waterProfundo: 'assets/tiles/water_profundo.png',
    waterEsmeralda: 'assets/tiles/water_esmeralda.png',
    waterAbisal: 'assets/tiles/water_abisal.png',
    toggleOn: 'assets/ui/doboui_toggle_on.png',
    toggleOff: 'assets/ui/doboui_toggle_off.png',
    slotSlate: 'assets/ui/rpg_slot_slate.png',
    slotActive: 'assets/ui/rpg_slot_active.png',
    slotHead: 'assets/ui/rpg_equip_head.png',
    slotChest: 'assets/ui/rpg_equip_chest.png',
    slotLegs: 'assets/ui/rpg_equip_pants.png',
    slotWeapon: 'assets/ui/rpg_equip_weapon.png',
    slotOffhand: 'assets/ui/rpg_equip_offhand.png',
    slotFeet: 'assets/ui/rpg_equip_boots.png',
    slotRing: 'assets/ui/rpg_equip_ring.png',
    slotNeck: 'assets/ui/rpg_equip_neck.png',
    kbSheet: 'assets/packs/Controllers and Keyboard/Controllers and Keyboard/kb_light_alphanumeric.png',
    mouseImg: 'assets/packs/Controllers and Keyboard/Controllers and Keyboard/mouse.png',
    rpgHudPanel: 'assets/ui/rpg_hud_panel.png',
    rpgSubcardPanel: 'assets/ui/rpg_subcard_panel.png',
    rpgTooltipPanel: 'assets/ui/rpg_tooltip_panel.png',
    rpgHeaderPlaque: 'assets/ui/rpg_header_plaque.png',
    rpgTabNormal: 'assets/ui/rpg_tab_normal.png',
    rpgTabHover: 'assets/ui/rpg_tab_hover.png',
    rpgTabActive: 'assets/ui/rpg_tab_active.png',
    rpgTabGold: 'assets/ui/rpg_tab_gold.png',
    rpgAvatarFrame: 'assets/ui/rpg_avatar_frame.png',
    rpgCompass: 'assets/ui/rpg_compass.png',
    rpgTargetReticle: 'assets/ui/rpg_target_reticle.png',
    rpgScrollGold: 'assets/ui/rpg_scroll_gold.png',
    rpgScrollSlate: 'assets/ui/rpg_scroll_slate.png',
    skyNebulaBlue: 'assets/ui/sky_nebula_blue.png',
    skyNebulaPurple: 'assets/ui/sky_nebula_purple.png',
    skyStarfield: 'assets/ui/sky_starfield.png',
    buffAttack: 'assets/icons_extra/buff_attack.png',
    buffDefense: 'assets/icons_extra/buff_defense.png',
    buffSwiftness: 'assets/icons_extra/buff_swiftness.png',
    buffRegen: 'assets/icons_extra/buff_regen.png',
    buffLuck: 'assets/icons_extra/buff_luck.png',
    buffXp: 'assets/icons_extra/buff_xp.png',
    buffCrit: 'assets/icons_extra/buff_crit.png',
    biomePradera: 'assets/icons/biome_pradera.png',
    biomeDesierto: 'assets/icons/biome_desierto.png',
    biomeBosque: 'assets/icons/biome_bosque_oscuro.png',
    biomeHielo: 'assets/icons/biome_montanas_heladas.png',
    biomeVolcan: 'assets/icons/biome_tierras_volcanicas.png',
    keyE: 'assets/ui/key_e.png',
    keyEPressed: 'assets/ui/key_e_pressed.png'
  };

  Balaclava.BUFF_ICON_URLS = {
    speed: 'assets/icons_extra/buff_swiftness.png',
    dmg: 'assets/icons_extra/buff_attack.png',
    attack: 'assets/icons_extra/buff_attack.png',
    defense: 'assets/icons_extra/buff_defense.png',
    luck: 'assets/icons_extra/buff_luck.png',
    xp: 'assets/icons_extra/buff_xp.png',
    regen: 'assets/icons_extra/buff_regen.png',
    crit: 'assets/icons_extra/buff_crit.png',
    arcane: 'assets/icons_extra/scroll_purple.png',
    hunter: 'assets/icons_extra/buff_crit.png',
    furia_arcana: 'assets/icons_extra/buff_attack.png'
  };

  // Every item icon key mapped to a real crisp PNG file.
  Balaclava.ITEM_PNG_MAP = {
    wood: RPG_ICON_BASE + 'Material/Wood Log.png',
    plank: RPG_ICON_BASE + 'Material/Wooden Plank.png',
    stone: 'assets/sprites_extra/stewv_stone.png',
    herb: 'assets/icons/herb.png',
    fiber: RPG_ICON_BASE + 'Material/Rope.png',
    berries: 'assets/icons/berries.png',
    seeds: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/7 - Wheat Pouch Outline.png',
    coal: 'assets/sprites_extra/stewv_coal.png',
    carbon_eterno: 'assets/icons_extra/carbon_eterno.png',
    iron_ore: 'assets/sprites_extra/stewv_iron_ore.png',
    copper_ore: 'assets/sprites_extra/stewv_copper_ore.png',
    gold_ore: 'assets/sprites_extra/stewv_gold_ore.png',
    crystal: 'assets/icons_extra/crystal.png',
    cristal: 'assets/icons_extra/cristal.png',
    cristales: 'assets/icons_extra/cristales.png',
    magic_crystal: 'assets/icons_extra/magic_crystal.png',
    cristal_magico: 'assets/icons_extra/cristal_magico.png',
    cristales_magicos: 'assets/icons_extra/magic_crystal.png',
    cristal_abismal: 'assets/icons_extra/cristal_abismal.png',
    esquirla_hielo: 'assets/icons_extra/esquirla_hielo.png',
    coral_brillante: 'assets/icons_extra/coral_brillante.png',
    leather: RPG_ICON_BASE + 'Material/Leather.png',
    bone: RPG_ICON_BASE + 'Monster Part/Bone.png',
    sand: 'assets/icons/sand.png',
    arena_estelar: 'assets/sprites_extra/stewv_star_sand.png',
    clay: 'assets/sprites_extra/stewv_clay.png',
    diamond: 'assets/icons_extra/diamond.png',
    diamantes: 'assets/icons_extra/diamond.png',
    gema_diamante: 'assets/icons_extra/diamond.png',
    emerald: 'assets/icons_extra/emerald.png',
    esmeraldas: 'assets/icons_extra/emerald.png',
    gema_esmeralda: 'assets/icons_extra/emerald.png',
    ruby: 'assets/icons_extra/ruby.png',
    gema_rubi: 'assets/icons_extra/ruby.png',
    sapphire: 'assets/icons_extra/sapphire.png',
    gema_zafiro: 'assets/icons_extra/sapphire.png',
    jade: 'assets/icons_extra/jade.png',
    gema_jade: 'assets/icons_extra/jade.png',
    ambar: 'assets/icons_extra/ambar.png',
    gema_ambar: 'assets/icons_extra/ambar.png',
    gema_marina: 'assets/icons_extra/gema_marina.png',
    gema_alma: 'assets/icons_extra/gema_alma.png',
    gem_soul_gem: 'assets/icons_extra/gema_alma.png',
    dark_essence: FDA_BASE + '07_Items/Monster_Drops/shadow_essence.png',
    ancient_fragment: RPG_ICON_BASE + 'Misc/Rune Stone.png',
    special_ingot: 'assets/icons_extra/special_ingot.png',
    lingotes_especiales: 'assets/icons_extra/special_ingot.png',
    lingote_mitrilo: 'assets/icons_extra/lingote_mitrilo.png',
    mitrilo_refinado: 'assets/icons_extra/lingote_mitrilo.png',
    volcanic: 'assets/sprites_extra/stewv_volcanic.png',
    escama_obsidiana: 'assets/sprites_extra/stewv_volcanic_core.png',
    brick: 'assets/icons/brick.png',
    glass: 'assets/icons_extra/glass_item.png',
    cloth: RPG_ICON_BASE + 'Material/Fabric.png',
    copper_ingot: 'assets/icons_extra/copper_ingot.png',
    lingote_cobre: 'assets/icons_extra/lingote_cobre.png',
    lingote_bronce: 'assets/icons_extra/lingote_bronce.png',
    iron_ingot: 'assets/icons_extra/iron_ingot.png',
    lingote_hierro: 'assets/icons_extra/lingote_hierro.png',
    gold_ingot: 'assets/icons_extra/gold_ingot.png',
    lingote_oro: 'assets/icons_extra/lingote_oro.png',
    steel_ingot: 'assets/icons_extra/steel_ingot.png',
    lingote_acero: 'assets/icons_extra/lingote_acero.png',
    lingote_plata: 'assets/icons_extra/lingote_plata.png',
    lingote_adamantita: 'assets/icons_extra/lingote_adamantita.png',
    lingote_titanio: 'assets/icons_extra/lingote_titanio.png',
    silver_bar: 'assets/icons_extra/lingote_titanio.png',
    lingote_celestial: 'assets/icons_extra/lingote_celestial.png',
    lingote_platino: 'assets/icons_extra/bar_silver.png',
    lingote_oricalco: 'assets/icons_extra/lingote_adamantita.png',
    gear: RPG_ICON_BASE + 'Misc/Gear.png',
    seeds_carrot: 'assets/icons/seeds_carrot.png',
    seeds_pumpkin: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/7 - Pumpkin Pouch Outline.png',
    seeds_crystal: 'assets/icons/seeds_crystal.png',
    seeds_tomato: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/7 - Tomato Pouch Outline.png',
    seeds_potato: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/7 - Potato Pouch Outline.png',
    seeds_corn: RAVEN_BASE + 'fb417.png',
    seeds_eggplant: RAVEN_BASE + 'fb423.png',
    seeds_chili: RAVEN_BASE + 'fb420.png',
    seeds_strawberry: RAVEN_BASE + 'fb421.png',
    seeds_grapes: RAVEN_BASE + 'fb424.png',
    wheat: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/6 - Wheat Inventory Outline.png',
    carrot: 'assets/icons/carrot.png',
    pumpkin: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/6 - Pumpkin Inventory Outline.png',
    crystal_flower: 'assets/icons_extra/flor_cristal.png',
    crop_potato: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/6 - Potato Inventory Outline.png',
    food_ration: FDA_BASE + '07_Items/Food/ration.png',
    food_pastry: 'assets/icons_extra/pastry.png',
    flour: 'assets/icons/flour.png',
    wool: 'assets/icons/wool.png',
    meat: RPG_ICON_BASE + 'Food/Meat.png',
    egg: FDA_BASE + '07_Items/Food/egg.png',
    milk: 'assets/icons/milk.png',
    mushroom: RPG_ICON_BASE + 'Food/Mushroom.png',
    cactus: 'assets/icons/cactus.png',
    fish_common: 'assets/icons/fish_common.png',
    fish_gold: 'assets/icons/fish_gold.png',
    fish_dark: 'assets/icons/fish_dark.png',
    fish_ice: 'assets/icons/fish_ice.png',
    fish_lava: 'assets/icons/fish_lava.png',
    bread: RPG_ICON_BASE + 'Food/Bread.png',
    pan_maiz: FOOD_BASE + 'pastry_brioche.png',
    steak: RPG_ICON_BASE + 'Food/Ham.png',
    trucha_asada: 'assets/icons_extra/trucha_asada.png',
    cangrejo_asado: 'assets/icons_extra/cangrejo_asado.png',
    stew: FDA_BASE + '07_Items/Food/stew.png',
    sopa_pescado: RAVEN_BASE + 'fb527.png',
    potion_hp: 'assets/icons_extra/potion_hp.png',
    potion_spd: 'assets/icons_extra/potion_spd.png',
    jugo_uva: 'assets/icons_extra/jugo_uva.png',
    potion_night: 'assets/icons_extra/potion_night.png',
    potion_luck: 'assets/icons_extra/potion_luck.png',
    potion_harvest: 'assets/icons_extra/potion_harvest.png',
    armor_leather: RPG_ICON_BASE + 'Equipment/Leather Armor.png',
    armor_wood: FDA_BASE + '07_Items/Armor/chestplate_wood.png',
    armor_cobre: RAVEN_BASE + 'fb1932.png',
    armor_iron: RPG_ICON_BASE + 'Equipment/Iron Armor.png',
    armor_plata: RAVEN_BASE + 'fb1921.png',
    armor_gold: FDA_BASE + '07_Items/Armor/chestplate_gold.png',
    armor_platinum: RAVEN_BASE + 'fb1889.png',
    armor_steel: FDA_BASE + '07_Items/Armor/chestplate_steel.png',
    armor_crystal: RAVEN_BASE + 'fb1902.png',
    armor_mithril: RAVEN_BASE + 'fb1863.png',
    armor_platino: RAVEN_BASE + 'fb2049.png',
    armor_adamantite: RAVEN_BASE + 'fb1869.png',
    armor_oricalco: RAVEN_BASE + 'fb2084.png',
    armor_legend: FDA_BASE + '07_Items/Armor/chestplate_legendary.png',
    armor_solar: RAVEN_BASE + 'fb1897.png',
    ring_gold: FDA_BASE + '07_Items/Armor/ring_topaz.png',
    ring_platinum: FDA_BASE + '07_Items/Armor/ring_emerald.png',
    ring_ruby: FDA_BASE + '07_Items/Armor/ring_ruby.png',
    ring_mithril: RAVEN_BASE + 'fb2186.png',
    amulet: FDA_BASE + '07_Items/Armor/amulet_sapphire.png',
    key: RPG_ICON_BASE + 'Misc/Golden Key.png',
    coin: FDA_BASE + '07_Items/Loot_Coins_Gems/coin_copper.png',
    coin_gold: 'assets/ui/coin_gold.png',
    espada_hierro: RPG_ICON_BASE + 'Weapon & Tool/Iron Sword.png',
    reliquia_antigua: FDA_BASE + '07_Items/Quest_Items/ancient_tablet.png',
    relic_lantern: 'assets/icons/lantern.png',
    relic_compass: FDA_BASE + '07_Items/Tools/compass.png',
    relic_heart: FDA_BASE + '07_Items/Relics/crystal_heart.png',
    relic_crown: FDA_BASE + '07_Items/Quest_Items/crown.png',
    relic_core: FDA_BASE + '07_Items/Relics/phoenix_feather.png',
    balaclava_core: 'assets/icons/balaclava_core.png',
    // Extended Ores, Gems, Crops, Foods, Fish, Equipment & Placeable Blocks
    ore_silver: 'assets/sprites_extra/stewv_silver_ore.png',
    ore_titanium: 'assets/sprites_extra/stewv_azurite_ore.png',
    bar_silver: 'assets/icons_extra/bar_silver.png',
    ore_mithril: 'assets/sprites_extra/stewv_mithril_ore.png',
    ore_adamantite: 'assets/sprites_extra/stewv_hematite.png',
    ore_orichalcum: 'assets/sprites_extra/stewv_bloodstone_ore.png',
    bar_adamantite: 'assets/icons_extra/bar_adamantite.png',
    sulfur: 'assets/icons_extra/sulfur.png',
    polvo_ceniza: 'assets/icons_extra/powder_ash.png',
    saltpeter: 'assets/icons_extra/saltpeter.png',
    gunpowder: 'assets/icons_extra/gunpowder.png',
    gem_ruby: 'assets/sprites_extra/stewv_ruby.png',
    gem_sapphire: 'assets/sprites_extra/stewv_sapphire.png',
    cuarzo_lunar: 'assets/sprites_extra/stewv_amethyst_cluster.png',
    gem_amethyst: 'assets/sprites_extra/stewv_amethyst.png',
    gem_topaz: 'assets/sprites_extra/stewv_topaz_cut.png',
    nucleo_solar: 'assets/sprites_extra/stewv_solar_core.png',
    ambar_desierto: 'assets/sprites_extra/stewv_amber_desert.png',
    stardust: 'assets/icons_extra/stardust.png',
    seed_bag: 'assets/icons_extra/seed_bag.png',
    crop_tomato: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/6 - Tomato Inventory Outline.png',
    ensalada_fresca: RAVEN_BASE + 'fb526.png',
    crop_corn: 'assets/icons_extra/corn.png',
    crop_eggplant: 'assets/icons_extra/eggplant.png',
    crop_chili: 'assets/icons_extra/chili.png',
    taco_picante: RAVEN_BASE + 'fb592.png',
    crop_strawberry: 'assets/icons_extra/strawberry.png',
    crop_grapes: 'assets/icons_extra/grapes.png',
    honey: 'assets/icons_extra/honey.png',
    resina_antigua: 'assets/icons_extra/resina_antigua.png',
    candle: 'assets/icons_extra/candle.png',
    cheese: 'assets/icons_extra/cheese.png',
    baguette: 'assets/icons_extra/baguette.png',
    cake: 'assets/icons_extra/cake.png',
    tarta_fresa: FOOD_BASE + 'cake_strawberry.png',
    banquete_real: 'assets/icons_extra/roasted_cutlet.png',
    macedonia_real: FOOD_BASE + 'fruit_apple-slice.png',
    sushi: 'assets/icons_extra/sushi.png',
    coffee: 'assets/icons_extra/coffee.png',
    apple_gold: 'assets/icons_extra/apple.png',
    fertilizer: 'assets/icons_extra/fertilizer.png',
    worm_bait: 'assets/icons_extra/worm_bait.png',
    gold_bait: 'assets/icons_extra/gold_bait.png',
    fish_blue: 'assets/icons_extra/blue_fish.png',
    fish_clown: 'assets/icons_extra/clownfish.png',
    fish_eel: 'assets/icons_extra/eel.png',
    crab: 'assets/icons_extra/crab.png',
    shrimp: 'assets/icons_extra/shrimp.png',
    jellyfish: 'assets/icons_extra/jellyfish.png',
    octopus: 'assets/icons_extra/octopus.png',
    pearl: 'assets/icons_extra/pearl.png',
    gema_marina: 'assets/sprites_extra/stewv_pearl_abyssal.png',
    shell: 'assets/icons_extra/shell.png',
    old_boot: 'assets/icons_extra/old_boot.png',
    spider_silk: FDA_BASE + '07_Items/Monster_Drops/spider_silk.png',
    fang: FDA_BASE + '07_Items/Monster_Drops/fang.png',
    demon_horn: FDA_BASE + '07_Items/Monster_Drops/demon_horn.png',
    scale_red: FDA_BASE + '07_Items/Monster_Drops/scale_red.png',
    bomb_item: FDA_BASE + '07_Items/Ammo/bomb.png',
    bomba_escarcha: 'assets/icons_extra/bomba_escarcha.png',
    bomba_solar: 'assets/icons_extra/bomba_solar.png',
    bomba_abismal: 'assets/icons_extra/bomba_abismal.png',
    potion_strength: 'assets/icons_extra/potion_strength.png',
    scroll_red: FDA_BASE + '07_Items/Scrolls_Books/scroll_fire.png',
    scroll_blue: FDA_BASE + '07_Items/Scrolls_Books/scroll_ice.png',
    scroll_fortuna: 'assets/icons_extra/scroll_gold.png',
    scroll_fuego: 'assets/icons_extra/scroll_crimson.png',
    scroll_rayo: 'assets/icons_extra/scroll_purple.png',
    scroll_hielo: 'assets/icons_extra/scroll_cyan.png',
    helm_leather: RPG_ICON_BASE + 'Equipment/Helm.png',
    helm_wood: FDA_BASE + '07_Items/Armor/helmet_wood.png',
    helm_cobre: RAVEN_BASE + 'fb1916.png',
    helm_iron: FDA_BASE + '07_Items/Armor/helmet_iron.png',
    helm_plata: RAVEN_BASE + 'fb1912.png',
    helm_gold: FDA_BASE + '07_Items/Armor/helmet_gold.png',
    helm_platinum: RAVEN_BASE + 'fb2052.png',
    helm_steel: FDA_BASE + '07_Items/Armor/helmet_steel.png',
    helm_crystal: RAVEN_BASE + 'fb1833.png',
    helm_mithril: RAVEN_BASE + 'fb1834.png',
    helm_titanio: RAVEN_BASE + 'fb2053.png',
    helm_adamantite: RAVEN_BASE + 'fb2054.png',
    helm_oricalco: RAVEN_BASE + 'fb1918.png',
    helm_legend: FDA_BASE + '07_Items/Armor/helmet_legendary.png',
    helm_solar: RAVEN_BASE + 'fb1839.png',
    shield_wood: FDA_BASE + '07_Items/Armor/shield_wood.png',
    shield_bronce: RAVEN_BASE + 'fb2114.png',
    shield_cobre: RAVEN_BASE + 'fb2135.png',
    shield_iron: FDA_BASE + '07_Items/Armor/shield_iron.png',
    shield_plata: RAVEN_BASE + 'fb2115.png',
    shield_gold: FDA_BASE + '07_Items/Armor/shield_gold.png',
    shield_platinum: RAVEN_BASE + 'fb2116.png',
    shield_acero: FDA_BASE + '07_Items/Armor/shield_steel.png',
    shield_legend: FDA_BASE + '07_Items/Armor/shield_legendary.png',
    shield_mithril: RAVEN_BASE + 'fb2145.png',
    shield_titanio: RAVEN_BASE + 'fb2117.png',
    shield_adamantite: RAVEN_BASE + 'fb2120.png',
    shield_oricalco: RAVEN_BASE + 'fb2139.png',
    shield_solar: RAVEN_BASE + 'fb2138.png',
    shield_celestial: RAVEN_BASE + 'fb2150.png',
    boots_wood: FDA_BASE + '07_Items/Armor/boots_wood.png',
    boots_bronce: RAVEN_BASE + 'fb1952.png',
    boots_cobre: RAVEN_BASE + 'fb1948.png',
    boots_iron: FDA_BASE + '07_Items/Armor/boots_iron.png',
    boots_plata: RAVEN_BASE + 'fb1944.png',
    boots_gold: FDA_BASE + '07_Items/Armor/boots_gold.png',
    boots_platinum: RAVEN_BASE + 'fb1937.png',
    boots_steel: FDA_BASE + '07_Items/Armor/boots_steel.png',
    boots_cristal: RAVEN_BASE + 'fb2166.png',
    boots_mithril: RAVEN_BASE + 'fb2161.png',
    boots_titanio: RAVEN_BASE + 'fb2055.png',
    boots_adamantite: RAVEN_BASE + 'fb1942.png',
    boots_oricalco: RAVEN_BASE + 'fb2163.png',
    boots_legend: FDA_BASE + '07_Items/Armor/boots_legendary.png',
    boots_legendary: RAVEN_BASE + 'fb2162.png',
    boots_solar: RAVEN_BASE + 'fb2164.png',
    amulet_emerald: FDA_BASE + '07_Items/Armor/amulet_emerald.png',
    prop_stone_block: 'assets/sprites_extra/stone_block.png',
    prop_crate: 'assets/sprites_extra/crate_wood.png',
    prop_fence: 'assets/sprites_extra/fence_wood.png',
    prop_cobble: 'assets/sprites_extra/cobble_tile.png',
    prop_lamppost: 'assets/sprites_extra/lamppost.png',
    prop_fireplace: 'assets/sprites_extra/fireplace.png',
    prop_angel: 'assets/sprites_extra/angel_statue.png',
    prop_well: 'assets/sprites_extra/stone_well.png',
    // Expanded 8-Tier Ores, Alloys, Gems, Pixel Gnome Fish, Relics & Gear
    estano: 'assets/sprites_extra/stewv_tin_ore.png',
    lingote_platino: 'assets/icons_extra/bar_silver.png',
    platino: 'assets/sprites_extra/stewv_platinum_ore.png',
    jade: 'assets/icons_extra/jade.png',
    amatista: 'assets/sprites_extra/stewv_amethyst_cut.png',
    sanguinaria: 'assets/sprites_extra/stewv_ruby_cut.png',
    celestial_ingot: 'assets/icons_extra/lingote_celestial.png',
    // Pixel Gnome Fish Icons (Outlined crisp sprites)
    pg_anchovy: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Anchovy Outline.png',
    pg_clownfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Clownfish Outline.png',
    pg_crab: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Crab - Dungeness Outline.png',
    pg_pufferfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Pufferfish Outline.png',
    pg_surgeonfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Surgeonfish Outline.png',
    pg_angelfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Angelfish Outline.png',
    pg_bass: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Bass Outline.png',
    pg_catfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Catfish Outline.png',
    pg_goldfish: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Goldfish Outline.png',
    pg_trout: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Rainbow Trout Outline.png',
    pg_can: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/C - Misc/Rusty Can Outline.png',
    pg_worm: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/C - Misc/Worm Outline.png',
    // Extra Gear, Scrolls & Relics
    relic_goblet: FDA_BASE + '07_Items/Relics/holy_grail.png',
    relic_skull: FDA_BASE + '07_Items/Relics/skull_relic.png',
    relic_tome: FDA_BASE + '07_Items/Scrolls_Books/spellbook_ice.png',
    relic_dragon_scale: RAVEN_BASE + 'fb260.png',
    relic_abyss_eye: FDA_BASE + '07_Items/Relics/cursed_ring.png',
    prop_rune_pillar: 'assets/sprites_extra/rune_pillar.png',
    prop_bookshelf: 'assets/sprites_extra/bookshelf.png',
    prop_banquet_table: 'assets/sprites_extra/banquet_table.png',
    prop_barrel: 'assets/sprites_extra/barrel_wood.png',
    prop_bench: 'assets/sprites_extra/bench_wood.png',
    palisade_wood: 'assets/icons_extra/palisade_wood.png',
    bld_muro_madera: 'assets/sprites_extra/bld_muro_madera.png',
    prop_ancient_oak: 'assets/sprites_extra/prop_ancient_oak.png',
    giant_skeleton_1: 'assets/sprites_extra/giant_skeleton_1.png',
    tinta_arcana: 'assets/icons_extra/tinta_arcana.png',
    elixir_blue: 'assets/icons_extra/elixir_blue.png',
    potion_hp_large: 'assets/icons_extra/potion_hp_large.png',
    tnt_icon: 'assets/icons_extra/tnt_icon.png',
    varita_arcana: 'assets/icons_extra/varita_arcana.png',
    cetro_vacio: FDA_BASE + '07_Items/Weapons/staff_legendary.png',
    // Extended Runes, Relics, Ores, Monster Drops, Equipment, Scrolls, Potions, Food & Beach Items
    rune_fire: FDA_BASE + '07_Items/Runes/rune_fire.png',
    rune_water: FDA_BASE + '07_Items/Runes/rune_water.png',
    rune_earth: FDA_BASE + '07_Items/Runes/rune_earth.png',
    rune_air: FDA_BASE + '07_Items/Runes/rune_air.png',
    rune_light: FDA_BASE + '07_Items/Runes/rune_light.png',
    rune_dark: FDA_BASE + '07_Items/Runes/rune_dark.png',
    rune_life: FDA_BASE + '07_Items/Runes/rune_life.png',
    rune_death: FDA_BASE + '07_Items/Runes/rune_death.png',
    coin_stack: FDA_BASE + '07_Items/Loot_Coins_Gems/coin_stack.png',
    gem_onyx: FDA_BASE + '07_Items/Loot_Coins_Gems/gem_onyx.png',
    gem_soul_gem: FDA_BASE + '07_Items/Loot_Coins_Gems/gem_soul_gem.png',
    loot_bag_large: FDA_BASE + '07_Items/Loot_Coins_Gems/loot_bag_large.png',
    loot_bag_purple: FDA_BASE + '07_Items/Loot_Coins_Gems/loot_bag_purple.png',
    obsidian_ore: 'assets/sprites_extra/stewv_obsidian.png',
    obsidian_bar: FDA_BASE + '07_Items/Ores_Bars/bar_obsidian.png',
    bat_wing: FDA_BASE + '07_Items/Monster_Drops/bat_wing.png',
    monster_claw: FDA_BASE + '07_Items/Monster_Drops/claw.png',
    golem_core: FDA_BASE + '07_Items/Monster_Drops/golem_core.png',
    spores: FDA_BASE + '07_Items/Monster_Drops/spores.png',
    black_feather: FDA_BASE + '07_Items/Monster_Drops/feather_black.png',
    ectoplasm: FDA_BASE + '07_Items/Monster_Drops/ectoplasm.png',
    skull_drop: FDA_BASE + '07_Items/Monster_Drops/skull.png',
    slime_blue: FDA_BASE + '07_Items/Monster_Drops/slime_gel_blue.png',
    slime_toxic: FDA_BASE + '07_Items/Monster_Drops/slime_gel_toxic.png',
    eye_monster: FDA_BASE + '07_Items/Monster_Drops/monster_eye.png',
    scale_blue: FDA_BASE + '07_Items/Monster_Drops/scale_blue.png',
    scale_green: FDA_BASE + '07_Items/Monster_Drops/scale_green.png',
    goblin_tooth: FDA_BASE + '07_Items/Monster_Drops/goblin_tooth.png',
    venom_sac: FDA_BASE + '07_Items/Monster_Drops/venom_sac.png',
    sting_scorpion: FDA_BASE + '07_Items/Monster_Drops/horn.png',
    heart_golem: FDA_BASE + '07_Items/Monster_Drops/fire_essence.png',
    relic_dragon_egg: FDA_BASE + '07_Items/Relics/dragon_egg.png',
    ring_diamond: FDA_BASE + '07_Items/Armor/ring_diamond.png',
    ring_amethyst: FDA_BASE + '07_Items/Armor/ring_amethyst.png',
    ring_soul: FDA_BASE + '07_Items/Armor/ring_soul_gem.png',
    ring_onyx: FDA_BASE + '07_Items/Armor/ring_onyx.png',
    amulet_onyx: FDA_BASE + '07_Items/Armor/amulet_onyx.png',
    amulet_soul: FDA_BASE + '07_Items/Armor/amulet_soul_gem.png',
    amulet_diamond: FDA_BASE + '07_Items/Armor/amulet_diamond.png',
    cloak_black: FDA_BASE + '07_Items/Armor/cloak_black.png',
    cloak_red: FDA_BASE + '07_Items/Armor/cloak_red.png',
    cloak_purple: FDA_BASE + '07_Items/Armor/cloak_purple.png',
    mage_hat_purple: FDA_BASE + '07_Items/Armor/mage_hat_purple.png',
    mage_hat_red: FDA_BASE + '07_Items/Armor/mage_hat_red.png',
    gloves_iron: FDA_BASE + '07_Items/Armor/gloves_iron.png',
    gloves_gold: FDA_BASE + '07_Items/Armor/gloves_gold.png',
    gloves_legendary: FDA_BASE + '07_Items/Armor/gloves_legendary.png',
    staff_gold: 'assets/icons_extra/staff_gold.png',
    staff_steel: FDA_BASE + '07_Items/Weapons/staff_steel.png',
    wand_gold: FDA_BASE + '07_Items/Weapons/wand_gold.png',
    wand_legendary: 'assets/icons_extra/wand_legendary.png',
    scroll_heal: FDA_BASE + '07_Items/Scrolls_Books/scroll_heal.png',
    scroll_lightning: FDA_BASE + '07_Items/Scrolls_Books/scroll_lightning.png',
    scroll_teleport: FDA_BASE + '07_Items/Scrolls_Books/scroll_teleport.png',
    scroll_identify: FDA_BASE + '07_Items/Scrolls_Books/scroll_identify.png',
    spellbook_arcane: FDA_BASE + '07_Items/Scrolls_Books/spellbook_arcane.png',
    spellbook_fire: FDA_BASE + '07_Items/Scrolls_Books/spellbook_fire.png',
    spellbook_holy: FDA_BASE + '07_Items/Scrolls_Books/spellbook_holy.png',
    spellbook_necro: FDA_BASE + '07_Items/Scrolls_Books/spellbook_necro.png',
    potion_invis: 'assets/icons_extra/potion_invis.png',
    potion_fire_res: 'assets/icons_extra/potion_fire_res.png',
    potion_frost: 'assets/icons_extra/potion_frost.png',
    potion_elixir: 'assets/icons_extra/potion_elixir.png',
    apple_red: FDA_BASE + '07_Items/Food/apple_red.png',
    apple_green: FDA_BASE + '07_Items/Food/apple_green.png',
    drumstick: FDA_BASE + '07_Items/Food/drumstick.png',
    fish_cooked: FDA_BASE + '07_Items/Food/fish_cooked.png',
    cheese_fda: FDA_BASE + '07_Items/Food/cheese.png',
    treasure_map_extra: 'assets/sprites_extra/items/treasure_map.png',
    msg_bottle_extra: 'assets/sprites_extra/items/msg_bottle.png',
    shell_extra: 'assets/sprites_extra/items/shell_scallop.png',
    crab_extra: 'assets/sprites_extra/items/sand_crab.png',
    // Curated Unique Swords, Shields, Food, StewV Geodes, Keys & Relics
    key_legendaria: 'assets/icons/key_legendaria.png',
    key_crimson: 'assets/icons/key_crimson.png',
    hourglass_relic: 'assets/icons/hourglass_relic.png',
    candle_arcane: 'assets/icons/candle_arcane.png',
    heart_crimson: 'assets/icons/heart_crimson.png',
    xp_orb: 'assets/icons/xp_orb.png',
    mana_orb: 'assets/icons/mana_orb.png',
    geode_amethyst: 'assets/sprites_extra/stewv_geode_amethyst.png',
    geode_gold: 'assets/sprites_extra/stewv_geode_gold.png',
    geode_emerald: 'assets/sprites_extra/stewv_geode_emerald.png',
    cluster_rose: 'assets/icons/cluster_rose.png',
    prism_imperial: 'assets/icons/prism_imperial.png',
    amulet_frost: 'assets/icons/amulet_frost.png',
    pendant_moon: 'assets/icons/pendant_moon.png',
    pendant_phoenix: 'assets/icons/pendant_phoenix.png',
    necklace_ruby: 'assets/icons/necklace_ruby.png',
    ring_astral: 'assets/icons/ring_astral.png',
    crown_sovereign: 'assets/icons/crown_sovereign.png',
    sword_flame: 'assets/sprites_extra/sword_flame.png',
    sword_frost: 'assets/sprites_extra/sword_frost.png',
    sword_thorn: 'assets/sprites_extra/sword_thorn.png',
    sword_solar: 'assets/sprites_extra/sword_solar.png',
    sword_moon: 'assets/sprites_extra/sword_moon.png',
    sword_prism: 'assets/sprites_extra/sword_prism.png',
    sword_rose: 'assets/sprites_extra/sword_rose.png',
    sword_void: 'assets/sprites_extra/sword_void.png',
    sword_volcanic: 'assets/sprites_extra/sword_volcanic.png',
    sword_venom: 'assets/sprites_extra/sword_venom.png',
    sword_sakura: 'assets/sprites_extra/sword_sakura.png',
    shield_phoenix: RAVEN_BASE + 'fb2140.png',
    shield_frost: RAVEN_BASE + 'fb2148.png',
    shield_royal: FDA_BASE + '07_Items/Armor/buckler_gold.png',
    shield_abyss: RAVEN_BASE + 'fb2142.png',
    shield_lion: RAVEN_BASE + 'fb2137.png',
    shield_emerald: RAVEN_BASE + 'fb2121.png',
    shield_solar_v2: FDA_BASE + '07_Items/Armor/buckler_legendary.png',
    food_cake_choco: 'assets/sprites_extra/food_cake_choco.png',
    food_cake_berry: 'assets/sprites_extra/food_cake_berry.png',
    food_cheesecake: 'assets/sprites_extra/food_cheesecake.png',
    food_boba_matcha: 'assets/sprites_extra/food_boba_matcha.png',
    food_boba_mango: 'assets/sprites_extra/food_boba_mango.png',
    food_boba_taro: 'assets/sprites_extra/food_boba_taro.png',
    food_espresso: 'assets/sprites_extra/food_espresso.png',
    food_cheese_gouda: 'assets/sprites_extra/food_cheese_gouda.png',
    food_ice_apple: 'assets/sprites_extra/food_ice_apple.png',
    food_tart_crimson: 'assets/sprites_extra/food_tart_crimson.png',
    food_waffle: 'assets/sprites_extra/food_waffle.png',
    food_sandwich: 'assets/sprites_extra/food_sandwich.png',
    village_grass_turf: 'assets/sprites_extra/village_grass_turf.png',
    village_cobble_path: 'assets/sprites_extra/village_cobble_path.png',
    village_planter_wood: 'assets/sprites_extra/village_planter_wood.png',
    village_stall: 'assets/sprites_extra/village_stall.png',
    village_house_red: 'assets/sprites_extra/village_house_red.png',
    // Extended Fruits+, Nature Free, ALL Weapons/Staffs/Hammers, MV Icons & Undead King
    manzana_roja: 'assets/icons_extra/manzana_roja.png',
    manzana_dorada: 'assets/icons_extra/manzana_dorada.png',
    uvas_misticas: 'assets/icons_extra/uvas_misticas.png',
    platano: 'assets/icons_extra/platano.png',
    naranja: 'assets/icons_extra/naranja.png',
    pera: 'assets/icons_extra/pera.png',
    pina: 'assets/icons_extra/pina.png',
    durazno: 'assets/icons_extra/durazno.png',
    granada: 'assets/icons_extra/granada.png',
    cereza: 'assets/icons_extra/cereza.png',
    arandano: 'assets/icons_extra/arandano.png',
    limon: 'assets/icons_extra/limon.png',
    kiwi: 'assets/icons_extra/kiwi.png',
    pitaya: 'assets/icons_extra/pitaya.png',
    coco: 'assets/icons_extra/coco.png',
    sandia: 'assets/icons_extra/sandia.png',
    fresa_plus: 'assets/icons_extra/fresa.png',
    chile_fuego: 'assets/icons_extra/chile_fuego.png',
    mora_silvestre: 'assets/icons_extra/mora_silvestre.png',
    aguacate: 'assets/icons_extra/aguacate.png',
    bellota: 'assets/icons_extra/bellota.png',
    miel_ambar: 'assets/icons_extra/miel_ambar.png',
    martillo_roble: 'assets/icons_extra/martillo_roble.png',
    martillo_esmeralda: 'assets/icons_extra/martillo_esmeralda.png',
    martillo_paladin: 'assets/icons_extra/martillo_paladin.png',
    martillo_cristal: 'assets/icons_extra/martillo_cristal.png',
    martillo_astronomico: 'assets/icons_extra/martillo_astronomico.png',
    espada_relampago: 'assets/icons_extra/espada_relampago.png',
    espada_ignea: 'assets/icons_extra/espada_ignea.png',
    espada_glacial: 'assets/icons_extra/espada_glacial.png',
    espada_solaris: 'assets/icons_extra/espada_solaris.png',
    espada_paladin: 'assets/icons_extra/espada_paladin.png',
    espada_tormenta: 'assets/icons_extra/espada_tormenta.png',
    espada_volcanica_v2: 'assets/icons_extra/espada_volcanica.png',
    espada_astral_v2: 'assets/icons_extra/espada_astral.png',
    hacha_doble_carmesi: 'assets/icons_extra/hacha_doble_carmesi.png',
    hacha_doble_astral: 'assets/icons_extra/hacha_doble_astral.png',
    baculo_rubi: 'assets/icons_extra/baculo_rubi.png',
    baculo_zafiro: 'assets/icons_extra/baculo_zafiro.png',
    baculo_esmeralda: 'assets/icons_extra/baculo_esmeralda.png',
    baculo_solaris: 'assets/icons_extra/baculo_solaris.png',
    lanza_solar: 'assets/icons_extra/lanza_solar.png',
    lanza_abismal: 'assets/icons_extra/lanza_abismal.png',
    elixir_vida: 'assets/icons_extra/elixir_vida.png',
    elixir_mana: 'assets/icons_extra/elixir_mana.png',
    medallon_solar: 'assets/icons_extra/medallon_solar.png',
    llave_maestra: 'assets/icons_extra/llave_maestra.png',
    orbe_zafiro: 'assets/icons_extra/orbe_zafiro.png',
    caliz_nebulosa: 'assets/icons_extra/caliz_nebulosa.png',
    botella_estelar: 'assets/icons_extra/botella_estelar.png',
    anillo_rubi: 'assets/icons_extra/anillo_rubi.png',
    anillo_plata_mv: 'assets/icons_extra/anillo_plata.png',
    cristal_nebulosa: 'assets/icons_extra/cristal_nebulosa.png',
    estofado_real_mv: 'assets/icons_extra/estofado_real.png',
    grimorio_arcano: 'assets/icons_extra/grimorio_arcano.png',
    talisman_meteoro: 'assets/icons_extra/talisman_meteoro.png',
    collar_oseo: 'assets/icons_extra/collar_oseo.png',
    ramo_rosa: 'assets/icons_extra/ramo_rosa.png',
    corona_rey_oseo: 'assets/icons_extra/corona_rey_oseo.png',
    spell_lightning: 'assets/icons_extra/spell_lightning.png',
    roble_milenario: 'assets/sprites_extra/prop_ancient_oak.png',
    fire_brazier: 'assets/sprites_extra/fire_brazier.png',
    butterfly_icon: 'assets/sprites_extra/butterfly_orange.png',
    pile_skulls: 'assets/sprites_extra/pile_skulls.png',
    ore_emerald: 'assets/icons_extra/ore_emerald.png',
    ore_cobalt: 'assets/icons_extra/ore_cobalt.png',
    ore_amethyst: 'assets/icons_extra/ore_amethyst.png',
    ore_ruby: 'assets/icons_extra/ore_ruby.png',
    silver_bar: 'assets/icons_extra/bar_silver.png',
    adamantite_bar: 'assets/icons_extra/bar_adamantite.png',
    algas: 'assets/icons_extra/algas.png',
    abono_dorado: 'assets/icons_extra/abono_dorado.png',
    compost_magico: 'assets/icons_extra/compost_magico.png',
    cofre_hundido: 'assets/sprites_extra/chest_sapphire_closed.png',

    // === FASE 5: HECHIZOS ACTIVOS (VerArc 16x16 Spells) ===
    spell_bola_fuego: VERARC_BASE + 'Spells/fire_spell.png',
    spell_lluvia_meteoros: VERARC_BASE + 'Spells/fire_spell_2.png',
    spell_nova_hielo: VERARC_BASE + 'Spells/ice_spell.png',
    spell_cadena_rayos: VERARC_BASE + 'Spells/lightning_spell.png',
    spell_curacion_sagrada: VERARC_BASE + 'Spells/healing_spell.png',
    spell_escudo_divino: VERARC_BASE + 'Spells/divine_protection_spell.png',
    spell_furia_arcana: VERARC_BASE + 'Spells/frenzy_spell_(critical_booster).png',
    spell_paso_etereo: VERARC_BASE + 'Spells/teleportation_spell.png',
    spell_espinas_tierra: VERARC_BASE + 'Spells/thorn_vine_spell.png',
    spell_espectro_aliado: VERARC_BASE + 'Spells/summoning_spell.png',
    spell_misil_arcano: VERARC_BASE + 'Spells/water_spell.png',
    spell_vacio_gravitacional: VERARC_BASE + 'Spells/counterspell.png',
    spell_destello_solar: VERARC_BASE + 'Spells/blinding_light_spell.png',
    spell_fortificacion: VERARC_BASE + 'Spells/fortify_spell.png',
    spell_drenaje_mana: VERARC_BASE + 'Spells/mana_replenish.png',
    spell_daga_veneno: VERARC_BASE + 'Spells/poison_dagger.png',
    spell_lluvia_minerales: VERARC_BASE + 'Spells/fortify_spell.png',
    spell_llamado_horda: VERARC_BASE + 'Spells/counterspell.png',
    spell_llamado_fauna: VERARC_BASE + 'Spells/summoning_spell.png',

    // === FASE 5: NUEVAS ARMAS, BÁCULOS, VARITAS Y ARQUETIPOS (UNIFICADO 32x32) ===
    dagger_iron: 'assets/icons_extra/dagger_iron.png',
    dagger_steel: 'assets/icons_extra/dagger_steel.png',
    dagger_gold: 'assets/icons_extra/dagger_gold.png',
    dagger_legendary: 'assets/icons_extra/dagger_legendary.png',
    battleaxe_iron: 'assets/icons_extra/battleaxe_iron.png',
    battleaxe_gold: 'assets/icons_extra/battleaxe_gold.png',
    battleaxe_legendary: 'assets/icons_extra/battleaxe_legendary.png',
    greatsword_iron: 'assets/icons_extra/greatsword_iron.png',
    greatsword_steel: 'assets/icons_extra/greatsword_steel.png',
    greatsword_gold: 'assets/icons_extra/greatsword_gold.png',
    greatsword_legendary: 'assets/icons_extra/greatsword_legendary.png',
    spear_iron_wep: 'assets/icons_extra/spear_iron_wep.png',
    spear_crimson: 'assets/icons_extra/spear_crimson.png',
    halberd_royal: 'assets/icons_extra/halberd_royal.png',
    mace_iron: 'assets/icons_extra/mace_iron.png',
    mace_steel: 'assets/icons_extra/mace_steel.png',
    mace_legendary: 'assets/icons_extra/mace_legendary.png',
    crossbow_wood: 'assets/icons_extra/crossbow_wood.png',
    crossbow_legendary: 'assets/icons_extra/crossbow_legendary.png',
    staff_druid: 'assets/icons_extra/staff_druid.png',
    staff_crescent: 'assets/icons_extra/staff_crescent.png',
    staff_ruby: 'assets/icons_extra/staff_ruby.png',
    wand_ruby: 'assets/icons_extra/wand_ruby.png',
    wand_frost: 'assets/icons_extra/wand_frost.png',

    // === FASE 5: GRIMORIOS, LLAVES DE MAZMORRA, EQUIPO Y RELIQUIAS ===
    spellbook_dark: FDA_BASE + '07_Items/Scrolls_Books/spellbook_dark.png',
    spellbook_lightning: FDA_BASE + '07_Items/Scrolls_Books/spellbook_lightning.png',
    spellbook_nature: FDA_BASE + '07_Items/Scrolls_Books/spellbook_nature.png',
    ancient_idol: FDA_BASE + '07_Items/Relics/ancient_idol.png',
    key_gold: FDA_BASE + '07_Items/Keys/key_gold.png',
    key_blue: FDA_BASE + '07_Items/Keys/key_blue.png',
    key_red: FDA_BASE + '07_Items/Keys/key_red.png',
    key_skeleton: FDA_BASE + '07_Items/Keys/key_skeleton.png',
    key_boss: FDA_BASE + '07_Items/Keys/key_boss.png',
    key_dungeon_master: FDA_BASE + '07_Items/Keys/key_dungeon_master.png',
    hat_mage_dark: RPG16_BASE + 'Item__52.png',
    hat_witch_arcane: RPG16_BASE + 'Item__53.png',
    armor_paladin_gold: RPG16_BASE + 'Item__59.png',
    helm_viking: RPG16_BASE + 'Item__47.png',
    ring_diamond_rpg: RPG16_BASE + 'Item__41.png',
    ring_emerald_rpg: RPG16_BASE + 'Item__43.png',
    pendant_star: RPG16_BASE + 'Item__33.png',
    pendant_skull: RPG16_BASE + 'Item__35.png',
    scroll_blue_sealed: RPG16_BASE + 'Item__36.png',
    scroll_red_sealed: RPG16_BASE + 'Item__37.png',
    tablet_stone: RPG16_BASE + 'Item__39.png',
    relic_chalice_gold: RPG16_BASE + 'Item__71.png',
    relic_frost_chest: 'assets/sprites_extra/dungeon/chest_frost_closed.png',
    relic_winged_orb: LEGENDS_BASE + 'image_part_007.png',
    relic_warhammer_totem: LEGENDS_BASE + 'image_part_010.png',
    relic_gauntlet_steel: LEGENDS_BASE + 'image_part_012.png',
    relic_ruby_band: LEGENDS_BASE + 'image_part_013.png',
    relic_sun_scepter: LEGENDS_BASE + 'image_part_014.png',
    relic_astrolabe: LEGENDS_BASE + 'image_part_015.png',
    relic_crimson_tome: LEGENDS_BASE + 'image_part_016.png',
    relic_crimson_phial: LEGENDS_BASE + 'image_part_017.png',
    relic_frost_phial: LEGENDS_BASE + 'image_part_018.png',
    relic_arcane_phial: LEGENDS_BASE + 'image_part_019.png',
    relic_abyss_pearl: LEGENDS_BASE + 'image_part_020.png',
    relic_prism_shard: LEGENDS_BASE + 'image_part_021.png',
    relic_solar_sphere: LEGENDS_BASE + 'image_part_023.png',
    relic_emerald_sphere: LEGENDS_BASE + 'image_part_024.png',
    relic_mystic_blossom: LEGENDS_BASE + 'image_part_028.png',
    relic_sun_medallion: LEGENDS_BASE + 'image_part_029.png',
    relic_crescent_star: LEGENDS_BASE + 'image_part_030.png',
    relic_earth_core: LEGENDS_BASE + 'image_part_031.png',
    relic_tidal_core: LEGENDS_BASE + 'image_part_032.png'
  };

  Balaclava.TOOL_PNG_MAP = {
    pico: {
      basica: 'assets/icons_extra/pico_basica.png',
      mejorada: 'assets/icons_extra/pico_mejorada.png',
      cobre: 'assets/icons_extra/pico_cobre.png',
      hierro: 'assets/icons_extra/pico_hierro.png',
      plata: 'assets/icons_extra/pico_plata.png',
      oro: 'assets/icons_extra/pico_oro.png',
      platino: 'assets/icons_extra/pico_platino.png',
      acero: 'assets/icons_extra/pico_acero.png',
      cristal: 'assets/icons_extra/pico_cristal.png',
      mitrilo: 'assets/icons_extra/pico_mitrilo.png',
      titanio: 'assets/icons_extra/pico_titanio.png',
      adamantita: 'assets/icons_extra/pico_adamantita.png',
      oricalco: 'assets/icons_extra/pico_oricalco.png',
      legendaria: 'assets/icons_extra/pico_legendaria.png',
      celestial: 'assets/icons_extra/pico_celestial.png'
    },
    hacha: {
      basica: 'assets/icons_extra/hacha_basica.png',
      mejorada: 'assets/icons_extra/hacha_mejorada.png',
      cobre: 'assets/icons_extra/hacha_cobre.png',
      hierro: 'assets/icons_extra/hacha_hierro.png',
      plata: 'assets/icons_extra/hacha_plata.png',
      oro: 'assets/icons_extra/hacha_oro.png',
      platino: 'assets/icons_extra/hacha_platino.png',
      acero: 'assets/icons_extra/hacha_acero.png',
      cristal: 'assets/icons_extra/hacha_cristal.png',
      mitrilo: 'assets/icons_extra/hacha_mitrilo.png',
      titanio: 'assets/icons_extra/hacha_titanio.png',
      adamantita: 'assets/icons_extra/hacha_adamantita.png',
      oricalco: 'assets/icons_extra/hacha_oricalco.png',
      legendaria: 'assets/icons_extra/hacha_legendaria.png',
      celestial: 'assets/icons_extra/hacha_celestial.png'
    },
    espada: {
      basica: 'assets/icons_extra/espada_basica.png',
      mejorada: 'assets/icons_extra/espada_mejorada.png',
      cobre: 'assets/icons_extra/espada_cobre.png',
      hierro: 'assets/icons_extra/espada_hierro.png',
      plata: 'assets/icons_extra/espada_plata.png',
      oro: 'assets/icons_extra/espada_oro.png',
      platino: 'assets/icons_extra/espada_platino.png',
      acero: 'assets/icons_extra/espada_acero.png',
      cristal: 'assets/icons_extra/espada_cristal.png',
      mitrilo: 'assets/icons_extra/espada_mitrilo.png',
      titanio: 'assets/icons_extra/espada_titanio.png',
      adamantita: 'assets/icons_extra/espada_adamantita.png',
      oricalco: 'assets/icons_extra/espada_oricalco.png',
      legendaria: 'assets/icons_extra/espada_legendaria.png',
      celestial: 'assets/icons_extra/espada_celestial.png'
    },
    pala: {
      basica: 'assets/icons_extra/pala_basica.png',
      mejorada: 'assets/icons_extra/pala_mejorada.png',
      cobre: 'assets/icons_extra/pala_cobre.png',
      hierro: 'assets/icons_extra/pala_hierro.png',
      plata: 'assets/icons_extra/pala_plata.png',
      oro: 'assets/icons_extra/pala_oro.png',
      platino: 'assets/icons_extra/pala_platino.png',
      acero: 'assets/icons_extra/pala_acero.png',
      cristal: 'assets/icons_extra/pala_cristal.png',
      mitrilo: 'assets/icons_extra/pala_mitrilo.png',
      titanio: 'assets/icons_extra/pala_titanio.png',
      adamantita: 'assets/icons_extra/pala_adamantita.png',
      oricalco: 'assets/icons_extra/pala_oricalco.png',
      legendaria: 'assets/icons_extra/pala_legendaria.png',
      celestial: 'assets/icons_extra/pala_celestial.png'
    },
    cana: {
      basica: 'assets/icons_extra/rod_01.png',
      mejorada: 'assets/icons_extra/rod_02.png',
      cobre: 'assets/icons_extra/rod_03.png',
      hierro: 'assets/icons_extra/rod_04.png',
      plata: 'assets/icons_extra/rod_05.png',
      oro: 'assets/icons_extra/rod_06.png',
      platino: 'assets/icons_extra/rod_07.png',
      acero: 'assets/icons_extra/rod_08.png',
      cristal: 'assets/icons_extra/rod_09.png',
      mitrilo: 'assets/icons_extra/rod_10.png',
      titanio: 'assets/icons_extra/rod_11.png',
      adamantita: 'assets/icons_extra/rod_12.png',
      oricalco: 'assets/icons_extra/rod_13.png',
      legendaria: 'assets/icons_extra/rod_14.png',
      celestial: 'assets/icons_extra/rod_15.png'
    },
    guadana: {
      basica: 'assets/icons_extra/guadana_basica.png',
      mejorada: 'assets/icons_extra/guadana_mejorada.png',
      cobre: 'assets/icons_extra/guadana_cobre.png',
      hierro: 'assets/icons_extra/guadana_hierro.png',
      plata: 'assets/icons_extra/guadana_plata.png',
      oro: 'assets/icons_extra/guadana_oro.png',
      platino: 'assets/icons_extra/guadana_platino.png',
      acero: 'assets/icons_extra/guadana_acero.png',
      cristal: 'assets/icons_extra/guadana_cristal.png',
      mitrilo: 'assets/icons_extra/guadana_mitrilo.png',
      titanio: 'assets/icons_extra/guadana_titanio.png',
      adamantita: 'assets/icons_extra/guadana_adamantita.png',
      oricalco: 'assets/icons_extra/guadana_oricalco.png',
      legendaria: 'assets/icons_extra/guadana_legendaria.png',
      celestial: 'assets/icons_extra/guadana_celestial.png'
    },
    arco: {
      basica: 'assets/icons_extra/arco_basica.png',
      mejorada: 'assets/icons_extra/arco_mejorada.png',
      cobre: 'assets/icons_extra/arco_cobre.png',
      hierro: 'assets/icons_extra/arco_hierro.png',
      plata: 'assets/icons_extra/arco_plata.png',
      oro: 'assets/icons_extra/arco_oro.png',
      platino: 'assets/icons_extra/arco_platino.png',
      acero: 'assets/icons_extra/arco_acero.png',
      cristal: 'assets/icons_extra/arco_cristal.png',
      mitrilo: 'assets/icons_extra/arco_mitrilo.png',
      titanio: 'assets/icons_extra/arco_titanio.png',
      adamantita: 'assets/icons_extra/arco_adamantita.png',
      oricalco: 'assets/icons_extra/arco_oricalco.png',
      legendaria: 'assets/icons_extra/arco_legendaria.png',
      celestial: 'assets/icons_extra/arco_celestial.png'
    },
    azada: {
      basica: 'assets/icons_extra/hoe_basic.png',
      mejorada: 'assets/icons_extra/hoe_mejorada.png',
      cobre: 'assets/icons_extra/hoe_cobre.png',
      hierro: 'assets/icons_extra/hoe_iron.png',
      plata: 'assets/icons_extra/hoe_plata.png',
      oro: 'assets/icons_extra/hoe_gold.png',
      platino: 'assets/icons_extra/hoe_platino.png',
      acero: 'assets/icons_extra/hoe_acero.png',
      cristal: 'assets/icons_extra/hoe_diamond.png',
      mitrilo: 'assets/icons_extra/hoe_mithril.png',
      titanio: 'assets/icons_extra/hoe_titanio.png',
      adamantita: 'assets/icons_extra/hoe_adamantita.png',
      oricalco: 'assets/icons_extra/hoe_oricalco.png',
      legendaria: 'assets/icons_extra/hoe_legendaria.png',
      celestial: 'assets/icons_extra/hoe_cosmic.png'
    }
  };

  Balaclava.SKILL_EXTRA_ICONS = {
    scroll_map: 'assets/icons/scroll_map.png',
    amulet_ruby: FDA_BASE + '07_Items/Armor/amulet_ruby.png',
    bow: RPG_ICON_BASE + 'Weapon & Tool/Bow.png',
    axe: FDA_BASE + '07_Items/Weapons/axe_iron.png',
    anvil: 'assets/icons/anvil.png',
    station_enchant: 'assets/sprites_extra/station_enchant.png',
    chest: 'assets/sprites_extra/chest_gold_closed.png',
    ectoplasma: FDA_BASE + '07_Items/Monster_Drops/ectoplasm.png',
    sun: 'assets/icons/sun.png',
    rune_pillar: 'assets/sprites_extra/rune_pillar.png',
    compass: FDA_BASE + '07_Items/Tools/compass.png',
    waypoint_white: 'assets/sprites_extra/waypoint_white.png',
    telar: 'assets/sprites_extra/bld_telar.png',
    plantacion: 'assets/sprites_extra/bld_plantacion.png',
    coin: 'assets/ui/coin_gold.png',
    sword: FDA_BASE + '07_Items/Weapons/sword_iron.png',
    lana: 'assets/icons/wool.png'
  };

  Balaclava.SKILL_ICON_POOL = [
    FDA_BASE + '08_UI/Skills/Icons/skill_haste.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_earthquake.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_regen.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_multishot.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_meteor.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_protect.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_heal.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_holy_light.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_shield_bash.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_revive.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_block.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_slash.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_whirlwind.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_flame_wave.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_berserk.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_trap.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_charge.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_thorns.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_fireball.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_arcane_missile.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_dodge.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_ice_spike.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_chain_lightning.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_frost_nova.png',
    FDA_BASE + '08_UI/Skills/Icons/skill_teleport.png'
  ];

  Balaclava.SKILL_ICON_URLS = {
    rec_1: Balaclava.SKILL_ICON_POOL[0], rec_2: Balaclava.SKILL_ICON_POOL[1],
    rec_3: Balaclava.SKILL_ICON_POOL[2], rec_4: Balaclava.SKILL_ICON_POOL[3], rec_5: Balaclava.SKILL_ICON_POOL[4],
    eco_1: Balaclava.SKILL_ICON_POOL[5], eco_2: Balaclava.SKILL_ICON_POOL[6],
    eco_3: Balaclava.SKILL_ICON_POOL[7], eco_4: Balaclava.SKILL_ICON_POOL[8], eco_5: Balaclava.SKILL_ICON_POOL[9],
    com_1: Balaclava.SKILL_ICON_POOL[10], com_2: Balaclava.SKILL_ICON_POOL[11],
    com_3: Balaclava.SKILL_ICON_POOL[12], com_4: Balaclava.SKILL_ICON_POOL[13], com_5: Balaclava.SKILL_ICON_POOL[14],
    pro_1: Balaclava.SKILL_ICON_POOL[15], pro_2: Balaclava.SKILL_ICON_POOL[16],
    pro_3: Balaclava.SKILL_ICON_POOL[17], pro_4: Balaclava.SKILL_ICON_POOL[18], pro_5: Balaclava.SKILL_ICON_POOL[19],
    exp_1: Balaclava.SKILL_ICON_POOL[20], exp_2: Balaclava.SKILL_ICON_POOL[21],
    exp_3: Balaclava.SKILL_ICON_POOL[22], exp_4: Balaclava.SKILL_ICON_POOL[23], exp_5: Balaclava.SKILL_ICON_POOL[24]
  };

  Balaclava.NPC_PORTRAIT_URLS = {
    eldrin: FDA_BASE + '06_NPCs/Portraits/old_sage_portrait_32x32.png',
    zara: FDA_BASE + '06_NPCs/Portraits/merchant_portrait_32x32.png',
    lyra: FDA_BASE + '06_NPCs/Portraits/alchemist_portrait_32x32.png',
    bjorn: FDA_BASE + '06_NPCs/Portraits/dwarf_trader_portrait_32x32.png',
    ignis: FDA_BASE + '06_NPCs/Portraits/wizard_portrait_32x32.png',
    kael: FDA_BASE + '06_NPCs/Portraits/blacksmith_portrait_32x32.png',
    selene: FDA_BASE + '06_NPCs/Portraits/priestess_portrait_32x32.png',
    doran: FDA_BASE + '06_NPCs/Portraits/miner_portrait_32x32.png'
  };

  Balaclava.NPC_SHEET_PATHS = {
    eldrin: FDA_BASE + '06_NPCs/old_sage_walk_idle_sheet.png',
    zara: FDA_BASE + '06_NPCs/merchant_walk_idle_sheet.png',
    lyra: FDA_BASE + '06_NPCs/alchemist_walk_idle_sheet.png',
    bjorn: FDA_BASE + '06_NPCs/dwarf_trader_walk_idle_sheet.png',
    ignis: FDA_BASE + '06_NPCs/wizard_walk_idle_sheet.png',
    kael: FDA_BASE + '06_NPCs/blacksmith_walk_idle_sheet.png',
    selene: FDA_BASE + '06_NPCs/priestess_walk_idle_sheet.png',
    doran: FDA_BASE + '06_NPCs/miner_walk_idle_sheet.png'
  };

  // Animated enemy sprite sheets
  Balaclava.ENEMY_SPRITE_PATHS = {
    slime:          { path: 'assets/sprites_extra/enemies/slime_green_48px_4f.png', kind: 'strip4', fw: 48, fh: 48, scale: 1.15 },
    golden_slime:   { path: 'assets/sprites_extra/enemies/slime_gold_48px_4f.png', kind: 'strip4', fw: 48, fh: 48, scale: 1.25, goldGlow: true },
    skeleton:       { path: 'assets/sprites_extra/enemies/skeleton_warrior_rogue_48px_4f.png', kind: 'strip4', fw: 48, fh: 48, scale: 1.18 },
    scorpion:       { path: FDA_BASE + '04_Enemies/scorpion/strips/scorpion_move_down_4f.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.3 },
    sand_ghoul:     { path: 'assets/sprites_extra/enemies/sandworm_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.55 },
    cobra:          { path: 'assets/sprites_extra/enemies/cobra_green_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.5 },
    bat:            { path: 'assets/sprites_extra/enemies/bat_horned_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.5 },
    vampire_bat:    { path: 'assets/sprites_extra/enemies/vampire_bat_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.55 },
    wisp:           { path: 'assets/sprites_extra/enemies/wisp_flame_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.5 },
    ghost:          { path: FDA_BASE + '04_Enemies/ghost/strips/ghost_move_down_4f.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.4 },
    spider:         { path: 'assets/sprites_extra/enemies/spider_fuzzy_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.5 },
    zombie:         { path: FDA_BASE + '04_Enemies/zombie/zombie_walk_idle_sheet.png', kind: 'sheet6x4', fw: 16, fh: 32, scale: 1.55 },
    mushroom_mob:   { path: 'assets/sprites_extra/enemies/mushroom_monster_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.5 },
    goblin:         { path: 'assets/sprites_extra/enemies/goblin_torch_red_48px_4f.png', kind: 'strip4', fw: 48, fh: 48, scale: 1.15 },
    goblin_tnt:     { path: 'assets/sprites_extra/goblin_tnt_4f.png', kind: 'strip4', fw: 64, fh: 64, scale: 1.15 },
    wolf:           { path: FDA_BASE + '04_Enemies/wolf/strips/wolf_move_down_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.6 },
    shadow_wolf:    { path: FDA_BASE + '04_Enemies/wolf_shadow/strips/wolf_shadow_move_down_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.75 },
    golem:          { path: FDA_BASE + '04_Enemies/golem_ice/strips/golem_ice_move_down_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.75 },
    rock_golem:     { path: FDA_BASE + '04_Enemies/golem_rock/strips/golem_rock_move_down_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.75 },
    magma:          { path: FDA_BASE + '04_Enemies/golem_lava/strips/golem_lava_move_down_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.85 },
    cultist:        { path: FDA_BASE + '04_Enemies/cultist/cultist_walk_idle_sheet.png', kind: 'sheet6x4', fw: 16, fh: 32, scale: 1.6 },
    fire_elem:      { path: 'assets/sprites_extra/enemies/wisp_flame_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.7 },
    rat:            { path: 'assets/sprites_extra/enemies/rat_gray_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.45 },
    rat_giant:      { path: 'assets/sprites_extra/enemies/rat_brown_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.75 },
    beetle:         { path: FDA_BASE + '04_Enemies/beetle/strips/beetle_move_down_4f.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.2 },
    beetle_fire:    { path: FDA_BASE + '04_Enemies/beetle_fire/strips/beetle_fire_move_down_4f.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.35 },
    imp:            { path: FDA_BASE + '04_Enemies/imp/strips/imp_move_down_4f.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.35 },
    orc:            { path: FDA_BASE + '04_Enemies/orc/orc_walk_idle_sheet.png', kind: 'sheet6x4', fw: 16, fh: 32, scale: 1.75 },
    mimic:          { path: FDA_BASE + '04_Enemies/mimic/strips/mimic_move_down_4f.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.4 },
    mushroom_purple:{ path: 'assets/sprites_extra/enemies/mushroom_purple_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.5 },
    skeleton_archer:{ path: 'assets/sprites_extra/enemies/skel_crossbowman_4f.png', kind: 'strip4', fw: 42, fh: 36, scale: 1.25 },
    skeleton_mage:  { path: 'assets/sprites_extra/enemies/skel_mage_unhooded_4f.png', kind: 'strip4', fw: 39, fh: 49, scale: 1.2 },
    goblin_shaman:  { path: FDA_BASE + '04_Enemies/goblin_shaman/goblin_shaman_walk_idle_sheet.png', kind: 'sheet6x4', fw: 16, fh: 32, scale: 1.6 },
    floating_eye:   { path: 'assets/sprites_extra/enemies/floating_eye_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.55 },
    cave_spider:    { path: 'assets/sprites_extra/enemies/cave_spider_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.55 },
    slime_toxic:    { path: 'assets/sprites_extra/enemies/slime_toxic_48px_4f.png', kind: 'strip4', fw: 48, fh: 48, scale: 1.2 },
    grave_revenant: { path: 'assets/packs/basic asset pack/basic asset pack/Basic Undead Animations/Grave Revenant/GraveRevenant.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.35 },
    royal_scarab:   { path: 'assets/packs/basic asset pack/basic asset pack/Basic Undead Animations/Royal Scarab/RoyalScarab.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.35 },
    toxic_hound:    { path: 'assets/packs/basic asset pack/basic asset pack/Basic Undead Animations/Toxic Hound/ToxicHound.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.35 },
    ghastly_eye:    { path: 'assets/sprites_extra/enemies/ghastly_eye_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.55 },
    brittle_archer: { path: 'assets/packs/basic asset pack/basic asset pack/Basic Undead Animations/Brittle Archer/BrittleArcher.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.35 },
    lava_ant:       { path: 'assets/packs/basic_asset_pack_v2/basic asset pack/Basic Vermin Animations/Lava Ant/LavaAnt.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.3 },
    acid_ant:       { path: 'assets/packs/basic_asset_pack_v2/basic asset pack/Basic Vermin Animations/Acid Ant/AcidAnt.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.3 },
    tunneling_mole: { path: 'assets/packs/basic_asset_pack_v2/basic asset pack/Basic Vermin Animations/Tunneling Mole/TunnelingMole.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.3 },
    plague_bat:     { path: 'assets/sprites_extra/enemies/plague_bat_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.55 },
    // === FASE 4/5: NUEVOS ENEMIGOS DE MAZMORRAS Y BIOMAS ===
    goblin_archer:  { path: 'assets/sprites_extra/enemies/ts_goblin_torch_blue_4f.png', kind: 'strip4', fw: 79, fh: 92, scale: 0.76 },
    ghost_spectral: { path: FDA_BASE + '04_Enemies/ghost_spectral/strips/ghost_spectral_move_down_4f.png', kind: 'strip4', fw: 16, fh: 16, scale: 2.4 },
    slime_blue:     { path: 'assets/sprites_extra/enemies/slime_blue_48px_4f.png', kind: 'strip4', fw: 48, fh: 48, scale: 1.15 },
    slime_red:      { path: 'assets/sprites_extra/enemies/slime_red_48px_4f.png', kind: 'strip4', fw: 48, fh: 48, scale: 1.15 },
    vine_snake:     { path: 'assets/sprites_extra/enemies/biter_plant_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.45 },
    wisp_green:     { path: 'assets/sprites_extra/enemies/wisp_green_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.5 },
    skel_swordsman: { path: 'assets/sprites_extra/enemies/skel_great_swordman_4f.png', kind: 'strip4', fw: 53, fh: 40, scale: 1.25 },
    skel_mage_dark: { path: 'assets/sprites_extra/enemies/skel_mage_unhooded_4f.png', kind: 'strip4', fw: 39, fh: 49, scale: 1.2 },
    skel_crossbow:  { path: 'assets/sprites_extra/enemies/skel_crossbowman_4f.png', kind: 'strip4', fw: 42, fh: 36, scale: 1.25 },
    skel_spearman:  { path: 'assets/sprites_extra/enemies/skel_spearman_4f.png', kind: 'strip4', fw: 44, fh: 42, scale: 1.25 },
    flaming_skull:  { path: 'assets/sprites_extra/enemies/skel_flaming_skull_4f.png', kind: 'strip4', fw: 20, fh: 32, scale: 1.65 },
    dark_lancer:    { path: 'assets/sprites_extra/enemies/ts_lancer_black_4f.png', kind: 'strip4', fw: 73, fh: 154, scale: 0.62 },
    goblin_barrel:  { path: 'assets/sprites_extra/enemies/ts_goblin_barrel_4f.png', kind: 'strip4', fw: 62, fh: 88, scale: 0.78 },
    goblin_sapper:  { path: 'assets/sprites_extra/enemies/bomb_walker_32px_4f.png', kind: 'strip4', fw: 32, fh: 32, scale: 1.45 },
    goblin_raider:  { path: 'assets/sprites_extra/enemies/ts_goblin_torch_blue_4f.png', kind: 'strip4', fw: 79, fh: 92, scale: 0.76 },
    crimson_jelly:  { path: 'assets/sprites_extra/enemies/slime_red_48px_4f.png', kind: 'strip4', fw: 48, fh: 48, scale: 1.15 },
    frost_jelly:    { path: 'assets/sprites_extra/enemies/slime_blue_48px_4f.png', kind: 'strip4', fw: 48, fh: 48, scale: 1.15 },
    void_jelly:     { path: 'assets/sprites_extra/enemies/slime_void_48px_4f.png', kind: 'strip4', fw: 48, fh: 48, scale: 1.2 }
  };

  // Dungeon boss sprites by dungeon id (~2x2 imposing scale across all 24 dungeons)
  Balaclava.BOSS_SPRITE_PATHS = {
    pradera:            { path: FDA_BASE + '05_Bosses/slime_king_48x48/slime_king_idle_4f.png', fw: 48, fh: 48, frames: 4, scale: 2.35 },
    pradera_profunda:   { path: 'assets/sprites_extra/boss_goblin_king_4f.png', fw: 64, fh: 76, frames: 4, scale: 1.78 },
    pradera_madriguera: { path: 'assets/sprites_extra/bosses/ts_goblin_warlord_4f.png', fw: 79, fh: 92, frames: 4, scale: 1.48 },
    pradera_baston:     { path: 'assets/sprites_extra/bosses/ts_warrior_red_4f.png', fw: 87, fh: 93, frames: 4, scale: 1.42 },
    pradera_bosquecillo:{ path: 'assets/sprites_extra/bosses/boss_guardian_silvestre_64px_4f.png', fw: 64, fh: 64, frames: 4, scale: 1.95 },
    desierto:           { path: 'assets/sprites_extra/bosses/boss_khepra_64px_4f.png', fw: 64, fh: 64, frames: 4, scale: 2.0 },
    desierto_piramide:  { path: 'assets/sprites_extra/boss_centurion_4f.png', fw: 48, fh: 60, frames: 4, scale: 1.95 },
    desierto_oasis:     { path: 'assets/sprites_extra/bosses/boss_sierpe_esmeralda_64px_4f.png', fw: 64, fh: 64, frames: 4, scale: 2.05 },
    desierto_catacumbas:{ path: 'assets/sprites_extra/bosses/skel_royal_guard_4f.png', fw: 42, fh: 57, frames: 4, scale: 2.15 },
    desierto_solario:   { path: 'assets/sprites_extra/bosses/ts_monk_purple_4f.png', fw: 62, fh: 73, frames: 4, scale: 1.65 },
    bosque_oscuro:      { path: FDA_BASE + '05_Bosses/lich_king_48x48/lich_king_idle_4f.png', fw: 48, fh: 48, frames: 4, scale: 2.35 },
    bosque_necro:       { path: 'assets/sprites_extra/boss_skeleton_king_4f.png', fw: 37, fh: 67, frames: 4, scale: 1.95 },
    bosque_laboratorio: { path: 'assets/sprites_extra/bosses/boss_automata_alquimico_64px_4f.png', fw: 64, fh: 64, frames: 4, scale: 1.95 },
    bosque_arana:       { path: 'assets/sprites_extra/bosses/boss_spider_empress_64px_4f.png', fw: 64, fh: 64, frames: 4, scale: 2.0 },
    bosque_pantano:     { path: 'assets/sprites_extra/bosses/boss_swamp_hydra_64px_4f.png', fw: 64, fh: 64, frames: 4, scale: 2.05 },
    montanas_heladas:   { path: FDA_BASE + '05_Bosses/dragon_frost_64x64/dragon_frost_idle_4f.png', fw: 64, fh: 64, frames: 4, scale: 2.15 },
    montanas_glaciar:   { path: 'assets/sprites_extra/boss_archmage_ice_4f.png', fw: 46, fh: 56, frames: 4, scale: 2.05 },
    montanas_mina:      { path: 'assets/sprites_extra/bosses/boss_diamond_golem_48px_4f.png', fw: 48, fh: 48, frames: 4, scale: 2.4 },
    montanas_fortaleza: { path: 'assets/sprites_extra/bosses/ts_warrior_black_4f.png', fw: 87, fh: 93, frames: 4, scale: 1.48 },
    tierras_volcanicas: { path: FDA_BASE + '05_Bosses/dragon_red_64x64/dragon_red_idle_4f.png', fw: 64, fh: 64, frames: 4, scale: 2.15 },
    volcan_abismo:      { path: FDA_BASE + '05_Bosses/demon_lord_48x48/demon_lord_idle_4f.png', fw: 48, fh: 48, frames: 4, scale: 2.5 },
    volcan_fragua:      { path: 'assets/sprites_extra/enemies/ts_lancer_black_4f.png', fw: 73, fh: 154, frames: 4, scale: 1.05 },
    volcan_caldera:     { path: 'assets/sprites_extra/bosses/boss_fenix_magmatico_64px_4f.png', fw: 64, fh: 64, frames: 4, scale: 2.05 },
    volcan_trono_ceniza:{ path: 'assets/sprites_extra/bosses/skel_great_maceman_4f.png', fw: 48, fh: 45, frames: 4, scale: 2.35 }
  };

  Balaclava.DUNGEON_GATE_PATHS = {
    // Bioma Pradera
    pradera:            'assets/sprites_extra/gate_pradera.png',
    pradera_profunda:   'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Red Buildings/Barracks.png',
    pradera_madriguera: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Factions/Goblins/Buildings/Wood_House/Goblin_House.png',
    pradera_baston:     'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Red Buildings/Tower.png',
    pradera_bosquecillo:'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Red Buildings/Monastery.png',

    // Bioma Desierto
    desierto:           'assets/sprites_extra/gate_desierto.png',
    desierto_piramide:  'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Castle.png',
    desierto_oasis:     'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Monastery.png',
    desierto_catacumbas:'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Barracks.png',
    desierto_solario:   'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Tower.png',

    // Bioma Bosque Oscuro
    bosque_oscuro:      'assets/sprites_extra/gate_bosque_oscuro.png',
    bosque_necro:       'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/Castle.png',
    bosque_laboratorio: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/Monastery.png',
    bosque_arana:       'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/Tower.png',
    bosque_pantano:     'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/Barracks.png',

    // Bioma Montañas Heladas
    montanas_heladas:   'assets/sprites_extra/gate_montanas_heladas.png',
    montanas_glaciar:   'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/Monastery.png',
    montanas_mina:      'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Resources/Gold Mine/GoldMine_Active.png',
    montanas_fortaleza: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/Castle.png',

    // Bioma Tierras Volcánicas
    tierras_volcanicas: 'assets/sprites_extra/gate_tierras_volcanicas.png',
    volcan_abismo:      'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Black Buildings/Castle.png',
    volcan_fragua:      'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Black Buildings/Barracks.png',
    volcan_caldera:     'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Black Buildings/Tower.png',
    volcan_trono_ceniza:'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Black Buildings/Monastery.png'
  };

  Balaclava.CHEST_SPRITE_PATHS = {
    wood_closed: 'assets/sprites_extra/chest_wood_closed.png',
    wood_open: 'assets/sprites_extra/chest_wood_open.png',
    gold_closed: 'assets/sprites_extra/chest_gold_closed.png',
    gold_open: 'assets/sprites_extra/chest_gold_open.png',
    sapphire_closed: 'assets/sprites_extra/chest_sapphire_closed.png',
    sapphire_open: 'assets/sprites_extra/chest_sapphire_open.png',
    skull_closed: 'assets/sprites_extra/chest_skull_closed.png',
    skull_open: 'assets/sprites_extra/chest_skull_open.png',
    frost_closed: 'assets/sprites_extra/dungeon/chest_frost_closed.png',
    frost_open: 'assets/sprites_extra/dungeon/chest_frost_open.png',
    crimson_closed: 'assets/sprites_extra/dungeon/chest_crimson_closed.png',
    crimson_open: 'assets/sprites_extra/dungeon/chest_crimson_open.png'
  };

  Balaclava.DUNGEON_TILE_PATHS = {
    // Shared props, animations & dark-fantasy masonry atlases
    rfMain: 'assets/packs/RF_Catacombs_v1.0/mainlevbuild.png',
    rfDeco: 'assets/packs/RF_Catacombs_v1.0/decorative.png',
    dtFree: 'assets/packs/DungeonTileset_Free/DungeonTileset/Tileset.png',
    carpetRedSheet: FDA_BASE + '01_Dungeon_Tiles/Carpets/carpet_red_over_stone_floor.png',
    carpetBlueSheet: FDA_BASE + '01_Dungeon_Tiles/Carpets/carpet_blue_over_stone_floor.png',
    carpetPurpleSheet: FDA_BASE + '01_Dungeon_Tiles/Carpets/carpet_purple_over_stone_floor.png',
    torch1: 'assets/packs/RF_Catacombs_v1.0/torch_1.png',
    torch2: 'assets/packs/RF_Catacombs_v1.0/torch_2.png',
    torch3: 'assets/packs/RF_Catacombs_v1.0/torch_3.png',
    torch4: 'assets/packs/RF_Catacombs_v1.0/torch_4.png',
    spike0: 'assets/packs/RF_Catacombs_v1.0/spike_0.png',
    spike4: 'assets/packs/RF_Catacombs_v1.0/spike_4.png',
    urn: FDA_BASE + '02_Props/Containers/pot_clay.png',
    urnGold: FDA_BASE + '02_Props/Containers/urn_gold.png',
    sarcophagus: FDA_BASE + '02_Props/Furniture/sarcophagus_closed_32x32.png',
    altarRitual: FDA_BASE + '02_Props/Altars_Shrines/altar_ritual_32x16_anim_6f.png',
    portalStairs: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Stairs/stairs_up.png',
    carpetRed: 'assets/sprites_extra/dungeon/carpet_crimson.png',
    carpetBlue: 'assets/sprites_extra/dungeon/carpet_frost.png',
    carpetPurple: 'assets/sprites_extra/dungeon/carpet_arcane.png',
    carpetSandstone: 'assets/sprites_extra/dungeon/carpet_sandstone.png',
    // Per-biome floors, walls & pillars (using staggered flagstones floor_2/floor_3 + full sheets)
    pradera_floor1: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_2.png',
    pradera_floor2: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_3.png',
    pradera_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/_floors_sheet.png',
    pradera_floorRune: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_rune.png',
    pradera_wall: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_mid.png',
    pradera_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_banner_green.png',
    pradera_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/_wall_faces_sheet_16x32.png',
    pradera_wallTop: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/wall_top_blob47.png',
    pradera_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_barred_closed.png',
    pradera_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_barred_open.png',
    pradera_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_stone_16x48.png',

    desierto_floor1: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_2.png',
    desierto_floor2: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_3.png',
    desierto_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/_floors_sheet.png',
    desierto_floorRune: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_rune.png',
    desierto_wall: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_mid.png',
    desierto_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_banner_red.png',
    desierto_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/_wall_faces_sheet_16x32.png',
    desierto_wallTop: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/wall_top_blob47.png',
    desierto_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_iron_closed.png',
    desierto_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_iron_open.png',
    desierto_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_cave_16x48.png',

    bosque_oscuro_floor1: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_2.png',
    bosque_oscuro_floor2: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_3.png',
    bosque_oscuro_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/_floors_sheet.png',
    bosque_oscuro_floorRune: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_rune.png',
    bosque_oscuro_wall: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_mid.png',
    bosque_oscuro_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_banner_purple.png',
    bosque_oscuro_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/_wall_faces_sheet_16x32.png',
    bosque_oscuro_wallTop: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/wall_top_blob47.png',
    bosque_oscuro_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_barred_closed.png',
    bosque_oscuro_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_barred_open.png',
    bosque_oscuro_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_crypt_16x48.png',

    montanas_heladas_floor1: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_2.png',
    montanas_heladas_floor2: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_3.png',
    montanas_heladas_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/_floors_sheet.png',
    montanas_heladas_floorRune: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Floors/floor_rune.png',
    montanas_heladas_wall: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/face_mid.png',
    montanas_heladas_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/face_banner_blue.png',
    montanas_heladas_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/_wall_faces_sheet_16x32.png',
    montanas_heladas_wallTop: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/wall_top_blob47.png',
    montanas_heladas_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/door_iron_closed.png',
    montanas_heladas_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Ice_Cavern/Walls/Faces_16x32/door_iron_open.png',
    montanas_heladas_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_ice_16x48.png',

    tierras_volcanicas_floor1: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_2.png',
    tierras_volcanicas_floor2: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_3.png',
    tierras_volcanicas_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/_floors_sheet.png',
    tierras_volcanicas_floorRune: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_rune.png',
    tierras_volcanicas_wall: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_mid.png',
    tierras_volcanicas_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_banner_red.png',
    tierras_volcanicas_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/_wall_faces_sheet_16x32.png',
    tierras_volcanicas_wallTop: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/wall_top_blob47.png',
    tierras_volcanicas_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_closed.png',
    tierras_volcanicas_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_open.png',
    tierras_volcanicas_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_lava_16x48.png',

    // Biome-specific lights, banners & statues inside Dungeons
    torch_green: FDA_BASE + '02_Props/Lights/wall_torch_green_anim_6f.png',
    torch_orange: FDA_BASE + '02_Props/Lights/wall_torch_orange_anim_6f.png',
    torch_purple: FDA_BASE + '02_Props/Lights/wall_torch_purple_anim_6f.png',
    torch_blue: FDA_BASE + '02_Props/Lights/wall_torch_blue_anim_6f.png',
    brazier_green: FDA_BASE + '02_Props/Lights/brazier_green_16x32_anim_6f.png',
    brazier_orange: FDA_BASE + '02_Props/Lights/brazier_orange_16x32_anim_6f.png',
    brazier_purple: FDA_BASE + '02_Props/Lights/brazier_purple_16x32_anim_6f.png',
    brazier_blue: FDA_BASE + '02_Props/Lights/brazier_blue_16x32_anim_6f.png',
    banner_green: FDA_BASE + '02_Props/Graves_Signs_Banners/banner_pole_green_16x32.png',
    banner_red: FDA_BASE + '02_Props/Graves_Signs_Banners/banner_pole_red_16x32.png',
    banner_purple: FDA_BASE + '02_Props/Graves_Signs_Banners/banner_pole_purple_16x32.png',
    banner_blue: FDA_BASE + '02_Props/Graves_Signs_Banners/banner_pole_blue_16x32.png',
    statue_knight: FDA_BASE + '02_Props/Statues_Pillars/statue_knight_16x32.png',
    statue_goddess: FDA_BASE + '02_Props/Statues_Pillars/statue_goddess_16x32.png',
    statue_gargoyle: FDA_BASE + '02_Props/Statues_Pillars/statue_gargoyle_16x32.png',
    statue_dragon: FDA_BASE + '02_Props/Statues_Pillars/statue_dragon_16x32.png',
    statue_sphinx: 'assets/packs/Ancient_Egypt/Back.png',
    pyr_banner_red: 'assets/sprites_extra/dungeon/pyr_banner_red.png',
    pyr_banner_black: 'assets/sprites_extra/dungeon/pyr_banner_black.png',
    desierto_piramide_floor1: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_2.png',
    desierto_piramide_floor2: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_3.png',
    desierto_piramide_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/_floors_sheet.png',
    desierto_piramide_floorRune: 'assets/sprites_extra/dungeon/pyr_lotus.png',
    desierto_piramide_wall: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_mid.png',
    desierto_piramide_wallBanner: 'assets/sprites_extra/dungeon/pyr_wall_banner.png',
    desierto_piramide_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/_wall_faces_sheet_16x32.png',
    desierto_piramide_wallTop: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/wall_top_blob47.png',
    desierto_piramide_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_gold_closed.png',
    desierto_piramide_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_gold_open.png',
    desierto_piramide_pillar: 'assets/sprites_extra/dungeon/pyr_pillar.png',

    // Sub-biome dungeon themes (Cave, Fire Zone, Arcane Lab, Necro Crypt)
    cave_floor1: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_2.png',
    cave_floor2: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_3.png',
    cave_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/_floors_sheet.png',
    cave_floorRune: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Floors/floor_rune.png',
    cave_wall: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_mid.png',
    cave_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/face_banner_red.png',
    cave_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/_wall_faces_sheet_16x32.png',
    cave_wallTop: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/wall_top_blob47.png',
    cave_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_iron_closed.png',
    cave_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Cave_Mine/Walls/Faces_16x32/door_iron_open.png',
    cave_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_cave_16x48.png',

    fire_zone_floor1: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_2.png',
    fire_zone_floor2: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_3.png',
    fire_zone_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/_floors_sheet.png',
    fire_zone_floorRune: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Floors/floor_rune.png',
    fire_zone_wall: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_mid.png',
    fire_zone_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/face_banner_red.png',
    fire_zone_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/_wall_faces_sheet_16x32.png',
    fire_zone_wallTop: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/wall_top_blob47.png',
    fire_zone_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_closed.png',
    fire_zone_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Lava_Temple/Walls/Faces_16x32/door_gold_open.png',
    fire_zone_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_lava_16x48.png',

    arcane_lab_floor1: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_2.png',
    arcane_lab_floor2: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_3.png',
    arcane_lab_floorsSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/_floors_sheet.png',
    arcane_lab_floorRune: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Floors/floor_rune.png',
    arcane_lab_wall: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_mid.png',
    arcane_lab_wallBanner: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/face_banner_purple.png',
    arcane_lab_wallSheet: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/_wall_faces_sheet_16x32.png',
    arcane_lab_wallTop: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/wall_top_blob47.png',
    arcane_lab_doorClosed: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_barred_closed.png',
    arcane_lab_doorOpen: FDA_BASE + '01_Dungeon_Tiles/Crypt_Catacombs/Walls/Faces_16x32/door_barred_open.png',
    arcane_lab_pillar: FDA_BASE + '02_Props/Statues_Pillars/pillar_crypt_16x48.png'
  };

  Balaclava.EXTRA_SPRITE_PATHS = {
    campfireAnim: FDA_BASE + '10_Overworld/Campsite/campfire_anim_6f.png',
    slashWhite: FDA_BASE + '09_Effects/Slashes/slash_white_medium_32_5f.png',
    slashFire: FDA_BASE + '09_Effects/Slashes/slash_fire_medium_32_5f.png',
    slashIce: FDA_BASE + '09_Effects/Slashes/slash_ice_medium_32_5f.png',
    slashDark: FDA_BASE + '09_Effects/Slashes/slash_dark_medium_32_5f.png',
    hitSpark: FDA_BASE + '09_Effects/Combat/hit_spark_4f.png',
    explosionSmall: FDA_BASE + '09_Effects/Explosions/explosion_small_32_7f.png',
    explosionLarge: FDA_BASE + '09_Effects/Explosions/explosion_large_48_8f.png',
    dynamiteAnim: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Factions/Goblins/Troops/TNT/Dynamite/Dynamite.png',
    tinyExplosion: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Effects/Explosion/Explosions.png',
    arcaneBlast: 'assets/misc/arcane_blast_strip.png',
    levelUpPillar: FDA_BASE + '09_Effects/Magic/level_up_pillar_32x64_8f.png',
    // Real artist crop growth & produce textures (Pixel_Gnome_Crops 4-stage + extended crops)
    crop_stage_0: 'assets/icons_extra/crop_stage_0.png',
    crop_stage_1: 'assets/icons_extra/crop_stage_1.png',
    crop_stage_2: 'assets/icons_extra/crop_stage_2.png',
    crop_trigo_s0: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/1 - Wheat Seed.png',
    crop_trigo_s1: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/2 - Wheat Sprout.png',
    crop_trigo_s2: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/3 - Wheat Mid.png',
    crop_trigo_s3: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/4 - Wheat Full.png',
    crop_tomate_s0: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/1 - Tomato Seed.png',
    crop_tomate_s1: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/2 - Tomato Sprout.png',
    crop_tomate_s2: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/3 - Tomato Mid.png',
    crop_tomate_s3: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/4 - Tomato Full.png',
    crop_calabaza_s0: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/1 - Pumpkin Seed.png',
    crop_calabaza_s1: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/2 - Pumpkin Sprout.png',
    crop_calabaza_s2: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/3 - Pumpkin Mid.png',
    crop_calabaza_s3: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/4 - Pumpkin Full.png',
    crop_papa_s0: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/1 - Potato Seed.png',
    crop_papa_s1: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/2 - Potato Sprout.png',
    crop_papa_s2: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/3 - Potato Mid.png',
    crop_papa_s3: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/4 - Potato Full.png',
    crop_trigo: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Wheat/4 - Wheat Full.png',
    crop_zanahoria_s0: 'assets/sprites_extra/crop_zanahoria_s0.png',
    crop_zanahoria_s1: 'assets/sprites_extra/crop_zanahoria_s1.png',
    crop_zanahoria_s2: 'assets/sprites_extra/crop_zanahoria_s2.png',
    crop_zanahoria_s3: 'assets/sprites_extra/crop_zanahoria_s3.png',
    crop_zanahoria: 'assets/icons/carrot.png',
    crop_calabaza: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Pumpkin/4 - Pumpkin Full.png',
    crop_papa: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Potato/4 - Potato Full.png',
    crop_flor_cristal_s0: 'assets/sprites_extra/crop_flor_cristal_s0.png',
    crop_flor_cristal_s1: 'assets/sprites_extra/crop_flor_cristal_s1.png',
    crop_flor_cristal_s2: 'assets/sprites_extra/crop_flor_cristal_s2.png',
    crop_flor_cristal_s3: 'assets/sprites_extra/crop_flor_cristal_s3.png',
    crop_flor_cristal: 'assets/icons_extra/flor_cristal.png',
    crop_tomate: 'assets/packs/Pixel_Gnome_Crops/SAMPLE PACK - Pixel Gnome Crop Pack/Individual Files/Tomato/4 - Tomato Full.png',
    crop_maiz_s0: 'assets/sprites_extra/crop_maiz_s0.png',
    crop_maiz_s1: 'assets/sprites_extra/crop_maiz_s1.png',
    crop_maiz_s2: 'assets/sprites_extra/crop_maiz_s2.png',
    crop_maiz_s3: 'assets/sprites_extra/crop_maiz_s3.png',
    crop_maiz: 'assets/icons_extra/corn.png',
    crop_berenjena_s0: 'assets/sprites_extra/crop_berenjena_s0.png',
    crop_berenjena_s1: 'assets/sprites_extra/crop_berenjena_s1.png',
    crop_berenjena_s2: 'assets/sprites_extra/crop_berenjena_s2.png',
    crop_berenjena_s3: 'assets/sprites_extra/crop_berenjena_s3.png',
    crop_berenjena: 'assets/icons_extra/eggplant.png',
    crop_chile_s0: 'assets/sprites_extra/crop_chile_s0.png',
    crop_chile_s1: 'assets/sprites_extra/crop_chile_s1.png',
    crop_chile_s2: 'assets/sprites_extra/crop_chile_s2.png',
    crop_chile_s3: 'assets/sprites_extra/crop_chile_s3.png',
    crop_chile: 'assets/icons_extra/chili.png',
    crop_fresa_s0: 'assets/sprites_extra/crop_fresa_s0.png',
    crop_fresa_s1: 'assets/sprites_extra/crop_fresa_s1.png',
    crop_fresa_s2: 'assets/sprites_extra/crop_fresa_s2.png',
    crop_fresa_s3: 'assets/sprites_extra/crop_fresa_s3.png',
    crop_fresa: 'assets/icons_extra/strawberry.png',
    crop_uva_s0: 'assets/sprites_extra/crop_uva_s0.png',
    crop_uva_s1: 'assets/sprites_extra/crop_uva_s1.png',
    crop_uva_s2: 'assets/sprites_extra/crop_uva_s2.png',
    crop_uva_s3: 'assets/sprites_extra/crop_uva_s3.png',
    crop_uva: 'assets/icons_extra/grapes.png',
    // Subtle movement & dash dust FX strips (Retro_Impact_Effects_3)
    walkDust: 'assets/misc/walk_dust_strip.png',
    dashDust: 'assets/misc/dash_dust_strip.png',
    // Ambient biome vegetation & ground details
    flora_tx_plant: 'assets/packs/Pixel Art Top Down - Basic v1.2.3/Texture/TX Plant.png',
    deco_shroom_1: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/01.png',
    deco_shroom_2: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/02.png',
    deco_shroom_3: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/03.png',
    deco_pebble_1: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/05.png',
    deco_bush_1: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/07.png',
    deco_bush_2: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/09.png',
    deco_fern_1: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/10.png',
    deco_fern_2: 'assets/packs/Tiny Swords/Tiny Swords (Update 010)/Deco/11.png',
    deco_dark_bush: 'assets/sprites_extra/deco_dark_bush.png',
    deco_berry_bush: 'assets/sprites_extra/deco_berry_bush.png',
    deco_thorn_bush: FDA_BASE + '10_Overworld/Dark_Forest/thorn_bush.png',
    deco_glow_shroom_b: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_glow_blue.png',
    deco_glow_shroom_g: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_glow_green.png',
    deco_shroom_p: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_purple.png',
    deco_shroom_r: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_red.png',
    // Real artist placeable blocks & furniture
    prop_bench: 'assets/sprites_extra/bench_wood.png',
    prop_lamppost: 'assets/sprites_extra/lamppost.png',
    prop_planter_wood: 'assets/sprites_extra/planter_wood.png',
    prop_fence: 'assets/sprites_extra/fence_wood.png',
    prop_cobble: 'assets/sprites_extra/cobble_tile.png',
    prop_cottage_orange: 'assets/sprites_extra/cottage_orange.png',
    prop_manor_blue: 'assets/sprites_extra/manor_blue.png',
    prop_crate: 'assets/sprites_extra/crate_wood.png',
    prop_barrel: 'assets/sprites_extra/barrel_wood.png',
    prop_angel: 'assets/sprites_extra/angel_statue.png',
    prop_rune_pillar: 'assets/sprites_extra/rune_pillar.png',
    prop_stone_block: 'assets/sprites_extra/stone_block.png',
    prop_well: 'assets/sprites_extra/stone_well.png',
    prop_bookshelf: 'assets/sprites_extra/bookshelf.png',
    prop_fireplace: 'assets/sprites_extra/fireplace.png',
    prop_banquet_table: 'assets/sprites_extra/banquet_table.png',
    // Fish shadows & live Pixel_Gnome_Fishing sprites for Fishing HUD & catches
    fish_shadow: 'assets/icons_extra/blue_fish.png',
    fish_rare_shadow: 'assets/icons_extra/yellow_fish.png',
    fish_anchoa: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Anchovy Outline.png',
    fish_pez_payaso: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Clownfish Outline.png',
    fish_cangrejo_dungeness: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Crab - Dungeness Outline.png',
    fish_pez_globo: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Pufferfish Outline.png',
    fish_pez_cirujano: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/A - Salt Water/Surgeonfish Outline.png',
    fish_pez_angel: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Angelfish Outline.png',
    fish_lubina: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Bass Outline.png',
    fish_bagre: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Catfish Outline.png',
    fish_pez_dorado: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Goldfish Outline.png',
    fish_carpa_dorada: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Goldfish Outline.png',
    fish_trucha_arcoiris: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Rainbow Trout Outline.png',
    fish_pez_comun: 'assets/packs/Pixel_Gnome_Fishing/SAMPLE PACK - Pixel Gnome Fishing Pack/B - Fresh Water/Rainbow Trout Outline.png',
    fish_pez_azul: 'assets/icons_extra/blue_fish.png',
    fish_anguila: 'assets/icons_extra/eel.png',
    fish_camaron: 'assets/icons_extra/shrimp.png',
    fish_medusa: 'assets/icons_extra/jellyfish.png',
    fish_pulpo: 'assets/icons_extra/octopus.png',
    fish_perla: 'assets/icons_extra/pearl.png',
    fish_gema_marina: FDA_BASE + '07_Items/Loot_Coins_Gems/gem_sapphire.png',
    fish_caracola_antigua: 'assets/icons_extra/shell.png',
    fish_pez_abismal: 'assets/icons/fish_dark.png',
    fish_pez_helado: 'assets/icons/fish_ice.png',
    fish_pez_lava: 'assets/icons/fish_lava.png',
    water_splash_fx: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Particle FX/Water Splash.png',
    water_ripple_sheet: 'assets/packs/Super_retro_water/Super_retro_world_water_animation/spritesheet_16x16_5frames.png',
    // Animated ocean water styles (4 clean light presets in Settings) + volcanic lava sprite
    water_anim: 'assets/tiles/water_clasico.png',
    water_clasico: 'assets/tiles/water_clasico.png',
    water_profundo: 'assets/tiles/water_profundo.png',
    water_esmeralda: 'assets/tiles/water_esmeralda.png',
    water_abisal: 'assets/tiles/water_abisal.png',
    lava_anim: 'assets/tiles/lava_anim.png',
    // VFX Free Pack multi-frame strips
    fx_vfx_elden_ring: 'assets/sprites_extra/fx_vfx_elden_ring.png',
    fx_vfx_explosion: 'assets/sprites_extra/fx_vfx_explosion.png',
    fx_vfx_magma: 'assets/sprites_extra/fx_vfx_magma.png',
    fx_vfx_shield: 'assets/sprites_extra/fx_vfx_shield.png',
    fx_vfx_puff: 'assets/sprites_extra/fx_vfx_puff.png',
    // Workstations (Furniture_Pack & ARPG Grajo)
    station_furnace: 'assets/sprites_extra/station_furnace.png',
    station_blast_furnace: 'assets/sprites_extra/station_blast_furnace.png',
    station_anvil: 'assets/sprites_extra/station_anvil.png',
    station_alchemy: 'assets/sprites_extra/station_alchemy.png',
    station_library: 'assets/sprites_extra/station_library.png',
    station_enchant: 'assets/sprites_extra/station_enchant.png',
    station_sawtable: 'assets/sprites_extra/station_sawtable.png',
    station_well_health: 'assets/sprites_extra/station_well_health.png',
    station_well_mana: 'assets/sprites_extra/station_well_mana.png',
    well_health_strip: 'assets/sprites_extra/well_health_strip.png',
    well_mana_strip: 'assets/sprites_extra/well_mana_strip.png',
    waypoint_white_strip: 'assets/sprites_extra/waypoint_white_strip.png',
    waypoint_dark_strip: 'assets/sprites_extra/waypoint_dark_strip.png',
    altar_amethyst: 'assets/sprites_extra/altar_amethyst.png',
    altar_volcano: 'assets/sprites_extra/altar_volcano.png',
    altar_emerald: 'assets/sprites_extra/altar_emerald.png',
    altar_blood: 'assets/sprites_extra/altar_blood.png',
    altar_sun: 'assets/sprites_extra/altar_sun.png',
    altar_arcane: 'assets/sprites_extra/altar_arcane.png',
    xp_orb: 'assets/icons/xp_orb.png',
    // Qoupys ROGNs crisp artist mineral & rock nodes (16x16)
    node_stone: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/stoneNode.png',
    node_coal: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/coalNode.png',
    node_copper: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/copperNode.png',
    node_tin: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/tinNode.png',
    node_iron: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/ironNode.png',
    node_gold: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/goldNode.png',
    node_jade: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/jadeNode.png',
    node_amethyst: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/amethystNode.png',
    node_bloodstone: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/bloodstoneNode.png',
    node_boulder: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/boulderNode.png',
    node_forge_stone: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/forgeStoneNode.png',
    node_keep_stone: 'assets/packs/Qoupys_ROGNs_Free/Individual_Sprites/Nodes/keepStoneNode.png',
    // Altars & Shrines (FDA Props)
    altar_shrine: FDA_BASE + '02_Props/Altars_Shrines/shrine_32x32_anim_4f.png',
    altar_ritual: FDA_BASE + '02_Props/Altars_Shrines/altar_ritual_32x16_anim_6f.png',
    altar_gold: FDA_BASE + '02_Props/Altars_Shrines/altar_gold_32x16.png',
    altar_dark: FDA_BASE + '02_Props/Altars_Shrines/altar_dark_32x16.png',
    altar_stone: FDA_BASE + '02_Props/Altars_Shrines/altar_stone_32x16.png',
    healing_fountain: FDA_BASE + '02_Props/Altars_Shrines/healing_fountain_32x32_anim_4f.png',
    ee_throne: FDA_BASE + '02_Props/Altars_Shrines/throne_32x32.png',
    ee_treasure: FDA_BASE + '02_Props/Altars_Shrines/treasure_pile_32x16.png',
    ee_well: FDA_BASE + '02_Props/Altars_Shrines/well_32x32.png',
    // MagicMarket Animated Easter Egg & World Details
    ee_cauldron: 'assets/packs/MagicMarket/MagicMarket/Background/Animations/Cauldron.png',
    ee_crystal: 'assets/packs/MagicMarket/MagicMarket/Background/Animations/Crystal.png',
    ee_device: 'assets/packs/MagicMarket/MagicMarket/Background/Animations/Device.png',
    ee_lantern: 'assets/packs/MagicMarket/MagicMarket/Background/Animations/Lantern.png',
    ee_log: 'assets/packs/MagicMarket/MagicMarket/Background/Animations/Log.png',
    ee_sword_legend: FDA_BASE + '07_Items/Weapons/sword_legendary.png',
    // Textured UI Island Purchase Plaques & Passive Fauna
    plaque_green: 'assets/ui/ms_btn_green_normal.png',
    plaque_gold: 'assets/ui/ms_btn_gold_normal.png',
    plaque_blue: 'assets/ui/ms_btn_blue_normal.png',
    plaque_red: 'assets/ui/ms_btn_red_normal.png',
    plaque_stone: 'assets/ui/ms_btn_stone_normal.png',
    plaque_wood: 'assets/ui/ms_btn_gold_normal.png',
    plaque_cocoa: 'assets/ui/ms_btn_stone_normal.png',
    rubber_duck: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Rubber Duck/Rubber duck.png',
    cactus_icon: 'assets/icons/cactus.png',
    // Textured Passive Animals (animated sprite sheets)
    cow_sheet: 'assets/packs/Pixel_Farm_Assets/Pixel Farm_Assets/PixelFarm_Cow-Sheet.png',
    sheep_pf_sheet: 'assets/packs/Pixel_Farm_Assets/Pixel Farm_Assets/PixelFarm_Sheep-Sheet.png',
    pig_sheet: 'assets/sprites_extra/animals/pig_sheet.png',
    rabbit_sheet: 'assets/sprites_extra/animals/rabbit_sheet.png',
    duck_sheet: 'assets/sprites_extra/animals/duck_sheet.png',
    // Textured Meteors, Volcanic Rocks, Mushrooms, Dig/Fish Spots & Specialized Buildings
    meteor_red: 'assets/sprites_extra/nodes/meteor_red.png',
    meteor_gold: 'assets/sprites_extra/nodes/meteor_gold.png',
    meteor_blue: 'assets/sprites_extra/nodes/meteor_blue.png',
    meteor_dark: 'assets/sprites_extra/nodes/meteor_dark.png',
    cave_rock_big: 'assets/sprites_extra/nodes/cave_rock_big.png',
    cave_mushroom_orange: 'assets/sprites_extra/nodes/cave_mushroom_orange.png',
    cave_mushroom_brown: 'assets/sprites_extra/nodes/cave_mushroom_brown.png',
    mushroom_blue_anim: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_glow_blue.png',
    mushroom_green_anim: FDA_BASE + '02_Props/Crystals_Nature/mushrooms_glow_green.png',
    dig_spot_x: 'assets/sprites_extra/nodes/dig_spot_x.png',
    fish_ripple: 'assets/sprites_extra/nodes/fish_ripple.png',
    corral_pen: 'assets/sprites_extra/nodes/corral_pen.png',
    Corral_Pen: 'assets/sprites_extra/nodes/corral_pen.png',
    fish_pond: 'assets/sprites_extra/nodes/fish_pond.png',
    Fish_Pond: 'assets/sprites_extra/nodes/fish_pond.png',
    garden_plot: 'assets/sprites_extra/nodes/garden_plot.png',
    Plot_Garden: 'assets/sprites_extra/nodes/garden_plot.png',
    Mercado_Stall: 'assets/sprites_extra/bld_mercado.png',
    Castle_Yellow: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Castle.png',
    Tower_Purple: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/Tower.png',
    Tablon_Logros: 'assets/sprites_extra/bld_tablon_logros.png',
    // Distinct building textures for all specialized buildings
    bld_molino: 'assets/sprites_extra/bld_molino.png',
    bld_telar: 'assets/sprites_extra/bld_telar.png',
    bld_cocina: 'assets/sprites_extra/bld_cocina.png',
    bld_casa_comercio: 'assets/sprites_extra/bld_casa_comercio.png',
    bld_tesoreria: 'assets/sprites_extra/bld_tesoreria.png',
    bld_plantacion: 'assets/sprites_extra/bld_plantacion.png',
    bld_granja: 'assets/sprites_extra/bld_granja.png',
    bld_laboratorio: 'assets/sprites_extra/bld_laboratorio.png',
    bld_taller_mecanico: 'assets/sprites_extra/bld_taller_mecanico.png',
    bld_centro_investigacion: 'assets/sprites_extra/bld_centro_investigacion.png',
    bld_santuario: 'assets/sprites_extra/bld_santuario.png',
    bld_taladro: 'assets/sprites_extra/bld_taladro.png',
    bld_aspersor: 'assets/sprites_extra/bld_aspersor.png',
    bld_invernadero: 'assets/sprites_extra/bld_invernadero.png',
    bld_colmena: 'assets/sprites_extra/bld_colmena.png',
    bld_ahumador: 'assets/sprites_extra/bld_ahumador.png',
    bld_cantera: 'assets/sprites_extra/bld_cantera.png',
    bld_muelle_pesca: 'assets/sprites_extra/bld_muelle_pesca.png',
    bld_balista: 'assets/sprites_extra/bld_balista.png',
    bld_faro_costero: 'assets/sprites_extra/bld_faro_costero.png',
    bld_muro_madera: 'assets/sprites_extra/bld_muro_madera.png',
    bld_jardin_mariposas: 'assets/sprites_extra/bld_jardin_mariposas.png',
    // Extended world nodes & biome crystal/mineral clusters
    node_herb_patch: 'assets/sprites_extra/nodes/node_herb_patch.png',
    node_wild_crop: 'assets/sprites_extra/nodes/node_wild_crop.png',
    node_cactus: 'assets/sprites_extra/nodes/node_cactus.png',
    node_sulfur: 'assets/sprites_extra/nodes/node_sulfur.png',
    node_silver: 'assets/sprites_extra/nodes/node_silver.png',
    node_platinum: 'assets/sprites_extra/nodes/node_platinum.png',
    node_malachite: 'assets/sprites_extra/nodes/node_malachite.png',
    node_star_sand: 'assets/sprites_extra/nodes/node_star_sand.png',
    node_amber: 'assets/sprites_extra/nodes/node_amber.png',
    node_titanium: 'assets/sprites_extra/nodes/node_titanium.png',
    node_obsidian: 'assets/sprites_extra/nodes/node_obsidian.png',
    node_magma_core: 'assets/sprites_extra/nodes/node_magma_core.png',
    node_adamantite: 'assets/sprites_extra/nodes/node_adamantite.png',
    node_orichalcum: 'assets/sprites_extra/nodes/node_orichalcum.png',
    node_emerald: 'assets/sprites_extra/nodes/node_emerald.png',
    node_diamond: 'assets/sprites_extra/nodes/node_diamond.png',
    node_ruby: 'assets/sprites_extra/nodes/node_ruby.png',
    node_sapphire: 'assets/sprites_extra/nodes/node_sapphire.png',
    node_mithril: 'assets/sprites_extra/nodes/node_mithril.png',
    node_azurite: 'assets/sprites_extra/nodes/node_azurite.png',
    node_ice_crystal: 'assets/sprites_extra/nodes/node_ice_crystal.png',
    node_abyssal_crystal: 'assets/sprites_extra/nodes/node_abyssal_crystal.png',
    // Animated Mini-Boss Champion Sprites (4 frames)
    miniboss_sword: 'assets/sprites_extra/miniboss_sword_4f.png',
    miniboss_mace: 'assets/sprites_extra/miniboss_mace_4f.png',
    miniboss_mage: 'assets/sprites_extra/miniboss_mage_4f.png',
    // Textured Projectiles (Player Arrows & Enemy Magic/Spells)
    proj_arrow: FDA_BASE + '04_Enemies/Projectiles/arrow_right_1f.png',
    proj_fireball: FDA_BASE + '04_Enemies/Projectiles/fireball_right_4f.png',
    proj_ice: FDA_BASE + '04_Enemies/Projectiles/ice_shard_right_4f.png',
    proj_dark: FDA_BASE + '04_Enemies/Projectiles/dark_orb_right_4f.png',
    proj_magic: FDA_BASE + '04_Enemies/Projectiles/magic_bolt_right_4f.png',
    proj_necro: FDA_BASE + '04_Enemies/Projectiles/necro_bolt_right_4f.png',
    proj_poison: FDA_BASE + '04_Enemies/Projectiles/poison_spit_right_4f.png',
    proj_bone: FDA_BASE + '04_Enemies/Projectiles/bone_throw_right_4f.png',
    proj_web: FDA_BASE + '04_Enemies/Projectiles/web_shot_right_4f.png',
    // Textured Crescent Slash FX & Village Props
    slash_strip_gold: 'assets/sprites_extra/slash_strip_gold.png',
    slash_strip_crimson: 'assets/sprites_extra/slash_strip_crimson.png',
    slash_strip_cyan: 'assets/sprites_extra/slash_strip_cyan.png',
    slash_strip_violet: 'assets/sprites_extra/slash_strip_violet.png',
    slash_strip_emerald: 'assets/sprites_extra/slash_strip_emerald.png',
    slash_strip_white: 'assets/sprites_extra/slash_strip_white.png',
    water_foam: 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Water Foam.png',
    village_grass_turf: 'assets/sprites_extra/village_grass_turf.png',
    village_cobble_path: 'assets/sprites_extra/village_cobble_path.png',
    village_fence: 'assets/sprites_extra/village_fence.png',
    village_bench: 'assets/sprites_extra/village_bench.png',
    village_lamppost: 'assets/sprites_extra/village_lamppost.png',
    village_planter_wood: 'assets/sprites_extra/village_planter_wood.png',
    village_stall: 'assets/sprites_extra/village_stall.png',
    village_house_red: 'assets/sprites_extra/village_house_red.png',
    village_house_blue: 'assets/sprites_extra/village_house_blue.png',
    fda_bar_frame: 'assets/ui/fda_bar_frame.png',
    fda_fill_hp: 'assets/ui/fda_fill_hp.png',
    fda_fill_mana: 'assets/ui/fda_fill_mana.png',
    fda_fill_xp: 'assets/ui/fda_fill_xp.png',
    // Level-Up Thunder FX, Nature Butterflies/Flora & Purple Undead Monument Props
    fx_thunder_strike: 'assets/sprites_extra/fx_thunder_strike.png',
    fx_thunder_splash: 'assets/sprites_extra/fx_thunder_splash.png',
    fx_level_ring: 'assets/sprites_extra/fx_level_ring.png',
    nat_leaf: 'assets/sprites_extra/nat_leaf.png',
    nat_flower: 'assets/sprites_extra/nat_flower.png',
    nat_mushroom: 'assets/sprites_extra/nat_mushroom.png',
    butterfly_orange: 'assets/sprites_extra/butterfly_orange.png',
    butterfly_blue: 'assets/sprites_extra/butterfly_blue.png',
    butterfly_violet: 'assets/sprites_extra/butterfly_violet.png',
    butterfly_gold: 'assets/sprites_extra/butterfly_gold.png',
    prop_ancient_oak: 'assets/sprites_extra/prop_ancient_oak.png',
    fire_brazier: 'assets/sprites_extra/fire_brazier.png',
    giant_skeleton_1: 'assets/sprites_extra/giant_skeleton_1.png',
    giant_skeleton_2: 'assets/sprites_extra/giant_skeleton_2.png',
    giant_skeleton_3: 'assets/sprites_extra/giant_skeleton_3.png',
    pile_skulls: 'assets/sprites_extra/pile_skulls.png',
    skull_door: 'assets/sprites_extra/skull_door.png',
    undead_crystal: 'assets/sprites_extra/undead_crystal.png',
    undead_grave: 'assets/sprites_extra/undead_grave.png',
    undead_dead_arm: 'assets/sprites_extra/undead_dead_arm.png',
    undead_dead_tree: 'assets/sprites_extra/undead_dead_tree.png',
    undead_bones: 'assets/sprites_extra/undead_bones.png',
    sky_nebula_blue: 'assets/ui/sky_nebula_blue.png',
    sky_nebula_purple: 'assets/ui/sky_nebula_purple.png',
    sky_starfield: 'assets/ui/sky_starfield.png',
    key_e: 'assets/ui/key_e.png',
    key_e_pressed: 'assets/ui/key_e_pressed.png',
    tilled_soil: 'assets/sprites_extra/tilled_soil.png',
    tilled_soil_wet: 'assets/sprites_extra/tilled_soil_wet.png',
    Mesa_Artesania: 'assets/sprites_extra/bld_mesa_artesania.png',
    bld_mesa_artesania: 'assets/sprites_extra/bld_mesa_artesania.png',
    bld_mesa_hechiceria: 'assets/sprites_extra/bld_mesa_hechiceria.png',
    bld_yunque_runico: 'assets/sprites_extra/bld_yunque_runico.png',
    bld_observatorio_astral: 'assets/sprites_extra/globe_stand.png',
    bld_torre_rayos: 'assets/sprites_extra/bld_pararrayos.png'
  };

  if (ROOT) {
    [Balaclava.UI_URLS, Balaclava.NPC_PORTRAIT_URLS, Balaclava.ITEM_PNG_MAP, Balaclava.BUFF_ICON_URLS].forEach(map => {
      if (!map) return;
      Object.keys(map).forEach(k => {
        map[k] = withRoot(map[k]);
      });
    });
  }

  const assets = Balaclava.Assets;
  if (!assets) return;

  assets.extraImages = {};
  assets.itemImages = {};
  assets.enemyImages = {};
  assets.bossImages = {};
  assets.npcSheets = {};
  assets.gateImages = {};
  assets.chestImages = {};
  assets.dungeonImages = {};

  function loadImg(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = encodeURI(withRoot(url));
    });
  }

  // Upgrade ground drop / canvas icon resolver to serve crisp loaded PNGs whenever available
  const origGetItemIconCanvas = assets.getItemIconCanvas.bind(assets);
  assets.getItemIconCanvas = function (iconType) {
    const mappedIcon = Balaclava.ITEMS && Balaclava.ITEMS[iconType] && Balaclava.ITEMS[iconType].icon;
    const img = assets.itemImages && (assets.itemImages[iconType] || (mappedIcon && assets.itemImages[mappedIcon]));
    if (img && img.complete && img.naturalWidth > 0) return img;
    return origGetItemIconCanvas(mappedIcon || iconType);
  };

  assets.loadExtraAssets = async function () {
    const jobs = [];
    const uniqueItemUrlCache = {};
    for (const [id, url] of Object.entries(Balaclava.ITEM_PNG_MAP)) {
      if (!url) continue;
      if (!uniqueItemUrlCache[url]) {
        uniqueItemUrlCache[url] = loadImg(url);
      }
      jobs.push(uniqueItemUrlCache[url].then(img => { if (img) assets.itemImages[id] = img; }));
    }
    if (Balaclava.ITEMS) {
      for (const it of Object.values(Balaclava.ITEMS)) {
        if (!it || !it.id || !it.icon || assets.itemImages[it.id]) continue;
        const url = Balaclava.ITEM_PNG_MAP[it.icon];
        if (!url) continue;
        if (!uniqueItemUrlCache[url]) uniqueItemUrlCache[url] = loadImg(url);
        jobs.push(uniqueItemUrlCache[url].then(img => { if (img && !assets.itemImages[it.id]) assets.itemImages[it.id] = img; }));
      }
    }
    for (const [id, meta] of Object.entries(Balaclava.ENEMY_SPRITE_PATHS)) {
      jobs.push(loadImg(meta.path).then(img => { if (img) assets.enemyImages[id] = img; }));
    }
    for (const [id, meta] of Object.entries(Balaclava.BOSS_SPRITE_PATHS)) {
      jobs.push(loadImg(meta.path).then(img => { if (img) assets.bossImages[id] = img; }));
    }
    for (const [id, url] of Object.entries(Balaclava.NPC_SHEET_PATHS)) {
      jobs.push(loadImg(url).then(img => { if (img) assets.npcSheets[id] = img; }));
    }
    for (const [id, url] of Object.entries(Balaclava.DUNGEON_GATE_PATHS)) {
      jobs.push(loadImg(url).then(img => { if (img) assets.gateImages[id] = img; }));
    }
    for (const [id, url] of Object.entries(Balaclava.CHEST_SPRITE_PATHS)) {
      jobs.push(loadImg(url).then(img => { if (img) assets.chestImages[id] = img; }));
    }
    for (const [id, url] of Object.entries(Balaclava.DUNGEON_TILE_PATHS)) {
      jobs.push(loadImg(url).then(img => { if (img) assets.dungeonImages[id] = img; }));
    }
    for (const [id, url] of Object.entries(Balaclava.EXTRA_SPRITE_PATHS)) {
      jobs.push(loadImg(url).then(img => { if (img) assets.extraImages[id] = img; }));
    }
    if (Balaclava.VFX_V2) {
      for (const [id, meta] of Object.entries(Balaclava.VFX_V2)) {
        if (!meta || !meta.path) continue;
        jobs.push(loadImg(meta.path).then(img => { if (img) assets.extraImages[id] = img; }));
      }
    }
    assets.preloadedIcons = assets.preloadedIcons || [];
    assets.preloadedUrls = assets.preloadedUrls || {};
    const preloadPool = [
      ...Object.values(Balaclava.TOOL_PNG_MAP || {}).flatMap(m => Object.values(m || {})),
      ...(Balaclava.SKILL_V2_ICONS || []),
      ...(Balaclava.SKILL_ICON_POOL || []),
      ...Object.values(Balaclava.SKILL_ICON_URLS || {}),
      ...Object.values(Balaclava.SKILL_EXTRA_ICONS || {}),
      ...Object.values(Balaclava.UI_URLS || {}),
      ...Object.values(Balaclava.BUFF_ICON_URLS || {}),
      ...Object.values(Balaclava.NPC_PORTRAIT_URLS || {}),
      'assets/icons/biome_pradera.png',
      'assets/icons/biome_desierto.png',
      'assets/icons/biome_bosque_oscuro.png',
      'assets/icons/biome_montanas_heladas.png',
      'assets/icons/biome_tierras_volcanicas.png',
      'assets/ui/ms_btn_blue_normal.png',
      'assets/ui/ms_btn_blue_hover.png',
      'assets/ui/ms_btn_green_normal.png',
      'assets/ui/ms_btn_green_hover.png',
      'assets/ui/ms_btn_gold_normal.png',
      'assets/ui/ms_btn_gold_hover.png',
      'assets/ui/ms_btn_red_normal.png',
      'assets/ui/ms_btn_red_hover.png',
      'assets/ui/ms_btn_stone_normal.png',
      'assets/ui/ms_btn_stone_hover.png',
      'assets/ui/ms_close_normal.png',
      'assets/ui/ms_close_hover.png',
      'assets/ui/ms_slider_track.png',
      'assets/ui/ms_slider_fill.png',
      'assets/ui/ms_slider_thumb.png'
    ];
    for (const rawUrl of preloadPool) {
      if (!rawUrl || typeof rawUrl !== 'string') continue;
      if (!uniqueItemUrlCache[rawUrl]) {
        uniqueItemUrlCache[rawUrl] = loadImg(rawUrl);
      }
      jobs.push(uniqueItemUrlCache[rawUrl].then(img => {
        if (img) {
          assets.preloadedIcons.push(img);
          assets.preloadedUrls[encodeURI(rawUrl)] = img;
          assets.preloadedUrls[encodeURI(withRoot(rawUrl))] = img;
        }
      }));
    }
    assets._extraTotal = Math.max(1, jobs.length);
    assets._extraLoaded = 0;
    const tracked = jobs.map(p => p.finally(() => { assets._extraLoaded++; }));
    await Promise.all(tracked);
  };

  assets.deferReady = true;
  const origLoadAll = assets.loadAll.bind(assets);
  assets.loadAll = async function () {
    const [ok] = await Promise.all([origLoadAll(), assets.loadExtraAssets()]);
    assets.buildBiomeCaches();
    assets.ready = true;
    return ok;
  };

  // Safe DOM icon helper using real transparent PNG assets (zero dataURL taint!).
  assets.createItemIconEl = function (iconType, size = 28) {
    const url = Balaclava.ITEM_PNG_MAP[iconType];
    if (url) {
      const img = document.createElement('img');
      img.src = encodeURI(withRoot(url));
      img.width = size;
      img.height = size;
      img.alt = iconType || 'item';
      img.className = 'pixel-img';
      img.style.width = size + 'px';
      img.style.height = size + 'px';
      img.draggable = false;
      return img;
    }
    const c = assets.getItemIconCanvas(iconType);
    const copy = document.createElement('canvas');
    copy.width = c.width;
    copy.height = c.height;
    copy.style.width = size + 'px';
    copy.style.height = size + 'px';
    copy.getContext('2d').drawImage(c, 0, 0);
    return copy;
  };

  assets.createToolIconEl = function (toolId, tierId = 'basica', size = 28) {
    const tierMap = Balaclava.TOOL_PNG_MAP[toolId];
    const url = tierMap && (tierMap[tierId] || tierMap.basica);
    if (url) {
      const img = document.createElement('img');
      img.src = encodeURI(withRoot(url));
      img.width = size;
      img.height = size;
      img.alt = toolId;
      img.className = 'pixel-img';
      img.style.width = size + 'px';
      img.style.height = size + 'px';
      img.draggable = false;
      if (tierId === 'legendaria') {
        img.style.filter = 'drop-shadow(0 0 3px rgba(255, 145, 0, 0.85))';
      } else if (tierId === 'celestial') {
        img.style.filter = 'drop-shadow(0 0 4px rgba(79, 195, 247, 0.9))';
      }
      return img;
    }
    const c = assets.getToolIconCanvas(toolId, tierId || 'basica');
    const copy = document.createElement('canvas');
    copy.width = c.width;
    copy.height = c.height;
    copy.style.width = size + 'px';
    copy.style.height = size + 'px';
    copy.getContext('2d').drawImage(c, 0, 0);
    return copy;
  };

  assets.createSkillIconEl = function (skillId, size = 32) {
    const sk = Balaclava.SKILLS && Balaclava.SKILLS[skillId];
    let url = null;
    if (sk && sk.grantSpell && Balaclava.SKILL_ICON_URLS[skillId]) {
      url = Balaclava.SKILL_ICON_URLS[skillId];
    } else if (Balaclava.SKILL_V2_ICONS && Balaclava.SKILL_V2_ICONS.length) {
      let h = 0;
      for (let i = 0; i < skillId.length; i++) h = (h * 33 + skillId.charCodeAt(i)) >>> 0;
      const bOff = sk && sk.branch ? (sk.branch.charCodeAt(0) * 7) : 0;
      url = Balaclava.SKILL_V2_ICONS[(h + bOff) % Balaclava.SKILL_V2_ICONS.length];
    } else {
      url = Balaclava.SKILL_ICON_URLS[skillId];
      if (!url && sk) {
        if (sk.icon && Balaclava.ITEM_PNG_MAP[sk.icon]) {
          url = Balaclava.ITEM_PNG_MAP[sk.icon];
        } else if (sk.icon && Balaclava.SKILL_EXTRA_ICONS && Balaclava.SKILL_EXTRA_ICONS[sk.icon]) {
          url = Balaclava.SKILL_EXTRA_ICONS[sk.icon];
        } else {
          let h = 0;
          for (let i = 0; i < skillId.length; i++) h = (h * 31 + skillId.charCodeAt(i)) >>> 0;
          const pool = Balaclava.SKILL_ICON_POOL || Object.values(Balaclava.SKILL_ICON_URLS);
          url = pool[h % pool.length];
        }
      }
    }
    if (url) {
      const img = document.createElement('img');
      img.src = encodeURI(withRoot(url));
      img.width = size;
      img.height = size;
      img.alt = skillId;
      img.className = 'pixel-img';
      img.style.width = size + 'px';
      img.style.height = size + 'px';
      img.draggable = false;
      return img;
    }
    return document.createElement('span');
  };

  assets.createNpcPortraitEl = function (npcId, size = 48) {
    const url = Balaclava.NPC_PORTRAIT_URLS[npcId];
    const img = document.createElement('img');
    img.src = encodeURI(url ? withRoot(url) : Balaclava.UI_URLS.avatarHero);
    img.width = size;
    img.height = size;
    img.alt = npcId;
    img.className = 'pixel-img portrait-img';
    img.style.width = size + 'px';
    img.style.height = size + 'px';
    img.draggable = false;
    return img;
  };

  assets._spriteThumbCache = {};
  assets._spriteThumbCanvasCache = {};

  assets.cropImageCanvas = function (cacheKey, img, sx = 0, sy = 0, sw = 0, sh = 0, size = 36) {
    if (!img || !img.complete || !(img.naturalWidth > 0 || img.width > 0)) return null;
    if (assets._spriteThumbCanvasCache[cacheKey]) return assets._spriteThumbCanvasCache[cacheKey];
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const w = Math.max(1, Math.min(iw - sx, sw || iw));
    const h = Math.max(1, Math.min(ih - sy, sh || ih));
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const aspect = w / Math.max(1, h);
    let dw = size - 2;
    let dh = dw / aspect;
    if (dh > size - 2) { dh = size - 2; dw = dh * aspect; }
    ctx.drawImage(img, sx, sy, w, h, Math.round((size - dw) / 2), Math.round((size - dh) / 2), Math.round(dw), Math.round(dh));
    assets._spriteThumbCanvasCache[cacheKey] = c;
    return c;
  };

  assets.cropImageUrl = function (cacheKey, img, sx = 0, sy = 0, sw = 0, sh = 0, size = 36) {
    if (Object.prototype.hasOwnProperty.call(assets._spriteThumbCache, cacheKey)) {
      return assets._spriteThumbCache[cacheKey] || null;
    }
    const c = assets.cropImageCanvas(cacheKey, img, sx, sy, sw, sh, size);
    if (!c) return null;
    // Guard toDataURL against tainted-canvas SecurityError when opened directly via file://
    try {
      const url = c.toDataURL('image/png');
      assets._spriteThumbCache[cacheKey] = url;
      return url;
    } catch (_) {
      assets._spriteThumbCache[cacheKey] = '';
      return null;
    }
  };

  function resolveThumbCrop(spec = {}) {
    if (!spec) return null;
    const ex = assets.extraImages || {};
    const ok = (im) => !!(im && (im.tagName === 'CANVAS' ? im.width > 0 : (im.complete && im.naturalWidth > 0)));
    const kind = spec.kind;

    if (kind === 'enemy') {
      if (spec.isBoss) {
        const bKey = String(spec.enemyType || '').replace(/^boss_/, '');
        const bMeta = Balaclava.BOSS_SPRITE_PATHS && Balaclava.BOSS_SPRITE_PATHS[bKey];
        const bImg = assets.bossImages && assets.bossImages[bKey];
        if (bMeta && ok(bImg)) {
          return { key: `boss:${bKey}`, img: bImg, sx: bMeta.sx || 0, sy: bMeta.sy || 0, sw: bMeta.sw || bMeta.fw, sh: bMeta.sh || bMeta.fh, size: 36 };
        }
      }
      const eType = spec.enemyType;
      const meta = Balaclava.ENEMY_SPRITE_PATHS && Balaclava.ENEMY_SPRITE_PATHS[eType];
      const eImg = assets.enemyImages && assets.enemyImages[eType];
      if (meta && ok(eImg)) {
        return { key: `enemy:${eType}`, img: eImg, sx: 0, sy: 0, sw: meta.fw || 32, sh: meta.fh || 32, size: 36 };
      }
      if (spec.sprite) {
        const sImg = assets.get(spec.sprite);
        if (ok(sImg)) {
          const fw = sImg.width > sImg.height ? sImg.height : sImg.width;
          return { key: `espr:${spec.sprite}`, img: sImg, sx: 0, sy: 0, sw: fw, sh: sImg.height, size: 36 };
        }
      }
      const fallbackUrl = Balaclava.ITEM_PNG_MAP && Balaclava.ITEM_PNG_MAP.espada_hierro;
      return fallbackUrl ? { url: encodeURI(withRoot(fallbackUrl)) } : null;
    }

    if (kind === 'animal') {
      const aKind = spec.animalKind || 'sheep';
      if (aKind === 'sheep') {
        const sh = assets.get('sheep_idle') || assets.get('sheep_move');
        if (ok(sh)) return { key: 'animal:sheep', img: sh, sx: 0, sy: 0, sw: 128, sh: 128, size: 36 };
      } else if (aKind === 'vaca' && ok(ex.cow_sheet)) {
        return { key: 'animal:vaca', img: ex.cow_sheet, sx: 0, sy: 0, sw: 32, sh: 32, size: 36 };
      } else if (aKind === 'cerdo' && ok(ex.pig_sheet)) {
        return { key: 'animal:cerdo', img: ex.pig_sheet, sx: 0, sy: 0, sw: 32, sh: 32, size: 36 };
      } else if (aKind === 'conejo' && ok(ex.rabbit_sheet)) {
        return { key: 'animal:conejo', img: ex.rabbit_sheet, sx: 0, sy: 0, sw: 32, sh: 32, size: 36 };
      } else if (aKind === 'pato') {
        if (ok(ex.duck_sheet)) return { key: 'animal:pato_s', img: ex.duck_sheet, sx: 0, sy: 0, sw: 32, sh: 32, size: 36 };
        if (ok(ex.rubber_duck)) return { key: 'animal:pato_r', img: ex.rubber_duck, sx: 0, sy: 0, sw: 32, sh: 32, size: 36 };
      }
      const lanaUrl = Balaclava.ITEM_PNG_MAP && (Balaclava.ITEM_PNG_MAP.wool || Balaclava.ITEM_PNG_MAP.lana);
      return lanaUrl ? { url: encodeURI(withRoot(lanaUrl)) } : null;
    }

    if (kind === 'npc') {
      const nUrl = Balaclava.NPC_PORTRAIT_URLS && Balaclava.NPC_PORTRAIT_URLS[spec.npcId];
      if (nUrl) return { url: encodeURI(withRoot(nUrl)) };
      const sheet = assets.npcSheets && assets.npcSheets[spec.npcId];
      if (ok(sheet)) {
        return { key: `npc:${spec.npcId}`, img: sheet, sx: 0, sy: 0, sw: Math.round(sheet.width / 6) || 16, sh: Math.round(sheet.height / 4) || 32, size: 36 };
      }
      return { url: encodeURI(withRoot(Balaclava.UI_URLS.avatarHero)) };
    }

    if (kind === 'building') {
      const bDef = Balaclava.BUILDINGS && Balaclava.BUILDINGS[spec.buildingType];
      if (bDef) {
        if (bDef.sprite === 'Campfire_Anim' && ok(ex.campfireAnim)) {
          return { key: 'bld:campfire', img: ex.campfireAnim, sx: 0, sy: 0, sw: 16, sh: ex.campfireAnim.height, size: 36 };
        }
        if (bDef.sprite === 'Bridge_Tile') {
          const brImg = assets.get('bridge');
          if (ok(brImg)) return { key: 'bld:bridge_tile', img: brImg, sx: 64, sy: 0, sw: 64, sh: 64, size: 36 };
        }
        const extraMap = { Corral_Pen: 'corral_pen', Fish_Pond: 'fish_pond', Plot_Garden: 'garden_plot' };
        const bImg = assets.getBuildingImg(bDef.sprite) || (extraMap[bDef.sprite] ? ex[extraMap[bDef.sprite]] : ex[bDef.sprite]);
        if (ok(bImg)) return { key: `bld:${spec.buildingType}`, img: bImg, sx: 0, sy: 0, sw: bImg.width, sh: bImg.height, size: 36 };
        if (bDef.opensPanel === 'market') return { url: encodeURI(withRoot(Balaclava.UI_URLS.iconCoin || Balaclava.ITEM_PNG_MAP.oro || 'assets/ui/coin_gold.png')) };
      }
      return null;
    }

    if (kind === 'gate') {
      const gImg = assets.gateImages && assets.gateImages[spec.dungeonId];
      if (ok(gImg)) return { key: `gate:${spec.dungeonId}`, img: gImg, sx: 0, sy: 0, sw: gImg.width, sh: gImg.height, size: 36 };
      return null;
    }

    if (kind === 'altar') {
      const aDef = Balaclava.ALTAR_DEFS && Balaclava.ALTAR_DEFS[spec.altarId];
      const aImg = (aDef && ex[aDef.spriteKey]) || ex.altar_shrine;
      if (ok(aImg)) {
        const fw = aImg.width >= aImg.height * 3 ? aImg.height : aImg.width;
        return { key: `altar:${spec.altarId}`, img: aImg, sx: 0, sy: 0, sw: fw, sh: aImg.height, size: 36 };
      }
      return null;
    }

    if (kind === 'easter_egg') {
      const eDef = Balaclava.EASTER_EGG_DEFS && Balaclava.EASTER_EGG_DEFS[spec.eeId];
      const eImg = eDef && (ex[eDef.spriteKey] || ex[eDef.baseSprite]);
      if (ok(eImg)) {
        const sk = eDef.spriteKey;
        const fw = (sk === 'ee_crystal' || sk === 'ee_device') ? 32 : (sk === 'ee_cauldron' ? 16 : (eImg.width >= eImg.height * 2 ? eImg.height : eImg.width));
        return { key: `ee:${spec.eeId}`, img: eImg, sx: 0, sy: 0, sw: fw, sh: eImg.height, size: 36 };
      }
      return null;
    }

    if (kind === 'chest') {
      const ch = assets.chestImages && (assets.chestImages.gold_closed || assets.chestImages.oak_closed);
      if (ok(ch)) return { key: 'node:chest', img: ch, sx: 0, sy: 0, sw: ch.width, sh: ch.height, size: 36 };
    }
    if (kind === 'secret_chest') {
      const ch = assets.chestImages && (assets.chestImages.sapphire_closed || assets.chestImages.gold_closed);
      if (ok(ch)) return { key: 'node:secret_chest', img: ch, sx: 0, sy: 0, sw: ch.width, sh: ch.height, size: 36 };
    }
    if (kind === 'puzzle_pillar' && ok(ex.prop_rune_pillar)) {
      return { key: 'node:puzzle_pillar', img: ex.prop_rune_pillar, sx: 0, sy: 0, sw: ex.prop_rune_pillar.width, sh: ex.prop_rune_pillar.height, size: 36 };
    }
    if (kind === 'bone_totem' && ok(ex.bone_totem || ex.prop_skull_pillar)) {
      const im = ex.bone_totem || ex.prop_skull_pillar;
      return { key: 'node:bone_totem', img: im, sx: 0, sy: 0, sw: im.width, sh: im.height, size: 36 };
    }
    if (kind === 'skeleton_king_shrine' && ok(ex.giant_skeleton_1)) {
      return { key: 'node:sk_shrine', img: ex.giant_skeleton_1, sx: 0, sy: 0, sw: ex.giant_skeleton_1.width, sh: ex.giant_skeleton_1.height, size: 36 };
    }
    return null;
  }

  assets.getSpriteThumbUrl = function (spec = {}) {
    const info = resolveThumbCrop(spec);
    if (!info) return null;
    if (info.url) return info.url;
    return assets.cropImageUrl(info.key, info.img, info.sx, info.sy, info.sw, info.sh, info.size);
  };

  assets.getSpriteThumbCanvas = function (spec = {}) {
    const info = resolveThumbCrop(spec);
    if (!info || !info.img) return null;
    return assets.cropImageCanvas(info.key, info.img, info.sx, info.sy, info.sw, info.sh, info.size);
  };
})();
