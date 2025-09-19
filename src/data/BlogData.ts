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
      tag: "Technology",
      title: "Miko Acquires Majority Stake in AI Gaming Startup",
      date: "23 Jan,2024"
   },
   {
      id: 2,
      page: "home_2",
      thumb: thumb_2,
      tag: "Image Generator",
      title: "Miko Acquires Majority Stake in AI Gaming Startup",
      date: "23 Jan,2024"
   },
];

export default blog_data;