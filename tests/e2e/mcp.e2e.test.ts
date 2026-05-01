/**
 * @group e2e
 *
 * E2E tests for the MCP resource against a live LiteLLM proxy in Docker.
 *
 * Assertion policy: every test commits to ONE outcome — success-with-shape
 * or a single typed error status. See `_assertions.ts`.
 *
 * KNOWN SDK BUG (documented in tests below):
 *   The proxy's MCP endpoints require `Accept: text/event-stream` (and for
 *   some POST/DELETE routes, both `application/json` and `text/event-stream`).
 *   The SDK does not send these headers today, so every MCP endpoint returns
 *   406 (or 405 for some POST/DELETE routes that fall through to the session
 *   handler). The tests below pin the *current* behaviour so a future SDK fix
 *   that adds the right Accept headers will fail these tests loudly and we
 *   can flip them to the expected success / 404 outcomes.
 */
import { LiteLLMClient } from '../../src/client';
import { expectTypedError } from './_assertions';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMClient;
const uniq = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(() => {
  client = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 60_000,
    maxRetries: 1,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// tools / access groups / network / registry / userCredentials — all 406
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: tools', () => {
  it('list rejects 406 (SDK does not send Accept: text/event-stream)', async () => {
    await expectTypedError(client.mcp.tools.list(), 406);
  });
});

describe('MCP: accessGroups', () => {
  it('list rejects 406 (SDK does not send Accept: text/event-stream)', async () => {
    await expectTypedError(client.mcp.accessGroups.list(), 406);
  });
});

describe('MCP: network', () => {
  it('clientIp rejects 406 (SDK does not send Accept: text/event-stream)', async () => {
    await expectTypedError(client.mcp.network.clientIp(), 406);
  });
});

describe('MCP: registry', () => {
  it('json rejects 406', async () => {
    await expectTypedError(client.mcp.registry.json(), 406);
  });

  it('openapi rejects 406', async () => {
    await expectTypedError(client.mcp.registry.openapi(), 406);
  });

  it('discover with query/category rejects 406', async () => {
    await expectTypedError(
      client.mcp.registry.discover({ query: 'test', category: 'general' }),
      406,
    );
  });

  it('discover with no params rejects 406', async () => {
    await expectTypedError(client.mcp.registry.discover(), 406);
  });
});

describe('MCP: userCredentials', () => {
  it('list rejects 406', async () => {
    await expectTypedError(client.mcp.userCredentials.list(), 406);
  });
});

