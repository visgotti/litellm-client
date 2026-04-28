/**
 * @group unit
 */
import { SpendResource } from '../../../src/resources/spend';

describe('SpendResource', () => {
  let request: jest.Mock;
  let spend: SpendResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    spend = new SpendResource(request as any);
  });

  it('logs() forwards params via query', async () => {
    await spend.logs({ start_date: '2026-01-01', end_date: '2026-01-31' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/spend/logs');
    expect(arg.options.query).toEqual({
      start_date: '2026-01-01',
      end_date: '2026-01-31',
    });
  });

  it('logs() with no params still works', async () => {
    await spend.logs();
    expect(request.mock.calls[0][0].path).toBe('/spend/logs');
  });

  it('byTags() joins tags array with comma', async () => {
    await spend.byTags({
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      tags: ['a', 'b', 'c'],
    });
    const arg = request.mock.calls[0][0];
    expect(arg.path).toBe('/spend/tags');
    expect(arg.options.query).toEqual({
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      tags: 'a,b,c',
    });
  });

  it('byTags() with no params', async () => {
    await spend.byTags();
    expect(request.mock.calls[0][0].path).toBe('/spend/tags');
  });

  it('global() -> /global/spend', async () => {
    await spend.global();
    expect(request.mock.calls[0][0]).toMatchObject({ method: 'GET', path: '/global/spend' });
  });

  it('globalKeys() -> /global/spend/keys', async () => {
    await spend.globalKeys();
    expect(request.mock.calls[0][0].path).toBe('/global/spend/keys');
  });

  it('globalUsers() -> /global/spend/users', async () => {
    await spend.globalUsers();
    expect(request.mock.calls[0][0].path).toBe('/global/spend/users');
  });

  it('globalModels() -> /global/spend/models', async () => {
    await spend.globalModels();
    expect(request.mock.calls[0][0].path).toBe('/global/spend/models');
  });

  it('globalEndUsers() -> /global/spend/end_users', async () => {
    await spend.globalEndUsers();
    expect(request.mock.calls[0][0].path).toBe('/global/spend/end_users');
  });

  it('globalTeams() -> /global/spend/teams', async () => {
    await spend.globalTeams();
    expect(request.mock.calls[0][0].path).toBe('/global/spend/teams');
  });

  it('calculate() POSTs body to /spend/calculate', async () => {
    await spend.calculate({ model: 'gpt-4o', messages: [{ role: 'user', content: 'hi' }] });
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/spend/calculate',
      body: {
        kind: 'json',
        value: { model: 'gpt-4o', messages: [{ role: 'user', content: 'hi' }] },
      },
    });
  });

  it('calculate() with no params defaults to {}', async () => {
    await spend.calculate();
    expect(request.mock.calls[0][0].body.value).toEqual({});
  });

  it('userDailyActivity() forwards params via query', async () => {
    await spend.userDailyActivity({ start_date: '2026-01-01', end_date: '2026-01-31' } as any);
    expect(request.mock.calls[0][0].path).toBe('/user/daily/activity');
  });

  it('dailyActivity() forwards params via query', async () => {
    await spend.dailyActivity({ start_date: '2026-01-01', end_date: '2026-01-31' } as any);
    expect(request.mock.calls[0][0].path).toBe('/daily/activity');
  });

  it('keys() forwards params via query', async () => {
    await spend.keys({ api_key: 'sk-x' } as any);
    expect(request.mock.calls[0][0].options.query).toEqual({ api_key: 'sk-x' });
  });

  it('users() forwards params via query', async () => {
    await spend.users({ user_id: 'u' } as any);
    expect(request.mock.calls[0][0].options.query).toEqual({ user_id: 'u' });
  });

  it('logsV2(), logsUi(), logsSessionUi() target their paths', async () => {
    await spend.logsV2({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[0][0].path).toBe('/spend/logs/v2');

    await spend.logsUi({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[1][0].path).toBe('/spend/logs/ui');

    await spend.logsSessionUi({ session_id: 's' } as any);
    expect(request.mock.calls[2][0].path).toBe('/spend/logs/session/ui');
  });

  it('logUi() encodes id', async () => {
    await spend.logUi('req a/b');
    expect(request.mock.calls[0][0].path).toBe(
      `/spend/logs/ui/${encodeURIComponent('req a/b')}`,
    );
  });

  it('globalLogs(), globalProvider(), globalReport()', async () => {
    await spend.globalLogs({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[0][0].path).toBe('/global/spend/logs');

    await spend.globalProvider({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[1][0].path).toBe('/global/spend/provider');

    await spend.globalReport({ start_date: '2026-01-01', end_date: '2026-01-31' } as any);
    expect(request.mock.calls[2][0].path).toBe('/global/spend/report');
  });

  it('globalAllTagNames(), globalReset(), globalRefresh(), globalAllEndUsers()', async () => {
    await spend.globalAllTagNames();
    expect(request.mock.calls[0][0].path).toBe('/global/spend/all_tag_names');

    await spend.globalReset();
    expect(request.mock.calls[1][0]).toMatchObject({
      method: 'POST',
      path: '/global/spend/reset',
    });

    await spend.globalRefresh();
    expect(request.mock.calls[2][0]).toMatchObject({
      method: 'POST',
      path: '/global/spend/refresh',
    });

    await spend.globalAllEndUsers();
    expect(request.mock.calls[3][0].path).toBe('/global/all_end_users');
  });

  it('activity / activityByModel / activityExceptions / activityExceptionsByDeployment / activityCacheHits', async () => {
    await spend.activity({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[0][0].path).toBe('/global/activity');

    await spend.activityByModel({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[1][0].path).toBe('/global/activity/model');

    await spend.activityExceptions({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[2][0].path).toBe('/global/activity/exceptions');

    await spend.activityExceptionsByDeployment({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[3][0].path).toBe(
      '/global/activity/exceptions/deployment',
    );

    await spend.activityCacheHits({ start_date: '2026-01-01' } as any);
    expect(request.mock.calls[4][0].path).toBe('/global/activity/cache_hits');
  });

  it('all GET endpoints with no-arg overloads also work', async () => {
    await spend.activity();
    await spend.activityByModel();
    await spend.activityExceptions();
    await spend.activityExceptionsByDeployment();
    await spend.activityCacheHits();
    await spend.logsV2();
    await spend.logsUi();
    await spend.logsSessionUi();
    await spend.globalLogs();
    await spend.globalProvider();
    await spend.keys();
    await spend.users();
    expect(request.mock.calls.length).toBe(12);
  });
});
