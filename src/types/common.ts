// ─────────────────────────────────────────────────────────────────────────────
// Shared / common types used across the LiteLLM proxy API
// ─────────────────────────────────────────────────────────────────────────────

/** ISO-8601 date string */
export type ISODateString = string;

/**
 * Object-permission payload used by `/customer/*`, `/organization/*`,
 * `/team/*`, and `/key/*` endpoints to scope MCP servers, vector stores,
 * agents, and other resources accessible to the principal.
 */
export interface ObjectPermissionBase {
  /** MCP server IDs the principal may access. */
  mcp_servers?: string[];
  /** MCP access-group names the principal may use. */
  mcp_access_groups?: string[];
  /** Per-server allow-list of MCP tool names. */
  mcp_tool_permissions?: Record<string, string[]>;
  /** MCP toolset IDs the principal may use. */
  mcp_toolsets?: string[];
  /** Tool names the principal is forbidden from using. */
  blocked_tools?: string[];
  /** Vector store IDs the principal may access. */
  vector_stores?: string[];
  /** Agent IDs the principal may invoke. */
  agents?: string[];
  /** Agent access-group names the principal may use. */
  agent_access_groups?: string[];
  /** Models the principal may invoke. */
  models?: string[];
}

/** Author of a chat message. */
export type Role = 'system' | 'user' | 'assistant' | 'function' | 'tool' | 'developer';

/**
 * LiteLLM proxy user role values.
 *
 * - `proxy_admin`: Full administrative access.
 * - `proxy_admin_viewer`: Read-only administrative access.
 * - `internal_user`: Standard user.
 * - `internal_user_viewer`: Read-only standard user.
 * - `team`: Member of a specific team.
 */
export type UserRole =
  | 'proxy_admin'
  | 'proxy_admin_viewer'
  | 'internal_user'
  | 'internal_user_viewer'
  | 'team';

/**
 * Reason a model stopped generating.
 *
 * - `stop`: Hit a stop token / end of natural completion.
 * - `length`: Reached the maximum-token limit.
 * - `function_call`: Model emitted a (legacy) function call.
 * - `tool_calls`: Model emitted tool calls.
 * - `content_filter`: Output was blocked by a content filter.
 */
export type FinishReason =
  | 'stop'
  | 'length'
  | 'function_call'
  | 'tool_calls'
  | 'content_filter';

// ─── Function / Tool calling ─────────────────────────────────────────────────

/** Definition of a callable function exposed to the model. */
export interface FunctionDefinition {
  /** Function name. */
  name: string;
  /** Description shown to the model when deciding whether to call. */
  description?: string;
  /** JSON Schema describing the function arguments. */
  parameters?: Record<string, unknown>;
  /** When `true`, force the model to follow the schema strictly. */
  strict?: boolean;
}

/** Tool wrapper around a function definition. */
export interface ToolDefinition {
  /** Tool kind (currently always `'function'`). */
  type: 'function';
  /** Function definition. */
  function: FunctionDefinition;
}

/** Function-call payload emitted by the model. */
export interface ToolCallFunction {
  /** Function name (may be empty for streamed deltas). */
  name?: string;
  /** JSON-encoded function arguments. */
  arguments?: string;
}

/** A single tool call emitted by the model. */
export interface ToolCall {
  /** Tool-call identifier. */
  id: string;
  /** Tool kind (currently always `'function'`). */
  type: 'function';
  /** Function the model is calling. */
  function: ToolCallFunction;
  /** Index of this tool call within the response (streaming). */
  index?: number;
}

/**
 * Tool-choice constraint.
 *
 * - `none`: Force the model to skip tool calls.
 * - `auto`: Let the model decide.
 * - `required`: Force the model to call at least one tool.
 * - `{ type: 'function', function: { name } }`: Force the model to call a specific function.
 */
export type ToolChoice =
  | 'none'
  | 'auto'
  | 'required'
  | { type: 'function'; function: { name: string } };

// ─── Response format ─────────────────────────────────────────────────────────

/** Plain-text response format. */
export interface ResponseFormatText {
  /** Discriminator (`'text'`). */
  type: 'text';
}
/** JSON-object response format (model emits valid JSON). */
export interface ResponseFormatJsonObject {
  /** Discriminator (`'json_object'`). */
  type: 'json_object';
}
/** Structured-output response format with a JSON Schema. */
export interface ResponseFormatJsonSchema {
  /** Discriminator (`'json_schema'`). */
  type: 'json_schema';
  /** Schema definition. */
  json_schema: {
    /** Schema name. */
    name: string;
    /** Description of what the schema represents. */
    description?: string;
    /** JSON Schema body. */
    schema: Record<string, unknown>;
    /** When `true`, force the model to match the schema exactly. */
    strict?: boolean;
  };
}
export type ResponseFormat =
  | ResponseFormatText
  | ResponseFormatJsonObject
  | ResponseFormatJsonSchema;

