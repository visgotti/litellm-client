import type { ISODateString, CursorPaginationParams } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Vector Stores — OpenAI-shape (mounted on /v1/vector_stores)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lifecycle states a vector store can be in.
 *
 * - `expired`: The store has passed its TTL and is no longer searchable.
 * - `in_progress`: The store is being processed (e.g. ingesting files).
 * - `completed`: The store is ready to serve queries.
 */
export type VectorStoreStatus = 'expired' | 'in_progress' | 'completed' | (string & {});

/**
 * Expiration policy for a vector store.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/create
 */
export interface VectorStoreExpirationPolicy {
  /** Anchor timestamp after which the expiration policy applies. */
  anchor: 'last_active_at' | (string & {});
  /** Number of days after anchor time that the vector store will expire. */
  days: number;
}

/**
 * Aggregate counts of files in a vector store, broken down by status.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/create
 */
export interface VectorStoreFileCounts {
  /** Files currently being processed. */
  in_progress: number;
  /** Files successfully indexed. */
  completed: number;
  /** Files that failed to index. */
  failed: number;
  /** Files whose ingestion was cancelled. */
  cancelled: number;
  /** Total files associated with the store. */
  total: number;
}

/**
 * Static chunking strategy parameters.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/create
 */
export interface VectorStoreStaticChunkingStrategyConfig {
  /** Maximum tokens per chunk. */
  max_chunk_size_tokens: number;
  /** Token overlap between consecutive chunks. */
  chunk_overlap_tokens: number;
}

/**
 * Auto chunking strategy — server picks reasonable defaults.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/create
 */
export interface VectorStoreAutoChunkingStrategy {
  /** Discriminator for auto chunking. */
  type: 'auto';
}

/**
 * Static chunking strategy with explicit chunk size and overlap.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/create
 */
export interface VectorStoreStaticChunkingStrategy {
  /** Discriminator for static chunking. */
  type: 'static';
  /** Static chunking parameters. */
  static: VectorStoreStaticChunkingStrategyConfig;
}

export type VectorStoreChunkingStrategy =
  | VectorStoreAutoChunkingStrategy
  | VectorStoreStaticChunkingStrategy
  | { type: 'auto' | 'static'; static?: VectorStoreStaticChunkingStrategyConfig };

/**
 * Vector store object returned by /v1/vector_stores endpoints.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/create
 */
