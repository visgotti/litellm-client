/**
 * @group unit
 */
import { CallbacksResource } from '../../../src/resources/callbacks';

describe('CallbacksResource', () => {
  let request: jest.Mock;
  let r: CallbacksResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new CallbacksResource(request as any);
  });

  it('list GETs /callbacks/list', async () => {
    await r.list();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/callbacks/list');
    expect(arg.body).toBeUndefined();
  });

  it('configs GETs /callbacks/configs', async () => {
    await r.configs();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/callbacks/configs');
    expect(arg.body).toBeUndefined();
  });

  it('forwards request options', async () => {
    await r.configs({ headers: { 'x-test': '1' } });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { headers: { 'x-test': '1' } },
      }),
    );
  });
});
