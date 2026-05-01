// ─────────────────────────────────────────────────────────────────────────────
// OpenAI Evals API (/v1/evals)
// Mirrors litellm.types.llms.openai_evals
// ─────────────────────────────────────────────────────────────────────────────

import type { CursorPage } from './common';

// ─── Data source configs (eval-level) ────────────────────────────────────────

/**
 * Custom data source config — accepts any rows matching `item_schema`.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface DataSourceConfigCustom {
  /** Discriminator (`'custom'`). */
  type: 'custom';
  /** JSON schema describing the structure of each row. */
  item_schema: Record<string, unknown>;
  /** Whether to include the optional `sample` field in each row's schema. */
  include_sample_schema?: boolean;
}

/**
 * Logs data source — pulls eval inputs from request logs.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface DataSourceConfigLogs {
  /** Discriminator (`'logs'`). */
  type: 'logs';
  /** Filter logs by metadata. */
  metadata?: Record<string, unknown>;
}

/**
 * Stored-completions data source — pulls eval inputs from saved chat completions.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface DataSourceConfigStoredCompletions {
  /** Discriminator (`'stored_completions'`). */
  type: 'stored_completions';
  /** Filter stored completions by metadata. */
  metadata?: Record<string, unknown>;
}

export type DataSourceConfig =
  | DataSourceConfigCustom
  | DataSourceConfigLogs
  | DataSourceConfigStoredCompletions
  | { type: string; [k: string]: unknown };

// ─── Grader configs ──────────────────────────────────────────────────────────

/**
 * Grader using an LLM as a judge.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface LLMAsJudgeGraderConfig {
  /** Discriminator (`'llm_as_judge'`). */
  type: 'llm_as_judge';
  /** Judge model identifier. */
  model?: import('./models-enum').ChatModel | (string & {});
  /** Prompt template the judge model uses to score samples. */
  prompt?: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [k: string]: unknown;
}

/**
 * Ground-truth grader using a deterministic metric.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface GroundTruthGraderConfig {
  /** Discriminator (`'ground_truth'`). */
  type: 'ground_truth';
  /** Metric to apply against the labelled answer. */
  metric?: 'exact_match' | 'f1_score' | 'bleu';
  /** Free-form additional fields forwarded to the upstream provider. */
  [k: string]: unknown;
}

/**
 * Custom grader implemented as a server-side function.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface CustomGraderConfig {
  /** Discriminator (`'custom'`). */
  type: 'custom';
  /** ID of the registered grader function. */
  function_id: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [k: string]: unknown;
}

export type GraderConfig =
  | LLMAsJudgeGraderConfig
  | GroundTruthGraderConfig
  | CustomGraderConfig
  | { type: string; [k: string]: unknown };

// ─── Eval object ─────────────────────────────────────────────────────────────

/**
 * An evaluation definition.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalObject {
  /** Unique identifier. */
  id: string;
  /** Always `'eval'`. */
  object: 'eval' | (string & {});
  /** Unix timestamp (seconds) of creation. */
  created_at: number;
  /** Unix timestamp (seconds) of the last update. */
  updated_at?: number | null;
  /** Human-readable name. */
  name?: string | null;
  /** Data source configuration block. */
  data_source_config: Record<string, unknown>;
  /** Grader configurations applied to each sample. */
  testing_criteria: Array<Record<string, unknown>>;
  /** Free-form metadata. */
  metadata?: Record<string, unknown> | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Parameters for creating an eval definition.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalCreateParams {
  /** Human-readable name. */
  name?: string;
  /** Data source configuration. */
  data_source_config: DataSourceConfig;
  /** Grader configurations applied to each sample. */
  testing_criteria: GraderConfig[];
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** LiteLLM extension: route to a specific provider. */
  custom_llm_provider?: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * Parameters for updating an eval definition.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalUpdateParams {
  /** New display name. */
  name?: string;
  /** Replacement metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * Query parameters for listing eval definitions.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalListParams {
  /** Maximum results per page. */
  limit?: number;
  /** Cursor — return evals after this ID. */
  after?: string;
  /** Cursor — return evals before this ID. */
  before?: string;
  /** Sort order. */
  order?: 'asc' | 'desc';
  /** Field to sort by. */
  order_by?: 'created_at' | 'updated_at';
}

export type EvalListResponse = CursorPage<EvalObject>;

/**
 * Response from deleting an eval definition.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalDeleteResponse {
  /** ID of the deleted eval. */
  eval_id: string;
  /** Always `'eval.deleted'`. */
  object: 'eval.deleted' | (string & {});
  /** `true` if the eval was deleted. */
  deleted: boolean;
}

/**
 * Response from cancelling an eval definition.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalCancelResponse {
  /** ID of the cancelled eval. */
  id: string;
  /** Always `'eval'`. */
  object: 'eval' | (string & {});
  /** Always `'cancelled'`. */
  status: 'cancelled';
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

// ─── Run data sources ────────────────────────────────────────────────────────

/**
 * Run data source backed by a stored dataset.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface RunDataSourceDataset {
  /** Discriminator (`'dataset'`). */
  type: 'dataset';
  /** ID of the stored dataset. */
  dataset_id: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [k: string]: unknown;
}

