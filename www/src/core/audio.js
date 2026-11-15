(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const ROOT = window.BALACLAVA_ROOT_BASE || '';
  const GLOBAL_PREFS_KEY = 'balaclava_global_settings_v2';
  const AUDIO_STORAGE_KEY = 'balaclava_audio_v1';

  const SFX_PATHS = {
    bite: 'assets/audio/sfx/bite.wav',
    build: 'assets/audio/sfx/build.wav',
    cancel: 'assets/audio/sfx/cancel.wav',
    cast: 'assets/audio/sfx/cast.wav',
    catch: 'assets/audio/sfx/catch.wav',
    chest: 'assets/audio/sfx/chest.ogg',
    chop: 'assets/audio/sfx/chop.wav',
    coin: 'assets/audio/sfx/coin.wav',
    craft: 'assets/audio/sfx/craft.wav',
    crit: 'assets/audio/sfx/crit.wav',
    dig: 'assets/audio/sfx/dig.wav',
    drink: 'assets/audio/sfx/drink.wav',
    eat: 'assets/audio/sfx/eat.wav',
    enemy_die: 'assets/audio/sfx/enemy_die.wav',
    equip: 'assets/audio/sfx/equip.wav',
    error: 'assets/audio/sfx/error.wav',
    explosion: 'assets/audio/sfx/explosion.wav',
    hit: 'assets/audio/sfx/hit.wav',
    hurt: 'assets/audio/sfx/hurt.wav',
    laser: 'assets/audio/sfx/laser.wav',
    levelup: 'assets/audio/sfx/levelup.wav',
    map: 'assets/audio/sfx/map.wav',
    mine: 'assets/audio/sfx/mine.wav',
    page: 'assets/audio/sfx/page.wav',
    pickup: 'assets/audio/sfx/pickup.wav',
    portal: 'assets/audio/sfx/portal.wav',
    slash: 'assets/audio/sfx/slash.wav',
    step1: 'assets/audio/sfx/step1.wav',
    step2: 'assets/audio/sfx/step2.wav',
    thunder: 'assets/audio/sfx/thunder.wav',
    trap: 'assets/audio/sfx/trap.ogg',
    ui: 'assets/audio/sfx/ui.wav',
    unlock_skill: 'assets/audio/sfx/unlock_skill.wav',
    xp: 'assets/audio/sfx/xp.wav'
  };

  const MUSIC_THEMES = {
    adventure: {
      id: 'adventure',
      key: 'settings.musicThemeAdv',
      descKey: 'settings.musicThemeAdvDesc',
      name: 'Aventura',
      nameEn: 'Adventure',
      file: 'assets/audio/music/overworld_glory.ogg'
    },
    chill: {
      id: 'chill',
      key: 'settings.musicThemeChill',
      descKey: 'settings.musicThemeChillDesc',
      name: 'Full Chill',
      nameEn: 'Full Chill',
      file: 'assets/audio/music/peaceful_wholesome.ogg'
    },
    lofi: {
      id: 'lofi',
      key: 'settings.musicThemeLofi',
      descKey: 'settings.musicThemeLofiDesc',
      name: 'Lo-Fi',
      nameEn: 'Lo-Fi',
      file: 'assets/audio/music/lofi_full_loop.ogg'
    },
    meadow: {
      id: 'meadow',
      key: 'settings.musicThemeMeadow',
      descKey: 'settings.musicThemeMeadowDesc',
      name: 'Pradera',
      nameEn: 'Meadow',
      file: 'assets/audio/music/pleasant_creek.ogg'
    }
  };

  const MUSIC_PATHS = {
    overworld: 'assets/audio/music/overworld_glory.ogg',
    meadow: 'assets/audio/music/overworld_glory.ogg',
    desert: 'assets/audio/music/overworld_glory.ogg',
    dark_forest: 'assets/audio/music/overworld_glory.ogg',
    ice_mountains: 'assets/audio/music/overworld_glory.ogg',
    volcanic: 'assets/audio/music/overworld_glory.ogg',
    night: 'assets/audio/music/overworld_glory.ogg',
    title: 'assets/audio/music/moonlight_beach.mp3',
    dungeon: 'assets/audio/music/dungeon_epic.ogg',
    boss: 'assets/audio/music/dungeon_epic.ogg'
  };

  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.musicGain = null;
      this.sfxGain = null;
      this.masterVolume = 1.0;
      this.musicVolume = 0.35;
      this.sfxVolume = 0.55;
      this.muted = false;
      this.sfxMuted = false;
      this.musicMuted = false;
      this.musicTheme = 'adventure';
      this.initialized = false;
      this.musicTimer = 0;
      this.musicStep = 0;
      this.mood = 'title';
      this.buffers = {};
      this.loadingStarted = false;
      this._musicTrack = null;
      this._musicMoodLoaded = null;
      this._targetUrl = null;
      this._musicFade = 0;
      this._pendingStart = false;
      this._pendingAutoplayFade = null;
      this._fadeDelayTimer = null;
      this._fadeInRaf = null;
      this._fadeInTimer = null;
      this._outgoingTracks = new Set();
      this._trackSeq = 0;
      this._previewThemeInTitle = false;
      this._musicSuppressedByFadeOut = false;
      this._hoverStep = 0;
      this._unlockBound = false;
      this._stepParity = 0;
      this.loadPrefs();
      this.bindUnlockListeners();
    }

    loadPrefs() {
      try {
        let p = null;
        const rawGlobal = localStorage.getItem(GLOBAL_PREFS_KEY);
        if (rawGlobal) {
          try {
            const parsed = JSON.parse(rawGlobal);
            if (parsed && typeof parsed.audio === 'object') {
              p = parsed.audio;
            }
          } catch (_) {}
        }
        if (!p) {
          const rawAudio = localStorage.getItem(AUDIO_STORAGE_KEY);
          if (rawAudio) {
            try { p = JSON.parse(rawAudio); } catch (_) {}
          }
        }
        if (p) {
          if (typeof p.masterVolume === 'number') this.masterVolume = Math.max(0, Math.min(1, p.masterVolume));
          if (typeof p.musicVolume === 'number') this.musicVolume = Math.max(0, Math.min(1, p.musicVolume));
          if (typeof p.sfxVolume === 'number') this.sfxVolume = Math.max(0, Math.min(1, p.sfxVolume));
          if (typeof p.muted === 'boolean') this.muted = p.muted;
          if (typeof p.sfxMuted === 'boolean') this.sfxMuted = p.sfxMuted;
          if (typeof p.musicMuted === 'boolean') this.musicMuted = p.musicMuted;
          if (typeof p.musicTheme === 'string') {
            if (MUSIC_THEMES[p.musicTheme]) {
              this.musicTheme = p.musicTheme;
            } else if (p.musicTheme === 'cozy') {
              this.musicTheme = 'meadow';
            }
          }
        }
      } catch (_) {}
      this.applyVolumes();
    }

    savePrefs() {
      try {
        const audioPrefs = {
          masterVolume: this.masterVolume,
          musicVolume: this.musicVolume,
          sfxVolume: this.sfxVolume,
          muted: this.muted,
          sfxMuted: this.sfxMuted,
          musicMuted: this.musicMuted,
          musicTheme: this.musicTheme
        };
        // 1. Guardar en clave global unificada
        let globalObj = {};
        try {
          const rawGlobal = localStorage.getItem(GLOBAL_PREFS_KEY);
          if (rawGlobal) globalObj = JSON.parse(rawGlobal) || {};
        } catch (_) {}
        globalObj.audio = audioPrefs;
        localStorage.setItem(GLOBAL_PREFS_KEY, JSON.stringify(globalObj));

        // 2. Guardar en clave audio legacy para compatibilidad
        localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audioPrefs));
      } catch (_) {}
    }

    bindUnlockListeners() {
      if (this._unlockBound || typeof document === 'undefined') return;
      this._unlockBound = true;
      const unlock = () => {
        if (!this.initialized) {
          this.init();
        } else {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
          this._resumePendingMusic();
        }
      };
      document.addEventListener('pointerdown', unlock, { capture: true, passive: true });
      document.addEventListener('keydown', unlock, { capture: true, passive: true });
      document.addEventListener('click', unlock, { capture: true, passive: true });
    }

    init(startOpts = null) {
      if (this.initialized) {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (!this.loadingStarted) this.preloadBuffers();
        this._resumePendingMusic();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        this.initialized = true;
        this.applyVolumes();
        this.startMusic(false, startOpts || { delayMs: 420, fadeOutMs: 0, fadeInMs: 4200 });
        return;
      }
      try {
        this.ctx = new AC();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain.connect(this.ctx.destination);
        this.sfxGain.connect(this.ctx.destination);
        this.initialized = true;
        this.applyVolumes();
        this.preloadBuffers();
        this.startMusic(false, startOpts || { delayMs: 420, fadeOutMs: 0, fadeInMs: 4200 });
      } catch (_) {}
    }

    enterTitleMenu() {
      this._previewThemeInTitle = false;
      const opts = { delayMs: 420, fadeOutMs: 350, fadeInMs: 4200 };
      if (!this.initialized) {
        this.mood = 'title';
        this.init(opts);
      } else {
        this.setMood('title', opts);
      }
    }

    preloadBuffers() {
      if (!this.ctx || this.loadingStarted) return;
      this.loadingStarted = true;
      if (typeof fetch !== 'function') return;
      for (const [key, relPath] of Object.entries(SFX_PATHS)) {
        const url = ROOT + relPath;
        fetch(url)
          .then(res => (res && res.ok ? res.arrayBuffer() : null))
          .then(ab => (ab && this.ctx ? this.ctx.decodeAudioData(ab) : null))
          .then(decoded => { if (decoded) this.buffers[key] = decoded; })
          .catch(() => {});
      }
    }

    getEffectiveMusicVolume() {
      if (this.muted || this.musicMuted) return 0;
      return Math.max(0, Math.min(1, this.masterVolume * this.musicVolume));
    }

    getEffectiveSfxVolume() {
      if (this.muted || this.sfxMuted) return 0;
      return Math.max(0, Math.min(1, this.masterVolume * this.sfxVolume));
    }

    _clamp01(v) {
      return Math.max(0, Math.min(1, Number(v) || 0));
    }

    _easeFadeCurve(t) {
      const clamped = this._clamp01(t);
      const s = 0.5 - 0.5 * Math.cos(Math.PI * clamped);
      // Exponential perceptual dB swell (~50dB rise) so volume emerges smoothly from silence
      return (Math.pow(300, s) - 1) / 299;
    }

    _applyTrackVolumeNow() {
      if (this._musicTrack) {
        this._musicTrack.volume = this._clamp01(this.getEffectiveMusicVolume() * this._musicFade);
      }
    }

    _cancelMusicTimers() {
      if (this._fadeDelayTimer) {
        clearTimeout(this._fadeDelayTimer);
        this._fadeDelayTimer = null;
      }
      if (this._fadeInRaf && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this._fadeInRaf);
      }
      this._fadeInRaf = null;
      if (this._fadeInTimer) {
        clearInterval(this._fadeInTimer);
        this._fadeInTimer = null;
      }
      this._pendingStart = false;
    }

    _stopTrackCleanly(track) {
      if (!track) return;
      try {
        track.pause();
        track.src = '';
      } catch (_) {}
      if (this._outgoingTracks) this._outgoingTracks.delete(track);
    }

    _fadeOutTrack(track, fadeOutMs = 380) {
      if (!track) return;
      const startVol = Number(track.volume) || 0;
      if (track.paused || startVol <= 0.002 || fadeOutMs <= 0) {
        this._stopTrackCleanly(track);
        return;
      }
      this._outgoingTracks.add(track);
      const startTs = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      let stopped = false;
      const finish = () => {
        if (stopped) return;
        stopped = true;
        this._stopTrackCleanly(track);
      };
      const step = () => {
        if (stopped || !this._outgoingTracks.has(track)) return;
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const t = Math.min(1, (now - startTs) / fadeOutMs);
        track.volume = this._clamp01(startVol * Math.pow(1 - t, 2));
        if (t >= 1) {
          finish();
        } else if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(step);
        }
      };
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(step);
      }
      setTimeout(finish, fadeOutMs + 70);
    }

    fadeOutMusic(fadeOutMs = 600) {
      this._trackSeq += 1;
      this._musicSuppressedByFadeOut = true;
      this._cancelMusicTimers();
      this._pendingAutoplayFade = null;
      const prev = this._musicTrack;
      this._musicTrack = null;
      this._musicMoodLoaded = null;
      this._targetUrl = null;
      this._musicFade = 0;
      if (prev) this._fadeOutTrack(prev, fadeOutMs);
    }

    _animateFadeIn(track, fadeInMs, seq) {
      if (!track || this._musicTrack !== track || seq !== this._trackSeq) return;
      this._cancelFadeInLoop();

      if (fadeInMs <= 20) {
        this._musicFade = 1;
        this._applyTrackVolumeNow();
        return;
      }

      this._musicFade = 0;
      this._applyTrackVolumeNow();
      let elapsedMs = 0;
      let fadeStarted = false;
      let lastTickTs = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const tick = () => {
        if (this._musicTrack !== track || seq !== this._trackSeq) {
          this._cancelFadeInLoop();
          return;
        }
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        // Wait until media stream has data & begins advancing so buffer/decode stalls cannot skip silence
        const isTrackAudible = (typeof track.readyState !== 'number')
          ? !track.paused
          : (!track.paused && (Number(track.currentTime) > 0.005 || track.readyState >= 3));
        if (!isTrackAudible) {
          lastTickTs = now;
          this._musicFade = 0;
          this._applyTrackVolumeNow();
          return;
        }
        if (!fadeStarted) {
          fadeStarted = true;
          lastTickTs = now;
        } else {
          const stepMs = Math.min(60, Math.max(0, now - lastTickTs));
          lastTickTs = now;
          elapsedMs += stepMs;
        }
        const t = Math.min(1, elapsedMs / fadeInMs);
        this._musicFade = this._easeFadeCurve(t);
        this._applyTrackVolumeNow();
        if (t >= 1) {
          this._musicFade = 1;
          this._applyTrackVolumeNow();
          this._cancelFadeInLoop();
        }
      };
      this._fadeInTimer = setInterval(tick, 45);
      const stepRaf = () => {
        this._fadeInRaf = null;
        tick();
        if (this._fadeInTimer !== null && typeof requestAnimationFrame === 'function') {
          this._fadeInRaf = requestAnimationFrame(stepRaf);
        }
      };
      if (typeof requestAnimationFrame === 'function') {
        this._fadeInRaf = requestAnimationFrame(stepRaf);
      }
    }

    _cancelFadeInLoop() {
      if (this._fadeInRaf && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this._fadeInRaf);
      }
      this._fadeInRaf = null;
      if (this._fadeInTimer) {
        clearInterval(this._fadeInTimer);
        this._fadeInTimer = null;
      }
    }

    _beginTrackPlayback(track, fadeInMs, seq) {
      if (!track || this._musicTrack !== track || seq !== this._trackSeq) return;
      if (track._playPending) return;
      this._pendingStart = false;
      if (this.getEffectiveMusicVolume() <= 0) {
        this._musicFade = 0;
        track.volume = 0;
        return;
      }
      this._musicFade = 0;
      track.volume = 0;
      try {
        track._playPending = true;
        const playRes = track.play();
        if (playRes && typeof playRes.then === 'function') {
          playRes.then(() => {
            track._playPending = false;
            if (this._musicTrack === track && seq === this._trackSeq) {
              this._pendingAutoplayFade = null;
              this._animateFadeIn(track, fadeInMs, seq);
            }
          }).catch(() => {
            track._playPending = false;
            if (this._musicTrack === track && seq === this._trackSeq) {
              this._pendingAutoplayFade = { fadeInMs, seq };
            }
          });
        } else {
          track._playPending = false;
          this._pendingAutoplayFade = null;
          this._animateFadeIn(track, fadeInMs, seq);
        }
      } catch (_) {
        track._playPending = false;
        this._pendingAutoplayFade = { fadeInMs, seq };
      }
    }

    _resumePendingMusic() {
      if (!this._musicTrack || this._pendingStart || this._fadeDelayTimer || this._musicTrack._playPending) return;
      if (this.getEffectiveMusicVolume() <= 0) return;
      if (!this._musicTrack.paused) return;
      const fadeMs = (this._pendingAutoplayFade && this._pendingAutoplayFade.fadeInMs) || 4000;
      const seq = this._trackSeq;
      this._beginTrackPlayback(this._musicTrack, fadeMs, seq);
    }

    _syncHtmlMusic() {
      const effMusic = this.getEffectiveMusicVolume();
      if (this._musicTrack) {
        if (effMusic <= 0) {
          this._musicTrack.volume = 0;
          if (!this._musicTrack.paused) {
            this._musicTrack.pause();
          }
        } else {
          this._applyTrackVolumeNow();
          if (this.initialized && !this._pendingStart && !this._fadeDelayTimer && this._musicTrack.paused) {
            const seq = this._trackSeq;
            const fadeMs = (this._pendingAutoplayFade && this._pendingAutoplayFade.fadeInMs) || 3800;
            this._beginTrackPlayback(this._musicTrack, fadeMs, seq);
          }
        }
      }
    }

    applyVolumes() {
      const effMusic = this.getEffectiveMusicVolume();
      const effSfx = this.getEffectiveSfxVolume();

      if (this.musicGain && this.ctx) {
        try {
          this.musicGain.gain.setValueAtTime(effMusic * 0.45, this.ctx.currentTime);
        } catch (_) {}
      }
      if (this.sfxGain && this.ctx) {
        try {
          this.sfxGain.gain.setValueAtTime(effSfx * 0.75, this.ctx.currentTime);
        } catch (_) {}
      }
      this._syncHtmlMusic();
    }

    setMasterVolume(v) {
      this.masterVolume = Math.max(0, Math.min(1, Number(v) || 0));
      this.applyVolumes();
      this.savePrefs();
    }

    setMusicVolume(v) {
      this.musicVolume = Math.max(0, Math.min(1, Number(v) || 0));
      this.applyVolumes();
      this.savePrefs();
    }

    setSfxVolume(v) {
      this.sfxVolume = Math.max(0, Math.min(1, Number(v) || 0));
      this.applyVolumes();
      this.savePrefs();
    }

    setMuted(flag) {
      this.muted = !!flag;
      this.applyVolumes();
      this.savePrefs();
    }

    setSfxMuted(flag) {
      this.sfxMuted = !!flag;
      this.applyVolumes();
      this.savePrefs();
    }

    setMusicMuted(flag) {
      this.musicMuted = !!flag;
      this.applyVolumes();
      this.savePrefs();
    }

    _resolveTargetRel(mood = this.mood) {
      if (mood === 'title' && !this._previewThemeInTitle) {
        return MUSIC_PATHS.title;
      }
      if (mood === 'dungeon' || mood === 'boss') {
        return MUSIC_PATHS[mood] || MUSIC_PATHS.dungeon;
      }
      const theme = MUSIC_THEMES[this.musicTheme] || MUSIC_THEMES.adventure;
      return theme.file || MUSIC_PATHS.overworld;
    }

    startMusic(force = false, opts = null) {
      if (typeof Audio !== 'function') return;
      const targetRel = this._resolveTargetRel(this.mood);
      const targetUrl = ROOT + targetRel;

      if (!force && this._targetUrl === targetUrl) {
        if (this._pendingStart || (this._musicTrack && !this._musicTrack.paused)) {
          return;
        }
        if (this._musicTrack && this._musicTrack.paused) {
          if (this.initialized && this.getEffectiveMusicVolume() > 0 && !this._pendingAutoplayFade) {
            this._resumePendingMusic();
          }
          return;
        }
      }

      const fadeOutMs = (opts && typeof opts.fadeOutMs === 'number') ? opts.fadeOutMs : 420;
      const delayMs = (opts && typeof opts.delayMs === 'number') ? opts.delayMs : 480;
      const fadeInMs = (opts && typeof opts.fadeInMs === 'number') ? opts.fadeInMs : 4200;

      const seq = ++this._trackSeq;
      this._musicSuppressedByFadeOut = false;
      this._cancelMusicTimers();
      this._pendingAutoplayFade = null;

      const prevTrack = this._musicTrack;
      if (prevTrack) {
        this._musicTrack = null;
        this._fadeOutTrack(prevTrack, fadeOutMs);
      }

      try {
        const el = new Audio(targetUrl);
        el.preload = 'auto';
        el.loop = true;
        el.volume = 0;
        this._musicTrack = el;
        this._musicMoodLoaded = targetUrl;
        this._targetUrl = targetUrl;
        this._musicFade = 0;

        if (delayMs > 0) {
          this._pendingStart = true;
          this._fadeDelayTimer = setTimeout(() => {
            this._fadeDelayTimer = null;
            if (seq !== this._trackSeq || this._musicTrack !== el) return;
            this._beginTrackPlayback(el, fadeInMs, seq);
          }, delayMs);
        } else {
          this._beginTrackPlayback(el, fadeInMs, seq);
        }
      } catch (_) {}
    }

    setMusicTheme(themeId) {
      if (themeId === 'cozy') themeId = 'meadow';
      if (!MUSIC_THEMES[themeId]) themeId = 'adventure';
      if (this.musicTheme === themeId && !this._previewThemeInTitle && this._musicTrack && !this._musicTrack.paused) return;
      this.musicTheme = themeId;
      this.savePrefs();
      if (this.mood === 'title') {
        this._previewThemeInTitle = true;
      }
      if (this.mood !== 'dungeon' && this.mood !== 'boss') {
        this.startMusic(true, { delayMs: 320, fadeOutMs: 420, fadeInMs: 3600 });
      }
    }

    getMusicTheme() {
      return this.musicTheme || 'adventure';
    }

    getAvailableThemes() {
      return Object.values(MUSIC_THEMES);
    }

    setMood(mood, forceOrOpts = false) {
      this._musicSuppressedByFadeOut = false;
      const normalizedMood = mood || 'overworld';
      const opts = (forceOrOpts && typeof forceOrOpts === 'object') ? forceOrOpts : null;
      const force = opts ? !!opts.force : !!forceOrOpts;
      const prevMood = this.mood;

      if (normalizedMood === 'title') {
        this._previewThemeInTitle = false;
      } else if (prevMood === 'title') {
        this._previewThemeInTitle = false;
      }

      const nextUrl = ROOT + this._resolveTargetRel(normalizedMood);
      if (!force && this._targetUrl === nextUrl && (this._pendingStart || (this._musicTrack && !this._musicTrack.paused))) {
        this.mood = normalizedMood;
        return;
      }

      this.mood = normalizedMood;
      let transitionOpts = opts;
      if (!transitionOpts) {
        if ((prevMood === 'dungeon' || prevMood === 'boss') && normalizedMood !== 'dungeon' && normalizedMood !== 'boss') {
          transitionOpts = { delayMs: 800, fadeOutMs: 420, fadeInMs: 4800 };
        } else if (prevMood === 'title' && normalizedMood !== 'title') {
          transitionOpts = { delayMs: 750, fadeOutMs: 380, fadeInMs: 4600 };
        } else if (normalizedMood === 'title') {
          transitionOpts = { delayMs: 480, fadeOutMs: 420, fadeInMs: 4200 };
        } else if (normalizedMood === 'dungeon' || normalizedMood === 'boss') {
          transitionOpts = { delayMs: 600, fadeOutMs: 380, fadeInMs: 4200 };
        } else {
          transitionOpts = { delayMs: 520, fadeOutMs: 420, fadeInMs: 4200 };
        }
      }
      this.startMusic(force, transitionOpts);
    }

    tone(freqStart, freqEnd, duration = 0.12, type = 'triangle', vol = 0.4, delay = 0, isMusic = false) {
      if (!this.ctx || this.muted) return;
      if (isMusic && (this.musicMuted || this.getEffectiveMusicVolume() <= 0)) return;
      if (!isMusic && (this.sfxMuted || this.getEffectiveSfxVolume() <= 0)) return;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(isMusic ? this.musicGain : this.sfxGain);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    noise(duration = 0.12, vol = 0.25) {
      if (!this.ctx || this.muted || this.sfxMuted || this.getEffectiveSfxVolume() <= 0) return;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      src.connect(gain);
      gain.connect(this.sfxGain);
      src.start();
    }

    _playBuffer(bufKey, gainMult = 1.0, rateJitter = 0.05) {
      if (!this.ctx || this.muted || this.sfxMuted || this.getEffectiveSfxVolume() <= 0) return false;
      const buf = this.buffers[bufKey];
      if (!buf) return false;
      try {
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        if (rateJitter > 0) {
          src.playbackRate.value = 1 + (Math.random() * 2 - 1) * rateJitter;
        }
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(Math.max(0.05, Math.min(1.5, gainMult)), this.ctx.currentTime);
        src.connect(g);
        g.connect(this.sfxGain);
        src.start();
        return true;
      } catch (_) {
        return false;
      }
    }

    update(dt) {
      if (!this.ctx || this.muted || this.musicMuted || this.getEffectiveMusicVolume() <= 0) return;
      if (this._musicSuppressedByFadeOut) return;
      if (this._outgoingTracks && this._outgoingTracks.size > 0) return;
      if (typeof Audio === 'function' && (this._musicTrack || this._targetUrl)) return;
      if (this._musicTrack && (!this._musicTrack.paused || this._pendingStart || this._musicTrack._playPending || this._pendingAutoplayFade)) return;
      this.musicTimer -= dt;
      if (this.musicTimer > 0) return;

      this.musicTimer = this.mood === 'dungeon' || this.mood === 'boss' ? 0.42 : 0.55;
      const scales = {
        overworld: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
        meadow: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
        night: [220.0, 261.63, 293.66, 329.63, 392.0],
        dungeon: [146.83, 174.61, 196.0, 220.0, 233.08, 293.66],
        boss: [146.83, 174.61, 196.0, 220.0, 233.08, 293.66],
        title: [261.63, 329.63, 392.0, 523.25, 659.25]
      };
      const sc = scales[this.mood] || scales.overworld;
      const note = sc[(this.musicStep * 3 + (this.musicStep % 2)) % sc.length];
      if (this.musicStep % 2 === 0) {
        this.tone(note, note, 0.45, 'sine', 0.16, 0, true);
      }
      if (this.musicStep % 4 === 0) {
        this.tone(note * 0.5, note * 0.5, 0.85, 'triangle', 0.14, 0, true);
      }
      this.musicStep++;
    }

    _playSoftChime(freq, duration = 0.065, peakVol = 0.042, delay = 0) {
      if (!this.ctx || !this.sfxGain || this.muted || this.sfxMuted || this.getEffectiveSfxVolume() <= 0) return;
      const now = this.ctx.currentTime + delay;
      const targetFreq = Math.max(80, Math.min(620, freq));

      const oscMain = this.ctx.createOscillator();
      const oscSub = this.ctx.createOscillator();
      const gainMain = this.ctx.createGain();
      const gainSub = this.ctx.createGain();

      // Velvety upward pitch bloom (warm droplet / felt cushion feel)
      oscMain.type = 'sine';
      oscMain.frequency.setValueAtTime(targetFreq * 0.90, now);
      oscMain.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.018);

      oscSub.type = 'triangle';
      oscSub.frequency.setValueAtTime(targetFreq * 0.45, now);
      oscSub.frequency.exponentialRampToValueAtTime(targetFreq * 0.50, now + 0.018);

      // Soft, non-clicky 10ms envelope
      gainMain.gain.setValueAtTime(0.0001, now);
      gainMain.gain.linearRampToValueAtTime(peakVol, now + 0.010);
      gainMain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      gainSub.gain.setValueAtTime(0.0001, now);
      gainSub.gain.linearRampToValueAtTime(peakVol * 0.34, now + 0.009);
      gainSub.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.032, duration * 0.68));

      oscMain.connect(gainMain);
      oscSub.connect(gainSub);

      // Warm low-pass rolloff strips all brittle upper harmonics for a creamy hover tick
      if (typeof this.ctx.createBiquadFilter === 'function') {
        const lpf = this.ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.Q.setValueAtTime(0.55, now);
        lpf.frequency.setValueAtTime(840, now);
        lpf.frequency.exponentialRampToValueAtTime(420, now + duration);
        gainMain.connect(lpf);
        gainSub.connect(lpf);
        lpf.connect(this.sfxGain);
      } else {
        gainMain.connect(this.sfxGain);
        gainSub.connect(this.sfxGain);
      }

      oscMain.start(now);
      oscSub.start(now);
      oscMain.stop(now + duration + 0.015);
      oscSub.stop(now + duration + 0.015);
    }

    play(name) {
      if (this.muted || this.sfxMuted || this.getEffectiveSfxVolume() <= 0) return;
      if (!this.ctx) {
        if (name === 'ui_hover') return;
        return;
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
        if (name === 'ui_hover' && this.ctx.state === 'suspended') return;
      }
      const nowMs = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      this._lastPlay = this._lastPlay || {};
      this._recentVoices = this._recentVoices || [];
      const minGaps = {
        hit: 55, chop: 55, mine: 55, pickup: 45, crit: 70, step: 220,
        slash: 60, ui: 35, ui_hover: 62, hurt: 90, explosion: 95, cast: 70, thunder: 120
      };
      const gap = minGaps[name] || 30;
      if (this._lastPlay[name] && (nowMs - this._lastPlay[name]) < gap) return;
      this._recentVoices = this._recentVoices.filter(t => (nowMs - t) < 250);
      if (this._recentVoices.length >= 12) return;
      this._lastPlay[name] = nowMs;
      this._recentVoices.push(nowMs);

      if (name === 'ui_hover') {
        const notes = [311.13, 329.63, 349.23];
        const base = notes[this._hoverStep % notes.length];
        this._hoverStep = (this._hoverStep + 1) % notes.length;
        const jitter = 1 + (Math.random() * 0.014 - 0.007);
        this._playSoftChime(base * jitter, 0.062, 0.042);
        return;
      }

      if (name === 'step') {
        this._stepParity = (this._stepParity + 1) % 2;
        // Soft, muffled natural footstep on grass/earth (no scratchy static)
        const baseFreq = this._stepParity === 0 ? 95 : 110;
        this.tone(baseFreq + 25, baseFreq - 20, 0.045, 'sine', 0.12);
        this.tone(baseFreq * 1.5, baseFreq * 0.8, 0.025, 'triangle', 0.06);
        return;
      }

      if (name === 'bow') {
        if (this._playBuffer('slash', 0.65, 0.06)) return;
      } else if (name === 'unlock_plot') {
        // Celestial discovery chime (Zelda/Forager discovery: C5, E5, G5, C6, E6 shimmer)
        this.tone(523.25, 523.25, 0.32, 'sine', 0.26, 0);
        this.tone(659.25, 659.25, 0.36, 'sine', 0.22, 0.06);
        this.tone(783.99, 783.99, 0.40, 'triangle', 0.24, 0.12);
        this.tone(1046.50, 1046.50, 0.48, 'sine', 0.28, 0.18);
        this.tone(1318.51, 1318.51, 0.55, 'sine', 0.20, 0.26);
        return;
      } else if (name === 'levelup') {
        // Warm ascending arcade level-up fanfare (no loud trumpet audio)
        this.tone(392.00, 392.00, 0.12, 'triangle', 0.26, 0);
        this.tone(523.25, 523.25, 0.14, 'triangle', 0.28, 0.07);
        this.tone(659.25, 659.25, 0.16, 'sine', 0.30, 0.14);
        this.tone(783.99, 783.99, 0.20, 'sine', 0.32, 0.21);
        this.tone(1046.50, 1046.50, 0.40, 'triangle', 0.36, 0.28);
        this.tone(1567.98, 1567.98, 0.35, 'sine', 0.18, 0.32);
        return;
      } else if (name === 'unlock_skill') {
        // Mystic rune insight chime (D5 -> A5 -> D6 -> A6)
        this.tone(587.33, 587.33, 0.16, 'triangle', 0.24, 0);
        this.tone(880.00, 880.00, 0.22, 'sine', 0.26, 0.07);
        this.tone(1174.66, 1174.66, 0.32, 'triangle', 0.28, 0.14);
        this.tone(1760.00, 1760.00, 0.38, 'sine', 0.20, 0.21);
        return;
      } else if (SFX_PATHS[name]) {
        const gainMap = {
          thunder: 1.05, explosion: 1.0, crit: 0.95,
          coin: 0.8, pickup: 0.72, xp: 0.68, ui: 0.55, page: 0.6, map: 0.68
        };
        if (this._playBuffer(name, gainMap[name] || 0.85, name === 'thunder' ? 0.02 : 0.06)) {
          return;
        }
      }

      switch (name) {
        case 'chop':
          this.tone(190, 90, 0.09, 'triangle', 0.35);
          this.tone(120, 60, 0.07, 'square', 0.14, 0.015);
          break;
        case 'mine':
          this.tone(720, 420, 0.09, 'triangle', 0.28);
          this.tone(980, 640, 0.06, 'sine', 0.2, 0.01);
          break;
        case 'dig':
          this.tone(140, 75, 0.12, 'sawtooth', 0.18);
          break;
        case 'slash':
          this.tone(420, 140, 0.11, 'sawtooth', 0.2);
          break;
        case 'bow':
          this.tone(520, 240, 0.12, 'triangle', 0.22);
          break;
        case 'pickup':
          this.tone(560, 840, 0.08, 'sine', 0.22);
          break;
        case 'coin':
          this.tone(987, 987, 0.06, 'square', 0.18);
          this.tone(1318, 1318, 0.14, 'square', 0.18, 0.06);
          break;
        case 'craft':
          this.tone(330, 440, 0.08, 'triangle', 0.25);
          this.tone(523, 659, 0.14, 'triangle', 0.25, 0.08);
          break;
        case 'build':
          this.tone(180, 240, 0.1, 'square', 0.22);
          this.tone(260, 390, 0.16, 'triangle', 0.25, 0.07);
          break;
        case 'xp':
          this.tone(660, 880, 0.09, 'sine', 0.18);
          break;
        case 'levelup':
          this.tone(523.25, 523.25, 0.1, 'triangle', 0.3, 0);
          this.tone(659.25, 659.25, 0.1, 'triangle', 0.1);
          this.tone(783.99, 783.99, 0.12, 'triangle', 0.3, 0.2);
          this.tone(1046.5, 1046.5, 0.28, 'triangle', 0.34, 0.32);
          break;
        case 'thunder':
          this.noise(0.35, 0.42);
          this.tone(160, 42, 0.36, 'sawtooth', 0.36);
          break;
        case 'unlock_skill':
          this.tone(587, 880, 0.12, 'sine', 0.24);
          this.tone(880, 1174, 0.18, 'triangle', 0.22, 0.08);
          break;
        case 'eat':
        case 'drink':
          this.tone(420, 620, 0.09, 'sine', 0.2);
          break;
        case 'equip':
          this.tone(360, 540, 0.08, 'triangle', 0.2);
          break;
        case 'crit':
          this.tone(620, 1080, 0.1, 'sawtooth', 0.28);
          break;
        case 'trap':
          this.tone(240, 95, 0.14, 'square', 0.24);
          break;
        case 'page':
        case 'map':
          this.tone(460, 590, 0.06, 'sine', 0.14);
          break;
        case 'cancel':
          this.tone(320, 210, 0.07, 'sine', 0.14);
          break;
        case 'hit':
          this.tone(160, 75, 0.08, 'square', 0.26);
          break;
        case 'hurt':
          this.tone(220, 95, 0.16, 'sawtooth', 0.32);
          break;
        case 'enemy_die':
          this.tone(180, 60, 0.2, 'sawtooth', 0.3);
          this.noise(0.18, 0.22);
          break;
        case 'cast':
          this.tone(440, 880, 0.15, 'sine', 0.24);
          break;
        case 'explosion':
          this.noise(0.4, 0.45);
          this.tone(120, 35, 0.3, 'sawtooth', 0.35);
          break;
        case 'ui':
          this.tone(880, 1174, 0.04, 'sine', 0.12);
          break;
        case 'error':
          this.tone(220, 150, 0.14, 'square', 0.2);
          break;
        default:
          this.tone(440, 440, 0.08, 'sine', 0.16);
          break;
      }
    }
  }

  Balaclava.Audio = new SoundEngine();
  Balaclava.Audio.MUSIC_THEMES = MUSIC_THEMES;
})();
