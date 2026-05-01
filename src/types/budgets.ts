import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Budget Management (admin only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-model budget configuration. Values may be primitives or per-model dicts.
 *
 * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
 */
export interface GenericBudgetConfigEntry {
  /** Spending limit (USD) for this model — number or templated string. */
  max_budget?: number | string;
  /** Budget reset window (e.g. `'30d'`). */
  budget_duration?: string;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

export type GenericBudgetConfig = Record<string, GenericBudgetConfigEntry>;

/**
 * Parameters for `POST /budget/new`.
 *
 * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
 */
export interface BudgetCreateParams {
  /** Caller-supplied budget identifier. */
  budget_id?: string | null;
  /** Spending limit (USD). */
  max_budget?: number | null;
  /** Budget reset window. */
  budget_duration?: string | null;
  /** Soft budget that triggers an alert without rejecting requests. */
  soft_budget?: number | null;
  /** Maximum parallel requests. */
  max_parallel_requests?: number | null;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** Per-model spend ceilings, keyed by model name. */
  model_max_budget?: GenericBudgetConfig | Record<string, number> | null;
  /** Datetime when the budget is reset. */
  budget_reset_at?: ISODateString | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * A budget record.
 *
 * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
 */
export interface BudgetObject {
  /** Unique identifier. */
  budget_id: string;
  /** Spending limit (USD). */
  max_budget: number | null;
  /** Budget reset window. */
  budget_duration: string | null;
  /** Soft budget that triggers alerts without rejecting requests. */
  soft_budget: number | null;
  /** Maximum parallel requests. */
  max_parallel_requests: number | null;
  /** Tokens-per-minute rate limit. */
  tpm_limit: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit: number | null;
  /** Per-model spend ceilings. */
  model_max_budget: GenericBudgetConfig | Record<string, number> | null;
  /** Per-member model scope; empty = inherit team models. */
  allowed_models?: string[] | null;
  /** Datetime at which the budget window resets. */
  budget_reset_at?: ISODateString | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

export type BudgetCreateResponse = BudgetObject;

/**
 * Parameters for `POST /budget/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
 */
export interface BudgetUpdateParams extends BudgetCreateParams {
  /** Identifier of the budget to update. */
  budget_id: string;
}
export type BudgetUpdateResponse = BudgetObject;

/** Body for `POST /budget/delete`. */
export interface BudgetDeleteParams {
  /** Identifier of the budget to delete. */
  id: string;
}
/** Response from `POST /budget/delete`. */
export interface BudgetDeleteResponse {
  /** Human-readable status. */
  message?: string;
  /** ID of the deleted budget. */
  budget_id?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Body for `POST /budget/info`. */
export interface BudgetInfoParams {
  /** Budget IDs to look up. */
  budgets: string[];
}
export type BudgetInfoResponse = BudgetObject[];

/** Response from `GET /budget/list`. */
export interface BudgetListResponse extends Array<BudgetObject> {}

/** Free-form catalogue of valid budget settings. */
export interface BudgetSettingsResponse {
  /** Free-form settings keyed by name. */
  [key: string]: unknown;
}

/**
 * Per-provider budget entry.
 *
 * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
 */
export interface ProviderBudgetEntry {
  /** Provider identifier (e.g. `'openai'`). */
  provider: string;
  /** Spending limit (USD). */
  budget_limit?: number | null;
  /** Reset window for the limit (e.g. `'30d'`). */
  time_period?: string | null;
  /** Cumulative spend (USD) in the current window. */
  spend?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
export type ProviderBudgetsResponse = ProviderBudgetEntry[] | { providers: ProviderBudgetEntry[] };
