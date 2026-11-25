'use strict';
const U = require('./util.js'); const { put, font, FILL, RP, RP2, COLS, COLN, WRAP, CEN, head, title, grid, widths, setPrint, dvList, condFmt, RED, AMB, med, thin } = U;
const { SH, q, norm, satFinal, hdrBlock } = require('./core.js');
const LINK = { color: '0563C1', underline: true };
// ---------- AHSP (blok dasar + helper blok dinamis) ----------
function setupAHSP(X) {
  const { spec, AH, ws } = X; const w = ws.ah; X.ahR = 4;
  title(w, 'ANALISA HARGA SATUAN PEKERJAAN (AHSP)', 'Koefisien dari Master Koefisien AHSP; harga dari sheet Harga Satuan. Biaya umum dan keuntungan memakai pengaturan di Master Data Pekerjaan.');
  X.pick = (vs, getter) => { let out = getter(vs[vs.length - 1][1]); for (let i = vs.length - 2; i >= 0; i--) out = `IF(${X.rep(vs[i][0])},${getter(vs[i][1])},${out})`; return out; };
  X.blockHead = (codeText, titleText, src) => {
    const r = X.ahR; for (let c = 1; c <= 10; c++) put(w, COLS(c) + r, null, { fill: FILL.sub });
    put(w, 'A' + r, codeText, { bold: true, fill: FILL.sub }); w.mergeCells(`B${r}:F${r}`); put(w, 'B' + r, titleText, { bold: true, fill: FILL.sub, al: WRAP });
    w.mergeCells(`G${r}:J${r}`); put(w, 'G' + r, src, { size: 8, color: '555555', fill: FILL.sub }); w.getRow(r).height = 30;
    head(w, r + 1, ['No', 'Uraian', 'Kode', 'Satuan', 'Koefisien', 'Harga Satuan (Rp)', 'Jumlah Harga (Rp)', 'PPN (Rp)', 'PPh 1,5% (Rp)', 'PPh 2% (Rp)']); X.ahStart = r; X.ahR = r + 2; return r;
  };
  X.blockRow = (name, kode, sat, coef, price, taxes, keyForCoef) => {
    const r = X.ahR; put(w, 'B' + r, name); put(w, 'C' + r, kode || ''); put(w, 'D' + r, sat); put(w, 'E' + r, coef, { fmt: '#,##0.0000' });
    put(w, 'F' + r, '=' + price, { fmt: RP2 }); put(w, 'G' + r, `=E${r}*F${r}`, { fmt: RP2 });
    ['H', 'I', 'J'].forEach((col, i) => put(w, col + r, `=E${r}*(${taxes[i]})`, { fmt: RP2 })); X.ahR++; return r;
  };
  X.blockSection = (letter, label) => { put(w, 'A' + X.ahR, letter, { bold: true }); put(w, 'B' + X.ahR, label, { bold: true }); X.ahR++; };
  X.blockTotal = (label, first, subs, key) => { const r = X.ahR; put(w, 'B' + r, label, { bold: true }); put(w, 'G' + r, r > first ? `=SUM(G${first}:G${r - 1})` : 0, { bold: true, fmt: RP2 }); subs[key] = 'G' + r; X.ahR++; };
  X.blockTail = (subs, compRows, rs) => {
    let r = X.ahR; put(w, 'A' + r, 'D', { bold: true }); put(w, 'B' + r, 'Jumlah Harga Tenaga, Bahan dan Peralatan (A+B+C)', { bold: true }); put(w, 'G' + r, `=${subs.tenaga}+${subs.bahan}+${subs.alat}`, { bold: true, fmt: RP2 }); const d = 'G' + r; r++;
    put(w, 'A' + r, 'E', { bold: true }); put(w, 'B' + r, 'Biaya Umum dan Keuntungan x D'); put(w, 'F' + r, '=' + X.S.op, { fmt: '0.0%' }); put(w, 'G' + r, `=${d}*F${r}`, { fmt: RP2 }); const e = 'G' + r; r++;
    put(w, 'A' + r, 'F', { bold: true }); put(w, 'B' + r, 'Harga Satuan Pekerjaan (D+E), sebelum pajak', { bold: true }); put(w, 'G' + r, `=${d}+${e}`, { bold: true, fmt: RP2 }); const f = 'G' + r; r++;
    const tx = {};
    [['ppn', 'G  PPN komponen kena PPN', 'H'], ['pph15', 'H  PPh 1,5% komponen terkait', 'I'], ['pph2', 'I  PPh 2% komponen terkait', 'J']].forEach(([k, lab, col]) => { put(w, 'A' + r, lab.split(' ')[0], { bold: true }); put(w, 'B' + r, lab.slice(3)); put(w, 'G' + r, '=' + (compRows.length ? compRows.map(x => col + x).join('+') : '0'), { fmt: RP2 }); tx[k] = 'AHSP!$G$' + r; r++; });
    put(w, 'A' + r, 'J', { bold: true }); put(w, 'B' + r, 'Harga Satuan Pekerjaan (F+G+H+I), setelah pajak', { bold: true, fill: FILL.grn }); put(w, 'G' + r, `=${f}+G${r - 3}+G${r - 2}+G${r - 1}`, { bold: true, fmt: RP2, fill: FILL.grn });
    const res = Object.assign({ D: 'AHSP!$' + d[0] + '$' + d.slice(1), F: 'AHSP!$' + f[0] + '$' + f.slice(1), J: 'AHSP!$G$' + r }, tx);
    grid(w, rs, 1, r, 10, true); X.ahR = r + 2; return res;
  };
  for (const code of spec.codes) {
    const a = AH[code]; const judul = a.judul.replace(/\s*\(Lihat[^)]*\)?\s*$/, '').trim(); const unit = (spec.unitCode || {})[code] || (code === '1.1.4.2' ? "m'" : 'm3');
    const rs = X.blockHead('AHSP ' + code, `1 ${unit}  -  ${judul}`, 'SE DJBK 47/2026 Lamp. VI CK'); const coef = {}; const subs = {}; const comp = [];
    [['tenaga', 'A', 'Tenaga Kerja'], ['bahan', 'B', 'Bahan'], ['alat', 'C', 'Peralatan']].forEach(([jen, L, lab]) => {
      X.blockSection(L, lab); const first = X.ahR;
      a.komponen.forEach((c, i) => {
        if (c.jenis !== jen) return; const nm = norm(jen, c.uraian, spec); const mr = X.mrow[code + '|' + i]; const r = X.ahR;
        put(w, 'B' + r, nm.disp); put(w, 'C' + r, c.kode || ''); put(w, 'D' + r, `=${q(SH.mka)}!K${mr}`); put(w, 'E' + r, `=${q(SH.mka)}!J${mr}`, { fmt: '#,##0.0000' });
        put(w, 'F' + r, '=' + X.HP(nm.key), { fmt: RP2 }); put(w, 'G' + r, `=E${r}*F${r}`, { fmt: RP2 });
        ['J', 'K', 'L'].forEach((hc, j) => put(w, ['H', 'I', 'J'][j] + r, `=E${r}*${X.HX(nm.key, hc)}`, { fmt: RP2 })); coef[nm.key] = 'AHSP!$E$' + r; comp.push(r); X.ahR++;
      });
      X.blockTotal('Jumlah Harga ' + lab, first, subs, jen);
    });
    X.arow[code] = Object.assign({ coef }, X.blockTail(subs, comp, rs));
  }
}
// ---------- item pekerjaan ----------
function makeItems(X) {
  const { spec, AH } = X;
  X.link = expr => `=IFERROR(HYPERLINK("#AHSP!A"&MATCH("AHSP "&${expr},AHSP!$A:$A,0),${expr}),"-")`;
  X.simpleItem = (nm, sat, vol, vs) => {
    const comps = {}; for (const [, code] of vs) for (const c of AH[code].komponen) { const n = norm(c.jenis, c.uraian, spec); if (!comps[n.key]) comps[n.key] = { jenis: c.jenis, disp: n.disp, kode: c.kode }; }
    const price = {}; for (const x of ['F', 'ppn', 'pph15', 'pph2']) price[x] = X.pick(vs, c => X.arow[c][x]);
    return { nm, sat, vol, comps, coef: k => '=' + X.pick(vs, c => X.arow[c].coef[k] || '0'), link: X.link(X.pick(vs, c => `"${c}"`)), price };
  };
  X.flatItem = (nm, sat, vol, block, subs) => {
    const comps = {}, terms = {}; const tk = { 'tenaga|pekerja': 'L.01', 'tenaga|tukang batu/tembok': 'L.02', 'tenaga|kepala tukang': 'L.03', 'tenaga|mandor': 'L.04' };
    for (const [k, cell] of Object.entries(block.own)) { const kk = X.KEYS[k]; comps[k] = { jenis: kk.jenis, disp: kk.disp, kode: kk.kode || tk[k] }; (terms[k] = terms[k] || []).push(cell); }
    for (const [mult, vs] of subs) {
      const keys = new Set(); for (const [, code] of vs) for (const c of AH[code].komponen) { const n = norm(c.jenis, c.uraian, spec); keys.add(n.key); if (!comps[n.key]) comps[n.key] = { jenis: c.jenis, disp: n.disp, kode: c.kode }; }
      for (const k of keys) (terms[k] = terms[k] || []).push(`${mult}*(${X.pick(vs, c => X.arow[c].coef[k] || '0')})`);
    }
    return { nm, sat, vol, comps, coef: k => '=' + terms[k].join('+'), link: X.link(block.code), price: { F: block.F, ppn: block.ppn, pph15: block.pph15, pph2: block.pph2 } };
  };
  X.unitItem = (nm, sat, vol, key) => ({ nm, sat, vol, comps: { [key]: { jenis: 'bahan', disp: X.KEYS[key].disp, kode: null } }, coef: () => '=1', link: '-', price: { F: X.HP(key), ppn: X.HX(key, 'J'), pph15: X.HX(key, 'K'), pph2: X.HX(key, 'L') } });
}
// ---------- Terbilang ----------
function setupTerbilang(X) {
  const w = X.ws.tb; title(w, 'TERBILANG (sheet bantu, jangan diubah)', 'Mengubah angka total menjadi kata-kata.');
  const DG = '"satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan"'; const D2 = DG.slice(DG.indexOf(',') + 1);
  const w3 = c => { const h = `INT(${c}/100)`, t = `MOD(${c},100)`, u = `MOD(${c},10)`;
    const hund = `IF(${h}=0,"",IF(${h}=1,"seratus ",CHOOSE(${h},"satu",${D2})&" ratus "))`, teen = `CHOOSE(${u},"satu",${D2})&" belas"`, tens = `CHOOSE(INT(${t}/10),"satu",${D2})&" puluh"&IF(${u}=0,""," "&CHOOSE(${u},${DG}))`;
    const low = `IF(${t}=0,"",IF(${t}<10,CHOOSE(${t},${DG}),IF(${t}=10,"sepuluh",IF(${t}=11,"sebelas",IF(${t}<20,${teen},${tens})))))`; return `TRIM(${hund}&${low})`; };
  X.terbilang = (row0, valref) => {
    ['Nilai', 'Miliar', 'Juta', 'Ribu', 'Satuan', 'Teks miliar', 'Teks juta', 'Teks ribu', 'Teks satuan', 'Gabungan', 'Terbilang'].forEach((lb, i) => put(w, 'A' + (row0 + i), lb));
    const v = 'B' + row0; put(w, v, `=INT(${valref})`, { fmt: RP }); put(w, 'B' + (row0 + 1), `=INT(${v}/1000000000)`); put(w, 'B' + (row0 + 2), `=INT(MOD(${v},1000000000)/1000000)`); put(w, 'B' + (row0 + 3), `=INT(MOD(${v},1000000)/1000)`); put(w, 'B' + (row0 + 4), `=MOD(${v},1000)`);
    put(w, 'B' + (row0 + 5), `=IF(B${row0 + 1}=0,"",${w3('B' + (row0 + 1))}&" miliar ")`); put(w, 'B' + (row0 + 6), `=IF(B${row0 + 2}=0,"",${w3('B' + (row0 + 2))}&" juta ")`);
    put(w, 'B' + (row0 + 7), `=IF(B${row0 + 3}=0,"",IF(B${row0 + 3}=1,"seribu ",${w3('B' + (row0 + 3))}&" ribu "))`); put(w, 'B' + (row0 + 8), `=${w3('B' + (row0 + 4))}`);
    put(w, 'B' + (row0 + 9), `=TRIM(B${row0 + 5}&B${row0 + 6}&B${row0 + 7}&B${row0 + 8})`); put(w, 'B' + (row0 + 10), `=IF(${v}=0,"Nol rupiah",UPPER(LEFT(B${row0 + 9},1))&MID(B${row0 + 9},2,500)&" rupiah")`);
    return 'Terbilang!$B$' + (row0 + 10);
  }; widths(w, [22, 90]); w.state = 'hidden';
}
// ---------- RAB Swakelola ----------
function setupSwakelola(X) {
  const { spec, ws, S } = X; const w = ws.sw; const ITEMS = X.ITEMS;
  title(w, 'RENCANA ANGGARAN BIAYA SWAKELOLA', 'Format per item: koefisien, harga satuan, kebutuhan (Vol x Koef), dibulatkan 3 desimal, harga total, pajak. Tanpa biaya umum dan keuntungan.');
  const t0 = hdrBlock(X, w, 'I'); const SL = { tenaga: 'FGHIJ'.split(''), bahan: 'KLMNOPQ'.split(''), alat: 'RS'.split('') }; const TC = 'T';
  head(w, t0, ['No', 'Uraian Pekerjaan', 'Volume', 'Satuan', 'Kode AHSP', 'Mandor', 'Kepala Tukang', 'Tukang', 'Pekerja', 'Tukang Kayu', 'Bahan 1', 'Bahan 2', 'Bahan 3', 'Bahan 4', 'Bahan 5', 'Bahan 6', 'Bahan 7', 'Alat 1', 'Alat 2', 'Jumlah Harga (Rp)']);
  let r = t0 + 1; const tot = [], ppn = [], p15 = [], p2 = []; X.need = {}; X.SWI = {};
  put(w, 'A' + r, 1, { bold: true, fill: FILL.gry }); put(w, 'B' + r, 'Pengukuran dan Pembersihan Lokasi (lump sum)', { bold: true, fill: FILL.gry }); for (let c = 3; c <= 19; c++) put(w, COLS(c) + r, null, { fill: FILL.gry });
  put(w, 'D' + r, 'ls', { bold: true, fill: FILL.gry }); put(w, 'E' + r, '-', { bold: true, fill: FILL.gry }); put(w, TC + r, '=' + X.LS, { bold: true, fill: FILL.gry, fmt: RP }); tot.push(TC + r); r++;
  const tslot = { 'L.04': 'F', 'L.03': 'G', 'L.02': 'H', 'L.01': 'I' };
  ITEMS.forEach((it, idx) => {
    const n = idx + 2; const keys = Object.keys(it.comps); const ten = keys.filter(k => it.comps[k].jenis === 'tenaga'), bah = keys.filter(k => it.comps[k].jenis === 'bahan'), ala = keys.filter(k => it.comps[k].jenis === 'alat');
    const nch = Math.max(1, Math.ceil(bah.length / 7), Math.ceil(ala.length / 2)); X.SWI[n] = [];
    for (let ci = 0; ci < nch; ci++) {
      const slot = {}; if (ci === 0) ten.forEach(k => { slot[k] = k === 'tenaga|tukang kayu' ? 'J' : tslot[it.comps[k].kode]; });
      bah.slice(ci * 7, ci * 7 + 7).forEach((k, j) => { slot[k] = SL.bahan[j]; }); ala.slice(ci * 2, ci * 2 + 2).forEach((k, j) => { slot[k] = SL.alat[j]; });
      const r0 = r; X.SWI[n].push(r0); const ttl = ci === 0 ? it.nm : `${it.nm} (lanjutan ${ci})`;
      put(w, 'A' + r0, ci === 0 ? n : '', { bold: true, fill: FILL.gry }); put(w, 'B' + r0, ttl, { bold: true, fill: FILL.gry, al: WRAP });
      put(w, 'C' + r0, ci === 0 ? `=ROUND(${it.vol},3)` : `=C${X.SWI[n][0]}`, { bold: true, fill: FILL.gry, fmt: '#,##0.000' }); put(w, 'D' + r0, it.sat, { bold: true, fill: FILL.gry });
      for (let c = 5; c <= 20; c++) put(w, COLS(c) + r0, null, { fill: FILL.gry });
      put(w, 'E' + r0, ci === 0 ? it.link : '(lanjutan)', Object.assign({ fill: FILL.gry, al: CEN }, ci === 0 && it.link.startsWith('=') ? LINK : { italic: true }));
      for (const [k, s] of Object.entries(slot)) put(w, s + r0, it.comps[k].disp, { bold: true, size: 8, fill: FILL.gry, al: CEN });
      ['Koefisien', 'Harga Satuan (Rp)', 'Jumlah Kebutuhan (Vol x Koef)', 'Dibulatkan (3 desimal)', 'Harga Total (Rp)', 'PPN', 'PPh 1,5%', 'PPh 2%'].forEach((lb, i) => put(w, 'B' + (r0 + 1 + i), lb, { italic: true }));
      for (const [k, s] of Object.entries(slot)) {
        put(w, s + (r0 + 1), it.coef(k), { fmt: '#,##0.0000' }); put(w, s + (r0 + 2), '=' + X.HP(k), { fmt: RP }); put(w, s + (r0 + 3), `=$C$${r0}*${s}${r0 + 1}`, { fmt: '#,##0.0000' }); put(w, s + (r0 + 4), `=ROUND(${s}${r0 + 3},3)`, { fmt: '#,##0.000' });
        put(w, s + (r0 + 5), `=${s}${r0 + 4}*${s}${r0 + 2}`, { fmt: RP }); ['J', 'K', 'L'].forEach((hc, j) => put(w, s + (r0 + 6 + j), `=${s}${r0 + 4}*${X.HX(k, hc)}`, { fmt: RP }));
        (X.need[k] = X.need[k] || []).push(`${q(SH.sw)}!${s}${r0 + 4}`);
      }
      for (const off of [5, 6, 7, 8]) put(w, TC + (r0 + off), `=SUM(F${r0 + off}:S${r0 + off})`, { bold: true, fmt: RP });
      tot.push(TC + (r0 + 5)); ppn.push(TC + (r0 + 6)); p15.push(TC + (r0 + 7)); p2.push(TC + (r0 + 8)); r = r0 + 9;
    }
  });
  const sm = a => '=' + a.join('+'); const pos = {};
  [['j', 'JUMLAH HARGA (tanpa pajak)', sm(tot)], ['ppn', 'PPN', sm(ppn)], ['p15', 'PPh 1,5% (kosong bila tidak ada)', sm(p15)], ['p2', 'PPh 2% (kosong bila tidak ada)', sm(p2)]].forEach(([k, lab, f]) => { put(w, 'B' + r, lab, { bold: true }); put(w, TC + r, f, { bold: true, fmt: RP }); pos[k] = r; r++; });
  put(w, 'B' + r, 'K3 (maks. persentase atau batas nominal)', { bold: true }); put(w, TC + r, `=MIN(${S.k3p}*SUM(${TC}${pos.j}:${TC}${r - 1}),${S.k3m})`, { bold: true, fmt: RP }); const a3 = r; r++;
  put(w, 'B' + r, 'JUMLAH BIAYA', { bold: true }); put(w, TC + r, `=SUM(${TC}${pos.j}:${TC}${a3})`, { bold: true, fmt: RP }); const a4 = r; r++;
  put(w, 'B' + r, 'DIBULATKAN (3 desimal)', { bold: true }); put(w, TC + r, `=ROUND(${TC}${a4},3)`, { bold: true, fmt: '#,##0.000' }); const a5 = r; r++;
  const tb2 = X.terbilang(18, `${q(SH.sw)}!$${TC}$${a5}`); put(w, 'B' + r, 'Terbilang', { bold: true }); w.mergeCells(`C${r}:${TC}${r}`); put(w, 'C' + r, `="# "&${tb2}&" #"`, { italic: true, al: WRAP });
  grid(w, t0, 1, r, 20, true); widths(w, [5, 40, 11, 8, 12].concat(Array(15).fill(14), [18])); w.views = [{ state: 'frozen', ySplit: t0, xSplit: 2 }]; setPrint(w, { printArea: `A1:${TC}${r}` });
  const sref = c => `${q(SH.sw)}!$${TC}$${c}`; X.SW = { j: sref(pos.j), ppn: sref(pos.ppn), pph15: sref(pos.p15), pph2: sref(pos.p2), k3: sref(a3), total: sref(a5) }; X.TC = TC;
}
// ---------- RAB ----------
function setupRAB(X) {
  const { ws, S, ITEMS, TC } = X; const w = ws.rab;
  title(w, 'RENCANA ANGGARAN BIAYA (RAB)', 'Harga satuan = AHSP + biaya umum dan keuntungan; pajak sesuai tanda di Harga Satuan. Kolom K-N = kolom bantuan (tidak dicetak).');
  const t0 = hdrBlock(X, w, 'H'); head(w, t0, ['No', 'Uraian Pekerjaan', 'Volume', 'Satuan', 'Harga Satuan AHSP + BUK (Rp)', 'PPN (Rp/sat)', 'PPh 1,5% (Rp/sat)', 'PPh 2% (Rp/sat)', 'Harga Satuan Termasuk Pajak (Rp)', 'Jumlah Harga Termasuk Pajak (Rp)', 'Jumlah PPN (Rp)', 'Jumlah PPh 1,5% (Rp)', 'Jumlah PPh 2% (Rp)', 'Kode AHSP']); w.getRow(t0).height = 44;
  let r = t0 + 1; const first = r;
  const row = (r, n, nm, vol, sat, e, f, g, h, code) => {
    put(w, 'A' + r, n); put(w, 'B' + r, nm, { al: WRAP }); put(w, 'C' + r, vol, { fmt: '#,##0.000' }); put(w, 'D' + r, sat); put(w, 'E' + r, e, { fmt: RP2 }); put(w, 'F' + r, f, { fmt: RP2 }); put(w, 'G' + r, g, { fmt: RP2 }); put(w, 'H' + r, h, { fmt: RP2 });
    put(w, 'I' + r, `=E${r}+F${r}+G${r}+H${r}`, { fmt: RP2 }); put(w, 'J' + r, `=C${r}*I${r}`, { fmt: RP2 }); put(w, 'K' + r, `=C${r}*F${r}`, { fmt: RP2 }); put(w, 'L' + r, `=C${r}*G${r}`, { fmt: RP2 }); put(w, 'M' + r, `=C${r}*H${r}`, { fmt: RP2 });
    put(w, 'N' + r, code, Object.assign({ al: CEN }, String(code).startsWith('=') ? LINK : {}));
  };
  row(r, 1, 'Pengukuran dan pembersihan lokasi', 1, 'ls', '=' + X.LS, 0, 0, 0, '-'); r++;
  ITEMS.forEach((it, idx) => {
    const n = idx + 2; const blocks = X.SWI[n]; const W = off => '(' + blocks.map(s => `${q(SH.sw)}!$${TC}$${s + off}`).join('+') + ')'; const buk = S.op; const pr = it.price;
    row(r, n, it.nm, `=${q(SH.sw)}!$C$${blocks[0]}`, it.sat, `=IF(C${r}=0,${pr.F},${W(5)}*(1+${buk})/C${r})`, `=IF(C${r}=0,${pr.ppn},${W(6)}/C${r})`, `=IF(C${r}=0,${pr.pph15},${W(7)}/C${r})`, `=IF(C${r}=0,${pr.pph2},${W(8)}/C${r})`, it.link); r++;
  });
  const last = r - 1; put(w, 'B' + r, 'JUMLAH HARGA (termasuk pajak)', { bold: true }); for (const c of 'JKLM') put(w, c + r, `=SUM(${c}${first}:${c}${last})`, { bold: true, fmt: RP2 }); const rj = r; r++;
  [['PPN (sudah termasuk dalam jumlah harga)', 'K'], ['PPh 1,5% (sudah termasuk; kosong bila tidak ada)', 'L'], ['PPh 2% (sudah termasuk; kosong bila tidak ada)', 'M']].forEach(([lb, c]) => { put(w, 'B' + r, lb, { italic: true }); put(w, 'J' + r, `=${c}${rj}`, { italic: true, fmt: RP2 }); r++; });
  put(w, 'B' + r, 'K3 (maks. persentase atau batas nominal)', { bold: true }); put(w, 'J' + r, `=MIN(${S.k3p}*J${rj},${S.k3m})`, { bold: true, fmt: RP2 }); const rk3 = r; r++;
  put(w, 'B' + r, 'JUMLAH BIAYA', { bold: true }); put(w, 'J' + r, `=J${rj}+J${rk3}`, { bold: true, fmt: RP2 }); const rjb = r; r++;
  put(w, 'B' + r, 'DIBULATKAN (3 desimal)', { bold: true }); put(w, 'J' + r, `=ROUND(J${rjb},3)`, { bold: true, fmt: '#,##0.000' }); const rdb = r; r++;
  const tb = X.terbilang(4, `RAB!$J$${rdb}`); put(w, 'B' + r, 'Terbilang', { bold: true }); w.mergeCells(`C${r}:J${r}`); put(w, 'C' + r, `="# "&${tb}&" #"`, { italic: true, al: WRAP }); const rend = r;
  grid(w, t0, 1, rend, 14, true); const nt = w.getCell('A' + (rend + 2)); nt.value = 'Catatan: jumlah harga bersumber dari RAB Swakelola (kuantitas dibulatkan 3 desimal) ditambah biaya umum dan keuntungan, sehingga RAB, RAB Swakelola, dan Rekap selalu sinkron.'; nt.font = font({ size: 9, italic: true, color: '555555' });
  widths(w, [5, 50, 11, 8, 17, 13, 13, 13, 18, 20, 16, 16, 16, 12]); w.views = [{ state: 'frozen', ySplit: t0, xSplit: 2 }]; setPrint(w, { printArea: `A1:J${rend + 2}` }); X.RABJ = `RAB!$J$${rdb}`;
}
// ---------- Rekap ----------
function setupRekap(X) {
  const { spec, ws, KEYS, need } = X; const w = ws.rk;
  title(w, 'REKAP KEBUTUHAN MATERIAL, TENAGA KERJA DAN PAJAK', 'Dihitung dari RAB Swakelola (kolom Dibulatkan 3 desimal). Total termasuk pajak sesuai tanda di Harga Satuan.');
  const t0 = hdrBlock(X, w, 'F'); let r = t0; const jml = [];
  for (const [jen, lab] of [['tenaga', 'A. TENAGA KERJA'], ['bahan', 'B. MATERIAL'], ['alat', 'C. ALAT']]) {
    put(w, 'A' + r, lab, { bold: true, fill: FILL.sub }); for (const c of 'BCDEFGHI') put(w, c + r, null, { fill: FILL.sub }); r++;
    head(w, r, ['No', 'Uraian', 'Satuan', 'Kebutuhan', 'Harga Satuan (Rp) (belum termasuk pajak)', 'PPN (Rp)', 'PPh 1,5% (Rp)', 'PPh 2% (Rp)', 'Jumlah Termasuk Pajak (Rp)']); w.getRow(r).height = 42; r++; const f0 = r; let i = 0;
    const ks = Object.keys(KEYS).filter(k => KEYS[k].jenis === jen).sort((a, b) => String(KEYS[a].kode || 'Z').localeCompare(String(KEYS[b].kode || 'Z')) || String(KEYS[a].disp).localeCompare(String(KEYS[b].disp)));
    for (const k of ks) { i++; const v = KEYS[k]; put(w, 'A' + r, i); put(w, 'B' + r, v.disp); put(w, 'C' + r, v.sat); put(w, 'D' + r, need[k] ? '=' + need[k].join('+') : 0, { fmt: '#,##0.000' }); put(w, 'E' + r, '=' + X.HP(k), { fmt: RP });
      ['J', 'K', 'L'].forEach((hc, j) => put(w, 'FGH'[j] + r, `=D${r}*${X.HX(k, hc)}`, { fmt: RP })); put(w, 'I' + r, `=D${r}*E${r}+F${r}+G${r}+H${r}`, { fmt: RP }); r++; }
    put(w, 'B' + r, 'Jumlah', { bold: true }); for (const c of 'FGHI') put(w, c + r, `=SUM(${c}${f0}:${c}${r - 1})`, { bold: true, fmt: RP }); jml.push('I' + r); r += 2;
  }
  put(w, 'A' + r, 'D. LAIN-LAIN', { bold: true, fill: FILL.sub }); for (const c of 'BCDEFGHI') put(w, c + r, null, { fill: FILL.sub }); r++;
  put(w, 'A' + r, 1); put(w, 'B' + r, 'Pengukuran dan pembersihan lokasi'); put(w, 'C' + r, 'ls'); put(w, 'D' + r, 1, { fmt: '#,##0.000' }); put(w, 'E' + r, '=' + X.LS, { fmt: RP }); for (const c of 'FGH') put(w, c + r, 0, { fmt: RP }); put(w, 'I' + r, `=D${r}*E${r}`, { fmt: RP }); jml.push('I' + r); r += 2;
  put(w, 'A' + r, 'E. PAJAK, K3, DAN TOTAL', { bold: true, fill: FILL.sub }); for (const c of 'BCDEFGHI') put(w, c + r, null, { fill: FILL.sub }); r++; const rk = r;
  put(w, 'B' + r, 'Jumlah harga (A+B+C+D, termasuk pajak)'); put(w, 'I' + r, '=' + jml.join('+'), { fmt: RP }); r++;
  [['PPN (sudah termasuk)', X.SW.ppn], ['PPh 1,5% (sudah termasuk; kosong bila tidak ada)', X.SW.pph15], ['PPh 2% (sudah termasuk; kosong bila tidak ada)', X.SW.pph2]].forEach(([lb, ref]) => { put(w, 'B' + r, lb); put(w, 'I' + r, '=' + ref, { fmt: RP }); r++; });
  put(w, 'B' + r, 'K3 (maks. persentase atau batas nominal)'); put(w, 'I' + r, `=MIN(${X.S.k3p}*I${rk},${X.S.k3m})`, { fmt: RP }); const rk3 = r; r++;
  put(w, 'B' + r, 'JUMLAH BIAYA', { bold: true }); put(w, 'I' + r, `=I${rk}+I${rk3}`, { bold: true, fmt: RP }); r++;
  put(w, 'B' + r, 'DIBULATKAN (3 desimal)', { bold: true }); put(w, 'I' + r, `=ROUND(I${r - 1},3)`, { bold: true, fmt: '#,##0.000' }); const rd = r; r++;
  put(w, 'B' + r, 'Cek: sama dengan RAB Swakelola dan RAB'); put(w, 'I' + r, `=IF(AND(ABS(I${rd}-${X.SW.total})<0.0005,ABS(I${rd}-${X.RABJ})<0.0005),"OK","BEDA (cek BUK)")`, { bold: true, al: CEN });
  grid(w, t0, 1, r, 9, true); widths(w, [5, 44, 9, 14, 20, 16, 16, 16, 22]); setPrint(w, { printArea: `A1:I${r}` });
}
module.exports = { setupAHSP, makeItems, setupTerbilang, setupSwakelola, setupRAB, setupRekap, LINK };
