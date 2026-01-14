"use client"
import SectionTitle from "@/components/common/SectionTitle";
import AnimationWrapper from "@/components/common/AnimationWrapper";
import PricingCard from "@/components/common/PricingCard";
import { useTabs } from "@/hooks/useTabs";
import type { PriceDetailItem } from "@/types/data";
import React, { useCallback } from "react";

interface SectionTitleConfig {
    subtitle: string;
    title: string;
    description: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
    animation?: "fadeInDown" | "fadeInUp" | "fadeInLeft" | "fadeInRight" | "none";
    whiteText?: boolean;
}

interface PricingDataItem {
    id: number;
    price_details: PriceDetailItem[];
}

interface PricingTabsProps {
    data: PricingDataItem[];
    tabTitles: string[];
    sectionTitle: SectionTitleConfig;
    wrapperClassName?: string;
    sectionClassName?: string;
    ariaLabel?: string;
    tablistAriaLabel?: string;
    sectionId?: string;
    idPrefix?: string;
}

const PricingTabs = React.memo(({
    data,
    tabTitles,
    sectionTitle,
    wrapperClassName,
    sectionClassName,
    ariaLabel,
    tablistAriaLabel,
    sectionId,
    idPrefix = 'price'
}: PricingTabsProps) => {

    const { activeTab, handleTabClick: originalHandleTabClick, handleKeyDown: originalHandleKeyDown } = useTabs({ tabCount: tabTitles.length });

    const handleTabClick = useCallback((index: number) => {
        originalHandleTabClick(index);
    }, [originalHandleTabClick]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        originalHandleKeyDown(e, index);
    }, [originalHandleKeyDown]);

    return (
        <section id={sectionId} className={`pricing-section ${sectionClassName || ''}`} aria-label={ariaLabel}>
            <div className={`pricing-wrapper ${wrapperClassName || ''}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <SectionTitle
                                subtitle={sectionTitle.subtitle}
                                title={sectionTitle.title}
                                description={sectionTitle.description}
                                align={sectionTitle.align}
                                className={sectionTitle.className}
                                animation={sectionTitle.animation}
                                whiteText={sectionTitle.whiteText}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <AnimationWrapper animation="fadeInUp" className="pricing-tabs style-one text-center mb-40">
                                <ul className="nav nav-tabs" role="tablist" aria-label={tablistAriaLabel}>
                                    {tabTitles.map((tab, index) => (
                                        <li key={index} role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === index ? "active" : ""}`}
                                                onClick={() => handleTabClick(index)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                role="tab"
                                                aria-selected={activeTab === index}
                                                aria-controls={`${idPrefix}-tabpanel-${index}`}
                                                id={`${idPrefix}-tab-${index}`}
                                                tabIndex={activeTab === index ? 0 : -1}
                                            >
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
                                {data.map((items, index) => (
                                    <div
                                        key={items.id}
                                        className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`}
                                        role="tabpanel"
                                        id={`${idPrefix}-tabpanel-${index}`}
                                        aria-labelledby={`${idPrefix}-tab-${index}`}
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
                    </div>
                </div>
            </div>
        </section>
    )
})

PricingTabs.displayName = "PricingTabs"

export default PricingTabs
