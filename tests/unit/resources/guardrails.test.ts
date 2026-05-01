/**
 * @group unit
 */
import { GuardrailsResource } from '../../../src/resources/guardrails';

describe('GuardrailsResource', () => {
  let request: jest.Mock;
  let r: GuardrailsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new GuardrailsResource(request as any);
  });

  it('list GETs /guardrails/list', async () => {
    await r.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/guardrails/list' }),
    );
  });

  it('listV2 GETs /v2/guardrails/list', async () => {
    await r.listV2();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/v2/guardrails/list' }),
    );
  });

  it('create POSTs /guardrails with body', async () => {
    const params = {
      guardrail: {
        guardrail_name: 'my-guard',
        litellm_params: { guardrail: 'bedrock' as const, mode: 'pre_call' },
      },
    };
    await r.create(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/guardrails',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('update PUTs /guardrails/{id} with encoded id', async () => {
    const params = {
      guardrail: {
        guardrail_name: 'g',
        litellm_params: { guardrail: 'bedrock' as const, mode: 'pre_call' },
      },
    };
    await r.update('id with space', params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/guardrails/id%20with%20space',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('patch PATCHes /guardrails/{id} with body', async () => {
    await r.patch('abc', { guardrail_name: 'new' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        path: '/guardrails/abc',
        body: { kind: 'json', value: { guardrail_name: 'new' } },
      }),
    );
  });

  it('delete DELETEs /guardrails/{id}', async () => {
    await r.delete('id/slash');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/guardrails/id%2Fslash',
      }),
    );
  });

  it('retrieve GETs /guardrails/{id}', async () => {
    await r.retrieve('abc');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/guardrails/abc' }),
    );
  });

  it('info GETs /guardrails/{id}/info', async () => {
    await r.info('abc');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/guardrails/abc/info' }),
    );
  });

  it('register POSTs /guardrails/register', async () => {
    const params = {
      guardrail_name: 'g',
      litellm_params: { guardrail: 'generic_guardrail_api', mode: 'pre_call' },
    };
    await r.register(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/guardrails/register',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('listSubmissions GETs /guardrails/submissions with query', async () => {
    await r.listSubmissions({ status: 'pending_review', team_id: 't1' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/guardrails/submissions');
    expect(arg.options.query).toEqual({ status: 'pending_review', team_id: 't1' });
  });

  it('listSubmissions GETs /guardrails/submissions with no params', async () => {
    await r.listSubmissions();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/guardrails/submissions' }),
    );
  });

  it('retrieveSubmission GETs /guardrails/submissions/{id}', async () => {
    await r.retrieveSubmission('s1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/guardrails/submissions/s1',
      }),
    );
  });

  it('approveSubmission POSTs /guardrails/submissions/{id}/approve', async () => {
    await r.approveSubmission('s1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/guardrails/submissions/s1/approve',
      }),
    );
  });

  it('rejectSubmission POSTs /guardrails/submissions/{id}/reject', async () => {
    await r.rejectSubmission('s1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/guardrails/submissions/s1/reject',
      }),
    );
  });

  it('uiSettings GETs /guardrails/ui/add_guardrail_settings', async () => {
    await r.uiSettings();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/guardrails/ui/add_guardrail_settings',
      }),
    );
  });

  it('uiCategoryYaml GETs /guardrails/ui/category_yaml/{category}', async () => {
    await r.uiCategoryYaml('bias_gender');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/guardrails/ui/category_yaml/bias_gender',
      }),
    );
  });

  it('uiMajorAirlines GETs /guardrails/ui/major_airlines', async () => {
    await r.uiMajorAirlines();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/guardrails/ui/major_airlines',
      }),
    );
  });

  it('uiProviderSpecificParams GETs /guardrails/ui/provider_specific_params', async () => {
    await r.uiProviderSpecificParams();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/guardrails/ui/provider_specific_params',
      }),
    );
  });

  it('validateBlockedWordsFile POSTs /guardrails/validate_blocked_words_file', async () => {
    await r.validateBlockedWordsFile({ file_content: 'blocked_words: []' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/guardrails/validate_blocked_words_file',
        body: { kind: 'json', value: { file_content: 'blocked_words: []' } },
      }),
    );
  });

  it('testCustomCode POSTs /guardrails/test_custom_code', async () => {
    const params = {
      custom_code: 'def apply_guardrail(): pass',
      test_input: { texts: ['hi'] },
      input_type: 'request',
    };
    await r.testCustomCode(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/guardrails/test_custom_code',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('apply POSTs /guardrails/apply_guardrail', async () => {
    const params = { guardrail_name: 'g', text: 'hello' };
    await r.apply(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/guardrails/apply_guardrail',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('usageOverview GETs /guardrails/usage/overview with query', async () => {
    await r.usageOverview({ start_date: '2024-01-01', end_date: '2024-01-31' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/guardrails/usage/overview');
    expect(arg.options.query).toEqual({
      start_date: '2024-01-01',
      end_date: '2024-01-31',
    });
  });

  it('usageDetail GETs /guardrails/usage/detail/{id} with query', async () => {
    await r.usageDetail('g1', { start_date: '2024-01-01' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/guardrails/usage/detail/g1');
    expect(arg.options.query).toEqual({ start_date: '2024-01-01' });
  });

  it('usageLogs GETs /guardrails/usage/logs with query', async () => {
    await r.usageLogs({ guardrail_id: 'g1', page: 1, page_size: 50 });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/guardrails/usage/logs');
    expect(arg.options.query).toEqual({ guardrail_id: 'g1', page: 1, page_size: 50 });
  });

  it('policiesUsageOverview GETs /policies/usage/overview with query', async () => {
    await r.policiesUsageOverview({ start_date: '2024-01-01' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/policies/usage/overview');
    expect(arg.options.query).toEqual({ start_date: '2024-01-01' });
  });

  it('usageOverview works with no params (default {})', async () => {
    await r.usageOverview();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/guardrails/usage/overview');
    expect(arg.options.query).toEqual({});
  });

  it('usageDetail works with no params (default {})', async () => {
    await r.usageDetail('g1');
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/guardrails/usage/detail/g1');
    expect(arg.options.query).toEqual({});
  });

  it('usageLogs works with no params (default {})', async () => {
    await r.usageLogs();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/guardrails/usage/logs');
    expect(arg.options.query).toEqual({});
  });

  it('policiesUsageOverview works with no params (default {})', async () => {
    await r.policiesUsageOverview();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/policies/usage/overview');
    expect(arg.options.query).toEqual({});
  });
});
