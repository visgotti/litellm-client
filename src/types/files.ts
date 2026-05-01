// ─────────────────────────────────────────────────────────────────────────────
// Files API (OpenAI-compatible)  POST/GET/DELETE /v1/files[/{id}[/content]]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Intended use for an uploaded file.
 *
 * - `fine-tune`: Training data for a fine-tuning job.
 * - `fine-tune-results`: Result file produced by a fine-tuning job.
 * - `assistants`: Knowledge file referenced by an assistant.
 * - `assistants_output`: Output written by an assistant run.
 * - `batch`: JSONL input for the Batches API.
 * - `batch_output`: Result file written by a batch.
 * - `vision`: Image used as multi-modal input.
 * - `user_data`: User-supplied file for general use.
 */
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

/**
 * Stored file metadata.
 *
 * @see https://docs.litellm.ai/docs/files_endpoints
 */
export interface FileObject {
  /** Unique identifier. */
  id: string;
  /** Always `'file'`. */
  object: 'file';
  /** Size of the file in bytes. */
  bytes: number;
  /** Unix timestamp (seconds) of upload. */
  created_at: number;
  /** Original filename submitted at upload time. */
  filename: string;
  /** Intended use of the file. */
  purpose: FilePurpose;
  /** Processing state of the file. */
  status?: 'uploaded' | 'processed' | 'error' | (string & {});
  /** Human-readable details when `status === 'error'`. */
  status_details?: string | null;
  /** Provider used to store the file (e.g. `'openai'`). */
  custom_llm_provider?: string;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Paginated list of stored files.
 *
 * @see https://docs.litellm.ai/docs/files_endpoints
 */
export interface FileListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** All files matching the query. */
  data: FileObject[];
}

/**
 * Parameters for uploading a new file.
 *
 * @see https://docs.litellm.ai/docs/files_endpoints
 */
export interface FileCreateParams {
  /** File contents — Buffer / Uint8Array / Blob / string. */
  file: ArrayBuffer | Uint8Array | Blob | string;
  /** Filename to send to the server. */
  filename: string;
  /** Intended use of the file. */
  purpose: FilePurpose;
  /** Optional MIME type for the file. */
  contentType?: string;
  /** Override the LiteLLM provider used to store the file. */
  custom_llm_provider?: string;
}

/**
 * Response from deleting a file.
 *
 * @see https://docs.litellm.ai/docs/files_endpoints
 */
export interface FileDeleteResponse {
  /** Identifier of the deleted file. */
  id: string;
  /** Always `'file'`. */
  object: 'file';
  /** `true` if the file was deleted. */
  deleted: boolean;
}

/**
 * Query parameters for listing files.
 *
 * @see https://docs.litellm.ai/docs/files_endpoints
 */
export interface FileListParams {
  /** Filter by intended purpose. */
  purpose?: FilePurpose;
  /** Filter to files stored with a specific LiteLLM provider. */
  custom_llm_provider?: string;
}
