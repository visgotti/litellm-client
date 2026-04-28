import type {
  RagIngestParams,
  RagIngestResponse,
  RagQueryParams,
  RagQueryResponse,
} from '../types/rag';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class RagResource {
  constructor(private request: RequestFn) {}

  /** POST /v1/rag/ingest */
  ingest(params: RagIngestParams, options?: RequestOptions): Promise<RagIngestResponse> {
    return this.request<RagIngestResponse>({
      method: 'POST',
      path: '/v1/rag/ingest',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /v1/rag/query */
  query(params: RagQueryParams, options?: RequestOptions): Promise<RagQueryResponse> {
    return this.request<RagQueryResponse>({
      method: 'POST',
      path: '/v1/rag/query',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
