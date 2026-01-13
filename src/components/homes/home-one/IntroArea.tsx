"use client"
import Image from 'next/image'
import { useState } from 'react';
import dynamic from 'next/dynamic'

const VideoPopup = dynamic(() => import("@/modals/VideoPopup"), {
  ssr: false,
  loading: () => null
})

import video_thumb from "@/assets/images/gallery/video-1.svg"
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"

const IntroArea = () => {

   const [isVideoOpen, setIsVideoOpen] = useState(false);

   return (
      <>
         <section className="intro-section pb-120" id="tentang">
            <div className="container">
               <div className="intro-wrapper">
                  <div className="row align-items-center">
                   <div className="col-xl-6">
                         <AnimationWrapper animation="fadeInLeft" className="video-one_image-box p-r z-1 mb-50">
                            <Image src={video_thumb} alt="Video perkenalan layanan Maskom" />
                            <div className="play-button">
                               <button type="button" onClick={() => setIsVideoOpen(true)} className="video-popup" aria-label="Tonton video perkenalan Maskom"><i
                                  className="flaticon-play-button-arrowhead" aria-hidden="true"></i></button>
                            </div>
                         </AnimationWrapper>
                      </div>
                     <div className="col-xl-6">
                        <AnimationWrapper animation="fadeInRight" className="section-content-box text-white mb-50">
                           <SectionTitle 
                              subtitle="Tentang Maskom"
                              title="Partner Infrastruktur Digital Untuk Bisnis Anda"
                              className="mb-55"
                           />
                           <p>Sejak 2004 Maskom membantu perusahaan di Indonesia membangun konektivitas yang stabil, aman, dan mudah dikelola. Kami memadukan jaringan fiber, sistem keamanan, serta layanan managed service agar tim Anda fokus pada inovasi bisnis.</p>
                           <ul className="circle-list style-one">
                              <li>Engineer bersertifikasi yang siap melakukan deployment di seluruh nusantara.</li>
                              <li>Operasional jaringan dipantau dari Network Operation Center 24/7.</li>
                              <li>Model kerjasama fleksibel: sewa perangkat, managed service, hingga revenue sharing.</li>
                           </ul>
                        </AnimationWrapper>
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
