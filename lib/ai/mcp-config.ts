export interface MCPServerConfig {
  url: string;
  sseUrl: string;
  headers: Record<string, string>;
}

export const OPENSEA_MCP_CONFIG: MCPServerConfig = {
  url: "https://mcp.opensea.io/mcp",
  sseUrl: "https://mcp.opensea.io/sse",
  headers: {
    "Authorization": "Bearer jRCXEr3mobnxTzGa83X1p2jWtH0RX3IBlEk0ALq8Xw"
  }
};

export const ENS_MCP_CONFIG: MCPServerConfig = {
  url: "https://ethid-mcp.efp.workers.dev/mcp",
  sseUrl: "https://ethid-mcp.efp.workers.dev/sse",
  headers: {}
};

export const MCP_SERVERS: Record<string, MCPServerConfig> = {
  opensea: OPENSEA_MCP_CONFIG,
  ens: ENS_MCP_CONFIG,
};
