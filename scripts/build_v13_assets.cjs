#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const REPO = path.resolve(__dirname, '..');
const WWW = path.join(REPO, 'www');
const EXTRA = path.join(WWW, 'assets', 'sprites_extra');
const PACKS = path.join(WWW, 'assets', 'packs');
const V13 = path.join(WWW, 'assets', 'sprites_v13');
const VFX13 = path.join(WWW, 'assets', 'vfx_v13');

const V2 = 'C:/Users/gusta/Downloads/assets v2/_unpacked';
const V3 = 'C:/Users/gusta/Downloads/assets v3';
const NEW = path.join(V3, '_nuevos_usuario');

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

// ─────────────── Minimal Pure-JS PNG Codec & Pixel Ops ───────────────
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
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
}
function decodePng(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8, w = 0, h = 0, bitDepth = 8, colorType = 6;
  const idats = [];
  let palette = null, trns = null;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9];
    } else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idats.push(data);
    else if (type === 'IEND') break;
  }
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const bpp = Math.max(1, Math.ceil((bitDepth * ch) / 8));
  const stride = Math.ceil((w * bitDepth * ch) / 8);
  const out = Buffer.alloc(w * h * 4);
  const prev = Buffer.alloc(stride);
  const curr = Buffer.alloc(stride);
  let ri = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[ri++];
    for (let i = 0; i < stride; i++) {
      const x = raw[ri++];
      const a = i >= bpp ? curr[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      curr[i] = (f === 1 ? x + a : f === 2 ? x + b : f === 3 ? x + ((a + b) >> 1) : f === 4 ? x + paeth(a, b, c) : x) & 0xff;
    }
    for (let x = 0; x < w; x++) {
      const oi = (y * w + x) * 4;
      if (colorType === 6 && bitDepth === 8) {
        out[oi] = curr[x * 4]; out[oi + 1] = curr[x * 4 + 1]; out[oi + 2] = curr[x * 4 + 2]; out[oi + 3] = curr[x * 4 + 3];
      } else if (colorType === 2 && bitDepth === 8) {
        out[oi] = curr[x * 3]; out[oi + 1] = curr[x * 3 + 1]; out[oi + 2] = curr[x * 3 + 2]; out[oi + 3] = 255;
      } else if (colorType === 3 && palette) {
        let idx = 0;
        if (bitDepth === 8) idx = curr[x];
        else if (bitDepth === 4) idx = (curr[x >> 1] >> ((1 - (x & 1)) * 4)) & 0xf;
        else if (bitDepth === 2) idx = (curr[x >> 2] >> ((3 - (x & 3)) * 2)) & 0x3;
        else if (bitDepth === 1) idx = (curr[x >> 3] >> (7 - (x & 7))) & 0x1;
        out[oi] = palette[idx * 3]; out[oi + 1] = palette[idx * 3 + 1]; out[oi + 2] = palette[idx * 3 + 2];
        out[oi + 3] = (trns && idx < trns.length) ? trns[idx] : 255;
      } else if (colorType === 4 && bitDepth === 8) {
        out[oi] = out[oi + 1] = out[oi + 2] = curr[x * 2]; out[oi + 3] = curr[x * 2 + 1];
      } else if (colorType === 0 && bitDepth === 8) {
        out[oi] = out[oi + 1] = out[oi + 2] = curr[x]; out[oi + 3] = 255;
      }
    }
    curr.copy(prev);
  }
  return { w, h, data: out };
}
function encodePng(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
function saveImg(outPath, img) {
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, encodePng(img.w, img.h, img.data));
}
function makeImg(w, h) {
  return { w, h, data: Buffer.alloc(w * h * 4) };
}
function cropImg(src, sx, sy, sw, sh) {
  const out = makeImg(sw, sh);
  for (let y = 0; y < sh; y++) {
    const yy = sy + y;
    if (yy < 0 || yy >= src.h) continue;
    for (let x = 0; x < sw; x++) {
      const xx = sx + x;
      if (xx < 0 || xx >= src.w) continue;
      const si = (yy * src.w + xx) * 4;
      const di = (y * sw + x) * 4;
      out.data[di] = src.data[si]; out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2]; out.data[di + 3] = src.data[si + 3];
    }
  }
  return out;
}
function blit(dst, src, dx, dy, scale = 1, tint = null) {
  const dw = Math.round(src.w * scale);
  const dh = Math.round(src.h * scale);
  for (let y = 0; y < dh; y++) {
    const ty = dy + y;
    if (ty < 0 || ty >= dst.h) continue;
    const sy = Math.min(src.h - 1, Math.floor(y / scale));
    for (let x = 0; x < dw; x++) {
      const tx = dx + x;
      if (tx < 0 || tx >= dst.w) continue;
      const sx = Math.min(src.w - 1, Math.floor(x / scale));
      const si = (sy * src.w + sx) * 4;
      const a = src.data[si + 3];
      if (a <= 2) continue;
      let r = src.data[si], g = src.data[si + 1], b = src.data[si + 2];
      if (tint) {
        [r, g, b] = tint(r, g, b, x, y);
      }
      const sa = a / 255;
      const di = (ty * dst.w + tx) * 4;
      const da = dst.data[di + 3] / 255;
      const oa = sa + da * (1 - sa);
      if (oa <= 0) continue;
      dst.data[di] = Math.min(255, Math.round((r * sa + dst.data[di] * da * (1 - sa)) / oa));
      dst.data[di + 1] = Math.min(255, Math.round((g * sa + dst.data[di + 1] * da * (1 - sa)) / oa));
      dst.data[di + 2] = Math.min(255, Math.round((b * sa + dst.data[di + 2] * da * (1 - sa)) / oa));
      dst.data[di + 3] = Math.min(255, Math.round(oa * 255));
    }
  }
}

