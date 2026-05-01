import type {
  ScimDiscoverResponse,
  ScimGroup,
  ScimGroupCreateParams,
  ScimGroupListResponse,
  ScimGroupPatchParams,
  ScimGroupReplaceParams,
  ScimListParams,
  ScimResourceType,
  ScimResourceTypeListResponse,
  ScimSchema,
  ScimSchemaListResponse,
  ScimServiceProviderConfig,
  ScimUser,
  ScimUserCreateParams,
  ScimUserListResponse,
  ScimUserPatchParams,
  ScimUserReplaceParams,
} from '../types/scim';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

// Helper — merge SCIM list params (startIndex, count, filter, …) into the
// per-request `query` bag without mutating the caller's options.
function withListQuery(
  options: RequestOptions | undefined,
  params: ScimListParams | undefined,
): RequestOptions {
  return {
    ...(options ?? {}),
    query: { ...(options?.query ?? {}), ...(params ?? {}) } as Record<
      string,
      string | number | boolean | undefined | null
    >,
  };
}

// ── Users ───────────────────────────────────────────────────────────────────

/**
 * `client.scim.users` — SCIM v2 User provisioning endpoints.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7644#section-3.2
 */
export class ScimUsersResource {
  constructor(private request: RequestFn) {}

  /** GET /scim/v2/Users — list users with optional pagination + filter. */
  list(
    params?: ScimListParams,
    options?: RequestOptions,
  ): Promise<ScimUserListResponse> {
    return this.request<ScimUserListResponse>({
      method: 'GET',
      path: '/scim/v2/Users',
      options: withListQuery(options, params),
    });
  }

