import type {
  CacheDeleteParams,
  CacheDeleteResponse,
  CacheFlushAllResponse,
  CachePingResponse,
  CacheRedisInfoResponse,
  CacheSettingsGetResponse,
  CacheSettingsUpdateParams,
  CacheSettingsUpdateResponse,
  CacheSettingsTestParams,
  CacheSettingsTestResponse,
} from '../types/cache';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

class CacheSettingsResource {
  constructor(private request: RequestFn) {}

  /**
   * Get the proxy's cache settings (Redis backend, TTLs, etc.).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The current cache settings.
   *
   * @see https://docs.litellm.ai/docs/proxy/caching
   */
  get(options?: RequestOptions): Promise<CacheSettingsGetResponse> {
    return this.request<CacheSettingsGetResponse>({
      method: 'GET',
      path: '/cache/settings',
      options,
    });
  }

  /**
   * Update the proxy's cache settings.
   *
   * @param params - The cache settings update payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated cache settings.
   *
   * @see https://docs.litellm.ai/docs/proxy/caching
   */
  update(
    params: CacheSettingsUpdateParams,
    options?: RequestOptions,
  ): Promise<CacheSettingsUpdateResponse> {
    return this.request<CacheSettingsUpdateResponse>({
      method: 'POST',
      path: '/cache/settings',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Validate a candidate cache settings payload (e.g. ping a Redis URL) before saving.
   *
   * @param params - The cache settings to test.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The connection test result.
   *
   * @see https://docs.litellm.ai/docs/proxy/caching
   */
  test(
    params: CacheSettingsTestParams,
    options?: RequestOptions,
  ): Promise<CacheSettingsTestResponse> {
    return this.request<CacheSettingsTestResponse>({
      method: 'POST',
      path: '/cache/settings/test',
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class CacheResource {
  readonly settings: CacheSettingsResource;

  constructor(private request: RequestFn) {
    this.settings = new CacheSettingsResource(request);
  }

  /**
   * Delete one or more entries from the proxy's response cache.
   *
   * @param params - The set of cache keys (or filters) to evict.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The cache deletion result.
   *
   * @see https://docs.litellm.ai/docs/proxy/caching
   */
  delete(
    params: CacheDeleteParams,
    options?: RequestOptions,
  ): Promise<CacheDeleteResponse> {
    return this.request<CacheDeleteResponse>({
      method: 'POST',
      path: '/cache/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Flush every entry in the proxy's response cache.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The flush result.
   *
   * @see https://docs.litellm.ai/docs/proxy/caching
   */
  flushAll(options?: RequestOptions): Promise<CacheFlushAllResponse> {
    return this.request<CacheFlushAllResponse>({
      method: 'POST',
      path: '/cache/flushall',
      options,
    });
  }

  /**
   * Ping the cache backend as a diagnostic.
   *
   * Use {@link CacheResource.redisInfo} for richer Redis stats, or
   * `client.health.liveness()` for overall proxy liveness.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The cache ping response.
   *
   * @see https://docs.litellm.ai/docs/proxy/caching
   */
  ping(options?: RequestOptions): Promise<CachePingResponse> {
    return this.request<CachePingResponse>({
      method: 'GET',
      path: '/cache/ping',
      options,
    });
  }

  /**
   * Fetch detailed Redis server info from the cache backend.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The Redis info payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/caching
   */
  redisInfo(options?: RequestOptions): Promise<CacheRedisInfoResponse> {
    return this.request<CacheRedisInfoResponse>({
      method: 'GET',
      path: '/cache/redis/info',
      options,
    });
  }
}
