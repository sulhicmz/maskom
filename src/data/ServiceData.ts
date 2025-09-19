// Service Data

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  link: string;
  features: string[];
  image: string;
}

const serviceData: Service[] = [
  {
    id: 1,
    title: "Solusi Jaringan/WiFi",
    description: "Kami menyediakan solusi jaringan dan WiFi yang andal dan aman untuk bisnis Anda. Dari desain jaringan hingga pemeliharaan, tim kami akan memastikan konektivitas yang optimal.",
    icon: "/assets/images/services/network-icon.png", // Public asset path
    link: "/services/network-wifi",
    features: [
      "Desain dan implementasi jaringan",
      "Optimasi kinerja WiFi",
      "Keamanan jaringan",
      "Pemeliharaan dan dukungan",
      "Pemantauan 24/7"
    ],
    image: "/assets/images/services/network-wifi.jpg" // Public asset path
  },
  {
    id: 2,
    title: "Pengembangan Website",
    description: "Kami membuat website yang menarik, responsif, dan dioptimalkan untuk mesin pencari. Dari website sederhana hingga e-commerce kompleks, kami memiliki solusi yang tepat untuk kebutuhan bisnis Anda.",
    icon: "/assets/images/services/website-icon.png", // Public asset path
    link: "/services/website-development",
    features: [
      "Desain website responsif",
      "Pengembangan frontend dan backend",
      "Integrasi sistem",
      "Optimasi SEO",
      "Pemeliharaan dan dukungan"
    ],
    image: "/assets/images/services/website-development.jpg" // Public asset path
  },
  {
    id: 3,
    title: "Otomatisasi AI",
    description: "Kami membantu bisnis Anda mengadopsi teknologi AI untuk mengotomatisasi proses dan meningkatkan efisiensi. Dari chatbot hingga analisis prediktif, kami menyediakan solusi AI yang disesuaikan dengan kebutuhan Anda.",
    icon: "/assets/images/services/ai-icon.png", // Public asset path
    link: "/services/ai-automation",
    features: [
      "Chatbot dan asisten virtual",
      "Analisis data dan prediktif",
      "Otomatisasi proses bisnis",
      "Integrasi AI dengan sistem yang ada",
      "Pelatihan dan dukungan"
    ],
    image: "/assets/images/services/ai-automation.jpg" // Public asset path
  }
];

export default serviceData;