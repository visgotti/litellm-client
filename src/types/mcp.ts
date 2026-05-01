import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// MCP — Model Context Protocol server management
// All paths in the SDK are mounted under `/mcp/`.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums / literal unions ───────────────────────────────────────────────────

/**
 * Transport used to talk to an MCP server.
 *
 * - `sse`: Server-Sent Events over HTTP.
 * - `http`: Plain HTTP request/response.
 * - `stdio`: Subprocess standard input / output.
 */
export type MCPTransport = 'sse' | 'http' | 'stdio';

/**
 * Authentication scheme used to call an MCP server.
 *
 * - `none`: No authentication.
 * - `api_key`: Static API key.
 * - `bearer_token`: Static bearer token.
 * - `basic`: HTTP Basic.
 * - `authorization`: Raw `Authorization` header value.
 * - `oauth2`: OAuth 2.0 flow.
 * - `aws_sigv4`: AWS Sigv4 signing.
 * - `jwt_signer`: JWT signed by LiteLLM.
 * - `token`: Generic opaque token.
 */
export type MCPAuthType =
  | 'none'
  | 'api_key'
  | 'bearer_token'
  | 'basic'
  | 'authorization'
  | 'oauth2'
  | 'aws_sigv4'
  | 'jwt_signer'
  | 'token'
  | null;

/** Approval workflow state for an MCP server submission. */
export type MCPApprovalStatus = 'pending_review' | 'active' | 'rejected';

/** MCP server health-check status. */
export type MCPHealthStatus = 'healthy' | 'unhealthy' | 'unknown';

/** OAuth2 grant flow used by an MCP server. */
export type MCPOAuth2Flow = 'client_credentials' | 'authorization_code';

// ── Shared shapes ────────────────────────────────────────────────────────────

/**
 * Credentials block for an MCP server.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface MCPCredentials {
  /** Static auth value (api key / token / authorization header). */
  auth_value?: string | null;
  /** OAuth2 client ID. */
  client_id?: string | null;
  /** OAuth2 client secret. */
  client_secret?: string | null;
  /** OAuth2 scopes. */
  scopes?: string[] | null;
  /** AWS Sigv4: access key ID. */
  aws_access_key_id?: string | null;
  /** AWS Sigv4: secret access key. */
  aws_secret_access_key?: string | null;
  /** AWS Sigv4: session token. */
  aws_session_token?: string | null;
  /** AWS Sigv4: region. */
  aws_region_name?: string | null;
  /** AWS Sigv4: service name. */
  aws_service_name?: string | null;
  /** AWS Sigv4: role to assume. */
  aws_role_name?: string | null;
  /** AWS Sigv4: session name. */
  aws_session_name?: string | null;
}

/** Free-form metadata block attached to an MCP server. */
export interface MCPInfo {
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ── Tools ────────────────────────────────────────────────────────────────────

/**
 * A tool exposed by an MCP server.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface MCPTool {
  /** Tool name (unique per server). */
  name: string;
  /** Human-readable description. */
  description?: string;
  /** JSON Schema describing the tool's input arguments. */
  inputSchema?: Record<string, unknown>;
  /** Free-form additional fields forwarded by the server. */
  [key: string]: unknown;
}

/** Response from listing tools across MCP servers. */
export interface MCPToolsListResponse {
  /** Available tools. */
  tools: MCPTool[];
}

// ── Access groups ────────────────────────────────────────────────────────────

/** Response listing distinct MCP access-group names. */
export interface MCPAccessGroupsResponse {
  /** Access group identifiers. */
  access_groups: string[];
}

// ── Network ──────────────────────────────────────────────────────────────────

/** Public IP address the proxy uses to call MCP servers (for allow-listing). */
export interface MCPClientIpResponse {
  /** Outbound IP address, or `null` when undetermined. */
  ip: string | null;
}

// ── Registry / discovery ─────────────────────────────────────────────────────

