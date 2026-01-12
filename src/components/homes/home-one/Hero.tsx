import Image from "next/image"
import Link from "next/link"
import React from "react"
import AnimationWrapper from "@/components/common/AnimationWrapper"
import BackgroundSection from "@/components/common/BackgroundSection"

import dashboard_img from "@/assets/images/hero/dashboard.svg"

const Hero = React.memo(() => {
   return (
      <section className="hero-section" id="beranda">
         <BackgroundSection backgroundImage="/assets/images/hero/hero-bg-1.png" className="hero-wrapper">
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-lg-8">
                     <div className="hero-content text-center">
                        <AnimationWrapper animation="fadeInDown">
                           <h1 className="heading-title">Infrastruktur Digital Andal Untuk <span>Bisnis Terkoneksi</span></h1>
                        </AnimationWrapper>
                        <AnimationWrapper animation="fadeInUp">
                           <p className="para-one">Maskom menghadirkan layanan internet dedicated, jaringan fiber, dan managed service yang menjaga operasional perusahaan selalu online dengan performa terbaik.</p>
                        </AnimationWrapper>
                        <AnimationWrapper animation="fadeInDown">
                           <div className="hero-button">
                              <Link href="/contact" className="theme-btn gradient-btn">Jadwalkan Demo</Link>
                           </div>
                        </AnimationWrapper>
                        <AnimationWrapper animation="fadeInUp">
                           <p className="para-two">Tim network engineer siap membantu 24/7</p>
                        </AnimationWrapper>
                     </div>
                  </div>
               </div>
                <div className="row">
                   <div className="col-lg-12">
                      <AnimationWrapper animation="fadeInUp" className="hero-one_image-box text-center">
                         <Image src={dashboard_img} alt="Dashboard monitoring infrastruktur jaringan Maskom" />
                      </AnimationWrapper>
                   </div>
                </div>
            </div>
         </BackgroundSection>
      </section>
   )
})

Hero.displayName = "Hero"

export default Hero
