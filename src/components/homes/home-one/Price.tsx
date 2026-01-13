"use client"
import { home_1_price } from "@/data/PriceData";
import PricingTabs from "@/components/common/PricingTabs";
import React from "react";

const Price = React.memo(() => {

    return (
        <PricingTabs
            data={home_1_price}
            tabTitles={["Kontrak 12 Bulan", "Kontrak 36 Bulan"]}
            sectionTitle={{
                subtitle: "Paket Layanan",
                title: "Pilih Skema Layanan Sesuai Kebutuhan Anda",
                description: "Seluruh paket sudah termasuk instalasi, monitoring proaktif, dan dukungan engineer Maskom sesuai SLA yang disepakati.",
                align: "center",
                className: "mb-50",
                animation: "fadeInDown",
                whiteText: true
            }}
            wrapperClassName="black-dark-bg pt-110 pb-80"
            sectionClassName=""
            ariaLabel="Paket"
            sectionId="paket"
        />
    )
})

Price.displayName = "Price"

export default Price
