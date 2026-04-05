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

  // CORS — allow cross-origin requests from the chat UI
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') { res.sendStatus(204); return; }
    next();
  });

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

  app.get('/tools', (req: Request, res: Response) => {
    const detail = req.query.detail;
    if (detail === 'full') {
      res.json({ tools: allToolDefinitions });
    } else {
      res.json({
        tools: allToolDefinitions.map((t) => ({ name: t.name, description: t.description })),
      });
    }
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
      let result = await handleToolCall(toolName as string, req.body as Record<string, any>);

      // Auto-wrap quicksearch responses with pagination metadata
      // Quicksearch results have { totalRows, pageNumber, searchResults: { items/models/... } }
      // Already-wrapped results have { data, totalRows, showing } — skip those
      if (result && typeof result === 'object' && !Array.isArray(result)
          && typeof result.totalRows === 'number' && result.searchResults
          && !result.data) {
        const sr = result.searchResults;
        const rows = sr.items ?? sr.models ?? sr.tickets ?? sr.parts ?? sr.partModels
                   ?? sr.auditTrail ?? sr.relationships ?? Object.values(sr)[0] ?? [];
        const dataArr = Array.isArray(rows) ? rows : [];
        result = {
          data: dataArr,
          totalRows: result.totalRows,
          showing: dataArr.length,
          pageSize: result.pageSize ?? dataArr.length,
        };
      }

      res.json({ success: true, result });
    } catch (error: any) {
      logger.error({ tool: toolName, error: error.message }, 'Direct tool call failed');
      // Return 200 with success:false for API-level errors (not found, invalid input, etc.)
      // so downstream consumers (n8n httpRequest) don't throw on the HTTP status.
      // Extract a human-friendly message from nested dcTrack/PowerIQ error responses.
      let friendlyMsg = error.message || 'Tool execution failed';
      try {
        // dcTrack errors are often: "API error from dctrack: ... — {json}"
        const jsonMatch = friendlyMsg.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          // Prefer errorList (detailed) over message (generic "Unsuccessful operation")
          if (parsed.errorList && parsed.errorList.length > 0) {
            friendlyMsg = parsed.errorList.join('. ');
          } else {
            friendlyMsg = parsed.message || friendlyMsg;
          }
        }
      } catch (_) {}
      res.json({ success: false, error: friendlyMsg });
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
