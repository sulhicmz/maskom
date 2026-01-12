"use client"
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import type { StaticImageData } from "next/image";
import { SWIPER_CONFIG } from "@/constants/swiper";

interface BrandProps {
    brandData: StaticImageData[];
    title: string;
}

const Swiper = dynamic(() => import('swiper/react').then((mod) => mod.Swiper), {
    ssr: false,
    loading: () => <div className="text-center py-4">Loading client logos...</div>
});

const SwiperSlide = dynamic(() => import('swiper/react').then((mod) => mod.SwiperSlide), {
    ssr: false
});

const Brand = React.memo(({ brandData, title }: BrandProps) => {
    useEffect(() => {
        const loadSwiperCSS = async () => {
            if (!document.getElementById('swiper-css')) {
                const swiperCoreCSS = document.createElement('link');
                swiperCoreCSS.rel = 'stylesheet';
                swiperCoreCSS.href = 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css';
                swiperCoreCSS.id = 'swiper-css';
                document.head.appendChild(swiperCoreCSS);
            }
        };

        loadSwiperCSS();
    }, []);

    return (
        <section className="clients-section">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="clients-text style-one text-center mb-30 wow fadeInDown">
                            <p>{title}</p>
                        </div>
                    </div>
                </div>
                <Swiper {...SWIPER_CONFIG} modules={[]} className="clients-slider wow fadeInUp">
                    {brandData.map((item: StaticImageData, i: number) => (
                        <SwiperSlide key={i} className="client-item">
                            <div className="client-img">
                                <Link href="/"><Image src={item} alt="client-logo" /></Link>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    )
})

Brand.displayName = "Brand"

export default Brand
