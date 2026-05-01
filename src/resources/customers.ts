import type {
  CustomerCreateParams,
  CustomerCreateResponse,
  CustomerUpdateParams,
  CustomerUpdateResponse,
  CustomerDeleteParams,
  CustomerDeleteResponse,
  CustomerInfoResponse,
  CustomerBlockParams,
  CustomerUnblockParams,
  CustomerListResponse,
  CustomerDailyActivityParams,
  CustomerDailyActivityResponse,
} from '../types/customers';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * End-customer (end-user) management — distinct from the proxy's internal
 * `users` (proxy-admin / internal-user accounts).
 */
export class CustomersResource {
  constructor(private request: RequestFn) {}

  /**
   * Create a new end-customer record (`POST /customer/new`).
   *
   * @param params - End-customer attributes (id, alias, budget, allowed_model_region, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created end-customer record.
   *
   * @see https://docs.litellm.ai/docs/proxy/customers
   */
  create(
    params: CustomerCreateParams,
    options?: RequestOptions,
  ): Promise<CustomerCreateResponse> {
    return this.request<CustomerCreateResponse>({
      method: 'POST',
      path: '/customer/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing end-customer (`POST /customer/update`).
   *
   * @param params - End-customer id plus fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated end-customer record.
   *
   * @see https://docs.litellm.ai/docs/proxy/customers
   */
  update(
    params: CustomerUpdateParams,
    options?: RequestOptions,
  ): Promise<CustomerUpdateResponse> {
    return this.request<CustomerUpdateResponse>({
      method: 'POST',
      path: '/customer/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete one or more end-customers (`POST /customer/delete`).
   *
   * @param params - End-customer ids to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion result with counts and any errors.
   *
   * @see https://docs.litellm.ai/docs/proxy/customers
   */
  delete(
    params: CustomerDeleteParams,
    options?: RequestOptions,
  ): Promise<CustomerDeleteResponse> {
    return this.request<CustomerDeleteResponse>({
      method: 'POST',
      path: '/customer/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Fetch info for a single end-customer (`GET /customer/info?end_user_id=...`).
   *
   * @param endUserId - The end-customer id to look up.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The end-customer record including budget and usage info.
   *
   * @see https://docs.litellm.ai/docs/proxy/customers
   */
  info(endUserId: string, options?: RequestOptions): Promise<CustomerInfoResponse> {
    return this.request<CustomerInfoResponse>({
      method: 'GET',
      path: '/customer/info',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), end_user_id: endUserId },
      },
    });
  }

  /**
   * List all end-customers (`GET /customer/list`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The full list of end-customer records.
   *
   * @see https://docs.litellm.ai/docs/proxy/customers
   */
  list(options?: RequestOptions): Promise<CustomerListResponse> {
    return this.request<CustomerListResponse>({
      method: 'GET',
      path: '/customer/list',
      options,
    });
  }

  /**
   * Block an end-customer from making requests (`POST /customer/block`).
   *
   * @param params - The end-customer to block.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Server response payload (shape varies by version).
   *
   * @see https://docs.litellm.ai/docs/proxy/customers
   */
  block(params: CustomerBlockParams, options?: RequestOptions): Promise<unknown> {
    return this.request({
      method: 'POST',
      path: '/customer/block',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Unblock a previously blocked end-customer (`POST /customer/unblock`).
   *
   * @param params - The end-customer to unblock.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Server response payload (shape varies by version).
   *
   * @see https://docs.litellm.ai/docs/proxy/customers
   */
  unblock(params: CustomerUnblockParams, options?: RequestOptions): Promise<unknown> {
    return this.request({
      method: 'POST',
      path: '/customer/unblock',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Daily activity for end-customers across a date range (`GET /customer/daily/activity`).
   *
   * @param params - Date range plus optional end-customer filter.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Daily aggregates of requests, tokens, and spend.
   *
   * @see https://docs.litellm.ai/docs/proxy/customers
   */
  dailyActivity(
    params: CustomerDailyActivityParams,
    options?: RequestOptions,
  ): Promise<CustomerDailyActivityResponse> {
    return this.request<CustomerDailyActivityResponse>({
      method: 'GET',
      path: '/customer/daily/activity',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }
}
