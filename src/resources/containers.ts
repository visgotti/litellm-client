import type {
  ContainerCreateParams,
  ContainerObject,
  ContainerListParams,
  ContainerListResponse,
  ContainerDeleteResponse,
  ContainerFileObject,
  ContainerFileCreateParams,
  ContainerFileListParams,
  ContainerFileListResponse,
  ContainerFileDeleteResponse,
} from '../types/containers';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, RawRequestFn } from '../client';
import { toBlob } from '../internal/form';

export class ContainerFilesResource {
  constructor(
    private request: RequestFn,
    private rawRequest: RawRequestFn,
  ) {}

  /**
   * Upload a file into a container.
   *
   * Sent as a multipart upload. The file becomes available inside the
   * container's working filesystem at the given filename.
   *
   * @param containerId - The id of the target container.
   * @param params - File upload params: `file`, `filename`, optional
   *   `contentType`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created `ContainerFileObject`.
   *
   * @see https://docs.litellm.ai/docs/container_files
   */
  create(
    containerId: string,
    params: ContainerFileCreateParams,
    options?: RequestOptions,
  ): Promise<ContainerFileObject> {
    const form = new FormData();
    const blob = toBlob(params.file, params.contentType ?? 'application/octet-stream');
    form.append('file', blob, params.filename);
    return this.request<ContainerFileObject>({
      method: 'POST',
      path: `/v1/containers/${encodeURIComponent(containerId)}/files`,
      body: { kind: 'form', value: form },
      options,
    });
  }

  /**
   * List files inside a container (paginated).
   *
   * @param containerId - The id of the container.
   * @param params - Pagination filters: `after`, `before`, `limit`, `order`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ContainerFileListResponse` page of files.
   *
   * @see https://docs.litellm.ai/docs/container_files
   */
  list(
    containerId: string,
    params: ContainerFileListParams = {},
    options?: RequestOptions,
  ): Promise<ContainerFileListResponse> {
    return this.request<ContainerFileListResponse>({
      method: 'GET',
      path: `/v1/containers/${encodeURIComponent(containerId)}/files`,
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
   * Retrieve metadata for a file inside a container.
   *
   * @param containerId - The id of the container.
   * @param fileId - The id of the file inside the container.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `ContainerFileObject`.
   *
   * @see https://docs.litellm.ai/docs/container_files
   */
  retrieve(
    containerId: string,
    fileId: string,
    options?: RequestOptions,
  ): Promise<ContainerFileObject> {
    return this.request<ContainerFileObject>({
      method: 'GET',
      path: `/v1/containers/${encodeURIComponent(containerId)}/files/${encodeURIComponent(fileId)}`,
      options,
    });
  }

  /**
   * Delete a file from a container.
   *
   * @param containerId - The id of the container.
   * @param fileId - The id of the file to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ContainerFileDeleteResponse` confirming removal.
   *
   * @see https://docs.litellm.ai/docs/container_files
   */
  delete(
    containerId: string,
    fileId: string,
    options?: RequestOptions,
  ): Promise<ContainerFileDeleteResponse> {
    return this.request<ContainerFileDeleteResponse>({
      method: 'DELETE',
      path: `/v1/containers/${encodeURIComponent(containerId)}/files/${encodeURIComponent(fileId)}`,
      options,
    });
  }

  /**
   * Download the raw bytes of a file inside a container.
   *
   * The response body is buffered into an `ArrayBuffer`.
   *
   * @param containerId - The id of the container.
   * @param fileId - The id of the file to download.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The file's raw bytes as an `ArrayBuffer`.
   *
   * @see https://docs.litellm.ai/docs/container_files
   */
  async content(
    containerId: string,
    fileId: string,
    options?: RequestOptions,
  ): Promise<ArrayBuffer> {
    const response = await this.rawRequest({
      method: 'GET',
      path: `/v1/containers/${encodeURIComponent(containerId)}/files/${encodeURIComponent(fileId)}/content`,
      options,
    });
    return await response.arrayBuffer();
  }
}

export class ContainersResource {
  readonly files: ContainerFilesResource;

  constructor(
    private request: RequestFn,
    rawRequest: RawRequestFn,
  ) {
    this.files = new ContainerFilesResource(request, rawRequest);
  }

  /**
   * Create a new container for tool/code-execution sessions.
   *
   * @param params - Container creation params: `name`, optional `expires_after`,
   *   `file_ids` to seed, etc.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created `ContainerObject`.
   *
   * @see https://docs.litellm.ai/docs/containers
   */
  create(params: ContainerCreateParams, options?: RequestOptions): Promise<ContainerObject> {
    return this.request<ContainerObject>({
      method: 'POST',
      path: '/v1/containers',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List containers (paginated).
   *
   * @param params - Pagination filters: `after`, `before`, `limit`, `order`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ContainerListResponse` page of containers.
   *
   * @see https://docs.litellm.ai/docs/containers
   */
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

  /**
   * Retrieve a container by id.
   *
   * @param containerId - The id of the container.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `ContainerObject`.
   *
   * @see https://docs.litellm.ai/docs/containers
   */
  retrieve(containerId: string, options?: RequestOptions): Promise<ContainerObject> {
    return this.request<ContainerObject>({
      method: 'GET',
      path: `/v1/containers/${encodeURIComponent(containerId)}`,
      options,
    });
  }

  /**
   * Delete a container and any files inside it.
   *
   * @param containerId - The id of the container to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ContainerDeleteResponse` confirming removal.
   *
   * @see https://docs.litellm.ai/docs/containers
   */
  delete(containerId: string, options?: RequestOptions): Promise<ContainerDeleteResponse> {
    return this.request<ContainerDeleteResponse>({
      method: 'DELETE',
      path: `/v1/containers/${encodeURIComponent(containerId)}`,
      options,
    });
  }
}
