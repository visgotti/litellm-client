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

  /**
   * Fetch the A2A agent card describing capabilities and endpoints.
   *
   * @param agentId - The A2A agent identifier whose card to retrieve.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The agent card document.
   *
   * @see https://docs.litellm.ai/docs/a2a
   */
  card(agentId: string, options?: RequestOptions): Promise<A2AAgentCardResponse> {
    return this.request<A2AAgentCardResponse>({
      method: 'GET',
      path: `/a2a/${encodeURIComponent(agentId)}/.well-known/agent-card.json`,
      options,
    });
  }

  /**
   * Invoke an A2A agent by id (generic JSON-RPC-style request).
   *
   * @param agentId - The A2A agent identifier to invoke.
   * @param params - The invocation payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The agent's response.
   *
   * @see https://docs.litellm.ai/docs/a2a
   */
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

  /**
   * Send a message to an A2A agent through the legacy `/a2a` route.
   *
   * @param agentId - The A2A agent identifier.
   * @param params - The message payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The agent's message response.
   *
   * @see https://docs.litellm.ai/docs/a2a
   */
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

  /**
   * Send a message to an A2A agent through the `/v1/a2a` route.
   *
   * Functionally equivalent to {@link sendMessage} but uses the v1-prefixed path.
   *
   * @param agentId - The A2A agent identifier.
   * @param params - The message payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The agent's message response.
   *
   * @see https://docs.litellm.ai/docs/a2a
   */
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
