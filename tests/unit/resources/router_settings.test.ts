/**
 * @group unit
 */
import { RouterSettingsResource } from '../../../src/resources/router_settings';

describe('RouterSettingsResource', () => {
  let request: jest.Mock;
  let r: RouterSettingsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new RouterSettingsResource(request as any);
  });

  it('getSettings GETs /router/settings', async () => {
    await r.getSettings();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/router/settings');
    expect(arg.body).toBeUndefined();
  });

  it('getFields GETs /router/fields', async () => {
    await r.getFields();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/router/fields');
    expect(arg.body).toBeUndefined();
  });

  it('forwards request options', async () => {
    await r.getSettings({ headers: { 'x-test': '1' } });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { headers: { 'x-test': '1' } },
      }),
    );
  });
});
