'use strict';
const pl = x => `IF({pls}="Ya",${x},0)`; const dtn = '{dasar}="Tanah (tanpa cor)"';
module.exports = {
  kind: 'drainase', pekerjaan: 'Drainase Pasangan Batu Kali', bvTitle: 'BACKUP VOLUME - DRAINASE PASANGAN BATU KALI', gbLabel: 'PANJANG DRAINASE', gbLenKey: 'L', detailTitle: 'DETAIL PIPA DRAIN (WEEP HOLE) DAN FILTER',
  codes: ['1.1.4.2', '1.2.1.1.1', '1.2.1.1.2', '1.2.1.1.4', '1.2.1.1.5', '1.2.1.1.6', '1.2.1.1.7', '1.3.1.2', '1.3.2.2', '2.2.2.1.6', '2.2.2.1.7', '2.2.1.4.3', '2.2.1.5.2', '3.7.3', '3.7.8', '2.7.2'],
  unitCode: { '1.1.4.2': "m'", '2.7.2': "m'", '3.7.3': 'm2', '3.7.8': 'm2' },
  ppnDefault: ['semen', 'pipa pvc', 'geotekstil', 'kaso', 'kayu papan', 'paku'],
  testPrice: n => { const T = { 'pekerja': 110000, 'tukang batu/tembok': 135000, 'tukang kayu': 135000, 'kepala tukang': 135000, 'mandor': 135000, 'batu belah': 235000, 'pasir pasang': 300000, 'semen portland': 1250, 'pasir urug': 220000, 'sirtu': 250000, 'pasir beton': 330000, 'kerikil': 380000, 'air': 40, 'kaso 5/7 cm': 5500000, 'kayu papan 3/20 cm': 6500000, 'paku campuran 2 cm dan 5 cm': 20000, 'waterpass': 25000, 'molen/beton mixer 0,35 m3 (+ feeder)': 150000, 'ijuk': 12000, 'geotekstil woven 400 gr/m2': 15000, 'pipa pvc ø 2"': 25000 }; return T[n] ?? null; },
  inputs: [
    { k: 'L', label: 'Panjang drainase', v: 206, unit: 'm', n: 'L' }, { k: 'td', label: 'Tinggi dinding', v: 1.2, unit: 'm', n: 'Td' }, { k: 'bda', label: 'Lebar atas dinding', v: 0.3, unit: 'm', n: 'Ba' },
    { k: 'bdb', label: 'Lebar bawah dinding', v: 0.6, unit: 'm', n: 'Bb', note: 'ASUMSI: sama dengan lebar atas pondasi. Sisi luar tegak, sisi miring di dalam saluran.' },
    { k: 'tp', label: 'Tinggi pondasi', v: 0.4, unit: 'm', n: 'Tp' }, { k: 'pa', label: 'Lebar atas pondasi', v: 0.6, unit: 'm', n: 'Pa' }, { k: 'pb', label: 'Lebar bawah pondasi', v: 0.6, unit: 'm', n: 'Pb' },
    { k: 'gal', label: 'Kedalaman galian', v: 0.8, unit: 'm', n: 'Hg', note: 'AHSP galian menyesuaikan kedalaman (sampai 3 m) dan volume.' }, { k: 'lub', label: 'Lebar lubang saluran (dasar)', v: 1.0, unit: 'm', n: 'Bs' },
    { k: 'slope', label: 'Kemiringan dasar saluran', v: 0.003, unit: '%', n: 'i', note: 'Spek BKK: minimal 0,3%.' },
    { k: 'dasar', label: 'Dasar saluran', v: 'Cor', list: 'Tanah (tanpa cor),Cor,Cor + plester + acian', note: 'Pilihan: Tanah (tanpa cor) / Cor / Cor + plester + acian. Bila dicor, pasir urug wajib.' },
    { k: 'tcor', label: 'Tebal cor dasar', v: 0.10, unit: 'm', n: 'Tc', note: "Beton f'c 15 MPa (AHSP 2.2.1.4.3 / 2.2.1.5.2)." }, { k: 'tpas', label: 'Tebal pasir urug di bawah cor', v: 0.05, unit: 'm', n: 'Tr' },
    { k: 'pls', label: 'Plesteran dan acian dinding', v: 'Ya', list: 'Ya,Tidak', note: 'Plester 1PC:3Ps tebal 15 mm (spek: kedap air) + acian pada sisi dalam miring, permukaan atas, dan topi luar.' }, { k: 'tl', label: 'Tinggi plester sisi luar (topi)', v: 0.05, unit: 'm', n: 'Tl' },
    { k: 'pvc', label: 'Pipa PVC 2" (weep hole)', v: 'Ya', list: 'Ya,Tidak', note: 'Panjang tiap pipa mengikuti lebar dinding (rata-rata atas-bawah). Jumlah dibulatkan ke atas.' }, { k: 'jp', label: 'Jarak antar pipa', v: 1.0, unit: 'm', n: 'Jp', note: 'Jumlah per sisi = panjang / jarak + 1.' },
    { k: 'urg', label: 'Urugan sisi (sirtu)', v: 'Ya', list: 'Ya,Tidak' }, { k: 'ul', label: 'Lebar urugan sisi', v: 0.3, unit: 'm', n: 'Bu' }, { k: 'ut', label: 'Tinggi urugan sisi', v: 0.8, unit: 'm', n: 'Hu' },
    { k: 'met', label: 'Metode pasangan batu dan beton', v: 'Manual', list: 'Manual,Molen', note: 'Manual / Molen (molen menambah sewa alat).' }, { k: 'jb', label: 'Jarak bouwplank', v: 20, unit: 'm', n: 'Jb', note: 'Jumlah titik = dibulatkan ke atas (panjang / jarak) + 1.' }],
  checks: [{ label: 'Kemiringan dasar >= 0,3%', f: '=IF({slope}>=0.003,"OK","TIDAK SESUAI SPEK")', note: 'Spek BKK Gresik Bab 4.1' },
    { label: 'Pasir urug ada bila dasar dicor', f: `=IF(AND(NOT(${dtn}),{tpas}<=0),"TIDAK SESUAI SPEK","OK")`, note: 'Ketentuan pengguna: cor wajib diberi pasir urug' }],
  calcs: [
    { k: 'luas_d', label: 'Luas penampang dinding (per sisi)', expr: '({bda}+{bdb})/2*{td}', unit: 'm2', n: 'Ad' }, { k: 'luas_p', label: 'Luas penampang pondasi (per sisi)', expr: '({pa}+{pb})/2*{tp}', unit: 'm2', n: 'Ap' },
    { k: 'batu', label: 'Volume pasangan batu', expr: '2*({luas_d}+{luas_p})*{L}', unit: 'm3', n: 'Vb' }, { k: 'lm', label: 'Panjang sisi miring dinding (sisi dalam)', expr: 'SQRT({td}^2+({bdb}-{bda})^2)', unit: 'm', n: 'Lm' },
    { k: 'lgal', label: 'Lebar galian', expr: '{lub}+2*{pb}', unit: 'm', n: 'Bg' }, { k: 'galv', label: 'Volume galian tanah', expr: '{lgal}*{gal}*{L}', unit: 'm3', n: 'Vg' },
    { k: 'pasir', label: 'Volume pasir urug dasar', expr: '{lub}*{tpas}*{L}', wrap: `IF(${dtn},0,{E})`, unit: 'm3', n: 'Vr' }, { k: 'cor', label: 'Volume cor dasar saluran', expr: '{lub}*{tcor}*{L}', wrap: `IF(${dtn},0,{E})`, unit: 'm3', n: 'Vc' },
    { k: 'dasarbs', label: 'Lebar dasar yang diplester', expr: '{lub}', wrap: 'IF({dasar}="Cor + plester + acian",{E},0)', unit: 'm', n: 'Bdp' },
    { k: 'plas', label: 'Luas plesteran', expr: '(2*{lm}+2*{bda}+2*{tl}+{dasarbs})*{L}', wrap: 'IF({pls}="Ya",{E},0)', unit: 'm2', n: 'Lpl' }, { k: 'acv', label: 'Luas acian', expr: '{plas}', unit: 'm2', n: 'Lac' },
    { k: 'npvc', label: 'Jumlah pipa PVC per sisi', expr: 'ROUNDUP({L}/{jp},0)+1', wrap: 'IF({pvc}="Ya",{E},0)', unit: 'buah', n: 'Np' }, { k: 'pvcm', label: 'Panjang pipa PVC 2"', expr: '2*{npvc}*(({bda}+{bdb})/2)', unit: "m'", n: 'Lpv' },
    { k: 'urug', label: 'Volume urugan sirtu sisi', expr: '2*{ul}*{ut}*{L}', wrap: 'IF({urg}="Ya",{E},0)', unit: 'm3', n: 'Vu' }, { k: 'btk', label: 'Jumlah titik bouwplank', expr: 'ROUNDUP({L}/{jb},0)+1', unit: 'titik', n: 'Nb' }, { k: 'bpm', label: 'Panjang bouwplank', expr: '{btk}*({lgal}+1)', unit: "m'", n: 'Lb' }],
  format: [
    { cat: 'A', text: 'PEKERJAAN PERSIAPAN' }, { item: 1, label: 'Pasang bouwplank', unit: "m'", key: 'bpm', lines: [{ sub: 'Jumlah titik x panjang per titik', dims: { C: '{lgal}+1', F: '{btk}' } }] },
    { cat: 'B', text: 'PEKERJAAN GALIAN DAN URUGAN' }, { item: 1, label: 'Galian tanah biasa', unit: 'm3', key: 'galv', lines: [{ sub: 'Galian saluran', dims: { C: '{L}', D: '{lgal}', E: '{gal}' } }] },
    { item: 2, label: 'Urugan pasir di bawah cor dasar', unit: 'm3', key: 'pasir', lines: [{ sub: 'Pasir urug dasar', dims: { C: '{L}', D: '{lub}', E: '{tpas}', F: `IF(${dtn},0,1)` } }] },
    { item: 3, label: 'Urugan sirtu sisi saluran (dipadatkan)', unit: 'm3', key: 'urug', lines: [{ sub: 'Urugan sisi kiri dan kanan', dims: { C: '{L}', D: '{ul}', E: '{ut}', F: 'IF({urg}="Ya",2,0)' } }] },
    { cat: 'C', text: 'PEKERJAAN PASANGAN DAN BETON' }, { item: 1, label: 'Pasangan batu belah 1 PC : 4 Ps', unit: 'm3', key: 'batu', lines: [{ sub: 'Dinding (2 sisi)', dims: { C: '{L}', D: '({bda}+{bdb})/2', E: '{td}', F: '2' } }, { sub: 'Pondasi (2 sisi)', dims: { C: '{L}', D: '({pa}+{pb})/2', E: '{tp}', F: '2' } }] },
    { item: 2, label: "Cor beton dasar saluran f'c 15 MPa", unit: 'm3', key: 'cor', lines: [{ sub: 'Cor dasar', dims: { C: '{L}', D: '{lub}', E: '{tcor}', F: `IF(${dtn},0,1)` } }] },
    { cat: 'D', text: 'PEKERJAAN PLESTERAN DAN ACIAN' }, { item: 1, label: 'Plesteran 1 PC : 3 Ps', unit: 'm2', key: 'plas', lines: [{ sub: 'Sisi dalam (miring) 2 sisi', dims: { C: '{L}', D: '{lm}', F: pl('2') } }, { sub: 'Permukaan atas 2 sisi', dims: { C: '{L}', D: '{bda}', F: pl('2') } }, { sub: 'Topi luar 2 sisi', dims: { C: '{L}', D: '{tl}', F: pl('2') } }, { sub: 'Dasar saluran (bila diplester)', dims: { C: '{L}', D: '{lub}', F: 'IF(AND({pls}="Ya",{dasar}="Cor + plester + acian"),1,0)' } }] },
    { item: 2, label: 'Acian', unit: 'm2', key: 'acv', lines: [{ sub: 'Luas sama dengan plesteran', dims: { G: '@plas' } }] },
    { cat: 'E', text: 'PEKERJAAN SANITAIR' }, { item: 1, label: 'Pasang pipa PVC 2" (panjang = lebar dinding, jarak sesuai input)', unit: "m'", key: 'pvcm', lines: [{ sub: 'Pipa weep hole 2 sisi', dims: { C: '({bda}+{bdb})/2', F: '2*{npvc}' } }] }],
  eqs: [['bpm', 'bpm'], ['galv', 'galv'], ['pasir', 'pasir'], ['urug', 'urug'], ['batu', 'batu'], ['cor', 'cor'], ['plas', 'plas'], ['acv', 'acv'], ['pvcm', 'pvcm']],
  items: X => {
    const V = X.VF, M = '{met}="Manual"';
    const GAL = [['AND({gal}<=1,{galv}<=200)', '1.2.1.1.1'], ['{gal}<=1', '1.2.1.1.2'], ['AND({gal}<=2,{galv}<=200)', '1.2.1.1.4'], ['{gal}<=2', '1.2.1.1.5'], ['AND({gal}<=3,{galv}<=200)', '1.2.1.1.6'], [null, '1.2.1.1.7']];
    return [X.simpleItem('Bouwplank', "m'", V.bpm, [[null, '1.1.4.2']]), X.simpleItem('Galian tanah biasa (sedalam s.d. 3 m)', 'm3', V.galv, GAL), X.simpleItem('Urugan pasir di bawah cor dasar', 'm3', V.pasir, [[null, '1.3.1.2']]),
      X.simpleItem('Pasangan batu belah 1 PC : 4 Ps (Mortar Tipe N)', 'm3', V.batu, [[M, '2.2.2.1.6'], [null, '2.2.2.1.7']]), X.simpleItem("Cor beton dasar saluran f'c 15 MPa", 'm3', V.cor, [[M, '2.2.1.4.3'], [null, '2.2.1.5.2']]),
      X.simpleItem('Plesteran 1 PC : 3 Ps tebal 15 mm', 'm2', V.plas, [[null, '3.7.3']]), X.simpleItem('Acian', 'm2', V.acv, [[null, '3.7.8']]), X.simpleItem('Pemasangan pipa PVC 2" (suling-suling)', "m'", V.pvcm, [[null, '2.7.2']]),
      X.simpleItem('Urugan sirtu sisi saluran (dipadatkan)', 'm3', V.urug, [[null, '1.3.2.2']])];
  }
};
