import type {
  EvalObject,
  EvalCreateParams,
  EvalUpdateParams,
  EvalListParams,
  EvalListResponse,
  EvalDeleteResponse,
  EvalCancelResponse,
  EvalRunObject,
  EvalRunCreateParams,
  EvalRunListParams,
  EvalRunListResponse,
  EvalRunCancelResponse,
  EvalRunDeleteResponse,
} from '../types/evals';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

class EvalRunsResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/evals/{eval_id}/runs */
  create(
    evalId: string,
    params: EvalRunCreateParams,
    options?: RequestOptions,
  ): Promise<EvalRunObject> {
    return this.request<EvalRunObject>({
      method: 'POST',
      path: `/v1/evals/${encodeURIComponent(evalId)}/runs`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1/evals/{eval_id}/runs */
  list(
    evalId: string,
    params: EvalRunListParams = {},
    options?: RequestOptions,
  ): Promise<EvalRunListResponse> {
    return this.request<EvalRunListResponse>({
      method: 'GET',
      path: `/v1/evals/${encodeURIComponent(evalId)}/runs`,
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /v1/evals/{eval_id}/runs/{run_id} */
  retrieve(
    evalId: string,
    runId: string,
    options?: RequestOptions,
  ): Promise<EvalRunObject> {
    return this.request<EvalRunObject>({
      method: 'GET',
      path: `/v1/evals/${encodeURIComponent(evalId)}/runs/${encodeURIComponent(runId)}`,
      options,
    });
  }

  /** POST /v1/evals/{eval_id}/runs/{run_id} */
  cancel(
    evalId: string,
    runId: string,
    options?: RequestOptions,
  ): Promise<EvalRunCancelResponse> {
    return this.request<EvalRunCancelResponse>({
      method: 'POST',
      path: `/v1/evals/${encodeURIComponent(evalId)}/runs/${encodeURIComponent(runId)}`,
      options,
    });
  }

  /** DELETE /v1/evals/{eval_id}/runs/{run_id} */
  delete(
    evalId: string,
    runId: string,
    options?: RequestOptions,
  ): Promise<EvalRunDeleteResponse> {
    return this.request<EvalRunDeleteResponse>({
      method: 'DELETE',
      path: `/v1/evals/${encodeURIComponent(evalId)}/runs/${encodeURIComponent(runId)}`,
      options,
    });
  }
}

export class EvalsResource {
  readonly runs: EvalRunsResource;

  constructor(private request: RequestFn) {
    this.runs = new EvalRunsResource(request);
  }

  /** POST /v1/evals */
  create(params: EvalCreateParams, options?: RequestOptions): Promise<EvalObject> {
    return this.request<EvalObject>({
      method: 'POST',
      path: '/v1/evals',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1/evals */
  list(params: EvalListParams = {}, options?: RequestOptions): Promise<EvalListResponse> {
    return this.request<EvalListResponse>({
      method: 'GET',
      path: '/v1/evals',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /v1/evals/{eval_id} */
  retrieve(evalId: string, options?: RequestOptions): Promise<EvalObject> {
    return this.request<EvalObject>({
      method: 'GET',
      path: `/v1/evals/${encodeURIComponent(evalId)}`,
      options,
    });
  }

  /** POST /v1/evals/{eval_id} */
  update(
    evalId: string,
    params: EvalUpdateParams,
    options?: RequestOptions,
  ): Promise<EvalObject> {
    return this.request<EvalObject>({
      method: 'POST',
      path: `/v1/evals/${encodeURIComponent(evalId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** DELETE /v1/evals/{eval_id} */
  delete(evalId: string, options?: RequestOptions): Promise<EvalDeleteResponse> {
    return this.request<EvalDeleteResponse>({
      method: 'DELETE',
      path: `/v1/evals/${encodeURIComponent(evalId)}`,
      options,
    });
  }

  /** POST /v1/evals/{eval_id}/cancel */
  cancel(evalId: string, options?: RequestOptions): Promise<EvalCancelResponse> {
    return this.request<EvalCancelResponse>({
      method: 'POST',
      path: `/v1/evals/${encodeURIComponent(evalId)}/cancel`,
      options,
    });
  }
}
