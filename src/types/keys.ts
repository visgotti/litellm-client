import type { ISODateString, PaginationParams } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Key Management (Virtual Keys)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parameters for `POST /key/generate`.
 *
 * @see https://docs.litellm.ai/docs/proxy/virtual_keys
 */
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

/**
 * Response from `POST /key/generate`.
 *
 * @see https://docs.litellm.ai/docs/proxy/virtual_keys
 */
export interface KeyCreateResponse {
  /** The generated virtual key value. */
  key: string;
  /** @deprecated Use `key`. */
  token?: string;
  /** Key name (typically a hashed prefix). */
  key_name: string;
  /** ISO-8601 expiry timestamp, or `null` if non-expiring. */
  expires: ISODateString | null;
  /** Owning user ID. */
  user_id: string | null;
  /** Owning team ID. */
  team_id: string | null;
  /** Spending limit in USD. */
  max_budget: number | null;
  /** Models the key may access. */
  models: string[];
  /** Free-form metadata attached to the key. */
  metadata: Record<string, unknown>;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** @deprecated kept for backwards compatibility. */
  spend?: number;
  /** Budget reset window. */
  budget_duration?: string | null;
  /** Model aliases. */
  aliases?: Record<string, string>;
  /** Free-form additional fields forwarded by the proxy. */
  [key: string]: unknown;
}

/**
 * Parameters for `POST /key/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/virtual_keys
 */
export interface KeyUpdateParams {
  /** Key value to update. */
  key: string;
  /** Replacement model allow-list. */
  models?: string[];
  /** Replacement spending limit. */
  max_budget?: number | null;
  /** Replacement soft budget. */
  soft_budget?: number | null;
  /** Replacement budget duration. */
  budget_duration?: string | null;
  /** Replacement expiry timestamp. */
  expires?: ISODateString | null;
  /** Replacement metadata. */
  metadata?: Record<string, unknown>;
  /** Replacement max parallel requests. */
  max_parallel_requests?: number | null;
  /** Replacement TPM limit. */
  tpm_limit?: number | null;
  /** Replacement RPM limit. */
  rpm_limit?: number | null;
  /** New owning team ID. */
  team_id?: string;
  /** New owning user ID. */
  user_id?: string;
  /** New display alias. */
  key_alias?: string;
  /** Replacement model aliases. */
  aliases?: Record<string, string>;
  /** Replacement permissions object. */
  permissions?: Record<string, unknown>;
  /** Replacement per-model budgets. */
  model_max_budget?: Record<string, number>;
  /** Block / unblock the key. */
  blocked?: boolean;
  /** Replacement tags. */
  tags?: string[];
  /** Replacement guardrails. */
  guardrails?: string[];
}

/**
 * Response from `POST /key/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/virtual_keys
 */
export interface KeyUpdateResponse {
  /** Updated key value. */
  key: string;
  /** Free-form additional fields forwarded by the proxy. */
  [key: string]: unknown;
}

/** Parameters for `POST /key/delete`. */
export interface KeyDeleteParams {
  /** Key values to delete. */
  keys?: string[];
  /** Key aliases to delete. */
  key_aliases?: string[];
}

/** Response from `POST /key/delete`. */
export interface KeyDeleteResponse {
  /** Hashed identifiers of the deleted keys. */
  deleted_keys: string[];
  /** Human-readable status. */
  message?: string;
  /** Number of keys deleted. */
  num_deleted_keys?: number;
}

/** Parameters for `POST /key/block`. */
export interface KeyBlockParams {
  /** Key value to block. */
  key: string;
}
/** Parameters for `POST /key/unblock`. */
export interface KeyUnblockParams {
  /** Key value to unblock. */
  key: string;
}

/**
 * Parameters for `POST /key/{key}/regenerate`.
 *
 * @see https://docs.litellm.ai/docs/proxy/virtual_keys
 */
