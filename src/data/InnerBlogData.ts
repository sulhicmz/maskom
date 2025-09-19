import { StaticImageData } from "next/image";

import blog_thumb1 from "@/assets/images/blog/blog-3.jpg"
import blog_thumb2 from "@/assets/images/blog/blog-4.jpg"
import blog_thumb3 from "@/assets/images/blog/blog-5.jpg"

interface DataType {
   id: number,
   thumb: StaticImageData;
   title: string;
   desc: string;
   date: string;
   user: string;
   tag: string;
}

const inner_blog_data: DataType[] = [
   {
      id: 1,
      thumb: blog_thumb1,
      title: "Announces AI Consortium to Shape US Police",
      desc: "Scuba drive are made out of photovoltaic cells that convert the sun’s energy into elect Photovoltaic cells are sandwiched between layers of semi-conducting materials such as silicon. Each layer has different electronic properties that energise",
      date: "23 Nov,2023",
      user: "Aslia gumas",
      tag: "AI, Video Generator",
   },
   {
      id: 2,
      thumb: blog_thumb2,
      title: "Europe's top Experts Discuss Future of AI",
      desc: "Scuba drive are made out of photovoltaic cells that convert the sun’s energy into elect Photovoltaic cells are sandwiched between layers of semi-conducting materials such as silicon. Each layer has different electronic properties that energise",
      date: "23 Nov,2023",
      user: "Aslia gumas",
      tag: "AI, Video Generator",
   },
   {
      id: 3,
      thumb: blog_thumb3,
      title: "Announces AI Consortium to Shape US Police",
      desc: "Scuba drive are made out of photovoltaic cells that convert the sun’s energy into elect Photovoltaic cells are sandwiched between layers of semi-conducting materials such as silicon. Each layer has different electronic properties that energise",
      date: "23 Nov,2023",
      user: "Aslia gumas",
      tag: "AI, Video Generator",
   },
   {
      id: 4,
      thumb: blog_thumb2,
      title: "Europe's top Experts Discuss Future of AI",
      desc: "Scuba drive are made out of photovoltaic cells that convert the sun’s energy into elect Photovoltaic cells are sandwiched between layers of semi-conducting materials such as silicon. Each layer has different electronic properties that energise",
      date: "23 Nov,2023",
      user: "Aslia gumas",
      tag: "AI, Video Generator",
   },
   {
      id: 5,
      thumb: blog_thumb3,
      title: "Announces AI Consortium to Shape US Police",
      desc: "Scuba drive are made out of photovoltaic cells that convert the sun’s energy into elect Photovoltaic cells are sandwiched between layers of semi-conducting materials such as silicon. Each layer has different electronic properties that energise",
      date: "23 Nov,2023",
      user: "Aslia gumas",
      tag: "AI, Video Generator",
   },
];

export default inner_blog_data;