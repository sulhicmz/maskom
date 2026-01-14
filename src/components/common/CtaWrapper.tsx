import Image from "next/image"
import Link from "next/link"
import React from "react"
import AnimationWrapper from "@/components/common/AnimationWrapper"
import type { StaticImageData } from "next/image"

export interface CtaImage {
    src: string | StaticImageData
    alt: string
    className?: string
}

export interface CtaProps {
    heading: string
    description: string
    buttonText: string
    buttonLink: string
    images: CtaImage[]
    sectionClassName?: string
    contentClassName?: string
    imageBoxClassName?: string
    backgroundImage?: string
    animation?: "fadeInDown" | "fadeInUp" | "fadeInLeft" | "fadeInRight" | "none"
    animationType?: 'wow' | 'animation-wrapper'
    shapes?: boolean
    paddingBottom?: string
    extraElements?: React.ReactNode
    id?: string
}

const CtaWrapper = React.memo<CtaProps>(({
    heading,
    description,
    buttonText,
    buttonLink,
    images,
    sectionClassName = "cta-section",
    contentClassName = "cta-one_content-box",
    imageBoxClassName = "cta-one_image-box p-r z-1 text-xl-end",
    backgroundImage,
    animation = "fadeInLeft",
    animationType = "animation-wrapper",
    shapes = false,
    paddingBottom,
    extraElements,
    id
}) => {
    const ContentRenderer = animationType === 'animation-wrapper'
        ? ({ children }: { children: React.ReactNode }) => (
            <AnimationWrapper animation={animation} className={contentClassName} id={id}>
                {children}
            </AnimationWrapper>
        )
        : ({ children }: { children: React.ReactNode }) => (
            <div id={id} className={`${contentClassName} wow ${animation}`}>
                {children}
            </div>
        )

    const contentWrapper = (
        <ContentRenderer>
            <h2>{heading}</h2>
            <p>{description}</p>
            <Link href={buttonLink} className="theme-btn gradient-btn">{buttonText}</Link>
        </ContentRenderer>
    )

    const ImageRenderer = animationType === 'animation-wrapper'
        ? ({ className }: { className?: string }) => (
            <div className={className}>
                {images.map((img, index) => (
                    <Image
                        key={index}
                        src={img.src}
                        alt={img.alt}
                        className={img.className || `image-${index + 1}`}
                    />
                ))}
            </div>
        )
        : ({ className }: { className?: string }) => (
            <div className={`${className} wow fadeInRight`}>
                {images.map((img, index) => (
                    <Image
                        key={index}
                        src={img.src}
                        alt={img.alt}
                    />
                ))}
            </div>
        )

    const imageWrapper = (
        <ImageRenderer className={imageBoxClassName} />
    )

    return (
        <section className={`${sectionClassName} ${paddingBottom || ''}`}>
            {backgroundImage ? (
                <div
                    className="cta-bg-wrapper-two black-dark-bg bg_cover"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                >
                    {shapes && (
                        <>
                            <div className="shape shape-one"><span className="circle"></span></div>
                            <div className="shape shape-two"><span className="circle"></span></div>
                        </>
                    )}
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                {contentWrapper}
                            </div>
                            <div className="col-lg-6">
                                {imageWrapper}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container">
                    <div className="cta-wrapper_one">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                {contentWrapper}
                            </div>
                            <div className="col-lg-6">
                                {imageWrapper}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {extraElements}
        </section>
    )
})

CtaWrapper.displayName = "CtaWrapper"

export default CtaWrapper