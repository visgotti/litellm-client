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

  /**
   * Get the proxy's cost discount configuration.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The current discount configuration.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  get(options?: RequestOptions): Promise<CostDiscountConfigGetResponse> {
    return this.request<CostDiscountConfigGetResponse>({
      method: 'GET',
      path: '/config/cost_discount_config',
      options,
    });
  }

  /**
   * Update the proxy's cost discount configuration.
   *
   * @param params - The discount configuration patch payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated discount configuration.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
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

  /**
   * Get the proxy's cost margin configuration.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The current margin configuration.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
  get(options?: RequestOptions): Promise<CostMarginConfigGetResponse> {
    return this.request<CostMarginConfigGetResponse>({
      method: 'GET',
      path: '/config/cost_margin_config',
      options,
    });
  }

  /**
   * Update the proxy's cost margin configuration.
   *
   * @param params - The margin configuration patch payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated margin configuration.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
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

  /**
   * Estimate the cost of a request without invoking the model.
   *
   * @param params - The cost estimate request body (model + token counts or messages).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The estimated cost breakdown.
   *
   * @see https://docs.litellm.ai/docs/proxy/cost_tracking
   */
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
