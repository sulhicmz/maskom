# Maskom

Maskom adalah situs pemasaran untuk layanan konektivitas dan managed service Maskom Network yang dibangun di atas Next.js App Router. Seluruh halaman utama ditulis dalam bahasa Indonesia dan memanfaatkan data statis TypeScript sehingga konten dapat diperbarui terpusat tanpa menyentuh komponen presentasi.

## Mulai Cepat (5 Menit)

Berikut panduan cepat untuk menjalankan proyek Maskom di lingkungan lokal:

### 1. Instalasi Dependensi

```bash
npm install
```

### 2. Konfigurasi Environment Variables (Opsional)

Untuk fitur email, salin file environment example dan konfigurasi kredensial EmailJS:

```bash
cp .env.example .env.local
```

Edit `.env.local` dan masukkan kredensial EmailJS:
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

### 3. Jalankan Server Pengembangan

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 4. Jalankan Tests (Opsional)

Verifikasi semua tests berjalan dengan baik:

```bash
npm test
```

### 5. Build Produksi

Untuk build produksi:

```bash
npm run build
npm run start
```

### Langkah Berikutnya

- [**Dokumentasi Arsitektur**](docs/blueprint.md) - Overview lengkap arsitektur dan pola desain
- [**Panduan Pengembangan**](docs/testing-guide.md) - Panduan testing dan development
- [**Panduan Komponen**](docs/component-development-guide.md) - Cara membuat dan memelihara komponen
- [**Panduan Data File**](docs/data-file-creation-guide.md) - Cara membuat dan mengelola data statis
- [**Dokumentasi API**](docs/api.md) - Dokumentasi layanan (EmailService, AuthService)
- [**Panduan Fitur**](docs/features/) - Panduan penggunaan fitur (Dark Mode, Blog, SEO)
- [**Roadmap**](docs/roadmap.md) - Rencana pengembangan fitur

## Fitur Utama
- **Runtime edge** dengan `export const runtime = 'edge'` sehingga build Next.js dapat dijalankan di Cloudflare Workers. Beberapa halaman menggunakan runtime nodejs untuk kompatibilitas dengan OpenNext Cloudflare deployment. 【F:src/app/layout.tsx†L1-L33】
- **Layout reusable** melalui `Wrapper` yang menambahkan `ScrollToTop`, `ToastContainer`, dan `ErrorBoundary` untuk interaksi global yang konsisten dan penanganan error yang elegan. 【F:src/layouts/Wrapper.tsx†L1-L15】
- **Navigasi data-driven** dari `src/data/MenuData.ts` sehingga struktur menu dapat dimodifikasi tanpa perubahan komponen. 【F:src/data/MenuData.ts†L1-L38】
- **Section berbasiskan data** (mis. proses kerja, paket harga, testimoni) yang dibaca dari berkas `src/data/*.ts` dengan validasi runtime yang komprehensif. 【F:src/components/homes/home-one/Process.tsx†L1-L37】【F:src/components/homes/home-one/Price.tsx†L1-L68】
- **Integrasi pihak ketiga** untuk animasi (Swiper, Isotope), pengiriman email (EmailJS), serta notifikasi (React Toastify) dengan pattern resiliensi (timeout, retry, circuit breaker, rate limiting). 【F:src/components/homes/home-two/Gallery.tsx†L1-L69】【F:src/components/forms/ContactForm.tsx†L1-L58】
- **Optimasi CSS** dengan loading Bootstrap dan FontAwesome dari CDN (jsDelivr/Cloudflare) untuk edge delivery yang lebih cepat, serta lazy loading CSS untuk komponen yang hanya dibutuhkan saat interaksi. 【F:src/styles/index.scss†L1-L10】
- **Service layer abstraksi** untuk EmailService dan AuthService dengan pattern resiliensi yang komprehensif, memudahkan integrasi backend nyata di masa depan. 【F:src/services/email/EmailService.ts†L1-L58】【F:src/services/auth/AuthService.ts†L1-L120】
- **Validasi data terpusat** dengan 21 validator untuk semua tipe data, memastikan integritas data di build-time dan runtime. 【F:src/utils/dataValidation.ts†L1-L400】

## Struktur Proyek
```
src/
├── app/                # Route Next.js (App Router) termasuk halaman turunan
├── components/         # Komponen per kategori (homes, pages, common, forms, dll.)
├── data/               # Sumber data statis TypeScript dengan validasi runtime
├── hooks/              # Custom hook (mis. UseSticky, useFormSubmission)
├── layouts/            # Header, footer, wrapper dengan ErrorBoundary dan ToastContainer
├── modals/             # Komponen modal
├── services/           # Service layer abstraksi (EmailService, AuthService)
├── test-utils/         # Utilitas testing terpusat (helpers, mocks, fixtures, matchers)
├── types/              # Type definitions terpusat
├── utils/              # Utilitas umum (validation, rateLimiter, resilience, data*)
└── styles/             # Entry point SCSS yang mengimpor dari CDN
public/
├── _headers            # Aturan caching & header keamanan untuk Cloudflare Workers
└── assets/             # Gambar, SCSS, dan aset statis
```

> Catatan: Path alias `@/*` menunjuk ke `./src/*` dan `@/assets/*` ke `./public/assets/*` sebagaimana didefinisikan di `tsconfig.json`. 【F:tsconfig.json†L4-L26】

