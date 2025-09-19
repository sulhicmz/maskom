# Optimasi Performa

Dokumen ini menjelaskan strategi dan implementasi optimasi performa untuk website Maskom.

## 1. Optimasi Gambar

### Next.js Image Component
Kami menggunakan komponen `next/image` untuk semua gambar di website untuk memastikan:
- Lazy loading otomatis
- Optimasi ukuran gambar berdasarkan device
- Format gambar modern (WebP) ketika didukung

### Implementasi
```jsx
import Image from 'next/image';

// Contoh penggunaan
<Image
  src="/assets/images/example.jpg"
  alt="Deskripsi gambar"
  width={800}
  height={600}
  layout="responsive"
/>
```

## 2. Strategi Caching

### File _headers
Kami mengimplementasikan strategi caching yang optimal melalui file `_headers`:

```
# Caching untuk static assets
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Caching untuk halaman
/*.html
  Cache-Control: public, max-age=0, must-revalidate

# Caching untuk API
/api/*
  Cache-Control: no-cache, no-store, must-revalidate
```

## 3. Optimasi Bundle Size

### Code Splitting
Kami menggunakan fitur code splitting bawaan Next.js untuk membagi bundle menjadi chunk-chunk kecil yang dimuat sesuai kebutuhan.

### Tree Shaking
Kami memastikan hanya mengimpor komponen yang diperlukan dari library untuk mengurangi ukuran bundle.

### Analisis Bundle
Untuk menganalisis ukuran bundle, jalankan:
```bash
npm run build
npm run analyze
```

## 4. Optimasi Cloudflare Workers

### Routing yang Efisien
Kami mengoptimalkan routing untuk Cloudflare Workers melalui konfigurasi di `wrangler.toml`:

```toml
# Routes untuk worker
[[routes]]
pattern = "maskom.co.id/api/*"
zone_id = "xxxxxxxxxxxxxxxx" # Placeholder - isi dengan zone ID yang sebenarnya dari Cloudflare dashboard

# Routes untuk static assets
[[routes]]
pattern = "maskom.co.id/assets/*"
zone_id = "xxxxxxxxxxxxxxxxxxxxxxxx" # Placeholder - isi dengan zone ID yang sebenarnya dari Cloudflare dashboard
```

## 5. Optimasi CSS

### SCSS Modular
Kami menggunakan pendekatan SCSS modular untuk memastikan hanya CSS yang diperlukan yang dimuat untuk setiap halaman.

### Purging CSS
Kami menghapus CSS yang tidak digunakan dalam produksi untuk mengurangi ukuran file.

## 6. Lazy Loading Komponen

### Dynamic Imports
Kami menggunakan dynamic imports untuk komponen yang tidak segera diperlukan:

```jsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('../components/HeavyComponent'));
```

## 7. Preloading dan Prefetching

### Link Preloading
Kami menggunakan `next/link` dengan prefetch untuk memuat halaman yang kemungkinan akan dikunjungi pengguna:

```jsx
import Link from 'next/link';

<Link href="/halaman-berikutnya" prefetch>
  Halaman Berikutnya
</Link>
```

## 8. Monitoring Performa

### Web Vitals
Kami memantau Core Web Vitals untuk memastikan pengalaman pengguna yang optimal:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### Tools Monitoring
- Google PageSpeed Insights
- Lighthouse
- Web.dev

## 9. Best Practices

1. **Minimalkan jumlah request HTTP**
2. **Gunakan CDN untuk static assets**
3. **Optimalkan font loading**
4. **Hindari layout shift**
5. **Gunakan kompresi gzip/br**
6. **Implementasikan service worker untuk caching offline**
7. **Gunakan placeholder untuk gambar**
8. **Hindari inline CSS yang besar**

## 10. Pengujian Performa

### Local Testing
```bash
npm run build
npm run start
```

Lalu gunakan Lighthouse untuk menguji performa di localhost.

### Production Testing
Gunakan tools online seperti:
- PageSpeed Insights
- GTmetrix
- WebPageTest

## 11. Troubleshooting

### Bundle Size Terlalu Besar
1. Gunakan `next-bundle-analyzer` untuk menganalisis bundle
2. Hapus dependensi yang tidak digunakan
3. Gunakan dynamic imports untuk komponen besar
4. Optimalkan gambar

### Loading Lambat
1. Periksa strategi caching
2. Optimalkan gambar
3. Gunakan lazy loading
4. Periksa jumlah request HTTP

### Layout Shift
1. Tentukan ukuran gambar dengan jelas
2. Gunakan placeholder
3. Hindari font yang berubah ukuran
4. Gunakan CSS yang stabil