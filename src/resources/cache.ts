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

  /** GET /cache/settings */
  get(options?: RequestOptions): Promise<CacheSettingsGetResponse> {
    return this.request<CacheSettingsGetResponse>({
      method: 'GET',
      path: '/cache/settings',
      options,
    });
  }

  /** POST /cache/settings */
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

  /** POST /cache/settings/test */
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

  /** POST /cache/delete */
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

  /** POST /cache/flushall */
  flushAll(options?: RequestOptions): Promise<CacheFlushAllResponse> {
    return this.request<CacheFlushAllResponse>({
      method: 'POST',
      path: '/cache/flushall',
      options,
    });
  }

  /** GET /ping */
  ping(options?: RequestOptions): Promise<CachePingResponse> {
    return this.request<CachePingResponse>({
      method: 'GET',
      path: '/ping',
      options,
    });
  }

  /** GET /redis/info */
  redisInfo(options?: RequestOptions): Promise<CacheRedisInfoResponse> {
    return this.request<CacheRedisInfoResponse>({
      method: 'GET',
      path: '/redis/info',
      options,
    });
  }
}
