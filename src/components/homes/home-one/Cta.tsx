import cta_1 from "@/assets/images/gallery/robot2.png"
import cta_2 from "@/assets/images/gallery/base2.png"
import Image from "next/image"
import Link from "next/link"
const Cta = () => {
   return (
      <section className="cta-section" id="hubungi">
         <div className="container">
            <div className="cta-wrapper_one">
               <div className="row align-items-center">
                  <div className="col-lg-6">
                     <div className="cta-one_content-box wow fadeInLeft">
                        <h2>Siap Tingkatkan Kualitas Konektivitas Anda?</h2>
                        <p>Diskusikan kebutuhan jaringan dan managed service bersama konsultan Maskom. Kami bantu rancang solusi paling efisien.</p>
                        <Link href="/contact" className="theme-btn gradient-btn">Konsultasi Konektivitas</Link>
                     </div>
                  </div>
                  <div className="col-lg-6">
                     <div className="cta-one_image-box p-r z-1 text-xl-end">
                        <Image src={cta_1} className="image-one" alt="" />
                        <Image src={cta_2} className="image-two" alt="" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Cta
