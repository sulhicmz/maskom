"use client"
import VideoPopup from "@/modals/VideoPopup"
import Image from "next/image"
import { useState } from "react";

import skill_thumb from "@/assets/images/team/team-single-2.jpg"

const Skill = () => {

   const [isVideoOpen, setIsVideoOpen] = useState(false);

   return (
      <>
         <section className="skill-section pb-70">
            <div className="container">
               <div className="row align-items-center">
                  <div className="col-xl-7">
                     <div className="skill-content-box wow fadeInLeft">
                        <div className="section-title mb-50">
                           <h2>My Skills</h2>
                           <p>Our goal is to utilize today&apos;s ttechnologies to stay ahead of the curve.</p>
                        </div>
                        <div className="skill-item style-one mb-50">
                           <h5>Analytical</h5>
                           <div className="skill-bar skill1 wow slideInLeft">
                              <span className="skill-count2">73%</span>
                           </div>
                        </div>
                        <div className="skill-item style-one mb-50">
                           <h5>Problem solving.</h5>
                           <div className="skill-bar skill2 wow slideInLeft">
                              <span className="skill-count3">80%</span>
                           </div>
                        </div>
                        <div className="skill-item style-one mb-50">
                           <h5>Analytical</h5>
                           <div className="skill-bar skill3 wow slideInLeft">
                              <span className="skill-count4">90%</span>
                           </div>
                        </div>
                        <div className="skill-item style-one mb-50">
                           <h5>Determination</h5>
                           <div className="skill-bar skill4 wow slideInLeft">
                              <span className="skill-count4">40%</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="col-xl-5">
                     <div className="skill-one_image-box mb-50 wow fadeInRight">
                        <Image src={skill_thumb} alt="Skill Image" />
                        <div className="image-overlay">
                           <div className="play-button d-flex align-items-center">
                              <a onClick={() => setIsVideoOpen(true)} style={{ cursor: "pointer" }} className="video-popup"><i
                                 className="flaticon-play-button-arrowhead"></i></a>
                              <div className="text">Discover my bio</div>
                           </div>
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

export default Skill
