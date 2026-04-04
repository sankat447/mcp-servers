#!/usr/bin/env node

/**
 * Application entry point.
 *
 * Supports two transport modes:
 *   --stdio   Direct MCP client (Claude Desktop, Cursor, etc.)
 *   (default) HTTP server for n8n, LibreChat, and other HTTP clients
 */

import { logger } from './lib/logger.js';
import { dctrackClient, poweriqClient } from './lib/clients/index.js';
import { startStdioTransport } from './transport/stdio.js';
import { startHTTPTransport } from './transport/http.js';

async function main(): Promise<void> {
  const mode = process.argv.includes('--stdio') ? 'stdio' : 'http';

  logger.info({ mode }, 'Starting Sunbird DCIM MCP server');

  // Pre-flight connectivity check
  const [dcOk, piqOk] = await Promise.all([
    dctrackClient.testConnection(),
    poweriqClient.testConnection(),
  ]);

  logger.info(
    { dctrack: dcOk ? 'connected' : 'failed', poweriq: piqOk ? 'connected' : 'failed' },
    'Sunbird connection status',
  );

  if (mode === 'stdio') {
    await startStdioTransport();
  } else {
    await startHTTPTransport();
  }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

main().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down...`);
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
