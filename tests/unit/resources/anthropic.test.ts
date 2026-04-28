/**
 * @group unit
 */
import { AnthropicResource } from '../../../src/resources/anthropic';
import { Stream } from '../../../src/streaming';
import type { RequestFn, StreamRequestFn } from '../../../src/client';
import type { MessageStreamEvent } from '../../../src/types/anthropic';

describe('AnthropicResource', () => {
  let request: jest.Mock;
  let streamRequest: jest.Mock;
  let anthropic: AnthropicResource;

  beforeEach(() => {
    request = jest.fn();
    streamRequest = jest.fn();
    anthropic = new AnthropicResource(
      request as unknown as RequestFn,
      streamRequest as unknown as StreamRequestFn,
    );
  });

  describe('messages.create', () => {
    it('sends a non-streaming request to /v1/messages', async () => {
      request.mockResolvedValueOnce({
        id: 'msg_1',
        type: 'message',
        role: 'assistant',
        model: 'claude-opus-4-5',
        content: [{ type: 'text', text: 'hello' }],
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 5, output_tokens: 2 },
      });

      const result = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'hi' }],
      });

      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1/messages',
          body: {
            kind: 'json',
            value: {
              model: 'claude-opus-4-5',
              max_tokens: 1024,
              messages: [{ role: 'user', content: 'hi' }],
            },
          },
        }),
      );
      expect(result.id).toBe('msg_1');
      expect(streamRequest).not.toHaveBeenCalled();
    });

    it('forwards extra_headers via options.headers and removes from body', async () => {
      request.mockResolvedValueOnce({
        id: 'msg_2',
        type: 'message',
        role: 'assistant',
        model: 'claude-opus-4-5',
        content: [],
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 1, output_tokens: 1 },
      });

      await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'x' }],
        extra_headers: { 'anthropic-beta': 'skills-2025' },
      });

      const call = request.mock.calls[0][0];
      expect(call.options.headers['anthropic-beta']).toBe('skills-2025');
      expect(call.body.value.extra_headers).toBeUndefined();
    });

    it('routes to streamRequest when stream=true', async () => {
      const fakeStream = new Stream<MessageStreamEvent>(
        (async function* () {
          /* empty */
        })(),
        new AbortController(),
      );
      streamRequest.mockResolvedValueOnce(fakeStream);

      const result = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'hi' }],
        stream: true,
      });

      expect(streamRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1/messages',
        }),
      );
      expect(request).not.toHaveBeenCalled();
      expect(result).toBe(fakeStream);
    });

    it('does not stream when stream=false', async () => {
      request.mockResolvedValueOnce({
        id: 'msg_3',
        type: 'message',
        role: 'assistant',
        model: 'm',
        content: [],
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 1, output_tokens: 1 },
      });

      await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'hi' }],
        stream: false,
      });

      expect(request).toHaveBeenCalled();
      expect(streamRequest).not.toHaveBeenCalled();
    });
  });

  describe('messages.countTokens', () => {
    it('POSTs to /v1/messages/count_tokens', async () => {
      request.mockResolvedValueOnce({ input_tokens: 42 });

      const result = await anthropic.messages.countTokens({
        model: 'claude-opus-4-5',
        messages: [{ role: 'user', content: 'hi' }],
      });

      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1/messages/count_tokens',
          body: {
            kind: 'json',
            value: {
              model: 'claude-opus-4-5',
              messages: [{ role: 'user', content: 'hi' }],
            },
          },
        }),
      );
      expect(result.input_tokens).toBe(42);
    });
  });

  describe('skills', () => {
    it('creates a skill', async () => {
      request.mockResolvedValueOnce({ id: 'sk_1', name: 'tester' });
      const result = await anthropic.skills.create({ name: 'tester', description: 'd' });
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/v1/skills',
          body: { kind: 'json', value: { name: 'tester', description: 'd' } },
        }),
      );
      expect(result.id).toBe('sk_1');
    });

    it('lists skills with query params', async () => {
      request.mockResolvedValueOnce({ data: [] });
      await anthropic.skills.list({ limit: 10, cursor: 'c1' });
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('GET');
      expect(call.path).toBe('/v1/skills');
      expect(call.options.query).toEqual({ limit: 10, cursor: 'c1' });
    });

    it('lists skills with no params', async () => {
      request.mockResolvedValueOnce({ data: [] });
      await anthropic.skills.list();
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', path: '/v1/skills' }),
      );
    });

    it('retrieves a skill by id (encoded)', async () => {
      request.mockResolvedValueOnce({ id: 'sk 1', name: 'n' });
      await anthropic.skills.retrieve('sk 1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          path: '/v1/skills/sk%201',
        }),
      );
    });

    it('deletes a skill', async () => {
      request.mockResolvedValueOnce({ id: 'sk_1', deleted: true });
      const result = await anthropic.skills.delete('sk_1');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          path: '/v1/skills/sk_1',
        }),
      );
      expect(result.deleted).toBe(true);
    });
  });
});
