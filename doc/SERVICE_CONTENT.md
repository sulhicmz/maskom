# Panduan Konten Layanan

Dokumen ini menjelaskan cara menambahkan atau memperbarui konten layanan di situs web Maskom.

## Struktur Data Layanan

Data layanan dikelola dalam file `src/data/ServiceData.ts`. File ini berisi array objek `Service`, di mana setiap objek mewakili satu layanan.

### Interface Service

```typescript
export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  link: string;
 features: string[];
  image: string;
}
```

- `id`: ID unik untuk layanan (harus unik)
- `title`: Judul layanan
- `description`: Deskripsi singkat layanan
- `icon`: Path ke ikon layanan (relatif terhadap direktori `public`)
- `link`: URL halaman detail layanan
- `features`: Array fitur utama layanan
- `image`: Path ke gambar utama layanan (relatif terhadap direktori `public`)

## Menambahkan Layanan Baru

1. **Tambahkan data layanan baru** ke array `serviceData` di `src/data/ServiceData.ts`:
   ```typescript
   {
     id: 4,
     title: "Layanan Baru",
     description: "Deskripsi layanan baru.",
     icon: "/assets/images/services/new-service-icon.png",
     link: "/services/new-service",
     features: [
       "Fitur 1",
       "Fitur 2",
       "Fitur 3"
     ],
     image: "/assets/images/services/new-service.jpg"
   }
   ```

2. **Buat direktori halaman** untuk layanan baru:
   ```bash
   mkdir src/app/services/new-service
   ```

3. **Buat file `page.tsx`** untuk halaman detail layanan:
   ```typescript
   import React from 'react';
   import { ServiceDetails } from '@/components/services';
   import Breadcrumb from '@/components/common/Breadcrumb';
   import serviceData from '@/data/ServiceData';

   const NewServicePage = () => {
     // Find the service data for the new service
     const service = serviceData.find(s => s.id === 4);
     
     if (!service) {
       return <div>Service not found</div>;
     }

     return (
       <>
         <Breadcrumb title={service.title} sub_title="Layanan" />
         <ServiceDetails 
           title={service.title}
           description={service.description}
           features={service.features}
           image={service.image}
         />
       </>
     );
   };

   export default NewServicePage;
   ```

4. **Tambahkan tautan ke menu** di `src/data/MenuData.ts` jika diperlukan.

5. **Tambahkan gambar** ke direktori `public/assets/images/services/`:
   - `new-service-icon.png` untuk ikon
   - `new-service.jpg` untuk gambar utama

## Memperbarui Konten Layanan yang Ada

Untuk memperbarui konten layanan yang ada, cukup ubah properti yang sesuai di objek layanan dalam array `serviceData` di `src/data/ServiceData.ts`.

Misalnya, untuk memperbarui deskripsi layanan "Solusi Jaringan/WiFi":

```typescript
{
  id: 1,
  title: "Solusi Jaringan/WiFi",
  description: "Deskripsi yang diperbarui untuk solusi jaringan dan WiFi.",
  // ... properti lainnya
}
```

## Catatan Penting

- Path gambar dan ikon harus relatif terhadap direktori `public`. Misalnya, jika Anda menempatkan gambar di `public/assets/images/services/my-image.png`, path-nya adalah `/assets/images/services/my-image.png`.
- ID layanan harus unik untuk setiap layanan.
- Setelah menambahkan atau memperbarui konten, pastikan untuk memeriksa halaman terkait di browser untuk memastikan perubahan telah diterapkan dengan benar.