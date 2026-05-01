import type { ISODateString, PaginationParams } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Team Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A team member entry.
 *
 * @see https://docs.litellm.ai/docs/proxy/teams
 */
export interface TeamMember {
  /** Member role within the team. */
  role: 'admin' | 'user';
  /** User identifier. */
  user_id: string;
  /** Email address of the user. */
  user_email?: string;
}

/**
 * Single budget window entry — multiple concurrent windows allowed via `budget_limits`.
 *
 * @see https://docs.litellm.ai/docs/proxy/teams
 */
export interface BudgetLimitEntry {
  /** Budget reset window (e.g. `'30d'`, `'1mo'`). */
  duration: string;
  /** Spending limit (USD) for this window. */
  max_budget: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Allowed vector-store index reference — used in NewTeamRequest.
 *
 * @see https://docs.litellm.ai/docs/proxy/teams
 */
export interface AllowedVectorStoreIndexItem {
  /** Vector-store index identifier. */
  vector_store_index: string;
  /** Permissions granted on the index. */
  permissions?: Array<'read' | 'write' | (string & {})>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Object permission block — MCP / vector stores etc.
 *
 * @see https://docs.litellm.ai/docs/proxy/teams
 */
export interface ObjectPermissionBase {
  /** MCP server IDs the team may use. */
  mcp_servers?: string[] | null;
  /** MCP access-group names the team may use. */
  mcp_access_groups?: string[] | null;
  /** Vector store IDs the team may access. */
  vector_stores?: string[] | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Rate-limit type qualifier.
 *
 * - `guaranteed_throughput`: Limit is reserved for the team.
 * - `best_effort_throughput`: Limit is shared with other consumers.
 */
export type RpmTpmLimitType = 'guaranteed_throughput' | 'best_effort_throughput';

/**
 * Parameters for `POST /team/new`.
 *
 * @see https://docs.litellm.ai/docs/proxy/teams
 */
export interface TeamCreateParams {
  /** Display alias. */
  team_alias?: string | null;
  /** Caller-supplied team identifier. */
  team_id?: string | null;
  /** Owning organization ID. */
  organization_id?: string | null;
  /** Models the team may access. */
  models?: string[];
  /** Spending limit (USD). */
  max_budget?: number | null;
  /** Soft budget that triggers an alert without rejecting requests. */
  soft_budget?: number | null;
  /** Budget reset window. */
  budget_duration?: string | null;
  /** Optional Budget object ID to attach. */
  budget_id?: string;
  /** Multiple concurrent budget windows. */
  budget_limits?: BudgetLimitEntry[] | null;
  /** Members and their roles. */
  members_with_roles?: TeamMember[];
  /** User IDs to add as admins (legacy convenience). */
  admins?: string[];
  /** User IDs to add as members (legacy convenience). */
  members?: string[];
  /** Permission names granted to all team members. */
  team_member_permissions?: string[] | null;
  /** Free-form metadata. */
  metadata?: Record<string, unknown> | null;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** Type qualifier for `rpm_limit`. */
  rpm_limit_type?: RpmTpmLimitType | null;
  /** Type qualifier for `tpm_limit`. */
  tpm_limit_type?: RpmTpmLimitType | null;
  /** Maximum parallel requests. */
  max_parallel_requests?: number | null;
  /** Block the team on creation. */
  blocked?: boolean;
  /** Tags applied for cost tracking. */
  tags?: string[] | null;
  /** Guardrails to apply to team requests. */
  guardrails?: string[] | null;
  /** Policies to apply to team requests. */
  policies?: string[] | null;
  /** Prompt template IDs available to the team. */
  prompts?: string[] | null;
  /** Model alias map (`{ "gpt-4": "gpt-3.5-turbo" }`). */
  model_aliases?: Record<string, string> | null;
  /** Optional spend limit per model. */
  model_max_budget?: Record<string, number>;
  /** Per-model RPM limit. */
  model_rpm_limit?: Record<string, number> | null;
  /** Per-model TPM limit. */
  model_tpm_limit?: Record<string, number> | null;
  /** Object-permission grants. */
  object_permission?: ObjectPermissionBase | null;
  /** Pass-through routes the team may call. */
  allowed_passthrough_routes?: unknown[] | null;
  /** Secret-manager configuration. */
  secret_manager_settings?: Record<string, unknown> | null;
  /** Router configuration overrides. */
  router_settings?: Record<string, unknown> | null;
  /** Access-group IDs the team belongs to. */
  access_group_ids?: string[] | null;
  /** Default `allowed_models` seeded onto new team members. */
  default_team_member_models?: string[] | null;
  /** Spend cap applied to every team member. */
  team_member_budget?: number | null;
  /** Per-member RPM cap. */
  team_member_rpm_limit?: number | null;
  /** Per-member TPM cap. */
  team_member_tpm_limit?: number | null;
  /** e.g. "1d", "1w", "1m". */
  team_member_key_duration?: string | null;
  /** e.g. "30d", "1mo". */
  team_member_budget_duration?: string | null;
  /** Vector-store indexes the team may use. */
  allowed_vector_store_indexes?: AllowedVectorStoreIndexItem[] | null;
  /** Enforced expiry policy for batch output files. */
  enforced_batch_output_expires_after?: Record<string, unknown> | null;
  /** Enforced expiry policy for uploaded files. */
  enforced_file_expires_after?: Record<string, unknown> | null;
  /** Free-form additional fields forwarded to the proxy. */
  [key: string]: unknown;
}

/**
 * Response from `POST /team/new`.
 *
 * @see https://docs.litellm.ai/docs/proxy/teams
 */
export interface TeamCreateResponse {
  /** Team identifier. */
  team_id: string;
  /** Display alias. */
  team_alias: string | null;
  /** Owning organization ID. */
  organization_id?: string | null;
  /** Models the team may access. */
  models: string[];
  /** Spending limit (USD). */
  max_budget: number | null;
  /** Members and their roles. */
  members_with_roles: TeamMember[];
  /** Free-form metadata. */
  metadata: Record<string, unknown>;
  /** `true` if the team is blocked. */
  blocked?: boolean;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** Cumulative spend (USD). */
  spend?: number;
  /** Budget reset window. */
  budget_duration?: string | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Parameters for `POST /team/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/teams
 */
export interface TeamUpdateParams {
  /** Identifier of the team to update. */
  team_id: string;
  /** New display alias. */
  team_alias?: string | null;
  /** New owning organization ID. */
  organization_id?: string | null;
  /** Replacement metadata. */
  metadata?: Record<string, unknown> | null;
  /** Replacement TPM limit. */
  tpm_limit?: number | null;
  /** Replacement RPM limit. */
  rpm_limit?: number | null;
  /** Replacement spending limit (USD). */
  max_budget?: number | null;
  /** Replacement soft budget. */
  soft_budget?: number | null;
  /** Replacement model allow-list. */
  models?: string[];
  /** Block / unblock the team. */
  blocked?: boolean | null;
  /** Replacement budget reset window. */
  budget_duration?: string | null;
  /** Replacement tags. */
  tags?: string[] | null;
  /** Replacement model aliases. */
  model_aliases?: Record<string, string> | null;
  /** Replacement guardrails. */
  guardrails?: string[] | null;
  /** Replacement policies. */
  policies?: string[] | null;
  /** Replacement prompt template list. */
  prompts?: string[] | null;
  /** Replacement object-permission grants. */
  object_permission?: ObjectPermissionBase | null;
  /** Replacement per-member spend cap. */
  team_member_budget?: number | null;
  /** Replacement per-member budget reset window. */
  team_member_budget_duration?: string | null;
  /** Replacement per-member RPM cap. */
  team_member_rpm_limit?: number | null;
  /** Replacement per-member TPM cap. */
  team_member_tpm_limit?: number | null;
  /** Replacement per-member key duration. */
  team_member_key_duration?: string | null;
  /** Replacement pass-through allow-list. */
  allowed_passthrough_routes?: unknown[] | null;
  /** Replacement secret-manager configuration. */
  secret_manager_settings?: Record<string, unknown> | null;
  /** Replacement per-model RPM limits. */
  model_rpm_limit?: Record<string, number> | null;
  /** Replacement per-model TPM limits. */
  model_tpm_limit?: Record<string, number> | null;
  /** Replacement vector-store index allow-list. */
  allowed_vector_store_indexes?: AllowedVectorStoreIndexItem[] | null;
  /** Replacement batch-output expiry policy. */
  enforced_batch_output_expires_after?: Record<string, unknown> | null;
  /** Replacement file expiry policy. */
  enforced_file_expires_after?: Record<string, unknown> | null;
  /** Replacement router configuration overrides. */
  router_settings?: Record<string, unknown> | null;
  /** Replacement access-group ID list. */
  access_group_ids?: string[] | null;
  /** Replacement budget windows. */
  budget_limits?: BudgetLimitEntry[] | null;
  /** Replacement default member model list. */
  default_team_member_models?: string[] | null;
  /** Local SDK convenience — accepted by the proxy. */
  max_parallel_requests?: number | null;
  /** Local SDK convenience — accepted by the proxy. */
  model_max_budget?: Record<string, number>;
  /** Free-form additional fields forwarded to the proxy. */
  [key: string]: unknown;
}

/**
 * Response from `POST /team/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/teams
 */
export interface TeamUpdateResponse {
  /** Updated team identifier. */
  team_id: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Parameters for `POST /team/delete`. */
export interface TeamDeleteParams {
  /** Team IDs to delete. */
  team_ids: string[];
}

/** Response from `POST /team/delete`. */
export interface TeamDeleteResponse {
  /** IDs of teams that were deleted. */
  deleted_teams?: string[];
  /** Echo of the requested team IDs. */
  team_ids?: string[];
  /** Human-readable status. */
  message?: string;
}

/** Parameters for `GET /team/info`. */
export interface TeamInfoParams {
  /** Team identifier. */
  team_id: string;
}

/**
 * Detailed team info row.
 *
 * @see https://docs.litellm.ai/docs/proxy/teams
 */
export interface TeamInfo {
  /** Team identifier. */
  team_id: string;
  /** Display alias. */
  team_alias: string | null;
  /** Owning organization ID. */
  organization_id?: string | null;
  /** Admin user IDs (legacy). */
  admins?: unknown[];
  /** Member user IDs (legacy). */
  members?: unknown[];
  /** Members and their roles. */
  members_with_roles: TeamMember[];
  /** Permission names granted to all team members. */
  team_member_permissions?: string[] | null;
  /** Free-form metadata. */
  metadata: Record<string, unknown>;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** Spending limit (USD). */
  max_budget: number | null;
  /** Soft budget. */
  soft_budget?: number | null;
  /** Budget reset window. */
  budget_duration?: string | null;
  /** Multiple budget windows. */
  budget_limits?: BudgetLimitEntry[] | null;
  /** Models the team may access. */
  models: string[];
  /** `true` if the team is blocked. */
  blocked: boolean;
  /** Router configuration overrides. */
  router_settings?: Record<string, unknown> | null;
  /** Access-group IDs the team belongs to. */
  access_group_ids?: string[] | null;
  /** Default `allowed_models` seeded onto new team members. */
  default_team_member_models?: string[] | null;
  /** Cumulative spend (USD). */
  spend: number;
  /** Maximum parallel requests. */
  max_parallel_requests?: number | null;
  /** ISO-8601 timestamp of the next budget reset. */
  budget_reset_at?: ISODateString | null;
  /** Foreign key into the model deployment table. */
  model_id?: number | null;
  /** Joined model deployment row. */
  litellm_model_table?: Record<string, unknown> | null;
  /** Object-permission grants. */
  object_permission?: ObjectPermissionBase | null;
  /** Foreign key into the object-permission table. */
  object_permission_id?: string | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString;
  /** Keys owned by the team. */
  keys?: unknown[];
  /** Additional joined team-info row. */
  team_info?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Parameters for `POST /team/member_add`. */
export interface TeamMemberAddParams {
  /** Team to add the member(s) to. */
  team_id: string;
  /** Member or members to add. */
  member: TeamMember | TeamMember[];
  /** Personal spend cap within the team (USD). */
  max_budget_in_team?: number;
}

/** Response from `POST /team/member_add`. */
export interface TeamMemberAddResponse {
  /** Team identifier. */
  team_id: string;
  /** Updated user rows. */
  updated_users?: unknown[];
  /** Updated team-membership rows. */
  updated_team_memberships?: unknown[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Parameters for `POST /team/member_delete`. */
export interface TeamMemberDeleteParams {
  /** Team to remove the member from. */
  team_id: string;
  /** User identifier of the member to remove. */
  user_id?: string;
  /** Email of the member to remove. */
  user_email?: string;
}

/** Parameters for `POST /team/member_update`. */
export interface TeamMemberUpdateParams {
  /** Team identifier. */
  team_id: string;
  /** User identifier of the member to update. */
  user_id?: string;
  /** Email of the member to update. */
  user_email?: string;
  /** New role within the team. */
  role?: 'admin' | 'user';
  /** New personal spend cap (USD). */
  max_budget_in_team?: number;
}

/** Parameters for `POST /team/block`. */
export interface TeamBlockParams {
  /** Team to block. */
  team_id: string;
}
/** Parameters for `POST /team/unblock`. */
export interface TeamUnblockParams {
  /** Team to unblock. */
  team_id: string;
}

/** Query parameters for `GET /team/list`. */
export interface TeamListParams extends PaginationParams {
  /** Filter to teams the given user belongs to. */
  user_id?: string;
  /** Filter to teams in the given organization. */
  organization_id?: string;
}

/** Response from `GET /team/list`. */
export interface TeamListResponse {
  /** Page of teams. */
  teams: TeamInfo[];
  /** Total teams matching the query. */
  total?: number;
  /** Current page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
  /** Total page count. */
  total_pages?: number;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─── Extended team management ────────────────────────────────────────────────

export type TeamListV2Response = TeamListResponse;

/** Response listing teams the calling user can join. */
export interface TeamAvailableResponse {
  /** Teams available to the user. */
  available_teams: TeamInfo[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Parameters for adding multiple members to a team. */
export interface TeamBulkMemberAddParams {
  /** Team to add the members to. */
  team_id: string;
  /** Members to add. */
  members: TeamMember[];
  /** Personal spend cap within the team (USD). */
  max_budget_in_team?: number;
}
export type TeamBulkMemberAddResponse = TeamMemberAddResponse;

/** Parameters for adding models to a team. */
export interface TeamModelAddParams {
  /** Team identifier. */
  team_id: string;
  /** Model names to add. */
  models: string[];
}
export type TeamModelAddResponse = TeamCreateResponse;

/** Parameters for removing models from a team. */
export interface TeamModelDeleteParams {
  /** Team identifier. */
  team_id: string;
  /** Model names to remove. */
  models: string[];
}
export type TeamModelDeleteResponse = TeamCreateResponse;

/** Parameters for `GET /team/permissions_list`. */
export interface TeamPermissionsListParams {
  /** Team identifier. */
  team_id: string;
}
/** A team's permission entry with allowed permission catalogue. */
export interface TeamPermissionEntry {
  /** Team identifier. */
  team_id: string;
  /** Permissions currently granted to team members. */
  team_member_permissions?: string[];
  /** Default permissions for new members. */
  default_team_member_permissions?: string[];
  /** All permissions defined on the proxy. */
  all_available_permissions?: string[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}
export type TeamPermissionsListResponse = TeamPermissionEntry;

/** Parameters for updating a team's member permissions. */
export interface TeamPermissionsUpdateParams {
  /** Team identifier. */
  team_id: string;
  /** Replacement permission list. */
  team_member_permissions: string[];
}
export type TeamPermissionsUpdateResponse = TeamPermissionEntry;

/** Body for bulk-updating team permissions. */
export interface TeamPermissionsBulkUpdateParams {
  /** Per-team permission updates. */
  updates: TeamPermissionsUpdateParams[];
}
/** Response from bulk-updating team permissions. */
export interface TeamPermissionsBulkUpdateResponse {
  /** Successfully updated permission rows. */
  updated?: TeamPermissionEntry[];
  /** Per-team error messages for failures. */
  errors?: Array<{ team_id: string; error: string }>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Query parameters for the team daily-activity endpoint. */
export interface TeamDailyActivityParams {
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date: string;
  /** Filter to a specific team. */
  team_id?: string;
  /** Filter to a specific API key. */
  api_key?: string;
  /** Filter to a specific model. */
  model?: string;
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
}
/** Response from the team daily-activity endpoint. */
export interface TeamDailyActivityResponse {
  /** Per-day / per-team activity rows. */
  results?: unknown[];
  /** Aggregate metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Parameters for adding callbacks to a team. */
export interface TeamCallbackAddParams {
  /** Team identifier. */
  team_id: string;
  /** Success callback names to attach. */
  success_callback?: string[];
  /** Failure callback names to attach. */
  failure_callback?: string[];
  /** Per-callback configuration variables. */
  callback_vars?: Record<string, unknown>;
  /** Free-form additional fields forwarded to the proxy. */
  [key: string]: unknown;
}
/** Response after adding callbacks to a team. */
export interface TeamCallbackResponse {
  /** Team identifier. */
  team_id: string;
  /** Success callbacks now attached. */
  success_callback?: string[];
  /** Failure callbacks now attached. */
  failure_callback?: string[];
  /** Per-callback configuration variables. */
  callback_vars?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Parameters for disabling logging for a team. */
export interface TeamDisableLoggingParams {
  /** Team identifier. */
  team_id: string;
}
/** Response from disabling logging for a team. */
export interface TeamDisableLoggingResponse {
  /** Team identifier. */
  team_id: string;
  /** Human-readable status. */
  message?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

