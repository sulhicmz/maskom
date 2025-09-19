// MCP Client Configuration
export interface MCPConfig {
  baseUrl: string;
  token: string;
  timeout?: number;
}

export const defaultMCPConfig: MCPConfig = {
  baseUrl: 'https://api.github.com/mcp',
  token: '',
  timeout: 30000
};