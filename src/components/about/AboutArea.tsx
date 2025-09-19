import about_img1 from "@/assets/images/about/about-1.jpg"
import about_img2 from "@/assets/images/about/about-2.jpg"
import about_img3 from "@/assets/images/about/about-3.jpg"

import author from "@/assets/images/about/author-1.jpg"
import signature from "@/assets/images/about/sign.png"

import Image from "next/image"
const AboutArea = () => {
   return (
      <section className="about-section pt-120 pb-65">
         <div className="container">
            <div className="row">
               <div className="col-xl-7">
                  <div className="about-image-box mb-25">
                     <div className="row">
                        <div className="col-lg-12">
                           <Image src={about_img1} className="mb-25 wow fadeInDown" alt="about image" />
                        </div>
                        <div className="col-lg-6">
                           <Image src={about_img2} className="mb-25 wow fadeInUp" alt="about image" />
                        </div>
                        <div className="col-lg-6">
                           <Image src={about_img3} className="mb-25 wow fadeInUp" alt="about image" />
                        </div>
                     </div>
                  </div>
               </div>
               <div className="col-xl-5">
                  <div className="section-content-box about-one_content-box wow fadeInRight">
                     <div className="section-title mb-50">
                        <span className="sub-title style-one">Awesome Features</span>
                        <h2>The AI Writer&apos;s Tools for Content Creators</h2>
                     </div>
                     <p>An AI content generator is a type of software powered by artificial intelligence
                        (AI) that is designed to <span>automatically</span> produce <span>written
                           content.</span> These tools leverage various natural language processing
                        (NLP) and machine learning techniques to understand language patterns, generate
                        text, and mimic human-like writing. <span>AI content generators</span> can be
                        used for a variety of purposes, ranging from creating blog posts and articles to
                        generating marketing copy, product descriptions, and more.</p>
                     <div className="author-card d-flex align-items-center justify-content-between">
                        <div className="author-thumb-item d-flex align-items-center">
                           <div className="thumb">
                              <Image src={author} alt="Author image" />
                           </div>
                           <div className="content">
                              <h5>Leslie Alexander</h5>
                              <span className="position">CEO, AIcraft</span>
                           </div>
                        </div>
                        <div className="author-sign">
                           <Image src={signature} alt="author sign" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default AboutArea
