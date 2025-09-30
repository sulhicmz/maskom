import Image from "next/image"
import Link from "next/link"

import dashboard_img from "@/assets/images/hero/dashboard-img.jpg"

const Hero = () => {
   return (
      <section className="hero-section" id="beranda">
         <div className="hero-wrapper bg_cover" style={{ backgroundImage: `url(/assets/images/hero/hero-bg-1.png)` }}>
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-lg-8">
                     <div className="hero-content text-center">
                        <h1 className="heading-title wow fadeInDown">Infrastruktur Digital Andal Untuk <span>Bisnis Terkoneksi</span></h1>
                        <p className="wow fadeInUp para-one">Maskom menghadirkan layanan internet dedicated, jaringan fiber, dan managed service yang menjaga operasional perusahaan selalu online dengan performa terbaik.</p>
                        <div className="hero-button wow fadeInDown">
                           <Link href="/contact" className="theme-btn gradient-btn">Jadwalkan Demo</Link>
                        </div>
                        <p className="wow fadeInUp para-two">Tim network engineer siap membantu 24/7</p>
                     </div>
                  </div>
               </div>
               <div className="row">
                  <div className="col-lg-12">
                     <div className="hero-one_image-box text-center wow fadeInUp">
                        <Image src={dashboard_img} alt="dashboard image" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Hero
