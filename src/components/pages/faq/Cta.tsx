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
                        <h2>End Writer’s Block Today</h2>
                        <p>It’s like having access to a team of copywriting experts writing powerful
                           <br /> copy for you in 1-click.
                        </p>
                        <Link href="/contact" className="theme-btn gradient-btn">Start Writing Free </Link>
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
