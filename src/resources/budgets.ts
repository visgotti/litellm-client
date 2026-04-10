import type {
  BudgetCreateParams,
  BudgetCreateResponse,
  BudgetUpdateParams,
  BudgetDeleteParams,
  BudgetInfoParams,
} from '../types/budgets';
import type { RequestFn } from '../client';

export class BudgetsResource {
  constructor(private request: RequestFn) {}

  async create(params: BudgetCreateParams): Promise<BudgetCreateResponse> {
    return this.request<BudgetCreateResponse>('POST', '/budget/new', params);
  }

  async update(params: BudgetUpdateParams): Promise<unknown> {
    return this.request('POST', '/budget/update', params);
  }

  async delete(params: BudgetDeleteParams): Promise<unknown> {
    return this.request('POST', '/budget/delete', params);
  }

  async info(params: BudgetInfoParams): Promise<unknown> {
    return this.request('POST', '/budget/info', params);
  }
}
