'use strict';
// Membuat gambar untuk sheet Gambar dan Backup Volume. cc = fungsi pembuat canvas (Node atau browser).
const R = require('./drawings3.js');
function nodePng(S, cc) { const k = S.crop(cc); return { buffer: k.c.toBuffer('image/png'), width: k.W, height: k.H }; }
function browserPng(S, cc) { const k = S.crop(cc); return { base64: k.c.toDataURL('image/png').split(',')[1], width: k.W, height: k.H }; }
function makeImages(kind, spec, values, cc, toImg) {
  const d = {}, N = {}; spec.inputs.forEach(i => { d[i.k] = values && values[i.k] !== undefined && values[i.k] !== '' ? values[i.k] : i.v; N[i.k] = i.n; });
  const set = R[kind]; const ver = (v, lb) => set[v] ? toImg(set[v](cc, d, N, lb), cc) : null; const out = { tampak: ver('denah', false), memanjang: ver('memanjang', false), melintang: ver('melintang', false), detail: ver('detail', false) };
  out.notasi = [ver('melintang', true), ver('memanjang', true), ver('denah', true)].filter(Boolean); return out;
}
module.exports = { makeImages, nodePng, browserPng };
