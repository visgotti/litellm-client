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
} from '../types/teams';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class TeamsResource {
  constructor(private request: RequestFn) {}

  /**
   * Create a new team (`POST /team/new`).
   *
   * @param params - Team attributes (name, models, budget, members, metadata, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created team record.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
  create(params: TeamCreateParams = {}, options?: RequestOptions): Promise<TeamCreateResponse> {
    return this.request<TeamCreateResponse>({
      method: 'POST',
      path: '/team/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing team (`POST /team/update`).
   *
   * @param params - Team id plus fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated team record.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
  update(params: TeamUpdateParams, options?: RequestOptions): Promise<TeamUpdateResponse> {
    return this.request<TeamUpdateResponse>({
      method: 'POST',
      path: '/team/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete one or more teams (`POST /team/delete`).
   *
   * @param params - Team ids to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion result with counts and any errors.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
  delete(params: TeamDeleteParams, options?: RequestOptions): Promise<TeamDeleteResponse> {
    return this.request<TeamDeleteResponse>({
      method: 'POST',
      path: '/team/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Fetch info for a single team (`GET /team/info`).
   *
   * @param teamId - The team id to look up.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The team record including members, models, and budget info.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
  info(teamId: string, options?: RequestOptions): Promise<TeamInfo> {
    return this.request<TeamInfo>({
      method: 'GET',
      path: '/team/info',
      options: { ...(options ?? {}), query: { ...(options?.query ?? {}), team_id: teamId } },
    });
  }

  /**
   * List teams with optional filtering and pagination (`GET /team/list`).
   *
   * @param params - Optional filters (organization_id, user_id, page, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A paginated list of team records.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Add a member to a team (`POST /team/member_add`).
   *
   * @param params - Team id plus the member(s) to add.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated team plus the added member records.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Remove a member from a team (`POST /team/member_delete`).
   *
   * @param params - Team id plus the member to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated team record.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Update a member's role or limits within a team (`POST /team/member_update`).
   *
   * @param params - Team id, target member, plus fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated team record.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Block a team from making further requests (`POST /team/block`).
   *
   * @param params - The team to block.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated team record reflecting the blocked state.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
  block(params: TeamBlockParams, options?: RequestOptions): Promise<TeamCreateResponse> {
    return this.request<TeamCreateResponse>({
      method: 'POST',
      path: '/team/block',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Unblock a previously blocked team (`POST /team/unblock`).
   *
   * @param params - The team to unblock.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated team record reflecting the unblocked state.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
  unblock(params: TeamUnblockParams, options?: RequestOptions): Promise<TeamCreateResponse> {
    return this.request<TeamCreateResponse>({
      method: 'POST',
      path: '/team/unblock',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * v2 team listing with extended fields (`GET /v2/team/list`).
   *
   * @param params - Optional filters (organization_id, user_id, page, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A paginated list of team records (v2 shape).
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * List teams the calling user is allowed to join (`GET /team/available`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Teams that are available to the caller.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
  available(options?: RequestOptions): Promise<TeamAvailableResponse> {
    return this.request<TeamAvailableResponse>({
      method: 'GET',
      path: '/team/available',
      options,
    });
  }

  /**
   * Add many members to a team in one call (`POST /team/bulk_member_add`).
   *
   * @param params - Team id plus the list of members to add.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Bulk-add result including successes and any errors.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Add a model to a team's allowed list (`POST /team/model/add`).
   *
   * @param params - Team id plus the model(s) to grant access to.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated team's allowed-models list.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Remove a model from a team's allowed list (`POST /team/model/delete`).
   *
   * @param params - Team id plus the model(s) to revoke.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated team's allowed-models list.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * List a team's permission settings (`GET /team/permissions_list`).
   *
   * @param params - The team id to inspect.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The team's effective permission set.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Update a team's permission settings (`POST /team/permissions_update`).
   *
   * @param params - Team id plus permissions to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated permission record.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Bulk-update permissions across many teams (`POST /team/permissions_bulk_update`).
   *
   * @param params - Per-team permission updates.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Bulk update result including successes and any errors.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Daily activity for a single team across a date range (`GET /team/daily/activity`).
   *
   * @param params - Team id and date range.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Daily aggregates of requests, tokens, and spend.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Configure a logging callback for a team (`POST /team/{team_id}/callback`).
   *
   * @param params - Team id plus callback configuration.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The team's resulting callback configuration.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

  /**
   * Get the configured logging callback for a team (`GET /team/{team_id}/callback`).
   *
   * @param teamId - The team to inspect.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The team's callback configuration.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
  getCallback(teamId: string, options?: RequestOptions): Promise<TeamCallbackResponse> {
    return this.request<TeamCallbackResponse>({
      method: 'GET',
      path: `/team/${encodeURIComponent(teamId)}/callback`,
      options,
    });
  }

  /**
   * Disable logging for a team (`POST /team/{team_id}/disable_logging`).
   *
   * @param teamId - The team to disable logging for.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Confirmation that logging is disabled for the team.
   *
   * @see https://docs.litellm.ai/docs/proxy/teams
   */
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

}
