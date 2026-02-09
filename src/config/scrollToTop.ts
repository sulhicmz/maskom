/**
 * ScrollToTop Configuration
 * 
 * Centralized configuration for the ScrollToTopButton component
 * to allow easy customization without modifying component code.
 */
export interface ScrollToTopConfig {
  /** Scroll position (in pixels) at which button becomes visible */
  visibilityThreshold: number;
  
  /** Button position from bottom */
  bottomPosition: string;
  
  /** Button position from right */
  rightPosition: string;
  
  /** Button size */
  buttonSize: number;
  
  /** Animation duration in milliseconds */
  animationDuration: number;
  
  /** Z-index for button stacking */
  zIndex: number;
  
  /** ARIA label text (accessibility) */
  ariaLabel: string;
  
  /** Tooltip title */
  title: string;
}

/**
 * Default configuration values
 */
export const DEFAULT_SCROLL_TO_TOP_CONFIG: ScrollToTopConfig = {
  visibilityThreshold: 400,
  bottomPosition: '2rem',
  rightPosition: '2rem',
  buttonSize: 48,
  animationDuration: 300,
  zIndex: 999,
  ariaLabel: 'Kembali ke atas',
  title: 'Kembali ke atas',
};

/**
 * Theme-specific colors
 */
export const SCROLL_TO_TOP_THEME = {
  light: {
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderColor: '#e5e7eb',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    boxShadowHover: '0 6px 20px rgba(0, 0, 0, 0.2)',
    focusOutline: '#3b82f6',
  },
  dark: {
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    borderColor: '#374151',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    boxShadowHover: '0 6px 20px rgba(0, 0, 0, 0.4)',
    focusOutline: '#3b82f6',
  },
};
