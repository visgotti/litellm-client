// ─────────────────────────────────────────────────────────────────────────────
// Langfuse pass-through types.
// References:
//   https://api.reference.langfuse.com/
// ─────────────────────────────────────────────────────────────────────────────

// ─── Common ──────────────────────────────────────────────────────────────────

export interface LangfusePagination {
  page?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export type LangfuseObservationLevel =
  | 'DEBUG'
  | 'DEFAULT'
  | 'WARNING'
  | 'ERROR'
  | (string & {});

export type LangfuseObservationType =
  | 'GENERATION'
  | 'SPAN'
  | 'EVENT'
  | (string & {});

// ─── Traces ──────────────────────────────────────────────────────────────────

export interface LangfuseTracesListParams {
  page?: number;
  limit?: number;
  userId?: string;
  name?: string;
  sessionId?: string;
  fromTimestamp?: string;
  toTimestamp?: string;
  orderBy?: string;
  tags?: string | string[];
  version?: string;
  release?: string;
  environment?: string | string[];
  fields?: string;
  [key: string]: unknown;
}

export interface LangfuseTrace {
  id: string;
  timestamp: string;
  name?: string | null;
  input?: unknown;
  output?: unknown;
  sessionId?: string | null;
  release?: string | null;
  version?: string | null;
  userId?: string | null;
  metadata?: unknown;
  tags?: string[] | null;
  public?: boolean | null;
  environment?: string | null;
  htmlPath?: string;
  latency?: number | null;
  totalCost?: number | null;
  observations?: string[];
  scores?: string[];
  [key: string]: unknown;
}

export interface LangfuseTracesListResponse {
  data: LangfuseTrace[];
  meta: LangfusePagination;
  [key: string]: unknown;
}

// ─── Observations ────────────────────────────────────────────────────────────

export interface LangfuseObservationsListParams {
  page?: number;
  limit?: number;
  name?: string;
  userId?: string;
  type?: LangfuseObservationType;
  traceId?: string;
  parentObservationId?: string;
  environment?: string | string[];
  fromStartTime?: string;
  toStartTime?: string;
  version?: string;
  [key: string]: unknown;
}

export interface LangfuseObservation {
  id: string;
  traceId?: string | null;
  type: LangfuseObservationType;
  name?: string | null;
  startTime: string;
  endTime?: string | null;
  completionStartTime?: string | null;
  model?: string | null;
  modelParameters?: Record<string, unknown> | null;
  input?: unknown;
  version?: string | null;
  metadata?: unknown;
  output?: unknown;
  usage?: Record<string, unknown> | null;
  level?: LangfuseObservationLevel;
  statusMessage?: string | null;
  parentObservationId?: string | null;
  promptId?: string | null;
  environment?: string | null;
  [key: string]: unknown;
}

export interface LangfuseObservationsListResponse {
  data: LangfuseObservation[];
  meta: LangfusePagination;
  [key: string]: unknown;
}

// ─── Spans (ingestion) ───────────────────────────────────────────────────────

export interface LangfuseSpanCreateParams {
  id?: string;
  traceId?: string;
  name?: string;
  startTime?: string;
  endTime?: string;
  metadata?: unknown;
  input?: unknown;
  output?: unknown;
  level?: LangfuseObservationLevel;
  statusMessage?: string;
  parentObservationId?: string;
  version?: string;
  environment?: string;
  [key: string]: unknown;
}

export type LangfuseSpan = LangfuseObservation;

// ─── Scores ──────────────────────────────────────────────────────────────────

export type LangfuseScoreDataType =
  | 'NUMERIC'
  | 'CATEGORICAL'
  | 'BOOLEAN'
  | (string & {});

export interface LangfuseScoreCreateParams {
  id?: string;
  traceId?: string;
  observationId?: string;
  sessionId?: string;
  name: string;
  value: number | string | boolean;
  comment?: string;
  dataType?: LangfuseScoreDataType;
  configId?: string;
  environment?: string;
  [key: string]: unknown;
}

export interface LangfuseScore {
  id: string;
  name: string;
  value: number | string | boolean;
  source?: string;
  observationId?: string | null;
  traceId?: string | null;
  sessionId?: string | null;
  comment?: string | null;
  dataType?: LangfuseScoreDataType;
  configId?: string | null;
  environment?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface LangfuseScoresListParams {
  page?: number;
  limit?: number;
  userId?: string;
  name?: string;
  fromTimestamp?: string;
  toTimestamp?: string;
  source?: string;
  operator?: string;
  value?: number | string;
  scoreIds?: string;
  configId?: string;
  queueId?: string;
  dataType?: LangfuseScoreDataType;
  traceTags?: string | string[];
  environment?: string | string[];
  [key: string]: unknown;
}

export interface LangfuseScoresListResponse {
  data: LangfuseScore[];
  meta: LangfusePagination;
  [key: string]: unknown;
}

// ─── Datasets ────────────────────────────────────────────────────────────────

export interface LangfuseDataset {
  id: string;
  name: string;
  description?: string | null;
  metadata?: unknown;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface LangfuseDatasetsListResponse {
  data: LangfuseDataset[];
  meta: LangfusePagination;
  [key: string]: unknown;
}

export interface LangfuseDatasetCreateParams {
  name: string;
  description?: string;
  metadata?: unknown;
  [key: string]: unknown;
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

export type LangfusePromptType = 'text' | 'chat' | (string & {});

export interface LangfusePromptListItem {
  name: string;
  versions?: number[];
  labels?: string[];
  tags?: string[];
  lastUpdatedAt?: string;
  lastConfig?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LangfusePromptsListResponse {
  data: LangfusePromptListItem[];
  meta: LangfusePagination;
  [key: string]: unknown;
}

export interface LangfusePrompt {
  id?: string;
  name: string;
  version: number;
  type: LangfusePromptType;
  prompt: string | Array<{ role: string; content: string }>;
  config?: Record<string, unknown>;
  labels?: string[];
  tags?: string[];
  commitMessage?: string | null;
  resolutionGraph?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface LangfusePromptCreateParams {
  name: string;
  type?: LangfusePromptType;
  prompt: string | Array<{ role: string; content: string }>;
  config?: Record<string, unknown>;
  labels?: string[];
  tags?: string[];
  commitMessage?: string;
  [key: string]: unknown;
}
