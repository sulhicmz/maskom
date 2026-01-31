import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  const responseHeaders = new Headers(response.headers);

  if (!responseHeaders.has('X-Frame-Options')) {
    responseHeaders.set('X-Frame-Options', 'DENY');
  }

  if (!responseHeaders.has('X-Content-Type-Options')) {
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
  }

  if (!responseHeaders.has('X-XSS-Protection')) {
    responseHeaders.set('X-XSS-Protection', '1; mode=block');
  }

  if (!responseHeaders.has('Referrer-Policy')) {
    responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  if (!responseHeaders.has('Strict-Transport-Security') && request.nextUrl.protocol === 'https:') {
    responseHeaders.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  if (!responseHeaders.has('X-DNS-Prefetch-Control')) {
    responseHeaders.set('X-DNS-Prefetch-Control', 'off');
  }

  if (!responseHeaders.has('X-Download-Options')) {
    responseHeaders.set('X-Download-Options', 'noopen');
  }

  if (!responseHeaders.has('Permissions-Policy')) {
    responseHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  }

  if (!responseHeaders.has('Cross-Origin-Embedder-Policy')) {
    responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  }

  if (!responseHeaders.has('Cross-Origin-Opener-Policy')) {
    responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
  }

  if (!responseHeaders.has('Content-Security-Policy')) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maskom.co.id';
    responseHeaders.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        `img-src 'self' data: blob: ${siteUrl}`,
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; ')
    );
  }

  const origin = requestHeaders.get('origin');

  if (origin) {
    try {
      const originUrl = new URL(origin);
      const allowedOrigins = process.env.NEXT_PUBLIC_CORS_ORIGIN?.split(',')?.map(o => o.trim()) || ['https://maskom.co.id'];

      if (!allowedOrigins.includes(originUrl.origin)) {
        return new NextResponse('Unauthorized', { status: 403 });
      }
    } catch {
      return new NextResponse('Bad Request', { status: 400 });
    }
  }

  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    const contentType = requestHeaders.get('content-type');
    const validContentTypes = ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'];

    if (contentType && !validContentTypes.some(type => contentType.includes(type))) {
      return new NextResponse('Unsupported Media Type', { status: 415 });
    }
  }

  const contentLength = requestHeaders.get('content-length');
  if (contentLength) {
    const length = parseInt(contentLength, 10);
    const maxBodySize = 10 * 1024 * 1024;

    if (length > maxBodySize) {
      return new NextResponse('Payload Too Large', { status: 413 });
    }
  }

  return NextResponse.next({
    headers: responseHeaders,
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
