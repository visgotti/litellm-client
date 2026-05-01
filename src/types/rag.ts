import type { Message } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// RAG: Ingest + Query
// ─────────────────────────────────────────────────────────────────────────────

// ─── Ingest: vector_store config (per provider) ──────────────────────────────

/**
 * OpenAI vector-store config variant.
 *
 * If `vector_store_id` is omitted, LiteLLM auto-creates a new vector store.
 *
 * @see https://docs.litellm.ai/docs/rag_ingest
 */
export interface RagVectorStoreOpenAI {
  /** Provider discriminator (`'openai'`). */
  custom_llm_provider: 'openai';
  /** Existing vector store ID; auto-created if omitted. */
  vector_store_id?: string;
}

/**
 * AWS Bedrock Knowledge Base vector-store config variant.
 *
 * @see https://docs.litellm.ai/docs/rag_ingest
 */
export interface RagVectorStoreBedrock {
  /** Provider discriminator (`'bedrock'`). */
  custom_llm_provider: 'bedrock';
  /** Existing Bedrock Knowledge Base ID; auto-created if omitted. */
  vector_store_id?: string;
  /** Whether to block until ingestion completes. Default: false. */
  wait_for_ingestion?: boolean;
  /** Ingestion timeout in seconds (if waiting). Default: 300. */
  ingestion_timeout?: number;
  /** S3 bucket used to stage documents; auto-created if omitted. */
  s3_bucket?: string;
  /** S3 key prefix. Default: "data/". */
  s3_prefix?: string;
  /** Bedrock embedding model. Default: "amazon.titan-embed-text-v2:0". */
  embedding_model?: string;
  /** AWS region. Default: "us-west-2". */
  aws_region_name?: string;
}

/**
 * Google Vertex AI RAG corpus vector-store config variant.
 *
 * @see https://docs.litellm.ai/docs/rag_ingest
 */
export interface RagVectorStoreVertexAI {
  /** Provider discriminator (`'vertex_ai'`). */
  custom_llm_provider: 'vertex_ai';
  /** Vertex AI RAG corpus ID (required). */
  vector_store_id: string;
  /** GCS bucket for file uploads (required). */
  gcs_bucket: string;
  /** GCP project ID. Defaults to env VERTEXAI_PROJECT. */
  vertex_project?: string;
  /** GCP region. Default: "us-central1". */
  vertex_location?: string;
  /** Path to credentials JSON. Defaults to ADC. */
  vertex_credentials?: string;
  /** Wait for import to complete. Default: true. */
  wait_for_import?: boolean;
  /** Import timeout in seconds (if waiting). Default: 600. */
  import_timeout?: number;
}

/**
 * AWS S3 Vectors vector-store config variant.
 *
 * @see https://docs.litellm.ai/docs/rag_ingest
 */
export interface RagVectorStoreS3Vectors {
  /** Provider discriminator (`'s3_vectors'`). */
  custom_llm_provider: 's3_vectors';
  /** S3 vector bucket name (required). */
  vector_bucket_name: string;
  /** Vector index name; auto-created if omitted. */
  index_name?: string;
  /** Vector dimension; auto-detected from embedding model if omitted. */
  dimension?: number;
  /** Distance metric. Default: "cosine". */
  distance_metric?: 'cosine' | 'euclidean' | (string & {});
  /** Metadata keys excluded from filtering. Default: ["source_text"]. */
  non_filterable_metadata_keys?: string[];
  /** AWS region. Default: "us-west-2". */
  aws_region_name?: string;
  /** AWS access key ID; falls back to environment if omitted. */
  aws_access_key_id?: string;
  /** AWS secret access key; falls back to environment if omitted. */
  aws_secret_access_key?: string;
}

/**
 * Open fallback variant for providers not explicitly modelled
 * (e.g. "pinecone", "weaviate", or future LiteLLM additions).
 *
 * Prefer one of the typed variants when the provider is known.
 */
export type RagVectorStoreUnknown = Record<string, unknown> & {
  /** Provider discriminator. */
  custom_llm_provider?: string;
};

/**
 * Discriminated union of supported vector-store configurations,
 * keyed on `custom_llm_provider`.
 *
 * The four typed variants (openai, bedrock, vertex_ai, s3_vectors) cover
 * documented providers; `RagVectorStoreUnknown` is a forward-compatible
 * escape hatch for any other provider string.
 */
export type RagVectorStoreConfig =
  | RagVectorStoreOpenAI
  | RagVectorStoreBedrock
  | RagVectorStoreVertexAI
  | RagVectorStoreS3Vectors
  | RagVectorStoreUnknown;

// ─── Ingest: top-level options ───────────────────────────────────────────────

/**
 * Optional metadata applied to the LiteLLM-managed vector store.
 *
 * @see https://docs.litellm.ai/docs/rag_ingest
 */