/**
 * Best-effort shape for MCP registry server entries — open via index sig.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface MCPRegistryServerEntry {
  /** Server identifier. */
  id?: string;
  /** Display name. */
  name?: string;
  /** Description. */
  description?: string;
  /** Server URL. */
  url?: string;
  /** Transport (`sse`, `http`, `stdio`). */
  transport?: string;
  /** Authentication scheme. */
  auth_type?: MCPAuthType;
  /** Free-form additional fields forwarded by the registry. */
  [key: string]: unknown;
}

/**
 * Response from `GET /mcp/registry`.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface MCPRegistryResponse {
  /** Servers in the registry. */
  servers: Array<{ server: MCPRegistryServerEntry }>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Response from `GET /mcp/openapi_registry`.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface MCPOpenApiRegistryResponse {
  /** Available OpenAPI specifications. */
  apis?: Array<{
    /** API identifier. */
    id?: string;
    /** Display name. */
    name?: string;
    /** URL to the OpenAPI document. */
    openapi_url?: string;
    /** Free-form additional fields. */
    [key: string]: unknown;
  }>;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Query parameters for `GET /mcp/discover`. */
export interface MCPDiscoverParams {
  /** Free-text search query. */
  query?: string;
  /** Restrict to a category. */
  category?: string;
}

/** Response from `GET /mcp/discover`. */
export interface MCPDiscoverResponse {
  /** Servers matching the query. */
  servers: Array<MCPRegistryServerEntry>;
  /** Distinct categories observed in the registry. */
  categories: string[];
}

// ── Server CRUD types ────────────────────────────────────────────────────────

/**
 * Common fields on MCP server create / update payloads.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface MCPServerBase {
  /** Display name. */
  server_name?: string | null;
  /** Routing alias used in client-facing URLs. */
  alias?: string | null;
  /** Description shown in UI / discovery. */
  description?: string | null;
  /** Transport used to communicate with the server. */
  transport?: MCPTransport;
  /** Authentication scheme. */
  auth_type?: MCPAuthType;
  /** Credentials block. */
  credentials?: MCPCredentials | null;
  /** Server URL (HTTP/SSE transports). */
  url?: string | null;
  /** Path to a config / spec file the server expects. */
  spec_path?: string | null;
  /** Free-form metadata about the server. */
  mcp_info?: MCPInfo | null;
  /** Access-group names this server belongs to. */
  mcp_access_groups?: string[];
  /** When set, only these tool names are exposed. */
  allowed_tools?: string[] | null;
  /** Map from tool name to display name. */
  tool_name_to_display_name?: Record<string, string> | null;
  /** Map from tool name to description. */
  tool_name_to_description?: Record<string, string> | null;
  /** Header names allowed to be forwarded from the client. */
  extra_headers?: string[] | null;
  /** Static headers always sent to the server. */
  static_headers?: Record<string, string> | null;
  /** System-prompt-style instructions surfaced to clients. */
  instructions?: string | null;
  /** Stdio transport: command to spawn. */
  command?: string | null;
  /** Stdio transport: arguments. */
  args?: string[];
  /** Stdio transport: environment variables. */
  env?: Record<string, string>;
  /** OAuth2: authorization endpoint URL. */
  authorization_url?: string | null;
  /** OAuth2: token endpoint URL. */
  token_url?: string | null;
  /** OAuth2: dynamic client registration endpoint URL. */
  registration_url?: string | null;
  /** Allow all proxy keys to access this server. */
  allow_all_keys?: boolean;
  /** Server is reachable from the public internet. */
  available_on_public_internet?: boolean;
  /** Server uses bring-your-own-key authentication. */
  is_byok?: boolean;
  /** BYOK setup instructions shown to the user. */
  byok_description?: string[];
  /** Help URL for obtaining the BYOK API key. */
  byok_api_key_help_url?: string | null;
  /** Source URL where the server was discovered. */
  source_url?: string | null;
}

