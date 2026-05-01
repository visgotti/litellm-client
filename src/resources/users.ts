import type {
  UserCreateParams,
  UserCreateResponse,
  UserUpdateParams,
  UserUpdateResponse,
  UserDeleteParams,
  UserDeleteResponse,
  UserInfoResponse,
  UserListParams,
  UserListResponse,
  UserInfoV2Response,
  UserAvailableRolesResponse,
  UserAvailableUsersResponse,
  UserBulkUpdateParams,
  UserBulkUpdateResponse,
  UserDailyActivityAggregatedParams,
  UserDailyActivityAggregatedResponse,
} from '../types/users';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class UsersResource {
  constructor(private request: RequestFn) {}

  /**
   * Create a new internal user (`POST /user/new`).
   *
   * @param params - User attributes (email, role, models, budget, metadata, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created user record, including any auto-generated key.
   *
   * @see https://docs.litellm.ai/docs/proxy/users
   */
  create(params: UserCreateParams = {}, options?: RequestOptions): Promise<UserCreateResponse> {
    return this.request<UserCreateResponse>({
      method: 'POST',
      path: '/user/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Update an existing internal user (`POST /user/update`).
   *
   * @param params - User identifier plus fields to update.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated user record.
   *
   * @see https://docs.litellm.ai/docs/proxy/users
   */
  update(params: UserUpdateParams, options?: RequestOptions): Promise<UserUpdateResponse> {
    return this.request<UserUpdateResponse>({
      method: 'POST',
      path: '/user/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Delete one or more internal users (`POST /user/delete`).
   *
   * @param params - User ids to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Deletion result with counts and any errors.
   *
   * @see https://docs.litellm.ai/docs/proxy/users
   */
  delete(params: UserDeleteParams, options?: RequestOptions): Promise<UserDeleteResponse> {
    return this.request<UserDeleteResponse>({
      method: 'POST',
      path: '/user/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Get info for a single user, or the calling user when `userId` is omitted (`GET /user/info`).
   *
   * @param userId - Optional user id to look up; defaults to the caller.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The user's profile, keys, teams, and budget info.
   *
   * @see https://docs.litellm.ai/docs/proxy/users
   */
  info(userId?: string, options?: RequestOptions): Promise<UserInfoResponse> {
    return this.request<UserInfoResponse>({
      method: 'GET',
      path: '/user/info',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...(userId ? { user_id: userId } : {}) },
      },
    });
  }

  /**
   * Extended user info with richer per-user fields (`GET /v2/user/info`).
   *
   * @param userId - Optional user id to look up; defaults to the caller.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The v2 user info payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/users
   */
  infoV2(userId?: string, options?: RequestOptions): Promise<UserInfoV2Response> {
    return this.request<UserInfoV2Response>({
      method: 'GET',
      path: '/v2/user/info',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...(userId ? { user_id: userId } : {}) },
      },
    });
  }

  /**
   * List internal users with optional filtering and pagination (`GET /user/list`).
   *
   * @param params - Optional filters (role, page, page_size, etc.)
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A paginated list of user records.
   *
   * @see https://docs.litellm.ai/docs/proxy/users
   */
  list(params: UserListParams = {}, options?: RequestOptions): Promise<UserListResponse> {
    return this.request<UserListResponse>({
      method: 'GET',
      path: '/user/list',
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
   * List the available user roles plus their permissions (`GET /user/available_roles`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A map of role name to permission descriptor.
   *
   * @see https://docs.litellm.ai/docs/proxy/users
   */
  availableRoles(options?: RequestOptions): Promise<UserAvailableRolesResponse> {
    return this.request<UserAvailableRolesResponse>({
      method: 'GET',
      path: '/user/available_roles',
      options,
    });
  }

  /**
   * Report seat usage / availability — total vs. used user and team seats
   * (`GET /user/available_users`).
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Seat usage summary.
   *
   * @see https://docs.litellm.ai/docs/proxy/users
   */
  availableUsers(options?: RequestOptions): Promise<UserAvailableUsersResponse> {
    return this.request<UserAvailableUsersResponse>({
      method: 'GET',
      path: '/user/available_users',
      options,
    });
  }

  /**
   * Update many users in a single call (`POST /user/bulk_update`).
   *
   * @param params - Bulk update payload with per-user updates.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Per-user results including successes and any errors.
   *
   * @see https://docs.litellm.ai/docs/proxy/users
   */
  bulkUpdate(
    params: UserBulkUpdateParams,
    options?: RequestOptions,
  ): Promise<UserBulkUpdateResponse> {
    return this.request<UserBulkUpdateResponse>({
      method: 'POST',
      path: '/user/bulk_update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Aggregated daily activity across users for a date range (`GET /user/daily/activity/aggregated`).
   *
   * @param params - Date range and optional grouping filters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns Daily aggregates of requests, tokens, and spend.
   *
   * @see https://docs.litellm.ai/docs/proxy/users
   */
  dailyActivityAggregated(
    params: UserDailyActivityAggregatedParams,
    options?: RequestOptions,
  ): Promise<UserDailyActivityAggregatedResponse> {
    return this.request<UserDailyActivityAggregatedResponse>({
      method: 'GET',
      path: '/user/daily/activity/aggregated',
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
