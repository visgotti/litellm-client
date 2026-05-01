/**
 * @group unit
 */
import { KeysResource } from '../../../src/resources/keys';

describe('KeysResource', () => {
  let request: jest.Mock;
  let keys: KeysResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    keys = new KeysResource(request as any);
  });

  it('create() POSTs to /key/generate', async () => {
    await keys.create({ models: ['gpt-4o'] } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/key/generate',
      body: { kind: 'json', value: { models: ['gpt-4o'] } },
    });
  });

  it('create() with no params', async () => {
    await keys.create();
    expect(request.mock.calls[0][0].body.value).toEqual({});
  });

  it('update() / delete()', async () => {
    await keys.update({ key: 'sk-x', max_budget: 10 } as any);
    expect(request.mock.calls[0][0].path).toBe('/key/update');

    await keys.delete({ keys: ['sk-x'] } as any);
    expect(request.mock.calls[1][0].path).toBe('/key/delete');
  });

  it('block() / unblock()', async () => {
    await keys.block({ key: 'sk-x' } as any);
    expect(request.mock.calls[0][0].path).toBe('/key/block');

    await keys.unblock({ key: 'sk-x' } as any);
    expect(request.mock.calls[1][0].path).toBe('/key/unblock');
  });

  it('regenerate() encodes key in path and excludes it from body', async () => {
    await keys.regenerate({ key: 'sk a/b', max_budget: 100 } as any);
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe(`/key/${encodeURIComponent('sk a/b')}/regenerate`);
    expect(arg.body.value).toEqual({ max_budget: 100 });
  });

  it('info() puts key in query', async () => {
    await keys.info('sk-y');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/key/info',
      options: { query: { key: 'sk-y' } },
    });
  });

  it('list() forwards params via query', async () => {
    await keys.list({ page: 1 } as any);
    expect(request.mock.calls[0][0].options.query).toEqual({ page: 1 });

    await keys.list();
    expect(request.mock.calls[1][0].path).toBe('/key/list');
  });

  it('health() / aliases() / createServiceAccount() / bulkUpdate() / infoV2() / resetSpend()', async () => {
    await keys.health();
    expect(request.mock.calls[0][0]).toMatchObject({ method: 'POST', path: '/key/health' });

    await keys.aliases();
    expect(request.mock.calls[1][0]).toMatchObject({ method: 'GET', path: '/key/aliases' });

    await keys.createServiceAccount({ models: ['gpt-4o'] } as any);
    expect(request.mock.calls[2][0].path).toBe('/key/service-account/generate');

    await keys.bulkUpdate({ keys: [] } as any);
    expect(request.mock.calls[3][0].path).toBe('/key/bulk_update');

    await keys.infoV2({ keys: ['sk-x'] } as any);
    expect(request.mock.calls[4][0].path).toBe('/v2/key/info');

    await keys.resetSpend('sk a');
    expect(request.mock.calls[5][0]).toMatchObject({
      method: 'POST',
      path: `/key/${encodeURIComponent('sk a')}/reset_spend`,
    });
  });
});
