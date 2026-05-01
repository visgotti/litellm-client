// ─────────────────────────────────────────────────────────────────────────────
// Assistants API — DEPRECATED.
//
// OpenAI sunsets the Assistants API on **2026-08-26**. The LiteLLM docs page
// at https://docs.litellm.ai/docs/assistants carries a deprecation banner
// directing users to the Responses API. Every interface in this file is
// tagged `@deprecated`; new code should use `client.responses` and the
// types in `src/types/responses.ts` instead.
//
// Kept for back-compat with existing integrations until the upstream endpoint
// stops responding.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A tool an assistant can invoke.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26).
 *   Use the Responses API tool types instead.
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface AssistantTool {
  /** Tool kind. */
  type: 'code_interpreter' | 'file_search' | 'function' | (string & {});
  /** Function definition (only when `type === 'function'`). */
  function?: {
    /** Function name. */
    name: string;
    /** Description shown to the model when deciding whether to call. */
    description?: string;
    /** JSON Schema describing the function arguments. */
    parameters?: Record<string, unknown>;
    /** When `true`, force the model to follow the schema strictly. */
    strict?: boolean;
  };
}

/**
 * An assistant configuration.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface AssistantObject {
  /** Unique identifier. */
  id: string;
  /** Always `'assistant'`. */
  object: 'assistant';
  /** Unix timestamp (seconds) of creation. */
  created_at: number;
  /** Human-readable name. */
  name: string | null;
  /** Description of the assistant. */
  description: string | null;
  /** Model the assistant runs on. */
  model: string;
  /** System-style instructions injected before each run. */
  instructions: string | null;
  /** Tools the assistant can invoke. */
  tools: AssistantTool[];
  /** Free-form metadata. */
  metadata: Record<string, unknown>;
  /** Default nucleus-sampling cutoff. */
  top_p?: number | null;
  /** Default sampling temperature. */
  temperature?: number | null;
  /** Default response format (text / json_object / json_schema). */
  response_format?: unknown;
  /** Resources made available to assistant tools (e.g. file IDs for file_search). */
  tool_resources?: Record<string, unknown> | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Parameters for creating an assistant.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface AssistantCreateParams {
  /** Model the assistant runs on. */
  model: string;
  /** Human-readable name. */
  name?: string;
  /** Description of the assistant. */
  description?: string;
  /** System-style instructions injected before each run. */
  instructions?: string;
  /** Tools the assistant can invoke. */
  tools?: AssistantTool[];
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** Default nucleus-sampling cutoff. */
  top_p?: number | null;
  /** Default sampling temperature. */
  temperature?: number | null;
  /** Default response format. */
  response_format?: unknown;
  /** Resources made available to assistant tools. */
  tool_resources?: Record<string, unknown>;
  /** Override the LiteLLM provider used to dispatch requests. */
  custom_llm_provider?: string;
}
/**
 * Query parameters for listing assistants.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface AssistantListParams {
  /** Cursor — return assistants after this ID. */
  after?: string;
  /** Cursor — return assistants before this ID. */
  before?: string;
  /** Maximum results per page. */
  limit?: number;
  /** Sort order. */
  order?: 'asc' | 'desc';
}
/**
 * Paginated list of assistants.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface AssistantListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Page of assistants. */
  data: AssistantObject[];
  /** ID of the first assistant in the page. */
  first_id?: string | null;
  /** ID of the last assistant in the page. */
  last_id?: string | null;
  /** Whether more assistants exist after this page. */
  has_more?: boolean;
}
/**
 * Response from deleting an assistant.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface AssistantDeletedResponse {
  /** ID of the deleted assistant. */
  id: string;
  /** Always `'assistant.deleted'`. */
  object: 'assistant.deleted';
  /** `true` if the assistant was deleted. */
  deleted: boolean;
}

// ─── Threads ─────────────────────────────────────────────────────────────────

/**
 * A conversation thread.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface ThreadObject {
  /** Unique identifier. */
  id: string;
  /** Always `'thread'`. */
  object: 'thread';
  /** Unix timestamp (seconds) of creation. */
  created_at: number;
  /** Free-form metadata. */
  metadata: Record<string, unknown>;
  /** Resources made available to assistant tools (e.g. file IDs for file_search). */
  tool_resources?: Record<string, unknown> | null;
}
/**
 * Parameters for creating a thread.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface ThreadCreateParams {
  /** Initial set of messages to seed the thread. */
  messages?: Array<{
    /** Author of the message. */
    role: 'user' | 'assistant';
    /** Message content. */
    content: string;
    /** Free-form metadata. */
    metadata?: Record<string, unknown>;
  }>;
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** Resources made available to assistant tools. */
  tool_resources?: Record<string, unknown>;
  /** Override the LiteLLM provider used to dispatch requests. */
  custom_llm_provider?: string;
}
// ─── Messages ────────────────────────────────────────────────────────────────