/**
 * Body for `POST /mcp/server`.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface NewMCPServerRequest extends MCPServerBase {
  /** Optional caller-supplied server ID. */
  server_id?: string | null;
  /** OAuth2 grant flow. */
  oauth2_flow?: MCPOAuth2Flow | null;
  /** Approval state (server-managed; values are overridden by the proxy). */
  approval_status?: MCPApprovalStatus | null;
  /** Identifier of the user that submitted the server. */
  submitted_by?: string | null;
  /** ISO-8601 submission timestamp. */
  submitted_at?: ISODateString | null;
}

/**
 * Body for `PATCH /mcp/server`.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface UpdateMCPServerRequest extends MCPServerBase {
  /** Server identifier (required). */
  server_id: string;
}

/**
 * Full server row as stored on the proxy and returned from server endpoints.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface LiteLLM_MCPServerTable {
  /** Unique server identifier. */
  server_id: string;
  /** Display name. */
  server_name?: string | null;
  /** Routing alias used in client-facing URLs. */
  alias?: string | null;
  /** Description shown in UI / discovery. */
  description?: string | null;
  /** Server URL (HTTP/SSE transports). */
  url?: string | null;
  /** Path to a config / spec file the server expects. */
  spec_path?: string | null;
  /** Transport used to communicate with the server. */
  transport: MCPTransport;
  /** Authentication scheme. */
  auth_type?: MCPAuthType;
  /** Credentials block. */
  credentials?: MCPCredentials | null;
  /** Instructions surfaced to clients. */
  instructions?: string | null;
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString | null;
  /** Identifier of the creating user. */
  created_by?: string | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString | null;
  /** Identifier of the user that last updated the server. */
  updated_by?: string | null;
  /** Teams that have access to this server. */
  teams?: Array<{
    /** Team identifier. */
    team_id: string;
    /** Display alias of the team. */
    team_alias?: string | null;
    /** Free-form additional fields. */
    [key: string]: unknown;
  }>;
  /** Access-group names this server belongs to. */
  mcp_access_groups?: string[];
  /** Tool names exposed by this server. */
  allowed_tools?: string[];
  /** Map from tool name to display name. */
  tool_name_to_display_name?: Record<string, string> | null;
  /** Map from tool name to description. */
  tool_name_to_description?: Record<string, string> | null;
  /** Header names allowed to be forwarded from the client. */
  extra_headers?: string[];
  /** Free-form metadata about the server. */
  mcp_info?: MCPInfo | null;
  /** Static headers always sent to the server. */
  static_headers?: Record<string, string> | null;
  /** Most recent health status. */
  status?: MCPHealthStatus;
  /** ISO-8601 timestamp of the last health probe. */
  last_health_check?: ISODateString | null;
  /** Error reported by the last health probe. */
  health_check_error?: string | null;
  /** Stdio transport: command to spawn. */
  command?: string | null;
  /** Stdio transport: arguments. */
  args?: string[];
  /** Stdio transport: environment variables. */
  env?: Record<string, string>;
  /** OAuth2: authorization endpoint URL. */
  authorization_url?: string | null;
  /** OAuth2: token endpoint URL. */
  token_url?: string | null;
  /** OAuth2: dynamic client registration endpoint URL. */
  registration_url?: string | null;
  /** Allow all proxy keys to access this server. */
  allow_all_keys?: boolean;
  /** Server is reachable from the public internet. */
  available_on_public_internet?: boolean;
  /** Server uses bring-your-own-key authentication. */
  is_byok?: boolean;
  /** BYOK setup instructions shown to the user. */
  byok_description?: string[];
  /** Help URL for obtaining the BYOK API key. */
  byok_api_key_help_url?: string | null;
  /** Whether the calling user has BYOK credentials configured. */
  has_user_credential?: boolean | null;
  /** Source URL where the server was discovered. */
  source_url?: string | null;
  /** Approval state. */
  approval_status?: MCPApprovalStatus | null;
  /** Identifier of the submitting user. */
  submitted_by?: string | null;
  /** ISO-8601 submission timestamp. */
  submitted_at?: ISODateString | null;
  /** ISO-8601 review timestamp. */
  reviewed_at?: ISODateString | null;
  /** Reviewer's notes. */
  review_notes?: string | null;
  /** Free-form additional fields forwarded by the server. */
  [key: string]: unknown;
}

