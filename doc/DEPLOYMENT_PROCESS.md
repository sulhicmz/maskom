# Proses Deployment

Dokumen ini menjelaskan proses deployment untuk situs web maskom.co.id, yang menggunakan Cloudflare Pages untuk hosting dan GitHub Actions untuk CI/CD.

## 1. Prasyarat

Sebelum melakukan deployment, pastikan Anda memiliki:
- Akun [Cloudflare](https://www.cloudflare.com/) dengan akses ke Pages.
- Repositori GitHub untuk proyek ini.
- API Token Cloudflare dengan izin yang sesuai.
- Account ID Cloudflare Anda.

## 2. Proses Build

Proses build ditangani oleh Next.js dan dikonfigurasi dalam `next.config.ts`.

- **Perintah Build**:
  ```bash
  npm run build
  ```
- **Direktori Output**: Build akan menghasilkan output di direktori `.next`.
- **Konfigurasi**: `next.config.ts` diatur untuk `output: 'standalone'` yang mengoptimalkan build untuk lingkungan seperti Cloudflare Pages. Optimasi gambar dinonaktifkan di Next.js karena akan ditangani oleh Cloudflare.

## 3. Deployment ke Cloudflare Pages

Deployment diotomatisasi menggunakan GitHub Actions. Workflow didefinisikan dalam file `.github/workflows/deploy.yml`.

### Alur Kerja Deployment:
1.  **Trigger**: Deployment otomatis terpicu setiap kali ada `push` ke branch `main`.
2.  **Setup**: Lingkungan build disiapkan, dan dependensi proyek diinstal menggunakan `npm install`.
3.  **Build**: Perintah `npm run build` dijalankan untuk membuat versi produksi dari situs.
4.  **Deploy**: Hasil build dari direktori `.next` di-deploy ke Cloudflare Pages menggunakan action resmi dari Cloudflare.

### Konfigurasi di Cloudflare:
- **Proyek Pages**: Hubungkan repositori GitHub Anda ke proyek Cloudflare Pages.
- **Pengaturan Build**:
  - **Framework**: Next.js
  - **Build command**: `npm run build`
  - **Build output directory**: `.next`
- **Variabel Lingkungan**: Konfigurasikan variabel lingkungan (misalnya, untuk EmailJS) di pengaturan Cloudflare Pages untuk lingkungan produksi.

## 4. Konfigurasi Spesifik Lingkungan

Proyek ini mendukung beberapa lingkungan:
- **`.env.development`**: Untuk pengembangan lokal.
- **`.env.preview`**: Untuk lingkungan preview/staging di Cloudflare.
- **`.env.production`**: Untuk lingkungan produksi.

Pastikan variabel yang sesuai diatur di dasbor Cloudflare Pages untuk setiap lingkungan.

## 5. Prosedur Rollback

Cloudflare Pages menyediakan fungsionalitas rollback yang mudah.
1.  Buka dasbor proyek Cloudflare Pages Anda.
2.  Navigasi ke tab "Deployments".
3.  Anda akan melihat daftar semua deployment yang telah dilakukan.
4.  Untuk melakukan rollback, cukup klik pada deployment sebelumnya yang stabil dan pilih opsi untuk "Redeploy" atau "Rollback to this deployment".
