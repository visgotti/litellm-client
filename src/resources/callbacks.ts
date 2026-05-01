import type {
  CallbacksByTypeResponse,
  CallbackConfigsResponse,
} from '../types/callbacks';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Read-only listing of currently-registered proxy logging callbacks
 * plus the catalog of available callback configurations.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/callback_management_endpoints.py
 */
export class CallbacksResource {
  constructor(private request: RequestFn) {}

  /**
   * View active logging callbacks grouped by type
   * (`GET /callbacks/list`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The active callbacks bucketed by `success` / `failure` / `success_and_failure`.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/callback_management_endpoints.py
   */
  list(options?: RequestOptions): Promise<CallbacksByTypeResponse> {
    return this.request<CallbacksByTypeResponse>({
      method: 'GET',
      path: '/callbacks/list',
      options,
    });
  }

  /**
   * Get available callback configurations and their fields
   * (`GET /callbacks/configs`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A catalog of callback configurations keyed by callback name.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/callback_management_endpoints.py
   */
  configs(options?: RequestOptions): Promise<CallbackConfigsResponse> {
    return this.request<CallbackConfigsResponse>({
      method: 'GET',
      path: '/callbacks/configs',
      options,
    });
  }
}
