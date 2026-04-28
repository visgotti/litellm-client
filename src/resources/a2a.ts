import type {
  A2AAgentCardResponse,
  A2AInvokeParams,
  A2AInvokeResponse,
  A2ASendMessageParams,
  A2ASendMessageResponse,
} from '../types/a2a';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class A2AResource {
  constructor(private request: RequestFn) {}

  /** GET /a2a/{agent_id}/.well-known/agent-card.json */
  card(agentId: string, options?: RequestOptions): Promise<A2AAgentCardResponse> {
    return this.request<A2AAgentCardResponse>({
      method: 'GET',
      path: `/a2a/${encodeURIComponent(agentId)}/.well-known/agent-card.json`,
      options,
    });
  }

  /** POST /a2a/{agent_id} */
  invoke(
    agentId: string,
    params: A2AInvokeParams,
    options?: RequestOptions,
  ): Promise<A2AInvokeResponse> {
    return this.request<A2AInvokeResponse>({
      method: 'POST',
      path: `/a2a/${encodeURIComponent(agentId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /a2a/{agent_id}/message/send */
  sendMessage(
    agentId: string,
    params: A2ASendMessageParams,
    options?: RequestOptions,
  ): Promise<A2ASendMessageResponse> {
    return this.request<A2ASendMessageResponse>({
      method: 'POST',
      path: `/a2a/${encodeURIComponent(agentId)}/message/send`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /v1/a2a/{agent_id}/message/send */
  sendMessageV1(
    agentId: string,
    params: A2ASendMessageParams,
    options?: RequestOptions,
  ): Promise<A2ASendMessageResponse> {
    return this.request<A2ASendMessageResponse>({
      method: 'POST',
      path: `/v1/a2a/${encodeURIComponent(agentId)}/message/send`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}
