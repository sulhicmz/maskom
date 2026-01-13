import "@testing-library/jest-dom"

// Mock next/image module before importing
jest.mock("next/image", () => ({
    __esModule: true,
    default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <img src={src} alt={alt} {...props} />
    )
}))

// Mock next/link
jest.mock("next/link", () => {
    return function Link({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
        return <a href={href} {...props}>{children}</a>;
    };
})

import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "@jest/globals"
import React from "react"
import CtaWrapper from "../CtaWrapper"

const defaultProps = {
    heading: "Test Heading",
    description: "Test description text",
    buttonText: "Get Started",
    buttonLink: "/test-link",
    images: [
        { src: "/test-image-1.jpg", alt: "Test Image 1" },
        { src: "/test-image-2.jpg", alt: "Test Image 2" }
    ]
}

describe("CtaWrapper Component", () => {
    describe("Rendering", () => {
        it("should render with default props", () => {
            render(<CtaWrapper {...defaultProps} />)

            expect(screen.getByText("Test Heading")).toBeInTheDocument()
            expect(screen.getByText("Test description text")).toBeInTheDocument()
            expect(screen.getByText("Get Started")).toBeInTheDocument()
        })

        it("should render all required content", () => {
            render(<CtaWrapper {...defaultProps} />)

            const heading = screen.getByRole("heading", { level: 2 })
            expect(heading).toBeInTheDocument()
            expect(heading).toHaveTextContent("Test Heading")

            const button = screen.getByRole("link")
            expect(button).toBeInTheDocument()
            expect(button).toHaveAttribute("href", "/test-link")
            expect(button).toHaveTextContent("Get Started")
        })

        it("should render with AnimationWrapper when animationType is 'animation-wrapper'", () => {
            render(<CtaWrapper {...defaultProps} animationType="animation-wrapper" />)

            const heading = screen.getByRole("heading", { level: 2 })
            expect(heading).toBeInTheDocument()
            expect(heading).toHaveTextContent("Test Heading")
        })

        it("should render with wow.js when animationType is 'wow'", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} animationType="wow" />
            )

            const contentDiv = container.querySelector(".cta-one_content-box")
            expect(contentDiv).toHaveClass("wow")
        })

        it("should render background image when provided", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} backgroundImage="/bg-test.jpg" />
            )

            const bgWrapper = container.querySelector(".cta-bg-wrapper-two")
            expect(bgWrapper).toBeInTheDocument()
            expect(bgWrapper).toHaveStyle({ backgroundImage: "url(/bg-test.jpg)" })
        })

        it("should render shapes when both backgroundImage and shapes are true", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} backgroundImage="/bg-test.jpg" shapes={true} />
            )

            const shapes = container.querySelectorAll(".shape")
            expect(shapes).toHaveLength(2)
        })

        it("should render custom className props", () => {
            const { container } = render(
                <CtaWrapper
                    {...defaultProps}
                    sectionClassName="custom-section"
                    contentClassName="custom-content"
                    imageBoxClassName="custom-image-box"
                />
            )

            expect(container.querySelector(".custom-section")).toBeInTheDocument()
            expect(container.querySelector(".custom-content")).toBeInTheDocument()
            expect(container.querySelector(".custom-image-box")).toBeInTheDocument()
        })

        it("should render id attribute", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} id="test-id" />
            )

            const elementWithId = container.querySelector("#test-id")
            expect(elementWithId).toBeInTheDocument()
        })
    })

    describe("Image Rendering", () => {
        it("should render multiple images correctly", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} />
            )

            const images = container.querySelectorAll("img")
            expect(images).toHaveLength(2)
            expect(images[0]).toHaveAttribute("alt", "Test Image 1")
            expect(images[1]).toHaveAttribute("alt", "Test Image 2")
        })

        it("should apply custom className to image", () => {
            const { container } = render(
                <CtaWrapper
                    {...defaultProps}
                    images={[{ src: "/test.jpg", alt: "Test", className: "custom-img" }]}
                />
            )

            const image = container.querySelector(".custom-img")
            expect(image).toBeInTheDocument()
        })

        it("should apply default className to image when not provided", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} images={[{ src: "/test.jpg", alt: "Test" }]}
                animationType="animation-wrapper"
                imageBoxClassName="test-box"
                />
            )

            const image = container.querySelector(".image-1")
            expect(image).toBeInTheDocument()
        })
    })

    describe("Feature Tests", () => {
        it("should apply custom paddingBottom", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} paddingBottom="pt-100" />
            )

            const section = container.querySelector(".cta-section")
            expect(section).toHaveClass("pt-100")
        })

        it("should render extraElements when provided", () => {
            render(
                <CtaWrapper
                    {...defaultProps}
                    extraElements={<div data-testid="extra">Extra Content</div>}
                />
            )

            expect(screen.getByTestId("extra")).toBeInTheDocument()
            expect(screen.getByText("Extra Content")).toBeInTheDocument()
        })

        it("should handle animation prop correctly", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} animation="fadeInRight" animationType="wow" />
            )

            const contentDiv = container.querySelector(".cta-one_content-box")
            expect(contentDiv).toHaveClass("fadeInRight")
        })

        it("should handle 'none' animation value", () => {
            render(<CtaWrapper {...defaultProps} animation="none" animationType="animation-wrapper" />)
            expect(screen.getByText("Test Heading")).toBeInTheDocument()
        })
    })

    describe("Edge Cases", () => {
        it("should render with minimal required props only", () => {
            render(<CtaWrapper {...defaultProps} />)

            expect(screen.getByText("Test Heading")).toBeInTheDocument()
            expect(screen.getByRole("link")).toBeInTheDocument()
        })

        it("should handle empty images array", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} images={[]} />
            )

            const images = container.querySelectorAll("img")
            expect(images).toHaveLength(0)
        })

        it("should handle single image", () => {
            const { container } = render(
                <CtaWrapper
                    {...defaultProps}
                    images={[{ src: "/test.jpg", alt: "Single Image" }]}
                />
            )

            const images = container.querySelectorAll("img")
            expect(images).toHaveLength(1)
            expect(images[0]).toHaveAttribute("alt", "Single Image")
        })

        it("should handle large heading text", () => {
            const longHeading = "A ".repeat(100) + "Heading"
            render(<CtaWrapper {...defaultProps} heading={longHeading} />)

            expect(screen.getByText(longHeading)).toBeInTheDocument()
        })

        it("should handle large description text", () => {
            const longDescription = "A ".repeat(100) + "Long Description"
            render(<CtaWrapper {...defaultProps} description={longDescription} />)

            const descriptionElement = screen.getByText((content) => content.includes("Long Description"))
            expect(descriptionElement).toBeInTheDocument()
        })

        it("should not render shapes when shapes is false (default)", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} backgroundImage="/bg.jpg" />
            )

            const shapes = container.querySelectorAll(".shape")
            expect(shapes).toHaveLength(0)
        })

        it("should not render background when backgroundImage is not provided", () => {
            const { container } = render(<CtaWrapper {...defaultProps} />)

            const bgWrapper = container.querySelector(".cta-bg-wrapper-two")
            expect(bgWrapper).not.toBeInTheDocument()
        })
    })

    describe("Component Structure", () => {
        it("should render with correct DOM hierarchy", () => {
            const { container } = render(<CtaWrapper {...defaultProps} />)

            expect(container.querySelector("section")).toBeInTheDocument()
            expect(container.querySelector(".container")).toBeInTheDocument()
            expect(container.querySelector(".row")).toBeInTheDocument()
        })

        it("should render two column layout", () => {
            const { container } = render(<CtaWrapper {...defaultProps} />)

            const cols = container.querySelectorAll(".col-lg-6")
            expect(cols).toHaveLength(2)
        })

        it("should render content in first column and images in second column", () => {
            const { container } = render(<CtaWrapper {...defaultProps} />)

            const cols = container.querySelectorAll(".col-lg-6")
            const firstCol = cols[0]
            const secondCol = cols[1]

            expect(firstCol).toContainElement(screen.getByText("Test Heading"))
            expect(secondCol).toContainElement(container.querySelector("img"))
        })
    })

    describe("Animation Types", () => {
        it("should accept fadeInDown animation", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} animation="fadeInDown" animationType="wow" />
            )

            const contentDiv = container.querySelector(".cta-one_content-box")
            expect(contentDiv).toHaveClass("fadeInDown")
        })

        it("should accept fadeInUp animation", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} animation="fadeInUp" animationType="wow" />
            )

            const contentDiv = container.querySelector(".cta-one_content-box")
            expect(contentDiv).toHaveClass("fadeInUp")
        })

        it("should accept fadeInLeft animation", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} animation="fadeInLeft" animationType="wow" />
            )

            const contentDiv = container.querySelector(".cta-one_content-box")
            expect(contentDiv).toHaveClass("fadeInLeft")
        })

        it("should accept fadeInRight animation", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} animation="fadeInRight" animationType="wow" />
            )

            const contentDiv = container.querySelector(".cta-one_content-box")
            expect(contentDiv).toHaveClass("fadeInRight")
        })

        it("should accept none animation", () => {
            const { container } = render(
                <CtaWrapper {...defaultProps} animation="none" animationType="wow" />
            )

            const contentDiv = container.querySelector(".cta-one_content-box")
            expect(contentDiv).toHaveClass("none")
        })
    })
})
