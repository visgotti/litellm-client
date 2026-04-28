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

  /** GET /search_tools/list */
  list(options?: RequestOptions): Promise<ListSearchToolsResponse> {
    return this.request<ListSearchToolsResponse>({
      method: 'GET',
      path: '/search_tools/list',
      options,
    });
  }

  /** GET /search_tools/{search_tool_id} */
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

  /** POST /search_tools */
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

  /** PUT /search_tools/{search_tool_id} */
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

  /** DELETE /search_tools/{search_tool_id} */
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

  /** POST /search_tools/test_connection */
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

  /** GET /search_tools/ui/available_providers */
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

  /** POST /v1/search */
  run(params: SearchRunParams, options?: RequestOptions): Promise<SearchRunResponse> {
    return this.request<SearchRunResponse>({
      method: 'POST',
      path: '/v1/search',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /v1/search/{tool_name} */
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

  /** GET /v1/search/tools */
  listTools(options?: RequestOptions): Promise<SearchToolsListResponse> {
    return this.request<SearchToolsListResponse>({
      method: 'GET',
      path: '/v1/search/tools',
      options,
    });
  }
}
