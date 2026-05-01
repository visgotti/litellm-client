import type { ChatModel } from './models-enum';
import type { Usage } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Legacy text completions (POST /v1/completions)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Common parameters for the legacy text-completion endpoint.
 *
 * @see https://docs.litellm.ai/docs/text_completion
 */
export interface CompletionCreateParamsBase {
  /** Model to use. */
  model: ChatModel;
  /** Prompt(s) — strings or pre-tokenized integer IDs. */
  prompt: string | string[] | number[] | number[][];
  /** Generate `best_of` candidates server-side and return the best `n`. */
  best_of?: number | null;
  /** Echo the prompt back in the response. */
  echo?: boolean | null;
  /** Penalty for token frequency in `[-2.0, 2.0]`. */
  frequency_penalty?: number | null;
  /** Map from token ID to bias `[-100, 100]` applied during sampling. */
  logit_bias?: Record<string, number> | null;
  /** Return log-probabilities of the top-k tokens at each position. */
  logprobs?: number | null;
  /** Maximum number of tokens to generate. */
  max_tokens?: number | null;
  /** Number of completions to generate per prompt. */
  n?: number | null;
  /** Penalty for token presence in `[-2.0, 2.0]`. */
  presence_penalty?: number | null;
  /** Random seed for reproducible sampling. */
  seed?: number | null;
  /** String(s) at which to stop generation. */
  stop?: string | string[] | null;
  /** Text appended after the completion (insertion mode). */
  suffix?: string | null;
  /** Sampling temperature in `[0, 2]`. */
  temperature?: number | null;
  /** Nucleus-sampling cutoff in `(0, 1]`. */
  top_p?: number | null;
  /** End-user identifier forwarded to the provider for abuse detection. */
  user?: string;
  /** Free-form metadata logged with the request. */
  metadata?: Record<string, unknown>;
  /** Tags forwarded to the LiteLLM proxy for spend / routing reporting. */
  tags?: string[];
}

/**
 * Non-streaming text-completion parameters.
 *
 * @see https://docs.litellm.ai/docs/text_completion
 */
export interface CompletionCreateParamsNonStreaming extends CompletionCreateParamsBase {
  /** Set to `false` (or omit) to receive a single response object. */
  stream?: false | null;
}

/**
 * Streaming text-completion parameters.
 *
 * @see https://docs.litellm.ai/docs/text_completion
 */
export interface CompletionCreateParamsStreaming extends CompletionCreateParamsBase {
  /** Set to `true` to receive Server-Sent Events. */
  stream: true;
  /** Streaming-specific options. */
  stream_options?: {
    /** Include a final chunk with `usage` totals. */
    include_usage?: boolean;
  };
}

export type CompletionCreateParams =
  | CompletionCreateParamsNonStreaming
  | CompletionCreateParamsStreaming;

/**
 * A single completion candidate.
 *
 * @see https://docs.litellm.ai/docs/text_completion
 */
export interface CompletionChoice {
  /** Position of this choice in the response array. */
  index: number;
  /** Generated text. */
  text: string;
  /** Reason the model stopped generating (`'stop'`, `'length'`, `'content_filter'`, ...). */
  finish_reason: string | null;
  /** Per-token log-probabilities (when `logprobs` was requested). */
  logprobs?: {
    /** Generated tokens as text. */
    tokens: string[];
    /** Log-probability of each generated token. */
    token_logprobs: number[];
    /** Top-k log-probabilities at each position. */
    top_logprobs?: Array<Record<string, number>> | null;
    /** Character offset of each token within the response. */
    text_offset: number[];
  } | null;
}

/**
 * Non-streaming completion response.
 *
 * @see https://docs.litellm.ai/docs/text_completion
 */
export interface Completion {
  /** Unique identifier for the completion. */
  id: string;
  /** Always `'text_completion'`. */
  object: 'text_completion';
  /** Unix timestamp (seconds) of generation. */
  created: number;
  /** Model that produced the completion. */
  model: string;
  /** Generated candidates. */
  choices: CompletionChoice[];
  /** Token usage totals for this call. */
  usage?: Usage;
  /** Provider-specific fingerprint for the backend configuration. */
  system_fingerprint?: string;
}

/**
 * A single chunk in a streamed completion response.
 *
 * @see https://docs.litellm.ai/docs/text_completion
 */
export interface CompletionChunk {
  /** Unique identifier of the parent completion. */
  id: string;
  /** Always `'text_completion'`. */
  object: 'text_completion';
  /** Unix timestamp (seconds) of generation. */
  created: number;
  /** Model that is producing the completion. */
  model: string;
  /** Incremental candidates produced in this chunk. */
  choices: CompletionChoice[];
  /** Final usage totals (only present in the last chunk when requested). */
  usage?: Usage | null;
  /** Provider-specific fingerprint for the backend configuration. */
  system_fingerprint?: string;
}
