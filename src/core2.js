'use strict';
const U = require('./util.js'); const { put, font, FILL, RP, RP2, COLS, COLN, WRAP, CEN, head, title, grid, merge, widths, setPrint, dvList, condFmt, RED, AMB } = U;
const { SH, q, norm, satFinal, hdrBlock } = require('./core.js');
// ---------- Harga Satuan ----------
function setupHarga(X) {
  const { spec, AH, ws, S } = X; const w = ws.hs;
  title(w, 'DAFTAR HARGA SATUAN (Tenaga, Bahan, Alat)', spec.hsSub || 'ISI kolom Harga Survey (kuning). Harga tenaga per OH. Atur Kena PPN / PPh per baris (Ya/Tidak).');
  head(w, 4, ['No', 'Jenis', 'Kode', 'Uraian', 'Satuan', 'Harga Survey (Rp)', 'Kena PPN', 'Kena PPh 1,5%', 'Kena PPh 2%', 'Jumlah PPN (Rp/satuan)', 'Jumlah PPh 1,5% (Rp/satuan)', 'Jumlah PPh 2% (Rp/satuan)', 'Total Harga Termasuk Pajak (Rp)', 'Catatan']);
  const K = X.KEYS; const order = { tenaga: 0, bahan: 1, alat: 2 };
  for (const code of spec.codes) for (const c of AH[code].komponen) { const nm = norm(c.jenis, c.uraian, spec); if (!K[nm.key]) K[nm.key] = { jenis: c.jenis, kode: c.kode, disp: nm.disp, sat: satFinal(c) }; }
  if (!K['tenaga|kepala tukang'] && (spec.extraKeys || []).some(e => e.key === 'tenaga|kepala tukang')) { /* no-op */ }
  for (const e of (spec.extraKeys || [])) K[e.key] = { jenis: e.jenis, kode: e.kode || null, disp: typeof e.disp === 'function' ? e.disp(X) : e.disp, sat: e.sat, note: e.note, ppn: e.ppn };
  const keys = Object.keys(K).sort((a, b) => { const A = K[a], B = K[b]; return (order[A.jenis] - order[B.jenis]) || String(A.kode || 'Z').localeCompare(String(B.kode || 'Z')) || String(A.disp).localeCompare(String(B.disp)); });
  let r = 5;
  keys.forEach((k, n) => {
    const v = K[k]; const nameLow = k.split('|')[1];
    const ppn = v.ppn || ((v.jenis === 'bahan' && (spec.ppnDefault || []).some(p => nameLow.includes(p))) ? 'Ya' : 'Tidak');
    put(w, 'A' + r, n + 1); put(w, 'B' + r, v.jenis[0].toUpperCase() + v.jenis.slice(1)); put(w, 'C' + r, v.kode || ''); put(w, 'D' + r, v.disp); put(w, 'E' + r, v.sat);
    const tp = X.test && spec.testPrice ? spec.testPrice(nameLow, k) : null; put(w, 'F' + r, tp, { color: '0000FF', fill: FILL.yel, fmt: RP });
    ['G', 'H', 'I'].forEach((col, i) => { put(w, col + r, [ppn, 'Tidak', 'Tidak'][i], { color: '0000FF', fill: FILL.yel, al: CEN }); });
    put(w, 'J' + r, `=IF(G${r}="Ya",N(F${r})*${S.ppn},0)`, { fmt: RP }); put(w, 'K' + r, `=IF(H${r}="Ya",N(F${r})*${S.pph15},0)`, { fmt: RP }); put(w, 'L' + r, `=IF(I${r}="Ya",N(F${r})*${S.pph2},0)`, { fmt: RP });
    put(w, 'M' + r, `=N(F${r})+J${r}+K${r}+L${r}`, { bold: true, fmt: RP }); put(w, 'N' + r, v.note || (ppn === 'Ya' ? 'Default PPN mengikuti pola contoh RAB; sesuaikan.' : ''), { size: 9, color: '555555' });
    X.hrow[k] = r; r++;
  });
  const lastH = r - 1; r += 1; put(w, 'D' + r, 'Pengukuran dan pembersihan lokasi (lump sum)', { bold: true }); put(w, 'E' + r, 'ls'); put(w, 'F' + r, X.test ? 200000 : null, { color: '0000FF', fill: FILL.yel, fmt: RP });
  X.LS = q(SH.hs) + '!$F$' + r;
  for (let rr = 5; rr <= lastH; rr++) ['G', 'H', 'I'].forEach(col => dvList(w, col + rr, 'Ya,Tidak'));
  widths(w, [5, 9, 8, spec.hsWideD || 40, 8, 17, 10, 12, 11, 16, 16, 16, 20, 44]); w.getRow(4).height = 42; w.views = [{ state: 'frozen', ySplit: 4 }]; setPrint(w);
  X.HP = k => q(SH.hs) + '!$F$' + X.hrow[k]; X.HX = (k, col) => q(SH.hs) + '!$' + col + '$' + X.hrow[k];
}
// ---------- Backup Volume ----------
function setupBackup(X) {
  const { spec, ws } = X; const w = ws.bv; const CELL = X.CELL; const VC = 'D';
  title(w, spec.bvTitle, spec.bvSub || 'Isi sel KUNING. Contoh isian; ganti sesuai gambar rencana. Ukuran dalam meter. Notasi lihat gambar di kanan.');
  const t0 = hdrBlock(X, w, 'M'); X.t0 = t0;
  const hrow3 = (r, cells) => cells.forEach(([rng, text]) => { const [a, b0] = rng.split(':'); const b = b0 || a; for (let c = COLN(a); c <= COLN(b); c++) put(w, COLS(c) + r, null, { bold: true, color: 'FFFFFF', fill: FILL.hdr }); if (b !== a) w.mergeCells(`${a}${r}:${b}${r}`); const cc = w.getCell(a + r); cc.value = text; cc.alignment = CEN; });
  hrow3(t0, [['A:B', 'Data Input'], ['C', 'Notasi'], ['D', 'Nilai'], ['E', 'Satuan'], ['F:M', 'Keterangan']]);
  const inputs = spec.inputs; let rr = t0 + 1; inputs.forEach(i => { CELL[i.k] = `$${VC}$${rr}`; rr++; });
  const rAfter = rr; const r_chk = rAfter + 1; const checks = spec.checks || []; const r_calc = r_chk + 1 + checks.length + 1;
  spec.calcs.forEach((c, i) => { CELL[c.k] = `$${VC}$${r_calc + 1 + i}`; });
  const rep = (s, ext) => s.replace(/\{(\w+)\}/g, (m, k) => { if (!(k in CELL)) throw new Error('token tak dikenal: ' + k + ' dalam ' + s); return (ext ? q(SH.bv) + '!' : '') + CELL[k]; });
  X.rep = (s) => rep(s, true); X.repL = (s) => rep(s, false);
  rr = t0 + 1;
  for (const i of inputs) {
    w.mergeCells(`A${rr}:B${rr}`); put(w, 'A' + rr, i.label); put(w, 'C' + rr, i.n || '', { bold: true, al: CEN });
    const isF = typeof i.f === 'string'; const val = isF ? rep(i.f, false) : i.v;
    put(w, 'D' + rr, val, { color: isF ? '000000' : '0000FF', fill: FILL.yel, fmt: i.fmt || (i.unit === '%' ? '0.0%' : '0.00'), al: typeof val === 'string' && !isF ? CEN : undefined });
    put(w, 'E' + rr, i.unit === '%' ? '' : (i.unit || '')); w.mergeCells(`F${rr}:M${rr}`); put(w, 'F' + rr, i.note || '', { size: 9, color: '555555', al: WRAP });
    if (i.list) dvList(w, 'D' + rr, typeof i.list === 'function' ? i.list(X) : i.list); rr++;
  }
  grid(w, t0, 1, rr - 1, 13, true);
  // cek
  rr = r_chk; hrow3(rr, [['A:B', spec.checkTitle || 'Cek Spesifikasi (profil di Master Data Pekerjaan)'], ['C:D', 'Hasil'], ['E:M', 'Keterangan']]); rr++;
  checks.forEach(c => { w.mergeCells(`A${rr}:B${rr}`); put(w, 'A' + rr, c.label); w.mergeCells(`C${rr}:D${rr}`); put(w, 'C' + rr, rep(c.f, false), { al: CEN }); w.mergeCells(`E${rr}:M${rr}`); put(w, 'E' + rr, c.note || '', { size: 9, color: '555555' }); condFmt(w, 'C' + rr, `C${rr}<>"OK"`, c.lvl === 'amber' ? AMB : RED); rr++; });
  grid(w, r_chk, 1, rr - 1, 13, true);
  // rincian
  rr = r_calc; hrow3(rr, [['A:B', 'Rincian Perhitungan Volume'], ['C', 'Notasi'], ['D', 'Hasil'], ['E', 'Satuan'], ['F:H', 'Rumus (notasi)'], ['I:M', 'Rumus dengan angka']]); rr++;
  const NN = k => { const c = spec.calcs.find(x => x.k === k); if (c) return c.n || k; const i = inputs.find(x => x.k === k); return i && i.n ? i.n : k; };
  for (let c of spec.calcs) {
    const cex = typeof c.expr === 'function' ? c.expr(X) : c.expr; const cwr = typeof c.wrap === 'function' ? c.wrap(X) : c.wrap; c = Object.assign({}, c, { expr: cex, wrap: cwr });
    let live = rep(c.expr, false); if (c.wrap) live = c.wrap.replace(/\{E\}/g, live).replace(/\{(\w+)\}/g, (m, k) => CELL[k]);
    const own = CELL[c.k]; let sym, ang;
    const fx = ref => `"&FIXED(${ref},3,TRUE)&"`;
    if (c.sym !== undefined) { sym = c.sym; ang = c.ang ? rep(c.ang, false).replace(/\{@\}/g, own) : `="hasil: "&FIXED(${own},3,TRUE)`; }
    else {
      sym = c.expr.replace(/\{(\w+)\}/g, (m, k) => NN(k)).replace(/\*/g, ' × ');
      const num = c.expr.replace(/\*/g, '×').replace(/\^2/g, '²').replace(/\{(\w+)\}/g, (m, k) => fx(CELL[k]));
      if (c.wrap) { const ex = rep(c.expr, false); ang = '="' + num + ' = "&FIXED(' + ex + ',3,TRUE)&"   → dipakai: "&FIXED(' + own + ',3,TRUE)'; } else ang = '="' + num + ' = "&FIXED(' + own + ',3,TRUE)';
    }
    w.mergeCells(`A${rr}:B${rr}`); put(w, 'A' + rr, c.label); put(w, 'C' + rr, c.n || c.k, { bold: true, al: CEN });
    put(w, 'D' + rr, '=' + live, { fmt: c.fmt || (['buah', 'titik', ''].includes(c.unit || '') ? '#,##0.###' : '#,##0.000') }); put(w, 'E' + rr, c.unit || '');
    w.mergeCells(`F${rr}:H${rr}`); put(w, 'F' + rr, sym + (c.wrap && c.sym === undefined ? '  (bila dipilih)' : ''), { size: 9, al: WRAP }); w.mergeCells(`I${rr}:M${rr}`); put(w, 'I' + rr, ang, { size: 9, al: WRAP }); w.getRow(rr).height = 30; rr++;
  }
  grid(w, r_calc, 1, rr - 1, 13, true);
  // format RAB
  rr++; const r_fmt = rr; const a1 = w.getCell('A' + rr); a1.value = 'BACKUP VOLUME (FORMAT RAB)'; a1.font = font({ bold: true, size: 12 }); rr++;
  hrow3(rr, [['A', 'NO'], ['B', 'URAIAN'], ['C:G', 'DIMENSI'], ['H:K', 'Lain'], ['L', 'VOLUME'], ['M', 'SAT']]); rr++;
  ['', '', 'P', 'L', 'T', 'Jlh', 'Luas', 'Lain 1 (phi)', 'Lain 2', 'Lain 3', 'Lain 4', '', ''].forEach((t, i) => put(w, COLS(1 + i) + rr, t || null, { bold: true, color: 'FFFFFF', fill: FILL.hdr, al: CEN }));
  for (const col of ['A', 'B', 'L', 'M']) w.mergeCells(`${col}${rr - 1}:${col}${rr}`);
  rr++;
  const VF = X.VF; const line = (r, label, dims, sat) => {
    put(w, 'B' + r, label, { al: WRAP });
    for (const col of 'CDEFGHIJK') { const v = dims[col]; put(w, col + r, v ? '=' + rep(v.replace(/@(\w+)/g, (m, k) => X.VFL[k]), false) : null, { fmt: '#,##0.000' }); }
    put(w, 'L' + r, `=IF(COUNT(C${r}:K${r})=0,0,PRODUCT(C${r}:G${r},I${r}:K${r})*IF(H${r}="",1,PI()/4*H${r}^2))`, { fmt: '#,##0.000' }); put(w, 'M' + r, sat);
  };
  for (const n of spec.format) {
    if (n.cat) { put(w, 'A' + rr, n.cat, { bold: true, fill: FILL.sub }); put(w, 'B' + rr, n.text, { bold: true, fill: FILL.sub }); for (const col of 'CDEFGHIJKLM') put(w, col + rr, null, { fill: FILL.sub }); rr++; continue; }
    put(w, 'A' + rr, n.item, { al: CEN }); put(w, 'B' + rr, n.label, { bold: true, al: WRAP }); rr++; const first = rr;
    for (const l of n.lines) { line(rr, l.sub, l.dims, n.unit); put(w, 'A' + rr, null); rr++; }
    put(w, 'K' + rr, 'total =', { bold: true, al: { horizontal: 'right' } }); put(w, 'L' + rr, `=SUM(L${first}:L${rr - 1})`, { bold: true, fmt: '#,##0.000' }); put(w, 'M' + rr, n.unit, { bold: true });
    VF[n.key] = q(SH.bv) + '!$L$' + rr; X.VFL = X.VFL || {}; X.VFL[n.key] = '$L$' + rr; rr++;
  }
  put(w, 'B' + rr, 'Cek terhadap rincian rumus', { italic: true });
  const eq = spec.eqs.map(([vk, ck]) => `ABS(${X.VFL[vk]}-${CELL[ck]})<0.000001`).join(',');
  put(w, 'L' + rr, `=IF(AND(${eq}),"OK","SELISIH")`, { bold: true, al: CEN }); condFmt(w, 'L' + rr, `L${rr}="SELISIH"`, RED); rr++;
  grid(w, r_fmt + 1, 1, rr - 1, 13, true);
  const nt = w.getCell('A' + (rr + 1)); nt.value = spec.fmtNote || 'Keterangan kolom: Lain 1 (phi) = diameter (m) untuk elemen bulat seperti stros, kolom, sloof, balok; Lain 2-4 = pengali bebas (jumlah, berat per m, dst.).'; nt.font = font({ size: 9, italic: true, color: '555555' });
  widths(w, [6, 46, 11, 11, 11, 11, 11, 13, 11, 11, 11, 14, 8]); setPrint(w, { printArea: `A1:M${rr + 1}` });
  const nt2 = (X.opts.images || {}).notasi; if (nt2 && nt2.length) { let row = t0 - 1; for (const im of nt2) { const id = X.wb.addImage(im.base64 ? { base64: im.base64, extension: 'png' } : { buffer: im.buffer, extension: 'png' }); const wpx = 640, hpx = Math.round(im.height * wpx / im.width); w.addImage(id, { tl: { col: 14, row }, ext: { width: wpx, height: hpx } }); row += Math.ceil(hpx / 20) + 2; } }
  X.bvLast = rr;
}
module.exports = { setupHarga, setupBackup };
