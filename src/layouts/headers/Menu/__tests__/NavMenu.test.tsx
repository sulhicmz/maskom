import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NavMenu from "../NavMenu";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("NavMenu Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering Menu Items", () => {
    it("renders all menu items from MenuData", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<NavMenu />);

      const menuItems = [
        "Beranda",
        "Solusi",
        "Pendekatan",
        "Harga",
        "Testimoni",
        "Perusahaan",
        "Kontak",
      ];

      menuItems.forEach((item) => {
        const menuLinks = screen.getAllByText(item);
        expect(menuLinks.length).toBeGreaterThan(0);
      });
    });

    it("renders submenu items for dropdown menus", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<NavMenu />);

      expect(screen.getByText("Tentang Kami")).toBeInTheDocument();
      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.getByText("Portal Pelanggan")).toBeInTheDocument();
      expect(screen.getByText("Daftar Layanan")).toBeInTheDocument();
    });
  });

  describe("Active Route Detection", () => {
    it("highlights menu item when on exact route", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<NavMenu />);

      const homeLink = screen.getByText("Beranda").closest("a");
      expect(homeLink).toHaveClass("active");
    });

    it("highlights menu item when on route with hash", () => {
      (usePathname as jest.Mock).mockReturnValue("/contact");

      render(<NavMenu />);

      const contactLinks = screen.getAllByText("Kontak");
      const contactLink = contactLinks
        .map(link => link.closest("a"))
        .find(anchor => anchor?.getAttribute("href") === "/contact");
      expect(contactLink).toHaveClass("active");
    });

    it("highlights submenu item when on submenu route", () => {
      (usePathname as jest.Mock).mockReturnValue("/about");

      render(<NavMenu />);

      const aboutLink = screen.getByText("Tentang Kami").closest("a");
      expect(aboutLink).toHaveClass("active");
    });

    it("does not highlight menu item when on different route", () => {
      (usePathname as jest.Mock).mockReturnValue("/about");

      render(<NavMenu />);

      const homeLink = screen.getByText("Beranda").closest("a");
      expect(homeLink).not.toHaveClass("active");
    });

    it("highlights parent menu when on submenu route", () => {
      (usePathname as jest.Mock).mockReturnValue("/about");

      render(<NavMenu />);

      const perusahaanLink = screen.getByText("Perusahaan").closest("a");
      expect(perusahaanLink).toHaveClass("active");
    });
  });

  describe("Submenu Toggle Functionality", () => {
    it("shows dropdown trigger for dropdown menu items", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<NavMenu />);

      const perusahaanText = screen.getByText("Perusahaan");
      const perusahaanLi = perusahaanText.closest("li");
      const dropdownTrigger = perusahaanLi?.querySelector(".dd-trigger");

      expect(dropdownTrigger).toBeInTheDocument();
    });

    it("does not show dropdown trigger for non-dropdown menu items", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<NavMenu />);

      const homeText = screen.getByText("Beranda");
      const homeLi = homeText.closest("li");
      const dropdownTrigger = homeLi?.querySelector(".dd-trigger");

      expect(dropdownTrigger).not.toBeInTheDocument();
    });

    it("toggles submenu when dropdown trigger is clicked", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<NavMenu />);

      const perusahaanText = screen.getByText("Perusahaan");
      const perusahaanLi = perusahaanText.closest("li");
      const dropdownTrigger = perusahaanLi?.querySelector(".dd-trigger");

      expect(perusahaanLi).not.toHaveClass("submenu-open");

      fireEvent.click(dropdownTrigger as Element);

      expect(perusahaanLi).toHaveClass("submenu-open");
    });
  });

  describe("Submenu Display", () => {
    it("starts with submenu hidden", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<NavMenu />);

      const perusahaanLi = screen.getByText("Perusahaan").closest("li");

      expect(perusahaanLi).not.toHaveClass("submenu-open");
    });

    it("shows submenu after click and hides after second click", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<NavMenu />);

      const perusahaanText = screen.getByText("Perusahaan");
      const perusahaanLi = perusahaanText.closest("li");
      const dropdownTrigger = perusahaanLi?.querySelector(".dd-trigger");

      fireEvent.click(dropdownTrigger as Element);
      expect(perusahaanLi).toHaveClass("submenu-open");

      fireEvent.click(dropdownTrigger as Element);
      expect(perusahaanLi).not.toHaveClass("submenu-open");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty submenu gracefully", () => {
      (usePathname as jest.Mock).mockReturnValue("/");

      render(<NavMenu />);

      expect(screen.getByText("Beranda")).toBeInTheDocument();
    });

    it("handles route with trailing slash", () => {
      (usePathname as jest.Mock).mockReturnValue("/contact/");

      render(<NavMenu />);

      const contactLinks = screen.getAllByText("Kontak");
      const contactLink = contactLinks
        .map(link => link.closest("a"))
        .find(anchor => anchor?.getAttribute("href") === "/contact");
      expect(contactLink).not.toHaveClass("active");
    });

    it("handles unknown route", () => {
      (usePathname as jest.Mock).mockReturnValue("/unknown-route");

      render(<NavMenu />);

      expect(screen.getByText("Beranda")).toBeInTheDocument();
      const contactLinks = screen.getAllByText("Kontak");
      expect(contactLinks.length).toBeGreaterThan(0);
    });
  });
});
