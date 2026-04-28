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

  describe('interactions', () => {
    it('creates an interaction', async () => {
      request.mockResolvedValueOnce({ id: 'i_1', state: 'PENDING' });
      const result = await gemini.interactions.create({ model: 'gemini-2.5-pro' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1beta/interactions',
          body: { kind: 'json', value: { model: 'gemini-2.5-pro' } },
        }),
      );
      expect(result.id).toBe('i_1');
    });

    it('retrieves an interaction by id (encoded)', async () => {
      request.mockResolvedValueOnce({ id: 'i 1' });
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
      request.mockResolvedValueOnce({ id: 'i_1', state: 'CANCELLED' });
      const result = await gemini.interactions.cancel('i_1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1beta/interactions/i_1/cancel',
        }),
      );
      expect(result.state).toBe('CANCELLED');
    });
  });
});
