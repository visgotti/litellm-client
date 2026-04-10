import type {
  Message,
  FinishReason,
  ToolDefinition,
  ToolChoice,
  ToolCall,
  ToolCallFunction,
  ResponseFormat,
  Usage,
  FunctionDefinition,
} from './common';
import type { ChatModel } from './models-enum';

// ─────────────────────────────────────────────────────────────────────────────
// Chat Completion – Request
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatCompletionCreateParamsBase {
  model: ChatModel;
  messages: Message[];
  temperature?: number | null;
  top_p?: number | null;
  n?: number | null;
  max_tokens?: number | null;
  stop?: string | string[] | null;
  presence_penalty?: number | null;
  frequency_penalty?: number | null;
  logit_bias?: Record<string, number> | null;
  user?: string;
  response_format?: ResponseFormat;
  seed?: number | null;
  tools?: ToolDefinition[];
  tool_choice?: ToolChoice;
  /** @deprecated Use tools/tool_choice */
  functions?: FunctionDefinition[];
  /** @deprecated Use tools/tool_choice */
  function_call?: 'none' | 'auto' | { name: string };
  /** Extra headers forwarded to the provider via the proxy */
  extra_headers?: Record<string, string>;
  /** Arbitrary metadata passed to the proxy for logging/tracking */
  metadata?: Record<string, unknown>;
}

export interface ChatCompletionCreateParamsNonStreaming
  extends ChatCompletionCreateParamsBase {
  stream?: false | null;
}

export interface ChatCompletionCreateParamsStreaming
  extends ChatCompletionCreateParamsBase {
  stream: true;
  stream_options?: { include_usage?: boolean };
}

export type ChatCompletionCreateParams =
  | ChatCompletionCreateParamsNonStreaming
  | ChatCompletionCreateParamsStreaming;

// ─────────────────────────────────────────────────────────────────────────────
// Chat Completion – Response (non-streaming)
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatCompletionChoiceMessage {
  role: 'assistant';
  content: string | null;
  function_call?: { name: string; arguments: string };
  tool_calls?: ToolCall[];
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatCompletionChoiceMessage;
  finish_reason: FinishReason | null;
}

export interface ChatCompletion {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: Usage;
  system_fingerprint?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Completion – Response (streaming)
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatCompletionChunkDelta {
  role?: string;
  content?: string | null;
  function_call?: ToolCallFunction;
  tool_calls?: Array<{
    index: number;
    id?: string;
    type?: 'function';
    function?: ToolCallFunction;
  }>;
}

export interface ChatCompletionChunkChoice {
  index: number;
  delta: ChatCompletionChunkDelta;
  finish_reason: FinishReason | null;
}

export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: ChatCompletionChunkChoice[];
  usage?: Usage | null;
  system_fingerprint?: string;
}
