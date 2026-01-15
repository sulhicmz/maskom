import { home_1_feedback } from "@/data/FeedbackData"
import Image from "next/image"
import React from "react"
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"
import BackgroundSection from "@/components/common/BackgroundSection"

const Feedback = () => {
   return (
      <BackgroundSection backgroundImage="/assets/images/bg/testimonial-bg.webp" className="testimonial-section testimonial-shape-section p-r z-1 pt-110 pb-90" id="testimoni">
         <div className="shape shape-one"><span className="circle"></span></div>
         <div className="shape shape-two"><span className="circle"></span></div>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-lg-6">
                  <SectionTitle
                     subtitle="Testimoni"
                     title="Apa Kata Partner Kami"
                     description="Perusahaan dari berbagai industri mengandalkan Maskom untuk memastikan jaringan dan operasional digital mereka berjalan mulus setiap hari."
                     className="mb-55"
                     whiteText
                     animation="fadeInDown"
                  />
               </div>
            </div>
            <div className="row">
               {home_1_feedback.map((item) => (
                  <div key={item.id} className="col-xl-4 col-md-6 col-sm-12">
                     <AnimationWrapper animation="fadeInDown">
                        <div className="testimonial-item style-one mb-30">
                           <div className="testimonial-content">
                              <div className="author-info-wrap d-flex justify-content-between">
                                   <div className="author-thumb-item mb-15">
                                      <div className="thumb">
                                         <Image src={item.avatar} alt={`Foto profil ${item.name} - ${item.designation}`} loading="lazy" />
                                      </div>
                                      <div className="content">
                                         <h6>{item.name}</h6>
                                         <span className="position">{item.designation}</span>
                                      </div>
                                   </div>
                                  <div className="ratings">
                                     <span><i className="fas fa-star" aria-hidden="true"></i>({item.rating})</span>
                                  </div>
                              </div>
                              <p>{item.desc}</p>
                           </div>
                        </div>
                     </AnimationWrapper>
                  </div>
               ))}
            </div>
         </div>
      </BackgroundSection>
   )
}

Feedback.displayName = "Feedback"

export default Feedback
