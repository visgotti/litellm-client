import type {
  RealtimeClientSecretCreateParams,
  RealtimeClientSecretResponse,
  RealtimeCallCreateParams,
  RealtimeCallCreateResponse,
} from '../types/realtime';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class RealtimeResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/realtime/client_secrets */
  createClientSecret(
    params: RealtimeClientSecretCreateParams = {},
    options?: RequestOptions,
  ): Promise<RealtimeClientSecretResponse> {
    return this.request<RealtimeClientSecretResponse>({
      method: 'POST',
      path: '/v1/realtime/client_secrets',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /v1/realtime/calls */
  createCall(
    params: RealtimeCallCreateParams,
    options?: RequestOptions,
  ): Promise<RealtimeCallCreateResponse> {
    return this.request<RealtimeCallCreateResponse>({
      method: 'POST',
      path: '/v1/realtime/calls',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
