/**
 * @group unit
 */
import { GeminiResource } from '../../../src/resources/gemini';
import { Stream } from '../../../src/streaming';
import type { RequestFn, StreamRequestFn } from '../../../src/client';
import type { GenerateContentResponse } from '../../../src/types/gemini';

describe('GeminiResource', () => {
  let request: jest.Mock;
  let streamRequest: jest.Mock;
  let gemini: GeminiResource;

  beforeEach(() => {
    request = jest.fn();
    streamRequest = jest.fn();
    gemini = new GeminiResource(
      request as unknown as RequestFn,
      streamRequest as unknown as StreamRequestFn,
    );
  });

  describe('generateContent', () => {
    it('POSTs to /v1beta/models/{model}:generateContent', async () => {
      request.mockResolvedValueOnce({
        candidates: [
          {
            content: { role: 'model', parts: [{ text: 'hi' }] },
            finishReason: 'STOP',
          },
        ],
      });

      const result = await gemini.generateContent('gemini-2.5-pro', {
        contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
      });

      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1beta/models/gemini-2.5-pro:generateContent',
          body: {
            kind: 'json',
            value: {
              contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
            },
          },
        }),
      );
      expect(result.candidates?.[0].finishReason).toBe('STOP');
    });

    it('encodes the model name', async () => {
      request.mockResolvedValueOnce({});
      await gemini.generateContent('models/with slash', { contents: [] });
      const call = request.mock.calls[0][0];
      expect(call.path).toBe(`/v1beta/models/${encodeURIComponent('models/with slash')}:generateContent`);
    });

    it('forwards extra_headers and strips from body', async () => {
      request.mockResolvedValueOnce({});
      await gemini.generateContent('gemini-2.5-pro', {
        contents: [],
        extra_headers: { 'x-goog-api-client': 'foo' },
      });
      const call = request.mock.calls[0][0];
      expect(call.options.headers['x-goog-api-client']).toBe('foo');
      expect(call.body.value.extra_headers).toBeUndefined();
    });
  });

  describe('streamGenerateContent', () => {
    it('routes to streamRequest', async () => {
      const fakeStream = new Stream<GenerateContentResponse>(
        (async function* () {
          /* empty */
        })(),
        new AbortController(),
      );
      streamRequest.mockResolvedValueOnce(fakeStream);

      const result = await gemini.streamGenerateContent('gemini-2.5-pro', {
        contents: [{ role: 'user', parts: [{ text: 'go' }] }],
      });

      expect(streamRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1beta/models/gemini-2.5-pro:streamGenerateContent',
        }),
      );
      expect(result).toBe(fakeStream);
    });

    it('forwards extra_headers and strips from body in stream variant', async () => {
      const fakeStream = new Stream<GenerateContentResponse>(
        (async function* () {
          /* empty */
        })(),
        new AbortController(),
      );
      streamRequest.mockResolvedValueOnce(fakeStream);
      await gemini.streamGenerateContent('gemini-2.5-pro', {
        contents: [],
        extra_headers: { 'x-goog-api-client': 'bar' },
      });
      const call = streamRequest.mock.calls[0][0];
      expect(call.options.headers['x-goog-api-client']).toBe('bar');
      expect(call.body.value.extra_headers).toBeUndefined();
    });
  });

  describe('countTokens', () => {
    it('POSTs to /v1beta/models/{model}:countTokens', async () => {
      request.mockResolvedValueOnce({ totalTokens: 12 });

      const result = await gemini.countTokens('gemini-2.5-pro', {
        contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
      });

      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1beta/models/gemini-2.5-pro:countTokens',
        }),
      );
      expect(result.totalTokens).toBe(12);
    });
  });

  describe('models', () => {
    it('retrieve() GETs /v1/models/{model}', async () => {
      request.mockResolvedValueOnce({ name: 'models/gemini-1.5-pro' });
      await gemini.models.retrieve('gemini-1.5-pro');
      expect(request.mock.calls[0][0]).toMatchObject({
        method: 'GET',
        path: '/v1/models/gemini-1.5-pro',
      });
    });

    it('countTokens() POSTs /models/{model}:countTokens', async () => {
      request.mockResolvedValueOnce({ totalTokens: 5 });
      await gemini.models.countTokens('gemini-1.5-pro', { contents: [] });
      expect(request.mock.calls[0][0]).toMatchObject({
        method: 'POST',
        path: '/models/gemini-1.5-pro:countTokens',
      });
    });

    it('generateContent() POSTs /models/{model}:generateContent', async () => {
      request.mockResolvedValueOnce({});
      await gemini.models.generateContent('gemini-1.5-pro', { contents: [] });
      expect(request.mock.calls[0][0]).toMatchObject({
        method: 'POST',
        path: '/models/gemini-1.5-pro:generateContent',
      });
    });

    it('streamGenerateContent() routes to streamRequest at /models/{model}:streamGenerateContent', async () => {
      const fake = new Stream<GenerateContentResponse>(
        (async function* () {})(),
        new AbortController(),
      );
      streamRequest.mockResolvedValueOnce(fake);
      await gemini.models.streamGenerateContent('gemini-1.5-pro', { contents: [] });
      expect(streamRequest.mock.calls[0][0]).toMatchObject({
        method: 'POST',
        path: '/models/gemini-1.5-pro:streamGenerateContent',
      });
    });

    it('streamGenerateContentV1Beta() routes to streamRequest at /v1beta/models/{model}:streamGenerateContent', async () => {
      const fake = new Stream<GenerateContentResponse>(
        (async function* () {})(),
        new AbortController(),
      );
      streamRequest.mockResolvedValueOnce(fake);
      await gemini.models.streamGenerateContentV1Beta('gemini-1.5-pro', { contents: [] });
      expect(streamRequest.mock.calls[0][0]).toMatchObject({
        method: 'POST',
        path: '/v1beta/models/gemini-1.5-pro:streamGenerateContent',
      });
    });
  });

  describe('interactions', () => {
    it('creates an interaction', async () => {
      request.mockResolvedValueOnce({
        id: 'interaction_abc123',
        object: 'interaction',
        model: 'gemini-2.5-flash',
        status: 'completed',
        role: 'model',
        outputs: [{ type: 'text', text: 'hi' }],
        usage: { total_input_tokens: 10, total_output_tokens: 15, total_tokens: 25 },
      });
      const result = await gemini.interactions.create({
        model: 'gemini/gemini-2.5-flash',
        input: 'tell me a joke',
        system_instruction: 'be funny',
        generation_config: { temperature: 0.7 },
        previous_interaction_id: 'interaction_prev',
        stream: false,
      });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1beta/interactions',
          body: {
            kind: 'json',
            value: {
              model: 'gemini/gemini-2.5-flash',
              input: 'tell me a joke',
              system_instruction: 'be funny',
              generation_config: { temperature: 0.7 },
              previous_interaction_id: 'interaction_prev',
              stream: false,
            },
          },
        }),
      );
      expect(result.id).toBe('interaction_abc123');
      expect(result.status).toBe('completed');
      expect(result.outputs?.[0].text).toBe('hi');
      expect(result.usage?.total_tokens).toBe(25);
    });

    it('retrieves an interaction by id (encoded)', async () => {
      request.mockResolvedValueOnce({ id: 'i 1', object: 'interaction' });
      await gemini.interactions.retrieve('i 1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/v1beta/interactions/i%201',
        }),
      );
    });

    it('deletes an interaction', async () => {
      request.mockResolvedValueOnce({ id: 'i_1', deleted: true });
      const result = await gemini.interactions.delete('i_1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: '/v1beta/interactions/i_1',
        }),
      );
      expect(result.deleted).toBe(true);
    });

    it('cancels an interaction', async () => {
      request.mockResolvedValueOnce({ id: 'i_1', status: 'cancelled' });
      const result = await gemini.interactions.cancel('i_1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1beta/interactions/i_1/cancel',
        }),
      );
      expect(result.status).toBe('cancelled');
    });
  });
});
