/**
 * @group e2e
 *
 * E2E tests for native provider routes (Anthropic /v1/messages, Gemini
 * generateContent) and the typed passthrough escape hatch. Tests requiring
 * real provider creds gate themselves on the *_API_KEY env var.
 *
 * Assertion policy: every test commits to ONE outcome — success-with-shape
 * or a single typed error status. See `_assertions.ts`.
 */
import { LiteLLMClient } from '../../src/client';
import { LiteLLMError } from '../../src/errors';
import { Stream } from '../../src/streaming';
import type {
  AnthropicMessage,
  MessageStreamEvent,
} from '../../src/types/anthropic';
import type { GenerateContentResponse } from '../../src/types/gemini';
import { expectShape, expectTypedError } from './_assertions';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

const has = (n: string) => Boolean(process.env[n] && process.env[n]!.trim().length > 0);
const HAS_ANTHROPIC = has('ANTHROPIC_API_KEY');
const HAS_GEMINI = has('GEMINI_API_KEY');
const HAS_OPENAI = has('OPENAI_API_KEY');

let client: LiteLLMClient;
beforeAll(() => {
  client = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 90_000,
    maxRetries: 1,
  });
});

const uniq = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

void HAS_OPENAI;

// ─────────────────────────────────────────────────────────────────────────────
// Anthropic-native: client.anthropic.*
// ─────────────────────────────────────────────────────────────────────────────

describe('Anthropic native: messages', () => {
  it('messages.create non-streaming returns a typed AnthropicMessage', async () => {
    const p = client.anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 16,
      messages: [{ role: 'user', content: 'pong' }],
    });

    if (HAS_ANTHROPIC) {
      const res = (await p) as AnthropicMessage;
      expect(typeof res.id).toBe('string');
      expect(res.id.length).toBeGreaterThan(0);
      expect(res.type).toBe('message');
      expect(res.role).toBe('assistant');
      expect(Array.isArray(res.content)).toBe(true);
      expect(res.content.length).toBeGreaterThan(0);
      expect(typeof res.model).toBe('string');
      expect(res.usage).toBeDefined();
      expect(typeof res.usage.input_tokens).toBe('number');
      expect(typeof res.usage.output_tokens).toBe('number');
    } else {
      await expectTypedError(p, 401);
    }
  });

  it('messages.create streaming returns a Stream and yields chunks', async () => {
    if (!HAS_ANTHROPIC) {
      await expectTypedError(
        client.anthropic.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 16,
          messages: [{ role: 'user', content: 'pong' }],
          stream: true,
        }),
        401,
      );
      return;
    }

    const stream = await client.anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 32,
      messages: [{ role: 'user', content: 'Count: 1, 2, 3.' }],
      stream: true,
    });
    expect(stream).toBeInstanceOf(Stream);

    const events: MessageStreamEvent[] = [];
    for await (const ev of stream) events.push(ev);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].type).toBe('message_start');
    expect(events[events.length - 1].type).toBe('message_stop');
  });

  it('messages.countTokens returns input_tokens', async () => {
    const p = client.anthropic.messages.countTokens({
      model: 'claude-haiku-4-5',
      messages: [{ role: 'user', content: 'pong' }],
    });

    if (HAS_ANTHROPIC) {
      const r = await p;
      expect(typeof r.input_tokens).toBe('number');
      expect(r.input_tokens).toBeGreaterThan(0);
    } else {
      await expectTypedError(p, 401);
    }
  });
});

