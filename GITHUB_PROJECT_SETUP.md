# Pengaturan Proyek GitHub untuk Maskom.co.id

Dokumen ini menjelaskan langkah-langkah untuk mengatur GitHub Projects dan Labels untuk repositori `maskom.co.id`.

## GitHub Projects

1.  **Buka Repositori GitHub**:
    *   Arahkan ke `https://github.com/your-username/maskom.co.id`.

2.  **Akses Tab Projects**:
    *   Klik pada tab "Projects" di bagian atas halaman repositori.

3.  **Buat Proyek Baru**:
    *   Klik tombol "New project".
    *   Pilih template "Basic kanban" atau "Automated kanban" jika tersedia.
    *   Beri nama proyek, misalnya "Maskom Development Board".
    *   Klik "Create project".

4.  **Konfigurasi Kolom**:
    *   Pastikan proyek memiliki kolom-kolom berikut (Anda dapat mengedit atau menambahkan kolom jika perlu):
        *   `Backlog`: Untuk tugas yang belum diprioritaskan.
        *   `Todo`: Untuk tugas yang siap dikerjakan.
        *   `In Progress`: Untuk tugas yang sedang dikerjakan.
        *   `Review`: Untuk tugas yang menunggu tinjauan.
        *   `Done`: Untuk tugas yang telah selesai.

## GitHub Labels

1.  **Akses Issues**:
    *   Di repositori GitHub, klik pada tab "Issues".

2.  **Buka Label Settings**:
    *   Di sebelah kanan halaman Issues, klik "Labels".

3.  **Buat atau Edit Labels**:
    *   Pastikan label-label berikut ada (buat jika belum ada):
        *   **Prioritas**:
            *   `High` (Merah)
            *   `Medium` (Kuning)
            *   `Low` (Hijau)
        *   **Tipe**:
            *   `Bug` (Merah)
            *   `Feature` (Biru)
            *   `Enhancement` (Ungu)
            *   `Documentation` (Abu-abu)
        *   **Status**:
            *   `In Progress` (Biru)
            *   `Review Needed` (Oranye)
            *   `Blocked` (Merah)

## Otomatisasi (Opsional)

Anda dapat mengatur otomatisasi GitHub Actions untuk memindahkan issues antar kolom berdasarkan label atau status pull request. Ini memerlukan penulisan workflow file `.github/workflows/`, yang dapat ditambahkan di masa depan.