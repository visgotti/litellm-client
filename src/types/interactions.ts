// ─────────────────────────────────────────────────────────────────────────────
// Interactions API — top-level `/interactions` (and `/v1beta/interactions`)
// surfaces; the v1beta variant lives on `client.gemini.interactions`.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Body for `POST /interactions`. The proxy proxies this to whichever provider
 * backs the requested model, so the body is intentionally permissive.
 *
 * @see https://docs.litellm.ai/docs/interactions
 */
export interface InteractionCreateParams {
  /** Model that should service the interaction. */
  model?: string | null;
  /** User input — string or structured prompt parts. */
  input?: unknown;
  /** Optional system instruction. */
  system_instruction?: unknown;
  /** Provider-specific generation config. */
  generation_config?: Record<string, unknown> | null;
  /** Identifier of a prior interaction to continue from. */
  previous_interaction_id?: string | null;
  /** When `true`, the proxy will stream chunks. */
  stream?: boolean;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * An interaction record returned by the interactions API.
 *
 * @see https://docs.litellm.ai/docs/interactions
 */
export interface InteractionObject {
  id: string;
  object?: 'interaction' | string;
  model?: string;
  status?: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | string;
  role?: string;
  outputs?: Array<{ type: string; text?: string; [key: string]: unknown }>;
  usage?: {
    total_input_tokens?: number;
    total_output_tokens?: number;
    total_tokens?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Response from `DELETE /interactions/{interaction_id}`. */
export interface InteractionDeletedResponse {
  id: string;
  deleted: boolean;
  object?: string;
  [key: string]: unknown;
}
