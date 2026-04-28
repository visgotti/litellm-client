import type { ISODateString, CursorPaginationParams } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Vector Stores — OpenAI-shape (mounted on /v1/vector_stores)
// ─────────────────────────────────────────────────────────────────────────────

export type VectorStoreStatus = 'expired' | 'in_progress' | 'completed' | (string & {});

export interface VectorStoreExpirationPolicy {
  /** Anchor timestamp after which the expiration policy applies. */
  anchor: 'last_active_at' | (string & {});
  /** Number of days after anchor time that the vector store will expire. */
  days: number;
}

export interface VectorStoreFileCounts {
  in_progress: number;
  completed: number;
  failed: number;
  cancelled: number;
  total: number;
}

export interface VectorStoreStaticChunkingStrategyConfig {
  max_chunk_size_tokens: number;
  chunk_overlap_tokens: number;
}

export interface VectorStoreAutoChunkingStrategy {
  type: 'auto';
}

export interface VectorStoreStaticChunkingStrategy {
  type: 'static';
  static: VectorStoreStaticChunkingStrategyConfig;
}

export type VectorStoreChunkingStrategy =
  | VectorStoreAutoChunkingStrategy
  | VectorStoreStaticChunkingStrategy
  | { type: 'auto' | 'static'; static?: VectorStoreStaticChunkingStrategyConfig };

/** Vector store object returned by /v1/vector_stores endpoints. */
export interface VectorStoreObject {
  id: string;
  object: 'vector_store';
  created_at: number;
  name?: string | null;
  bytes?: number;
  file_counts?: VectorStoreFileCounts;
  status: VectorStoreStatus;
  expires_after?: VectorStoreExpirationPolicy | null;
  expires_at?: number | null;
  last_active_at?: number | null;
  metadata?: Record<string, string> | null;
  [key: string]: unknown;
}

export interface VectorStoreCreateParams {
  name?: string;
  file_ids?: string[];
  expires_after?: VectorStoreExpirationPolicy;
  chunking_strategy?: VectorStoreChunkingStrategy;
  metadata?: Record<string, string>;
  /** LiteLLM extension — fan out across multiple model deployments. */
  target_model_names?: string;
  [key: string]: unknown;
}

export type VectorStoreUpdateParams = Partial<{
  name: string | null;
  expires_after: VectorStoreExpirationPolicy | null;
  metadata: Record<string, string> | null;
}>;

export type VectorStoreListParams = CursorPaginationParams;

export interface VectorStoreListResponse {
  object: 'list';
  data: VectorStoreObject[];
  first_id?: string | null;
  last_id?: string | null;
  has_more?: boolean;
}

