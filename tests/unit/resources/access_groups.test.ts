/**
 * @group unit
 */
import { AccessGroupsResource } from '../../../src/resources/access_groups';

describe('AccessGroupsResource', () => {
  let request: jest.Mock;
  let r: AccessGroupsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new AccessGroupsResource(request as any);
  });

  // ── /v1/access_group CRUD ──────────────────────────────────────────────

  it('create POSTs /v1/access_group', async () => {
    await r.create({ access_group_name: 'platform' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/access_group',
        body: { kind: 'json', value: { access_group_name: 'platform' } },
      }),
    );
  });

  it('list GETs /v1/access_group', async () => {
    await r.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/v1/access_group' }),
    );
  });

  it('retrieve GETs /v1/access_group/{id}', async () => {
    await r.retrieve('ag-1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/v1/access_group/ag-1',
      }),
    );
  });

  it('retrieve percent-encodes the id', async () => {
    await r.retrieve('grp/space');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/v1/access_group/grp%2Fspace',
      }),
    );
  });

  it('update PUTs /v1/access_group/{id}', async () => {
    await r.update('ag-1', { description: 'updated' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/v1/access_group/ag-1',
        body: { kind: 'json', value: { description: 'updated' } },
      }),
    );
  });

  it('delete DELETEs /v1/access_group/{id}', async () => {
    await r.delete('ag-1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/v1/access_group/ag-1',
      }),
    );
  });

  // ── /access_group/* model-scoped ───────────────────────────────────────

  it('models.create POSTs /access_group/new', async () => {
    await r.models.create({ access_group: 'prod', model_names: ['gpt-4'] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/access_group/new',
        body: {
          kind: 'json',
          value: { access_group: 'prod', model_names: ['gpt-4'] },
        },
      }),
    );
  });

  it('models.list GETs /access_group/list', async () => {
    await r.models.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/access_group/list' }),
    );
  });

  it('models.info GETs /access_group/{name}/info', async () => {
    await r.models.info('prod');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/access_group/prod/info',
      }),
    );
  });

  it('models.update PUTs /access_group/{name}/update', async () => {
    await r.models.update('prod', { model_names: ['gpt-4o'] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/access_group/prod/update',
        body: { kind: 'json', value: { model_names: ['gpt-4o'] } },
      }),
    );
  });

  it('models.delete DELETEs /access_group/{name}/delete', async () => {
    await r.models.delete('prod');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/access_group/prod/delete',
      }),
    );
  });
});
