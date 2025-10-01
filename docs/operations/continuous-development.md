# Panduan Pengembangan Berkelanjutan

Dokumen ini menjadi rujukan utama untuk menjaga pengembangan Maskom tetap efisien setelah restrukturisasi repositori.

## 1. Alur Kerja Branching
- Gunakan `main` sebagai sumber kebenaran produksi. Branch fitur diturunkan dari `main` dan digabung melalui pull request dengan review.
- Untuk eksperimen, buat branch `spike/*` dan hapus setelah catatan penting dipindahkan ke dokumentasi permanen.

## 2. Validasi Sebelum Commit
1. Jalankan linting: `npm run lint` (atau `npm run lint:fix` bila ingin auto-fix). 【F:package.json†L7-L20】
2. Pastikan tipe aman: `npx tsc --noEmit`. 【F:README.md†L42-L52】
3. Lakukan build: `npm run build` untuk mendeteksi regresi edge runtime sejak dini. 【F:package.json†L7-L20】

## 3. Dependency Hygiene
- Tambahkan dependensi hanya bila dipakai di bawah `src/` atau konfigurasi build. Setelah penggunaan berakhir, hapus dari `package.json` serta jalankan `npm install` agar `package-lock.json` ikut bersih. 【F:package.json†L15-L46】
- Gunakan `npm outdated` setiap sprint untuk mengecek versi minor/patch dan catat hasilnya pada pull request.

## 4. Manajemen Rahasia dan Konfigurasi
- Semua kredensial (EmailJS, API eksternal) harus dimuat dari environment variable. Perbarui `wrangler.toml` bila membutuhkan binding baru. 【F:wrangler.toml†L1-L9】【F:src/components/forms/ContactForm.tsx†L1-L58】
- Jangan menulis kunci langsung di komponen. Jika membutuhkan nilai default untuk pengembangan, gunakan `.env.local` yang tidak dikomit.

## 5. Deploy ke Cloudflare Workers
1. Jalankan `npm run preview` untuk memverifikasi build OpenNext. 【F:package.json†L7-L20】
2. Setelah review QA, deploy dengan `npm run deploy` menggunakan kredensial Wrangler yang memiliki akses. 【F:wrangler.toml†L1-L9】
3. Catat perubahan konfigurasi (binding, environment) di pull request agar tercermin di riwayat infrastruktur.

## 6. Dokumentasi dan Catatan Rilis
- Setiap perubahan struktural wajib memperbarui README dan dokumen terkait di folder `docs/`. 【F:README.md†L1-L71】
- Gunakan `docs/history/2024-remediation-log.md` sebagai template ketika mencatat iterasi berikutnya.
- Simpan daftar isu aktif di `docs/operations/known-issues.md` dan pastikan entri diperbarui ketika status berubah.

## 7. Observabilitas dan Monitoring
- Aktifkan logging Cloudflare Workers pada saat pengujian untuk memeriksa error runtime edge.
- Jalankan audit Lighthouse sesudah setiap rilis besar untuk memonitor Core Web Vitals dan perbarui temuan di `docs/operations/performance-playbook.md`.

Dengan mengikuti panduan ini, tim dapat menjaga repositori tetap ramping dan terdokumentasi dengan baik seiring pertumbuhan fitur.
