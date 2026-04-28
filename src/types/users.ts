import type { ISODateString, UserRole } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

export interface UserCreateParams {
  user_id?: string;
  user_email?: string;
  user_alias?: string;
  user_role?: UserRole;
  max_budget?: number | null;
  budget_duration?: string | null;
  models?: string[];
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  metadata?: Record<string, unknown>;
  team_id?: string;
  teams?: string[];
  send_invite_email?: boolean;
  auto_create_key?: boolean;
  duration?: string | null;
  key_alias?: string;
  password?: string;
  spend?: number;
  organization_id?: string;
}

export interface UserCreateResponse {
  user_id: string;
  user_email: string | null;
  user_role: UserRole | string | null;
  max_budget: number | null;
  spend?: number;
  models: string[];
  metadata: Record<string, unknown>;
  teams?: string[];
  /** Optional: returned when auto_create_key is true */
  key?: string;
  expires?: ISODateString | null;
  /** Anything else the proxy returns. */
  [key: string]: unknown;
}

export interface UserUpdateParams {
  user_id: string;
  user_email?: string;
  user_role?: UserRole;
  max_budget?: number | null;
  budget_duration?: string | null;
  models?: string[];
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  metadata?: Record<string, unknown>;
  password?: string;
  spend?: number;
}

export interface UserUpdateResponse {
  user_id: string;
  [key: string]: unknown;
}

export interface UserDeleteParams {
  user_ids: string[];
}

/**
 * LiteLLM's `/user/delete` historically returns an array of deleted-row
 * counts (e.g. `[1]`); some builds return `{ deleted_users, message }`.
 */
export type UserDeleteResponse =
  | number[]
  | {
      deleted_users: string[];
      message?: string;
    };

export interface UserInfoParams {
  user_id?: string;
}

export interface UserInfo {
  user_id: string;
  user_email?: string | null;
  user_role?: UserRole | string | null;
  spend?: number;
  max_budget?: number | null;
  models?: string[];
  metadata?: Record<string, unknown>;
  teams?: string[];
  created_at?: ISODateString;
  updated_at?: ISODateString;
  /** The proxy returns various joined data. */
  [key: string]: unknown;
}

export interface UserInfoResponse {
  user_id: string;
  user_info: UserInfo;
  keys?: unknown[];
  teams?: unknown[];
  [key: string]: unknown;
}

export interface UserListParams {
  page?: number;
  page_size?: number;
  role?: UserRole;
  user_ids?: string;
}

export interface UserListResponse {
  users: UserInfo[];
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  [key: string]: unknown;
}

// ─── Extended user management ────────────────────────────────────────────────

export interface UserInfoV2Params {
  user_id?: string;
}
export type UserInfoV2Response = UserInfoResponse;

export interface UserAvailableRolesResponse {
  roles: Array<{ role: UserRole | string; description?: string; permissions?: string[] }>;
  [key: string]: unknown;
}

export interface UserBulkUpdateParams {
  users: UserUpdateParams[];
}
export interface UserBulkUpdateResponse {
  updated_users?: string[];
  errors?: Array<{ user_id: string; error: string }>;
  [key: string]: unknown;
}

export interface UserDailyActivityAggregatedParams {
  start_date: string;
  end_date: string;
  api_key?: string;
  user_id?: string;
  team_id?: string;
  model?: string;
  page?: number;
  page_size?: number;
}
export interface UserDailyActivityAggregatedResponse {
  results?: unknown[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}
