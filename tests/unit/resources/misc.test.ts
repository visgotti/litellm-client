/**
 * @group unit
 */
import { LiteLLMClient } from '../../../src/client';
import { Stream } from '../../../src/streaming';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
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

describe('MiscResource', () => {
  let mockFetch: jest.Mock;
  let client: LiteLLMClient;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new LiteLLMClient({
      baseUrl: 'http://localhost:4000',
      apiKey: 'sk-test',
      maxRetries: 0,
      fetch: mockFetch,
    });
  });

  describe('applyGuardrail', () => {
    it('POSTs body to /apply_guardrail', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ response_text: 'redacted' }));
      const result = await client.misc.applyGuardrail({
        guardrail_name: 'gr1',
        text: 'hello',
      });
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/apply_guardrail');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({
        guardrail_name: 'gr1',
        text: 'hello',
      });
      expect(result.response_text).toBe('redacted');
    });
  });

  describe('addAllowedIp / deleteAllowedIp', () => {
    it('POSTs to /add/allowed_ip', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ message: 'IP added', status: 'success' }),
      );
      const result = await client.misc.addAllowedIp({ ip: '1.2.3.4' });
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/add/allowed_ip');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({ ip: '1.2.3.4' });
      expect(result.status).toBe('success');
    });

    it('POSTs to /delete/allowed_ip', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ message: 'IP removed', status: 'success' }),
      );
      const result = await client.misc.deleteAllowedIp({ ip: '5.6.7.8' });
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/delete/allowed_ip');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({ ip: '5.6.7.8' });
      expect(result.message).toBe('IP removed');
    });
  });

  describe('apiEventLoggingBatch', () => {
    it('POSTs the batch payload', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }));
      const result = await client.misc.apiEventLoggingBatch({
        events: [{ event_type: 'page_view', page: '/home' }],
      });
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/api/event_logging/batch');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({
        events: [{ event_type: 'page_view', page: '/home' }],
      });
      expect(result.status).toBe('ok');
    });
  });

  describe('inProductNudges', () => {
    it('GETs /in_product_nudges', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ is_claude_code_enabled: true }),
      );
      const result = await client.misc.inProductNudges();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/in_product_nudges',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.is_claude_code_enabled).toBe(true);
    });
  });

  describe('activeCallbacks', () => {
    it('GETs /active/callbacks', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ alerting: 'None', 'litellm.callbacks': ['cb1'] }),
      );
      const result = await client.misc.activeCallbacks();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/active/callbacks',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result['litellm.callbacks']).toEqual(['cb1']);
    });
  });

  describe('callback', () => {
    it('GETs /callback', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.misc.callback();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/callback',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('debugAsyncioTasks', () => {
    it('GETs /debug/asyncio-tasks', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ total_active_tasks: 3, by_name: { foo: 1, bar: 2 } }),
      );
      const result = await client.misc.debugAsyncioTasks();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/debug/asyncio-tasks',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.total_active_tasks).toBe(3);
      expect(result.by_name).toEqual({ foo: 1, bar: 2 });
    });
  });

  describe('usageAiChat', () => {
    it('POSTs to /usage/ai/chat and returns a Stream', async () => {
      mockFetch.mockResolvedValueOnce(
        sseResponse([
          'data: {"type":"status","message":"Thinking..."}\n\n',
          'data: {"type":"chunk","content":"hi"}\n\n',
          'data: {"type":"done"}\n\n',
        ]),
      );
      const stream = await client.misc.usageAiChat({
        messages: [{ role: 'user', content: 'hi' }],
      });
      expect(stream).toBeInstanceOf(Stream);

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/usage/ai/chat');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({
        messages: [{ role: 'user', content: 'hi' }],
      });

      const collected: unknown[] = [];
      for await (const chunk of stream) collected.push(chunk);
      expect(collected).toEqual([
        { type: 'status', message: 'Thinking...' },
        { type: 'chunk', content: 'hi' },
        { type: 'done' },
      ]);
    });
  });

  describe('publicLitellmModelCostMap', () => {
    it('GETs /public/litellm_model_cost_map', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ sample_spec: {} }));
      const result = await client.misc.publicLitellmModelCostMap();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/public/litellm_model_cost_map',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual({ sample_spec: {} });
    });
  });

  describe('regenerateKey', () => {
    it('puts the key into the query string and the rest into the body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          key: 'sk-new',
          token: 't',
          key_name: 'k',
          expires: null,
          user_id: null,
          team_id: null,
          max_budget: null,
          models: [],
          metadata: {},
        }),
      );
      const result = await client.misc.regenerateKey({
        key: 'sk-old/1',
        max_budget: 50,
        duration: '7d',
      });
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/key/regenerate?key=sk-old%2F1');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({
        max_budget: 50,
        duration: '7d',
      });
      expect(result.key).toBe('sk-new');
    });
  });

  describe('register', () => {
    it('POSTs JSON body to /register', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ client_id: 'c1', client_secret: 'secret', redirect_uris: [] }),
      );
      const result = await client.misc.register({ client_name: 'app' });
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/register');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({ client_name: 'app' });
      expect(result.client_id).toBe('c1');
    });

    it('defaults the body to {} when no params are passed', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ client_id: 'c2' }));
      await client.misc.register();
      const init = mockFetch.mock.calls[0][1];
      expect(JSON.parse(init.body as string)).toEqual({});
    });
  });

  describe('rerankV2', () => {
    it('POSTs to /v2/rerank with the rerank body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          id: 'r1',
          results: [
            { index: 0, relevance_score: 0.9 },
            { index: 1, relevance_score: 0.5 },
          ],
        }),
      );
      const result = await client.misc.rerankV2({
        model: 'rerank-english-v3.0',
        query: 'capital of france',
        documents: ['Paris', 'London'],
        top_n: 2,
      });
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/v2/rerank');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toEqual({
        model: 'rerank-english-v3.0',
        query: 'capital of france',
        documents: ['Paris', 'London'],
        top_n: 2,
      });
      expect(result.results).toHaveLength(2);
      expect(result.results[0].relevance_score).toBe(0.9);
    });
  });
});
