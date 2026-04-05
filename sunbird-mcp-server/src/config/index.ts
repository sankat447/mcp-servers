/**
 * Structured application configuration derived from validated environment
 * variables.  Import `config` anywhere you need typed, validated settings.
 *
 * Example:
 *   import { config } from '@/config/index.js';
 *   console.log(config.server.port);
 */

import { env } from './env.js';

export const config = {
  /** Runtime environment */
  nodeEnv: env.NODE_ENV,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  /** MCP / HTTP server settings */
  server: {
    name: env.MCP_SERVER_NAME,
    version: env.MCP_VERSION,
    port: env.MCP_PORT,
    host: env.MCP_HOST,
  },

  /** Sunbird DCIM connection */
  sunbird: {
    baseUrl: env.SUNBIRD_BASE_URL,
    dctrackBaseUrl: env.DCTRACK_BASE_URL ?? env.SUNBIRD_BASE_URL,
    poweriqBaseUrl: env.POWERIQ_BASE_URL ?? env.SUNBIRD_BASE_URL,
    username: env.SUNBIRD_USERNAME,
    password: env.SUNBIRD_PASSWORD,
    timeout: env.SUNBIRD_TIMEOUT,
    rejectUnauthorized: env.SUNBIRD_REJECT_UNAUTHORIZED,
  },

  /** Response cache */
  cache: {
    enabled: env.CACHE_ENABLED,
    ttlSeconds: env.CACHE_TTL_SECONDS,
  },

  /** Logging */
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;

export type AppConfig = typeof config;
