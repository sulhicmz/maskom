export const SWIPER_CONFIG = {
    slidesPerView: 6,
    loop: true,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    pagination: false,
    navigation: false,
    breakpoints: {
        '1400': {
            slidesPerView: 6,
        },
        '1200': {
            slidesPerView: 5,
        },
        '768': {
            slidesPerView: 4,
        },
        '576': {
            slidesPerView: 3,
        },
        '0': {
            slidesPerView: 2,
        },
    },
} as const;

export type SwiperBreakpoints = typeof SWIPER_CONFIG.breakpoints;
