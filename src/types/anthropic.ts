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
export type AnthropicContentBlockDelta =
  | AnthropicTextDelta
  | AnthropicInputJsonDelta
  | AnthropicThinkingDelta
  | AnthropicSignatureDelta;

export interface AnthropicContentBlockStartEvent {
  type: 'content_block_start';
  index: number;
  content_block: AnthropicContentBlock;
}

export interface AnthropicContentBlockDeltaEvent {
  type: 'content_block_delta';
  index: number;
  delta: AnthropicContentBlockDelta;
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
  error: { type: string; message: string };
}

export type MessageStreamEvent =
  | AnthropicMessageStartEvent
  | AnthropicContentBlockStartEvent
  | AnthropicContentBlockDeltaEvent
  | AnthropicContentBlockStopEvent
  | AnthropicMessageDeltaEvent
  | AnthropicMessageStopEvent
  | AnthropicPingEvent
  | AnthropicErrorEvent;

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

export interface AnthropicSkillObject {
  id: string;
  type?: 'skill' | (string & {});
  name: string;
  description?: string | null;
  version?: string | null;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AnthropicSkillCreateParams {
  name: string;
  description?: string;
  version?: string;
  instructions?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AnthropicSkillListParams {
  limit?: number;
  cursor?: string;
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
