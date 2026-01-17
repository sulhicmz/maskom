import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { I18nProvider } from "@/contexts/I18nContext";
import { LanguageSwitcher, LanguageSwitcherProps } from "@/components/common/i18n/LanguageSwitcher";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderWithI18n = (props: LanguageSwitcherProps = {}) => {
    return render(
      <I18nProvider>
        <LanguageSwitcher {...props} />
      </I18nProvider>
    );
  };

  describe("default variant", () => {
    it("should render with default variant", async () => {
      renderWithI18n({ variant: "default" });

      const button = await screen.findByText("Indonesia");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-label", "Switch to English");
    });

    it("should display English label when language is English", async () => {
      localStorage.setItem("maskom-language", "en");

      renderWithI18n({ variant: "default" });

      const button = await screen.findByText("English");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-label", "Switch to Indonesian");
    });

    it("should toggle language on click", async () => {
      renderWithI18n({ variant: "default" });

      const button = await screen.findByText("Indonesia");
      fireEvent.click(button);

      await waitFor(() => {
        const newButton = screen.getByText("English");
        expect(newButton).toBeInTheDocument();
        expect(newButton).toHaveAttribute("aria-label", "Switch to Indonesian");
      });
    });
  });

  describe("minimal variant", () => {
    it("should render with minimal variant", async () => {
      renderWithI18n({ variant: "minimal" });

      const button = await screen.findByText("ID");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("text-sm", "font-medium", "hover:text-blue-500", "transition-colors");
    });

    it("should display EN when language is English", async () => {
      localStorage.setItem("maskom-language", "en");

      renderWithI18n({ variant: "minimal" });

      const button = await screen.findByText("EN");
      expect(button).toBeInTheDocument();
    });
  });

  describe("icon variant", () => {
    it("should render with icon variant", async () => {
      renderWithI18n({ variant: "icon" });

      const button = await screen.findByText("ID");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("w-10", "h-10", "flex", "items-center", "justify-center", "rounded-full");
    });
  });

  describe("custom className", () => {
    it("should apply custom className", async () => {
      renderWithI18n({ className: "custom-class another-class" });

      const button = await screen.findByText("Indonesia");
      expect(button).toHaveClass("custom-class", "another-class");
    });
  });

  describe("accessibility", () => {
    it("should have proper ARIA labels", async () => {
      renderWithI18n();

      const button = await screen.findByText("Indonesia");
      expect(button).toHaveAttribute("aria-label", "Switch to English");
    });

    it("should update ARIA labels when language changes", async () => {
      renderWithI18n();

      const button = await screen.findByText("Indonesia");
      fireEvent.click(button);

      await waitFor(() => {
        const newButton = screen.getByText("English");
        expect(newButton).toHaveAttribute("aria-label", "Switch to Indonesian");
      });
    });
  });

  describe("additional props", () => {
    it("should pass additional button attributes", async () => {
      renderWithI18n({ id: "test-language-switcher", "data-testid": "language-switcher" });

      const button = await screen.findByTestId("language-switcher");
      expect(button).toHaveAttribute("id", "test-language-switcher");
    });
  });
});
