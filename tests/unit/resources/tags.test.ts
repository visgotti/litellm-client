/**
 * @group unit
 */
import { TagsResource } from '../../../src/resources/tags';

describe('TagsResource', () => {
  let request: jest.Mock;
  let r: TagsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new TagsResource(request as any);
  });

  it('create POSTs /tag/new', async () => {
    await r.create({ name: 'prod', description: 'production', models: ['gpt-4'] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/tag/new',
        body: {
          kind: 'json',
          value: { name: 'prod', description: 'production', models: ['gpt-4'] },
        },
      }),
    );
  });

  it('update POSTs /tag/update', async () => {
    await r.update({ name: 'prod', description: 'updated' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/tag/update',
        body: { kind: 'json', value: { name: 'prod', description: 'updated' } },
      }),
    );
  });

  it('info POSTs /tag/info', async () => {
    await r.info({ names: ['a', 'b'] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/tag/info',
        body: { kind: 'json', value: { names: ['a', 'b'] } },
      }),
    );
  });

  it('delete POSTs /tag/delete', async () => {
    await r.delete({ name: 'prod' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/tag/delete',
        body: { kind: 'json', value: { name: 'prod' } },
      }),
    );
  });

  it('list GETs /tag/list', async () => {
    await r.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/tag/list' }),
    );
  });

  it('dailyActivity GETs /tag/daily/activity with query params', async () => {
    await r.dailyActivity({
      tags: 'a,b',
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      page: 2,
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/tag/daily/activity');
    expect(arg.options.query).toEqual({
      tags: 'a,b',
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      page: 2,
    });
  });

  it('distinct GETs /tag/distinct', async () => {
    await r.distinct();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/tag/distinct' }),
    );
  });

  it('dau GETs /tag/dau and joins tag_filters', async () => {
    await r.dau({ tag_filters: ['x', 'y'] });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/tag/dau');
    expect(arg.options.query).toEqual({ tag_filters: 'x,y' });
  });

  it('wau GETs /tag/wau with tag_filter', async () => {
    await r.wau({ tag_filter: 'q' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/tag/wau');
    expect(arg.options.query).toEqual({ tag_filter: 'q' });
  });

  it('mau GETs /tag/mau with no params', async () => {
    await r.mau();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/tag/mau' }),
    );
  });

  it('summary GETs /tag/summary with required dates', async () => {
    await r.summary({
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      tag_filters: ['x', 'y'],
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/tag/summary');
    expect(arg.options.query).toEqual({
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      tag_filters: 'x,y',
    });
  });

  it('userAgentPerUserAnalytics GETs /tag/user-agent/per-user-analytics with query params', async () => {
    await r.userAgentPerUserAnalytics({ tag_filter: 'curl', page: 1, page_size: 50 });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/tag/user-agent/per-user-analytics');
    expect(arg.options.query).toEqual({ tag_filter: 'curl', page: 1, page_size: 50 });
  });
});
