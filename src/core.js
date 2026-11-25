'use strict';
const ExcelJS = require('exceljs');
const U = require('./util.js'); const { put, font, FILL, RP, RP2, KO, V3, COLS, COLN, WRAP, CEN, head, title, grid, gridA, merge, widths, setPrint, dvList, condFmt, RED, AMB } = U;
const SH = { cov: 'Sampul', mdp: 'Master Data Pekerjaan', mka: 'Master Koefisien AHSP', hs: 'Harga Satuan', ah: 'AHSP', rab: 'RAB', sw: 'RAB Swakelola', bv: 'Backup Volume', gb: 'Gambar', rk: 'Rekap Kebutuhan', tb: 'Terbilang' };
const q = n => "'" + n + "'";
const BJ0 = { 'pasir beton': 1400, 'kerikil': 1450, 'agregat kasar': 1450 };
const bjOf = name => { const n = name.replace(/\s+/g, ' ').trim().toLowerCase(); for (const k of Object.keys(BJ0)) if (n.startsWith(k)) return BJ0[k]; return null; };

function norm(jenis, name, spec) {
  let n = name.replace(/\s+/g, ' ').trim().replace(/\s*\*\)\s*$/, ''); const low = n.toLowerCase();
  if (jenis === 'tenaga') {
    if (low.includes('kepala tukang')) n = 'Kepala Tukang'; else if (low.startsWith('tukang') && low.includes('besi')) n = 'Tukang besi/besi beton'; else if (low === 'tukang') n = 'Tukang batu/tembok';
  } else {
    if (low.startsWith('molen')) n = 'Molen/Beton Mixer 0,35 m3 (+ feeder)'; if (low === 'pasir uruk') n = 'Pasir urug';
    for (const [re, to] of (spec.rename || [])) if (re.test(n)) { n = to; break; }
  }
  return { key: jenis + '|' + n.toLowerCase(), disp: n, jenis };
}
const satFinal = c => c.satuan === 'OJ' ? 'OH' : (c.satuan === 'kg' && bjOf(c.uraian) ? 'm3' : c.satuan);

function init(spec, opts) {
  const wb = new ExcelJS.Workbook(); wb.creator = 'RAB Desa'; const ws = {};
  for (const k of Object.keys(SH)) ws[k] = wb.addWorksheet(SH[k]);
  const AH = Object.create(opts.AH); if (spec.extraAH) Object.assign(AH, spec.extraAH);
  return { wb, ws, AH, spec, opts, S: {}, T: {}, CELL: {}, VF: {}, hrow: {}, KEYS: {}, mrow: {}, arow: {}, test: !!opts.test };
}

