/**
 * @group e2e
 *
 * E2E coverage for the parity-gap additions: unified access groups,
 * top-level interactions, OpenAI passthrough admin CRUD, Gemini global
 * model actions, engines aliases, and the misc/realtime/responses/MCP
 * additions wired in alongside them.
 *
 * Assertion policy: every test commits to ONE outcome — success-with-shape
 * or a single typed error status. See `_assertions.ts`.
 */
import { LiteLLMClient } from '../../src/client';
import { expectShape, expectTypedError } from './_assertions';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMClient;

beforeAll(() => {
  client = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 60_000,
    maxRetries: 1,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Unified access groups
// ─────────────────────────────────────────────────────────────────────────────

describe('UnifiedAccessGroupsResource', () => {
  it('list() returns the (possibly empty) array of groups', async () => {
    const r = await client.unifiedAccessGroups.list();
    expect(Array.isArray(r)).toBe(true);
  });

  it('create() with missing required field rejects 422', async () => {
    await expectTypedError(
      client.unifiedAccessGroups.create({} as any),
      422,
    );
  });

  it('retrieve(unknown id) rejects 404', async () => {
    await expectTypedError(
      client.unifiedAccessGroups.retrieve(`nonexistent-${Date.now()}`),
      404,
    );
  });

  it('update(unknown id) rejects 404', async () => {
    await expectTypedError(
      client.unifiedAccessGroups.update(`nonexistent-${Date.now()}`, {}),
      404,
    );
  });

  it('delete(unknown id) rejects 404', async () => {
    await expectTypedError(
      client.unifiedAccessGroups.delete(`nonexistent-${Date.now()}`),
      404,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Interactions (top-level)
// ─────────────────────────────────────────────────────────────────────────────

describe('InteractionsResource', () => {
  it('create() with no model rejects 400', async () => {
    await expectTypedError(client.interactions.create({}), 400);
  });

  // The OSS build returns 200 with an `error` field in the body for unknown
  // ids on bare `/interactions/{id}` rather than rejecting with a typed
  // status. Assert the error envelope shape so a future status fix surfaces
  // as a red test.
  it('retrieve(unknown id) returns a 200 envelope with an error field', async () => {
    const r = (await client.interactions.retrieve('nonexistent-id')) as {
      error?: { message?: string };
    };
    expect(typeof r.error?.message).toBe('string');
  });

  it('delete(unknown id) rejects 500 on this OSS build', async () => {
    await expectTypedError(client.interactions.delete('nonexistent-id'), 500);
  });

  it('cancel(unknown id) rejects 500 on this OSS build', async () => {
    await expectTypedError(client.interactions.cancel('nonexistent-id'), 500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI passthrough admin CRUD
// ─────────────────────────────────────────────────────────────────────────────

describe('OpenAIPassthroughResource', () => {
  // The proxy returns 404 when no passthrough config matches the requested id.
  it('retrieve(unknown id) rejects 404', async () => {
    await expectTypedError(
      client.openaiPassthrough.retrieve(`nonexistent-${Date.now()}`),
      404,
    );
  });

  it('create(unknown id) rejects 404 (no upstream registered)', async () => {
    await expectTypedError(
      client.openaiPassthrough.create(`nonexistent-${Date.now()}`, {}),
      404,
    );
  });

  it('update(unknown id) rejects 404', async () => {
    await expectTypedError(
      client.openaiPassthrough.update(`nonexistent-${Date.now()}`, {}),
      404,
    );
  });

  it('replace(unknown id) rejects 404', async () => {
    await expectTypedError(
      client.openaiPassthrough.replace(`nonexistent-${Date.now()}`, {}),
      404,
    );
  });

  it('delete(unknown id) rejects 404', async () => {
    await expectTypedError(
      client.openaiPassthrough.delete(`nonexistent-${Date.now()}`),
      404,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Gemini global model actions
// ─────────────────────────────────────────────────────────────────────────────

describe('Gemini global model actions', () => {
  it('models.retrieve(unknown) rejects 404', async () => {
    await expectTypedError(
      client.gemini.models.retrieve(`nonexistent-${Date.now()}`),
      404,
    );
  });

  it('models.countTokens() returns a token count', async () => {
    const r = await client.gemini.models.countTokens('gemini-1.5-flash', {
      contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
    });
    expect(typeof r).toBe('object');
    if (r && typeof (r as { totalTokens?: unknown }).totalTokens !== 'undefined') {
      expect(typeof (r as { totalTokens: number }).totalTokens).toBe('number');
    }
  });

  it('models.generateContent rejects 500 without provider creds (no GEMINI_API_KEY here)', async () => {
    await expectTypedError(
      client.gemini.models.generateContent('gemini-1.5-flash', {
        contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
      }),
      500,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Engines-prefixed aliases
// ─────────────────────────────────────────────────────────────────────────────

describe('Engines-prefixed aliases', () => {
  it('chat.engines.create rejects 400 (no model resolved)', async () => {
    await expectTypedError(
      client.chat.engines.create('fake-engine', {
        model: 'fake-engine',
        messages: [{ role: 'user', content: 'hi' }],
      } as any),
      400,
    );
  });

  it('completions.engines.create rejects 400 (no model resolved)', async () => {
    await expectTypedError(
      client.completions.engines.create('fake-engine', {
        model: 'fake-engine',
        prompt: 'hi',
      } as any),
      400,
    );
  });

  it('embeddings.engines.create rejects 400 (no model resolved)', async () => {
    await expectTypedError(
      client.embeddings.engines.create('fake-engine', {
        model: 'fake-engine',
        input: 'hi',
      } as any),
      400,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Misc additions
// ─────────────────────────────────────────────────────────────────────────────

describe('Misc parity additions', () => {
  it('misc.register() returns a client_id payload', async () => {
    const r = await expectShape(client.misc.register({ client_name: 'parity-test' }), {});
    expect(typeof r.client_id).toBe('string');
  });

  it('users.availableUsers() returns the seat-usage summary', async () => {
    const r = await expectShape(client.users.availableUsers(), {});
    expect(typeof r.total_users_used).toBe('number');
    expect(typeof r.total_teams_used).toBe('number');
  });

  it('health.livenessAlias() returns a liveness payload', async () => {
    const r = await client.health.livenessAlias();
    // The proxy responds with a bare string `"I'm alive!"` here; assert
    // exactly so a future shape change surfaces as a red test.
    expect(r).toBe("I'm alive!");
  });

  it('prompts.patch(unknown) rejects 404', async () => {
    await expectTypedError(
      client.prompts.patch(`nonexistent-${Date.now()}`, { description: 'x' }),
      404,
    );
  });

  it('prompts.listLegacy() returns the wrapped { prompts } envelope', async () => {
    const r = await expectShape(client.prompts.listLegacy(), {});
    expect(Array.isArray(r.prompts)).toBe(true);
  });

  it('realtime.list rejects 404 on this proxy build (route present, no handler)', async () => {
    await expectTypedError(client.realtime.list(), 404);
  });

  // The proxy returns 405 (Method Not Allowed) for GET /v1/responses on this
  // build because it expects POST. Pinned explicitly so a future server-side
  // fix surfaces as a red test we can relax to expectShape.
  it('responses.list rejects 405 on this proxy build', async () => {
    await expectTypedError(client.responses.list(), 405);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MCP v1-prefixed variants
// ─────────────────────────────────────────────────────────────────────────────

describe('MCP v1 variants', () => {
  it('servers.deleteV1(unknown id) rejects 404', async () => {
    await expectTypedError(
      client.mcp.servers.deleteV1(`nonexistent-${Date.now()}`),
      404,
    );
  });

  // The OSS build raises a 500 inside the toolset deletion path when the id
  // doesn't exist. Pinned exactly so a future handler fix surfaces as a red
  // test we can relax to 404.
  it('toolsets.deleteV1(unknown id) rejects 500 on this proxy build', async () => {
    await expectTypedError(
      client.mcp.toolsets.deleteV1(`nonexistent-${Date.now()}`),
      500,
    );
  });

  it('servers.protocol.oauthSessionV1 returns a session record', async () => {
    const r = (await expectShape(
      client.mcp.servers.protocol.oauthSessionV1({}),
      {},
    )) as { server_id?: string };
    expect(typeof r.server_id).toBe('string');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssemblyAI EU passthrough
// ─────────────────────────────────────────────────────────────────────────────

describe('AssemblyAI EU passthrough', () => {
  it('get(/) rejects 404 on this build (no upstream EU credentials)', async () => {
    await expectTypedError(client.passThrough.assemblyAiEu.get('/'), 404);
  });
});
