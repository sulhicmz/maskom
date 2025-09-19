import process_data from "@/data/ProcessData"
import Image from "next/image"

const Process = () => {
   return (
      <section className="works-process-section pb-75">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="section-title text-center mb-55 wow fadeInDown">
                     <span className="sub-title style-one">Working Process</span>
                     <h2>How to Work</h2>
                     <p>In a few seconds, our A.I. will generate amazing results that <br /> you can copy,
                        paste & publish. , write creatively </p>
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
