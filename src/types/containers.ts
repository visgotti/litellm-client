// ─────────────────────────────────────────────────────────────────────────────
// Containers API (POST /v1/containers — code-interpreter sandboxes)
// ─────────────────────────────────────────────────────────────────────────────

import type { CursorPaginationParams, CursorPage } from './common';

/**
 * Expiration policy for a container.
 * `anchor` is the reference point (e.g. "last_active_at") and `minutes` the
 * idle window before automatic deletion.
 */
export interface ContainerExpiresAfter {
  anchor: 'last_active_at' | (string & {});
  minutes: number;
}

export interface ContainerCreateParams {
  /** Human-readable name for the container. */
  name: string;
  /** Optional automatic-expiry policy. */
  expires_after?: ContainerExpiresAfter;
  /** File IDs to seed into the container's working directory. */
  file_ids?: string[];
  /** LiteLLM extension: route to a specific provider. */
  custom_llm_provider?: string;
  [key: string]: unknown;
}

export interface ContainerObject {
  id: string;
  object: 'container';
  created_at: number;
  name: string;
  status: 'active' | 'expired' | (string & {});
  expires_after?: ContainerExpiresAfter | null;
  last_active_at?: number | null;
  [key: string]: unknown;
}

export interface ContainerListParams extends CursorPaginationParams {
  /** LiteLLM extension: provider routing. */
  custom_llm_provider?: string;
}

export type ContainerListResponse = CursorPage<ContainerObject>;

export interface ContainerDeleteResponse {
  id: string;
  object: 'container.deleted' | (string & {});
  deleted: boolean;
}
