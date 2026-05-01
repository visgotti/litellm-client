/**
 * @group unit
 */
import { AudioResource } from '../../../src/resources/audio';

describe('AudioResource', () => {
  let request: jest.Mock;
  let rawRequest: jest.Mock;
  let audio: AudioResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    rawRequest = jest.fn();
    audio = new AudioResource(request as any, rawRequest as any);
  });

  it('speech.create() POSTs JSON to /v1/audio/speech and returns bytes', async () => {
    const buf = new Uint8Array([1, 2]).buffer;
    rawRequest.mockResolvedValueOnce({
      arrayBuffer: jest.fn().mockResolvedValue(buf),
    });

    const result = await audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: 'hello',
    } as any);

    expect(rawRequest.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/audio/speech',
      body: {
        kind: 'json',
        value: { model: 'tts-1', voice: 'alloy', input: 'hello' },
      },
    });
    expect(result).toBe(buf);
  });

  it('transcriptions.create() builds multipart with all optional params', async () => {
    const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
    await audio.transcriptions.create({
      file: bytes,
      filename: 'a.wav',
      model: 'whisper-1',
      language: 'en',
      prompt: 'hello',
      response_format: 'verbose_json',
      temperature: 0.2,
      'timestamp_granularities[]': ['word', 'segment'],
    } as any);

    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/v1/audio/transcriptions');
    expect(arg.body.kind).toBe('form');
    const form: FormData = arg.body.value;
    expect(form.get('model')).toBe('whisper-1');
    expect(form.get('language')).toBe('en');
    expect(form.get('prompt')).toBe('hello');
    expect(form.get('response_format')).toBe('verbose_json');
    expect(form.get('temperature')).toBe('0.2');
    expect(form.getAll('timestamp_granularities[]')).toEqual(['word', 'segment']);
  });

  it('transcriptions.create() with minimal params', async () => {
    await audio.transcriptions.create({
      file: 'fake',
      model: 'whisper-1',
    } as any);
    const form: FormData = request.mock.calls[0][0].body.value;
    expect(form.get('model')).toBe('whisper-1');
    expect(form.get('file')).toBeInstanceOf(Blob);
  });

});
