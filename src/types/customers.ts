import type { ISODateString, ObjectPermissionBase } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// End-customer (end-user) management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parameters for `POST /customer/new`.
 *
 * @see https://docs.litellm.ai/docs/proxy/customers
 */
export interface CustomerCreateParams {
  /** End-customer identifier. */
  user_id: string;
  /** Display alias. */
  alias?: string;
  /** Block the customer on creation. */
  blocked?: boolean;
  /** Spending limit (USD). */
  max_budget?: number | null;
  /** Optional Budget object ID to attach. */
  budget_id?: string;
  /** Restrict the customer to a specific model region. */
  allowed_model_region?: 'us' | 'eu' | (string & {});
  /** Default model used when the request omits one. */
  default_model?: string;
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** Scope MCP servers, vector stores, agents, etc. accessible to this customer. */
  object_permission?: ObjectPermissionBase;
}

/**
 * An end-customer record.
 *
 * @see https://docs.litellm.ai/docs/proxy/customers
 */
export interface CustomerObject {
  /** End-customer identifier. */
  user_id: string;
  /** Display alias. */
  alias?: string | null;
  /** `true` if the customer is blocked. */
  blocked: boolean;
  /** Spending limit (USD). */
  max_budget?: number | null;
  /** Cumulative spend (USD). */
  spend?: number;
  /** Linked Budget object identifier. */
  budget_id?: string | null;
  /** Allowed model region. */
  allowed_model_region?: string | null;
  /** Default model used when the request omits one. */
  default_model?: string | null;
  /** Joined budget row. */
  litellm_budget_table?: Record<string, unknown> | null;
  /** Object-permission grants. */
  object_permission?: ObjectPermissionBase | Record<string, unknown> | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

export type CustomerCreateResponse = CustomerObject;

/**
 * Parameters for `POST /customer/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/customers
 */
export interface CustomerUpdateParams {
  /** Identifier of the customer to update. */
  user_id: string;
  /** New display alias. */
  alias?: string;
  /** Block / unblock the customer. */
  blocked?: boolean;
  /** Replacement spending limit (USD). */
  max_budget?: number | null;
  /** New linked Budget object ID. */
  budget_id?: string;
  /** Replacement allowed model region. */
  allowed_model_region?: string;
  /** Replacement default model. */
  default_model?: string;
  /** Scope MCP servers, vector stores, agents, etc. accessible to this customer. */
  object_permission?: ObjectPermissionBase;
}
export type CustomerUpdateResponse = CustomerObject;

/** Body for `POST /customer/delete`. */
export interface CustomerDeleteParams {
  /** Customer IDs to delete. */
  user_ids: string[];
}
/** Response from `POST /customer/delete`. */
export interface CustomerDeleteResponse {
  /** Human-readable status. */
  message?: string;
  /** IDs of deleted customers. */
  deleted_users?: string[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Query parameters for `GET /customer/info`. */
export interface CustomerInfoParams {
  /** Customer identifier (uses LiteLLM's `end_user_id` query name). */
  end_user_id: string;
}
export type CustomerInfoResponse = CustomerObject;

/** Body for `POST /customer/block`. */
export interface CustomerBlockParams {
  /** Customer IDs to block. */
  user_ids: string[];
}
/** Body for `POST /customer/unblock`. */
export interface CustomerUnblockParams {
  /** Customer IDs to unblock. */
  user_ids: string[];
}

export type CustomerListResponse = CustomerObject[];

/**
 * Query parameters for the customer daily-activity endpoint.
 *
 * @see https://docs.litellm.ai/docs/proxy/customers
 */
export interface CustomerDailyActivityParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date: string;
  /** Filter to a specific customer. */
  end_user_id?: string;
  /** Filter to a specific API key. */
  api_key?: string;
  /** Filter to a specific team. */
  team_id?: string;
  /** Filter to a specific model. */
  model?: string;
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
}
/** Response from the customer daily-activity endpoint. */
export interface CustomerDailyActivityResponse {
  /** Per-day / per-customer activity rows. */
  results?: unknown[];
  /** Aggregate metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
