// ─────────────────────────────────────────────────────────────────────────────
// Credential Management (BETA)
// Mirrors litellm/proxy/credential_endpoints/endpoints.py + CredentialItem /
// CreateCredentialItem in litellm/types/utils.py.
// ─────────────────────────────────────────────────────────────────────────────

/** Optional metadata stored alongside credential values. */
export interface CredentialInfo {
  description?: string;
  required?: boolean;
  custom_llm_provider?: string;
  [key: string]: unknown;
}

/** A reusable credential record. */
export interface CredentialItem {
  credential_name: string;
  credential_values: Record<string, unknown>;
  credential_info: CredentialInfo;
}

/** POST /credentials body. Either `credential_values` or `model_id` is required. */
export interface CredentialCreateParams {
  credential_name: string;
  credential_info: CredentialInfo;
  credential_values?: Record<string, unknown>;
  /** If set, server infers credential_values from the deployment. */
  model_id?: string;
}

/** PATCH /credentials/{credential_name} body — partial update. */
export interface CredentialUpdateParams {
  credential_name?: string;
  credential_values?: Record<string, unknown>;
  credential_info?: CredentialInfo;
}

/** Generic success envelope returned by create/update/delete. */
export interface CredentialMutationResponse {
  success: boolean;
  message: string;
  [key: string]: unknown;
}

/** Masked credential entry returned by GET /credentials. */
export interface MaskedCredentialItem {
  credential_name: string;
  credential_values: Record<string, unknown>;
  credential_info: CredentialInfo;
}

/** GET /credentials response. */
export interface CredentialListResponse {
  success: boolean;
  credentials: MaskedCredentialItem[];
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hashicorp Vault config overrides
// litellm/types/proxy/management_endpoints/config_overrides.py
// ─────────────────────────────────────────────────────────────────────────────

export interface HashicorpVaultConfig {
  vault_addr?: string | null;
  vault_token?: string | null;
  approle_role_id?: string | null;
  approle_secret_id?: string | null;
  approle_mount_path?: string | null;
  client_cert?: string | null;
  client_key?: string | null;
  vault_cert_role?: string | null;
  vault_namespace?: string | null;
  vault_mount_name?: string | null;
  vault_path_prefix?: string | null;
}

export interface ConfigOverrideFieldSchema {
  description: string;
  properties: Record<string, { description: string; type: string }>;
}

export interface ConfigOverrideSettingsResponse {
  config_type: string;
  values: Record<string, unknown>;
  field_schema: ConfigOverrideFieldSchema;
  [key: string]: unknown;
}

export interface VaultConfigMutationResponse {
  message: string;
  status: string;
  [key: string]: unknown;
}

export interface VaultTestConnectionResponse {
  status: string;
  message: string;
  [key: string]: unknown;
}
