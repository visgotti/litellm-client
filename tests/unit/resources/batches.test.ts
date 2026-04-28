/**
 * @group unit
 */
import { BatchesResource } from '../../../src/resources/batches';

describe('BatchesResource', () => {
  let request: jest.Mock;
  let batches: BatchesResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    batches = new BatchesResource(request as any);
  });

  it('create() POSTs to /v1/batches', async () => {
    await batches.create({
      input_file_id: 'file_1',
      endpoint: '/v1/chat/completions',
      completion_window: '24h',
    } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/batches',
      body: {
        kind: 'json',
        value: {
          input_file_id: 'file_1',
          endpoint: '/v1/chat/completions',
          completion_window: '24h',
        },
      },
    });
  });

  it('list() with and without params', async () => {
    await batches.list({ limit: 10 } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/v1/batches',
      options: { query: { limit: 10 } },
    });

    await batches.list();
    expect(request.mock.calls[1][0].path).toBe('/v1/batches');
  });

  it('retrieve() / cancel() encode id', async () => {
    await batches.retrieve('batch a');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: `/v1/batches/${encodeURIComponent('batch a')}`,
    });

    await batches.cancel('batch a');
    expect(request.mock.calls[1][0]).toMatchObject({
      method: 'POST',
      path: `/v1/batches/${encodeURIComponent('batch a')}/cancel`,
    });
  });
});
