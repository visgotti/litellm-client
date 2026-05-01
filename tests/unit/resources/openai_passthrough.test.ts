/**
 * @group unit
 */
import { OpenAIPassthroughResource } from '../../../src/resources/openai_passthrough';

describe('OpenAIPassthroughResource', () => {
  let request: jest.Mock;
  let openai: OpenAIPassthroughResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    openai = new OpenAIPassthroughResource(request as any);
  });

  it('retrieve() GETs /openai_passthrough/{id} (encoded)', async () => {
    await openai.retrieve('cfg 1');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/openai_passthrough/cfg%201',
    });
  });

  it('create() POSTs JSON body to /openai_passthrough/{id}', async () => {
    await openai.create('cfg', { base_url: 'https://api.openai.com/v1' });
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/openai_passthrough/cfg',
      body: { kind: 'json', value: { base_url: 'https://api.openai.com/v1' } },
    });
  });

  it('update() PATCHes /openai_passthrough/{id}', async () => {
    await openai.update('cfg', { description: 'updated' });
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'PATCH',
      path: '/openai_passthrough/cfg',
      body: { kind: 'json', value: { description: 'updated' } },
    });
  });

  it('replace() PUTs /openai_passthrough/{id}', async () => {
    await openai.replace('cfg', { base_url: 'https://api.openai.com/v1' });
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'PUT',
      path: '/openai_passthrough/cfg',
    });
  });

  it('delete() DELETEs /openai_passthrough/{id}', async () => {
    await openai.delete('cfg');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'DELETE',
      path: '/openai_passthrough/cfg',
    });
  });
});
