/**
 * @group unit
 *
 * Unit tests for the Vantage resource — verify each method dispatches the
 * correct HTTP method, path, and JSON body using a mocked fetch.
 */
import { LiteLLMClient } from '../../../src/client';
import { VantageResource } from '../../../src/resources/vantage';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('VantageResource', () => {
  let mockFetch: jest.Mock;
  let client: LiteLLMClient;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new LiteLLMClient({
      baseUrl: 'http://localhost:4000',
      apiKey: 'sk-test',
      timeout: 5000,
      maxRetries: 0,
      fetch: mockFetch,
    });
  });

  it('exposes a VantageResource instance on client.vantage', () => {
    expect(client.vantage).toBeInstanceOf(VantageResource);
  });

  describe('init', () => {
    it('POSTs to /vantage/init with the params body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ message: 'Vantage settings initialized successfully', status: 'success' }),
      );

      const result = await client.vantage.init({
        api_key: 'vt-key-abc',
        integration_token: 'int-tok-123',
        base_url: 'https://api.vantage.sh',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/vantage/init',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({
        api_key: 'vt-key-abc',
        integration_token: 'int-tok-123',
        base_url: 'https://api.vantage.sh',
      });
      expect(result.status).toBe('success');
    });
  });

  describe('getSettings', () => {
    it('GETs /vantage/settings and returns the masked view', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          api_key_masked: 'vt-k****-abc',
          integration_token_masked: 'int-****-123',
          base_url: 'https://api.vantage.sh',
          status: 'configured',
        }),
      );

      const result = await client.vantage.getSettings();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/vantage/settings',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.api_key_masked).toBe('vt-k****-abc');
      expect(result.integration_token_masked).toBe('int-****-123');
    });

    it('returns null fields when Vantage is not configured', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          api_key_masked: null,
          integration_token_masked: null,
          base_url: null,
          status: null,
        }),
      );

      const result = await client.vantage.getSettings();
      expect(result.api_key_masked).toBeNull();
      expect(result.base_url).toBeNull();
    });
  });

  describe('updateSettings', () => {
    it('PUTs to /vantage/settings with the params body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ message: 'Updated', status: 'success' }),
      );

      await client.vantage.updateSettings({ base_url: 'https://api.vantage.sh/v2' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/vantage/settings',
        expect.objectContaining({ method: 'PUT' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ base_url: 'https://api.vantage.sh/v2' });
    });
  });

  describe('dryRun', () => {
    it('POSTs to /vantage/dry-run with the limit param', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          message: 'Vantage dry run completed.',
          status: 'success',
          dry_run_data: { usage_data: [], focus_data: [] },
          summary: { total_records: 0 },
        }),
      );

      const result = await client.vantage.dryRun({ limit: 250 });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/vantage/dry-run',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ limit: 250 });
      expect(result.status).toBe('success');
    });

    it('POSTs an empty object when no params are provided', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          message: 'ok',
          status: 'success',
          dry_run_data: null,
          summary: null,
        }),
      );

      await client.vantage.dryRun();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({});
    });
  });

  describe('export', () => {
    it('POSTs to /vantage/export with provided params', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          message: 'exported',
          status: 'success',
          dry_run_data: null,
          summary: { total_records: 100 },
        }),
      );

      const result = await client.vantage.export({
        limit: 100,
        start_time_utc: '2024-01-01T00:00:00Z',
        end_time_utc: '2024-01-31T23:59:59Z',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/vantage/export',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({
        limit: 100,
        start_time_utc: '2024-01-01T00:00:00Z',
        end_time_utc: '2024-01-31T23:59:59Z',
      });
      expect(result.status).toBe('success');
    });

    it('POSTs an empty object when no params are provided', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          message: 'ok',
          status: 'success',
          dry_run_data: null,
          summary: null,
        }),
      );

      await client.vantage.export();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({});
    });
  });

  describe('delete', () => {
    it('DELETEs /vantage/delete', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ message: 'Vantage settings deleted', status: 'success' }),
      );

      const result = await client.vantage.delete();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/vantage/delete',
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(result.status).toBe('success');
    });
  });
});
