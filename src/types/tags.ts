// ─────────────────────────────────────────────────────────────────────────────
// Tag Management
// ─────────────────────────────────────────────────────────────────────────────

export interface TagBase {
  name: string;
  description?: string;
  /** List of model_id or model_name values allowed for this tag. */
  models?: string[];
  /** Map of model_id → model_name resolved by the server. */
  model_info?: Record<string, string>;
}

export interface TagConfig extends TagBase {
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  litellm_budget_table?: Record<string, unknown> | null;
}

export interface TagCreateParams extends TagBase {
  budget_id?: string;
  /** Budget fields used when no budget_id is supplied. */
  max_budget?: number | null;
  soft_budget?: number | null;
  max_parallel_requests?: number | null;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  model_max_budget?: Record<string, number>;
  budget_duration?: string | null;
}

export interface TagCreateResponse {
  message?: string;
  tag?: TagConfig;
  [key: string]: unknown;
}

export interface TagUpdateParams extends TagBase {
  budget_id?: string;
  max_budget?: number | null;
  soft_budget?: number | null;
  max_parallel_requests?: number | null;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  model_max_budget?: Record<string, number>;
  budget_duration?: string | null;
}

export interface TagUpdateResponse {
  message?: string;
  tag?: TagConfig;
  [key: string]: unknown;
}

export interface TagInfoParams {
  names: string[];
}
export type TagInfoResponse = Record<string, TagConfig>;

export interface TagDeleteParams {
  name: string;
}
export interface TagDeleteResponse {
  message?: string;
  [key: string]: unknown;
}

export type TagListResponse = TagConfig[];

export interface TagDailyActivityParams {
  /** Comma-separated list of tags. */
  tags?: string;
  start_date?: string;
  end_date?: string;
  model?: string;
  api_key?: string;
  page?: number;
  page_size?: number;
}
export interface TagDailyActivityResponse {
  results?: unknown[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface DistinctTag {
  tag: string;
}
export interface TagDistinctResponse {
  results: DistinctTag[];
}

export interface TagActiveUsersParams {
  /** Filter by a single tag (legacy). */
  tag_filter?: string;
  /** Filter by multiple tags; takes precedence over `tag_filter`. */
  tag_filters?: string[];
}

export interface TagActiveUsersEntry {
  tag: string;
  active_users: number;
  date: string;
  period_start?: string | null;
  period_end?: string | null;
}
export interface TagActiveUsersResponse {
  results: TagActiveUsersEntry[];
}

export interface TagSummaryParams {
  start_date: string;
  end_date: string;
  tag_filter?: string;
  tag_filters?: string[];
}

export interface TagSummaryEntry {
  tag: string;
  unique_users: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens: number;
  total_spend: number;
}
export interface TagSummaryResponse {
  results: TagSummaryEntry[];
}

export interface TagPerUserAnalyticsParams {
  tag_filter?: string;
  tag_filters?: string[];
  page?: number;
  page_size?: number;
}

export interface TagPerUserMetrics {
  user_id: string;
  user_email?: string | null;
  user_agent?: string | null;
  successful_requests: number;
  failed_requests: number;
  total_requests: number;
  total_tokens: number;
  spend: number;
}
export interface TagPerUserAnalyticsResponse {
  results: TagPerUserMetrics[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}
