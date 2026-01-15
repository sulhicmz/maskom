import { render } from "@testing-library/react";
import Skeleton from "../Skeleton";

describe("Skeleton", () => {
  it("renders text skeleton by default", () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("skeleton-text");
    expect(skeleton).toHaveClass("skeleton-pulse");
  });

  it("renders circular variant", () => {
    const { container } = render(<Skeleton variant="circular" width={40} height={40} />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveClass("skeleton-circular");
  });

  it("renders rectangular variant", () => {
    const { container } = render(<Skeleton variant="rectangular" width={200} height={100} />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveClass("skeleton-rectangular");
  });

  it("renders rounded variant", () => {
    const { container } = render(<Skeleton variant="rounded" />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveClass("skeleton-rounded");
  });

  it("applies custom width and height", () => {
    const { container } = render(<Skeleton width={150} height={50} />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveStyle({
      width: "150px",
      height: "50px"
    });
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveClass("custom-class");
  });

  it("renders multiple skeletons with count prop", () => {
    const { container } = render(<Skeleton count={3} />);

    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons).toHaveLength(3);
  });

  it("applies pulse animation by default", () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveClass("skeleton-pulse");
  });

  it("applies wave animation when specified", () => {
    const { container } = render(<Skeleton animation="wave" />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveClass("skeleton-wave");
    expect(skeleton).not.toHaveClass("skeleton-pulse");
  });

  it("applies no animation when specified", () => {
    const { container } = render(<Skeleton animation="none" />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveClass("skeleton-no-animation");
    expect(skeleton).not.toHaveClass("skeleton-pulse");
  });

  it("has proper ARIA attributes for accessibility", () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveAttribute("role", "presentation");
  });
});
