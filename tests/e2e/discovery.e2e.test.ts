/**
 * @group e2e
 *
 * E2E tests for `client.discovery` against the LiteLLM proxy on
 * http://localhost:14000. Each test pins to a single observed status code.
 */

import { LiteLLMClient } from '../../src/client';
import {
  LiteLLMError,
  NotFoundError,
} from '../../src/errors';

const PROXY_URL = process.env.LITELLM_PROXY_URL ?? 'http://localhost:14000';
const MASTER_KEY = process.env.LITELLM_MASTER_KEY ?? 'sk-e2e-test-master-key';

let client: LiteLLMClient;

beforeAll(() => {
  client = new LiteLLMClient({
    baseUrl: PROXY_URL,
    apiKey: MASTER_KEY,
    timeout: 30_000,
    maxRetries: 0,
  });
});

describe('Discovery — well-known endpoints (200 OK)', () => {
  it('jwks() returns a JWKS document with a keys array', async () => {
    const result = await client.discovery.jwks();
    expect(Array.isArray(result.keys)).toBe(true);
  });

  it('oauthAuthorizationServer() returns RFC 8414 metadata', async () => {
    const result = await client.discovery.oauthAuthorizationServer();
    expect(typeof result.issuer).toBe('string');
    expect(result.issuer.length).toBeGreaterThan(0);
    expect(typeof result.authorization_endpoint).toBe('string');
    expect(typeof result.token_endpoint).toBe('string');
  });

  it('oauthAuthorizationServer(serverId) returns metadata for the named server', async () => {
    const result = await client.discovery.oauthAuthorizationServer('srv1');
    expect(typeof result.issuer).toBe('string');
    expect(typeof result.authorization_endpoint).toBe('string');
  });

  it('oauthAuthorizationServerMcp(serverId) returns server-scoped MCP metadata', async () => {
    const result = await client.discovery.oauthAuthorizationServerMcp('srv1');
    expect(typeof result.issuer).toBe('string');
    expect(typeof result.token_endpoint).toBe('string');
  });

  it('oauthAuthorizationServerForMcp(mcpId) returns mcp-id-scoped metadata', async () => {
    const result = await client.discovery.oauthAuthorizationServerForMcp('m1');
    expect(typeof result.issuer).toBe('string');
    expect(typeof result.authorization_endpoint).toBe('string');
  });

  it('oauthProtectedResource() returns RFC 9728 metadata', async () => {
    const result = await client.discovery.oauthProtectedResource();
    expect(typeof result.resource).toBe('string');
    expect(result.resource.length).toBeGreaterThan(0);
  });

  it('oauthProtectedResourceMcp(serverId) returns mcp-scoped metadata', async () => {
    const result = await client.discovery.oauthProtectedResourceMcp('srv1');
    expect(typeof result.resource).toBe('string');
  });

  it('oauthProtectedResourceForMcp(mcpId) returns mcp-id-scoped metadata', async () => {
    const result = await client.discovery.oauthProtectedResourceForMcp('m1');
    expect(typeof result.resource).toBe('string');
  });

  it('openidConfiguration() returns OIDC discovery metadata', async () => {
    const result = await client.discovery.openidConfiguration();
    expect(typeof result.issuer).toBe('string');
    expect(typeof result.token_endpoint).toBe('string');
    expect(typeof result.authorization_endpoint).toBe('string');
  });

  it('ssoReadiness() reports SSO not configured on the test proxy', async () => {
    const result = await client.discovery.ssoReadiness();
    expect(typeof result.status).toBe('string');
    expect(typeof result.sso_configured).toBe('boolean');
  });
});

describe('Discovery — endpoints that return typed errors on the test proxy', () => {
  it('robotsTxt() throws NotFoundError (proxy responds 404)', async () => {
    let caught: unknown;
    try {
      await client.discovery.robotsTxt();
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(NotFoundError);
    expect((caught as NotFoundError).status).toBe(404);
  });

  it('agentCard(agentId) throws NotFoundError when no such agent exists', async () => {
    let caught: unknown;
    try {
      await client.discovery.agentCard('does-not-exist-e2e');
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(NotFoundError);
    expect((caught as NotFoundError).status).toBe(404);
  });

  it('oauthProtectedResource(serverId) 404s for an unknown server id', async () => {
    let caught: unknown;
    try {
      await client.discovery.oauthProtectedResource('srv1');
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(NotFoundError);
    expect((caught as NotFoundError).status).toBe(404);
  });

  it('oauthAuthorize() with no params returns 422 for missing redirect_uri', async () => {
    let caught: unknown;
    try {
      await client.discovery.oauthAuthorize();
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(LiteLLMError);
    expect((caught as LiteLLMError).status).toBe(422);
  });

  it('oauthAuthorize({redirect_uri}) returns 404 when no MCP server is registered', async () => {
    let caught: unknown;
    try {
      await client.discovery.oauthAuthorize({
        redirect_uri: 'https://example.com/cb',
        client_id: 'c1',
        response_type: 'code',
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(NotFoundError);
    expect((caught as NotFoundError).status).toBe(404);
  });

  it('oauthToken() with no MCP server configured throws NotFoundError', async () => {
    let caught: unknown;
    try {
      await client.discovery.oauthToken({
        grant_type: 'authorization_code',
        client_id: 'c1',
        code: 'abc',
        redirect_uri: 'https://example.com/cb',
        code_verifier: 'v',
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(NotFoundError);
    expect((caught as NotFoundError).status).toBe(404);
  });

  it('oauthToken() with empty form body returns 422 for missing required fields', async () => {
    let caught: unknown;
    try {
      // grant_type/client_id are required so an empty body fails validation
      // before reaching the MCP-server lookup.
      await client.discovery.oauthToken({
        grant_type: '',
        client_id: '',
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(LiteLLMError);
    expect((caught as LiteLLMError).status).toBe(422);
  });
});
