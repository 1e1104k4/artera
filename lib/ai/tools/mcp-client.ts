import { tool } from 'ai';
import { z } from 'zod';
import { experimental_createMCPClient } from 'ai';
import { OPENSEA_MCP_CONFIG, ENS_MCP_CONFIG } from '../mcp-config';

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

// Initialize ENS MCP client
let ensClient: any = null;

export async function getENSClient() {
  console.log('Getting ENS client');
  if (!ensClient) {
    try {
      ensClient = await experimental_createMCPClient({
        transport: {
          onclose: console.log,
          onerror: console.log,
          onmessage: console.log,
          type: 'sse',
          url: ENS_MCP_CONFIG.sseUrl,
          headers: ENS_MCP_CONFIG.headers
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  console.log('ENS client initialized');
  return ensClient;
}
