interface DataType {
   id: number;
   page: string;
   icon: string;
   title: string;
   desc: string;
}

const feature_data: DataType[] = [
   {
      id: 1,
      page: "home_3",
      icon: "flaticon-user",
      title: "Tim Engineer Bersertifikasi",
      desc: "Engineer Maskom bersertifikasi internasional untuk desain jaringan, keamanan, dan cloud, memastikan implementasi sesuai standar terbaik.",
   },
   {
      id: 2,
      page: "home_3",
      icon: "flaticon-web",
      title: "Portal Pelanggan Transparan",
      desc: "Portal Maskom menyediakan informasi real-time mengenai performa layanan, tiket dukungan, dan dokumentasi teknis yang mudah diakses.",
   },
   {
      id: 3,
      page: "home_3",
      icon: "flaticon-speaker-filled-audio-tool",
      title: "Desain Solusi Terukur",
      desc: "Setiap proyek diawali dengan assessment mendalam dan blueprint arsitektur yang memprioritaskan skalabilitas dan keamanan data.",
   },
   {
      id: 4,
      page: "home_3",
      icon: "flaticon-cloud-computing",
      title: "Integrasi Cloud dan Data Center",
      desc: "Maskom menghubungkan infrastruktur on-premise dengan cloud publik dan privat menggunakan koneksi privat berlatensi rendah.",
   },
   {
      id: 5,
      page: "home_3",
      icon: "flaticon-font-adjustment",
      title: "Pengelolaan Perangkat End-to-End",
      desc: "Dari pengadaan, staging, instalasi hingga pemeliharaan, seluruh perangkat jaringan pelanggan dikelola oleh tim Maskom.",
   },
   {
      id: 6,
      page: "home_3",
      icon: "flaticon-powerpoint",
      title: "Pelaporan SLA Komprehensif",
      desc: "Laporan SLA Maskom mencakup analisis downtime, rekomendasi preventif, dan rencana peningkatan berbasis data operasional.",
   },
   {
      id: 7,
      page: "home_3",
      icon: "flaticon-video-file",
      title: "Monitoring 24/7",
      desc: "Network Operation Center kami memantau jaringan pelanggan sepanjang waktu menggunakan sistem alert multi-channel.",
   },
   {
      id: 8,
      page: "home_3",
      icon: "flaticon-sharing",
      title: "Kolaborasi dengan Ekosistem",
      desc: "Maskom bekerja sama dengan penyedia data center, operator telekomunikasi, dan vendor teknologi untuk menghadirkan solusi terintegrasi.",
   },
   {
      id: 9,
      page: "home_3",
      icon: "flaticon-megaphone",
      title: "Layanan Konsultasi Proaktif",
      desc: "Kami secara berkala memberi rekomendasi peningkatan kapasitas, optimasi biaya, dan inovasi digital sesuai strategi bisnis pelanggan.",
   },

   // about

   {
      id: 1,
      page: "about",
      icon: "flaticon-innovation",
      title: "Solusi Terkustomisasi",
      desc: "Kami merancang arsitektur jaringan dan keamanan sesuai karakteristik industri dan regulasi yang berlaku.",
   },
   {
      id: 2,
      page: "about",
      icon: "flaticon-support",
      title: "Dukungan 24/7",
      desc: "Network Operation Center memantau performa layanan secara proaktif dan menyediakan engineer on-site saat diperlukan.",
   },
   {
      id: 3,
      page: "about",
      icon: "flaticon-data-analytics",
      title: "Transparansi Operasional",
      desc: "Laporan performa, dashboard real-time, dan review berkala memastikan keputusan berbasis data.",
   },
];

export default feature_data;