/** Query parameters for `GET /mcp/server`. */
export interface MCPServerListParams {
  /** Filter to servers accessible by this team. */
  team_id?: string;
}

export type MCPServerListResponse = LiteLLM_MCPServerTable[];

/** Body for `POST /mcp/server/health` — probe specific servers. */
export interface MCPServerHealthParams {
  /** Servers to probe. */
  server_ids?: string[];
}

/** One server's health-probe result. */
export interface MCPServerHealthEntry {
  /** Server identifier. */
  server_id: string;
  /** Health status; `null` when the probe is inconclusive. */
  status: MCPHealthStatus | null;
}

export type MCPServerHealthResponse = MCPServerHealthEntry[];

// ── Submissions ──────────────────────────────────────────────────────────────

/**
 * Aggregate summary of MCP server submissions.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface MCPSubmissionsSummary {
  /** Total submissions. */
  total: number;
  /** Submissions awaiting review. */
  pending_review: number;
  /** Approved (active) submissions. */
  active: number;
  /** Rejected submissions. */
  rejected: number;
  /** Submission rows. */
  items: LiteLLM_MCPServerTable[];
}

/** Body for `POST /mcp/server/{server_id}/reject`. */
export interface RejectMCPServerRequest {
  /** Optional notes shown to the submitter. */
  review_notes?: string | null;
}

// ── make_public ──────────────────────────────────────────────────────────────

/** Body for `POST /mcp/server/make_public`. */
export interface MakeMCPServersPublicRequest {
  /** IDs of servers to make public. */
  mcp_server_ids: string[];
}

