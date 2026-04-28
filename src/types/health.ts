// ─────────────────────────────────────────────────────────────────────────────
// Health endpoints
// ─────────────────────────────────────────────────────────────────────────────

export interface HealthEndpointStatus {
  model: string;
  api_base?: string;
  cache?: Record<string, unknown> | null;
  error?: string;
  [key: string]: unknown;
}

export interface HealthCheckResponse {
  healthy_endpoints: HealthEndpointStatus[];
  unhealthy_endpoints: HealthEndpointStatus[];
  healthy_count: number;
  unhealthy_count: number;
  /** Models that were skipped (e.g. wildcard or non-callable models). */
  skipped_endpoints?: HealthEndpointStatus[];
}

export type HealthLivenessResponse =
  | string
  | {
      status?: 'healthy' | (string & {});
      [key: string]: unknown;
    };

export interface HealthReadinessResponse {
  status: 'healthy' | 'unhealthy' | 'connected' | (string & {});
  db: 'connected' | 'not connected' | (string & {});
  cache?: Record<string, unknown> | null;
  litellm_version: string;
  success_callbacks?: string[];
  failure_callbacks?: string[];
  last_updated?: string;
  [key: string]: unknown;
}

export interface HealthServicesResponse {
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// ─── Extended health endpoints ───────────────────────────────────────────────

export interface HealthBacklogResponse {
  backlog?: number;
  pending_tasks?: number;
  [key: string]: unknown;
}

export interface HealthLicenseResponse {
  status?: 'valid' | 'invalid' | 'expired' | (string & {});
  expires_at?: string;
  features?: string[];
  [key: string]: unknown;
}

export interface HealthHistoryResponse {
  history?: Array<{ timestamp?: string; healthy?: boolean; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface HealthLatestResponse {
  models?: HealthEndpointStatus[];
  last_checked?: string;
  [key: string]: unknown;
}

export interface HealthSharedStatusResponse {
  [key: string]: unknown;
}

export interface HealthTestConnectionParams {
  litellm_params?: Record<string, unknown>;
  mode?: 'chat' | 'completion' | 'embedding' | 'image_generation' | (string & {});
}
export interface HealthTestConnectionResponse {
  status?: 'success' | 'error' | (string & {});
  message?: string;
  result?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface HealthTestResponse {
  message?: string;
  [key: string]: unknown;
}

export interface HealthSettingsResponse {
  active_callbacks?: string[];
  success_callbacks?: string[];
  failure_callbacks?: string[];
  [key: string]: unknown;
}
