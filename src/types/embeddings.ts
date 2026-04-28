import type { Usage } from './common';
import type { EmbeddingModelId } from './models-enum';

// ─────────────────────────────────────────────────────────────────────────────
// Embeddings – Request
// ─────────────────────────────────────────────────────────────────────────────

export interface EmbeddingCreateParams {
  model: EmbeddingModelId;
  input: string | string[] | number[] | number[][];
  encoding_format?: 'float' | 'base64';
  dimensions?: number;
  user?: string;
  metadata?: Record<string, unknown>;
  /** Cohere-style input type. */
  input_type?: 'search_document' | 'search_query' | 'classification' | 'clustering' | (string & {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Embeddings – Response
// ─────────────────────────────────────────────────────────────────────────────

export interface EmbeddingObject {
  object: 'embedding';
  index: number;
  /** Float array, or base64-encoded string when encoding_format='base64'. */
  embedding: number[] | string;
}

export interface EmbeddingResponse {
  object: 'list';
  model: string;
  data: EmbeddingObject[];
  usage: Pick<Usage, 'prompt_tokens' | 'total_tokens'>;
}
