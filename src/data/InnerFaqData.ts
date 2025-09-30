interface DataType {
   id: number;
   faq_details: {
      id: number;
      title: string;
      desc: string;
   }[];
}

const inner_faq_data: DataType[] = [
   {
      id: 1,
      faq_details: [
         {
            id: 1,
            title: "Apa perbedaan layanan internet dedicated dan broadband?",
            desc: "Internet dedicated Maskom memberikan kapasitas simetris yang tidak dibagi dengan pengguna lain serta dilengkapi SLA hingga 99,7%. Broadband bersifat best effort sehingga performanya sangat tergantung kepadatan jaringan umum."
         },
         {
            id: 2,
            title: "Apakah Maskom melayani lokasi di luar kota besar?",
            desc: "Ya, kami memiliki jaringan fiber, radio, dan kemitraan last mile untuk menjangkau kota-kota sekunder. Tim survey akan mengonfirmasi kesiapan infrastruktur sebelum penawaran resmi diterbitkan."
         },
         {
            id: 3,
            title: "Bisakah layanan Maskom diintegrasikan dengan penyedia cloud?",
            desc: "Maskom menyediakan opsi direct cloud connect ke hyperscaler seperti AWS, Azure, dan Google Cloud melalui interkoneksi privat sehingga akses ke aplikasi bisnis lebih aman dan stabil."
         },
         {
            id: 4,
            title: "Apakah ada solusi backup ketika koneksi utama bermasalah?",
            desc: "Setiap paket Maskom dapat ditambahkan backup radio, microwave, maupun seluler. Failover akan berjalan otomatis melalui perangkat SD-WAN atau router yang kami kelola."
         },
      ]
   },
   {
      id: 2,
      faq_details: [
         {
            id: 1,
            title: "Bagaimana mekanisme dukungan teknis harian?",
            desc: "Network Operation Center Maskom beroperasi 24/7. Notifikasi insiden dikirim melalui email, portal pelanggan, dan kanal WhatsApp/Telegram yang disepakati. Engineer on-site siap dikirim sesuai SLA."
         },
         {
            id: 2,
            title: "Apakah pelanggan mendapat akses monitoring?",
            desc: "Kami menyediakan portal yang menampilkan status perangkat, performa bandwidth, hingga history insiden. Pelanggan juga dapat mengunduh laporan otomatis dalam format PDF atau CSV."
         },
         {
            id: 3,
            title: "Bagaimana proses perubahan konfigurasi?",
            desc: "Permintaan change request dilakukan melalui portal atau email resmi. Tim Maskom akan melakukan assessment, menyampaikan jadwal pengerjaan, dan melakukan implementasi sesuai window yang disetujui."
         },
         {
            id: 4,
            title: "Apakah Maskom menyediakan pelatihan untuk tim internal kami?",
            desc: "Tersedia sesi knowledge transfer terkait prosedur eskalasi, penggunaan dashboard, dan best practice keamanan jaringan yang dapat dijadwalkan secara berkala."
         },
      ]
   },
   {
      id: 3,
      faq_details: [
         {
            id: 1,
            title: "Berapa lama durasi kontrak layanan Maskom?",
            desc: "Umumnya kontrak berlangsung 12 hingga 36 bulan. Untuk proyek strategis atau multi-site, kami dapat menyiapkan skema multi-tahun dengan opsi evaluasi tahunan."
         },
         {
            id: 2,
            title: "Apa saja dokumen yang dibutuhkan untuk memulai layanan?",
            desc: "Pelanggan perlu menyiapkan data legal perusahaan, alamat lokasi instalasi, jadwal akses site, dan PIC teknis. Maskom akan membantu proses perizinan tambahan jika dibutuhkan."
         },
         {
            id: 3,
            title: "Bagaimana metode penagihan dan pembayaran?",
            desc: "Penagihan dilakukan setiap bulan atau sesuai kesepakatan. Kami menerima pembayaran melalui transfer bank dan virtual account. Tersedia pula opsi consolidated billing untuk pelanggan multi-lokasi."
         },
         {
            id: 4,
            title: "Apakah layanan dapat ditingkatkan di tengah kontrak?",
            desc: "Kapasitas bandwidth atau add-on managed service dapat ditingkatkan kapan saja. Tim account Maskom akan menyesuaikan addendum kontrak tanpa mengganggu layanan yang sedang berjalan."
         },
      ]
   }
];

export default inner_faq_data;