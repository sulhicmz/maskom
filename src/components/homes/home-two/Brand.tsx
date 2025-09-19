"use client"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import Image, { StaticImageData } from "next/image"
import Link from "next/link"

import brand_1 from "@/assets/images/clients/logo2-1.png"
import brand_2 from "@/assets/images/clients/logo2-2.png"
import brand_3 from "@/assets/images/clients/logo2-3.png"
import brand_4 from "@/assets/images/clients/logo2-4.png"
import brand_5 from "@/assets/images/clients/logo2-5.png"
import brand_6 from "@/assets/images/clients/logo2-6.png"
import brand_7 from "@/assets/images/clients/logo2-7.png"
import brand_8 from "@/assets/images/clients/logo2-8.png"
import brand_9 from "@/assets/images/clients/logo2-9.png"

const brand_data: StaticImageData[] = [brand_1, brand_2, brand_3, brand_4, brand_5, brand_6, brand_7, brand_8, brand_9, brand_5];

const setting = {
   slidesPerView: 8,
   loop: true,
   autoplay: {
      delay: 3000,
      disableOnInteraction: false,
   },
   pagination: false,
   navigation: false,
   breakpoints: {
      '1400': {
         slidesPerView: 8,
      },
      '1200': {
         slidesPerView: 6,
      },
      '768': {
         slidesPerView: 5,
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
      <section className="client-section">
         <div className="client-bg-wrapper">
            <div className="client-wrapper">
               <Swiper {...setting} modules={[Autoplay, Navigation]} className="clients-slider-two">
                  {brand_data.map((brand, i) => (
                     <SwiperSlide key={i} className="client-item">
                        <div className="client-img">
                           <Link href="/"><Image src={brand}
                              alt="client-logo" /></Link>
                        </div>
                     </SwiperSlide>
                  ))}
               </Swiper>
            </div>
         </div>
      </section>
   )
}

export default Brand
