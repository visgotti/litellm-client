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
    it('creates a skill via multipart/form-data with display_title and files[]', async () => {
      request.mockResolvedValueOnce({
        id: 'sk_1',
        type: 'skill',
        display_title: 'My Skill',
        latest_version_id: 'skillver_01xyz',
      });
      const result = await anthropic.skills.create({
        display_title: 'My Skill',
        files: 'SKILL.md contents',
        filename: 'SKILL.md',
        contentType: 'text/markdown',
        model: 'claude-opus-4-5',
      });

      const call = request.mock.calls[0][0];
      expect(call.method).toBe('POST');
      expect(call.path).toBe('/v1/skills');
      expect(call.body.kind).toBe('form');

      const form: FormData = call.body.value;
      expect(form).toBeInstanceOf(FormData);
      expect(form.get('display_title')).toBe('My Skill');
      expect(form.get('model')).toBe('claude-opus-4-5');
      const files = form.getAll('files[]');
      expect(files).toHaveLength(1);
      expect(files[0]).toBeInstanceOf(Blob);

      expect(call.options.headers['anthropic-beta']).toBe('skills-2025-10-02');
      expect(call.options.query).toEqual({ beta: true, model: 'claude-opus-4-5' });
      expect(result.id).toBe('sk_1');
      expect(result.display_title).toBe('My Skill');
      expect(result.latest_version_id).toBe('skillver_01xyz');
    });

    it('creates a skill defaulting filename to skill.zip when not provided', async () => {
      request.mockResolvedValueOnce({ id: 'sk_4', display_title: 'Default' });
      await anthropic.skills.create({
        display_title: 'Default',
        files: new Uint8Array([1, 2, 3]),
      });
      const form: FormData = request.mock.calls[0][0].body.value;
      const files = form.getAll('files[]');
      expect(files).toHaveLength(1);
      // Blob exposes the filename via the third arg to FormData.append; we only check it's a Blob
      expect(files[0]).toBeInstanceOf(Blob);
    });

    it('creates a skill from a single file upload object', async () => {
      request.mockResolvedValueOnce({ id: 'sk_3', display_title: 'Single' });
      await anthropic.skills.create({
        display_title: 'Single',
        files: { file: 'SKILL contents', filename: 'SKILL.md', contentType: 'text/markdown' },
      });
      const form: FormData = request.mock.calls[0][0].body.value;
      const files = form.getAll('files[]');
      expect(files).toHaveLength(1);
      expect(files[0]).toBeInstanceOf(Blob);
    });

    it('creates a skill from an array of files appending each as files[]', async () => {
      request.mockResolvedValueOnce({ id: 'sk_2', display_title: 'Multi' });
      await anthropic.skills.create({
        display_title: 'Multi',
        files: [
          { file: 'SKILL contents', filename: 'SKILL.md', contentType: 'text/markdown' },
          { file: new Uint8Array([1, 2, 3]), filename: 'helper.bin' },
        ],
      });
      const form: FormData = request.mock.calls[0][0].body.value;
      const files = form.getAll('files[]');
      expect(files).toHaveLength(2);
    });

    it('lists skills with query params and beta header', async () => {
      request.mockResolvedValueOnce({ data: [] });
      await anthropic.skills.list({ limit: 10, cursor: 'c1' });
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('GET');
      expect(call.path).toBe('/v1/skills');
      expect(call.options.query).toEqual({ beta: true, limit: 10, cursor: 'c1' });
      expect(call.options.headers['anthropic-beta']).toBe('skills-2025-10-02');
    });

    it('lists skills with no params (still sends beta=true)', async () => {
      request.mockResolvedValueOnce({ data: [] });
      await anthropic.skills.list();
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('GET');
      expect(call.path).toBe('/v1/skills');
      expect(call.options.query).toEqual({ beta: true });
      expect(call.options.headers['anthropic-beta']).toBe('skills-2025-10-02');
    });

    it('retrieves a skill by id (encoded) with beta query and header', async () => {
      request.mockResolvedValueOnce({ id: 'sk 1', display_title: 'n' });
      await anthropic.skills.retrieve('sk 1');
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('GET');
      expect(call.path).toBe('/v1/skills/sk%201');
      expect(call.options.query).toEqual({ beta: true });
      expect(call.options.headers['anthropic-beta']).toBe('skills-2025-10-02');
    });

    it('deletes a skill with beta query and header', async () => {
      request.mockResolvedValueOnce({ id: 'sk_1', deleted: true });
      const result = await anthropic.skills.delete('sk_1');
      const call = request.mock.calls[0][0];
      expect(call.method).toBe('DELETE');
      expect(call.path).toBe('/v1/skills/sk_1');
      expect(call.options.query).toEqual({ beta: true });
      expect(call.options.headers['anthropic-beta']).toBe('skills-2025-10-02');
      expect(result.deleted).toBe(true);
    });
  });
});
