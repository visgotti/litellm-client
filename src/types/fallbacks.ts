// ─────────────────────────────────────────────────────────────────────────────
// Fallback Management
// Mirrors litellm/proxy/management_endpoints/fallback_management_endpoints.py
// and the request/response shapes in
// litellm/types/management_endpoints/router_settings_endpoints.py.
// ─────────────────────────────────────────────────────────────────────────────

/** Type of fallback list to target. */
export type FallbackType = 'general' | 'context_window' | 'content_policy';

/**
 * Body for `POST /fallback`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/fallback_management_endpoints.py
 */
export interface FallbackCreateParams {
  /** Primary model name to configure fallbacks for. */
  model: string;
  /** Ordered list of fallback model names. */
  fallback_models: string[];
  /** Fallback type to target (default `general`). */
  fallback_type?: FallbackType;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `POST /fallback`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/fallback_management_endpoints.py
 */
export interface FallbackResponse {
  /** Primary model name. */
  model: string;
  /** Configured fallback model list. */
  fallback_models: string[];
  /** Fallback type stored. */
  fallback_type: string;
  /** Human-readable status. */
  message: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /fallback/{model}`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/fallback_management_endpoints.py
 */
export interface FallbackGetResponse {
  /** Primary model name. */
  model: string;
  /** Configured fallback model list. */
  fallback_models: string[];
  /** Fallback type returned. */
  fallback_type: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `DELETE /fallback/{model}`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/fallback_management_endpoints.py
 */
export interface FallbackDeleteResponse {
  /** Primary model name. */
  model: string;
  /** Fallback type that was removed. */
  fallback_type: string;
  /** Human-readable status. */
  message: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Optional query parameters for `GET`/`DELETE /fallback/{model}`. */
export interface FallbackQueryParams {
  /** Fallback type to retrieve/remove (default `general`). */
  fallback_type?: FallbackType;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}
