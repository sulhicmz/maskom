import { StaticImageData } from "next/image";
import thumb_1 from "@/assets/images/video/video-1.jpg"
import thumb_2 from "@/assets/images/video/video-2.jpg"
import thumb_3 from "@/assets/images/video/video-3.jpg"
import thumb_4 from "@/assets/images/video/video-4.jpg"
import thumb_5 from "@/assets/images/video/video-5.jpg"
import thumb_6 from "@/assets/images/video/video-6.jpg"

interface DataType {
   id: number;
   page: string;
   thumb: StaticImageData;
   title: string;
   desc: string;
}

const video_data: DataType[] = [
   {
      id: 1,
      page: "home_3",
      thumb: thumb_1,
      title: "Construction Site Video Template",
      desc: "This is a simple construction site template that you can fully customise according to your needs.This is a simple construction site template."
   },
   {
      id: 2,
      page: "home_3",
      thumb: thumb_2,
      title: "Dark Template",
      desc: "This is a simple construction site template that you can fully customise according to your needs.This is a simple construction site template."
   },
   {
      id: 3,
      page: "home_3",
      thumb: thumb_3,
      title: "Movie Camping Template",
      desc: "This is a simple construction site template that you can fully customise according to your needs.This is a simple construction site template."
   },
   {
      id: 4,
      page: "home_3",
      thumb: thumb_4,
      title: "Video Conference Template",
      desc: "This is a simple construction site template that you can fully customise according to your needs.This is a simple construction site template."
   },
   {
      id: 5,
      page: "home_3",
      thumb: thumb_5,
      title: "Business Template",
      desc: "This is a simple construction site template that you can fully customise according to your needs.This is a simple construction site template."
   },
   {
      id: 6,
      page: "home_3",
      thumb: thumb_6,
      title: "Development Template",
      desc: "This is a simple construction site template that you can fully customise according to your needs.This is a simple construction site template."
   },
];

export default video_data;