import type {
  TeamCreateParams,
  TeamCreateResponse,
  TeamUpdateParams,
  TeamDeleteParams,
  TeamDeleteResponse,
  TeamInfo,
  TeamMemberAddParams,
  TeamMemberDeleteParams,
} from '../types/teams';
import type { RequestFn } from '../client';

export class TeamsResource {
  constructor(private request: RequestFn) {}

  async create(params: TeamCreateParams): Promise<TeamCreateResponse> {
    return this.request<TeamCreateResponse>('POST', '/team/new', params);
  }

  async update(params: TeamUpdateParams): Promise<unknown> {
    return this.request('POST', '/team/update', params);
  }

  async delete(params: TeamDeleteParams): Promise<TeamDeleteResponse> {
    return this.request<TeamDeleteResponse>('POST', '/team/delete', params);
  }

  async info(teamId: string): Promise<TeamInfo> {
    return this.request<TeamInfo>('GET', `/team/info?team_id=${encodeURIComponent(teamId)}`);
  }

  async addMember(params: TeamMemberAddParams): Promise<unknown> {
    return this.request('POST', '/team/member_add', params);
  }

  async deleteMember(params: TeamMemberDeleteParams): Promise<unknown> {
    return this.request('POST', '/team/member_delete', params);
  }
}
