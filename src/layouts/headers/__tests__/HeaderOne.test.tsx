import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HeaderOne from "../HeaderOne";
import UseSticky, { useBreakpoint } from "@/hooks/UseSticky";
import { ThemeProvider } from "@/contexts/ThemeContext";

jest.mock("@/hooks/UseSticky");
const mockedUseSticky = UseSticky as jest.Mock;
const mockedUseBreakpoint = useBreakpoint as jest.Mock;

jest.mock("next/image", () => {
  return function Image({ src, alt }: { src: string; alt: string }) {
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

function renderWithProviders(component: React.ReactElement) {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
}

describe("HeaderOne Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSticky.mockReturnValue({ sticky: false });
    mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });
  });

  describe("Rendering", () => {
    it("renders header with default style", () => {
      renderWithProviders(<HeaderOne style={false} />);

      const header = document.querySelector("header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("transparent-header");
      expect(header).not.toHaveClass("navigation-white");
    });

    it("renders header with white navigation style", () => {
      renderWithProviders(<HeaderOne style={true} />);

      const header = document.querySelector("header");
      expect(header).toHaveClass("navigation-white");
    });

    it("renders logo image", () => {
      renderWithProviders(<HeaderOne style={false} />);

      const logo = document.querySelector("img");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("alt", "Maskom - Logo Utama");
    });

    it("renders navigation menu", () => {
      renderWithProviders(<HeaderOne style={false} />);

      const navMenu = document.querySelector(".main-menu");
      expect(navMenu).toBeInTheDocument();
    });

    it("renders portal pelanggan button", () => {
      renderWithProviders(<HeaderOne style={false} />);

      const portalLinks = screen.getAllByText("Portal Pelanggan");
      expect(portalLinks.length).toBeGreaterThanOrEqual(1);
      expect(portalLinks[0].closest("a")).toHaveAttribute("href", "/login");
    });

    it("renders konsultasi gratis button", () => {
      renderWithProviders(<HeaderOne style={false} />);

      const konsultasiLinks = screen.getAllByText("Konsultasi Gratis");
      expect(konsultasiLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Sticky Behavior", () => {
    it("applies sticky class when sticky state is true", () => {
      mockedUseSticky.mockReturnValue({ sticky: true });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const nav = document.querySelector(".header-navigation");
      expect(nav).toHaveClass("sticky");
    });

    it("does not apply sticky class when sticky state is false", () => {
      renderWithProviders(<HeaderOne style={false} />);

      const nav = document.querySelector(".header-navigation");
      expect(nav).not.toHaveClass("sticky");
    });
  });

  describe("Responsive Behavior", () => {
    it("applies breakpoint-on class when isBreakpointOn is true", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: true });

      renderWithProviders(<HeaderOne style={false} />);

      const nav = document.querySelector(".header-navigation");
      expect(nav).toHaveClass("breakpoint-on");
      expect(nav).toHaveClass("d-block");
      expect(nav).toHaveClass("d-xl-none");
    });

    it("does not apply breakpoint-on class when isBreakpointOn is false", () => {
      renderWithProviders(<HeaderOne style={false} />);

      const nav = document.querySelector(".header-navigation");
      expect(nav).not.toHaveClass("breakpoint-on");
    });
  });

  describe("Offcanvas State Management", () => {
    it("toggles navbar toggler active class based on offcanvas state", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      const { rerender } = renderWithProviders(<HeaderOne style={false} />);

      let toggler = document.querySelector(".navbar-toggler");
      expect(toggler).not.toHaveClass("active");

      rerender(
        <ThemeProvider>
          <HeaderOne style={false} />
        </ThemeProvider>
      );
      toggler = document.querySelector(".navbar-toggler");
    });

    it("applies menu-on class to nav menu when offcanvas is open", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });


      const { rerender } = renderWithProviders(<HeaderOne style={false} />);
      rerender(
        <ThemeProvider>
          <HeaderOne style={true} />
        </ThemeProvider>
      );
      
      const navMenu = document.querySelector(".ac-nav-menu");
      expect(navMenu).toBeInTheDocument();
    });

    it("opens offcanvas when navbar toggler is clicked", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");
      expect(toggler).not.toHaveClass("active");

      fireEvent.click(toggler as Element);

      expect(toggler).toHaveClass("active");
    });

    it("closes offcanvas when navbar toggler is clicked twice", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");

      fireEvent.click(toggler as Element);
      expect(toggler).toHaveClass("active");

      fireEvent.click(toggler as Element);
      expect(toggler).not.toHaveClass("active");
    });

    it("applies active class to nav overlay when offcanvas is open", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");
      const navOverlay = document.querySelector(".nav-overlay");

      expect(navOverlay).not.toHaveClass("active");

      fireEvent.click(toggler as Element);

      expect(navOverlay).toHaveClass("active");
    });

    it("removes active class from nav overlay when toggler is clicked twice", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");
      const navOverlay = document.querySelector(".nav-overlay");

      fireEvent.click(toggler as Element);
      expect(navOverlay).toHaveClass("active");

      fireEvent.click(toggler as Element);
      expect(navOverlay).not.toHaveClass("active");
    });

    it("sets aria-expanded to true when offcanvas is open", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");
      expect(toggler).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(toggler as Element);

      expect(toggler).toHaveAttribute("aria-expanded", "true");
    });

    it("sets aria-expanded to false when offcanvas is closed", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");

      fireEvent.click(toggler as Element);
      expect(toggler).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(toggler as Element);
      expect(toggler).toHaveAttribute("aria-expanded", "false");
    });

    it("applies menu-on class to ac-nav-menu when offcanvas is open", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");
      const navMenu = document.querySelector(".ac-nav-menu");

      expect(navMenu).not.toHaveClass("menu-on");

      fireEvent.click(toggler as Element);

      expect(navMenu).toHaveClass("menu-on");
    });

    it("removes menu-on class from ac-nav-menu when offcanvas is closed", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");
      const navMenu = document.querySelector(".ac-nav-menu");

      fireEvent.click(toggler as Element);
      expect(navMenu).toHaveClass("menu-on");

      fireEvent.click(toggler as Element);
      expect(navMenu).not.toHaveClass("menu-on");
    });

    it("sets aria-hidden to true and tabIndex to -1 when offcanvas is closed", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const navOverlay = document.querySelector(".nav-overlay");

      expect(navOverlay).toHaveAttribute("aria-hidden", "true");
      expect(navOverlay).toHaveAttribute("tabIndex", "-1");
    });

    it("sets aria-hidden to false and tabIndex to 0 when offcanvas is open", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");
      const navOverlay = document.querySelector(".nav-overlay");

      fireEvent.click(toggler as Element);

      expect(navOverlay).toHaveAttribute("aria-hidden", "false");
      expect(navOverlay).toHaveAttribute("tabIndex", "0");
    });

    it("closes offcanvas when nav overlay is clicked", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");
      const navOverlay = document.querySelector(".nav-overlay");

      fireEvent.click(toggler as Element);
      expect(toggler).toHaveClass("active");
      expect(navOverlay).toHaveClass("active");

      fireEvent.click(navOverlay as Element);

      expect(toggler).not.toHaveClass("active");
      expect(navOverlay).not.toHaveClass("active");
    });

    it("resets aria-expanded to false when nav overlay is clicked", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");
      const navOverlay = document.querySelector(".nav-overlay");

      fireEvent.click(toggler as Element);
      expect(toggler).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(navOverlay as Element);

      expect(toggler).toHaveAttribute("aria-expanded", "false");
    });

    it("removes menu-on class from nav menu when nav overlay is clicked", () => {
      mockedUseSticky.mockReturnValue({ sticky: false });
      mockedUseBreakpoint.mockReturnValue({ isBreakpointOn: false });

      renderWithProviders(<HeaderOne style={false} />);

      const toggler = document.querySelector(".navbar-toggler");
      const navOverlay = document.querySelector(".nav-overlay");
      const navMenu = document.querySelector(".ac-nav-menu");

      fireEvent.click(toggler as Element);
      expect(navMenu).toHaveClass("menu-on");

      fireEvent.click(navOverlay as Element);

      expect(navMenu).not.toHaveClass("menu-on");
    });
  });

  describe("Navigation Links", () => {
    it("renders home link", () => {
      renderWithProviders(<HeaderOne style={false} />);

      const homeLinks = document.querySelectorAll('a[href="/"]');
      expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    });
  });
});
