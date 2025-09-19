import Image from "next/image"
import Link from "next/link"

import dashboard_img from "@/assets/images/hero/dashboard-img.jpg"

const Hero = () => {
   return (
      <section className="hero-section">
         <div className="hero-wrapper bg_cover" style={{ backgroundImage: `url(/assets/images/hero/hero-bg-1.png)` }}>
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-lg-8">
                     <div className="hero-content text-center">
                        <h1 className="heading-title wow fadeInDown">Best AI Writer for Creating <span>Blog
                           Post & Articles</span></h1>
                        <p className="wow fadeInUp para-one">Write unique & plagiarism-free content for
                           blogs, articles, ads, products, websites &social <br /> media unlock the power
                           of generative AI across every team.</p>
                        <div className="hero-button wow fadeInDown">
                           <Link href="/" className="theme-btn gradient-btn">Start Writing Free </Link>
                        </div>
                        <p className="wow fadeInUp para-two">No credit card required</p>
                     </div>
                  </div>
               </div>
               <div className="row">
                  <div className="col-lg-12">
                     <div className="hero-one_image-box text-center wow fadeInUp">
                        <Image src={dashboard_img} alt="dashboard image" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Hero
