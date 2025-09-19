# Cloudflare Deployment Pipeline untuk Maskom.co.id

Dokumen ini menjelaskan konfigurasi dan proses deployment untuk website maskom.co.id menggunakan Cloudflare Pages dan Workers.

## Struktur Konfigurasi

### 1. Wrangler.toml (Cloudflare Workers)
File konfigurasi untuk Cloudflare Workers yang mengatur:
- Nama worker
- File entry point
- Tanggal kompatibilitas
- Variabel lingkungan untuk berbagai environment
- Routes untuk API endpoints

### 2. TypeScript Configuration (tsconfig.worker.json)
Konfigurasi TypeScript khusus untuk Cloudflare Workers yang mengatur:
- Target dan library yang sesuai untuk environment worker
- Module resolution untuk Cloudflare Workers
- Type definitions untuk Cloudflare Workers API
- Isolated modules untuk kompatibilitas dengan worker environment

### 3. GitHub Actions Workflow (.github/workflows/deploy.yml)
Workflow CI/CD yang mengatur:
- Trigger deployment saat push ke branch main
- Instalasi dependensi
- Linting dan testing
- Build project
- Deployment ke Cloudflare Pages

### 4. Konfigurasi Next.js (next.config.ts)
Konfigurasi khusus untuk Cloudflare Pages:
- Output standalone untuk optimalisasi
- Disable image optimization (ditangani oleh Cloudflare)
- Konfigurasi webpack untuk mengurangi ukuran bundle

### 5. Environment Variables
File environment variables untuk berbagai lingkungan:
- `.env.development` - Lingkungan development
- `.env.preview` - Lingkungan preview/staging
- `.env.production` - Lingkungan production

File-file ini sekarang diizinkan dalam repository karena sudah diatur dalam `.gitignore` untuk tidak diabaikan.

## Proses Deployment

### 1. Setup Awal
1. Buat project di Cloudflare Pages Dashboard
2. Hubungkan repository GitHub dengan Cloudflare Pages
3. Konfigurasi build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Root directory: `/`

### 2. Konfigurasi Secrets di GitHub
Tambahkan secrets berikut di GitHub repository settings:
- `CLOUDFLARE_API_TOKEN` - API token dengan permissions untuk deploy
- `CLOUDFLARE_ACCOUNT_ID` - Account ID Cloudflare
- `GITHUB_TOKEN` - Token GitHub untuk deployments

### 3. Custom Domain
1. Tambahkan domain maskom.co.id di Cloudflare Pages settings
2. Konfigurasi DNS records di Cloudflare dashboard:
   - CNAME record untuk root domain yang mengarah ke URL Cloudflare Pages
   - Redirect www ke non-www (atau sebaliknya) jika diperlukan

### 4. SSL Certificate
Cloudflare secara otomatis menyediakan SSL certificate untuk custom domain yang dikonfigurasi.

## Cloudflare Workers

### 1. Fungsi Worker
Worker digunakan untuk:
- Menangani CORS headers untuk API requests
- Menambahkan security headers
- Routing untuk API endpoints
- Implementasi caching strategies

### 2. Deploy Worker
Untuk deploy worker secara manual:
```bash
npx wrangler deploy
```

### 3. Environment Variables untuk Worker
Worker menggunakan environment variables yang didefinisikan di wrangler.toml:
- `NODE_ENV` - Menentukan lingkungan (development/preview/production)
- `API_URL` - URL untuk API endpoints

## Optimasi Performa

### 1. Caching
- Cloudflare Pages secara otomatis mengatur caching headers
- Asset statis dikompresi dan disimpan di CDN
- Konfigurasi caching kustom melalui file `public/_headers`

### 2. Image Optimization
- Next.js image optimization dinonaktifkan karena Cloudflare menangani ini
- Gunakan komponen Image dari Next.js untuk optimalisasi

### 3. Automatic Platform Optimization (APO)
- Aktifkan APO di Cloudflare dashboard untuk optimalisasi tambahan
- Konfigurasi cache rules untuk konten dinamis

## Monitoring dan Logging

### 1. Cloudflare Analytics
- Gunakan dashboard Cloudflare untuk memantau traffic dan performa
- Monitor cache hit ratio dan bandwidth usage

### 2. GitHub Deployments
- Setiap deployment akan muncul di GitHub repository deployments
- Status deployment dapat dilihat di pull requests

## Pengujian

### 1. Pengujian Lokal
Untuk menguji worker secara lokal:
```bash
npx wrangler dev
```

### 2. Pengujian Integrasi
- Gunakan Cloudflare Pages preview deployments untuk menguji perubahan sebelum production
- Pastikan semua halaman dapat diakses dengan benar
- Uji fitur API endpoints jika ada

### 3. Pengujian Performa
- Gunakan tools seperti Lighthouse untuk menguji performa website
- Monitor loading times dan Core Web Vitals
- Uji responsiveness di berbagai perangkat

## Troubleshooting

### 1. Build Failures
- Periksa logs di GitHub Actions untuk error details
- Pastikan semua dependencies terinstal dengan benar
- Periksa konfigurasi next.config.ts

### 2. Deployment Issues
- Periksa Cloudflare Pages dashboard untuk error deployment
- Pastikan CNAME records sudah dikonfigurasi dengan benar
- Periksa custom domain status di Cloudflare Pages settings

### 3. Runtime Errors
- Gunakan Cloudflare Workers untuk debugging server-side
- Periksa browser console untuk client-side errors
- Gunakan logging dalam kode untuk tracing issues

### 4. Worker Issues
- Periksa worker logs di Cloudflare dashboard
- Pastikan routes sudah dikonfigurasi dengan benar
- Verifikasi environment variables di wrangler.toml

## Maintenance

### 1. Updates
- Lakukan updates pada dependencies secara berkala
- Perbarui wrangler.toml saat ada perubahan konfigurasi worker
- Review dan update workflow GitHub Actions jika diperlukan

### 2. Monitoring
- Set up alerts untuk downtime atau performance issues
- Monitor usage metrics untuk capacity planning
- Regular review of analytics data untuk insights