/**
 * @group e2e
 *
 * E2E tests for the Admin Settings panel + Email event settings, run against
 * the Docker-based LiteLLM proxy on http://localhost:14000.
 *
 * Each test commits to ONE outcome:
 *   - success-with-shape via `expectShape`, OR
 *   - a single typed error status via `expectTypedError`.
 */
import { LiteLLMClient } from '../../src/client';
import { expectShape, expectTypedError } from './_assertions';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMClient;
let unauthClient: LiteLLMClient;

beforeAll(() => {
  client = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 30_000,
    maxRetries: 0,
  });
  unauthClient = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: 'sk-not-a-real-key',
    timeout: 30_000,
    maxRetries: 0,
  });
});

// ─── Discovery endpoints (auth-free public reads) ────────────────────────────

describe('Settings — discovery endpoints', () => {
  it('uiConfig returns the well-known UI config shape', async () => {
    const r = await client.settings.uiConfig();
    expect(typeof r.server_root_path).toBe('string');
    expect(typeof r.auto_redirect_to_sso).toBe('boolean');
    expect(typeof r.admin_ui_disabled).toBe('boolean');
    expect(typeof r.sso_configured).toBe('boolean');
  });

  it('litellmUiConfig returns the same shape under the /litellm prefix', async () => {
    const r = await client.settings.litellmUiConfig();
    expect(typeof r.server_root_path).toBe('string');
    expect(typeof r.auto_redirect_to_sso).toBe('boolean');
    expect(typeof r.admin_ui_disabled).toBe('boolean');
    expect(typeof r.sso_configured).toBe('boolean');
  });

  it('inProductNudges returns is_claude_code_enabled boolean', async () => {
    const r = await client.settings.inProductNudges();
    expect(typeof r.is_claude_code_enabled).toBe("boolean");
  });
});

// ─── Admin GET endpoints — envelope shape ────────────────────────────────────

describe('Settings — admin reads', () => {
  it('getDefaultTeamSettings returns the standard envelope', async () => {
    const r = await client.settings.getDefaultTeamSettings();
    expect(typeof r.values).toBe("object"); expect(typeof r.field_schema).toBe("object");
  });

  it('getInternalUserSettings returns the standard envelope', async () => {
    const r = await client.settings.getInternalUserSettings();
    expect(typeof r.values).toBe("object"); expect(typeof r.field_schema).toBe("object");
  });

  it('getMcpSemanticFilterSettings returns the standard envelope', async () => {
    const r = await client.settings.getMcpSemanticFilterSettings();
    expect(typeof r.values).toBe("object"); expect(typeof r.field_schema).toBe("object");
  });

  it('getSsoSettings returns the standard envelope', async () => {
    const r = await client.settings.getSsoSettings();
    expect(typeof r.values).toBe("object"); expect(typeof r.field_schema).toBe("object");
  });

  it('getUiSettings returns the standard envelope', async () => {
    const r = await client.settings.getUiSettings();
    expect(typeof r.values).toBe("object"); expect(typeof r.field_schema).toBe("object");
  });

  it('getUiThemeSettings returns the standard envelope', async () => {
    const r = await client.settings.getUiThemeSettings();
    expect(typeof r.values).toBe("object"); expect(typeof r.field_schema).toBe("object");
  });
});

// ─── Auth-rejection pins on the admin reads ─────────────────────────────────

describe('Settings — admin reads reject invalid keys with 401', () => {
  it('getDefaultTeamSettings → 401 with bogus key', async () => {
    await expectTypedError(unauthClient.settings.getDefaultTeamSettings(), 401);
  });
  it('getInternalUserSettings → 401 with bogus key', async () => {
    await expectTypedError(unauthClient.settings.getInternalUserSettings(), 401);
  });
  it('getSsoSettings → 401 with bogus key', async () => {
    await expectTypedError(unauthClient.settings.getSsoSettings(), 401);
  });
  it('getUiSettings is publicly accessible (no auth required) and returns the envelope', async () => {
    // /get/ui_settings is a public read on this proxy build — it returns the
    // envelope without checking auth. Pinned so a future proxy change to
    // require auth flips this to expectTypedError(..., 401).
    const r = await unauthClient.settings.getUiSettings();
    expect(typeof r.values).toBe("object");
    expect(typeof r.field_schema).toBe("object");
  });
});

// ─── Admin write endpoints — auth-rejection pin ─────────────────────────────
//
// PATCH/POST against the in-memory test proxy (database_url: null) cannot be
// guaranteed to succeed end-to-end; we pin instead on the proxy correctly
// rejecting an unauthenticated/invalid-key request with 401.

describe('Settings — admin writes reject invalid keys with 401', () => {
  it('updateDefaultTeamSettings → 401 with bogus key', async () => {
    await expectTypedError(
      unauthClient.settings.updateDefaultTeamSettings({ models: [] }),
      401,
    );
  });

  it('updateInternalUserSettings → 401 with bogus key', async () => {
    await expectTypedError(
      unauthClient.settings.updateInternalUserSettings({ user_role: 'internal_user_viewer' }),
      401,
    );
  });

  it('updateMcpSemanticFilterSettings → 401 with bogus key', async () => {
    await expectTypedError(
      unauthClient.settings.updateMcpSemanticFilterSettings({ enabled: false }),
      401,
    );
  });

  it('updateSsoSettings → 401 with bogus key', async () => {
    await expectTypedError(
      unauthClient.settings.updateSsoSettings({ proxy_base_url: 'https://x.example.com' }),
      401,
    );
  });

  it('updateUiSettings → 401 with bogus key', async () => {
    await expectTypedError(
      unauthClient.settings.updateUiSettings({ disable_custom_api_keys: false }),
      401,
    );
  });

  it('updateUiThemeSettings → 401 with bogus key', async () => {
    await expectTypedError(
      unauthClient.settings.updateUiThemeSettings({ logo_url: null, favicon_url: null }),
      401,
    );
  });

  it('uploadLogo → 401 with bogus key', async () => {
    const blob = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' });
    await expectTypedError(unauthClient.settings.uploadLogo(blob, { filename: 'logo.png' }), 401);
  });
});

// ─── Email event settings ───────────────────────────────────────────────────

describe('Email event settings', () => {
  it('getSettings returns a settings list (with shape)', async () => {
    const r = await client.emailEvents.getSettings();
    // Top-level shape
    expect(Array.isArray(r.settings)).toBe(true);
    // Per-element shape — only validate when non-empty
    expect(Array.isArray(r.settings)).toBe(true);
    for (const s of r.settings) {
      expect(typeof s.event).toBe('string');
      expect(typeof s.enabled).toBe('boolean');
    }
  });

  it('getSettings → 401 with bogus key', async () => {
    await expectTypedError(unauthClient.emailEvents.getSettings(), 401);
  });

  it('updateSettings → 401 with bogus key', async () => {
    await expectTypedError(
      unauthClient.emailEvents.updateSettings({ settings: [] }),
      401,
    );
  });

  it('resetSettings → 401 with bogus key', async () => {
    await expectTypedError(unauthClient.emailEvents.resetSettings(), 401);
  });
});
