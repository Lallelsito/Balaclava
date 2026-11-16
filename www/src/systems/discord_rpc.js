// Balaclava - Discord Rich Presence Bridge (Tauri v2 Native IPC)
(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  const DISCORD_INVITE_URL = 'https://discord.gg/8wrsjRSMY2';
  const APP_VERSION_LABEL = 'Beta 1.1.1';
  const SESSION_START_SEC = Math.floor(Date.now() / 1000);
  const MIN_PUSH_INTERVAL_MS = 1200;
  const POLL_INTERVAL_MS = 2500;

  let initialized = false;
  let lastSignature = '';
  let lastPushMs = 0;
  let pendingTimer = null;
  let pollTimer = null;

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

  function getLang() {
    try {
      if (Balaclava.I18n && typeof Balaclava.I18n.getLanguage === 'function') {
        return Balaclava.I18n.getLanguage() === 'en' ? 'en' : 'es';
      }
    } catch (_) {}
    return 'es';
  }

  function countUnlockedIslands(world) {
    if (!world || !Array.isArray(world.plotUnlocked)) {
      return { unlocked: 1, total: 100 };
    }
    let unlocked = 0;
    let total = 0;
    for (let gy = 0; gy < world.plotUnlocked.length; gy++) {
      const row = world.plotUnlocked[gy];
      if (!Array.isArray(row)) continue;
      for (let gx = 0; gx < row.length; gx++) {
        total++;
        if (row[gx]) unlocked++;
      }
    }
    return { unlocked: Math.max(1, unlocked), total: total || 100 };
  }

  function getPlayerBiomeInfo(game) {
    const BIOMES = (Balaclava.CONST && Balaclava.CONST.BIOMES) || {};
    const TILE_SIZE = (Balaclava.CONST && Balaclava.CONST.TILE_SIZE) || 48;
    const world = game && game.world;
    const player = game && game.player;
    let biomeId = 'pradera';

    if (world && player) {
      const tx = Math.floor(player.x / TILE_SIZE);
      const ty = Math.floor(player.y / TILE_SIZE);
      if (typeof world.getVisualBiomeAtTile === 'function') {
        biomeId = world.getVisualBiomeAtTile(tx, ty) || biomeId;
      } else if (typeof world.getBiomeAtPixel === 'function') {
        biomeId = world.getBiomeAtPixel(player.x, player.y) || biomeId;
      }
    }

    const def = BIOMES[biomeId];
    return {
      id: biomeId,
      name: (def && def.name) || biomeId
    };
  }

  function buildButtons(lang) {
    return [
      {
        label: lang === 'en' ? 'Join Discord' : 'Unirse al Discord',
        url: DISCORD_INVITE_URL
      }
    ];
  }

  function buildPayload() {
    const game = Balaclava.game;
    const ui = Balaclava.UI;
    const lang = getLang();
    const isEn = lang === 'en';
    const activeModal = ui ? ui.activeModal : null;

    if (!game || !game.started) {
      return {
        details: isEn ? 'In the Main Menu' : 'En el menú principal',
        state: isEn ? `Preparing an expedition · ${APP_VERSION_LABEL}` : `Preparando expedición · ${APP_VERSION_LABEL}`,
        startTimestamp: SESSION_START_SEC,
        largeImage: 'balaclava_logo',
        largeText: `Balaclava · ${APP_VERSION_LABEL}`,
        smallImage: null,
        smallText: null,
        buttons: buildButtons(lang),
        clear: false
      };
    }

    const lvl = (game.player && game.player.level) || 1;
    const day = game.dayCount || 1;
    const clearedCount = Array.isArray(game.clearedDungeons) ? game.clearedDungeons.length : 0;
    const islands = countUnlockedIslands(game.world);

    if (typeof game.isPlayerDead === 'function' && game.isPlayerDead()) {
      return {
        details: isEn ? 'Fallen in Battle' : 'Caído en combate',
        state: isEn
          ? `Respawning at camp · Lv.${lvl}`
          : `Reapareciendo en campamento · Nv.${lvl}`,
        startTimestamp: SESSION_START_SEC,
        largeImage: 'balaclava_logo',
        largeText: `Balaclava · ${APP_VERSION_LABEL}`,
        smallImage: null,
        smallText: null,
        buttons: buildButtons(lang),
        clear: false
      };
    }

    if (game.activeDungeon) {
      const dung = game.activeDungeon;
      const dungName = (dung.def && dung.def.name) || (isEn ? 'Dungeon' : 'Mazmorra');
      const dungBiome = (dung.def && dung.def.themeKey) || 'pradera';
      const boss = dung.boss;
      const TILE_SIZE = (Balaclava.CONST && Balaclava.CONST.TILE_SIZE) || 48;
      const playerTx = game.player ? Math.floor(game.player.x / TILE_SIZE) : 0;
      const inBossRoom = Boolean(boss && !boss.dead && playerTx >= ((dung.bossRoomMinX || 34) - 2));

      let details;
      let state;
      if (inBossRoom) {
        const hpPct = Math.max(1, Math.round(((boss.hp || 0) / Math.max(1, boss.maxHp || 1)) * 100));
        details = isEn ? `Boss: ${boss.name}` : `Jefe: ${boss.name}`;
        state = isEn
          ? `${dungName} (${hpPct}% HP) · Lv.${lvl}`
          : `${dungName} (${hpPct}% HP) · Nv.${lvl}`;
      } else if (boss && boss.dead) {
        details = isEn ? `Cleared: ${dungName}` : `Despejada: ${dungName}`;
        state = isEn
          ? `Lv.${lvl} · ${clearedCount} dungeons cleared`
          : `Nv.${lvl} · ${clearedCount} mazmorras completadas`;
      } else {
        const aliveEnemies = Array.isArray(dung.enemies)
          ? dung.enemies.filter(e => e && !e.dead).length + (boss && !boss.dead ? 1 : 0)
          : 0;
        details = isEn ? `Dungeon: ${dungName}` : `Mazmorra: ${dungName}`;
        state = isEn
          ? `Lv.${lvl} · ${aliveEnemies} foes remaining`
          : `Nv.${lvl} · ${aliveEnemies} enemigos restantes`;
      }

      return {
        details,
        state,
        startTimestamp: SESSION_START_SEC,
        largeImage: 'balaclava_logo',
        largeText: `Balaclava · ${APP_VERSION_LABEL}`,
        smallImage: dungBiome,
        smallText: dungName,
        buttons: buildButtons(lang),
        clear: false
      };
    }

    const biome = getPlayerBiomeInfo(game);
    let details = isEn ? `Exploring: ${biome.name}` : `Explorando: ${biome.name}`;
    let state = isEn
      ? `Lv.${lvl} · Day ${day} · Islands ${islands.unlocked}/${islands.total}`
      : `Nv.${lvl} · Día ${day} · Islas ${islands.unlocked}/${islands.total}`;

    if (game.paused || activeModal === 'pause') {
      details = isEn ? `Paused · ${biome.name}` : `En pausa · ${biome.name}`;
    } else if (activeModal === 'skills') {
      const skillsCount = Array.isArray(game.unlockedSkills) ? game.unlockedSkills.length : 0;
      details = isEn ? 'Astral Constellation' : 'Árbol Astral de Skills';
      state = isEn
        ? `Lv.${lvl} · ${skillsCount} skills unlocked`
        : `Nv.${lvl} · ${skillsCount} skills aprendidas`;
    } else if (activeModal === 'map') {
      details = isEn ? 'Archipelago Atlas' : 'Atlas del Archipiélago';
      state = isEn
        ? `${islands.unlocked}/${islands.total} islands · Lv.${lvl}`
        : `${islands.unlocked}/${islands.total} islas · Nv.${lvl}`;
    }

    return {
      details,
      state,
      startTimestamp: SESSION_START_SEC,
      largeImage: 'balaclava_logo',
      largeText: `Balaclava · ${APP_VERSION_LABEL}`,
      smallImage: biome.id,
      smallText: biome.name,
      buttons: buildButtons(lang),
      clear: false
    };
  }

  function flushUpdate(force = false) {
    const invoke = getTauriInvoke();
    if (!invoke) return;

    const payload = buildPayload();
    const signature = JSON.stringify(payload);
    if (!force && signature === lastSignature) return;

    const now = Date.now();
    const elapsed = now - lastPushMs;
    if (!force && elapsed < MIN_PUSH_INTERVAL_MS) {
      if (!pendingTimer) {
        pendingTimer = setTimeout(() => {
          pendingTimer = null;
          flushUpdate(true);
        }, MIN_PUSH_INTERVAL_MS - elapsed);
      }
      return;
    }

    lastSignature = signature;
    lastPushMs = now;
    try {
      Promise.resolve(invoke('rpc_update_activity', { payload })).catch(() => {});
    } catch (_) {}
  }

  function initDiscord() {
    if (initialized) {
      flushUpdate(true);
      return;
    }
    initialized = true;
    flushUpdate(true);
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => flushUpdate(false), POLL_INTERVAL_MS);
  }

  function actualizarDiscord(force = false) {
    flushUpdate(Boolean(force));
  }

  async function getDiscordStatus() {
    const invoke = getTauriInvoke();
    if (!invoke) return { tauri: false, connected: false };
    try {
      const status = await invoke('rpc_get_status');
      return Object.assign({ tauri: true }, status || {});
    } catch (err) {
      return { tauri: true, connected: false, error: String(err) };
    }
  }

  Balaclava.DiscordRPC = {
    init: initDiscord,
    update: actualizarDiscord,
    buildPayload,
    getStatus: getDiscordStatus
  };
  Balaclava.initDiscord = initDiscord;
  Balaclava.actualizarDiscord = actualizarDiscord;
  window.actualizarDiscord = actualizarDiscord;
})();
