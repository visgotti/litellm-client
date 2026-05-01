// ─────────────────────────────────────────────────────────────────────────────
// OpenAI Passthrough admin CRUD — `/openai_passthrough/{id}`
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Body for `POST /openai_passthrough/{id}` and the PUT/PATCH variants.
 *
 * The proxy treats this resource as an open-shape config blob (provider URL,
 * auth headers, request transforms, etc.). The exact accepted keys depend on
 * the proxy version — fields are kept loose so the SDK doesn't lag behind
 * upstream additions.
 */
export interface OpenAIPassthroughCreateParams {
  /** Free-form passthrough configuration. */
  [key: string]: unknown;
}

/** Body for `PATCH /openai_passthrough/{id}`. */
export type OpenAIPassthroughPatchParams = Partial<OpenAIPassthroughCreateParams>;

/** Body for `PUT /openai_passthrough/{id}` (full replacement). */
export type OpenAIPassthroughReplaceParams = OpenAIPassthroughCreateParams;

/**
 * The persisted passthrough config record returned from create/retrieve/etc.
 *
 * Loose-shaped because the proxy may add additional fields over time.
 */
export interface OpenAIPassthroughConfig {
  /** Identifier (matches the `{id}` path segment). */
  id?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from `DELETE /openai_passthrough/{id}`. */
export interface OpenAIPassthroughDeleteResponse {
  id?: string;
  deleted?: boolean;
  message?: string;
  [key: string]: unknown;
}
