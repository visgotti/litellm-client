import type {
  PassThroughEndpointDefinition,
  PassThroughEndpointResponse,
  PassThroughEndpointListParams,
  PassThroughEndpointDeleteParams,
} from '../types/pass_through_config';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Admin CRUD for custom pass-through endpoints registered at runtime.
 *
 * Distinct from `client.passThrough.*` (which serves passthrough requests) —
 * this resource manages the pass-through endpoint definitions stored in
 * proxy config.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/pass_through_endpoints/pass_through_endpoints.py
 */
export class PassThroughConfigResource {
  constructor(private request: RequestFn) {}

  /**
   * List configured pass-through endpoints
   * (`GET /config/pass_through_endpoint`).
   *
   * @param params - Optional `endpoint_id` filter.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The endpoint list.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/pass_through_endpoints/pass_through_endpoints.py
   */
  list(
    params: PassThroughEndpointListParams = {},
    options?: RequestOptions,
  ): Promise<PassThroughEndpointResponse> {
    return this.request<PassThroughEndpointResponse>({
      method: 'GET',
      path: '/config/pass_through_endpoint',
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
   * List the pass-through endpoints visible to a specific team
   * (`GET /config/pass_through_endpoint/team/{team_id}`).
   *
   * @param teamId - The team id to filter by.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The team-visible endpoint list.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/pass_through_endpoints/pass_through_endpoints.py
   */
  listForTeam(
    teamId: string,
    options?: RequestOptions,
  ): Promise<PassThroughEndpointResponse> {
    return this.request<PassThroughEndpointResponse>({
      method: 'GET',
      path: `/config/pass_through_endpoint/team/${encodeURIComponent(teamId)}`,
      options,
    });
  }

  /**
   * Register a new pass-through endpoint
   * (`POST /config/pass_through_endpoint`).
   *
   * @param params - Endpoint definition (path, target, headers, methods…).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created endpoint definition (with an auto-generated id).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/pass_through_endpoints/pass_through_endpoints.py
   */
  create(
    params: PassThroughEndpointDefinition,
    options?: RequestOptions,
  ): Promise<PassThroughEndpointResponse> {
    return this.request<PassThroughEndpointResponse>({
      method: 'POST',
      path: '/config/pass_through_endpoint',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing pass-through endpoint by id
   * (`POST /config/pass_through_endpoint/{endpoint_id}`).
   *
   * @param endpointId - The endpoint id.
   * @param params - Replacement definition (only non-null fields applied).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated endpoint definition.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/pass_through_endpoints/pass_through_endpoints.py
   */
  update(
    endpointId: string,
    params: PassThroughEndpointDefinition,
    options?: RequestOptions,
  ): Promise<PassThroughEndpointResponse> {
    return this.request<PassThroughEndpointResponse>({
      method: 'POST',
      path: `/config/pass_through_endpoint/${encodeURIComponent(endpointId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a pass-through endpoint by id
   * (`DELETE /config/pass_through_endpoint`).
   *
   * @param params - The `endpoint_id` to delete (passed as a query parameter).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The deleted endpoint definition.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/pass_through_endpoints/pass_through_endpoints.py
   */
  delete(
    params: PassThroughEndpointDeleteParams,
    options?: RequestOptions,
  ): Promise<PassThroughEndpointResponse> {
    return this.request<PassThroughEndpointResponse>({
      method: 'DELETE',
      path: '/config/pass_through_endpoint',
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
