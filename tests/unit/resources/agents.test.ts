/**
 * @group unit
 */
import { AgentsResource } from '../../../src/resources/agents';

describe('AgentsResource', () => {
  let request: jest.Mock;
  let r: AgentsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new AgentsResource(request as any);
  });

  it('list GETs /v1/agents with health_check query', async () => {
    await r.list({ health_check: true });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/agents');
    expect(arg.options.query).toEqual({ health_check: true });
  });

  it('create POSTs /v1/agents', async () => {
    const params = {
      agent_name: 'hello-world',
      agent_card_params: {
        protocolVersion: '1.0',
        name: 'Hello World Agent',
        description: 'just hello world',
        url: 'http://localhost:9999/',
        version: '1.0.0',
        capabilities: { streaming: true },
        defaultInputModes: ['text'],
        defaultOutputModes: ['text'],
        skills: [],
      },
      litellm_params: { make_public: true },
    };
    await r.create(params as any);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/agents',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('retrieve GETs /v1/agents/{id} with encoded id', async () => {
    await r.retrieve('agent id/1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/v1/agents/agent%20id%2F1',
      }),
    );
  });

  it('update PUTs /v1/agents/{id}', async () => {
    await r.update('a1', {
      agent_name: 'updated',
      agent_card_params: {
        protocolVersion: '1.0',
        name: 'X',
        description: 'd',
        url: 'http://x',
        version: '1',
        capabilities: {},
        defaultInputModes: [],
        defaultOutputModes: [],
        skills: [],
      },
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('PUT');
    expect(arg.path).toBe('/v1/agents/a1');
    expect(arg.body.value.agent_name).toBe('updated');
  });

  it('patch PATCHes /v1/agents/{id} with partial body', async () => {
    await r.patch('a1', { litellm_params: { make_public: false } });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        path: '/v1/agents/a1',
        body: { kind: 'json', value: { litellm_params: { make_public: false } } },
      }),
    );
  });

  it('delete DELETEs /v1/agents/{id}', async () => {
    await r.delete('a1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', path: '/v1/agents/a1' }),
    );
  });

  it('makePublic POSTs /v1/agents/{id}/make_public', async () => {
    await r.makePublic('a1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/agents/a1/make_public',
      }),
    );
  });

  it('makePublicBulk POSTs /v1/agents/make_public', async () => {
    await r.makePublicBulk({ agent_ids: ['a1', 'a2'] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/agents/make_public',
        body: { kind: 'json', value: { agent_ids: ['a1', 'a2'] } },
      }),
    );
  });

  it('list works with no params (default {})', async () => {
    await r.list();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/agents');
    expect(arg.options.query).toEqual({});
  });

  it('dailyActivity works with no params (default {})', async () => {
    await r.dailyActivity();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/agent/daily/activity');
    expect(arg.options.query).toEqual({});
  });

  it('dailyActivity GETs /agent/daily/activity with query params', async () => {
    await r.dailyActivity({
      agent_ids: 'a1,a2',
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      page: 2,
      page_size: 50,
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/agent/daily/activity');
    expect(arg.options.query).toEqual({
      agent_ids: 'a1,a2',
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      page: 2,
      page_size: 50,
    });
  });
});
