// ─────────────────────────────────────────────────────────────────────────────
// Tag Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Common fields for tag create / update payloads and responses.
 *
 * @see https://docs.litellm.ai/docs/proxy/tags
 */
export interface TagBase {
  /** Tag name (unique). */
  name: string;
  /** Human-readable description. */
  description?: string;
  /** List of model_id or model_name values allowed for this tag. */
  models?: string[];
  /** Map of model_id → model_name resolved by the server. */
  model_info?: Record<string, string>;
}

/**
 * A stored tag configuration row.
 *
 * @see https://docs.litellm.ai/docs/proxy/tags
 */
export interface TagConfig extends TagBase {
  /** ISO-8601 creation timestamp. */
  created_at: string;
  /** ISO-8601 last-update timestamp. */
  updated_at: string;
  /** Identifier of the creating user. */
  created_by?: string | null;
  /** Joined budget row attached to the tag. */
  litellm_budget_table?: Record<string, unknown> | null;
}

/**
 * Parameters for `POST /tag/new`.
 *
 * @see https://docs.litellm.ai/docs/proxy/tags
 */
export interface TagCreateParams extends TagBase {
  /** Optional Budget object ID to attach. */
  budget_id?: string;
  /** Spending limit (USD) — used when no budget_id is supplied. */
  max_budget?: number | null;
  /** Soft budget that triggers an alert without rejecting requests. */
  soft_budget?: number | null;
  /** Maximum parallel requests. */
  max_parallel_requests?: number | null;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** Per-model spend ceilings. */
  model_max_budget?: Record<string, unknown> | null;
  /** Budget reset window. */
  budget_duration?: string | null;
}

/**
 * Response from `POST /tag/new`.
 *
 * @see https://docs.litellm.ai/docs/proxy/tags
 */
export interface TagCreateResponse {
  /** Human-readable status. */
  message?: string;
  /** The created tag. */
  tag?: TagConfig;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Parameters for `POST /tag/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/tags
 */
export interface TagUpdateParams extends TagBase {
  /** Optional Budget object ID to attach. */
  budget_id?: string;
  /** Replacement spending limit (USD). */
  max_budget?: number | null;
  /** Replacement soft budget. */
  soft_budget?: number | null;
  /** Replacement max parallel requests. */
  max_parallel_requests?: number | null;
  /** Replacement TPM limit. */
  tpm_limit?: number | null;
  /** Replacement RPM limit. */
  rpm_limit?: number | null;
  /** Replacement per-model spend ceilings. */
  model_max_budget?: Record<string, unknown> | null;
  /** Replacement budget reset window. */
  budget_duration?: string | null;
}

/** Response from `POST /tag/update`. */
export interface TagUpdateResponse {
  /** Human-readable status. */
  message?: string;
  /** Updated tag. */
  tag?: TagConfig;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Body for `POST /tag/info`. */
export interface TagInfoParams {
  /** Tag names to look up. */
  names: string[];
}
export type TagInfoResponse = Record<string, TagConfig>;

/** Body for `POST /tag/delete`. */
export interface TagDeleteParams {
  /** Tag name to delete. */
  name: string;
}
/** Response from `POST /tag/delete`. */
export interface TagDeleteResponse {
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

export type TagListResponse = TagConfig[];

/** Query parameters for the tag daily-activity endpoint. */
export interface TagDailyActivityParams {
  /** Comma-separated list of tags. */
  tags?: string;
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
  /** Filter to a specific model. */
  model?: string;
  /** Filter to a specific API key. */
  api_key?: string;
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
}
/** Response from the tag daily-activity endpoint. */
export interface TagDailyActivityResponse {
  /** Per-day / per-tag activity rows. */
  results?: unknown[];
  /** Aggregate metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Distinct-tag entry. */
export interface DistinctTag {
  /** Tag string. */
  tag: string;
}
/** Response listing distinct tags observed by the proxy. */
export interface TagDistinctResponse {
  /** Distinct-tag rows. */
  results: DistinctTag[];
}

/** Query parameters for the active-users-by-tag endpoint. */
export interface TagActiveUsersParams {
  /** Filter by a single tag (legacy). */
  tag_filter?: string;
  /** Filter by multiple tags; takes precedence over `tag_filter`. */
  tag_filters?: string[];
}

/** A single active-users-by-tag entry. */
export interface TagActiveUsersEntry {
  /** Tag string. */
  tag: string;
  /** Number of distinct users. */
  active_users: number;
  /** Calendar date (YYYY-MM-DD). */
  date: string;
  /** ISO-8601 start of the active-users window. */
  period_start?: string | null;
  /** ISO-8601 end of the active-users window. */
  period_end?: string | null;
}
/** Response from the active-users-by-tag endpoint. */
export interface TagActiveUsersResponse {
  /** Per-tag active-user rows. */
  results: TagActiveUsersEntry[];
}

/** Query parameters for the tag-summary endpoint. */
export interface TagSummaryParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date: string;
  /** Filter by a single tag (legacy). */
  tag_filter?: string;
  /** Filter by multiple tags; takes precedence over `tag_filter`. */
  tag_filters?: string[];
}

/** Aggregate summary entry for a single tag. */
export interface TagSummaryEntry {
  /** Tag string. */
  tag: string;
  /** Number of distinct users. */
  unique_users: number;
  /** Total requests. */
  total_requests: number;
  /** Successful requests. */
  successful_requests: number;
  /** Failed requests. */
  failed_requests: number;
  /** Total tokens consumed. */
  total_tokens: number;
  /** Cumulative spend (USD). */
  total_spend: number;
}
/** Response from the tag-summary endpoint. */
export interface TagSummaryResponse {
  /** Per-tag summary rows. */
  results: TagSummaryEntry[];
}

/** Query parameters for per-user analytics by tag. */
export interface TagPerUserAnalyticsParams {
  /** Filter by a single tag (legacy). */
  tag_filter?: string;
  /** Filter by multiple tags; takes precedence over `tag_filter`. */
  tag_filters?: string[];
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
}

/** Per-user metrics for a tag. */
export interface TagPerUserMetrics {
  /** User identifier. */
  user_id: string;
  /** User email. */
  user_email?: string | null;
  /** User-agent string seen on requests. */
  user_agent?: string | null;
  /** Successful requests. */
  successful_requests: number;
  /** Failed requests. */
  failed_requests: number;
  /** Total requests. */
  total_requests: number;
  /** Total tokens consumed. */
  total_tokens: number;
  /** Cumulative spend (USD). */
  spend: number;
}
/** Response from the per-user-by-tag analytics endpoint. */
export interface TagPerUserAnalyticsResponse {
  /** Page of per-user metrics. */
  results: TagPerUserMetrics[];
  /** Total users matching the query. */
  total_count: number;
  /** Current page number. */
  page: number;
  /** Page size. */
  page_size: number;
  /** Total page count. */
  total_pages: number;
}
