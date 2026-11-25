'use strict';
const { norm } = require('../core.js');
module.exports = AH => {
  const pv = [], ks = [];
  for (let i = 1; i <= 8; i++) { const x = AH['7.1.1.' + i], t = x.judul; const teb = t.match(/Tebal (\d+) cm/)[1], mu = t.match(/f.c (\d+) MPa/)[1], cara = /manual/.test(t) ? 'Manual' : 'Semi'; const ten = {}; x.komponen.filter(c => c.jenis === 'tenaga').forEach(c => ten[c.kode] = c.koef);
    const f = re => x.komponen.find(c => re.test(c.uraian)); pv.push(['7.1.1.' + i, +teb, +mu, cara, `${teb}-${mu}-${cara}`, ten['L.01'], ten['L.02'], ten['L.03'], ten['L.04'], f(/^paving/i).koef, f(/filler/i).koef, f(/pasir beton/i).koef, (x.komponen.find(c => c.jenis === 'alat') || { koef: 0 }).koef]); }
  const kv = code => { const c = AH[code].komponen; const ten = c.filter(z => z.jenis === 'tenaga').map(z => z.koef); return [ten[0], ten[1], ten[2], c.find(z => /^kanstin/i.test(z.uraian)).koef, c.find(z => /^semen/i.test(z.uraian)).koef, c.find(z => /pasir/i.test(z.uraian)).koef]; };
  let k = kv('7.1.2.1'); ks.push(['7.1.2.1', '10x20x40', 'Ya', k[0], k[1], k[2], k[3], k[4], k[5], 1400, 'Dari SE']); k = kv('7.1.2.3'); ks.push(['7.1.2.3', '10x20x40', 'Tidak', k[0], k[1], k[2], k[3], k[4], k[5], 1400, 'Dari SE']);
  const k2 = kv('7.1.2.2'), k4 = kv('7.1.2.4');
  for (const [jen, pj] of [['15x25x50', 0.5], ['15x25x40', 0.4]]) { ks.push(['TURUNAN dari 7.1.2.2', jen, 'Ya', k2[0], k2[1], k2[2], +(1 / pj).toFixed(4), k2[4], k2[5], 1400, 'TURUNAN: buah = 1/panjang; semen dan pasir sama dengan 15x40x60 (lebar 15 cm sama)']); ks.push(['TURUNAN dari 7.1.2.4', jen, 'Tidak', k4[0], k4[1], k4[2], +(1 / pj).toFixed(4), k4[4], k4[5], 1400, 'TURUNAN: buah = 1/panjang; semen dan pasir sama dengan 15x40x60 tanpa kupingan']); }
  const K_PV = 'bahan|paving block terpilih', K_KS = 'bahan|kanstin pracetak terpilih', K_FIL = 'bahan|pasir filler', K_ST = 'alat|stamper kodok 150 kg', K_PB = 'bahan|pasir beton', K_SM = 'bahan|semen portland';
  const pl = 'IF({kst}="Cor setempat",{E},0)';
  return {
    kind: 'paving', pekerjaan: 'Jalan Paving', bvTitle: 'BACKUP VOLUME - JALAN PAVING', gbLabel: 'PANJANG JALAN PAVING', gbLenKey: 'L', detailTitle: 'DETAIL KANSTIN DAN TOPI USKUP',
    codes: ['1.3.2.2', '2.2.1.5.6', '2.2.1.6.6', '2.2.1.3.2', '2.2.1.3.9'], unitCode: { '2.2.1.3.2': 'm2', '2.2.1.3.9': 'm2' },
    rename: [[/^stamper/i, 'Stamper Kodok 150 kg'], [/^beton ready mixed/i, "Beton Ready Mixed f'c 25 MPa"]], ppnDefault: ['semen', 'kaso', 'paku', 'paving', 'kanstin', 'minyak', 'papan kayu', 'beton ready'],
    tables: [{ id: 'PV', title: 'TABEL KOEFISIEN PAVING BLOCK DAN TOPI USKUP (per 1 m2, Lampiran VI Divisi 7.1.1)', headers: ['Kode', 'Tebal (cm)', 'Mutu (MPa)', 'Cara', 'Kunci', 'Pekerja', 'Tukang batu/tembok', 'Kepala Tukang', 'Mandor', 'Paving block (m2/m2)', 'Pasir filler (m3/m2)', 'Pasir beton (m3/m2)', 'Stamper kodok (hari/m2)'], rows: pv, blue: [5, 6, 7, 8, 9, 10, 11, 12] },
      { id: 'KS', title: "TABEL KOEFISIEN KANSTIN PRACETAK (per 1 m', Lampiran VI Divisi 7.1.2; baris TURUNAN = bukan dari SE)", headers: ['Asal analisa', 'Jenis kanstin', 'Kupingan', 'Kunci', 'Pekerja', 'Tukang batu/tembok', 'Mandor', "Kanstin (buah/m')", "Semen Portland (kg/m')", "Pasir beton (kg/m')", 'Berat jenis pasir beton (kg/m3)', 'Catatan'], rows: ks.map(r => [r[0], r[1], r[2], r[1] + '-' + r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10]]), blue: [4, 5, 6, 7, 8, 9] }],
    extraKeys: [{ key: 'tenaga|kepala tukang', jenis: 'tenaga', disp: 'Kepala Tukang', sat: 'OH', kode: 'L.03' }, { key: K_PV, jenis: 'bahan', disp: X => `="Paving block tebal "&${X.rep('{tebal}')}&" f'c "&${X.rep('{mutu}')}`, sat: 'm2', note: 'Harga untuk tebal dan mutu yang dipilih di Backup Volume.' },
      { key: K_KS, jenis: 'bahan', disp: X => `="Kanstin pracetak "&${X.rep('{kst}')}`, sat: 'buah', note: 'Harga per buah untuk jenis yang dipilih di Backup Volume.' }, { key: K_FIL, jenis: 'bahan', disp: 'Pasir filler', sat: 'm3' }, { key: K_ST, jenis: 'alat', disp: 'Stamper Kodok 150 kg', sat: 'hari' }],
    testPrice: n => { const T = { 'pekerja': 110000, 'tukang batu/tembok': 135000, 'tukang kayu': 135000, 'kepala tukang': 135000, 'mandor': 135000, 'sirtu': 250000, 'pasir beton': 330000, 'kerikil': 380000, 'air': 40, 'semen portland': 1250, 'pasir filler': 280000, 'paving block terpilih': 85000, 'kanstin pracetak terpilih': 45000, 'stamper kodok 150 kg': 120000, 'papan kayu kelas iii': 3500000, 'paku 5 – 10 cm': 20000, 'minyak bekisting': 15000, "beton ready mixed f'c 25 mpa": 1100000, 'molen/beton mixer 0,35 m3 (+ feeder)': 150000 }; if (T[n] !== undefined) return T[n]; if (/agregat/.test(n)) return 380000; return null; },
    inputs: [
      { k: 'L', label: 'Panjang jalan', v: 100, unit: 'm', n: 'L' }, { k: 'Bj', label: 'Lebar perkerasan paving', v: 3.0, unit: 'm', n: 'Bj', note: 'Spek: minimal 3,0 m.' },
      { k: 'tebal', label: 'Tebal paving block', v: '8 cm', list: '6 cm,8 cm', note: 'Pilihan 6 cm / 8 cm. Spek BKK: 8 cm WAJIB (6 cm muncul peringatan). Topi uskup dan pasir perata sudah dalam AHSP.' },
      { k: 'mutu', label: 'Mutu paving block', v: '25 MPa', list: '20 MPa,25 MPa', note: "20 MPa (jalan lingkungan/lokal) atau 25 MPa (akses/kolektor). Spek: K-300 (setara f'c 25)." }, { k: 'met', label: 'Cara pemasangan paving', v: 'Manual', list: 'Manual,Molen', note: 'Manual / Molen. Molen = semi mekanis (stamper kodok).' },
      { k: 'urg', label: 'Pakai urugan sirtu', v: 'Ya', list: 'Ya,Tidak', note: 'Sirtu dipadatkan lapis demi lapis (AHSP 1.3.2.2).' }, { k: 'lur', label: 'Lebar urugan', f: '={Bj}', unit: 'm', n: 'Bu', note: 'Bawaan = lebar perkerasan. Boleh diganti angka.' }, { k: 'tur', label: 'Tebal urugan (padat)', v: 0.15, unit: 'm', n: 'Tu', note: 'Spek: maks. 20 cm per lapis sebelum pemadatan.' },
      { k: 'bahu', label: 'Pakai bahu jalan', v: 'Ya', list: 'Ya,Tidak', note: 'Sirtu padat, permeabel (spek).' }, { k: 'bh', label: 'Lebar bahu (tiap sisi)', v: 0.5, unit: 'm', n: 'Bh', note: 'Spek: maksimum 50 cm tiap sisi.' }, { k: 'th', label: 'Tebal bahu rata-rata', v: 0.15, unit: 'm', n: 'Th' },
      { k: 'kst', label: 'Jenis kanstin', v: '15x25x50', list: '10x20x40,15x25x50,15x25x40,Cor setempat', note: 'Pilihan: 10x20x40 / 15x25x50 / 15x25x40 / Cor setempat. Spek: 15x25x50. Ukuran 15x25 pracetak = analisa TURUNAN.' },
      { k: 'kup', label: 'Kanstin pracetak pakai kupingan', v: 'Ya', list: 'Ya,Tidak', note: 'Ya / Tidak (hanya untuk kanstin pracetak).' }, { k: 'sisi', label: 'Kanstin dipasang di', v: 'Kedua sisi', list: 'Kedua sisi,Satu sisi,Tidak ada' },
      { k: 'kcs', label: 'Ukuran kanstin cor setempat (lebar x tinggi, cm)', v: '15x25', list: '15x25,10x20', note: 'Dipakai bila jenis = Cor setempat. Volume dalam m3; bekisting dan bongkar bekisting masing-masing item sendiri.' },
      { k: 'mcor', label: "Metode beton kanstin cor (f'c 25 MPa)", v: 'Ready mix', list: 'Ready mix,Molen', note: "Beton f'c 25 MPa (setara K-300): ready mix atau molen. Cara manual f'c 25 tidak ada di SE." }],
    checks: [
      { label: 'Tebal paving 8 cm', f: '=IF({tebal}="8 cm","OK","TIDAK SESUAI SPEK")', note: 'Spek BKK 3.5: tebal paving 8 cm WAJIB' }, { label: "Mutu paving K-300 (setara f'c 25)", f: '=IF({mutu}="25 MPa","OK","TIDAK SESUAI SPEK")', note: 'Spek BKK 3.5: mutu K-300' },
      { label: 'Lebar perkerasan >= 3,0 m', f: '=IF({Bj}>=3,"OK","TIDAK SESUAI SPEK")', note: 'Spek BKK 3.1 (dapat disesuaikan kondisi eksisting)' }, { label: 'Kanstin 15x25x50', f: '=IF(OR({kst}="15x25x50",{sisi}="Tidak ada"),"OK","TIDAK SESUAI SPEK")', note: 'Spek BKK 3.5: kanstin pracetak 15x25x50' },
      { label: 'Lebar bahu maks. 50 cm', f: '=IF(AND({bahu}="Ya",{bh}>0.5),"TIDAK SESUAI SPEK","OK")', note: 'Spek BKK 3.1' }, { label: 'Tebal urugan maks. 20 cm per lapis', f: '=IF(AND({urg}="Ya",{tur}>0.2),"TEBAL > 20 CM, URUG BERLAPIS","OK")', note: 'Spek BKK 3.2: lapis demi lapis, maks. 20 cm sebelum pemadatan' },
      { label: 'Kanstin pracetak turunan (bukan dari SE)', lvl: 'amber', f: '=IF(AND({kst}<>"Cor setempat",{kst}<>"10x20x40",{sisi}<>"Tidak ada"),"ANALISA TURUNAN","OK")', note: 'Analisa 15x25x50 dan 15x25x40 disusun turunan; ganti bila ada koefisien resmi' }],
    calcs: [
      { k: 'Aj', label: 'Luas paving', expr: '{L}*{Bj}', unit: 'm2', n: 'Aj' }, { k: 'Jsisi', label: 'Jumlah sisi kanstin', expr: 'IF({sisi}="Kedua sisi",2,IF({sisi}="Satu sisi",1,0))', unit: '', n: 'Js', sym: '2 / 1 / 0 sesuai pilihan', ang: '="pilihan: "&{sisi}' },
      { k: 'Lk', label: 'Panjang kanstin total', expr: '{L}*{Jsisi}', unit: "m'", n: 'Lk' }, { k: 'Lkp', label: 'Panjang kanstin pracetak', expr: '{Lk}', wrap: 'IF({kst}="Cor setempat",0,{E})', unit: "m'", n: 'Lkp' }, { k: 'Lkc', label: 'Panjang kanstin cor setempat', expr: '{Lk}', wrap: pl, unit: "m'", n: 'Lkc' },
      { k: 'pk_', label: 'Panjang satu kanstin pracetak', expr: 'IF({kst}="Cor setempat",0,VALUE(RIGHT({kst},2))/100)', unit: 'm', n: 'pk', sym: 'dari ukuran kanstin / 100', ang: '="nilai: "&FIXED({@},3,TRUE)' },
      { k: 'bkc', label: 'Lebar kanstin cor setempat', expr: 'VALUE(LEFT({kcs},FIND("x",{kcs})-1))/100', unit: 'm', n: 'bk', sym: 'dari ukuran (cm) / 100', ang: '="dari ukuran "&{kcs}&" cm"' }, { k: 'hkc', label: 'Tinggi kanstin cor setempat', expr: 'VALUE(MID({kcs},FIND("x",{kcs})+1,10))/100', unit: 'm', n: 'hk', sym: 'dari ukuran (cm) / 100', ang: '="dari ukuran "&{kcs}&" cm"' },
      { k: 'uru', label: 'Volume urugan sirtu badan jalan', expr: '{lur}*{tur}*{L}', wrap: 'IF({urg}="Ya",{E},0)', unit: 'm3', n: 'Vu' }, { k: 'vbh', label: 'Volume bahu jalan sirtu', expr: '2*{bh}*{th}*{L}', wrap: 'IF({bahu}="Ya",{E},0)', unit: 'm3', n: 'Vh' },
      { k: 'vkc', label: 'Volume beton kanstin cor setempat', expr: '{bkc}*{hkc}*{Lkc}', unit: 'm3', n: 'Vkc' }, { k: 'abk', label: 'Luas bekisting kanstin cor (dua sisi)', expr: '2*{hkc}*{Lkc}', unit: 'm2', n: 'Abk' },
      { k: 'nkp', label: 'Jumlah kanstin pracetak (buah, informasi)', expr: 'ROUNDUP(IF({pk_}>0,{Lkp}/{pk_},0),0)', unit: 'buah', n: 'Nk' },
      { k: 'idx_pv', label: 'Baris tabel paving terpilih', expr: X => `MATCH(VALUE(LEFT({tebal},1))&"-"&LEFT({mutu},2)&"-"&IF({met}="Manual","Manual","Semi"),${X.T.PV.ref('E')},0)`, unit: '', n: 'iP', sym: 'MATCH pada tabel di Master Koefisien AHSP', ang: '="baris ke-"&{@}' },
      { k: 'idx_ks', label: 'Baris tabel kanstin pracetak terpilih (0 = cor setempat/tidak ada)', expr: X => `IFERROR(MATCH({kst}&"-"&{kup},${X.T.KS.ref('D')},0),0)`, unit: '', n: 'iK', sym: 'MATCH pada tabel di Master Koefisien AHSP', ang: '="baris ke-"&{@}' }],
    format: [{ cat: 'A', text: 'PEKERJAAN URUGAN DAN BAHU JALAN' }, { item: 1, label: 'Urugan sirtu badan jalan (dipadatkan)', unit: 'm3', key: 'uru', lines: [{ sub: 'Urugan lapis perkerasan', dims: { C: '{L}', D: '{lur}', E: '{tur}', F: 'IF({urg}="Ya",1,0)' } }] },
      { item: 2, label: 'Bahu jalan sirtu (dipadatkan)', unit: 'm3', key: 'vbh', lines: [{ sub: 'Bahu kiri dan kanan', dims: { C: '{L}', D: '{bh}', E: '{th}', F: 'IF({bahu}="Ya",2,0)' } }] },
      { cat: 'B', text: 'PEKERJAAN PAVING' }, { item: 1, label: 'Pasang paving block (termasuk pasir perata dan pengunci topi uskup)', unit: 'm2', key: 'pv', lines: [{ sub: 'Luas perkerasan', dims: { C: '{L}', D: '{Bj}' } }] },
      { cat: 'C', text: 'PEKERJAAN KANSTIN' }, { item: 1, label: 'Pasang kanstin pracetak', unit: "m'", key: 'kp', lines: [{ sub: 'Panjang kanstin pracetak', dims: { C: '{L}', F: 'IF({kst}="Cor setempat",0,{Jsisi})' } }] },
      { item: 2, label: "Kanstin cor setempat - beton f'c 25 MPa", unit: 'm3', key: 'kc', lines: [{ sub: 'Lebar x tinggi x panjang', dims: { C: '{L}', D: '{bkc}', E: '{hkc}', F: 'IF({kst}="Cor setempat",{Jsisi},0)' } }] },
      { item: 3, label: 'Kanstin cor setempat - bekisting (3 kali pakai)', unit: 'm2', key: 'kb', lines: [{ sub: '2 x tinggi x panjang', dims: { C: '{L}', D: '2*{hkc}', F: 'IF({kst}="Cor setempat",{Jsisi},0)' } }] },
      { item: 4, label: 'Kanstin cor setempat - bongkar bekisting', unit: 'm2', key: 'kk', lines: [{ sub: 'Luas sama dengan bekisting', dims: { G: '@kb' } }] }],
    eqs: [['uru', 'uru'], ['vbh', 'vbh'], ['pv', 'Aj'], ['kp', 'Lkp'], ['kc', 'vkc'], ['kb', 'abk'], ['kk', 'abk']],
    dynamic: X => {
      const IDP = X.rep('{idx_pv}'), IDK = X.rep('{idx_ks}'), PV = X.T.PV, KS = X.T.KS; const hx = key => [X.HX(key, 'J'), X.HX(key, 'K'), X.HX(key, 'L')];
      const ixp = c => `INDEX(${PV.ref(c)},${IDP})`, ixk = c => `IF(${IDK}=0,0,INDEX(${KS.ref(c)},${IDK}))`;
      const TEN = [['L.01', 'Pekerja', 'tenaga|pekerja'], ['L.02', 'Tukang batu/tembok', 'tenaga|tukang batu/tembok'], ['L.03', 'Kepala Tukang', 'tenaga|kepala tukang'], ['L.04', 'Mandor', 'tenaga|mandor']];
      let rs = X.blockHead(`="AHSP "&${ixp('A')}`, `="1 m2 Pasang paving block tebal "&${X.rep('{tebal}')}&" f'c "&${X.rep('{mutu}')}&" dan pengunci topi uskup, cara "&IF(${X.rep('{met}="Manual"')},"manual","semi mekanis")`, 'SE DJBK 47/2026 Lamp. VI CK Divisi 7.1.1');
      let subs = {}, comp = [], own = {}; X.blockSection('A', 'Tenaga Kerja'); let first = X.ahR;
      TEN.forEach(([kode, nm, key], i) => { const r = X.blockRow(nm, kode, 'OH', `=${ixp('FGHI'[i])}`, X.HP(key), hx(key)); own[key] = 'AHSP!$E$' + r; comp.push(r); });
      X.blockTotal('Jumlah Harga Tenaga Kerja', first, subs, 'tenaga'); X.blockSection('B', 'Bahan'); first = X.ahR;
      [[K_PV, 'm2', 'J', X.KEYS[K_PV].disp], [K_FIL, 'm3', 'K', 'Pasir filler'], [K_PB, 'm3', 'L', 'Pasir beton']].forEach(([key, sat, col, nm]) => { const r = X.blockRow(nm, '', sat, `=${ixp(col)}`, X.HP(key), hx(key)); own[key] = 'AHSP!$E$' + r; comp.push(r); });
      X.blockTotal('Jumlah Harga Bahan', first, subs, 'bahan'); X.blockSection('C', 'Peralatan'); first = X.ahR;
      let r = X.blockRow('Stamper Kodok 150 kg', '', 'hari', `=${ixp('M')}`, X.HP(K_ST), hx(K_ST)); own[K_ST] = 'AHSP!$E$' + r; comp.push(r); X.blockTotal('Jumlah Harga Peralatan', first, subs, 'alat');
      X.PVB = Object.assign({ own, code: ixp('A') }, X.blockTail(subs, comp, rs));
      rs = X.blockHead(`="AHSP "&IF(${IDK}=0,"-",INDEX(${KS.ref('A')},${IDK}))`, `="1 m' Kanstin pracetak "&${X.rep('{kst}')}&IF(${X.rep('{kup}="Ya"')}," dengan kupingan"," tanpa kupingan")&IF(${IDK}=0," (TIDAK DIPAKAI)",IF(LEFT(INDEX(${KS.ref('A')},${IDK}),7)="TURUNAN"," - ANALISA TURUNAN (bukan dari SE)",""))`, 'SE DJBK 47/2026 Lamp. VI CK Divisi 7.1.2');
      subs = {}; comp = []; own = {}; X.blockSection('A', 'Tenaga Kerja'); first = X.ahR;
      [TEN[0], TEN[1], TEN[3]].forEach(([kode, nm, key], i) => { const rr = X.blockRow(nm, kode, 'OH', `=${ixk('EFG'[i])}`, X.HP(key), hx(key)); own[key] = 'AHSP!$E$' + rr; comp.push(rr); });
      X.blockTotal('Jumlah Harga Tenaga Kerja', first, subs, 'tenaga'); X.blockSection('B', 'Bahan'); first = X.ahR;
      r = X.blockRow(X.KEYS[K_KS].disp, '', 'buah', `=${ixk('H')}`, X.HP(K_KS), hx(K_KS)); own[K_KS] = 'AHSP!$E$' + r; comp.push(r);
      r = X.blockRow('Semen Portland', '', 'kg', `=${ixk('I')}`, X.HP(K_SM), hx(K_SM)); own[K_SM] = 'AHSP!$E$' + r; comp.push(r);
      r = X.blockRow('Pasir beton', '', 'm3', `=IF(${IDK}=0,0,INDEX(${KS.ref('J')},${IDK})/INDEX(${KS.ref('K')},${IDK}))`, X.HP(K_PB), hx(K_PB)); own[K_PB] = 'AHSP!$E$' + r; comp.push(r);
      X.blockTotal('Jumlah Harga Bahan', first, subs, 'bahan'); X.blockSection('C', 'Peralatan'); first = X.ahR; X.blockTotal('Jumlah Harga Peralatan', first, subs, 'alat');
      X.KSB = Object.assign({ own, code: `IF(${IDK}=0,"-",INDEX(${KS.ref('A')},${IDK}))` }, X.blockTail(subs, comp, rs));
    },
    items: X => { const V = X.VF; const VB = [['{mcor}="Ready mix"', '2.2.1.6.6'], [null, '2.2.1.5.6']];
      return [X.simpleItem('Urugan sirtu badan jalan (dipadatkan)', 'm3', V.uru, [[null, '1.3.2.2']]), X.simpleItem('Bahu jalan sirtu (dipadatkan)', 'm3', V.vbh, [[null, '1.3.2.2']]),
        X.flatItem('Pasang paving block (termasuk pasir perata dan pengunci topi uskup)', 'm2', V.pv, X.PVB, []), X.flatItem('Pasang kanstin pracetak', "m'", V.kp, X.KSB, []),
        X.simpleItem("Kanstin cor setempat - beton f'c 25 MPa", 'm3', V.kc, VB), X.simpleItem('Kanstin cor setempat - bekisting (3 kali pakai)', 'm2', V.kb, [[null, '2.2.1.3.2']]), X.simpleItem('Kanstin cor setempat - bongkar bekisting', 'm2', V.kk, [[null, '2.2.1.3.9']])]; }
  };
};
