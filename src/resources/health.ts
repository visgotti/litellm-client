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

  /**
   * Run a full health check that calls every configured model (`GET /health`).
   *
   * Use sparingly — this issues a request per deployment.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-model healthy/unhealthy status.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  check(options?: RequestOptions): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>({ method: 'GET', path: '/health', options });
  }

  /**
   * Liveness probe — does the proxy process respond? (`GET /health/liveliness`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Liveness status payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  liveness(options?: RequestOptions): Promise<HealthLivenessResponse> {
    return this.request<HealthLivenessResponse>({
      method: 'GET',
      path: '/health/liveliness',
      options,
    });
  }

  /**
   * Alias for {@link liveness} that some deployments expose under `/health/liveness`.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Liveness status payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  liveliness(options?: RequestOptions): Promise<HealthLivenessResponse> {
    return this.liveness(options);
  }

  /**
   * Hits the `/health/liveness` alias path some proxy builds expose alongside
   * the canonical `/health/liveliness`.
   *
   * Distinct from {@link liveliness} (which forwards to `/health/liveliness`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Liveness status payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  livenessAlias(options?: RequestOptions): Promise<HealthLivenessResponse> {
    return this.request<HealthLivenessResponse>({
      method: 'GET',
      path: '/health/liveness',
      options,
    });
  }

  /**
   * Readiness probe — is the proxy ready to serve traffic? (`GET /health/readiness`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Readiness status payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  readiness(options?: RequestOptions): Promise<HealthReadinessResponse> {
    return this.request<HealthReadinessResponse>({
      method: 'GET',
      path: '/health/readiness',
      options,
    });
  }

  /**
   * Health for a specific dependent service (`GET /health/services?service=...`).
   *
   * @param service - The dependent service name to probe (e.g. `db`, `redis`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-service health status.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  services(service: string, options?: RequestOptions): Promise<HealthServicesResponse> {
    return this.request<HealthServicesResponse>({
      method: 'GET',
      path: '/health/services',
      options: { ...(options ?? {}), query: { ...(options?.query ?? {}), service } },
    });
  }

  /**
   * Snapshot of the proxy's request backlog (`GET /health/backlog`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Backlog metrics (queued requests, in-flight, etc.)
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  backlog(options?: RequestOptions): Promise<HealthBacklogResponse> {
    return this.request<HealthBacklogResponse>({
      method: 'GET',
      path: '/health/backlog',
      options,
    });
  }

  /**
   * License status (`GET /health/license`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns License/entitlement status.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  license(options?: RequestOptions): Promise<HealthLicenseResponse> {
    return this.request<HealthLicenseResponse>({
      method: 'GET',
      path: '/health/license',
      options,
    });
  }

  /**
   * Recent health-check history (`GET /health/history`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Historical health-check entries.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  history(options?: RequestOptions): Promise<HealthHistoryResponse> {
    return this.request<HealthHistoryResponse>({
      method: 'GET',
      path: '/health/history',
      options,
    });
  }

  /**
   * Most recent cached health-check result (`GET /health/latest`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The latest cached health-check payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  latest(options?: RequestOptions): Promise<HealthLatestResponse> {
    return this.request<HealthLatestResponse>({
      method: 'GET',
      path: '/health/latest',
      options,
    });
  }

  /**
   * Cluster-wide shared health status (`GET /health/shared-status`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Shared health state across replicas.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  sharedStatus(options?: RequestOptions): Promise<HealthSharedStatusResponse> {
    return this.request<HealthSharedStatusResponse>({
      method: 'GET',
      path: '/health/shared-status',
      options,
    });
  }

  /**
   * Test connectivity for a single model deployment (`POST /health/test_connection`).
   *
   * @param params - Model identifier and any optional override params.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Connection-test result including any error details.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
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

  /**
   * Lightweight smoke-test endpoint (`GET /test`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A minimal liveness response.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  test(options?: RequestOptions): Promise<HealthTestResponse> {
    return this.request<HealthTestResponse>({ method: 'GET', path: '/test', options });
  }

  /**
   * Active callbacks/settings as currently loaded by the proxy (`GET /settings`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The active settings/callback payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/health
   */
  settings(options?: RequestOptions): Promise<HealthSettingsResponse> {
    return this.request<HealthSettingsResponse>({
      method: 'GET',
      path: '/settings',
      options,
    });
  }
}
