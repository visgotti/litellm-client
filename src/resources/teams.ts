import type {
  TeamCreateParams,
  TeamCreateResponse,
  TeamUpdateParams,
  TeamUpdateResponse,
  TeamDeleteParams,
  TeamDeleteResponse,
  TeamInfo,
  TeamMemberAddParams,
  TeamMemberAddResponse,
  TeamMemberDeleteParams,
  TeamMemberUpdateParams,
  TeamBlockParams,
  TeamUnblockParams,
  TeamListParams,
  TeamListResponse,
  TeamListV2Response,
  TeamAvailableResponse,
  TeamBulkMemberAddParams,
  TeamBulkMemberAddResponse,
  TeamModelAddParams,
  TeamModelAddResponse,
  TeamModelDeleteParams,
  TeamModelDeleteResponse,
  TeamPermissionsListParams,
  TeamPermissionsListResponse,
  TeamPermissionsUpdateParams,
  TeamPermissionsUpdateResponse,
  TeamPermissionsBulkUpdateParams,
  TeamPermissionsBulkUpdateResponse,
  TeamDailyActivityParams,
  TeamDailyActivityResponse,
  TeamCallbackAddParams,
  TeamCallbackResponse,
  TeamDisableLoggingResponse,
  TeamMembershipMeResponse,
} from '../types/teams';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class TeamsResource {
  constructor(private request: RequestFn) {}

  /** POST /team/new */
  create(params: TeamCreateParams = {}, options?: RequestOptions): Promise<TeamCreateResponse> {
    return this.request<TeamCreateResponse>({
      method: 'POST',
      path: '/team/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /team/update */
  update(params: TeamUpdateParams, options?: RequestOptions): Promise<TeamUpdateResponse> {
    return this.request<TeamUpdateResponse>({
      method: 'POST',
      path: '/team/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /team/delete */
  delete(params: TeamDeleteParams, options?: RequestOptions): Promise<TeamDeleteResponse> {
    return this.request<TeamDeleteResponse>({
      method: 'POST',
      path: '/team/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /team/info */
  info(teamId: string, options?: RequestOptions): Promise<TeamInfo> {
    return this.request<TeamInfo>({
      method: 'GET',
      path: '/team/info',
      options: { ...(options ?? {}), query: { ...(options?.query ?? {}), team_id: teamId } },
    });
  }

  /** GET /team/list */
  list(params: TeamListParams = {}, options?: RequestOptions): Promise<TeamListResponse> {
    return this.request<TeamListResponse>({
      method: 'GET',
      path: '/team/list',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** POST /team/member_add */
  addMember(
    params: TeamMemberAddParams,
    options?: RequestOptions,
  ): Promise<TeamMemberAddResponse> {
    return this.request<TeamMemberAddResponse>({
      method: 'POST',
      path: '/team/member_add',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /team/member_delete */
  deleteMember(
    params: TeamMemberDeleteParams,
    options?: RequestOptions,
  ): Promise<TeamCreateResponse> {
    return this.request<TeamCreateResponse>({
      method: 'POST',
      path: '/team/member_delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /team/member_update */
  updateMember(
    params: TeamMemberUpdateParams,
    options?: RequestOptions,
  ): Promise<TeamCreateResponse> {
    return this.request<TeamCreateResponse>({
      method: 'POST',
      path: '/team/member_update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /team/block */
  block(params: TeamBlockParams, options?: RequestOptions): Promise<TeamCreateResponse> {
    return this.request<TeamCreateResponse>({
      method: 'POST',
      path: '/team/block',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /team/unblock */
  unblock(params: TeamUnblockParams, options?: RequestOptions): Promise<TeamCreateResponse> {
    return this.request<TeamCreateResponse>({
      method: 'POST',
      path: '/team/unblock',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v2/team/list */
  listV2(params: TeamListParams = {}, options?: RequestOptions): Promise<TeamListV2Response> {
    return this.request<TeamListV2Response>({
      method: 'GET',
      path: '/v2/team/list',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /team/available — teams the caller can join. */
  available(options?: RequestOptions): Promise<TeamAvailableResponse> {
    return this.request<TeamAvailableResponse>({
      method: 'GET',
      path: '/team/available',
      options,
    });
  }

  /** POST /team/bulk_member_add */
  bulkMemberAdd(
    params: TeamBulkMemberAddParams,
    options?: RequestOptions,
  ): Promise<TeamBulkMemberAddResponse> {
    return this.request<TeamBulkMemberAddResponse>({
      method: 'POST',
      path: '/team/bulk_member_add',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /team/model/add */
  addModel(
    params: TeamModelAddParams,
    options?: RequestOptions,
  ): Promise<TeamModelAddResponse> {
    return this.request<TeamModelAddResponse>({
      method: 'POST',
      path: '/team/model/add',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /team/model/delete */
  deleteModel(
    params: TeamModelDeleteParams,
    options?: RequestOptions,
  ): Promise<TeamModelDeleteResponse> {
    return this.request<TeamModelDeleteResponse>({
      method: 'POST',
      path: '/team/model/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /team/permissions_list */
  permissionsList(
    params: TeamPermissionsListParams,
    options?: RequestOptions,
  ): Promise<TeamPermissionsListResponse> {
    return this.request<TeamPermissionsListResponse>({
      method: 'GET',
      path: '/team/permissions_list',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), team_id: params.team_id },
      },
    });
  }

  /** POST /team/permissions_update */
  permissionsUpdate(
    params: TeamPermissionsUpdateParams,
    options?: RequestOptions,
  ): Promise<TeamPermissionsUpdateResponse> {
    return this.request<TeamPermissionsUpdateResponse>({
      method: 'POST',
      path: '/team/permissions_update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /team/permissions_bulk_update */
  permissionsBulkUpdate(
    params: TeamPermissionsBulkUpdateParams,
    options?: RequestOptions,
  ): Promise<TeamPermissionsBulkUpdateResponse> {
    return this.request<TeamPermissionsBulkUpdateResponse>({
      method: 'POST',
      path: '/team/permissions_bulk_update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /team/daily/activity */
  dailyActivity(
    params: TeamDailyActivityParams,
    options?: RequestOptions,
  ): Promise<TeamDailyActivityResponse> {
    return this.request<TeamDailyActivityResponse>({
      method: 'GET',
      path: '/team/daily/activity',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** POST /team/{team_id}/callback */
  addCallback(
    params: TeamCallbackAddParams,
    options?: RequestOptions,
  ): Promise<TeamCallbackResponse> {
    const { team_id, ...body } = params;
    return this.request<TeamCallbackResponse>({
      method: 'POST',
      path: `/team/${encodeURIComponent(team_id)}/callback`,
      body: { kind: 'json', value: body },
      options,
    });
  }

  /** GET /team/{team_id}/callback */
  getCallback(teamId: string, options?: RequestOptions): Promise<TeamCallbackResponse> {
    return this.request<TeamCallbackResponse>({
      method: 'GET',
      path: `/team/${encodeURIComponent(teamId)}/callback`,
      options,
    });
  }

  /** POST /team/{team_id}/disable_logging */
  disableLogging(
    teamId: string,
    options?: RequestOptions,
  ): Promise<TeamDisableLoggingResponse> {
    return this.request<TeamDisableLoggingResponse>({
      method: 'POST',
      path: `/team/${encodeURIComponent(teamId)}/disable_logging`,
      options,
    });
  }

  /** GET /team/{team_id}/members/me — caller's membership info for a team. */
  myMembership(
    teamId: string,
    options?: RequestOptions,
  ): Promise<TeamMembershipMeResponse> {
    return this.request<TeamMembershipMeResponse>({
      method: 'GET',
      path: `/team/${encodeURIComponent(teamId)}/members/me`,
      options,
    });
  }
}
