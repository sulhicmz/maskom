import Image from "next/image"
import UseCaseDetailsSidebar from "./UseCaseDetailsSidebar"
import WorkArea from "./WorkArea"

import cause_thumb_1 from "@/assets/images/case/case-1.jpg"
import cause_thumb_2 from "@/assets/images/case/case-6.jpg"

const UseCaseDetailsArea = () => {
   return (
      <section className="usecase-details-section pt-120 pb-190">
         <div className="container">
            <div className="row">
               <UseCaseDetailsSidebar />
               <div className="col-lg-8">
                  <div className="case-details-wrapper mb-50">
                     <div className="usecase-wrapper">
                        <div className="post-thumbnail mb-30 wow fadeInDown">
                           <Image src={cause_thumb_1} alt="Case Image" />
                        </div>
                        <div className="post-content wow fadeInUp">
                           <h3 className="mb-25">Modernisasi jaringan ritel nasional Maskom</h3>
                           <p>Maskom dipercaya oleh jaringan ritel dengan lebih dari 120 gerai di Jawa dan Sumatera untuk melakukan modernisasi konektivitas. Tantangan utama mitra kami adalah variasi infrastruktur di setiap lokasi, keterbatasan ruang perangkat, dan kebutuhan integrasi ke aplikasi POS, ERP, serta kamera keamanan yang berjalan 24/7.</p>
                           <p>Tim Maskom merancang solusi end-to-end yang mencakup jaringan fiber sebagai koneksi utama, radio point-to-point untuk lokasi sulit, SD-WAN guna mengatur prioritas aplikasi, serta layanan managed Wi-Fi dan firewall terkelola. Seluruh layanan terhubung dengan Network Operation Center Maskom yang memonitor performa dan keamanan secara real-time.</p>
                           <WorkArea />
                           <h4>Dampak utama implementasi</h4>
                           <p>Setelah enam bulan implementasi bertahap, tim operasional mitra mencatat perbaikan signifikan pada stabilitas operasional kasir, aplikasi inventory, dan transaksi digital. Maskom juga menyediakan portal monitoring khusus untuk manajemen sehingga pengambilan keputusan dapat dilakukan berbasis data.</p>
                           <div className="row">
                              <div className="col-lg-6">
                                 <ul className="check-list style-one mb-25">
                                    <li><i className="flaticon-check"></i>Uptime rata-rata 99,76% di seluruh gerai sejak bulan ketiga.</li>
                                    <li><i className="flaticon-check"></i>Waktu penanganan insiden kritikal turun dari 6 jam menjadi 90 menit.</li>
                                    <li><i className="flaticon-check"></i>Pengelolaan perangkat dilakukan secara remote sehingga tidak perlu kunjungan rutin.</li>
                                 </ul>
                              </div>
                              <div className="col-lg-6">
                                 <ul className="check-list style-one mb-25">
                                    <li><i className="flaticon-check"></i>Segmentasi jaringan khusus IoT dan POS meningkatkan keamanan pembayaran.</li>
                                    <li><i className="flaticon-check"></i>Dashboard performa dan laporan SLA otomatis dikirim setiap pekan.</li>
                                    <li><i className="flaticon-check"></i>Model kontrak fleksibel memungkinkan ekspansi 15 gerai baru tanpa instalasi ulang.</li>
                                 </ul>
                              </div>
                           </div>
                           <p>Maskom tidak hanya menghadirkan konektivitas, tetapi juga tata kelola operasi. Setiap incident direkam dalam sistem tiket, dianalisis akar masalahnya, dan dibahas dalam monthly service review bersama tim pelanggan untuk memastikan peningkatan berkelanjutan.</p>
                           <figure className="mb-35"><Image src={cause_thumb_2} alt="Dokumentasi implementasi Maskom" /></figure>
                           <p>Melalui pendekatan kolaboratif dan dokumentasi teknis yang rapi, perusahaan ritel tersebut kini memiliki standar operasional jaringan yang dapat direplikasi ke cabang baru. Maskom siap memperluas layanan dengan integrasi analytic edge computing dan konektivitas ke pusat data cloud apabila dibutuhkan.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default UseCaseDetailsArea
