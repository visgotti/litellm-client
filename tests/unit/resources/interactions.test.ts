/**
 * @group unit
 */
import { InteractionsResource } from '../../../src/resources/interactions';

describe('InteractionsResource', () => {
  let request: jest.Mock;
  let interactions: InteractionsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    interactions = new InteractionsResource(request as any);
  });

  it('create() POSTs JSON body to /interactions', async () => {
    await interactions.create({ model: 'gpt-4o', input: 'hi' });
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/interactions',
      body: { kind: 'json', value: { model: 'gpt-4o', input: 'hi' } },
    });
  });

  it('retrieve() encodes the id', async () => {
    await interactions.retrieve('i 1');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/interactions/i%201',
    });
  });

  it('delete() DELETEs /interactions/{id}', async () => {
    await interactions.delete('abc');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'DELETE',
      path: '/interactions/abc',
    });
  });

  it('cancel() POSTs /interactions/{id}/cancel', async () => {
    await interactions.cancel('abc');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/interactions/abc/cancel',
    });
  });
});
