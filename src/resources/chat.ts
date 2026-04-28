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

export class ChatResource {
  readonly completions: ChatCompletionsResource;

  constructor(request: RequestFn, streamRequest: StreamRequestFn) {
    this.completions = new ChatCompletionsResource(request, streamRequest);
  }
}
