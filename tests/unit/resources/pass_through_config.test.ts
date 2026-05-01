/**
 * @group unit
 */
import { PassThroughConfigResource } from '../../../src/resources/pass_through_config';

describe('PassThroughConfigResource', () => {
  let request: jest.Mock;
  let r: PassThroughConfigResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new PassThroughConfigResource(request as any);
  });

  it('list GETs /config/pass_through_endpoint', async () => {
    await r.list();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/config/pass_through_endpoint');
  });

  it('list forwards endpoint_id filter', async () => {
    await r.list({ endpoint_id: 'pte-1' });
    const arg = request.mock.calls[0][0];
    expect(arg.options.query).toMatchObject({ endpoint_id: 'pte-1' });
  });

  it('listForTeam GETs /config/pass_through_endpoint/team/{team_id}', async () => {
    await r.listForTeam('team-1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/config/pass_through_endpoint/team/team-1',
      }),
    );
  });

  it('listForTeam percent-encodes the team id', async () => {
    await r.listForTeam('team space/a');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/config/pass_through_endpoint/team/team%20space%2Fa',
      }),
    );
  });

  it('create POSTs /config/pass_through_endpoint with body', async () => {
    await r.create({
      path: '/my-vendor/v1',
      target: 'https://upstream.example.com',
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/config/pass_through_endpoint',
        body: {
          kind: 'json',
          value: {
            path: '/my-vendor/v1',
            target: 'https://upstream.example.com',
          },
        },
      }),
    );
  });

  it('update POSTs /config/pass_through_endpoint/{id}', async () => {
    await r.update('pte-1', { headers: { 'X-Foo': 'bar' } });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/config/pass_through_endpoint/pte-1',
        body: { kind: 'json', value: { headers: { 'X-Foo': 'bar' } } },
      }),
    );
  });

  it('delete DELETEs /config/pass_through_endpoint with endpoint_id query', async () => {
    await r.delete({ endpoint_id: 'pte-1' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('DELETE');
    expect(arg.path).toBe('/config/pass_through_endpoint');
    expect(arg.options.query).toMatchObject({ endpoint_id: 'pte-1' });
  });
});
