// Environment configuration for the Maskom application
// This helps manage environment-specific variables across different deployments

export const envConfig = {
  // EmailJS configuration
  EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || process.env.EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY,
  
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://maskom.co.id/api',
  
  // Domain configuration
  PRODUCTION_DOMAIN: process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'https://maskom.co.id',
  PREVIEW_DOMAIN: process.env.NEXT_PUBLIC_PREVIEW_DOMAIN || 'https://maskom.sulhi.workers.dev',
  WORKERS_DEV: process.env.NEXT_PUBLIC_WORKERS_DEV || 'https://*.workers.dev',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Application settings
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Maskom',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Feature flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' || false,
  ENABLE_CONTACT_FORM: process.env.NEXT_PUBLIC_ENABLE_CONTACT_FORM !== 'false', // enabled by default
  ENABLE_PERFORMANCE_MONITORING: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
  
  // Cache settings for Cloudflare
  EDGE_CACHE_TTL: Number(process.env.EDGE_CACHE_TTL) || 300, // 5 minutes default
  BROWSER_CACHE_TTL: Number(process.env.BROWSER_CACHE_TTL) || 0, // no browser cache by default for dynamic content
} as const;

// Helper function to check if running in edge environment
export function isEdgeRuntime(): boolean {
  return typeof process.env.NEXT_RUNTIME === 'string' && process.env.NEXT_RUNTIME === 'edge';
}

// Helper function to validate required environment variables
export function validateEnvironment(): void {
  const requiredVars = ['EMAILJS_SERVICE_ID', 'EMAILJS_TEMPLATE_ID', 'EMAILJS_PUBLIC_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[`NEXT_PUBLIC_${varName}` as keyof typeof process.env]);
  
  if (missingVars.length > 0) {
    console.warn('Warning: Missing environment variables:', missingVars.join(', '));
    console.warn('Using fallback values where available. For production, set these variables in your deployment environment.');
  }
}