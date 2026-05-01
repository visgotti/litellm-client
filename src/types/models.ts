// ─────────────────────────────────────────────────────────────────────────────
// Models – List & Info
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single model row returned by `GET /v1/models`.
 *
 * @see https://docs.litellm.ai/docs/proxy/model_management
 */
export interface ModelObject {
  /** Unique identifier (typically the model name). */
  id: string;
  /** Always `'model'`. */
  object: 'model';
  /** Unix timestamp (seconds) of creation. */
  created: number;
  /** Owner identifier (usually the provider). */
  owned_by: string;
}

/**
 * Response from `GET /v1/models`.
 *
 * @see https://docs.litellm.ai/docs/proxy/model_management
 */
export interface ModelListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Available models. */
  data: ModelObject[];
}

/**
 * LiteLLM routing parameters for a model deployment.
 *
 * @see https://docs.litellm.ai/docs/proxy/model_management
 */
export interface LiteLLMParams {
  /** Model name forwarded to the upstream provider. */
  model: string;
  /** API key for the upstream provider. */
  api_key?: string;
  /** Override the upstream provider's base URL. */
  api_base?: string;
  /** Override the upstream provider's API version. */
  api_version?: string;
  /** LiteLLM provider used to dispatch the request. */
  custom_llm_provider?: string;
  /** Tokens-per-minute capacity of this deployment. */
  tpm?: number;
  /** Requests-per-minute capacity of this deployment. */
  rpm?: number;
  /** Per-request timeout (seconds). */
  timeout?: number;
  /** Streaming-request timeout (seconds). */
  stream_timeout?: number;
  /** Maximum retries before failing. */
  max_retries?: number;
  /** Provider organization identifier. */
  organization?: string;
  /** Provider-specific extra params are allowed. */
  [key: string]: unknown;
}

/**
 * Metadata block stored alongside a model deployment.
 *
 * @see https://docs.litellm.ai/docs/proxy/model_management
 */
export interface ModelInfoMetadata {
  /** Server-assigned deployment identifier. */
  id?: string;
  /** `true` if defined in the database (vs. config.yaml). */
  db_model?: boolean;
  /** Base model name (e.g. for fine-tuned aliases). */
  base_model?: string;
  /** Capability mode of the model. */
  mode?:
    | 'chat'
    | 'completion'
    | 'embedding'
    | 'image_generation'
    | 'audio_speech'
    | 'audio_transcription'
    | 'moderation'
    | 'rerank'
    | string;
  /** Total token budget. */
  max_tokens?: number | null;
  /** Maximum input tokens. */
  max_input_tokens?: number | null;
  /** Maximum output tokens. */
  max_output_tokens?: number | null;
  /** Input price (USD per token). */
  input_cost_per_token?: number;
  /** Output price (USD per token). */
  output_cost_per_token?: number;
  /** LiteLLM provider hosting the model. */
  litellm_provider?: string;
  /** Anything else the proxy returns. */
  [key: string]: unknown;
}

/**
 * One entry in the model-info listing.
 *
 * @see https://docs.litellm.ai/docs/proxy/model_management
 */
export interface ModelInfoEntry {
  /** Display name on the proxy. */
  model_name: string;
  /** LiteLLM routing parameters. */
  litellm_params: LiteLLMParams;
  /** Metadata block. */
  model_info: ModelInfoMetadata;
}

/** Response from `GET /model/info`. */
export interface ModelInfoResponse {
  /** Available model deployments. */
  data: ModelInfoEntry[];
}

// ─── Model management (admin) ────────────────────────────────────────────────

/**
 * Body for `POST /model/new`.
 *
 * @see https://docs.litellm.ai/docs/proxy/model_management
 */
export interface ModelCreateParams {
  /** Display name on the proxy. */
  model_name: string;
  /** LiteLLM routing parameters. */
  litellm_params: LiteLLMParams;
  /** Metadata block. */
  model_info?: Partial<ModelInfoMetadata>;
}

