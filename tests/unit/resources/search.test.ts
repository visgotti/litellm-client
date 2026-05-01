/**
 * @group unit
 */
import { SearchResource } from '../../../src/resources/search';

describe('SearchResource', () => {
  let request: jest.Mock;
  let r: SearchResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new SearchResource(request as any);
  });

  // ─── Top-level search methods ────────────────────────────────────────────

  it('run POSTs /v1/search', async () => {
    await r.run({ query: 'latest AI', max_results: 5, search_tool_name: 'litellm-search' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/search',
        body: {
          kind: 'json',
          value: { query: 'latest AI', max_results: 5, search_tool_name: 'litellm-search' },
        },
      }),
    );
  });

  it('runWithTool POSTs /v1/search/{tool_name} with encoded path', async () => {
    await r.runWithTool('my tool/v2', { query: 'q', country: 'US' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/v1/search/my%20tool%2Fv2');
    expect(arg.body).toEqual({ kind: 'json', value: { query: 'q', country: 'US' } });
  });

  it('listTools GETs /v1/search/tools', async () => {
    await r.listTools();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/v1/search/tools' }),
    );
  });

  // ─── Nested tools sub-resource ───────────────────────────────────────────

  it('tools.list GETs /search_tools/list', async () => {
    await r.tools.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/search_tools/list' }),
    );
  });

  it('tools.retrieve GETs /search_tools/{id} with encoded id', async () => {
    await r.tools.retrieve('id with space');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/search_tools/id%20with%20space',
      }),
    );
  });

  it('tools.create POSTs /search_tools', async () => {
    await r.tools.create({
      search_tool: {
        search_tool_name: 'litellm-search',
        litellm_params: { search_provider: 'perplexity', api_key: 'sk-x' },
      },
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/search_tools',
        body: {
          kind: 'json',
          value: {
            search_tool: {
              search_tool_name: 'litellm-search',
              litellm_params: { search_provider: 'perplexity', api_key: 'sk-x' },
            },
          },
        },
      }),
    );
  });

  it('tools.update PUTs /search_tools/{id}', async () => {
    await r.tools.update('abc', {
      search_tool: {
        search_tool_name: 'updated',
        litellm_params: { search_provider: 'tavily' },
      },
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('PUT');
    expect(arg.path).toBe('/search_tools/abc');
    expect(arg.body.value.search_tool.search_tool_name).toBe('updated');
  });

  it('tools.delete DELETEs /search_tools/{id}', async () => {
    await r.tools.delete('abc');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', path: '/search_tools/abc' }),
    );
  });

  it('tools.testConnection POSTs /search_tools/test_connection', async () => {
    await r.tools.testConnection({
      litellm_params: { search_provider: 'perplexity', api_key: 'sk-x' },
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/search_tools/test_connection',
        body: {
          kind: 'json',
          value: { litellm_params: { search_provider: 'perplexity', api_key: 'sk-x' } },
        },
      }),
    );
  });

  it('tools.uiAvailableProviders GETs /search_tools/ui/available_providers', async () => {
    await r.tools.uiAvailableProviders();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/search_tools/ui/available_providers',
      }),
    );
  });
});
