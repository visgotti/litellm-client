import type { ModerationCreateParams, ModerationResponse } from '../types/moderations';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class ModerationsResource {
  constructor(private request: RequestFn) {}

  /**
   * Run content moderation on one or more inputs.
   *
   * Returns category flags and scores for unsafe content per OpenAI-compatible
   * moderation models routed through the proxy.
   *
   * @param params - Moderation request body containing `input` (string or
   *   array) and an optional `model`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ModerationResponse` with one result per input.
   *
   * @see https://docs.litellm.ai/docs/moderation
   */
  create(
    params: ModerationCreateParams,
    options?: RequestOptions,
  ): Promise<ModerationResponse> {
    return this.request<ModerationResponse>({
      method: 'POST',
      path: '/v1/moderations',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
