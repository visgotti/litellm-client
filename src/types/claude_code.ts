// ─────────────────────────────────────────────────────────────────────────────
// Claude Code Marketplace & Plugins
//
// LiteLLM acts as a registry / discovery layer for Claude Code plugins.
// Plugins themselves are hosted on GitHub / GitLab / Bitbucket and Claude
// Code clones them at install time. These types match the
// `RegisterPluginRequest`, `PluginListItem`, `PluginAuthor`, and
// `ListPluginsResponse` schemas exposed by the proxy.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Plugin author metadata.
 */
export interface PluginAuthor {
  /** Author display name (required). */
  name: string;
  /** Optional author email. */
  email?: string | null;
}

/**
 * Git source reference for a plugin. The proxy accepts three shapes:
 *   - GitHub:      `{ source: 'github', repo: 'org/repo' }`
 *   - Git URL:     `{ source: 'url', url: 'https://github.com/org/repo.git' }`
 *   - Git subdir:  `{ source: 'git-subdir', url: '...', path: 'plugins/x' }`
 *
 * Modeled as a string-valued record because the proxy validates as
 * `Dict[str, str]`.
 */
export type PluginSource = Record<string, string>;

/**
 * A plugin record returned by the proxy.
 *
 * Matches `PluginListItem` in the proxy OpenAPI spec.
 */
export interface Plugin {
  /** UUID assigned by the proxy. */
  id: string;
  /** Plugin name (kebab-case, unique per marketplace). */
  name: string;
  /** Whether the plugin is currently enabled. */
  enabled: boolean;
  /** Semantic version, e.g. "1.0.0". */
  version?: string | null;
  /** Free-form description. */
  description?: string | null;
  /** Git source reference. */
  source: PluginSource;
  /** Optional author info. */
  author?: PluginAuthor | null;
  /** Optional homepage URL. */
  homepage?: string | null;
  /** Search keywords. */
  keywords?: string[] | null;
  /** Plugin category. */
  category?: string | null;
  /** Skill domain (e.g. "Productivity"). */
  domain?: string | null;
  /** Skill namespace within the domain. */
  namespace?: string | null;
  /** Free-form metadata returned by the proxy. */
  metadata?: Record<string, unknown> | null;
  /** ISO-8601 creation timestamp. */
  created_at?: string | null;
  /** ISO-8601 last-updated timestamp. */
  updated_at?: string | null;
}

/**
 * Parameters for `POST /claude-code/plugins`.
 */
export interface PluginCreateParams {
  /** Plugin name in kebab-case (`^[a-z0-9-]+$`). Required. */
  name: string;
  /** Git source reference. Required. */
  source: PluginSource;
  /** Semantic version. Defaults to `"1.0.0"` server-side. */
  version?: string | null;
  /** Plugin description. */
  description?: string | null;
  /** Author info. */
  author?: PluginAuthor | null;
  /** Homepage URL. */
  homepage?: string | null;
  /** Search keywords. */
  keywords?: string[] | null;
  /** Plugin category. */
  category?: string | null;
  /** Skill domain. */
  domain?: string | null;
  /** Skill namespace. */
  namespace?: string | null;
}

/**
 * Response from `POST /claude-code/plugins`.
 */
export interface PluginCreateResponse {
  status: string;
  action: string;
  plugin: Plugin;
}

/**
 * Response from `GET /claude-code/plugins`.
 */
export interface PluginListResponse {
  plugins: Plugin[];
  count: number;
}

/**
 * Marketplace owner metadata (free-form; modeled loosely as the proxy
 * returns `Dict[str, Any]`).
 */
export interface MarketplaceOwner {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Response from `GET /claude-code/marketplace.json`.
 *
 * Contains the marketplace catalog Claude Code reads when a user runs
 * `claude plugin marketplace add <url>`.
 */
export interface MarketplaceResponse {
  name: string;
  owner?: MarketplaceOwner;
  plugins: Array<Record<string, unknown>>;
  [key: string]: unknown;
}
