import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// End-customer (end-user) management
// ─────────────────────────────────────────────────────────────────────────────

export interface CustomerCreateParams {
  user_id: string;
  alias?: string;
  blocked?: boolean;
  max_budget?: number | null;
  budget_id?: string;
  allowed_model_region?: 'us' | 'eu' | (string & {});
  default_model?: string;
  metadata?: Record<string, unknown>;
}

export interface CustomerObject {
  user_id: string;
  alias?: string | null;
  blocked: boolean;
  max_budget?: number | null;
  spend?: number;
  budget_id?: string | null;
  allowed_model_region?: string | null;
  default_model?: string | null;
  litellm_budget_table?: Record<string, unknown> | null;
  created_at?: ISODateString;
  updated_at?: ISODateString;
  [key: string]: unknown;
}

export type CustomerCreateResponse = CustomerObject;

export interface CustomerUpdateParams {
  user_id: string;
  alias?: string;
  blocked?: boolean;
  max_budget?: number | null;
  budget_id?: string;
  allowed_model_region?: string;
  default_model?: string;
}
export type CustomerUpdateResponse = CustomerObject;

export interface CustomerDeleteParams {
  user_ids: string[];
}
export interface CustomerDeleteResponse {
  message?: string;
  deleted_users?: string[];
  [key: string]: unknown;
}

export interface CustomerInfoParams {
  end_user_id: string;
}
export type CustomerInfoResponse = CustomerObject;

export interface CustomerBlockParams {
  user_ids: string[];
}
export interface CustomerUnblockParams {
  user_ids: string[];
}

export type CustomerListResponse = CustomerObject[];

export interface CustomerDailyActivityParams {
  start_date: string;
  end_date: string;
  end_user_id?: string;
  api_key?: string;
  team_id?: string;
  model?: string;
  page?: number;
  page_size?: number;
}
export interface CustomerDailyActivityResponse {
  results?: unknown[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}
