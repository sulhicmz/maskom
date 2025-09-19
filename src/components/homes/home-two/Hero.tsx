"use client"
import Image, { StaticImageData } from "next/image"

import hero_img1 from "@/assets/images/hero/hero-two_1.jpg"
import hero_img2 from "@/assets/images/hero/hero-two_2.jpg"
import hero_img3 from "@/assets/images/hero/hero-two_3.jpg"
import hero_img4 from "@/assets/images/hero/hero-two_4.jpg"
import hero_img5 from "@/assets/images/hero/hero-two_5.jpg"
import hero_img6 from "@/assets/images/hero/hero-two_6.jpg"
import hero_img7 from "@/assets/images/hero/hero-two_7.jpg"
import hero_img8 from "@/assets/images/hero/hero-two_8.jpg"
import hero_img9 from "@/assets/images/hero/hero-two_9.jpg"
import hero_img10 from "@/assets/images/hero/hero-two_10.jpg"
import hero_img11 from "@/assets/images/hero/hero-two_11.jpg"
import hero_img12 from "@/assets/images/hero/hero-two_12.jpg"
import hero_img13 from "@/assets/images/hero/hero-two_13.jpg"

interface DataType {
   id: number;
   thumb: StaticImageData[];
}

const thumb_data: DataType[] = [
   {
      id: 1,
      thumb: [hero_img1, hero_img2],
   },
   {
      id: 2,
      thumb: [hero_img3, hero_img4],
   },
   {
      id: 3,
      thumb: [hero_img5, hero_img6],
   },
   {
      id: 4,
      thumb: [hero_img7],
   },
   {
      id: 5,
      thumb: [hero_img8, hero_img9],
   },
   {
      id: 6,
      thumb: [hero_img10, hero_img11],
   },
   {
      id: 7,
      thumb: [hero_img12, hero_img13],
   },
];

const Hero = () => {
   return (
      <section className="hero-section">
         <div className="hero-wrapper-two bg_cover" style={{ backgroundImage: "url(/assets/images/hero/hero-bg-2.png)" }}>
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-xl-8 col-lg-10">
                     <div className="hero-content text-center">
                        <h1 className="heading-title wow fadeInDown">Best AI Image Generator
                           Tools<span>Create Awesome Image</span></h1>
                        <p className="wow fadeInUp">Write unique & plagiarism-free content for blogs,
                           articles, ads, products, websites &social <br /> media unlock the power of
                           generative AI across every team.</p>
                        <div className="hero-form wow fadeInDown">
                           <form onSubmit={(e) => e.preventDefault()}>
                              <div className="form-group">
                                 <input type="search" className="form-control"
                                    placeholder="Describe what you want" />
                                 <button className="theme-btn style-one">Generate</button>
                              </div>
                           </form>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="hero-image-wrapper">
               <div className="row align-items-end">
                  {thumb_data.map((item) => (
                     <div key={item.id} className="col">
                        {item.thumb.map((img, i) => (
                           <div key={i} className="hero-img mb-15">
                              <Image src={img} alt="image" />
                           </div>
                        ))}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}

export default Hero
