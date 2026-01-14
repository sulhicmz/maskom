"use client"
import { pricing_price } from "@/data/PriceData";
import PricingTabs from "@/components/common/PricingTabs";
import React from "react";

const PricingArea = () => {

    return (
        <PricingTabs
            data={pricing_price}
            tabTitles={["Konektivitas Terkelola", "Keamanan & Dukungan"]}
            sectionTitle={{
                subtitle: "Paket Layanan",
                title: "Investasi Infrastruktur Digital Maskom",
                description: "Pilih kombinasi layanan konektivitas dan managed service yang selaras dengan roadmap transformasi digital perusahaan Anda.",
                align: "center",
                className: "mb-50",
                animation: "fadeInDown"
            }}
            sectionClassName="pt-110"
            ariaLabel="Pricing Plans"
            tablistAriaLabel="Pricing Category Tabs"
            idPrefix="pricing"
        />
    )
}

PricingArea.displayName = "PricingArea"

export default PricingArea
