// ─────────────────────────────────────────────────────────────────────────────
// Credential Management (BETA)
// Mirrors litellm/proxy/credential_endpoints/endpoints.py + CredentialItem /
// CreateCredentialItem in litellm/types/utils.py.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Optional metadata stored alongside credential values.
 *
 * @see https://docs.litellm.ai/docs/proxy/credentials
 */
export interface CredentialInfo {
  /** Human-readable description. */
  description?: string;
  /** Whether the credential is required for the associated provider. */
  required?: boolean;
  /** LiteLLM provider this credential is intended for. */
  custom_llm_provider?: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * A reusable credential record.
 *
 * @see https://docs.litellm.ai/docs/proxy/credentials
 */
export interface CredentialItem {
  /** Unique credential name. */
  credential_name: string;
  /** Credential values (api_key etc.). */
  credential_values: Record<string, unknown>;
  /** Optional metadata. */
  credential_info: CredentialInfo;
}

/**
 * POST /credentials body. Either `credential_values` or `model_id` is required.
 *
 * @see https://docs.litellm.ai/docs/proxy/credentials
 */
export interface CredentialCreateParams {
  /** Unique credential name. */
  credential_name: string;
  /** Optional metadata. */
  credential_info: CredentialInfo;
  /** Credential values to store. */
  credential_values?: Record<string, unknown>;
  /** If set, server infers credential_values from the deployment. */
  model_id?: string;
}

/**
 * PATCH /credentials/{credential_name} body — partial update.
 *
 * @see https://docs.litellm.ai/docs/proxy/credentials
 */
export interface CredentialUpdateParams {
  /** New credential name. */
  credential_name?: string;
  /** Replacement credential values. */
  credential_values?: Record<string, unknown>;
  /** Replacement metadata. */
  credential_info?: CredentialInfo;
}

/**
 * Generic success envelope returned by create/update/delete.
 *
 * @see https://docs.litellm.ai/docs/proxy/credentials
 */
export interface CredentialMutationResponse {
  /** `true` if the mutation succeeded. */
  success: boolean;
  /** Human-readable status. */
  message: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/**
 * Masked credential entry returned by GET /credentials.
 *
 * @see https://docs.litellm.ai/docs/proxy/credentials
 */
export interface MaskedCredentialItem {
  /** Credential name. */
  credential_name: string;
  /** Credential values with sensitive fields masked. */
  credential_values: Record<string, unknown>;
  /** Stored metadata. */
  credential_info: CredentialInfo;
}

/**
 * GET /credentials response.
 *
 * @see https://docs.litellm.ai/docs/proxy/credentials
 */
export interface CredentialListResponse {
  /** `true` if the listing succeeded. */
  success: boolean;
  /** All visible credentials with masked secrets. */
  credentials: MaskedCredentialItem[];
  /** Free-form additional fields. */
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hashicorp Vault config overrides
// litellm/types/proxy/management_endpoints/config_overrides.py
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hashicorp Vault configuration block.
 *
 * @see https://docs.litellm.ai/docs/proxy/credentials
 */
export interface HashicorpVaultConfig {
  /** Vault server address. */
  vault_addr?: string | null;
  /** Static Vault token. */
  vault_token?: string | null;
  /** AppRole role ID. */
  approle_role_id?: string | null;
  /** AppRole secret ID. */
  approle_secret_id?: string | null;
  /** AppRole mount path. */
  approle_mount_path?: string | null;
  /** Path to a client TLS certificate. */
  client_cert?: string | null;
  /** Path to a client TLS private key. */
  client_key?: string | null;
  /** Vault cert role name. */
  vault_cert_role?: string | null;
  /** Vault namespace. */
  vault_namespace?: string | null;
  /** KV mount name. */
  vault_mount_name?: string | null;
  /** Path prefix prepended to looked-up secret paths. */
  vault_path_prefix?: string | null;
}

/** Field-schema entry for a config-override settings page. */
export interface ConfigOverrideFieldSchema {
  /** Description of the schema. */
  description: string;
  /** Per-field metadata. */
  properties: Record<string, { description: string; type: string }>;
}

/** Response from `GET /config/{config_type}/settings`. */
export interface ConfigOverrideSettingsResponse {
  /** Config type identifier. */
  config_type: string;
  /** Current values. */
  values: Record<string, unknown>;
  /** Field schema. */
  field_schema: ConfigOverrideFieldSchema;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Generic Vault config mutation response. */
export interface VaultConfigMutationResponse {
  /** Human-readable status. */
  message: string;
  /** Outcome marker. */
  status: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}

/** Response from testing a Vault connection. */
export interface VaultTestConnectionResponse {
  /** Outcome marker (`'success'` / `'error'`). */
  status: string;
  /** Human-readable status. */
  message: string;
  /** Free-form additional fields. */
  [key: string]: unknown;
}
