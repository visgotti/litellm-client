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

  /** POST /v1/fine_tuning/jobs */
  create(params: FineTuningCreateParams, options?: RequestOptions): Promise<FineTuningJob> {
    return this.request<FineTuningJob>({
      method: 'POST',
      path: '/v1/fine_tuning/jobs',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1/fine_tuning/jobs */
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

  /** GET /v1/fine_tuning/jobs/{job_id} */
  retrieve(jobId: string, options?: RequestOptions): Promise<FineTuningJob> {
    return this.request<FineTuningJob>({
      method: 'GET',
      path: `/v1/fine_tuning/jobs/${encodeURIComponent(jobId)}`,
      options,
    });
  }

  /** POST /v1/fine_tuning/jobs/{job_id}/cancel */
  cancel(jobId: string, options?: RequestOptions): Promise<FineTuningJob> {
    return this.request<FineTuningJob>({
      method: 'POST',
      path: `/v1/fine_tuning/jobs/${encodeURIComponent(jobId)}/cancel`,
      options,
    });
  }

  /** GET /v1/fine_tuning/jobs/{job_id}/events */
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
