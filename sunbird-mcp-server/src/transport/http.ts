/**
 * HTTP + SSE transport — used when the server runs as a standalone HTTP
 * service (e.g., behind a Kubernetes Service for n8n / LibreChat).
 */

import express, { Request, Response } from 'express';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { allToolDefinitions, handleToolCall } from '../tools/registry.js';
import { dctrackClient, poweriqClient } from '../lib/clients/index.js';

export function createHTTPServer() {
  const app = express();
  app.use(express.json());

  // -----------------------------------------------------------------------
  // Health
  // -----------------------------------------------------------------------

  app.get('/health', async (_req: Request, res: Response) => {
    const [dcOk, piqOk] = await Promise.all([
      dctrackClient.testConnection(),
      poweriqClient.testConnection(),
    ]);

    res.json({
      status: dcOk && piqOk ? 'healthy' : 'degraded',
      version: config.server.version,
      sunbird: {
        dctrack: dcOk ? 'connected' : 'disconnected',
        poweriq: piqOk ? 'connected' : 'disconnected',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // -----------------------------------------------------------------------
  // Tool discovery
  // -----------------------------------------------------------------------

  app.get('/tools', (_req: Request, res: Response) => {
    res.json({
      tools: allToolDefinitions.map((t) => ({ name: t.name, description: t.description })),
    });
  });

  // -----------------------------------------------------------------------
  // MCP JSON-RPC endpoint
  // -----------------------------------------------------------------------

  app.post('/mcp', async (req: Request, res: Response) => {
    const { jsonrpc, id, method, params } = req.body;

    if (jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0', id,
        error: { code: -32600, message: 'Invalid JSON-RPC version' },
      });
    }

    try {
      let result: any;

      switch (method) {
        case 'initialize':
          result = {
            protocolVersion: '2024-11-05',
            serverInfo: { name: config.server.name, version: config.server.version },
            capabilities: { tools: {} },
          };
          break;

        case 'tools/list':
          result = { tools: allToolDefinitions };
          break;

        case 'tools/call': {
          const { name, arguments: args } = params;
          const toolResult = await handleToolCall(name, args ?? {});
          result = { content: [{ type: 'text', text: JSON.stringify(toolResult, null, 2) }] };
          break;
        }

        default:
          return res.json({
            jsonrpc: '2.0', id,
            error: { code: -32601, message: `Unknown method: ${method}` },
          });
      }

      res.json({ jsonrpc: '2.0', id, result });
    } catch (error: any) {
      logger.error({ method, error: error.message }, 'MCP request failed');
      res.json({
        jsonrpc: '2.0', id,
        error: { code: error.code ?? -32000, message: error.message },
      });
    }
  });

  // -----------------------------------------------------------------------
  // SSE (real-time)
  // -----------------------------------------------------------------------

  app.get('/sse', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`data: ${JSON.stringify({ type: 'connected', server: config.server.name })}\n\n`);

    const keepAlive = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
    }, 30_000);

    req.on('close', () => {
      clearInterval(keepAlive);
      logger.info('SSE client disconnected');
    });
  });

  // -----------------------------------------------------------------------
  // Direct tool call (simplified for n8n)
  // -----------------------------------------------------------------------

  app.post('/tools/:toolName', async (req: Request, res: Response) => {
    const { toolName } = req.params;
    logger.info({ tool: toolName, args: req.body }, 'Direct tool call');

    try {
      const result = await handleToolCall(toolName, req.body);
      res.json({ success: true, result });
    } catch (error: any) {
      logger.error({ tool: toolName, error: error.message }, 'Direct tool call failed');
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return app;
}

export async function startHTTPTransport(): Promise<void> {
  const app = createHTTPServer();

  app.listen(config.server.port, config.server.host, () => {
    logger.info(`MCP HTTP server listening on http://${config.server.host}:${config.server.port}`);
    logger.info('Endpoints: GET /health, GET /tools, POST /mcp, GET /sse, POST /tools/:toolName');
  });
}
