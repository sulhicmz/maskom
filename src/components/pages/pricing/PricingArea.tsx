"use client"
import { pricing_price } from "@/data/PriceData";
import Link from "next/link";
import SectionTitle from "@/components/common/SectionTitle"
import AnimationWrapper from "@/components/common/AnimationWrapper"
import { useTabs } from "@/hooks/useTabs";

const tab_title: string[] = ["Konektivitas Terkelola", "Keamanan & Dukungan"];

const PricingArea = () => {

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
                              <div className="pricing-item style-one mb-40">
                                 <div className="pricing-head text-center">
                                    <span className="package">{item.sub_title}</span>
                                    {item.price_label ? (
                                       <h3>{item.price_label}</h3>
                                    ) : (
                                       <h3>
                                          <span className="currency">{item.currency === "IDR" ? "Rp" : "$"}</span>
                                          {item.currency === "IDR" ? new Intl.NumberFormat("id-ID").format(item.price) : item.price}
                                       </h3>
                                    )}
                                    {item.note && <p className="mt-10">{item.note}</p>}
                                    <Link href="/contact" className="theme-btn style-two">{item.btn}</Link>
                                 </div>
                                 <div className="pricing-body">
                                    <ul className="check-list style-one">
                                       {item.feature.map((list, i) => (
                                          <li key={i}><i className="flaticon-check"></i>{list}</li>
                                       ))}
                                    </ul>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </AnimationWrapper>
         </div>
      </section>
   )
}

export default PricingArea
