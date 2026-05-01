// ─────────────────────────────────────────────────────────────────────────────
// Cursor Cloud Agents pass-through types.
// References:
//   https://docs.cursor.com/en/background-agent/api/overview
//   https://docs.litellm.ai/docs/pass_through/cursor
// ─────────────────────────────────────────────────────────────────────────────

// ─── /cursor/me ──────────────────────────────────────────────────────────────

export interface CursorMeResponse {
  apiKeyName?: string;
  createdAt?: string;
  userEmail?: string;
  [key: string]: unknown;
}

// ─── /cursor/models ──────────────────────────────────────────────────────────

export interface CursorModelsResponse {
  models: string[];
  [key: string]: unknown;
}

// ─── /cursor/repositories ────────────────────────────────────────────────────

export interface CursorRepository {
  owner: string;
  name: string;
  repository: string;
  [key: string]: unknown;
}

export interface CursorRepositoriesResponse {
  repositories: CursorRepository[];
  [key: string]: unknown;
}

// ─── /cursor/agents (list) ───────────────────────────────────────────────────

export interface CursorAgentsListParams {
  cursor?: string;
  limit?: number;
}

export type CursorAgentStatus =
  | 'CREATING'
  | 'RUNNING'
  | 'FINISHED'
  | 'ERROR'
  | 'EXPIRED'
  | (string & {});

export interface CursorAgentSource {
  repository: string;
  ref?: string;
}

export interface CursorAgentTarget {
  branchName?: string;
  url?: string;
  prUrl?: string;
  autoCreatePr?: boolean;
}

export interface CursorAgentSummary {
  id: string;
  name?: string;
  status: CursorAgentStatus;
  source: CursorAgentSource;
  target: CursorAgentTarget;
  summary?: string;
  createdAt: string;
  model?: string;
  [key: string]: unknown;
}

export interface CursorAgentsListResponse {
  agents: CursorAgentSummary[];
  nextCursor?: string;
  [key: string]: unknown;
}

// ─── /cursor/agents (launch) ─────────────────────────────────────────────────

export interface CursorAgentPromptImage {
  data: string;
  dimension?: { width: number; height: number };
}

export interface CursorAgentPrompt {
  text: string;
  images?: CursorAgentPromptImage[];
}

export interface CursorAgentWebhook {
  url: string;
  secret?: string;
}

export interface CursorAgentLaunchParams {
  prompt: CursorAgentPrompt;
  source: CursorAgentSource;
  model?: string;
  target?: { autoCreatePr?: boolean; branchName?: string };
  webhook?: CursorAgentWebhook;
}

export interface CursorAgent extends CursorAgentSummary {
  prompt?: CursorAgentPrompt;
  webhook?: CursorAgentWebhook;
}

// ─── /cursor/agents/{id} ─────────────────────────────────────────────────────

export type CursorAgentRetrieveResponse = CursorAgent;

export interface CursorAgentDeleteResponse {
  id: string;
  [key: string]: unknown;
}

// ─── /cursor/agents/{id}/conversation ────────────────────────────────────────

export interface CursorAgentConversationMessage {
  id?: string;
  type: 'user_message' | 'assistant_message' | 'tool_call' | 'tool_result' | (string & {});
  text?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface CursorAgentConversationResponse {
  id: string;
  messages: CursorAgentConversationMessage[];
  [key: string]: unknown;
}

// ─── /cursor/agents/{id}/followup ────────────────────────────────────────────

export interface CursorAgentFollowupParams {
  prompt: CursorAgentPrompt;
}

export type CursorAgentFollowupResponse = CursorAgent;

// ─── /cursor/agents/{id}/stop ────────────────────────────────────────────────

export type CursorAgentStopResponse = CursorAgent;
