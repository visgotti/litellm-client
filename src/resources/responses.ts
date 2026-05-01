import type {
  ResponseCreateParams,
  ResponseCreateParamsNonStreaming,
  ResponseCreateParamsStreaming,
  ResponseObject,
  ResponseStreamEvent,
  ResponseDeleteResponse,
  ResponseListInputItemsParams,
  ResponseInputItemsList,
  ResponseCompactParams,
  ResponseCompactResponse,
  ResponseListParams,
  ResponseListResponse,
} from '../types/responses';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';

export class ResponsesResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  /**
   * Create a response using the OpenAI Responses API.
   *
   * When `params.stream === true` this returns a `Stream<ResponseStreamEvent>`
   * of incremental events; otherwise it returns a fully-materialized
   * `ResponseObject`. Use `retrieve`, `cancel`, and `delete` for lifecycle
   * management of background or stored responses.
   *
   * @param params - Responses request body: `model`, `input`, plus tool
   *   configuration, sampling params, and optional `stream: true`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ResponseObject` for non-streaming calls, or a
   *   `Stream<ResponseStreamEvent>` when `stream: true` is set.
   *
   * @see https://docs.litellm.ai/docs/response_api
   */
  create(
    params: ResponseCreateParamsNonStreaming,
    options?: RequestOptions,
  ): Promise<ResponseObject>;
  create(
    params: ResponseCreateParamsStreaming,
    options?: RequestOptions,
  ): Promise<Stream<ResponseStreamEvent>>;
  create(
    params: ResponseCreateParams,
    options?: RequestOptions,
  ): Promise<ResponseObject | Stream<ResponseStreamEvent>>;
  create(
    params: ResponseCreateParams,
    options?: RequestOptions,
  ): Promise<ResponseObject | Stream<ResponseStreamEvent>> {
    if ('stream' in params && params.stream === true) {
      return this.streamRequest<ResponseStreamEvent>({
        method: 'POST',
        path: '/v1/responses',
        body: { kind: 'json', value: params },
        options,
      });
    }
    return this.request<ResponseObject>({
      method: 'POST',
      path: '/v1/responses',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * List previously created responses (`GET /v1/responses`, alias `/responses`).
   *
   * @param params - Optional pagination / filter query (`limit`, `after`, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A page of `ResponseObject` records.
   */
  list(
    params: ResponseListParams = {},
    options?: RequestOptions,
  ): Promise<ResponseListResponse> {
    return this.request<ResponseListResponse>({
      method: 'GET',
      path: '/v1/responses',
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
   * Retrieve a previously created response by id.
   *
   * @param responseId - The id returned from `create`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The `ResponseObject` for the given id.
   *
   * @see https://docs.litellm.ai/docs/response_api
   */
  retrieve(responseId: string, options?: RequestOptions): Promise<ResponseObject> {
    return this.request<ResponseObject>({
      method: 'GET',
      path: `/v1/responses/${encodeURIComponent(responseId)}`,
      options,
    });
  }

  /**
   * Cancel an in-progress response.
   *
   * Only meaningful for background or long-running responses; finished
   * responses cannot be cancelled.
   *
   * @param responseId - The id of the response to cancel.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The updated `ResponseObject` reflecting the cancelled state.
   *
   * @see https://docs.litellm.ai/docs/response_api
   */
  cancel(responseId: string, options?: RequestOptions): Promise<ResponseObject> {
    return this.request<ResponseObject>({
      method: 'POST',
      path: `/v1/responses/${encodeURIComponent(responseId)}/cancel`,
      options,
    });
  }

  /**
   * Delete a stored response and any associated server-side state.
   *
   * @param responseId - The id of the response to delete.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ResponseDeleteResponse` confirming the deletion.
   *
   * @see https://docs.litellm.ai/docs/response_api
   */
  delete(responseId: string, options?: RequestOptions): Promise<ResponseDeleteResponse> {
    return this.request<ResponseDeleteResponse>({
      method: 'DELETE',
      path: `/v1/responses/${encodeURIComponent(responseId)}`,
      options,
    });
  }

  /**
   * List the input items recorded on a response (paginated).
   *
   * @param responseId - The id of the response whose input items to list.
   * @param params - Pagination filters (`after`, `before`, `limit`, `order`, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ResponseInputItemsList` page of input items.
   *
   * @see https://docs.litellm.ai/docs/response_api
   */
  listInputItems(
    responseId: string,
    params: ResponseListInputItemsParams = {},
    options?: RequestOptions,
  ): Promise<ResponseInputItemsList> {
    return this.request<ResponseInputItemsList>({
      method: 'GET',
      path: `/v1/responses/${encodeURIComponent(responseId)}/input_items`,
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
   * Summarize / compact a long response chain to fit smaller context windows.
   *
   * LiteLLM-specific helper that wraps the proxy's compaction endpoint;
   * useful for reducing token cost on long agent loops.
   *
   * @param params - Compaction request body. Defaults to `{}` to use proxy
   *   defaults.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ResponseCompactResponse` describing the compacted output.
   *
   * @see https://docs.litellm.ai/docs/response_api_compact
   */
  compact(
    params: ResponseCompactParams = {},
    options?: RequestOptions,
  ): Promise<ResponseCompactResponse> {
    return this.request<ResponseCompactResponse>({
      method: 'POST',
      path: '/v1/responses/compact',
      body: { kind: 'json', value: params },
      options,
    });
  }
}