describe('MCP: makePublic', () => {
  it('rejects 406 (Accept must include both application/json and text/event-stream)', async () => {
    await expectTypedError(client.mcp.makePublic({ mcp_server_ids: [] }), 406);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// servers — listing/POST routes return 406; some DELETEs/PUTs return 405
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: servers', () => {
  it('list rejects 406', async () => {
    await expectTypedError(client.mcp.servers.list(), 406);
  });

  it('list filtered by team_id rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.list({ team_id: 'nonexistent-team' }),
      406,
    );
  });

  it('health rejects 406', async () => {
    await expectTypedError(client.mcp.servers.health(), 406);
  });

  it('health with filter rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.health({ server_ids: ['fake-id-1', 'fake-id-2'] }),
      406,
    );
  });

  it('listSubmissions rejects 406', async () => {
    await expectTypedError(client.mcp.servers.listSubmissions(), 406);
  });

  it('add rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.add({
        server_name: uniq('mcp-server'),
        alias: uniq('alias'),
        description: 'e2e test server',
        transport: 'http',
        auth_type: 'none',
        url: 'https://example.invalid/mcp',
      }),
      406,
    );
  });

  it('edit(fake-server-id) rejects 405 (method routes through session handler)', async () => {
    await expectTypedError(
      client.mcp.servers.edit({
        server_id: 'fake-server-id',
        server_name: 'fake',
        url: 'https://example.invalid/mcp',
      }),
      405,
    );
  });

  it('register rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.register({
        server_name: uniq('mcp-register'),
        description: 'e2e register',
        transport: 'http',
        auth_type: 'none',
        url: 'https://example.invalid/mcp',
      }),
      406,
    );
  });

  it('retrieve(fake-id) rejects 406', async () => {
    await expectTypedError(client.mcp.servers.retrieve('fake-id'), 406);
  });

  it('delete(fake-id) rejects 405 (session-termination handler)', async () => {
    await expectTypedError(client.mcp.servers.delete('fake-id'), 405);
  });

  it('approveSubmission(fake-id) rejects 405', async () => {
    await expectTypedError(client.mcp.servers.approveSubmission('fake-id'), 405);
  });

  it('rejectSubmission(fake-id) rejects 405', async () => {
    await expectTypedError(
      client.mcp.servers.rejectSubmission('fake-id', { review_notes: 'nope' }),
      405,
    );
  });

  // ── OAuth flow ─────────────────────────────────────────────────────────────

  it('oauthSession(fake-id) rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.oauthSession({
        server_id: 'fake-id',
        redirect_uri: 'https://example.invalid/cb',
      }),
      406,
    );
  });

  it('oauthAuthorize(fake-id) rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.oauthAuthorize('fake-id', {
        redirect_uri: 'https://example.invalid/cb',
        client_id: 'fake-client',
        state: 'xyz',
        response_type: 'code',
      }),
      406,
    );
  });

  it('oauthToken(fake-id) rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.oauthToken('fake-id', {
        grant_type: 'authorization_code',
        code: 'fake-code',
        redirect_uri: 'https://example.invalid/cb',
        client_id: 'fake-client',
      }),
      406,
    );
  });

  it('oauthRegister(fake-id) rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.oauthRegister('fake-id', {
        client_name: 'e2e-client',
        grant_types: ['authorization_code'],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_basic',
      }),
      406,
    );
  });

  // ── User credentials (BYOK) ────────────────────────────────────────────────

  it('setUserCredential(fake-id) rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.setUserCredential('fake-id', {
        credential: 'fake-secret',
        save: false,
      }),
      406,
    );
  });

  it('deleteUserCredential(fake-id) rejects 405', async () => {
    await expectTypedError(
      client.mcp.servers.deleteUserCredential('fake-id'),
      405,
    );
  });

  // ── User credentials (OAuth2) ──────────────────────────────────────────────

  it('setOAuthUserCredential(fake-id) rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.setOAuthUserCredential('fake-id', {
        access_token: 'fake-access',
        refresh_token: 'fake-refresh',
        expires_in: 3600,
        scopes: ['read'],
      }),
      406,
    );
  });

  it('deleteOAuthUserCredential(fake-id) rejects 405', async () => {
    await expectTypedError(
      client.mcp.servers.deleteOAuthUserCredential('fake-id'),
      405,
    );
  });

  it('oauthUserCredentialStatus(fake-id) rejects 406', async () => {
    await expectTypedError(
      client.mcp.servers.oauthUserCredentialStatus('fake-id'),
      406,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// toolsets
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP: toolsets', () => {
  it('list rejects 406', async () => {
    await expectTypedError(client.mcp.toolsets.list(), 406);
  });

  it('add rejects 406', async () => {
    await expectTypedError(
      client.mcp.toolsets.add({
        toolset_name: uniq('toolset'),
        description: 'e2e toolset',
        tools: [{ server_id: 'fake-id', tool_name: 'echo' }],
      }),
      406,
    );
  });

  it('retrieve(fake-id) rejects 406', async () => {
    await expectTypedError(client.mcp.toolsets.retrieve('fake-id'), 406);
  });

  it('edit(fake-id) rejects 405', async () => {
    await expectTypedError(
      client.mcp.toolsets.edit({
        toolset_id: 'fake-id',
        toolset_name: 'updated',
        description: 'updated',
      }),
      405,
    );
  });

  it('remove(fake-id) rejects 405', async () => {
    await expectTypedError(client.mcp.toolsets.remove('fake-id'), 405);
  });
});
