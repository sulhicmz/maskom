"use client"
import React, { useState } from 'react';
import VideoPopup from "@/modals/VideoPopup"
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import thumb_1 from "@/assets/images/gallery/video-2.jpg"
import flag_1 from "@/assets/images/gallery/flag-1.png"
import flag_2 from "@/assets/images/gallery/flag-2.png"
import flag_3 from "@/assets/images/gallery/flag-3.png"
import flag_4 from "@/assets/images/gallery/flag-4.png"
import flag_5 from "@/assets/images/gallery/flag-5.png"
import flag_6 from "@/assets/images/gallery/flag-6.png"
import flag_7 from "@/assets/images/gallery/flag-7.png"
import map from "@/assets/images/gallery/map.png"
import icon from "@/assets/images/icon/sub2_1.svg"

interface DataType {
   id: number;
   thumb: StaticImageData;
   flag: StaticImageData;
   video_url: string
}

interface TabData {
   id: number;
   title: string;
   flag: StaticImageData;
}

const ai_voiceover_data: DataType[] = [
   {
      id: 1,
      thumb: thumb_1,
      flag: flag_1,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 2,
      thumb: thumb_1,
      flag: flag_2,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 3,
      thumb: thumb_1,
      flag: flag_3,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 4,
      thumb: thumb_1,
      flag: flag_4,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 5,
      thumb: thumb_1,
      flag: flag_5,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 6,
      thumb: thumb_1,
      flag: flag_6,
      video_url: "Ml4XCF-JS0k",
   },
   {
      id: 7,
      thumb: thumb_1,
      flag: flag_7,
      video_url: "Ml4XCF-JS0k",
   },
];

const tab_data: TabData[] = [
   {
      id: 1,
      title: "US English",
      flag: flag_1,
   },
   {
      id: 2,
      title: "China",
      flag: flag_2,
   },
   {
      id: 3,
      title: "Spanish",
      flag: flag_3,
   },
   {
      id: 4,
      title: "Germany",
      flag: flag_4,
   },
   {
      id: 5,
      title: "India",
      flag: flag_5,
   },
   {
      id: 6,
      title: "Japanese",
      flag: flag_6,
   },
   {
      id: 7,
      title: "Turkish",
      flag: flag_7,
   },
];

const AiVoiceover = () => {

   const [isVideoOpen, setIsVideoOpen] = useState(false);
   const [activeTab, setActiveTab] = useState(0);

   // Handle tab click event
   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   return (
      <section className="ai-voiceovers-section">
         <div className="voiceover-wrapper p-r z-1 pt-120 pb-65">
            <div className="voiceover-bg"><span><Image src={map} alt="map" /></span></div>
            <div className="container">
               <div className="row">
                  <div className="col-xl-6">
                     <div className="voiceovers-tabs-wrap mb-50 wow fadeInLeft">
                        <div className="theme-tabs style-two">
                           <ul className="nav nav-tabs">
                              {tab_data.map((tab, index) => (
                                 <li key={index}>
                                    <button className={`nav-link ${activeTab === index ? "active" : ""}`} onClick={() => handleTabClick(index)} >
                                       <span><Image src={tab.flag}
                                          alt="US Flag" />{tab.title}</span>
                                    </button>
                                 </li>
                              ))}
                           </ul>
                        </div>
                        <div className="tab-content">
                           {ai_voiceover_data.map((item, index) => (
                              <React.Fragment key={item.id}>
                                 <div key={index} className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`} id="country1">
                                    <div className="video-two_image-box text-center">
                                       <Image src={item.thumb} alt="video image" />
                                       <div className="country"><Image src={item.flag}
                                          className="tab-image" alt="Flag" /></div>
                                       <a onClick={() => setIsVideoOpen(true)} style={{ cursor: "pointer" }} className="video-popup"><i className="fas fa-play"></i></a>
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
                  <div className="col-xl-6">
                     <div className="section-content-box mb-50 wow fadeInRight">
                        <div className="section-title mb-30">
                           <span className="sub-title"><Image src={icon} alt="icon" />
                              AI VOICEOVERS</span>
                           <h2>Turn Text Into High-Quality
                              Voiceovers With One Click</h2>
                        </div>
                        <ul className="circle-list style-one mb-45">
                           <li>Get natural sounding AI voices in 120+ languages</li>
                           <li>Clone your own voice</li>
                           <li>Automatic closed captions included</li>
                        </ul>
                        <Link href="/about" className="theme-btn style-one">Generate AI Image</Link>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default AiVoiceover
