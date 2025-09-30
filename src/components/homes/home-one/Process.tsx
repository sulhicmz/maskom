import process_data from "@/data/ProcessData"
import Image from "next/image"

const Process = () => {
   return (
      <section className="works-process-section pb-75" id="pendekatan">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="section-title text-center mb-55 wow fadeInDown">
                     <span className="sub-title style-one">Pendekatan Kami</span>
                     <h2>Implementasi Cepat & Terukur</h2>
                     <p>Maskom memastikan setiap fase berjalan kolaboratif bersama tim Anda, mulai dari asesmen, desain solusi, hingga pengelolaan harian.</p>
                  </div>
               </div>
            </div>
            <div className="row justify-content-center">
               {process_data.filter((items) => items.page === "home_1").map((item) => (
                  <div key={item.id} className="col-xl-4 col-md-6 col-sm-6">
                     <div className="ac-process-item mb-40 wow fadeInUp">
                        <div className="process-inner-content">
                           <div className="thumbnail">
                              <Image src={item.img} alt="work image" />
                           </div>
                           <div className="content">
                              <span className="number">{item.count}</span>
                              <h5>{item.title}</h5>
                              <p>{item.desc}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}

export default Process
