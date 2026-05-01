import type { EmbeddingCreateParams, EmbeddingResponse } from '../types/embeddings';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Engines-prefixed alias for `embeddings.create`
 * (`POST /engines/{engineId}/embeddings`). Preserved for clients that still
 * use OpenAI's deprecated engine-style routing.
 */
export class EmbeddingsEnginesResource {
  constructor(private request: RequestFn) {}

  create(
    engineId: string,
    params: EmbeddingCreateParams,
    options?: RequestOptions,
  ): Promise<EmbeddingResponse> {
    return this.request<EmbeddingResponse>({
      method: 'POST',
      path: `/engines/${encodeURIComponent(engineId)}/embeddings`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class EmbeddingsResource {
  readonly engines: EmbeddingsEnginesResource;

  constructor(private request: RequestFn) {
    this.engines = new EmbeddingsEnginesResource(request);
  }

  /**
   * Compute embedding vectors for one or more inputs.
   *
   * Accepts a single string, an array of strings, or pre-tokenized inputs in
   * `params.input`. The proxy routes the request to whichever embedding
   * provider backs `params.model`.
   *
   * @param params - Embedding request body containing `model` and `input`,
   *   plus optional knobs like `dimensions`, `encoding_format`, and `user`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The embedding response with one vector per input.
   *
   * @see https://docs.litellm.ai/docs/embedding/supported_embedding
   */
  create(
    params: EmbeddingCreateParams,
    options?: RequestOptions,
  ): Promise<EmbeddingResponse> {
    return this.request<EmbeddingResponse>({
      method: 'POST',
      path: '/v1/embeddings',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
