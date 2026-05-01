import type {
  AgentCreateParams,
  AgentUpdateParams,
  AgentPatchParams,
  AgentResponse,
  AgentListResponse,
  AgentListParams,
  AgentDeleteResponse,
  AgentMakePublicResponse,
  AgentMakePublicBulkParams,
  AgentDailyActivityParams,
  AgentDailyActivityResponse,
} from '../types/agents';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class AgentsResource {
  constructor(private request: RequestFn) {}

  /**
   * List agents visible to the caller.
   *
   * @param params - Optional pagination/filter parameters forwarded as query string entries.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of agent records.
   *
   * @see https://docs.litellm.ai/docs/proxy/agent
   */
  list(
    params: AgentListParams = {},
    options?: RequestOptions,
  ): Promise<AgentListResponse> {
    return this.request<AgentListResponse>({
      method: 'GET',
      path: '/v1/agents',
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
   * Create a new agent configuration.
   *
   * @param params - The agent creation payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The persisted agent record.
   *
   * @see https://docs.litellm.ai/docs/proxy/agent
   */
  create(params: AgentCreateParams, options?: RequestOptions): Promise<AgentResponse> {
    return this.request<AgentResponse>({
      method: 'POST',
      path: '/v1/agents',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Retrieve a single agent by id.
   *
   * @param agentId - The agent identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The agent record.
   *
   * @see https://docs.litellm.ai/docs/proxy/agent
   */
  retrieve(agentId: string, options?: RequestOptions): Promise<AgentResponse> {
    return this.request<AgentResponse>({
      method: 'GET',
      path: `/v1/agents/${encodeURIComponent(agentId)}`,
      options,
    });
  }

  /**
   * Replace an agent's configuration (full update).
   *
   * @param agentId - The agent identifier to update.
   * @param params - The full replacement payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated agent record.
   *
   * @see https://docs.litellm.ai/docs/proxy/agent
   */
  update(
    agentId: string,
    params: AgentUpdateParams,
    options?: RequestOptions,
  ): Promise<AgentResponse> {
    return this.request<AgentResponse>({
      method: 'PUT',
      path: `/v1/agents/${encodeURIComponent(agentId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Partially update an agent's configuration.
   *
   * @param agentId - The agent identifier to patch.
   * @param params - A partial update payload (only supplied fields are applied).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated agent record.
   *
   * @see https://docs.litellm.ai/docs/proxy/agent
   */
  patch(
    agentId: string,
    params: AgentPatchParams,
    options?: RequestOptions,
  ): Promise<AgentResponse> {
    return this.request<AgentResponse>({
      method: 'PATCH',
      path: `/v1/agents/${encodeURIComponent(agentId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete an agent by id.
   *
   * @param agentId - The agent identifier to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A deletion confirmation payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/agent
   */
  delete(agentId: string, options?: RequestOptions): Promise<AgentDeleteResponse> {
    return this.request<AgentDeleteResponse>({
      method: 'DELETE',
      path: `/v1/agents/${encodeURIComponent(agentId)}`,
      options,
    });
  }

  /**
   * Mark a single agent as publicly accessible.
   *
   * @param agentId - The agent identifier to publish.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A summary of the publish operation.
   *
   * @see https://docs.litellm.ai/docs/proxy/agent
   */
  makePublic(
    agentId: string,
    options?: RequestOptions,
  ): Promise<AgentMakePublicResponse> {
    return this.request<AgentMakePublicResponse>({
      method: 'POST',
      path: `/v1/agents/${encodeURIComponent(agentId)}/make_public`,
      options,
    });
  }

  /**
   * Mark multiple agents as public in a single request.
   *
   * @param params - The set of agent ids to publish, plus visibility options.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A summary of the publish operation.
   *
   * @see https://docs.litellm.ai/docs/proxy/agent
   */
  makePublicBulk(
    params: AgentMakePublicBulkParams,
    options?: RequestOptions,
  ): Promise<AgentMakePublicResponse> {
    return this.request<AgentMakePublicResponse>({
      method: 'POST',
      path: '/v1/agents/make_public',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Fetch daily activity rollups for agents (request counts, costs, etc.).
   *
   * @param params - Optional date-range and grouping filters forwarded as query entries.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The daily activity series.
   *
   * @see https://docs.litellm.ai/docs/proxy/agent
   */
  dailyActivity(
    params: AgentDailyActivityParams = {},
    options?: RequestOptions,
  ): Promise<AgentDailyActivityResponse> {
    return this.request<AgentDailyActivityResponse>({
      method: 'GET',
      path: '/agent/daily/activity',
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
