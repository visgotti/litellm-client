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
} from '../types/responses';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';

export class ResponsesResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  /** POST /v1/responses */
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

  /** GET /v1/responses/{response_id} */
  retrieve(responseId: string, options?: RequestOptions): Promise<ResponseObject> {
    return this.request<ResponseObject>({
      method: 'GET',
      path: `/v1/responses/${encodeURIComponent(responseId)}`,
      options,
    });
  }

  /** POST /v1/responses/{response_id}/cancel */
  cancel(responseId: string, options?: RequestOptions): Promise<ResponseObject> {
    return this.request<ResponseObject>({
      method: 'POST',
      path: `/v1/responses/${encodeURIComponent(responseId)}/cancel`,
      options,
    });
  }

  /** DELETE /v1/responses/{response_id} */
  delete(responseId: string, options?: RequestOptions): Promise<ResponseDeleteResponse> {
    return this.request<ResponseDeleteResponse>({
      method: 'DELETE',
      path: `/v1/responses/${encodeURIComponent(responseId)}`,
      options,
    });
  }

  /** GET /v1/responses/{response_id}/input_items */
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

  /** POST /v1/responses/compact */
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
