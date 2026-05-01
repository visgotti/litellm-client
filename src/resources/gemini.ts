import type {
  GenerateContentRequest,
  GenerateContentResponse,
  GeminiCountTokensRequest,
  GeminiCountTokensResponse,
  GeminiInteractionObject,
  GeminiInteractionCreateParams,
  GeminiInteractionDeletedResponse,
  GeminiModelObject,
} from '../types/gemini';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';

/**
 * Gemini global model actions exposed at `/models/{model}` and the `/v1beta`
 * variants. Mirrors Google Generative Language's `models` surface.
 */
export class GeminiModelsResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  /**
   * Retrieve a single Gemini model record by name
   * (`GET /v1/models/{model}` — also reachable as `GET /models/{model}`).
   *
   * @param model - The Gemini model name (e.g. `gemini-1.5-pro`).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The model description.
   */
  retrieve(model: string, options?: RequestOptions): Promise<GeminiModelObject> {
    return this.request<GeminiModelObject>({
      method: 'GET',
      path: `/v1/models/${encodeURIComponent(model)}`,
      options,
    });
  }

  /**
   * Count the tokens a Gemini request would consume without invoking the model
   * (`POST /models/{model}:countTokens`).
   *
   * @param model - The Gemini model whose tokenizer should be used.
   * @param params - The request body to measure.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The token count response from Gemini.
   */
  countTokens(
    model: string,
    params: GeminiCountTokensRequest,
    options?: RequestOptions,
  ): Promise<GeminiCountTokensResponse> {
    return this.request<GeminiCountTokensResponse>({
      method: 'POST',
      path: `/models/${encodeURIComponent(model)}:countTokens`,
      body: { kind: 'json', value: params },
      options,
    });
  }

  /**
   * Generate content via the global `/models/{model}:generateContent` route.
   *
   * `extra_headers` from `params` are merged into the outgoing request headers.
   *
   * @param model - The Gemini model name.
   * @param params - The Gemini `GenerateContentRequest` body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The generated content response.
   */
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
      path: `/models/${encodeURIComponent(model)}:generateContent`,
      body: { kind: 'json', value: body },
      options: opts,
    });
  }

  /**
   * Stream content generation via the global
   * `/models/{model}:streamGenerateContent` route.
   *
   * @param model - The Gemini model name to invoke.
   * @param params - The Gemini `GenerateContentRequest` body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A {@link Stream} yielding incremental {@link GenerateContentResponse} chunks.
   */
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
      path: `/models/${encodeURIComponent(model)}:streamGenerateContent`,
      body: { kind: 'json', value: body },
      options: opts,
    });
  }

  /**
   * Stream content generation via the v1beta-prefixed route
   * (`POST /v1beta/models/{model}:streamGenerateContent`).
   *
   * @param model - The Gemini model name to invoke.
   * @param params - The Gemini `GenerateContentRequest` body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A {@link Stream} yielding incremental {@link GenerateContentResponse} chunks.
   */
  streamGenerateContentV1Beta(
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
}

export class GeminiInteractionsResource {
  constructor(private request: RequestFn) {}

  /**
   * Create a Gemini interaction record via `/v1beta/interactions`.
   *
   * @param params - Interaction creation payload.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The created interaction object.
   *
   * @see https://docs.litellm.ai/docs/interactions
   */
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

  /**
   * Retrieve a single Gemini interaction by id.
   *
   * @param interactionId - The interaction id returned from `create`.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The interaction object.
   *
   * @see https://docs.litellm.ai/docs/interactions
   */
  retrieve(interactionId: string, options?: RequestOptions): Promise<GeminiInteractionObject> {
    return this.request<GeminiInteractionObject>({
      method: 'GET',
      path: `/v1beta/interactions/${encodeURIComponent(interactionId)}`,
      options,
    });
  }

  /**
   * Delete a Gemini interaction by id.
   *
   * @param interactionId - The interaction id to remove.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A deletion confirmation payload.
   *
   * @see https://docs.litellm.ai/docs/interactions
   */
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

  /**
   * Cancel an in-flight Gemini interaction.
   *
   * @param interactionId - The interaction id to cancel.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The interaction object reflecting its cancelled state.
   *
   * @see https://docs.litellm.ai/docs/interactions
   */
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
  readonly models: GeminiModelsResource;

  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {
    this.interactions = new GeminiInteractionsResource(request);
    this.models = new GeminiModelsResource(request, streamRequest);
  }

  /**
   * Call Gemini's native `:generateContent` endpoint for a given model.
   *
   * `extra_headers` from `params` are merged into the outgoing request headers.
   *
   * @param model - The Gemini model name (e.g. `gemini-1.5-pro`).
   * @param params - The Gemini `GenerateContentRequest` body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The generated content response.
   *
   * @see https://docs.litellm.ai/docs/generateContent
   */
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

  /**
   * Stream content generation chunks from Gemini's `:streamGenerateContent` endpoint.
   *
   * @param model - The Gemini model name to invoke.
   * @param params - The Gemini `GenerateContentRequest` body.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A {@link Stream} yielding incremental {@link GenerateContentResponse} chunks.
   *
   * @see https://docs.litellm.ai/docs/generateContent
   */
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

  /**
   * Count the tokens a Gemini request would consume without invoking the model.
   *
   * @param model - The Gemini model whose tokenizer should be used.
   * @param params - The request body to measure.
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns The token count response from Gemini.
   *
   * @see https://docs.litellm.ai/docs/generateContent
   */
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
