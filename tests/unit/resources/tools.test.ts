/**
 * @group unit
 */
import { ToolsResource } from '../../../src/resources/tools';

describe('ToolsResource', () => {
  let request: jest.Mock;
  let r: ToolsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new ToolsResource(request as any);
  });

  it('list GETs /v1/tool/list', async () => {
    await r.list();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/tool/list');
    expect(arg.body).toBeUndefined();
  });

  it('list forwards input_policy filter', async () => {
    await r.list({ input_policy: 'blocked' });
    const arg = request.mock.calls[0][0];
    expect(arg.options.query).toMatchObject({ input_policy: 'blocked' });
  });

  it('policyOptions GETs /v1/tool/policy/options', async () => {
    await r.policyOptions();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/v1/tool/policy/options',
      }),
    );
  });

  it('retrieve GETs /v1/tool/{tool_name}', async () => {
    await r.retrieve('shell.exec');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/v1/tool/shell.exec',
      }),
    );
  });

  it('retrieve percent-encodes the tool name', async () => {
    await r.retrieve('mcp/file write');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/v1/tool/mcp%2Ffile%20write',
      }),
    );
  });

  it('detail GETs /v1/tool/{tool_name}/detail', async () => {
    await r.detail('shell.exec');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/v1/tool/shell.exec/detail',
      }),
    );
  });

  it('logs GETs /v1/tool/{tool_name}/logs with query', async () => {
    await r.logs('shell.exec', { page: 2, page_size: 10, start_date: '2025-01-01' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/tool/shell.exec/logs');
    expect(arg.options.query).toMatchObject({
      page: 2,
      page_size: 10,
      start_date: '2025-01-01',
    });
  });

  it('logs GETs /v1/tool/{tool_name}/logs with no params (default branch)', async () => {
    await r.logs('shell.exec');
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/v1/tool/shell.exec/logs');
    expect(arg.options.query).toEqual({});
  });

  it('updatePolicy POSTs /v1/tool/policy with body', async () => {
    await r.updatePolicy({ tool_name: 'shell.exec', input_policy: 'trusted' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/tool/policy',
        body: {
          kind: 'json',
          value: { tool_name: 'shell.exec', input_policy: 'trusted' },
        },
      }),
    );
  });

  it('deleteOverride DELETEs /v1/tool/{tool_name}/overrides with team scope', async () => {
    await r.deleteOverride('shell.exec', { team_id: 't1' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('DELETE');
    expect(arg.path).toBe('/v1/tool/shell.exec/overrides');
    expect(arg.options.query).toMatchObject({ team_id: 't1' });
  });
});
