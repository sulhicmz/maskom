import Image from "next/image"
import Link from "next/link"

import thumb from "@/assets/images/gallery/faq.png"

const Cta = () => {
   return (
      <section className="cta-section">
         <div className="cta-bg-wrapper-two black-dark-bg bg_cover pt-50 pb-30"
            style={{ backgroundImage: "url(/assets/images/bg/faq-bg.jpg)" }}>
            <div className="shape shape-one"><span className="circle"></span></div>
            <div className="shape shape-two"><span className="circle"></span></div>
            <div className="container">
               <div className="row align-items-center">
                  <div className="col-lg-6">
                     <div className="cta-one_content-box mb-20 wow fadeInLeft">
                        <h2>Butuh bantuan memilih paket Maskom?</h2>
                        <p>Tim solusi kami siap membantu melakukan assesment awal, menghitung estimasi investasi, dan menyiapkan demo layanan sesuai kebutuhan perusahaan Anda.</p>
                        <Link href="/contact" className="theme-btn gradient-btn">Jadwalkan Konsultasi</Link>
                     </div>
                  </div>
                  <div className="col-lg-6">
                     <div className="cta-one_image-box text-end p-r z-1 mb-20 wow fadeInRight">
                        <Image src={thumb} alt="faq-image" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Cta
