/**
 * @group unit
 */
import { LiteLLMClient } from '../../../src/client';

function jsonResponse(body: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('ProjectsResource', () => {
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

  describe('create', () => {
    it('POSTs /project/new with the supplied body', async () => {
      const fakeResponse = {
        project_id: 'p1',
        team_id: 't1',
        models: [],
        spend: 0,
        blocked: false,
        created_by: 'u1',
        updated_by: 'u1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(fakeResponse));

      const result = await client.projects.create({
        team_id: 't1',
        project_alias: 'demo',
        models: ['gpt-4'],
        max_budget: 100,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/project/new',
        expect.objectContaining({ method: 'POST' }),
      );
      const [, init] = mockFetch.mock.calls[0];
      const body = JSON.parse(init.body);
      expect(body).toEqual({
        team_id: 't1',
        project_alias: 'demo',
        models: ['gpt-4'],
        max_budget: 100,
      });
      expect(result.project_id).toBe('p1');
      expect(result.created_at).toBe('2026-01-01T00:00:00Z');
    });
  });

  describe('update', () => {
    it('POSTs /project/update with the supplied body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          project_id: 'p1',
          team_id: 't1',
          models: [],
          spend: 0,
          blocked: false,
          created_by: 'u1',
          updated_by: 'u1',
        }),
      );

      const result = await client.projects.update({
        project_id: 'p1',
        max_budget: 250,
        description: 'updated',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/project/update',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.project_id).toBe('p1');
      expect(body.max_budget).toBe(250);
      expect(body.description).toBe('updated');
      expect(result.project_id).toBe('p1');
    });
  });

  describe('delete', () => {
    it('DELETEs /project/delete with project_ids', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([{ project_id: 'p1' }]));

      const result = await client.projects.delete({ project_ids: ['p1', 'p2'] });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/project/delete',
        expect.objectContaining({ method: 'DELETE' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.project_ids).toEqual(['p1', 'p2']);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('info', () => {
    it('GETs /project/info with the project_id query param', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          project_id: 'p1',
          team_id: 't1',
          models: [],
          spend: 0,
          blocked: false,
          created_by: 'u1',
          updated_by: 'u1',
        }),
      );

      const result = await client.projects.info({ project_id: 'p1' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/project/info?project_id=p1',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.project_id).toBe('p1');
    });

    it('encodes special characters in project_id', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          project_id: 'has space/slash',
          team_id: 't1',
          models: [],
          spend: 0,
          blocked: false,
          created_by: 'u1',
          updated_by: 'u1',
        }),
      );

      await client.projects.info({ project_id: 'has space/slash' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/project/info?project_id=has+space%2Fslash',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('sends an empty project_id when called without params', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          project_id: '',
          team_id: null,
          models: [],
          spend: 0,
          blocked: false,
          created_by: '',
          updated_by: '',
        }),
      );

      await client.projects.info();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/project/info?project_id=',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('list', () => {
    it('GETs /project/list and returns the array', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));

      const result = await client.projects.list();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/project/list',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('returns project records when the proxy is licensed', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse([
          {
            project_id: 'p1',
            team_id: 't1',
            models: ['gpt-4'],
            spend: 0,
            blocked: false,
            created_by: 'u1',
            updated_by: 'u1',
          },
        ]),
      );

      const result = await client.projects.list();
      expect(result).toHaveLength(1);
      expect(result[0].project_id).toBe('p1');
    });
  });
});
