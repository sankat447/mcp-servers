/**
 * Centralised logger powered by Pino.
 *
 * - Pretty-prints in development, structured JSON in production.
 * - Child loggers can be created per module via `logger.child({ module })`.
 */

import pino from 'pino';
import { config } from '../config/index.js';

const transport = config.isDev
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
  : undefined; // plain JSON in production (12-factor friendly)

export const logger = pino({
  level: config.logging.level,
  ...(transport ? { transport } : {}),
});
