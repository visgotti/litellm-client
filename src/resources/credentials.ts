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

class VaultConfigOverridesResource {
  constructor(private request: RequestFn) {}

  /** POST /config_overrides/hashicorp_vault */
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

  /** GET /config_overrides/hashicorp_vault */
  get(options?: RequestOptions): Promise<ConfigOverrideSettingsResponse> {
    return this.request<ConfigOverrideSettingsResponse>({
      method: 'GET',
      path: '/config_overrides/hashicorp_vault',
      options,
    });
  }

  /** DELETE /config_overrides/hashicorp_vault */
  delete(options?: RequestOptions): Promise<VaultConfigMutationResponse> {
    return this.request<VaultConfigMutationResponse>({
      method: 'DELETE',
      path: '/config_overrides/hashicorp_vault',
      options,
    });
  }

  /** POST /config_overrides/hashicorp_vault/test_connection */
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

  /** POST /credentials */
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

  /** GET /credentials */
  list(options?: RequestOptions): Promise<CredentialListResponse> {
    return this.request<CredentialListResponse>({
      method: 'GET',
      path: '/credentials',
      options,
    });
  }

  /** GET /credentials/by_name/{credential_name} */
  getByName(credentialName: string, options?: RequestOptions): Promise<CredentialItem> {
    return this.request<CredentialItem>({
      method: 'GET',
      path: `/credentials/by_name/${encodeURIComponent(credentialName)}`,
      options,
    });
  }

  /** GET /credentials/by_model/{model_id} */
  getByModel(modelId: string, options?: RequestOptions): Promise<CredentialItem> {
    return this.request<CredentialItem>({
      method: 'GET',
      path: `/credentials/by_model/${encodeURIComponent(modelId)}`,
      options,
    });
  }

  /** PATCH /credentials/{credential_name} */
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

  /** DELETE /credentials/{credential_name} */
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
