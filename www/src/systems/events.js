(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { PLOT_TILES, TILE_SIZE } = Balaclava.CONST;
  const { pick, randInt } = Balaclava.Utils;

  const DAILY_EVENTS = {
    lluvia_fertil: {
      id: 'lluvia_fertil',
      name: 'Lluvia Fértil',
      desc: 'Lluvia tibia y nutritiva que riega y acelera los cultivos.',
      duration: 110,
      color: '#4fc3f7'
    },
    tormenta_electrica: {
      id: 'tormenta_electrica',
      name: 'Tormenta Eléctrica',
      desc: 'Rayos y descargas voltaicas sobrecargan el archipiélago.',
      duration: 90,
      color: '#ffd54f'
    },
    lluvia_meteoritos: {
      id: 'lluvia_meteoritos',
      name: 'Lluvia de Meteoritos',
      desc: 'Cuerpos celestes caen en las islas exteriores.',
      duration: 100,
      color: '#ff7043'
    },
    esencia_arcana: {
      id: 'esencia_arcana',
      name: 'Oleada de Esencia Arcana',
      desc: 'La magia ambiental se condensa y potencia la caída de esencias oscuras.',
      duration: 110,
      color: '#ce93d8'
    },
    viento_favorable: {
      id: 'viento_favorable',
      name: 'Viento Favorable',
      desc: 'Brizas vivas aumentan notablemente la velocidad de movimiento del héroe.',
      duration: 120,
      color: '#81c784'
    },
    niebla_espesa: {
      id: 'niebla_espesa',
      name: 'Niebla Espesa',
      desc: 'Densa bruma sobre el mar que atrae criaturas nocturnas.',
      duration: 110,
      color: '#90a4ae'
    },
    abundancia_mineral: {
      id: 'abundancia_mineral',
      name: 'Abundancia Mineral',
      desc: 'Erupciones telúricas aceleran la regeneración de vetas y rocas.',
      duration: 120,
      color: '#ffd54f'
    },
    anomalia_temporal: {
      id: 'anomalia_temporal',
      name: 'Anomalía Temporal',
      desc: 'Distorsión del tiempo: hornos, aserraderos y telares operan al doble de velocidad.',
      duration: 110,
      color: '#ba68c8'
    }
  };

  class EventsSystem {
    constructor() {
      this.eventTimer = 45;
      this.dailyChallenges = this.generateDailyChallenges();
      this.dailySchedule = null;
      this.activeEvent = null;
    }

    generateDailyChallenges() {
      const en = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en' && Balaclava.I18N_DATA_EN && Balaclava.I18N_DATA_EN.dailyChallenges;
      const base = [
        { id: 'dc_gather', title: 'Desafío de Recolector', desc: 'Recolecta 40 recursos de cualquier tipo', target: 40, type: 'gather', progress: 0, rewardCoins: 90, rewardXp: 80, claimed: false },
        { id: 'dc_craft',  title: 'Desafío de Artesano',   desc: 'Fabrica 8 objetos en tus estaciones',     target: 8,  type: 'craft',  progress: 0, rewardCoins: 110, rewardXp: 95, claimed: false },
        { id: 'dc_combat', title: 'Desafío de Cazador',    desc: 'Derrota 6 enemigos en el mundo',          target: 6,  type: 'kill',   progress: 0, rewardCoins: 130, rewardXp: 110, claimed: false }
      ];
      if (!en) return base;
      return base.map(ch => (en[ch.id] ? { ...ch, title: en[ch.id].title, desc: en[ch.id].desc } : ch));
    }

    recordAction(type, amount = 1) {
      for (const ch of this.dailyChallenges) {
        if (!ch.claimed && ch.type === type) {
          ch.progress = Math.min(ch.target, ch.progress + amount);
        }
      }
    }

    claimChallenge(game, id) {
      const ch = this.dailyChallenges.find(c => c.id === id);
      if (!ch || ch.claimed || ch.progress < ch.target) return false;
      ch.claimed = true;
      game.addCoins(ch.rewardCoins);
      game.gainXp(ch.rewardXp);
      Balaclava.Audio.play('levelup');
      game.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.challengeDone', { coins: ch.rewardCoins, xp: ch.rewardXp }) : `¡Desafío completado! +${ch.rewardCoins} monedas y +${ch.rewardXp} Experiencia`, 'success');
      return true;
    }

    claimContract(game, id) {
      const c = (Balaclava.GUILD_CONTRACTS || []).find(x => x.id === id);
      if (!c) return false;
      if (!game.claimedContracts) game.claimedContracts = [];
      if (game.claimedContracts.includes(id)) return false;
      const cur = c.progress(game);
      if (cur < c.target) return false;
      game.claimedContracts.push(id);
      if (c.reward.coins) game.addCoins(c.reward.coins);
      if (c.reward.xp) game.gainXp(c.reward.xp);
      if (c.reward.items) {
        for (const [iid, qty] of Object.entries(c.reward.items)) {
          if (qty > 0 && Balaclava.ITEMS[iid]) game.addItem(iid, qty);
        }
      }
      Balaclava.Audio.play('levelup');
      game.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.contractDone', { title: c.title, coins: c.reward.coins, xp: c.reward.xp }) : `¡Contrato "${c.title}" completado! +${c.reward.coins} oro y +${c.reward.xp} Experiencia`, 'success');
      game.uiDirty = true;
      return true;
    }

    getReadyContractsCount(game) {
      const claimed = game.claimedContracts || [];
      return (Balaclava.GUILD_CONTRACTS || []).filter(c => !claimed.includes(c.id) && c.progress(game) >= c.target).length;
    }

    update(dt, game) {
      this.checkProgress(game);

      if (game.activeDungeon) return;

      const curDay = Math.floor(game.dayCount || 1);
      const curTime = (game.dayTime % 1 + 1) % 1;

      // 1 random scheduled event per in-game day (not ad-hoc timers)
      if (!this.dailySchedule || this.dailySchedule.day !== curDay) {
        const eventKeys = Object.keys(DAILY_EVENTS);
        this.dailySchedule = {
          day: curDay,
          triggerTime: 0.18 + Math.random() * 0.62,
          eventId: pick(eventKeys),
          triggered: false
        };
      }

      if (!this.dailySchedule.triggered && curTime >= this.dailySchedule.triggerTime) {
        this.dailySchedule.triggered = true;
        this.startDailyEvent(game, this.dailySchedule.eventId);
      }

      if (this.activeEvent) {
        this.activeEvent.timeLeft = Math.max(0, this.activeEvent.timeLeft - dt);
        this.applyDailyEventTick(game, dt);
        if (this.activeEvent.timeLeft <= 0) {
          const endedName = this.activeEvent.name;
          this.activeEvent = null;
          game.recomputeModifiers();
          game.toast(`El evento "${endedName}" ha concluido.`, 'info');
        }
      }
    }

    startDailyEvent(game, eventId) {
      const def = DAILY_EVENTS[eventId] || DAILY_EVENTS.lluvia_fertil;
      this.activeEvent = {
        id: def.id,
        name: def.name,
        desc: def.desc,
        timeLeft: def.duration,
        duration: def.duration,
        color: def.color
      };
      game.recomputeModifiers();
      Balaclava.Audio.play('portal');
      game.toast(`¡Evento Diario: ${def.name}! ${def.desc}`, 'warn');

      if (def.id === 'lluvia_meteoritos' && game.unlockedPlots.length >= 2) {
        for (let i = 0; i < 2; i++) {
          const plot = pick(game.unlockedPlots);
          const biome = game.world.plotBiomes[plot[1]][plot[0]];
          const tx = plot[0] * PLOT_TILES + randInt(2, PLOT_TILES - 3);
          const ty = plot[1] * PLOT_TILES + randInt(2, PLOT_TILES - 3);
          if (game.world.tiles[ty][tx] === 1 && !game.world.getNodeAtTile(tx, ty) && !game.getBuildingAtTile(tx, ty)) {
            game.world.spawnNodeAtTile(tx, ty, 'meteor', biome);
            game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, '#ff8a65', 18);
          }
        }
        game.shake(0.35, 6);
      }
    }

    applyDailyEventTick(game, dt) {
      if (!this.activeEvent) return;
      const id = this.activeEvent.id;

      if (id === 'lluvia_fertil') {
        // Accelerate crop watering and growth
        for (const c of game.world.crops) {
          c.watered = true;
          c.progress = Math.min(1.0, c.progress + dt * 0.05);
          c.stage = c.progress >= 1 ? 3 : c.progress >= 0.65 ? 2 : c.progress >= 0.3 ? 1 : 0;
        }
      } else if (id === 'tormenta_electrica') {
        this._strikeTimer = (this._strikeTimer || 0) + dt;
        if (this._strikeTimer >= 8.5) {
          this._strikeTimer = 0;
          if (game.combat.enemies.length > 0) {
            const target = pick(game.combat.enemies);
            game.spawnFx('fx_thunder_strike', target.x, target.y - 18, 0, 0.34, 1.35, 0.92);
            game.combat.damageEnemy(game, target, 45, 0, false);
          }
        }
      } else if (id === 'abundancia_mineral') {
        game.world.spawnTimer = (game.world.spawnTimer || 0) + dt * 0.8;
      }
    }

    triggerRandomEvent(game) {
      if (game.activeDungeon || game.unlockedPlots.length === 0) return;
      const keys = Object.keys(DAILY_EVENTS);
      this.startDailyEvent(game, pick(keys));
    }

    checkProgress(game) {
      // Story progression
      const chap = Balaclava.STORY_CHAPTERS[game.storyIndex];
      if (chap && chap.check(game)) {
        game.storyIndex++;
        game.addCoins(chap.reward.coins);
        game.gainXp(chap.reward.xp);
        for (const [id, q] of Object.entries(chap.reward.items)) {
          game.addItem(id, q);
        }
        Balaclava.Audio.play('levelup');
        game.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.chapterDone', { title: chap.title }) : `¡Capítulo completado: ${chap.title}!`, 'success');
      }

      // Achievements
      for (const ach of Balaclava.ACHIEVEMENTS) {
        if (!game.unlockedAchievements.includes(ach.id) && ach.check(game)) {
          game.unlockedAchievements.push(ach.id);
          game.addCoins(ach.coins);
          Balaclava.Audio.play('chest');
          game.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.achievementDone', { name: ach.name, coins: ach.coins }) : `¡Logro desbloqueado: ${ach.name}! (+${ach.coins} monedas)`, 'success');
        }
      }
    }

    getNextObjectiveHint(game) {
      const chap = Balaclava.STORY_CHAPTERS[game.storyIndex];
      if (chap) return chap.objective;
      const total = Balaclava.CONST.GRID_PLOTS * Balaclava.CONST.GRID_PLOTS;
      if (game.unlockedPlots.length < total) return Balaclava.I18n ? Balaclava.I18n.t('quests.nextPlotHint') : 'Explora y compra las parcelas restantes en el Mapa (M) para dominar el archipiélago.';
      return Balaclava.I18n ? Balaclava.I18n.t('quests.storyComplete') : '¡Modo Infinito Dorado! Amplía tu imperio automatizado y completa la Enciclopedia al 100%.';
    }
  }

  Balaclava.EventsSystem = EventsSystem;
})();
