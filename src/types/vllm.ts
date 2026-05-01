// ─────────────────────────────────────────────────────────────────────────────
// vLLM pass-through types.
// vLLM exposes an OpenAI-compatible HTTP API, so we re-use the existing
// OpenAI-compatible chat / completions / embeddings types here. Only a small
// `models.list` response shape is added because vLLM's `/v1/models` payload
// matches OpenAI's.
// References:
//   https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ChatCompletionCreateParams,
  ChatCompletion,
  ChatCompletionChunk,
} from './chat';
import type { CompletionCreateParams, Completion, CompletionChunk } from './completions';
import type { EmbeddingCreateParams, EmbeddingResponse } from './embeddings';

export type VLLMChatCompletionCreateParams = ChatCompletionCreateParams;
export type VLLMChatCompletion = ChatCompletion;
export type VLLMChatCompletionChunk = ChatCompletionChunk;

export type VLLMCompletionCreateParams = CompletionCreateParams;
export type VLLMCompletion = Completion;
export type VLLMCompletionChunk = CompletionChunk;

export type VLLMEmbeddingCreateParams = EmbeddingCreateParams;
export type VLLMEmbeddingResponse = EmbeddingResponse;

export interface VLLMModel {
  id: string;
  object: 'model' | (string & {});
  created?: number;
  owned_by?: string;
  root?: string;
  parent?: string | null;
  max_model_len?: number;
  permission?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface VLLMModelsListResponse {
  object: 'list' | (string & {});
  data: VLLMModel[];
  [key: string]: unknown;
}
