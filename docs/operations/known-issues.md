# Masalah yang Diketahui (Known Issues)

Dokumen ini mencatat isu aktual pada kode Maskom berikut rekomendasi penanganan.

## 1. Kredensial EmailJS Ditanam Langsung di Kode
- **Detail**: `ContactForm` memanggil `emailjs.sendForm` dengan service, template, dan public key yang ditulis langsung dalam repository. 【F:src/components/forms/ContactForm.tsx†L1-L45】
- **Dampak**: Menyulitkan rotasi kredensial dan menimbulkan risiko penyalahgunaan ketika repository bersifat publik.
- **Aksi**: Pindahkan nilai ke variabel lingkungan (`process.env`) dan muat dari konfigurasi runtime Cloudflare (`wrangler secret put`).

## 2. Header CORS Mengunci ke Domain Produksi
- **Detail**: `public/_headers` membatasi `Access-Control-Allow-Origin` hanya ke `https://maskom.co.id`. 【F:public/_headers†L11-L21】
- **Dampak**: Permintaan lintas origin (mis. staging, preview Workers) akan ditolak browser.
- **Aksi**: Tambahkan daftar origin yang valid atau gunakan wildcard terkontrol saat pengujian.

## 3. Animasi WOW Tidak Terinisialisasi
- **Detail**: Banyak komponen menggunakan kelas `wow fadeIn*` (contoh pada hero landing page), tetapi tidak ada inisialisasi `new WOW().init()` di kode React. 【F:src/components/homes/home-one/Hero.tsx†L13-L26】
- **Dampak**: Animasi scroll tidak berjalan walaupun stylesheet `animate.css` sudah diimpor melalui `src/styles/index.scss`. 【F:src/styles/index.scss†L1-L10】
- **Aksi**: Tambahkan inisialisasi WOW pada efek klien (mis. di `Wrapper` atau komponen khusus) atau ganti kelas `wow` dengan animasi CSS lain.

## 4. Metadata & Konten Halaman Turunan Masih Template
- **Detail**: Beberapa halaman masih memakai judul dan deskripsi bawaan template AIcraft. Contoh: `app/home-two/page.tsx` dan `app/[...not-found]/page.tsx`. 【F:src/app/home-two/page.tsx†L1-L13】【F:src/app/[...not-found]/page.tsx†L1-L15】
- **Dampak**: Branding tidak konsisten dan SEO tidak akurat ketika halaman diindeks.
- **Aksi**: Lokalisasi metadata & isi setiap halaman sebelum publikasi.

## 5. Komponen Offcanvas Lama Tidak Sinkron dengan Navigasi
- **Detail**: `src/layouts/headers/Menu/Offcanvas.tsx` masih berisi daftar menu template (Project, Help Desk, dll.) dan tidak terhubung dengan `MenuData`. 【F:src/layouts/headers/Menu/Offcanvas.tsx†L1-L74】
- **Dampak**: Potensi kebingungan bila komponen someday diaktifkan kembali atau tersisa di bundle.
- **Aksi**: Sinkronkan isi menu dengan `MenuData` atau hapus komponen bila tidak digunakan.

Jika Anda menemukan masalah baru:
1. Verifikasi apakah sudah terdaftar pada dokumen ini.
2. Laporkan melalui issue tracker dengan langkah reproduksi, informasi lingkungan, dan tangkapan layar bila perlu.
3. Setelah perbaikan, perbarui status atau hapus entri yang sudah tidak relevan.
