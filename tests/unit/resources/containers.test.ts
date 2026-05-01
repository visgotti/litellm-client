/**
 * @group unit
 */
import { ContainersResource, ContainerFilesResource } from '../../../src/resources/containers';

describe('ContainersResource', () => {
  let request: jest.Mock;
  let rawRequest: jest.Mock;
  let containers: ContainersResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    rawRequest = jest.fn();
    containers = new ContainersResource(request as any, rawRequest as any);
  });

  it('create posts to /v1/containers', async () => {
    await containers.create({ name: 'sandbox', expires_after: { anchor: 'last_active_at', minutes: 20 } });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/containers',
        body: { kind: 'json', value: { name: 'sandbox', expires_after: { anchor: 'last_active_at', minutes: 20 } } },
      }),
    );
  });

  it('list GETs /v1/containers with query params', async () => {
    await containers.list({ limit: 5, order: 'desc' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/containers');
    expect(arg.options.query).toEqual({ limit: 5, order: 'desc' });
  });

  it('list works with no params (default {})', async () => {
    await containers.list();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/containers');
    expect(arg.options.query).toEqual({});
  });

  it('retrieve GETs /v1/containers/{id} with encoded id', async () => {
    await containers.retrieve('cont a/b');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: `/v1/containers/${encodeURIComponent('cont a/b')}`,
      }),
    );
  });

  it('delete DELETEs /v1/containers/{id}', async () => {
    await containers.delete('cont_1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/v1/containers/cont_1',
      }),
    );
  });

  it('exposes a files sub-resource', () => {
    expect(containers.files).toBeInstanceOf(ContainerFilesResource);
  });
});

describe('ContainerFilesResource', () => {
  let request: jest.Mock;
  let rawRequest: jest.Mock;
  let files: ContainerFilesResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    rawRequest = jest.fn();
    files = new ContainerFilesResource(request as any, rawRequest as any);
  });

  it('create() posts multipart to /v1/containers/{id}/files', async () => {
    const bytes = new Uint8Array([0x68, 0x69]);
    await files.create('cont_1', {
      file: bytes,
      filename: 'chart.png',
      contentType: 'image/png',
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/v1/containers/cont_1/files');
    expect(arg.body.kind).toBe('form');
    const form: FormData = arg.body.value;
    expect(form.get('file')).toBeInstanceOf(Blob);
  });

  it('create() encodes container id', async () => {
    await files.create('cont a/b', {
      file: 'hello',
      filename: 'a.txt',
    });
    expect(request.mock.calls[0][0].path).toBe(
      `/v1/containers/${encodeURIComponent('cont a/b')}/files`,
    );
  });

  it('list() GETs /v1/containers/{id}/files with pagination params', async () => {
    await files.list('cont_1', { limit: 5, order: 'asc', after: 'cf_x' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/containers/cont_1/files');
    expect(arg.options.query).toEqual({ limit: 5, order: 'asc', after: 'cf_x' });
  });

  it('list() works with no params', async () => {
    await files.list('cont_1');
    expect(request.mock.calls[0][0].path).toBe('/v1/containers/cont_1/files');
  });

  it('retrieve() GETs /v1/containers/{id}/files/{file_id} with encoded ids', async () => {
    await files.retrieve('cont a', 'file b');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: `/v1/containers/${encodeURIComponent('cont a')}/files/${encodeURIComponent('file b')}`,
      }),
    );
  });

  it('delete() DELETEs /v1/containers/{id}/files/{file_id}', async () => {
    await files.delete('cont_1', 'cf_1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/v1/containers/cont_1/files/cf_1',
      }),
    );
  });

  it('content() GETs /v1/containers/{id}/files/{file_id}/content and returns ArrayBuffer', async () => {
    const buf = new ArrayBuffer(8);
    rawRequest.mockResolvedValueOnce({
      arrayBuffer: () => Promise.resolve(buf),
    });
    const out = await files.content('cont a', 'file b');
    expect(rawRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: `/v1/containers/${encodeURIComponent('cont a')}/files/${encodeURIComponent('file b')}/content`,
      }),
    );
    expect(out).toBe(buf);
  });
});
