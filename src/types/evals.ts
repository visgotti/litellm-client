// ─────────────────────────────────────────────────────────────────────────────
// OpenAI Evals API (/v1/evals)
// Mirrors litellm.types.llms.openai_evals
// ─────────────────────────────────────────────────────────────────────────────

import type { CursorPage } from './common';

// ─── Data source configs (eval-level) ────────────────────────────────────────

export interface DataSourceConfigCustom {
  type: 'custom';
  /** JSON schema describing the structure of each row. */
  item_schema: Record<string, unknown>;
  include_sample_schema?: boolean;
}

export interface DataSourceConfigLogs {
  type: 'logs';
  metadata?: Record<string, unknown>;
}

export interface DataSourceConfigStoredCompletions {
  type: 'stored_completions';
  metadata?: Record<string, unknown>;
}

export type DataSourceConfig =
  | DataSourceConfigCustom
  | DataSourceConfigLogs
  | DataSourceConfigStoredCompletions
  | { type: string; [k: string]: unknown };

// ─── Grader configs ──────────────────────────────────────────────────────────

export interface LLMAsJudgeGraderConfig {
  type: 'llm_as_judge';
  model?: import('./models-enum').ChatModel | (string & {});
  prompt?: string;
  [k: string]: unknown;
}

export interface GroundTruthGraderConfig {
  type: 'ground_truth';
  metric?: 'exact_match' | 'f1_score' | 'bleu';
  [k: string]: unknown;
}

export interface CustomGraderConfig {
  type: 'custom';
  function_id: string;
  [k: string]: unknown;
}

export type GraderConfig =
  | LLMAsJudgeGraderConfig
  | GroundTruthGraderConfig
  | CustomGraderConfig
  | { type: string; [k: string]: unknown };

// ─── Eval object ─────────────────────────────────────────────────────────────

export interface EvalObject {
  id: string;
  object: 'eval' | (string & {});
  created_at: number;
  updated_at?: number | null;
  name?: string | null;
  data_source_config: Record<string, unknown>;
  testing_criteria: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface EvalCreateParams {
  name?: string;
  data_source_config: DataSourceConfig;
  testing_criteria: GraderConfig[];
  metadata?: Record<string, unknown>;
  /** LiteLLM extension: route to a specific provider. */
  custom_llm_provider?: string;
  [key: string]: unknown;
}

export interface EvalUpdateParams {
  name?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface EvalListParams {
  limit?: number;
  after?: string;
  before?: string;
  order?: 'asc' | 'desc';
  order_by?: 'created_at' | 'updated_at';
}

export type EvalListResponse = CursorPage<EvalObject>;

export interface EvalDeleteResponse {
  eval_id: string;
  object: 'eval.deleted' | (string & {});
  deleted: boolean;
}

export interface EvalCancelResponse {
  id: string;
  object: 'eval' | (string & {});
  status: 'cancelled';
  [key: string]: unknown;
}

// ─── Run data sources ────────────────────────────────────────────────────────

export interface RunDataSourceDataset {
  type: 'dataset';
  dataset_id: string;
  [k: string]: unknown;
}

export interface RunDataSourceSampleSet {
  type: 'sample_set';
  sample_set_id: string;
  [k: string]: unknown;
}

export interface RunDataSourceInline {
  type: 'inline';
  samples: Array<Record<string, unknown>>;
  [k: string]: unknown;
}

export type RunDataSource =
  | RunDataSourceDataset
  | RunDataSourceSampleSet
  | RunDataSourceInline
  | { type: string; [k: string]: unknown };

export interface RunCompletionConfig {
  model: import('./models-enum').ChatModel | (string & {});
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  [k: string]: unknown;
}

// ─── Run object ──────────────────────────────────────────────────────────────

export interface ResultCounts {
  total: number;
  passed: number;
  failed: number;
  error: number;
}

export interface PerTestingCriteriaResult {
  testing_criteria_index: number;
  result_counts: ResultCounts;
  average_score?: number | null;
}

export type EvalRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface EvalRunObject {
  id: string;
  object: 'eval.run' | (string & {});
  created_at: number;
  status: EvalRunStatus;
  data_source: Record<string, unknown>;
  eval_id: string;
  name?: string | null;
  started_at?: number | null;
  completed_at?: number | null;
  model?: string | null;
  per_model_usage?: unknown;
  per_testing_criteria_results?: PerTestingCriteriaResult[] | null;
  report_url?: string | null;
  result_counts?: Record<string, number> | null;
  shared_with_openai?: boolean | null;
  metadata?: Record<string, unknown> | null;
  error?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface EvalRunCreateParams {
  data_source: RunDataSource | Record<string, unknown>;
  name?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface EvalRunListParams {
  limit?: number;
  after?: string;
  before?: string;
  order?: 'asc' | 'desc';
}

export type EvalRunListResponse = CursorPage<EvalRunObject>;

export interface EvalRunCancelResponse {
  id: string;
  object: 'eval.run' | (string & {});
  status: 'cancelled';
  [key: string]: unknown;
}

export interface EvalRunDeleteResponse {
  run_id: string;
  object?: 'eval.run.deleted' | (string & {});
  deleted?: boolean;
}
