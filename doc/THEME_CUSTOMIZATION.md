# Panduan Kustomisasi Tema

Dokumen ini menjelaskan cara menyesuaikan tema gelap dan efek menyala di situs web Maskom.

## Tema Gelap

Tema gelap diterapkan melalui kombinasi file SCSS dan kelas CSS di komponen React.

### File SCSS Terkait

- `public/assets/scss/sections/_home.scss`: Berisi styling khusus untuk tema gelap (`.home-one-dark`).
- `public/assets/scss/sections/_hero.scss`: Berisi styling untuk bagian hero, termasuk efek menyala pada breadcrumb.
- `public/assets/scss/sections/_services.scss`: Berisi styling khusus untuk komponen layanan.

### Menerapkan Tema Gelap

Tema gelap diterapkan secara global dengan menambahkan kelas `home-one-dark` ke elemen `<body>` di `src/app/layout.tsx`:

```tsx
<body className="home-one-dark" suppressHydrationWarning={true}>
  {children}
</body>
```

Jika Anda ingin menerapkan tema gelap hanya pada halaman tertentu, Anda dapat menambahkan kelas `home-one-dark` ke elemen pembungkus di halaman tersebut.

## Efek Menyala

Efek menyala diterapkan melalui CSS dan animasi. Berikut adalah beberapa contoh implementasi:

### Efek Menyala pada Kartu Layanan

Di `public/assets/scss/sections/_services.scss`, efek menyala pada kartu layanan diimplementasikan dengan pseudo-element `:before` dan animasi CSS:

```scss
.service-card {
  position: relative;
  overflow: hidden;
  
  // Glowing effect
  &:before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #00c3ff, #ffff00, #ff0080, #00c3ff);
    background-size: 400% 400%;
    z-index: -1;
    border-radius: 10px;
    animation: glow 20s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    &:before {
      opacity: 1;
    }
  }
}

// Keyframes for glowing animation
@keyframes glow {
  0% {
    background-position: 0 0;
    filter: blur(10px);
  }
  50% {
    background-position: 400% 0;
    filter: blur(15px);
  }
  100% {
    background-position: 0 0;
    filter: blur(10px);
  }
}
```

### Efek Menyala pada Breadcrumb

Di `public/assets/scss/sections/_hero.scss`, efek menyala pada breadcrumb diimplementasikan dengan filter `blur` dan warna latar belakang:

```scss
.page-banner-wrapper {
  .shape {
    position: absolute;
    z-index: -1;
    & span {
      &.circle {
        width: 225px;
        height: 225px;
        border-radius: 50%;
        background-color: #854BFE;
        filter: blur(100px);
      }
    }
    &.shape-one {
      left: 7%;
      top: 17%;
    }
    &.shape-two {
      right: 60px;
      top: 25px;
    }
  }
}
```

## Menyesuaikan Warna Tema

Warna tema didefinisikan di `public/assets/scss/_variables.scss`. Anda dapat menyesuaikan warna tema dengan mengubah nilai variabel berikut:

- `$primary-color`: Warna utama (default: #00c3ff)
- `$secondary-color`: Warna sekunder (default: #814AFF)
- `$heading-color`: Warna heading (default: #fff untuk tema gelap)
- `$text-color`: Warna teks (default: #BDBDBD untuk tema gelap)
- `$bg-color`: Warna latar belakang (default: #000 untuk tema gelap)

## Menambahkan Efek Menyala Baru

Untuk menambahkan efek menyala baru ke komponen, ikuti langkah-langkah berikut:

1. **Tambahkan CSS untuk efek menyala** di file SCSS yang sesuai (misalnya, `public/assets/scss/sections/_services.scss` untuk komponen layanan):

   ```scss
   .my-component {
     position: relative;
     overflow: hidden;
     
     // Glowing effect
     &:before {
       content: '';
       position: absolute;
       top: -2px;
       left: -2px;
       right: -2px;
       bottom: -2px;
       background: linear-gradient(45deg, #00c3ff, #ffff00, #ff0080, #00c3ff);
       background-size: 400% 400%;
       z-index: -1;
       border-radius: 10px;
       animation: glow 20s linear infinite;
       opacity: 0;
       transition: opacity 0.3s ease;
     }
     
     &:hover {
       &:before {
         opacity: 1;
       }
     }
   }
   ```

2. **Pastikan animasi `glow` didefinisikan** di file SCSS yang sama:

   ```scss
   @keyframes glow {
     0% {
       background-position: 0 0;
       filter: blur(10px);
     }
     50% {
       background-position: 400% 0;
       filter: blur(15px);
     }
     100% {
       background-position: 0 0;
       filter: blur(10px);
     }
   }
   ```

3. **Terapkan kelas CSS** ke komponen React Anda:

   ```tsx
   <div className="my-component">
     {/* Konten komponen */}
   </div>
   ```

## Catatan Penting

- Setelah membuat perubahan pada file SCSS, pastikan untuk me-restart server pengembangan Next.js agar perubahan diterapkan.
- Gunakan alat inspeksi browser untuk memeriksa elemen dan memastikan efek CSS diterapkan dengan benar.
- Untuk performa terbaik, gunakan efek menyala secara hemat dan hindari menerapkannya pada terlalu banyak elemen sekaligus.