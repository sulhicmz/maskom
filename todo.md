# To-Do List for Maskom Repository

## HIGH Priority
- [x] Refactor EmailJS credentials from `src/components/forms/ContactForm.tsx` to environment variables. (Security Risk)
- [x] Update `README.md` to reflect that EmailJS credentials are now environment variables.
- [x] Commit uncommitted changes to `README.md` and `todo.md`.
- [x] Commit uncommitted changes to `todo.md` and push to remote.
- [x] Verify Cloudflare deployment configuration so `_next` assets remain relative in all environments.
- [x] Revise hero section copy, CTAs, and visual to align dengan proposisi Maskom.
- [x] Susun ulang konten beranda menjadi blok Solusi, Pendekatan, & Dukungan dengan copy terbaru.
- [x] Samakan label CTA dan navigasi (desktop & mobile) agar konsisten dengan journey Maskom.

## MEDIUM Priority
- [x] Review and update dependencies for outdated or vulnerable packages.
- [x] Remove unused template pages and related dependencies to reduce the bundle size.
- [x] Update documentation to note the dark theme is now the default homepage experience.
- [x] Lokalise seluruh teks yang masih berbahasa Inggris (newsletter, tombol, form).
- [x] Definisikan palet warna baru di SCSS dan terapkan pada tombol & elemen utama.

## LOW Priority
- [x] Improve CI/CD feedback with notifications or status checks.
- [x] Add unit/integration tests for critical components.
- [ ] Audit struktur SCSS dan petakan file yang masih memakai `@import`.
- [ ] Migrasikan entry `src/styles/index.scss` ke `@use`/`@forward` (tanpa mematahkan build).
- [ ] Migrasikan modul SCSS di `public/assets/scss` ke `@use`/`@forward` bertahap.
- [x] Ganti placeholder testimoni & logo klien dengan aset sementara yang lebih relevan.
