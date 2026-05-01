import type {
  SearchRunParams,
  SearchRunResponse,
  SearchToolsListResponse,
  ListSearchToolsResponse,
  SearchToolInfoResponse,
  SearchToolCreateParams,
  SearchToolCreateResponse,
  SearchToolUpdateParams,
  SearchToolUpdateResponse,
  SearchToolDeleteResponse,
  SearchToolTestConnectionParams,
  SearchToolTestConnectionResponse,
  AvailableSearchProvidersResponse,
} from '../types/search';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

class SearchToolsResource {
  constructor(private request: RequestFn) {}

  /**
   * List configured search tools (admin-managed catalogue).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The full list of registered search tools.
   *
   * @see https://docs.litellm.ai/docs/search/
   */
  list(options?: RequestOptions): Promise<ListSearchToolsResponse> {
    return this.request<ListSearchToolsResponse>({
      method: 'GET',
      path: '/search_tools/list',
      options,
    });
  }

  /**
   * Retrieve a single search tool configuration by id.
   *
   * @param searchToolId - The search tool identifier.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The search tool configuration.
   *
   * @see https://docs.litellm.ai/docs/search/
   */
  retrieve(
    searchToolId: string,
    options?: RequestOptions,
  ): Promise<SearchToolInfoResponse> {
    return this.request<SearchToolInfoResponse>({
      method: 'GET',
      path: `/search_tools/${encodeURIComponent(searchToolId)}`,
      options,
    });
  }

  /**
   * Create a new search tool configuration.
   *
   * @param params - The search tool creation payload (provider, credentials, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created search tool record.
   *
   * @see https://docs.litellm.ai/docs/search/
   */
  create(
    params: SearchToolCreateParams,
    options?: RequestOptions,
  ): Promise<SearchToolCreateResponse> {
    return this.request<SearchToolCreateResponse>({
      method: 'POST',
      path: '/search_tools',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing search tool configuration.
   *
   * @param searchToolId - The search tool identifier to update.
   * @param params - The updated configuration fields.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated search tool record.
   *
   * @see https://docs.litellm.ai/docs/search/
   */
  update(
    searchToolId: string,
    params: SearchToolUpdateParams,
    options?: RequestOptions,
  ): Promise<SearchToolUpdateResponse> {
    return this.request<SearchToolUpdateResponse>({
      method: 'PUT',
      path: `/search_tools/${encodeURIComponent(searchToolId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a search tool configuration.
   *
   * @param searchToolId - The search tool identifier to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A deletion confirmation payload.
   *
   * @see https://docs.litellm.ai/docs/search/
   */
  delete(
    searchToolId: string,
    options?: RequestOptions,
  ): Promise<SearchToolDeleteResponse> {
    return this.request<SearchToolDeleteResponse>({
      method: 'DELETE',
      path: `/search_tools/${encodeURIComponent(searchToolId)}`,
      options,
    });
  }

  /**
   * Test connectivity to a search provider with the supplied credentials/config.
   *
   * Useful before persisting credentials via {@link create}.
   *
   * @param params - Connection test payload (provider settings to validate).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The test connection result, including any provider error details.
   *
   * @see https://docs.litellm.ai/docs/search/
   */
  testConnection(
    params: SearchToolTestConnectionParams,
    options?: RequestOptions,
  ): Promise<SearchToolTestConnectionResponse> {
    return this.request<SearchToolTestConnectionResponse>({
      method: 'POST',
      path: '/search_tools/test_connection',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List search providers available for selection in the admin UI.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The set of providers and their config schemas.
   *
   * @see https://docs.litellm.ai/docs/search/
   */
  uiAvailableProviders(
    options?: RequestOptions,
  ): Promise<AvailableSearchProvidersResponse> {
    return this.request<AvailableSearchProvidersResponse>({
      method: 'GET',
      path: '/search_tools/ui/available_providers',
      options,
    });
  }
}

export class SearchResource {
  readonly tools: SearchToolsResource;

  constructor(private request: RequestFn) {
    this.tools = new SearchToolsResource(request);
  }

  /**
   * Run a search query against the default or named search tool.
   *
   * @param params - The search request body, including the optional `search_tool_name` selector.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The search results.
   *
   * @see https://docs.litellm.ai/docs/search/
   */
  run(params: SearchRunParams, options?: RequestOptions): Promise<SearchRunResponse> {
    return this.request<SearchRunResponse>({
      method: 'POST',
      path: '/v1/search',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Run a search query against a specific search tool by name.
   *
   * @param toolName - The configured search tool name to use.
   * @param params - The search request body (without `search_tool_name`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The search results.
   *
   * @see https://docs.litellm.ai/docs/search/
   */
  runWithTool(
    toolName: string,
    params: Omit<SearchRunParams, 'search_tool_name'>,
    options?: RequestOptions,
  ): Promise<SearchRunResponse> {
    return this.request<SearchRunResponse>({
      method: 'POST',
      path: `/v1/search/${encodeURIComponent(toolName)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List the search tools selectable at request time on the `/v1/search` endpoint.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The runtime-visible search tool listing.
   *
   * @see https://docs.litellm.ai/docs/search/
   */
  listTools(options?: RequestOptions): Promise<SearchToolsListResponse> {
    return this.request<SearchToolsListResponse>({
      method: 'GET',
      path: '/v1/search/tools',
      options,
    });
  }
}
