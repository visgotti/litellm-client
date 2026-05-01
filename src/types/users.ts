import type { ISODateString, UserRole } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parameters for `POST /user/new`.
 *
 * @see https://docs.litellm.ai/docs/proxy/users
 */
export interface UserCreateParams {
  /** Caller-supplied user identifier (auto-generated if omitted). */
  user_id?: string;
  /** Email address. */
  user_email?: string;
  /** Display alias. */
  user_alias?: string;
  /** Role within the proxy. */
  user_role?: UserRole;
  /** Spending limit (USD). */
  max_budget?: number | null;
  /** Budget reset window (e.g. `'30d'`). */
  budget_duration?: string | null;
  /** Models the user may access. */
  models?: string[];
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** Primary team ID. */
  team_id?: string;
  /** Teams the user belongs to. */
  teams?: string[];
  /** Send a welcome / invite email. */
  send_invite_email?: boolean;
  /** Auto-generate an API key for the user. */
  auto_create_key?: boolean;
  /** Auto-key duration (e.g. `'30d'`). */
  duration?: string | null;
  /** Display alias of the auto-created key. */
  key_alias?: string;
  /** Initial password (UI accounts). */
  password?: string;
  /** Initial spend value (USD). */
  spend?: number;
  /** Owning organization ID. */
  organization_id?: string;
}

/**
 * Response from `POST /user/new`.
 *
 * @see https://docs.litellm.ai/docs/proxy/users
 */
export interface UserCreateResponse {
  /** User identifier. */
  user_id: string;
  /** Email address. */
  user_email: string | null;
  /** Role within the proxy. */
  user_role: UserRole | string | null;
  /** Spending limit (USD). */
  max_budget: number | null;
  /** Cumulative spend (USD). */
  spend?: number;
  /** Models the user may access. */
  models: string[];
  /** Free-form metadata. */
  metadata: Record<string, unknown>;
  /** Teams the user belongs to. */
  teams?: string[];
  /** Optional: returned when auto_create_key is true */
  key?: string;
  /** ISO-8601 expiry of the auto-created key. */
  expires?: ISODateString | null;
  /** Anything else the proxy returns. */
  [key: string]: unknown;
}

/**
 * Parameters for `POST /user/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/users
 */
export interface UserUpdateParams {
  /** Identifier of the user to update. */
  user_id: string;
  /** New email address. */
  user_email?: string;
  /** New role. */
  user_role?: UserRole;
  /** Replacement spending limit (USD). */
  max_budget?: number | null;
  /** Replacement budget reset window. */
  budget_duration?: string | null;
  /** Replacement model allow-list. */
  models?: string[];
  /** Replacement TPM limit. */
  tpm_limit?: number | null;
  /** Replacement RPM limit. */
  rpm_limit?: number | null;
  /** Replacement metadata. */
  metadata?: Record<string, unknown>;
  /** New password. */
  password?: string;
  /** Replacement cumulative spend value. */
  spend?: number;
}

/**
 * Response from `POST /user/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/users
 */
export interface UserUpdateResponse {
  /** Updated user identifier. */
  user_id: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Parameters for `POST /user/delete`. */
export interface UserDeleteParams {
  /** User IDs to delete. */
  user_ids: string[];
}

/**
 * LiteLLM's `/user/delete` historically returns an array of deleted-row
 * counts (e.g. `[1]`); some builds return `{ deleted_users, message }`.
 */
export type UserDeleteResponse =
  | number[]
  | {
      /** IDs of deleted users. */
      deleted_users: string[];
      /** Human-readable status. */
      message?: string;
    };

/** Parameters for `GET /user/info`. */
export interface UserInfoParams {
  /** User identifier (defaults to the calling user). */
  user_id?: string;
}

/**
 * Detailed user info row.
 *
 * @see https://docs.litellm.ai/docs/proxy/users
 */
export interface UserInfo {
  /** User identifier. */
  user_id: string;
  /** Email address. */
  user_email?: string | null;
  /** Role within the proxy. */
  user_role?: UserRole | string | null;
  /** Cumulative spend (USD). */
  spend?: number;
  /** Spending limit (USD). */
  max_budget?: number | null;
  /** Models the user may access. */
  models?: string[];
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** Teams the user belongs to. */
  teams?: string[];
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString;
  /** The proxy returns various joined data. */
  [key: string]: unknown;
}

/**
 * Response from `GET /user/info`.
 *
 * @see https://docs.litellm.ai/docs/proxy/users
 */
export interface UserInfoResponse {
  /** User identifier. */
  user_id: string;
  /** Detailed user info. */
  user_info: UserInfo;
  /** Keys owned by the user. */
  keys?: unknown[];
  /** Teams the user belongs to (with team-level details). */
  teams?: unknown[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Query parameters for `GET /user/list`. */
export interface UserListParams {
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
  /** Filter by role. */
  role?: UserRole;
  /** Comma-separated list of user IDs to look up. */
  user_ids?: string;
}

/** Response from `GET /user/list`. */
export interface UserListResponse {
  /** Page of users. */
  users: UserInfo[];
  /** Total users matching the query. */
  total?: number;
  /** Current page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
  /** Total page count. */
  total_pages?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─── Extended user management ────────────────────────────────────────────────

/** Parameters for the v2 user-info endpoint. */
export interface UserInfoV2Params {
  /** User identifier. */
  user_id?: string;
}
export type UserInfoV2Response = UserInfoResponse;

/** Response listing roles available on the proxy. */
export interface UserAvailableRolesResponse {
  /** Available roles with optional descriptions and permissions. */
  roles: Array<{ role: UserRole | string; description?: string; permissions?: string[] }>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Response from `GET /user/available_users` — proxy seat usage summary.
 *
 * License-bounded counts may be `null` on builds without seat enforcement.
 */
export interface UserAvailableUsersResponse {
  /** Total seats permitted by the active license, or `null` when unbounded. */
  total_users: number | null;
  /** Total team seats permitted, or `null` when unbounded. */
  total_teams: number | null;
  /** Currently provisioned user count. */
  total_users_used: number;
  /** Currently provisioned team count. */
  total_teams_used: number;
  /** Remaining team seats, or `null` when unbounded. */
  total_teams_remaining: number | null;
  /** Remaining user seats, or `null` when unbounded. */
  total_users_remaining: number | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Body for `POST /user/bulk_update`. */
export interface UserBulkUpdateParams {
  /** List of user updates to apply. */
  users: UserUpdateParams[];
}
/** Response from `POST /user/bulk_update`. */
export interface UserBulkUpdateResponse {
  /** Identifiers of successfully updated users. */
  updated_users?: string[];
  /** Per-user error messages for failures. */
  errors?: Array<{ user_id: string; error: string }>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Query parameters for the user daily-activity endpoint. */
export interface UserDailyActivityAggregatedParams {
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
/** Response from the user daily-activity endpoint. */
export interface UserDailyActivityAggregatedResponse {
  /** Per-day / per-user activity rows. */
  results?: unknown[];
  /** Aggregate metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
