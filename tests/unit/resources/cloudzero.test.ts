/**
 * @group unit
 *
 * Unit tests for the CloudZero resource — verify each method dispatches the
 * correct HTTP method, path, and JSON body using a mocked fetch.
 */
import { LiteLLMClient } from '../../../src/client';
import { CloudZeroResource } from '../../../src/resources/cloudzero';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('CloudZeroResource', () => {
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

  it('exposes a CloudZeroResource instance on client.cloudzero', () => {
    expect(client.cloudzero).toBeInstanceOf(CloudZeroResource);
  });

  describe('init', () => {
    it('POSTs to /cloudzero/init with the params body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ message: 'CloudZero settings initialized successfully', status: 'success' }),
      );

      const result = await client.cloudzero.init({
        api_key: 'cz-key-abc',
        connection_id: 'conn-123',
        timezone: 'America/Los_Angeles',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/cloudzero/init',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({
        api_key: 'cz-key-abc',
        connection_id: 'conn-123',
        timezone: 'America/Los_Angeles',
      });
      expect(result.status).toBe('success');
    });
  });

  describe('getSettings', () => {
    it('GETs /cloudzero/settings and returns the masked view', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          api_key_masked: 'cz-k****-abc',
          connection_id: 'conn-123',
          timezone: 'UTC',
          status: 'configured',
        }),
      );

      const result = await client.cloudzero.getSettings();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/cloudzero/settings',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.connection_id).toBe('conn-123');
      expect(result.api_key_masked).toBe('cz-k****-abc');
    });

    it('returns null fields when CloudZero is not configured', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          api_key_masked: null,
          connection_id: null,
          timezone: null,
          status: null,
        }),
      );

      const result = await client.cloudzero.getSettings();
      expect(result.api_key_masked).toBeNull();
      expect(result.status).toBeNull();
    });
  });

  describe('updateSettings', () => {
    it('PUTs to /cloudzero/settings with the params body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ message: 'Updated', status: 'success' }),
      );

      await client.cloudzero.updateSettings({ timezone: 'Europe/London' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/cloudzero/settings',
        expect.objectContaining({ method: 'PUT' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ timezone: 'Europe/London' });
    });
  });

  describe('dryRun', () => {
    it('POSTs to /cloudzero/dry-run with provided params', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          message: 'CloudZero dry run export completed successfully.',
          status: 'success',
          records_exported: null,
          dry_run_data: { usage_data: [], cbf_data: [] },
          summary: { total_records: 0 },
        }),
      );

      const result = await client.cloudzero.dryRun({ limit: 100, operation: 'sum' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/cloudzero/dry-run',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ limit: 100, operation: 'sum' });
      expect(result.status).toBe('success');
    });

    it('POSTs an empty object when no params are provided', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          message: 'ok',
          status: 'success',
          records_exported: null,
          dry_run_data: null,
          summary: null,
        }),
      );

      await client.cloudzero.dryRun();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({});
    });
  });

  describe('export', () => {
    it('POSTs to /cloudzero/export with provided params', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          message: 'exported',
          status: 'success',
          records_exported: 42,
          dry_run_data: null,
          summary: { total_records: 42 },
        }),
      );

      const result = await client.cloudzero.export({ limit: 50, operation: 'replace_hourly' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/cloudzero/export',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ limit: 50, operation: 'replace_hourly' });
      expect(result.records_exported).toBe(42);
    });

    it('POSTs an empty object when no params are provided', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          message: 'ok',
          status: 'success',
          records_exported: 0,
          dry_run_data: null,
          summary: null,
        }),
      );

      await client.cloudzero.export();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({});
    });
  });

  describe('delete', () => {
    it('DELETEs /cloudzero/delete', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ message: 'CloudZero settings deleted', status: 'success' }),
      );

      const result = await client.cloudzero.delete();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/cloudzero/delete',
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(result.status).toBe('success');
    });
  });
});
