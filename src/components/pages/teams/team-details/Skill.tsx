"use client"
import Image from "next/image"
import { useVideoPopup } from '@/hooks/useVideoPopup';

import skill_thumb from "@/assets/images/team/team-single-2.jpg"
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"

const Skill = () => {
   const { openVideo, VideoPopupComponent } = useVideoPopup("Ml4XCF-JS0k");

   return (
      <>
         <section className="skill-section pb-70">
            <div className="container">
               <div className="row align-items-center">
                  <div className="col-xl-7">
                     <AnimationWrapper animation="fadeInLeft" className="skill-content-box">
                        <SectionTitle
                           title="My Skills"
                           description="Our goal is to utilize today's ttechnologies to stay ahead of the curve."
                           className="mb-50"
                        />
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
                     </AnimationWrapper>
                  </div>
                   <div className="col-xl-5">
                      <AnimationWrapper animation="fadeInRight" className="skill-one_image-box mb-50">
                         <Image src={skill_thumb} alt="Demostrasi skill dan kemampuan tim Maskom" />
                         <div className="image-overlay">
                            <div className="play-button d-flex align-items-center">
                               <button type="button" onClick={openVideo} className="video-popup" aria-label="Tonton video bio"><i
                                  className="flaticon-play-button-arrowhead" aria-hidden="true"></i></button>
                               <div className="text">Discover my bio</div>
                            </div>
                         </div>
                      </AnimationWrapper>
                   </div>
               </div>
            </div>
         </section>

         {VideoPopupComponent}
      </>
   )
}

export default Skill
