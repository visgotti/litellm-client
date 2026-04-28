import type { Message } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// RAG: Ingest + Query
// ─────────────────────────────────────────────────────────────────────────────

// ─── Ingest ──────────────────────────────────────────────────────────────────

export interface RagVectorStoreConfig {
  custom_llm_provider: string;
  vector_store_id?: string;
  [key: string]: unknown;
}

export interface RagLitellmVectorStoreParams {
  vector_store_name?: string;
  vector_store_description?: string;
  [key: string]: unknown;
}

export interface RagIngestOptions {
  vector_store: RagVectorStoreConfig;
  litellm_vector_store_params?: RagLitellmVectorStoreParams;
  [key: string]: unknown;
}

export interface RagIngestFileBase64 {
  filename: string;
  /** Base64-encoded file contents. */
  content: string;
  content_type?: string;
}

export interface RagIngestParams {
  ingest_options: RagIngestOptions;
  /** Base64-encoded file payload. */
  file?: RagIngestFileBase64;
  /** URL the proxy should fetch the file from. */
  file_url?: string;
  /** Existing file_id (already uploaded via /v1/files). */
  file_id?: string;
  [key: string]: unknown;
}

export interface RagIngestResponse {
  vector_store_id?: string;
  file_id?: string;
  [key: string]: unknown;
}

// ─── Query ───────────────────────────────────────────────────────────────────

export interface RagRetrievalConfig {
  vector_store_id: string;
  custom_llm_provider?: string;
  top_k?: number;
  [key: string]: unknown;
}

export interface RagRerankConfig {
  enabled?: boolean;
  model?: string;
  top_n?: number;
  [key: string]: unknown;
}

export interface RagQueryParams {
  model: string;
  messages: Message[];
  retrieval_config: RagRetrievalConfig;
  rerank?: RagRerankConfig;
  stream?: boolean;
  [key: string]: unknown;
}

export interface RagQueryResponse {
  id?: string;
  object?: string;
  model?: string;
  choices?: Array<Record<string, unknown>>;
  retrieved_context?: unknown;
  usage?: Record<string, unknown>;
  [key: string]: unknown;
}
