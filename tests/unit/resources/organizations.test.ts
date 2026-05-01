/**
 * @group unit
 */
import { OrganizationsResource } from '../../../src/resources/organizations';

describe('OrganizationsResource', () => {
  let request: jest.Mock;
  let r: OrganizationsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new OrganizationsResource(request as any);
  });

  it('create POSTs /organization/new', async () => {
    await r.create({ organization_alias: 'acme', models: ['gpt-4'], max_budget: 100 });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/organization/new',
        body: {
          kind: 'json',
          value: { organization_alias: 'acme', models: ['gpt-4'], max_budget: 100 },
        },
      }),
    );
  });

  it('update PATCHes /organization/update', async () => {
    await r.update({ organization_id: 'org_1', organization_alias: 'renamed' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        path: '/organization/update',
        body: {
          kind: 'json',
          value: { organization_id: 'org_1', organization_alias: 'renamed' },
        },
      }),
    );
  });

  it('delete DELETEs /organization/delete', async () => {
    await r.delete({ organization_ids: ['a', 'b'] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/organization/delete',
        body: { kind: 'json', value: { organization_ids: ['a', 'b'] } },
      }),
    );
  });

  it('list GETs /organization/list with query params', async () => {
    await r.list({ org_alias: 'acme' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/organization/list');
    expect(arg.options.query).toEqual({ org_alias: 'acme' });
  });

  it('list with no params still sends GET', async () => {
    await r.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/organization/list' }),
    );
  });

  it('info GETs /organization/info with organization_id query', async () => {
    await r.info('org_42');
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/organization/info');
    expect(arg.options.query).toEqual({ organization_id: 'org_42' });
  });

  it('infoLegacy POSTs /organization/info', async () => {
    await r.infoLegacy({ organizations: ['a', 'b'] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/organization/info',
        body: { kind: 'json', value: { organizations: ['a', 'b'] } },
      }),
    );
  });

  it('addMember POSTs /organization/member_add', async () => {
    await r.addMember({
      organization_id: 'org_1',
      member: { role: 'internal_user', user_id: 'u1' },
      max_budget_in_organization: 50,
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/organization/member_add',
        body: {
          kind: 'json',
          value: {
            organization_id: 'org_1',
            member: { role: 'internal_user', user_id: 'u1' },
            max_budget_in_organization: 50,
          },
        },
      }),
    );
  });

  it('updateMember PATCHes /organization/member_update', async () => {
    await r.updateMember({ organization_id: 'org_1', user_id: 'u1', role: 'org_admin' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        path: '/organization/member_update',
        body: {
          kind: 'json',
          value: { organization_id: 'org_1', user_id: 'u1', role: 'org_admin' },
        },
      }),
    );
  });

  it('deleteMember DELETEs /organization/member_delete', async () => {
    await r.deleteMember({ organization_id: 'org_1', user_email: 'u@x.com' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/organization/member_delete',
        body: {
          kind: 'json',
          value: { organization_id: 'org_1', user_email: 'u@x.com' },
        },
      }),
    );
  });

  it('dailyActivity works with no params (default {})', async () => {
    await r.dailyActivity();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/organization/daily/activity');
    expect(arg.options.query).toEqual({});
  });

  it('dailyActivity GETs /organization/daily/activity with query params', async () => {
    await r.dailyActivity({
      organization_ids: 'org_1,org_2',
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      page: 1,
      page_size: 50,
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/organization/daily/activity');
    expect(arg.options.query).toEqual({
      organization_ids: 'org_1,org_2',
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      page: 1,
      page_size: 50,
    });
  });
});
