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

  /**
   * Create a batch job from a previously uploaded JSONL input file.
   *
   * The `params.input_file_id` must reference a file uploaded via
   * `files.create({ purpose: 'batch' })`.
   *
   * @param params - Batch request body: `input_file_id`, `endpoint`,
   *   `completion_window`, plus optional `metadata`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created `BatchObject` describing job status.
   *
   * @see https://docs.litellm.ai/docs/batches
   */
  create(params: BatchCreateParams, options?: RequestOptions): Promise<BatchObject> {
    return this.request<BatchObject>({
      method: 'POST',
      path: '/v1/batches',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List batch jobs (paginated).
   *
   * @param params - Pagination filters (`after`, `limit`, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `BatchListResponse` page of `BatchObject`s.
   *
   * @see https://docs.litellm.ai/docs/batches
   */
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

  /**
   * Retrieve the current state of a batch job.
   *
   * @param batchId - The id returned from `create`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `BatchObject` with current status, counts, and output file ids.
   *
   * @see https://docs.litellm.ai/docs/batches
   */
  retrieve(batchId: string, options?: RequestOptions): Promise<BatchObject> {
    return this.request<BatchObject>({
      method: 'GET',
      path: `/v1/batches/${encodeURIComponent(batchId)}`,
      options,
    });
  }

  /**
   * Cancel a running batch job.
   *
   * Transitions the batch to `cancelling` and ultimately `cancelled`. Already
   * completed batches cannot be cancelled.
   *
   * @param batchId - The id of the batch to cancel.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated `BatchObject` reflecting the cancellation.
   *
   * @see https://docs.litellm.ai/docs/batches
   */
  cancel(batchId: string, options?: RequestOptions): Promise<BatchObject> {
    return this.request<BatchObject>({
      method: 'POST',
      path: `/v1/batches/${encodeURIComponent(batchId)}/cancel`,
      options,
    });
  }
}
