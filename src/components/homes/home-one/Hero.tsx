import Image from "next/image";
import Link from "next/link";

import network_img from "@/assets/images/hero/hero-image-1.jpg";

const heroBackground = {
   backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,64,175,0.85)), url(/assets/images/hero/hero-bg-2.png)",
   backgroundSize: "cover",
   backgroundPosition: "center",
};

const Hero = () => {
   return (
      <section className="hero-section" id="beranda">
         <div className="hero-wrapper bg_cover" style={heroBackground}>
            <div className="container">
               <div className="row align-items-center g-5">
                  <div className="col-lg-6">
                     <div className="hero-content text-lg-start text-center">
                        <h1 className="heading-title wow fadeInDown">
                           Internet Dedicated &amp; Managed Network untuk Operasional Tanpa Putus
                        </h1>
                        <p className="wow fadeInUp para-one">
                           Kami merancang, mengimplementasikan, dan memonitor jaringan perusahaan Anda—dari konektivitas fiber, SD-WAN, hingga managed Wi-Fi—dengan SLA 99,5% dan dukungan engineer 24/7.
                        </p>
                        <div className="hero-button wow fadeInDown d-flex flex-wrap gap-3 justify-content-lg-start justify-content-center">
                           <Link href="/contact" className="theme-btn gradient-btn">
                              Konsultasi Konektivitas
                           </Link>
                           <Link href="/#paket" className="theme-btn hero-btn-outline">
                              Lihat Paket Layanan
                           </Link>
                        </div>
                        <p className="wow fadeInUp para-two text-lg-start text-center">
                           Monitoring proaktif • Integrasi multi-site nasional • Tim support onsite &amp; remote
                        </p>
                     </div>
                  </div>
                  <div className="col-lg-6">
                     <div className="hero-one_image-box text-center text-lg-end wow fadeInUp">
                        <Image src={network_img} alt="Ilustrasi jaringan Maskom" priority />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default Hero;