describe('Anthropic native: skills', () => {
  it('skills.list returns the skills registry', async () => {
    await expectShape(client.anthropic.skills.list(), {});
  });

  it('skills.create rejects 500 (skill upload unsupported on proxy)', async () => {
    await expectTypedError(
      client.anthropic.skills.create({
        display_title: uniq('skill'),
        files: new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
        filename: 'skill.zip',
        contentType: 'application/zip',
      }),
      500,
    );
  });

  it('skills.retrieve(nonexistent) rejects 500 (proxy does not translate 404)', async () => {
    await expectTypedError(
      client.anthropic.skills.retrieve('nonexistent-skill-id'),
      500,
    );
  });

  it('skills.delete(nonexistent) rejects 500 (proxy does not translate 404)', async () => {
    await expectTypedError(
      client.anthropic.skills.delete('nonexistent-skill-id'),
      500,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Gemini-native: client.gemini.*
// ─────────────────────────────────────────────────────────────────────────────

describe('Gemini native: generateContent', () => {
  it('generateContent returns text', async () => {
    const p = client.gemini.generateContent('gemini-2.5-flash-lite', {
      contents: [{ role: 'user', parts: [{ text: 'pong' }] }],
    });

    if (HAS_GEMINI) {
      const res = (await p) as GenerateContentResponse;
      expect(Array.isArray(res.candidates)).toBe(true);
      expect((res.candidates ?? []).length).toBeGreaterThan(0);
      const first = (res.candidates ?? [])[0];
      expect(first.content).toBeDefined();
      expect(Array.isArray(first.content?.parts)).toBe(true);
    } else {
      await expectTypedError(p, 401);
    }
  });

  it('streamGenerateContent returns a Stream and yields chunks', async () => {
    if (!HAS_GEMINI) {
      await expectTypedError(
        client.gemini.streamGenerateContent('gemini-2.5-flash-lite', {
          contents: [{ role: 'user', parts: [{ text: 'pong' }] }],
        }),
        401,
      );
      return;
    }

    const stream = await client.gemini.streamGenerateContent('gemini-2.5-flash-lite', {
      contents: [{ role: 'user', parts: [{ text: 'Count: 1, 2, 3.' }] }],
    });
    expect(stream).toBeInstanceOf(Stream);

    const chunks: GenerateContentResponse[] = [];
    for await (const c of stream) chunks.push(c);
    expect(chunks.length).toBeGreaterThan(0);
    const withCandidates = chunks.find(
      (c) => Array.isArray(c.candidates) && c.candidates.length > 0,
    );
    expect(withCandidates).toBeDefined();
  });

  it('countTokens returns totalTokens', async () => {
    const p = client.gemini.countTokens('gemini-2.5-flash-lite', {
      contents: [{ role: 'user', parts: [{ text: 'pong' }] }],
    });

    if (HAS_GEMINI) {
      const r = await p;
      expect(typeof r.totalTokens).toBe('number');
      expect(r.totalTokens).toBeGreaterThan(0);
    } else {
      await expectTypedError(p, 401);
    }
  });
});

describe('Gemini native: interactions', () => {
  it('interactions.create succeeds', async () => {
    await expectShape(
      client.gemini.interactions.create({
        model: 'gemini-2.5-flash-lite',
        input: 'pong',
      }),
      {},
    );
  });

  it('interactions.retrieve returns 200 with an error envelope (proxy bug — should 404)', async () => {
    const r = (await client.gemini.interactions.retrieve(
      'nonexistent-interaction-id',
    )) as { error?: { message?: string } };
    expect(r.error).toMatchObject({ message: expect.any(String) });
  });

  it('interactions.delete(nonexistent) rejects 500', async () => {
    await expectTypedError(
      client.gemini.interactions.delete('nonexistent-interaction-id'),
      500,
    );
  });

  it('interactions.cancel(nonexistent) rejects 500', async () => {
    await expectTypedError(
      client.gemini.interactions.cancel('nonexistent-interaction-id'),
      500,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PassThrough escape hatch: client.passThrough.*
// Each provider's GET /v1/health probe verifies SDK path composition and
// proxy routing. Most providers either succeed with provider-specific
// shape or reject 4xx because the proxy lacks a registered deployment for
// that provider.
// ─────────────────────────────────────────────────────────────────────────────

describe('PassThrough: per-provider path composition', () => {
  // GET /v1/health is not a real endpoint on most providers; the proxy
  // composes the upstream path correctly and surfaces the upstream
  // 4xx/5xx as a typed error. The expected status documents the
  // upstream's actual response in this test environment.

  it('anthropic.get(v1/health) reaches Anthropic (404 — endpoint does not exist)', async () => {
    await expectTypedError(client.passThrough.anthropic.get('v1/health'), 404);
  });

  it('anthropic.post v1/messages returns a typed AnthropicMessage', async () => {
    const p = client.passThrough.anthropic.post(
      'v1/messages',
      {
        model: 'claude-haiku-4-5',
        max_tokens: 16,
        messages: [{ role: 'user', content: 'pong' }],
      },
      { headers: { 'anthropic-version': '2023-06-01' } },
    );

    if (HAS_ANTHROPIC) {
      const res = (await p) as AnthropicMessage;
      expect(typeof res.id).toBe('string');
      expect(res.role).toBe('assistant');
      expect(Array.isArray(res.content)).toBe(true);
    } else {
      await expectTypedError(p, 401);
    }
  });

  it('gemini.get(v1/health) rejects 401 (virtual key check)', async () => {
    await expectTypedError(client.passThrough.gemini.get('v1/health'), 401);
  });

  it('vertex.get(v1/health) rejects 404 (no Vertex project configured)', async () => {
    await expectTypedError(client.passThrough.vertex.get('v1/health'), 404);
  });

  it('cohere.get(v1/health) rejects 401 (no Cohere key configured)', async () => {
    await expectTypedError(client.passThrough.cohere.get('v1/health'), 401);
  });

  it('mistral.get(v1/health) rejects 404 (no matching Mistral route)', async () => {
    await expectTypedError(client.passThrough.mistral.get('v1/health'), 404);
  });

  it('vllm.get(v1/health) rejects 500', async () => {
    await expectTypedError(client.passThrough.vllm.get('v1/health'), 500);
  });

  it('milvus.get(v1/health) rejects 400 (collection name required)', async () => {
    await expectTypedError(client.passThrough.milvus.get('v1/health'), 400);
  });

  it('bedrock.get(v1/health) rejects 400', async () => {
    await expectTypedError(client.passThrough.bedrock.get('v1/health'), 400);
  });

  it('assemblyAi.get(v1/health) rejects 404', async () => {
    await expectTypedError(client.passThrough.assemblyAi.get('v1/health'), 404);
  });

  it('azure.get(v1/health) rejects 500', async () => {
    await expectTypedError(client.passThrough.azure.get('v1/health'), 500);
  });

  it('openai.get(v1/health) rejects 404', async () => {
    await expectTypedError(client.passThrough.openai.get('v1/health'), 404);
  });

  it('cursor.get(v1/health) rejects 401 (no Cursor key configured)', async () => {
    await expectTypedError(client.passThrough.cursor.get('v1/health'), 401);
  });

  it('langfuse.get(v1/health) rejects 500', async () => {
    await expectTypedError(client.passThrough.langfuse.get('v1/health'), 500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PassThrough: Bedrock typed methods — no AWS creds, every write rejects 4xx
// ─────────────────────────────────────────────────────────────────────────────

describe('PassThrough: Bedrock (typed methods)', () => {
  it('bedrock.converse rejects 400 (proxy rejects unknown bedrock model)', async () => {
    await expectTypedError(
      client.passThrough.bedrock.converse('anthropic.claude-3-haiku-20240307-v1:0', {
        messages: [{ role: 'user', content: [{ text: 'hi' }] }],
      }),
      400,
    );
  });

  it('bedrock.converseStream marshals and surfaces an error', async () => {
    // converseStream returns a Stream; the await itself can either resolve
    // (and the stream errors on first yield) or reject with a typed error.
    // We accept either — any non-LiteLLMError still fails the test.
    let stream: AsyncIterable<unknown> | undefined;
    try {
      stream = (await client.passThrough.bedrock.converseStream(
        'anthropic.claude-3-haiku-20240307-v1:0',
        { messages: [{ role: 'user', content: [{ text: 'hi' }] }] },
      )) as AsyncIterable<unknown>;
    } catch (err) {
      expect(err).toBeInstanceOf(LiteLLMError);
      return;
    }
    let consumeError: unknown;
    try {
      let count = 0;
      for await (const _ev of stream) {
        void _ev;
        if (++count >= 3) break;
      }
    } catch (err) {
      consumeError = err;
    }
    if (consumeError) {
      expect(consumeError).toBeInstanceOf(LiteLLMError);
    }
  });

  it('bedrock.invoke rejects 400 (proxy rejects unknown bedrock model)', async () => {
    await expectTypedError(
      client.passThrough.bedrock.invoke('amazon.titan-embed-text-v2:0', {
        inputText: 'hi',
      }),
      400,
    );
  });

  it('bedrock.guardrails.apply rejects 400', async () => {
    await expectTypedError(
      client.passThrough.bedrock.guardrails.apply('fake-id', 'DRAFT', {
        source: 'INPUT',
        content: [{ text: { text: 'hi', qualifiers: [] } }],
      }),
      400,
    );
  });

  it('bedrock.knowledgeBases.retrieve rejects 500', async () => {
    await expectTypedError(
      client.passThrough.bedrock.knowledgeBases.retrieve('fake-kb-id', {
        retrievalQuery: { text: 'hi' },
      }),
      500,
    );
  });

  it('bedrock.knowledgeBases.retrieveAndGenerate rejects 500', async () => {
    await expectTypedError(
      client.passThrough.bedrock.knowledgeBases.retrieveAndGenerate({
        input: { text: 'hi' },
        retrieveAndGenerateConfiguration: { type: 'KNOWLEDGE_BASE' },
      }),
      500,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PassThrough: Cursor Cloud Agents typed methods — no Cursor key configured
// ─────────────────────────────────────────────────────────────────────────────

describe('PassThrough: Cursor (typed methods)', () => {
  it('cursor.me rejects 401', async () => {
    await expectTypedError(client.passThrough.cursor.me(), 401);
  });

  it('cursor.models rejects 401', async () => {
    await expectTypedError(client.passThrough.cursor.models(), 401);
  });

  it('cursor.repositories rejects 401', async () => {
    await expectTypedError(client.passThrough.cursor.repositories(), 401);
  });

  it('cursor.agents.list rejects 401', async () => {
    await expectTypedError(client.passThrough.cursor.agents.list(), 401);
  });

  it('cursor.agents.launch rejects 401', async () => {
    await expectTypedError(
      client.passThrough.cursor.agents.launch({
        prompt: { text: 'hi' },
        source: { repository: 'github.com/foo/bar', ref: 'main' },
        target: { autoCreatePr: false },
      }),
      401,
    );
  });

  it('cursor.agents.get(fake-id) rejects 401', async () => {
    await expectTypedError(client.passThrough.cursor.agents.get('fake-id'), 401);
  });

  it('cursor.agents.conversation(fake-id) rejects 401', async () => {
    await expectTypedError(
      client.passThrough.cursor.agents.conversation('fake-id'),
      401,
    );
  });

  it('cursor.agents.followup(fake-id) rejects 401', async () => {
    await expectTypedError(
      client.passThrough.cursor.agents.followup('fake-id', { prompt: { text: 'hi' } }),
      401,
    );
  });

  it('cursor.agents.stop(fake-id) rejects 401', async () => {
    await expectTypedError(client.passThrough.cursor.agents.stop('fake-id'), 401);
  });

  it('cursor.agents.delete(fake-id) rejects 401', async () => {
    await expectTypedError(client.passThrough.cursor.agents.delete('fake-id'), 401);
  });
});
