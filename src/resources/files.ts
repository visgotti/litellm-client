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

  /** POST /v1/files (multipart) */
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

  /** GET /v1/files */
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

  /** GET /v1/files/{file_id} */
  retrieve(fileId: string, options?: RequestOptions): Promise<FileObject> {
    return this.request<FileObject>({
      method: 'GET',
      path: `/v1/files/${encodeURIComponent(fileId)}`,
      options,
    });
  }

  /** DELETE /v1/files/{file_id} */
  delete(fileId: string, options?: RequestOptions): Promise<FileDeleteResponse> {
    return this.request<FileDeleteResponse>({
      method: 'DELETE',
      path: `/v1/files/${encodeURIComponent(fileId)}`,
      options,
    });
  }

  /** GET /v1/files/{file_id}/content — returns raw bytes. */
  async content(fileId: string, options?: RequestOptions): Promise<ArrayBuffer> {
    const response = await this.rawRequest({
      method: 'GET',
      path: `/v1/files/${encodeURIComponent(fileId)}/content`,
      options,
    });
    return await response.arrayBuffer();
  }
}
