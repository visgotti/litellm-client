import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Organization Management
// ─────────────────────────────────────────────────────────────────────────────

/** Roles that may be assigned to a user within an organization. */
export type OrganizationMemberRole =
  | 'org_admin'
  | 'internal_user'
  | 'internal_user_viewer'
  | (string & {});

export interface OrgMember {
  /** Either user_id or user_email must be provided. */
  user_id?: string;
  user_email?: string;
  role: OrganizationMemberRole;
}

export interface ObjectPermissionBase {
  mcp_servers?: string[];
  mcp_access_groups?: string[];
  mcp_tool_permissions?: Record<string, string[]>;
  mcp_toolsets?: string[];
  blocked_tools?: string[];
  vector_stores?: string[];
  agents?: string[];
  agent_access_groups?: string[];
  models?: string[];
}

export interface OrganizationCreateParams {
  organization_alias: string;
  organization_id?: string;
  models?: string[];
  budget_id?: string;
  /** Budget fields used when no budget_id is supplied. */
  max_budget?: number | null;
  soft_budget?: number | null;
  max_parallel_requests?: number | null;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  model_max_budget?: Record<string, number>;
  budget_duration?: string | null;
  metadata?: Record<string, unknown>;
  model_rpm_limit?: Record<string, number>;
  model_tpm_limit?: Record<string, number>;
  blocked?: boolean;
  tags?: string[];
  model_aliases?: Record<string, string>;
  allowed_models?: string[];
  object_permission?: ObjectPermissionBase;
}

export interface OrganizationObject {
  organization_id: string;
  organization_alias: string | null;
  budget_id: string;
  spend?: number;
  metadata?: Record<string, unknown> | null;
  models: string[];
  created_by: string;
  updated_by: string;
  litellm_budget_table?: Record<string, unknown> | null;
  object_permission?: Record<string, unknown> | null;
  object_permission_id?: string | null;
  created_at?: ISODateString;
  updated_at?: ISODateString;
  [key: string]: unknown;
}

export interface OrganizationMembershipObject {
  user_id: string;
  organization_id: string;
  user_role?: string | null;
  spend?: number;
  budget_id?: string | null;
  user_email?: string | null;
  user?: Record<string, unknown> | null;
  litellm_budget_table?: Record<string, unknown> | null;
  created_at?: ISODateString;
  updated_at?: ISODateString;
  [key: string]: unknown;
}

export interface OrganizationWithMembers extends OrganizationObject {
  members: OrganizationMembershipObject[];
  teams: Record<string, unknown>[];
}

export type OrganizationCreateResponse = OrganizationObject;

export interface OrganizationUpdateParams {
  organization_id: string;
  organization_alias?: string;
  budget_id?: string;
  spend?: number;
  metadata?: Record<string, unknown>;
  models?: string[];
  updated_by?: string;
  object_permission?: ObjectPermissionBase;
  model_tpm_limit?: Record<string, number>;
  model_rpm_limit?: Record<string, number>;
  /** Budget fields are merged into the linked budget row when present. */
  max_budget?: number | null;
  soft_budget?: number | null;
  max_parallel_requests?: number | null;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  model_max_budget?: Record<string, number>;
  budget_duration?: string | null;
}
export type OrganizationUpdateResponse = OrganizationWithMembers;

export interface OrganizationDeleteParams {
  organization_ids: string[];
}
export type OrganizationDeleteResponse = OrganizationWithMembers[];

export interface OrganizationListParams {
  /** Exact organization_id match. */
  org_id?: string;
  /** Case-insensitive partial alias match. */
  org_alias?: string;
}
export type OrganizationListResponse = OrganizationWithMembers[];

export type OrganizationInfoResponse = OrganizationWithMembers;

export interface OrganizationInfoLegacyParams {
  organizations: string[];
}
export type OrganizationInfoLegacyResponse = OrganizationObject[];

export interface OrganizationMemberAddParams {
  organization_id: string;
  member: OrgMember | OrgMember[];
  max_budget_in_organization?: number | null;
}

export interface OrganizationMemberAddResponse {
  organization_id: string;
  updated_users: Record<string, unknown>[];
  updated_organization_memberships: OrganizationMembershipObject[];
}

export interface OrganizationMemberUpdateParams {
  organization_id: string;
  user_id?: string;
  user_email?: string;
  role?: OrganizationMemberRole;
  max_budget_in_organization?: number | null;
}
export type OrganizationMemberUpdateResponse = OrganizationMembershipObject;

export interface OrganizationMemberDeleteParams {
  organization_id: string;
  user_id?: string;
  user_email?: string;
}
export type OrganizationMemberDeleteResponse = OrganizationMembershipObject;

export interface OrganizationDailyActivityParams {
  /** Comma-separated list of organization_ids. */
  organization_ids?: string;
  start_date?: string;
  end_date?: string;
  model?: string;
  api_key?: string;
  page?: number;
  page_size?: number;
  exclude_organization_ids?: string;
}

export interface OrganizationDailyActivityResponse {
  results?: unknown[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}
