// ─────────────────────────────────────────────────────────────────────────────
// Anthropic native API types — /v1/messages
// Reference: https://docs.anthropic.com/en/api/messages
// ─────────────────────────────────────────────────────────────────────────────

export type AnthropicRole = 'user' | 'assistant';

// ─── Content blocks (request/input) ──────────────────────────────────────────

export interface AnthropicTextBlock {
  type: 'text';
  text: string;
  cache_control?: AnthropicCacheControl | null;
}

export interface AnthropicImageBlockSourceBase64 {
  type: 'base64';
  media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | (string & {});
  data: string;
}
export interface AnthropicImageBlockSourceUrl {
  type: 'url';
  url: string;
}
export type AnthropicImageBlockSource =
  | AnthropicImageBlockSourceBase64
  | AnthropicImageBlockSourceUrl;

export interface AnthropicImageBlock {
  type: 'image';
  source: AnthropicImageBlockSource;
  cache_control?: AnthropicCacheControl | null;
}

export interface AnthropicDocumentBlock {
  type: 'document';
  source:
    | { type: 'base64'; media_type: 'application/pdf' | (string & {}); data: string }
    | { type: 'url'; url: string }
    | { type: 'text'; media_type: 'text/plain'; data: string }
    | { type: 'content'; content: Array<AnthropicTextBlock | AnthropicImageBlock> };
  title?: string;
  context?: string;
  citations?: { enabled?: boolean };
  cache_control?: AnthropicCacheControl | null;
}

export interface AnthropicToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
  cache_control?: AnthropicCacheControl | null;
}

export interface AnthropicToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content?: string | Array<AnthropicTextBlock | AnthropicImageBlock>;
  is_error?: boolean;
  cache_control?: AnthropicCacheControl | null;
}

export interface AnthropicThinkingBlock {
  type: 'thinking';
  thinking: string;
  signature?: string;
}

export interface AnthropicRedactedThinkingBlock {
  type: 'redacted_thinking';
  data: string;
}

export type AnthropicContentBlock =
  | AnthropicTextBlock
  | AnthropicImageBlock
  | AnthropicDocumentBlock
  | AnthropicToolUseBlock
  | AnthropicToolResultBlock
  | AnthropicThinkingBlock
  | AnthropicRedactedThinkingBlock;

export interface AnthropicCacheControl {
  type: 'ephemeral';
  ttl?: '5m' | '1h' | (string & {});
}

// ─── Messages ────────────────────────────────────────────────────────────────

export interface AnthropicMessageParam {
  role: AnthropicRole;
  content: string | AnthropicContentBlock[];
}

// ─── System ──────────────────────────────────────────────────────────────────

export type AnthropicSystem = string | AnthropicTextBlock[];

// ─── Tools ───────────────────────────────────────────────────────────────────

export interface AnthropicTool {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
  cache_control?: AnthropicCacheControl | null;
  type?: 'custom' | (string & {});
}

export interface AnthropicComputerUseTool {
  type: 'computer_20241022' | 'computer_20250124' | (string & {});
  name: 'computer';
  display_width_px: number;
  display_height_px: number;
  display_number?: number;
  cache_control?: AnthropicCacheControl | null;
}

export interface AnthropicBashTool {
  type: 'bash_20241022' | 'bash_20250124' | (string & {});
  name: 'bash';
  cache_control?: AnthropicCacheControl | null;
}

export interface AnthropicTextEditorTool {
  type: 'text_editor_20241022' | 'text_editor_20250124' | (string & {});
  name: 'str_replace_editor' | (string & {});
  cache_control?: AnthropicCacheControl | null;
}

export type AnthropicAnyTool =
  | AnthropicTool
  | AnthropicComputerUseTool
  | AnthropicBashTool
  | AnthropicTextEditorTool;

export type AnthropicToolChoice =
  | { type: 'auto'; disable_parallel_tool_use?: boolean }
  | { type: 'any'; disable_parallel_tool_use?: boolean }
  | { type: 'tool'; name: string; disable_parallel_tool_use?: boolean }
  | { type: 'none' };

