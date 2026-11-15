(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { BIOMES, RARITIES, GRID_PLOTS, PLOT_TILES, TILE_SIZE, CENTER_PLOT, WORLD_TILES } = Balaclava.CONST;
  const { formatNum } = Balaclava.Utils;
  const tr = (k, vars) => (Balaclava.I18n ? Balaclava.I18n.t(k, vars) : k);

  const UI_SCALES = [0.75, 0.85, 0.88, 1, 1.25, 1.5];
  const UI_SCALE_STORAGE_KEY = 'balaclava_ui_scale';
  const DISCORD_URL = 'https://discord.gg/8wrsjRSMY2';

  function getStationDesc(id) {
    const kTitle = `station.${id}.title`;
    const kText = `station.${id}.text`;
    const title = tr(kTitle);
    const text = tr(kText);
    if (title === kTitle && text === kText) return null;
    return { title, text };
  }

  const SKILL_BRANCH_ANGLES = {
    recoleccion: -90,
    economia: -18,
    combate: 54,
    produccion: 126,
    exploracion: 198
  };

  const KEYBIND_STORAGE_KEY = 'balaclava_keybinds_v2';
  const DEFAULT_KEYBINDS = {
    moveUp: 'KeyW',
    moveDown: 'KeyS',
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
    dash: 'Space',
    interact: 'KeyE',
    menu: 'KeyF',
    inventory: 'KeyQ',
    crafting: 'KeyC',
    build: 'KeyR',
    skills: 'KeyG',
    map: 'KeyM',
    market: 'KeyV',
    quests: 'KeyX',
    encyclopedia: 'KeyL',
    pause: 'KeyO',
    spell1: 'KeyZ',
    spell2: 'KeyT',
    spell3: 'KeyB',
    spell4: 'KeyN'
  };
  const KEYBIND_DEFS = [
    { id: 'moveUp', key: 'key.moveUp' },
    { id: 'moveDown', key: 'key.moveDown' },
    { id: 'moveLeft', key: 'key.moveLeft' },
    { id: 'moveRight', key: 'key.moveRight' },
    { id: 'dash', key: 'key.dash' },
    { id: 'interact', key: 'key.interact' },
    { id: 'menu', key: 'key.menu' },
    { id: 'inventory', key: 'key.inventory' },
    { id: 'crafting', key: 'key.crafting' },
    { id: 'build', key: 'key.build' },
    { id: 'skills', key: 'key.skills' },
    { id: 'map', key: 'key.map' },
    { id: 'market', key: 'key.market' },
    { id: 'quests', key: 'key.quests' },
    { id: 'encyclopedia', key: 'key.encyclopedia' },
    { id: 'pause', key: 'key.pause' },
    { id: 'spell1', key: 'key.spell1' },
    { id: 'spell2', key: 'key.spell2' },
    { id: 'spell3', key: 'key.spell3' },
    { id: 'spell4', key: 'key.spell4' }
  ];

  function loadStoredKeybinds() {
    try {
      const raw = localStorage.getItem(KEYBIND_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return Object.assign({}, DEFAULT_KEYBINDS, parsed);
        }
      }
    } catch (_) {}
    return Object.assign({}, DEFAULT_KEYBINDS);
  }

  class UIController {
    constructor() {
      this.game = null;
      if (this._mapCleanup) { this._mapCleanup(); this._mapCleanup = null; }
      this.activeModal = null;
      this.modalData = null;
      this.invFilter = 'todos';
      this.selectedItemId = null;
      this.craftFilter = 'todas';
      this.buildFilter = 'produccion';
      this.questFilter = 'historia';
      this.questCatFilter = 'todas';
      this.encycFilter = 'items';
      this.invSearch = '';
      this.craftSearch = '';
      this.buildSearch = '';
      this.encycSearch = '';
      this.showDungeonAtlas = false;
      this.selectedSkillId = 'rec_1';
      this.selectedMapPlot = [CENTER_PLOT || 4, CENTER_PLOT || 4];
      this.lastHudTick = 0;
      this.skillZoom = 0.72;
      this.skillPanX = null;
      this.skillPanY = null;
      this.enchantTarget = { kind: 'tool', id: 'pico' };
      this._visibleHotbarIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      this.titleSlotPickerOpen = false;
      this.confirmDeleteSlot = null;
      this.keybinds = loadStoredKeybinds();
      this.rebindingAction = null;
      this.pauseView = 'root';
      this.settingsTab = 'sonido';
      this.menuOpen = false;
      this._lastResKey = '';
      this._lastHotbarKey = '';
      this._lastBuffKey = '';
      this._toastNodes = new Map();
      this._pickupNodes = new Map();
      this.controlsHelperVisible = false;
      this.controlsHelperCause = null;
      this.lastPlayerInputTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      this._controlsHelperTimer = null;
      this._controlsHelperEl = null;
      this._lastMouseClientX = 0;
      this._lastMouseClientY = 0;
    }

    formatKeyCode(code) {
      if (!code) return '---';
      if (code.startsWith('Key')) return code.slice(3);
      if (code.startsWith('Digit')) return code.slice(5);
      const map = {
        Space: tr('key.space'),
        ShiftLeft: tr('key.shiftLeft'),
        ShiftRight: tr('key.shiftRight'),
        ControlLeft: tr('key.ctrlLeft'),
        ControlRight: tr('key.ctrlRight'),
        AltLeft: tr('key.altLeft'),
        ArrowUp: tr('key.arrowUp'),
        ArrowDown: tr('key.arrowDown'),
        ArrowLeft: tr('key.arrowLeft'),
        ArrowRight: tr('key.arrowRight'),
        Enter: 'Enter',
        Tab: 'Tab',
        Backspace: tr('key.backspace')
      };
      return map[code] || code;
    }

    getKeyLabel(actionId) {
      return this.formatKeyCode((this.keybinds && this.keybinds[actionId]) || DEFAULT_KEYBINDS[actionId]);
    }

    setKeybind(actionId, code) {
      if (!DEFAULT_KEYBINDS[actionId] || !code) return;
      this.keybinds[actionId] = code;
      try { localStorage.setItem(KEYBIND_STORAGE_KEY, JSON.stringify(this.keybinds)); } catch (_) {}
      this.rebindingAction = null;
    }

    resetKeybinds() {
      this.keybinds = Object.assign({}, DEFAULT_KEYBINDS);
      this.rebindingAction = null;
      try { localStorage.setItem(KEYBIND_STORAGE_KEY, JSON.stringify(this.keybinds)); } catch (_) {}
      if (this.game) this.game.toast(tr('settings.controlsResetToast'), 'info');
      this.updateControlsHelperLabels();
    }

    getControlsHelperEl() {
      if (!this._controlsHelperEl && typeof document !== 'undefined') {
        this._controlsHelperEl = document.getElementById('hud-controls-helper');
      }
      return this._controlsHelperEl;
    }

    updateControlsHelperLabels() {
      const el = this.getControlsHelperEl();
      if (!el) return;
      const dashKey = document.getElementById('ctrl-dash-key');
      const interactKey = document.getElementById('ctrl-interact-key');
      const zoomKey = document.getElementById('ctrl-zoom-key');
      if (dashKey) dashKey.textContent = this.getKeyLabel('dash');
      if (interactKey) interactKey.textContent = this.getKeyLabel('interact');
      if (zoomKey && Balaclava.I18n) {
        zoomKey.textContent = Balaclava.I18n.t('controls.keyWheel');
      }
      if (Balaclava.I18n && typeof Balaclava.I18n.translateDOM === 'function') {
        Balaclava.I18n.translateDOM(el);
      }
    }

    showControlsHelper(cause = 'entry', autoHideMs = 2800) {
      const el = this.getControlsHelperEl();
      if (!el) return;
      const g = this.game;
      if (!g || !g.started || (g.isPlayerDead && g.isPlayerDead())) return;

      this.updateControlsHelperLabels();

      if (this._controlsHelperTimer) {
        clearTimeout(this._controlsHelperTimer);
        this._controlsHelperTimer = null;
      }

      this.controlsHelperVisible = true;
      this.controlsHelperCause = cause;
      el.classList.remove('hud-controls-hidden');

      if (autoHideMs && autoHideMs > 0) {
        this._controlsHelperTimer = setTimeout(() => {
          this.hideControlsHelper();
        }, autoHideMs);
      }
    }

    hideControlsHelper(immediate = false) {
      const el = this.getControlsHelperEl();
      if (this._controlsHelperTimer) {
        clearTimeout(this._controlsHelperTimer);
        this._controlsHelperTimer = null;
      }
      this.controlsHelperVisible = false;
      this.controlsHelperCause = null;
      if (el) {
        if (immediate) {
          el.style.transition = 'none';
          el.classList.add('hud-controls-hidden');
          requestAnimationFrame(() => {
            el.style.transition = '';
          });
        } else {
          el.classList.add('hud-controls-hidden');
        }
      }
    }

    recordPlayerActivity() {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      const wasAfk = this.controlsHelperCause === 'afk' && this.controlsHelperVisible;
      this.lastPlayerInputTime = now;

      if (wasAfk) {
        // Player returned from AFK! "se quite cuando vuelvas a los dos segundos o 3"
        this.controlsHelperCause = 'returning';
        if (this._controlsHelperTimer) clearTimeout(this._controlsHelperTimer);
        this._controlsHelperTimer = setTimeout(() => {
          this.hideControlsHelper();
        }, 2500); // 2.5 seconds
      }
    }

    checkControlsHelperAFK(dt) {
      const g = this.game;
      if (!g || !g.started || g.paused || this.hasOpenModal() || (g.isPlayerDead && g.isPlayerDead())) {
        this.lastPlayerInputTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
        if (this.controlsHelperVisible && this.controlsHelperCause === 'afk') {
          this.hideControlsHelper(true);
        }
        return;
      }

      // Check if player is holding movement or action
      const kb = this.keybinds || DEFAULT_KEYBINDS;
      if (g.keys && (g.keys[kb.moveUp] || g.keys[kb.moveDown] || g.keys[kb.moveLeft] || g.keys[kb.moveRight] ||
          g.keys['ArrowUp'] || g.keys['ArrowDown'] || g.keys['ArrowLeft'] || g.keys['ArrowRight'] ||
          (g.mouse && g.mouse.down))) {
        this.recordPlayerActivity();
        return;
      }

      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      if (!this.lastPlayerInputTime) this.lastPlayerInputTime = now;
      const idleSec = now - this.lastPlayerInputTime;

      // When AFK for 10 seconds, smoothly animate in
      if (idleSec >= 10.0) {
        if (!this.controlsHelperVisible) {
          this.showControlsHelper('afk', null); // stays until player returns
        }
      }
    }

    init(game) {
      this.game = game;
      this.initUiScale();
      this.bindGlobalInputs();
      this.renderTitleScreen();
    }

    toggleMenuDropdown(force) {
      const dead = Boolean(this.game && this.game.isPlayerDead && this.game.isPlayerDead());
      const next = dead ? false : (typeof force === 'boolean' ? force : !this.menuOpen);
      this.menuOpen = next;
      const dd = document.getElementById('menu-dropdown');
      const btn = document.getElementById('btn-menu-toggle');
      if (dd) dd.classList.toggle('hidden', !next);
      if (btn) btn.classList.toggle('open', next);
    }

    closeMenuDropdown() {
      this.toggleMenuDropdown(false);
    }

    hasOpenModal() {
      return this.activeModal !== null;
    }

    itemIcon(iconType, size = 28) {
      return Balaclava.Assets.createItemIconEl(iconType, size);
    }

    biomeIcon(biomeId, size = 26) {
      const urlMap = {
        pradera: Balaclava.UI_URLS.biomePradera,
        desierto: Balaclava.UI_URLS.biomeDesierto,
        bosque_oscuro: Balaclava.UI_URLS.biomeBosque,
        montanas_heladas: Balaclava.UI_URLS.biomeHielo,
        tierras_volcanicas: Balaclava.UI_URLS.biomeVolcan
      };
      const url = urlMap[biomeId] || Balaclava.UI_URLS.biomePradera;
      if (url) {
        return this.el('img', {
          class: 'pixel-img',
          src: encodeURI(url),
          width: size,
          height: size,
          alt: biomeId || 'bioma',
          style: `width:${size}px;height:${size}px;flex-shrink:0;border-radius:4px;border:1.5px solid #2b1a10;`
        });
      }
      const bDef = BIOMES[biomeId] || {};
      return this.el('span', { style: `width:${size}px;height:${size}px;border-radius:4px;border:2px solid #2b1a10;background:${bDef.color || '#6d4c41'};display:inline-block;flex-shrink:0;` });
    }

    toolIcon(toolId, tierId = 'basica', size = 28) {
      return Balaclava.Assets.createToolIconEl(toolId, tierId, size);
    }

    skillIcon(skillId, size = 28) {
      return Balaclava.Assets.createSkillIconEl(skillId, size);
    }

    npcPortrait(npcId, size = 56) {
      return Balaclava.Assets.createNpcPortraitEl(npcId, size);
    }

    makeBuildingThumb(bDef, size = 44) {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      c.className = 'pixel-img';
      c.style.width = size + 'px';
      c.style.height = size + 'px';
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const assets = Balaclava.Assets;

      if (bDef.sprite === 'Campfire_Anim' && assets.extraImages && assets.extraImages.campfireAnim) {
        const img = assets.extraImages.campfireAnim;
        ctx.drawImage(img, 0, 0, 16, img.height, 4, 4, size - 8, size - 8);
        return c;
      }
      const extraMap = { Corral_Pen: 'corral_pen', Fish_Pond: 'fish_pond', Plot_Garden: 'garden_plot' };
      const bImg = assets.getBuildingImg(bDef.sprite) || (extraMap[bDef.sprite] && assets.extraImages && assets.extraImages[extraMap[bDef.sprite]]);
      if (bImg) {
        const aspect = bImg.width / Math.max(1, bImg.height);
        let dw = size - 4;
        let dh = dw / aspect;
        if (dh > size - 4) { dh = size - 4; dw = dh * aspect; }
        ctx.drawImage(bImg, (size - dw) / 2, (size - dh) / 2, dw, dh);
        return c;
      }
      // Fallback crisp pixel icon per sprite category
      ctx.fillStyle = '#261a24';
      ctx.fillRect(4, 4, size - 8, size - 8);
      ctx.fillStyle = bDef.color || '#ffb74d';
      ctx.fillRect(8, 8, size - 16, size - 16);
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, size - 10, size - 10);
      return c;
    }

    makeEnemyThumb(en, size = 40) {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      c.className = 'pixel-img';
      c.style.width = size + 'px';
      c.style.height = size + 'px';
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const meta = Balaclava.ENEMY_SPRITE_PATHS && Balaclava.ENEMY_SPRITE_PATHS[en.id];
      const img = Balaclava.Assets.enemyImages && Balaclava.Assets.enemyImages[en.id];
      if (meta && img) {
        const aspect = meta.fw / Math.max(1, meta.fh);
        let dh = size - 4;
        let dw = dh * aspect;
        if (dw > size - 4) { dw = size - 4; dh = dw / aspect; }
        ctx.drawImage(img, 0, 0, meta.fw, meta.fh, (size - dw) / 2, (size - dh) / 2, dw, dh);
      } else {
        ctx.fillStyle = en.color || '#ef5350';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2);
        ctx.fill();
      }
      return c;
    }

    el(tag, attrs = {}, children = []) {
      this.bindTooltipDelegation();
      const node = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') node.className = v;
        else if (k === 'style') node.style.cssText = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'title' && v !== undefined && v !== null && String(v).trim()) {
          if (!attrs['data-tip'] && !attrs['data-tip-text']) node.setAttribute('data-tip-text', String(v));
          if (!attrs['aria-label']) node.setAttribute('aria-label', String(v));
        }
        else if (v !== undefined && v !== null) node.setAttribute(k, v);
      }
      for (const ch of (Array.isArray(children) ? children : [children])) {
        if (ch === null || ch === undefined) continue;
        node.appendChild(typeof ch === 'string' || typeof ch === 'number' ? document.createTextNode(String(ch)) : ch);
      }
      return node;
    }

    _uiAssetFallback(relPath) {
      const pre = (Balaclava.UI_URLS && Balaclava.UI_URLS.panelWood) || '';
      const base = pre.startsWith('../')
        ? '../'
        : (typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.indexOf('/tests/') !== -1 ? '../' : '');
      return base + relPath;
    }

    uiIcon(key, size = 16, alt = '') {
      const fileMap = {
        iconCheck: 'assets/ui/ico_check.png',
        iconCross: 'assets/ui/ico_cross.png',
        iconGear: 'assets/ui/ico_gear.png',
        iconHeart: 'assets/ui/ico_heart.png',
        iconHome: 'assets/ui/ico_home.png',
        iconLock: 'assets/ui/ico_lock.png',
        iconReset: 'assets/ui/ico_reset.png',
        iconSliders: 'assets/ui/ico_sliders.png',
        iconSoundOff: 'assets/ui/ico_sound_off.png',
        iconSoundOn: 'assets/ui/ico_sound_on.png',
        iconSparkle: 'assets/ui/ico_sparkle.png',
        iconStar: 'assets/ui/ico_star.png',
        iconTrash: 'assets/ui/ico_trash.png',
        iconTrophy: 'assets/ui/ico_trophy.png',
        iconZoomIn: 'assets/ui/ico_zoom_in.png',
        iconZoomOut: 'assets/ui/ico_zoom_out.png'
      };
      const raw = (Balaclava.UI_URLS && Balaclava.UI_URLS[key]) || (fileMap[key] ? this._uiAssetFallback(fileMap[key]) : key);
      return this.el('img', {
        class: 'pixel-img pixel-inline-ico',
        src: encodeURI(raw),
        width: size,
        height: size,
        alt
      });
    }

    tipAttr(spec) {
      if (!spec) return null;
      return typeof spec === 'string' ? spec : JSON.stringify(spec);
    }

    normalizeUiScale(val) {
      const n = Number(val);
      if (UI_SCALES.includes(n)) return n;
      if (!Number.isFinite(n)) return 0.88;
      let best = 0.88;
      let minDiff = Infinity;
      UI_SCALES.forEach(s => {
        const d = Math.abs(s - n);
        if (d < minDiff) { minDiff = d; best = s; }
      });
      return best;
    }

    getUiScale() {
      if (this._uiScale && UI_SCALES.includes(this._uiScale)) return this._uiScale;
      let raw = 0.88;
      try {
        const stored = localStorage.getItem(UI_SCALE_STORAGE_KEY);
        if (stored !== null && stored !== undefined && stored !== '') raw = Number(stored);
        else if (this.game && this.game.settings && this.game.settings.uiScale != null) raw = this.game.settings.uiScale;
      } catch (_) {}
      return this.normalizeUiScale(raw);
    }

    applyUiScale(scale, opts = {}) {
      const next = this.normalizeUiScale(scale);
      this._uiScale = next;
      if (opts.persist !== false) {
        try { localStorage.setItem(UI_SCALE_STORAGE_KEY, String(next)); } catch (_) {}
      }
      if (this.game) {
        this.game.settings = this.game.settings || {};
        this.game.settings.uiScale = next;
      }
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (root && root.style) {
          root.style.setProperty('--ui-scale', String(next));
          root.style.setProperty('--ui-inv-scale', String(1 / next));
        }
        if (document.body && document.body.classList) {
          document.body.classList.remove('ui-scale-05', 'ui-scale-075', 'ui-scale-085', 'ui-scale-088', 'ui-scale-1', 'ui-scale-125', 'ui-scale-15', 'ui-scale-2', 'ui-scale-4');
          const cls = `ui-scale-${String(next).replace('.', '')}`;
          document.body.classList.add(cls);
        }
      }
      this.hideTooltip();
      return next;
    }

    initUiScale() {
      let raw = 0.88;
      try {
        const stored = localStorage.getItem(UI_SCALE_STORAGE_KEY);
        if (stored !== null && stored !== undefined && stored !== '') {
          const num = Number(stored);
          raw = (num === 1) ? 0.88 : num;
        }
      } catch (_) {}
      return this.applyUiScale(raw, { persist: true });
    }

    _catLabel(cat) {
      if (!cat) return '';
      const map = {
        recursos: tr('inv.tabRes'),
        minerales: tr('inv.tabRes'),
        gemas: tr('inv.tabRes'),
        monstruo: tr('inv.tabRes'),
        materiales: tr('inv.tabMat'),
        semillas: tr('inv.tabFood'),
        alimentos: tr('inv.tabFood'),
        comida: tr('inv.tabFood'),
        pociones: tr('inv.tabFood'),
        equipamiento: tr('inv.tabGear'),
        herramientas: tr('inv.tabGear'),
        construccion: tr('inv.tabBlocks'),
        especiales: tr('inv.tabSpecial'),
        magia: tr('inv.tabSpecial')
      };
      return map[cat] || cat;
    }

    _buildItemTipSpec(itemId, opts = {}) {
      const it = Balaclava.ITEMS && Balaclava.ITEMS[itemId];
      if (!it) return null;
      const rar = RARITIES[it.rarity] || RARITIES.comun;
      const stats = [];
      if (opts.count !== undefined && opts.count !== null) stats.push(tr('tip.count', { n: opts.count }));
      if (it.heal) stats.push(tr('tip.heal', { n: it.heal }));
      if (it.energy) stats.push(tr('tip.energy', { n: it.energy }));
      if (it.armor) stats.push(tr('tip.armor', { n: it.armor }));
      if (it.dmg) stats.push(tr('tip.dmg', { n: it.dmg }));
      if (it.speed) stats.push(tr('tip.speed', { n: Math.round(it.speed * 100) }));
      if (it.sellValue) stats.push(tr('tip.sellValue', { n: it.sellValue }));
      const parts = [rar.name];
      if (it.category) parts.push(this._catLabel(it.category));
      if (opts.enchantsText) parts.push(opts.enchantsText);
      const foot = opts.context === 'equip'
        ? tr('tip.footEquip')
        : (opts.context === 'hotbar'
          ? tr('tip.footHotbar')
          : tr('tip.footInv'));
      return {
        title: it.name,
        sub: parts.join(' · '),
        rarity: it.rarity || 'comun',
        icon: { kind: 'item', key: it.icon },
        desc: it.desc || '',
        stats,
        foot
      };
    }

    _buildToolTipSpec(toolId, opts = {}) {
      const tool = Balaclava.TOOLS && Balaclava.TOOLS[toolId];
      if (!tool) return null;
      const g = this.game;
      const tier = (g && g.toolTiers && g.toolTiers[toolId]) || 'basica';
      const tierMeta = (Balaclava.TIER_META && Balaclava.TIER_META[tier]) || { name: tier, color: '#ffe8a3' };
      const st = Balaclava.getToolStats ? Balaclava.getToolStats(toolId, tier) : null;
      const stats = [];
      if (st) {
        stats.push(tr('tip.toolPower', { n: st.power }));
        stats.push(tr('tip.toolSpeed', { n: st.speed }));
        stats.push(tr('tip.toolReach', { n: (st.reach / 48).toFixed(1) }));
      }
      const enchMap = g && g.toolEnchants && g.toolEnchants[toolId];
      const enchs = enchMap ? Object.entries(enchMap).filter(([, lv]) => lv > 0)
        .map(([eid, lv]) => `${(Balaclava.TOOL_ENCHANTS[eid] && Balaclava.TOOL_ENCHANTS[eid].name) || eid} ${lv}`).join(' · ') : '';
      return {
        title: `${tool.name} (${tierMeta.name})`,
        sub: enchs ? tr('tip.toolSubEnch', { enchs }) : tr('tip.toolSubDefault'),
        color: tierMeta.color,
        icon: { kind: 'tool', id: toolId, tier },
        desc: tool.role || tool.desc || '',
        stats,
        foot: opts.context === 'hotbar'
          ? tr('tip.toolFootHotbar')
          : tr('tip.footInv')
      };
    }

    _positionTooltip(tip, ev, anchor) {
      const sc = this.getUiScale ? this.getUiScale() : 1;
      const vw = window.innerWidth || 1280;
      const vh = window.innerHeight || 720;
      const rect = tip.getBoundingClientRect();
      const pad = 10;
      let ax = 0;
      let ay = 0;
      if (ev && typeof ev.clientX === 'number' && typeof ev.clientY === 'number' && (ev.clientX !== 0 || ev.clientY !== 0)) {
        ax = ev.clientX;
        ay = ev.clientY;
      } else if (anchor) {
        const ar = anchor.getBoundingClientRect();
        ax = ar.left + Math.min(24 * sc, ar.width / 2);
        ay = ar.bottom;
      }
      let left = ax + 14;
      let top = ay + 18;
      if (left + rect.width > vw - pad) left = Math.max(pad, ax - rect.width - 14);
      if (top + rect.height > vh - pad) top = Math.max(pad, ay - rect.height - 14);
      left = Math.max(pad, Math.min(left, vw - rect.width - pad));
      top = Math.max(pad, Math.min(top, vh - rect.height - pad));
      tip.style.left = `${Math.round(left / sc)}px`;
      tip.style.top = `${Math.round(top / sc)}px`;
    }

    showTooltip(anchor, ev) {
      const tip = document.getElementById('balaclava-tooltip');
      if (!tip || !anchor || !anchor.isConnected) return this.hideTooltip();
      if (anchor.hasAttribute('title')) {
        const t = anchor.getAttribute('title');
        anchor.removeAttribute('title');
        if (t && !anchor.getAttribute('data-tip')) {
          anchor.setAttribute('data-tip-text', t);
          if (!anchor.getAttribute('aria-label')) anchor.setAttribute('aria-label', t);
        }
      }
      const rawSpec = anchor.getAttribute('data-tip');
      const rawText = anchor.getAttribute('data-tip-text');
      let spec = null;
      if (rawSpec) {
        if (rawSpec.startsWith('{')) {
          try { spec = JSON.parse(rawSpec); } catch (_) { spec = { title: rawSpec }; }
        } else {
          spec = { desc: rawSpec };
        }
      } else if (rawText) {
        spec = { desc: rawText };
      }
      if (!spec || (!spec.title && !spec.desc)) return this.hideTooltip();

      this._tipAnchor = anchor;
      tip.innerHTML = '';
      if (spec.title) {
        const rarColor = spec.color || (spec.rarity && RARITIES[spec.rarity] ? RARITIES[spec.rarity].color : '#ffe8a3');
        let iconNode = null;
        if (spec.icon && spec.icon.kind === 'item' && typeof this.itemIcon === 'function') {
          iconNode = this.itemIcon(spec.icon.key, 30);
        } else if (spec.icon && spec.icon.kind === 'tool' && typeof this.toolIcon === 'function') {
          iconNode = this.toolIcon(spec.icon.id, spec.icon.tier || 'basica', 30);
        } else if (spec.icon && spec.icon.kind === 'ui') {
          iconNode = this.uiIcon(spec.icon.key, 24);
        }
        const titleWrap = document.createElement('div');
        titleWrap.className = 'tip-title-wrap';
        const titleEl = document.createElement('strong');
        titleEl.className = 'tip-title';
        titleEl.style.color = rarColor;
        titleEl.textContent = spec.title;
        titleWrap.appendChild(titleEl);
        if (spec.sub) {
          const subEl = document.createElement('div');
          subEl.className = 'tip-sub';
          subEl.textContent = spec.sub;
          titleWrap.appendChild(subEl);
        }
        const head = document.createElement('div');
        head.className = 'tip-head';
        if (iconNode) head.appendChild(iconNode);
        head.appendChild(titleWrap);
        tip.appendChild(head);
      }
      if (spec.desc) {
        const descEl = document.createElement('div');
        descEl.className = 'tip-desc';
        descEl.textContent = spec.desc;
        tip.appendChild(descEl);
      }
      if (Array.isArray(spec.stats) && spec.stats.length > 0) {
        const statsEl = document.createElement('div');
        statsEl.className = 'tip-stats';
        spec.stats.slice(0, 6).forEach(st => {
          const pill = document.createElement('span');
          pill.className = 'tip-stat-pill';
          pill.textContent = String(st);
          statsEl.appendChild(pill);
        });
        tip.appendChild(statsEl);
      }
      if (spec.foot) {
        const footEl = document.createElement('div');
        footEl.className = 'tip-foot';
        footEl.textContent = spec.foot;
        tip.appendChild(footEl);
      }

      tip.classList.remove('hidden');
      tip.setAttribute('aria-hidden', 'false');
      this._positionTooltip(tip, ev, anchor);
    }

    hideTooltip() {
      this._tipAnchor = null;
      const tip = document.getElementById('balaclava-tooltip');
      if (!tip) return;
      tip.classList.add('hidden');
      tip.setAttribute('aria-hidden', 'true');
    }

    bindTooltipDelegation() {
      if (typeof document === 'undefined') return;
      const migrateStaticTitles = () => {
        document.querySelectorAll('[title]').forEach(node => {
          const t = node.getAttribute('title');
          node.removeAttribute('title');
          if (t && !node.getAttribute('data-tip') && !node.getAttribute('data-tip-text')) {
            node.setAttribute('data-tip-text', t);
            if (!node.getAttribute('aria-label')) node.setAttribute('aria-label', t);
          }
        });
      };
      migrateStaticTitles();
      if (this._tooltipBound) return;
      this._tooltipBound = true;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', migrateStaticTitles, { once: true });
      }
      const selector = '[data-tip], [data-tip-text], [title]';
      document.addEventListener('mouseover', (e) => {
        const target = e.target && e.target.closest ? e.target.closest(selector) : null;
        if (!target) {
          this.hideTooltip();
          return;
        }
        this.showTooltip(target, e);
      }, { passive: true });
      document.addEventListener('mousemove', (e) => {
        if (!this._tipAnchor) return;
        if (!this._tipAnchor.isConnected) {
          this.hideTooltip();
          return;
        }
        const tip = document.getElementById('balaclava-tooltip');
        if (tip && !tip.classList.contains('hidden')) {
          this._positionTooltip(tip, e, this._tipAnchor);
        }
      }, { passive: true });
      document.addEventListener('mouseout', (e) => {
        if (!this._tipAnchor) return;
        const related = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest(selector) : null;
        if (!related || related !== this._tipAnchor) this.hideTooltip();
      }, { passive: true });
      document.addEventListener('focusin', (e) => {
        const target = e.target && e.target.closest ? e.target.closest(selector) : null;
        if (target) this.showTooltip(target, null);
      }, { passive: true });
      document.addEventListener('focusout', () => this.hideTooltip(), { passive: true });
      document.addEventListener('mousedown', () => this.hideTooltip(), { passive: true });
      document.addEventListener('scroll', () => this.hideTooltip(), { passive: true, capture: true });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.hideTooltip(); });

      if (typeof MutationObserver !== 'undefined') {
        const modalBackdrop = document.getElementById('modal-backdrop');
        if (modalBackdrop) {
          new MutationObserver(() => {
            if (modalBackdrop.classList.contains('hidden')) this.hideTooltip();
          }).observe(modalBackdrop, { attributes: true, attributeFilter: ['class'] });
        }
        const modalBody = document.getElementById('modal-body');
        if (modalBody) {
          new MutationObserver(() => {
            if (!this._tipAnchor || !this._tipAnchor.isConnected) this.hideTooltip();
          }).observe(modalBody, { childList: true });
        }
      }
    }

    getLatestSaveSlot() {
      let bestSlot = null;
      let bestTime = -1;
      let bestSeq = -1;
      [1, 2, 3].forEach(s => {
        const sum = this.game && this.game.saveSys ? this.game.saveSys.getSlotSummary(s) : null;
        if (sum) {
          const ts = Number(sum.savedAtTs) || Date.parse(sum.savedAt) || 0;
          const seq = Number(sum.savedSeq) || 0;
          if (!bestSlot || ts > bestTime || (ts === bestTime && seq >= bestSeq)) {
            bestTime = ts;
            bestSeq = seq;
            bestSlot = { slot: s, summary: sum };
          }
        }
      });
      return bestSlot;
    }

    openDiscordExternal() {
      const now = Date.now();
      if (this._discordCooldownUntil && now < this._discordCooldownUntil) return;
      this._discordCooldownUntil = now + 700;
      let win = null;
      try {
        win = window.open(DISCORD_URL, '_blank', 'noopener,noreferrer');
      } catch (_) {
        win = null;
      }
      if (!win || win.closed) {
        this.openModal('discord_fallback');
      }
    }

    executeQuitGame() {
      const g = this.game;
      if (g && g.started && g.saveSys && !(g.isPlayerDead && g.isPlayerDead())) {
        try {
          g.saveSys.save(g, g.currentSlot || 1, true);
        } catch (_) {}
      }

      // 1. Tauri v2 Desktop App Exit
      try {
        if (window.__TAURI__ && window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
          window.__TAURI__.core.invoke('exit_app');
          return;
        }
      } catch (_) {}
      try {
        if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
          window.__TAURI_INTERNALS__.invoke('exit_app');
          return;
        }
      } catch (_) {}

      // 2. Browser Window Close Fallback
      try { window.close(); } catch (_) {}
      setTimeout(() => {
        try {
          if (typeof window !== 'undefined' && !window.closed && this.activeModal === 'quit_confirm') {
            this.activeModal = 'quit_web_fallback';
            this.renderModal();
          }
        } catch (_) {}
      }, 160);
    }

    renderTitleScreen() {
      const box = document.getElementById('title-slots');
      if (!box) return;
      box.innerHTML = '';

      const navStack = this.el('div', { class: 'title-nav-stack' });
      const latest = this.getLatestSaveSlot();
      const hasAny = [1, 2, 3].some(s => this.game.saveSys.hasSave(s));

      if (latest) {
        const sSum = latest.summary;
        navStack.appendChild(this.el('button', {
          id: 'btn-title-continue',
          class: 'title-nav-btn primary',
          onclick: () => {
            Balaclava.Audio.init();
            if (Balaclava.Audio.fadeOutMusic) Balaclava.Audio.fadeOutMusic(650);
            this.playSceneTransition(tr('transition.loadingAdventure'), () => {
              this.game.saveSys.load(this.game, latest.slot);
              this.hideTitleScreen();
            }, { sub: tr('title.continueSub', { slot: latest.slot, level: sSum.level || 1, day: sSum.day || 1 }) });
          }
        }, [
          this.el('span', { style: 'display:inline-flex;align-items:center;gap:11px;' }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.iconPlay), width: 26, height: 26, alt: '' }),
            tr('title.continue')
          ]),
          this.el('span', { class: 'title-nav-sub' }, tr('title.continueSub', {
            slot: latest.slot,
            level: sSum.level || 1,
            day: sSum.day || 1
          }))
        ]));
      }

      navStack.appendChild(this.el('button', {
        id: 'btn-title-play',
        class: (latest ? 'title-nav-btn' : 'title-nav-btn primary') + (this.titleSlotPickerOpen ? ' is-open' : ''),
        'aria-expanded': this.titleSlotPickerOpen ? 'true' : 'false',
        onclick: () => {
          const ts = document.getElementById('title-screen');
          if (ts) ts.classList.remove('title-entering');
          this.titleSlotPickerOpen = !this.titleSlotPickerOpen;
          if (!this.titleSlotPickerOpen) this.confirmDeleteSlot = null;
          this.renderTitleScreen();
        }
      }, [
        this.el('span', { style: 'display:inline-flex;align-items:center;gap:11px;' }, [
          this.el('img', { class: 'pixel-img', src: 'assets/icons/scroll_map.png', width: 24, height: 24, alt: '' }),
          tr('title.play')
        ]),
        this.el('span', { class: 'title-nav-sub' }, hasAny ? tr('title.playSub') : tr('title.slotEmpty'))
      ]));

      if (this.titleSlotPickerOpen) {
        const drawer = this.el('div', { class: 'title-slot-drawer' });
        drawer.appendChild(this.el('div', { class: 'title-slot-drawer-head' }, tr('title.chooseSlot')));
        [1, 2, 3].forEach(s => {
          const sSum = this.game.saveSys.getSlotSummary(s);
          const isConfirming = this.confirmDeleteSlot === s;
          const rowCls = 'title-slot-row' + (!sSum ? ' is-empty' : '') + (isConfirming ? ' is-confirming' : '');
          const slotLineText = sSum
            ? tr('title.slotLine', { level: sSum.level, coins: sSum.coins, plots: sSum.plots || 1 })
            : tr('common.empty');

          const row = this.el('div', { class: rowCls }, [
            this.el('div', { class: 'title-slot-info' }, [
              this.el('strong', { class: 'title-slot-title' }, isConfirming
                ? tr('title.deleteAsk', { slot: s })
                : tr('title.slotTitle', { slot: s })),
              this.el('span', { class: 'title-slot-meta' }, isConfirming
                ? `${slotLineText} · ${tr('title.deleteWarn')}`
                : slotLineText)
            ]),
            this.el('div', { class: 'title-slot-actions' },
              isConfirming ? [
                this.el('button', {
                  id: `btn-confirm-delete-${s}`,
                  class: 'title-slot-btn danger',
                  onclick: () => {
                    this.game.saveSys.deleteSlot(s);
                    this.confirmDeleteSlot = null;
                    this.renderTitleScreen();
                  }
                }, tr('title.deleteConfirm')),
                this.el('button', {
                  id: `btn-cancel-delete-${s}`,
                  class: 'title-slot-btn neutral',
                  onclick: () => {
                    this.confirmDeleteSlot = null;
                    this.renderTitleScreen();
                  }
                }, tr('common.cancel'))
              ] : [
                this.el('button', {
                  id: `btn-slot-play-${s}`,
                  class: sSum ? 'title-slot-btn play' : 'title-slot-btn create',
                  onclick: () => {
                    Balaclava.Audio.init();
                    if (Balaclava.Audio.fadeOutMusic) Balaclava.Audio.fadeOutMusic(650);
                    const subText = sSum
                      ? tr('title.slotLine', { level: sSum.level, coins: sSum.coins, plots: sSum.plots || 1 })
                      : tr('transition.newWorldSub');
                    this.playSceneTransition(sSum ? tr('transition.loadingAdventure') : tr('transition.preparingAdventure'), () => {
                      this._lastTutStep = undefined;
                      if (sSum) this.game.saveSys.load(this.game, s);
                      else this.game.startNewGame(s);
                      this.hideTitleScreen();
                    }, { sub: subText });
                  }
                }, sSum ? tr('title.loadSlotBtn') : tr('title.createSlotBtn')),
                sSum ? this.el('button', {
                  id: `btn-slot-reset-${s}`,
                  class: 'title-slot-btn reset',
                  'data-tip-text': tr('title.resetSlotTip'),
                  'aria-label': tr('title.resetSlotTip'),
                  onclick: () => {
                    this.confirmDeleteSlot = s;
                    this.renderTitleScreen();
                  }
                }, [this.uiIcon('iconTrash', 14), tr('title.resetSlotBtn')]) : null
              ]
            )
          ]);
          drawer.appendChild(row);
        });
        navStack.appendChild(drawer);
      }

      navStack.appendChild(this.el('button', {
        id: 'btn-title-settings',
        class: 'title-nav-btn',
        onclick: () => this.openModal('title_settings')
      }, [
        this.el('span', { style: 'display:inline-flex;align-items:center;gap:11px;' }, [
          this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.iconSettings), width: 26, height: 26, alt: '' }),
          tr('title.settings')
        ]),
        this.el('span', { class: 'title-nav-sub' }, tr('title.settingsSub'))
      ]));

      navStack.appendChild(this.el('button', {
        id: 'btn-title-quit',
        class: 'title-nav-btn danger',
        onclick: () => this.executeQuitGame()
      }, [
        this.el('span', { style: 'display:inline-flex;align-items:center;gap:11px;' }, [
          this.el('img', { class: 'pixel-img', src: 'assets/ui/ico_cross.png', width: 22, height: 22, alt: '' }),
          tr('title.quit')
        ]),
        this.el('span', { class: 'title-nav-sub' }, tr('title.quitSub'))
      ]));

      box.appendChild(navStack);

      const cornerActions = this.el('div', { class: 'title-corner-actions' }, [
        this.el('button', {
          id: 'btn-title-discord',
          class: 'title-nav-btn title-sq-btn discord',
          'data-tip-text': `${tr('title.discord')} — ${tr('title.discordSub')}`,
          'aria-label': tr('title.discord'),
          onclick: () => this.openDiscordExternal()
        }, [
          this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.iconDiscord || Balaclava.UI_URLS.iconStar), width: 28, height: 28, alt: '' })
        ]),
        this.el('button', {
          id: 'btn-title-credits',
          class: 'title-nav-btn title-sq-btn',
          'data-tip-text': `${tr('title.credits')} — ${tr('title.creditsSub')}`,
          'aria-label': tr('title.credits'),
          onclick: () => this.openModal('credits')
        }, [
          this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.iconInfo || Balaclava.UI_URLS.iconStar), width: 28, height: 28, alt: '' })
        ])
      ]);
      box.appendChild(cornerActions);
    }

    playSceneTransition(label, onMidpoint, onDoneOrOpts = null, extraOpts = null) {
      const onDone = typeof onDoneOrOpts === 'function' ? onDoneOrOpts : null;
      const opts = (typeof onDoneOrOpts === 'object' && onDoneOrOpts !== null) ? onDoneOrOpts : (extraOpts || {});
      const overlay = document.getElementById('scene-transition');
      if (!overlay) {
        if (typeof onMidpoint === 'function') onMidpoint();
        if (typeof onDone === 'function') onDone();
        return;
      }
      if (this._sceneTransitionTimer) {
        clearTimeout(this._sceneTransitionTimer);
        this._sceneTransitionTimer = null;
      }
      if (this._sceneTransitionEndTimer) {
        clearTimeout(this._sceneTransitionEndTimer);
        this._sceneTransitionEndTimer = null;
      }
      this._stopTransitionDiorama();

      const inferredSave = (!opts.kind && label && /guard|sav|salv/i.test(label));
      const sceneKind = opts.kind === 'dungeon' ? 'dungeon' : ((opts.kind === 'save' || inferredSave) ? 'save' : 'overworld');

      overlay.classList.toggle('is-dungeon', sceneKind === 'dungeon');
      overlay.classList.toggle('is-save', sceneKind === 'save');

      const lblEl = document.getElementById('scene-transition-label');
      if (lblEl) lblEl.textContent = label || 'BALACLAVA';

      const subEl = document.getElementById('scene-transition-sub');
      if (subEl) {
        const subTxt = opts.sub || '';
        subEl.textContent = subTxt;
        if (subTxt) subEl.classList.remove('hidden');
        else subEl.classList.add('hidden');
      }

      const iconEl = document.getElementById('scene-transition-icon');
      if (iconEl) {
        iconEl.src = opts.icon || 'assets/icons/balaclava_core.png';
      }

      const statusEl = document.getElementById('st-loading-text');
      if (statusEl) {
        const trFn = (k, fb) => (Balaclava.I18n && Balaclava.I18n.t) ? Balaclava.I18n.t(k) : fb;
        if (sceneKind === 'dungeon') statusEl.textContent = trFn('transition.statusDungeon', 'Unsealing ancient catacombs...');
        else if (sceneKind === 'save') statusEl.textContent = trFn('transition.statusSave', 'Inscribing island chronicle...');
        else statusEl.textContent = trFn('transition.statusOverworld', 'Sailing across the archipelago...');
      }

      const barFillEl = document.getElementById('st-loading-bar-fill');
      const pctEl = document.getElementById('st-loading-pct');
      if (barFillEl) barFillEl.style.width = '0%';
      if (pctEl) pctEl.textContent = '0%';

      const tipEl = document.getElementById('scene-transition-tip-text');
      if (tipEl) {
        if (opts.tip) {
          tipEl.textContent = opts.tip;
        } else {
          const isEn = Boolean(Balaclava.I18n && ((Balaclava.I18n.getLanguage && Balaclava.I18n.getLanguage() === 'en') || Balaclava.I18n.lang === 'en'));
          const tipsEs = [
            'Construye una Mesa de Artesanía para forjar herramientas de mayor rango.',
            'Explora los bordes del archipiélago para desbloquear nuevas islas con monedas.',
            'Los árboles y rocas a veces sueltan monedas brillantes adicionales.',
            'Comer bayas o descansar junto a una fogata restaura tu salud y energía.',
            'Cada bioma alberga minerales exclusivos como cobre, hierro, oro y cristales.',
            'Sube de nivel para ganar Puntos de Constelación y desbloquear pasivas legendarias.',
            'Las mazmorras antiguas esconden cofres dorados con reliquias permanentes.',
            'Usa el esquive (Espacio) para moverte más rápido y evadir peligros.',
            'Crea un Horno de Fundición para convertir minerales en lingotes refinados.'
          ];
          const tipsEn = [
            'Build a Crafting Table to forge higher tier tools and equipment.',
            'Explore island borders to unlock new lands using your earned coins.',
            'Trees and rocks occasionally drop shiny bonus coins when broken.',
            'Eating berries or resting near a campfire restores your health and energy.',
            'Each biome holds unique ores such as copper, iron, gold and crystals.',
            'Level up to earn Constellation Points and unlock legendary passives.',
            'Ancient dungeons conceal golden chests with permanent relics.',
            'Use dash (Space) to sprint swiftly and evade hazards.',
            'Build a Furnace to smelt raw ores into refined ingots.'
          ];
          const pool = isEn ? tipsEn : tipsEs;
          tipEl.textContent = pool[Math.floor(Math.random() * pool.length)];
        }
      }

      // Audio cue for atmospheric transition
      if (Balaclava.Audio) {
        Balaclava.Audio.play('portal');
        if (sceneKind === 'dungeon') {
          Balaclava.Audio.tone(130, 60, 0.65, 'sawtooth', 0.35);
        } else {
          Balaclava.Audio.tone(260, 130, 0.45, 'triangle', 0.25);
        }
      }

      const HOLD_MS = 5600;
      const EXIT_MS = 650;
      this._transitioning = true;
      overlay.classList.remove('hidden', 'is-opening', 'is-closing');
      void overlay.offsetWidth;
      overlay.classList.add('is-closing');

      this._startTransitionDiorama(sceneKind, HOLD_MS);

      this._sceneTransitionTimer = setTimeout(() => {
        if (barFillEl) barFillEl.style.width = '100%';
        if (pctEl) pctEl.textContent = '100%';
        try {
          if (typeof onMidpoint === 'function') onMidpoint();
        } finally {
          overlay.classList.remove('is-closing');
          overlay.classList.add('is-opening');
          if (Balaclava.Audio) {
            Balaclava.Audio.tone(196, 440, 0.45, 'sine', 0.22, 0.05);
          }
          this._sceneTransitionEndTimer = setTimeout(() => {
            this._stopTransitionDiorama();
            overlay.classList.remove('is-opening', 'is-closing', 'is-dungeon', 'is-save');
            overlay.classList.add('hidden');
            this._transitioning = false;
            if (typeof onDone === 'function') onDone();
          }, EXIT_MS);
        }
      }, HOLD_MS);
    }

    _getStSprite(key, fallbackPath) {
      const a = Balaclava.Assets;
      if (a) {
        const found = (a.get && a.get(key))
          || (a.extraImages && a.extraImages[key])
          || (a.dungeonImages && a.dungeonImages[key])
          || (a.chestImages && a.chestImages[key])
          || (a.enemyImages && a.enemyImages[key]);
        if (found) return found;
      }
      if (!fallbackPath || typeof Image === 'undefined') return null;
      this._stSpriteCache = this._stSpriteCache || {};
      let img = this._stSpriteCache[key];
      if (!img) {
        img = new Image();
        const root = (typeof window !== 'undefined' && window.BALACLAVA_ROOT_BASE) ? window.BALACLAVA_ROOT_BASE : '';
        img.src = encodeURI(root + fallbackPath);
        this._stSpriteCache[key] = img;
      }
      return img;
    }

    _isStImgReady(img) {
      return Boolean(img && img.complete !== false && (img.naturalWidth === undefined || img.naturalWidth > 0) && (img.width === undefined || img.width > 0));
    }

    _drawPixelSprite(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, flipX = false) {
      if (!this._isStImgReady(img)) return false;
      const rx = Math.round(dx);
      const ry = Math.round(dy);
      const rw = Math.round(dw);
      const rh = Math.round(dh);
      ctx.imageSmoothingEnabled = false;
      if (!flipX) {
        ctx.drawImage(img, sx, sy, sw, sh, rx, ry, rw, rh);
      } else {
        ctx.save();
        ctx.translate(rx + rw, ry);
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, rw, rh);
        ctx.restore();
      }
      return true;
    }

    _drawDitherBands(ctx, w, bands) {
      for (let i = 0; i < bands.length; i++) {
        const b = bands[i];
        ctx.fillStyle = b[2];
        ctx.fillRect(0, b[0], w, b[1] - b[0]);
      }
    }

    _drawDitherLight(ctx, cx, cy, rx, ry, outerCol, coreCol) {
      const ix = Math.round(cx);
      const iy = Math.round(cy);
      const minY = Math.round(iy - ry);
      const maxY = Math.round(iy + ry);
      for (let py = minY; py <= maxY; py += 2) {
        const ny = (py - iy) / Math.max(1, ry);
        const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - ny * ny)));
        if (span <= 0) continue;
        const innerSpan = Math.floor(span * 0.56);
        if (coreCol && innerSpan > 2 && Math.abs(py - iy) <= ry * 0.6) {
          ctx.fillStyle = coreCol;
          ctx.fillRect(ix - innerSpan, py, innerSpan * 2, 2);
        }
        ctx.fillStyle = outerCol;
        const startX = ix - span;
        const endX = ix + span;
        for (let px = startX; px <= endX; px += 4) {
          if (coreCol && Math.abs(px - ix) <= innerSpan && Math.abs(py - iy) <= ry * 0.56) continue;
          const phase = (((px >> 2) + (py >> 1)) & 1) * 2;
          ctx.fillRect(px + phase, py, 2, 2);
        }
      }
    }

    _drawPixelCloud(ctx, x, y, w, cBase, cLit, cShade) {
      const rx = Math.round(x);
      const ry = Math.round(y);
      ctx.fillStyle = cShade;
      ctx.fillRect(rx, ry + 10, w, 7);
      ctx.fillStyle = cBase;
      ctx.fillRect(rx + 4, ry + 6, w - 8, 9);
      ctx.fillRect(rx + Math.round(w * 0.2), ry + 2, Math.round(w * 0.48), 6);
      ctx.fillStyle = cLit;
      ctx.fillRect(rx + Math.round(w * 0.28), ry, Math.round(w * 0.28), 3);
    }

    _resolveTransitionHeroSkin() {
      const skins = Balaclava.SKINS || [];
      let skinId = Balaclava.game && Balaclava.game.player && Balaclava.game.player.skinId;
      if (!skinId && typeof window !== 'undefined' && window.localStorage) {
        try { skinId = window.localStorage.getItem('balaclava_player_skin'); } catch (_) {}
      }
      return skins.find(s => s.id === skinId) || skins[0] || {
        id: 'monk_yellow',
        idle: 'monk_yellow_idle',
        run: 'monk_yellow_run'
      };
    }

    _startTransitionDiorama(sceneKind, durationMs) {
      this._stopTransitionDiorama();
      const canvas = document.getElementById('st-pixel-canvas');
      if (!canvas || typeof canvas.getContext !== 'function') return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const startMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const dur = Math.max(400, durationMs || 5600);
      const state = { active: true, rafId: null, kind: sceneKind, startMs, dur };
      this._stDioramaState = state;

      const barFillEl = document.getElementById('st-loading-bar-fill');
      const pctEl = document.getElementById('st-loading-pct');

      const step = (nowTs) => {
        if (!state.active || this._stDioramaState !== state) return;
        const now = (typeof nowTs === 'number') ? nowTs : Date.now();
        const elapsed = Math.max(0, now - state.startMs);
        const t = elapsed / 1000;
        const rawNorm = Math.min(1, elapsed / state.dur);
        const eased = Math.min(1, 0.28 * rawNorm + 0.72 * (1 - Math.pow(1 - rawNorm, 2.3)));

        if (barFillEl) barFillEl.style.width = (eased * 100).toFixed(1) + '%';
        if (pctEl) pctEl.textContent = Math.min(100, Math.round(eased * 100)) + '%';

        this._renderTransitionFrame(ctx, state.kind, t, eased);

        if (typeof requestAnimationFrame === 'function') {
          state.rafId = requestAnimationFrame(step);
        }
      };

      this._renderTransitionFrame(ctx, state.kind, 0, 0);
      if (typeof requestAnimationFrame === 'function') {
        state.rafId = requestAnimationFrame(step);
      }
    }

    _stopTransitionDiorama() {
      const state = this._stDioramaState;
      if (!state) return;
      state.active = false;
      if (state.rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(state.rafId);
      }
      this._stDioramaState = null;
    }

    _renderTransitionFrame(ctx, sceneKind, t, normP) {
      ctx.imageSmoothingEnabled = false;
      if (sceneKind === 'dungeon') {
        this._renderDungeonDiorama(ctx, t, normP);
      } else {
        this._renderOverworldDiorama(ctx, t, normP, sceneKind === 'save');
      }
    }

    _renderOverworldDiorama(ctx, t, normP, isSave) {
      const W = 640;
      const H = 360;
      // 1. Calm stepped atmospheric night ocean sky (zero seam teeth)
      this._drawDitherBands(ctx, W, [
        [0, 44, '#050b16'],
        [44, 90, '#071222'],
        [90, 138, '#0a1a2e'],
        [138, 180, '#0e233d'],
        [180, 214, '#132e4d']
      ]);

      // 2. Crisp pixel stars with gentle stepped twinkle
      const stars = [
        [36, 22], [88, 46], [152, 16], [208, 62], [272, 26], [336, 44], [404, 18], [468, 54], [584, 30],
        [60, 102], [124, 82], [184, 118], [256, 94], [368, 90], [436, 110], [500, 78], [612, 106],
        [28, 154], [104, 146], [232, 162], [412, 150], [564, 158], [596, 134]
      ];
      const tick = Math.floor(t * 2.0);
      for (let i = 0; i < stars.length; i++) {
        const [sx, sy] = stars[i];
        const bright = ((i + tick) % 5) === 0;
        ctx.fillStyle = bright ? '#f5ebd6' : ((i % 2 === 0) ? '#7fa2c2' : '#4a6f91');
        ctx.fillRect(sx, sy, 2, 2);
      }

      // 3. Hand-pixeled crescent moon in upper-right sky
      const mx = 548;
      const my = 34;
      ctx.fillStyle = '#f3e7c2';
      ctx.fillRect(mx + 4, my, 8, 2);
      ctx.fillRect(mx + 2, my + 2, 6, 2);
      ctx.fillRect(mx, my + 4, 6, 8);
      ctx.fillRect(mx + 2, my + 12, 6, 2);
      ctx.fillRect(mx + 4, my + 14, 8, 2);
      ctx.fillStyle = '#c8b88e';
      ctx.fillRect(mx + 10, my + 2, 2, 2);
      ctx.fillRect(mx + 10, my + 12, 2, 2);

      // 4. Slow drifting multi-shade pixel clouds
      const cloudWrap = (base, speed) => ((Math.round(base + t * speed)) % (W + 140)) - 110;
      this._drawPixelCloud(ctx, cloudWrap(48, 5.2), 54, 72, '#132840', '#1c3857', '#0d1d30');
      this._drawPixelCloud(ctx, cloudWrap(372, 3.8), 94, 56, '#162f4b', '#204266', '#102238');
      this._drawPixelCloud(ctx, cloudWrap(208, 2.8), 136, 44, '#1a3857', '#254c73', '#132a44');

      // 5. Distant silhouetted archipelago ridges resting on the sea horizon
      ctx.fillStyle = '#0b1e32';
      ctx.fillRect(16, 202, 108, 12);
      ctx.fillRect(32, 194, 68, 8);
      ctx.fillRect(48, 186, 28, 8);
      ctx.fillStyle = '#0e263d';
      ctx.fillRect(488, 200, 132, 14);
      ctx.fillRect(512, 190, 80, 10);
      ctx.fillRect(536, 182, 32, 8);
      ctx.fillStyle = '#f2b84b';
      ctx.fillRect(72, 204, 2, 2);
      ctx.fillRect(548, 202, 2, 2);

      // 6. Living animated ocean plane (y = 214..360) using BALACLAVA water sprites + twilight depth glaze
      const seaTop = 214;
      const waterImg = this._getStSprite('water_profundo', 'assets/tiles/water_profundo.png');
      ctx.fillStyle = '#1f648d';
      ctx.fillRect(0, seaTop, W, H - seaTop);

      const WT = 32;
      if (this._isStImgReady(waterImg)) {
        const wFrames = Math.max(1, Math.floor((waterImg.width || 80) / 16));
        const wFrame = Math.floor(t * 4.2) % wFrames;
        for (let wy = seaTop; wy < H; wy += WT) {
          const dh = Math.min(WT, H - wy);
          const sh = Math.max(1, Math.floor(dh / 2));
          for (let wx = 0; wx < W; wx += WT) {
            this._drawPixelSprite(ctx, waterImg, wFrame * 16, 0, 16, sh, wx, wy, WT, dh);
          }
        }
      } else {
        const wf = Math.floor(t * 4) % 4;
        for (let wy = seaTop; wy < H; wy += WT) {
          const dh = Math.min(WT, H - wy);
          for (let wx = 0; wx < W; wx += WT) {
            const alt = (((wx + wy) >> 5) + (wf & 1)) & 1;
            ctx.fillStyle = alt ? '#236b96' : '#1d5b82';
            ctx.fillRect(wx, wy, WT, dh);
            if (dh >= 14) {
              ctx.fillStyle = '#3b8fb8';
              ctx.fillRect(wx + 6 + (wf * 3) % 10, wy + 12, 8, 2);
            }
          }
        }
      }

      // Stepped twilight ocean veil: misty blue-navy at horizon, rich readable ocean around & in front of island
      ctx.fillStyle = 'rgba(7, 20, 38, 0.48)';
      ctx.fillRect(0, seaTop, W, 12);
      ctx.fillStyle = 'rgba(7, 20, 38, 0.39)';
      ctx.fillRect(0, seaTop + 12, W, 14);
      ctx.fillStyle = 'rgba(7, 20, 38, 0.31)';
      ctx.fillRect(0, seaTop + 26, W, 18);
      ctx.fillStyle = 'rgba(6, 18, 34, 0.25)';
      ctx.fillRect(0, seaTop + 44, W, 24);
      ctx.fillStyle = 'rgba(6, 18, 34, 0.19)';
      ctx.fillRect(0, seaTop + 68, W, H - (seaTop + 68));

      // Crisp horizon line + distant island shoreline shadows & harbor lantern glints
      ctx.fillStyle = '#2e7aa1';
      ctx.fillRect(0, seaTop, W, 2);
      ctx.fillStyle = '#4da3c9';
      ctx.fillRect(496, seaTop, 112, 2);
      ctx.fillStyle = 'rgba(6, 18, 34, 0.45)';
      ctx.fillRect(16, seaTop + 2, 108, 3);
      ctx.fillRect(488, seaTop + 2, 132, 3);

      // Moonlit shimmer ripples & harbor lantern reflections
      const moonRipple = Math.round(Math.sin(t * 2.4) * 2);
      ctx.fillStyle = '#9cd9ed';
      ctx.fillRect(542 + moonRipple, 219, 14, 2);
      ctx.fillRect(546 - moonRipple, 224, 10, 2);
      ctx.fillStyle = '#64b5d4';
      ctx.fillRect(548 + moonRipple, 230, 8, 2);
      ctx.fillRect(550, 236, 4, 2);

      ctx.fillStyle = ((Math.floor(t * 4) & 1) === 0) ? '#d99e43' : '#a3732c';
      ctx.fillRect(71, 219, 4, 2);
      ctx.fillRect(72, 224, 2, 2);
      ctx.fillRect(547, 219, 4, 2);
      ctx.fillRect(548, 224, 2, 2);

      // Drifting surface ocean glints across left, right, horizon & foreground waters
      const waves = [
        [24, 226, 12, 7.2], [178, 232, 14, 5.4], [326, 224, 10, 8.1], [442, 236, 12, 6.0],
        [14, 274, 10, 6.4], [28, 298, 12, 5.2], [602, 268, 10, 6.8], [610, 296, 12, 5.6],
        [44, 326, 14, 7.6], [164, 336, 12, 5.8], [296, 328, 16, 6.9], [438, 340, 12, 6.1], [568, 332, 14, 5.5]
      ];
      for (let i = 0; i < waves.length; i++) {
        const [bx, by, len, sp] = waves[i];
        const wx = Math.round((bx + t * sp) % (W + 32)) - 16;
        ctx.fillStyle = (i % 2 === 0) ? '#78cde8' : '#a8e4f5';
        ctx.fillRect(wx, by, len, 2);
      }

      // 7. Foreground Archipelago Island seated directly in the ocean with shoreline surf & water reflection
      const TILE = 48;
      const COLS = 11;
      const ix = 56;
      const iw = COLS * TILE;
      const foamImg = this._getStSprite('water_foam', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Water Foam.png');
      const tileImg = this._getStSprite('tile_1', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset/Tilemap_color1.png');

      // Water shadow directly underneath the island shoreline + warm campfire reflection on the ocean
      ctx.fillStyle = 'rgba(6, 20, 38, 0.24)';
      ctx.fillRect(ix + 10, 305, iw - 20, 14);
      ctx.fillStyle = 'rgba(6, 20, 38, 0.34)';
      ctx.fillRect(ix + 16, 304, iw - 32, 8);

      const fireReflectShift = Math.round(Math.sin(t * 4.5) * 2);
      ctx.fillStyle = 'rgba(255, 192, 82, 0.62)';
      ctx.fillRect(415 + fireReflectShift, 315, 16, 2);
      ctx.fillStyle = 'rgba(255, 164, 58, 0.48)';
      ctx.fillRect(418 - fireReflectShift, 320, 12, 2);
      ctx.fillStyle = 'rgba(255, 213, 96, 0.34)';
      ctx.fillRect(421 + fireReflectShift, 325, 6, 2);

      // Phase-offset rolling ocean surf wrapping smoothly around the island shoreline BEFORE the grass plateau
      if (this._isStImgReady(foamImg)) {
        const foamFrame = Math.floor(t * 7) % 16;
        ctx.save();
        ctx.globalAlpha = 0.58;
        for (let col = 0; col < COLS; col++) {
          const isLeft = col === 0;
          const isRight = col === COLS - 1;
          const colFrame = (foamFrame + col * 5) % 16;
          const fx = colFrame * 192 + (isLeft ? 48 : 64);
          const fw = (isLeft || isRight) ? 80 : 64;
          const dx = isLeft ? (ix - 6) : (ix + col * TILE);
          const dw = (isLeft || isRight) ? (TILE + 6) : TILE;
          this._drawPixelSprite(ctx, foamImg, fx, 114, fw, 32, dx, 293, dw, 26);
        }
        ctx.restore();
      } else {
        const foamPulse = Math.floor(t * 2.5) % 2;
        ctx.fillStyle = 'rgba(138, 220, 242, 0.65)';
        ctx.fillRect(ix - 4 - foamPulse * 2, 306, iw + 8 + foamPulse * 4, 3);
      }

      // Delicate pixel surf lines kissing left, right & front waterlines
      const surfShift = (Math.floor(t * 3) & 1) ? 2 : 0;
      ctx.fillStyle = '#9ce7fa';
      ctx.fillRect(ix - 7 - surfShift, 282, 5, 2);
      ctx.fillRect(ix + iw + 2 + surfShift, 284, 5, 2);
      ctx.fillStyle = 'rgba(142, 224, 245, 0.72)';
      ctx.fillRect(ix + 18 - surfShift, 316, 20, 2);
      ctx.fillRect(ix + 150 + surfShift, 318, 24, 2);
      ctx.fillRect(ix + 296 - surfShift, 317, 22, 2);
      ctx.fillRect(ix + 456 + surfShift, 316, 18, 2);

      if (this._isStImgReady(tileImg)) {
        // Real 9-slice grass island plateau merged cleanly down to its natural dark-green coastal lip
        for (let col = 0; col < COLS; col++) {
          const sx = col === 0 ? 0 : (col === COLS - 1 ? 128 : 64);
          this._drawPixelSprite(ctx, tileImg, sx, 0, 64, 48, ix + col * TILE, 246, TILE, 36);
          this._drawPixelSprite(ctx, tileImg, sx, 128, 64, 64, ix + col * TILE, 268, TILE, 40);
        }
      } else {
        ctx.fillStyle = '#2d5c2d';
        ctx.fillRect(ix + 2, 274, iw - 4, 10);
        ctx.fillStyle = '#4c8f40';
        ctx.fillRect(ix + 8, 256, iw - 16, 22);
        ctx.fillStyle = '#68b34c';
        ctx.fillRect(ix + 14, 250, iw - 28, 12);
      }

      // 8. Native-scale world props from BALACLAVA assets
      const tree1Img = this._getStSprite('tree1', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree1.png');
      const tree4Img = this._getStSprite('tree4', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Wood/Trees/Tree4.png');
      const houseImg = this._getStSprite('b_house1_blue', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/House1.png');
      const bushImg = this._getStSprite('bush1', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Bushes/Bushe1.png');
      const rockImg = this._getStSprite('rock1', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Decorations/Rocks/Rock1.png');
      const fireImg = this._getStSprite('campfireAnim', 'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/10_Overworld/Campsite/campfire_anim_6f.png');

      if (this._isStImgReady(tree1Img)) {
        const tFrame = Math.floor(t * 3.5) % 8;
        this._drawPixelSprite(ctx, tree1Img, tFrame * 192, 0, 192, 256, 62, 138, 102, 136);
      }
      if (this._isStImgReady(houseImg)) {
        this._drawPixelSprite(ctx, houseImg, 0, 0, houseImg.width, houseImg.height, 146, 174, 72, 108);
        // Warm cabin lantern window & subtle chimney smoke puffs
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(178, 240, 6, 6);
        for (let k = 0; k < 3; k++) {
          const sp = (t * 8 + k * 7) % 21;
          ctx.fillStyle = 'rgba(180, 205, 225, 0.35)';
          ctx.fillRect(Math.round(166 + Math.sin(t * 1.8 + k) * 3), Math.round(176 - sp), 3, 2);
        }
      }
      if (this._isStImgReady(tree4Img)) {
        const t4Frame = Math.floor(t * 3.2 + 2) % 8;
        this._drawPixelSprite(ctx, tree4Img, t4Frame * 192, 0, 192, 192, 474, 182, 96, 96);
      }
      if (this._isStImgReady(bushImg)) {
        const bFrame = Math.floor(t * 2.5) % 8;
        this._drawPixelSprite(ctx, bushImg, bFrame * 128, 0, 128, 128, 456, 236, 52, 52);
      }
      if (this._isStImgReady(rockImg)) {
        this._drawPixelSprite(ctx, rockImg, 0, 0, rockImg.width, rockImg.height, 536, 252, 32, 32);
      }

      // 9. Campfire & quantized Bayer dithered warm island light pool
      const firePulse = ((Math.floor(t * 8)) & 1) ? 4 : 0;
      this._drawDitherLight(ctx, 424, 268, 44 + firePulse, 16, 'rgba(255, 166, 61, 0.16)', 'rgba(255, 213, 79, 0.24)');
      if (this._isStImgReady(fireImg)) {
        const cFrame = Math.floor(t * 9) % 6;
        this._drawPixelSprite(ctx, fireImg, cFrame * 16, 0, 16, 16, 408, 242, 32, 32);
      } else {
        ctx.fillStyle = '#ff9800';
        ctx.fillRect(418, 254, 12, 14);
        ctx.fillStyle = '#ffe082';
        ctx.fillRect(422, 250, 4, 12);
      }
      for (let e = 0; e < 5; e++) {
        const phase = (t * 18 + e * 7) % 32;
        const ex = 423 + Math.round(Math.sin(t * 3 + e * 2.1) * 5);
        const ey = Math.round(244 - phase);
        ctx.fillStyle = (e & 1) ? '#ffe082' : '#ff7043';
        ctx.fillRect(ex, ey, 2, 2);
      }

      // 10. Active Player Skin Hero + Sheep at full game resolution (96x96 & 64x64)
      const skin = this._resolveTransitionHeroSkin();
      const useIdle = Boolean(isSave);
      const heroKey = useIdle ? (skin.idle || 'monk_yellow_idle') : (skin.run || 'monk_yellow_run');
      const heroImg = this._getStSprite(heroKey, 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Pawn/Pawn_Run.png');
      const sheepKey = useIdle ? 'sheep_idle' : 'sheep_move';
      const sheepImg = this._getStSprite(sheepKey, 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Resources/Meat/Sheep/Sheep_Move.png');

      const heroX = useIdle ? 326 : Math.round(220 + normP * 116);
      const sheepX = useIdle ? 268 : (heroX - 60);

      if (this._isStImgReady(sheepImg)) {
        const sFrames = useIdle ? Math.max(1, Math.floor(sheepImg.width / 128)) : 4;
        const sf = Math.floor(t * (useIdle ? 4 : 7)) % sFrames;
        this._drawPixelSprite(ctx, sheepImg, sf * 128, 0, 128, 128, sheepX, 224, 64, 64);
      }
      if (this._isStImgReady(heroImg)) {
        const hFrames = Math.max(1, Math.floor(heroImg.width / 192));
        const hf = Math.floor(t * (useIdle ? 6 : 10)) % hFrames;
        this._drawPixelSprite(ctx, heroImg, hf * 192, 0, 192, 192, heroX, 196, 96, 96);
      }
    }

    _renderDungeonDiorama(ctx, t, normP) {
      const W = 640;
      const FDA = 'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/';

      // 1. Deep subterranean cavern vault backdrop
      this._drawDitherBands(ctx, W, [
        [0, 62, '#07050b'],
        [62, 126, '#0c0914'],
        [126, 182, '#130e1e'],
        [182, 360, '#09070e']
      ]);

      // Floating cavern dust specks in upper darkness
      const dustTick = Math.floor(t * 6);
      for (let d = 0; d < 16; d++) {
        const dx = (44 + d * 38 + ((dustTick + d) % 11)) % W;
        const dy = 48 + ((d * 31 + Math.round(t * 4)) % 110);
        ctx.fillStyle = (d % 3 === 0) ? '#544666' : '#31283d';
        ctx.fillRect(dx, dy, 2, 2);
      }

      // 2. Load real FantasyDungeonAdventure tiles & props
      const wallImg = this._getStSprite('pradera_wall', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_mid.png');
      const bannerImg = this._getStSprite('pradera_wallBanner', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/face_banner_red.png');
      const floorImg = this._getStSprite('pradera_floor1', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_1.png');
      const floorCrack = this._getStSprite('pradera_floor2', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Floors/floor_cracked.png');
      const doorClosed = this._getStSprite('st_stone_door_closed', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_iron_closed.png');
      const doorOpen = this._getStSprite('st_stone_door_open', FDA + '01_Dungeon_Tiles/Stone_Dungeon/Walls/Faces_16x32/door_iron_open.png');
      const pillarImg = this._getStSprite('pradera_pillar', FDA + '02_Props/Statues_Pillars/pillar_stone_16x48.png');
      const torchImg = this._getStSprite('torch_orange', FDA + '02_Props/Lights/wall_torch_orange_anim_6f.png');
      const brazierImg = this._getStSprite('brazier_orange', FDA + '02_Props/Lights/brazier_orange_16x32_anim_6f.png');
      const statueImg = this._getStSprite('statue_knight', FDA + '02_Props/Statues_Pillars/statue_knight_16x32.png');
      const chestImg = this._getStSprite('st_fda_chest_gold', FDA + '02_Props/Chests/chest_gold_closed.png');
      const webTL = this._getStSprite('st_cobweb_tl', FDA + '02_Props/Bones_Webs_Chains/cobweb_TL.png');
      const webTR = this._getStSprite('st_cobweb_tr', FDA + '02_Props/Bones_Webs_Chains/cobweb_TR.png');
      const skelImg = this._getStSprite('skeleton', 'assets/sprites_extra/enemies/skeleton_warrior_rogue_48px_4f.png');

      // Stone cornice ridge above corridor wall
      ctx.fillStyle = '#1b1626';
      ctx.fillRect(0, 166, W, 8);
      ctx.fillStyle = '#292238';
      ctx.fillRect(0, 172, W, 3);

      // 3. Corridor wall tiles (14 columns x 48px = exact 3x pixel scale across 640px)
      const COLS = 14;
      const WALL_X0 = -16;
      const WALL_Y = 174;
      for (let col = 0; col < COLS; col++) {
        const wx = WALL_X0 + col * 48;
        if (this._isStImgReady(wallImg)) {
          this._drawPixelSprite(ctx, wallImg, 0, 0, 16, 32, wx, WALL_Y, 48, 96);
        } else {
          ctx.fillStyle = '#2b2638';
          ctx.fillRect(wx, WALL_Y, 46, 96);
        }
        if ((col === 3 || col === 10) && this._isStImgReady(bannerImg)) {
          this._drawPixelSprite(ctx, bannerImg, 0, 0, 16, 32, wx, WALL_Y, 48, 96);
        }
      }

      // 4. Flagstone floor rows (2 rows x 48px at exact TILE_SIZE = 48 + foreground slab)
      for (let row = 0; row < 2; row++) {
        const fy = 268 + row * 40;
        for (let col = 0; col < COLS; col++) {
          const fx = WALL_X0 + col * 48;
          const fSrc = ((col + row) % 3 === 1 && this._isStImgReady(floorCrack)) ? floorCrack : floorImg;
          if (this._isStImgReady(fSrc)) {
            this._drawPixelSprite(ctx, fSrc, 0, 0, 16, 16, fx, fy, 48, 40);
          } else {
            ctx.fillStyle = (col + row) & 1 ? '#1e1a28' : '#252030';
            ctx.fillRect(fx, fy, 48, 40);
          }
        }
      }
      ctx.fillStyle = '#07050a';
      ctx.fillRect(0, 342, W, 18);

      // Quantized shadow vignette framing outer wings
      ctx.fillStyle = 'rgba(6, 4, 12, 0.50)';
      ctx.fillRect(0, 174, 84, 168);
      ctx.fillRect(556, 174, 84, 168);

      // 5. Central Iron Archway Gate (clicks open smoothly as progress passes midpoint)
      const isGateOpen = normP >= 0.56;
      const gateImg = isGateOpen ? doorOpen : doorClosed;
      if (this._isStImgReady(gateImg)) {
        this._drawPixelSprite(ctx, gateImg, 0, 0, 16, 32, 296, 174, 48, 96);
      } else {
        ctx.fillStyle = isGateOpen ? '#050408' : '#3a3548';
        ctx.fillRect(298, 184, 44, 86);
      }
      if (isGateOpen) {
        this._drawDitherLight(ctx, 320, 260, 32, 14, 'rgba(130, 177, 255, 0.14)', 'rgba(179, 136, 255, 0.18)');
      }

      // 6. Cobwebs, Knight Statue, Chest & Carved Stone Pillars
      if (this._isStImgReady(webTL)) this._drawPixelSprite(ctx, webTL, 0, 0, 16, 16, 0, 174, 40, 40);
      if (this._isStImgReady(webTR)) this._drawPixelSprite(ctx, webTR, 0, 0, 16, 16, W - 40, 174, 40, 40);
      if (this._isStImgReady(pillarImg)) {
        this._drawPixelSprite(ctx, pillarImg, 0, 0, 16, 48, 56, 152, 44, 132);
        this._drawPixelSprite(ctx, pillarImg, 0, 0, 16, 48, 540, 152, 44, 132);
      }
      if (this._isStImgReady(statueImg)) {
        this._drawPixelSprite(ctx, statueImg, 0, 0, 16, 32, 128, 204, 36, 72);
      }
      if (this._isStImgReady(chestImg)) {
        this._drawPixelSprite(ctx, chestImg, 0, 0, chestImg.width, chestImg.height, 480, 250, 32, 32);
      }

      // 7. Flickering Wall Torches, Standing Braziers & Quantized Bayer Light Pools
      const torchFr = Math.floor(t * 9) % 6;
      const pulse = (torchFr & 1) ? 4 : 0;
      this._drawDitherLight(ctx, 232, 248, 58 + pulse, 28, 'rgba(255, 128, 32, 0.16)', 'rgba(255, 195, 72, 0.24)');
      this._drawDitherLight(ctx, 408, 248, 58 - pulse, 28, 'rgba(255, 128, 32, 0.16)', 'rgba(255, 195, 72, 0.24)');

      if (this._isStImgReady(torchImg)) {
        this._drawPixelSprite(ctx, torchImg, torchFr * 16, 0, 16, 16, 236, 196, 32, 32);
        this._drawPixelSprite(ctx, torchImg, ((torchFr + 2) % 6) * 16, 0, 16, 16, 372, 196, 32, 32);
      }
      if (this._isStImgReady(brazierImg)) {
        this._drawPixelSprite(ctx, brazierImg, ((torchFr + 1) % 6) * 16, 0, 16, 32, 196, 212, 32, 64);
        this._drawPixelSprite(ctx, brazierImg, ((torchFr + 4) % 6) * 16, 0, 16, 32, 412, 212, 32, 64);
      }

      for (let s = 0; s < 6; s++) {
        const bx = (s & 1) ? 211 : 427;
        const life = (t * 24 + s * 8) % 30;
        ctx.fillStyle = (s % 2 === 0) ? '#ffd54f' : '#ff7043';
        ctx.fillRect(bx + Math.round(Math.sin(t * 4 + s) * 4), Math.round(220 - life), 2, 2);
      }

      // 8. Lurking skeleton warrior on right wing + Active Hero marching toward gate
      if (this._isStImgReady(skelImg)) {
        const sf = Math.floor(t * 5) % 4;
        this._drawPixelSprite(ctx, skelImg, sf * 48, 0, 48, 48, 536, 224, 68, 68, true);
      }

      const skin = this._resolveTransitionHeroSkin();
      const heroImg = this._getStSprite(skin.run || 'monk_yellow_run', 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Units/Blue Units/Pawn/Pawn_Run.png');
      if (this._isStImgReady(heroImg)) {
        const hFrames = Math.max(1, Math.floor(heroImg.width / 192));
        const hf = Math.floor(t * 10) % hFrames;
        const heroX = Math.round(108 + normP * 164);
        this._drawPixelSprite(ctx, heroImg, hf * 192, 0, 192, 192, heroX, 200, 96, 96);
      }
    }

    _drawDitherSeam(ctx, w, y, color, step = 4, size = 2) {
      ctx.fillStyle = color;
      const ry = Math.round(y);
      for (let x = 0; x < w; x += step) {
        ctx.fillRect(x, ry, size, size);
      }
    }

    _startDeathDiorama() {
      if (this._deathDioramaState && this._deathDioramaState.active) return;
      const canvas = document.getElementById('death-pixel-canvas');
      if (!canvas || typeof canvas.getContext !== 'function') return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const startMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const state = { active: true, rafId: null, startMs };
      this._deathDioramaState = state;

      const getRecovery = () => {
        const p = this.game && this.game.player;
        if (!p || !(p.deadTimer > 0)) return 1;
        const maxD = p.deadMax || 10.0;
        return Math.max(0, Math.min(1, 1 - (p.deadTimer / maxD)));
      };

      const step = (nowTs) => {
        if (!state.active || this._deathDioramaState !== state) return;
        const now = (typeof nowTs === 'number') ? nowTs : Date.now();
        const t = Math.max(0, (now - state.startMs) / 1000);
        this._renderDeathDiorama(ctx, t, getRecovery());
        if (typeof requestAnimationFrame === 'function') {
          state.rafId = requestAnimationFrame(step);
        }
      };

      this._renderDeathDiorama(ctx, 0, getRecovery());
      if (typeof requestAnimationFrame === 'function') {
        state.rafId = requestAnimationFrame(step);
      }
    }

    _stopDeathDiorama() {
      const state = this._deathDioramaState;
      if (!state) return;
      state.active = false;
      if (state.rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(state.rafId);
      }
      this._deathDioramaState = null;
    }

    _renderDeathDiorama(ctx, t, recovery = 0) {
      const W = 640;
      const H = 360;
      const TS = 'assets/packs/Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/';
      const FDA = 'assets/packs/FantasyDungeonAdventure_v1.0/FantasyDungeonAdventure/';
      ctx.imageSmoothingEnabled = false;

      // 1. Dusk Astral Sky Bands + Horizontal 2px Checker Seams
      this._drawDitherBands(ctx, W, [
        [0, 56, '#09040c'],
        [56, 108, '#110815'],
        [108, 154, '#1a0b1a'],
        [154, 194, '#25101e'],
        [194, 224, '#321623']
      ]);
      this._drawDitherSeam(ctx, W, 55, '#110815');
      this._drawDitherSeam(ctx, W, 107, '#1a0b1a');
      this._drawDitherSeam(ctx, W, 153, '#25101e');
      this._drawDitherSeam(ctx, W, 193, '#321623');

      // Outer sky stars (leaving central HUD text zone calm & uncluttered)
      const starCoords = [
        [34, 22], [72, 48], [116, 18], [148, 72], [58, 96], [96, 126],
        [496, 26], [534, 86], [584, 34], [608, 104], [468, 120], [568, 138]
      ];
      const twinkleTick = Math.floor(t * 2.5);
      for (let s = 0; s < starCoords.length; s++) {
        const bright = ((twinkleTick + s) % 4) === 0;
        ctx.fillStyle = bright ? '#f2dfcc' : '#857094';
        ctx.fillRect(starCoords[s][0], starCoords[s][1], bright ? 2 : 1, bright ? 2 : 1);
      }

      // Crisp pixel Crescent Moon upper-right (integer fillRect silhouette)
      const moonRows = [
        [2, 5], [1, 4], [0, 3], [0, 3], [0, 3], [0, 3], [0, 4], [1, 5], [2, 6]
      ];
      for (let mr = 0; mr < moonRows.length; mr++) {
        ctx.fillStyle = (mr === 0 || mr === moonRows.length - 1) ? '#bda999' : '#f2e4cc';
        ctx.fillRect(540 + moonRows[mr][0] * 2, 34 + mr * 2, moonRows[mr][1] * 2, 2);
      }

      // Drifting dark dusk clouds & distant horizon islets
      const cOff1 = Math.round((t * 4) % (W + 120)) - 90;
      const cOff2 = Math.round((t * 2.6 + 260) % (W + 140)) - 100;
      this._drawPixelCloud(ctx, cOff1, 146, 56, '#1b0e22', '#261530', '#120818');
      this._drawPixelCloud(ctx, cOff2, 166, 68, '#1f1024', '#2c1732', '#140919');

      ctx.fillStyle = '#150914';
      ctx.fillRect(18, 206, 92, 18);
      ctx.fillRect(36, 198, 48, 10);
      ctx.fillRect(528, 208, 94, 16);
      ctx.fillRect(552, 200, 44, 10);
      ctx.fillStyle = '#d9823b';
      ctx.fillRect(58, 200, 2, 2);
      ctx.fillRect(574, 202, 2, 2);

      // 2. Twilight Archipelago Ocean + Stepped Water Shimmer
      this._drawDitherBands(ctx, W, [
        [224, 248, '#0b1420'],
        [248, 286, '#0f1b2b'],
        [286, 330, '#0b1522'],
        [330, H, '#070e18']
      ]);
      this._drawDitherSeam(ctx, W, 247, '#0f1b2b');
      this._drawDitherSeam(ctx, W, 285, '#0b1522');
      this._drawDitherSeam(ctx, W, 329, '#070e18');

      // Twilight dusk wave shimmer dashes (subtle pixel surface ripples, no harsh daytime tiles)
      const waveTick = Math.floor(t * 3);
      for (let wv = 0; wv < 20; wv++) {
        const rx = Math.round(((wv * 53 + waveTick * ((wv & 1) ? 2 : 1)) % (W - 28)) + 8);
        const ry = 230 + (wv % 7) * 18;
        const wLen = 10 + (wv % 3) * 6;
        ctx.fillStyle = (wv % 3 === 0) ? '#264463' : '#182c42';
        ctx.fillRect(rx, ry, wLen, 2);
      }

      // Warm campfire reflection shimmer below island in twilight water
      for (let r = 0; r < 5; r++) {
        const refX = 310 + Math.round(Math.sin(Math.floor(t * 6) + r * 1.4) * 5) - Math.max(0, 8 - r);
        const refY = 296 + r * 8;
        ctx.fillStyle = (r & 1) ? '#5e3120' : '#854929';
        ctx.fillRect(refX, refY, Math.max(6, 20 - r * 3), 2);
      }

      // 3. Sanctuary Shrine Isle Grounded in Dusk-Tinted Animated Water Foam
      const foamImg = this._getStSprite('water_foam', TS + 'Terrain/Tileset/Water Foam.png');
      const tileImg = this._getStSprite('tile_1', TS + 'Terrain/Tileset/Tilemap_color1.png');
      const ISLE_X = 96;
      const ISLE_W = 448;

      if (this._isStImgReady(foamImg)) {
        const fFr = Math.floor(t * 7) % 16;
        for (let fx = ISLE_X - 4; fx <= ISLE_X + ISLE_W - 28; fx += 32) {
          this._drawPixelSprite(ctx, foamImg, fFr * 192 + 56, 72, 80, 64, fx, 266, 40, 26);
        }
        ctx.fillStyle = 'rgba(11, 20, 32, 0.46)';
        ctx.fillRect(ISLE_X - 8, 266, ISLE_W + 18, 28);
      }
      ctx.fillStyle = 'rgba(5, 10, 18, 0.62)';
      ctx.fillRect(ISLE_X + 2, 286, ISLE_W - 4, 4);

      // Organic stepped earthen cliff strata (asymmetric rock bricks)
      ctx.fillStyle = '#3b2926';
      ctx.fillRect(ISLE_X, 264, ISLE_W, 9);
      ctx.fillStyle = '#281b1c';
      ctx.fillRect(ISLE_X, 273, ISLE_W, 8);
      ctx.fillStyle = '#191114';
      ctx.fillRect(ISLE_X, 281, ISLE_W, 5);
      for (let rx = ISLE_X + 10; rx < ISLE_X + ISLE_W - 18; rx += 22) {
        const odd = (Math.floor(rx / 22)) & 1;
        ctx.fillStyle = odd ? '#241819' : '#4a342e';
        ctx.fillRect(rx, odd ? 267 : 269, 10, 3);
        ctx.fillStyle = '#170f12';
        ctx.fillRect(rx + 6, odd ? 276 : 274, 8, 3);
      }
      ctx.fillStyle = '#1d2d20';
      ctx.fillRect(ISLE_X, 263, ISLE_W, 2);

      // Top grass terrain tiles + dusk shade wash
      for (let tx = ISLE_X; tx < ISLE_X + ISLE_W; tx += 32) {
        const sx = tx === ISLE_X ? 0 : (tx + 32 >= ISLE_X + ISLE_W ? 128 : 64);
        if (this._isStImgReady(tileImg)) {
          this._drawPixelSprite(ctx, tileImg, sx, 0, 64, 64, tx, 240, 32, 26);
        } else {
          ctx.fillStyle = '#334d36';
          ctx.fillRect(tx, 240, 32, 26);
        }
      }
      ctx.fillStyle = 'rgba(14, 10, 26, 0.44)';
      ctx.fillRect(ISLE_X, 240, ISLE_W, 25);

      // 4. Sanctuary Props & Ambient Shrine Lights
      const deadTree = this._getStSprite('st_dead_tree_big', FDA + '10_Overworld/Dark_Forest/dead_tree_big_32x48.png');
      const darkPine = this._getStSprite('st_dark_pine', FDA + '10_Overworld/Dark_Forest/dark_pine_32x40.png');
      const colImg = this._getStSprite('st_broken_column', FDA + '10_Overworld/Ruins/broken_column_16x48.png');
      const grave1 = this._getStSprite('st_gravestone_1', FDA + '10_Overworld/Graveyard/gravestone_1.png');
      const grave3 = this._getStSprite('st_gravestone_3', FDA + '10_Overworld/Graveyard/gravestone_3.png');
      const rubbleImg = this._getStSprite('st_rubble_1', FDA + '10_Overworld/Ruins/rubble_1.png');
      const skullImg = this._getStSprite('st_skull_drop', FDA + '07_Items/Monster_Drops/skull.png');
      const shrineImg = this._getStSprite('st_sanctuary_shrine', FDA + '02_Props/Altars_Shrines/shrine_32x32_anim_4f.png');
      const brazierImg = this._getStSprite('brazier_orange', FDA + '02_Props/Lights/brazier_orange_16x32_anim_6f.png');
      const candlesImg = this._getStSprite('st_candles_group', FDA + '02_Props/Lights/candles_group_anim_4f.png');
      const fireImg = this._getStSprite('campfireAnim', FDA + '10_Overworld/Campsite/campfire_anim_6f.png');

      this._drawPixelSprite(ctx, deadTree, 0, 0, 32, 48, 108, 162, 64, 96);
      this._drawPixelSprite(ctx, colImg, 0, 0, 16, 48, 172, 166, 32, 96);
      this._drawPixelSprite(ctx, grave3, 0, 0, 16, 16, 148, 228, 26, 26);
      this._drawPixelSprite(ctx, skullImg, 0, 0, 16, 16, 186, 242, 16, 16);
      this._drawPixelSprite(ctx, darkPine, 0, 0, 32, 40, 456, 178, 64, 80);
      this._drawPixelSprite(ctx, grave1, 0, 0, 16, 16, 408, 228, 26, 26);
      this._drawPixelSprite(ctx, rubbleImg, 0, 0, 16, 16, 492, 240, 22, 22);

      // Central Sanctuary Shrine
      this._drawDitherLight(ctx, 274, 226, 28, 16, 'rgba(77, 208, 225, 0.14)', 'rgba(178, 235, 242, 0.18)');
      if (this._isStImgReady(shrineImg)) {
        const shF = Math.floor(t * 4) % 4;
        this._drawPixelSprite(ctx, shrineImg, shF * 32, 0, 32, 32, 242, 194, 64, 64);
      }

      // Flanking Orange Braziers & Central Campfire Light Pools
      const fFr = Math.floor(t * 8) % 6;
      const pulse = (fFr & 1) ? 4 : 0;
      this._drawDitherLight(ctx, 220, 220, 26 + pulse, 16, 'rgba(255, 138, 44, 0.14)', 'rgba(255, 195, 72, 0.22)');
      this._drawDitherLight(ctx, 442, 220, 26 - pulse, 16, 'rgba(255, 138, 44, 0.14)', 'rgba(255, 195, 72, 0.22)');
      this._drawDitherLight(ctx, 320, 250, 56 + pulse, 22, 'rgba(255, 138, 44, 0.16)', 'rgba(255, 213, 79, 0.26)');

      this._drawPixelSprite(ctx, brazierImg, ((fFr + 1) % 6) * 16, 0, 16, 32, 204, 196, 32, 64);
      this._drawPixelSprite(ctx, brazierImg, ((fFr + 4) % 6) * 16, 0, 16, 32, 426, 196, 32, 64);
      if (this._isStImgReady(candlesImg)) {
        const caF = Math.floor(t * 6) % 4;
        this._drawPixelSprite(ctx, candlesImg, caF * 16, 0, 16, 16, 280, 234, 24, 24);
      }
      if (this._isStImgReady(fireImg)) {
        this._drawPixelSprite(ctx, fireImg, fFr * 16, 0, 16, 16, 304, 228, 32, 32);
      }

      // Rising hearth embers
      for (let e = 0; e < 6; e++) {
        const eLife = (t * 20 + e * 7) % 34;
        const ex = 319 + Math.round(Math.sin(t * 3 + e * 1.9) * 5);
        const ey = Math.round(234 - eLife);
        ctx.fillStyle = (e & 1) ? '#ffe082' : '#ff7043';
        ctx.fillRect(ex, ey, 2, 2);
      }

      // 5. Player Skin Resting by Fire + Descending Soul Wisp Returning Before Respawn
      ctx.fillStyle = 'rgba(10, 6, 16, 0.48)';
      ctx.fillRect(368, 253, 28, 5);
      const skin = this._resolveTransitionHeroSkin();
      const heroImg = this._getStSprite(skin.idle || 'monk_yellow_idle', TS + 'Units/Blue Units/Pawn/Pawn_Idle.png');
      if (this._isStImgReady(heroImg)) {
        const hFrames = Math.max(1, Math.floor(heroImg.width / 192));
        const hf = Math.floor(t * 5) % hFrames;
        this._drawPixelSprite(ctx, heroImg, hf * 192, 0, 192, 192, 334, 195, 96, 96, true);
      }

      // Soul Wisp arcs back from Shrine toward Hero as recovery progresses 0 -> 1
      const rec = Math.max(0, Math.min(1, recovery));
      const arcLift = Math.round(Math.sin(rec * Math.PI) * 26);
      const wx = Math.round(274 + (382 - 274) * rec + Math.sin(Math.floor(t * 7) * 0.7) * 2);
      const wy = Math.round(182 + (238 - 182) * rec - arcLift + ((Math.floor(t * 6) & 1) ? -1 : 0));
      ctx.fillStyle = '#163442';
      ctx.fillRect(wx - 4, wy - 5, 8, 10);
      ctx.fillStyle = '#4dd0e1';
      ctx.fillRect(wx - 3, wy - 4, 6, 8);
      ctx.fillRect(wx - 1, wy - 6, 2, 2);
      ctx.fillStyle = '#e0f7fa';
      ctx.fillRect(wx - 2, wy - 2, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(wx - 1, wy - 1, 2, 2);
    }

    triggerTitleIntro() {
      const titleScreen = document.getElementById('title-screen');
      if (!titleScreen) return;
      if (this._titleIntroTimer) {
        clearTimeout(this._titleIntroTimer);
        this._titleIntroTimer = null;
      }
      titleScreen.classList.remove('title-booting', 'title-entering');
      this.renderTitleScreen();
      void titleScreen.offsetWidth;
      titleScreen.classList.add('title-entering');
      this._titleIntroTimer = setTimeout(() => {
        titleScreen.classList.remove('title-entering');
        this._titleIntroTimer = null;
      }, 1450);
    }

    hideTitleScreen() {
      this._stopDeathDiorama();
      if (this._titleIntroTimer) {
        clearTimeout(this._titleIntroTimer);
        this._titleIntroTimer = null;
      }
      const titleScreen = document.getElementById('title-screen');
      if (titleScreen) {
        titleScreen.classList.remove('title-booting', 'title-entering');
        titleScreen.classList.add('hidden');
      }
      document.getElementById('hud-root').classList.remove('hidden');
      this.closeMenuDropdown();
      this._lastResKey = '';
      this._lastHotbarKey = '';
      this.game.started = true;
      this.game.paused = false;
      this.game.uiDirty = true;
      if (Balaclava.Audio && typeof Balaclava.Audio.setMood === 'function') {
        Balaclava.Audio.setMood('meadow', { delayMs: 780, fadeOutMs: 300, fadeInMs: 4600 });
      }
      this.updateHUD(true);
      this.lastPlayerInputTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      this.showControlsHelper('entry', 2800);
    }

    showTitleScreen(opts = null) {
      if (!(opts && opts.skipSave) && this.game && this.game.started && !(this.game.isPlayerDead && this.game.isPlayerDead())) {
        this.game.saveSys.save(this.game, this.game.currentSlot || 1, true);
      }
      this.hideTooltip();
      this.closeMenuDropdown();
      this.closeModal();
      this.hideControlsHelper(true);
      const deathOverlay = document.getElementById('death-overlay');
      if (deathOverlay) deathOverlay.classList.add('hidden');
      this._stopDeathDiorama();
      const altarStack = document.getElementById('altar-blessing-stack');
      if (altarStack) {
        altarStack.classList.add('hidden');
        altarStack.innerHTML = '';
      }
      this._lastAltarKey = '';
      if (this.game) {
        if (this.game.clearTransientInputs) this.game.clearTransientInputs();
        if (this.game.resetAmbientParticles) this.game.resetAmbientParticles();
        if (this.game.resetAltarNotifications) this.game.resetAltarNotifications();
        if (this.canvas && typeof this.game.generateTitleArchipelago === 'function') {
          this.game.generateTitleArchipelago(this.canvas.width, this.canvas.height);
        }
        this.game.activeDungeon = null;
        this.game.started = false;
        this.game.paused = false;
      }
      document.getElementById('title-screen').classList.remove('hidden');
      document.getElementById('hud-root').classList.add('hidden');
      this.triggerTitleIntro();
      if (Balaclava.Audio && typeof Balaclava.Audio.setMood === 'function') {
        Balaclava.Audio.setMood('title', { delayMs: 480, fadeOutMs: 420, fadeInMs: 4200 });
      }
    }

    bindGlobalInputs() {
      const g = this.game;
      const canvas = g.canvas;

      const deathMenuBtn = document.getElementById('btn-death-main-menu');
      if (deathMenuBtn) {
        deathMenuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this._exitingFromDeath || !g.started || !(g.isPlayerDead && g.isPlayerDead())) return;
          this._exitingFromDeath = true;
          g.exitFromDeathToTitle();
          if (Balaclava.Audio && Balaclava.Audio.fadeOutMusic) Balaclava.Audio.fadeOutMusic(620);
          this.playSceneTransition(tr('transition.backMenu'), () => {
            this._exitingFromDeath = false;
            this.showTitleScreen({ skipSave: true });
          });
        });
      }

      const toggleBtn = document.getElementById('btn-menu-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (g.isPlayerDead && g.isPlayerDead()) return;
          this.toggleMenuDropdown();
        });
      }

      const tutMinBtn = document.getElementById('btn-tut-minimize');
      if (tutMinBtn) {
        tutMinBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (g.tutorialSys) {
            g.tutorialSys.minimized = !g.tutorialSys.minimized;
            this.updateHUD(true);
          }
        });
      }

      const tutSkipBtn = document.getElementById('btn-tut-skip');
      if (tutSkipBtn) {
        tutSkipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (g.tutorialSys) {
            g.tutorialSys.skip(g);
            this.updateHUD(true);
          }
        });
      }

      document.addEventListener('click', (e) => {
        if (!this.menuOpen) return;
        const wrap = document.getElementById('hud-menu-wrap');
        if (wrap && !wrap.contains(e.target)) {
          this.closeMenuDropdown();
        }
      });

      // Subtle crystalline hover SFX on buttons and interactive controls
      const HOVER_SFX_SELECTOR = [
        'button',
        '.title-nav-btn',
        '.title-corner-btn',
        '.btn',
        '.btn-close-sq',
        '.modal-tab',
        '.menu-dropdown-item',
        '.arrow-pick-btn',
        '.hotbar-slot',
        '.spell-slot'
      ].join(', ');
      this._hoverSfxEl = null;
      this._hoverSuppressUntil = 0;

      document.addEventListener('pointerdown', () => {
        this._hoverSuppressUntil = Date.now() + 150;
      }, true);

      document.addEventListener('pointerover', (e) => {
        if (e.pointerType === 'touch') return;
        const target = (e.target && typeof e.target.closest === 'function')
          ? e.target.closest(HOVER_SFX_SELECTOR)
          : null;
        if (!target) return;
        if (this._hoverSfxEl && typeof document.contains === 'function' && !document.contains(this._hoverSfxEl)) {
          this._hoverSfxEl = null;
        }
        if (target === this._hoverSfxEl) return;
        if (e.relatedTarget && target.contains(e.relatedTarget)) return;
        if (target.disabled || target.classList.contains('disabled') || target.getAttribute('aria-disabled') === 'true') return;
        this._hoverSfxEl = target;
        if (Date.now() < this._hoverSuppressUntil) return;
        if (Balaclava.Audio && typeof Balaclava.Audio.play === 'function') {
          Balaclava.Audio.play('ui_hover');
        }
      }, true);

      document.addEventListener('pointerout', (e) => {
        if (!this._hoverSfxEl) return;
        if (typeof document.contains === 'function' && !document.contains(this._hoverSfxEl)) {
          this._hoverSfxEl = null;
          return;
        }
        if (!e.relatedTarget || !this._hoverSfxEl.contains(e.relatedTarget)) {
          this._hoverSfxEl = null;
        }
      }, true);

      const clearTransient = () => {
        if (g && typeof g.clearTransientInputs === 'function') {
          g.clearTransientInputs();
        }
      };
      window.addEventListener('blur', clearTransient);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearTransient();
      });

      window.addEventListener('keydown', (e) => {
        this.recordPlayerActivity();
        if (this.game && this.game.introCinematic && this.game.introCinematic.active) {
          if (e.code === 'Escape') {
            e.preventDefault();
            this.game.finishIntroCinematic();
            return;
          }
          if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            this.game.advanceIntroCinematic();
            return;
          }
          if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            this.game.finishIntroCinematic();
          }
        }
        if (this.rebindingAction) {
          e.preventDefault();
          e.stopPropagation();
          if (e.code === 'Escape') {
            this.rebindingAction = null;
          } else if (e.code) {
            this.setKeybind(this.rebindingAction, e.code);
          }
          if (this.hasOpenModal()) this.renderModal();
          return;
        }

        const evtTarget = e.target;
        const isTypingTarget = Boolean(
          evtTarget && (
            evtTarget.tagName === 'INPUT' ||
            evtTarget.tagName === 'TEXTAREA' ||
            evtTarget.tagName === 'SELECT' ||
            evtTarget.isContentEditable
          )
        );
        if (isTypingTarget) {
          if (e.code === 'Escape') {
            if (typeof evtTarget.blur === 'function') evtTarget.blur();
            if (this.hasOpenModal()) this.closeModal();
          }
          return;
        }

        if (g.started && g.isPlayerDead && g.isPlayerDead()) {
          if (document.activeElement && document.activeElement.id === 'btn-death-main-menu' && (e.code === 'Enter' || e.code === 'Space')) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
          if (g.started && !this.hasOpenModal()) e.preventDefault();
        }
        g.keys[e.code] = true;

        if (!g.started) {
          if (e.code === 'Escape' && this.hasOpenModal()) this.closeModal();
          return;
        }

        const kb = this.keybinds || DEFAULT_KEYBINDS;
        if (e.code === 'Escape') {
          if (this.hasOpenModal()) {
            if (this.activeModal === 'pause' && this.pauseView === 'settings') {
              this.pauseView = 'root';
              this.renderModal();
            } else {
              this.closeModal();
            }
          }
          else if (this.menuOpen) this.closeMenuDropdown();
          else if (g.placingBuildingId || g.placingItemId) { g.placingBuildingId = null; g.placingItemId = null; this.updateHUD(true); }
          else this.openModal('pause');
          return;
        }

        const modalBindOrder = ['inventory', 'crafting', 'build', 'skills', 'map', 'market', 'quests', 'encyclopedia', 'pause'];
        if (this.hasOpenModal()) {
          const matchedModal = modalBindOrder.find(m => kb[m] === e.code);
          if (matchedModal && (matchedModal === this.activeModal || (matchedModal === 'pause' && (this.activeModal === 'settings' || this.activeModal === 'controls')))) {
            this.closeModal();
          }
          return;
        }

        if (e.code >= 'Digit1' && e.code <= 'Digit9') {
          const slotIdx = Number(e.code.replace('Digit', '')) - 1;
          const slot = g.hotbar[slotIdx];
          if (slot && (slot.kind !== 'tool' || g.toolTiers[slot.id])) {
            g.activeSlot = slotIdx;
            Balaclava.Audio.play('ui');
            g.uiDirty = true;
          }
        } else if (e.code === kb.dash) {
          g.triggerDash();
        } else if (e.code === kb.spell1) {
          g.castSpell(0, g.mouse.wx, g.mouse.wy);
        } else if (e.code === kb.spell2) {
          g.castSpell(1, g.mouse.wx, g.mouse.wy);
        } else if (e.code === kb.spell3) {
          g.castSpell(2, g.mouse.wx, g.mouse.wy);
        } else if (e.code === kb.spell4) {
          g.castSpell(3, g.mouse.wx, g.mouse.wy);
        } else if (e.code === kb.menu) {
          this.toggleMenuDropdown();
        } else if (e.code === kb.interact) {
          g.interactNearby();
        } else if (e.code === 'KeyK') {
          if (g.cyclePlayerSkin) g.cyclePlayerSkin(1);
        } else {
          const opened = modalBindOrder.find(m => kb[m] === e.code);
          if (opened) this.openModal(opened);
        }
      }, true);

      window.addEventListener('keyup', (e) => {
        g.keys[e.code] = false;
      });

      const syncCanvasMouse = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / Math.max(1, rect.width);
        const scaleY = canvas.height / Math.max(1, rect.height);
        g.mouse.sx = (e.clientX - rect.left) * scaleX;
        g.mouse.sy = (e.clientY - rect.top) * scaleY;
        g.updateMouseWorld();
        if (Math.abs(e.clientX - (this._lastMouseClientX || 0)) > 6 || Math.abs(e.clientY - (this._lastMouseClientY || 0)) > 6) {
          this._lastMouseClientX = e.clientX;
          this._lastMouseClientY = e.clientY;
          this.recordPlayerActivity();
        }
      };

      canvas.addEventListener('mousemove', syncCanvasMouse);

      canvas.addEventListener('mousedown', (e) => {
        Balaclava.Audio.init();
        this.recordPlayerActivity();
        if (g.introCinematic && g.introCinematic.active) {
          g.advanceIntroCinematic();
          return;
        }
        if (!g.started || this.hasOpenModal() || (g.isPlayerDead && g.isPlayerDead())) return;
        this.closeMenuDropdown();
        if (e.button === 2) {
          g.placingBuildingId = null;
          g.placingItemId = null;
          g.uiDirty = true;
          return;
        }
        if (e.button !== 0) return;

        syncCanvasMouse(e);

        if (!g.activeDungeon && !g.placingBuildingId) {
          const tx = Math.floor(g.mouse.wx / TILE_SIZE);
          const ty = Math.floor(g.mouse.wy / TILE_SIZE);
          const b = g.getBuildingAtTile(tx, ty);
          const actSlot = g.hotbar && g.hotbar[g.activeSlot];
          const actItem = actSlot && actSlot.kind === 'item' ? Balaclava.ITEMS[actSlot.id] : null;
          const holdingActionItem = Boolean(actItem && (
            actItem.isBomb || (actItem.consumableEffect && actItem.consumableEffect.bombRadius) ||
            actItem.isLaserWeapon || actItem.isSpecialBlade || actItem.plantCrop ||
            actSlot.id === 'fertilizante' || actSlot.id === 'abono_dorado' || actSlot.id === 'compost_magico'
          ));
          if (b && !holdingActionItem && Balaclava.Utils.dist(g.player.x, g.player.y, g.mouse.wx, g.mouse.wy) <= 95) {
            const collected = g.automation.collectFromBuilding(g, b);
            if (!collected || Balaclava.BUILDINGS[b.type].station || Balaclava.BUILDINGS[b.type].opensPanel) {
              this.openBuildingModal(b);
            }
            return;
          }
        }

        g.mouse.down = true;
        g.useActiveSlot(g.mouse.wx, g.mouse.wy);
      });

      window.addEventListener('mouseup', () => {
        g.mouse.down = false;
      });

      canvas.addEventListener('contextmenu', (e) => e.preventDefault());

      canvas.addEventListener('wheel', (e) => {
        this.recordPlayerActivity();
        if (!g.started || (g.isPlayerDead && g.isPlayerDead())) return;
        if (e.ctrlKey) {
          e.preventDefault();
          g.camera.zoom = Balaclava.Utils.clamp(g.camera.zoom + (e.deltaY < 0 ? 0.12 : -0.12), 0.7, 2.5);
          return;
        }
        const dir = e.deltaY > 0 ? 1 : -1;
        for (let step = 1; step <= 9; step++) {
          const idx = (g.activeSlot + dir * step + 9) % 9;
          const sl = g.hotbar[idx];
          if (!sl) continue;
          if (sl.kind === 'tool' && !g.toolTiers[sl.id]) continue;
          g.activeSlot = idx;
          g.uiDirty = true;
          this.updateHUD(true);
          return;
        }
        g.activeSlot = (g.activeSlot + dir + 9) % 9;
        g.uiDirty = true;
        this.updateHUD(true);
      }, { passive: false });
    }

    openModal(name, data = null) {
      const g = this.game;
      if (g && g.started && g.isPlayerDead && g.isPlayerDead()) return;
      this.hideControlsHelper(true);
      this.lastPlayerInputTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      if (name === 'controls') {
        name = (g && g.started) ? 'pause' : 'title_settings';
        this.pauseView = 'settings';
        this.settingsTab = 'controles';
      } else if (name === 'settings') {
        name = (g && g.started) ? 'pause' : 'title_settings';
        this.pauseView = 'settings';
      } else if (name === 'title_settings') {
        this.pauseView = 'settings';
      } else if (name === 'pause') {
        this.pauseView = (data === 'settings') ? 'settings' : 'root';
      }
      this.closeMenuDropdown();
      // Structure-gated menus: require building the corresponding structure first!
      if (g && g.started) {
        if (name === 'crafting' && !g.hasCraftingStructureBuilt()) {
          g.toast(tr('toast.needCraftingTable'), 'warn');
          Balaclava.Audio.play('error');
          return;
        }
        if (name === 'market' && !g.hasBuilding('mercado')) {
          g.toast(tr('toast.needMarketBuilding'), 'warn');
          Balaclava.Audio.play('error');
          return;
        }
        if (name === 'achievements' && !g.hasBuilding('tablon_logros')) {
          g.toast(tr('toast.needAchievementsBoard'), 'warn');
          Balaclava.Audio.play('error');
          return;
        }
        if (name === 'enchant' && !g.hasBuilding('mesa_encantamientos')) {
          g.toast(tr('toast.needEnchantTable'), 'warn');
          Balaclava.Audio.play('error');
          return;
        }
      }

      Balaclava.Audio.play('ui');
      this.activeModal = name;
      this.modalData = data;
      if (g) g.paused = (name === 'pause' || name === 'skills' || name === 'map');
      if (name === 'skills') {
        this.skillPanX = null;
        this.skillPanY = null;
        if (typeof data === 'string' && Balaclava.SKILLS[data]) {
          this.selectedSkillId = data;
        }
      }
      if (name === 'map' && g) {
        this.mapZoom = 1.15;
        this.mapPanX = null;
        this.mapPanY = null;
        this.selectedMapPlot = [
          Balaclava.Utils.clamp(Math.floor(g.player.x / (PLOT_TILES * TILE_SIZE)), 0, GRID_PLOTS - 1),
          Balaclava.Utils.clamp(Math.floor(g.player.y / (PLOT_TILES * TILE_SIZE)), 0, GRID_PLOTS - 1)
        ];
      }
      const backdrop = document.getElementById('modal-backdrop');
      const modalBox = document.getElementById('modal-box');
      const fullModals = new Set(['skills', 'map']);
      const leftDrawers = new Set(['inventory', 'crafting', 'build', 'market', 'quests', 'achievements', 'enchant', 'building', 'npc']);
      const wideDrawers = new Set(['build', 'inventory', 'crafting', 'quests', 'achievements']);
      backdrop.classList.toggle('fullscreen-modal', fullModals.has(name));
      const compactStyled = new Set(['pause', 'title_settings', 'credits', 'quit_confirm', 'quit_web_fallback', 'discord_fallback']);
      const isCompactModal = compactStyled.has(name);
      if (modalBox) {
        modalBox.classList.toggle('modal-fullscreen', fullModals.has(name));
        modalBox.classList.toggle('skills-cosmic-fullscreen', name === 'skills');
        modalBox.classList.toggle('map-atlas-fullscreen', name === 'map');
        modalBox.classList.toggle('quests-modal', name === 'quests');
        modalBox.classList.toggle('pause-pixel-modal', isCompactModal);
        modalBox.classList.toggle('pause-root-compact', (name === 'pause' && this.pauseView === 'root') || name === 'credits' || name === 'quit_confirm' || name === 'quit_web_fallback' || name === 'discord_fallback');
        modalBox.classList.toggle('pause-settings-compact', (name === 'pause' && this.pauseView === 'settings') || name === 'title_settings');
      }
      backdrop.classList.toggle('drawer-left', leftDrawers.has(name));
      backdrop.classList.toggle('drawer-wide', wideDrawers.has(name));
      backdrop.classList.remove('hidden');
      this.hideTooltip();
      this.renderModal();
    }

    openBuildingModal(b) {
      this.openModal('building', b);
    }

    openNpcModal(npc) {
      this.openModal('npc', npc);
    }

    closeModal() {
      const closingModal = this.activeModal;
      this.hideTooltip();
      if (this._mapCleanup) { this._mapCleanup(); this._mapCleanup = null; }
      if (this._skillHoldCleanup) { this._skillHoldCleanup(); this._skillHoldCleanup = null; }
      if (this._skillUnlockFxTimer) { clearTimeout(this._skillUnlockFxTimer); this._skillUnlockFxTimer = null; }
      if (this._skillQuakeTimer) { clearTimeout(this._skillQuakeTimer); this._skillQuakeTimer = null; }
      this.activeModal = null;
      this.modalData = null;
      this.rebindingAction = null;
      this.lastPlayerInputTime = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
      if (closingModal === 'title_settings' && (!this.game || !this.game.started) &&
          Balaclava.Audio && Balaclava.Audio._previewThemeInTitle && typeof Balaclava.Audio.setMood === 'function') {
        Balaclava.Audio.setMood('title', { delayMs: 360, fadeOutMs: 420, fadeInMs: 4200 });
      }
      if (this.game) {
        this.game.paused = false;
        if (this.game.tutorialSys && !this.game.tutorialSys.done) {
          this.game.tutorialSys.update(this.game, 0);
        }
      }
      const backdrop = document.getElementById('modal-backdrop');
      const modalBox = document.getElementById('modal-box');
      const headerTools = document.getElementById('modal-header-tools');
      if (headerTools) {
        headerTools.innerHTML = '';
        headerTools.classList.add('hidden');
      }
      backdrop.classList.add('hidden');
      backdrop.classList.remove('drawer-left', 'drawer-wide', 'fullscreen-modal');
      if (modalBox) modalBox.classList.remove('modal-fullscreen', 'skills-cosmic-fullscreen', 'map-atlas-fullscreen', 'quests-modal', 'pause-pixel-modal', 'pause-root-compact', 'pause-settings-compact');
    }

    updateHUD(force = false) {
      const g = this.game;
      // Throttle: sin force, solo ejecutar el HUD completo ~10 veces/seg.
      // El hover-HP se actualiza igual fuera del throttle (ver bloque tCard abajo).
      this._hudFrameCount = ((this._hudFrameCount || 0) + 1);
      const throttled = !force && (this._hudFrameCount % 6 !== 0);
      if (throttled) {
        // Solo actualiza la barra de HP del hoveredTarget sin reconstruir nada más
        const ht = g && g.hoveredTarget;
        if (ht && ht.hp != null && ht.maxHp > 0) {
          const hpPct = Math.max(0, Math.min(100, Math.round((ht.hp / ht.maxHp) * 100)));
          if (hpPct !== this._lastTargetHp) {
            this._lastTargetHp = hpPct;
            const tCard = document.getElementById('hud-target');
            if (tCard) {
              const fill = tCard.querySelector('[data-tghp]');
              if (fill) fill.style.width = `${hpPct}%`;
              const subEl = tCard.querySelector('[data-tgsub]');
              if (subEl && ht.sub) subEl.textContent = ht.sub;
            }
          }
        } else if (!ht) {
          // Si no hay target, esconder el card rápido
          if (this._lastTargetKey !== '') {
            this._lastTargetKey = '';
            this._lastTargetHp = null;
            const tCard = document.getElementById('hud-target');
            if (tCard) tCard.classList.add('hidden');
          }
        }
        return;
      }
      const deathOverlay = document.getElementById('death-overlay');
      const isDead = Boolean(g && g.started && g.isPlayerDead && g.isPlayerDead());
      if (deathOverlay) {
        const maxD = (g && g.player && g.player.deadMax) || 10.0;
        const elapsedDead = isDead && g.player ? Math.max(0, maxD - g.player.deadTimer) : 0;
        const showDeathScreen = isDead && (elapsedDead >= 0.88 || maxD < 1.2);
        deathOverlay.classList.toggle('hidden', !showDeathScreen);
        if (showDeathScreen && g.player) {
          this._startDeathDiorama();
          const pctLeft = Math.max(0, Math.min(100, (g.player.deadTimer / maxD) * 100));
          const snappedPct = Math.round(pctLeft / 2) * 2;
          const fillEl = document.getElementById('death-bar-fill');
          const cdEl = document.getElementById('death-countdown');
          const stEl = document.getElementById('death-stats-pill');
          if (fillEl) fillEl.style.width = `${snappedPct}%`;
          if (cdEl) cdEl.textContent = tr('death.respawnCount', { sec: Math.max(0.1, g.player.deadTimer).toFixed(1) });
          if (stEl) stEl.textContent = tr('toast.statSummary', {
            level: g.player.level || 1,
            day: g.dayCount || 1,
            kills: (g.stats && g.stats.kills) || 0,
            plots: (g.unlockedPlots && g.unlockedPlots.length) || 1
          });
        } else {
          this._stopDeathDiorama();
        }
      }
      if (!g.started) return;
      if (!force && !g.uiDirty && performance.now() - this.lastHudTick < 220) return;
      this.lastHudTick = performance.now();
      g.uiDirty = false;

      const p = g.player;
      document.getElementById('hp-fill').style.width = `${(p.hp / p.maxHp) * 100}%`;
      document.getElementById('hp-text').textContent = `${Math.ceil(p.hp)}/${p.maxHp}`;
      document.getElementById('en-fill').style.width = `${(p.energy / p.maxEnergy) * 100}%`;
      document.getElementById('en-text').textContent = `${Math.floor(p.energy)}/${p.maxEnergy}`;
      const xpPct = Math.min(100, Math.max(0, (p.xp / p.nextXp) * 100));
      const xpFillEl = document.getElementById('xp-fill');
      if (xpFillEl) xpFillEl.style.width = `${xpPct}%`;
      const xpTxtEl = document.getElementById('xp-text');
      if (xpTxtEl) {
        xpTxtEl.textContent = `${Math.floor(p.xp)}/${p.nextXp}`;
        xpTxtEl.title = `Progreso: ${Math.floor(p.xp)} / ${p.nextXp} XP (${Math.floor(xpPct)}%) - Siguiente nivel en ${Math.max(0, p.nextXp - Math.floor(p.xp))} XP`;
      }
      document.getElementById('lvl-text').textContent = `${tr('common.levelShort')}${p.level}`;
      document.getElementById('coin-text').textContent = formatNum(g.coins);

      ['skill-badge', 'skill-badge-top'].forEach(bid => {
        const spBadge = document.getElementById(bid);
        if (!spBadge) return;
        if (p.skillPoints > 0) {
          spBadge.textContent = p.skillPoints;
          spBadge.classList.remove('hidden');
        } else {
          spBadge.classList.add('hidden');
        }
      });

      // Day/Night clock pill with exact mm:ss phase countdown (no biome indicator)
      const dayPhase = g.getDayPhase ? g.getDayPhase() : { phase: 'dia', label: tr('hud.phaseDay'), iconKey: 'sun', phaseLeftSec: 480 };
      const dIcon = document.getElementById('day-icon');
      const dLabel = document.getElementById('day-label');
      const dFill = document.getElementById('day-progress-fill');
      if (dIcon && Balaclava.UI_URLS[dayPhase.iconKey]) {
        const targetSrc = Balaclava.UI_URLS[dayPhase.iconKey];
        if (dIcon.getAttribute('src') !== targetSrc) dIcon.src = targetSrc;
      }
      if (dLabel) {
        const left = Math.max(0, Math.round(dayPhase.phaseLeftSec || 0));
        const mm = String(Math.floor(left / 60)).padStart(2, '0');
        const ss = String(left % 60).padStart(2, '0');
        dLabel.textContent = `${tr('common.dayShort')} ${g.dayCount || 1} · ${dayPhase.label} · ${mm}:${ss}`;
      }
      if (dFill) {
        const pct = Math.round(((g.dayTime % 1) + 1) % 1 * 100);
        dFill.style.width = `${pct}%`;
        dFill.classList.toggle('night', g.isNightTime && g.isNightTime());
      }

      // Quick resources strip (fallback if present)
      const qr = document.getElementById('quick-res');
      if (qr) {
        const resIds = ['madera', 'piedra', 'carbon', 'hierro', 'oro', 'cristales'];
        const resKey = `${Balaclava.I18n ? Balaclava.I18n.getLanguage() : 'en'}|` + resIds.map(id => g.inventory[id] || 0).join(',');
        if (force || !this._lastResKey || resKey !== this._lastResKey || qr.children.length !== resIds.length) {
          this._lastResKey = resKey;
          if (qr.children.length !== resIds.length) {
            qr.innerHTML = '';
            resIds.forEach(id => {
              const it = Balaclava.ITEMS[id];
              if (!it) return;
              const qty = g.inventory[id] || 0;
              const qtyEl = this.el('span', { 'data-res-qty': id }, String(qty));
              const pill = this.el('span', { class: 'res-pill', title: `${it.name}: ${qty}` }, [
                this.itemIcon(it.icon, 28),
                qtyEl
              ]);
              qr.appendChild(pill);
            });
          } else {
            resIds.forEach(id => {
              const it = Balaclava.ITEMS[id];
              const qty = g.inventory[id] || 0;
              const qtyEl = qr.querySelector(`[data-res-qty="${id}"]`);
              if (qtyEl) qtyEl.textContent = String(qty);
              if (qtyEl && qtyEl.parentElement && it) {
                qtyEl.parentElement.title = `${it.name}: ${qty}`;
              }
            });
          }
        }
      }

      // Guided Interactive Tutorial Widget Sync
      const tutHud = document.getElementById('tutorial-hud');
      if (tutHud) {
        const tut = g.tutorialSys;
        if (!tut || tut.done || tut.skipped || g.activeDungeon) {
          tutHud.classList.add('hidden');
        } else {
          tutHud.classList.remove('hidden');
          if (this._lastTutStep !== undefined && this._lastTutStep !== tut.step) {
            tutHud.classList.remove('tut-completed-pop');
            void tutHud.offsetWidth;
            tutHud.classList.add('tut-completed-pop');
          }
          this._lastTutStep = tut.step;
          const stepDef = tut.getCurrentStepDef();
          if (stepDef) {
            const titleEl = document.getElementById('tut-title');
            const descEl = document.getElementById('tut-desc');
            const progBar = document.getElementById('tut-progress-bar');
            const progTxt = document.getElementById('tut-progress-text');
            const counterEl = document.getElementById('tut-step-counter');
            const totalSteps = Balaclava.TUTORIAL_STEPS ? Balaclava.TUTORIAL_STEPS.length : 9;

            const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
            if (titleEl) titleEl.textContent = (isEn && stepDef.title_en) ? stepDef.title_en : stepDef.title;
            if (descEl) descEl.innerHTML = tut.getFormattedDesc(stepDef, this);
            if (counterEl) counterEl.textContent = `${tut.step + 1}/${totalSteps}`;

            const progLine = stepDef.getProgress ? stepDef.getProgress(g, tut.stepState) : '';
            if (progTxt) progTxt.textContent = progLine;
            if (progBar) {
              const pct = Math.round(((tut.step) / totalSteps) * 100);
              progBar.style.width = `${pct}%`;
            }

            const bodyEl = document.getElementById('tut-body');
            const minBtn = document.getElementById('btn-tut-minimize');
            if (bodyEl) {
              bodyEl.classList.toggle('hidden', !!tut.minimized);
              let mapActionBtn = document.getElementById('btn-tut-open-map');
              if (stepDef.id === 'buy_island') {
                if (!mapActionBtn) {
                  mapActionBtn = this.el('button', {
                    id: 'btn-tut-open-map',
                    class: 'btn btn-gold',
                    style: 'margin-top:6px;width:100%;font-size:13px;padding:5px 8px;font-weight:800;letter-spacing:0.3px;'
                  });
                  bodyEl.appendChild(mapActionBtn);
                }
                mapActionBtn.textContent = isEn ? 'Open Map & Focus 1st Island [M]' : 'Abrir Mapa y Ver 1ra Isla [M]';
                mapActionBtn.classList.remove('hidden');
                mapActionBtn.onclick = () => {
                  if (typeof tut.focusRecommendedIslandInMap === 'function') {
                    tut.focusRecommendedIslandInMap(g, true);
                  } else {
                    this.openModal('map');
                  }
                };
              } else if (mapActionBtn) {
                mapActionBtn.classList.add('hidden');
              }
            }
            if (minBtn) minBtn.textContent = tut.minimized ? '+' : '–';
          }
        }
      }

      const objEl = document.getElementById('objective-text');
      if (objEl) {
        objEl.textContent = g.events.getNextObjectiveHint(g);
      }
      const objProg = document.getElementById('objective-progress');
      const objRew = document.getElementById('objective-reward');
      const ch = Balaclava.STORY_CHAPTERS && Balaclava.STORY_CHAPTERS[g.storyIndex];
      if (objProg) {
        if (ch && ch.getProgress) {
          const items = ch.getProgress(g) || [];
          objProg.textContent = items.map(p => `${p.label}: ${p.cur}/${p.max}`).join(' · ');
        } else {
          objProg.textContent = g.storyIndex >= (Balaclava.STORY_CHAPTERS || []).length ? tr('hud.mainStoryComplete') : '';
        }
      }
      if (objRew) {
        if (ch && ch.reward) {
          const rwItems = ch.reward.items
            ? Object.entries(ch.reward.items).filter(([, q]) => q > 0).map(([id, q]) => `${q}x ${(Balaclava.ITEMS[id] && Balaclava.ITEMS[id].name) || id}`).join(', ')
            : '';
          const parts = `+${ch.reward.coins} ${tr('common.coins')} · +${ch.reward.xp} ${tr('common.xp')}${rwItems ? ' · ' + rwItems : ''}`;
          objRew.textContent = tr('hud.rewardLine', { parts });
        } else {
          objRew.textContent = '';
        }
      }

      // Left-column Dungeon Objective HUD (moved out of canvas top-center)
      const dungHud = document.getElementById('dungeon-hud');
      if (dungHud) {
        const dung = g.activeDungeon;
        if (!dung) {
          if (this._lastDungKey !== '') {
            this._lastDungKey = '';
            dungHud.classList.add('hidden');
          }
        } else {
          const wingDone = dung.runes ? dung.runes.filter(x => x.kind === 'wing' && x.active).length : 0;
          const seqTxt = dung.vaultOpen ? tr('hud.dungVaultOpen') : `${dung.seqProgress || 0}/3`;
          const miniTxt = dung.miniBossDefeated ? tr('hud.dungDefeated') : tr('hud.dungPending');
          const gateTxt = dung.gateOpen ? tr('hud.dungGateOpen') : tr('hud.dungGateClosed');
          let phaseLine = '';
          if (dung.boss && dung.boss.hp > 0) {
            phaseLine = tr('hud.dungPhaseLive', {
              phase: dung.boss.phase || 1,
              hp: Math.ceil(dung.boss.hp),
              maxHp: dung.boss.maxHp
            });
          } else if (dung.gateOpen) {
            phaseLine = tr('hud.dungConquered');
          }
          const dName = dung.def.name;
          const dObj = tr('hud.dungObjLine', { wings: wingDone, seq: seqTxt, mini: miniTxt, gate: gateTxt, phaseLine });
          const dKey = `${dName}|${dObj}`;
          if (force || dKey !== this._lastDungKey) {
            this._lastDungKey = dKey;
            const nEl = document.getElementById('dungeon-hud-name');
            const oEl = document.getElementById('dungeon-hud-obj');
            if (nEl) nEl.textContent = dName;
            if (oEl) oEl.textContent = dObj;
          }
          dungHud.classList.remove('hidden');
        }
      }

      // Centered Level-Up Celebration Banner
      const lvlEl = document.getElementById('levelup-banner');
      if (lvlEl) {
        if (g.levelBannerTimer > 0 && g.levelUpSummary) {
          const s = g.levelUpSummary;
          if (s.title) {
            // Banner de evento o título personalizado
            const lKey = `custom:${s.title}:${s.subtitle || ''}`;
            if (this._lastLevelBannerKey !== lKey) {
              this._lastLevelBannerKey = lKey;
              lvlEl.innerHTML = '';
              lvlEl.appendChild(this.el('div', { class: 'levelup-banner-title' }, s.title));
              if (s.subtitle) lvlEl.appendChild(this.el('div', { class: 'levelup-banner-sub' }, s.subtitle));
            }
            lvlEl.classList.remove('hidden');
          } else if (s.from !== undefined && s.to !== undefined) {
            // Subida de nivel real
            const pts = (s.pts !== undefined && s.pts !== null) ? s.pts : ((s.points !== undefined && s.points !== null) ? s.points : 1);
            const langCode = Balaclava.I18n ? Balaclava.I18n.getLanguage() : 'en';
            const lKey = `${langCode}:${s.from}:${s.to}:${pts}`;
            if (this._lastLevelBannerKey !== lKey) {
              this._lastLevelBannerKey = lKey;
              lvlEl.innerHTML = '';
              lvlEl.appendChild(this.el('div', { class: 'levelup-banner-title' }, tr('hud.levelUpBannerTitle', { from: s.from, to: s.to })));
              lvlEl.appendChild(this.el('div', { class: 'levelup-banner-sub' }, tr('hud.levelUpBannerSub', { pts, s: pts === 1 ? '' : 's' })));
            }
            lvlEl.classList.remove('hidden');
          } else {
            lvlEl.classList.add('hidden');
          }
          if (!lvlEl.classList.contains('hidden')) {
            const sc = this.getUiScale ? this.getUiScale() : 1;
            const clockEl = document.getElementById('world-clock-panel');
            const targetEl = document.getElementById('hud-target');
            const bossEl = document.getElementById('boss-bar');
            let safeTop = 164;
            if (clockEl && clockEl.getBoundingClientRect) {
              const r = clockEl.getBoundingClientRect();
              if (r.height > 0) safeTop = Math.max(safeTop, Math.round(r.bottom / sc) + 92);
            }
            if (targetEl && !targetEl.classList.contains('hidden') && targetEl.getBoundingClientRect) {
              const r = targetEl.getBoundingClientRect();
              if (r.height > 0) safeTop = Math.max(safeTop, Math.round(r.bottom / sc) + 18);
            }
            if (bossEl && !bossEl.classList.contains('hidden') && bossEl.getBoundingClientRect) {
              const r = bossEl.getBoundingClientRect();
              if (r.height > 0) safeTop = Math.max(safeTop, Math.round(r.bottom / sc) + 18);
            }
            lvlEl.style.top = `${safeTop}px`;
          }
        } else if (this._lastLevelBannerKey !== '') {
          this._lastLevelBannerKey = '';
          lvlEl.classList.add('hidden');
        }
      }

      // Floating Altar Blessing Notifications anchored over character (non-overlapping stack)
      const altarStack = document.getElementById('altar-blessing-stack');
      if (altarStack) {
        const notices = (!(g.isPlayerDead && g.isPlayerDead()) && Array.isArray(g.altarNotifications)) ? g.altarNotifications : [];
        if (notices.length === 0) {
          if (this._lastAltarKey !== '') {
            this._lastAltarKey = '';
            altarStack.innerHTML = '';
            altarStack.classList.add('hidden');
          }
        } else {
          altarStack.classList.remove('hidden');
          const sigParts = notices.map(n => {
            const liveRem = (n.status === 'active' || n.status === 'renewed') && Array.isArray(n.buffKeys) && n.buffKeys.length > 0 && g.activeBuffs && g.activeBuffs[n.buffKeys[0]]
              ? Math.max(0, Math.ceil(g.activeBuffs[n.buffKeys[0]].time))
              : '';
            return `${n.uid}:${n.rev || 1}:${n.status}:${n.leaving ? 1 : 0}:${liveRem}`;
          });
          const aKey = `${Balaclava.I18n ? Balaclava.I18n.getLanguage() : 'en'}|${sigParts.join('|')}`;
          if (force || aKey !== this._lastAltarKey) {
            this._lastAltarKey = aKey;
            altarStack.innerHTML = '';
            notices.forEach(n => {
              let durLine = n.durationText || tr('hud.altarInstant');
              if ((n.status === 'active' || n.status === 'renewed') && Array.isArray(n.buffKeys) && n.buffKeys.length > 0 && g.activeBuffs && g.activeBuffs[n.buffKeys[0]]) {
                const rem = Math.max(0, Math.ceil(g.activeBuffs[n.buffKeys[0]].time));
                durLine = n.durationSec ? tr('hud.altarDurRem', { total: n.durationSec, rem }) : `${rem}s`;
              }
              const cardCls = [
                'altar-blessing-card',
                n.status === 'renewed' ? 'is-renewed' : '',
                n.status === 'replaced' ? 'is-replaced' : '',
                n.status === 'expired' ? 'is-expired' : '',
                n.leaving ? 'is-leaving' : ''
              ].filter(Boolean).join(' ');
              const card = this.el('div', {
                class: cardCls,
                style: `--blessing-accent:${n.color || '#ffd54f'};`
              }, [
                this.el('div', { class: 'altar-blessing-icon-box' }, [
                  n.iconUrl ? this.el('img', { class: 'pixel-img', src: encodeURI(n.iconUrl), width: 26, height: 26, alt: n.title || '' }) : null
                ]),
                this.el('div', { class: 'altar-blessing-body' }, [
                  this.el('div', { class: 'altar-blessing-title' }, n.kicker || n.title || tr('hud.altarFallbackSub')),
                  this.el('div', { class: 'altar-blessing-kicker' }, n.title || tr('hud.altarFallbackTitle')),
                  this.el('div', { class: 'altar-blessing-desc' }, n.effectText || ''),
                  this.el('div', { class: 'altar-blessing-meta' }, [
                    this.el('span', { class: 'altar-blessing-dur' }, durLine)
                  ])
                ])
              ]);
              altarStack.appendChild(card);
            });
          }

          // Position stack cleanly above the hero, clamped away from top HUD & hotbar
          const sc = this.getUiScale ? this.getUiScale() : 1;
          const hudW = (window.innerWidth || 1280) / sc;
          const hudH = (window.innerHeight || 720) / sc;
          const canvas = g.canvas || document.getElementById('game-canvas');
          const cw = canvas ? canvas.width : window.innerWidth;
          const ch = canvas ? canvas.height : window.innerHeight;
          const zoom = (g.camera && g.camera.zoom) || 1;
          const pxScr = (cw * 0.5 + ((g.player ? g.player.x : g.camera.x) - g.camera.x) * zoom) / sc;
          const pyScr = (ch * 0.5 + ((g.player ? g.player.y : g.camera.y) - g.camera.y) * zoom) / sc;
          const halfCardW = Math.min(190, Math.floor((hudW - 32) / 2));
          const leftPx = Math.max(halfCardW + 16, Math.min(hudW - halfCardW - 16, Math.round(pxScr)));
          const topClock = document.getElementById('world-clock-panel');
          const topTarget = document.getElementById('hud-target');
          const lvlBanner = document.getElementById('levelup-banner');
          const clockBot = (topClock && topClock.getBoundingClientRect) ? (topClock.getBoundingClientRect().bottom / sc) : 76;
          const targetBot = (topTarget && !topTarget.classList.contains('hidden') && topTarget.getBoundingClientRect)
            ? (topTarget.getBoundingClientRect().bottom / sc) : 0;
          const lvlBot = (lvlBanner && !lvlBanner.classList.contains('hidden') && lvlBanner.getBoundingClientRect)
            ? (lvlBanner.getBoundingClientRect().bottom / sc) : 0;
          const minTopSafe = Math.max(88, Math.round(Math.max(clockBot + 12, targetBot ? targetBot + 12 : 0, lvlBot ? lvlBot + 12 : (g.levelBannerTimer > 0 ? clockBot + 150 : 0))));
          const estH = Math.max(88, altarStack.offsetHeight || (notices.length * 102));
          const hotbarEl = document.getElementById('hotbar');
          const hotbarTop = (hotbarEl && hotbarEl.getBoundingClientRect && hotbarEl.getBoundingClientRect().top > 0)
            ? (hotbarEl.getBoundingClientRect().top / sc)
            : (hudH - 96);
          const maxBottomFromHotbar = Math.max(112, Math.round(hudH - hotbarTop + 14));
          const maxBottomBeforeTopHud = Math.max(maxBottomFromHotbar, Math.round(hudH - minTopSafe - estH));
          const desiredBottom = Math.round(hudH - (pyScr - (56 * zoom) / sc));
          const clampedBottom = Math.max(maxBottomFromHotbar, Math.min(maxBottomBeforeTopHud, desiredBottom));
          altarStack.style.left = `${leftPx}px`;
          altarStack.style.top = 'auto';
          altarStack.style.bottom = `${clampedBottom}px`;
        }
      }

      // Active potion / elixir buff pills with crisp PNG icons
      const topLeft = document.getElementById('hud-top-left');
      if (topLeft) {
        let buffBar = document.getElementById('hud-buffs');
        if (!buffBar) {
          buffBar = this.el('div', { id: 'hud-buffs', class: 'hud-buffs-row hidden' });
          const heroPanel = document.getElementById('hero-panel');
          if (heroPanel && heroPanel.parentElement === topLeft) {
            heroPanel.insertAdjacentElement('afterend', buffBar);
          } else {
            topLeft.appendChild(buffBar);
          }
        }
        const entries = Object.entries(g.activeBuffs || {}).filter(([, b]) => b && b.time > 0);
        const buffKey = `${Balaclava.I18n ? Balaclava.I18n.getLanguage() : 'en'}|` + entries.map(([k, b]) => `${k}:${Math.ceil(b.time)}`).join('|');
        if (force || buffKey !== this._lastBuffKey) {
          this._lastBuffKey = buffKey;
          buffBar.innerHTML = '';
          if (entries.length === 0) {
            buffBar.classList.add('hidden');
          } else {
            const buffLabels = {
              speed: tr('buff.speed'), dmg: tr('buff.dmg'), attack: tr('buff.dmg'),
              luck: tr('buff.luck'), xp: tr('buff.xp'), defense: tr('buff.defense'),
              regen: tr('buff.regen'), crit: tr('buff.crit'), arcane: tr('buff.arcane'),
              hunter: tr('buff.hunter'), furia_arcana: tr('buff.furia_arcana')
            };
            const urlMap = Balaclava.BUFF_ICON_URLS || {};
            buffBar.classList.remove('hidden');
            entries.forEach(([k, b]) => {
              const iconUrl = urlMap[k] || urlMap.speed;
              const pct = Math.round(((b.mult || 1) - 1) * 100);
              const label = buffLabels[k] || k;
              buffBar.appendChild(this.el('div', {
                class: 'hud-buff-pill',
                title: tr('hud.buffTitle', { label, pct, src: b.sourceName ? ' · ' + b.sourceName : '', rem: Math.ceil(b.time) })
              }, [
                iconUrl ? this.el('img', { class: 'pixel-img', src: iconUrl, width: 18, height: 18, alt: label }) : null,
                this.el('span', {}, `${label} ${Math.ceil(b.time)}s`)
              ]));
            });
          }
        }
      }

      const tCard = document.getElementById('hud-target');
      if (tCard) {
        const ht = g.hoveredTarget;
        if (!ht) {
          if (this._lastTargetKey !== '') {
            this._lastTargetKey = '';
            this._lastTargetHp = null;
            tCard.classList.add('hidden');
          }
        } else {
          // Clave de ESTRUCTURA: solo cambia cuando el tipo/nombre/icono cambia — NO incluye HP ni sub dinámico
          const thumbSig = ht.thumbSpec ? `${ht.thumbSpec.prefix || ''}:${ht.thumbSpec.key || ''}:${ht.thumbSpec.fx || 0}:${ht.thumbSpec.fy || 0}` : '';
          const iconIdentity = ht.iconUrl ? String(ht.iconUrl).slice(0, 64) : (thumbSig || ht.itemIcon || ht.iconKey || '');
          const layoutKey = `${ht.kind}:${ht.name}:${iconIdentity}`;

          if (force || layoutKey !== this._lastTargetKey) {
            // Reconstruir DOM solo cuando cambia la entidad/icono
            this._lastTargetKey = layoutKey;
            this._lastTargetHp = null;
            tCard.innerHTML = '';
            tCard.classList.remove('hidden');
            let iconEl = null;
            if (ht.iconUrl) {
              iconEl = this.el('img', { class: 'pixel-img', src: encodeURI(ht.iconUrl), width: 32, height: 32, alt: '' });
            } else if (ht.thumbSpec && Balaclava.Assets && Balaclava.Assets.getSpriteThumbCanvas) {
              const srcC = Balaclava.Assets.getSpriteThumbCanvas(ht.thumbSpec);
              if (srcC) {
                const c = document.createElement('canvas');
                c.width = 32; c.height = 32; c.className = 'pixel-img';
                const cctx = c.getContext('2d');
                cctx.imageSmoothingEnabled = false;
                cctx.drawImage(srcC, 0, 0, srcC.width, srcC.height, 0, 0, 32, 32);
                iconEl = c;
              }
            }
            if (!iconEl && ht.itemIcon) {
              iconEl = this.itemIcon(ht.itemIcon, 32);
            } else if (!iconEl && ht.iconKey) {
              iconEl = this.itemIcon(ht.iconKey, 32);
            } else if (!iconEl) {
              const fallbackKindKey = ht.kind === 'enemy' ? 'espada_hierro' : (ht.kind === 'animal' ? 'lana' : (ht.kind === 'altar' ? 'reliquia_antigua' : 'piedra'));
              iconEl = this.itemIcon(fallbackKindKey, 32);
            }
            const infoKids = [
              this.el('div', { class: 'hud-target-name' }, ht.name || tr('hud.targetDefault')),
              ht.sub ? this.el('div', { class: 'hud-target-sub', 'data-tgsub': '1' }, ht.sub) : null,
              ht.sub2 ? this.el('div', { class: 'hud-target-sub2' }, ht.sub2) : null
            ];
            if (ht.hp != null && ht.maxHp > 0) {
              infoKids.push(this.el('div', { class: 'hud-target-hp' }, [
                this.el('div', { class: 'hud-target-hp-fill', 'data-tghp': '1', style: `width:${Math.max(0,Math.min(100,Math.round((ht.hp/ht.maxHp)*100)))}%` })
              ]));
            }
            tCard.appendChild(iconEl);
            tCard.appendChild(this.el('div', { class: 'hud-target-info' }, infoKids));
          } else if (ht.hp != null && ht.maxHp > 0) {
            // Solo actualizar barra de HP en DOM existente — sin reconstruir nada
            const hpPct = Math.max(0, Math.min(100, Math.round((ht.hp / ht.maxHp) * 100)));
            if (hpPct !== this._lastTargetHp) {
              this._lastTargetHp = hpPct;
              const fill = tCard.querySelector('[data-tghp]');
              if (fill) fill.style.width = `${hpPct}%`;
              const subEl = tCard.querySelector('[data-tgsub]');
              if (subEl && ht.sub) subEl.textContent = ht.sub;
            }
          }
        }
      }

      const warnEl = document.getElementById('warning-banner');
      if (warnEl) {
        if (g.warningBanner && g.warningBanner.text && g.warningBanner.time > 0) {
          if (warnEl.textContent !== g.warningBanner.text) warnEl.textContent = g.warningBanner.text;
          warnEl.classList.remove('hidden');
        } else {
          warnEl.classList.add('hidden');
        }
      }

      const bossBar = document.getElementById('boss-bar');
      const dungPtx = g.activeDungeon ? Math.floor(g.player.x / TILE_SIZE) : 0;
      const bossMinX = (g.activeDungeon && g.activeDungeon.bossRoomMinX) || 34;
      if (g.activeDungeon && g.activeDungeon.boss && g.activeDungeon.boss.hp > 0 && dungPtx >= bossMinX) {
        const b = g.activeDungeon.boss;
        bossBar.classList.remove('hidden');
        document.getElementById('boss-name').textContent = tr('hud.bossPhaseTitle', { name: b.name, phase: b.phase });
        document.getElementById('boss-hp-fill').style.width = `${Math.max(0, (b.hp / b.maxHp) * 100)}%`;
      } else {
        bossBar.classList.add('hidden');
      }

      const bb = document.getElementById('build-banner');
      if (g.placingBuildingId && Balaclava.BUILDINGS[g.placingBuildingId]) {
        bb.classList.remove('hidden');
        document.getElementById('build-banner-name').textContent = Balaclava.BUILDINGS[g.placingBuildingId].name;
      } else {
        bb.classList.add('hidden');
      }

      const edBtn = document.getElementById('btn-exit-dungeon');
      if (g.activeDungeon) edBtn.classList.remove('hidden');
      else edBtn.classList.add('hidden');

      // Universal 9-slot Hotbar (1..9 holds ANY item or unlocked tool; Shift+Click swaps slots; diff-cached!)
      const hb = document.getElementById('hotbar');
      if (hb) {
        this._visibleHotbarIndices = [];
        for (let idx = 0; idx < 9; idx++) this._visibleHotbarIndices.push(idx);
        if (g.activeSlot < 0 || g.activeSlot >= 9) {
          g.activeSlot = 0;
        }
        const hbStateParts = [Balaclava.I18n ? Balaclava.I18n.getLanguage() : 'en', String(g.activeSlot)];
        for (let idx = 0; idx < 9; idx++) {
          let slot = g.hotbar[idx];
          if (slot && slot.kind === 'item' && (g.inventory[slot.id] || 0) <= 0) {
            g.hotbar[idx] = null;
            slot = null;
          }
          if (!slot || (slot.kind === 'tool' && !g.toolTiers[slot.id])) {
            hbStateParts.push('empty');
          } else if (slot.kind === 'tool') {
            const tier = g.toolTiers[slot.id] || 'basica';
            const enchCount = g.toolEnchants && g.toolEnchants[slot.id]
              ? Object.values(g.toolEnchants[slot.id]).reduce((a, b) => a + b, 0) : 0;
            const bowAmmoState = slot.id === 'arco'
              ? `:${(g.inventory && g.inventory.flecha) || 0}:${g.player && g.player.bowReloadTimer > 0 ? 'rel' : (g.player && g.player.bowLoaded ? 'rdy' : 'emp')}`
              : '';
            hbStateParts.push(`T:${slot.id}:${tier}:${enchCount}${bowAmmoState}`);
          } else {
            hbStateParts.push(`I:${slot.id}:${g.inventory[slot.id] || 0}`);
          }
        }
        const hbKey = hbStateParts.join('|');
        if (force || hbKey !== this._lastHotbarKey) {
          this._lastHotbarKey = hbKey;
          hb.innerHTML = '';
          for (let idx = 0; idx < 9; idx++) {
            const slot = g.hotbar[idx];
            const isTool = slot && slot.kind === 'tool';
            const isItemReady = slot && slot.kind === 'item' && (g.inventory[slot.id] || 0) > 0 && Balaclava.ITEMS[slot.id];
            const hasContent = Boolean((isTool && g.toolTiers[slot.id]) || isItemReady);
            const labelKey = String(idx + 1);

            if (!hasContent) {
              const emptyDiv = this.el('div', {
                class: 'hotbar-slot slot-empty' + (g.activeSlot === idx ? ' active' : ''),
                title: tr('hud.hotbarEmptyTip', { key: labelKey }),
                onclick: (ev) => {
                  if (g.isPlayerDead && g.isPlayerDead()) return;
                  if (ev && ev.shiftKey && g.activeSlot !== idx && g.swapHotbarSlots) {
                    g.swapHotbarSlots(g.activeSlot, idx);
                    g.activeSlot = idx;
                  } else {
                    g.activeSlot = idx;
                  }
                  this.updateHUD(true);
                }
              });
              emptyDiv.appendChild(this.el('span', { class: 'slot-key' }, labelKey));
              hb.appendChild(emptyDiv);
              continue;
            }

            const enchCount = isTool && g.toolEnchants && g.toolEnchants[slot.id]
              ? Object.values(g.toolEnchants[slot.id]).reduce((a, b) => a + b, 0) : 0;

            const sDiv = this.el('div', {
              class: 'hotbar-slot' + (g.activeSlot === idx ? ' active' : ''),
              title: (isTool
                ? `${Balaclava.TOOLS[slot.id].name} (${Balaclava.TIER_META[g.toolTiers[slot.id]].name})` + (enchCount > 0 ? tr('hud.enchantedSuffix') : '')
                : (Balaclava.ITEMS[slot.id] ? Balaclava.ITEMS[slot.id].name : tr('hover.toolFallback'))) + tr('hud.hotbarTipSuffix'),
              onclick: (ev) => {
                if (g.isPlayerDead && g.isPlayerDead()) return;
                if (ev && ev.shiftKey && g.swapHotbarSlots && g.activeSlot !== idx) {
                  g.swapHotbarSlots(g.activeSlot, idx);
                  g.activeSlot = idx;
                } else {
                  g.activeSlot = idx;
                }
                this.updateHUD(true);
              }
            });
            sDiv.appendChild(this.el('span', { class: 'slot-key' }, labelKey));

            if (isTool) {
              const tier = g.toolTiers[slot.id] || 'basica';
              sDiv.appendChild(this.toolIcon(slot.id, tier, 38));
              const tm = Balaclava.TIER_META[tier];
              sDiv.style.boxShadow = g.activeSlot === idx
                ? `0 0 14px rgba(255,213,79,0.5), inset 0 -3px 0 ${tm.color}`
                : `inset 0 -3px 0 ${tm.color}`;
              if (enchCount > 0) {
                sDiv.appendChild(this.el('span', { class: 'slot-ench-pip' }, '+'));
              }
              if (slot.id === 'arco') {
                const arrowCnt = (g.inventory && g.inventory.flecha) || 0;
                const isRel = Boolean(g.player && g.player.bowReloadTimer > 0);
                sDiv.appendChild(this.el('span', {
                  class: 'slot-qty',
                  style: arrowCnt <= 0 ? 'color:#ff8a65;' : (isRel ? 'color:#ffe082;' : '')
                }, isRel ? '...' : String(arrowCnt)));
              }
            } else if (slot.kind === 'item' && (g.inventory[slot.id] || 0) > 0) {
              const it = Balaclava.ITEMS[slot.id];
              if (it) {
                sDiv.appendChild(this.itemIcon(it.icon, 36));
                sDiv.appendChild(this.el('span', { class: 'slot-qty' }, String(g.inventory[slot.id])));
              }
            }
            hb.appendChild(sDiv);
          }
        }
      }

      // 4-slot Active Spell Bar + Grimorio Button
      const sb = document.getElementById('spell-bar');
      if (sb) {
        const kb = this.keybinds || DEFAULT_KEYBINDS;
        const slots = Array.isArray(g.spellSlots) ? g.spellSlots : ['misil_arcano', null, null, null];
        const cds = g.spellCooldowns || {};
        const keyCodes = [kb.spell1 || 'KeyZ', kb.spell2 || 'KeyT', kb.spell3 || 'KeyB', kb.spell4 || 'KeyN'];
        const sbParts = slots.map((sid, i) => {
          const sp = sid && Balaclava.SPELLS && Balaclava.SPELLS[sid];
          const rem = sid && cds[sid] ? Math.ceil(cds[sid] * 10) : 0;
          return `${keyCodes[i]}:${sp ? sp.id : 'none'}:${rem}`;
        });
        const sbKey = `${Balaclava.I18n ? Balaclava.I18n.getLanguage() : 'en'}:${sbParts.join('|')}:${Math.floor(g.player.energy)}`;
        if (force || sbKey !== this._lastSpellBarKey) {
          this._lastSpellBarKey = sbKey;
          sb.innerHTML = '';
          slots.forEach((sid, idx) => {
            const keyLbl = String(keyCodes[idx] || '').replace(/^Key/, '');
            const sp = sid && Balaclava.SPELLS && Balaclava.SPELLS[sid];
            if (!sp) {
              const emptyS = this.el('div', {
                class: 'spell-slot slot-empty',
                'data-tip-text': tr('hud.spellEmptyTip', { key: keyLbl }),
                onclick: () => this.openModal('grimorio')
              });
              emptyS.appendChild(this.el('span', { class: 'slot-key' }, keyLbl));
              sb.appendChild(emptyS);
              return;
            }
            const remCd = cds[sid] || 0;
            const manaSave = Math.min(0.45, (g.mods.manaSave || 0) + (g.mods.energySave || 0) * 0.4);
            const effCost = Math.max(2, Math.round((sp.cost || 10) * (1 - manaSave)));
            const sBtn = this.el('div', {
              class: 'spell-slot' + (remCd > 0.05 ? ' spell-on-cd' : ''),
              'data-tip-text': tr('hud.spellTip', { name: sp.name, key: keyLbl, cost: effCost, desc: sp.desc }),
              onclick: () => g.castSpell(idx),
              oncontextmenu: (ev) => { ev.preventDefault(); this.openModal('grimorio'); }
            });
            sBtn.appendChild(this.el('span', { class: 'slot-key' }, keyLbl));
            sBtn.appendChild(this.itemIcon(sp.icon, 32));
            sBtn.appendChild(this.el('span', { class: 'spell-slot-cost' }, String(effCost)));
            if (remCd > 0.05) {
              sBtn.appendChild(this.el('span', { class: 'spell-slot-cd' }, `${remCd.toFixed(1)}`));
            }
            sb.appendChild(sBtn);
          });
          sb.appendChild(this.el('button', {
            type: 'button',
            class: 'spell-book-btn',
            'data-tip-text': tr('hud.openGrimoireTip'),
            onclick: () => this.openModal('grimorio')
          }, [this.uiIcon('spellbook', 26)]));
        }
      }

      // Live timed craft-queue & ready-box sync inside open drawers without flickering buttons
      const qBox = document.getElementById('live-craft-queue-list');
      if (qBox) {
        const queue = g.craftQueue || [];
        const ready = g.craftReady || [];
        if (queue.length !== Number(qBox.dataset.count || 0) || ready.length !== Number(qBox.dataset.readyCount || 0)) {
          if (this.activeModal === 'crafting' || this.activeModal === 'building') this.renderModal();
        } else {
          queue.forEach((job, ji) => {
            const pctEl = document.getElementById(`cq-fill-${ji}`);
            const remEl = document.getElementById(`cq-rem-${ji}`);
            const pct = Math.min(100, Math.round(((job.elapsed || 0) / Math.max(0.1, job.totalTime || 1)) * 100));
            const rem = Math.max(0, (job.totalTime || 0) - (job.elapsed || 0)).toFixed(1);
            if (pctEl) pctEl.style.width = `${pct}%`;
            if (remEl) remEl.textContent = `${rem}s`;
            const busyTid = job.toolUpgrade || job.toolUnlock;
            if (busyTid) {
              const btn = document.querySelector(`[data-tool-busy-id="${busyTid}"]`);
              if (btn) {
                btn.textContent = job.toolUpgrade
                  ? tr('craft.upgradingProgress', { sec: rem })
                  : tr('craft.forgingProgress', { sec: rem });
              }
            }
            const busyArmorSlot = job.armorUpgrade || job.armorUnlock;
            if (busyArmorSlot) {
              const btn = document.querySelector(`[data-armor-busy-slot="${busyArmorSlot}"]`);
              if (btn) {
                btn.textContent = job.armorUpgrade
                  ? tr('craft.upgradingProgress', { sec: rem })
                  : tr('craft.forgingProgress', { sec: rem });
              }
            }
          });
        }
      }
      const cooldownKeys = g.toolUpgradeCooldowns ? Object.keys(g.toolUpgradeCooldowns) : [];
      if (cooldownKeys.length > 0) {
        this._hadToolUpgradeCooldowns = true;
        cooldownKeys.forEach(tid => {
          const btn = document.querySelector(`[data-tool-busy-id="${tid}"][data-busy-kind="cd"]`);
          if (btn) {
            const rem = Math.max(0, g.toolUpgradeCooldowns[tid] || 0).toFixed(1);
            btn.textContent = tr('craft.upgradeCooldown', { sec: rem });
          }
        });
      } else if (this._hadToolUpgradeCooldowns) {
        this._hadToolUpgradeCooldowns = false;
        if (this.activeModal === 'crafting' || this.activeModal === 'building') this.renderModal();
      }
      const armorCooldownKeys = g.armorUpgradeCooldowns ? Object.keys(g.armorUpgradeCooldowns) : [];
      if (armorCooldownKeys.length > 0) {
        this._hadArmorUpgradeCooldowns = true;
        armorCooldownKeys.forEach(sl => {
          const btn = document.querySelector(`[data-armor-busy-slot="${sl}"][data-busy-kind="cd"]`);
          if (btn) {
            const rem = Math.max(0, g.armorUpgradeCooldowns[sl] || 0).toFixed(1);
            btn.textContent = tr('craft.upgradeCooldown', { sec: rem });
          }
        });
      } else if (this._hadArmorUpgradeCooldowns) {
        this._hadArmorUpgradeCooldowns = false;
        if (this.activeModal === 'crafting' || this.activeModal === 'building') this.renderModal();
      }

      // Zero-flicker Toasts reconciliation (never clears/re-animates active toasts)
      const tc = document.getElementById('toast-container');
      if (tc) {
        const activeToasts = new Set(g.toasts);
        for (const [toastObj, el] of this._toastNodes.entries()) {
          if (!activeToasts.has(toastObj)) {
            if (el.parentElement === tc) tc.removeChild(el);
            this._toastNodes.delete(toastObj);
          }
        }
        g.toasts.forEach(t => {
          if (!this._toastNodes.has(t)) {
            const el = this.el('div', { class: 'toast ' + (t.kind || '') + ' is-new' }, t.text);
            this._toastNodes.set(t, el);
            tc.appendChild(el);
          }
        });
      }

      // Zero-flicker 2-second Pickup Feed reconciliation (updates quantities in-place!)
      const pf = document.getElementById('pickup-feed');
      if (pf) {
        const feed = g.pickupFeed || [];
        const activeIds = new Set(feed.map(e => e.id));
        for (const [id, rec] of this._pickupNodes.entries()) {
          if (!activeIds.has(id)) {
            if (rec.el.parentElement === pf) pf.removeChild(rec.el);
            this._pickupNodes.delete(id);
          }
        }
        feed.forEach(entry => {
          const iconKey = entry.id === '_coin'
            ? 'coin_gold'
            : (entry.icon || (Balaclava.ITEMS[entry.id] ? Balaclava.ITEMS[entry.id].icon : 'wood_log'));
          const opStr = entry.ttl < 0.75 ? Math.max(0.12, entry.ttl / 0.75).toFixed(2) : '1';
          const existing = this._pickupNodes.get(entry.id);
          if (existing) {
            const qtyTxt = `+${entry.qty}`;
            if (existing.qtyEl.textContent !== qtyTxt) existing.qtyEl.textContent = qtyTxt;
            if (existing.el.style.opacity !== opStr) existing.el.style.opacity = opStr;
          } else {
            const qtyEl = this.el('span', { class: 'pickup-qty', style: entry.color ? `color:${entry.color}` : '' }, `+${entry.qty}`);
            const pill = this.el('div', {
              class: 'pickup-pill is-new',
              style: `opacity:${opStr}`
            }, [
              this.itemIcon(iconKey, 24),
              qtyEl,
              this.el('span', { class: 'pickup-name' }, entry.name)
            ]);
            this._pickupNodes.set(entry.id, { el: pill, qtyEl });
            pf.appendChild(pill);
          }
        });
      }
    }

    renderModal() {
      const titleEl = document.getElementById('modal-title');
      const body = document.getElementById('modal-body');
      const headerTools = document.getElementById('modal-header-tools');
      if (headerTools) {
        headerTools.innerHTML = '';
        headerTools.classList.add('hidden');
      }
      body.innerHTML = '';

      const titles = {
        inventory: tr('inv.title'),
        stats: tr('inv.stats'),
        crafting: tr('craft.title'),
        build: tr('build.title'),
        skills: tr('modal.titleSkillsCount', { n: Object.keys(Balaclava.SKILLS || {}).length }),
        grimorio: tr('grim.learnedTitle', { cur: (this.game.unlockedSpells || []).length, total: Object.keys(Balaclava.SPELLS || {}).length }),
        map: tr('map.title'),
        market: tr('market.title'),
        quests: tr('quests.title'),
        achievements: tr('ach.title'),
        enchant: tr('ench.title'),
        encyclopedia: tr('enc.title'),
        pause: this.pauseView === 'settings' ? tr('settings.title') : tr('pause.title'),
        settings: tr('settings.title'),
        title_settings: tr('settings.title'),
        controls: tr('settings.title'),
        credits: tr('credits.title'),
        quit_confirm: tr('quit.title'),
        quit_web_fallback: tr('quit.webFallbackTitle'),
        discord_fallback: tr('title.discord')
      };
      const backdrop = document.getElementById('modal-backdrop');
      const modalBox = document.getElementById('modal-box');
      const fullModals = new Set(['skills', 'map']);
      const isFullScreen = fullModals.has(this.activeModal);
      if (backdrop) {
        backdrop.classList.toggle('fullscreen-modal', isFullScreen);
      }
      if (modalBox) {
        modalBox.classList.toggle('modal-fullscreen', isFullScreen);
        modalBox.classList.toggle('skills-cosmic-fullscreen', this.activeModal === 'skills');
        modalBox.classList.toggle('map-atlas-fullscreen', this.activeModal === 'map');
        const isCompactMenu = this.activeModal === 'credits' || this.activeModal === 'quit_confirm' || this.activeModal === 'quit_web_fallback' || this.activeModal === 'discord_fallback';
        modalBox.classList.toggle('pause-root-compact', (this.activeModal === 'pause' && this.pauseView === 'root') || isCompactMenu);
        modalBox.classList.toggle('pause-settings-compact', this.pauseView === 'settings' || this.activeModal === 'title_settings');
        modalBox.classList.toggle('steam-dialog-box', isCompactMenu);
      }
      if (titles[this.activeModal]) titleEl.textContent = titles[this.activeModal];

      if (this.activeModal === 'inventory') this.renderInventory(body);
      else if (this.activeModal === 'stats') this.renderStats(body);
      else if (this.activeModal === 'crafting') {
        const bType = this.modalData && this.modalData.building && this.modalData.building.type;
        this.renderCrafting(body, bType === 'mesa_artesania' ? { onlyStation: 'mano' } : {});
      }
      else if (this.activeModal === 'build') this.renderBuildMenu(body);
      else if (this.activeModal === 'skills') this.renderSkills(body);
      else if (this.activeModal === 'grimorio') this.renderGrimorio(body);
      else if (this.activeModal === 'map') this.renderMap(body);
      else if (this.activeModal === 'market') this.renderMarket(body);
      else if (this.activeModal === 'quests') this.renderQuests(body);
      else if (this.activeModal === 'achievements') this.renderAchievements(body);
      else if (this.activeModal === 'enchant') this.renderEnchanting(body);
      else if (this.activeModal === 'encyclopedia') this.renderEncyclopedia(body);
      else if (this.activeModal === 'pause' || this.activeModal === 'settings') this.renderPauseMenu(body);
      else if (this.activeModal === 'title_settings') this.renderTitleAudioSettings(body);
      else if (this.activeModal === 'credits') this.renderCreditsModal(body);
      else if (this.activeModal === 'quit_confirm') this.renderQuitModal(body, false);
      else if (this.activeModal === 'quit_web_fallback') this.renderQuitModal(body, true);
      else if (this.activeModal === 'discord_fallback') this.renderDiscordFallbackModal(body);
      else if (this.activeModal === 'building') this.renderBuildingInspector(titleEl, body, this.modalData);
      else if (this.activeModal === 'npc') this.renderNpcDialog(titleEl, body, this.modalData);
      else if (this.activeModal === 'controls') {
        this.pauseView = 'settings';
        this.settingsTab = 'controles';
        this.renderPauseMenu(body);
      }
    }

    _buildSearchBar(initialVal, placeholder, onFilter) {
      const inp = this.el('input', {
        type: 'search',
        class: 'modal-search-input',
        placeholder: placeholder || tr('common.search'),
        value: initialVal || ''
      });
      const clr = this.el('button', {
        type: 'button',
        class: 'btn btn-stone btn-sm',
        onclick: () => { inp.value = ''; onFilter(''); inp.focus(); }
      }, tr('modal.clear'));
      inp.addEventListener('input', () => onFilter(inp.value || ''));
      return this.el('div', { class: 'modal-search-bar' }, [inp, clr]);
    }

    renderGrimorio(body) {
      const g = this.game;
      const kb = this.keybinds || DEFAULT_KEYBINDS;
      const unlocked = Array.isArray(g.unlockedSpells) ? g.unlockedSpells : ['misil_arcano'];
      const slots = Array.isArray(g.spellSlots) ? g.spellSlots : ['misil_arcano', null, null, null];
      const keyCodes = [kb.spell1 || 'KeyZ', kb.spell2 || 'KeyT', kb.spell3 || 'KeyB', kb.spell4 || 'KeyN'];

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;' }, [
        this.el('strong', { style: 'font-size:16px;display:block;margin-bottom:4px;' }, tr('grim.learnedTitle', { cur: unlocked.length, total: Object.keys(Balaclava.SPELLS || {}).length })),
        this.el('div', { style: 'font-size:14px;color:#dbe7f5;line-height:1.45;' }, tr('grim.intro'))
      ]));

      const slotBar = this.el('div', { class: 'grimorio-slots-bar' });
      slots.forEach((sid, idx) => {
        const sp = sid && Balaclava.SPELLS && Balaclava.SPELLS[sid];
        const kLbl = this.formatKeyCode(keyCodes[idx] || '');
        slotBar.appendChild(this.el('div', { class: 'card' + (sp ? ' selected' : '') }, [
          this.el('strong', { style: 'color:#ffd54f;font-size:14px;' }, tr('grim.slotTitle', { n: idx + 1, key: kLbl })),
          sp ? this.el('div', { class: 'card-head', style: 'margin-top:4px;' }, [
            this.itemIcon(sp.icon, 28),
            this.el('span', { style: `color:${sp.color};font-size:15px;` }, sp.name)
          ]) : this.el('div', { style: 'font-size:14px;color:#90a4ae;margin:6px 0;' }, tr('common.empty')),
          sp ? this.el('button', {
            class: 'btn btn-stone btn-sm',
            onclick: () => { g.assignSpellSlot(idx, null); this.updateHUD(true); this.renderModal(); }
          }, tr('grim.remove')) : null
        ]));
      });
      body.appendChild(slotBar);

      const grid = this.el('div', { class: 'grid-cards' });
      Object.values(Balaclava.SPELLS || {}).forEach(sp => {
        const known = unlocked.includes(sp.id);
        const equippedAt = slots.indexOf(sp.id);
        const card = this.el('div', { class: 'card' + (known ? (equippedAt >= 0 ? ' selected' : '') : ' card-locked') }, [
          this.el('div', { class: 'card-head' }, [
            this.itemIcon(sp.icon, 34),
            this.el('div', {}, [
              this.el('strong', { style: `color:${known ? sp.color : '#90a4ae'};font-size:16px;` }, sp.name),
              this.el('div', { style: 'font-size:14px;color:#b0bec5;' }, tr('grim.spellMeta', { tier: sp.tier, cost: sp.cost, cd: sp.cooldown }))
            ])
          ]),
          this.el('div', { style: 'font-size:14px;color:#e6eef6;line-height:1.45;' }, sp.desc)
        ]);
        if (known) {
          const btnRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;' });
          for (let sIdx = 0; sIdx < 4; sIdx++) {
            const kLbl = this.formatKeyCode(keyCodes[sIdx] || '');
            btnRow.appendChild(this.el('button', {
              class: equippedAt === sIdx ? 'btn btn-gold btn-sm' : 'btn btn-primary btn-sm',
              onclick: () => { g.assignSpellSlot(sIdx, sp.id); this.updateHUD(true); this.renderModal(); }
            }, tr('grim.bindSlot', { key: kLbl })));
          }
          card.appendChild(btnRow);
        } else {
          card.appendChild(this.el('div', { style: 'font-size:14px;color:#ffb74d;margin-top:6px;' }, tr('grim.reqGrimoire')));
        }
        grid.appendChild(card);
      });
      body.appendChild(grid);
    }

    renderInventory(body) {
      const g = this.game;
      const catGroups = {
        todos: null,
        recursos: ['recursos', 'minerales', 'gemas', 'monstruo'],
        materiales: ['materiales'],
        cultivos: ['semillas', 'alimentos', 'comida', 'pociones'],
        equipamiento: ['equipamiento', 'herramientas'],
        construccion: ['construccion'],
        especiales: ['especiales', 'magia']
      };
      const tabs = this.el('div', { class: 'tab-row' });
      [
        ['todos', tr('inv.tabAll')],
        ['recursos', tr('inv.tabRes')],
        ['materiales', tr('inv.tabMat')],
        ['cultivos', tr('inv.tabFood')],
        ['equipamiento', tr('inv.tabGear')],
        ['construccion', tr('inv.tabBlocks')],
        ['especiales', tr('inv.tabSpecial')]
      ].forEach(([id, lbl]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.invFilter === id ? ' active' : ''),
          onclick: () => { this.invFilter = id; this.renderModal(); }
        }, lbl));
      });
      body.appendChild(tabs);

      const layout = this.el('div', { class: 'inv-layout' });
      const grid = this.el('div', { class: 'inv-grid' });
      const applyInvSearch = (q) => {
        this.invSearch = q;
        const needle = (q || '').trim().toLowerCase();
        Array.from(grid.children).forEach(ch => {
          const lbl = (ch.getAttribute('aria-label') || ch.textContent || '').toLowerCase();
          ch.style.display = (!needle || lbl.includes(needle)) ? '' : 'none';
        });
      };
      body.appendChild(this._buildSearchBar(this.invSearch, tr('inv.searchPlaceholder'), applyInvSearch));

      const allowedCats = catGroups[this.invFilter];
      const showTools = !allowedCats || allowedCats.includes('herramientas');
      const ownedTools = showTools
        ? Object.values(Balaclava.TOOLS).filter(t => Boolean(g.toolTiers && g.toolTiers[t.id]))
        : [];
      const ids = Object.keys(g.inventory).filter(id => {
        const it = Balaclava.ITEMS[id];
        return it && g.inventory[id] > 0 && (!allowedCats || allowedCats.includes(it.category));
      });

      if (this.selectedToolId && !g.toolTiers[this.selectedToolId]) {
        this.selectedToolId = null;
      }
      if (!this.selectedToolId && (!this.selectedItemId || !g.inventory[this.selectedItemId])) {
        this.selectedItemId = ids[0] || null;
        if (!this.selectedItemId && ownedTools.length > 0) this.selectedToolId = ownedTools[0].id;
      }
      if (ownedTools.length === 0 && ids.length === 0) {
        grid.appendChild(this.el('div', { class: 'card', style: 'grid-column:1/-1;' }, tr('inv.emptyCat')));
      } else {
        ownedTools.forEach(tool => {
          const tierId = g.toolTiers[tool.id] || 'basica';
          const tierMeta = Balaclava.TIER_META[tierId] || Balaclava.TIER_META.basica;
          const rarity = tierMeta.rarity || 'comun';
          const slot = this.el('div', {
            class: `inv-slot rarity-${rarity}` + (this.selectedToolId === tool.id ? ' selected' : ''),
            'data-tip': this.tipAttr(this._buildToolTipSpec(tool.id, { context: 'inv' })),
            'aria-label': `${tool.name} (${tierMeta.name})`,
            onclick: (ev) => {
              if (ev && ev.shiftKey && g.quickTransferToHotbar) {
                const idx = g.quickTransferToHotbar('tool', tool.id);
                Balaclava.Audio.play('pickup');
                g.toast(tr('inv.sentHotbar', { name: `${tool.name} (${tierMeta.name})`, slot: idx + 1 }), 'success');
                this.updateHUD(true);
                this.renderModal();
                return;
              }
              this.selectedToolId = tool.id;
              this.selectedItemId = null;
              this.renderModal();
            }
          }, [
            this.toolIcon(tool.id, tierId, 46),
            this.el('span', { class: 'slot-qty', style: `color:${tierMeta.color};` }, 'H')
          ]);
          grid.appendChild(slot);
        });
        ids.forEach(id => {
          const it = Balaclava.ITEMS[id];
          const slot = this.el('div', {
            class: `inv-slot rarity-${it.rarity || 'comun'}` + (!this.selectedToolId && this.selectedItemId === id ? ' selected' : ''),
            'data-tip': this.tipAttr(this._buildItemTipSpec(id, { count: g.inventory[id], context: 'inv' })),
            'aria-label': it.name,
            onclick: (ev) => {
              if (ev && ev.shiftKey && g.quickTransferToHotbar) {
                const idx = g.quickTransferToHotbar('item', id);
                Balaclava.Audio.play('pickup');
                g.toast(tr('inv.sentHotbar', { name: it.name, slot: idx + 1 }), 'success');
                this.updateHUD(true);
                this.renderModal();
                return;
              }
              this.selectedToolId = null;
              this.selectedItemId = id;
              this.renderModal();
            }
          }, [
            this.itemIcon(it.icon, 46),
            this.el('span', { class: 'slot-qty' }, String(g.inventory[id]))
          ]);
          grid.appendChild(slot);
        });
      }
      if (this.invSearch) applyInvSearch(this.invSearch);
      layout.appendChild(grid);

      // Right Parchment Detail & 5-Slot Paperdoll Inspector
      const rightCol = this.el('div', { style: 'display:flex;flex-direction:column;gap:10px;' });

      const selTool = this.selectedToolId && g.toolTiers[this.selectedToolId] && Balaclava.TOOLS[this.selectedToolId];
      const sel = !selTool && this.selectedItemId && Balaclava.ITEMS[this.selectedItemId];
      if (selTool) {
        const tierId = g.toolTiers[selTool.id] || 'basica';
        const stats = Balaclava.getToolStats(selTool.id, tierId);
        const rar = RARITIES[Balaclava.TIER_META[tierId].rarity] || RARITIES.comun;
        const det = this.el('div', { class: 'parchment-box', style: 'display:flex;flex-direction:column;gap:8px;' }, [
          this.el('div', { class: 'card-head' }, [
            this.toolIcon(selTool.id, tierId, 48),
            this.el('div', {}, [
              this.el('strong', { style: 'font-size:18px;' }, `${selTool.name} (${stats.tierName})`),
              this.el('div', {}, this.el('span', { class: 'rarity-tag', style: `background:${rar.bg};color:${rar.color}` }, rar.name))
            ])
          ]),
          this.el('div', { style: 'font-size:16px;line-height:1.45;color:#e6dfd2;' }, selTool.role),
          this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;' }, [
            this.el('span', { class: 'rarity-tag', style: 'background:rgba(40,26,14,0.85);color:#ffd54f;border:1px solid #a87b3d;' }, tr('inv.powerTag', { n: stats.power })),
            this.el('span', { class: 'rarity-tag', style: 'background:rgba(20,38,54,0.85);color:#80deea;border:1px solid #3c789c;' }, tr('inv.speedTag', { n: (stats.speed * stats.swingRate).toFixed(2) })),
            this.el('span', { class: 'rarity-tag', style: 'background:rgba(32,48,26,0.85);color:#aed581;border:1px solid #558b2f;' }, tr('inv.reachTag', { n: (stats.reach / 48).toFixed(1) }))
          ])
        ]);
        const actRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;' });
        actRow.appendChild(this.el('button', {
          class: 'btn btn-gold btn-sm',
          onclick: () => {
            const idx = g.quickTransferToHotbar ? g.quickTransferToHotbar('tool', selTool.id) : 0;
            g.toast(tr('inv.sentHotbar', { name: selTool.name, slot: idx + 1 }), 'info');
            this.updateHUD(true);
            this.renderModal();
          }
        }, tr('inv.sendHotbar')));
        det.appendChild(actRow);
        det.appendChild(this.el('div', { style: 'font-size:16px;color:#ffe8a3;margin-top:4px;' }, tr('inv.assignToolHotbar')));
        const hbRow = this.el('div', { class: 'inv-hotbar-assign' });
        for (let slotNum = 0; slotNum < 9; slotNum++) {
          const cur = g.hotbar[slotNum];
          const isBound = cur && cur.kind === 'tool' && cur.id === selTool.id;
          hbRow.appendChild(this.el('button', {
            class: 'inv-hb-btn' + (isBound ? ' bound' : ''),
            title: isBound ? tr('inv.removeSlot', { slot: slotNum + 1 }) : tr('inv.pinSlot', { name: selTool.name, slot: slotNum + 1 }),
            onclick: () => {
              if (isBound) {
                g.assignHotbarSlot(slotNum, null, null);
                g.toast(tr('inv.slotFreed', { slot: slotNum + 1 }), 'info');
              } else {
                g.assignHotbarSlot(slotNum, 'tool', selTool.id);
                g.toast(tr('inv.assignedSlot', { name: selTool.name, slot: slotNum + 1 }), 'info');
              }
              this.updateHUD(true);
              this.renderModal();
            }
          }, String(slotNum + 1)));
        }
        det.appendChild(hbRow);
        rightCol.appendChild(det);
      } else if (sel) {
        const rar = RARITIES[sel.rarity] || RARITIES.comun;
        const hpGain = sel.healHp || (sel.edible && sel.edible.hp) || 0;
        const enGain = sel.healEnergy || (sel.edible && sel.edible.energy) || 0;
        const ed = sel.edible;
        const statChips = [];
        if (hpGain > 0) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(20,58,28,0.9);color:#81c784;border:1px solid #4caf50;'
          }, tr('inv.healGradual', { n: hpGain })));
        }
        if (enGain > 0) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(16,44,64,0.9);color:#4fc3f7;border:1px solid #29b6f6;'
          }, tr('inv.enGain', { n: enGain })));
        }
        if (sel.buff) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(68,38,14,0.9);color:#ffd54f;border:1px solid #ffb300;'
          }, tr('inv.buffTag', { type: sel.buff.type, dur: sel.buff.duration })));
        }
        if (ed && ed.speedBoost) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(20,46,60,0.9);color:#80deea;border:1px solid #26c6da;'
          }, tr('inv.speedBuff', { dur: ed.speedBoost })));
        }
        if (ed && ed.dmgBoost) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(68,24,24,0.9);color:#ff8a80;border:1px solid #ef5350;'
          }, tr('inv.dmgBuff', { dur: ed.dmgBoost })));
        }
        if (ed && ed.luckBoost) {
          statChips.push(this.el('span', {
            class: 'rarity-tag',
            style: 'background:rgba(56,28,68,0.9);color:#ea80fc;border:1px solid #ba68c8;'
          }, tr('inv.luckBuff', { dur: ed.luckBoost })));
        }
        const det = this.el('div', { class: 'parchment-box', style: 'display:flex;flex-direction:column;gap:8px;' }, [
          this.el('div', { class: 'card-head' }, [
            this.itemIcon(sel.icon, 48),
            this.el('div', {}, [
              this.el('strong', { style: 'font-size:18px;' }, sel.name),
              this.el('div', {}, this.el('span', { class: 'rarity-tag', style: `background:${rar.bg};color:${rar.color}` }, rar.name))
            ])
          ]),
          this.el('div', { style: 'font-size:16px;line-height:1.45;color:#e6dfd2;' }, sel.desc),
          this._buildWeaponStatsBox(sel),
          (sel.equipSlot && (sel.stats || sel.bonus)) ? (() => {
            const sk = sel.equipSlot === 'helmet' ? 'helm' : sel.equipSlot;
            const eqId = g.equipped && g.equipped[sk];
            const eqIt = eqId && eqId !== sel.id ? Balaclava.ITEMS[eqId] : null;
            return this._buildArmorComparisonBox(eqIt, sel);
          })() : null,
          statChips.length > 0 ? this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;' }, statChips) : null,
          this.el('div', { style: 'font-size:16px;color:#9ec5ff;' }, tr('inv.sourceValue', { source: sel.source, value: sel.sellValue }))
        ]);
        const actRow = this.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;' });
        if (sel.placeBuilding) {
          actRow.appendChild(this.el('button', {
            class: 'btn btn-green btn-sm',
            onclick: () => { g.useOrEquipItem(sel.id); this.closeModal(); this.updateHUD(true); }
          }, tr('inv.placeIsland')));
        } else if (sel.isLaserWeapon) {
          actRow.appendChild(this.el('button', {
            class: 'btn btn-green btn-sm',
            onclick: () => {
              const slotIdx = g.quickTransferToHotbar ? g.quickTransferToHotbar('item', sel.id) : 7;
              g.activeSlot = slotIdx;
              g.toast(tr('inv.equippedGunToast', { name: sel.name, slot: slotIdx + 1 }), 'success');
              this.closeModal();
              this.updateHUD(true);
            }
          }, tr('inv.equipUse')));
        } else if (sel.consumable || sel.equipSlot) {
          actRow.appendChild(this.el('button', {
            class: 'btn btn-green btn-sm',
            onclick: () => { g.useOrEquipItem(sel.id); this.renderModal(); }
          }, sel.equipSlot ? tr('common.equip') : sel.isBomb ? tr('inv.throwExplosive') : tr('inv.useConsume')));
        }
        actRow.appendChild(this.el('button', {
          class: 'btn btn-gold btn-sm',
          title: tr('inv.shiftHint'),
          onclick: () => {
            const idx = g.quickTransferToHotbar ? g.quickTransferToHotbar('item', sel.id) : 7;
            g.toast(tr('inv.sentHotbar', { name: sel.name, slot: idx + 1 }), 'info');
            this.updateHUD(true);
            this.renderModal();
          }
        }, tr('inv.sendHotbar')));
        det.appendChild(actRow);

        det.appendChild(this.el('div', { style: 'font-size:16px;color:#ffe8a3;margin-top:4px;' }, tr('inv.assignItemHotbar')));
        const hbRow = this.el('div', { class: 'inv-hotbar-assign' });
        for (let slotNum = 0; slotNum < 9; slotNum++) {
          const cur = g.hotbar[slotNum];
          const isBound = cur && cur.kind === 'item' && cur.id === sel.id;
          hbRow.appendChild(this.el('button', {
            class: 'inv-hb-btn' + (isBound ? ' bound' : ''),
            title: isBound ? tr('inv.removeSlot', { slot: slotNum + 1 }) : tr('inv.pinSlot', { name: sel.name, slot: slotNum + 1 }),
            onclick: () => {
              if (isBound && g.assignHotbarSlot) {
                g.assignHotbarSlot(slotNum, null, null);
                g.toast(tr('inv.slotFreed', { slot: slotNum + 1 }), 'info');
              } else if (g.assignHotbarSlot) {
                g.assignHotbarSlot(slotNum, 'item', sel.id);
                g.toast(tr('inv.assignedSlot', { name: sel.name, slot: slotNum + 1 }), 'info');
              } else {
                g.hotbar[slotNum] = { kind: 'item', id: sel.id };
              }
              this.updateHUD(true);
              this.renderModal();
            }
          }, String(slotNum + 1)));
        }
        det.appendChild(hbRow);
        rightCol.appendChild(det);
      }

      // 7-Slot Equipment Paperdoll with FDA Slot Frames
      const equipDefs = [
        ['helm', tr('inv.slotHelm'), Balaclava.UI_URLS.slotHead],
        ['armor', tr('inv.slotArmor'), Balaclava.UI_URLS.slotChest],
        ['shield', tr('inv.slotShield'), Balaclava.UI_URLS.slotOffhand],
        ['boots', tr('inv.slotBoots'), Balaclava.UI_URLS.slotFeet],
        ['ring', tr('inv.slotRing'), Balaclava.UI_URLS.slotRing],
        ['amulet', tr('inv.slotAmulet'), Balaclava.UI_URLS.slotNeck],
        ['relic', tr('inv.slotRelic'), Balaclava.UI_URLS.slotRing]
      ];
      const dollGrid = this.el('div', { class: 'equip-doll-grid' });
      equipDefs.forEach(([slotKey, slotLabel, bgUrl]) => {
        const eqId = g.equipped[slotKey];
        const eqItem = eqId && Balaclava.ITEMS[eqId];
        const enchs = eqId && g.armorEnchants && g.armorEnchants[eqId]
          ? Object.entries(g.armorEnchants[eqId]).filter(([, l]) => l > 0)
            .map(([eid, l]) => `${Balaclava.ARMOR_ENCHANTS[eid] ? Balaclava.ARMOR_ENCHANTS[eid].name : eid} ${tr('common.levelShort')}${l}`).join(', ')
          : '';
        const frame = this.el('div', {
          class: 'equip-doll-frame',
          style: `background-image:url('${bgUrl}');` + (eqItem ? 'outline:2px solid #ffd54f;outline-offset:-2px;box-shadow:0 0 10px rgba(255,213,79,0.55);' : ''),
          'data-tip': this.tipAttr(eqItem
            ? this._buildItemTipSpec(eqItem.id, { enchantsText: enchs, context: 'equip' })
            : { title: slotLabel, sub: tr('inv.emptyEquipSub'), desc: tr('inv.emptyEquipDesc') }),
          'aria-label': eqItem ? `${eqItem.name}${enchs ? ' (' + enchs + ')' : ''}` : `${slotLabel}: ${tr('common.empty')}`,
          onclick: () => {
            if (eqItem) {
              g.addItem(eqId, 1);
              g.equipped[slotKey] = null;
              g.recomputeModifiers();
              this.updateHUD(true);
              this.renderModal();
            }
          }
        }, eqItem ? this.itemIcon(eqItem.icon, 30) : null);

        dollGrid.appendChild(this.el('div', { class: 'equip-doll-slot' }, [
          frame,
          this.el('div', { class: 'equip-doll-label' }, eqItem ? eqItem.name.split(' ')[0] : slotLabel)
        ]));
      });

      const eqPanel = this.el('div', { class: 'parchment-box' }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px;' }, [
          this.el('strong', { style: 'font-size:16px;' }, tr('inv.activeGearTitle')),
          this.el('button', {
            class: 'btn btn-stone btn-sm',
            onclick: () => this.openModal('stats')
          }, tr('inv.viewStats'))
        ]),
        dollGrid
      ]);
      rightCol.appendChild(eqPanel);

      // Permanent Boss & Secret Relics showcase
      const relics = Balaclava.PERMANENT_RELICS ? Object.values(Balaclava.PERMANENT_RELICS) : [];
      if (relics.length) {
        const relStrip = this.el('div', { class: 'relic-strip' });
        relics.forEach(rel => {
          const owned = g.hasPermanentRelic(rel.id);
          const isSec = !!rel.isSecret || !rel.bossName;
          const bLabel = (rel.biome && BIOMES[rel.biome] && BIOMES[rel.biome].name) || rel.biome || tr('inv.archipelago');
          const lockTitle = isSec
            ? tr('inv.secretChestLockTitle')
            : tr('inv.bossLockTitle', { boss: rel.bossName, biome: bLabel });
          const lockName = isSec ? tr('inv.secretLockName') : `??? (${rel.bossName})`;
          const pill = this.el('div', {
            class: 'relic-pill',
            style: owned ? '' : 'opacity:0.42;filter:grayscale(0.9);border-color:#69503d;',
            title: owned ? `${rel.name}: ${rel.desc}` : lockTitle
          }, [
            this.itemIcon(rel.icon, 22),
            this.el('span', {}, owned ? rel.name : lockName)
          ]);
          relStrip.appendChild(pill);
        });
        rightCol.appendChild(this.el('div', { class: 'card' }, [
          this.el('strong', { style: 'color:#ffd54f;font-size:16px;' }, tr('inv.permRelicsCount', { cur: (g.permanentRelics || []).length, total: relics.length })),
          relStrip
        ]));
      }

      layout.appendChild(rightCol);
      body.appendChild(layout);

      // Interactive Hotbar Strip [1..9] directly inside Inventory (click to swap/assign/inspect, Shift+Click / right-click removes item)
      const hbPanel = this.el('div', { class: 'parchment-box inv-hotbar-strip' }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;' }, [
          this.el('strong', { style: 'font-size:16px;' }, tr('inv.interactiveHotbar')),
          this.el('span', { style: 'font-size:16px;color:#bfd0ea;' },
            this._invSwapIdx != null
              ? tr('inv.swapChoose', { slot: this._invSwapIdx + 1 })
              : tr('inv.hotbarInstructions'))
        ])
      ]);
      const hbRowInv = this.el('div', { class: 'inv-hotbar-row' });
      for (let idx = 0; idx < 9; idx++) {
        const slot = g.hotbar[idx];
        const isTool = slot && slot.kind === 'tool' && g.toolTiers[slot.id];
        const isItem = slot && slot.kind === 'item' && (g.inventory[slot.id] || 0) > 0 && Balaclava.ITEMS[slot.id];
        const isSwapSrc = this._invSwapIdx === idx;
        const slotKids = [this.el('span', { class: 'slot-key' }, String(idx + 1))];
        let tip = tr('inv.hotbarFreeSlot', { slot: idx + 1 });
        if (isTool) {
          const tier = g.toolTiers[slot.id] || 'basica';
          slotKids.push(this.toolIcon(slot.id, tier, 34));
          tip = `${Balaclava.TOOLS[slot.id].name} (${Balaclava.TIER_META[tier].name})`;
        } else if (isItem) {
          const it = Balaclava.ITEMS[slot.id];
          slotKids.push(this.itemIcon(it.icon, 34));
          slotKids.push(this.el('span', { class: 'slot-qty' }, String(g.inventory[slot.id])));
          tip = tr('inv.hotbarRemoveTip', { name: it.name, qty: g.inventory[slot.id] });
        }
        const hbBtn = this.el('div', {
          class: 'inv-hb-slot' + (g.activeSlot === idx ? ' active-slot' : '') + (isSwapSrc ? ' is-swap-src' : ''),
          title: tip,
          onclick: (ev) => {
            if (ev && ev.shiftKey) {
              g.hotbar[idx] = null;
              this._invSwapIdx = null;
              this.updateHUD(true);
              this.renderModal();
              return;
            }
            if (this._invSwapIdx != null) {
              if (this._invSwapIdx !== idx && g.swapHotbarSlots) {
                g.swapHotbarSlots(this._invSwapIdx, idx);
                Balaclava.Audio.play('pickup');
              }
              this._invSwapIdx = null;
              this.updateHUD(true);
              this.renderModal();
              return;
            }
            if (!isTool && !isItem && this.selectedToolId && g.toolTiers && g.toolTiers[this.selectedToolId]) {
              if (g.assignHotbarSlot) g.assignHotbarSlot(idx, 'tool', this.selectedToolId);
              else g.hotbar[idx] = { kind: 'tool', id: this.selectedToolId };
              Balaclava.Audio.play('pickup');
              this.updateHUD(true);
              this.renderModal();
              return;
            }
            if (!isTool && !isItem && this.selectedItemId && (g.inventory[this.selectedItemId] || 0) > 0) {
              if (g.assignHotbarSlot) g.assignHotbarSlot(idx, 'item', this.selectedItemId);
              else g.hotbar[idx] = { kind: 'item', id: this.selectedItemId };
              Balaclava.Audio.play('pickup');
              this.updateHUD(true);
              this.renderModal();
              return;
            }
            this._invSwapIdx = idx;
            this.renderModal();
          },
          oncontextmenu: (ev) => {
            ev.preventDefault();
            g.hotbar[idx] = null;
            this._invSwapIdx = null;
            this.updateHUD(true);
            this.renderModal();
          }
        }, slotKids);
        hbRowInv.appendChild(hbBtn);
      }
      hbPanel.appendChild(hbRowInv);
      body.appendChild(hbPanel);
    }

    renderStats(body) {
      const g = this.game;
      const p = g.player;
      const m = g.mods || {};
      const fmtPct = (v) => {
        const n = Math.round((v || 0) * 100);
        return `${n >= 0 ? '+' : ''}${n}%`;
      };
      const dayPhase = g.getDayPhase ? g.getDayPhase() : { label: tr('hud.phaseDay'), phase: 'dia' };
      const maxEnch = g.getMaxEnchantSlots ? g.getMaxEnchantSlots() : 3;
      const makeRow = (k, v, valColor = '#ffe082') => this.el('div', { class: 'stat-detail-row' }, [
        this.el('span', { style: 'color:#e6dccb;' }, k),
        this.el('strong', { style: `color:${valColor};` }, String(v))
      ]);

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;' }, [
        this.el('div', {}, [
          this.el('strong', { style: 'font-size:18px;' }, tr('stats.heroTitle', { level: p.level })),
          this.el('div', { style: 'font-size:14px;color:#bfd0ea;font-weight:600;' }, tr('stats.heroMeta', { xp: p.xp, nextXp: p.nextXp, day: g.dayCount || 1, phase: dayPhase.label, sp: p.skillPoints }))
        ]),
        this.el('button', {
          class: 'btn btn-gold btn-sm',
          onclick: () => this.openModal('skills')
        }, tr('stats.openSkills'))
      ]));

      const combatCard = this.el('div', { class: 'card' }, [
        this.el('strong', { style: 'color:#ff8a80;font-size:15px;margin-bottom:4px;display:block;' }, tr('stats.combatSec')),
        makeRow(tr('stats.hpRow'), `${Math.round(p.hp)} / ${Math.round(p.maxHp)}`, '#ef9a9a'),
        makeRow(tr('stats.defRow'), tr('stats.defVal', { def: Math.round(m.def || 0), mit: Math.round((m.def || 0) * 0.65) })),
        makeRow(tr('stats.dmgRow'), fmtPct(m.dmgBonus)),
        makeRow(tr('stats.bossDmgRow'), fmtPct(m.bossDmg)),
        makeRow(tr('stats.critRow'), `${Math.round((m.critChance || 0) * 100)}%`),
        makeRow(tr('stats.atkSpdRow'), fmtPct(m.attackSpeed)),
        makeRow(tr('stats.regenRow'), `${(m.regen || 0).toFixed(1)} HP/s`, '#81c784'),
        makeRow(tr('stats.lifestealRow'), `+${Math.round(m.killHeal || 0)} HP`, '#81c784'),
        makeRow(tr('stats.thornsRow'), `${Math.round((m.thorns || 0) * 100)}%`)
      ]);

      const worldCard = this.el('div', { class: 'card' }, [
        this.el('strong', { style: 'color:#80deea;font-size:15px;margin-bottom:4px;display:block;' }, tr('stats.gatherSec')),
        makeRow(tr('stats.enRow'), `${Math.round(p.energy)} / ${Math.round(p.maxEnergy)}`, '#80d8ff'),
        makeRow(tr('stats.enRegenRow'), `${(1.2 + (m.energyRegen || 0)).toFixed(1)}/s`, '#80d8ff'),
        makeRow(tr('stats.moveSpdRow'), fmtPct(m.moveSpeed)),
        makeRow(tr('stats.gatherPwrRow'), fmtPct(m.gatherPower)),
        makeRow(tr('stats.mineChopRow'), `${fmtPct(m.mineSpeed)} / ${fmtPct(m.chopSpeed)}`),
        makeRow(tr('stats.luckRow'), fmtPct(m.luckBonus), '#b9f6ca'),
        makeRow(tr('stats.magnetRow'), tr('stats.magnetVal', { n: 72 + Math.round(m.magnetBonus || 0) })),
        makeRow(tr('stats.nightLightRow'), tr('stats.nightLightVal', { n: Math.round(m.lightRadius || 0) })),
        makeRow(tr('stats.enchSlotsRow'), `${maxEnch} / 6`, '#ce93d8')
      ]);

      const recordsCard = this.el('div', { class: 'card' }, [
        this.el('strong', { style: 'color:#ffd54f;font-size:15px;margin-bottom:4px;display:block;' }, tr('stats.recordsSec')),
        makeRow(tr('stats.goldRow'), `${Balaclava.Utils.formatNum(g.coins)} / ${Balaclava.Utils.formatNum(g.stats.coinsEarned || 0)}`),
        makeRow(tr('stats.plotsRow'), `${g.unlockedPlots.length} / ${GRID_PLOTS * GRID_PLOTS}`),
        makeRow(tr('stats.dungeonsRow'), `${g.clearedDungeons.length} / ${Object.keys(Balaclava.DUNGEON_DEFS || {}).length}`),
        makeRow(tr('stats.starsRow'), `${g.unlockedSkills.length} / ${Object.keys(Balaclava.SKILLS || {}).length}`),
        makeRow(tr('stats.relicsRow'), `${(g.permanentRelics || []).length} / ${Object.keys(Balaclava.PERMANENT_RELICS || {}).length}`),
        makeRow(tr('stats.killsRow'), Balaclava.Utils.formatNum(g.stats.kills || 0)),
        makeRow(tr('stats.gatheredRow'), Balaclava.Utils.formatNum(g.stats.gatheredTotal || 0)),
        makeRow(tr('stats.craftedRow'), Balaclava.Utils.formatNum(g.stats.craftedTotal || 0)),
        makeRow(tr('stats.farmRow'), `${g.stats.fishCaught || 0} / ${g.stats.cropsHarvested || 0} / ${g.stats.chestsOpened || 0}`)
      ]);

      body.appendChild(this.el('div', { class: 'stats-section-grid' }, [combatCard, worldCard, recordsCard]));
    }

    _renderCraftQueueBanner(parent) {
      const g = this.game;
      const queue = g.craftQueue || [];
      const ready = g.craftReady || [];
      if (!queue.length && !ready.length) return;
      const wrapper = this.el('div', {
        id: 'live-craft-queue-list',
        'data-count': String(queue.length),
        'data-ready-count': String(ready.length)
      });

      if (ready.length > 0) {
        const rBox = this.el('div', { class: 'craft-ready-box' }, [
          this.el('div', { class: 'craft-ready-hdr' }, [
            this.el('strong', { style: 'color:#b9f6ca;font-size:14px;' }, tr('craft.pickupTray', { n: ready.length })),
            this.el('button', {
              class: 'btn btn-green btn-sm',
              onclick: () => { g.claimAllCrafted(); this.updateHUD(true); this.renderModal(); }
            }, tr('craft.claimAll'))
          ])
        ]);
        const rGrid = this.el('div', { class: 'craft-ready-grid' });
        ready.forEach((entry, ri) => {
          const itDef = Balaclava.ITEMS[entry.out];
          rGrid.appendChild(this.el('div', { class: 'craft-ready-item' }, [
            itDef ? this.itemIcon(itDef.icon, 26) : null,
            this.el('div', {}, [
              this.el('div', { style: 'font-size:14px;font-weight:700;color:#fff;' }, `${entry.name} x${entry.qty}`),
              this.el('div', { style: 'font-size:14px;color:#b9f6ca;line-height:1.45;' }, entry.isCook ? tr('craft.dishReady') : tr('craft.craftedDone'))
            ]),
            this.el('button', {
              class: 'btn btn-gold btn-sm',
              style: 'padding:3px 9px;font-size:14px;',
              onclick: () => { g.claimCrafted(ri); this.updateHUD(true); this.renderModal(); }
            }, tr('craft.claim'))
          ]));
        });
        rBox.appendChild(rGrid);
        wrapper.appendChild(rBox);
      }

      if (queue.length > 0) {
        const qBox = this.el('div', { class: 'craft-queue-box' }, [
          this.el('strong', { style: 'color:#ffd54f;font-size:14px;display:block;margin-bottom:4px;' }, tr('craft.activeQueue', { n: queue.length }))
        ]);
        queue.forEach((job, ji) => {
          const pct = Math.min(100, Math.round(((job.elapsed || 0) / Math.max(0.1, job.totalTime || 1)) * 100));
          const rem = Math.max(0, (job.totalTime || 0) - (job.elapsed || 0)).toFixed(1);
          qBox.appendChild(this.el('div', { style: 'margin-top:4px;' }, [
            this.el('div', { class: 'craft-queue-row' }, [
              this.el('span', {}, `${job.name} x${job.qty}`),
              this.el('span', { id: `cq-rem-${ji}` }, `${rem}s`)
            ]),
            this.el('div', { class: 'craft-queue-bar' }, [
              this.el('div', { id: `cq-fill-${ji}`, class: 'craft-queue-fill', style: `width:${pct}%` })
            ])
          ]));
        });
        wrapper.appendChild(qBox);
      }

      parent.appendChild(wrapper);
    }

    _checkCraftIngredient(id, q) {
      const g = this.game;
      const invQty = g.inventory[id] || 0;
      if (invQty >= q) return { ok: true, have: invQty, viaEquipped: false };
      const itDef = Balaclava.ITEMS[id];
      if (q === 1 && itDef && itDef.equipSlot) {
        const sk = itDef.equipSlot === 'helmet' ? 'helm' : itDef.equipSlot;
        if (g.equipped && g.equipped[sk] === id) {
          return { ok: true, have: 1, viaEquipped: true };
        }
      }
      return { ok: false, have: invQty, viaEquipped: false };
    }

    _getWeaponAttributes(item) {
      if (!item) return null;
      const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
      const wm = item.weaponMelee;
      const bs = item.bladeStats;
      const rs = item.rangedStats;
      const ss = item.staffStats;
      const ls = item.laserStats;
      if (!wm && !bs && !rs && !ss && !ls) return null;

      let dmg = 0;
      let nodeDmg = 0;
      let cooldown = 0.25;
      let rangePx = 74;
      let energyCost = 0;
      let kindLabel = isEn ? 'Melee Weapon' : 'Arma Cuerpo a Cuerpo';
      const effects = [];

      if (wm) {
        dmg = wm.dmg || 20;
        cooldown = wm.speed || 0.24;
        rangePx = wm.range || 74;
        if (wm.critBonus) effects.push(isEn ? `+${Math.round(wm.critBonus * 100)}% Critical Chance` : `+${Math.round(wm.critBonus * 100)}% Prob. Crítico`);
        if (wm.stunChance) effects.push(isEn ? `${Math.round(wm.stunChance * 100)}% Stun Chance` : `${Math.round(wm.stunChance * 100)}% Prob. Aturdir`);
        if (wm.cleave) effects.push(isEn ? 'Wide Area Cleave' : 'Barrido en Área Amplia');
      } else if (bs) {
        kindLabel = isEn ? 'Elemental Blade' : 'Hoja Elemental';
        dmg = bs.dmg || 60;
        cooldown = bs.cooldown || 0.24;
        rangePx = bs.range || 115;
        energyCost = bs.energyCost || 0;
        if (bs.waveRange) {
          effects.push(isEn
            ? `Projected Wave (${(bs.waveRange / 48).toFixed(1)} tiles)`
            : `Onda Proyectada (${(bs.waveRange / 48).toFixed(1)} casillas)`);
        }
        if (bs.lifeSteal) effects.push(isEn ? `${Math.round(bs.lifeSteal * 100)}% Lifesteal` : `${Math.round(bs.lifeSteal * 100)}% Robo de Vida`);
        if (bs.slow) effects.push(isEn ? 'Chills & Slows Enemies' : 'Congela y Ralentiza Enemigos');
      } else if (rs) {
        kindLabel = isEn ? 'Ranged Ballistic Weapon' : 'Arma a Distancia';
        dmg = rs.dmg || 38;
        cooldown = rs.cooldown || 0.32;
        rangePx = rs.range || 420;
        if (rs.pierce) effects.push(isEn ? `Pierces up to ${rs.pierce} targets` : `Perfora hasta ${rs.pierce} objetivos`);
      } else if (ss) {
        kindLabel = isEn ? 'Arcane Staff / Wand' : 'Báculo / Varita Arcana';
        dmg = ss.dmg || 45;
        cooldown = ss.cooldown || 0.28;
        rangePx = ss.range || 420;
        energyCost = ss.energyCost || 0;
        effects.push(isEn ? 'Scales with Magic Power' : 'Escala con Poder Mágico');
        if (ss.slowDur) effects.push(isEn ? `Slows for ${ss.slowDur}s` : `Ralentiza por ${ss.slowDur}s`);
        if (ss.burnDmg) effects.push(isEn ? `Burns (+${ss.burnDmg} dmg)` : `Quemadura (+${ss.burnDmg} daño)`);
        if (ss.pierce) effects.push(isEn ? `Pierces ${ss.pierce} enemy` : `Perfora ${ss.pierce} enemigo`);
        if (ss.aoeRadius) effects.push(isEn ? `Area Explosion (${ss.aoeRadius}px)` : `Explosión en Área (${ss.aoeRadius}px)`);
      } else if (ls) {
        kindLabel = isEn ? 'Continuous Laser Beam' : 'Arma de Haz Láser';
        dmg = ls.dmg || 75;
        nodeDmg = ls.nodeDmg || 0;
        cooldown = ls.cooldown || 0.20;
        rangePx = ls.range || 460;
        energyCost = ls.energyCost || 0;
        if (nodeDmg > 0) effects.push(isEn ? `Mining Beam (${nodeDmg} node dmg)` : `Rayo Minero (${nodeDmg} daño a vetas)`);
      }

      const aps = +(1 / Math.max(0.05, cooldown)).toFixed(1);
      const rangeTiles = +(rangePx / 48).toFixed(1);
      return {
        kindLabel,
        dmg,
        nodeDmg,
        cooldown,
        aps,
        rangePx,
        rangeTiles,
        energyCost,
        effects,
        uses: item.uses || ''
      };
    }

    _getBaselineWeaponForComparison(targetItem) {
      const g = this.game;
      if (!g) return null;
      const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
      // Check active hotbar slot first if it holds another weapon
      const activeEntry = g.hotbar && g.hotbar[g.activeSlot || 0];
      if (activeEntry && activeEntry.kind === 'item' && activeEntry.id !== targetItem.id) {
        const eqIt = Balaclava.ITEMS && Balaclava.ITEMS[activeEntry.id];
        const eqW = this._getWeaponAttributes(eqIt);
        if (eqW) return { name: eqIt.name, dmg: eqW.dmg, aps: eqW.aps, rangeTiles: eqW.rangeTiles };
      }
      // Otherwise compare against owned sword or bow tier
      const isRanged = Boolean(targetItem.rangedStats || targetItem.staffStats || targetItem.laserStats);
      const refToolId = isRanged && g.toolTiers && g.toolTiers.arco ? 'arco' : (g.toolTiers && g.toolTiers.espada ? 'espada' : null);
      if (refToolId && Balaclava.getToolStats) {
        const st = Balaclava.getToolStats(refToolId, g.toolTiers[refToolId]);
        if (st) {
          return {
            name: `${st.name} (${st.tierName})`,
            dmg: st.power,
            aps: +(st.swingRate * st.speed).toFixed(1),
            rangeTiles: +(st.reach / 48).toFixed(1)
          };
        }
      }
      return null;
    }

    _buildWeaponStatsBox(item) {
      const w = this._getWeaponAttributes(item);
      if (!w) return null;
      const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
      const baseRef = this._getBaselineWeaponForComparison(item);

      const fmtDiff = (diff, suffix = '') => {
        if (!Number.isFinite(diff) || Math.abs(diff) < 0.05) return '';
        const sign = diff > 0 ? '+' : '';
        const val = Number.isInteger(diff) ? diff : diff.toFixed(1);
        return ` (${sign}${val}${suffix})`;
      };

      const rows = [
        this.el('div', { style: 'font-size:12px;font-weight:800;color:#80deea;text-transform:uppercase;letter-spacing:0.3px;' }, w.kindLabel),
        this.el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;font-size:13px;color:#f1f5f9;margin-top:2px;' }, [
          this.el('div', {}, [
            this.el('span', { style: 'color:#94a3b8;' }, isEn ? 'Damage: ' : 'Daño: '),
            this.el('strong', { style: 'color:#ffd54f;' }, `${w.dmg}`),
            baseRef ? this.el('span', {
              style: `font-size:12px;color:${w.dmg >= baseRef.dmg ? '#86efac' : '#fca5a5'};`
            }, fmtDiff(w.dmg - baseRef.dmg)) : null
          ]),
          this.el('div', {}, [
            this.el('span', { style: 'color:#94a3b8;' }, isEn ? 'Atk Speed: ' : 'Cadencia: '),
            this.el('strong', { style: 'color:#81c784;' }, `${w.aps}/s`),
            this.el('span', { style: 'color:#cbd5e1;font-size:12px;' }, ` (${w.cooldown.toFixed(2)}s)`)
          ]),
          this.el('div', {}, [
            this.el('span', { style: 'color:#94a3b8;' }, isEn ? 'Range: ' : 'Alcance: '),
            this.el('strong', { style: 'color:#93c5fd;' }, `${w.rangeTiles} ${isEn ? 'tiles' : 'cas.'}`),
            baseRef ? this.el('span', {
              style: `font-size:12px;color:${w.rangeTiles >= baseRef.rangeTiles ? '#86efac' : '#fca5a5'};`
            }, fmtDiff(w.rangeTiles - baseRef.rangeTiles)) : null
          ]),
          w.energyCost > 0 ? this.el('div', {}, [
            this.el('span', { style: 'color:#94a3b8;' }, isEn ? 'Energy: ' : 'Energía: '),
            this.el('strong', { style: 'color:#67e8f9;' }, `${w.energyCost}`)
          ]) : null
        ])
      ];

      if (w.effects.length > 0) {
        rows.push(this.el('div', { style: 'font-size:12px;color:#e9d5ff;margin-top:3px;line-height:1.35;' },
          (isEn ? 'Special: ' : 'Efecto: ') + w.effects.join(' · ')));
      } else if (w.uses) {
        rows.push(this.el('div', { style: 'font-size:12px;color:#e9d5ff;margin-top:3px;line-height:1.35;' }, w.uses));
      }
      if (baseRef) {
        rows.push(this.el('div', { style: 'font-size:11px;color:#94a3b8;margin-top:2px;' },
          isEn ? `Compared vs ${baseRef.name}` : `Comparado con ${baseRef.name}`));
      }

      return this.el('div', {
        class: 'item-stats-compare-box',
        style: 'background:rgba(15,23,42,0.72);border:1px solid rgba(125,211,252,0.28);border-radius:6px;padding:6px 8px;margin:4px 0;'
      }, rows);
    }

    _buildToolUpgradeComparisonBox(toolId, curTier, nextTier) {
      if (!Balaclava.getToolStats || !curTier || !nextTier) return null;
      const curS = Balaclava.getToolStats(toolId, curTier);
      const nextS = Balaclava.getToolStats(toolId, nextTier);
      if (!curS || !nextS) return null;
      const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
      const pDiff = nextS.power - curS.power;
      const spdDiff = +(nextS.speed - curS.speed).toFixed(2);
      const rCur = +(curS.reach / 48).toFixed(1);
      const rNext = +(nextS.reach / 48).toFixed(1);
      const rDiff = +(rNext - rCur).toFixed(1);
      const rareCur = Math.round((curS.rareBonus || 0) * 100);
      const rareNext = Math.round((nextS.rareBonus || 0) * 100);
      const rareDiff = rareNext - rareCur;

      const makeRow = (label, curVal, nextVal, diffStr) => this.el('div', {
        style: 'display:flex;justify-content:space-between;align-items:center;font-size:13px;line-height:1.4;'
      }, [
        this.el('span', { style: 'color:#cbd5e1;' }, label),
        this.el('span', { style: 'font-weight:700;color:#f8fafc;' }, [
          `${curVal} -> `,
          this.el('span', { style: 'color:#ffd54f;' }, `${nextVal}`),
          diffStr ? this.el('span', { style: 'color:#86efac;margin-left:4px;' }, `(${diffStr})`) : null
        ])
      ]);

      return this.el('div', {
        class: 'tool-upgrade-compare-box',
        style: 'background:rgba(15,23,42,0.76);border:1px solid rgba(255,213,79,0.32);border-radius:6px;padding:6px 8px;margin:4px 0;display:flex;flex-direction:column;gap:2px;'
      }, [
        this.el('div', { style: 'font-size:12px;font-weight:800;color:#ffd54f;margin-bottom:2px;' },
          isEn ? `UPGRADE PREVIEW: ${nextS.tierName}` : `MEJORA A: ${nextS.tierName}`),
        makeRow(isEn ? 'Power / Damage' : 'Poder / Daño', curS.power, nextS.power, pDiff > 0 ? `+${pDiff}` : ''),
        makeRow(isEn ? 'Action Speed' : 'Velocidad', `${curS.speed.toFixed(2)}x`, `${nextS.speed.toFixed(2)}x`, spdDiff > 0 ? `+${spdDiff}x` : ''),
        makeRow(isEn ? 'Reach' : 'Alcance', `${rCur}`, `${rNext}`, rDiff > 0 ? `+${rDiff}` : ''),
        rareDiff > 0 ? makeRow(isEn ? 'Rare Find Bonus' : 'Hallazgo Raro', `${rareCur}%`, `${rareNext}%`, `+${rareDiff}%`) : null
      ]);
    }

    _buildArmorComparisonBox(curItem, nextItem, customHeader = null) {
      if (!nextItem) return null;
      const curSt = (curItem && (curItem.stats || curItem.bonus)) || {};
      const nextSt = nextItem.stats || nextItem.bonus || {};
      const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';

      const fields = [
        { label: isEn ? 'Defense' : 'Defensa', cur: curSt.def || 0, next: nextSt.def || 0, suffix: '' },
        { label: isEn ? 'Max HP' : 'Vida Máx.', cur: curSt.maxHp || 0, next: nextSt.maxHp || 0, suffix: '' },
        { label: isEn ? 'Max Energy' : 'Energía Máx.', cur: curSt.maxEnergy || 0, next: nextSt.maxEnergy || 0, suffix: '' },
        {
          label: isEn ? 'Damage Bonus' : 'Bono Daño',
          cur: Math.round(((curSt.dmgPct || curSt.dmgBonus) || 0) * 100),
          next: Math.round(((nextSt.dmgPct || nextSt.dmgBonus) || 0) * 100),
          suffix: '%'
        },
        {
          label: isEn ? 'Move Speed' : 'Velocidad',
          cur: Math.round(((curSt.speedPct || curSt.moveSpeed) || 0) * 100),
          next: Math.round(((nextSt.speedPct || nextSt.moveSpeed) || 0) * 100),
          suffix: '%'
        },
        {
          label: isEn ? 'Luck' : 'Suerte',
          cur: Math.round((curSt.luck || 0) * 100),
          next: Math.round((nextSt.luck || 0) * 100),
          suffix: '%'
        }
      ].filter(f => f.cur !== 0 || f.next !== 0);

      if (!fields.length) return null;

      return this.el('div', {
        class: 'armor-upgrade-compare-box',
        style: 'background:rgba(15,23,42,0.76);border:1px solid rgba(134,239,172,0.32);border-radius:6px;padding:6px 8px;margin:4px 0;display:flex;flex-direction:column;gap:2px;'
      }, [
        this.el('div', { style: 'font-size:12px;font-weight:800;color:#86efac;margin-bottom:2px;' },
          customHeader || (curItem
            ? (isEn ? `COMPARE: ${curItem.name} -> ${nextItem.name}` : `COMPARATIVA: ${curItem.name} -> ${nextItem.name}`)
            : (isEn ? `ATTRIBUTES: ${nextItem.name}` : `ATRIBUTOS: ${nextItem.name}`))),
        ...fields.map(f => {
          const diff = f.next - f.cur;
          const sign = diff > 0 ? '+' : '';
          const diffColor = diff > 0 ? '#86efac' : (diff < 0 ? '#fca5a5' : '#94a3b8');
          return this.el('div', {
            style: 'display:flex;justify-content:space-between;align-items:center;font-size:13px;line-height:1.4;'
          }, [
            this.el('span', { style: 'color:#cbd5e1;' }, f.label),
            curItem
              ? this.el('span', { style: 'font-weight:700;color:#f8fafc;' }, [
                  `${f.cur}${f.suffix} -> `,
                  this.el('span', { style: 'color:#ffd54f;' }, `${f.next}${f.suffix}`),
                  diff !== 0 ? this.el('span', { style: `color:${diffColor};margin-left:4px;` }, `(${sign}${diff}${f.suffix})`) : null
                ])
              : this.el('span', { style: 'font-weight:700;color:#86efac;' }, `+${f.next}${f.suffix}`)
          ]);
        })
      ]);
    }

    _describeItemExtras(item) {
      if (!item) return '';
      const bits = [];
      if (item.desc) bits.push(item.desc);
      const st = item.stats || item.bonus;
      if (st) {
        const sList = [];
        if (st.def) sList.push(`+${st.def} ${tr('tooltip.statDef')}`);
        if (st.maxHp) sList.push(`+${st.maxHp} ${tr('tooltip.statHp')}`);
        if (st.maxEnergy) sList.push(`+${st.maxEnergy} ${tr('tooltip.statEn')}`);
        if (st.dmgPct || st.dmgBonus) sList.push(`+${Math.round((st.dmgPct || st.dmgBonus) * 100)}% ${tr('tooltip.statDmg')}`);
        if (st.speedPct || st.moveSpeed) sList.push(`+${Math.round((st.speedPct || st.moveSpeed) * 100)}% ${tr('tooltip.statSpd')}`);
        if (st.luck) sList.push(`+${Math.round(st.luck * 100)}% Suerte`);
        if (sList.length) bits.push(tr('craft.bonuses', { list: sList.join(' · ') }));
      }
      const w = this._getWeaponAttributes(item);
      if (w) {
        bits.push(`Daño: ${w.dmg} · Cadencia: ${w.aps}/s · Alcance: ${w.rangeTiles} cas.`);
        if (w.effects.length) bits.push(w.effects.join(' · '));
      }
      return bits.join(' · ');
    }

    _sortRecipes(recs) {
      const score = (rec) => {
        if (rec.toolUnlock) return 0;
        const out = rec.out === '_coin' ? null : Balaclava.ITEMS[rec.out];
        if (!out) return 10;
        if (out.cat === 'materiales' || out.cat === 'recursos') return 20 + (out.value || 0);
        if (out.cat === 'herramientas' || out.cat === 'equipamiento') return 500 + (out.value || 0);
        if (out.cat === 'comida' || out.cat === 'pociones' || out.cat === 'alimentos') return 1200 + (out.value || 0);
        if (out.cat === 'construccion') return 2400 + (out.value || 0);
        return 1800 + (out.value || 0);
      };
      return [...recs].sort((a, b) => score(a) - score(b));
    }

    _buildRecipeCard(rec, showStationLabel = true) {
      const g = this.game;
      const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage && Balaclava.I18n.getLanguage() === 'en';
      const hasStation = g.hasStationAvailable(rec.station);
      const reqSkill = rec.reqSkill ? (Balaclava.SKILLS && Balaclava.SKILLS[rec.reqSkill]) : null;
      const hasSkill = !rec.reqSkill || (Array.isArray(g.unlockedSkills) && g.unlockedSkills.includes(rec.reqSkill));
      const canAfford = hasStation && hasSkill && Object.entries(rec.in).every(([id, q]) => this._checkCraftIngredient(id, q).ok);

      const ingList = this.el('div', { style: 'font-size:14px;' });
      Object.entries(rec.in).forEach(([id, q]) => {
        const check = this._checkCraftIngredient(id, q);
        ingList.appendChild(this.el('div', { style: `color:${check.ok ? '#81c784' : '#ff8a65'};font-weight:600;` },
          `${Balaclava.ITEMS[id] ? Balaclava.ITEMS[id].name : id}: ${check.have}/${q}${check.viaEquipped ? ` (${tr('common.equipped')})` : ''}`));
      });

      const dur = g.getCraftDuration ? g.getCraftDuration(rec) : (rec.craftTime || 2.0);
      if (rec.toolUnlock) {
        const tDef = Balaclava.TOOLS[rec.toolUnlock];
        if (!tDef) return null;
        const alreadyOwned = Boolean(g.toolTiers[rec.toolUnlock]);
        const queuedJob = (g.craftQueue || []).find(j => j.toolUnlock === rec.toolUnlock);
        const rem = queuedJob ? Math.max(0, (queuedJob.totalTime || 0) - (queuedJob.elapsed || 0)).toFixed(1) : null;
        const tDesc = tDef.desc || tDef.role || '';
        return this.el('div', { class: 'card' + (alreadyOwned ? '' : ' selected') }, [
          this.el('div', { class: 'card-head' }, [
            this.toolIcon(rec.toolUnlock, 'basica', 34),
            this.el('div', {}, [
              this.el('strong', {}, tDef.name),
              this.el('div', { style: `font-size:14px;line-height:1.45;color:${alreadyOwned ? '#81c784' : '#ffd54f'}` },
                alreadyOwned ? tr('craft.alreadyBuiltTool') : tr('craft.initialToolTime', { dur: dur.toFixed(1) }))
            ])
          ]),
          tDesc ? this.el('div', { style: 'font-size:14px;color:#efe5d6;line-height:1.48;' }, tDesc) : null,
          ingList,
          this.el('button', {
            class: 'btn btn-green btn-sm',
            'data-tool-busy-id': queuedJob ? rec.toolUnlock : null,
            'data-busy-kind': queuedJob ? 'craft' : null,
            disabled: (!alreadyOwned && !queuedJob && canAfford) ? null : 'disabled',
            onclick: () => { g.craftRecipe(rec.id, 1); this.renderModal(); }
          }, alreadyOwned
            ? tr('craft.alreadyCraftedBtn')
            : (queuedJob ? tr('craft.forgingProgress', { sec: rem }) : tr('craft.craftTimedBtn', { dur: dur.toFixed(1) })))
        ]);
      }

      const isCoin = rec.out === '_coin';
      const progArmor = !isCoin && Balaclava.isProgressiveArmorItem ? Balaclava.isProgressiveArmorItem(rec.out) : null;
      if (progArmor) {
        return this._buildArmorSlotCard(progArmor.slot);
      }
      const outItem = isCoin ? { name: tr('craft.coinName'), icon: 'coin_gold', desc: tr('craft.coinDesc') } : Balaclava.ITEMS[rec.out];
      if (!outItem) return null;
      const itemSummary = this._describeItemExtras(outItem);
      const stLabel = (Balaclava.I18n && Balaclava.I18n.getStationName) ? Balaclava.I18n.getStationName(rec.station) : rec.station;
      const subText = showStationLabel
        ? tr('craft.stationLine', { station: stLabel, dur: dur.toFixed(1), missing: hasStation ? '' : tr('craft.notBuilt') })
        : tr('craft.timeLine', { dur: dur.toFixed(1) });
      const isSingleArmorPiece = Boolean(outItem.equipSlot && ['armor', 'helm', 'helmet', 'shield', 'boots'].includes(outItem.equipSlot));
      const actionButtons = isSingleArmorPiece
        ? [
            this.el('button', {
              class: 'btn btn-green btn-sm',
              style: 'flex:1 1 100%;white-space:nowrap;padding:5px 8px;',
              disabled: canAfford ? null : 'disabled',
              onclick: () => { g.craftRecipe(rec.id, 1); this.renderModal(); }
            }, tr('craft.craftTimedBtn', { dur: dur.toFixed(1) }))
          ]
        : [
            this.el('button', {
              class: 'btn btn-primary btn-sm',
              style: 'flex:1 1 88px;min-width:0;white-space:nowrap;padding:4px 6px;',
              disabled: canAfford ? null : 'disabled',
              onclick: () => { g.craftRecipe(rec.id, 1); this.renderModal(); }
            }, `x1 (${dur.toFixed(1)}s)`),
            this.el('button', {
              class: 'btn btn-sm',
              style: 'flex:0 1 auto;min-width:42px;white-space:nowrap;padding:4px 8px;',
              disabled: canAfford ? null : 'disabled',
              onclick: () => { g.craftRecipe(rec.id, 5); this.renderModal(); }
            }, 'x5'),
            this.el('button', {
              class: 'btn btn-sm',
              style: 'flex:0 1 auto;min-width:46px;white-space:nowrap;padding:4px 8px;',
              disabled: canAfford ? null : 'disabled',
              onclick: () => { g.craftRecipe(rec.id, 10); this.renderModal(); }
            }, 'x10')
          ];
      return this.el('div', { class: 'card' }, [
        this.el('div', { class: 'card-head' }, [
          this.itemIcon(outItem.icon, 32),
          this.el('div', {}, [
            this.el('strong', {}, isSingleArmorPiece ? outItem.name : `${outItem.name} x${rec.qty}`),
            this.el('div', { style: `font-size:14px;line-height:1.45;color:${hasStation ? '#ffd54f' : '#ff8a65'}` }, subText)
          ])
        ]),
        itemSummary ? this.el('div', { style: 'font-size:14px;color:#efe5d6;line-height:1.48;margin:5px 0;' }, itemSummary) : null,
        this._buildWeaponStatsBox(outItem),
        (outItem.equipSlot && (outItem.stats || outItem.bonus)) ? (() => {
          const sk = outItem.equipSlot === 'helmet' ? 'helm' : outItem.equipSlot;
          const eqId = g.equipped && g.equipped[sk];
          const eqIt = eqId && eqId !== outItem.id ? Balaclava.ITEMS[eqId] : null;
          return this._buildArmorComparisonBox(eqIt, outItem);
        })() : null,
        reqSkill ? this.el('div', {
          style: `font-size:13px;font-weight:700;padding:4px 7px;border-radius:4px;margin:2px 0;background:${hasSkill ? 'rgba(46,125,50,0.22)' : 'rgba(183,28,28,0.28)'};border:1px solid ${hasSkill ? '#66bb6a' : '#ef5350'};color:${hasSkill ? '#a5d6a7' : '#ffab91'};`
        }, hasSkill
          ? (isEn ? `Skill unlocked: ${reqSkill.name}` : `Habilidad desbloqueada: ${reqSkill.name}`)
          : (isEn ? `Requires Skill: ${reqSkill.name}` : `Requiere habilidad: ${reqSkill.name}`)) : null,
        ingList,
        this.el('div', { style: 'display:flex;gap:4px;margin-top:auto;flex-wrap:wrap;' }, actionButtons)
      ]);
    }

    renderCrafting(body, opts = {}) {
      const g = this.game;
      const onlyStation = opts && opts.onlyStation ? opts.onlyStation : null;
      const activeFilter = onlyStation || this.craftFilter;

      if (!onlyStation) {
        const tabs = this.el('div', { class: 'tab-row' });
        [
          ['todas', tr('craft.tabTodas')],
          ['mano', tr('craft.tabMano')],
          ['horno', tr('craft.tabHorno')],
          ['aserradero', tr('craft.tabAserradero')],
          ['cocina', tr('craft.tabCocina')],
          ['taller', tr('craft.tabTaller')],
          ['forja', tr('craft.tabForja')],
          ['yunque_runico', tr('craft.tabYunque')],
          ['mesa_hechiceria', tr('craft.tabSorcery')],
          ['herramientas', tr('craft.tabTools')]
        ].forEach(([id, label]) => {
          tabs.appendChild(this.el('button', {
            class: 'tab-btn' + (this.craftFilter === id ? ' active' : ''),
            onclick: () => { this.craftFilter = id; this.renderModal(); }
          }, label));
        });
        body.appendChild(tabs);
      }

      const stInfo = getStationDesc(activeFilter);
      if (!onlyStation && stInfo && activeFilter !== 'herramientas') {
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;font-size:15px;line-height:1.5;' }, [
          this.el('strong', { style: 'font-size:16px;' }, `${stInfo.title}: `),
          stInfo.text
        ]));
      }
      if (!onlyStation) {
        this._renderCraftQueueBanner(body);
      }

      if (activeFilter === 'herramientas') {
        const toolStInfo = getStationDesc('herramientas');
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;font-size:15px;line-height:1.5;' }, [
          this.el('strong', { style: 'font-size:16px;' }, `${toolStInfo.title}: `),
          toolStInfo.text
        ]));
        body.appendChild(this._buildToolsGrid());
        return;
      }

      if (activeFilter === 'mano') {
        this.renderArtesaniaCategories(body, !onlyStation);
        return;
      }

      if (activeFilter === 'forja' || activeFilter === 'yunque_runico') {
        this.renderForjaCategories(body, activeFilter, !onlyStation);
        return;
      }

      const matchStation = (s) => {
        if (activeFilter === 'todas') return true;
        if (activeFilter === 'horno') return ['horno', 'fundicion'].includes(s);
        if (activeFilter === 'aserradero') return ['aserradero', 'molino', 'telar'].includes(s);
        if (activeFilter === 'cocina') return ['cocina', 'alquimia'].includes(s);
        if (activeFilter === 'taller') return ['taller', 'laboratorio', 'investigacion'].includes(s);
        return s === activeFilter;
      };

      const grid = this.el('div', { class: 'grid-cards' });
      const applyCraftSearch = (q) => {
        this.craftSearch = q;
        const needle = (q || '').trim().toLowerCase();
        Array.from(grid.children).forEach(ch => {
          const txt = (ch.textContent || '').toLowerCase();
          ch.style.display = (!needle || txt.includes(needle)) ? '' : 'none';
        });
      };
      body.appendChild(this._buildSearchBar(this.craftSearch, tr('craft.searchPlaceholder'), applyCraftSearch));
      this._sortRecipes(Balaclava.RECIPES.filter(r => {
        if (!matchStation(r.station)) return false;
        const pa = Balaclava.isProgressiveArmorItem && Balaclava.isProgressiveArmorItem(r.out);
        if (pa && pa.tierIdx > 0) return false;
        return true;
      })).forEach(rec => {
        const card = this._buildRecipeCard(rec, !onlyStation);
        if (card) grid.appendChild(card);
      });
      if (this.craftSearch) applyCraftSearch(this.craftSearch);
      body.appendChild(grid);
    }

    _buildToolsGrid(gridStyle = '') {
      const g = this.game;
      const grid = this.el('div', { class: 'grid-cards', style: gridStyle || null });
      const queue = g.craftQueue || [];
      Object.values(Balaclava.TOOLS).forEach(tool => {
        const curTier = g.toolTiers[tool.id];
        if (!curTier) {
          const rec = Balaclava.RECIPES.find(r => r.toolUnlock === tool.id);
          const queuedCraft = queue.find(j => j.toolUnlock === tool.id);
          const rem = queuedCraft ? Math.max(0, (queuedCraft.totalTime || 0) - (queuedCraft.elapsed || 0)).toFixed(1) : null;
          const dur = rec && g.getCraftDuration ? g.getCraftDuration(rec) : 2.0;
          const canCraft = !queuedCraft && rec && Object.entries(rec.in).every(([id, q]) => (g.inventory[id] || 0) >= q);
          const costBox = this.el('div', { style: 'font-size:14px;line-height:1.48;' });
          if (rec) {
            Object.entries(rec.in).forEach(([id, q]) => {
              const have = g.inventory[id] || 0;
              costBox.appendChild(this.el('div', { style: `color:${have >= q ? '#81c784' : '#ff8a65'}` },
                `${Balaclava.ITEMS[id] ? Balaclava.ITEMS[id].name : id}: ${have}/${q}`));
            });
          }
          const baseStats = Balaclava.getToolStats ? Balaclava.getToolStats(tool.id, 'basica') : null;
          const card = this.el('div', { class: 'card card-locked' }, [
            this.el('div', { class: 'card-head' }, [
              this.toolIcon(tool.id, 'basica', 34),
              this.el('div', {}, [
                this.el('strong', {}, tool.name),
                this.el('div', { style: 'font-size:14px;line-height:1.45;color:#ffb74d;' }, tr('craft.unbuiltTool'))
              ])
            ]),
            this.el('div', { style: 'font-size:14px;color:#e6eef6;line-height:1.48;' }, tool.desc || tool.role || ''),
            baseStats ? this.el('div', {
              style: 'background:rgba(15,23,42,0.72);border:1px solid rgba(255,213,79,0.28);border-radius:6px;padding:5px 8px;font-size:13px;color:#f8fafc;'
            }, `${tr('inv.powerTag', { n: baseStats.power })} · ${tr('inv.speedTag', { n: baseStats.speed })} · ${tr('inv.reachTag', { n: (baseStats.reach / 48).toFixed(1) })}`) : null,
            costBox,
            this.el('button', {
              class: 'btn btn-green btn-sm',
              'data-tool-busy-id': queuedCraft ? tool.id : null,
              'data-busy-kind': queuedCraft ? 'craft' : null,
              disabled: canCraft ? null : 'disabled',
              onclick: () => { g.craftTool(tool.id); this.renderModal(); }
            }, queuedCraft ? tr('craft.forgingProgress', { sec: rem }) : tr('craft.craftTimedBtn', { dur: dur.toFixed(1) }))
          ]);
          grid.appendChild(card);
          return;
        }

        const nextTier = Balaclava.getNextTier(curTier);
        const curStats = Balaclava.getToolStats(tool.id, curTier);
        const hotSlotIdx = g.hotbar.findIndex(s => s && s.kind === 'tool' && s.id === tool.id);
        const card = this.el('div', { class: 'card' }, [
          this.el('div', { class: 'card-head' }, [
            this.toolIcon(tool.id, curTier, 34),
            this.el('div', {}, [
              this.el('strong', { style: `color:${curStats.tierColor}` }, `${tool.name} (${curStats.tierName})`),
              this.el('div', { style: 'font-size:14px;color:#e6eef6;line-height:1.45;' }, `${tr('inv.powerTag', { n: curStats.power })} · ${tr('inv.speedTag', { n: curStats.speed })} · ${tr('inv.reachTag', { n: (curStats.reach / 48).toFixed(1) })}`)
            ])
          ]),
          this.el('div', { style: 'font-size:14px;color:#dde8f4;line-height:1.48;' }, tool.desc || tool.role || '')
        ]);
        const hotBtnLabel = hotSlotIdx >= 0
          ? (hotSlotIdx === g.activeSlot ? tr('craft.equippedSlot', { slot: hotSlotIdx + 1 }) : tr('craft.moveToSlot', { from: hotSlotIdx + 1, to: g.activeSlot + 1 }))
          : tr('inv.sendHotbar');
        card.appendChild(this.el('button', {
          class: 'btn btn-stone btn-sm',
          onclick: () => {
            if (hotSlotIdx >= 0 && hotSlotIdx !== g.activeSlot) {
              g.swapHotbarSlots(hotSlotIdx, g.activeSlot);
            } else {
              g.quickTransferToHotbar('tool', tool.id);
            }
            this.renderModal();
          }
        }, hotBtnLabel));
        if (nextTier) {
          const compareBox = this._buildToolUpgradeComparisonBox(tool.id, curTier, nextTier);
          if (compareBox) card.appendChild(compareBox);
          const cost = tool.tierCosts[nextTier];
          const needsForja = nextTier !== 'mejorada' && !g.hasStationAvailable('forja');
          const itemsOk = cost && cost.items ? Object.entries(cost.items).every(([id, q]) => (g.inventory[id] || 0) >= q) : true;
          const queuedUp = queue.find(j => j.toolUpgrade === tool.id);
          const cdLeft = (g.toolUpgradeCooldowns && g.toolUpgradeCooldowns[tool.id]) || 0;
          const busy = Boolean(queuedUp || cdLeft > 0);
          const canUp = !busy && !needsForja && g.coins >= (cost ? cost.coins : 0) && itemsOk;
          const cDiv = this.el('div', { style: 'font-size:14px;line-height:1.48;' }, [
            this.el('div', { style: `color:${g.coins >= (cost ? cost.coins : 0) ? '#ffd54f' : '#ff8a65'}` }, `${tr('tooltip.goldLabel')}: ${g.coins}/${cost ? cost.coins : 0}`),
            ...(cost && cost.items ? Object.entries(cost.items).map(([id, q]) =>
              this.el('div', { style: `color:${(g.inventory[id] || 0) >= q ? '#81c784' : '#ff8a65'}` },
                `${Balaclava.ITEMS[id] ? Balaclava.ITEMS[id].name : id}: ${g.inventory[id] || 0}/${q}`)
            ) : [])
          ]);
          if (needsForja) cDiv.appendChild(this.el('div', { style: 'color:#ff8a65;' }, tr('tools.forjaRequired')));
          card.appendChild(cDiv);
          let upLabel;
          if (queuedUp) {
            const rem = Math.max(0, (queuedUp.totalTime || 0) - (queuedUp.elapsed || 0)).toFixed(1);
            upLabel = tr('craft.upgradingProgress', { sec: rem });
          } else if (cdLeft > 0) {
            upLabel = tr('craft.upgradeCooldown', { sec: cdLeft.toFixed(1) });
          } else {
            const dur = g.getToolUpgradeDuration ? g.getToolUpgradeDuration(nextTier) : 2.0;
            upLabel = tr('craft.upgradeTimedBtn', { tier: Balaclava.TIER_META[nextTier].name, dur: dur.toFixed(1) });
          }
          card.appendChild(this.el('button', {
            class: 'btn btn-gold btn-sm',
            'data-tool-busy-id': busy ? tool.id : null,
            'data-busy-kind': queuedUp ? 'up' : (cdLeft > 0 ? 'cd' : null),
            disabled: canUp ? null : 'disabled',
            onclick: () => { g.upgradeTool(tool.id); this.renderModal(); }
          }, upLabel));
        } else {
          card.appendChild(this.el('span', { style: 'color:#81c784;font-weight:700;font-size:14px;' }, tr('craft.maxCelestial')));
        }
        grid.appendChild(card);
      });
      return grid;
    }

    _buildArmorSlotCard(slot) {
      const g = this.game;
      const chain = Balaclava.ARMORS && Balaclava.ARMORS[slot];
      if (!chain) return null;
      const queue = g.craftQueue || [];
      const curId = g.getOwnedArmorItem ? g.getOwnedArmorItem(slot) : null;
      const slotLabel = chain.nameKey ? tr(chain.nameKey) : (chain.fallbackName || slot);

      if (!curId) {
        const baseItem = Balaclava.ITEMS[chain.baseItem];
        const rec = Balaclava.RECIPES.find(r => r.out === chain.baseItem);
        const queuedCraft = queue.find(j => j.armorUnlock === slot);
        const rem = queuedCraft ? Math.max(0, (queuedCraft.totalTime || 0) - (queuedCraft.elapsed || 0)).toFixed(1) : null;
        const dur = g.getCraftDuration ? g.getCraftDuration({ craftTime: 2.0 }) : 2.0;
        const hasSt = !rec || g.hasStationAvailable(rec.station);
        const canCraft = !queuedCraft && hasSt && rec && Object.entries(rec.in || {}).every(([id, q]) => (g.inventory[id] || 0) >= q);
        const costBox = this.el('div', { style: 'font-size:14px;line-height:1.48;' });
        if (rec) {
          Object.entries(rec.in || {}).forEach(([id, q]) => {
            const have = g.inventory[id] || 0;
            costBox.appendChild(this.el('div', { style: `color:${have >= q ? '#81c784' : '#ff8a65'}` },
              `${Balaclava.ITEMS[id] ? Balaclava.ITEMS[id].name : id}: ${have}/${q}`));
          });
        }
        return this.el('div', { class: 'card card-locked' }, [
          this.el('div', { class: 'card-head' }, [
            baseItem ? this.itemIcon(baseItem.icon, 34) : null,
            this.el('div', {}, [
              this.el('div', { style: 'font-size:12px;font-weight:700;color:#ffb74d;text-transform:uppercase;' }, slotLabel),
              this.el('strong', {}, baseItem ? baseItem.name : chain.baseItem),
              this.el('div', { style: 'font-size:14px;line-height:1.45;color:#ffb74d;' }, tr('craft.unbuiltArmor'))
            ])
          ]),
          baseItem ? this.el('div', { style: 'font-size:14px;color:#e6eef6;line-height:1.48;' }, this._describeItemExtras(baseItem) || baseItem.desc || '') : null,
          costBox,
          this.el('button', {
            class: 'btn btn-green btn-sm',
            'data-armor-busy-slot': queuedCraft ? slot : null,
            'data-busy-kind': queuedCraft ? 'craft' : null,
            disabled: canCraft ? null : 'disabled',
            onclick: () => { g.craftArmor(slot); this.renderModal(); }
          }, queuedCraft ? tr('craft.forgingProgress', { sec: rem }) : tr('craft.craftTimedBtn', { dur: dur.toFixed(1) }))
        ]);
      }

      const curItem = Balaclava.ITEMS[curId];
      const nextId = Balaclava.getArmorNextItem ? Balaclava.getArmorNextItem(slot, curId) : null;
      const nextItem = nextId ? Balaclava.ITEMS[nextId] : null;
      const tierIdx = Balaclava.getArmorTierIndex ? Balaclava.getArmorTierIndex(slot, curId) : 0;
      const isEquipped = g.equipped && g.equipped[slot] === curId;
      const rarityColors = { comun: '#cfd8dc', poco_comun: '#81c784', raro: '#64b5f6', epico: '#ce93d8', legendario: '#ffd54f' };
      const titleColor = (curItem && rarityColors[curItem.rarity]) || '#ffd54f';

      const card = this.el('div', { class: 'card' }, [
        this.el('div', { class: 'card-head' }, [
          curItem ? this.itemIcon(curItem.icon, 34) : null,
          this.el('div', {}, [
            this.el('div', { style: 'font-size:12px;font-weight:700;color:#ffb74d;text-transform:uppercase;' }, `${slotLabel} · T${tierIdx + 1}`),
            this.el('strong', { style: `color:${titleColor}` }, curItem ? curItem.name : curId)
          ])
        ]),
        curItem ? this.el('div', { style: 'font-size:14px;color:#dde8f4;line-height:1.48;' }, this._describeItemExtras(curItem) || curItem.desc || '') : null
      ]);

      card.appendChild(this.el('button', {
        class: isEquipped ? 'btn btn-stone btn-sm' : 'btn btn-primary btn-sm',
        disabled: isEquipped ? 'disabled' : null,
        onclick: () => {
          if (g.inventory && g.inventory[curId]) delete g.inventory[curId];
          if (g.equipped[slot] && g.equipped[slot] !== curId) {
            const prevEq = g.equipped[slot];
            if (!(Balaclava.isProgressiveArmorItem && Balaclava.isProgressiveArmorItem(prevEq))) {
              g.addItem(prevEq, 1);
            }
          }
          g.equipped[slot] = curId;
          g.recomputeModifiers();
          Balaclava.Audio.play('equip');
          this.renderModal();
        }
      }, isEquipped ? tr('craft.equippedArmorSlot') : tr('craft.equipArmorSlot', { name: curItem ? curItem.name : slotLabel })));

      if (nextId && nextItem) {
        const mat = Balaclava.getArmorUpgradeMaterials ? Balaclava.getArmorUpgradeMaterials(slot, nextId) : null;
        const stOk = !mat ? true : (mat.station === 'investigacion'
          ? (g.hasStationAvailable('investigacion') || g.hasStationAvailable('forja'))
          : g.hasStationAvailable(mat.station));
        const itemsOk = mat && mat.items
          ? Object.entries(mat.items).every(([id, q]) => (g.inventory[id] || 0) >= q)
          : true;
        const queuedUp = queue.find(j => j.armorUpgrade === slot);
        const cdLeft = (g.armorUpgradeCooldowns && g.armorUpgradeCooldowns[slot]) || 0;
        const busy = Boolean(queuedUp || cdLeft > 0);
        const canUp = !busy && stOk && itemsOk;

        const armorCmp = this._buildArmorComparisonBox(curItem, nextItem);
        if (armorCmp) card.appendChild(armorCmp);
        const cDiv = this.el('div', { style: 'font-size:14px;line-height:1.48;' }, [
          this.el('div', { style: 'color:#bfe2ff;font-size:13px;margin-bottom:2px;' }, `${nextItem.name}: ${this._describeItemExtras(nextItem)}`),
          ...(mat && mat.items ? Object.entries(mat.items).map(([id, q]) =>
            this.el('div', { style: `color:${(g.inventory[id] || 0) >= q ? '#81c784' : '#ff8a65'}` },
              `${Balaclava.ITEMS[id] ? Balaclava.ITEMS[id].name : id}: ${g.inventory[id] || 0}/${q}`)
          ) : [])
        ]);
        if (!stOk) cDiv.appendChild(this.el('div', { style: 'color:#ff8a65;' }, tr('tools.forjaRequired')));
        card.appendChild(cDiv);

        let upLabel;
        if (queuedUp) {
          const rem = Math.max(0, (queuedUp.totalTime || 0) - (queuedUp.elapsed || 0)).toFixed(1);
          upLabel = tr('craft.upgradingProgress', { sec: rem });
        } else if (cdLeft > 0) {
          upLabel = tr('craft.upgradeCooldown', { sec: cdLeft.toFixed(1) });
        } else {
          const nextIdx = tierIdx + 1;
          const dur = g.getArmorUpgradeDuration ? g.getArmorUpgradeDuration(nextIdx) : 2.0;
          upLabel = tr('craft.upgradeTimedBtn', { tier: nextItem.name, dur: dur.toFixed(1) });
        }
        card.appendChild(this.el('button', {
          class: 'btn btn-gold btn-sm',
          'data-armor-busy-slot': busy ? slot : null,
          'data-busy-kind': queuedUp ? 'up' : (cdLeft > 0 ? 'cd' : null),
          disabled: canUp ? null : 'disabled',
          onclick: () => { g.upgradeArmor(slot); this.renderModal(); }
        }, upLabel));
      } else {
        card.appendChild(this.el('span', { style: 'color:#81c784;font-weight:700;font-size:14px;' }, tr('craft.maxArmorRank')));
      }
      return card;
    }

    _buildArmorGrid(gridStyle = '') {
      const grid = this.el('div', { class: 'grid-cards', style: gridStyle || null });
      Object.keys(Balaclava.ARMORS || {}).forEach(slot => {
        const card = this._buildArmorSlotCard(slot);
        if (card) grid.appendChild(card);
      });
      return grid;
    }

    renderArtesaniaCategories(body, showStationLabel = false) {
      const g = this.game;
      this.artesaniaTab = this.artesaniaTab || 'herramientas';
      const validTabs = ['herramientas', 'economia', 'otros'];
      if (!validTabs.includes(this.artesaniaTab)) this.artesaniaTab = 'herramientas';

      const tabs = this.el('div', { class: 'tab-row', style: 'margin-bottom:12px;' });
      [
        ['herramientas', tr('craft.tabTools')],
        ['economia', tr('craft.tabEconomy')],
        ['otros', tr('craft.tabOther')]
      ].forEach(([catId, label]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.artesaniaTab === catId ? ' active' : ''),
          onclick: () => { this.artesaniaTab = catId; this.renderModal(); }
        }, label));
      });
      body.appendChild(tabs);

      if (this.artesaniaTab === 'herramientas') {
        body.appendChild(this._buildToolsGrid('margin-bottom:12px;'));
        return;
      }

      if (this.artesaniaTab === 'economia') {
        const stRecs = Balaclava.RECIPES.filter(r => r.station === 'mano' && (r.out === '_coin' || r.coinIcon));
        const grid = this.el('div', { class: 'grid-cards', style: 'margin-bottom:12px;' });
        this._sortRecipes(stRecs).forEach(rec => {
          const card = this._buildRecipeCard(rec, showStationLabel);
          if (card) grid.appendChild(card);
        });
        body.appendChild(grid);
        return;
      }

      if (this.artesaniaTab === 'otros') {
        const armorBaseIds = ['casco_cuero', 'armadura_cuero', 'escudo_madera', 'botas_cuero'];
        const otherRecs = Balaclava.RECIPES.filter(r => {
          if (r.station !== 'mano') return false;
          if (r.toolUnlock) return false;
          if (r.out === '_coin' || r.coinIcon) return false;
          if (armorBaseIds.includes(r.out)) return false;
          return true;
        });

        const grid = this.el('div', { class: 'grid-cards', style: 'margin-bottom:12px;' });
        const applyOtherSearch = (q) => {
          this.craftSearch = q;
          const needle = (q || '').trim().toLowerCase();
          Array.from(grid.children).forEach(ch => {
            const txt = (ch.textContent || '').toLowerCase();
            ch.style.display = (!needle || txt.includes(needle)) ? '' : 'none';
          });
        };
        body.appendChild(this._buildSearchBar(this.craftSearch, tr('craft.searchPlaceholder'), applyOtherSearch));
        this._sortRecipes(otherRecs).forEach(rec => {
          const card = this._buildRecipeCard(rec, showStationLabel);
          if (card) grid.appendChild(card);
        });
        if (this.craftSearch) applyOtherSearch(this.craftSearch);
        body.appendChild(grid);
        return;
      }
    }

    renderForjaCategories(body, stationId = 'forja', showStationLabel = false) {
      const g = this.game;
      this.forjaTab = this.forjaTab || 'armas';
      const validTabs = ['armas', 'armas_especiales', 'armadura', 'otros'];
      if (!validTabs.includes(this.forjaTab)) this.forjaTab = 'armas';

      const tabs = this.el('div', { class: 'tab-row', style: 'margin-bottom:12px;' });
      [
        ['armas', tr('craft.tabWeapons')],
        ['armas_especiales', tr('craft.tabSpecialWeapons')],
        ['armadura', tr('craft.tabArmor')],
        ['otros', tr('craft.tabOther')]
      ].forEach(([catId, label]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.forjaTab === catId ? ' active' : ''),
          onclick: () => { this.forjaTab = catId; this.renderModal(); }
        }, label));
      });
      body.appendChild(tabs);

      const standardWeaponTypes = ['daga_hierro', 'lanza_hierro', 'maza_hierro', 'hacha_batalla_hierro', 'espadon_hierro', 'ballesta_madera', 'daga_acero', 'daga_oro'];
      const isWeaponOut = (id) => {
        const item = Balaclava.ITEMS[id];
        if (!item) return false;
        if (item.equipSlot === 'weapon' || item.type === 'weapon') return true;
        return ['espada_', 'daga_', 'lanza_', 'maza_', 'hacha_batalla_', 'espadon_', 'ballesta_', 'varita_', 'cetro_', 'alabarda_', 'martillo_', 'katana_', 'hoja_'].some(p => id.startsWith(p));
      };

      if (this.forjaTab === 'armas' || this.forjaTab === 'armas_especiales') {
        const isSpecialTab = this.forjaTab === 'armas_especiales';
        const stRecs = Balaclava.RECIPES.filter(r => {
          if (r.station !== stationId && r.station !== 'forja' && r.station !== 'yunque_runico') return false;
          if (!isWeaponOut(r.out)) return false;
          const isStd = standardWeaponTypes.includes(r.out);
          return isSpecialTab ? !isStd : isStd;
        });
        const grid = this.el('div', { class: 'grid-cards', style: 'margin-bottom:12px;' });
        this._sortRecipes(stRecs).forEach(rec => {
          const card = this._buildRecipeCard(rec, showStationLabel);
          if (card) grid.appendChild(card);
        });
        body.appendChild(grid);
        return;
      }

      if (this.forjaTab === 'armadura') {
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;font-size:15px;line-height:1.5;' }, [
          this.el('strong', { style: 'font-size:16px;color:#ffd54f;' }, tr('craft.progressiveArmorTitle')),
          this.el('div', { style: 'color:#d6e4f0;margin-top:2px;' }, tr('craft.progressiveArmorDesc'))
        ]));

        body.appendChild(this._buildArmorGrid('margin-bottom:14px;'));

        const armorSlots = ['helm', 'armor', 'shield', 'boots'];
        const exoticRecs = Balaclava.RECIPES.filter(r => {
          if (r.station !== stationId && r.station !== 'forja' && r.station !== 'yunque_runico') return false;
          const it = Balaclava.ITEMS[r.out];
          if (!it || !it.equipSlot) return false;
          const sk = it.equipSlot === 'helmet' ? 'helm' : it.equipSlot;
          if (!armorSlots.includes(sk)) return false;
          return !(Balaclava.isProgressiveArmorItem && Balaclava.isProgressiveArmorItem(r.out));
        });

        if (exoticRecs.length > 0) {
          body.appendChild(this.el('h4', { style: 'margin:12px 0 8px;color:#ce93d8;' }, tr('craft.exoticArmorTitle')));
          const exGrid = this.el('div', { class: 'grid-cards' });
          this._sortRecipes(exoticRecs).forEach(r => {
            const c = this._buildRecipeCard(r, showStationLabel);
            if (c) exGrid.appendChild(c);
          });
          body.appendChild(exGrid);
        }
        return;
      }

      if (this.forjaTab === 'otros') {
        const armorSlots = ['helm', 'armor', 'shield', 'boots'];
        const otherRecs = Balaclava.RECIPES.filter(r => {
          if (r.station !== stationId && r.station !== 'forja' && r.station !== 'yunque_runico') return false;
          if (isWeaponOut(r.out)) return false;
          const it = Balaclava.ITEMS[r.out];
          if (it && it.equipSlot) {
            const sk = it.equipSlot === 'helmet' ? 'helm' : it.equipSlot;
            if (armorSlots.includes(sk)) return false;
          }
          return true;
        });

        const grid = this.el('div', { class: 'grid-cards', style: 'margin-bottom:12px;' });
        const applyOtherSearch = (q) => {
          this.craftSearch = q;
          const needle = (q || '').trim().toLowerCase();
          Array.from(grid.children).forEach(ch => {
            const txt = (ch.textContent || '').toLowerCase();
            ch.style.display = (!needle || txt.includes(needle)) ? '' : 'none';
          });
        };
        body.appendChild(this._buildSearchBar(this.craftSearch, tr('craft.searchPlaceholder'), applyOtherSearch));
        this._sortRecipes(otherRecs).forEach(rec => {
          const card = this._buildRecipeCard(rec, showStationLabel);
          if (card) grid.appendChild(card);
        });
        if (this.craftSearch) applyOtherSearch(this.craftSearch);
        body.appendChild(grid);
        return;
      }
    }

    renderBuildMenu(body) {
      const g = this.game;
      const catIcons = {
        produccion: { src: Balaclava.UI_URLS.anvil, short: tr('build.catOficio') },
        economia: { src: Balaclava.UI_URLS.iconCoin, short: tr('build.catComercio') },
        agricultura: { src: Balaclava.UI_URLS.iconFood, short: tr('build.catCultivo') },
        tecnologia: { src: Balaclava.UI_URLS.iconSettings, short: tr('build.catTecno') },
        especiales: { src: Balaclava.UI_URLS.spellbook, short: tr('build.catArcano') },
        automatizacion: { src: Balaclava.UI_URLS.iconHammer, short: tr('build.catAuto') },
        fortificacion: { src: Balaclava.UI_URLS.iconWood, short: tr('build.catAldea') }
      };

      const layout = this.el('div', { class: 'build-layout' });
      const rail = this.el('div', { class: 'build-cat-rail' });
      Balaclava.BUILDING_CATEGORIES.forEach(cat => {
        const meta = catIcons[cat.id] || { src: Balaclava.UI_URLS.iconHammer, short: cat.name.slice(0, 6) };
        rail.appendChild(this.el('button', {
          class: 'build-cat-btn' + (this.buildFilter === cat.id ? ' active' : ''),
          title: cat.name,
          onclick: () => { this.buildFilter = cat.id; this.renderModal(); }
        }, [
          this.el('img', { class: 'pixel-img', src: encodeURI(meta.src), width: 22, height: 22, alt: '' }),
          this.el('span', {}, meta.short)
        ]));
      });
      layout.appendChild(rail);

      const rightCol = this.el('div', { class: 'build-list' });
      const bCards = [];
      const applyBuildSearch = (q) => {
        this.buildSearch = q;
        const needle = (q || '').trim().toLowerCase();
        bCards.forEach(card => {
          const txt = (card.textContent || '').toLowerCase();
          card.style.display = (!needle || txt.includes(needle)) ? '' : 'none';
        });
      };
      rightCol.appendChild(this._buildSearchBar(this.buildSearch, tr('build.searchPlaceholder'), applyBuildSearch));
      const activeCat = Balaclava.BUILDING_CATEGORIES.find(c => c.id === this.buildFilter);
      rightCol.appendChild(this.el('div', { class: 'parchment-box', style: 'padding:7px 10px;' }, [
        this.el('strong', { style: 'font-size:16px;' }, activeCat ? activeCat.name : tr('build.defaultTitle')),
        this.el('div', { style: 'font-size:14px;color:#bfd0ea;margin-top:2px;' }, tr('build.subtitle'))
      ]));

      Object.values(Balaclava.BUILDINGS)
        .filter(b => b.category === this.buildFilter)
        .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
        .forEach(b => {
        const buildCheck = g.canBuild(b.id);
        const skillUnlocked = Boolean(buildCheck && buildCheck.ok);
        const reqSkillObj = b.reqSkill && Balaclava.SKILLS[b.reqSkill];
        const cost = g.getAdjustedBuildCost(b.id);
        const canAfford = skillUnlocked && Object.entries(cost).every(([id, q]) => (g.inventory[id] || 0) >= q);

        const costLines = this.el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;font-size:14px;font-weight:700;' });
        Object.entries(cost).forEach(([id, q]) => {
          const have = g.inventory[id] || 0;
          const it = Balaclava.ITEMS[id];
          costLines.appendChild(this.el('span', {
            style: `display:inline-flex;align-items:center;gap:4px;color:${have >= q ? '#9be89d' : '#ff9e80'}`
          }, [
            it ? this.itemIcon(it.icon, 16) : null,
            `${it ? it.name : id}: ${have}/${q}`
          ]));
        });

        const actionBtn = !skillUnlocked && reqSkillObj
          ? this.el('button', {
              class: 'btn btn-gold btn-sm',
              'data-tip-text': tr('build.reqSkillTip', { name: reqSkillObj.name }),
              onclick: () => this.openModal('skills', b.reqSkill)
            }, tr('build.viewSkill'))
          : this.el('button', {
              class: 'btn btn-green btn-sm',
              disabled: canAfford ? null : 'disabled',
              onclick: () => {
                g.placingBuildingId = b.id;
                this.closeModal();
                this.updateHUD(true);
              }
            }, canAfford ? tr('common.build') : tr('common.missingMaterials'));

        const bCard = this.el('div', { class: 'build-row-card' + (skillUnlocked ? '' : ' card-locked') }, [
          this.el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;' }, [
            this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
              this.makeBuildingThumb(b, 44),
              this.el('div', {}, [
                this.el('strong', { style: 'font-size:16px;color:#ffe39a;display:block;' }, b.name),
                this.el('div', { style: 'font-size:14px;color:#dce8f5;line-height:1.45;' },
                  `${b.size}x${b.size}${b.placeOn === 'water' ? tr('build.waterPlace') : tr('build.landPlace')}` + (!skillUnlocked && reqSkillObj ? tr('build.reqPrefix', { name: reqSkillObj.name }) : ''))
              ])
            ]),
            actionBtn
          ]),
          this.el('div', { class: 'build-row-desc' }, b.desc),
          costLines
        ]);
        bCards.push(bCard);
        rightCol.appendChild(bCard);
      });
      if (this.buildSearch) applyBuildSearch(this.buildSearch);

      layout.appendChild(rightCol);
      body.appendChild(layout);
    }

    renderSkills(body) {
      const g = this.game;
      const unlockedCount = g.unlockedSkills.length;
      const allSkills = Object.values(Balaclava.SKILLS);
      const totalCount = allSkills.length;
      const dim = Balaclava.SKILL_CONSTELLATION_SIZE || { width: 1680, height: 1260, cx: 840, cy: 630 };

      const wrap = this.el('div', { class: 'skill-board-wrap' });
      const board = this.el('div', {
        class: 'skill-board',
        style: `width:${dim.width}px;height:${dim.height}px;`
      });

      const viewW = Math.max(760, (typeof window !== 'undefined' ? window.innerWidth : 1280) - 430);
      const viewH = Math.max(520, (typeof window !== 'undefined' ? window.innerHeight : 800) - 140);
      const fitZoom = Balaclava.Utils.clamp(
        Math.min((viewW - 44) / 2520, (viewH - 44) / 2160),
        0.28,
        0.52
      );
      const initialZoom = 1.04;
      if (this.skillPanX === null || this.skillPanY === null) {
        this.skillZoom = initialZoom;
        this.skillPanX = viewW / 2 - dim.cx * this.skillZoom;
        this.skillPanY = viewH / 2 - dim.cy * this.skillZoom;
      }

      const zoomLabel = this.el('span', { class: 'skill-zoom-readout' }, `${Math.round(this.skillZoom * 100)}%`);
      const applyTransform = () => {
        board.style.transform = `translate(${this.skillPanX.toFixed(1)}px, ${this.skillPanY.toFixed(1)}px) scale(${this.skillZoom.toFixed(3)})`;
        zoomLabel.textContent = `${Math.round(this.skillZoom * 100)}%`;
      };

      const setZoomAround = (nextZoom, anchorX = wrap.clientWidth / 2 || viewW / 2, anchorY = wrap.clientHeight / 2 || viewH / 2) => {
        const clamped = Balaclava.Utils.clamp(nextZoom, 0.25, 1.85);
        const worldX = (anchorX - this.skillPanX) / this.skillZoom;
        const worldY = (anchorY - this.skillPanY) / this.skillZoom;
        this.skillZoom = clamped;
        this.skillPanX = anchorX - worldX * clamped;
        this.skillPanY = anchorY - worldY * clamped;
        applyTransform();
      };

      const focusPoint = (wx, wy, z = 1.0) => {
        const vw = wrap.clientWidth || viewW;
        const vh = wrap.clientHeight || viewH;
        this.skillZoom = Balaclava.Utils.clamp(z, 0.25, 1.85);
        this.skillPanX = vw / 2 - wx * this.skillZoom;
        this.skillPanY = vh / 2 - wy * this.skillZoom;
        applyTransform();
      };

      if (this._skillHoldCleanup) { this._skillHoldCleanup(); this._skillHoldCleanup = null; }
      const pointsPill = this.el('div', { class: 'skill-points-pill' }, tr('skills.pointsPill', { sp: g.player.skillPoints, cur: unlockedCount, tot: totalCount }));
      const topBar = this.el('div', { class: 'skill-tree-topbar' }, [
        pointsPill,
        this.el('div', { class: 'skill-zoom-bar' }, [
          this.el('button', {
            class: 'btn btn-sm',
            'data-tip-text': tr('skills.zoomOutTip'),
            'aria-label': tr('skills.zoomOutTip'),
            onclick: () => setZoomAround(this.skillZoom - 0.16)
          }, [this.uiIcon('iconZoomOut', 18)]),
          zoomLabel,
          this.el('button', {
            class: 'btn btn-sm',
            'data-tip-text': tr('skills.zoomInTip'),
            'aria-label': tr('skills.zoomInTip'),
            onclick: () => setZoomAround(this.skillZoom + 0.16)
          }, [this.uiIcon('iconZoomIn', 18)]),
          this.el('button', { class: 'btn btn-gold btn-sm', onclick: () => focusPoint(dim.cx, dim.cy, fitZoom) }, tr('skills.resetZoom')),
          this.el('button', { class: 'btn btn-primary btn-sm', onclick: () => this.openModal('grimorio') }, tr('skills.grimoireBtn')),
          ...Balaclava.SKILL_BRANCHES.map(br => this.el('button', {
            class: 'btn btn-sm',
            style: `color:${br.color};`,
            onclick: () => focusPoint(dim.cx + Math.cos(br.angle) * 480, dim.cy + Math.sin(br.angle) * 480, 0.80)
          }, br.name.split(' ')[0]))
        ])
      ]);
      const headerTools = document.getElementById('modal-header-tools');
      if (headerTools) {
        headerTools.innerHTML = '';
        headerTools.appendChild(topBar);
        headerTools.classList.remove('hidden');
      } else {
        body.appendChild(topBar);
      }

      const workspace = this.el('div', { class: 'skill-tree-workspace' });

      // Build coordinate map straight from skills.js constellation layout
      const posById = {};
      allSkills.forEach(sk => {
        const br = Balaclava.SKILL_BRANCHES.find(b => b.id === sk.branch) || Balaclava.SKILL_BRANCHES[0];
        posById[sk.id] = { x: sk.x, y: sk.y, br };
      });

      const lineElsBySkillId = {};

      const spawnUnlockBurst = (nodeBtn, fxColor) => {
        nodeBtn.querySelectorAll('.skill-fx-burst').forEach(el => {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        nodeBtn.classList.remove('skill-node-channeling', 'skill-node-unlocking');
        void nodeBtn.offsetWidth;
        nodeBtn.classList.add('skill-node-unlocking');

        const burst = document.createElement('div');
        burst.className = 'skill-fx-burst';

        const flash = document.createElement('div');
        flash.className = 'skill-node-flash';
        burst.appendChild(flash);

        const shock = document.createElement('div');
        shock.className = 'skill-shockwave-ring';
        shock.style.borderColor = fxColor;
        burst.appendChild(shock);

        const outerShock = document.createElement('div');
        outerShock.className = 'skill-shockwave-outer';
        burst.appendChild(outerShock);

        const rayH = document.createElement('div');
        rayH.className = 'skill-axial-ray';
        burst.appendChild(rayH);

        const rayV = document.createElement('div');
        rayV.className = 'skill-axial-ray vertical';
        burst.appendChild(rayV);

        const sparkColors = ['#ffd700', '#ffffff', '#80deea', '#6ee7b7', fxColor];
        const shardCount = 12;
        for (let p = 0; p < shardCount; p++) {
          const angle = (p / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.18;
          const dist = (p % 2 === 0 ? 44 : 30) + Math.random() * 20;
          const part = document.createElement('div');
          part.className = 'skill-burst-particle';
          part.style.setProperty('--tx', `${(Math.cos(angle) * dist).toFixed(1)}px`);
          part.style.setProperty('--ty', `${(Math.sin(angle) * dist).toFixed(1)}px`);
          part.style.setProperty('--delay', `${(p % 3) * 0.03}s`);
          part.style.backgroundColor = sparkColors[p % sparkColors.length];
          const size = (p % 2 === 0) ? 7 : 5;
          part.style.width = `${size}px`;
          part.style.height = `${size}px`;
          part.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
          burst.appendChild(part);
        }

        nodeBtn.appendChild(burst);
        setTimeout(() => {
          if (burst.parentNode) burst.parentNode.removeChild(burst);
          nodeBtn.classList.remove('skill-node-unlocking');
        }, 820);
      };

      const syncUnlockedBoardNodes = (skillId, fxColor) => {
        pointsPill.textContent = tr('skills.pointsPill', {
          sp: g.player.skillPoints,
          cur: g.unlockedSkills.length,
          tot: totalCount
        });

        const ownedLines = lineElsBySkillId[skillId] || [];
        if (ownedLines[0]) {
          ownedLines[0].setAttribute('stroke', '#38bdf8');
          ownedLines[0].setAttribute('stroke-width', '8');
          ownedLines[0].setAttribute('stroke-opacity', '0.38');
          ownedLines[0].removeAttribute('stroke-dasharray');
        }
        if (ownedLines[1]) {
          ownedLines[1].setAttribute('stroke', '#bae6fd');
          ownedLines[1].setAttribute('stroke-width', '3.2');
          ownedLines[1].setAttribute('stroke-opacity', '0.96');
          ownedLines[1].removeAttribute('stroke-dasharray');
        }

        const unlockedBtn = board.querySelector(`[data-skill-node="${skillId}"]`);
        if (unlockedBtn) {
          unlockedBtn.classList.remove('available', 'can-afford', 'locked');
          unlockedBtn.classList.add('unlocked');
          unlockedBtn.style.borderColor = '';
          const badge = unlockedBtn.querySelector('.tree-node-tier');
          if (badge) {
            badge.innerHTML = '';
            const chk = this.uiIcon('iconCheck', 13);
            if (chk) badge.appendChild(chk);
          }
        }

        const spNow = g.player.skillPoints || 0;
        allSkills.forEach(ch => {
          if (ch.req !== skillId || g.unlockedSkills.includes(ch.id)) return;
          const childBtn = board.querySelector(`[data-skill-node="${ch.id}"]`);
          if (childBtn) {
            childBtn.classList.remove('locked');
            childBtn.classList.add('available');
            childBtn.classList.toggle('can-afford', spNow >= (ch.cost || 1));
          }
          const chLines = lineElsBySkillId[ch.id] || [];
          if (chLines[0]) {
            chLines[0].setAttribute('stroke', '#22c55e');
            chLines[0].setAttribute('stroke-width', '6');
            chLines[0].setAttribute('stroke-opacity', '0.30');
            chLines[0].removeAttribute('stroke-dasharray');
          }
          if (chLines[1]) {
            chLines[1].setAttribute('stroke', '#86efac');
            chLines[1].setAttribute('stroke-width', '2.8');
            chLines[1].setAttribute('stroke-dasharray', '7 4');
            chLines[1].setAttribute('stroke-opacity', '0.92');
          }
        });
        // Refresh can-afford class across already-available nodes
        allSkills.forEach(other => {
          if (g.unlockedSkills.includes(other.id)) return;
          if (!other.req || g.unlockedSkills.includes(other.req)) {
            const oBtn = board.querySelector(`[data-skill-node="${other.id}"]`);
            if (oBtn) oBtn.classList.toggle('can-afford', spNow >= (other.cost || 1));
          }
        });
      };

      const unlockAndAdvance = (skillId) => {
        if (!g.unlockSkill(skillId)) return;
        const skDef = Balaclava.SKILLS[skillId];
        const fxPos = posById[skillId];
        const fxColor = (fxPos && fxPos.br && fxPos.br.color) || '#ffd54f';

        if (fxPos) focusPoint(fxPos.x, fxPos.y, Math.max(0.95, this.skillZoom));

        // Update node & child nodes immediately so consecutive unlocks stay responsive during animation
        syncUnlockedBoardNodes(skillId, fxColor);

        // Crisp micro-impact shake without overlapping stale timers
        if (this._skillQuakeTimer) {
          clearTimeout(this._skillQuakeTimer);
          this._skillQuakeTimer = null;
        }
        const modalBoxEl = document.getElementById('modal-box');
        if (modalBoxEl) {
          modalBoxEl.classList.remove('cosmic-quake-active');
          void modalBoxEl.offsetWidth;
          modalBoxEl.classList.add('cosmic-quake-active');
        }
        workspace.classList.remove('cosmic-quake-active');
        void workspace.offsetWidth;
        workspace.classList.add('cosmic-quake-active');
        this._skillQuakeTimer = setTimeout(() => {
          this._skillQuakeTimer = null;
          if (modalBoxEl) modalBoxEl.classList.remove('cosmic-quake-active');
          workspace.classList.remove('cosmic-quake-active');
        }, 300);

        // Sound effects: levelup + cosmic skill sound + deep seismic thud + celestial chord
        if (Balaclava.Audio) {
          Balaclava.Audio.play('levelup');
          Balaclava.Audio.play('unlock_skill');
          Balaclava.Audio.tone(115, 38, 0.48, 'sawtooth', 0.42);
          Balaclava.Audio.tone(523.25, 1046.5, 0.38, 'triangle', 0.3, 0.05);
          Balaclava.Audio.tone(659.25, 1318.5, 0.42, 'sine', 0.25, 0.1);
        }

        // Staged pixel burst on the unlocked node
        const nodeBtn = board.querySelector(`[data-skill-node="${skillId}"]`);
        if (nodeBtn) spawnUnlockBurst(nodeBtn, fxColor);

        // Replace any previous floating banner cleanly on rapid consecutive unlocks
        workspace.querySelectorAll('.skill-unlock-celebration').forEach(el => {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        const banner = document.createElement('div');
        banner.className = 'skill-unlock-celebration';
        banner.innerHTML = `
          <div class="skill-cel-title">${tr('skills.activated')}</div>
          <div class="skill-cel-name">${skDef ? skDef.name : skillId}</div>
        `;
        workspace.appendChild(banner);

        const sp = g.player.skillPoints || 0;
        const pool = allSkills.filter(s => !g.unlockedSkills.includes(s.id) && (!s.req || g.unlockedSkills.includes(s.req)));
        const affordable = pool.filter(s => sp >= (s.cost || 1));
        const candidates = affordable.length ? affordable : pool;
        const curBranch = Balaclava.SKILLS[skillId] && Balaclava.SKILLS[skillId].branch;
        const nextSk = candidates.find(s => s.req === skillId)
          || candidates.find(s => s.branch === curBranch)
          || candidates[0];

        if (nextSk) this.selectedSkillId = nextSk.id;

        if (this._skillUnlockFxTimer) clearTimeout(this._skillUnlockFxTimer);
        this._skillUnlockFxTimer = setTimeout(() => {
          this._skillUnlockFxTimer = null;
          if (this.activeModal !== 'skills') return;
          if (nextSk) {
            const nextPos = posById[nextSk.id];
            if (nextPos) focusPoint(nextPos.x, nextPos.y, Math.max(0.95, this.skillZoom));
          }
          this.renderModal();
        }, 900);
      };

      // Decorative cosmic rings + glowing constellation lines
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('class', 'skill-svg-lines');
      svg.setAttribute('viewBox', `0 0 ${dim.width} ${dim.height}`);

      [155, 295, 435, 580, 725, 865].forEach(rad => {
        const ring = document.createElementNS(svgNS, 'circle');
        ring.setAttribute('cx', String(dim.cx));
        ring.setAttribute('cy', String(dim.cy));
        ring.setAttribute('r', String(rad));
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', 'rgba(255, 226, 150, 0.08)');
        ring.setAttribute('stroke-width', '1.5');
        ring.setAttribute('stroke-dasharray', '6 10');
        svg.appendChild(ring);
      });

      const drawLine = (skillId, x1, y1, x2, y2, stroke, width, dash = '', opacity = '1') => {
        const ln = document.createElementNS(svgNS, 'line');
        ln.setAttribute('x1', x1.toFixed(1));
        ln.setAttribute('y1', y1.toFixed(1));
        ln.setAttribute('x2', x2.toFixed(1));
        ln.setAttribute('y2', y2.toFixed(1));
        ln.setAttribute('stroke', stroke);
        ln.setAttribute('stroke-width', String(width));
        ln.setAttribute('stroke-opacity', opacity);
        ln.setAttribute('stroke-linecap', 'round');
        if (dash) ln.setAttribute('stroke-dasharray', dash);
        svg.appendChild(ln);
        if (!lineElsBySkillId[skillId]) lineElsBySkillId[skillId] = [];
        lineElsBySkillId[skillId].push(ln);
      };

      allSkills.forEach(sk => {
        const p2 = posById[sk.id];
        if (!p2) return;
        const p1 = sk.req && posById[sk.req] ? posById[sk.req] : { x: dim.cx, y: dim.cy };
        const owned = g.unlockedSkills.includes(sk.id);
        const reqMet = !sk.req || g.unlockedSkills.includes(sk.req);
        if (owned) {
          drawLine(sk.id, p1.x, p1.y, p2.x, p2.y, '#38bdf8', 8, '', '0.38');
          drawLine(sk.id, p1.x, p1.y, p2.x, p2.y, '#bae6fd', 3.2, '', '0.96');
        } else if (reqMet) {
          drawLine(sk.id, p1.x, p1.y, p2.x, p2.y, '#22c55e', 6, '', '0.30');
          drawLine(sk.id, p1.x, p1.y, p2.x, p2.y, '#86efac', 2.8, '7 4', '0.92');
        } else {
          drawLine(sk.id, p1.x, p1.y, p2.x, p2.y, '#475569', 1.8, '4 7', '0.28');
        }
      });
      board.appendChild(svg);

      // Center Core Emblem
      const hub = this.el('div', {
        class: 'skill-core-hub',
        style: `left:${dim.cx}px;top:${dim.cy}px;`
      }, [
        this.itemIcon('balaclava_core', 34),
        this.el('span', {}, 'BALACLAVA')
      ]);
      board.appendChild(hub);

      // Constellation labels positioned outside the outer T8 orbital ring so no star overlaps
      Balaclava.SKILL_BRANCHES.forEach(br => {
        const lx = dim.cx + Math.cos(br.angle) * 1065;
        const ly = dim.cy + Math.sin(br.angle) * 1015;
        board.appendChild(this.el('div', {
          class: 'skill-branch-tag',
          style: `left:${lx.toFixed(1)}px;top:${ly.toFixed(1)}px;color:${br.color};`
        }, br.fullName || br.name));
      });

      // Drag-to-Pan & Mouse-Wheel Zoom
      let dragging = false;
      let dragMoved = false;
      let startX = 0, startY = 0, origPanX = 0, origPanY = 0;

      wrap.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        dragging = true;
        dragMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        origPanX = this.skillPanX;
        origPanY = this.skillPanY;
        wrap.classList.add('dragging');
      });
      wrap.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.hypot(dx, dy) > 5) dragMoved = true;
        this.skillPanX = origPanX + dx;
        this.skillPanY = origPanY + dy;
        applyTransform();
      });
      const endDrag = () => {
        dragging = false;
        wrap.classList.remove('dragging');
      };
      wrap.addEventListener('pointerup', endDrag);
      wrap.addEventListener('pointerleave', endDrag);
      wrap.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = wrap.getBoundingClientRect();
        const factor = e.deltaY < 0 ? 1.14 : 0.88;
        setZoomAround(this.skillZoom * factor, e.clientX - rect.left, e.clientY - rect.top);
      }, { passive: false });

      // All 150 Constellation Star Nodes
      const curSp = g.player.skillPoints || 0;
      allSkills.forEach(sk => {
        const pos = posById[sk.id];
        if (!pos) return;
        const owned = g.unlockedSkills.includes(sk.id);
        const reqMet = !sk.req || g.unlockedSkills.includes(sk.req);
        const avail = !owned && reqMet;
        const canAfford = avail && curSp >= (sk.cost || 1);
        const isSel = this.selectedSkillId === sk.id;

        const btn = this.el('button', {
          class: 'tree-node-btn ' + (owned ? 'unlocked' : avail ? 'available' : 'locked')
            + (canAfford ? ' can-afford' : '')
            + (sk.keystone ? ' keystone' : '')
            + (isSel ? ' selected-node' : ''),
          'data-skill-node': sk.id,
          'data-skill-branch': sk.branch,
          style: `left:${pos.x.toFixed(1)}px;top:${pos.y.toFixed(1)}px;`,
          title: `${sk.name} — ${sk.desc}`,
          onclick: () => {
            if (dragMoved) return;
            this.selectedSkillId = sk.id;
            this.renderModal();
          },
          ondblclick: () => {
            if (!owned) unlockAndAdvance(sk.id);
          }
        }, [
          this.skillIcon(sk.id, sk.keystone ? 26 : 21),
          this.el('span', { class: 'tree-node-tier' }, owned ? this.uiIcon('iconCheck', 13) : `T${sk.tier}`)
        ]);
        board.appendChild(btn);
      });

      applyTransform();
      wrap.appendChild(board);
      wrap.appendChild(this.el('div', { class: 'skill-tree-legend' }, [
        this.el('span', { class: 'skill-legend-item' }, [
          this.el('span', { class: 'skill-legend-hex is-available' }),
          tr('skills.legendAvailable')
        ]),
        this.el('span', { class: 'skill-legend-item' }, [
          this.el('span', { class: 'skill-legend-hex is-unlocked' }),
          tr('skills.legendUnlocked')
        ]),
        this.el('span', { class: 'skill-legend-item' }, [
          this.el('span', { class: 'skill-legend-hex is-locked' }),
          tr('skills.legendLocked')
        ])
      ]));
      workspace.appendChild(wrap);

      // Right Parchment Inspector
      const selSk = Balaclava.SKILLS[this.selectedSkillId] || allSkills[0];
      const br = Balaclava.SKILL_BRANCHES.find(b => b.id === selSk.branch) || Balaclava.SKILL_BRANCHES[0];
      const owned = g.unlockedSkills.includes(selSk.id);
      const reqMet = !selSk.req || g.unlockedSkills.includes(selSk.req);
      const canBuy = !owned && reqMet && g.player.skillPoints >= selSk.cost;

      const unlocksBox = this.el('div', { style: 'margin-top:8px;' });
      if (selSk.unlocksBuildings && selSk.unlocksBuildings.length) {
        unlocksBox.appendChild(this.el('strong', { style: 'font-size:14px;color:#bae6fd;display:block;margin-bottom:5px;' }, tr('skills.unlocksTitle')));
        selSk.unlocksBuildings.forEach(bid => {
          const bd = Balaclava.BUILDINGS[bid];
          if (!bd) return;
          unlocksBox.appendChild(this.el('div', {
            style: 'display:flex;align-items:center;gap:8px;background:rgba(30,50,95,0.45);border:1px solid rgba(128,216,255,0.22);padding:5px 7px;border-radius:6px;margin-bottom:5px;'
          }, [
            this.makeBuildingThumb(bd, 28),
            this.el('div', {}, [
              this.el('div', { style: 'font-weight:700;font-size:14px;color:#f8fafc;' }, bd.name),
              this.el('div', { style: 'font-size:14px;color:#b8dcff;' }, this._catLabel(bd.category))
            ])
          ]));
        });
      } else {
        unlocksBox.appendChild(this.el('div', { style: 'font-size:14px;line-height:1.48;color:#b8dcff;' }, tr('skills.passiveDesc')));
      }

      const reqText = !selSk.req ? tr('skills.rootReq')
        : tr('skills.reqLine', {
          name: Balaclava.SKILLS[selSk.req] ? Balaclava.SKILLS[selSk.req].name : selSk.req,
          state: g.unlockedSkills.includes(selSk.req) ? tr('skills.reqDone') : tr('skills.reqPending')
        });

      const inspector = this.el('div', { class: 'parchment-box skill-inspector', style: 'display:flex;flex-direction:column;gap:8px;' }, [
        this.el('div', { class: 'card-head' }, [
          this.skillIcon(selSk.id, 44),
          this.el('div', {}, [
            this.el('strong', { style: 'font-size:17px;color:#ffffff;' }, selSk.name),
            this.el('div', { style: `font-size:14px;font-weight:800;color:${br.color || '#fde047'}` },
              `${br.fullName || br.name} · ${tr('common.level')} ${selSk.tier}`)
          ])
        ]),
        this.el('div', { style: 'font-size:15px;line-height:1.48;font-weight:600;color:#eef4fc;' }, selSk.desc),
        this.el('div', { style: 'font-size:14px;line-height:1.48;color:#b8dcff;' }, reqText),
        this.el('div', { style: 'font-size:14px;line-height:1.45;color:#cbd5e1;' }, tr('skills.dragHint')),
        unlocksBox,
        (() => {
          if (owned) {
            return this.el('div', { style: 'margin-top:8px;padding-top:8px;border-top:1px solid rgba(128,216,255,0.25);' }, [
              this.el('div', { style: 'color:#86efac;font-weight:800;font-size:15px;text-align:center;padding:8px;' }, tr('skills.activated'))
            ]);
          }
          if (!reqMet || !canBuy) {
            return this.el('div', { style: 'margin-top:8px;padding-top:8px;border-top:1px solid rgba(128,216,255,0.25);' }, [
              this.el('button', {
                class: 'btn btn-stone',
                style: 'width:100%;',
                disabled: 'disabled'
              }, reqMet ? tr('skills.needPoints', { cur: g.player.skillPoints, req: selSk.cost }) : tr('skills.needPrev'))
            ]);
          }

          // Hold-to-learn button (holds for 2.3 seconds with live progress fill, channeling aura, tone & particle flow)
          const fillBar = this.el('div', { class: 'btn-skill-hold-fill' });
          const baseLabel = tr('skills.activateCost', { cost: selSk.cost, unit: selSk.cost === 1 ? tr('skills.pointOne') : tr('skills.pointMany') });
          const textSpan = this.el('span', { class: 'btn-skill-hold-text' }, [
            this.el('span', {}, baseLabel),
            this.el('span', { style: 'font-size:13px;opacity:0.85;font-weight:normal;' }, '(Mantener)')
          ]);

          const holdBtn = this.el('div', {
            class: 'btn-skill-hold-activate',
            role: 'button',
            tabindex: '0'
          }, [fillBar, textSpan]);

          let holdRaf = null;
          let holdStartTime = 0;
          const HOLD_DURATION = 2300; // 2.3 seconds
          let isHolding = false;

          const startHold = (e) => {
            if (e.button !== 0 && e.type !== 'touchstart' && e.pointerType === 'mouse' && e.button !== 0) return;
            if (isHolding) return;
            isHolding = true;
            holdStartTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            holdBtn.classList.add('channeling');

            const targetNode = board.querySelector(`[data-skill-node="${selSk.id}"]`);
            if (targetNode) targetNode.classList.add('skill-node-channeling');

            if (Balaclava.Audio) {
              Balaclava.Audio.tone(220, 360, 0.2, 'triangle', 0.22);
            }

            let nextSparkTime = 0;
            let lastPctStep = 0;

            const onFrame = (now) => {
              if (!isHolding) return;
              if (this.activeModal !== 'skills') {
                stopHold(false);
                return;
              }
              const elapsed = now - holdStartTime;
              const progress = Math.min(1, elapsed / HOLD_DURATION);
              fillBar.style.width = `${(progress * 100).toFixed(1)}%`;

              const pctInt = Math.floor(progress * 100);
              textSpan.innerHTML = `<span>Canalizando...</span> <span style="color:#6ee7b7;font-weight:900;">${pctInt}%</span>`;

              // Emit converging astral sparks to the node on board
              if (targetNode && now > nextSparkTime) {
                nextSparkTime = now + 130;
                const spark = document.createElement('div');
                spark.className = 'skill-channel-spark';
                const sAngle = Math.random() * Math.PI * 2;
                const sDist = 34 + Math.random() * 22;
                spark.style.setProperty('--ox', `${(Math.cos(sAngle) * sDist).toFixed(1)}px`);
                spark.style.setProperty('--oy', `${(Math.sin(sAngle) * sDist).toFixed(1)}px`);
                targetNode.appendChild(spark);
                setTimeout(() => { if (spark.parentNode) spark.parentNode.removeChild(spark); }, 650);
              }

              // Pitch climbing audio clicks every 20%
              if (pctInt >= lastPctStep + 20 && Balaclava.Audio) {
                lastPctStep = pctInt;
                const freq = 260 + (pctInt * 5);
                Balaclava.Audio.tone(freq, freq + 40, 0.08, 'sine', 0.18);
              }

              if (progress >= 1) {
                stopHold(false);
                unlockAndAdvance(selSk.id);
                return;
              }

              holdRaf = requestAnimationFrame(onFrame);
            };

            holdRaf = requestAnimationFrame(onFrame);
          };

          const stopHold = (cancelled = true) => {
            if (!isHolding) return;
            isHolding = false;
            if (holdRaf) {
              cancelAnimationFrame(holdRaf);
              holdRaf = null;
            }
            holdBtn.classList.remove('channeling');
            fillBar.style.width = '0%';
            textSpan.innerHTML = `<span>${baseLabel}</span> <span style="font-size:13px;opacity:0.85;font-weight:normal;">(Mantener)</span>`;

            const targetNode = board.querySelector(`[data-skill-node="${selSk.id}"]`);
            if (targetNode) targetNode.classList.remove('skill-node-channeling');

            if (cancelled && Balaclava.Audio) {
              Balaclava.Audio.play('cancel');
            }
          };
          this._skillHoldCleanup = () => stopHold(false);

          holdBtn.addEventListener('pointerdown', startHold);
          holdBtn.addEventListener('pointerup', () => stopHold(true));
          holdBtn.addEventListener('pointerleave', () => stopHold(true));
          holdBtn.addEventListener('pointercancel', () => stopHold(true));
          holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());

          return this.el('div', { style: 'margin-top:8px;padding-top:8px;border-top:1px solid rgba(128,216,255,0.25);' }, [holdBtn]);
        })()
      ]);

      workspace.appendChild(inspector);
      body.appendChild(workspace);
    }

    renderMap(body) {
      const g = this.game;
      const pGx = Balaclava.Utils.clamp(Math.floor(g.player.x / (PLOT_TILES * TILE_SIZE)), 0, GRID_PLOTS - 1);
      const pGy = Balaclava.Utils.clamp(Math.floor(g.player.y / (PLOT_TILES * TILE_SIZE)), 0, GRID_PLOTS - 1);
      const getTutorialRecommendedPlot = () => {
        const tut = g.tutorialSys;
        const onlyFirstIsland = Array.isArray(g.unlockedPlots) && g.unlockedPlots.length === 1;
        const tutActive = Boolean(tut && !tut.done && !tut.skipped && ((typeof tut.isBuyIslandStepActive === 'function' && tut.isBuyIslandStepActive(g)) || onlyFirstIsland));
        if (!tutActive || !onlyFirstIsland) return null;
        if (tut && typeof tut.getRecommendedFirstPlot === 'function') {
          return tut.getRecommendedFirstPlot(g);
        }
        return [4, 3];
      };
      const initialRecPlot = getTutorialRecommendedPlot();
      if (!this.selectedMapPlot || (initialRecPlot && this.selectedMapPlot[0] === pGx && this.selectedMapPlot[1] === pGy && g.world.isPlotUnlocked(pGx, pGy))) {
        this.selectedMapPlot = initialRecPlot ? [initialRecPlot[0], initialRecPlot[1]] : [pGx, pGy];
      }

      const workspace = this.el('div', { class: 'map-workspace' });
      const boardWrap = this.el('div', { class: 'map-board-wrap' });

      const MAP_WORLD_SZ = 1200;
      const getPlotCenterPx = (gx, gy) => {
        const plotSz = MAP_WORLD_SZ / GRID_PLOTS;
        return { x: (gx + 0.5) * plotSz, y: (gy + 0.5) * plotSz };
      };

      const viewW = Math.max(640, (typeof window !== 'undefined' ? window.innerWidth : 1280) - 380);
      const viewH = Math.max(480, (typeof window !== 'undefined' ? window.innerHeight : 800) - 70);
      const mapCanvas = document.createElement('canvas');
      mapCanvas.id = 'world-map-canvas';
      mapCanvas.width = viewW;
      mapCanvas.height = viewH;

      const fitZoom = Balaclava.Utils.clamp(Math.min((viewW - 40) / MAP_WORLD_SZ, (viewH - 40) / MAP_WORLD_SZ), 0.45, 1.35);
      if (!this.mapZoom || this.mapZoom < 0.45) this.mapZoom = Math.max(0.92, fitZoom * 1.25);
      if (this.mapPanX === null || this.mapPanY === null || this.mapPanX === undefined) {
        const focusGx = this.selectedMapPlot ? this.selectedMapPlot[0] : pGx;
        const focusGy = this.selectedMapPlot ? this.selectedMapPlot[1] : pGy;
        const focusPt = getPlotCenterPx(focusGx, focusGy);
        this.mapPanX = viewW / 2 - focusPt.x * this.mapZoom;
        this.mapPanY = viewH / 2 - focusPt.y * this.mapZoom;
      }

      const zoomReadout = this.el('span', { class: 'skill-zoom-readout', style: 'color:#ffe082;' }, `${Math.round(this.mapZoom * 100)}%`);
      const inspectorSlot = this.el('div', { class: 'map-inspector' });

      const mapImg = (url) => {
        if (!this._mapImgCache) this._mapImgCache = {};
        if (!url) return null;
        const enc = encodeURI(url);
        const pre = Balaclava.Assets && Balaclava.Assets.preloadedUrls && Balaclava.Assets.preloadedUrls[enc];
        if (pre && pre.complete && pre.naturalWidth > 0) return pre;
        if (this._mapImgCache[url]) return this._mapImgCache[url];
        const im = new Image();
        im.onload = () => { if (this.activeModal === 'map') drawMapCanvas(); };
        im.src = enc;
        this._mapImgCache[url] = im;
        return im;
      };

      const drawBadgeIcon = (ctx, x, y, radius, bg, stroke, url, fallbackTxt, fallbackColor = '#ffffff') => {
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
        const im = url ? mapImg(url) : null;
        if (im && im.complete && im.naturalWidth > 0) {
          const s = radius * 1.45;
          ctx.drawImage(im, x - s / 2, y - s / 2, s, s);
        } else if (fallbackTxt) {
          ctx.fillStyle = fallbackColor;
          ctx.font = '14px BalaclavaPixel, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(fallbackTxt, x, y + 5);
        }
      };

      const renderInspector = () => {
        inspectorSlot.innerHTML = '';
        const [sgx, sgy] = this.selectedMapPlot;
        const unlocked = g.world.isPlotUnlocked(sgx, sgy);
        const biomeId = g.world.plotBiomes[sgy][sgx];
        const biome = BIOMES[biomeId];
        const price = g.economy.getPlotPrice(g, sgx, sgy);
        const canAfford = g.coins >= price;
        const biomeLock = (g.economy && typeof g.economy.getBiomeLockStatus === 'function')
          ? g.economy.getBiomeLockStatus(g, sgx, sgy)
          : { lockedByBiome: false };
        const biomeProg = (g.economy && typeof g.economy.getBiomeUnlockProgress === 'function')
          ? g.economy.getBiomeUnlockProgress(g, biomeId)
          : null;
        const adj = !unlocked && ((g.economy && typeof g.economy.isPlotAdjacentlyReachable === 'function')
          ? g.economy.isPlotAdjacentlyReachable(g, sgx, sgy)
          : (g.world.isPlotUnlocked(sgx - 1, sgy) || g.world.isPlotUnlocked(sgx + 1, sgy) ||
             g.world.isPlotUnlocked(sgx, sgy - 1) || g.world.isPlotUnlocked(sgx, sgy + 1)));
        const portalB = g.buildings.find(b => b.type === 'portal' && Math.floor(b.tx / PLOT_TILES) === sgx && Math.floor(b.ty / PLOT_TILES) === sgy);
        const gate = g.world.getDungeonGateForPlot(sgx, sgy);
        const altarKey = unlocked && g.world.altarPlots && g.world.altarPlots[`${sgx},${sgy}`];
        const altarDef = altarKey && Balaclava.ALTAR_DEFS && Balaclava.ALTAR_DEFS[altarKey];
        const eeKey = unlocked && g.world.easterEggPlots && g.world.easterEggPlots[`${sgx},${sgy}`];
        const eeDef = eeKey && Balaclava.EASTER_EGG_DEFS && Balaclava.EASTER_EGG_DEFS[eeKey];
        const hasSecretKey = unlocked && g.world.secretChestPlots && g.world.secretChestPlots[`${sgx},${sgy}`] !== undefined;
        const secretNode = hasSecretKey
          ? g.world.nodes.find(n => n.kind === 'secret_chest' && Math.floor(n.tx / PLOT_TILES) === sgx && Math.floor(n.ty / PLOT_TILES) === sgy)
          : null;
        const secretPillarsDone = secretNode
          ? g.world.nodes.filter(n => n.kind === 'puzzle_pillar' && n.secretIdx === secretNode.secretIdx && n.activated).length
          : 0;
        const npc = Balaclava.NPCS.find(n => {
          const p = g.world.getNpcPlot(n);
          return p[0] === sgx && p[1] === sgy;
        });
        const localBuildings = g.buildings.filter(b => Math.floor(b.tx / PLOT_TILES) === sgx && Math.floor(b.ty / PLOT_TILES) === sgy);

        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        const recPlot = getTutorialRecommendedPlot();
        const isRecSelected = Boolean(recPlot && recPlot[0] === sgx && recPlot[1] === sgy);

        const tutGuideBanner = recPlot ? this.el('div', {
          class: 'map-tutorial-callout',
          style: 'background:linear-gradient(180deg, rgba(255,213,79,0.20), rgba(16,26,44,0.94));border:2px solid #ffd54f;border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:6px;box-shadow:0 0 12px rgba(255,213,79,0.18);'
        }, [
          this.el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;' }, [
            this.el('strong', { style: 'font-size:14px;color:#ffd54f;letter-spacing:0.4px;' },
              isEn ? 'TUTORIAL: EXPAND YOUR TERRITORY' : 'TUTORIAL: EXPANDE TU TERRITORIO'),
            isRecSelected ? this.el('span', {
              style: 'background:#ffd54f;color:#101827;font-size:11px;font-weight:900;padding:2px 6px;border-radius:3px;'
            }, isEn ? 'RECOMMENDED' : 'RECOMENDADA') : null
          ]),
          this.el('div', { style: 'font-size:13px;line-height:1.4;color:#f1f5f9;' },
            isRecSelected
              ? (isEn
                ? 'This adjacent Meadow island is the ideal first expansion: low cost, rich resources, and safe terrain. Click the gold button below to unlock it!'
                : 'Esta isla adyacente de Pradera es la primera expansión ideal: bajo coste, recursos abundantes y terreno seguro. Pulsa el botón dorado de abajo para desbloquearla.')
              : (isEn
                ? `We recommend starting with adjacent plot (${recPlot[0]}, ${recPlot[1]}). Unlocking islands reveals new mineral veins, timber, NPCs, and dungeons.`
                : `Te recomendamos empezar por la parcela adyacente (${recPlot[0]}, ${recPlot[1]}). Desbloquear islas revela nuevas vetas minerales, madera, NPCs y mazmorras.`)),
          !isRecSelected ? this.el('button', {
            class: 'btn btn-gold',
            style: 'font-size:13px;padding:5px 8px;margin-top:2px;',
            onclick: () => {
              this.selectedMapPlot = [recPlot[0], recPlot[1]];
              focusMapPlot(recPlot[0], recPlot[1], Math.max(1.35, this.mapZoom));
              drawMapCanvas();
              renderInspector();
            }
          }, isEn ? `Select Recommended Island (${recPlot[0]}, ${recPlot[1]})` : `Seleccionar Isla Recomendada (${recPlot[0]}, ${recPlot[1]})`) : null
        ]) : null;

        const card = this.el('div', { style: 'display:flex;flex-direction:column;gap:10px;' }, [
          tutGuideBanner,
          this.el('div', { style: 'display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,213,79,0.22);padding-bottom:10px;' }, [
            this.biomeIcon(biomeId, 34),
            this.el('div', {}, [
              this.el('strong', { style: 'font-size:20px;color:#ffd54f;display:block;' }, biome.name),
              this.el('div', { style: 'font-size:14px;color:#b8d4ec;' }, tr('map.islandMeta', {
                x: sgx, y: sgy, state: unlocked ? tr('map.plotOwned') : tr('map.toExplore'),
                cur: g.unlockedPlots.length, tot: GRID_PLOTS * GRID_PLOTS
              })),
              biomeProg ? this.el('div', {
                style: `font-size:13px;font-weight:800;margin-top:2px;color:${biomeProg.complete ? '#86efac' : '#ffe082'};`
              }, isEn
                ? `Biome Progress: ${biomeProg.unlocked}/${biomeProg.total} islands · ${biomeProg.dungeonsDone}/${biomeProg.dungeonsTotal} dungeons`
                : `Progreso del Bioma: ${biomeProg.unlocked}/${biomeProg.total} islas · ${biomeProg.dungeonsDone}/${biomeProg.dungeonsTotal} mazmorras`) : null
            ])
          ]),
          (!unlocked && biomeLock.lockedByBiome) ? this.el('div', {
            style: 'background:rgba(127,29,29,0.28);border:1.5px solid #ef5350;border-radius:6px;padding:8px 10px;font-size:13px;line-height:1.4;color:#fecaca;'
          }, [
            this.el('strong', { style: 'color:#fca5a5;display:block;margin-bottom:3px;' },
              isEn ? 'BIOME LOCKED BY PROGRESSION' : 'BIOMA BLOQUEADO POR PROGRESIÓN'),
            this.el('div', {},
              isEn
                ? `You must unlock all islands (${biomeLock.unlocked}/${biomeLock.total}) and clear all dungeons (${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal}) of ${biomeLock.blockingBiomeName} before purchasing islands in ${biome.name}.`
                : `Debes desbloquear todas las islas (${biomeLock.unlocked}/${biomeLock.total}) y completar todas las mazmorras (${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal}) de ${biomeLock.blockingBiomeName} antes de comprar islas en ${biome.name}.`)
          ]) : null,
          this.el('div', { style: 'font-size:14px;line-height:1.45;color:#e8eef6;' },
            unlocked
              ? tr('map.unlockedDesc', { b: localBuildings.length, d: g.clearedDungeons.length, dt: Object.keys(Balaclava.DUNGEON_DEFS).length })
              : tr('map.lockedCostDesc', { price, coins: g.coins })),
          npc ? this.el('div', { style: 'display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);padding:8px;border-radius:6px;border:1px solid rgba(128,216,255,0.28);' }, [
            this.npcPortrait(npc.id, 40),
            this.el('div', { style: 'font-size:14px;' }, [this.el('strong', { style: 'color:#80f0ff;' }, npc.name), this.el('div', {}, tr('map.questNpc'))])
          ]) : null,
          gate ? this.el('div', { style: 'font-size:14px;color:#ff8a80;font-weight:800;display:flex;align-items:center;gap:6px;flex-wrap:wrap;' }, [
            tr('map.dungeonBadge', { lvl: gate.recLevel || 2, name: gate.name }),
            g.clearedDungeons.includes(gate.id) ? this.el('span', { style: 'color:#86efac;' }, [this.uiIcon('iconCheck', 13), tr('common.completed')]) : null
          ]) : null,
          altarDef ? this.el('div', { style: 'font-size:14px;color:#ce93d8;font-weight:800;' }, tr('map.altarLine', { name: altarDef.name })) : null,
          eeDef ? this.el('div', { style: 'font-size:14px;color:#ffb74d;font-weight:800;' }, tr('map.secretLine', { name: eeDef.name })) : null,
          secretNode ? this.el('div', {
            style: `font-size:14px;font-weight:800;color:${secretNode.opened ? '#b0bec5' : (!secretNode.puzzleLocked ? '#ffd54f' : '#ea80fc')};`
          }, secretNode.opened
            ? tr('map.secretClaimed')
            : (!secretNode.puzzleLocked
              ? tr('map.secretReady')
              : tr('map.secretPillars', { done: secretPillarsDone }))) : null
        ]);

        if (!unlocked) {
          const canUnlockHere = adj && !biomeLock.lockedByBiome;
          const btnLabel = biomeLock.lockedByBiome
            ? (isEn
              ? `Complete ${biomeLock.blockingBiomeName} (${biomeLock.unlocked}/${biomeLock.total} isl. · ${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal} dung.)`
              : `Completa ${biomeLock.blockingBiomeName} (${biomeLock.unlocked}/${biomeLock.total} isl. · ${biomeLock.dungeonsDone}/${biomeLock.dungeonsTotal} maz.)`)
            : (!adj
              ? tr('map.reqAdjacent')
              : (canAfford ? tr('map.unlockPlot', { coins: price }) : tr('map.lowCoins', { cur: g.coins, req: price })));
          card.appendChild(this.el('button', {
            class: canUnlockHere && canAfford ? 'btn btn-gold' : 'btn btn-stone',
            style: `margin-top:4px;${(canUnlockHere && !canAfford) || biomeLock.lockedByBiome ? 'color:#ff8a80;border-color:#c62828;' : ''}`,
            disabled: canUnlockHere ? null : 'disabled',
            onclick: () => {
              g.economy.buyPlot(g, sgx, sgy);
              drawMapCanvas();
              renderInspector();
              this.updateHUD(true);
            }
          }, btnLabel));
        } else if (portalB) {
          card.appendChild(this.el('button', {
            class: 'btn btn-primary',
            style: 'margin-top:4px;',
            onclick: () => {
              g.player.x = (portalB.tx + 0.5) * TILE_SIZE;
              g.player.y = (portalB.ty + 1.2) * TILE_SIZE;
              Balaclava.Audio.play('portal');
              this.closeModal();
            }
          }, tr('map.fastTravel')));
        }
        card.appendChild(this.el('div', { style: 'margin-top:6px;font-size:14px;color:#8bb3d1;line-height:1.4;' }, tr('map.controlsHint')));
        if (this.showDungeonAtlas) {
          const atlasBox = this.el('div', { class: 'dungeon-atlas-list', style: 'margin-top:8px;' });
          const defs = Object.values(Balaclava.DUNGEON_DEFS || {});
          const gatesObj = Balaclava.DUNGEON_GATES || {};
          defs.forEach(dDef => {
            const gateEntry = Array.isArray(gatesObj) ? gatesObj.find(gt => gt.id === dDef.id) : gatesObj[dDef.id];
            const resolvedPlot = (g.world.dungeonGatePlots && g.world.dungeonGatePlots[dDef.id]) || (gateEntry && gateEntry.plot);
            const gx = resolvedPlot ? resolvedPlot[0] : 4;
            const gy = resolvedPlot ? resolvedPlot[1] : 4;
            const cleared = Array.isArray(g.clearedDungeons) && g.clearedDungeons.includes(dDef.id);
            const dmBiome = BIOMES[dDef.themeKey || dDef.biomeId] || BIOMES.pradera;
            atlasBox.appendChild(this.el('div', {
              class: 'dungeon-atlas-row',
              onclick: () => {
                this.selectedMapPlot = [gx, gy];
                focusMapPlot(gx, gy, Math.max(1.35, this.mapZoom));
                drawMapCanvas();
                renderInspector();
              }
            }, [
              this.el('div', {}, [
                this.el('strong', { style: `font-size:14px;color:${cleared ? '#86efac' : '#ffd54f'};display:block;` }, dDef.name),
                this.el('div', { style: 'font-size:14px;color:#b8d4ec;' }, `${dmBiome.name} · ${tr('common.levelShort')}${(gateEntry && gateEntry.recLevel) || dDef.recLevel || 2}+ · (${gx},${gy})`)
              ]),
              cleared ? this.uiIcon('iconCheck', 16) : this.el('span', { style: 'font-size:14px;color:#ffab91;' }, tr('map.goBtn'))
            ]));
          });
          card.appendChild(this.el('div', { style: 'margin-top:10px;font-size:14px;color:#ffd54f;font-weight:800;' }, tr('map.dungeonAtlasTitle', { cur: g.clearedDungeons.length, tot: defs.length })));
          card.appendChild(atlasBox);
        }
        inspectorSlot.appendChild(card);
      };

      const drawMapBuilding = (ctx, b, tilePx) => {
        const def = (Balaclava.BUILDINGS && Balaclava.BUILDINGS[b.type]) || { size: 1, name: b.type, sprite: 'building' };
        const bSize = def.size || 1;
        const bx = b.tx * tilePx;
        const by = b.ty * tilePx;
        const bw = bSize * tilePx;
        const bh = bSize * tilePx;
        const cx = bx + bw / 2;
        const cy = by + bh / 2;

        // 1. Soft drop shadow on the ground
        ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
        ctx.beginPath();
        ctx.ellipse(cx, by + bh - 1.2, bw * 0.46, bh * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Check if a preloaded image sprite exists
        const assets = Balaclava.Assets;
        const bImg = assets && assets.getBuildingImg && assets.getBuildingImg(def.sprite);
        if (bImg && bImg.complete && bImg.naturalWidth > 0 && !(bImg.naturalWidth > 200 && bImg.naturalHeight <= 64)) {
          const sW = bw * (def.visualScale || 1.15);
          const sH = bh * (def.visualScale || 1.15);
          ctx.drawImage(bImg, cx - sW / 2, cy - sH / 2, sW, sH);
        } else {
          // 3. Minecraft-style high-detail architectural isometric miniature
          const type = b.type;
          if (type === 'portal') {
            const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, bw * 0.48);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, '#00e5ff');
            grad.addColorStop(0.75, '#7c4dff');
            grad.addColorStop(1, '#1a0033');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.45, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.strokeStyle = '#263238'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.52, 0, Math.PI * 2); ctx.stroke();
          } else if (type === 'fogata') {
            ctx.fillStyle = '#424242';
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.38, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff6d00';
            ctx.beginPath(); ctx.arc(cx, cy - 1, bw * 0.25, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffd54f';
            ctx.beginPath(); ctx.arc(cx, cy - 2, bw * 0.14, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'horno') {
            ctx.fillStyle = '#455a64';
            ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
            ctx.fillStyle = '#37474f';
            ctx.fillRect(bx + 1, by + bh - 2.5, bw - 2, 1.8);
            ctx.fillStyle = '#1c2529';
            ctx.fillRect(bx + 2.5, by + 3, bw - 5, bh - 4.5);
            ctx.fillStyle = '#ff6f00';
            ctx.fillRect(bx + 3.2, by + 4, bw - 6.4, bh - 6);
            ctx.fillStyle = '#ffe082';
            ctx.fillRect(bx + 4, by + 4.8, bw - 8, bh - 7.5);
          } else if (type === 'forja') {
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(bx + 2, by + bh * 0.45, bw - 4, bh * 0.5);
            ctx.fillStyle = '#263238';
            ctx.fillRect(bx + 1, by + 1.5, bw - 2, bh * 0.45);
            ctx.fillStyle = '#78909c';
            ctx.fillRect(bx + 1.5, by + 1.5, bw - 3, 1.8);
            ctx.fillStyle = '#ff5722';
            ctx.fillRect(cx - 1.5, by + 1, 3, 1.8);
          } else if (type === 'aserradero') {
            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(bx + 1, by + 3, bw - 2, bh - 4);
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(bx + 2, by + 1.5, bw - 4, 2.5);
            ctx.fillStyle = '#cfd8dc';
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.35, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#37474f'; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(cx, cy, 1.2, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'molino') {
            ctx.fillStyle = '#cfd8dc';
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.38, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#8d6e63';
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.22, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff8e1'; ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(cx - bw * 0.42, cy - bh * 0.42); ctx.lineTo(cx + bw * 0.42, cy + bh * 0.42);
            ctx.moveTo(cx + bw * 0.42, cy - bh * 0.42); ctx.lineTo(cx - bw * 0.42, cy + bh * 0.42);
            ctx.stroke();
            ctx.fillStyle = '#d32f2f'; ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'huerto' || type === 'plantacion' || type === 'granja') {
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(bx + 1.8, by + 2, bw - 3.6, 1.8);
            ctx.fillRect(bx + 1.8, by + bh * 0.45, bw - 3.6, 1.8);
            ctx.fillRect(bx + 1.8, by + bh - 3.8, bw - 3.6, 1.8);
            ctx.fillStyle = '#81c784';
            ctx.fillRect(bx + 2.5, by + 1.5, 2, 2);
            ctx.fillRect(cx - 1, by + bh * 0.45 - 0.5, 2, 2);
            ctx.fillRect(bx + bw - 4.5, by + bh - 4.2, 2, 2);
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(bx, by, 1.8, 1.8); ctx.fillRect(bx + bw - 1.8, by, 1.8, 1.8);
            ctx.fillRect(bx, by + bh - 1.8, 1.8, 1.8); ctx.fillRect(bx + bw - 1.8, by + bh - 1.8, 1.8, 1.8);
          } else if (type === 'corral') {
            ctx.fillStyle = '#fff59d';
            ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
            ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 1.8;
            ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
          } else if (type === 'alquimia' || type === 'laboratorio') {
            ctx.fillStyle = '#37474f';
            ctx.fillRect(bx + 1.5, by + bh * 0.5, bw - 3, bh * 0.45);
            ctx.fillStyle = '#ba68c8';
            ctx.beginPath(); ctx.arc(cx, cy - 1, bw * 0.32, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#e1bee7';
            ctx.beginPath(); ctx.arc(cx - 1, cy - 2, bw * 0.12, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'cocina') {
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
            ctx.fillStyle = '#d84315';
            ctx.beginPath(); ctx.arc(cx, cy, bw * 0.28, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffd54f';
            ctx.fillRect(cx - 1, cy - 1, 2, 2);
          } else if (type === 'mercado' || type === 'casa_comercio') {
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(bx + 1, by + bh * 0.5, bw - 2, bh * 0.45);
            const stW = bw / 4;
            ctx.fillStyle = '#d32f2f'; ctx.fillRect(bx, by, stW, bh * 0.55);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(bx + stW, by, stW, bh * 0.55);
            ctx.fillStyle = '#d32f2f'; ctx.fillRect(bx + stW * 2, by, stW, bh * 0.55);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(bx + stW * 3, by, stW, bh * 0.55);
          } else if (type === 'banco' || type === 'tesoreria') {
            ctx.fillStyle = '#37474f';
            ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
            ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 1.2;
            ctx.strokeRect(bx + 2, by + 2, bw - 4, bh - 4);
            ctx.fillStyle = '#ffd54f';
            ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
          } else if (type === 'torre_magica' || type === 'monumento' || type === 'altar') {
            ctx.fillStyle = '#263238';
            ctx.fillRect(bx + 2, by + bh * 0.35, bw - 4, bh * 0.6);
            ctx.fillStyle = '#00e5ff';
            ctx.beginPath();
            ctx.moveTo(cx, by);
            ctx.lineTo(cx + bw * 0.28, by + bh * 0.38);
            ctx.lineTo(cx, by + bh * 0.48);
            ctx.lineTo(cx - bw * 0.28, by + bh * 0.38);
            ctx.closePath();
            ctx.fill();
          } else if (type === 'estanque') {
            ctx.fillStyle = '#546e7a';
            ctx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
            ctx.fillStyle = '#0288d1';
            ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
            ctx.fillStyle = '#81c784';
            ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(bx + 1, by + bh * 0.4, bw - 2, bh * 0.55);
            ctx.fillStyle = '#a0522d';
            ctx.beginPath();
            ctx.moveTo(bx, by + bh * 0.45);
            ctx.lineTo(cx, by + 0.5);
            ctx.lineTo(bx + bw, by + bh * 0.45);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffe082';
            ctx.fillRect(cx - 1.2, by + bh * 0.55, 2.4, 2.4);
          }
        }

        // 4. Level & Activity Badge
        if (b.level > 1) {
          ctx.fillStyle = 'rgba(12, 16, 28, 0.90)';
          ctx.fillRect(bx + bw - 9, by, 9, 7);
          ctx.fillStyle = '#ffd54f';
          ctx.font = '7px BalaclavaPixel, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${b.level}`, bx + bw - 4.5, by + 6);
        }
        if (b.fuel > 0 || (b.timer && b.timer > 0)) {
          ctx.fillStyle = '#4ade80';
          ctx.beginPath(); ctx.arc(bx + 2, by + 2, 1.2, 0, Math.PI * 2); ctx.fill();
        }
      };

      const drawMapCanvas = () => {
        const ctx = mapCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const cw = mapCanvas.width;
        const ch = mapCanvas.height;
        const plotPx = MAP_WORLD_SZ / GRID_PLOTS; // 120px per plot
        const tilePx = plotPx / PLOT_TILES; // 10px per tile

        const oceanGrad = ctx.createRadialGradient(cw * 0.45, ch * 0.45, 40, cw * 0.5, ch * 0.5, Math.max(cw, ch) * 0.72);
        oceanGrad.addColorStop(0, '#19577a');
        oceanGrad.addColorStop(0.6, '#103b57');
        oceanGrad.addColorStop(1, '#081b2c');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, cw, ch);

        zoomReadout.textContent = `${Math.round(this.mapZoom * 100)}%`;

        ctx.save();
        ctx.translate(this.mapPanX, this.mapPanY);
        ctx.scale(this.mapZoom, this.mapZoom);

        const terraformedSet = new Set((g.world.terraformedTiles || []).map(p => `${p[0]},${p[1]}`));

        for (let gy = 0; gy < GRID_PLOTS; gy++) {
          for (let gx = 0; gx < GRID_PLOTS; gx++) {
            const unlocked = g.world.isPlotUnlocked(gx, gy);
            const biomeId = g.world.plotBiomes[gy][gx];
            const biome = BIOMES[biomeId];
            const px0 = gx * plotPx;
            const py0 = gy * plotPx;
            const hcx = px0 + plotPx * 0.5;
            const hcy = py0 + plotPx * 0.5;
            const toHexX = (wx) => wx;
            const toHexY = (wy) => wy;

            if (unlocked) {
              const bColor = biome?.color || '#5c9e31';
              const bWater = biome?.waterColor || '#236585';
              const bSheet = Balaclava.Assets && Balaclava.Assets.biomeTiles && Balaclava.Assets.biomeTiles[biomeId];
              const maxTiles = (typeof WORLD_TILES !== 'undefined' ? WORLD_TILES : GRID_PLOTS * PLOT_TILES);

              const isLand = (x, y) => {
                if (x < 0 || y < 0 || x >= maxTiles || y >= maxTiles) return false;
                const pX = Math.floor(x / PLOT_TILES);
                const pY = Math.floor(y / PLOT_TILES);
                if (!g.world.isPlotUnlocked(pX, pY)) return false;
                const tVal = g.world.tiles[y]?.[x];
                return tVal === 1 || tVal === 2 || tVal === 3 || tVal === 4;
              };

              const cliffColors = {
                pradera:            { top: '#5d4037', mid: '#4e342e', shadow: 'rgba(10,30,45,0.45)' },
                desierto:           { top: '#8d6e3f', mid: '#6d4c23', shadow: 'rgba(10,30,45,0.45)' },
                bosque_oscuro:      { top: '#4a3f5c', mid: '#2f243d', shadow: 'rgba(8,12,24,0.48)' },
                montanas_heladas:   { top: '#607d8b', mid: '#37474f', shadow: 'rgba(10,25,40,0.50)' },
                tierras_volcanicas: { top: '#5c261f', mid: '#33120e', shadow: 'rgba(8,6,12,0.55)' }
              };
              const cPal = cliffColors[biomeId] || cliffColors.pradera;

              for (let ly = 0; ly < PLOT_TILES; ly++) {
                for (let lx = 0; lx < PLOT_TILES; lx++) {
                  const tx = gx * PLOT_TILES + lx;
                  const ty = gy * PLOT_TILES + ly;
                  const t = g.world.tiles[ty]?.[tx] ?? 0;
                  const rx = px0 + lx * tilePx;
                  const ry = py0 + ly * tilePx;
                  const rw = Math.ceil(tilePx) + 0.5;
                  const rh = Math.ceil(tilePx) + 0.5;

                  if (t === 0) {
                    // Ocean & Coastal Shallows
                    ctx.fillStyle = bWater || '#19577a';
                    ctx.fillRect(rx, ry, rw, rh);
                    const isShallow = isLand(tx, ty - 1) || isLand(tx, ty + 1) || isLand(tx - 1, ty) || isLand(tx + 1, ty);
                    if (isShallow) {
                      ctx.fillStyle = 'rgba(164, 226, 240, 0.28)';
                      ctx.fillRect(rx, ry, rw, rh);
                      if (isLand(tx, ty - 1)) {
                        ctx.fillStyle = 'rgba(235, 250, 255, 0.65)';
                        ctx.fillRect(rx, ry, rw, 1.5);
                      }
                    }
                  } else if (t === 3) {
                    // Bridge
                    const bridgeImg = Balaclava.Assets && Balaclava.Assets.get && Balaclava.Assets.get('bridge');
                    if (bridgeImg && bridgeImg.complete && bridgeImg.naturalWidth > 0) {
                      try {
                        ctx.drawImage(bridgeImg, 64, 0, 64, 64, rx, ry, rw, rh);
                      } catch (e) {
                        ctx.fillStyle = '#8d6e63';
                        ctx.fillRect(rx, ry, rw, rh);
                      }
                    } else {
                      ctx.fillStyle = '#8d6e63';
                      ctx.fillRect(rx, ry, rw, rh);
                      ctx.fillStyle = '#5d4037';
                      ctx.fillRect(rx, ry + rh * 0.45, rw, rh * 0.15);
                      ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 0.8;
                      ctx.strokeRect(rx, ry, rw, rh);
                    }
                  } else if (t === 4) {
                    // Lava
                    const lavaImg = Balaclava.Assets && Balaclava.Assets.extraImages && Balaclava.Assets.extraImages.lava_anim;
                    if (lavaImg && lavaImg.complete && lavaImg.naturalWidth > 0) {
                      try {
                        ctx.drawImage(lavaImg, 0, 0, 16, 16, rx, ry, rw, rh);
                      } catch (e) {
                        ctx.fillStyle = '#d84315';
                        ctx.fillRect(rx, ry, rw, rh);
                      }
                    } else {
                      ctx.fillStyle = '#d84315';
                      ctx.fillRect(rx, ry, rw, rh);
                      ctx.fillStyle = '#ff9800';
                      ctx.fillRect(rx + rw * 0.2, ry + rh * 0.2, rw * 0.6, rh * 0.6);
                    }
                  } else {
                    // Authentic in-game 9-slice grass tileset
                    const up = isLand(tx, ty - 1);
                    const dn = isLand(tx, ty + 1);
                    const lt = isLand(tx - 1, ty);
                    const rt = isLand(tx + 1, ty);
                    const sx = !lt ? 0 : !rt ? 128 : 64;
                    const sy = !up ? 0 : !dn ? 128 : 64;

                    // If perimeter tile touches water, draw base water underneath so rounded grass corners look natural
                    if (!up || !dn || !lt || !rt) {
                      ctx.fillStyle = bWater || '#19577a';
                      ctx.fillRect(rx, ry, rw, rh);
                    }

                    // Authentic southern cliff skirt under the grass
                    if (!dn) {
                      ctx.fillStyle = cPal.mid;
                      ctx.fillRect(rx, ry + rh - 1.5, rw, 3.2);
                      ctx.fillStyle = cPal.shadow;
                      ctx.fillRect(rx, ry + rh + 1, rw, 1.8);
                    }

                    // Draw the REAL in-game grass texture
                    const canDrawSheet = bSheet && (bSheet.width > 0 && bSheet.height > 0);
                    if (canDrawSheet) {
                      try {
                        ctx.drawImage(bSheet, sx, sy, 64, 64, rx, ry, rw, rh);
                      } catch (e) {
                        ctx.fillStyle = bColor;
                        ctx.fillRect(rx, ry, rw, rh);
                      }
                    } else {
                      ctx.fillStyle = bColor;
                      ctx.fillRect(rx, ry, rw, rh);
                    }

                    // Tilled soil / farmland layer
                    if (t === 2) {
                      const soilImg = Balaclava.Assets && Balaclava.Assets.extraImages && Balaclava.Assets.extraImages.tilled_soil;
                      if (soilImg && soilImg.complete && soilImg.naturalWidth > 0) {
                        try {
                          ctx.drawImage(soilImg, rx, ry, rw, rh);
                        } catch (e) {
                          ctx.fillStyle = '#4e342e';
                          ctx.fillRect(rx + 1, ry + 1, rw - 2, rh - 2);
                        }
                      } else {
                        ctx.fillStyle = '#4e342e';
                        ctx.fillRect(rx + 1, ry + 1, rw - 2, rh - 2);
                        ctx.fillStyle = '#3e2723';
                        ctx.fillRect(rx + 1, ry + rh * 0.35, rw - 2, 1.5);
                        ctx.fillRect(rx + 1, ry + rh * 0.70, rw - 2, 1.5);
                      }
                    }

                    // Paved stone cobblestone road on terraformed paths
                    if (terraformedSet.has(`${tx},${ty}`) && t === 1) {
                      ctx.fillStyle = 'rgba(96, 125, 139, 0.75)';
                      ctx.fillRect(rx + 1, ry + 1, rw - 2, rh - 2);
                      ctx.fillStyle = '#455a64';
                      ctx.fillRect(rx + 1.5, ry + 1.5, rw * 0.4, rh * 0.4);
                      ctx.fillRect(rx + rw * 0.5, ry + rh * 0.5, rw * 0.4, rh * 0.4);
                    }
                  }
                }
              }

              // Detailed miniature pixel flora & resource nodes
              if (Array.isArray(g.world.nodes)) {
                for (let ni = 0; ni < g.world.nodes.length; ni++) {
                  const n = g.world.nodes[ni];
                  if (!n || Math.floor(n.tx / PLOT_TILES) !== gx || Math.floor(n.ty / PLOT_TILES) !== gy) continue;
                  if (n.kind === 'dungeon_gate' || n.kind === 'altar_shrine' || n.kind === 'secret_chest' || n.kind === 'easter_egg' || n.kind === 'npc') continue;

                  const nx = (n.tx + 0.5) * tilePx;
                  const ny = (n.ty + 0.5) * tilePx;
                  const k = n.kind || '';

                  if (k.includes('tree')) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
                    ctx.beginPath(); ctx.ellipse(nx, ny + 2.5, 3.2, 1.4, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#5d4037';
                    ctx.fillRect(nx - 0.9, ny + 0.8, 1.8, 2.2);

                    if (k.includes('pine')) {
                      ctx.fillStyle = '#14421b';
                      ctx.beginPath();
                      ctx.moveTo(nx, ny - 4.5);
                      ctx.lineTo(nx + 3.2, ny + 1.2);
                      ctx.lineTo(nx - 3.2, ny + 1.2);
                      ctx.closePath(); ctx.fill();
                      ctx.fillStyle = '#2e7d32';
                      ctx.beginPath();
                      ctx.moveTo(nx, ny - 4.5);
                      ctx.lineTo(nx + 2.2, ny - 0.5);
                      ctx.lineTo(nx - 2.2, ny - 0.5);
                      ctx.closePath(); ctx.fill();
                    } else if (k.includes('palm')) {
                      ctx.fillStyle = '#388e3c';
                      ctx.beginPath(); ctx.arc(nx, ny - 1.5, 3.2, 0, Math.PI * 2); ctx.fill();
                      ctx.fillStyle = '#81c784';
                      ctx.fillRect(nx - 1, ny - 3, 2, 2);
                    } else {
                      ctx.fillStyle = '#1b5e20';
                      ctx.beginPath(); ctx.arc(nx, ny - 0.6, 3.5, 0, Math.PI * 2); ctx.fill();
                      ctx.fillStyle = '#2e7d32';
                      ctx.beginPath(); ctx.arc(nx - 0.4, ny - 1.2, 2.7, 0, Math.PI * 2); ctx.fill();
                      ctx.fillStyle = '#66bb6a';
                      ctx.beginPath(); ctx.arc(nx - 0.8, ny - 1.8, 1.5, 0, Math.PI * 2); ctx.fill();

                      if (k.includes('apple')) {
                        ctx.fillStyle = '#ef5350';
                        ctx.fillRect(nx + 1, ny - 0.5, 1.2, 1.2);
                        ctx.fillRect(nx - 1.5, ny - 2.2, 1.2, 1.2);
                      } else if (k.includes('orange')) {
                        ctx.fillStyle = '#ffa726';
                        ctx.fillRect(nx + 1, ny - 0.5, 1.2, 1.2);
                        ctx.fillRect(nx - 1.5, ny - 2.2, 1.2, 1.2);
                      }
                    }
                  } else if (k.includes('rock')) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    ctx.beginPath(); ctx.ellipse(nx, ny + 1.8, 3.0, 1.3, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#37474f';
                    ctx.beginPath(); ctx.arc(nx, ny, 2.7, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#78909c';
                    ctx.beginPath(); ctx.arc(nx - 0.6, ny - 0.6, 1.8, 0, Math.PI * 2); ctx.fill();

                    if (k.includes('gold')) {
                      ctx.fillStyle = '#ffd54f';
                      ctx.fillRect(nx - 1, ny - 1.2, 1.5, 1.5);
                      ctx.fillRect(nx + 0.8, ny + 0.2, 1.2, 1.2);
                    } else if (k.includes('gem') || k.includes('crystal')) {
                      ctx.fillStyle = '#00e5ff';
                      ctx.fillRect(nx - 0.8, ny - 1.2, 1.6, 1.6);
                      ctx.fillStyle = '#e040fb';
                      ctx.fillRect(nx + 0.6, ny + 0.2, 1.2, 1.2);
                    } else if (k.includes('iron')) {
                      ctx.fillStyle = '#cfd8dc';
                      ctx.fillRect(nx - 0.8, ny - 1, 1.5, 1.5);
                    } else if (k.includes('coal')) {
                      ctx.fillStyle = '#212121';
                      ctx.fillRect(nx - 0.8, ny - 1, 1.5, 1.5);
                    }
                  } else if (k === 'berry_bush') {
                    ctx.fillStyle = '#2e7d32';
                    ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#e91e63';
                    ctx.fillRect(nx - 1, ny - 1, 1.2, 1.2);
                    ctx.fillRect(nx + 0.8, ny - 0.5, 1.2, 1.2);
                    ctx.fillRect(nx - 0.2, ny + 0.8, 1.2, 1.2);
                  } else if (k.includes('wheat')) {
                    ctx.fillStyle = '#ffd54f';
                    ctx.fillRect(nx - 1.2, ny - 2, 0.8, 3.5);
                    ctx.fillRect(nx + 0.4, ny - 2.5, 0.8, 4);
                    ctx.fillStyle = '#f57f17';
                    ctx.fillRect(nx - 1.2, ny - 2.5, 1, 1.2);
                    ctx.fillRect(nx + 0.4, ny - 3, 1, 1.2);
                  } else if (k.includes('carrot')) {
                    ctx.fillStyle = '#4caf50';
                    ctx.fillRect(nx - 1, ny - 2, 2, 1.5);
                    ctx.fillStyle = '#ff9800';
                    ctx.fillRect(nx - 0.5, ny - 0.5, 1.2, 2);
                  } else if (k === 'flower') {
                    ctx.fillStyle = '#ff4081';
                    ctx.beginPath(); ctx.arc(nx, ny, 1.6, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#ffe082';
                    ctx.fillRect(nx - 0.5, ny - 0.5, 1, 1);
                  }
                }
              }

              const isCenter = gx === (CENTER_PLOT || 4) && gy === (CENTER_PLOT || 4);
              ctx.strokeStyle = isCenter ? 'rgba(255, 213, 79, 0.72)' : 'rgba(255, 246, 220, 0.25)';
              ctx.lineWidth = (isCenter ? 2.4 : 1.0) / this.mapZoom;
              ctx.strokeRect(px0 + 0.5, py0 + 0.5, plotPx - 1, plotPx - 1);
            } else {
              ctx.fillStyle = biome.color;
              ctx.globalAlpha = 0.16;
              ctx.fillRect(px0 + 1, py0 + 1, plotPx - 2, plotPx - 2);
              ctx.globalAlpha = 1;

              const adj = (g.economy && typeof g.economy.isPlotAdjacentlyReachable === 'function')
                ? g.economy.isPlotAdjacentlyReachable(g, gx, gy)
                : false;
              const plotBiomeLock = (g.economy && typeof g.economy.getBiomeLockStatus === 'function')
                ? g.economy.getBiomeLockStatus(g, gx, gy)
                : { lockedByBiome: false };
              const price = adj ? g.economy.getPlotPrice(g, gx, gy) : 0;
              const canAfford = adj && !plotBiomeLock.lockedByBiome && g.coins >= price;

              ctx.strokeStyle = adj
                ? (plotBiomeLock.lockedByBiome ? 'rgba(148, 163, 184, 0.60)' : (canAfford ? '#ffd54f' : '#ef5350'))
                : 'rgba(180, 210, 235, 0.22)';
              ctx.lineWidth = (adj ? 2.2 : 1.0) / this.mapZoom;
              ctx.strokeRect(px0 + 1, py0 + 1, plotPx - 2, plotPx - 2);

              if (adj) {
                const bw = plotBiomeLock.lockedByBiome ? 106 : 88;
                const bh = 26;
                ctx.fillStyle = 'rgba(12, 16, 28, 0.92)';
                ctx.fillRect(hcx - bw / 2, hcy - bh / 2, bw, bh);
                ctx.strokeStyle = plotBiomeLock.lockedByBiome ? '#64748b' : (canAfford ? '#ffd54f' : '#ef5350');
                ctx.lineWidth = 1.5;
                ctx.strokeRect(hcx - bw / 2, hcy - bh / 2, bw, bh);
                if (plotBiomeLock.lockedByBiome) {
                  const lockIm = mapImg(Balaclava.UI_URLS && Balaclava.UI_URLS.iconLock);
                  if (lockIm && lockIm.complete && lockIm.naturalWidth > 0) {
                    ctx.drawImage(lockIm, hcx - bw / 2 + 5, hcy - 9, 17, 17);
                  }
                  ctx.fillStyle = '#cbd5e1';
                  ctx.font = '13px BalaclavaPixel, monospace';
                  ctx.textAlign = 'center';
                  ctx.fillText(`${plotBiomeLock.unlocked}/${plotBiomeLock.total}·${plotBiomeLock.dungeonsDone}/${plotBiomeLock.dungeonsTotal}`, hcx + 9, hcy + 5);
                } else {
                  const coinIm = mapImg(Balaclava.UI_URLS.iconCoin);
                  if (coinIm && coinIm.complete && coinIm.naturalWidth > 0) {
                    ctx.drawImage(coinIm, hcx - bw / 2 + 6, hcy - 9, 18, 18);
                  }
                  ctx.fillStyle = canAfford ? '#ffd54f' : '#ff8a80';
                  ctx.font = '17px BalaclavaPixel, monospace';
                  ctx.textAlign = 'center';
                  ctx.fillText(`${price}`, hcx + 8, hcy + 6);
                }
              }
            }

            const gate = g.world.getDungeonGateForPlot(gx, gy);
            if (gate) {
              const cleared = g.clearedDungeons.includes(gate.id);
              if (unlocked) {
                const gNode = g.world.nodes.find(n => n.kind === 'dungeon_gate' && Math.floor(n.tx / PLOT_TILES) === gx && Math.floor(n.ty / PLOT_TILES) === gy) ||
                              g.world.nodes.find(n => n.kind === 'dungeon_gate' && n.dungeonId === gate.id);
                if (gNode) {
                  const kx = toHexX((gNode.tx + 0.5) * tilePx);
                  const ky = toHexY((gNode.ty + 0.5) * tilePx);
                  drawBadgeIcon(
                    ctx, kx, ky, 7.5,
                    cleared ? 'rgba(46, 125, 50, 0.95)' : 'rgba(183, 28, 28, 0.95)',
                    '#ffd54f', Balaclava.UI_URLS.iconKey, cleared ? 'OK' : 'D'
                  );
                }
              } else {
                drawBadgeIcon(
                  ctx, px0 + plotPx - 14, py0 + 14, 7.5,
                  cleared ? 'rgba(46, 125, 50, 0.90)' : 'rgba(183, 28, 28, 0.90)',
                  '#ffd54f', Balaclava.UI_URLS.iconKey, cleared ? 'OK' : 'D'
                );
              }
            }

            const hasSecret = unlocked && g.world.secretChestPlots && g.world.secretChestPlots[`${gx},${gy}`] !== undefined;
            if (hasSecret) {
              const sNode = g.world.nodes.find(n => n.kind === 'secret_chest' && Math.floor(n.tx / PLOT_TILES) === gx && Math.floor(n.ty / PLOT_TILES) === gy);
              const sDone = sNode && sNode.opened;
              const sUnlocked = sNode && !sNode.puzzleLocked;
              const sx = toHexX(sNode ? (sNode.tx + 0.5) * tilePx : px0 + plotPx / 2);
              const sy = toHexY(sNode ? (sNode.ty + 0.5) * tilePx : py0 + 14);
              drawBadgeIcon(
                ctx, sx, sy, 7,
                sDone ? 'rgba(69, 90, 100, 0.85)' : (sUnlocked ? 'rgba(245, 127, 23, 0.94)' : 'rgba(106, 27, 154, 0.92)'),
                '#ffe082', Balaclava.UI_URLS.chest, 'S'
              );
            }

            const altarId = unlocked && g.world.altarPlots && g.world.altarPlots[`${gx},${gy}`];
            if (altarId) {
              const aNode = g.world.nodes.find(n => n.kind === 'altar_shrine' && Math.floor(n.tx / PLOT_TILES) === gx && Math.floor(n.ty / PLOT_TILES) === gy);
              const ax = toHexX(aNode ? (aNode.tx + 0.5) * tilePx : px0 + 14);
              const ay = toHexY(aNode ? (aNode.ty + 0.5) * tilePx : py0 + plotPx - 14);
              drawBadgeIcon(
                ctx, ax, ay, 7,
                'rgba(123, 31, 162, 0.92)', '#ffe082', Balaclava.ITEM_PNG_MAP.magic_crystal, 'A'
              );
            }

            const eeId = unlocked && g.world.easterEggPlots && g.world.easterEggPlots[`${gx},${gy}`];
            if (eeId) {
              const eeNode = g.world.nodes.find(n => n.kind === 'easter_egg' && Math.floor(n.tx / PLOT_TILES) === gx && Math.floor(n.ty / PLOT_TILES) === gy);
              const ex = toHexX(eeNode ? (eeNode.tx + 0.5) * tilePx : px0 + plotPx - 14);
              const ey = toHexY(eeNode ? (eeNode.ty + 0.5) * tilePx : py0 + plotPx - 14);
              drawBadgeIcon(
                ctx, ex, ey, 7,
                'rgba(230, 81, 0, 0.92)', '#ffffff', Balaclava.UI_URLS.chest, 'S', '#ffffff'
              );
            }

            const npc = Balaclava.NPCS.find(n => {
              const p = g.world.getNpcPlot(n);
              return p[0] === gx && p[1] === gy;
            });
            if (npc && unlocked) {
              const nNode = g.world.nodes.find(node => node.kind === 'npc' && node.npcId === npc.id);
              const nx = toHexX(nNode ? (nNode.tx + 0.5) * tilePx : px0 + 14);
              const ny = toHexY(nNode ? (nNode.ty + 0.5) * tilePx : py0 + 14);
              drawBadgeIcon(
                ctx, nx, ny, 8.5,
                'rgba(2, 119, 189, 0.92)', '#ffffff', Balaclava.NPC_PORTRAIT_URLS && Balaclava.NPC_PORTRAIT_URLS[npc.id], 'N'
              );
            }
          }
        }

        // Draw every building directly in square map coordinates
        if (Array.isArray(g.buildings)) {
          g.buildings.forEach(b => {
            drawMapBuilding(ctx, b, tilePx);
          });
        }

        // Square plot grid overlay (toggled by Cuadrícula button)
        if (this.mapShowGrid) {
          ctx.strokeStyle = 'rgba(129, 212, 250, 0.28)';
          ctx.lineWidth = 1.2 / this.mapZoom;
          for (let i = 0; i <= GRID_PLOTS; i++) {
            const p = i * plotPx;
            ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, MAP_WORLD_SZ); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(MAP_WORLD_SZ, p); ctx.stroke();
          }
        }

        // Pulsating player avatar & radar ring at exact world position on square map
        const ptx = (g.player.x / TILE_SIZE) * tilePx;
        const pty = (g.player.y / TILE_SIZE) * tilePx;
        const pulse = (Math.sin(Date.now() / 240) + 1) * 0.5;
        ctx.strokeStyle = `rgba(0, 230, 118, ${0.35 + pulse * 0.45})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(ptx, pty, 13 + pulse * 5, 0, Math.PI * 2);
        ctx.stroke();
        drawBadgeIcon(ctx, ptx, pty, 13, 'rgba(0, 200, 83, 0.95)', '#ffffff', Balaclava.UI_URLS.avatarHero, '*');

        // Selected square highlight
        const [sx, sy] = this.selectedMapPlot;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
        ctx.lineWidth = 3.2 / this.mapZoom;
        ctx.strokeRect(sx * plotPx + 1.5, sy * plotPx + 1.5, plotPx - 3, plotPx - 3);

        // Tutorial Recommended 1st Island Golden Callout on Map Canvas
        const tutRecPlot = getTutorialRecommendedPlot();
        if (tutRecPlot) {
          const [rgx, rgy] = tutRecPlot;
          const recCenter = getPlotCenterPx(rgx, rgy);
          const isEnMap = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
          const lbl = isEnMap ? '1ST ISLAND' : '1ra ISLA';
          ctx.save();
          ctx.strokeStyle = `rgba(255, 213, 79, ${0.75 + pulse * 0.25})`;
          ctx.lineWidth = 3.5 / this.mapZoom;
          ctx.strokeRect(rgx * plotPx + 2, rgy * plotPx + 2, plotPx - 4, plotPx - 4);
          ctx.fillStyle = 'rgba(16, 24, 39, 0.94)';
          ctx.fillRect(recCenter.x - 42, rgy * plotPx + 8, 84, 20);
          ctx.strokeStyle = '#ffd54f';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(recCenter.x - 42, rgy * plotPx + 8, 84, 20);
          ctx.fillStyle = '#ffd54f';
          ctx.font = '13px BalaclavaPixel, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(lbl, recCenter.x, rgy * plotPx + 22);
          ctx.restore();
        }
        ctx.restore();

        // Crisp fixed bottom-right pixel-art compass rose in screen space
        const westCh = tr('map.westLetter') || 'W';
        const compImg = mapImg((Balaclava.UI_URLS && Balaclava.UI_URLS.rpgCompass) || this._uiAssetFallback('assets/ui/rpg_compass.png'));
        if (compImg && compImg.complete && compImg.naturalWidth > 0) {
          const cwPx = 68;
          const chPx = Math.round(cwPx * (compImg.naturalHeight / Math.max(1, compImg.naturalWidth)));
          const bx = cw - cwPx - 14;
          const by = ch - chPx - 14;
          const cx = bx + cwPx / 2;
          const cy = by + chPx / 2;
          ctx.fillStyle = 'rgba(10, 14, 28, 0.80)';
          ctx.beginPath(); ctx.arc(cx, cy, Math.max(cwPx, chPx) * 0.44, 0, Math.PI * 2); ctx.fill();
          ctx.drawImage(compImg, bx, by, cwPx, chPx);
          ctx.font = '14px BalaclavaPixel, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#090d1a';
          ctx.fillText('N', cx + 1, by + 9);
          ctx.fillText('S', cx + 1, by + chPx - 7);
          ctx.fillText(westCh, bx + 9, cy + 1);
          ctx.fillText('E', bx + cwPx - 7, cy + 1);
          ctx.fillStyle = '#ffe8a3';
          ctx.fillText('N', cx, by + 8);
          ctx.fillText('S', cx, by + chPx - 8);
          ctx.fillText(westCh, bx + 8, cy);
          ctx.fillText('E', bx + cwPx - 8, cy);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        } else {
          const compX = cw - 38;
          const compY = ch - 38;
          ctx.fillStyle = 'rgba(10, 22, 38, 0.86)';
          ctx.beginPath(); ctx.arc(compX, compY, 24, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#ffd54f'; ctx.font = '15px BalaclavaPixel, monospace'; ctx.textAlign = 'center';
          ctx.fillText('N', compX, compY - 10);
          ctx.fillText('S', compX, compY + 18);
          ctx.fillText(westCh, compX - 15, compY + 4);
          ctx.fillText('E', compX + 15, compY + 4);
          ctx.textAlign = 'left';
        }
      };

      const setMapZoomAround = (nextZoom, ax = viewW / 2, ay = viewH / 2) => {
        const z = Balaclava.Utils.clamp(nextZoom, 0.55, 2.8);
        const wx = (ax - this.mapPanX) / this.mapZoom;
        const wy = (ay - this.mapPanY) / this.mapZoom;
        this.mapZoom = z;
        this.mapPanX = ax - wx * z;
        this.mapPanY = ay - wy * z;
        drawMapCanvas();
      };

      const focusMapPlot = (gx, gy, z = 1.45) => {
        const pt = getPlotCenterPx(gx, gy);
        this.mapZoom = Balaclava.Utils.clamp(z, 0.45, 2.8);
        this.mapPanX = mapCanvas.width / 2 - pt.x * this.mapZoom;
        this.mapPanY = mapCanvas.height / 2 - pt.y * this.mapZoom;
        drawMapCanvas();
      };

      let dragActive = false;
      let dragMoved = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let startPanX = 0;
      let startPanY = 0;

      mapCanvas.addEventListener('mousedown', (ev) => {
        if (ev.button !== 0) return;
        dragActive = true;
        dragMoved = false;
        dragStartX = ev.clientX;
        dragStartY = ev.clientY;
        startPanX = this.mapPanX;
        startPanY = this.mapPanY;
        boardWrap.classList.add('dragging');
      });

      if (this._mapCleanup) { this._mapCleanup(); this._mapCleanup = null; }
      const onMapMove = (ev) => {
        if (!dragActive || this.activeModal !== 'map') return;
        const dx = ev.clientX - dragStartX;
        const dy = ev.clientY - dragStartY;
        if (Math.hypot(dx, dy) > 5) dragMoved = true;
        this.mapPanX = startPanX + dx;
        this.mapPanY = startPanY + dy;
        drawMapCanvas();
      };
      const onMapUp = () => {
        if (!dragActive) return;
        dragActive = false;
        boardWrap.classList.remove('dragging');
      };
      window.addEventListener('mousemove', onMapMove);
      window.addEventListener('mouseup', onMapUp);
      this._mapCleanup = () => {
        window.removeEventListener('mousemove', onMapMove);
        window.removeEventListener('mouseup', onMapUp);
      };

      mapCanvas.addEventListener('click', (ev) => {
        if (dragMoved) { dragMoved = false; return; }
        const rect = mapCanvas.getBoundingClientRect();
        const sx = (ev.clientX - rect.left) * (mapCanvas.width / rect.width);
        const sy = (ev.clientY - rect.top) * (mapCanvas.height / rect.height);
        const wx = (sx - this.mapPanX) / this.mapZoom;
        const wy = (sy - this.mapPanY) / this.mapZoom;
        if (wx < 0 || wy < 0 || wx > MAP_WORLD_SZ || wy > MAP_WORLD_SZ) return;
        const gx = Balaclava.Utils.clamp(Math.floor(wx / (MAP_WORLD_SZ / GRID_PLOTS)), 0, GRID_PLOTS - 1);
        const gy = Balaclava.Utils.clamp(Math.floor(wy / (MAP_WORLD_SZ / GRID_PLOTS)), 0, GRID_PLOTS - 1);
        this.selectedMapPlot = [gx, gy];
        drawMapCanvas();
        renderInspector();
      });

      mapCanvas.addEventListener('wheel', (ev) => {
        ev.preventDefault();
        const rect = mapCanvas.getBoundingClientRect();
        const ax = (ev.clientX - rect.left) * (mapCanvas.width / rect.width);
        const ay = (ev.clientY - rect.top) * (mapCanvas.height / rect.height);
        const step = ev.deltaY < 0 ? 1.15 : 0.87;
        setMapZoomAround(this.mapZoom * step, ax, ay);
      }, { passive: false });

      const toolbar = this.el('div', { class: 'map-atlas-toolbar' }, [
        this.el('button', {
          class: 'btn btn-sm',
          'data-tip-text': tr('map.zoomOutTip'),
          'aria-label': tr('map.zoomOutTip'),
          onclick: () => setMapZoomAround(this.mapZoom * 0.82)
        }, [this.uiIcon('iconZoomOut', 18)]),
        zoomReadout,
        this.el('button', {
          class: 'btn btn-sm',
          'data-tip-text': tr('map.zoomInTip'),
          'aria-label': tr('map.zoomInTip'),
          onclick: () => setMapZoomAround(this.mapZoom * 1.22)
        }, [this.uiIcon('iconZoomIn', 18)]),
        this.el('button', { class: 'btn btn-gold btn-sm', onclick: () => { this.selectedMapPlot = [pGx, pGy]; focusMapPlot(pGx, pGy, 1.45); renderInspector(); } }, tr('map.centerMe')),
        this.el('button', { class: 'btn btn-sm', onclick: () => {
          this.mapZoom = fitZoom;
          this.mapPanX = (mapCanvas.width - MAP_WORLD_SZ * fitZoom) / 2;
          this.mapPanY = (mapCanvas.height - MAP_WORLD_SZ * fitZoom) / 2;
          drawMapCanvas();
        } }, tr('map.viewAll')),
        this.el('button', {
          class: 'btn ' + (this.mapShowGrid ? 'btn-gold' : 'btn-sm'),
          style: 'padding:3px 8px;font-size:13px;',
          title: 'Alternar cuadrícula de parcelas',
          onclick: (e) => {
            this.mapShowGrid = !this.mapShowGrid;
            e.currentTarget.className = 'btn ' + (this.mapShowGrid ? 'btn-gold' : 'btn-sm');
            drawMapCanvas();
          }
        }, [this.el('span', {}, 'Cuadrícula')]),
        this.el('button', {
          class: 'btn ' + (this.showDungeonAtlas ? 'btn-gold' : 'btn-primary') + ' btn-sm',
          onclick: () => { this.showDungeonAtlas = !this.showDungeonAtlas; renderInspector(); }
        }, tr('map.dungeonsBtn', { n: Object.keys(Balaclava.DUNGEON_DEFS || {}).length }))
      ]);

      const legendItem = (url, label, ringColor) => this.el('span', { style: 'display:inline-flex;align-items:center;gap:4px;' }, [
        this.el('img', {
          class: 'pixel-img',
          src: encodeURI(url),
          width: 16,
          height: 16,
          alt: '',
          style: `border-radius:4px;background:#161d2e;padding:1px;border:1.5px solid ${ringColor};`
        }),
        label
      ]);

      const headerTools = document.getElementById('modal-header-tools');
      if (headerTools) {
        headerTools.innerHTML = '';
        headerTools.appendChild(toolbar);
        headerTools.classList.remove('hidden');
      } else {
        boardWrap.appendChild(toolbar);
      }
      boardWrap.appendChild(mapCanvas);
      boardWrap.appendChild(this.el('div', { class: 'map-legend-floating' }, [
        legendItem(Balaclava.UI_URLS.avatarHero, tr('map.playerHere'), '#00e676'),
        legendItem(Balaclava.UI_URLS.iconCoin, tr('map.legForSale'), '#ffd54f'),
        legendItem(Balaclava.NPC_PORTRAIT_URLS.eldrin, tr('map.legNpc'), '#29b6f6'),
        legendItem(Balaclava.UI_URLS.iconKey, tr('map.legDungeon'), '#d32f2f'),
        legendItem(Balaclava.ITEM_PNG_MAP.magic_crystal, tr('map.legAltar'), '#ab47bc'),
        legendItem(Balaclava.UI_URLS.chest, tr('map.legSecret'), '#ffa726'),
        legendItem(Balaclava.ITEM_PNG_MAP.ancient_fragment, tr('map.legPortal'), '#00e5ff')
      ]));

      workspace.appendChild(boardWrap);
      workspace.appendChild(inspectorSlot);
      body.appendChild(workspace);

      try {
        drawMapCanvas();
      } catch (err) {
        console.error('Error drawing map canvas:', err);
      }
      try {
        renderInspector();
      } catch (err) {
        console.error('Error rendering map inspector:', err);
      }
    }

    renderMarket(body) {
      const g = this.game;
      if (!this.marketTab) this.marketTab = 'comprar';

      const secs = Math.max(0, Math.ceil(g.economy.refreshTimer || 0));
      const mm = String(Math.floor(secs / 60)).padStart(2, '0');
      const ss = String(secs % 60).padStart(2, '0');
      const sellMult = g.economy.getSellMultiplier(g);

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;font-size:14px;line-height:1.4;' }, [
        this.el('strong', { style: 'font-size:16px;display:block;margin-bottom:2px;' }, tr('market.postTitle')),
        tr('market.rotInfo', { mm, ss, pct: Math.round((sellMult - 1) * 100) })
      ]));

      const topRow = this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;' }, [
        this.el('div', { class: 'tab-row', style: 'margin-bottom:0;' }, [
          this.el('button', {
            class: 'tab-btn' + (this.marketTab === 'comprar' ? ' active' : ''),
            onclick: () => { this.marketTab = 'comprar'; this.renderModal(); }
          }, tr('market.tabBuy', { n: Math.min(5, (g.economy.marketStock || []).length) })),
          this.el('button', {
            class: 'tab-btn' + (this.marketTab === 'vender' ? ' active' : ''),
            onclick: () => { this.marketTab = 'vender'; this.renderModal(); }
          }, tr('market.tabSell', { n: Math.min(5, (g.economy.sellContracts || []).length) }))
        ]),
        this.el('button', {
          class: 'btn btn-gold btn-sm',
          onclick: () => {
            if (g.coins < 15) return g.toast(tr('market.needCoinsRefresh'), 'warn');
            g.coins -= 15; g.economy.refreshStock(g.player.level); Balaclava.Audio.play('coin'); this.renderModal();
          }
        }, tr('market.refreshBtn'))
      ]);
      body.appendChild(topRow);

      const list = this.el('div', { class: 'build-list' });
      if (this.marketTab === 'comprar') {
        (g.economy.marketStock || []).slice(0, 5).forEach((offer, idx) => {
          const it = Balaclava.ITEMS[offer.itemId];
          if (!it) return;
          const cost = g.economy.getBuyPrice(g, offer.price);
          const rar = RARITIES[it.rarity] || RARITIES.comun;
          list.appendChild(this.el('div', { class: 'build-row-card' }, [
            this.el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;' }, [
              this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
                this.itemIcon(it.icon, 32),
                this.el('div', {}, [
                  this.el('strong', { style: 'font-size:15px;color:#ffe39a;display:block;' }, it.name),
                  this.el('span', { class: 'rarity-tag', style: `background:${rar.bg};color:${rar.color}` },
                    tr('market.stockLabel', { rar: rar.name, stock: offer.stock, disc: offer.discount ? ` · -${offer.discount}%` : '' }))
                ])
              ]),
              this.el('div', { style: 'text-align:right;' }, [
                this.el('div', { style: 'font-size:14px;color:#ffd54f;font-weight:800;margin-bottom:4px;' }, tr('market.goldPrice', { cost })),
                this.el('div', { style: 'display:flex;gap:6px;justify-content:flex-end;' }, [
                  this.el('button', {
                    class: 'btn btn-primary btn-sm',
                    disabled: offer.stock <= 0 || g.coins < cost ? 'disabled' : null,
                    onclick: () => { g.economy.buyMarketItem(g, idx, 1); this.renderModal(); }
                  }, tr('market.buyOne')),
                  this.el('button', {
                    class: 'btn btn-stone btn-sm',
                    disabled: offer.stock <= 0 || g.coins < cost ? 'disabled' : null,
                    onclick: () => { g.economy.buyMarketItem(g, idx, 5); this.renderModal(); }
                  }, 'x5')
                ])
              ])
            ])
          ]));
        });
      } else {
        (g.economy.sellContracts || []).slice(0, 5).forEach((c, idx) => {
          const it = Balaclava.ITEMS[c.itemId];
          if (!it) return;
          const owned = g.inventory[c.itemId] || 0;
          const unit = Math.max(1, Math.round(c.price * sellMult));
          const maxSell = Math.min(owned, c.demand);
          list.appendChild(this.el('div', { class: 'build-row-card' }, [
            this.el('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;' }, [
              this.el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
                this.itemIcon(it.icon, 32),
                this.el('div', {}, [
                  this.el('strong', { style: 'font-size:15px;color:#ffe39a;display:block;' }, it.name),
                  this.el('div', { style: 'font-size:14px;color:#dce8f5;line-height:1.45;' },
                    tr('market.demandLine', { demand: c.demand, bonus: c.bonusPct || 15, owned }))
                ])
              ]),
              this.el('div', { style: 'text-align:right;' }, [
                this.el('div', { style: 'font-size:14px;color:#81c784;font-weight:800;margin-bottom:4px;' }, tr('market.goldPerUnit', { unit })),
                this.el('div', { style: 'display:flex;gap:6px;justify-content:flex-end;' }, [
                  this.el('button', {
                    class: 'btn btn-gold btn-sm',
                    disabled: maxSell <= 0 ? 'disabled' : null,
                    onclick: () => { g.economy.sellMarketContract(g, idx, 1); this.renderModal(); }
                  }, tr('market.sellOne')),
                  this.el('button', {
                    class: 'btn btn-green btn-sm',
                    disabled: maxSell <= 0 ? 'disabled' : null,
                    onclick: () => { g.economy.sellMarketContract(g, idx, maxSell); this.renderModal(); }
                  }, maxSell > 0 ? tr('market.sellCount', { n: maxSell }) : tr('market.noStock'))
                ])
              ])
            ])
          ]));
        });
      }
      body.appendChild(list);
    }

    renderQuests(body) {
      const g = this.game;
      const contracts = Balaclava.GUILD_CONTRACTS || [];
      const claimedIds = g.claimedContracts || [];
      const readyContracts = contracts.filter(c => !claimedIds.includes(c.id) && c.progress(g) >= c.target).length;
      const readyDaily = g.events.dailyChallenges.filter(dc => !dc.claimed && dc.progress >= dc.target).length;
      const totalNpcQuests = Balaclava.NPCS.reduce((acc, n) => acc + n.quests.length, 0);
      const doneNpcQuests = Balaclava.NPCS.reduce((acc, n) => acc + Math.min(n.quests.length, g.npcQuestProgress[n.id] || 0), 0);

      // Summary Parchment Banner
      body.appendChild(this.el('div', { class: 'parchment-box quests-summary' }, [
        this.el('div', {}, [
          this.el('strong', { class: 'quests-summary-title' }, tr('quests.logTitle')),
          this.el('span', { class: 'quests-summary-meta' },
            tr('quests.logMeta', { s: g.storyIndex, st: Balaclava.STORY_CHAPTERS.length, n: doneNpcQuests, nt: totalNpcQuests, c: claimedIds.length, ct: contracts.length }))
        ]),
        this.el('div', { class: 'skill-points-pill' },
          tr('quests.totalPill', { tot: contracts.length + Balaclava.STORY_CHAPTERS.length + totalNpcQuests + g.events.dailyChallenges.length }))
      ]));

      const tabs = this.el('div', { class: 'tab-row quests-tabs' });
      [
        ['historia', tr('quests.tabStoryCount', { cur: g.storyIndex, tot: Balaclava.STORY_CHAPTERS.length })],
        ['contratos', readyContracts > 0 ? tr('quests.tabContractsReady', { n: readyContracts }) : tr('quests.tabContractsCount', { cur: claimedIds.length, tot: contracts.length })],
        ['npcs', tr('quests.tabNpcsCount', { cur: doneNpcQuests, tot: totalNpcQuests })],
        ['diarios', readyDaily > 0 ? tr('quests.tabDailyReady', { n: readyDaily }) : tr('quests.tabDaily')]
      ].forEach(([id, lbl]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.questFilter === id ? ' active' : ''),
          onclick: () => { this.questFilter = id; this.renderModal(); }
        }, lbl));
      });
      body.appendChild(tabs);
      if (this.questFilter === 'logros') this.questFilter = 'historia';

      let filteredContracts = contracts;
      if (this.questFilter === 'contratos') {
        const catRow = this.el('div', { class: 'tab-row quests-cat-row' });
        const catOpts = [
          ['todas', tr('quests.catAll', { n: contracts.length }), null],
          ['gather', tr('quests.catGather'), tr('quests.catGather')],
          ['farmFish', tr('quests.catFarmFish'), tr('quests.catFarmFish')],
          ['forgeTrade', tr('quests.catForgeTrade'), tr('quests.catForgeTrade')],
          ['combatDung', tr('quests.catCombatDung'), tr('quests.catCombatDung')],
          ['exploreMagic', tr('quests.catExploreMagic'), tr('quests.catExploreMagic')]
        ];
        if (!catOpts.some(([cid]) => cid === this.questCatFilter)) {
          const matched = catOpts.find(([, , matchCat]) => matchCat === this.questCatFilter);
          this.questCatFilter = matched ? matched[0] : 'todas';
        }
        catOpts.forEach(([cid, clbl]) => {
          catRow.appendChild(this.el('button', {
            class: 'tab-btn quests-cat-btn' + (this.questCatFilter === cid ? ' active' : ''),
            onclick: () => { this.questCatFilter = cid; this.renderModal(); }
          }, clbl));
        });
        body.appendChild(catRow);
        const activeCat = catOpts.find(([cid]) => cid === this.questCatFilter);
        filteredContracts = (!activeCat || !activeCat[2])
          ? contracts
          : contracts.filter(c => c.cat === activeCat[2]);
      }

      const grid = this.el('div', { class: 'grid-cards quests-grid' });
      if (this.questFilter === 'historia') {
        Balaclava.STORY_CHAPTERS.forEach((ch, idx) => {
          const done = idx < g.storyIndex;
          const active = idx === g.storyIndex;
          const rewardItems = ch.reward && ch.reward.items
            ? Object.entries(ch.reward.items).filter(([k, q]) => q > 0 && Balaclava.ITEMS[k]).map(([k, q]) => `${q}x ${Balaclava.ITEMS[k].name}`).join(', ')
            : '';
          grid.appendChild(this.el('div', { class: 'card quests-card' + (active ? ' selected' : '') + (done ? ' is-done' : '') }, [
            this.el('strong', { class: 'quests-title', style: `color:${done ? '#9be89e' : active ? '#ffe082' : '#f2e6d4'};` }, [
              done ? this.uiIcon('iconCheck', 15) : (active ? this.uiIcon('iconStar', 15) : null),
              ch.title
            ]),
            this.el('p', { class: 'quests-lore' }, ch.lore),
            this.el('div', { class: 'quests-obj' }, tr('quests.objectiveLine', { obj: ch.objective })),
            ch.reward ? this.el('div', { class: 'quests-reward' },
              tr('quests.rewardLineXp', { coins: ch.reward.coins, xp: ch.reward.xp, items: rewardItems ? ` · ${rewardItems}` : '' })) : null
          ]));
        });
      } else if (this.questFilter === 'contratos') {
        filteredContracts.forEach(c => {
          const claimed = claimedIds.includes(c.id);
          const cur = Math.min(c.target, c.progress(g));
          const ready = !claimed && cur >= c.target;
          const itemStr = c.reward && c.reward.items
            ? Object.entries(c.reward.items).filter(([id, q]) => q > 0 && Balaclava.ITEMS[id]).map(([id, q]) => `${q}x ${Balaclava.ITEMS[id].name}`).join(', ')
            : '';
          grid.appendChild(this.el('div', { class: 'card quests-card' + (ready ? ' selected' : '') + (claimed ? ' is-done' : '') }, [
            this.el('div', { class: 'quests-card-head' }, [
              this.el('strong', { class: 'quests-title', style: `color:${claimed ? '#9be89e' : '#ffe082'};` }, [
                claimed ? this.uiIcon('iconCheck', 15) : null,
                c.title
              ]),
              this.el('span', { class: 'rarity-tag quests-cat-tag' }, c.cat)
            ]),
            this.el('div', { class: 'quests-desc' }, `${c.desc} (${cur}/${c.target})`),
            this.el('div', { class: 'quests-progress-bar' }, [
              this.el('div', { style: `height:100%;width:${Math.round((cur / c.target) * 100)}%;background:${claimed || ready ? '#66bb6a' : '#ffb74d'};` })
            ]),
            this.el('div', { class: 'quests-reward' },
              tr('quests.rewardLineXp', { coins: c.reward.coins, xp: c.reward.xp, items: itemStr ? ` · ${itemStr}` : '' })),
            this.el('button', {
              class: (ready ? 'btn btn-green btn-sm' : 'btn btn-sm') + ' quests-btn',
              disabled: ready ? null : 'disabled',
              onclick: () => { g.events.claimContract(g, c.id); this.renderModal(); }
            }, claimed ? [this.uiIcon('iconCheck', 14), tr('common.claimed')] : ready ? tr('quests.claimReward') : tr('quests.inProgressParen', { cur, req: c.target }))
          ]));
        });
      } else if (this.questFilter === 'npcs') {
        Balaclava.NPCS.forEach(npc => {
          const step = g.npcQuestProgress[npc.id] || 0;
          const q = npc.quests[step];
          const nPlot = g.world.getNpcPlot(npc);
          const questList = this.el('div', { class: 'quests-npc-list' });
          npc.quests.forEach((nq, qi) => {
            const isDone = qi < step;
            const isCurr = qi === step;
            questList.appendChild(this.el('div', {
              class: 'quests-npc-step',
              style: `background:${isCurr ? 'rgba(255,213,79,0.16)' : isDone ? 'rgba(24,48,34,0.68)' : 'rgba(20,26,44,0.82)'};border:1px solid ${isDone ? '#66bb6a' : isCurr ? '#ffd54f' : 'rgba(140,165,210,0.38)'};color:${isDone ? '#bdf5b9' : isCurr ? '#fff0b3' : '#d2dff0'};`
            }, [
              isDone ? this.uiIcon('iconCheck', 14) : (isCurr ? this.uiIcon('iconStar', 14) : this.uiIcon('iconLock', 14)),
              `${qi + 1}. ${nq.title}${isCurr ? ` — ${nq.desc}` : ''}`
            ]));
          });
          grid.appendChild(this.el('div', { class: 'card quests-card' }, [
            this.el('div', { class: 'card-head' }, [
              this.npcPortrait(npc.id, 46),
              this.el('div', {}, [
                this.el('strong', { class: 'quests-title' }, `${npc.name} (${Math.min(step, npc.quests.length)}/${npc.quests.length})`),
                this.el('div', { class: 'quests-npc-meta' }, tr('quests.biomePlot', { biome: BIOMES[npc.biome].name, x: nPlot[0], y: nPlot[1] }))
              ])
            ]),
            this.el('div', { class: 'quests-npc-active' }, q
              ? tr('quests.npcActive', { title: q.title, coins: q.reward.coins })
              : [this.uiIcon('iconCheck', 14), tr('quests.npcDone')]),
            questList
          ]));
        });
      } else {
        g.events.dailyChallenges.forEach(dc => {
          const ready = !dc.claimed && dc.progress >= dc.target;
          grid.appendChild(this.el('div', { class: 'card quests-card' + (ready ? ' selected' : '') + (dc.claimed ? ' is-done' : '') }, [
            this.el('strong', { class: 'quests-title', style: 'color:#ffe082;' }, dc.title),
            this.el('div', { class: 'quests-desc' }, `${dc.desc} (${dc.progress}/${dc.target})`),
            this.el('div', { class: 'quests-reward' }, tr('quests.dailyReward', { coins: dc.rewardCoins, xp: dc.rewardXp })),
            this.el('button', {
              class: 'btn btn-green btn-sm quests-btn',
              disabled: ready ? null : 'disabled',
              onclick: () => { g.events.claimChallenge(g, dc.id); this.renderModal(); }
            }, dc.claimed ? [this.uiIcon('iconCheck', 14), tr('common.claimed')] : ready ? tr('quests.claimReward') : tr('common.inProgress'))
          ]));
        });
      }
      body.appendChild(grid);
    }

    renderAchievements(body) {
      const g = this.game;
      if (g.events) g.events.checkProgress(g);
      const done = g.unlockedAchievements.length;
      const total = Balaclava.ACHIEVEMENTS.length;
      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;' }, [
        this.el('div', {}, [
          this.el('strong', { style: 'font-size:16px;display:block;' }, tr('ach.boardTitle', { cur: done, tot: total })),
          this.el('span', { style: 'font-size:15px;line-height:1.48;' }, tr('ach.boardDesc'))
        ]),
        this.el('div', { class: 'skill-points-pill' }, `${Math.round((done / Math.max(1, total)) * 100)}%`)
      ]));

      const grid = this.el('div', { class: 'grid-cards' });
      Balaclava.ACHIEVEMENTS.forEach(ach => {
        const ok = g.unlockedAchievements.includes(ach.id);
        grid.appendChild(this.el('div', { class: 'card' + (ok ? ' selected' : ''), style: ok ? '' : 'opacity:0.74' }, [
          this.el('div', { class: 'card-head' }, [
            this.itemIcon(ok ? 'balaclava_core' : 'ancient_fragment', 30),
            this.el('strong', { style: `color:${ok ? '#a5e6a1' : '#eadfcf'};font-size:16px;` }, [
              ok ? this.uiIcon('iconCheck', 14) : null,
              ach.name
            ])
          ]),
          this.el('div', { style: 'font-size:15px;color:#f3e7d8;line-height:1.5;' }, ach.desc),
          this.el('div', { style: 'font-size:14px;color:#ffd54f;font-weight:700;' }, tr('ach.rewardCoins', { coins: ach.coins }))
        ]));
      });
      body.appendChild(grid);
    }

    renderEnchanting(body) {
      const g = this.game;
      if (!this.enchantTarget) this.enchantTarget = { kind: 'tool', id: 'pico' };

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;' }, [
        this.el('strong', { style: 'font-size:16px;display:block;margin-bottom:3px;' }, tr('ench.tableTitle')),
        this.el('span', { style: 'font-size:15px;line-height:1.48;' }, tr('ench.tableDesc'))
      ]));

      // Owned tools & modular armor pieces (helm, armor, shield, boots)
      const ownedTools = Object.values(Balaclava.TOOLS).filter(t => Boolean(g.toolTiers[t.id]));
      const ownedArmors = Object.values(Balaclava.ITEMS).filter(it => {
        const slot = it.equipSlot === 'helmet' ? 'helm' : it.equipSlot;
        return ['armor', 'helm', 'shield', 'boots', 'ring', 'amulet'].includes(slot) &&
          ((g.inventory[it.id] || 0) > 0 || g.equipped[slot] === it.id);
      });

      // Ensure valid default selection
      if (this.enchantTarget.kind === 'tool' && !g.toolTiers[this.enchantTarget.id]) {
        this.enchantTarget = { kind: 'tool', id: ownedTools[0] ? ownedTools[0].id : 'pico' };
      } else if (this.enchantTarget.kind === 'armor' && !ownedArmors.some(a => a.id === this.enchantTarget.id)) {
        this.enchantTarget = ownedTools.length
          ? { kind: 'tool', id: ownedTools[0].id }
          : { kind: 'armor', id: ownedArmors[0] ? ownedArmors[0].id : '' };
      }

      const selRow = this.el('div', { class: 'tab-row' });
      ownedTools.forEach(t => {
        const active = this.enchantTarget.kind === 'tool' && this.enchantTarget.id === t.id;
        selRow.appendChild(this.el('button', {
          class: 'tab-btn' + (active ? ' active' : ''),
          onclick: () => { this.enchantTarget = { kind: 'tool', id: t.id }; this.renderModal(); }
        }, [this.toolIcon(t.id, g.toolTiers[t.id], 18), ' ', t.name]));
      });
      ownedArmors.forEach(ar => {
        const active = this.enchantTarget.kind === 'armor' && this.enchantTarget.id === ar.id;
        selRow.appendChild(this.el('button', {
          class: 'tab-btn' + (active ? ' active' : ''),
          onclick: () => { this.enchantTarget = { kind: 'armor', id: ar.id }; this.renderModal(); }
        }, [this.itemIcon(ar.icon, 18), ' ', ar.name]));
      });
      body.appendChild(selRow);

      const tKind = this.enchantTarget.kind;
      const tId = this.enchantTarget.id;
      const table = tKind === 'armor' ? Balaclava.ARMOR_ENCHANTS : Balaclava.TOOL_ENCHANTS;
      const curStore = tKind === 'armor' ? (g.armorEnchants && g.armorEnchants[tId]) : (g.toolEnchants && g.toolEnchants[tId]);
      const curLevels = curStore || {};

      if (!tId) {
        body.appendChild(this.el('div', { class: 'card' }, tr('ench.noGear')));
        return;
      }

      const targetLabel = tKind === 'armor'
        ? (Balaclava.ITEMS[tId] ? Balaclava.ITEMS[tId].name : tId)
        : `${Balaclava.TOOLS[tId].name} (${Balaclava.TIER_META[g.toolTiers[tId]].name})`;
      const appliedEntries = Object.entries(curLevels).filter(([, v]) => v > 0);
      const usedSlots = appliedEntries.length;
      const maxSlots = g.getMaxEnchantSlots ? g.getMaxEnchantSlots() : 3;
      const appliedText = appliedEntries
        .map(([eid, lvl]) => `${table[eid] ? table[eid].name : eid} ${tr('common.levelShort')}${lvl}`).join(' · ') || tr('ench.noneYet');
      const pipRow = this.el('span', { class: 'enchant-pip-row' },
        Array.from({ length: maxSlots }, (_, i) => this.el('span', { class: 'enchant-pip' + (i < usedSlots ? ' filled' : '') }))
      );

      body.appendChild(this.el('div', { class: 'card selected', style: 'margin-bottom:12px;' }, [
        this.el('strong', { style: 'font-size:16px;color:#ffd54f;' }, tr('ench.selected', { label: targetLabel })),
        this.el('div', { style: 'font-size:14px;color:#80f0ff;font-weight:800;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:4px 0;' }, [
          tr('ench.slotsLine', { cur: usedSlots, max: maxSlots }),
          pipRow,
          maxSlots < 6 ? tr('ench.slotsExtra') : tr('ench.slotsMaxed')
        ]),
        this.el('div', { style: 'font-size:15px;line-height:1.48;color:#e4d3f5;font-weight:600;' }, tr('ench.activeList', { list: appliedText }))
      ]));

      const tableTier = g.getEnchantTableTier ? g.getEnchantTableTier() : 1;
      const grid = this.el('div', { class: 'grid-cards' });
      Object.values(table).forEach(ench => {
        const lvl = curLevels[ench.id] || 0;
        const maxed = lvl >= ench.maxLevel;
        const slotsFull = lvl === 0 && usedSlots >= maxSlots;
        const conflictName = g.getEnchantConflict ? g.getEnchantConflict(tKind, tId, ench.id) : null;
        const tierLocked = (ench.reqTier || 1) > tableTier;
        const cost = !maxed ? Balaclava.getEnchantCost(tKind, ench.id, lvl + 1) : null;
        const coinsOk = cost && g.coins >= cost.coins;
        const itemsOk = cost && Object.entries(cost.items).every(([id, q]) => (g.inventory[id] || 0) >= q);
        const can = Boolean(cost && coinsOk && itemsOk && !slotsFull && !conflictName && !tierLocked);

        const costBox = this.el('div', { style: 'font-size:14px;line-height:1.48;' });
        if (cost) {
          costBox.appendChild(this.el('div', { style: `color:${coinsOk ? '#ffd54f' : '#ff8a65'};font-weight:700;` }, tr('ench.coinsRow', { cur: g.coins, req: cost.coins })));
          Object.entries(cost.items).forEach(([id, q]) => {
            const have = g.inventory[id] || 0;
            const iName = Balaclava.ITEMS[id] ? Balaclava.ITEMS[id].name : id;
            costBox.appendChild(this.el('div', { style: `color:${have >= q ? '#81c784' : '#ff8a65'}` }, `${iName}: ${have}/${q}`));
          });
        }

        const enchIconMap = {
          eficiencia: 'crystal', fortuna: 'emerald', filo: 'ancient_fragment',
          toque_igneo: 'coal', alcance: 'magic_crystal', proteccion: 'armor_iron',
          vitalidad: 'relic_heart', espinas: 'bone', agilidad: 'leather', aura_luz: 'relic_lantern'
        };
        const incList = Array.isArray(ench.incompatibleWith) && ench.incompatibleWith.length
          ? ench.incompatibleWith.map(cid => (table[cid] ? table[cid].name : cid)).join(', ')
          : '';
        grid.appendChild(this.el('div', { class: 'card' + (lvl > 0 ? ' selected' : '') + ((conflictName || tierLocked) ? ' card-locked' : '') }, [
          this.el('div', { class: 'card-head' }, [
            this.itemIcon(ench.icon || enchIconMap[ench.id] || 'magic_crystal', 30),
            this.el('div', {}, [
              this.el('strong', { style: `color:${ench.color};font-size:16px;` }, ench.name),
              this.el('div', { style: 'font-size:14px;color:#f0e2cf;line-height:1.45;' }, tr('ench.lvlTable', { lvl, max: ench.maxLevel, req: ench.reqTier || 1 }))
            ])
          ]),
          this.el('div', { style: 'font-size:15px;color:#f8f1e4;line-height:1.5;' }, ench.desc),
          conflictName ? this.el('div', { class: 'ench-conflict-tag' }, tr('ench.incompat', { name: conflictName }))
            : incList ? this.el('div', { style: 'font-size:14px;color:#b0bec5;' }, tr('ench.exclusiveVs', { list: incList })) : null,
          costBox,
          maxed
            ? this.el('span', { style: 'color:#81c784;font-weight:800;font-size:14px;' }, [this.uiIcon('iconCheck', 14), tr('common.maxLevel')])
            : conflictName
              ? this.el('button', { class: 'btn btn-stone btn-sm', disabled: 'disabled' }, tr('common.incompatible'))
              : tierLocked
                ? this.el('button', { class: 'btn btn-stone btn-sm', disabled: 'disabled' }, tr('ench.reqTable', { lvl: ench.reqTier }))
                : slotsFull
                  ? this.el('button', { class: 'btn btn-stone btn-sm', disabled: 'disabled' }, tr('ench.slotsFullBtn', { cur: usedSlots, max: maxSlots }))
                  : this.el('button', {
                      class: can ? 'btn btn-green btn-sm' : 'btn btn-stone btn-sm',
                      disabled: can ? null : 'disabled',
                      onclick: () => { if (g.enchantItem(tKind, tId, ench.id)) this.renderModal(); }
                    }, tr('ench.enchantTo', { lvl: lvl + 1 }))
        ]));
      });
      body.appendChild(grid);
    }

    makeShrineThumb(spriteKey, fallbackIcon = 'ancient_fragment', size = 40) {
      const assets = Balaclava.Assets;
      const img = assets && assets.extraImages && assets.extraImages[spriteKey];
      if (!img || !img.complete || img.width <= 0) {
        return this.itemIcon(fallbackIcon, size);
      }
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      c.className = 'pixel-img';
      c.style.width = size + 'px';
      c.style.height = size + 'px';
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const frameCounts = { altar_ritual: 6, healing_fountain: 4, altar_shrine: 4 };
      let sw = img.width;
      const sh = img.height;
      if (frameCounts[spriteKey]) sw = Math.max(1, Math.floor(img.width / frameCounts[spriteKey]));
      else if (img.width >= img.height * 2 && img.height > 0) sw = img.height;
      const aspect = sw / Math.max(1, sh);
      let dw = size - 4;
      let dh = dw / aspect;
      if (dh > size - 4) { dh = size - 4; dw = dh * aspect; }
      ctx.drawImage(img, 0, 0, sw, sh, (size - dw) / 2, (size - dh) / 2, dw, dh);
      return c;
    }

    getEncyclopediaTabDefs(g) {
      const totalRelics = Object.keys(Balaclava.PERMANENT_RELICS || {}).length;
      const foundRelics = g.encyclopedia && g.encyclopedia.relics ? g.encyclopedia.relics.size : (g.permanentRelics || []).length;
      const totalEnchants = Object.keys(Balaclava.TOOL_ENCHANTS || {}).length + Object.keys(Balaclava.ARMOR_ENCHANTS || {}).length;
      const foundEnchants = g.encyclopedia && g.encyclopedia.enchants ? g.encyclopedia.enchants.size : 0;
      const totalAltars = Object.keys(Balaclava.ALTAR_DEFS || {}).length + Object.keys(Balaclava.EASTER_EGG_DEFS || {}).length;
      const foundAltars = g.encyclopedia && g.encyclopedia.altars ? g.encyclopedia.altars.size : 0;
      return [
        ['items', tr('enc.tabItems', { cur: g.encyclopedia.items.size, tot: Object.keys(Balaclava.ITEMS).length })],
        ['enemies', tr('enc.tabEnemies', { cur: g.encyclopedia.enemies.size, tot: Object.keys(Balaclava.ENEMY_DEFS).length })],
        ['buildings', tr('enc.tabBuildings', { cur: g.encyclopedia.buildings.size, tot: Object.keys(Balaclava.BUILDINGS).length })],
        ['relics', tr('enc.tabRelics', { cur: foundRelics, tot: totalRelics })],
        ['enchants', tr('enc.tabEnchants', { cur: foundEnchants, tot: totalEnchants })],
        ['altars', tr('enc.tabAltars', { cur: foundAltars, tot: totalAltars })],
        ['lore', tr('enc.tabLore')]
      ];
    }

    renderEncyclopediaTabs(body) {
      const g = this.game;
      const tabs = this.el('div', { class: 'tab-row' });
      this.getEncyclopediaTabDefs(g).forEach(([id, lbl]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.encycFilter === id ? ' active' : ''),
          onclick: () => { this.encycFilter = id; this.renderModal(); }
        }, lbl));
      });
      body.appendChild(tabs);
    }

    renderEncyclopediaExtra(body, filter) {
      const g = this.game;
      const grid = this.el('div', { class: 'grid-cards' });

      if (filter === 'relics') {
        const relics = Object.values(Balaclava.PERMANENT_RELICS || {});
        const ownedSet = new Set([...(g.permanentRelics || []), ...(g.encyclopedia && g.encyclopedia.relics ? Array.from(g.encyclopedia.relics) : [])]);
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;' }, [
          this.el('span', { style: 'font-size:14px;' }, tr('enc.relicsDesc')),
          this.el('strong', { style: 'font-size:14px;color:#ffe8a3;' }, tr('enc.obtainedCount', { cur: ownedSet.size, tot: relics.length }))
        ]));
        relics.forEach(rel => {
          const found = ownedSet.has(rel.id);
          const isSec = !!rel.isSecret || !rel.bossName;
          const bName = (rel.biome && BIOMES[rel.biome] && BIOMES[rel.biome].name) || rel.biome || '';
          const metaLine = isSec
            ? tr('enc.secretOrigin')
            : tr('enc.bossOrigin', { boss: rel.bossName || tr('hud.guardianDefault'), biome: bName });
          grid.appendChild(this.el('div', { class: 'card' + (found ? ' selected' : ''), style: found ? '' : 'opacity:0.8;' }, [
            this.el('div', { class: 'card-head' }, [
              this.itemIcon(rel.icon || 'relic_heart', 36),
              this.el('div', {}, [
                this.el('strong', { style: `color:${found ? (rel.color || '#ffd54f') : '#d7c5af'};font-size:16px;` }, found || !isSec ? rel.name : tr('enc.hiddenRelic')),
                this.el('div', { style: 'font-size:14px;color:#d6e9f8;line-height:1.45;' }, metaLine)
              ]),
              this.el('span', { class: 'rarity-tag', style: found ? 'background:#285432;color:#c8f7c5;margin-left:auto;' : 'background:#2b314d;color:#c7d0e0;margin-left:auto;' }, found ? tr('enc.obtainedTag') : tr('enc.undiscTag'))
            ]),
            this.el('p', { style: 'font-size:14px;color:#f5ece0;margin:6px 0 0;line-height:1.4;' }, found || !isSec ? rel.desc : tr('enc.hiddenRelicHint'))
          ]));
        });
      } else if (filter === 'enchants') {
        const allEnch = [
          ...Object.values(Balaclava.TOOL_ENCHANTS || {}),
          ...Object.values(Balaclava.ARMOR_ENCHANTS || {})
        ];
        const discSet = g.encyclopedia && g.encyclopedia.enchants ? g.encyclopedia.enchants : new Set();
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;' }, [
          this.el('span', { style: 'font-size:14px;' }, tr('enc.enchDesc')),
          this.el('strong', { style: 'font-size:14px;color:#ffe8a3;' }, tr('enc.inscribedCount', { cur: discSet.size, tot: allEnch.length }))
        ]));
        allEnch.forEach(ench => {
          const found = discSet.has(ench.id);
          const costItems = ench.costBase && ench.costBase.items
            ? Object.entries(ench.costBase.items).map(([k, v]) => `${v}x ${(Balaclava.ITEMS[k] && Balaclava.ITEMS[k].name) || k}`).join(', ')
            : '';
          grid.appendChild(this.el('div', { class: 'card' + (found ? ' selected' : ''), style: found ? '' : 'opacity:0.84;' }, [
            this.el('div', { class: 'card-head' }, [
              this.itemIcon(ench.icon || 'magic_crystal', 34),
              this.el('div', {}, [
                this.el('strong', { style: `color:${ench.color || '#ffd54f'};font-size:16px;` }, ench.name),
                this.el('div', { style: 'font-size:14px;color:#d6e9f8;line-height:1.45;' }, `${ench.target === 'tool' ? tr('ench.typeTool') : tr('ench.typeArmor')} · ${tr('common.maxLevelShort')}.${ench.maxLevel}`)
              ]),
              this.el('span', { class: 'rarity-tag', style: found ? 'background:#2e5b3f;color:#c8f7c5;margin-left:auto;' : 'background:#2b314d;color:#c7d0e0;margin-left:auto;' }, found ? tr('enc.inscribedTag') : tr('enc.catalogedTag'))
            ]),
            this.el('p', { style: 'font-size:15px;color:#f8f1e4;margin:6px 0 4px;line-height:1.5;' }, ench.desc),
            this.el('div', { style: 'font-size:14px;color:#ffe082;line-height:1.48;' }, tr('enc.baseCost', { coins: ench.costBase ? ench.costBase.coins : 0, items: costItems ? ` + ${costItems}` : '' }))
          ]));
        });
      } else if (filter === 'altars') {
        const altars = Object.values(Balaclava.ALTAR_DEFS || {}).map(a => Object.assign({ kindLabel: tr('enc.kindAltar'), biome: null }, a));
        const secrets = Object.values(Balaclava.EASTER_EGG_DEFS || {}).map(s => Object.assign({ kindLabel: tr('enc.kindSecret') }, s));
        const entries = [...altars, ...secrets];
        const discSet = g.encyclopedia && g.encyclopedia.altars ? g.encyclopedia.altars : new Set();
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;' }, [
          this.el('span', { style: 'font-size:14px;' }, tr('enc.altarsDesc')),
          this.el('strong', { style: 'font-size:14px;color:#ffe8a3;' }, tr('enc.discAltarsCount', { cur: discSet.size, tot: entries.length }))
        ]));
        entries.forEach(ent => {
          const found = discSet.has(ent.id);
          const subMeta = ent.biome ? `${ent.kindLabel} · ${(BIOMES[ent.biome] && BIOMES[ent.biome].name) || ent.biome}` : `${ent.kindLabel}${ent.cooldown ? tr('enc.rechargeSec', { sec: ent.cooldown }) : ''}`;
          grid.appendChild(this.el('div', { class: 'card' + (found ? ' selected' : ''), style: found ? '' : 'opacity:0.84;' }, [
            this.el('div', { class: 'card-head' }, [
              this.makeShrineThumb(ent.spriteKey, 'ancient_fragment', 42),
              this.el('div', {}, [
                this.el('strong', { style: `color:${ent.color || '#80deea'};font-size:16px;` }, ent.name),
                this.el('div', { style: 'font-size:14px;color:#d6e9f8;line-height:1.45;' }, subMeta)
              ]),
              this.el('span', { class: 'rarity-tag', style: found ? 'background:#285432;color:#c8f7c5;margin-left:auto;' : 'background:#2b314d;color:#c7d0e0;margin-left:auto;' }, found ? tr('enc.activatedTag') : tr('enc.toFindTag'))
            ]),
            this.el('p', { style: 'font-size:15px;color:#f8f1e4;margin:6px 0 4px;line-height:1.5;' }, ent.desc || ent.hint || ''),
            ent.effectDetail ? this.el('div', { style: 'font-size:14px;color:#80deea;font-weight:700;line-height:1.48;' }, tr('enc.effectLine', { detail: ent.effectDetail, dur: ent.durationText ? ` · ${ent.durationText}` : '' })) : null
          ]));
        });
      } else if (filter === 'lore') {
        const loreData = Balaclava.LORE || { chronicle: [], biomes: [] };
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;' }, [
          this.el('span', { style: 'font-size:14px;font-weight:600;' }, tr('enc.loreDesc')),
          this.el('strong', { style: 'font-size:14px;color:#ffe8a3;' }, tr('enc.loreCounts', { ch: loreData.chronicle.length, bm: loreData.biomes.length }))
        ]));
        (loreData.chronicle || []).forEach(ch => {
          grid.appendChild(this.el('div', { class: 'card selected' }, [
            this.el('div', { class: 'card-head' }, [
              this.itemIcon('ancient_fragment', 36),
              this.el('div', {}, [
                this.el('strong', { style: 'color:#ffe082;font-size:16px;' }, ch.title),
                this.el('div', { style: 'font-size:14px;color:#d6e9f8;line-height:1.45;' }, ch.era)
              ])
            ]),
            this.el('div', { style: 'font-size:14px;color:#ffd54f;font-weight:600;margin-top:4px;' }, ch.summary),
            this.el('p', { style: 'font-size:14px;color:#f5ece0;margin:6px 0 0;line-height:1.48;' }, ch.body)
          ]));
        });
        body.appendChild(grid);
        body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin:14px 0 10px;' }, [
          this.el('strong', { style: 'font-size:16px;color:#ffe8a3;' }, tr('enc.biomesAtlasTitle'))
        ]));
        const bGrid = this.el('div', { class: 'grid-cards' });
        (loreData.biomes || []).forEach(bm => {
          bGrid.appendChild(this.el('div', { class: 'card' }, [
            this.el('div', { class: 'card-head' }, [
              this.biomeIcon(bm.id, 30),
              this.el('div', {}, [
                this.el('strong', { style: 'color:#fff3d6;font-size:16px;' }, bm.name),
                this.el('div', { style: 'font-size:14px;color:#ffd54f;font-weight:600;line-height:1.45;' }, bm.minerals)
              ])
            ]),
            this.el('p', { style: 'font-size:14px;color:#e8dccb;margin:6px 0 0;line-height:1.45;' }, bm.desc)
          ]));
        });
        body.appendChild(bGrid);
        return;
      }

      body.appendChild(grid);
    }

    renderEncyclopedia(body) {
      const g = this.game;
      if (typeof g.syncEncyclopedia === 'function') g.syncEncyclopedia();
      if (['relics', 'enchants', 'altars', 'lore'].includes(this.encycFilter)) {
        this.renderEncyclopediaTabs(body);
        this.renderEncyclopediaExtra(body, this.encycFilter);
        return;
      }
      const tabs = this.el('div', { class: 'tab-row' });
      this.getEncyclopediaTabDefs(g).forEach(([id, lbl]) => {
        tabs.appendChild(this.el('button', {
          class: 'tab-btn' + (this.encycFilter === id ? ' active' : ''),
          onclick: () => { this.encycFilter = id; this.renderModal(); }
        }, lbl));
      });
      body.appendChild(tabs);

      const grid = this.el('div', { class: 'grid-cards' });
      const applyEncycSearch = (q) => {
        this.encycSearch = q;
        const needle = (q || '').trim().toLowerCase();
        Array.from(grid.children).forEach(ch => {
          const txt = (ch.textContent || '').toLowerCase();
          ch.style.display = (!needle || txt.includes(needle)) ? '' : 'none';
        });
      };
      body.appendChild(this._buildSearchBar(this.encycSearch, tr('enc.searchPlaceholder'), applyEncycSearch));
      if (this.encycFilter === 'items') {
        Object.values(Balaclava.ITEMS).forEach(it => {
          const found = g.encyclopedia.items.has(it.id);
          grid.appendChild(this.el('div', { class: 'card', style: found ? '' : 'opacity:0.5' }, [
            this.el('div', { class: 'card-head' }, [
              this.itemIcon(it.icon, 28),
              this.el('strong', {}, found ? it.name : '???')
            ]),
            this.el('div', { style: 'font-size:14px;color:#dce8f5;line-height:1.48;' }, found ? it.source : tr('enc.itemHint'))
          ]));
        });
      } else if (this.encycFilter === 'enemies') {
        Object.values(Balaclava.ENEMY_DEFS).forEach(en => {
          const found = g.encyclopedia.enemies.has(en.id);
          grid.appendChild(this.el('div', { class: 'card', style: found ? '' : 'opacity:0.55' }, [
            this.el('div', { class: 'card-head' }, [
              this.makeEnemyThumb(en, 40),
              this.el('div', {}, [
                this.el('strong', { style: `color:${en.color || '#ffd54f'}` }, found ? en.name : tr('enc.unknownCreature')),
                this.el('div', { style: 'font-size:14px;color:#dce8f5;line-height:1.45;' }, en.nocturnal ? tr('enc.nocturnalCreature') : BIOMES[en.biome].name)
              ])
            ]),
            this.el('div', { style: 'font-size:14px;color:#efe8db;line-height:1.48;' }, found ? tr('enc.enemyStats', { hp: en.hp, dmg: en.dmg, coins: en.coins }) : tr('enc.enemyHint'))
          ]));
        });
      } else {
        Object.values(Balaclava.BUILDINGS).forEach(b => {
          const found = g.encyclopedia.buildings.has(b.id);
          grid.appendChild(this.el('div', { class: 'card', style: found ? '' : 'opacity:0.5' }, [
            this.el('div', { class: 'card-head' }, [
              this.makeBuildingThumb(b, 36),
              this.el('strong', {}, found ? b.name : tr('enc.unbuiltBlueprint'))
            ]),
            this.el('div', { style: 'font-size:14px;color:#dce8f5;line-height:1.48;' }, found ? b.desc : tr('enc.buildingHint'))
          ]));
        });
      }
      if (this.encycSearch) applyEncycSearch(this.encycSearch);
      body.appendChild(grid);
    }

    renderSettings(body) {
      this.renderPauseMenu(body);
    }

    _syncPauseModalClasses(isSettings) {
      const mbox = document.getElementById('modal-box');
      if (!mbox) return;
      mbox.classList.add('pause-pixel-modal');
      mbox.classList.toggle('pause-root-compact', !isSettings);
      mbox.classList.toggle('pause-settings-compact', !!isSettings);
      const mtitle = document.getElementById('modal-title');
      if (mtitle) mtitle.textContent = isSettings ? tr('settings.title') : tr('pause.title');
    }

    _buildAudioCard() {
      const masterPct = Math.round((Balaclava.Audio.masterVolume ?? 1.0) * 100);
      const musicPct = Math.round(Balaclava.Audio.musicVolume * 100);
      const sfxPct = Math.round(Balaclava.Audio.sfxVolume * 100);
      const mastVal = this.el('span', { class: 'compact-audio-pct' }, `${masterPct}%`);
      const mVal = this.el('span', { class: 'compact-audio-pct' }, `${musicPct}%`);
      const sVal = this.el('span', { class: 'compact-audio-pct' }, `${sfxPct}%`);
      const mastFill = this.el('div', { class: 'pixel-slider-fill', style: `width:${masterPct}%` });
      const mFill = this.el('div', { class: 'pixel-slider-fill', style: `width:${musicPct}%` });
      const sFill = this.el('div', { class: 'pixel-slider-fill', style: `width:${sfxPct}%` });
      return this.el('div', { class: 'card pause-audio-card' }, [
        this.el('div', { class: 'settings-section-head' }, tr('settings.audioHeader')),
        this.el('div', { class: 'compact-audio-row' }, [
          this.el('span', { class: 'compact-audio-lbl' }, tr('settings.master')),
          this.el('div', { class: 'pixel-range-wrap' }, [
            this.el('div', { class: 'pixel-slider-track' }, [mastFill]),
            this.el('input', {
              type: 'range', class: 'pixel-range', min: 0, max: 1, step: 0.05, value: Balaclava.Audio.masterVolume ?? 1.0,
              oninput: (e) => {
                const v = Number(e.target.value);
                if (typeof Balaclava.Audio.setMasterVolume === 'function') {
                  Balaclava.Audio.setMasterVolume(v);
                } else {
                  Balaclava.Audio.masterVolume = v;
                  Balaclava.Audio.applyVolumes();
                  Balaclava.Audio.savePrefs();
                }
                const pct = Math.round(v * 100);
                mastVal.textContent = `${pct}%`;
                mastFill.style.width = `${pct}%`;
              }
            })
          ]),
          mastVal
        ]),
        this.el('div', { class: 'compact-audio-row' }, [
          this.el('span', { class: 'compact-audio-lbl' }, tr('settings.music')),
          this.el('div', { class: 'pixel-range-wrap' }, [
            this.el('div', { class: 'pixel-slider-track' }, [mFill]),
            this.el('input', {
              type: 'range', class: 'pixel-range', min: 0, max: 1, step: 0.05, value: Balaclava.Audio.musicVolume,
              oninput: (e) => {
                const v = Number(e.target.value);
                Balaclava.Audio.setMusicVolume(v);
                const pct = Math.round(v * 100);
                mVal.textContent = `${pct}%`;
                mFill.style.width = `${pct}%`;
              }
            })
          ]),
          mVal
        ]),
        this.el('div', { class: 'compact-audio-row' }, [
          this.el('span', { class: 'compact-audio-lbl' }, tr('settings.sfx')),
          this.el('div', { class: 'pixel-range-wrap' }, [
            this.el('div', { class: 'pixel-slider-track' }, [sFill]),
            this.el('input', {
              type: 'range', class: 'pixel-range', min: 0, max: 1, step: 0.05, value: Balaclava.Audio.sfxVolume,
              oninput: (e) => {
                const v = Number(e.target.value);
                Balaclava.Audio.setSfxVolume(v);
                const pct = Math.round(v * 100);
                sVal.textContent = `${pct}%`;
                sFill.style.width = `${pct}%`;
              }
            })
          ]),
          sVal
        ]),
        this.el('div', { class: 'audio-mute-grid' }, [
          this.el('button', {
            id: 'btn-toggle-music-mute',
            class: Balaclava.Audio.musicMuted ? 'btn btn-danger btn-sm' : 'btn btn-green btn-sm',
            onclick: () => {
              Balaclava.Audio.setMusicMuted(!Balaclava.Audio.musicMuted);
              this.renderModal();
            }
          }, tr('settings.musicBtn', { state: Balaclava.Audio.musicMuted ? tr('common.off') : tr('common.on') })),
          this.el('button', {
            id: 'btn-toggle-sfx-mute',
            class: Balaclava.Audio.sfxMuted ? 'btn btn-danger btn-sm' : 'btn btn-green btn-sm',
            onclick: () => {
              Balaclava.Audio.setSfxMuted(!Balaclava.Audio.sfxMuted);
              this.renderModal();
            }
          }, tr('settings.sfxBtn', { state: Balaclava.Audio.sfxMuted ? tr('common.off') : tr('common.on') })),
          this.el('button', {
            id: 'btn-toggle-master-mute',
            class: Balaclava.Audio.muted ? 'btn btn-green btn-sm' : 'btn btn-primary btn-sm',
            style: 'display:inline-flex;align-items:center;justify-content:center;gap:6px;',
            onclick: () => {
              Balaclava.Audio.setMuted(!Balaclava.Audio.muted);
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.Audio.muted ? Balaclava.UI_URLS.iconMute : Balaclava.UI_URLS.iconSound), width: 16, height: 16, alt: '' }),
            Balaclava.Audio.muted ? tr('settings.unmuteAll') : tr('settings.muteAll')
          ])
        ]),
        (() => {
          const themeOptions = (typeof Balaclava.Audio.getAvailableThemes === 'function')
            ? Balaclava.Audio.getAvailableThemes()
            : [
                { id: 'adventure', key: 'settings.musicThemeAdv', descKey: 'settings.musicThemeAdvDesc' },
                { id: 'chill', key: 'settings.musicThemeChill', descKey: 'settings.musicThemeChillDesc' },
                { id: 'lofi', key: 'settings.musicThemeLofi', descKey: 'settings.musicThemeLofiDesc' },
                { id: 'meadow', key: 'settings.musicThemeMeadow', descKey: 'settings.musicThemeMeadowDesc' }
              ];

          const curThemeId = (typeof Balaclava.Audio.getMusicTheme === 'function')
            ? Balaclava.Audio.getMusicTheme()
            : (Balaclava.Audio.musicTheme || 'adventure');

          let themeIdx = themeOptions.findIndex(t => t.id === curThemeId);
          if (themeIdx < 0) themeIdx = 0;
          const curTheme = themeOptions[themeIdx];

          const setMusicThemeAt = (idx) => {
            const nextIdx = (idx + themeOptions.length) % themeOptions.length;
            const nextTheme = themeOptions[nextIdx];
            if (typeof Balaclava.Audio.setMusicTheme === 'function') {
              Balaclava.Audio.setMusicTheme(nextTheme.id);
            } else {
              Balaclava.Audio.musicTheme = nextTheme.id;
              Balaclava.Audio.savePrefs();
              Balaclava.Audio.startMusic(true);
            }
            this.renderModal();
          };

          return this.el('div', { style: 'margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);' }, [
            this.el('div', { class: 'water-carousel-row compact-speed' }, [
              this.el('span', { class: 'carousel-row-label' }, tr('settings.musicThemeHeader')),
              this.el('div', { class: 'carousel-controls' }, [
                this.el('button', {
                  id: 'btn-music-theme-prev',
                  type: 'button',
                  class: 'arrow-pick-btn',
                  title: tr('settings.prevOption'),
                  onclick: () => setMusicThemeAt(themeIdx - 1)
                }, [
                  this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
                ]),
                this.el('div', {
                  class: 'water-preview-box',
                  style: 'min-width: 175px; cursor: pointer;',
                  title: tr('settings.nextOption'),
                  onclick: () => setMusicThemeAt(themeIdx + 1)
                }, [
                  this.el('div', { class: 'water-preview-meta' }, [
                    this.el('span', { class: 'water-preview-name' }, tr(curTheme.key)),
                    this.el('span', { class: 'water-preview-idx' }, `${themeIdx + 1}/${themeOptions.length}`)
                  ])
                ]),
                this.el('button', {
                  id: 'btn-music-theme-next',
                  type: 'button',
                  class: 'arrow-pick-btn',
                  title: tr('settings.nextOption'),
                  onclick: () => setMusicThemeAt(themeIdx + 1)
                }, [
                  this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
                ])
              ])
            ]),
            this.el('div', {
              class: 'settings-hint',
              style: 'text-align: right; margin-top: 5px; font-size: 13px; color: #a8c2db; font-style: italic;'
            }, tr(curTheme.descKey))
          ]);
        })()
      ]);
    }

    _buildControlsCard() {
      const grid = this.el('div', { class: 'keybinds-grid' });
      KEYBIND_DEFS.forEach(def => {
        const waiting = this.rebindingAction === def.id;
        grid.appendChild(this.el('div', { class: 'keybind-row' }, [
          this.el('span', { class: 'keybind-name' }, tr(def.key)),
          this.el('button', {
            type: 'button',
            'data-rebind-action': def.id,
            class: 'keybind-btn' + (waiting ? ' waiting' : ''),
            onclick: () => {
              this.rebindingAction = waiting ? null : def.id;
              this.renderModal();
            }
          }, waiting ? tr('settings.pressKey') : this.getKeyLabel(def.id))
        ]));
      });

      return this.el('div', { class: 'card keybinds-card' }, [
        this.el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;' }, [
          this.el('strong', { class: 'settings-section-head', style: 'margin:0;' }, tr('settings.controlsHeader')),
          this.el('div', { style: 'display:flex;gap:6px;' }, [
            this.el('button', {
              id: 'btn-reset-tutorial',
              type: 'button',
              class: 'btn btn-gold btn-sm',
              title: 'Reiniciar tutorial guiado',
              onclick: () => {
                if (this.game && this.game.tutorialSys) {
                  this.game.tutorialSys.reset(this.game);
                  this.updateHUD(true);
                  this.renderModal();
                }
              }
            }, 'Reiniciar Tutorial'),
            this.el('button', {
              id: 'btn-reset-keybinds',
              type: 'button',
              class: 'btn btn-danger btn-sm',
              onclick: () => {
                this.resetKeybinds();
                this.renderModal();
              }
            }, [this.uiIcon('iconReset', 15), tr('settings.resetControls')])
          ])
        ]),
        this.el('div', { class: 'settings-hint' }, tr('settings.controlsTip')),
        grid
      ]);
    }

    _buildVisualSettingsCard() {
      const g = this.game;
      g.settings = g.settings || {
        screenShake: true, waterAnim: true, waterStyle: 'clasico', waterSpeed: 'normal',
        treeSway: true, particles: true, floatingText: true, showHitbox: true,
        lang: Balaclava.I18n ? Balaclava.I18n.getLanguage() : 'en',
        uiScale: this.getUiScale()
      };
      if (!g.settings.waterStyle) g.settings.waterStyle = 'clasico';
      if (!g.settings.waterSpeed) g.settings.waterSpeed = 'normal';

      const saveSettings = () => {
        if (g.started && g.saveSys) g.saveSys.save(g, g.currentSlot || 1, true);
      };

      const langs = (Balaclava.I18n && Balaclava.I18n.SUPPORTED_LANGS) || ['en', 'es'];
      const curLang = Balaclava.I18n ? Balaclava.I18n.getLanguage() : 'en';
      let langIdx = langs.indexOf(curLang);
      if (langIdx < 0) langIdx = 0;
      const setLangAt = (idx) => {
        const nextLang = langs[(idx + langs.length) % langs.length];
        g.settings.lang = nextLang;
        if (Balaclava.I18n) Balaclava.I18n.setLanguage(nextLang);
        saveSettings();
      };
      const langCarousel = this.el('div', { class: 'water-carousel-row compact-speed' }, [
        this.el('span', { class: 'carousel-row-label' }, tr('settings.language')),
        this.el('div', { class: 'carousel-controls' }, [
          this.el('button', {
            id: 'btn-lang-prev',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.prevOption'),
            onclick: () => setLangAt(langIdx - 1)
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
          ]),
          this.el('span', { id: 'settings-lang-readout', class: 'water-speed-value' }, curLang === 'es' ? tr('lang.es') : tr('lang.en')),
          this.el('button', {
            id: 'btn-lang-next',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.nextOption'),
            onclick: () => setLangAt(langIdx + 1)
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
          ])
        ])
      ]);

      const curScale = this.getUiScale();
      let scaleIdx = UI_SCALES.indexOf(curScale);
      if (scaleIdx < 0) scaleIdx = UI_SCALES.indexOf(1);
      const scaleCarousel = this.el('div', { class: 'water-carousel-row compact-speed' }, [
        this.el('span', { class: 'carousel-row-label' }, tr('settings.uiScale')),
        this.el('div', { class: 'carousel-controls' }, [
          this.el('button', {
            id: 'btn-ui-scale-prev',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.prevOption'),
            disabled: scaleIdx <= 0 ? 'disabled' : null,
            onclick: () => {
              if (scaleIdx <= 0) return;
              this.applyUiScale(UI_SCALES[scaleIdx - 1], { persist: true });
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
          ]),
          this.el('span', { id: 'ui-scale-readout', class: 'water-speed-value' }, `${curScale}x`),
          this.el('button', {
            id: 'btn-ui-scale-next',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.nextOption'),
            disabled: scaleIdx >= UI_SCALES.length - 1 ? 'disabled' : null,
            onclick: () => {
              if (scaleIdx >= UI_SCALES.length - 1) return;
              this.applyUiScale(UI_SCALES[scaleIdx + 1], { persist: true });
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
          ])
        ])
      ]);

      const isFullscreen = Boolean(document.fullscreenElement);
      const toggleDisplayMode = () => {
        try {
          if (document.fullscreenElement) {
            if (document.exitFullscreen) {
              const res = document.exitFullscreen();
              if (res && typeof res.catch === 'function') {
                res.catch(() => g.toast && g.toast(tr('settings.fullscreenError'), 'warn'));
              }
            }
          } else if (document.documentElement && document.documentElement.requestFullscreen) {
            const res = document.documentElement.requestFullscreen();
            if (res && typeof res.catch === 'function') {
              res.catch(() => g.toast && g.toast(tr('settings.fullscreenError'), 'warn'));
            }
          } else if (g.toast) {
            g.toast(tr('settings.fullscreenError'), 'warn');
          }
        } catch (_) {
          if (g.toast) g.toast(tr('settings.fullscreenError'), 'warn');
        }
        saveSettings();
        this.renderModal();
      };
      const displayCarousel = this.el('div', { class: 'water-carousel-row compact-speed' }, [
        this.el('span', { class: 'carousel-row-label' }, tr('settings.displayMode')),
        this.el('div', { class: 'carousel-controls' }, [
          this.el('button', {
            id: 'btn-display-mode-prev',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.prevOption'),
            onclick: toggleDisplayMode
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
          ]),
          this.el('span', { id: 'display-mode-readout', class: 'water-speed-value' }, isFullscreen ? tr('settings.fullscreen') : tr('settings.windowed')),
          this.el('button', {
            id: 'btn-display-mode-next',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.nextOption'),
            onclick: toggleDisplayMode
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
          ])
        ])
      ]);

      const waterOpts = [
        { id: 'clasico', label: tr('settings.waterClassic'), img: Balaclava.UI_URLS.waterClasico },
        { id: 'profundo', label: tr('settings.waterDeep'), img: Balaclava.UI_URLS.waterProfundo },
        { id: 'esmeralda', label: tr('settings.waterEmerald'), img: Balaclava.UI_URLS.waterEsmeralda },
        { id: 'abisal', label: tr('settings.waterAbyssal'), img: Balaclava.UI_URLS.waterAbisal }
      ];
      let waterIdx = waterOpts.findIndex(o => o.id === g.settings.waterStyle);
      if (waterIdx < 0) waterIdx = 0;
      const curWater = waterOpts[waterIdx];

      const waterCarousel = this.el('div', { class: 'water-carousel-row' }, [
        this.el('span', { class: 'carousel-row-label' }, tr('settings.waterStyle')),
        this.el('div', { class: 'carousel-controls' }, [
          this.el('button', {
            id: 'btn-water-style-prev',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.prevOption'),
            onclick: () => {
              const nextIdx = (waterIdx - 1 + waterOpts.length) % waterOpts.length;
              g.settings.waterStyle = waterOpts[nextIdx].id;
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
          ]),
          this.el('div', { class: 'water-preview-box' }, [
            this.el('div', { class: 'water-preview-meta' }, [
              this.el('span', { class: 'water-preview-name' }, curWater.label),
              this.el('span', { class: 'water-preview-idx' }, `${waterIdx + 1}/${waterOpts.length}`)
            ])
          ]),
          this.el('button', {
            id: 'btn-water-style-next',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.nextOption'),
            onclick: () => {
              const nextIdx = (waterIdx + 1) % waterOpts.length;
              g.settings.waterStyle = waterOpts[nextIdx].id;
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
          ])
        ])
      ]);

      const speedOpts = [
        { id: 'lenta', label: tr('settings.waveSlow') },
        { id: 'normal', label: tr('settings.waveNormal') },
        { id: 'rapida', label: tr('settings.waveFast') },
        { id: 'tormenta', label: tr('settings.waveStorm') }
      ];
      let speedIdx = speedOpts.findIndex(o => o.id === g.settings.waterSpeed);
      if (speedIdx < 0) speedIdx = 1;
      const curSpeed = speedOpts[speedIdx];

      const speedCarousel = this.el('div', { class: 'water-carousel-row compact-speed' }, [
        this.el('span', { class: 'carousel-row-label' }, tr('settings.waves')),
        this.el('div', { class: 'carousel-controls' }, [
          this.el('button', {
            id: 'btn-water-speed-prev',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.prevOption'),
            onclick: () => {
              const nextIdx = (speedIdx - 1 + speedOpts.length) % speedOpts.length;
              g.settings.waterSpeed = speedOpts[nextIdx].id;
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowLeft), width: 16, height: 16, alt: '<' })
          ]),
          this.el('span', { class: 'water-speed-value' }, curSpeed.label),
          this.el('button', {
            id: 'btn-water-speed-next',
            type: 'button',
            class: 'arrow-pick-btn',
            title: tr('settings.nextOption'),
            onclick: () => {
              const nextIdx = (speedIdx + 1) % speedOpts.length;
              g.settings.waterSpeed = speedOpts[nextIdx].id;
              saveSettings();
              this.renderModal();
            }
          }, [
            this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.arrowRight), width: 16, height: 16, alt: '>' })
          ])
        ])
      ]);

      const items = [
        ['screenShake', tr('settings.screenShake')],
        ['waterAnim', tr('settings.waterAnim')],
        ['treeSway', tr('settings.treeSway')],
        ['particles', tr('settings.particles')],
        ['floatingText', tr('settings.floatingText')],
        ['showHitbox', tr('settings.showHitbox')]
      ];
      const grid = this.el('div', { class: 'settings-toggle-grid' });
      items.forEach(([key, label]) => {
        const on = g.settings[key] !== false;
        grid.appendChild(this.el('button', {
          type: 'button',
          class: 'setting-chip',
          onclick: () => {
            g.settings[key] = !on;
            saveSettings();
            this.renderModal();
          }
        }, [
          this.el('span', {}, label),
          this.el('img', {
            class: 'setting-toggle-img',
            src: on ? Balaclava.UI_URLS.toggleOn : Balaclava.UI_URLS.toggleOff,
            alt: on ? tr('common.on') : tr('common.off')
          })
        ]));
      });

      return this.el('div', { class: 'card pause-audio-card' }, [
        this.el('div', { class: 'settings-section-head' }, tr('settings.visualHeader')),
        langCarousel,
        scaleCarousel,
        displayCarousel,
        waterCarousel,
        speedCarousel,
        grid
      ]);
    }

    _buildSettingsView(isTitle) {
      this._syncPauseModalClasses(true);
      const tab = ['sonido', 'visuales', 'controles'].includes(this.settingsTab) ? this.settingsTab : 'sonido';
      this.settingsTab = tab;

      const tabsBar = this.el('div', { class: 'settings-tabs-bar' }, [
        this.el('button', {
          id: 'btn-tab-sonido',
          type: 'button',
          class: tab === 'sonido' ? 'btn btn-gold settings-tab-btn active' : 'btn btn-stone settings-tab-btn',
          onclick: () => { this.settingsTab = 'sonido'; this.renderModal(); }
        }, tr('settings.tabSound')),
        this.el('button', {
          id: 'btn-tab-visuales',
          type: 'button',
          class: tab === 'visuales' ? 'btn btn-gold settings-tab-btn active' : 'btn btn-stone settings-tab-btn',
          onclick: () => { this.settingsTab = 'visuales'; this.renderModal(); }
        }, tr('settings.tabVisuals')),
        this.el('button', {
          id: 'btn-tab-controles',
          type: 'button',
          class: tab === 'controles' ? 'btn btn-gold settings-tab-btn active' : 'btn btn-stone settings-tab-btn',
          onclick: () => { this.settingsTab = 'controles'; this.renderModal(); }
        }, tr('settings.tabControls'))
      ]);

      const tabBody = tab === 'visuales'
        ? this._buildVisualSettingsCard()
        : (tab === 'controles' ? this._buildControlsCard() : this._buildAudioCard());

      return this.el('div', { class: 'pause-stack settings-stack' }, [
        tabsBar,
        tabBody,
        this.el('button', {
          id: 'btn-settings-back',
          type: 'button',
          class: 'btn btn-gold pause-big-btn',
          onclick: () => {
            if (isTitle) {
              this.closeModal();
            } else {
              this.pauseView = 'root';
              this.renderModal();
            }
          }
        }, tr('common.back'))
      ]);
    }

    renderTitleAudioSettings(body) {
      body.appendChild(this._buildSettingsView(true));
    }

    renderCreditsModal(body) {
      body.appendChild(this.el('div', { class: 'pause-stack credits-box' }, [
        this.el('div', { class: 'card credits-card' }, [
          this.el('div', { class: 'credits-game-title' }, 'BALACLAVA'),
          this.el('div', { class: 'credits-role' }, tr('credits.developedBy')),
          this.el('div', { class: 'credits-creator' }, tr('credits.creator')),
          this.el('div', { class: 'credits-studio' }, tr('credits.studio')),
          this.el('div', { class: 'credits-music-attr' }, [
            this.el('strong', {}, tr('credits.musicLabel')),
            this.el('span', {}, tr('credits.musicAttribution'))
          ])
        ]),
        this.el('button', {
          id: 'btn-credits-back',
          type: 'button',
          class: 'btn btn-gold pause-big-btn',
          onclick: () => this.closeModal()
        }, tr('common.back'))
      ]));
    }

    renderQuitModal(body, webFallback = false) {
      if (webFallback) {
        body.appendChild(this.el('div', { class: 'pause-stack quit-box' }, [
          this.el('div', { class: 'card quit-card' }, [
            this.el('p', { class: 'quit-msg' }, tr('quit.webFallbackMsg'))
          ]),
          this.el('button', {
            id: 'btn-quit-return-menu',
            type: 'button',
            class: 'btn btn-gold pause-big-btn',
            onclick: () => this.closeModal()
          }, tr('quit.returnMenu'))
        ]));
        return;
      }

      body.appendChild(this.el('div', { class: 'pause-stack quit-box' }, [
        this.el('div', { class: 'card quit-card' }, [
          this.el('p', { class: 'quit-msg' }, tr('quit.confirmMsg'))
        ]),
        this.el('div', { class: 'quit-actions-row' }, [
          this.el('button', {
            id: 'btn-quit-cancel',
            type: 'button',
            class: 'btn btn-stone pause-big-btn',
            onclick: () => this.closeModal()
          }, tr('common.cancel')),
          this.el('button', {
            id: 'btn-quit-confirm',
            type: 'button',
            class: 'btn btn-danger pause-big-btn',
            onclick: () => this.executeQuitGame()
          }, tr('quit.confirmBtn'))
        ])
      ]));
    }

    renderDiscordFallbackModal(body) {
      body.appendChild(this.el('div', { class: 'pause-stack quit-box' }, [
        this.el('div', { class: 'card quit-card' }, [
          this.el('p', { class: 'quit-msg' }, tr('title.discordBlocked', { url: DISCORD_URL })),
          this.el('div', { class: 'discord-link-pill' }, DISCORD_URL)
        ]),
        this.el('div', { class: 'quit-actions-row' }, [
          this.el('a', {
            id: 'btn-discord-open-link',
            href: DISCORD_URL,
            target: '_blank',
            rel: 'noopener noreferrer',
            class: 'btn btn-primary pause-big-btn'
          }, tr('title.discordOpen')),
          this.el('button', {
            id: 'btn-discord-close',
            type: 'button',
            class: 'btn btn-stone pause-big-btn',
            onclick: () => this.closeModal()
          }, tr('common.close'))
        ])
      ]));
    }

    renderPauseMenu(body) {
      if (this.pauseView === 'settings') {
        body.appendChild(this._buildSettingsView(false));
        return;
      }

      this._syncPauseModalClasses(false);
      const g = this.game;
      const dayPhase = g.getDayPhase ? g.getDayPhase() : { label: tr('hud.day') };

      const stack = this.el('div', { class: 'pause-stack pause-root-stack' });
      stack.appendChild(this.el('div', { class: 'parchment-box pause-hero-bar' }, [
        this.el('img', {
          class: 'pixel-img pause-hero-avatar',
          src: encodeURI(Balaclava.UI_URLS.avatarHero),
          width: 44,
          height: 44,
          alt: tr('pause.heroAlt')
        }),
        this.el('div', { class: 'pause-hero-meta' }, [
          this.el('div', { class: 'pause-hero-title' }, tr('pause.slotMeta', {
            slot: g.currentSlot || 1,
            day: g.dayCount || 1,
            phase: dayPhase.label
          })),
          this.el('div', { class: 'pause-stat-row' }, [
            this.el('span', { class: 'pause-stat-chip' }, tr('pause.statsMeta', { level: g.player.level })),
            this.el('span', { class: 'pause-stat-chip' }, `${formatNum(g.coins)} ${tr('common.gold')}`),
            this.el('span', { class: 'pause-stat-chip' }, `${g.unlockedPlots.length} ${tr('common.islands')}`)
          ])
        ])
      ]));

      const skins = Balaclava.SKINS || [];
      const curSkinId = g.player.skinId || (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('balaclava_player_skin')) || 'monk_yellow';
      const curSkin = skins.find(s => s.id === curSkinId) || skins[0] || { name: 'Monje de Túnica Café', role: 'Sabio Espiritual', desc: '' };
      const curIndex = skins.findIndex(s => s.id === curSkin.id);
      const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
      const skinName = (isEn && curSkin.name_en) ? curSkin.name_en : curSkin.name;
      const skinRole = (isEn && curSkin.role_en) ? curSkin.role_en : (curSkin.role || '');
      const skinDesc = (isEn && curSkin.desc_en) ? curSkin.desc_en : (curSkin.desc || '');

      const skinBox = this.el('div', { class: 'parchment-box', style: 'padding:10px 14px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; gap:10px; background:rgba(30,22,14,0.92); border:2px solid #b8860b; border-radius:6px;' }, [
        this.el('div', { style: 'text-align:left; flex:1;' }, [
          this.el('div', { style: 'font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#d4af37; margin-bottom:2px;' }, tr('settings.heroSkinTitle')),
          this.el('div', { style: 'font-size:14px; font-weight:bold; color:#fff; display:flex; align-items:center; gap:6px;' }, [
            this.el('span', { style: 'color:#ffe082;' }, `${curIndex + 1}/${skins.length}`),
            skinName,
            skinRole ? this.el('span', { style: 'font-size:11px; font-weight:normal; color:#81c784; background:rgba(76,175,80,0.18); padding:2px 6px; border-radius:3px;' }, skinRole) : null
          ]),
          this.el('div', { style: 'font-size:11px; color:#c0b090; margin-top:2px;' }, skinDesc)
        ]),
        this.el('div', { style: 'display:flex; gap:6px;' }, [
          this.el('button', {
            type: 'button',
            class: 'btn btn-gold',
            style: 'padding:6px 12px; font-size:14px;',
            title: tr('settings.prevSkin'),
            onclick: () => {
              if (g.cyclePlayerSkin) g.cyclePlayerSkin(-1);
              this.renderModal();
            }
          }, '◄'),
          this.el('button', {
            type: 'button',
            class: 'btn btn-gold',
            style: 'padding:6px 12px; font-size:14px;',
            title: tr('settings.nextSkin'),
            onclick: () => {
              if (g.cyclePlayerSkin) g.cyclePlayerSkin(1);
              this.renderModal();
            }
          }, '►')
        ])
      ]);
      stack.appendChild(skinBox);

      stack.appendChild(this.el('button', {
        id: 'btn-pause-resume',
        type: 'button',
        class: 'btn btn-green pause-big-btn',
        onclick: () => this.closeModal()
      }, [
        this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.iconPlay), width: 18, height: 18, alt: '' }),
        tr('pause.resume')
      ]));

      stack.appendChild(this.el('button', {
        id: 'btn-pause-settings',
        type: 'button',
        class: 'btn btn-gold pause-big-btn',
        onclick: () => {
          this.pauseView = 'settings';
          this.renderModal();
        }
      }, [
        this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.iconSettings), width: 18, height: 18, alt: '' }),
        tr('pause.settings')
      ]));

      stack.appendChild(this.el('button', {
        id: 'btn-pause-save-exit',
        type: 'button',
        class: 'btn btn-danger pause-big-btn',
        onclick: () => {
          if (g.saveSys) g.saveSys.save(g, g.currentSlot || 1, true);
          if (Balaclava.Audio && Balaclava.Audio.fadeOutMusic) Balaclava.Audio.fadeOutMusic(620);
          this.playSceneTransition(tr('transition.savingExit'), () => {
            this.showTitleScreen();
          }, { sub: 'Guardando datos y regresando al campamento...' });
        }
      }, [
        this.el('img', { class: 'pixel-img', src: encodeURI(Balaclava.UI_URLS.iconSave), width: 18, height: 18, alt: '' }),
        tr('pause.saveExit')
      ]));

      body.appendChild(stack);
    }

    renderBuildingInspector(titleEl, body, b) {
      const g = this.game;
      const def = Balaclava.BUILDINGS[b.type];
      titleEl.textContent = `${def.name} (${tr('common.levelShort')}${b.level}/3)`;
      body.appendChild(this.el('div', { class: 'parchment-box', style: 'margin-bottom:12px;display:flex;align-items:center;gap:12px;' }, [
        this.makeBuildingThumb(def, 52),
        this.el('div', { style: 'font-size:15px;line-height:1.48;' }, def.desc)
      ]));

      this._renderCraftQueueBanner(body);

      if (def.opensPanel === 'market') {
        this.renderMarket(body);
        return;
      }
      if (def.opensPanel === 'crafting') {
        this.renderCrafting(body, { onlyStation: 'mano' });
        return;
      }
      if (def.opensPanel === 'achievements') {
        this.renderAchievements(body);
        return;
      }
      if (def.opensPanel === 'enchant') {
        this.renderEnchanting(body);
        return;
      }
      if (def.opensPanel === 'portal') {
        const portals = g.buildings.filter(x => x.type === 'portal');
        const pCard = this.el('div', { class: 'card', style: 'margin-bottom:12px;' }, [
          this.el('strong', { style: 'color:#4fc3f7;' }, tr('bldg.portalsDest'))
        ]);
        portals.forEach((pt, idx) => {
          const biome = BIOMES[g.world.getBiomeAtPixel(pt.tx * TILE_SIZE, pt.ty * TILE_SIZE)];
          pCard.appendChild(this.el('button', {
            class: 'btn btn-primary btn-sm',
            onclick: () => {
              g.player.x = (pt.tx + 0.5) * TILE_SIZE;
              g.player.y = (pt.ty + 1.2) * TILE_SIZE;
              Balaclava.Audio.play('portal');
              this.closeModal();
            }
          }, tr('bldg.portalLine', { idx: idx + 1, biome: biome.name, x: pt.tx, y: pt.ty })));
        });
        body.appendChild(pCard);
      }
      if (def.opensPanel === 'altar') {
        const aCard = this.el('div', { class: 'card', style: 'margin-bottom:12px;' }, [
          this.el('strong', { style: 'color:#ce93d8;' }, tr('bldg.altarOfferings')),
          this.el('button', {
            class: 'btn btn-primary btn-sm',
            onclick: () => {
              if (g.coins < 40) return g.toast(tr('bldg.altarNeedCoins'), 'warn');
              g.coins -= 40;
              g.activeBuffs.speed = { mult: 1.4, time: 90 };
              g.activeBuffs.luck = { mult: 2.0, time: 90 };
              g.recomputeModifiers();
              Balaclava.Audio.play('levelup');
              g.toast(tr('bldg.altarBlessToast'), 'success');
              this.closeModal();
            }
          }, tr('bldg.altarBlessBtn')),
          this.el('button', {
            class: 'btn btn-gold btn-sm',
            onclick: () => {
              if ((g.inventory.esencia_oscura || 0) < 1) return g.toast(tr('bldg.altarNeedEssence'), 'warn');
              g.removeItem('esencia_oscura', 1);
              g.events.triggerRandomEvent(g);
              this.closeModal();
            }
          }, tr('bldg.altarEventBtn'))
        ]);
        body.appendChild(aCard);
      }
      if (def.opensPanel === 'dungeons') {
        const dList = this.el('div', { class: 'dungeon-atlas-list', style: 'margin-top:8px;' });
        Object.values(Balaclava.DUNGEON_DEFS).forEach(d => {
          const dmBiome = BIOMES[d.themeKey || d.biomeId || d.id] || BIOMES.pradera;
          dList.appendChild(this.el('button', {
            class: 'btn btn-sm',
            style: 'justify-content:space-between;',
            onclick: () => { this.closeModal(); g.enterDungeon(d.id); }
          }, [
            tr('bldg.dungeonRow', { name: d.name, biome: dmBiome.name, lvl: d.recLevel || 2 }),
            g.clearedDungeons.includes(d.id) ? this.uiIcon('iconCheck', 14) : null
          ]));
        });
        body.appendChild(this.el('div', { class: 'card', style: 'margin-bottom:12px;' }, [
          this.el('strong', { style: 'color:#ff8a65;' }, tr('bldg.enterDungeonTitle', { n: Object.keys(Balaclava.DUNGEON_DEFS).length })),
          dList
        ]));
      }

      if (def.station) {
        if (def.station === 'forja' || def.station === 'yunque_runico') {
          this.renderForjaCategories(body, def.station, false);
        } else {
          const stRecs = this._sortRecipes(Balaclava.RECIPES.filter(r => r.station === def.station));
          if (stRecs.length) {
            body.appendChild(this.el('h4', { style: 'margin:8px 0;color:#ffd54f;' }, tr('bldg.stationRecipesTitle')));
            const rGrid = this.el('div', { class: 'grid-cards', style: 'margin-bottom:12px;' });
            stRecs.forEach(r => {
              const card = this._buildRecipeCard(r, false);
              if (card) rGrid.appendChild(card);
            });
            body.appendChild(rGrid);
          }
        }
      }

      const foot = this.el('div', { style: 'display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;' });
      if (b.level < 3) {
        const nxt = b.level + 1;
        foot.appendChild(this.el('button', {
          class: 'btn btn-gold',
          onclick: () => { g.automation.upgradeBuilding(g, b); this.renderModal(); }
        }, tr('bldg.upgradeToCost', { lvl: nxt, coins: nxt * 85, gears: nxt === 2 ? 2 : 4 })));
      }
      foot.appendChild(this.el('button', {
        class: 'btn btn-danger',
        onclick: () => {
          g.automation.collectFromBuilding(g, b);
          g.buildings = g.buildings.filter(x => x !== b);
          Object.entries(def.cost).forEach(([id, q]) => g.addItem(id, Math.max(1, Math.floor(q * 0.5))));
          g.recomputeModifiers();
          this.closeModal();
          g.toast(tr('bldg.demolishToast', { name: def.name }), 'info');
        }
      }, tr('bldg.demolishBtn')));
      body.appendChild(foot);
    }

    renderNpcDialog(titleEl, body, npc) {
      const g = this.game;
      titleEl.textContent = npc.name;

      body.appendChild(this.el('div', { class: 'parchment-box', style: 'display:flex;gap:16px;align-items:center;margin-bottom:14px;padding:12px 14px;' }, [
        this.npcPortrait(npc.id, 76),
        this.el('div', {}, [
          this.el('div', { style: 'font-size:14px;font-weight:800;color:#9ec5ff;margin-bottom:5px;' }, `${npc.personality} · ${BIOMES[npc.biome].name}`),
          this.el('div', { style: 'font-size:16px;font-style:italic;line-height:1.45;color:#f4efe6;' }, `"${npc.greeting}"`)
        ])
      ]));

      const step = g.npcQuestProgress[npc.id] || 0;
      const q = npc.quests[step];
      if (!q) {
        body.appendChild(this.el('div', { class: 'card', style: 'color:#81c784;font-weight:700;' }, [
          this.uiIcon('iconCheck', 15),
          tr('npc.allQuestsDone')
        ]));
        return;
      }

      const checks = [];
      const parts = [];
      if (q.reqItems) {
        const itemsOk = Object.entries(q.reqItems).every(([id, amt]) => (g.inventory[id] || 0) >= amt);
        checks.push(itemsOk);
        parts.push(Object.entries(q.reqItems).map(([id, amt]) => `${Balaclava.ITEMS[id] ? Balaclava.ITEMS[id].name : id}: ${g.inventory[id] || 0}/${amt}`).join(' · '));
      }
      if (q.reqKillBiome) {
        const cur = (g.stats.killsByBiome && g.stats.killsByBiome[q.reqKillBiome.biome]) || 0;
        const ok = cur >= q.reqKillBiome.count;
        checks.push(ok);
        const bmName = BIOMES[q.reqKillBiome.biome] ? BIOMES[q.reqKillBiome.biome].name : q.reqKillBiome.biome;
        parts.push(`${bmName}: ${cur}/${q.reqKillBiome.count}`);
      }
      if (q.reqDungeon) {
        const ok = g.clearedDungeons.includes(q.reqDungeon);
        checks.push(ok);
        const dDef = Balaclava.DUNGEON_DEFS && Balaclava.DUNGEON_DEFS[q.reqDungeon];
        parts.push(tr('npc.cryptStatus', { name: dDef ? dDef.name : q.reqDungeon, state: ok ? tr('common.done') : tr('hud.dungPending') }));
      }
      if (q.reqCheck) {
        const ok = Boolean(q.reqCheck(g));
        checks.push(ok);
        parts.push(ok ? tr('npc.exploreDone') : tr('npc.exploreInProgress'));
      }
      const ready = checks.length > 0 && checks.every(Boolean);
      const statusText = parts.join('  |  ');

      const rewardExtra = q.reward.items
        ? ' + ' + Object.entries(q.reward.items).map(([id, amt]) => `${amt}x ${Balaclava.ITEMS[id].name}`).join(', ')
        : '';

      body.appendChild(this.el('div', { class: 'card npc-mission-card' }, [
        this.el('strong', { style: 'color:#ffd54f;font-size:19px;' }, tr('npc.missionHeading', { title: q.title })),
        this.el('p', { style: 'font-size:16px;margin:4px 0;line-height:1.48;color:#fff5e1;' }, q.desc),
        this.el('div', { style: `font-size:15px;font-weight:700;color:${ready ? '#81c784' : '#ffab91'};line-height:1.48;` }, statusText),
        this.el('div', { style: 'font-size:14px;color:#9be0ff;font-weight:700;' },
          tr('npc.rewardLine', { coins: q.reward.coins, xp: q.reward.xp, items: rewardExtra })),
        this.el('button', {
          class: 'btn btn-green',
          disabled: ready ? null : 'disabled',
          onclick: () => {
            if (q.reqItems) {
              Object.entries(q.reqItems).forEach(([id, amt]) => g.removeItem(id, amt));
            }
            g.npcQuestProgress[npc.id] = step + 1;
            g.addCoins(q.reward.coins);
            g.gainXp(q.reward.xp);
            if (q.reward.items) Object.entries(q.reward.items).forEach(([id, amt]) => g.addItem(id, amt));
            Balaclava.Audio.play('levelup');
            g.toast(tr('npc.completedToast', { title: q.title }), 'success');
            this.renderModal();
          }
        }, ready ? tr('npc.completeBtn') : tr('npc.pendingBtn'))
      ]));
    }

  }

  Balaclava.getKeybinds = () => (Balaclava.UI && Balaclava.UI.keybinds) || DEFAULT_KEYBINDS;
  Balaclava.UI = new UIController();
})();
