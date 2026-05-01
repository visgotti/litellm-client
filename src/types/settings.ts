// ─────────────────────────────────────────────────────────────────────────────
// Admin Settings panel
//
// Mirrors the LiteLLM proxy's `/get/*` and `/update/*` admin settings endpoints
// plus the small handful of UI-related discovery / asset endpoints.
//
// All `Get*SettingsResponse` shapes share the same loose envelope:
//   { values: Record<string, unknown>, field_schema: Record<string, unknown> }
// where `values` holds the currently-persisted setting values and
// `field_schema` describes how the UI should render each editable field.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared envelope returned by every GET /get/<setting> endpoint ──────────

/**
 * Standard envelope used by every `GET /get/<setting>` endpoint.
 * `values` holds the persisted configuration; `field_schema` describes the
 * rendering metadata used by the LiteLLM admin UI to draw an edit form.
 */
export interface SettingsEnvelope<TValues = Record<string, unknown>> {
  /** Currently persisted setting values */
  values: TValues;
  /** Field-level schema (labels, types, descriptions) for the admin UI */
  field_schema: Record<string, unknown>;
}

// ─── Default Team Settings (DefaultTeamSSOParams) ────────────────────────────

/**
 * Default parameters applied when a new team is automatically created by
 * LiteLLM via SSO group sync.
 *
 * Mirrors `DefaultTeamSSOParams` from the proxy's OpenAPI spec.
 */
export interface DefaultTeamSettingsUpdateParams {
  /** Default list of models that new automatically created teams can access */
  models?: string[];
  /** Default maximum budget (USD) for new automatically created teams */
  max_budget?: number | null;
  /** Default budget duration (e.g. 'daily', 'weekly', 'monthly') */
  budget_duration?: string | null;
  /** Default tpm limit for new automatically created teams */
  tpm_limit?: number | null;
  /** Default rpm limit for new automatically created teams */
  rpm_limit?: number | null;
  /**
   * Default permissions granted to members of newly created teams
   * (e.g. `/key/generate`, `/key/update`, `/key/delete`).
   * `/key/info` and `/key/health` are always implicitly included.
   */
  team_member_permissions?: string[] | null;
}

export type DefaultTeamSettingsResponse = SettingsEnvelope;

// ─── Internal User Settings (DefaultInternalUserParams) ──────────────────────

export type DefaultInternalUserRole =
  | 'internal_user'
  | 'internal_user_viewer'
  | 'proxy_admin'
  | 'proxy_admin_viewer';

/**
 * Default parameters applied when a new user signs in via SSO or is created
 * via the `/user/new` API endpoint.
 *
 * Mirrors `DefaultInternalUserParams` from the proxy's OpenAPI spec.
 */
export interface InternalUserSettingsUpdateParams {
  /** Default role assigned to newly-created users (defaults to `internal_user_viewer`) */
  user_role?: DefaultInternalUserRole | null;
  /** Default maximum budget (USD) for new users */
  max_budget?: number | null;
  /** Default budget duration (e.g. 'daily', 'weekly', 'monthly') */
  budget_duration?: string | null;
  /** Default list of models new users can access */
  models?: string[] | null;
  /** Default teams new users are added to */
  teams?: string[] | Array<Record<string, unknown>> | null;
}

export type InternalUserSettingsResponse = SettingsEnvelope;

// ─── MCP Semantic Filter Settings ────────────────────────────────────────────

/**
 * Configuration for MCP semantic tool filtering.
 * Used to narrow the list of MCP tools surfaced to a model based on the
 * semantic similarity of each tool's description to the user query.
 */
export interface MCPSemanticFilterSettingsUpdateParams {
  /** Whether semantic filtering is enabled */
  enabled?: boolean;
  /** Embedding model used to compute semantic similarity */
  embedding_model?: string;
  /** Number of most-relevant tools to return (1–100) */
  top_k?: number;
  /** Minimum similarity score for tool inclusion (0.0–1.0) */
  similarity_threshold?: number;
}

export type MCPSemanticFilterSettingsResponse = SettingsEnvelope;

// ─── SSO Settings (SSOConfig) ────────────────────────────────────────────────

export type UIAccessMode = 'all_authenticated_users' | 'admin_only' | 'sso_only' | string;

/**
 * SSO environment-variable equivalents and high-level access controls.
 * Mirrors `SSOConfig` from the OpenAPI spec.
 */
