import type {
  ModelListResponse,
  ModelInfoResponse,
  ModelCreateParams,
  ModelCreateResponse,
  ModelDeleteParams,
  ModelDeleteResponse,
  ModelUpdateParams,
  ModelUpdateResponse,
  ModelGroupInfoResponse,
  ModelInfoV2Response,
  ModelSettingsResponse,
  ModelMetricsResponse,
  ModelStreamingMetricsResponse,
  ModelSlowResponsesResponse,
  ModelExceptionsResponse,
  ModelGroupMakePublicParams,
  ModelHubUpdateLinksParams,
  ModelCostMapSourceResponse,
  ModelCostMapReloadResponse,
  ModelCostMapScheduleParams,
  ModelCostMapScheduleStatusResponse,
} from '../types/models';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class ModelsResource {
  constructor(private request: RequestFn) {}

  /**
   * OpenAI-compatible model list (`GET /v1/models`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The OpenAI-style models list.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  list(options?: RequestOptions): Promise<ModelListResponse> {
    return this.request<ModelListResponse>({ method: 'GET', path: '/v1/models', options });
  }

  /**
   * Full LiteLLM model info, including params and metadata (`GET /model/info`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Detailed model info entries.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  info(options?: RequestOptions): Promise<ModelInfoResponse> {
    return this.request<ModelInfoResponse>({ method: 'GET', path: '/model/info', options });
  }

  /**
   * v2 model info with richer per-model fields (`GET /v2/model/info`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns v2 model info entries.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  infoV2(options?: RequestOptions): Promise<ModelInfoV2Response> {
    return this.request<ModelInfoV2Response>({ method: 'GET', path: '/v2/model/info', options });
  }

  /**
   * Model info aggregated by model group (`GET /model_group/info`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-group aggregated model info.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  groupInfo(options?: RequestOptions): Promise<ModelGroupInfoResponse> {
    return this.request<ModelGroupInfoResponse>({
      method: 'GET',
      path: '/model_group/info',
      options,
    });
  }

  /**
   * Register a new model deployment at runtime (`POST /model/new`).
   *
   * @param params - Model name, `litellm_params`, and any model_info metadata.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly registered model record.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  create(params: ModelCreateParams, options?: RequestOptions): Promise<ModelCreateResponse> {
    return this.request<ModelCreateResponse>({
      method: 'POST',
      path: '/model/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing model deployment (`POST /model/update`).
   *
   * @param params - Model identifier plus fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated model record.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  update(params: ModelUpdateParams, options?: RequestOptions): Promise<ModelUpdateResponse> {
    return this.request<ModelUpdateResponse>({
      method: 'POST',
      path: '/model/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Partial update of a model by id (`PATCH /model/{model_id}/update`).
   *
   * @param modelId - The model id to patch.
   * @param params - Partial set of fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated model record.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  patchUpdate(
    modelId: string,
    params: Partial<ModelUpdateParams>,
    options?: RequestOptions,
  ): Promise<ModelUpdateResponse> {
    return this.request<ModelUpdateResponse>({
      method: 'PATCH',
      path: `/model/${encodeURIComponent(modelId)}/update`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a model deployment (`POST /model/delete`).
   *
   * @param params - The model to delete (by id).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  delete(params: ModelDeleteParams, options?: RequestOptions): Promise<ModelDeleteResponse> {
    return this.request<ModelDeleteResponse>({
      method: 'POST',
      path: '/model/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Get provider/model defaults from the proxy config (`GET /model/settings`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The provider/model default settings.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  settings(options?: RequestOptions): Promise<ModelSettingsResponse> {
    return this.request<ModelSettingsResponse>({
      method: 'GET',
      path: '/model/settings',
      options,
    });
  }

  /**
   * Per-model latency and usage metrics (`GET /model/metrics`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-model metrics.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  metrics(options?: RequestOptions): Promise<ModelMetricsResponse> {
    return this.request<ModelMetricsResponse>({ method: 'GET', path: '/model/metrics', options });
  }

  /**
   * Per-model streaming metrics (`GET /model/streaming_metrics`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-model streaming metrics.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  streamingMetrics(options?: RequestOptions): Promise<ModelStreamingMetricsResponse> {
    return this.request<ModelStreamingMetricsResponse>({
      method: 'GET',
      path: '/model/streaming_metrics',
      options,
    });
  }

  /**
   * Slowest responses observed per model (`GET /model/metrics/slow_responses`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-model slow response samples.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  slowResponses(options?: RequestOptions): Promise<ModelSlowResponsesResponse> {
    return this.request<ModelSlowResponsesResponse>({
      method: 'GET',
      path: '/model/metrics/slow_responses',
      options,
    });
  }

  /**
   * Recent exceptions per model (`GET /model/metrics/exceptions`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-model exception summaries.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  exceptions(options?: RequestOptions): Promise<ModelExceptionsResponse> {
    return this.request<ModelExceptionsResponse>({
      method: 'GET',
      path: '/model/metrics/exceptions',
      options,
    });
  }

  /**
   * Make a list of model groups publicly visible (`POST /model_group/make_public`).
   *
   * @param params - The model groups to publish.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Server response payload (shape varies by version).
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  makeGroupPublic(
    params: ModelGroupMakePublicParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'POST',
      path: '/model_group/make_public',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update the curated "useful links" shown on the model hub (`POST /model_hub/update_useful_links`).
   *
   * @param params - The links payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Server response payload (shape varies by version).
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  updateModelHubLinks(
    params: ModelHubUpdateLinksParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'POST',
      path: '/model_hub/update_useful_links',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Inspect the configured cost-map source (`GET /model/cost_map/source`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The current cost-map source descriptor.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  costMapSource(options?: RequestOptions): Promise<ModelCostMapSourceResponse> {
    return this.request<ModelCostMapSourceResponse>({
      method: 'GET',
      path: '/model/cost_map/source',
      options,
    });
  }

  /**
   * Reload the in-process model cost map immediately (`POST /reload/model_cost_map`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Reload confirmation including the resulting source state.
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  reloadCostMap(options?: RequestOptions): Promise<ModelCostMapReloadResponse> {
    return this.request<ModelCostMapReloadResponse>({
      method: 'POST',
      path: '/reload/model_cost_map',
      options,
    });
  }

  /**
   * Schedule recurring cost-map reloads (`POST /schedule/model_cost_map_reload`).
   *
   * @param params - Schedule attributes (interval, source, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Server response payload (shape varies by version).
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  scheduleCostMapReload(
    params: ModelCostMapScheduleParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'POST',
      path: '/schedule/model_cost_map_reload',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Cancel any scheduled cost-map reload (`DELETE /schedule/model_cost_map_reload`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Server response payload (shape varies by version).
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  cancelScheduledCostMapReload(options?: RequestOptions): Promise<unknown> {
    return this.request({
      method: 'DELETE',
      path: '/schedule/model_cost_map_reload',
      options,
    });
  }

  /**
   * Inspect the status of the scheduled cost-map reload (`GET /schedule/model_cost_map_reload/status`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Schedule status (last run, next run, errors, etc.)
   *
   * @see https://docs.litellm.ai/docs/proxy/model_management
   */
  costMapReloadStatus(
    options?: RequestOptions,
  ): Promise<ModelCostMapScheduleStatusResponse> {
    return this.request<ModelCostMapScheduleStatusResponse>({
      method: 'GET',
      path: '/schedule/model_cost_map_reload/status',
      options,
    });
  }
}
