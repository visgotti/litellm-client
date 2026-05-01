import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionCreateParams,
  ChatCompletion,
  ChatCompletionChunk,
} from '../types/chat';
import type { RequestOptions } from '../types/request-options';
import type { RequestFn, StreamRequestFn } from '../client';
import { Stream } from '../streaming';

export class ChatCompletionsResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  create(
    params: ChatCompletionCreateParamsNonStreaming,
    options?: RequestOptions,
  ): Promise<ChatCompletion>;
  create(
    params: ChatCompletionCreateParamsStreaming,
    options?: RequestOptions,
  ): Promise<Stream<ChatCompletionChunk>>;
  create(
    params: ChatCompletionCreateParams,
    options?: RequestOptions,
  ): Promise<ChatCompletion | Stream<ChatCompletionChunk>>;
  /**
   * Create a chat completion against any LiteLLM-supported model.
   *
   * When `params.stream === true` this returns a `Stream<ChatCompletionChunk>` of
   * server-sent events; otherwise it returns a single `ChatCompletion`. The
   * `extra_headers` and `metadata` fields on `params` are lifted out: `metadata`
   * is forwarded as the `x-litellm-metadata` header so the proxy can attribute
   * spend, tags, and logging to the request.
   *
   * @param params - Chat completion request body. Set `stream: true` to receive
   *   incremental chunks; include `model`, `messages`, and any provider-specific
   *   parameters (tools, temperature, response_format, etc.).
   * @param options - Per-request override for `timeout`, `headers`, `signal`, etc.
   * @returns A `ChatCompletion` for non-streaming calls, or a `Stream<ChatCompletionChunk>`
   *   when `stream: true` is set.
   *
   * @see https://docs.litellm.ai/docs/completion
   */
  create(
    params: ChatCompletionCreateParams,
    options?: RequestOptions,
  ): Promise<ChatCompletion | Stream<ChatCompletionChunk>> {
    const { extra_headers, metadata, ...body } = params;
    const headers: Record<string, string> = { ...(options?.headers ?? {}) };
    if (extra_headers) Object.assign(headers, extra_headers);
    if (metadata !== undefined) {
      headers['x-litellm-metadata'] = JSON.stringify(metadata);
    }
    const opts: RequestOptions = { ...(options ?? {}), headers };

    if ('stream' in params && params.stream === true) {
      return this.streamRequest<ChatCompletionChunk>({
        method: 'POST',
        path: '/v1/chat/completions',
        body: { kind: 'json', value: body },
        options: opts,
      });
    }
    return this.request<ChatCompletion>({
      method: 'POST',
      path: '/v1/chat/completions',
      body: { kind: 'json', value: body },
      options: opts,
    });
  }
}

/**
 * Engines-prefixed alias for `chat.completions.create`
 * (`POST /engines/{engineId}/chat/completions`). Mirrors OpenAI's deprecated
 * engine-style routing for clients that still address models as engines.
 */
export class ChatEnginesResource {
  constructor(
    private request: RequestFn,
    private streamRequest: StreamRequestFn,
  ) {}

  create(
    engineId: string,
    params: ChatCompletionCreateParamsNonStreaming,
    options?: RequestOptions,
  ): Promise<ChatCompletion>;
  create(
    engineId: string,
    params: ChatCompletionCreateParamsStreaming,
    options?: RequestOptions,
  ): Promise<Stream<ChatCompletionChunk>>;
  create(
    engineId: string,
    params: ChatCompletionCreateParams,
    options?: RequestOptions,
  ): Promise<ChatCompletion | Stream<ChatCompletionChunk>>;
  /**
   * Create a chat completion against a specific engine
   * (`POST /engines/{engineId}/chat/completions`). The engine id is taken
   * from the path; everything else mirrors `chat.completions.create`.
   */
  create(
    engineId: string,
    params: ChatCompletionCreateParams,
    options?: RequestOptions,
  ): Promise<ChatCompletion | Stream<ChatCompletionChunk>> {
    const { extra_headers, metadata, ...body } = params;
    const headers: Record<string, string> = { ...(options?.headers ?? {}) };
    if (extra_headers) Object.assign(headers, extra_headers);
    if (metadata !== undefined) {
      headers['x-litellm-metadata'] = JSON.stringify(metadata);
    }
    const opts: RequestOptions = { ...(options ?? {}), headers };
    const path = `/engines/${encodeURIComponent(engineId)}/chat/completions`;

    if ('stream' in params && params.stream === true) {
      return this.streamRequest<ChatCompletionChunk>({
        method: 'POST',
        path,
        body: { kind: 'json', value: body },
        options: opts,
      });
    }
    return this.request<ChatCompletion>({
      method: 'POST',
      path,
      body: { kind: 'json', value: body },
      options: opts,
    });
  }
}

export class ChatResource {
  readonly completions: ChatCompletionsResource;
  readonly engines: ChatEnginesResource;

  constructor(request: RequestFn, streamRequest: StreamRequestFn) {
    this.completions = new ChatCompletionsResource(request, streamRequest);
    this.engines = new ChatEnginesResource(request, streamRequest);
  }
}
