import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Guardrails — enums & shared types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stage in the request lifecycle at which a guardrail runs.
 *
 * - `pre_call`: Before the upstream model call (input check).
 * - `post_call`: After the upstream model call (output check).
 * - `during_call`: Concurrently with the upstream call.
 * - `logging_only`: Observe-only; never blocks.
 * - `pre_mcp_call` / `during_mcp_call`: Same hooks but for MCP tool invocations.
 * - `realtime_input_transcription`: Realtime API speech-to-text checks.
 */
export type GuardrailEventHook =
  | 'pre_call'
  | 'post_call'
  | 'during_call'
  | 'logging_only'
  | 'pre_mcp_call'
  | 'during_mcp_call'
  | 'realtime_input_transcription';

/** Action the PII guardrail takes when an entity is detected. */
export type PiiAction = 'BLOCK' | 'MASK';

/** PII entity types recognised by the Presidio guardrail. */
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

/** Guardrail integration identifier. */
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

/** Where a guardrail definition is stored: in the DB or in `config.yaml`. */
export type GuardrailDefinitionLocation = 'db' | 'config';

/** Approval workflow state for a guardrail submission. */
export type GuardrailSubmissionStatus = 'pending_review' | 'active' | 'rejected';

// ─────────────────────────────────────────────────────────────────────────────
// LitellmParams — flexible bag (covers BaseLitellmParams + provider-specific
// extensions; Pydantic `extra="allow"`).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LiteLLM routing parameters for a guardrail.
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface LitellmParams {
  /** Guardrail integration identifier. */
  guardrail: SupportedGuardrailIntegration;
  /** Lifecycle hook(s) at which the guardrail runs. */
  mode: GuardrailEventHook | string | Array<GuardrailEventHook | string>;
  /** API key for the underlying provider. */
  api_key?: string | null;
  /** Override the underlying provider's base URL. */
  api_base?: string | null;
  /** Apply this guardrail to every request unless explicitly excluded. */
  default_on?: boolean | null;
  /** Provider-specific guard / policy name. */
  guard_name?: string | null;
  /** Only check the most recent message in the conversation. */
  experimental_use_latest_role_message_only?: boolean | null;
  /** Skip system messages when running the guardrail. */
  skip_system_message_in_guardrail?: boolean | null;
  /** Per-category score thresholds. */
  category_thresholds?: Record<string, unknown> | null;
  /** Configuration for the secrets-detection scanner. */
  detect_secrets_config?: Record<string, unknown> | null;
  /** Mask matching content in the request body. */
  mask_request_content?: boolean | null;
  /** Mask matching content in the response body. */
  mask_response_content?: boolean | null;
  /** Pangea input recipe ID. */
  pangea_input_recipe?: string | null;
  /** Pangea output recipe ID. */
  pangea_output_recipe?: string | null;
  /** Provider-specific model identifier (e.g. moderation model). */
  model?: string | null;
  /** Template used to render violation messages. */
  violation_message_template?: string | null;
  /** End the session after this many violations. */
  end_session_after_n_fails?: number | null;
  /** Action to take on violation. */
  on_violation?: 'warn' | 'end_session' | null;
  /** Message returned to clients on a realtime violation. */
  realtime_violation_message?: string | null;
  /** Provider-specific template ID. */
  template_id?: string | null;
  /** Provider region / location identifier. */
  location?: string | null;
  /** Name of the LiteLLM credential used to authenticate. */
  credentials?: string | null;
  /** Custom API endpoint override. */
  api_endpoint?: string | null;
  /** Treat HTTP errors from the guardrail as violations. */
  fail_on_error?: boolean | null;
  /** Provider-specific options not modelled above. */
  additional_provider_specific_params?: Record<string, unknown> | null;
  /** Behaviour when the guardrail is unreachable. */
  unreachable_fallback?: 'fail_closed' | 'fail_open';
  /** Header names allowed to be forwarded from the client. */
  extra_headers?: string[] | null;
  /** Inline Python code for `custom_code` guardrails. */
  custom_code?: string | null;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/** Partial form of {@link LitellmParams} used for read / update payloads. */
export interface BaseLitellmParams extends Partial<LitellmParams> {
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core guardrail object
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A guardrail definition.
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface Guardrail {
  /** Server-assigned identifier. */
  guardrail_id?: string | null;
  /** Display / routing name. */
  guardrail_name: string;
  /** LiteLLM routing parameters. */
  litellm_params: LitellmParams;
  /** Free-form metadata about the guardrail. */
  guardrail_info?: Record<string, unknown> | null;
  /** ID of an associated policy template. */
  policy_template?: string | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString | null;
}

/**
 * A guardrail row as returned by listing / inspection endpoints.
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface GuardrailInfoResponse {
  /** Server-assigned identifier. */
  guardrail_id?: string | null;
  /** Display / routing name. */
  guardrail_name: string;
  /** LiteLLM routing parameters. */
  litellm_params?: BaseLitellmParams | null;
  /** Free-form metadata about the guardrail. */
  guardrail_info?: Record<string, unknown> | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString | null;
  /** Whether the guardrail is defined in the DB or in config. */
  guardrail_definition_location?: GuardrailDefinitionLocation;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** List of guardrails configured on the proxy. */
export interface ListGuardrailsResponse {
  /** Configured guardrails. */
  guardrails: GuardrailInfoResponse[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD params/responses
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Body for `POST /guardrails`.
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface GuardrailCreateParams {
  /** Guardrail definition. */
  guardrail: Guardrail;
}
export type GuardrailCreateResponse = GuardrailInfoResponse;

/**
 * Body for `PUT /guardrails/{guardrail_id}`.
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface GuardrailUpdateParams {
  /** Updated guardrail definition. */
  guardrail: Guardrail;
}
export type GuardrailUpdateResponse = GuardrailInfoResponse;

/**
 * Body for `PATCH /guardrails/{guardrail_id}` (partial update).
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface GuardrailPatchParams {
  /** New display / routing name. */
  guardrail_name?: string;
  /** Updated LiteLLM routing parameters. */
  litellm_params?: BaseLitellmParams;
  /** Updated metadata. */
  guardrail_info?: Record<string, unknown>;
}
export type GuardrailPatchResponse = GuardrailInfoResponse;

/**
 * Response from deleting a guardrail.
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface GuardrailDeleteResponse {
  /** Human-readable status. */
  message?: string;
  /** ID of the deleted guardrail. */
  guardrail_id?: string;
  /** Display / routing name of the deleted guardrail. */
  guardrail_name?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Register / submissions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Body for `POST /guardrails/register` — non-admin submission flow.
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface GuardrailRegisterParams {
  /** Display / routing name. */
  guardrail_name: string;
  /** LiteLLM routing parameters. */
  litellm_params: Record<string, unknown>;
  /** Free-form metadata. */
  guardrail_info?: Record<string, unknown> | null;
  /** Owning team ID. */
  team_id?: string | null;
}

/**
 * Response from registering a guardrail.
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface GuardrailRegisterResponse {
  /** Server-assigned identifier. */
  guardrail_id: string;
  /** Display / routing name. */
  guardrail_name: string;
  /** Submission status. */
  status: string;
  /** ISO-8601 submission timestamp. */
  submitted_at?: ISODateString | null;
}

/**
 * One row in the guardrail-submissions list.
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface GuardrailSubmissionItem {
  /** Server-assigned identifier. */
  guardrail_id: string;
  /** Display / routing name. */
  guardrail_name: string;
  /** Approval status. */
  status: GuardrailSubmissionStatus | string;
  /** Owning team ID. */
  team_id?: string | null;
  /** Whether this is a team-level guardrail. */
  team_guardrail: boolean;
  /** LiteLLM routing parameters. */
  litellm_params?: Record<string, unknown> | null;
  /** Free-form metadata. */
  guardrail_info?: Record<string, unknown> | null;
  /** Identifier of the submitting user. */
  submitted_by_user_id?: string | null;
  /** Email of the submitting user. */
  submitted_by_email?: string | null;
  /** ISO-8601 submission timestamp. */
  submitted_at?: ISODateString | null;
  /** ISO-8601 review timestamp. */
  reviewed_at?: ISODateString | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString | null;
}