function setupMDP(X) {
  const { ws, spec } = X; const w = ws.mdp;
  title(w, 'MASTER DATA PEKERJAAN', 'Isi data di sel KUNING. Data ini tampil otomatis di Sampul, RAB, RAB Swakelola, Backup Volume, Gambar, dan Rekap.');
  const info = [['Pekerjaan', spec.pekerjaan, null], ['Sumber Dana', 'Bantuan Keuangan Khusus APBD (isi tahun)', null], ['Pagu Anggaran (Rp)', null, '#,##0'], ['Desa', '', null], ['Lokasi Kegiatan (Dusun, RT, RW)', '', null],
    ['Kecamatan', '', null], ['Kabupaten', 'Gresik', null], ['Dibuat oleh (Pelaksana Kegiatan)', '', null], ['Diperiksa (Koordinator PTPKD)', '', null], ['Mengetahui (Kepala Desa)', '', null],
    ['Koordinat Awal (lintang, bujur)', '', null], ['Koordinat Akhir (lintang, bujur)', '', null]];
  info.forEach(([k, v, fm], i) => { put(w, 'A' + (4 + i), k, { bold: true }); put(w, 'B' + (4 + i), v, { color: '0000FF', fill: FILL.yel, fmt: fm, al: { horizontal: 'left' } }); });
  put(w, 'C14', 'Contoh: -7.1650, 112.6500 (dipakai untuk gambar peta lokasi di sheet Gambar)', { size: 9, color: '555555', border: false });
  X.HB = info.slice(0, 7).map(([k, v, fm], i) => ({ lab: k, row: 4 + i, fm }));
  const r0 = 18; ['PENGATURAN', 'Nilai', 'Keterangan'].forEach((t, i) => put(w, U.COLS(1 + i) + (r0 - 1), t, { bold: true, color: 'FFFFFF', fill: FILL.hdr }));
  const set = [['jam', 'Jam kerja per 1 OH', 7, '0', 'Dipakai mengubah koefisien OJ (orang-jam) menjadi OH. Isi 7 atau 8 sesuai ketentuan Dinas.'], ['ppn', 'Tarif PPN', 0.11, '0.0%', 'Dapat diubah. Komponen kena PPN diatur di sheet Harga Satuan kolom "Kena PPN".'],
    ['pph15', 'Tarif PPh 1,5%', 0.015, '0.0%', 'Komponen kena PPh diatur di sheet Harga Satuan. Bila Tidak, nilainya 0.'], ['pph2', 'Tarif PPh 2%', 0.02, '0.0%', 'Sama seperti PPh 1,5%.'],
    ['op', 'Biaya Umum dan Keuntungan (RAB non-swakelola)', 0.0, '0.0%', 'Bawaan 0% agar RAB, RAB Swakelola, dan Rekap bernilai sama. SE 47/2026: 10%-15% bila dipakai.'],
    ['k3p', 'K3: persentase', 0.06, '0.0%', 'K3 = nilai terkecil antara persentase x jumlah harga dan batas nominal.'], ['k3m', 'K3: batas nominal (Rp)', 5000000, RP, 'Maksimal nominal K3.'],
    ['spek', 'Profil spesifikasi', 'BKK Kab. Gresik', '@', 'Pemeriksaan kesesuaian di sheet Backup Volume mengikuti profil ini.']];
  set.forEach(([key, lab, val, fmt, ket], i) => { const r = r0 + i; put(w, 'A' + r, lab); put(w, 'B' + r, val, { color: '0000FF', fill: FILL.yel, fmt }); put(w, 'C' + r, ket, { size: 9, color: '555555', al: WRAP }); X.S[key] = q(SH.mdp) + '!$B$' + r; });
  const leg = r0 + set.length + 1;
  ['PETUNJUK SINGKAT', '1. Sheet "Harga Satuan": isi kolom Harga Survey (kuning) untuk semua tenaga, bahan, dan alat.', '2. Sheet "Backup Volume": isi/ubah ukuran dan pilihan (kuning). Volume tampil lengkap dengan rumus dan angkanya.',
    '3. Sheet AHSP, RAB, RAB Swakelola, dan Rekap terisi otomatis. Jangan diketik ulang.', '4. Pembulatan: Backup Volume tanpa pembulatan (kecuali jumlah buah yang dibulatkan ke atas); RAB, RAB Swakelola, dan Rekap memakai 3 desimal yang sama.',
    '5. Sheet Gambar dibuat oleh aplikasi dari ukuran yang diisi. Bila ukuran diubah langsung di Excel, gambar tidak ikut berubah.', '6. Koefisien dari SE DJBK No. 47/SE/Dk/2026 (Lampiran VI Cipta Karya); kode analisa dan halaman PDF tercantum di sheet Master Koefisien AHSP.']
    .forEach((t, i) => { const c = w.getCell('A' + (leg + i)); c.value = t; c.font = font({ bold: i === 0 }); });
  widths(w, [46, 42, 80]);
}
function hdrBlock(X, w, lastCol, first = 3) {
  X.HB.forEach((h, i) => {
    const r = first + i; w.mergeCells(`A${r}:B${r}`); w.mergeCells(`C${r}:${lastCol}${r}`);
    const a = w.getCell('A' + r); a.value = h.lab; a.font = font({ bold: true });
    const v = w.getCell('C' + r); v.value = { formula: `IF(${q(SH.mdp)}!B${h.row}="","",${q(SH.mdp)}!B${h.row})` }; v.font = font(); v.alignment = { horizontal: 'left' }; if (h.fm) v.numFmt = '"Rp "#,##0';
  });
  return first + X.HB.length + 1;
}
function setupCover(X) {
  const w = X.ws.cov; w.views = [{ showGridLines: false }]; for (let i = 1; i <= 8; i++) w.getColumn(i).width = 11.5; for (let r = 1; r <= 50; r++) w.getRow(r).height = 20;
  const cov = (r1, r2, val, size, o = {}) => { w.mergeCells(`A${r1}:H${r2}`); const c = w.getCell('A' + r1); c.value = typeof val === 'string' && val.startsWith('=') ? { formula: val.slice(1) } : val; c.font = font({ size, bold: o.bold !== false, color: o.color }); c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; if (o.fmt) c.numFmt = o.fmt; if (o.h) for (let r = r1; r <= r2; r++) w.getRow(r).height = o.h; };
  const M = q(SH.mdp);
  cov(3, 5, 'RAB (RENCANA ANGGARAN BIAYA) DAN GAMBAR', 22, { h: 24 }); cov(7, 8, `=UPPER(${M}!B5)`, 14, { h: 20 });
  let y = 25;
  [['PEKERJAAN', 4, null], ['PAGU ANGGARAN', 6, '"Rp "#,##0'], ['DESA', 7, null], ['LOKASI KEGIATAN', 8, null], ['KECAMATAN', 9, null], ['KABUPATEN', 10, null]].forEach(([lab, row, fmt]) => {
    cov(y, y, lab, 9, { bold: false, color: '666666' }); cov(y + 1, y + 1, fmt ? `=IF(${M}!B${row}="","",${M}!B${row})` : `=IF(${M}!B${row}="","",UPPER(${M}!B${row}))`, 14, { fmt }); y += 3;
  });
  w.getRow(26).height = 34;
  if (X.opts.logo) { const id = X.wb.addImage(typeof X.opts.logo === 'string' ? { base64: X.opts.logo, extension: 'jpeg' } : { buffer: X.opts.logo, extension: 'jpeg' }); w.addImage(id, { tl: { col: 3.0, row: 10 }, ext: { width: 150, height: 142 } }); }
  for (let r = 1; r <= 48; r++) for (let c = 1; c <= 8; c++) w.getCell(r, c).border = { left: c === 1 ? U.med : undefined, right: c === 8 ? U.med : undefined, top: r === 1 ? U.med : undefined, bottom: r === 48 ? U.med : undefined };
  setPrint(w, { orientation: 'portrait', fitToHeight: 1, printArea: 'A1:H48' }); w.pageSetup.horizontalCentered = true;
}
// ---------- Master Koefisien AHSP ----------
function setupMaster(X) {
  const { spec, AH, ws, S } = X; const w = ws.mka;
  title(w, 'MASTER KOEFISIEN AHSP', 'Sumber: SE Dirjen Bina Konstruksi No. 47/SE/Dk/2026 Lampiran VI (Cipta Karya). OJ otomatis menjadi OH; kg menjadi m3 untuk pasir beton, kerikil, agregat kasar (berat jenis kolom L). Baris ANALISA TURUNAN = bukan dari SE.');
  head(w, 4, ['Kode AHSP', 'Uraian Pekerjaan', 'Satuan', 'Sumber / Referensi', 'Jenis', 'Kode Komponen', 'Uraian Komponen', 'Satuan Asli', 'Koefisien Asli', 'Koefisien Dipakai', 'Satuan Dipakai', 'Berat Jenis (kg/m3)', 'Hal. PDF Lampiran VI', 'Sudah dicek']);
  let r = 5;
  for (const code of spec.codes) {
    const a = AH[code]; const judul = a.judul.replace(/\s*\(Lihat[^)]*\)?\s*$/, '').trim(); const refm = a.judul.match(/\((Lihat[^)]*)\)/); const ref = refm ? refm[1] : '';
    const der = (spec.derived || {})[code]; const base = code.split('-')[0]; const pg = (X.opts.pages || {})[base] || '';
    const src = der || ('SE DJBK 47/SE/Dk/2026 Lamp. VI CK, Analisa ' + code + (ref ? '; ' + ref : ''));
    a.komponen.forEach((c, i) => {
      const nm = norm(c.jenis, c.uraian, spec); const bjv = c.satuan === 'kg' ? bjOf(c.uraian) : null; const unit = (spec.unitCode || {})[code] || (code === '1.1.4.2' ? "m'" : 'm3');
      put(w, 'A' + r, code, der ? { bold: true, color: 'C00000' } : {}); put(w, 'B' + r, judul, { al: WRAP }); put(w, 'C' + r, unit); put(w, 'D' + r, src, { size: 9, al: WRAP });
      put(w, 'E' + r, { tenaga: 'Tenaga', bahan: 'Bahan', alat: 'Alat' }[c.jenis]); put(w, 'F' + r, c.kode || ''); put(w, 'G' + r, nm.disp); put(w, 'H' + r, c.satuan); put(w, 'I' + r, c.koef, { color: '0000FF', fmt: '#,##0.0000' });
      put(w, 'L' + r, bjv, { color: '0000FF', fill: bjv ? FILL.yel : undefined, fmt: '#,##0' });
      put(w, 'J' + r, `=IF(H${r}="OJ",I${r}/${S.jam},IF(L${r}<>"",I${r}/L${r},I${r}))`, { fmt: '#,##0.0000' }); put(w, 'K' + r, `=IF(H${r}="OJ","OH",IF(L${r}<>"","m3",H${r}))`);
      put(w, 'M' + r, pg, { al: { horizontal: 'center' } }); put(w, 'N' + r, 'Belum', { color: '0000FF', fill: FILL.yel, al: { horizontal: 'center' } }); dvList(w, 'N' + r, 'Sudah,Belum');
      X.mrow[code + '|' + i] = r; r++;
    });
  }
  grid(w, 4, 1, r - 1, 14, true); X.mkaNext = r;
  widths(w, [14, 55, 8, 48, 9, 12, 38, 10, 13, 13, 12, 14, 12, 12]);
  // tabel tambahan dari spesifikasi
  for (const t of (spec.tables || [])) {
    r += 2; const c = w.getCell('A' + r); c.value = t.title; c.font = font({ bold: true, size: 11 }); r++;
    head(w, r, t.headers); w.getRow(r).height = 42; r++; const r1 = r;
    t.rows.forEach(row => { row.forEach((v, j) => put(w, COLS(1 + j) + r, v, { color: t.blue && t.blue.includes(j) ? '0000FF' : '000000', fmt: t.blue && t.blue.includes(j) && typeof v === 'number' ? '#,##0.0000' : undefined, al: j === 1 && t.wrapB ? WRAP : undefined })); r++; });
    grid(w, r1 - 1, 1, r - 1, t.headers.length, true);
    X.T[t.id] = { r1, r2: r - 1, ref: col => q(SH.mka) + '!$' + col + '$' + r1 + ':$' + col + '$' + (r - 1) };
    if (t.widths) widths(w, t.widths);
  }
  w.views = [{ state: 'frozen', ySplit: 4 }]; setPrint(w);
}
module.exports = { SH, q, bjOf, norm, satFinal, init, setupMDP, hdrBlock, setupCover, setupMaster };
