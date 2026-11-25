'use strict';
// Gambar parametris (Canvas 2D): jalan di Node (@napi-rs/canvas) dan di browser (canvas bawaan).
const C = { tanah: '#E8DCC8', sirtu: '#D9D2B6', pasir: '#F2E3A8', beton: '#CFCFCF', lk: '#BDBDBD', batu: '#B98E6A', pond: '#C9A98B', paving: '#C98B6B', merah: '#E53935', biru: '#1565C0', hijau: '#2E7D32', dim: '#1F4E78' };
const fmt = v => { let s = (+v).toFixed(3).replace(/0+$/, '').replace(/\.$/, ''); return s.replace('.', ','); };
class Scene {
  constructor(cc, W, H, title, b, ay = 1) {
    this.c = cc(W, H); this.g = this.c.getContext('2d'); this.W = W; this.H = H; const g = this.g; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#000'; g.font = 'bold 16px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, W / 2, 18);
    const mw = W - 40, mh = H - 60; const s = Math.min(mw / (b.x1 - b.x0), mh / ((b.y1 - b.y0) * ay)); this.sx = s; this.sy = s * ay; this.ox = (W - s * (b.x1 - b.x0)) / 2 - s * b.x0; this.oy = 40 + (mh - this.sy * (b.y1 - b.y0)) / 2 + this.sy * b.y1;
  }
  X(x) { return this.ox + x * this.sx; } Y(y) { return this.oy - y * this.sy; }
  hatch(kind, color) {
    const g = this.g; g.save(); g.clip(); g.strokeStyle = color || 'rgba(0,0,0,0.45)'; g.fillStyle = color || 'rgba(0,0,0,0.45)'; g.lineWidth = 0.7; const W = this.W, H = this.H;
    if (kind === '/' || kind === '\\' || kind === 'x') { for (let i = -H; i < W + H; i += 9) { if (kind !== '\\') { g.beginPath(); g.moveTo(i, H); g.lineTo(i + H, 0); g.stroke(); } if (kind !== '/') { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + H, H); g.stroke(); } } }
    else if (kind === '.' || kind === 'o') { for (let x = 0; x < W; x += 10) for (let y = 0; y < H; y += 10) { g.beginPath(); g.arc(x + ((y / 10) % 2) * 5, y, kind === 'o' ? 2.2 : 1, 0, 6.3); kind === 'o' ? g.stroke() : g.fill(); } }
    g.restore();
  }
  poly(pts, o = {}) { const g = this.g; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(this.X(x), this.Y(y)) : g.moveTo(this.X(x), this.Y(y))); g.closePath(); if (o.fill) { g.fillStyle = o.fill; g.fill(); } if (o.hatch) { this.g.save(); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(this.X(x), this.Y(y)) : g.moveTo(this.X(x), this.Y(y))); g.closePath(); this.hatch(o.hatch); g.restore(); } if (o.stroke !== false) { g.strokeStyle = o.stroke || '#333'; g.lineWidth = o.lw || 1.2; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(this.X(x), this.Y(y)) : g.moveTo(this.X(x), this.Y(y))); g.closePath(); g.stroke(); } }
  rect(x, y, w, h, o) { this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o); }
  line(x1, y1, x2, y2, o = {}) { const g = this.g; g.strokeStyle = o.color || '#333'; g.lineWidth = o.lw || 1; g.setLineDash(o.dash || []); g.beginPath(); g.moveTo(this.X(x1), this.Y(y1)); g.lineTo(this.X(x2), this.Y(y2)); g.stroke(); g.setLineDash([]); }
  text(x, y, s, o = {}) { const g = this.g; g.font = (o.bold ? 'bold ' : '') + (o.size || 12) + 'px sans-serif'; g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle'; const px = this.X(x), py = this.Y(y); if (o.bg !== false) { const w = g.measureText(s).width; g.fillStyle = 'rgba(255,255,255,0.85)'; const ax = o.align === 'left' ? px : o.align === 'right' ? px - w : px - w / 2; g.fillRect(ax - 2, py - (o.size || 12) / 2 - 1, w + 4, (o.size || 12) + 2); } g.fillStyle = o.color || '#000'; String(s).split('\n').forEach((ln, i) => g.fillText(ln, px, py + i * ((o.size || 12) + 2))); }
  arrow(px1, py1, px2, py2) { const g = this.g; g.strokeStyle = C.dim; g.fillStyle = C.dim; g.lineWidth = 1; g.beginPath(); g.moveTo(px1, py1); g.lineTo(px2, py2); g.stroke(); const a = Math.atan2(py2 - py1, px2 - px1); for (const [x, y, s] of [[px2, py2, 1], [px1, py1, -1]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x - s * 8 * Math.cos(a - 0.3), y - s * 8 * Math.sin(a - 0.3)); g.lineTo(x - s * 8 * Math.cos(a + 0.3), y - s * 8 * Math.sin(a + 0.3)); g.closePath(); g.fill(); } }
  dimH(x1, x2, y, label, o = {}) { this.arrow(this.X(x1), this.Y(y), this.X(x2), this.Y(y)); this.text((x1 + x2) / 2, y, label, { color: C.dim, size: o.size || 11, base: 'bottom' }); }
  dimV(x, y1, y2, label, o = {}) { this.arrow(this.X(x), this.Y(y1), this.X(x), this.Y(y2)); this.text(x, (y1 + y2) / 2, label, { color: C.dim, size: o.size || 11, align: o.left ? 'right' : 'left' }); }
  crop(cc, pad = 12) { const W = this.W, H = this.H, g = this.g; const d = g.getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (d[i] < 250 || d[i + 1] < 250 || d[i + 2] < 250) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad); const w = x1 - x0 + 1, h = y1 - y0 + 1; const c2 = cc(w, h), g2 = c2.getContext('2d'); g2.fillStyle = '#fff'; g2.fillRect(0, 0, w, h); g2.drawImage(this.c, x0, y0, w, h, 0, 0, w, h); return { c: c2, W: w, H: h }; }
  png() { return this.c.toBuffer ? this.c.toBuffer('image/png') : null; }
}
module.exports = { Scene, C, fmt };
