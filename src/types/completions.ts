import type { ChatModel } from './models-enum';
import type { Usage } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Legacy text completions (POST /v1/completions)
// ─────────────────────────────────────────────────────────────────────────────

export interface CompletionCreateParamsBase {
  model: ChatModel;
  prompt: string | string[] | number[] | number[][];
  best_of?: number | null;
  echo?: boolean | null;
  frequency_penalty?: number | null;
  logit_bias?: Record<string, number> | null;
  logprobs?: number | null;
  max_tokens?: number | null;
  n?: number | null;
  presence_penalty?: number | null;
  seed?: number | null;
  stop?: string | string[] | null;
  suffix?: string | null;
  temperature?: number | null;
  top_p?: number | null;
  user?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface CompletionCreateParamsNonStreaming extends CompletionCreateParamsBase {
  stream?: false | null;
}

export interface CompletionCreateParamsStreaming extends CompletionCreateParamsBase {
  stream: true;
  stream_options?: { include_usage?: boolean };
}

export type CompletionCreateParams =
  | CompletionCreateParamsNonStreaming
  | CompletionCreateParamsStreaming;

export interface CompletionChoice {
  index: number;
  text: string;
  finish_reason: string | null;
  logprobs?: {
    tokens: string[];
    token_logprobs: number[];
    top_logprobs?: Array<Record<string, number>> | null;
    text_offset: number[];
  } | null;
}

export interface Completion {
  id: string;
  object: 'text_completion';
  created: number;
  model: string;
  choices: CompletionChoice[];
  usage?: Usage;
  system_fingerprint?: string;
}

export interface CompletionChunk {
  id: string;
  object: 'text_completion';
  created: number;
  model: string;
  choices: CompletionChoice[];
  usage?: Usage | null;
  system_fingerprint?: string;
}