/** Response from `POST /mcp/server/make_public`. */
export interface MakeMCPServersPublicResponse {
  /** Human-readable status. */
  message: string;
  /** IDs of servers now marked public. */
  public_mcp_servers: string[];
  /** Identifier of the user that performed the change. */
  updated_by: string | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ── User credentials (BYOK) ──────────────────────────────────────────────────

/** Body for storing a BYOK credential against an MCP server. */
export interface MCPUserCredentialRequest {
  /** Credential value (API key / token). */
  credential: string;
  /** Persist the credential server-side instead of using it once. */
  save?: boolean;
}

/** Response after storing a BYOK credential. */
export interface MCPUserCredentialResponse {
  /** Server the credential applies to. */
  server_id: string;
  /** Whether a credential is now stored. */
  has_credential: boolean;
}

// ── User credentials (OAuth2) ────────────────────────────────────────────────

/** Body for storing an OAuth2 user credential. */
export interface MCPOAuthUserCredentialRequest {
  /** OAuth2 access token. */
  access_token: string;
  /** OAuth2 refresh token. */
  refresh_token?: string | null;
  /** Lifetime (seconds) of the access token. */
  expires_in?: number | null;
  /** Granted scopes. */
  scopes?: string[] | null;
}

/** Status of an OAuth2 user credential against a server. */
export interface MCPOAuthUserCredentialStatus {
  /** Server the credential applies to. */
  server_id: string;
  /** Whether a credential is currently stored. */
  has_credential: boolean;
  /** ISO-8601 expiry timestamp. */
  expires_at?: string | null;
  /** Whether the stored credential has expired. */
  is_expired?: boolean;
  /** ISO-8601 timestamp the credential was first connected. */
  connected_at?: string | null;
}

/** One row in the user-credential listing across all MCP servers. */
export interface MCPUserCredentialListItem {
  /** Server the credential applies to. */
  server_id: string;
  /** Display name of the server. */
  server_name?: string | null;
  /** Routing alias of the server. */
  alias?: string | null;
  /** Credential type. */
  credential_type: 'oauth2' | 'byok' | string;
  /** Whether a credential is stored. */
  has_credential: boolean;
  /** ISO-8601 expiry timestamp. */
  expires_at?: string | null;
  /** ISO-8601 timestamp the credential was first connected. */
  connected_at?: string | null;
}

export type MCPUserCredentialListResponse = MCPUserCredentialListItem[];

// ── OAuth flow params ────────────────────────────────────────────────────────

/** Query parameters for the OAuth2 authorize redirect. */
export interface MCPOAuthAuthorizeParams {
  /** OAuth2 redirect URI. */
  redirect_uri: string;
  /** OAuth2 client ID. */
  client_id?: string;
  /** Opaque CSRF / state value. */
  state?: string;
  /** PKCE code challenge. */
  code_challenge?: string;
  /** PKCE code challenge method (`'S256'` etc.). */
  code_challenge_method?: string;
  /** OAuth2 response type (`'code'` etc.). */
  response_type?: string;
  /** OAuth2 scopes. */
  scope?: string;
}

/** Body / form for the OAuth2 token endpoint. */
export interface MCPOAuthTokenParams {
  /** OAuth2 grant type (`'authorization_code'` etc.). */
  grant_type: string;
  /** Authorization code (authorization_code grant). */
  code?: string;
  /** OAuth2 redirect URI. */
  redirect_uri?: string;
  /** OAuth2 client ID. */
  client_id?: string;
  /** OAuth2 client secret. */
  client_secret?: string;
  /** PKCE code verifier. */
  code_verifier?: string;
  /** Refresh token (refresh_token grant). */
  refresh_token?: string;
  /** OAuth2 scopes. */
  scope?: string;
}

/** Body for OAuth2 dynamic client registration. */
export interface MCPOAuthRegisterParams {
  /** Client display name. */
  client_name?: string;
  /** Allowed grant types. */
  grant_types?: string[];
  /** Allowed response types. */
  response_types?: string[];
  /** Auth method used at the token endpoint. */
  token_endpoint_auth_method?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from the OAuth2 token endpoint. */
export interface MCPOAuthTokenResponse {
  /** OAuth2 access token. */
  access_token?: string;
  /** Token type (typically `'Bearer'`). */
  token_type?: string;
  /** Lifetime (seconds) of the access token. */
  expires_in?: number;
  /** Refresh token. */
  refresh_token?: string;
  /** Granted scopes. */
  scope?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ── Toolsets ─────────────────────────────────────────────────────────────────

/**
 * A single tool reference inside a toolset.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface MCPToolsetTool {
  /** ID of the MCP server hosting the tool. */
  server_id: string;
  /** Tool name. */
  tool_name: string;
}

/**
 * A named bundle of MCP tools.
 *
 * @see https://docs.litellm.ai/docs/mcp
 */
export interface MCPToolset {
  /** Unique identifier. */
  toolset_id: string;
  /** Display name. */
  toolset_name: string;
  /** Description. */
  description?: string | null;
  /** Tools in the bundle. */
  tools: MCPToolsetTool[];
  /** ISO-8601 creation timestamp. */
  created_at?: ISODateString | null;
  /** Identifier of the creating user. */
  created_by?: string | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: ISODateString | null;
  /** Identifier of the user that last updated the toolset. */
  updated_by?: string | null;
  /** Free-form additional fields forwarded by the server. */
  [key: string]: unknown;
}

/** Body for `POST /mcp/toolset`. */
export interface NewMCPToolsetRequest {
  /** Display name. */
  toolset_name: string;
  /** Description. */
  description?: string | null;
  /** Tools in the bundle. */
  tools?: MCPToolsetTool[];
}

/** Body for `PATCH /mcp/toolset`. */
export interface UpdateMCPToolsetRequest {
  /** Toolset identifier (required). */
  toolset_id: string;
  /** Updated display name. */
  toolset_name?: string | null;
  /** Updated description. */
  description?: string | null;
  /** Replacement tool list (or `null` to clear). */
  tools?: MCPToolsetTool[] | null;
}

export type MCPToolsetListResponse = MCPToolset[];

/**
 * Body accepted by the JSON-RPC style MCP protocol endpoint exposed under
 * `/{server_id}/mcp`. The proxy forwards the body verbatim to the upstream
 * MCP server, so the shape is whatever the upstream expects (typically a
 * JSON-RPC request envelope).
 */
export type MCPProtocolRequestBody = Record<string, unknown>;

/**
 * Generic shape returned by proxied MCP protocol endpoints. The proxy passes
 * the upstream response through, so the exact shape depends on the upstream
 * server.
 */
export type MCPProtocolResponse = Record<string, unknown>;

/**
 * Streaming chunk emitted on `text/event-stream` POST /{server_id}/mcp.
 * Each chunk is a parsed JSON-RPC frame produced by the upstream MCP server.
 */
export type MCPProtocolStreamEvent = Record<string, unknown>;

/**
 * Query parameters for the OAuth2 authorize endpoint proxied per server at
 * `GET /{server_id}/authorize`.
 */
export interface MCPProtocolAuthorizeParams {
  redirect_uri: string;
  client_id?: string | null;
  state?: string;
  code_challenge?: string | null;
  code_challenge_method?: string | null;
  response_type?: string | null;
  scope?: string | null;
}

/**
 * Body posted to the dynamic-client-registration endpoint proxied per server
 * at `POST /{server_id}/register`. Matches RFC 7591 client metadata.
 */
export interface MCPProtocolRegisterParams {
  client_name?: string;
  redirect_uris?: string[];
  grant_types?: string[];
  response_types?: string[];
  token_endpoint_auth_method?: string;
  scope?: string;
  [key: string]: unknown;
}

/**
 * Body posted to the OAuth2 token endpoint proxied per server at
 * `POST /{server_id}/token`. Sent as
 * `application/x-www-form-urlencoded` per RFC 6749.
 */
export interface MCPProtocolTokenParams {
  grant_type: string;
  code?: string;
  redirect_uri?: string;
  client_id?: string;
  client_secret?: string;
  code_verifier?: string;
  refresh_token?: string;
  scope?: string;
  [key: string]: string | undefined;
}

/** Token response (mirrors MCPOAuthTokenResponse but scoped to the proxy route). */
export type MCPProtocolTokenResponse = MCPOAuthTokenResponse;

/** Generic register response (the upstream IdP determines the shape). */
export type MCPProtocolRegisterResponse = Record<string, unknown>;

/** Generic authorize response (typically a redirect or an HTML page). */
export type MCPProtocolAuthorizeResponse = Record<string, unknown>;

// ── Proxied OpenAI-compatible files & batches under a server prefix ──────────

/**
 * Query params for `GET /{server_id}/v1/files`.
 */
export interface MCPProtocolFileListParams {
  purpose?: string;
  target_model_names?: string;
}

/**
 * Body for `POST /{server_id}/v1/files`. The proxy expects multipart form data
 * matching the OpenAI Files API; this interface describes the high-level
 * fields a SDK caller provides before the form is built.
 */
export interface MCPProtocolFileCreateParams {
  file: ArrayBuffer | Uint8Array | Blob | string;
  filename: string;
  purpose: string;
  contentType?: string;
}

/**
 * Query params for `GET /{server_id}/v1/batches`.
 */
export interface MCPProtocolBatchListParams {
  after?: string;
  limit?: number;
  target_model_names?: string;
}

/**
 * Body for `POST /{server_id}/v1/batches`.
 */
export interface MCPProtocolBatchCreateParams {
  input_file_id: string;
  endpoint: string;
  completion_window: string;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}
