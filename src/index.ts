// ─────────────────────────────────────────────────────────────────────────────
// litellm-proxy — Public API
// ─────────────────────────────────────────────────────────────────────────────

export { LiteLLMProxyClient } from './client';
export type {
  LiteLLMProxyClientConfig,
  RequestFn,
  RawRequestFn,
  StreamRequestFn,
  RequestBodyKind,
  InternalRequestParams,
} from './client';

export { Stream } from './streaming';
export type { RequestOptions } from './types/request-options';

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

// Resource classes
export { ChatResource, ChatCompletionsResource } from './resources/chat';
export { CompletionsResource } from './resources/completions';
export { EmbeddingsResource } from './resources/embeddings';
export { ModelsResource } from './resources/models';
export { KeysResource } from './resources/keys';
export { UsersResource } from './resources/users';
export { TeamsResource } from './resources/teams';
export { BudgetsResource } from './resources/budgets';
export { HealthResource } from './resources/health';
export { FilesResource } from './resources/files';
export { BatchesResource } from './resources/batches';
export { AudioResource } from './resources/audio';
export { ImagesResource } from './resources/images';
export { ModerationsResource } from './resources/moderations';
export { RerankResource } from './resources/rerank';
export { ResponsesResource } from './resources/responses';
export { CustomersResource } from './resources/customers';
export { SpendResource } from './resources/spend';
export { FineTuningResource } from './resources/fine_tuning';
export { AssistantsResource } from './resources/assistants';
export { OrganizationsResource } from './resources/organizations';
export { TagsResource } from './resources/tags';
export { GuardrailsResource } from './resources/guardrails';
export { CredentialsResource } from './resources/credentials';
export { VectorStoresResource } from './resources/vector_stores';
export {
  McpResource,
  McpToolsResource,
  McpAccessGroupsResource,
  McpNetworkResource,
  McpRegistryResource,
  McpServersResource,
  McpToolsetsResource,
  McpUserCredentialsResource,
} from './resources/mcp';
export { ContainersResource } from './resources/containers';
export { EvalsResource } from './resources/evals';
export { RealtimeResource } from './resources/realtime';
export { VideoResource } from './resources/videos';
export { OcrResource } from './resources/ocr';
export { SearchResource } from './resources/search';
export { RagResource } from './resources/rag';
export { AgentsResource } from './resources/agents';
export { A2AResource } from './resources/a2a';
export {
  AnthropicResource,
  AnthropicMessagesResource,
  AnthropicSkillsResource,
} from './resources/anthropic';
export { GeminiResource, GeminiInteractionsResource } from './resources/gemini';
export { PassThroughResource, PassThroughProvider } from './resources/pass_through';
export { ComplianceResource } from './resources/compliance';
export { UtilsResource } from './resources/utils';
export { CostResource } from './resources/cost';
export { CacheResource } from './resources/cache';

// Re-export all types
export type * from './types/index';
export type * from './types/organizations';
export type * from './types/tags';
export type * from './types/guardrails';
export type * from './types/credentials';
export type * from './types/vector_stores';
export type * from './types/mcp';
export type * from './types/containers';
export type * from './types/evals';
export type * from './types/realtime';
export type * from './types/videos';
export type * from './types/ocr';
export type * from './types/search';
export type * from './types/rag';
export type * from './types/agents';
export type * from './types/a2a';
export type * from './types/anthropic';
export type * from './types/gemini';
export type * from './types/pass_through';
export type * from './types/compliance';
export type * from './types/utils';
export type * from './types/cost';
export type * from './types/cache';
