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

  /**
   * Generate a new virtual API key (`POST /key/generate`).
   *
   * @param params - Key generation options (models, budgets, expiry, metadata, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly generated key plus its associated metadata.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
  create(params: KeyCreateParams = {}, options?: RequestOptions): Promise<KeyCreateResponse> {
    return this.request<KeyCreateResponse>({
      method: 'POST',
      path: '/key/generate',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing virtual key's settings (`POST /key/update`).
   *
   * @param params - Key identifier plus fields to update (models, budget, metadata, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated key record.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
  update(params: KeyUpdateParams, options?: RequestOptions): Promise<KeyUpdateResponse> {
    return this.request<KeyUpdateResponse>({
      method: 'POST',
      path: '/key/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete one or more virtual keys (`POST /key/delete`).
   *
   * @param params - Keys or aliases to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion result with counts and any errors.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
  delete(params: KeyDeleteParams, options?: RequestOptions): Promise<KeyDeleteResponse> {
    return this.request<KeyDeleteResponse>({
      method: 'POST',
      path: '/key/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Block a virtual key from making further requests (`POST /key/block`).
   *
   * @param params - The key to block.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated key record reflecting the blocked state.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
  block(params: KeyBlockParams, options?: RequestOptions): Promise<KeyCreateResponse> {
    return this.request<KeyCreateResponse>({
      method: 'POST',
      path: '/key/block',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Unblock a previously blocked virtual key (`POST /key/unblock`).
   *
   * @param params - The key to unblock.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated key record reflecting the unblocked state.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
  unblock(params: KeyUnblockParams, options?: RequestOptions): Promise<KeyCreateResponse> {
    return this.request<KeyCreateResponse>({
      method: 'POST',
      path: '/key/unblock',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Rotate a virtual key, returning a new key value while preserving config (`POST /key/{key}/regenerate`).
   *
   * @param params - The current key plus optional overrides applied to the regenerated key.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly regenerated key and its metadata.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
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

  /**
   * Fetch info for a single virtual key (`GET /key/info?key=...`).
   *
   * @param key - The virtual key string to look up.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Metadata, budget, and usage info for the key.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
  info(key: string, options?: RequestOptions): Promise<KeyInfoResponse> {
    return this.request<KeyInfoResponse>({
      method: 'GET',
      path: '/key/info',
      options: { ...(options ?? {}), query: { ...(options?.query ?? {}), key } },
    });
  }

  /**
   * List virtual keys with optional filtering and pagination (`GET /key/list`).
   *
   * @param params - Optional filters (user_id, team_id, organization_id, page, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A paginated list of key records.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
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

  /**
   * Verify the calling key works against the configured providers (`POST /key/health`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-provider health status for the calling key.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
  health(options?: RequestOptions): Promise<KeyHealthResponse> {
    return this.request<KeyHealthResponse>({ method: 'POST', path: '/key/health', options });
  }

  /**
   * Create a service-account key (`POST /key/service-account/generate`).
   *
   * Service accounts are intended for machine-to-machine use and have no
   * associated user.
   *
   * @param params - Service-account key options.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly generated service-account key.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
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

  /**
   * Update many virtual keys in a single call (`POST /key/bulk_update`).
   *
   * @param params - Bulk update payload with per-key updates.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-key results including successes and any errors.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
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

  /**
   * Bulk-fetch info for multiple keys at once (`POST /v2/key/info`).
   *
   * @param params - Keys to look up plus optional response shaping flags.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Info entries keyed by virtual key.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
  infoV2(params: KeyInfoV2Params, options?: RequestOptions): Promise<KeyInfoV2Response> {
    return this.request<KeyInfoV2Response>({
      method: 'POST',
      path: '/v2/key/info',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Reset accumulated spend on a virtual key to zero (`POST /key/{key}/reset_spend`).
   *
   * @param key - The virtual key whose spend should be reset.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation of the reset including the prior spend value.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
  resetSpend(key: string, options?: RequestOptions): Promise<KeyResetSpendResponse> {
    return this.request<KeyResetSpendResponse>({
      method: 'POST',
      path: `/key/${encodeURIComponent(key)}/reset_spend`,
      options,
    });
  }

  /**
   * List all known key aliases (`GET /key/aliases`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A map of alias to key metadata.
   *
   * @see https://docs.litellm.ai/docs/proxy/virtual_keys
   */
  aliases(options?: RequestOptions): Promise<KeyAliasesResponse> {
    return this.request<KeyAliasesResponse>({ method: 'GET', path: '/key/aliases', options });
  }
}
