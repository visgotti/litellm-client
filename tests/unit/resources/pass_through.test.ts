/**
 * @group unit
 */
import { PassThroughResource, PassThroughProvider } from '../../../src/resources/pass_through';
import type { RequestFn } from '../../../src/client';

describe('PassThroughResource', () => {
  let request: jest.Mock;
  let passThrough: PassThroughResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({ ok: true });
    passThrough = new PassThroughResource(request as unknown as RequestFn);
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
      ['azure', '/azure'],
      ['openai', '/openai'],
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
  });
});
