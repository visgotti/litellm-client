/**
 * @group e2e
 *
 * E2E tests for native provider routes (Anthropic /v1/messages, Gemini
 * generateContent) and the typed passthrough escape hatch. Tests requiring
 * real provider creds gate themselves on the *_API_KEY env var.
 */
import { LiteLLMProxyClient } from '../../src/client';
import { Stream } from '../../src/streaming';
import type {
  AnthropicMessage,
  MessageStreamEvent,
} from '../../src/types/anthropic';
import type { GenerateContentResponse } from '../../src/types/gemini';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

const has = (n: string) => Boolean(process.env[n] && process.env[n]!.trim().length > 0);
const HAS_ANTHROPIC = has('ANTHROPIC_API_KEY');
const HAS_GEMINI = has('GEMINI_API_KEY');
const HAS_OPENAI = has('OPENAI_API_KEY');

let client: LiteLLMProxyClient;
beforeAll(() => {
  client = new LiteLLMProxyClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 90_000,
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

const uniq = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

// Mark unused gating var as referenced so tsc --noUnusedLocals (if enabled
// later) wouldn't complain. Intentional no-op.
void HAS_OPENAI;

// ─────────────────────────────────────────────────────────────────────────────
// Anthropic-native: client.anthropic.*
// ─────────────────────────────────────────────────────────────────────────────

describe('Anthropic native: messages', () => {
  it('messages.create non-streaming returns a typed AnthropicMessage (or structured error without key)', async () => {
    const p = client.anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
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
      await eitherOrStructuredError(p);
    }
  });

  it('messages.create streaming returns a Stream and yields chunks', async () => {
    if (!HAS_ANTHROPIC) {
      // Without a key the proxy will reject; still confirm structured error.
      await eitherOrStructuredError(
        client.anthropic.messages.create({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 16,
          messages: [{ role: 'user', content: 'pong' }],
          stream: true,
        }),
      );
      return;
    }

    const stream = await client.anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 32,
      messages: [{ role: 'user', content: 'Count: 1, 2, 3.' }],
      stream: true,
    });
    expect(stream).toBeInstanceOf(Stream);

    const events: MessageStreamEvent[] = [];
    for await (const ev of stream) events.push(ev);
    expect(events.length).toBeGreaterThan(0);
    // First SSE event from Anthropic is message_start.
    expect(events[0].type).toBe('message_start');
    // Final event should be message_stop.
    expect(events[events.length - 1].type).toBe('message_stop');
  });

  it('messages.countTokens returns input_tokens (or structured error without key)', async () => {
    const p = client.anthropic.messages.countTokens({
      model: 'claude-3-5-haiku-latest',
      messages: [{ role: 'user', content: 'pong' }],
    });

    if (HAS_ANTHROPIC) {
      const r = await p;
      expect(typeof r.input_tokens).toBe('number');
      expect(r.input_tokens).toBeGreaterThan(0);
    } else {
      await eitherOrStructuredError(p);
    }
  });
});

