import Image from "next/image";
import React from "react";

import feature_img from "@/assets/images/gallery/feature-img.svg"
import feature_list from "@/data/FeatureHomeOneData"

const Feature = React.memo(() => {
   return (
      <section className="features-section pt-120 pb-70">
         <div className="container">
            <div className="row">
               <div className="col-xl-5">
                  <div className="section-content-box mb-50">
                     <div className="section-title mb-50 wow fadeInDown">
                        <span className="sub-title style-one">Mengapa Maskom</span>
                        <h2>Keunggulan Layanan <br /> Konektivitas Maskom</h2>
                     </div>
                     <div className="iconic-info-list">
                        {feature_list.map((item) => (
                           <div key={item.id} className="iconic-info-box style-two mb-30 wow fadeInUp">
                              <div className="icon">
                                 <i className={item.icon}></i>
                              </div>
                              <div className="content">
                                 <h4>{item.title}</h4>
                                 <p>{item.desc}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="col-xl-7">
                  <div className="section-image-box style-one mb-50 wow fadeInRight">
                     <Image src={feature_img} alt="features image" />
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
})

Feature.displayName = "Feature"

export default Feature