export interface VectorStoreDeletedResponse {
  id: string;
  object: 'vector_store.deleted';
  deleted: boolean;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface VectorStoreSearchRankingOptions {
  ranker?: 'auto' | 'default_2024_08_21' | (string & {});
  score_threshold?: number;
}

export interface VectorStoreSearchParams {
  query: string | string[];
  filters?: Record<string, unknown>;
  max_num_results?: number;
  ranking_options?: VectorStoreSearchRankingOptions | Record<string, unknown>;
  rewrite_query?: boolean;
  [key: string]: unknown;
}

export interface VectorStoreSearchResultContent {
  type?: 'text' | (string & {});
  text?: string;
}

export interface VectorStoreSearchResult {
  score?: number;
  content?: VectorStoreSearchResultContent[];
  file_id?: string;
  filename?: string;
  attributes?: Record<string, unknown>;
}

export interface VectorStoreSearchResponse {
  object: 'vector_store.search_results.page';
  search_query?: string | string[];
  data?: VectorStoreSearchResult[];
  has_more?: boolean;
  next_page?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vector Store Files — OpenAI-shape sub-resource
// ─────────────────────────────────────────────────────────────────────────────

export type VectorStoreFileStatus =
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | (string & {});

export type VectorStoreFileAttributeValue = string | number | boolean;

export interface VectorStoreFileObject {
  id: string;
  object: 'vector_store.file';
  created_at: number;
  usage_bytes?: number | null;
  vector_store_id: string;
  status: VectorStoreFileStatus;
  last_error?: { code: string; message: string } | null;
  chunking_strategy?: VectorStoreChunkingStrategy | null;
  attributes?: Record<string, VectorStoreFileAttributeValue> | null;
  [key: string]: unknown;
}

export interface VectorStoreFileCreateParams {
  file_id: string;
  attributes?: Record<string, VectorStoreFileAttributeValue>;
  chunking_strategy?: VectorStoreChunkingStrategy;
}

export interface VectorStoreFileUpdateParams {
  attributes: Record<string, VectorStoreFileAttributeValue> | null;
}

export interface VectorStoreFileListParams extends CursorPaginationParams {
  filter?: 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

export interface VectorStoreFileListResponse {
  object: 'list';
  data: VectorStoreFileObject[];
  first_id?: string | null;
  last_id?: string | null;
  has_more?: boolean;
}

export interface VectorStoreFileDeletedResponse {
  id: string;
  object: 'vector_store.file.deleted';
  deleted: boolean;
}

export interface VectorStoreFileContentTextPart {
  type: 'text';
  text: string;
}

export interface VectorStoreFileContentResponse {
  file_id: string;
  filename?: string | null;
  attributes?: Record<string, VectorStoreFileAttributeValue> | null;
  content: VectorStoreFileContentTextPart[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LiteLLM-shape management (mounted on /vector_store/*)
// ─────────────────────────────────────────────────────────────────────────────

/** LiteLLM managed vector store (pydantic LiteLLM_ManagedVectorStore). */
export interface ManagedVectorStore {
  vector_store_id: string;
  custom_llm_provider: string;
  vector_store_name?: string | null;
  vector_store_description?: string | null;
  vector_store_metadata?: Record<string, unknown> | string | null;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
  litellm_credential_name?: string | null;
  litellm_params?: Record<string, unknown> | null;
  team_id?: string | null;
  user_id?: string | null;
  [key: string]: unknown;
}

export interface VectorStoreManagementCreateParams {
  vector_store_id: string;
  custom_llm_provider: string;
  vector_store_name?: string;
  vector_store_description?: string;
  vector_store_metadata?: Record<string, unknown>;
  litellm_credential_name?: string;
  litellm_params?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface VectorStoreManagementCreateResponse {
  status: string;
  message?: string;
  vector_store?: ManagedVectorStore;
  [key: string]: unknown;
}

export interface VectorStoreManagementListParams {
  page?: number;
  page_size?: number;
}

export interface VectorStoreManagementListResponse {
  object: 'list';
  data: ManagedVectorStore[];
  total_count?: number;
  current_page?: number;
  total_pages?: number;
}

export interface VectorStoreManagementInfoParams {
  vector_store_id: string;
}

export interface VectorStoreManagementInfoResponse {
  vector_store: ManagedVectorStore;
  [key: string]: unknown;
}

export interface VectorStoreManagementUpdateParams {
  vector_store_id: string;
  custom_llm_provider?: string;
  vector_store_name?: string;
  vector_store_description?: string;
  vector_store_metadata?: Record<string, unknown>;
  litellm_credential_name?: string;
  litellm_params?: Record<string, unknown>;
}

export interface VectorStoreManagementUpdateResponse {
  status: string;
  message?: string;
  vector_store?: ManagedVectorStore;
  [key: string]: unknown;
}

export interface VectorStoreManagementDeleteParams {
  vector_store_id: string;
}

export interface VectorStoreManagementDeleteResponse {
  status: string;
  message?: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Indexes — POST /v1/indexes
// ─────────────────────────────────────────────────────────────────────────────

export interface IndexCreateLiteLLMParams {
  vector_store_index: string;
  vector_store_name: string;
}

export interface IndexCreateParams {
  index_name: string;
  litellm_params: IndexCreateLiteLLMParams;
  index_info?: Record<string, unknown>;
}

export interface ManagedVectorStoreIndex {
  id: string;
  index_name: string;
  litellm_params: IndexCreateLiteLLMParams;
  index_info?: Record<string, unknown> | null;
  created_at?: ISODateString | null;
  created_by?: string | null;
  updated_at?: ISODateString | null;
  updated_by?: string | null;
  [key: string]: unknown;
}

export type IndexCreateResponse = ManagedVectorStoreIndex;
