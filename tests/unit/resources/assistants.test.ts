/**
 * @group unit
 */
import { AssistantsResource } from '../../../src/resources/assistants';

describe('AssistantsResource', () => {
  let request: jest.Mock;
  let assistants: AssistantsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    assistants = new AssistantsResource(request as any);
  });

  function expectBetaHeader(callIndex: number) {
    const arg = request.mock.calls[callIndex][0];
    expect(arg.options.headers['OpenAI-Beta']).toBe('assistants=v2');
  }

  it('create() POSTs to /v1/assistants with beta header', async () => {
    await assistants.create({ model: 'gpt-4o' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/assistants',
    });
    expectBetaHeader(0);
  });

  it('list() forwards params via query and includes beta header', async () => {
    await assistants.list({ limit: 5 } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/v1/assistants',
      options: { query: { limit: 5 } },
    });
    expectBetaHeader(0);

    await assistants.list();
    expect(request.mock.calls[1][0].path).toBe('/v1/assistants');
  });

  it('retrieve() / update() / delete() encode id', async () => {
    await assistants.retrieve('asst a');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: `/v1/assistants/${encodeURIComponent('asst a')}`,
    });
    expectBetaHeader(0);

    await assistants.update('asst_1', { name: 'new' } as any);
    expect(request.mock.calls[1][0]).toMatchObject({
      method: 'POST',
      path: '/v1/assistants/asst_1',
    });

    await assistants.delete('asst_1');
    expect(request.mock.calls[2][0]).toMatchObject({
      method: 'DELETE',
      path: '/v1/assistants/asst_1',
    });
  });

  it('threads.create() / retrieve() / update() / delete()', async () => {
    await assistants.threads.create({ messages: [] } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/threads',
    });
    expectBetaHeader(0);

    await assistants.threads.create();
    expect(request.mock.calls[1][0].body.value).toEqual({});

    await assistants.threads.retrieve('th_1');
    expect(request.mock.calls[2][0]).toMatchObject({
      method: 'GET',
      path: '/v1/threads/th_1',
    });

    await assistants.threads.update('th_1', { metadata: {} } as any);
    expect(request.mock.calls[3][0]).toMatchObject({
      method: 'POST',
      path: '/v1/threads/th_1',
    });

    await assistants.threads.delete('th_1');
    expect(request.mock.calls[4][0]).toMatchObject({
      method: 'DELETE',
      path: '/v1/threads/th_1',
    });
  });

  it('threads.messages.create() / list()', async () => {
    await assistants.threads.messages.create('th_1', {
      role: 'user',
      content: 'hi',
    } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/threads/th_1/messages',
      body: { kind: 'json', value: { role: 'user', content: 'hi' } },
    });
    expectBetaHeader(0);

    await assistants.threads.messages.list('th_1', { limit: 5, order: 'desc' } as any);
    expect(request.mock.calls[1][0]).toMatchObject({
      method: 'GET',
      path: '/v1/threads/th_1/messages',
      options: { query: { limit: 5, order: 'desc' } },
    });

    await assistants.threads.messages.list('th_1');
    expect(request.mock.calls[2][0].path).toBe('/v1/threads/th_1/messages');
  });

  it('threads.runs.create() / retrieve() / cancel()', async () => {
    await assistants.threads.runs.create('th_1', { assistant_id: 'asst_1' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/threads/th_1/runs',
    });

    await assistants.threads.runs.retrieve('th_1', 'run_1');
    expect(request.mock.calls[1][0]).toMatchObject({
      method: 'GET',
      path: '/v1/threads/th_1/runs/run_1',
    });

    await assistants.threads.runs.cancel('th_1', 'run_1');
    expect(request.mock.calls[2][0]).toMatchObject({
      method: 'POST',
      path: '/v1/threads/th_1/runs/run_1/cancel',
    });
  });

  it('preserves caller-supplied headers alongside beta header', async () => {
    await assistants.create({ model: 'gpt-4o' } as any, {
      headers: { 'x-custom': 'v' },
    });
    const arg = request.mock.calls[0][0];
    expect(arg.options.headers['OpenAI-Beta']).toBe('assistants=v2');
    expect(arg.options.headers['x-custom']).toBe('v');
  });
});
