import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// MCP — Model Context Protocol server management
// All paths in the SDK are mounted under `/mcp/`.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums / literal unions ───────────────────────────────────────────────────

export type MCPTransport = 'sse' | 'http' | 'stdio';

export type MCPAuthType =
  | 'none'
  | 'api_key'
  | 'bearer_token'
  | 'basic'
  | 'authorization'
  | 'oauth2'
  | 'aws_sigv4'
  | 'token'
  | null;

export type MCPApprovalStatus = 'pending_review' | 'active' | 'rejected';

export type MCPHealthStatus = 'healthy' | 'unhealthy' | 'unknown';

export type MCPOAuth2Flow = 'client_credentials' | 'authorization_code';

// ── Shared shapes ────────────────────────────────────────────────────────────

export interface MCPCredentials {
  auth_value?: string | null;
  client_id?: string | null;
  client_secret?: string | null;
  scopes?: string[] | null;
  aws_access_key_id?: string | null;
  aws_secret_access_key?: string | null;
  aws_session_token?: string | null;
  aws_region_name?: string | null;
  aws_service_name?: string | null;
  aws_role_name?: string | null;
  aws_session_name?: string | null;
}

export interface MCPInfo {
  [key: string]: unknown;
}

// ── Tools ────────────────────────────────────────────────────────────────────

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MCPToolsListResponse {
  tools: MCPTool[];
}

// ── Access groups ────────────────────────────────────────────────────────────

export interface MCPAccessGroupsResponse {
  access_groups: string[];
}

// ── Network ──────────────────────────────────────────────────────────────────

export interface MCPClientIpResponse {
  ip: string | null;
}

// ── Registry / discovery ─────────────────────────────────────────────────────

export interface MCPRegistryResponse {
  servers: Array<{ server: Record<string, unknown> }>;
  [key: string]: unknown;
}

export interface MCPOpenApiRegistryResponse {
  apis?: unknown[];
  [key: string]: unknown;
}

export interface MCPDiscoverParams {
  query?: string;
  category?: string;
}

export interface MCPDiscoverResponse {
  servers: Array<Record<string, unknown>>;
  categories: string[];
}

// ── Server CRUD types ────────────────────────────────────────────────────────

export interface MCPServerBase {
  server_name?: string | null;
  alias?: string | null;
  description?: string | null;
  transport?: MCPTransport;
  auth_type?: MCPAuthType;
  credentials?: MCPCredentials | null;
  url?: string | null;
  spec_path?: string | null;
  mcp_info?: MCPInfo | null;
  mcp_access_groups?: string[];
  allowed_tools?: string[] | null;
  tool_name_to_display_name?: Record<string, string> | null;
  tool_name_to_description?: Record<string, string> | null;
  extra_headers?: string[] | null;
  static_headers?: Record<string, string> | null;
  instructions?: string | null;
  // Stdio-specific
  command?: string | null;
  args?: string[];
  env?: Record<string, string>;
  // OAuth2
  authorization_url?: string | null;
  token_url?: string | null;
  registration_url?: string | null;
  // Sharing
  allow_all_keys?: boolean;
  available_on_public_internet?: boolean;
  is_byok?: boolean;
  byok_description?: string[];
  byok_api_key_help_url?: string | null;
  source_url?: string | null;
}

export interface NewMCPServerRequest extends MCPServerBase {
  server_id?: string | null;
  oauth2_flow?: MCPOAuth2Flow | null;
  // Server-managed; values are overridden by the proxy.
  approval_status?: MCPApprovalStatus | null;
  submitted_by?: string | null;
  submitted_at?: ISODateString | null;
}

export interface UpdateMCPServerRequest extends MCPServerBase {
  server_id: string;
}

