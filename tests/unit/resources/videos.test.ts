/**
 * @group unit
 */
import { VideoResource } from '../../../src/resources/videos';

describe('VideoResource', () => {
  let request: jest.Mock;
  let rawRequest: jest.Mock;
  let videos: VideoResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    rawRequest = jest.fn();
    videos = new VideoResource(request as any, rawRequest as any);
  });

  it('create posts to /v1/videos', async () => {
    await videos.create({ prompt: 'a sunset', model: 'sora-2', seconds: '8' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/videos',
        body: { kind: 'json', value: { prompt: 'a sunset', model: 'sora-2', seconds: '8' } },
      }),
    );
  });

  it('list GETs /v1/videos with query params', async () => {
    await videos.list({ limit: 5, order: 'desc', after: 'video_1' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/videos');
    expect(arg.options.query).toEqual({ limit: 5, order: 'desc', after: 'video_1' });
  });

  it('retrieve GETs /v1/videos/{id} with encoded id', async () => {
    await videos.retrieve('vid a/b');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: `/v1/videos/${encodeURIComponent('vid a/b')}`,
      }),
    );
  });

  it('content GETs /v1/videos/{id}/content and returns ArrayBuffer', async () => {
    const buf = new Uint8Array([1, 2, 3, 4]).buffer;
    rawRequest.mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(buf),
    } as unknown as Response);

    const result = await videos.content('video_123');
    expect(rawRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/v1/videos/video_123/content',
      }),
    );
    expect(result).toBe(buf);
  });

  it('remix POSTs to /v1/videos/{id}/remix', async () => {
    await videos.remix('video_123', { prompt: 'recolor' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/videos/video_123/remix',
        body: { kind: 'json', value: { prompt: 'recolor' } },
      }),
    );
  });

  it('createCharacter POSTs multipart to /v1/videos/characters', async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    await videos.createCharacter({ video: bytes, name: 'hero', filename: 'hero.mp4' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/v1/videos/characters');
    expect(arg.body.kind).toBe('form');
    const form = arg.body.value as FormData;
    expect(form.get('name')).toBe('hero');
    expect(form.get('video')).toBeInstanceOf(Blob);
  });

  it('createCharacter includes target_model_names and model when provided', async () => {
    await videos.createCharacter({
      video: new Uint8Array([1]),
      name: 'hero',
      target_model_names: ['sora-2', 'sora-3'],
      model: 'sora-2',
    } as any);
    const form = request.mock.calls[0][0].body.value as FormData;
    expect(form.getAll('target_model_names')).toEqual(['sora-2', 'sora-3']);
    expect(form.get('model')).toBe('sora-2');
  });

  it('list with no params still works', async () => {
    await videos.list();
    expect(request.mock.calls[0][0].path).toBe('/v1/videos');
  });

  it('retrieveCharacter GETs /v1/videos/characters/{id}', async () => {
    await videos.retrieveCharacter('character_abc');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/v1/videos/characters/character_abc',
      }),
    );
  });

  it('edit POSTs to /v1/videos/edits', async () => {
    await videos.edit({ prompt: 'make it brighter', video: { id: 'video_123' } });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/videos/edits',
        body: {
          kind: 'json',
          value: { prompt: 'make it brighter', video: { id: 'video_123' } },
        },
      }),
    );
  });

  it('extend POSTs to /v1/videos/extensions', async () => {
    await videos.extend({
      prompt: 'continue the scene',
      seconds: '4',
      video: { id: 'video_123' },
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/videos/extensions',
        body: {
          kind: 'json',
          value: {
            prompt: 'continue the scene',
            seconds: '4',
            video: { id: 'video_123' },
          },
        },
      }),
    );
  });
});
