import type {
  ContainerCreateParams,
  ContainerObject,
  ContainerListParams,
  ContainerListResponse,
  ContainerDeleteResponse,
} from '../types/containers';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class ContainersResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/containers */
  create(params: ContainerCreateParams, options?: RequestOptions): Promise<ContainerObject> {
    return this.request<ContainerObject>({
      method: 'POST',
      path: '/v1/containers',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1/containers */
  list(
    params: ContainerListParams = {},
    options?: RequestOptions,
  ): Promise<ContainerListResponse> {
    return this.request<ContainerListResponse>({
      method: 'GET',
      path: '/v1/containers',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /v1/containers/{container_id} */
  retrieve(containerId: string, options?: RequestOptions): Promise<ContainerObject> {
    return this.request<ContainerObject>({
      method: 'GET',
      path: `/v1/containers/${encodeURIComponent(containerId)}`,
      options,
    });
  }

  /** DELETE /v1/containers/{container_id} */
  delete(containerId: string, options?: RequestOptions): Promise<ContainerDeleteResponse> {
    return this.request<ContainerDeleteResponse>({
      method: 'DELETE',
      path: `/v1/containers/${encodeURIComponent(containerId)}`,
      options,
    });
  }
}
