/**
 * @group unit
 */
import { RealtimeResource } from '../../../src/resources/realtime';

describe('RealtimeResource', () => {
  let request: jest.Mock;
  let realtime: RealtimeResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    realtime = new RealtimeResource(request as any);
  });

  it('createClientSecret POSTs to /v1/realtime/client_secrets', async () => {
    const params = {
      session: { type: 'realtime' as const, model: 'gpt-4o-realtime-preview' },
      expires_after: { anchor: 'created_at' as const, seconds: 600 },
    };
    await realtime.createClientSecret(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/realtime/client_secrets',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('createCall POSTs to /v1/realtime/calls', async () => {
    const params = { sdp: 'v=0\r\no=- 0 0 IN IP4 0.0.0.0\r\n', model: 'gpt-4o-realtime-preview' };
    await realtime.createCall(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/realtime/calls',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('createClientSecret defaults to empty body when no params given', async () => {
    await realtime.createClientSecret();
    expect(request.mock.calls[0][0].body).toEqual({ kind: 'json', value: {} });
  });
});
