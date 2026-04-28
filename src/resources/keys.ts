import type {
  KeyCreateParams,
  KeyCreateResponse,
  KeyUpdateParams,
  KeyUpdateResponse,
  KeyDeleteParams,
  KeyDeleteResponse,
  KeyBlockParams,
  KeyUnblockParams,
  KeyRegenerateParams,
  KeyInfoResponse,
  KeyHealthResponse,
  KeyListParams,
  KeyListResponse,
  KeyServiceAccountCreateParams,
  KeyBulkUpdateParams,
  KeyBulkUpdateResponse,
  KeyInfoV2Params,
  KeyInfoV2Response,
  KeyResetSpendResponse,
  KeyAliasesResponse,
} from '../types/keys';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class KeysResource {
  constructor(private request: RequestFn) {}

  /** POST /key/generate */
  create(params: KeyCreateParams = {}, options?: RequestOptions): Promise<KeyCreateResponse> {
    return this.request<KeyCreateResponse>({
      method: 'POST',
      path: '/key/generate',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /key/update */
  update(params: KeyUpdateParams, options?: RequestOptions): Promise<KeyUpdateResponse> {
    return this.request<KeyUpdateResponse>({
      method: 'POST',
      path: '/key/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /key/delete */
  delete(params: KeyDeleteParams, options?: RequestOptions): Promise<KeyDeleteResponse> {
    return this.request<KeyDeleteResponse>({
      method: 'POST',
      path: '/key/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /key/block */
  block(params: KeyBlockParams, options?: RequestOptions): Promise<KeyCreateResponse> {
    return this.request<KeyCreateResponse>({
      method: 'POST',
      path: '/key/block',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /key/unblock */
  unblock(params: KeyUnblockParams, options?: RequestOptions): Promise<KeyCreateResponse> {
    return this.request<KeyCreateResponse>({
      method: 'POST',
      path: '/key/unblock',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /key/{key}/regenerate */
  regenerate(
    params: KeyRegenerateParams,
    options?: RequestOptions,
  ): Promise<KeyCreateResponse> {
    const { key, ...rest } = params;
    return this.request<KeyCreateResponse>({
      method: 'POST',
      path: `/key/${encodeURIComponent(key)}/regenerate`,
      body: { kind: 'json', value: rest },
      options,
    });
  }

  /** GET /key/info?key=... */
  info(key: string, options?: RequestOptions): Promise<KeyInfoResponse> {
    return this.request<KeyInfoResponse>({
      method: 'GET',
      path: '/key/info',
      options: { ...(options ?? {}), query: { ...(options?.query ?? {}), key } },
    });
  }

  /** GET /key/list */
  list(params: KeyListParams = {}, options?: RequestOptions): Promise<KeyListResponse> {
    return this.request<KeyListResponse>({
      method: 'GET',
      path: '/key/list',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** POST /key/health — verify the key works against the configured providers. */
  health(options?: RequestOptions): Promise<KeyHealthResponse> {
    return this.request<KeyHealthResponse>({ method: 'POST', path: '/key/health', options });
  }

  /** POST /key/service-account/generate — create a service-account key. */
  createServiceAccount(
    params: KeyServiceAccountCreateParams,
    options?: RequestOptions,
  ): Promise<KeyCreateResponse> {
    return this.request<KeyCreateResponse>({
      method: 'POST',
      path: '/key/service-account/generate',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /key/bulk_update — update many keys in a single call. */
  bulkUpdate(
    params: KeyBulkUpdateParams,
    options?: RequestOptions,
  ): Promise<KeyBulkUpdateResponse> {
    return this.request<KeyBulkUpdateResponse>({
      method: 'POST',
      path: '/key/bulk_update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /v2/key/info — bulk-fetch key info. */
  infoV2(params: KeyInfoV2Params, options?: RequestOptions): Promise<KeyInfoV2Response> {
    return this.request<KeyInfoV2Response>({
      method: 'POST',
      path: '/v2/key/info',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /key/{key}/reset_spend */
  resetSpend(key: string, options?: RequestOptions): Promise<KeyResetSpendResponse> {
    return this.request<KeyResetSpendResponse>({
      method: 'POST',
      path: `/key/${encodeURIComponent(key)}/reset_spend`,
      options,
    });
  }

  /** GET /key/aliases — list all key aliases. */
  aliases(options?: RequestOptions): Promise<KeyAliasesResponse> {
    return this.request<KeyAliasesResponse>({ method: 'GET', path: '/key/aliases', options });
  }
}
