import type {
  RouterSettingsResponse,
  RouterFieldsResponse,
} from '../types/router_settings';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Read-only inspection of the proxy's router configuration —
 * `/router/{settings,fields}`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/router_settings_endpoints.py
 */
export class RouterSettingsResource {
  constructor(private request: RequestFn) {}

  /**
   * Get the running router configuration plus configurable-field metadata
   * (`GET /router/settings`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Field metadata, current values, and routing-strategy descriptions.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/router_settings_endpoints.py
   */
  getSettings(options?: RequestOptions): Promise<RouterSettingsResponse> {
    return this.request<RouterSettingsResponse>({
      method: 'GET',
      path: '/router/settings',
      options,
    });
  }

  /**
   * Get the configurable-field schema without current values
   * (`GET /router/fields`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Field metadata + routing-strategy descriptions.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/router_settings_endpoints.py
   */
  getFields(options?: RequestOptions): Promise<RouterFieldsResponse> {
    return this.request<RouterFieldsResponse>({
      method: 'GET',
      path: '/router/fields',
      options,
    });
  }
}
