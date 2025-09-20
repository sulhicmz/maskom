/**
 * Cloudflare Worker entry point
 * Handles API requests for maskom.co.id
 */

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, ctx);
    }
    
    // Default response for root
    if (url.pathname === '/') {
      return new Response('Maskom Worker is running!', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    
    // 404 for other routes
    return new Response('Not Found', { status: 404 });
  },
};

async function handleApiRequest(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  
  // Example API endpoint
  if (url.pathname === '/api/status') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Default API response
  return new Response(JSON.stringify({ message: 'API endpoint not implemented' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}