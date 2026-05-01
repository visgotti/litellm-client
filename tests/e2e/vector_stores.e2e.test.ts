/**
 * @group e2e
 *
 * E2E tests for vector_stores: OpenAI-shape (vector_stores), nested files,
 * LiteLLM-shape management (vector_store/*), and indexes.
 *
 * Assertion policy: every test commits to ONE outcome — success-with-shape
 * or a single typed error status. See `_assertions.ts`.
 *
 * KNOWN PROXY BUG (documented in tests below):
 *   GET /vector_stores/{id}/files (and nested file retrieve/content) returns
 *   HTTP 200 with an error envelope `{ error: { ... } }` for unknown vector
 *   store IDs, instead of HTTP 404. The SDK currently propagates this as a
 *   "successful" response. The tests below pin the *current* behaviour so a
 *   future proxy fix (or SDK envelope-detection) will fail the test loudly
 *   and we can flip them to `expectTypedError(404)`.
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
// OpenAI-shape vector_stores
// ─────────────────────────────────────────────────────────────────────────────

describe('VectorStores (OpenAI-shape)', () => {
  itOpenAI('create returns a new vector store with a vs_-prefixed id', async () => {
    const r = await expectShape(client.vectorStores.create({ name: uniq('vs') }), {
      object: 'vector_store',
    });
    expect(typeof (r as { id: string }).id).toBe('string');
    expect((r as { id: string }).id.startsWith('vs_')).toBe(true);
  });

  it('list rejects 400 (proxy requires a model param)', async () => {
    await expectTypedError(client.vectorStores.list(), 400);
  });

  it('retrieve(vs_fake) rejects 400 (proxy requires a model param)', async () => {
    await expectTypedError(client.vectorStores.retrieve('vs_fake'), 400);
  });

  it('update(vs_fake) rejects 400 (proxy requires a model param)', async () => {
    await expectTypedError(
      client.vectorStores.update('vs_fake', {
        name: uniq('vs-renamed'),
        metadata: { env: 'e2e' },
      }),
      400,
    );
  });

  it('delete(vs_fake) rejects 400 (proxy requires a model param)', async () => {
    await expectTypedError(client.vectorStores.delete('vs_fake'), 400);
  });

  it('search(vs_fake) rejects 500', async () => {
    await expectTypedError(
      client.vectorStores.search('vs_fake', {
        query: 'hello world',
        max_num_results: 3,
      }),
      500,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Vector store files (nested) — see KNOWN PROXY BUG note at top of file
// ─────────────────────────────────────────────────────────────────────────────

describe('VectorStores.files (nested)', () => {
  it('create rejects 500 for unknown parent vs', async () => {
    await expectTypedError(
      client.vectorStores.files.create('vs_fake', { file_id: 'file_fake' }),
      500,
    );
  });

  itOpenAI('list returns 200 with an error envelope for unknown parent vs (proxy bug)', async () => {
    const r = (await client.vectorStores.files.list('vs_fake')) as {
      error?: { type?: string; param?: string };
    };
    expect(r.error).toMatchObject({
      type: 'invalid_request_error',
      param: 'vector_store_id',
    });
  });

  itOpenAI('retrieve returns 200 with an error envelope for unknown parent vs (proxy bug)', async () => {
    const r = (await client.vectorStores.files.retrieve('vs_fake', 'file_fake')) as {
      error?: { type?: string; param?: string };
    };
    expect(r.error).toMatchObject({
      type: 'invalid_request_error',
      param: 'vector_store_id',
    });
  });

  itOpenAI('content returns 200 with an error envelope for unknown parent vs (proxy bug)', async () => {
    const r = (await client.vectorStores.files.content('vs_fake', 'file_fake')) as {
      error?: { type?: string; param?: string };
    };
    expect(r.error).toMatchObject({
      type: 'invalid_request_error',
      param: 'vector_store_id',
    });
  });

  it('update rejects 500', async () => {
    await expectTypedError(
      client.vectorStores.files.update('vs_fake', 'file_fake', {
        attributes: { topic: 'e2e' },
      }),
      500,
    );
  });

  it('delete rejects 500', async () => {
    await expectTypedError(
      client.vectorStores.files.delete('vs_fake', 'file_fake'),
      500,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LiteLLM-shape management (/vector_store/*)
// ─────────────────────────────────────────────────────────────────────────────

describe('VectorStores.management (LiteLLM-shape)', () => {
  const managedId = uniq('mvs');

  it('create succeeds and returns the created vector store record', async () => {
    await expectShape(
      client.vectorStores.management.create({
        vector_store_id: managedId,
        custom_llm_provider: 'openai',
        vector_store_name: uniq('managed'),
        vector_store_description: 'e2e managed vector store',
      }),
      {},
    );
  });

  it('list returns a paginated list', async () => {
    const r = await client.vectorStores.management.list({ page: 1, page_size: 50 });
    expect(typeof r).toBe('object');
    expect(r).not.toBeNull();
  });

  it('info returns the registered vector store', async () => {
    await expectShape(
      client.vectorStores.management.info({ vector_store_id: managedId }),
      {},
    );
  });

  it('update returns the updated vector store', async () => {
    await expectShape(
      client.vectorStores.management.update({
        vector_store_id: managedId,
        vector_store_description: 'updated description',
      }),
      {},
    );
  });

  it('delete returns confirmation', async () => {
    await expectShape(
      client.vectorStores.management.delete({ vector_store_id: managedId }),
      {},
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Indexes (/v1/indexes)
// ─────────────────────────────────────────────────────────────────────────────

describe('VectorStores.indexes', () => {
  it('create succeeds with valid params', async () => {
    await expectShape(
      client.vectorStores.indexes.create({
        index_name: uniq('idx'),
        litellm_params: {
          vector_store_index: uniq('vsi'),
          vector_store_name: uniq('vsn'),
        },
      }),
      {},
    );
  });
});
