// Service Data

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  link: string;
  features: string[];
  image: string;
  detailedDescription?: string;
  technicalSpecs?: string[];
  useCases?: string[];
  pricing?: {
    title: string;
    price: number;
    features: string[];
  }[];
}

const serviceData: Service[] = [
  {
    id: 1,
    title: "Solusi Jaringan/WiFi",
    description: "Kami menyediakan solusi jaringan dan WiFi yang andal dan aman untuk bisnis Anda. Dari desain jaringan hingga pemeliharaan, tim kami akan memastikan konektivitas yang optimal.",
    detailedDescription: `
      <p>Layanan Solusi Jaringan/WiFi kami dirancang untuk memberikan konektivitas yang andal, aman, dan skalabel bagi bisnis dari berbagai ukuran. Kami memahami bahwa infrastruktur jaringan yang kuat adalah tulang punggung operasi bisnis modern, dan tim ahli kami berkomitmen untuk memberikan solusi yang disesuaikan dengan kebutuhan spesifik Anda.</p>
      
      <p>Dengan pengalaman bertahun-tahun dalam merancang dan mengimplementasikan jaringan untuk berbagai industri, kami telah membantu banyak bisnis meningkatkan efisiensi operasional, kepuasan pelanggan, dan keamanan data melalui solusi jaringan yang inovatif.</p>
    `,
    icon: "/assets/images/services/network-icon.png", // Public asset path
    link: "/services/network-wifi",
    features: [
      "WiFi hotspot untuk bisnis (cafe, restoran, hotel)",
      "Solusi WiFi perusahaan dengan manajemen terpusat",
      "Keamanan jaringan (firewall, deteksi intrusi)",
      "Pemantauan dan analitik jaringan",
      "Solusi VPN untuk akses jarak jauh",
      "Desain dan implementasi jaringan",
      "Optimasi kinerja WiFi",
      "Pemeliharaan dan dukungan",
      "Pemantauan 24/7"
    ],
    technicalSpecs: [
      "Dukungan standar WiFi terbaru (802.11ax/WiFi 6)",
      "Arsitektur jaringan terdistribusi dan terpusat",
      "Enkripsi tingkat perusahaan (WPA3, IPSec)",
      "Firewall next-generation dengan deteksi dan pencegahan intrusi",
      "Monitoring real-time dengan dashboard analitik",
      "Kompatibilitas dengan berbagai vendor perangkat jaringan",
      "Skalabilitas untuk jaringan kecil hingga perusahaan besar"
    ],
    useCases: [
      "Hotel dan resor membutuhkan WiFi premium untuk tamu",
      "Restoran dan cafe ingin menawarkan WiFi gratis untuk pelanggan",
      "Kantor perusahaan membutuhkan jaringan aman dan terkelola",
      "Pusat perbelanjaan membutuhkan solusi WiFi terdistribusi",
      "Universitas dan sekolah membutuhkan jaringan kampus yang andal",
      "Rumah sakit membutuhkan konektivitas aman untuk perangkat medis"
    ],
    image: "/assets/images/services/network-wifi.jpg" // Public asset path
  },
  {
    id: 2,
    title: "Pengembangan Website",
    description: "Kami membuat website yang menarik, responsif, dan dioptimalkan untuk mesin pencari. Dari website sederhana hingga e-commerce kompleks, kami memiliki solusi yang tepat untuk kebutuhan bisnis Anda.",
    detailedDescription: `
      <p>Layanan Pengembangan Website kami dirancang untuk memberikan solusi digital yang kuat dan efektif bagi bisnis dari berbagai ukuran. Kami memahami bahwa website yang profesional adalah alat pemasaran yang sangat penting dalam era digital saat ini, dan tim ahli kami berkomitmen untuk menciptakan website yang tidak hanya menarik secara visual tetapi juga berkinerja tinggi dan ramah SEO.</p>
      
      <p>Dengan pengalaman bertahun-tahun dalam mengembangkan website untuk berbagai industri, kami telah membantu banyak bisnis meningkatkan kehadiran online mereka, menghasilkan lebih banyak prospek, dan meningkatkan penjualan melalui solusi website yang inovatif dan terukur.</p>
      
      <h3>Layanan Pengembangan Website Kami:</h3>
      <ul>
        <li><strong>Desain dan Pengembangan Website Responsif:</strong> Kami membuat website yang terlihat sempurna di semua perangkat, mulai dari desktop hingga smartphone dan tablet.</li>
        <li><strong>Pengembangan E-commerce:</strong> Solusi toko online lengkap dengan integrasi pembayaran dan sistem manajemen inventaris.</li>
        <li><strong>Implementasi CMS:</strong> Website yang mudah dikelola dengan sistem manajemen konten seperti WordPress, Joomla, atau solusi kustom.</li>
        <li><strong>Optimasi SEO dan Integrasi Pemasaran Digital:</strong> Website yang dirancang untuk menduduki peringkat tinggi di mesin pencari dan mengintegrasikan alat pemasaran digital.</li>
        <li><strong>Pemeliharaan dan Dukungan Website:</strong> Layanan berkelanjutan untuk memastikan website Anda tetap aman, terbaru, dan berkinerja tinggi.</li>
      </ul>
    `,
    icon: "/assets/images/services/website-icon.png", // Public asset path
    link: "/services/website-development",
    features: [
      "Desain website responsif",
      "Pengembangan frontend dan backend",
      "Integrasi sistem",
      "Optimasi SEO",
      "Pemeliharaan dan dukungan",
      "E-commerce (Shopify, Tokopedia, Bukalapak)",
      "Implementasi CMS",
      "Integrasi pemasaran digital"
    ],
    technicalSpecs: [
      "HTML5, CSS3, JavaScript (ES6+)",
      "Framework frontend: React.js, Next.js, Vue.js",
      "Framework backend: Node.js, Express.js, Laravel, Django",
      "Database: MySQL, PostgreSQL, MongoDB",
      "Hosting: Vercel, Netlify, AWS, Google Cloud",
      "SEO: Meta tags, structured data, sitemap.xml",
      "Keamanan: HTTPS, SSL certificates, keamanan aplikasi web",
      "Performa: Optimasi gambar, lazy loading, CDN",
      "Responsif: Desain mobile-first, breakpoint khusus"
    ],
    useCases: [
      "UMKM ingin memiliki website profesional untuk mempromosikan produk/jasa mereka",
      "Perusahaan e-commerce membutuhkan toko online yang andal dan skalabel",
      "Organisasi non-profit membutuhkan website untuk kampanye dan penggalangan dana",
      "Restoran ingin menampilkan menu online dan menerima pesanan",
      "Portofolio profesional untuk menampilkan karya dan kualifikasi",
      "Blog pribadi atau korporat untuk berbagi pengetahuan dan wawasan"
    ],
    image: "/assets/images/services/website-development.jpg" // Public asset path
  },
  {
    id: 3,
    title: "Otomatisasi AI",
    description: "Kami membantu bisnis Anda mengadopsi teknologi AI untuk mengotomatisasi proses dan meningkatkan efisiensi. Dari chatbot hingga analisis prediktif, kami menyediakan solusi AI yang disesuaikan dengan kebutuhan Anda.",
    detailedDescription: `
      <p>Layanan Otomatisasi AI kami dirancang untuk memberikan solusi cerdas dan efisien bagi bisnis dari berbagai ukuran. Kami memahami bahwa adopsi teknologi AI adalah langkah penting dalam era digital saat ini, dan tim ahli kami berkomitmen untuk menciptakan solusi AI yang tidak hanya inovatif tetapi juga praktis dan dapat diimplementasikan dengan mudah.</p>
      
      <p>Dengan pengalaman bertahun-tahun dalam mengembangkan dan mengimplementasikan solusi AI untuk berbagai industri, kami telah membantu banyak bisnis meningkatkan produktivitas, mengurangi biaya operasional, dan memberikan pengalaman pelanggan yang lebih baik melalui solusi AI yang canggih dan terukur.</p>
      
      <h3>Layanan Otomatisasi AI Kami:</h3>
      <ul>
        <li><strong>Chatbot dan Asisten Virtual:</strong> Solusi layanan pelanggan otomatis berbasis AI yang dapat menangani pertanyaan umum, memesan layanan, dan memberikan dukungan 24/7.</li>
        <li><strong>Otomatisasi Proses Bisnis:</strong> Mengotomatisasi tugas-tugas rutin dan proses bisnis kompleks menggunakan teknologi AI dan integrasi dengan platform seperti Zapier/Make.</li>
        <li><strong>Analisis Prediktif dan Wawasan Data:</strong> Menggunakan algoritma AI untuk menganalisis data bisnis dan memberikan prediksi serta wawasan yang dapat membantu pengambilan keputusan.</li>
        <li><strong>Otomatisasi Pemasaran AI:</strong> Kampanye email prediktif dan personalisasi konten berdasarkan perilaku dan preferensi pelanggan.</li>
        <li><strong>Manajemen Inventaris dan Rantai Pasok dengan AI:</strong> Mengoptimalkan pengelolaan inventaris dan rantai pasok menggunakan prediksi permintaan berbasis AI.</li>
      </ul>
    `,
    icon: "/assets/images/services/ai-icon.png", // Public asset path
    link: "/services/ai-automation",
    features: [
      "Chatbot dan asisten virtual berbasis AI (OpenAI/GPT-4)",
      "Otomatisasi proses bisnis menggunakan Zapier/Make",
      "Analisis data dan prediktif berbasis AI",
      "Otomatisasi pemasaran dengan kampanye email prediktif",
      "Manajemen inventaris dan rantai pasok dengan AI",
      "Integrasi AI dengan sistem yang ada",
      "Pelatihan dan dukungan teknis"
    ],
    technicalSpecs: [
      "Integrasi dengan OpenAI/GPT-4 API untuk chatbot dan analisis bahasa alami",
      "Platform otomatisasi: Zapier, Make (Integromat), dan solusi kustom",
      "Algoritma machine learning untuk analisis prediktif dan rekomendasi",
      "Integrasi dengan sistem CRM dan ERP yang ada",
      "Dashboard analitik real-time dengan visualisasi data",
      "Arsitektur berbasis cloud untuk skalabilitas dan keandalan",
      "Keamanan data tingkat perusahaan dengan enkripsi end-to-end"
    ],
    useCases: [
      "UMKM ingin meningkatkan layanan pelanggan dengan chatbot 24/7",
      "Perusahaan manufaktur membutuhkan otomatisasi proses produksi",
      "Retailer online ingin menggunakan analisis prediktif untuk manajemen inventaris",
      "Penyedia layanan keuangan membutuhkan sistem deteksi penipuan berbasis AI",
      "Platform e-learning ingin memberikan rekomendasi kursus yang dipersonalisasi",
      "Perusahaan logistik ingin mengoptimalkan rute pengiriman dengan AI"
    ],
    image: "/assets/images/services/ai-automation.jpg", // Public asset path
    pricing: [
      {
        title: "Paket Starter",
        price: 2500000,
        features: [
          "Implementasi chatbot dasar dengan 10 pertanyaan umum",
          "Dasbor analitik dasar",
          "Integrasi dengan 2 platform (misalnya WhatsApp, website)",
          "Dukungan teknis 24/7 selama 1 bulan",
          "Pelatihan pengguna 2 sesi"
        ]
      },
      {
        title: "Paket Bisnis",
        price: 500000,
        features: [
          "Implementasi chatbot lanjutan dengan 500 pertanyaan",
          "Dasbor analitik lengkap dengan visualisasi data",
          "Integrasi dengan hingga 5 platform",
          "Otomatisasi proses bisnis dasar (3 proses)",
          "Dukungan teknis 24/7 selama 3 bulan",
          "Pelatihan pengguna 4 sesi",
          "Laporan bulanan kinerja"
        ]
      },
      {
        title: "Paket Enterprise",
        price: 10000000,
        features: [
          "Implementasi chatbot enterprise dengan pertanyaan tak terbatas",
          "Dasbor analitik enterprise dengan AI prediktif",
          "Integrasi dengan platform tak terbatas",
          "Otomatisasi proses bisnis kompleks (10+ proses)",
          "Dukungan teknis 24/7 selama 12 bulan",
          "Pelatihan pengguna 8 sesi",
          "Laporan bulanan kinerja",
          "Konsultasi strategi AI khusus"
        ]
      }
    ]
  }
];

export default serviceData;