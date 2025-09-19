# Panduan Setup

Dokumen ini menjelaskan cara menyiapkan lingkungan pengembangan untuk proyek maskom.co.id.

## 1. Persyaratan Sistem

- **Node.js**: Versi 20.x atau lebih tinggi.
- **npm** atau **yarn**: Manajer paket untuk Node.js.
- **Git**: Untuk kloning repositori.

## 2. Panduan Instalasi

1.  **Kloning Repositori**:
    ```bash
    git clone https://github.com/your-username/maskom.co.id.git
    cd maskom.co.id
    ```

2.  **Instal Dependensi**:
    Gunakan npm atau yarn untuk menginstal semua dependensi yang diperlukan.
    ```bash
    npm install
    ```
    atau
    ```bash
    yarn install
    ```

## 3. Konfigurasi Variabel Lingkungan

Proyek ini menggunakan file `.env` untuk mengelola variabel lingkungan. Salin file `.env.example` (jika ada) menjadi `.env.local` dan isi nilainya.

1.  Buat file `.env.local` di root proyek.
2.  Tambahkan variabel yang diperlukan. Contoh:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:3000/api
    EMAILJS_SERVICE_ID=your_service_id
    EMAILJS_TEMPLATE_ID=your_template_id
    EMAILJS_PUBLIC_KEY=your_public_key
    ```

    *Catatan: Dapatkan nilai-nilai ini dari layanan terkait (misalnya, EmailJS).*

## 4. Pengaturan Server Pengembangan

Untuk menjalankan server pengembangan lokal, gunakan perintah berikut:

```bash
npm run dev
```atau
```bash
yarn dev
```

Aplikasi akan berjalan di `http://localhost:3000`. Server akan secara otomatis me-reload setiap kali ada perubahan pada file.
