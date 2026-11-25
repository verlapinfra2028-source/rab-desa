'use strict';
const U = require('./util.js'); const { put, font, FILL, COLS, WRAP, CEN, grid, widths, setPrint, thin, med } = U;
const { SH, q } = require('./core.js');
const LEM = 44;
function setup(X) {
  const { spec, ws } = X; const w = ws.gb; w.views = [{ showGridLines: false }];
  for (let c = 1; c <= 12; c++) w.getColumn(c).width = 15; for (let c = 13; c <= 16; c++) w.getColumn(c).width = 13;
  const M = q(SH.mdp); const img = X.opts.images || {};
  const names = [['B11', 'Dibuat Oleh :', 'Tim Pelaksana Teknis Kegiatan'], ['B12', 'Diperiksa Oleh :', 'Koordinator PTPKD'], ['B13', 'Mengetahui,', 'KEPALA DESA']];
  const addImg = (im, col0, row0, maxW, maxH) => { if (!im) return; const id = X.wb.addImage(im.base64 ? { base64: im.base64, extension: 'png' } : { buffer: im.buffer, extension: 'png' }); const s = Math.min(maxW / im.width, maxH / im.height, 1.6); w.addImage(id, { tl: { col: col0, row: row0 }, ext: { width: Math.round(im.width * s), height: Math.round(im.height * s) } }); };
  const kop = (r1, lembar, juduls) => {
    for (let r = r1; r < r1 + LEM; r++) w.getRow(r).height = 15;
    w.mergeCells(`B${r1 + 1}:K${r1 + 1}`); put(w, 'B' + (r1 + 1), `="${spec.gbLabel} : "&FIXED(${X.rep('{' + spec.gbLenKey + '}')},3,TRUE)&" m"`, { bold: true, border: false });
    const rows = [['PROPINSI', 'JAWA TIMUR', 1], ['KABUPATEN', `=UPPER(${M}!B10)`, 1], ['KECAMATAN', `=UPPER(${M}!B9)`, 1], ['DESA', `=UPPER(${M}!B7)`, 1], ['PEKERJAAN', `=UPPER(${M}!B4)`, 2], ['LOKASI', `=UPPER(${M}!B8)`, 2]];
    let y = r1 + 5; const ends = [r1 + 4];
    for (const [lab, val, h] of rows) {
      w.mergeCells(`M${y}:P${y}`); put(w, 'M' + y, lab, { bold: true, size: 9, border: false, al: { horizontal: 'center', vertical: 'middle' } }); y++;
      w.mergeCells(`M${y}:P${y + h - 1}`); put(w, 'M' + y, val, { border: false, al: { horizontal: 'center', vertical: 'middle', wrapText: true } }); y += h; ends.push(y - 1);
    }
    w.mergeCells(`M${y}:P${y}`); put(w, 'M' + y, 'JUDUL GAMBAR', { bold: true, size: 9, border: false, al: { horizontal: 'center' } }); y++;
    for (const j of juduls) { w.mergeCells(`M${y}:P${y}`); put(w, 'M' + y, j, { bold: true, border: false, al: { horizontal: 'center' } }); y++; }
    ends.push(y); y = Math.max(y + 1, r1 + 26);
    for (const [cell, t1, t2] of names) {
      w.mergeCells(`M${y}:P${y}`); put(w, 'M' + y, t1, { size: 9, border: false, al: { horizontal: 'center' } }); y++;
      w.mergeCells(`M${y}:P${y}`); put(w, 'M' + y, t2, { bold: true, size: 9, border: false, al: { horizontal: 'center' } }); y += 3;
      w.mergeCells(`M${y}:P${y}`); put(w, 'M' + y, `=IF(${M}!${cell}="","(............................)",${M}!${cell})`, { bold: true, underline: true, border: false, al: { horizontal: 'center' } }); ends.push(y); y++;
    }
    w.mergeCells(`M${r1 + LEM - 1}:P${r1 + LEM - 1}`); put(w, 'M' + (r1 + LEM - 1), `Lembar Ke ${lembar} Dari 2`, { bold: true, border: false, al: { horizontal: 'center' } });
    for (let r = r1; r < r1 + LEM; r++) for (let c = 1; c <= 16; c++) { const cell = w.getCell(r, c); const e = c >= 13 && ends.includes(r); cell.border = { left: c === 1 || c === 13 ? med : undefined, right: c === 16 ? med : undefined, top: r === r1 ? med : undefined, bottom: r === r1 + LEM - 1 ? med : (e ? thin : undefined) }; }
    if (lembar === 1 && X.opts.logo) { const id = X.wb.addImage(typeof X.opts.logo === 'string' ? { base64: X.opts.logo, extension: 'jpeg' } : { buffer: X.opts.logo, extension: 'jpeg' }); w.addImage(id, { tl: { col: 13.6, row: r1 }, ext: { width: 62, height: 59 } }); }
    if (lembar === 2 && X.opts.logo) { const id = X.wb.addImage(typeof X.opts.logo === 'string' ? { base64: X.opts.logo, extension: 'jpeg' } : { buffer: X.opts.logo, extension: 'jpeg' }); w.addImage(id, { tl: { col: 13.6, row: r1 + LEM }, ext: { width: 62, height: 59 } }); }
  };
  const box = (rTop, c1, c2, rBot, titleText, im) => {
    w.mergeCells(`${COLS(c1)}${rTop}:${COLS(c2)}${rTop}`); put(w, COLS(c1) + rTop, titleText, { bold: true, size: 9, fill: FILL.gry, al: { horizontal: 'left', vertical: 'middle' } });
    for (let r = rTop; r <= rBot; r++) for (let c = c1; c <= c2; c++) { const cell = w.getCell(r, c); cell.border = { left: c === c1 ? thin : undefined, right: c === c2 ? thin : undefined, top: r === rTop ? thin : undefined, bottom: r === rBot ? thin : undefined }; }
    addImg(im, c1 - 1 + 0.15, rTop, (c2 - c1 + 1) * 110 - 24, (rBot - rTop) * 20 - 16);
  };
  kop(1, 1, ['TAMPAK ATAS', 'POTONGAN MEMANJANG', 'POTONGAN MELINTANG', 'DETAIL']);
  box(3, 1, 6, 22, '1. TAMPAK ATAS (DENAH)', img.tampak); box(3, 7, 12, 22, '2. POTONGAN MEMANJANG', img.memanjang);
  box(24, 1, 6, 43, '3. POTONGAN MELINTANG', img.melintang); box(24, 7, 12, 43, '4. ' + (spec.detailTitle || 'DETAIL'), img.detail);
  const r2 = 1 + LEM; kop(r2, 2, ['PETA LOKASI']);
  w.mergeCells(`A${r2 + 2}:L${r2 + 41}`); put(w, 'A' + (r2 + 2), `="PETA LOKASI (citra satelit)"&CHAR(10)&"Koordinat awal : "&${M}!B14&CHAR(10)&"Koordinat akhir : "&${M}!B15&CHAR(10)&"Garis merah = jalur pekerjaan dari titik awal ke titik akhir. Tempel tangkapan layar peta di sini (aplikasi web membuatnya otomatis)."`, { color: '555555', border: false, al: { horizontal: 'center', vertical: 'middle', wrapText: true } });
  for (let r = r2 + 2; r <= r2 + 41; r++) for (let c = 1; c <= 12; c++) w.getCell(r, c).border = { left: c === 1 ? thin : undefined, right: c === 12 ? thin : undefined, top: r === r2 + 2 ? thin : undefined, bottom: r === r2 + 41 ? thin : undefined };
  if (img.peta) addImg(img.peta, 0.1, r2 + 2, 1300, 780);
  setPrint(w, { paperSize: 8, printArea: `A1:P${2 * LEM}`, fitToHeight: 0 }); w.getRow(LEM).addPageBreak();
}
module.exports = { setup, LEM };