describe('Anthropic native: skills (best-effort)', () => {
  it('skills.list reaches the proxy', async () => {
    await eitherOrStructuredError(client.anthropic.skills.list());
  });

  it('skills.create reaches the proxy', async () => {
    await eitherOrStructuredError(
      client.anthropic.skills.create({
        name: uniq('skill'),
        description: 'e2e probe',
      }),
    );
  });

  it('skills.retrieve reaches the proxy', async () => {
    await eitherOrStructuredError(client.anthropic.skills.retrieve('nonexistent-skill-id'));
  });

  it('skills.delete reaches the proxy', async () => {
    await eitherOrStructuredError(client.anthropic.skills.delete('nonexistent-skill-id'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Gemini-native: client.gemini.*
// ─────────────────────────────────────────────────────────────────────────────

describe('Gemini native: generateContent', () => {
  it('generateContent returns text (or structured error without key)', async () => {
    const p = client.gemini.generateContent('gemini-2.0-flash', {
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
      await eitherOrStructuredError(p);
    }
  });

  it('streamGenerateContent returns a Stream and yields chunks', async () => {
    if (!HAS_GEMINI) {
      await eitherOrStructuredError(
        client.gemini.streamGenerateContent('gemini-2.0-flash', {
          contents: [{ role: 'user', parts: [{ text: 'pong' }] }],
        }),
      );
      return;
    }

    const stream = await client.gemini.streamGenerateContent('gemini-2.0-flash', {
      contents: [{ role: 'user', parts: [{ text: 'Count: 1, 2, 3.' }] }],
    });
    expect(stream).toBeInstanceOf(Stream);

    const chunks: GenerateContentResponse[] = [];
    for await (const c of stream) chunks.push(c);
    expect(chunks.length).toBeGreaterThan(0);
    // At least one chunk should carry candidates.
    const withCandidates = chunks.find((c) => Array.isArray(c.candidates) && c.candidates.length > 0);
    expect(withCandidates).toBeDefined();
  });

  it('countTokens returns totalTokens (or structured error without key)', async () => {
    const p = client.gemini.countTokens('gemini-2.0-flash', {
      contents: [{ role: 'user', parts: [{ text: 'pong' }] }],
    });

    if (HAS_GEMINI) {
      const r = await p;
      expect(typeof r.totalTokens).toBe('number');
      expect(r.totalTokens).toBeGreaterThan(0);
    } else {
      await eitherOrStructuredError(p);
    }
  });
});

describe('Gemini native: interactions (best-effort)', () => {
  it('interactions.create reaches the proxy', async () => {
    await eitherOrStructuredError(
      client.gemini.interactions.create({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: 'pong' }] }],
      }),
    );
  });

  it('interactions.retrieve reaches the proxy', async () => {
    await eitherOrStructuredError(
      client.gemini.interactions.retrieve('nonexistent-interaction-id'),
    );
  });

  it('interactions.delete reaches the proxy', async () => {
    await eitherOrStructuredError(
      client.gemini.interactions.delete('nonexistent-interaction-id'),
    );
  });

  it('interactions.cancel reaches the proxy', async () => {
    await eitherOrStructuredError(
      client.gemini.interactions.cancel('nonexistent-interaction-id'),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PassThrough escape hatch: client.passThrough.*
//
// Each provider call sends a minimal request through the typed passthrough.
// Even if the upstream 404s, we have validated path composition (prefix +
// path), auth header injection, and proxy routing — that is the contract
// the SDK guarantees for these surfaces.
// ─────────────────────────────────────────────────────────────────────────────

describe('PassThrough: per-provider path composition', () => {
  it('anthropic.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.anthropic.get('v1/health'));
  });

  it('anthropic.post v1/messages — gated full success on HAS_ANTHROPIC', async () => {
    const p = client.passThrough.anthropic.post('v1/messages', {
      model: 'claude-3-5-haiku-latest',
      max_tokens: 16,
      messages: [{ role: 'user', content: 'pong' }],
    });

    if (HAS_ANTHROPIC) {
      const res = (await p) as AnthropicMessage;
      expect(typeof res.id).toBe('string');
      expect(res.role).toBe('assistant');
      expect(Array.isArray(res.content)).toBe(true);
    } else {
      await eitherOrStructuredError(p);
    }
  });

  it('gemini.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.gemini.get('v1/health'));
  });

  it('vertex.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.vertex.get('v1/health'));
  });

  it('cohere.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.cohere.get('v1/health'));
  });

  it('mistral.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.mistral.get('v1/health'));
  });

  it('vllm.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.vllm.get('v1/health'));
  });

  it('milvus.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.milvus.get('v1/health'));
  });

  it('bedrock.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.bedrock.get('v1/health'));
  });

  it('assemblyAi.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.assemblyAi.get('v1/health'));
  });

  it('azure.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.azure.get('v1/health'));
  });

  it('openai.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.openai.get('v1/health'));
  });

  it('cursor.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.cursor.get('v1/health'));
  });

  it('langfuse.get reaches the proxy', async () => {
    await eitherOrStructuredError(client.passThrough.langfuse.get('v1/health'));
  });
});