/**
 * A message stored in a thread.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface ThreadMessageObject {
  /** Unique identifier. */
  id: string;
  /** Always `'thread.message'`. */
  object: 'thread.message';
  /** Unix timestamp (seconds) of creation. */
  created_at: number;
  /** ID of the parent thread. */
  thread_id: string;
  /** Author of the message. */
  role: 'user' | 'assistant';
  /** Content fragments composing the message. */
  content: Array<{ type: 'text'; text: { value: string; annotations?: unknown[] } } | { type: string }>;
  /** Free-form metadata. */
  metadata: Record<string, unknown>;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}
/**
 * Parameters for creating a message in a thread.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface ThreadMessageCreateParams {
  /** Author of the message. */
  role: 'user' | 'assistant';
  /** Message content. */
  content: string;
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** File attachments associated with this message. */
  attachments?: Array<{
    /** ID of the attached file. */
    file_id: string;
    /** Tools that may use the attached file. */
    tools?: AssistantTool[];
  }>;
}
/**
 * Paginated list of thread messages.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface ThreadMessageListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Page of messages. */
  data: ThreadMessageObject[];
  /** ID of the first message in the page. */
  first_id?: string | null;
  /** ID of the last message in the page. */
  last_id?: string | null;
  /** Whether more messages exist after this page. */
  has_more?: boolean;
}

// ─── Runs ────────────────────────────────────────────────────────────────────

/**
 * Lifecycle states an assistant run can be in.
 *
 * - `queued`: Awaiting execution.
 * - `in_progress`: Currently running.
 * - `requires_action`: Paused awaiting tool outputs.
 * - `cancelling`: Cancellation requested but not yet applied.
 * - `cancelled`: Successfully cancelled.
 * - `failed`: Errored before completion.
 * - `completed`: Finished successfully.
 * - `expired`: Exceeded its timeout.
 * - `incomplete`: Stopped early due to limits.
 */
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

/**
 * An assistant run — one execution of an assistant against a thread.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface RunObject {
  /** Unique identifier. */
  id: string;
  /** Always `'thread.run'`. */
  object: 'thread.run';
  /** Unix timestamp (seconds) of creation. */
  created_at: number;
  /** ID of the thread this run executes against. */
  thread_id: string;
  /** ID of the assistant being run. */
  assistant_id: string;
  /** Lifecycle status. */
  status: RunStatus;
  /** Action the caller must take when `status === 'requires_action'`. */
  required_action?: unknown;
  /** Most recent error encountered by the run. */
  last_error?: { code: string; message: string } | null;
  /** Unix timestamp at which the run will expire. */
  expires_at?: number | null;
  /** Unix timestamp when the run started. */
  started_at?: number | null;
  /** Unix timestamp when the run was cancelled. */
  cancelled_at?: number | null;
  /** Unix timestamp when the run failed. */
  failed_at?: number | null;
  /** Unix timestamp when the run completed. */
  completed_at?: number | null;
  /** Model used for this run. */
  model: string;
  /** Instructions used for this run (overrides assistant default). */
  instructions?: string | null;
  /** Tools available to this run. */
  tools?: AssistantTool[];
  /** Free-form metadata. */
  metadata: Record<string, unknown>;
  /** Token usage for the run. */
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Parameters for creating an assistant run.
 *
 * @deprecated The Assistants API is deprecated by OpenAI (sunset 2026-08-26). Migrate to `client.responses` and the types in `./responses`.
 * @see https://docs.litellm.ai/docs/assistants
 */
export interface RunCreateParams {
  /** ID of the assistant to run. */
  assistant_id: string;
  /** Override the assistant's default model. */
  model?: string;
  /** Override the assistant's default instructions. */
  instructions?: string;
  /** Additional instructions appended after `instructions`. */
  additional_instructions?: string;
  /** Additional messages to inject into the thread before the run. */
  additional_messages?: ThreadMessageCreateParams[];
  /** Override the assistant's default tools. */
  tools?: AssistantTool[];
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** Sampling temperature in `[0, 2]`. */
  temperature?: number;
  /** Nucleus-sampling cutoff in `(0, 1]`. */
  top_p?: number;
  /** Stream incremental run events. */
  stream?: boolean;
  /** Maximum prompt tokens for the run. */
  max_prompt_tokens?: number;
  /** Maximum completion tokens for the run. */
  max_completion_tokens?: number;
  /** Override the LiteLLM provider used to dispatch the run. */
  custom_llm_provider?: string;
  /** Constrain which tool the assistant should call. */
  tool_choice?:
    | 'none'
    | 'auto'
    | 'required'
    | { type: 'function'; function: { name: string } }
    | { type: 'file_search' }
    | { type: 'code_interpreter' };
  /** Constrain the response format. */
  response_format?:
    | 'auto'
    | { type: 'text' }
    | { type: 'json_object' }
    | {
        type: 'json_schema';
        json_schema: {
          name: string;
          schema?: Record<string, unknown>;
          description?: string;
          strict?: boolean;
        };
      };
  /** Allow multiple tool calls to execute in parallel. */
  parallel_tool_calls?: boolean;
  /** Strategy for truncating the conversation when context overflows. */
  truncation_strategy?: { type: 'auto' | 'last_messages'; last_messages?: number };
}
