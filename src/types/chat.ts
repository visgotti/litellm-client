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
  Role,
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
  /** New name preferred by OpenAI for o-series & GPT-5+ */
  max_completion_tokens?: number | null;
  stop?: string | string[] | null;
  presence_penalty?: number | null;
  frequency_penalty?: number | null;
  logit_bias?: Record<string, number> | null;
  logprobs?: boolean | null;
  top_logprobs?: number | null;
  user?: string;
  response_format?: ResponseFormat;
  seed?: number | null;
  tools?: ToolDefinition[];
  tool_choice?: ToolChoice;
  parallel_tool_calls?: boolean;
  reasoning_effort?: 'low' | 'medium' | 'high' | 'minimal';
  modalities?: Array<'text' | 'audio'>;
  audio?: { voice: string; format: 'wav' | 'mp3' | 'flac' | 'opus' | 'pcm16' };
  prediction?: { type: 'content'; content: string };
  /** @deprecated Use tools/tool_choice */
  functions?: FunctionDefinition[];
  /** @deprecated Use tools/tool_choice */
  function_call?: 'none' | 'auto' | { name: string };
  /** Extra headers forwarded to the provider via the proxy */
  extra_headers?: Record<string, string>;
  /** Arbitrary metadata passed to the proxy for logging/tracking */
  metadata?: Record<string, unknown>;
  /** LiteLLM cost tracking tags */
  tags?: string[];
  /** Optional list of fallback model names */
  fallbacks?: string[];
  /** Optional API base override sent to the proxy */
  api_base?: string;
  /** Optional API key override sent to the proxy */
  api_key?: string;
}

export interface ChatCompletionCreateParamsNonStreaming
  extends ChatCompletionCreateParamsBase {
  stream?: false | null;
}

export interface ChatCompletionCreateParamsStreaming extends ChatCompletionCreateParamsBase {
  stream: true;
  stream_options?: { include_usage?: boolean };
}

export type ChatCompletionCreateParams =
  | ChatCompletionCreateParamsNonStreaming
  | ChatCompletionCreateParamsStreaming;

// ─────────────────────────────────────────────────────────────────────────────
// Chat Completion – Response (non-streaming)
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatCompletionLogprob {
  token: string;
  logprob: number;
  bytes?: number[] | null;
  top_logprobs?: Array<{ token: string; logprob: number; bytes?: number[] | null }>;
}

export interface ChatCompletionChoiceLogprobs {
  content?: ChatCompletionLogprob[] | null;
  refusal?: ChatCompletionLogprob[] | null;
}

export interface ChatCompletionChoiceMessage {
  role: 'assistant';
  content: string | null;
  refusal?: string | null;
  function_call?: { name: string; arguments: string };
  tool_calls?: ToolCall[];
  audio?: { id: string; data: string; expires_at: number; transcript?: string };
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatCompletionChoiceMessage;
  finish_reason: FinishReason | null;
  logprobs?: ChatCompletionChoiceLogprobs | null;
}

export interface ChatCompletion {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: Usage;
  system_fingerprint?: string;
  service_tier?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Completion – Response (streaming)
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatCompletionChunkDelta {
  role?: Role;
  content?: string | null;
  refusal?: string | null;
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
  logprobs?: ChatCompletionChoiceLogprobs | null;
}

export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: ChatCompletionChunkChoice[];
  usage?: Usage | null;
  system_fingerprint?: string;
  service_tier?: string | null;
}
