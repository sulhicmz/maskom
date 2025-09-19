"use client"
import Image, { StaticImageData } from "next/image"
import { useState } from "react";
import Link from "next/link";

import avatar_img from "@/assets/images/testimonial/thumb-9.jpg"
import thumb_img from "@/assets/images/case/case-7.jpg"
import shape from "@/assets/images/shape/use-shape-1.png"
import icon from "@/assets/images/icon/sub2_1.svg"

const tab_title: string[] = ["Learning & Development", "Sales Enablement", "Customer Service", "Information Security", "Marketing"];

interface DataType {
   id: number;
   title: string;
   desc: string;
   avatar: StaticImageData;
   thumb: StaticImageData;
   name: string;
   designation: string;
}

const cause_data: DataType[] = [
   {
      id: 1,
      title: "Replace boring text, PowerPoints and PDFs with engaging videos your team will love",
      desc: `"Usually, our colleagues don't jump in the air when they hear e-learning, but the AI videos created with Synthesia have sparked motivation that we haven't seen before."`,
      avatar: avatar_img,
      thumb: thumb_img,
      name: "Jenny Wilson",
      designation: "Product Designer"
   },
   {
      id: 2,
      title: "Replace boring text, PowerPoints and PDFs with engaging videos your team will love",
      desc: `"Usually, our colleagues don't jump in the air when they hear e-learning, but the AI videos created with Synthesia have sparked motivation that we haven't seen before."`,
      avatar: avatar_img,
      thumb: thumb_img,
      name: "Jenny Wilson",
      designation: "Product Designer"
   },
   {
      id: 3,
      title: "Replace boring text, PowerPoints and PDFs with engaging videos your team will love",
      desc: `"Usually, our colleagues don't jump in the air when they hear e-learning, but the AI videos created with Synthesia have sparked motivation that we haven't seen before."`,
      avatar: avatar_img,
      thumb: thumb_img,
      name: "Jenny Wilson",
      designation: "Product Designer"
   },
   {
      id: 4,
      title: "Replace boring text, PowerPoints and PDFs with engaging videos your team will love",
      desc: `"Usually, our colleagues don't jump in the air when they hear e-learning, but the AI videos created with Synthesia have sparked motivation that we haven't seen before."`,
      avatar: avatar_img,
      thumb: thumb_img,
      name: "Jenny Wilson",
      designation: "Product Designer"
   },
];

const Cause = () => {

   const [activeTab, setActiveTab] = useState(0);

   // Handle tab click event
   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   return (
      <section className="use-cases-section pt-110 pb-65">
         <div className="case-wrapper p-r z-1">
            <div className="shape shape-one"><span><Image src={shape} alt="shape" /></span></div>
            <div className="container">
               <div className="row">
                  <div className="col-lg-12">
                     <div className="section-title text-center mb-55 wow fadeInDown">
                        <span className="sub-title"><Image src={icon} alt="icon" /> Use
                           Causes <Image src={icon} alt="icon" /></span>
                        <h2>For teams That Create Videos at Scale</h2>
                        <p>In a few seconds, our A.I. will generate amazing results that <br /> you can
                           copy, paste & publish. , write creatively</p>
                     </div>
                  </div>
               </div>
               <div className="row">
                  <div className="col-lg-12">
                     <div className="theme-tabs style-one mb-45 wow fadeInUp">
                        <ul className="nav nav-tabs justify-content-center">
                           {tab_title.map((tab, index) => (
                              <li key={index} >
                                 <button className={`nav-link ${activeTab === index ? "active" : ""}`} onClick={() => handleTabClick(index)}>
                                    {tab}
                                 </button>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>
               <div className="row">
                  <div className="col-lg-12">
                     <div className="tab-content wow fadeInDown">
                        {cause_data.map((item, index) => (
                           <div key={item.id} className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`} id="case1">
                              <div className="row">
                                 <div className="col-lg-5">
                                    <div className="ac-tab-one_content-box mb-50">
                                       <h5>{item.title}</h5>
                                       <p>{item.desc}</p>
                                       <div className="author-thumb-item mb-55">
                                          <div className="thumb">
                                             <Image src={item.avatar} alt="author thumb" />
                                          </div>
                                          <div className="content">
                                             <h6>{item.name}</h6>
                                             <span className="position">{item.designation}</span>
                                          </div>
                                       </div>
                                       <Link href="/use-case-details"
                                          className="theme-btn style-one">Generate AI Image</Link>
                                    </div>
                                 </div>
                                 <div className="col-lg-7">
                                    <div className="ac-tab_image-box mb-50 text-xl-end">
                                       <Image src={item.thumb} alt="case image" />
                                    </div>
                                 </div>
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

export default Cause
