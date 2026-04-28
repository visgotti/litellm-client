/**
 * @group unit
 */
import { ResponsesResource } from '../../../src/resources/responses';
import { Stream } from '../../../src/streaming';
import type { ResponseStreamEvent } from '../../../src/types/responses';

describe('ResponsesResource', () => {
  let request: jest.Mock;
  let streamRequest: jest.Mock;
  let responses: ResponsesResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({ id: 'resp_1' });
    streamRequest = jest.fn();
    responses = new ResponsesResource(request as any, streamRequest as any);
  });

  it('create() non-streaming POSTs to /v1/responses', async () => {
    await responses.create({ model: 'gpt-4o', input: 'hello' } as any);
    expect(request).toHaveBeenCalled();
    expect(streamRequest).not.toHaveBeenCalled();
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/responses',
      body: { kind: 'json', value: { model: 'gpt-4o', input: 'hello' } },
    });
  });

  it('create() streaming routes to streamRequest', async () => {
    const fake = new Stream<ResponseStreamEvent>(
      (async function* () {})(),
      new AbortController(),
    );
    streamRequest.mockResolvedValueOnce(fake);

    const result = await responses.create({
      model: 'gpt-4o',
      input: 'hi',
      stream: true,
    } as any);

    expect(streamRequest).toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
    expect(result).toBe(fake);
  });

  it('create() with stream=false stays on request', async () => {
    await responses.create({ model: 'gpt-4o', input: 'hi', stream: false } as any);
    expect(request).toHaveBeenCalled();
    expect(streamRequest).not.toHaveBeenCalled();
  });

  it('retrieve() encodes id', async () => {
    await responses.retrieve('resp a/b');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: `/v1/responses/${encodeURIComponent('resp a/b')}`,
    });
  });

  it('cancel() POSTs to /v1/responses/{id}/cancel', async () => {
    await responses.cancel('resp_1');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/responses/resp_1/cancel',
    });
  });

  it('delete() DELETEs /v1/responses/{id}', async () => {
    await responses.delete('resp_1');
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'DELETE',
      path: '/v1/responses/resp_1',
    });
  });

  it('listInputItems() forwards params via query', async () => {
    await responses.listInputItems('resp_1', { limit: 5, after: 'item_1' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      path: '/v1/responses/resp_1/input_items',
      options: { query: { limit: 5, after: 'item_1' } },
    });
  });

  it('listInputItems() with no params', async () => {
    await responses.listInputItems('resp_1');
    expect(request.mock.calls[0][0].path).toBe('/v1/responses/resp_1/input_items');
  });

  it('compact() POSTs to /v1/responses/compact', async () => {
    await responses.compact({ since: 'resp_1' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/responses/compact',
    });

    await responses.compact();
    expect(request.mock.calls[1][0].body.value).toEqual({});
  });
});
