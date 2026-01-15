import { InnerBlogPost } from "@/types/data";
import { createIdIndex, type IdIndex } from "@/utils/dataIndex";

import blog_thumb1 from "@/assets/images/blog/blog-3.jpg"
import blog_thumb2 from "@/assets/images/blog/blog-4.jpg"
import blog_thumb3 from "@/assets/images/blog/blog-5.jpg"

const inner_blog_data: InnerBlogPost[] = [
    {
       id: 1,
       thumb: blog_thumb1,
       title: "Strategi Maskom menjaga pengalaman pelanggan omni-channel",
       desc: "Maskom membantu perusahaan retail nasional mengonsolidasikan konektivitas kasir, aplikasi loyalty, dan CCTV ke satu jaringan terkelola. Artikel ini membahas bagaimana monitoring proaktif dan segmentasi VLAN menekan keluhan pelanggan hingga 70%.",
       date: "2024-03-15",
       user: "Tim Editorial Maskom",
       tagId: 7,
       category: "Konektivitas Terkelola",
       status: "published",
    },
    {
       id: 2,
       thumb: blog_thumb2,
       title: "Checklist kesiapan migrasi jaringan ke SD-WAN",
       desc: "Temukan langkah-langkah penting sebelum mengadopsi SD-WAN: mulai dari audit aplikasi kritikal, pemilihan link cadangan, hingga integrasi keamanan firewall yang konsisten di seluruh cabang.",
       date: "2024-03-08",
       user: "Tim Network Engineering",
       tagId: 1,
       category: "Konektivitas Terkelola",
       status: "published",
    },
    {
       id: 3,
       thumb: blog_thumb3,
       title: "Membangun pusat data edge untuk manufaktur",
       desc: "Maskom berbagi pengalaman dalam menyiapkan konektivitas rendah latensi di pabrik manufaktur yang memanfaatkan IoT dan otomatisasi. Kami menguraikan kebutuhan infrastruktur, keamanan, serta pola operasional yang sukses.",
       date: "2024-03-01",
       user: "Solution Architect Maskom",
       tagId: 8,
       category: "IoT & Edge",
       status: "published",
    },
    {
       id: 4,
       thumb: blog_thumb2,
       title: "Mengukur keberhasilan layanan managed Wi-Fi Maskom",
       desc: "Artikel ini menjelaskan indikator performa utama (KPI) yang dipantau Maskom seperti health score akses poin, kepuasan pengguna, dan efisiensi operasional tim IT pelanggan.",
       date: "2024-02-21",
       user: "Customer Success Team",
       tagId: 9,
       category: "Operasional & Dukungan",
       status: "published",
    },
    {
       id: 5,
       thumb: blog_thumb3,
       title: "Rencana respon insiden siber untuk organisasi modern",
       desc: "Pelajari bagaimana Maskom menyusun playbook keamanan jaringan, koordinasi dengan SOC, dan simulasi serangan berkala untuk memastikan kesiapan menghadapi ancaman siber.",
       date: "2024-02-12",
       user: "Cybersecurity Specialist",
       tagId: 3,
       category: "Keamanan Jaringan",
       status: "published",
    },
    {
       id: 6,
       thumb: blog_thumb1,
       title: "Panduan implementasi jaringan serat optik untuk gedung perkantoran",
       desc: "Artikel ini sedang dalam tahap penulisan dan review oleh tim teknis. Akan membahas standar instalasi, jenis kabel yang digunakan, dan pertimbangan desain untuk jaringan kantor modern.",
       date: "2024-01-20",
       user: "Infrastructure Team",
       tagId: 1,
       category: "Konektivitas Terkelola",
       status: "draft",
    },
    {
       id: 7,
       thumb: blog_thumb2,
       title: "Roadmap teknologi 5G untuk enterprise Indonesia 2025",
       desc: "Artikel ini akan membahas proyeksi adopsi 5G di sektor enterprise Indonesia, use case potensial, dan persiapan yang diperlukan perusahaan untuk memanfaatkan teknologi ini.",
       date: "2024-01-18",
       user: "Strategic Planning Team",
       tagId: 7,
       category: "IoT & Edge",
       status: "scheduled",
       publishDate: "2024-02-01",
    },
 ];

export default inner_blog_data;
export const innerBlogById: IdIndex<InnerBlogPost> = createIdIndex(inner_blog_data);
