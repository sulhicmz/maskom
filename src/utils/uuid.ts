/**
 * Utility for generating UUID v4 strings
 * Uses native crypto.randomUUID() for zero bundle size and maximum performance
 * Compatible with Node.js 15.6+ and modern browsers (Edge runtime)
 */

/**
 * Generate a UUID v4 string
 * @returns UUID v4 string in format "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
 * @throws Error if crypto.randomUUID() is not available (should not happen in target environment)
 */
export function generateUUID(): string {
  // Use native crypto.randomUUID() - available in Node.js 15.6+, modern browsers, and Cloudflare Workers
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback: throw error rather than bundling a large polyfill
  // This should never happen in the target environment (Edge runtime, Node.js 20+)
  throw new Error(
    'crypto.randomUUID() is not available. Please ensure you are running in a modern environment (Node.js 15.6+, modern browser, or Cloudflare Workers).'
  );
}
