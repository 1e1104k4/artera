
import { getOpenSeaClient } from './mcp-client';

// Use the centralized MCP client
const openSeaClient = await getOpenSeaClient();
const allTools = await openSeaClient.tools();
