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

  /**
   * Ingest documents into a RAG index via `/v1/rag/ingest`.
   *
   * @param params - The ingest payload (documents, index target, embedding options).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The ingest result, including any per-document status info.
   *
   * @see https://docs.litellm.ai/docs/rag_ingest
   */
  ingest(params: RagIngestParams, options?: RequestOptions): Promise<RagIngestResponse> {
    return this.request<RagIngestResponse>({
      method: 'POST',
      path: '/v1/rag/ingest',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Query a RAG index via `/v1/rag/query`.
   *
   * @param params - The query payload (question, index target, retrieval options).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The retrieved documents and (optionally) a generated answer.
   *
   * @see https://docs.litellm.ai/docs/rag_query
   */
  query(params: RagQueryParams, options?: RequestOptions): Promise<RagQueryResponse> {
    return this.request<RagQueryResponse>({
      method: 'POST',
      path: '/v1/rag/query',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
