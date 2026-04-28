/**
 * @group unit
 */
import { CompletionsResource } from '../../../src/resources/completions';
import { Stream } from '../../../src/streaming';
import type { CompletionChunk } from '../../../src/types/completions';

describe('CompletionsResource', () => {
  let request: jest.Mock;
  let streamRequest: jest.Mock;
  let completions: CompletionsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({ id: 'cmpl_1' });
    streamRequest = jest.fn();
    completions = new CompletionsResource(request as any, streamRequest as any);
  });

  it('create() non-streaming POSTs to /v1/completions', async () => {
    await completions.create({ model: 'gpt-3.5-turbo-instruct', prompt: 'Hi' } as any);
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      path: '/v1/completions',
      body: {
        kind: 'json',
        value: { model: 'gpt-3.5-turbo-instruct', prompt: 'Hi' },
      },
    });
    expect(streamRequest).not.toHaveBeenCalled();
  });

  it('create() with stream=true routes to streamRequest', async () => {
    const fake = new Stream<CompletionChunk>(
      (async function* () {})(),
      new AbortController(),
    );
    streamRequest.mockResolvedValueOnce(fake);

    const result = await completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: 'Hi',
      stream: true,
    } as any);

    expect(streamRequest).toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
    expect(result).toBe(fake);
  });

  it('create() with stream=false stays on request', async () => {
    await completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: 'Hi',
      stream: false,
    } as any);
    expect(request).toHaveBeenCalled();
    expect(streamRequest).not.toHaveBeenCalled();
  });
});
