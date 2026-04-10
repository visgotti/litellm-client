/**
 * @group unit
 */
import { LiteLLMProxyClient } from '../../src/client';
import {
  AuthenticationError,
  RateLimitError,
  InternalServerError,
  TimeoutError,
} from '../../src/errors';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

function sseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  let i = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(encoder.encode(chunks[i]));
        i++;
      } else {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { 'content-type': 'text/event-stream' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('LiteLLMProxyClient', () => {
  let mockFetch: jest.Mock;
  let client: LiteLLMProxyClient;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new LiteLLMProxyClient({
      baseUrl: 'http://localhost:4000',
      apiKey: 'sk-test',
      timeout: 5000,
      maxRetries: 0, // Disable retries for unit tests
      fetch: mockFetch,
    });
  });

  // ───── Config ────────────────────────────────────────────────────────────

  describe('config', () => {
    it('strips trailing slashes from baseUrl', () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'healthy' }));
      const c = new LiteLLMProxyClient({
        baseUrl: 'http://localhost:4000///',
        fetch: mockFetch,
        maxRetries: 0,
      });
      c.health.liveness();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/^http:\/\/localhost:4000\/health/),
        expect.anything(),
      );
    });

    it('sends Authorization header with apiKey', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ object: 'list', data: [] }));
      await client.models.list();
      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers.authorization).toBe('Bearer sk-test');
    });

    it('does not send Authorization header without apiKey', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ object: 'list', data: [] }));
      const c = new LiteLLMProxyClient({
        baseUrl: 'http://localhost:4000',
        fetch: mockFetch,
        maxRetries: 0,
      });
      await c.models.list();
      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers.authorization).toBeUndefined();
    });

    it('sends default headers', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ object: 'list', data: [] }));
      const c = new LiteLLMProxyClient({
        baseUrl: 'http://localhost:4000',
        defaultHeaders: { 'x-custom': 'val' },
        fetch: mockFetch,
        maxRetries: 0,
      });
      await c.models.list();
      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers['x-custom']).toBe('val');
    });
  });

  // ───── Chat completions ──────────────────────────────────────────────────

  describe('chat.completions.create', () => {
    it('sends a non-streaming chat completion request', async () => {
      const mockResponse = {
        id: 'chatcmpl-1',
        object: 'chat.completion',
        created: 1234567890,
        model: 'gpt-4',
        choices: [{
          index: 0,
          message: { role: 'assistant', content: 'Hello!' },
          finish_reason: 'stop',
        }],
        usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 },
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(mockResponse));

      const result = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hi' }],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        }),
      );
      expect(result.id).toBe('chatcmpl-1');
      expect(result.choices[0].message.content).toBe('Hello!');
    });

    it('sends optional parameters', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        id: 'chatcmpl-2', object: 'chat.completion', created: 1, model: 'm',
        choices: [{ index: 0, message: { role: 'assistant', content: '' }, finish_reason: 'stop' }],
      }));

      await client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
        max_tokens: 100,
        top_p: 0.9,
        stop: ['\n'],
        response_format: { type: 'json_object' },
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.temperature).toBe(0.7);
      expect(body.max_tokens).toBe(100);
      expect(body.top_p).toBe(0.9);
      expect(body.stop).toEqual(['\n']);
      expect(body.response_format).toEqual({ type: 'json_object' });
    });

    it('sends tool definitions', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        id: 'c-3', object: 'chat.completion', created: 1, model: 'm',
        choices: [{ index: 0, message: { role: 'assistant', content: null, tool_calls: [{ id: 'tc1', type: 'function', function: { name: 'get_weather', arguments: '{}' } }] }, finish_reason: 'tool_calls' }],
      }));

      const result = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'weather?' }],
        tools: [{
          type: 'function',
          function: { name: 'get_weather', parameters: { type: 'object', properties: {} } },
        }],
        tool_choice: 'auto',
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.tools).toHaveLength(1);
      expect(body.tool_choice).toBe('auto');
      expect(result.choices[0].finish_reason).toBe('tool_calls');
    });

    it('returns a streaming response', async () => {
      mockFetch.mockResolvedValueOnce(sseResponse([
        'data: {"id":"c1","object":"chat.completion.chunk","created":1,"model":"m","choices":[{"index":0,"delta":{"role":"assistant","content":"Hi"},"finish_reason":null}]}\n\n',
        'data: {"id":"c1","object":"chat.completion.chunk","created":1,"model":"m","choices":[{"index":0,"delta":{"content":" there"},"finish_reason":"stop"}]}\n\n',
        'data: [DONE]\n\n',
      ]));

      const stream = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hi' }],
        stream: true,
      });

      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0].choices[0].delta.content).toBe('Hi');
      expect(chunks[1].choices[0].finish_reason).toBe('stop');
    });

    it('throws on stream error response', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: { message: 'bad request' } }, 400));

      await expect(client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'x' }],
        stream: true,
      })).rejects.toThrow();
    });

    it('throws when stream body is null', async () => {
      mockFetch.mockResolvedValueOnce(new Response(null as any, {
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
      }));

      await expect(client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'x' }],
        stream: true,
      })).rejects.toThrow('Response body is null');
    });

    it('forwards extra_headers and metadata', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        id: 'c-4', object: 'chat.completion', created: 1, model: 'm',
        choices: [{ index: 0, message: { role: 'assistant', content: '' }, finish_reason: 'stop' }],
      }));

      await client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
        extra_headers: { 'x-custom': 'value' },
        metadata: { user_id: 'u1' },
      });

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers['x-custom']).toBe('value');
      expect(init.headers['x-litellm-metadata']).toBe(JSON.stringify({ user_id: 'u1' }));
      // extra_headers and metadata should NOT be in the body
      const body = JSON.parse(init.body);
      expect(body.extra_headers).toBeUndefined();
      expect(body.metadata).toBeUndefined();
    });
  });

  // ───── Embeddings ────────────────────────────────────────────────────────

  describe('embeddings.create', () => {
    it('sends an embedding request', async () => {
      const mockResponse = {
        object: 'list',
        model: 'text-embedding-ada-002',
        data: [{ object: 'embedding', index: 0, embedding: [0.1, 0.2] }],
        usage: { prompt_tokens: 3, total_tokens: 3 },
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(mockResponse));

      const result = await client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: 'Hello',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/v1/embeddings',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.data[0].embedding).toEqual([0.1, 0.2]);
    });

    it('supports array input', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({
        object: 'list', model: 'm',
        data: [
          { object: 'embedding', index: 0, embedding: [0.1] },
          { object: 'embedding', index: 1, embedding: [0.2] },
        ],
        usage: { prompt_tokens: 5, total_tokens: 5 },
      }));

      await client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: ['Hello', 'World'],
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.input).toEqual(['Hello', 'World']);
    });
  });

  // ───── Models ────────────────────────────────────────────────────────────

  describe('models', () => {
    it('lists models', async () => {
      const mockResponse = {
        object: 'list',
        data: [{ id: 'gpt-4', object: 'model', created: 1, owned_by: 'openai' }],
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(mockResponse));

      const result = await client.models.list();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/v1/models',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.data[0].id).toBe('gpt-4');
    });

    it('gets model info', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));
      await client.models.info();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/model/info',
        expect.anything(),
      );
    });

    it('creates a model', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.models.create({ model_name: 'custom', litellm_params: { model: 'gpt-4' } });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/model/new',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('deletes a model', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.models.delete({ id: 'm1' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/model/delete',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  // ───── Keys ──────────────────────────────────────────────────────────────

  describe('keys', () => {
    it('creates a key', async () => {
      const mockResponse = { key: 'sk-new', token: 't', key_name: 'k', expires: null, user_id: null, team_id: null, max_budget: null, models: [], metadata: {} };
      mockFetch.mockResolvedValueOnce(jsonResponse(mockResponse));

      const result = await client.keys.create({ models: ['gpt-4'], max_budget: 10 });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/key/generate',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.key).toBe('sk-new');
    });

    it('deletes keys', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ deleted_keys: ['sk-1'] }));
      const result = await client.keys.delete({ keys: ['sk-1'] });
      expect(result.deleted_keys).toEqual(['sk-1']);
    });

    it('updates a key', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.keys.update({ key: 'sk-1', max_budget: 99 });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/key/update',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('gets key info', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ key: 'sk-1', info: {} }));
      await client.keys.info('sk-1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/key/info?key=sk-1',
        expect.anything(),
      );
    });
  });

  // ───── Users ─────────────────────────────────────────────────────────────

  describe('users', () => {
    it('creates a user', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ user_id: 'u1', user_email: null, user_role: 'internal_user', max_budget: null, models: [], metadata: {} }));
      const result = await client.users.create({ user_id: 'u1' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/user/new',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.user_id).toBe('u1');
    });

    it('gets user info', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ user_id: 'u1' }));
      await client.users.info('u1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/user/info?user_id=u1',
        expect.anything(),
      );
    });

    it('updates a user', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.users.update({ user_id: 'u1', max_budget: 100 });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/user/update',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('deletes a user', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ deleted_users: ['u1'] }));
      const result = await client.users.delete({ user_ids: ['u1'] });
      expect(result.deleted_users).toEqual(['u1']);
    });
  });

  // ───── Teams ─────────────────────────────────────────────────────────────

  describe('teams', () => {
    it('creates a team', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ team_id: 't1', team_alias: 'eng', models: [], max_budget: null, members_with_roles: [], metadata: {}, created_at: '', updated_at: '' }));
      const result = await client.teams.create({ team_alias: 'eng' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/team/new',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.team_id).toBe('t1');
    });

    it('gets team info', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ team_id: 't1' }));
      await client.teams.info('t1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/team/info?team_id=t1',
        expect.anything(),
      );
    });

    it('updates a team', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.teams.update({ team_id: 't1', max_budget: 500 });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/team/update',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('deletes a team', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ deleted_teams: ['t1'] }));
      const result = await client.teams.delete({ team_ids: ['t1'] });
      expect(result.deleted_teams).toEqual(['t1']);
    });

    it('adds a member', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.teams.addMember({ team_id: 't1', member: { role: 'user', user_id: 'u1' } });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.team_id).toBe('t1');
      expect(body.member.user_id).toBe('u1');
    });

    it('removes a member', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.teams.deleteMember({ team_id: 't1', user_id: 'u1' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/team/member_delete',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  // ───── Health ────────────────────────────────────────────────────────────

  describe('health', () => {
    it('checks health', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ healthy_endpoints: [], unhealthy_endpoints: [], healthy_count: 1, unhealthy_count: 0 }));
      const result = await client.health.check();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/health',
        expect.anything(),
      );
      expect(result.healthy_count).toBe(1);
    });

    it('checks liveness', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'healthy' }));
      const result = await client.health.liveness();
      expect(result.status).toBe('healthy');
    });

    it('checks readiness', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'healthy', db: 'connected', litellm_version: '1.0' }));
      const result = await client.health.readiness();
      expect(result.db).toBe('connected');
    });
  });

  // ───── Budgets ───────────────────────────────────────────────────────────

  describe('budgets', () => {
    it('creates a budget', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ budget_id: 'b1' }));
      await client.budgets.create({ max_budget: 100 });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/budget/new',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('updates a budget', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.budgets.update({ budget_id: 'b1', max_budget: 200 });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/budget/update',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('deletes a budget', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.budgets.delete({ id: 'b1' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/budget/delete',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('gets budget info', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ budget_id: 'b1', max_budget: 100 }));
      await client.budgets.info({ budgets: ['b1'] });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/budget/info',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  // ───── Error handling ────────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws AuthenticationError on 401', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: { message: 'Invalid API key' } }, 401));
      await expect(client.models.list()).rejects.toThrow(AuthenticationError);
    });

    it('throws RateLimitError on 429', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: { message: 'rate limited' } }, 429));
      await expect(client.models.list()).rejects.toThrow(RateLimitError);
    });

    it('throws InternalServerError on 500', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ error: { message: 'server error' } }, 500));
      await expect(client.models.list()).rejects.toThrow(InternalServerError);
    });

    it('handles non-JSON error bodies', async () => {
      mockFetch.mockResolvedValueOnce(new Response('Not JSON', { status: 400 }));
      await expect(client.models.list()).rejects.toThrow();
    });
  });

  // ───── Retry logic ───────────────────────────────────────────────────────

  describe('retry', () => {
    it('retries on 429 up to maxRetries', async () => {
      const retryClient = new LiteLLMProxyClient({
        baseUrl: 'http://localhost:4000',
        maxRetries: 2,
        fetch: mockFetch,
      });

      mockFetch
        .mockResolvedValueOnce(jsonResponse({ error: { message: 'rate limited' } }, 429))
        .mockResolvedValueOnce(jsonResponse({ error: { message: 'rate limited' } }, 429))
        .mockResolvedValueOnce(jsonResponse({ object: 'list', data: [] }));

      const result = await retryClient.models.list();
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.data).toEqual([]);
    });

    it('retries on 500', async () => {
      const retryClient = new LiteLLMProxyClient({
        baseUrl: 'http://localhost:4000',
        maxRetries: 1,
        fetch: mockFetch,
      });

      mockFetch
        .mockResolvedValueOnce(jsonResponse({}, 500))
        .mockResolvedValueOnce(jsonResponse({ object: 'list', data: [] }));

      const result = await retryClient.models.list();
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual([]);
    });

    it('does not retry on 401', async () => {
      const retryClient = new LiteLLMProxyClient({
        baseUrl: 'http://localhost:4000',
        maxRetries: 2,
        fetch: mockFetch,
      });

      mockFetch.mockResolvedValueOnce(jsonResponse({ error: { message: 'bad key' } }, 401));
      await expect(retryClient.models.list()).rejects.toThrow(AuthenticationError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries on network errors', async () => {
      const retryClient = new LiteLLMProxyClient({
        baseUrl: 'http://localhost:4000',
        maxRetries: 1,
        fetch: mockFetch,
      });

      mockFetch
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValueOnce(jsonResponse({ object: 'list', data: [] }));

      const result = await retryClient.models.list();
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual([]);
    });
  });
});
