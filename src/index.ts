// ─────────────────────────────────────────────────────────────────────────────
// litellm-proxy — Public API
// ─────────────────────────────────────────────────────────────────────────────

export { LiteLLMProxyClient } from './client';
export type { LiteLLMProxyClientConfig, RequestFn, StreamRequestFn } from './client';

export { Stream } from './streaming';

export {
  LiteLLMProxyError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  RateLimitError,
  InternalServerError,
  ConnectionError,
  TimeoutError,
} from './errors';

// Re-export all types
export type * from './types/index';
