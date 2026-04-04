/**
 * MCP Stdio transport — used when the server is launched as a subprocess
 * by an MCP client (e.g., Claude Desktop, Cursor).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { allToolDefinitions, handleToolCall } from '../tools/registry.js';

export function createMCPServer(): Server {
  const server = new Server(
    { name: config.server.name, version: config.server.version },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('Listing available tools');
    return { tools: allToolDefinitions };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logger.info({ tool: name, args }, 'Tool call received (stdio)');

    try {
      const result = await handleToolCall(name, args ?? {});
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error: any) {
      logger.error({ tool: name, error: error.message }, 'Tool call failed');
      throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
    }
  });

  return server;
}

export async function startStdioTransport(): Promise<void> {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('MCP server running in stdio mode');
}
