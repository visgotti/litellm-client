import type {
  BatchObject,
  BatchCreateParams,
  BatchListParams,
  BatchListResponse,
} from '../types/batches';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class BatchesResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/batches */
  create(params: BatchCreateParams, options?: RequestOptions): Promise<BatchObject> {
    return this.request<BatchObject>({
      method: 'POST',
      path: '/v1/batches',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1/batches */
  list(params: BatchListParams = {}, options?: RequestOptions): Promise<BatchListResponse> {
    return this.request<BatchListResponse>({
      method: 'GET',
      path: '/v1/batches',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /v1/batches/{batch_id} */
  retrieve(batchId: string, options?: RequestOptions): Promise<BatchObject> {
    return this.request<BatchObject>({
      method: 'GET',
      path: `/v1/batches/${encodeURIComponent(batchId)}`,
      options,
    });
  }

  /** POST /v1/batches/{batch_id}/cancel */
  cancel(batchId: string, options?: RequestOptions): Promise<BatchObject> {
    return this.request<BatchObject>({
      method: 'POST',
      path: `/v1/batches/${encodeURIComponent(batchId)}/cancel`,
      options,
    });
  }
}
