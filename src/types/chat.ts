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
  LiteLLMForwardingOverrides,
} from './common';
import type { ChatModel } from './models-enum';

// ─────────────────────────────────────────────────────────────────────────────
// Chat Completion – Request
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatCompletionCreateParamsBase extends LiteLLMForwardingOverrides {
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
  /**
   * Optional list of fallback models. Each entry can be either a bare model
   * name (`'gpt-4o-mini'`) or an object with extra per-fallback overrides
   * (e.g. `{ model: 'claude-haiku-4-5', api_key: '...' }`).
   */
  fallbacks?: Array<string | Record<string, unknown>>;
  /** LiteLLM context-window-exceeded fallback mapping (model -> fallback model). */
  context_window_fallback_dict?: Record<string, string>;
  /**
   * Alias for `api_base`. The LiteLLM docs reference `base_url` interchangeably
   * with `api_base` — provided for parity. Prefer `api_base` for new code.
   */
  base_url?: string;
  /**
   * Load-balancing override list of model deployments. When set, LiteLLM
   * routes the request through this ad-hoc model_list instead of the
   * proxy's configured one.
   */
  model_list?: Array<Record<string, unknown>>;
  /**
   * Azure deployment ID override — routes the request to a specific Azure
   * deployment irrespective of the configured model alias.
   */
  deployment_id?: string;
  /** Override per-token input cost for spend tracking. */
  input_cost_per_token?: number;
  /** Override per-token output cost for spend tracking. */
  output_cost_per_token?: number;
  /** Additional headers forwarded to the upstream provider. */
  headers?: Record<string, string>;
  /** OpenAI safety identifier passthrough. */
  safety_identifier?: string;
  // ─── HuggingFace / custom prompt-template overrides ───────────────────────
  initial_prompt_value?: string;
  final_prompt_value?: string;
  roles?: Record<string, unknown>;
  bos_token?: string;
  eos_token?: string;
  hf_model_name?: string;
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
  /** Provider-specific fields surfaced by LiteLLM (e.g. native finish reason). */
  provider_specific_fields?: {
    native_finish_reason?: string;
    [k: string]: unknown;
  };
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
  /** End-to-end latency in milliseconds, populated by LiteLLM. */
  response_ms?: number;
  /** Internal LiteLLM bookkeeping (cache hits, cost, model id, etc). */
  _hidden_params?: Record<string, unknown>;
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
