================================================================
 FANTASY DUNGEON & ADVENTURE - 16x16 Top-Down Mega Asset Pack v1.0
================================================================

Thank you for buying this pack! It has everything you need to
build a complete dungeon crawler / action RPG: 5 dungeon tilesets
with auto-tiles, traps, props, 6 hero classes, 40 animated enemies,
6 bosses, NPCs, 281 item icons, a combat UI kit and effects.

Total: 6,642 sprites & animation frames in 2,027 PNG files.
(Every animation frame and every autotile frame is counted. The
left-facing rows of characters are mirrored copies of the right-
facing rows. They are included so they work out of the box.)

COMPANION PACK: made to match "Cozy Village & Farm" (same 16x16 grid,
same style, same base palette). Use both together for a farm + dungeon
game (like a village with mines below it).

----------------------------------------------------------------
TECH SPECS
----------------------------------------------------------------
- Tiles: 16x16. Humanoids: 16x32 (attack/death frames: 32x32).
  Small enemies 16x16, medium 32x32, bosses 48x48 and 64x64.
- Palette: the 46-color Cozy Village & Farm palette + 6 dungeon
  colors = 52 colors (see /Palette: .png, .gpl, .hex).
  All game sprites use only these colors. Hard alpha (0 or 255).
- 1px dark outline (#2b1e2f) on objects/characters, light from
  the top-left.
- Import: Filter = Point / Nearest, Compression = None.
  Unity: Pixels Per Unit = 16, Sprite Mode = Multiple, slice by
  cell size. Godot 4: Texture filter = Nearest.

----------------------------------------------------------------
FOLDERS
----------------------------------------------------------------
01_Dungeon_Tiles  5 themes: Stone_Dungeon, Cave_Mine, Crypt_Catacombs,
                  Ice_Cavern, Lava_Temple. Each has:
                  Floors (3 + 7 variants), Walls (47-tile wall tops,
                  2-tile-tall wall faces, decorated faces, doors),
                  short 1-tile faces, stairs up/down, Autotiles
                  (floor over water/lava/acid [4-frame anims], floor
                  over pit), Traps (collapsing floor, push block).
                  Shared: Liquids (water/lava/acid 4f, magic portal 6f),
                  Carpets (autotile), Traps_Mechanics (spikes 4f,
                  pressure plates, levers, fire vent 6f, teleport pad,
                  push crate, wood/stone/rope bridges).
02_Props          Lights (wall torch / brazier in 4 fire colors, standing
                  torch, candles, candelabra, lantern - all animated),
                  chests (5 kinds, open/closed) + mimic, containers
                  (barrels, crates, pots/vases + broken), bones, webs,
                  chains, cages, prison bars, statues (+broken),
                  pillars per theme, altars, shrine, healing fountain,
                  throne, treasure, crystals (glow anim), mushrooms,
                  roots, rubble, boulders, stalagmites, furniture,
                  coffins, sarcophagi, gravestones, banners, signs,
                  mine rails + carts + ladders, cauldrons, totem.
03_Heroes         Knight, Rogue, Mage, Archer, Cleric, Barbarian
                  + a recolor (_alt) of each = 12 heroes.
04_Enemies        40 enemies + 9 projectile types (4 directions + impact).
05_Bosses         Slime King, Lich King, Red Dragon, Frost Dragon,
                  Demon Lord, Crystal Golem.
06_NPCs           14 NPCs (walk/idle) + 32x32 portraits + merchant cart.
07_Items          281 icons: Weapons (12 types x 5 tiers), Armor, Potions,
                  Scrolls & spell books, Keys, Loot/Coins/Gems, Food,
                  Monster drops, Ores & bars, Quest items, Runes,
                  Relics, Ammo, Tools.
08_UI             Bars (health/mana/stamina/xp/shield/rage), boss bar,
                  hearts/armor/mana orbs, skill slots + 8-frame
                  cooldown overlay, 36 skill icons, 16 status icons,
                  damage-number fonts (5 colors + big crit + words),
                  minimap frames + markers, rarity item frames,
                  equipment & inventory windows, loot popup, level-up
                  banner, quest log, dialogue box, buttons, cursors.
09_Effects        Slash arcs (3 sizes x 4 colors), hits, goo splats,
                  explosions, fire, ice, lightning, poison, heal, buffs,
                  level-up pillar, teleport, magic circles, shield,
                  dust, smoke, sparkles, coin bounce.
10_Overworld      Dark & dead grass (+ autotiles that blend with Cozy
                  Village grass/dirt), dark forest trees, graveyard set
                  (iron fence autotile, gates, mausoleum), dungeon
                  entrances (cave mouth, mine, crypt gate, ruined
                  temple, wizard tower), ruins, campsite.
Example_Scenes    8 example maps (1x): one per dungeon theme, boss room,
                  overworld entrance, combat UI mockup.
Previews          3x screenshots, GIFs, content overview sheets.
Palette           Palette files.

----------------------------------------------------------------
SHEET LAYOUTS
----------------------------------------------------------------
CHARACTER SHEETS (heroes, NPCs, humanoid enemies)
  *_walk_idle_sheet.png  16x32 cells, 6 cols x 4 rows
     rows: down, up, right, left
     cols: walk 0-3, idle 4-5
  *_attack_32x32_sheet.png  32x32 cells, 4 cols x 4 rows (same rows)
     cols: wind-up, strike, follow-through, recover
  *_hurt_sheet.png       16x32, 2 cols (knock-back, white flash) x 4 rows
  *_roll_sheet.png       16x32, 4 cols x 4 rows (heroes: crouch, tuck,
                         tuck, rise)
  *_death_32x32_5f.png   5 frames, single direction
  *_portrait_32x32.png   dialogue portrait
  Ready-cut strips are in the *_strips folders (name_anim_dir_Nf.png).

CREATURE SHEETS (04_Enemies/<name>/<name>_WxH_sheet.png)
  rows: down, up, right, left  (W x H cells: 16x16 or 32x32)
  cols: idle 0-3 | move 4-7 | attack 8-11 | hurt 12-13
  + <name>_death_5f.png, + strips/ per animation and direction.
  Note: spiders, beetles and scorpions are true top-down bugs.
  Their up/right/left rows are rotations of the down row.

BOSSES (05_Bosses/<boss>/)
  <boss>_idle_4f, _attack_4f, _special_6f, _hurt_2f, _death_6f
  <boss>_sheet.png: rows idle, attack, special, hurt, death (6 cols).

PROJECTILES (04_Enemies/Projectiles)
  <name>_right/left/up/down_Nf.png + <name>_impact_3f.png

----------------------------------------------------------------
AUTO-TILES
----------------------------------------------------------------
A) CORNER SETS (64x64 = 16 tiles, same layout as Cozy Village)
   Floor over water/lava/acid/pit, carpets, overworld grass.
   See _GUIDE_corner_autotile_16.png. Bits = TL TR BL BR corners,
   1 = upper terrain (the floor). Animated sets: 4 frames side by
   side (256x64).
   - Tiled: Wang set, type "Corner".  - Godot 4: "Match Corners".
