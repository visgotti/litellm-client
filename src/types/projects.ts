import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Project Management
//
// Projects sit between teams and keys in the LiteLLM hierarchy. Note: most
// project mutations are gated behind a LiteLLM Enterprise license. Listing
// projects (GET /project/list) and reading project info (GET /project/info)
// remain available without a license but return empty results unless the
// proxy is licensed.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Object-permission base used by Projects (and other entities) to scope
 * access to vector stores, MCP servers, etc.
 */
export interface ProjectObjectPermissionBase {
  vector_stores?: string[] | null;
  mcp_servers?: string[] | null;
  [key: string]: unknown;
}

/**
 * Parameters for `POST /project/new`.
 *
 * `team_id` is the only required field. If `budget_id` is omitted, the
 * proxy creates a budget from the supplied limit fields (max_budget,
 * tpm_limit, rpm_limit, etc.).
 */
export interface ProjectCreateParams {
  /** The team id this project belongs to (required). */
  team_id: string;
  /** Display name for the project. */
  project_alias?: string | null;
  /** Free-form description of the project's purpose. */
  description?: string | null;
  /** Models the project has access to. Defaults to all team models. */
  models?: string[];
  /** Existing budget id to attach. If omitted, a new budget is created from limit fields. */
  budget_id?: string | null;
  /** Max spend in USD for this project. */
  max_budget?: number | null;
  /** Soft budget — slack alert sent when reached, but requests are not blocked. */
  soft_budget?: number | null;
  /** Tokens-per-minute limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute limit. */
  rpm_limit?: number | null;
  /** Max parallel in-flight requests. */
  max_parallel_requests?: number | null;
  /** Per-model max budget map, e.g. `{"gpt-4": 100, "gpt-3.5-turbo": 50}`. */
  model_max_budget?: Record<string, number> | null;
  /** Per-model RPM limit map. */
  model_rpm_limit?: Record<string, number> | null;
  /** Per-model TPM limit map. */
  model_tpm_limit?: Record<string, number> | null;
  /** Frequency at which the project budget resets (e.g. "30d"). */
  budget_duration?: string | null;
  /** Free-form metadata. */
  metadata?: Record<string, unknown> | null;
  /** Project tags. */
  tags?: string[] | null;
  /** Guardrail names applied to the project. */
  guardrails?: string[] | null;
  /** Policy names applied to the project. */
  policies?: string[] | null;
  /** Subset of the team's allowed_models that this project can use. */
  allowed_models?: string[] | null;
  /** When true, all keys with this project_id are blocked. */
  blocked?: boolean;
  /** Object-level permissions (vector stores, MCP servers, etc.). */
  object_permission?: ProjectObjectPermissionBase | null;
}

/**
 * Project record as returned by the proxy. Mirrors the
 * `LiteLLM_ProjectTable` schema in OpenAPI.
 */
export interface ProjectInfo {
  project_id: string;
  project_alias?: string | null;
  description?: string | null;
  team_id?: string | null;
  budget_id?: string | null;
  metadata?: Record<string, unknown> | null;
  models: string[];
  spend: number;
  model_spend?: Record<string, number> | null;
  model_rpm_limit?: Record<string, number> | null;
  model_tpm_limit?: Record<string, number> | null;
  blocked: boolean;
  object_permission_id?: string | null;
  created_by: string;
  updated_by: string;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
  litellm_budget_table?: Record<string, unknown> | null;
  object_permission?: Record<string, unknown> | null;
}

/**
 * Response from `POST /project/new`. Same shape as `ProjectInfo` plus a
 * guaranteed `created_at` / `updated_at`.
 */
export interface ProjectCreateResponse extends ProjectInfo {
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * Parameters for `POST /project/update`. Only `project_id` is required;
 * any other field is treated as a partial update.
 */
export interface ProjectUpdateParams {
  /** Project id to update (required). */
  project_id: string;
  project_alias?: string | null;
  description?: string | null;
  team_id?: string | null;
  metadata?: Record<string, unknown> | null;
  models?: string[] | null;
  blocked?: boolean | null;
  budget_id?: string | null;
  max_budget?: number | null;
  soft_budget?: number | null;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  max_parallel_requests?: number | null;
  model_max_budget?: Record<string, number> | null;
  model_rpm_limit?: Record<string, number> | null;
  model_tpm_limit?: Record<string, number> | null;
  budget_duration?: string | null;
  tags?: string[] | null;
  guardrails?: string[] | null;
  policies?: string[] | null;
  allowed_models?: string[] | null;
  object_permission?: ProjectObjectPermissionBase | null;
}

/** Parameters for `DELETE /project/delete`. */
export interface ProjectDeleteParams {
  /** Project ids to delete. */
  project_ids: string[];
}

/** Parameters for `GET /project/info`. */
export interface ProjectInfoParams {
  /** Project id to look up. */
  project_id: string;
}

/** Response from `DELETE /project/delete` — array of deleted project records. */
export type ProjectDeleteResponse = ProjectInfo[];

/** Response from `GET /project/list` — array of project records. */
export type ProjectListResponse = ProjectInfo[];
