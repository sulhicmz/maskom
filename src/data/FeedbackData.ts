interface DataType {
   id: number;
   page: string;
   name: string;
   title: string;
   company: string;
   desc: string;
   rating: string;
}

const testi_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      name: "Rizky Pratama",
      title: "Head of IT",
      company: "Supermart Retail Group",
      desc: "SLA Maskom selalu tercapai. Saat ada kendala di salah satu cabang, tim NOC langsung koordinasi dan memberikan solusi sementara sambil menyiapkan perbaikan permanen.",
      rating: "4.9"
   },
   {
      id: 2,
      page: "home_1",
      name: "Maria Santoso",
      title: "Head of Operations",
      company: "TasteLab Hospitality",
      desc: "Implementasi managed Wi-Fi dari Maskom membuat kami bisa memonitor kualitas jaringan setiap gerai secara real-time dan menekan keluhan pelanggan hingga 70%.",
      rating: "5.0"
   },
   {
      id: 3,
      page: "home_1",
      name: "Budi Hartanto",
      title: "CIO",
      company: "PrimaLog Distribusi",
      desc: "Solusi SD-WAN Maskom membantu kami menjaga prioritas aplikasi logistik. Tim mereka terlibat sejak desain hingga operasional harian.",
      rating: "4.8"
   },
   {
      id: 4,
      page: "home_1",
      name: "Ayu Lestari",
      title: "IT Infrastructure Lead",
      company: "Medika Sejahtera",
      desc: "Maskom memahami standar keamanan data kami. Managed firewall dan dukungan audit sangat membantu menjaga kepatuhan regulasi.",
      rating: "5.0"
   },
   {
      id: 5,
      page: "home_1",
      name: "Dewi Anindya",
      title: "COO",
      company: "Galaxy Manufacturing",
      desc: "Dengan konektivitas Maskom, integrasi IoT di pabrik berjalan lancar. Mereka juga memberi pelatihan tim internal kami.",
      rating: "4.9"
   },
   {
      id: 6,
      page: "home_1",
      name: "Fadli Siregar",
      title: "Plant Manager",
      company: "Energi Mandiri Nusantara",
      desc: "Tim Maskom responsif dan mudah diajak diskusi teknis. Mereka membantu kami membuat SOP penanganan insiden yang jelas.",
      rating: "4.9"
   },

   // home_2

   {
      id: 1,
      page: "home_2",
      name: "Dimas Prakoso",
      title: "Head of IT",
      company: "FinOne Capital",
      desc: "Portal monitoring Maskom memudahkan kami mengaudit kualitas jaringan kantor cabang. Data historisnya sangat membantu saat evaluasi SLA dengan manajemen.",
      rating: "5.0"
   },
   {
      id: 2,
      page: "home_2",
      name: "Sylvia Hartono",
      title: "Operations Director",
      company: "VistaStay Hotels",
      desc: "Maskom sigap melakukan penyesuaian konfigurasi saat kami meluncurkan aplikasi check-in digital. Kolaborasi teknisnya terasa seperti satu tim.",
      rating: "4.9"
   },
   {
      id: 3,
      page: "home_2",
      name: "Akbar Maulana",
      title: "IT Security Lead",
      company: "PayLink Fintech",
      desc: "Managed firewall Maskom dilengkapi laporan yang jelas sehingga memudahkan kami memenuhi audit regulator. Tim mereka juga suportif saat uji penetrasi.",
      rating: "5.0"
   },
   {
      id: 4,
      page: "home_2",
      name: "Lina Sasmita",
      title: "Digital Product Manager",
      company: "TransHub Teknologi",
      desc: "Integrasi API Maskom membuat dashboard internal kami bisa menampilkan status koneksi real-time tanpa harus membuka banyak sistem.",
      rating: "4.8"
   },
];

export default testi_data;
