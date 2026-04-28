// ─────────────────────────────────────────────────────────────────────────────
// Rerank API
// ─────────────────────────────────────────────────────────────────────────────

export type RerankModel =
  | 'rerank-english-v3.0'
  | 'rerank-multilingual-v3.0'
  | 'rerank-english-v2.0'
  | 'rerank-multilingual-v2.0'
  | (string & {});

export interface RerankCreateParams {
  model: RerankModel;
  query: string;
  documents: string[] | Array<{ text: string } & Record<string, unknown>>;
  top_n?: number;
  rank_fields?: string[];
  return_documents?: boolean;
  max_chunks_per_doc?: number;
}

export interface RerankResult {
  index: number;
  relevance_score: number;
  document?: { text: string } & Record<string, unknown>;
}

export interface RerankMeta {
  api_version?: { version?: string; is_experimental?: boolean };
  billed_units?: { search_units?: number; classifications?: number };
  tokens?: { input_tokens?: number; output_tokens?: number };
  warnings?: string[];
  [key: string]: unknown;
}

export interface RerankResponse {
  id: string;
  results: RerankResult[];
  meta?: RerankMeta;
}
