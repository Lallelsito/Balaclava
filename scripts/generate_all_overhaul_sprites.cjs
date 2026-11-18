'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-JS PNG encoder (RGBA 8-bit)
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function hexToRgba(hex, a = 255) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    a
  ];
}

// Logical pixel-art canvas (drawn at lw x lh and nearest-neighbor scaled by `scale` to w x h so every pixel is uniform)
class PixelCanvas {
  constructor(lw, lh, scale = 2) {
    this.w = lw;
    this.h = lh;
    this.scale = scale;
    this.buf = Buffer.alloc(lw * lh * 4);
  }
  set(x, y, col) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !col) return;
    const rgba = typeof col === 'string' ? hexToRgba(col) : col;
    const idx = (y * this.w + x) * 4;
    const sa = (rgba[3] ?? 255) / 255;
    if (sa >= 0.999) {
      this.buf[idx] = rgba[0]; this.buf[idx + 1] = rgba[1]; this.buf[idx + 2] = rgba[2]; this.buf[idx + 3] = 255;
    } else if (sa > 0) {
      const da = this.buf[idx + 3] / 255;
      const oa = sa + da * (1 - sa);
      this.buf[idx] = Math.round((rgba[0] * sa + this.buf[idx] * da * (1 - sa)) / oa);
      this.buf[idx + 1] = Math.round((rgba[1] * sa + this.buf[idx + 1] * da * (1 - sa)) / oa);
      this.buf[idx + 2] = Math.round((rgba[2] * sa + this.buf[idx + 2] * da * (1 - sa)) / oa);
      this.buf[idx + 3] = Math.round(oa * 255);
    }
  }
  getA(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.buf[(y * this.w + x) * 4 + 3];
  }
  rect(x, y, w, h, col) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, col);
  }
  box(x, y, w, h, fill, border) {
    this.rect(x, y, w, h, fill);
    if (border) {
      for (let i = x; i < x + w; i++) { this.set(i, y, border); this.set(i, y + h - 1, border); }
      for (let j = y; j < y + h; j++) { this.set(x, j, border); this.set(x + w - 1, j, border); }
    }
  }
  circle(cx, cy, r, col) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r + 0.25) this.set(x, y, col);
      }
    }
  }
  ellipse(cx, cy, rx, ry, col) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) this.set(x, y, col);
      }
    }
  }
  ring(cx, cy, rIn, rOut, col) {
    for (let y = Math.floor(cy - rOut); y <= Math.ceil(cy + rOut); y++) {
      for (let x = Math.floor(cx - rOut); x <= Math.ceil(cx + rOut); x++) {
        const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (d2 >= rIn * rIn && d2 <= rOut * rOut + 0.35) this.set(x, y, col);
      }
    }
  }
  line(x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      this.set(x0, y0, col);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  tri(cx, topY, halfW, h, col, shadeRight) {
    for (let dy = 0; dy < h; dy++) {
      const span = Math.round((dy / Math.max(1, h - 1)) * halfW);
      for (let dx = -span; dx <= span; dx++) {
        this.set(cx + dx, topY + dy, (shadeRight && dx > 2) ? shadeRight : col);
      }
    }
  }
  outline(col = '#141019') {
    const copy = Buffer.from(this.buf);
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (copy[(y * this.w + x) * 4 + 3] > 128) continue;
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < this.w && ny < this.h && copy[(ny * this.w + nx) * 4 + 3] > 180) {
            this.set(x, y, col);
            break;
          }
        }
      }
    }
  }
  save(relPath) {
    const outW = this.w * this.scale;
    const outH = this.h * this.scale;
    const out = Buffer.alloc(outW * outH * 4);
    for (let y = 0; y < outH; y++) {
      const sy = Math.floor(y / this.scale);
      for (let x = 0; x < outW; x++) {
        const sx = Math.floor(x / this.scale);
        const si = (sy * this.w + sx) * 4;
        const di = (y * outW + x) * 4;
        out[di] = this.buf[si];
        out[di + 1] = this.buf[si + 1];
        out[di + 2] = this.buf[si + 2];
        out[di + 3] = this.buf[si + 3];
      }
    }
    const full = path.join(__dirname, '..', 'www', relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, encodePNG(outW, outH, out));
  }
}

// Helper for stone base pedestal
function drawStonePedestal(c, x, y, w, h, dark = '#37474f', mid = '#546e7a', light = '#78909c') {
  c.rect(x, y, w, h, mid);
  c.rect(x, y, w, 1, light);
  c.rect(x, y + h - 1, w, 1, dark);
  for (let bx = x + 4; bx < x + w - 2; bx += 5) {
    c.line(bx, y + 1, bx, y + h - 2, dark);
  }
}

// ============================================================================
// 1. SPECIALIZED BUILDINGS & TOWERS (NON-OMEGA)
// ============================================================================

// 1.1 Torre Voltaica Arcana (bld_torre_rayos.png) — 32x42 logical -> 64x84
{
  const c = new PixelCanvas(32, 42, 2);
  drawStonePedestal(c, 5, 34, 22, 6, '#263238', '#455a64', '#78909c');
  drawStonePedestal(c, 7, 29, 18, 5, '#37474f', '#546e7a', '#90a4ae');
  // Sapphire energy capacitors on base sides
  c.box(6, 25, 4, 5, '#0288d1', '#01579b');
  c.set(7, 26, '#80d8ff');
  c.box(22, 25, 4, 5, '#0288d1', '#01579b');
  c.set(23, 26, '#80d8ff');
  // Central steel & copper Tesla column
  c.rect(12, 13, 8, 17, '#37474f');
  c.rect(14, 13, 4, 17, '#607d8b');
  c.rect(15, 13, 2, 17, '#b0bec5');
  // 4 Copper induction rings
  for (const ry of [15, 19, 23, 27]) {
    c.rect(10, ry, 12, 2, '#d84315');
    c.rect(11, ry, 10, 1, '#ff8a65');
    c.set(14, ry, '#ffe0b2');
  }
  // Upper crown prongs
  c.line(10, 12, 12, 14, '#90a4ae');
  c.line(21, 12, 19, 14, '#90a4ae');
  // Floating Voltaic Sphere at top
  c.circle(16, 8, 5, '#0288d1');
  c.circle(16, 8, 3.6, '#00e5ff');
  c.circle(15, 7, 2, '#e0f7fa');
  c.set(15, 7, '#ffffff');
  // Crisp lightning arcs around sphere
  c.set(9, 6, '#80d8ff'); c.set(10, 7, '#e0f7fa');
  c.set(22, 5, '#80d8ff'); c.set(21, 6, '#e0f7fa');
  c.set(16, 2, '#80d8ff');
  c.outline('#121820');
  c.save('assets/sprites_extra/bld_torre_rayos.png');
  c.save('assets/sprites_extra/bld_pararrayos.png');
}

