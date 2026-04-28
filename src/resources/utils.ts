import type {
  TokenCounterParams,
  TokenCounterResponse,
  TransformRequestParams,
  TransformRequestResponse,
  SupportedOpenAiParamsQuery,
  SupportedOpenAiParamsResponse,
  RoutesResponse,
  AvailableRoutesResponse,
} from '../types/utils';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class UtilsResource {
  constructor(private request: RequestFn) {}

  /** POST /utils/token_counter */
  tokenCounter(
    params: TokenCounterParams,
    options?: RequestOptions,
  ): Promise<TokenCounterResponse> {
    return this.request<TokenCounterResponse>({
      method: 'POST',
      path: '/utils/token_counter',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** POST /utils/transform_request */
  transformRequest(
    params: TransformRequestParams,
    options?: RequestOptions,
  ): Promise<TransformRequestResponse> {
    return this.request<TransformRequestResponse>({
      method: 'POST',
      path: '/utils/transform_request',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /utils/supported_openai_params */
  supportedOpenAiParams(
    params: SupportedOpenAiParamsQuery,
    options?: RequestOptions,
  ): Promise<SupportedOpenAiParamsResponse> {
    return this.request<SupportedOpenAiParamsResponse>({
      method: 'GET',
      path: '/utils/supported_openai_params',
      options: {
        ...(options ?? {}),
        query: { ...(options?.query ?? {}), ...params } as Record<
          string,
          string | number | boolean | undefined | null
        >,
      },
    });
  }

  /** GET /routes */
  routes(options?: RequestOptions): Promise<RoutesResponse> {
    return this.request<RoutesResponse>({
      method: 'GET',
      path: '/routes',
      options,
    });
  }

  /** GET /utils/available_routes */
  availableRoutes(options?: RequestOptions): Promise<AvailableRoutesResponse> {
    return this.request<AvailableRoutesResponse>({
      method: 'GET',
      path: '/utils/available_routes',
      options,
    });
  }
}
