import type {
  InteractionCreateParams,
  InteractionDeletedResponse,
  InteractionObject,
} from '../types/interactions';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Top-level interactions API at `/interactions/...`. For Gemini's `/v1beta`
 * variant prefer `client.gemini.interactions`.
 *
 * @see https://docs.litellm.ai/docs/interactions
 */
export class InteractionsResource {
  constructor(private request: RequestFn) {}

  /**
   * Create an interaction (`POST /interactions`).
   *
   * @param params - Interaction creation payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created interaction record.
   */
  create(
    params: InteractionCreateParams,
    options?: RequestOptions,
  ): Promise<InteractionObject> {
    return this.request<InteractionObject>({
      method: 'POST',
      path: '/interactions',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Retrieve an interaction by id (`GET /interactions/{interaction_id}`).
   *
   * @param interactionId - The interaction id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The interaction record.
   */
  retrieve(
    interactionId: string,
    options?: RequestOptions,
  ): Promise<InteractionObject> {
    return this.request<InteractionObject>({
      method: 'GET',
      path: `/interactions/${encodeURIComponent(interactionId)}`,
      options,
    });
  }

  /**
   * Delete an interaction (`DELETE /interactions/{interaction_id}`).
   *
   * @param interactionId - The interaction id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A deletion confirmation payload.
   */
  delete(
    interactionId: string,
    options?: RequestOptions,
  ): Promise<InteractionDeletedResponse> {
    return this.request<InteractionDeletedResponse>({
      method: 'DELETE',
      path: `/interactions/${encodeURIComponent(interactionId)}`,
      options,
    });
  }

  /**
   * Cancel an in-flight interaction
   * (`POST /interactions/{interaction_id}/cancel`).
   *
   * @param interactionId - The interaction id to cancel.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The interaction record reflecting its cancelled state.
   */
  cancel(
    interactionId: string,
    options?: RequestOptions,
  ): Promise<InteractionObject> {
    return this.request<InteractionObject>({
      method: 'POST',
      path: `/interactions/${encodeURIComponent(interactionId)}/cancel`,
      options,
    });
  }
}
