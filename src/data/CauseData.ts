interface DataType {
   id: number;
   page: string;
   icon: string
   title: string;
   desc: string;
}

const cause_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      icon: "flaticon-network",
      title: "Internet Dedicated & Fiber",
      desc: "Koneksi simetris berkecepatan tinggi dengan SLA hingga 99,5% untuk kantor pusat maupun cabang kritikal.",
   },
   {
      id: 2,
      page: "home_1",
      icon: "flaticon-automation",
      title: "Managed Wi-Fi & LAN",
      desc: "Perangkat jaringan dimonitor 24/7 dengan konfigurasi otomatis serta dashboard performa real-time.",
   },
   {
      id: 3,
      page: "home_1",
      icon: "flaticon-data-analytics",
      title: "SD-WAN & Multi-site",
      desc: "Optimasi jalur koneksi cabang melalui SD-WAN, lengkap dengan kebijakan QoS dan failover otomatis.",
   },
   {
      id: 4,
      page: "home_1",
      icon: "flaticon-security",
      title: "Keamanan Jaringan",
      desc: "Firewall terkelola, proteksi DDoS, serta monitoring ancaman untuk melindungi data perusahaan.",
   },
   {
      id: 5,
      page: "home_1",
      icon: "flaticon-innovation",
      title: "Network Operation Center",
      desc: "Tim NOC memonitor infrastruktur 24/7, melakukan incident management, dan memberikan laporan berkala.",
   },
   {
      id: 6,
      page: "home_1",
      icon: "flaticon-cloud-storage",
      title: "Konektivitas Cloud",
      desc: "Interkoneksi privat ke hyperscaler dan data center lokal untuk aplikasi mission critical Anda.",
   },
];

export default cause_data;