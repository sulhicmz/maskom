"use client"
import Link from "next/link";
import React from "react";
import type { PriceDetailItem } from "@/types/data";
import AnimationWrapper from "@/components/common/AnimationWrapper";

interface PricingCardProps {
   item: PriceDetailItem;
   animation?: "none" | "fadeInDown" | "fadeInUp" | "fadeInLeft" | "fadeInRight";
}

const PricingCard = React.memo(({ item, animation = "fadeInUp" }: PricingCardProps) => {
   return (
      <AnimationWrapper animation={animation}>
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
                      <li key={i}><i className="flaticon-check" aria-hidden="true"></i>{list}</li>
                   ))}
                </ul>
             </div>
         </div>
      </AnimationWrapper>
   )
})

PricingCard.displayName = "PricingCard"

export default PricingCard;
