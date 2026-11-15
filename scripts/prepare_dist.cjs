#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WWW_DIR = path.join(ROOT_DIR, 'www');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const FALLBACK_BASES = {
  BASE: 'assets/packs/',
  ROOT: ''
};

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkFiles(full, out);
    } else if (ent.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function collectReferencedAssets(codeFiles) {
  const referenced = new Set();

  for (const file of codeFiles) {
    const text = fs.readFileSync(file, 'utf8');

    // Collect local/module base constants like: const FDA_BASE = 'assets/packs/.../'
    const bases = { ...FALLBACK_BASES };
    const baseDeclRe = /\b(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*['"](assets\/[^'"]+)['"]\s*;/g;
    let m;
    while ((m = baseDeclRe.exec(text)) !== null) {
      let val = m[2];
      try { val = decodeURIComponent(val); } catch {}
      bases[m[1]] = val.replace(/\\/g, '/');
    }

    // 1. Direct literals: 'assets/.../file.ext', "../assets/.../file.ext", etc.
    const directRe = /(?:\.\.\/)?(assets\/[A-Za-z0-9_.\-/ %()\[\]+,'~@!&]+?\.[A-Za-z0-9]{1,8})(?=["'\s)`])/g;
    while ((m = directRe.exec(text)) !== null) {
      let rel = m[1];
      try { rel = decodeURIComponent(rel); } catch {}
      referenced.add(rel.replace(/\\/g, '/'));
    }

    // 2. Concatenations using discovered base constants: FDA_BASE + 'sub/file.ext'
    for (const [varName, baseVal] of Object.entries(bases)) {
      const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const concatRe = new RegExp(`\\b${escaped}\\s*\\+\\s*['"]([^'"]+\\.[A-Za-z0-9]{1,8})['"]`, 'g');
      while ((m = concatRe.exec(text)) !== null) {
        let sub = m[1];
        try { sub = decodeURIComponent(sub); } catch {}
        referenced.add((baseVal + sub).replace(/\\/g, '/').replace(/^\/+/, ''));
      }
    }
  }

  return referenced;
}

function copyFileEnsured(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function main() {
  if (!fs.existsSync(WWW_DIR)) {
    throw new Error(`Missing www directory: ${WWW_DIR}`);
  }

  const indexFile = path.join(WWW_DIR, 'index.html');
  const styleFiles = walkFiles(path.join(WWW_DIR, 'styles')).filter(f => /\.(css|map)$/i.test(f));
  const scriptFiles = walkFiles(path.join(WWW_DIR, 'src')).filter(f => /\.js$/i.test(f));
  const codeFiles = [indexFile, ...styleFiles, ...scriptFiles].filter(f => fs.existsSync(f));

  const referencedAssets = collectReferencedAssets(codeFiles);
  const missing = [];
  const existingAssets = [];

  for (const rel of Array.from(referencedAssets).sort()) {
    const abs = path.join(WWW_DIR, ...rel.split('/'));
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      existingAssets.push([rel, abs]);
    } else {
      missing.push(rel);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Found ${missing.length} missing referenced asset(s):\n  - ${missing.slice(0, 15).join('\n  - ')}`
    );
  }

  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.mkdirSync(DIST_DIR, { recursive: true });

  let totalBytes = 0;
  let totalFiles = 0;

  for (const srcFile of codeFiles) {
    const rel = path.relative(WWW_DIR, srcFile);
    const dst = path.join(DIST_DIR, rel);
    copyFileEnsured(srcFile, dst);
    totalBytes += fs.statSync(srcFile).size;
    totalFiles++;
  }

  for (const [rel, srcFile] of existingAssets) {
    const dst = path.join(DIST_DIR, ...rel.split('/'));
    copyFileEnsured(srcFile, dst);
    totalBytes += fs.statSync(srcFile).size;
    totalFiles++;
  }

  const wwwAllFiles = walkFiles(WWW_DIR);
  const wwwTotalBytes = wwwAllFiles.reduce((acc, f) => acc + fs.statSync(f).size, 0);
  const mb = b => (b / (1024 * 1024)).toFixed(2);

  console.log(
    `[prepare-dist] Built ${path.relative(ROOT_DIR, DIST_DIR)}/: ${totalFiles} files (${mb(totalBytes)} MB) ` +
    `from ${wwwAllFiles.length} www files (${mb(wwwTotalBytes)} MB); excluded ${mb(wwwTotalBytes - totalBytes)} MB.`
  );
}

main();