// 1.2 Torre Magica (bld_torre_magica.png) — 32x42 logical -> 64x84
{
  const c = new PixelCanvas(32, 42, 2);
  drawStonePedestal(c, 5, 34, 22, 6, '#281e38', '#44355b', '#6d598a');
  drawStonePedestal(c, 7, 28, 18, 6, '#312446', '#534070', '#7e65a3');
  // Tapered runic stone obelisk tower
  for (let y = 14; y < 28; y++) {
    const hw = 5 + Math.floor((y - 14) / 5);
    c.rect(16 - hw, y, hw * 2, 1, '#4a3869');
    c.rect(16 - hw + 1, y, hw - 1, 1, '#644d8a');
  }
  // Glowing violet rune channel down center
  c.rect(15, 16, 2, 11, '#aa00ff');
  c.rect(15, 18, 1, 7, '#ea80fc');
  // Gold collar & floating arcane crystal
  c.rect(10, 13, 12, 2, '#ffb300');
  c.rect(11, 13, 10, 1, '#ffe082');
  // Floating diamond crystal
  c.tri(16, 3, 4, 5, '#d500f9', '#7b1fa2');
  for (let dy = 0; dy < 5; dy++) {
    const span = 4 - dy;
    for (let dx = -span; dx <= span; dx++) c.set(16 + dx, 8 + dy, dx > 0 ? '#7b1fa2' : '#ea80fc');
  }
  c.set(15, 6, '#ffffff');
  c.set(15, 7, '#f3e5f5');
  c.outline('#140d21');
  c.save('assets/sprites_extra/bld_torre_magica.png');
}

// 1.3 Torre Recolectora (bld_recolector.png) — 32x38 logical -> 64x76
{
  const c = new PixelCanvas(32, 38, 2);
  drawStonePedestal(c, 4, 30, 24, 6, '#263238', '#455a64', '#78909c');
  // Brass collector hopper & gear housing
  c.box(7, 20, 18, 11, '#607d8b', '#263238');
  c.rect(9, 22, 14, 7, '#37474f');
  // Brass gear in front
  c.circle(16, 25, 3.2, '#ffb300');
  c.circle(16, 25, 1.5, '#37474f');
  // Giant U-Magnet & cyan tractor emitter on top
  c.rect(10, 9, 4, 11, '#d32f2f');
  c.rect(18, 9, 4, 11, '#1976d2');
  c.rect(10, 17, 12, 4, '#455a64');
  c.rect(10, 7, 4, 3, '#cfd8dc');
  c.rect(18, 7, 4, 3, '#cfd8dc');
  // Magnetic wave arcs
  c.line(13, 5, 18, 5, '#00e5ff');
  c.line(14, 3, 17, 3, '#80d8ff');
  c.outline('#121820');
  c.save('assets/sprites_extra/bld_recolector.png');
}

// 1.4 Banco (bld_banco.png) — 32x34 logical -> 64x68
{
  const c = new PixelCanvas(32, 34, 2);
  // Neoclassical stone & gold bank with vault door
  drawStonePedestal(c, 2, 28, 28, 5, '#37474f', '#607d8b', '#90a4ae');
  c.box(4, 12, 24, 16, '#cfd8dc', '#455a64');
  // 4 Marble columns
  for (const cx of [5, 10, 20, 25]) {
    c.rect(cx, 13, 2, 15, '#eceff1');
    c.rect(cx + 1, 13, 1, 15, '#b0bec5');
  }
  // Circular steel & gold vault door in center
  c.circle(16, 21, 5.2, '#455a64');
  c.circle(16, 21, 4.0, '#78909c');
  c.circle(16, 21, 2.2, '#ffb300');
  c.set(16, 21, '#fff8e1');
  // Golden pediment roof
  c.rect(3, 10, 26, 2, '#ffb300');
  c.tri(16, 3, 14, 7, '#ffc107', '#ffa000');
  // Coin emblem in pediment
  c.circle(16, 7, 2.2, '#fff59d');
  c.outline('#181c24');
  c.save('assets/sprites_extra/bld_banco.png');
}

// 1.5 Mercado (bld_mercado.png) — 32x34 logical -> 64x68
{
  const c = new PixelCanvas(32, 34, 2);
  // Wooden base & counter
  c.box(4, 21, 24, 11, '#8d6e63', '#4e342e');
  c.rect(5, 22, 22, 2, '#d7ccc8');
  c.rect(5, 25, 22, 6, '#6d4c41');
  // Support posts
  c.rect(5, 11, 2, 10, '#5d4037');
  c.rect(25, 11, 2, 10, '#5d4037');
  // Display goods on counter (fruits, gold, cloth)
  c.circle(10, 19, 2, '#e53935');
  c.circle(13, 19, 2, '#fb8c00');
  c.circle(18, 19, 2, '#fdd835');
  c.rect(21, 18, 3, 3, '#29b6f6');
  // Red & cream striped awning
  for (let y = 4; y <= 12; y++) {
    const ex = Math.floor((y - 4) / 3);
    for (let x = 3 - ex; x <= 28 + ex; x++) {
      const stripe = Math.floor((x + 2) / 4) % 2 === 0;
      c.set(x, y, stripe ? '#d32f2f' : '#fff8e1');
    }
  }
  // Scalloped bottom fringe
  for (let x = 2; x <= 29; x++) {
    if (x % 2 === 0) c.set(x, 13, '#b71c1c');
  }
  c.outline('#1b120e');
  c.save('assets/sprites_extra/bld_mercado.png');
}

// 1.6 Puesto de Feria Urbana (village_stall.png) — 48x48 logical -> 96x96 (Distinct 2x2 Royal Bazaar Pavilion!)
{
  const c = new PixelCanvas(48, 48, 2);
  // Ornate stone & mosaic carpet plaza base
  c.box(3, 34, 42, 11, '#5d4037', '#3e2723');
  c.box(5, 35, 38, 9, '#7b1fa2', '#4a148c');
  c.box(7, 36, 34, 7, '#ab47bc', '#ffd54f');
  // Gold posts
  for (const px of [6, 23, 40]) c.rect(px, 16, 2, 20, '#ffb300');
  // Two luxury merchant tables (spices, gems, silks, golden scales)
  c.box(8, 27, 14, 8, '#6d4c41', '#3e2723');
  c.rect(9, 26, 12, 2, '#ffd54f');
  c.circle(11, 25, 1.8, '#00e676');
  c.circle(15, 25, 1.8, '#00e5ff');
  c.circle(18, 25, 1.8, '#ff4081');
  c.box(26, 27, 14, 8, '#6d4c41', '#3e2723');
  c.rect(27, 26, 12, 2, '#ffd54f');
  // Golden merchant balance scale on right table
  c.line(33, 21, 33, 26, '#ffd54f');
  c.line(30, 22, 36, 22, '#ffd54f');
  c.set(30, 24, '#ffe082'); c.set(36, 24, '#ffe082');
  // Hanging warm lanterns
  c.circle(15, 18, 2, '#ffca28'); c.set(15, 18, '#ffffff');
  c.circle(33, 18, 2, '#ffca28'); c.set(33, 18, '#ffffff');
  // Royal purple, teal & gold double-tiered pavilion dome roof
  for (let y = 7; y <= 16; y++) {
    const span = 16 + Math.floor((y - 7) * 0.7);
    for (let dx = -span; dx <= span; dx++) {
      const band = Math.floor((dx + 30) / 4) % 3;
      const col = band === 0 ? '#6a1b9a' : band === 1 ? '#00897b' : '#ffb300';
      c.set(24 + dx, y, col);
    }
  }
  c.tri(24, 2, 10, 6, '#ab47bc', '#7b1fa2');
  c.circle(24, 2, 1.5, '#ffd54f');
  c.rect(2, 16, 44, 2, '#ffd54f');
  c.outline('#160d1f');
  c.save('assets/sprites_extra/village_stall.png');
}

