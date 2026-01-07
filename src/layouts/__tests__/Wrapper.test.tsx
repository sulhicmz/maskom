import React from "react";
import { render, screen } from "@testing-library/react";
import Wrapper from "../Wrapper";

jest.mock("react-toastify", () => {
  const MockToastContainer = function MockToastContainer() {
    return <div data-testid="toast-container" />;
  };
  return {
    ToastContainer: MockToastContainer,
  };
});

describe("Wrapper Component", () => {
  describe("Rendering", () => {
    it("renders children prop", () => {
      render(
        <Wrapper>
          <div data-testid="child-content">Test Content</div>
        </Wrapper>
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("renders ScrollToTop component", () => {
      render(<Wrapper><></></Wrapper>);

      const scrollButton = document.getElementById("xc_back-to-top");
      expect(scrollButton).toBeInTheDocument();
    });

    it("renders ToastContainer component", () => {
      render(<Wrapper><></></Wrapper>);

      expect(screen.getByTestId("toast-container")).toBeInTheDocument();
    });

    it("renders all components together", () => {
      render(
        <Wrapper>
          <div data-testid="child-content">Test Content</div>
        </Wrapper>
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      const scrollButton = document.getElementById("xc_back-to-top");
      expect(scrollButton).toBeInTheDocument();
      expect(screen.getByTestId("toast-container")).toBeInTheDocument();
    });
  });

  describe("Multiple Children", () => {
    it("renders multiple children", () => {
      render(
        <Wrapper>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </Wrapper>
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByTestId("child-3")).toBeInTheDocument();
    });
  });
});
