import { StaticImageData } from "next/image";

import work_1 from "@/assets/images/gallery/work-1.jpg"
import work_2 from "@/assets/images/gallery/work-2.jpg"

interface DataType {
   id: number;
   page: string;
   img: StaticImageData
   count: string
   title: string;
   desc: string;
}

const process_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      img: work_1,
      count: "01",
      title: "Select Writhing Template",
      desc: "Templates are pre-designed, that can guide the organization and layout of your writing, whether",
   },
   {
      id: 2,
      page: "home_1",
      img: work_2,
      count: "02",
      title: "Select Writhing Template",
      desc: "Templates are pre-designed, that can guide the organization and layout of your writing, whether",
   },
   {
      id: 3,
      page: "home_1",
      img: work_1,
      count: "03",
      title: "Select Writhing Template",
      desc: "Templates are pre-designed, that can guide the organization and layout of your writing, whether",
   },
];

export default process_data;