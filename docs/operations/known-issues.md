# Masalah yang Diketahui (Known Issues)

Dokumen ini mencatat isu aktual pada kode Maskom berikut rekomendasi penanganan.

## 1. Kredensial EmailJS Ditanam Langsung di Kode - [TERATASI]
- **Status**: Teratasi melalui pemindahan ke konfigurasi lingkungan
- **Detail**: `ContactForm` sebelumnya memanggil `emailjs.sendForm` dengan service, template, dan public key yang ditulis langsung dalam repository. Sekarang menggunakan environment variables dari `src/config/env.ts`. 【F:src/components/forms/ContactForm.tsx†L1-L60】
- **Dampak**: Risiko kebocoran kredensial telah diminimalisir.
- **Aksi**: Gunakan `wrangler secret put` untuk mengatur kredensial di produksi.

## 2. Header CORS Mengunci ke Domain Produksi
- **Detail**: `public/_headers` membatasi `Access-Control-Allow-Origin` hanya ke `https://maskom.co.id`. 【F:public/_headers†L11-L21】
- **Dampak**: Permintaan lintas origin (mis. staging, preview Workers) akan ditolak browser.
- **Aksi**: Tambahkan daftar origin yang valid atau gunakan wildcard terkontrol saat pengujian.

## 3. Animasi WOW Tidak Terinisialisasi - [TERATASI]
- **Status**: Teratasi melalui inisialisasi di `Wrapper` komponen
- **Detail**: Komponen menggunakan kelas `wow fadeIn*` (contoh pada hero landing page) sekarang diinisialisasi melalui `src/utils/wow-init.ts` yang dipanggil di `Wrapper` komponen. 【F:src/layouts/Wrapper.tsx†L1-L27】
- **Dampak**: Animasi scroll sekarang berfungsi sebagaimana mestinya.
- **Aksi**: Tidak diperlukan lagi.

## 4. Metadata & Konten Halaman Turunan Masih Template - [TERATASI]
- **Status**: Teratasi melalui pembaruan metadata di halaman terkait
- **Detail**: Beberapa halaman masih memakai judul dan deskripsi bawaan template AIcraft. Contoh: `app/home-two/page.tsx` dan `app/[...not-found]/page.tsx`. 【F:src/app/home-two/page.tsx†L1-L13】【F:src/app/[...not-found]/page.tsx†L1-L15】
- **Dampak**: Branding tidak konsisten dan SEO tidak akurat ketika halaman diindeks.
- **Aksi**: Lokalisasi metadata & isi setiap halaman sebelum publikasi.

## 5. Komponen Offcanvas Lama Tidak Sinkron dengan Navigasi - [TERATASI]
- **Status**: Teratasi melalui sinkronisasi dengan `MenuData`
- **Detail**: `src/layouts/headers/Menu/Offcanvas.tsx` sekarang menggunakan data dari `MenuData.ts` untuk menampilkan menu navigasi yang konsisten. 【F:src/layouts/headers/Menu/Offcanvas.tsx†L1-L82】
- **Dampak**: Menu navigasi sekarang konsisten di semua komponen.
- **Aksi**: Tidak diperlukan lagi.

Jika Anda menemukan masalah baru:
1. Verifikasi apakah sudah terdaftar pada dokumen ini.
2. Laporkan melalui issue tracker dengan langkah reproduksi, informasi lingkungan, dan tangkapan layar bila perlu.
3. Setelah perbaikan, perbarui status atau hapus entri yang sudah tidak relevan.
