// ─────────────────────────────────────────────────────────────────────────────
// Discovery / well-known endpoints
//
// These cover the set of metadata endpoints the LiteLLM proxy exposes for
// OAuth, OpenID Connect, JWKS, A2A agent cards and SSO readiness probes.
// Most responses follow the relevant RFC / OIDC spec but include a permissive
// index signature because the proxy may attach additional fields.
// ─────────────────────────────────────────────────────────────────────────────

/** RFC 7517 — JSON Web Key Set. */
export interface JWKSResponse {
  keys: JWK[];
  [key: string]: unknown;
}

/** A single JSON Web Key (loosely typed since algorithms vary). */
export interface JWK {
  kty?: string;
  use?: string;
  kid?: string;
  alg?: string;
  n?: string;
  e?: string;
  x5c?: string[];
  x5t?: string;
  [key: string]: unknown;
}

/** RFC 8414 — OAuth 2.0 Authorization Server Metadata. */
export interface OAuthAuthorizationServerMetadata {
  issuer: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  registration_endpoint?: string;
  scopes_supported?: string[];
  response_types_supported?: string[];
  grant_types_supported?: string[];
  code_challenge_methods_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  [key: string]: unknown;
}

/** RFC 9728 — OAuth 2.0 Protected Resource Metadata. */
export interface OAuthProtectedResourceMetadata {
  resource: string;
  authorization_servers?: string[];
  scopes_supported?: string[];
  bearer_methods_supported?: string[];
  [key: string]: unknown;
}

/** OIDC Discovery — `/.well-known/openid-configuration`. */
export interface OpenIDConfigurationResponse {
  issuer: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
  registration_endpoint?: string;
  scopes_supported?: string[];
  response_types_supported?: string[];
  grant_types_supported?: string[];
  subject_types_supported?: string[];
  id_token_signing_alg_values_supported?: string[];
  [key: string]: unknown;
}

/** A2A spec — agent card returned at `/a2a/{agent_id}/.well-known/agent.json`. */
export interface AgentCardResponse {
  name?: string;
  description?: string;
  url?: string;
  version?: string;
  capabilities?: Record<string, unknown>;
  skills?: unknown[];
  [key: string]: unknown;
}

/** SSO readiness probe response. */
export interface SSOReadinessResponse {
  status: string;
  sso_configured: boolean;
  message?: string;
  [key: string]: unknown;
}

/**
 * Query parameters accepted by `GET /authorize`.
 * `redirect_uri` is required by the proxy's MCP OAuth flow.
 */
export interface OAuthAuthorizeParams {
  redirect_uri: string;
  client_id?: string;
  state?: string;
  mcp_server_name?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  response_type?: string;
  scope?: string;
}

/**
 * Body parameters for `POST /token`.
 *
 * The proxy speaks RFC 6749 form-urlencoded, so the SDK serializes these
 * fields using `application/x-www-form-urlencoded`.
 */
export interface OAuthTokenParams {
  grant_type: string;
  client_id: string;
  code?: string;
  redirect_uri?: string;
  client_secret?: string;
  code_verifier?: string;
  refresh_token?: string;
  scope?: string;
  /** Optional MCP server scoping (passed as a query string parameter). */
  mcp_server_name?: string;
}

/** Successful OAuth token response (RFC 6749 §5.1). */
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
  [key: string]: unknown;
}
