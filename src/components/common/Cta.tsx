import cta_1 from "@/assets/images/gallery/robot2.webp"
import cta_2 from "@/assets/images/gallery/base2.png"
import Image from "next/image"
import Link from "next/link"
import AnimationWrapper from "@/components/common/AnimationWrapper"

const Cta = () => {
   return (
      <section className="cta-section pb-120">
         <div className="container">
            <div className="cta-wrapper_one">
               <div className="row align-items-center">
                  <div className="col-lg-6">
                     <AnimationWrapper animation="fadeInLeft" className="cta-one_content-box">
                        <h2>Bangun Infrastruktur Digital yang Tangguh</h2>
                        <p>Maskom siap mendampingi perjalanan transformasi digital Anda mulai dari perencanaan hingga operasional sehari-hari.</p>
                        <Link href="/contact" className="theme-btn gradient-btn">Konsultasi dengan Kami</Link>
                     </AnimationWrapper>
                  </div>
                   <div className="col-lg-6">
                      <div className="cta-one_image-box p-r z-1 text-xl-end">
                         <Image src={cta_1} className="image-one" alt="Robot AI yang mendukung infrastruktur digital" />
                         <Image src={cta_2} className="image-two" alt="Dasar platform teknologi modern" />
                      </div>
                   </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Cta
