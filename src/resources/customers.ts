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

  /** POST /customer/new */
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

  /** POST /customer/update */
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

  /** POST /customer/delete */
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

  /** GET /customer/info?end_user_id=... */
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

  /** GET /customer/list */
  list(options?: RequestOptions): Promise<CustomerListResponse> {
    return this.request<CustomerListResponse>({
      method: 'GET',
      path: '/customer/list',
      options,
    });
  }

  /** POST /customer/block */
  block(params: CustomerBlockParams, options?: RequestOptions): Promise<unknown> {
    return this.request({
      method: 'POST',
      path: '/customer/block',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /customer/unblock */
  unblock(params: CustomerUnblockParams, options?: RequestOptions): Promise<unknown> {
    return this.request({
      method: 'POST',
      path: '/customer/unblock',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /customer/daily/activity */
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
