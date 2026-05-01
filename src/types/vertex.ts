// ─────────────────────────────────────────────────────────────────────────────
// Google Vertex AI pass-through types.
// References:
//   https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.publishers.models/generateContent
//   https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.endpoints/predict
//   https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.batchPredictionJobs
//   https://docs.litellm.ai/docs/pass_through/vertex_ai
//
// Vertex AI hosts Gemini models with the same generateContent shape used by the
// AI Studio / Gemini API, so we re-use the GenerateContent* types from
// `./gemini` here. Other Vertex-AI surfaces (Predict, BatchPredictionJobs) have
// model-family-specific instance/parameter shapes that we keep open.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  GenerateContentRequest,
  GenerateContentResponse,
} from './gemini';

// ─── generateContent / streamGenerateContent ─────────────────────────────────

export type VertexGenerateContentParams = GenerateContentRequest;
export type VertexGenerateContentResponse = GenerateContentResponse;

// ─── embedContent ────────────────────────────────────────────────────────────

export interface VertexEmbedContentParams {
  /** The content to embed. Vertex accepts a single content (parts list). */
  content: GenerateContentRequest['contents'][number];
  /** Optional task type for embedding-aware models. */
  taskType?:
    | 'RETRIEVAL_QUERY'
    | 'RETRIEVAL_DOCUMENT'
    | 'SEMANTIC_SIMILARITY'
    | 'CLASSIFICATION'
    | 'CLUSTERING'
    | 'QUESTION_ANSWERING'
    | 'FACT_VERIFICATION'
    | 'CODE_RETRIEVAL_QUERY'
    | (string & {});
  /** Optional title used by some retrieval-tuned models. */
  title?: string;
  /** Optional truncation length. */
  outputDimensionality?: number;
  [key: string]: unknown;
}

export interface VertexEmbedContentResponse {
  embedding: {
    values: number[];
    statistics?: { truncated?: boolean; tokenCount?: number };
  };
  [key: string]: unknown;
}

// ─── predict ─────────────────────────────────────────────────────────────────
// Vertex AI online prediction. Instance/parameter shapes are model-family
// specific (PaLM text-bison, Imagen, Codey, custom-trained models, etc.) so we
// keep them open. The response always has an `predictions` array.

export interface VertexPredictParams {
  instances: Array<Record<string, unknown>>;
  parameters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface VertexPredictResponse {
  predictions?: Array<Record<string, unknown>>;
  deployedModelId?: string;
  model?: string;
  modelDisplayName?: string;
  modelVersionId?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// ─── batchPredictionJobs ─────────────────────────────────────────────────────

export type VertexJobState =
  | 'JOB_STATE_UNSPECIFIED'
  | 'JOB_STATE_QUEUED'
  | 'JOB_STATE_PENDING'
  | 'JOB_STATE_RUNNING'
  | 'JOB_STATE_SUCCEEDED'
  | 'JOB_STATE_FAILED'
  | 'JOB_STATE_CANCELLING'
  | 'JOB_STATE_CANCELLED'
  | 'JOB_STATE_PAUSED'
  | 'JOB_STATE_EXPIRED'
  | 'JOB_STATE_UPDATING'
  | 'JOB_STATE_PARTIALLY_SUCCEEDED'
  | (string & {});

export interface VertexBatchPredictionJobCreateParams {
  /** Display name for the job. Required by the Vertex API. */
  displayName: string;
  /** Resource name of the model, e.g. `publishers/google/models/gemini-1.5-pro`. */
  model: string;
  /** Input config (BigQuery, GCS, etc.). */
  inputConfig: Record<string, unknown>;
  /** Output config (BigQuery / GCS destination). */
  outputConfig: Record<string, unknown>;
  modelParameters?: Record<string, unknown>;
  dedicatedResources?: Record<string, unknown>;
  manualBatchTuningParameters?: Record<string, unknown>;
  generateExplanation?: boolean;
  explanationSpec?: Record<string, unknown>;
  labels?: Record<string, string>;
  encryptionSpec?: { kmsKeyName: string };
  [key: string]: unknown;
}

export interface VertexBatchPredictionJob {
  name: string;
  displayName?: string;
  model?: string;
  inputConfig?: Record<string, unknown>;
  outputConfig?: Record<string, unknown>;
  outputInfo?: Record<string, unknown>;
  state?: VertexJobState;
  error?: { code?: number; message?: string; details?: unknown };
  partialFailures?: Array<Record<string, unknown>>;
  resourcesConsumed?: Record<string, unknown>;
  completionStats?: Record<string, unknown>;
  createTime?: string;
  startTime?: string;
  endTime?: string;
  updateTime?: string;
  labels?: Record<string, string>;
  [key: string]: unknown;
}

export interface VertexBatchPredictionJobListResponse {
  batchPredictionJobs?: VertexBatchPredictionJob[];
  nextPageToken?: string;
  [key: string]: unknown;
}
