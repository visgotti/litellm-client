// ─────────────────────────────────────────────────────────────────────────────
// SCIM v2 (System for Cross-domain Identity Management)
//
// Mirrors the LiteLLM proxy's SCIM v2 surface, which conforms to:
//   • RFC 7643 — SCIM Core Schema (User, Group, ResourceType, Schema, ServiceProviderConfig)
//   • RFC 7644 — SCIM Protocol (ListResponse, PatchOp, error format)
//
// Identity providers (Okta, Azure AD/Entra, JumpCloud, OneLogin, …) consume
// these endpoints to provision and de-provision users + groups against the
// LiteLLM proxy.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Common pagination + filter parameters accepted by every SCIM list endpoint.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2 (Query Resources)
 */
export interface ScimListParams {
  /** 1-based index of the first result to return. Defaults to 1. */
  startIndex?: number;
  /** Page size (1–100). Defaults to 10. */
  count?: number;
  /** SCIM filter expression, e.g. `userName eq "alice@example.com"`. */
  filter?: string;
  /** Free-form additions (e.g. `attributes`, `excludedAttributes`, `sortBy`). */
  [key: string]: unknown;
}

/**
 * `meta` envelope attached to every SCIM resource.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-3.1
 */
export interface ScimMeta {
  resourceType?: string;
  created?: string;
  lastModified?: string;
  location?: string;
  version?: string;
  [key: string]: unknown;
}

/**
 * Complex `name` sub-attribute of a SCIM User.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-4.1.1
 */
export interface ScimUserName {
  formatted?: string | null;
  familyName?: string | null;
  givenName?: string | null;
  middleName?: string | null;
  honorificPrefix?: string | null;
  honorificSuffix?: string | null;
  [key: string]: unknown;
}

/**
 * Multi-valued `emails` entry on a SCIM User.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-4.1.2
 */
export interface ScimUserEmail {
  /** RFC 5321 mailbox address (required). */
  value: string;
  /** Mailbox label, e.g. `"work"` or `"home"`. */
  type?: string | null;
  /** Whether this is the primary mailbox for the user. */
  primary?: boolean | null;
  display?: string | null;
  [key: string]: unknown;
}

/**
 * `groups` sub-attribute on a User — a back-reference to groups the user
 * belongs to (read-only on most identity providers).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-4.1.2
 */
export interface ScimUserGroup {
  /** Group id (`SCIMGroup.id`). */
  value: string;
  /** Human-readable display name for the group. */
  display?: string | null;
  /** Membership type — defaults to `"direct"`. */
  type?: string | null;
  [key: string]: unknown;
}

/**
 * SCIM User resource (RFC 7643 §4.1).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-4.1
 */
export interface ScimUser {
  /** Schema URIs — typically `["urn:ietf:params:scim:schemas:core:2.0:User"]`. */
  schemas: string[];
  /** Server-assigned unique identifier (set on responses). */
  id?: string | null;
  /** Identifier set by the provisioning client (e.g. Okta's `externalId`). */
  externalId?: string | null;
  /** Resource metadata block. */
  meta?: ScimMeta | null;
  /** RFC 7643 §4.1.1 — unique handle, typically the login. */
  userName?: string | null;
  /** Complex name sub-attribute. */
  name?: ScimUserName | null;
  /** Display name shown in admin UIs. */
  displayName?: string | null;
  /** Whether the user is active in the directory (deactivation = soft delete). */
  active?: boolean;
  /** Multi-valued mailbox addresses. */
  emails?: ScimUserEmail[] | null;
  /** Back-reference to groups the user is a member of. */
  groups?: ScimUserGroup[] | null;
  /** Free-form additions (enterprise extensions, custom attributes, …). */
  [key: string]: unknown;
}

/**
 * Member entry of a SCIM Group's `members` collection.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-4.2
 */
export interface ScimGroupMember {
  /** ID of the referenced User (or nested Group). */
  value: string;
  /** Human-readable display name for the member. */
  display?: string | null;
  /** Member type, e.g. `"User"` or `"Group"`. */
  type?: string | null;
  [key: string]: unknown;
}

/**
 * SCIM Group resource (RFC 7643 §4.2).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-4.2
 */
export interface ScimGroup {
  /** Schema URIs — typically `["urn:ietf:params:scim:schemas:core:2.0:Group"]`. */
  schemas: string[];
  /** Server-assigned unique identifier. */
  id?: string | null;
  /** Identifier set by the provisioning client. */
  externalId?: string | null;
  /** Resource metadata block. */
  meta?: ScimMeta | null;
  /** Human-readable group name (required by the proxy). */
  displayName: string;
  /** Group members. */
  members?: ScimGroupMember[] | null;
  /** Free-form additions. */
  [key: string]: unknown;
}

/**
 * SCIM ListResponse envelope used by Users, Groups, ResourceTypes, Schemas.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7644#section-3.4.2
 */
