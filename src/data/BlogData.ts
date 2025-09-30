import { StaticImageData } from "next/image";
import thumb_1 from "@/assets/images/blog/blog-1.jpg"
import thumb_2 from "@/assets/images/blog/blog-2.jpg"

interface DataType {
   id: number;
   page: string;
   thumb: StaticImageData;
   tag: string;
   title: string;
   date: string;
}

const blog_data: DataType[] = [
   {
      id: 1,
      page: "home_2",
      thumb: thumb_1,
      tag: "Konektivitas",
      title: "Meningkatkan Uptime Jaringan Kantor Cabang dengan SD-WAN",
      date: "12 Mar 2024"
   },
   {
      id: 2,
      page: "home_2",
      thumb: thumb_2,
      tag: "Managed Service",
      title: "Checklist Implementasi Managed Wi-Fi di Lingkungan Retail",
      date: "28 Feb 2024"
   },
];

export default blog_data;