export interface RagLitellmVectorStoreParams {
  /** Display name for the managed vector store. */
  vector_store_name?: string;
  /** Description for the managed vector store. */
  vector_store_description?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Document chunking strategy applied before embedding.
 *
 * @see https://docs.litellm.ai/docs/rag_ingest
 */
export interface RagChunkingStrategy {
  /** Maximum size of each chunk. Default: 1000. */
  chunk_size?: number;
  /** Overlap between consecutive chunks. Default: 200. */
  chunk_overlap?: number;
}

/**
 * Top-level options for an ingest pipeline run.
 *
 * @see https://docs.litellm.ai/docs/rag_ingest
 */
export interface RagIngestOptions {
  /** Vector store configuration. */
  vector_store: RagVectorStoreConfig;
  /** Pipeline name surfaced in logs. */
  name?: string;
  /** Document chunking configuration. */
  chunking_strategy?: RagChunkingStrategy;
  /** Optional metadata applied to the LiteLLM-managed vector store. */
  litellm_vector_store_params?: RagLitellmVectorStoreParams;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * Inline base64-encoded file payload for ingest.
 *
 * @see https://docs.litellm.ai/docs/rag_ingest
 */
export interface RagIngestFileBase64 {
  /** Original filename. */
  filename: string;
  /** Base64-encoded file contents. */
  content: string;
  /** MIME type of the file (e.g. "text/plain"). Required by the API. */
  content_type: string;
}

/**
 * Parameters for ingesting a document into a vector store.
 *
 * @see https://docs.litellm.ai/docs/rag_ingest
 */
export interface RagIngestParams {
  /** Pipeline options including the destination vector store. */
  ingest_options: RagIngestOptions;
  /** Base64-encoded file payload. */
  file?: RagIngestFileBase64;
  /** URL the proxy should fetch the file from. */
  file_url?: string;
  /** Existing file_id (already uploaded via /v1/files). */
  file_id?: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/** Documented status values for an ingest pipeline run. */
export type RagIngestStatus = 'completed' | 'pending' | 'failed' | (string & {});

/**
 * Response from an ingest pipeline run.
 *
 * @see https://docs.litellm.ai/docs/rag_ingest
 */
export interface RagIngestResponse {
  /** Ingest operation identifier (e.g. "ingest_abc123"). */
  id?: string;
  /** Pipeline status (e.g. "completed"). */
  status?: RagIngestStatus;
  /** Vector store the file was ingested into (created or referenced). */
  vector_store_id?: string;
  /** Identifier of the ingested file. */
  file_id?: string;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

// ─── Query ───────────────────────────────────────────────────────────────────

/**
 * Retrieval configuration for a RAG query.
 *
 * @see https://docs.litellm.ai/docs/rag_query
 */
export interface RagRetrievalConfig {
  /** Vector store to query. */
  vector_store_id: string;
  /** Provider override for the retrieval call. */
  custom_llm_provider?: string;
  /** Number of top-matching documents to retrieve. */
  top_k?: number;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * Optional reranking configuration for a RAG query.
 *
 * @see https://docs.litellm.ai/docs/rag_query
 */
export interface RagRerankConfig {
  /** Enable reranking of retrieved documents. */
  enabled?: boolean;
  /** Reranker model identifier. */
  model?: string;
  /** Number of top results to keep after reranking. */
  top_n?: number;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * Parameters for running a RAG query.
 *
 * @see https://docs.litellm.ai/docs/rag_query
 */
export interface RagQueryParams {
  /** Generation model used to produce the answer. */
  model: string;
  /** Conversation messages providing context and the user query. */
  messages: Message[];
  /** Retrieval configuration. */
  retrieval_config: RagRetrievalConfig;
  /** Optional reranking configuration. */
  rerank?: RagRerankConfig;
  /** Stream incremental completion chunks. */
  stream?: boolean;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * Search/rerank metadata attached to a /rag/query response under
 * `_hidden_params` per the documented response shape.
 *
 * @see https://docs.litellm.ai/docs/rag_query
 */
export interface RagQueryHiddenParams {
  /** Documents returned from the retrieval stage. */
  search_results?: unknown;
  /** Documents returned from the rerank stage. */
  rerank_results?: unknown;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Response from running a RAG query (chat-completion-shaped).
 *
 * @see https://docs.litellm.ai/docs/rag_query
 */
export interface RagQueryResponse {
  /** Unique identifier for the completion. */
  id?: string;
  /** Object type marker (e.g. `'chat.completion'`). */
  object?: string;
  /** Unix timestamp (seconds) the completion was created. */
  created?: number;
  /** Model that produced the answer. */
  model?: string;
  /** Generated chat completion choices. */
  choices?: Array<Record<string, unknown>>;
  /** Token usage totals. */
  usage?: Record<string, unknown>;
  /**
   * Canonical location of search/rerank metadata per docs:
   * `_hidden_params.search_results` and `_hidden_params.rerank_results`.
   */
  _hidden_params?: RagQueryHiddenParams;
  /**
   * Convenience alias surfaced by some proxy versions. The documented
   * canonical fields live under `_hidden_params.search_results` /
   * `_hidden_params.rerank_results`; prefer those when present.
   */
  retrieved_context?: unknown;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}
