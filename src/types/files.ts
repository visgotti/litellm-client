// ─────────────────────────────────────────────────────────────────────────────
// Files API (OpenAI-compatible)  POST/GET/DELETE /v1/files[/{id}[/content]]
// ─────────────────────────────────────────────────────────────────────────────

export type FilePurpose =
  | 'fine-tune'
  | 'fine-tune-results'
  | 'assistants'
  | 'assistants_output'
  | 'batch'
  | 'batch_output'
  | 'vision'
  | 'user_data'
  | (string & {});

export interface FileObject {
  id: string;
  object: 'file';
  bytes: number;
  created_at: number;
  filename: string;
  purpose: FilePurpose;
  status?: 'uploaded' | 'processed' | 'error' | (string & {});
  status_details?: string | null;
  /** Provider used to store the file (e.g. "openai") */
  custom_llm_provider?: string;
  [key: string]: unknown;
}

export interface FileListResponse {
  object: 'list';
  data: FileObject[];
}

export interface FileCreateParams {
  /** File contents – Buffer / Uint8Array / Blob / string. */
  file: ArrayBuffer | Uint8Array | Blob | string;
  /** Filename to send to the server. */
  filename: string;
  purpose: FilePurpose;
  /** Optional MIME type for the file. */
  contentType?: string;
  custom_llm_provider?: string;
}

export interface FileDeleteResponse {
  id: string;
  object: 'file';
  deleted: boolean;
}

export interface FileListParams {
  purpose?: FilePurpose;
  custom_llm_provider?: string;
}
