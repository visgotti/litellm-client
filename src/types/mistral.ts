// ─────────────────────────────────────────────────────────────────────────────
// Mistral pass-through types.
// References:
//   https://docs.mistral.ai/api/
//   https://docs.mistral.ai/api/#operation/createChatCompletion
//   https://docs.mistral.ai/api/#operation/createEmbedding
//   https://docs.mistral.ai/api/#operation/createFIMCompletion
//   https://docs.mistral.ai/api/#operation/agentsCompletion
// ─────────────────────────────────────────────────────────────────────────────

// ─── Common ──────────────────────────────────────────────────────────────────

export interface MistralUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  [key: string]: unknown;
}

export type MistralRole = 'user' | 'assistant' | 'system' | 'tool' | (string & {});

export type MistralFinishReason =
  | 'stop'
  | 'length'
  | 'tool_calls'
  | 'model_length'
  | 'error'
  | (string & {});

// ─── Chat completions ────────────────────────────────────────────────────────

export interface MistralChatMessage {
  role: MistralRole;
  content: string | Array<{ type: string; text?: string; [key: string]: unknown }> | null;
  name?: string;
  tool_calls?: Array<{
    id?: string;
    type?: 'function' | (string & {});
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
  prefix?: boolean;
  [key: string]: unknown;
}

export interface MistralResponseFormat {
  type: 'text' | 'json_object' | 'json_schema' | (string & {});
  json_schema?: { name: string; schema: Record<string, unknown>; strict?: boolean };
}

export interface MistralTool {
  type: 'function' | (string & {});
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
    strict?: boolean;
  };
}

export type MistralToolChoice =
  | 'auto'
  | 'none'
  | 'any'
  | 'required'
  | { type: 'function'; function: { name: string } }
  | (string & {});

export interface MistralChatCompletionCreateParams {
  model: string;
  messages: MistralChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  stop?: string | string[];
  random_seed?: number;
  response_format?: MistralResponseFormat;
  tools?: MistralTool[];
  tool_choice?: MistralToolChoice;
  parallel_tool_calls?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
  n?: number;
  prediction?: { type: 'content'; content: string };
  safe_prompt?: boolean;
  [key: string]: unknown;
}

export interface MistralChatCompletionChoice {
  index: number;
  message: MistralChatMessage;
  finish_reason: MistralFinishReason | null;
  logprobs?: unknown;
}

export interface MistralChatCompletion {
  id: string;
  object: 'chat.completion' | (string & {});
  created: number;
  model: string;
  choices: MistralChatCompletionChoice[];
  usage?: MistralUsage;
  [key: string]: unknown;
}

// ─── Embeddings ──────────────────────────────────────────────────────────────

export interface MistralEmbeddingCreateParams {
  model: string;
  input: string | string[];
  encoding_format?: 'float' | 'base64' | (string & {});
  output_dtype?: 'float' | 'int8' | 'uint8' | 'binary' | 'ubinary' | (string & {});
  output_dimension?: number;
  [key: string]: unknown;
}

export interface MistralEmbeddingObject {
  object: 'embedding' | (string & {});
  index: number;
  embedding: number[] | string;
}

export interface MistralEmbeddingResponse {
  id?: string;
  object: 'list' | (string & {});
  data: MistralEmbeddingObject[];
  model: string;
  usage?: MistralUsage;
  [key: string]: unknown;
}

// ─── FIM (fill-in-the-middle) completions ────────────────────────────────────

export interface MistralFIMCompletionCreateParams {
  model: string;
  prompt: string;
  suffix?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  min_tokens?: number;
  stream?: boolean;
  random_seed?: number;
  stop?: string | string[];
  [key: string]: unknown;
}

export interface MistralFIMCompletion {
  id: string;
  object: 'chat.completion' | 'fim.completion' | (string & {});
  created: number;
  model: string;
  choices: MistralChatCompletionChoice[];
  usage?: MistralUsage;
  [key: string]: unknown;
}

// ─── Agents completions ──────────────────────────────────────────────────────

export interface MistralAgentsCompletionCreateParams {
  agent_id: string;
  messages: MistralChatMessage[];
  max_tokens?: number;
  stream?: boolean;
  stop?: string | string[];
  random_seed?: number;
  response_format?: MistralResponseFormat;
  tools?: MistralTool[];
  tool_choice?: MistralToolChoice;
  parallel_tool_calls?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
  n?: number;
  prediction?: { type: 'content'; content: string };
  [key: string]: unknown;
}

export type MistralAgentsCompletion = MistralChatCompletion;

// ─── Models ──────────────────────────────────────────────────────────────────

export interface MistralModel {
  id: string;
  object: 'model' | (string & {});
  created?: number;
  owned_by?: string;
  capabilities?: Record<string, boolean>;
  name?: string;
  description?: string;
  max_context_length?: number;
  aliases?: string[];
  deprecation?: string | null;
  default_model_temperature?: number | null;
  type?: string;
  [key: string]: unknown;
}

export interface MistralModelsListResponse {
  object: 'list' | (string & {});
  data: MistralModel[];
  [key: string]: unknown;
}

// ─── Error body ──────────────────────────────────────────────────────────────

/**
 * Provider-native error body returned by Mistral when a request fails. The
 * proxy passes this shape through under `LiteLLMError.body` when routing to
 * Mistral.
 *
 * Reference: https://docs.mistral.ai/api/
 */
export interface MistralErrorBody {
  object: 'error';
  message: string | { detail: Array<Record<string, unknown>> };
  type: string;
  param: string | null;
  code: string;
}
