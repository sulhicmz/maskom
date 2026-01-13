"use client"
import { home_1_faq } from "@/data/FaqData"
import Image from "next/image"
import { useCallback } from "react"
import React from "react"

import faq_1 from "@/assets/images/contact/contact-1.svg"
import faq_2 from "@/assets/images/contact/contact-2.svg"
import faq_3 from "@/assets/images/contact/contact-3.svg"
import faq_shape from "@/assets/images/contact/shape-1.png"
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"
import { useAccordion } from "@/hooks/useAccordion"

const Faq = () => {

   const { activeId, toggle } = useAccordion({ initialId: home_1_faq[0].id });

   const handleKeyDown = useCallback((e: React.KeyboardEvent, id: number) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
         e.preventDefault();
         toggle(id);
      }
   }, [toggle]);

   const handleToggle = useCallback((id: number) => {
      toggle(id);
   }, [toggle]);

   return (
      <section className="faqs-section pb-190 pt-110" id="faq">
         <div className="container">
            <div className="row">
               <div className="col-xl-6">
                   <div className="contact-two_image-box p-r z-1 mb-50">
                      <AnimationWrapper animation="fadeInLeft" className="image-one">
                         <Image src={faq_1} alt="Ilustrasi profesional dukungan layanan Maskom" />
                      </AnimationWrapper>
                      <AnimationWrapper animation="fadeInRight" className="image-two">
                         <Image src={faq_2} alt="Ilustrasi tim support teknis Maskom" />
                      </AnimationWrapper>
                      <AnimationWrapper animation="fadeInDown" className="image-three">
                         <Image src={faq_3} alt="Ilustrasi layanan dukungan 24/7" />
                      </AnimationWrapper>
                      <Image src={faq_shape} className="shape-one" alt="Elemen dekoratif visual FAQ" />
                   </div>
               </div>
               <div className="col-xl-6">
                  <div className="section-content-box pl-xl-45 mb-30">
                     <SectionTitle
                        subtitle="Pertanyaan Umum"
                        title="Hal yang Sering Ditanyakan Klien"
                        className="mb-55"
                        animation="fadeInDown"
                     />
                          <AnimationWrapper animation="fadeInUp" className="accordion" id="accordionOne" role="presentation">
                             {home_1_faq.map((item) => (
                               <div key={item.id} className="accordion-card style-one mb-15">
                                  <div className="accordion-header">
                                      <button
                                         type="button"
                                         id={`faq-button-${item.id}`}
                                         onClick={() => handleToggle(item.id)}
                                         onKeyDown={(e) => handleKeyDown(e, item.id)}
                                         className={`accordion-title ${activeId === item.id ? "" : "collapsed"}`}
                                         aria-expanded={activeId === item.id}
                                         aria-controls={`faq-collapse-${item.id}`}
                                         aria-label={item.question}
                                      >
                                        {item.question}
                                     </button>
                                  </div>
                                  <div
                                     id={`faq-collapse-${item.id}`}
                                     role="region"
                                     aria-labelledby={`faq-button-${item.id}`}
                                     className={`accordion-collapse collapse ${activeId === item.id ? "show" : ""}`}
                                  >
                                     <div className="accordion-content">
                                        <p>{item.answer}</p>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </AnimationWrapper>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default React.memo(Faq)
