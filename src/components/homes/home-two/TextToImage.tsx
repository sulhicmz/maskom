
import icon from "@/assets/images/icon/sub-icon.png"
import img from "@/assets/images/gallery/text-img1.png"
import Image from "next/image"

const TextToImage = () => {
   return (
      <section className="text-to-image">
         <div className="text-bg-wrapper bg_cover pt-120 pb-70"
            style={{ backgroundImage: "url(/assets/images/bg/text-bg-1.jpg)" }}>
            <div className="container">
               <div className="row align-items-center">
                  <div className="col-xl-5">
                     <div className="text-one_content-box mb-50 wow fadeInLeft">
                        <div className="section-title mb-65">
                           <span className="sub-title"><Image src={icon} alt="icon" /> Text to Image</span>
                           <h2>Text-to-Image AI Generator Introduction</h2>
                        </div>
                        <p>Artificial intelligence picture generator from text rejuvenates your idea
                           workmanship online in not more than seconds. Text to picture apparatus,
                           permits you to take text prompts and </p>
                        <ul className="check-list style-one mb-35">
                           <li><i className="flaticon-check"></i>25,000 Monthly Word Limit</li>
                           <li><i className="flaticon-check"></i>20+ Templates</li>
                           <li><i className="flaticon-check"></i>All types of content</li>
                           <li><i className="flaticon-check"></i>30+ Languages</li>
                        </ul>
                        <a href="use-cases.html" className="theme-btn style-one">Generate AI Image</a>
                     </div>
                  </div>
                  <div className="col-xl-7">
                     <div className="text-one_image-box ml-xl-45 mb-50 wow fadeInRight">
                        <Image src={img} alt="Image" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default TextToImage
