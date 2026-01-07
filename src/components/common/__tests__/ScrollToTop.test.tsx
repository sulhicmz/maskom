import React from "react";
import { render, fireEvent } from "@testing-library/react";
import ScrollToTop from "../ScrollToTop";

const mockUseSticky = jest.fn(() => ({ sticky: false }));

jest.mock("@/hooks/UseSticky", () => ({
  __esModule: true,
  default: jest.fn(() => ({ sticky: false })),
}));

describe("ScrollToTop Component", () => {
  let mockScrollTo: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
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

      const button = document.getElementById("xc_back-to-top");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveClass("xc-back-to-top-btn");
    });

    it("renders back to top wrapper", () => {
      mockUseSticky.mockReturnValue({ sticky: false });

      render(<ScrollToTop />);

      const wrapper = document.querySelector(".xc-back-to-top-wrapper");
      expect(wrapper).toBeInTheDocument();
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
  });

  describe("Click Handler", () => {
    it("scrolls to top when button is clicked", () => {
      mockUseSticky.mockReturnValue({ sticky: true });

      render(<ScrollToTop />);

      const wrapper = document.querySelector(".xc-back-to-top-wrapper");
      fireEvent.click(wrapper as Element);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: "smooth",
      });
    });

    it("calls scrollTo with smooth behavior", () => {
      mockUseSticky.mockReturnValue({ sticky: true });

      render(<ScrollToTop />);

      const wrapper = document.querySelector(".xc-back-to-top-wrapper");
      fireEvent.click(wrapper as Element);

      expect(mockScrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "smooth" })
      );
    });

    it("calls scrollTo with top position 0", () => {
      mockUseSticky.mockReturnValue({ sticky: true });

      render(<ScrollToTop />);

      const wrapper = document.querySelector(".xc-back-to-top-wrapper");
      fireEvent.click(wrapper as Element);

      expect(mockScrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ top: 0 })
      );
    });
  });
});
