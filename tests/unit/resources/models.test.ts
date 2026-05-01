/**
 * @group unit
 */
import { ModelsResource } from '../../../src/resources/models';

describe('ModelsResource', () => {
  let request: jest.Mock;
  let models: ModelsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    models = new ModelsResource(request as any);
  });

  it('list() / info() / infoV2() / groupInfo()', async () => {
    await models.list();
    expect(request.mock.calls[0][0]).toMatchObject({ method: 'GET', path: '/v1/models' });

    await models.info();
    expect(request.mock.calls[1][0].path).toBe('/model/info');

    await models.infoV2();
    expect(request.mock.calls[2][0].path).toBe('/v2/model/info');

    await models.groupInfo();
    expect(request.mock.calls[3][0].path).toBe('/model_group/info');
  });

  it('create() / update() / patchUpdate() / delete()', async () => {
    await models.create({ model_name: 'gpt-4o', litellm_params: { model: 'gpt-4o' } } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/model/new',
    });

    await models.update({ model_name: 'gpt-4o' } as any);
    expect(request.mock.calls[1][0].path).toBe('/model/update');

    await models.patchUpdate('mid a', { model_name: 'gpt-4o' } as any);
    expect(request.mock.calls[2][0]).toMatchObject({
      method: 'PATCH',
      path: `/model/${encodeURIComponent('mid a')}/update`,
    });

    await models.delete({ id: 'mid' } as any);
    expect(request.mock.calls[3][0].path).toBe('/model/delete');
  });

  it('settings() / metrics() / streamingMetrics() / slowResponses() / exceptions()', async () => {
    await models.settings();
    expect(request.mock.calls[0][0].path).toBe('/model/settings');

    await models.metrics();
    expect(request.mock.calls[1][0].path).toBe('/model/metrics');

    await models.streamingMetrics();
    expect(request.mock.calls[2][0].path).toBe('/model/streaming_metrics');

    await models.slowResponses();
    expect(request.mock.calls[3][0].path).toBe('/model/metrics/slow_responses');

    await models.exceptions();
    expect(request.mock.calls[4][0].path).toBe('/model/metrics/exceptions');
  });

  it('makeGroupPublic() / updateModelHubLinks()', async () => {
    await models.makeGroupPublic({ model_groups: ['gpt-4o'] } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/model_group/make_public',
    });

    await models.updateModelHubLinks({ links: [] } as any);
    expect(request.mock.calls[1][0]).toMatchObject({
      method: 'POST',
      path: '/model_hub/update_useful_links',
    });
  });

  it('cost-map endpoints', async () => {
    await models.costMapSource();
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/model/cost_map/source',
    });

    await models.reloadCostMap();
    expect(request.mock.calls[1][0]).toMatchObject({
      method: 'POST',
      path: '/reload/model_cost_map',
    });

    await models.scheduleCostMapReload({ cron: '0 0 * * *' } as any);
    expect(request.mock.calls[2][0]).toMatchObject({
      method: 'POST',
      path: '/schedule/model_cost_map_reload',
    });

    await models.cancelScheduledCostMapReload();
    expect(request.mock.calls[3][0]).toMatchObject({
      method: 'DELETE',
      path: '/schedule/model_cost_map_reload',
    });

    await models.costMapReloadStatus();
    expect(request.mock.calls[4][0]).toMatchObject({
      method: 'GET',
      path: '/schedule/model_cost_map_reload/status',
    });
  });
});
