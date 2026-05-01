// ─────────────────────────────────────────────────────────────────────────────
// Cache endpoints — operations + settings
// ─────────────────────────────────────────────────────────────────────────────

// ─── Operations ─────────────────────────────────────────────────────────────

/**
 * POST /cache/delete — request body.
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CacheDeleteParams {
  /** Cache keys to delete. */
  keys: string[];
}

/**
 * POST /cache/delete — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CacheDeleteResponse {
  /** Outcome marker (e.g. `'success'`). */
  status?: string;
  /** Deleted keys, or count of keys deleted. */
  deleted?: string[] | number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * POST /cache/flushall — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CacheFlushAllResponse {
  /** Outcome marker. */
  status?: string;
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * GET /cache/ping — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CachePingResponse {
  /** Outcome marker. */
  status?: string;
  /** Cache backend type (e.g. `'redis'`). */
  cache_type?: string;
  /** Raw response from the cache ping. */
  ping_response?: unknown;
  /** Result of writing a probe key. */
  set_cache_response?: unknown;
  /** Effective LiteLLM cache parameters. */
  litellm_cache_params?: Record<string, unknown>;
  /** Effective health-check cache parameters. */
  health_check_cache_params?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * GET /redis/info — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CacheRedisInfoResponse {
  /** Free-form Redis INFO output. */
  [key: string]: unknown;
}

// ─── Settings ───────────────────────────────────────────────────────────────

/**
 * A single configurable cache setting (metadata + current value).
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CacheSettingsField {
  /** Setting name. */
  name: string;
  /** TypeScript-style type hint for the value. */
  type?: string;
  /** Human-readable description. */
  description?: string;
  /** Default value when unset. */
  default?: unknown;
  /** Allowed values for enum-style settings. */
  options?: unknown[];
  /** Whether the setting is required. */
  required?: boolean;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * GET /cache/settings — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CacheSettingsGetResponse {
  /** Field metadata for each cache setting. */
  fields: CacheSettingsField[];
  /** Current value for each setting. */
  current_values: Record<string, unknown>;
  /** Per-Redis-type human-readable descriptions. */
  redis_type_descriptions: Record<string, string>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * POST /cache/settings — request body.
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CacheSettingsUpdateParams {
  /** Replacement cache settings. */
  cache_settings: Record<string, unknown>;
}

/**
 * POST /cache/settings — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CacheSettingsUpdateResponse {
  /** Human-readable status. */
  message: string;
  /** Outcome marker. */
  status: string;
  /** Resulting settings. */
  settings: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * POST /cache/settings/test — request body.
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CacheSettingsTestParams {
  /** Cache settings to probe. */
  cache_settings: Record<string, unknown>;
}

/**
 * POST /cache/settings/test — response.
 *
 * @see https://docs.litellm.ai/docs/proxy/caching
 */
export interface CacheSettingsTestResponse {
  /** Outcome marker (e.g. `'success'`, `'error'`). */
  status: string;
  /** Human-readable status. */
  message: string;
  /** Error message when the probe failed. */
  error?: string | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
