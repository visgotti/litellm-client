// ─────────────────────────────────────────────────────────────────────────────
// Unified access groups — `/v1/unified_access_group`
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Body for `POST /v1/unified_access_group`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/unified_access_group.py
 */
export interface UnifiedAccessGroupCreateParams {
  /** Caller-supplied access-group name (used as the identifier). */
  access_group_name: string;
  /** Optional list of model names included in the group. */
  models?: string[] | null;
  /** Optional list of MCP server ids included in the group. */
  mcp_servers?: string[] | null;
  /** Optional list of vector-store ids included in the group. */
  vector_stores?: string[] | null;
  /** Optional human-readable description. */
  description?: string | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Body for `PUT /v1/unified_access_group/{access_group_id}`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/unified_access_group.py
 */
export interface UnifiedAccessGroupUpdateParams {
  models?: string[] | null;
  mcp_servers?: string[] | null;
  vector_stores?: string[] | null;
  description?: string | null;
  [key: string]: unknown;
}

/**
 * Query parameters for `GET /v1/unified_access_group`.
 */
export interface UnifiedAccessGroupListParams {
  /** Filter to a single group by name. */
  access_group_name?: string;
  [key: string]: unknown;
}

/**
 * A unified access-group record.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/unified_access_group.py
 */
export interface UnifiedAccessGroup {
  access_group_name: string;
  models?: string[];
  mcp_servers?: string[];
  vector_stores?: string[];
  description?: string | null;
  [key: string]: unknown;
}

export type UnifiedAccessGroupListResponse = UnifiedAccessGroup[];
