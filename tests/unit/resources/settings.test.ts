/**
 * @group unit
 *
 * Unit tests for SettingsResource. All HTTP traffic is mocked via a
 * fake `fetch` so these run without a live proxy.
 */
import { LiteLLMClient } from '../../../src/client';

function jsonResponse(body: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('SettingsResource', () => {
  let mockFetch: jest.Mock;
  let client: LiteLLMClient;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new LiteLLMClient({
      baseUrl: 'http://localhost:4000',
      apiKey: 'sk-test',
      maxRetries: 0,
      fetch: mockFetch,
    });
  });

  // ─── Default team settings ──────────────────────────────────────────────

  describe('default team settings', () => {
    it('GET /get/default_team_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ values: {}, field_schema: {} }));
      const result = await client.settings.getDefaultTeamSettings();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/get/default_team_settings',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual({ values: {}, field_schema: {} });
    });

    it('PATCH /update/default_team_settings sends params as JSON body', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.settings.updateDefaultTeamSettings({
        models: ['gpt-4'],
        max_budget: 100,
        budget_duration: 'monthly',
        tpm_limit: 1000,
        rpm_limit: 60,
        team_member_permissions: ['/key/generate'],
      });

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/update/default_team_settings');
      expect(init.method).toBe('PATCH');
      const body = JSON.parse(init.body);
      expect(body.models).toEqual(['gpt-4']);
      expect(body.max_budget).toBe(100);
      expect(body.team_member_permissions).toEqual(['/key/generate']);
    });
  });

  // ─── Internal user settings ─────────────────────────────────────────────

  describe('internal user settings', () => {
    it('GET /get/internal_user_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ values: { user_role: 'internal_user_viewer' }, field_schema: {} }));
      const result = await client.settings.getInternalUserSettings();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/get/internal_user_settings',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.values).toEqual({ user_role: 'internal_user_viewer' });
    });

    it('PATCH /update/internal_user_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.settings.updateInternalUserSettings({
        user_role: 'internal_user',
        max_budget: 25,
        models: ['gpt-3.5-turbo'],
      });

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/update/internal_user_settings');
      expect(init.method).toBe('PATCH');
      expect(JSON.parse(init.body).user_role).toBe('internal_user');
    });
  });

  // ─── MCP semantic filter ────────────────────────────────────────────────

  describe('mcp semantic filter', () => {
    it('GET /get/mcp_semantic_filter_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ values: {}, field_schema: {} }));
      await client.settings.getMcpSemanticFilterSettings();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/get/mcp_semantic_filter_settings',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('PATCH /update/mcp_semantic_filter_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.settings.updateMcpSemanticFilterSettings({
        enabled: true,
        embedding_model: 'text-embedding-3-small',
        top_k: 5,
        similarity_threshold: 0.5,
      });
      const init = mockFetch.mock.calls[0][1];
      expect(init.method).toBe('PATCH');
      const body = JSON.parse(init.body);
      expect(body.enabled).toBe(true);
      expect(body.top_k).toBe(5);
      expect(body.similarity_threshold).toBe(0.5);
    });
  });

  // ─── SSO settings ───────────────────────────────────────────────────────

  describe('sso settings', () => {
    it('GET /get/sso_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ values: {}, field_schema: {} }));
      await client.settings.getSsoSettings();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/get/sso_settings',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('PATCH /update/sso_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.settings.updateSsoSettings({
        google_client_id: 'cid',
        google_client_secret: 'csecret',
        proxy_base_url: 'https://proxy.example.com',
        ui_access_mode: 'all_authenticated_users',
      });
      const init = mockFetch.mock.calls[0][1];
      expect(init.method).toBe('PATCH');
      const body = JSON.parse(init.body);
      expect(body.google_client_id).toBe('cid');
      expect(body.ui_access_mode).toBe('all_authenticated_users');
    });
  });

  // ─── UI settings ────────────────────────────────────────────────────────

  describe('ui settings', () => {
    it('GET /get/ui_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ values: { disable_custom_api_keys: false }, field_schema: {} }));
      const r = await client.settings.getUiSettings();
      expect(r.values).toEqual({ disable_custom_api_keys: false });
    });

    it('PATCH /update/ui_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.settings.updateUiSettings({
        disable_custom_api_keys: true,
        forward_client_headers_to_llm_api: true,
        enabled_ui_pages_internal_users: ['models', 'keys'],
      });
      const init = mockFetch.mock.calls[0][1];
      expect(init.method).toBe('PATCH');
      const body = JSON.parse(init.body);
      expect(body.disable_custom_api_keys).toBe(true);
      expect(body.enabled_ui_pages_internal_users).toEqual(['models', 'keys']);
    });
  });

  // ─── UI theme settings ──────────────────────────────────────────────────

  describe('ui theme settings', () => {
    it('GET /get/ui_theme_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ values: { logo_url: null, favicon_url: null }, field_schema: {} }));
      await client.settings.getUiThemeSettings();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/get/ui_theme_settings',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('PATCH /update/ui_theme_settings', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.settings.updateUiThemeSettings({
        logo_url: 'https://example.com/logo.png',
        favicon_url: 'https://example.com/fav.ico',
      });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.logo_url).toBe('https://example.com/logo.png');
    });
  });

  // ─── Logo upload (multipart) ────────────────────────────────────────────

  describe('uploadLogo', () => {
    it('POSTs multipart/form-data without an explicit content-type header', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

      const blob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/png' });
      const result = await client.settings.uploadLogo(blob, { filename: 'mylogo.png' });

      expect(result).toEqual({ ok: true });
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/upload/logo');
      expect(init.method).toBe('POST');
      // FormData body — runtime fetch must determine the boundary itself
      expect(init.body).toBeInstanceOf(FormData);
      // The SDK must not pre-set content-type for multipart bodies
      expect(init.headers['content-type']).toBeUndefined();
      // Form contains the file under "file"
      const fd = init.body as FormData;
      const f = fd.get('file');
      expect(f).toBeInstanceOf(Blob);
    });

    it('falls back to default filename and content-type when none provided', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      const blob = new Blob([new Uint8Array([0])]); // no type
      await client.settings.uploadLogo(blob);

      const init = mockFetch.mock.calls[0][1];
      expect(init.body).toBeInstanceOf(FormData);
    });
  });

  // ─── Discovery endpoints ────────────────────────────────────────────────

  describe('discovery endpoints', () => {
    it('GET /in_product_nudges', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ is_claude_code_enabled: true }));
      const r = await client.settings.inProductNudges();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/in_product_nudges',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(r.is_claude_code_enabled).toBe(true);
    });

    it('GET /.well-known/litellm-ui-config', async () => {
      const payload = {
        server_root_path: '/',
        proxy_base_url: 'http://localhost:4000',
        auto_redirect_to_sso: false,
        admin_ui_disabled: false,
        sso_configured: false,
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(payload));
      const r = await client.settings.uiConfig();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/litellm-ui-config',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(r.server_root_path).toBe('/');
      expect(r.sso_configured).toBe(false);
    });

    it('GET /litellm/.well-known/litellm-ui-config', async () => {
      const payload = {
        server_root_path: '/',
        proxy_base_url: null,
        auto_redirect_to_sso: false,
        admin_ui_disabled: false,
        sso_configured: false,
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(payload));
      await client.settings.litellmUiConfig();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/litellm/.well-known/litellm-ui-config',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });
});
