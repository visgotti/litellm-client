// ─────────────────────────────────────────────────────────────────────────────
// Policy Engine
// Mirrors three LiteLLM routers:
//   - litellm/proxy/policy_engine/policy_endpoints.py        (CRUD)
//   - litellm/proxy/policy_engine/policy_resolve_endpoints.py (resolve/impact)
//   - litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
//     (templates / read-only catalog / "test" helpers)
//
// Pydantic schemas are large and frequently expanded — methods accept and
// return open record types so SDK callers always get the latest fields.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Policy DB record returned by `GET /policies/{policy_id}` and friends.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
export interface PolicyDBResponse {
  /** Stable policy id (UUID). */
  policy_id?: string;
  /** Human-readable policy name (often shared across versions). */
  policy_name?: string;
  /** Semver-style version string. */
  version?: string;
  /** Policy lifecycle status (e.g. `draft`, `enabled`, `disabled`). */
  status?: string;
  /** Free-form policy body (rules, configuration). */
  policy?: Record<string, unknown> | null;
  /** Forward-compat passthrough for new fields. */
  [key: string]: unknown;
}

/**
 * Body for `POST /policies` and `PUT /policies/{policy_id}`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
export interface PolicyCreateParams {
  /** Human-readable policy name. */
  policy_name: string;
  /** Free-form policy body (rules, configuration). */
  policy?: Record<string, unknown>;
  /** Initial status. */
  status?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Body for `PUT /policies/{policy_id}` — partial update.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
export interface PolicyUpdateParams {
  /** Replacement policy name. */
  policy_name?: string;
  /** Replacement policy body. */
  policy?: Record<string, unknown>;
  /** Replacement status. */
  status?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Body for `PUT /policies/{policy_id}/status`. */
export interface PolicyStatusUpdateParams {
  /** New lifecycle status. */
  status: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /policies/list`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
export interface PolicyListDBResponse {
  /** Page of policy records. */
  policies?: PolicyDBResponse[];
  /** Total rows across all pages. */
  total?: number;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /policies/name/{policy_name}/versions`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
export interface PolicyVersionListResponse {
  /** All versions for the policy name. */
  versions?: PolicyDBResponse[];
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Optional query parameters for `GET /policies/list`. */
export interface PolicyListParams {
  /** 1-indexed page. */
  page?: number;
  /** Page size. */
  page_size?: number;
  /** Filter by status. */
  status?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Optional query parameters for `GET /policies/compare`. */
export interface PolicyCompareParams {
  /** First policy version id. */
  policy_id_a?: string;
  /** Second policy version id. */
  policy_id_b?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Diff payload returned by `GET /policies/compare`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
export interface PolicyVersionCompareResponse {
  /** Forward-compat passthrough — schema is intentionally open. */
  [key: string]: unknown;
}

/**
 * Policy attachment record (binds a policy to a team / key / route /
 * guardrail).
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
export interface PolicyAttachmentDBResponse {
  /** Attachment id (UUID). */
  attachment_id?: string;
  /** Bound policy id. */
  policy_id?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Body for `POST /policies/attachments`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
export interface PolicyAttachmentCreateParams {
  /** Policy id to attach. */
  policy_id: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /policies/attachments/list`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_endpoints.py
 */
export interface PolicyAttachmentListResponse {
  /** Attachments returned. */
  attachments?: PolicyAttachmentDBResponse[];
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Optional query parameters for `GET /policies/attachments/list`. */
export interface PolicyAttachmentListParams {
  /** Filter by policy id. */
  policy_id?: string;
  /** Filter by team id. */
  team_id?: string;
  /** Filter by key hash. */
  key_hash?: string;
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

// ─── Resolve / impact ───────────────────────────────────────────────────────

/**
 * Body for `POST /policies/resolve`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_resolve_endpoints.py
 */
export interface PolicyResolveParams {
  /** Forward-compat passthrough — schema is intentionally open. */
  [key: string]: unknown;
}

/**
 * Response shape for `POST /policies/resolve`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/policy_engine/policy_resolve_endpoints.py
 */
export interface PolicyResolveResponse {
  /** Forward-compat passthrough — schema is intentionally open. */
  [key: string]: unknown;
}

/** Body for `POST /policies/attachments/estimate-impact`. */
export interface AttachmentImpactParams {
  /** Forward-compat passthrough — schema is intentionally open. */
  [key: string]: unknown;
}

/** Response shape for `POST /policies/attachments/estimate-impact`. */
export interface AttachmentImpactResponse {
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

// ─── Policy templates / catalog (older read-only router) ────────────────────

/**
 * Response shape for `GET /policy/list`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
 */
export interface PolicyListResponse {
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/**
 * Response shape for `GET /policy/info/{policy_name}`.
 *
 * @see https://github.com/BerriAI/litellm/blob/main/litellm/proxy/management_endpoints/policy_endpoints/endpoints.py
 */
export interface PolicyInfoResponse {
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Body for `POST /policy/validate`. */
export interface PolicyValidateParams {
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Response shape for `POST /policy/validate`. */
export interface PolicyValidationResponse {
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Body for `POST /policy/test`. */
export interface PolicyTestParams {
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}

/** Response shape for `POST /policy/test`. */
export interface PolicyTestResponse {
  /** Forward-compat passthrough. */
  [key: string]: unknown;
}