// 1.7 Casa de Comercio (bld_casa_comercio.png) — 32x34 logical -> 64x68
{
  const c = new PixelCanvas(32, 34, 2);
  drawStonePedestal(c, 3, 28, 26, 4, '#3e2723', '#5d4037', '#8d6e63');
  c.box(4, 13, 24, 15, '#efebe9', '#4e342e');
  // Timber framing
  c.rect(4, 13, 2, 15, '#5d4037');
  c.rect(26, 13, 2, 15, '#5d4037');
  c.rect(15, 13, 2, 15, '#5d4037');
  c.rect(4, 20, 24, 2, '#5d4037');
  // Door & windows
  c.box(13, 21, 6, 7, '#6d4c41', '#3e2723');
  c.box(7, 15, 5, 4, '#4fc3f7', '#3e2723');
  c.box(20, 15, 5, 4, '#4fc3f7', '#3e2723');
  // Pitched green merchant roof
  c.tri(16, 3, 14, 11, '#2e7d32', '#1b5e20');
  // Hanging gold coin sign
  c.circle(24, 23, 2.5, '#ffb300');
  c.outline('#1a120b');
  c.save('assets/sprites_extra/bld_casa_comercio.png');
}

// 1.8 Tesoreria Real (bld_tesoreria.png) — 48x48 logical -> 96x96
{
  const c = new PixelCanvas(48, 48, 2);
  drawStonePedestal(c, 3, 38, 42, 7, '#37474f', '#546e7a', '#90a4ae');
  c.box(5, 18, 38, 20, '#eceff1', '#455a64');
  for (const px of [7, 14, 32, 39]) c.rect(px, 19, 3, 19, '#cfd8dc');
  // Grand golden arched doors
  c.box(19, 23, 10, 15, '#ffb300', '#e65100');
  c.rect(21, 25, 6, 13, '#ffd54f');
  // Golden royal dome
  c.ellipse(24, 16, 15, 10, '#ffb300');
  c.ellipse(22, 14, 10, 7, '#ffd54f');
  c.rect(4, 16, 40, 3, '#ffa000');
  // Crown spire & emerald gem
  c.circle(24, 5, 2.5, '#00e676');
  c.outline('#1a1c24');
  c.save('assets/sprites_extra/bld_tesoreria.png');
}

// 1.9 Corral (nodes/corral_pen.png) — 48x48 logical -> 96x96 (Open pasture with fences, hay & water trough)
{
  const c = new PixelCanvas(48, 48, 2);
  // Warm pasture dirt & grass border
  c.box(2, 4, 44, 42, '#7cb342', '#33691e');
  c.ellipse(24, 26, 18, 14, '#8d6e63');
  c.ellipse(24, 26, 15, 11, '#a1887f');
  // Grass tufts
  for (const [gx, gy] of [[9, 12], [38, 13], [10, 38], [37, 37], [24, 11]]) {
    c.set(gx, gy, '#558b2f'); c.set(gx + 1, gy - 1, '#aed581');
  }
  // Top feed shelter & hay trough
  c.box(8, 6, 15, 6, '#ffb300', '#5d4037');
  c.rect(9, 7, 13, 3, '#ffe082');
  // Water trough on right
  c.box(28, 7, 12, 5, '#5d4037', '#3e2723');
  c.rect(29, 8, 10, 3, '#29b6f6');
  // Wooden post-and-rail fence perimeter
  c.rect(2, 4, 44, 2, '#8d6e63');
  c.rect(2, 43, 16, 2, '#8d6e63');
  c.rect(30, 43, 16, 2, '#8d6e63');
  c.rect(2, 4, 2, 41, '#8d6e63');
  c.rect(44, 4, 2, 41, '#8d6e63');
  for (const px of [2, 12, 22, 34, 44]) {
    c.box(px, 3, 3, 4, '#5d4037', '#3e2723');
  }
  for (const px of [2, 16, 30, 44]) {
    c.box(px, 42, 3, 5, '#5d4037', '#3e2723');
  }
  c.outline('#1e140c');
  c.save('assets/sprites_extra/nodes/corral_pen.png');
}

// 1.10 Granja Completa (bld_granja.png) — 48x48 logical -> 96x96 (Red Barn + Silo + Front Pasture Yard)
{
  const c = new PixelCanvas(48, 48, 2);
  // Yard base at bottom where animals walk
  c.box(3, 28, 42, 18, '#8bc34a', '#33691e');
  c.ellipse(24, 37, 17, 7, '#a1887f');
  // Stone Silo on right
  c.box(33, 9, 10, 22, '#cfd8dc', '#455a64');
  c.ellipse(38, 9, 5, 4, '#90a4ae');
  // Red Barn on left/center
  c.box(6, 13, 26, 18, '#c62828', '#4e342e');
  c.tri(19, 3, 15, 11, '#8d6e63', '#5d4037');
  // White barn X-trim & open hayloft
  c.box(14, 19, 10, 12, '#4e342e', '#ffffff');
  c.line(14, 19, 23, 30, '#ffffff');
  c.line(23, 19, 14, 30, '#ffffff');
  c.box(16, 10, 6, 5, '#3e2723', '#ffffff');
  c.rect(17, 13, 4, 2, '#ffd54f');
  // Front fence
  c.rect(3, 44, 15, 2, '#8d6e63');
  c.rect(30, 44, 15, 2, '#8d6e63');
  c.outline('#1b120c');
  c.save('assets/sprites_extra/bld_granja.png');
}

// 1.11 Farm Animals for Corral & Granja (32x32 crisp sprites)
{
  // Cow
  const cow = new PixelCanvas(16, 16, 2);
  cow.box(3, 6, 10, 6, '#ffffff', '#263238');
  cow.rect(5, 7, 3, 3, '#263238');
  cow.rect(9, 8, 2, 2, '#263238');
  cow.box(11, 4, 4, 5, '#ffffff', '#263238');
  cow.rect(12, 7, 3, 2, '#f48fb1');
  cow.set(13, 5, '#111111');
  cow.rect(4, 12, 2, 3, '#263238');
  cow.rect(10, 12, 2, 3, '#263238');
  cow.save('assets/sprites_extra/animals/animal_cow.png');

  // Pig
  const pig = new PixelCanvas(16, 16, 2);
  pig.ellipse(8, 9, 5, 4, '#f48fb1');
  pig.circle(12, 8, 3, '#f8bbd0');
  pig.rect(13, 8, 2, 2, '#ec407a');
  pig.set(12, 7, '#111111');
  pig.rect(5, 12, 2, 2, '#ec407a');
  pig.rect(10, 12, 2, 2, '#ec407a');
  pig.outline('#2d121e');
  pig.save('assets/sprites_extra/animals/animal_pig.png');

  // Duck / Chicken
  const duck = new PixelCanvas(16, 16, 2);
  duck.ellipse(8, 10, 4, 3, '#fff59d');
  duck.circle(11, 7, 2.5, '#fff59d');
  duck.rect(13, 7, 2, 1, '#ff8f00');
  duck.set(11, 6, '#111111');
  duck.rect(7, 13, 2, 2, '#ff8f00');
  duck.outline('#261c0a');
  duck.save('assets/sprites_extra/animals/animal_duck.png');
}

