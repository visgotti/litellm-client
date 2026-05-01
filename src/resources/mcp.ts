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
  MCPProtocolRequestBody,
  MCPProtocolResponse,
  MCPProtocolStreamEvent,
  MCPProtocolAuthorizeParams,
  MCPProtocolAuthorizeResponse,
  MCPProtocolRegisterParams,
  MCPProtocolRegisterResponse,
  MCPProtocolTokenParams,
  MCPProtocolTokenResponse,
  MCPProtocolFileListParams,
  MCPProtocolFileCreateParams,
  MCPProtocolBatchListParams,
  MCPProtocolBatchCreateParams,
} from '../types/mcp';
import type { FileObject, FileListResponse, FileDeleteResponse } from '../types/files';
import type { BatchObject, BatchListResponse } from '../types/batches';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import type { Stream } from '../streaming';

// ── tools ────────────────────────────────────────────────────────────────────

export class McpToolsResource {
  constructor(private request: RequestFn) {}

  /**
   * List all MCP tools exposed by registered MCP servers.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The aggregated tool list.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * List MCP access groups configured on the proxy.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The full set of access groups.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Return the client IP as observed by the proxy (useful for IP-allowlisted MCP servers).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The detected client IP.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Fetch the MCP registry document (`registry.json`) describing available servers.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The MCP registry payload.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
  json(options?: RequestOptions): Promise<MCPRegistryResponse> {
    return this.request<MCPRegistryResponse>({
      method: 'GET',
      path: '/mcp/registry.json',
      options,
    });
  }

  /**
   * Fetch the OpenAPI-flavoured registry document for MCP servers.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The OpenAPI-formatted registry response.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
  openapi(options?: RequestOptions): Promise<MCPOpenApiRegistryResponse> {
    return this.request<MCPOpenApiRegistryResponse>({
      method: 'GET',
      path: '/mcp/openapi-registry',
      options,
    });
  }

  /**
   * Discover MCP servers and their tools via the proxy's discovery endpoint.
   *
   * @param params - Optional discovery filters forwarded as query string entries.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The discovery response.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * List MCP user credentials stored across all servers for the current caller.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The aggregated user credential list.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
  list(options?: RequestOptions): Promise<MCPUserCredentialListResponse> {
    return this.request<MCPUserCredentialListResponse>({
      method: 'GET',
      path: '/mcp/user-credentials',
      options,
    });
  }
}

// ── servers ──────────────────────────────────────────────────────────────────

export class McpServerProtocolResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  /** POST /{serverId}/mcp */
  mcp(
    serverId: string,
    body: MCPProtocolRequestBody = {},
    options?: RequestOptions,
  ): Promise<MCPProtocolResponse> {
    return this.request<MCPProtocolResponse>({
      method: 'POST',
      path: `/${encodeURIComponent(serverId)}/mcp`,
      body: { kind: 'json', value: body },
      options,
    });
  }

  /**
   * Streaming POST /{serverId}/mcp with `Accept: text/event-stream`.
   * Returns a {@link Stream} of MCP protocol events.
   */
  mcpStream(
    serverId: string,
    body: MCPProtocolRequestBody = {},
    options?: RequestOptions,
  ): Promise<Stream<MCPProtocolStreamEvent>> {
    const headers: Record<string, string> = {
      ...(options?.headers ?? {}),
      accept: 'text/event-stream',
    };
    return this.streamRequest<MCPProtocolStreamEvent>({
      method: 'POST',
      path: `/${encodeURIComponent(serverId)}/mcp`,
      body: { kind: 'json', value: body },
      options: { ...(options ?? {}), headers },
    });
  }

  /** GET /{serverId}/mcp */
  getMcp(serverId: string, options?: RequestOptions): Promise<MCPProtocolResponse> {
    return this.request<MCPProtocolResponse>({
      method: 'GET',
      path: `/${encodeURIComponent(serverId)}/mcp`,
      options,
    });
  }

  /** DELETE /{serverId}/mcp */
  deleteMcp(serverId: string, options?: RequestOptions): Promise<MCPProtocolResponse> {
    return this.request<MCPProtocolResponse>({
      method: 'DELETE',
      path: `/${encodeURIComponent(serverId)}/mcp`,
      options,
    });
  }

  /** PATCH /{serverId}/mcp */
  patchMcp(
    serverId: string,
    body: MCPProtocolRequestBody,
    options?: RequestOptions,
  ): Promise<MCPProtocolResponse> {
    return this.request<MCPProtocolResponse>({
      method: 'PATCH',
      path: `/${encodeURIComponent(serverId)}/mcp`,
      body: { kind: 'json', value: body },
      options,
    });
  }

