import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// A2A Agents (registry / management) — `/v1/agents`
// Mirrors litellm.types.agents pydantic models.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Agent card sub-types (A2A protocol) ─────────────────────────────────────

/**
 * Provider metadata published in an Agent Card.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentProvider {
  /** Owning organization. */
  organization: string;
  /** Provider home page URL. */
  url: string;
}

/**
 * A protocol extension declared by an agent.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentExtension {
  /** Extension URI / identifier. */
  uri: string;
  /** Description of the extension. */
  description?: string;
  /** Whether the extension is required for clients to use the agent. */
  required?: boolean;
  /** Free-form configuration parameters for the extension. */
  params?: Record<string, unknown>;
}

/**
 * Optional capabilities declared in an Agent Card.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentCapabilities {
  /** Server supports streaming task updates. */
  streaming?: boolean;
  /** Server supports push notifications for task updates. */
  pushNotifications?: boolean;
  /** Server publishes a history of state transitions. */
  stateTransitionHistory?: boolean;
  /** Protocol extensions implemented by the agent. */
  extensions?: AgentExtension[];
}

/**
 * A skill exposed by an agent.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentSkill {
  /** Skill identifier (unique within the agent). */
  id: string;
  /** Display name. */
  name: string;
  /** Description of what the skill does. */
  description: string;
  /** Tags used for discovery / filtering. */
  tags: string[];
  /** Example invocations. */
  examples?: string[];
  /** Accepted input modalities (e.g. `'text'`, `'image'`). */
  inputModes?: string[];
  /** Produced output modalities. */
  outputModes?: string[];
  /** Per-skill security scheme requirements. */
  security?: Array<Record<string, string[]>>;
}

/**
 * Alternative interface (URL + transport) the agent can be reached on.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentInterface {
  /** Endpoint URL. */
  url: string;
  /** Transport (e.g. `'jsonrpc'`, `'sse'`). */
  transport: string;
}

/** A signed agent-card signature (JWS). */
export interface AgentCardSignature {
  /** Base64url-encoded protected header. */
  protected: string;
  /** Base64url-encoded signature. */
  signature: string;
  /** Optional unprotected header. */
  header?: Record<string, unknown>;
}

/** Common base for agent-card security scheme entries. */
export interface AgentCardSecuritySchemeBase {
  /** Description shown to clients. */
  description?: string;
}
/** API-key security scheme. */
export interface APIKeySecurityScheme extends AgentCardSecuritySchemeBase {
  /** Discriminator (`'apiKey'`). */
  type: 'apiKey';
  /** Where the key is sent. */
  in: 'query' | 'header' | 'cookie';
  /** Name of the parameter / header / cookie. */
  name: string;
}
/** HTTP-auth security scheme. */
export interface HTTPAuthSecurityScheme extends AgentCardSecuritySchemeBase {
  /** Discriminator (`'http'`). */
  type: 'http';
  /** HTTP authentication scheme name (e.g. `'bearer'`, `'basic'`). */
  scheme: string;
  /** Bearer-token format hint (e.g. `'JWT'`). */
  bearerFormat?: string;
}
/** OAuth2 security scheme. */
export interface OAuth2SecurityScheme extends AgentCardSecuritySchemeBase {
  /** Discriminator (`'oauth2'`). */
  type: 'oauth2';
  /** Supported OAuth2 flows. */
  flows: {
    /** Authorization-code flow definition. */
    authorizationCode?: Record<string, unknown>;
    /** Client-credentials flow definition. */
    clientCredentials?: Record<string, unknown>;
    /** Implicit flow definition. */
    implicit?: Record<string, unknown>;
    /** Resource-owner password flow definition. */
    password?: Record<string, unknown>;
  };
  /** Optional URL of the OAuth2 provider's discovery metadata. */
  oauth2MetadataUrl?: string;
}
/** OpenID Connect security scheme. */
export interface OpenIdConnectSecurityScheme extends AgentCardSecuritySchemeBase {
  /** Discriminator (`'openIdConnect'`). */
  type: 'openIdConnect';
  /** OpenID Connect discovery URL. */
  openIdConnectUrl: string;
}
/** Mutual TLS security scheme. */
export interface MutualTLSSecurityScheme extends AgentCardSecuritySchemeBase {
  /** Discriminator (`'mutualTLS'`). */
  type: 'mutualTLS';
}
export type SecurityScheme =
  | APIKeySecurityScheme
  | HTTPAuthSecurityScheme
  | OAuth2SecurityScheme
  | OpenIdConnectSecurityScheme
  | MutualTLSSecurityScheme;

/**
 * A2A agent card describing a registered agent.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentCard {
  /** A2A protocol version implemented by the agent. */
  protocolVersion: string;
  /** Display name. */
  name: string;
  /** Description of the agent. */
  description: string;
  /** Primary endpoint URL. */
  url: string;
  /** Agent version string. */
  version: string;
  /** Optional capabilities declared by the agent. */
  capabilities: AgentCapabilities;
  /** Default input modalities. */
  defaultInputModes: string[];
  /** Default output modalities. */
  defaultOutputModes: string[];
  /** Skills the agent exposes. */
  skills: AgentSkill[];
  /** Preferred transport (`'jsonrpc'` etc.). */
  preferredTransport?: string;
  /** Additional URL+transport interfaces. */
  additionalInterfaces?: AgentInterface[];
  /** URL to an icon for UI display. */
  iconUrl?: string;
  /** Provider metadata. */
  provider?: AgentProvider;
  /** URL to documentation about the agent. */
  documentationUrl?: string;
  /** Security schemes the agent advertises. */
  securitySchemes?: Record<string, SecurityScheme>;
  /** Top-level security requirements. */
  security?: Array<Record<string, string[]>>;
  /** Whether the agent supports an authenticated extended card. */
  supportsAuthenticatedExtendedCard?: boolean;
  /** JWS signatures attesting to the card's contents. */
  signatures?: AgentCardSignature[];
  /** Free-form additional fields forwarded by the agent. */
  [key: string]: unknown;
}

