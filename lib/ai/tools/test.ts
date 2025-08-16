import { experimental_createMCPClient, streamText } from 'ai'
import { openai } from '@ai-sdk/openai';


const openSeaClient = await experimental_createMCPClient({ 
    transport: { type: 'sse', url: 'https://mcp.opensea.io/sse', headers: { 'Authorization': 'Bearer TOKEN' } } }
);
const allTools = await openSeaClient.tools();
