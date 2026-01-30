import React from "react";
import { render, fireEvent } from "@testing-library/react";
import ScrollToTop from "../ScrollToTop";

jest.mock("@/hooks/UseSticky", () => ({
  __esModule: true,
  default: jest.fn(() => ({ sticky: false })),
}));

describe("ScrollToTop Component", () => {
  let mockScrollTo: jest.SpyInstance;
  const mockUseSticky = jest.mocked(require("@/hooks/UseSticky").default);

  beforeEach(() => {
    jest.clearAllMocks();
    mockScrollTo = jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    mockUseSticky.mockReturnValue({ sticky: false });
  });

  afterEach(() => {
    mockScrollTo.mockRestore();
  });

  describe("Rendering", () => {
    it("renders back to top button", () => {
      mockUseSticky.mockReturnValue({ sticky: false });

      render(<ScrollToTop />);

      const button = document.querySelector(".xc-back-to-top-btn");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "button");
    });

    it("renders back to top button with aria-label", () => {
      mockUseSticky.mockReturnValue({ sticky: false });

      render(<ScrollToTop />);

      const button = document.querySelector(".xc-back-to-top-btn");
      expect(button).toHaveAttribute("aria-label", "Kembali ke atas halaman");
    });

    it("renders back to top progress element", () => {
      mockUseSticky.mockReturnValue({ sticky: false });

      render(<ScrollToTop />);

      const progress = document.querySelector(".xc-back-to-top-progress");
      expect(progress).toBeInTheDocument();
    });

    it("renders icon element", () => {
      mockUseSticky.mockReturnValue({ sticky: false });

      render(<ScrollToTop />);

      const icon = document.querySelector(".fa-angle-down");
      expect(icon).toBeInTheDocument();
    });

    it("hides button when not sticky", () => {
      mockUseSticky.mockReturnValue({ sticky: false });

      render(<ScrollToTop />);

      const button = document.querySelector(".xc-back-to-top-btn");
      expect(button).not.toHaveClass("xc-back-to-top-btn-show");
    });

    it("shows button when sticky", () => {
      mockUseSticky.mockReturnValue({ sticky: true });

      render(<ScrollToTop />);

      const button = document.querySelector(".xc-back-to-top-btn");
      expect(button?.className).toContain("xc-back-to-top-btn-show");
    });
  });

  describe("Click Handler", () => {
    it("scrolls to top when button is clicked", () => {
      mockUseSticky.mockReturnValue({ sticky: true });

      render(<ScrollToTop />);

      const button = document.querySelector(".xc-back-to-top-btn");
      fireEvent.click(button as Element);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: "smooth",
      });
    });

    it("calls scrollTo with smooth behavior", () => {
      mockUseSticky.mockReturnValue({ sticky: true });

      render(<ScrollToTop />);

      const button = document.querySelector(".xc-back-to-top-btn");
      fireEvent.click(button as Element);

      expect(mockScrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "smooth" })
      );
    });

    it("calls scrollTo with top position 0", () => {
      mockUseSticky.mockReturnValue({ sticky: true });

      render(<ScrollToTop />);

      const button = document.querySelector(".xc-back-to-top-btn");
      fireEvent.click(button as Element);

      expect(mockScrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ top: 0 })
      );
    });
  });
});
