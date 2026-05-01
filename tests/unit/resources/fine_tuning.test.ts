/**
 * @group unit
 */
import { FineTuningResource } from '../../../src/resources/fine_tuning';

describe('FineTuningResource', () => {
  let request: jest.Mock;
  let ft: FineTuningResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    ft = new FineTuningResource(request as any);
  });

  it('jobs.create() POSTs to /v1/fine_tuning/jobs', async () => {
    await ft.jobs.create({ model: 'gpt-4o', training_file: 'file_1' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/fine_tuning/jobs',
      body: { kind: 'json', value: { model: 'gpt-4o', training_file: 'file_1' } },
    });
  });

  it('jobs.list() forwards params via query', async () => {
    await ft.jobs.list({ limit: 5 } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/v1/fine_tuning/jobs',
      options: { query: { limit: 5 } },
    });

    await ft.jobs.list();
    expect(request.mock.calls[1][0].path).toBe('/v1/fine_tuning/jobs');
  });

  it('jobs.retrieve() / cancel() / events() encode id', async () => {
    await ft.jobs.retrieve('job a');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: `/v1/fine_tuning/jobs/${encodeURIComponent('job a')}`,
    });

    await ft.jobs.cancel('job_1');
    expect(request.mock.calls[1][0]).toMatchObject({
      method: 'POST',
      path: '/v1/fine_tuning/jobs/job_1/cancel',
    });

    await ft.jobs.events('job_1', { limit: 10, after: 'evt_1' });
    expect(request.mock.calls[2][0]).toMatchObject({
      method: 'GET',
      path: '/v1/fine_tuning/jobs/job_1/events',
      options: { query: { limit: 10, after: 'evt_1' } },
    });

    await ft.jobs.events('job_1');
    expect(request.mock.calls[3][0].path).toBe('/v1/fine_tuning/jobs/job_1/events');
  });
});
