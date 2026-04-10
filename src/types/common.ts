// ─────────────────────────────────────────────────────────────────────────────
// Shared / common types used across the LiteLLM proxy API
// ─────────────────────────────────────────────────────────────────────────────

/** ISO-8601 date string */
export type ISODateString = string;

export type Role = 'system' | 'user' | 'assistant' | 'function' | 'tool' | 'developer';

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
}

// ─── Message ─────────────────────────────────────────────────────────────────

export interface Message {
  role: Role;
  content: string | null;
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
