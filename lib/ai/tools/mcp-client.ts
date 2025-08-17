import { tool } from 'ai';
import { z } from 'zod';
import { experimental_createMCPClient } from 'ai';
import { OPENSEA_MCP_CONFIG } from '../mcp-config';

// Initialize MCP client
let openSeaClient: any = null;

export async function getOpenSeaClient() {
  console.log('Getting OpenSea client');
  if (!openSeaClient) {
    try {
      openSeaClient = await experimental_createMCPClient({
        transport: {
          onclose: console.log,
          onerror: console.log,
          onmessage: console.log,
          type: 'sse',
          url: OPENSEA_MCP_CONFIG.sseUrl,
          headers: OPENSEA_MCP_CONFIG.headers
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  console.log('OpenSea client initialized');
  return openSeaClient;
}
