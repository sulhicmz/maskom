"use client";

import { useTranslation } from "@/contexts/I18nContext";
import { ButtonHTMLAttributes } from "react";

export interface LanguageSwitcherProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "minimal" | "icon";
  className?: string;
}

export function LanguageSwitcher({ variant = "default", className = "", ...props }: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useTranslation();

  const getButtonStyles = () => {
    switch (variant) {
      case "minimal":
        return "text-sm font-medium hover:text-blue-500 transition-colors";
      case "icon":
        return "w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";
      case "default":
      default:
        return "px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-sm font-medium";
    }
  };

  const getLanguageLabel = () => {
    switch (variant) {
      case "minimal":
        return language === "en" ? "EN" : "ID";
      case "icon":
        return language === "en" ? "EN" : "ID";
      case "default":
      default:
        return language === "en" ? "English" : "Indonesia";
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`${getButtonStyles()} ${className}`}
      aria-label={language === "en" ? "Switch to Indonesian" : "Switch to English"}
      {...props}
    >
      {getLanguageLabel()}
    </button>
  );
}