// ─── Thinking config ─────────────────────────────────────────────────────────

export type AnthropicThinkingConfig =
  | { type: 'enabled'; budget_tokens: number }
  | { type: 'disabled' };

// ─── Metadata ────────────────────────────────────────────────────────────────

export interface AnthropicMessageMetadata {
  user_id?: string | null;
}

// ─── Request ─────────────────────────────────────────────────────────────────

export interface AnthropicMessagesCreateParamsBase {
  model: import('./models-enum').AnthropicModel | (string & {});
  messages: AnthropicMessageParam[];
  max_tokens: number;
  system?: AnthropicSystem;
  metadata?: AnthropicMessageMetadata;
  stop_sequences?: string[];
  temperature?: number;
  top_k?: number;
  top_p?: number;
  tools?: AnthropicAnyTool[];
  tool_choice?: AnthropicToolChoice;
  thinking?: AnthropicThinkingConfig;
  service_tier?: 'auto' | 'standard_only' | (string & {});
  /** Structured output format (e.g. JSON schema) — proxied through to providers that support it. */
  output_format?: { type: 'json_schema'; schema: Record<string, unknown> };
  /** Extra headers forwarded to the provider via the proxy */
  extra_headers?: Record<string, string>;
}

export interface AnthropicMessagesCreateParamsNonStreaming
  extends AnthropicMessagesCreateParamsBase {
  stream?: false | null;
}

export interface AnthropicMessagesCreateParamsStreaming
  extends AnthropicMessagesCreateParamsBase {
  stream: true;
}

export type AnthropicMessagesCreateParams =
  | AnthropicMessagesCreateParamsNonStreaming
  | AnthropicMessagesCreateParamsStreaming;

// ─── Response (non-streaming) ────────────────────────────────────────────────

export type AnthropicStopReason =
  | 'end_turn'
  | 'max_tokens'
  | 'stop_sequence'
  | 'tool_use'
  | 'pause_turn'
  | 'refusal'
  | (string & {});

export interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  service_tier?: 'standard' | 'priority' | 'batch' | (string & {});
}

export interface AnthropicMessage {
  id: string;
  type: 'message';
  role: 'assistant';
  model: string;
  content: AnthropicContentBlock[];
  stop_reason: AnthropicStopReason | null;
  stop_sequence: string | null;
  usage: AnthropicUsage;
}

// ─── Streaming events (SSE) ──────────────────────────────────────────────────
// Reference: https://docs.anthropic.com/en/api/messages-streaming
//            https://docs.litellm.ai/docs/anthropic_unified/
//
// The `messages` endpoint emits a sequence of SSE events with `event:` /
// `data:` lines. The `data:` payload is a JSON object whose `type` literal
// discriminates the variant. Two-tier pattern: a strict `Known…` union for
// exhaustive `switch` narrowing, plus an `Unknown…` fallback so unmodelled
// future event types pass through without a cast.

/** Error body shared by `error` events (and `litellm` proxy guardrail blocks). */
export interface AnthropicErrorBody {
  type: string;
  message: string;
  [key: string]: unknown;
}

export interface AnthropicMessageStartEvent {
  type: 'message_start';
  message: AnthropicMessage;
}

export interface AnthropicTextDelta {
  type: 'text_delta';
  text: string;
}
export interface AnthropicInputJsonDelta {
  type: 'input_json_delta';
  partial_json: string;
}
export interface AnthropicThinkingDelta {
  type: 'thinking_delta';
  thinking: string;
}
export interface AnthropicSignatureDelta {
  type: 'signature_delta';
  signature: string;
}
/**
 * Citation delta — emitted when a streamed text content block carries
 * `citations`. The shape follows the Anthropic citations spec; kept
 * structurally open since the citation object varies by source type.
 */
export interface AnthropicCitationsDelta {
  type: 'citations_delta';
  citation: { type?: string; [key: string]: unknown };
}

/**
 * Strict union of *known* `content_block_delta.delta` payloads. Use this
 * inside a `switch (delta.type)` for exhaustive narrowing.
 */
