import type {
  ToolListParams,
  ToolListResponse,
  ToolTableRow,
  ToolDetailResponse,
  ToolPolicyOptionsResponse,
  ToolPolicyUpdateParams,
  ToolPolicyUpdateResponse,
  ToolUsageLogsParams,
  ToolUsageLogsResponse,
  ToolOverrideDeleteParams,
  ToolOverrideDeleteResponse,
} from '../types/tools';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Cross-provider tool registry — `/v1/tool/*` listing, detail and policy CRUD.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export class ToolsResource {
  constructor(private request: RequestFn) {}

  /**
   * List all auto-discovered tools and their policies (`GET /v1/tool/list`).
   *
   * @param params - Optional `input_policy` filter.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The tool list + total count.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
   */
  list(
    params: ToolListParams = {},
    options?: RequestOptions,
  ): Promise<ToolListResponse> {
    return this.request<ToolListResponse>({
      method: 'GET',
      path: '/v1/tool/list',
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
   * Get the available input/output policy options
   * (`GET /v1/tool/policy/options`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of allowed policy values + descriptions.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
   */
  policyOptions(options?: RequestOptions): Promise<ToolPolicyOptionsResponse> {
    return this.request<ToolPolicyOptionsResponse>({
      method: 'GET',
      path: '/v1/tool/policy/options',
      options,
    });
  }

  /**
   * Get a single tool's details (`GET /v1/tool/{tool_name}`).
   *
   * @param toolName - The tool name to look up.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The tool row.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
   */
  retrieve(toolName: string, options?: RequestOptions): Promise<ToolTableRow> {
    return this.request<ToolTableRow>({
      method: 'GET',
      path: `/v1/tool/${encodeURIComponent(toolName)}`,
      options,
    });
  }

  /**
   * Get a tool plus its policy overrides
   * (`GET /v1/tool/{tool_name}/detail`).
   *
   * @param toolName - The tool name to look up.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The tool row + override rows.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
   */
  detail(toolName: string, options?: RequestOptions): Promise<ToolDetailResponse> {
    return this.request<ToolDetailResponse>({
      method: 'GET',
      path: `/v1/tool/${encodeURIComponent(toolName)}/detail`,
      options,
    });
  }

  /**
   * Get usage logs for a tool (`GET /v1/tool/{tool_name}/logs`).
   *
   * @param toolName - The tool name to look up.
   * @param params - Pagination + optional date range.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Recent invocation rows.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
   */
  logs(
    toolName: string,
    params: ToolUsageLogsParams = {},
    options?: RequestOptions,
  ): Promise<ToolUsageLogsResponse> {
    return this.request<ToolUsageLogsResponse>({
      method: 'GET',
      path: `/v1/tool/${encodeURIComponent(toolName)}/logs`,
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
   * Update the input/output policy for a tool, or create a per-team /
   * per-key override (`POST /v1/tool/policy`).
   *
   * @param params - Tool name + policy fields + optional override scope.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation including the resulting policies.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
   */
  updatePolicy(
    params: ToolPolicyUpdateParams,
    options?: RequestOptions,
  ): Promise<ToolPolicyUpdateResponse> {
    return this.request<ToolPolicyUpdateResponse>({
      method: 'POST',
      path: '/v1/tool/policy',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Remove a per-team / per-key policy override
   * (`DELETE /v1/tool/{tool_name}/overrides`).
   *
   * @param toolName - The tool name the override applies to.
   * @param params - Override scope (`team_id` or `key_hash` required, exactly one).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
   */
  deleteOverride(
    toolName: string,
    params: ToolOverrideDeleteParams,
    options?: RequestOptions,
  ): Promise<ToolOverrideDeleteResponse> {
    return this.request<ToolOverrideDeleteResponse>({
      method: 'DELETE',
      path: `/v1/tool/${encodeURIComponent(toolName)}/overrides`,
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
