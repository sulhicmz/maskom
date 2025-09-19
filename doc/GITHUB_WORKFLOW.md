# GitHub Workflow

Dokumen ini menjelaskan alur kerja GitHub yang direkomendasikan untuk proyek maskom.co.id untuk memastikan kolaborasi yang efisien dan kualitas kode yang terjaga.

## 1. Strategi Branching

Kami menggunakan model branching **Git Flow** yang disederhanakan:

-   **`main`**: Branch ini merepresentasikan kode produksi. Hanya kode yang stabil dan sudah di-review yang boleh di-merge ke `main`. Setiap merge ke `main` akan memicu deployment otomatis ke lingkungan produksi.
-   **`develop`**: Branch utama untuk pengembangan. Semua fitur baru dan perbaikan bug di-merge ke sini terlebih dahulu. Branch ini harus selalu dalam keadaan stabil dan siap untuk dirilis.
-   **Feature Branches (`feature/...`)**: Untuk setiap fitur baru, buat branch baru dari `develop`. Contoh: `feature/contact-form-validation`. Setelah selesai, merge kembali ke `develop` melalui Pull Request.
-   **Bugfix Branches (`bugfix/...`)**: Untuk perbaikan bug, buat branch baru dari `develop`. Contoh: `bugfix/fix-layout-issue`. Setelah selesai, merge kembali ke `develop` melalui Pull Request.

## 2. Proses Pull Request (PR)

Setiap perubahan kode harus melalui proses Pull Request untuk di-merge ke `develop` atau `main`.

1.  **Buat PR**: Saat fitur atau perbaikan bug selesai, buat Pull Request dari branch Anda ke `develop`.
2.  **Deskripsi PR**: Berikan judul dan deskripsi yang jelas tentang perubahan yang Anda buat. Jelaskan "apa" dan "mengapa".
3.  **Reviewer**: Tetapkan setidaknya satu anggota tim lain sebagai reviewer.
4.  **Code Review**: Reviewer akan memeriksa kode untuk kualitas, konsistensi, dan potensi masalah. Diskusi dan perbaikan dilakukan dalam PR.
5.  **Merge**: Setelah disetujui, PR dapat di-merge ke `develop`.

## 3. Pedoman Code Review

-   **Konstruktif**: Berikan umpan balik yang jelas dan konstruktif.
-   **Konsistensi**: Pastikan kode baru mengikuti gaya dan pola yang sudah ada di proyek.
-   **Fungsionalitas**: Pastikan perubahan bekerja sesuai yang diharapkan dan tidak menimbulkan bug baru.
-   **Linting**: Jalankan `npm run lint` secara lokal sebelum membuat PR untuk memastikan tidak ada error linting.

## 4. Proses Rilis

1.  **Stabilisasi `develop`**: Pastikan branch `develop` sudah stabil dan semua fitur untuk rilis baru telah di-merge.
2.  **Buat PR ke `main`**: Buat Pull Request dari `develop` ke `main`.
3.  **Review Akhir**: Lakukan review akhir pada PR ini.
4.  **Merge ke `main`**: Setelah disetujui, merge PR ke `main`. Ini akan memicu deployment otomatis ke produksi.
5.  **Tagging (Opsional)**: Buat Git tag untuk rilis baru untuk referensi di masa depan. Contoh: `git tag -a v1.1.0 -m "Rilis fitur X"`.
