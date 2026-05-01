import type {
  CredentialItem,
  CredentialCreateParams,
  CredentialUpdateParams,
  CredentialMutationResponse,
  CredentialListResponse,
  HashicorpVaultConfig,
  ConfigOverrideSettingsResponse,
  VaultConfigMutationResponse,
  VaultTestConnectionResponse,
} from '../types/credentials';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class VaultConfigOverridesResource {
  constructor(private request: RequestFn) {}

  /**
   * Set the HashiCorp Vault config-override settings (`POST /config_overrides/hashicorp_vault`).
   *
   * @param params - Vault connection settings (address, namespace, auth, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation including the resulting Vault configuration.
   *
   * @see https://docs.litellm.ai/docs/proxy/credentials
   */
  set(
    params: HashicorpVaultConfig,
    options?: RequestOptions,
  ): Promise<VaultConfigMutationResponse> {
    return this.request<VaultConfigMutationResponse>({
      method: 'POST',
      path: '/config_overrides/hashicorp_vault',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Get the active HashiCorp Vault config-override settings (`GET /config_overrides/hashicorp_vault`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The current Vault configuration.
   *
   * @see https://docs.litellm.ai/docs/proxy/credentials
   */
  get(options?: RequestOptions): Promise<ConfigOverrideSettingsResponse> {
    return this.request<ConfigOverrideSettingsResponse>({
      method: 'GET',
      path: '/config_overrides/hashicorp_vault',
      options,
    });
  }

  /**
   * Clear the HashiCorp Vault config-override settings (`DELETE /config_overrides/hashicorp_vault`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation that the override was cleared.
   *
   * @see https://docs.litellm.ai/docs/proxy/credentials
   */
  delete(options?: RequestOptions): Promise<VaultConfigMutationResponse> {
    return this.request<VaultConfigMutationResponse>({
      method: 'DELETE',
      path: '/config_overrides/hashicorp_vault',
      options,
    });
  }

  /**
   * Test connectivity to the configured HashiCorp Vault (`POST /config_overrides/hashicorp_vault/test_connection`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Connection-test result including any error details.
   *
   * @see https://docs.litellm.ai/docs/proxy/credentials
   */
  testConnection(options?: RequestOptions): Promise<VaultTestConnectionResponse> {
    return this.request<VaultTestConnectionResponse>({
      method: 'POST',
      path: '/config_overrides/hashicorp_vault/test_connection',
      options,
    });
  }
}

export class CredentialsResource {
  readonly vault: VaultConfigOverridesResource;

  constructor(private request: RequestFn) {
    this.vault = new VaultConfigOverridesResource(request);
  }

  /**
   * Create a new credential entry (`POST /credentials`).
   *
   * @param params - Credential payload (name, info, values, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation including the created credential's metadata.
   *
   * @see https://docs.litellm.ai/docs/proxy/credentials
   */
  create(
    params: CredentialCreateParams,
    options?: RequestOptions,
  ): Promise<CredentialMutationResponse> {
    return this.request<CredentialMutationResponse>({
      method: 'POST',
      path: '/credentials',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List all stored credentials (`GET /credentials`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of credential records (secret values redacted).
   *
   * @see https://docs.litellm.ai/docs/proxy/credentials
   */
  list(options?: RequestOptions): Promise<CredentialListResponse> {
    return this.request<CredentialListResponse>({
      method: 'GET',
      path: '/credentials',
      options,
    });
  }

  /**
   * Look up a credential by its name (`GET /credentials/by_name/{credential_name}`).
   *
   * @param credentialName - The credential name to look up.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The matching credential record.
   *
   * @see https://docs.litellm.ai/docs/proxy/credentials
   */
  getByName(credentialName: string, options?: RequestOptions): Promise<CredentialItem> {
    return this.request<CredentialItem>({
      method: 'GET',
      path: `/credentials/by_name/${encodeURIComponent(credentialName)}`,
      options,
    });
  }

  /**
   * Look up the credential associated with a model id (`GET /credentials/by_model/{model_id}`).
   *
   * @param modelId - The model id to resolve credentials for.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The credential record bound to the given model.
   *
   * @see https://docs.litellm.ai/docs/proxy/credentials
   */
  getByModel(modelId: string, options?: RequestOptions): Promise<CredentialItem> {
    return this.request<CredentialItem>({
      method: 'GET',
      path: `/credentials/by_model/${encodeURIComponent(modelId)}`,
      options,
    });
  }

  /**
   * Update an existing credential by name (`PATCH /credentials/{credential_name}`).
   *
   * @param credentialName - The credential to update.
   * @param params - Fields to patch on the credential.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation including the updated credential's metadata.
   *
   * @see https://docs.litellm.ai/docs/proxy/credentials
   */
  update(
    credentialName: string,
    params: CredentialUpdateParams,
    options?: RequestOptions,
  ): Promise<CredentialMutationResponse> {
    return this.request<CredentialMutationResponse>({
      method: 'PATCH',
      path: `/credentials/${encodeURIComponent(credentialName)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete a credential by name (`DELETE /credentials/{credential_name}`).
   *
   * @param credentialName - The credential to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion confirmation.
   *
   * @see https://docs.litellm.ai/docs/proxy/credentials
   */
  delete(
    credentialName: string,
    options?: RequestOptions,
  ): Promise<CredentialMutationResponse> {
    return this.request<CredentialMutationResponse>({
      method: 'DELETE',
      path: `/credentials/${encodeURIComponent(credentialName)}`,
      options,
    });
  }
}
