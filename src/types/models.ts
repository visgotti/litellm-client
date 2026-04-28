// ─────────────────────────────────────────────────────────────────────────────
// Models – List & Info
// ─────────────────────────────────────────────────────────────────────────────

export interface ModelObject {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
}

export interface ModelListResponse {
  object: 'list';
  data: ModelObject[];
}

export interface LiteLLMParams {
  model: string;
  api_key?: string;
  api_base?: string;
  api_version?: string;
  custom_llm_provider?: string;
  tpm?: number;
  rpm?: number;
  timeout?: number;
  stream_timeout?: number;
  max_retries?: number;
  organization?: string;
  /** Provider-specific extra params are allowed. */
  [key: string]: unknown;
}

export interface ModelInfoMetadata {
  id?: string;
  db_model?: boolean;
  base_model?: string;
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
  max_tokens?: number | null;
  max_input_tokens?: number | null;
  max_output_tokens?: number | null;
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  litellm_provider?: string;
  /** Anything else the proxy returns. */
  [key: string]: unknown;
}

export interface ModelInfoEntry {
  model_name: string;
  litellm_params: LiteLLMParams;
  model_info: ModelInfoMetadata;
}

export interface ModelInfoResponse {
  data: ModelInfoEntry[];
}

// ─── Model management (admin) ────────────────────────────────────────────────

export interface ModelCreateParams {
  model_name: string;
  litellm_params: LiteLLMParams;
  model_info?: Partial<ModelInfoMetadata>;
}

export interface ModelCreateResponse {
  model_id?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ModelUpdateParams {
  model_name?: string;
  litellm_params?: Partial<LiteLLMParams>;
  model_info?: Partial<ModelInfoMetadata> & { id: string };
}
export interface ModelUpdateResponse {
  message?: string;
  [key: string]: unknown;
}

export interface ModelDeleteParams {
  id: string;
}
export interface ModelDeleteResponse {
  message?: string;
  [key: string]: unknown;
}

export interface ModelGroupInfoEntry {
  model_group: string;
  providers: string[];
  max_input_tokens?: number;
  max_output_tokens?: number;
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  mode?: string;
  supports_function_calling?: boolean;
  supports_parallel_function_calling?: boolean;
  supports_vision?: boolean;
  /** Anything else the proxy returns. */
  [key: string]: unknown;
}

export interface ModelGroupInfoResponse {
  data: ModelGroupInfoEntry[];
}

// ─── Extended model management ───────────────────────────────────────────────

export interface ModelPatchUpdateParams {
  model_name?: string;
  litellm_params?: Partial<LiteLLMParams>;
  model_info?: Partial<ModelInfoMetadata>;
}

export interface ModelSettingsResponse {
  [key: string]: unknown;
}

export interface ModelMetricsParams {
  start_time?: string;
  end_time?: string;
  api_key?: string;
  customer?: string;
  model_group?: string;
}

export interface ModelMetricEntry {
  model: string;
  num_requests?: number;
  avg_latency_per_token?: number;
  avg_time_to_first_token?: number;
  avg_total_time?: number;
  avg_completion_tokens?: number;
  avg_prompt_tokens?: number;
  num_exceptions?: number;
  date?: string;
  [key: string]: unknown;
}

export type ModelMetricsResponse = ModelMetricEntry[];

export interface ModelExceptionEntry {
  model: string;
  exception_type: string;
  count: number;
  [key: string]: unknown;
}
export type ModelExceptionsResponse = ModelExceptionEntry[];

export interface ModelGroupMakePublicParams {
  model_groups: string[];
}

export interface ModelHubUpdateUsefulLinksParams {
  links: Array<{ name: string; url: string }>;
}

export interface ModelCostMapSourceResponse {
  source?: string;
  url?: string;
  last_updated?: string;
  [key: string]: unknown;
}

export interface ModelCostMapReloadResponse {
  status?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ScheduleCostMapReloadParams {
  cron_schedule?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface ScheduleCostMapReloadStatusResponse {
  enabled?: boolean;
  cron_schedule?: string;
  next_run?: string;
  [key: string]: unknown;
}

// ─── v2 + cost-map aliases (used by ModelsResource) ──────────────────────────

export interface ModelInfoV2Entry extends ModelInfoEntry {
  [key: string]: unknown;
}
export interface ModelInfoV2Response {
  data: ModelInfoV2Entry[];
}
export type ModelStreamingMetricsResponse = ModelMetricsResponse;
export type ModelSlowResponsesResponse = ModelMetricsResponse;
export type ModelHubUpdateLinksParams = ModelHubUpdateUsefulLinksParams;
export type ModelCostMapScheduleParams = ScheduleCostMapReloadParams;
export type ModelCostMapScheduleStatusResponse = ScheduleCostMapReloadStatusResponse;
