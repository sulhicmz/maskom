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

const ContentRendererWithAnimation = (animation: "fadeInDown" | "fadeInUp" | "fadeInLeft" | "fadeInRight" | "none" | undefined, contentClassName: string | undefined, id: string | undefined) => {
    const Component = animation !== undefined ? AnimationWrapper : 'div';

    return Component === AnimationWrapper
        ? ({ children }: { children: React.ReactNode }) => (
            <AnimationWrapper animation={animation || "none"} className={contentClassName} id={id}>
                {children}
            </AnimationWrapper>
        )
        : ({ children }: { children: React.ReactNode }) => (
            <div id={id} className={`${contentClassName} wow ${animation || ''}`}>
                {children}
            </div>
        );
};

const ImageRendererWithAnimation = (animation: "fadeInDown" | "fadeInUp" | "fadeInLeft" | "fadeInRight" | "none" | undefined, className: string | undefined) => {
    return ({ className }: { className?: string }) => (
        <div className={className}>
            {(className || '').match(/image-(\d+)/g)?.map((match, index) => {
                const num = parseInt(match.replace('image-', ''));
                return (
                    <Image
                        key={index}
                        src={className?.match(/image-(\d+)/g)?.[1]?.split(' ')[0] || ''}
                        alt={`image ${num}`}
                        className={className}
                    />
                );
            })}
        </div>
    );
};

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
    shapes = false,
    paddingBottom,
    extraElements,
    id
}) => {
    const ContentRenderer = ContentRendererWithAnimation(animation, contentClassName, id);
    const ImageRenderer = ImageRendererWithAnimation(animation, imageBoxClassName);

    const contentWrapper = (
        <ContentRenderer>
            <h2>{heading}</h2>
            <p>{description}</p>
            <Link href={buttonLink} className="theme-btn gradient-btn">{buttonText}</Link>
        </ContentRenderer>
    )

    const imageWrapper = (
        <ImageRenderer />
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