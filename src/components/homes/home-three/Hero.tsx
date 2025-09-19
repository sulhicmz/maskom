import Image from "next/image"
import Link from "next/link"

import thumb from "@/assets/images/hero/hero-image-1.jpg"

const Hero = () => {
   return (
      <section className="hero-section">
         <div className="hero-wrapper-three bg_cover"
            style={{ backgroundImage: "url(/assets/images/hero/hero-bg-3.png)" }}>
            <div className="container">
               <div className="row">
                  <div className="col-xl-5">
                     <div className="hero-content mb-50 pt-15">
                        <h1 className="heading-title wow fadeInDown">Turn your text into videos in minutes
                        </h1>
                        <p className="wow fadeInUp">Write unique & plagiarism-free content for blogs,
                           articles, ads, products, websites &social media unlock the</p>
                        <ul className="circle-list style-one mb-65 wow fadeInDown">
                           <li>Get natural sounding AI voices in 120+ languages</li>
                           <li>Make your videos more engaging with 140+ AI Avatars</li>
                           <li>Edit as simply as a slide-deck, no experience required</li>
                        </ul>
                        <div className="hero-button wow fadeInUp">
                           <Link href="/" className="theme-btn style-one">Start Writing Free </Link>
                        </div>
                     </div>
                  </div>
                  <div className="col-xl-7">
                     <div className="hero-one_image-box wow fadeInRight">
                        <Image src={thumb} alt="Hero Image" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Hero
