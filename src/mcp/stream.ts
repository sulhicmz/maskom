// HTTP Streaming for MCP
export class MCPStreamHandler {
  private baseUrl: string;
  private token: string;
  
  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  // Method to initiate HTTP streaming connection
  async startStreaming(endpoint: string, onData: (data: any) => void, onError?: (error: any) => void) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'text/event-stream',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          onData(chunk);
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error('Streaming error:', error);
      }
    }
  }
}