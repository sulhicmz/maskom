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

      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 1,
            },
            forms: {
              test: /[\\/]node_modules[\\/](react-hook-form|yup|@hookform)[\\/]/,
              name: 'forms',
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
            },
            swiper: {
              test: /[\\/]node_modules[\\/]swiper[\\/]/,
              name: 'swiper',
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
            },
            toastify: {
              test: /[\\/]node_modules[\\/]react-toastify[\\/]/,
              name: 'toastify',
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
            },
            paginate: {
              test: /[\\/]node_modules[\\/]react-paginate[\\/]/,
              name: 'paginate',
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
            },
            modalVideo: {
              test: /[\\/]node_modules[\\/]react-modal-video[\\/]/,
              name: 'modal-video',
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
            },
            emailjs: {
              test: /[\\/]node_modules[\\/](@emailjs|emailjs-com)[\\/]/,
              name: 'emailjs',
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
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
