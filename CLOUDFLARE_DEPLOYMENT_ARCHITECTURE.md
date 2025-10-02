# Arsitektur Deployment Cloudflare untuk Maskom Network

## Gambaran Umum
Dokumen ini menjelaskan arsitektur deployment yang optimal untuk aplikasi Maskom Network di Cloudflare Workers, dengan fokus pada proses build dan deployment yang dilakukan sepenuhnya di lingkungan Cloudflare.

## Masalah Saat Ini
- Worker "maskombuild" memiliki build history yang selalu gagal karena masalah lockfile
- Build gagal dengan error: `error: lockfile had changes, but lockfile is frozen`
- Situs maskom.sulhi.workers.dev kemungkinan masih menampilkan template AI writer karena build gagal
- Proses build menggunakan `bun run build` dan `bun run deploy` yang tidak kompatibel dengan repository

## Arsitektur Deployment yang Direkomendasikan

### 1. Workflow Deployment Otomatis
```
GitHub Repository → GitHub Actions → Cloudflare Workers → maskom.sulhi.workers.dev
```

### 2. Proses Build di Cloudflare
- Build dilakukan sepenuhnya di lingkungan Cloudflare
- Tidak ada build lokal yang diperlukan
- Menggunakan @opennextjs/cloudflare untuk build di Cloudflare

### 3. Konfigurasi GitHub Actions
File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'

    - name: Install dependencies (tanpa frozen lockfile)
      run: npm install
      env:
        NODE_ENV: production

    - name: Build application
      run: npx @opennextjs/cloudflare build
      env:
        NODE_ENV: production

    - name: Deploy to Cloudflare Workers
      run: npx wrangler deploy --env production
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
        CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}
      if: github.ref == 'refs/heads/main'

    - name: Deploy to Cloudflare Workers Preview
      run: npx wrangler deploy --env preview
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
        CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}
      if: github.event_name == 'pull_request'
```

### 4. Konfigurasi Wrangler
File: `wrangler.toml`

```toml
name = "maskom"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
name = "maskom"
account_id = "d82dfc100c4c41a50546254e1d91dcfc"
routes = [
  "https://maskom.sulhi.workers.dev"
]

[env.production.vars]
NEXT_PUBLIC_SITE_URL = "https://maskom.sulhi.workers.dev"
NEXT_PUBLIC_API_BASE_URL = "https://api.maskom.co.id"
```

### 5. Perbaikan Package Configuration

#### A. package.json
- Hapus skrip "build" dan "deploy" yang menggunakan bun
- Gunakan skrip standar Next.js
- Pastikan semua dependensi yang diperlukan terdaftar

#### B. Lockfile Management
- Hapus flag "frozen" dari build process
- Biarkan Cloudflare mengelola dependensi sesuai lingkungan build-nya
- Gunakan `npm install` bukan `npm install --frozen-lockfile`

## Strategi Deployment

### 1. Pembersihan Worker Lama
Sebelum deployment baru:
- Hapus worker "maskombuild" jika tidak digunakan
- Pastikan hanya satu worker aktif untuk domain maskom.sulhi.workers.dev

### 2. Proses Deployment
1. Update package.json untuk menghapus skrip build/deploy yang tidak perlu
2. Update wrangler.toml untuk konfigurasi production
3. Trigger deployment melalui GitHub Actions
4. Verifikasi bahwa build berhasil di Cloudflare
5. Pastikan situs menampilkan konten Maskom Network

### 3. Verifikasi Deployment
- Kunjungi maskom.sulhi.workers.dev
- Pastikan menampilkan konten Maskom Network (bukan template AI writer)
- Cek semua halaman utama (home, about, pricing, contact)
- Verifikasi fungsi kontak dan navigasi

## Penanganan Error Build

### A. Lockfile Issues
- Gunakan `npm install` tanpa flag `--frozen-lockfile` di Cloudflare
- Izinkan lockfile untuk diperbarui selama build di Cloudflare

### B. Dependency Issues
- Pastikan semua dependensi yang diperlukan terdaftar di package.json
- Gunakan versi yang kompatibel dengan lingkungan Cloudflare
- Tambahkan fallback untuk dependensi opsional

### C. Environment Variables
- Pastikan semua environment variables diset di wrangler.toml
- Gunakan Cloudflare secrets untuk informasi sensitif

## Monitoring dan Troubleshooting

### 1. Build Monitoring
- Periksa GitHub Actions logs untuk setiap deployment
- Gunakan Cloudflare dashboard untuk melihat status build
- Cek wrangler logs jika deployment gagal

### 2. Content Verification
- Lakukan pengecekan otomatis setelah deployment
- Gunakan tools untuk verifikasi konten yang ditampilkan
- Bandingkan dengan snapshot konten Maskom Network yang benar

## Keamanan dan Best Practices

### 1. Secrets Management
- Gunakan GitHub Secrets untuk API tokens
- Gunakan Cloudflare Environment Variables untuk konfigurasi
- Jangan hardcode credentials di konfigurasi

### 2. Domain dan Routing
- Pastikan hanya satu worker yang menangani maskom.sulhi.workers.dev
- Gunakan custom domain jika diperlukan (maskom.co.id)
- Konfigurasi SSL/TLS di Cloudflare

## Langkah-Langkah Implementasi

1. **Update Konfigurasi Repository**
   - Update package.json
   - Update wrangler.toml
   - Update GitHub Actions workflow

2. **Hapus Build Lokal**
   - Hapus skrip build/deploy dari package.json
   - Pastikan tidak ada dependency build lokal

3. **Trigger Deployment Baru**
   - Commit perubahan ke branch main
   - Aktifkan GitHub Actions untuk build di Cloudflare

4. **Verifikasi Hasil**
   - Pastikan build berhasil di Cloudflare
   - Verifikasi konten Maskom Network ditampilkan
   - Pastikan template AI writer tidak lagi muncul