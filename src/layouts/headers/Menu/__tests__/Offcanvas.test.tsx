import React from "react";
import { render, screen } from "@testing-library/react";
import Offcanvas from "../Offcanvas";
import menu_data from "@/data/MenuData";
import { socialLinks } from "@/data/SocialMediaData";
import { PHONE_DISPLAY } from "@/data/ContactData";

describe("Offcanvas Component", () => {
  describe("Rendering Tests", () => {
    it("renders offcanvas container with correct attributes", () => {
      const { container } = render(<Offcanvas />);

      const offcanvas = container.querySelector(".offcanvas");
      expect(offcanvas).toBeInTheDocument();
      expect(offcanvas).toHaveClass("offcanvas");
      expect(offcanvas).toHaveClass("offcanvas-end");
      expect(offcanvas).toHaveClass("sidebar-nav");
      expect(offcanvas).toHaveAttribute("tabIndex", "-1");
      expect(offcanvas).toHaveAttribute("id", "sideNav");
      expect(offcanvas).toHaveAttribute("aria-labelledby", "staticBackdropLabel");
    });

    it("renders offcanvas header with logo", () => {
      render(<Offcanvas />);

      const logoLink = screen.getByRole("link", { name: /ke halaman utama/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute("href", "/");
      expect(logoLink).toHaveAttribute("data-bs-dismiss", "offcanvas");
      expect(logoLink).toHaveAttribute("aria-label", "Ke halaman utama");

      const logoImage = logoLink.querySelector("img");
      expect(logoImage).toBeInTheDocument();
      expect(logoImage).toHaveAttribute("alt", "Maskom - Logo Utama");
    });

    it("renders close button with correct attributes", () => {
      render(<Offcanvas />);

      const closeButton = screen.getByRole("button", { name: /close/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass("btn-close");
      expect(closeButton).toHaveAttribute("type", "button");
      expect(closeButton).toHaveAttribute("data-bs-dismiss", "offcanvas");
      expect(closeButton).toHaveAttribute("aria-label", "Close");
    });

    it("renders all menu items from MenuData", () => {
      render(<Offcanvas />);

      menu_data.forEach((menu) => {
        const menuLinks = screen.getAllByText(menu.title);
        expect(menuLinks.length).toBeGreaterThan(0);
      });
    });

    it("renders submenu items for dropdown menus", () => {
      render(<Offcanvas />);

      const dropdownMenus = menu_data.filter((menu) => menu.has_dropdown);
      dropdownMenus.forEach((menu) => {
        if (menu.sub_menus) {
          menu.sub_menus.forEach((submenu) => {
            const submenuLink = screen.getByText(submenu.title);
            expect(submenuLink).toBeInTheDocument();
          });
        }
      });
    });

    it("renders 'Hubungi Kami' contact button", () => {
      render(<Offcanvas />);

      const contactButton = screen.getByRole("link", { name: /hubungi kami/i });
      expect(contactButton).toBeInTheDocument();
      expect(contactButton).toHaveClass("btn-five");
      expect(contactButton).toHaveAttribute("href", "/contact");
      expect(contactButton).toHaveAttribute("data-bs-dismiss", "offcanvas");
    });

    it("renders address block with company name and location", () => {
      render(<Offcanvas />);

      expect(screen.getByText("Maskom Network")).toBeInTheDocument();
      expect(screen.getByText(/Jakarta Selatan/i)).toBeInTheDocument();
      expect(screen.getByText(/DKI Jakarta/)).toBeInTheDocument();
      expect(screen.getByText(/Indonesia/)).toBeInTheDocument();
    });

    it("renders phone number with correct link", () => {
      render(<Offcanvas />);

      const phoneText = screen.getByText(/Telepon:/i);
      expect(phoneText).toBeInTheDocument();

      const phoneLink = screen.getByRole("link", { name: PHONE_DISPLAY });
      expect(phoneLink).toBeInTheDocument();
      const expectedPhoneHref = `tel:${PHONE_DISPLAY.replace(/[^0-9+]/g, "")}`;
      expect(phoneLink).toHaveAttribute("href", expectedPhoneHref);
    });

    it("renders all social media links from SocialMediaData", () => {
      render(<Offcanvas />);

      socialLinks.forEach((link) => {
        const socialLink = screen.getByRole("link", { name: link.ariaLabel });
        expect(socialLink).toBeInTheDocument();
        expect(socialLink).toHaveAttribute("href", link.url);

        const icon = socialLink.querySelector("i");
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("class", link.iconClass);

        if (link.target === "_blank") {
          expect(socialLink).toHaveAttribute("target", "_blank");
          expect(socialLink).toHaveAttribute("rel", "noreferrer");
        } else {
          expect(socialLink).not.toHaveAttribute("target");
        }
      });
    });
  });

  describe("Accessibility Tests", () => {
    it("has proper ARIA attributes on offcanvas", () => {
      const { container } = render(<Offcanvas />);

      const offcanvas = container.querySelector(".offcanvas");
      expect(offcanvas).toBeInTheDocument();
      expect(offcanvas).toHaveAttribute("id", "sideNav");
      expect(offcanvas).toHaveAttribute("tabIndex", "-1");
      expect(offcanvas).toHaveAttribute("aria-labelledby", "staticBackdropLabel");
    });

    it("logo link has descriptive aria-label", () => {
      render(<Offcanvas />);

      const logoLink = screen.getByRole("link", { name: /ke halaman utama/i });
      expect(logoLink).toHaveAttribute("aria-label", "Ke halaman utama");
    });

    it("close button has proper aria-label", () => {
      render(<Offcanvas />);

      const closeButton = screen.getByRole("button", { name: /close/i });
      expect(closeButton).toHaveAttribute("aria-label", "Close");
    });

    it("all menu links are keyboard accessible via tab", () => {
      render(<Offcanvas />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toBeVisible();
      });
    });

    it("social media links have descriptive aria-labels", () => {
      render(<Offcanvas />);

      socialLinks.forEach((link) => {
        const socialLink = screen.getByRole("link", { name: link.ariaLabel });
        expect(socialLink).toHaveAttribute("aria-label", link.ariaLabel);
      });
    });

    it("external social links have proper rel attributes", () => {
      render(<Offcanvas />);

      const externalLinks = socialLinks.filter((link) => link.target === "_blank");
      externalLinks.forEach((link) => {
        const socialLink = screen.getByRole("link", { name: link.ariaLabel });
        expect(socialLink).toHaveAttribute("rel", "noreferrer");
      });
    });
  });

  describe("Link Validation Tests", () => {
    it("all menu links have correct href attributes", () => {
      render(<Offcanvas />);

      menu_data.forEach((menu) => {
        const menuLinks = screen.getAllByText(menu.title);
        const matchingLinks = menuLinks.filter(link =>
          link.closest("a")?.getAttribute("href") === menu.link
        );
        expect(matchingLinks.length).toBeGreaterThan(0);
      });
    });

    it("all menu links have data-bs-dismiss attribute", () => {
      render(<Offcanvas />);

      menu_data.forEach((menu) => {
        const menuLinks = screen.getAllByText(menu.title);
        menuLinks.forEach(link => {
          const anchor = link.closest("a");
          if (anchor?.getAttribute("href") === menu.link) {
            expect(anchor).toHaveAttribute("data-bs-dismiss", "offcanvas");
          }
        });
      });
    });

    it("submenu links have correct href attributes", () => {
      render(<Offcanvas />);

      const dropdownMenus = menu_data.filter((menu) => menu.has_dropdown);
      dropdownMenus.forEach((menu) => {
        if (menu.sub_menus) {
          menu.sub_menus.forEach((submenu) => {
            const submenuLink = screen.getByText(submenu.title);
            expect(submenuLink.closest("a")).toHaveAttribute("href", submenu.link);
          });
        }
      });
    });

    it("submenu links have data-bs-dismiss attribute", () => {
      render(<Offcanvas />);

      const dropdownMenus = menu_data.filter((menu) => menu.has_dropdown);
      dropdownMenus.forEach((menu) => {
        if (menu.sub_menus) {
          menu.sub_menus.forEach((submenu) => {
            const submenuLink = screen.getByText(submenu.title);
            expect(submenuLink.closest("a")).toHaveAttribute("data-bs-dismiss", "offcanvas");
          });
        }
      });
    });

    it("contact button has correct link and dismiss attribute", () => {
      render(<Offcanvas />);

      const contactButton = screen.getByRole("link", { name: /hubungi kami/i });
      expect(contactButton).toHaveAttribute("href", "/contact");
      expect(contactButton).toHaveAttribute("data-bs-dismiss", "offcanvas");
    });

    it("social media links have correct href and target attributes", () => {
      render(<Offcanvas />);

      socialLinks.forEach((link) => {
        const socialLink = screen.getByRole("link", { name: link.ariaLabel });
        expect(socialLink).toHaveAttribute("href", link.url);
        if (link.target) {
          expect(socialLink).toHaveAttribute("target", link.target);
        } else {
          expect(socialLink).not.toHaveAttribute("target");
        }
      });
    });
  });

  describe("Data Integration Tests", () => {
    it("integrates with MenuData correctly", () => {
      render(<Offcanvas />);

      const renderedMenuItems = screen.getAllByRole("listitem").filter((li) => {
        const link = li.querySelector("a");
        return link && !li.classList.contains("style-none");
      });

      const expectedMenuCount = menu_data.length;
      expect(renderedMenuItems.length).toBeGreaterThanOrEqual(expectedMenuCount);
    });

    it("integrates with SocialMediaData correctly", () => {
      render(<Offcanvas />);

      socialLinks.forEach((link) => {
        const socialLink = screen.getByRole("link", { name: link.ariaLabel });
        expect(socialLink).toBeInTheDocument();
      });
    });

    it("integrates with ContactData PHONE_DISPLAY correctly", () => {
      render(<Offcanvas />);

      const phoneLink = screen.getByRole("link", { name: PHONE_DISPLAY });
      expect(phoneLink).toBeInTheDocument();
    });

    it("uses consistent data from single source of truth", () => {
      render(<Offcanvas />);

      menu_data.forEach((menu) => {
        const menuLinks = screen.getAllByText(menu.title);
        expect(menuLinks.length).toBeGreaterThan(0);
      });

      socialLinks.forEach((link) => {
        expect(screen.getByRole("link", { name: link.ariaLabel })).toBeInTheDocument();
      });

      expect(screen.getByText(PHONE_DISPLAY)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles menu items without dropdowns", () => {
      render(<Offcanvas />);

      const nonDropdownMenus = menu_data.filter((menu) => !menu.has_dropdown);
      nonDropdownMenus.forEach((menu) => {
        const menuLinks = screen.getAllByText(menu.title);
        expect(menuLinks.length).toBeGreaterThan(0);
      });
    });

    it("handles dropdown menus correctly", () => {
      render(<Offcanvas />);

      const dropdownMenus = menu_data.filter((menu) => menu.has_dropdown);
      expect(dropdownMenus.length).toBeGreaterThan(0);

      dropdownMenus.forEach((menu) => {
        const menuLinks = screen.getAllByText(menu.title);
        expect(menuLinks.length).toBeGreaterThan(0);

        if (menu.sub_menus) {
          menu.sub_menus.forEach((submenu) => {
            const submenuLink = screen.getByText(submenu.title);
            expect(submenuLink).toBeInTheDocument();
          });
        }
      });
    });

    it("handles empty submenu arrays gracefully", () => {
      render(<Offcanvas />);

      const menusWithEmptySubmenus = menu_data.filter(
        (menu) => menu.has_dropdown && (!menu.sub_menus || menu.sub_menus.length === 0)
      );

      if (menusWithEmptySubmenus.length > 0) {
        menusWithEmptySubmenus.forEach((menu) => {
          const menuLink = screen.getByText(menu.title);
          expect(menuLink).toBeInTheDocument();
        });
      }
    });

    it("handles special characters in phone number", () => {
      render(<Offcanvas />);

      const phoneLink = screen.getByRole("link", { name: PHONE_DISPLAY });
      const expectedHref = `tel:${PHONE_DISPLAY.replace(/[^0-9+]/g, "")}`;
      expect(phoneLink).toHaveAttribute("href", expectedHref);
    });

    it("handles multiple social media links", () => {
      render(<Offcanvas />);

      expect(socialLinks.length).toBeGreaterThan(0);

      socialLinks.forEach((link) => {
        const socialLink = screen.getByRole("link", { name: link.ariaLabel });
        expect(socialLink).toBeInTheDocument();
      });
    });
  });

  describe("Semantic HTML Tests", () => {
    it("uses proper HTML structure for offcanvas", () => {
      const { container } = render(<Offcanvas />);

      const offcanvas = container.querySelector(".offcanvas");
      expect(offcanvas).toBeInTheDocument();
      expect(offcanvas?.tagName).toBe("DIV");
    });

    it("uses proper list structure for menu items", () => {
      render(<Offcanvas />);

      const listItems = screen.getAllByRole("listitem");
      expect(listItems.length).toBeGreaterThan(0);
    });

    it("uses proper heading for address block", () => {
      render(<Offcanvas />);

      const addressTitle = screen.getByText("Maskom Network");
      expect(addressTitle.tagName).toBe("H4");
    });

    it("uses proper button element for close button", () => {
      render(<Offcanvas />);

      const closeButton = screen.getByRole("button", { name: /close/i });
      expect(closeButton.tagName).toBe("BUTTON");
    });
  });
});
