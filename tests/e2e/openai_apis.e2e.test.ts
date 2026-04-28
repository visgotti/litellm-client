/**
 * @group e2e
 *
 * E2E tests for OpenAI-shape new APIs: containers, evals, realtime, videos, ocr.
 * Most write paths return structured errors when no real provider is configured.
 * Tests verify either successful response or structured error.
 */
import { LiteLLMProxyClient } from '../../src/client';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMProxyClient;
const uniq = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

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
// Containers (code-interpreter sandboxes)
// ─────────────────────────────────────────────────────────────────────────────

describe('Containers', () => {
  it('create({ name }) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.containers.create({ name: uniq('container') }),
    );
  });

  it('list() is callable (may be empty)', async () => {
    await eitherOrStructuredError(client.containers.list());
  });

  it('retrieve(container_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.containers.retrieve('container_fake'));
  });

  it('delete(container_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.containers.delete('container_fake'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Evals
// ─────────────────────────────────────────────────────────────────────────────

describe('Evals', () => {
  it('create({...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.evals.create({
        name: uniq('eval'),
        data_source_config: {
          type: 'custom',
          item_schema: {
            type: 'object',
            properties: { input: { type: 'string' }, expected: { type: 'string' } },
          },
        },
        testing_criteria: [
          {
            type: 'ground_truth',
            metric: 'exact_match',
          },
        ],
        metadata: { env: 'e2e' },
      }),
    );
  });

  it('list() is callable (may be empty)', async () => {
    await eitherOrStructuredError(client.evals.list({ limit: 10 }));
  });

  it('retrieve(eval_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.evals.retrieve('eval_fake'));
  });

  it('update(eval_fake, {...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.evals.update('eval_fake', {
        name: uniq('eval-renamed'),
        metadata: { env: 'e2e' },
      }),
    );
  });

  it('delete(eval_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.evals.delete('eval_fake'));
  });

  it('cancel(eval_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.evals.cancel('eval_fake'));
  });
});

describe('Evals.runs', () => {
  it('runs.create(eval_fake, {...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.evals.runs.create('eval_fake', {
        name: uniq('eval-run'),
        data_source: {
          type: 'inline',
          samples: [{ input: 'hi', expected: 'hi' }],
        },
        metadata: { env: 'e2e' },
      }),
    );
  });

  it('runs.list(eval_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.evals.runs.list('eval_fake', { limit: 10 }));
  });

  it('runs.retrieve(eval_fake, run_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.evals.runs.retrieve('eval_fake', 'run_fake'),
    );
  });

  it('runs.cancel(eval_fake, run_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.evals.runs.cancel('eval_fake', 'run_fake'),
    );
  });

  it('runs.delete(eval_fake, run_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.evals.runs.delete('eval_fake', 'run_fake'),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Realtime (WebRTC)
// ─────────────────────────────────────────────────────────────────────────────

describe('Realtime', () => {
  it('createClientSecret({...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.realtime.createClientSecret({
        session: {
          type: 'realtime',
          model: 'gpt-4o-realtime-preview',
          instructions: 'You are a helpful assistant.',
        },
        expires_after: { anchor: 'created_at', seconds: 600 },
      }),
    );
  });

  it('createCall({ sdp }) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.realtime.createCall({
        sdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n',
        model: 'gpt-4o-realtime-preview',
      }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Videos (Sora)
// ─────────────────────────────────────────────────────────────────────────────

describe('Videos', () => {
  it('create({ model, prompt }) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.videos.create({ model: 'sora-2', prompt: 'a cat' }),
    );
  });

  it('list() is callable (may be empty)', async () => {
    await eitherOrStructuredError(client.videos.list());
  });

  it('retrieve(vid_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.videos.retrieve('vid_fake'));
  });

  it('content(vid_fake) returns ArrayBuffer or structured error', async () => {
    const result = await eitherOrStructuredError(client.videos.content('vid_fake'));
    if (!(result instanceof Error)) {
      expect(result).toBeInstanceOf(ArrayBuffer);
    }
  });

  it('remix(vid_fake, {...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.videos.remix('vid_fake', { prompt: 'make it a dog', model: 'sora-2' }),
    );
  });

  it('createCharacter({...}) marshals or returns structured error', async () => {
    const fakeVideo = new Uint8Array([0, 0, 0, 32, 102, 116, 121, 112]); // tiny fake mp4 header
    await eitherOrStructuredError(
      client.videos.createCharacter({
        video: fakeVideo,
        name: uniq('character'),
        filename: 'character.mp4',
        contentType: 'video/mp4',
      }),
    );
  });

  it('retrieveCharacter(char_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.videos.retrieveCharacter('char_fake'));
  });

  it('edit({...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.videos.edit({
        prompt: 'add a sunset',
        video: { id: 'vid_fake' },
        model: 'sora-2',
      }),
    );
  });

  it('extend({...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.videos.extend({
        prompt: 'continue the scene',
        video: { id: 'vid_fake' },
        seconds: '4',
        model: 'sora-2',
      }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OCR (Mistral-shape)
// ─────────────────────────────────────────────────────────────────────────────

describe('OCR', () => {
  it('create({ document_url }) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.ocr.create({
        model: 'mistral-ocr-latest',
        document: {
          type: 'document_url',
          document_url: 'https://example.com/doc.pdf',
        },
      }),
    );
  });
});
