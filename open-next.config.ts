import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Optimize for edge runtime
  edge: {
    // Include additional packages that need to be available at runtime
    packages: ["@emailjs/browser"],
  },
  
  // Optimize assets handling
  assets: {
    // Enable advanced caching headers
    cacheBehavior: [
      {
        include: ["/assets/*", "*.js", "*.css"],
        cacheTtl: 31536000, // 1 year for immutable assets
        browserTtl: 31536000,
      },
      {
        include: ["/fonts/*", "*.woff", "*.woff2", "*.ttf"],
        cacheTtl: 31536000, // 1 year for fonts
      },
      {
        include: ["*.png", "*.jpg", "*.jpeg", "*.gif", "*.svg", "*.webp"],
        cacheTtl: 31536000, // 1 year for images
        browserTtl: 31536000,
      },
    ],
  },
  
  // Optimize for Next.js features
  nextConfig: {
    // Enable experimental features that improve performance
    experimental: {
      // Bundle analyser - can be enabled during development
      bundlePagesExternals: false,
      
      // Optimize server components for edge runtime
      serverComponentsExternalPackages: ["@emailjs/browser"],
    },
    
    // Optimize images for CDN delivery
    images: {
      unoptimized: true, // Let Cloudflare handle image optimization
    },
    
    // Optimize output for CDN
    output: "export",
  },
  
  // Additional optimization settings
  overrides: {
    // Optimize function for specific routes if needed
  },
});