export interface VectorStoreObject {
  /** Unique identifier. */
  id: string;
  /** Always `'vector_store'`. */
  object: 'vector_store';
  /** Unix timestamp (seconds) of creation. */
  created_at: number;
  /** Human-readable name. */
  name?: string | null;
  /** Total bytes stored across all indexed files. */
  bytes?: number;
  /** Aggregate file counts by status. */
  file_counts?: VectorStoreFileCounts;
  /** Lifecycle status. */
  status: VectorStoreStatus;
  /** Expiration policy. */
  expires_after?: VectorStoreExpirationPolicy | null;
  /** Unix timestamp at which the store will expire. */
  expires_at?: number | null;
  /** Unix timestamp of the last activity in the store. */
  last_active_at?: number | null;
  /** Free-form metadata attached at creation. */
  metadata?: Record<string, string> | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Parameters for creating a vector store.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/create
 */
export interface VectorStoreCreateParams {
  /** Human-readable name. */
  name?: string;
  /** Initial set of file IDs to index. */
  file_ids?: string[];
  /** Expiration policy. */
  expires_after?: VectorStoreExpirationPolicy;
  /** Chunking strategy applied to ingested files. */
  chunking_strategy?: VectorStoreChunkingStrategy;
  /** Free-form metadata (string values only). */
  metadata?: Record<string, string>;
  /** LiteLLM extension — fan out across multiple model deployments. */
  target_model_names?: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

export type VectorStoreUpdateParams = Partial<{
  /** New display name (or `null` to clear). */
  name: string | null;
  /** New expiration policy (or `null` to clear). */
  expires_after: VectorStoreExpirationPolicy | null;
  /** Replacement metadata (or `null` to clear). */
  metadata: Record<string, string> | null;
}>;

export type VectorStoreListParams = CursorPaginationParams;

/**
 * Paginated list of vector stores.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/create
 */
export interface VectorStoreListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Page of vector stores. */
  data: VectorStoreObject[];
  /** ID of the first vector store in the page. */
  first_id?: string | null;
  /** ID of the last vector store in the page. */
  last_id?: string | null;
  /** Whether more vector stores exist after this page. */
  has_more?: boolean;
}

/**
 * Response from deleting a vector store.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/create
 */
export interface VectorStoreDeletedResponse {
  /** ID of the deleted vector store. */
  id: string;
  /** Always `'vector_store.deleted'`. */
  object: 'vector_store.deleted';
  /** `true` if the vector store was deleted. */
  deleted: boolean;
}

// ─── Search ──────────────────────────────────────────────────────────────────

/**
 * Reranking options applied to vector store search results.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/search
 */
export interface VectorStoreSearchRankingOptions {
  /** Reranker identifier. */
  ranker?: 'auto' | 'default_2024_08_21' | (string & {});
  /** Drop results below this relevance score. */
  score_threshold?: number;
}

/**
 * Parameters for searching a vector store.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/search
 */
export interface VectorStoreSearchParams {
  /** Query text(s) to search for. */
  query: string | string[];
  /** Attribute filters applied to candidate documents. */
  filters?: Record<string, unknown>;
  /** Maximum number of results to return. */
  max_num_results?: number;
  /** Reranking options. */
  ranking_options?: VectorStoreSearchRankingOptions | Record<string, unknown>;
  /** Allow the model to rewrite the query for better recall. */
  rewrite_query?: boolean;
  /** Provider routing — e.g. `openai`, `azure_ai`, `milvus`, `gemini`, `bedrock`. */
  custom_llm_provider?: string;
  /** Embedding model used for query/vector operations. */
  litellm_embedding_model?: string;
  /** Embedding configuration block (e.g. `api_base`, `api_key`). */
  litellm_embedding_config?: Record<string, unknown>;
  /** Authentication key for the upstream provider. */
  api_key?: string;
  /** Azure AI Search service name (when `custom_llm_provider = "azure_ai"`). */
  azure_search_service_name?: string;
  /** Milvus collection text field name. */
  milvus_text_field?: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * One content fragment in a vector-store search result.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/search
 */
export interface VectorStoreSearchResultContent {
  /** Content fragment kind (`'text'` for plain text). */
  type?: 'text' | (string & {});
  /** Text content of the fragment. */
  text?: string;
}

/**
 * A single hit in a vector store search response.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/search
 */
export interface VectorStoreSearchResult {
  /** Relevance score (higher = more relevant). */
  score?: number;
  /** Matching content fragments. */
  content?: VectorStoreSearchResultContent[];
  /** ID of the source file. */
  file_id?: string;
  /** Original filename of the source file. */
  filename?: string;
  /** Attributes attached to the source file. */
  attributes?: Record<string, unknown>;
}

/**
 * Vector store search response payload.
 *
 * @see https://docs.litellm.ai/docs/vector_stores/search
 */
export interface VectorStoreSearchResponse {
  /** Always `'vector_store.search_results.page'`. */
  object: 'vector_store.search_results.page';
  /** Echo of the original query. */
  search_query?: string | string[];
  /** Page of search results. */
  data?: VectorStoreSearchResult[];
  /** Whether more results exist after this page. */
  has_more?: boolean;
  /** Cursor for the next page of results. */
  next_page?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vector Store Files — OpenAI-shape sub-resource
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lifecycle states of a vector store file.
 *
 * - `in_progress`: Currently being processed.
 * - `completed`: Indexed and searchable.
 * - `failed`: Indexing failed; check `last_error`.
 * - `cancelled`: Indexing was cancelled.
 */
export type VectorStoreFileStatus =
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | (string & {});

/** Allowed value types for vector-store file attributes. */
export type VectorStoreFileAttributeValue = string | number | boolean;

/**
 * A file attached to a vector store.
 *
 * @see https://docs.litellm.ai/docs/vector_store_files
 */
export interface VectorStoreFileObject {
  /** Unique identifier. */
  id: string;
  /** Always `'vector_store.file'`. */
  object: 'vector_store.file';
  /** Unix timestamp (seconds) of attachment. */
  created_at: number;
  /** Storage cost of this file in bytes. */
  usage_bytes?: number | null;
  /** ID of the parent vector store. */
  vector_store_id: string;
  /** Lifecycle status. */
  status: VectorStoreFileStatus;
  /** Most recent error encountered while indexing the file. */
  last_error?: { code: string; message: string } | null;
  /** Chunking strategy used to ingest the file. */
  chunking_strategy?: VectorStoreChunkingStrategy | null;
  /** Free-form attributes attached to the file. */
  attributes?: Record<string, VectorStoreFileAttributeValue> | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Parameters for attaching a file to a vector store.
 *
 * @see https://docs.litellm.ai/docs/vector_store_files
 */
export interface VectorStoreFileCreateParams {
  /** ID of the file to attach. */
  file_id: string;
  /** Free-form attributes attached to the file. */
  attributes?: Record<string, VectorStoreFileAttributeValue>;
  /** Chunking strategy applied during ingestion. */
  chunking_strategy?: VectorStoreChunkingStrategy;
}

/**
 * Parameters for updating a vector store file's attributes.
 *
 * @see https://docs.litellm.ai/docs/vector_store_files
 */
export interface VectorStoreFileUpdateParams {
  /** Replacement attributes (or `null` to clear). */
  attributes: Record<string, VectorStoreFileAttributeValue> | null;
}

/**
 * Query parameters for listing vector store files.
 *
 * @see https://docs.litellm.ai/docs/vector_store_files
 */
export interface VectorStoreFileListParams extends CursorPaginationParams {
  /** Filter by file status. */
  filter?: 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

/**
 * Paginated list of vector store files.
 *
 * @see https://docs.litellm.ai/docs/vector_store_files
 */
export interface VectorStoreFileListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Page of files. */
  data: VectorStoreFileObject[];
  /** ID of the first file in the page. */
  first_id?: string | null;
  /** ID of the last file in the page. */
  last_id?: string | null;
  /** Whether more files exist after this page. */
  has_more?: boolean;
}

/**
 * Response from detaching a file from a vector store.
 *
 * @see https://docs.litellm.ai/docs/vector_store_files
 */
export interface VectorStoreFileDeletedResponse {
  /** ID of the detached file. */
  id: string;
  /** Always `'vector_store.file.deleted'`. */
  object: 'vector_store.file.deleted';
  /** `true` if the file was detached. */
  deleted: boolean;
}

/**
 * A text-content fragment of a vector store file.
 *
 * @see https://docs.litellm.ai/docs/vector_store_files
 */
export interface VectorStoreFileContentTextPart {
  /** Discriminator (`'text'`). */
  type: 'text';
  /** Text content of the fragment. */
  text: string;
}

/**
 * Response from fetching a vector store file's content.
 *
 * @see https://docs.litellm.ai/docs/vector_store_files
 */
export interface VectorStoreFileContentResponse {
  /** ID of the source file. */
  file_id: string;
  /** Original filename. */
  filename?: string | null;
  /** Free-form attributes attached to the file. */
  attributes?: Record<string, VectorStoreFileAttributeValue> | null;
  /** Content fragments composing the file. */
  content: VectorStoreFileContentTextPart[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LiteLLM-shape management (mounted on /vector_store/*)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LiteLLM managed vector store (pydantic LiteLLM_ManagedVectorStore).
 */
export interface ManagedVectorStore {
  /** Provider-specific vector store identifier. */
  vector_store_id: string;
  /** LiteLLM provider hosting the vector store. */
  custom_llm_provider: string;
  /** Human-readable name. */
  vector_store_name?: string | null;
  /** Description of the vector store. */
  vector_store_description?: string | null;
  /** Free-form metadata (object or JSON-encoded string). */
  vector_store_metadata?: Record<string, unknown> | string | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString | null;
  /** Name of the LiteLLM credential used to authenticate to the upstream provider. */
  litellm_credential_name?: string | null;
  /** Provider-specific routing parameters. */
  litellm_params?: Record<string, unknown> | null;
  /** Owning team ID. */
  team_id?: string | null;
  /** Owning user ID. */
  user_id?: string | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Parameters for registering a managed vector store with LiteLLM.
 */
export interface VectorStoreManagementCreateParams {
  /** Provider-specific vector store identifier. */
  vector_store_id: string;
  /** LiteLLM provider hosting the vector store. */
  custom_llm_provider: string;
  /** Human-readable name. */
  vector_store_name?: string;
  /** Description of the vector store. */
  vector_store_description?: string;
  /** Free-form metadata. */
  vector_store_metadata?: Record<string, unknown>;
  /** Name of the LiteLLM credential used to authenticate. */
  litellm_credential_name?: string;
  /** Provider-specific routing parameters. */
  litellm_params?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Response from registering a managed vector store.
 */
export interface VectorStoreManagementCreateResponse {
  /** Outcome marker (e.g. `'success'`). */
  status: string;
  /** Optional human-readable message. */
  message?: string;
  /** The newly registered store. */
  vector_store?: ManagedVectorStore;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Pagination params for listing managed vector stores. */
export interface VectorStoreManagementListParams {
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
}

/** Paginated list of managed vector stores. */
export interface VectorStoreManagementListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Page of managed vector stores. */
  data: ManagedVectorStore[];
  /** Total number of managed stores. */
  total_count?: number;
  /** Current page number. */
  current_page?: number;
  /** Total page count. */
  total_pages?: number;
}

/** Parameters for retrieving a managed vector store. */
export interface VectorStoreManagementInfoParams {
  /** Provider-specific vector store identifier. */
  vector_store_id: string;
}

/** Response from retrieving a managed vector store. */
export interface VectorStoreManagementInfoResponse {
  /** The managed vector store. */
  vector_store: ManagedVectorStore;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Parameters for updating a managed vector store. */
export interface VectorStoreManagementUpdateParams {
  /** Provider-specific vector store identifier. */
  vector_store_id: string;
  /** New LiteLLM provider hosting the vector store. */
  custom_llm_provider?: string;
  /** Updated display name. */
  vector_store_name?: string;
  /** Updated description. */
  vector_store_description?: string;
  /** Updated metadata. */
  vector_store_metadata?: Record<string, unknown>;
  /** Updated credential name. */
  litellm_credential_name?: string;
  /** Updated routing parameters. */
  litellm_params?: Record<string, unknown>;
}

/** Response from updating a managed vector store. */
export interface VectorStoreManagementUpdateResponse {
  /** Outcome marker (e.g. `'success'`). */
  status: string;
  /** Optional human-readable message. */
  message?: string;
  /** Updated managed vector store. */
  vector_store?: ManagedVectorStore;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Parameters for deleting a managed vector store. */
export interface VectorStoreManagementDeleteParams {
  /** Provider-specific vector store identifier. */
  vector_store_id: string;
}

/** Response from deleting a managed vector store. */
export interface VectorStoreManagementDeleteResponse {
  /** Outcome marker (e.g. `'success'`). */
  status: string;
  /** Optional human-readable message. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Indexes — POST /v1/indexes
// ─────────────────────────────────────────────────────────────────────────────

/** LiteLLM routing parameters embedded in an index. */
export interface IndexCreateLiteLLMParams {
  /** Identifier for the underlying vector store index. */
  vector_store_index: string;
  /** Display name of the underlying vector store. */
  vector_store_name: string;
}

/** Parameters for creating an index. */
export interface IndexCreateParams {
  /** Display name of the index. */
  index_name: string;
  /** LiteLLM routing parameters. */
  litellm_params: IndexCreateLiteLLMParams;
  /** Free-form metadata about the index. */
  index_info?: Record<string, unknown>;
}

/** A managed vector-store index. */
export interface ManagedVectorStoreIndex {
  /** Unique identifier. */
  id: string;
  /** Display name of the index. */
  index_name: string;
  /** LiteLLM routing parameters. */
  litellm_params: IndexCreateLiteLLMParams;
  /** Free-form metadata about the index. */
  index_info?: Record<string, unknown> | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString | null;
  /** Identifier of the user / key that created the index. */
  created_by?: string | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString | null;
  /** Identifier of the user / key that last updated the index. */
  updated_by?: string | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

export type IndexCreateResponse = ManagedVectorStoreIndex;
