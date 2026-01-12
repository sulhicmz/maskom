import { filterItems } from "@/utils/dataFilters";
import { ProcessItem } from "@/types/data";
import { createPageIndex, type PageIndex } from "@/utils/dataIndex";

import work_1 from "@/assets/images/gallery/work-1.svg"
import work_2 from "@/assets/images/gallery/work-2.svg"

const process_data: ProcessItem[] = [
   {
      id: 1,
      page: "home_1",
      img: work_1,
      count: "01",
      title: "Discovery & Assessment",
      desc: "Audit kondisi jaringan, analisis kebutuhan bisnis, serta identifikasi risiko operasional secara menyeluruh.",
   },
   {
      id: 2,
      page: "home_1",
      img: work_2,
      count: "02",
      title: "Solution Design & Pilot",
      desc: "Menyusun arsitektur konektivitas, proof-of-concept, dan integrasi dengan infrastruktur yang sudah ada.",
   },
   {
      id: 3,
      page: "home_1",
      img: work_1,
      count: "03",
      title: "Operate & Optimize",
      desc: "Tim NOC memonitor SLA, melakukan incident response, serta memberikan rekomendasi peningkatan berkelanjutan.",
   },
];

export default process_data;

export const home_1_process = filterItems(process_data, "home_1");
export const processByPage: PageIndex<ProcessItem> = createPageIndex(process_data);