export interface KeyRegenerateParams {
  /** Key to regenerate. */
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

/** Parameters for `GET /key/info`. */
export interface KeyInfoParams {
  /** Key value to look up. */
  key: string;
}

/**
 * Detailed key info row.
 *
 * @see https://docs.litellm.ai/docs/proxy/virtual_keys
 */
export interface KeyInfo {
  /** Hashed key token. */
  token: string;
  /** Key name. */
  key_name: string;
  /** Display alias. */
  key_alias: string | null;
  /** Cumulative spend (USD). */
  spend: number;
  /** Spending limit (USD). */
  max_budget: number | null;
  /** ISO-8601 expiry timestamp. */
  expires: ISODateString | null;
  /** Models the key may access. */
  models: string[];
  /** Owning user ID. */
  user_id: string | null;
  /** Owning team ID. */
  team_id: string | null;
  /** Free-form metadata. */
  metadata: Record<string, unknown>;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** `true` if the key is blocked. */
  blocked?: boolean;
  /** Budget reset window. */
  budget_duration?: string | null;
  /** ISO-8601 timestamp of the next budget reset. */
  budget_reset_at?: ISODateString | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from `GET /key/info`. */
export interface KeyInfoResponse {
  /** Hashed key value. */
  key: string;
  /** Detailed key info. */
  info: KeyInfo;
}

/** Response from `GET /key/health`. */
export interface KeyHealthResponse {
  /** Overall health status. */
  key: 'healthy' | 'unhealthy';
  /** Status of attached logging callbacks. */
  logging_callbacks?: { status: string; details?: unknown };
  /** Human-readable message. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Query parameters for `GET /key/list`. */
export interface KeyListParams extends PaginationParams {
  /** Filter by owning user. */
  user_id?: string;
  /** Filter by owning team. */
  team_id?: string;
  /** Filter by owning organization. */
  organization_id?: string;
  /** Filter by display alias. */
  key_alias?: string;
  /** Return full {@link KeyInfo} objects instead of just key strings. */
  return_full_object?: boolean;
  /** Include team-owned keys for the calling user. */
  include_team_keys?: boolean;
}

/** Response from `GET /key/list`. */
export interface KeyListResponse {
  /** Page of keys (full objects when `return_full_object=true`). */
  keys: Array<KeyInfo | string>;
  /** Total keys matching the query. */
  total_count?: number;
  /** Current page number. */
  current_page?: number;
  /** Total page count. */
  total_pages?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─── Extended key management ─────────────────────────────────────────────────

/** Parameters for creating a service-account key. */
export interface KeyServiceAccountCreateParams extends KeyCreateParams {
  /** Caller-supplied service-account identifier. */
  service_account_id?: string;
}

/** Parameters for `POST /key/bulk_update`. */
export interface KeyBulkUpdateParams {
  /** List of key updates to apply. */
  keys: KeyUpdateParams[];
}
/** Response from `POST /key/bulk_update`. */
export interface KeyBulkUpdateResponse {
  /** Hashed identifiers of successfully updated keys. */
  updated_keys?: string[];
  /** Per-key error messages for failures. */
  errors?: Array<{ key: string; error: string }>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Parameters for `POST /key/info` (v2 batch lookup). */
export interface KeyInfoV2Params {
  /** Tokens (hashed keys) to look up. */
  keys: string[];
}
export type KeyInfoV2Response = KeyInfoResponse[];

/** Parameters for `POST /key/reset_spend`. */
export interface KeyResetSpendParams {
  /** Key whose spend counter should be reset. */
  key: string;
}
/** Response from `POST /key/reset_spend`. */
export interface KeyResetSpendResponse {
  /** Human-readable status. */
  message?: string;
  /** Hashed key whose spend was reset. */
  key?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from listing key aliases visible to the caller. */
export interface KeyAliasesResponse {
  /** Distinct key aliases. */
  key_aliases: string[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}