// 1.12 Invernadero Real (bld_invernadero.png) — 48x48 logical -> 96x96
{
  const c = new PixelCanvas(48, 48, 2);
  drawStonePedestal(c, 3, 38, 42, 7, '#37474f', '#546e7a', '#90a4ae');
  // Glass walls & arched glass roof
  c.box(5, 16, 38, 22, [128, 222, 234, 215], '#37474f');
  c.ellipse(24, 16, 19, 10, [178, 235, 242, 220]);
  // Lush exotic plants visible inside
  c.circle(13, 31, 4, '#2e7d32'); c.circle(13, 29, 2, '#ff4081');
  c.circle(24, 30, 5, '#388e3c'); c.circle(24, 28, 2.5, '#ffd54f');
  c.circle(35, 31, 4, '#2e7d32'); c.circle(35, 29, 2, '#e040fb');
  // Wrought-iron ribs & golden crest
  for (const rx of [5, 14, 24, 34, 42]) c.line(rx, 14, rx, 37, '#37474f');
  c.rect(5, 16, 38, 2, '#ffb300');
  c.box(20, 26, 8, 12, '#80deea', '#ffb300');
  c.outline('#162026');
  c.save('assets/sprites_extra/bld_invernadero.png');
}

// 1.13 Plantacion Autonoma (bld_plantacion.png) — 32x34 logical -> 64x68
{
  const c = new PixelCanvas(32, 34, 2);
  c.box(3, 20, 26, 12, '#6d4c41', '#3e2723');
  c.rect(5, 21, 22, 8, '#4e342e');
  // Rows of crops
  for (const cx of [8, 14, 20, 24]) {
    c.circle(cx, 24, 2.2, '#66bb6a');
    c.set(cx, 23, '#dce775');
  }
  // Central copper hydro-tower & spray arms
  c.box(13, 8, 6, 14, '#d84315', '#3e2723');
  c.rect(14, 10, 4, 6, '#4fc3f7');
  c.rect(5, 11, 22, 2, '#ff8a65');
  c.set(7, 14, '#80d8ff'); c.set(24, 14, '#80d8ff');
  c.outline('#1b120c');
  c.save('assets/sprites_extra/bld_plantacion.png');
}

// 1.14 Molino (bld_molino.png) — 48x48 logical -> 96x96
{
  const c = new PixelCanvas(48, 48, 2);
  drawStonePedestal(c, 10, 38, 28, 7, '#3e2723', '#6d4c41', '#8d6e63');
  // Tapered windmill tower
  for (let y = 14; y < 38; y++) {
    const hw = 7 + Math.floor((y - 14) / 4);
    c.rect(24 - hw, y, hw * 2, 1, '#efebe9');
    c.rect(24 + hw - 3, y, 3, 1, '#d7ccc8');
  }
  c.tri(24, 7, 9, 8, '#8d6e63', '#5d4037');
  c.box(21, 30, 6, 8, '#6d4c41', '#3e2723');
  // 4 diagonal canvas sails
  for (let i = -14; i <= 14; i++) {
    c.line(24 + i, 18 + i, 24 + i + 3, 18 + i - 2, '#fff8e1');
    c.line(24 + i, 18 - i, 24 + i + 2, 18 - i + 3, '#fff8e1');
    c.set(24 + i, 18 + i, '#5d4037');
    c.set(24 + i, 18 - i, '#5d4037');
  }
  c.circle(24, 18, 2.5, '#ffb300');
  c.outline('#1b120e');
  c.save('assets/sprites_extra/bld_molino.png');
}

// 1.15 Laboratorio (bld_laboratorio.png) — 48x48 logical -> 96x96
{
  const c = new PixelCanvas(48, 48, 2);
  drawStonePedestal(c, 3, 38, 42, 7, '#263238', '#455a64', '#78909c');
  c.box(5, 18, 38, 20, '#37474f', '#1c262b');
  // Two glowing cyan & green alchemy vats on left and right
  c.box(8, 12, 9, 18, '#00acc1', '#006064');
  c.rect(10, 14, 5, 14, '#84ffff');
  c.box(31, 12, 9, 18, '#00c853', '#1b5e20');
  c.rect(33, 14, 5, 14, '#b9f6ca');
  // Copper dome in center
  c.ellipse(24, 16, 8, 7, '#d84315');
  c.ellipse(23, 15, 5, 4, '#ff8a65');
  c.box(20, 25, 8, 13, '#546e7a', '#263238');
  c.circle(24, 21, 2.5, '#80d8ff');
  c.outline('#10161a');
  c.save('assets/sprites_extra/bld_laboratorio.png');
}

// 1.16 Taller Mecanico (bld_taller_mecanico.png) — 48x48 logical -> 96x96
{
  const c = new PixelCanvas(48, 48, 2);
  drawStonePedestal(c, 3, 38, 42, 7, '#263238', '#455a64', '#78909c');
  c.box(5, 17, 38, 21, '#795548', '#3e2723');
  c.rect(7, 19, 34, 17, '#5d4037');
  // Smokestack chimney on left
  c.box(8, 6, 6, 12, '#37474f', '#263238');
  c.rect(7, 5, 8, 2, '#90a4ae');
  // Giant brass gear mounted on roof/facade
  c.circle(28, 15, 7, '#ffb300');
  c.circle(28, 15, 5, '#ffa000');
  c.circle(28, 15, 2.5, '#37474f');
  // Workshop bay & anvil
  c.box(12, 24, 18, 14, '#263238', '#ffb300');
  c.rect(17, 32, 8, 4, '#90a4ae');
  c.outline('#14100e');
  c.save('assets/sprites_extra/bld_taller_mecanico.png');
}

// 1.17 Centro de Investigacion (bld_centro_investigacion.png) — 48x48 logical -> 96x96
{
  const c = new PixelCanvas(48, 48, 2);
  drawStonePedestal(c, 3, 38, 42, 7, '#1a237e', '#303f9f', '#5c6bc0');
  c.box(5, 18, 38, 20, '#cfd8dc', '#263238');
  // High-tech azure crystal dome
  c.ellipse(24, 16, 14, 11, '#0288d1');
  c.ellipse(22, 14, 10, 8, '#29b6f6');
  c.ellipse(20, 12, 5, 4, '#e1f5fe');
  // Golden astrolabe rings around dome
  c.line(10, 18, 38, 12, '#ffd54f');
  c.line(10, 12, 38, 18, '#ffb300');
  // Illuminated arched windows
  for (const wx of [9, 21, 33]) {
    c.box(wx, 23, 6, 9, '#00e5ff', '#1a237e');
  }
  c.outline('#0d1326');
  c.save('assets/sprites_extra/bld_centro_investigacion.png');
}

