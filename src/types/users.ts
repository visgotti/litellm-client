import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

export interface UserCreateParams {
  user_id?: string;
  user_email?: string;
  user_role?: 'proxy_admin' | 'proxy_admin_viewer' | 'internal_user' | 'internal_user_viewer';
  max_budget?: number | null;
  budget_duration?: string | null;
  models?: string[];
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  metadata?: Record<string, unknown>;
  team_id?: string;
}

export interface UserCreateResponse {
  user_id: string;
  user_email: string | null;
  user_role: string;
  max_budget: number | null;
  models: string[];
  metadata: Record<string, unknown>;
}

export interface UserUpdateParams {
  user_id: string;
  user_email?: string;
  user_role?: string;
  max_budget?: number | null;
  budget_duration?: string | null;
  models?: string[];
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  metadata?: Record<string, unknown>;
}

export interface UserDeleteParams {
  user_ids: string[];
}

export interface UserDeleteResponse {
  deleted_users: string[];
}

export interface UserInfoParams {
  user_id: string;
}

export interface UserInfo {
  user_id: string;
  user_email: string | null;
  user_role: string;
  spend: number;
  max_budget: number | null;
  models: string[];
  metadata: Record<string, unknown>;
  created_at: ISODateString;
  updated_at: ISODateString;
}
