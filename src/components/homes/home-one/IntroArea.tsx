"use client"
import Image from 'next/image'
import { useState } from 'react';
import VideoPopup from "@/modals/VideoPopup"

import video_thumb from "@/assets/images/gallery/video-1.jpg"

const IntroArea = () => {

   const [isVideoOpen, setIsVideoOpen] = useState(false);

   return (
      <>
         <section className="intro-section pb-120" id="tentang">
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
                              <span className="sub-title style-one">Tentang Maskom</span>
                              <h2>Partner Infrastruktur Digital <br /> Untuk Bisnis Anda</h2>
                           </div>
                           <p>Sejak 2004 Maskom membantu perusahaan di Indonesia membangun konektivitas yang stabil, aman, dan mudah dikelola. Kami memadukan jaringan fiber, sistem keamanan, serta layanan managed service agar tim Anda fokus pada inovasi bisnis.</p>
                           <ul className="circle-list style-one">
                              <li>Engineer bersertifikasi yang siap melakukan deployment di seluruh nusantara.</li>
                              <li>Operasional jaringan dipantau dari Network Operation Center 24/7.</li>
                              <li>Model kerjasama fleksibel: sewa perangkat, managed service, hingga revenue sharing.</li>
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
