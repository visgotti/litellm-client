// ─────────────────────────────────────────────────────────────────────────────
// Realtime API (WebRTC) — /v1/realtime/client_secrets, /v1/realtime/calls
// Mirrors litellm.types.realtime
// ─────────────────────────────────────────────────────────────────────────────

/** Expiration config for a realtime client secret. */
export interface RealtimeExpiresAfter {
  anchor?: 'created_at' | (string & {});
  seconds?: number;
}

/**
 * Session configuration nested inside the client_secrets request body.
 * Mirrors OpenAI's RealtimeSessionCreateRequest (type=realtime) and
 * RealtimeTranscriptionSessionCreateRequest (type=transcription).
 * Unknown extra fields are passed through.
 */
export interface RealtimeSessionConfig {
  type?: 'realtime' | 'transcription' | (string & {});
  model?: import('./models-enum').OpenAIModel | (string & {});
  instructions?: string;
  audio?: Record<string, unknown>;
  include?: string[];
  max_output_tokens?: number | string;
  output_modalities?: string[];
  tool_choice?: unknown;
  tools?: Array<Record<string, unknown>>;
  tracing?: unknown;
  truncation?: unknown;
  prompt?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RealtimeClientSecretCreateParams {
  expires_after?: RealtimeExpiresAfter;
  session?: RealtimeSessionConfig;
  /** LiteLLM-only routing hint — stripped before forwarding upstream. */
  model?: import('./models-enum').OpenAIModel | (string & {});
  [key: string]: unknown;
}

export interface RealtimeClientSecretResponse {
  /** Unix-seconds expiration of the issued ephemeral secret. */
  expires_at?: number | null;
  /**
   * Encrypted ephemeral key. Use as the Bearer token for
   * POST /v1/realtime/calls (and the WebRTC SDP exchange).
   */
  value: string;
  /** Echo of the (encrypted) session payload — passed through as a raw dict. */
  session?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/**
 * Body for POST /v1/realtime/calls. Per the OpenAI WebRTC spec the body is
 * the raw SDP offer (text/plain). Optional `model` query param is also
 * supported for backwards compatibility.
 */
export interface RealtimeCallCreateParams {
  /** SDP offer string. */
  sdp: string;
  /** Optional explicit model override (legacy compatibility). */
  model?: import('./models-enum').OpenAIModel | (string & {});
}

/**
 * Response body for POST /v1/realtime/calls. The proxy returns the upstream
 * SDP answer (application/sdp) along with a Location header containing the
 * call ID; we normalise it into a small object for the SDK.
 */
export interface RealtimeCallCreateResponse {
  /** SDP answer returned by the upstream realtime endpoint. */
  sdp: string;
  /** Call ID extracted from the Location header (if present). */
  call_id?: string | null;
}
