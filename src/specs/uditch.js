'use strict';
const { norm } = require('../core.js');
module.exports = AH => {
  const rows = [], trows = [];
  for (let i = 1; i <= 27; i++) { const x = AH['8.1.1.' + i]; const sz = x.judul.match(/U-Ditch (\d+x\d+)x120/)[1]; const [w_, h_] = sz.split('x'); const ten = x.komponen.filter(c => c.jenis === 'tenaga');
    const lk = x.komponen.find(c => /^lantai kerja/i.test(c.uraian)).koef, ps = x.komponen.find(c => /pasir/i.test(c.uraian)).koef, ud = x.komponen.find(c => /^u-ditch/i.test(c.uraian)).koef, cr = x.komponen.find(c => c.jenis === 'alat').koef;
    rows.push(['8.1.1.' + i, '8.1.2.' + i, sz, +w_, +h_, ten[0].koef, ten[1].koef, ten[2].koef, ten[0].satuan, lk, ps, ud, cr]); }
  for (let i = 1; i <= 10; i++) { const x = AH['8.1.3.' + i]; const m = x.judul.match(/\(tipe (LD|HD)\) untuk (\d+x\d+)x120/); const ten = x.komponen.filter(c => c.jenis === 'tenaga'); const tp = x.komponen.find(c => /^tutup/i.test(c.uraian)).koef; const ex = (x.komponen.find(c => c.jenis === 'alat') || { koef: 0 }).koef;
    trows.push(['8.1.3.' + i, x.judul.replace(/\s*\(Lihat[^)]*\)?\s*$/, '').trim(), m[2], m[1], m[2] + '-' + m[1], ten[0].koef, ten[1].koef, ten[2].koef, ten[0].satuan, tp, ex]); }
  const crane = AH['8.1.1.4'].komponen.find(c => c.jenis === 'alat').uraian, exc = AH['8.1.3.8'].komponen.find(c => c.jenis === 'alat').uraian;
  const K_CR = norm('alat', crane, {}).key, K_EX = norm('alat', exc, {}).key;
  const dtn = '{tutup}="Ya"';
  return {
    kind: 'uditch', pekerjaan: 'Drainase U-Ditch', bvTitle: 'BACKUP VOLUME - DRAINASE U-DITCH', gbLabel: 'PANJANG DRAINASE', gbLenKey: 'L', detailTitle: 'DETAIL SAMBUNGAN U-DITCH',
    codes: ['1.3.1.2', '2.2.1.4.1', '2.2.1.4.2', '2.2.1.5.1', '1.1.4.2', '1.2.1.1.1', '1.2.1.1.2', '1.2.1.1.4', '1.2.1.1.5', '1.2.1.1.6', '1.2.1.1.7', '1.3.2.2'], unitCode: { '1.1.4.2': "m'" },
    ppnDefault: ['semen', 'kaso', 'kayu papan', 'paku', 'u-ditch', 'tutup'],
    tables: [{ id: 'UD', title: "TABEL KOEFISIEN SALURAN U-DITCH (per 1 m', Lampiran VI Divisi 8.1.1 f'c 10 MPa dan 8.1.2 f'c 7,5 MPa)", headers: ['Kode (lantai kerja 10 MPa)', 'Kode (lantai kerja 7,5 MPa)', 'Ukuran (cm)', 'Lebar dalam (cm)', 'Tinggi dalam (cm)', 'Pekerja', 'Tukang batu/tembok', 'Mandor', 'Satuan tenaga', "Lantai kerja (m3/m')", "Urukan pasir (m3/m')", "U-Ditch (buah/m')", "Crane truck 3 ton (jam/m')"], rows, blue: [5, 6, 7, 9, 10, 11, 12] },
      { id: 'TT', title: "TABEL KOEFISIEN TUTUP U-DITCH (per 1 m', Lampiran VI Divisi 8.1.3)", headers: ['Kode', 'Uraian', 'Ukuran U-Ditch (cm)', 'Tipe', 'Kunci', 'Pekerja', 'Tukang batu/tembok', 'Mandor', 'Satuan tenaga', "Tutup (buah/m')", "Excavator (jam/m')"], rows: trows, blue: [5, 6, 7, 9, 10], wrapB: true }],
    extraKeys: [{ key: 'bahan|u-ditch terpilih', jenis: 'bahan', disp: X => `="U-Ditch "&${X.rep('{uk}')}&"x120 cm"`, sat: 'buah', note: 'Harga per buah untuk ukuran yang dipilih di Backup Volume.' },
      { key: 'bahan|tutup u-ditch terpilih', jenis: 'bahan', disp: X => `="Tutup U-Ditch "&${X.rep('{uk}')}&" tipe "&${X.rep('{tipe}')}`, sat: 'buah', note: 'Harga per buah untuk ukuran dan tipe yang dipilih.' },
      { key: K_CR, jenis: 'alat', disp: norm('alat', crane, {}).disp, sat: 'jam' }, { key: K_EX, jenis: 'alat', disp: norm('alat', exc, {}).disp, sat: 'jam' }],
    testPrice: (n, k) => { const T = { 'pekerja': 110000, 'tukang batu/tembok': 135000, 'tukang kayu': 135000, 'kepala tukang': 135000, 'mandor': 135000, 'pasir pasang': 300000, 'semen portland': 1250, 'pasir urug': 220000, 'sirtu': 250000, 'pasir beton': 330000, 'kerikil': 380000, 'air': 40, 'kaso 5/7 cm': 5500000, 'kayu papan 3/20 cm': 6500000, 'paku campuran 2 cm dan 5 cm': 20000, 'waterpass': 25000, 'molen/beton mixer 0,35 m3 (+ feeder)': 150000, 'u-ditch terpilih': 175000, 'tutup u-ditch terpilih': 90000 }; T[K_CR.split('|')[1]] = 250000; T[K_EX.split('|')[1]] = 400000; return T[n] ?? null; },
    inputs: [
      { k: 'L', label: 'Panjang drainase', v: 100, unit: 'm', n: 'L' }, { k: 'uk', label: 'Ukuran U-Ditch (lebar x tinggi dalam, cm)', v: '40x40', opts: rows.map(r => r[2]), list: X => X.T.UD.ref('C'), note: 'Pilih dari daftar. Panjang tiap U-Ditch 120 cm.' },
      { k: 'mutu', label: 'Mutu lantai kerja', v: '10 MPa', list: '10 MPa,7.5 MPa', note: 'Pilihan: 10 MPa / 7.5 MPa (AHSP 8.1.1 atau 8.1.2). Lantai kerja dan pasir urug sudah termasuk dalam AHSP U-Ditch.' },
      { k: 'tw', label: 'Tebal dinding dan alas U-Ditch', v: 0.08, unit: 'm', n: 'Tw', note: 'ASUMSI: isi sesuai brosur produk. Dipakai untuk lebar luar dan kedalaman galian.' },
      { k: 'tlk', label: 'Tebal lantai kerja', v: 0.05, unit: 'm', n: 'Tlk', note: 'Acuan AHSP SE: 5 cm. Koefisien lantai kerja di AHSP diskalakan menurut tebal yang diisi.' }, { k: 'tps', label: 'Tebal pasir urug (bedding)', v: 0.10, unit: 'm', n: 'Tps', note: 'Acuan AHSP SE: 10 cm. Koefisien pasir di AHSP diskalakan menurut tebal yang diisi.' },
      { k: 'slope', label: 'Kemiringan dasar saluran', v: 0.003, unit: '%', n: 'i', note: 'Spek BKK: minimal 0,3%.' }, { k: 'tutup', label: 'Pakai tutup U-Ditch', v: 'Ya', list: 'Ya,Tidak', note: 'Tutup hanya tersedia untuk ukuran 30x30, 40x40, 50x50, 60x60, 80x80.' }, { k: 'tipe', label: 'Tipe tutup', v: 'LD', list: 'LD,HD', note: 'LD (ringan) / HD (berat; memakai excavator).' },
      { k: 'urg', label: 'Urugan sisi (sirtu)', v: 'Ya', list: 'Ya,Tidak', note: 'Spek: urugan kedua sisi dengan sirtu, dipadatkan.' }, { k: 'ul', label: 'Lebar urugan sisi', v: 0.3, unit: 'm', n: 'Bu', note: 'Juga menentukan lebar galian.' }, { k: 'tu', label: 'Tinggi urugan sisi', f: '={Ho}', unit: 'm', n: 'Tu', note: 'Bawaan = tinggi luar U-Ditch. Boleh diganti angka.' },
      { k: 'met', label: 'Metode beton lantai kerja', v: 'Manual', list: 'Manual,Molen', note: 'Manual / Molen. Galian dan sirtu manual.' }, { k: 'jb', label: 'Jarak bouwplank', v: 20, unit: 'm', n: 'Jb', note: 'Jumlah titik = dibulatkan ke atas (panjang / jarak) + 1.' }],
    checks: [{ label: 'Kemiringan dasar >= 0,3%', f: '=IF({slope}>=0.003,"OK","TIDAK SESUAI SPEK")', note: 'Spek BKK Gresik Bab 4.1' },
      { label: 'Tutup tersedia untuk ukuran terpilih', f: '=IF(AND({tutup}="Ya",{idx_t}=0),"TIDAK TERSEDIA UNTUK UKURAN INI","OK")', note: 'Tutup hanya untuk ukuran 30x30, 40x40, 50x50, 60x60, 80x80 (AHSP 8.1.3)' },
      { label: 'Kedalaman galian dan volume dalam rentang AHSP', f: '=IF(OR({Dg}>3,{galv}>2000),"DI LUAR RENTANG AHSP","OK")', note: 'AHSP galian tersedia sampai 3 m dan volume sampai 2.000 m3' },
      { label: 'Mutu 7,5 MPa hanya cara manual', f: '=IF(AND({mutu}="7.5 MPa",{met}="Molen"),"7,5 MPa HANYA CARA MANUAL","OK")', note: 'AHSP beton 7,5 MPa semi mekanis tidak tersedia; dipakai cara manual' }],
    calcs: [
      { k: 'Bd', label: 'Lebar dalam U-Ditch', expr: 'VALUE(LEFT({uk},FIND("x",{uk})-1))/100', unit: 'm', n: 'B', sym: 'dari ukuran U-Ditch (cm) / 100', ang: '="dari ukuran "&{uk}&" cm"' }, { k: 'Hd', label: 'Tinggi dalam U-Ditch', expr: 'VALUE(MID({uk},FIND("x",{uk})+1,10))/100', unit: 'm', n: 'H', sym: 'dari ukuran U-Ditch (cm) / 100', ang: '="dari ukuran "&{uk}&" cm"' },
      { k: 'Bo', label: 'Lebar luar U-Ditch', expr: '{Bd}+2*{tw}', unit: 'm', n: 'Bo' }, { k: 'Ho', label: 'Tinggi luar U-Ditch', expr: '{Hd}+{tw}', unit: 'm', n: 'Ho' },
      { k: 'Dg', label: 'Kedalaman galian', expr: '{Ho}+{tlk}+{tps}', unit: 'm', n: 'Dg' }, { k: 'Bg', label: 'Lebar galian', expr: '{Bo}+2*{ul}', wrap: 'IF({urg}="Ya",{E},{Bo})', unit: 'm', n: 'Bg' }, { k: 'galv', label: 'Volume galian tanah', expr: '{Bg}*{Dg}*{L}', unit: 'm3', n: 'Vg' },
      { k: 'nu', label: 'Jumlah U-Ditch (buah, informasi pembelian)', expr: 'ROUNDUP({L}/1.2,0)', unit: 'buah', n: 'Nu' },
      { k: 'idx_u', label: 'Baris tabel U-Ditch terpilih', expr: X => `MATCH({uk},${X.T.UD.ref('C')},0)`, unit: '', n: 'iU', sym: 'MATCH pada tabel di Master Koefisien AHSP', ang: '="baris ke-"&{@}' },
      { k: 'idx_t', label: 'Baris tabel tutup terpilih (0 = tidak tersedia)', expr: X => `IFERROR(MATCH({uk}&"-"&{tipe},${X.T.TT.ref('E')},0),0)`, unit: '', n: 'iT', sym: 'MATCH pada tabel di Master Koefisien AHSP', ang: '="baris ke-"&{@}' },
      { k: 'vlk', label: 'Volume lantai kerja (informasi, dalam AHSP)', expr: X => `INDEX(${X.T.UD.ref('J')},{idx_u})*{L}*{tlk}/0.05`, unit: 'm3', n: 'Vlk', sym: 'koefisien tabel × L × (tebal / 5 cm)', ang: '="hasil: "&FIXED({@},3,TRUE)' },
      { k: 'vps', label: 'Volume pasir urug (informasi, dalam AHSP)', expr: X => `INDEX(${X.T.UD.ref('K')},{idx_u})*{L}*{tps}/0.1`, unit: 'm3', n: 'Vps', sym: 'koefisien tabel × L × (tebal / 10 cm)', ang: '="hasil: "&FIXED({@},3,TRUE)' },
      { k: 'urug', label: 'Volume urugan sirtu sisi', expr: '2*{ul}*{tu}*{L}', wrap: 'IF({urg}="Ya",{E},0)', unit: 'm3', n: 'Vu' }, { k: 'tm', label: 'Panjang tutup U-Ditch', expr: '{L}', wrap: 'IF(AND({tutup}="Ya",{idx_t}>0),{E},0)', unit: "m'", n: 'Lt' },
      { k: 'btk', label: 'Jumlah titik bouwplank', expr: 'ROUNDUP({L}/{jb},0)+1', unit: 'titik', n: 'Nb' }, { k: 'bpm', label: 'Panjang bouwplank', expr: '{btk}*({Bg}+1)', unit: "m'", n: 'Lb' }],
    format: [{ cat: 'A', text: 'PEKERJAAN PERSIAPAN' }, { item: 1, label: 'Pasang bouwplank', unit: "m'", key: 'bpm', lines: [{ sub: 'Jumlah titik x panjang per titik', dims: { C: '{Bg}+1', F: '{btk}' } }] },
      { cat: 'B', text: 'PEKERJAAN GALIAN DAN URUGAN' }, { item: 1, label: 'Galian tanah biasa', unit: 'm3', key: 'galv', lines: [{ sub: 'Galian saluran', dims: { C: '{L}', D: '{Bg}', E: '{Dg}' } }] },
      { item: 2, label: 'Urugan sirtu sisi saluran (dipadatkan)', unit: 'm3', key: 'urug', lines: [{ sub: 'Urugan sisi kiri dan kanan', dims: { C: '{L}', D: '{ul}', E: '{tu}', F: 'IF({urg}="Ya",2,0)' } }] },
      { cat: 'C', text: 'PEKERJAAN SALURAN U-DITCH' }, { item: 1, label: 'Pasang saluran U-Ditch (termasuk lantai kerja dan pasir urug)', unit: "m'", key: 'ud', lines: [{ sub: 'Panjang saluran', dims: { C: '{L}' } }] },
      { cat: 'D', text: 'PEKERJAAN TUTUP U-DITCH' }, { item: 1, label: 'Pasang tutup U-Ditch', unit: "m'", key: 'tm', lines: [{ sub: 'Panjang saluran bertutup', dims: { C: '{L}', F: 'IF(AND({tutup}="Ya",{idx_t}>0),1,0)' } }] }],
    eqs: [['bpm', 'bpm'], ['galv', 'galv'], ['urug', 'urug'], ['ud', 'L'], ['tm', 'tm']],
    dynamic: X => {
      const IDU = X.rep('{idx_u}'), IDT = X.rep('{idx_t}'), JAM = X.S.jam, UD = X.T.UD, TT = X.T.TT, ixu = c => `INDEX(${UD.ref(c)},${IDU})`, ixt = c => `IF(${IDT}=0,0,INDEX(${TT.ref(c)},${IDT}))`;
      const VS_LK = [['AND({mutu}="10 MPa",{met}="Manual")', '2.2.1.4.2'], ['{mutu}="10 MPa"', '2.2.1.5.1'], [null, '2.2.1.4.1']]; const M10 = X.rep('{mutu}="10 MPa"');
      const hx = k => [X.HX(k, 'J'), X.HX(k, 'K'), X.HX(k, 'L')]; const TEN = [['L.01', 'Pekerja', 'F', 'tenaga|pekerja'], ['L.02', 'Tukang batu/tembok', 'G', 'tenaga|tukang batu/tembok'], ['L.04', 'Mandor', 'H', 'tenaga|mandor']];
      // --- blok U-Ditch ---
      let codeU = `IF(${M10},${ixu('A')},${ixu('B')})`; let rs = X.blockHead(`="AHSP "&${codeU}`, `="1 m' Saluran U-Ditch "&${X.rep('{uk}')}&"x120 cm dengan lantai kerja f'c "&${X.rep('{mutu}')}`, 'SE DJBK 47/2026 Lamp. VI CK Divisi 8.1');
      let subs = {}, comp = [], own = {}; X.blockSection('A', 'Tenaga Kerja'); let first = X.ahR;
      for (const [kode, nm, col, key] of TEN) { const r = X.blockRow(nm, kode, 'OH', `=IF(${ixu('I')}="OJ",${ixu(col)}/${JAM},${ixu(col)})`, X.HP(key), hx(key)); own[key] = 'AHSP!$E$' + r; comp.push(r); }
      X.blockTotal('Jumlah Harga Tenaga Kerja', first, subs, 'tenaga'); X.blockSection('B', 'Bahan'); first = X.ahR;
      const lk = x => X.pick(VS_LK, c => X.arow[c][x]); const P = X.arow['1.3.1.2'];
      let r = X.blockRow(`="Lantai kerja f'c "&${X.rep('{mutu}')}`, '', 'm3', `=${ixu('J')}*${X.rep('{tlk}')}/0.05`, lk('D'), [lk('ppn'), lk('pph15'), lk('pph2')]); const lkc = 'AHSP!$E$' + r; comp.push(r);
      r = X.blockRow('Urukan pasir urug (bedding)', '', 'm3', `=${ixu('K')}*${X.rep('{tps}')}/0.1`, P.D, [P.ppn, P.pph15, P.pph2]); const psc = 'AHSP!$E$' + r; comp.push(r);
      r = X.blockRow(X.KEYS['bahan|u-ditch terpilih'].disp, '', 'buah', `=${ixu('L')}`, X.HP('bahan|u-ditch terpilih'), hx('bahan|u-ditch terpilih')); own['bahan|u-ditch terpilih'] = 'AHSP!$E$' + r; comp.push(r);
      X.blockTotal('Jumlah Harga Bahan', first, subs, 'bahan'); X.blockSection('C', 'Peralatan'); first = X.ahR;
      r = X.blockRow(X.KEYS[K_CR].disp, '', 'jam', `=${ixu('M')}`, X.HP(K_CR), hx(K_CR)); own[K_CR] = 'AHSP!$E$' + r; comp.push(r); X.blockTotal('Jumlah Harga Peralatan', first, subs, 'alat');
      X.UB = Object.assign({ own, code: codeU, lk: lkc, ps: psc }, X.blockTail(subs, comp, rs));
      // --- blok tutup ---
      const codeT = `IF(${IDT}=0,"-",INDEX(${TT.ref('A')},${IDT}))`; rs = X.blockHead(`="AHSP "&${codeT}`, `="1 m' Tutup U-Ditch untuk "&${X.rep('{uk}')}&"x120 cm tipe "&${X.rep('{tipe}')}&IF(${IDT}=0," (TIDAK TERSEDIA)","")`, 'SE DJBK 47/2026 Lamp. VI CK Divisi 8.1.3');
      subs = {}; comp = []; own = {}; X.blockSection('A', 'Tenaga Kerja'); first = X.ahR;
      for (const [kode, nm, col, key] of TEN) { const rr = X.blockRow(nm, kode, 'OH', `=IF(${IDT}=0,0,IF(${ixt('I')}="OJ",${ixt(col)}/${JAM},${ixt(col)}))`, X.HP(key), hx(key)); own[key] = 'AHSP!$E$' + rr; comp.push(rr); }
      X.blockTotal('Jumlah Harga Tenaga Kerja', first, subs, 'tenaga'); X.blockSection('B', 'Bahan'); first = X.ahR;
      r = X.blockRow(X.KEYS['bahan|tutup u-ditch terpilih'].disp, '', 'buah', `=${ixt('J')}`, X.HP('bahan|tutup u-ditch terpilih'), hx('bahan|tutup u-ditch terpilih')); own['bahan|tutup u-ditch terpilih'] = 'AHSP!$E$' + r; comp.push(r);
      X.blockTotal('Jumlah Harga Bahan', first, subs, 'bahan'); X.blockSection('C', 'Peralatan'); first = X.ahR;
      r = X.blockRow(X.KEYS[K_EX].disp, '', 'jam', `=${ixt('K')}`, X.HP(K_EX), hx(K_EX)); own[K_EX] = 'AHSP!$E$' + r; comp.push(r); X.blockTotal('Jumlah Harga Peralatan', first, subs, 'alat');
      X.TB = Object.assign({ own, code: codeT }, X.blockTail(subs, comp, rs));
    },
    items: X => { const V = X.VF; const GAL = [['AND({Dg}<=1,{galv}<=200)', '1.2.1.1.1'], ['{Dg}<=1', '1.2.1.1.2'], ['AND({Dg}<=2,{galv}<=200)', '1.2.1.1.4'], ['{Dg}<=2', '1.2.1.1.5'], ['AND({Dg}<=3,{galv}<=200)', '1.2.1.1.6'], [null, '1.2.1.1.7']];
      const VS_LK = [['AND({mutu}="10 MPa",{met}="Manual")', '2.2.1.4.2'], ['{mutu}="10 MPa"', '2.2.1.5.1'], [null, '2.2.1.4.1']];
      return [X.simpleItem('Bouwplank', "m'", V.bpm, [[null, '1.1.4.2']]), X.simpleItem('Galian tanah biasa', 'm3', V.galv, GAL), X.flatItem('Pasang saluran U-Ditch (termasuk lantai kerja dan pasir urug)', "m'", V.ud, X.UB, [[X.UB.lk, VS_LK], [X.UB.ps, [[null, '1.3.1.2']]]]),
        X.flatItem('Pasang tutup U-Ditch', "m'", V.tm, X.TB, []), X.simpleItem('Urugan sirtu sisi saluran (dipadatkan)', 'm3', V.urug, [[null, '1.3.2.2']])]; }
  };
};