  /** PUT /{serverId}/mcp */
  putMcp(
    serverId: string,
    body: MCPProtocolRequestBody,
    options?: RequestOptions,
  ): Promise<MCPProtocolResponse> {
    return this.request<MCPProtocolResponse>({
      method: 'PUT',
      path: `/${encodeURIComponent(serverId)}/mcp`,
      body: { kind: 'json', value: body },
      options,
    });
  }

  /** GET /{serverId}/authorize */
  authorize(
    serverId: string,
    params: MCPProtocolAuthorizeParams = {} as MCPProtocolAuthorizeParams,
    options?: RequestOptions,
  ): Promise<MCPProtocolAuthorizeResponse> {
    return this.request<MCPProtocolAuthorizeResponse>({
      method: 'GET',
      path: `/${encodeURIComponent(serverId)}/authorize`,
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** POST /{serverId}/register */
  register(
    serverId: string,
    params: MCPProtocolRegisterParams = {},
    options?: RequestOptions,
  ): Promise<MCPProtocolRegisterResponse> {
    return this.request<MCPProtocolRegisterResponse>({
      method: 'POST',
      path: `/${encodeURIComponent(serverId)}/register`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * `POST /v1/mcp/server/oauth/session` — initiate or refresh an MCP OAuth
   * session via the v1-prefixed route. The non-v1 alias lives on
   * `mcp.servers.oauthSession`.
   *
   * @param params - Provider-specific OAuth session payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The OAuth session response from the proxy.
   */
  oauthSessionV1(
    params: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'POST',
      path: '/v1/mcp/server/oauth/session',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * POST /{serverId}/token
   *
   * Per RFC 6749, the token endpoint requires
   * `application/x-www-form-urlencoded`. The SDK builds the form body for you.
   */
  token(
    serverId: string,
    params: MCPProtocolTokenParams = {} as MCPProtocolTokenParams,
    options?: RequestOptions,
  ): Promise<MCPProtocolTokenResponse> {
    const form = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      form.append(k, String(v));
    }
    const encoded = new TextEncoder().encode(form.toString());
    return this.request<MCPProtocolTokenResponse>({
      method: 'POST',
      path: `/${encodeURIComponent(serverId)}/token`,
      body: {
        kind: 'binary',
        value: encoded,
        contentType: 'application/x-www-form-urlencoded',
      },
      options,
    });
  }

  // ── proxied OpenAI files surface ──────────────────────────────────────────

  /** GET /{serverId}/v1/files */
  listFiles(
    serverId: string,
    params: MCPProtocolFileListParams = {},
    options?: RequestOptions,
  ): Promise<FileListResponse> {
    return this.request<FileListResponse>({
      method: 'GET',
      path: `/${encodeURIComponent(serverId)}/v1/files`,
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * POST /{serverId}/v1/files
   *
   * Sends `multipart/form-data` matching the OpenAI Files API.
   */
  createFile(
    serverId: string,
    body: MCPProtocolFileCreateParams,
    options?: RequestOptions,
  ): Promise<FileObject> {
    const form = new FormData();
    const blob =
      body.file instanceof Blob
        ? body.file
        : new Blob(
            [
              typeof body.file === 'string'
                ? body.file
                : body.file instanceof Uint8Array
                  ? new Uint8Array(body.file)
                  : new Uint8Array(body.file),
            ],
            body.contentType ? { type: body.contentType } : undefined,
          );
    form.append('file', blob, body.filename);
    form.append('purpose', body.purpose);
    return this.request<FileObject>({
      method: 'POST',
      path: `/${encodeURIComponent(serverId)}/v1/files`,
      body: { kind: 'form', value: form },
      options,
    });
  }

  /** GET /{serverId}/v1/files/{fileId} */
  retrieveFile(
    serverId: string,
    fileId: string,
    options?: RequestOptions,
  ): Promise<FileObject> {
    return this.request<FileObject>({
      method: 'GET',
      path: `/${encodeURIComponent(serverId)}/v1/files/${encodeURIComponent(fileId)}`,
      options,
    });
  }

  /** DELETE /{serverId}/v1/files/{fileId} */
  deleteFile(
    serverId: string,
    fileId: string,
    options?: RequestOptions,
  ): Promise<FileDeleteResponse> {
    return this.request<FileDeleteResponse>({
      method: 'DELETE',
      path: `/${encodeURIComponent(serverId)}/v1/files/${encodeURIComponent(fileId)}`,
      options,
    });
  }

  /** GET /{serverId}/v1/files/{fileId}/content */
  fileContent(
    serverId: string,
    fileId: string,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request<unknown>({
      method: 'GET',
      path: `/${encodeURIComponent(serverId)}/v1/files/${encodeURIComponent(fileId)}/content`,
      options,
    });
  }

  // ── proxied OpenAI batches surface ────────────────────────────────────────

  /** GET /{serverId}/v1/batches */
  listBatches(
    serverId: string,
    params: MCPProtocolBatchListParams = {},
    options?: RequestOptions,
  ): Promise<BatchListResponse> {
    return this.request<BatchListResponse>({
      method: 'GET',
      path: `/${encodeURIComponent(serverId)}/v1/batches`,
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** POST /{serverId}/v1/batches */
  createBatch(
    serverId: string,
    body: MCPProtocolBatchCreateParams,
    options?: RequestOptions,
  ): Promise<BatchObject> {
    return this.request<BatchObject>({
      method: 'POST',
      path: `/${encodeURIComponent(serverId)}/v1/batches`,
      body: { kind: 'json', value: body },
      options,
    });
  }

  /** GET /{serverId}/v1/batches/{batchId} */
  retrieveBatch(
    serverId: string,
    batchId: string,
    options?: RequestOptions,
  ): Promise<BatchObject> {
    return this.request<BatchObject>({
      method: 'GET',
      path: `/${encodeURIComponent(serverId)}/v1/batches/${encodeURIComponent(batchId)}`,
      options,
    });
  }

  /** POST /{serverId}/v1/batches/{batchId}/cancel */
  cancelBatch(
    serverId: string,
    batchId: string,
    options?: RequestOptions,
  ): Promise<BatchObject> {
    return this.request<BatchObject>({
      method: 'POST',
      path: `/${encodeURIComponent(serverId)}/v1/batches/${encodeURIComponent(batchId)}/cancel`,
      options,
    });
  }
}

// ── per-toolset proxied protocol routes ──────────────────────────────────────

/**
 * Proxied protocol routes auto-mounted under each toolset's prefix
 * (`/toolset/{toolset_id}/...`). Mirrors the per-server `mcp` endpoints
 * but scoped to a logical toolset rather than an upstream server.
 */
export class McpToolsetProtocolResource {
  constructor(private request: RequestFn) {}

  /** POST /toolset/{toolsetId}/mcp */
  mcp(
    toolsetId: string,
    body: MCPProtocolRequestBody = {},
    options?: RequestOptions,
  ): Promise<MCPProtocolResponse> {
    return this.request<MCPProtocolResponse>({
      method: 'POST',
      path: `/toolset/${encodeURIComponent(toolsetId)}/mcp`,
      body: { kind: 'json', value: body },
      options,
    });
  }

  /** GET /toolset/{toolsetId}/mcp */
  getMcp(
    toolsetId: string,
    options?: RequestOptions,
  ): Promise<MCPProtocolResponse> {
    return this.request<MCPProtocolResponse>({
      method: 'GET',
      path: `/toolset/${encodeURIComponent(toolsetId)}/mcp`,
      options,
    });
  }

  /** PUT /toolset/{toolsetId}/mcp */
  putMcp(
    toolsetId: string,
    body: MCPProtocolRequestBody,
    options?: RequestOptions,
  ): Promise<MCPProtocolResponse> {
    return this.request<MCPProtocolResponse>({
      method: 'PUT',
      path: `/toolset/${encodeURIComponent(toolsetId)}/mcp`,
      body: { kind: 'json', value: body },
      options,
    });
  }

  /** PATCH /toolset/{toolsetId}/mcp */
  patchMcp(
    toolsetId: string,
    body: MCPProtocolRequestBody,
    options?: RequestOptions,
  ): Promise<MCPProtocolResponse> {
    return this.request<MCPProtocolResponse>({
      method: 'PATCH',
      path: `/toolset/${encodeURIComponent(toolsetId)}/mcp`,
      body: { kind: 'json', value: body },
      options,
    });
  }

  /** DELETE /toolset/{toolsetId}/mcp */
  deleteMcp(
    toolsetId: string,
    options?: RequestOptions,
  ): Promise<MCPProtocolResponse> {
    return this.request<MCPProtocolResponse>({
      method: 'DELETE',
      path: `/toolset/${encodeURIComponent(toolsetId)}/mcp`,
      options,
    });
  }
}

export class McpServersResource {
  /** Per-server proxied protocol routes (`/{server_id}/...`). */
  readonly protocol: McpServerProtocolResource;

  constructor(private request: RequestFn, streamRequest: StreamRequestFn) {
    this.protocol = new McpServerProtocolResource(request, streamRequest);
  }

  /**
   * List configured MCP servers.
   *
   * @param params - Optional listing filters forwarded as query string entries.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of MCP server records.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Add a new MCP server configuration to the proxy.
   *
   * @param params - The MCP server creation payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The persisted MCP server record.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Edit an existing MCP server configuration.
   *
   * @param params - The MCP server update payload (must include the target id).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated MCP server record.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Run a health check across configured MCP servers.
   *
   * @param params - Optional filters (e.g. specific server id) forwarded as query entries.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The MCP server health summary.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Submit an MCP server for review/registration via the team submission flow.
   *
   * Unlike `add`, this enqueues the server for an admin approval step.
   *
   * @param params - The MCP server registration payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The pending MCP server record.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * List MCP server submissions awaiting admin review.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The submissions summary.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
  listSubmissions(options?: RequestOptions): Promise<MCPSubmissionsSummary> {
    return this.request<MCPSubmissionsSummary>({
      method: 'GET',
      path: '/mcp/server/submissions',
      options,
    });
  }

  /**
   * Approve a pending MCP server submission, making it available proxy-wide.
   *
   * @param serverId - The submission/server id to approve.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The approved MCP server record.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Reject a pending MCP server submission, optionally including a reason.
   *
   * @param serverId - The submission/server id to reject.
   * @param params - Optional rejection metadata (e.g. a reason).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The MCP server record reflecting its rejected state.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Retrieve a single MCP server record by id.
   *
   * @param serverId - The MCP server id.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The MCP server record.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Delete an MCP server configuration.
   *
   * @param serverId - The MCP server id to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The proxy's deletion confirmation payload.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Initiate or refresh an MCP OAuth session at the proxy level.
   *
   * @param params - Provider-specific OAuth session payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The OAuth session response from the proxy.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Delete an MCP server via the v1-prefixed route
   * (`DELETE /v1/mcp/server/{server_id}`). Functional alias of {@link delete}.
   */
  deleteV1(
    serverId: string,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'DELETE',
      path: `/v1/mcp/server/${encodeURIComponent(serverId)}`,
      options,
    });
  }

  /**
   * Begin the OAuth authorize step for an MCP server.
   *
   * @param serverId - The MCP server id whose OAuth flow is being initiated.
   * @param params - Authorize-step query parameters (e.g. redirect URI, state).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The provider's authorize response.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Exchange an OAuth authorization grant for an access token on a given MCP server.
   *
   * @param serverId - The MCP server id whose OAuth flow is being completed.
   * @param params - The OAuth token-exchange payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The provider's token response.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Register an OAuth client with an MCP server (dynamic client registration).
   *
   * @param serverId - The MCP server id to register a client against.
   * @param params - The dynamic client registration payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The registration response from the provider.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Store the calling user's credential for an MCP server.
   *
   * @param serverId - The MCP server id this credential applies to.
   * @param params - The credential payload to persist.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The credential record summary.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Remove the calling user's stored credential for an MCP server.
   *
   * @param serverId - The MCP server id whose credential should be cleared.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The credential record summary post-removal.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Persist an OAuth-derived user credential (tokens) for an MCP server.
   *
   * @param serverId - The MCP server id this credential applies to.
   * @param params - The OAuth credential payload (tokens, expiry, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The OAuth credential status.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Remove the OAuth user credential stored for an MCP server.
   *
   * @param serverId - The MCP server id whose OAuth credential should be cleared.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The OAuth credential status after removal.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Inspect the status of the calling user's OAuth credential for an MCP server.
   *
   * @param serverId - The MCP server id to inspect.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The current OAuth credential status (linked, expired, etc.).
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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
  /** Per-toolset proxied protocol routes (`/toolset/{toolset_id}/...`). */
  readonly protocol: McpToolsetProtocolResource;

  constructor(private request: RequestFn) {
    this.protocol = new McpToolsetProtocolResource(request);
  }

  /**
   * Create a new MCP toolset (a curated grouping of tools across servers).
   *
   * @param params - The toolset creation payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created toolset.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
  add(params: NewMCPToolsetRequest, options?: RequestOptions): Promise<MCPToolset> {
    return this.request<MCPToolset>({
      method: 'POST',
      path: '/mcp/toolset',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List all configured MCP toolsets.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The full set of MCP toolsets.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
  list(options?: RequestOptions): Promise<MCPToolsetListResponse> {
    return this.request<MCPToolsetListResponse>({
      method: 'GET',
      path: '/mcp/toolset',
      options,
    });
  }

  /**
   * Retrieve a single MCP toolset by id.
   *
   * @param toolsetId - The toolset id to fetch.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The toolset record.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
  retrieve(toolsetId: string, options?: RequestOptions): Promise<MCPToolset> {
    return this.request<MCPToolset>({
      method: 'GET',
      path: `/mcp/toolset/${encodeURIComponent(toolsetId)}`,
      options,
    });
  }

  /**
   * Edit an existing MCP toolset.
   *
   * @param params - The toolset update payload (must include the target id).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated toolset.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
  edit(params: UpdateMCPToolsetRequest, options?: RequestOptions): Promise<MCPToolset> {
    return this.request<MCPToolset>({
      method: 'PUT',
      path: '/mcp/toolset',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete an MCP toolset by id.
   *
   * @param toolsetId - The toolset id to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The proxy's deletion confirmation payload.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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

  /**
   * Delete an MCP toolset via the v1-prefixed route
   * (`DELETE /v1/mcp/toolset/{toolset_id}`). Functional alias of {@link remove}.
   */
  deleteV1(
    toolsetId: string,
    options?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'DELETE',
      path: `/v1/mcp/toolset/${encodeURIComponent(toolsetId)}`,
      options,
    });
  }
}

// ── REST shell over the MCP tool registry ───────────────────────────────────

/**
 * Plain REST shell over the MCP tool registry — `/mcp-rest/...` routes that
 * list and call MCP tools without speaking the MCP wire protocol.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_experimental/mcp_server/rest_endpoints.py
 */
export class McpRestResource {
  constructor(private request: RequestFn) {}

  /**
   * List available MCP tools (`GET /mcp-rest/tools/list`).
   *
   * @param params - Optional `server_id` filter (only tools for that server).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Tool list with `{ tools, error, message }`.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_experimental/mcp_server/rest_endpoints.py
   */
  listTools(
    params: { server_id?: string; [key: string]: unknown } = {},
    options?: RequestOptions,
  ): Promise<{
    tools: Array<Record<string, unknown>>;
    error: string | null;
    message: string;
    [key: string]: unknown;
  }> {
    return this.request({
      method: 'GET',
      path: '/mcp-rest/tools/list',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Invoke an MCP tool over plain REST (`POST /mcp-rest/tools/call`).
   *
   * @param params - Free-form call payload (tool name, arguments, server id).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Tool call result (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_experimental/mcp_server/rest_endpoints.py
   */
  callTool(
    params: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: '/mcp-rest/tools/call',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Verify that the proxy can reach a candidate MCP server
   * (`POST /mcp-rest/test/connection`).
   *
   * @param params - A candidate `NewMCPServerRequest`-shape body (URL, auth…).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Connection-test result (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_experimental/mcp_server/rest_endpoints.py
   */
  testConnection(
    params: NewMCPServerRequest,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: '/mcp-rest/test/connection',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List the tools offered by a candidate (unregistered) MCP server
   * (`POST /mcp-rest/test/tools/list`).
   *
   * @param params - A candidate `NewMCPServerRequest`-shape body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Tool list returned by the candidate server (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/_experimental/mcp_server/rest_endpoints.py
   */
  testToolsList(
    params: NewMCPServerRequest,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request<unknown>({
      method: 'POST',
      path: '/mcp-rest/test/tools/list',
      body: { kind: 'json', value: params },
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
  readonly rest: McpRestResource;

  constructor(private request: RequestFn, streamRequest: StreamRequestFn) {
    this.tools = new McpToolsResource(request);
    this.accessGroups = new McpAccessGroupsResource(request);
    this.network = new McpNetworkResource(request);
    this.registry = new McpRegistryResource(request);
    this.servers = new McpServersResource(request, streamRequest);
    this.toolsets = new McpToolsetsResource(request);
    this.userCredentials = new McpUserCredentialsResource(request);
    this.rest = new McpRestResource(request);
  }

  /**
   * Mark one or more MCP servers as public, making them broadly accessible.
   *
   * @param params - The set of MCP server ids to publish, plus visibility flags.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A summary of which servers were affected.
   *
   * @see https://docs.litellm.ai/docs/mcp
   */
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
