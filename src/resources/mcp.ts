import type {
  MCPToolsListResponse,
  MCPAccessGroupsResponse,
  MCPClientIpResponse,
  MCPRegistryResponse,
  MCPOpenApiRegistryResponse,
  MCPDiscoverParams,
  MCPDiscoverResponse,
  MCPServerListParams,
  MCPServerListResponse,
  MCPServerHealthParams,
  MCPServerHealthResponse,
  MCPSubmissionsSummary,
  RejectMCPServerRequest,
  NewMCPServerRequest,
  UpdateMCPServerRequest,
  LiteLLM_MCPServerTable,
  MakeMCPServersPublicRequest,
  MakeMCPServersPublicResponse,
  MCPUserCredentialRequest,
  MCPUserCredentialResponse,
  MCPOAuthUserCredentialRequest,
  MCPOAuthUserCredentialStatus,
  MCPUserCredentialListResponse,
  MCPOAuthAuthorizeParams,
  MCPOAuthTokenParams,
  MCPOAuthRegisterParams,
  MCPOAuthTokenResponse,
  NewMCPToolsetRequest,
  UpdateMCPToolsetRequest,
  MCPToolset,
  MCPToolsetListResponse,
} from '../types/mcp';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

// ── tools ────────────────────────────────────────────────────────────────────

export class McpToolsResource {
  constructor(private request: RequestFn) {}

  /** GET /mcp/tools */
  list(options?: RequestOptions): Promise<MCPToolsListResponse> {
    return this.request<MCPToolsListResponse>({
      method: 'GET',
      path: '/mcp/tools',
      options,
    });
  }
}

// ── access groups ────────────────────────────────────────────────────────────

export class McpAccessGroupsResource {
  constructor(private request: RequestFn) {}

  /** GET /mcp/access_groups */
  list(options?: RequestOptions): Promise<MCPAccessGroupsResponse> {
    return this.request<MCPAccessGroupsResponse>({
      method: 'GET',
      path: '/mcp/access_groups',
      options,
    });
  }
}

// ── network ──────────────────────────────────────────────────────────────────

export class McpNetworkResource {
  constructor(private request: RequestFn) {}

  /** GET /mcp/network/client-ip */
  clientIp(options?: RequestOptions): Promise<MCPClientIpResponse> {
    return this.request<MCPClientIpResponse>({
      method: 'GET',
      path: '/mcp/network/client-ip',
      options,
    });
  }
}

// ── registry ─────────────────────────────────────────────────────────────────

export class McpRegistryResource {
  constructor(private request: RequestFn) {}

  /** GET /mcp/registry.json */
  json(options?: RequestOptions): Promise<MCPRegistryResponse> {
    return this.request<MCPRegistryResponse>({
      method: 'GET',
      path: '/mcp/registry.json',
      options,
    });
  }

  /** GET /mcp/openapi-registry */
  openapi(options?: RequestOptions): Promise<MCPOpenApiRegistryResponse> {
    return this.request<MCPOpenApiRegistryResponse>({
      method: 'GET',
      path: '/mcp/openapi-registry',
      options,
    });
  }

