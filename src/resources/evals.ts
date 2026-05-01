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

  /**
   * Start a new run of an eval.
   *
   * @param evalId - The id of the parent eval definition.
   * @param params - Run params: `name`, `data_source`, `metadata`, etc.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created `EvalRunObject`.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
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

  /**
   * List runs for an eval (paginated).
   *
   * @param evalId - The id of the parent eval definition.
   * @param params - Pagination/filter params (`after`, `limit`, `status`, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `EvalRunListResponse` page of runs.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
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

  /**
   * Retrieve a specific eval run.
   *
   * @param evalId - The id of the parent eval definition.
   * @param runId - The id of the run.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `EvalRunObject` with current status and results.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
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

  /**
   * Cancel an in-progress eval run.
   *
   * Note: this is the OpenAI-compatible POST on the run resource, which the
   * proxy treats as a cancel signal.
   *
   * @param evalId - The id of the parent eval definition.
   * @param runId - The id of the run to cancel.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `EvalRunCancelResponse` reflecting the cancelled state.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
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

  /**
   * Delete an eval run and its results.
   *
   * @param evalId - The id of the parent eval definition.
   * @param runId - The id of the run to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `EvalRunDeleteResponse` confirming removal.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
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

  /**
   * Create a new eval definition.
   *
   * Defines the testing criteria; runs against this eval are created via
   * `runs.create`.
   *
   * @param params - Eval definition: `name`, `data_source_config`,
   *   `testing_criteria`, optional `metadata`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created `EvalObject`.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
  create(params: EvalCreateParams, options?: RequestOptions): Promise<EvalObject> {
    return this.request<EvalObject>({
      method: 'POST',
      path: '/v1/evals',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List eval definitions (paginated).
   *
   * @param params - Pagination filters (`after`, `limit`, `order`, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `EvalListResponse` page of eval definitions.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
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

  /**
   * Retrieve an eval definition by id.
   *
   * @param evalId - The id of the eval.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `EvalObject`.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
  retrieve(evalId: string, options?: RequestOptions): Promise<EvalObject> {
    return this.request<EvalObject>({
      method: 'GET',
      path: `/v1/evals/${encodeURIComponent(evalId)}`,
      options,
    });
  }

  /**
   * Update an eval definition's metadata or configuration.
   *
   * @param evalId - The id of the eval to update.
   * @param params - Fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated `EvalObject`.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
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

  /**
   * Delete an eval definition and its associated runs.
   *
   * @param evalId - The id of the eval to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `EvalDeleteResponse` confirming removal.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
  delete(evalId: string, options?: RequestOptions): Promise<EvalDeleteResponse> {
    return this.request<EvalDeleteResponse>({
      method: 'DELETE',
      path: `/v1/evals/${encodeURIComponent(evalId)}`,
      options,
    });
  }

  /**
   * Cancel any in-progress runs associated with an eval.
   *
   * @param evalId - The id of the eval whose runs to cancel.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `EvalCancelResponse` describing the cancellation.
   *
   * @see https://docs.litellm.ai/docs/evals_api
   */
  cancel(evalId: string, options?: RequestOptions): Promise<EvalCancelResponse> {
    return this.request<EvalCancelResponse>({
      method: 'POST',
      path: `/v1/evals/${encodeURIComponent(evalId)}/cancel`,
      options,
    });
  }
}
