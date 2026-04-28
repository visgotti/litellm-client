/**
 * @group unit
 */
import { UsersResource } from '../../../src/resources/users';

describe('UsersResource', () => {
  let request: jest.Mock;
  let users: UsersResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    users = new UsersResource(request as any);
  });

  it('create() POSTs to /user/new', async () => {
    await users.create({ user_email: 'a@b.c' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/user/new',
      body: { kind: 'json', value: { user_email: 'a@b.c' } },
    });
  });

  it('create() defaults to empty body', async () => {
    await users.create();
    expect(request.mock.calls[0][0].body.value).toEqual({});
  });

  it('update() / delete()', async () => {
    await users.update({ user_id: 'u1', user_role: 'proxy_admin' } as any);
    expect(request.mock.calls[0][0].path).toBe('/user/update');

    await users.delete({ user_ids: ['u1'] } as any);
    expect(request.mock.calls[1][0].path).toBe('/user/delete');
  });

  it('info() with userId puts it in query', async () => {
    await users.info('u/1');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/user/info',
      options: { query: { user_id: 'u/1' } },
    });
  });

  it('info() without userId omits user_id from query', async () => {
    await users.info();
    const arg = request.mock.calls[0][0];
    expect(arg.path).toBe('/user/info');
    expect(arg.options.query.user_id).toBeUndefined();
  });

  it('infoV2() with and without userId', async () => {
    await users.infoV2('u1');
    expect(request.mock.calls[0][0].path).toBe('/v2/user/info');
    expect(request.mock.calls[0][0].options.query).toEqual({ user_id: 'u1' });

    await users.infoV2();
    expect(request.mock.calls[1][0].options.query.user_id).toBeUndefined();
  });

  it('list() forwards params via query', async () => {
    await users.list({ page: 1 } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/user/list',
      options: { query: { page: 1 } },
    });

    await users.list();
    expect(request.mock.calls[1][0].path).toBe('/user/list');
  });

  it('getUsers() / availableRoles()', async () => {
    await users.getUsers();
    expect(request.mock.calls[0][0].path).toBe('/user/get_users');

    await users.availableRoles();
    expect(request.mock.calls[1][0].path).toBe('/user/available_roles');
  });

  it('bulkUpdate() POSTs to /user/bulk_update', async () => {
    await users.bulkUpdate({ users: [{ user_id: 'u1' }] } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/user/bulk_update',
      body: { kind: 'json', value: { users: [{ user_id: 'u1' }] } },
    });
  });

  it('dailyActivityAggregated() forwards params via query', async () => {
    await users.dailyActivityAggregated({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/user/daily/activity/aggregated',
    });
  });
});
