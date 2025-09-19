import Image from "next/image"
import Link from "next/link"

import dashboard_img from "@/assets/images/hero/dashboard-img.jpg"

const Hero = () => {
   return (
      <section className="hero-section">
         <div className="hero-wrapper bg_cover" style={{ backgroundImage: `url(/assets/images/hero/hero-bg-1.png)` }}>
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-lg-8">
                     <div className="hero-content text-center">
                        <h1 className="heading-title wow fadeInDown">Solusi TI Terbaik untuk Bisnis Anda dengan <span>AI dan Teknologi Canggih</span></h1>
                        <p className="wow fadeInUp para-one">Maskom menyediakan solusi TI terbaik untuk bisnis Anda, termasuk jaringan/WiFi, pengembangan website, dan otomatisasi AI. <br /> Tingkatkan efisiensi dan produktivitas bisnis Anda dengan teknologi terkini.</p>
                        <div className="hero-button wow fadeInDown">
                           <Link href="/contact" className="theme-btn gradient-btn">Konsultasi Gratis</Link>
                        </div>
                        <p className="wow fadeInUp para-two">Solusi yang dapat disesuaikan dengan kebutuhan bisnis Anda</p>
                     </div>
                  </div>
               </div>
               <div className="row">
                  <div className="col-lg-12">
                     <div className="hero-one_image-box text-center wow fadeInUp">
                        {/* Add lazy loading for the image */}
                        <Image src={dashboard_img} alt="Dashboard Maskom" loading="lazy" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Hero