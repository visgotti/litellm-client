import type {
  FallbackCreateParams,
  FallbackResponse,
  FallbackGetResponse,
  FallbackDeleteResponse,
  FallbackQueryParams,
} from '../types/fallbacks';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Runtime fallback configuration — `/fallback` CRUD.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/fallback_management_endpoints.py
 */
export class FallbacksResource {
  constructor(private request: RequestFn) {}

  /**
   * Create or update fallbacks for a specific model (`POST /fallback`).
   *
   * @param params - Primary model + fallback list + fallback type.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation including the stored fallback list.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/fallback_management_endpoints.py
   */
  create(
    params: FallbackCreateParams,
    options?: RequestOptions,
  ): Promise<FallbackResponse> {
    return this.request<FallbackResponse>({
      method: 'POST',
      path: '/fallback',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Retrieve the fallbacks configured for a specific model
   * (`GET /fallback/{model}`).
   *
   * @param model - Primary model name.
   * @param params - Optional `fallback_type` filter (defaults to `general`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The configured fallback list.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/fallback_management_endpoints.py
   */
  retrieve(
    model: string,
    params: FallbackQueryParams = {},
    options?: RequestOptions,
  ): Promise<FallbackGetResponse> {
    return this.request<FallbackGetResponse>({
      method: 'GET',
      path: `/fallback/${encodeURIComponent(model)}`,
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
   * Delete the fallback configuration for a specific model
   * (`DELETE /fallback/{model}`).
   *
   * @param model - Primary model name.
   * @param params - Optional `fallback_type` filter (defaults to `general`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/fallback_management_endpoints.py
   */
  delete(
    model: string,
    params: FallbackQueryParams = {},
    options?: RequestOptions,
  ): Promise<FallbackDeleteResponse> {
    return this.request<FallbackDeleteResponse>({
      method: 'DELETE',
      path: `/fallback/${encodeURIComponent(model)}`,
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }
}
