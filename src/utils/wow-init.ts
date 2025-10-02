'use client';

// Initialize WOW.js animations for scroll-based animations
// This addresses the known issue where 'wow' classes weren't being processed

interface WOWOptions {
  boxClass?: string;
  animateClass?: string;
  offset?: number;
  mobile?: boolean;
  live?: boolean;
  callback?: () => void;
  scrollContainer?: null | string;
}

// Type definition for WOW.js since @types/wowjs is not available
type WOWConstructor = new (options?: any) => {
  init: () => void;
};

declare global {
  interface Window {
    WOW: WOWConstructor;
  }
}

export const initWOW = (options?: WOWOptions) => {
  // Check if window is available (client-side only)
  if (typeof window !== 'undefined') {
    // Dynamically import WOW.js to avoid SSR issues
    import('wow.js').then((WOW) => {
      // Initialize WOW with provided options or defaults
      const wow = new WOW.default({
        boxClass: options?.boxClass || 'wow',
        animateClass: options?.animateClass || 'animated',
        offset: options?.offset !== undefined ? options.offset : 100,
        mobile: options?.mobile !== undefined ? options.mobile : true,
        live: options?.live !== undefined ? options.live : true,
        ...options
      });
      
      wow.init();
    }).catch((error) => {
      console.error('Error loading WOW.js:', error);
    });
  }
};

// Cleanup function to reset animations
export const resetWOW = () => {
  if (typeof window !== 'undefined' && window.WOW) {
    // Remove existing animation classes to allow re-animation
    const animatedElements = document.querySelectorAll('.wow.animated');
    animatedElements.forEach(el => {
      const classes = el.classList;
      classes.remove('animated');
      // Remove animation-specific classes added by WOW
      for (let i = 0; i < classes.length; i++) {
        if (classes[i].startsWith('bounce') || 
            classes[i].startsWith('fadeIn') || 
            classes[i].startsWith('rotate') ||
            classes[i].startsWith('slide')) {
          classes.remove(classes[i]);
          i--; // Adjust index after removal
        }
      }
    });
  }
};