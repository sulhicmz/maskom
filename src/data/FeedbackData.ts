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
      name: "Rizky Pratama",
      designation: "IT Manager, Retail Nasional",
      desc: "SLA Maskom selalu tercapai. Saat ada kendala di salah satu cabang, tim NOC langsung koordinasi dan memberikan solusi sementara sambil menyiapkan perbaikan permanen.",
      rating: "4.9"
   },
   {
      id: 2,
      page: "home_1",
      avatar: avatar_2,
      name: "Maria Santoso",
      designation: "Head of Operations, F&B Chain",
      desc: "Implementasi managed Wi-Fi dari Maskom membuat kami bisa memonitor kualitas jaringan setiap gerai secara real-time dan menekan keluhan pelanggan hingga 70%.",
      rating: "5.0"
   },
   {
      id: 3,
      page: "home_1",
      avatar: avatar_3,
      name: "Budi Hartanto",
      designation: "CIO, Perusahaan Logistik",
      desc: "Solusi SD-WAN Maskom membantu kami menjaga prioritas aplikasi logistik. Tim mereka terlibat sejak desain hingga operasional harian.",
      rating: "4.8"
   },
   {
      id: 4,
      page: "home_1",
      avatar: avatar_4,
      name: "Ayu Lestari",
      designation: "IT Infrastructure Lead, Healthcare",
      desc: "Maskom memahami standar keamanan data kami. Managed firewall dan dukungan audit sangat membantu menjaga kepatuhan regulasi.",
      rating: "5.0"
   },
   {
      id: 5,
      page: "home_1",
      avatar: avatar_5,
      name: "Dewi Anindya",
      designation: "COO, Manufaktur",
      desc: "Dengan konektivitas Maskom, integrasi IoT di pabrik berjalan lancar. Mereka juga memberi pelatihan tim internal kami.",
      rating: "4.9"
   },
   {
      id: 6,
      page: "home_1",
      avatar: avatar_6,
      name: "Fadli Siregar",
      designation: "Plant Manager, Energi",
      desc: "Tim Maskom responsif dan mudah diajak diskusi teknis. Mereka membantu kami membuat SOP penanganan insiden yang jelas.",
      rating: "4.9"
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