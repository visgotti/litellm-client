import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Spend / logs analytics
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Query parameters for `GET /spend/logs`.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface SpendLogsParams {
  /** Filter to a specific API key. */
  api_key?: string;
  /** Filter to a specific user. */
  user_id?: string;
  /** Filter to a specific request. */
  request_id?: string;
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
  /** Filter to a specific model. */
  model?: string;
  /** Filter to a specific team. */
  team_id?: string;
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
}

/**
 * One spend-log entry mirroring the proxy's `LiteLLM_SpendLogs` row.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface SpendLogEntry {
  /** Request identifier. */
  request_id: string;
  /** Call type (e.g. `'completion'`, `'embedding'`). */
  call_type?: string;
  /** Hashed API key. */
  api_key?: string | null;
  /** Cost (USD) of the request. */
  spend: number;
  /** Total tokens used by the request. */
  total_tokens?: number;
  /** Prompt tokens used. */
  prompt_tokens?: number;
  /** Completion tokens used. */
  completion_tokens?: number;
  /** ISO-8601 timestamp when the request started. */
  startTime?: ISODateString;
  /** ISO-8601 timestamp when the request finished. */
  endTime?: ISODateString;
  /** Model the request was routed to. */
  model?: string;
  /** Upstream provider base URL. */
  api_base?: string | null;
  /** End-user identifier attached to the request. */
  user?: string | null;
  /** Owning team ID. */
  team_id?: string | null;
  /** Free-form metadata stored with the row. */
  metadata?: Record<string, unknown> | null;
  /** Whether the response was served from cache. */
  cache_hit?: string | null;
  /** Cache key used. */
  cache_key?: string | null;
  /** Tags attached to the request. */
  request_tags?: string[];
  /** Other fields */
  [key: string]: unknown;
}

export type SpendLogsResponse = SpendLogEntry[] | { logs: SpendLogEntry[]; total?: number };

/** Query parameters for `GET /spend/tags`. */
export interface SpendByTagsParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
  /** Filter to specific tags. */
  tags?: string[];
}

/**
 * Aggregate spend grouped by request tag.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface SpendByTagEntry {
  /** Tag string. */
  individual_request_tag: string;
  /** Number of requests with the tag. */
  log_count: number;
  /** Total spend (USD) across those requests. */
  total_spend: number;
}
export type SpendByTagsResponse = SpendByTagEntry[];

/**
 * Daily-spend rollup entry.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface DailySpendEntry {
  /** Calendar date (YYYY-MM-DD). */
  date: string;
  /** Total spend (USD) on the day. */
  spend: number;
  /** Number of API requests on the day. */
  api_requests?: number;
  /** Total tokens used on the day. */
  total_tokens?: number;
  /** Per-model breakdown of spend / tokens. */
  models?: Record<string, { spend: number; total_tokens: number }>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Response from `GET /global/spend`.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface GlobalSpendResponse {
  /** Total proxy-wide spend (USD). */
  spend?: number;
  /** Configured global spending limit (USD). */
  max_budget?: number | null;
  /** Daily breakdown of spend. */
  daily_spend?: DailySpendEntry[];
  /** Total budget configured for the proxy (USD). */
  total_proxy_budget?: number | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Row shape mirrors the `Last30dKeysBySpend` Postgres view
 * (`api_key`, `key_alias`, `key_name`, `total_spend`).
 * The SDK keeps `token`/`spend` as legacy aliases for compatibility.
 */
export type SpendKeysResponse = Array<{
  /** Hashed API key. */
  api_key?: string;
  /** Display alias of the key. */
  key_alias?: string | null;
  /** Key name. */
  key_name?: string | null;
  /** Cumulative spend (USD) over the window. */
  total_spend?: number;
  /** @deprecated Alias for `api_key`. */
  token?: string;
  /** @deprecated Alias for `total_spend`. */
  spend?: number;
  /** Spending limit (USD). */
  max_budget?: number | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}>;
/**
 * Row shape mirrors the `Last30dModelsBySpend` Postgres view
 * (`model`, `total_spend`).
 */
export type SpendModelsResponse = Array<{
  /** Model identifier. */
  model: string;
  /** Cumulative spend (USD) over the window. */
  total_spend?: number;
  /** @deprecated Alias for `total_spend`. */
  spend?: number;
  /** Total tokens consumed by the model over the window. */
  total_tokens?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}>;

/**
 * Query parameters for `GET /user/daily/activity`.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface UserDailyActivityParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date: string;
  /** Filter to a specific API key. */
  api_key?: string;
  /** Filter to a specific user. */
  user_id?: string;
  /** Filter to a specific team. */
  team_id?: string;
  /** Filter to a specific model. */
  model?: string;
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
}

