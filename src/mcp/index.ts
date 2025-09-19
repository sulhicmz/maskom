// Index file for MCP Client
export * from './client';
export * from './config';
export * from './auth';
export * from './rpc';
export * from './stream';

// Main client
export { GitHubMCPClientManager as MCPClient } from './client';

// Default export
export { GitHubMCPClientManager } from './client';