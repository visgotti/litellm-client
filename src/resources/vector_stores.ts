import type {
  VectorStoreObject,
  VectorStoreCreateParams,
  VectorStoreUpdateParams,
  VectorStoreListParams,
  VectorStoreListResponse,
  VectorStoreDeletedResponse,
  VectorStoreSearchParams,
  VectorStoreSearchResponse,
  VectorStoreFileObject,
  VectorStoreFileCreateParams,
  VectorStoreFileUpdateParams,
  VectorStoreFileListParams,
  VectorStoreFileListResponse,
  VectorStoreFileDeletedResponse,
  VectorStoreFileContentResponse,
  VectorStoreManagementCreateParams,
  VectorStoreManagementCreateResponse,
  VectorStoreManagementListParams,
  VectorStoreManagementListResponse,
  VectorStoreManagementInfoParams,
  VectorStoreManagementInfoResponse,
  VectorStoreManagementUpdateParams,
  VectorStoreManagementUpdateResponse,
  VectorStoreManagementDeleteParams,
  VectorStoreManagementDeleteResponse,
  IndexCreateParams,
  IndexCreateResponse,
} from '../types/vector_stores';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

class VectorStoreFilesResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/vector_stores/{id}/files */
  create(
    vectorStoreId: string,
    params: VectorStoreFileCreateParams,
    options?: RequestOptions,
  ): Promise<VectorStoreFileObject> {
    return this.request<VectorStoreFileObject>({
      method: 'POST',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/files`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1/vector_stores/{id}/files */
  list(
    vectorStoreId: string,
    params: VectorStoreFileListParams = {},
    options?: RequestOptions,
  ): Promise<VectorStoreFileListResponse> {
    return this.request<VectorStoreFileListResponse>({
      method: 'GET',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/files`,
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /v1/vector_stores/{id}/files/{file_id} */
  retrieve(
    vectorStoreId: string,
    fileId: string,
    options?: RequestOptions,
  ): Promise<VectorStoreFileObject> {
    return this.request<VectorStoreFileObject>({
      method: 'GET',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/files/${encodeURIComponent(fileId)}`,
      options,
    });
  }

  /** GET /v1/vector_stores/{id}/files/{file_id}/content */
  content(
    vectorStoreId: string,
    fileId: string,
    options?: RequestOptions,
  ): Promise<VectorStoreFileContentResponse> {
    return this.request<VectorStoreFileContentResponse>({
      method: 'GET',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/files/${encodeURIComponent(fileId)}/content`,
      options,
    });
  }

  /** POST /v1/vector_stores/{id}/files/{file_id} */
  update(
    vectorStoreId: string,
    fileId: string,
    params: VectorStoreFileUpdateParams,
    options?: RequestOptions,
  ): Promise<VectorStoreFileObject> {
    return this.request<VectorStoreFileObject>({
      method: 'POST',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/files/${encodeURIComponent(fileId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** DELETE /v1/vector_stores/{id}/files/{file_id} */
  delete(
    vectorStoreId: string,
    fileId: string,
    options?: RequestOptions,
  ): Promise<VectorStoreFileDeletedResponse> {
    return this.request<VectorStoreFileDeletedResponse>({
      method: 'DELETE',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/files/${encodeURIComponent(fileId)}`,
      options,
    });
  }
}

/**
 * LiteLLM-shape management endpoints (mounted on `/vector_store/*`).
 * Operates on the proxy's database-backed managed vector store registry —
 * distinct from the OpenAI-shape `/v1/vector_stores` endpoints.
 */
class VectorStoreManagementResource {
  constructor(private request: RequestFn) {}

  /** POST /vector_store/new */
  create(
    params: VectorStoreManagementCreateParams,
    options?: RequestOptions,
  ): Promise<VectorStoreManagementCreateResponse> {
    return this.request<VectorStoreManagementCreateResponse>({
      method: 'POST',
      path: '/vector_store/new',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /vector_store/list */
  list(
    params: VectorStoreManagementListParams = {},
    options?: RequestOptions,
  ): Promise<VectorStoreManagementListResponse> {
    return this.request<VectorStoreManagementListResponse>({
      method: 'GET',
      path: '/vector_store/list',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** POST /vector_store/info */
  info(
    params: VectorStoreManagementInfoParams,
    options?: RequestOptions,
  ): Promise<VectorStoreManagementInfoResponse> {
    return this.request<VectorStoreManagementInfoResponse>({
      method: 'POST',
      path: '/vector_store/info',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /vector_store/update */
  update(
    params: VectorStoreManagementUpdateParams,
    options?: RequestOptions,
  ): Promise<VectorStoreManagementUpdateResponse> {
    return this.request<VectorStoreManagementUpdateResponse>({
      method: 'POST',
      path: '/vector_store/update',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /vector_store/delete */
  delete(
    params: VectorStoreManagementDeleteParams,
    options?: RequestOptions,
  ): Promise<VectorStoreManagementDeleteResponse> {
    return this.request<VectorStoreManagementDeleteResponse>({
      method: 'POST',
      path: '/vector_store/delete',
      body: { kind: 'json', value: params },
      options,
    });
  }
}

class VectorStoreIndexesResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/indexes */
  create(params: IndexCreateParams, options?: RequestOptions): Promise<IndexCreateResponse> {
    return this.request<IndexCreateResponse>({
      method: 'POST',
      path: '/v1/indexes',
      body: { kind: 'json', value: params },
      options,
    });
  }
}

export class VectorStoresResource {
  readonly files: VectorStoreFilesResource;
  readonly management: VectorStoreManagementResource;
  readonly indexes: VectorStoreIndexesResource;

  constructor(private request: RequestFn) {
    this.files = new VectorStoreFilesResource(request);
    this.management = new VectorStoreManagementResource(request);
    this.indexes = new VectorStoreIndexesResource(request);
  }

  /** POST /v1/vector_stores */
  create(
    params: VectorStoreCreateParams = {},
    options?: RequestOptions,
  ): Promise<VectorStoreObject> {
    return this.request<VectorStoreObject>({
      method: 'POST',
      path: '/v1/vector_stores',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1/vector_stores */
  list(
    params: VectorStoreListParams = {},
    options?: RequestOptions,
  ): Promise<VectorStoreListResponse> {
    return this.request<VectorStoreListResponse>({
      method: 'GET',
      path: '/v1/vector_stores',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /v1/vector_stores/{id} */
  retrieve(vectorStoreId: string, options?: RequestOptions): Promise<VectorStoreObject> {
    return this.request<VectorStoreObject>({
      method: 'GET',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}`,
      options,
    });
  }

  /** POST /v1/vector_stores/{id} */
  update(
    vectorStoreId: string,
    params: VectorStoreUpdateParams,
    options?: RequestOptions,
  ): Promise<VectorStoreObject> {
    return this.request<VectorStoreObject>({
      method: 'POST',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** DELETE /v1/vector_stores/{id} */
  delete(
    vectorStoreId: string,
    options?: RequestOptions,
  ): Promise<VectorStoreDeletedResponse> {
    return this.request<VectorStoreDeletedResponse>({
      method: 'DELETE',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}`,
      options,
    });
  }

  /** POST /v1/vector_stores/{id}/search */
  search(
    vectorStoreId: string,
    params: VectorStoreSearchParams,
    options?: RequestOptions,
  ): Promise<VectorStoreSearchResponse> {
    return this.request<VectorStoreSearchResponse>({
      method: 'POST',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}/search`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}
