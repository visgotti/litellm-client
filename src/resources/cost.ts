import type {
  CostEstimateParams,
  CostEstimateResponse,
  CostDiscountConfigGetResponse,
  CostDiscountConfigUpdateParams,
  CostDiscountConfigUpdateResponse,
  CostMarginConfigGetResponse,
  CostMarginConfigUpdateParams,
  CostMarginConfigUpdateResponse,
} from '../types/cost';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

class CostDiscountConfigResource {
  constructor(private request: RequestFn) {}

  /** GET /config/cost_discount_config */
  get(options?: RequestOptions): Promise<CostDiscountConfigGetResponse> {
    return this.request<CostDiscountConfigGetResponse>({
      method: 'GET',
      path: '/config/cost_discount_config',
      options,
    });
  }

  /** PATCH /config/cost_discount_config */
  update(
    params: CostDiscountConfigUpdateParams,
    options?: RequestOptions,
  ): Promise<CostDiscountConfigUpdateResponse> {
    return this.request<CostDiscountConfigUpdateResponse>({
      method: 'PATCH',
      path: '/config/cost_discount_config',
      body: { kind: 'json', value: params },
      options,
    });
  }
}

class CostMarginConfigResource {
  constructor(private request: RequestFn) {}

  /** GET /config/cost_margin_config */
  get(options?: RequestOptions): Promise<CostMarginConfigGetResponse> {
    return this.request<CostMarginConfigGetResponse>({
      method: 'GET',
      path: '/config/cost_margin_config',
      options,
    });
  }

  /** PATCH /config/cost_margin_config */
  update(
    params: CostMarginConfigUpdateParams,
    options?: RequestOptions,
  ): Promise<CostMarginConfigUpdateResponse> {
    return this.request<CostMarginConfigUpdateResponse>({
      method: 'PATCH',
      path: '/config/cost_margin_config',
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class CostResource {
  readonly discountConfig: CostDiscountConfigResource;
  readonly marginConfig: CostMarginConfigResource;

  constructor(private request: RequestFn) {
    this.discountConfig = new CostDiscountConfigResource(request);
    this.marginConfig = new CostMarginConfigResource(request);
  }

  /** POST /cost/estimate */
  estimate(
    params: CostEstimateParams,
    options?: RequestOptions,
  ): Promise<CostEstimateResponse> {
    return this.request<CostEstimateResponse>({
      method: 'POST',
      path: '/cost/estimate',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
