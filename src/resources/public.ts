import type {
  PublicModelGroupInfo,
  PublicAgentCard,
  PublicMcpServer,
  PublicSkill,
  PublicModelHubInfo,
  PublicProviderFieldInfo,
  PublicBlogPostsResponse,
  PublicEndpointsResponse,
  PublicAgentFieldInfo,
} from '../types/public';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Auth-free metadata feeds for the public model/agent/MCP/skill hubs.
 *
 * Most endpoints don't require authentication — they back the LiteLLM
 * marketing site and discovery clients.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
 */
export class PublicResource {
  constructor(private request: RequestFn) {}

  /**
   * Public model hub feed (`GET /public/model_hub`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of public model groups.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  modelHub(options?: RequestOptions): Promise<PublicModelGroupInfo[]> {
    return this.request<PublicModelGroupInfo[]>({
      method: 'GET',
      path: '/public/model_hub',
      options,
    });
  }

  /**
   * Public agent hub feed (`GET /public/agent_hub`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of public agent cards.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  agentHub(options?: RequestOptions): Promise<PublicAgentCard[]> {
    return this.request<PublicAgentCard[]>({
      method: 'GET',
      path: '/public/agent_hub',
      options,
    });
  }

  /**
   * Public MCP server hub feed (`GET /public/mcp_hub`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of public MCP servers.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  mcpHub(options?: RequestOptions): Promise<PublicMcpServer[]> {
    return this.request<PublicMcpServer[]>({
      method: 'GET',
      path: '/public/mcp_hub',
      options,
    });
  }

  /**
   * Public Claude Code skill hub feed (`GET /public/skill_hub`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of enabled skills.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  skillHub(options?: RequestOptions): Promise<PublicSkill[]> {
    return this.request<PublicSkill[]>({
      method: 'GET',
      path: '/public/skill_hub',
      options,
    });
  }

  /**
   * Aggregated model-hub info (`GET /public/model_hub/info`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The aggregated info payload (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  modelHubInfo(options?: RequestOptions): Promise<PublicModelHubInfo> {
    return this.request<PublicModelHubInfo>({
      method: 'GET',
      path: '/public/model_hub/info',
      options,
    });
  }

  /**
   * List supported provider names (`GET /public/providers`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A flat list of provider identifiers.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  providers(options?: RequestOptions): Promise<string[]> {
    return this.request<string[]>({
      method: 'GET',
      path: '/public/providers',
      options,
    });
  }

  /**
   * Per-provider create-form metadata (`GET /public/providers/fields`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Provider field info rows.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  providerFields(options?: RequestOptions): Promise<PublicProviderFieldInfo[]> {
    return this.request<PublicProviderFieldInfo[]>({
      method: 'GET',
      path: '/public/providers/fields',
      options,
    });
  }

  /**
   * Bundled LiteLLM model-cost map (`GET /public/litellm_model_cost_map`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The cost map JSON (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  litellmModelCostMap(options?: RequestOptions): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>({
      method: 'GET',
      path: '/public/litellm_model_cost_map',
      options,
    });
  }

  /**
   * Curated LiteLLM blog post feed (`GET /public/litellm_blog_posts`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The blog post catalog (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  litellmBlogPosts(options?: RequestOptions): Promise<PublicBlogPostsResponse> {
    return this.request<PublicBlogPostsResponse>({
      method: 'GET',
      path: '/public/litellm_blog_posts',
      options,
    });
  }

  /**
   * Catalog of supported proxy endpoints (`GET /public/endpoints`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The endpoint catalog (open shape).
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  endpoints(options?: RequestOptions): Promise<PublicEndpointsResponse> {
    return this.request<PublicEndpointsResponse>({
      method: 'GET',
      path: '/public/endpoints',
      options,
    });
  }

  /**
   * Per-agent-type create-form metadata (`GET /public/agents/fields`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Agent field info rows.
   *
   * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/public_endpoints/public_endpoints.py
   */
  agentFields(options?: RequestOptions): Promise<PublicAgentFieldInfo[]> {
    return this.request<PublicAgentFieldInfo[]>({
      method: 'GET',
      path: '/public/agents/fields',
      options,
    });
  }
}
