/**
 * @group unit
 */
import {
  PassThroughResource,
  PassThroughProvider,
  BedrockPassThroughResource,
  CursorPassThroughResource,
  VertexPassThroughResource,
  CoherePassThroughResource,
  MistralPassThroughResource,
  VllmPassThroughResource,
  MilvusPassThroughResource,
  AzurePassThroughResource,
  LangfusePassThroughResource,
  AssemblyAiPassThroughResource,
} from '../../../src/resources/pass_through';
import type { RequestFn, StreamRequestFn } from '../../../src/client';
import { DEFAULT_AZURE_API_VERSION } from '../../../src/types/azure';

describe('PassThroughResource', () => {
  let request: jest.Mock;
  let streamRequest: jest.Mock;
  let passThrough: PassThroughResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({ ok: true });
    streamRequest = jest.fn().mockResolvedValue({ stream: true });
    passThrough = new PassThroughResource(
      request as unknown as RequestFn,
      streamRequest as unknown as StreamRequestFn,
    );
  });

  describe('path composition', () => {
    it('composes the prefix and user path', async () => {
      await passThrough.anthropic.post('v1/foo', { hello: 'world' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/anthropic/v1/foo',
          body: { kind: 'json', value: { hello: 'world' } },
        }),
      );
    });

    it('strips a leading slash from the user-supplied path', async () => {
      await passThrough.anthropic.post('/v1/foo', { hello: 'world' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/anthropic/v1/foo' }),
      );
    });

    it('strips multiple leading slashes from the user path', async () => {
      await passThrough.gemini.get('////v1beta/things');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/gemini/v1beta/things' }),
      );
    });
  });

  describe('provider prefixes', () => {
    const cases: Array<[keyof PassThroughResource, string]> = [
      ['anthropic', '/anthropic'],
      ['gemini', '/gemini'],
      ['vertex', '/vertex_ai'],
      ['cohere', '/cohere'],
      ['mistral', '/mistral'],
      ['vllm', '/vllm'],
      ['milvus', '/milvus'],
      ['bedrock', '/bedrock'],
      ['assemblyAi', '/assemblyai'],
      ['assemblyAiEu', '/eu.assemblyai'],
      ['azure', '/azure'],
      ['openai', '/openai'],
      ['openaiPassthrough', '/openai_passthrough'],
      ['cursor', '/cursor'],
      ['langfuse', '/langfuse'],
    ];

    it.each(cases)('routes %s to %s/...', async (name, prefix) => {
      const provider = passThrough[name] as PassThroughProvider;
      await provider.get('thing');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: `${prefix}/thing` }),
      );
    });
  });

  describe('HTTP methods', () => {
    it('GET passes through path and options', async () => {
      await passThrough.cohere.get('models', { headers: { 'x-h': '1' } });
      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/cohere/models',
        options: { headers: { 'x-h': '1' } },
      });
    });

    it('POST sends body as json kind', async () => {
      await passThrough.bedrock.post('invoke', { foo: 1 });
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('POST');
      expect(call.body).toEqual({ kind: 'json', value: { foo: 1 } });
    });

    it('POST without body sends body kind=none', async () => {
      await passThrough.openai.post('ping');
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('POST');
      expect(call.body).toEqual({ kind: 'none' });
    });

    it('PUT sends body as json kind', async () => {
      await passThrough.azure.put('object/1', { name: 'a' });
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('PUT');
      expect(call.path).toBe('/azure/object/1');
      expect(call.body).toEqual({ kind: 'json', value: { name: 'a' } });
    });

    it('PATCH sends body as json kind', async () => {
      await passThrough.langfuse.patch('object/1', { name: 'b' });
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('PATCH');
      expect(call.path).toBe('/langfuse/object/1');
      expect(call.body).toEqual({ kind: 'json', value: { name: 'b' } });
    });

    it('PATCH without body sends body kind=none', async () => {
      await passThrough.langfuse.patch('object/1');
      const call = request.mock.calls[0][0];
      expect(call.body).toEqual({ kind: 'none' });
    });

    it('PUT without body sends body kind=none', async () => {
      await passThrough.azure.put('object/1');
      const call = request.mock.calls[0][0];
      expect(call.body).toEqual({ kind: 'none' });
    });

    it('DELETE has no body', async () => {
      await passThrough.cursor.delete('object/1');
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('DELETE');
      expect(call.path).toBe('/cursor/object/1');
      expect(call.body).toBeUndefined();
    });

    it('returns the request result with proper typing', async () => {
      request.mockResolvedValueOnce({ items: [1, 2, 3] });
      const result = await passThrough.vllm.get<{ items: number[] }>('list');
      expect(result.items).toEqual([1, 2, 3]);
    });
  });

  describe('PassThroughProvider directly', () => {
    it('normalizes a prefix without leading slash', async () => {
      const provider = new PassThroughProvider(request as unknown as RequestFn, 'custom');
      await provider.get('foo');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/custom/foo' }),
      );
    });

    it('normalizes a prefix with trailing slash', async () => {
      const provider = new PassThroughProvider(request as unknown as RequestFn, '/custom/');
      await provider.get('foo');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/custom/foo' }),
      );
    });

    it('handles a null/undefined user path by treating it as empty', async () => {
      const provider = new PassThroughProvider(request as unknown as RequestFn, '/custom');
      await provider.get(null as unknown as string);
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/custom/' }),
      );
    });
  });

  describe('Bedrock typed methods', () => {
    it('exposes BedrockPassThroughResource on .bedrock', () => {
      expect(passThrough.bedrock).toBeInstanceOf(BedrockPassThroughResource);
    });

    it('still supports the generic POST escape hatch', async () => {
      await passThrough.bedrock.post('custom/path', { foo: 1 });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/bedrock/custom/path',
          body: { kind: 'json', value: { foo: 1 } },
        }),
      );
    });

    it('converse() POSTs to /bedrock/model/{id}/converse with the typed body', async () => {
      await passThrough.bedrock.converse('anthropic.claude-3-sonnet', {
        messages: [{ role: 'user', content: [{ text: 'hi' }] }],
        inferenceConfig: { maxTokens: 100 },
      });
      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/bedrock/model/anthropic.claude-3-sonnet/converse',
        body: {
          kind: 'json',
          value: {
            messages: [{ role: 'user', content: [{ text: 'hi' }] }],
            inferenceConfig: { maxTokens: 100 },
          },
        },
        options: undefined,
      });
    });

    it('converse() URL-encodes the modelId', async () => {
      await passThrough.bedrock.converse('arn:aws:bedrock:us-east-1::foundation-model/x', {
        messages: [],
      });
      const call = request.mock.calls[0][0];
      expect(call.path).toBe(
        '/bedrock/model/arn%3Aaws%3Abedrock%3Aus-east-1%3A%3Afoundation-model%2Fx/converse',
      );
    });

    it('converseStream() routes through streamRequest', async () => {
      await passThrough.bedrock.converseStream('m1', { messages: [] });
      expect(streamRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/bedrock/model/m1/converse-stream',
          body: { kind: 'json', value: { messages: [] } },
        }),
      );
      expect(request).not.toHaveBeenCalled();
    });

    it('invoke() POSTs the body and forwards a contentType override', async () => {
      await passThrough.bedrock.invoke('m1', { prompt: 'hi' }, 'application/x-amzn-bedrock-json');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/bedrock/model/m1/invoke',
          body: { kind: 'json', value: { prompt: 'hi' } },
          options: { headers: { 'content-type': 'application/x-amzn-bedrock-json' } },
        }),
      );
    });

    it('invoke() leaves headers untouched when contentType is omitted', async () => {
      await passThrough.bedrock.invoke('m1', { prompt: 'hi' });
      const call = request.mock.calls[0][0];
      expect(call.options).toBeUndefined();
    });

    it('invokeWithResponseStream() routes through streamRequest', async () => {
      await passThrough.bedrock.invokeWithResponseStream('m1', { prompt: 'hi' });
      expect(streamRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/bedrock/model/m1/invoke-with-response-stream',
          body: { kind: 'json', value: { prompt: 'hi' } },
        }),
      );
    });

    it('guardrails.apply() builds the correct path', async () => {
      await passThrough.bedrock.guardrails.apply('gid', 'DRAFT', {
        source: 'INPUT',
        content: [{ text: { text: 'hello' } }],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/bedrock/guardrail/gid/version/DRAFT/apply',
          body: {
            kind: 'json',
            value: { source: 'INPUT', content: [{ text: { text: 'hello' } }] },
          },
        }),
      );
    });

    it('knowledgeBases.retrieve() builds the correct path', async () => {
      await passThrough.bedrock.knowledgeBases.retrieve('kb1', {
        retrievalQuery: { text: 'q' },
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/bedrock/knowledgebases/kb1/retrieve',
          body: { kind: 'json', value: { retrievalQuery: { text: 'q' } } },
        }),
      );
    });

    it('knowledgeBases.retrieveAndGenerate() targets the static endpoint', async () => {
      await passThrough.bedrock.knowledgeBases.retrieveAndGenerate({
        input: { text: 'q' },
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/bedrock/knowledgebases/retrieveAndGenerate',
          body: { kind: 'json', value: { input: { text: 'q' } } },
        }),
      );
    });

    it('agents.invoke() routes through streamRequest with the full path', async () => {
      await passThrough.bedrock.agents.invoke('a1', 'alias1', 'sess1', {
        inputText: 'hi',
        enableTrace: true,
      });
      expect(streamRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/bedrock/agent/a1/agentAlias/alias1/session/sess1/text',
          body: {
            kind: 'json',
            value: { inputText: 'hi', enableTrace: true },
          },
        }),
      );
      expect(request).not.toHaveBeenCalled();
    });
  });

  describe('Cursor typed methods', () => {
    it('exposes CursorPassThroughResource on .cursor', () => {
      expect(passThrough.cursor).toBeInstanceOf(CursorPassThroughResource);
    });

    it('me() GETs /cursor/me', async () => {
      await passThrough.cursor.me();
      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/cursor/me',
        options: undefined,
      });
    });

    it('models() GETs /cursor/models', async () => {
      await passThrough.cursor.models();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: '/cursor/models' }),
      );
    });

    it('repositories() GETs /cursor/repositories', async () => {
      await passThrough.cursor.repositories();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: '/cursor/repositories' }),
      );
    });

    it('agents.list() forwards cursor + limit as query params', async () => {
      await passThrough.cursor.agents.list({ cursor: 'c1', limit: 10 });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/cursor/agents',
          options: { query: { cursor: 'c1', limit: 10 } },
        }),
      );
    });

    it('agents.list() omits undefined query params', async () => {
      await passThrough.cursor.agents.list();
      const call = request.mock.calls[0][0];
      expect(call.options.query).toEqual({});
    });

    it('agents.launch() POSTs the launch params', async () => {
      await passThrough.cursor.agents.launch({
        prompt: { text: 'fix bug' },
        source: { repository: 'org/repo', ref: 'main' },
        target: { autoCreatePr: true },
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/cursor/agents',
          body: {
            kind: 'json',
            value: {
              prompt: { text: 'fix bug' },
              source: { repository: 'org/repo', ref: 'main' },
              target: { autoCreatePr: true },
            },
          },
        }),
      );
    });

    it('agents.get() URL-encodes the agentId', async () => {
      await passThrough.cursor.agents.get('agent/with slash');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/cursor/agents/agent%2Fwith%20slash',
        }),
      );
    });

    it('agents.delete() issues a DELETE', async () => {
      await passThrough.cursor.agents.delete('a1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'DELETE', path: '/cursor/agents/a1' }),
      );
    });

    it('agents.conversation() GETs the conversation endpoint', async () => {
      await passThrough.cursor.agents.conversation('a1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/cursor/agents/a1/conversation',
        }),
      );
    });

    it('agents.followup() POSTs the followup params', async () => {
      await passThrough.cursor.agents.followup('a1', { prompt: { text: 'and now this' } });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/cursor/agents/a1/followup',
          body: { kind: 'json', value: { prompt: { text: 'and now this' } } },
        }),
      );
    });

    it('agents.stop() POSTs to /stop with a no-body request', async () => {
      await passThrough.cursor.agents.stop('a1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/cursor/agents/a1/stop',
          body: { kind: 'none' },
        }),
      );
    });
  });

  describe('Vertex typed methods', () => {
    it('exposes VertexPassThroughResource on .vertex', () => {
      expect(passThrough.vertex).toBeInstanceOf(VertexPassThroughResource);
    });

    it('generateContent() appends :generateContent to the model path', async () => {
      await passThrough.vertex.generateContent(
        'v1/projects/p/locations/us-central1/publishers/google/models/gemini-1.5-pro',
        { contents: [{ role: 'user', parts: [{ text: 'hi' }] }] },
      );
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/vertex_ai/v1/projects/p/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent',
          body: {
            kind: 'json',
            value: { contents: [{ role: 'user', parts: [{ text: 'hi' }] }] },
          },
        }),
      );
    });

    it('streamGenerateContent() routes through streamRequest', async () => {
      await passThrough.vertex.streamGenerateContent('v1/m', {
        contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
      });
      expect(streamRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/vertex_ai/v1/m:streamGenerateContent',
        }),
      );
      expect(request).not.toHaveBeenCalled();
    });

    it('embedContent() appends :embedContent', async () => {
      await passThrough.vertex.embedContent('v1/m', {
        content: { role: 'user', parts: [{ text: 'hi' }] },
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/vertex_ai/v1/m:embedContent',
        }),
      );
    });

    it('predict() appends :predict', async () => {
      await passThrough.vertex.predict('v1/projects/p/locations/us/endpoints/e1', {
        instances: [{ q: 'a' }],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/vertex_ai/v1/projects/p/locations/us/endpoints/e1:predict',
        }),
      );
    });

    it('batchPredictionJobs.create() POSTs to the parent path', async () => {
      await passThrough.vertex.batchPredictionJobs.create(
        'v1/projects/p/locations/us/batchPredictionJobs',
        {
          displayName: 'job1',
          model: 'publishers/google/models/gemini-1.5-pro',
          inputConfig: {},
          outputConfig: {},
        },
      );
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/vertex_ai/v1/projects/p/locations/us/batchPredictionJobs',
        }),
      );
    });

    it('batchPredictionJobs.cancel() appends :cancel', async () => {
      await passThrough.vertex.batchPredictionJobs.cancel(
        'v1/projects/p/locations/us/batchPredictionJobs/123',
      );
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/vertex_ai/v1/projects/p/locations/us/batchPredictionJobs/123:cancel',
          body: { kind: 'none' },
        }),
      );
    });
  });

  describe('Cohere typed methods', () => {
    it('exposes CoherePassThroughResource on .cohere', () => {
      expect(passThrough.cohere).toBeInstanceOf(CoherePassThroughResource);
    });

    it('chat() POSTs to /cohere/v1/chat', async () => {
      await passThrough.cohere.chat({ message: 'hi', model: 'command-r' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/cohere/v1/chat',
          body: { kind: 'json', value: { message: 'hi', model: 'command-r' } },
        }),
      );
    });

    it('chatV2() POSTs to /cohere/v2/chat', async () => {
      await passThrough.cohere.chatV2({
        model: 'command-r',
        messages: [{ role: 'user', content: 'hi' }],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', path: '/cohere/v2/chat' }),
      );
    });

    it('embed() POSTs to /cohere/v1/embed', async () => {
      await passThrough.cohere.embed({
        model: 'embed-english-v3.0',
        input_type: 'search_document',
        texts: ['hello'],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', path: '/cohere/v1/embed' }),
      );
    });

    it('rerank() POSTs to /cohere/v1/rerank', async () => {
      await passThrough.cohere.rerank({
        model: 'rerank-english-v3.0',
        query: 'q',
        documents: ['a', 'b'],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', path: '/cohere/v1/rerank' }),
      );
    });

    it('classify() POSTs to /cohere/v1/classify', async () => {
      await passThrough.cohere.classify({ inputs: ['a', 'b'] });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', path: '/cohere/v1/classify' }),
      );
    });

    it('generate() POSTs to /cohere/v1/generate', async () => {
      await passThrough.cohere.generate({ prompt: 'hi' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', path: '/cohere/v1/generate' }),
      );
    });

    it('tokenize() POSTs to /cohere/v1/tokenize', async () => {
      await passThrough.cohere.tokenize({ text: 'hello' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', path: '/cohere/v1/tokenize' }),
      );
    });

    it('detokenize() POSTs to /cohere/v1/detokenize', async () => {
      await passThrough.cohere.detokenize({ tokens: [1, 2, 3] });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', path: '/cohere/v1/detokenize' }),
      );
    });
  });

  describe('Mistral typed methods', () => {
    it('exposes MistralPassThroughResource on .mistral', () => {
      expect(passThrough.mistral).toBeInstanceOf(MistralPassThroughResource);
    });

    it('chat.completions.create() POSTs to /mistral/v1/chat/completions', async () => {
      await passThrough.mistral.chat.completions.create({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: 'hi' }],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/mistral/v1/chat/completions',
        }),
      );
    });

    it('embeddings.create() POSTs to /mistral/v1/embeddings', async () => {
      await passThrough.mistral.embeddings.create({
        model: 'mistral-embed',
        input: 'hi',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', path: '/mistral/v1/embeddings' }),
      );
    });

    it('fim.completions.create() POSTs to /mistral/v1/fim/completions', async () => {
      await passThrough.mistral.fim.completions.create({
        model: 'codestral-latest',
        prompt: 'def hello',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/mistral/v1/fim/completions',
        }),
      );
    });

    it('agents.completions.create() POSTs to /mistral/v1/agents/completions', async () => {
      await passThrough.mistral.agents.completions.create({
        agent_id: 'agent_1',
        messages: [{ role: 'user', content: 'hi' }],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/mistral/v1/agents/completions',
        }),
      );
    });

    it('models.list() GETs /mistral/v1/models', async () => {
      await passThrough.mistral.models.list();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: '/mistral/v1/models' }),
      );
    });
  });

  describe('vLLM typed methods', () => {
    it('exposes VllmPassThroughResource on .vllm', () => {
      expect(passThrough.vllm).toBeInstanceOf(VllmPassThroughResource);
    });

    it('chat.completions.create() POSTs to /vllm/v1/chat/completions', async () => {
      await passThrough.vllm.chat.completions.create({
        model: 'meta-llama/Llama-3-8B',
        messages: [{ role: 'user', content: 'hi' }],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/vllm/v1/chat/completions',
        }),
      );
    });

    it('completions.create() POSTs to /vllm/v1/completions', async () => {
      await passThrough.vllm.completions.create({
        model: 'meta-llama/Llama-3-8B',
        prompt: 'hi',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/vllm/v1/completions',
        }),
      );
    });

    it('embeddings.create() POSTs to /vllm/v1/embeddings', async () => {
      await passThrough.vllm.embeddings.create({
        model: 'BAAI/bge-base-en-v1.5',
        input: 'hi',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/vllm/v1/embeddings',
        }),
      );
    });

    it('models.list() GETs /vllm/v1/models', async () => {
      await passThrough.vllm.models.list();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: '/vllm/v1/models' }),
      );
    });
  });

  describe('Milvus typed methods', () => {
    it('exposes MilvusPassThroughResource on .milvus', () => {
      expect(passThrough.milvus).toBeInstanceOf(MilvusPassThroughResource);
    });

    it('collections.list() POSTs to /milvus/v2/vectordb/collections/list', async () => {
      await passThrough.milvus.collections.list();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/milvus/v2/vectordb/collections/list',
          body: { kind: 'json', value: {} },
        }),
      );
    });

    it('collections.create() POSTs the create payload', async () => {
      await passThrough.milvus.collections.create({
        collectionName: 'c1',
        dimension: 1536,
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/milvus/v2/vectordb/collections/create',
          body: {
            kind: 'json',
            value: { collectionName: 'c1', dimension: 1536 },
          },
        }),
      );
    });

    it('collections.drop() POSTs to /collections/drop', async () => {
      await passThrough.milvus.collections.drop({ collectionName: 'c1' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/milvus/v2/vectordb/collections/drop',
        }),
      );
    });

    it('collections.describe() POSTs to /collections/describe', async () => {
      await passThrough.milvus.collections.describe({ collectionName: 'c1' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/milvus/v2/vectordb/collections/describe',
        }),
      );
    });

    it('entities.search() POSTs to /entities/search', async () => {
      await passThrough.milvus.entities.search({
        collectionName: 'c1',
        data: [[0.1, 0.2]],
        limit: 5,
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/milvus/v2/vectordb/entities/search',
        }),
      );
    });

    it('entities.insert() POSTs to /entities/insert', async () => {
      await passThrough.milvus.entities.insert({
        collectionName: 'c1',
        data: [{ id: 1 }],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/milvus/v2/vectordb/entities/insert',
        }),
      );
    });

    it('entities.upsert() POSTs to /entities/upsert', async () => {
      await passThrough.milvus.entities.upsert({
        collectionName: 'c1',
        data: [{ id: 1 }],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/milvus/v2/vectordb/entities/upsert' }),
      );
    });

    it('entities.delete() POSTs to /entities/delete', async () => {
      await passThrough.milvus.entities.delete({
        collectionName: 'c1',
        filter: 'id == 1',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/milvus/v2/vectordb/entities/delete' }),
      );
    });

    it('entities.query() POSTs to /entities/query', async () => {
      await passThrough.milvus.entities.query({ collectionName: 'c1' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/milvus/v2/vectordb/entities/query' }),
      );
    });

    it('partitions.list() POSTs to /partitions/list', async () => {
      await passThrough.milvus.partitions.list({ collectionName: 'c1' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/milvus/v2/vectordb/partitions/list' }),
      );
    });

    it('partitions.create() POSTs to /partitions/create', async () => {
      await passThrough.milvus.partitions.create({
        collectionName: 'c1',
        partitionName: 'p1',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/milvus/v2/vectordb/partitions/create' }),
      );
    });

    it('partitions.has() POSTs to /partitions/has', async () => {
      await passThrough.milvus.partitions.has({
        collectionName: 'c1',
        partitionName: 'p1',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/milvus/v2/vectordb/partitions/has' }),
      );
    });

    it('indexes.create() POSTs to /indexes/create', async () => {
      await passThrough.milvus.indexes.create({
        collectionName: 'c1',
        indexParams: [{ fieldName: 'vec', metricType: 'L2' }],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/milvus/v2/vectordb/indexes/create' }),
      );
    });

    it('indexes.list() POSTs to /indexes/list', async () => {
      await passThrough.milvus.indexes.list({ collectionName: 'c1' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/milvus/v2/vectordb/indexes/list' }),
      );
    });
  });

  describe('Azure typed methods', () => {
    it('exposes AzurePassThroughResource on .azure', () => {
      expect(passThrough.azure).toBeInstanceOf(AzurePassThroughResource);
    });

    it('chatCompletions() builds deployment path with api-version query', async () => {
      await passThrough.azure.chatCompletions(
        'gpt-4o',
        { model: 'gpt-4o', messages: [{ role: 'user', content: 'hi' }] },
        '2024-12-01-preview',
      );
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/azure/openai/deployments/gpt-4o/chat/completions',
          options: expect.objectContaining({
            query: { 'api-version': '2024-12-01-preview' },
          }),
        }),
      );
    });

    it('chatCompletions() defaults the api-version when not supplied', async () => {
      await passThrough.azure.chatCompletions('gpt-4o', {
        model: 'gpt-4o',
        messages: [],
      });
      const call = request.mock.calls[0][0];
      expect(call.options.query['api-version']).toBe(DEFAULT_AZURE_API_VERSION);
    });

    it('completions() targets the completions deployment endpoint', async () => {
      await passThrough.azure.completions('text-davinci-003', {
        model: 'text-davinci-003',
        prompt: 'hi',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/azure/openai/deployments/text-davinci-003/completions',
        }),
      );
    });

    it('embeddings() targets the embeddings deployment endpoint', async () => {
      await passThrough.azure.embeddings('text-embedding-ada-002', {
        model: 'text-embedding-ada-002',
        input: 'hi',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/azure/openai/deployments/text-embedding-ada-002/embeddings',
        }),
      );
    });

    it('images.generations() targets the images deployment endpoint', async () => {
      await passThrough.azure.images.generations('dall-e-3', {
        prompt: 'a cat',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/azure/openai/deployments/dall-e-3/images/generations',
        }),
      );
    });

    it('audio.transcriptions() builds a multipart form request', async () => {
      const file = new Uint8Array([1, 2, 3, 4]).buffer;
      await passThrough.azure.audio.transcriptions(
        'whisper-1',
        { model: 'whisper-1', file, filename: 'a.wav' },
        '2024-10-21',
      );
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('POST');
      expect(call.path).toBe('/azure/openai/deployments/whisper-1/audio/transcriptions');
      expect(call.body.kind).toBe('form');
      expect(call.options.query['api-version']).toBe('2024-10-21');
    });
  });

  describe('Langfuse typed methods', () => {
    it('exposes LangfusePassThroughResource on .langfuse', () => {
      expect(passThrough.langfuse).toBeInstanceOf(LangfusePassThroughResource);
    });

    it('traces.list() forwards filter params as query', async () => {
      await passThrough.langfuse.traces.list({ userId: 'u1', limit: 50 });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/langfuse/api/public/traces',
          options: expect.objectContaining({
            query: expect.objectContaining({ userId: 'u1', limit: 50 }),
          }),
        }),
      );
    });

    it('traces.get() URL-encodes the traceId', async () => {
      await passThrough.langfuse.traces.get('trace 1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/langfuse/api/public/traces/trace%201',
        }),
      );
    });

    it('traces.delete() issues a DELETE', async () => {
      await passThrough.langfuse.traces.delete('t1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: '/langfuse/api/public/traces/t1',
        }),
      );
    });

    it('observations.list() supports query filters', async () => {
      await passThrough.langfuse.observations.list({ traceId: 't1' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/langfuse/api/public/observations',
          options: expect.objectContaining({ query: expect.objectContaining({ traceId: 't1' }) }),
        }),
      );
    });

    it('observations.get() builds the path', async () => {
      await passThrough.langfuse.observations.get('o1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/langfuse/api/public/observations/o1',
        }),
      );
    });

    it('spans.create() POSTs to /spans', async () => {
      await passThrough.langfuse.spans.create({ name: 'span1', traceId: 't1' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/langfuse/api/public/spans',
        }),
      );
    });

    it('spans.update() PATCHes /spans', async () => {
      await passThrough.langfuse.spans.update({ id: 's1', output: 'done' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          path: '/langfuse/api/public/spans',
        }),
      );
    });

    it('scores.list() supports query filters', async () => {
      await passThrough.langfuse.scores.list({ name: 'helpful' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/langfuse/api/public/scores',
        }),
      );
    });

    it('scores.create() POSTs to /scores', async () => {
      await passThrough.langfuse.scores.create({ name: 'helpful', value: 1 });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/langfuse/api/public/scores',
        }),
      );
    });

    it('scores.delete() issues a DELETE', async () => {
      await passThrough.langfuse.scores.delete('s1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: '/langfuse/api/public/scores/s1',
        }),
      );
    });

    it('datasets.list/get/create build the right path', async () => {
      await passThrough.langfuse.datasets.list();
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({ method: 'GET', path: '/langfuse/api/public/datasets' }),
      );
      await passThrough.langfuse.datasets.get('ds1');
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({ method: 'GET', path: '/langfuse/api/public/datasets/ds1' }),
      );
      await passThrough.langfuse.datasets.create({ name: 'ds2' });
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({ method: 'POST', path: '/langfuse/api/public/datasets' }),
      );
    });

    it('prompts.list/get/create build the right path', async () => {
      await passThrough.langfuse.prompts.list();
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/langfuse/api/public/v2/prompts',
        }),
      );
      await passThrough.langfuse.prompts.get('p1');
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/langfuse/api/public/v2/prompts/p1',
        }),
      );
      await passThrough.langfuse.prompts.create({ name: 'p2', prompt: 'hi' });
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/langfuse/api/public/v2/prompts',
        }),
      );
    });
  });

  describe('AssemblyAI typed methods', () => {
    it('exposes AssemblyAiPassThroughResource on .assemblyAi and .assemblyAiEu', () => {
      expect(passThrough.assemblyAi).toBeInstanceOf(AssemblyAiPassThroughResource);
      expect(passThrough.assemblyAiEu).toBeInstanceOf(AssemblyAiPassThroughResource);
    });

    it('transcript.create() POSTs to /transcript', async () => {
      await passThrough.assemblyAi.transcript.create({ audio_url: 'https://x/audio.mp3' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/assemblyai/transcript',
        }),
      );
    });

    it('transcript.list() supports query filters', async () => {
      await passThrough.assemblyAi.transcript.list({ limit: 10, status: 'completed' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/assemblyai/transcript',
          options: expect.objectContaining({
            query: expect.objectContaining({ limit: 10, status: 'completed' }),
          }),
        }),
      );
    });

    it('transcript.get() URL-encodes the transcriptId', async () => {
      await passThrough.assemblyAi.transcript.get('t/1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/assemblyai/transcript/t%2F1',
        }),
      );
    });

    it('transcript.delete() issues a DELETE', async () => {
      await passThrough.assemblyAi.transcript.delete('t1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: '/assemblyai/transcript/t1',
        }),
      );
    });

    it('transcript.subtitles() builds the format-specific path', async () => {
      await passThrough.assemblyAi.transcript.subtitles('t1', 'srt');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/assemblyai/transcript/t1/srt',
        }),
      );
    });

    it('transcript.sentences()/paragraphs()/redactedAudio()', async () => {
      await passThrough.assemblyAi.transcript.sentences('t1');
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: '/assemblyai/transcript/t1/sentences' }),
      );
      await passThrough.assemblyAi.transcript.paragraphs('t1');
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: '/assemblyai/transcript/t1/paragraphs' }),
      );
      await passThrough.assemblyAi.transcript.redactedAudio('t1');
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: '/assemblyai/transcript/t1/redacted-audio' }),
      );
    });

    it('lemur.task/summary/questionAnswer build the right paths', async () => {
      await passThrough.assemblyAi.lemur.task({ prompt: 'summarize', transcript_ids: ['t1'] });
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/assemblyai/lemur/v3/generate/task',
        }),
      );
      await passThrough.assemblyAi.lemur.summary({ transcript_ids: ['t1'] });
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: '/assemblyai/lemur/v3/generate/summary' }),
      );
      await passThrough.assemblyAi.lemur.questionAnswer({
        transcript_ids: ['t1'],
        questions: [{ question: 'why?' }],
      });
      expect(request).toHaveBeenLastCalledWith(
        expect.objectContaining({ path: '/assemblyai/lemur/v3/generate/question-answer' }),
      );
    });

    it('realtime.token() POSTs to /realtime/token', async () => {
      await passThrough.assemblyAi.realtime.token({ expires_in: 600 });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/assemblyai/realtime/token',
        }),
      );
    });

    it('upload() sends the binary body', async () => {
      const file = new Uint8Array([1, 2, 3, 4]).buffer;
      await passThrough.assemblyAi.upload(file, { contentType: 'audio/mpeg' });
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('POST');
      expect(call.path).toBe('/assemblyai/upload');
      expect(call.body.kind).toBe('binary');
      expect(call.body.contentType).toBe('audio/mpeg');
    });

    it('assemblyAiEu uses the eu prefix', async () => {
      await passThrough.assemblyAiEu.transcript.create({ audio_url: 'x' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/eu.assemblyai/transcript' }),
      );
    });
  });

  describe('Vertex batchPredictionJobs additional methods', () => {
    it('batchPredictionJobs.get() GETs the job resource path', async () => {
      await passThrough.vertex.batchPredictionJobs.get(
        '/v1/projects/p/locations/us/batchPredictionJobs/123',
      );
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/vertex_ai/v1/projects/p/locations/us/batchPredictionJobs/123',
        }),
      );
    });

    it('batchPredictionJobs.list() GETs the parent collection', async () => {
      await passThrough.vertex.batchPredictionJobs.list(
        'v1/projects/p/locations/us/batchPredictionJobs',
      );
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/vertex_ai/v1/projects/p/locations/us/batchPredictionJobs',
        }),
      );
    });
  });

  describe('Milvus partitions/indexes additional methods', () => {
    it('partitions.drop() POSTs to /partitions/drop', async () => {
      await passThrough.milvus.partitions.drop({
        collectionName: 'c1',
        partitionName: 'p1',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/milvus/v2/vectordb/partitions/drop',
        }),
      );
    });

    it('partitions.load() POSTs to /partitions/load', async () => {
      await passThrough.milvus.partitions.load({
        collectionName: 'c1',
        partitionNames: ['p1', 'p2'],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/milvus/v2/vectordb/partitions/load',
        }),
      );
    });

    it('partitions.release() POSTs to /partitions/release', async () => {
      await passThrough.milvus.partitions.release({
        collectionName: 'c1',
        partitionNames: ['p1'],
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/milvus/v2/vectordb/partitions/release',
        }),
      );
    });

    it('indexes.drop() POSTs to /indexes/drop', async () => {
      await passThrough.milvus.indexes.drop({
        collectionName: 'c1',
        indexName: 'idx1',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/milvus/v2/vectordb/indexes/drop',
        }),
      );
    });

    it('indexes.describe() POSTs to /indexes/describe', async () => {
      await passThrough.milvus.indexes.describe({
        collectionName: 'c1',
        indexName: 'idx1',
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/milvus/v2/vectordb/indexes/describe',
        }),
      );
    });
  });

  describe('Azure audio.transcriptions extended params', () => {
    it('audio.transcriptions() forwards optional language/prompt/response_format/temperature/granularities', async () => {
      const file = new Uint8Array([1, 2, 3]).buffer;
      await passThrough.azure.audio.transcriptions('whisper-1', {
        model: 'whisper-1',
        file,
        filename: 'a.wav',
        language: 'en',
        prompt: 'test prompt',
        response_format: 'verbose_json',
        temperature: 0.2,
        'timestamp_granularities[]': ['word', 'segment'],
      });
      const call = request.mock.calls[0][0];
      expect(call.path).toBe('/azure/openai/deployments/whisper-1/audio/transcriptions');
      const form = call.body.value as FormData;
      expect(form.get('language')).toBe('en');
      expect(form.get('prompt')).toBe('test prompt');
      expect(form.get('response_format')).toBe('verbose_json');
      expect(form.get('temperature')).toBe('0.2');
      expect(form.getAll('timestamp_granularities[]')).toEqual(['word', 'segment']);
    });

    it('audio.transcriptions() accepts a Blob and defaults the filename', async () => {
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/wav' });
      await passThrough.azure.audio.transcriptions('whisper-1', {
        model: 'whisper-1',
        file: blob,
      });
      const call = request.mock.calls[0][0];
      expect(call.path).toBe('/azure/openai/deployments/whisper-1/audio/transcriptions');
      const form = call.body.value as FormData;
      // Default filename is "audio" and the file should be a Blob
      const f = form.get('file');
      expect(f).toBeInstanceOf(Blob);
    });
  });

  describe('Langfuse list default-param branches', () => {
    it('traces.list() works with no params (default branch)', async () => {
      await passThrough.langfuse.traces.list();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/langfuse/api/public/traces',
        }),
      );
    });

    it('observations.list() works with no params (default branch)', async () => {
      await passThrough.langfuse.observations.list();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/langfuse/api/public/observations',
        }),
      );
    });

    it('scores.list() works with no params (default branch)', async () => {
      await passThrough.langfuse.scores.list();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/langfuse/api/public/scores',
        }),
      );
    });

    it('toQuery handles array values, non-primitive values, and skips undefined entries', async () => {
      // Array branch + String(v) branch + undefined-skip branch in toQuery
      const date = new Date('2026-04-29T00:00:00Z');
      await passThrough.langfuse.traces.list({
        tags: ['a', 'b', 'c'],
        fromTimestamp: date as unknown as string,
        userId: undefined,
      } as Record<string, unknown>);
      const call = request.mock.calls[0][0];
      expect(call.options.query.tags).toBe('a,b,c');
      expect(call.options.query.fromTimestamp).toBe(String(date));
      expect(call.options.query.userId).toBeUndefined();
    });
  });

  describe('AssemblyAI default-param branches', () => {
    it('transcript.list() works with no params (default branch)', async () => {
      await passThrough.assemblyAi.transcript.list();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/assemblyai/transcript',
        }),
      );
    });

    it('realtime.token() works with no params (default branch)', async () => {
      await passThrough.assemblyAi.realtime.token();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/assemblyai/realtime/token',
        }),
      );
    });

    it('upload() defaults contentType when no options supplied', async () => {
      const file = new Uint8Array([1, 2, 3]).buffer;
      await passThrough.assemblyAi.upload(file);
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('POST');
      expect(call.path).toBe('/assemblyai/upload');
      expect(call.body.kind).toBe('binary');
      expect(call.body.contentType).toBe('application/octet-stream');
    });
  });

  describe('Sub-resource constructors with default prefix', () => {
    // Each typed pass-through resource has a constructor with a default
    // `prefix` argument. PassThroughResource always passes the prefix
    // explicitly, so these tests instantiate the classes directly to cover
    // the default-parameter branches.
    let req: jest.Mock;
    let stream: jest.Mock;

    beforeEach(() => {
      req = jest.fn().mockResolvedValue({ ok: true });
      stream = jest.fn().mockResolvedValue({ ok: true });
    });

    it('VertexPassThroughResource defaults to /vertex_ai prefix', async () => {
      const v = new VertexPassThroughResource(
        req as unknown as RequestFn,
        stream as unknown as StreamRequestFn,
      );
      await v.get('thing');
      expect(req).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/vertex_ai/thing' }),
      );
    });

    it('CoherePassThroughResource defaults to /cohere prefix', async () => {
      const c = new CoherePassThroughResource(
        req as unknown as RequestFn,
        stream as unknown as StreamRequestFn,
      );
      await c.get('thing');
      expect(req).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/cohere/thing' }),
      );
    });

    it('MistralPassThroughResource defaults to /mistral prefix', async () => {
      const m = new MistralPassThroughResource(
        req as unknown as RequestFn,
        stream as unknown as StreamRequestFn,
      );
      await m.get('thing');
      expect(req).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/mistral/thing' }),
      );
    });

    it('VllmPassThroughResource defaults to /vllm prefix', async () => {
      const v = new VllmPassThroughResource(
        req as unknown as RequestFn,
        stream as unknown as StreamRequestFn,
      );
      await v.get('thing');
      expect(req).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/vllm/thing' }),
      );
    });

    it('MilvusPassThroughResource defaults to /milvus prefix', async () => {
      const m = new MilvusPassThroughResource(
        req as unknown as RequestFn,
        stream as unknown as StreamRequestFn,
      );
      await m.get('thing');
      expect(req).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/milvus/thing' }),
      );
    });

    it('BedrockPassThroughResource defaults to /bedrock prefix', async () => {
      const b = new BedrockPassThroughResource(
        req as unknown as RequestFn,
        stream as unknown as StreamRequestFn,
      );
      await b.get('thing');
      expect(req).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/bedrock/thing' }),
      );
    });

    it('CursorPassThroughResource defaults to /cursor prefix', async () => {
      const c = new CursorPassThroughResource(req as unknown as RequestFn);
      await c.get('thing');
      expect(req).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/cursor/thing' }),
      );
    });

    it('AzurePassThroughResource defaults to /azure prefix', async () => {
      const a = new AzurePassThroughResource(
        req as unknown as RequestFn,
        stream as unknown as StreamRequestFn,
      );
      await a.get('thing');
      expect(req).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/azure/thing' }),
      );
    });

    it('LangfusePassThroughResource defaults to /langfuse prefix', async () => {
      const l = new LangfusePassThroughResource(
        req as unknown as RequestFn,
        stream as unknown as StreamRequestFn,
      );
      await l.get('thing');
      expect(req).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/langfuse/thing' }),
      );
    });

    it('AssemblyAiPassThroughResource defaults to /assemblyai prefix', async () => {
      const a = new AssemblyAiPassThroughResource(
        req as unknown as RequestFn,
        stream as unknown as StreamRequestFn,
      );
      await a.get('thing');
      expect(req).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/assemblyai/thing' }),
      );
    });
  });
});
