import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Team Management
// ─────────────────────────────────────────────────────────────────────────────

export interface TeamCreateParams {
  team_alias?: string;
  team_id?: string;
  models?: string[];
  max_budget?: number | null;
  budget_duration?: string | null;
  members_with_roles?: TeamMember[];
  metadata?: Record<string, unknown>;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  blocked?: boolean;
}

export interface TeamMember {
  role: 'admin' | 'user';
  user_id: string;
}

export interface TeamCreateResponse {
  team_id: string;
  team_alias: string | null;
  models: string[];
  max_budget: number | null;
  members_with_roles: TeamMember[];
  metadata: Record<string, unknown>;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TeamUpdateParams {
  team_id: string;
  team_alias?: string;
  models?: string[];
  max_budget?: number | null;
  budget_duration?: string | null;
  metadata?: Record<string, unknown>;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  blocked?: boolean;
}

export interface TeamDeleteParams {
  team_ids: string[];
}

export interface TeamDeleteResponse {
  deleted_teams: string[];
}

export interface TeamInfoParams {
  team_id: string;
}

export interface TeamInfo {
  team_id: string;
  team_alias: string | null;
  models: string[];
  max_budget: number | null;
  spend: number;
  members_with_roles: TeamMember[];
  metadata: Record<string, unknown>;
  blocked: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TeamMemberAddParams {
  team_id: string;
  member: TeamMember;
}

export interface TeamMemberDeleteParams {
  team_id: string;
  user_id: string;
}
