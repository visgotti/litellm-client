// ─────────────────────────────────────────────────────────────────────────────
// JWT Key Mapping Management
// Mirrors litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py and
// the request/response shapes in litellm/proxy/_types.py
// (CreateJWTKeyMappingRequest, UpdateJWTKeyMappingRequest,
// DeleteJWTKeyMappingRequest, JWTKeyMappingResponse).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * JWT-claim → virtual-key mapping record (token never returned).
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
 */
export interface JwtKeyMappingResponse {
  /** Stable id of the mapping. */
  id: string;
  /** JWT claim name to match (e.g. `sub`, `azp`). */
  jwt_claim_name: string;
  /** JWT claim value to match. */
  jwt_claim_value: string;
  /** Optional human-readable description. */
  description?: string | null;
  /** Whether the mapping is currently active. */
  is_active?: boolean | null;
  /** Creation timestamp (ISO-8601). */
  created_at?: string | null;
  /** Last-update timestamp (ISO-8601). */
  updated_at?: string | null;
  /** User id of the creator. */
  created_by?: string | null;
  /** User id of the last editor. */
  updated_by?: string | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Body for `POST /jwt/key/mapping/new`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
 */
export interface JwtKeyMappingCreateParams {
  /** JWT claim name to match. */
  jwt_claim_name: string;
  /** JWT claim value to match. */
  jwt_claim_value: string;
  /** Virtual key (raw `sk-…`) to bind the claim to. The proxy hashes before storing. */
  key: string;
  /** Optional human-readable description. */
  description?: string | null;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Body for `POST /jwt/key/mapping/update`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
 */
export interface JwtKeyMappingUpdateParams {
  /** Mapping id to update. */
  id: string;
  /** Replacement claim name. */
  jwt_claim_name?: string;
  /** Replacement claim value. */
  jwt_claim_value?: string;
  /** Replacement description. */
  description?: string | null;
  /** Replacement is_active flag. */
  is_active?: boolean | null;
  /** Replacement virtual key (will be re-hashed server-side). */
  key?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Body for `POST /jwt/key/mapping/delete`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
 */
export interface JwtKeyMappingDeleteParams {
  /** Mapping id to delete. */
  id: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /jwt/key/mapping/list`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/jwt_key_mapping_endpoints.py
 */
export interface JwtKeyMappingListResponse {
  /** Mappings in the page. */
  mappings: JwtKeyMappingResponse[];
  /** Total mappings across all pages. */
  total_count: number;
  /** Page number returned. */
  current_page: number;
  /** Total pages. */
  total_pages: number;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Optional query parameters for `GET /jwt/key/mapping/list`. */
export interface JwtKeyMappingListParams {
  /** 1-indexed page number. */
  page?: number;
  /** Page size (1–100, default 50). */
  size?: number;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}
