import type {
  RealtimeClientSecretCreateParams,
  RealtimeClientSecretResponse,
  RealtimeCallCreateParams,
  RealtimeCallCreateResponse,
  RealtimeListResponse,
} from '../types/realtime';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class RealtimeResource {
  constructor(private request: RequestFn) {}

  /**
   * List active realtime sessions / calls (`GET /v1/realtime`, alias `/realtime`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of realtime session records.
   */
  list(options?: RequestOptions): Promise<RealtimeListResponse> {
    return this.request<RealtimeListResponse>({
      method: 'GET',
      path: '/v1/realtime',
      options,
    });
  }

  /**
   * Mint an ephemeral client secret for the Realtime API.
   *
   * The returned token is intended to be used by browsers/mobile clients to
   * connect directly to a realtime session without exposing the master API key.
   *
   * @param params - Optional realtime session config (model, modalities, etc.).
   *   Defaults to `{}` to use proxy defaults.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `RealtimeClientSecretResponse` containing the ephemeral key.
   *
   * @see https://docs.litellm.ai/docs/realtime
   */
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

  /**
   * Initiate a realtime call (e.g. WebRTC SDP exchange).
   *
   * Used by clients establishing a peer connection to the proxy's realtime
   * voice/audio backend.
   *
   * @param params - Call creation params (SDP offer, model, session config).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `RealtimeCallCreateResponse` (e.g. SDP answer, call id).
   *
   * @see https://docs.litellm.ai/docs/proxy/realtime_webrtc
   */
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
