/**
 * Base HTTP client for Sunbird DCIM APIs.
 *
 * Shared concerns:
 *   - Axios instance with basic auth + TLS settings
 *   - Request/response logging via interceptors
 *   - Per-service response caching
 *   - Generic GET / POST / PUT / DELETE helpers
 *
 * Concrete clients (DcTrackClient, PowerIQClient) extend this class and
 * add domain-specific methods.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';
import { config } from '../../config/index.js';
import { logger } from '../logger.js';
import { ResponseCache } from '../cache/index.js';
import { AuthenticationError, RateLimitError, SunbirdApiError } from '../errors/index.js';

export abstract class BaseClient {
  protected readonly http: AxiosInstance;
  protected readonly cache: ResponseCache;
  protected readonly serviceName: string;

  constructor(serviceName: string, basePath = '') {
    this.serviceName = serviceName;
    this.cache = new ResponseCache(serviceName);

    const httpsAgent = new https.Agent({
      rejectUnauthorized: config.sunbird.rejectUnauthorized,
    });

    this.http = axios.create({
      baseURL: `${config.sunbird.baseUrl}${basePath}`,
      timeout: config.sunbird.timeout,
      httpsAgent,
      auth: {
        username: config.sunbird.username,
        password: config.sunbird.password,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.registerInterceptors();
  }

  // -----------------------------------------------------------------------
  // Interceptors
  // -----------------------------------------------------------------------

  private registerInterceptors(): void {
    // Request logging
    this.http.interceptors.request.use(
      (req) => {
        logger.debug(
          { service: this.serviceName, method: req.method?.toUpperCase(), url: req.url },
          'API request',
        );
        return req;
      },
      (err) => {
        logger.error({ service: this.serviceName, error: err }, 'Request error');
        return Promise.reject(err);
      },
    );

    // Response logging + error classification
    this.http.interceptors.response.use(
      (res) => {
        logger.debug(
          { service: this.serviceName, status: res.status, url: res.config.url },
          'API response',
        );
        return res;
      },
      (error: AxiosError) => {
        const status = error.response?.status;
        const url = error.config?.url ?? 'unknown';

        if (status === 401) {
          return Promise.reject(
            new AuthenticationError(`Auth failed for ${this.serviceName}: ${url}`, error),
          );
        }
        if (status === 429) {
          return Promise.reject(new RateLimitError(undefined, error));
        }
        if (status && status >= 500) {
          return Promise.reject(
            new SunbirdApiError(`Server error from ${this.serviceName}: ${url}`, status, error),
          );
        }

        return Promise.reject(
          new SunbirdApiError(
            `API error from ${this.serviceName}: ${error.message}`,
            status,
            error,
          ),
        );
      },
    );
  }

  // -----------------------------------------------------------------------
  // HTTP helpers
  // -----------------------------------------------------------------------

  protected async get<T>(
    path: string,
    params?: Record<string, unknown>,
    useCache = true,
  ): Promise<T> {
    if (useCache) {
      const cached = this.cache.get<T>(path, params);
      if (cached !== undefined) return cached;
    }

    const { data } = await this.http.get<T>(path, { params });

    if (useCache) {
      this.cache.set(path, params, data);
    }
    return data;
  }

  protected async post<T>(path: string, body?: unknown): Promise<T> {
    const { data } = await this.http.post<T>(path, body);
    return data;
  }

  protected async put<T>(path: string, body?: unknown): Promise<T> {
    const { data } = await this.http.put<T>(path, body);
    return data;
  }

  protected async del<T>(path: string): Promise<T> {
    const { data } = await this.http.delete<T>(path);
    return data;
  }

  // -----------------------------------------------------------------------
  // Utilities
  // -----------------------------------------------------------------------

  /** Flush the response cache for this client. */
  clearCache(): void {
    this.cache.flush();
  }

  /** Verify connectivity by making a lightweight request. */
  abstract testConnection(): Promise<boolean>;
}