// 1.18 Santuario de Mazmorra (bld_santuario.png) — 48x48 logical -> 96x96 (Symmetrical uncropped Dungeon Portal!)
{
  const c = new PixelCanvas(48, 48, 2);
  drawStonePedestal(c, 4, 38, 40, 7, '#212121', '#424242', '#757575');
  drawStonePedestal(c, 7, 34, 34, 4, '#37474f', '#616161', '#9e9e9e');
  // Twin carved pillars
  c.box(9, 10, 6, 25, '#424242', '#212121');
  c.box(33, 10, 6, 25, '#424242', '#212121');
  // Glowing runes on pillars
  for (const py of [14, 20, 26]) {
    c.rect(11, py, 2, 3, '#ff5252');
    c.rect(35, py, 2, 3, '#ff5252');
  }
  // Arch lintel on top
  c.box(7, 6, 34, 5, '#616161', '#212121');
  c.tri(24, 2, 14, 5, '#424242', '#212121');
  // Swirling crimson-violet dungeon vortex inside arch
  c.ellipse(24, 22, 8, 11, '#4a148c');
  c.ellipse(24, 22, 6, 8, '#ad1457');
  c.ellipse(24, 22, 3.5, 5, '#ff5252');
  c.ellipse(24, 22, 1.5, 2.5, '#fff8e1');
  c.outline('#0d0b10');
  c.save('assets/sprites_extra/bld_santuario.png');
}

// 1.19 Taladro Automatico (bld_taladro.png) — 32x38 logical -> 64x76
{
  const c = new PixelCanvas(32, 38, 2);
  drawStonePedestal(c, 4, 30, 24, 6, '#3e2723', '#5d4037', '#8d6e63');
  // Steel derrick legs
  c.line(7, 30, 13, 8, '#546e7a');
  c.line(8, 30, 14, 8, '#90a4ae');
  c.line(24, 30, 18, 8, '#546e7a');
  c.line(23, 30, 17, 8, '#90a4ae');
  // Motor head at top
  c.box(10, 5, 12, 7, '#ffb300', '#37474f');
  c.rect(12, 7, 8, 3, '#ffe082');
  // Spiral tungsten drill bit plunging into ground
  for (let y = 12; y < 32; y++) {
    const hw = Math.max(1, 5 - Math.floor((y - 12) / 4));
    const stripe = Math.floor(y / 2) % 2 === 0;
    c.rect(16 - hw, y, hw * 2, 1, stripe ? '#cfd8dc' : '#607d8b');
  }
  c.outline('#14181c');
  c.save('assets/sprites_extra/bld_taladro.png');
}

