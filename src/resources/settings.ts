import type {
  DefaultTeamSettingsResponse,
  DefaultTeamSettingsUpdateParams,
  InternalUserSettingsResponse,
  InternalUserSettingsUpdateParams,
  MCPSemanticFilterSettingsResponse,
  MCPSemanticFilterSettingsUpdateParams,
  SSOSettingsResponse,
  SSOSettingsUpdateParams,
  UISettingsResponse,
  UISettingsUpdateParams,
  UIThemeSettingsResponse,
  UIThemeSettingsUpdateParams,
  LogoUploadOptions,
  LogoUploadResponse,
  InProductNudgesResponse,
  UIDiscoveryEndpointsResponse,
} from '../types/settings';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/**
 * Admin Settings — wraps the `/get/*`, `/update/*`, and adjacent
 * UI-discovery endpoints used by the LiteLLM admin panel.
 */
export class SettingsResource {
  constructor(private request: RequestFn) {}

  // ─── Default team settings ────────────────────────────────────────────────

  async getDefaultTeamSettings(options?: RequestOptions): Promise<DefaultTeamSettingsResponse> {
    return this.request<DefaultTeamSettingsResponse>({
      method: 'GET',
      path: '/get/default_team_settings',
      options,
    });
  }

  async updateDefaultTeamSettings(
    params: DefaultTeamSettingsUpdateParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'PATCH',
      path: '/update/default_team_settings',
      body: { kind: 'json', value: params },
      options,
    });
  }

  // ─── Internal user defaults ───────────────────────────────────────────────

  async getInternalUserSettings(options?: RequestOptions): Promise<InternalUserSettingsResponse> {
    return this.request<InternalUserSettingsResponse>({
      method: 'GET',
      path: '/get/internal_user_settings',
      options,
    });
  }

  async updateInternalUserSettings(
    params: InternalUserSettingsUpdateParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'PATCH',
      path: '/update/internal_user_settings',
      body: { kind: 'json', value: params },
      options,
    });
  }

  // ─── MCP semantic filter ──────────────────────────────────────────────────

  async getMcpSemanticFilterSettings(
    options?: RequestOptions,
  ): Promise<MCPSemanticFilterSettingsResponse> {
    return this.request<MCPSemanticFilterSettingsResponse>({
      method: 'GET',
      path: '/get/mcp_semantic_filter_settings',
      options,
    });
  }

  async updateMcpSemanticFilterSettings(
    params: MCPSemanticFilterSettingsUpdateParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'PATCH',
      path: '/update/mcp_semantic_filter_settings',
      body: { kind: 'json', value: params },
      options,
    });
  }

  // ─── SSO ─────────────────────────────────────────────────────────────────

  async getSsoSettings(options?: RequestOptions): Promise<SSOSettingsResponse> {
    return this.request<SSOSettingsResponse>({
      method: 'GET',
      path: '/get/sso_settings',
      options,
    });
  }

  async updateSsoSettings(
    params: SSOSettingsUpdateParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'PATCH',
      path: '/update/sso_settings',
      body: { kind: 'json', value: params },
      options,
    });
  }

  // ─── UI flags ────────────────────────────────────────────────────────────

  async getUiSettings(options?: RequestOptions): Promise<UISettingsResponse> {
    return this.request<UISettingsResponse>({
      method: 'GET',
      path: '/get/ui_settings',
      options,
    });
  }

  async updateUiSettings(
    params: UISettingsUpdateParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'PATCH',
      path: '/update/ui_settings',
      body: { kind: 'json', value: params },
      options,
    });
  }

  // ─── UI theme ────────────────────────────────────────────────────────────

  async getUiThemeSettings(options?: RequestOptions): Promise<UIThemeSettingsResponse> {
    return this.request<UIThemeSettingsResponse>({
      method: 'GET',
      path: '/get/ui_theme_settings',
      options,
    });
  }

  async updateUiThemeSettings(
    params: UIThemeSettingsUpdateParams,
    options?: RequestOptions,
  ): Promise<unknown> {
    return this.request({
      method: 'PATCH',
      path: '/update/ui_theme_settings',
      body: { kind: 'json', value: params },
      options,
    });
  }

  // ─── Logo upload (multipart) ─────────────────────────────────────────────

  /**
   * Upload a custom logo to the proxy via `POST /upload/logo`.
   *
   * Sent as a `multipart/form-data` request with the image under the `file`
   * field. The proxy returns the persisted asset metadata (URL, filename, etc.).
   *
   * @param blob    The logo image content as a `Blob`.
   * @param options Optional filename / content-type overrides.
   * @returns The proxy's logo upload response payload.
   */
  async uploadLogo(
    blob: Blob,
    options?: LogoUploadOptions,
  ): Promise<LogoUploadResponse> {
    const filename = options?.filename ?? 'logo';
    const contentType = options?.contentType ?? blob.type ?? 'application/octet-stream';
    const file =
      blob.type === contentType
        ? blob
        : new Blob([blob], { type: contentType });
    const form = new FormData();
    form.append('file', file, filename);

    return this.request<LogoUploadResponse>({
      method: 'POST',
      path: '/upload/logo',
      body: { kind: 'form', value: form },
    });
  }

  // ─── Discovery endpoints ─────────────────────────────────────────────────

  async inProductNudges(options?: RequestOptions): Promise<InProductNudgesResponse> {
    return this.request<InProductNudgesResponse>({
      method: 'GET',
      path: '/in_product_nudges',
      options,
    });
  }

  async uiConfig(options?: RequestOptions): Promise<UIDiscoveryEndpointsResponse> {
    return this.request<UIDiscoveryEndpointsResponse>({
      method: 'GET',
      path: '/.well-known/litellm-ui-config',
      options,
    });
  }

  async litellmUiConfig(options?: RequestOptions): Promise<UIDiscoveryEndpointsResponse> {
    return this.request<UIDiscoveryEndpointsResponse>({
      method: 'GET',
      path: '/litellm/.well-known/litellm-ui-config',
      options,
    });
  }
}
