(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  const BASE = window.BALACLAVA_ASSET_BASE || 'assets/packs/';
  const ROOT = window.BALACLAVA_ROOT_BASE || '';
  const PATHS = {
    pawn_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Pawn/Pawn_Idle.png',
    pawn_run: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Pawn/Pawn_Run.png',
    pawn_axe: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Pawn/Pawn_Interact Axe.png',
    pawn_pick: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Pawn/Pawn_Interact Pickaxe.png',
    pawn_hammer: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Pawn/Pawn_Interact Hammer.png',
    pawn_knife: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Pawn/Pawn_Interact Knife.png',

    // Black Pawn (Pícaro Sombrío con herramientas)
    pawn_black_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Black Units/Pawn/Pawn_Idle.png',
    pawn_black_run: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Black Units/Pawn/Pawn_Run.png',
    pawn_black_axe: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Black Units/Pawn/Pawn_Interact Axe.png',
    pawn_black_pick: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Black Units/Pawn/Pawn_Interact Pickaxe.png',
    pawn_black_knife: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Black Units/Pawn/Pawn_Interact Knife.png',
    pawn_black_hammer: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Black Units/Pawn/Pawn_Interact Hammer.png',

    // Yellow Pawn (Nómada del Desierto con herramientas)
    pawn_yellow_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Pawn/Pawn_Idle.png',
    pawn_yellow_run: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Pawn/Pawn_Run.png',
    pawn_yellow_axe: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Pawn/Pawn_Interact Axe.png',
    pawn_yellow_pick: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Pawn/Pawn_Interact Pickaxe.png',
    pawn_yellow_knife: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Pawn/Pawn_Interact Knife.png',
    pawn_yellow_hammer: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Pawn/Pawn_Interact Hammer.png',

    // Red Pawn (Explorador Carmesí con herramientas)
    pawn_red_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Red Units/Pawn/Pawn_Idle.png',
    pawn_red_run: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Red Units/Pawn/Pawn_Run.png',
    pawn_red_axe: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Red Units/Pawn/Pawn_Interact Axe.png',
    pawn_red_pick: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Red Units/Pawn/Pawn_Interact Pickaxe.png',
    pawn_red_knife: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Red Units/Pawn/Pawn_Interact Knife.png',
    pawn_red_hammer: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Red Units/Pawn/Pawn_Interact Hammer.png',
    archer_red_shoot: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Red Units/Archer/Archer_Shoot.png',

    // Archer Black (Ranger Sombrío)
    archer_black_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Black Units/Archer/Archer_Idle.png',
    archer_black_run: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Black Units/Archer/Archer_Run.png',
    archer_black_shoot: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Black Units/Archer/Archer_Shoot.png',

    // Archer Yellow (Cazador del Desierto)
    archer_yellow_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Archer/Archer_Idle.png',
    archer_yellow_run: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Archer/Archer_Run.png',
    archer_yellow_shoot: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Archer/Archer_Shoot.png',

    // Archer Blue (Arquero Explorador)
    archer_blue_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Idle.png',
    archer_blue_run: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Run.png',
    archer_blue_shoot: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Shoot.png',

    // Monk Yellow (Monje Místico)
    monk_yellow_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Monk/Idle.png',
    monk_yellow_run: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Monk/Run.png',
    monk_yellow_heal: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Yellow Units/Monk/Heal.png',

    // Warrior (Caballero)
    warrior_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Idle.png',
    warrior_run: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Run.png',
    warrior_atk: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Attack1.png',
    warrior_atk1: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Attack1.png',
    warrior_atk2: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Attack2.png',
    warrior_combat: BASE + 'Tiny Swords/Tiny Swords (Update 010)/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png',

    archer_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Idle.png',
    archer_shoot: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Shoot.png',
    arrow: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Arrow.png',

    tile_1: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Tilemap_color1.png',
    tile_2: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Tilemap_color2.png',
    tile_5: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Tilemap_color5.png',
    tile_flat: BASE + 'Tiny Swords/Tiny Swords (Update 010)/Terrain/Ground/Tilemap_Flat.png',
    water_bg: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Water Background color.png',
    water_foam: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Water Foam.png',
    bridge: BASE + 'Tiny Swords/Tiny Swords (Update 010)/Terrain/Bridge/Bridge_All.png',

    tree1: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree1.png',
    tree2: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree2.png',
    tree3: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree3.png',
    tree4: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree4.png',
    bush1: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Bushes/Bushe1.png',
    bush2: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Bushes/Bushe2.png',
    rock1: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock1.png',
    rock2: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock2.png',
    rock3: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock3.png',
    gold1: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Gold/Gold Stones/Gold Stone 1.png',
    gold2: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Gold/Gold Stones/Gold Stone 2.png',
    sheep_idle: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Meat/Sheep/Sheep_Idle.png',
    sheep_move: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Meat/Sheep/Sheep_Move.png',

    b_house1_blue: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/House1.png',
    b_house2_blue: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/House2.png',
    b_house3_blue: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/House3.png',
    b_castle_blue: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/Castle.png',
    b_barracks_blue: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/Barracks.png',
    b_monastery_blue: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/Monastery.png',
    b_tower_blue: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/Tower.png',

    b_house1_red: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Red Buildings/House1.png',
    b_house2_red: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Red Buildings/House2.png',
    b_castle_red: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Red Buildings/Castle.png',
    b_house1_yellow: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/House1.png',
    b_house2_yellow: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/House2.png',
    b_house3_yellow: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/House3.png',
    b_tower_yellow: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Tower.png',
    b_castle_yellow: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Castle.png',
    b_archery_yellow: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Archery.png',

    b_monastery_purple: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/Monastery.png',
    b_house3_purple: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/House3.png',
    b_castle_purple: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/Castle.png',
    b_tower_purple: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/Tower.png',
    b_tower_black: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Black Buildings/Tower.png',
    b_mercado_stall: ROOT + 'assets/sprites_extra/bld_mercado.png',
    b_mesa_encantamientos: ROOT + 'assets/sprites_extra/bld_mesa_encantamientos.png',
    b_mesa_artesania: ROOT + 'assets/sprites_extra/bld_mesa_artesania.png',
    b_tablon_logros: ROOT + 'assets/sprites_extra/bld_tablon_logros.png',

    mine_active: BASE + 'Tiny Swords/Tiny Swords (Update 010)/Resources/Gold Mine/GoldMine_Active.png',
    props: BASE + 'Pixel Art Top Down - Basic v1.2.3/Texture/TX Props.png',
    plant: BASE + 'Pixel Art Top Down - Basic v1.2.3/Texture/TX Plant.png',
    stone_ground: BASE + 'Pixel Art Top Down - Basic v1.2.3/Texture/TX Tileset Stone Ground.png',

    goblin_torch: BASE + 'Tiny Swords/Tiny Swords (Update 010)/Factions/Goblins/Troops/Torch/Red/Torch_Red.png',
    goblin_tnt: BASE + 'Tiny Swords/Tiny Swords (Update 010)/Factions/Goblins/Troops/TNT/Red/TNT_Red.png',
    fx_dust: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Particle FX/Dust_01.png',
    fx_fire: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Particle FX/Fire_01.png',
    fx_exp: BASE + 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Particle FX/Explosion_01.png',

    char1: BASE + 'Free Character Sprites - Fantasy Dreamland/Free Character Sprites - Fantasy Dreamland/32x32/Char_001.png',
    char2: BASE + 'Free Character Sprites - Fantasy Dreamland/Free Character Sprites - Fantasy Dreamland/32x32/Char_002.png',
    char3: BASE + 'Free Character Sprites - Fantasy Dreamland/Free Character Sprites - Fantasy Dreamland/32x32/Char_003.png',
    char4: BASE + 'Free Character Sprites - Fantasy Dreamland/Free Character Sprites - Fantasy Dreamland/32x32/Char_004.png',
    char5: BASE + 'Free Character Sprites - Fantasy Dreamland/Free Character Sprites - Fantasy Dreamland/32x32/Char_005.png'
  };

  const BUILDING_IMG_MAP = {
    House1_Red: 'b_house1_red',
    Barracks_Blue: 'b_barracks_blue',
    House2_Yellow: 'b_house2_yellow',
    Tower_Yellow: 'b_tower_yellow',
    House3_Blue: 'b_house3_blue',
    Castle_Red: 'b_castle_red',
    Monastery_Purple: 'b_monastery_purple',
    House1_Yellow: 'b_house1_yellow',
    House2_Blue: 'b_house2_blue',
    Castle_Yellow: 'b_castle_yellow',
    House3_Yellow: 'b_house3_yellow',
    Castle_Blue: 'b_castle_blue',
    House1_Blue: 'b_house1_blue',
    House2_Red: 'b_house2_red',
    Monastery_Blue: 'b_monastery_blue',
    House3_Purple: 'b_house3_purple',
    Archery_Yellow: 'b_archery_yellow',
    Castle_Purple: 'b_castle_purple',
    Tower_Purple: 'b_tower_purple',
    Tower_Black: 'b_tower_black',
    Tower_Blue: 'b_tower_blue',
    Mine_Gate: 'mine_active',
    Mercado_Stall: 'b_mercado_stall',
    Mesa_Encantamientos: 'b_mesa_encantamientos',
    Mesa_Artesania: 'b_mesa_artesania',
    Tablon_Logros: 'b_tablon_logros'
  };

  class AssetManager {
    constructor() {
      this.images = {};
      this.loadedCount = 0;
      this.totalCount = Object.keys(PATHS).length;
      this._coreTotal = this.totalCount;
      this._coreLoaded = 0;
      this._extraTotal = 0;
      this._extraLoaded = 0;
      this.ready = false;
      this.biomeTiles = {};
      this.iconCache = new Map();
      this.toolIconCache = new Map();
    }

    getLoadProgress() {
      const cTotal = this._coreTotal || this.totalCount || 1;
      const cLoaded = Math.min(cTotal, this._coreLoaded || this.loadedCount || 0);
      const eTotal = this._extraTotal || 0;
      const eLoaded = Math.min(eTotal, this._extraLoaded || 0);
      const total = Math.max(1, cTotal + eTotal);
      const loaded = cLoaded + eLoaded;
      const ratio = this.ready ? 1 : Math.min(0.99, loaded / total);
      return { loaded, total, ratio };
    }

    loadAll() {
      this.preloadedUrls = this.preloadedUrls || {};
      const pathEntries = Object.entries(PATHS);

      const uiAndToolUrls = new Set();
      const collectMapUrls = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        Object.values(obj).forEach(v => {
          if (typeof v === 'string') uiAndToolUrls.add(v);
          else if (v && typeof v === 'object') collectMapUrls(v);
        });
      };
      collectMapUrls(Balaclava.UI_URLS);
      collectMapUrls(Balaclava.NPC_PORTRAIT_URLS);
      collectMapUrls(Balaclava.TOOL_PNG_MAP);
      collectMapUrls(Balaclava.SKILL_ICON_POOL);
      collectMapUrls(Balaclava.SKILL_ICON_URLS);
      collectMapUrls(Balaclava.ITEM_PNG_MAP);
      collectMapUrls(Balaclava.BUFF_ICON_URLS);

      this._coreTotal = Math.max(1, pathEntries.length + uiAndToolUrls.size);
      this._coreLoaded = 0;

      const promises = pathEntries.map(([key, url]) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.images[key] = img;
            this.loadedCount++;
            this._coreLoaded++;
            resolve();
          };
          img.onerror = () => {
            this.loadedCount++;
            this._coreLoaded++;
            resolve();
          };
          img.src = encodeURI(url);
        });
      });

      uiAndToolUrls.forEach((rawUrl) => {
        const resolved = (ROOT && rawUrl.startsWith('assets/')) ? (ROOT + rawUrl) : rawUrl;
        const enc = encodeURI(resolved);
        promises.push(new Promise((resolve) => {
          const done = () => {
            this._coreLoaded++;
            resolve();
          };
          const img = new Image();
          img.onload = () => {
            this.preloadedUrls[enc] = img;
            this.preloadedUrls[encodeURI(rawUrl)] = img;
            if (img.decode) img.decode().catch(() => {}).finally(done);
            else done();
          };
          img.onerror = done;
          img.src = enc;
        }));
      });

      return Promise.all(promises).then(() => {
        this.buildBiomeCaches();
        if (!this.deferReady) this.ready = true;
      });
    }

    get(key) {
      return this.images[key] || null;
    }

    getBuildingImg(spriteKey) {
      const mapped = BUILDING_IMG_MAP[spriteKey];
      if (mapped && this.images[mapped]) return this.images[mapped];
      if (this.extraImages && this.extraImages[spriteKey]) return this.extraImages[spriteKey];
      return this.images[spriteKey] || null;
    }

    // Build tinted 192x192 9-slice tilemaps per biome without getImageData (safe on file://).
    buildBiomeCaches() {
      const makeSheet = (srcImg, sx, sy, sw, sh, overlayColor, op = 'source-atop') => {
        if (!srcImg) return null;
        const c = document.createElement('canvas');
        c.width = sw;
        c.height = sh;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(srcImg, sx, sy, sw, sh, 0, 0, sw, sh);
        if (overlayColor) {
          ctx.globalCompositeOperation = op;
          ctx.fillStyle = overlayColor;
          ctx.fillRect(0, 0, sw, sh);
          ctx.globalCompositeOperation = 'source-over';
        }
        return c;
      };

      const t1 = this.images.tile_1;
      const t2 = this.images.tile_2;
      const t5 = this.images.tile_5;
      const flat = this.images.tile_flat;

      // 3x3 64px tile blocks = 192x192
      this.biomeTiles.pradera = makeSheet(t1, 0, 0, 192, 192, null);
      this.biomeTiles.desierto = flat ? makeSheet(flat, 320, 0, 192, 192, null) : makeSheet(t1, 0, 0, 192, 192, 'rgba(235, 190, 95, 0.55)');
      this.biomeTiles.bosque_oscuro = makeSheet(t5 || t1, 0, 0, 192, 192, 'rgba(38, 24, 72, 0.36)');
      this.biomeTiles.montanas_heladas = makeSheet(t5 || t1, 0, 0, 192, 192, 'rgba(218, 245, 255, 0.65)');
      this.biomeTiles.tierras_volcanicas = makeSheet(t2 || t1, 0, 0, 192, 192, 'rgba(42, 18, 22, 0.66)');
    }

    // Crisp 24x24 pixel-art item icons cached as data canvases/DOM clones.
    getItemIconCanvas(iconType) {
      if (this.iconCache.has(iconType)) return this.iconCache.get(iconType);
      const c = document.createElement('canvas');
      c.width = 24;
      c.height = 24;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      this.paintItemIcon(ctx, iconType);
      this.iconCache.set(iconType, c);
      return c;
    }

    getToolIconCanvas(toolId, tierId = 'basica') {
      const key = toolId + '_' + tierId;
      if (this.toolIconCache.has(key)) return this.toolIconCache.get(key);
      const c = document.createElement('canvas');
      c.width = 28;
      c.height = 28;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      this.paintToolIcon(ctx, toolId, tierId);
      this.toolIconCache.set(key, c);
      return c;
    }

    getToolImg(toolId, tierId = 'basica') {
      const map = Balaclava.TOOL_PNG_MAP && Balaclava.TOOL_PNG_MAP[toolId];
      if (map) {
        const rawUrl = map[tierId] || map.basica;
        if (rawUrl) {
          const ROOT = window.BALACLAVA_ROOT_BASE || '';
          const resolved = (ROOT && rawUrl.startsWith('assets/')) ? (ROOT + rawUrl) : rawUrl;
          const enc = encodeURI(resolved);
          const img = this.preloadedUrls && (this.preloadedUrls[enc] || this.preloadedUrls[encodeURI(rawUrl)]);
          if (img && ((img.naturalWidth && img.naturalWidth > 0) || img.complete)) return img;
        }
      }
      return this.getToolIconCanvas(toolId, tierId) || this.getItemIconCanvas(toolId);
    }

    paintPixelGrid(ctx, rows, palette, scale = 2, ox = 2, oy = 2) {
      for (let y = 0; y < rows.length; y++) {
        const row = rows[y];
        for (let x = 0; x < row.length; x++) {
          const ch = row[x];
          if (ch === '.' || !palette[ch]) continue;
          ctx.fillStyle = palette[ch];
          ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale);
        }
      }
    }

    paintToolIcon(ctx, toolId, tierId) {
      const tierColors = {
        basica:     { m: '#a1887f', h: '#d7ccc8', d: '#5d4037', g: '#ffd54f' },
        mejorada:   { m: '#66bb6a', h: '#b9f6ca', d: '#2e7d32', g: '#fff176' },
        cobre:      { m: '#e67e22', h: '#ffccbc', d: '#873600', g: '#ffd54f' },
        hierro:     { m: '#90a4ae', h: '#eceff1', d: '#455a64', g: '#80deea' },
        plata:      { m: '#cfd8dc', h: '#ffffff', d: '#607d8b', g: '#b2ebf2' },
        oro:        { m: '#ffb300', h: '#fff59d', d: '#e65100', g: '#ffffff' },
        platino:    { m: '#80deea', h: '#e0f7fa', d: '#00838f', g: '#ffffff' },
        acero:      { m: '#42a5f5', h: '#bbdefb', d: '#0d47a1', g: '#80d8ff' },
        cristal:    { m: '#ab47bc', h: '#f3e5f5', d: '#6a1b9a', g: '#80d8ff' },
        mitrilo:    { m: '#4dd0e1', h: '#b2ebf2', d: '#006064', g: '#b388ff' },
        titanio:    { m: '#b0bec5', h: '#ffffff', d: '#37474f', g: '#80deea' },
        adamantita: { m: '#66bb6a', h: '#c8e6c9', d: '#1b5e20', g: '#ffd54f' },
        oricalco:   { m: '#ff7043', h: '#ffe0b2', d: '#bf360c', g: '#ffd54f' },
        legendaria: { m: '#ff5722', h: '#ffe082', d: '#b71c1c', g: '#00e5ff' },
        celestial:  { m: '#80deea', h: '#ffffff', d: '#0277bd', g: '#ffd54f' }
      }[tierId] || { m: '#a1887f', h: '#d7ccc8', d: '#5d4037', g: '#ffd54f' };

      const wood = { w: '#8d5524', W: '#c68642', b: '#1b1116', ...tierColors };
      const grids = {
        pico: [
          '..bbbbbb....',
          '.bhhhhmmb...',
          'bhmmbbwmmb..',
          'bmb..bwbmbb.',
          '.....bw.bmb.',
          '....bw...b..',
          '...bw.......',
          '..bw........',
          '.bw.........',
          '.b..........'
        ],
        hacha: [
          '...bbbb.....',
          '..bhhmmb....',
          '.bhhmmmmb...',
          '.bhhmmwmb...',
          '..bbbwmb....',
          '....bwbb....',
          '...bw.......',
          '..bw........',
          '.bw.........',
          '.b..........'
        ],
        espada: [
          '........bbb.',
          '.......bhmb.',
          '......bhmb..',
          '.....bhmb...',
          '....bhmb....',
          '.bbbhmbb....',
          '..bggb......',
          '..bwgb......',
          '.bwb........',
          '.bb.........'
        ],
        pala: [
          '.......bbb..',
          '......bhmmb.',
          '.....bhmmmb.',
          '.....bmmwmb.',
          '......bbwb..',
          '.....bw.....',
          '....bw......',
          '...bw.......',
          '..bw........',
          '..b.........'
        ],
        cana: [
          '.......bbb..',
          '......bw.b..',
          '.....bw..b..',
          '....bw...b..',
          '...bw....b..',
          '..bw.....g..',
          '.bw.....g.g.',
          '.b.......g..',
          '............',
          '............'
        ],
        guadana: [
          '..bbbbbbb...',
          '.bhhhhhhmb..',
          'bhmmmmbbwb..',
          'bmmbb..bw...',
          '.b....bw....',
          '.....bw.....',
          '....bw......',
          '...bw.......',
          '..bw........',
          '..b.........'
        ],
        arco: [
          '....bbbb....',
          '..bbw..wb...',
          '.bw....g.b..',
          '.bw....g....',
          'bw.....g....',
          'bw.....g....',
          '.bw....g....',
          '.bw....g.b..',
          '..bbw..wb...',
          '....bbbb....'
        ]
      };
      this.paintPixelGrid(ctx, grids[toolId] || grids.pico, wood, 2, 2, 3);
    }

    paintItemIcon(ctx, iconType) {
      const p = {
        b: '#1a1118', w: '#8d5524', W: '#c68642', l: '#e6b87d',
        g: '#6d7b85', G: '#aebbc4', s: '#eceff1',
        k: '#2b2b38', K: '#505363',
        r: '#d32f2f', R: '#ff6659',
        o: '#ef6c00', O: '#ffb74d',
        y: '#f9a825', Y: '#fff176',
        e: '#2e7d32', E: '#66bb6a', L: '#b9f6ca',
        c: '#0288d1', C: '#4fc3f7', I: '#e1f5fe',
        v: '#7b1fa2', V: '#ce93d8', M: '#f3e5f5',
        p: '#d81b60', P: '#f48fb1',
        n: '#5d4037', N: '#a1887f',
        u: '#d7ccc8'
      };

      const simpleBox = (main, hi, dark) => {
        ctx.fillStyle = '#1a1118';
        ctx.fillRect(4, 4, 16, 16);
        ctx.fillStyle = dark;
        ctx.fillRect(5, 5, 14, 14);
        ctx.fillStyle = main;
        ctx.fillRect(5, 5, 12, 12);
        ctx.fillStyle = hi;
        ctx.fillRect(6, 6, 6, 4);
      };

      const shapes = {
        wood: [
          '..bbbbbb..',
          '.bWllWwwb.',
          'bWllWwwwwb',
          'bwwwwwwwwb',
          'bWWwwwwWWb',
          '.bwwwwWWb.',
          '..bbbbbb..'
        ],
        plank: [
          '.bbbbbbbb.',
          'bllWWWWWWb',
          'bWWWWbbbb.',
          '.bbbbbbbb.',
          'bllWWWWWWb',
          'bWWWWwwwwb',
          '.bbbbbbbb.'
        ],
        stone: [
          '...bbbb...',
          '.bbGsssbb.',
          'bGGssssGGb',
          'bGGGGggggb',
          'bggggggggb',
          '.bbbbbbbb.'
        ],
        coal: [
          '...bbbb...',
          '.bbKkkkbb.',
          'bKKkkkkKKb',
          'bkkkkKKKKb',
          'bkkkkkkkkb',
          '.bbbbbbbb.'
        ],
        iron_ore: [
          '...bbbb...',
          '.bbGsssbb.',
          'bGGsGGssGb',
          'bGssGGgGGb',
          'bgggssgggb',
          '.bbbbbbbb.'
        ],
        copper_ore: [
          '...bbbb...',
          '.bbGooobb.',
          'bGGoOoooGb',
          'bGOoggOOgb',
          'bgggOOgggb',
          '.bbbbbbbb.'
        ],
        gold_ore: [
          '...bbbb...',
          '.bbGYYYbb.',
          'bGGYYyyGGb',
          'bGyyGGYYgb',
          'bgggYYgggb',
          '.bbbbbbbb.'
        ],
        crystal: [
          '....bb....',
          '...bIIb...',
          '..bICCIb..',
          '..bCCCCb..',
          '.bICCccCb.',
          '.bCCccccb.',
          '..bccccb..',
          '...bbbb...'
        ],
        diamond: [
          '..bbbbbb..',
          '.bIIICCIb.',
          'bIICCCCCIb',
          'bCCCCCCCCb',
          '.bCCCCCCb.',
          '..bCCCCb..',
          '...bCCb...',
          '....bb....'
        ],
        emerald: [
          '..bbbbbb..',
          '.bLLEEEEL.',
          'bLEEEEEEEL',
          'bEEEEEEEEb',
          '.bEEEEEEb.',
          '..bEEEEb..',
          '...bEEb...',
          '....bb....'
        ],
        magic_crystal: [
          '....bb....',
          '...bMMb...',
          '..bMVVMb..',
          '.bMVVVVMb.',
          '.bVVvvVVb.',
          '..bVvvVb..',
          '...bvvbb..',
          '....bb....'
        ],
        dark_essence: [
          '...bbbb...',
          '..bssssb..',
          '...bkkb...',
          '.bbvVVvbb.',
          'bvVVkkVVvb',
          'bvVkkkkVvb',
          '.bvvvvvvb.',
          '..bbbbbb..'
        ],
        ancient_fragment: [
          '..bbbbbb..',
          '.bYYyyYYb.',
          'bYCCbbCCYb',
          'byCbbbbCyb',
          'bYYbbbbYYb',
          '.bYYyyYYb.',
          '..bbbbbb..'
        ],
        special_ingot: [
          '..bbbbbb..',
          '.bIIICCIb.',
          'bICCCCCcIb',
          'bCCCCccccb',
          'bccccccccb',
          '.bbbbbbbb.'
        ],
        volcanic: [
          '...bbbb...',
          '.bbkRRkbb.',
          'bkRROORkkb',
          'bkkORROkkb',
          'bkkkkRkkkb',
          '.bbbbbbbb.'
        ],
        herb: [
          '...b..b...',
          '..bEb.bEb.',
          '.bEEbbEEb.',
          '.bEeEEeEb.',
          '..bEEEEb..',
          '...bEEb...',
          '...bEEb...'
        ],
        fiber: [
          '..bbbb....',
          '.bLLllbb..',
          '.bllWWllb.',
          '..bbllWWb.',
          '...bWWllb.',
          '....bbbb..'
        ],
        berries: [
          '...bEEb...',
          '..bbEEbb..',
          '.bRRbbRRb.',
          'bRrrbbRrrb',
          '.bbRrrRbb.',
          '..bRrrrbb.',
          '...bbbb...'
        ],
        seeds: [
          '..bb..bb..',
          '.bYyb.bYyb',
          '.bbyb.bbyb',
          '..bb..bb..',
          '...bb.bb..',
          '..bYybYyb.',
          '...bbbb...'
        ],
        coin: [
          '..bbbbbb..',
          '.bYYYYYYb.',
          'bYYyssyYYb',
          'bYYyssyYYb',
          'bYYYYYYYYb',
          '.byyyyyyb.',
          '..bbbbbb..'
        ],
        iron_ingot: [
          '..bbbbbb..',
          '.bssssssb.',
          'bsGGGGGGsb',
          'bGGGGggggb',
          'bggggggggb',
          '.bbbbbbbb.'
        ],
        gold_ingot: [
          '..bbbbbb..',
          '.bYYYYYYb.',
          'bYYOOOOYYb',
          'bOOOOoooob',
          'boooooooob',
          '.bbbbbbbb.'
        ],
        copper_ingot: [
          '..bbbbbb..',
          '.bOOOOOOb.',
          'bOOoooooOb',
          'boooooooob',
          'bnnnnnnnnb',
          '.bbbbbbbb.'
        ],
        steel_ingot: [
          '..bbbbbb..',
          '.bsCCCCsb.',
          'bsCCCCCCsb',
          'bGGGggGGGb',
          'bggggggggb',
          '.bbbbbbbb.'
        ],
        gear: [
          '..bb..bb..',
          '.bGGbbGGb.',
          'bGGssssGGb',
          '.bGsbbGsG.',
          'bGGssssGGb',
          '.bGGbbGGb.',
          '..bb..bb..'
        ],
        bread: [
          '..bbbbbb..',
          '.bOOOOOOb.',
          'bOOlllOOOb',
          'bWWWWWWWWb',
          'bwwwwwwwwb',
          '.bbbbbbbb.'
        ],
        meat: [
          '..bbbbbb..',
          '.bRrrrrrb.',
          'bRrussrrRb',
          'bRrrssrrr.',
          '.bRRRRrrb.',
          '..bbbbbb..'
        ],
        steak: [
          '..bbbbbb..',
          '.bwnnnwwb.',
          'bwnnssnnwb',
          'bwnnnnnnwb',
          '.bwwwwwwb.',
          '..bbbbbb..'
        ],
        potion_hp: [
          '...bbbb...',
          '...bWWb...',
          '..bbssbb..',
          '.bRRRRRRb.',
          'bRRrRrrrRb',
          'bRrrrrrrr.',
          '.bbbbbbbb.'
        ],
        potion_spd: [
          '...bbbb...',
          '...bWWb...',
          '..bbssbb..',
          '.bCCCCCCb.',
          'bCCICcccCb',
          'bCcccccccb',
          '.bbbbbbbb.'
        ],
        potion_luck: [
          '...bbbb...',
          '...bWWb...',
          '..bbssbb..',
          '.bEEEEEEb.',
          'bEELEeeeEb',
          'bEeeeeeeeb',
          '.bbbbbbbb.'
        ],
        key: [
          '..bbbb....',
          '.bYYYYb...',
          '.bYbbYb...',
          '.bYYYYb...',
          '..bYYb....',
          '..bYYbb...',
          '..bYYb....',
          '..bYYbb...',
          '...bb.....'
        ],
        arrow_ammo: [
          '.......bbb',
          '......bsGb',
          '.....bwwsb',
          '....bwWbb.',
          '...bwWb...',
          '..bwWb....',
          '.bRRb.....',
          'bRRRb.....',
          '.bbb......'
        ],
        balaclava_core: [
          '.......WW.',
          '......Wssb',
          '.....Wssb.',
          '....Wssb..',
          '..bYYYb...',
          '.bYRRRyb..',
          '..byyyb...',
          '...bb.....'
        ]
      };

      const grid = shapes[iconType];
      if (grid) {
        this.paintPixelGrid(ctx, grid, p, 2, 2, 4);
        return;
      }

      // Clean themed procedural pixel badges for remaining specialized items
      if (iconType.startsWith('fish_')) {
        const fc = {
          fish_common: ['#4fc3f7', '#0288d1'],
          fish_gold: ['#fff176', '#f57f17'],
          fish_dark: ['#ce93d8', '#4a148c'],
          fish_ice: ['#e0f7fa', '#00acc1'],
          fish_lava: ['#ffcc80', '#d84315']
        }[iconType] || ['#4fc3f7', '#0288d1'];
        this.paintPixelGrid(ctx, [
          '....bbbb..',
          '..bbMMMMb.',
          'bbMMssMMMb',
          'bMMMMMMMb.',
          'bbMMDDDDb.',
          '..bbbbbb..'
        ], { b: '#1a1118', M: fc[0], D: fc[1], s: '#ffffff' }, 2, 2, 6);
        return;
      }

      if (iconType.startsWith('armor_')) {
        const ac = {
          armor_leather: ['#a1887f', '#5d4037'],
          armor_iron: ['#cfd8dc', '#546e7a'],
          armor_crystal: ['#e1bee7', '#7b1fa2'],
          armor_legend: ['#ffab91', '#bf360c']
        }[iconType] || ['#cfd8dc', '#546e7a'];
        this.paintPixelGrid(ctx, [
          '.bb....bb.',
          'bMMbbbbMMb',
          'bMMMMMMMMb',
          'bMMDDDDMMb',
          '.bDDDDDDb.',
          '.bDDDDDDb.',
          '..bbbbbb..'
        ], { b: '#1a1118', M: ac[0], D: ac[1] }, 2, 2, 4);
        return;
      }

      // Specific clean colors for remaining items (bone, sand, clay, brick, glass, cloth, wheat, carrot, pumpkin, wool, egg, milk, mushroom, cactus, ring, amulet, etc.)
      const fallbackColors = {
        leather: ['#a1887f', '#d7ccc8', '#5d4037'],
        bone: ['#eceff1', '#ffffff', '#90a4ae'],
        sand: ['#ffe082', '#fff8e1', '#ffb300'],
        clay: ['#8d6e63', '#bcaaa4', '#4e342e'],
        brick: ['#e57373', '#ffcdd2', '#b71c1c'],
        glass: ['#b3e5fc', '#ffffff', '#4fc3f7'],
        cloth: ['#f5f5f5', '#ffffff', '#bdbdbd'],
        seeds_carrot: ['#ffb74d', '#ffe0b2', '#e65100'],
        seeds_pumpkin: ['#ff8a65', '#ffccbc', '#bf360c'],
        seeds_crystal: ['#ce93d8', '#f3e5f5', '#6a1b9a'],
        wheat: ['#ffd54f', '#fff9c4', '#f57f17'],
        carrot: ['#ff7043', '#ffab91', '#2e7d32'],
        pumpkin: ['#fb8c00', '#ffcc80', '#e65100'],
        crystal_flower: ['#80deea', '#e0f7fa', '#00838f'],
        flour: ['#fff8e1', '#ffffff', '#d7ccc8'],
        wool: ['#fafafa', '#ffffff', '#cfd8dc'],
        egg: ['#fff3e0', '#ffffff', '#d7ccc8'],
        milk: ['#e3f2fd', '#ffffff', '#64b5f6'],
        mushroom: ['#ab47bc', '#f3e5f5', '#4a148c'],
        cactus: ['#43a047', '#a5d6a7', '#1b5e20'],
        stew: ['#ff8a65', '#ffe0b2', '#6d4c41'],
        ring_gold: ['#ffd54f', '#fff9c4', '#ff8f00'],
        amulet: ['#4fc3f7', '#e1f5fe', '#7b1fa2']
      };
      const fc = fallbackColors[iconType] || ['#90caf9', '#e3f2fd', '#1565c0'];
      simpleBox(fc[0], fc[1], fc[2]);
    }
  }

  Balaclava.Assets = new AssetManager();

  Balaclava.SKINS = [
    {
      id: 'monk_yellow',
      name: 'Monje de Túnica Café',
      name_en: 'Brown Robe Monk',
      role: 'Sabio Espiritual',
      role_en: 'Spiritual Sage',
      desc: 'Monje con hábitos de peregrino. Canaliza herramientas flotantes con energía espiritual.',
      desc_en: 'Monk in pilgrim robes. Channels floating tools with spiritual energy.',
      idle: 'monk_yellow_idle',
      run: 'monk_yellow_run',
      heal: 'monk_yellow_heal',
      type: 'monk'
    },
    {
      id: 'pawn_blue',
      name: 'Forastero Recolector',
      name_en: 'Wandering Gatherer',
      role: 'Superviviente Clásico',
      role_en: 'Classic Survivor',
      desc: 'El personaje original con animaciones completas en mano de pico, hacha, pala, cuchillo y arco.',
      desc_en: 'The classic survivor character with full in-hand animations for pickaxe, axe, shovel, knife, and bow.',
      idle: 'pawn_idle',
      run: 'pawn_run',
      axe: 'pawn_axe',
      pick: 'pawn_pick',
      knife: 'pawn_knife',
      hammer: 'pawn_hammer',
      type: 'pawn'
    }
  ];
})();
