// ─────────────────────────────────────────────────────────────────────────────
// Cache endpoints — operations + settings
// ─────────────────────────────────────────────────────────────────────────────

// ─── Operations ─────────────────────────────────────────────────────────────

/** POST /cache/delete — request body. */
export interface CacheDeleteParams {
  /** Cache keys to delete. */
  keys: string[];
}

/** POST /cache/delete — response. */
export interface CacheDeleteResponse {
  status?: string;
  deleted?: string[] | number;
  [key: string]: unknown;
}

/** POST /cache/flushall — response. */
export interface CacheFlushAllResponse {
  status?: string;
  message?: string;
  [key: string]: unknown;
}

/** GET /ping — response. */
export interface CachePingResponse {
  status?: string;
  cache_type?: string;
  ping_response?: unknown;
  set_cache_response?: unknown;
  litellm_cache_params?: Record<string, unknown>;
  health_check_cache_params?: Record<string, unknown>;
  [key: string]: unknown;
}

/** GET /redis/info — response. */
export interface CacheRedisInfoResponse {
  [key: string]: unknown;
}

// ─── Settings ───────────────────────────────────────────────────────────────

/** A single configurable cache setting (metadata + current value). */
export interface CacheSettingsField {
  name: string;
  type?: string;
  description?: string;
  default?: unknown;
  options?: unknown[];
  required?: boolean;
  [key: string]: unknown;
}

/** GET /cache/settings — response. */
export interface CacheSettingsGetResponse {
  fields: CacheSettingsField[];
  current_values: Record<string, unknown>;
  redis_type_descriptions: Record<string, string>;
  [key: string]: unknown;
}

/** POST /cache/settings — request body. */
export interface CacheSettingsUpdateParams {
  cache_settings: Record<string, unknown>;
}

/** POST /cache/settings — response. */
export interface CacheSettingsUpdateResponse {
  message: string;
  status: string;
  settings: Record<string, unknown>;
  [key: string]: unknown;
}

/** POST /cache/settings/test — request body. */
export interface CacheSettingsTestParams {
  cache_settings: Record<string, unknown>;
}

/** POST /cache/settings/test — response. */
export interface CacheSettingsTestResponse {
  status: string;
  message: string;
  error?: string | null;
  [key: string]: unknown;
}
