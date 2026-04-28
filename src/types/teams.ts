import type { ISODateString, PaginationParams } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Team Management
// ─────────────────────────────────────────────────────────────────────────────

export interface TeamMember {
  role: 'admin' | 'user';
  user_id: string;
  user_email?: string;
}

export interface TeamCreateParams {
  team_alias?: string;
  team_id?: string;
  organization_id?: string;
  models?: string[];
  max_budget?: number | null;
  budget_duration?: string | null;
  budget_id?: string;
  members_with_roles?: TeamMember[];
  admins?: string[];
  members?: string[];
  metadata?: Record<string, unknown>;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  max_parallel_requests?: number | null;
  blocked?: boolean;
  tags?: string[];
  guardrails?: string[];
  model_aliases?: Record<string, string>;
  /** Optional spend limit per model. */
  model_max_budget?: Record<string, number>;
}

export interface TeamCreateResponse {
  team_id: string;
  team_alias: string | null;
  organization_id?: string | null;
  models: string[];
  max_budget: number | null;
  members_with_roles: TeamMember[];
  metadata: Record<string, unknown>;
  blocked?: boolean;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  spend?: number;
  budget_duration?: string | null;
  created_at?: ISODateString;
  updated_at?: ISODateString;
  [key: string]: unknown;
}

export interface TeamUpdateParams {
  team_id: string;
  team_alias?: string;
  organization_id?: string;
  models?: string[];
  max_budget?: number | null;
  budget_duration?: string | null;
  metadata?: Record<string, unknown>;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  max_parallel_requests?: number | null;
  blocked?: boolean;
  tags?: string[];
  guardrails?: string[];
  model_aliases?: Record<string, string>;
  model_max_budget?: Record<string, number>;
}

export interface TeamUpdateResponse {
  team_id: string;
  [key: string]: unknown;
}

export interface TeamDeleteParams {
  team_ids: string[];
}

export interface TeamDeleteResponse {
  deleted_teams?: string[];
  team_ids?: string[];
  message?: string;
}

export interface TeamInfoParams {
  team_id: string;
}

export interface TeamInfo {
  team_id: string;
  team_alias: string | null;
  organization_id?: string | null;
  models: string[];
  max_budget: number | null;
  spend: number;
  members_with_roles: TeamMember[];
  metadata: Record<string, unknown>;
  blocked: boolean;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  budget_duration?: string | null;
  created_at?: ISODateString;
  updated_at?: ISODateString;
  keys?: unknown[];
  team_info?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TeamMemberAddParams {
  team_id: string;
  member: TeamMember | TeamMember[];
  max_budget_in_team?: number;
}

export interface TeamMemberAddResponse {
  team_id: string;
  updated_users?: unknown[];
  updated_team_memberships?: unknown[];
  [key: string]: unknown;
}

export interface TeamMemberDeleteParams {
  team_id: string;
  user_id?: string;
  user_email?: string;
}

export interface TeamMemberUpdateParams {
  team_id: string;
  user_id?: string;
  user_email?: string;
  role?: 'admin' | 'user';
  max_budget_in_team?: number;
}

export interface TeamBlockParams {
  team_id: string;
}
export interface TeamUnblockParams {
  team_id: string;
}

export interface TeamListParams extends PaginationParams {
  user_id?: string;
  organization_id?: string;
}

export interface TeamListResponse {
  teams: TeamInfo[];
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  [key: string]: unknown;
}

// ─── Extended team management ────────────────────────────────────────────────

export type TeamListV2Response = TeamListResponse;

export interface TeamAvailableResponse {
  available_teams: TeamInfo[];
  [key: string]: unknown;
}

export interface TeamBulkMemberAddParams {
  team_id: string;
  members: TeamMember[];
  max_budget_in_team?: number;
}
export type TeamBulkMemberAddResponse = TeamMemberAddResponse;

export interface TeamModelAddParams {
  team_id: string;
  models: string[];
}
export type TeamModelAddResponse = TeamCreateResponse;

export interface TeamModelDeleteParams {
  team_id: string;
  models: string[];
}
export type TeamModelDeleteResponse = TeamCreateResponse;

export interface TeamPermissionsListParams {
  team_id: string;
}
export interface TeamPermissionEntry {
  team_id: string;
  team_member_permissions?: string[];
  default_team_member_permissions?: string[];
  all_available_permissions?: string[];
  [key: string]: unknown;
}
export type TeamPermissionsListResponse = TeamPermissionEntry;

export interface TeamPermissionsUpdateParams {
  team_id: string;
  team_member_permissions: string[];
}
export type TeamPermissionsUpdateResponse = TeamPermissionEntry;

export interface TeamPermissionsBulkUpdateParams {
  updates: TeamPermissionsUpdateParams[];
}
export interface TeamPermissionsBulkUpdateResponse {
  updated?: TeamPermissionEntry[];
  errors?: Array<{ team_id: string; error: string }>;
  [key: string]: unknown;
}

export interface TeamDailyActivityParams {
  start_date: string;
  end_date: string;
  team_id?: string;
  api_key?: string;
  model?: string;
  page?: number;
  page_size?: number;
}
export interface TeamDailyActivityResponse {
  results?: unknown[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TeamCallbackAddParams {
  team_id: string;
  success_callback?: string[];
  failure_callback?: string[];
  callback_vars?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface TeamCallbackResponse {
  team_id: string;
  success_callback?: string[];
  failure_callback?: string[];
  callback_vars?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TeamDisableLoggingParams {
  team_id: string;
}
export interface TeamDisableLoggingResponse {
  team_id: string;
  message?: string;
  [key: string]: unknown;
}

export interface TeamMembershipMeResponse {
  team_id: string;
  user_id?: string;
  role?: 'admin' | 'user' | (string & {});
  max_budget_in_team?: number | null;
  spend?: number;
  [key: string]: unknown;
}
