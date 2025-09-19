// GitHub Authentication for MCP
export class GitHubAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  // Generate authorization URL
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'read:org,user:email,repo',
      state: this.generateState()
    });
    
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  // Exchange code for access token
  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.redirectUri
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Authentication error: ${data.error_description}`);
    }
    
    return data.access_token;
  }

  // Generate random state for OAuth flow
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Validate webhook signature
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = 'sha256=' + 
        crypto.createHmac('sha256', secret)
              .update(payload)
              .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      return false;
    }
  }
}