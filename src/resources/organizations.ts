import type {
  OrganizationCreateParams,
  OrganizationCreateResponse,
  OrganizationUpdateParams,
  OrganizationUpdateResponse,
  OrganizationDeleteParams,
  OrganizationDeleteResponse,
  OrganizationListParams,
  OrganizationListResponse,
  OrganizationInfoResponse,
  OrganizationInfoLegacyParams,
  OrganizationInfoLegacyResponse,
  OrganizationMemberAddParams,
  OrganizationMemberAddResponse,
  OrganizationMemberUpdateParams,
  OrganizationMemberUpdateResponse,
  OrganizationMemberDeleteParams,
  OrganizationMemberDeleteResponse,
  OrganizationDailyActivityParams,
  OrganizationDailyActivityResponse,
} from '../types/organizations';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class OrganizationsResource {
  constructor(private request: RequestFn) {}

  /**
   * Create a new organization (`POST /organization/new`).
   *
   * @param params - Organization attributes (alias, models, budget, metadata, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created organization record.
   *
   * @see https://docs.litellm.ai/docs/proxy/organizations
   */
  create(
    params: OrganizationCreateParams,
    options?: RequestOptions,
  ): Promise<OrganizationCreateResponse> {
    return this.request<OrganizationCreateResponse>({
      method: 'POST',
      path: '/organization/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing organization (`PATCH /organization/update`).
   *
   * @param params - Organization id plus fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated organization record.
   *
   * @see https://docs.litellm.ai/docs/proxy/organizations
   */
  update(
    params: OrganizationUpdateParams,
    options?: RequestOptions,
  ): Promise<OrganizationUpdateResponse> {
    return this.request<OrganizationUpdateResponse>({
      method: 'PATCH',
      path: '/organization/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete one or more organizations (`DELETE /organization/delete`).
   *
   * @param params - Organization ids to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion result with counts and any errors.
   *
   * @see https://docs.litellm.ai/docs/proxy/organizations
   */
  delete(
    params: OrganizationDeleteParams,
    options?: RequestOptions,
  ): Promise<OrganizationDeleteResponse> {
    return this.request<OrganizationDeleteResponse>({
      method: 'DELETE',
      path: '/organization/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List organizations with optional filtering and pagination (`GET /organization/list`).
   *
   * @param params - Optional filters (page, page_size, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A paginated list of organization records.
   *
   * @see https://docs.litellm.ai/docs/proxy/organizations
   */
  list(
    params: OrganizationListParams = {},
    options?: RequestOptions,
  ): Promise<OrganizationListResponse> {
    return this.request<OrganizationListResponse>({
      method: 'GET',
      path: '/organization/list',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /**
   * Fetch info for a single organization (`GET /organization/info?organization_id=...`).
   *
   * @param organizationId - The organization id to look up.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The organization record including members, teams, and budget info.
   *
   * @see https://docs.litellm.ai/docs/proxy/organizations
   */
  info(organizationId: string, options?: RequestOptions): Promise<OrganizationInfoResponse> {
    return this.request<OrganizationInfoResponse>({
      method: 'GET',
      path: '/organization/info',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), organization_id: organizationId },
      },
    });
  }

  /**
   * Legacy POST variant of organization info — prefer {@link info} (`POST /organization/info`).
   *
   * @param params - Organization id payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The organization record (legacy shape).
   *
   * @see https://docs.litellm.ai/docs/proxy/organizations
   */
  infoLegacy(
    params: OrganizationInfoLegacyParams,
    options?: RequestOptions,
  ): Promise<OrganizationInfoLegacyResponse> {
    return this.request<OrganizationInfoLegacyResponse>({
      method: 'POST',
      path: '/organization/info',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Add a member to an organization (`POST /organization/member_add`).
   *
   * @param params - Organization id plus the member(s) to add.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The added member record(s).
   *
   * @see https://docs.litellm.ai/docs/proxy/organizations
   */
  addMember(
    params: OrganizationMemberAddParams,
    options?: RequestOptions,
  ): Promise<OrganizationMemberAddResponse> {
    return this.request<OrganizationMemberAddResponse>({
      method: 'POST',
      path: '/organization/member_add',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an organization member's role or limits (`PATCH /organization/member_update`).
   *
   * @param params - Organization id, target member, plus fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated member record.
   *
   * @see https://docs.litellm.ai/docs/proxy/organizations
   */
  updateMember(
    params: OrganizationMemberUpdateParams,
    options?: RequestOptions,
  ): Promise<OrganizationMemberUpdateResponse> {
    return this.request<OrganizationMemberUpdateResponse>({
      method: 'PATCH',
      path: '/organization/member_update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Remove a member from an organization (`DELETE /organization/member_delete`).
   *
   * @param params - Organization id plus the member to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation of the removal.
   *
   * @see https://docs.litellm.ai/docs/proxy/organizations
   */
  deleteMember(
    params: OrganizationMemberDeleteParams,
    options?: RequestOptions,
  ): Promise<OrganizationMemberDeleteResponse> {
    return this.request<OrganizationMemberDeleteResponse>({
      method: 'DELETE',
      path: '/organization/member_delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Daily activity for an organization across a date range (`GET /organization/daily/activity`).
   *
   * @param params - Optional date range and organization filter.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Daily aggregates of requests, tokens, and spend.
   *
   * @see https://docs.litellm.ai/docs/proxy/organizations
   */
  dailyActivity(
    params: OrganizationDailyActivityParams = {},
    options?: RequestOptions,
  ): Promise<OrganizationDailyActivityResponse> {
    return this.request<OrganizationDailyActivityResponse>({
      method: 'GET',
      path: '/organization/daily/activity',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }
}
