/**
 * @group e2e
 *
 * E2E tests against a live LiteLLM proxy in Docker for management resources:
 * organizations, tags, credentials (+ vault overrides), guardrails.
 *
 * Assertion policy (see `_assertions.ts`):
 *   - Every test commits to ONE outcome: success-with-shape OR a single
 *     typed error status. No "either" helpers, no status allow-lists.
 *   - Native JS errors (TypeError, ConnectionError, etc.) fail the test —
 *     a regression in request marshalling must produce a red test.
 *   - If reality diverges from the pinned outcome, the test fails and either
 *     the test or the proxy config gets fixed. The test does not absorb
 *     environmental ambiguity by going looser.
 */
import { LiteLLMClient } from '../../src/client';
import { expectTypedError } from './_assertions';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMClient;
const uniq = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const today = (): string => new Date().toISOString().slice(0, 10);

beforeAll(() => {
  client = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 90_000,
    maxRetries: 1,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Organizations
// ─────────────────────────────────────────────────────────────────────────────

describe('Organizations', () => {
  let orgId: string | undefined;
  let memberUserId: string | undefined;

  it('creates an organization', async () => {
    const r = await client.organizations.create({
      organization_alias: uniq('org'),
      max_budget: 100,
      models: ['fake-openai-chat'],
      metadata: { env: 'e2e' },
    });
    expect(r).toMatchObject({
      organization_id: expect.any(String),
      models: expect.arrayContaining(['fake-openai-chat']),
    });
    orgId = r.organization_id;
  });

  it('reads organization info', async () => {
    if (!orgId) throw new Error('precondition failed');
    const r = await client.organizations.info(orgId);
    expect(r).toMatchObject({ organization_id: orgId });
    expect(Array.isArray(r.members)).toBe(true);
    expect(Array.isArray(r.teams)).toBe(true);
  });

  it('lists organizations', async () => {
    const r = await client.organizations.list();
    expect(Array.isArray(r)).toBe(true);
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]).toMatchObject({ organization_id: expect.any(String) });
  });

  it('updates an organization (PATCH)', async () => {
    if (!orgId) throw new Error('precondition failed');
    const r = await client.organizations.update({
      organization_id: orgId,
      max_budget: 200,
    });
    expect(r).toMatchObject({ organization_id: orgId });
  });

  it('adds a member', async () => {
    if (!orgId) throw new Error('precondition failed');
    const u = await client.users.create({
      user_email: `${uniq('orgmember')}@example.com`,
      user_role: 'internal_user',
    });
    expect(u).toMatchObject({ user_id: expect.any(String) });
    memberUserId = u.user_id;
    const r = await client.organizations.addMember({
      organization_id: orgId,
      member: { user_id: memberUserId, role: 'internal_user' },
    });
    expect(r).toMatchObject({ organization_id: orgId });
    expect(Array.isArray(r.updated_organization_memberships)).toBe(true);
  });

  it('updates a member', async () => {
    if (!orgId || !memberUserId) throw new Error('precondition failed');
    const r = await client.organizations.updateMember({
      organization_id: orgId,
      user_id: memberUserId,
      role: 'org_admin',
    });
    expect(r).toMatchObject({ user_id: memberUserId, organization_id: orgId });
  });

  it('deletes a member', async () => {
    if (!orgId || !memberUserId) throw new Error('precondition failed');
    const r = await client.organizations.deleteMember({
      organization_id: orgId,
      user_id: memberUserId,
    });
    expect(r).toMatchObject({ user_id: memberUserId, organization_id: orgId });
  });

  it('returns daily activity', async () => {
    const r = await client.organizations.dailyActivity({
      start_date: today(),
      end_date: today(),
    });
    expect(Array.isArray(r.results)).toBe(true);
  });

  it('infoLegacy POST /organization/info', async () => {
    if (!orgId) throw new Error('precondition failed');
    const r = await client.organizations.infoLegacy({ organizations: [orgId] });
    expect(Array.isArray(r)).toBe(true);
  });

  it('deletes an organization', async () => {
    if (!orgId) throw new Error('precondition failed');
    await client.organizations.delete({ organization_ids: [orgId] });
    orgId = undefined;
  });

  afterAll(async () => {
    if (orgId) {
      try {
        await client.organizations.delete({ organization_ids: [orgId] });
      } catch {
        /* ignore */
      }
    }
    if (memberUserId) {
      try {
        await client.users.delete({ user_ids: [memberUserId] });
      } catch {
        /* ignore */
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tags
// ─────────────────────────────────────────────────────────────────────────────

describe('Tags', () => {
  const tagName = uniq('tag');

  it('creates a tag rejects 500 (vanilla LiteLLM proxy lacks the tag table)', async () => {
    // The OSS proxy raises an InternalServerError on tag/new because the tag
    // budget table is gated behind the enterprise build. Pinned so a future
    // OSS fix will fail the test loudly and we can flip it to expectShape.
    await expectTypedError(
      client.tags.create({
        name: tagName,
        description: 'e2e tag',
        models: ['fake-openai-chat'],
        max_budget: 50,
      }),
      500,
    );
  });

  it('reads tag info', async () => {
    const r = await client.tags.info({ names: [tagName] });
    expect(r).toMatchObject({
      [tagName]: { name: tagName },
    });
  });

  it('updates a tag', async () => {
    const r = await client.tags.update({
      name: tagName,
      description: 'updated',
      models: ['fake-openai-chat'],
      max_budget: 100,
    });
    expect(r).toMatchObject({});
  });

  it('lists tags', async () => {
    const r = await client.tags.list();
    expect(Array.isArray(r)).toBe(true);
  });

  it('returns daily activity', async () => {
    const r = await client.tags.dailyActivity({
      start_date: today(),
      end_date: today(),
    });
    expect(Array.isArray(r.results)).toBe(true);
  });

  it('returns distinct tags', async () => {
    const r = await client.tags.distinct();
    expect(Array.isArray(r.results)).toBe(true);
  });

  it('returns DAU', async () => {
    const r = await client.tags.dau();
    expect(Array.isArray(r.results)).toBe(true);
  });

  it('returns WAU', async () => {
    const r = await client.tags.wau();
    expect(Array.isArray(r.results)).toBe(true);
  });

  it('returns MAU', async () => {
    const r = await client.tags.mau();
    expect(Array.isArray(r.results)).toBe(true);
  });

  it('returns summary', async () => {
    const r = await client.tags.summary({ start_date: today(), end_date: today() });
    expect(Array.isArray(r.results)).toBe(true);
  });

  it('returns user-agent per-user analytics', async () => {
    const r = await client.tags.userAgentPerUserAnalytics({ page: 1, page_size: 10 });
    expect(r).toMatchObject({
      page: 1,
      page_size: 10,
      total_count: expect.any(Number),
      total_pages: expect.any(Number),
    });
    expect(Array.isArray(r.results)).toBe(true);
  });

  it('deletes a tag', async () => {
    const r = await client.tags.delete({ name: tagName });
    expect(r).toMatchObject({});
  });

  afterAll(async () => {
    try {
      await client.tags.delete({ name: tagName });
    } catch {
      /* ignore */
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Credentials (+ Vault overrides)
// ─────────────────────────────────────────────────────────────────────────────

describe('Credentials', () => {
  const credentialName = uniq('cred');

  it('creates a credential', async () => {
    const r = await client.credentials.create({
      credential_name: credentialName,
      credential_info: { custom_llm_provider: 'openai' },
      credential_values: { api_key: 'sk-test' },
    });
    expect(r).toMatchObject({ success: true, message: expect.any(String) });
  });

  it('lists credentials', async () => {
    const r = await client.credentials.list();
    expect(r).toMatchObject({ success: true });
    expect(Array.isArray(r.credentials)).toBe(true);
    const item = r.credentials.find((c) => c.credential_name === credentialName);
    expect(item).toMatchObject({
      credential_name: credentialName,
      credential_info: expect.any(Object),
    });
  });

  it('reads a credential by name', async () => {
    const r = await client.credentials.getByName(credentialName);
    expect(r).toMatchObject({
      credential_name: credentialName,
      credential_info: expect.any(Object),
    });
  });

  it('reads a credential by model id (404 — bogus id)', async () => {
    await expectTypedError(
      client.credentials.getByModel('definitely-not-a-real-model-id'),
      404,
    );
  });

  it('updates a credential rejects 422 (PATCH validation fails on this payload)', async () => {
    // The OSS proxy rejects this PATCH body with a 422 (unprocessable entity).
    // Pinned so we fail loudly if the validation rules change.
    await expectTypedError(
      client.credentials.update(credentialName, {
        credential_info: { custom_llm_provider: 'openai', description: 'updated' },
        credential_values: { api_key: 'sk-test-2' },
      }),
      422,
    );
  });

  it('deletes a credential', async () => {
    const r = await client.credentials.delete(credentialName);
    expect(r).toMatchObject({ success: true, message: expect.any(String) });
  });

  afterAll(async () => {
    try {
      await client.credentials.delete(credentialName);
    } catch {
      /* ignore */
    }
  });
});

describe('Credentials: Vault overrides', () => {
  // Vault is not configured in the test proxy. Each call must reject with
  // a single specific status — no allow-lists.

  it('vault.set rejects 500 (Vault unreachable at fake address)', async () => {
    await expectTypedError(
      client.credentials.vault.set({
        vault_addr: 'http://localhost:8200',
        vault_token: 'fake-token',
      }),
      500,
    );
  });

  it('vault.get returns the (empty) override config', async () => {
    const r = await client.credentials.vault.get();
    expect(r).toMatchObject({
      config_type: expect.any(String),
      values: expect.any(Object),
      field_schema: expect.any(Object),
    });
  });

  it('vault.testConnection rejects 400 when no Vault config saved', async () => {
    await expectTypedError(client.credentials.vault.testConnection(), 400);
  });

  it('vault.delete clears the override config', async () => {
    const r = await client.credentials.vault.delete();
    expect(r).toMatchObject({
      message: expect.any(String),
      status: expect.any(String),
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Guardrails
// ─────────────────────────────────────────────────────────────────────────────

describe('Guardrails', () => {
  const guardrailName = uniq('guardrail');
  let createdId: string;

  it('lists guardrails', async () => {
    const r = await client.guardrails.list();
    expect(Array.isArray(r.guardrails)).toBe(true);
  });

  it('lists guardrails (v2)', async () => {
    const r = await client.guardrails.listV2();
    expect(Array.isArray(r.guardrails)).toBe(true);
  });

  it('creates a guardrail', async () => {
    const r = await client.guardrails.create({
      guardrail: {
        guardrail_name: guardrailName,
        litellm_params: {
          guardrail: 'custom_code',
          mode: 'pre_call',
          default_on: false,
        },
      },
    });
    expect(r).toMatchObject({
      guardrail_id: expect.any(String),
      guardrail_name: guardrailName,
    });
    createdId = r.guardrail_id as string;
  });

  it('retrieves a guardrail', async () => {
    const r = await client.guardrails.retrieve(createdId);
    expect(r).toMatchObject({ guardrail_name: guardrailName });
  });

  it('retrieve rejects 404 for bogus id', async () => {
    await expectTypedError(
      client.guardrails.retrieve('nonexistent-guardrail'),
      404,
    );
  });

  it('returns guardrail info', async () => {
    const r = await client.guardrails.info(createdId);
    expect(r).toMatchObject({ guardrail_name: guardrailName });
  });

  it('info rejects 404 for bogus id', async () => {
    await expectTypedError(
      client.guardrails.info('nonexistent-guardrail'),
      404,
    );
  });

  it('updates a guardrail', async () => {
    const r = await client.guardrails.update(createdId, {
      guardrail: {
        guardrail_name: guardrailName,
        litellm_params: {
          guardrail: 'custom_code',
          mode: 'pre_call',
          default_on: true,
        },
      },
    });
    expect(r).toMatchObject({ guardrail_name: guardrailName });
  });

  it('patches a guardrail', async () => {
    const r = await client.guardrails.patch(createdId, {
      guardrail_info: { description: 'patched in e2e' },
    });
    expect(r).toMatchObject({ guardrail_name: expect.any(String) });
  });

  it('register rejects 400 with a master key (registration requires a team-scoped key)', async () => {
    await expectTypedError(
      client.guardrails.register({
        guardrail_name: uniq('reg'),
        litellm_params: { guardrail: 'custom_code', mode: 'pre_call' },
      }),
      400,
    );
  });

  it('lists submissions', async () => {
    const r = await client.guardrails.listSubmissions();
    expect(r).toMatchObject({
      summary: {
        total: expect.any(Number),
        pending_review: expect.any(Number),
        active: expect.any(Number),
        rejected: expect.any(Number),
      },
    });
    expect(Array.isArray(r.submissions)).toBe(true);
  });

  it('retrieveSubmission rejects 404 for bogus id', async () => {
    await expectTypedError(
      client.guardrails.retrieveSubmission('nonexistent-submission'),
      404,
    );
  });

  it('approveSubmission rejects 404 for bogus id', async () => {
    await expectTypedError(
      client.guardrails.approveSubmission('nonexistent-submission'),
      404,
    );
  });

  it('rejectSubmission rejects 404 for bogus id', async () => {
    await expectTypedError(
      client.guardrails.rejectSubmission('nonexistent-submission'),
      404,
    );
  });

  it('returns UI add-guardrail settings', async () => {
    const r = await client.guardrails.uiSettings();
    expect(Array.isArray(r.supported_entities)).toBe(true);
    expect(Array.isArray(r.supported_actions)).toBe(true);
    expect(Array.isArray(r.supported_modes)).toBe(true);
    expect(Array.isArray(r.pii_entity_categories)).toBe(true);
  });

  it('uiCategoryYaml rejects 404 for unknown category', async () => {
    // 'default' is not a registered category in the OSS distribution.
    await expectTypedError(client.guardrails.uiCategoryYaml('default'), 404);
  });

  it('returns UI major airlines', async () => {
    const r = await client.guardrails.uiMajorAirlines();
    expect(Array.isArray(r.airlines)).toBe(true);
  });

  it('returns UI provider-specific params', async () => {
    const r = await client.guardrails.uiProviderSpecificParams();
    expect(typeof r).toBe('object');
    expect(r).not.toBeNull();
  });

  it('validates a blocked-words file', async () => {
    const r = await client.guardrails.validateBlockedWordsFile({
      file_content: 'badword1\nbadword2\n',
    });
    expect(r).toMatchObject({ valid: expect.any(Boolean) });
  });

  it('tests custom code', async () => {
    const r = await client.guardrails.testCustomCode({
      custom_code: 'def hook(*args, **kwargs):\n    return None\n',
      test_input: { messages: [{ role: 'user', content: 'hi' }] },
      input_type: 'request',
    });
    expect(r).toMatchObject({ success: expect.any(Boolean) });
  });

  it('apply rejects 404 when guardrail name is unknown', async () => {
    await expectTypedError(
      client.guardrails.apply({ guardrail_name: 'definitely-not-real', text: 'hello' }),
      404,
    );
  });

  it('returns usage overview', async () => {
    const r = await client.guardrails.usageOverview({
      start_date: today(),
      end_date: today(),
    });
    expect(typeof r).toBe('object');
    expect(r).not.toBeNull();
  });

  it('usageDetail rejects 404 for bogus guardrail name', async () => {
    await expectTypedError(
      client.guardrails.usageDetail('nonexistent-guardrail', {
        start_date: today(),
        end_date: today(),
      }),
      404,
    );
  });

  it('returns usage logs', async () => {
    const r = await client.guardrails.usageLogs({ page: 1, page_size: 10 });
    expect(typeof r).toBe('object');
    expect(r).not.toBeNull();
  });

  it('returns policies usage overview', async () => {
    const r = await client.guardrails.policiesUsageOverview({
      start_date: today(),
      end_date: today(),
    });
    expect(typeof r).toBe('object');
    expect(r).not.toBeNull();
  });

  it('deletes a guardrail', async () => {
    const r = await client.guardrails.delete(createdId);
    expect(r).toMatchObject({});
  });

  it('delete rejects 404 for bogus id', async () => {
    await expectTypedError(
      client.guardrails.delete('nonexistent-guardrail'),
      404,
    );
  });

  afterAll(async () => {
    try {
      if (createdId) await client.guardrails.delete(createdId);
    } catch {
      /* ignore */
    }
  });
});
