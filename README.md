# Maskom.co.id Website

Selamat datang di repositori situs web resmi Maskom.co.id! Proyek ini adalah situs web Next.js yang di-deploy menggunakan Cloudflare Pages dan memanfaatkan Cloudflare Workers untuk fungsionalitas tambahan.

## Gambaran Umum Proyek

Situs web Maskom.co.id dirancang untuk menampilkan layanan, portofolio, dan informasi kontak perusahaan. Dibangun dengan Next.js, React, dan Sass, situs ini dioptimalkan untuk kinerja tinggi dan pengalaman pengguna yang responsif.

## Mulai Cepat

Ikuti langkah-langkah ini untuk menjalankan proyek secara lokal:

1.  **Kloning Repositori**:
    ```bash
    git clone https://github.com/your-username/maskom.co.id.git
    cd maskom.co.id
    ```
2.  **Instal Dependensi**:
    ```bash
    npm install
    # atau
    # yarn install
    ```
3.  **Konfigurasi Variabel Lingkungan**:
    Buat file `.env.local` di root proyek dan tambahkan variabel lingkungan yang diperlukan (lihat `doc/SETUP_GUIDE.md` untuk detail).
4.  **Jalankan Server Pengembangan**:
    ```bash
    npm run dev
    # atau
    # yarn dev
    ```
    Aplikasi akan berjalan di `http://localhost:3000`.

## Dokumentasi Detail

Untuk informasi lebih lanjut tentang proyek ini, silakan lihat dokumen-dokumen berikut di direktori `doc/`:

-   **[Panduan Setup](doc/SETUP_GUIDE.md)**: Persyaratan sistem, instalasi, dan konfigurasi lingkungan.
-   **[Proses Deployment](doc/DEPLOYMENT_PROCESS.md)**: Prasyarat, proses build, deployment ke Cloudflare Pages, dan prosedur rollback.
-   **[Dokumentasi Arsitektur](doc/ARCHITECTURE.md)**: Diagram arsitektur, struktur komponen, dan alur data.
-   **[GitHub Workflow](doc/GITHUB_WORKFLOW.md)**: Strategi branching, proses Pull Request, dan pedoman code review.
-   **[Panduan Troubleshooting](doc/TROUBLESHOOTING.md)**: Masalah umum dan solusinya.
-   **[Prosedur Maintenance](doc/MAINTENANCE.md)**: Pembaruan dependensi, backup, monitoring, dan scaling.
-   **[Kustomisasi Tema](doc/THEME_CUSTOMIZATION.md)**: Cara menyesuaikan tema gelap dan efek menyala.
-   **[Konten Layanan](doc/SERVICE_CONTENT.md)**: Cara menambahkan atau memperbarui konten layanan.

## Pedoman Kontribusi

Kami menyambut kontribusi! Silakan lihat **[GitHub Workflow](doc/GITHUB_WORKFLOW.md)** untuk detail tentang strategi branching, proses Pull Request, dan pedoman code review.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
