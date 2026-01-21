import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Konfigurasi Turbopack untuk Next.js 16
  turbopack: {},

  // Konfigurasi untuk Cloudflare Pages
  output: 'standalone',
  distDir: '.next',

  // Konfigurasi CDN base URL untuk production
  ...(process.env.CDN_URL ? {
    assetPrefix: process.env.CDN_URL,
    basePath: process.env.CDN_URL
  } : {}),

  // Optimasi untuk Cloudflare Pages
  serverExternalPackages: ['@emailjs/browser'],

  // Konfigurasi image optimization
  images: {
    unoptimized: true, // Cloudflare Pages menangani image optimization
    ...(process.env.CDN_URL ? {
      domains: [new URL(process.env.CDN_URL).hostname]
    } : {})
  },
  
  // Konfigurasi kompresi
  compress: true,
  
  // Konfigurasi webpack untuk mengurangi ukuran bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };

      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
        providedExports: true,
        splitChunks: {
          chunks: 'all',
          maxSize: 244000,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 1,
              reuseExistingChunk: true,
            },
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },
            nextCore: {
              test: /[\\/]node_modules[\\/](@next|next)[\\/]/,
              name: 'next-core',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },
            nextIntl: {
              test: /[\\/]node_modules[\\/]next-intl[\\/]/,
              name: 'next-intl',
              chunks: 'all',
              priority: 15,
              reuseExistingChunk: true,
              enforce: true,
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
            jspdf: {
              test: /[\\/]node_modules[\\/]jspdf[\\/]/,
              name: 'jspdf',
              chunks: 'async',
              priority: 15,
              reuseExistingChunk: true,
              enforce: true,
            },
            html2canvas: {
              test: /[\\/]node_modules[\\/]html2canvas[\\/]/,
              name: 'html2canvas',
              chunks: 'async',
              priority: 15,
              reuseExistingChunk: true,
              enforce: true,
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
  
  // Implementasi caching strategies dan security headers untuk static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|jpeg|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
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
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production'
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.emailjs.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
              : "default-src 'self' 'unsafe-inline' 'unsafe-eval' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *; img-src 'self' data: https: blob: *; font-src 'self' data: *; connect-src 'self' *;",
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
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
