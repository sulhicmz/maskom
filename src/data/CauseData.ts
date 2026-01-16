import { filterItems } from "@/utils/dataFilters";
import { CauseItem } from "@/types/data";
import { createPageIndex, type PageIndex } from "@/utils/dataIndex";
import { autoIdArray } from "@/utils/dataAutoId";

const { data: cause_data } = autoIdArray<CauseItem>([
   {
      page: "home_1",
      icon: "flaticon-network",
      title: "Internet Dedicated & Fiber",
      desc: "Koneksi simetris berkecepatan tinggi dengan SLA hingga 99,5% untuk kantor pusat maupun cabang kritikal.",
   },
   {
      page: "home_1",
      icon: "flaticon-automation",
      title: "Managed Wi-Fi & LAN",
      desc: "Perangkat jaringan dimonitor 24/7 dengan konfigurasi otomatis serta dashboard performa real-time.",
   },
   {
      page: "home_1",
      icon: "flaticon-data-analytics",
      title: "SD-WAN & Multi-site",
      desc: "Optimasi jalur koneksi cabang melalui SD-WAN, lengkap dengan kebijakan QoS dan failover otomatis.",
   },
   {
      page: "home_1",
      icon: "flaticon-security",
      title: "Keamanan Jaringan",
      desc: "Firewall terkelola, proteksi DDoS, serta monitoring ancaman untuk melindungi data perusahaan.",
   },
   {
      page: "home_1",
      icon: "flaticon-innovation",
      title: "Network Operation Center",
      desc: "Tim NOC memonitor infrastruktur 24/7, melakukan incident management, dan memberikan laporan berkala.",
   },
   {
      page: "home_1",
      icon: "flaticon-cloud-storage",
      title: "Konektivitas Cloud",
      desc: "Interkoneksi privat ke hyperscaler dan data center lokal untuk aplikasi mission critical Anda.",
   },
], { startFrom: 1 });

export default cause_data;

export const home_1_cause = filterItems(cause_data, "home_1");
export const causeByPage: PageIndex<CauseItem> = createPageIndex(cause_data);