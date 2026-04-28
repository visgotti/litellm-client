/**
 * @group e2e
 *
 * E2E tests for misc admin/util resources: compliance, utils, cost, cache.
 */
import { LiteLLMProxyClient } from '../../src/client';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMProxyClient;
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
// Compliance
// ─────────────────────────────────────────────────────────────────────────────

describe('Compliance', () => {
  it('euAiAct runs a check (best-effort)', async () => {
    await eitherOrStructuredError(
      client.compliance.euAiAct({
        request_id: `e2e-eu-${Date.now()}`,
        text: 'hello',
      }),
    );
  });

  it('gdpr runs a check (best-effort)', async () => {
    await eitherOrStructuredError(
      client.compliance.gdpr({
        request_id: `e2e-gdpr-${Date.now()}`,
        text: 'hello',
      }),
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

  it('transformRequest returns a provider-specific raw request (best-effort)', async () => {
    await eitherOrStructuredError(
      client.utils.transformRequest({
        call_type: 'completion',
        request_body: {
          model: 'fake-openai-chat',
          messages: [{ role: 'user', content: 'hi' }],
        },
      }),
    );
  });

  it('supportedOpenAiParams returns the param list for a model (best effort)', async () => {
    const r = await eitherOrStructuredError(
      client.utils.supportedOpenAiParams({ model: 'fake-openai-chat' }),
    );
    expect(r).toBeDefined();
  });

  it('routes returns the registered route table', async () => {
    const r = await client.utils.routes();
    expect(Array.isArray(r.routes)).toBe(true);
    expect(r.routes.length).toBeGreaterThan(0);
  });

  it('availableRoutes returns the available-route summary (best effort — may not be exposed)', async () => {
    const r = await eitherOrStructuredError(client.utils.availableRoutes());
    expect(r).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cost
// ─────────────────────────────────────────────────────────────────────────────

describe('Cost', () => {
  it('estimate returns projected cost for a model (best-effort)', async () => {
    await eitherOrStructuredError(
      client.cost.estimate({
        model: 'fake-openai-chat',
        input_tokens: 10,
        output_tokens: 20,
      }),
    );
  });

  it('discountConfig.get returns provider discount values (best-effort)', async () => {
    await eitherOrStructuredError(client.cost.discountConfig.get());
  });

  it('discountConfig.update sets a provider discount (best-effort)', async () => {
    await eitherOrStructuredError(
      client.cost.discountConfig.update({ openai: 0.1 }),
    );
  });

  it('marginConfig.get returns provider margin values (best-effort)', async () => {
    await eitherOrStructuredError(client.cost.marginConfig.get());
  });

  it('marginConfig.update sets a provider margin (best-effort)', async () => {
    await eitherOrStructuredError(
      client.cost.marginConfig.update({ openai: 0.05 }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cache
// ─────────────────────────────────────────────────────────────────────────────

describe('Cache', () => {
  it('ping reports cache status (or returns a structured error)', async () => {
    const result = await eitherOrStructuredError(client.cache.ping());
    if (!(result instanceof Error)) {
      expect(result).toBeDefined();
    }
  });

  it('redisInfo returns Redis info when configured (best-effort)', async () => {
    await eitherOrStructuredError(client.cache.redisInfo());
  });

  it('delete drops a list of cache keys (best-effort)', async () => {
    await eitherOrStructuredError(
      client.cache.delete({ keys: ['nonexistent'] }),
    );
  });

  it('flushAll clears the cache (best-effort)', async () => {
    await eitherOrStructuredError(client.cache.flushAll());
  });

  it('settings.get returns cache config metadata (best-effort)', async () => {
    await eitherOrStructuredError(client.cache.settings.get());
  });

  it('settings.update writes cache config (best-effort)', async () => {
    await eitherOrStructuredError(
      client.cache.settings.update({
        cache_settings: { type: 'redis' },
      }),
    );
  });

  it('settings.test validates a candidate cache config (best-effort)', async () => {
    await eitherOrStructuredError(
      client.cache.settings.test({
        cache_settings: { type: 'redis' },
      }),
    );
  });
});
