import type {
  CloudZeroInitParams,
  CloudZeroInitResponse,
  CloudZeroSettingsUpdateParams,
  CloudZeroSettingsView,
  CloudZeroExportParams,
  CloudZeroExportResponse,
} from '../types/cloudzero';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Manage the CloudZero AnyCost billing integration on the proxy:
 * initialize / view / update / delete settings, plus dry-run and full export.
 *
 * All endpoints are admin-only.
 */
export class CloudZeroResource {
  constructor(private request: RequestFn) {}

  /** Initialize CloudZero settings (`POST /cloudzero/init`). */
  async init(
    params: CloudZeroInitParams,
    options?: RequestOptions,
  ): Promise<CloudZeroInitResponse> {
    return this.request<CloudZeroInitResponse>({
      method: 'POST',
      path: '/cloudzero/init',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** View current CloudZero settings with the API key masked (`GET /cloudzero/settings`). */
  async getSettings(options?: RequestOptions): Promise<CloudZeroSettingsView> {
    return this.request<CloudZeroSettingsView>({
      method: 'GET',
      path: '/cloudzero/settings',
      options,
    });
  }

  /** Update existing CloudZero settings (`PUT /cloudzero/settings`). */
  async updateSettings(
    params: CloudZeroSettingsUpdateParams,
    options?: RequestOptions,
  ): Promise<CloudZeroInitResponse> {
    return this.request<CloudZeroInitResponse>({
      method: 'PUT',
      path: '/cloudzero/settings',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Perform a dry-run export — returns the data that would be exported without
   * sending it to CloudZero (`POST /cloudzero/dry-run`).
   */
  async dryRun(
    params?: CloudZeroExportParams,
    options?: RequestOptions,
  ): Promise<CloudZeroExportResponse> {
    return this.request<CloudZeroExportResponse>({
      method: 'POST',
      path: '/cloudzero/dry-run',
      body: { kind: 'json', value: params ?? {} },
      options,
    });
  }

  /** Perform an actual export to CloudZero AnyCost (`POST /cloudzero/export`). */
  async export(
    params?: CloudZeroExportParams,
    options?: RequestOptions,
  ): Promise<CloudZeroExportResponse> {
    return this.request<CloudZeroExportResponse>({
      method: 'POST',
      path: '/cloudzero/export',
      body: { kind: 'json', value: params ?? {} },
      options,
    });
  }

  /** Delete CloudZero settings (`DELETE /cloudzero/delete`). */
  async delete(options?: RequestOptions): Promise<CloudZeroInitResponse> {
    return this.request<CloudZeroInitResponse>({
      method: 'DELETE',
      path: '/cloudzero/delete',
      options,
    });
  }
}
