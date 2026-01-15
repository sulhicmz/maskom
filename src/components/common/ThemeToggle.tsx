"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { memo } from "react";

const ThemeToggle = memo(() => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <span className="theme-icon theme-icon-moon" aria-hidden="true">
          🌙
        </span>
      ) : (
        <span className="theme-icon theme-icon-sun" aria-hidden="true">
          ☀️
        </span>
      )}
    </button>
  );
});

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
