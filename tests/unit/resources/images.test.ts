/**
 * @group unit
 */
import { ImagesResource } from '../../../src/resources/images';

describe('ImagesResource', () => {
  let request: jest.Mock;
  let images: ImagesResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    images = new ImagesResource(request as any);
  });

  it('generate() POSTs JSON to /v1/images/generations', async () => {
    await images.generate({
      model: 'dall-e-3',
      prompt: 'a sunset',
      n: 1,
      size: '1024x1024',
    } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/images/generations',
      body: {
        kind: 'json',
        value: { model: 'dall-e-3', prompt: 'a sunset', n: 1, size: '1024x1024' },
      },
    });
  });

  it('edit() with single image and all options builds multipart', async () => {
    const bytes = new Uint8Array([0x89, 0x50]);
    await images.edit({
      image: bytes,
      mask: bytes,
      prompt: 'add a cat',
      model: 'dall-e-2',
      n: 2,
      size: '512x512',
      response_format: 'b64_json',
      user: 'u1',
    } as any);
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/v1/images/edits');
    expect(arg.body.kind).toBe('form');
    const form: FormData = arg.body.value;
    expect(form.get('image')).toBeInstanceOf(Blob);
    expect(form.get('mask')).toBeInstanceOf(Blob);
    expect(form.get('prompt')).toBe('add a cat');
    expect(form.get('model')).toBe('dall-e-2');
    expect(form.get('n')).toBe('2');
    expect(form.get('size')).toBe('512x512');
    expect(form.get('response_format')).toBe('b64_json');
    expect(form.get('user')).toBe('u1');
  });

  it('edit() with array of images uses image[] field', async () => {
    const a = new Uint8Array([1]);
    const b = new Uint8Array([2]);
    await images.edit({ image: [a, b], prompt: 'p' } as any);
    const form: FormData = request.mock.calls[0][0].body.value;
    expect(form.getAll('image[]').length).toBe(2);
    expect(form.get('prompt')).toBe('p');
  });

  it('variations() builds multipart with all options', async () => {
    const bytes = new Uint8Array([1, 2]);
    await images.variations({
      image: bytes,
      model: 'dall-e-2',
      n: 3,
      size: '256x256',
      response_format: 'url',
      user: 'u',
    } as any);
    const arg = request.mock.calls[0][0];
    expect(arg.path).toBe('/v1/images/variations');
    const form: FormData = arg.body.value;
    expect(form.get('image')).toBeInstanceOf(Blob);
    expect(form.get('model')).toBe('dall-e-2');
    expect(form.get('n')).toBe('3');
    expect(form.get('size')).toBe('256x256');
    expect(form.get('response_format')).toBe('url');
    expect(form.get('user')).toBe('u');
  });

  it('variations() with minimal params', async () => {
    await images.variations({ image: 'fake' } as any);
    const form: FormData = request.mock.calls[0][0].body.value;
    expect(form.get('image')).toBeInstanceOf(Blob);
  });
});
