import { home_1_process } from "@/data/ProcessData"
import Image from "next/image"
import React from "react"
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"

const Process = React.memo(() => {
   return (
      <section className="works-process-section pb-75" id="pendekatan">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <SectionTitle 
                     subtitle="Pendekatan Kami"
                     title="Implementasi Cepat & Terukur"
                     description="Maskom memastikan setiap fase berjalan kolaboratif bersama tim Anda, mulai dari asesmen, desain solusi, hingga pengelolaan harian."
                     align="center"
                     className="mb-55"
                     animation="fadeInDown"
                  />
               </div>
            </div>
            <div className="row justify-content-center">
               {home_1_process.map((item) => (
                  <div key={item.id} className="col-xl-4 col-md-6 col-sm-6">
                     <AnimationWrapper animation="fadeInUp" className="ac-process-item mb-40">
                        <div className="process-inner-content">
                            <div className="thumbnail">
                               <Image src={item.img} alt={`Ilustrasi ${item.title}`} />
                            </div>
                           <div className="content">
                              <span className="number">{item.count}</span>
                              <h5>{item.title}</h5>
                              <p>{item.desc}</p>
                           </div>
                        </div>
                     </AnimationWrapper>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
})

Process.displayName = "Process"

export default Process
