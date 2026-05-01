/**
 * @group unit
 */
import { ComplianceResource } from '../../../src/resources/compliance';
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

describe('ComplianceResource', () => {
  it('euAiAct -> POST /compliance/eu-ai-act', async () => {
    const { request, calls } = createMock({ compliant: true, regulation: 'EU_AI_ACT', checks: [] });
    const res = new ComplianceResource(request);
    const out = await res.euAiAct({ request_id: 'req-1', user_id: 'u', model: 'gpt-4' });
    expect(calls[0].method).toBe('POST');
    expect(calls[0].path).toBe('/compliance/eu-ai-act');
    expect(calls[0].body).toEqual({
      kind: 'json',
      value: { request_id: 'req-1', user_id: 'u', model: 'gpt-4' },
    });
    expect(out.compliant).toBe(true);
  });

  it('gdpr -> POST /compliance/gdpr', async () => {
    const { request, calls } = createMock({ compliant: false, regulation: 'GDPR', checks: [] });
    const res = new ComplianceResource(request);
    const out = await res.gdpr({ request_id: 'req-2' });
    expect(calls[0].method).toBe('POST');
    expect(calls[0].path).toBe('/compliance/gdpr');
    expect(calls[0].body).toEqual({ kind: 'json', value: { request_id: 'req-2' } });
    expect(out.regulation).toBe('GDPR');
  });
});