/**
 * Run data source backed by a stored sample set.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface RunDataSourceSampleSet {
  /** Discriminator (`'sample_set'`). */
  type: 'sample_set';
  /** ID of the stored sample set. */
  sample_set_id: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [k: string]: unknown;
}

/**
 * Run data source provided inline.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface RunDataSourceInline {
  /** Discriminator (`'inline'`). */
  type: 'inline';
  /** Inline samples to evaluate. */
  samples: Array<Record<string, unknown>>;
  /** Free-form additional fields forwarded to the upstream provider. */
  [k: string]: unknown;
}

export type RunDataSource =
  | RunDataSourceDataset
  | RunDataSourceSampleSet
  | RunDataSourceInline
  | { type: string; [k: string]: unknown };

/**
 * Sampling configuration for the candidate model in an eval run.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface RunCompletionConfig {
  /** Candidate model under test. */
  model: import('./models-enum').ChatModel | (string & {});
  /** Sampling temperature in `[0, 2]`. */
  temperature?: number;
  /** Maximum number of tokens to generate per sample. */
  max_tokens?: number;
  /** Nucleus-sampling cutoff in `(0, 1]`. */
  top_p?: number;
  /** Penalty for token frequency in `[-2.0, 2.0]`. */
  frequency_penalty?: number;
  /** Penalty for token presence in `[-2.0, 2.0]`. */
  presence_penalty?: number;
  /** Free-form additional fields forwarded to the upstream provider. */
  [k: string]: unknown;
}

// ─── Run object ──────────────────────────────────────────────────────────────

/**
 * Aggregate result counts for an eval run.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface ResultCounts {
  /** Total samples graded. */
  total: number;
  /** Samples that passed. */
  passed: number;
  /** Samples that failed. */
  failed: number;
  /** Samples that errored. */
  error: number;
}

/**
 * Per-criterion results within an eval run.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface PerTestingCriteriaResult {
  /** Position of the criterion in `eval.testing_criteria`. */
  testing_criteria_index: number;
  /** Aggregate result counts for this criterion. */
  result_counts: ResultCounts;
  /** Average grader score (0–1) across samples. */
  average_score?: number | null;
}

/**
 * Lifecycle states of an eval run.
 *
 * - `queued`: Awaiting execution.
 * - `running`: Currently executing.
 * - `completed`: Finished successfully.
 * - `failed`: Errored before completion.
 * - `cancelled`: Cancelled before completion.
 */
export type EvalRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * An eval run — one execution of an eval against a data source.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalRunObject {
  /** Unique identifier. */
  id: string;
  /** Always `'eval.run'`. */
  object: 'eval.run' | (string & {});
  /** Unix timestamp (seconds) of creation. */
  created_at: number;
  /** Lifecycle status. */
  status: EvalRunStatus;
  /** Data source used by the run. */
  data_source: Record<string, unknown>;
  /** ID of the parent eval. */
  eval_id: string;
  /** Human-readable run name. */
  name?: string | null;
  /** Unix timestamp when execution started. */
  started_at?: number | null;
  /** Unix timestamp when execution completed. */
  completed_at?: number | null;
  /** Candidate model evaluated. */
  model?: string | null;
  /** Per-model usage / token counts. */
  per_model_usage?: unknown;
  /** Per-criterion result breakdown. */
  per_testing_criteria_results?: PerTestingCriteriaResult[] | null;
  /** URL to a hosted report for this run. */
  report_url?: string | null;
  /** Aggregate result counts (e.g. `{ passed: 12, failed: 3 }`). */
  result_counts?: Record<string, number> | null;
  /** Whether the run is shared with OpenAI. */
  shared_with_openai?: boolean | null;
  /** Free-form metadata. */
  metadata?: Record<string, unknown> | null;
  /** Run-level error block (when `status === 'failed'`). */
  error?: Record<string, unknown> | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Parameters for creating an eval run.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalRunCreateParams {
  /** Data source the run pulls samples from. */
  data_source: RunDataSource | Record<string, unknown>;
  /** Human-readable run name. */
  name?: string;
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * Query parameters for listing eval runs.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalRunListParams {
  /** Maximum results per page. */
  limit?: number;
  /** Cursor — return runs after this ID. */
  after?: string;
  /** Cursor — return runs before this ID. */
  before?: string;
  /** Sort order. */
  order?: 'asc' | 'desc';
}

export type EvalRunListResponse = CursorPage<EvalRunObject>;

/**
 * Response from cancelling an eval run.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalRunCancelResponse {
  /** ID of the cancelled run. */
  id: string;
  /** Always `'eval.run'`. */
  object: 'eval.run' | (string & {});
  /** Always `'cancelled'`. */
  status: 'cancelled';
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Response from deleting an eval run.
 *
 * @see https://docs.litellm.ai/docs/evals_api
 */
export interface EvalRunDeleteResponse {
  /** ID of the deleted run. */
  run_id: string;
  /** Always `'eval.run.deleted'`. */
  object?: 'eval.run.deleted' | (string & {});
  /** `true` if the run was deleted. */
  deleted?: boolean;
}
