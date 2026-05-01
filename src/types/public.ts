// ─────────────────────────────────────────────────────────────────────────────
// Public Discovery Endpoints
// Mirrors litellm/proxy/public_endpoints/public_endpoints.py.
//
// Most routes return free-form catalog/marketing JSON (model hub entries,
// blog posts, provider field metadata) — values are typed openly here so
// new fields don't break SDK callers.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Auth-free metadata feed entry returned by the model hub.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
 */
export interface PublicModelGroupInfo {
  /** Model group name (canonical identifier). */
  model_group?: string;
  /** Provider this model group belongs to. */
  providers?: string[];
  /** Whether the entry is publicly listed. */
  is_public_model_group?: boolean;
  /** Last health-check status. */
  health_status?: string | null;
  /** Last health-check response time (ms). */
  health_response_time?: number | null;
  /** Timestamp of the last health check. */
  health_checked_at?: string | null;
  /** Forward-compat passthrough — the underlying `ModelGroupInfo` model is large. */
  [key: string]: unknown;
}

/**
 * Agent card entry returned by `/public/agent_hub`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
 */
export interface PublicAgentCard {
  /** Agent id. */
  agent_id?: string;
  /** Agent display name. */
  name?: string;
  /** Description. */
  description?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Public MCP server entry.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
 */
export interface PublicMcpServer {
  /** Server id. */
  server_id?: string;
  /** Server name. */
  name?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Skill hub entry returned by `/public/skill_hub`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
 */
export interface PublicSkill {
  /** Skill id. */
  id?: string;
  /** Display name. */
  name?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Aggregated info payload returned by `/public/model_hub/info`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
 */
export interface PublicModelHubInfo {
  /** Forward-compat passthrough — schema is intentionally open. */
  [key: string]: unknown;
}

/**
 * One provider field-info row returned by `/public/providers/fields`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
 */
export interface PublicProviderFieldInfo {
  /** Provider name (e.g. `openai`, `anthropic`). */
  provider?: string;
  /** Credential fields the provider expects. */
  credential_fields?: Array<Record<string, unknown>>;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Blog post entry returned by `/public/litellm_blog_posts`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
 */
export interface PublicBlogPostsResponse {
  /** Forward-compat passthrough — schema is intentionally open. */
  [key: string]: unknown;
}

/**
 * Endpoint catalog entry returned by `/public/endpoints`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
 */
export interface PublicEndpointsResponse {
  /** Catalog of supported endpoints. */
  endpoints?: Array<Record<string, unknown>>;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * One agent field-info row returned by `/public/agents/fields`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
 */
export interface PublicAgentFieldInfo {
  /** Agent type identifier. */
  agent_type?: string;
  /** Configurable fields exposed to the dashboard. */
  fields?: Array<Record<string, unknown>>;
  /** Credential fields (may include inherited provider fields). */
  credential_fields?: Array<Record<string, unknown>>;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}