export type AnthropicKnownStreamDelta =
  | AnthropicTextDelta
  | AnthropicInputJsonDelta
  | AnthropicThinkingDelta
  | AnthropicSignatureDelta
  | AnthropicCitationsDelta;

/** Forward-compat fallback for unmodelled `content_block_delta.delta` payloads. */
export interface AnthropicUnknownStreamDelta {
  type: string & {};
  [key: string]: unknown;
}

/** Open union of `content_block_delta.delta` payloads. */
export type AnthropicStreamDelta = AnthropicKnownStreamDelta | AnthropicUnknownStreamDelta;

/** @deprecated Use `AnthropicStreamDelta` (open) or `AnthropicKnownStreamDelta` (strict). */
export type AnthropicContentBlockDelta = AnthropicStreamDelta;

export interface AnthropicContentBlockStartEvent {
  type: 'content_block_start';
  index: number;
  content_block: AnthropicContentBlock;
}

export interface AnthropicContentBlockDeltaEvent {
  type: 'content_block_delta';
  index: number;
  delta: AnthropicStreamDelta;
}

export interface AnthropicContentBlockStopEvent {
  type: 'content_block_stop';
  index: number;
}

export interface AnthropicMessageDeltaEvent {
  type: 'message_delta';
  delta: {
    stop_reason?: AnthropicStopReason | null;
    stop_sequence?: string | null;
  };
  usage?: Partial<AnthropicUsage>;
}

export interface AnthropicMessageStopEvent {
  type: 'message_stop';
}

export interface AnthropicPingEvent {
  type: 'ping';
}

export interface AnthropicErrorEvent {
  type: 'error';
  error: AnthropicErrorBody;
}

/**
 * Strict discriminated union of *known* Anthropic streaming events. Use
 * this when you want exhaustive `switch` narrowing on `event.type`.
 */
export type KnownAnthropicMessageStreamEvent =
  | AnthropicMessageStartEvent
  | AnthropicContentBlockStartEvent
  | AnthropicContentBlockDeltaEvent
  | AnthropicContentBlockStopEvent
  | AnthropicMessageDeltaEvent
  | AnthropicMessageStopEvent
  | AnthropicPingEvent
  | AnthropicErrorEvent;

/**
 * Forward-compat fallback for streaming event types not yet modelled. The
 * `string & {}` discriminator preserves IntelliSense on the modelled
 * literals while still accepting any future value at runtime.
 */
export interface UnknownAnthropicMessageStreamEvent {
  type: string & {};
  [key: string]: unknown;
}

/**
 * Open discriminated union of Anthropic streaming events. Includes a
 * forward-compat fallback so payloads carrying new `type` literals do not
 * require casts. For exhaustive narrowing on the modelled literals (e.g.
 * inside a `switch`), narrow to `KnownAnthropicMessageStreamEvent` first.
 */
export type AnthropicMessageStreamEvent =
  | KnownAnthropicMessageStreamEvent
  | UnknownAnthropicMessageStreamEvent;

/**
 * Backwards-compatible alias of the open union. Existing imports of
 * `MessageStreamEvent` continue to compile against the new two-tier shape.
 */
export type MessageStreamEvent = AnthropicMessageStreamEvent;

// ─── Count tokens ────────────────────────────────────────────────────────────

export interface AnthropicCountTokensParams {
  model: import('./models-enum').AnthropicModel | (string & {});
  messages: AnthropicMessageParam[];
  system?: AnthropicSystem;
  tools?: AnthropicAnyTool[];
  tool_choice?: AnthropicToolChoice;
  thinking?: AnthropicThinkingConfig;
}

export interface AnthropicCountTokensResponse {
  input_tokens: number;
}

// ─── Skills ──────────────────────────────────────────────────────────────────
// Reference: https://docs.litellm.ai/docs/skills
// Requires header `anthropic-beta: skills-2025-10-02` and query param `beta=true`.

/** Required `anthropic-beta` header value for the Skills API. */
export const ANTHROPIC_BETA_SKILLS = 'skills-2025-10-02';

