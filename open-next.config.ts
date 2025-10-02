import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Basic configuration for Cloudflare deployment
  nextConfig: {
    // Optimize images for CDN delivery
    images: {
      unoptimized: true, // Let Cloudflare handle image optimization
    },
    
    // Optimize output for CDN
    output: "export",
  },
  
  // Additional settings
  overrides: {
    // Add any route-specific overrides here if needed
  },
});