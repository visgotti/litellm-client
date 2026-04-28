import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Spend / logs analytics
// ─────────────────────────────────────────────────────────────────────────────

export interface SpendLogsParams {
  api_key?: string;
  user_id?: string;
  request_id?: string;
  start_date?: string;
  end_date?: string;
  model?: string;
  team_id?: string;
  page?: number;
  page_size?: number;
}

export interface SpendLogEntry {
  request_id: string;
  call_type?: string;
  api_key?: string | null;
  spend: number;
  total_tokens?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  startTime?: ISODateString;
  endTime?: ISODateString;
  model?: string;
  api_base?: string | null;
  user?: string | null;
  team_id?: string | null;
  metadata?: Record<string, unknown> | null;
  cache_hit?: string | null;
  cache_key?: string | null;
  request_tags?: string[];
  /** Other fields */
  [key: string]: unknown;
}

export type SpendLogsResponse = SpendLogEntry[] | { logs: SpendLogEntry[]; total?: number };

export interface SpendByTagsParams {
  start_date?: string;
  end_date?: string;
  tags?: string[];
}

export interface SpendByTagEntry {
  individual_request_tag: string;
  log_count: number;
  total_spend: number;
}
export type SpendByTagsResponse = SpendByTagEntry[];

export interface DailySpendParams {
  start_date: string;
  end_date: string;
  api_key?: string;
  user_id?: string;
  team_id?: string;
  model?: string;
}

export interface DailySpendEntry {
  date: string;
  spend: number;
  api_requests?: number;
  total_tokens?: number;
  models?: Record<string, { spend: number; total_tokens: number }>;
  [key: string]: unknown;
}

export type DailySpendResponse = DailySpendEntry[];

export interface GlobalSpendResponse {
  spend?: number;
  max_budget?: number | null;
  daily_spend?: DailySpendEntry[];
  total_proxy_budget?: number | null;
  [key: string]: unknown;
}

export interface SpendUsersResponse extends Array<unknown> {}
export interface SpendKeysResponse extends Array<unknown> {}
export interface SpendModelsResponse extends Array<unknown> {}

export interface UserDailyActivityParams {
  start_date: string;
  end_date: string;
  api_key?: string;
  user_id?: string;
  team_id?: string;
  model?: string;
  page?: number;
  page_size?: number;
}

export interface UserDailyActivityResponse {
  results?: unknown[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// ─── Extended spend / activity analytics ─────────────────────────────────────

export interface SpendKeysParams {
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
  limit?: number;
}
export type SpendByKeysResponse = Array<{
  api_key?: string;
  spend?: number;
  total_tokens?: number;
  [key: string]: unknown;
}>;

export interface SpendUsersParams {
  start_date?: string;
  end_date?: string;
  user_id?: string;
}
export type SpendByUsersResponse = Array<{
  user_id?: string;
  spend?: number;
  [key: string]: unknown;
}>;

export interface SpendLogsV2Params extends SpendLogsParams {
  status_filter?: string;
}
export type SpendLogsV2Response = SpendLogsResponse;

export interface SpendLogsUiParams extends SpendLogsParams {
  status_filter?: string;
}
export type SpendLogsUiResponse = SpendLogsResponse;

export interface SpendLogUiResponse {
  request_id: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SpendLogsSessionUiParams extends SpendLogsParams {
  session_id?: string;
}
export type SpendLogsSessionUiResponse = SpendLogsResponse;

export interface GlobalSpendLogsParams {
  api_key?: string;
  start_date?: string;
  end_date?: string;
}
export type GlobalSpendLogsResponse = SpendLogsResponse;

export interface GlobalSpendProviderParams {
  start_date?: string;
  end_date?: string;
}
export type GlobalSpendProviderResponse = Array<{
  provider?: string;
  spend?: number;
  [key: string]: unknown;
}>;

export interface GlobalSpendReportParams {
  start_date: string;
  end_date: string;
  group_by?: 'team' | 'customer' | 'api_key' | (string & {});
  api_key?: string;
  team_id?: string;
  customer_id?: string;
}
export interface GlobalSpendReportResponse {
  results?: unknown[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GlobalSpendAllTagNamesResponse {
  tag_names: string[];
  [key: string]: unknown;
}

export interface GlobalSpendResetResponse {
  message?: string;
  [key: string]: unknown;
}

export interface GlobalSpendRefreshResponse {
  message?: string;
  [key: string]: unknown;
}

export interface GlobalAllEndUsersResponse {
  end_users: Array<{ end_user: string; spend?: number; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface GlobalActivityParams {
  start_date?: string;
  end_date?: string;
  api_key?: string;
  model?: string;
}
export interface GlobalActivityEntry {
  date: string;
  api_requests?: number;
  total_tokens?: number;
  [key: string]: unknown;
}
export type GlobalActivityResponse = {
  daily_data?: GlobalActivityEntry[];
  sum_api_requests?: number;
  sum_total_tokens?: number;
  [key: string]: unknown;
};

export type GlobalActivityByModelResponse = Array<{
  model: string;
  daily_data?: GlobalActivityEntry[];
  sum_api_requests?: number;
  sum_total_tokens?: number;
  [key: string]: unknown;
}>;

export type GlobalActivityExceptionsResponse = Array<{
  exception_type?: string;
  date?: string;
  count?: number;
  [key: string]: unknown;
}>;

export type GlobalActivityExceptionsByDeploymentResponse = Array<{
  deployment?: string;
  exception_type?: string;
  count?: number;
  [key: string]: unknown;
}>;

export interface GlobalActivityCacheHitsResponse {
  daily_data?: Array<{ date: string; cache_hits?: number; cache_misses?: number }>;
  total_cache_hits?: number;
  total_cache_misses?: number;
  [key: string]: unknown;
}
