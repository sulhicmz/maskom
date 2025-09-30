"use client"
import faq_data from "@/data/FaqData"
import Image from "next/image"
import { useState } from "react"

import faq_1 from "@/assets/images/contact/contact-1.jpg"
import faq_2 from "@/assets/images/contact/contact-2.jpg"
import faq_3 from "@/assets/images/contact/contact-3.jpg"
import faq_shape from "@/assets/images/contact/shape-1.png"

const Faq = () => {

   const [activeId, setActiveId] = useState<number>(faq_data[0].id);

   return (
      <section className="faqs-section pb-190 pt-110" id="faq">
         <div className="container">
            <div className="row">
               <div className="col-xl-6">
                  <div className="contact-two_image-box p-r z-1 mb-50">
                     <Image src={faq_1} className="image-one wow fadeInLeft" alt="Contact Image" />
                     <Image src={faq_2} className="image-two wow fadeInRight" alt="Contact Image" />
                     <Image src={faq_3} className="image-three wow fadeInDown" alt="Contact Image" />
                     <Image src={faq_shape} className="shape-one" alt="Contact Image" />
                  </div>
               </div>
               <div className="col-xl-6">
                  <div className="section-content-box pl-xl-45 mb-30">
                     <div className="section-title mb-55 wow fadeInDown">
                        <span className="sub-title style-one">Pertanyaan Umum</span>
                        <h2>Hal yang Sering <br /> Ditanyakan Klien</h2>
                     </div>
                     <div className="accordion wow fadeInUp" id="accordionOne">
                        {faq_data.filter((items) => items.page === "home_1").map((item) => (
                           <div key={item.id} className="accordion-card style-one mb-15">
                              <div className="accordion-header">
                                 <h6 onClick={() => setActiveId(item.id)} className={`accordion-title ${activeId === item.id ? "" : "collapsed"}`} >
                                    {item.quesstion}
                                 </h6>
                              </div>
                              <div id="collapse1" className={`accordion-collapse collapse ${activeId === item.id ? "show" : ""}`}>
                                 <div className="accordion-content">
                                    <p>{item.answer}</p>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Faq
