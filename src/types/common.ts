// ─────────────────────────────────────────────────────────────────────────────
// Shared / common types used across the LiteLLM proxy API
// ─────────────────────────────────────────────────────────────────────────────

/** ISO-8601 date string */
export type ISODateString = string;

export type Role = 'system' | 'user' | 'assistant' | 'function' | 'tool' | 'developer';

/** LiteLLM proxy user role values. */
export type UserRole =
  | 'proxy_admin'
  | 'proxy_admin_viewer'
  | 'internal_user'
  | 'internal_user_viewer'
  | 'team';

export type FinishReason =
  | 'stop'
  | 'length'
  | 'function_call'
  | 'tool_calls'
  | 'content_filter';

// ─── Function / Tool calling ─────────────────────────────────────────────────

export interface FunctionDefinition {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  strict?: boolean;
}

export interface ToolDefinition {
  type: 'function';
  function: FunctionDefinition;
}

export interface ToolCallFunction {
  name?: string;
  arguments?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: ToolCallFunction;
  index?: number;
}

export type ToolChoice =
  | 'none'
  | 'auto'
  | 'required'
  | { type: 'function'; function: { name: string } };

// ─── Response format ─────────────────────────────────────────────────────────

export interface ResponseFormatText {
  type: 'text';
}
export interface ResponseFormatJsonObject {
  type: 'json_object';
}
export interface ResponseFormatJsonSchema {
  type: 'json_schema';
  json_schema: {
    name: string;
    description?: string;
    schema: Record<string, unknown>;
    strict?: boolean;
  };
}
export type ResponseFormat =
  | ResponseFormatText
  | ResponseFormatJsonObject
  | ResponseFormatJsonSchema;

// ─── Usage ───────────────────────────────────────────────────────────────────

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  /** Optional details breakout supplied by some providers. */
  prompt_tokens_details?: {
    cached_tokens?: number;
    audio_tokens?: number;
  };
  completion_tokens_details?: {
    reasoning_tokens?: number;
    audio_tokens?: number;
    accepted_prediction_tokens?: number;
    rejected_prediction_tokens?: number;
  };
}

// ─── Multimodal content parts ────────────────────────────────────────────────

export interface ContentPartText {
  type: 'text';
  text: string;
}
export interface ContentPartImageUrl {
  type: 'image_url';
  image_url: { url: string; detail?: 'auto' | 'low' | 'high' };
}
export interface ContentPartInputAudio {
  type: 'input_audio';
  input_audio: { data: string; format: 'wav' | 'mp3' };
}
export interface ContentPartFile {
  type: 'file';
  file: { file_id?: string; file_data?: string; filename?: string };
}
export type MessageContentPart =
  | ContentPartText
  | ContentPartImageUrl
  | ContentPartInputAudio
  | ContentPartFile;

export type MessageContent = string | null | MessageContentPart[];

// ─── Message ─────────────────────────────────────────────────────────────────

export interface Message {
  role: Role;
  content: MessageContent;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  /** @deprecated Use tool_calls */
  function_call?: { name: string; arguments: string };
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface CursorPaginationParams {
  after?: string;
  before?: string;
  limit?: number;
  order?: 'asc' | 'desc';
}

/** OpenAI-style cursor list response. */
export interface CursorPage<T> {
  object: 'list';
  data: T[];
  first_id?: string | null;
  last_id?: string | null;
  has_more?: boolean;
}
