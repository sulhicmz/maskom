"use client"
import { pricing_price } from "@/data/PriceData";
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"
import PricingCard from "@/components/common/PricingCard"
import { useTabs } from "@/hooks/useTabs";
import React from "react";

const tab_title: string[] = ["Konektivitas Terkelola", "Keamanan & Dukungan"];

const PricingArea = React.memo(() => {

   const { activeTab, handleTabClick, handleKeyDown } = useTabs({ tabCount: tab_title.length });

   return (
      <section className="pricing-section pt-110" aria-label="Pricing Plans">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <SectionTitle
                     subtitle="Paket Layanan"
                     title="Investasi Infrastruktur Digital Maskom"
                     description="Pilih kombinasi layanan konektivitas dan managed service yang selaras dengan roadmap transformasi digital perusahaan Anda."
                     align="center"
                     className="mb-50"
                     animation="fadeInDown"
                  />
               </div>
            </div>
            <div className="row">
               <div className="col-lg-12">
                  <AnimationWrapper animation="fadeInUp" className="pricing-tabs style-one text-center mb-40">
                     <ul className="nav nav-tabs" role="tablist" aria-label="Pricing Category Tabs">
                        {tab_title.map((tab, index) => (
                           <li key={index} role="presentation">
                              <button
                                 className={`nav-link ${activeTab === index ? "active" : ""}`}
                                 onClick={() => handleTabClick(index)}
                                 onKeyDown={(e) => handleKeyDown(e, index)}
                                 role="tab"
                                 aria-selected={activeTab === index}
                                 aria-controls={`pricing-tabpanel-${index}`}
                                 id={`pricing-tab-${index}`}
                                 tabIndex={activeTab === index ? 0 : -1}
                              >
                                 <span>{tab}</span>
                              </button>
                           </li>
                        ))}
                     </ul>
                  </AnimationWrapper>
               </div>
            </div>
             <AnimationWrapper animation="fadeInDown" className="tab-content" role="tabpanel">
                {pricing_price.map((items, index) => (
                   <div
                      key={items.id}
                      className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`}
                      role="tabpanel"
                      id={`pricing-tabpanel-${index}`}
                      aria-labelledby={`pricing-tab-${index}`}
                      hidden={activeTab !== index}
                   >
                      <div className="row">
                         {items.price_details.map((item) => (
                            <div key={item.id} className="col-xl-3 col-md-6 col-sm-12">
                               <PricingCard item={item} />
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
             </AnimationWrapper>
         </div>
      </section>
   )
})

PricingArea.displayName = "PricingArea"

export default PricingArea
