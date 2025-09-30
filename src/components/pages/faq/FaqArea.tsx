"use client";

import inner_faq_data from "@/data/InnerFaqData";
import { useState, useEffect } from "react";

const tab_title: string[] = ["Layanan Konektivitas", "Operasional & Dukungan", "Administrasi & Kontrak"];

const FaqArea = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    if (inner_faq_data[activeTab]?.faq_details?.length) {
      setActiveId(inner_faq_data[activeTab].faq_details[0].id);
    } else {
      setActiveId(null);
    }
  }, [activeTab]);

  // Handle tab click event
  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <section className="faqs-section pt-115 pb-80">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="sidebar-nav-widget style-two mb-40">
              <h6>Categories</h6>
              <ul className="nav nav-tabs">
                {tab_title.map((tab, index) => (
                  <li key={index} className="nav-item">
                    <button
                      className={`nav-link ${activeTab === index ? "active" : ""}`}
                      onClick={() => handleTabClick(index)}
                    >
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="tab-content mb-40">
              {inner_faq_data[activeTab] && inner_faq_data[activeTab].faq_details ? (
                <div className="section-content-box">
                  <div className="accordion" id="accordionTwo">
                    {inner_faq_data[activeTab].faq_details.map((item) => (
                      <div key={item.id} className="accordion-card style-two mb-15">
                        <div className="accordion-header">
                          <h6
                            onClick={() => setActiveId(item.id)}
                            className={`accordion-title ${activeId === item.id ? "" : "collapsed"}`}
                          >
                            {item.title}
                          </h6>
                        </div>
                        <div
                          id={`collapse${item.id}`}
                          className={`accordion-collapse collapse ${activeId === item.id ? "show" : ""}`}
                        >
                          <div className="accordion-content">
                            <p>{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>No FAQs available for this category.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqArea;
