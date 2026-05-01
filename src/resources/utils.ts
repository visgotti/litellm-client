import type {
  TokenCounterParams,
  TokenCounterResponse,
  TransformRequestParams,
  TransformRequestResponse,
  SupportedOpenAiParamsQuery,
  SupportedOpenAiParamsResponse,
  RoutesResponse,
} from '../types/utils';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn } from '../client';

export class UtilsResource {
  constructor(private request: RequestFn) {}

  /**
   * Count tokens for a request using the proxy's local tokenizers.
   *
   * @param params - The token-counting payload (model + messages/text).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The token count result.
   *
   * @see https://docs.litellm.ai/docs/proxy/utils
   */
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

  /**
   * Transform an OpenAI-shaped request into the provider-specific shape the proxy would emit.
   *
   * Useful for debugging routing/translation logic without actually calling a provider.
   *
   * @param params - The OpenAI-shaped request to transform.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The provider-shaped equivalent payload.
   *
   * @see https://docs.litellm.ai/docs/proxy/utils
   */
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

  /**
   * List the OpenAI-style request params supported by a given model/provider.
   *
   * @param params - Query parameters identifying the target model/provider.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The list of supported OpenAI param keys for that target.
   *
   * @see https://docs.litellm.ai/docs/proxy/utils
   */
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

  /**
   * List all HTTP routes registered on the proxy.
   *
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The full route table.
   *
   * @see https://docs.litellm.ai/docs/proxy/utils
   */
  routes(options?: RequestOptions): Promise<RoutesResponse> {
    return this.request<RoutesResponse>({
      method: 'GET',
      path: '/routes',
      options,
    });
  }

}
