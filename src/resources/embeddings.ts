import type { EmbeddingCreateParams, EmbeddingResponse } from '../types/embeddings';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class EmbeddingsResource {
  constructor(private request: RequestFn) {}

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
