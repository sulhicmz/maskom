import Image from "next/image"
import dynamic from "next/dynamic"
const ContactForm = dynamic(() => import("../forms/ContactForm"), {
   loading: () => <div className="text-center py-5">Memuat formulir kontak...</div>
})

import img_1 from "@/assets/images/contact/contact-4.jpg"
import img_2 from "@/assets/images/contact/contact-5.jpg"
import img_3 from "@/assets/images/contact/contact-6.jpg"
import shape from "@/assets/images/contact/shape-1.png"
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"

const ContactFormArea = () => {
   return (
      <section className="contact-section pt-120 pb-70">
         <div className="container">
            <div className="row">
               <div className="col-xl-5">
                  <AnimationWrapper animation="fadeInLeft" className="contact-one_image-box p-r z-1 mb-50">
                     <Image src={img_1} className="image-one"
                        alt="Contact Image" />
                     <Image src={img_2} className="image-two" alt="Contact Image" />
                     <Image src={img_3} className="image-three" alt="Contact Image" />
                     <Image src={shape} className="shape-one" alt="Contact Image" />
                  </AnimationWrapper>
               </div>
               <div className="col-xl-7">
                  <AnimationWrapper animation="fadeInRight" className="section-content-box mb-50 pl-xl-45">
                     <SectionTitle 
                        subtitle="Hubungi Maskom"
                        title="Kami Siap Membantu Kebutuhan Jaringan Anda"
                        className="mb-30"
                     />
                     <ContactForm />
                  </AnimationWrapper>
               </div>
            </div>
         </div>
      </section>
   )
}

export default ContactFormArea
