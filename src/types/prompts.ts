import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Prompts management — `/prompts` CRUD + `/beta/litellm_prompt_management`
//
// LiteLLM exposes a `/prompts` surface for dynamic, DB-backed prompt templates
// that can be created/updated via API (as opposed to config-loaded prompts).
//
// The public docs are sparse (they defer to the Swagger spec for full
// schemas), so the types below stay open via `[key: string]: unknown` index
// signatures while still surfacing the well-known fields.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single prompt template stored on the proxy.
 *
 * NOTE: docs are sparse — fields kept open via the index signature. The
 * canonical id field is `prompt_id`; some payloads also include a generic
 * `id`, hence both are surfaced as optional.
 *
 * @see https://docs.litellm.ai/docs/proxy/prompt_management
 */
export interface PromptObject {
  /** Generic identifier (often mirrors `prompt_id`). */
  id?: string;
  /** Stable identifier for the prompt template. */
  prompt_id: string;
  /** Human-readable name. */
  name?: string;
  /** Free-form description. */
  description?: string;
  /**
   * The prompt template body. Typically a list of chat messages
   * (e.g. `[{ role: 'system', content: '...' }, ...]`) but the proxy
   * accepts either a string template or an arbitrary structure.
   */
  prompt_template?: unknown;
  /** Default model to associate with the prompt template. */
  model?: string | null;
  /** Default optional params (temperature, max_tokens, etc.). */
  prompt_template_optional_params?: Record<string, unknown> | null;
  /** Free-form metadata. */
  metadata?: Record<string, unknown> | null;
  /** Tags associated with the prompt. */
  tags?: string[] | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString | null;
  /** Identifier of the user that created the prompt. */
  created_by?: string | null;
  /** Identifier of the user that last updated the prompt. */
  updated_by?: string | null;
  /** Free-form additional fields forwarded by the proxy. */
  [key: string]: unknown;
}

/**
 * Body for `POST /prompts`.
 *
 * @see https://docs.litellm.ai/docs/proxy/prompt_management
 */
export interface PromptCreateParams {
  /** Stable identifier — usually required. */
  prompt_id: string;
  /** Human-readable name. */
  name?: string;
  /** Free-form description. */
  description?: string;
  /** Prompt template body. */
  prompt_template?: unknown;
  /** Default model. */
  model?: string | null;
  /** Default sampling / completion parameters. */
  prompt_template_optional_params?: Record<string, unknown> | null;
  /** Free-form metadata. */
  metadata?: Record<string, unknown> | null;
  /** Tags associated with the prompt. */
  tags?: string[] | null;
  /** Free-form additional fields forwarded to the proxy. */
  [key: string]: unknown;
}

/**
 * Body for `PUT /prompts/{prompt_id}` (partial update).
 *
 * @see https://docs.litellm.ai/docs/proxy/prompt_management
 */
export interface PromptUpdateParams {
  /** New display name. */
  name?: string;
  /** New description. */
  description?: string;
  /** Updated prompt template body. */
  prompt_template?: unknown;
  /** Updated default model. */
  model?: string | null;
  /** Updated default sampling parameters. */
  prompt_template_optional_params?: Record<string, unknown> | null;
  /** Replacement metadata. */
  metadata?: Record<string, unknown> | null;
  /** Replacement tags. */
  tags?: string[] | null;
  /** Free-form additional fields forwarded to the proxy. */
  [key: string]: unknown;
}

/**
 * Response for prompt list endpoints — kept tolerant for nested list
 * methods like `versions()` that return a similar page shape.
 *
 * @see https://docs.litellm.ai/docs/proxy/prompt_management
 */
export interface PromptListResponse {
  /** Page of prompts (canonical key). */
  prompts?: PromptObject[];
  /** Some proxy versions return `data` instead of `prompts`. */
  data?: PromptObject[];
  /** Total number of prompts matching the query. */
  total?: number;
  /** Current page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Body for `PATCH /prompts/{prompt_id}` (partial replacement).
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/prompts/prompt_endpoints.py
 */
export type PromptPatchParams = Partial<PromptUpdateParams>;

/**
 * Response for `GET /prompts/list` — wrapped legacy list payload used by the
 * management UI. Distinct from the canonical `PromptListResponse` (which
 * matches `GET /prompts`).
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/prompts/prompt_endpoints.py
 */
export interface PromptListLegacyResponse {
  /** Page of prompts. */
  prompts: PromptObject[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Response for `DELETE /prompts/{prompt_id}`.
 *
 * @see https://docs.litellm.ai/docs/proxy/prompt_management
 */
export interface PromptDeleteResponse {
  /** Human-readable status. */
  message?: string;
  /** ID of the deleted prompt. */
  prompt_id?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Body for `POST /prompts/test`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/prompts/prompt_endpoints.py
 */
export interface PromptTestParams {
  /** Raw `.prompt` (dotprompt) content to render. */
  dotprompt_content: string;
  /** Variables to render the template with. */
  prompt_variables?: Record<string, unknown> | null;
  /** Conversation history to append after the rendered system messages. */
  conversation_history?: Array<Record<string, string>> | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `POST /utils/dotprompt_json_converter`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/prompts/prompt_endpoints.py
 */
export interface DotpromptJsonConverterResponse {
  /** Prompt id derived from the file name. */
  prompt_id?: string;
  /** Parsed dotprompt content + metadata. */
  json_data?: Record<string, unknown>;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

