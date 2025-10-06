"use client"
import Image from 'next/image'
import { useState } from 'react';
import VideoPopup from "@/modals/VideoPopup"

import video_thumb from "@/assets/images/gallery/video-1.jpg"

const IntroArea = () => {

   const [isVideoOpen, setIsVideoOpen] = useState(false);

   return (
      <>
         <section className="intro-section pb-120" id="dukungan">
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
                              <span className="sub-title style-one">Dukungan Maskom</span>
                              <h2>Tim Operasional Yang Menjaga Jaringan <br /> Tetap Terkendali</h2>
                           </div>
                           <p>Maskom tidak hanya memasang jaringan. Engineer kami mendampingi mulai dari tahap desain, menyiapkan SOP incident, hingga memberikan laporan kesehatan jaringan berkala agar keputusan TI Anda selalu berbasis data.</p>
                           <ul className="circle-list style-one">
                              <li>Network Operation Center memonitor 24/7 dengan SLA respons hingga 2 jam.</li>
                              <li>Engineer bersertifikasi siap onsite di lebih dari 40 kota besar di Indonesia.</li>
                              <li>Review performa dan rekomendasi optimasi dikirim rutin ke tim Anda.</li>
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
