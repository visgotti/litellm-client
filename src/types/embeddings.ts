import type { Usage } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Embeddings – Request
// ─────────────────────────────────────────────────────────────────────────────

export interface EmbeddingCreateParams {
  model: string;
  input: string | string[];
  encoding_format?: 'float' | 'base64';
  user?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Embeddings – Response
// ─────────────────────────────────────────────────────────────────────────────

export interface EmbeddingObject {
  object: 'embedding';
  index: number;
  embedding: number[];
}

export interface EmbeddingResponse {
  object: 'list';
  model: string;
  data: EmbeddingObject[];
  usage: Pick<Usage, 'prompt_tokens' | 'total_tokens'>;
}
