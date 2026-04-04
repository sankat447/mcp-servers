/**
 * Thin wrapper around node-cache that respects the global cache config.
 *
 * Each API client gets its own ResponseCache instance so cache keys are
 * namespaced by service and TTL can be tuned independently in the future.
 */

import NodeCache from 'node-cache';
import { config } from '../../config/index.js';
import { logger } from '../logger.js';

export class ResponseCache {
  private readonly cache: NodeCache;
  private readonly prefix: string;

  constructor(namespace: string) {
    this.prefix = namespace;
    this.cache = new NodeCache({
      stdTTL: config.cache.ttlSeconds,
      checkperiod: config.cache.ttlSeconds * 0.2,
      useClones: false,
    });
  }

  /** Build a deterministic cache key from path + params. */
  private key(path: string, params?: Record<string, unknown>): string {
    return `${this.prefix}:${path}:${JSON.stringify(params ?? {})}`;
  }

  /** Return cached value or `undefined` on miss. */
  get<T>(path: string, params?: Record<string, unknown>): T | undefined {
    if (!config.cache.enabled) return undefined;

    const k = this.key(path, params);
    const hit = this.cache.get<T>(k);
    if (hit !== undefined) {
      logger.debug({ cacheKey: k }, 'Cache hit');
    }
    return hit;
  }

  /** Store a value. */
  set<T>(path: string, params: Record<string, unknown> | undefined, value: T): void {
    if (!config.cache.enabled) return;
    this.cache.set(this.key(path, params), value);
  }

  /** Flush all entries for this namespace. */
  flush(): void {
    this.cache.flushAll();
    logger.info({ namespace: this.prefix }, 'Cache flushed');
  }
}
