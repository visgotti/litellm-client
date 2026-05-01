// ─────────────────────────────────────────────────────────────────────────────
// Error types for the LiteLLM Proxy client.
// ─────────────────────────────────────────────────────────────────────────────

import type { AnthropicApiErrorBody } from './types/anthropic';
import type { GeminiErrorBody } from './types/gemini';
import type { BedrockErrorBody } from './types/bedrock';
import type { CohereErrorBody } from './types/cohere';
import type { MistralErrorBody } from './types/mistral';

/**
 * Shape of the JSON body returned by the LiteLLM proxy on error responses.
 *
 * The proxy normalises most upstream provider errors into this envelope, but
 * some providers' raw bodies leak through under the `error` field. Callers
 * should treat any field as optional.
 *
 * The `error.type` literal includes the canonical OpenAI categories
 * (`'invalid_request_error'`, `'authentication_error'`, etc.); other strings
 * remain assignable for proxy- or provider-specific values.
 */
export interface LiteLLMErrorBody {
  /** OpenAI-shaped error object — the most common form. */
  error?: {
    /** Human-readable description. */
    message?: string;
    /** Error category. */
    type?:
      | 'invalid_request_error'
      | 'authentication_error'
      | 'permission_error'
      | 'not_found_error'
      | 'rate_limit_error'
      | 'api_error'
      | 'server_error'
      | 'invalid_api_error'
      | 'tokens_exceeded_error'
      | (string & {});
    /** Name of the request parameter that failed validation, if applicable. */
    param?: string | null;
    /** Provider-specific error code. */
    code?: string | number | null;
  };
  /** FastAPI/Starlette-style detail string. Used by some proxy management endpoints. */
  detail?: string;
  /** Top-level message (some endpoints respond `{ message: '...' }`). */
  message?: string;
}

/**
 * Type-narrowing helper for provider-native error bodies. When a request
 * fails and you know which provider was routed to, cast the error body
 * to the provider-specific shape:
 *
 * ```ts
 * if (err instanceof LiteLLMError) {
 *   const anthropicBody = err.body as AnthropicApiErrorBody | null;
 *   if (anthropicBody?.error?.type === 'rate_limit_error') {
 *     // …
 *   }
 * }
 * ```
 *
 * `LiteLLMError.body` keeps its declared type as `LiteLLMErrorBody | null`;
 * use this union (or one of its members) at the call site when narrowing.
 */
export type ProviderErrorBody =
  | AnthropicApiErrorBody
  | GeminiErrorBody
  | BedrockErrorBody
  | CohereErrorBody
  | MistralErrorBody
  | LiteLLMErrorBody;

/**
 * Base class for every error thrown by the SDK due to a non-2xx HTTP response.
 *
 * Subclasses (`AuthenticationError`, `PermissionDeniedError`, `NotFoundError`,
 * `RateLimitError`, `InternalServerError`) narrow on HTTP status. Use
 * `instanceof` to branch on category, then read `.status`, `.headers`, `.body`
 * for finer detail.
 */
export class LiteLLMError extends Error {
  /** HTTP status code returned by the proxy. */
  readonly status: number;
  /** Response headers from the failed request. */
  readonly headers: Headers;
  /** Parsed JSON body of the error response, or `null` if not JSON. */
  readonly body: LiteLLMErrorBody | null;

  constructor(
    message: string,
    status: number,
    headers: Headers,
    body: LiteLLMErrorBody | null,
  ) {
    super(message);
    this.name = 'LiteLLMError';
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
}

/** Thrown on HTTP 401 — invalid or missing API key. */
export class AuthenticationError extends LiteLLMError {
  constructor(headers: Headers, body: LiteLLMErrorBody | null) {
    super(
      body?.error?.message ?? body?.detail ?? 'Authentication failed',
      401,
      headers,
      body,
    );
    this.name = 'AuthenticationError';
  }
}

/** Thrown on HTTP 403 — authenticated but lacks permission for the requested resource. */
export class PermissionDeniedError extends LiteLLMError {
  constructor(headers: Headers, body: LiteLLMErrorBody | null) {
    super(
      body?.error?.message ?? body?.detail ?? 'Permission denied',
      403,
      headers,
      body,
    );
    this.name = 'PermissionDeniedError';
  }
}

/** Thrown on HTTP 404 — endpoint or resource not found. */
export class NotFoundError extends LiteLLMError {
  constructor(headers: Headers, body: LiteLLMErrorBody | null) {
    super(
      body?.error?.message ?? body?.detail ?? 'Resource not found',
      404,
      headers,
      body,
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Thrown on HTTP 429 — rate limit exceeded.
 *
 * The SDK automatically retries 429 responses up to `maxRetries` times,
 * honouring any `Retry-After` header. This error is only surfaced after
 * retries are exhausted (or `maxRetries: 0`).
 */
export class RateLimitError extends LiteLLMError {
  constructor(headers: Headers, body: LiteLLMErrorBody | null) {
    super(
      body?.error?.message ?? body?.detail ?? 'Rate limit exceeded',
      429,
      headers,
      body,
    );
    this.name = 'RateLimitError';
  }
}

/** Thrown on HTTP 5xx — proxy or upstream provider failure. */
export class InternalServerError extends LiteLLMError {
  constructor(
    status: number,
    headers: Headers,
    body: LiteLLMErrorBody | null,
  ) {
    super(
      body?.error?.message ?? body?.detail ?? 'Internal server error',
      status,
      headers,
      body,
    );
    this.name = 'InternalServerError';
  }
}

/**
 * Thrown when the request fails to reach the proxy at all (DNS failure,
 * connection refused, TLS error, etc.). Wraps the original `fetch` `TypeError`.
 */
export class ConnectionError extends Error {
  /** Original fetch error, if available. */
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'ConnectionError';
    this.cause = cause;
  }
}

/**
 * Thrown when a request exceeds the per-request `timeout` (or the client
 * default of 60s). Triggered via an internal `AbortController` — the underlying
 * fetch is cancelled.
 */
export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Map an HTTP status code + parsed body to the appropriate typed error class.
 *
 * Used internally by the client to wrap non-2xx responses. Status codes that
 * don't map to a specific subclass fall back to a base `LiteLLMError` (4xx) or
 * `InternalServerError` (5xx).
 */
export function buildError(
  status: number,
  headers: Headers,
  body: LiteLLMErrorBody | null,
): LiteLLMError {
  switch (status) {
    case 401:
      return new AuthenticationError(headers, body);
    case 403:
      return new PermissionDeniedError(headers, body);
    case 404:
      return new NotFoundError(headers, body);
    case 429:
      return new RateLimitError(headers, body);
    default:
      if (status >= 500) return new InternalServerError(status, headers, body);
      return new LiteLLMError(
        body?.error?.message ?? body?.detail ?? `HTTP ${status}`,
        status,
        headers,
        body,
      );
  }
}
