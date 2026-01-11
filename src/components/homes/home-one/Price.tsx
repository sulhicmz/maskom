"use client"
import { home_1_price } from "@/data/PriceData";
import SectionTitle from "@/components/common/SectionTitle";
import AnimationWrapper from "@/components/common/AnimationWrapper";
import PricingCard from "@/components/common/PricingCard";
import { useTabs } from "@/hooks/useTabs";

const tab_title: string[] = ["Kontrak 12 Bulan", "Kontrak 36 Bulan"];

const Price = () => {

   const { activeTab, handleTabClick } = useTabs({ tabCount: tab_title.length });

   return (
      <section className="pricing-section" id="paket">
         <div className="pricing-wrapper black-dark-bg pt-110 pb-80">
            <div className="container">
               <div className="row">
                  <div className="col-lg-12">
                     <SectionTitle 
                        subtitle="Paket Layanan"
                        title="Pilih Skema Layanan Sesuai Kebutuhan Anda"
                        description="Seluruh paket sudah termasuk instalasi, monitoring proaktif, dan dukungan engineer Maskom sesuai SLA yang disepakati."
                        align="center"
                        whiteText={true}
                        className="mb-50"
                        animation="fadeInDown"
                     />
                  </div>
               </div>
               <div className="row">
                  <div className="col-lg-12">
                     <AnimationWrapper animation="fadeInUp" className="pricing-tabs style-one text-center mb-40">
                        <ul className="nav nav-tabs">
                           {tab_title.map((tab, index) => (
                              <li key={index}>
                                 <button className={`nav-link ${activeTab === index ? "active" : ""}`} onClick={() => handleTabClick(index)}>
                                    {tab}
                                 </button>
                              </li>
                           ))}
                        </ul>
                     </AnimationWrapper>
                  </div>
               </div>
               <div className="row">
                   <div className="col-lg-12">
                       <AnimationWrapper animation="fadeInDown" className="tab-content">
                          {home_1_price.map((items, index) => (
                            <div key={items.id} className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`} id="all">
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
               </div>
            </div>
         </div>
      </section>
   )
}

export default Price
