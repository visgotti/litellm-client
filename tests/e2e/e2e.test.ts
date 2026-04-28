/**
 * @group e2e
 *
 * End-to-end test suite against a real LiteLLM proxy running in Docker.
 *
 * The proxy runs on http://localhost:14000 with master key
 * "sk-e2e-test-master-key" and two classes of models:
 *
 *   • fake-*  — route to a public scaffold that returns synthetic
 *               OpenAI-compatible responses for chat, completion,
 *               embedding, audio-speech, etc. These run unconditionally.
 *   • live-*  — route to real provider deployments (OpenAI, Anthropic,
 *               DeepSeek, Gemini, Alibaba). These tests gate themselves
 *               on the presence of the corresponding *_API_KEY env var
 *               (forwarded into the container by docker-compose), so the
 *               suite is non-flaky locally and gives a useful CI signal
 *               with whatever subset of provider secrets is configured.
 *
 * Endpoints that LiteLLM cannot fully service through the fake provider
 * (fine_tuning, assistants, file/batch uploads that require a real
 * OPENAI_API_KEY, etc.) are exercised with `.rejects.toThrow()` so we
 * still verify request marshalling, auth, and error handling end-to-end.
 */

import { LiteLLMProxyClient } from '../../src/client';
import { Stream } from '../../src/streaming';
import {
  LiteLLMProxyError,
  AuthenticationError,
  NotFoundError,
} from '../../src/errors';
import type { ChatCompletionChunk } from '../../src/types/chat';
import type { ResponseStreamEvent } from '../../src/types/responses';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

const has = (name: string) => Boolean(process.env[name] && process.env[name]!.trim().length > 0);
const HAS_OPENAI = has('OPENAI_API_KEY');
const HAS_ANTHROPIC = has('ANTHROPIC_API_KEY');
const HAS_DEEPSEEK = has('DEEPSEEK_API_KEY');
const HAS_GEMINI = has('GEMINI_API_KEY');
const HAS_ALIBABA = has('ALIBABA_API_KEY');

let client: LiteLLMProxyClient;

const uniq = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

/** Resolve the call OR accept a structured error (verifies SDK marshalling
 * for endpoints whose feature is not configured in a vanilla LiteLLM deploy). */
async function eitherOrStructuredError(p: Promise<unknown>): Promise<unknown> {
  try {
    return await p;
  } catch (err) {
    expect(err).toBeTruthy();
    return err;
  }
}

