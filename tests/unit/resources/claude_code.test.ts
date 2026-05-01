/**
 * @group unit
 */
import { LiteLLMClient } from '../../../src/client';
import {
  ClaudeCodeResource,
  ClaudeCodePluginsResource,
} from '../../../src/resources/claude_code';

function jsonResponse(body: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('ClaudeCodeResource', () => {
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

  it('exposes a plugins sub-resource', () => {
    expect(client.claudeCode).toBeInstanceOf(ClaudeCodeResource);
    expect(client.claudeCode.plugins).toBeInstanceOf(ClaudeCodePluginsResource);
  });

  describe('marketplace', () => {
    it('GETs /claude-code/marketplace.json', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          name: 'litellm',
          owner: { name: 'LiteLLM' },
          plugins: [],
        }),
      );

      const result = await client.claudeCode.marketplace();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/claude-code/marketplace.json',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.name).toBe('litellm');
      expect(Array.isArray(result.plugins)).toBe(true);
    });
  });

  describe('plugins.list', () => {
    it('GETs /claude-code/plugins', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ plugins: [], count: 0 }));

      const result = await client.claudeCode.plugins.list();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/claude-code/plugins',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.count).toBe(0);
      expect(Array.isArray(result.plugins)).toBe(true);
    });
  });

  describe('plugins.create', () => {
    it('POSTs /claude-code/plugins with the supplied body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          status: 'success',
          action: 'created',
          plugin: {
            id: 'pl-1',
            name: 'my-plugin',
            enabled: true,
            version: '1.0.0',
            source: { source: 'github', repo: 'org/my-plugin' },
          },
        }),
      );

      const result = await client.claudeCode.plugins.create({
        name: 'my-plugin',
        source: { source: 'github', repo: 'org/my-plugin' },
        version: '1.0.0',
        description: 'demo',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/claude-code/plugins',
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.name).toBe('my-plugin');
      expect(body.source).toEqual({ source: 'github', repo: 'org/my-plugin' });
      expect(body.version).toBe('1.0.0');
      expect(body.description).toBe('demo');
      expect(result.action).toBe('created');
      expect(result.plugin.id).toBe('pl-1');
    });
  });

  describe('plugins.retrieve', () => {
    it('GETs /claude-code/plugins/{name}', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          id: 'pl-1',
          name: 'my-plugin',
          enabled: true,
          version: '1.0.0',
          source: { source: 'github', repo: 'org/my-plugin' },
        }),
      );

      const result = await client.claudeCode.plugins.retrieve('my-plugin');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/claude-code/plugins/my-plugin',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.name).toBe('my-plugin');
    });

    it('encodes special characters in the plugin name', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({
          id: 'pl-1',
          name: 'weird/name',
          enabled: true,
          version: '1.0.0',
          source: {},
        }),
      );

      await client.claudeCode.plugins.retrieve('weird/name');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/claude-code/plugins/weird%2Fname',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('plugins.delete', () => {
    it('DELETEs /claude-code/plugins/{name}', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'success' }));

      await client.claudeCode.plugins.delete('my-plugin');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/claude-code/plugins/my-plugin',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('plugins.enable', () => {
    it('POSTs /claude-code/plugins/{name}/enable', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'success' }));

      await client.claudeCode.plugins.enable('my-plugin');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/claude-code/plugins/my-plugin/enable',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('plugins.disable', () => {
    it('POSTs /claude-code/plugins/{name}/disable', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'success' }));

      await client.claudeCode.plugins.disable('my-plugin');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/claude-code/plugins/my-plugin/disable',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
