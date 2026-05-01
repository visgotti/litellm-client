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

  /**
   * Attach an uploaded file to a vector store.
   *
   * The `params.file_id` must reference a file uploaded via `files.create()`.
   * The vector store will index the file's content for retrieval.
   *
   * @param vectorStoreId - The id of the target vector store.
   * @param params - Attachment params: `file_id`, plus optional
   *   `chunking_strategy` and `attributes`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created `VectorStoreFileObject` with indexing status.
   *
   * @see https://docs.litellm.ai/docs/vector_store_files
   */
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

  /**
   * List files attached to a vector store (paginated).
   *
   * @param vectorStoreId - The id of the vector store.
   * @param params - Pagination/filter params: `after`, `before`, `limit`,
   *   `order`, `filter` by status.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreFileListResponse` page of files.
   *
   * @see https://docs.litellm.ai/docs/vector_store_files
   */
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

  /**
   * Retrieve a specific file attached to a vector store.
   *
   * @param vectorStoreId - The id of the vector store.
   * @param fileId - The id of the attached file.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `VectorStoreFileObject` for the attachment.
   *
   * @see https://docs.litellm.ai/docs/vector_store_files
   */
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

  /**
   * Retrieve the parsed/chunked content for an attached file.
   *
   * Returns the indexed text chunks, useful for inspecting how the vector
   * store split a document.
   *
   * @param vectorStoreId - The id of the vector store.
   * @param fileId - The id of the attached file.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreFileContentResponse` containing chunked content.
   *
   * @see https://docs.litellm.ai/docs/vector_store_files
   */
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

  /**
   * Update metadata/attributes on an attached file.
   *
   * @param vectorStoreId - The id of the vector store.
   * @param fileId - The id of the attached file to update.
   * @param params - Fields to update (e.g. `attributes`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated `VectorStoreFileObject`.
   *
   * @see https://docs.litellm.ai/docs/vector_store_files
   */
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

  /**
   * Detach a file from a vector store.
   *
   * The underlying file (uploaded via `files.create`) is unaffected.
   *
   * @param vectorStoreId - The id of the vector store.
   * @param fileId - The id of the attached file to detach.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreFileDeletedResponse` confirming detachment.
   *
   * @see https://docs.litellm.ai/docs/vector_store_files
   */
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

  /**
   * Register a new managed vector store on the proxy.
   *
   * Creates a record in LiteLLM's database-backed vector store registry,
   * which is distinct from the OpenAI-shape `/v1/vector_stores` resources.
   *
   * @param params - Management create params (provider, credentials, name, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreManagementCreateResponse` describing the registry entry.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
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

  /**
   * List managed vector stores registered on the proxy.
   *
   * @param params - Optional pagination/filter params.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreManagementListResponse` of registry entries.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
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

  /**
   * Fetch detailed info for a single managed vector store.
   *
   * @param params - Identifies the registry entry to look up.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreManagementInfoResponse`.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
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

  /**
   * Update a managed vector store registry entry.
   *
   * @param params - Update payload (id plus fields to change).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreManagementUpdateResponse`.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
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

  /**
   * Remove a managed vector store registry entry.
   *
   * @param params - Identifies the registry entry to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreManagementDeleteResponse` confirming removal.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
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

  /**
   * Create a new vector index.
   *
   * Used by index-based vector providers exposed through the proxy under
   * `/v1/indexes`.
   *
   * @param params - Index creation parameters.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns An `IndexCreateResponse` describing the new index.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
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

  /**
   * Create a new OpenAI-shape vector store.
   *
   * @param params - Vector store config: optional `name`, `file_ids`,
   *   `chunking_strategy`, `expires_after`, `metadata`. Defaults to `{}`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The newly created `VectorStoreObject`.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
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

  /**
   * List vector stores (paginated).
   *
   * @param params - Pagination filters: `after`, `before`, `limit`, `order`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreListResponse` page of vector stores.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
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

  /**
   * Retrieve a vector store by id.
   *
   * @param vectorStoreId - The id of the vector store.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `VectorStoreObject`.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
  retrieve(vectorStoreId: string, options?: RequestOptions): Promise<VectorStoreObject> {
    return this.request<VectorStoreObject>({
      method: 'GET',
      path: `/v1/vector_stores/${encodeURIComponent(vectorStoreId)}`,
      options,
    });
  }

  /**
   * Update a vector store's config or metadata.
   *
   * @param vectorStoreId - The id of the vector store to update.
   * @param params - Fields to update (e.g. `name`, `expires_after`, `metadata`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated `VectorStoreObject`.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
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

  /**
   * Delete a vector store and its file attachments.
   *
   * @param vectorStoreId - The id of the vector store to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreDeletedResponse` confirming removal.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/create
   */
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

  /**
   * Run a similarity search against a vector store.
   *
   * @param vectorStoreId - The id of the vector store to search.
   * @param params - Search request: `query`, optional `max_num_results`,
   *   `filters`, `ranking_options`, `rewrite_query`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `VectorStoreSearchResponse` with ranked matches.
   *
   * @see https://docs.litellm.ai/docs/vector_stores/search
   */
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