  /** GET /mcp/discover */
  discover(
    params: MCPDiscoverParams = {},
    options?: RequestOptions,
  ): Promise<MCPDiscoverResponse> {
    return this.request<MCPDiscoverResponse>({
      method: 'GET',
      path: '/mcp/discover',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }
}

// ── user credentials (top-level listing) ─────────────────────────────────────

export class McpUserCredentialsResource {
  constructor(private request: RequestFn) {}

  /** GET /mcp/user-credentials */
  list(options?: RequestOptions): Promise<MCPUserCredentialListResponse> {
    return this.request<MCPUserCredentialListResponse>({
      method: 'GET',
      path: '/mcp/user-credentials',
      options,
    });
  }
}

// ── servers ──────────────────────────────────────────────────────────────────

export class McpServersResource {
  constructor(private request: RequestFn) {}

  /** GET /mcp/server */
  list(
    params: MCPServerListParams = {},
    options?: RequestOptions,
  ): Promise<MCPServerListResponse> {
    return this.request<MCPServerListResponse>({
      method: 'GET',
      path: '/mcp/server',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** POST /mcp/server */
  add(
    params: NewMCPServerRequest,
    options?: RequestOptions,
  ): Promise<LiteLLM_MCPServerTable> {
    return this.request<LiteLLM_MCPServerTable>({
      method: 'POST',
      path: '/mcp/server',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** PUT /mcp/server */
  edit(
    params: UpdateMCPServerRequest,
    options?: RequestOptions,
  ): Promise<LiteLLM_MCPServerTable> {
    return this.request<LiteLLM_MCPServerTable>({
      method: 'PUT',
      path: '/mcp/server',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /mcp/server/health */
  health(
    params: MCPServerHealthParams = {},
    options?: RequestOptions,
  ): Promise<MCPServerHealthResponse> {
    return this.request<MCPServerHealthResponse>({
      method: 'GET',
      path: '/mcp/server/health',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** POST /mcp/server/register */
  register(
    params: NewMCPServerRequest,
    options?: RequestOptions,
  ): Promise<LiteLLM_MCPServerTable> {
    return this.request<LiteLLM_MCPServerTable>({
      method: 'POST',
      path: '/mcp/server/register',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /mcp/server/submissions */
  listSubmissions(options?: RequestOptions): Promise<MCPSubmissionsSummary> {
    return this.request<MCPSubmissionsSummary>({
      method: 'GET',
      path: '/mcp/server/submissions',
      options,
    });
  }

  /** PUT /mcp/server/{id}/approve */
  approveSubmission(
    serverId: string,
    options?: RequestOptions,
  ): Promise<LiteLLM_MCPServerTable> {
    return this.request<LiteLLM_MCPServerTable>({
      method: 'PUT',
      path: `/mcp/server/${encodeURIComponent(serverId)}/approve`,
      options,
    });
  }

  /** PUT /mcp/server/{id}/reject */
  rejectSubmission(
    serverId: string,
    params: RejectMCPServerRequest = {},
    options?: RequestOptions,
  ): Promise<LiteLLM_MCPServerTable> {
    return this.request<LiteLLM_MCPServerTable>({
      method: 'PUT',
      path: `/mcp/server/${encodeURIComponent(serverId)}/reject`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /mcp/server/{id} */
  retrieve(
    serverId: string,
    options?: RequestOptions,
  ): Promise<LiteLLM_MCPServerTable> {
    return this.request<LiteLLM_MCPServerTable>({
      method: 'GET',
      path: `/mcp/server/${encodeURIComponent(serverId)}`,
      options,
    });
  }

  /** DELETE /mcp/server/{id} */
  delete(
    serverId: string,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'DELETE',
      path: `/mcp/server/${encodeURIComponent(serverId)}`,
      options,
    });
  }

  /** POST /mcp/server/oauth/session */
  oauthSession(
    params: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'POST',
      path: '/mcp/server/oauth/session',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /mcp/server/oauth/{id}/authorize */
  oauthAuthorize(
    serverId: string,
    params: MCPOAuthAuthorizeParams,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'GET',
      path: `/mcp/server/oauth/${encodeURIComponent(serverId)}/authorize`,
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** POST /mcp/server/oauth/{id}/token */
  oauthToken(
    serverId: string,
    params: MCPOAuthTokenParams,
    options?: RequestOptions,
  ): Promise<MCPOAuthTokenResponse> {
    return this.request<MCPOAuthTokenResponse>({
      method: 'POST',
      path: `/mcp/server/oauth/${encodeURIComponent(serverId)}/token`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /mcp/server/oauth/{id}/register */
  oauthRegister(
    serverId: string,
    params: MCPOAuthRegisterParams,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'POST',
      path: `/mcp/server/oauth/${encodeURIComponent(serverId)}/register`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /mcp/server/{id}/user-credential */
  setUserCredential(
    serverId: string,
    params: MCPUserCredentialRequest,
    options?: RequestOptions,
  ): Promise<MCPUserCredentialResponse> {
    return this.request<MCPUserCredentialResponse>({
      method: 'POST',
      path: `/mcp/server/${encodeURIComponent(serverId)}/user-credential`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** DELETE /mcp/server/{id}/user-credential */
  deleteUserCredential(
    serverId: string,
    options?: RequestOptions,
  ): Promise<MCPUserCredentialResponse> {
    return this.request<MCPUserCredentialResponse>({
      method: 'DELETE',
      path: `/mcp/server/${encodeURIComponent(serverId)}/user-credential`,
      options,
    });
  }

  /** POST /mcp/server/{id}/oauth-user-credential */
  setOAuthUserCredential(
    serverId: string,
    params: MCPOAuthUserCredentialRequest,
    options?: RequestOptions,
  ): Promise<MCPOAuthUserCredentialStatus> {
    return this.request<MCPOAuthUserCredentialStatus>({
      method: 'POST',
      path: `/mcp/server/${encodeURIComponent(serverId)}/oauth-user-credential`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** DELETE /mcp/server/{id}/oauth-user-credential */
  deleteOAuthUserCredential(
    serverId: string,
    options?: RequestOptions,
  ): Promise<MCPOAuthUserCredentialStatus> {
    return this.request<MCPOAuthUserCredentialStatus>({
      method: 'DELETE',
      path: `/mcp/server/${encodeURIComponent(serverId)}/oauth-user-credential`,
      options,
    });
  }

  /** GET /mcp/server/{id}/oauth-user-credential/status */
  oauthUserCredentialStatus(
    serverId: string,
    options?: RequestOptions,
  ): Promise<MCPOAuthUserCredentialStatus> {
    return this.request<MCPOAuthUserCredentialStatus>({
      method: 'GET',
      path: `/mcp/server/${encodeURIComponent(serverId)}/oauth-user-credential/status`,
      options,
    });
  }
}

// ── toolsets ─────────────────────────────────────────────────────────────────

export class McpToolsetsResource {
  constructor(private request: RequestFn) {}

  /** POST /mcp/toolset */
  add(params: NewMCPToolsetRequest, options?: RequestOptions): Promise<MCPToolset> {
    return this.request<MCPToolset>({
      method: 'POST',
      path: '/mcp/toolset',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /mcp/toolset */
  list(options?: RequestOptions): Promise<MCPToolsetListResponse> {
    return this.request<MCPToolsetListResponse>({
      method: 'GET',
      path: '/mcp/toolset',
      options,
    });
  }

  /** GET /mcp/toolset/{id} */
  retrieve(toolsetId: string, options?: RequestOptions): Promise<MCPToolset> {
    return this.request<MCPToolset>({
      method: 'GET',
      path: `/mcp/toolset/${encodeURIComponent(toolsetId)}`,
      options,
    });
  }

  /** PUT /mcp/toolset */
  edit(params: UpdateMCPToolsetRequest, options?: RequestOptions): Promise<MCPToolset> {
    return this.request<MCPToolset>({
      method: 'PUT',
      path: '/mcp/toolset',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** DELETE /mcp/toolset/{id} */
  remove(
    toolsetId: string,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'DELETE',
      path: `/mcp/toolset/${encodeURIComponent(toolsetId)}`,
      options,
    });
  }
}

// ── top-level McpResource ────────────────────────────────────────────────────

export class McpResource {
  readonly tools: McpToolsResource;
  readonly accessGroups: McpAccessGroupsResource;
  readonly network: McpNetworkResource;
  readonly registry: McpRegistryResource;
  readonly servers: McpServersResource;
  readonly toolsets: McpToolsetsResource;
  readonly userCredentials: McpUserCredentialsResource;

  constructor(private request: RequestFn) {
    this.tools = new McpToolsResource(request);
    this.accessGroups = new McpAccessGroupsResource(request);
    this.network = new McpNetworkResource(request);
    this.registry = new McpRegistryResource(request);
    this.servers = new McpServersResource(request);
    this.toolsets = new McpToolsetsResource(request);
    this.userCredentials = new McpUserCredentialsResource(request);
  }

  /** POST /mcp/make_public */
  makePublic(
    params: MakeMCPServersPublicRequest,
    options?: RequestOptions,
  ): Promise<MakeMCPServersPublicResponse> {
    return this.request<MakeMCPServersPublicResponse>({
      method: 'POST',
      path: '/mcp/make_public',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
