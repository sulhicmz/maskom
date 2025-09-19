import { StaticImageData } from "next/image";

import avatar_1 from "@/assets/images/testimonial/thumb-1.jpg"
import avatar_2 from "@/assets/images/testimonial/thumb-2.jpg"
import avatar_3 from "@/assets/images/testimonial/thumb-3.jpg"
import avatar_4 from "@/assets/images/testimonial/thumb-4.jpg"
import avatar_5 from "@/assets/images/testimonial/thumb-5.jpg"
import avatar_6 from "@/assets/images/testimonial/thumb-6.jpg"
import avatar_7 from "@/assets/images/testimonial/thumb-7.jpg"
import avatar_8 from "@/assets/images/testimonial/thumb-8.jpg"
import avatar_9 from "@/assets/images/testimonial/thumb-9.jpg"

interface DataType {
   id: number;
   page: string;
   avatar: StaticImageData;
   name: string;
   designation: string;
   desc: string;
   rating: string;
}

const testi_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      avatar: avatar_1,
      name: "Esther Howard",
      designation: "Product Designer",
      desc: "They just disclosed the new lengthy structure article essayist 3.0, and I moved toward it with alert, The result is excellent instruments.",
      rating: "5.0"
   },
   {
      id: 2,
      page: "home_1",
      avatar: avatar_2,
      name: "Jenny Wilson",
      designation: "Product Designer",
      desc: "They just disclosed the new lengthy structure article essayist 3.0, and I moved toward it with alert, The result is excellent instruments.",
      rating: "5.0"
   },
   {
      id: 3,
      page: "home_1",
      avatar: avatar_3,
      name: "Guy Hawkins",
      designation: "Product Designer",
      desc: "They just disclosed the new lengthy structure article essayist 3.0, and I moved toward it with alert, The result is excellent instruments.",
      rating: "5.0"
   },
   {
      id: 4,
      page: "home_1",
      avatar: avatar_4,
      name: "Bessie Cooper",
      designation: "Product Designer",
      desc: "They just disclosed the new lengthy structure article essayist 3.0, and I moved toward it with alert, The result is excellent instruments.",
      rating: "5.0"
   },
   {
      id: 5,
      page: "home_1",
      avatar: avatar_5,
      name: "Kathryn Murphy",
      designation: "Product Designer",
      desc: "They just disclosed the new lengthy structure article essayist 3.0, and I moved toward it with alert, The result is excellent instruments.",
      rating: "5.0"
   },
   {
      id: 6,
      page: "home_1",
      avatar: avatar_6,
      name: "Marvin McKinney",
      designation: "Product Designer",
      desc: "They just disclosed the new lengthy structure article essayist 3.0, and I moved toward it with alert, The result is excellent instruments.",
      rating: "5.0"
   },

   // home_2

   {
      id: 1,
      page: "home_2",
      avatar: avatar_7,
      name: "Esther Howard",
      designation: "Product Designer",
      desc: "They just disclosed the new lengthy structure article essayist 3.0, and I moved toward it with alert, The result is excellent instruments.",
      rating: "5.0"
   },
   {
      id: 2,
      page: "home_2",
      avatar: avatar_8,
      name: "Esther Howard",
      designation: "Product Designer",
      desc: "They just disclosed the new lengthy structure article essayist 3.0, and I moved toward it with alert, The result is excellent instruments.",
      rating: "5.0"
   },
   {
      id: 3,
      page: "home_2",
      avatar: avatar_9,
      name: "Esther Howard",
      designation: "Product Designer",
      desc: "They just disclosed the new lengthy structure article essayist 3.0, and I moved toward it with alert, The result is excellent instruments.",
      rating: "5.0"
   },
   {
      id: 4,
      page: "home_2",
      avatar: avatar_8,
      name: "Esther Howard",
      designation: "Product Designer",
      desc: "They just disclosed the new lengthy structure article essayist 3.0, and I moved toward it with alert, The result is excellent instruments.",
      rating: "5.0"
   },
];

export default testi_data;