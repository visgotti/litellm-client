import type { ISODateString, ObjectPermissionBase } from './common';

// Re-export for backwards compatibility — `ObjectPermissionBase` is now
// canonically defined in `./common` so it can be reused by other resources
// (customers, teams, keys, etc.) without circular imports.
export type { ObjectPermissionBase } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Organization Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Roles that may be assigned to a user within an organization.
 *
 * - `org_admin`: Full administrative access to the organization.
 * - `internal_user`: Standard organization member.
 * - `internal_user_viewer`: Read-only organization member.
 */
export type OrganizationMemberRole =
  | 'org_admin'
  | 'internal_user'
  | 'internal_user_viewer'
  | (string & {});

/**
 * A member entry passed to organization member-management endpoints.
 *
 * @see https://docs.litellm.ai/docs/proxy/organizations
 */
export interface OrgMember {
  /** Either user_id or user_email must be provided. */
  user_id?: string;
  /** Email address of the user. */
  user_email?: string;
  /** Role to assign within the organization. */
  role: OrganizationMemberRole;
}

/**
 * Parameters for `POST /organization/new`.
 *
 * @see https://docs.litellm.ai/docs/proxy/organizations
 */
export interface OrganizationCreateParams {
  /** Display alias. */
  organization_alias: string;
  /** Caller-supplied organization identifier. */
  organization_id?: string;
  /** Models the organization may access. */
  models?: string[];
  /** Optional Budget object ID to attach. */
  budget_id?: string;
  /** Budget fields used when no budget_id is supplied. */
  max_budget?: number | null;
  /** Soft budget that triggers an alert without rejecting requests. */
  soft_budget?: number | null;
  /** Maximum parallel requests. */
  max_parallel_requests?: number | null;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** Per-model spend limit. */
  model_max_budget?: Record<string, number>;
  /** Budget reset window. */
  budget_duration?: string | null;
  /** Free-form metadata. */
  metadata?: Record<string, unknown>;
  /** Per-model RPM limit. */
  model_rpm_limit?: Record<string, number>;
  /** Per-model TPM limit. */
  model_tpm_limit?: Record<string, number>;
  /** Block the organization on creation. */
  blocked?: boolean;
  /** Tags applied for cost tracking. */
  tags?: string[];
  /** Model alias map (`{ "gpt-4": "gpt-3.5-turbo" }`). */
  model_aliases?: Record<string, string>;
  /** Allowed models (alternative to `models`). */
  allowed_models?: string[];
  /** Object-permission grants. */
  object_permission?: ObjectPermissionBase;
}

/**
 * An organization record.
 *
 * @see https://docs.litellm.ai/docs/proxy/organizations
 */
