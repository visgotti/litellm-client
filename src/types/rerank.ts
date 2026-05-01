// ─────────────────────────────────────────────────────────────────────────────
// Rerank API
// ─────────────────────────────────────────────────────────────────────────────

/** Cohere-style rerank model identifier. */
export type RerankModel =
  | 'rerank-english-v3.0'
  | 'rerank-multilingual-v3.0'
  | 'rerank-english-v2.0'
  | 'rerank-multilingual-v2.0'
  | (string & {});

/**
 * Parameters for ranking documents by relevance to a query.
 *
 * @see https://docs.litellm.ai/docs/rerank
 */
export interface RerankCreateParams {
  /** Rerank model to use. */
  model: RerankModel;
  /** Query string to rank documents against. */
  query: string;
  /** Documents to rank — strings or objects with a `text` field. */
  documents: string[] | Array<{ text: string } & Record<string, unknown>>;
  /** Maximum number of top-ranked results to return. */
  top_n?: number;
  /** When documents are objects, the fields whose values should be considered for ranking. */
  rank_fields?: string[];
  /** When `true`, include the original document content in each result. */
  return_documents?: boolean;
  /** Maximum chunks each long document is split into before ranking. */
  max_chunks_per_doc?: number;
}

/**
 * A single ranked document in a rerank response.
 *
 * @see https://docs.litellm.ai/docs/rerank
 */
export interface RerankResult {
  /** Index of this document in the original `documents` array. */
  index: number;
  /** Relevance score (higher = more relevant). */
  relevance_score: number;
  /** Original document content (only when `return_documents=true`). */
  document?: { text: string } & Record<string, unknown>;
}

/**
 * Provider metadata about a rerank call.
 *
 * @see https://docs.litellm.ai/docs/rerank
 */
export interface RerankMeta {
  /** Version of the rerank API that served this response. */
  api_version?: { version?: string; is_experimental?: boolean };
  /** Counts of provider-billed units. */
  billed_units?: { search_units?: number; classifications?: number };
  /** Token usage for this call, if reported by the provider. */
  tokens?: { input_tokens?: number; output_tokens?: number };
  /** Provider warnings about the request. */
  warnings?: string[];
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Rerank response payload.
 *
 * @see https://docs.litellm.ai/docs/rerank
 */
export interface RerankResponse {
  /** Unique identifier for the rerank call. */
  id: string;
  /** Ranked results, sorted by descending `relevance_score`. */
  results: RerankResult[];
  /** Provider metadata about the call. */
  meta?: RerankMeta;
}
