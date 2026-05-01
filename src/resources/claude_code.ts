import type {
  MarketplaceResponse,
  Plugin,
  PluginCreateParams,
  PluginCreateResponse,
  PluginListResponse,
} from '../types/claude_code';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Sub-resource for managing Claude Code plugins.
 *
 * Reachable via `client.claudeCode.plugins`.
 */
export class ClaudeCodePluginsResource {
  constructor(private request: RequestFn) {}

  /** List all registered plugins. GET /claude-code/plugins */
  async list(options?: RequestOptions): Promise<PluginListResponse> {
    return this.request<PluginListResponse>({
      method: 'GET',
      path: '/claude-code/plugins',
      options,
    });
  }

  /** Register a new plugin. POST /claude-code/plugins */
  async create(
    params: PluginCreateParams,
    options?: RequestOptions,
  ): Promise<PluginCreateResponse> {
    return this.request<PluginCreateResponse>({
      method: 'POST',
      path: '/claude-code/plugins',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Get details for a single plugin by name.
   *
   * GET /claude-code/plugins/{plugin_name}
   */
  async retrieve(name: string, options?: RequestOptions): Promise<Plugin> {
    return this.request<Plugin>({
      method: 'GET',
      path: `/claude-code/plugins/${encodeURIComponent(name)}`,
      options,
    });
  }

  /**
   * Delete a plugin by name.
   *
   * DELETE /claude-code/plugins/{plugin_name}
   */
  async delete(name: string, options?: RequestOptions): Promise<unknown> {
    return this.request({
      method: 'DELETE',
      path: `/claude-code/plugins/${encodeURIComponent(name)}`,
      options,
    });
  }

  /**
   * Enable a previously disabled plugin.
   *
   * POST /claude-code/plugins/{plugin_name}/enable
   */
  async enable(name: string, options?: RequestOptions): Promise<unknown> {
    return this.request({
      method: 'POST',
      path: `/claude-code/plugins/${encodeURIComponent(name)}/enable`,
      options,
    });
  }

  /**
   * Disable a plugin without deleting it.
   *
   * POST /claude-code/plugins/{plugin_name}/disable
   */
  async disable(name: string, options?: RequestOptions): Promise<unknown> {
    return this.request({
      method: 'POST',
      path: `/claude-code/plugins/${encodeURIComponent(name)}/disable`,
      options,
    });
  }
}

/**
 * Top-level resource for Claude Code marketplace + plugin management.
 */
export class ClaudeCodeResource {
  readonly plugins: ClaudeCodePluginsResource;
  private readonly request: RequestFn;

  constructor(request: RequestFn) {
    this.request = request;
    this.plugins = new ClaudeCodePluginsResource(request);
  }

  /**
   * Fetch the marketplace catalog Claude Code uses for plugin discovery.
   *
   * GET /claude-code/marketplace.json
   */
  async marketplace(options?: RequestOptions): Promise<MarketplaceResponse> {
    return this.request<MarketplaceResponse>({
      method: 'GET',
      path: '/claude-code/marketplace.json',
      options,
    });
  }
}