// 1.20 Aspersor, Colmena, Ahumador, Cantera, Muelle, Balista, Faro, Telar, Cocina, Tablon, Mesa Hechiceria, Yunque Runico, Observatorio, Fundicion, Pipe, Logistic Chest
{
  // Aspersor (32x32 -> 64x64)
  const asp = new PixelCanvas(32, 32, 2);
  drawStonePedestal(asp, 8, 24, 16, 5, '#37474f', '#607d8b', '#90a4ae');
  asp.rect(14, 11, 4, 13, '#d84315');
  asp.rect(15, 11, 2, 13, '#ff8a65');
  asp.rect(7, 10, 18, 3, '#ffb300');
  asp.circle(16, 11, 3, '#00e5ff');
  asp.circle(6, 8, 1.5, '#80d8ff'); asp.circle(25, 8, 1.5, '#80d8ff');
  asp.circle(10, 5, 1.2, '#e0f7fa'); asp.circle(21, 5, 1.2, '#e0f7fa');
  asp.outline('#14181c');
  asp.save('assets/sprites_extra/bld_aspersor.png');

  // Colmena (32x32 -> 64x64)
  const col = new PixelCanvas(32, 32, 2);
  col.box(7, 25, 18, 4, '#5d4037', '#3e2723');
  col.ellipse(16, 17, 8, 9, '#ffb300');
  for (const ry of [11, 15, 19, 23]) col.rect(9, ry, 14, 2, '#ffa000');
  col.tri(16, 5, 10, 6, '#8d6e63', '#5d4037');
  col.circle(16, 19, 2.2, '#3e2723');
  col.rect(14, 21, 3, 2, '#ffd54f');
  col.set(8, 9, '#ffeb3b'); col.set(9, 9, '#212121');
  col.set(23, 11, '#ffeb3b'); col.set(24, 11, '#212121');
  col.outline('#1e130a');
  col.save('assets/sprites_extra/bld_colmena.png');

  // Ahumador (32x34 -> 64x68)
  const ahu = new PixelCanvas(32, 34, 2);
  ahu.box(6, 12, 20, 19, '#8d6e63', '#3e2723');
  ahu.rect(8, 14, 16, 15, '#a1887f');
  ahu.box(10, 17, 12, 11, '#37474f', '#263238');
  ahu.rect(12, 23, 8, 3, '#ff7043');
  ahu.box(19, 4, 5, 9, '#455a64', '#263238');
  ahu.circle(21, 2, 2, '#cfd8dc');
  ahu.outline('#1b120e');
  ahu.save('assets/sprites_extra/bld_ahumador.png');

  // Cantera (48x48 -> 96x96)
  const can = new PixelCanvas(48, 48, 2);
  can.box(3, 26, 42, 19, '#546e7a', '#263238');
  can.box(7, 30, 34, 12, '#37474f', '#263238');
  // Timber crane
  can.rect(10, 8, 3, 24, '#8d6e63');
  can.line(11, 9, 34, 15, '#8d6e63');
  can.line(11, 10, 34, 16, '#a1887f');
  can.line(31, 15, 31, 28, '#cfd8dc');
  // Suspended granite block & crystals
  can.box(27, 26, 9, 7, '#b0bec5', '#37474f');
  can.circle(18, 35, 3, '#ffd54f');
  can.outline('#14181c');
  can.save('assets/sprites_extra/bld_cantera.png');

  // Muelle Pesquero (32x32 -> 64x64)
  const mue = new PixelCanvas(32, 32, 2);
  mue.rect(4, 18, 24, 11, '#5d4037');
  for (let y = 12; y <= 24; y += 3) mue.rect(4, y, 24, 2, '#8d6e63');
  mue.rect(5, 8, 3, 20, '#4e342e');
  mue.rect(24, 8, 3, 20, '#4e342e');
  mue.circle(6, 7, 2, '#ffd54f');
  mue.circle(16, 17, 3, '#29b6f6');
  mue.outline('#1a110b');
  mue.save('assets/sprites_extra/bld_muelle_pesca.png');

  // Balista Defensiva (32x32 -> 64x64)
  const bal = new PixelCanvas(32, 32, 2);
  drawStonePedestal(bal, 6, 23, 20, 6, '#37474f', '#607d8b', '#90a4ae');
  bal.box(12, 16, 8, 8, '#5d4037', '#3e2723');
  // Crossbow arms & taut string
  bal.line(4, 14, 28, 14, '#8d6e63');
  bal.line(4, 15, 28, 15, '#a1887f');
  bal.line(5, 15, 16, 21, '#cfd8dc');
  bal.line(27, 15, 16, 21, '#cfd8dc');
  // Steel bolt pointing up
  bal.rect(15, 6, 2, 16, '#cfd8dc');
  bal.tri(16, 3, 3, 4, '#00e5ff', '#0288d1');
  bal.outline('#16120e');
  bal.save('assets/sprites_extra/bld_balista.png');

  // Faro Costero (32x44 -> 64x88)
  const far = new PixelCanvas(32, 44, 2);
  drawStonePedestal(far, 5, 36, 22, 6, '#37474f', '#546e7a', '#90a4ae');
  for (let y = 14; y < 36; y++) {
    const hw = 5 + Math.floor((y - 14) / 6);
    const redBand = Math.floor((y - 14) / 5) % 2 === 0;
    far.rect(16 - hw, y, hw * 2, 1, redBand ? '#d32f2f' : '#eceff1');
  }
  far.rect(9, 12, 14, 2, '#37474f');
  far.box(11, 7, 10, 5, '#fff59d', '#ffb300');
  far.circle(16, 9, 2, '#ffffff');
  far.tri(16, 2, 7, 5, '#b71c1c', '#7f0000');
  far.outline('#14181f');
  far.save('assets/sprites_extra/bld_faro_costero.png');

  // Telar (32x32 -> 64x64)
  const tel = new PixelCanvas(32, 32, 2);
  tel.box(5, 24, 22, 5, '#6d4c41', '#3e2723');
  tel.rect(6, 7, 3, 18, '#8d6e63');
  tel.rect(23, 7, 3, 18, '#8d6e63');
  tel.rect(5, 6, 22, 3, '#5d4037');
  for (let x = 10; x <= 21; x += 2) tel.line(x, 9, x, 23, '#fff8e1');
  tel.rect(9, 14, 14, 6, '#ab47bc');
  tel.rect(9, 16, 14, 2, '#ffd54f');
  tel.outline('#1b120e');
  tel.save('assets/sprites_extra/bld_telar.png');

  // Cocina (32x32 -> 64x64)
  const coc = new PixelCanvas(32, 32, 2);
  coc.box(4, 14, 24, 15, '#8d6e63', '#3e2723');
  coc.box(6, 17, 11, 10, '#37474f', '#263238');
  coc.rect(8, 21, 7, 4, '#ff7043');
  coc.circle(11, 11, 3.5, '#d84315');
  coc.rect(19, 18, 7, 9, '#d7ccc8');
  coc.box(21, 6, 5, 8, '#5d4037', '#3e2723');
  coc.outline('#1b120e');
  coc.save('assets/sprites_extra/bld_cocina.png');

  // Tablon de Logros (32x32 -> 64x64)
  const tab = new PixelCanvas(32, 32, 2);
  tab.rect(7, 12, 3, 17, '#5d4037');
  tab.rect(22, 12, 3, 17, '#5d4037');
  tab.box(5, 9, 22, 14, '#8d6e63', '#3e2723');
  tab.rect(8, 12, 5, 6, '#fff8e1');
  tab.rect(14, 13, 5, 7, '#ffe082');
  tab.rect(20, 12, 4, 5, '#fff8e1');
  tab.tri(16, 4, 13, 6, '#6d4c41', '#3e2723');
  tab.circle(16, 7, 2, '#ffd54f');
  tab.outline('#1b120e');
  tab.save('assets/sprites_extra/bld_tablon_logros.png');

  // Mesa de Hechiceria (32x32 -> 64x64)
  const hec = new PixelCanvas(32, 32, 2);
  hec.box(5, 17, 22, 12, '#4a148c', '#12005e');
  hec.rect(6, 18, 20, 3, '#ffd54f');
  // Open grimoire & arcane orb
  hec.box(10, 12, 12, 5, '#fff8e1', '#7b1fa2');
  hec.circle(16, 7, 3, '#00e5ff');
  hec.set(15, 6, '#ffffff');
  hec.outline('#140a24');
  hec.save('assets/sprites_extra/bld_mesa_hechiceria.png');

  // Yunque Runico (32x32 -> 64x64)
  const yun = new PixelCanvas(32, 32, 2);
  drawStonePedestal(yun, 6, 23, 20, 6, '#212121', '#37474f', '#607d8b');
  yun.rect(10, 17, 12, 6, '#455a64');
  yun.rect(5, 12, 22, 5, '#78909c');
  yun.rect(7, 12, 18, 2, '#cfd8dc');
  // Glowing cyan runes on anvil
  yun.rect(11, 14, 10, 2, '#00e5ff');
  yun.outline('#101418');
  yun.save('assets/sprites_extra/bld_yunque_runico.png');

  // Observatorio Astral (globe_stand.png: 48x48 -> 96x96)
  const obs = new PixelCanvas(48, 48, 2);
  drawStonePedestal(obs, 5, 38, 38, 7, '#1a237e', '#283593', '#5c6bc0');
  obs.box(8, 22, 32, 16, '#cfd8dc', '#37474f');
  obs.ellipse(24, 18, 15, 11, '#1e88e5');
  obs.ellipse(22, 16, 11, 8, '#42a5f5');
  // Giant brass telescope projecting out
  obs.line(22, 16, 38, 6, '#ffb300');
  obs.line(23, 17, 39, 7, '#ffd54f');
  obs.circle(39, 6, 2.5, '#80d8ff');
  obs.outline('#0d1226');
  obs.save('assets/sprites_extra/globe_stand.png');

  // Fundicion Avanzada (station_blast_furnace.png: 48x48 -> 96x96)
  const fun = new PixelCanvas(48, 48, 2);
  drawStonePedestal(fun, 4, 38, 40, 7, '#263238', '#37474f', '#546e7a');
  fun.box(7, 14, 34, 24, '#455a64', '#263238');
  fun.box(12, 6, 9, 9, '#37474f', '#263238');
  fun.box(27, 6, 9, 9, '#37474f', '#263238');
  fun.circle(16, 4, 2.5, '#ff7043');
  fun.circle(31, 4, 2.5, '#ff7043');
  // Molten core window
  fun.box(15, 22, 18, 12, '#bf360c', '#ffb300');
  fun.rect(17, 24, 14, 8, '#ffab00');
  fun.rect(19, 26, 10, 4, '#fff59d');
  fun.outline('#12161a');
  fun.save('assets/sprites_extra/station_blast_furnace.png');

  // Tuberia Logistica (prop_pipe.png: 24x24 -> 48x48)
  const pip = new PixelCanvas(24, 24, 2);
  pip.box(2, 8, 20, 8, '#d84315', '#3e2723');
  pip.rect(3, 9, 18, 3, '#ff8a65');
  pip.box(8, 2, 8, 20, '#d84315', '#3e2723');
  pip.rect(9, 3, 3, 18, '#ff8a65');
  pip.circle(12, 12, 3.5, '#00e5ff');
  pip.circle(12, 12, 1.8, '#e0f7fa');
  pip.outline('#1b120e');
  pip.save('assets/sprites_extra/prop_pipe.png');

  // Cofre Logistico (chest_logistic_closed.png & open: 24x24 -> 48x48)
  const chc = new PixelCanvas(24, 24, 2);
  chc.box(3, 7, 18, 14, '#455a64', '#263238');
  chc.rect(4, 8, 16, 5, '#607d8b');
  chc.rect(3, 12, 18, 2, '#ffb300');
  chc.circle(12, 13, 2.5, '#00e5ff');
  chc.outline('#10161a');
  chc.save('assets/sprites_extra/chest_logistic_closed.png');

  const cho = new PixelCanvas(24, 24, 2);
  cho.box(3, 4, 18, 6, '#607d8b', '#263238');
  cho.box(3, 11, 18, 10, '#455a64', '#263238');
  cho.rect(5, 9, 14, 3, '#00e5ff');
  cho.circle(12, 14, 2.5, '#ffd54f');
  cho.outline('#10161a');
  cho.save('assets/sprites_extra/chest_logistic_open.png');
}

