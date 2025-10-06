# Kontribusi ke Maskom

Terima kasih atas minat Anda untuk berkontribusi pada proyek Maskom! Panduan ini akan membantu Anda memahami cara berkontribusi secara efektif.

## Daftar Isi
- [Panduan Umum](#panduan-umum)
- [Persiapan Lingkungan Pengembangan](#persiapan-lingkungan-pengembangan)
- [Proses Kontribusi](#proses-kontribusi)
- [Pedoman Kode](#pedoman-kode)
- [Pedoman Commit](#pedoman-commit)
- [Pedoman Dokumentasi](#pedoman-dokumentasi)
- [Proses Review Kode](#proses-review-kode)

## Panduan Umum

Sebelum Anda mulai berkontribusi:

1. Pastikan Anda telah membaca [README.md](../README.md) untuk memahami proyek ini
2. Cari [issue yang sudah ada](https://github.com/username/maskom/issues) terkait dengan kontribusi yang ingin Anda buat
3. Jika belum ada issue, buat issue baru untuk membahas perubahan yang ingin Anda lakukan

## Persiapan Lingkungan Pengembangan

1. Fork repository ini
2. Clone repository ke lokal Anda
   ```bash
   git clone https://github.com/your-username/maskom.git
   ```
3. Buat branch baru untuk fitur Anda
   ```bash
   git checkout -b feature/nama-fitur-anda
   ```
4. Ikuti instruksi di [README.md](../README.md) untuk mengatur lingkungan pengembangan
5. Jalankan aplikasi lokal untuk memastikan semuanya berfungsi
   ```bash
   npm install
   npm run dev
   ```

## Proses Kontribusi

1. Buat perubahan di branch lokal Anda
2. Pastikan semua test lulus
   ```bash
   npm run test
   ```
3. Jalankan linting dan type checking
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
4. Commit perubahan Anda dengan pesan commit yang jelas
5. Push ke branch Anda
6. Buka Pull Request ke branch `main`

## Pedoman Kode

- Gunakan TypeScript untuk semua kode baru
- Patuhi standar linting ESLint yang sudah ditentukan
- Gunakan konvensi penamaan yang konsisten dengan kode yang sudah ada
- Tambahkan komentar untuk logika kompleks
- Ikuti prinsip SOLID dan prinsip-prinsip pengembangan perangkat lunak lainnya

## Pedoman Commit

Gunakan format conventional commits:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Contoh tipe commit:
- `feat`: Penambahan fitur baru
- `fix`: Perbaikan bug
- `docs`: Perubahan dokumentasi
- `style`: Perubahan yang tidak mempengaruhi arti kode (formatting, misalnya)
- `refactor`: Perubahan yang tidak memperbaiki bug atau menambahkan fitur
- `test`: Penambahan atau perbaikan test
- `chore`: Pekerjaan lainnya seperti build process atau helper tools

Contoh commit message:
```
feat(auth): add login with Google functionality

- Implement Google OAuth integration
- Add necessary security measures
- Update documentation with implementation guide

Closes #123
```

## Pedoman Dokumentasi

- Gunakan bahasa Indonesia yang baik dan benar untuk komentar dalam kode
- Perbarui dokumentasi jika Anda mengubah API atau fungsionalitas
- Gunakan JSDoc untuk fungsi penting
- Gunakan penjelasan yang jelas dan ringkas

## Proses Review Kode

1. Setiap Pull Request harus ditinjau oleh minimal satu kontributor inti
2. Peninjau akan memberikan umpan balik konstruktif
3. Penulis PR harus menanggapi komentar dan melakukan perubahan yang diperlukan
4. PR hanya akan digabungkan setelah menyelesaikan semua komentar review

### Kriteria untuk Menggabungkan PR

- Semua test lulus
- Semua linting lulus
- Tidak ada komentar yang belum ditanggapi
- Minimal satu aproval dari pengelola proyek
- Tidak ada konflik merge

## Menjalankan Test

Proyek ini menggunakan Jest untuk testing. Untuk menjalankan test:

```bash
# Jalankan semua test
npm run test

# Jalankan test dengan watch mode
npm run test -- --watch

# Jalankan test dan tampilkan coverage
npm run test -- --coverage
```

## Bertanya?

Jika Anda memiliki pertanyaan, silakan buka issue dengan label `question` atau hubungi pengelola proyek.

Kami menghargai setiap kontribusi, besar maupun kecil. Terima kasih telah menjadi bagian dari komunitas Maskom!