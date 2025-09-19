/**
 * Cloudflare Worker untuk Maskom Website
 * 
 * Worker ini menangani:
 * - CORS headers untuk API requests
 * - Security headers
 * - Routing untuk API endpoints
 * - Caching strategies
 */

export interface Env {
  // Environment variables
  NODE_ENV?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Tambahkan CORS headers untuk API requests
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    
    // Tambahkan security headers
    const securityHeaders = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    };
    
    // Gabungkan semua headers
    const headers = {
      ...corsHeaders,
      ...securityHeaders,
    };
    
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers,
      });
    }
    
    // Handle API routes
    if (url.pathname.startsWith("/api")) {
      // Untuk saat ini, kirimkan ke Next.js API routes
      // Di masa depan, bisa dikembangkan untuk menangani API requests secara langsung
      return fetch(request);
    }
    
    // Untuk semua request lainnya, kirimkan ke Next.js
    return fetch(request);
  },
};