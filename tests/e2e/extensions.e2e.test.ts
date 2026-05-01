/**
 * @group e2e
 *
 * E2E tests for LiteLLM extension resources: search (+ admin tools),
 * rag, agents, prompts, a2a.
 *
 * Assertion policy: every test commits to ONE outcome — success-with-shape
 * or a single typed error status. See `_assertions.ts`.
 */
import { LiteLLMClient } from '../../src/client';
import { expectShape, expectTypedError } from './_assertions';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

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
// Search — no search provider configured in test proxy
// ─────────────────────────────────────────────────────────────────────────────

describe('Search', () => {
  it('run rejects 500 (no search provider configured)', async () => {
    await expectTypedError(client.search.run({ query: 'hello' }), 500);
  });

  it('runWithTool rejects 500 (no search provider configured)', async () => {
    await expectTypedError(
      client.search.runWithTool('web', { query: 'hello' }),
      500,
    );
  });

  it('listTools returns the (empty) tool registry', async () => {
    await expectShape(client.search.listTools(), {});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Search admin tools
// ─────────────────────────────────────────────────────────────────────────────

describe('Search admin tools', () => {
  it('list returns the admin search-tools listing', async () => {
    await expectShape(client.search.tools.list(), {});
  });

  it('retrieve(nonexistent) rejects 404', async () => {
    await expectTypedError(
      client.search.tools.retrieve('nonexistent-search-tool-id'),
      404,
    );
  });

  it('create returns the created search tool', async () => {
    await expectShape(
      client.search.tools.create({
        search_tool: {
          search_tool_name: uniq('e2e-search-tool'),
          litellm_params: {
            search_provider: 'tavily',
            api_key: 'fake-key',
          },
        },
      }),
      {},
    );
  });

  it('update(nonexistent) rejects 404', async () => {
    await expectTypedError(
      client.search.tools.update('nonexistent-search-tool-id', {
        search_tool: {
          search_tool_name: uniq('e2e-search-tool'),
          litellm_params: {
            search_provider: 'tavily',
            api_key: 'fake-key',
          },
        },
      }),
      404,
    );
  });

  it('delete(nonexistent) rejects 404', async () => {
    await expectTypedError(
      client.search.tools.delete('nonexistent-search-tool-id'),
      404,
    );
  });

  it('testConnection runs a connectivity probe and returns a structured result', async () => {
    await expectShape(
      client.search.tools.testConnection({
        litellm_params: {
          search_provider: 'tavily',
          api_key: 'fake-key',
        },
      }),
      {},
    );
  });

  it('uiAvailableProviders returns the provider catalog', async () => {
    await expectShape(client.search.tools.uiAvailableProviders(), {});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RAG
// ─────────────────────────────────────────────────────────────────────────────

describe('RAG', () => {
  it('ingest rejects 500 (no Pinecone provider configured)', async () => {
    await expectTypedError(
      client.rag.ingest({
        ingest_options: {
          vector_store: {
            custom_llm_provider: 'pinecone',
            vector_store_id: uniq('vs'),
          },
        },
        file: {
          filename: 'hello.txt',
          content: Buffer.from('hello world').toString('base64'),
          content_type: 'text/plain',
        },
      }),
      500,
    );
  });

  it('query rejects 500 (no Pinecone provider configured)', async () => {
    await expectTypedError(
      client.rag.query({
        model: 'fake-openai-chat',
        messages: [{ role: 'user', content: 'What is in the docs?' }],
        retrieval_config: {
          vector_store_id: uniq('vs'),
          custom_llm_provider: 'pinecone',
          top_k: 3,
        },
      }),
      500,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Agents
// ─────────────────────────────────────────────────────────────────────────────

describe('Agents', () => {
  const fakeAgentCard = {
    protocolVersion: '0.2.0',
    name: uniq('agent'),
    description: 'e2e test agent',
    url: 'https://example.invalid/a2a',
    version: '0.0.1',
    capabilities: { streaming: false },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/plain'],
    skills: [
      {
        id: 'echo',
        name: 'echo',
        description: 'echo what was sent',
        tags: ['e2e'],
      },
    ],
  };

  it('list returns the agents registry', async () => {
    await expectShape(client.agents.list(), {});
  });

  it('create returns the created agent', async () => {
    await expectShape(
      client.agents.create({
        agent_name: uniq('agent'),
        agent_card_params: fakeAgentCard,
      }),
      {},
    );
  });

  it('retrieve(nonexistent) rejects 404', async () => {
    await expectTypedError(client.agents.retrieve('nonexistent-agent-id'), 404);
  });

  it('update(nonexistent) rejects 404', async () => {
    await expectTypedError(
      client.agents.update('nonexistent-agent-id', {
        agent_name: uniq('agent'),
        agent_card_params: fakeAgentCard,
      }),
      404,
    );
  });

  it('patch(nonexistent) rejects 404', async () => {
    await expectTypedError(
      client.agents.patch('nonexistent-agent-id', { tpm_limit: 100 }),
      404,
    );
  });

  it('delete(nonexistent) rejects 404', async () => {
    await expectTypedError(client.agents.delete('nonexistent-agent-id'), 404);
  });

  it('makePublic(nonexistent) rejects 404', async () => {
    await expectTypedError(
      client.agents.makePublic('nonexistent-agent-id'),
      404,
    );
  });

  it('makePublicBulk(nonexistent) rejects 404', async () => {
    await expectTypedError(
      client.agents.makePublicBulk({ agent_ids: ['nonexistent-agent-id'] }),
      404,
    );
  });

  it('dailyActivity returns activity rows', async () => {
    await expectShape(
      client.agents.dailyActivity({
        start_date: '2026-04-01',
        end_date: '2026-04-27',
        page: 1,
        page_size: 10,
      }),
      {},
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Prompts (config-managed prompt library)
// ─────────────────────────────────────────────────────────────────────────────

describe('Prompts', () => {
  const promptId = uniq('prompt');

  it('create rejects 422 (payload schema rejected)', async () => {
    await expectTypedError(
      client.prompts.create({
        prompt_id: promptId,
        name: uniq('prompt-name'),
        description: 'e2e test prompt',
        prompt_template: 'Hello {{name}}',
        metadata: { env: 'e2e' },
        tags: ['e2e'],
      }),
      422,
    );
  });

  it('retrieve rejects 400 (proxy returns 400 for missing prompt)', async () => {
    await expectTypedError(client.prompts.retrieve(promptId), 400);
  });

  it('update rejects 422 (payload schema rejected)', async () => {
    await expectTypedError(
      client.prompts.update(promptId, {
        name: uniq('prompt-name-updated'),
        description: 'updated',
      }),
      422,
    );
  });

  it('delete rejects 404 (prompt was not persisted)', async () => {
    await expectTypedError(client.prompts.delete(promptId), 404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A2A
// ─────────────────────────────────────────────────────────────────────────────

describe('A2A', () => {
  const messageId = uniq('msg');

  it('card(nonexistent) rejects 404', async () => {
    await expectTypedError(client.a2a.card('nonexistent-agent'), 404);
  });

  it('invoke(nonexistent) rejects 404', async () => {
    await expectTypedError(
      client.a2a.invoke('nonexistent-agent', {
        jsonrpc: '2.0',
        id: 1,
        method: 'message/send',
        params: {
          message: {
            role: 'user',
            messageId,
            parts: [{ kind: 'text', text: 'hello' }],
          },
        },
      }),
      404,
    );
  });

  it('sendMessage(nonexistent) rejects 404', async () => {
    await expectTypedError(
      client.a2a.sendMessage('nonexistent-agent', {
        jsonrpc: '2.0',
        id: 2,
        method: 'message/send',
        params: {
          message: {
            role: 'user',
            messageId,
            parts: [{ kind: 'text', text: 'hello' }],
          },
        },
      }),
      404,
    );
  });

  it('sendMessageV1(nonexistent) rejects 404', async () => {
    await expectTypedError(
      client.a2a.sendMessageV1('nonexistent-agent', {
        jsonrpc: '2.0',
        id: 3,
        method: 'message/send',
        params: {
          message: {
            role: 'user',
            messageId,
            parts: [{ kind: 'text', text: 'hello' }],
          },
        },
      }),
      404,
    );
  });
});
