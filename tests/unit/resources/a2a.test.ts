/**
 * @group unit
 */
import { A2AResource } from '../../../src/resources/a2a';

describe('A2AResource', () => {
  let request: jest.Mock;
  let r: A2AResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new A2AResource(request as any);
  });

  it('card GETs /a2a/{agent_id}/.well-known/agent-card.json with encoded id', async () => {
    await r.card('agent id/1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/a2a/agent%20id%2F1/.well-known/agent-card.json',
      }),
    );
  });

  it('invoke POSTs /a2a/{agent_id} with JSON-RPC body', async () => {
    const body = {
      jsonrpc: '2.0' as const,
      id: 'rpc-1',
      method: 'message/send' as const,
      params: {
        message: {
          role: 'user' as const,
          parts: [{ type: 'text', text: 'hello' }],
          messageId: 'm-1',
        },
      },
    };
    await r.invoke('a1', body);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/a2a/a1',
        body: { kind: 'json', value: body },
      }),
    );
  });

  it('sendMessage POSTs /a2a/{agent_id}/message/send', async () => {
    await r.sendMessage('a1', {
      jsonrpc: '2.0',
      id: 'rpc-2',
      method: 'message/send',
      params: {
        message: { role: 'user', parts: [{ type: 'text', text: 'hi' }] },
      },
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/a2a/a1/message/send');
    expect(arg.body.value.params.message.parts[0].text).toBe('hi');
  });

  it('sendMessageV1 POSTs /v1/a2a/{agent_id}/message/send', async () => {
    await r.sendMessageV1('a1', {
      params: { message: { role: 'user', parts: [{ type: 'text', text: 'hi' }] } },
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/a2a/a1/message/send',
      }),
    );
  });
});
