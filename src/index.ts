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

// Resource classes (the SDK surface that works through the proxy)
export { ChatResource, ChatCompletionsResource } from './resources/chat';
export { EmbeddingsResource } from './resources/embeddings';
export { ModelsResource } from './resources/models';
export { KeysResource } from './resources/keys';
export { UsersResource } from './resources/users';
export { TeamsResource } from './resources/teams';
export { BudgetsResource } from './resources/budgets';
export { HealthResource } from './resources/health';

// Re-export all types
export type * from './types/index';
