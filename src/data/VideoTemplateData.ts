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
      title: "Monitoring Network Operation Center",
      desc: "Cuplikan layar real-time dari Command Center Maskom yang menampilkan status ribuan perangkat jaringan, tren bandwidth, dan notifikasi otomatis."
   },
   {
      id: 2,
      page: "home_3",
      thumb: thumb_2,
      title: "Instalasi fiber & perangkat outdoor",
      desc: "Dokumentasi proses pembangunan jalur fiber Maskom lengkap dengan tahapan survey, penarikan kabel, hingga pengujian redaman."
   },
   {
      id: 3,
      page: "home_3",
      thumb: thumb_3,
      title: "Workshop keamanan jaringan bersama pelanggan",
      desc: "Sesi pelatihan Maskom yang membahas strategi Zero Trust, konfigurasi firewall, dan simulasi incident response untuk tim TI klien."
   },
   {
      id: 4,
      page: "home_3",
      thumb: thumb_4,
      title: "Implementasi SD-WAN multi-cabang",
      desc: "Highlight pemasangan perangkat SD-WAN Maskom di beberapa cabang retail, menampilkan proses konfigurasi dan uji failover."
   },
   {
      id: 5,
      page: "home_3",
      thumb: thumb_5,
      title: "Review layanan bersama manajemen pelanggan",
      desc: "Cuplikan rapat tinjauan layanan Maskom yang mempresentasikan KPI SLA, rekomendasi optimasi, dan roadmap ekspansi jaringan."
   },
   {
      id: 6,
      page: "home_3",
      thumb: thumb_6,
      title: "Laboratorium pengujian perangkat Maskom",
      desc: "Proses quality assurance terhadap perangkat jaringan sebelum dikirim ke lokasi pelanggan, termasuk stress test dan sertifikasi keselamatan."
   },
];

export default video_data;