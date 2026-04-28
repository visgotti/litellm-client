import type { RerankCreateParams, RerankResponse } from '../types/rerank';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class RerankResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/rerank */
  create(params: RerankCreateParams, options?: RequestOptions): Promise<RerankResponse> {
    return this.request<RerankResponse>({
      method: 'POST',
      path: '/v1/rerank',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