// ─── Usage ───────────────────────────────────────────────────────────────────

/**
 * Token usage breakdown returned with most completion responses.
 */
export interface Usage {
  /** Tokens consumed by the prompt. */
  prompt_tokens: number;
  /** Tokens emitted in the completion. */
  completion_tokens: number;
  /** Sum of prompt + completion tokens. */
  total_tokens: number;
  /** Optional details breakout supplied by some providers. */
  prompt_tokens_details?: {
    /** Tokens served from prompt cache (no model cost). */
    cached_tokens?: number;
    /** Audio input tokens. */
    audio_tokens?: number;
  };
  /** Per-modality breakdown of completion tokens. */
  completion_tokens_details?: {
    /** Tokens used for chain-of-thought reasoning (o1-class models). */
    reasoning_tokens?: number;
    /** Audio output tokens. */
    audio_tokens?: number;
    /** Predicted tokens accepted by the speculative decoder. */
    accepted_prediction_tokens?: number;
    /** Predicted tokens rejected by the speculative decoder. */
    rejected_prediction_tokens?: number;
  };
}

// ─── Multimodal content parts ────────────────────────────────────────────────

/** Text content fragment. */
export interface ContentPartText {
  /** Discriminator (`'text'`). */
  type: 'text';
  /** Text content. */
  text: string;
}
/** Image-URL content fragment. */
export interface ContentPartImageUrl {
  /** Discriminator (`'image_url'`). */
  type: 'image_url';
  /** Image reference. */
  image_url: {
    /** HTTPS URL or `data:` URL of the image. */
    url: string;
    /** Detail level used by vision models. */
    detail?: 'auto' | 'low' | 'high';
  };
}
/** Inline audio content fragment. */
export interface ContentPartInputAudio {
  /** Discriminator (`'input_audio'`). */
  type: 'input_audio';
  /** Audio reference. */
  input_audio: {
    /** Base64-encoded audio bytes. */
    data: string;
    /** Audio container format. */
    format: 'wav' | 'mp3';
  };
}
/** File reference content fragment. */
export interface ContentPartFile {
  /** Discriminator (`'file'`). */
  type: 'file';
  /** File reference. */
  file: {
    /** ID of an uploaded file. */
    file_id?: string;
    /** Inline base64-encoded file bytes. */
    file_data?: string;
    /** Filename hint. */
    filename?: string;
  };
}
export type MessageContentPart =
  | ContentPartText
  | ContentPartImageUrl
  | ContentPartInputAudio
  | ContentPartFile;

export type MessageContent = string | null | MessageContentPart[];

// ─── Message ─────────────────────────────────────────────────────────────────

/** A single chat message. */
export interface Message {
  /** Author of the message. */
  role: Role;
  /** Message content. */
  content: MessageContent;
  /** Optional author name (for `function` / `tool` messages). */
  name?: string;
  /** Tool calls emitted by the assistant. */
  tool_calls?: ToolCall[];
  /** ID of the tool call this message responds to (when `role === 'tool'`). */
  tool_call_id?: string;
  /** @deprecated Use tool_calls */
  function_call?: { name: string; arguments: string };
}

// ─── Pagination ──────────────────────────────────────────────────────────────

/** Standard page-based pagination parameters. */
export interface PaginationParams {
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
}

/** OpenAI-style cursor pagination parameters. */
export interface CursorPaginationParams {
  /** Cursor — return items after this ID. */
  after?: string;
  /** Cursor — return items before this ID. */
  before?: string;
  /** Maximum number of items to return per page. */
  limit?: number;
  /** Sort order. */
  order?: 'asc' | 'desc';
}

/** OpenAI-style cursor list response. */
export interface CursorPage<T> {
  /** Always `'list'`. */
  object: 'list';
  /** Page of items. */
  data: T[];
  /** ID of the first item in the page. */
  first_id?: string | null;
  /** ID of the last item in the page. */
  last_id?: string | null;
  /** Whether more items exist after this page. */
  has_more?: boolean;
}

// ─── LiteLLM forwarding overrides ────────────────────────────────────────────

/**
 * Provider-forwarding override fields supported by LiteLLM on most
 * inference endpoints. These let callers override how the proxy
 * dispatches the upstream request (timeouts, base URL, retries, etc).
 */
export interface LiteLLMForwardingOverrides {
  /** Per-request timeout in seconds. */
  timeout?: number;
  /** Override the upstream provider's base URL. */
  api_base?: string;
  /** Override the upstream provider's API version. */
  api_version?: string;
  /** Override the upstream provider's API key. */
  api_key?: string;
  /** Override the upstream provider's API type (e.g. `'azure'`, `'openai'`). */
  api_type?: string;
  /** Maximum number of retries before failing. */
  num_retries?: number;
}
