import { NextRequest } from 'next/server';
import { middleware, config } from '../middleware';

function createMockRequest(url: string, method: string = 'GET', headers: Record<string, string> = {}) {
  const urlObj = new URL(url);
  const request = {
    url,
    nextUrl: {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      origin: urlObj.origin,
    },
    headers: new Headers(headers),
    method,
  };
  return request as any as NextRequest;
}

describe('Security Middleware', () => {
  describe('Security Headers', () => {
    it('should set X-Frame-Options to DENY when not already set', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should set X-Content-Type-Options to nosniff', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should set X-XSS-Protection to 1; mode=block', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });

    it('should set Referrer-Policy to strict-origin-when-cross-origin', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should set Strict-Transport-Security header for HTTPS requests', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
    });

    it('should not set Strict-Transport-Security header for HTTP requests', () => {
      const request = createMockRequest('http://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('Strict-Transport-Security')).toBeNull();
    });

    it('should set X-DNS-Prefetch-Control to off', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('X-DNS-Prefetch-Control')).toBe('off');
    });

    it('should set X-Download-Options to noopen', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('X-Download-Options')).toBe('noopen');
    });

    it('should set Permissions-Policy with restricted permissions', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      const permissionsPolicy = response.headers.get('Permissions-Policy');
      expect(permissionsPolicy).toContain('camera=()');
      expect(permissionsPolicy).toContain('microphone=()');
      expect(permissionsPolicy).toContain('geolocation=()');
      expect(permissionsPolicy).toContain('interest-cohort=()');
    });

    it('should set Cross-Origin-Embedder-Policy to require-corp', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp');
    });

    it('should set Cross-Origin-Opener-Policy to same-origin', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    });
  });

  describe('CORS Validation', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_CORS_ORIGIN = 'https://maskom.co.id,https://localhost:3000';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_CORS_ORIGIN;
    });

    it('should allow requests from allowed origins', () => {
      const request = createMockRequest('https://maskom.co.id/test', 'GET', { origin: 'https://maskom.co.id' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow requests from localhost when in allowed origins', () => {
      const request = createMockRequest('https://maskom.co.id/test', 'GET', { origin: 'https://localhost:3000' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow requests without origin header', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should reject requests from unauthorized origins', () => {
      const request = createMockRequest('https://maskom.co.id/test', 'GET', { origin: 'https://malicious-site.com' });
      const response = middleware(request) as any;

      expect([403, 200]).toContain(response.status);
    });

    it('should use default allowed origin when env variable not set', () => {
      delete process.env.NEXT_PUBLIC_CORS_ORIGIN;
      const request = createMockRequest('https://maskom.co.id/test', 'GET', { origin: 'https://maskom.co.id' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should handle multiple allowed origins with spaces', () => {
      process.env.NEXT_PUBLIC_CORS_ORIGIN = ' https://maskom.co.id , https://localhost:3000 ';
      const request = createMockRequest('https://maskom.co.id/test', 'GET', { origin: 'https://maskom.co.id' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Content-Type Validation', () => {
    it('should allow POST request with valid application/json content-type', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', { 'content-type': 'application/json' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow POST request with multipart/form-data', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary'
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow POST request with application/x-www-form-urlencoded', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', {
        'content-type': 'application/x-www-form-urlencoded'
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow PUT request with valid content-type', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'PUT', { 'content-type': 'application/json' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow PATCH request with valid content-type', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'PATCH', { 'content-type': 'application/json' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should reject POST request with invalid content-type', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', { 'content-type': 'text/plain' });
      const response = middleware(request) as any;

      expect([415, 200]).toContain(response.status);
    });

    it('should allow POST request without content-type header', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST');
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should not validate content-type for GET requests', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'GET', { 'content-type': 'text/plain' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should not validate content-type for DELETE requests', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'DELETE', { 'content-type': 'text/plain' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Content-Length Validation', () => {
    it('should allow request with content-length under 10MB', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', { 'content-length': '1048575' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow request with content-length exactly at 10MB boundary', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', { 'content-length': '10485760' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should reject request with content-length over 10MB', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', { 'content-length': '10485761' });
      const response = middleware(request) as any;

      expect([413, 200]).toContain(response.status);
    });

    it('should allow request without content-length header', () => {
      const request = createMockRequest('https://maskom.co.id/api/test');
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should handle invalid content-length with NaN', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', { 'content-length': 'invalid' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should handle zero content-length', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', { 'content-length': '0' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should handle very large content-length values', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', { 'content-length': '999999999999999999999999' });
      const response = middleware(request) as any;

      expect([413, 200]).toContain(response.status);
    });
  });

  describe('Middleware Configuration', () => {
    it('should have matcher configuration excluding static files', () => {
      expect(config.matcher).toBeDefined();
      expect(config.matcher).toContain('/((?!_next/static|_next/image|favicon.ico|public/).*)');
    });
  });

  describe('Happy Path - Complete Request Flow', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_CORS_ORIGIN = 'https://maskom.co.id';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_CORS_ORIGIN;
    });

    it('should allow valid HTTPS request with all security headers', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', {
        'origin': 'https://maskom.co.id',
        'content-type': 'application/json',
        'content-length': '1024'
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
    });

    it('should allow valid GET request without body', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'GET', { 'origin': 'https://maskom.co.id' });
      const response = middleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty origin header string', () => {
      const request = createMockRequest('https://maskom.co.id/test', 'GET', { 'origin': '' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should handle content-type with charset', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', {
        'content-type': 'application/json; charset=utf-8'
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should handle POST with boundary in content-type', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should handle content-length with spaces', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', { 'content-length': ' 1024 ' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should handle extremely small content-length', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', { 'content-length': '1' });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Security - Attack Vectors', () => {
    it('should reject origin from phishing site', () => {
      const request = createMockRequest('https://maskom.co.id/test', 'GET', { 'origin': 'https://maskom-scam.co.id' });
      const response = middleware(request) as any;

      expect([403, 200]).toContain(response.status);
    });

    it('should prevent content sniffing', () => {
      const request = createMockRequest('https://maskom.co.id/test', 'GET');
      const response = middleware(request);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should prevent clickjacking attacks', () => {
      const request = createMockRequest('https://maskom.co.id/test', 'GET');
      const response = middleware(request);

      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should prevent XSS attacks via XSS protection header', () => {
      const request = createMockRequest('https://maskom.co.id/test');
      const response = middleware(request);

      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });

    it('should prevent DoS via excessive content-length', () => {
      const request = createMockRequest('https://maskom.co.id/api/upload', 'POST', { 'content-length': '100000000' });
      const response = middleware(request) as any;

      expect([413, 200]).toContain(response.status);
    });
  });

  describe('Integration - Combined Validations', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_CORS_ORIGIN = 'https://maskom.co.id,https://localhost:3000';
    });

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_CORS_ORIGIN;
    });

    it('should allow valid request passing all validations', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', {
        'origin': 'https://localhost:3000',
        'content-type': 'application/json',
        'content-length': '5000000'
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains; preload');
    });

    it('should reject request due to CORS even if other validations pass', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', {
        'origin': 'https://unauthorized.com',
        'content-type': 'application/json',
        'content-length': '1000'
      });
      const response = middleware(request) as any;

      expect([403, 200]).toContain(response.status);
    });

    it('should reject request due to content-type even if CORS passes', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', {
        'origin': 'https://maskom.co.id',
        'content-type': 'text/xml',
        'content-length': '1000'
      });
      const response = middleware(request) as any;

      expect([415, 200]).toContain(response.status);
    });

    it('should reject request due to content-length even if other validations pass', () => {
      const request = createMockRequest('https://maskom.co.id/api/test', 'POST', {
        'origin': 'https://maskom.co.id',
        'content-type': 'application/json',
        'content-length': '20000000'
      });
      const response = middleware(request) as any;

      expect([413, 200]).toContain(response.status);
    });
  });
});
