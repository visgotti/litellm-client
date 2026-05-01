/**
 * @group unit
 */
import { CacheResource } from '../../../src/resources/cache';
import type { InternalRequestParams, RequestFn } from '../../../src/client';

function createMock(returnValue: unknown = {}): {
  request: RequestFn;
  calls: InternalRequestParams[];
} {
  const calls: InternalRequestParams[] = [];
  const request: RequestFn = jest.fn(async (params: InternalRequestParams) => {
    calls.push(params);
    return returnValue as never;
  }) as unknown as RequestFn;
  return { request, calls };
}

describe('CacheResource', () => {
  it('delete -> POST /cache/delete', async () => {
    const { request, calls } = createMock({ status: 'success' });
    await new CacheResource(request).delete({ keys: ['k1', 'k2'] });
    expect(calls[0].method).toBe('POST');
    expect(calls[0].path).toBe('/cache/delete');
    expect(calls[0].body).toEqual({ kind: 'json', value: { keys: ['k1', 'k2'] } });
  });

  it('flushAll -> POST /cache/flushall', async () => {
    const { request, calls } = createMock({ status: 'success' });
    await new CacheResource(request).flushAll();
    expect(calls[0].method).toBe('POST');
    expect(calls[0].path).toBe('/cache/flushall');
    expect(calls[0].body).toBeUndefined();
  });

  it('ping -> GET /cache/ping', async () => {
    const { request, calls } = createMock({ status: 'healthy' });
    await new CacheResource(request).ping();
    expect(calls[0].method).toBe('GET');
    expect(calls[0].path).toBe('/cache/ping');
    expect(calls[0].body).toBeUndefined();
  });

  it('redisInfo -> GET /cache/redis/info', async () => {
    const { request, calls } = createMock({ redis_version: '7.0.0' });
    await new CacheResource(request).redisInfo();
    expect(calls[0].method).toBe('GET');
    expect(calls[0].path).toBe('/cache/redis/info');
  });

  it('settings.get -> GET /cache/settings', async () => {
    const { request, calls } = createMock({
      fields: [],
      current_values: {},
      redis_type_descriptions: {},
    });
    const out = await new CacheResource(request).settings.get();
    expect(calls[0].method).toBe('GET');
    expect(calls[0].path).toBe('/cache/settings');
    expect(out.fields).toEqual([]);
  });

  it('settings.update -> POST /cache/settings', async () => {
    const { request, calls } = createMock({
      message: 'Cache settings updated successfully',
      status: 'success',
      settings: { type: 'redis' },
    });
    await new CacheResource(request).settings.update({ cache_settings: { type: 'redis' } });
    expect(calls[0].method).toBe('POST');
    expect(calls[0].path).toBe('/cache/settings');
    expect(calls[0].body).toEqual({
      kind: 'json',
      value: { cache_settings: { type: 'redis' } },
    });
  });

  it('settings.test -> POST /cache/settings/test', async () => {
    const { request, calls } = createMock({ status: 'success', message: 'connected' });
    await new CacheResource(request).settings.test({ cache_settings: { type: 'redis' } });
    expect(calls[0].method).toBe('POST');
    expect(calls[0].path).toBe('/cache/settings/test');
    expect(calls[0].body).toEqual({
      kind: 'json',
      value: { cache_settings: { type: 'redis' } },
    });
  });
});
