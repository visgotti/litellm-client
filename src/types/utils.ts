// ─────────────────────────────────────────────────────────────────────────────
// LLM utility endpoints (token counting, request transformation, route discovery)
// ─────────────────────────────────────────────────────────────────────────────

/** POST /utils/token_counter — request body. */
export interface TokenCounterParams {
  /** Model name (litellm format, e.g. "gpt-4", "anthropic/claude-3-opus"). */
  model: string;
  /** Plain prompt text. */
  prompt?: string | null;
  /** Anthropic-style messages array (`/messages` token counting). */
  messages?: Array<Record<string, unknown>> | null;
  /** Google `/countTokens` style — list of content dicts. */
  contents?: Array<Record<string, unknown>> | null;
  /** Tools / functions schema. */
  tools?: Array<Record<string, unknown>> | null;
  /** System prompt (string or list of content blocks, depending on provider). */
  system?: unknown;
}

/** POST /utils/token_counter — response. */
export interface TokenCounterResponse {
  total_tokens: number;
  request_model: string;
  model_used: string;
  tokenizer_type: string;
  [key: string]: unknown;
}

/** POST /utils/transform_request — request body. */
export interface TransformRequestParams {
  /** LiteLLM call type, e.g. "completion", "embedding", "image_generation". */
  call_type: string;
  /** Raw request body to transform into the provider-specific shape. */
  request_body: Record<string, unknown>;
}

/** POST /utils/transform_request — response (provider-specific raw request). */
export interface TransformRequestResponse {
  raw_request_api_base?: string;
  raw_request_body?: Record<string, unknown>;
  raw_request_headers?: Record<string, string>;
  [key: string]: unknown;
}

/** GET /utils/supported_openai_params — query string. */
export interface SupportedOpenAiParamsQuery {
  model: string;
  custom_llm_provider?: string;
}

/** GET /utils/supported_openai_params — response. */
export interface SupportedOpenAiParamsResponse {
  supported_openai_params: string[];
  [key: string]: unknown;
}

/** GET /routes — single route entry. */
export interface RouteEntry {
  path: string;
  methods?: string[];
  name?: string;
  endpoint?: string;
  [key: string]: unknown;
}

/** GET /routes — response. */
export interface RoutesResponse {
  routes: RouteEntry[];
  [key: string]: unknown;
}

/** GET /utils/available_routes — response. */
export interface AvailableRoutesResponse {
  routes?: RouteEntry[];
  [key: string]: unknown;
}
