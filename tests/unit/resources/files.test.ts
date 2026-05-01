/**
 * @group unit
 */
import { FilesResource } from '../../../src/resources/files';

describe('FilesResource', () => {
  let request: jest.Mock;
  let rawRequest: jest.Mock;
  let files: FilesResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    rawRequest = jest.fn();
    files = new FilesResource(request as any, rawRequest as any);
  });

  it('create() builds multipart form with file/purpose', async () => {
    const bytes = new Uint8Array([0x68, 0x69]);
    await files.create({
      file: bytes,
      filename: 'a.jsonl',
      purpose: 'fine-tune',
    } as any);
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/v1/files');
    expect(arg.body.kind).toBe('form');
    const form: FormData = arg.body.value;
    expect(form.get('file')).toBeInstanceOf(Blob);
    expect(form.get('purpose')).toBe('fine-tune');
  });

  it('create() includes custom_llm_provider when provided', async () => {
    await files.create({
      file: 'x',
      filename: 'a.jsonl',
      purpose: 'batch',
      custom_llm_provider: 'openai',
    } as any);
    const form: FormData = request.mock.calls[0][0].body.value;
    expect(form.get('custom_llm_provider')).toBe('openai');
  });

  it('list() forwards params via query', async () => {
    await files.list({ purpose: 'batch' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/v1/files',
      options: { query: { purpose: 'batch' } },
    });

    await files.list();
    expect(request.mock.calls[1][0].path).toBe('/v1/files');
  });

  it('retrieve() / delete() encode id', async () => {
    await files.retrieve('file a');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: `/v1/files/${encodeURIComponent('file a')}`,
    });

    await files.delete('file a');
    expect(request.mock.calls[1][0]).toMatchObject({
      method: 'DELETE',
      path: `/v1/files/${encodeURIComponent('file a')}`,
    });
  });

  it('content() uses rawRequest and returns ArrayBuffer', async () => {
    const buf = new Uint8Array([1, 2, 3]).buffer;
    rawRequest.mockResolvedValueOnce({
      arrayBuffer: jest.fn().mockResolvedValue(buf),
    });

    const result = await files.content('file_x');
    expect(rawRequest.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/v1/files/file_x/content',
    });
    expect(result).toBe(buf);
  });
});
