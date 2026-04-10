// ─────────────────────────────────────────────────────────────────────────────
// Health endpoints
// ─────────────────────────────────────────────────────────────────────────────

export interface HealthCheckResponse {
  /** "healthy" or "unhealthy" per model */
  healthy_endpoints: HealthEndpointStatus[];
  unhealthy_endpoints: HealthEndpointStatus[];
  healthy_count: number;
  unhealthy_count: number;
}

export interface HealthEndpointStatus {
  model: string;
  api_base?: string;
  error?: string;
}

export interface HealthLivenessResponse {
  status: 'healthy';
}

export interface HealthReadinessResponse {
  status: 'healthy' | 'unhealthy';
  db: 'connected' | 'not connected';
  litellm_version: string;
}
