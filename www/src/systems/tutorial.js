(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  const TUTORIAL_STEPS = [
    {
      id: 'move',
      title: 'Bienvenido: Controles Básicos',
      title_en: 'Welcome: Basic Controls',
      desc: 'Muévete por tu isla usando {moveKeys}. Usa {dashKey} para esquivar o rodar ágilmente.',
      desc_en: 'Move across your island using {moveKeys}. Use {dashKey} to dodge or roll nimbly.',
      hint: 'Explora tu pequeña isla inicial.',
      hint_en: 'Explore your small starting island.',
      icon: 'assets/icons/balaclava_knight.png',
      check: (game, state) => {
        if (!state.startPos) state.startPos = { x: game.player.x, y: game.player.y };
        const dx = game.player.x - state.startPos.x;
        const dy = game.player.y - state.startPos.y;
        const dist = Math.hypot(dx, dy);
        state.movedDist = (state.movedDist || 0) + (dist > 2 ? dist * 0.1 : 0);
        state.startPos = { x: game.player.x, y: game.player.y };
        if (game.player.dashTimer > 0) state.didDash = true;
        const movedDone = state.movedDist >= 120;
        return movedDone && state.didDash;
      },
      getProgress: (game, state) => {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        const moved = Math.min(100, Math.floor(((state.movedDist || 0) / 120) * 100));
        const dash = state.didDash ? (isEn ? '✓ Dash ready' : '✓ Esquive listo') : (isEn ? 'Press Space' : 'Pulsa Espacio');
        return isEn ? `Movement: ${moved}% · ${dash}` : `Movimiento: ${moved}% · ${dash}`;
      }
    },
    {
      id: 'gather',
      title: 'Recolección de Recursos',
      title_en: 'Gathering Resources',
      desc: 'Tala árboles o pica rocas con {attackKey} apuntando con el cursor. Reúne al menos 4 de madera y 4 de piedra.',
      desc_en: 'Chop trees or mine rocks with {attackKey} aiming with your cursor. Gather at least 4 wood and 4 stone.',
      hint: 'Consigue madera de los árboles y piedra de los cantos rodados.',
      hint_en: 'Harvest wood from trees and stone from boulders.',
      icon: 'assets/icons/axe.png',
      check: (game) => {
        const wood = (game.inventory.madera || 0);
        const stone = (game.inventory.piedra || 0);
        return wood >= 4 && stone >= 4;
      },
      getProgress: (game) => {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        const wood = Math.min(4, game.inventory.madera || 0);
        const stone = Math.min(4, game.inventory.piedra || 0);
        return isEn ? `Wood: ${wood}/4 · Stone: ${stone}/4` : `Madera: ${wood}/4 · Piedra: ${stone}/4`;
      }
    },
    {
      id: 'inventory',
      title: 'Inventario y Equipamiento',
      title_en: 'Inventory & Equipment',
      desc: 'Pulsa {invKey} para abrir tu inventario. Aquí puedes equipar armas, armaduras y reliquias, además de inspeccionar tus atributos.',
      desc_en: 'Press {invKey} to open your inventory. Here you can equip weapons, armor, and relics, and view your stats.',
      hint: 'La tecla [Q] te permite gestionar todo tu equipo y objetos en cualquier momento.',
      hint_en: 'The [Q] key lets you manage your gear and items at any time.',
      icon: 'assets/icons/backpack.png',
      check: (game, state) => {
        if (Balaclava.UI && Balaclava.UI.activeModal === 'inventory') state.openedInv = true;
        return !!state.openedInv;
      },
      getProgress: (game, state) => {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        if (isEn) return state.openedInv ? 'Inventory checked! ✓' : 'Open your inventory with [Q]';
        return state.openedInv ? '¡Inventario revisado! ✓' : 'Abre tu inventario con [Q]';
      }
    },
    {
      id: 'build_table',
      title: 'La Mesa de Artesanías',
      title_en: 'Crafting Table',
      desc: 'Abre el menú de Construcción pulsando {buildKey}. Selecciona la Mesa de Artesanías y colócala en tu terreno.',
      desc_en: 'Open the Build menu with {buildKey}. Select the Crafting Table and place it on your land.',
      hint: 'Presiona la tecla de construcción para abrir el catálogo.',
      hint_en: 'Press the build key to open the structure catalog.',
      icon: 'assets/icons/campfire.png',
      check: (game) => {
        return game.hasBuilding('mesa_artesania');
      },
      getProgress: (game) => {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        if (isEn) return game.hasBuilding('mesa_artesania') ? 'Table built ✓' : 'Open build menu and place the table';
        return game.hasBuilding('mesa_artesania') ? 'Mesa construida ✓' : 'Abre el menú de construcción y coloca la mesa';
      }
    },
    {
      id: 'use_craft',
      title: 'Uso de Mesas Principales',
      title_en: 'Using Workbenches',
      desc: 'Acércate a la Mesa de Artesanías y pulsa {interactKey} (o haz clic en ella). Fabrica una herramienta mejorada o pieza de equipo.',
      desc_en: 'Approach the Crafting Table and press {interactKey} (or click it). Craft an upgraded tool or piece of gear.',
      hint: 'La mesa te permite forjar picos, espadas, equipo y antorchas.',
      hint_en: 'The table lets you forge pickaxes, swords, gear, and torches.',
      icon: 'assets/icons/anvil.png',
      check: (game, state) => {
        const ui = Balaclava.UI;
        const isCraftModalOpen = ui && (
          ui.activeModal === 'crafting' ||
          (ui.activeModal === 'building' && ui.modalData && (
            ui.modalData.type === 'mesa_artesania' ||
            ui.modalData.type === 'horno' ||
            ui.modalData.type === 'forja' ||
            ui.modalData.type === 'fogata'
          ))
        );
        if (isCraftModalOpen) state.openedCraft = true;

        const hasCraftedOrUpgraded =
          (game.stats && ((game.stats.craftedTotal || 0) > 0 || (game.stats.itemsCrafted || 0) > 0)) ||
          (game.toolTiers && (
            (game.toolTiers.pico && game.toolTiers.pico !== 'basica') ||
            (game.toolTiers.hacha && game.toolTiers.hacha !== 'basica') ||
            Boolean(game.toolTiers.espada) ||
            Boolean(game.toolTiers.pala) ||
            Boolean(game.toolTiers.cana) ||
            Boolean(game.toolTiers.guadana) ||
            Boolean(game.toolTiers.azada) ||
            Boolean(game.toolTiers.arco)
          )) ||
          (game.inventory && Boolean(
            game.inventory.botas_cuero ||
            game.inventory.arm_cuero ||
            game.inventory.antorcha ||
            game.inventory.espada_madera ||
            game.inventory.pico_cobre ||
            game.inventory.hacha_cobre ||
            game.inventory.escudo_madera ||
            game.inventory.lingote_cobre ||
            game.inventory.lingote_hierro
          )) ||
          (game.equipped && Boolean(
            game.equipped.armor ||
            game.equipped.boots ||
            game.equipped.shield ||
            game.equipped.helm
          )) ||
          (Array.isArray(game.craftQueue) && game.craftQueue.length > 0);

        return hasCraftedOrUpgraded;
      },
      getProgress: (game, state) => {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        const ui = Balaclava.UI;
        const isCraftModalOpen = ui && (
          ui.activeModal === 'crafting' ||
          (ui.activeModal === 'building' && ui.modalData && (
            ui.modalData.type === 'mesa_artesania' ||
            ui.modalData.type === 'horno' ||
            ui.modalData.type === 'forja' ||
            ui.modalData.type === 'fogata'
          ))
        );
        if (isCraftModalOpen) state.openedCraft = true;

        if (!state.openedCraft) return isEn ? 'Interact with the Crafting Table' : 'Interactúa con la Mesa de Artesanías';
        return isEn ? 'Craft any tool, weapon, or gear' : 'Fabrica cualquier herramienta, arma o equipo';
      }
    },
    {
      id: 'quests',
      title: 'Registro de Misiones',
      title_en: 'Quest Log',
      desc: 'Pulsa {questKey} (o accede desde el Menú) para consultar tus contratos y misiones. Cumplir encargos otorga oro, gemas y experiencia.',
      desc_en: 'Press {questKey} (or open from Menu) to view contracts and quests. Completing them grants gold, gems, and XP.',
      hint: 'El tablón de misiones te orienta en el progreso del archipiélago.',
      hint_en: 'The quest board guides your progression across the archipelago.',
      icon: 'assets/icons/trophy.png',
      check: (game, state) => {
        if (Balaclava.UI && Balaclava.UI.activeModal === 'quests') state.openedQuests = true;
        return !!state.openedQuests;
      },
      getProgress: (game, state) => {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        if (isEn) return state.openedQuests ? 'Quests checked! ✓' : 'Open the quest log';
        return state.openedQuests ? '¡Misiones consultadas! ✓' : 'Abre el registro de misiones';
      }
    },
    {
      id: 'encyclopedia',
      title: 'La Gran Enciclopedia',
      title_en: 'The Grand Encyclopedia',
      desc: 'Pulsa {encKey} (o accede desde el Menú) para abrir la Enciclopedia. Consulta el Bestiario de monstruos, minerales, reliquias arcanas y recetas descubiertas.',
      desc_en: 'Press {encKey} (or open from Menu) to open the Encyclopedia. Check the monster bestiary, minerals, relics, and recipes.',
      hint: 'Cada hallazgo en el mundo se documenta automáticamente en este compendio.',
      hint_en: 'Every discovery in the world is automatically recorded in this compendium.',
      icon: 'assets/ui/ts_icon_05.png',
      check: (game, state) => {
        if (Balaclava.UI && Balaclava.UI.activeModal === 'encyclopedia') state.openedEnc = true;
        return !!state.openedEnc;
      },
      getProgress: (game, state) => {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        if (isEn) return state.openedEnc ? 'Encyclopedia browsed! ✓' : 'Open the Encyclopedia';
        return state.openedEnc ? '¡Enciclopedia explorada! ✓' : 'Abre la Enciclopedia';
      }
    },
    {
      id: 'buy_island',
      title: 'El Mapa y Tu Primera Isla',
      title_en: 'World Map & First Island',
      desc: 'Se ha abierto el Mapa del Mundo ({mapKey}). Selecciona la Isla Recomendada resaltada en dorado junto a tu isla central y pulsa "Desbloquear Parcela" para expandir tu territorio.',
      desc_en: 'The World Map ({mapKey}) is open. Select the gold-highlighted Recommended Island next to your starting island and press "Unlock Plot" to expand your territory.',
      hint: 'Cada nueva isla desbloquea vetas minerales más ricas, madera, cofres secretos, NPCs y entradas de mazmorra.',
      hint_en: 'Each new island unlocks richer mineral veins, timber, secret chests, NPCs, and dungeon gates.',
      icon: 'assets/icons/crown_sovereign.png',
      check: (game) => {
        return Array.isArray(game.unlockedPlots) && game.unlockedPlots.length >= 2;
      },
      getProgress: (game) => {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        const count = Array.isArray(game.unlockedPlots) ? game.unlockedPlots.length : 1;
        const rec = game && game.tutorialSys && typeof game.tutorialSys.getRecommendedFirstPlot === 'function'
          ? game.tutorialSys.getRecommendedFirstPlot(game)
          : null;
        const price = (rec && game.economy && typeof game.economy.getPlotPrice === 'function')
          ? game.economy.getPlotPrice(game, rec[0], rec[1])
          : 40;
        const coins = Math.floor((game && game.coins) || 0);
        if (isEn) return `Islands: ${count}/2 · Recommended Plot (${rec ? rec[0] + ',' + rec[1] : '4,3'}): ${coins}/${price} coins`;
        return `Islas: ${count}/2 · Isla Recomendada (${rec ? rec[0] + ',' + rec[1] : '4,3'}): ${coins}/${price} monedas`;
      }
    },
    {
      id: 'skills',
      title: 'El Árbol Astral de Habilidades',
      title_en: 'Astral Skill Tree',
      desc: 'Pulsa {skillKey} para contemplar el cielo de constelaciones. Mantén pulsada una estrella durante 2 segundos para aprenderla.',
      desc_en: 'Press {skillKey} to view the star constellations. Hold down on a star for 2 seconds to learn it.',
      hint: 'Gana experiencia para obtener Puntos de Habilidad y activar nuevas magias y oficios.',
      hint_en: 'Earn experience to gain Skill Points and unlock new spells and trades.',
      icon: 'assets/icons/spellbook.png',
      check: (game, state) => {
        const ui = Balaclava.UI;
        const isSkillsOpen = ui && ui.activeModal === 'skills';
        if (isSkillsOpen) state.openedSkills = true;

        const hasSkills = Array.isArray(game.unlockedSkills) && game.unlockedSkills.length > 0;
        return hasSkills || !!state.openedSkills;
      },
      getProgress: (game, state) => {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        const count = Array.isArray(game.unlockedSkills) ? game.unlockedSkills.length : 0;
        if (count > 0) return isEn ? `Skills learned: ${count} ✓` : `Habilidades aprendidas: ${count} ✓`;
        if (state.openedSkills) return isEn ? 'Hold a star to learn a skill' : 'Mantén pulsada una estrella para aprenderla';
        return isEn ? 'Open the Skill Tree [G]' : 'Abre el Árbol de Habilidades [G]';
      }
    }
  ];

  class TutorialSystem {
    constructor() {
      this.step = 0;
      this.done = false;
      this.skipped = false;
      this.stepState = {};
      this._justCompletedTimer = 0;
      this.minimized = false;
    }

    getCurrentStepDef() {
      if (this.done || this.skipped || this.step >= TUTORIAL_STEPS.length) return null;
      return TUTORIAL_STEPS[this.step];
    }

    getFormattedDesc(def, ui) {
      if (!def) return '';
      const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
      const rawDesc = (isEn && def.desc_en) ? def.desc_en : def.desc;
      const getLbl = (actionId, fallback) => {
        if (ui && typeof ui.getKeyLabel === 'function') {
          try {
            const val = ui.getKeyLabel(actionId);
            if (val) return val;
          } catch (_) {}
        }
        const kb = (ui && ui.keybinds) ? ui.keybinds : {};
        const code = kb[actionId] || fallback;
        return String(code || fallback).replace(/^Key/, '');
      };

      const fmt = (lbl) => `<kbd class="tut-key">${lbl}</kbd>`;
      const moveStr = `${fmt(getLbl('moveUp', 'W'))}${fmt(getLbl('moveLeft', 'A'))}${fmt(getLbl('moveDown', 'S'))}${fmt(getLbl('moveRight', 'D'))}`;

      return rawDesc
        .replace('{moveKeys}', moveStr)
        .replace('{dashKey}', fmt(getLbl('dash', isEn ? 'Space' : 'Espacio')))
        .replace('{attackKey}', fmt(isEn ? 'Click' : 'Clic'))
        .replace('{invKey}', fmt(getLbl('inventory', 'Q')))
        .replace('{buildKey}', fmt(getLbl('build', 'R')))
        .replace('{interactKey}', fmt(getLbl('interact', 'E')))
        .replace('{craftKey}', fmt(getLbl('crafting', 'C')))
        .replace('{questKey}', fmt(getLbl('quests', 'X')))
        .replace('{encKey}', fmt(getLbl('encyclopedia', 'L')))
        .replace('{mapKey}', fmt(getLbl('map', 'M')))
        .replace('{skillKey}', fmt(getLbl('skills', 'G')));
    }

    getRecommendedFirstPlot(game) {
      if (!game || !game.world || typeof game.world.isPlotUnlocked !== 'function') return [4, 3];
      const gridPlots = (Balaclava.CONST && Balaclava.CONST.GRID_PLOTS) || 10;
      const candidates = [];
      for (let gy = 0; gy < gridPlots; gy++) {
        for (let gx = 0; gx < gridPlots; gx++) {
          if (game.world.isPlotUnlocked(gx, gy)) continue;
          const adj = game.world.isPlotUnlocked(gx - 1, gy) ||
                      game.world.isPlotUnlocked(gx + 1, gy) ||
                      game.world.isPlotUnlocked(gx, gy - 1) ||
                      game.world.isPlotUnlocked(gx, gy + 1);
          if (!adj) continue;
          const biomeId = (game.world.plotBiomes && game.world.plotBiomes[gy] && game.world.plotBiomes[gy][gx]) || 'pradera';
          const price = (game.economy && typeof game.economy.getPlotPrice === 'function')
            ? game.economy.getPlotPrice(game, gx, gy)
            : 40;
          const distCenter = Math.abs(gx - 4) + Math.abs(gy - 4);
          const isStarterBiome = biomeId === 'pradera' ? 0 : 1;
          candidates.push({ gx, gy, price, distCenter, isStarterBiome });
        }
      }
      if (!candidates.length) return [4, 3];
      candidates.sort((a, b) => {
        if (a.isStarterBiome !== b.isStarterBiome) return a.isStarterBiome - b.isStarterBiome;
        if (a.price !== b.price) return a.price - b.price;
        if (a.distCenter !== b.distCenter) return a.distCenter - b.distCenter;
        if (a.gy !== b.gy) return a.gy - b.gy;
        return a.gx - b.gx;
      });
      return [candidates[0].gx, candidates[0].gy];
    }

    isBuyIslandStepActive(game) {
      if (this.done || this.skipped) return false;
      const def = this.getCurrentStepDef();
      if (def && def.id === 'buy_island') return true;
      return false;
    }

    focusRecommendedIslandInMap(game, openIfClosed = true) {
      if (!game || !game.ui) return null;
      const rec = this.getRecommendedFirstPlot(game);
      if (rec) {
        game.ui.selectedMapPlot = [rec[0], rec[1]];
        game.ui.mapPanX = null;
        game.ui.mapPanY = null;
      }
      if (openIfClosed && game.ui.activeModal !== 'map' && typeof game.ui.openModal === 'function') {
        game.ui.openModal('map');
      } else if (game.ui.activeModal === 'map' && typeof game.ui.renderModal === 'function') {
        game.ui.renderModal();
      }
      return rec;
    }

    update(game, dt) {
      if (this.done || this.skipped) return;
      const def = this.getCurrentStepDef();
      if (!def) {
        this.completeTutorial(game);
        return;
      }

      if (def.id === 'buy_island' && !this.stepState.autoOpenedMap) {
        if (game && game.ui && !game.activeDungeon && !game.ui.activeModal) {
          this.stepState.autoOpenedMap = true;
          this.focusRecommendedIslandInMap(game, true);
        }
      }

      if (def.check && def.check(game, this.stepState)) {
        this.advance(game);
      }
    }

    advance(game) {
      if (Balaclava.Audio) {
        Balaclava.Audio.play('levelup');
        Balaclava.Audio.tone(523.25, 783.99, 0.22, 'triangle', 0.28);
      }

      this.step++;
      this.stepState = {};
      game.uiDirty = true;

      if (this.step >= TUTORIAL_STEPS.length) {
        this.completeTutorial(game);
      } else {
        const nextDef = this.getCurrentStepDef();
        if (nextDef && game.toast) {
          const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
          const nTitle = (isEn && nextDef.title_en) ? nextDef.title_en : nextDef.title;
          const msg = isEn ? `Step complete! Next: ${nTitle}` : `¡Paso completado! Siguiente: ${nTitle}`;
          game.toast(msg, 'success');
        }
      }
    }

    completeTutorial(game) {
      this.done = true;
      this.step = TUTORIAL_STEPS.length;
      if (game) {
        game.addCoins(60);
        game.gainXp(120);
        if (game.toast) {
          const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
          const msg = isEn
            ? 'TUTORIAL COMPLETED! +60 Coins and +120 XP. The archipelago is yours!'
            : '¡TUTORIAL COMPLETADO! +60 Monedas y +120 XP. ¡El archipiélago es tuyo!';
          game.toast(msg, 'success');
        }
        if (game.saveSys) {
          game.saveSys.save(game, game.currentSlot || 1, true);
        }
      }
    }

    skip(game) {
      this.skipped = true;
      this.done = true;
      if (game) {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        const msg = isEn
          ? 'Tutorial skipped. You can reactivate it from Settings if needed.'
          : 'Tutorial omitido. Puedes reactivarlo desde Ajustes si lo necesitas.';
        if (game.toast) game.toast(msg, 'info');
        if (game.saveSys) game.saveSys.save(game, game.currentSlot || 1, true);
        game.uiDirty = true;
      }
    }

    reset(game) {
      this.step = 0;
      this.done = false;
      this.skipped = false;
      this.stepState = {};
      this.minimized = false;
      if (game) {
        const isEn = Balaclava.I18n && Balaclava.I18n.getLanguage() === 'en';
        const msg = isEn ? 'Tutorial reset.' : 'Tutorial reiniciado.';
        if (game.toast) game.toast(msg, 'info');
        game.uiDirty = true;
      }
    }
  }

  Balaclava.TUTORIAL_STEPS = TUTORIAL_STEPS;
  Balaclava.TutorialSystem = TutorialSystem;
})();
