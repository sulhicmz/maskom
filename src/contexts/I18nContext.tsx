"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "en" | "id";

interface I18nContextType {
  language: Language;
  t: (key: string) => string;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "maskom-language";
const DEFAULT_LANGUAGE: Language = "id";

interface Translations {
  [key: string]: string | Translations;
}

async function loadTranslations(language: Language): Promise<Translations> {
  if (typeof window === "undefined") return {};
  try {
    const response = await import(`@/locales/${language}.json`);
    return response.default;
  } catch (error) {
    console.error(`Failed to load translations for language: ${language}`, error);
    return {};
  }
}

function getNestedValue(obj: Translations, path: string): string {
  return path.split(".").reduce<unknown>((current, key) => {
    if (typeof current === "object" && current !== null && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return path;
  }, obj) as string;
}

function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "en" || stored === "id" ? stored : null;
  } catch {
    return null;
  }
}

function setStoredLanguage(language: Language): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const stored = getStoredLanguage();
    const initialLanguage = stored || DEFAULT_LANGUAGE;

    setLanguageState(initialLanguage);

    loadTranslations(initialLanguage).then((loadedTranslations) => {
      setTranslations(loadedTranslations);
    });
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    setStoredLanguage(newLanguage);
    const loadedTranslations = await loadTranslations(newLanguage);
    setTranslations(loadedTranslations);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  const t = (key: string): string => {
    const value = getNestedValue(translations, key);
    if (value === key) {
      console.warn(`Translation key not found: ${key}`);
    }
    return value;
  };

  return (
    <I18nContext.Provider value={{ language, t, setLanguage, toggleLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a I18nProvider");
  }
  return context;
}

export function isValidLanguage(value: string): value is Language {
  return value === "en" || value === "id";
}
