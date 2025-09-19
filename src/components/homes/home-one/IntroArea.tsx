"use client"
import Image from 'next/image'
import { useState } from 'react';
import VideoPopup from "@/modals/VideoPopup"

import video_thumb from "@/assets/images/gallery/video-1.jpg"

const IntroArea = () => {

   const [isVideoOpen, setIsVideoOpen] = useState(false);

   return (
      <>
         <section className="intro-section pb-120">
            <div className="container">
               <div className="intro-wrapper">
                  <div className="row align-items-center">
                     <div className="col-xl-6">
                        <div className="video-one_image-box p-r z-1 mb-50 wow fadeInLeft">
                           <Image src={video_thumb} alt="video image" />
                           <div className="play-button">
                              <a onClick={() => setIsVideoOpen(true)} style={{ cursor: "pointer" }} className="video-popup"><i
                                 className="flaticon-play-button-arrowhead"></i></a>
                           </div>
                        </div>
                     </div>
                     <div className="col-xl-6">
                        <div className="section-content-box text-white mb-50 wow fadeInRight">
                           <div className="section-title mb-55">
                              <span className="sub-title style-one">Amazing AI</span>
                              <h2>Content Generation with <br /> Artificial Intelligence</h2>
                           </div>
                           <p>Create duplicate that proselytes for business profiles, facebook
                              advertisements, item portrayals, messages, points of arrival, social
                              promotions, from there, the sky is the limit.</p>
                           <ul className="circle-list style-one">
                              <li>Make article that are finished in under 15 seconds.</li>
                              <li>Save many hours with our AI intelligence article generator.</li>
                              <li>Work on your duplicate with the article rewriter.</li>
                           </ul>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <VideoPopup
            isVideoOpen={isVideoOpen}
            setIsVideoOpen={setIsVideoOpen}
            videoId={"Ml4XCF-JS0k"}
         />
      </>
   )
}

export default IntroArea
