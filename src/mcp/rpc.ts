// JSON-RPC Client for MCP
export class MCPRPCClient {
  private baseUrl: string;
  private token: string;
  
  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async call(method: string, params: any = {}) {
    const requestId = Date.now();
    
    const response = await fetch(`${this.baseUrl}/rpc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: requestId,
        method: method,
        params: params
      })
    });

    if (!response.ok) {
      throw new Error(`RPC call failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }
    
    return data.result;
  }
  
  // Common MCP methods
  async listResources() {
    return this.call('resources/list');
  }
  
  async readResource(uri: string) {
    return this.call('resources/read', { uri });
  }
  
  async listTools() {
    return this.call('tools/list');
  }
  
  async callTool(name: string, arguments: any) {
    return this.call('tools/call', { name, arguments });
  }
  
  async listPrompts() {
    return this.call('prompts/list');
  }
  
  async runPrompt(name: string, arguments: any) {
    return this.call('prompts/run', { name, arguments });
  }
}