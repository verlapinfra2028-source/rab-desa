# Aplikasi RAB Desa (Kabupaten Gresik)

Membuat satu file Excel berisi **Sampul, Master Data Pekerjaan, Master Koefisien AHSP, Harga Satuan, AHSP, RAB, RAB Swakelola, Backup Volume, Gambar, dan Rekap Kebutuhan** dari isian sederhana.
Koefisien: SE Dirjen Bina Konstruksi No. 47/SE/Dk/2026, Lampiran VI (Cipta Karya).

Jenis pekerjaan: drainase batu kali, drainase U-ditch, jalan paving, jalan cor beton, TPT/plengsengan, jembatan box culvert, jembatan cor beton.

## Menerbitkan di GitHub Pages (gratis)

1. Buat akun dan repositori baru di github.com (misalnya `rab-desa`).
2. Unggah **seluruh isi folder ini** ke repositori (tombol *Add file > Upload files*).
3. Buka *Settings > Pages*. Pada *Build and deployment*, pilih *Deploy from a branch*, cabang `main`, folder **`/docs`**, lalu *Save*.
4. Tunggu 1-2 menit. Alamat aplikasi: `https://NAMA-AKUN.github.io/rab-desa/`.

Seluruh perhitungan berjalan di browser pengguna. Tidak ada server dan tidak ada data yang dikirim ke mana pun.

## Struktur

| Folder / berkas | Isi |
|---|---|
| `docs/` | Aplikasi jadi (halaman web) yang diterbitkan GitHub Pages |
| `web/` | Kode halaman web (formulir dan unduhan) |
| `src/engine.js`, `core.js`, `core2.js`, `out.js`, `gambar.js` | Mesin pembuat Excel |
| `src/specs/*.js` | Spesifikasi tiap jenis pekerjaan (isian, rumus volume, pilihan AHSP) |
| `src/draw.js`, `drawings*.js`, `images.js` | Gambar parametris (tampak atas, potongan, detail) |
| `data/` | Data koefisien AHSP yang dipakai, indeks halaman PDF, logo |
| `build_web.js` | Membuat ulang folder `docs/` |
| `run.js` | Membuat contoh file Excel dari terminal (untuk uji) |
| `web_test.js` | Uji ujung-ke-ujung formulir web |

## Mengubah atau menambah jenis pekerjaan

Semua perilaku ada di satu berkas spesifikasi per jenis (`src/specs/<jenis>.js`): daftar isian, rumus volume, tabel Backup Volume, dan analisa yang dipakai.
Untuk membuat ulang halaman web setelah mengubah spesifikasi:

```
npm install
npm run build
```

lalu unggah ulang folder `docs/` ke GitHub.

## Catatan penting

- Hasil Excel berisi **rumus**. Excel/WPS/Google Sheets menghitungnya saat dibuka. Pratinjau di aplikasi chat mungkin menampilkan sel kosong sebelum dibuka di Excel.
- Harga satuan **tidak** diisi otomatis. Isi kolom *Harga Survey* di sheet *Harga Satuan*.
- Analisa bertanda **TURUNAN** (kanstin 15x25, wiremesh M8, dowel besi ulir) bukan dari SE; ganti bila ada koefisien resmi.
- Gambar dibuat dari ukuran yang diisi di formulir. Bila ukuran diubah langsung di Excel, gambar tidak ikut berubah.
