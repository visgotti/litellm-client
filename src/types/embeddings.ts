import type { Usage, LiteLLMForwardingOverrides } from './common';
import type { EmbeddingModelId } from './models-enum';

// ─────────────────────────────────────────────────────────────────────────────
// Embeddings – Request
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parameters for creating embeddings.
 *
 * @see https://docs.litellm.ai/docs/embedding/supported_embedding
 */
export interface EmbeddingCreateParams extends LiteLLMForwardingOverrides {
  /** Embedding model to use. */
  model: EmbeddingModelId;
  /** Input text(s) or pre-tokenized integer IDs to embed. */
  input: string | string[] | number[] | number[][];
  /** Format of the returned embedding values. */
  encoding_format?: 'float' | 'base64';
  /** Number of dimensions to truncate the embedding to (provider-permitting). */
  dimensions?: number;
  /** End-user identifier forwarded to the provider for abuse detection. */
  user?: string;
  /** Free-form metadata logged with the request. */
  metadata?: Record<string, unknown>;
  /** Cohere / Voyage / Bedrock-style input type. */
  input_type?:
    | 'search_document'
    | 'search_query'
    | 'classification'
    | 'clustering'
    | 'passage'
    | 'query'
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | (string & {});
  /** Bedrock async embeddings: destination S3 URI for the output. */
  output_s3_uri?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Embeddings – Response
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single embedding vector in the response.
 *
 * @see https://docs.litellm.ai/docs/embedding/supported_embedding
 */
export interface EmbeddingObject {
  /** Always `'embedding'`. */
  object: 'embedding';
  /** Position of this embedding in the input array. */
  index: number;
  /** Float array, or base64-encoded string when `encoding_format='base64'`. */
  embedding: number[] | string;
}

/**
 * Embedding response payload.
 *
 * @see https://docs.litellm.ai/docs/embedding/supported_embedding
 */
export interface EmbeddingResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Model that produced the embeddings. */
  model: string;
  /** One embedding per input element, in the same order. */
  data: EmbeddingObject[];
  /** Token usage (no completion tokens for embeddings). */
  usage: Pick<Usage, 'prompt_tokens' | 'total_tokens'>;
}
