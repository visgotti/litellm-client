// ─────────────────────────────────────────────────────────────────────────────
// Error types for LiteLLM Proxy client
// ─────────────────────────────────────────────────────────────────────────────

export interface LiteLLMErrorBody {
  error?: {
    message?: string;
    type?: string;
    param?: string | null;
    code?: string | number | null;
  };
  detail?: string;
  message?: string;
}

export class LiteLLMProxyError extends Error {
  readonly status: number;
  readonly headers: Headers;
  readonly body: LiteLLMErrorBody | null;

  constructor(
    message: string,
    status: number,
    headers: Headers,
    body: LiteLLMErrorBody | null,
  ) {
    super(message);
    this.name = 'LiteLLMProxyError';
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
}

export class AuthenticationError extends LiteLLMProxyError {
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

export class PermissionDeniedError extends LiteLLMProxyError {
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

export class NotFoundError extends LiteLLMProxyError {
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

export class RateLimitError extends LiteLLMProxyError {
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

export class InternalServerError extends LiteLLMProxyError {
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

export class ConnectionError extends Error {
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'ConnectionError';
    this.cause = cause;
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/** Map HTTP status → typed error class */
export function buildError(
  status: number,
  headers: Headers,
  body: LiteLLMErrorBody | null,
): LiteLLMProxyError {
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
      return new LiteLLMProxyError(
        body?.error?.message ?? body?.detail ?? `HTTP ${status}`,
        status,
        headers,
        body,
      );
  }
}
