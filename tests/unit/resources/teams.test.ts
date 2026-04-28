/**
 * @group unit
 */
import { TeamsResource } from '../../../src/resources/teams';

describe('TeamsResource', () => {
  let request: jest.Mock;
  let teams: TeamsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    teams = new TeamsResource(request as any);
  });

  it('create() POSTs to /team/new', async () => {
    await teams.create({ team_alias: 't' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/team/new',
      body: { kind: 'json', value: { team_alias: 't' } },
    });
  });

  it('create() with no params', async () => {
    await teams.create();
    expect(request.mock.calls[0][0].body.value).toEqual({});
  });

  it('update() POSTs to /team/update', async () => {
    await teams.update({ team_id: 't1', team_alias: 'new' } as any);
    expect(request.mock.calls[0][0].path).toBe('/team/update');
  });

  it('delete() POSTs to /team/delete', async () => {
    await teams.delete({ team_ids: ['t1'] } as any);
    expect(request.mock.calls[0][0].path).toBe('/team/delete');
  });

  it('info() encodes team_id into query', async () => {
    await teams.info('team x/y');
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/team/info');
    expect(arg.options.query).toEqual({ team_id: 'team x/y' });
  });

  it('list() forwards params via query', async () => {
    await teams.list({ user_id: 'u1' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/team/list',
      options: { query: { user_id: 'u1' } },
    });
  });

  it('list() defaults to no params', async () => {
    await teams.list();
    expect(request.mock.calls[0][0].path).toBe('/team/list');
  });

  it('addMember() / deleteMember() / updateMember()', async () => {
    await teams.addMember({ team_id: 't', member: [{ role: 'user', user_id: 'u' }] } as any);
    expect(request.mock.calls[0][0].path).toBe('/team/member_add');

    await teams.deleteMember({ team_id: 't', user_id: 'u' } as any);
    expect(request.mock.calls[1][0].path).toBe('/team/member_delete');

    await teams.updateMember({ team_id: 't', user_id: 'u', role: 'admin' } as any);
    expect(request.mock.calls[2][0].path).toBe('/team/member_update');
  });

  it('block() / unblock()', async () => {
    await teams.block({ team_id: 't' } as any);
    expect(request.mock.calls[0][0].path).toBe('/team/block');

    await teams.unblock({ team_id: 't' } as any);
    expect(request.mock.calls[1][0].path).toBe('/team/unblock');
  });

  it('listV2() and available()', async () => {
    await teams.listV2({ user_id: 'u' } as any);
    expect(request.mock.calls[0][0].path).toBe('/v2/team/list');

    await teams.listV2();
    expect(request.mock.calls[1][0].path).toBe('/v2/team/list');

    await teams.available();
    expect(request.mock.calls[2][0].path).toBe('/team/available');
  });

  it('bulkMemberAdd() POSTs to /team/bulk_member_add', async () => {
    await teams.bulkMemberAdd({ team_id: 't', member: [] } as any);
    expect(request.mock.calls[0][0].path).toBe('/team/bulk_member_add');
  });

  it('addModel() / deleteModel()', async () => {
    await teams.addModel({ team_id: 't', models: ['gpt-4o'] } as any);
    expect(request.mock.calls[0][0].path).toBe('/team/model/add');

    await teams.deleteModel({ team_id: 't', models: ['gpt-4o'] } as any);
    expect(request.mock.calls[1][0].path).toBe('/team/model/delete');
  });

  it('permissionsList() puts team_id into query', async () => {
    await teams.permissionsList({ team_id: 't1' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/team/permissions_list',
      options: { query: { team_id: 't1' } },
    });
  });

  it('permissionsUpdate() and permissionsBulkUpdate()', async () => {
    await teams.permissionsUpdate({ team_id: 't', permissions: [] } as any);
    expect(request.mock.calls[0][0].path).toBe('/team/permissions_update');

    await teams.permissionsBulkUpdate({ updates: [] } as any);
    expect(request.mock.calls[1][0].path).toBe('/team/permissions_bulk_update');
  });

  it('dailyActivity() forwards params via query', async () => {
    await teams.dailyActivity({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[0][0].path).toBe('/team/daily/activity');
  });

  it('addCallback() encodes team_id and excludes it from body', async () => {
    await teams.addCallback({ team_id: 't a', callback_name: 'webhook' } as any);
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe(`/team/${encodeURIComponent('t a')}/callback`);
    expect(arg.body.value).toEqual({ callback_name: 'webhook' });
  });

  it('getCallback() / disableLogging() / myMembership()', async () => {
    await teams.getCallback('t1');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/team/t1/callback',
    });

    await teams.disableLogging('t1');
    expect(request.mock.calls[1][0]).toMatchObject({
      method: 'POST',
      path: '/team/t1/disable_logging',
    });

    await teams.myMembership('t1');
    expect(request.mock.calls[2][0]).toMatchObject({
      method: 'GET',
      path: '/team/t1/members/me',
    });
  });
});
