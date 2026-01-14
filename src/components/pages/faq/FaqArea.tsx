"use client";

import inner_faq_data from "@/data/InnerFaqData";
import { useEffect } from "react";
import { useTabs } from "@/hooks/useTabs";
import { useAccordion } from "@/hooks/useAccordion";
import React from "react";

const tab_title: string[] = ["Layanan Konektivitas", "Operasional & Dukungan", "Administrasi & Kontrak"];

const FaqArea = () => {
  const { activeId, toggle, setActiveId } = useAccordion({ initialId: null });
  const { activeTab, handleTabClick } = useTabs({ tabCount: tab_title.length });

  useEffect(() => {
    if (inner_faq_data[activeTab]?.faq_details?.length) {
      setActiveId(inner_faq_data[activeTab].faq_details[0].id);
    } else {
      setActiveId(null);
    }
  }, [activeTab, setActiveId]);

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
                            <button
                              onClick={() => toggle(item.id)}
                              className={`accordion-title ${activeId === item.id ? "" : "collapsed"}`}
                              aria-expanded={activeId === item.id}
                              aria-controls={`collapse${item.id}`}
                            >
                              {item.title}
                            </button>
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

FaqArea.displayName = "FaqArea"

export default FaqArea;
