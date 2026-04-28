/**
 * @group unit
 */
import { CostResource } from '../../../src/resources/cost';
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

describe('CostResource', () => {
  it('estimate -> POST /cost/estimate', async () => {
    const { request, calls } = createMock({
      model: 'gpt-4',
      input_tokens: 100,
      output_tokens: 50,
      cost_per_request: 0.01,
      input_cost_per_request: 0.005,
      output_cost_per_request: 0.005,
      margin_cost_per_request: 0,
    });
    const res = new CostResource(request);
    const out = await res.estimate({ model: 'gpt-4', input_tokens: 100, output_tokens: 50 });
    expect(calls[0].method).toBe('POST');
    expect(calls[0].path).toBe('/cost/estimate');
    expect(calls[0].body).toEqual({
      kind: 'json',
      value: { model: 'gpt-4', input_tokens: 100, output_tokens: 50 },
    });
    expect(out.cost_per_request).toBe(0.01);
  });

  it('discountConfig.get -> GET /config/cost_discount_config', async () => {
    const { request, calls } = createMock({ values: { openai: 0.1 } });
    const out = await new CostResource(request).discountConfig.get();
    expect(calls[0].method).toBe('GET');
    expect(calls[0].path).toBe('/config/cost_discount_config');
    expect(out.values.openai).toBe(0.1);
  });

  it('discountConfig.update -> PATCH /config/cost_discount_config', async () => {
    const { request, calls } = createMock({
      message: 'ok',
      status: 'success',
      values: { openai: 0.2 },
    });
    await new CostResource(request).discountConfig.update({ openai: 0.2 });
    expect(calls[0].method).toBe('PATCH');
    expect(calls[0].path).toBe('/config/cost_discount_config');
    expect(calls[0].body).toEqual({ kind: 'json', value: { openai: 0.2 } });
  });

  it('marginConfig.get -> GET /config/cost_margin_config', async () => {
    const { request, calls } = createMock({ values: { openai: 0.05 } });
    const out = await new CostResource(request).marginConfig.get();
    expect(calls[0].method).toBe('GET');
    expect(calls[0].path).toBe('/config/cost_margin_config');
    expect(out.values).toBeDefined();
  });

  it('marginConfig.update -> PATCH /config/cost_margin_config', async () => {
    const { request, calls } = createMock({
      message: 'ok',
      status: 'success',
      values: { openai: 0.05 },
    });
    await new CostResource(request).marginConfig.update({ openai: 0.05 });
    expect(calls[0].method).toBe('PATCH');
    expect(calls[0].path).toBe('/config/cost_margin_config');
    expect(calls[0].body).toEqual({ kind: 'json', value: { openai: 0.05 } });
  });
});