// ============================================================================
// 2. ALL 20 OMEGA ENERGY & AUTOMATION STRUCTURES (Distinct Magitek Aesthetic)
// ============================================================================
function makeOmegaStructure(name, sizeTiles, drawFn) {
  const dim = sizeTiles === 1 ? 32 : 48;
  const c = new PixelCanvas(dim, dim, 2);
  const pad = sizeTiles === 1 ? 3 : 4;
  drawStonePedestal(c, pad, dim - 8, dim - pad * 2, 6, '#1a162b', '#2e294e', '#544d7a');
  drawFn(c, dim);
  c.outline('#0d0a18');
  c.save(`assets/sprites_extra/${name}.png`);
}

// 1. Nexo Central (2x2)
makeOmegaStructure('bld_omega_nexo', 2, (c) => {
  c.box(6, 18, 36, 22, '#283593', '#1a237e');
  c.rect(8, 20, 32, 3, '#ffd54f');
  c.ellipse(24, 18, 13, 10, '#00b0ff');
  c.ellipse(24, 18, 9, 7, '#00e5ff');
  c.circle(24, 16, 4.5, '#e040fb');
  c.circle(24, 16, 2, '#ffffff');
});

// 2. Pilon de Enlace (1x1)
makeOmegaStructure('bld_omega_pilon', 1, (c) => {
  c.box(11, 11, 10, 14, '#37474f', '#263238');
  c.rect(14, 12, 4, 12, '#00e5ff');
  c.circle(16, 7, 4, '#e040fb');
  c.circle(16, 7, 2, '#ffffff');
});

// 3. Acumulador Cuantico / Bateria (1x1)
makeOmegaStructure('bld_omega_bateria', 1, (c) => {
  c.box(6, 8, 20, 17, '#263238', '#ffb300');
  for (const by of [11, 15, 19]) {
    c.rect(9, by, 14, 3, '#00e676');
    c.rect(10, by, 12, 1, '#b9f6ca');
  }
  c.rect(10, 5, 4, 3, '#00e5ff');
  c.rect(18, 5, 4, 3, '#00e5ff');
});

// 4. Generador de Vapor (1x1)
makeOmegaStructure('bld_omega_gen_vapor', 1, (c) => {
  c.box(6, 12, 20, 13, '#d84315', '#3e2723');
  c.circle(16, 18, 4, '#ffab00');
  c.box(10, 4, 5, 8, '#546e7a', '#263238');
  c.box(18, 6, 4, 6, '#546e7a', '#263238');
  c.circle(12, 2, 2, '#e0f7fa');
});

// 5. Reactor Geotermico (2x2)
makeOmegaStructure('bld_omega_gen_geo', 2, (c) => {
  c.box(6, 16, 36, 24, '#3e2723', '#bf360c');
  c.ellipse(24, 28, 12, 7, '#ff3d00');
  c.ellipse(24, 28, 8, 4, '#ffea00');
  c.box(14, 8, 20, 10, '#455a64', '#ffb300');
  c.rect(17, 10, 14, 5, '#ff6e40');
});

// 6. Nucleo Arcano (2x2)
makeOmegaStructure('bld_omega_nucleo', 2, (c) => {
  c.box(10, 22, 28, 18, '#311b92', '#ffb300');
  c.circle(24, 14, 9, '#7c4dff');
  c.circle(24, 14, 6, '#e040fb');
  c.circle(24, 14, 3, '#ffffff');
});

// 7. Reactor de Singularidad (2x2)
makeOmegaStructure('bld_omega_reactor', 2, (c) => {
  c.box(6, 24, 36, 16, '#212121', '#ffb300');
  c.ring(24, 15, 8, 11, '#ffd54f');
  c.circle(24, 15, 7, '#12002b');
  c.ring(24, 15, 4, 6, '#e040fb');
  c.circle(24, 15, 2, '#00e5ff');
});

// 8. Trituradora (1x1)
makeOmegaStructure('bld_omega_trituradora', 1, (c) => {
  c.box(5, 10, 22, 15, '#455a64', '#263238');
  c.circle(12, 17, 4, '#cfd8dc');
  c.circle(20, 17, 4, '#cfd8dc');
  c.rect(8, 7, 16, 4, '#ffb300');
});

// 9. Lavadora Arcana (1x1)
makeOmegaStructure('bld_omega_lavadora', 1, (c) => {
  c.box(5, 9, 22, 16, '#0277bd', '#01579b');
  c.ellipse(16, 16, 8, 5, '#00e5ff');
  c.ellipse(16, 16, 4, 2.5, '#ffffff');
});

// 10. Fundidora Omega (2x2)
makeOmegaStructure('bld_omega_fundidora', 2, (c) => {
  c.box(6, 12, 36, 28, '#37474f', '#ffb300');
  c.box(12, 20, 24, 14, '#d50000', '#ffd54f');
  c.rect(15, 23, 18, 8, '#ffff00');
  c.circle(24, 10, 4, '#e040fb');
});

// 11. Sintetizador de Gemas (2x2)
makeOmegaStructure('bld_omega_sintetizador', 2, (c) => {
  c.box(6, 18, 36, 22, '#1a237e', '#00e5ff');
  c.tri(15, 8, 5, 10, '#00e676', '#00c853');
  c.tri(24, 5, 6, 13, '#e040fb', '#aa00ff');
  c.tri(33, 8, 5, 10, '#00e5ff', '#00b0ff');
});

// 12. Inscriptor Runico Omega (1x1)
makeOmegaStructure('bld_omega_inscriptor', 1, (c) => {
  c.box(5, 12, 22, 13, '#311b92', '#ffd54f');
  c.rect(9, 7, 14, 6, '#ce93d8');
  c.circle(16, 17, 3.5, '#00e5ff');
});

