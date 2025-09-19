"use client"
import React, { useState } from 'react';
import VideoPopup from "@/modals/VideoPopup"
import Image, { StaticImageData } from "next/image"
import icon from "@/assets/images/icon/sub2_1.svg"
import Link from "next/link"

import avatar_1 from "@/assets/images/team/avatar-1.jpg"
import avatar_2 from "@/assets/images/team/avatar-2.jpg"
import avatar_3 from "@/assets/images/team/avatar-3.jpg"
import avatar_4 from "@/assets/images/team/avatar-4.jpg"
import avatar_5 from "@/assets/images/team/avatar-5.jpg"
import avatar_6 from "@/assets/images/team/avatar-6.jpg"

interface DataType {
   id: number;
   avatar: StaticImageData;
   video_url: string;
}

const avatar_data: DataType[] = [
   {
      id: 1,
      avatar: avatar_1,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 2,
      avatar: avatar_2,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 3,
      avatar: avatar_3,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 4,
      avatar: avatar_4,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 5,
      avatar: avatar_5,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 6,
      avatar: avatar_6,
      video_url: "Ml4XCF-JS0k",
   },
];

const Avatar = () => {

   const [isVideoOpen, setIsVideoOpen] = useState(false);

   return (
      <section className="ai-avatar-seciton bg_cover pt-120 pb-110"
         style={{ backgroundImage: "url(/assets/images/bg/pattern-bg.jpg)" }}>
         <div className="container">
            <div className="row">
               <div className="col-xl-5">
                  <div className="section-content-box mb-50 wow fadeInLeft">
                     <div className="section-title mb-55">
                        <span className="sub-title"><Image src={icon} alt="icon" /> AI
                           Avatar</span>
                        <h2>Create Videos as Diverse as
                           Your Audience</h2>
                        <p>In a few seconds, our A.I. will generate amazing results that <br /> you can
                           copy, paste & publish. , write creatively</p>
                     </div>
                     <Link href="/use-cases" className="theme-btn style-one">Generate AI Image</Link>
                  </div>
               </div>
               <div className="col-xl-7">
                  <div className="row">
                     {avatar_data.map((item) => (
                        <React.Fragment key={item.id}>
                           <div className="col-lg-4 col-md-6 col-sm-12">
                              <div className="avatar-item style-one mb-10 wow fadeInDown">
                                 <div className="avatar-img">
                                    <Image src={item.avatar} alt="avatar" />
                                    <div className="hover-overlay">
                                       <a onClick={() => setIsVideoOpen(true)} style={{ cursor: "pointer" }} className="video-popup"><i className="fas fa-play"></i></a>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <VideoPopup
                              isVideoOpen={isVideoOpen}
                              setIsVideoOpen={setIsVideoOpen}
                              videoId={item.video_url}
                           />
                        </React.Fragment>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Avatar
