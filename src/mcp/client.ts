// Main MCP Client for GitHub Integration
import { GitHubMCPClient } from './index';
import { MCPConfig, defaultMCPConfig } from './config';
import { MCPStreamHandler } from './stream';
import { MCPRPCClient } from './rpc';

export class GitHubMCPClientManager {
  private config: MCPConfig;
  private client: GitHubMCPClient;
  private streamHandler: MCPStreamHandler;
  private rpcClient: MCPRPCClient;

  constructor(config?: Partial<MCPConfig>) {
    this.config = { ...defaultMCPConfig, ...config };
    this.client = new GitHubMCPClient(this.config.baseUrl, this.config.token);
    this.streamHandler = new MCPStreamHandler(this.config.baseUrl, this.config.token);
    this.rpcClient = new MCPRPCClient(this.config.baseUrl, this.config.token);
  }

  // Initialize connection to GitHub MCP server
  async initialize() {
    return await this.client.connect();
  }

  // HTTP Streaming methods
  async startResourceStreaming(onData: (data: any) => void, onError?: (error: any) => void) {
    return await this.streamHandler.startStreaming('resources/stream', onData, onError);
  }

  async startToolStreaming(onData: (data: any) => void, onError?: (error: any) => void) {
    return await this.streamHandler.startStreaming('tools/stream', onData, onError);
  }

  // RPC methods
  async listResources() {
    return await this.rpcClient.listResources();
  }

  async readResource(uri: string) {
    return await this.rpcClient.readResource(uri);
  }

  async listTools() {
    return await this.rpcClient.listTools();
  }

  async callTool(name: string, args: any) {
    return await this.rpcClient.callTool(name, args);
  }

  async listPrompts() {
    return await this.rpcClient.listPrompts();
  }

  async runPrompt(name: string, args: any) {
    return await this.rpcClient.runPrompt(name, args);
  }

  // Utility methods
  setToken(token: string) {
    this.config.token = token;
    // Reinitialize clients with new token
    this.client = new GitHubMCPClient(this.config.baseUrl, this.config.token);
    this.streamHandler = new MCPStreamHandler(this.config.baseUrl, this.config.token);
    this.rpcClient = new MCPRPCClient(this.config.baseUrl, this.config.token);
  }

  setBaseUrl(baseUrl: string) {
    this.config.baseUrl = baseUrl;
    // Reinitialize clients with new base URL
    this.client = new GitHubMCPClient(this.config.baseUrl, this.config.token);
    this.streamHandler = new MCPStreamHandler(this.config.baseUrl, this.config.token);
    this.rpcClient = new MCPRPCClient(this.config.baseUrl, this.config.token);
  }
}

// Export types and interfaces
export * from './config';
export * from './index';
export * from './stream';
export * from './rpc';

// Default export
export default GitHubMCPClientManager;