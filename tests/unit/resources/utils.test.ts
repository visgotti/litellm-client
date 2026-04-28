/**
 * @group unit
 */
import { UtilsResource } from '../../../src/resources/utils';
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

describe('UtilsResource', () => {
  it('tokenCounter -> POST /utils/token_counter', async () => {
    const { request, calls } = createMock({
      total_tokens: 42,
      request_model: 'gpt-4',
      model_used: 'gpt-4',
      tokenizer_type: 'tiktoken',
    });
    const res = new UtilsResource(request);
    const out = await res.tokenCounter({ model: 'gpt-4', prompt: 'hello' });
    expect(calls[0].method).toBe('POST');
    expect(calls[0].path).toBe('/utils/token_counter');
    expect(calls[0].body).toEqual({ kind: 'json', value: { model: 'gpt-4', prompt: 'hello' } });
    expect(out.total_tokens).toBe(42);
  });

  it('transformRequest -> POST /utils/transform_request', async () => {
    const { request, calls } = createMock({ raw_request_body: { x: 1 } });
    const res = new UtilsResource(request);
    await res.transformRequest({
      call_type: 'completion',
      request_body: { model: 'gpt-4', messages: [] },
    });
    expect(calls[0].method).toBe('POST');
    expect(calls[0].path).toBe('/utils/transform_request');
    expect(calls[0].body).toEqual({
      kind: 'json',
      value: { call_type: 'completion', request_body: { model: 'gpt-4', messages: [] } },
    });
  });

  it('supportedOpenAiParams -> GET /utils/supported_openai_params with query', async () => {
    const { request, calls } = createMock({ supported_openai_params: ['temperature'] });
    const res = new UtilsResource(request);
    await res.supportedOpenAiParams({ model: 'gpt-4', custom_llm_provider: 'openai' });
    expect(calls[0].method).toBe('GET');
    expect(calls[0].path).toBe('/utils/supported_openai_params');
    expect(calls[0].options?.query).toEqual({ model: 'gpt-4', custom_llm_provider: 'openai' });
    expect(calls[0].body).toBeUndefined();
  });

  it('routes -> GET /routes', async () => {
    const { request, calls } = createMock({ routes: [] });
    const res = new UtilsResource(request);
    await res.routes();
    expect(calls[0].method).toBe('GET');
    expect(calls[0].path).toBe('/routes');
    expect(calls[0].body).toBeUndefined();
  });

  it('availableRoutes -> GET /utils/available_routes', async () => {
    const { request, calls } = createMock({ routes: [] });
    const res = new UtilsResource(request);
    await res.availableRoutes();
    expect(calls[0].method).toBe('GET');
    expect(calls[0].path).toBe('/utils/available_routes');
    expect(calls[0].body).toBeUndefined();
  });
});
