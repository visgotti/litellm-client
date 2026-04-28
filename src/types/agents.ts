import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// A2A Agents (registry / management) — `/v1/agents`
// Mirrors litellm.types.agents pydantic models.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Agent card sub-types (A2A protocol) ─────────────────────────────────────

export interface AgentProvider {
  organization: string;
  url: string;
}

export interface AgentExtension {
  uri: string;
  description?: string;
  required?: boolean;
  params?: Record<string, unknown>;
}

export interface AgentCapabilities {
  streaming?: boolean;
  pushNotifications?: boolean;
  stateTransitionHistory?: boolean;
  extensions?: AgentExtension[];
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples?: string[];
  inputModes?: string[];
  outputModes?: string[];
  security?: Array<Record<string, string[]>>;
}

export interface AgentInterface {
  url: string;
  transport: string;
}

export interface AgentCardSignature {
  protected: string;
  signature: string;
  header?: Record<string, unknown>;
}

export interface AgentCardSecuritySchemeBase {
  description?: string;
}
export interface APIKeySecurityScheme extends AgentCardSecuritySchemeBase {
  type: 'apiKey';
  in: 'query' | 'header' | 'cookie';
  name: string;
}
export interface HTTPAuthSecurityScheme extends AgentCardSecuritySchemeBase {
  type: 'http';
  scheme: string;
  bearerFormat?: string;
}
export interface OAuth2SecurityScheme extends AgentCardSecuritySchemeBase {
  type: 'oauth2';
  flows: {
    authorizationCode?: Record<string, unknown>;
    clientCredentials?: Record<string, unknown>;
    implicit?: Record<string, unknown>;
    password?: Record<string, unknown>;
  };
  oauth2MetadataUrl?: string;
}
export interface OpenIdConnectSecurityScheme extends AgentCardSecuritySchemeBase {
  type: 'openIdConnect';
  openIdConnectUrl: string;
}
export interface MutualTLSSecurityScheme extends AgentCardSecuritySchemeBase {
  type: 'mutualTLS';
}
export type SecurityScheme =
  | APIKeySecurityScheme
  | HTTPAuthSecurityScheme
  | OAuth2SecurityScheme
  | OpenIdConnectSecurityScheme
  | MutualTLSSecurityScheme;

export interface AgentCard {
  protocolVersion: string;
  name: string;
  description: string;
  url: string;
  version: string;
  capabilities: AgentCapabilities;
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: AgentSkill[];
  preferredTransport?: string;
  additionalInterfaces?: AgentInterface[];
  iconUrl?: string;
  provider?: AgentProvider;
  documentationUrl?: string;
  securitySchemes?: Record<string, SecurityScheme>;
  security?: Array<Record<string, string[]>>;
  supportsAuthenticatedExtendedCard?: boolean;
  signatures?: AgentCardSignature[];
  [key: string]: unknown;
}

export interface AugmentedAgentCard extends AgentCard {
  is_public: boolean;
}

// ─── Object permission / config payloads ────────────────────────────────────

export interface AgentObjectPermission {
  mcp_servers?: string[];
  mcp_access_groups?: string[];
  mcp_tool_permissions?: Record<string, string[]>;
  models?: string[];
  agents?: string[];
}

export interface AgentConfig {
  agent_name: string;
  agent_card_params: AgentCard;
  litellm_params?: Record<string, unknown>;
  object_permission?: AgentObjectPermission;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  session_tpm_limit?: number | null;
  session_rpm_limit?: number | null;
  static_headers?: Record<string, string> | null;
  extra_headers?: string[] | null;
}

export type AgentCreateParams = AgentConfig;
export type AgentUpdateParams = AgentConfig;

export interface AgentPatchParams {
  agent_name?: string;
  agent_card_params?: AgentCard;
  litellm_params?: Record<string, unknown>;
  object_permission?: AgentObjectPermission;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  session_tpm_limit?: number | null;
  session_rpm_limit?: number | null;
  static_headers?: Record<string, string> | null;
  extra_headers?: string[] | null;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export interface AgentResponse {
  agent_id: string;
  agent_name: string;
  litellm_params?: Record<string, unknown> | null;
  agent_card_params: Record<string, unknown>;
  object_permission?: Record<string, unknown> | null;
  spend?: number | null;
  tpm_limit?: number | null;
  rpm_limit?: number | null;
  session_tpm_limit?: number | null;
  session_rpm_limit?: number | null;
  static_headers?: Record<string, string> | null;
  extra_headers?: string[] | null;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export type AgentListResponse = AgentResponse[];

export interface AgentListParams {
  /** When true, performs a GET against each agent's URL and filters out unreachable ones. */
  health_check?: boolean;
}

export interface AgentDeleteResponse {
  message: string;
  [key: string]: unknown;
}

export interface AgentMakePublicResponse {
  message: string;
  public_agent_groups: string[];
  updated_by: string | null;
}

export interface AgentMakePublicBulkParams {
  agent_ids: string[];
}

// ─── Daily activity ──────────────────────────────────────────────────────────

export interface AgentDailyActivityParams {
  /** Comma-separated list of agent ids. */
  agent_ids?: string;
  start_date?: string;
  end_date?: string;
  model?: string;
  api_key?: string;
  page?: number;
  page_size?: number;
  /** Comma-separated list of agent ids to exclude. */
  exclude_agent_ids?: string;
}

export interface AgentDailyActivityResponse {
  results: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}
