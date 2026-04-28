import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Guardrails — enums & shared types
// ─────────────────────────────────────────────────────────────────────────────

export type GuardrailEventHook =
  | 'pre_call'
  | 'post_call'
  | 'during_call'
  | 'logging_only'
  | 'pre_mcp_call'
  | 'during_mcp_call'
  | 'realtime_input_transcription';

export type PiiAction = 'BLOCK' | 'MASK';

export type PiiEntityType =
  | 'CREDIT_CARD'
  | 'CRYPTO'
  | 'DATE_TIME'
  | 'EMAIL_ADDRESS'
  | 'IBAN_CODE'
  | 'IP_ADDRESS'
  | 'NRP'
  | 'LOCATION'
  | 'PERSON'
  | 'PHONE_NUMBER'
  | 'MEDICAL_LICENSE'
  | 'URL'
  | 'US_BANK_NUMBER'
  | 'US_DRIVER_LICENSE'
  | 'US_ITIN'
  | 'US_PASSPORT'
  | 'US_SSN'
  | 'UK_NHS'
  | 'UK_NINO'
  | 'ES_NIF'
  | 'ES_NIE'
  | 'IT_FISCAL_CODE'
  | 'IT_DRIVER_LICENSE'
  | 'IT_VAT_CODE'
  | 'IT_PASSPORT'
  | 'IT_IDENTITY_CARD'
  | 'PL_PESEL'
  | 'SG_NRIC_FIN'
  | 'SG_UEN'
  | 'AU_ABN'
  | 'AU_ACN'
  | 'AU_TFN'
  | 'AU_MEDICARE'
  | 'IN_PAN'
  | 'IN_AADHAAR'
  | 'IN_VEHICLE_REGISTRATION'
  | 'IN_VOTER'
  | 'IN_PASSPORT'
  | 'FI_PERSONAL_IDENTITY_CODE';

export type SupportedGuardrailIntegration =
  | 'aporia'
  | 'bedrock'
  | 'dynamoai'
  | 'guardrails_ai'
  | 'lakera'
  | 'lakera_v2'
  | 'presidio'
  | 'hide-secrets'
  | 'hiddenlayer'
  | 'aim'
  | 'pangea'
  | 'crowdstrike_aidr'
  | 'lasso'
  | 'pillar'
  | 'grayswan'
  | 'panw_prisma_airs'
  | 'azure/prompt_shield'
  | 'azure/text_moderations'
  | 'model_armor'
  | 'openai_moderation'
  | 'noma'
  | 'noma_v2'
  | 'tool_permission'
  | 'zscaler_ai_guard'
  | 'javelin'
  | 'enkryptai'
  | 'ibm_guardrails'
  | 'litellm_content_filter'
  | 'mcp_security'
  | 'onyx'
  | 'promptguard'
  | 'prompt_security'
  | 'generic_guardrail_api'
  | 'qualifire'
  | 'custom_code'
  | 'semantic_guard'
  | 'mcp_end_user_permission'
  | 'block_code_execution'
  | 'akto'
  | 'mcp_jwt_signer'
  | 'llm_as_a_judge'
  | (string & {});

export type GuardrailDefinitionLocation = 'db' | 'config';

export type GuardrailSubmissionStatus = 'pending_review' | 'active' | 'rejected';

// ─────────────────────────────────────────────────────────────────────────────
// LitellmParams — flexible bag (covers BaseLitellmParams + provider-specific
// extensions; Pydantic `extra="allow"`).
// ─────────────────────────────────────────────────────────────────────────────

export interface LitellmParams {
  guardrail: SupportedGuardrailIntegration;
  mode: GuardrailEventHook | string | Array<GuardrailEventHook | string>;
  api_key?: string | null;
  api_base?: string | null;
  default_on?: boolean | null;
  guard_name?: string | null;
  experimental_use_latest_role_message_only?: boolean | null;
  skip_system_message_in_guardrail?: boolean | null;
  category_thresholds?: Record<string, unknown> | null;
  detect_secrets_config?: Record<string, unknown> | null;
  mask_request_content?: boolean | null;
  mask_response_content?: boolean | null;
  pangea_input_recipe?: string | null;
  pangea_output_recipe?: string | null;
  model?: string | null;
  violation_message_template?: string | null;
  end_session_after_n_fails?: number | null;
  on_violation?: 'warn' | 'end_session' | null;
  realtime_violation_message?: string | null;
  template_id?: string | null;
  location?: string | null;
  credentials?: string | null;
  api_endpoint?: string | null;
  fail_on_error?: boolean | null;
  additional_provider_specific_params?: Record<string, unknown> | null;
  unreachable_fallback?: 'fail_closed' | 'fail_open';
  extra_headers?: string[] | null;
  custom_code?: string | null;
  [key: string]: unknown;
}

