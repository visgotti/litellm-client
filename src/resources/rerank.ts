import type { RerankCreateParams, RerankResponse } from '../types/rerank';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class RerankResource {
  constructor(private request: RequestFn) {}

  /**
   * Rerank a list of documents against a query.
   *
   * Wraps the Cohere-style rerank API exposed by the proxy across supported
   * providers.
   *
   * @param params - Rerank request body with `model`, `query`, `documents`,
   *   and optional `top_n`, `rank_fields`, `return_documents`, and `max_chunks_per_doc`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `RerankResponse` with documents sorted by relevance score.
   *
   * @see https://docs.litellm.ai/docs/rerank
   */
  create(params: RerankCreateParams, options?: RequestOptions): Promise<RerankResponse> {
    return this.request<RerankResponse>({
      method: 'POST',
      path: '/v1/rerank',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
