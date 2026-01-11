"use client"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import Image from "next/image";
import Link from "next/link"
import brand_data from "@/data/BrandData"

const setting = {
   slidesPerView: 6,
   loop: true,
   autoplay: {
      delay: 3000,
      disableOnInteraction: false,
   },
   pagination: false,
   navigation: false,
   breakpoints: {
      '1400': {
         slidesPerView: 6,
      },
      '1200': {
         slidesPerView: 5,
      },
      '768': {
         slidesPerView: 4,
      },
      '576': {
         slidesPerView: 3,
      },
      '0': {
         slidesPerView: 2,
      },
   },
};

const Brand = () => {
   return (
      <section className="clients-section">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="clients-text style-one text-center mb-30 wow fadeInDown">
                     <p>Dipercaya oleh perusahaan lintas industri untuk menjaga konektivitas</p>
                  </div>
               </div>
            </div>
            <Swiper {...setting} modules={[Autoplay, Navigation]} className="clients-slider wow fadeInUp">
               {brand_data.map((item, i) => (
                  <SwiperSlide key={i} className="client-item">
                     <div className="client-img">
                        <Link href="/"><Image src={item} alt="client-logo" /></Link>
                     </div>
                  </SwiperSlide>
               ))}
            </Swiper>
         </div>
      </section>
   )
}

export default Brand