  /** POST /scim/v2/Users — create a new SCIM user. Returns 201 with the SCIMUser. */
  create(params: ScimUserCreateParams, options?: RequestOptions): Promise<ScimUser> {
    return this.request<ScimUser>({
      method: 'POST',
      path: '/scim/v2/Users',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /scim/v2/Users/{id} — fetch a single user by id. */
  retrieve(id: string, options?: RequestOptions): Promise<ScimUser> {
    return this.request<ScimUser>({
      method: 'GET',
      path: `/scim/v2/Users/${encodeURIComponent(id)}`,
      options,
    });
  }

  /** PUT /scim/v2/Users/{id} — full-replacement update. */
  replace(
    id: string,
    params: ScimUserReplaceParams,
    options?: RequestOptions,
  ): Promise<ScimUser> {
    return this.request<ScimUser>({
      method: 'PUT',
      path: `/scim/v2/Users/${encodeURIComponent(id)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** PATCH /scim/v2/Users/{id} — partial update via SCIM PatchOp. */
  update(
    id: string,
    params: ScimUserPatchParams,
    options?: RequestOptions,
  ): Promise<ScimUser> {
    return this.request<ScimUser>({
      method: 'PATCH',
      path: `/scim/v2/Users/${encodeURIComponent(id)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** DELETE /scim/v2/Users/{id} — returns 204 on success. */
  delete(id: string, options?: RequestOptions): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      path: `/scim/v2/Users/${encodeURIComponent(id)}`,
      options,
    });
  }
}

// ── Groups ──────────────────────────────────────────────────────────────────

/**
 * `client.scim.groups` — SCIM v2 Group provisioning endpoints.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7644#section-3.2
 */
export class ScimGroupsResource {
  constructor(private request: RequestFn) {}

  /** GET /scim/v2/Groups — list groups with optional pagination + filter. */
  list(
    params?: ScimListParams,
    options?: RequestOptions,
  ): Promise<ScimGroupListResponse> {
    return this.request<ScimGroupListResponse>({
      method: 'GET',
      path: '/scim/v2/Groups',
      options: withListQuery(options, params),
    });
  }

  /** POST /scim/v2/Groups — create a new SCIM group. Returns 201 with the SCIMGroup. */
  create(params: ScimGroupCreateParams, options?: RequestOptions): Promise<ScimGroup> {
    return this.request<ScimGroup>({
      method: 'POST',
      path: '/scim/v2/Groups',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /scim/v2/Groups/{id} — fetch a single group by id. */
  retrieve(id: string, options?: RequestOptions): Promise<ScimGroup> {
    return this.request<ScimGroup>({
      method: 'GET',
      path: `/scim/v2/Groups/${encodeURIComponent(id)}`,
      options,
    });
  }

  /** PUT /scim/v2/Groups/{id} — full-replacement update. */
  replace(
    id: string,
    params: ScimGroupReplaceParams,
    options?: RequestOptions,
  ): Promise<ScimGroup> {
    return this.request<ScimGroup>({
      method: 'PUT',
      path: `/scim/v2/Groups/${encodeURIComponent(id)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** PATCH /scim/v2/Groups/{id} — partial update via SCIM PatchOp. */
  update(
    id: string,
    params: ScimGroupPatchParams,
    options?: RequestOptions,
  ): Promise<ScimGroup> {
    return this.request<ScimGroup>({
      method: 'PATCH',
      path: `/scim/v2/Groups/${encodeURIComponent(id)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** DELETE /scim/v2/Groups/{id} — returns 204 on success. */
  delete(id: string, options?: RequestOptions): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      path: `/scim/v2/Groups/${encodeURIComponent(id)}`,
      options,
    });
  }
}

// ── ResourceTypes ───────────────────────────────────────────────────────────

/**
 * `client.scim.resourceTypes` — SCIM v2 ResourceType discovery (RFC 7644 §4).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7644#section-4
 */
export class ScimResourceTypesResource {
  constructor(private request: RequestFn) {}

  /** GET /scim/v2/ResourceTypes — list every ResourceType the proxy serves. */
  list(options?: RequestOptions): Promise<ScimResourceTypeListResponse> {
    return this.request<ScimResourceTypeListResponse>({
      method: 'GET',
      path: '/scim/v2/ResourceTypes',
      options,
    });
  }

  /** GET /scim/v2/ResourceTypes/{id} — fetch a single ResourceType by id. */
  retrieve(id: string, options?: RequestOptions): Promise<ScimResourceType> {
    return this.request<ScimResourceType>({
      method: 'GET',
      path: `/scim/v2/ResourceTypes/${encodeURIComponent(id)}`,
      options,
    });
  }
}

// ── Schemas ─────────────────────────────────────────────────────────────────

/**
 * `client.scim.schemas` — SCIM v2 Schema discovery (RFC 7643 §7).
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643#section-7
 */
export class ScimSchemasResource {
  constructor(private request: RequestFn) {}

  /** GET /scim/v2/Schemas — list every Schema the proxy advertises. */
  list(options?: RequestOptions): Promise<ScimSchemaListResponse> {
    return this.request<ScimSchemaListResponse>({
      method: 'GET',
      path: '/scim/v2/Schemas',
      options,
    });
  }

  /** GET /scim/v2/Schemas/{id} — fetch a single Schema by URI. */
  retrieve(id: string, options?: RequestOptions): Promise<ScimSchema> {
    return this.request<ScimSchema>({
      method: 'GET',
      path: `/scim/v2/Schemas/${encodeURIComponent(id)}`,
      options,
    });
  }
}

// ── SCIM root ───────────────────────────────────────────────────────────────

/**
 * `client.scim` — SCIM v2 surface for identity-provider provisioning.
 *
 * Conforms to RFC 7643 (core schema) + RFC 7644 (protocol). All sub-resources
 * are mounted on the same `/scim/v2` prefix.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7643
 * @see https://datatracker.ietf.org/doc/html/rfc7644
 */
export class ScimResource {
  readonly users: ScimUsersResource;
  readonly groups: ScimGroupsResource;
  readonly resourceTypes: ScimResourceTypesResource;
  readonly schemas: ScimSchemasResource;

  constructor(private request: RequestFn) {
    this.users = new ScimUsersResource(request);
    this.groups = new ScimGroupsResource(request);
    this.resourceTypes = new ScimResourceTypesResource(request);
    this.schemas = new ScimSchemasResource(request);
  }

  /** GET /scim/v2 — base SCIM discovery endpoint (RFC 7644 §4). */
  discover(options?: RequestOptions): Promise<ScimDiscoverResponse> {
    return this.request<ScimDiscoverResponse>({
      method: 'GET',
      path: '/scim/v2',
      options,
    });
  }

  /** GET /scim/v2/ServiceProviderConfig — capability advertisement (RFC 7643 §5). */
  serviceProviderConfig(options?: RequestOptions): Promise<ScimServiceProviderConfig> {
    return this.request<ScimServiceProviderConfig>({
      method: 'GET',
      path: '/scim/v2/ServiceProviderConfig',
      options,
    });
  }
}
