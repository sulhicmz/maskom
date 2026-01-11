export interface FeatureHomeOneItem {
   id: number;
   icon: string;
   title: string;
   desc: string;
}

const feature_home_one: FeatureHomeOneItem[] = [
   {
      id: 1,
      icon: "flaticon-communication",
      title: "Jaringan Siap Ekspansi",
      desc: "Skalakan kapasitas bandwidth dan jumlah lokasi tanpa mengganti arsitektur dari awal.",
   },
   {
      id: 2,
      icon: "flaticon-security",
      title: "Keamanan Berlapis",
      desc: "Proteksi firewall, anti-DDoS, dan segmentasi jaringan menjaga data kritikal tetap aman.",
   },
   {
      id: 3,
      icon: "flaticon-support",
      title: "Operasional Terpantau",
      desc: "Monitoring proaktif, alert otomatis, dan tim support responsif siap membantu kapan pun.",
   },
];

export default feature_home_one;
