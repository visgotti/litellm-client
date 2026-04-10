import type {
  UserCreateParams,
  UserCreateResponse,
  UserUpdateParams,
  UserDeleteParams,
  UserDeleteResponse,
  UserInfo,
} from '../types/users';
import type { RequestFn } from '../client';

export class UsersResource {
  constructor(private request: RequestFn) {}

  async create(params: UserCreateParams): Promise<UserCreateResponse> {
    return this.request<UserCreateResponse>('POST', '/user/new', params);
  }

  async update(params: UserUpdateParams): Promise<unknown> {
    return this.request('POST', '/user/update', params);
  }

  async delete(params: UserDeleteParams): Promise<UserDeleteResponse> {
    return this.request<UserDeleteResponse>('POST', '/user/delete', params);
  }

  async info(userId: string): Promise<UserInfo> {
    return this.request<UserInfo>('GET', `/user/info?user_id=${encodeURIComponent(userId)}`);
  }
}
