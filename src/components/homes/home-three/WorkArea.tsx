"use client"
import dashboard from "@/assets/images/gallery/dashboard.jpg"
import Image, { StaticImageData } from "next/image";
import { useState } from "react";

import shape_1 from "@/assets/images/shape/work-1.png"
import shape_2 from "@/assets/images/shape/work-2.png"
import icon from "@/assets/images/icon/sub2_1.svg"

const tab_title: string[] = ["01. Select Your Avatar", "02. Customize Your Video", "03. Save or Export Video"];

const dashboard_data: StaticImageData[] = [dashboard, dashboard, dashboard];

const WorkArea = () => {

   const [activeTab, setActiveTab] = useState(0);

   // Handle tab click event
   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   return (
      <section className="how-to-work">
         <div className="work-bg-wrapper pt-115">
            <div className="shape shape-one"><span><Image src={shape_1} alt="shape" /></span>
            </div>
            <div className="shape shape-two"><span><Image src={shape_2} alt="shape" /></span>
            </div>
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-lg-12">
                     <div className="section-title text-center mb-55 wow fadeInDown">
                        <span className="sub-title"><Image src={icon} alt="icon" /> How
                           to Work <Image src={icon} alt="icon" /></span>
                        <h2>Create Videos as Easily as a Slide Deck</h2>
                        <p>In a few seconds, our A.I. will generate amazing results that <br /> you can
                           copy, paste & publish. , write creatively</p>
                     </div>
                  </div>
               </div>
               <div className="row">
                  <div className="col-lg-12">
                     <div className="theme-tabs style-three  mb-30 wow fadeInUp">
                        <ul className="nav nav-tabs justify-content-center">
                           {tab_title.map((tab, index) => (
                              <li key={index} onClick={() => handleTabClick(index)}>
                                 <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
                  <div className="col-lg-12">
                     <div className="tab-content wow fadeInDown">
                        {dashboard_data.map((item, index) => (
                           <div key={index} className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`} id="step1">
                              <div className="step-box text-center">
                                 <Image src={item} alt="dashboard" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default WorkArea
