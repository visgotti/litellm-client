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

  /** POST /organization/new */
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

  /** PATCH /organization/update */
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

  /** DELETE /organization/delete */
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

  /** GET /organization/list */
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

  /** GET /organization/info?organization_id=... */
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

  /** POST /organization/info — DEPRECATED, prefer `info`. */
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

  /** POST /organization/member_add */
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

  /** PATCH /organization/member_update */
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

  /** DELETE /organization/member_delete */
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

  /** GET /organization/daily/activity */
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
