'use strict';
const COLS = n => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
const COLN = s => s.split('').reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0);
const argb = h => 'FF' + h.toUpperCase();
const thin = { style: 'thin', color: { argb: argb('999999') } };
const med = { style: 'medium', color: { argb: argb('000000') } };
const BOX = { top: thin, left: thin, bottom: thin, right: thin };
const FILL = { yel: 'FFFF99', hdr: '1F4E78', sub: 'DDEBF7', gry: 'F2F2F2', grn: 'E2EFDA' };
const RP = '#,##0;(#,##0);-', RP2 = '#,##0.00;(#,##0.00);-', KO = '#,##0.0000', V3 = '#,##0.000';
const font = (o = {}) => ({ name: 'Arial', size: o.size || 10, bold: !!o.bold, italic: !!o.italic, color: { argb: argb(o.color || '000000') }, underline: o.underline ? 'single' : undefined });
const fillOf = h => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: argb(h) } });
// tulis nilai/formula + gaya ke sel
function put(ws, addr, v, o = {}) {
  const c = ws.getCell(addr);
  if (typeof v === 'string' && v.startsWith('=')) c.value = { formula: v.slice(1) }; else if (v !== undefined && v !== null && v !== '') c.value = v;
  c.font = font(o);
  if (o.fill) c.fill = fillOf(o.fill);
  if (o.fmt) c.numFmt = o.fmt;
  if (o.al) c.alignment = o.al; 
  if (o.border !== false) c.border = BOX;
  return c;
}
const WRAP = { wrapText: true, vertical: 'middle' }, CEN = { horizontal: 'center', vertical: 'middle', wrapText: true };
function head(ws, row, labels, col0 = 1) { labels.forEach((t, i) => put(ws, COLS(col0 + i) + row, t, { bold: true, color: 'FFFFFF', fill: FILL.hdr, al: CEN })); }
function title(ws, text, sub) { const a = ws.getCell('A1'); a.value = text; a.font = font({ bold: true, size: 14 }); if (sub) { const b = ws.getCell('A2'); b.value = sub; b.font = font({ italic: true, color: '555555' }); } }
// border tipis semua sel dalam rentang, outline tebal opsional
function grid(ws, r1, c1, r2, c2, outline) {
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) {
    const cell = ws.getCell(r, c);
    cell.border = { left: outline && c === c1 ? med : thin, right: outline && c === c2 ? med : thin, top: outline && r === r1 ? med : thin, bottom: outline && r === r2 ? med : thin };
  }
}
function gridA(ws, rng, outline) { const m = rng.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/); grid(ws, +m[2], COLN(m[1]), +m[4], COLN(m[3]), outline); }
function merge(ws, rng) { ws.mergeCells(rng); }
function widths(ws, arr, start = 1) { arr.forEach((w, i) => { ws.getColumn(start + i).width = w; }); }
function setPrint(ws, o = {}) { ws.pageSetup = Object.assign({ paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }, o); }
function dvList(ws, addr, opts) { ws.getCell(addr).dataValidation = { type: 'list', allowBlank: false, formulae: [opts.startsWith("'") || opts.startsWith('$') ? opts : '"' + opts + '"'] }; }
function condFmt(ws, ref, formula, style) { ws.addConditionalFormatting({ ref, rules: [{ type: 'expression', formulae: [formula], style }] }); }
const RED = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFF9999' } }, font: { bold: true, color: { argb: 'FF9C0006' } } };
const AMB = { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFE699' } }, font: { bold: true, color: { argb: 'FF7F6000' } } };
module.exports = { COLS, COLN, argb, thin, med, BOX, FILL, RP, RP2, KO, V3, font, fillOf, put, WRAP, CEN, head, title, grid, gridA, merge, widths, setPrint, dvList, condFmt, RED, AMB };
