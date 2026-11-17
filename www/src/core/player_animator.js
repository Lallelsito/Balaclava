(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});

  // 24x24 px cell dimensions from reference sprite sheet
  const CELL_W = 24;
  const CELL_H = 24;
  const SHEET_COLS = 8;
  const SHEET_ROWS = 6;
  const DRAW_SCALE = 2.0; // Scaled 2x to 48x48 px, exactly matching Balaclava's 48px tile grid
  const DRAW_OFFSET_X = -24;
  const DRAW_OFFSET_Y = -38; // Places feet resting naturally at y = +8 directly over the ground shadow

  // 16 Tool & Equipment Tiers
  const TIERS = [
    'basica', 'mejorada', 'cobre', 'hierro', 'plata',
    'oro', 'platino', 'acero', 'cristal', 'mitrilo',
    'titanio', 'adamantita', 'oricalco', 'legendaria', 'celestial', 'omega'
  ];

  // Visual Palette and FX per Tier
  const TIER_FX = {
    basica:     { color: '#b0bec5', highlight: '#cfd8dc', glow: null },
    mejorada:   { color: '#81c784', highlight: '#a5d6a7', glow: 'rgba(129, 199, 132, 0.25)' },
    cobre:      { color: '#ffab91', highlight: '#ffccbc', glow: 'rgba(255, 171, 145, 0.35)' },
    hierro:     { color: '#90caf9', highlight: '#bbdefb', glow: 'rgba(144, 202, 249, 0.35)' },
    plata:      { color: '#eceff1', highlight: '#ffffff', glow: 'rgba(255, 255, 255, 0.45)' },
    oro:        { color: '#ffd54f', highlight: '#fff9c4', glow: 'rgba(255, 213, 79, 0.50)' },
    platino:    { color: '#80deea', highlight: '#e0f7fa', glow: 'rgba(128, 222, 234, 0.50)' },
    acero:      { color: '#64b5f6', highlight: '#90caf9', glow: 'rgba(100, 181, 246, 0.55)' },
    cristal:    { color: '#80d8ff', highlight: '#e1f5fe', glow: 'rgba(128, 216, 255, 0.65)' },
    mitrilo:    { color: '#a7ffeb', highlight: '#e0f2f1', glow: 'rgba(167, 255, 235, 0.65)' },
    titanio:    { color: '#b0bec5', highlight: '#ffffff', glow: 'rgba(176, 190, 197, 0.65)' },
    adamantita: { color: '#78909c', highlight: '#ff5252', glow: 'rgba(255, 82, 82, 0.60)' },
    oricalco:   { color: '#ff7043', highlight: '#ffd54f', glow: 'rgba(255, 112, 67, 0.70)' },
    legendaria: { color: '#ffb74d', highlight: '#fff8e1', glow: 'rgba(255, 183, 77, 0.75)' },
    celestial:  { color: '#4fc3f7', highlight: '#ffffff', glow: 'rgba(79, 195, 247, 0.85)' },
    omega:      { color: '#e040fb', highlight: '#ea80fc', glow: 'rgba(224, 64, 251, 0.90)' }
  };

  // Base socket offsets for cells (in 24x24 pixel coordinates, top-left of cell)
  // When scaled 2x: screen_x = (socket.x - 12) * 2; screen_y = socket.y * 2 - 38
  const DEFAULT_SOCKETS = {
    head:    { x: 11.5, y: 11.0 },
    torso:   { x: 11.5, y: 17.5 },
    legs:    { x: 11.5, y: 21.0 },
    feet:    { x: 11.5, y: 23.0 },
    mainHand:{ x: 16.0, y: 18.0 },
    offHand: { x: 7.0,  y: 18.0 },
    back:    { x: 6.5,  y: 16.5 }
  };

  // Dedicated socket overrides for specialized poses in sheet
  const CELL_SOCKETS = {
    // Row 0 Col 4: Crouch / Anticipation
    '0_4': { head: { x: 11.5, y: 13.0 }, torso: { x: 11.5, y: 19.0 }, legs: { x: 11.5, y: 22.0 }, feet: { x: 11.5, y: 23.0 }, mainHand: { x: 12.0, y: 10.0 }, offHand: { x: 8.0, y: 12.0 }, back: { x: 6.0, y: 18.0 } },
    // Row 0 Col 6: Arms Raised / Channeling
    '0_6': { head: { x: 11.0, y: 11.0 }, torso: { x: 11.0, y: 17.0 }, legs: { x: 11.0, y: 21.0 }, feet: { x: 11.0, y: 23.0 }, mainHand: { x: 14.5, y: 8.0 }, offHand: { x: 7.5, y: 8.0 }, back: { x: 6.0, y: 16.0 } },
    // Row 3 Col 0: Melee Windup / Coil
    '3_0': { head: { x: 11.5, y: 12.0 }, torso: { x: 11.5, y: 18.0 }, legs: { x: 11.5, y: 21.5 }, feet: { x: 11.5, y: 23.0 }, mainHand: { x: 8.0, y: 14.0 }, offHand: { x: 14.0, y: 17.0 }, back: { x: 6.0, y: 17.0 } },
    // Row 3 Col 1: Bomb Windup
    '3_1': { head: { x: 11.5, y: 13.0 }, torso: { x: 11.5, y: 19.0 }, legs: { x: 11.5, y: 22.0 }, feet: { x: 11.5, y: 23.0 }, mainHand: { x: 7.0, y: 11.0 }, offHand: { x: 15.0, y: 18.0 }, back: { x: 6.0, y: 18.0 } },
    // Row 3 Col 2: Axe High Windup
    '3_2': { head: { x: 11.5, y: 10.0 }, torso: { x: 11.5, y: 16.0 }, legs: { x: 11.5, y: 21.0 }, feet: { x: 11.5, y: 23.0 }, mainHand: { x: 8.0, y: 10.0 }, offHand: { x: 13.0, y: 14.0 }, back: { x: 6.0, y: 16.0 } },
    // Row 3 Col 3: Channeling Focus
    '3_3': { head: { x: 11.5, y: 9.0 }, torso: { x: 11.5, y: 15.0 }, legs: { x: 11.5, y: 20.0 }, feet: { x: 11.5, y: 22.0 }, mainHand: { x: 15.0, y: 12.0 }, offHand: { x: 8.0, y: 12.0 }, back: { x: 6.0, y: 15.0 } },
    // Row 3 Col 4: Dash Aerodynamic Lean
    '3_4': { head: { x: 13.0, y: 10.0 }, torso: { x: 12.0, y: 16.0 }, legs: { x: 10.0, y: 21.0 }, feet: { x: 9.0, y: 23.0 }, mainHand: { x: 16.0, y: 17.0 }, offHand: { x: 6.0, y: 17.0 }, back: { x: 5.0, y: 15.0 } },
    // Row 3 Col 5: Low Shovel Crouch
    '3_5': { head: { x: 11.5, y: 13.0 }, torso: { x: 11.5, y: 19.0 }, legs: { x: 11.5, y: 22.0 }, feet: { x: 11.5, y: 23.0 }, mainHand: { x: 14.0, y: 20.0 }, offHand: { x: 8.0, y: 18.0 }, back: { x: 6.0, y: 18.0 } },
    // Row 4 Col 0: Shovel Scoop Lift
    '4_0': { head: { x: 11.5, y: 12.0 }, torso: { x: 11.5, y: 18.0 }, legs: { x: 11.5, y: 22.0 }, feet: { x: 11.5, y: 23.0 }, mainHand: { x: 15.0, y: 15.0 }, offHand: { x: 9.0, y: 16.0 }, back: { x: 6.0, y: 17.0 } },
    // Row 4 Col 1: Forward Strike / Pitch / Release
    '4_1': { head: { x: 12.5, y: 11.0 }, torso: { x: 12.0, y: 17.0 }, legs: { x: 11.0, y: 21.5 }, feet: { x: 11.0, y: 23.0 }, mainHand: { x: 18.0, y: 16.0 }, offHand: { x: 6.0, y: 17.0 }, back: { x: 5.0, y: 16.0 } },
    // Row 4 Col 2: Recovery Follow-Through
    '4_2': { head: { x: 11.5, y: 10.0 }, torso: { x: 11.5, y: 16.0 }, legs: { x: 11.5, y: 21.0 }, feet: { x: 11.5, y: 23.0 }, mainHand: { x: 16.0, y: 17.0 }, offHand: { x: 7.0, y: 17.0 }, back: { x: 6.0, y: 16.0 } },
    // Row 4 Col 3: Downward Hammer / Pickaxe Strike
    '4_3': { head: { x: 12.0, y: 11.5 }, torso: { x: 12.0, y: 17.5 }, legs: { x: 11.0, y: 21.5 }, feet: { x: 11.0, y: 23.0 }, mainHand: { x: 17.0, y: 21.0 }, offHand: { x: 8.0, y: 18.0 }, back: { x: 6.0, y: 17.0 } },
    // Row 4 Col 4: Diagonal Axe Chop
    '4_4': { head: { x: 12.0, y: 11.5 }, torso: { x: 12.0, y: 17.5 }, legs: { x: 11.0, y: 21.5 }, feet: { x: 11.0, y: 23.0 }, mainHand: { x: 17.5, y: 18.0 }, offHand: { x: 7.0, y: 17.0 }, back: { x: 6.0, y: 17.0 } },
    // Row 4 Col 5: Low Harvest Reap
    '4_5': { head: { x: 12.5, y: 12.0 }, torso: { x: 12.0, y: 18.0 }, legs: { x: 11.5, y: 22.0 }, feet: { x: 11.5, y: 23.0 }, mainHand: { x: 16.0, y: 21.0 }, offHand: { x: 8.0, y: 19.0 }, back: { x: 6.0, y: 17.5 } },
    // Row 4 Col 6: Death Stagger Falling
    '4_6': { head: { x: 15.0, y: 14.0 }, torso: { x: 13.0, y: 19.0 }, legs: { x: 10.0, y: 22.0 }, feet: { x: 9.0, y: 23.0 }, mainHand: { x: 16.0, y: 20.0 }, offHand: { x: 8.0, y: 20.0 }, back: { x: 6.0, y: 18.0 } },
    // Row 4 Col 7: Death Lying Flat on Ground
    '4_7': { head: { x: 17.0, y: 18.0 }, torso: { x: 13.0, y: 21.0 }, legs: { x: 9.0, y: 22.5 }, feet: { x: 8.0, y: 23.0 }, mainHand: { x: 15.0, y: 22.0 }, offHand: { x: 11.0, y: 22.0 }, back: { x: 10.0, y: 20.0 } },
    // Row 5 Col 0 & Col 1: Triumph
    '5_0': { head: { x: 11.5, y: 12.0 }, torso: { x: 11.5, y: 18.0 }, legs: { x: 11.5, y: 21.5 }, feet: { x: 11.5, y: 23.0 }, mainHand: { x: 16.0, y: 14.0 }, offHand: { x: 7.0, y: 14.0 }, back: { x: 6.0, y: 17.0 } },
    '5_1': { head: { x: 11.5, y: 13.0 }, torso: { x: 11.5, y: 19.0 }, legs: { x: 11.5, y: 22.0 }, feet: { x: 11.5, y: 23.0 }, mainHand: { x: 17.0, y: 15.0 }, offHand: { x: 6.0, y: 15.0 }, back: { x: 6.0, y: 18.0 } }
  };

  function getIcon(key) {
    if (typeof document === 'undefined') return null;
    return (Balaclava.Assets && Balaclava.Assets.getItemIconCanvas)
      ? Balaclava.Assets.getItemIconCanvas(key)
      : null;
  }

  class PlayerAnimator {
    constructor() {
      this.cachedSheet = null;
      this.currentAction = 'idle';
      this.actionTimer = 0;
      this.actionDur = 0.35;
      this.actionProg = 0;
      this.trailParticles = [];
    }

    getSheet(assets) {
      if (this.cachedSheet && this.cachedSheet.complete && this.cachedSheet.naturalWidth > 0) {
        return this.cachedSheet;
      }
      this.cachedSheet = assets.get('pawn_custom_sheet')
        || (assets.preloadedUrls && assets.preloadedUrls['assets/sprites_extra/player_pawn_sheet.png'])
        || (assets.images && assets.images['pawn_custom_sheet'])
        || null;
      return this.cachedSheet;
    }

    // Determine the active state machine state from engine inputs
    resolveState(game, p) {
      if (p.deadTimer > 0) return 'death';
      if (p.dashTimer > 0) return 'dash';

      if (p.swingTimer > 0) {
        const itemDef = p.swingItemId ? (Balaclava.ITEMS && Balaclava.ITEMS[p.swingItemId]) : null;
        if (itemDef) {
          if (itemDef.isLaserWeapon) return 'laser_wand';
          if (itemDef.isBomb) return 'throw_bomb';
          if (itemDef.isStaffWeapon) return 'spellcasting';
          if (itemDef.isRangedWeapon) return 'bow_shooting';
          if (itemDef.isSpecialBlade || itemDef.weaponMelee) return 'attack';
        }

        const tool = p.swingTool;
        if (tool === 'pico') return 'mining';
        if (tool === 'hacha') return 'chopping';
        if (tool === 'pala') return 'digging';
        if (tool === 'guadana' || tool === 'azada') return 'harvesting';
        if (tool === 'arco') return 'bow_shooting';
        if (tool === 'cana') return 'fishing';
        if (tool === 'espada') return 'attack';
        return 'attack';
      }

      // Check held weapon aiming / charging states
      const heldSlot = game.hotbar && game.hotbar[game.activeSlot];
      const heldItem = heldSlot && heldSlot.kind === 'item' ? Balaclava.ITEMS[heldSlot.id] : null;
      if (heldItem && heldItem.isLaserWeapon) return 'laser_wand_ready';
      if (p.bowReloadTimer > 0) return 'bow_reload';

      if (p.moving) {
        const speedMult = 1 + (game.mods && game.mods.moveSpeed ? game.mods.moveSpeed : 0);
        return speedMult >= 1.25 ? 'run' : 'walk';
      }

      return 'idle';
    }

    // Resolves row and col in the 8x6 sheet, plus local progress within state
    getFrame(state, game, p) {
      let r = 0, c = 0;
      let prog = 0;

      if (p.swingTimer > 0) {
        prog = Balaclava.Utils.clamp(1 - p.swingTimer / Math.max(0.01, p.swingDur), 0, 0.99);
      }

      switch (state) {
        case 'death': {
          const elapsed = Math.max(0, (p.deadMax || 10.0) - p.deadTimer);
          if (elapsed < 0.22) {
            r = 3; c = 7; // Stagger flinch
          } else if (elapsed < 0.46) {
            r = 4; c = 6; // Collapsing backward
          } else {
            r = 4; c = 7; // Lying flat on ground
          }
          break;
        }

        case 'dash': {
          r = 3; c = 4; // Aerodynamic forward lean
          break;
        }

        case 'attack': {
          if (prog < 0.28) {
            r = 3; c = 0; // Anticipation / coil back
          } else if (prog < 0.72) {
            r = 4; c = 1; // Decisive forward slash
          } else {
            r = 4; c = 2; // Follow-through recovery
          }
          break;
        }

        case 'mining': {
          if (prog < 0.35) {
            r = 0; c = 4; // Raise pickaxe high overhead
          } else if (prog < 0.75) {
            r = 4; c = 3; // Powerful downward smash onto mineral
          } else {
            r = 0; c = 5; // Rebound & return
          }
          break;
        }

        case 'chopping': {
          if (prog < 0.35) {
            r = 3; c = 2; // High lateral windup at shoulder
          } else if (prog < 0.75) {
            r = 4; c = 4; // Diagonal/horizontal slash across chest
          } else {
            r = 4; c = 2; // Natural follow-through
          }
          break;
        }

        case 'digging': {
          if (prog < 0.32) {
            r = 3; c = 5; // Low crouch, shovel angled at soil
          } else if (prog < 0.74) {
            r = 4; c = 0; // Scoop dirt up
          } else {
            r = 0; c = 0; // Return upright
          }
          break;
        }

        case 'harvesting': {
          if (prog < 0.30) {
            r = 4; c = 5; // Crouch low towards plant base
          } else if (prog < 0.72) {
            r = 4; c = 5; // Sweeping cut at crop roots
          } else {
            r = 5; c = 0; // Triumphant gather
          }
          break;
        }

        case 'spellcasting': {
          if (prog < 0.45) {
            r = 0; c = 6; // Both hands raised high aloft channeling
          } else if (prog < 0.72) {
            r = 3; c = 3; // Focused arcane gathering
          } else {
            r = 4; c = 1; // Forward thrust spell release
          }
          break;
        }

        case 'bow_shooting': {
          if (prog < 0.65) {
            r = 0; c = 1; // Torso profile, drawing string
          } else {
            r = 4; c = 2; // Recoil release
          }
          break;
        }

        case 'bow_reload': {
          r = 0; c = 2; // Ready aiming stance with bow
          break;
        }

        case 'laser_wand': {
          r = 0; c = 2; // Straight arm pointing wand
          break;
        }

        case 'laser_wand_ready': {
          r = 0; c = 2; // Ready posture
          break;
        }

        case 'throw_bomb': {
          if (prog < 0.38) {
            r = 3; c = 1; // Arm wound back holding bomb
          } else if (prog < 0.70) {
            r = 4; c = 1; // Pitch forward release
          } else {
            r = 4; c = 2; // Recovery
          }
          break;
        }

        case 'fishing': {
          r = 4; c = 1; // Cast / reel stance
          break;
        }

        case 'run': {
          // Row 2: 8-frame run cycle
          const frameIdx = Math.floor(p.animTimer * 12) % 8;
          r = 2; c = frameIdx;
          break;
        }

        case 'walk': {
          // Row 1: 8-frame walk cycle
          const frameIdx = Math.floor(p.animTimer * 8.5) % 8;
          r = 1; c = frameIdx;
          break;
        }

        case 'idle':
        default: {
          // Row 0: Subtle breathing loop across cols 0..3 (or ping-pong 0, 1, 0, 7)
          const breatheIdx = Math.floor(p.animTimer * 4.2) % 4;
          const map = [0, 1, 2, 1];
          r = 0; c = map[breatheIdx];
          break;
        }
      }

      return { r, c, prog };
    }

    // Get screen-space sockets for the active frame
    getSockets(r, c) {
      const key = `${r}_${c}`;
      const base = CELL_SOCKETS[key] || DEFAULT_SOCKETS;
      return {
        head:     { x: (base.head.x - 12) * DRAW_SCALE,     y: base.head.y * DRAW_SCALE + DRAW_OFFSET_Y },
        torso:    { x: (base.torso.x - 12) * DRAW_SCALE,    y: base.torso.y * DRAW_SCALE + DRAW_OFFSET_Y },
        legs:     { x: (base.legs.x - 12) * DRAW_SCALE,     y: base.legs.y * DRAW_SCALE + DRAW_OFFSET_Y },
        feet:     { x: (base.feet.x - 12) * DRAW_SCALE,     y: base.feet.y * DRAW_SCALE + DRAW_OFFSET_Y },
        mainHand: { x: (base.mainHand.x - 12) * DRAW_SCALE, y: base.mainHand.y * DRAW_SCALE + DRAW_OFFSET_Y },
        offHand:  { x: (base.offHand.x - 12) * DRAW_SCALE,  y: base.offHand.y * DRAW_SCALE + DRAW_OFFSET_Y },
        back:     { x: (base.back.x - 12) * DRAW_SCALE,     y: base.back.y * DRAW_SCALE + DRAW_OFFSET_Y }
      };
    }

    // Primary entry point called every render frame from game.js
    draw(game, ctx) {
      const p = game.player;
      if (!p) return;

      // Invulnerability blink (except while dying)
      if (p.invuln > 0 && !p.deadTimer && Math.floor(game.time * 20) % 2 === 0) return;

      const assets = Balaclava.Assets;
      const sheet = this.getSheet(assets);
      const state = this.resolveState(game, p);
      const { r, c, prog } = this.getFrame(state, game, p);
      const sockets = this.getSockets(r, c);

      // Dash trail particles
      if (state === 'dash' && (!game.settings || game.settings.particles !== false)) {
        if (Math.random() < 0.45 && game.spawnFx) {
          game.spawnFx('walkDust', p.x + (Math.random() - 0.5) * 8, p.y + 10, 0, 0.22, 0.8, 0.4);
        }
      }

      ctx.save();
      ctx.translate(Math.round(p.x), Math.round(p.y));

      // 1. Ground Shadow (adapted when flat on ground or mid-air)
      if (state !== 'death' || p.deadTimer > (p.deadMax || 10.0) - 0.46) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        const shadowW = state === 'dash' ? 18 : 14;
        const shadowH = state === 'dash' ? 4 : 6;
        ctx.ellipse(0, 10, shadowW, shadowH, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Quantized death mound shadow
        ctx.fillStyle = 'rgba(10, 4, 8, 0.48)';
        ctx.fillRect(-14, 8, 28, 6);
        ctx.fillRect(-10, 6, 20, 2);
      }

      // Facing orientation: flip horizontally if facing left
      ctx.scale(p.facing || 1, 1);

      // Layer 0: Back items (Backpack, Quiver, Stowed Shield)
      this.drawBackLayer(ctx, game, p, sockets, state);

      // Layer 1: Base Character Pawn Body
      if (sheet && sheet.complete && sheet.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          sheet,
          c * CELL_W, r * CELL_H, CELL_W, CELL_H,
          DRAW_OFFSET_X, DRAW_OFFSET_Y, CELL_W * DRAW_SCALE, CELL_H * DRAW_SCALE
        );
      } else {
        // High-contrast pixel-art fallback placeholder
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(-10, -32, 20, 32);
        ctx.fillStyle = '#111111';
        ctx.fillRect(-6, -26, 3, 5);
        ctx.fillRect(3, -26, 3, 5);
      }

      // Layer 2: Armor Overlays (Legs, Boots, Torso, Helmet)
      this.drawArmorOverlays(ctx, game, p, sockets, state, r, c);

      // Layer 3: Off-Hand Equipment (Combat Shield or Bow Stave)
      this.drawOffHand(ctx, game, p, sockets, state);

      // Layer 4: Main-Hand Tool / Weapon (Strictly anchored to hand socket)
      this.drawMainHand(ctx, game, p, sockets, state, prog);

      // Layer 5: Weapon Trails & Slashes
      this.drawCombatVfx(ctx, game, p, sockets, state, prog);

      // Layer 6: Permanent Relics (e.g. Floating Lantern)
      this.drawPermanentRelics(ctx, game, p);

      ctx.restore();

      // Death Soul Wisp (rendered in world space if fallen)
      if (state === 'death') {
        this.drawDeathSoulWisp(game, ctx, p);
      }
    }

    // Renders equipped backpacks, quivers, or sheathed shields on back socket
    drawBackLayer(ctx, game, p, sockets, state) {
      if (state === 'death') return;
      const bSocket = sockets.back;

      // Check equipped backpack
      const eqBackpack = game.equipped && game.equipped.backpack;
      const backpackItem = eqBackpack ? Balaclava.ITEMS[eqBackpack] : null;

      if (backpackItem) {
        ctx.save();
        ctx.translate(bSocket.x, bSocket.y);
        const bImg = getIcon(backpackItem.icon || 'mochila_cuero');
        if (bImg) {
          ctx.drawImage(bImg, -10, -10, 20, 20);
        } else {
          // Pixel-art styled leather backpack
          ctx.fillStyle = backpackItem.id === 'mochila_astral' ? '#7e57c2' : backpackItem.id === 'mochila_reforzada' ? '#78909c' : '#795548';
          ctx.fillRect(-8, -8, 10, 14);
          ctx.fillStyle = '#ffd54f';
          ctx.fillRect(-5, -3, 4, 3); // buckle
        }
        ctx.restore();
      }

      // If shield equipped but NOT blocking / attacking with it, show on back
      const eqShield = game.equipped && game.equipped.shield;
      if (eqShield && state !== 'attack' && p.swingTool !== 'espada' && p.swingTool !== 'guadana') {
        const shieldItem = Balaclava.ITEMS[eqShield];
        if (shieldItem && !backpackItem) {
          ctx.save();
          ctx.translate(bSocket.x - 2, bSocket.y);
          ctx.rotate(-0.15);
          const sImg = getIcon(shieldItem.icon);
          if (sImg) {
            ctx.drawImage(sImg, -8, -8, 16, 16);
          }
          ctx.restore();
        }
      }
    }

    // Renders modular armor pieces mapped to the 16 tiers
    drawArmorOverlays(ctx, game, p, sockets, state, r, c) {
      if (state === 'death' && r === 4 && c === 7) return; // Completely resting flat on ground

      const eq = game.equipped || {};
      const tiers = game.armorTiers || {};

      // 1. Leggings / Pants Layer
      if (eq.legs) {
        const item = Balaclava.ITEMS[eq.legs];
        const itemId = item ? item.id : String(eq.legs);
        const color = itemId.includes('hierro') ? '#90caf9' : itemId.includes('acero') ? '#64b5f6' : '#8d6e63';
        ctx.save();
        ctx.fillStyle = color;
        // Two subtle pant cuffs tracking leg socket
        ctx.fillRect(sockets.legs.x - 5, sockets.legs.y - 2, 4, 4);
        ctx.fillRect(sockets.legs.x + 1, sockets.legs.y - 2, 4, 4);
        ctx.restore();
      }

      // 2. Boots Layer
      if (eq.boots) {
        const item = Balaclava.ITEMS[eq.boots];
        const itemId = item ? item.id : String(eq.boots);
        const color = itemId.includes('hierro') ? '#78909c' : itemId.includes('viento') ? '#4fc3f7' : '#5d4037';
        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(sockets.feet.x - 6, sockets.feet.y - 2, 4, 3);
        ctx.fillRect(sockets.feet.x + 2, sockets.feet.y - 2, 4, 3);
        ctx.restore();
      }

      // 3. Torso Armor / Chestplate Layer
      if (eq.armor) {
        const item = Balaclava.ITEMS[eq.armor];
        const tierName = (item && item.tier && TIERS[item.tier]) || (tiers.armor) || 'basica';
        const tDef = TIER_FX[tierName] || TIER_FX.basica;
        const color = tDef ? tDef.color : '#cfd8dc';
        const hl = tDef ? tDef.highlight : '#ffffff';

        ctx.save();
        ctx.translate(sockets.torso.x, sockets.torso.y);

        // Armor Plate Pixel Art
        ctx.fillStyle = '#263238'; // Dark metal outline
        ctx.fillRect(-6, -6, 12, 10);
        ctx.fillStyle = color;
        ctx.fillRect(-5, -5, 10, 8);
        ctx.fillStyle = hl;
        ctx.fillRect(-4, -4, 3, 2); // Highlight gleam

        // Tier specialty glow
        if (tDef && tDef.glow) {
          ctx.fillStyle = tDef.glow;
          ctx.fillRect(-6, -6, 12, 10);
        }
        ctx.restore();
      }

      // 4. Helmet / Hat / Crown Layer
      if (eq.helm) {
        const item = Balaclava.ITEMS[eq.helm];
        const itemId = item ? item.id : String(eq.helm);
        const tierName = (item && item.tier && TIERS[item.tier]) || (tiers.helm) || 'basica';
        const tDef = TIER_FX[tierName] || TIER_FX.basica;
        const color = tDef ? tDef.color : '#ffd54f';
        const hl = tDef ? tDef.highlight : '#fff9c4';

        ctx.save();
        ctx.translate(sockets.head.x, sockets.head.y);

        if (itemId === 'corona_soberana' || itemId.includes('oro') || itemId.includes('cristal')) {
          // Radiant Crown
          ctx.fillStyle = '#ff8f00';
          ctx.fillRect(-7, -11, 14, 4);
          ctx.fillStyle = color;
          ctx.fillRect(-6, -12, 3, 4);
          ctx.fillRect(-1, -13, 2, 5);
          ctx.fillRect(3, -12, 3, 4);
          // Gem
          ctx.fillStyle = itemId.includes('cristal') ? '#80d8ff' : '#ef5350';
          ctx.fillRect(-1, -11, 2, 2);
        } else if (itemId.includes('balaclava')) {
          // Royal Balaclava Hood
          ctx.fillStyle = '#ffb300';
          ctx.fillRect(-8, -12, 16, 5);
          ctx.fillStyle = '#b71c1c';
          ctx.fillRect(-6, -10, 12, 3);
        } else {
          // Knight Visor / Cap
          ctx.fillStyle = '#37474f';
          ctx.fillRect(-8, -12, 16, 6);
          ctx.fillStyle = color;
          ctx.fillRect(-7, -11, 14, 4);
          ctx.fillStyle = hl;
          ctx.fillRect(-6, -10, 4, 1);
        }

        // Helmet Tier Aura
        if (tDef && tDef.glow) {
          ctx.fillStyle = tDef.glow;
          ctx.fillRect(-8, -13, 16, 7);
        }
        ctx.restore();
      }
    }

    // Renders off-hand items: combat shield or bow stave
    drawOffHand(ctx, game, p, sockets, state) {
      if (state === 'death') return;
      const off = sockets.offHand;

      // Shield in Combat Stance
      const eqShield = game.equipped && game.equipped.shield;
      if (eqShield && (state === 'attack' || p.swingTool === 'espada' || p.swingTool === 'guadana' || (game.selectedEnemy && game.selectedEnemy.hp > 0))) {
        const shieldItem = Balaclava.ITEMS[eqShield];
        if (shieldItem) {
          ctx.save();
          ctx.translate(off.x - 3, off.y - 1);
          const sImg = getIcon(shieldItem.icon);
          if (sImg) {
            ctx.drawImage(sImg, -10, -10, 20, 20);
          } else {
            ctx.fillStyle = '#b0bec5';
            ctx.fillRect(-7, -9, 14, 18);
            ctx.fillStyle = '#37474f';
            ctx.fillRect(-5, -7, 10, 14);
          }
          ctx.restore();
        }
      }
    }

    // Renders tools and weapons strictly anchored to the main hand socket
    drawMainHand(ctx, game, p, sockets, state, prog) {
      if (state === 'death') return;
      const hand = sockets.mainHand;

      // 1. Bow shooting & reload
      if (state === 'bow_shooting' || state === 'bow_reload') {
        this.drawBowInHand(ctx, game, p, sockets, state, prog);
        return;
      }

      // 2. Laser Wand Weapon
      if (state === 'laser_wand' || state === 'laser_wand_ready') {
        this.drawLaserWandInHand(ctx, game, p, sockets, state);
        return;
      }

      // 3. Bomb Throwing
      if (state === 'throw_bomb') {
        this.drawBombInHand(ctx, game, p, sockets, prog);
        return;
      }

      // 4. Primary Tool / Blade / Staff / Scythe / Pickaxe / Axe / Shovel / Sickle
      if (p.swingTimer > 0) {
        const tierId = (game.toolTiers && game.toolTiers[p.swingTool]) || 'basica';
        const isSpecial = !!(p.swingItemId && Balaclava.ITEMS && Balaclava.ITEMS[p.swingItemId]);
        let toolImg = null;
        if (isSpecial) {
          toolImg = getIcon(p.swingItemId);
        }
        if (!toolImg) {
          toolImg = Balaclava.Assets.getToolImg
            ? Balaclava.Assets.getToolImg(p.swingTool, tierId)
            : getIcon(p.swingTool);
        }
        if (!toolImg) return;

        ctx.save();

        // Calculate dynamic swing angle and trajectory based on the specific action
        let toolAngle = p.swingAngle || 0;
        let reachX = hand.x;
        let reachY = hand.y;
        const facing = p.facing || 1;

        if (state === 'mining') {
          // Overhead downward pickaxe swing
          const swingArc = (prog - 0.40) * 3.0 * facing;
          toolAngle = toolAngle + swingArc + Math.PI / 4;
          reachX += Math.cos(toolAngle) * 8;
          reachY += Math.sin(toolAngle) * 8;
        } else if (state === 'chopping') {
          // Horizontal diagonal axe slash
          const swingArc = (prog - 0.38) * 2.8 * facing;
          toolAngle = toolAngle + swingArc + Math.PI / 4;
          reachX += Math.cos(toolAngle) * 10;
          reachY += Math.sin(toolAngle) * 6;
        } else if (state === 'digging') {
          // Low scoop into ground and lift
          const scoopRot = Math.sin(prog * Math.PI) * 0.8 * facing;
          toolAngle = (Math.PI * 0.35) * facing + scoopRot;
          reachY += (prog < 0.5 ? prog * 10 : (1 - prog) * 10);
        } else if (state === 'harvesting') {
          // Low sweeping curved reap
          const reapRot = (prog - 0.5) * 2.2 * facing;
          toolAngle = toolAngle + reapRot + Math.PI / 4;
        } else if (state === 'spellcasting') {
          // Staff raised aloft then cast forward
          toolAngle = prog < 0.5 ? (-Math.PI / 2) : (toolAngle + Math.PI / 4);
        } else {
          // Standard melee slash / attack
          const swingRot = (prog - 0.42) * 2.8 * facing + Math.PI / 4;
          toolAngle = toolAngle + swingRot;
          const reach = 10 + Math.sin(prog * Math.PI) * 12;
          reachX += Math.cos(toolAngle) * reach;
          reachY += Math.sin(toolAngle) * reach;
        }

        ctx.translate(reachX, reachY);
        ctx.rotate(toolAngle);

        // Tier Aura Shimmer around tool head
        const tDef = TIER_FX[tierId] || TIER_FX.basica;
        if (tDef && tDef.glow) {
          const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
          aura.addColorStop(0, tDef.glow);
          aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
        }

        const sz = isSpecial ? 28 : (p.swingTool === 'guadana' ? 32 : 26);
        // Anchor tool by its handle (pivot near base -sz/3)
        ctx.drawImage(toolImg, -sz / 3, -sz / 2, sz, sz);
        ctx.restore();
      }
    }

    // Bow drawing, taut string, and arrow release
    drawBowInHand(ctx, game, p, sockets, state, prog) {
      const bowTier = (game.toolTiers && game.toolTiers.arco) || 'basica';
      const bowImg = Balaclava.Assets.getToolImg ? Balaclava.Assets.getToolImg('arco', bowTier) : null;
      if (!bowImg) return;

      const hand = sockets.mainHand;
      const ang = p.swingAngle || 0;
      const isFiring = state === 'bow_shooting';
      const drawPhase = isFiring ? (prog < 0.65 ? (prog / 0.65) : 1 - ((prog - 0.65) / 0.35)) : 0.85;
      const recoil = (isFiring && prog >= 0.65) ? (prog - 0.65) * 8 : 0;

      ctx.save();
      ctx.translate(hand.x - recoil * Math.cos(ang), hand.y - recoil * Math.sin(ang));
      ctx.rotate(ang);

      // Taut Bowstring
      const pullBack = -4 - drawPhase * 8;
      ctx.strokeStyle = 'rgba(255, 248, 225, 0.95)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(2, -11);
      ctx.lineTo(pullBack, 0);
      ctx.lineTo(2, 11);
      ctx.stroke();

      // Bow Stave (rotated +45 deg to align isometric icon along firing vector)
      ctx.save();
      ctx.rotate(Math.PI / 4);
      ctx.drawImage(bowImg, -13, -13, 26, 26);
      ctx.restore();

      // Nocked arrow (visible while drawing string before release)
      if (!isFiring || prog < 0.68) {
        ctx.fillStyle = '#bcaaa4';
        ctx.fillRect(pullBack, -1, 16, 2);
        // Arrowhead
        ctx.fillStyle = '#eceff1';
        ctx.beginPath();
        ctx.moveTo(pullBack + 18, 0);
        ctx.lineTo(pullBack + 13, -3);
        ctx.lineTo(pullBack + 13, 3);
        ctx.closePath();
        ctx.fill();
        // Fletching
        ctx.fillStyle = '#ef5350';
        ctx.fillRect(pullBack - 2, -2, 3, 4);
      }

      ctx.restore();

      // Bow Reload Timer Bar above character
      if (p.bowReloadTimer > 0 && p.bowReloadDur > 0) {
        const relProg = Balaclava.Utils.clamp(1 - p.bowReloadTimer / p.bowReloadDur, 0, 1);
        const barW = 32;
        const barH = 4;
        const bx = -barW / 2;
        const by = DRAW_OFFSET_Y - 8;
        ctx.save();
        ctx.fillStyle = 'rgba(18, 12, 24, 0.85)';
        ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
        ctx.fillStyle = '#ffb74d';
        ctx.fillRect(bx, by, Math.max(2, Math.round(barW * relProg)), barH);
        ctx.restore();
      }
    }

    // Arcane Laser Wand Aiming & Continuous Alignment
    drawLaserWandInHand(ctx, game, p, sockets, state) {
      const heldSlot = game.hotbar && game.hotbar[game.activeSlot];
      const heldItem = heldSlot && heldSlot.kind === 'item' ? Balaclava.ITEMS[heldSlot.id] : null;
      if (!heldItem || !heldItem.isLaserWeapon) return;

      const ic = getIcon(heldItem.icon);
      if (!ic) return;

      const hand = sockets.mainHand;
      const aim = (p.swingTimer > 0) ? (p.swingAngle || 0) : ((p.facing || 1) > 0 ? -0.2 : -Math.PI + 0.2);

      ctx.save();
      ctx.translate(hand.x, hand.y);
      ctx.rotate(aim + Math.PI * 0.25);

      // Muzzle energy orb
      if (heldItem.laserStats) {
        const g = ctx.createRadialGradient(8, -8, 1, 8, -8, 14);
        g.addColorStop(0, (heldItem.laserStats.color || '#4dd0e1') + 'bb');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(8, -8, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.drawImage(ic, -11, -11, 22, 22);
      ctx.restore();
    }

    // Bomb Windup in Hand before Release
    drawBombInHand(ctx, game, p, sockets, prog) {
      if (prog >= 0.40) return; // Released into projectile physics
      const heldSlot = game.hotbar && game.hotbar[game.activeSlot];
      const item = (heldSlot && heldSlot.kind === 'item') ? Balaclava.ITEMS[heldSlot.id] : null;
      const iconKey = item ? item.icon : 'bomb_regular';
      const ic = getIcon(iconKey);
      if (!ic) return;

      const hand = sockets.mainHand;
      ctx.save();
      ctx.translate(hand.x, hand.y);
      ctx.rotate(p.facing > 0 ? 0.3 : -0.3);
      ctx.drawImage(ic, -10, -10, 20, 20);

      // Sparkling burning fuse
      const sparkCol = Math.random() < 0.5 ? '#ffd54f' : '#ff7043';
      ctx.fillStyle = sparkCol;
      ctx.fillRect(4, -12, 3, 3);
      ctx.restore();
    }

    // Blade slashes, sweep trails, and magic particle burts
    drawCombatVfx(ctx, game, p, sockets, state, prog) {
      if (p.swingTimer <= 0) return;
      const assets = Balaclava.Assets;

      // Blade slash arc for cutting weapons
      if (p.swingTool === 'espada' || p.swingTool === 'guadana') {
        const tierId = (game.toolTiers && game.toolTiers[p.swingTool]) || 'basica';
        const slashMap = {
          cobre: 'slashFire', oro: 'slashWhite', oricalco: 'slashFire',
          cristal: 'slashIce', adamantita: 'slashDark', platino: 'slashIce',
          acero: 'slashWhite', mitrilo: 'slashIce', titanio: 'slashIce',
          celestial: 'slashWhite', legendaria: 'slashFire', omega: 'slashDark'
        };
        const sKey = slashMap[tierId] || 'slashWhite';
        const sImg = assets.extraImages && (assets.extraImages[sKey] || assets.extraImages.slashWhite);

        if (sImg && (Balaclava.Utils.isImgReady ? Balaclava.Utils.isImgReady(sImg) : (sImg.complete && sImg.naturalWidth > 0))) {
          const fw = sImg.height || 32;
          const totalFrames = Math.max(1, Math.floor(sImg.width / fw));
          const fr = Math.min(totalFrames - 1, Math.floor(prog * totalFrames));
          const reachDist = p.swingTool === 'guadana' ? 24 : 18;
          const sz = p.swingTool === 'guadana' ? 36 : 28;

          ctx.save();
          ctx.translate(Math.cos(p.swingAngle) * reachDist, -4 + Math.sin(p.swingAngle) * reachDist);
          ctx.rotate(p.swingAngle);
          ctx.globalAlpha = Math.max(0, 0.90 - prog * 0.4);
          ctx.drawImage(sImg, fr * fw, 0, fw, fw, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        }
      }

      // Spellcasting magical aura
      if (state === 'spellcasting') {
        ctx.save();
        ctx.translate(sockets.mainHand.x, sockets.mainHand.y - 6);
        const runeGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 22);
        runeGrad.addColorStop(0, 'rgba(128, 222, 234, 0.85)');
        runeGrad.addColorStop(0.5, 'rgba(38, 198, 218, 0.45)');
        runeGrad.addColorStop(1, 'rgba(0, 150, 136, 0)');
        ctx.fillStyle = runeGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Permanent boss relics like the floating orbiting lantern
    drawPermanentRelics(ctx, game, p) {
      if (game.hasPermanentRelic && game.hasPermanentRelic('linterna_flotante')) {
        const lx = - (p.facing || 1) * 24 + Math.cos(game.time * 1.9) * 5;
        const ly = DRAW_OFFSET_Y - 4 + Math.sin(game.time * 3.1) * 5;
        ctx.save();
        const halo = ctx.createRadialGradient(lx, ly, 2, lx, ly, 22);
        halo.addColorStop(0, 'rgba(255, 224, 130, 0.55)');
        halo.addColorStop(1, 'rgba(255, 193, 7, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(lx, ly, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3e2723';
        ctx.fillRect(lx - 6, ly - 9, 12, 3);
        ctx.fillRect(lx - 6, ly + 5, 12, 3);
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(lx - 5, ly - 6, 10, 11);
        ctx.fillStyle = '#fff9c4';
        ctx.fillRect(lx - 3, ly - 4, 6, 7);
        ctx.strokeStyle = '#ffca28';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(lx, ly - 10, 4, Math.PI, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 16-bit ascending soul wisp on death
    drawDeathSoulWisp(game, ctx, p) {
      const elapsed = Math.max(0, (p.deadMax || 10.0) - p.deadTimer);
      if (elapsed < 0.26) return;

      const wispAge = elapsed - 0.26;
      const rise = Math.min(58, Math.floor(wispAge * 28));
      const bobX = Math.round(Math.sin(Math.floor(elapsed * 8) * 0.9) * 3);
      const bobY = (Math.floor(elapsed * 6) & 1) ? -1 : 0;
      const wx = Math.round(p.x + bobX);
      const wy = Math.round(p.y - 14 - rise + bobY);

      ctx.save();
      ctx.fillStyle = '#15303f';
      ctx.fillRect(wx - 4, wy - 7, 8, 10);
      ctx.fillStyle = '#4dd0e1';
      ctx.fillRect(wx - 3, wy - 6, 6, 8);
      ctx.fillRect(wx - 1, wy - 8, 2, 2);
      ctx.fillStyle = '#e0f7fa';
      ctx.fillRect(wx - 2, wy - 4, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(wx - 1, wy - 3, 2, 2);
      ctx.fillStyle = '#80deea';
      ctx.fillRect(wx - 2 + (Math.floor(elapsed * 9) & 1), wy + 4, 2, 2);
      ctx.fillRect(wx + 2 - (Math.floor(elapsed * 7) & 1), wy + 7, 1, 2);
      ctx.restore();
    }
  }

  Balaclava.PlayerAnimator = new PlayerAnimator();
})();
