import Link from "next/link"

const Cta = () => {
   return (
      <section className="cta-seciton">
         <div className="cta-bg-wrapper bg_cover p-r z-1 pb-100 pt-95"
            style={{ backgroundImage: "url(/assets/images/bg/cta-bg2.jpg)" }}>
            <div className="container">
               <div className="row">
                  <div className="col-lg-12">
                     <div className="section-title text-white text-center wow fadeInDown">
                        <h2>Customized Learning Journeys, Driven by<br />
                           AI Innovation</h2>
                        <Link href="/use-cases" className="theme-btn style-one">Generate AI Image</Link>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Cta
