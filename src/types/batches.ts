// ─────────────────────────────────────────────────────────────────────────────
// Batches API (OpenAI-compatible)
// ─────────────────────────────────────────────────────────────────────────────

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

export interface BatchRequestCounts {
  total: number;
  completed: number;
  failed: number;
}

export interface BatchError {
  code: string;
  message: string;
  param?: string | null;
  line?: number | null;
}

export interface BatchObject {
  id: string;
  object: 'batch';
  endpoint: string;
  errors: { object: 'list'; data: BatchError[] } | null;
  input_file_id: string;
  completion_window: string;
  status: BatchStatus;
  output_file_id: string | null;
  error_file_id: string | null;
  created_at: number;
  in_progress_at: number | null;
  expires_at: number | null;
  finalizing_at: number | null;
  completed_at: number | null;
  failed_at: number | null;
  expired_at: number | null;
  cancelling_at?: number | null;
  cancelled_at?: number | null;
  request_counts: BatchRequestCounts;
  metadata: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface BatchCreateParams {
  input_file_id: string;
  endpoint: '/v1/chat/completions' | '/v1/embeddings' | '/v1/completions' | (string & {});
  completion_window: '24h' | (string & {});
  metadata?: Record<string, unknown>;
  custom_llm_provider?: string;
}

export interface BatchListParams {
  after?: string;
  limit?: number;
  custom_llm_provider?: string;
}

export interface BatchListResponse {
  object: 'list';
  data: BatchObject[];
  first_id?: string | null;
  last_id?: string | null;
  has_more?: boolean;
}
