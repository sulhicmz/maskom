import { home_1_cause } from "@/data/CauseData"
import Link from "next/link"
import React from "react"

const Cause = React.memo(() => {
   return (
      <section className="use-cases-section pt-105 pb-85" id="solusi">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="section-title text-center mb-50 wow fadeInDown">
                     <span className="sub-title style-one">Solusi Maskom</span>
                     <h2>Layanan Terintegrasi Untuk Bisnis Selalu Terkoneksi</h2>
                     <p>Kami merancang solusi end-to-end mulai dari jaringan, keamanan, hingga operasional agar transformasi digital perusahaan berjalan tanpa hambatan.</p>
                  </div>
               </div>
            </div>
            <div className="row">
               {home_1_cause.map((item) => (
                  <div key={item.id} className="col-lg-4 col-md-6 col-sm-12">
                     <div className="iconic-info-box style-one text-center mb-25 wow fadeInUp">
                        <div className="icon">
                           <i className={item.icon}></i>
                        </div>
                        <div className="content">
                           <h4><Link href="/use-case-details">{item.title}</Link></h4>
                           <p>{item.desc}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
})

Cause.displayName = "Cause"

export default Cause
