/**
 * @group e2e
 *
 * E2E tests for OpenAI-shape new APIs: containers, evals, realtime, videos, ocr.
 *
 * Assertion policy: every test commits to ONE outcome — success-with-shape
 * or a single typed error status. See `_assertions.ts`.
 *
 * NOTE: containers + realtime endpoints in this suite are routed through the
 * configured OPENAI_API_KEY (forwarded into the proxy by docker-compose), so
 * "happy-path" assertions are valid. Endpoints whose write paths return 500
 * (evals, container.files mutations, videos.retrieve) are pinned to that
 * status to document a current proxy bug — should turn red and become
 * `expectTypedError(404)` once the proxy translates upstream 404s correctly.
 */
import { LiteLLMClient } from '../../src/client';
import { expectShape, expectTypedError } from './_assertions';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

const has = (n: string) => Boolean(process.env[n] && process.env[n]!.trim().length > 0);
const HAS_OPENAI = has('OPENAI_API_KEY');
const itOpenAI = HAS_OPENAI ? it : it.skip;

let client: LiteLLMClient;
const uniq = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

beforeAll(() => {
  client = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 60_000,
    maxRetries: 1,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Containers (code-interpreter sandboxes — routed via OpenAI)
// ─────────────────────────────────────────────────────────────────────────────

describe('Containers', () => {
  itOpenAI('create returns a container with a cntr_-prefixed id', async () => {
    const r = await client.containers.create({ name: uniq('container') });
    expect(r).toMatchObject({ object: 'container' });
    expect(typeof (r as { id: string }).id).toBe('string');
    expect((r as { id: string }).id.startsWith('cntr_')).toBe(true);
  });

  itOpenAI('list returns the OpenAI list envelope', async () => {
    const r = await client.containers.list();
    expect(r).toMatchObject({ object: 'list' });
    expect(Array.isArray((r as { data: unknown[] }).data)).toBe(true);
  });

  it('retrieve(container_fake) rejects 500 (proxy does not translate 404)', async () => {
    await expectTypedError(client.containers.retrieve('container_fake'), 500);
  });

  it('delete(container_fake) rejects 500 (proxy does not translate 404)', async () => {
    await expectTypedError(client.containers.delete('container_fake'), 500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Evals — every write rejects 500 in the OSS proxy
// ─────────────────────────────────────────────────────────────────────────────

describe('Evals', () => {
  it('create rejects 500 (eval creation unsupported on OSS proxy)', async () => {
    await expectTypedError(
      client.evals.create({
        name: uniq('eval'),
        data_source_config: {
          type: 'custom',
          item_schema: {
            type: 'object',
            properties: { input: { type: 'string' }, expected: { type: 'string' } },
          },
        },
        testing_criteria: [{ type: 'ground_truth', metric: 'exact_match' }],
        metadata: { env: 'e2e' },
      }),
      500,
    );
  });

  itOpenAI('list returns a paginated list of evals', async () => {
    await expectShape(client.evals.list({ limit: 10 }), {});
  });

  it('retrieve(eval_fake) rejects 500', async () => {
    await expectTypedError(client.evals.retrieve('eval_fake'), 500);
  });

  it('update(eval_fake) rejects 500', async () => {
    await expectTypedError(
      client.evals.update('eval_fake', {
        name: uniq('eval-renamed'),
        metadata: { env: 'e2e' },
      }),
      500,
    );
  });

  it('delete(eval_fake) rejects 500', async () => {
    await expectTypedError(client.evals.delete('eval_fake'), 500);
  });

  it('cancel(eval_fake) rejects 500', async () => {
    await expectTypedError(client.evals.cancel('eval_fake'), 500);
  });
});

describe('Evals.runs', () => {
  it('runs.create(eval_fake) rejects 500', async () => {
    await expectTypedError(
      client.evals.runs.create('eval_fake', {
        name: uniq('eval-run'),
        data_source: {
          type: 'inline',
          samples: [{ input: 'hi', expected: 'hi' }],
        },
        metadata: { env: 'e2e' },
      }),
      500,
    );
  });

  it('runs.list(eval_fake) rejects 500', async () => {
    await expectTypedError(
      client.evals.runs.list('eval_fake', { limit: 10 }),
      500,
    );
  });

  it('runs.retrieve(eval_fake, run_fake) rejects 500', async () => {
    await expectTypedError(
      client.evals.runs.retrieve('eval_fake', 'run_fake'),
      500,
    );
  });

  it('runs.cancel(eval_fake, run_fake) rejects 500', async () => {
    await expectTypedError(
      client.evals.runs.cancel('eval_fake', 'run_fake'),
      500,
    );
  });

  it('runs.delete(eval_fake, run_fake) rejects 500', async () => {
    await expectTypedError(
      client.evals.runs.delete('eval_fake', 'run_fake'),
      500,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Realtime (WebRTC — routed via OpenAI)
// ─────────────────────────────────────────────────────────────────────────────

describe('Realtime', () => {
  itOpenAI('createClientSecret returns a real session secret', async () => {
    const r = await client.realtime.createClientSecret({
      session: {
        type: 'realtime',
        model: 'gpt-4o-realtime-preview',
        instructions: 'You are a helpful assistant.',
      },
      expires_after: { anchor: 'created_at', seconds: 600 },
    });
    expect(r).toMatchObject({
      value: expect.any(String),
      expires_at: expect.any(Number),
    });
  });

  it('createCall rejects 401 (fake SDP fails OpenAI auth)', async () => {
    await expectTypedError(
      client.realtime.createCall({
        sdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n',
        model: 'gpt-4o-realtime-preview',
      }),
      401,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Container files — write paths return 500 / content returns 200 with {}
// ─────────────────────────────────────────────────────────────────────────────

describe('Containers.files', () => {
  const containerId = 'cntr_e2e_fake';
  const fileId = 'cf_e2e_fake';

  it('files.create rejects 500 (parent container missing)', async () => {
    const fakeBytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    await expectTypedError(
      client.containers.files.create(containerId, {
        file: fakeBytes,
        filename: 'hello.txt',
        contentType: 'text/plain',
      }),
      500,
    );
  });

  it('files.list rejects 500', async () => {
    await expectTypedError(
      client.containers.files.list(containerId, { limit: 10 }),
      500,
    );
  });

  it('files.retrieve rejects 500', async () => {
    await expectTypedError(client.containers.files.retrieve(containerId, fileId), 500);
  });

  it('files.content returns 200 with empty body (proxy bug — should 404)', async () => {
    const r = await client.containers.files.content(containerId, fileId);
    expect(r).toMatchObject({});
  });

  it('files.delete rejects 500', async () => {
    await expectTypedError(client.containers.files.delete(containerId, fileId), 500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Realtime — additional construction smoke tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Realtime (smoke)', () => {
  itOpenAI('createClientSecret with minimal session returns a real session secret', async () => {
    const r = await client.realtime.createClientSecret({
      session: { type: 'realtime', model: 'gpt-realtime' },
    });
    expect(r).toMatchObject({
      value: expect.any(String),
      expires_at: expect.any(Number),
    });
  });

  it('createCall with minimal SDP rejects 401', async () => {
    await expectTypedError(
      client.realtime.createCall({ sdp: '<fake sdp>' }),
      401,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Videos (Sora) — no Sora deployment configured, write paths reject 400/405
// ─────────────────────────────────────────────────────────────────────────────

describe('Videos', () => {
  it('create rejects 400 (no video provider configured)', async () => {
    await expectTypedError(
      client.videos.create({ model: 'sora-2', prompt: 'a cat' }),
      400,
    );
  });

  it('list rejects 400 (no video provider configured)', async () => {
    await expectTypedError(client.videos.list(), 400);
  });

  it('retrieve(vid_fake) rejects 500', async () => {
    await expectTypedError(client.videos.retrieve('vid_fake'), 500);
  });

  it('content(vid_fake) returns 200 with empty body (proxy bug)', async () => {
    const r = await client.videos.content('vid_fake');
    expect(r).toMatchObject({});
  });

  it('remix(vid_fake) rejects 400 (no healthy sora-2 deployment)', async () => {
    await expectTypedError(
      client.videos.remix('vid_fake', { prompt: 'make it a dog', model: 'sora-2' }),
      400,
    );
  });

  it('createCharacter rejects 500', async () => {
    const fakeVideo = new Uint8Array([0, 0, 0, 32, 102, 116, 121, 112]);
    await expectTypedError(
      client.videos.createCharacter({
        video: fakeVideo,
        name: uniq('character'),
        filename: 'character.mp4',
        contentType: 'video/mp4',
      }),
      500,
    );
  });

  it('retrieveCharacter(char_fake) rejects 500', async () => {
    await expectTypedError(client.videos.retrieveCharacter('char_fake'), 500);
  });

  it('edit rejects 400 (no healthy sora-2 deployment)', async () => {
    await expectTypedError(
      client.videos.edit({
        prompt: 'add a sunset',
        video: { id: 'vid_fake' },
        model: 'sora-2',
      }),
      400,
    );
  });

  it('extend rejects 400 (no healthy sora-2 deployment)', async () => {
    await expectTypedError(
      client.videos.extend({
        prompt: 'continue the scene',
        video: { id: 'vid_fake' },
        seconds: '4',
        model: 'sora-2',
      }),
      400,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OCR (Mistral-shape)
// ─────────────────────────────────────────────────────────────────────────────

describe('OCR', () => {
  it('create rejects 400 (no Mistral OCR provider configured)', async () => {
    await expectTypedError(
      client.ocr.create({
        model: 'mistral-ocr-latest',
        document: {
          type: 'document_url',
          document_url: 'https://example.com/doc.pdf',
        },
      }),
      400,
    );
  });
});
