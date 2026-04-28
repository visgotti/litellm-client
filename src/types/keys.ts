import type { ISODateString, PaginationParams } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Key Management (Virtual Keys)
// ─────────────────────────────────────────────────────────────────────────────

export interface KeyCreateParams {
  /** Models the key is allowed to access. Empty / omitted = all */
  models?: string[];
  /** Spending limit in USD */
  max_budget?: number | null;
  /** Soft budget that triggers an alert without rejecting requests. */
  soft_budget?: number | null;
  /** Budget duration: '1d', '7d', '30d', etc. */
  budget_duration?: string | null;
  /** Optional budget id linking to a Budget object */
  budget_id?: string;
  /** ISO date after which the key is invalid */
  expires?: ISODateString | null;
  /** Arbitrary metadata */
  metadata?: Record<string, unknown>;
  /** Team the key belongs to */
  team_id?: string;
  /** User the key belongs to */
  user_id?: string;
  /** Human-readable alias */
  key_alias?: string;
  /** Max parallel requests */
  max_parallel_requests?: number | null;
  /** Tokens per minute limit */
  tpm_limit?: number | null;
  /** Requests per minute limit */
  rpm_limit?: number | null;
  /** Duration the key is valid for (e.g. "30d") */
  duration?: string | null;
  /** Model aliases — request `gpt-4` and have it routed to `gpt-3.5-turbo`. */
  aliases?: Record<string, string>;
  /** Optional permissions object. */
  permissions?: Record<string, unknown>;
  /** Optional model max budgets. */
  model_max_budget?: Record<string, number>;
  /** Optional list of allowed cache controls. */
  allowed_cache_controls?: string[];
  /** Optional config override. */
  config?: Record<string, unknown>;
  /** Optional tags for cost tracking. */
  tags?: string[];
  /** Optional guardrails to apply. */
  guardrails?: string[];
  /** Send a key-creation email (Enterprise). */
  send_invite_email?: boolean;
  /** Block the key on creation. */
  blocked?: boolean;
}

export interface KeyCreateResponse {
  key: string;
  /** @deprecated Use `key`. */
  token?: string;
  key_name: string;
  expires: ISODateString | null;
  user_id: string | null;
  team_id: string | null;
  max_budget: number | null;
  models: string[];
  metadata: Record<string, unknown>;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  /** @deprecated kept for backwards compatibility. */
  spend?: number;
  budget_duration?: string | null;
  aliases?: Record<string, string>;
  [key: string]: unknown;
}

export interface KeyUpdateParams {
  key: string;
  models?: string[];
  max_budget?: number | null;
  soft_budget?: number | null;
  budget_duration?: string | null;
  expires?: ISODateString | null;
  metadata?: Record<string, unknown>;
  max_parallel_requests?: number | null;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  team_id?: string;
  user_id?: string;
  key_alias?: string;
  aliases?: Record<string, string>;
  permissions?: Record<string, unknown>;
  model_max_budget?: Record<string, number>;
  blocked?: boolean;
  tags?: string[];
  guardrails?: string[];
}

export interface KeyUpdateResponse {
  key: string;
  [key: string]: unknown;
}

export interface KeyDeleteParams {
  keys?: string[];
  key_aliases?: string[];
}

export interface KeyDeleteResponse {
  deleted_keys: string[];
  message?: string;
  num_deleted_keys?: number;
}

export interface KeyBlockParams {
  key: string;
}
export interface KeyUnblockParams {
  key: string;
}

export interface KeyRegenerateParams {
  key: string;
  /** Optional new key value. If omitted the proxy generates one. */
  new_key?: string;
  /** Optional metadata override. */
  metadata?: Record<string, unknown>;
  /** Optional new max_budget. */
  max_budget?: number | null;
  /** Optional new duration. */
  duration?: string | null;
}

export interface KeyInfoParams {
  key: string;
}

export interface KeyInfo {
  token: string;
  key_name: string;
  key_alias: string | null;
  spend: number;
  max_budget: number | null;
  expires: ISODateString | null;
  models: string[];
  user_id: string | null;
  team_id: string | null;
  metadata: Record<string, unknown>;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  blocked?: boolean;
  budget_duration?: string | null;
  budget_reset_at?: ISODateString | null;
  created_at?: ISODateString;
  updated_at?: ISODateString;
  [key: string]: unknown;
}

export interface KeyInfoResponse {
  key: string;
  info: KeyInfo;
}

export interface KeyHealthResponse {
  key: 'healthy' | 'unhealthy';
  logging_callbacks?: { status: string; details?: unknown };
  message?: string;
  [key: string]: unknown;
}

export interface KeyListParams extends PaginationParams {
  user_id?: string;
  team_id?: string;
  organization_id?: string;
  key_alias?: string;
  return_full_object?: boolean;
  include_team_keys?: boolean;
}

export interface KeyListResponse {
  keys: Array<KeyInfo | string>;
  total_count?: number;
  current_page?: number;
  total_pages?: number;
  [key: string]: unknown;
}

// ─── Extended key management ─────────────────────────────────────────────────

export interface KeyServiceAccountCreateParams extends KeyCreateParams {
  service_account_id?: string;
}

export interface KeyBulkUpdateParams {
  /** List of key updates to apply. */
  keys: KeyUpdateParams[];
}
export interface KeyBulkUpdateResponse {
  updated_keys?: string[];
  errors?: Array<{ key: string; error: string }>;
  [key: string]: unknown;
}

export interface KeyInfoV2Params {
  /** Tokens (hashed keys) to look up. */
  keys: string[];
}
export type KeyInfoV2Response = KeyInfoResponse[];

export interface KeyResetSpendParams {
  key: string;
}
export interface KeyResetSpendResponse {
  message?: string;
  key?: string;
  [key: string]: unknown;
}

export interface KeyAliasesResponse {
  key_aliases: string[];
  [key: string]: unknown;
}
