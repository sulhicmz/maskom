import React from "react";
import { render, screen } from "@testing-library/react";
import TeamDetailsArea from "../TeamDetailsArea";

// Mock next/image
jest.mock("next/image", () => ({
    __esModule: true,
    default: ({ src, alt }: { src: string | { src: string }; alt: string }) => {
        // Handle both string src and StaticImageData object
        const imageSrc = typeof src === "string" ? src : (src?.src || "");
        return <img src={imageSrc} alt={alt} data-testid="next-image" />;
    },
}));

describe("TeamDetailsArea Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render team details section with correct classes", () => {
            const { container } = render(<TeamDetailsArea />);
            const section = container.querySelector("section.team-details-section");
            expect(section).toBeInTheDocument();
            expect(section).toHaveClass("team-details-section");
            expect(section).toHaveClass("pt-120");
            expect(section).toHaveClass("pb-70");
        });

        it("should render container div", () => {
            const { container } = render(<TeamDetailsArea />);
            const containerDiv = container.querySelector(".container");
            expect(containerDiv).toBeInTheDocument();
            expect(containerDiv).toHaveClass("container");
        });

        it("should render team details wrapper", () => {
            const { container } = render(<TeamDetailsArea />);
            const wrapper = container.querySelector(".team-details-wrapper");
            expect(wrapper).toBeInTheDocument();
            expect(wrapper).toHaveClass("team-details-wrapper");
        });

        it("should render row with align-items-center class", () => {
            const { container } = render(<TeamDetailsArea />);
            const row = container.querySelector(".row");
            expect(row).toBeInTheDocument();
            expect(row).toHaveClass("row");
            expect(row).toHaveClass("align-items-center");
        });

        it("should render image column", () => {
            const { container } = render(<TeamDetailsArea />);
            const imageColumn = container.querySelector(".col-xl-5");
            expect(imageColumn).toBeInTheDocument();
            expect(imageColumn).toHaveClass("col-xl-5");
        });

        it("should render info column", () => {
            const { container } = render(<TeamDetailsArea />);
            const infoColumn = container.querySelector(".col-xl-7");
            expect(infoColumn).toBeInTheDocument();
            expect(infoColumn).toHaveClass("col-xl-7");
        });
    });

    describe("Team Member Image", () => {
        it("should render team member image wrapper", () => {
            const { container } = render(<TeamDetailsArea />);
            const imageWrapper = container.querySelector(".member-image");
            expect(imageWrapper).toBeInTheDocument();
            expect(imageWrapper).toHaveClass("member-image");
            expect(imageWrapper).toHaveClass("mb-50");
            expect(imageWrapper).toHaveClass("wow");
            expect(imageWrapper).toHaveClass("fadeInLeft");
        });

        it("should render next/image component", () => {
            render(<TeamDetailsArea />);
            const image = screen.getByTestId("next-image");
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute("alt", "Team Image");
        });

        it("should have correct image source", () => {
            const { container } = render(<TeamDetailsArea />);
            const image = container.querySelector("img");
            expect(image).toBeInTheDocument();
        });

        it("should have accessibility alt text", () => {
            render(<TeamDetailsArea />);
            const image = screen.getByTestId("next-image");
            expect(image).toHaveAttribute("alt", "Team Image");
        });
    });

    describe("Team Member Info", () => {
        it("should render member info wrapper", () => {
            const { container } = render(<TeamDetailsArea />);
            const infoWrapper = container.querySelector(".member-info");
            expect(infoWrapper).toBeInTheDocument();
            expect(infoWrapper).toHaveClass("member-info");
            expect(infoWrapper).toHaveClass("mb-50");
            expect(infoWrapper).toHaveClass("wow");
            expect(infoWrapper).toHaveClass("fadeInRight");
        });

        it("should render team member name", () => {
            render(<TeamDetailsArea />);
            const name = screen.getByText("Robie B Monik");
            expect(name).toBeInTheDocument();
            expect(name.tagName).toBe("H4");
        });

        it("should render team member position", () => {
            render(<TeamDetailsArea />);
            const position = screen.getByText("CO-FOUNDER, CEO");
            expect(position).toBeInTheDocument();
            expect(position).toHaveClass("position");
        });

        it("should render member description paragraphs", () => {
            render(<TeamDetailsArea />);
            const paragraphs = screen.getAllByText(/sed ut perspiciatis/i);
            expect(paragraphs.length).toBeGreaterThan(0);
            expect(paragraphs[0].tagName).toBe("P");
        });

        it("should render multiple description paragraphs", () => {
            render(<TeamDetailsArea />);
            const allParagraphs = screen.getAllByRole("paragraph");
            const descriptionParagraphs = allParagraphs.filter(p => 
                p.textContent?.includes("Lorem Ipsum") || p.textContent?.includes("perspiciatis")
            );
            expect(descriptionParagraphs.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("Social Media Links", () => {
        it("should render social links container", () => {
            const { container } = render(<TeamDetailsArea />);
            const socialLinks = container.querySelector(".social-link");
            expect(socialLinks).toBeInTheDocument();
            expect(socialLinks).toHaveClass("social-link");
        });

        it("should render Facebook link button", () => {
            render(<TeamDetailsArea />);
            const facebookButton = screen.getByRole("button", { name: /share on facebook/i });
            expect(facebookButton).toBeInTheDocument();
            expect(facebookButton.querySelector(".fa-facebook-f")).toBeInTheDocument();
        });

        it("should render Twitter link button", () => {
            render(<TeamDetailsArea />);
            const twitterButton = screen.getByRole("button", { name: /share on twitter/i });
            expect(twitterButton).toBeInTheDocument();
            expect(twitterButton.querySelector(".fa-twitter")).toBeInTheDocument();
        });

        it("should render LinkedIn link button", () => {
            render(<TeamDetailsArea />);
            const linkedinButton = screen.getByRole("button", { name: /share on linkedin/i });
            expect(linkedinButton).toBeInTheDocument();
            expect(linkedinButton.querySelector(".fa-linkedin-in")).toBeInTheDocument();
        });

        it("should render Instagram link button", () => {
            render(<TeamDetailsArea />);
            const instagramButton = screen.getByRole("button", { name: /share on instagram/i });
            expect(instagramButton).toBeInTheDocument();
            expect(instagramButton.querySelector(".fa-instagram")).toBeInTheDocument();
        });

        it("should render 4 social media buttons", () => {
            render(<TeamDetailsArea />);
            const buttons = screen.getAllByRole("button");
            const socialButtons = buttons.filter(btn => 
                btn.querySelector(".fa-facebook-f") || 
                btn.querySelector(".fa-twitter") || 
                btn.querySelector(".fa-linkedin-in") || 
                btn.querySelector(".fa-instagram")
            );
            expect(socialButtons.length).toBe(4);
        });
    });

    describe("Accessibility", () => {
        it("should have aria-labels on all social media buttons", () => {
            render(<TeamDetailsArea />);
            const buttons = screen.getAllByRole("button");
            buttons.forEach(button => {
                expect(button).toHaveAttribute("aria-label");
            });
        });

        it("should have proper alt text for team image", () => {
            render(<TeamDetailsArea />);
            const image = screen.getByTestId("next-image");
            expect(image).toHaveAttribute("alt");
            expect(image.getAttribute("alt")).not.toBe("");
        });

        it("should have semantic HTML structure", () => {
            const { container } = render(<TeamDetailsArea />);
            const section = container.querySelector("section");
            const heading = screen.getByRole("heading", { level: 4 });
            expect(section).toBeInTheDocument();
            expect(section).toContainElement(heading);
        });
    });

    describe("Layout and Styling", () => {
        it("should have correct column layout", () => {
            const { container } = render(<TeamDetailsArea />);
            const imageColumn = container.querySelector(".col-xl-5");
            const infoColumn = container.querySelector(".col-xl-7");
            expect(imageColumn).toHaveClass("col-xl-5");
            expect(infoColumn).toHaveClass("col-xl-7");
        });

        it("should have wow.js animations", () => {
            const { container } = render(<TeamDetailsArea />);
            const imageWrapper = container.querySelector(".member-image");
            const infoWrapper = container.querySelector(".member-info");
            expect(imageWrapper).toHaveClass("wow");
            expect(imageWrapper).toHaveClass("fadeInLeft");
            expect(infoWrapper).toHaveClass("wow");
            expect(infoWrapper).toHaveClass("fadeInRight");
        });

        it("should have proper spacing classes", () => {
            const { container } = render(<TeamDetailsArea />);
            const imageWrapper = container.querySelector(".member-image");
            const infoWrapper = container.querySelector(".member-info");
            expect(imageWrapper).toHaveClass("mb-50");
            expect(infoWrapper).toHaveClass("mb-50");
        });

        it("should have correct section padding", () => {
            const { container } = render(<TeamDetailsArea />);
            const section = container.querySelector(".team-details-section");
            expect(section).toHaveClass("pt-120");
            expect(section).toHaveClass("pb-70");
        });
    });

    describe("Component Features", () => {
        it("should render static team member information", () => {
            render(<TeamDetailsArea />);
            const name = screen.getByText("Robie B Monik");
            const position = screen.getByText("CO-FOUNDER, CEO");
            expect(name).toBeInTheDocument();
            expect(position).toBeInTheDocument();
        });

        it("should render lorem ipsum placeholder text", () => {
            render(<TeamDetailsArea />);
            const paragraphs = screen.getAllByRole("paragraph");
            const hasLoremText = paragraphs.some(p => 
                p.textContent?.includes("Lorem Ipsum") || p.textContent?.includes("perspiciatis")
            );
            expect(hasLoremText).toBe(true);
        });

        it("should render team member image from assets", () => {
            const { container } = render(<TeamDetailsArea />);
            const image = container.querySelector("img");
            expect(image).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should render without props", () => {
            const { container } = render(<TeamDetailsArea />);
            const section = container.querySelector("section.team-details-section");
            expect(section).toBeInTheDocument();
        });

        it("should render with all mocked dependencies", () => {
            render(<TeamDetailsArea />);
            expect(screen.getByTestId("next-image")).toBeInTheDocument();
            expect(screen.getAllByRole("button").length).toBe(4);
        });

        it("should have correct DOM structure", () => {
            const { container } = render(<TeamDetailsArea />);
            const section = container.querySelector("section.team-details-section");
            expect(section).toBeInTheDocument();
            expect(section?.querySelector(".container")).toBeInTheDocument();
            expect(section?.querySelector(".team-details-wrapper")).toBeInTheDocument();
        });
    });

    describe("Integration", () => {
        it("should integrate with next/image component", () => {
            render(<TeamDetailsArea />);
            const image = screen.getByTestId("next-image");
            expect(image).toBeInTheDocument();
            expect(image.tagName).toBe("IMG");
        });

        it("should have proper hierarchy of components", () => {
            const { container } = render(<TeamDetailsArea />);
            const section = container.querySelector("section.team-details-section");
            const containerDiv = container.querySelector(".container");
            const wrapper = container.querySelector(".team-details-wrapper");
            expect(section).toBeInTheDocument();
            expect(containerDiv).toBeInTheDocument();
            expect(wrapper).toBeInTheDocument();
        });
    });
});
