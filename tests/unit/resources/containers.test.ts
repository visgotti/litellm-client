/**
 * @group unit
 */
import { ContainersResource } from '../../../src/resources/containers';

describe('ContainersResource', () => {
  let request: jest.Mock;
  let containers: ContainersResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    containers = new ContainersResource(request as any);
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
});
