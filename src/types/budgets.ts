import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Budget Management (admin only)
// ─────────────────────────────────────────────────────────────────────────────

export interface BudgetCreateParams {
  budget_id?: string;
  max_budget?: number | null;
  budget_duration?: string | null;
  soft_budget?: number | null;
  max_parallel_requests?: number | null;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  model_max_budget?: Record<string, number>;
}

export interface BudgetObject {
  budget_id: string;
  max_budget: number | null;
  budget_duration: string | null;
  soft_budget: number | null;
  max_parallel_requests: number | null;
  tpm_limit: number | null;
  rpm_limit: number | null;
  model_max_budget: Record<string, number> | null;
  created_at?: ISODateString;
  updated_at?: ISODateString;
  [key: string]: unknown;
}

export type BudgetCreateResponse = BudgetObject;

export interface BudgetUpdateParams extends BudgetCreateParams {
  budget_id: string;
}
export type BudgetUpdateResponse = BudgetObject;

export interface BudgetDeleteParams {
  id: string;
}
export interface BudgetDeleteResponse {
  message?: string;
  budget_id?: string;
  [key: string]: unknown;
}

export interface BudgetInfoParams {
  budgets: string[];
}
export type BudgetInfoResponse = BudgetObject[];

export interface BudgetListResponse extends Array<BudgetObject> {}

export interface BudgetSettingsResponse {
  [key: string]: unknown;
}

export interface ProviderBudgetEntry {
  provider: string;
  budget_limit?: number | null;
  time_period?: string | null;
  spend?: number;
  [key: string]: unknown;
}
export type ProviderBudgetsResponse = ProviderBudgetEntry[] | { providers: ProviderBudgetEntry[] };
