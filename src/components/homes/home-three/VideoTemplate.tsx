import Image from "next/image"
import video_data from "@/data/VideoTemplateData"
import Link from "next/link"

import shape_1 from "@/assets/images/shape/video-1.png"
import shape_2 from "@/assets/images/shape/video-2.png"
import shape_3 from "@/assets/images/shape/video-3.png"
import icon from "@/assets/images/icon/sub2_1.svg"

const VideoTemplate = () => {

   return (
      <>
         <section className="video-section">
            <div className="video-bg-wrapper pt-110 pb-90">
               <div className="shape shape-one"><span><Image src={shape_1}
                  alt="shape" /></span></div>
               <div className="shape shape-two"><span><Image src={shape_2}
                  alt="shape" /></span></div>
               <div className="shape shape-three"><span><Image src={shape_3}
                  alt="shape" /></span></div>
               <div className="container">
                  <div className="row justify-content-center">
                     <div className="col-lg-8">
                        <div className="section-title text-center mb-55 wow fadeInDown">
                           <span className="sub-title"><Image src={icon} alt="icon" />
                              Video Template <Image src={icon} alt="icon" /></span>
                           <h2>AI Video Templates</h2>
                           <p>Create engaging videos in minutes using our editable AI video templates.
                              Choose from a <br /> wide selection of customizable, professionally designed,
                              and easy-to-use templates.</p>
                        </div>
                     </div>
                  </div>
                  <div className="row">
                     {video_data.filter((items) => items.page === "home_3").map((item) => (
                        <div key={item.id} className="col-xl-4 col-md-6 col-sm-12">
                           <div className="features-image-card mb-30 wow fadeInUp">
                              <div className="image">
                                 <Image src={item.thumb} alt="image" />
                              </div>
                              <div className="content">
                                 <h4><Link href="/use-case-details">{item.title}</Link> </h4>
                                 <p>{item.desc}</p>
                                 <Link href="/use-cases" className="theme-btn style-two">See Template</Link>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>
      </>
   )
}

export default VideoTemplate
