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

  /** GET /v1/models — OpenAI-compatible model list. */
  list(options?: RequestOptions): Promise<ModelListResponse> {
    return this.request<ModelListResponse>({ method: 'GET', path: '/v1/models', options });
  }

  /** GET /model/info — full LiteLLM model info incl. params + metadata. */
  info(options?: RequestOptions): Promise<ModelInfoResponse> {
    return this.request<ModelInfoResponse>({ method: 'GET', path: '/model/info', options });
  }

  /** GET /v2/model/info — v2 model info (richer per-model fields). */
  infoV2(options?: RequestOptions): Promise<ModelInfoV2Response> {
    return this.request<ModelInfoV2Response>({ method: 'GET', path: '/v2/model/info', options });
  }

  /** GET /model_group/info — info aggregated by model group. */
  groupInfo(options?: RequestOptions): Promise<ModelGroupInfoResponse> {
    return this.request<ModelGroupInfoResponse>({
      method: 'GET',
      path: '/model_group/info',
      options,
    });
  }

  /** POST /model/new — register a new model at runtime. */
  create(params: ModelCreateParams, options?: RequestOptions): Promise<ModelCreateResponse> {
    return this.request<ModelCreateResponse>({
      method: 'POST',
      path: '/model/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /model/update — update an existing model deployment. */
  update(params: ModelUpdateParams, options?: RequestOptions): Promise<ModelUpdateResponse> {
    return this.request<ModelUpdateResponse>({
      method: 'POST',
      path: '/model/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** PATCH /model/{model_id}/update — partial update by model id. */
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

  /** POST /model/delete — delete a model deployment. */
  delete(params: ModelDeleteParams, options?: RequestOptions): Promise<ModelDeleteResponse> {
    return this.request<ModelDeleteResponse>({
      method: 'POST',
      path: '/model/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /model/settings — provider/model defaults. */
  settings(options?: RequestOptions): Promise<ModelSettingsResponse> {
    return this.request<ModelSettingsResponse>({
      method: 'GET',
      path: '/model/settings',
      options,
    });
  }

  /** GET /model/metrics — per-model latency/usage. */
  metrics(options?: RequestOptions): Promise<ModelMetricsResponse> {
    return this.request<ModelMetricsResponse>({ method: 'GET', path: '/model/metrics', options });
  }

  /** GET /model/streaming_metrics */
  streamingMetrics(options?: RequestOptions): Promise<ModelStreamingMetricsResponse> {
    return this.request<ModelStreamingMetricsResponse>({
      method: 'GET',
      path: '/model/streaming_metrics',
      options,
    });
  }

  /** GET /model/metrics/slow_responses */
  slowResponses(options?: RequestOptions): Promise<ModelSlowResponsesResponse> {
    return this.request<ModelSlowResponsesResponse>({
      method: 'GET',
      path: '/model/metrics/slow_responses',
      options,
    });
  }

  /** GET /model/metrics/exceptions */
  exceptions(options?: RequestOptions): Promise<ModelExceptionsResponse> {
    return this.request<ModelExceptionsResponse>({
      method: 'GET',
      path: '/model/metrics/exceptions',
      options,
    });
  }

  /** POST /model_group/make_public — make a list of model groups public. */
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

  /** POST /model_hub/update_useful_links */
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

  /** GET /model/cost_map/source */
  costMapSource(options?: RequestOptions): Promise<ModelCostMapSourceResponse> {
    return this.request<ModelCostMapSourceResponse>({
      method: 'GET',
      path: '/model/cost_map/source',
      options,
    });
  }

  /** POST /reload/model_cost_map — reload the in-process cost map now. */
  reloadCostMap(options?: RequestOptions): Promise<ModelCostMapReloadResponse> {
    return this.request<ModelCostMapReloadResponse>({
      method: 'POST',
      path: '/reload/model_cost_map',
      options,
    });
  }

  /** POST /schedule/model_cost_map_reload */
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

  /** DELETE /schedule/model_cost_map_reload */
  cancelScheduledCostMapReload(options?: RequestOptions): Promise<unknown> {
    return this.request({
      method: 'DELETE',
      path: '/schedule/model_cost_map_reload',
      options,
    });
  }

  /** GET /schedule/model_cost_map_reload/status */
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
