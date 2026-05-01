// ─────────────────────────────────────────────────────────────────────────────
// Tool Policy Management (cross-provider tool registry)
// Mirrors litellm/proxy/management_endpoints/tool_management_endpoints.py and
// the request/response shapes in litellm/types/tool_management.py.
// ─────────────────────────────────────────────────────────────────────────────

/** Allowed values for `input_policy` on a registered tool. */
export type ToolInputPolicy = 'trusted' | 'untrusted' | 'blocked';

/** Allowed values for `output_policy` on a registered tool. */
export type ToolOutputPolicy = 'trusted' | 'untrusted';

/**
 * One row from the proxy's auto-discovered tool registry.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolTableRow {
  /** Stable internal id of the tool. */
  tool_id: string;
  /** Human-facing tool name (used as the URL slug). */
  tool_name: string;
  /** Origin/provider that registered the tool (e.g. `mcp`, `agent`). */
  origin?: string | null;
  /** Current input policy. */
  input_policy?: ToolInputPolicy;
  /** Current output policy. */
  output_policy?: ToolOutputPolicy;
  /** Total observed invocations across the proxy. */
  call_count?: number;
  /** Per-team / per-key assignment metadata. */
  assignments?: Record<string, unknown> | null;
  /** Hashed key associated with the row, if any. */
  key_hash?: string | null;
  /** Team id associated with the row, if any. */
  team_id?: string | null;
  /** Key alias if available. */
  key_alias?: string | null;
  /** Last seen user agent. */
  user_agent?: string | null;
  /** Last invocation timestamp (ISO-8601). */
  last_used_at?: string | null;
  /** Creation timestamp. */
  created_at?: string | null;
  /** Last-update timestamp. */
  updated_at?: string | null;
  /** User id of the creator. */
  created_by?: string | null;
  /** User id of the last editor. */
  updated_by?: string | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Per-team or per-key policy override for a tool.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolPolicyOverrideRow {
  /** Stable id of the override row. */
  override_id: string;
  /** Tool the override applies to. */
  tool_name: string;
  /** Team scope, if any. */
  team_id?: string | null;
  /** Key scope (hashed), if any. */
  key_hash?: string | null;
  /** Override input policy (typically `blocked`). */
  input_policy?: ToolInputPolicy;
  /** Key alias if available. */
  key_alias?: string | null;
  /** Creation timestamp. */
  created_at?: string | null;
  /** Last-update timestamp. */
  updated_at?: string | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /v1/tool/list`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolListResponse {
  /** Discovered tools. */
  tools: ToolTableRow[];
  /** Total number of rows returned. */
  total: number;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Optional query parameters for `GET /v1/tool/list`. */
export interface ToolListParams {
  /** Filter by current `input_policy`. */
  input_policy?: ToolInputPolicy;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /v1/tool/{tool_name}/detail`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolDetailResponse {
  /** The tool row itself. */
  tool: ToolTableRow;
  /** Per-team/per-key policy overrides. */
  overrides: ToolPolicyOverrideRow[];
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * One descriptor in the policy-options metadata feed.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolPolicyOption {
  /** Stable enum value (e.g. `untrusted`). */
  value: string;
  /** Human-facing label. */
  label: string;
  /** Long description suitable for UI tooltips. */
  description: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /v1/tool/policy/options`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolPolicyOptionsResponse {
  /** Available `input_policy` options. */
  input_policies: ToolPolicyOption[];
  /** Available `output_policy` options. */
  output_policies: ToolPolicyOption[];
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Body for `POST /v1/tool/policy`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolPolicyUpdateParams {
  /** Tool name to update. */
  tool_name: string;
  /** New input policy (optional — provide at least one of input/output). */
  input_policy?: ToolInputPolicy;
  /** New output policy. */
  output_policy?: ToolOutputPolicy;
  /** Apply override to this team only (mutually exclusive with `key_hash`). */
  team_id?: string | null;
  /** Apply override to this key only (mutually exclusive with `team_id`). */
  key_hash?: string | null;
  /** Optional alias for the key (display only). */
  key_alias?: string | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `POST /v1/tool/policy`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolPolicyUpdateResponse {
  /** Tool name that was updated. */
  tool_name: string;
  /** Resulting input policy. */
  input_policy?: ToolInputPolicy;
  /** Resulting output policy. */
  output_policy?: ToolOutputPolicy;
  /** `true` if the policy was changed. */
  updated: boolean;
  /** Team override scope, if applicable. */
  team_id?: string | null;
  /** Key override scope, if applicable. */
  key_hash?: string | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Single row in the tool usage logs feed.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolUsageLogEntry {
  /** Spend log id (request_id). */
  id: string;
  /** Request timestamp (ISO-8601). */
  timestamp: string;
  /** Model that processed the request. */
  model?: string | null;
  /** Spend in USD. */
  spend?: number | null;
  /** Total tokens consumed. */
  total_tokens?: number | null;
  /** Short snippet of the request input (200-char default). */
  input_snippet?: string | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /v1/tool/{tool_name}/logs`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolUsageLogsResponse {
  /** Page of log rows. */
  logs: ToolUsageLogEntry[];
  /** Total rows across all pages. */
  total: number;
  /** Page number returned. */
  page: number;
  /** Page size returned. */
  page_size: number;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Optional query parameters for `GET /v1/tool/{tool_name}/logs`. */
export interface ToolUsageLogsParams {
  /** 1-indexed page number. */
  page?: number;
  /** Page size (1–100, default 50). */
  page_size?: number;
  /** Inclusive lower bound (YYYY-MM-DD). */
  start_date?: string;
  /** Inclusive upper bound (YYYY-MM-DD). */
  end_date?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Optional query parameters for `DELETE /v1/tool/{tool_name}/overrides`. */
export interface ToolOverrideDeleteParams {
  /** Override scope by team id. */
  team_id?: string;
  /** Override scope by hashed key. */
  key_hash?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `DELETE /v1/tool/{tool_name}/overrides`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/tool_management_endpoints.py
 */
export interface ToolOverrideDeleteResponse {
  /** `true` if the override row existed and was removed. */
  deleted: boolean;
  /** Tool the override applied to. */
  tool_name: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}
