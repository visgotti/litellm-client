import type {
  HealthCheckResponse,
  HealthLivenessResponse,
  HealthReadinessResponse,
} from '../types/health';
import type { RequestFn } from '../client';

export class HealthResource {
  constructor(private request: RequestFn) {}

  async check(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('GET', '/health');
  }

  async liveness(): Promise<HealthLivenessResponse> {
    return this.request<HealthLivenessResponse>('GET', '/health/liveliness');
  }

  async readiness(): Promise<HealthReadinessResponse> {
    return this.request<HealthReadinessResponse>('GET', '/health/readiness');
  }
}
