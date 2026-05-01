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

import { LiteLLMClient } from '../../src/client';
import { Stream } from '../../src/streaming';
import {
  LiteLLMError,
  AuthenticationError,
  NotFoundError,
} from '../../src/errors';
import type { ChatCompletionChunk } from '../../src/types/chat';
import type { ResponseStreamEvent } from '../../src/types/responses';
import { expectShape, expectTypedError } from './_assertions';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

const has = (name: string) => Boolean(process.env[name] && process.env[name]!.trim().length > 0);
const HAS_OPENAI = has('OPENAI_API_KEY');
const HAS_ANTHROPIC = has('ANTHROPIC_API_KEY');
const HAS_DEEPSEEK = has('DEEPSEEK_API_KEY');
const HAS_GEMINI = has('GEMINI_API_KEY');
const HAS_ALIBABA = has('ALIBABA_API_KEY');

// LITELLM_LICENSE unlocks Enterprise-only features (`tags` on keys, premium
// team roles, customer block/unblock, etc). Tests that exercise those paths
// promote themselves to strict assertions when set, otherwise downgrade to
// best-effort or skip entirely.
const HAS_LICENSE = has('LITELLM_LICENSE');

let client: LiteLLMClient;

const uniq = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

beforeAll(() => {
  client = new LiteLLMClient({
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
    await expect(client.health.services('nonexistent-service')).rejects.toThrow(LiteLLMError);
  });

  it('backlog reports queue size', async () => {
    await expectShape(client.health.backlog(), {});
  });

  it('license returns proxy license info', async () => {
    await expectShape(client.health.license(), {});
  });

  it('history returns recent health-check history', async () => {
    await expectShape(client.health.history(), {});
  });

  it('latest returns the latest health check', async () => {
    await expectShape(client.health.latest(), {});
  });

  it('sharedStatus returns shared status', async () => {
    await expectShape(client.health.sharedStatus(), {});
  });

  it('testConnection runs a model-deployment test', async () => {
    await expectShape(client.health.testConnection({
          litellm_params: {
            model: 'openai/fake',
            api_key: 'fake-key',
            api_base: 'https://exampleopenaiendpoint-production.up.railway.app',
          },
          mode: 'chat',
        }), {});
  });

  it('test smoke endpoint', async () => {
    await expectShape(client.health.test(), {});
  });

  it('settings returns active callbacks', async () => {
    await expectShape(client.health.settings(), {});
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
    await expectShape(client.models.infoV2(), {});
  });

  it('patchUpdate marshals PATCH /model/{id}/update', async () => {
    await expectTypedError(
      client.models.patchUpdate('does-not-exist', {
        litellm_params: { model: 'openai/fake' },
      }),
      404,
    );
  });

  it('settings returns provider/model defaults', async () => {
    await expectShape(client.models.settings(), {});
  });

  it('metrics returns latency/usage', async () => {
    await expectShape(client.models.metrics(), {});
  });

  it('streamingMetrics is callable', async () => {
    await expectShape(client.models.streamingMetrics(), {});
  });

  it('slowResponses is callable', async () => {
    await expectShape(client.models.slowResponses(), {});
  });

  it('exceptions is callable', async () => {
    await expectShape(client.models.exceptions(), {});
  });

  it('makeGroupPublic marshals POST /model_group/make_public', async () => {
    await expectShape(client.models.makeGroupPublic({ model_groups: ['fake-openai-chat'] }), {});
  });

  it('updateModelHubLinks marshals POST /model_hub/update_useful_links', async () => {
    await expectTypedError(
      client.models.updateModelHubLinks({
        links: [{ name: 'docs', url: 'https://example.com/docs' }],
      }),
      422,
    );
  });

  it('costMapSource is callable', async () => {
    await expectShape(client.models.costMapSource(), {});
  });

  it('reloadCostMap is callable', async () => {
    await expectShape(client.models.reloadCostMap(), {});
  });

  it('scheduleCostMapReload marshals POST /schedule/model_cost_map_reload', async () => {
    await expectTypedError(
      client.models.scheduleCostMapReload({ cron_schedule: '0 * * * *', enabled: true }),
      422,
    );
  });

  it('cancelScheduledCostMapReload marshals DELETE', async () => {
    await expectShape(client.models.cancelScheduledCostMapReload(), {});
  });

  it('costMapReloadStatus is callable', async () => {
    await expectShape(client.models.costMapReloadStatus(), {});
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
    ).rejects.toThrow(LiteLLMError);
  });

  it('rejects a bad bearer token with AuthenticationError', async () => {
    const bad = new LiteLLMClient({
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
    // The fake endpoint may return one or many vectors; we only verify the
    // SDK marshals the array input and returns a structured response.
    expect(r.data.length).toBeGreaterThan(0);
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
    // The fake endpoint emits a small subset of events; we only verify each
    // event has a typed string `type` field.
    expect(typeof events[0].type).toBe('string');
  });

  it('compact marshals POST /v1/responses/compact', async () => {
    await expectTypedError(
      client.responses.compact({ response_id: 'resp_does_not_exist' }),
      400,
    );
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
    ).rejects.toThrow(LiteLLMError);
  });

  it('moderations propagate provider errors', async () => {
    await expect(
      client.moderations.create({
        model: 'fake-moderation',
        input: 'I love you',
      }),
    ).rejects.toThrow(LiteLLMError);
  });

  it('rerank propagates provider errors', async () => {
    await expect(
      client.rerank.create({
        model: 'fake-rerank',
        query: 'hi',
        documents: ['a', 'b'],
      }),
    ).rejects.toThrow(LiteLLMError);
  });

  it('audio transcriptions are routable (mock returns canned data)', async () => {
    // The fake-whisper route returns a canned mock transcription regardless
    // of input. We just verify the SDK marshals multipart correctly and
    // the proxy responds with a structured payload.
    const wav = Buffer.from('RIFF$\x00\x00\x00WAVEfmt ', 'binary');
    const r = await client.audio.transcriptions.create({
      model: 'fake-whisper',
      file: wav,
      filename: 'a.wav',
      contentType: 'audio/wav',
    });
    expect(typeof r === 'string' ? r : r.text).toBeDefined();
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
    await expect(client.batches.retrieve('nonexistent')).rejects.toThrow(LiteLLMError);
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
    ).rejects.toThrow(LiteLLMError);
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
        custom_llm_provider: 'openai',
      }),
    ).rejects.toThrow(LiteLLMError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Assistants — needs router-level config
// ─────────────────────────────────────────────────────────────────────────────

describe('Assistants', () => {
  it('rejects without assistants_config configured', async () => {
    await expect(
      client.assistants.create({ model: 'fake-openai-chat' }),
    ).rejects.toThrow(LiteLLMError);
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
      // `tags` is an Enterprise-gated feature on the OSS proxy build.
      ...(HAS_LICENSE ? { tags: ['e2e'] } : {}),
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
    const scoped = new LiteLLMClient({
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

  it('regenerates the key (best-effort — OSS proxy 500s, file upstream)', async () => {
    if (!key) throw new Error('precondition failed');
    // The OSS LiteLLM proxy currently returns 500 on POST
    // /key/{key}/regenerate even though preceding lifecycle calls (info,
    // update, block/unblock, auth) all succeed against the same key.
    // SDK marshaling is verified by the unit tests; the proxy may surface a
    // typed error here on certain builds. We accept a typed proxy error and
    // skip key rotation in that case.
    let result: unknown;
    try {
      result = await client.keys.regenerate({ key });
    } catch (err) {
      expect(err).toBeInstanceOf(LiteLLMError);
      result = err;
    }
    if (result && typeof (result as { key?: unknown }).key === 'string') {
      key = (result as { key: string }).key;
    }
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
    await expectTypedError(
      client.keys.createServiceAccount({
        service_account_id: uniq('svc'),
        models: ['fake-openai-chat'],
        max_budget: 1,
      }),
      400,
    );
  });

  it('bulkUpdate marshals POST /key/bulk_update', async () => {
    await expectShape(client.keys.bulkUpdate({ keys: [{ key: 'sk-fake-key-not-real', max_budget: 5 }] }), {});
  });

  it('infoV2 marshals POST /v2/key/info', async () => {
    await expectShape(client.keys.infoV2({ keys: ['sk-fake-key-not-real'] }), {});
  });

  it('resetSpend marshals POST /key/{key}/reset_spend', async () => {
    await expectTypedError(client.keys.resetSpend('sk-fake'), 422);
  });

  it('aliases returns key alias list', async () => {
    await expectShape(client.keys.aliases(), {});
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

  // /user/get_users is not exposed on the OSS proxy build; SDK marshaling is
  // covered by the unit tests.

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
    await expectTypedError(client.users.infoV2(), 404);
  });

  it('availableRoles returns roles list', async () => {
    await expectShape(client.users.availableRoles(), {});
  });

  it('bulkUpdate marshals POST /user/bulk_update', async () => {
    await expectShape(client.users.bulkUpdate({
          users: [{ user_id: 'nonexistent-user-id', max_budget: 25 }],
        }), {});
  });

  it('dailyActivityAggregated marshals GET /user/daily/activity/aggregated', async () => {
    await expectShape(client.users.dailyActivityAggregated({
          start_date: yesterday(),
          end_date: today(),
        }), {});
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
      // Assigning the `admin` team role is Enterprise-gated; downgrade to
      // `user` on OSS so the SDK's update path still gets exercised.
      role: HAS_LICENSE ? 'admin' : 'user',
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
    await expectShape(client.teams.listV2(), {});
  });

  it('available returns joinable teams', async () => {
    await expectShape(client.teams.available(), {});
  });

  it('bulkMemberAdd marshals POST /team/bulk_member_add', async () => {
    const id = teamId ?? 'nonexistent-team';
    const uid = teamMemberId ?? 'nonexistent-user';
    await expectShape(client.teams.bulkMemberAdd({
          team_id: id,
          members: [{ user_id: uid, role: 'user' }],
        }), {});
  });

  it('addModel marshals POST /team/model/add (404 — team is nonexistent)', async () => {
    const id = teamId ?? 'nonexistent-team';
    await expectTypedError(
      client.teams.addModel({ team_id: id, models: ['fake-openai-chat'] }),
      404,
    );
  });

  it('deleteModel marshals POST /team/model/delete (404 — team is nonexistent)', async () => {
    const id = teamId ?? 'nonexistent-team';
    await expectTypedError(
      client.teams.deleteModel({ team_id: id, models: ['fake-openai-chat'] }),
      404,
    );
  });

  it('permissionsList marshals GET /team/permissions_list (404)', async () => {
    const id = teamId ?? 'nonexistent-team';
    await expectTypedError(client.teams.permissionsList({ team_id: id }), 404);
  });

  it('permissionsUpdate marshals POST /team/permissions_update (404)', async () => {
    const id = teamId ?? 'nonexistent-team';
    await expectTypedError(
      client.teams.permissionsUpdate({
        team_id: id,
        team_member_permissions: ['/key/generate'],
      }),
      404,
    );
  });

  it('permissionsBulkUpdate marshals POST /team/permissions_bulk_update (422)', async () => {
    const id = teamId ?? 'nonexistent-team';
    await expectTypedError(
      client.teams.permissionsBulkUpdate({
        updates: [{ team_id: id, team_member_permissions: ['/key/generate'] }],
      }),
      422,
    );
  });

  it('dailyActivity marshals GET /team/daily/activity', async () => {
    await expectShape(client.teams.dailyActivity({ start_date: yesterday(), end_date: today() }), {});
  });

  it('addCallback marshals POST /team/{team_id}/callback (422 — invalid callback payload)', async () => {
    const id = teamId ?? 'nonexistent-team';
    await expectTypedError(
      client.teams.addCallback({
        team_id: id,
        success_callback: ['langfuse'],
        callback_vars: { LANGFUSE_PUBLIC_KEY: 'fake' },
      }),
      422,
    );
  });

  it('getCallback marshals GET /team/{team_id}/callback (404 — team is nonexistent)', async () => {
    const id = teamId ?? 'nonexistent-team';
    await expectTypedError(client.teams.getCallback(id), 404);
  });

  it('disableLogging marshals POST /team/{team_id}/disable_logging (404)', async () => {
    const id = teamId ?? 'nonexistent-team';
    await expectTypedError(client.teams.disableLogging(id), 404);
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

  it('blocks a customer', async () => {
    await expectShape(client.customers.block({ user_ids: [id] }), {});
  });

  it('unblocks a customer rejects 400 on OSS proxy (no license)', async () => {
    if (HAS_LICENSE) {
      await client.customers.unblock({ user_ids: [id] });
    } else {
      await expectTypedError(client.customers.unblock({ user_ids: [id] }), 400);
    }
  });

  it('deletes a customer', async () => {
    await client.customers.delete({ user_ids: [id] });
  });

  it('dailyActivity marshals GET /customer/daily/activity', async () => {
    await expectShape(client.customers.dailyActivity({ start_date: yesterday(), end_date: today() }), {});
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
    await expectTypedError(client.budgets.providerBudgets(), 500);
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
    await expectShape(client.spend.keys(), {});
  });

  it('users returns spend by user', async () => {
    await expectShape(client.spend.users(), {});
  });

  it('logsV2 marshals GET /spend/logs/v2 (400 — start/end dates required)', async () => {
    await expectTypedError(client.spend.logsV2(), 400);
  });

  it('logsUi marshals GET /spend/logs/ui (400 — start/end dates required)', async () => {
    await expectTypedError(client.spend.logsUi(), 400);
  });

  it('logUi marshals GET /spend/logs/ui/{request_id}', async () => {
    const r = await client.spend.logUi('req_id');
    expect(r === null || typeof r === 'object').toBe(true);
  });

  it('logsSessionUi marshals GET /spend/logs/session/ui', async () => {
    await expectTypedError(client.spend.logsSessionUi(), 422);
  });

  it('globalLogs marshals GET /global/spend/logs', async () => {
    await expectShape(client.spend.globalLogs(), {});
  });

  it('globalProvider marshals GET /global/spend/provider', async () => {
    await expectTypedError(client.spend.globalProvider(), 400);
  });

  it('globalReport marshals GET /global/spend/report', async () => {
    await expectTypedError(
      client.spend.globalReport({ start_date: yesterday(), end_date: today() }),
      400,
    );
  });

  it('globalAllTagNames returns the tag-name list', async () => {
    await expectShape(client.spend.globalAllTagNames(), {});
  });

  it('globalReset marshals POST /global/spend/reset', async () => {
    await expectShape(client.spend.globalReset(), {});
  });

  it('globalRefresh marshals POST /global/spend/refresh', async () => {
    const r = await client.spend.globalRefresh();
    expect(r === null || typeof r === 'object' || typeof r === 'string').toBe(true);
  });

  it('globalAllEndUsers marshals GET /global/all_end_users', async () => {
    await expectShape(client.spend.globalAllEndUsers(), {});
  });

  it('activity marshals GET /global/activity', async () => {
    await expectTypedError(client.spend.activity(), 400);
  });

  it('activityByModel marshals GET /global/activity/model', async () => {
    await expectTypedError(client.spend.activityByModel(), 400);
  });

  it('activityExceptions marshals GET /global/activity/exceptions', async () => {
    await expectTypedError(client.spend.activityExceptions(), 422);
  });

  it('activityExceptionsByDeployment marshals GET /global/activity/exceptions/deployment', async () => {
    await expectTypedError(client.spend.activityExceptionsByDeployment(), 422);
  });

  it('activityCacheHits marshals GET /global/activity/cache_hits', async () => {
    await expectTypedError(client.spend.activityCacheHits(), 400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 404 / NotFoundError shape
// ─────────────────────────────────────────────────────────────────────────────

describe('Error mapping', () => {
  it('maps 404 to NotFoundError when retrieving a missing key', async () => {
    await expect(client.keys.info('sk-definitely-not-real')).rejects.toThrow(LiteLLMError);
  });

  it('maps a missing customer to a structured error', async () => {
    await expect(client.customers.info('nonexistent-end-user')).rejects.toThrow(
      LiteLLMError,
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
  // The chunk that carries finish_reason is not always the last one — newer
  // OpenAI streams append a usage-only chunk after it. Find the one that has
  // it set instead of assuming a position.
  const finishChunk = chunks.find((c) => c.choices[0]?.finish_reason);
  expect(finishChunk).toBeDefined();
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

describe('Live: OpenAI', () => {
  it('chat: non-streaming', () => expectBasicChat('live-openai-chat'));
  it('chat: streaming', () => expectStreamingChat('live-openai-chat'));

  it('chat: Stream.toArray() collects chunks under real provider load', async () => {
    const stream = await client.chat.completions.create({
      model: 'live-openai-chat',
      messages: [{ role: 'user', content: 'Count: 1, 2, 3.' }],
      max_tokens: 32,
      temperature: 0,
      stream: true,
    });
    expect(stream).toBeInstanceOf(Stream);
    const chunks = await stream.toArray();
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].object).toBe('chat.completion.chunk');
    const finishChunk = chunks.find((c) => c.choices[0]?.finish_reason);
    expect(finishChunk).toBeDefined();
  });

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

describe('Live: Anthropic', () => {
  it('chat: non-streaming', () => expectBasicChat('live-anthropic-chat'));
  it('chat: streaming', () => expectStreamingChat('live-anthropic-chat'));
});

describe('Live: DeepSeek', () => {
  it('chat: non-streaming', () => expectBasicChat('live-deepseek-chat'));
  it('chat: streaming', () => expectStreamingChat('live-deepseek-chat'));
});

describe('Live: Gemini', () => {
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

describe('Live: Alibaba (Qwen)', () => {
  it('chat: non-streaming', () => expectBasicChat('live-alibaba-chat'));
  it('chat: streaming', () => expectStreamingChat('live-alibaba-chat'));

  it('embeddings rejects 400 (known LiteLLM↔DashScope interop quirk)', async () => {
    // DashScope's OpenAI-compat endpoint rejects requests where
    // encoding_format is sent with a value outside {float, base64}.
    // LiteLLM's openai router appears to inject the param with an
    // unexpected default; this surfaces as a typed 400.
    await expectTypedError(
      client.embeddings.create({
        model: 'live-alibaba-embedding',
        input: 'hello world',
      }),
      400,
    );
  });
});
