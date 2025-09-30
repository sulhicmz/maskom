interface DataType {
   id: number;
   page: string;
   quesstion: string;
   answer: string;
}

const faq_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      quesstion: "Apa saja cakupan layanan Maskom?",
      answer: "Kami menyediakan konektivitas fiber & wireless, managed Wi-Fi dan LAN, SD-WAN, keamanan jaringan, layanan NOC 24/7, hingga direct cloud connect sesuai kebutuhan bisnis Anda.",
   },
   {
      id: 2,
      page: "home_1",
      quesstion: "Seberapa cepat proses instalasi jaringan?",
      answer: "Estimasi instalasi tergantung kesiapan infrastruktur lokasi. Untuk area dengan jaringan Maskom, provisioning dapat selesai dalam 7-10 hari kerja termasuk aktivasi perangkat dan uji kelayakan layanan.",
   },
   {
      id: 3,
      page: "home_1",
      quesstion: "Bagaimana mekanisme dukungan teknis Maskom?",
      answer: "Tim NOC kami memonitor jaringan secara proaktif dan siap menangani insiden melalui helpdesk 24/7. Untuk kasus kritikal, engineer on-site akan dikirim sesuai SLA yang disepakati.",
   },

   // home_2

   {
      id: 1,
      page: "home_2",
      quesstion: "Apa saja komponen layanan managed service Maskom?",
      answer: "Paket managed service mencakup penyediaan perangkat, instalasi, pemantauan, pemeliharaan, serta dukungan teknis terstruktur. Anda dapat memilih layanan tambahan seperti laporan compliance atau integrasi dengan sistem ITSM.",
   },
   {
      id: 2,
      page: "home_2",
      quesstion: "Bagaimana Maskom menjamin keamanan jaringan pelanggan?",
      answer: "Kami menerapkan kebijakan firewall berlapis, segmentasi jaringan, enkripsi VPN, dan inspeksi trafik secara real-time. Audit keamanan dan penetration test dapat dijadwalkan sesuai kebutuhan.",
   },
   {
      id: 3,
      page: "home_2",
      quesstion: "Bisakah Maskom membantu integrasi ke sistem monitoring internal?",
      answer: "Ya. Maskom menyediakan API dan opsi SNMP/NetFlow sehingga data performa dapat diintegrasikan ke platform monitoring Anda. Tim kami akan membantu proses konfigurasi dan dokumentasi.",
   },
   {
      id: 4,
      page: "home_2",
      quesstion: "Apakah ada opsi layanan profesional proyek satu kali?",
      answer: "Selain managed service, Maskom menyediakan professional service seperti site survey, fiber build-out, dan audit jaringan. Durasi dan ruang lingkup akan disesuaikan dengan kebutuhan proyek Anda.",
   },

   // home_3
   {
      id: 1,
      page: "home_3",
      quesstion: "Siapa yang menjadi kontak utama selama implementasi?",
      answer: "Setiap proyek Maskom memiliki project manager dan service delivery manager yang akan menjadi penghubung utama, mulai dari perencanaan hingga handover ke tim operasional.",
   },
   {
      id: 2,
      page: "home_3",
      quesstion: "Berapa lama waktu penyediaan layanan setelah kontrak ditandatangani?",
      answer: "Waktu penyediaan bergantung pada kesiapan infrastruktur. Untuk area dengan jaringan Maskom, provisioning dapat selesai dalam 7-14 hari kerja setelah dokumen dan akses lokasi lengkap.",
   },
   {
      id: 3,
      page: "home_3",
      quesstion: "Apakah Maskom menyediakan dokumentasi teknis lengkap?",
      answer: "Kami memberikan dokumen arsitektur, konfigurasi perangkat, SOP operasional, serta catatan perubahan setiap kali ada update layanan. Seluruh dokumen tersedia di portal pelanggan.",
   },
   {
      id: 4,
      page: "home_3",
      quesstion: "Bagaimana proses terminasi atau migrasi layanan?",
      answer: "Maskom menyiapkan prosedur terminasi yang mencakup pengembalian perangkat, penghapusan data sensitif, serta dukungan migrasi ke layanan baru agar operasional bisnis tetap berjalan.",
   },
];

export default faq_data;