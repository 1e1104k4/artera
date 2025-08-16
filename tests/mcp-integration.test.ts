import { describe, it, expect } from 'vitest';
import { mcpOpenSea } from '../lib/ai/tools/mcp-client';

describe('MCP Integration', () => {
  it('should have mcpOpenSea tool available', () => {
    expect(mcpOpenSea).toBeDefined();
    expect(typeof mcpOpenSea.execute).toBe('function');
  });

  it('should have correct tool schema', () => {
    expect(mcpOpenSea.inputSchema).toBeDefined();
    expect(mcpOpenSea.description).toContain('OpenSea');
  });

  it('should handle list_tools action', async () => {
    const result = await mcpOpenSea.execute({
      action: 'list_tools',
      params: {}
    });
    
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('action', 'list_tools');
  });
});