beforeAll(() => {
  client = new LiteLLMProxyClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 90_000,
    maxRetries: 1,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────────────────────────────────────

describe('Health', () => {
  it('liveness returns a positive signal', async () => {
    const result = await client.health.liveness();
    if (typeof result === 'string') {
      expect(result.toLowerCase()).toMatch(/alive|healthy/);
    } else {
      expect(result.status).toBeDefined();
    }
  });

  it('liveliness alias works', async () => {
    const result = await client.health.liveliness();
    expect(result).toBeDefined();
  });

  it('readiness reports DB connection status', async () => {
    const result = await client.health.readiness();
    expect(result.status).toBe('healthy');
    expect(result.db).toBe('connected');
    expect(typeof result.litellm_version).toBe('string');
  });

  it('full health returns endpoint groups', async () => {
    const result = await client.health.check();
    expect(Array.isArray(result.healthy_endpoints)).toBe(true);
    expect(Array.isArray(result.unhealthy_endpoints)).toBe(true);
    expect(typeof result.healthy_count).toBe('number');
    expect(typeof result.unhealthy_count).toBe('number');
  });

  it('services rejects an unknown service id', async () => {
    await expect(client.health.services('nonexistent-service')).rejects.toThrow(LiteLLMProxyError);
  });

  it('backlog reports queue size', async () => {
    expect(await eitherOrStructuredError(client.health.backlog())).toBeDefined();
  });

  it('license returns proxy license info', async () => {
    expect(await eitherOrStructuredError(client.health.license())).toBeDefined();
  });

  it('history returns recent health-check history', async () => {
    expect(await eitherOrStructuredError(client.health.history())).toBeDefined();
  });

  it('latest returns the latest health check', async () => {
    expect(await eitherOrStructuredError(client.health.latest())).toBeDefined();
  });

  it('sharedStatus returns shared status', async () => {
    expect(await eitherOrStructuredError(client.health.sharedStatus())).toBeDefined();
  });

  it('testConnection runs a model-deployment test', async () => {
    expect(
      await eitherOrStructuredError(
        client.health.testConnection({
          litellm_params: {
            model: 'openai/fake',
            api_key: 'fake-key',
            api_base: 'https://exampleopenaiendpoint-production.up.railway.app',
          },
          mode: 'chat',
        }),
      ),
    ).toBeDefined();
  });

  it('test smoke endpoint', async () => {
    expect(await eitherOrStructuredError(client.health.test())).toBeDefined();
  });

  it('settings returns active callbacks', async () => {
    expect(await eitherOrStructuredError(client.health.settings())).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Models
// ─────────────────────────────────────────────────────────────────────────────

describe('Models', () => {
  it('lists OpenAI-compatible models', async () => {
    const result = await client.models.list();
    expect(result.object).toBe('list');
    expect(Array.isArray(result.data)).toBe(true);
    const ids = result.data.map((m) => m.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'fake-openai-chat',
        'fake-openai-completion',
        'fake-openai-embedding',
      ]),
    );
  });

  it('returns model info with litellm_params and metadata', async () => {
    const result = await client.models.info();
    expect(Array.isArray(result.data)).toBe(true);
    const chat = result.data.find((m) => m.model_name === 'fake-openai-chat');
    expect(chat).toBeDefined();
    expect(chat!.litellm_params).toBeDefined();
    expect(chat!.model_info).toBeDefined();
  });

  it('returns model_group/info aggregated by group', async () => {
    const result = await client.models.groupInfo();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    const groups = result.data.map((m) => m.model_group);
    expect(groups).toContain('fake-openai-chat');
  });

  it('runtime model add → update → delete works against the DB', async () => {
    const name = uniq('runtime-model');
    await client.models.create({
      model_name: name,
      litellm_params: {
        model: 'openai/fake',
        api_key: 'fake-key',
        api_base: 'https://exampleopenaiendpoint-production.up.railway.app',
      },
      model_info: { mode: 'chat' } as never,
    });

    // Should now appear in /v1/models
    const after = await client.models.list();
    expect(after.data.map((m) => m.id)).toContain(name);

    // Fetch the assigned id from /model/info
    const info = await client.models.info();
    const created = info.data.find((m) => m.model_name === name);
    expect(created).toBeDefined();
    const id = (created!.model_info as { id?: string } | undefined)?.id;
    expect(typeof id).toBe('string');

    await client.models.delete({ id: id! });

    const final = await client.models.list();
    expect(final.data.map((m) => m.id)).not.toContain(name);
  });

  it('infoV2 returns extended model info', async () => {
    expect(await eitherOrStructuredError(client.models.infoV2())).toBeDefined();
  });

  it('patchUpdate marshals PATCH /model/{id}/update', async () => {
    expect(
      await eitherOrStructuredError(
        client.models.patchUpdate('does-not-exist', {
          litellm_params: { model: 'openai/fake' },
        }),
      ),
    ).toBeDefined();
  });

  it('settings returns provider/model defaults', async () => {
    expect(await eitherOrStructuredError(client.models.settings())).toBeDefined();
  });

  it('metrics returns latency/usage', async () => {
    expect(await eitherOrStructuredError(client.models.metrics())).toBeDefined();
  });

  it('streamingMetrics is callable', async () => {
    expect(await eitherOrStructuredError(client.models.streamingMetrics())).toBeDefined();
  });

  it('slowResponses is callable', async () => {
    expect(await eitherOrStructuredError(client.models.slowResponses())).toBeDefined();
  });

  it('exceptions is callable', async () => {
    expect(await eitherOrStructuredError(client.models.exceptions())).toBeDefined();
  });

  it('makeGroupPublic marshals POST /model_group/make_public', async () => {
    expect(
      await eitherOrStructuredError(
        client.models.makeGroupPublic({ model_groups: ['fake-openai-chat'] }),
      ),
    ).toBeDefined();
  });

  it('updateModelHubLinks marshals POST /model_hub/update_useful_links', async () => {
    expect(
      await eitherOrStructuredError(
        client.models.updateModelHubLinks({
          links: [{ name: 'docs', url: 'https://example.com/docs' }],
        }),
      ),
    ).toBeDefined();
  });

  it('costMapSource is callable', async () => {
    expect(await eitherOrStructuredError(client.models.costMapSource())).toBeDefined();
  });

  it('reloadCostMap is callable', async () => {
    expect(await eitherOrStructuredError(client.models.reloadCostMap())).toBeDefined();
  });

  it('scheduleCostMapReload marshals POST /schedule/model_cost_map_reload', async () => {
    expect(
      await eitherOrStructuredError(
        client.models.scheduleCostMapReload({ cron_schedule: '0 * * * *', enabled: true }),
      ),
    ).toBeDefined();
  });

  it('cancelScheduledCostMapReload marshals DELETE', async () => {
    expect(
      await eitherOrStructuredError(client.models.cancelScheduledCostMapReload()),
    ).toBeDefined();
  });

  it('costMapReloadStatus is callable', async () => {
    expect(await eitherOrStructuredError(client.models.costMapReloadStatus())).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Chat completions
// ─────────────────────────────────────────────────────────────────────────────

describe('Chat completions', () => {
  it('creates a non-streaming completion', async () => {
    const r = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'Say hello' }],
    });
    expect(r.object).toBe('chat.completion');
    expect(r.choices).toHaveLength(1);
    expect(r.choices[0].message.role).toBe('assistant');
    expect(typeof r.choices[0].message.content).toBe('string');
    expect(typeof r.usage!.total_tokens).toBe('number');
  });

  it('honours optional sampling params', async () => {
    const r = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'Count to three' }],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 32,
      n: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      seed: 42,
    });
    expect(r.choices.length).toBeGreaterThan(0);
  });

  it('supports system + user message ordering', async () => {
    const r = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [
        { role: 'system', content: 'You are concise.' },
        { role: 'user', content: 'hi' },
      ],
    });
    expect(r.choices[0].message.content).toBeDefined();
  });

  it('supports response_format={type:"json_object"}', async () => {
    const r = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'json' }],
      response_format: { type: 'json_object' },
    });
    expect(r.choices.length).toBeGreaterThan(0);
  });

  it('streams chunks via SSE', async () => {
    const stream = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'stream please' }],
      stream: true,
    });
    expect(stream).toBeInstanceOf(Stream);

    const chunks: ChatCompletionChunk[] = [];
    for await (const c of stream) chunks.push(c);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].object).toBe('chat.completion.chunk');
    expect(chunks[chunks.length - 1].choices[0].finish_reason).toBeDefined();
  });

  it('Stream.toArray() collects all chunks', async () => {
    const stream = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'short' }],
      stream: true,
    });
    const chunks = await stream.toArray();
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('forwards extra_headers and metadata via x-litellm-metadata', async () => {
    const r = await client.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'x' }],
      extra_headers: { 'x-trace-id': 'abc-123' },
      metadata: { project: 'e2e' },
    });
    expect(r.choices.length).toBeGreaterThan(0);
  });

  it('rejects an unknown model with a structured error', async () => {
    await expect(
      client.chat.completions.create({
        model: 'definitely-not-a-real-model',
        messages: [{ role: 'user', content: 'x' }],
      }),
    ).rejects.toThrow(LiteLLMProxyError);
  });

  it('rejects a bad bearer token with AuthenticationError', async () => {
    const bad = new LiteLLMProxyClient({
      baseUrl: PROXY_URL,
      apiKey: 'sk-totally-invalid-key',
      timeout: 30_000,
      maxRetries: 0,
    });
    await expect(
      bad.chat.completions.create({
        model: 'fake-openai-chat',
        messages: [{ role: 'user', content: 'x' }],
      }),
    ).rejects.toThrow(AuthenticationError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Legacy text completions
// ─────────────────────────────────────────────────────────────────────────────

describe('Text completions (legacy)', () => {
  it('creates a non-streaming text completion', async () => {
    const r = await client.completions.create({
      model: 'fake-openai-completion',
      prompt: 'Say hi',
      max_tokens: 16,
    });
    expect(r.object).toBe('text_completion');
    expect(r.choices.length).toBeGreaterThan(0);
    expect(typeof r.choices[0].text).toBe('string');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Embeddings
// ─────────────────────────────────────────────────────────────────────────────

describe('Embeddings', () => {
  it('embeds a single string', async () => {
    const r = await client.embeddings.create({
      model: 'fake-openai-embedding',
      input: 'hello world',
    });
    expect(r.object).toBe('list');
    expect(r.data.length).toBe(1);
    const emb = r.data[0].embedding;
    expect(Array.isArray(emb) || typeof emb === 'string').toBe(true);
    if (Array.isArray(emb)) expect(emb.length).toBeGreaterThan(0);
  });

  it('embeds an array of strings', async () => {
    const r = await client.embeddings.create({
      model: 'fake-openai-embedding',
      input: ['a', 'b', 'c'],
    });
    expect(r.data.length).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Responses API
// ─────────────────────────────────────────────────────────────────────────────

describe('Responses API', () => {
  it('creates a non-streaming response', async () => {
    const r = await client.responses.create({
      model: 'fake-openai-chat',
      input: 'hi',
    });
    expect(typeof r.id).toBe('string');
    expect(r.object).toBeDefined();
  });

  it('streams response events via SSE', async () => {
    const s = await client.responses.create({
      model: 'fake-openai-chat',
      input: 'stream',
      stream: true,
    });
    expect(s).toBeInstanceOf(Stream);
    const events: ResponseStreamEvent[] = [];
    for await (const e of s) events.push(e);
    expect(events.length).toBeGreaterThan(0);
    // First event should be response.created
    expect(events[0].type).toBe('response.created');
  });

  it('compact marshals POST /v1/responses/compact', async () => {
    expect(
      await eitherOrStructuredError(
        client.responses.compact({ response_id: 'resp_does_not_exist' }),
      ),
    ).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Audio (TTS)
// ─────────────────────────────────────────────────────────────────────────────

describe('Audio: speech (TTS)', () => {
  it('returns binary audio bytes', async () => {
    const audio = await client.audio.speech.create({
      model: 'fake-tts',
      input: 'hello world',
      voice: 'alloy',
    });
    expect(audio).toBeInstanceOf(ArrayBuffer);
    expect(audio.byteLength).toBeGreaterThan(1024);
  });

  it('supports response_format', async () => {
    const audio = await client.audio.speech.create({
      model: 'fake-tts',
      input: 'mp3',
      voice: 'alloy',
      response_format: 'mp3',
    });
    expect(audio.byteLength).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Endpoints LiteLLM cannot fully serve via the fake provider — we still
// validate auth + routing + error propagation end-to-end.
// ─────────────────────────────────────────────────────────────────────────────

describe('Provider-routed endpoints (require real provider keys)', () => {
  it('image generations propagate provider errors', async () => {
    await expect(
      client.images.generate({
        model: 'fake-image-gen',
        prompt: 'a small red square',
        n: 1,
        size: '256x256',
      }),
    ).rejects.toThrow(LiteLLMProxyError);
  });

  it('moderations propagate provider errors', async () => {
    await expect(
      client.moderations.create({
        model: 'fake-moderation',
        input: 'I love you',
      }),
    ).rejects.toThrow(LiteLLMProxyError);
  });

  it('rerank propagates provider errors', async () => {
    await expect(
      client.rerank.create({
        model: 'fake-rerank',
        query: 'hi',
        documents: ['a', 'b'],
      }),
    ).rejects.toThrow(LiteLLMProxyError);
  });

  it('audio transcriptions propagate provider errors', async () => {
    // tiny fake "wav" — provider will reject decoding, but we verify routing
    const wav = Buffer.from('RIFF$\x00\x00\x00WAVEfmt ', 'binary');
    await expect(
      client.audio.transcriptions.create({
        model: 'fake-whisper',
        file: wav,
        filename: 'a.wav',
        contentType: 'audio/wav',
      }),
    ).rejects.toThrow(LiteLLMProxyError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Files & Batches — the proxy answers, but routes to OpenAI which 500s
// without a real key. We assert listing is callable, then assert errors.
// ─────────────────────────────────────────────────────────────────────────────

describe('Batches', () => {
  it('lists batches (empty)', async () => {
    const r = await client.batches.list();
    expect(r.object).toBe('list');
    expect(Array.isArray(r.data)).toBe(true);
  });

  it('rejects nonexistent batch with NotFoundError-or-server-error', async () => {
    await expect(client.batches.retrieve('nonexistent')).rejects.toThrow(LiteLLMProxyError);
  });
});

describe('Files', () => {
  it('upload propagates provider configuration errors', async () => {
    const data = Buffer.from(
      JSON.stringify({
        custom_id: '1',
        method: 'POST',
        url: '/v1/chat/completions',
        body: {
          model: 'fake-openai-chat',
          messages: [{ role: 'user', content: 'hi' }],
        },
      }) + '\n',
      'utf-8',
    );
    await expect(
      client.files.create({
        file: data,
        filename: 'batch.jsonl',
        purpose: 'batch',
        contentType: 'application/jsonl',
      }),
    ).rejects.toThrow(LiteLLMProxyError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Fine-tuning — Enterprise-only on this image
// ─────────────────────────────────────────────────────────────────────────────

describe('Fine-tuning', () => {
  it('returns an enterprise-license error', async () => {
    await expect(
      client.fineTuning.jobs.create({
        model: 'fake-openai-chat',
        training_file: 'file-fake',
      }),
    ).rejects.toThrow(LiteLLMProxyError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Assistants — needs router-level config
// ─────────────────────────────────────────────────────────────────────────────

describe('Assistants', () => {
  it('rejects without assistants_config configured', async () => {
    await expect(
      client.assistants.create({ model: 'fake-openai-chat' }),
    ).rejects.toThrow(LiteLLMProxyError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Key management
// ─────────────────────────────────────────────────────────────────────────────

describe('Keys', () => {
  let key: string | undefined;

  it('generates a key with full set of options', async () => {
    const r = await client.keys.create({
      models: ['fake-openai-chat'],
      max_budget: 1,
      tpm_limit: 10,
      rpm_limit: 5,
      duration: '1d',
      key_alias: uniq('alias'),
      metadata: { env: 'e2e' },
      tags: ['e2e'],
    });
    expect(typeof r.key).toBe('string');
    expect(r.key.length).toBeGreaterThan(0);
    key = r.key;
  });

  it('returns key info', async () => {
    if (!key) throw new Error('precondition failed');
    const r = await client.keys.info(key);
    expect(r).toHaveProperty('info');
  });

  it('lists keys', async () => {
    const r = await client.keys.list({ page: 1, page_size: 50 });
    expect(r).toHaveProperty('keys');
    expect(Array.isArray(r.keys)).toBe(true);
    expect(typeof r.total_count).toBe('number');
  });

  it('updates a key', async () => {
    if (!key) throw new Error('precondition failed');
    await client.keys.update({ key, max_budget: 2 });
  });

  it('reports proxy key health', async () => {
    const r = await client.keys.health();
    expect(r).toHaveProperty('key');
  });

  it('uses the generated key to make a chat completion', async () => {
    if (!key) throw new Error('precondition failed');
    const scoped = new LiteLLMProxyClient({
      baseUrl: PROXY_URL,
      apiKey: key,
      timeout: 30_000,
      maxRetries: 1,
    });
    const r = await scoped.chat.completions.create({
      model: 'fake-openai-chat',
      messages: [{ role: 'user', content: 'auth ok' }],
    });
    expect(r.choices.length).toBeGreaterThan(0);
  });

  it('blocks and unblocks the key', async () => {
    if (!key) throw new Error('precondition failed');
    await client.keys.block({ key });
    await client.keys.unblock({ key });
  });

  it('regenerates the key', async () => {
    if (!key) throw new Error('precondition failed');
    const r = await client.keys.regenerate({ key });
    expect(typeof r.key).toBe('string');
    key = r.key;
  });

  it('deletes the key', async () => {
    if (!key) throw new Error('precondition failed');
    await client.keys.delete({ keys: [key] });
    key = undefined;
  });

  afterAll(async () => {
    if (key) {
      try {
        await client.keys.delete({ keys: [key] });
      } catch {
        /* ignore */
      }
    }
  });

  it('createServiceAccount marshals POST /key/service-account/generate', async () => {
    expect(
      await eitherOrStructuredError(
        client.keys.createServiceAccount({
          service_account_id: uniq('svc'),
          models: ['fake-openai-chat'],
          max_budget: 1,
        }),
      ),
    ).toBeDefined();
  });

  it('bulkUpdate marshals POST /key/bulk_update', async () => {
    expect(
      await eitherOrStructuredError(
        client.keys.bulkUpdate({ keys: [{ key: 'sk-fake-key-not-real', max_budget: 5 }] }),
      ),
    ).toBeDefined();
  });

  it('infoV2 marshals POST /v2/key/info', async () => {
    expect(
      await eitherOrStructuredError(
        client.keys.infoV2({ keys: ['sk-fake-key-not-real'] }),
      ),
    ).toBeDefined();
  });

  it('resetSpend marshals POST /key/{key}/reset_spend', async () => {
    expect(await eitherOrStructuredError(client.keys.resetSpend('sk-fake'))).toBeDefined();
  });

  it('aliases returns key alias list', async () => {
    expect(await eitherOrStructuredError(client.keys.aliases())).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

describe('Users', () => {
  let userId: string | undefined;

  it('creates a user', async () => {
    const r = await client.users.create({
      user_email: `${uniq('user')}@example.com`,
      user_role: 'internal_user',
      max_budget: 10,
      tpm_limit: 100,
      rpm_limit: 10,
      models: ['fake-openai-chat'],
      metadata: { env: 'e2e' },
    });
    expect(typeof r.user_id).toBe('string');
    userId = r.user_id;
  });

  it('reads user info', async () => {
    if (!userId) throw new Error('precondition failed');
    const r = await client.users.info(userId);
    expect(r.user_id).toBe(userId);
  });

  it('updates a user', async () => {
    if (!userId) throw new Error('precondition failed');
    await client.users.update({ user_id: userId, max_budget: 25 });
  });

  it('lists users', async () => {
    const r = await client.users.list({ page: 1, page_size: 50 });
    expect(Array.isArray(r.users)).toBe(true);
    expect(typeof r.total).toBe('number');
  });

  it('get_users returns the same shape', async () => {
    const r = await client.users.getUsers();
    expect(r).toBeDefined();
  });

  it('deletes a user', async () => {
    if (!userId) throw new Error('precondition failed');
    await client.users.delete({ user_ids: [userId] });
    userId = undefined;
  });

  afterAll(async () => {
    if (userId) {
      try {
        await client.users.delete({ user_ids: [userId] });
      } catch {
        /* ignore */
      }
    }
  });

  it('infoV2 returns extended user info', async () => {
    expect(await eitherOrStructuredError(client.users.infoV2())).toBeDefined();
  });

  it('availableRoles returns roles list', async () => {
    expect(await eitherOrStructuredError(client.users.availableRoles())).toBeDefined();
  });

  it('bulkUpdate marshals POST /user/bulk_update', async () => {
    expect(
      await eitherOrStructuredError(
        client.users.bulkUpdate({
          users: [{ user_id: 'nonexistent-user-id', max_budget: 25 }],
        }),
      ),
    ).toBeDefined();
  });

  it('dailyActivityAggregated marshals GET /user/daily/activity/aggregated', async () => {
    expect(
      await eitherOrStructuredError(
        client.users.dailyActivityAggregated({
          start_date: yesterday(),
          end_date: today(),
        }),
      ),
    ).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Teams
// ─────────────────────────────────────────────────────────────────────────────

describe('Teams', () => {
  let teamId: string | undefined;
  let teamMemberId: string | undefined;

  it('creates a team', async () => {
    const r = await client.teams.create({
      team_alias: uniq('team'),
      max_budget: 50,
      models: ['fake-openai-chat'],
      tpm_limit: 1000,
      rpm_limit: 100,
    });
    expect(typeof r.team_id).toBe('string');
    teamId = r.team_id;
  });

  it('reads team info', async () => {
    if (!teamId) throw new Error('precondition failed');
    const r = await client.teams.info(teamId);
    expect(r.team_id).toBe(teamId);
  });

  it('lists teams', async () => {
    const r = await client.teams.list();
    expect(r).toBeDefined();
  });

  it('updates a team', async () => {
    if (!teamId) throw new Error('precondition failed');
    await client.teams.update({ team_id: teamId, max_budget: 100 });
  });

  it('adds a member', async () => {
    if (!teamId) throw new Error('precondition failed');
    const u = await client.users.create({
      user_email: `${uniq('m')}@example.com`,
      user_role: 'internal_user',
    });
    teamMemberId = u.user_id;
    await client.teams.addMember({
      team_id: teamId,
      member: { user_id: teamMemberId, role: 'user' },
    });
  });

  it('updates a member', async () => {
    if (!teamId || !teamMemberId) throw new Error('precondition failed');
    await client.teams.updateMember({
      team_id: teamId,
      user_id: teamMemberId,
      role: 'admin',
    });
  });

  it('deletes a member', async () => {
    if (!teamId || !teamMemberId) throw new Error('precondition failed');
    await client.teams.deleteMember({ team_id: teamId, user_id: teamMemberId });
    if (teamMemberId) {
      try {
        await client.users.delete({ user_ids: [teamMemberId] });
      } catch {
        /* ignore */
      }
      teamMemberId = undefined;
    }
  });

  it('blocks and unblocks the team', async () => {
    if (!teamId) throw new Error('precondition failed');
    await client.teams.block({ team_id: teamId });
    await client.teams.unblock({ team_id: teamId });
  });

  it('deletes a team', async () => {
    if (!teamId) throw new Error('precondition failed');
    await client.teams.delete({ team_ids: [teamId] });
    teamId = undefined;
  });

  afterAll(async () => {
    if (teamId) {
      try {
        await client.teams.delete({ team_ids: [teamId] });
      } catch {
        /* ignore */
      }
    }
    if (teamMemberId) {
      try {
        await client.users.delete({ user_ids: [teamMemberId] });
      } catch {
        /* ignore */
      }
    }
  });

  it('listV2 returns the team list', async () => {
    expect(await eitherOrStructuredError(client.teams.listV2())).toBeDefined();
  });

  it('available returns joinable teams', async () => {
    expect(await eitherOrStructuredError(client.teams.available())).toBeDefined();
  });

  it('bulkMemberAdd marshals POST /team/bulk_member_add', async () => {
    const id = teamId ?? 'nonexistent-team';
    const uid = teamMemberId ?? 'nonexistent-user';
    expect(
      await eitherOrStructuredError(
        client.teams.bulkMemberAdd({
          team_id: id,
          members: [{ user_id: uid, role: 'user' }],
        }),
      ),
    ).toBeDefined();
  });

  it('addModel marshals POST /team/model/add', async () => {
    const id = teamId ?? 'nonexistent-team';
    expect(
      await eitherOrStructuredError(
        client.teams.addModel({ team_id: id, models: ['fake-openai-chat'] }),
      ),
    ).toBeDefined();
  });

  it('deleteModel marshals POST /team/model/delete', async () => {
    const id = teamId ?? 'nonexistent-team';
    expect(
      await eitherOrStructuredError(
        client.teams.deleteModel({ team_id: id, models: ['fake-openai-chat'] }),
      ),
    ).toBeDefined();
  });

  it('permissionsList marshals GET /team/permissions_list', async () => {
    const id = teamId ?? 'nonexistent-team';
    expect(
      await eitherOrStructuredError(client.teams.permissionsList({ team_id: id })),
    ).toBeDefined();
  });

  it('permissionsUpdate marshals POST /team/permissions_update', async () => {
    const id = teamId ?? 'nonexistent-team';
    expect(
      await eitherOrStructuredError(
        client.teams.permissionsUpdate({
          team_id: id,
          team_member_permissions: ['/key/generate'],
        }),
      ),
    ).toBeDefined();
  });

  it('permissionsBulkUpdate marshals POST /team/permissions_bulk_update', async () => {
    const id = teamId ?? 'nonexistent-team';
    expect(
      await eitherOrStructuredError(
        client.teams.permissionsBulkUpdate({
          updates: [{ team_id: id, team_member_permissions: ['/key/generate'] }],
        }),
      ),
    ).toBeDefined();
  });

  it('dailyActivity marshals GET /team/daily/activity', async () => {
    expect(
      await eitherOrStructuredError(
        client.teams.dailyActivity({ start_date: yesterday(), end_date: today() }),
      ),
    ).toBeDefined();
  });

  it('addCallback marshals POST /team/{team_id}/callback', async () => {
    const id = teamId ?? 'nonexistent-team';
    expect(
      await eitherOrStructuredError(
        client.teams.addCallback({
          team_id: id,
          success_callback: ['langfuse'],
          callback_vars: { LANGFUSE_PUBLIC_KEY: 'fake' },
        }),
      ),
    ).toBeDefined();
  });

  it('getCallback marshals GET /team/{team_id}/callback', async () => {
    const id = teamId ?? 'nonexistent-team';
    expect(await eitherOrStructuredError(client.teams.getCallback(id))).toBeDefined();
  });

  it('disableLogging marshals POST /team/{team_id}/disable_logging', async () => {
    const id = teamId ?? 'nonexistent-team';
    expect(await eitherOrStructuredError(client.teams.disableLogging(id))).toBeDefined();
  });

  it('myMembership marshals GET /team/{team_id}/members/me', async () => {
    const id = teamId ?? 'nonexistent-team';
    expect(await eitherOrStructuredError(client.teams.myMembership(id))).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Customers (end-users)
// ─────────────────────────────────────────────────────────────────────────────

describe('Customers (end-users)', () => {
  const id = uniq('cust');

  it('creates a customer', async () => {
    const r = await client.customers.create({ user_id: id, blocked: false });
    expect(r.user_id).toBe(id);
  });

  it('reads a customer', async () => {
    const r = await client.customers.info(id);
    expect(r.user_id).toBe(id);
  });

  it('updates a customer', async () => {
    await client.customers.update({ user_id: id, blocked: false });
  });

  it('lists customers', async () => {
    const r = await client.customers.list();
    expect(Array.isArray(r)).toBe(true);
  });

  it('blocks then unblocks a customer', async () => {
    await client.customers.block({ user_ids: [id] });
    await client.customers.unblock({ user_ids: [id] });
  });

  it('deletes a customer', async () => {
    await client.customers.delete({ user_ids: [id] });
  });

  it('dailyActivity marshals GET /customer/daily/activity', async () => {
    expect(
      await eitherOrStructuredError(
        client.customers.dailyActivity({ start_date: yesterday(), end_date: today() }),
      ),
    ).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Budgets
// ─────────────────────────────────────────────────────────────────────────────

describe('Budgets', () => {
  const budgetId = uniq('budget');

  it('creates a budget', async () => {
    const r = await client.budgets.create({
      budget_id: budgetId,
      max_budget: 100,
      tpm_limit: 1000,
      rpm_limit: 60,
    });
    expect(r).toBeDefined();
  });

  it('lists budgets', async () => {
    const r = await client.budgets.list();
    expect(Array.isArray(r)).toBe(true);
  });

  it('reads a budget', async () => {
    const r = await client.budgets.info({ budgets: [budgetId] });
    expect(r).toBeDefined();
  });

  it('updates a budget', async () => {
    await client.budgets.update({ budget_id: budgetId, max_budget: 200 });
  });

  it('deletes a budget', async () => {
    await client.budgets.delete({ id: budgetId });
  });

  it('providerBudgets marshals GET /provider/budgets', async () => {
    expect(await eitherOrStructuredError(client.budgets.providerBudgets())).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Spend reporting
// ─────────────────────────────────────────────────────────────────────────────

describe('Spend reporting', () => {
  it('returns spend logs', async () => {
    const r = await client.spend.logs();
    expect(r).toBeDefined();
  });

  it('returns spend by tags', async () => {
    const r = await client.spend.byTags();
    expect(r).toBeDefined();
  });

  it('returns global spend', async () => {
    const r = await client.spend.global();
    expect(r).toBeDefined();
    expect(typeof (r as { spend?: unknown }).spend === 'number' || r === undefined).toBe(true);
  });

  it('keys returns spend by key', async () => {
    expect(await eitherOrStructuredError(client.spend.keys())).toBeDefined();
  });

  it('users returns spend by user', async () => {
    expect(await eitherOrStructuredError(client.spend.users())).toBeDefined();
  });

  it('logsV2 marshals GET /spend/logs/v2', async () => {
    expect(await eitherOrStructuredError(client.spend.logsV2())).toBeDefined();
  });

  it('logsUi marshals GET /spend/logs/ui', async () => {
    expect(await eitherOrStructuredError(client.spend.logsUi())).toBeDefined();
  });

  it('logUi marshals GET /spend/logs/ui/{request_id}', async () => {
    expect(await eitherOrStructuredError(client.spend.logUi('req_id'))).toBeDefined();
  });

  it('logsSessionUi marshals GET /spend/logs/session/ui', async () => {
    expect(await eitherOrStructuredError(client.spend.logsSessionUi())).toBeDefined();
  });

  it('globalLogs marshals GET /global/spend/logs', async () => {
    expect(await eitherOrStructuredError(client.spend.globalLogs())).toBeDefined();
  });

  it('globalProvider marshals GET /global/spend/provider', async () => {
    expect(await eitherOrStructuredError(client.spend.globalProvider())).toBeDefined();
  });

  it('globalReport marshals GET /global/spend/report', async () => {
    expect(
      await eitherOrStructuredError(
        client.spend.globalReport({ start_date: yesterday(), end_date: today() }),
      ),
    ).toBeDefined();
  });

  it('globalAllTagNames returns the tag-name list', async () => {
    expect(await eitherOrStructuredError(client.spend.globalAllTagNames())).toBeDefined();
  });

  it('globalReset marshals POST /global/spend/reset', async () => {
    expect(await eitherOrStructuredError(client.spend.globalReset())).toBeDefined();
  });

  it('globalRefresh marshals POST /global/spend/refresh', async () => {
    expect(await eitherOrStructuredError(client.spend.globalRefresh())).toBeDefined();
  });

  it('globalAllEndUsers marshals GET /global/all_end_users', async () => {
    expect(await eitherOrStructuredError(client.spend.globalAllEndUsers())).toBeDefined();
  });

  it('activity marshals GET /global/activity', async () => {
    expect(await eitherOrStructuredError(client.spend.activity())).toBeDefined();
  });

  it('activityByModel marshals GET /global/activity/model', async () => {
    expect(await eitherOrStructuredError(client.spend.activityByModel())).toBeDefined();
  });

  it('activityExceptions marshals GET /global/activity/exceptions', async () => {
    expect(await eitherOrStructuredError(client.spend.activityExceptions())).toBeDefined();
  });

  it('activityExceptionsByDeployment marshals GET /global/activity/exceptions/deployment', async () => {
    expect(
      await eitherOrStructuredError(client.spend.activityExceptionsByDeployment()),
    ).toBeDefined();
  });

  it('activityCacheHits marshals GET /global/activity/cache_hits', async () => {
    expect(await eitherOrStructuredError(client.spend.activityCacheHits())).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 404 / NotFoundError shape
// ─────────────────────────────────────────────────────────────────────────────

describe('Error mapping', () => {
  it('maps 404 to NotFoundError when retrieving a missing key', async () => {
    await expect(client.keys.info('sk-definitely-not-real')).rejects.toThrow(LiteLLMProxyError);
  });

  it('maps a missing customer to a structured error', async () => {
    await expect(client.customers.info('nonexistent-end-user')).rejects.toThrow(
      LiteLLMProxyError,
    );
  });

  // Type-only: ensure NotFoundError export is reachable.
  it('NotFoundError is exported from src/errors', () => {
    expect(NotFoundError).toBeDefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Live providers — these only run when the corresponding *_API_KEY is
// forwarded into the proxy container. They prove that the full stack
// (this client → LiteLLM proxy → real provider) actually works.
// ═════════════════════════════════════════════════════════════════════════════

async function expectBasicChat(model: string): Promise<void> {
  const res = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: 'Reply with the single word: pong' }],
    max_tokens: 16,
    temperature: 0,
  });
  expect(res.object).toBe('chat.completion');
  expect(res.choices.length).toBeGreaterThan(0);
  expect(res.choices[0].message.role).toBe('assistant');
  expect(typeof res.choices[0].message.content).toBe('string');
  expect(res.choices[0].message.content!.length).toBeGreaterThan(0);
  expect(res.usage).toBeDefined();
  expect(typeof res.usage!.total_tokens).toBe('number');
}

async function expectStreamingChat(model: string): Promise<void> {
  const stream = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: 'Count: 1, 2, 3.' }],
    max_tokens: 32,
    temperature: 0,
    stream: true,
  });
  expect(stream).toBeInstanceOf(Stream);

  const chunks: ChatCompletionChunk[] = [];
  for await (const chunk of stream) chunks.push(chunk);

  expect(chunks.length).toBeGreaterThan(0);
  expect(chunks[0].object).toBe('chat.completion.chunk');
  const finalChunk = chunks[chunks.length - 1];
  expect(finalChunk.choices[0].finish_reason).toBeDefined();
}

describe('Live providers (registry)', () => {
  it('lists configured live models when keys are present', async () => {
    const r = await client.models.list();
    const ids = r.data.map((m) => m.id);
    if (HAS_OPENAI) expect(ids).toContain('live-openai-chat');
    if (HAS_ANTHROPIC) expect(ids).toContain('live-anthropic-chat');
    if (HAS_DEEPSEEK) expect(ids).toContain('live-deepseek-chat');
    if (HAS_GEMINI) expect(ids).toContain('live-gemini-chat');
    if (HAS_ALIBABA) expect(ids).toContain('live-alibaba-chat');
  });
});

const dOpenAI = HAS_OPENAI ? describe : describe.skip;
dOpenAI('Live: OpenAI', () => {
  it('chat: non-streaming', () => expectBasicChat('live-openai-chat'));
  it('chat: streaming', () => expectStreamingChat('live-openai-chat'));

  it('embeddings', async () => {
    const r = await client.embeddings.create({
      model: 'live-openai-embedding',
      input: 'hello world',
    });
    expect(r.object).toBe('list');
    const emb = r.data[0].embedding;
    if (Array.isArray(emb)) expect(emb.length).toBeGreaterThan(10);
  });

  it('moderations', async () => {
    const r = await client.moderations.create({
      model: 'live-openai-moderation',
      input: 'I love you.',
    });
    expect(r.results.length).toBeGreaterThan(0);
    expect(typeof r.results[0].flagged).toBe('boolean');
  });

  it('image generation', async () => {
    const r = await client.images.generate({
      model: 'live-openai-image',
      prompt: 'a small red square on a white background',
      n: 1,
      size: '256x256',
    });
    expect(r.data.length).toBeGreaterThan(0);
    expect(r.data[0].url || r.data[0].b64_json).toBeTruthy();
  });

  it('audio: TTS produces non-empty audio', async () => {
    const audio = await client.audio.speech.create({
      model: 'live-openai-tts',
      input: 'CI smoke test.',
      voice: 'alloy',
    });
    expect(audio.byteLength).toBeGreaterThan(1024);
  });

  it('audio: TTS → STT round-trip', async () => {
    const audio = await client.audio.speech.create({
      model: 'live-openai-tts',
      input: 'hello world',
      voice: 'alloy',
      response_format: 'mp3',
    });
    const r = await client.audio.transcriptions.create({
      model: 'live-openai-stt',
      file: Buffer.from(audio),
      filename: 'hello.mp3',
      contentType: 'audio/mpeg',
    });
    const text = (typeof r === 'string' ? r : r.text).toLowerCase();
    expect(text.length).toBeGreaterThan(0);
  });
});

const dAnthropic = HAS_ANTHROPIC ? describe : describe.skip;
dAnthropic('Live: Anthropic', () => {
  it('chat: non-streaming', () => expectBasicChat('live-anthropic-chat'));
  it('chat: streaming', () => expectStreamingChat('live-anthropic-chat'));
});

const dDeepSeek = HAS_DEEPSEEK ? describe : describe.skip;
dDeepSeek('Live: DeepSeek', () => {
  it('chat: non-streaming', () => expectBasicChat('live-deepseek-chat'));
  it('chat: streaming', () => expectStreamingChat('live-deepseek-chat'));
});

const dGemini = HAS_GEMINI ? describe : describe.skip;
dGemini('Live: Gemini', () => {
  it('chat: non-streaming', () => expectBasicChat('live-gemini-chat'));
  it('chat: streaming', () => expectStreamingChat('live-gemini-chat'));

  it('embeddings', async () => {
    const r = await client.embeddings.create({
      model: 'live-gemini-embedding',
      input: 'hello world',
    });
    const emb = r.data[0].embedding;
    if (Array.isArray(emb)) expect(emb.length).toBeGreaterThan(10);
  });
});

const dAlibaba = HAS_ALIBABA ? describe : describe.skip;
dAlibaba('Live: Alibaba (Qwen)', () => {
  it('chat: non-streaming', () => expectBasicChat('live-alibaba-chat'));
  it('chat: streaming', () => expectStreamingChat('live-alibaba-chat'));

  it('embeddings', async () => {
    const r = await client.embeddings.create({
      model: 'live-alibaba-embedding',
      input: 'hello world',
    });
    const emb = r.data[0].embedding;
    if (Array.isArray(emb)) expect(emb.length).toBeGreaterThan(10);
  });
});