/** Response from `GET /user/daily/activity`. */
export interface UserDailyActivityResponse {
  /** Per-day / per-user activity rows. */
  results?: unknown[];
  /** Aggregate metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─── Extended spend / activity analytics ─────────────────────────────────────

/** Query parameters for `GET /spend/keys`. */
export interface SpendKeysParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
  /** Maximum results to return (alternative to pagination). */
  limit?: number;
}
/** Aggregate spend grouped by API key. */
export type SpendByKeysResponse = Array<{
  /** Hashed API key. */
  api_key?: string;
  /** Cumulative spend (USD). */
  spend?: number;
  /** Total tokens consumed. */
  total_tokens?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}>;

/** Query parameters for `GET /spend/users`. */
export interface SpendUsersParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
  /** Filter to a specific user. */
  user_id?: string;
}
/** Aggregate spend grouped by user. */
export type SpendByUsersResponse = Array<{
  /** User identifier. */
  user_id?: string;
  /** Cumulative spend (USD). */
  spend?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}>;

/** Query parameters for `GET /spend/logs/v2`. */
export interface SpendLogsV2Params extends SpendLogsParams {
  /** Filter to a specific request status. */
  status_filter?: string;
}
export type SpendLogsV2Response = SpendLogsResponse;

/** Query parameters for the UI spend-logs endpoint. */
export interface SpendLogsUiParams extends SpendLogsParams {
  /** Filter to a specific request status. */
  status_filter?: string;
}
export type SpendLogsUiResponse = SpendLogsResponse;

/** Detailed view of a single UI spend log row. */
export interface SpendLogUiResponse {
  /** Request identifier. */
  request_id: string;
  /** Captured request body. */
  request?: Record<string, unknown>;
  /** Captured response body. */
  response?: Record<string, unknown>;
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Query parameters for the UI session spend-logs endpoint. */
export interface SpendLogsSessionUiParams extends SpendLogsParams {
  /** Filter to a specific session. */
  session_id?: string;
}
export type SpendLogsSessionUiResponse = SpendLogsResponse;

/** Query parameters for `GET /global/spend/logs`. */
export interface GlobalSpendLogsParams {
  /** Filter to a specific API key. */
  api_key?: string;
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
}
export type GlobalSpendLogsResponse = SpendLogsResponse;

/** Query parameters for `GET /global/spend/provider`. */
export interface GlobalSpendProviderParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
}
/** Aggregate spend grouped by upstream provider. */
export type GlobalSpendProviderResponse = Array<{
  /** Provider identifier. */
  provider?: string;
  /** Cumulative spend (USD). */
  spend?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}>;