export interface AnthropicSkillObject {
  id: string;
  type?: 'skill' | (string & {});
  /** Skill display title (verbatim from `display_title` form field at create time). */
  display_title?: string;
  /** ID of the skill's latest version (e.g. "skillver_01xyz789"). */
  latest_version_id?: string;
  /** Human-readable name (legacy/optional in some responses). */
  name?: string;
  /** Skill version label (e.g. "1.0.0"). */
  version?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/** A single file to upload as part of a skill (ZIP, SKILL.md, or supporting file). */
export interface AnthropicSkillFileUpload {
  /** File contents – Buffer / Uint8Array / Blob / string. */
  file: ArrayBuffer | Uint8Array | Blob | string;
  /** Filename to send to the server. */
  filename: string;
  /** Optional MIME type for the file. */
  contentType?: string;
}

/**
 * Parameters for `POST /v1/skills` — multipart/form-data upload.
 *
 * The Skills API requires the `anthropic-beta: skills-2025-10-02` header (added
 * automatically by the resource) and the `beta=true` query param (also added
 * automatically; opt out via `beta: false`).
 */
export interface AnthropicSkillCreateParams {
  /** Skill display name — sent as the `display_title` form field. */
  display_title: string;
  /**
   * One or more files to upload as `files[]`. Pass a single binary value
   * (Buffer / Uint8Array / ArrayBuffer / Blob / string) for a one-file upload
   * (SKILL.md or a packaged ZIP), or an array of `{ file, filename, contentType? }`
   * to upload multiple files (e.g. SKILL.md plus supporting files).
   */
  files:
    | ArrayBuffer
    | Uint8Array
    | Blob
    | string
    | AnthropicSkillFileUpload
    | AnthropicSkillFileUpload[];
  /** Filename for the single-binary form of `files` (defaults to "skill.zip"). Ignored when `files` is an array. */
  filename?: string;
  /** MIME type for the single-binary form of `files`. Ignored when `files` is an array. */
  contentType?: string;
  /** Optional model identifier — used for routing to specific provider credentials. */
  model?: string;
  /**
   * Toggle the `beta=true` query param. Defaults to `true`; pass `false` to opt
   * out (e.g. against a proxy that already injects it).
   */
  beta?: boolean;
}

export interface AnthropicSkillListParams {
  limit?: number;
  cursor?: string;
  before?: string;
  after?: string;
  /** Optional model identifier — used for routing. */
  model?: string;
  /** Toggle the `beta=true` query param. Defaults to `true`. */
  beta?: boolean;
}

export interface AnthropicSkillRetrieveParams {
  /** Optional model identifier — used for routing. */
  model?: string;
  /** Toggle the `beta=true` query param. Defaults to `true`. */
  beta?: boolean;
}

export interface AnthropicSkillDeleteParams {
  /** Optional model identifier — used for routing. */
  model?: string;
  /** Toggle the `beta=true` query param. Defaults to `true`. */
  beta?: boolean;
}

export interface AnthropicSkillListResponse {
  data: AnthropicSkillObject[];
  has_more?: boolean;
  next_cursor?: string | null;
  first_id?: string | null;
  last_id?: string | null;
}

export interface AnthropicSkillDeletedResponse {
  id: string;
  deleted: boolean;
  type?: 'skill.deleted' | (string & {});
}

// ─── HTTP error body ─────────────────────────────────────────────────────────

/**
 * Provider-native HTTP error body returned by Anthropic's REST endpoints
 * (e.g. `/v1/messages`) when a request fails. The proxy passes this shape
 * through under `LiteLLMError.body` when routing to Anthropic.
 *
 * Distinct from `AnthropicErrorBody` (the inline payload of streaming
 * `error` SSE events) — this is the top-level JSON envelope of a non-2xx
 * HTTP response.
 *
 * Reference: https://docs.anthropic.com/en/api/errors
 */
export interface AnthropicApiErrorBody {
  type: 'error';
  error: {
    type:
      | 'invalid_request_error'
      | 'authentication_error'
      | 'permission_error'
      | 'not_found_error'
      | 'request_too_large'
      | 'rate_limit_error'
      | 'api_error'
      | 'overloaded_error'
      | (string & {});
    message: string;
  };
}
