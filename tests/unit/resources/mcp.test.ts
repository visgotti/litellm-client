/**
 * @group unit
 */
import { McpResource } from '../../../src/resources/mcp';

describe('McpResource', () => {
  let request: jest.Mock;
  let r: McpResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new McpResource(request as any, jest.fn() as any);
  });

  // ── tools ─────────────────────────────────────────────────────────────────

  it('tools.list GETs /mcp/tools', async () => {
    await r.tools.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp/tools' }),
    );
  });

  // ── access groups ─────────────────────────────────────────────────────────

  it('accessGroups.list GETs /mcp/access_groups', async () => {
    await r.accessGroups.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp/access_groups' }),
    );
  });

  // ── network ───────────────────────────────────────────────────────────────

  it('network.clientIp GETs /mcp/network/client-ip', async () => {
    await r.network.clientIp();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp/network/client-ip' }),
    );
  });

  // ── registry ──────────────────────────────────────────────────────────────

  it('registry.json GETs /mcp/registry.json', async () => {
    await r.registry.json();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp/registry.json' }),
    );
  });

  it('registry.openapi GETs /mcp/openapi-registry', async () => {
    await r.registry.openapi();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp/openapi-registry' }),
    );
  });

  it('registry.discover GETs /mcp/discover with query', async () => {
    await r.registry.discover({ query: 'github', category: 'devtools' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/mcp/discover');
    expect(arg.options.query).toEqual({ query: 'github', category: 'devtools' });
  });

  it('registry.discover works with no params (default {})', async () => {
    await r.registry.discover();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/mcp/discover');
    expect(arg.options.query).toEqual({});
  });

  // ── user credentials ──────────────────────────────────────────────────────

  it('userCredentials.list GETs /mcp/user-credentials', async () => {
    await r.userCredentials.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp/user-credentials' }),
    );
  });

  // ── makePublic (top-level) ────────────────────────────────────────────────

  it('makePublic POSTs /mcp/make_public', async () => {
    await r.makePublic({ mcp_server_ids: ['s1', 's2'] });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp/make_public',
        body: { kind: 'json', value: { mcp_server_ids: ['s1', 's2'] } },
      }),
    );
  });

  // ── servers ───────────────────────────────────────────────────────────────

  it('servers.list GETs /mcp/server with query', async () => {
    await r.servers.list({ team_id: 't1' });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/mcp/server');
    expect(arg.options.query).toEqual({ team_id: 't1' });
  });

  it('servers.list works with no params (default {})', async () => {
    await r.servers.list();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/mcp/server');
    expect(arg.options.query).toEqual({});
  });

  it('servers.add POSTs /mcp/server', async () => {
    const params = { server_name: 'srv', url: 'http://x', transport: 'http' as const };
    await r.servers.add(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp/server',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('servers.edit PUTs /mcp/server', async () => {
    const params = { server_id: 's1', server_name: 'updated' };
    await r.servers.edit(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/mcp/server',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('servers.health GETs /mcp/server/health with query', async () => {
    await r.servers.health({ server_ids: ['s1', 's2'] });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/mcp/server/health');
    expect(arg.options.query).toEqual({ server_ids: ['s1', 's2'] });
  });

  it('servers.health works with no params (default {})', async () => {
    await r.servers.health();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/mcp/server/health');
    expect(arg.options.query).toEqual({});
  });

  it('servers.register POSTs /mcp/server/register', async () => {
    const params = { server_name: 'reg', url: 'http://x' };
    await r.servers.register(params);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp/server/register',
        body: { kind: 'json', value: params },
      }),
    );
  });

  it('servers.listSubmissions GETs /mcp/server/submissions', async () => {
    await r.servers.listSubmissions();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp/server/submissions' }),
    );
  });

  it('servers.approveSubmission PUTs /mcp/server/{id}/approve with encoded id', async () => {
    await r.servers.approveSubmission('srv id/1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/mcp/server/srv%20id%2F1/approve',
      }),
    );
  });

  it('servers.rejectSubmission PUTs /mcp/server/{id}/reject', async () => {
    await r.servers.rejectSubmission('s1', { review_notes: 'bad' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/mcp/server/s1/reject',
        body: { kind: 'json', value: { review_notes: 'bad' } },
      }),
    );
  });

  it('servers.rejectSubmission works with no params (default {})', async () => {
    await r.servers.rejectSubmission('s1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/mcp/server/s1/reject',
        body: { kind: 'json', value: {} },
      }),
    );
  });

  it('servers.retrieve GETs /mcp/server/{id}', async () => {
    await r.servers.retrieve('s1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp/server/s1' }),
    );
  });

  it('servers.delete DELETEs /mcp/server/{id}', async () => {
    await r.servers.delete('s1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', path: '/mcp/server/s1' }),
    );
  });

  it('servers.deleteV1 DELETEs /v1/mcp/server/{id}', async () => {
    await r.servers.deleteV1('s1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', path: '/v1/mcp/server/s1' }),
    );
  });

  it('servers.protocol.oauthSessionV1 POSTs /v1/mcp/server/oauth/session', async () => {
    await r.servers.protocol.oauthSessionV1({ server_id: 's1' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/v1/mcp/server/oauth/session',
        body: { kind: 'json', value: { server_id: 's1' } },
      }),
    );
  });

  it('servers.oauthSession POSTs /mcp/server/oauth/session', async () => {
    await r.servers.oauthSession({ server_id: 's1' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp/server/oauth/session',
        body: { kind: 'json', value: { server_id: 's1' } },
      }),
    );
  });

  it('servers.oauthAuthorize GETs /mcp/server/oauth/{id}/authorize with query', async () => {
    await r.servers.oauthAuthorize('s1', {
      redirect_uri: 'http://cb',
      state: 'abc',
    });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/mcp/server/oauth/s1/authorize');
    expect(arg.options.query).toEqual({ redirect_uri: 'http://cb', state: 'abc' });
  });

  it('servers.oauthToken POSTs /mcp/server/oauth/{id}/token', async () => {
    await r.servers.oauthToken('s1', { grant_type: 'authorization_code', code: 'x' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp/server/oauth/s1/token',
        body: { kind: 'json', value: { grant_type: 'authorization_code', code: 'x' } },
      }),
    );
  });

  it('servers.oauthRegister POSTs /mcp/server/oauth/{id}/register', async () => {
    await r.servers.oauthRegister('s1', { client_name: 'cli' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp/server/oauth/s1/register',
        body: { kind: 'json', value: { client_name: 'cli' } },
      }),
    );
  });

  it('servers.setUserCredential POSTs /mcp/server/{id}/user-credential', async () => {
    await r.servers.setUserCredential('s1', { credential: 'tok', save: true });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp/server/s1/user-credential',
        body: { kind: 'json', value: { credential: 'tok', save: true } },
      }),
    );
  });

  it('servers.deleteUserCredential DELETEs /mcp/server/{id}/user-credential', async () => {
    await r.servers.deleteUserCredential('s1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/mcp/server/s1/user-credential',
      }),
    );
  });

  it('servers.setOAuthUserCredential POSTs /mcp/server/{id}/oauth-user-credential', async () => {
    await r.servers.setOAuthUserCredential('s1', { access_token: 'a' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp/server/s1/oauth-user-credential',
        body: { kind: 'json', value: { access_token: 'a' } },
      }),
    );
  });

  it('servers.deleteOAuthUserCredential DELETEs /mcp/server/{id}/oauth-user-credential', async () => {
    await r.servers.deleteOAuthUserCredential('s1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/mcp/server/s1/oauth-user-credential',
      }),
    );
  });

  it('servers.oauthUserCredentialStatus GETs /mcp/server/{id}/oauth-user-credential/status', async () => {
    await r.servers.oauthUserCredentialStatus('s1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/mcp/server/s1/oauth-user-credential/status',
      }),
    );
  });

  // ── toolsets ──────────────────────────────────────────────────────────────

  it('toolsets.add POSTs /mcp/toolset', async () => {
    await r.toolsets.add({ toolset_name: 't1' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp/toolset',
        body: { kind: 'json', value: { toolset_name: 't1' } },
      }),
    );
  });

  it('toolsets.list GETs /mcp/toolset', async () => {
    await r.toolsets.list();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp/toolset' }),
    );
  });

  it('toolsets.retrieve GETs /mcp/toolset/{id}', async () => {
    await r.toolsets.retrieve('ts1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp/toolset/ts1' }),
    );
  });

  it('toolsets.edit PUTs /mcp/toolset', async () => {
    await r.toolsets.edit({ toolset_id: 'ts1', toolset_name: 'updated' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        path: '/mcp/toolset',
        body: { kind: 'json', value: { toolset_id: 'ts1', toolset_name: 'updated' } },
      }),
    );
  });

  it('toolsets.remove DELETEs /mcp/toolset/{id}', async () => {
    await r.toolsets.remove('ts1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', path: '/mcp/toolset/ts1' }),
    );
  });

  it('toolsets.deleteV1 DELETEs /v1/mcp/toolset/{id}', async () => {
    await r.toolsets.deleteV1('ts1');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', path: '/v1/mcp/toolset/ts1' }),
    );
  });

  // ── REST shell ────────────────────────────────────────────────────────

  it('rest.listTools GETs /mcp-rest/tools/list', async () => {
    await r.rest.listTools();
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/mcp-rest/tools/list' }),
    );
  });

  it('rest.listTools forwards server_id query', async () => {
    await r.rest.listTools({ server_id: 's1' });
    const arg = request.mock.calls[0][0];
    expect(arg.options.query).toMatchObject({ server_id: 's1' });
  });

  it('rest.callTool POSTs /mcp-rest/tools/call', async () => {
    await r.rest.callTool({ name: 'foo', arguments: {} });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp-rest/tools/call',
        body: { kind: 'json', value: { name: 'foo', arguments: {} } },
      }),
    );
  });

  it('rest.testConnection POSTs /mcp-rest/test/connection', async () => {
    await r.rest.testConnection({ alias: 's' } as any);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp-rest/test/connection',
      }),
    );
  });

  it('rest.testToolsList POSTs /mcp-rest/test/tools/list', async () => {
    await r.rest.testToolsList({ alias: 's' } as any);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/mcp-rest/test/tools/list',
      }),
    );
  });
});