export interface SSOSettingsUpdateParams {
  /** Google OAuth client ID */
  google_client_id?: string | null;
  /** Google OAuth client secret */
  google_client_secret?: string | null;
  /** Microsoft OAuth client ID */
  microsoft_client_id?: string | null;
  /** Microsoft OAuth client secret */
  microsoft_client_secret?: string | null;
  /** Microsoft Azure tenant ID */
  microsoft_tenant?: string | null;
  /** Generic OAuth client ID (Okta, etc.) */
  generic_client_id?: string | null;
  /** Generic OAuth client secret */
  generic_client_secret?: string | null;
  /** Generic OAuth authorization endpoint URL */
  generic_authorization_endpoint?: string | null;
  /** Generic OAuth token endpoint URL */
  generic_token_endpoint?: string | null;
  /** Generic OAuth user-info endpoint URL */
  generic_userinfo_endpoint?: string | null;
  /** Base URL of the proxy server, used for SSO redirects */
  proxy_base_url?: string | null;
  /** Email of the proxy admin user */
  user_email?: string | null;
  /** Access mode for the UI */
  ui_access_mode?: UIAccessMode | null;
  /** Mapping configuration from SSO groups to LiteLLM roles */
  role_mappings?: Record<string, unknown> | null;
  /** Mapping configuration from SSO JWT fields to team IDs */
  team_mappings?: Record<string, unknown> | null;
}

export type SSOSettingsResponse = SettingsEnvelope;

// ─── UI Settings ─────────────────────────────────────────────────────────────

/**
 * UI-specific feature flags.
 * Mirrors `UISettings` from the OpenAPI spec.
 */
export interface UISettingsUpdateParams {
  /** If true, internal users cannot add models from the UI */
  disable_model_add_for_internal_users?: boolean;
  /** Prevent team admins from removing users from teams they manage */
  disable_team_admin_delete_team_user?: boolean;
  /** List of UI sidebar pages that internal users may see */
  enabled_ui_pages_internal_users?: string[] | null;
  /** Require authentication to access the public AI Hub */
  require_auth_for_public_ai_hub?: boolean;
  /** Forward client headers (Authorization, anthropic-beta, x-*) to upstream LLMs */
  forward_client_headers_to_llm_api?: boolean;
  /** Forward provider auth headers (x-api-key, x-goog-api-key, …) to upstream LLMs */
  forward_llm_provider_auth_headers?: boolean;
  /** Show the Projects feature in the UI sidebar */
  enable_projects_ui?: boolean;
  /** Disable agent management for internal users */
  disable_agents_for_internal_users?: boolean;
  /** Exempt team admins from the agents disable restriction */
  allow_agents_for_team_admins?: boolean;
  /** Disable vector-store management for internal users */
  disable_vector_stores_for_internal_users?: boolean;
  /** Exempt team admins from the vector-stores disable restriction */
  allow_vector_stores_for_team_admins?: boolean;
  /** Restrict the user-search endpoint to results within the caller's organization */
  scope_user_search_to_org?: boolean;
  /** If true, custom (user-supplied) key values are not allowed */
  disable_custom_api_keys?: boolean;
}

export type UISettingsResponse = SettingsEnvelope;

// ─── UI Theme Settings ───────────────────────────────────────────────────────

/**
 * UI theme customization (custom logo + favicon URLs).
 * Mirrors `UIThemeConfig` from the OpenAPI spec.
 */
export interface UIThemeSettingsUpdateParams {
  /** URL or path to a custom logo image */
  logo_url?: string | null;
  /** HTTP/HTTPS URL of a custom favicon (.ico, .png, .svg) */
  favicon_url?: string | null;
}

export type UIThemeSettingsResponse = SettingsEnvelope;

// ─── Logo upload ─────────────────────────────────────────────────────────────

/**
 * Optional metadata for the multipart logo upload request.
 */
export interface LogoUploadOptions {
  /** Filename to send in the multipart form (defaults to `logo`) */
  filename?: string;
  /** MIME type override (defaults to the blob's existing `type`, or `application/octet-stream`) */
  contentType?: string;
}

/** Generic response for `POST /upload/logo` (server returns an open object). */
export type LogoUploadResponse = Record<string, unknown>;

// ─── Discovery endpoints ─────────────────────────────────────────────────────

/**
 * Response from `GET /in_product_nudges`.
 */
export interface InProductNudgesResponse {
  /** Whether the Claude Code in-product nudge should be shown */
  is_claude_code_enabled: boolean;
}

/** A worker entry advertised by the UI discovery endpoint. */
export interface UIWorkerRegistryEntry {
  [key: string]: unknown;
}

/**
 * Response from `GET /.well-known/litellm-ui-config` and the
 * `/litellm/.well-known/litellm-ui-config` alias.
 */
export interface UIDiscoveryEndpointsResponse {
  server_root_path: string;
  proxy_base_url: string | null;
  auto_redirect_to_sso: boolean;
  admin_ui_disabled: boolean;
  sso_configured: boolean;
  is_control_plane?: boolean;
  workers?: UIWorkerRegistryEntry[];
}
