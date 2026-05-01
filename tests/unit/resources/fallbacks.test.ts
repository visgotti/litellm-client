/**
 * @group unit
 */
import { FallbacksResource } from '../../../src/resources/fallbacks';

describe('FallbacksResource', () => {
  let request: jest.Mock;
  let r: FallbacksResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new FallbacksResource(request as any);
  });

  it('create POSTs /fallback with body', async () => {
    await r.create({
      model: 'gpt-3.5-turbo',
      fallback_models: ['gpt-4', 'claude-3-haiku'],
      fallback_type: 'general',
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/fallback',
        body: {
          kind: 'json',
          value: {
            model: 'gpt-3.5-turbo',
            fallback_models: ['gpt-4', 'claude-3-haiku'],
            fallback_type: 'general',
          },
        },
      }),
    );
  });

  it('retrieve GETs /fallback/{model} with default query', async () => {
    await r.retrieve('gpt-3.5-turbo');
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/fallback/gpt-3.5-turbo');
    expect(arg.body).toBeUndefined();
  });

  it('retrieve forwards fallback_type query', async () => {
    await r.retrieve('gpt-3.5-turbo', { fallback_type: 'context_window' });
    const arg = request.mock.calls[0][0];
    expect(arg.path).toBe('/fallback/gpt-3.5-turbo');
    expect(arg.options.query).toMatchObject({ fallback_type: 'context_window' });
  });

  it('retrieve percent-encodes the model name', async () => {
    await r.retrieve('azure/gpt 4');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/fallback/azure%2Fgpt%204',
      }),
    );
  });

  it('delete DELETEs /fallback/{model}', async () => {
    await r.delete('gpt-3.5-turbo', { fallback_type: 'content_policy' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('DELETE');
    expect(arg.path).toBe('/fallback/gpt-3.5-turbo');
    expect(arg.options.query).toMatchObject({ fallback_type: 'content_policy' });
  });

  it('delete percent-encodes the model name', async () => {
    await r.delete('a/b c');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/fallback/a%2Fb%20c',
      }),
    );
  });
});
