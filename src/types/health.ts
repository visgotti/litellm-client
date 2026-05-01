// ─────────────────────────────────────────────────────────────────────────────
// Health endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Health-check status row for a single model deployment.
 *
 * @see https://docs.litellm.ai/docs/proxy/health
 */
export interface HealthEndpointStatus {
  /** Model name. */
  model: string;
  /** Upstream provider base URL. */
  api_base?: string;
  /** Cache status block. */
  cache?: Record<string, unknown> | null;
  /** Error message when the model is unhealthy. */
  error?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Response from `GET /health`.
 *
 * @see https://docs.litellm.ai/docs/proxy/health
 */
export interface HealthCheckResponse {
  /** Models that responded successfully. */
  healthy_endpoints: HealthEndpointStatus[];
  /** Models that failed the probe. */
  unhealthy_endpoints: HealthEndpointStatus[];
  /** Count of healthy models. */
  healthy_count: number;
  /** Count of unhealthy models. */
  unhealthy_count: number;
  /** Models that were skipped (e.g. wildcard or non-callable models). */
  skipped_endpoints?: HealthEndpointStatus[];
}

/**
 * Response from `GET /health/liveliness`.
 *
 * @see https://docs.litellm.ai/docs/proxy/health
 */
export type HealthLivenessResponse =
  | string
  | {
      /** Liveness status. */
      status?: 'healthy' | (string & {});
      /** Free-form additional fields. */
      [key: string]: unknown;
    };

/**
 * Response from `GET /health/readiness`.
 *
 * @see https://docs.litellm.ai/docs/proxy/health
 */
export interface HealthReadinessResponse {
  /** Overall readiness status. */
  status: 'healthy' | 'unhealthy' | 'connected' | (string & {});
  /** Database connectivity status. */
  db: 'connected' | 'not connected' | (string & {});
  /** Cache status block. */
  cache?: Record<string, unknown> | null;
  /** Running LiteLLM version. */
  litellm_version: string;
  /** Success callbacks attached to the proxy. */
  success_callbacks?: string[];
  /** Failure callbacks attached to the proxy. */
  failure_callbacks?: string[];
  /** ISO-8601 timestamp of the last health update. */
  last_updated?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from `GET /health/services`. */
export interface HealthServicesResponse {
  /** Outcome marker. */
  status?: string;
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─── Extended health endpoints ───────────────────────────────────────────────

/** Response from the queue-backlog probe. */
export interface HealthBacklogResponse {
  /** Number of items currently backlogged. */
  backlog?: number;
  /** Number of pending tasks. */
  pending_tasks?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response describing the proxy's license status. */
export interface HealthLicenseResponse {
  /** License status. */
  status?: 'valid' | 'invalid' | 'expired' | (string & {});
  /** ISO-8601 timestamp at which the license expires. */
  expires_at?: string;
  /** Enterprise features enabled by the license. */
  features?: string[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response describing health-check history. */
export interface HealthHistoryResponse {
  /** Time-series of health-check outcomes. */
  history?: Array<{ timestamp?: string; healthy?: boolean; [key: string]: unknown }>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response describing the most recent health check. */
export interface HealthLatestResponse {
  /** Per-model status rows from the most recent probe. */
  models?: HealthEndpointStatus[];
  /** ISO-8601 timestamp of the last probe. */
  last_checked?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from a multi-instance shared-status probe. */
export interface HealthSharedStatusResponse {
  /** Free-form per-instance status. */
  [key: string]: unknown;
}

/** Body for `POST /health/test_connection`. */
export interface HealthTestConnectionParams {
  /** LiteLLM routing parameters to probe. */
  litellm_params?: Record<string, unknown>;
  /** Capability mode of the deployment to probe. */
  mode?: 'chat' | 'completion' | 'embedding' | 'image_generation' | (string & {});
}
/** Response from `POST /health/test_connection`. */
export interface HealthTestConnectionResponse {
  /** Outcome marker. */
  status?: 'success' | 'error' | (string & {});
  /** Human-readable status. */
  message?: string;
  /** Probe result payload. */
  result?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from `GET /health/test`. */
export interface HealthTestResponse {
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from `GET /health/settings`. */
export interface HealthSettingsResponse {
  /** Currently active callback names. */
  active_callbacks?: string[];
  /** Configured success callbacks. */
  success_callbacks?: string[];
  /** Configured failure callbacks. */
  failure_callbacks?: string[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}
