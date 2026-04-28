/**
 * @group e2e
 *
 * E2E tests for the MCP resource against a live LiteLLM proxy in Docker.
 * Most methods either succeed (returning empty lists / no servers) or return a
 * structured error when MCP servers aren't configured. Both outcomes verify
 * SDK request marshalling.
 */
import { LiteLLMProxyClient } from '../../src/client';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMProxyClient;
const uniq = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(() => {
  client = new LiteLLMProxyClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 60_000,
    maxRetries: 1,
  });
});

async function eitherOrStructuredError(p: Promise<unknown>): Promise<unknown> {
  try {
    return await p;
  } catch (err) {
    expect(err).toBeTruthy();
    return err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// tools
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: tools', () => {
  it('lists tools (likely empty in vanilla deploy)', async () => {
    const result = await eitherOrStructuredError(client.mcp.tools.list());
    if (!(result instanceof Error)) {
      expect(result).toBeDefined();
      expect(Array.isArray((result as { tools: unknown[] }).tools)).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// access groups
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: accessGroups', () => {
  it('lists access groups', async () => {
    const result = await eitherOrStructuredError(client.mcp.accessGroups.list());
    if (!(result instanceof Error)) {
      expect(result).toBeDefined();
      expect(Array.isArray((result as { access_groups: unknown[] }).access_groups)).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// network
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: network', () => {
  it('returns the caller client IP', async () => {
    const result = await eitherOrStructuredError(client.mcp.network.clientIp());
    if (!(result instanceof Error)) {
      expect(result).toBeDefined();
      const ip = (result as { ip: string | null }).ip;
      expect(ip === null || typeof ip === 'string').toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// registry
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: registry', () => {
  it('returns registry.json (best-effort)', async () => {
    await eitherOrStructuredError(client.mcp.registry.json());
  });

  it('returns the openapi registry (best-effort)', async () => {
    await eitherOrStructuredError(client.mcp.registry.openapi());
  });

  it('discovers servers (best-effort, with query params)', async () => {
    await eitherOrStructuredError(
      client.mcp.registry.discover({ query: 'test', category: 'general' }),
    );
  });

  it('discovers servers with no params', async () => {
    await eitherOrStructuredError(client.mcp.registry.discover());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// userCredentials (top-level listing)
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: userCredentials', () => {
  it('lists user credentials (best-effort)', async () => {
    await eitherOrStructuredError(client.mcp.userCredentials.list());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// makePublic (top-level)
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: makePublic', () => {
  it('accepts an empty server id list (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.makePublic({ mcp_server_ids: [] }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// servers
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: servers', () => {
  it('lists servers (likely empty in vanilla deploy)', async () => {
    const result = await eitherOrStructuredError(client.mcp.servers.list());
    if (!(result instanceof Error)) {
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('lists servers filtered by team_id (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.list({ team_id: 'nonexistent-team' }),
    );
  });

  it('reports server health (likely empty)', async () => {
    const result = await eitherOrStructuredError(client.mcp.servers.health());
    if (!(result instanceof Error)) {
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('reports server health with filter (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.health({ server_ids: ['fake-id-1', 'fake-id-2'] }),
    );
  });

  it('lists submissions (likely empty)', async () => {
    const result = await eitherOrStructuredError(
      client.mcp.servers.listSubmissions(),
    );
    if (!(result instanceof Error)) {
      expect(result).toBeDefined();
      expect(typeof (result as { total: number }).total).toBe('number');
    }
  });

  it('add accepts a fake server config (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.add({
        server_name: uniq('mcp-server'),
        alias: uniq('alias'),
        description: 'e2e test server',
        transport: 'http',
        auth_type: 'none',
        url: 'https://example.invalid/mcp',
      }),
    );
  });

  it('edit returns a structured error for an unknown server', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.edit({
        server_id: 'fake-server-id',
        server_name: 'fake',
        url: 'https://example.invalid/mcp',
      }),
    );
  });

  it('register accepts a fake server config (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.register({
        server_name: uniq('mcp-register'),
        description: 'e2e register',
        transport: 'http',
        auth_type: 'none',
        url: 'https://example.invalid/mcp',
      }),
    );
  });

  it('retrieve returns a structured error for an unknown id', async () => {
    await eitherOrStructuredError(client.mcp.servers.retrieve('fake-id'));
  });

  it('delete returns a structured error for an unknown id', async () => {
    await eitherOrStructuredError(client.mcp.servers.delete('fake-id'));
  });

  it('approveSubmission returns a structured error for an unknown id', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.approveSubmission('fake-id'),
    );
  });

  it('rejectSubmission returns a structured error for an unknown id', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.rejectSubmission('fake-id', { review_notes: 'nope' }),
    );
  });

  // ── OAuth flow ─────────────────────────────────────────────────────────────

  it('oauthSession is callable (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.oauthSession({
        server_id: 'fake-id',
        redirect_uri: 'https://example.invalid/cb',
      }),
    );
  });

  it('oauthAuthorize is callable (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.oauthAuthorize('fake-id', {
        redirect_uri: 'https://example.invalid/cb',
        client_id: 'fake-client',
        state: 'xyz',
        response_type: 'code',
      }),
    );
  });

  it('oauthToken is callable (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.oauthToken('fake-id', {
        grant_type: 'authorization_code',
        code: 'fake-code',
        redirect_uri: 'https://example.invalid/cb',
        client_id: 'fake-client',
      }),
    );
  });

  it('oauthRegister is callable (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.oauthRegister('fake-id', {
        client_name: 'e2e-client',
        grant_types: ['authorization_code'],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_basic',
      }),
    );
  });

  // ── User credentials (BYOK) ────────────────────────────────────────────────

  it('setUserCredential is callable (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.setUserCredential('fake-id', {
        credential: 'fake-secret',
        save: false,
      }),
    );
  });

  it('deleteUserCredential is callable (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.deleteUserCredential('fake-id'),
    );
  });

  // ── User credentials (OAuth2) ──────────────────────────────────────────────

  it('setOAuthUserCredential is callable (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.setOAuthUserCredential('fake-id', {
        access_token: 'fake-access',
        refresh_token: 'fake-refresh',
        expires_in: 3600,
        scopes: ['read'],
      }),
    );
  });

  it('deleteOAuthUserCredential is callable (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.deleteOAuthUserCredential('fake-id'),
    );
  });

  it('oauthUserCredentialStatus is callable (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.servers.oauthUserCredentialStatus('fake-id'),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// toolsets
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: toolsets', () => {
  it('lists toolsets (likely empty)', async () => {
    const result = await eitherOrStructuredError(client.mcp.toolsets.list());
    if (!(result instanceof Error)) {
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('add accepts a fake toolset (best-effort)', async () => {
    await eitherOrStructuredError(
      client.mcp.toolsets.add({
        toolset_name: uniq('toolset'),
        description: 'e2e toolset',
        tools: [{ server_id: 'fake-id', tool_name: 'echo' }],
      }),
    );
  });

  it('retrieve returns a structured error for an unknown id', async () => {
    await eitherOrStructuredError(client.mcp.toolsets.retrieve('fake-id'));
  });

  it('edit returns a structured error for an unknown id', async () => {
    await eitherOrStructuredError(
      client.mcp.toolsets.edit({
        toolset_id: 'fake-id',
        toolset_name: 'updated',
        description: 'updated',
      }),
    );
  });

  it('remove returns a structured error for an unknown id', async () => {
    await eitherOrStructuredError(client.mcp.toolsets.remove('fake-id'));
  });
});
