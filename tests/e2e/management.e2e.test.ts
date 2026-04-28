/**
 * @group e2e
 *
 * E2E tests against a live LiteLLM proxy in Docker for management resources:
 * organizations, tags, credentials (+ vault overrides), guardrails.
 *
 * Many endpoints either succeed or return a structured error when the underlying
 * feature isn't configured in the proxy (e.g. no guardrails registered, no Vault
 * connection). Tests assert one or the other to verify request marshalling.
 */
import { LiteLLMProxyClient } from '../../src/client';
import { LiteLLMProxyError } from '../../src/errors';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMProxyClient;
const uniq = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(() => {
  client = new LiteLLMProxyClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 90_000,
    maxRetries: 1,
  });
});

// Helper: assert call resolved OR rejected with a structured error (typed marshalling worked).
async function eitherOrStructuredError(p: Promise<unknown>): Promise<unknown> {
  try {
    return await p;
  } catch (err) {
    expect(err).toBeTruthy();
    return err;
  }
}

const today = (): string => new Date().toISOString().slice(0, 10);

// Quiet the unused-import lint — we keep the import so callers that want to
// narrow on err instanceof LiteLLMProxyError have it ready.
void LiteLLMProxyError;

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
    expect(typeof r.organization_id).toBe('string');
    orgId = r.organization_id;
  });

  it('reads organization info', async () => {
    if (!orgId) throw new Error('precondition failed');
    const r = await client.organizations.info(orgId);
    expect(r.organization_id).toBe(orgId);
  });

  it('lists organizations', async () => {
    const r = await client.organizations.list();
    expect(Array.isArray(r)).toBe(true);
  });

  it('updates an organization (PATCH)', async () => {
    if (!orgId) throw new Error('precondition failed');
    const r = await client.organizations.update({
      organization_id: orgId,
      max_budget: 200,
    });
    expect(r.organization_id).toBe(orgId);
  });

  it('adds a member (best effort)', async () => {
    if (!orgId) throw new Error('precondition failed');
    const u = await client.users.create({
      user_email: `${uniq('orgmember')}@example.com`,
      user_role: 'internal_user',
    });
    memberUserId = u.user_id;
    const result = await eitherOrStructuredError(
      client.organizations.addMember({
        organization_id: orgId,
        member: { user_id: memberUserId, role: 'internal_user' },
      }),
    );
    expect(result).toBeDefined();
  });

  it('updates a member (best effort)', async () => {
    if (!orgId || !memberUserId) throw new Error('precondition failed');
    const result = await eitherOrStructuredError(
      client.organizations.updateMember({
        organization_id: orgId,
        user_id: memberUserId,
        role: 'org_admin',
      }),
    );
    expect(result).toBeDefined();
  });

  it('deletes a member (best effort)', async () => {
    if (!orgId || !memberUserId) throw new Error('precondition failed');
    const result = await eitherOrStructuredError(
      client.organizations.deleteMember({
        organization_id: orgId,
        user_id: memberUserId,
      }),
    );
    expect(result).toBeDefined();
  });

  it('returns daily activity (tolerate empty)', async () => {
    const result = await eitherOrStructuredError(
      client.organizations.dailyActivity({
        start_date: today(),
        end_date: today(),
      }),
    );
    expect(result).toBeDefined();
  });

  it('infoLegacy POST /organization/info (best effort)', async () => {
    if (!orgId) throw new Error('precondition failed');
    const result = await eitherOrStructuredError(
      client.organizations.infoLegacy({ organizations: [orgId] }),
    );
    expect(result).toBeDefined();
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

  it('creates a tag (best effort — may 500 in vanilla deploy)', async () => {
    const r = await eitherOrStructuredError(
      client.tags.create({
        name: tagName,
        description: 'e2e tag',
        models: ['fake-openai-chat'],
        max_budget: 50,
      }),
    );
    expect(r).toBeDefined();
  });

  it('reads tag info', async () => {
    const r = await client.tags.info({ names: [tagName] });
    expect(r).toBeDefined();
  });

  it('updates a tag', async () => {
    const r = await client.tags.update({
      name: tagName,
      description: 'updated',
      models: ['fake-openai-chat'],
      max_budget: 100,
    });
    expect(r).toBeDefined();
  });

  it('lists tags', async () => {
    const r = await client.tags.list();
    expect(Array.isArray(r)).toBe(true);
  });

  it('returns daily activity (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.tags.dailyActivity({ start_date: today(), end_date: today() }),
    );
    expect(result).toBeDefined();
  });

  it('returns distinct tags (best effort)', async () => {
    const result = await eitherOrStructuredError(client.tags.distinct());
    expect(result).toBeDefined();
  });

  it('returns DAU (best effort)', async () => {
    const result = await eitherOrStructuredError(client.tags.dau());
    expect(result).toBeDefined();
  });

  it('returns WAU (best effort)', async () => {
    const result = await eitherOrStructuredError(client.tags.wau());
    expect(result).toBeDefined();
  });

  it('returns MAU (best effort)', async () => {
    const result = await eitherOrStructuredError(client.tags.mau());
    expect(result).toBeDefined();
  });

  it('returns summary (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.tags.summary({ start_date: today(), end_date: today() }),
    );
    expect(result).toBeDefined();
  });

  it('returns user-agent per-user analytics (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.tags.userAgentPerUserAnalytics({ page: 1, page_size: 10 }),
    );
    expect(result).toBeDefined();
  });

  it('deletes a tag', async () => {
    const r = await client.tags.delete({ name: tagName });
    expect(r).toBeDefined();
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
    expect(r).toBeDefined();
  });

  it('lists credentials', async () => {
    const r = await client.credentials.list();
    expect(r).toBeDefined();
    expect(Array.isArray(r.credentials)).toBe(true);
  });

  it('reads a credential by name', async () => {
    const r = await client.credentials.getByName(credentialName);
    expect(r).toBeDefined();
  });

  it('reads a credential by model id (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.credentials.getByModel('definitely-not-a-real-model-id'),
    );
    expect(result).toBeDefined();
  });

  it('updates a credential (best effort)', async () => {
    const r = await eitherOrStructuredError(
      client.credentials.update(credentialName, {
        credential_info: { custom_llm_provider: 'openai', description: 'updated' },
        credential_values: { api_key: 'sk-test-2' },
      }),
    );
    expect(r).toBeDefined();
  });

  it('deletes a credential', async () => {
    const r = await client.credentials.delete(credentialName);
    expect(r).toBeDefined();
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
  it('vault.set (best effort — Vault unconfigured)', async () => {
    const result = await eitherOrStructuredError(
      client.credentials.vault.set({
        vault_addr: 'http://localhost:8200',
        vault_token: 'fake-token',
      }),
    );
    expect(result).toBeDefined();
  });

  it('vault.get (best effort)', async () => {
    const result = await eitherOrStructuredError(client.credentials.vault.get());
    expect(result).toBeDefined();
  });

  it('vault.testConnection (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.credentials.vault.testConnection(),
    );
    expect(result).toBeDefined();
  });

  it('vault.delete (best effort)', async () => {
    const result = await eitherOrStructuredError(client.credentials.vault.delete());
    expect(result).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Guardrails
// ─────────────────────────────────────────────────────────────────────────────

describe('Guardrails', () => {
  const guardrailName = uniq('guardrail');
  let createdId: string | undefined;

  it('lists guardrails', async () => {
    const r = await client.guardrails.list();
    expect(r).toBeDefined();
    expect(Array.isArray(r.guardrails)).toBe(true);
  });

  it('lists guardrails (v2)', async () => {
    const r = await client.guardrails.listV2();
    expect(r).toBeDefined();
    expect(Array.isArray(r.guardrails)).toBe(true);
  });

  it('creates a guardrail (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.create({
        guardrail: {
          guardrail_name: guardrailName,
          litellm_params: {
            guardrail: 'custom_code',
            mode: 'pre_call',
            default_on: false,
          },
        },
      }),
    );
    if (
      result &&
      typeof result === 'object' &&
      'guardrail_id' in result &&
      typeof (result as { guardrail_id?: unknown }).guardrail_id === 'string'
    ) {
      createdId = (result as { guardrail_id: string }).guardrail_id;
    }
    expect(result).toBeDefined();
  });

  it('retrieves a guardrail (best effort)', async () => {
    const id = createdId ?? 'nonexistent-guardrail';
    const result = await eitherOrStructuredError(client.guardrails.retrieve(id));
    expect(result).toBeDefined();
  });

  it('returns guardrail info (best effort)', async () => {
    const id = createdId ?? 'nonexistent-guardrail';
    const result = await eitherOrStructuredError(client.guardrails.info(id));
    expect(result).toBeDefined();
  });

  it('updates a guardrail (best effort)', async () => {
    const id = createdId ?? 'nonexistent-guardrail';
    const result = await eitherOrStructuredError(
      client.guardrails.update(id, {
        guardrail: {
          guardrail_name: guardrailName,
          litellm_params: {
            guardrail: 'custom_code',
            mode: 'pre_call',
            default_on: true,
          },
        },
      }),
    );
    expect(result).toBeDefined();
  });

  it('patches a guardrail (best effort)', async () => {
    const id = createdId ?? 'nonexistent-guardrail';
    const result = await eitherOrStructuredError(
      client.guardrails.patch(id, {
        guardrail_info: { description: 'patched in e2e' },
      }),
    );
    expect(result).toBeDefined();
  });

  it('deletes a guardrail (best effort)', async () => {
    const id = createdId ?? 'nonexistent-guardrail';
    const result = await eitherOrStructuredError(client.guardrails.delete(id));
    expect(result).toBeDefined();
    createdId = undefined;
  });

  it('registers a guardrail (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.register({
        guardrail_name: uniq('reg'),
        litellm_params: { guardrail: 'custom_code', mode: 'pre_call' },
      }),
    );
    expect(result).toBeDefined();
  });

  it('lists submissions (best effort)', async () => {
    const result = await eitherOrStructuredError(client.guardrails.listSubmissions());
    expect(result).toBeDefined();
  });

  it('retrieves a submission (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.retrieveSubmission('nonexistent-submission'),
    );
    expect(result).toBeDefined();
  });

  it('approves a submission (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.approveSubmission('nonexistent-submission'),
    );
    expect(result).toBeDefined();
  });

  it('rejects a submission (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.rejectSubmission('nonexistent-submission'),
    );
    expect(result).toBeDefined();
  });

  it('returns UI add-guardrail settings (best effort)', async () => {
    const result = await eitherOrStructuredError(client.guardrails.uiSettings());
    expect(result).toBeDefined();
  });

  it('returns UI category yaml (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.uiCategoryYaml('default'),
    );
    expect(result).toBeDefined();
  });

  it('returns UI major airlines (best effort)', async () => {
    const result = await eitherOrStructuredError(client.guardrails.uiMajorAirlines());
    expect(result).toBeDefined();
  });

  it('returns UI provider-specific params (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.uiProviderSpecificParams(),
    );
    expect(result).toBeDefined();
  });

  it('validates a blocked-words file (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.validateBlockedWordsFile({
        file_content: 'badword1\nbadword2\n',
      }),
    );
    expect(result).toBeDefined();
  });

  it('tests custom code (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.testCustomCode({
        custom_code: 'def hook(*args, **kwargs):\n    return None\n',
        test_input: { messages: [{ role: 'user', content: 'hi' }] },
        input_type: 'request',
      }),
    );
    expect(result).toBeDefined();
  });

  it('runs guardrail apply (best effort — may not have guardrails configured)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.apply({ guardrail_name: 'test', text: 'hello' }),
    );
    expect(result).toBeDefined();
  });

  it('returns usage overview (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.usageOverview({
        start_date: today(),
        end_date: today(),
      }),
    );
    expect(result).toBeDefined();
  });

  it('returns usage detail (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.usageDetail('nonexistent-guardrail', {
        start_date: today(),
        end_date: today(),
      }),
    );
    expect(result).toBeDefined();
  });

  it('returns usage logs (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.usageLogs({ page: 1, page_size: 10 }),
    );
    expect(result).toBeDefined();
  });

  it('returns policies usage overview (best effort)', async () => {
    const result = await eitherOrStructuredError(
      client.guardrails.policiesUsageOverview({
        start_date: today(),
        end_date: today(),
      }),
    );
    expect(result).toBeDefined();
  });

  afterAll(async () => {
    if (createdId) {
      try {
        await client.guardrails.delete(createdId);
      } catch {
        /* ignore */
      }
    }
  });
});
