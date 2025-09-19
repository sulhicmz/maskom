"use client"
import price_data from "@/data/PriceData";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image"

import icon from "@/assets/images/icon/sub-icon.png"

const tab_title: string[] = ["Monthly Plan", "Annual Plan"];

const Pricing = () => {

   const [activeTab, setActiveTab] = useState(0);

   // Handle tab click event
   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   return (
      <section className="pricing-section">
         <div className="pricing-bg-wrapper bg_cover pt-115 pb-80"
            style={{ backgroundImage: "url(/assets/images/bg/pricing-bg-2.jpg)" }}>
            <div className="container">
               <div className="row">
                  <div className="col-lg-12">
                     <div className="section-title text-white text-center mb-55 wow fadeInDown">
                        <span className="sub-title"><Image src={icon} alt="icon" />
                           Pricing Plan <Image src={icon} alt="icon" /></span>
                        <h2>Choose Your Best Plan</h2>
                        <p>In a few seconds, our A.I. will generate amazing results that<br />you can
                           copy, paste & publish. , write creatively in </p>
                     </div>
                  </div>
               </div>
               <div className="row">
                  <div className="col-lg-12">
                     <div className="pricing-tabs style-one text-center mb-40 wow fadeInUp">
                        <ul className="nav nav-tabs">
                           {tab_title.map((tab, index) => (
                              <li key={index}>
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
                        {price_data.filter((prices) => prices.page === "home_2").map((items, index) => (
                           <div key={items.id} className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`} id="all">
                              <div className="row">
                                 {items.price_details.map((item) => (
                                    <div key={item.id} className="col-xl-3 col-md-6 col-sm-12">
                                       <div className="pricing-item style-three mb-40 wow fadeInUp">
                                          <div className="pricing-head text-center">
                                             <span className="package">{item.sub_title}</span>
                                             <h3><span className="currency">$</span>{item.price}.00</h3>
                                          </div>
                                          <div className="pricing-body">
                                             <ul className="check-list style-one">
                                                {item.feature.map((list, i) => (
                                                   <li key={i}><i className="flaticon-check"></i>{list}</li>
                                                ))}
                                             </ul>
                                          </div>
                                          <div className="pricing-button text-center">
                                             <Link href="/" className="theme-btn style-two">{item.btn}</Link>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
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

export default Pricing
