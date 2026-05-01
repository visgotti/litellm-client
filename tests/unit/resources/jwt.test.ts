/**
 * @group unit
 */
import { JwtKeyMappingResource } from '../../../src/resources/jwt';

describe('JwtKeyMappingResource', () => {
  let request: jest.Mock;
  let r: JwtKeyMappingResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new JwtKeyMappingResource(request as any);
  });

  it('create POSTs /jwt/key/mapping/new', async () => {
    await r.create({
      jwt_claim_name: 'sub',
      jwt_claim_value: 'user-1',
      key: 'sk-test',
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/jwt/key/mapping/new',
        body: {
          kind: 'json',
          value: {
            jwt_claim_name: 'sub',
            jwt_claim_value: 'user-1',
            key: 'sk-test',
          },
        },
      }),
    );
  });

  it('update POSTs /jwt/key/mapping/update', async () => {
    await r.update({ id: 'm1', is_active: false });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/jwt/key/mapping/update',
        body: { kind: 'json', value: { id: 'm1', is_active: false } },
      }),
    );
  });

  it('delete POSTs /jwt/key/mapping/delete', async () => {
    await r.delete({ id: 'm1' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/jwt/key/mapping/delete',
        body: { kind: 'json', value: { id: 'm1' } },
      }),
    );
  });

  it('list GETs /jwt/key/mapping/list with pagination', async () => {
    await r.list({ page: 2, size: 25 });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/jwt/key/mapping/list');
    expect(arg.options.query).toMatchObject({ page: 2, size: 25 });
  });

  it('list GETs /jwt/key/mapping/list with no params (default branch)', async () => {
    await r.list();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/jwt/key/mapping/list');
    expect(arg.options.query).toEqual({});
  });

  it('retrieve GETs /jwt/key/mapping/info with id query', async () => {
    await r.retrieve('m1');
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/jwt/key/mapping/info');
    expect(arg.options.query).toMatchObject({ id: 'm1' });
  });
});
