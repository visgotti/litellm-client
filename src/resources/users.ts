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
  UserBulkUpdateParams,
  UserBulkUpdateResponse,
  UserDailyActivityAggregatedParams,
  UserDailyActivityAggregatedResponse,
} from '../types/users';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class UsersResource {
  constructor(private request: RequestFn) {}

  /** POST /user/new */
  create(params: UserCreateParams = {}, options?: RequestOptions): Promise<UserCreateResponse> {
    return this.request<UserCreateResponse>({
      method: 'POST',
      path: '/user/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /user/update */
  update(params: UserUpdateParams, options?: RequestOptions): Promise<UserUpdateResponse> {
    return this.request<UserUpdateResponse>({
      method: 'POST',
      path: '/user/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /user/delete */
  delete(params: UserDeleteParams, options?: RequestOptions): Promise<UserDeleteResponse> {
    return this.request<UserDeleteResponse>({
      method: 'POST',
      path: '/user/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /user/info?user_id=... */
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

  /** GET /v2/user/info — extended user info. */
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

  /** GET /user/list */
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

  /** GET /user/get_users */
  getUsers(options?: RequestOptions): Promise<UserListResponse> {
    return this.request<UserListResponse>({
      method: 'GET',
      path: '/user/get_users',
      options,
    });
  }

  /** GET /user/available_roles — list available user roles + permissions. */
  availableRoles(options?: RequestOptions): Promise<UserAvailableRolesResponse> {
    return this.request<UserAvailableRolesResponse>({
      method: 'GET',
      path: '/user/available_roles',
      options,
    });
  }

  /** POST /user/bulk_update */
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

  /** GET /user/daily/activity/aggregated */
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
