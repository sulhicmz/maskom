import testi_data from "@/data/FeedbackData";

const getInitials = (name: string) => {
   return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
};

const Feedback = () => {
   return (
      <section className="testimonial-section testimonial-shape-section p-r z-1 bg_cover pt-110 pb-90"
         id="testimoni"
         style={{ backgroundImage: `url(/assets/images/bg/testimonial-bg.jpg)` }}>
         <div className="shape shape-one"><span className="circle"></span></div>
         <div className="shape shape-two"><span className="circle"></span></div>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-lg-6">
                  <div className="section-title title-white text-center mb-55 wow fadeInDown">
                     <span className="sub-title style-one">Testimoni</span>
                     <h2>Apa Kata Partner Kami</h2>
                     <p>Perusahaan dari berbagai industri mengandalkan Maskom untuk memastikan jaringan dan operasional digital mereka berjalan mulus setiap hari.</p>
                  </div>
               </div>
            </div>
            <div className="row">
               {testi_data.filter((items) => items.page === "home_1").map((item) => (
                  <div key={item.id} className="col-xl-4 col-md-6 col-sm-12">
                     <div className="testimonial-item style-one mb-30 wow fadeInDown">
                        <div className="testimonial-content">
                           <div className="author-info-wrap d-flex justify-content-between">
                              <div className="author-thumb-item mb-15">
                                 <div className="thumb thumb-initials">
                                    {getInitials(item.name)}
                                 </div>
                                 <div className="content">
                                    <h6>{item.name}</h6>
                                    <span className="position">{item.title} · {item.company}</span>
                                 </div>
                              </div>
                              <div className="ratings">
                                 <span><i className="fas fa-star"></i><a href="#">({item.rating})</a></span>
                              </div>
                           </div>
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

export default Feedback
