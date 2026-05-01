import type {
  FileObject,
  FileListResponse,
  FileCreateParams,
  FileDeleteResponse,
  FileListParams,
} from '../types/files';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, RawRequestFn } from '../client';
import { toBlob } from '../internal/form';

export class FilesResource {
  constructor(
    private request: RequestFn,
    private rawRequest: RawRequestFn,
  ) {}

  /**
   * Upload a file for use with batches, fine-tuning, assistants, etc.
   *
   * Sent as a multipart upload. The `purpose` determines which downstream
   * APIs the file can be used with (`batch`, `fine-tune`, `assistants`,
   * `vision`, etc.).
   *
   * @param params - File upload request: `file` payload, `filename`,
   *   `purpose`, optional `custom_llm_provider`, and optional `contentType`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created `FileObject` with id, size, and purpose metadata.
   *
   * @see https://docs.litellm.ai/docs/files_endpoints
   */
  create(params: FileCreateParams, options?: RequestOptions): Promise<FileObject> {
    const form = new FormData();
    const blob = toBlob(params.file, params.contentType ?? 'application/octet-stream');
    form.append('file', blob, params.filename);
    form.append('purpose', String(params.purpose));
    if (params.custom_llm_provider) {
      form.append('custom_llm_provider', params.custom_llm_provider);
    }
    return this.request<FileObject>({
      method: 'POST',
      path: '/v1/files',
      body: { kind: 'form', value: form },
      options,
    });
  }

  /**
   * List uploaded files, optionally filtered by `purpose`.
   *
   * @param params - Optional filters such as `purpose`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `FileListResponse` enumerating uploaded files.
   *
   * @see https://docs.litellm.ai/docs/files_endpoints
   */
  list(params: FileListParams = {}, options?: RequestOptions): Promise<FileListResponse> {
    return this.request<FileListResponse>({
      method: 'GET',
      path: '/v1/files',
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
   * Retrieve metadata for a single uploaded file.
   *
   * @param fileId - The id returned from `create`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `FileObject` for the given id.
   *
   * @see https://docs.litellm.ai/docs/files_endpoints
   */
  retrieve(fileId: string, options?: RequestOptions): Promise<FileObject> {
    return this.request<FileObject>({
      method: 'GET',
      path: `/v1/files/${encodeURIComponent(fileId)}`,
      options,
    });
  }

  /**
   * Delete an uploaded file.
   *
   * @param fileId - The id of the file to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `FileDeleteResponse` confirming removal.
   *
   * @see https://docs.litellm.ai/docs/files_endpoints
   */
  delete(fileId: string, options?: RequestOptions): Promise<FileDeleteResponse> {
    return this.request<FileDeleteResponse>({
      method: 'DELETE',
      path: `/v1/files/${encodeURIComponent(fileId)}`,
      options,
    });
  }

  /**
   * Download the raw bytes of an uploaded file.
   *
   * The response body is buffered into an `ArrayBuffer`; for batch jobs this
   * is typically the JSONL output content.
   *
   * @param fileId - The id of the file to download.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The file's raw bytes as an `ArrayBuffer`.
   *
   * @see https://docs.litellm.ai/docs/files_endpoints
   */
  async content(fileId: string, options?: RequestOptions): Promise<ArrayBuffer> {
    const response = await this.rawRequest({
      method: 'GET',
      path: `/v1/files/${encodeURIComponent(fileId)}/content`,
      options,
    });
    return await response.arrayBuffer();
  }
}
