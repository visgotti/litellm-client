import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Budget Management (optional / admin)
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

export interface BudgetCreateResponse {
  budget_id: string;
  max_budget: number | null;
  budget_duration: string | null;
  soft_budget: number | null;
  max_parallel_requests: number | null;
  tpm_limit: number | null;
  rpm_limit: number | null;
  model_max_budget: Record<string, number>;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface BudgetUpdateParams extends BudgetCreateParams {
  budget_id: string;
}

export interface BudgetDeleteParams {
  id: string;
}

export interface BudgetInfoParams {
  budgets: string[];
}
