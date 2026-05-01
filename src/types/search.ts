// ─────────────────────────────────────────────────────────────────────────────
// Search API (Perplexity-compatible) + Search Tools admin CRUD
// ─────────────────────────────────────────────────────────────────────────────

/** Search-provider identifier. */
export type SearchProvider =
  | 'perplexity'
  | 'tavily'
  | 'brave'
  | 'exa'
  | 'serper'
  | 'parallel'
  | (string & {});

// ─── Run search ──────────────────────────────────────────────────────────────

/**
 * Parameters for running a web search.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchRunParams {
  /** Search query (string or array of strings). */
  query: string | string[];
  /** Search tool name configured in the proxy router. Required when not in URL path. */
  search_tool_name?: string;
  /**
   * Search provider name. Alternative discriminator to `search_tool_name`,
   * commonly used in the SDK-style payload (vs. proxy-config-driven tool names).
   */
  search_provider?:
    | 'tavily'
    | 'brave'
    | 'serper'
    | 'perplexity'
    | 'exa'
    | 'parallel'
    | 'google_pse'
    | 'dataforseo'
    | 'firecrawl'
    | 'searxng'
    | 'linkup'
    | (string & {});
  /** Maximum number of results (1-20). Default 10. */
  max_results?: number;
  /** List of domains to filter (max 20). */
  search_domain_filter?: string[];
  /** Max tokens per page. Default 1024. */
  max_tokens_per_page?: number;
  /** Country code filter (e.g. 'US', 'GB', 'DE'). */
  country?: string;

  // ─── Tavily-specific ────────────────────────────────────────────────────────
  /** Tavily-specific. Search category. */
  topic?: 'general' | 'news' | 'finance';
  /** Tavily-specific. Query thoroughness level. */
  search_depth?: 'basic' | 'advanced';
  /** Tavily-specific. Include AI-generated answer in the response. */
  include_answer?: boolean;
  /** Tavily-specific. Include raw HTML content for each result. */
  include_raw_content?: boolean;

  // ─── Serper-specific ────────────────────────────────────────────────────────
  /** Serper-specific. Country / geolocation code (e.g. 'us', 'gb'). */
  gl?: string;
  /** Serper-specific. Language code (e.g. 'en', 'de'). */
  hl?: string;
  /** Serper-specific. Disable autocorrect when set to false. */
  autocorrect?: boolean;
  /** Serper-specific. Time-based filter (e.g. 'qdr:h', 'qdr:w', 'qdr:m'). */
  tbs?: string;
  /** Serper-specific. Page number for pagination. */
  page?: number;

  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * A single web-search result.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchResult {
  /** Page title. */
  title: string;
  /** Page URL. */
  url: string;
  /** Snippet of relevant text from the page. */
  snippet?: string;
  /** ISO date the result was first indexed. */
  date?: string | null;
  /** ISO date the result was last updated. */
  last_updated?: string | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Search response payload.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchRunResponse {
  /** Always `'search'`. */
  object: 'search' | (string & {});
  /** Ranked search results. */
  results: SearchResult[];
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

// ─── List search tools (read-only `/v1/search/tools`) ────────────────────────

/**
 * One entry in the read-only list of available search tools.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchToolListItem {
  /** Configured tool name. */
  search_tool_name: string;
  /** Underlying provider for the tool. */
  search_provider?: string | null;
  /** Human-readable description. */
  description?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Read-only list of available search tools.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchToolsListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Available search tools. */
  data: SearchToolListItem[];
}

// ─── Search Tools admin (CRUD) ───────────────────────────────────────────────

/**
 * LiteLLM routing parameters for a search tool.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchToolLiteLLMParams {
  /** Underlying provider for this tool. */
  search_provider: string;
  /** API key for the provider. */
  api_key?: string | null;
  /** Override the provider's base URL. */
  api_base?: string | null;
  /** Per-request timeout in seconds. */
  timeout?: number | null;
  /** Maximum number of retries on failure. */
  max_retries?: number | null;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * A registered search tool definition.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchTool {
  /** Tool identifier (server-assigned for DB-backed tools). */
  search_tool_id?: string | null;
  /** Display / routing name of the tool. */
  search_tool_name: string;
  /** LiteLLM routing parameters. */
  litellm_params: SearchToolLiteLLMParams;
  /** Free-form metadata about the tool. */
  search_tool_info?: Record<string, unknown> | null;
  /** ISO-8601 creation timestamp. */
  created_at?: string | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: string | null;
}

/**
 * Detailed info about a registered search tool.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchToolInfoResponse {
  /** Tool identifier. */
  search_tool_id?: string | null;
  /** Display / routing name of the tool. */
  search_tool_name: string;
  /** LiteLLM routing parameters. */
  litellm_params: Record<string, unknown>;
  /** Free-form metadata about the tool. */
  search_tool_info?: Record<string, unknown> | null;
  /** ISO-8601 creation timestamp. */
  created_at?: string | null;
  /** ISO-8601 last-update timestamp. */
  updated_at?: string | null;
  /** True if defined in config file, false if from DB. */
  is_from_config?: boolean | null;
}

/** List of registered search tools. */
export interface ListSearchToolsResponse {
  /** Registered search tools. */
  search_tools: SearchToolInfoResponse[];
}

/**
 * Parameters for registering a search tool.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchToolCreateParams {
  /** Tool definition. */
  search_tool: SearchTool;
}

/**
 * Parameters for updating a search tool.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchToolUpdateParams {
  /** Updated tool definition. */
  search_tool: SearchTool;
}

/**
 * Response from creating or updating a search tool.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchToolCreateResponse extends SearchTool {
  /** Free-form additional fields forwarded by the server. */
  [key: string]: unknown;
}
export type SearchToolUpdateResponse = SearchToolCreateResponse;

/**
 * Response from deleting a search tool.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchToolDeleteResponse {
  /** Human-readable status. */
  message?: string;
  /** Display name of the deleted tool. */
  search_tool_name?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Parameters for testing a search tool's connectivity.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchToolTestConnectionParams {
  /** LiteLLM routing parameters to test. */
  litellm_params: Record<string, unknown>;
}

/**
 * Result of testing a search tool's connectivity.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface SearchToolTestConnectionResponse {
  /** Outcome of the connectivity test. */
  status: 'success' | 'error' | (string & {});
  /** Human-readable message. */
  message: string;
  /** Probe query used in the test. */
  test_query?: string;
  /** Number of results returned by the probe. */
  results_count?: number;
  /** Provider-specific error category. */
  error_type?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Provider entry returned by the available-providers endpoint.
 *
 * @see https://docs.litellm.ai/docs/search/
 */
export interface AvailableSearchProvider {
  /** Internal provider identifier. */
  provider_name: string;
  /** Display name shown in the UI. */
  ui_friendly_name: string;
}

/** List of search providers available to the proxy. */
export interface AvailableSearchProvidersResponse {
  /** Available providers. */
  providers: AvailableSearchProvider[];
}
