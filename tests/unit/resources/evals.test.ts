/**
 * @group unit
 */
import { EvalsResource } from '../../../src/resources/evals';

describe('EvalsResource', () => {
  let request: jest.Mock;
  let evals: EvalsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    evals = new EvalsResource(request as any);
  });

  it('create posts to /v1/evals', async () => {
    const params = {
      name: 'My Eval',
      data_source_config: { type: 'custom' as const, item_schema: { type: 'object' } },
      testing_criteria: [{ type: 'llm_as_judge' as const, model: 'gpt-4' }],
    };
    await evals.create(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/evals',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('list GETs /v1/evals with query params', async () => {
    await evals.list({ limit: 10, order: 'asc', order_by: 'created_at' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/evals');
    expect(arg.options.query).toEqual({ limit: 10, order: 'asc', order_by: 'created_at' });
  });

  it('retrieve GETs /v1/evals/{id}', async () => {
    await evals.retrieve('eval_123');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/v1/evals/eval_123' }),
    );
  });

  it('update POSTs to /v1/evals/{id}', async () => {
    await evals.update('eval_123', { name: 'renamed' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/evals/eval_123',
        body: { kind: 'json', value: { name: 'renamed' } },
      }),
    );
  });

  it('delete DELETEs /v1/evals/{id}', async () => {
    await evals.delete('eval_123');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', path: '/v1/evals/eval_123' }),
    );
  });

  it('cancel POSTs to /v1/evals/{id}/cancel', async () => {
    await evals.cancel('eval_123');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', path: '/v1/evals/eval_123/cancel' }),
    );
  });

  it('runs.create POSTs to /v1/evals/{id}/runs', async () => {
    const params = { name: 'r1', data_source: { type: 'dataset' as const, dataset_id: 'ds_1' } };
    await evals.runs.create('eval_123', params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/evals/eval_123/runs',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('runs.list GETs /v1/evals/{id}/runs with query params', async () => {
    await evals.runs.list('eval_123', { limit: 5, order: 'desc' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/evals/eval_123/runs');
    expect(arg.options.query).toEqual({ limit: 5, order: 'desc' });
  });

  it('runs.retrieve GETs /v1/evals/{id}/runs/{run_id}', async () => {
    await evals.runs.retrieve('eval_123', 'run_456');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/v1/evals/eval_123/runs/run_456',
      }),
    );
  });

  it('runs.cancel POSTs to /v1/evals/{id}/runs/{run_id}', async () => {
    await evals.runs.cancel('eval_123', 'run_456');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/evals/eval_123/runs/run_456',
      }),
    );
  });

  it('runs.delete DELETEs /v1/evals/{id}/runs/{run_id}', async () => {
    await evals.runs.delete('eval_123', 'run_456');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/v1/evals/eval_123/runs/run_456',
      }),
    );
  });
});
