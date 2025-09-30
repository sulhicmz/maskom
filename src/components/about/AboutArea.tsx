import about_img1 from "@/assets/images/about/about-1.jpg"
import about_img2 from "@/assets/images/about/about-2.jpg"
import about_img3 from "@/assets/images/about/about-3.jpg"

import author from "@/assets/images/about/author-1.jpg"
import signature from "@/assets/images/about/sign.png"

import Image from "next/image"
const AboutArea = () => {
   return (
      <section className="about-section pt-120 pb-65">
         <div className="container">
            <div className="row">
               <div className="col-xl-7">
                  <div className="about-image-box mb-25">
                     <div className="row">
                        <div className="col-lg-12">
                           <Image src={about_img1} className="mb-25 wow fadeInDown" alt="about image" />
                        </div>
                        <div className="col-lg-6">
                           <Image src={about_img2} className="mb-25 wow fadeInUp" alt="about image" />
                        </div>
                        <div className="col-lg-6">
                           <Image src={about_img3} className="mb-25 wow fadeInUp" alt="about image" />
                        </div>
                     </div>
                  </div>
               </div>
               <div className="col-xl-5">
                  <div className="section-content-box about-one_content-box wow fadeInRight">
                     <div className="section-title mb-50">
                        <span className="sub-title style-one">Tentang Kami</span>
                        <h2>Menghubungkan Bisnis Indonesia Sejak 2004</h2>
                     </div>
                     <p>Maskom berdiri dengan visi menghadirkan infrastruktur digital yang andal untuk mendukung pertumbuhan bisnis. Kami memadukan jaringan fiber optik, radio, hingga konektivitas cloud untuk memastikan data penting perusahaan bergerak dengan aman dan cepat.</p>
                     <p>Didukung tim engineer berpengalaman, Maskom menyediakan layanan konsultasi, implementasi, hingga pengelolaan harian melalui Network Operation Center. Pendekatan kami selalu kolaboratif agar solusi yang dihadirkan selaras dengan strategi teknologi informasi setiap organisasi.</p>
                     <div className="author-card d-flex align-items-center justify-content-between">
                        <div className="author-thumb-item d-flex align-items-center">
                           <div className="thumb">
                              <Image src={author} alt="Author image" />
                           </div>
                           <div className="content">
                              <h5>Tim Maskom Network</h5>
                              <span className="position">Partner Infrastruktur Digital Anda</span>
                           </div>
                        </div>
                        <div className="author-sign">
                           <Image src={signature} alt="author sign" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default AboutArea
