import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

const ThrowError = () => {
    throw new Error("Test error");
};

const ChildComponent = () => <div>Child Component</div>;

describe("ErrorBoundary", () => {
    describe("normal rendering", () => {
        it("renders children when no error occurs", () => {
            render(
                <ErrorBoundary>
                    <ChildComponent />
                </ErrorBoundary>
            );

            expect(screen.getByText("Child Component")).toBeInTheDocument();
        });

        it("renders multiple children when no error occurs", () => {
            render(
                <ErrorBoundary>
                    <div>First Child</div>
                    <div>Second Child</div>
                    <div>Third Child</div>
                </ErrorBoundary>
            );

            expect(screen.getByText("First Child")).toBeInTheDocument();
            expect(screen.getByText("Second Child")).toBeInTheDocument();
            expect(screen.getByText("Third Child")).toBeInTheDocument();
        });
    });

    describe("error handling", () => {
        beforeEach(() => {
            jest.spyOn(console, "error").mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("catches errors and displays fallback UI", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Terjadi Kesalahan")).toBeInTheDocument();
            expect(screen.getByText(/terjadi kesalahan tak terduga/i)).toBeInTheDocument();
        });

        it("displays error code with error ID", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            const errorCode = screen.getByText(/ERR-/);
            expect(errorCode).toBeInTheDocument();
            expect(errorCode.textContent).toMatch(/^ERR-[A-Z0-9]+-[A-Z0-9]+$/);
        });

        it("logs error with error ID", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("[ErrorBoundary]"),
                expect.stringContaining("ERR-"),
                expect.objectContaining({
                    message: expect.any(String),
                    stack: expect.any(String),
                    componentStack: expect.any(String)
                })
            );
        });

        it("does not render children when error occurs", () => {
            render(
                <ErrorBoundary>
                    <div>Should not appear</div>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
        });
    });

    describe("error recovery", () => {
        let reloadMock: jest.Mock;
        let originalLocation: Location | any;

        beforeEach(() => {
            jest.spyOn(console, "error").mockImplementation(() => {});
            reloadMock = jest.fn();
            originalLocation = window.location;
            (window as any).location = { reload: reloadMock };
        });

        afterEach(() => {
            (window as any).location = originalLocation;
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("displays recovery buttons in fallback UI", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByRole("button", { name: /muat ulang halaman/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /coba ulang tindakan yang gagal/i })).toBeInTheDocument();
        });

        it("reloads page when Muat Ulang button clicked", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            const reloadButton = screen.getByRole("button", { name: /muat ulang halaman/i });
            expect(reloadButton).toBeInTheDocument();

            fireEvent.click(reloadButton);

            expect(reloadButton).toBeInTheDocument();
        });

        it("resets error state and re-renders children when Coba Lagi clicked", () => {
            const TestComponent = () => (
                <div>
                    <ErrorBoundary>
                        <ChildComponent />
                    </ErrorBoundary>
                </div>
            );

            const { rerender } = render(<TestComponent />);

            expect(screen.getByText("Child Component")).toBeInTheDocument();

            rerender(
                <div>
                    <ErrorBoundary>
                        <ThrowError />
                    </ErrorBoundary>
                </div>
            );

            expect(screen.queryByText("Child Component")).not.toBeInTheDocument();
            expect(screen.getByText("Terjadi Kesalahan")).toBeInTheDocument();

            const resetButton = screen.getByRole("button", { name: /coba ulang tindakan yang gagal/i });
            fireEvent.click(resetButton);

            rerender(<TestComponent />);

            expect(screen.getByText("Child Component")).toBeInTheDocument();
        });

        it("displays contact link in fallback UI", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            const contactLink = screen.getByText(/hubungi kami/i);
            expect(contactLink).toBeInTheDocument();
            expect(contactLink.closest("a")).toHaveAttribute("href", "/contact");
        });
    });

    describe("custom fallback", () => {
        beforeEach(() => {
            jest.spyOn(console, "error").mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("renders custom fallback when provided", () => {
            const customFallback = <div>Custom Error Fallback</div>;

            render(
                <ErrorBoundary fallback={customFallback}>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Custom Error Fallback")).toBeInTheDocument();
            expect(screen.queryByText("Terjadi Kesalahan")).not.toBeInTheDocument();
        });

        it("does not use default fallback UI when custom fallback provided", () => {
            const customFallback = <div>No Default UI</div>;

            render(
                <ErrorBoundary fallback={customFallback}>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("No Default UI")).toBeInTheDocument();
            expect(screen.queryByText("Muat Ulang Halaman")).not.toBeInTheDocument();
            expect(screen.queryByText("Coba Lagi")).not.toBeInTheDocument();
        });
    });

    describe("error ID generation", () => {
        beforeEach(() => {
            jest.spyOn(console, "error").mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("generates unique error IDs for multiple errors", () => {
            const { unmount } = render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            const firstErrorId = screen.getByText(/ERR-/).textContent;

            unmount();

            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            const secondErrorId = screen.getByText(/ERR-/).textContent;

            expect(firstErrorId).not.toBe(secondErrorId);
        });

        it("error ID format is correct", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            const errorCode = screen.getByText(/ERR-/).textContent;

            expect(errorCode).toMatch(/^ERR-[A-Z0-9]{5,9}-[A-Z0-9]{6}$/);
        });
    });

    describe("edge cases", () => {
        beforeEach(() => {
            jest.spyOn(console, "error").mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("handles null children", () => {
            const { container } = render(
                <ErrorBoundary>
                    {null}
                </ErrorBoundary>
            );

            expect(container).toBeEmptyDOMElement();
        });

        it("handles undefined children", () => {
            const { container } = render(
                <ErrorBoundary>
                    {undefined}
                </ErrorBoundary>
            );

            expect(container).toBeEmptyDOMElement();
        });

        it("handles empty fragment children", () => {
            const { container } = render(
                <ErrorBoundary>
                    <></>
                </ErrorBoundary>
            );

            expect(container).toBeEmptyDOMElement();
        });

        it("handles multiple errors thrown sequentially", () => {
            const { rerender } = render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Terjadi Kesalahan")).toBeInTheDocument();

            rerender(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Terjadi Kesalahan")).toBeInTheDocument();
        });
    });

    describe("accessibility", () => {
        beforeEach(() => {
            jest.spyOn(console, "error").mockImplementation(() => {});
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("has proper heading hierarchy in fallback UI", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            const heading = screen.getByRole("heading", { level: 1 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent("Terjadi Kesalahan");
        });

        it("has button roles for interactive elements", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getAllByRole("button")).toHaveLength(2);
        });
    });
});
