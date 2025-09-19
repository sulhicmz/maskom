import gallery_1 from "@/assets/images/gallery/gl-1.jpg"
import gallery_2 from "@/assets/images/gallery/gl-2.jpg"
import gallery_3 from "@/assets/images/gallery/gl-3.jpg"
import gallery_4 from "@/assets/images/gallery/gl-4.jpg"
import gallery_5 from "@/assets/images/gallery/gl-5.jpg"
import gallery_6 from "@/assets/images/gallery/gl-6.jpg"
import gallery_7 from "@/assets/images/gallery/gl-7.jpg"
import gallery_8 from "@/assets/images/gallery/gl-8.jpg"
import gallery_9 from "@/assets/images/gallery/gl-9.jpg"
import gallery_10 from "@/assets/images/gallery/gl-10.jpg"
import { StaticImageData } from "next/image"

interface DataType {
   id: number;
   page:string;
   img: StaticImageData[];
   category: string
}

const gallery_data: DataType[] = [
   {
      id: 1,
      page:"home_2",
      img: [gallery_1, gallery_2],
      category: "realistic illustration",
   },
   {
      id: 2,
      page:"home_2",
      img: [gallery_3, gallery_4],
      category: "realistic oil",
   },
   {
      id: 3,
      page:"home_2",
      img: [gallery_5, gallery_6],
      category: "illustration cyberpunk oil",
   },
   {
      id: 4,
      page:"home_2",
      img: [gallery_7, gallery_8],
      category: "cartoon threed illustration oil",
   },
   {
      id: 5,
      page:"home_2",
      img: [gallery_9, gallery_10],
      category: "oil illustration cartoon realistic threed cyberpunk",
   },
];

export default gallery_data;