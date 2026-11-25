const path = require('path'), fs = require('fs'); const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
try { GlobalFonts.registerFromPath('/usr/local/lib/python3.12/dist-packages/matplotlib/mpl-data/fonts/ttf/DejaVuSans.ttf', 'sans-serif'); } catch (e) {}
const R = (require('./src/drawings.js'), require('./src/drawings2.js')); const spec = require('./src/specs/' + process.argv[2] + '.js'); const AHm = {}; const sp = typeof spec === 'function' ? spec(JSON.parse(fs.readFileSync(path.join(__dirname, 'data/ahsp_ck.json'), 'utf8')).reduce((a, x) => (a[x.kode] = x, a), {})) : spec;
const d = {}, N = {}; sp.inputs.forEach(i => { d[i.k] = i.v; N[i.k] = i.n; }); if (d.dasar === undefined) d.dasar = 'Cor';
for (const v of ['melintang', 'memanjang', 'denah', 'detail']) { const S = R[process.argv[2]][v](createCanvas, d, N, false); fs.writeFileSync('/home/claude/out/dr_' + process.argv[2] + '_' + v + '.png', S.c.toBuffer('image/png')); }
console.log('ok');