export interface ScimListResponse<T> {
  /** Always `["urn:ietf:params:scim:api:messages:2.0:ListResponse"]`. */
  schemas: string[];
  /** Total resources matching the (optionally filtered) query. */
  totalResults: number;
  /** 1-based index of the first item in `Resources`. */
  startIndex?: number | null;
  /** Number of items returned in this page. */
  itemsPerPage?: number | null;
  /** Page contents — case-sensitive `Resources` per RFC 7644. */
  Resources: T[];
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH (RFC 7644 §3.5.2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single op in a SCIM PATCH request.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7644#section-3.5.2
 */
export interface ScimPatchOperation {
  /** `"add"` | `"replace"` | `"remove"` (case-insensitive per the RFC). */
  op: string;
  /** Targeted attribute path, e.g. `"emails[type eq \"work\"].value"`. */
  path?: string | null;
  /** Value supplied for `add` / `replace` operations. */
  value?: unknown;
  [key: string]: unknown;
}

/**
 * Request body for `PATCH /scim/v2/Users/{id}` and `PATCH /scim/v2/Groups/{id}`.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7644#section-3.5.2
 */
export interface ScimPatchOp {
  /** Defaults to `["urn:ietf:params:scim:api:messages:2.0:PatchOp"]`. */
  schemas?: string[];
  Operations: ScimPatchOperation[];
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Method param aliases
// ─────────────────────────────────────────────────────────────────────────────

/** Body for `POST /scim/v2/Users`. */
export type ScimUserCreateParams = ScimUser;
/** Body for `PUT /scim/v2/Users/{id}` (full replacement). */
export type ScimUserReplaceParams = ScimUser;
/** Body for `PATCH /scim/v2/Users/{id}`. */
export type ScimUserPatchParams = ScimPatchOp;

/** Body for `POST /scim/v2/Groups`. */
export type ScimGroupCreateParams = ScimGroup;
/** Body for `PUT /scim/v2/Groups/{id}` (full replacement). */
export type ScimGroupReplaceParams = ScimGroup;
/** Body for `PATCH /scim/v2/Groups/{id}`. */
export type ScimGroupPatchParams = ScimPatchOp;

/** Concrete list-response shape returned by `GET /scim/v2/Users`. */
export type ScimUserListResponse = ScimListResponse<ScimUser>;
/** Concrete list-response shape returned by `GET /scim/v2/Groups`. */
export type ScimGroupListResponse = ScimListResponse<ScimGroup>;

// ─────────────────────────────────────────────────────────────────────────────
// Discovery / metadata
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Capability flag block used inside ServiceProviderConfig.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-5
 */
export interface ScimFeature {
  supported: boolean;
  maxOperations?: number | null;
  maxPayloadSize?: number | null;
  maxResults?: number | null;
  [key: string]: unknown;
}

/**
 * Body of `GET /scim/v2/ServiceProviderConfig` (RFC 7643 §5).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-5
 */
export interface ScimServiceProviderConfig {
  /** Defaults to `["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"]`. */
  schemas?: string[];
  patch?: ScimFeature;
  bulk?: ScimFeature;
  filter?: ScimFeature;
  changePassword?: ScimFeature;
  sort?: ScimFeature;
  etag?: ScimFeature;
  authenticationSchemes?: Array<Record<string, unknown>> | null;
  meta?: ScimMeta | null;
  [key: string]: unknown;
}

/**
 * Body of `GET /scim/v2/ResourceTypes/{id}` (RFC 7643 §6).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-6
 */
export interface ScimResourceType {
  schemas?: string[];
  id?: string;
  name?: string;
  endpoint?: string;
  description?: string;
  schema?: string;
  schemaExtensions?: Array<{ schema: string; required?: boolean; [key: string]: unknown }>;
  meta?: ScimMeta | null;
  [key: string]: unknown;
}

/**
 * Body of `GET /scim/v2/Schemas/{uri}` (RFC 7643 §7).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-7
 */
export interface ScimSchema {
  id?: string;
  name?: string;
  description?: string;
  attributes?: Array<Record<string, unknown>>;
  meta?: ScimMeta | null;
  [key: string]: unknown;
}

/** `GET /scim/v2/ResourceTypes` returns a ListResponse. */
export type ScimResourceTypeListResponse = ScimListResponse<ScimResourceType>;
/** `GET /scim/v2/Schemas` returns a ListResponse. */
export type ScimSchemaListResponse = ScimListResponse<ScimSchema>;

/**
 * The base discovery endpoint (`GET /scim/v2`) returns a ListResponse of
 * ResourceTypes, but identity providers occasionally treat it opaquely so we
 * keep the response loosely typed.
 */
export type ScimDiscoverResponse = ScimResourceTypeListResponse | Record<string, unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SCIM error envelope per RFC 7644 §3.12.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7644#section-3.12
 */
export interface ScimErrorResponse {
  /** Always `["urn:ietf:params:scim:api:messages:2.0:Error"]`. */
  schemas: string[];
  /** Stringified HTTP status (RFC requires it as a string). */
  status: string;
  /** SCIM-specific detail token, e.g. `"uniqueness"`, `"invalidFilter"`. */
  scimType?: string;
  /** Human-readable error description. */
  detail?: string;
  [key: string]: unknown;
}
