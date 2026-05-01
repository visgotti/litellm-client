import type { ISODateString } from './common';

// ─────────────────────────────────────────────────────────────────────────────
// Audit log endpoints
// ─────────────────────────────────────────────────────────────────────────────

/** Query parameters accepted by `GET /audit`. */
export interface AuditListParams {
  /** 1-based page index. */
  page?: number;
  /** Number of records per page (server default is 10). */
  page_size?: number;
  /** Filter by the user_id / key that performed the action. */
  changed_by?: string;
  /** Filter by the API key (hash) that performed the action. */
  changed_by_api_key?: string;
  /** Filter by audit action (e.g. "created", "updated", "deleted"). */
  action?: string;
  /** Filter by the database table the change applies to. */
  table_name?: string;
  /** Filter by the row's primary id. */
  object_id?: string;
  /** Inclusive ISO-8601 lower bound on `updated_at`. */
  start_date?: string;
  /** Inclusive ISO-8601 upper bound on `updated_at`. */
  end_date?: string;
  /** Filter by team id when auditing team-scoped objects. */
  object_team_id?: string;
  /** Filter by key hash when auditing key-scoped objects. */
  object_key_hash?: string;
  /** Column to sort by. */
  sort_by?: string;
  /** Sort direction. */
  sort_order?: 'asc' | 'desc';
}

/** A single audit log entry as returned by the proxy. */
export interface AuditLogEntry {
  id: string;
  updated_at: ISODateString;
  changed_by: string | null;
  changed_by_api_key?: string | null;
  action: string;
  table_name: string;
  object_id: string;
  before_value?: unknown;
  updated_values?: unknown;
  [key: string]: unknown;
}

/** Paginated response from `GET /audit`. */
export interface AuditListResponse {
  audit_logs: AuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
