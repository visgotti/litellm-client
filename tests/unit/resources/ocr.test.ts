/**
 * @group unit
 */
import { OcrResource } from '../../../src/resources/ocr';

describe('OcrResource', () => {
  let request: jest.Mock;
  let ocr: OcrResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    ocr = new OcrResource(request as any);
  });

  it('create posts JSON document to /v1/ocr', async () => {
    await ocr.create({
      model: 'mistral-ocr',
      document: { type: 'document_url', document_url: 'https://example.com/x.pdf' },
      include_image_base64: true,
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/ocr',
        body: {
          kind: 'json',
          value: {
            model: 'mistral-ocr',
            document: { type: 'document_url', document_url: 'https://example.com/x.pdf' },
            include_image_base64: true,
          },
        },
      }),
    );
  });

  it('create POSTs multipart when given a file', async () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
    await ocr.create({
      model: 'mistral-ocr',
      file: bytes,
      filename: 'doc.pdf',
      contentType: 'application/pdf',
      pages: [0, 1, 2],
      include_image_base64: false,
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/v1/ocr');
    expect(arg.body.kind).toBe('form');
    const form = arg.body.value as FormData;
    expect(form.get('model')).toBe('mistral-ocr');
    expect(form.get('file')).toBeInstanceOf(Blob);
    expect(form.get('pages')).toBe('[0,1,2]');
    expect(form.get('include_image_base64')).toBe('false');
  });

  it('create includes image_limit / image_min_size / custom_llm_provider when provided', async () => {
    await ocr.create({
      model: 'mistral-ocr',
      file: new Uint8Array([1, 2, 3]),
      image_limit: 5,
      image_min_size: 128,
      custom_llm_provider: 'mistral',
    } as any);
    const form = request.mock.calls[0][0].body.value as FormData;
    expect(form.get('image_limit')).toBe('5');
    expect(form.get('image_min_size')).toBe('128');
    expect(form.get('custom_llm_provider')).toBe('mistral');
  });
});
