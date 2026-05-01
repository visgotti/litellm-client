import type {
  FineTuningJob,
  FineTuningCreateParams,
  FineTuningListParams,
  FineTuningListResponse,
  FineTuningEventsResponse,
} from '../types/fine_tuning';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

class FineTuningJobsResource {
  constructor(private request: RequestFn) {}

  /**
   * Start a new fine-tuning job.
   *
   * The `training_file` (and optional `validation_file`) must be uploaded
   * via `files.create({ purpose: 'fine-tune' })` first.
   *
   * @param params - Fine-tune request: `model`, `training_file`, plus
   *   optional `hyperparameters`, `suffix`, and provider-specific fields.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created `FineTuningJob`.
   *
   * @see https://docs.litellm.ai/docs/fine_tuning
   */
  create(params: FineTuningCreateParams, options?: RequestOptions): Promise<FineTuningJob> {
    return this.request<FineTuningJob>({
      method: 'POST',
      path: '/v1/fine_tuning/jobs',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List fine-tuning jobs (paginated).
   *
   * @param params - Pagination filters (`after`, `limit`, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `FineTuningListResponse` page of jobs.
   *
   * @see https://docs.litellm.ai/docs/fine_tuning
   */
  list(
    params: FineTuningListParams = {},
    options?: RequestOptions,
  ): Promise<FineTuningListResponse> {
    return this.request<FineTuningListResponse>({
      method: 'GET',
      path: '/v1/fine_tuning/jobs',
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
   * Retrieve a fine-tuning job's current state.
   *
   * @param jobId - The id returned from `create`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `FineTuningJob` with status, fine-tuned model id, etc.
   *
   * @see https://docs.litellm.ai/docs/fine_tuning
   */
  retrieve(jobId: string, options?: RequestOptions): Promise<FineTuningJob> {
    return this.request<FineTuningJob>({
      method: 'GET',
      path: `/v1/fine_tuning/jobs/${encodeURIComponent(jobId)}`,
      options,
    });
  }

  /**
   * Cancel a running fine-tuning job.
   *
   * @param jobId - The id of the job to cancel.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated `FineTuningJob` reflecting the cancellation.
   *
   * @see https://docs.litellm.ai/docs/fine_tuning
   */
  cancel(jobId: string, options?: RequestOptions): Promise<FineTuningJob> {
    return this.request<FineTuningJob>({
      method: 'POST',
      path: `/v1/fine_tuning/jobs/${encodeURIComponent(jobId)}/cancel`,
      options,
    });
  }

  /**
   * List training events for a fine-tuning job (paginated).
   *
   * @param jobId - The id of the job whose events to fetch.
   * @param params - Pagination filters: `after` cursor and `limit`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `FineTuningEventsResponse` page of training-progress events.
   *
   * @see https://docs.litellm.ai/docs/fine_tuning
   */
  events(
    jobId: string,
    params: { after?: string; limit?: number } = {},
    options?: RequestOptions,
  ): Promise<FineTuningEventsResponse> {
    return this.request<FineTuningEventsResponse>({
      method: 'GET',
      path: `/v1/fine_tuning/jobs/${encodeURIComponent(jobId)}/events`,
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }
}

export class FineTuningResource {
  readonly jobs: FineTuningJobsResource;

  constructor(request: RequestFn) {
    this.jobs = new FineTuningJobsResource(request);
  }
}
