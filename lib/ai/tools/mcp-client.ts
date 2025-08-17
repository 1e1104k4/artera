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
      // start: console.log,
      // send: console.log,
      // close: console.log,
      // open: console.log,
      // onclose: console.log,
      
      transport: {
        onclose: console.log,
        onerror: console.log,
      onmessage: console.log,
        type: 'sse',
        url: "https://mcp.opensea.io/sse",
        headers: {
            'Authorization': 'Bearer jRCXEr3mobnxTzGa83X1p2jWtH0RX3IBlEk0ALq8Xw'
        }
      }
    });
    } catch (error) {
        console.log(error);
    }
  }
  console.log('OpenSea client initialized');
  return openSeaClient;
}
