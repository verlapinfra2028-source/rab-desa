'use strict';
const { build } = require('../src/engine.js'); const { makeImages, browserPng } = require('../src/images.js');
const SPECS = { drainase: require('../src/specs/drainase.js'), uditch: require('../src/specs/uditch.js'), paving: require('../src/specs/paving.js'), cor: require('../src/specs/cor.js'), tpt: require('../src/specs/tpt.js'), box: require('../src/specs/box.js'), jembatan: require('../src/specs/jembatan.js') };
const NAMA = { drainase: 'Drainase Pasangan Batu Kali', uditch: 'Drainase U-Ditch', paving: 'Jalan Paving', cor: 'Jalan Cor Beton', tpt: 'TPT / Plengsengan Batu Kali', box: 'Jembatan Box Culvert', jembatan: 'Jembatan Cor Beton' };
const FILE = { drainase: 'Drainase_Batu_Kali', uditch: 'Drainase_UDitch', paving: 'Jalan_Paving', cor: 'Jalan_Cor', tpt: 'TPT_Plengsengan', box: 'Jembatan_BoxCulvert', jembatan: 'Jembatan_CorBeton' };
const DATA = ['Pekerjaan', 'Sumber Dana', 'Pagu Anggaran (Rp)', 'Desa', 'Lokasi Kegiatan (Dusun, RT, RW)', 'Kecamatan', 'Kabupaten', 'Dibuat oleh (Pelaksana Kegiatan)', 'Diperiksa (Koordinator PTPKD)', 'Mengetahui (Kepala Desa)', 'Koordinat Awal (lintang, bujur)', 'Koordinat Akhir (lintang, bujur)'];
const $ = id => document.getElementById(id); let AHm = null, PAGES = null, LOGO = null;
const cc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function getSpec(kind) { const S = SPECS[kind]; if (typeof S === 'function') return S(AHm); return Object.assign({}, S, { inputs: S.inputs.map(i => Object.assign({}, i)) }); }
function optsOf(i) { if (i.opts) return i.opts; if (typeof i.list === 'string') return i.list.split(','); return null; }
function renderInputs(kind) {
  const spec = getSpec(kind); const saved = JSON.parse(localStorage.getItem('rab_' + kind) || '{}'); const box = $('formInput'); box.innerHTML = '';
  spec.inputs.forEach(i => {
    const wrap = document.createElement('div'); wrap.className = 'field'; const lab = document.createElement('label'); lab.textContent = i.label + (i.unit && i.unit !== '%' ? ' (' + i.unit + ')' : i.unit === '%' ? ' (angka desimal, 0,003 = 0,3%)' : ''); wrap.appendChild(lab);
    const o = optsOf(i); let el;
    if (o) { el = document.createElement('select'); o.forEach(t => { const op = document.createElement('option'); op.value = t; op.textContent = t; el.appendChild(op); }); el.value = String(saved[i.k] !== undefined ? saved[i.k] : i.v); }
    else { el = document.createElement('input'); el.type = 'text'; el.inputMode = 'decimal'; if (i.f) { el.placeholder = 'otomatis'; el.value = saved[i.k] || ''; } else el.value = saved[i.k] !== undefined ? saved[i.k] : i.v; }
    el.dataset.k = i.k; wrap.appendChild(el); if (i.note) { const p = document.createElement('p'); p.className = 'hint'; p.textContent = i.note; wrap.appendChild(p); } box.appendChild(wrap);
  });
}
function renderData(kind) {
  const saved = JSON.parse(localStorage.getItem('rab_data') || '{}'); const box = $('formData'); box.innerHTML = '';
  DATA.forEach((t, i) => { const w = document.createElement('div'); w.className = 'field' + (i === 0 || i === 1 ? ' full' : ''); const l = document.createElement('label'); l.textContent = t; const e = document.createElement('input'); e.type = 'text'; e.dataset.d = i; e.value = (i === 0 ? NAMA[kind] : saved[i] !== undefined ? saved[i] : (i === 1 ? 'Bantuan Keuangan Khusus APBD (isi tahun)' : i === 6 ? 'Gresik' : '')); if (i === 0 && saved[0] && saved.kind === kind) e.value = saved[0]; w.appendChild(l); w.appendChild(e); box.appendChild(w); });
}
function collect(kind) {
  const spec = getSpec(kind); const vals = {}; const save = {};
  document.querySelectorAll('#formInput [data-k]').forEach(el => { const k = el.dataset.k; const inp = spec.inputs.find(i => i.k === k); let v = el.value.trim(); save[k] = v; if (v === '') { if (inp.f) return; v = inp.v; } if (typeof inp.v === 'number' || (inp.f && !optsOf(inp))) { const num = parseFloat(String(v).replace(',', '.')); if (isNaN(num)) throw new Error('Isian "' + inp.label + '" harus berupa angka.'); v = num; } else if (optsOf(inp) && typeof inp.v === 'number') v = parseFloat(v); inp.v = v; delete inp.f; vals[k] = v; });
  const data = {}; document.querySelectorAll('#formData [data-d]').forEach(el => { data[el.dataset.d] = el.value; });
  localStorage.setItem('rab_' + kind, JSON.stringify(save)); localStorage.setItem('rab_data', JSON.stringify(Object.assign({}, data, { kind }))); return { spec, vals, data };
}
async function buat() {
  const kind = $('jenis').value; const st = $('status'); st.className = 'status'; st.textContent = 'Menyusun file Excel...'; $('btnBuat').disabled = true;
  try {
    await new Promise(r => setTimeout(r, 30)); const { spec, vals, data } = collect(kind);
    const images = makeImages(kind, spec, vals, cc, browserPng); const X = build(spec, { AH: AHm, pages: PAGES, logo: LOGO, test: false, images });
    const ws = X.ws.mdp; DATA.forEach((t, i) => { const cell = ws.getCell('B' + (4 + i)); const v = data[i]; if (v !== undefined && v !== '') cell.value = i === 2 ? (parseFloat(String(v).replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.')) || null) : v; });
    const buf = await X.wb.xlsx.writeBuffer(); const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'RAB_' + FILE[kind] + '.xlsx'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    st.textContent = 'Selesai. File RAB_' + FILE[kind] + '.xlsx sudah diunduh. Isi harga survey di sheet Harga Satuan.';
  } catch (e) { st.className = 'status err'; st.textContent = 'Gagal: ' + e.message; console.error(e); } finally { $('btnBuat').disabled = false; }
}
async function start() {
  if (typeof window !== 'undefined') { if (window.__started) return; window.__started = true; }
  const d = await (await fetch('data.json')).json(); AHm = d.ahsp; PAGES = d.pages; LOGO = d.logo;
  const sel = $('jenis'); Object.keys(NAMA).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = NAMA[k]; sel.appendChild(o); });
  const show = () => { const k = sel.value; renderData(k); renderInputs(k); $('jenisInfo').textContent = 'Isian di bawah mengikuti jenis pekerjaan yang dipilih.'; };
  sel.addEventListener('change', show); $('btnBuat').addEventListener('click', buat); show(); window.__ready = true;
}
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => { start().catch(e => { $('status').className = 'status err'; $('status').textContent = 'Gagal memuat data: ' + e.message; }); });
module.exports = { start };
