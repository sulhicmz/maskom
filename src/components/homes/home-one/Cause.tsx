import cause_data from "@/data/CauseData"
import Link from "next/link"

const Cause = () => {
   return (
      <section className="use-cases-section pt-105 pb-85">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="section-title text-center mb-50 wow fadeInDown">
                     <span className="sub-title style-one">Use Causes</span>
                     <h2>Generate Content by AI</h2>
                     <p>In a few seconds, our A.I. will generate amazing results that <br /> you can copy,
                        paste & publish. , write creatively</p>
                  </div>
               </div>
            </div>
            <div className="row">
               {cause_data.filter((items) => items.page === "home_1").map((item) => (
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
}

export default Cause
