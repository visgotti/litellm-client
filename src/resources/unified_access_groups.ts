import type {
  UnifiedAccessGroup,
  UnifiedAccessGroupCreateParams,
  UnifiedAccessGroupListParams,
  UnifiedAccessGroupListResponse,
  UnifiedAccessGroupUpdateParams,
} from '../types/unified_access_groups';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Unified access groups under `/v1/unified_access_group/...` — bundles models,
 * MCP servers, and vector stores into a single named permission unit that can
 * be granted to teams/keys.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/unified_access_group.py
 */
export class UnifiedAccessGroupsResource {
  constructor(private request: RequestFn) {}

  /**
   * List unified access groups (`GET /v1/unified_access_group`).
   *
   * @param params - Optional query filter (e.g. `access_group_name`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of unified access groups.
   */
  list(
    params: UnifiedAccessGroupListParams = {},
    options?: RequestOptions,
  ): Promise<UnifiedAccessGroupListResponse> {
    return this.request<UnifiedAccessGroupListResponse>({
      method: 'GET',
      path: '/v1/unified_access_group',
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
   * Create a unified access group (`POST /v1/unified_access_group`).
   *
   * @param params - Group attributes (name + included resources).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created group record.
   */
  create(
    params: UnifiedAccessGroupCreateParams,
    options?: RequestOptions,
  ): Promise<UnifiedAccessGroup> {
    return this.request<UnifiedAccessGroup>({
      method: 'POST',
      path: '/v1/unified_access_group',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Retrieve a unified access group by id
   * (`GET /v1/unified_access_group/{access_group_id}`).
   *
   * @param accessGroupId - The group identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The group record.
   */
  retrieve(
    accessGroupId: string,
    options?: RequestOptions,
  ): Promise<UnifiedAccessGroup> {
    return this.request<UnifiedAccessGroup>({
      method: 'GET',
      path: `/v1/unified_access_group/${encodeURIComponent(accessGroupId)}`,
      options,
    });
  }

  /**
   * Update a unified access group
   * (`PUT /v1/unified_access_group/{access_group_id}`).
   *
   * @param accessGroupId - The group identifier to update.
   * @param params - Fields to replace.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated group record.
   */
  update(
    accessGroupId: string,
    params: UnifiedAccessGroupUpdateParams,
    options?: RequestOptions,
  ): Promise<UnifiedAccessGroup> {
    return this.request<UnifiedAccessGroup>({
      method: 'PUT',
      path: `/v1/unified_access_group/${encodeURIComponent(accessGroupId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a unified access group
   * (`DELETE /v1/unified_access_group/{access_group_id}`).
   *
   * @param accessGroupId - The group identifier to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation payload.
   */
  delete(
    accessGroupId: string,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'DELETE',
      path: `/v1/unified_access_group/${encodeURIComponent(accessGroupId)}`,
      options,
    });
  }
}
