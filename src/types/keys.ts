import type { ISODateString, PaginationParams } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Key Management
// ─────────────────────────────────────────────────────────────────────────────

export interface KeyCreateParams {
  /** Models the key is allowed to access. Empty = all */
  models?: string[];
  /** Spending limit in USD */
  max_budget?: number | null;
  /** Budget duration: '1d', '7d', '30d', etc. */
  budget_duration?: string | null;
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
}

export interface KeyCreateResponse {
  key: string;
  token: string;
  key_name: string;
  expires: ISODateString | null;
  user_id: string | null;
  team_id: string | null;
  max_budget: number | null;
  models: string[];
  metadata: Record<string, unknown>;
}

export interface KeyUpdateParams {
  key: string;
  models?: string[];
  max_budget?: number | null;
  budget_duration?: string | null;
  expires?: ISODateString | null;
  metadata?: Record<string, unknown>;
  max_parallel_requests?: number | null;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
}

export interface KeyDeleteParams {
  keys: string[];
}

export interface KeyDeleteResponse {
  deleted_keys: string[];
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
}

export interface KeyInfoResponse {
  key: string;
  info: KeyInfo;
}

export interface KeyListParams extends PaginationParams {}

export interface KeyListResponse {
  keys: KeyInfo[];
}