/** Response from `POST /model/new`. */
export interface ModelCreateResponse {
  /** Server-assigned deployment identifier. */
  model_id?: string;
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Body for `POST /model/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/model_management
 */
export interface ModelUpdateParams {
  /** New display name. */
  model_name?: string;
  /** Replacement routing parameters. */
  litellm_params?: Partial<LiteLLMParams>;
  /** Replacement metadata block (must include `id`). */
  model_info?: Partial<ModelInfoMetadata> & { id: string };
}
/** Response from `POST /model/update`. */
export interface ModelUpdateResponse {
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Body for `POST /model/delete`. */
export interface ModelDeleteParams {
  /** Deployment identifier to delete. */
  id: string;
}
/** Response from `POST /model/delete`. */
export interface ModelDeleteResponse {
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * One row in the model-group info listing.
 *
 * @see https://docs.litellm.ai/docs/proxy/model_management
 */
export interface ModelGroupInfoEntry {
  /** Model-group name. */
  model_group: string;
  /** Providers backing the group. */
  providers: string[];
  /** Max input tokens supported. */
  max_input_tokens?: number;
  /** Max output tokens supported. */
  max_output_tokens?: number;
  /** Input price (USD per token). */
  input_cost_per_token?: number;
  /** Output price (USD per token). */
  output_cost_per_token?: number;
  /** Capability mode. */
  mode?: string;
  /** `true` if any deployment supports function calling. */
  supports_function_calling?: boolean;
  /** `true` if any deployment supports parallel function calling. */
  supports_parallel_function_calling?: boolean;
  /** `true` if any deployment supports vision inputs. */
  supports_vision?: boolean;
  /** Anything else the proxy returns. */
  [key: string]: unknown;
}

/** Response from `GET /model_group/info`. */
export interface ModelGroupInfoResponse {
  /** Per-model-group rows. */
  data: ModelGroupInfoEntry[];
}

// ─── Extended model management ───────────────────────────────────────────────

/** Body for `PATCH /model/{id}/update` (partial). */
export interface ModelPatchUpdateParams {
  /** New display name. */
  model_name?: string;
  /** Replacement routing parameters. */
  litellm_params?: Partial<LiteLLMParams>;
  /** Replacement metadata block. */
  model_info?: Partial<ModelInfoMetadata>;
}

/** Free-form catalogue of valid model settings. */
export interface ModelSettingsResponse {
  /** Free-form settings keyed by name. */
  [key: string]: unknown;
}

/** Query parameters for `GET /model/metrics`. */
export interface ModelMetricsParams {
  /** ISO-8601 start of the window. */
  start_time?: string;
  /** ISO-8601 end of the window. */
  end_time?: string;
  /** Filter to a specific API key. */
  api_key?: string;
  /** Filter to a specific end-customer. */
  customer?: string;
  /** Filter to a specific model group. */
  model_group?: string;
}

/** A single model-metrics row. */
export interface ModelMetricEntry {
  /** Model identifier. */
  model: string;
  /** Number of requests in the window. */
  num_requests?: number;
  /** Average per-token latency (ms). */
  avg_latency_per_token?: number;
  /** Average time-to-first-token (ms). */
  avg_time_to_first_token?: number;
  /** Average total request time (ms). */
  avg_total_time?: number;
  /** Average completion tokens per request. */
  avg_completion_tokens?: number;
  /** Average prompt tokens per request. */
  avg_prompt_tokens?: number;
  /** Number of exceptions raised. */
  num_exceptions?: number;
  /** Calendar date (YYYY-MM-DD). */
  date?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

export type ModelMetricsResponse = ModelMetricEntry[];

/** A single model-exception aggregate row. */
export interface ModelExceptionEntry {
  /** Model identifier. */
  model: string;
  /** Exception class name. */
  exception_type: string;
  /** Number of occurrences. */
  count: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
export type ModelExceptionsResponse = ModelExceptionEntry[];

/** Body for marking model groups as public. */
export interface ModelGroupMakePublicParams {
  /** Model-group names. */
  model_groups: string[];
}

/** Body for updating useful-links shown in the model hub. */
export interface ModelHubUpdateUsefulLinksParams {
  /** Updated link list. */
  links: Array<{ name: string; url: string }>;
}

/** Response from `GET /model/cost_map/source`. */
export interface ModelCostMapSourceResponse {
  /** Source identifier. */
  source?: string;
  /** Source URL. */
  url?: string;
  /** ISO-8601 timestamp of the last refresh. */
  last_updated?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from triggering a model-cost-map reload. */
export interface ModelCostMapReloadResponse {
  /** Outcome marker. */
  status?: string;
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Body for scheduling automatic model-cost-map reloads. */
export interface ScheduleCostMapReloadParams {
  /** Cron expression. */
  cron_schedule?: string;
  /** Enable / disable the schedule. */
  enabled?: boolean;
  /** Free-form additional fields forwarded to the proxy. */
  [key: string]: unknown;
}

/** Response describing the current cost-map reload schedule. */
export interface ScheduleCostMapReloadStatusResponse {
  /** Whether the schedule is enabled. */
  enabled?: boolean;
  /** Cron expression. */
  cron_schedule?: string;
  /** ISO-8601 timestamp of the next run. */
  next_run?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─── v2 + cost-map aliases (used by ModelsResource) ──────────────────────────

/**
 * v2 model-info entry (extends {@link ModelInfoEntry} with extra fields).
 *
 * @see https://docs.litellm.ai/docs/proxy/model_management
 */
export interface ModelInfoV2Entry extends ModelInfoEntry {
  /** Free-form additional fields. */
  [key: string]: unknown;
}
/** Response from the v2 model-info endpoint. */
export interface ModelInfoV2Response {
  /** Per-deployment rows. */
  data: ModelInfoV2Entry[];
}
export type ModelStreamingMetricsResponse = ModelMetricsResponse;
export type ModelSlowResponsesResponse = ModelMetricsResponse;
export type ModelHubUpdateLinksParams = ModelHubUpdateUsefulLinksParams;
export type ModelCostMapScheduleParams = ScheduleCostMapReloadParams;
export type ModelCostMapScheduleStatusResponse = ScheduleCostMapReloadStatusResponse;
