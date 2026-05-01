// ─────────────────────────────────────────────────────────────────────────────
// Containers API (POST /v1/containers — code-interpreter sandboxes)
// ─────────────────────────────────────────────────────────────────────────────

import type { CursorPaginationParams, CursorPage } from './common';

/**
 * Expiration policy for a container.
 * `anchor` is the reference point (e.g. "last_active_at") and `minutes` the
 * idle window before automatic deletion.
 *
 * @see https://docs.litellm.ai/docs/containers
 */
export interface ContainerExpiresAfter {
  /** Reference point for the expiry timer (e.g. `'last_active_at'`). */
  anchor: 'last_active_at' | (string & {});
  /** Minutes after the anchor at which the container expires. */
  minutes: number;
}

/**
 * Parameters for creating a code-interpreter container.
 *
 * @see https://docs.litellm.ai/docs/containers
 */
export interface ContainerCreateParams {
  /** Human-readable name for the container. */
  name: string;
  /** Optional automatic-expiry policy. */
  expires_after?: ContainerExpiresAfter;
  /** File IDs to seed into the container's working directory. */
  file_ids?: string[];
  /** LiteLLM extension: route to a specific provider. */
  custom_llm_provider?: string;
  /** Free-form additional fields forwarded to the upstream provider. */
  [key: string]: unknown;
}

/**
 * A code-interpreter container.
 *
 * @see https://docs.litellm.ai/docs/containers
 */
export interface ContainerObject {
  /** Unique identifier. */
  id: string;
  /** Always `'container'`. */
  object: 'container';
  /** Unix timestamp (seconds) of creation. */
  created_at: number;
  /** Human-readable name. */
  name: string;
  /** Lifecycle state of the container. */
  status: 'active' | 'expired' | (string & {});
  /** Block describing the container's expiration policy. */
  expires_after?: ContainerExpiresAfter | null;
  /**
   * Absolute Unix timestamp at which the container expires. Returned as a
   * flat field by the proxy alongside `expires_after`.
   */
  expires_at?: number | null;
  /** Files attached to the container at creation time or via file uploads. */
  file_ids?: string[];
  /** Unix timestamp of the last activity in the container. */
  last_active_at?: number | null;
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Query parameters for listing containers.
 *
 * @see https://docs.litellm.ai/docs/containers
 */
export interface ContainerListParams extends CursorPaginationParams {
  /** LiteLLM extension: provider routing. */
  custom_llm_provider?: string;
}

export type ContainerListResponse = CursorPage<ContainerObject>;

/**
 * Response from deleting a container.
 *
 * @see https://docs.litellm.ai/docs/containers
 */
export interface ContainerDeleteResponse {
  /** ID of the deleted container. */
  id: string;
  /** Always `'container.deleted'`. */
  object: 'container.deleted' | (string & {});
  /** `true` if the container was deleted. */
  deleted: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Container Files — sub-resource of /v1/containers/{container_id}/files
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A file stored inside a code-interpreter container.
 *
 * Container files are typically created automatically when the code
 * interpreter generates outputs (charts, CSVs, images, etc.), or by uploading
 * a file via `POST /v1/containers/{container_id}/files`.
 *
 * @see https://docs.litellm.ai/docs/container_files
 */
export interface ContainerFileObject {
  /** Unique identifier. */
  id: string;
  /** Always `'container.file'`. */
  object: 'container.file' | (string & {});
  /** ID of the parent container. */
  container_id: string;
  /** Size in bytes. */
  bytes: number;
  /** Unix timestamp (seconds) when the file was created. */
  created_at: number;
  /** Original filename. */
  filename?: string;
  /** Container-side path of the file. */
  path?: string;
  /** Where this file came from (e.g. "code_interpreter"). */
  source?: 'code_interpreter' | (string & {});
  /** Free-form additional fields forwarded by the upstream provider. */
  [key: string]: unknown;
}

/**
 * Parameters for uploading a file into a container.
 *
 * @see https://docs.litellm.ai/docs/container_files
 */
export interface ContainerFileCreateParams {
  /** File contents — Buffer / Uint8Array / Blob / string. */
  file: ArrayBuffer | Uint8Array | Blob | string;
  /** Filename to send to the server. */
  filename: string;
  /** Optional MIME type for the file. */
  contentType?: string;
}

/**
 * Query parameters for listing container files.
 *
 * @see https://docs.litellm.ai/docs/container_files
 */
export interface ContainerFileListParams {
  /** Cursor for use in pagination — id of the last item from the previous page. */
  after?: string;
  /** Page size, 1–100. Defaults to 20 server-side. */
  limit?: number;
  /** Sort order by created_at: "asc" or "desc". Defaults to "desc" server-side. */
  order?: 'asc' | 'desc';
}

/**
 * Paginated list of container files.
 *
 * @see https://docs.litellm.ai/docs/container_files
 */
export interface ContainerFileListResponse {
  /** Always `'list'`. */
  object: 'list';
  /** Page of container files. */
  data: ContainerFileObject[];
  /** ID of the first file in the page. */
  first_id?: string | null;
  /** ID of the last file in the page. */
  last_id?: string | null;
  /** Whether more files exist after this page. */
  has_more?: boolean;
}

/**
 * Response from deleting a container file.
 *
 * @see https://docs.litellm.ai/docs/container_files
 */
export interface ContainerFileDeleteResponse {
  /** ID of the deleted file. */
  id: string;
  /** Always `'container.file.deleted'`. */
  object: 'container.file.deleted' | (string & {});
  /** `true` if the file was deleted. */
  deleted: boolean;
}
