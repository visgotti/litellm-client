// ─────────────────────────────────────────────────────────────────────────────
// Access Group Management
// Mirrors two LiteLLM routers:
//   - litellm/proxy/management_endpoints/access_group_endpoints.py
//     (top-level /v1/access_group CRUD + AccessGroupCreateRequest /
//     AccessGroupUpdateRequest / AccessGroupResponse in
//     litellm/types/access_group.py)
//   - litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
//     (model-scoped /access_group/{new,list,…} + NewModelGroupRequest /
//     NewModelGroupResponse / AccessGroupInfo /
//     ListAccessGroupsResponse / DeleteModelGroupResponse /
//     UpdateModelGroupRequest in
//     litellm/types/proxy/management_endpoints/model_management_endpoints.py)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Top-level access groups (/v1/access_group) ─────────────────────────────

/**
 * Body for `POST /v1/access_group`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/access_group_endpoints.py
 */
export interface AccessGroupCreateParams {
  /** Human-readable group name. */
  access_group_name: string;
  /** Optional description. */
  description?: string | null;
  /** Models the group grants access to. */
  access_model_names?: string[] | null;
  /** MCP server ids the group grants access to. */
  access_mcp_server_ids?: string[] | null;
  /** Agent ids the group grants access to. */
  access_agent_ids?: string[] | null;
  /** Teams to assign to the new group. */
  assigned_team_ids?: string[] | null;
  /** Keys to assign to the new group. */
  assigned_key_ids?: string[] | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Body for `PUT /v1/access_group/{access_group_id}`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/access_group_endpoints.py
 */
export interface AccessGroupUpdateParams {
  /** Replacement group name. */
  access_group_name?: string;
  /** Replacement description. */
  description?: string | null;
  /** Replacement model list. */
  access_model_names?: string[] | null;
  /** Replacement MCP server id list. */
  access_mcp_server_ids?: string[] | null;
  /** Replacement agent id list. */
  access_agent_ids?: string[] | null;
  /** Replacement team assignment list. */
  assigned_team_ids?: string[] | null;
  /** Replacement key assignment list. */
  assigned_key_ids?: string[] | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for the top-level access-group endpoints.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/access_group_endpoints.py
 */
export interface AccessGroupResponse {
  /** Stable id of the access group. */
  access_group_id: string;
  /** Group name. */
  access_group_name: string;
  /** Description, if any. */
  description?: string | null;
  /** Models the group grants access to. */
  access_model_names: string[];
  /** MCP server ids the group grants access to. */
  access_mcp_server_ids: string[];
  /** Agent ids the group grants access to. */
  access_agent_ids: string[];
  /** Teams currently assigned to the group. */
  assigned_team_ids: string[];
  /** Keys currently assigned to the group. */
  assigned_key_ids: string[];
  /** Creation timestamp. */
  created_at: string;
  /** User id of the creator. */
  created_by?: string | null;
  /** Last-update timestamp. */
  updated_at: string;
  /** User id of the last editor. */
  updated_by?: string | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

// ─── Model access groups (/access_group/...) ────────────────────────────────

/**
 * Body for `POST /access_group/new`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
 */
export interface ModelAccessGroupCreateParams {
  /** Access group name (e.g. `production-models`). */
  access_group: string;
  /** Existing model groups to include — tags ALL deployments for each name. */
  model_names?: string[];
  /** Specific deployment ids to tag (more precise than `model_names`). */
  model_ids?: string[];
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Body for `PUT /access_group/{access_group}/update`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
 */
export interface ModelAccessGroupUpdateParams {
  /** Updated list of model groups to include. */
  model_names?: string[];
  /** Specific deployment ids to tag. */
  model_ids?: string[];
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `POST /access_group/new` and
 * `PUT /access_group/{access_group}/update`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
 */
export interface ModelAccessGroupMutationResponse {
  /** Access group name. */
  access_group: string;
  /** Resulting model name list (echoed). */
  model_names?: string[] | null;
  /** Resulting deployment id list (echoed). */
  model_ids?: string[] | null;
  /** Number of deployments updated. */
  models_updated: number;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Per-group entry in the model-access-group list response.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
 */
export interface ModelAccessGroupInfo {
  /** Group name. */
  access_group: string;
  /** Models in the group. */
  model_names: string[];
  /** Total deployments tagged with the group. */
  deployment_count: number;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /access_group/list`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
 */
export interface ModelAccessGroupListResponse {
  /** Group entries. */
  access_groups: ModelAccessGroupInfo[];
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `DELETE /access_group/{access_group}/delete`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/model_access_group_management_endpoints.py
 */
export interface ModelAccessGroupDeleteResponse {
  /** The group that was deleted. */
  access_group: string;
  /** Number of deployments where the group tag was removed. */
  models_updated: number;
  /** Human-readable status. */
  message: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}
