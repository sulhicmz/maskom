# Optimasi Performa

Dokumen ini merangkum praktik performa yang saat ini digunakan di Maskom serta rekomendasi tindak lanjut.

## 1. Manajemen Build & Analisis Bundle
- Gunakan `npm run build` untuk memastikan semua halaman dapat diekspor di runtime edge. 【F:package.json†L7-L20】
- Jalankan `npm run analyze` (set `ANALYZE=true`) untuk membuka laporan `@next/bundle-analyzer` dan mengidentifikasi modul besar. 【F:package.json†L7-L20】
- Untuk pratinjau Workers gunakan `npm run preview` yang menjalankan OpenNext dan Wrangler dalam satu perintah. 【F:package.json†L7-L20】

## 2. Optimasi Aset Statis
- Seluruh gambar impor melalui `next/image`, memberikan resizing otomatis, lazy loading, dan format modern. Contoh pada komponen hero, pricing, dan tim. 【F:src/components/homes/home-one/Hero.tsx†L1-L27】【F:src/components/homes/home-one/Price.tsx†L1-L68】【F:src/components/pages/teams/team/TeamArea.tsx†L1-L53】
- `public/_headers` menerapkan cache agresif (`max-age=31536000, immutable`) untuk `public/assets` serta header keamanan tambahan. 【F:public/_headers†L1-L27】
- Pastikan setiap penambahan aset besar ditempatkan di `public/assets/images` dan gunakan format terkompresi (WebP/AVIF) sebelum commit.

## 3. Styling & CSS
- Entry SCSS `src/styles/index.scss` menggabungkan Bootstrap, animasi WOW, dan stylesheet kustom `public/assets/scss/style.scss`. 【F:src/styles/index.scss†L1-L10】
- Gunakan utility Bootstrap yang sudah tersedia sebelum menambahkan kelas baru untuk meminimalkan CSS tambahan.
- Pertimbangkan purge/treeshake CSS saat build produksi apabila ukuran bundle meningkat (dapat ditambahkan melalui PostCSS plugin).

## 4. Optimalisasi JavaScript di Klien
- Komponen slideshow (`Swiper`) dan grid filter (`Isotope`) berjalan hanya di klien. Pastikan inisialisasi dibungkus di hook `useEffect` untuk menghindari mismatch SSR. 【F:src/components/homes/home-one/Brand.tsx†L1-L76】【F:src/components/homes/home-two/Gallery.tsx†L1-L69】
- Jika performa menjadi isu, gunakan dynamic import (`next/dynamic`) untuk memuat komponen berat secara lazy.
- Hook `UseSticky` hanya memeriksa scroll >200px; review kembali ketika menambahkan interaksi lain agar event listener tetap ringan. 【F:src/hooks/UseSticky.ts†L1-L28】

## 5. Form & Integrasi Pihak Ketiga
- Form kontak menggunakan EmailJS di sisi klien. Respon sukses menampilkan toast melalui `ToastContainer` di `Wrapper`. 【F:src/components/forms/ContactForm.tsx†L1-L58】【F:src/layouts/Wrapper.tsx†L1-L15】
- Pastikan kredensial dipindahkan ke environment agar tidak menghambat caching atau memicu error di runtime edge (lihat Known Issues).

## 6. Monitoring & Uji Performa
- Jalankan `npm run start` setelah build dan gunakan Lighthouse atau PageSpeed Insights untuk mengevaluasi Core Web Vitals.
- Cloudflare menyediakan analitik melalui dashboard Workers; aktifkan log untuk melihat cache hit dan error edge.
- Tambahkan pengujian regresi visual/performa (mis. menggunakan Playwright + Lighthouse CI) ketika pipeline CI/CD sudah siap.
