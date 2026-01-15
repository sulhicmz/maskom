import { render, screen } from "@testing-library/react";
import SkipToMainContent from "../SkipToMainContent";

describe("SkipToMainContent", () => {
  it("renders skip link with correct attributes", () => {
    render(<SkipToMainContent />);

    const skipLink = screen.getByRole("link", { name: /Lewati ke konten utama/i });

    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
    expect(skipLink).toHaveAttribute("aria-label", "Lewati ke konten utama");
    expect(skipLink).toHaveClass("skip-to-main-content");
  });

  it("has correct styling class", () => {
    const { container } = render(<SkipToMainContent />);

    const skipLink = container.querySelector(".skip-to-main-content");

    expect(skipLink).toBeInTheDocument();
  });

  it("allows keyboard navigation to skip link", () => {
    render(<SkipToMainContent />);

    const skipLink = screen.getByRole("link", { name: /Lewati ke konten utama/i });

    expect(skipLink).toHaveAttribute("href");
  });
});