export interface LiteLLM_MCPServerTable {
  server_id: string;
  server_name?: string | null;
  alias?: string | null;
  description?: string | null;
  url?: string | null;
  spec_path?: string | null;
  transport: MCPTransport;
  auth_type?: MCPAuthType;
  credentials?: MCPCredentials | null;
  instructions?: string | null;
  created_at?: ISODateString | null;
  created_by?: string | null;
  updated_at?: ISODateString | null;
  updated_by?: string | null;
  teams?: Array<Record<string, string | null>>;
  mcp_access_groups?: string[];
  allowed_tools?: string[];
  tool_name_to_display_name?: Record<string, string> | null;
  tool_name_to_description?: Record<string, string> | null;
  extra_headers?: string[];
  mcp_info?: MCPInfo | null;
  static_headers?: Record<string, string> | null;
  status?: MCPHealthStatus;
  last_health_check?: ISODateString | null;
  health_check_error?: string | null;
  command?: string | null;
  args?: string[];
  env?: Record<string, string>;
  authorization_url?: string | null;
  token_url?: string | null;
  registration_url?: string | null;
  allow_all_keys?: boolean;
  available_on_public_internet?: boolean;
  is_byok?: boolean;
  byok_description?: string[];
  byok_api_key_help_url?: string | null;
  has_user_credential?: boolean | null;
  source_url?: string | null;
  approval_status?: MCPApprovalStatus | null;
  submitted_by?: string | null;
  submitted_at?: ISODateString | null;
  reviewed_at?: ISODateString | null;
  review_notes?: string | null;
  [key: string]: unknown;
}

export interface MCPServerListParams {
  team_id?: string;
}

export type MCPServerListResponse = LiteLLM_MCPServerTable[];

export interface MCPServerHealthParams {
  server_ids?: string[];
}

export interface MCPServerHealthEntry {
  server_id: string;
  status: MCPHealthStatus | null;
}

export type MCPServerHealthResponse = MCPServerHealthEntry[];

// ── Submissions ──────────────────────────────────────────────────────────────

export interface MCPSubmissionsSummary {
  total: number;
  pending_review: number;
  active: number;
  rejected: number;
  items: LiteLLM_MCPServerTable[];
}

export interface RejectMCPServerRequest {
  review_notes?: string | null;
}

// ── make_public ──────────────────────────────────────────────────────────────

export interface MakeMCPServersPublicRequest {
  mcp_server_ids: string[];
}

export interface MakeMCPServersPublicResponse {
  message: string;
  public_mcp_servers: string[];
  updated_by: string | null;
  [key: string]: unknown;
}

// ── User credentials (BYOK) ──────────────────────────────────────────────────

export interface MCPUserCredentialRequest {
  credential: string;
  save?: boolean;
}

export interface MCPUserCredentialResponse {
  server_id: string;
  has_credential: boolean;
}

// ── User credentials (OAuth2) ────────────────────────────────────────────────

export interface MCPOAuthUserCredentialRequest {
  access_token: string;
  refresh_token?: string | null;
  expires_in?: number | null;
  scopes?: string[] | null;
}

export interface MCPOAuthUserCredentialStatus {
  server_id: string;
  has_credential: boolean;
  expires_at?: string | null;
  is_expired?: boolean;
  connected_at?: string | null;
}

export interface MCPUserCredentialListItem {
  server_id: string;
  server_name?: string | null;
  alias?: string | null;
  credential_type: 'oauth2' | 'byok' | string;
  has_credential: boolean;
  expires_at?: string | null;
  connected_at?: string | null;
}

export type MCPUserCredentialListResponse = MCPUserCredentialListItem[];

// ── OAuth flow params ────────────────────────────────────────────────────────

export interface MCPOAuthAuthorizeParams {
  redirect_uri: string;
  client_id?: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  response_type?: string;
  scope?: string;
}

export interface MCPOAuthTokenParams {
  grant_type: string;
  code?: string;
  redirect_uri?: string;
  client_id?: string;
  client_secret?: string;
  code_verifier?: string;
  refresh_token?: string;
  scope?: string;
}

export interface MCPOAuthRegisterParams {
  client_name?: string;
  grant_types?: string[];
  response_types?: string[];
  token_endpoint_auth_method?: string;
  [key: string]: unknown;
}

export interface MCPOAuthTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  [key: string]: unknown;
}

// ── Toolsets ─────────────────────────────────────────────────────────────────

export interface MCPToolsetTool {
  server_id: string;
  tool_name: string;
}

export interface MCPToolset {
  toolset_id: string;
  toolset_name: string;
  description?: string | null;
  tools: MCPToolsetTool[];
  created_at?: ISODateString | null;
  created_by?: string | null;
  updated_at?: ISODateString | null;
  updated_by?: string | null;
  [key: string]: unknown;
}

export interface NewMCPToolsetRequest {
  toolset_name: string;
  description?: string | null;
  tools?: MCPToolsetTool[];
}

export interface UpdateMCPToolsetRequest {
  toolset_id: string;
  toolset_name?: string | null;
  description?: string | null;
  tools?: MCPToolsetTool[] | null;
}

export type MCPToolsetListResponse = MCPToolset[];