export interface BaseLitellmParams extends Partial<LitellmParams> {
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core guardrail object
// ─────────────────────────────────────────────────────────────────────────────

export interface Guardrail {
  guardrail_id?: string | null;
  guardrail_name: string;
  litellm_params: LitellmParams;
  guardrail_info?: Record<string, unknown> | null;
  policy_template?: string | null;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface GuardrailInfoResponse {
  guardrail_id?: string | null;
  guardrail_name: string;
  litellm_params?: BaseLitellmParams | null;
  guardrail_info?: Record<string, unknown> | null;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
  guardrail_definition_location?: GuardrailDefinitionLocation;
  [key: string]: unknown;
}

export interface ListGuardrailsResponse {
  guardrails: GuardrailInfoResponse[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD params/responses
// ─────────────────────────────────────────────────────────────────────────────

export interface GuardrailCreateParams {
  guardrail: Guardrail;
}
export type GuardrailCreateResponse = GuardrailInfoResponse;

export interface GuardrailUpdateParams {
  guardrail: Guardrail;
}
export type GuardrailUpdateResponse = GuardrailInfoResponse;

export interface GuardrailPatchParams {
  guardrail_name?: string;
  litellm_params?: BaseLitellmParams;
  guardrail_info?: Record<string, unknown>;
}
export type GuardrailPatchResponse = GuardrailInfoResponse;

export interface GuardrailDeleteResponse {
  message?: string;
  guardrail_id?: string;
  guardrail_name?: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Register / submissions
// ─────────────────────────────────────────────────────────────────────────────

export interface GuardrailRegisterParams {
  guardrail_name: string;
  litellm_params: Record<string, unknown>;
  guardrail_info?: Record<string, unknown> | null;
  team_id?: string | null;
}

export interface GuardrailRegisterResponse {
  guardrail_id: string;
  guardrail_name: string;
  status: string;
  submitted_at?: ISODateString | null;
}

export interface GuardrailSubmissionItem {
  guardrail_id: string;
  guardrail_name: string;
  status: GuardrailSubmissionStatus | string;
  team_id?: string | null;
  team_guardrail: boolean;
  litellm_params?: Record<string, unknown> | null;
  guardrail_info?: Record<string, unknown> | null;
  submitted_by_user_id?: string | null;
  submitted_by_email?: string | null;
  submitted_at?: ISODateString | null;
  reviewed_at?: ISODateString | null;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface GuardrailSubmissionSummary {
  total: number;
  pending_review: number;
  active: number;
  rejected: number;
}

export interface ListGuardrailSubmissionsParams {
  status?: GuardrailSubmissionStatus | string;
  team_id?: string;
  search?: string;
}

export interface ListGuardrailSubmissionsResponse {
  submissions: GuardrailSubmissionItem[];
  summary: GuardrailSubmissionSummary;
}

export interface GuardrailSubmissionActionResponse {
  guardrail_id: string;
  status: string;
  message: string;
  warning?: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface PiiEntityCategoryMap {
  category: string;
  entities: string[];
}

export interface GuardrailUIAddSettingsResponse {
  supported_entities: string[];
  supported_actions: string[];
  supported_modes: string[];
  pii_entity_categories: PiiEntityCategoryMap[];
  content_filter_settings?: Record<string, unknown> | null;
}

export interface GuardrailUICategoryYamlResponse {
  category_name: string;
  yaml_content: string;
  file_type: 'yaml' | 'json' | string;
}

export interface GuardrailUIMajorAirline {
  id?: string;
  match?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface GuardrailUIMajorAirlinesResponse {
  airlines: GuardrailUIMajorAirline[];
}

export type GuardrailUIProviderSpecificParamsResponse = Record<
  string,
  Record<string, unknown>
>;

// ─────────────────────────────────────────────────────────────────────────────
// Utility endpoints
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidateBlockedWordsFileParams {
  file_content: string;
}

export interface ValidateBlockedWordsFileResponse {
  valid: boolean;
  message?: string;
  error?: string;
  errors?: string[];
  [key: string]: unknown;
}

export interface TestCustomCodeParams {
  custom_code: string;
  test_input: Record<string, unknown>;
  input_type?: 'request' | 'response' | string;
  request_data?: Record<string, unknown> | null;
}

export interface TestCustomCodeResponse {
  success: boolean;
  result?: Record<string, unknown> | null;
  error?: string | null;
  error_type?: 'compilation' | 'execution' | string | null;
}

export interface ApplyGuardrailParams {
  guardrail_name: string;
  text: string;
  language?: string | null;
  entities?: PiiEntityType[] | null;
  input_type?: 'request' | 'response' | string;
  messages?: Array<Record<string, unknown>> | null;
}

export interface ApplyGuardrailResponse {
  response_text: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Usage / dashboard
// ─────────────────────────────────────────────────────────────────────────────

export interface UsageOverviewParams {
  start_date?: string;
  end_date?: string;
}

export interface UsageOverviewRow {
  id: string;
  name: string;
  type: string;
  provider: string;
  requestsEvaluated: number;
  failRate: number;
  avgScore: number | null;
  avgLatency: number | null;
  status: string;
  trend: string;
}

export interface UsageOverviewResponse {
  rows: UsageOverviewRow[];
  chart: Array<Record<string, unknown>>;
  totalRequests: number;
  totalBlocked: number;
  passRate: number;
}

export interface UsageDetailParams {
  start_date?: string;
  end_date?: string;
}

export interface UsageDetailResponse {
  guardrail_id: string;
  guardrail_name: string;
  type: string;
  provider: string;
  requestsEvaluated: number;
  failRate: number;
  avgScore: number | null;
  avgLatency: number | null;
  status: string;
  trend: string;
  description: string | null;
  time_series: Array<Record<string, unknown>>;
}

export interface UsageLogsParams {
  guardrail_id?: string;
  policy_id?: string;
  page?: number;
  page_size?: number;
  action?: string;
  start_date?: string;
  end_date?: string;
}

export interface UsageLogEntry {
  id: string;
  timestamp: string;
  action: string;
  score: number | null;
  latency_ms: number | null;
  model: string | null;
  input_snippet: string | null;
  output_snippet: string | null;
  reason: string | null;
}

export interface UsageLogsResponse {
  logs: UsageLogEntry[];
  total: number;
  page: number;
  page_size: number;
}