// HSL color helpers for crisp hue-shifts & elemental filters
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}
function hslToRgb(h, s, l) {
  h = ((h % 1) + 1) % 1;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2 = (t) => {
    t = ((t % 1) + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [Math.round(hue2(h + 1 / 3) * 255), Math.round(hue2(h) * 255), Math.round(hue2(h - 1 / 3) * 255)];
}
function makeHueShift(degDelta, satMult = 1.0, lightMult = 1.0, onlyIfSatAbove = 0.08) {
  return (r, g, b) => {
    const [h, s, l] = rgbToHsl(r, g, b);
    if (s < onlyIfSatAbove) {
      return [Math.min(255, Math.round(r * lightMult)), Math.min(255, Math.round(g * lightMult)), Math.min(255, Math.round(b * lightMult))];
    }
    return hslToRgb(h + degDelta / 360, s * satMult, l * lightMult);
  };
}
function makeColorizeTint(targetHueDeg, satBoost = 0.72, lightMult = 1.0) {
  return (r, g, b) => {
    const [, s, l] = rgbToHsl(r, g, b);
    if (l < 0.10) return [r, g, b]; // Preserve crisp black outlines
    return hslToRgb(targetHueDeg / 360, Math.max(s, satBoost * 0.85), Math.min(0.95, l * lightMult));
  };
}
function makeFitCanvas(src, targetW, targetH, padBottom = 2, tint = null) {
  const out = makeImg(targetW, targetH);
  // Trim transparent padding on src first
  let minX = src.w, maxX = -1, minY = src.h, maxY = -1;
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    if (src.data[(y * src.w + x) * 4 + 3] > 10) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  const trimmed = maxX >= minX ? cropImg(src, minX, minY, maxX - minX + 1, maxY - minY + 1) : src;
  const maxW = targetW - 4, maxH = targetH - padBottom - 2;
  const rawScale = Math.min(maxW / trimmed.w, maxH / trimmed.h);
  const scale = rawScale >= 1 ? Math.max(1, Math.min(2.2, rawScale)) : rawScale;
  const dw = Math.round(trimmed.w * scale);
  const dh = Math.round(trimmed.h * scale);
  const dx = Math.floor((targetW - dw) / 2);
  const dy = targetH - padBottom - dh;
  blit(out, trimmed, dx, dy, scale, tint);
  return out;
}

// Overlay stone/steel base platform under industrial vats so machines sit firmly on 2x2 or 1x1 footprint
function addMachinePedestal(img, colMain = [46, 52, 68], colHi = [78, 88, 112], colRim = [20, 22, 30]) {
  const base = makeImg(img.w, img.h);
  const ph = Math.max(10, Math.round(img.h * 0.16));
  const y0 = img.h - ph - 2;
  for (let y = y0; y < img.h - 1; y++) {
    for (let x = 3; x < img.w - 3; x++) {
      const i = (y * img.w + x) * 4;
      const isBorder = (y === y0 || y === img.h - 2 || x === 3 || x === img.w - 4);
      const c = isBorder ? colRim : (y <= y0 + 2 ? colHi : colMain);
      base.data[i] = c[0]; base.data[i + 1] = c[1]; base.data[i + 2] = c[2]; base.data[i + 3] = 240;
    }
  }
  blit(base, img, 0, 0, 1);
  return base;
}

// ─────────────── 1. REBUILD UGLY MACHINES WITH REAL PIXEL ART ───────────────
console.log('Step 1: Rebuilding ugly/simple machine sprites...');
const fDir = path.join(V2, 'factory asset v.2 - chemical lab/factory asset v.2 - chemical lab');
const fp = (n) => decodePng(path.join(fDir, `part-00${String(n).padStart(2, '0')}.png`));
const compDir = path.join(V3, '15_LPC_Village_And_Buildings/assets/composed');
const tsBlueTower = decodePng(path.join(PACKS, 'Tiny Swords/Tiny Swords (Update 010)/Factions/Knights/Buildings/Tower/Tower_Blue.png'));
const tsPurpleTower = decodePng(path.join(PACKS, 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Purple Buildings/Tower.png'));
const tsCastleBlue = decodePng(path.join(PACKS, 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Blue Buildings/Castle.png'));
const tsArchery = decodePng(path.join(PACKS, 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Red Buildings/Archery.png'));
const tsMonastery = decodePng(path.join(PACKS, 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Black Buildings/Monastery.png'));
const tsMine = decodePng(path.join(PACKS, 'Tiny Swords/Tiny Swords (Update 010)/Resources/Gold Mine/GoldMine_Active.png'));
const goblinHouse = decodePng(path.join(PACKS, 'Tiny Swords/Tiny Swords (Update 010)/Factions/Goblins/Buildings/Wood_House/Goblin_House.png'));
const tsBridge = decodePng(path.join(PACKS, 'Tiny Swords/Tiny Swords (Update 010)/Terrain/Bridge/Bridge_All.png'));
const lpcHerreria = decodePng(path.join(compDir, 'herreria.png'));
const lpcTaberna  = decodePng(path.join(compDir, 'taberna.png'));
const lpcJoyeria  = decodePng(path.join(compDir, 'joyeria.png'));
const lpcHerbol   = decodePng(path.join(compDir, 'herbolisteria.png'));
const lpcBlanca   = decodePng(path.join(compDir, 'base_blanca.png'));
const lpcElem     = decodePng(path.join(compDir, 'base_elementales.png'));

// Omega Structures (96x96 for 2x2, 64x64 for 1x1) using high-detail chemical lab parts + colorization + server consoles
const omegaSpecs = [
  ['bld_omega_nexo.png',         96, 96, 10, makeHueShift(20, 1.35, 1.08), true],
  ['bld_omega_pilon.png',        64, 64, 8,  makeHueShift(170, 1.5, 1.15), false],
  ['bld_omega_bateria.png',      64, 64, 2,  makeHueShift(0, 1.25, 1.10), false],
  ['bld_omega_gen_vapor.png',    64, 64, 5,  makeHueShift(-15, 1.25, 1.05), true],
  ['bld_omega_gen_geo.png',      96, 96, 11, makeHueShift(-20, 1.4, 1.10), true],
  ['bld_omega_nucleo.png',       96, 96, 1,  makeHueShift(115, 1.35, 1.08), true],
  ['bld_omega_reactor.png',      96, 96, 10, makeHueShift(-75, 1.45, 1.10), true],
  ['bld_omega_trituradora.png',  64, 64, 9,  makeHueShift(0, 0.9, 1.02), true],
  ['bld_omega_lavadora.png',     64, 64, 4,  makeHueShift(15, 1.35, 1.08), false],
  ['bld_omega_fundidora.png',    96, 96, 6,  makeHueShift(-30, 1.3, 1.08), true],
  ['bld_omega_sintetizador.png', 96, 96, 3,  makeHueShift(160, 1.35, 1.08), true],
  ['bld_omega_inscriptor.png',   64, 64, 7,  makeHueShift(-35, 1.4, 1.12), false],
  ['bld_omega_extractor.png',    96, 96, 9,  makeHueShift(150, 1.2, 1.05), true],
  ['bld_omega_domo.png',         96, 96, 1,  makeHueShift(5, 1.2, 1.10), true],
  ['bld_omega_torreta.png',      64, 64, 8,  makeHueShift(-60, 1.45, 1.15), false],
  ['bld_omega_baliza.png',       96, 96, 12, makeHueShift(40, 1.35, 1.12), true],
  ['bld_omega_camara.png',       96, 96, 6,  makeHueShift(200, 1.35, 1.06), true],
  ['bld_omega_prensa.png',       96, 96, 12, makeHueShift(-95, 1.35, 1.05), true],
  ['bld_omega_condensador.png',  96, 96, 7,  makeHueShift(80, 1.3, 1.12), true],
  ['bld_omega_altar.png',        96, 96, 11, makeHueShift(-85, 1.45, 1.12), true],
  ['bld_laboratorio.png',        96, 96, 6,  null, true],
  ['bld_centro_investigacion.png',96, 96, 12, makeHueShift(30, 1.25, 1.08), true],
  ['bld_recolector.png',         64, 76, 4,  makeHueShift(25, 1.3, 1.08), false],
  ['bld_taladro.png',            64, 76, 9,  makeHueShift(15, 1.1, 1.05), true]
];
for (const [fname, tw, th, partIdx, tint, pedestal] of omegaSpecs) {
  let fitted = makeFitCanvas(fp(partIdx), tw, th, 4, tint);
  if (pedestal) fitted = addMachinePedestal(fitted);
  saveImg(path.join(EXTRA, fname), fitted);
}

// Replace remaining boxy/simple station & workshop buildings with handcrafted LPC / Tiny Swords / Factory sprites:
saveImg(path.join(EXTRA, 'bld_taller_mecanico.png'), makeFitCanvas(lpcHerreria, 84, 84, 3));
saveImg(path.join(EXTRA, 'bld_cocina.png'),          makeFitCanvas(lpcTaberna,  88, 76, 3));
saveImg(path.join(EXTRA, 'bld_banco.png'),           makeFitCanvas(lpcJoyeria,  84, 84, 3));
saveImg(path.join(EXTRA, 'bld_casa_comercio.png'),   makeFitCanvas(lpcBlanca,   84, 84, 3));
saveImg(path.join(EXTRA, 'bld_invernadero.png'),     makeFitCanvas(lpcHerbol,   84, 84, 3));
saveImg(path.join(EXTRA, 'bld_yunque_runico.png'),   makeFitCanvas(lpcElem,     76, 76, 3));
saveImg(path.join(EXTRA, 'bld_mesa_hechiceria.png'), makeFitCanvas(tsPurpleTower, 64, 64, 3, makeHueShift(15, 1.25, 1.05)));
saveImg(path.join(EXTRA, 'bld_torre_magica.png'),    makeFitCanvas(tsPurpleTower, 64, 84, 3));
saveImg(path.join(EXTRA, 'bld_torre_rayos.png'),     makeFitCanvas(tsBlueTower, 64, 84, 3, makeHueShift(10, 1.3, 1.12)));
saveImg(path.join(EXTRA, 'bld_pararrayos.png'),      makeFitCanvas(tsBlueTower, 64, 84, 3, makeHueShift(-20, 1.2, 1.1)));
saveImg(path.join(EXTRA, 'bld_cantera.png'),         makeFitCanvas(tsMine, 96, 96, 3, makeHueShift(-150, 0.75, 0.95)));
saveImg(path.join(EXTRA, 'bld_tesoreria.png'),       makeFitCanvas(tsCastleBlue, 96, 96, 3, makeHueShift(-165, 1.25, 1.08)));
saveImg(path.join(EXTRA, 'bld_balista.png'),         makeFitCanvas(tsArchery, 64, 64, 3));
saveImg(path.join(EXTRA, 'bld_basurero.png'),        makeFitCanvas(goblinHouse, 56, 56, 2, makeHueShift(0, 0.35, 0.78)));
saveImg(path.join(EXTRA, 'bld_ahumador.png'),        makeFitCanvas(goblinHouse, 64, 68, 3, makeHueShift(-15, 1.2, 0.95)));
saveImg(path.join(EXTRA, 'bld_plantacion.png'),      makeFitCanvas(lpcHerbol, 72, 72, 3, makeHueShift(35, 1.1, 1.05)));
saveImg(path.join(EXTRA, 'bld_telar.png'),           makeFitCanvas(tsMonastery, 64, 64, 3, makeHueShift(140, 1.1, 1.05)));
saveImg(path.join(EXTRA, 'bld_aspersor.png'),        makeFitCanvas(fp(4), 60, 64, 3, makeHueShift(140, 1.35, 1.12)));
saveImg(path.join(EXTRA, 'bld_muelle_pesca.png'),    makeFitCanvas(cropImg(tsBridge, 0, 0, 192, 64), 80, 64, 2));
saveImg(path.join(EXTRA, 'prop_pipe.png'),           makeFitCanvas(fp(5), 48, 48, 2));

// ─────────────── 2. SEAMLESS 192x192 BIOME TERRAIN SHEETS (9 NEW BIOMES) ───────────────
console.log('Step 2: Building seamless 192x192 autotile sheets for all 9 new biomes...');
const tsTilesDir = path.join(PACKS, 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Terrain/Tileset');
const tTile1   = decodePng(path.join(tsTilesDir, 'Tilemap_color1.png'));
const tTile2   = decodePng(path.join(tsTilesDir, 'Tilemap_color2.png'));
const tTile3   = decodePng(path.join(tsTilesDir, 'Tilemap_color3.png'));
const tTile4   = decodePng(path.join(tsTilesDir, 'Tilemap_color4.png'));
const tTile5   = decodePng(path.join(tsTilesDir, 'Tilemap_color5.png'));
const beach512 = decodePng(path.join(PACKS, 'Beach/Beach/512x512.png'));
const flImg    = decodePng(path.join(V3, '07_LPC_Winter_And_Frozen_Lake/frozenlake.png'));
const emberAsh = decodePng(path.join(NEW, 'ember-caldera-lite/ember-caldera-lite/sprites/ash.png'));

// Wrap any pure seamless patch into a Tiny-Swords-compatible 192x192 cliff-rimmed autotile sheet (ZERO grid artifacts)
function buildSeamless192(srcTile, rimCol, hiRimCol, outerRimCol, tint = null) {
  const out = makeImg(192, 192);
  const w = srcTile.w, h = srcTile.h;
  for (let y = 0; y < 192; y++) {
    for (let x = 0; x < 192; x++) {
      const mi = (y * tTile1.w + x) * 4;
      if (tTile1.data[mi + 3] < 128) continue;
      const isEdge = (x < 2 || y < 2 || x > 189 || y > 189 ||
        tTile1.data[((y-2)*tTile1.w + x)*4 + 3] < 128 || tTile1.data[((y+2)*tTile1.w + x)*4 + 3] < 128 ||
        tTile1.data[(y*tTile1.w + x - 2)*4 + 3] < 128 || tTile1.data[(y*tTile1.w + x + 2)*4 + 3] < 128);
      const isOuter = (x < 1 || y < 1 || x > 190 || y > 190 ||
        tTile1.data[((y-1)*tTile1.w + x)*4 + 3] < 128 || tTile1.data[((y+1)*tTile1.w + x)*4 + 3] < 128 ||
        tTile1.data[(y*tTile1.w + x - 1)*4 + 3] < 128 || tTile1.data[(y*tTile1.w + x + 1)*4 + 3] < 128);
      const isInnerRim = !isEdge && (y >= 4 && y < 188 && tTile1.data[((y-4)*tTile1.w + x)*4 + 3] < 128);

      const px = Math.floor(x % (w * 2)), py = Math.floor(y % (h * 2));
      const sx = px < w ? px : (w * 2 - 1 - px);
      const sy = py < h ? py : (h * 2 - 1 - py);
      const si = (sy * w + sx) * 4;
      let r = srcTile.data[si], g = srcTile.data[si + 1], b = srcTile.data[si + 2];
      if (tint) [r, g, b] = tint(r, g, b);
      if (isOuter) [r, g, b] = outerRimCol;
      else if (isEdge) [r, g, b] = rimCol;
      else if (isInnerRim) [r, g, b] = hiRimCol;
      const di = (y * 192 + x) * 4;
      out.data[di] = r; out.data[di + 1] = g; out.data[di + 2] = b; out.data[di + 3] = 255;
    }
  }
  return out;
}

const patchBeach   = cropImg(emberAsh, 0, 0, emberAsh.w, emberAsh.h); // clean fine stippled grain
const patchSelva   = cropImg(tTile1, 64, 64, 64, 64);      // lush deep jungle emerald
const patchCrystal = cropImg(flImg, 16, 16, 32, 32);       // crystalline blue stone/ice
const patchAsh     = emberAsh;                             // smooth volcanic basalt ash (no checker)
const patchSwamp   = cropImg(tTile2, 64, 64, 64, 64);      // murky bog peat
const patchRedSand = cropImg(emberAsh, 0, 0, emberAsh.w, emberAsh.h); // fine volcanic red sandstone grain
const patchGlacier = cropImg(flImg, 16, 16, 32, 32);       // cracked deep glacier blue ice
const patchNecro   = cropImg(tTile5, 64, 64, 64, 64);      // pale ash/bone stone
const patchCursed  = cropImg(tTile5, 64, 64, 64, 64);      // dark crimson/obsidian abyssal base

const biomeDir = path.join(V13, 'biomes');
saveImg(path.join(biomeDir, 'archipielago_coral.png'), buildSeamless192(patchBeach,   [215, 168, 92],  [255, 232, 166], [138, 94, 44], (r, g, b) => [Math.min(255, Math.round(r * 1.15 + 95)), Math.min(255, Math.round(g * 1.08 + 78)), Math.min(255, Math.round(b * 0.85 + 32))]));
saveImg(path.join(biomeDir, 'selva_esmeralda.png'),    buildSeamless192(patchSelva,   [18, 88, 56],    [86, 186, 112],  [8, 42, 26], makeHueShift(25, 1.35, 0.72)));
saveImg(path.join(biomeDir, 'cavernas_cristal.png'),   buildSeamless192(patchCrystal, [72, 118, 162],  [158, 224, 255], [32, 52, 78], makeHueShift(25, 1.3, 0.92)));
saveImg(path.join(biomeDir, 'caldera_ceniza.png'),     buildSeamless192(patchAsh,     [78, 42, 36],    [186, 88, 48],   [24, 14, 16]));
saveImg(path.join(biomeDir, 'cienaga_putrida.png'),    buildSeamless192(patchSwamp,   [44, 62, 54],    [86, 118, 84],   [18, 28, 24], makeHueShift(35, 0.75, 0.58)));
saveImg(path.join(biomeDir, 'dinastia_arena.png'),     buildSeamless192(patchRedSand, [178, 102, 54],  [238, 178, 108], [94, 46, 24], (r, g, b) => [Math.min(255, Math.round(r * 1.1 + 88)), Math.min(255, Math.round(g * 0.72 + 26)), Math.min(255, Math.round(b * 0.48 + 4))]));
saveImg(path.join(biomeDir, 'glaciar_profundo.png'),   buildSeamless192(patchGlacier, [62, 138, 168],  [188, 244, 255], [22, 68, 94], makeHueShift(0, 1.1, 1.08)));
saveImg(path.join(biomeDir, 'necropolis_osea.png'),    buildSeamless192(patchNecro,   [94, 96, 92],    [186, 184, 162], [32, 34, 40], makeHueShift(0, 0.35, 0.92)));
saveImg(path.join(biomeDir, 'tierras_malditas.png'),   buildSeamless192(patchCursed,  [136, 32, 38],   [212, 82, 78],   [54, 10, 14], (r, g, b) => [Math.min(255, Math.round(r * 0.62 + 26)), Math.round(g * 0.22), Math.round(b * 0.34 + 12)]));

// ─────────────── 3. BIOME PROPS & TREES/STRUCTURES ───────────────
console.log('Step 3: Extracting biome props & environment structures...');
const propsDir = path.join(V13, 'props');
const beachDes = decodePng(path.join(V3, '01_LPC_Beach_Desert/lpc-beach-desert/beach-desert.png'));
const jungleTrees = decodePng(path.join(V3, '10_LPC_Jungle/lpc-jungle-v2/giant-trees.png'));
const jungleFungi = decodePng(path.join(V3, '10_LPC_Jungle/lpc-jungle-v2/giant-fungi.png'));
const conifers = decodePng(path.join(V3, '11_LPC_Conifers/lpc-conifers/conifers.png'));
const desertRuins = decodePng(path.join(V3, '02_LPC_Desert_Ruins/lpc-desert-ruins/desert-ruins.png'));
const undeadSep = path.join(PACKS, 'Free_Undead_Tileset/PNG/Objects_separately');
const cursedSep = path.join(V2, 'Free-Cursed-Land-Top-Down-Pixel-Art-Tileset/PNG/Objects_separetely');
const cave128   = path.join(V2, 'Free-Top-Down-Pixel-Art-Cave-Objects/PNG/Objects_separately/128');
const swampProps = decodePng(path.join(V2, 'Dark_Swamp_Starter_Pack_v1.0/Dark_Swamp_Starter_Pack_v1.0/RawAssets/PropsTileset.png'));
const calderaVol = decodePng(path.join(NEW, 'ember-caldera-lite/ember-caldera-lite/sprites/volcano.png'));
const calderaTree0 = decodePng(path.join(NEW, 'ember-caldera-lite/ember-caldera-lite/sprites/tree_burning_0.png'));
const crystalSamp = decodePng(path.join(NEW, 'crystal_caves_free/crystal_caves_free/Sprites/crystals/caverns_growth_dense_crystal_cluster_engulfed_v00/caverns_growth_dense_crystal_cluster_engulfed_v00_Yaw000.png'));
const tsYellowCastle = decodePng(path.join(PACKS, 'Tiny Swords (Free Pack)/Tiny Swords (Free Pack)/Buildings/Yellow Buildings/Castle.png'));

saveImg(path.join(propsDir, 'palm_tree.png'),         makeFitCanvas(cropImg(beachDes, 164, 0, 83, 127), 72, 96, 2));
saveImg(path.join(propsDir, 'desert_ribs.png'),       makeFitCanvas(decodePng(path.join(cave128, 'Dinosaur_skeleton_part1_light_shadow.png')), 72, 72, 2));
saveImg(path.join(propsDir, 'cactus_tall.png'),       makeFitCanvas(cropImg(beachDes, 336, 224, 64, 128), 48, 72, 2));
saveImg(path.join(propsDir, 'giant_jungle_tree.png'), makeFitCanvas(cropImg(jungleTrees, 201, 32, 215, 224), 80, 96, 2));
saveImg(path.join(propsDir, 'giant_swamp_fungi.png'), makeFitCanvas(cropImg(jungleFungi, 0, 0, 64, 96), 64, 64, 2));
saveImg(path.join(propsDir, 'snow_pine_tall.png'),    makeFitCanvas(cropImg(conifers, 416, 210, 96, 176), 72, 96, 2));
saveImg(path.join(propsDir, 'crystal_pillar_blue.png'), makeFitCanvas(crystalSamp, 56, 64, 2));
saveImg(path.join(propsDir, 'swamp_altar_prop.png'),  makeFitCanvas(decodePng(path.join(cave128, 'Dark_totem_dark_shadow3.png')), 72, 72, 2, makeHueShift(115, 1.35, 1.05)));
saveImg(path.join(propsDir, 'obelisk_sand.png'),      makeFitCanvas(cropImg(desertRuins, 707, 450, 28, 90), 48, 72, 2));
saveImg(path.join(propsDir, 'grave_angel.png'),       makeFitCanvas(decodePng(path.join(undeadSep, 'Dead_tree_shadow1_1.png')), 64, 72, 2));
saveImg(path.join(propsDir, 'cursed_eye_tree.png'),   makeFitCanvas(decodePng(path.join(cursedSep, 'Eye_plant_shadow1_1.png')), 72, 72, 2));
saveImg(path.join(propsDir, 'volcano_cone.png'),      makeFitCanvas(calderaVol, 84, 84, 2));
saveImg(path.join(propsDir, 'burning_tree.png'),      makeFitCanvas(calderaTree0, 48, 64, 2));

// ─────────────── 4. NEW RESOURCE NODES & MINERALS ───────────────
console.log('Step 4: Slicing 17 clean mineral/coral/crystal/herb nodes...');
const nodesDir = path.join(V13, 'nodes');
const stew1 = decodePng(path.join(PACKS, 'Mineral_Ore_StewV/Mineral & Ore Asset Collection - StewV/sprite_sheets/transparent_background/StewV_Minerals_Sheet_01.png'));
const stew2 = decodePng(path.join(PACKS, 'Mineral_Ore_StewV/Mineral & Ore Asset Collection - StewV/sprite_sheets/transparent_background/StewV_Minerals_Sheet_02.png'));
const stew3 = decodePng(path.join(PACKS, 'Mineral_Ore_StewV/Mineral & Ore Asset Collection - StewV/sprite_sheets/transparent_background/StewV_Minerals_Sheet_03.png'));
const fdMin = decodePng(path.join(V2, 'Free Fantasy Dreamland Minerals/Free Fantasy Dreamland Minerals/48x48/FD_Minerals_Stones.png'));
const crystalLg = decodePng(path.join(NEW, 'crystal_caves_free/crystal_caves_free/Sprites/crystals_large/caverns_large_crystal_split_spire_established/caverns_large_crystal_split_spire_established_Yaw000.png'));
const crystalBr = decodePng(path.join(NEW, 'crystal_caves_free/crystal_caves_free/Sprites/crystals/caverns_growth_branching_seam_established_v00/caverns_growth_branching_seam_established_v00_Yaw000.png'));

const stewCell = (sheet, col, row, sz = 48, tint = null) => makeFitCanvas(cropImg(sheet, col * 32, row * 32, 32, 32), sz, sz, 2, tint);
const fdCell   = (col, row, sz = 48, tint = null) => makeFitCanvas(cropImg(fdMin, col * 48, row * 48, 48, 48), sz, sz, 2, tint);

saveImg(path.join(nodesDir, 'node_coral_abisal.png'),    stewCell(stew2, 5, 5));
saveImg(path.join(nodesDir, 'node_perla_turquesa.png'),  stewCell(stew3, 2, 3));
saveImg(path.join(nodesDir, 'node_madera_ferrea.png'),   makeFitCanvas(cropImg(jungleTrees, 224, 451, 64, 93), 48, 48, 2));
saveImg(path.join(nodesDir, 'node_resina_toxica.png'),   stewCell(stew1, 6, 3));
saveImg(path.join(nodesDir, 'node_pirita_solar.png'),    stewCell(stew3, 5, 5));
saveImg(path.join(nodesDir, 'node_agata_roja.png'),      stewCell(stew3, 0, 0));
saveImg(path.join(nodesDir, 'node_cuarzo_boreal.png'),   makeFitCanvas(crystalBr, 48, 48, 2));
saveImg(path.join(nodesDir, 'node_hielo_eterno.png'),    makeFitCanvas(crystalLg, 48, 48, 2, makeHueShift(15, 1.3, 1.15)));
saveImg(path.join(nodesDir, 'node_hueso_fosil.png'),     makeFitCanvas(decodePng(path.join(undeadSep, 'Pile_sculls_shadow1.png')), 48, 48, 2));
saveImg(path.join(nodesDir, 'node_plata_maldita.png'),   fdCell(5, 7, 48, makeHueShift(190, 1.2, 0.95)));
saveImg(path.join(nodesDir, 'node_escoria_caldera.png'), stewCell(stew3, 3, 1));
saveImg(path.join(nodesDir, 'node_cristal_carmesi.png'), stewCell(stew2, 0, 1));
saveImg(path.join(nodesDir, 'node_bismuto_astral.png'),  stewCell(stew2, 0, 3));
saveImg(path.join(nodesDir, 'node_celestita.png'),       stewCell(stew1, 6, 1));
saveImg(path.join(nodesDir, 'node_jade_ancestral.png'),  stewCell(stew2, 3, 4));
saveImg(path.join(nodesDir, 'node_marmol_oscuro.png'),   fdCell(2, 8, 48));
saveImg(path.join(nodesDir, 'node_flor_pantano.png'),    makeFitCanvas(decodePng(path.join(cursedSep, 'Meat_flower_shadow1_1.png')), 48, 48, 2, makeHueShift(105, 1.25, 0.98)));

// ─────────────── 5. NEW ICONS (WEAPONS, POTIONS, ORES, INGOTS, GEMS, RELICS) ───────────────
console.log('Step 5: Extracting 32x32 weapons, potions, materials, gems & 60+ relic icons...');
const iconsDir = path.join(V13, 'icons');
const macWep = decodePng(path.join(V2, "Macrune's Weaponry/Spritesheet/32x32/RPG Weapons Dark Outline 32x32.png"));
const pots   = decodePng(path.join(V2, 'Clockworkraven - POTION PACK/Clockworkraven - POTION PACK/icons32x32.png'));
const mats   = decodePng(path.join(V2, 'Pixel Art Icons - Crafting Materials/Pixel Art Icons - Crafting Materials/32x32.png'));
const gems   = decodePng(path.join(V2, 'Pixel Art Icons - Gems and Jewels/Pixel Art Icons - Gems and Jewels/With Outline/32x32.png'));

const slice32 = (sheet, col, row, tint = null) => makeFitCanvas(cropImg(sheet, col * 32, row * 32, 32, 32), 32, 32, 1, tint);

// Export dozens of numbered / named material ingots, ores, weapons, shields, books, potions & relics
// Mats sheet (16 cols x 9 rows): rows 0=orange/copper, 1=gold, 2=silver, 3=cyan/ice, 4=emerald, 5=purple/cursed, 6=white/bone, 7=sun, 8=dark
// Cols: 0=ore, 1=shard, 2=nuggets, 4=ingot, 5=bar-stack, 7=dust, 10=rod, 11=plate
const matNames = [
  ['ore_coral',       3, 0, null], ['bar_coral',       3, 4, null], ['plate_coral',      3, 11, null],
  ['ore_selvano',     4, 0, null], ['bar_selvano',     4, 4, null], ['plate_selvano',    4, 11, null],
  ['ore_pirita',      7, 0, null], ['bar_pirita',      7, 4, null], ['plate_pirita',     7, 11, null],
  ['ore_boreal',      6, 0, null], ['bar_boreal',      6, 4, null], ['plate_boreal',     6, 11, null],
  ['ore_maldito',     5, 0, null], ['bar_maldito',     5, 4, null], ['plate_maldito',    5, 11, null],
  ['ore_escoria',     8, 0, null], ['bar_escoria',     8, 4, makeHueShift(-15, 1.5, 1.05)], ['plate_escoria', 0, 11, makeHueShift(-20, 1.4, 0.9)],
  ['ore_hueso',       2, 0, makeHueShift(0, 0.2, 1.15)], ['bar_hueso', 2, 4, makeHueShift(0, 0.2, 1.15)],
  ['dust_veneno',     4, 7, makeHueShift(15, 1.4, 1.1)],
  ['dust_carmesi',    0, 7, makeHueShift(-22, 1.5, 1.0)]
];
for (const [n, r, c, t] of matNames) saveImg(path.join(iconsDir, n + '.png'), slice32(mats, c, r, t));

// Export 14 biome potions (Clockworkraven)
for (let r = 0; r < 10; r++) {
  saveImg(path.join(iconsDir, `potion_v13_${r}.png`), slice32(pots, (r + 3) % 16, r));
  saveImg(path.join(iconsDir, `elixir_v13_${r}.png`), slice32(pots, (r + 10) % 16, r));
}

// Export weapon sets from Macrune's Weaponry (28 cols x 28 rows):
// Rows 0..6 = light/medium swords, spears, axes, maces, staffs, bows, shields (top 7 rows)
// Rows 7..13 = elemental / unique! Rows 14..27 = heavy greatswords, scythes, books, shields!
const wepPicks = [
  // Coral / Teal tier (col groups + row offsets in Macrune's sheet)
  ['wep_coral_sword',    0,  4], ['wep_coral_spear',   4, 4], ['wep_coral_staff',   10, 4], ['wep_coral_bow',    14, 4], ['wep_coral_shield',  18, 22],
  // Selva / Emerald tier
  ['wep_selva_sword',    0,  5], ['wep_selva_axe',     6, 5], ['wep_selva_staff',   10, 5], ['wep_selva_bow',    14, 5], ['wep_selva_shield',  19, 23],
  // Swamp / Poison
  ['wep_pantano_dagger', 2, 11], ['wep_pantano_scythe', 5, 19], ['wep_pantano_staff', 11, 20], ['wep_pantano_tome', 16, 15],
  // Faraon / Gold Sun
  ['wep_faraon_sword',   0,  3], ['wep_faraon_spear',  4, 3], ['wep_faraon_hammer',  9, 17], ['wep_faraon_shield', 18, 21],
  // Glacial / Crystal
  ['wep_glacial_sword',  0, 10], ['wep_glacial_hammer',8, 10], ['wep_glacial_staff', 11, 10], ['wep_glacial_shield', 20, 22],
  // Necropolis / Bone
  ['wep_necro_sword',    0,  6], ['wep_necro_scythe',  6, 18], ['wep_necro_staff',   11,  6], ['wep_necro_tome',   16, 17],
  // Caldera / Crimson
  ['wep_caldera_sword',  0,  7], ['wep_caldera_axe',   7,  7], ['wep_caldera_staff', 11,  7], ['wep_caldera_bow',  15,  7], ['wep_caldera_shield', 19, 26],
  // Unique Boss weapons
  ['wep_eclipse_blade',  21, 26], ['wep_void_chakram', 21, 25], ['wep_phoenix_bow',   15,  7]
];
for (const [id, c, r] of wepPicks) {
  saveImg(path.join(iconsDir, id + '.png'), slice32(macWep, c, r));
}

// Export 75 unique Relic Icons (Gems and Jewels 16x11 = 176 icons -> guaranteed unique vibrant relic visuals!)
let relIdx = 0;
for (let r = 0; r < 11 && relIdx < 80; r++) {
  for (let c = 0; c < 16 && relIdx < 80; c++) {
    // Skip duplicate-looking tiny shard columns if desired, or pick rich columns 0..15 across 11 colors
    if (c === 15) continue;
    saveImg(path.join(iconsDir, `relic_v13_${relIdx}.png`), slice32(gems, c, r));
    relIdx++;
  }
}

// ─────────────── 6. NEW DUNGEON & WORLD BOSSES + ESPADACHIN CARMESI ───────────────
console.log('Step 6: Building boss spritesheets for all 75 dungeons & new biome enemies...');
const bossesDir = path.join(V13, 'bosses');
const enemiesDir = path.join(V13, 'enemies');

// Direct high-res copy of Final Boss Espadachin Carmesi Abisal (1792x512 = 14 cols x 8 rows of 128x64 frames)
ensureDir(bossesDir);
ensureDir(enemiesDir);
fs.copyFileSync(
  path.join(NEW, 'Demon_sword/Sword/Sword.png'),
  path.join(bossesDir, 'boss_espadachin_carmesi_full.png')
);

// Helper: extract 4 frames horizontally into a clean strip4 (fw*4 x fh)
function buildStrip4(src, coords, fw, fh, tint = null) {
  const out = makeImg(fw * 4, fh);
  coords.forEach(([sx, sy, sw, sh], i) => {
    const piece = cropImg(src, sx, sy, sw, sh);
    const cell = makeFitCanvas(piece, fw, fh, 2, tint);
    blit(out, cell, i * fw, 0, 1);
  });
  return out;
}

const iceGolem   = decodePng(path.join(V3, '16_Bosses_And_Monsters/ice_crystal_golem_full.png')); // 4032x76 -> ~96x76? Wait: 4032/42 = 96!
const wartotaur  = decodePng(path.join(V3, '16_Bosses_And_Monsters/wartotaur_boss_full.png'));     // 896x896 = 7x7 of 128x128!
const stoneWalk  = decodePng(path.join(V3, '16_Bosses_And_Monsters/stone_golem_walk.png'));      // 448x256 = 7x4 of 64x64!
const pumpking   = decodePng(path.join(V3, '16_Bosses_And_Monsters/lpc-monsters/pumpking.png')); // 384x256 = 6x4 of 64x64?
const eyeball    = decodePng(path.join(V3, '16_Bosses_And_Monsters/lpc-monsters/eyeball.png'));  // 448x256 = 7x4 of 64x64!
const bigWorm    = decodePng(path.join(V3, '16_Bosses_And_Monsters/lpc-monsters/big_worm.png')); // 384x256 = 6x4 of 64x64!
const manFlower  = decodePng(path.join(V3, '16_Bosses_And_Monsters/lpc-monsters/man_eater_flower.png')); // 768x512 = 6x4 of 128x128!
const centipede  = decodePng(path.join(V3, '16_Bosses_And_Monsters/[LPC] Centipede/png/lpc_centipede.png')); // 640x640 = 5x5 of 128x128!
const demonPurp  = decodePng(path.join(V2, 'Evil Dungeon/Evil Dungeon/demon-purple.png')); // 200x400 -> 4 cols x 4 rows of 50x100
const undeadObjs = decodePng(path.join(PACKS, 'Free_Undead_Tileset/PNG/Objects.png'));
const giantSkel  = cropImg(undeadObjs, 0, 0, 480, 160); // Skeleton King 3 frames 160x160!

const bossBases = [
  ['boss_ice_golem',   iceGolem,   [[0,0,64,76],[64,0,64,76],[128,0,64,76],[192,0,64,76]], 80, 80],
  ['boss_wartotaur',   wartotaur,  [[0,128,128,128],[128,128,128,128],[256,128,128,128],[384,128,128,128]], 96, 96],
  ['boss_stone_golem', stoneWalk,  [[0,0,64,64],[64,0,64,64],[128,0,64,64],[192,0,64,64]], 72, 72],
  ['boss_pumpking',    pumpking,   [[0,128,64,64],[64,128,64,64],[192,128,64,64],[256,128,64,64]], 72, 72],
  ['boss_eyeball',     eyeball,    [[0,128,64,64],[64,128,64,64],[256,128,64,64],[320,128,64,64]], 64, 64],
  ['boss_big_worm',    bigWorm,    [[0,128,64,64],[64,128,64,64],[128,128,64,64],[192,128,64,64]], 72, 72],
  ['boss_flora',       manFlower,  [[0,256,128,128],[128,256,128,128],[384,256,128,128],[512,256,128,128]], 88, 88],
  ['boss_centipede',   centipede,  [[0,0,128,128],[128,0,128,128],[256,0,128,128],[384,0,128,128]], 88, 88],
  ['boss_demon',       demonPurp,  [[0,0,50,100],[50,0,50,100],[100,0,50,100],[150,0,50,100]], 72, 88],
  ['boss_skel_coloss', giantSkel,  [[0,0,160,150],[160,0,160,150],[320,0,160,150],[160,0,160,150]], 112, 112]
];
const bossVariants = [
  ['base',    null],
  ['coral',   makeHueShift(175, 1.35, 1.05)],
  ['selva',   makeHueShift(105, 1.3, 1.02)],
  ['pantano', makeHueShift(135, 1.25, 0.88)],
  ['arena',   makeHueShift(35,  1.35, 1.06)],
  ['glaciar', makeHueShift(195, 1.35, 1.12)],
  ['necro',   makeHueShift(-75, 1.25, 0.92)],
  ['caldera', makeHueShift(-15, 1.5, 1.04)]
];
for (const [bName, src, rects, fw, fh] of bossBases) {
  for (const [vName, tint] of bossVariants) {
    saveImg(path.join(bossesDir, `${bName}_${vName}_4f.png`), buildStrip4(src, rects, fw, fh, tint));
  }
}

// Remove stale old non-4f enemy copies if present so every enemy PNG is clean 4-frame strip
for (const stale of ['enemy_biter_red.png', 'enemy_bomb_black.png', 'enemy_bat_horned.png', 'enemy_dragon_whelp.png']) {
  const sp = path.join(enemiesDir, stale);
  if (fs.existsSync(sp)) fs.unlinkSync(sp);
}

// Enemies (New animated 4-frame enemy strips)
const fireSlime = decodePng(path.join(NEW, 'ember-caldera-lite/ember-caldera-lite/sprites/fire_slime_strip.png'));
const emberBat  = decodePng(path.join(NEW, 'ember-caldera-lite/ember-caldera-lite/sprites/ember_bat_strip.png'));
const dfBat     = decodePng(path.join(NEW, 'DarkFantasyEnemies_FREE/DarkFantasyEnemies_FREE/Bat/Bat with VFX/Bat-IdleFly.png')); // 576x64 = 9x 64x64
saveImg(path.join(enemiesDir, 'enemy_fire_slime_4f.png'), buildStrip4(fireSlime, [[0,0,16,16],[16,0,16,16],[0,0,16,16],[16,0,16,16]], 32, 32));
saveImg(path.join(enemiesDir, 'enemy_ember_bat_4f.png'),  buildStrip4(emberBat,  [[0,0,16,16],[16,0,16,16],[0,0,16,16],[16,0,16,16]], 32, 32));
saveImg(path.join(enemiesDir, 'enemy_dark_bat_4f.png'),   buildStrip4(dfBat,     [[0,0,64,64],[128,0,64,64],[256,0,64,64],[384,0,64,64]], 48, 48));
// Recolored biome monster variants from existing crisp 4f strips
const existEnemy = (f) => decodePng(path.join(EXTRA, 'enemies', f));
const enemyVariantDefs = [
  ['enemy_biter_red_4f.png',      existEnemy('biter_plant_32px_4f.png'),        makeHueShift(-110, 1.35, 1.02)],
  ['enemy_bomb_black_4f.png',     existEnemy('bomb_walker_32px_4f.png'),        makeHueShift(0, 0.3, 0.85)],
  ['enemy_bat_horned_4f.png',     existEnemy('bat_horned_32px_4f.png'),         makeHueShift(15, 1.2, 1.05)],
  ['enemy_dragon_whelp_4f.png',   existEnemy('dragon_whelp_32px_4f.png'),       makeHueShift(-20, 1.3, 1.05)],
  ['enemy_coral_crab_4f.png',     existEnemy('sandworm_32px_4f.png'),           makeHueShift(175, 1.3, 1.05)],
  ['enemy_coral_cobra_4f.png',    existEnemy('cobra_green_32px_4f.png'),        makeHueShift(90, 1.25, 1.08)],
  ['enemy_selva_spider_4f.png',   existEnemy('spider_fuzzy_32px_4f.png'),       makeHueShift(115, 1.3, 1.05)],
  ['enemy_selva_plant_4f.png',    existEnemy('biter_plant_32px_4f.png'),        makeHueShift(110, 1.25, 1.05)],
  ['enemy_pantano_slime_4f.png',  existEnemy('slime_toxic_48px_4f.png'),        makeHueShift(30, 1.3, 0.9)],
  ['enemy_pantano_shroom_4f.png', existEnemy('mushroom_monster_32px_4f.png'),   makeHueShift(140, 1.25, 0.92)],
  ['enemy_cristal_eye_4f.png',    existEnemy('floating_eye_32px_4f.png'),       makeHueShift(-75, 1.4, 1.15)],
  ['enemy_glaciar_whelp_4f.png',  existEnemy('dragon_whelp_32px_4f.png'),       makeHueShift(85, 1.35, 1.15)],
  ['enemy_necro_skull_4f.png',    existEnemy('skel_flaming_skull_4f.png'),      makeHueShift(200, 1.2, 1.1)],
  ['enemy_abismo_wisp_4f.png',    existEnemy('wisp_flame_32px_4f.png'),         makeHueShift(-30, 1.5, 1.05)],
  ['enemy_abismo_goblin_4f.png',  existEnemy('goblin_torch_red_48px_4f.png'),   makeHueShift(-20, 1.45, 0.92)]
];
for (const [outN, srcImg, tint] of enemyVariantDefs) {
  const out = makeImg(srcImg.w, srcImg.h);
  blit(out, srcImg, 0, 0, 1, tint);
  saveImg(path.join(enemiesDir, outN), out);
}

// ─────────────── 7. NEW DUNGEON GATES PER BIOME ───────────────
console.log('Step 7: Building biome dungeon gates...');
const gatesDir = path.join(V13, 'gates');
const vilAband = decodePng(path.join(V3, '09_NinjaAdventure_Curated/map/tileset_village_abandoned.png'));
saveImg(path.join(gatesDir, 'gate_coral.png'),    makeFitCanvas(tsCastleBlue, 88, 88, 2, makeHueShift(-25, 1.3, 1.12)));
saveImg(path.join(gatesDir, 'gate_selva.png'),    makeFitCanvas(cropImg(vilAband, 0, 0, 64, 48), 84, 84, 2));
saveImg(path.join(gatesDir, 'gate_pantano.png'),  makeFitCanvas(cropImg(swampProps, 524, 1, 96, 145), 84, 84, 2));
saveImg(path.join(gatesDir, 'gate_dinastia.png'), makeFitCanvas(tsYellowCastle, 88, 88, 2));
saveImg(path.join(gatesDir, 'gate_cristal.png'),  makeFitCanvas(decodePng(path.join(cave128, 'Gates_light_shadow1.png')), 84, 84, 2, makeHueShift(175, 1.35, 1.15)));
saveImg(path.join(gatesDir, 'gate_glaciar.png'),  makeFitCanvas(tsBlueTower, 84, 84, 2, makeHueShift(10, 1.35, 1.15)));
saveImg(path.join(gatesDir, 'gate_necro.png'),    makeFitCanvas(decodePng(path.join(undeadSep, 'Scull_door_shadow1.png')), 84, 84, 2));
saveImg(path.join(gatesDir, 'gate_caldera.png'),  makeFitCanvas(calderaVol, 88, 88, 2));
saveImg(path.join(gatesDir, 'gate_maldita.png'),  makeFitCanvas(decodePng(path.join(cursedSep, 'Ruins_shadow2_1.png')), 88, 88, 2));

// ─────────────── 8. CURATED VFX GIGAPACK SHEETS -> assets/vfx_v13/ ───────────────
console.log('Step 8: Copying curated Super Pixel Effects Gigapack sheets...');
ensureDir(VFX13);
const spBase = path.join(NEW, 'Super_Pixel_Effects_Gigapack/Super Pixel Effects Gigapack (Free Version)/spritesheet');
const vfxCopies = [
  ['sp_epic_explosion_orange.png',     'Explosions/epic_explosion_001/epic_explosion_001_large_orange/spritesheet.png'],
  ['sp_stylized_explosion_violet.png', 'Explosions/stylized_explosion_002/stylized_explosion_002_large_violet/spritesheet.png'],
  ['sp_spell_absorb_violet.png',       'Fantasy Spells/spell_absorb_001/spell_absorb_001_large_violet/spritesheet.png'],
  ['sp_spell_death_red.png',           'Fantasy Spells/spell_death_001/spell_death_001_large_red/spritesheet.png'],
  ['sp_spell_attack_red.png',          'Fantasy Spells/spell_attack_up_001/spell_attack_up_001_large_red/spritesheet.png'],
  ['sp_spell_defense_blue.png',        'Fantasy Spells/spell_defense_up_001/spell_defense_up_001_large_blue/spritesheet.png'],
  ['sp_spell_haste_green.png',         'Fantasy Spells/spell_haste_001/spell_haste_001_large_green/spritesheet.png'],
  ['sp_spell_poison_green.png',        'Fantasy Spells/spell_poison_001/spell_poison_001_large_green/spritesheet.png'],
  ['sp_lightning_strike_violet.png',   'Lightning/lightning_strike_001/lightning_strike_001_large_violet/spritesheet.png'],
  ['sp_lightning_burst_violet.png',    'Lightning/lightning_burst_003/lightning_burst_003_large_violet/spritesheet.png'],
  ['sp_impact_blue.png',               'Impacts/symmetrical_impact_002/symmetrical_impact_002_large_blue/spritesheet.png'],
  ['sp_impact_violet.png',             'Impacts/directional_impact_003/directional_impact_003_large_violet/spritesheet.png'],
  ['sp_scifi_warp.png',                'Sci-fi/scifi_warp_001/scifi_warp_001_large_green/spritesheet.png'],
  ['sp_scifi_charge.png',              'Sci-fi/scifi_charge_up_001/scifi_charge_up_001_large_yellow/spritesheet.png'],
  ['sp_skull_smoke.png',               'Smoke Bursts/stylized_skull_smoke_burst_001/stylized_skull_smoke_burst_001_large_white/spritesheet.png'],
  ['sp_splatter_red.png',              'Splatters/burst_splatter_001/burst_splatter_001_large_red/spritesheet.png'],
  ['sp_fire_loop_orange.png',          'Fire/fire_looping_003A/fire_looping_003A_large_orange/spritesheet.png']
];
for (const [dstN, srcRel] of vfxCopies) {
  const fullSrc = path.join(spBase, srcRel);
  if (fs.existsSync(fullSrc)) {
    fs.copyFileSync(fullSrc, path.join(VFX13, dstN));
  } else {
    console.warn('VFX missing:', fullSrc);
  }
}
// Create vibrant emerald green heal spell + cyan frost burst by hue-shifting Gigapack sheets
{
  const healSrc = decodePng(path.join(spBase, 'Fantasy Spells/spell_heal_001/spell_heal_001_large_red/spritesheet.png'));
  const healOut = makeImg(healSrc.w, healSrc.h);
  blit(healOut, healSrc, 0, 0, 1, makeHueShift(115, 1.25, 1.05));
  saveImg(path.join(VFX13, 'sp_spell_heal_green.png'), healOut);

  const frostSrc = decodePng(path.join(spBase, 'Explosions/stylized_explosion_002/stylized_explosion_002_large_violet/spritesheet.png'));
  const frostOut = makeImg(frostSrc.w, frostSrc.h);
  blit(frostOut, frostSrc, 0, 0, 1, makeHueShift(-90, 1.35, 1.15));
  saveImg(path.join(VFX13, 'sp_frost_explosion_cyan.png'), frostOut);
}

console.log('ALL Beta 1.3.0 assets built successfully!');
