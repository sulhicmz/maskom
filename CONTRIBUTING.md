# Pedoman Kontribusi untuk Maskom.co.id

Terima kasih telah meluangkan waktu untuk berkontribusi pada proyek kami!

Pedoman berikut akan membantu Anda memahami bagaimana Anda dapat berkontribusi pada proyek ini.

## Daftar Isi
- [Pedoman Kontribusi untuk Maskom.co.id](#pedoman-kontribusi-untuk-maskomcoid)
  - [Daftar Isi](#daftar-isi)
  - [Gaya Kode dan Konvensi](#gaya-kode-dan-konvensi)
  - [Proses Pull Request](#proses-pull-request)
  - [Konvensi Pesan Komit](#konvensi-pesan-komit)
  - [Persyaratan Pengujian](#persyaratan-pengujian)
  - [Strategi Percabangan](#strategi-percabangan)
    - [Ringkasan](#ringkasan)
    - [Cabang `main`](#cabang-main)
    - [Cabang `develop`](#cabang-develop)
    - [Cabang Fitur](#cabang-fitur)
    - [Cabang Rilis](#cabang-rilis)
    - [Cabang Hotfix](#cabang-hotfix)

## Gaya Kode dan Konvensi

*   **Linting**: Kami menggunakan ESLint untuk menjaga konsistensi kode. Jalankan `npm run lint` untuk memeriksa masalah gaya.
*   **Formatting**: Kami menggunakan Prettier untuk pemformatan kode otomatis. Pastikan untuk memformat kode Anda sebelum melakukan komit.
*   **Konvensi Penamaan**:
    *   Komponen React: `PascalCase` (contoh: `HomePage.tsx`)
    *   Variabel & Fungsi: `camelCase` (contoh: `fetchUserData`)
    *   File SCSS: `kebab-case` (contoh: `_header-menu.scss`)

## Proses Pull Request

1.  **Fork & Clone**: Fork repositori dan klon ke mesin lokal Anda.
2.  **Buat Cabang**: Buat cabang fitur baru dari `develop` dengan nama deskriptif (contoh: `feature/add-contact-form`).
3.  **Kembangkan**: Tulis kode Anda dan pastikan semua tes lulus.
4.  **Komit**: Lakukan komit pada perubahan Anda menggunakan [Konvensi Pesan Komit](#konvensi-pesan-komit) kami.
5.  **Push**: Dorong cabang fitur Anda ke fork Anda.
6.  **Buat Pull Request (PR)**: Buka PR dari cabang fitur Anda ke cabang `develop` repositori utama.
7.  **Tinjauan Kode**: Tim akan meninjau PR Anda. Lakukan perubahan yang diminta jika ada.
8.  **Gabung**: Setelah disetujui, PR Anda akan digabungkan ke `develop`.

## Konvensi Pesan Komit

Kami mengikuti konvensi [Conventional Commits](https://www.conventionalcommits.org/). Formatnya adalah:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

*   **Type**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
*   **Scope** (opsional): Modul yang terpengaruh (contoh: `auth`, `services`).
*   **Subject**: Ringkasan singkat perubahan dalam huruf kecil.

Contoh: `feat(services): add ai automation page`

## Persyaratan Pengujian

*   Semua fitur atau perbaikan bug baru harus disertai dengan tes yang relevan.
*   Jalankan `npm test` untuk menjalankan rangkaian tes secara lokal.
*   Pastikan semua tes lulus sebelum membuat Pull Request.

## Strategi Percabangan

### Ringkasan

Kami menggunakan model percabangan Git Flow. Ini memungkinkan pengembangan paralel dan rilis yang terisolasi.

```mermaid
graph TD
    A[main] <--> B(develop)
    B <--> C{feature/home-page}
    B --> D{release/v1.0.0}
    D --> A
    A --> E{hotfix/bug-fix}
    E --> A
    E --> B```

### Cabang `main`

Cabang `main` berisi kode yang siap produksi. Setiap komit pada `main` adalah rilis baru dan harus ditandai dengan nomor versi. Kode tidak boleh didorong langsung ke `main`.

### Cabang `develop`

Cabang `develop` adalah cabang pengembangan utama tempat semua fitur baru diintegrasikan. Ini mewakili keadaan terbaru dari pekerjaan pengembangan.

### Cabang Fitur

*   Dibuat dari `develop`.
*   Digunakan untuk mengembangkan fitur baru atau tugas tertentu.
*   Nama cabang harus diawali dengan `feature/` (contoh: `feature/user-authentication`).
*   Digabungkan kembali ke `develop` setelah selesai.

### Cabang Rilis

*   Dibuat dari `develop` ketika siap untuk rilis baru.
*   Memungkinkan persiapan rilis (perbaikan bug menit terakhir, pembaruan versi).
*   Nama cabang harus diawali dengan `release/` (contoh: `release/v1.2.0`).
*   Digabungkan ke `main` (dan ditandai) dan `develop` setelah siap.

### Cabang Hotfix

*   Dibuat dari `main` untuk memperbaiki bug kritis dalam produksi.
*   Nama cabang harus diawali dengan `hotfix/` (contoh: `hotfix/fix-login-issue`).
*   Digabungkan kembali ke `main` dan `develop` setelah perbaikan selesai.