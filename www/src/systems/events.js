(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const { PLOT_TILES, TILE_SIZE } = Balaclava.CONST;
  const { pick, randInt } = Balaclava.Utils;

  class EventsSystem {
    constructor() {
      this.eventTimer = 45;
      this.dailyChallenges = this.generateDailyChallenges();
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
      const rateMult = 1 + (game.mods.eventRate || 0);
      this.eventTimer -= dt * rateMult;
      if (this.eventTimer <= 0) {
        this.eventTimer = randInt(55, 95);
        this.triggerRandomEvent(game);
      }
      this.checkProgress(game);
    }

    triggerRandomEvent(game) {
      if (game.activeDungeon || game.unlockedPlots.length === 0) return;
      const plot = pick(game.unlockedPlots);
      const biome = game.world.plotBiomes[plot[1]][plot[0]];
      const tx = plot[0] * PLOT_TILES + randInt(2, PLOT_TILES - 3);
      const ty = plot[1] * PLOT_TILES + randInt(2, PLOT_TILES - 3);
      if (game.world.tiles[ty][tx] !== 1 || game.world.getNodeAtTile(tx, ty) || game.getBuildingAtTile(tx, ty)) return;

      const roll = Math.random();
      const worldChests = game.world.nodes.filter(n => n.kind === 'chest').length;
      if (roll < 0.18 && game.unlockedPlots.length >= 2) {
        // Meteorite impact (less frequent so meteors stay special)
        game.world.spawnNodeAtTile(tx, ty, 'meteor', biome);
        game.shake(0.45, 7);
        Balaclava.Audio.play('meteor');
        game.spawnParticles((tx + 0.5) * TILE_SIZE, (ty + 0.5) * TILE_SIZE, '#ff8a65', 20);
        game.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.meteorFallen', { biome: Balaclava.CONST.BIOMES[biome].name }) : `¡Un meteorito cayó en ${Balaclava.CONST.BIOMES[biome].name}! Búscalo para obtener diamantes.`, 'warn');
      } else if (roll < 0.21 && worldChests < 1 && Math.random() < 0.45) {
        // Ultra-rare hidden treasure chest!
        game.world.spawnSpecialNode(tx, ty, 'chest', biome);
        game.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.chestSpawned', { biome: Balaclava.CONST.BIOMES[biome].name }) : `¡Ha aparecido un cofre misterioso en ${Balaclava.CONST.BIOMES[biome].name}!`, 'info');
      } else {
        // Rare Golden Slime!
        game.combat.spawnWorldEnemy(game, biome, 'golden_slime');
        game.toast(Balaclava.I18n ? Balaclava.I18n.t('toast.goldenSlime', { biome: Balaclava.CONST.BIOMES[biome].name }) : `¡Un Limo Dorado Raro merodea por ${Balaclava.CONST.BIOMES[biome].name}!`, 'info');
      }
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
