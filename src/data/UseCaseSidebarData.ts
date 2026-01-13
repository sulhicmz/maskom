import { UseCaseSidebarItem } from "@/types/data";
import { createIdIndex, type IdIndex } from "@/utils/dataIndex";

const use_case_sidebar_data: UseCaseSidebarItem[] = [
   {
      id: 1,
      title: "Integrasi Konektivitas Ritel Nasional",
      link: "/use-case-details",
      active: true
   },
   {
      id: 2,
      title: "Managed Wi-Fi untuk F&B Chain",
      link: "/use-case-details"
   },
   {
      id: 3,
      title: "SD-WAN & Prioritas Aplikasi Logistik",
      link: "/use-case-details"
   },
   {
      id: 4,
      title: "Keamanan Jaringan Rumah Sakit",
      link: "/use-case-details"
   },
   {
      id: 5,
      title: "Interkoneksi Data Center & Cloud",
      link: "/use-case-details"
   }
];

export default use_case_sidebar_data;
export const useCaseSidebarById: IdIndex<UseCaseSidebarItem> = createIdIndex(use_case_sidebar_data);
