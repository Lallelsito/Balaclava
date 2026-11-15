(function () {
  'use strict';

  const Balaclava = (window.Balaclava = window.Balaclava || {});
  const SQRT3 = Math.sqrt(3);

  // Pointy-top axial directions (clockwise starting East)
  const HEX_DIRS = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1]
  ];

  function hexKey(q, r) {
    return `${q},${r}`;
  }

  function hexDistance(q1, r1, q2 = 0, r2 = 0) {
    const dq = q1 - q2;
    const dr = r1 - r2;
    const ds = (-q1 - r1) - (-q2 - r2);
    return (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2;
  }

  function hexRingNumber(q, r) {
    return hexDistance(q, r, 0, 0);
  }

  function hexNeighbors(q, r) {
    return HEX_DIRS.map(([dq, dr]) => [q + dq, r + dr]);
  }

  function generateHexRing(radius) {
    if (radius <= 0) return [[0, 0]];
    const results = [];
    let q = HEX_DIRS[4][0] * radius;
    let r = HEX_DIRS[4][1] * radius;
    for (let side = 0; side < 6; side++) {
      const [dq, dr] = HEX_DIRS[side];
      for (let step = 0; step < radius; step++) {
        results.push([q, r]);
        q += dq;
        r += dr;
      }
    }
    return results;
  }

  function axialRound(fq, fr) {
    const fs = -fq - fr;
    let rq = Math.round(fq);
    let rr = Math.round(fr);
    let rs = Math.round(fs);
    const qDiff = Math.abs(rq - fq);
    const rDiff = Math.abs(rr - fr);
    const sDiff = Math.abs(rs - fs);
    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    } else {
      rs = -rq - rr;
    }
    return [rq === 0 ? 0 : rq, rr === 0 ? 0 : rr];
  }

  function axialToPixel(q, r, size, originX = 0, originY = 0) {
    const x = originX + size * SQRT3 * (q + r * 0.5);
    const y = originY + size * 1.5 * r;
    return { x, y };
  }

  function pixelToAxial(px, py, size, originX = 0, originY = 0) {
    const x = px - originX;
    const y = py - originY;
    const fq = (SQRT3 / 3 * x - (1 / 3) * y) / size;
    const fr = ((2 / 3) * y) / size;
    const [q, r] = axialRound(fq, fr);
    return { q, r };
  }

  function getHexVertices(cx, cy, size) {
    const verts = [];
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 180) * (60 * i - 30);
      verts.push({
        x: cx + size * Math.cos(ang),
        y: cy + size * Math.sin(ang)
      });
    }
    return verts;
  }

  /**
   * Allocate all existing plots into concentric hexagonal rings by biome order.
   * Center island (centerPlot) is always placed at axial (0, 0) in Ring 0.
   * Each biome occupies one or more full rings without mixing biomes on the same ring.
   */
  function allocateBiomesToRings(plotsByBiome, biomeOrder, centerPlot) {
    const plotToHex = {};
    const hexToPlot = {};
    const hexMeta = {};
    const biomeRings = {};

    const cKey = `${centerPlot[0]},${centerPlot[1]}`;
    const cBiome = centerPlot[2] || biomeOrder[0];
    plotToHex[cKey] = { q: 0, r: 0, ring: 0, biome: cBiome, gx: centerPlot[0], gy: centerPlot[1] };
    hexToPlot[hexKey(0, 0)] = { gx: centerPlot[0], gy: centerPlot[1], plotKey: cKey, biome: cBiome, ring: 0 };
    hexMeta[cKey] = plotToHex[cKey];
    biomeRings[cBiome] = [0];

    let currentRing = 1;
    for (const biomeId of biomeOrder) {
      const list = (plotsByBiome[biomeId] || []).filter(p => !(p.gx === centerPlot[0] && p.gy === centerPlot[1]));
      if (list.length === 0) continue;

      // Sort plots deterministically by angle around center so spatial orientation feels natural
      const sorted = [...list].sort((a, b) => {
        const da = Math.hypot(a.gx - centerPlot[0], a.gy - centerPlot[1]);
        const db = Math.hypot(b.gx - centerPlot[0], b.gy - centerPlot[1]);
        if (Math.abs(da - db) > 0.25) return da - db;
        const aa = Math.atan2(a.gy - centerPlot[1], a.gx - centerPlot[0]);
        const ab = Math.atan2(b.gy - centerPlot[1], b.gx - centerPlot[0]);
        return aa - ab;
      });

      if (!biomeRings[biomeId]) biomeRings[biomeId] = [];
      let cursor = 0;
      while (cursor < sorted.length) {
        const ringCoords = generateHexRing(currentRing);
        biomeRings[biomeId].push(currentRing);
        const remaining = sorted.length - cursor;
        const take = Math.min(remaining, ringCoords.length);

        // Evenly space slots around the 6-sided ring if partially filled
        const chosenIndices = [];
        if (take === ringCoords.length) {
          for (let i = 0; i < ringCoords.length; i++) chosenIndices.push(i);
        } else {
          for (let i = 0; i < take; i++) {
            const idx = Math.floor((i * ringCoords.length) / take);
            chosenIndices.push(idx);
          }
        }

        // Align both the ring's plots and the ring's hex slots by compass angle around center
        // so North/South/East/West/diagonals on the hex map match the actual world direction.
        const batch = sorted.slice(cursor, cursor + take).sort((a, b) => {
          const aa = Math.atan2(a.gy - centerPlot[1], a.gx - centerPlot[0]);
          const ab = Math.atan2(b.gy - centerPlot[1], b.gx - centerPlot[0]);
          return aa - ab;
        });
        cursor += take;

        const chosenCoords = chosenIndices
          .map(idx => ringCoords[idx])
          .sort((a, b) => {
            const pa = axialToPixel(a[0], a[1], 1, 0, 0);
            const pb = axialToPixel(b[0], b[1], 1, 0, 0);
            return Math.atan2(pa.y, pa.x) - Math.atan2(pb.y, pb.x);
          });

        for (let i = 0; i < take; i++) {
          const item = batch[i];
          const [q, r] = chosenCoords[i];
          const pKey = `${item.gx},${item.gy}`;
          const hKey = hexKey(q, r);
          const entry = { q, r, ring: currentRing, biome: biomeId, gx: item.gx, gy: item.gy };
          plotToHex[pKey] = entry;
          hexToPlot[hKey] = { gx: item.gx, gy: item.gy, plotKey: pKey, biome: biomeId, ring: currentRing };
          hexMeta[pKey] = entry;
        }
        currentRing++;
      }
    }

    return {
      plotToHex,
      hexToPlot,
      hexMeta,
      biomeRings,
      maxRing: currentRing - 1
    };
  }

  Balaclava.HexGrid = {
    HEX_DIRS,
    hexKey,
    hexDistance,
    hexRingNumber,
    hexNeighbors,
    generateHexRing,
    axialRound,
    axialToPixel,
    pixelToAxial,
    getHexVertices,
    allocateBiomesToRings
  };
})();
