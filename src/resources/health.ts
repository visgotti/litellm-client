import type {
  HealthCheckResponse,
  HealthLivenessResponse,
  HealthReadinessResponse,
  HealthServicesResponse,
  HealthBacklogResponse,
  HealthLicenseResponse,
  HealthHistoryResponse,
  HealthLatestResponse,
  HealthSharedStatusResponse,
  HealthTestConnectionParams,
  HealthTestConnectionResponse,
  HealthTestResponse,
  HealthSettingsResponse,
} from '../types/health';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class HealthResource {
  constructor(private request: RequestFn) {}

  /** GET /health — full check (calls every model). */
  check(options?: RequestOptions): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>({ method: 'GET', path: '/health', options });
  }

  /** GET /health/liveliness */
  liveness(options?: RequestOptions): Promise<HealthLivenessResponse> {
    return this.request<HealthLivenessResponse>({
      method: 'GET',
      path: '/health/liveliness',
      options,
    });
  }

  /** Alias for /health/liveness which some deployments expose. */
  liveliness(options?: RequestOptions): Promise<HealthLivenessResponse> {
    return this.liveness(options);
  }

  /** GET /health/readiness */
  readiness(options?: RequestOptions): Promise<HealthReadinessResponse> {
    return this.request<HealthReadinessResponse>({
      method: 'GET',
      path: '/health/readiness',
      options,
    });
  }

  /** GET /health/services?service=... */
  services(service: string, options?: RequestOptions): Promise<HealthServicesResponse> {
    return this.request<HealthServicesResponse>({
      method: 'GET',
      path: '/health/services',
      options: { ...(options ?? {}), query: { ...(options?.query ?? {}), service } },
    });
  }

  /** GET /health/backlog */
  backlog(options?: RequestOptions): Promise<HealthBacklogResponse> {
    return this.request<HealthBacklogResponse>({
      method: 'GET',
      path: '/health/backlog',
      options,
    });
  }

  /** GET /health/license */
  license(options?: RequestOptions): Promise<HealthLicenseResponse> {
    return this.request<HealthLicenseResponse>({
      method: 'GET',
      path: '/health/license',
      options,
    });
  }

  /** GET /health/history */
  history(options?: RequestOptions): Promise<HealthHistoryResponse> {
    return this.request<HealthHistoryResponse>({
      method: 'GET',
      path: '/health/history',
      options,
    });
  }

  /** GET /health/latest */
  latest(options?: RequestOptions): Promise<HealthLatestResponse> {
    return this.request<HealthLatestResponse>({
      method: 'GET',
      path: '/health/latest',
      options,
    });
  }

  /** GET /health/shared-status */
  sharedStatus(options?: RequestOptions): Promise<HealthSharedStatusResponse> {
    return this.request<HealthSharedStatusResponse>({
      method: 'GET',
      path: '/health/shared-status',
      options,
    });
  }

  /** POST /health/test_connection — test a single model deployment. */
  testConnection(
    params: HealthTestConnectionParams,
    options?: RequestOptions,
  ): Promise<HealthTestConnectionResponse> {
    return this.request<HealthTestConnectionResponse>({
      method: 'POST',
      path: '/health/test_connection',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /test — proxy smoke-test endpoint. */
  test(options?: RequestOptions): Promise<HealthTestResponse> {
    return this.request<HealthTestResponse>({ method: 'GET', path: '/test', options });
  }

  /** GET /settings — active callbacks/settings. */
  settings(options?: RequestOptions): Promise<HealthSettingsResponse> {
    return this.request<HealthSettingsResponse>({
      method: 'GET',
      path: '/settings',
      options,
    });
  }
}
