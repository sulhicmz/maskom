# Maskom

Maskom adalah situs pemasaran untuk layanan konektivitas dan managed service Maskom Network yang dibangun di atas Next.js App Router. Seluruh halaman utama ditulis dalam bahasa Indonesia dan memanfaatkan data statis TypeScript sehingga konten dapat diperbarui terpusat tanpa menyentuh komponen presentasi.

## Fitur Utama
- **Runtime edge** dengan `export const runtime = 'edge'` sehingga build Next.js dapat dijalankan di Cloudflare Workers. 【F:src/app/layout.tsx†L1-L33】
- **Layout reusable** melalui `Wrapper` yang menambahkan `ScrollToTop` dan `ToastContainer` agar interaksi global tetap konsisten. 【F:src/layouts/Wrapper.tsx†L1-L15】
- **Navigasi data-driven** dari `src/data/MenuData.ts` sehingga struktur menu dapat dimodifikasi tanpa perubahan komponen. 【F:src/data/MenuData.ts†L1-L38】
- **Section berbasiskan data** (mis. proses kerja, paket harga, testimoni) yang dibaca dari berkas `src/data/*.ts`. 【F:src/components/homes/home-one/Process.tsx†L1-L37】【F:src/components/homes/home-one/Price.tsx†L1-L68】
- **Integrasi pihak ketiga** untuk animasi (Swiper, Isotope), pengiriman email (EmailJS), serta notifikasi (React Toastify). 【F:src/components/homes/home-two/Gallery.tsx†L1-L69】【F:src/components/forms/ContactForm.tsx†L1-L58】

## Struktur Proyek
```
src/
├── app/                # Route Next.js (App Router) termasuk halaman turunan
├── components/         # Komponen per kategori (homes, pages, common, forms, dll.)
├── data/               # Sumber data statis TypeScript
├── hooks/              # Custom hook (mis. UseSticky)
├── layouts/            # Header, footer, wrapper
├── modals/             # Komponen modal
└── styles/             # Entry point SCSS yang mengimpor aset publik
public/
├── _headers            # Aturan caching & header keamanan untuk Cloudflare Workers
└── assets/             # Gambar, font, vendor JS/SCSS
```

> Catatan: Path alias `@/*` menunjuk ke `./src/*` dan `@/assets/*` ke `./public/assets/*` sebagaimana didefinisikan di `tsconfig.json`. 【F:tsconfig.json†L4-L26】

## Persiapan Lingkungan
1. Pastikan menggunakan Node.js 20.x dan npm 10.x (sesuai pipeline proyek).
2. Instal dependensi: `npm install`
3. Salin `.env.example` (jika tersedia) ke `.env.local` dan isi kredensial EmailJS produksi (`EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`). Kredensial sementara saat ini masih ditulis langsung di `ContactForm`. 【F:src/components/forms/ContactForm.tsx†L1-L45】
4. Untuk pratinjau Cloudflare, instal Wrangler (`npm install -g wrangler`) bila belum tersedia.

## Perintah Pengembangan
| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server Next.js di `http://localhost:3000` |
| `npm run build` | Build produksi Next.js |
| `npm run start` | Menjalankan hasil build secara lokal |
| `npm run lint` | Menjalankan ESLint konfigurasi Next.js |
| `npx tsc --noEmit` | Memeriksa tipe TypeScript tanpa menghasilkan berkas |
| `npm run analyze` | Menjalankan `@next/bundle-analyzer` (memerlukan variabel `ANALYZE=true`) |
| `npm run preview` | Build menggunakan OpenNext dan menjalankan pratinjau Workers |
| `npm run deploy` | Build OpenNext dan deploy ke Cloudflare Workers |

## Panduan Konten & Data
- Komponen rumah utama (`HomeOne`) memuat header, hero, benefit, proses, paket harga, testimoni, FAQ, hingga CTA dalam urutan yang sama dengan landing page produksi. 【F:src/components/homes/home-one/index.tsx†L1-L32】
- Data proses, paket harga, dan konten lain diseleksi dengan filter `page` sehingga dapat digunakan ulang di halaman lain (mis. halaman pricing). 【F:src/components/homes/home-one/Process.tsx†L17-L31】【F:src/data/PriceData.ts†L1-L112】
- Komponen `Gallery` menggunakan Isotope untuk filter kategori dan membutuhkan DOM karena dipasang di sisi klien. Pastikan `window` tersedia sebelum inisialisasi. 【F:src/components/homes/home-two/Gallery.tsx†L1-L61】
- Navigasi sticky dan tombol kembali ke atas memanfaatkan hook `UseSticky` untuk mendeteksi scroll >200px. 【F:src/hooks/UseSticky.ts†L1-L28】【F:src/components/common/ScrollToTop.tsx†L1-L32】

## Styling & Aset
- Entry SCSS berada di `src/styles/index.scss` dan mengimpor Bootstrap, font, animasi WOW, serta `public/assets/scss/style.scss`. 【F:src/styles/index.scss†L1-L10】
- Aset gambar berada di `public/assets/images/*` dan diimpor melalui alias `@/assets/...` agar konsisten dengan konfigurasi Next.js. 【F:src/components/homes/home-one/Hero.tsx†L1-L16】
- Header HTTP untuk caching, keamanan, dan CORS disetel melalui `public/_headers`. Sesuaikan origin CORS bila menjalankan di domain berbeda. 【F:public/_headers†L1-L27】

## Deployment ke Cloudflare Workers
1. Jalankan `npm run preview` untuk menghasilkan output OpenNext pada `.open-next/` dan memulai `wrangler dev` (membutuhkan login Wrangler).
2. Gunakan `npm run deploy` untuk build dan deploy. Konfigurasi worker ada pada `wrangler.toml` dengan binding aset `ASSETS`. 【F:wrangler.toml†L1-L9】
3. `open-next.config.ts` menggunakan konfigurasi default `defineCloudflareConfig()`. Sesuaikan bila membutuhkan binding tambahan. 【F:open-next.config.ts†L1-L3】

## Dokumentasi Tambahan
- [docs/ADR-0001-worker-stack.md](docs/ADR-0001-worker-stack.md) — keputusan arsitektur worker & Next.js
- [doc/PERFORMANCE_OPTIMIZATION.md](doc/PERFORMANCE_OPTIMIZATION.md) — strategi optimasi performa
- [doc/KNOWN_ISSUES.md](doc/KNOWN_ISSUES.md) — daftar isu yang perlu ditindaklanjuti

Silakan perbarui dokumentasi ini apabila ada perubahan arsitektur, dependensi, atau proses operasional baru.
