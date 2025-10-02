# Panduan Deployment untuk Maskom Network

## Persiapan Sebelum Deployment

### 1. Konfigurasi GitHub Secrets
Untuk deployment otomatis melalui GitHub Actions, Anda perlu menyiapkan secrets berikut di repository settings:

- `CF_API_TOKEN`: Cloudflare API token dengan izin untuk mengelola Workers
- `CF_ACCOUNT_ID`: Cloudflare Account ID untuk deployment

### 2. Verifikasi Wrangler Configuration
File `wrangler.toml` sudah disiapkan dengan konfigurasi untuk environment development, preview, dan production.

## Cara Men-trigger Deployment

### 1. Deployment Otomatis (Rekomended)
Deployment akan otomatis terjadi ketika:
- Kode di-push ke branch `main` - akan deploy ke production
- Pull request dibuat - akan deploy ke preview environment

### 2. Deployment Manual (Jika diperlukan)
Jika perlu melakukan deployment manual, Anda dapat:

1. Push perubahan ke branch `main` untuk production deployment
2. Atau jalankan deployment melalui Cloudflare dashboard secara manual

## Target Deployment

### Production Environment
- Worker name: `maskom`
- Route: `https://maskom.sulhi.workers.dev`
- Domain: `https://maskom.co.id` (jika terkonfigurasi)

### Preview Environment
- Worker name: `maskom-preview`
- Route: `https://maskom-preview.your-subdomain.workers.dev`

### Development Environment
- Worker name: `maskom-dev`
- Route: `https://maskom-dev.your-subdomain.workers.dev`

## Proses Deployment

1. GitHub Actions akan:
   - Checkout kode terbaru
   - Install dependencies
   - Build aplikasi menggunakan `@opennextjs/cloudflare`
   - Deploy ke Cloudflare Workers sesuai environment

2. Deployment akan menggunakan:
   - `next.config.ts` untuk konfigurasi Next.js
   - `open-next.config.ts` untuk konfigurasi OpenNext
   - `wrangler.toml` untuk konfigurasi Cloudflare Workers

## Verifikasi Setelah Deployment

Setelah deployment selesai:

1. Kunjungi `https://maskom.sulhi.workers.dev` untuk memastikan konten yang ditampilkan adalah Maskom Network, bukan template AI writer
2. Periksa beberapa halaman penting: home, about, pricing, contact
3. Pastikan semua fungsionalitas berjalan dengan baik
4. Verifikasi branding dan SEO sesuai dengan Maskom Network

## Troubleshooting

Jika deployment gagal:
1. Periksa GitHub Actions logs untuk detail error
2. Pastikan Cloudflare secrets sudah di-set dengan benar
3. Pastikan Account ID dan konfigurasi wrangler.toml valid

## Rollback

Jika terjadi masalah dengan deployment baru:
1. Identifikasi commit yang berfungsi sebelumnya
2. Revert ke commit tersebut atau gunakan backup
3. Deployment akan otomatis menggunakan kode yang baru direvert