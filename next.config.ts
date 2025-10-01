import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Konfigurasi untuk Cloudflare Pages
  output: 'standalone',
  distDir: '.next',
  
  // Optimasi untuk Cloudflare Pages
  serverExternalPackages: ['@emailjs/browser'],
  
  // Konfigurasi image optimization
  images: {
    unoptimized: true, // Cloudflare Pages menangani image optimization
  },
  
  // Konfigurasi webpack untuk mengurangi ukuran bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };

      // Optimasi untuk Cloudflare Pages (khusus bundle client)
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },
  
  // Konfigurasi untuk Cloudflare Pages
  experimental: {
    // Menonaktifkan optimizeCss karena Cloudflare menangani ini
    optimizeCss: false,
  },
  
  // Konfigurasi untuk asset prefixes
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://maskom.co.id' : undefined,
  
  // Implementasi caching strategies untuk static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|jpeg|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Konfigurasi tambahan untuk MCP (Model Context Protocol)
  // Memastikan kompatibilitas dengan tools seperti GitHub dan Cloudflare
  env: {
    // Variabel lingkungan untuk MCP
    MCP_ENABLED: process.env.MCP_ENABLED || "true",
    MCP_API_URL: process.env.MCP_API_URL || "/api/mcp",
  },
};

export default withBundleAnalyzer(nextConfig);