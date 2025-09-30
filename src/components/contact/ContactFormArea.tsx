import Image from "next/image"
import ContactForm from "../forms/ContactForm"

import img_1 from "@/assets/images/contact/contact-4.jpg"
import img_2 from "@/assets/images/contact/contact-5.jpg"
import img_3 from "@/assets/images/contact/contact-6.jpg"
import shape from "@/assets/images/contact/shape-1.png"

const ContactFormArea = () => {
   return (
      <section className="contact-section pt-120 pb-70">
         <div className="container">
            <div className="row">
               <div className="col-xl-5">
                  <div className="contact-one_image-box p-r z-1 mb-50 wow fadeInLeft">
                     <Image src={img_1} className="image-one"
                        alt="Contact Image" />
                     <Image src={img_2} className="image-two" alt="Contact Image" />
                     <Image src={img_3} className="image-three" alt="Contact Image" />
                     <Image src={shape} className="shape-one" alt="Contact Image" />
                  </div>
               </div>
               <div className="col-xl-7">
                  <div className="section-content-box mb-50 pl-xl-45 wow fadeInRight">
                     <div className="section-title mb-30">
                        <span className="sub-title style-one">Hubungi Maskom</span>
                        <h2>Kami Siap Membantu <br /> Kebutuhan Jaringan Anda</h2>
                     </div>
                     <ContactForm />
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default ContactFormArea
