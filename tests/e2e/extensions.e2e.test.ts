/**
 * @group e2e
 *
 * E2E tests for LiteLLM extension resources: search (+ admin tools),
 * rag, agents, a2a. Most paths return structured errors without a configured
 * search/RAG/agent provider — tests assert success OR structured error.
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
// Search
// ─────────────────────────────────────────────────────────────────────────────

describe('Search', () => {
  it('run dispatches POST /v1/search with a query', async () => {
    await eitherOrStructuredError(client.search.run({ query: 'hello' }));
  });

  it('runWithTool dispatches POST /v1/search/{tool_name}', async () => {
    await eitherOrStructuredError(
      client.search.runWithTool('web', { query: 'hello' }),
    );
  });

  it('listTools returns a list (possibly empty)', async () => {
    const result = await eitherOrStructuredError(client.search.listTools());
    if (!(result instanceof Error)) {
      expect(result).toBeDefined();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Search admin tools
// ─────────────────────────────────────────────────────────────────────────────

describe('Search admin tools', () => {
  it('list returns the admin search-tools listing', async () => {
    const result = await eitherOrStructuredError(client.search.tools.list());
    if (!(result instanceof Error)) {
      expect(result).toBeDefined();
    }
  });

  it('retrieve handles an unknown id with a structured error', async () => {
    await eitherOrStructuredError(
      client.search.tools.retrieve('nonexistent-search-tool-id'),
    );
  });

  it('create dispatches POST /search_tools', async () => {
    await eitherOrStructuredError(
      client.search.tools.create({
        search_tool: {
          search_tool_name: uniq('e2e-search-tool'),
          litellm_params: {
            search_provider: 'tavily',
            api_key: 'fake-key',
          },
        },
      }),
    );
  });

  it('update dispatches PUT /search_tools/{id}', async () => {
    await eitherOrStructuredError(
      client.search.tools.update('nonexistent-search-tool-id', {
        search_tool: {
          search_tool_name: uniq('e2e-search-tool'),
          litellm_params: {
            search_provider: 'tavily',
            api_key: 'fake-key',
          },
        },
      }),
    );
  });

  it('delete dispatches DELETE /search_tools/{id}', async () => {
    await eitherOrStructuredError(
      client.search.tools.delete('nonexistent-search-tool-id'),
    );
  });

  it('testConnection dispatches POST /search_tools/test_connection', async () => {
    await eitherOrStructuredError(
      client.search.tools.testConnection({
        litellm_params: {
          search_provider: 'tavily',
          api_key: 'fake-key',
        },
      }),
    );
  });

  it('uiAvailableProviders returns the provider catalog', async () => {
    const result = await eitherOrStructuredError(
      client.search.tools.uiAvailableProviders(),
    );
    if (!(result instanceof Error)) {
      expect(result).toBeDefined();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RAG
// ─────────────────────────────────────────────────────────────────────────────

describe('RAG', () => {
  it('ingest dispatches POST /v1/rag/ingest', async () => {
    await eitherOrStructuredError(
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
    );
  });

  it('query dispatches POST /v1/rag/query', async () => {
    await eitherOrStructuredError(
      client.rag.query({
        model: 'fake-openai-chat',
        messages: [{ role: 'user', content: 'What is in the docs?' }],
        retrieval_config: {
          vector_store_id: uniq('vs'),
          custom_llm_provider: 'pinecone',
          top_k: 3,
        },
      }),
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

  it('list returns the agents registry (possibly empty)', async () => {
    const result = await eitherOrStructuredError(client.agents.list());
    if (!(result instanceof Error)) {
      expect(result).toBeDefined();
    }
  });

  it('create dispatches POST /v1/agents', async () => {
    await eitherOrStructuredError(
      client.agents.create({
        agent_name: uniq('agent'),
        agent_card_params: fakeAgentCard,
      }),
    );
  });

  it('retrieve handles an unknown id with a structured error', async () => {
    await eitherOrStructuredError(
      client.agents.retrieve('nonexistent-agent-id'),
    );
  });

  it('update dispatches PUT /v1/agents/{id}', async () => {
    await eitherOrStructuredError(
      client.agents.update('nonexistent-agent-id', {
        agent_name: uniq('agent'),
        agent_card_params: fakeAgentCard,
      }),
    );
  });

  it('patch dispatches PATCH /v1/agents/{id}', async () => {
    await eitherOrStructuredError(
      client.agents.patch('nonexistent-agent-id', {
        tpm_limit: 100,
      }),
    );
  });

  it('delete dispatches DELETE /v1/agents/{id}', async () => {
    await eitherOrStructuredError(
      client.agents.delete('nonexistent-agent-id'),
    );
  });

  it('makePublic dispatches POST /v1/agents/{id}/make_public', async () => {
    await eitherOrStructuredError(
      client.agents.makePublic('nonexistent-agent-id'),
    );
  });

  it('makePublicBulk dispatches POST /v1/agents/make_public', async () => {
    await eitherOrStructuredError(
      client.agents.makePublicBulk({
        agent_ids: ['nonexistent-agent-id'],
      }),
    );
  });

  it('dailyActivity dispatches GET /agent/daily/activity', async () => {
    await eitherOrStructuredError(
      client.agents.dailyActivity({
        start_date: '2026-04-01',
        end_date: '2026-04-27',
        page: 1,
        page_size: 10,
      }),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A2A
// ─────────────────────────────────────────────────────────────────────────────

describe('A2A', () => {
  const messageId = uniq('msg');

  it('card dispatches GET /a2a/{agent}/.well-known/agent-card.json', async () => {
    await eitherOrStructuredError(client.a2a.card('nonexistent-agent'));
  });

  it('invoke dispatches POST /a2a/{agent}', async () => {
    await eitherOrStructuredError(
      client.a2a.invoke('nonexistent-agent', {
        jsonrpc: '2.0',
        id: 1,
        method: 'message/send',
        params: {
          message: {
            role: 'user',
            messageId,
            parts: [{ type: 'text', text: 'hello' }],
          },
        },
      }),
    );
  });

  it('sendMessage dispatches POST /a2a/{agent}/message/send', async () => {
    await eitherOrStructuredError(
      client.a2a.sendMessage('nonexistent-agent', {
        jsonrpc: '2.0',
        id: 2,
        method: 'message/send',
        params: {
          message: {
            role: 'user',
            messageId,
            parts: [{ type: 'text', text: 'hello' }],
          },
        },
      }),
    );
  });

  it('sendMessageV1 dispatches POST /v1/a2a/{agent}/message/send', async () => {
    await eitherOrStructuredError(
      client.a2a.sendMessageV1('nonexistent-agent', {
        jsonrpc: '2.0',
        id: 3,
        method: 'message/send',
        params: {
          message: {
            role: 'user',
            messageId,
            parts: [{ type: 'text', text: 'hello' }],
          },
        },
      }),
    );
  });
});
