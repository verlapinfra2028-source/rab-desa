'use strict';
// pemakaian: NODE_PATH=... node run.js <spec> <keluaran.xlsx> [test] [k=v ...]
const fs = require('fs'), path = require('path'); const { build } = require('./src/engine.js'); const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
try { GlobalFonts.registerFromPath('/usr/local/lib/python3.12/dist-packages/matplotlib/mpl-data/fonts/ttf/DejaVuSans.ttf', 'sans-serif'); } catch (e) {}
const { makeImages, nodePng } = require('./src/images.js');
const [, , specName, outFile, mode] = process.argv; const SP = require('./src/specs/' + specName + '.js');
const AH = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/ahsp_ck.json'), 'utf8')); const AHm = Array.isArray(AH) ? Object.fromEntries(AH.map(x => [x.kode, x])) : AH;
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/pages_ck.json'), 'utf8')); const logo = fs.readFileSync(path.join(__dirname, 'data/logo_gresik.jpeg'));
const spec = typeof SP === 'function' ? SP(AHm) : SP; const ov = {};
for (const kv of process.argv.slice(5)) { const [k, v] = kv.split('='); const inp = spec.inputs.find(i => i.k === k); if (inp) { delete inp.f; inp.v = isNaN(+v) ? v : +v; ov[k] = inp.v; } }
const images = process.env.NOIMG ? {} : makeImages(specName, spec, ov, createCanvas, nodePng);
const X = build(spec, { AH: AHm, pages, logo, test: mode === 'test', images });
X.wb.xlsx.writeFile(outFile).then(() => console.log('tersimpan', outFile));
