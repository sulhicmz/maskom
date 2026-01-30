"use client";

import inner_faq_data from "@/data/InnerFaqData";
import { useEffect, useCallback } from "react";
import { useTabs } from "@/hooks/useTabs";
import { useAccordion } from "@/hooks/useAccordion";
import React from "react";

const tab_title: string[] = ["Layanan Konektivitas", "Operasional & Dukungan", "Administrasi & Kontrak"];

const FaqArea = React.memo(() => {
  const { activeId, toggle, setActiveId } = useAccordion({ initialId: null });
  const { activeTab, handleTabClick } = useTabs({ tabCount: tab_title.length });

  const handleTabClickCallback = useCallback((index: number) => {
    handleTabClick(index);
  }, [handleTabClick]);

  const toggleCallback = useCallback((itemId: number) => {
    toggle(itemId);
  }, [toggle]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        handleTabClickCallback((index + 1) % tab_title.length);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        handleTabClickCallback((index - 1 + tab_title.length) % tab_title.length);
        break;
      case 'Home':
        e.preventDefault();
        handleTabClickCallback(0);
        break;
      case 'End':
        e.preventDefault();
        handleTabClickCallback(tab_title.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabClickCallback(index);
        break;
    }
  }, [handleTabClickCallback]);

  useEffect(() => {
    if (inner_faq_data[activeTab]?.faq_details?.length) {
      setActiveId(inner_faq_data[activeTab].faq_details[0].id);
    } else {
      setActiveId(null);
    }
  }, [activeTab, setActiveId]);

  return (
    <section className="faqs-section pt-115 pb-80" aria-label="Frequently Asked Questions">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="sidebar-nav-widget style-two mb-40">
              <h6 id="faq-categories-heading">Categories</h6>
              <ul className="nav nav-tabs" role="tablist" aria-labelledby="faq-categories-heading">
                {tab_title.map((tab, index) => (
                  <li key={index} className="nav-item" role="presentation">
                    <button
                      id={`faq-tab-${index}`}
                      className={`nav-link ${activeTab === index ? "active" : ""}`}
                      onClick={() => handleTabClickCallback(index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      role="tab"
                      aria-selected={activeTab === index}
                      aria-controls={`faq-panel-${index}`}
                      tabIndex={activeTab === index ? 0 : -1}
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
                <div
                  className="section-content-box"
                  id={`faq-panel-${activeTab}`}
                  role="tabpanel"
                  aria-labelledby={`faq-tab-${activeTab}`}
                  hidden={false}
                >
                  <div className="accordion" id="accordionTwo">
                     {inner_faq_data[activeTab].faq_details.map((item) => (
                        <div key={item.id} className="accordion-card style-two mb-15">
                          <div className="accordion-header">
                            <button
                              id={`faq-item-button-${item.id}`}
                              onClick={() => toggleCallback(item.id)}
                              className={`accordion-title ${activeId === item.id ? "" : "collapsed"}`}
                              aria-expanded={activeId === item.id}
                              aria-controls={`collapse${item.id}`}
                            >
                              {item.title}
                            </button>
                          </div>
                          <div
                            id={`collapse${item.id}`}
                            role="region"
                            aria-labelledby={`faq-item-button-${item.id}`}
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
});

FaqArea.displayName = "FaqArea";

export default FaqArea;


