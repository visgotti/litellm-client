/**
 * @group unit
 */
import { CredentialsResource } from '../../../src/resources/credentials';

describe('CredentialsResource', () => {
  let request: jest.Mock;
  let r: CredentialsResource;

  beforeEach(() => {
    request = jest.fn().mockResolvedValue({});
    r = new CredentialsResource(request as any);
  });

  // ── Credential CRUD ────────────────────────────────────────────────────────

  it('create POSTs /credentials with body', async () => {
    await r.create({
      credential_name: 'openai-prod',
      credential_info: { description: 'prod key', custom_llm_provider: 'openai' },
      credential_values: { api_key: 'sk-test' },
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/credentials',
        body: {
          kind: 'json',
          value: {
            credential_name: 'openai-prod',
            credential_info: { description: 'prod key', custom_llm_provider: 'openai' },
            credential_values: { api_key: 'sk-test' },
          },
        },
      }),
    );
  });

  it('list GETs /credentials with no body', async () => {
    await r.list();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/credentials');
    expect(arg.body).toBeUndefined();
  });

  it('getByName GETs /credentials/by_name/{credential_name}', async () => {
    await r.getByName('my-cred');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/credentials/by_name/my-cred',
      }),
    );
  });

  it('getByName percent-encodes the credential name', async () => {
    await r.getByName('team a/prod key');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/credentials/by_name/team%20a%2Fprod%20key',
      }),
    );
  });

  it('getByModel GETs /credentials/by_model/{model_id}', async () => {
    await r.getByModel('model-123');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/credentials/by_model/model-123',
      }),
    );
  });

  it('getByModel percent-encodes the model id', async () => {
    await r.getByModel('azure/gpt 4');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/credentials/by_model/azure%2Fgpt%204',
      }),
    );
  });

  it('update PATCHes /credentials/{credential_name} with body', async () => {
    await r.update('my-cred', {
      credential_values: { api_key: 'sk-new' },
      credential_info: { description: 'rotated' },
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        path: '/credentials/my-cred',
        body: {
          kind: 'json',
          value: {
            credential_values: { api_key: 'sk-new' },
            credential_info: { description: 'rotated' },
          },
        },
      }),
    );
  });

  it('update percent-encodes the credential name', async () => {
    await r.update('with spaces', { credential_values: { x: 1 } });
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('PATCH');
    expect(arg.path).toBe('/credentials/with%20spaces');
  });

  it('delete DELETEs /credentials/{credential_name}', async () => {
    await r.delete('my-cred');
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('DELETE');
    expect(arg.path).toBe('/credentials/my-cred');
    expect(arg.body).toBeUndefined();
  });

  it('delete percent-encodes the credential name', async () => {
    await r.delete('a/b c');
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/credentials/a%2Fb%20c',
      }),
    );
  });

  // ── vault sub-resource ────────────────────────────────────────────────────

  it('exposes vault sub-resource', () => {
    expect(r.vault).toBeDefined();
  });

  it('vault.set POSTs /config_overrides/hashicorp_vault with body', async () => {
    await r.vault.set({ vault_addr: 'https://vault.example.com', vault_token: 't0k' });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/config_overrides/hashicorp_vault',
        body: {
          kind: 'json',
          value: { vault_addr: 'https://vault.example.com', vault_token: 't0k' },
        },
      }),
    );
  });

  it('vault.get GETs /config_overrides/hashicorp_vault with no body', async () => {
    await r.vault.get();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('GET');
    expect(arg.path).toBe('/config_overrides/hashicorp_vault');
    expect(arg.body).toBeUndefined();
  });

  it('vault.delete DELETEs /config_overrides/hashicorp_vault', async () => {
    await r.vault.delete();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('DELETE');
    expect(arg.path).toBe('/config_overrides/hashicorp_vault');
    expect(arg.body).toBeUndefined();
  });

  it('vault.testConnection POSTs /config_overrides/hashicorp_vault/test_connection', async () => {
    await r.vault.testConnection();
    const arg = request.mock.calls[0][0];
    expect(arg.method).toBe('POST');
    expect(arg.path).toBe('/config_overrides/hashicorp_vault/test_connection');
    expect(arg.body).toBeUndefined();
  });

  // ── per-request options pass-through ──────────────────────────────────────

  it('forwards request options', async () => {
    await r.list({ headers: { 'x-test': '1' } });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { headers: { 'x-test': '1' } },
      }),
    );
  });
});
