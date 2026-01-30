import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { I18nProvider, useTranslation, isValidLanguage } from "@/contexts/I18nContext";

const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

describe("I18nContext", () => {
  beforeEach(() => {
    localStorage.clear();
    consoleWarnSpy.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("I18nProvider", () => {
    it("should provide default language context", async () => {
      const TestComponent = () => {
        const { language, t } = useTranslation();
        return (
          <div>
            <span data-testid="language">{language}</span>
            <span data-testid="translation">{t("common.loading")}</span>
          </div>
        );
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("id");
        expect(screen.getByTestId("translation")).toHaveTextContent("Memuat...");
      });
    });

    it("should load stored language from localStorage", async () => {
      localStorage.setItem("maskom-language", "en");

      const TestComponent = () => {
        const { language, t } = useTranslation();
        return (
          <div>
            <span data-testid="language">{language}</span>
            <span data-testid="translation">{t("common.loading")}</span>
          </div>
        );
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("en");
        expect(screen.getByTestId("translation")).toHaveTextContent("Loading...");
      });
    });

    it("should handle language switching", async () => {
      const TestComponent = () => {
        const { language, setLanguage, t } = useTranslation();
        return (
          <div>
            <span data-testid="language">{language}</span>
            <span data-testid="translation">{t("common.loading")}</span>
            <button onClick={() => setLanguage("en")}>Switch to English</button>
          </div>
        );
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("id");
      });

      const button = screen.getByText("Switch to English");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("en");
        expect(screen.getByTestId("translation")).toHaveTextContent("Loading...");
      });
    });

    it("should handle language toggling", async () => {
      const TestComponent = () => {
        const { language, toggleLanguage, t } = useTranslation();
        return (
          <div>
            <span data-testid="language">{language}</span>
            <span data-testid="translation">{t("common.loading")}</span>
            <button onClick={toggleLanguage}>Toggle Language</button>
          </div>
        );
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("id");
      });

      const button = screen.getByText("Toggle Language");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("en");
        expect(screen.getByTestId("translation")).toHaveTextContent("Loading...");
      });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("id");
        expect(screen.getByTestId("translation")).toHaveTextContent("Memuat...");
      });
    });

    it("should persist language choice to localStorage", async () => {
      const TestComponent = () => {
        const { setLanguage } = useTranslation();
        return <button onClick={() => setLanguage("en")}>Switch</button>;
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      const button = await screen.findByText("Switch");
      fireEvent.click(button);

      await waitFor(() => {
        expect(localStorage.getItem("maskom-language")).toBe("en");
      });
    });

    it("should handle invalid stored language", async () => {
      localStorage.setItem("maskom-language", "fr");

      const TestComponent = () => {
        const { language, t } = useTranslation();
        return (
          <div>
            <span data-testid="language">{language}</span>
            <span data-testid="translation">{t("common.loading")}</span>
          </div>
        );
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("id");
      });
    });
  });

  describe("useTranslation", () => {
    it("should throw error when used outside provider", () => {
      const TestComponent = () => {
        const { t } = useTranslation();
        return <span>{t("common.loading")}</span>;
      };

      expect(() => render(<TestComponent />)).toThrow("useTranslation must be used within a I18nProvider");
    });

    it("should translate simple keys", async () => {
      const TestComponent = () => {
        const { t } = useTranslation();
        return <span data-testid="translation">{t("common.submit")}</span>;
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("translation")).toHaveTextContent("Kirim");
      });
    });

    it("should translate nested keys", async () => {
      const TestComponent = () => {
        const { t } = useTranslation();
        return <span data-testid="translation">{t("services.title")}</span>;
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("translation")).toHaveTextContent("Layanan Kami");
      });
    });

    it("should translate form validation messages", async () => {
      const TestComponent = () => {
        const { t } = useTranslation();
        return <span data-testid="translation">{t("forms.required")}</span>;
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("translation")).toHaveTextContent("Field ini wajib diisi");
      });
    });

    it("should return key when translation not found", async () => {
      const TestComponent = () => {
        const { t } = useTranslation();
        return <span data-testid="translation">{t("missing.key")}</span>;
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("translation")).toHaveTextContent("missing.key");
        expect(consoleWarnSpy).toHaveBeenCalledWith("Translation key not found: missing.key");
      });
    });

    it("should provide language property", async () => {
      const TestComponent = () => {
        const { language } = useTranslation();
        return <span data-testid="language">{language}</span>;
      };

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("language")).toHaveTextContent("id");
      });
    });
  });

  describe("isValidLanguage", () => {
    it("should return true for valid languages", () => {
      expect(isValidLanguage("en")).toBe(true);
      expect(isValidLanguage("id")).toBe(true);
    });

    it("should return false for invalid languages", () => {
      expect(isValidLanguage("fr")).toBe(false);
      expect(isValidLanguage("es")).toBe(false);
      expect(isValidLanguage("")).toBe(false);
      expect(isValidLanguage("invalid")).toBe(false);
    });
  });
});
