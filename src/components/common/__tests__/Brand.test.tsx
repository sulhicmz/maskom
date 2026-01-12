import "@testing-library/jest-dom";

// Mock next/image module before importing
jest.mock("next/image", () => ({
    __esModule: true,
    default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <img src={src} alt={alt} {...props} />
    )
}));

// Mock next/link
jest.mock("next/link", () => {
    return function Link({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
        return <a href={href} {...props}>{children}</a>;
    };
});

// Mock dynamic imports for Swiper
jest.mock("swiper/react", () => ({
    Swiper: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div className={className} data-swiper>
            {children}
        </div>
    ),
    SwiperSlide: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div className={className}>{children}</div>
    )
}));

import Brand from "../Brand";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

describe("Brand Component", () => {
    const mockBrandData = [
        { src: "/brand1.png", height: 100, width: 200, blurDataURL: "data:image/png;base64,abc" },
        { src: "/brand2.png", height: 100, width: 200, blurDataURL: "data:image/png;base64,def" },
        { src: "/brand3.png", height: 100, width: 200, blurDataURL: "data:image/png;base64,ghi" }
    ];

    const mockTitle = "Dipercaya oleh perusahaan lintas industri";

    beforeEach(() => {
        // Reset document head before each test
        document.head.innerHTML = "";
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe("rendering", () => {
        it("should render brand section container", () => {
            render(<Brand brandData={mockBrandData} title={mockTitle} />);
            const section = document.querySelector(".clients-section");
            expect(section).toBeTruthy();
        });

        it("should render container with row and col layout", () => {
            render(<Brand brandData={mockBrandData} title={mockTitle} />);
            const container = screen.queryByText(mockTitle)?.closest(".container");
            expect(container).toBeTruthy();
            expect(container?.querySelector(".row")).toBeTruthy();
        });

        it("should render section title", () => {
            render(<Brand brandData={mockBrandData} title={mockTitle} />);
            const title = screen.getByText(mockTitle);
            expect(title).toBeInTheDocument();
            expect(title.tagName.toLowerCase()).toBe("p");
        });

        it("should render Swiper carousel", () => {
            render(<Brand brandData={mockBrandData} title={mockTitle} />);
            const swiper = document.querySelector("[data-swiper]");
            expect(swiper).toBeInTheDocument();
        });

        it("should wrap each brand image in a Link", () => {
            render(<Brand brandData={mockBrandData} title={mockTitle} />);
            const links = document.querySelectorAll("a[href='/']");
            expect(links.length).toBeGreaterThan(0);
            links.forEach((link) => {
                expect(link.querySelector("img")).toBeTruthy();
            });
        });

        it("should render client-item div for each brand", () => {
            render(<Brand brandData={mockBrandData} title={mockTitle} />);
            const clientItems = document.querySelectorAll(".client-item");
            expect(clientItems.length).toBeGreaterThan(0);
        });

        it("should render client-img div around each image", () => {
            render(<Brand brandData={mockBrandData} title={mockTitle} />);
            const clientImgDivs = document.querySelectorAll(".client-img");
            expect(clientImgDivs.length).toBeGreaterThan(0);
        });
    });

    describe("accessibility", () => {
        it("should provide accessible alt text for images", () => {
            render(<Brand brandData={mockBrandData} title={mockTitle} />);
            const links = document.querySelectorAll("a[href='/']");
            links.forEach((link, index) => {
                const img = link.querySelector("img") as HTMLImageElement;
                expect(img?.alt).toBe(`Logo partner bisnis ${index + 1}`);
            });
        });

        it("should provide aria-label on links", () => {
            render(<Brand brandData={mockBrandData} title={mockTitle} />);
            const links = document.querySelectorAll("a[href='/']");
            links.forEach((link, index) => {
                expect(link.getAttribute("aria-label")).toBe(
                    `Kunjungi website partner ${index + 1}`
                );
            });
        });
    });

    describe("component features", () => {
        it("should apply React.memo optimization", () => {
            expect(Brand.displayName).toBe("Brand");
        });

        it("should have correct animation classes", () => {
            render(<Brand brandData={mockBrandData} title={mockTitle} />);
            const title = screen.getByText(mockTitle).closest(".clients-text");
            expect(title).toHaveClass("wow", "fadeInDown");
            
            const swiper = document.querySelector("[data-swiper]");
            expect(swiper).toHaveClass("wow", "fadeInUp");
        });
    });

    describe("edge cases", () => {
        it("should handle empty brand data array", () => {
            render(<Brand brandData={[]} title={mockTitle} />);
            const section = document.querySelector(".clients-section");
            expect(section).toBeTruthy();
            const images = Array.from(document.querySelectorAll("img"));
            expect(images.length).toBe(0);
        });

        it("should handle single brand item", () => {
            const singleBrand = [mockBrandData[0]];
            render(<Brand brandData={singleBrand} title={mockTitle} />);
            const links = document.querySelectorAll("a[href='/']");
            expect(links.length).toBe(1);
        });

        it("should handle large number of brand items", () => {
            const largeBrandData = Array.from({ length: 50 }, (_, i) => ({
                src: `/brand${i}.png`,
                height: 100,
                width: 200,
                blurDataURL: "data:image/png;base64,abc"
            }));
            render(<Brand brandData={largeBrandData} title={mockTitle} />);
            const links = document.querySelectorAll("a[href='/']");
            expect(links.length).toBe(50);
        });

        it("should handle empty title string", () => {
            render(<Brand brandData={mockBrandData} title="" />);
            const clientsText = document.querySelector(".clients-text");
            expect(clientsText).toBeInTheDocument();
        });
    });

    describe("integration", () => {
        it("should work with different brand data sources", () => {
            const alternateBrandData = [
                { src: "/alt1.png", height: 150, width: 300, blurDataURL: "data:image/png;base64,xyz" },
                { src: "/alt2.png", height: 150, width: 300, blurDataURL: "data:image/png;base64,uvw" }
            ];
            render(<Brand brandData={alternateBrandData} title="Alternate Title" />);
            const links = document.querySelectorAll("a[href='/']");
            expect(links.length).toBe(2);
            expect(screen.getByText("Alternate Title")).toBeInTheDocument();
        });

        it("should work with different title content", () => {
            const longTitle = "This is a very long title that tests if the component can handle extended text content without breaking the layout";
            render(<Brand brandData={mockBrandData} title={longTitle} />);
            expect(screen.getByText(longTitle)).toBeInTheDocument();
        });
    });
});
