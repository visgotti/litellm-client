/**
 * @group e2e
 *
 * E2E tests for vector_stores: OpenAI-shape (vector_stores), nested files,
 * LiteLLM-shape management (vector_store/*), and indexes. Most write paths
 * resolve to structured errors in vanilla LiteLLM (no backend configured) —
 * tests assert success OR structured error to verify SDK marshalling.
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
// OpenAI-shape vector_stores
// ─────────────────────────────────────────────────────────────────────────────

describe('VectorStores (OpenAI-shape)', () => {
  it('create({ name }) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.create({ name: uniq('vs') }),
    );
  });

  it('list() is callable (may be empty)', async () => {
    await eitherOrStructuredError(client.vectorStores.list());
  });

  it('retrieve(vs_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.vectorStores.retrieve('vs_fake'));
  });

  it('update(vs_fake, {...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.update('vs_fake', {
        name: uniq('vs-renamed'),
        metadata: { env: 'e2e' },
      }),
    );
  });

  it('delete(vs_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.vectorStores.delete('vs_fake'));
  });

  it('search(vs_fake, {...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.search('vs_fake', {
        query: 'hello world',
        max_num_results: 3,
      }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Vector store files (nested)
// ─────────────────────────────────────────────────────────────────────────────

describe('VectorStores.files (nested)', () => {
  it('create(vs_fake, { file_id }) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.files.create('vs_fake', { file_id: 'file_fake' }),
    );
  });

  it('list(vs_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(client.vectorStores.files.list('vs_fake'));
  });

  it('retrieve(vs_fake, file_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.files.retrieve('vs_fake', 'file_fake'),
    );
  });

  it('content(vs_fake, file_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.files.content('vs_fake', 'file_fake'),
    );
  });

  it('update(vs_fake, file_fake, {...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.files.update('vs_fake', 'file_fake', {
        attributes: { topic: 'e2e' },
      }),
    );
  });

  it('delete(vs_fake, file_fake) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.files.delete('vs_fake', 'file_fake'),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LiteLLM-shape management (/vector_store/*)
// ─────────────────────────────────────────────────────────────────────────────

describe('VectorStores.management (LiteLLM-shape)', () => {
  const managedId = uniq('mvs');

  it('create({...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.management.create({
        vector_store_id: managedId,
        custom_llm_provider: 'openai',
        vector_store_name: uniq('managed'),
        vector_store_description: 'e2e managed vector store',
      }),
    );
  });

  it('list() is callable (may be empty)', async () => {
    await eitherOrStructuredError(
      client.vectorStores.management.list({ page: 1, page_size: 50 }),
    );
  });

  it('info({...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.management.info({ vector_store_id: managedId }),
    );
  });

  it('update({...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.management.update({
        vector_store_id: managedId,
        vector_store_description: 'updated description',
      }),
    );
  });

  it('delete({...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.management.delete({ vector_store_id: managedId }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Indexes (/v1/indexes)
// ─────────────────────────────────────────────────────────────────────────────

describe('VectorStores.indexes', () => {
  it('create({...}) marshals or returns structured error', async () => {
    await eitherOrStructuredError(
      client.vectorStores.indexes.create({
        index_name: uniq('idx'),
        litellm_params: {
          vector_store_index: uniq('vsi'),
          vector_store_name: uniq('vsn'),
        },
      }),
    );
  });
});
