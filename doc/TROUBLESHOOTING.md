# Panduan Troubleshooting

Dokumen ini berisi daftar masalah umum dan solusinya untuk proyek maskom.co.id.

## 1. Masalah Umum

### 1.1. Build Gagal di GitHub Actions

**Gejala**: Workflow GitHub Actions gagal pada langkah build.
**Solusi**:
-   Periksa log GitHub Actions untuk detail error. Pesan error seringkali menunjukkan masalah spesifik (misalnya, dependensi hilang, kesalahan sintaks).
-   Pastikan semua dependensi terinstal dengan benar. Coba jalankan `npm install` atau `yarn install` secara lokal.
-   Periksa konfigurasi `next.config.ts` untuk kesalahan.
-   Pastikan tidak ada error linting atau TypeScript yang belum terselesaikan. Jalankan `npm run lint` dan perbaiki semua masalah.

### 1.2. Deployment Gagal ke Cloudflare Pages

**Gejala**: Build berhasil, tetapi deployment ke Cloudflare Pages gagal.
**Solusi**:
-   Periksa dasbor Cloudflare Pages untuk error deployment.
-   Pastikan `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` diatur dengan benar sebagai secrets di repositori GitHub Anda.
-   Verifikasi bahwa pengaturan build di Cloudflare Pages (perintah build, direktori output) sesuai dengan proyek.
-   Jika menggunakan custom domain, pastikan CNAME records sudah dikonfigurasi dengan benar di DNS Cloudflare.

### 1.3. Error Runtime di Aplikasi

**Gejala**: Aplikasi berjalan tetapi menampilkan error di browser atau konsol server.
**Solusi**:
-   **Client-side errors**: Periksa konsol browser (Developer Tools) untuk pesan error JavaScript.
-   **Server-side errors (Next.js)**: Jika error terjadi selama rendering server-side, periksa log di lingkungan deployment (Cloudflare Pages).
-   **Cloudflare Workers errors**: Jika Anda menggunakan Cloudflare Workers, periksa log worker di dasbor Cloudflare.
-   Tambahkan logging yang lebih detail dalam kode Anda untuk membantu melacak masalah.

### 1.4. Masalah dengan Variabel Lingkungan

**Gejala**: Fitur yang bergantung pada variabel lingkungan tidak berfungsi (misalnya, EmailJS).
**Solusi**:
-   **Lokal**: Pastikan file `.env.local` ada dan variabel di dalamnya diatur dengan benar.
-   **Deployment**: Pastikan variabel lingkungan diatur di dasbor Cloudflare Pages untuk lingkungan yang sesuai (preview/production).
-   Periksa apakah variabel diakses dengan benar dalam kode (misalnya, `process.env.NEXT_PUBLIC_API_URL`).

## 2. Prosedur Debugging

-   **Debugging Lokal**: Gunakan fitur debugging IDE Anda (misalnya, VS Code) untuk menempatkan breakpoint dan melangkah melalui kode.
-   **Logging**: Tambahkan pernyataan `console.log()` atau `console.error()` di titik-titik strategis dalam kode Anda untuk melacak nilai variabel dan alur eksekusi.
-   **Cloudflare Workers**: Gunakan `npx wrangler dev` untuk menguji worker secara lokal dan `wrangler tail` untuk melihat log worker secara real-time di produksi.

## 3. Pertimbangan Keamanan

-   **Variabel Lingkungan**: Jangan pernah menyimpan informasi sensitif (kunci API, kredensial database) langsung di kode sumber. Selalu gunakan variabel lingkungan.
-   **Dependensi**: Perbarui dependensi secara teratur untuk mendapatkan perbaikan keamanan terbaru.
-   **CORS**: Pastikan konfigurasi CORS Anda aman dan hanya mengizinkan domain yang sah.
