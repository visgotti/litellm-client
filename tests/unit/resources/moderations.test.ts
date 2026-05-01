/**
 * @group unit
 */
import { ModerationsResource } from '../../../src/resources/moderations';

describe('ModerationsResource', () => {
  let request: jest.Mock;
  let moderations: ModerationsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    moderations = new ModerationsResource(request as any);
  });

  it('create() POSTs to /v1/moderations', async () => {
    await moderations.create({
      input: 'some text',
      model: 'omni-moderation-latest',
    } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/moderations',
      body: {
        kind: 'json',
        value: { input: 'some text', model: 'omni-moderation-latest' },
      },
    });
  });
});
