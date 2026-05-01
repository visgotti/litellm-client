import type {
  JwtKeyMappingResponse,
  JwtKeyMappingCreateParams,
  JwtKeyMappingUpdateParams,
  JwtKeyMappingDeleteParams,
  JwtKeyMappingListResponse,
  JwtKeyMappingListParams,
} from '../types/jwt';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * JWT-claim → virtual-key mapping CRUD — `/jwt/key/mapping/*`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
 */
export class JwtKeyMappingResource {
  constructor(private request: RequestFn) {}

  /**
   * Create a new JWT-claim → virtual-key mapping
   * (`POST /jwt/key/mapping/new`).
   *
   * @param params - Claim name + value + virtual key.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created mapping (token redacted).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
   */
  create(
    params: JwtKeyMappingCreateParams,
    options?: RequestOptions,
  ): Promise<JwtKeyMappingResponse> {
    return this.request<JwtKeyMappingResponse>({
      method: 'POST',
      path: '/jwt/key/mapping/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing JWT key mapping (`POST /jwt/key/mapping/update`).
   *
   * @param params - Mapping id + fields to patch.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated mapping (token redacted).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
   */
  update(
    params: JwtKeyMappingUpdateParams,
    options?: RequestOptions,
  ): Promise<JwtKeyMappingResponse> {
    return this.request<JwtKeyMappingResponse>({
      method: 'POST',
      path: '/jwt/key/mapping/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a JWT key mapping (`POST /jwt/key/mapping/delete`).
   *
   * @param params - Mapping id to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns `{ status: "success" }` on success.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
   */
  delete(
    params: JwtKeyMappingDeleteParams,
    options?: RequestOptions,
  ): Promise<{ status: string; [key: string]: unknown }> {
    return this.request<{ status: string; [key: string]: unknown }>({
      method: 'POST',
      path: '/jwt/key/mapping/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List JWT key mappings, paginated (`GET /jwt/key/mapping/list`).
   *
   * @param params - Optional pagination.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of mappings + total count.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
   */
  list(
    params: JwtKeyMappingListParams = {},
    options?: RequestOptions,
  ): Promise<JwtKeyMappingListResponse> {
    return this.request<JwtKeyMappingListResponse>({
      method: 'GET',
      path: '/jwt/key/mapping/list',
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
   * Look up a JWT key mapping by id (`GET /jwt/key/mapping/info`).
   *
   * @param id - The mapping id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The mapping (token redacted).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
   */
  retrieve(id: string, options?: RequestOptions): Promise<JwtKeyMappingResponse> {
    return this.request<JwtKeyMappingResponse>({
      method: 'GET',
      path: '/jwt/key/mapping/info',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), id } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }
}
