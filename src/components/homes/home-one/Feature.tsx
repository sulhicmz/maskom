import Image from "next/image";
import React from "react";

import feature_img from "@/assets/images/gallery/feature-img.svg"
import feature_list from "@/data/FeatureHomeOneData"
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"

const Feature = React.memo(() => {
   return (
      <section className="features-section pt-120 pb-70">
         <div className="container">
            <div className="row">
               <div className="col-xl-5">
                  <div className="section-content-box mb-50">
                     <SectionTitle 
                        subtitle="Mengapa Maskom"
                        title="Keunggulan Layanan Konektivitas Maskom"
                        className="mb-50"
                        animation="fadeInDown"
                     />
                     <div className="iconic-info-list">
                        {feature_list.map((item) => (
                           <AnimationWrapper key={item.id} animation="fadeInUp" className="iconic-info-box style-two mb-30">
                              <div className="icon">
                                 <i className={item.icon}></i>
                              </div>
                              <div className="content">
                                 <h4>{item.title}</h4>
                                 <p>{item.desc}</p>
                              </div>
                           </AnimationWrapper>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="col-xl-7">
                  <AnimationWrapper animation="fadeInRight" className="section-image-box style-one mb-50">
                     <Image src={feature_img} alt="features image" />
                  </AnimationWrapper>
               </div>
            </div>
         </div>
      </section>
   )
})

Feature.displayName = "Feature"

export default Feature
