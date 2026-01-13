import { home_1_cause } from "@/data/CauseData"
import Link from "next/link"
import React from "react"
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"

const Cause = React.memo(() => {
   return (
      <section className="use-cases-section pt-105 pb-85" id="solusi">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <SectionTitle
                     subtitle="Solusi Maskom"
                     title="Layanan Terintegrasi Untuk Bisnis Selalu Terkoneksi"
                     description="Kami merancang solusi end-to-end mulai dari jaringan, keamanan, hingga operasional agar transformasi digital perusahaan berjalan tanpa hambatan."
                     className="mb-50"
                     animation="fadeInDown"
                  />
               </div>
            </div>
            <div className="row">
               {home_1_cause.map((item) => (
                  <div key={item.id} className="col-lg-4 col-md-6 col-sm-12">
                     <AnimationWrapper animation="fadeInUp">
                        <div className="iconic-info-box style-one text-center mb-25">
                            <div className="icon">
                               <i className={item.icon} aria-hidden="true"></i>
                            </div>
                           <div className="content">
                              <h4><Link href="/use-case-details">{item.title}</Link></h4>
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

Cause.displayName = "Cause"

export default Cause
