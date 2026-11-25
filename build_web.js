'use strict';
// Membuat folder docs/ (siap GitHub Pages): node build_web.js
const fs = require('fs'), path = require('path'), esbuild = require('esbuild'); const { build } = require('./src/engine.js');
const AHfull = JSON.parse(fs.readFileSync('data/ahsp_ck.json', 'utf8')); const full = Array.isArray(AHfull) ? Object.fromEntries(AHfull.map(x => [x.kode, x])) : AHfull; const pages = JSON.parse(fs.readFileSync('data/pages_ck.json', 'utf8'));
const used = new Set(); const AHp = new Proxy(full, { get(t, k) { if (typeof k === 'string' && t[k]) used.add(k); return t[k]; } });
for (const k of ['drainase', 'uditch', 'paving', 'cor', 'tpt', 'box', 'jembatan']) { const SP = require('./src/specs/' + k + '.js'); const spec = typeof SP === 'function' ? SP(AHp) : SP; build(spec, { AH: AHp, pages, logo: null, test: false, images: {} }); }
const ahsp = {}; for (const c of used) ahsp[c] = full[c]; const pg = {}; for (const c of used) if (pages[c.split('-')[0]]) pg[c.split('-')[0]] = pages[c.split('-')[0]];
fs.mkdirSync('docs', { recursive: true }); fs.writeFileSync('docs/data.json', JSON.stringify({ ahsp, pages: pg, logo: fs.readFileSync('data/logo_gresik.jpeg').toString('base64') }));
fs.copyFileSync('web/index.html', 'docs/index.html'); fs.copyFileSync('web/style.css', 'docs/style.css');
const NM = (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean);
const XL = NM.map(d => path.join(d, 'exceljs/dist/exceljs.min.js')).find(p => fs.existsSync(p));
esbuild.buildSync({ entryPoints: ['web/main.js'], bundle: true, nodePaths: NM, alias: XL ? { exceljs: XL } : {}, minify: true, platform: 'browser', format: 'iife', outfile: 'docs/app.js', define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'warning' });
console.log('docs siap: ', Object.keys(ahsp).length, 'analisa AHSP;', (fs.statSync('docs/app.js').size / 1e6).toFixed(2), 'MB app.js;', (fs.statSync('docs/data.json').size / 1e3).toFixed(0), 'KB data.json');
