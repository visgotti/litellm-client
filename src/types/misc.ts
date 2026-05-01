import type { Message } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Miscellaneous one-off endpoints
// ─────────────────────────────────────────────────────────────────────────────

/** Body for `POST /apply_guardrail`. */
export interface ApplyGuardrailParams {
  /** Name of a guardrail configured on the proxy. */
  guardrail_name: string;
  /** Text to evaluate / mutate through the guardrail. */
  text: string;
  /** Optional language hint passed to the guardrail. */
  language?: string | null;
  /** PII entity types to detect (depends on guardrail provider). */
  entities?: string[] | null;
}

/** Response from `POST /apply_guardrail`. */
export interface ApplyGuardrailResponse {
  /** Text the guardrail produced (e.g. redacted). */
  response_text?: string;
  [key: string]: unknown;
}

/** Body for `POST /add/allowed_ip` and `POST /delete/allowed_ip`. */
export interface AllowedIPParams {
  /** IPv4 / IPv6 address to add or remove from the allow-list. */
  ip: string;
}

/** Response from the allowed IP mutation endpoints. */
export interface AllowedIPResponse {
  message: string;
  status: string;
  [key: string]: unknown;
}

/** A single event submitted to `POST /api/event_logging/batch`. */
export interface EventLoggingEvent {
  /** Event type (e.g. `'page_view'`, `'feature_used'`). */
  event_type?: string;
  /** Free-form payload — exact shape depends on the proxy's analytics sink. */
  [key: string]: unknown;
}

/** Body for `POST /api/event_logging/batch`. */
export interface ApiEventLoggingBatchParams {
  /** Batch of events to deliver. */
  events?: EventLoggingEvent[];
  [key: string]: unknown;
}

/** Response from `POST /api/event_logging/batch`. */
export interface ApiEventLoggingBatchResponse {
  status: string;
  [key: string]: unknown;
}

/** Response from `GET /in_product_nudges`. */
export interface InProductNudgesResponse {
  /** Whether the in-product Claude Code nudge should render. */
  is_claude_code_enabled: boolean;
  [key: string]: unknown;
}

/** Response from `GET /active/callbacks`. */
export interface ActiveCallbacksResponse {
  alerting?: string;
  /** String representations of registered callback hooks. */
  'litellm.callbacks'?: string[];
  [key: string]: unknown;
}

/** Response from `GET /debug/asyncio-tasks`. */
export interface DebugAsyncioTasksResponse {
  total_active_tasks: number;
  by_name: Record<string, number>;
  [key: string]: unknown;
}

/** Body for `POST /usage/ai/chat`. */
export interface UsageAiChatParams {
  /** Prior chat history to send to the in-proxy usage assistant. */
  messages: Message[];
  /** Optional override of the model used by the assistant. */
  model?: string | null;
}

/**
 * A single SSE chunk emitted by `/usage/ai/chat`.
 * The proxy emits at least `status`, `chunk` and `done` typed events.
 */
export interface UsageAiChatChunk {
  type: 'status' | 'chunk' | 'done' | string;
  message?: string;
  content?: string;
  [key: string]: unknown;
}

/** Body for `POST /key/regenerate` (key passed as `?key=` query parameter). */
export interface RegenerateKeyParams {
  /** Key to regenerate. Sent as a query parameter on the request URL. */
  key: string;
  key_alias?: string | null;
  duration?: string | null;
  models?: string[];
  spend?: number | null;
  max_budget?: number | null;
  user_id?: string | null;
  team_id?: string | null;
  metadata?: Record<string, unknown> | null;
  tags?: string[] | null;
  [key: string]: unknown;
}

/**
 * Body for `POST /register` — RFC 7591 OAuth 2.0 dynamic client registration.
 *
 * The proxy accepts a free-form metadata document; common fields include
 * `client_name`, `redirect_uris`, and `grant_types`.
 */
export interface RegisterClientParams {
  client_name?: string;
  redirect_uris?: string[];
  grant_types?: string[];
  [key: string]: unknown;
}

/** Response from `POST /register`. */
export interface RegisterClientResponse {
  client_id: string;
  client_secret?: string;
  redirect_uris?: string[];
  [key: string]: unknown;
}

/** Body for `POST /v2/rerank`. */
export interface RerankV2Params {
  model: string;
  query: string;
  documents: string[];
  top_n?: number;
  return_documents?: boolean;
  rank_fields?: string[];
  [key: string]: unknown;
}

/** Result entry from `POST /v2/rerank`. */
export interface RerankV2Result {
  index: number;
  relevance_score: number;
  document?: { text: string } | string;
}

/** Response from `POST /v2/rerank`. */
export interface RerankV2Response {
  id?: string;
  results: RerankV2Result[];
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}
