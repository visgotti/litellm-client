// ─────────────────────────────────────────────────────────────────────────────
// Assistants API (deprecated by OpenAI Aug 2026, but still proxied)
// ─────────────────────────────────────────────────────────────────────────────

export interface AssistantTool {
  type: 'code_interpreter' | 'file_search' | 'function' | (string & {});
  function?: { name: string; description?: string; parameters?: Record<string, unknown>; strict?: boolean };
}

export interface AssistantObject {
  id: string;
  object: 'assistant';
  created_at: number;
  name: string | null;
  description: string | null;
  model: string;
  instructions: string | null;
  tools: AssistantTool[];
  metadata: Record<string, unknown>;
  top_p?: number | null;
  temperature?: number | null;
  response_format?: unknown;
  tool_resources?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface AssistantCreateParams {
  model: string;
  name?: string;
  description?: string;
  instructions?: string;
  tools?: AssistantTool[];
  metadata?: Record<string, unknown>;
  top_p?: number | null;
  temperature?: number | null;
  response_format?: unknown;
  tool_resources?: Record<string, unknown>;
}
export type AssistantUpdateParams = Partial<AssistantCreateParams>;

export interface AssistantListParams {
  after?: string;
  before?: string;
  limit?: number;
  order?: 'asc' | 'desc';
}
export interface AssistantListResponse {
  object: 'list';
  data: AssistantObject[];
  first_id?: string | null;
  last_id?: string | null;
  has_more?: boolean;
}
export interface AssistantDeletedResponse {
  id: string;
  object: 'assistant.deleted';
  deleted: boolean;
}

// ─── Threads ─────────────────────────────────────────────────────────────────

export interface ThreadObject {
  id: string;
  object: 'thread';
  created_at: number;
  metadata: Record<string, unknown>;
  tool_resources?: Record<string, unknown> | null;
}
export interface ThreadCreateParams {
  messages?: Array<{ role: 'user' | 'assistant'; content: string; metadata?: Record<string, unknown> }>;
  metadata?: Record<string, unknown>;
  tool_resources?: Record<string, unknown>;
}
export interface ThreadUpdateParams {
  metadata?: Record<string, unknown>;
  tool_resources?: Record<string, unknown>;
}
export interface ThreadDeletedResponse {
  id: string;
  object: 'thread.deleted';
  deleted: boolean;
}

// ─── Messages ────────────────────────────────────────────────────────────────

export interface ThreadMessageObject {
  id: string;
  object: 'thread.message';
  created_at: number;
  thread_id: string;
  role: 'user' | 'assistant';
  content: Array<{ type: 'text'; text: { value: string; annotations?: unknown[] } } | { type: string }>;
  metadata: Record<string, unknown>;
  [key: string]: unknown;
}
export interface ThreadMessageCreateParams {
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
  attachments?: Array<{ file_id: string; tools?: AssistantTool[] }>;
}
export interface ThreadMessageListResponse {
  object: 'list';
  data: ThreadMessageObject[];
  first_id?: string | null;
  last_id?: string | null;
  has_more?: boolean;
}

// ─── Runs ────────────────────────────────────────────────────────────────────

export type RunStatus =
  | 'queued'
  | 'in_progress'
  | 'requires_action'
  | 'cancelling'
  | 'cancelled'
  | 'failed'
  | 'completed'
  | 'expired'
  | 'incomplete'
  | (string & {});

export interface RunObject {
  id: string;
  object: 'thread.run';
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: RunStatus;
  required_action?: unknown;
  last_error?: { code: string; message: string } | null;
  expires_at?: number | null;
  started_at?: number | null;
  cancelled_at?: number | null;
  failed_at?: number | null;
  completed_at?: number | null;
  model: string;
  instructions?: string | null;
  tools?: AssistantTool[];
  metadata: Record<string, unknown>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null;
  [key: string]: unknown;
}

export interface RunCreateParams {
  assistant_id: string;
  model?: string;
  instructions?: string;
  additional_instructions?: string;
  additional_messages?: ThreadMessageCreateParams[];
  tools?: AssistantTool[];
  metadata?: Record<string, unknown>;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  max_prompt_tokens?: number;
  max_completion_tokens?: number;
}
