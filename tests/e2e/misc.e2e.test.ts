/**
 * @group e2e
 *
 * E2E tests for `client.misc` against the LiteLLM proxy on
 * http://localhost:14000.
 *
 * NOTE: We intentionally avoid calling `addAllowedIp` with a real IP — doing
 * so activates the proxy's IP allow-list and can lock subsequent tests out.
 * Both `addAllowedIp` and `deleteAllowedIp` are exercised through their 422
 * (missing `ip` field) and 404 (IP not in list) paths instead.
 */

import { LiteLLMClient } from '../../src/client';
import {
  InternalServerError,
  LiteLLMError,
  NotFoundError,
} from '../../src/errors';
import { Stream } from '../../src/streaming';

// usageAiChat is OpenAI-backed and streaming — retry transient flake.
jest.retryTimes(2, { logErrorsBeforeRetry: true });

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMClient;

beforeAll(() => {
  client = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 30_000,
    maxRetries: 0,
  });
});

describe('Misc — read-only endpoints (200 OK)', () => {
  it('inProductNudges() returns a feature-flag object', async () => {
    const result = await client.misc.inProductNudges();
    expect(typeof result.is_claude_code_enabled).toBe('boolean');
  });

  it('activeCallbacks() returns the registered callbacks', async () => {
    const result = await client.misc.activeCallbacks();
    expect(Array.isArray(result['litellm.callbacks'])).toBe(true);
  });

  it('debugAsyncioTasks() returns task counts', async () => {
    const result = await client.misc.debugAsyncioTasks();
    expect(typeof result.total_active_tasks).toBe('number');
    expect(result.by_name).toBeDefined();
    expect(typeof result.by_name).toBe('object');
  });

  it('publicLitellmModelCostMap() returns a non-empty cost map object', async () => {
    const result = await client.misc.publicLitellmModelCostMap();
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  it('apiEventLoggingBatch({events:[]}) responds 200 with status:"ok"', async () => {
    const result = await client.misc.apiEventLoggingBatch({ events: [] });
    expect(result.status).toBe('ok');
  });
});

describe('Misc — streaming usage assistant', () => {
  it('usageAiChat() returns a typed Stream of SSE chunks', async () => {
    const stream = await client.misc.usageAiChat({
      messages: [{ role: 'user', content: 'hello' }],
    });
    expect(stream).toBeInstanceOf(Stream);

    const collected: unknown[] = [];
    for await (const chunk of stream) {
      collected.push(chunk);
    }
    expect(collected.length).toBeGreaterThan(0);
    // The proxy ships with a backing OpenAI-powered usage assistant.
    // When OPENAI_API_KEY is available in the proxy env (via docker-compose
    // forwarding from the host), the stream completes with `{type: "done"}`.
    const last = collected[collected.length - 1] as { type?: string };
    expect(last.type).toBe('done');
  });
});

describe('Misc — endpoints that return typed errors on the test proxy', () => {
  it('callback() returns 422 because `code` and `state` are required', async () => {
    let caught: unknown;
    try {
      await client.misc.callback();
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(LiteLLMError);
    expect((caught as LiteLLMError).status).toBe(422);
  });

  it('applyGuardrail() returns 404 when the guardrail name is not configured', async () => {
    let caught: unknown;
    try {
      await client.misc.applyGuardrail({
        guardrail_name: 'does-not-exist-e2e',
        text: 'hello world',
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(NotFoundError);
    expect((caught as NotFoundError).status).toBe(404);
  });

  it('addAllowedIp() with no `ip` field returns 422', async () => {
    let caught: unknown;
    try {
      // Force-cast to bypass the param type — we want to exercise the 422 path.
      await client.misc.addAllowedIp({} as { ip: string });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(LiteLLMError);
    expect((caught as LiteLLMError).status).toBe(422);
  });

  it('deleteAllowedIp({ip}) returns 404 when the IP is not on the allow-list', async () => {
    let caught: unknown;
    try {
      await client.misc.deleteAllowedIp({ ip: '203.0.113.99' });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(NotFoundError);
    expect((caught as NotFoundError).status).toBe(404);
  });

  it('regenerateKey() returns 500 on the test proxy (Enterprise-only feature)', async () => {
    let caught: unknown;
    try {
      await client.misc.regenerateKey({ key: 'sk-fake' });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(InternalServerError);
    expect((caught as InternalServerError).status).toBe(500);
  });

  it('rerankV2() returns 400 for an unknown model name', async () => {
    let caught: unknown;
    try {
      await client.misc.rerankV2({
        model: 'unknown-rerank-model-e2e',
        query: 'capital of france',
        documents: ['Paris', 'London'],
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(LiteLLMError);
    expect((caught as LiteLLMError).status).toBe(400);
  });
});
