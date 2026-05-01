// ─────────────────────────────────────────────────────────────────────────────
// LLM utility endpoints (token counting, request transformation, route discovery)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /utils/token_counter — request body.
 *
 * @see https://docs.litellm.ai/docs/proxy/utils
 */
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

/**
 * POST /utils/token_counter — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/utils
 */
export interface TokenCounterResponse {
  /** Total tokens counted for the request. */
  total_tokens: number;
  /** Model name as supplied in the request. */
  request_model: string;
  /** Resolved model that the tokenizer ran against. */
  model_used: string;
  /** Tokenizer family used (e.g. `'cl100k_base'`, `'claude'`). */
  tokenizer_type: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * POST /utils/transform_request — request body.
 *
 * @see https://docs.litellm.ai/docs/proxy/utils
 */
export interface TransformRequestParams {
  /** LiteLLM call type, e.g. "completion", "embedding", "image_generation". */
  call_type: string;
  /** Raw request body to transform into the provider-specific shape. */
  request_body: Record<string, unknown>;
}

/**
 * POST /utils/transform_request — response (provider-specific raw request).
 *
 * @see https://docs.litellm.ai/docs/proxy/utils
 */
export interface TransformRequestResponse {
  /** Provider base URL the raw request would be sent to. */
  raw_request_api_base?: string;
  /** Transformed request body in the provider's native format. */
  raw_request_body?: Record<string, unknown>;
  /** HTTP headers that would be attached to the upstream request. */
  raw_request_headers?: Record<string, string>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * GET /utils/supported_openai_params — query string.
 *
 * @see https://docs.litellm.ai/docs/proxy/utils
 */
export interface SupportedOpenAiParamsQuery {
  /** Model to enumerate supported params for. */
  model: string;
  /** Override the LiteLLM provider used to resolve support. */
  custom_llm_provider?: string;
}

/**
 * GET /utils/supported_openai_params — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/utils
 */
export interface SupportedOpenAiParamsResponse {
  /** OpenAI parameters supported by the resolved model. */
  supported_openai_params: string[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * GET /routes — single route entry.
 *
 * @see https://docs.litellm.ai/docs/proxy/utils
 */
export interface RouteEntry {
  /** URL path of the route. */
  path: string;
  /** HTTP methods accepted on the route. */
  methods?: string[];
  /** Route name (FastAPI). */
  name?: string;
  /** Internal endpoint identifier. */
  endpoint?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * GET /routes — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/utils
 */
export interface RoutesResponse {
  /** Registered routes. */
  routes: RouteEntry[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

