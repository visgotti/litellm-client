import type {
  AuditListParams,
  AuditListResponse,
  AuditLogEntry,
} from '../types/audit';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

/** Audit log endpoints (`/audit`). */
export class AuditResource {
  constructor(private request: RequestFn) {}

  /** `GET /audit` — paginated audit log listing with optional filters. */
  async list(params?: AuditListParams, options?: RequestOptions): Promise<AuditListResponse> {
    return this.request<AuditListResponse>({
      method: 'GET',
      path: '/audit',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...(params ?? {}) } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** `GET /audit/{id}` — a single audit log entry. */
  async retrieve(id: string, options?: RequestOptions): Promise<AuditLogEntry> {
    return this.request<AuditLogEntry>({
      method: 'GET',
      path: `/audit/${encodeURIComponent(id)}`,
      options,
    });
  }
}
