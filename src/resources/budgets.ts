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

  /** POST /budget/new */
  create(params: BudgetCreateParams, options?: RequestOptions): Promise<BudgetCreateResponse> {
    return this.request<BudgetCreateResponse>({
      method: 'POST',
      path: '/budget/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /budget/update */
  update(params: BudgetUpdateParams, options?: RequestOptions): Promise<BudgetUpdateResponse> {
    return this.request<BudgetUpdateResponse>({
      method: 'POST',
      path: '/budget/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /budget/delete */
  delete(params: BudgetDeleteParams, options?: RequestOptions): Promise<BudgetDeleteResponse> {
    return this.request<BudgetDeleteResponse>({
      method: 'POST',
      path: '/budget/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /budget/info */
  info(params: BudgetInfoParams, options?: RequestOptions): Promise<BudgetInfoResponse> {
    return this.request<BudgetInfoResponse>({
      method: 'POST',
      path: '/budget/info',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /budget/list */
  list(options?: RequestOptions): Promise<BudgetListResponse> {
    return this.request<BudgetListResponse>({
      method: 'GET',
      path: '/budget/list',
      options,
    });
  }

  /** GET /budget/settings */
  settings(options?: RequestOptions): Promise<BudgetSettingsResponse> {
    return this.request<BudgetSettingsResponse>({
      method: 'GET',
      path: '/budget/settings',
      options,
    });
  }

  /** GET /provider/budgets — provider-level budget configuration. */
  providerBudgets(options?: RequestOptions): Promise<ProviderBudgetsResponse> {
    return this.request<ProviderBudgetsResponse>({
      method: 'GET',
      path: '/provider/budgets',
      options,
    });
  }
}
