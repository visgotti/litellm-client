// ─────────────────────────────────────────────────────────────────────────────
// Batches API (OpenAI-compatible)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lifecycle states a batch job can be in.
 *
 * - `validating`: Input file is being validated.
 * - `failed`: Validation failed; batch will not run.
 * - `in_progress`: Requests are being processed.
 * - `finalizing`: Output and error files are being generated.
 * - `completed`: All requests finished and output is available.
 * - `expired`: Window elapsed before completion.
 * - `cancelling`: Cancellation requested but not yet applied.
 * - `cancelled`: Successfully cancelled.
 */
export type BatchStatus =
  | 'validating'
  | 'failed'
  | 'in_progress'
  | 'finalizing'
  | 'completed'
  | 'expired'
  | 'cancelling'
  | 'cancelled'
  | (string & {});

/**
 * Aggregate counts of requests in a batch.
 *
 * @see https://docs.litellm.ai/docs/batches
 */
export interface BatchRequestCounts {
  /** Total number of requests in the batch. */
  total: number;
  /** Number of requests that completed successfully. */
  completed: number;
  /** Number of requests that failed. */
  failed: number;
}

/**
 * Per-request error encountered during batch validation or execution.
 *
 * @see https://docs.litellm.ai/docs/batches
 */
export interface BatchError {
  /** Machine-readable error code. */
  code: string;
  /** Human-readable error message. */
  message: string;
  /** Request parameter the error refers to, if applicable. */
  param?: string | null;
  /** Line number in the input file where the error occurred. */
  line?: number | null;
}

/**
 * A batch job tracking a set of asynchronous requests.
 *
 * @see https://docs.litellm.ai/docs/batches
 */
export interface BatchObject {
  /** Unique identifier. */
  id: string;
  /** Always `'batch'`. */
  object: 'batch';
  /** API endpoint this batch targets (e.g. `'/v1/chat/completions'`). */
  endpoint: string;
  /** Errors encountered during validation, or `null` if none. */
  errors: { object: 'list'; data: BatchError[] } | null;
  /** ID of the uploaded JSONL input file. */
  input_file_id: string;
  /** Time window within which the batch must complete (e.g. `'24h'`). */
  completion_window: string;
  /** Current lifecycle status. */
  status: BatchStatus;
  /** ID of the file containing successful responses, if available. */
  output_file_id: string | null;
  /** ID of the file containing per-request errors, if any. */
  error_file_id: string | null;
  /** Unix timestamp (seconds) when the batch was created. */
  created_at: number;
  /** Unix timestamp when processing began. */
  in_progress_at: number | null;
  /** Unix timestamp when the batch will expire if not completed. */
  expires_at: number | null;
  /** Unix timestamp when finalization started. */
  finalizing_at: number | null;
  /** Unix timestamp when the batch finished successfully. */
  completed_at: number | null;
  /** Unix timestamp when the batch failed. */
  failed_at: number | null;
  /** Unix timestamp when the batch expired. */
  expired_at: number | null;
  /** Unix timestamp when cancellation was requested. */
  cancelling_at?: number | null;
  /** Unix timestamp when cancellation completed. */
  cancelled_at?: number | null;
  /** Aggregate counts of requests in the batch. */
  request_counts: BatchRequestCounts;
  /** Free-form metadata attached at creation. */
  metadata: Record<string, unknown> | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Parameters for creating a new batch job.
 *
 * @see https://docs.litellm.ai/docs/batches
 */
export interface BatchCreateParams {
  /** ID of the uploaded JSONL file containing the batched requests. */
  input_file_id: string;
  /** API endpoint each line in the input file targets. */
  endpoint: '/v1/chat/completions' | '/v1/embeddings' | '/v1/completions' | (string & {});
  /** Time window within which the batch must complete (currently `'24h'`). */
  completion_window: '24h' | (string & {});
  /** Free-form metadata to attach to the batch. */
  metadata?: Record<string, unknown>;
  /** Override the LiteLLM provider used to dispatch the batch (e.g. `'openai'`, `'azure'`). */
  custom_llm_provider?: string;
}

/**
 * Query parameters for paginating batches.
 *
 * @see https://docs.litellm.ai/docs/batches
 */
export interface BatchListParams {
  /** Cursor: return batches after this batch ID. */
  after?: string;
  /** Maximum number of batches to return per page. */
  limit?: number;
  /** Filter to a specific LiteLLM provider. */
  custom_llm_provider?: string;
}

/**
 * Paginated list of batches.
 *
 * @see https://docs.litellm.ai/docs/batches
 */
export interface BatchListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Page of batches. */
  data: BatchObject[];
  /** ID of the first batch in the page. */
  first_id?: string | null;
  /** ID of the last batch in the page. */
  last_id?: string | null;
  /** Whether more batches exist after this page. */
  has_more?: boolean;
}
