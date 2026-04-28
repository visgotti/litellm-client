// ─────────────────────────────────────────────────────────────────────────────
// Search API (Perplexity-compatible) + Search Tools admin CRUD
// ─────────────────────────────────────────────────────────────────────────────

export type SearchProvider =
  | 'perplexity'
  | 'tavily'
  | 'brave'
  | 'exa'
  | 'serper'
  | 'parallel'
  | (string & {});

// ─── Run search ──────────────────────────────────────────────────────────────

export interface SearchRunParams {
  /** Search query (string or array of strings). */
  query: string | string[];
  /** Search tool name configured in the proxy router. Required when not in URL path. */
  search_tool_name?: string;
  /** Maximum number of results (1-20). Default 10. */
  max_results?: number;
  /** List of domains to filter (max 20). */
  search_domain_filter?: string[];
  /** Max tokens per page. Default 1024. */
  max_tokens_per_page?: number;
  /** Country code filter (e.g. 'US', 'GB', 'DE'). */
  country?: string;
  [key: string]: unknown;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  date?: string | null;
  last_updated?: string | null;
  [key: string]: unknown;
}

export interface SearchRunResponse {
  object: 'search' | (string & {});
  results: SearchResult[];
  [key: string]: unknown;
}

// ─── List search tools (read-only `/v1/search/tools`) ────────────────────────

export interface SearchToolListItem {
  search_tool_name: string;
  search_provider?: string | null;
  description?: string;
  [key: string]: unknown;
}

export interface SearchToolsListResponse {
  object: 'list';
  data: SearchToolListItem[];
}

// ─── Search Tools admin (CRUD) ───────────────────────────────────────────────

export interface SearchToolLiteLLMParams {
  search_provider: string;
  api_key?: string | null;
  api_base?: string | null;
  timeout?: number | null;
  max_retries?: number | null;
  [key: string]: unknown;
}

export interface SearchTool {
  search_tool_id?: string | null;
  search_tool_name: string;
  litellm_params: SearchToolLiteLLMParams;
  search_tool_info?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SearchToolInfoResponse {
  search_tool_id?: string | null;
  search_tool_name: string;
  litellm_params: Record<string, unknown>;
  search_tool_info?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  /** True if defined in config file, false if from DB. */
  is_from_config?: boolean | null;
}

export interface ListSearchToolsResponse {
  search_tools: SearchToolInfoResponse[];
}

export interface SearchToolCreateParams {
  search_tool: SearchTool;
}

export interface SearchToolUpdateParams {
  search_tool: SearchTool;
}

export interface SearchToolCreateResponse extends SearchTool {
  [key: string]: unknown;
}
export type SearchToolUpdateResponse = SearchToolCreateResponse;

export interface SearchToolDeleteResponse {
  message?: string;
  search_tool_name?: string;
  [key: string]: unknown;
}

export interface SearchToolTestConnectionParams {
  litellm_params: Record<string, unknown>;
}

export interface SearchToolTestConnectionResponse {
  status: 'success' | 'error' | (string & {});
  message: string;
  test_query?: string;
  results_count?: number;
  error_type?: string;
  [key: string]: unknown;
}

export interface AvailableSearchProvider {
  provider_name: string;
  ui_friendly_name: string;
}

export interface AvailableSearchProvidersResponse {
  providers: AvailableSearchProvider[];
}