// 13. Extractor de Nucleo (2x2)
makeOmegaStructure('bld_omega_extractor', 2, (c) => {
  c.box(8, 8, 32, 12, '#ffb300', '#263238');
  c.tri(24, 20, 9, 18, '#00e5ff', '#0288d1');
  c.rect(22, 6, 4, 28, '#e040fb');
});

// 14. Domo Hidroponico (2x2)
makeOmegaStructure('bld_omega_domo', 2, (c) => {
  c.ellipse(24, 24, 18, 14, [0, 229, 255, 200]);
  c.circle(18, 28, 5, '#00e676');
  c.circle(29, 27, 6, '#69f0ae');
  c.rect(6, 34, 36, 5, '#263238');
});

// 15. Torreta de Prisma Omega (1x1)
makeOmegaStructure('bld_omega_torreta', 1, (c) => {
  c.box(8, 14, 16, 11, '#37474f', '#00e5ff');
  c.tri(16, 3, 6, 11, '#e040fb', '#7b1fa2');
  c.circle(16, 8, 2.5, '#ffffff');
});

// 16. Baliza de Sobrecarga (2x2)
makeOmegaStructure('bld_omega_baliza', 2, (c) => {
  c.box(10, 22, 28, 18, '#263238', '#00e5ff');
  c.tri(24, 4, 8, 18, '#00e5ff', '#00b0ff');
  c.ring(24, 12, 9, 11, '#ffd54f');
  c.circle(24, 10, 3, '#ffffff');
});

// 17. Camara de Simulacion (2x2)
makeOmegaStructure('bld_omega_camara', 2, (c) => {
  c.box(8, 8, 32, 32, '#1a237e', '#00e5ff');
  c.box(12, 12, 24, 22, '#00b0ff', '#1a237e');
  c.circle(24, 22, 6, '#ff1744');
  c.circle(24, 22, 3, '#ffd54f');
});

// 18. Prensa de Singularidades (2x2)
makeOmegaStructure('bld_omega_prensa', 2, (c) => {
  c.box(6, 6, 36, 10, '#455a64', '#ffb300');
  c.rect(8, 14, 5, 24, '#37474f');
  c.rect(35, 14, 5, 24, '#37474f');
  c.circle(24, 26, 6, '#e040fb');
  c.circle(24, 26, 3, '#12002b');
});

// 19. Condensador de Materia Pura (2x2)
makeOmegaStructure('bld_omega_condensador', 2, (c) => {
  c.box(6, 20, 36, 20, '#311b92', '#00e5ff');
  c.circle(14, 14, 5, '#00e5ff');
  c.circle(34, 14, 5, '#00e5ff');
  c.circle(24, 14, 7, '#e040fb');
  c.circle(24, 14, 3.5, '#ffffff');
});

// 20. Altar de Sobrecarga Infinita (2x2)
makeOmegaStructure('bld_omega_altar', 2, (c) => {
  c.box(8, 24, 32, 16, '#4a148c', '#ffd54f');
  c.tri(24, 6, 10, 18, '#e040fb', '#7b1fa2');
  c.circle(24, 16, 4, '#ffd54f');
  c.circle(24, 16, 2, '#ffffff');
});

// ============================================================================
// 3. DEDICATED 32x32 OMEGA ITEM ICONS (icons_extra/*.png)
// ============================================================================
function makeOmegaIcon(name, drawFn) {
  const c = new PixelCanvas(16, 16, 2);
  drawFn(c);
  c.outline('#120824');
  c.save(`assets/icons_extra/${name}.png`);
}

makeOmegaIcon('singularidad', (c) => {
  c.ring(8, 8, 4, 6.5, '#e040fb');
  c.ring(8, 8, 3, 4.5, '#00e5ff');
  c.circle(8, 8, 2.8, '#12002b');
  c.set(6, 6, '#ffffff');
});

makeOmegaIcon('lingote_omega', (c) => {
  c.box(2, 5, 12, 6, '#7b1fa2', '#ffd54f');
  c.rect(3, 6, 10, 4, '#e040fb');
  c.rect(5, 7, 6, 2, '#00e5ff');
  c.set(6, 7, '#ffffff');
});

makeOmegaIcon('materia_comprimida', (c) => {
  c.tri(8, 2, 5, 6, '#00e5ff', '#0091ea');
  c.tri(8, 8, 5, 6, '#e040fb', '#7b1fa2');
  c.circle(8, 8, 2.5, '#ffd54f');
  c.set(8, 8, '#ffffff');
});

makeOmegaIcon('cristal_datos', (c) => {
  c.box(4, 2, 8, 12, '#00b0ff', '#01579b');
  c.rect(5, 3, 6, 10, '#80d8ff');
  c.rect(6, 5, 4, 2, '#e040fb');
  c.rect(6, 9, 4, 2, '#ffd54f');
});

makeOmegaIcon('casco_omega', (c) => {
  c.box(3, 4, 10, 10, '#7b1fa2', '#ffd54f');
  c.rect(4, 5, 8, 4, '#e040fb');
  c.rect(4, 9, 8, 2, '#00e5ff');
  c.tri(8, 1, 4, 4, '#ffd54f', '#ffb300');
});

makeOmegaIcon('armadura_omega', (c) => {
  c.box(2, 3, 12, 11, '#4a148c', '#ffd54f');
  c.rect(4, 4, 8, 9, '#7b1fa2');
  c.circle(8, 8, 2.5, '#00e5ff');
  c.set(8, 8, '#ffffff');
});

makeOmegaIcon('escudo_omega', (c) => {
  c.box(3, 2, 10, 12, '#7b1fa2', '#ffd54f');
  c.rect(5, 4, 6, 8, '#e040fb');
  c.circle(8, 8, 2.5, '#00e5ff');
});

makeOmegaIcon('botas_omega', (c) => {
  c.box(2, 4, 5, 10, '#7b1fa2', '#ffd54f');
  c.box(9, 4, 5, 10, '#7b1fa2', '#ffd54f');
  c.rect(2, 11, 6, 3, '#00e5ff');
  c.rect(9, 11, 6, 3, '#00e5ff');
});

makeOmegaIcon('hoja_singularidad', (c) => {
  c.line(3, 13, 13, 3, '#00e5ff');
  c.line(2, 12, 12, 2, '#e040fb');
  c.line(4, 14, 14, 4, '#7b1fa2');
  c.rect(2, 11, 4, 4, '#ffd54f');
});

makeOmegaIcon('arco_omega', (c) => {
  c.line(4, 2, 11, 8, '#e040fb');
  c.line(11, 8, 4, 14, '#e040fb');
  c.line(4, 2, 4, 14, '#00e5ff');
  c.line(3, 8, 13, 8, '#ffd54f');
});

makeOmegaIcon('cetro_omega', (c) => {
  c.line(3, 13, 11, 5, '#ffd54f');
  c.circle(11, 5, 3.5, '#e040fb');
  c.circle(11, 5, 2, '#00e5ff');
  c.set(11, 5, '#ffffff');
});

console.log('Generated all overhauled building, animal, and Omega item pixel-art textures.');
