// Balaclava - Main Entry Point
(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  // Fallback seguro si no cargara discord_rpc.js
  if (!Balaclava.actualizarDiscord) Balaclava.actualizarDiscord = () => {};
  if (!Balaclava.initDiscord) Balaclava.initDiscord = () => {};
  if (!window.actualizarDiscord) window.actualizarDiscord = () => {};

  // Bloquear menú contextual (clic derecho) para experiencia inmersiva
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Bloquear atajos de recarga accidental
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === 'r' || e.key === 'R' || e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
    }
    if (e.key === 'F5') {
      e.preventDefault();
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Internacionalización
    if (Balaclava.I18n && Balaclava.I18n.init) {
      Balaclava.I18n.init();
    }

    // 2. Inicializar Preferencias y Audio
    if (Balaclava.Audio && Balaclava.Audio.loadPrefs) {
      Balaclava.Audio.loadPrefs();
    }

    const canvas = document.getElementById('game-canvas');
    const game = new Balaclava.GameEngine(canvas);
    Balaclava.game = game;

    function resize() {
      const cw = Math.max(1, Math.round(canvas.clientWidth || window.innerWidth));
      const ch = Math.max(1, Math.round(canvas.clientHeight || window.innerHeight));
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      if (game && game.camera) {
        game.camera.width = cw;
        game.camera.height = ch;
      }
    }
    function scheduleResizeSync() {
      resize();
      requestAnimationFrame(resize);
      setTimeout(resize, 60);
      setTimeout(resize, 200);
    }
    window.addEventListener('resize', scheduleResizeSync);
    if (typeof ResizeObserver !== 'undefined') {
      const canvasResizeObserver = new ResizeObserver(() => resize());
      canvasResizeObserver.observe(canvas);
    }
    resize();

    // 3. Inicializar Interfaz, Discord Rich Presence y Media Overlay
    Balaclava.UI.init(game);
    if (typeof Balaclava.initDiscord === 'function') Balaclava.initDiscord();
    if (Balaclava.MediaOverlay && typeof Balaclava.MediaOverlay.init === 'function') {
      Balaclava.MediaOverlay.init();
    }

    const onFullscreenChange = () => {
      scheduleResizeSync();
      if (Balaclava.UI && (Balaclava.UI.activeModal === 'title_settings' ||
          (Balaclava.UI.activeModal === 'pause' && Balaclava.UI.pauseView === 'settings'))) {
        Balaclava.UI.renderModal();
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    // 4. Cargar Recursos Gráficos con pantalla de carga cinematográfica (5-7s smooth showcase)
    (function runBootLoaderSequence() {
      const BOOT_SHOWCASE_MS = 5800;
      const bootEl = document.getElementById('boot-loader');
      const fillEl = document.getElementById('boot-bar-fill');
      const statusEl = document.getElementById('boot-status-text');
      const pctEl = document.getElementById('boot-percent-text');
      const legacyStatus = document.getElementById('assets-status');
      const trBoot = (k, fb) => (Balaclava.I18n && Balaclava.I18n.t) ? Balaclava.I18n.t(k) : fb;

      let assetsFinished = false;
      const loadPromise = Balaclava.Assets.loadAll().then(() => {
        assetsFinished = true;
        if (legacyStatus) {
          legacyStatus.textContent = '';
          legacyStatus.classList.add('hidden');
        }
      });

      if (!bootEl || !fillEl) {
        loadPromise.then(() => {
          if (Balaclava.Audio && typeof Balaclava.Audio.enterTitleMenu === 'function') Balaclava.Audio.enterTitleMenu();
          if (Balaclava.UI && Balaclava.UI.triggerTitleIntro) Balaclava.UI.triggerTitleIntro();
        });
        return;
      }

      const startTime = performance.now();
      let lastFrameTime = startTime;
      let shownRatio = 0;
      let lastStage = -1;
      let finalized = false;

      const stageKeys = [
        ['boot.phase1', 'Loading world and pixel art textures...'],
        ['boot.phase2', 'Awakening the archipelago and oceans...'],
        ['boot.phase3', 'Forging biomes, relics and dungeons...'],
        ['boot.phase4', 'Ready to embark']
      ];

      function setPhaseText(stageIdx) {
        if (!statusEl || stageIdx === lastStage) return;
        lastStage = stageIdx;
        const [key, fallback] = stageKeys[stageIdx];
        statusEl.classList.add('is-swapping');
        setTimeout(() => {
          statusEl.textContent = trBoot(key, fallback);
          statusEl.classList.remove('is-swapping');
        }, 120);
      }

      setPhaseText(0);

      function finishBoot() {
        if (finalized) return;
        finalized = true;
        clearInterval(backupTicker);
        fillEl.style.width = '100%';
        if (pctEl) pctEl.textContent = '100%';
        setPhaseText(3);
        bootEl.classList.add('is-complete');

        setTimeout(() => {
          bootEl.classList.add('is-leaving');
          if (Balaclava.Audio && typeof Balaclava.Audio.enterTitleMenu === 'function') {
            Balaclava.Audio.enterTitleMenu();
          }
          if (Balaclava.UI && Balaclava.UI.triggerTitleIntro) {
            Balaclava.UI.triggerTitleIntro();
          } else {
            const ts = document.getElementById('title-screen');
            if (ts) ts.classList.remove('title-booting');
          }
          setTimeout(() => {
            bootEl.classList.add('hidden');
          }, 820);
        }, 360);
      }

      function stepBoot(now) {
        if (finalized) return;
        const dt = Math.min(0.05, Math.max(0.004, (now - lastFrameTime) / 1000));
        lastFrameTime = now;

        const elapsed = Math.max(0, now - startTime);
        const normT = Math.min(1, elapsed / BOOT_SHOWCASE_MS);
        const easedT = 0.28 * normT + 0.72 * (1 - Math.pow(1 - normT, 2.4));

        const assetProg = (Balaclava.Assets && Balaclava.Assets.getLoadProgress)
          ? Balaclava.Assets.getLoadProgress()
          : { ratio: assetsFinished ? 1 : 0.5 };
        const realCap = (assetsFinished && normT >= 1)
          ? 1
          : Math.min(0.985, Math.max(0.16, assetProg.ratio * 0.96 + 0.08));

        const targetRatio = (assetsFinished && normT >= 1)
          ? 1
          : Math.min(easedT, realCap);

        const nextRatio = shownRatio + (targetRatio - shownRatio) * Math.min(1, dt * 8.2);
        shownRatio = Math.max(shownRatio, nextRatio);

        fillEl.style.width = (shownRatio * 100).toFixed(2) + '%';
        if (pctEl) pctEl.textContent = Math.min(100, Math.round(shownRatio * 100)) + '%';

        if (shownRatio >= 0.96) setPhaseText(3);
        else if (shownRatio >= 0.64) setPhaseText(2);
        else if (shownRatio >= 0.28) setPhaseText(1);

        if (assetsFinished && normT >= 1 && shownRatio >= 0.993) {
          finishBoot();
          return;
        }
        requestAnimationFrame(stepBoot);
      }

      const backupTicker = setInterval(() => {
        if (!finalized) stepBoot(performance.now());
      }, 150);

      requestAnimationFrame(stepBoot);
    })();

    // Wire HUD menu buttons
    document.querySelectorAll('[data-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (game.isPlayerDead && game.isPlayerDead()) return;
        Balaclava.UI.openModal(btn.getAttribute('data-modal'));
      });
    });

    const closeBtn = document.getElementById('btn-close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => Balaclava.UI.closeModal());
    }
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target.id === 'modal-backdrop') Balaclava.UI.closeModal();
      });
    }
    const cancelBuild = document.getElementById('btn-cancel-build');
    if (cancelBuild) {
      cancelBuild.addEventListener('click', () => {
        if (game.isPlayerDead && game.isPlayerDead()) return;
        game.placingBuildingId = null;
        game.placingItemId = null;
        Balaclava.UI.updateHUD(true);
      });
    }
    const exitDung = document.getElementById('btn-exit-dungeon');
    if (exitDung) {
      exitDung.addEventListener('click', () => {
        if (game.isPlayerDead && game.isPlayerDead()) return;
        if (typeof game.requestExitDungeon === 'function') game.requestExitDungeon();
        else game.exitDungeon();
      });
    }

    let last = performance.now();
    let _errThrottle = 0;
    function loop(now) {
      requestAnimationFrame(loop);
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      try {
        game.update(dt);
      } catch (err) {
        if (now - _errThrottle > 2000) { _errThrottle = now; console.error('[UPDATE ERROR]', err); }
      }
      const activeModal = Balaclava.UI ? Balaclava.UI.activeModal : null;
      const opaqueFullscreenModal = activeModal === 'skills' || activeModal === 'map';
      if (!opaqueFullscreenModal) {
        try {
          game.render();
        } catch (err) {
          if (now - _errThrottle > 2000) { _errThrottle = now; console.error('[RENDER ERROR]', err, err.stack); }
        }
        try {
          if (game.started) Balaclava.UI.updateHUD();
        } catch (err) {
          if (now - _errThrottle > 2000) { _errThrottle = now; console.error('[HUD ERROR]', err); }
        }
      }
    }
    requestAnimationFrame(loop);
  });
})();
