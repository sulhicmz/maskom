import feature_data from "@/data/FeatureData"

const Feature = () => {
   return (
      <section className="features-section pb-70">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-7">
                  <div className="section-title mb-50 wow fadeInLeft">
                     <span className="sub-title style-one">Nilai Utama</span>
                     <h2>Fondasi Layanan Maskom</h2>
                  </div>
               </div>
               <div className="col-lg-5">
                  <div className="text-box text-end mb-50 wow fadeInRight">
                     <p>Kami berkomitmen menyediakan layanan yang proaktif, transparan, dan selalu siap berkembang mengikuti kebutuhan bisnis Anda.</p>
                  </div>
               </div>
            </div>
            <div className="row justify-content-center">
               {feature_data.filter((items) => items.page === "about").map((item) => (
                  <div key={item.id} className="col-lg-4 col-md-6 col-sm-12">
                     <div className="iconic-info-box style-four mb-40 wow fadeInUp">
                        <div className="icon">
                           <i className={item.icon}></i>
                        </div>
                        <div className="content">
                           <h5>{item.title}</h5>
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
