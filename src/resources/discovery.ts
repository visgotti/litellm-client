import type {
  AgentCardResponse,
  JWKSResponse,
  OAuthAuthorizationServerMetadata,
  OAuthAuthorizeParams,
  OAuthProtectedResourceMetadata,
  OAuthTokenParams,
  OAuthTokenResponse,
  OpenIDConfigurationResponse,
  SSOReadinessResponse,
} from '../types/discovery';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Discovery / well-known endpoints — JWKS, OAuth metadata, OIDC, SSO readiness,
 * A2A agent cards and the OAuth authorize / token flow.
 */
export class DiscoveryResource {
  constructor(private request: RequestFn) {}

  /** RFC 7517 — `GET /.well-known/jwks.json`. */
  async jwks(options?: RequestOptions): Promise<JWKSResponse> {
    return this.request<JWKSResponse>({
      method: 'GET',
      path: '/.well-known/jwks.json',
      options,
    });
  }

  /**
   * RFC 8414 — OAuth 2.0 Authorization Server Metadata.
   * `GET /.well-known/oauth-authorization-server` (or `/{server_id}` variant).
   */
  async oauthAuthorizationServer(
    serverId?: string,
    options?: RequestOptions,
  ): Promise<OAuthAuthorizationServerMetadata> {
    const path =
      serverId !== undefined
        ? `/.well-known/oauth-authorization-server/${encodeURIComponent(serverId)}`
        : '/.well-known/oauth-authorization-server';
    return this.request<OAuthAuthorizationServerMetadata>({
      method: 'GET',
      path,
      options,
    });
  }

  /**
   * Authorization server metadata for an MCP server addressed by its
   * server id: `GET /.well-known/oauth-authorization-server/{server_id}/mcp`.
   */
  async oauthAuthorizationServerMcp(
    serverId: string,
    options?: RequestOptions,
  ): Promise<OAuthAuthorizationServerMetadata> {
    return this.request<OAuthAuthorizationServerMetadata>({
      method: 'GET',
      path: `/.well-known/oauth-authorization-server/${encodeURIComponent(serverId)}/mcp`,
      options,
    });
  }

  /**
   * Authorization server metadata addressed by MCP id (the MCP-first variant):
   * `GET /.well-known/oauth-authorization-server/mcp/{mcp_id}`.
   */
  async oauthAuthorizationServerForMcp(
    mcpId: string,
    options?: RequestOptions,
  ): Promise<OAuthAuthorizationServerMetadata> {
    return this.request<OAuthAuthorizationServerMetadata>({
      method: 'GET',
      path: `/.well-known/oauth-authorization-server/mcp/${encodeURIComponent(mcpId)}`,
      options,
    });
  }

  /**
   * RFC 9728 — OAuth 2.0 Protected Resource Metadata.
   * `GET /.well-known/oauth-protected-resource` (or `/{server_id}` variant).
   */
  async oauthProtectedResource(
    serverId?: string,
    options?: RequestOptions,
  ): Promise<OAuthProtectedResourceMetadata> {
    const path =
      serverId !== undefined
        ? `/.well-known/oauth-protected-resource/${encodeURIComponent(serverId)}`
        : '/.well-known/oauth-protected-resource';
    return this.request<OAuthProtectedResourceMetadata>({
      method: 'GET',
      path,
      options,
    });
  }

  /**
   * Protected resource metadata for an MCP server addressed by server id:
   * `GET /.well-known/oauth-protected-resource/{server_id}/mcp`.
   */
  async oauthProtectedResourceMcp(
    serverId: string,
    options?: RequestOptions,
  ): Promise<OAuthProtectedResourceMetadata> {
    return this.request<OAuthProtectedResourceMetadata>({
      method: 'GET',
      path: `/.well-known/oauth-protected-resource/${encodeURIComponent(serverId)}/mcp`,
      options,
    });
  }

  /**
   * Protected resource metadata addressed by MCP id:
   * `GET /.well-known/oauth-protected-resource/mcp/{mcp_id}`.
   */
  async oauthProtectedResourceForMcp(
    mcpId: string,
    options?: RequestOptions,
  ): Promise<OAuthProtectedResourceMetadata> {
    return this.request<OAuthProtectedResourceMetadata>({
      method: 'GET',
      path: `/.well-known/oauth-protected-resource/mcp/${encodeURIComponent(mcpId)}`,
      options,
    });
  }

  /** OIDC discovery — `GET /.well-known/openid-configuration`. */
  async openidConfiguration(options?: RequestOptions): Promise<OpenIDConfigurationResponse> {
    return this.request<OpenIDConfigurationResponse>({
      method: 'GET',
      path: '/.well-known/openid-configuration',
      options,
    });
  }

  /** A2A agent card — `GET /a2a/{agent_id}/.well-known/agent.json`. */
  async agentCard(agentId: string, options?: RequestOptions): Promise<AgentCardResponse> {
    return this.request<AgentCardResponse>({
      method: 'GET',
      path: `/a2a/${encodeURIComponent(agentId)}/.well-known/agent.json`,
      options,
    });
  }

  /** SSO readiness probe — `GET /sso/readiness`. */
  async ssoReadiness(options?: RequestOptions): Promise<SSOReadinessResponse> {
    return this.request<SSOReadinessResponse>({
      method: 'GET',
      path: '/sso/readiness',
      options,
    });
  }

  /**
   * `GET /robots.txt`.
   *
   * The proxy responds with `text/plain` when configured. The SDK still
   * decodes the response as JSON because the underlying transport is JSON-only;
   * if you need the raw text, use `fetch(`${baseUrl}/robots.txt`)` directly.
   */
  async robotsTxt(options?: RequestOptions): Promise<unknown> {
    return this.request<unknown>({
      method: 'GET',
      path: '/robots.txt',
      options,
    });
  }

  /**
   * `GET /authorize` — RFC 6749 §4.1.1 OAuth 2.0 authorization request.
   *
   * The proxy returns either a redirect or a 4xx error; this method returns
   * whatever JSON the server responds with for typed-error inspection.
   */
  async oauthAuthorize(
    params?: OAuthAuthorizeParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request<unknown>({
      method: 'GET',
      path: '/authorize',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...(params ?? {}) } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * `POST /token` — RFC 6749 §3.2 token endpoint.
   *
   * The proxy expects `application/x-www-form-urlencoded`, so the body is
   * encoded with `URLSearchParams`. `mcp_server_name`, when supplied, is sent
   * as a query string parameter (per the proxy's OpenAPI schema).
   */
  async oauthToken(
    params: OAuthTokenParams,
    options?: RequestOptions,
  ): Promise<OAuthTokenResponse> {
    const { mcp_server_name, ...formFields } = params;
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(formFields)) {
      if (v !== undefined && v !== null) search.set(k, String(v));
    }
    const query: Record<string, string | number | boolean | undefined | null> = {
      ...(options?.query ?? {}),
    };
    if (mcp_server_name !== undefined) {
      query.mcp_server_name = mcp_server_name;
    }
    return this.request<OAuthTokenResponse>({
      method: 'POST',
      path: '/token',
      body: {
        kind: 'text',
        value: search.toString(),
        contentType: 'application/x-www-form-urlencoded',
      },
      options: {
        ...(options ?? {}),
        query,
      },
    });
  }
}
