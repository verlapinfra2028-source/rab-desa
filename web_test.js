'use strict';
// Uji ujung-ke-ujung antarmuka web memakai jsdom: node web_test.js <jenis> <keluaran.xlsx>
const fs = require('fs'), path = require('path'); const { JSDOM } = require('jsdom'); const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
try { GlobalFonts.registerFromPath('/usr/local/lib/python3.12/dist-packages/matplotlib/mpl-data/fonts/ttf/DejaVuSans.ttf', 'sans-serif'); } catch (e) {}
const [, , jenis = 'cor', out = '/home/claude/out/web_out.xlsx'] = process.argv;
const html = fs.readFileSync(path.join(__dirname, 'docs/index.html'), 'utf8').replace('<script src="app.js"></script>', '');
const { VirtualConsole } = require('jsdom'); const vc = new VirtualConsole(); vc.sendTo(console);
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc }); const w = dom.window; const captured = {};
w.fetch = async () => ({ json: async () => JSON.parse(fs.readFileSync(path.join(__dirname, 'docs/data.json'), 'utf8')) });
const orig = w.document.createElement.bind(w.document); w.document.createElement = t => t === 'canvas' ? createCanvas(1, 1) : orig(t);
w.Blob = function (parts) { captured.buf = Buffer.from(parts[0]); }; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.HTMLAnchorElement.prototype.click = function () { captured.name = this.download; };
w.eval(fs.readFileSync(path.join(__dirname, 'docs/app.js'), 'utf8')); w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
const wait = async cond => { for (let i = 0; i < 400; i++) { if (cond()) return true; await new Promise(r => setTimeout(r, 50)); } return false; };
(async () => {
  if (!await wait(() => w.__ready)) throw new Error('aplikasi tidak siap'); const sel = w.document.getElementById('jenis'); sel.value = jenis; sel.dispatchEvent(new w.Event('change'));
  const setv = (k, v) => { const el = w.document.querySelector(`#formInput [data-k="${k}"]`); if (el) { el.value = v; } };
  if (jenis === 'cor') { setv('jdl', '5'); setv('wt', 'M6'); setv('dj', 'Besi ulir'); }
  w.document.querySelectorAll('#formData [data-d]').forEach(e => { const m = { 3: 'Kemudi', 5: 'Duduksampean', 7: 'Ahmad Fauzi', 8: 'Budi Santoso', 9: 'Slamet Riyadi', 2: '150.000.000' }; if (m[e.dataset.d]) e.value = m[e.dataset.d]; });
  w.document.getElementById('btnBuat').click(); const ok = await wait(() => /Selesai|Gagal/.test(w.document.getElementById('status').textContent)); console.log('status:', w.document.getElementById('status').textContent);
  if (captured.buf) { fs.writeFileSync(out, captured.buf); console.log('file', captured.name, captured.buf.length, 'byte'); }
})().catch(e => { console.error('GAGAL', e); process.exit(1); });
