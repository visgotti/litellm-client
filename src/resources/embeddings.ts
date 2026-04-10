import type { EmbeddingCreateParams, EmbeddingResponse } from '../types/embeddings';
import type { RequestFn } from '../client';

export class EmbeddingsResource {
  constructor(private request: RequestFn) {}

  async create(params: EmbeddingCreateParams): Promise<EmbeddingResponse> {
    return this.request<EmbeddingResponse>('POST', '/v1/embeddings', params);
  }
}
