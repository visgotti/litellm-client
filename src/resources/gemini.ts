import type {
  GenerateContentRequest,
  GenerateContentResponse,
  GeminiCountTokensRequest,
  GeminiCountTokensResponse,
  GeminiInteractionObject,
  GeminiInteractionCreateParams,
  GeminiInteractionDeletedResponse,
} from '../types/gemini';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';

export class GeminiInteractionsResource {
  constructor(private request: RequestFn) {}

  /** POST /v1beta/interactions */
  create(
    params: GeminiInteractionCreateParams,
    options?: RequestOptions,
  ): Promise<GeminiInteractionObject> {
    return this.request<GeminiInteractionObject>({
      method: 'POST',
      path: '/v1beta/interactions',
      body: { kind: 'json', value: params },
      options,
    });
  }

  /** GET /v1beta/interactions/{id} */
  retrieve(interactionId: string, options?: RequestOptions): Promise<GeminiInteractionObject> {
    return this.request<GeminiInteractionObject>({
      method: 'GET',
      path: `/v1beta/interactions/${encodeURIComponent(interactionId)}`,
      options,
    });
  }

  /** DELETE /v1beta/interactions/{id} */
  delete(
    interactionId: string,
    options?: RequestOptions,
  ): Promise<GeminiInteractionDeletedResponse> {
    return this.request<GeminiInteractionDeletedResponse>({
      method: 'DELETE',
      path: `/v1beta/interactions/${encodeURIComponent(interactionId)}`,
      options,
    });
  }

  /** POST /v1beta/interactions/{id}/cancel */
  cancel(interactionId: string, options?: RequestOptions): Promise<GeminiInteractionObject> {
    return this.request<GeminiInteractionObject>({
      method: 'POST',
      path: `/v1beta/interactions/${encodeURIComponent(interactionId)}/cancel`,
      options,
    });
  }
}

export class GeminiResource {
  readonly interactions: GeminiInteractionsResource;

  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {
    this.interactions = new GeminiInteractionsResource(request);
  }

  /** POST /v1beta/models/{model}:generateContent */
  generateContent(
    model: string,
    params: GenerateContentRequest,
    options?: RequestOptions,
  ): Promise<GenerateContentResponse> {
    const { extra_headers, ...body } = params;
    const headers: Record<string, string> = { ...(options?.headers ?? {}) };
    if (extra_headers) Object.assign(headers, extra_headers);
    const opts: RequestOptions = { ...(options ?? {}), headers };

    return this.request<GenerateContentResponse>({
      method: 'POST',
      path: `/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      body: { kind: 'json', value: body },
      options: opts,
    });
  }

  /** POST /v1beta/models/{model}:streamGenerateContent */
  streamGenerateContent(
    model: string,
    params: GenerateContentRequest,
    options?: RequestOptions,
  ): Promise<Stream<GenerateContentResponse>> {
    const { extra_headers, ...body } = params;
    const headers: Record<string, string> = { ...(options?.headers ?? {}) };
    if (extra_headers) Object.assign(headers, extra_headers);
    const opts: RequestOptions = { ...(options ?? {}), headers };

    return this.streamRequest<GenerateContentResponse>({
      method: 'POST',
      path: `/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent`,
      body: { kind: 'json', value: body },
      options: opts,
    });
  }

  /** POST /v1beta/models/{model}:countTokens */
  countTokens(
    model: string,
    params: GeminiCountTokensRequest,
    options?: RequestOptions,
  ): Promise<GeminiCountTokensResponse> {
    return this.request<GeminiCountTokensResponse>({
      method: 'POST',
      path: `/v1beta/models/${encodeURIComponent(model)}:countTokens`,
      body: { kind: 'json', value: params },
      options,
    });
  }
}