/** Agent card augmented with proxy-side metadata. */
export interface AugmentedAgentCard extends AgentCard {
  /** Whether the agent is public on this proxy. */
  is_public: boolean;
}

// ─── Object permission / config payloads ────────────────────────────────────

/**
 * Per-agent object-permission grant.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentObjectPermission {
  /** MCP server IDs this agent may use. */
  mcp_servers?: string[];
  /** MCP access-group names this agent may use. */
  mcp_access_groups?: string[];
  /** Per-server allow-list of tool names. */
  mcp_tool_permissions?: Record<string, string[]>;
  /** Models this agent may invoke. */
  models?: string[];
  /** Other agents this agent may invoke. */
  agents?: string[];
}

/**
 * Configuration block stored for an agent.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentConfig {
  /** Routing alias of the agent on the proxy. */
  agent_name: string;
  /** Agent card published for this agent. */
  agent_card_params: AgentCard;
  /** LiteLLM routing parameters for the agent. */
  litellm_params?: Record<string, unknown>;
  /** Object-permission grants. */
  object_permission?: AgentObjectPermission;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** Per-session TPM limit. */
  session_tpm_limit?: number | null;
  /** Per-session RPM limit. */
  session_rpm_limit?: number | null;
  /** Static headers attached to outbound calls from this agent. */
  static_headers?: Record<string, string> | null;
  /** Header names allowed to be forwarded from the client. */
  extra_headers?: string[] | null;
}

export type AgentCreateParams = AgentConfig;
export type AgentUpdateParams = AgentConfig;

/**
 * Partial-update params for an agent.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentPatchParams {
  /** New routing alias. */
  agent_name?: string;
  /** Replacement agent card. */
  agent_card_params?: AgentCard;
  /** Updated LiteLLM routing parameters. */
  litellm_params?: Record<string, unknown>;
  /** Updated object-permission grants. */
  object_permission?: AgentObjectPermission;
  /** Updated TPM limit. */
  tpm_limit?: number | null;
  /** Updated RPM limit. */
  rpm_limit?: number | null;
  /** Updated per-session TPM limit. */
  session_tpm_limit?: number | null;
  /** Updated per-session RPM limit. */
  session_rpm_limit?: number | null;
  /** Updated static headers. */
  static_headers?: Record<string, string> | null;
  /** Updated forwardable header names. */
  extra_headers?: string[] | null;
}

// ─── Responses ───────────────────────────────────────────────────────────────

/**
 * An agent record as stored on the proxy.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentResponse {
  /** Unique identifier. */
  agent_id: string;
  /** Routing alias. */
  agent_name: string;
  /** LiteLLM routing parameters. */
  litellm_params?: Record<string, unknown> | null;
  /** Agent card stored for this agent. */
  agent_card_params: Record<string, unknown>;
  /** Object-permission grants. */
  object_permission?: Record<string, unknown> | null;
  /** Cumulative spend tracked for this agent. */
  spend?: number | null;
  /** Tokens-per-minute rate limit. */
  tpm_limit?: number | null;
  /** Requests-per-minute rate limit. */
  rpm_limit?: number | null;
  /** Per-session TPM limit. */
  session_tpm_limit?: number | null;
  /** Per-session RPM limit. */
  session_rpm_limit?: number | null;
  /** Static headers attached to outbound calls. */
  static_headers?: Record<string, string> | null;
  /** Header names allowed to be forwarded from the client. */
  extra_headers?: string[] | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString | null;
  /** Identifier of the creating user. */
  created_by?: string | null;
  /** Identifier of the user that last updated the agent. */
  updated_by?: string | null;
}

export type AgentListResponse = AgentResponse[];

/**
 * Query parameters for `GET /v1/agents`.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentListParams {
  /** When true, performs a GET against each agent's URL and filters out unreachable ones. */
  health_check?: boolean;
}

/**
 * Response from deleting an agent.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentDeleteResponse {
  /** Human-readable status. */
  message: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Response from making one or more agents public.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentMakePublicResponse {
  /** Human-readable status. */
  message: string;
  /** Agent group identifiers now marked public. */
  public_agent_groups: string[];
  /** Identifier of the user that performed the change. */
  updated_by: string | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Body for making multiple agents public in a single call. */
export interface AgentMakePublicBulkParams {
  /** IDs of agents to make public. */
  agent_ids: string[];
}

// ─── Daily activity ──────────────────────────────────────────────────────────

/**
 * Query parameters for the agent daily-activity endpoint.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentDailyActivityParams {
  /** Comma-separated list of agent ids. */
  agent_ids?: string;
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
  /** Comma-separated list of agent ids to exclude. */
  exclude_agent_ids?: string;
}

/**
 * Response from the agent daily-activity endpoint.
 *
 * @see https://docs.litellm.ai/docs/proxy/agent
 */
export interface AgentDailyActivityResponse {
  /** Per-day / per-agent activity rows. */
  results: Array<Record<string, unknown>>;
  /** Aggregate metadata about the response. */
  metadata?: Record<string, unknown>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
