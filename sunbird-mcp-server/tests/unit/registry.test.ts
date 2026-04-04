/**
 * Smoke tests for the tool registry.
 */

import { describe, it, expect } from 'vitest';
import { allToolDefinitions, getToolDefinition } from '../../src/tools/registry.js';

describe('Tool Registry', () => {
  it('should expose all 43 tool definitions', () => {
    expect(allToolDefinitions.length).toBe(43);
  });

  it('every tool should have name, description, and inputSchema', () => {
    for (const tool of allToolDefinitions) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
    }
  });

  it('tool names should be unique', () => {
    const names = allToolDefinitions.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('getToolDefinition should return the correct tool', () => {
    const tool = getToolDefinition('dctrack_list_locations');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('dctrack_list_locations');
  });

  it('getToolDefinition should return undefined for unknown tools', () => {
    expect(getToolDefinition('nonexistent_tool')).toBeUndefined();
  });
});
