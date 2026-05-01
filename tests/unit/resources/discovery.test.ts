/**
 * @group unit
 */
import { LiteLLMClient } from '../../../src/client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('DiscoveryResource', () => {
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

  describe('jwks', () => {
    it('GETs /.well-known/jwks.json and returns the keys array', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ keys: [{ kid: 'k1', kty: 'RSA' }] }));
      const result = await client.discovery.jwks();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/jwks.json',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.keys).toEqual([{ kid: 'k1', kty: 'RSA' }]);
    });
  });

  describe('oauthAuthorizationServer', () => {
    it('GETs the bare path when no server id is supplied', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ issuer: 'http://x' }));
      await client.discovery.oauthAuthorizationServer();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/oauth-authorization-server',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('encodes server id in the path when supplied', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ issuer: 'http://x' }));
      await client.discovery.oauthAuthorizationServer('srv 1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/oauth-authorization-server/srv%201',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('oauthAuthorizationServerMcp', () => {
    it('encodes server id and appends /mcp', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ issuer: 'http://x' }));
      await client.discovery.oauthAuthorizationServerMcp('srv/a');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/oauth-authorization-server/srv%2Fa/mcp',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('oauthAuthorizationServerForMcp', () => {
    it('places the mcp id under /mcp/{mcp_id}', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ issuer: 'http://x' }));
      await client.discovery.oauthAuthorizationServerForMcp('m 1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/oauth-authorization-server/mcp/m%201',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('oauthProtectedResource', () => {
    it('GETs the bare path when no server id is supplied', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ resource: 'http://x' }));
      await client.discovery.oauthProtectedResource();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/oauth-protected-resource',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('encodes server id when supplied', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ resource: 'http://x' }));
      await client.discovery.oauthProtectedResource('srv?a');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/oauth-protected-resource/srv%3Fa',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('oauthProtectedResourceMcp', () => {
    it('encodes server id and appends /mcp', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ resource: 'http://x' }));
      await client.discovery.oauthProtectedResourceMcp('srv1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/oauth-protected-resource/srv1/mcp',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('oauthProtectedResourceForMcp', () => {
    it('places the mcp id under /mcp/{mcp_id}', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ resource: 'http://x' }));
      await client.discovery.oauthProtectedResourceForMcp('m1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/oauth-protected-resource/mcp/m1',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('openidConfiguration', () => {
    it('GETs /.well-known/openid-configuration', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ issuer: 'http://x' }));
      const result = await client.discovery.openidConfiguration();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/.well-known/openid-configuration',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.issuer).toBe('http://x');
    });
  });

  describe('agentCard', () => {
    it('encodes the agent id into the A2A path', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ name: 'a' }));
      await client.discovery.agentCard('agent/1');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/a2a/agent%2F1/.well-known/agent.json',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('ssoReadiness', () => {
    it('GETs /sso/readiness', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ status: 'healthy', sso_configured: false }),
      );
      const result = await client.discovery.ssoReadiness();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/sso/readiness',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.sso_configured).toBe(false);
    });
  });

  describe('robotsTxt', () => {
    it('GETs /robots.txt', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.discovery.robotsTxt();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/robots.txt',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('oauthAuthorize', () => {
    it('GETs /authorize with no params when none supplied', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.discovery.oauthAuthorize();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/authorize',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('serialises params into a query string', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.discovery.oauthAuthorize({
        redirect_uri: 'https://example.com/cb',
        client_id: 'c1',
        response_type: 'code',
      });
      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe(
        'http://localhost:4000/authorize?redirect_uri=https%3A%2F%2Fexample.com%2Fcb&client_id=c1&response_type=code',
      );
    });

    it('omits undefined / null params from the query string', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));
      await client.discovery.oauthAuthorize({
        redirect_uri: 'https://x',
        client_id: undefined,
        scope: undefined,
      });
      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/authorize?redirect_uri=https%3A%2F%2Fx');
    });
  });

  describe('oauthToken', () => {
    it('POSTs form-urlencoded body to /token', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok', token_type: 'Bearer' }),
      );
      await client.discovery.oauthToken({
        grant_type: 'authorization_code',
        client_id: 'c1',
        code: 'abc',
        redirect_uri: 'https://x',
        code_verifier: 'v',
      });

      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/token');
      expect(init.method).toBe('POST');
      expect(init.headers['content-type']).toBe('application/x-www-form-urlencoded');
      // Body must be a urlencoded string, not JSON
      expect(typeof init.body).toBe('string');
      const parsed = new URLSearchParams(init.body as string);
      expect(parsed.get('grant_type')).toBe('authorization_code');
      expect(parsed.get('client_id')).toBe('c1');
      expect(parsed.get('code')).toBe('abc');
      expect(parsed.get('redirect_uri')).toBe('https://x');
      expect(parsed.get('code_verifier')).toBe('v');
    });

    it('lifts mcp_server_name into the URL query string', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse({ access_token: 'tok', token_type: 'Bearer' }),
      );
      await client.discovery.oauthToken({
        grant_type: 'authorization_code',
        client_id: 'c1',
        mcp_server_name: 'mcp 1',
      });
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:4000/token?mcp_server_name=mcp+1');
      const parsed = new URLSearchParams(init.body as string);
      // mcp_server_name should NOT be in the form body
      expect(parsed.has('mcp_server_name')).toBe(false);
      expect(parsed.get('grant_type')).toBe('authorization_code');
    });
  });
});
