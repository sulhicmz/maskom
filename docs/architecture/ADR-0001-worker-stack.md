# ADR 0001: Deploy Situs maskom.co.id ke Cloudflare Workers

## Status
Accepted (dipertahankan)

## Konteks
Repositori ini berisi situs resmi maskom.co.id berbasis Next.js App Router dengan integrasi komponen kompleks seperti Isotope, Swiper, EmailJS, dan SCSS kustom. Target deployment adalah Cloudflare Workers agar halaman dapat dilayani dari edge sambil tetap menggunakan fitur Next.js (routing App Router, metadata, optimasi gambar, dll.) untuk memberikan pengalaman terbaik kepada pengunjung situs maskom.co.id.

## Keputusan
Mempertahankan Next.js 15 App Router dan menggunakan [OpenNext untuk Cloudflare](https://github.com/opennextjs/opennext) sebagai jembatan build & deployment ke Cloudflare Workers.

## Rationale
- **Reuse kode eksisting** – Komponen, data statis, dan struktur `src/app` yang sudah ada dapat dipakai tanpa rewrite ke framework Worker lain. 【F:src/app/page.tsx†L1-L15】【F:src/components/homes/home-one/index.tsx†L1-L32】
- **Kesesuaian fitur** – Next.js memberi kebutuhan SEO (metadata), optimasi gambar, dan struktur App Router yang cocok untuk konten pemasaran Maskom. 【F:src/app/layout.tsx†L1-L33】
- **Integrasi Cloudflare resmi** – `opennextjs-cloudflare` menyediakan perintah build/preview/deploy siap pakai dan memanfaatkan konfigurasi di `wrangler.toml`. 【F:package.json†L7-L20】【F:wrangler.toml†L1-L9】
- **Performa edge** – Cloudflare Workers men-deploy bundle JavaScript ke edge global dengan latency rendah dan runtime `nodejs_compat` sehingga dependensi seperti EmailJS tetap berjalan. 【F:wrangler.toml†L1-L6】【F:src/components/forms/ContactForm.tsx†L1-L58】

## Alternatif yang Dipertimbangkan
- **Rewrite ke Hono/HTML statis** – Mengurangi fitur Next.js (routing dinamis, `next/image`, bundler) dan memaksa reimplementasi struktur komponen yang sudah kompleks.
- **Deploy ke Vercel** – Mudah tetapi tidak memenuhi requirement infrastruktur Cloudflare & existing pipeline Workers.

## Konsekuensi
- Build harus selalu dijalankan melalui OpenNext (`npm run preview`/`npm run deploy`) agar struktur output mengikuti ekspektasi Workers. 【F:package.json†L7-L20】
- Header keamanan & caching dikelola lewat `public/_headers`; konfigurasi harus disesuaikan tiap lingkungan. 【F:public/_headers†L1-L27】
- Penggunaan runtime edge membuat beberapa API Node.js tidak tersedia; dependensi harus kompatibel dengan lingkungan Workers.
- Konfigurasi `wrangler.toml` harus disesuaikan dengan environment-specific settings untuk pengelolaan konfigurasi yang lebih baik antara development, preview, dan production.
- Kredensial dan variabel lingkungan harus dikelola secara terpisah dari kode sumber untuk keamanan.
