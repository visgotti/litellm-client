// ─────────────────────────────────────────────────────────────────────────────
// Per-request options accepted by every resource method.
// ─────────────────────────────────────────────────────────────────────────────

export interface RequestOptions {
  /** Override the client default timeout (ms) for this single request. */
  timeout?: number;
  /** Override the client default retry count for this single request. */
  maxRetries?: number;
  /** Extra headers merged with the default + auth headers. */
  headers?: Record<string, string>;
  /** External AbortSignal (cancels the request when aborted). */
  signal?: AbortSignal;
  /** Extra query string parameters appended to the URL. */
  query?: Record<string, string | number | boolean | undefined | null>;
}
