import type {
  VantageInitParams,
  VantageInitResponse,
  VantageSettingsUpdateParams,
  VantageSettingsView,
  VantageDryRunParams,
  VantageExportParams,
  VantageExportResponse,
} from '../types/vantage';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Manage the Vantage billing integration on the proxy:
 * initialize / view / update / delete settings, plus dry-run and full export.
 *
 * All endpoints are admin-only.
 */
export class VantageResource {
  constructor(private request: RequestFn) {}

  /** Initialize Vantage settings (`POST /vantage/init`). */
  async init(
    params: VantageInitParams,
    options?: RequestOptions,
  ): Promise<VantageInitResponse> {
    return this.request<VantageInitResponse>({
      method: 'POST',
      path: '/vantage/init',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** View current Vantage settings with secrets masked (`GET /vantage/settings`). */
  async getSettings(options?: RequestOptions): Promise<VantageSettingsView> {
    return this.request<VantageSettingsView>({
      method: 'GET',
      path: '/vantage/settings',
      options,
    });
  }

  /** Update existing Vantage settings (`PUT /vantage/settings`). */
  async updateSettings(
    params: VantageSettingsUpdateParams,
    options?: RequestOptions,
  ): Promise<VantageInitResponse> {
    return this.request<VantageInitResponse>({
      method: 'PUT',
      path: '/vantage/settings',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Perform a dry-run export — returns the data that would be exported without
   * sending it to Vantage (`POST /vantage/dry-run`).
   */
  async dryRun(
    params?: VantageDryRunParams,
    options?: RequestOptions,
  ): Promise<VantageExportResponse> {
    return this.request<VantageExportResponse>({
      method: 'POST',
      path: '/vantage/dry-run',
      body: { kind: 'json', value: params ?? {} },
      options,
    });
  }

  /** Perform an actual export to the Vantage cost-import API (`POST /vantage/export`). */
  async export(
    params?: VantageExportParams,
    options?: RequestOptions,
  ): Promise<VantageExportResponse> {
    return this.request<VantageExportResponse>({
      method: 'POST',
      path: '/vantage/export',
      body: { kind: 'json', value: params ?? {} },
      options,
    });
  }

  /** Delete Vantage settings (`DELETE /vantage/delete`). */
  async delete(options?: RequestOptions): Promise<VantageInitResponse> {
    return this.request<VantageInitResponse>({
      method: 'DELETE',
      path: '/vantage/delete',
      options,
    });
  }
}
