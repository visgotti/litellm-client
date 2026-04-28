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

  /** GET /v1/agents */
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

  /** POST /v1/agents */
  create(params: AgentCreateParams, options?: RequestOptions): Promise<AgentResponse> {
    return this.request<AgentResponse>({
      method: 'POST',
      path: '/v1/agents',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1/agents/{agent_id} */
  retrieve(agentId: string, options?: RequestOptions): Promise<AgentResponse> {
    return this.request<AgentResponse>({
      method: 'GET',
      path: `/v1/agents/${encodeURIComponent(agentId)}`,
      options,
    });
  }

  /** PUT /v1/agents/{agent_id} */
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

  /** PATCH /v1/agents/{agent_id} */
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

  /** DELETE /v1/agents/{agent_id} */
  delete(agentId: string, options?: RequestOptions): Promise<AgentDeleteResponse> {
    return this.request<AgentDeleteResponse>({
      method: 'DELETE',
      path: `/v1/agents/${encodeURIComponent(agentId)}`,
      options,
    });
  }

  /** POST /v1/agents/{agent_id}/make_public */
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

  /** POST /v1/agents/make_public */
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

  /** GET /agent/daily/activity */
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
