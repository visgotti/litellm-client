import type {
  BudgetCreateParams,
  BudgetCreateResponse,
  BudgetUpdateParams,
  BudgetUpdateResponse,
  BudgetDeleteParams,
  BudgetDeleteResponse,
  BudgetInfoParams,
  BudgetInfoResponse,
  BudgetListResponse,
  BudgetSettingsResponse,
  ProviderBudgetsResponse,
} from '../types/budgets';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class BudgetsResource {
  constructor(private request: RequestFn) {}

  /**
   * Create a new budget definition (`POST /budget/new`).
   *
   * @param params - Budget attributes (id, max_budget, duration, soft_budget, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created budget record.
   *
   * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
   */
  create(params: BudgetCreateParams, options?: RequestOptions): Promise<BudgetCreateResponse> {
    return this.request<BudgetCreateResponse>({
      method: 'POST',
      path: '/budget/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing budget (`POST /budget/update`).
   *
   * @param params - Budget id plus fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated budget record.
   *
   * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
   */
  update(params: BudgetUpdateParams, options?: RequestOptions): Promise<BudgetUpdateResponse> {
    return this.request<BudgetUpdateResponse>({
      method: 'POST',
      path: '/budget/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a budget definition (`POST /budget/delete`).
   *
   * @param params - The budget to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation.
   *
   * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
   */
  delete(params: BudgetDeleteParams, options?: RequestOptions): Promise<BudgetDeleteResponse> {
    return this.request<BudgetDeleteResponse>({
      method: 'POST',
      path: '/budget/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Fetch info for a budget (`POST /budget/info`).
   *
   * @param params - Budget id(s) to look up.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Budget configuration plus current usage.
   *
   * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
   */
  info(params: BudgetInfoParams, options?: RequestOptions): Promise<BudgetInfoResponse> {
    return this.request<BudgetInfoResponse>({
      method: 'POST',
      path: '/budget/info',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List all configured budgets (`GET /budget/list`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The full list of budget records.
   *
   * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
   */
  list(options?: RequestOptions): Promise<BudgetListResponse> {
    return this.request<BudgetListResponse>({
      method: 'GET',
      path: '/budget/list',
      options,
    });
  }

  /**
   * Get global budget defaults / settings (`GET /budget/settings`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Global budget settings.
   *
   * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
   */
  settings(options?: RequestOptions): Promise<BudgetSettingsResponse> {
    return this.request<BudgetSettingsResponse>({
      method: 'GET',
      path: '/budget/settings',
      options,
    });
  }

  /**
   * Get provider-level budget configuration (`GET /provider/budgets`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-provider budget configuration.
   *
   * @see https://docs.litellm.ai/docs/proxy/budgets_and_rate_limits
   */
  providerBudgets(options?: RequestOptions): Promise<ProviderBudgetsResponse> {
    return this.request<ProviderBudgetsResponse>({
      method: 'GET',
      path: '/provider/budgets',
      options,
    });
  }
}
