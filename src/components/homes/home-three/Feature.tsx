import Image from "next/image"

import icon from "@/assets/images/icon/sub2_1.svg"
import feature_data from "@/data/FeatureData"

const Feature = () => {
   return (
      <section className="core-features pt-115">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-lg-8">
                  <div className="section-title text-center mb-50 wow fadeInDown">
                     <span className="sub-title"><Image src={icon} alt="icon" /> Core
                        Features <Image src={icon} alt="icon" /></span>
                     <h2>Core Features for Video Genaretor</h2>
                     <p>In a few seconds, our A.I. will generate amazing results that <br /> you can copy,
                        paste & publish. , write creatively</p>
                  </div>
               </div>
            </div>
            <div className="row">
               {feature_data.filter((items) => items.page === "home_3").map((item) => (
                  <div key={item.id} className="col-xl-4 col-md-6 col-sm-12">
                     <div className="iconic-info-box style-three mb-30 wow fadeInUp">
                        <div className="icon">
                           <i className={item.icon}></i>
                        </div>
                        <div className="content">
                           <h6>{item.title}</h6>
                           <p>{item.desc}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}

export default Feature
