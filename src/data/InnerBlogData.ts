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
      title: "Strategi Maskom menjaga pengalaman pelanggan omni-channel",
      desc: "Maskom membantu perusahaan retail nasional mengonsolidasikan konektivitas kasir, aplikasi loyalty, dan CCTV ke satu jaringan terkelola. Artikel ini membahas bagaimana monitoring proaktif dan segmentasi VLAN menekan keluhan pelanggan hingga 70%.",
      date: "15 Mar 2024",
      user: "Tim Editorial Maskom",
      tag: "Managed Service",
   },
   {
      id: 2,
      thumb: blog_thumb2,
      title: "Checklist kesiapan migrasi jaringan ke SD-WAN",
      desc: "Temukan langkah-langkah penting sebelum mengadopsi SD-WAN: mulai dari audit aplikasi kritikal, pemilihan link cadangan, hingga integrasi keamanan firewall yang konsisten di seluruh cabang.",
      date: "8 Mar 2024",
      user: "Tim Network Engineering",
      tag: "SD-WAN",
   },
   {
      id: 3,
      thumb: blog_thumb3,
      title: "Membangun pusat data edge untuk manufaktur",
      desc: "Maskom berbagi pengalaman dalam menyiapkan konektivitas rendah latensi di pabrik manufaktur yang memanfaatkan IoT dan otomatisasi. Kami menguraikan kebutuhan infrastruktur, keamanan, serta pola operasional yang sukses.",
      date: "1 Mar 2024",
      user: "Solution Architect Maskom",
      tag: "Infrastruktur",
   },
   {
      id: 4,
      thumb: blog_thumb2,
      title: "Mengukur keberhasilan layanan managed Wi-Fi Maskom",
      desc: "Artikel ini menjelaskan indikator performa utama (KPI) yang dipantau Maskom seperti health score akses poin, kepuasan pengguna, dan efisiensi operasional tim IT pelanggan.",
      date: "21 Feb 2024",
      user: "Customer Success Team",
      tag: "Wi-Fi",
   },
   {
      id: 5,
      thumb: blog_thumb3,
      title: "Rencana respon insiden siber untuk organisasi modern",
      desc: "Pelajari bagaimana Maskom menyusun playbook keamanan jaringan, koordinasi dengan SOC, dan simulasi serangan berkala untuk memastikan kesiapan menghadapi ancaman siber.",
      date: "12 Feb 2024",
      user: "Cybersecurity Specialist",
      tag: "Keamanan",
   },
];

export default inner_blog_data;