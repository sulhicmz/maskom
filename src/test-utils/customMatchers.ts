/**
 * Custom Jest matchers for common assertions
 * Import this file in jest.setup.js to enable these matchers
 */

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace jest {
    interface Matchers {
      toHaveAriaLabel(expected: string): CustomMatcherResult;
      toHaveAriaLive(expected: string): CustomMatcherResult;
      toHaveAriaBusy(expected: boolean): CustomMatcherResult;
      toBeDisabled(): CustomMatcherResult;
      toHaveRole(expected: string): CustomMatcherResult;
      toHaveClass(expected: string | string[]): CustomMatcherResult;
      toBeLoading(): CustomMatcherResult;
      toHaveValidationError(expected: string): CustomMatcherResult;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

expect.extend({
  toHaveAriaLabel(received: HTMLElement, expected: string) {
    const actual = received.getAttribute('aria-label');
    return {
      pass: actual === expected,
      message: () =>
        `expected element to have aria-label "${expected}", got "${actual}"`,
    };
  },

  toHaveAriaLive(received: HTMLElement, expected: string) {
    const actual = received.getAttribute('aria-live');
    return {
      pass: actual === expected,
      message: () =>
        `expected element to have aria-live "${expected}", got "${actual}"`,
    };
  },

  toHaveAriaBusy(received: HTMLElement, expected: boolean) {
    const actual = received.getAttribute('aria-busy');
    return {
      pass: actual === String(expected),
      message: () =>
        `expected element to have aria-busy "${expected}", got "${actual}"`,
    };
  },

  toBeDisabled(received: HTMLElement) {
    const disabled = (received as HTMLInputElement | HTMLButtonElement).disabled;
    return {
      pass: disabled === true,
      message: () =>
        disabled
          ? `expected element not to be disabled`
          : `expected element to be disabled`,
    };
  },

  toHaveRole(received: HTMLElement, expected: string) {
    const actual = received.getAttribute('role');
    return {
      pass: actual === expected,
      message: () =>
        `expected element to have role "${expected}", got "${actual}"`,
    };
  },

  toHaveClass(received: HTMLElement, expected: string | string[]) {
    const classes = received.className.split(/\s+/).filter(Boolean);
    const expectedClasses = Array.isArray(expected) ? expected : [expected];
    const missing = expectedClasses.filter(c => !classes.includes(c));
    
    return {
      pass: missing.length === 0,
      message: () =>
        missing.length > 0
          ? `expected element to have classes [${expectedClasses.join(', ')}], missing [${missing.join(', ')}]`
          : `expected element not to have classes [${expectedClasses.join(', ')}]`,
    };
  },

  toBeLoading(received: HTMLElement) {
    const text = received.textContent?.toLowerCase() || '';
    const hasLoadingText = text.includes('loading') ||
                         text.includes('memuat') ||
                         text.includes('mengirim') ||
                         text.includes('mendaftarkan');
    
    return {
      pass: !!hasLoadingText,
      message: () =>
        hasLoadingText
          ? `expected element not to be in loading state`
          : `expected element to be in loading state`,
    };
  },

  toHaveValidationError(received: HTMLElement, expected: string) {
    const actual = received.textContent || '';
    const hasError = actual.toLowerCase().includes('required') ||
                     actual.toLowerCase().includes('diperlukan') ||
                     actual.toLowerCase().includes('tidak valid') ||
                     actual.toLowerCase().includes('invalid');
    
    return {
      pass: hasError && actual.includes(expected),
      message: () =>
        `expected element to have validation error containing "${expected}", got "${actual}"`,
    };
  },
});

export {};
