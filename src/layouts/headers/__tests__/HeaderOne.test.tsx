import React from "react";
import { render, screen } from "@testing-library/react";
import HeaderOne from "../HeaderOne";

const mockUseSticky = jest.fn(() => ({ sticky: false }));
const mockUseBreakpoint = jest.fn(() => ({ isBreakpointOn: false }));

jest.mock("next/image", () => {
  return function Image({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  };
});

jest.mock("next/link", () => {
  return function Link({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) {
    return (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    );
  };
});

jest.mock("@/hooks/UseSticky", () => ({
  __esModule: true,
  default: jest.fn(() => ({ sticky: false })),
  useBreakpoint: jest.fn(() => ({ isBreakpointOn: false })),
}));

describe("HeaderOne Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSticky.mockReturnValue({ sticky: false });
    mockUseBreakpoint.mockReturnValue({ isBreakpointOn: false });
  });

  describe("Rendering", () => {
    it("renders header with default style", () => {
      render(<HeaderOne style={false} />);

      const header = document.querySelector("header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("transparent-header");
      expect(header).not.toHaveClass("navigation-white");
    });

    it("renders header with white navigation style", () => {
      render(<HeaderOne style={true} />);

      const header = document.querySelector("header");
      expect(header).toHaveClass("navigation-white");
    });

    it("renders logo image", () => {
      render(<HeaderOne style={false} />);

      const logo = document.querySelector("img");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("alt", "logo");
    });

    it("renders navigation menu", () => {
      render(<HeaderOne style={false} />);

      const navMenu = document.querySelector(".main-menu");
      expect(navMenu).toBeInTheDocument();
    });

    it("renders portal pelanggan button", () => {
      render(<HeaderOne style={false} />);

      const portalLinks = screen.getAllByText("Portal Pelanggan");
      expect(portalLinks.length).toBeGreaterThanOrEqual(1);
      expect(portalLinks[0].closest("a")).toHaveAttribute("href", "/login");
    });

    it("renders konsultasi gratis button", () => {
      render(<HeaderOne style={false} />);

      const konsultasiLinks = screen.getAllByText("Konsultasi Gratis");
      expect(konsultasiLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Sticky Behavior", () => {
    it("applies sticky class when sticky state is true", () => {
      mockUseSticky.mockReturnValue({ sticky: true });
      mockUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      render(<HeaderOne style={false} />);

      const nav = document.querySelector(".header-navigation");
      expect(nav).toHaveClass("sticky");
    });

    it("does not apply sticky class when sticky state is false", () => {
      render(<HeaderOne style={false} />);

      const nav = document.querySelector(".header-navigation");
      expect(nav).not.toHaveClass("sticky");
    });
  });

  describe("Responsive Behavior", () => {
    it("applies breakpoint-on class when isBreakpointOn is true", () => {
      mockUseSticky.mockReturnValue({ sticky: false });
      mockUseBreakpoint.mockReturnValue({ isBreakpointOn: true });

      render(<HeaderOne style={false} />);

      const nav = document.querySelector(".header-navigation");
      expect(nav).toHaveClass("breakpoint-on");
      expect(nav).toHaveClass("d-block");
      expect(nav).toHaveClass("d-xl-none");
    });

    it("does not apply breakpoint-on class when isBreakpointOn is false", () => {
      render(<HeaderOne style={false} />);

      const nav = document.querySelector(".header-navigation");
      expect(nav).not.toHaveClass("breakpoint-on");
    });
  });

  describe("Offcanvas State Management", () => {
    it("toggles navbar toggler active class based on offcanvas state", () => {
      mockUseSticky.mockReturnValue({ sticky: false });
      mockUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      const { rerender } = render(<HeaderOne style={false} />);

      let toggler = document.querySelector(".navbar-toggler");
      expect(toggler).not.toHaveClass("active");

      rerender(<HeaderOne style={false} />);
      toggler = document.querySelector(".navbar-toggler");
    });

    it("applies menu-on class to nav menu when offcanvas is open", () => {
      mockUseSticky.mockReturnValue({ sticky: false });
      mockUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      const { rerender } = render(<HeaderOne style={false} />);
      
      rerender(<HeaderOne style={true} />);
      
      const navMenu = document.querySelector(".ac-nav-menu");
      expect(navMenu).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("renders home link", () => {
      render(<HeaderOne style={false} />);

      const homeLinks = document.querySelectorAll('a[href="/"]');
      expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    });
  });
});
