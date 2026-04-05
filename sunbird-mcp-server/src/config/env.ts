import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file (no-op in production)
dotenvConfig();

// ---------------------------------------------------------------------------
// Schema – single source of truth for every environment variable
// ---------------------------------------------------------------------------

const EnvSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MCP_SERVER_NAME: z.string().default('sunbird-dcim-mcp'),
  MCP_VERSION: z.string().default('1.0.0'),
  MCP_PORT: z.coerce.number().int().positive().default(8080),
  MCP_HOST: z.string().default('0.0.0.0'),

  // Sunbird connection (shared defaults)
  SUNBIRD_BASE_URL: z.string().url().default('https://192.168.200.201'),
  SUNBIRD_USERNAME: z.string().default('API'),
  SUNBIRD_PASSWORD: z.string().min(1),
  SUNBIRD_TIMEOUT: z.coerce.number().int().positive().default(30_000),
  SUNBIRD_REJECT_UNAUTHORIZED: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default('false'),

  // Separate URLs (override SUNBIRD_BASE_URL per product)
  DCTRACK_BASE_URL: z.string().url().optional(),
  POWERIQ_BASE_URL: z.string().url().optional(),

  // Cache
  CACHE_ENABLED: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default('true'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

// ---------------------------------------------------------------------------
// Parsed + validated config – fail-fast on startup
// ---------------------------------------------------------------------------

function loadEnv(): Env {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
