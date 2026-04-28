/**
 * @group unit
 */
import { EmbeddingsResource } from '../../../src/resources/embeddings';

describe('EmbeddingsResource', () => {
  let request: jest.Mock;
  let embeddings: EmbeddingsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    embeddings = new EmbeddingsResource(request as any);
  });

  it('create() POSTs to /v1/embeddings', async () => {
    await embeddings.create({
      model: 'text-embedding-3-small',
      input: 'hello',
    } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/embeddings',
      body: {
        kind: 'json',
        value: { model: 'text-embedding-3-small', input: 'hello' },
      },
    });
  });
});
