/**
 * @group unit
 *
 * Unit tests for EmailEventsResource.
 */
import { LiteLLMClient } from '../../../src/client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('EmailEventsResource', () => {
  let mockFetch: jest.Mock;
  let client: LiteLLMClient;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new LiteLLMClient({
      baseUrl: 'http://localhost:4000',
      apiKey: 'sk-test',
      maxRetries: 0,
      fetch: mockFetch,
    });
  });

  it('GET /email/event_settings', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ settings: [{ event: 'key_created', enabled: true }] }),
    );

    const r = await client.emailEvents.getSettings();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/email/event_settings',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(Array.isArray(r.settings)).toBe(true);
    expect(r.settings[0].event).toBe('key_created');
    expect(r.settings[0].enabled).toBe(true);
  });

  it('PATCH /email/event_settings', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    await client.emailEvents.updateSettings({
      settings: [
        { event: 'key_created', enabled: false },
        { event: 'user_added', enabled: true },
      ],
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:4000/email/event_settings');
    expect(init.method).toBe('PATCH');
    const body = JSON.parse(init.body);
    expect(body.settings).toHaveLength(2);
    expect(body.settings[0]).toEqual({ event: 'key_created', enabled: false });
  });

  it('POST /email/event_settings/reset', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ reset: true }));
    const r = await client.emailEvents.resetSettings();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:4000/email/event_settings/reset',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(r).toEqual({ reset: true });
  });
});
