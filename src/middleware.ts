import { NextRequest, NextResponse } from 'next/server';

// Middleware untuk optimasi performa dan keamanan
// Dijalankan di Cloudflare edge sebelum request mencapai aplikasi

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Tambahkan security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Tambahkan Content-Security-Policy yang lebih ketat
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.emailjs.com; media-src 'self'"
  );
  
  // Tambahkan Strict-Transport-Security
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  
  // Tambahkan Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  // Tambahkan cache headers untuk API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  // Tambahkan header untuk membedakan traffic dari Cloudflare Workers
  response.headers.set('X-Deployed-By', 'Cloudflare-Workers');
  response.headers.set('X-Edge-Location', request.headers.get('cf-ray') || 'unknown');
  
  return response;
}

// Konfigurasi middleware untuk menentukan path mana yang akan dijalani
export const config = {
  matcher: [
    /*
     * Jalankan middleware di semua path kecuali:
     * - File statis (/_next)
     * - File publik (public/*)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|public/|assets/).*)',
      missing: [
        { type: 'header', key: 'next-router-data' },
      ],
    },
    // Tapi juga jalankan untuk API routes
    {
      source: '/api/:path*',
    }
  ],
};