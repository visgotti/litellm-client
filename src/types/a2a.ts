import type { AgentCard } from './agents';

// ─────────────────────────────────────────────────────────────────────────────
// A2A Protocol — JSON-RPC 2.0 wrapper for invoking registered agents.
// ─────────────────────────────────────────────────────────────────────────────

/** A2A discovery response — `/a2a/{agent_id}/.well-known/agent-card.json`. */
export type A2AAgentCardResponse = AgentCard;

// ─── JSON-RPC envelope ───────────────────────────────────────────────────────

/**
 * JSON-RPC method names supported by the A2A protocol.
 *
 * - `message/send`: Send a message and wait for the task to complete.
 * - `message/stream`: Send a message and receive incremental task updates as SSE.
 */
export type A2AMethod = 'message/send' | 'message/stream' | (string & {});

/**
 * One content fragment of an A2A message.
 *
 * @see https://docs.litellm.ai/docs/a2a
 */
export interface A2AMessagePart {
  /** JSON-RPC discriminator for content type (e.g. `text`, `data`, `file`). */
  kind: string;
  /** Text content when `kind === 'text'`. */
  text?: string;
  /** Structured payload when `kind === 'data'`. */
  data?: unknown;
  /** MIME type when `kind === 'file'`. */
  mimeType?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * An A2A message sent into a task.
 *
 * @see https://docs.litellm.ai/docs/a2a
 */
export interface A2AMessage {
  /** Author of the message. */
  role: 'user' | 'agent' | (string & {});
  /** Content fragments composing the message. */
  parts: A2AMessagePart[];
  /** Caller-supplied identifier for correlating message turns. */
  messageId: string;
  /** Conversation / task context the message belongs to. */
  contextId?: string;
  /** ID of the task this message is appended to. */
  taskId?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Params object for the `message/send` and `message/stream` JSON-RPC methods.
 *
 * @see https://docs.litellm.ai/docs/a2a
 */
export interface A2AMessageSendParams {
  /** Message to dispatch to the agent. */
  message: A2AMessage;
  /** Optional configuration block forwarded to the agent. */
  configuration?: Record<string, unknown>;
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * JSON-RPC 2.0 envelope for invoking an A2A agent.
 *
 * @see https://docs.litellm.ai/docs/a2a
 */
export interface A2AInvokeParams {
  /** JSON-RPC version literal — must be `'2.0'`. */
  jsonrpc: '2.0';
  /** Caller-supplied request ID. */
  id: string | number | null;
  /** JSON-RPC method to invoke. */
  method: A2AMethod;
  /** Method-specific parameters. */
  params: A2AMessageSendParams | Record<string, unknown>;
  /** Extra litellm params hoisted into the top-level body (e.g. guardrails). */
  [key: string]: unknown;
}

/**
 * Convenience payload for `message/send` — wraps the JSON-RPC envelope.
 *
 * @see https://docs.litellm.ai/docs/a2a
 */
export interface A2ASendMessageParams {
  /** JSON-RPC version literal — must be `'2.0'`. */
  jsonrpc: '2.0';
  /** Caller-supplied request ID. */
  id: string | number | null;
  /** Always `'message/send'`. */
  method: 'message/send';
  /** Message-send parameters. */
  params: A2AMessageSendParams;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─── Responses ───────────────────────────────────────────────────────────────

/**
 * JSON-RPC error object returned in `error` on failure.
 *
 * @see https://docs.litellm.ai/docs/a2a
 */
export interface A2AJsonRpcError {
  /** Numeric JSON-RPC error code. */
  code: number;
  /** Human-readable error message. */
  message: string;
  /** Structured error data (provider-specific). */
  data?: unknown;
}

/**
 * Typed payload returned in `result` for an A2A task response.
 *
 * @see https://docs.litellm.ai/docs/a2a
 */
export interface A2ATaskResult {
  /** Discriminator (`'task'`). */
  kind?: 'task' | (string & {});
  /** Task identifier. */
  id?: string;
  /** Conversation context the task belongs to. */
  contextId?: string;
  /** Current task status. */
  status?: {
    /** Lifecycle state of the task. */
    state?:
      | 'pending'
      | 'in_progress'
      | 'completed'
      | 'failed'
      | 'cancelled'
      | (string & {});
    /** ISO-8601 timestamp the status was last updated. */
    timestamp?: string;
  };
  /** Artifacts produced by the task (e.g. assistant messages). */
  artifacts?: Array<{
    /** Identifier of the artifact. */
    artifactId?: string;
    /** Display name of the artifact. */
    name?: string;
    /** Content fragments composing the artifact. */
    parts?: A2AMessagePart[];
    /** Free-form additional fields. */
    [key: string]: unknown;
  }>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * JSON-RPC 2.0 response from an A2A invocation.
 *
 * @see https://docs.litellm.ai/docs/a2a
 */
export interface A2AInvokeResponse {
  /** JSON-RPC version literal. */
  jsonrpc: '2.0';
  /** Echo of the request `id`. */
  id: string | number | null;
  /** Result payload on success. */
  result?: A2ATaskResult | null;
  /** Error payload on failure. */
  error?: A2AJsonRpcError | null;
  /** Provider-specific usage / billing block. */
  usage?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

export type A2ASendMessageResponse = A2AInvokeResponse;
