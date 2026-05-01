/**
 * @group unit
 */
import { UnifiedAccessGroupsResource } from '../../../src/resources/unified_access_groups';

describe('UnifiedAccessGroupsResource', () => {
  let request: jest.Mock;
  let groups: UnifiedAccessGroupsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    groups = new UnifiedAccessGroupsResource(request as any);
  });

  it('list() GETs /v1/unified_access_group', async () => {
    await groups.list();
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/v1/unified_access_group',
    });
  });

  it('list() forwards filters as query params', async () => {
    await groups.list({ access_group_name: 'rag-team' });
    expect(request.mock.calls[0][0].options.query).toMatchObject({
      access_group_name: 'rag-team',
    });
  });

  it('create() POSTs JSON body to /v1/unified_access_group', async () => {
    await groups.create({ access_group_name: 'rag', models: ['gpt-4'] });
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/unified_access_group',
      body: { kind: 'json', value: { access_group_name: 'rag', models: ['gpt-4'] } },
    });
  });

  it('retrieve() encodes the id', async () => {
    await groups.retrieve('rag team');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/v1/unified_access_group/rag%20team',
    });
  });

  it('update() PUTs JSON body to /v1/unified_access_group/{id}', async () => {
    await groups.update('id1', { models: ['gpt-4o'] });
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'PUT',
      path: '/v1/unified_access_group/id1',
      body: { kind: 'json', value: { models: ['gpt-4o'] } },
    });
  });

  it('delete() DELETEs /v1/unified_access_group/{id}', async () => {
    await groups.delete('id1');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'DELETE',
      path: '/v1/unified_access_group/id1',
    });
  });
});
