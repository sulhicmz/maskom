'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  type ScrollToTopConfig,
  DEFAULT_SCROLL_TO_TOP_CONFIG,
  SCROLL_TO_TOP_THEME,
} from '@/config/scrollToTop';

/**
 * Props for ScrollToTopButton component
 */
interface ScrollToTopButtonProps {
  /** Override default configuration */
  config?: Partial<ScrollToTopConfig>;
}

/**
 * ScrollToTopButton - A micro-UX enhancement that provides easy navigation
 * 
 * Features:
 * - Appears smoothly when user scrolls down past threshold
 * - Smooth scroll animation to top
 * - Respects user's reduced motion preference
 * - Accessible with keyboard navigation
 * - Adapts to dark/light theme
 * - Fully configurable via props or config file
 */
export default function ScrollToTopButton({
  config: userConfig = {},
}: ScrollToTopButtonProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();

  // Merge user config with defaults
  const config = { ...DEFAULT_SCROLL_TO_TOP_CONFIG, ...userConfig };
  
  // Get theme-specific colors
  const themeColors = theme === 'dark' 
    ? SCROLL_TO_TOP_THEME.dark 
    : SCROLL_TO_TOP_THEME.light;

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > config.visibilityThreshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [config.visibilityThreshold]);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  // Don't render on server
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-to-top ${isVisible ? 'visible' : ''} ${theme === 'dark' ? 'dark' : ''}`}
      aria-label={config.ariaLabel}
      title={config.title}
      style={{
        position: 'fixed',
        bottom: config.bottomPosition,
        right: config.rightPosition,
        width: `${config.buttonSize}px`,
        height: `${config.buttonSize}px`,
        borderRadius: '50%',
        backgroundColor: themeColors.backgroundColor,
        color: themeColors.textColor,
        border: `2px solid ${themeColors.borderColor}`,
        boxShadow: themeColors.boxShadow,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity ${config.animationDuration}ms ease, transform ${config.animationDuration}ms ease, visibility ${config.animationDuration}ms`,
        zIndex: config.zIndex,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = themeColors.boxShadowHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = themeColors.boxShadow;
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${themeColors.focusOutline}`;
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
