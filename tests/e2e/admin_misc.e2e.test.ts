/**
 * @group e2e
 *
 * E2E tests for misc admin/util resources: compliance, utils, cost, cache.
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
// Compliance
// ─────────────────────────────────────────────────────────────────────────────

describe('Compliance', () => {
  it('euAiAct returns a structured response', async () => {
    await expectShape(
      client.compliance.euAiAct({
        request_id: `e2e-eu-${Date.now()}`,
        text: 'hello',
      }),
      {},
    );
  });

  it('gdpr returns a structured response', async () => {
    await expectShape(
      client.compliance.gdpr({
        request_id: `e2e-gdpr-${Date.now()}`,
        text: 'hello',
      }),
      {},
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────────────────────────────────────

describe('Utils', () => {
  it('tokenCounter returns a token count for a chat payload', async () => {
    const r = await client.utils.tokenCounter({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(typeof r.total_tokens).toBe('number');
    expect(r.total_tokens).toBeGreaterThanOrEqual(0);
    expect(typeof r.request_model).toBe('string');
  });

  it('transformRequest returns a provider-specific raw request', async () => {
    await expectShape(
      client.utils.transformRequest({
        call_type: 'completion',
        request_body: {
          model: 'fake-openai-chat',
          messages: [{ role: 'user', content: 'hi' }],
        },
      }),
      {},
    );
  });

  it('supportedOpenAiParams rejects 400 for the fake-openai model alias', async () => {
    // The fake-openai-chat alias does not have a registered provider, so the
    // proxy returns a 400 from get_supported_openai_params. Pinned so a future
    // proxy fix flips this to expectShape.
    await expectTypedError(
      client.utils.supportedOpenAiParams({ model: 'fake-openai-chat' }),
      400,
    );
  });

  it('routes returns the registered route table', async () => {
    const r = await client.utils.routes();
    expect(Array.isArray(r.routes)).toBe(true);
    expect(r.routes.length).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Cost
// ─────────────────────────────────────────────────────────────────────────────

describe('Cost', () => {
  it('estimate returns a cost estimate for the fake-openai alias', async () => {
    const r = await client.cost.estimate({
      model: 'fake-openai-chat',
      input_tokens: 10,
      output_tokens: 20,
    });
    expect(r).toMatchObject({
      model: 'fake-openai-chat',
      input_tokens: 10,
      output_tokens: 20,
      provider: 'openai',
    });
    expect(typeof r.cost_per_request).toBe('number');
    expect(typeof r.input_cost_per_request).toBe('number');
    expect(typeof r.output_cost_per_request).toBe('number');
  });

  it('discountConfig.get returns provider discount values', async () => {
    await expectShape(client.cost.discountConfig.get(), {});
  });

  it('discountConfig.update sets a provider discount', async () => {
    await expectShape(client.cost.discountConfig.update({ openai: 0.1 }), {});
  });

  it('marginConfig.get returns provider margin values', async () => {
    await expectShape(client.cost.marginConfig.get(), {});
  });

  it('marginConfig.update sets a provider margin', async () => {
    await expectShape(client.cost.marginConfig.update({ openai: 0.05 }), {});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cache
// ─────────────────────────────────────────────────────────────────────────────

describe('Cache', () => {
  // No cache backend is configured in the test proxy; mutating endpoints
  // raise InternalServerError. Tests pinned to current behaviour.
  it('ping rejects 503 when no cache backend is configured', async () => {
    await expectTypedError(client.cache.ping(), 503);
  });

  it('redisInfo rejects 503 when Redis is not configured', async () => {
    await expectTypedError(client.cache.redisInfo(), 503);
  });

  it('delete rejects 500 when no cache backend is configured', async () => {
    await expectTypedError(client.cache.delete({ keys: ['nonexistent'] }), 500);
  });

  it('flushAll rejects 503 when no cache backend is configured', async () => {
    await expectTypedError(client.cache.flushAll(), 503);
  });

  it('settings.get returns cache config metadata', async () => {
    await expectShape(client.cache.settings.get(), {});
  });

  it('settings.update rejects 500 when applying a Redis config without a Redis URL', async () => {
    await expectTypedError(
      client.cache.settings.update({ cache_settings: { type: 'redis' } }),
      500,
    );
  });

  it('settings.test validates a candidate cache config', async () => {
    await expectShape(
      client.cache.settings.test({ cache_settings: { type: 'redis' } }),
      {},
    );
  });
});
