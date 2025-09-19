import cta_1 from "@/assets/images/gallery/robot2.png"
import cta_2 from "@/assets/images/gallery/base2.png"
import Image from "next/image"
import Link from "next/link"
import { event } from "@/utils/analytics"
const Cta = () => {
   return (
      <section className="cta-section pb-120">
         <div className="container">
            <div className="cta-wrapper_one">
               <div className="row align-items-center">
                  <div className="col-lg-6">
                     <div className="cta-one_content-box wow fadeInLeft">
                        <h2>End Writer’s Block Today</h2>
                        <p>It’s like having access to a team of copywriting experts writing powerful
                           copy for you in 1-click.</p>
                        <Link
                          href="/contact"
                          className="theme-btn gradient-btn"
                          onClick={() => event({
                            action: 'click',
                            category: 'CTA',
                            label: 'Start Writing Free'
                          })}
                        >
                          Start Writing Free
                        </Link>
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
