// ─────────────────────────────────────────────────────────────────────────────
// Fine-tuning API
// ─────────────────────────────────────────────────────────────────────────────

export type FineTuningStatus =
  | 'validating_files'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | (string & {});

export interface FineTuningHyperparameters {
  batch_size?: number | 'auto';
  learning_rate_multiplier?: number | 'auto';
  n_epochs?: number | 'auto';
}

export interface FineTuningCreateParams {
  model: string;
  training_file: string;
  validation_file?: string;
  hyperparameters?: FineTuningHyperparameters;
  suffix?: string | null;
  seed?: number;
  integrations?: Array<{ type: 'wandb'; wandb: { project: string; tags?: string[]; entity?: string; name?: string } }>;
  custom_llm_provider?: string;
}

export interface FineTuningJob {
  id: string;
  object: 'fine_tuning.job';
  created_at: number;
  finished_at?: number | null;
  model: string;
  fine_tuned_model: string | null;
  organization_id?: string;
  result_files: string[];
  status: FineTuningStatus;
  validation_file: string | null;
  training_file: string;
  hyperparameters: FineTuningHyperparameters;
  trained_tokens?: number | null;
  error?: { code?: string; message?: string; param?: string | null } | null;
  user_provided_suffix?: string | null;
  seed?: number | null;
  estimated_finish?: number | null;
  integrations?: unknown[];
  [key: string]: unknown;
}

export interface FineTuningListParams {
  after?: string;
  limit?: number;
  custom_llm_provider?: string;
}
export interface FineTuningListResponse {
  object: 'list';
  data: FineTuningJob[];
  has_more?: boolean;
}

export interface FineTuningEvent {
  id: string;
  object: 'fine_tuning.job.event';
  created_at: number;
  level: 'info' | 'warn' | 'error' | (string & {});
  message: string;
  data?: Record<string, unknown>;
  type?: string;
}
export interface FineTuningEventsResponse {
  object: 'list';
  data: FineTuningEvent[];
  has_more?: boolean;
}
