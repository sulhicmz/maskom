"use client"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import Image, { StaticImageData } from "next/image";
import Link from "next/link"

import brand_1 from "@/assets/images/clients/logo-1.png"
import brand_2 from "@/assets/images/clients/logo-2.png"
import brand_3 from "@/assets/images/clients/logo-3.png"
import brand_4 from "@/assets/images/clients/logo-4.png"
import brand_5 from "@/assets/images/clients/logo-5.png"
import brand_6 from "@/assets/images/clients/logo-6.png"
import brand_7 from "@/assets/images/clients/logo-7.png"

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

const brand_data: StaticImageData[] = [brand_1, brand_2, brand_3, brand_4, brand_5, brand_6, brand_7, brand_2]
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
