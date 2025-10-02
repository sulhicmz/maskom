# Rencana Deployment untuk Memperbaiki Situs Maskom

## Masalah Utama
Situs live maskom.sulhi.workers.dev saat ini menampilkan template AI writer dari AIcraft, bukan konten Maskom Network yang sebenarnya. Kode sumber di repository berisi kerangka situs Maskom Network dengan fokus pada layanan konektivitas dan managed service.

## Analisis Situasi
1. **Kode sumber**: Berisi konten Maskom Network (halaman home, about, pricing, dll.)
2. **Situs live**: Menampilkan template AI writer dari AIcraft
3. **Kesimpulan**: Deployment sebelumnya tidak menggunakan kode sumber yang benar atau ada konfigurasi yang menyebabkan template salah digunakan

## Rencana Deployment Ulang

### 1. Persiapan Konfigurasi
Karena file `wrangler.toml` tidak ditemukan di repository (kemungkinan karena berisi informasi sensitif), berikut adalah konfigurasi yang diperlukan:

```toml
name = "maskom"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.development]
name = "maskom-dev"
account_id = "your-account-id-here"
routes = ["https://maskom-dev.your-subdomain.workers.dev"]

[env.preview]
name = "maskom-preview"
account_id = "your-account-id-here"
routes = ["https://maskom-preview.your-subdomain.workers.dev"]

[env.production]
name = "maskom"
account_id = "your-account-id-here"
routes = [
  "https://maskom.sulhi.workers.dev",
  "https://maskom.co.id/*"
]

[env.production.vars]
NEXT_PUBLIC_SITE_URL = "https://maskom.co.id"
NEXT_PUBLIC_API_BASE_URL = "https://api.maskom.co.id"

[env.development.vars]
NEXT_PUBLIC_SITE_URL = "https://maskom-dev.your-subdomain.workers.dev"
NEXT_PUBLIC_API_BASE_URL = "https://api-dev.maskom.co.id"

[env.preview.vars]
NEXT_PUBLIC_SITE_URL = "https://maskom-preview.your-subdomain.workers.dev"
NEXT_PUBLIC_API_BASE_URL = "https://api-preview.maskom.co.id"
```

### 2. Langkah-langkah Deployment

#### A. Persiapan Lokal
1. Pastikan semua dependensi terinstal:
   ```bash
   npm install
   ```

2. Pastikan sudah login ke Cloudflare:
   ```bash
   wrangler login
   ```

3. Update `wrangler.toml` dengan Account ID dan Zone ID yang benar

#### B. Build dan Deployment untuk Development (maskom.sulhi.workers.dev)
1. Build aplikasi:
   ```bash
   npx @opennextjs/cloudflare build
   ```

2. Deploy ke environment development:
   ```bash
   npx wrangler deploy --env development
   ```

3. Atau gunakan skrip:
   ```bash
   bash scripts/deploy-dev.sh
   ```

#### C. Verifikasi Deployment
1. Akses situs setelah deployment selesai
2. Pastikan konten yang ditampilkan adalah Maskom Network, bukan template AI writer
3. Periksa semua halaman penting (home, about, pricing, contact)

### 3. Konfigurasi Tambahan yang Diperlukan

#### A. Environment Variables
Pastikan variabel lingkungan berikut disetel:
- `NEXT_PUBLIC_SITE_URL`: URL situs utama
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`: Untuk form kontak
- Variabel lain yang diperlukan oleh aplikasi

#### B. Route Configuration
- Pastikan route maskom.sulhi.workers.dev diatur dengan benar di Cloudflare
- Verifikasi DNS settings jika menggunakan custom domain

### 4. Validasi Setelah Deployment
1. **Konten**: Pastikan semua halaman menampilkan konten Maskom Network
2. **Fungsionalitas**: Uji semua form dan interaksi
3. **SEO**: Verifikasi meta tags, title, dan description
4. **Branding**: Pastikan logo, warna, dan elemen visual sesuai

### 5. Troubleshooting Potensial
- Jika masih menampilkan template AI writer, pastikan:
  1. Build benar-benar menggunakan kode sumber saat ini
  2. Tidak ada cache yang menyebabkan konten lama muncul
  3. Deployment benar-benar ke worker yang dituju

### 6. Rollback Plan
Jika deployment bermasalah:
1. Identifikasi commit yang berfungsi sebelumnya
2. Checkout ke commit tersebut
3. Deploy ulang menggunakan versi yang diketahui berfungsi

## Catatan Penting
- Pastikan untuk tidak mengunggah wrangler.toml ke repository publik karena berisi informasi sensitif
- Gunakan GitHub Secrets untuk menyimpan API keys dan Account ID
- Pastikan semua kontributor memiliki akses yang sesuai ke Cloudflare account