export interface OrganizationObject {
  /**
   * Always populated on responses (server-managed). The Pydantic base allows
   * `Optional[str]` because the field is also reused for incoming write models.
   */
  organization_id: string;
  /** Display alias. */
  organization_alias: string | null;
  /** Linked Budget object identifier. */
  budget_id: string;
  /** Cumulative spend (USD). */
  spend: number;
  /** Free-form metadata. */
  metadata?: Record<string, unknown> | null;
  /** Models the organization may access. */
  models: string[];
  /** Identifier of the user that created the organization. */
  created_by: string;
  /** Identifier of the user that last updated the organization. */
  updated_by: string;
  /** Users belonging to the organization (LiteLLM_OrganizationTable). */
  users?: Record<string, unknown>[] | null;
  /** Joined budget row. */
  litellm_budget_table?: Record<string, unknown> | null;
  /** Object-permission grants. */
  object_permission?: Record<string, unknown> | null;
  /** Foreign key into the object-permission table. */
  object_permission_id?: string | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Membership row linking a user to an organization.
 *
 * @see https://docs.litellm.ai/docs/proxy/organizations
 */
export interface OrganizationMembershipObject {
  /** User identifier. */
  user_id: string;
  /** Organization identifier. */
  organization_id: string;
  /** Role within the organization. */
  user_role?: string | null;
  /** Cumulative spend (USD) by this user on the organization. */
  spend?: number;
  /** Linked Budget object identifier. */
  budget_id?: string | null;
  /** User email address. */
  user_email?: string | null;
  /** Joined user row. */
  user?: Record<string, unknown> | null;
  /** Joined budget row. */
  litellm_budget_table?: Record<string, unknown> | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Organization with embedded membership and team lists.
 *
 * @see https://docs.litellm.ai/docs/proxy/organizations
 */
export interface OrganizationWithMembers extends OrganizationObject {
  /** Organization members. */
  members: OrganizationMembershipObject[];
  /** Teams belonging to the organization. */
  teams: Record<string, unknown>[];
}

export type OrganizationCreateResponse = OrganizationObject;

/**
 * Parameters for `POST /organization/update`.
 *
 * @see https://docs.litellm.ai/docs/proxy/organizations
 */
export interface OrganizationUpdateParams {
  /** Identifier of the organization to update. */
  organization_id: string;
  /** New display alias. */
  organization_alias?: string;
  /** New linked Budget object ID. */
  budget_id?: string;
  /** Replacement cumulative spend value. */
  spend?: number;
  /** Replacement metadata. */
  metadata?: Record<string, unknown>;
  /** Replacement model allow-list. */
  models?: string[];
  /** Identifier of the updating user. */
  updated_by?: string;
  /** Replacement object-permission grants. */
  object_permission?: ObjectPermissionBase;
  /** Replacement per-model TPM limits. */
  model_tpm_limit?: Record<string, number>;
  /** Replacement per-model RPM limits. */
  model_rpm_limit?: Record<string, number>;
  /** Budget fields are merged into the linked budget row when present. */
  max_budget?: number | null;
  /** Soft budget that triggers an alert without rejecting requests. */
  soft_budget?: number | null;
  /** Replacement max parallel requests. */
  max_parallel_requests?: number | null;
  /** Replacement TPM limit. */
  tpm_limit?: number | null;
  /** Replacement RPM limit. */
  rpm_limit?: number | null;
  /** Replacement per-model spend limit. */
  model_max_budget?: Record<string, number>;
  /** Replacement budget reset window. */
  budget_duration?: string | null;
}
export type OrganizationUpdateResponse = OrganizationWithMembers;

/** Body for `POST /organization/delete`. */
export interface OrganizationDeleteParams {
  /** Organization IDs to delete. */
  organization_ids: string[];
}
export type OrganizationDeleteResponse = OrganizationWithMembers[];

/**
 * Query parameters for `GET /organization/list`.
 *
 * @see https://docs.litellm.ai/docs/proxy/organizations
 */
export interface OrganizationListParams {
  /** Exact organization_id match. */
  org_id?: string;
  /** Case-insensitive partial alias match. */
  org_alias?: string;
}
export type OrganizationListResponse = OrganizationWithMembers[];

export type OrganizationInfoResponse = OrganizationWithMembers;

/** Body for the legacy `POST /organization/info` endpoint. */
export interface OrganizationInfoLegacyParams {
  /** Organization IDs to look up. */
  organizations: string[];
}
export type OrganizationInfoLegacyResponse = OrganizationObject[];

/**
 * Body for `POST /organization/member_add`.
 *
 * @see https://docs.litellm.ai/docs/proxy/organizations
 */
export interface OrganizationMemberAddParams {
  /** Organization to add the member(s) to. */
  organization_id: string;
  /** Member or members to add. */
  member: OrgMember | OrgMember[];
  /** Personal spend cap within the organization (USD). */
  max_budget_in_organization?: number | null;
}

/**
 * Response from `POST /organization/member_add`.
 *
 * @see https://docs.litellm.ai/docs/proxy/organizations
 */
export interface OrganizationMemberAddResponse {
  /** Organization identifier. */
  organization_id: string;
  /** Updated user rows. */
  updated_users: Record<string, unknown>[];
  /** Updated organization-membership rows. */
  updated_organization_memberships: OrganizationMembershipObject[];
}

/** Body for `POST /organization/member_update`. */
export interface OrganizationMemberUpdateParams {
  /** Organization identifier. */
  organization_id: string;
  /** User identifier of the member to update. */
  user_id?: string;
  /** Email of the member to update. */
  user_email?: string;
  /** New role within the organization. */
  role?: OrganizationMemberRole;
  /** New personal spend cap (USD). */
  max_budget_in_organization?: number | null;
}
export type OrganizationMemberUpdateResponse = OrganizationMembershipObject;

/** Body for `POST /organization/member_delete`. */
export interface OrganizationMemberDeleteParams {
  /** Organization identifier. */
  organization_id: string;
  /** User identifier of the member to remove. */
  user_id?: string;
  /** Email of the member to remove. */
  user_email?: string;
}
export type OrganizationMemberDeleteResponse = OrganizationMembershipObject;

/**
 * Query parameters for the organization daily-activity endpoint.
 *
 * @see https://docs.litellm.ai/docs/proxy/organizations
 */
export interface OrganizationDailyActivityParams {
  /** Comma-separated list of organization_ids. */
  organization_ids?: string;
  /** ISO date (YYYY-MM-DD) of the start of the window. */
  start_date?: string;
  /** ISO date (YYYY-MM-DD) of the end of the window. */
  end_date?: string;
  /** Filter to a specific model. */
  model?: string;
  /** Filter to a specific API key. */
  api_key?: string;
  /** 1-indexed page number. */
  page?: number;
  /** Page size. */
  page_size?: number;
  /** Comma-separated list of organization_ids to exclude. */
  exclude_organization_ids?: string;
}

/** Response from the organization daily-activity endpoint. */
export interface OrganizationDailyActivityResponse {
  /** Per-day / per-organization activity rows. */
  results?: unknown[];
  /** Aggregate metadata. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
