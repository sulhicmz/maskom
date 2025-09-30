# Maskom Network Website

Maskom Network adalah situs pemasaran berbasis Next.js yang menonjolkan layanan konektivitas terkelola, keamanan jaringan, dan dukungan operasional Maskom di seluruh Indonesia. Template HTML bawaan telah dimodifikasi secara menyeluruh agar setiap halaman, data, dan komponen merefleksikan identitas serta proposisi Maskom.

## Arsitektur Singkat

- **Framework**: Next.js 15 dengan direktori `app/` dan komponen React Server/Client sesuai kebutuhan interaksi.
- **Sumber Konten**: Semua teks dan daftar diturunkan dari berkas TypeScript di `src/data/` untuk memudahkan kurasi konten.
- **Gaya**: Menggabungkan SCSS tematik dari `public/assets/scss/` dengan utilitas Bootstrap 5.
- **Asset**: Semua gambar diakses melalui alias `@/assets/*` yang terhubung ke `public/assets/`.

## Menjalankan Secara Lokal

1. Instal dependensi (gunakan opsi legacy bila diperlukan oleh lingkungan lokal):
   ```bash
   npm install --legacy-peer-deps
   ```
2. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
3. Buka [http://localhost:3000](http://localhost:3000) untuk melihat situs Maskom.

## Memperbarui Konten

- **Beranda & Halaman Turunan**: Teks dan daftar pada setiap modul dikontrol oleh data di `src/data/` (misal `FeatureData.ts`, `PriceData.ts`, `FaqData.ts`).
- **Navigasi & Footer**: Perbarui tautan di `src/data/MenuData.ts` serta `src/layouts/footers/` agar konsisten dengan kanal resmi Maskom.
- **Formulir**: Validasi dan integrasi EmailJS berada pada komponen `src/components/forms/`.

## Pemeriksaan Kualitas

Jalankan ESLint untuk memastikan standar kode konsisten:
```bash
npm run lint
```

## Deploy ke Cloudflare Workers

Situs ini dikemas menggunakan [OpenNext untuk Cloudflare](https://github.com/opennextjs/opennext). Output build disalin ke direktori `.open-next/` lalu dipublikasikan via Wrangler.

1. Bangun ulang bundle Worker dan aset statis:
   ```bash
   npm run cf:build
   ```
   Perintah ini menghapus isi `.open-next/` lama dan membuat berkas `worker.js` beserta folder aset terbaru.
2. Deploy ke lingkungan Workers.dev (atau zona yang dikonfigurasi di `wrangler.toml`):
   ```bash
   npm run cf:deploy
   ```
   Wrangler akan membaca `wrangler.toml`, mengunggah skrip Worker, serta menyinkronkan aset dari `.open-next/assets`.
3. Verifikasi hasil deploy dengan membuka URL `https://<nama-worker>.workers.dev` atau domain produksi Anda. Jika masih terlihat template lama:
   - Pastikan langkah `npm run cf:build` telah dijalankan setelah perubahan konten.
   - Hapus artefak lama secara manual (`rm -rf .open-next`) sebelum membangun ulang untuk memastikan tidak ada file cache.
   - Gunakan `wrangler deploy --no-bundle` hanya jika Anda memiliki artefak hasil build terbaru.
   - Gunakan `wrangler tail --once` untuk memastikan Worker terbaru sudah aktif tanpa error runtime.

### Skrip Tambahan

- **Pratinjau lokal Worker**:
  ```bash
  npm run cf:preview
  ```
  Perintah ini menjalankan `wrangler dev --local` menggunakan output terbaru dari `.open-next/`.

- **Analisis bundle Next.js**:
  ```bash
  npm run analyze
  ```

## Troubleshooting

| Gejala | Penyebab Umum | Solusi |
| --- | --- | --- |
| Worker masih menampilkan template awal | Build lama masih tersimpan di `.open-next/` atau deploy dijalankan tanpa rebuild | Jalankan `rm -rf .open-next && npm run cf:build` sebelum `npm run cf:deploy`. Pastikan command berhasil tanpa error. |
| Deploy gagal karena kredensial | Token API Cloudflare belum disetel | Ekspor `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` atau login melalui `wrangler login`. |
| Asset tidak termuat | Binding `ASSETS` belum terhubung | Pastikan blok `[assets]` di `wrangler.toml` menunjuk ke `.open-next/assets` (sudah dikonfigurasi di repo). |

## Lisensi

Proyek ini menyesuaikan template komersial untuk kebutuhan internal Maskom. Hak cipta gambar dan konten berada pada Maskom Network.
