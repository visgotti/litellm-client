// ─────────────────────────────────────────────────────────────────────────────
// Fine-tuning API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lifecycle states a fine-tuning job can be in.
 *
 * - `validating_files`: Validating training and validation files.
 * - `queued`: Awaiting a worker.
 * - `running`: Currently training.
 * - `succeeded`: Finished successfully; `fine_tuned_model` is set.
 * - `failed`: Errored; check `error`.
 * - `cancelled`: Cancelled before completion.
 */
export type FineTuningStatus =
  | 'validating_files'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | (string & {});

/**
 * Hyperparameters for a fine-tuning job. `'auto'` lets the provider choose.
 *
 * @see https://docs.litellm.ai/docs/fine_tuning
 */
export interface FineTuningHyperparameters {
  /** Number of examples per training step. */
  batch_size?: number | 'auto';
  /** Multiplier applied to the base learning rate. */
  learning_rate_multiplier?: number | 'auto';
  /** Number of full passes over the training data. */
  n_epochs?: number | 'auto';
}

/**
 * Parameters for creating a fine-tuning job.
 *
 * @see https://docs.litellm.ai/docs/fine_tuning
 */
export interface FineTuningCreateParams {
  /** Base model to fine-tune. */
  model: string;
  /** ID of the uploaded JSONL training file (purpose `'fine-tune'`). */
  training_file: string;
  /** ID of the uploaded JSONL validation file. */
  validation_file?: string;
  /** Training hyperparameters. */
  hyperparameters?: FineTuningHyperparameters;
  /** Suffix appended to the resulting fine-tuned model name. */
  suffix?: string | null;
  /** Random seed for reproducible training. */
  seed?: number;
  /** Third-party integrations to log training metrics to. */
  integrations?: Array<{
    /** Integration kind (currently `'wandb'` only). */
    type: 'wandb';
    /** Weights & Biases configuration. */
    wandb: { project: string; tags?: string[]; entity?: string; name?: string };
  }>;
  /** LiteLLM requires this to route the job to the correct upstream provider. */
  custom_llm_provider: string;
}

/**
 * A fine-tuning job.
 *
 * @see https://docs.litellm.ai/docs/fine_tuning
 */
export interface FineTuningJob {
  /** Unique identifier. */
  id: string;
  /** Always `'fine_tuning.job'`. */
  object: 'fine_tuning.job';
  /** Unix timestamp (seconds) of creation. */
  created_at: number;
  /** Unix timestamp when training finished. */
  finished_at?: number | null;
  /** Base model the job is fine-tuning. */
  model: string;
  /** Resulting fine-tuned model name (only set when `status === 'succeeded'`). */
  fine_tuned_model: string | null;
  /** Owning organization ID. */
  organization_id?: string;
  /** IDs of result files (e.g. checkpoints, metrics). */
  result_files: string[];
  /** Lifecycle status. */
  status: FineTuningStatus;
  /** ID of the validation file used. */
  validation_file: string | null;
  /** ID of the training file used. */
  training_file: string;
  /** Hyperparameters applied. */
  hyperparameters: FineTuningHyperparameters;
  /** Total tokens trained on. */
  trained_tokens?: number | null;
  /** Error block when `status === 'failed'`. */
  error?: { code?: string; message?: string; param?: string | null } | null;
  /** Suffix supplied via `suffix` at creation time. */
  user_provided_suffix?: string | null;
  /** Random seed used. */
  seed?: number | null;
  /** Unix timestamp at which training is estimated to finish. */
  estimated_finish?: number | null;
  /** Third-party integrations attached to the job. */
  integrations?: unknown[];
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Query parameters for listing fine-tuning jobs.
 *
 * @see https://docs.litellm.ai/docs/fine_tuning
 */
export interface FineTuningListParams {
  /** Cursor — return jobs after this ID. */
  after?: string;
  /** Maximum results per page. */
  limit?: number;
  /** Filter to a specific LiteLLM provider. */
  custom_llm_provider?: string;
}
/**
 * Paginated list of fine-tuning jobs.
 *
 * @see https://docs.litellm.ai/docs/fine_tuning
 */
export interface FineTuningListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Page of jobs. */
  data: FineTuningJob[];
  /** Whether more jobs exist after this page. */
  has_more?: boolean;
}

/**
 * A training-progress event emitted by a fine-tuning job.
 *
 * @see https://docs.litellm.ai/docs/fine_tuning
 */
export interface FineTuningEvent {
  /** Unique identifier. */
  id: string;
  /** Always `'fine_tuning.job.event'`. */
  object: 'fine_tuning.job.event';
  /** Unix timestamp (seconds) of the event. */
  created_at: number;
  /** Severity of the event. */
  level: 'info' | 'warn' | 'error' | (string & {});
  /** Human-readable message. */
  message: string;
  /** Structured payload (e.g. metrics). */
  data?: Record<string, unknown>;
  /** Provider-specific event type identifier. */
  type?: string;
}
/**
 * Paginated list of fine-tuning job events.
 *
 * @see https://docs.litellm.ai/docs/fine_tuning
 */
export interface FineTuningEventsResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Page of events. */
  data: FineTuningEvent[];
  /** Whether more events exist after this page. */
  has_more?: boolean;
}
