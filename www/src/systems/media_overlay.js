// Balaclava - Native System Media Overlay (Windows GSMTC via Tauri v2)
(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  const GLOBAL_PREFS_KEY = 'balaclava_global_settings_v2';
  const POLL_INTERVAL_MS = 2000;
  const CONTROL_REFRESH_DELAY_MS = 180;

  let enabled = true;
  let initialized = false;
  let pollTimer = null;
  let inFlight = false;
  let lastInfo = { title: '', artist: '', status: '' };

  function tr(key, vars) {
    if (Balaclava.I18n && typeof Balaclava.I18n.t === 'function') {
      const val = Balaclava.I18n.t(key, vars);
      if (val && val !== key) return val;
    }
    const fallbacks = {
      'media.noPlayback': 'Sin reproducción',
      'media.unknownTrack': 'Reproduciendo',
      'media.prev': 'Canción anterior',
      'media.playPause': 'Reproducir / Pausar',
      'media.next': 'Siguiente canción',
      'settings.mediaOverlay': 'Reproductor multimedia (Overlay)'
    };
    return fallbacks[key] || key;
  }

  function getTauriInvoke() {
    try {
      if (window.__TAURI__ && window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
        return window.__TAURI__.core.invoke.bind(window.__TAURI__.core);
      }
    } catch (_) {}
    try {
      if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
        return window.__TAURI_INTERNALS__.invoke.bind(window.__TAURI_INTERNALS__);
      }
    } catch (_) {}
    return null;
  }

  function readEnabledPref() {
    try {
      const raw = localStorage.getItem(GLOBAL_PREFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.mediaOverlay === 'boolean') {
          return parsed.mediaOverlay;
        }
      }
    } catch (_) {}
    return true;
  }

  function writeEnabledPref(value) {
    const boolVal = !!value;
    try {
      let globalObj = {};
      const raw = localStorage.getItem(GLOBAL_PREFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') globalObj = parsed;
      }
      globalObj.mediaOverlay = boolVal;
      localStorage.setItem(GLOBAL_PREFS_KEY, JSON.stringify(globalObj));
    } catch (_) {}

    try {
      const g = Balaclava.game || (Balaclava.UI && Balaclava.UI.game);
      if (g && g.settings) {
        g.settings.mediaOverlay = boolVal;
      }
    } catch (_) {}
  }

  function getElements() {
    if (typeof document === 'undefined') return null;
    const root = document.getElementById('media-overlay');
    if (!root) return null;
    return {
      root,
      meta: root.querySelector('.media-overlay-meta'),
      title: document.getElementById('media-overlay-title'),
      artist: document.getElementById('media-overlay-artist'),
      prevBtn: document.getElementById('btn-media-prev'),
      playBtn: document.getElementById('btn-media-play'),
      nextBtn: document.getElementById('btn-media-next')
    };
  }

  function renderInfo(info) {
    const els = getElements();
    if (!els) return;

    const titleText = info && typeof info.title === 'string' ? info.title.trim() : '';
    const artistText = info && typeof info.artist === 'string' ? info.artist.trim() : '';
    const statusText = info && typeof info.status === 'string' ? info.status.trim() : '';
    const hasTrack = !!(titleText || artistText || statusText === 'Playing' || statusText === 'Paused');

    els.root.classList.toggle('is-idle', !hasTrack);
    els.root.classList.toggle('is-playing', statusText === 'Playing');
    els.root.classList.toggle('is-paused', hasTrack && statusText !== 'Playing');

    if (!hasTrack) {
      if (els.title) els.title.textContent = tr('media.noPlayback');
      if (els.artist) els.artist.textContent = '';
      if (els.meta) els.meta.title = tr('media.noPlayback');
    } else {
      const shownTitle = titleText || tr('media.unknownTrack');
      if (els.title) els.title.textContent = shownTitle;
      if (els.artist) els.artist.textContent = artistText;
      if (els.meta) els.meta.title = artistText ? `${shownTitle} — ${artistText}` : shownTitle;
    }

    syncButtonLabels(els);
  }

  function syncButtonLabels(els) {
    const target = els || getElements();
    if (!target) return;
    target.root.setAttribute('aria-label', tr('settings.mediaOverlay'));
    if (target.prevBtn) {
      const label = tr('media.prev');
      target.prevBtn.title = label;
      target.prevBtn.setAttribute('aria-label', label);
    }
    if (target.playBtn) {
      const label = tr('media.playPause');
      target.playBtn.title = label;
      target.playBtn.setAttribute('aria-label', label);
    }
    if (target.nextBtn) {
      const label = tr('media.next');
      target.nextBtn.title = label;
      target.nextBtn.setAttribute('aria-label', label);
    }
  }

  async function refresh() {
    if (!enabled || inFlight) return;
    const invoke = getTauriInvoke();
    if (!invoke) {
      lastInfo = { title: '', artist: '', status: '' };
      renderInfo(lastInfo);
      return;
    }

    inFlight = true;
    try {
      const res = await invoke('get_system_media');
      if (!enabled) return;
      if (res && typeof res === 'object') {
        lastInfo = {
          title: typeof res.title === 'string' ? res.title : '',
          artist: typeof res.artist === 'string' ? res.artist : '',
          status: typeof res.status === 'string' ? res.status : ''
        };
      } else {
        lastInfo = { title: '', artist: '', status: '' };
      }
      renderInfo(lastInfo);
    } catch (_) {
      if (enabled) {
        lastInfo = { title: '', artist: '', status: '' };
        renderInfo(lastInfo);
      }
    } finally {
      inFlight = false;
    }
  }

  function stopPolling() {
    if (pollTimer !== null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startPolling() {
    stopPolling();
    if (!enabled) return;
    refresh();
    pollTimer = setInterval(refresh, POLL_INTERVAL_MS);
  }

  function applyVisibility() {
    const els = getElements();
    if (!els) return;
    if (!enabled) {
      stopPolling();
      els.root.style.display = 'none';
      return;
    }
    els.root.style.display = 'flex';
    renderInfo(lastInfo);
    startPolling();
  }

  async function control(action) {
    if (!enabled) return;
    const invoke = getTauriInvoke();
    if (!invoke) return;
    try {
      await invoke('control_system_media', { action });
      setTimeout(() => {
        if (enabled) refresh();
      }, CONTROL_REFRESH_DELAY_MS);
    } catch (_) {}
  }

  function bindEvents() {
    const els = getElements();
    if (!els || els.root.dataset.boundMedia === '1') return;
    els.root.dataset.boundMedia = '1';

    const blockFallthrough = (e) => e.stopPropagation();
    ['mousedown', 'pointerdown', 'mouseup', 'pointerup'].forEach(evt => {
      els.root.addEventListener(evt, blockFallthrough);
    });

    if (els.prevBtn) {
      els.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        control('prev');
      });
    }
    if (els.playBtn) {
      els.playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        control('play_pause');
      });
    }
    if (els.nextBtn) {
      els.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        control('next');
      });
    }
  }

  function setEnabled(nextEnabled, opts = {}) {
    enabled = !!nextEnabled;
    if (opts.persist !== false) {
      writeEnabledPref(enabled);
    }
    if (!enabled) {
      lastInfo = { title: '', artist: '', status: '' };
    }
    applyVisibility();
    return enabled;
  }

  function isEnabled() {
    return !!enabled;
  }

  function syncLanguage() {
    if (!enabled) {
      syncButtonLabels();
      return;
    }
    renderInfo(lastInfo);
  }

  function init() {
    enabled = readEnabledPref();
    if (!initialized) {
      initialized = true;
      bindEvents();
    }
    applyVisibility();
    return enabled;
  }

  Balaclava.MediaOverlay = {
    init,
    isEnabled,
    setEnabled,
    refresh,
    control,
    syncLanguage
  };
})();