/** Aggregate counts of guardrail submissions by status. */
export interface GuardrailSubmissionSummary {
  /** Total submissions. */
  total: number;
  /** Submissions awaiting review. */
  pending_review: number;
  /** Approved submissions. */
  active: number;
  /** Rejected submissions. */
  rejected: number;
}

/** Query parameters for listing guardrail submissions. */
export interface ListGuardrailSubmissionsParams {
  /** Filter by approval status. */
  status?: GuardrailSubmissionStatus | string;
  /** Filter by owning team. */
  team_id?: string;
  /** Free-text search filter. */
  search?: string;
}

/** Response from listing guardrail submissions. */
export interface ListGuardrailSubmissionsResponse {
  /** Submission rows. */
  submissions: GuardrailSubmissionItem[];
  /** Aggregate counts. */
  summary: GuardrailSubmissionSummary;
}

/**
 * Response from approving / rejecting a submission.
 *
 * @see https://docs.litellm.ai/docs/proxy/guardrails
 */
export interface GuardrailSubmissionActionResponse {
  /** Submission identifier. */
  guardrail_id: string;
  /** Resulting status. */
  status: string;
  /** Human-readable message. */
  message: string;
  /** Optional warning surfaced to the caller. */
  warning?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────────────────────

/** A category and the PII entities that fall under it. */
export interface PiiEntityCategoryMap {
  /** Category name. */
  category: string;
  /** Entity types in the category. */
  entities: string[];
}

/** Settings payload powering the Add-Guardrail UI. */
export interface GuardrailUIAddSettingsResponse {
  /** Supported PII entity types. */
  supported_entities: string[];
  /** Supported actions (e.g. `'BLOCK'`, `'MASK'`). */
  supported_actions: string[];
  /** Supported event-hook modes. */
  supported_modes: string[];
  /** PII entity types grouped by category. */
  pii_entity_categories: PiiEntityCategoryMap[];
  /** Settings for the LiteLLM content-filter guardrail. */
  content_filter_settings?: Record<string, unknown> | null;
}

/** YAML / JSON content for a category template. */
export interface GuardrailUICategoryYamlResponse {
  /** Category name. */
  category_name: string;
  /** File contents. */
  yaml_content: string;
  /** Content type. */
  file_type: 'yaml' | 'json' | string;
}

/** A row in the major-airlines reference list. */
export interface GuardrailUIMajorAirline {
  /** Airline identifier. */
  id?: string;
  /** Match string used by detection rules. */
  match?: string;
  /** Tags applied for filtering. */
  tags?: string[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** List of major airlines surfaced in the UI. */
export interface GuardrailUIMajorAirlinesResponse {
  /** Airlines in the catalogue. */
  airlines: GuardrailUIMajorAirline[];
}

/** Map from guardrail integration name to its provider-specific UI fields. */
export type GuardrailUIProviderSpecificParamsResponse = Record<
  string,
  Record<string, unknown>
>;

// ─────────────────────────────────────────────────────────────────────────────
// Utility endpoints
// ─────────────────────────────────────────────────────────────────────────────

/** Body for validating a blocked-words file. */
export interface ValidateBlockedWordsFileParams {
  /** Plain-text file contents. */
  file_content: string;
}

/** Response from validating a blocked-words file. */
export interface ValidateBlockedWordsFileResponse {
  /** `true` if the file passed validation. */
  valid: boolean;
  /** Human-readable status. */
  message?: string;
  /** Top-level error string. */
  error?: string;
  /** Per-line error messages. */
  errors?: string[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Body for executing a custom-code guardrail in dry-run mode. */
export interface TestCustomCodeParams {
  /** Inline Python code to execute. */
  custom_code: string;
  /** Sample request / response payload to feed into the code. */
  test_input: Record<string, unknown>;
  /** Lifecycle stage being simulated. */
  input_type?: 'request' | 'response' | string;
  /** Original request (for response-stage tests). */
  request_data?: Record<string, unknown> | null;
}

/** Response from executing a custom-code guardrail in dry-run mode. */
export interface TestCustomCodeResponse {
  /** `true` if the code ran without raising. */
  success: boolean;
  /** Value returned from the code. */
  result?: Record<string, unknown> | null;
  /** Error message when `success === false`. */
  error?: string | null;
  /** Where the error occurred. */
  error_type?: 'compilation' | 'execution' | string | null;
}

/**
 * Body for `POST /apply_guardrail` — run a single guardrail on text.
 *
 * @see https://docs.litellm.ai/docs/apply_guardrail
 */
export interface ApplyGuardrailParams {
  /** Routing name of the guardrail to apply. */
  guardrail_name: string;
  /** Text to evaluate. */
  text: string;
  /** Language hint (ISO-639-1). */
  language?: string | null;
  /** PII entities to detect (Presidio). */
  entities?: (PiiEntityType | (string & {}))[] | null;
  /** Lifecycle stage being simulated. */
  input_type?: 'request' | 'response' | string;
  /** Original conversation messages (for context). */
  messages?: Array<Record<string, unknown>> | null;
}

/**
 * Response from `POST /apply_guardrail`.
 *
 * @see https://docs.litellm.ai/docs/apply_guardrail
 */
export interface ApplyGuardrailResponse {
  /** Possibly-redacted text after the guardrail ran. */
  response_text: string;
  /** Populated on blocking errors with provider-specific detail. */
  detail?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Usage / dashboard
// ─────────────────────────────────────────────────────────────────────────────

/** Query parameters for the usage-overview dashboard. */
export interface UsageOverviewParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
}

/** A row in the guardrail usage-overview table. */
export interface UsageOverviewRow {
  /** Guardrail identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Guardrail type. */
  type: string;
  /** Underlying provider. */
  provider: string;
  /** Total requests evaluated in the window. */
  requestsEvaluated: number;
  /** Fraction of evaluations that failed (0–1). */
  failRate: number;
  /** Average grader score (0–1) when applicable. */
  avgScore: number | null;
  /** Average evaluation latency in milliseconds. */
  avgLatency: number | null;
  /** Health / status indicator. */
  status: string;
  /** Trend indicator (e.g. `'up'`, `'flat'`, `'down'`). */
  trend: string;
}

/** Response from the usage-overview dashboard. */
export interface UsageOverviewResponse {
  /** One row per guardrail. */
  rows: UsageOverviewRow[];
  /** Time-series chart data. */
  chart: Array<Record<string, unknown>>;
  /** Total requests evaluated across all guardrails. */
  totalRequests: number;
  /** Total requests blocked. */
  totalBlocked: number;
  /** Pass rate across all guardrails (0–1). */
  passRate: number;
}

/** Query parameters for per-guardrail usage detail. */
export interface UsageDetailParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
}

/** Response from the per-guardrail usage detail endpoint. */
export interface UsageDetailResponse {
  /** Guardrail identifier. */
  guardrail_id: string;
  /** Display name. */
  guardrail_name: string;
  /** Guardrail type. */
  type: string;
  /** Underlying provider. */
  provider: string;
  /** Total requests evaluated. */
  requestsEvaluated: number;
  /** Fraction of evaluations that failed. */
  failRate: number;
  /** Average grader score. */
  avgScore: number | null;
  /** Average evaluation latency in milliseconds. */
  avgLatency: number | null;
  /** Health / status indicator. */
  status: string;
  /** Trend indicator. */
  trend: string;
  /** Description of the guardrail. */
  description: string | null;
  /** Time-series data points for the chart. */
  time_series: Array<Record<string, unknown>>;
}

/** Query parameters for listing guardrail usage logs. */
export interface UsageLogsParams {
  /** Filter to a specific guardrail. */
  guardrail_id?: string;
  /** Filter to a specific policy. */
  policy_id?: string;
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
  /** Filter by action taken. */
  action?: string;
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
}

/** A single guardrail-evaluation log entry. */
export interface UsageLogEntry {
  /** Log entry identifier. */
  id: string;
  /** ISO-8601 timestamp of the evaluation. */
  timestamp: string;
  /** Action taken (e.g. `'BLOCK'`, `'MASK'`, `'ALLOW'`). */
  action: string;
  /** Grader score, when applicable. */
  score: number | null;
  /** Evaluation latency in milliseconds. */
  latency_ms: number | null;
  /** Model the request was routed to. */
  model: string | null;
  /** Snippet of the input evaluated. */
  input_snippet: string | null;
  /** Snippet of the output evaluated. */
  output_snippet: string | null;
  /** Reason given by the guardrail. */
  reason: string | null;
}

/** Response from listing guardrail usage logs. */
export interface UsageLogsResponse {
  /** Page of log entries. */
  logs: UsageLogEntry[];
  /** Total entries matching the query. */
  total: number;
  /** Current page number. */
  page: number;
  /** Page size. */
  page_size: number;
}