## Persiapan Lingkungan
1. Pastikan menggunakan Node.js >= 22.0.0 dan npm versi terkini (sesuai package.json engines).
2. Instal dependensi: `npm install`
3. Salin `.env.example` (jika tersedia) ke `.env.local` dan isi kredensial EmailJS produksi (`NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`). Kredensial EmailJS sekarang dimuat dari variabel lingkungan.
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
- Entry SCSS berada di `src/styles/index.scss` dan mengimpor Bootstrap dan FontAwesome dari CDN (jsDelivr/Cloudflare) untuk edge delivery dan browser caching yang lebih baik. 【F:src/styles/index.scss†L1-L10】
- CSS on-demand loading untuk komponen seperti Toastify yang hanya dimuat saat dibutuhkan, mengurangi initial page load. 【F:src/layouts/Wrapper.tsx†L1-L30】
- Aset gambar berada di `public/assets/images/*` dan diimpor melalui alias `@/assets/...` agar konsisten dengan konfigurasi Next.js. 【F:src/components/homes/home-one/Hero.tsx†L1-L16】
- Header HTTP untuk caching, keamanan, dan CORS disetel melalui `public/_headers`. Sesuaikan origin CORS bila menjalankan di domain berbeda. 【F:public/_headers†L1-L27】

## Deployment ke Cloudflare Workers
1. Jalankan `npm run preview` untuk menghasilkan output OpenNext pada `.open-next/` dan memulai `wrangler dev` (membutuhkan login Wrangler).
2. Gunakan `npm run deploy` untuk build dan deploy. Konfigurasi worker ada pada `wrangler.toml` dengan binding aset `ASSETS`. 【F:wrangler.toml†L1-L9】
3. `open-next.config.ts` menggunakan konfigurasi default `defineCloudflareConfig()`. Sesuaikan bila membutuhkan binding tambahan. 【F:open-next.config.ts†L1-L3】

## Dokumentasi & Operasi
- [docs/architecture/ADR-0001-worker-stack.md](docs/architecture/ADR-0001-worker-stack.md) — keputusan arsitektur worker & Next.js
- [docs/blueprint.md](docs/blueprint.md) — overview arsitektur lengkap & pola desain
- [docs/api.md](docs/api.md) — dokumentasi API lengkap untuk layanan (EmailService, AuthService)
 - [docs/testing-guide.md](docs/testing-guide.md) — panduan pengujian lengkap (2724 tes)
- [docs/task.md](docs/task.md) — tracking tugas dan peningkatan arsitektur
- [docs/roadmap.md](docs/roadmap.md) — roadmap pengembangan fitur
- [docs/content_plan.md](docs/content_plan.md) — perencanaan konten
- [docs/operations/performance-playbook.md](docs/operations/performance-playbook.md) — strategi optimasi performa terkini
- [docs/operations/known-issues.md](docs/operations/known-issues.md) — daftar isu yang perlu ditindaklanjuti
- [docs/operations/continuous-development.md](docs/operations/continuous-development.md) — panduan menjaga pengembangan berkelanjutan
- [docs/project_management/](docs/project_management/) — proses dan aturan manajemen proyek
- [docs/history/2024-remediation-log.md](docs/history/2024-remediation-log.md) — catatan iterasi perbaikan sebelumnya

Perbarui dokumentasi di atas setiap kali ada perubahan arsitektur, dependensi, atau proses operasional baru.

## Validasi Data
- Semua data statis di `src/data/` divalidasi menggunakan utilitas di `src/utils/dataValidation.ts`
- 21 validator mencakup: FeedbackItem, FaqItem, PriceItem, MenuItem, TeamMember, dll
- Data indexing untuk O(1) lookup dan relationship management untuk integritas referensial
  - Jalankan `npm test` untuk memastikan semua validasi berjalan dengan benar (3575 tes total)
- Lihat [docs/blueprint.md](docs/blueprint.md#data-validation--completed---task-40-phase-1) untuk detail lengkap

## Layanan (Services)
- **EmailService** (`src/services/email/`): Mengelola pengiriman email dengan EmailJS dan pattern resiliensi (timeout, retry, circuit breaker, rate limiting)
- **AuthService** (`src/services/auth/`): Menangani autentikasi user dengan mock implementation yang siap untuk integrasi backend nyata (Auth0, Firebase, NextAuth, atau custom)
- **Rate Limiting**: Proteksi terhadap brute force attacks dan abuse untuk email, login, dan register operations
- Lihat [docs/api.md](docs/api.md) untuk dokumentasi API lengkap dan contoh penggunaan

## Kontribusi
1. Fork repository dan buat branch fitur baru
2. Pastikan semua tes lulus: `npm test`
3. Jalankan linting: `npm run lint`
4. Buat pull request dengan deskripsi perubahan yang jelas

## Troubleshooting
- **Tes gagal dengan "module not found"**: Jalankan `npm install` untuk memastikan semua dependensi terinstal
- **Build gagal di Cloudflare Workers**: Periksa `public/_headers` untuk konfigurasi CORS yang benar
- **Email tidak terkirim**: Pastikan variabel lingkungan `NEXT_PUBLIC_EMAILJS_*` diatur di `.env.local` dan rate limiting belum terpenuhi
- **Auth login/register gagal dengan rate limit**: Tunggu cooldown period (30 menit untuk login, 2 jam untuk register) atau gunakan admin reset function
- **WOW animasi tidak berfungsi**: Ini adalah isu yang diketahui, lihat [docs/operations/known-issues.md](docs/operations/known-issues.md) untuk detail
- **Error boundary muncul**: Cek error ID di console dan lihat log error untuk debugging, gunakan opsi "Muat Ulang Halaman" atau "Coba Lagi" untuk pemulihan
