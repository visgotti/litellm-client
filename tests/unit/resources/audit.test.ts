/**
 * @group unit
 */
import { LiteLLMClient } from '../../../src/client';
import { NotFoundError } from '../../../src/errors';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('AuditResource', () => {
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

  describe('list', () => {
    it('GETs /audit with no query string when no params are supplied', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ audit_logs: [], total: 0, page: 1, page_size: 10, total_pages: 0 }),
      );
      const result = await client.audit.list();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/audit',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.audit_logs).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
    });

    it('encodes filter params into the query string', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ audit_logs: [], total: 0, page: 2, page_size: 5, total_pages: 0 }),
      );
      await client.audit.list({
        page: 2,
        page_size: 5,
        action: 'updated',
        table_name: 'LiteLLM_VerificationToken',
        sort_order: 'desc',
      });
      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe(
        'http://localhost:4000/audit?page=2&page_size=5&action=updated&table_name=LiteLLM_VerificationToken&sort_order=desc',
      );
    });

    it('skips undefined filter params', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ audit_logs: [], total: 0, page: 1, page_size: 10, total_pages: 0 }),
      );
      await client.audit.list({ page: 1, action: undefined, sort_order: undefined });
      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/audit?page=1');
    });
  });

  describe('retrieve', () => {
    it('encodes the audit log id into the path', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          id: 'audit/1',
          updated_at: '2025-01-01T00:00:00Z',
          changed_by: 'u1',
          action: 'updated',
          table_name: 'LiteLLM_VerificationToken',
          object_id: 'sk-1',
        }),
      );
      const result = await client.audit.retrieve('audit/1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/audit/audit%2F1',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.id).toBe('audit/1');
      expect(result.action).toBe('updated');
    });

    it('throws NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ detail: 'Audit log not found' }, 404),
      );
      await expect(client.audit.retrieve('missing')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });
});