B) WALL TOPS (wall_top_blob47.png, 8 cols x 6 rows, 47 tiles)
   Standard 47-tile "blob" set. See _GUIDE_wall_top_blob47.png:
   each tile is labelled with its 8-neighbour mask
   (N=1 NE=2 E=4 SE=8 S=16 SW=32 W=64 NW=128, bit = neighbour is
   wall; corners only count when both touching sides are wall).
   - Godot 4: Terrain mode "Match Corners and Sides".
   - GameMaker: 47-tile autotile. Tiled: Wang "Mixed" set.
C) WALL FACES (Walls/Faces_16x32)
   Walls are drawn in 3/4 view: put a 16x32 face column on the
   2 wall cells directly above a floor cell (top half = upper cell,
   bottom half = lower cell). Use face_left_end / right_end /
   single at the ends. Doors and decorated faces (banners, torch
   brackets, windows, ore veins, skull niches...) are drop-in
   replacements for a face column. Walls only 1 cell thick can use
   Short_Faces_16x16. Rule of thumb: make walls 3 cells thick so
   some wall top shows (see the example scenes).
D) FENCES (10_Overworld/Graveyard/iron_fence_autotile_16.png)
   4x4 sheet, index = N*8 + E*4 + S*2 + W*1 (same as Cozy Village).

----------------------------------------------------------------
ANIMATION SPEED TIPS
----------------------------------------------------------------
Walk 6-8 fps | idle 3-4 fps | attack 10-12 fps | torches 8 fps |
liquids 4-6 fps | effects 12-15 fps | spikes: play 0,1,2,3,3,2,1,0

----------------------------------------------------------------
ENGINE TIPS
----------------------------------------------------------------
Unity: Sprite Editor > Slice > Grid By Cell Size. Use Tile Palette
       for tiles and the 2D Tilemap Extras "Rule Tile" for the
       corner/blob sets. Turn off anti-aliasing.
Godot 4: TileSet atlas with region size 16x16, add Terrains as above.
       AnimatedSprite2D > SpriteFrames > "Add frames from sprite sheet".
Tiled: New tileset, 16x16, Wang sets as above.
GameMaker: Create sprites with "Import Strip Image" (frame count is in
       the file name: *_4f.png = 4 frames).

----------------------------------------------------------------
LICENSE: see LICENSE.txt  |  Made with AI assistance -
programmatically generated pixel art, reviewed and curated.
================================================================
