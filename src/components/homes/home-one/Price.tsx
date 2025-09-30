"use client"
import price_data from "@/data/PriceData";
import Link from "next/link";
import { useState } from "react";

const tab_title: string[] = ["Kontrak 12 Bulan", "Kontrak 36 Bulan"];

const Price = () => {

   const [activeTab, setActiveTab] = useState(0);

   // Handle tab click event
   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   return (
      <section className="pricing-section" id="paket">
         <div className="pricing-wrapper black-dark-bg pt-110 pb-80">
            <div className="container">
               <div className="row">
                  <div className="col-lg-12">
                     <div className="section-title text-center title-white mb-50 wow fadeInDown">
                        <span className="sub-title style-one">Paket Layanan</span>
                        <h2>Pilih Skema Layanan Sesuai Kebutuhan Anda</h2>
                        <p>Seluruh paket sudah termasuk instalasi, monitoring proaktif, dan dukungan engineer Maskom sesuai SLA yang disepakati.</p>
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
                        {price_data.filter((prices) => prices.page === "home_1").map((items, index) => (
                           <div key={items.id} className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`} id="all">
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
                                                   {item.currency === "IDR"
                                                      ? new Intl.NumberFormat("id-ID").format(item.price)
                                                      : item.price.toFixed(2)}
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
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Price
