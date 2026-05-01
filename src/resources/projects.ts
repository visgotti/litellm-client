import type {
  ProjectCreateParams,
  ProjectCreateResponse,
  ProjectUpdateParams,
  ProjectDeleteParams,
  ProjectDeleteResponse,
  ProjectInfoParams,
  ProjectInfo,
  ProjectListResponse,
} from '../types/projects';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class ProjectsResource {
  constructor(private request: RequestFn) {}

  /** Create a new project. POST /project/new */
  async create(
    params: ProjectCreateParams,
    options?: RequestOptions,
  ): Promise<ProjectCreateResponse> {
    return this.request<ProjectCreateResponse>({
      method: 'POST',
      path: '/project/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** Update an existing project. POST /project/update */
  async update(params: ProjectUpdateParams, options?: RequestOptions): Promise<ProjectInfo> {
    return this.request<ProjectInfo>({
      method: 'POST',
      path: '/project/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** Delete one or more projects. DELETE /project/delete */
  async delete(
    params: ProjectDeleteParams,
    options?: RequestOptions,
  ): Promise<ProjectDeleteResponse> {
    return this.request<ProjectDeleteResponse>({
      method: 'DELETE',
      path: '/project/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Get info for a specific project. GET /project/info
   *
   * `project_id` is required by the proxy. The optional signature exists so
   * callers can construct the params object inline; passing nothing throws
   * a 422 from the proxy.
   */
  async info(params?: ProjectInfoParams, options?: RequestOptions): Promise<ProjectInfo> {
    const projectId = params?.project_id ?? '';
    return this.request<ProjectInfo>({
      method: 'GET',
      path: '/project/info',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), project_id: projectId },
      },
    });
  }

  /** List projects the caller has access to. GET /project/list */
  async list(options?: RequestOptions): Promise<ProjectListResponse> {
    return this.request<ProjectListResponse>({
      method: 'GET',
      path: '/project/list',
      options,
    });
  }
}
