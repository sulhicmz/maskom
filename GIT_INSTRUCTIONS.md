# Instruksi Git untuk Proyek Maskom

Berikut adalah langkah-langkah untuk melakukan commit, push, dan merge perubahan yang telah dibuat:

## 1. Commit Perubahan

Pastikan Anda berada direktori root proyek (`maskom`).

```bash
# Tambahkan semua file yang telah diubah ke staging area
git add .

# Commit perubahan dengan pesan yang deskriptif
git commit -m "feat: Konfigurasi Next.js untuk Edge Runtime dan Cloudflare Workers"
```

## 2. Push ke GitHub

Diasumsikan Anda bekerja di branch `main`. Jika tidak, ganti `main` dengan nama branch Anda.

```bash
# Push commit ke remote repository (GitHub)
git push origin main
```

Jika Anda bekerja di branch fitur, Anda perlu push ke branch tersebut terlebih dahulu, lalu membuat Pull Request (PR) ke `main` di GitHub.

```bash
# Jika bekerja di branch fitur, misalnya 'feature/cloudflare-deployment'
git push origin feature/cloudflare-deployment
```

Kemudian, buka GitHub dan buat Pull Request dari `feature/cloudflare-deployment` ke `main`.

## 3. Merge (melalui GitHub Pull Request)

Jika Anda membuat PR:
1. Buka repository di GitHub.
2. Buka tab "Pull requests".
3. Klik PR yang baru saja Anda buat.
4. Tinjau perubahan.
5. Klik "Merge pull request".
6. Konfirmasi merge.

GitHub Actions akan secara otomatis memicu workflow `deploy.yml` setelah merge ke `main`.

## 4. Penyelesaian Konflik (Jika Ada)

Jika terjadi konflik saat merge:
1. GitHub akan menunjukkan file-file yang memiliki konflik.
2. Anda perlu menarik (pull) perubahan terbaru dari `main` ke branch fitur Anda:

```bash
git checkout feature/cloudflare-deployment # Ganti dengan nama branch fitur Anda
git pull origin main
```

3. Git akan menandai konflik dalam file-file yang terpengaruh. Buka file tersebut dan cari baris yang ditandai dengan:

```
<<<<<<< HEAD
[Kode dari branch Anda]
=======
[Kode dari branch main]
>>>>>>> main
```

4. Edit file untuk memilih kode yang benar, lalu hapus marker konflik (`<<<<<<<`, `=======`, `>>>>>>>`).
5. Setelah menyelesaikan semua konflik, tambahkan file ke staging area dan commit:

```bash
git add .
git commit -m "fix: Selesaikan konflik merge"
git push origin feature/cloudflare-deployment
```

6. Kembali ke GitHub dan selesaikan merge melalui Pull Request.

## 5. Deployment Otomatis

Setelah merge ke `main`, GitHub Actions akan secara otomatis:
1. Checkout kode.
2. Setup Node.js.
3. Install dependensi.
4. Build aplikasi Next.js.
5. Deploy ke Cloudflare Workers menggunakan Wrangler.

Anda dapat memantau proses deployment di tab "Actions" di repository GitHub Anda.

## 6. Verifikasi Deployment

Setelah deployment selesai, Anda dapat mengakses aplikasi Anda di URL yang disediakan oleh Cloudflare Workers.