/**
 * Query parameters for `GET /global/spend/report`.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface GlobalSpendReportParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date: string;
  /** Aggregate spend by this dimension. */
  group_by?: 'team' | 'customer' | 'api_key' | (string & {});
  /** Filter to a specific API key. */
  api_key?: string;
  /** Filter to a specific team. */
  team_id?: string;
  /** Filter to a specific customer. */
  customer_id?: string;
}
/** Response from `GET /global/spend/report`. */
export interface GlobalSpendReportResponse {
  /** Aggregate rows. */
  results?: unknown[];
  /** Aggregate metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from `GET /global/all_tag_names`. */
export interface GlobalSpendAllTagNamesResponse {
  /** Distinct tag names observed. */
  tag_names: string[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Optional query parameters for `GET /global/spend/tags`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/spend_tracking/spend_management_endpoints.py
 */
export interface GlobalAllTagSpendParams {
  /** Inclusive lower bound (YYYY-MM-DD or ISO-8601). */
  start_date?: string;
  /** Inclusive upper bound (YYYY-MM-DD or ISO-8601). */
  end_date?: string;
  /** Comma-separated tag list to filter on. */
  tags?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response from `GET /global/spend/tags`. The proxy returns one row per
 * tag/day with the spend totals — schema kept open here.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/spend_tracking/spend_management_endpoints.py
 */
export type GlobalAllTagSpendResponse = Array<Record<string, unknown>>;

/** Response from `POST /global/spend/reset`. */
export interface GlobalSpendResetResponse {
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from refreshing the global-spend cache. */
export interface GlobalSpendRefreshResponse {
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Top-100 end users for a given api key.
 * Each row mirrors `(end_user, total_count, total_spend)` from the
 * `/global/spend/end_users` SQL aggregate.
 */
export type GlobalSpendEndUsersResponse = Array<{
  /** End-user identifier. */
  end_user: string | null;
  /** Number of requests by this user. */
  total_count?: number;
  /** Cumulative spend (USD). */
  total_spend?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}>;

/** @deprecated Use `GlobalSpendEndUsersResponse` — the proxy returns a bare array. */
export interface GlobalAllEndUsersResponse {
  /** Aggregated end-user rows. */
  end_users: Array<{ end_user: string; spend?: number; [key: string]: unknown }>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Query parameters for `GET /global/activity`. */
export interface GlobalActivityParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
  /** Filter to a specific API key. */
  api_key?: string;
  /** Filter to a specific model. */
  model?: string;
}
/**
 * Daily aggregate of API activity.
 *
 * @see https://docs.litellm.ai/docs/proxy/cost_tracking
 */
export interface GlobalActivityEntry {
  /** Calendar date (YYYY-MM-DD). */
  date: string;
  /** Number of API requests on the day. */
  api_requests?: number;
  /** Total tokens used on the day. */
  total_tokens?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
/** Response from `GET /global/activity`. */
export type GlobalActivityResponse = {
  /** Daily activity rows. */
  daily_data?: GlobalActivityEntry[];
  /** Total API requests across the window. */
  sum_api_requests?: number;
  /** Total tokens used across the window. */
  sum_total_tokens?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
};

/** Response from `GET /global/activity/model`. */
export type GlobalActivityByModelResponse = Array<{
  /** Model identifier. */
  model: string;
  /** Daily activity rows for this model. */
  daily_data?: GlobalActivityEntry[];
  /** Total API requests for this model. */
  sum_api_requests?: number;
  /** Total tokens used by this model. */
  sum_total_tokens?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}>;

/** Response from `GET /global/activity/exceptions`. */
export type GlobalActivityExceptionsResponse = Array<{
  /** Exception class name. */
  exception_type?: string;
  /** Calendar date (YYYY-MM-DD). */
  date?: string;
  /** Number of occurrences. */
  count?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}>;

/** Response from `GET /global/activity/exceptions_per_deployment`. */
export type GlobalActivityExceptionsByDeploymentResponse = Array<{
  /** Deployment identifier. */
  deployment?: string;
  /** Exception class name. */
  exception_type?: string;
  /** Number of occurrences. */
  count?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}>;

/** Response from `GET /global/activity/cache_hits`. */
export interface GlobalActivityCacheHitsResponse {
  /** Daily breakdown of cache hits / misses. */
  daily_data?: Array<{ date: string; cache_hits?: number; cache_misses?: number }>;
  /** Total cache hits across the window. */
  total_cache_hits?: number;
  /** Total cache misses across the window. */
  total_cache_misses?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
