/**
 * @group unit
 */
import { RerankResource } from '../../../src/resources/rerank';

describe('RerankResource', () => {
  let request: jest.Mock;
  let rerank: RerankResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    rerank = new RerankResource(request as any);
  });

  it('create() POSTs to /v1/rerank', async () => {
    await rerank.create({
      model: 'rerank-english-v3.0',
      query: 'q',
      documents: ['a', 'b'],
    } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/rerank',
      body: {
        kind: 'json',
        value: {
          model: 'rerank-english-v3.0',
          query: 'q',
          documents: ['a', 'b'],
        },
      },
    });
  });
});
