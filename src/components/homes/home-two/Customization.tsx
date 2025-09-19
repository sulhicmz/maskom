import Image from "next/image"
import Link from "next/link"

import shape_1 from "@/assets/images/shape/cshape-1.png"
import shape_2 from "@/assets/images/shape/cshape-2.png"
import thumb from "@/assets/images/gallery/customization-1.png"
import icon from "@/assets/images/icon/sub-icon.png"

const Customization = () => {
   return (
      <section className="customization-section">
         <div className="customization-wrapper pt-120 pb-70">
            <div className="shape shape-one"><span><Image src={shape_1} alt="shape" /></span></div>
            <div className="shape shape-two"><span><Image src={shape_2} alt="shape" /></span></div>
            <div className="container">
               <div className="row">
                  <div className="col-xl-7">
                     <div className="section-image-box style-two mb-50 wow fadeInLeft">
                        <Image src={thumb} alt="customization image" />
                     </div>
                  </div>
                  <div className="col-xl-5">
                     <div className="ct-one_content-box mb-50 wow fadeInRight">
                        <div className="section-title mb-50">
                           <span className="sub-title"><Image src={icon} alt="icon" /> Customization</span>
                           <h2>Customize Your AI <br /> Images</h2>
                        </div>
                        <p>Artificial intelligence picture generator from text rejuvenates your idea
                           workmanship online in not <span>more than seconds</span>. Text to picture
                           apparatus, permits you to take text prompts and transform them into matching
                        </p>
                        <p>pictures. Enter text prompts like &quot; a garfield princess&quot;, <span>change
                           your</span></p>
                        <p><span>innovative</span> thoughts into staggering pictures with only a couple
                           of snaps. With the force of our artificial intelligence picture .Artificial
                           <span>intelligence</span> picture generator from text rejuvenates your idea
                           workmanship online in not <span>more than seconds</span>. Text to picture
                           apparatus, permits you to take text prompts and transform them into matching
                           pictures. Enter text prompts like
                        </p>
                        <Link href="/use-cases" className="theme-btn style-one">Generate AI Image</Link>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Customization
