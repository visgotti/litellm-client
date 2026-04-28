import type { AgentCard } from './agents';

// ─────────────────────────────────────────────────────────────────────────────
// A2A Protocol — JSON-RPC 2.0 wrapper for invoking registered agents.
// ─────────────────────────────────────────────────────────────────────────────

/** A2A discovery response — `/a2a/{agent_id}/.well-known/agent-card.json`. */
export type A2AAgentCardResponse = AgentCard;

// ─── JSON-RPC envelope ───────────────────────────────────────────────────────

export type A2AMethod = 'message/send' | 'message/stream' | (string & {});

export interface A2AMessagePart {
  type?: string;
  text?: string;
  data?: unknown;
  mimeType?: string;
  [key: string]: unknown;
}

export interface A2AMessage {
  role?: 'user' | 'agent' | (string & {});
  parts?: A2AMessagePart[];
  messageId?: string;
  contextId?: string;
  taskId?: string;
  [key: string]: unknown;
}

export interface A2AMessageSendParams {
  message: A2AMessage;
  configuration?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface A2AInvokeParams {
  jsonrpc?: '2.0';
  id?: string | number | null;
  method: A2AMethod;
  params: A2AMessageSendParams | Record<string, unknown>;
  /** Extra litellm params hoisted into the top-level body (e.g. guardrails). */
  [key: string]: unknown;
}

/** Convenience payload for `message/send` — wraps the JSON-RPC envelope. */
export interface A2ASendMessageParams {
  jsonrpc?: '2.0';
  id?: string | number | null;
  method?: 'message/send';
  params: A2AMessageSendParams;
  [key: string]: unknown;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export interface A2AJsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface A2AInvokeResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: Record<string, unknown> | null;
  error?: A2AJsonRpcError | null;
  usage?: Record<string, unknown>;
  [key: string]: unknown;
}

export type A2ASendMessageResponse = A2AInvokeResponse;
