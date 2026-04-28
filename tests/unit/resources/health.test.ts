/**
 * @group unit
 */
import { HealthResource } from '../../../src/resources/health';

describe('HealthResource', () => {
  let request: jest.Mock;
  let health: HealthResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    health = new HealthResource(request as any);
  });

  it('check() / liveness() / liveliness() (alias) / readiness()', async () => {
    await health.check();
    expect(request.mock.calls[0][0]).toMatchObject({ method: 'GET', path: '/health' });

    await health.liveness();
    expect(request.mock.calls[1][0].path).toBe('/health/liveliness');

    await health.liveliness();
    expect(request.mock.calls[2][0].path).toBe('/health/liveliness');

    await health.readiness();
    expect(request.mock.calls[3][0].path).toBe('/health/readiness');
  });

  it('services() puts service in query', async () => {
    await health.services('db');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/health/services',
      options: { query: { service: 'db' } },
    });
  });

  it('backlog() / license() / history() / latest() / sharedStatus()', async () => {
    await health.backlog();
    expect(request.mock.calls[0][0].path).toBe('/health/backlog');

    await health.license();
    expect(request.mock.calls[1][0].path).toBe('/health/license');

    await health.history();
    expect(request.mock.calls[2][0].path).toBe('/health/history');

    await health.latest();
    expect(request.mock.calls[3][0].path).toBe('/health/latest');

    await health.sharedStatus();
    expect(request.mock.calls[4][0].path).toBe('/health/shared-status');
  });

  it('testConnection() POSTs to /health/test_connection', async () => {
    await health.testConnection({ model: 'gpt-4o' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/health/test_connection',
      body: { kind: 'json', value: { model: 'gpt-4o' } },
    });
  });

  it('test() / settings()', async () => {
    await health.test();
    expect(request.mock.calls[0][0]).toMatchObject({ method: 'GET', path: '/test' });

    await health.settings();
    expect(request.mock.calls[1][0].path).toBe('/settings');
  });
});
