"use client"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import testi_data from "@/data/FeedbackData"
import Image from "next/image"
import Link from "next/link"

import icon from "@/assets/images/icon/sub-icon.png"

const setting = {
   slidesPerView: 3,
   loop: true,
   autoplay: {
      delay: 3000,
      disableOnInteraction: false,
   },
   pagination: false,
   navigation: false,
   breakpoints: {
      '1200': {
         slidesPerView: 3,
      },
      '768': {
         slidesPerView: 2,
      },
      '576': {
         slidesPerView: 1,
      },
      '0': {
         slidesPerView: 1,
      },
   },
};

const Testimonial = () => {
   return (
      <section className="testimonial-section testimonial-shape-section p-r z-1 bg_cover pt-115 pb-90"
         style={{ backgroundImage: "url(/assets/images/bg/testimonial-bg2.jpg)" }}>
         <div className="shape shape-one"><span className="circle"></span></div>
         <div className="shape shape-two"><span className="circle"></span></div>
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="section-title text-center text-white mb-55 wow fadeInDown">
                     <span className="sub-title"><Image src={icon} alt="icon" />
                        Client Feedback <Image src={icon} alt="icon" /></span>
                     <h2>What `s Say Our Client</h2>
                     <p>In a few seconds, our A.I. will generate amazing results that <br /> you can copy,
                        paste & publish. , write creatively </p>
                  </div>
               </div>
            </div>
            <Swiper {...setting} modules={[Autoplay, Navigation]} className="testimonial-slider wow fadeInUp">
               {testi_data.filter((items) => items.page === "home_2").map((item) => (
                  <SwiperSlide key={item.id}>
                     <div key={item.id} className="testimonial-item style-two mb-30">
                        <div className="testimonial-content">
                           <div className="author-thumb-item mb-30">
                              <div className="thumb">
                                 <Image src={item.avatar} alt="author thumb" />
                              </div>
                              <div className="content">
                                 <h6>{item.name}</h6>
                                 <span className="position">{item.designation}</span>
                              </div>
                           </div>
                           <p>{item.desc}</p>
                           <ul className="ratings">
                              <li><i className="fas fa-star"></i></li>
                              <li><i className="fas fa-star"></i></li>
                              <li><i className="fas fa-star"></i></li>
                              <li><i className="fas fa-star"></i></li>
                              <li><i className="fas fa-star"></i></li>
                              <li><span><Link href="#">({item.rating})</Link></span></li>
                           </ul>
                        </div>
                     </div>
                  </SwiperSlide>
               ))}
            </Swiper>
         </div>
      </section>
   )
}

export default Testimonial
