import { about_feature } from "@/data/FeatureData"
import React from "react"
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"

const Feature = React.memo(() => {
   return (
      <section className="features-section pb-70">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-7">
                  <SectionTitle 
                     subtitle="Nilai Utama"
                     title="Fondasi Layanan Maskom"
                     className="mb-50"
                     animation="fadeInLeft"
                  />
               </div>
               <div className="col-lg-5">
                  <AnimationWrapper animation="fadeInRight" className="text-box text-end mb-50">
                     <p>Kami berkomitmen menyediakan layanan yang proaktif, transparan, dan selalu siap berkembang mengikuti kebutuhan bisnis Anda.</p>
                  </AnimationWrapper>
               </div>
            </div>
            <div className="row justify-content-center">
               {about_feature.map((item) => (
                  <div key={item.id} className="col-lg-4 col-md-6 col-sm-12">
                     <AnimationWrapper animation="fadeInUp" className="iconic-info-box style-four mb-40">
                         <div className="icon">
                            <i className={item.icon} aria-hidden="true"></i>
                         </div>
                        <div className="content">
                           <h5>{item.title}</h5>
                           <p>{item.desc}</p>
                        </div>
                     </AnimationWrapper>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
})

Feature.displayName = "Feature"

export default Feature
